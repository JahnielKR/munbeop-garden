import { computed } from 'vue'
import { AVATAR_TIERS, AVATARS, avatarUrl, type AvatarTier } from '~/lib/avatars/catalog'
import { evaluateAvatars, type AvatarState, type DecoratedAvatar } from '~/lib/avatars/evaluate'
import { useStats } from '~/composables/useStats'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { useCounterMaster } from '~/composables/useCounterMaster'
import { useNumberMarketMaster } from '~/composables/useNumberMarketMaster'
import { useParticleMaster } from '~/composables/useParticleMaster'
import { useRegisterMaster } from '~/composables/useRegisterMaster'
import { useLeeches } from '~/composables/useLeeches'
import { usePremios } from '~/composables/usePremios'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useSettingsStore } from '~/stores/settings'

/**
 * useAvatars — view-model for the avatar collection. Assembles the progress
 * snapshot from existing stores/composables, decorates the catalog with unlock +
 * progress, and owns equip/sync. The unlock LOGIC lives in the pure evaluator;
 * this only wires live state to it.
 */
export function useAvatars() {
  const stats = useStats()
  const conj = useConjugationMaster()
  const counter = useCounterMaster()
  const numberM = useNumberMarketMaster()
  const particle = useParticleMaster()
  const register = useRegisterMaster()
  const { leeches } = useLeeches()
  const { totalCount: escapeTotal } = usePremios()
  const escape = useEscapeRoomStore()
  const settings = useSettingsStore()

  const state = computed<AvatarState>(() => {
    const byLevel: AvatarState['byLevel'] = {}
    for (const l of stats.masteryLevels.value) byLevel[l.level] = { mastered: l.tree, total: l.total }
    return {
      trees: stats.masteredCount.value,
      catalogTotal: stats.catalogTotal.value,
      reviews: stats.sentences.value,
      longestStreak: stats.longestStreak.value,
      byLevel,
      labsEarned: {
        conjugation: conj.earned.value,
        counter: counter.earned.value,
        number: numberM.earned.value,
        particle: particle.earned.value,
        register: register.earned.value,
      },
      escapeUnlocked: escape.unlockedCosmetics.length,
      escapeTotal: escapeTotal.value,
      leeches: leeches.value.length,
    }
  })

  const storedSet = computed(() => new Set(settings.unlockedAvatarIds))
  const avatars = computed<DecoratedAvatar[]>(() => evaluateAvatars(state.value, storedSet.value))

  const byTier = computed<Record<AvatarTier, DecoratedAvatar[]>>(() => {
    const groups = Object.fromEntries(AVATAR_TIERS.map((t) => [t, [] as DecoratedAvatar[]])) as Record<
      AvatarTier,
      DecoratedAvatar[]
    >
    for (const a of avatars.value) groups[a.tier].push(a)
    return groups
  })

  const totalCount = computed(() => avatars.value.length)
  const ownedCount = computed(() => avatars.value.filter((a) => a.unlocked).length)
  const chosenId = computed(() => settings.chosenAvatarId)
  const chosen = computed(() => avatars.value.find((a) => a.id === settings.chosenAvatarId) ?? null)

  /** Equip an avatar. `null` resets to the initial; a locked id is refused. */
  function choose(id: string | null): void {
    if (id === null) {
      void settings.setChosenAvatar(null)
      return
    }
    if (avatars.value.find((a) => a.id === id)?.unlocked) void settings.setChosenAvatar(id)
  }

  /** Persist any newly-met non-common avatars into the sticky owned set. */
  async function syncUnlocks(): Promise<void> {
    const fresh = avatars.value
      .filter((a) => a.unlocked && a.rule.kind !== 'always' && !storedSet.value.has(a.id))
      .map((a) => a.id)
    if (fresh.length) await settings.unlockAvatars(fresh)
  }

  return { avatars, byTier, totalCount, ownedCount, chosenId, chosen, choose, syncUnlocks, avatarUrl }
}
