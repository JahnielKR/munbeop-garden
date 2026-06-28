/** TOPIK levels 1–6 — the unit the by-level study-sheet seeds (usage-notes,
 *  grammar-examples) are code-split on, so opening one grammar fetches only its
 *  level's chunk instead of the whole ~5 MB catalog. */
export type TopikLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Map a grammar's deckId to its TOPIK level. The catalog is six decks
 * (`topik-1` … `topik-6`); the user's custom deck (`custom`) and any unknown id
 * have no per-level seed and return null.
 */
export function levelOfDeck(deckId: string): TopikLevel | null {
  const m = /^topik-([1-6])$/.exec(deckId)
  return m ? (Number(m[1]) as TopikLevel) : null
}
