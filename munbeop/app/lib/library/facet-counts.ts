import type { Grammar, GrammarType, MasteryLevel, TopikLevel } from '~/lib/domain'
import type { MasteryFilterValue } from './mastery-filter'

/** Per-option item counts for the library filter selects (global, over the catalog). */
export interface FacetCounts {
  byLevel: Record<number, number>
  byCategory: Record<string, number>
  byMastery: Record<MasteryFilterValue, number>
}

/**
 * Count catalog grammars per filter facet. Pure: the level/category/mastery/leech
 * lookups are injected so this is unit-testable without the spine or Pinia.
 * A leech is counted in BOTH its mastery level and the `hard` overlay (filtering
 * by "Struggling" is not exclusive of a mastery level).
 */
export function facetCounts(
  items: readonly Grammar[],
  levelOf: (ko: string) => TopikLevel | undefined,
  categoryOf: (ko: string) => GrammarType | undefined,
  masteryOf: (ko: string) => MasteryLevel,
  isLeech: (ko: string) => boolean,
): FacetCounts {
  const byLevel: Record<number, number> = {}
  const byCategory: Record<string, number> = {}
  const byMastery: Record<MasteryFilterValue, number> = { seedling: 0, plant: 0, tree: 0, hard: 0 }
  for (const g of items) {
    const lvl = levelOf(g.ko)
    if (lvl != null) byLevel[lvl] = (byLevel[lvl] ?? 0) + 1
    const cat = categoryOf(g.ko)
    if (cat) byCategory[cat] = (byCategory[cat] ?? 0) + 1
    byMastery[masteryOf(g.ko)] += 1
    if (isLeech(g.ko)) byMastery.hard += 1
  }
  return { byLevel, byCategory, byMastery }
}
