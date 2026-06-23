// app/lib/placement/select.ts
import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { PLACEMENT_ITEMS_BY_LEVEL } from '~/seed/placement'

/** Items authored for a TOPIK level. */
export function itemsForLevel(
  level: TopikLevel,
  source: Record<TopikLevel, PlacementItem[]> = PLACEMENT_ITEMS_BY_LEVEL,
): PlacementItem[] {
  return source[level] ?? []
}

/** n distinct items from a pool (shuffle is injected; runtime randomness only). */
export function selectItems(
  pool: PlacementItem[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
): PlacementItem[] {
  return shuffleFn([...pool]).slice(0, n)
}

/** answer first, then the 3 distractors (the composable shuffles for display). */
export function optionsFor(item: PlacementItem): string[] {
  return [item.answer, ...item.distractors]
}
