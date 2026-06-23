import { defineStore } from 'pinia'
import { LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme, type Theme } from '~/composables/useTheme'
import { clampGoal, DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'

/**
 * useSettings — account-synced UI preferences (theme, locale).
 *
 * Owns only the CLOUD half + orchestration. The device half (DOM write,
 * localStorage, FOUC) stays in useTheme()/useLocaleStore(): a change writes
 * localStorage via those setters AND the cloud blob via the adapter
 * (dual-write); on hydrate the cloud blob wins. Reads/writes are wrapped in
 * try/catch so a not-yet-deployed table or a network blip never breaks the
 * app — device values simply stand.
 */
interface Settings {
  theme: Theme
  locale: LocaleCode
  dailyGoal: number
  reviewReminders: boolean
  startingDeckId: string | null
}

function isTheme(v: unknown): v is Theme {
  return v === 'light' || v === 'dark' || v === 'system'
}
function isLocale(v: unknown): v is LocaleCode {
  return typeof v === 'string' && (LOCALE_CODES as readonly string[]).includes(v)
}

export const useSettingsStore = defineStore('settings', () => {
  const { theme, setTheme: applyTheme } = useTheme()
  const localeStore = useLocaleStore()
  const authStore = useAuthStore()
  const dailyGoal = ref(DEFAULT_DAILY_GOAL)
  const reviewReminders = ref(false)
  const startingDeckId = ref<string | null>(null)

  async function hydrate(): Promise<void> {
    if (!authStore.user) return
    try {
      const storage = useStorageAdapter()
      const cloud = await storage.read<Partial<Settings> | null>(STORAGE_KEYS.settings, null)
      if (!cloud) return
      if (isTheme(cloud.theme)) applyTheme(cloud.theme)
      if (isLocale(cloud.locale)) await localeStore.set(cloud.locale)
      if (typeof cloud.dailyGoal === 'number') dailyGoal.value = clampGoal(cloud.dailyGoal)
      if (typeof cloud.reviewReminders === 'boolean') reviewReminders.value = cloud.reviewReminders
      if (typeof cloud.startingDeckId === 'string') startingDeckId.value = cloud.startingDeckId
    } catch {
      // Table may not exist yet (migration not deployed) or a network blip —
      // keep device values; the app must not break.
    }
  }

  async function persistCloud(): Promise<void> {
    try {
      const storage = useStorageAdapter()
      await storage.write(STORAGE_KEYS.settings, {
        theme: theme.value,
        locale: localeStore.current,
        dailyGoal: dailyGoal.value,
        reviewReminders: reviewReminders.value,
        startingDeckId: startingDeckId.value,
      } satisfies Settings)
    } catch {
      // A failed cloud write must not throw into the UI.
    }
  }

  async function setTheme(t: Theme): Promise<void> {
    applyTheme(t)
    await persistCloud()
  }

  async function setLocale(l: LocaleCode): Promise<void> {
    await localeStore.set(l)
    await persistCloud()
  }

  async function setDailyGoal(n: number): Promise<void> {
    dailyGoal.value = clampGoal(n)
    await persistCloud()
  }

  async function setStartingDeck(deckId: string): Promise<void> {
    startingDeckId.value = deckId
    await persistCloud()
  }

  async function setReviewReminders(on: boolean): Promise<void> {
    reviewReminders.value = on
    if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        // Permission prompt unavailable (e.g. insecure context) — the in-app banner still works.
      }
    }
    await persistCloud()
  }

  return { hydrate, setTheme, setLocale, dailyGoal, setDailyGoal, reviewReminders, setReviewReminders, startingDeckId, setStartingDeck }
})
