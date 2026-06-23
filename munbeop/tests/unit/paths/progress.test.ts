import { describe, it, expect } from 'vitest'
import { isLearned, pathProgress } from '~/lib/paths/progress'
import type { SrsState } from '~/lib/domain'

const st = (mastery: SrsState['mastery']): SrsState => ({ lastSeen: 1, easyCount: 1, hardCount: 0, mastery })

describe('isLearned', () => {
  it('is true for plant and tree, false otherwise', () => {
    expect(isLearned(st('plant'))).toBe(true)
    expect(isLearned(st('tree'))).toBe(true)
    expect(isLearned(st('seedling'))).toBe(false)
    expect(isLearned(undefined)).toBe(false)
  })
})

describe('pathProgress', () => {
  const map: Record<string, SrsState> = { A: st('tree'), B: st('seedling'), C: st('plant') }
  it('counts learned, computes pct, and finds the first not-learned ko in order', () => {
    const p = pathProgress(['A', 'B', 'C'], map)
    expect(p.total).toBe(3)
    expect(p.learned).toBe(2)
    expect(p.pct).toBeCloseTo(2 / 3)
    expect(p.nextKo).toBe('B')
    expect(p.items).toEqual([
      { ko: 'A', learned: true },
      { ko: 'B', learned: false },
      { ko: 'C', learned: true },
    ])
  })
  it('returns nextKo null when everything is learned', () => {
    expect(pathProgress(['A', 'C'], map).nextKo).toBeNull()
  })
  it('handles an empty path', () => {
    expect(pathProgress([], map)).toEqual({ items: [], total: 0, learned: 0, pct: 0, nextKo: null })
  })
})
