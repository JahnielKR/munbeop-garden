import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLogStore } from '~/stores/log'
import { STORAGE_KEYS } from '~/lib/storage'

// Spy on the adapter so we can assert add() uses the one-row append path rather
// than re-writing the whole collection (the O(history) cost the delta fix kills).
const append = vi.fn(async () => {})
const write = vi.fn(async () => {})
const read = vi.fn(async (_key: string, fallback: unknown) => fallback)
const deleteOne = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, write, append, deleteOne, remove: async () => {}, clear: async () => {} }),
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

describe('useLogStore.add — delta append', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    write.mockClear()
    deleteOne.mockClear()
    deleteOne.mockResolvedValue(undefined)
  })

  it('appends only the new entry and does not re-write the whole collection', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)

    expect(append).toHaveBeenCalledTimes(1)
    expect(append).toHaveBeenCalledWith(STORAGE_KEYS.log, entry)
    expect(write).not.toHaveBeenCalled()
    // still unshifted into memory, newest first (reactive proxy → structural eq)
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0]).toStrictEqual(entry)
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
})

describe('useLogStore.setReviewState', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    append.mockResolvedValue(undefined)
    write.mockClear()
    write.mockResolvedValue(undefined)
  })

  it('flips the state, persists the full log, and reports success', async () => {
    const store = useLogStore()
    const e = await store.add(payload)

    const ok = await store.setReviewState(e.id, 'correct', 'note')
    expect(ok).toBe(true)
    expect(store.entries[0]).toMatchObject({ reviewState: 'correct', errorNote: 'note' })
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, store.entries)
  })

  it('returns false for an unknown id and never touches the adapter', async () => {
    const store = useLogStore()
    const ok = await store.setReviewState(999, 'correct')
    expect(ok).toBe(false)
    expect(write).not.toHaveBeenCalled()
  })

  it('rolls the flip back when the cloud write fails — the UI must not claim reviewed', async () => {
    const store = useLogStore()
    const e = await store.add(payload)
    write.mockRejectedValueOnce(new Error('net drop'))

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
    write.mockImplementationOnce(
      () => new Promise((_resolve, reject) => { rejectA = reject }),
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
})

describe('useLogStore.deleteEntry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    deleteOne.mockClear()
    deleteOne.mockResolvedValue(undefined)
  })

  it('removes the entry and deletes its cloud row by id', async () => {
    const store = useLogStore()
    const e = await store.add(payload)
    expect(store.entries).toHaveLength(1)

    const ok = await store.deleteEntry(e.id)
    expect(ok).toBe(true)
    expect(store.entries).toHaveLength(0)
    expect(deleteOne).toHaveBeenCalledWith(STORAGE_KEYS.log, e.id)
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
    write.mockClear()
    write.mockResolvedValue(undefined)
    const a = await store.add(payload)
    const b = await store.add({ ...payload, ko: 'B' })

    let rejectDelete!: (e: Error) => void
    deleteOne.mockImplementationOnce(
      () => new Promise((_resolve, reject) => { rejectDelete = reject }),
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
