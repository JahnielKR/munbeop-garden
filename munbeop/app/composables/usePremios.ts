import { computed } from 'vue'
import type { LocalizedString, RewardTier } from '~/lib/domain'
import { REWARD_TIERS } from '~/lib/domain'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'
import { useEscapeRoomStore } from '~/stores/escape-room'
import {
  AVATARS,
  avatarBg as gardenAvatarBg,
  avatarUrl as gardenAvatarUrl,
  LEGENDARY_FRAME_URL,
} from '~/lib/avatars/catalog'
import { useSettingsStore } from '~/stores/settings'

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
 * the matching cosmetic id into the escape-room store's `unlockedCosmetics`
 * (persisted per-account by useEscapeRoomProgress). The player equips which
 * unlocked cosmetic is active per type on the /trophies page; `portrait`
 * reflects that. Before anything is unlocked it's an inviting empty case.
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
  description: LocalizedString
  levelId: string
  levelTitle: LocalizedString
  unlocked: boolean
  /** True when this is the cosmetic currently chosen for its type slot. */
  equipped: boolean
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
        // 'cosmetic-frame-apron' -> 'frame'; 'cosmetic-set-complete' -> 'set'.
        const type = (reward.id.split('-')[1] ?? 'set') as CosmeticType
        return {
          tier,
          type,
          id: reward.id,
          // reward.image already starts with 'cosmetics/'; do NOT double it.
          url: `/escape-room/${entry.id}/${reward.image}`,
          name: reward.name,
          description: reward.description,
          levelId: entry.id,
          levelTitle: entry.title,
          unlocked: store.unlockedCosmetics.includes(reward.id),
          equipped: store.equipped[type] === reward.id,
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

  const settings = useSettingsStore()

  /** What the portrait composites, driven by the player's EQUIPPED choices (set
   *  on the /trophies page; auto-equipped into empty slots on first unlock). An
   *  equipped 'set' overrides the individual layers. Each equip is re-checked
   *  against `unlockedCosmetics` so a stale id never renders. Nothing equipped →
   *  framed initials. The user's chosen garden avatar (settings.chosenAvatarId)
   *  feeds the center slot with higher priority than the escape-room avatar; a
   *  legendary garden avatar also brings the shared ornate frame unless an
   *  escape-room frame is already equipped. The garden avatar is likewise only
   *  rendered when the user actually owns it. */
  const portrait = computed(() => {
    const urlFor = (id?: string): string | undefined => {
      if (!id || !store.unlockedCosmetics.includes(id)) return undefined
      return all.value.find((p) => p.id === id)?.url
    }
    // Resolve the chosen garden avatar, but only if it's owned — common avatars
    // are always owned, any other must be in the persisted unlocked set. This
    // mirrors the rule useAvatars.choose() enforces, so a re-locked id never
    // renders. (We can't call useAvatars() here: it depends on usePremios(), so
    // re-evaluating live unlocks would recurse.)
    const chosenDef = settings.chosenAvatarId
      ? (AVATARS.find((a) => a.id === settings.chosenAvatarId) ?? null)
      : null
    const chosen =
      chosenDef &&
      (chosenDef.rule.kind === 'always' || settings.unlockedAvatarIds.includes(chosenDef.id))
        ? chosenDef
        : null
    const settingsAvatarUrl = chosen ? gardenAvatarUrl(chosen.id) : undefined

    const eq = store.equipped
    const setUrl = urlFor(eq.set)
    if (setUrl)
      return {
        setUrl,
        avatarUrl: undefined,
        frameUrl: undefined,
        bgUrl: undefined,
        avatarTier: null,
        chipColor: undefined,
      }

    // The user's explicit Settings choice wins the center slot; escape-room
    // frame/bg still compose over/under it. A legendary garden avatar brings its
    // own ornate frame unless an escape-room frame is equipped.
    const escapeAvatar = urlFor(eq.avatar)
    const usingSettings = !!settingsAvatarUrl
    const escapeFrame = urlFor(eq.frame)
    const legendaryFrame =
      usingSettings && chosen!.tier === 'legendary' ? LEGENDARY_FRAME_URL : undefined
    return {
      setUrl: undefined,
      avatarUrl: settingsAvatarUrl ?? escapeAvatar,
      frameUrl: escapeFrame ?? legendaryFrame,
      bgUrl: urlFor(eq.bg),
      avatarTier: usingSettings ? chosen!.tier : null,
      // The chosen garden avatar's harmonised chip colour — only when the
      // garden avatar fills the centre slot (escape-room avatars keep the
      // default accent chip). The portrait paints this behind the sprite so
      // each icon sits on its own colour instead of the shared orange.
      chipColor: usingSettings ? gardenAvatarBg(chosen!.id) : undefined,
    }
  })

  return { all, totalCount, unlockedCount, tierSlots, detailLevels, portrait }
}
