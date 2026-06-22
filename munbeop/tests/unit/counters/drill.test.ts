import { describe, it, expect } from 'vitest'
import { buildDistractors, optionsFor, itemId, scoreOf } from '~/lib/counters'
import { COUNTERS, COUNT_ITEMS } from '~/seed/counters'

const find = (counterId: string) => COUNT_ITEMS.find((i) => i.counterId === counterId)!

describe('buildDistractors', () => {
  it('returns exactly 3 distinct distractors, none equal to the answer', () => {
    for (const it of COUNT_ITEMS) {
      const ds = buildDistractors(it, COUNTERS)
      expect(ds, `${it.counterId} ${it.quantity}`).toHaveLength(3)
      expect(new Set(ds).size).toBe(3)
      expect(ds).not.toContain(it.answer)
    }
  })

  it('includes a wrong-system and a wrong-prenominal form for a native item where they differ', () => {
    const it = find('gwon') // 세 권 (quantity 3, native)
    const ds = buildDistractors(it, COUNTERS)
    expect(ds).toContain('삼 권') // wrong system (Sino)
    expect(ds).toContain('셋 권') // wrong prenominal (native cardinal)
  })
})

describe('optionsFor / scoreOf / itemId', () => {
  it('optionsFor puts the answer first then 3 distractors', () => {
    const it = find('myeong')
    const opts = optionsFor(it, COUNTERS)
    expect(opts[0]).toBe(it.answer)
    expect(opts).toHaveLength(4)
  })
  it('itemId is stable and unique per item', () => {
    const ids = COUNT_ITEMS.map(itemId)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('scoreOf computes accuracy', () => {
    expect(scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])).toEqual({
      correct: 1, total: 2, accuracy: 0.5,
    })
  })
})
