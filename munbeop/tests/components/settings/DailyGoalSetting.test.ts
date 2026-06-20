import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DailyGoalSetting from '~/components/settings/DailyGoalSetting.vue'
import { useSettingsStore } from '~/stores/settings'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue(null), write: vi.fn().mockResolvedValue(undefined) }),
}))

describe('DailyGoalSetting', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('calls setDailyGoal when the value changes', async () => {
    const w = mount(DailyGoalSetting)
    const store = useSettingsStore()
    const spy = vi.spyOn(store, 'setDailyGoal')
    await w.get('#daily-goal').setValue('5')
    expect(spy).toHaveBeenCalledWith(5)
  })
})
