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
  let settingsMutationTail: Promise<void> | null = null
  let settingsStateRevision = 0
  let accountEpoch = 0
  let cloudHydratedUserId: string | null = null

  /** All preferences share one JSON blob, so every read-modify-write mutation
   * must be one FIFO transaction. Otherwise two valid writes can arrive in the
   * opposite order and the older snapshot silently clobbers the newer fields. */
  function enqueueSettingsMutation<T>(run: () => Promise<T>, staleResult?: T): Promise<T> {
    const queuedEpoch = accountEpoch
    const queuedUserId = authStore.user?.id ?? null
    const guardedRun = () => queuedEpoch === accountEpoch
      && (authStore.user?.id ?? null) === queuedUserId
      ? run()
      : Promise.resolve(staleResult as T)
    const job = settingsMutationTail ? settingsMutationTail.then(guardedRun) : guardedRun()
    const settled = job.then(() => undefined, () => undefined)
    settingsMutationTail = settled
    void settled.then(() => {
      if (settingsMutationTail === settled) settingsMutationTail = null
    })
    return job
  }

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
  function resetToDefaults(invalidatePending = true): void {
    if (invalidatePending) {
      accountEpoch++
      cloudHydratedUserId = null
    }
    settingsStateRevision++
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

  function hydrate(): Promise<void> {
    if (!authStore.user) return Promise.resolve()
    const hydrateEpoch = accountEpoch
    const hydrateUserId = authStore.user.id
    return enqueueSettingsMutation(async () => {
    // Table or network errors intentionally propagate: the app-status gate keeps
    // interactions disabled and exposes a real retry instead of treating default
    // device values as authoritative account data.
    const storage = useStorageAdapter()
    const cloud = await storage.read<Partial<Settings> | null>(STORAGE_KEYS.settings, null)
    // A sign-out/account switch may happen while the cloud read is in flight.
    // Never apply that previous account's blob after resetToDefaults() advanced
    // the epoch.
    if (hydrateEpoch !== accountEpoch || authStore.user?.id !== hydrateUserId) return
    cloudHydratedUserId = hydrateUserId
    // The cloud blob is the source of truth: reset account-scoped prefs to their
    // defaults (so a field absent from THIS account's blob can't keep the
    // previous account's value), THEN apply the blob. Resetting AFTER the read —
    // not before the await — means the portrait never blinks to the initial
    // during a slow cloud round-trip.
    // This reset is part of the queued hydration for the same account; do not
    // invalidate user actions already queued behind the cloud read. Sign-out
    // calls resetToDefaults() with the default and does invalidate them.
    resetToDefaults(false)
    if (cloud) {
      if (isTheme(cloud.theme)) applyTheme(cloud.theme)
      if (isLocale(cloud.locale)) {
        await localeStore.set(cloud.locale)
        if (hydrateEpoch !== accountEpoch || authStore.user?.id !== hydrateUserId) return
      }
      if (typeof cloud.dailyGoal === 'number') dailyGoal.value = clampGoal(cloud.dailyGoal)
      if (typeof cloud.reviewReminders === 'boolean') reviewReminders.value = cloud.reviewReminders
      if (typeof cloud.startingDeckId === 'string') startingDeckId.value = cloud.startingDeckId
      if (Array.isArray(cloud.excludedDeckIds))
        excludedDeckIds.value = cloud.excludedDeckIds.filter((x): x is string => typeof x === 'string')
      // A recommendation can outlive a later Library exclusion in older blobs.
      // Never advertise a deck the user has explicitly disabled.
      if (startingDeckId.value && excludedDeckIds.value.includes(startingDeckId.value)) {
        startingDeckId.value = null
      }
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
        const migrated = await persistCloud()
        if (hydrateEpoch !== accountEpoch || authStore.user?.id !== hydrateUserId) return
        if (migrated) clearLegacyLabProgress()
      }
    }
    // Persist the reconciled avatar into the device cache so the NEXT cold load
    // paints it before this cloud read resolves — the core of the flash fix.
    if (cloud) cachePortrait()
    })
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
  function settingsSnapshot(): Settings {
    return {
      theme: theme.value,
      locale: localeStore.current,
      dailyGoal: dailyGoal.value,
      reviewReminders: reviewReminders.value,
      startingDeckId: startingDeckId.value,
      excludedDeckIds: [...excludedDeckIds.value],
      chosenAvatarId: chosenAvatarId.value,
      unlockedAvatarIds: [...unlockedAvatarIds.value],
      labCleared: {
        conjugation: [...labCleared.value.conjugation],
        counter: [...labCleared.value.counter],
        register: [...labCleared.value.register],
        numberMarket: [...labCleared.value.numberMarket],
      },
      labEarned: { ...labEarned.value },
      numberSpeedBest: { ...numberSpeedBest.value },
    }
  }

  async function persistCloud(): Promise<boolean> {
    const userId = authStore.user?.id
    // The adapter writes one full JSON blob. Never manufacture that blob from
    // defaults after an authenticated cloud read failed (or before it ran),
    // because doing so would erase fields that still exist remotely.
    if (userId && cloudHydratedUserId !== userId) return false
    try {
      const storage = useStorageAdapter()
      await storage.write(STORAGE_KEYS.settings, settingsSnapshot())
      return true
    } catch {
      return false
    }
  }

  function setTheme(t: Theme): Promise<void> {
    return enqueueSettingsMutation(async () => {
      applyTheme(t)
      await persistCloud()
    })
  }

  function setLocale(l: LocaleCode): Promise<void> {
    return enqueueSettingsMutation(async () => {
      await localeStore.set(l)
      await persistCloud()
    })
  }

  function setDailyGoal(n: number): Promise<void> {
    return enqueueSettingsMutation(async () => {
      dailyGoal.value = clampGoal(n)
      await persistCloud()
    })
  }

  function setStartingDeck(deckId: string): Promise<boolean> {
    return enqueueSettingsMutation(async () => {
      const previousDeck = startingDeckId.value
      const previousExcluded = excludedDeckIds.value
      const nextExcluded = excludedDeckIds.value.filter((id) => id !== deckId)
      startingDeckId.value = deckId
      // Placement's recommendation must be immediately playable even if this
      // level was previously disabled in Library focus mode.
      excludedDeckIds.value = nextExcluded
      const mutationRevision = ++settingsStateRevision
      const saved = await persistCloud()
      if (!saved && settingsStateRevision === mutationRevision) {
        startingDeckId.value = previousDeck
        excludedDeckIds.value = previousExcluded
        settingsStateRevision++
      }
      return saved
    }, false)
  }

  /** Toggle a deck's exclusion from the practice draw, then persist. */
  function toggleDeck(deckId: string): Promise<boolean> {
    return enqueueSettingsMutation(async () => {
      const previousExcluded = excludedDeckIds.value
      const previousStarting = startingDeckId.value
      const excluding = !excludedDeckIds.value.includes(deckId)
      const nextExcluded = excludedDeckIds.value.includes(deckId)
        ? excludedDeckIds.value.filter((id) => id !== deckId)
        : [...excludedDeckIds.value, deckId]
      const nextStarting = excluding && startingDeckId.value === deckId
        ? null
        : startingDeckId.value
      excludedDeckIds.value = nextExcluded
      startingDeckId.value = nextStarting
      const mutationRevision = ++settingsStateRevision
      const saved = await persistCloud()
      if (!saved && settingsStateRevision === mutationRevision) {
        excludedDeckIds.value = previousExcluded
        startingDeckId.value = previousStarting
        settingsStateRevision++
      }
      return saved
    }, false)
  }

  function setReviewReminders(on: boolean): Promise<void> {
    return enqueueSettingsMutation(async () => {
      reviewReminders.value = on
      if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {
          // Permission prompt unavailable (e.g. insecure context) — the in-app banner still works.
        }
      }
      await persistCloud()
    })
  }

  function setChosenAvatar(id: string | null): Promise<void> {
    return enqueueSettingsMutation(async () => {
      chosenAvatarId.value = id
      cachePortrait()
      await persistCloud()
    })
  }

  /** Union new ids into the sticky owned set; only persists if it grew. */
  function unlockAvatars(ids: string[]): Promise<void> {
    return enqueueSettingsMutation(async () => {
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
    })
  }

  /** Record that a drill lab cleared one class/set/domain, optionally flipping
   *  the sticky "earned" flag in the SAME write. Doing both in one upsert avoids
   *  a race where two separate blob writes reorder and clobber labEarned back to
   *  false. Unions are idempotent; the in-memory update is synchronous so the
   *  lab's mastery view reflects it before the cloud write resolves. */
  function recordLabClear(lab: ClearedLabId, item: string, alsoEarn = false): Promise<void> {
    return enqueueSettingsMutation(async () => {
      const has = labCleared.value[lab].includes(item)
      const needEarn = alsoEarn && !labEarned.value[lab]
      if (has && !needEarn) return
      const previousCleared = labCleared.value
      const previousEarned = labEarned.value
      const nextCleared = has
        ? previousCleared
        : { ...previousCleared, [lab]: [...previousCleared[lab], item] }
      const nextEarned = needEarn
        ? { ...previousEarned, [lab]: true }
        : previousEarned
      labCleared.value = nextCleared
      labEarned.value = nextEarned
      const mutationRevision = ++settingsStateRevision
      const saved = await persistCloud()
      if (!saved) {
        // Conditional rollback protects an external account reset while the
        // request was in flight. Normal settings actions cannot interleave:
        // they all run through this same queue.
        if (settingsStateRevision === mutationRevision) {
          labCleared.value = previousCleared
          labEarned.value = previousEarned
          settingsStateRevision++
        }
        throw new Error('Failed to save lab mastery')
      }
    })
  }

  /** Flip a lab's sticky "master earned" flag (never un-earns). No-op if set. */
  function markLabEarned(lab: EarnedLabId): Promise<void> {
    return enqueueSettingsMutation(async () => {
      if (labEarned.value[lab]) return
      const previous = labEarned.value
      const next = { ...previous, [lab]: true }
      labEarned.value = next
      const mutationRevision = ++settingsStateRevision
      const saved = await persistCloud()
      if (!saved) {
        if (settingsStateRevision === mutationRevision) {
          labEarned.value = previous
          settingsStateRevision++
        }
        throw new Error('Failed to save lab mastery')
      }
    })
  }

  /** Record a number-market speed best; only persists when it beats the prior. */
  function recordSpeedBest(deckId: string, score: number): Promise<void> {
    return enqueueSettingsMutation(async () => {
      if (score <= (numberSpeedBest.value[deckId] ?? 0)) return
      const previous = numberSpeedBest.value
      const next = { ...previous, [deckId]: score }
      numberSpeedBest.value = next
      const mutationRevision = ++settingsStateRevision
      const saved = await persistCloud()
      if (!saved) {
        if (settingsStateRevision === mutationRevision) {
          numberSpeedBest.value = previous
          settingsStateRevision++
        }
        throw new Error('Failed to save speed record')
      }
    })
  }

  return { hydrate, resetToDefaults, setTheme, setLocale, dailyGoal, setDailyGoal, reviewReminders, setReviewReminders, startingDeckId, setStartingDeck, excludedDeckIds, toggleDeck, chosenAvatarId, unlockedAvatarIds, setChosenAvatar, unlockAvatars, labCleared, labEarned, numberSpeedBest, recordLabClear, markLabEarned, recordSpeedBest }
})
