import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme } from '~/composables/useTheme'
import { DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'
import { readPortraitCache, writePortraitCache } from '~/lib/avatars/portrait-cache'

const mockRead = vi.fn()
const mockWrite = vi.fn()
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: mockRead,
    write: mockWrite,
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}))

function signIn() {
  // The settings store only reads cloud when a user is present.
  useAuthStore().user = { id: 'u-1' } as never
}

// The full default persisted blob. Lab-mastery fields (added when lab progress
// moved off global localStorage into the synced blob) default to empty here.
function blob(overrides: Record<string, unknown> = {}) {
  return {
    theme: 'light',
    locale: 'en',
    dailyGoal: 3,
    reviewReminders: false,
    startingDeckId: null,
    excludedDeckIds: [],
    chosenAvatarId: null,
    unlockedAvatarIds: [],
    labCleared: { conjugation: [], counter: [], register: [], numberMarket: [] },
    labEarned: { conjugation: false, counter: false, register: false, numberMarket: false, particle: false },
    numberSpeedBest: {},
    ...overrides,
  }
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRead.mockReset()
    mockWrite.mockReset()
    // Clear the device portrait cache: the store seeds its avatar refs from it at
    // creation, so a value left by a prior test would leak into the next one.
    localStorage.clear()
    // Reset the module-singleton theme to the default between tests.
    useTheme().setTheme('light')
  })

  it('hydrate applies the cloud blob (cloud wins over device defaults)', async () => {
    signIn()
    mockRead.mockResolvedValue({ theme: 'dark', locale: 'es' })
    await useSettingsStore().hydrate()
    expect(useTheme().theme.value).toBe('dark')
    expect(useLocaleStore().current).toBe('es')
  })

  it('hydrate does nothing when there is no session', async () => {
    mockRead.mockResolvedValue({ theme: 'dark', locale: 'es' })
    await useSettingsStore().hydrate()
    expect(mockRead).not.toHaveBeenCalled()
    expect(useTheme().theme.value).toBe('light')
  })

  it('hydrate ignores an invalid blob and keeps device values', async () => {
    signIn()
    mockRead.mockResolvedValue({ theme: 'purple', locale: 'xx' })
    await useSettingsStore().hydrate()
    expect(useTheme().theme.value).toBe('light')
    expect(useLocaleStore().current).toBe('en')
  })

  it('hydrate swallows a read error (e.g. table not deployed) and keeps device values', async () => {
    signIn()
    mockRead.mockRejectedValue(new Error('relation "user_settings" does not exist'))
    await expect(useSettingsStore().hydrate()).resolves.toBeUndefined()
    expect(useTheme().theme.value).toBe('light')
  })

  it('setTheme applies the theme and writes the full blob to the adapter', async () => {
    await useSettingsStore().setTheme('dark')
    expect(useTheme().theme.value).toBe('dark')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', blob({ theme: 'dark' }))
  })

  it('setTheme accepts the system preference and writes it to the adapter', async () => {
    await useSettingsStore().setTheme('system')
    expect(useTheme().theme.value).toBe('system')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', blob({ theme: 'system' }))
  })

  it('setLocale applies the locale and writes the full blob to the adapter', async () => {
    await useSettingsStore().setLocale('ja')
    expect(useLocaleStore().current).toBe('ja')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', blob({ locale: 'ja' }))
  })

  it('setStartingDeck stores the deck and writes the full blob', async () => {
    const s = useSettingsStore()
    await s.setStartingDeck('topik-4')
    expect(s.startingDeckId).toBe('topik-4')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', blob({ startingDeckId: 'topik-4' }))
  })

  it('hydrate applies a stored startingDeckId', async () => {
    signIn()
    mockRead.mockResolvedValue({ startingDeckId: 'topik-3' })
    await useSettingsStore().hydrate()
    expect(useSettingsStore().startingDeckId).toBe('topik-3')
  })

  it('toggleDeck excludes then re-includes a deck and persists the blob', async () => {
    const s = useSettingsStore()
    await s.toggleDeck('topik-2')
    expect(s.excludedDeckIds).toEqual(['topik-2'])
    expect(mockWrite).toHaveBeenLastCalledWith('munbeop.v1.settings', blob({ excludedDeckIds: ['topik-2'] }))

    await s.toggleDeck('topik-2')
    expect(s.excludedDeckIds).toEqual([])
    expect(mockWrite).toHaveBeenLastCalledWith('munbeop.v1.settings', blob())
  })

  it('hydrate applies stored excludedDeckIds (filtering non-strings)', async () => {
    signIn()
    mockRead.mockResolvedValue({ excludedDeckIds: ['topik-1', 5, 'topik-5'] })
    await useSettingsStore().hydrate()
    expect(useSettingsStore().excludedDeckIds).toEqual(['topik-1', 'topik-5'])
  })

  it('setChosenAvatar stores the id and writes the full blob', async () => {
    const s = useSettingsStore()
    await s.setChosenAvatar('fox')
    expect(s.chosenAvatarId).toBe('fox')
    expect(mockWrite).toHaveBeenLastCalledWith('munbeop.v1.settings', blob({ chosenAvatarId: 'fox' }))
  })

  it('setChosenAvatar(null) resets to the initial', async () => {
    const s = useSettingsStore()
    await s.setChosenAvatar('fox')
    await s.setChosenAvatar(null)
    expect(s.chosenAvatarId).toBeNull()
    expect(mockWrite).toHaveBeenLastCalledWith('munbeop.v1.settings', blob())
  })

  it('unlockAvatars unions new ids and persists once', async () => {
    const s = useSettingsStore()
    await s.unlockAvatars(['bee', 'fox'])
    expect(s.unlockedAvatarIds).toEqual(['bee', 'fox'])
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', expect.objectContaining({
      unlockedAvatarIds: ['bee', 'fox'],
    }))
  })

  it('unlockAvatars is a no-op (no write) when nothing new is added', async () => {
    const s = useSettingsStore()
    await s.unlockAvatars(['bee'])
    mockWrite.mockClear()
    await s.unlockAvatars(['bee'])
    expect(s.unlockedAvatarIds).toEqual(['bee'])
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('hydrate applies stored chosenAvatarId and unlockedAvatarIds', async () => {
    signIn()
    mockRead.mockResolvedValue({ chosenAvatarId: 'koi', unlockedAvatarIds: ['bee', 5, 'koi'] })
    await useSettingsStore().hydrate()
    const s = useSettingsStore()
    expect(s.chosenAvatarId).toBe('koi')
    expect(s.unlockedAvatarIds).toEqual(['bee', 'koi'])
  })

  // Regression: on a shared device, signing in as a second user whose cloud
  // blob lacks a field must NOT inherit the previous user's value. hydrate()
  // resets account-scoped prefs to defaults before applying the cloud blob.
  it('hydrate resets account-scoped prefs so an absent cloud field cannot leak the previous user', async () => {
    const s = useSettingsStore()
    signIn()
    // User A populates every account-scoped pref.
    await s.toggleDeck('topik-2')
    await s.setChosenAvatar('fox')
    await s.setDailyGoal(20)
    await s.setReviewReminders(true)
    await s.setStartingDeck('topik-4')
    await s.unlockAvatars(['fox', 'koi'])
    // User B signs in; their blob carries only a theme — no account prefs.
    mockRead.mockResolvedValue({ theme: 'dark' })
    await s.hydrate()
    expect(s.excludedDeckIds).toEqual([])
    expect(s.chosenAvatarId).toBeNull()
    expect(s.dailyGoal).toBe(DEFAULT_DAILY_GOAL)
    expect(s.reviewReminders).toBe(false)
    expect(s.startingDeckId).toBeNull()
    expect(s.unlockedAvatarIds).toEqual([])
  })

  // resetToDefaults() is the sign-out clear path (mirrors useEscapeRoomProgress
  // resetting on the noop read). It clears account-scoped prefs but leaves the
  // device-level theme/locale (those persist via localStorage for FOUC).
  it('resetToDefaults clears account-scoped prefs but keeps the device theme', async () => {
    const s = useSettingsStore()
    signIn()
    await s.toggleDeck('topik-2')
    await s.setChosenAvatar('fox')
    await s.setDailyGoal(20)
    useTheme().setTheme('dark')
    s.resetToDefaults()
    expect(s.excludedDeckIds).toEqual([])
    expect(s.chosenAvatarId).toBeNull()
    expect(s.dailyGoal).toBe(DEFAULT_DAILY_GOAL)
    expect(s.unlockedAvatarIds).toEqual([])
    // theme is device-level — not reset.
    expect(useTheme().theme.value).toBe('dark')
  })

  // ─── Lab mastery (moved off global localStorage into the synced blob) ─────

  it('recordLabClear unions into the synced set and persists', async () => {
    const s = useSettingsStore()
    await s.recordLabClear('conjugation', 'hada')
    await s.recordLabClear('conjugation', 'hada') // idempotent
    await s.recordLabClear('conjugation', 'batchim')
    expect(s.labCleared.conjugation).toEqual(['hada', 'batchim'])
    expect(mockWrite).toHaveBeenLastCalledWith(
      'munbeop.v1.settings',
      blob({ labCleared: { conjugation: ['hada', 'batchim'], counter: [], register: [], numberMarket: [] } }),
    )
    // the duplicate did not trigger a third write
    expect(mockWrite).toHaveBeenCalledTimes(2)
  })

  it('recordLabClear with alsoEarn flips cleared + earned in a SINGLE write (no race)', async () => {
    // Regression: earning used to fire two separate blob upserts (recordLabClear
    // then markLabEarned); a reorder could commit {labEarned:false} last and
    // clobber the sticky flag in the cloud. One write must carry both.
    const s = useSettingsStore()
    await s.recordLabClear('counter', 'money', true)
    expect(s.labCleared.counter).toEqual(['money'])
    expect(s.labEarned.counter).toBe(true)
    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith(
      'munbeop.v1.settings',
      blob({
        labCleared: { conjugation: [], counter: ['money'], register: [], numberMarket: [] },
        labEarned: { conjugation: false, counter: true, register: false, numberMarket: false, particle: false },
      }),
    )
  })

  it('markLabEarned sets the sticky flag once (no second write)', async () => {
    const s = useSettingsStore()
    await s.markLabEarned('particle')
    expect(s.labEarned.particle).toBe(true)
    mockWrite.mockClear()
    await s.markLabEarned('particle')
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('recordSpeedBest only persists a strictly higher score', async () => {
    const s = useSettingsStore()
    await s.recordSpeedBest('mixed', 5)
    expect(s.numberSpeedBest).toEqual({ mixed: 5 })
    mockWrite.mockClear()
    await s.recordSpeedBest('mixed', 4) // lower — no-op
    await s.recordSpeedBest('mixed', 5) // equal — no-op
    expect(mockWrite).not.toHaveBeenCalled()
    await s.recordSpeedBest('mixed', 8) // higher — persists
    expect(s.numberSpeedBest).toEqual({ mixed: 8 })
    expect(mockWrite).toHaveBeenCalledTimes(1)
  })

  it('hydrate applies stored lab mastery, filtering junk', async () => {
    signIn()
    mockRead.mockResolvedValue({
      labCleared: { conjugation: ['hada', 7], counter: ['won'], bogus: ['x'] },
      labEarned: { conjugation: true, particle: 'yes', register: false },
      numberSpeedBest: { mixed: 12, time: -3, bad: 'x' },
    })
    const s = useSettingsStore()
    await s.hydrate()
    expect(s.labCleared.conjugation).toEqual(['hada']) // non-string dropped
    expect(s.labCleared.counter).toEqual(['won'])
    expect(s.labEarned.conjugation).toBe(true)
    expect(s.labEarned.particle).toBe(false) // only `true` counts
    expect(s.numberSpeedBest).toEqual({ mixed: 12 }) // negative + non-number dropped
  })

  it('hydrate resets lab mastery so a second account cannot inherit the first', async () => {
    const s = useSettingsStore()
    signIn()
    await s.recordLabClear('conjugation', 'hada')
    await s.markLabEarned('particle')
    await s.recordSpeedBest('mixed', 9)
    // Second account's blob has no lab data.
    mockRead.mockResolvedValue({ theme: 'dark' })
    await s.hydrate()
    expect(s.labCleared.conjugation).toEqual([])
    expect(s.labEarned.particle).toBe(false)
    expect(s.numberSpeedBest).toEqual({})
  })

  it('migrates legacy global lab keys into the account blob once, then removes them', async () => {
    // Simulate the pre-sync device state.
    localStorage.setItem('conjugation-lab.cleared', JSON.stringify(['hada', 'batchim']))
    localStorage.setItem('conjugation-lab.masterEarned', '1')
    localStorage.setItem('number-market.speed.best', JSON.stringify({ mixed: 7 }))
    signIn()
    mockRead.mockResolvedValue({ theme: 'dark' }) // blob has no lab data yet
    const s = useSettingsStore()
    await s.hydrate()
    // Adopted into the synced state…
    expect(s.labCleared.conjugation).toEqual(['hada', 'batchim'])
    expect(s.labEarned.conjugation).toBe(true)
    expect(s.numberSpeedBest).toEqual({ mixed: 7 })
    // …persisted…
    expect(mockWrite).toHaveBeenCalled()
    // …and the leaky global keys are gone so another account can't adopt them.
    expect(localStorage.getItem('conjugation-lab.cleared')).toBeNull()
    expect(localStorage.getItem('conjugation-lab.masterEarned')).toBeNull()
    expect(localStorage.getItem('number-market.speed.best')).toBeNull()
  })

  it('keeps the legacy keys when the migration persist fails (retryable, no data loss)', async () => {
    localStorage.setItem('conjugation-lab.cleared', JSON.stringify(['hada']))
    signIn()
    mockRead.mockResolvedValue({ theme: 'dark' }) // no lab data → migration runs
    mockWrite.mockRejectedValue(new Error('network down')) // persist fails (swallowed)
    const s = useSettingsStore()
    await expect(s.hydrate()).resolves.toBeUndefined()
    // Adopted in memory this session…
    expect(s.labCleared.conjugation).toEqual(['hada'])
    // …but the source key is NOT deleted, so the next load can retry.
    expect(localStorage.getItem('conjugation-lab.cleared')).toBe(JSON.stringify(['hada']))
  })

  it('does not run the migration when the account blob already has lab data', async () => {
    localStorage.setItem('conjugation-lab.cleared', JSON.stringify(['hada']))
    signIn()
    mockRead.mockResolvedValue({ labCleared: { conjugation: ['batchim'] } })
    const s = useSettingsStore()
    await s.hydrate()
    // The cloud value wins; the legacy key is NOT adopted (and left untouched).
    expect(s.labCleared.conjugation).toEqual(['batchim'])
    expect(localStorage.getItem('conjugation-lab.cleared')).toBe(JSON.stringify(['hada']))
  })

  it('resetToDefaults clears lab mastery (sign-out must not leak it)', () => {
    const s = useSettingsStore()
    signIn()
    s.resetToDefaults()
    expect(s.labCleared.conjugation).toEqual([])
    expect(s.labEarned.particle).toBe(false)
    expect(s.numberSpeedBest).toEqual({})
  })

  // ─── Device portrait cache (the cold-load flash fix) ──────────────────────

  // The portrait blinked to the email initial on every reload because the chosen
  // avatar lived only in the async cloud blob. Seeding the store from a synchronous
  // device cache paints it on the first frame — mirroring theme/locale FOUC.
  it('seeds the avatar refs from the device cache at store creation', () => {
    writePortraitCache({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox', 'koi'] })
    const s = useSettingsStore()
    expect(s.chosenAvatarId).toBe('fox')
    expect(s.unlockedAvatarIds).toEqual(['fox', 'koi'])
  })

  it('setChosenAvatar mirrors the choice into the device cache', async () => {
    await useSettingsStore().setChosenAvatar('fox')
    expect(readPortraitCache()).toEqual({ chosenAvatarId: 'fox', unlockedAvatarIds: [] })
  })

  it('unlockAvatars mirrors the owned set into the device cache', async () => {
    await useSettingsStore().unlockAvatars(['bee', 'koi'])
    expect(readPortraitCache()).toEqual({ chosenAvatarId: null, unlockedAvatarIds: ['bee', 'koi'] })
  })

  it('resetToDefaults clears the device cache (sign-out must not leak the avatar)', () => {
    writePortraitCache({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox'] })
    useSettingsStore().resetToDefaults()
    expect(readPortraitCache()).toBeNull()
  })

  it('hydrate refreshes the device cache from the cloud blob', async () => {
    signIn()
    mockRead.mockResolvedValue({ chosenAvatarId: 'koi', unlockedAvatarIds: ['bee', 'koi'] })
    await useSettingsStore().hydrate()
    expect(readPortraitCache()).toEqual({ chosenAvatarId: 'koi', unlockedAvatarIds: ['bee', 'koi'] })
  })

  // Regression: a slow/failed cloud read must NOT reset the optimistic avatar to
  // the initial — that is the very flash we are eliminating.
  it('hydrate keeps the optimistic cached avatar when the cloud read errors', async () => {
    writePortraitCache({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox'] })
    const s = useSettingsStore()
    expect(s.chosenAvatarId).toBe('fox')
    signIn()
    mockRead.mockRejectedValue(new Error('network blip'))
    await s.hydrate()
    expect(s.chosenAvatarId).toBe('fox')
    expect(s.unlockedAvatarIds).toEqual(['fox'])
  })
})
