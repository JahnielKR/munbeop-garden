import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue(null), write: vi.fn().mockResolvedValue(undefined) }),
}))

describe('settings dailyGoal', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('defaults to DEFAULT_DAILY_GOAL', () => {
    expect(useSettingsStore().dailyGoal).toBe(DEFAULT_DAILY_GOAL)
  })

  it('setDailyGoal clamps out-of-range values', async () => {
    const s = useSettingsStore()
    await s.setDailyGoal(99)
    expect(s.dailyGoal).toBe(20)
    await s.setDailyGoal(0)
    expect(s.dailyGoal).toBe(1)
  })
})
