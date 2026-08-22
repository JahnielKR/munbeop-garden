import type { ConfusablePair } from '~/lib/domain'
import { levelOfDeck, type TopikLevel } from '~/lib/library/topik-level'
import { EXTRA_PAIR_CHUNKS } from './chunk-index'
import { selectPairs, type PairRow } from './select'

const loaders: Record<TopikLevel, () => Promise<ConfusablePair[]>> = {
  1: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n1'),
      import('~/seed/grammar-pairs/n1-extra'),
    ])
    return [...base.N1_PAIRS, ...extra.N1_PAIRS_EXTRA]
  },
  2: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n2'),
      import('~/seed/grammar-pairs/n2-extra'),
    ])
    return [...base.N2_PAIRS, ...extra.N2_PAIRS_EXTRA]
  },
  3: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n3'),
      import('~/seed/grammar-pairs/n3-extra'),
    ])
    return [...base.N3_PAIRS, ...extra.N3_PAIRS_EXTRA]
  },
  4: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n4'),
      import('~/seed/grammar-pairs/n4-extra'),
    ])
    return [...base.N4_PAIRS, ...extra.N4_PAIRS_EXTRA]
  },
  5: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n5'),
      import('~/seed/grammar-pairs/n5-extra'),
    ])
    return [...base.N5_PAIRS, ...extra.N5_PAIRS_EXTRA]
  },
  6: async () => {
    const [base, extra] = await Promise.all([
      import('~/seed/grammar-pairs/n6'),
      import('~/seed/grammar-pairs/n6-extra'),
    ])
    return [...base.N6_PAIRS, ...extra.N6_PAIRS_EXTRA]
  },
}

const cache = new Map<TopikLevel, ConfusablePair[]>()

async function pairsForLevel(level: TopikLevel): Promise<ConfusablePair[]> {
  let pairs = cache.get(level)
  if (!pairs) {
    pairs = await loaders[level]()
    cache.set(level, pairs)
  }
  return pairs
}

/**
 * Load the grammar's own TOPIK chunk plus any authored cross-level comparison
 * chunks. A pair can compare points introduced at different levels, so loading
 * only the current point's level would make the relationship one-sided.
 */
export async function pairsForGrammar(ko: string, deckId: string): Promise<PairRow[]> {
  const level = levelOfDeck(deckId)
  if (!level) return []

  const levels = [...new Set<TopikLevel>([level, ...(EXTRA_PAIR_CHUNKS[ko] ?? [])])]
  const sources = await Promise.all(levels.map((pairLevel) => pairsForLevel(pairLevel)))
  return selectPairs(sources.flat(), ko)
}
