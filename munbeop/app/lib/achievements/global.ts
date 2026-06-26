/**
 * Global garden trophies — account-level milestones shown on /stats. Like the
 * per-grammar badges in {@link ./index.ts} these are derived on the fly with NO
 * persistence: a trophy is "earned" iff the live aggregate state satisfies it.
 * The derive is a pure function of a plain {@link GlobalState} so it is trivial
 * to test; the composable assembles that state from the stores.
 */
export type GlobalAchievementId =
  | 'first_sprout'
  | 'first_bloom'
  | 'green_thumb'
  | 'gardener'
  | 'master_gardener'
  | 'garden_complete'
  | 'topik_1_mastered'
  | 'topik_2_mastered'
  | 'topik_3_mastered'
  | 'topik_4_mastered'
  | 'topik_5_mastered'
  | 'topik_6_mastered'
  | 'streak_7'
  | 'streak_30'
  | 'reviews_100'
  | 'reviews_500'
  | 'flourishing'

export interface GlobalAchievement {
  id: GlobalAchievementId
  earned: boolean
}

export interface DeckMastery {
  mastered: number
  total: number
}

export interface GlobalState {
  /** Total reviews ever logged. */
  reviews: number
  /** Catalog grammars at tree mastery. */
  trees: number
  /** Catalog size. */
  catalogTotal: number
  /** Per-TOPIK-level mastered/total, keyed by level number (1–6). */
  byLevel: Record<number, DeckMastery>
  /** Current streak in days. */
  streak: number
  /** Number of struggling grammars right now. */
  leeches: number
}

export const GREEN_THUMB_TREES = 10
export const GARDENER_TREES = 50
export const STREAK_WEEK = 7
export const STREAK_MONTH = 30
export const REVIEWS_CENTURY = 100
export const REVIEWS_HALF_K = 500
export const FLOURISH_TREES = 10

function deckComplete(s: GlobalState, level: number): boolean {
  const d = s.byLevel[level]
  return !!d && d.total > 0 && d.mastered >= d.total
}

/** The trophy set for the whole garden. Order is fixed for a stable display. */
export function globalAchievementsFor(s: GlobalState): GlobalAchievement[] {
  const half = s.catalogTotal > 0 ? Math.ceil(s.catalogTotal / 2) : Infinity
  return [
    { id: 'first_sprout', earned: s.reviews >= 1 },
    { id: 'first_bloom', earned: s.trees >= 1 },
    { id: 'green_thumb', earned: s.trees >= GREEN_THUMB_TREES },
    { id: 'gardener', earned: s.trees >= GARDENER_TREES },
    { id: 'master_gardener', earned: s.trees >= half },
    { id: 'garden_complete', earned: s.catalogTotal > 0 && s.trees >= s.catalogTotal },
    { id: 'topik_1_mastered', earned: deckComplete(s, 1) },
    { id: 'topik_2_mastered', earned: deckComplete(s, 2) },
    { id: 'topik_3_mastered', earned: deckComplete(s, 3) },
    { id: 'topik_4_mastered', earned: deckComplete(s, 4) },
    { id: 'topik_5_mastered', earned: deckComplete(s, 5) },
    { id: 'topik_6_mastered', earned: deckComplete(s, 6) },
    { id: 'streak_7', earned: s.streak >= STREAK_WEEK },
    { id: 'streak_30', earned: s.streak >= STREAK_MONTH },
    { id: 'reviews_100', earned: s.reviews >= REVIEWS_CENTURY },
    { id: 'reviews_500', earned: s.reviews >= REVIEWS_HALF_K },
    { id: 'flourishing', earned: s.trees >= FLOURISH_TREES && s.leeches === 0 },
  ]
}
