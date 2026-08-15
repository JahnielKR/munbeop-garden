import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'

const upsertOne = vi.fn()
const read = vi.fn(async () => ({}))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, upsertOne, write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

describe('useActivityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockReset()
    upsertOne.mockResolvedValue(undefined)
    read.mockClear()
  })

  it('record() increments today and upserts one row', async () => {
    const store = useActivityStore()
    const now = new Date(2026, 5, 26, 10).getTime()
    await store.record(now)
    await store.record(now)
    expect(store.map['2026-06-26']).toEqual({ count: 2 })
    expect(upsertOne).toHaveBeenCalledWith('munbeop.v1.activity', {
      id: '2026-06-26',
      value: { count: 2 },
    })
  })

  it('record() swallows a failed cloud write and still ticks the in-memory day', async () => {
    // Every drill answer fires record() fire-and-forget; a flaky-network reject
    // must never escape as an unhandled rejection (it would flood /api/errors).
    upsertOne.mockRejectedValueOnce(new Error('network down'))
    const store = useActivityStore()
    const now = new Date(2026, 6, 6, 10).getTime()
    await expect(store.record(now)).resolves.toBeUndefined()
    expect(store.map['2026-07-06']).toEqual({ count: 1 })
  })

  it('serializes same-day upserts so an older count cannot land last', async () => {
    let resolveFirst!: () => void
    upsertOne
      .mockImplementationOnce(() => new Promise<void>((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce(undefined)
    const store = useActivityStore()
    const now = new Date(2026, 6, 7, 10).getTime()

    const first = store.record(now)
    const second = store.record(now)
    await vi.waitFor(() => expect(upsertOne).toHaveBeenCalledTimes(1))

    resolveFirst()
    await Promise.all([first, second])

    expect(upsertOne).toHaveBeenCalledTimes(2)
    expect(upsertOne.mock.calls[0]?.[1]).toMatchObject({ value: { count: 1 } })
    expect(upsertOne.mock.calls[1]?.[1]).toMatchObject({ value: { count: 2 } })
  })

  it('does not replace a cloud count when the authenticated hydration failed', async () => {
    useAuthStore().user = { id: 'u-1' } as never
    read.mockRejectedValueOnce(new Error('network down'))
    const store = useActivityStore()

    await expect(store.hydrate()).rejects.toThrow('network down')
    await store.record(new Date(2026, 6, 7, 10).getTime())

    expect(upsertOne).not.toHaveBeenCalled()
    expect(store.map).toEqual({})
  })

  it('hydrate() loads the map from storage', async () => {
    read.mockResolvedValueOnce({ '2026-06-20': { count: 5 } })
    const store = useActivityStore()
    await store.hydrate()
    expect(store.map['2026-06-20']).toEqual({ count: 5 })
  })
})
