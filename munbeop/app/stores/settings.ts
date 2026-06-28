import { defineStore } from 'pinia'
import { LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme, type Theme } from '~/composables/useTheme'
import { clampGoal, DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'
import {
  clearPortraitCache,
  readPortraitCache,
  writePortraitCache,
} from '~/lib/avatars/portrait-cache'

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
  /** Deck ids the user has excluded from the practice draw ("focus mode").
   * Library still shows them; only the weighted draw skips them. */
  excludedDeckIds: string[]
  /** Chosen profile avatar id (null = use the email initial). */
  chosenAvatarId: string | null
  /** Sticky set of unlocked (owned) non-common avatar ids. */
  unlockedAvatarIds: string[]
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
  const excludedDeckIds = ref<string[]>([])
  // Seed the avatar from the device cache so the sidebar portrait paints the
  // user's chosen icon on the FIRST frame of a cold load — before hydrate()'s
  // async Supabase read resolves. Otherwise it blinks to the email initial for
  // the whole round-trip. The cloud blob reconciles these in hydrate(); this is
  // purely the FOUC head start (mirrors useTheme/useLocaleStore for theme/locale).
  const cachedPortrait = readPortraitCache()
  const chosenAvatarId = ref<string | null>(cachedPortrait?.chosenAvatarId ?? null)
  const unlockedAvatarIds = ref<string[]>(cachedPortrait?.unlockedAvatarIds ?? [])

  /** Mirror the live avatar selection into the device cache (FOUC head start). */
  function cachePortrait(): void {
    writePortraitCache({
      chosenAvatarId: chosenAvatarId.value,
      unlockedAvatarIds: unlockedAvatarIds.value,
    })
  }

  /**
   * Reset the account-scoped prefs to their defaults. Called on sign-out and by
   * hydrate() (once the cloud blob is in hand) so a second account on a shared
   * device never inherits the previous user's deck-focus / avatar / goal when
   * their cloud blob omits a field. Theme and locale are deliberately NOT reset
   * here: those are
   * device-level (persisted in localStorage for FOUC by useTheme/useLocaleStore),
   * so clearing them on sign-out would flip the visible theme/language.
   */
  function resetToDefaults(): void {
    dailyGoal.value = DEFAULT_DAILY_GOAL
    reviewReminders.value = false
    startingDeckId.value = null
    excludedDeckIds.value = []
    chosenAvatarId.value = null
    unlockedAvatarIds.value = []
    // Drop the device portrait cache too: on sign-out the next account on this
    // device must not inherit (or briefly flash) the previous user's avatar.
    // hydrate() re-writes it right after applying the cloud blob.
    clearPortraitCache()
  }

  async function hydrate(): Promise<void> {
    if (!authStore.user) return
    let cloud: Partial<Settings> | null
    try {
      const storage = useStorageAdapter()
      cloud = await storage.read<Partial<Settings> | null>(STORAGE_KEYS.settings, null)
    } catch {
      // Table may not exist yet (migration not deployed) or a network blip —
      // keep device values (incl. the optimistic portrait cache); the app must
      // not break, and the portrait must not blink back to the email initial.
      return
    }
    // The cloud blob is the source of truth: reset account-scoped prefs to their
    // defaults (so a field absent from THIS account's blob can't keep the
    // previous account's value), THEN apply the blob. Resetting AFTER the read —
    // not before the await — means the portrait never blinks to the initial
    // during a slow cloud round-trip.
    resetToDefaults()
    if (!cloud) return
    if (isTheme(cloud.theme)) applyTheme(cloud.theme)
    if (isLocale(cloud.locale)) await localeStore.set(cloud.locale)
    if (typeof cloud.dailyGoal === 'number') dailyGoal.value = clampGoal(cloud.dailyGoal)
    if (typeof cloud.reviewReminders === 'boolean') reviewReminders.value = cloud.reviewReminders
    if (typeof cloud.startingDeckId === 'string') startingDeckId.value = cloud.startingDeckId
    if (Array.isArray(cloud.excludedDeckIds))
      excludedDeckIds.value = cloud.excludedDeckIds.filter((x): x is string => typeof x === 'string')
    if (typeof cloud.chosenAvatarId === 'string') chosenAvatarId.value = cloud.chosenAvatarId
    if (Array.isArray(cloud.unlockedAvatarIds))
      unlockedAvatarIds.value = cloud.unlockedAvatarIds.filter((x): x is string => typeof x === 'string')
    // Persist the reconciled avatar into the device cache so the NEXT cold load
    // paints it before this cloud read resolves — the core of the flash fix.
    cachePortrait()
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
        excludedDeckIds: excludedDeckIds.value,
        chosenAvatarId: chosenAvatarId.value,
        unlockedAvatarIds: unlockedAvatarIds.value,
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

  /** Toggle a deck's exclusion from the practice draw, then persist. */
  async function toggleDeck(deckId: string): Promise<void> {
    excludedDeckIds.value = excludedDeckIds.value.includes(deckId)
      ? excludedDeckIds.value.filter((id) => id !== deckId)
      : [...excludedDeckIds.value, deckId]
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

  async function setChosenAvatar(id: string | null): Promise<void> {
    chosenAvatarId.value = id
    cachePortrait()
    await persistCloud()
  }

  /** Union new ids into the sticky owned set; only persists if it grew. */
  async function unlockAvatars(ids: string[]): Promise<void> {
    const next = new Set(unlockedAvatarIds.value)
    let grew = false
    for (const id of ids) {
      if (!next.has(id)) {
        next.add(id)
        grew = true
      }
    }
    if (!grew) return
    unlockedAvatarIds.value = [...next]
    cachePortrait()
    await persistCloud()
  }

  return { hydrate, resetToDefaults, setTheme, setLocale, dailyGoal, setDailyGoal, reviewReminders, setReviewReminders, startingDeckId, setStartingDeck, excludedDeckIds, toggleDeck, chosenAvatarId, unlockedAvatarIds, setChosenAvatar, unlockAvatars }
})
