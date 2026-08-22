import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useAuthStore } from '~/stores/auth'

// Spy on the adapter so we can assert add() uses the one-row append path rather
// than re-writing the whole collection (the O(history) cost the delta fix kills).
const append = vi.fn(async () => {})
const write = vi.fn(async () => {})
const read = vi.fn(async (_key: string, fallback: unknown) => fallback)
const deleteOne = vi.fn(async () => {})
const updateOne = vi.fn(async () => undefined)
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read,
    write,
    saveJournalEntry: append,
    setJournalReview: updateOne,
    deleteJournalEntry: deleteOne,
    remove: async () => {},
    clear: async () => {},
  }),
}))

const payload = {
  ko: 'A',
  sentence: '저는 학생이에요',
  feedback: 'hard' as const,
  errorNote: null,
  reviewState: 'unreviewed' as const,
  contextId: 'banmal',
  contextName: '반말',
}

beforeEach(() => {
  read.mockReset()
  read.mockImplementation(async (_key: string, fallback: unknown) => fallback)
})

describe('useLogStore hydration safety', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    append.mockResolvedValue(undefined)
  })

  it('does not apply account A journal rows after account B signs in', async () => {
    useAuthStore().user = { id: 'a' } as never
    let resolveRead!: (value: unknown) => void
    read.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve
        }),
    )
    const store = useLogStore()
    const hydration = store.hydrate()

    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1))
    useAuthStore().user = { id: 'b' } as never
    resolveRead([{ id: 7, date: '2026-01-01', ...payload }])
    await hydration

    expect(store.entries).toEqual([])
  })

  it('queues an add behind hydration so the read cannot erase the new row', async () => {
    useAuthStore().user = { id: 'a' } as never
    let resolveRead!: (value: unknown) => void
    read.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve
        }),
    )
    const store = useLogStore()
    const hydration = store.hydrate()
    const addition = store.add(payload, 7001)

    expect(append).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1))
    resolveRead([])
    await hydration
    await addition

    expect(store.entries).toHaveLength(1)
    expect(store.entries[0]?.id).toBe(7001)
    expect(append).toHaveBeenCalledTimes(1)
  })
})

