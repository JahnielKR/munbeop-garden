import { describe, it, expect } from 'vitest'
import { filterPoolByDeck } from '~/lib/practice'
import { buildDeckOptions, deckColorVar } from '~/components/games/ruleta/cards'
import type { Deck } from '~/lib/domain'

const DECKS: Deck[] = [
  { id: 'topik-1', name: 'TOPIK 1', colorId: 'sky', order: 1, collapsed: false },
  { id: 'topik-2', name: 'TOPIK 2', colorId: 'jade', order: 2, collapsed: false },
  { id: 'topik-3', name: 'TOPIK 3', colorId: 'gold', order: 3, collapsed: false },
]

// 4 grammars in topik-1, 3 in topik-2, 1 in topik-3
const ITEMS = [
  { deckId: 'topik-1' },
  { deckId: 'topik-1' },
  { deckId: 'topik-1' },
  { deckId: 'topik-1' },
  { deckId: 'topik-2' },
  { deckId: 'topik-2' },
  { deckId: 'topik-2' },
  { deckId: 'topik-3' },
]

describe('filterPoolByDeck', () => {
  const deckIdOf = (idx: number) => ITEMS[idx]?.deckId

  it('keeps the whole pool when deckId is null', () => {
    expect(filterPoolByDeck([0, 1, 4, 7], deckIdOf, null)).toEqual([0, 1, 4, 7])
  })

  it('narrows the pool to one deck', () => {
    expect(filterPoolByDeck([0, 1, 4, 5, 7], deckIdOf, 'topik-2')).toEqual([4, 5])
  })

  it('returns empty when no pool index belongs to the deck', () => {
    expect(filterPoolByDeck([0, 1], deckIdOf, 'topik-3')).toEqual([])
  })
})

describe('buildDeckOptions', () => {
  it('puts the "all levels" option first, then decks in order', () => {
    const opts = buildDeckOptions({
      decks: DECKS,
      items: ITEMS,
      excludedDeckIds: [],
      allName: 'All',
    })
    expect(opts.map((o) => o.id)).toEqual([null, 'topik-1', 'topik-2', 'topik-3'])
    expect(opts[0]!.name).toBe('All')
    expect(opts[0]!.count).toBe(8)
  })

  it('disables decks excluded in the library and reports the reason', () => {
    const opts = buildDeckOptions({
      decks: DECKS,
      items: ITEMS,
      excludedDeckIds: ['topik-2'],
      allName: 'All',
    })
    const t2 = opts.find((o) => o.id === 'topik-2')!
    expect(t2.disabled).toBe(true)
    expect(t2.reason).toBe('excluded')
    // the "all" mat no longer counts the excluded deck's grammars
    expect(opts[0]!.count).toBe(5)
  })

  it('disables decks with fewer than 3 grammars', () => {
    const opts = buildDeckOptions({
      decks: DECKS,
      items: ITEMS,
      excludedDeckIds: [],
      allName: 'All',
    })
    const t3 = opts.find((o) => o.id === 'topik-3')!
    expect(t3.disabled).toBe(true)
    expect(t3.reason).toBe('too_few')
    const t2 = opts.find((o) => o.id === 'topik-2')!
    expect(t2.disabled).toBe(false)
  })

  it('fans up to 3 active deck colors on the "all" mat', () => {
    const opts = buildDeckOptions({
      decks: DECKS,
      items: ITEMS,
      excludedDeckIds: ['topik-1'],
      allName: 'All',
    })
    expect(opts[0]!.colors).toEqual([deckColorVar('jade'), deckColorVar('gold')])
  })

  it('disables everything gracefully when all decks are excluded', () => {
    const opts = buildDeckOptions({
      decks: DECKS,
      items: ITEMS,
      excludedDeckIds: DECKS.map((d) => d.id),
      allName: 'All',
    })
    expect(opts[0]!.disabled).toBe(true)
    expect(opts[0]!.colors.length).toBeGreaterThan(0)
  })
})
