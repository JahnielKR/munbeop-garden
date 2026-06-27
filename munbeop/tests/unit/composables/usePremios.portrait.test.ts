// munbeop/tests/unit/composables/usePremios.portrait.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePremios } from '~/composables/usePremios'
import { useSettingsStore } from '~/stores/settings'

describe('usePremios portrait — settings avatar', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('falls back to the email initial when nothing is chosen', () => {
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBeUndefined()
    expect(portrait.value.avatarTier).toBeNull()
  })

  it('renders the chosen settings avatar and its tier', () => {
    useSettingsStore().chosenAvatarId = 'fox'
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBe('/img/avatars/fox.png')
    expect(portrait.value.avatarTier).toBe('epic')
  })

  it('adds the legendary frame for a legendary avatar (no escape frame equipped)', () => {
    useSettingsStore().chosenAvatarId = 'tiger'
    const { portrait } = usePremios()
    expect(portrait.value.avatarTier).toBe('legendary')
    expect(portrait.value.frameUrl).toBe('/img/avatars/_frame-legendary.png')
  })
})
