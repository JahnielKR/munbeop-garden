import type { ConfusablePair } from '~/lib/domain'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'

export interface PairRow {
  pair: ConfusablePair
  selfSide: 'a' | 'b'
  otherKo: string
}

/** Every pair containing `ko`, with which side ko is and the other member's ko. */
export function pairsFor(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): PairRow[] {
  const rows: PairRow[] = []
  for (const pair of source) {
    if (pair.a === ko) rows.push({ pair, selfSide: 'a', otherKo: pair.b })
    else if (pair.b === ko) rows.push({ pair, selfSide: 'b', otherKo: pair.a })
  }
  return rows
}

/** The deduped "confused with" ko list for a point (for the chips). */
export function relatedKos(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): string[] {
  return [...new Set(pairsFor(ko, source).map((r) => r.otherKo))]
}
