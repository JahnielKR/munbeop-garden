// munbeop/tests/unit/composables/usePremios.portrait.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePremios } from '~/composables/usePremios'
import { useSettingsStore } from '~/stores/settings'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { LEGENDARY_FRAME_URL } from '~/lib/avatars/catalog'

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

  it('an equipped escape-room frame overrides the legendary frame', () => {
    // 'cosmetic-frame-apron' is a real level-01 reward id; the equip only
    // resolves a url when it is ALSO in unlockedCosmetics.
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['cosmetic-frame-apron']
    store.equipped.frame = 'cosmetic-frame-apron'
    useSettingsStore().chosenAvatarId = 'tiger' // legendary
    const { portrait } = usePremios()
    expect(portrait.value.avatarTier).toBe('legendary')
    expect(portrait.value.frameUrl).not.toBe(LEGENDARY_FRAME_URL)
    expect(portrait.value.frameUrl).toBeTruthy() // it's the escape frame url
  })

  it('ignores a chosenAvatarId that is not in the catalog', () => {
    useSettingsStore().chosenAvatarId = 'does-not-exist'
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBeUndefined()
    expect(portrait.value.avatarTier).toBeNull()
  })
})
