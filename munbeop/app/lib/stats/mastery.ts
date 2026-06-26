import type { Grammar, SrsState } from '~/lib/domain'

export interface LevelMastery {
  level: number
  seedling: number
  plant: number
  tree: number
  /** Grammar items in this TOPIK level (touched or not). */
  total: number
  /** Learned (plant + tree) as a rounded percentage of total — matches /paths. */
  pct: number
}

export interface ToughGrammar {
  ko: string
  meaning: Grammar['meaning'] | undefined
  hardCount: number
}

const TOPIK_DECK = /^topik-([1-6])$/

/**
 * Per-TOPIK-level mastery breakdown. Each grammar whose deckId is `topik-N`
 * counts toward that level's total; if it has an srs row its mastery tier is
 * tallied, otherwise it's untouched (total only). Non-TOPIK decks (general /
 * custom) are ignored. Always returns levels 1..6.
 */
export function masteryByLevel(
  grammars: Grammar[],
  srsMap: Record<string, SrsState>,
): LevelMastery[] {
  const levels: LevelMastery[] = Array.from({ length: 6 }, (_, i) => ({
    level: i + 1,
    seedling: 0,
    plant: 0,
    tree: 0,
    total: 0,
    pct: 0,
  }))
  for (const grammar of grammars) {
    const match = TOPIK_DECK.exec(grammar.deckId)
    if (!match) continue
    const bucket = levels[Number(match[1]) - 1]!
    bucket.total += 1
    const mastery = srsMap[grammar.ko]?.mastery
    if (mastery === 'seedling') bucket.seedling += 1
    else if (mastery === 'plant') bucket.plant += 1
    else if (mastery === 'tree') bucket.tree += 1
  }
  for (const l of levels) {
    const learned = l.plant + l.tree
    l.pct = l.total ? Math.round((learned / l.total) * 100) : 0
  }
  return levels
}

/**
 * The grammars the user has found hardest, by srs hardCount (descending,
 * excluding zero), each with its catalog meaning for display. Ties break by
 * `ko` for a stable order.
 */
export function toughestGrammar(
  srsMap: Record<string, SrsState>,
  grammars: Grammar[],
  n = 5,
): ToughGrammar[] {
  const meaningOf = new Map(grammars.map((g) => [g.ko, g.meaning]))
  return Object.entries(srsMap)
    .filter(([, s]) => s.hardCount > 0)
    .sort((a, b) => b[1].hardCount - a[1].hardCount || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([ko, s]) => ({ ko, meaning: meaningOf.get(ko), hardCount: s.hardCount }))
}
