// tests/unit/register-transform/drill.test.ts
import { describe, it, expect } from 'vitest'
import { itemsFor, optionsFor, buildRound, scoreOf, itemId } from '~/lib/register-transform'
import type { RegisterItem } from '~/lib/domain'

const fx: RegisterItem[] = [
  { source: 'a', mode: 'level', target: 'formal', set: 'formal', answer: 'A',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { source: 'b', mode: 'level', target: 'casual', set: 'casual', answer: 'B',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { source: 'c', mode: 'honor', target: 'polite', set: 'verb', answer: 'C',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]

describe('itemsFor', () => {
  it('mixed = all items of the mode; a set filters', () => {
    expect(itemsFor('level', 'mixed', fx)).toHaveLength(2)
    expect(itemsFor('level', 'formal', fx).map((i) => i.answer)).toEqual(['A'])
    expect(itemsFor('honor', 'verb', fx).map((i) => i.answer)).toEqual(['C'])
  })
})

describe('optionsFor', () => {
  it('returns answer first + the 3 distractors', () => {
    expect(optionsFor(fx[0])).toEqual(['A', 'x', 'y', 'z'])
  })
})

describe('itemId', () => {
  it('keys on source + answer', () => {
    expect(itemId(fx[0])).toBe('a=>A')
  })
})

describe('buildRound', () => {
  it('returns n items using the injected shuffle', () => {
    const round = buildRound('level', 'mixed', 1, (xs) => xs, fx) // identity shuffle
    expect(round).toHaveLength(1)
    expect(round[0].answer).toBe('A')
  })
})

describe('scoreOf', () => {
  it('counts correct results and accuracy', () => {
    const s = scoreOf([{ itemId: 'a=>A', correct: true }, { itemId: 'b=>B', correct: false }])
    expect(s).toEqual({ correct: 1, total: 2, accuracy: 0.5 })
  })
})
