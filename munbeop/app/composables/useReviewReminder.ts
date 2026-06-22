import { ref } from 'vue'
import { shouldNudge } from '~/lib/reminders/nudge'
import { useReadyCount } from '~/composables/useReadyCount'
import { useSettingsStore } from '~/stores/settings'

const LAST_VISIT_KEY = 'reminder.lastVisitAt'
const LAST_NUDGE_KEY = 'reminder.lastNudgeAt'

function readTs(key: string): number | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(key)
  const n = raw === null ? NaN : Number(raw)
  return Number.isFinite(n) ? n : null
}
function writeTs(key: string, v: number): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, String(v))
}

/**
 * Opt-in return-visit reminder. Call check() once after the stores hydrate.
 * It decides via the pure shouldNudge(), shows the banner (+ optional browser
 * Notification when granted), records the nudge, and always stamps this visit
 * so the next absence is measured from now.
 */
export function useReviewReminder() {
  const settings = useSettingsStore()
  const { readyCount } = useReadyCount()
  const { t } = useI18n()

  const show = ref(false)
  const count = ref(0)

  function check(now: number = Date.now()): void {
    const lastVisitAt = readTs(LAST_VISIT_KEY)
    const lastNudgeAt = readTs(LAST_NUDGE_KEY)
    const ready = readyCount.value

    if (shouldNudge({ enabled: settings.reviewReminders, readyCount: ready, lastVisitAt, lastNudgeAt, now })) {
      show.value = true
      count.value = ready
      writeTs(LAST_NUDGE_KEY, now)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(t('reminder.notif_title'), {
            body: t('reminder.notif_body', { n: ready }),
            tag: 'mungarden-review',
          })
        } catch {
          // Notification construction can throw in some embeddings — the banner still shows.
        }
      }
    }
    writeTs(LAST_VISIT_KEY, now) // stamp this visit last, so absence is measured from the previous one
  }

  function dismiss(): void {
    show.value = false
  }

  return { show, count, dismiss, check }
}
