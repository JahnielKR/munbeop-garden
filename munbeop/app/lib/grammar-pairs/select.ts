import type { ConfusablePair } from '~/lib/domain'

export interface PairRow {
  pair: ConfusablePair
  selfSide: 'a' | 'b'
  otherKo: string
}

/** Pure pair selection over an explicitly supplied TOPIK-level source. */
export function selectPairs(source: ConfusablePair[], ko: string): PairRow[] {
  const rows: PairRow[] = []
  for (const pair of source) {
    if (pair.a === ko) rows.push({ pair, selfSide: 'a', otherKo: pair.b })
    else if (pair.b === ko) rows.push({ pair, selfSide: 'b', otherKo: pair.a })
  }
  return rows
}

export function selectRelatedKos(source: ConfusablePair[], ko: string): string[] {
  return [...new Set(selectPairs(source, ko).map((row) => row.otherKo))]
}
