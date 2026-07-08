import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSrsStore } from '~/stores/srs'
import { useAppStatus } from '~/stores/appStatus'
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
    await store.recalculate('A')

    expect(upsertOne).toHaveBeenCalledTimes(1)
    expect(write).not.toHaveBeenCalled()
    const [key, entry] = upsertOne.mock.calls[0] as [string, { id: string }]
    expect(key).toBe(STORAGE_KEYS.srs)
    expect(entry.id).toBe('A')
  })
})

describe('useSrsStore — no writes while the data load failed (clobber guard)', () => {
  // The authoritative "unsafe to write" signal is appStatus === 'error' (a
  // tracked hydration failed), NOT the srs store's own read: recalculate derives
  // its value from the LOG store, so a log-load failure with a successful srs
  // load must still block. This guards the clobber via every write path (the
  // main loop and all labs) with one check.
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockClear()
    write.mockClear()
    read.mockClear()
  })

  it('markSeen is a no-op (no write, no fabricated row) when appStatus is error', async () => {
    useAppStatus().status = 'error'
    const store = useSrsStore()
    await store.markSeen('A')
    expect(upsertOne).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined() // never fabricated a zeroed row
  })

  it('recalculate is a no-op when appStatus is error (covers a LOG-load failure)', async () => {
    useAppStatus().status = 'error'
    const store = useSrsStore()
    await store.recalculate('A')
    expect(upsertOne).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined()
  })

  it('writes resume once appStatus recovers to ready (after a successful retry)', async () => {
    const appStatus = useAppStatus()
    appStatus.status = 'error'
    const store = useSrsStore()
    await store.markSeen('A')
    expect(upsertOne).not.toHaveBeenCalled()

    appStatus.status = 'ready'
    await store.markSeen('A')
    expect(upsertOne).toHaveBeenCalledTimes(1)
  })

  it('writes proceed against the retained map when a page-level re-hydrate fails WITHOUT tracking (status stays ready)', async () => {
    // Regression: the ruleta ?revisit=due path calls srsStore.hydrate() directly
    // and catches its failure without touching appStatus. status stays 'ready'
    // and the map keeps its real data, so writes must NOT be blocked.
    const store = useSrsStore()
    read.mockRejectedValueOnce(new Error('network down'))
    await expect(store.hydrate()).rejects.toThrow('network down')
    // appStatus never set to error → writes proceed.
    await store.markSeen('A')
    expect(upsertOne).toHaveBeenCalledTimes(1)
  })
})
