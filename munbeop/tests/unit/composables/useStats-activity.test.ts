import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStats } from '~/composables/useStats'
import { useActivityStore } from '~/stores/activity'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => ({})), upsertOne: vi.fn(), write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

describe('useStats activity + streaks', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('exposes merged daily counts and a longest streak', () => {
    const now = new Date(2026, 5, 26, 10).getTime()
    useActivityStore().map = { '2026-06-26': { count: 3 }, '2026-06-25': { count: 1 }, '2026-06-24': { count: 2 } }
    const s = useStats(now)
    expect(s.activityCounts.value['2026-06-26']).toBe(3)
    expect(s.streak.value).toBe(3) // 24-25-26 ending today
    expect(s.longestStreak.value).toBe(3)
  })
})
