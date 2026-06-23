import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme } from '~/composables/useTheme'

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

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRead.mockReset()
    mockWrite.mockReset()
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
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'dark', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
  })

  it('setTheme accepts the system preference and writes it to the adapter', async () => {
    await useSettingsStore().setTheme('system')
    expect(useTheme().theme.value).toBe('system')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'system', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
  })

  it('setLocale applies the locale and writes the full blob to the adapter', async () => {
    await useSettingsStore().setLocale('ja')
    expect(useLocaleStore().current).toBe('ja')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'light', locale: 'ja', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
  })

  it('setStartingDeck stores the deck and writes the full blob', async () => {
    const s = useSettingsStore()
    await s.setStartingDeck('topik-4')
    expect(s.startingDeckId).toBe('topik-4')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'light', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: 'topik-4' })
  })

  it('hydrate applies a stored startingDeckId', async () => {
    signIn()
    mockRead.mockResolvedValue({ startingDeckId: 'topik-3' })
    await useSettingsStore().hydrate()
    expect(useSettingsStore().startingDeckId).toBe('topik-3')
  })
})