describe('useLogStore.add — delta append', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    append.mockResolvedValue(undefined)
    write.mockClear()
    updateOne.mockClear()
    updateOne.mockResolvedValue(undefined)
    deleteOne.mockClear()
    deleteOne.mockResolvedValue(undefined)
  })

  it('appends only the new entry and does not re-write the whole collection', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)

    expect(append).toHaveBeenCalledTimes(1)
    expect(append).toHaveBeenCalledWith(entry)
    expect(write).not.toHaveBeenCalled()
    // still unshifted into memory, newest first (reactive proxy → structural eq)
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0]).toStrictEqual(entry)
    expect(Number.isSafeInteger(entry.id)).toBe(true)
    expect(entry.id).toBeGreaterThan(0)
  })

  it('generates distinct safe-integer ids for a burst of entries', async () => {
    const store = useLogStore()
    const created = await Promise.all(
      Array.from({ length: 64 }, (_, i) => store.add({ ...payload, sentence: `sentence-${i}` })),
    )
    expect(new Set(created.map((entry) => entry.id)).size).toBe(created.length)
    expect(created.every((entry) => Number.isSafeInteger(entry.id) && entry.id > 0)).toBe(true)
  })

  it('reuses a caller-owned id so an ambiguous retry is idempotent', async () => {
    const store = useLogStore()
    const stableId = store.createEntryId()
    append.mockRejectedValueOnce(new Error('response lost'))

    await expect(store.add(payload, stableId)).rejects.toThrow('response lost')
    const retried = await store.add(payload, stableId)

    expect(retried.id).toBe(stableId)
    expect(store.entries.filter((entry) => entry.id === stableId)).toHaveLength(1)
    expect(append).toHaveBeenCalledTimes(2)
    expect(append.mock.calls[1]![0]).toStrictEqual(append.mock.calls[0]![0])
  })

  it('replaces optimistic state with authoritative entry and progress revisions', async () => {
    append.mockImplementationOnce(async (entry: Record<string, unknown>) => ({
      entry: { ...entry, revision: 4 },
      progress: {
        ko: 'A',
        lastSeen: Date.parse(String(entry.date)),
        easyCount: 0,
        hardCount: 1,
        mastery: 'seedling',
        revision: 7,
      },
    }))
    const store = useLogStore()
    const entry = await store.add(payload)

    expect(entry.revision).toBe(4)
    expect(useSrsStore().map.A).toMatchObject({ hardCount: 1, revision: 7 })
  })

  it('rolls back the optimistic insert and rethrows when the cloud append fails', async () => {
    const store = useLogStore()
    append.mockRejectedValueOnce(new Error('network down'))

    // The write rejection must propagate (so the caller can surface a retry)…
    await expect(store.add(payload)).rejects.toThrow('network down')
    // …and the phantom entry must not linger in memory — otherwise a retry would
    // duplicate it and inflate the journal / stats.
    expect(store.entries).toHaveLength(0)
  })

  it('a failed concurrent append rolls back only itself and preserves a successful sibling', async () => {
    const store = useLogStore()
    let rejectFirst!: (error: Error) => void
    let resolveSecond!: () => void
    append
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirst = reject
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveSecond = resolve
          }),
      )

    const first = store.add({ ...payload, ko: 'A' })
    const second = store.add({ ...payload, ko: 'B' })
    expect(store.entries.map((entry) => entry.ko)).toEqual(['B', 'A'])

    resolveSecond()
    await second
    rejectFirst(new Error('network down'))
    await expect(first).rejects.toThrow('network down')

    expect(store.entries.map((entry) => entry.ko)).toEqual(['B'])
  })

  it('does not let a failed A write remove current state after an A to B to A switch', async () => {
    const auth = useAuthStore()
    auth.setSession({ user: { id: 'a' } } as never)
    const store = useLogStore()
    await store.hydrate()

    let rejectOldWrite!: (error: Error) => void
    append.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectOldWrite = reject
        }),
    )
    const staleWrite = store.add(payload, 7007)
    await vi.waitFor(() => expect(append).toHaveBeenCalledTimes(1))

    auth.setSession({ user: { id: 'b' } } as never)
    auth.setSession({ user: { id: 'a' } } as never)
    const currentEntry = {
      ...payload,
      id: 7007,
      sentence: 'current account snapshot',
      date: '2026-08-22T00:00:00.000Z',
      revision: 4,
    }
    store.entries = [currentEntry]

    rejectOldWrite(new Error('late network failure'))
    await expect(staleWrite).rejects.toThrow('late network failure')
    expect(store.entries).toEqual([currentEntry])
  })
})

describe('useLogStore.setReviewState', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    append.mockResolvedValue(undefined)
    write.mockClear()
    write.mockResolvedValue(undefined)
    updateOne.mockClear()
    updateOne.mockResolvedValue(undefined)
  })

  it('flips the state with a one-row update and reports success', async () => {
    const store = useLogStore()
    const e = await store.add(payload)

    const ok = await store.setReviewState(e.id, 'correct', 'note')
    expect(ok).toBe(true)
    expect(store.entries[0]).toMatchObject({ reviewState: 'correct', errorNote: 'note' })
    expect(updateOne).toHaveBeenCalledWith({
      id: e.id,
      reviewState: 'correct',
      errorNote: 'note',
      expectedRevision: 0,
    })
    expect(write).not.toHaveBeenCalled()
  })

  it('returns false for an unknown id and never touches the adapter', async () => {
    const store = useLogStore()
    const ok = await store.setReviewState(999, 'correct')
    expect(ok).toBe(false)
    expect(updateOne).not.toHaveBeenCalled()
  })

  it('acknowledges an unchanged state + note without inventing a revision', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)

    await expect(store.setReviewState(entry.id, 'unreviewed', null)).resolves.toBe(true)
    expect(updateOne).not.toHaveBeenCalled()
    expect(store.entries[0]?.revision).toBe(0)
  })

  it('rolls the flip back when the cloud write fails — the UI must not claim reviewed', async () => {
    const store = useLogStore()
    const e = await store.add(payload)
    updateOne.mockRejectedValueOnce(new Error('net drop'))

    const ok = await store.setReviewState(e.id, 'correct')
    expect(ok).toBe(false)
    // restored: still pending, so the garden's pendingReviews count stays honest
    expect(store.entries[0]).toMatchObject({ reviewState: 'unreviewed', errorNote: null })
  })

  it('a failed flip rolls back only its own row — a concurrent flip that saved survives', async () => {
    // The mistake feed lets the user fire two flips back to back. A's write is
    // held in flight; B's write lands; then A's write fails. Rolling back a
    // whole-array snapshot would also revert B — only A may be restored.
    const store = useLogStore()
    const a = await store.add(payload)
    const b = await store.add({ ...payload, ko: 'B' })

    let rejectA!: (e: Error) => void
    updateOne.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectA = reject
        }),
    )
    const flipA = store.setReviewState(a.id, 'correct')
    const okB = await store.setReviewState(b.id, 'correct')
    expect(okB).toBe(true)

    rejectA(new Error('net drop'))
    await expect(flipA).resolves.toBe(false)

    const rowA = store.entries.find((e) => e.id === a.id)!
    const rowB = store.entries.find((e) => e.id === b.id)!
    expect(rowA.reviewState).toBe('unreviewed') // rolled back
    expect(rowB.reviewState).toBe('correct') // untouched by A's rollback
  })

  it('serializes two flips of the same row so an older response cannot win', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)
    let resolveFirst!: () => void
    updateOne.mockImplementationOnce(
      () =>
        new Promise<undefined>((resolve) => {
          resolveFirst = () => resolve(undefined)
        }),
    )

    const first = store.setReviewState(entry.id, 'correct', 'first')
    const second = store.setReviewState(entry.id, 'incorrect', 'latest')
    expect(updateOne).toHaveBeenCalledTimes(1)

    resolveFirst()
    await first
    await second

    expect(updateOne).toHaveBeenCalledTimes(2)
    expect(store.entries[0]).toMatchObject({ reviewState: 'incorrect', errorNote: 'latest' })
    expect(updateOne.mock.calls[1]![0]).toMatchObject({
      id: entry.id,
      reviewState: 'incorrect',
      errorNote: 'latest',
      expectedRevision: 1,
    })
  })

  it('rolls back when another tab deleted the cloud row', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)
    updateOne.mockRejectedValueOnce(new Error('row missing'))

    await expect(store.setReviewState(entry.id, 'correct')).resolves.toBe(false)
    expect(store.entries.find((candidate) => candidate.id === entry.id)).toMatchObject({
      reviewState: 'unreviewed',
      revision: 0,
    })
  })
})

