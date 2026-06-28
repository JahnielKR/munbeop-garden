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
    const s = useSettingsStore()
    s.chosenAvatarId = 'fox'
    s.unlockedAvatarIds = ['fox'] // owned (the only way choose() would set it)
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBe('/img/avatars/fox.png')
    expect(portrait.value.avatarTier).toBe('epic')
  })

  it('renders a common avatar even when the unlocked set is empty (always owned)', () => {
    useSettingsStore().chosenAvatarId = 'seed' // common, rule.kind === 'always'
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBe('/img/avatars/seed.png')
    expect(portrait.value.avatarTier).toBe('common')
  })

  it('does NOT render a chosen avatar the user does not own (stale-id guard)', () => {
    const s = useSettingsStore()
    s.chosenAvatarId = 'fox' // epic, but not in the unlocked set
    s.unlockedAvatarIds = []
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBeUndefined()
    expect(portrait.value.avatarTier).toBeNull()
  })

  it('adds the legendary frame for a legendary avatar (no escape frame equipped)', () => {
    const s = useSettingsStore()
    s.chosenAvatarId = 'tiger'
    s.unlockedAvatarIds = ['tiger']
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
    const s = useSettingsStore()
    s.chosenAvatarId = 'tiger' // legendary
    s.unlockedAvatarIds = ['tiger']
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
