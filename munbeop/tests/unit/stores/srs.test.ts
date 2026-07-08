import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSrsStore } from '~/stores/srs'
import { STORAGE_KEYS } from '~/lib/storage'

// Spy on the adapter: a per-card SRS update should be a single-row upsertOne,
// not a full-map write (the O(catalog) cost the delta fix kills).
const upsertOne = vi.fn(async () => {})
const write = vi.fn(async () => {})
const read = vi.fn(async (_key: string, fallback: unknown) => fallback)
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read,
    write,
    upsertOne,
    append: async () => {},
    remove: async () => {},
    clear: async () => {},
  }),
}))
// recalculate reads useLogStore().entries
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ entries: [] }) }))

describe('useSrsStore — delta upsert', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockClear()
    write.mockClear()
    read.mockClear()
  })

  it('markSeen upserts only the touched ko, not the whole map', async () => {
    const store = useSrsStore()
    await store.hydrate()
    await store.markSeen('A', 1717200000000)

    expect(upsertOne).toHaveBeenCalledTimes(1)
    expect(write).not.toHaveBeenCalled()
    const [key, entry] = upsertOne.mock.calls[0] as [string, { id: string; value: { lastSeen: number | null } }]
    expect(key).toBe(STORAGE_KEYS.srs)
    expect(entry.id).toBe('A')
    expect(entry.value.lastSeen).toBe(1717200000000)
  })

  it('recalculate upserts only the recomputed ko', async () => {
    const store = useSrsStore()
    await store.hydrate()
    await store.recalculate('A')

    expect(upsertOne).toHaveBeenCalledTimes(1)
    expect(write).not.toHaveBeenCalled()
    const [key, entry] = upsertOne.mock.calls[0] as [string, { id: string }]
    expect(key).toBe(STORAGE_KEYS.srs)
    expect(entry.id).toBe('A')
  })
})

describe('useSrsStore — no writes before a successful hydration (clobber guard)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockClear()
    write.mockClear()
    read.mockClear()
    read.mockImplementation(async (_key: string, fallback: unknown) => fallback)
  })

  it('markSeen is a no-op (no write, no in-memory row) before hydrate', async () => {
    const store = useSrsStore()
    await store.markSeen('A')
    expect(upsertOne).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined() // never fabricated a zeroed row
  })

  it('recalculate is a no-op before hydrate', async () => {
    const store = useSrsStore()
    await store.recalculate('A')
    expect(upsertOne).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined()
  })

  it('a FAILED hydration leaves writes blocked (real cloud SRS not clobbered)', async () => {
    const store = useSrsStore()
    read.mockRejectedValueOnce(new Error('network down'))
    await expect(store.hydrate()).rejects.toThrow('network down')
    expect(store.hydrated).toBe(false)

    await store.markSeen('A')
    await store.recalculate('A')
    expect(upsertOne).not.toHaveBeenCalled()
  })

  it('writes resume after a successful (re)hydration', async () => {
    const store = useSrsStore()
    read.mockRejectedValueOnce(new Error('network down'))
    await store.hydrate().catch(() => {})
    expect(store.hydrated).toBe(false)

    await store.hydrate() // retry succeeds (read returns fallback {})
    expect(store.hydrated).toBe(true)
    await store.markSeen('A')
    expect(upsertOne).toHaveBeenCalledTimes(1)
  })
})
