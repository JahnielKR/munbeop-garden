import { describe, it, expect } from 'vitest'
import { itemsForLevel, selectItems, optionsFor } from '~/lib/placement/select'
import type { PlacementItem } from '~/lib/domain'

const mk = (ko: string, level: 1 | 2): PlacementItem => ({
  ko, level, sentence: `${ko} {}.`, answer: `${ko}-a`,
  distractors: [`${ko}-b`, `${ko}-c`, `${ko}-d`],
  trans: { en: 't' } as never, why: { en: 'w' } as never,
})
const source = { 1: [mk('a', 1), mk('b', 1), mk('c', 1)], 2: [mk('x', 2)] } as never

describe('placement select', () => {
  it('itemsForLevel returns the bucket for a level', () => {
    expect(itemsForLevel(1, source).map((i) => i.ko)).toEqual(['a', 'b', 'c'])
    expect(itemsForLevel(2, source).map((i) => i.ko)).toEqual(['x'])
  })

  it('selectItems returns n distinct items', () => {
    const picked = selectItems(itemsForLevel(1, source), 2, (xs) => xs)
    expect(picked).toHaveLength(2)
    expect(new Set(picked.map((i) => i.ko)).size).toBe(2)
  })

  it('selectItems caps at the pool size when n exceeds it', () => {
    expect(selectItems(itemsForLevel(2, source), 4, (xs) => xs)).toHaveLength(1)
  })

  it('optionsFor puts the answer first, then the 3 distractors', () => {
    expect(optionsFor(mk('a', 1))).toEqual(['a-a', 'a-b', 'a-c', 'a-d'])
  })
})
