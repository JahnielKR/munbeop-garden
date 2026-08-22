import type { RewardTier } from '~/lib/domain'

export interface EscapeRewardManifestItem {
  levelId: string
  tier: RewardTier
  id: string
  image: string
}

/**
 * Compact runtime index for the global account chrome.
 *
 * Importing the full escape-room registry here would also import every room,
 * puzzle and narrative translation. This small manifest is parity-tested
 * against the authored levels so portrait and counter rendering stay cheap.
 */
export const ESCAPE_REWARD_MANIFEST: readonly EscapeRewardManifestItem[] = [
  {
    levelId: 'level-01',
    tier: 'common',
    id: 'cosmetic-bg-sunrise',
    image: 'cosmetics/cosmetic-bg-sunrise.png',
  },
  {
    levelId: 'level-01',
    tier: 'rare',
    id: 'cosmetic-frame-apron',
    image: 'cosmetics/cosmetic-frame-apron.png',
  },
  {
    levelId: 'level-01',
    tier: 'epic',
    id: 'cosmetic-avatar-lantern',
    image: 'cosmetics/cosmetic-avatar-lantern.png',
  },
  {
    levelId: 'level-01',
    tier: 'legendary',
    id: 'cosmetic-set-complete',
    image: 'cosmetics/cosmetic-set-complete.png',
  },
  {
    levelId: 'level-02',
    tier: 'common',
    id: 'cosmetic-bg-rainsound',
    image: 'cosmetics/cosmetic-bg-rainsound.png',
  },
  {
    levelId: 'level-02',
    tier: 'rare',
    id: 'cosmetic-frame-dancheong',
    image: 'cosmetics/cosmetic-frame-dancheong.png',
  },
  {
    levelId: 'level-02',
    tier: 'epic',
    id: 'cosmetic-avatar-templecat',
    image: 'cosmetics/cosmetic-avatar-templecat.png',
  },
  {
    levelId: 'level-02',
    tier: 'legendary',
    id: 'cosmetic-set-complete-02',
    image: 'cosmetics/cosmetic-set-complete.png',
  },
  {
    levelId: 'level-03',
    tier: 'common',
    id: 'cosmetic-bg-neonalley',
    image: 'cosmetics/cosmetic-bg-neonalley.png',
  },
  {
    levelId: 'level-03',
    tier: 'rare',
    id: 'cosmetic-frame-hotteokbag',
    image: 'cosmetics/cosmetic-frame-hotteokbag.png',
  },
  {
    levelId: 'level-03',
    tier: 'epic',
    id: 'cosmetic-avatar-marketcat',
    image: 'cosmetics/cosmetic-avatar-marketcat.png',
  },
  {
    levelId: 'level-03',
    tier: 'legendary',
    id: 'cosmetic-set-complete-03',
    image: 'cosmetics/cosmetic-set-complete-03.png',
  },
  {
    levelId: 'level-04',
    tier: 'common',
    id: 'cosmetic-bg-rainy-rails',
    image: 'cosmetics/cosmetic-bg-rainy-rails.png',
  },
  {
    levelId: 'level-04',
    tier: 'rare',
    id: 'cosmetic-frame-paper-ticket',
    image: 'cosmetics/cosmetic-frame-paper-ticket.png',
  },
  {
    levelId: 'level-04',
    tier: 'epic',
    id: 'cosmetic-avatar-green-lamp',
    image: 'cosmetics/cosmetic-avatar-green-lamp.png',
  },
  {
    levelId: 'level-04',
    tier: 'legendary',
    id: 'cosmetic-set-complete-04',
    image: 'cosmetics/cosmetic-set-complete-04.png',
  },
  {
    levelId: 'level-05',
    tier: 'common',
    id: 'cosmetic-bg-grandfather-kitchen',
    image: 'cosmetics/cosmetic-bg-grandfather-kitchen.png',
  },
  {
    levelId: 'level-05',
    tier: 'rare',
    id: 'cosmetic-frame-fermentation-jar',
    image: 'cosmetics/cosmetic-frame-fermentation-jar.png',
  },
  {
    levelId: 'level-05',
    tier: 'epic',
    id: 'cosmetic-avatar-recipe-ladle',
    image: 'cosmetics/cosmetic-avatar-recipe-ladle.png',
  },
  {
    levelId: 'level-05',
    tier: 'legendary',
    id: 'cosmetic-set-complete-05',
    image: 'cosmetics/cosmetic-set-complete-05.png',
  },
  {
    levelId: 'level-06',
    tier: 'common',
    id: 'cosmetic-bg-summer-studio',
    image: 'cosmetics/cosmetic-bg-summer-studio.webp',
  },
  {
    levelId: 'level-06',
    tier: 'rare',
    id: 'cosmetic-frame-clapperboard',
    image: 'cosmetics/cosmetic-frame-clapperboard.png',
  },
  {
    levelId: 'level-06',
    tier: 'epic',
    id: 'cosmetic-avatar-extra-47',
    image: 'cosmetics/cosmetic-avatar-extra-47.png',
  },
  {
    levelId: 'level-06',
    tier: 'legendary',
    id: 'cosmetic-set-complete-06',
    image: 'cosmetics/cosmetic-set-complete-06.png',
  },
  {
    levelId: 'level-07',
    tier: 'common',
    id: 'cosmetic-bg-night-retreat',
    image: 'cosmetics/cosmetic-bg-night-retreat.webp',
  },
  {
    levelId: 'level-07',
    tier: 'rare',
    id: 'cosmetic-frame-team-badges',
    image: 'cosmetics/cosmetic-frame-team-badges.png',
  },
  {
    levelId: 'level-07',
    tier: 'epic',
    id: 'cosmetic-avatar-radio-lead',
    image: 'cosmetics/cosmetic-avatar-radio-lead.png',
  },
  {
    levelId: 'level-07',
    tier: 'legendary',
    id: 'cosmetic-set-complete-07',
    image: 'cosmetics/cosmetic-set-complete-07.png',
  },
  {
    levelId: 'level-08',
    tier: 'common',
    id: 'cosmetic-bg-lantern-palace',
    image: 'cosmetics/cosmetic-bg-lantern-palace.png',
  },
  {
    levelId: 'level-08',
    tier: 'rare',
    id: 'cosmetic-frame-moon-gate',
    image: 'cosmetics/cosmetic-frame-moon-gate.png',
  },
  {
    levelId: 'level-08',
    tier: 'epic',
    id: 'cosmetic-avatar-haewon',
    image: 'cosmetics/cosmetic-avatar-haewon.png',
  },
  {
    levelId: 'level-08',
    tier: 'legendary',
    id: 'cosmetic-set-complete-08',
    image: 'cosmetics/cosmetic-set-complete-08.png',
  },
  {
    levelId: 'level-09',
    tier: 'common',
    id: 'cosmetic-bg-testament-mansion',
    image: 'cosmetics/cosmetic-bg-testament-mansion.png',
  },
  {
    levelId: 'level-09',
    tier: 'rare',
    id: 'cosmetic-frame-seven-keys',
    image: 'cosmetics/cosmetic-frame-seven-keys.png',
  },
  {
    levelId: 'level-09',
    tier: 'epic',
    id: 'cosmetic-avatar-archivist-eunjae',
    image: 'cosmetics/cosmetic-avatar-archivist-eunjae.png',
  },
  {
    levelId: 'level-09',
    tier: 'legendary',
    id: 'cosmetic-set-complete-09',
    image: 'cosmetics/cosmetic-set-complete-09.png',
  },
  {
    levelId: 'level-10',
    tier: 'common',
    id: 'cosmetic-bg-midnight-summit',
    image: 'cosmetics/cosmetic-bg-midnight-summit.webp',
  },
  {
    levelId: 'level-10',
    tier: 'rare',
    id: 'cosmetic-frame-six-seals',
    image: 'cosmetics/cosmetic-frame-six-seals.png',
  },
  {
    levelId: 'level-10',
    tier: 'epic',
    id: 'cosmetic-avatar-interpreter-pen',
    image: 'cosmetics/cosmetic-avatar-interpreter-pen.webp',
  },
  {
    levelId: 'level-10',
    tier: 'legendary',
    id: 'cosmetic-set-dawn-accord',
    image: 'cosmetics/cosmetic-set-dawn-accord.webp',
  },
] as const

export function escapeRewardUrl(item: EscapeRewardManifestItem): string {
  return `/escape-room/${item.levelId}/${item.image}`
}
