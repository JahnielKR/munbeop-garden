// tests/unit/conjugation-drill/drill.test.ts
import { describe, it, expect } from 'vitest'
import { DRILL_CLASSES, verbsForClass, buildItem, scoreOf } from '~/lib/conjugation-drill'
import { VERBS } from '~/lib/korean'

describe('drill classes', () => {
  it('exposes 9 real classes + mixed, mixed first', () => {
    expect(DRILL_CLASSES[0].id).toBe('mixed')
    expect(DRILL_CLASSES).toHaveLength(10)
    expect(DRILL_CLASSES.filter((c) => c.klass !== 'mixed')).toHaveLength(9)
  })
  it('verbsForClass filters by class; mixed = all', () => {
    expect(verbsForClass('mixed')).toEqual(VERBS)
    expect(verbsForClass('p_irr').every((v) => v.klass === 'p_irr')).toBe(true)
    expect(verbsForClass('p_irr').length).toBeGreaterThan(0)
  })
})

describe('buildItem', () => {
  it('produces exactly 4 unique options incl. the engine-correct form', () => {
    const v = VERBS.find((x) => x.dict === '듣다')!
    const item = buildItem(v, '-아/어요')
    expect(item.correct).toBe('들어요')
    expect(item.options).toContain('들어요')
    expect(item.options).toHaveLength(4)
    expect(new Set(item.options).size).toBe(4)
  })
})

describe('scoreOf', () => {
  it('counts correct results and accuracy', () => {
    const s = scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])
    expect(s.correct).toBe(1)
    expect(s.total).toBe(2)
    expect(s.accuracy).toBeCloseTo(0.5)
  })
})
