// munbeop/tests/unit/composables/useAvatars.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

const stats = {
  masteredCount: ref(0),
  catalogTotal: ref(100),
  sentences: ref(0),
  longestStreak: ref(0),
  masteryLevels: ref([] as { level: number; tree: number; total: number }[]),
}
const labs = {
  conjugation: ref(false), counter: ref(false), number: ref(false),
  particle: ref(false), register: ref(false),
}
const leechesRef = ref<unknown[]>([])
const unlockedCosmetics = ref<string[]>([])
const premiosTotal = ref(16)
const setChosenAvatar = vi.fn()
const unlockAvatars = vi.fn()
const settingsState = { chosenAvatarId: ref<string | null>(null), unlockedAvatarIds: ref<string[]>([]) }

vi.mock('~/composables/useStats', () => ({ useStats: () => stats }))
vi.mock('~/composables/useConjugationMaster', () => ({ useConjugationMaster: () => ({ earned: labs.conjugation }) }))
vi.mock('~/composables/useCounterMaster', () => ({ useCounterMaster: () => ({ earned: labs.counter }) }))
vi.mock('~/composables/useNumberMarketMaster', () => ({ useNumberMarketMaster: () => ({ earned: labs.number }) }))
vi.mock('~/composables/useParticleMaster', () => ({ useParticleMaster: () => ({ earned: labs.particle }) }))
vi.mock('~/composables/useRegisterMaster', () => ({ useRegisterMaster: () => ({ earned: labs.register }) }))
vi.mock('~/composables/useLeeches', () => ({ useLeeches: () => ({ leeches: leechesRef }) }))
vi.mock('~/composables/usePremios', () => ({ usePremios: () => ({ totalCount: premiosTotal }) }))
vi.mock('~/stores/escape-room', () => ({ useEscapeRoomStore: () => ({ unlockedCosmetics: unlockedCosmetics.value }) }))
vi.mock('~/stores/settings', () => ({
  useSettingsStore: () => ({
    get chosenAvatarId() { return settingsState.chosenAvatarId.value },
    unlockedAvatarIds: settingsState.unlockedAvatarIds.value,
    setChosenAvatar,
    unlockAvatars,
  }),
}))

import { useAvatars } from '~/composables/useAvatars'

describe('useAvatars', () => {
  beforeEach(() => {
    stats.masteredCount.value = 0
    stats.sentences.value = 0
    labs.conjugation.value = false
    settingsState.chosenAvatarId.value = null
    settingsState.unlockedAvatarIds.value = []
    setChosenAvatar.mockReset()
    unlockAvatars.mockReset()
  })

  it('decorates the catalog from live state (commons unlocked, gated locked)', () => {
    const { avatars } = useAvatars()
    expect(avatars.value.find((a) => a.id === 'seed')!.unlocked).toBe(true)
    expect(avatars.value.find((a) => a.id === 'butterfly')!.unlocked).toBe(false)
  })

  it('byTier groups and totals are right', () => {
    const { byTier, totalCount } = useAvatars()
    expect(byTier.value.common).toHaveLength(12)
    expect(byTier.value.legendary).toHaveLength(8)
    expect(totalCount.value).toBe(36)
  })

  it('choose persists an unlocked id and refuses a locked one', () => {
    const { choose } = useAvatars()
    choose('seed')
    expect(setChosenAvatar).toHaveBeenCalledWith('seed')
    setChosenAvatar.mockReset()
    choose('butterfly') // locked
    expect(setChosenAvatar).not.toHaveBeenCalled()
  })

  it('choose(null) always passes through (reset to initial)', () => {
    useAvatars().choose(null)
    expect(setChosenAvatar).toHaveBeenCalledWith(null)
  })

  it('syncUnlocks persists newly met non-common ids', async () => {
    stats.sentences.value = 100 // unlocks butterfly (reviews >= 100)
    await useAvatars().syncUnlocks()
    expect(unlockAvatars).toHaveBeenCalledWith(expect.arrayContaining(['butterfly']))
  })
})
