import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'

const increment = vi.fn()
const read = vi.fn(async () => ({}))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, increment }),
}))

describe('useActivityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    increment.mockReset()
    let remoteCount = 0
    increment.mockImplementation(async (_key, _day, amount: number) => {
      remoteCount += amount
      return remoteCount
    })
    read.mockReset()
    read.mockResolvedValue({})
  })

  it('record() increments today through the atomic counter', async () => {
    const store = useActivityStore()
    const now = new Date(2026, 5, 26, 10).getTime()
    await store.record(now)
    await store.record(now)
    expect(store.map['2026-06-26']).toEqual({ count: 2 })
    expect(increment).toHaveBeenNthCalledWith(1, 'munbeop.v1.activity', '2026-06-26', 1)
    expect(increment).toHaveBeenNthCalledWith(2, 'munbeop.v1.activity', '2026-06-26', 1)
  })

  it('record() swallows a failed cloud write and still ticks the in-memory day', async () => {
    // Every drill answer fires record() fire-and-forget; a flaky-network reject
    // must never escape as an unhandled rejection (it would flood /api/errors).
    increment.mockRejectedValueOnce(new Error('network down'))
    const store = useActivityStore()
    const now = new Date(2026, 6, 6, 10).getTime()
    await expect(store.record(now)).resolves.toBe(false)
    expect(store.map['2026-07-06']).toEqual({ count: 1 })
  })

  it('does not replace a cloud count when the authenticated hydration failed', async () => {
    useAuthStore().user = { id: 'u-1' } as never
    read.mockRejectedValueOnce(new Error('network down'))
    const store = useActivityStore()

    await expect(store.hydrate()).rejects.toThrow('network down')
    await store.record(new Date(2026, 6, 7, 10).getTime())

    expect(increment).not.toHaveBeenCalled()
    expect(store.map).toEqual({})
  })

  it('hydrate() loads the map from storage', async () => {
    read.mockResolvedValueOnce({ '2026-06-20': { count: 5 } })
    const store = useActivityStore()
    await store.hydrate()
    expect(store.map['2026-06-20']).toEqual({ count: 5 })
  })

  it('batches answers that arrive while a flush is in flight', async () => {
    let releaseFirst!: () => void
    increment
      .mockImplementationOnce(
        () =>
          new Promise<number>((resolve) => {
            releaseFirst = () => resolve(1)
          }),
      )
      .mockResolvedValueOnce(3)

    const store = useActivityStore()
    const now = new Date(2026, 5, 26, 10).getTime()
    const first = store.record(now)
    const second = store.record(now)
    const third = store.record(now)
    expect(increment).toHaveBeenCalledTimes(1)

    releaseFirst()
    await expect(Promise.all([first, second, third])).resolves.toEqual([true, true, true])
    expect(increment).toHaveBeenNthCalledWith(2, 'munbeop.v1.activity', '2026-06-26', 2)
    expect(store.map['2026-06-26']).toEqual({ count: 3 })
  })

  it('keeps failed ticks pending and includes them in the next flush', async () => {
    increment.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(2)
    const store = useActivityStore()
    const now = new Date(2026, 5, 26, 10).getTime()
    await expect(store.record(now)).resolves.toBe(false)
    expect(store.map['2026-06-26']).toEqual({ count: 1 })

    await expect(store.record(now)).resolves.toBe(true)
    expect(increment).toHaveBeenNthCalledWith(2, 'munbeop.v1.activity', '2026-06-26', 2)
    expect(store.map['2026-06-26']).toEqual({ count: 2 })
  })
})
