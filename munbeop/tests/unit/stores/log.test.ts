import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLogStore } from '~/stores/log'
import { STORAGE_KEYS } from '~/lib/storage'

// Spy on the adapter so we can assert add() uses the one-row append path rather
// than re-writing the whole collection (the O(history) cost the delta fix kills).
const append = vi.fn(async (_key: string, entry: { id: number }) => ({ ...entry, id: 42 }))
const write = vi.fn(async () => {})
const read = vi.fn(async (_key: string, fallback: unknown) => fallback)
const deleteOne = vi.fn(async () => {})
const upsertOne = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, write, append, upsertOne, deleteOne, remove: async () => {}, clear: async () => {} }),
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
    append.mockImplementation(async (_key: string, entry: { id: number }) => ({ ...entry, id: 42 }))
    write.mockClear()
    upsertOne.mockClear()
    deleteOne.mockClear()
    deleteOne.mockResolvedValue(undefined)
  })

  it('appends only the new entry and does not re-write the whole collection', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)

    expect(append).toHaveBeenCalledTimes(1)
    expect(append).toHaveBeenCalledWith(
      STORAGE_KEYS.log,
      expect.objectContaining({ sentence: payload.sentence }),
    )
    expect(write).not.toHaveBeenCalled()
    expect(entry.id).toBe(42)
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

describe('useLogStore.deleteEntry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockClear()
    append.mockImplementation(async (_key: string, entry: { id: number }) => ({ ...entry, id: 42 }))
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
})

describe('useLogStore.setReviewState', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    append.mockImplementation(async (_key: string, entry: { id: number }) => ({ ...entry, id: 42 }))
    upsertOne.mockClear()
    upsertOne.mockResolvedValue(undefined)
  })

  it('upserts one journal row instead of rewriting the full history', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)
    const ok = await store.setReviewState(entry.id, 'correct')

    expect(ok).toBe(true)
    expect(store.entries[0]?.reviewState).toBe('correct')
    expect(upsertOne).toHaveBeenCalledWith(
      STORAGE_KEYS.log,
      expect.objectContaining({ id: entry.id }),
    )
    expect(write).not.toHaveBeenCalled()
  })

  it('rolls the optimistic review state back when the cloud update fails', async () => {
    const store = useLogStore()
    const entry = await store.add(payload)
    upsertOne.mockRejectedValueOnce(new Error('offline'))

    await expect(store.setReviewState(entry.id, 'correct')).resolves.toBe(false)
    expect(store.entries[0]?.reviewState).toBe('unreviewed')
  })
})
