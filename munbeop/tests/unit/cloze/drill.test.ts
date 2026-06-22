// tests/unit/cloze/drill.test.ts
import { describe, it, expect } from 'vitest'
import { itemsForKos, optionsFor, buildRound, scoreOf, itemId, kosForDeck } from '~/lib/cloze'
import type { ClozeItem } from '~/lib/domain'

const fx: ClozeItem[] = [
  { ko: 'A', sentence: 'a {} z', answer: 'Aa', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { ko: 'A', sentence: 'b {} z', answer: 'Ab', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { ko: 'B', sentence: 'c {} z', answer: 'Bc', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]

describe('itemsForKos', () => {
  it('returns items whose ko is in the set', () => {
    expect(itemsForKos(['A'], fx).map((i) => i.answer)).toEqual(['Aa', 'Ab'])
    expect(itemsForKos(['A', 'B'], fx)).toHaveLength(3)
    expect(itemsForKos(['Z'], fx)).toEqual([])
  })
})

describe('optionsFor / itemId', () => {
  it('answer first then distractors; id keys on ko+sentence', () => {
    expect(optionsFor(fx[0])).toEqual(['Aa', 'x', 'y', 'z'])
    expect(itemId(fx[0])).toBe('A::a {} z')
  })
})

describe('buildRound', () => {
  it('returns n items for the kos using the injected shuffle', () => {
    const round = buildRound(['A'], 1, (xs) => xs, fx)
    expect(round).toHaveLength(1)
    expect(round[0].ko).toBe('A')
  })
})

describe('scoreOf', () => {
  it('counts correct + accuracy', () => {
    expect(scoreOf([{ itemId: 'A::x', ko: 'A', correct: true }, { itemId: 'B::y', ko: 'B', correct: false }]))
      .toEqual({ correct: 1, total: 2, accuracy: 0.5 })
  })
})

describe('kosForDeck', () => {
  const items = [
    { ko: 'g1', deckId: 'topik-1' }, { ko: 'g2', deckId: 'topik-1' }, { ko: 'g3', deckId: 'topik-2' },
  ] as never
  it('a deckId filters to that deck', () => {
    expect(kosForDeck(items, [], 'topik-1')).toEqual(['g1', 'g2'])
  })
  it('null = all non-excluded decks', () => {
    expect(kosForDeck(items, ['topik-2'], null)).toEqual(['g1', 'g2'])
  })
})
