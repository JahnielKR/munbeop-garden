import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePremios } from '~/composables/usePremios'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useSettingsStore } from '~/stores/settings'
import { avatarBg, EPIC_FRAME_URL, LEGENDARY_FRAME_URL, RARE_FRAME_URL } from '~/lib/avatars/catalog'

const L1 = '/escape-room/level-01/cosmetics'

describe('usePremios — portrait reflects equipped choices', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders framed initials (nothing) when nothing is equipped', () => {
    const { portrait } = usePremios()
    expect(portrait.value).toEqual({
      setUrl: undefined,
      avatarUrl: undefined,
      frameUrl: undefined,
      bgUrl: undefined,
      avatarTier: null,
    })
  })

  it('shows an equipped layer only once it is unlocked', () => {
    const store = useEscapeRoomStore()
    const { portrait } = usePremios()
    // equipped but NOT unlocked → ignored (no stale render)
    store.equipped = { frame: 'cosmetic-frame-apron' }
    expect(portrait.value.frameUrl).toBeUndefined()
    // unlock it → now it renders
    store.unlockedCosmetics = ['cosmetic-frame-apron']
    expect(portrait.value.frameUrl).toBe(`${L1}/cosmetic-frame-apron.png`)
  })

  it('an equipped set overrides the individual layers', () => {
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['cosmetic-frame-apron', 'cosmetic-set-complete']
    store.equipped = { frame: 'cosmetic-frame-apron', set: 'cosmetic-set-complete' }
    const { portrait } = usePremios()
    expect(portrait.value.setUrl).toBe(`${L1}/cosmetic-set-complete.png`)
    expect(portrait.value.frameUrl).toBeUndefined()
  })

  it('a chosen garden avatar drives the centre chip + tier frame', () => {
    const settings = useSettingsStore()
    // epic avatar (must be owned) → lavender epic frame + epic tier + its chip
    settings.chosenAvatarId = 'fox'
    settings.unlockedAvatarIds = ['fox']
    const { portrait } = usePremios()
    expect(portrait.value.avatarUrl).toBe('/img/avatars/fox.png')
    expect(portrait.value.avatarTier).toBe('epic')
    expect(portrait.value.frameUrl).toBe(EPIC_FRAME_URL)
    expect(portrait.value.chipColor).toBe(avatarBg('fox'))
  })

  it('frames step up by tier: rare silver, legendary gold, common none', () => {
    const settings = useSettingsStore()
    // rare → silver frame
    settings.chosenAvatarId = 'bee'
    settings.unlockedAvatarIds = ['bee', 'tiger']
    const { portrait } = usePremios()
    expect(portrait.value.frameUrl).toBe(RARE_FRAME_URL)
    expect(portrait.value.avatarTier).toBe('rare')
    // legendary → ornate gold frame
    settings.chosenAvatarId = 'tiger'
    expect(portrait.value.frameUrl).toBe(LEGENDARY_FRAME_URL)
    expect(portrait.value.avatarTier).toBe('legendary')
    // a common avatar (always owned) gets a chip but no tier frame
    settings.chosenAvatarId = 'seed'
    expect(portrait.value.frameUrl).toBeUndefined()
    expect(portrait.value.avatarTier).toBe('common')
  })

  it('an equipped escape-room frame takes precedence over the epic tier frame', () => {
    const store = useEscapeRoomStore()
    const settings = useSettingsStore()
    store.unlockedCosmetics = ['cosmetic-frame-apron']
    store.equipped = { frame: 'cosmetic-frame-apron' }
    settings.chosenAvatarId = 'fox'
    settings.unlockedAvatarIds = ['fox']
    const { portrait } = usePremios()
    expect(portrait.value.frameUrl).toBe(`${L1}/cosmetic-frame-apron.png`)
  })

  it('flags the equipped reward in the collection rows', () => {
    const store = useEscapeRoomStore()
    store.unlockedCosmetics = ['cosmetic-frame-apron']
    store.equipped = { frame: 'cosmetic-frame-apron' }
    const { all } = usePremios()
    const apron = all.value.find((p) => p.id === 'cosmetic-frame-apron')!
    expect(apron.unlocked).toBe(true)
    expect(apron.equipped).toBe(true)
  })
})
