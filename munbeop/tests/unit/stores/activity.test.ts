import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useActivityStore } from '~/stores/activity'

const upsertOne = vi.fn()
const read = vi.fn(async () => ({}))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, upsertOne, write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

describe('useActivityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockClear()
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

  it('hydrate() loads the map from storage', async () => {
    read.mockResolvedValueOnce({ '2026-06-20': { count: 5 } })
    const store = useActivityStore()
    await store.hydrate()
    expect(store.map['2026-06-20']).toEqual({ count: 5 })
  })
})
