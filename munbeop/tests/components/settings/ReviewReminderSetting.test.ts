import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewReminderSetting from '~/components/settings/ReviewReminderSetting.vue'

const setReviewReminders = vi.fn()
vi.mock('~/stores/settings', () => ({
  useSettingsStore: () => ({ reviewReminders: false, setReviewReminders }),
}))

describe('ReviewReminderSetting', () => {
  it('calls setReviewReminders(true) when toggled on', async () => {
    const w = mount(ReviewReminderSetting)
    const toggle = w.get('[role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('false')
    await toggle.trigger('click')
    expect(setReviewReminders).toHaveBeenCalledWith(true)
  })
})