describe('useLogStore.deleteEntry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    deleteOne.mockClear()
    deleteOne.mockResolvedValue(undefined)
    updateOne.mockClear()
    updateOne.mockResolvedValue(undefined)
  })

  it('removes the entry and deletes its cloud row by id', async () => {
    const store = useLogStore()
    const e = await store.add(payload)
    expect(store.entries).toHaveLength(1)

    const ok = await store.deleteEntry(e.id)
    expect(ok).toBe(true)
    expect(store.entries).toHaveLength(0)
    expect(deleteOne).toHaveBeenCalledWith({ id: e.id, expectedKo: 'A', expectedRevision: 0 })
  })

  it('returns false for an unknown id and never touches the adapter', async () => {
    const store = useLogStore()
    const ok = await store.deleteEntry(999)
    expect(ok).toBe(false)
    expect(deleteOne).not.toHaveBeenCalled()
  })

  it('rolls the removal back when the cloud delete fails', async () => {
    const store = useLogStore()
    const e = await store.add(payload)
    deleteOne.mockRejectedValueOnce(new Error('net drop'))

    const ok = await store.deleteEntry(e.id)
    expect(ok).toBe(false)
    expect(store.entries).toHaveLength(1) // restored
  })

  it('a failed delete re-inserts only its own row — a concurrent flip that saved survives', async () => {
    // Delete on A stalls; meanwhile the user marks B reviewed from the mistake
    // feed and that write succeeds. A whole-array snapshot restore would
    // revert B's confirmed flip (the immutable row replace broke the in-place
    // aliasing that used to mask this) — only A may be re-inserted.
    const store = useLogStore()
    updateOne.mockClear()
    updateOne.mockResolvedValue(undefined)
    const a = await store.add(payload)
    const b = await store.add({ ...payload, ko: 'B' })

    let rejectDelete!: (e: Error) => void
    deleteOne.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectDelete = reject
        }),
    )
    const del = store.deleteEntry(a.id)
    const okFlip = await store.setReviewState(b.id, 'correct')
    expect(okFlip).toBe(true)

    rejectDelete(new Error('net drop'))
    await expect(del).resolves.toBe(false)

    expect(store.entries.find((e) => e.id === a.id)).toBeTruthy() // restored
    expect(store.entries.find((e) => e.id === b.id)!.reviewState).toBe('correct') // survives
  })
})
