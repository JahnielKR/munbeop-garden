import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useActivityStore } from '~/stores/activity'

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
    read.mockClear()
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
