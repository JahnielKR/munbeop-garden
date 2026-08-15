import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { useReviewReminder } from '~/composables/useReviewReminder'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'
import { ABSENCE_MS } from '~/lib/reminders/nudge'

const readyCount = ref(2)
vi.mock('~/composables/useReadyCount', () => ({ useReadyCount: () => ({ readyCount }) }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))

describe('useReviewReminder account scope', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    readyCount.value = 2
  })

  it('resets the banner and keeps visit timestamps separate across accounts', () => {
    const auth = useAuthStore()
    const settings = useSettingsStore()
    settings.reviewReminders = true
    auth.user = { id: 'account-a' } as never
    const reminder = useReviewReminder()
    const now = 2_000_000_000_000
    localStorage.setItem('reminder.lastVisitAt.account-a', String(now - ABSENCE_MS - 1))

    reminder.check(now)
    expect(reminder.show.value).toBe(true)
    expect(reminder.count.value).toBe(2)

    auth.user = { id: 'account-b' } as never
    reminder.check(now + 1)
    expect(reminder.show.value).toBe(false)
    expect(reminder.count.value).toBe(0)
    expect(localStorage.getItem('reminder.lastVisitAt.account-b')).toBe(String(now + 1))
    expect(localStorage.getItem('reminder.lastNudgeAt.account-b')).toBeNull()
  })
})
