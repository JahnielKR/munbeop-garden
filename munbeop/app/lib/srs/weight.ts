import type { SrsState } from '~/lib/domain'

const MS_PER_DAY = 86_400_000

const MASTERY_BASE: Record<SrsState['mastery'], number> = {
  seedling: 3,
  plant: 1.5,
  tree: 0.6,
}

const TIME_FACTOR_MAX = 2
const TIME_FACTOR_PIVOT_DAYS = 7
const NEVER_SEEN_DAYS = 30
const HARD_BONUS_COEF = 0.15
const HARD_BONUS_FLOOR = 0.3
const WEIGHT_FLOOR = 0.1

/**
 * SRS weight used by weighted pick. Higher weight → more likely to be drawn.
 * Mirrors legacy formula at index.html:3169: mastery × timeFactor × hardBonus.
 * @param now - Unix ms timestamp; pass Date.now() in app code. Injectable for tests.
 */
export function getWeight(srs: SrsState, now: number): number {
  const daysSince = srs.lastSeen ? (now - srs.lastSeen) / MS_PER_DAY : NEVER_SEEN_DAYS
  const timeFactor = Math.min(1 + daysSince / TIME_FACTOR_PIVOT_DAYS, TIME_FACTOR_MAX)
  const rawHardBonus = 1 + (srs.hardCount - srs.easyCount) * HARD_BONUS_COEF
  const hardBonus = Math.max(HARD_BONUS_FLOOR, rawHardBonus)
  const weight = MASTERY_BASE[srs.mastery] * timeFactor * hardBonus
  return Math.max(WEIGHT_FLOOR, weight)
}

/**
 * Days since lastSeen, floored. Returns null if never seen.
 */
export function daysSinceSeen(lastSeen: number | null, now: number): number | null {
  if (lastSeen === null) return null
  return Math.floor((now - lastSeen) / MS_PER_DAY)
}
