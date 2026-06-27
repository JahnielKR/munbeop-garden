import type { Grammar, MasteryLevel } from '~/lib/domain'

/**
 * Library mastery filter value: a real SRS mastery level, or the pseudo-level
 * "hard" (the struggling/leech set, which is derived from the log, not a level).
 */
export type MasteryFilterValue = MasteryLevel | 'hard'

export const MASTERY_FILTER_VALUES: readonly MasteryFilterValue[] = [
  'seedling',
  'plant',
  'tree',
  'hard',
]

export function isMasteryFilterValue(v: unknown): v is MasteryFilterValue {
  return typeof v === 'string' && (MASTERY_FILTER_VALUES as readonly string[]).includes(v)
}

/**
 * Keep only grammars matching a mastery filter. Pure: mastery + leech membership
 * are injected (the SRS store / leech signal live in the composable), so this is
 * unit-testable without Pinia. `null` → no filtering. `"hard"` → the leech set;
 * any other value → grammars whose current mastery equals it. Order preserved.
 */
export function filterByMastery(
  items: Grammar[],
  mastery: MasteryFilterValue | null,
  masteryOf: (ko: string) => MasteryLevel,
  isLeech: (ko: string) => boolean,
): Grammar[] {
  if (!mastery) return items
  if (mastery === 'hard') return items.filter((g) => isLeech(g.ko))
  return items.filter((g) => masteryOf(g.ko) === mastery)
}
