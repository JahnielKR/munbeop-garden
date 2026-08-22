import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSrsStore } from '~/stores/srs'
import { useAppStatus } from '~/stores/appStatus'
import { useAuthStore } from '~/stores/auth'

const progress = (ko: string, lastSeen: number | null = null) => ({
  ko,
  lastSeen,
  easyCount: 0,
  hardCount: 0,
  mastery: 'seedling' as const,
  revision: 0,
})
const markProgressSeen = vi.fn(async (ko: string, now: number) => progress(ko, now))
const recalculateProgress = vi.fn(async (ko: string) => progress(ko))
const write = vi.fn(async () => {})
const read = vi.fn(async (_key: string, fallback: unknown) => fallback)
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read,
    write,
    markProgressSeen,
    recalculateProgress,
    append: async () => {},
    remove: async () => {},
    clear: async () => {},
  }),
}))
describe('useSrsStore — authoritative progress RPCs', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    markProgressSeen.mockClear()
    markProgressSeen.mockImplementation(async (ko, now) => progress(ko, now))
    recalculateProgress.mockClear()
    recalculateProgress.mockImplementation(async (ko) => progress(ko))
    write.mockClear()
    read.mockClear()
  })

  it('markSeen asks the server to advance only the touched ko', async () => {
    const store = useSrsStore()
    await store.markSeen('A', 1717200000000)

    expect(markProgressSeen).toHaveBeenCalledWith('A', 1717200000000)
    expect(write).not.toHaveBeenCalled()
    expect(store.map.A?.lastSeen).toBe(1717200000000)
  })

  it('recalculate applies the server-derived row', async () => {
    const store = useSrsStore()
    await store.recalculate('A')

    expect(recalculateProgress).toHaveBeenCalledWith('A')
    expect(write).not.toHaveBeenCalled()
    expect(store.map.A).toMatchObject({ revision: 0, mastery: 'seedling' })
  })

  it('serializes markSeen before a later recalculation for the same grammar', async () => {
    let resolveMarkSeen!: () => void
    markProgressSeen.mockImplementationOnce(
      (ko, now) =>
        new Promise((resolve) => {
          resolveMarkSeen = () => resolve(progress(ko, now))
        }),
    )
    const store = useSrsStore()

    const marking = store.markSeen('A', 1717200000000)
    const recalculating = store.recalculate('A')
    await vi.waitFor(() => expect(markProgressSeen).toHaveBeenCalledTimes(1))
    expect(recalculateProgress).not.toHaveBeenCalled()

    resolveMarkSeen()
    await marking
    await recalculating

    expect(recalculateProgress).toHaveBeenCalledTimes(1)
  })

  it('queues a write started while hydration is replacing the map', async () => {
    let resolveRead!: (value: unknown) => void
    read.mockImplementationOnce(() => new Promise((resolve) => (resolveRead = resolve)))
    const store = useSrsStore()
    const hydration = store.hydrate()
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1))

    const marking = store.markSeen('A', 1717200000000)
    expect(markProgressSeen).not.toHaveBeenCalled()
    resolveRead({})
    await hydration
    await marking

    expect(markProgressSeen).toHaveBeenCalledTimes(1)
  })

  it('ignores an old A response after an A to B to A account epoch change', async () => {
    const auth = useAuthStore()
    auth.setSession({ user: { id: 'a' } } as never)
    const appStatus = useAppStatus()
    appStatus.status = 'ready'
    const store = useSrsStore()
    await store.hydrate()

    let resolveOldWrite!: () => void
    markProgressSeen.mockImplementationOnce(
      (ko, now) =>
        new Promise((resolve) => {
          resolveOldWrite = () => resolve({ ...progress(ko, now), easyCount: 1, revision: 1 })
        }),
    )
    const staleWrite = store.markSeen('A', 1717200000000)
    await vi.waitFor(() => expect(markProgressSeen).toHaveBeenCalledTimes(1))

    auth.setSession({ user: { id: 'b' } } as never)
    auth.setSession({ user: { id: 'a' } } as never)
    store.map = {
      A: {
        lastSeen: 1717300000000,
        easyCount: 9,
        hardCount: 2,
        mastery: 'tree',
        revision: 8,
      },
    }
    resolveOldWrite()
    await staleWrite

    expect(store.map.A).toMatchObject({ easyCount: 9, mastery: 'tree', revision: 8 })
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
    markProgressSeen.mockClear()
    markProgressSeen.mockImplementation(async (ko, now) => progress(ko, now))
    recalculateProgress.mockClear()
    recalculateProgress.mockImplementation(async (ko) => progress(ko))
    write.mockClear()
    read.mockClear()
  })

  it('markSeen is a no-op (no write, no fabricated row) when appStatus is error', async () => {
    useAppStatus().status = 'error'
    const store = useSrsStore()
    await store.markSeen('A')
    expect(markProgressSeen).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined() // never fabricated a zeroed row
  })

  it('does not write authenticated SRS state before that account hydrates', async () => {
    useAuthStore().user = { id: 'u-1' } as never
    const store = useSrsStore()
    await store.markSeen('A')
    await store.recalculate('A')
    expect(markProgressSeen).not.toHaveBeenCalled()
    expect(recalculateProgress).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined()
  })

  it('recalculate is a no-op when appStatus is error (covers a LOG-load failure)', async () => {
    useAppStatus().status = 'error'
    const store = useSrsStore()
    await store.recalculate('A')
    expect(recalculateProgress).not.toHaveBeenCalled()
    expect(store.map['A']).toBeUndefined()
  })

  it('writes resume once appStatus recovers to ready (after a successful retry)', async () => {
    const appStatus = useAppStatus()
    appStatus.status = 'error'
    const store = useSrsStore()
    await store.markSeen('A')
    expect(markProgressSeen).not.toHaveBeenCalled()

    appStatus.status = 'ready'
    await store.markSeen('A')
    expect(markProgressSeen).toHaveBeenCalledTimes(1)
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
    expect(markProgressSeen).toHaveBeenCalledTimes(1)
  })
})
