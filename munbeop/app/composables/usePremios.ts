import { computed } from 'vue'
import type { LocalizedString, RewardTier } from '~/lib/domain'
import { REWARD_TIERS } from '~/lib/domain'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'
import { useEscapeRoomStore } from '~/stores/escape-room'

/**
 * usePremios — the profile "trophy case" view-model.
 *
 * Single source of truth for the sidebar profile's premios strip, the
 * popover's detailed inventory, the collapsed-rail count pip, AND the
 * portrait's cosmetic layers — so AccountMenu.vue and Premios.vue never
 * recompute the same thing twice (DRY; no god component).
 *
 * The "premios" are escape-room cosmetics: each playable Level defines one
 * Reward per tier (common/rare/epic/legendary), and beating a run unlocks
 * the matching cosmetic id into the escape-room store's `unlockedCosmetics`.
 * Cross-session persistence isn't wired yet, so today the default render is
 * the empty/locked trophy case — by design (it's meant to look inviting,
 * not broken). When persistence lands, this lights up with zero changes.
 */

/** Cosmetic kind, decoded from the reward id (`cosmetic-<type>-<name>`). */
export type CosmeticType = 'bg' | 'frame' | 'avatar' | 'set'

export interface Premio {
  tier: RewardTier
  type: CosmeticType
  /** Reward id — the persistence key matched against `unlockedCosmetics`. */
  id: string
  /** Resolved public URL of the cosmetic png. */
  url: string
  name: LocalizedString
  levelId: string
  levelTitle: LocalizedString
  unlocked: boolean
}

export interface TierSlot {
  tier: RewardTier
  /** True if ANY level's reward of this tier is unlocked. */
  unlocked: boolean
  /** The icon to show for the bucket: the highest level-order unlocked one,
   *  else the first (locked) reward of the tier as the bucket's identity. */
  shown: Premio
}

export interface DetailLevel {
  id: string
  title: LocalizedString
  rows: Premio[]
}

export function usePremios() {
  const store = useEscapeRoomStore()

  // Static: every playable level carries its full definition + rewards.
  const playable = LEVEL_REGISTRY.filter((e) => e.status === 'playable' && e.level)

  // Reactive over the store: flat list of every reward across every level.
  const all = computed<Premio[]>(() =>
    playable.flatMap((entry) =>
      REWARD_TIERS.map((tier) => {
        const reward = entry.level!.rewards[tier]
        return {
          tier,
          // 'cosmetic-frame-apron' -> 'frame'; 'cosmetic-set-complete' -> 'set'.
          type: (reward.id.split('-')[1] ?? 'set') as CosmeticType,
          id: reward.id,
          // reward.image already starts with 'cosmetics/'; do NOT double it.
          url: `/escape-room/${entry.id}/${reward.image}`,
          name: reward.name,
          levelId: entry.id,
          levelTitle: entry.title,
          unlocked: store.unlockedCosmetics.includes(reward.id),
        }
      }),
    ),
  )

  const totalCount = computed(() => all.value.length)
  const unlockedCount = computed(() => all.value.filter((p) => p.unlocked).length)

  /** Four buckets (one per tier) summarising the whole collection — keeps the
   *  narrow rail glanceable while the counter stays honest across all levels. */
  const tierSlots = computed<TierSlot[]>(() =>
    REWARD_TIERS.map((tier) => {
      const ofTier = all.value.filter((p) => p.tier === tier)
      const got = ofTier.filter((p) => p.unlocked)
      return {
        tier,
        unlocked: got.length > 0,
        shown: got.length ? got[got.length - 1]! : ofTier[0]!,
      }
    }),
  )

  /** Per-level rows for the popover's fuller inventory view. */
  const detailLevels = computed<DetailLevel[]>(() =>
    playable.map((entry) => ({
      id: entry.id,
      title: entry.title,
      rows: all.value.filter((p) => p.levelId === entry.id),
    })),
  )

  /** What the portrait composites: a 'set' overrides everything; otherwise the
   *  highest-order unlocked avatar / frame / bg layer each. All undefined today
   *  (persistence unwired) → the framed-initials default ships. */
  const portrait = computed(() => {
    const got = all.value.filter((p) => p.unlocked)
    const pick = (type: CosmeticType) => {
      const matches = got.filter((p) => p.type === type)
      return matches.length ? matches[matches.length - 1]!.url : undefined
    }
    const setUrl = pick('set')
    if (setUrl) return { setUrl, avatarUrl: undefined, frameUrl: undefined, bgUrl: undefined }
    return {
      setUrl: undefined,
      avatarUrl: pick('avatar'),
      frameUrl: pick('frame'),
      bgUrl: pick('bg'),
    }
  })

  return { all, totalCount, unlockedCount, tierSlots, detailLevels, portrait }
}
