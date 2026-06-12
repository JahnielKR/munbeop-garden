import type { Deck, Grammar } from '~/lib/domain'

/**
 * Shared shapes + helpers for the deck-draw game ("La Ruleta").
 *
 * Pure functions live here (not in the SFCs) so they unit-test without
 * mounting and so DeckPicker / CardDraw stay dumb, props-only components.
 */

/** One selectable mat in the deck picker. `id === null` is "all levels". */
export interface DeckOption {
  id: string | null
  name: string
  /** Resolved CSS colors for the mini card stack (1 per deck, up to 3 for "all"). */
  colors: string[]
  count: number
  disabled: boolean
  reason: 'excluded' | 'too_few' | null
}

/** One face-down card on the table, ready to flip. */
export interface DrawCard {
  ko: string
  deckName: string
  /** Resolved CSS color of the grammar's deck. */
  color: string
}

/**
 * colorId → CSS custom property. Mirrors the deck accent mapping in
 * library.vue (deck-section--*) so both surfaces stay in sync visually.
 */
const DECK_COLOR_VARS: Record<string, string> = {
  sky: 'var(--sky)',
  jade: 'var(--jade)',
  gold: 'var(--gold)',
  amber: 'var(--gold-shadow, var(--gold))',
  rose: 'var(--red)',
  violet: 'var(--ink-line, var(--ink-soft))',
}

export function deckColorVar(colorId: string): string {
  return DECK_COLOR_VARS[colorId] ?? 'var(--ink-soft)'
}

const MIN_DRAWABLE = 3

/**
 * Build the picker's options: one "all levels" mat first, then every deck
 * in `order`. Decks excluded in the Library stay visible but locked — the
 * Library filter is the single global gate, the game never overrides it.
 */
export function buildDeckOptions(p: {
  decks: readonly Deck[]
  items: readonly Pick<Grammar, 'deckId'>[]
  excludedDeckIds: readonly string[]
  allName: string
}): DeckOption[] {
  const sorted = [...p.decks].sort((a, b) => a.order - b.order)

  const perDeck: DeckOption[] = sorted.map((d) => {
    const count = p.items.filter((g) => g.deckId === d.id).length
    const excluded = p.excludedDeckIds.includes(d.id)
    const tooFew = count < MIN_DRAWABLE
    return {
      id: d.id,
      name: d.name,
      colors: [deckColorVar(d.colorId)],
      count,
      disabled: excluded || tooFew,
      reason: excluded ? 'excluded' : tooFew ? 'too_few' : null,
    }
  })

  const activeDecks = sorted.filter((d) => !p.excludedDeckIds.includes(d.id))
  const activeIds = new Set(activeDecks.map((d) => d.id))
  const allCount = p.items.filter((g) => activeIds.has(g.deckId)).length
  const all: DeckOption = {
    id: null,
    name: p.allName,
    colors:
      activeDecks.length > 0
        ? activeDecks.slice(0, 3).map((d) => deckColorVar(d.colorId))
        : ['var(--ink-soft)'],
    count: allCount,
    disabled: allCount < MIN_DRAWABLE,
    reason: allCount < MIN_DRAWABLE ? 'too_few' : null,
  }

  return [all, ...perDeck]
}
