import { computed } from 'vue'
import { REWARD_TIERS, type RewardTier } from '~/lib/domain'
import {
  ESCAPE_REWARD_MANIFEST,
  escapeRewardUrl,
  type EscapeRewardManifestItem,
} from '~/lib/escape-room/reward-manifest'
import { useEscapeRoomStore } from '~/stores/escape-room'
import {
  AVATARS,
  type AvatarTier,
  avatarBg as gardenAvatarBg,
  avatarUrl as gardenAvatarUrl,
  EPIC_FRAME_URL,
  LEGENDARY_FRAME_URL,
  RARE_FRAME_URL,
} from '~/lib/avatars/catalog'
import { useSettingsStore } from '~/stores/settings'

export type PremioSummaryType = 'bg' | 'frame' | 'avatar' | 'set'

export interface PremioSummary extends EscapeRewardManifestItem {
  type: PremioSummaryType
  url: string
  unlocked: boolean
  equipped: boolean
}

export interface PremioTierSummary {
  tier: RewardTier
  unlocked: boolean
  shown: PremioSummary
}

/** Lightweight account-shell view-model; never imports full escape stories. */
export function usePremioSummary() {
  const store = useEscapeRoomStore()
  const settings = useSettingsStore()

  const all = computed<PremioSummary[]>(() =>
    ESCAPE_REWARD_MANIFEST.map((item) => {
      const type = (item.id.split('-')[1] ?? 'set') as PremioSummaryType
      return {
        ...item,
        type,
        url: escapeRewardUrl(item),
        unlocked: store.unlockedCosmetics.includes(item.id),
        equipped: store.equipped[type] === item.id,
      }
    }),
  )

  const totalCount = computed(() => ESCAPE_REWARD_MANIFEST.length)
  const unlockedCount = computed(() => all.value.filter((item) => item.unlocked).length)
  const tierSlots = computed<PremioTierSummary[]>(() =>
    REWARD_TIERS.map((tier) => {
      const ofTier = all.value.filter((item) => item.tier === tier)
      const unlocked = ofTier.filter((item) => item.unlocked)
      return {
        tier,
        unlocked: unlocked.length > 0,
        shown: unlocked.at(-1) ?? ofTier[0]!,
      }
    }),
  )

  const portrait = computed(() => {
    const urlFor = (id?: string): string | undefined => {
      if (!id || !store.unlockedCosmetics.includes(id)) return undefined
      return all.value.find((item) => item.id === id)?.url
    }

    const chosenDef = settings.chosenAvatarId
      ? (AVATARS.find((avatar) => avatar.id === settings.chosenAvatarId) ?? null)
      : null
    const chosen =
      chosenDef &&
      (chosenDef.rule.kind === 'always' || settings.unlockedAvatarIds.includes(chosenDef.id))
        ? chosenDef
        : null
    const settingsAvatarUrl = chosen ? gardenAvatarUrl(chosen.id) : undefined

    const setUrl = urlFor(store.equipped.set)
    if (setUrl) {
      return {
        setUrl,
        avatarUrl: undefined,
        frameUrl: undefined,
        bgUrl: undefined,
        avatarTier: null,
        chipColor: undefined,
      }
    }

    const usingSettings = !!settingsAvatarUrl
    const tierFrames: Partial<Record<AvatarTier, string>> = {
      rare: RARE_FRAME_URL,
      epic: EPIC_FRAME_URL,
      legendary: LEGENDARY_FRAME_URL,
    }
    return {
      setUrl: undefined,
      avatarUrl: settingsAvatarUrl ?? urlFor(store.equipped.avatar),
      frameUrl:
        urlFor(store.equipped.frame) ?? (usingSettings ? tierFrames[chosen!.tier] : undefined),
      bgUrl: urlFor(store.equipped.bg),
      avatarTier: usingSettings ? chosen!.tier : null,
      chipColor: usingSettings ? gardenAvatarBg(chosen!.id) : undefined,
    }
  })

  return { all, totalCount, unlockedCount, tierSlots, portrait }
}
