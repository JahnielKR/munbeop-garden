import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePremios } from '~/composables/usePremios'
import { useEscapeRoomStore } from '~/stores/escape-room'

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
