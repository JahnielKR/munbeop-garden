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
import {
  CLEARED_LAB_IDS,
  EARNED_LAB_IDS,
  emptyLabCleared,
  emptyLabEarned,
  readLegacyLabProgress,
  clearLegacyLabProgress,
  type ClearedLabId,
  type EarnedLabId,
  type LabClearedMap,
  type LabEarnedMap,
  type SpeedBestMap,
} from '~/lib/practice/lab-mastery'

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
  /** Which classes/sets/domains each drill lab has cleared. Account-synced so a
   *  shared device never leaks one user's lab badges into another (was global
   *  localStorage). */
  labCleared: LabClearedMap
  /** Sticky "master badge earned" flag per lab (survives a later catalog change
   *  that would otherwise un-earn a derived badge). */
  labEarned: LabEarnedMap
  /** Per-deck best score for the number-market speed blitz. */
  numberSpeedBest: SpeedBestMap
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
  const labCleared = ref<LabClearedMap>(emptyLabCleared())
  const labEarned = ref<LabEarnedMap>(emptyLabEarned())
  const numberSpeedBest = ref<SpeedBestMap>({})

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
    labCleared.value = emptyLabCleared()
    labEarned.value = emptyLabEarned()
    numberSpeedBest.value = {}
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
    if (cloud) {
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
      applyLabMastery(cloud)
    }
    // One-time migration: lab mastery used to live in GLOBAL localStorage, which
    // leaked across accounts on a shared device. If this account's blob carries
    // no lab data yet, adopt the device's old global keys once (and delete them,
    // inside takeLegacyLabProgress, so a different account can't adopt them next)
    // then persist into this account's blob.
    const cloudHasLab =
      !!cloud &&
      (cloud.labCleared !== undefined ||
        cloud.labEarned !== undefined ||
        cloud.numberSpeedBest !== undefined)
    if (!cloudHasLab) {
      const { progress, found } = readLegacyLabProgress()
      if (found) {
        labCleared.value = progress.cleared
        labEarned.value = progress.earned
        numberSpeedBest.value = progress.speedBest
        // Delete the (leaky) global keys only AFTER the cloud write is confirmed,
        // so a swallowed persist failure leaves them in place to retry next load
        // instead of losing the adopted progress.
        if (await persistCloud()) clearLegacyLabProgress()
      }
    }
    // Persist the reconciled avatar into the device cache so the NEXT cold load
    // paints it before this cloud read resolves — the core of the flash fix.
    if (cloud) cachePortrait()
  }

  /** Apply the lab-mastery fields of a cloud blob, validating shapes so a
   *  hand-edited or partial blob can't poison the maps. */
  function applyLabMastery(cloud: Partial<Settings>): void {
    const rawCleared = cloud.labCleared as Record<string, unknown> | undefined
    if (rawCleared && typeof rawCleared === 'object') {
      const next = emptyLabCleared()
      for (const lab of CLEARED_LAB_IDS) {
        const arr = rawCleared[lab]
        if (Array.isArray(arr)) next[lab] = arr.filter((x): x is string => typeof x === 'string')
      }
      labCleared.value = next
    }
    const rawEarned = cloud.labEarned as Record<string, unknown> | undefined
    if (rawEarned && typeof rawEarned === 'object') {
      const next = emptyLabEarned()
      for (const lab of EARNED_LAB_IDS) if (rawEarned[lab] === true) next[lab] = true
      labEarned.value = next
    }
    const rawBest = cloud.numberSpeedBest as Record<string, unknown> | undefined
    if (rawBest && typeof rawBest === 'object') {
      const next: SpeedBestMap = {}
      for (const [k, v] of Object.entries(rawBest)) if (typeof v === 'number' && v >= 0) next[k] = v
      numberSpeedBest.value = next
    }
  }

  /** Write the full prefs blob. Returns true on success, false on a swallowed
   *  error (a failed cloud write must never throw into the UI). The boolean lets
   *  the one-time lab migration delete the legacy keys only once persisted. */
  async function persistCloud(): Promise<boolean> {
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
        labCleared: labCleared.value,
        labEarned: labEarned.value,
        numberSpeedBest: numberSpeedBest.value,
      } satisfies Settings)
      return true
    } catch {
      return false
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

  /** Record that a drill lab cleared one class/set/domain, optionally flipping
   *  the sticky "earned" flag in the SAME write. Doing both in one upsert avoids
   *  a race where two separate blob writes reorder and clobber labEarned back to
   *  false. Unions are idempotent; the in-memory update is synchronous so the
   *  lab's mastery view reflects it before the cloud write resolves. */
  async function recordLabClear(lab: ClearedLabId, item: string, alsoEarn = false): Promise<void> {
    const has = labCleared.value[lab].includes(item)
    const needEarn = alsoEarn && !labEarned.value[lab]
    if (has && !needEarn) return
    if (!has) labCleared.value = { ...labCleared.value, [lab]: [...labCleared.value[lab], item] }
    if (needEarn) labEarned.value = { ...labEarned.value, [lab]: true }
    await persistCloud()
  }

  /** Flip a lab's sticky "master earned" flag (never un-earns). No-op if set. */
  async function markLabEarned(lab: EarnedLabId): Promise<void> {
    if (labEarned.value[lab]) return
    labEarned.value = { ...labEarned.value, [lab]: true }
    await persistCloud()
  }

  /** Record a number-market speed best; only persists when it beats the prior. */
  async function recordSpeedBest(deckId: string, score: number): Promise<void> {
    if (score <= (numberSpeedBest.value[deckId] ?? 0)) return
    numberSpeedBest.value = { ...numberSpeedBest.value, [deckId]: score }
    await persistCloud()
  }

  return { hydrate, resetToDefaults, setTheme, setLocale, dailyGoal, setDailyGoal, reviewReminders, setReviewReminders, startingDeckId, setStartingDeck, excludedDeckIds, toggleDeck, chosenAvatarId, unlockedAvatarIds, setChosenAvatar, unlockAvatars, labCleared, labEarned, numberSpeedBest, recordLabClear, markLabEarned, recordSpeedBest }
})
