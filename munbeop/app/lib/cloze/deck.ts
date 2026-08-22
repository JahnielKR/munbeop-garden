import type { Grammar } from '~/lib/domain'

/** Resolve a deck choice to grammar kos. deckId null = all non-excluded decks. */
export function kosForDeck(
  items: readonly Pick<Grammar, 'ko' | 'deckId'>[],
  excludedDeckIds: readonly string[],
  deckId: string | null,
): string[] {
  const rows =
    deckId === null
      ? items.filter((grammar) => !excludedDeckIds.includes(grammar.deckId))
      : items.filter((grammar) => grammar.deckId === deckId)
  return rows.map((grammar) => grammar.ko)
}
