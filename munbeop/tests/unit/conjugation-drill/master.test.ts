// tests/unit/conjugation-drill/master.test.ts
import { describe, it, expect } from 'vitest'
import { MASTER_CLASS_IDS, masteryOf } from '~/lib/conjugation-drill/master'

describe('conjugation mastery (pure)', () => {
  it('tracks the 9 real classes (no mixed)', () => {
    expect(MASTER_CLASS_IDS).toHaveLength(9)
    expect(MASTER_CLASS_IDS).not.toContain('mixed')
  })
  it('earned only when all 9 are cleared', () => {
    const partial = masteryOf(new Set(['regular', 'p_irr']))
    expect(partial.doneCount).toBe(2)
    expect(partial.total).toBe(9)
    expect(partial.earned).toBe(false)
    const all = masteryOf(new Set(MASTER_CLASS_IDS))
    expect(all.earned).toBe(true)
    expect(all.perClass.every((p) => p.done)).toBe(true)
  })
})
