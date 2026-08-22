import type { ConfusablePair } from '~/lib/domain'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'
import { selectPairs, selectRelatedKos, type PairRow } from './select'

export type { PairRow } from './select'

/** Every pair containing `ko`, with which side ko is and the other member's ko. */
export function pairsFor(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): PairRow[] {
  return selectPairs(source, ko)
}

/** The deduped "confused with" ko list for a point (for the chips). */
export function relatedKos(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): string[] {
  return selectRelatedKos(source, ko)
}
