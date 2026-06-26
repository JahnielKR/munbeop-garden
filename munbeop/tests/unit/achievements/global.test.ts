import { describe, it, expect } from 'vitest'
import {
  globalAchievementsFor,
  type GlobalState,
  type GlobalAchievementId,
} from '~/lib/achievements/global'

function state(p: Partial<GlobalState> = {}): GlobalState {
  return { reviews: 0, trees: 0, catalogTotal: 300, byLevel: {}, streak: 0, leeches: 0, ...p }
}
function earned(s: GlobalState): Set<GlobalAchievementId> {
  return new Set(globalAchievementsFor(s).filter((a) => a.earned).map((a) => a.id))
}

describe('globalAchievementsFor', () => {
  it('earns nothing for an empty garden', () => {
    expect(earned(state())).toEqual(new Set())
  })

  it('first_sprout on the first review, first_bloom on the first tree', () => {
    expect(earned(state({ reviews: 1 })).has('first_sprout')).toBe(true)
    expect(earned(state({ reviews: 1 })).has('first_bloom')).toBe(false)
    expect(earned(state({ reviews: 1, trees: 1 })).has('first_bloom')).toBe(true)
  })

  it('tree-count tiers at 10 / 50 / half / full', () => {
    expect(earned(state({ trees: 10 })).has('green_thumb')).toBe(true)
    expect(earned(state({ trees: 49 })).has('gardener')).toBe(false)
    expect(earned(state({ trees: 50 })).has('gardener')).toBe(true)
    expect(earned(state({ trees: 150, catalogTotal: 300 })).has('master_gardener')).toBe(true)
    expect(earned(state({ trees: 149, catalogTotal: 300 })).has('master_gardener')).toBe(false)
    expect(earned(state({ trees: 300, catalogTotal: 300 })).has('garden_complete')).toBe(true)
    expect(earned(state({ trees: 299, catalogTotal: 300 })).has('garden_complete')).toBe(false)
  })

  it('a level trophy needs that whole deck at tree mastery', () => {
    expect(earned(state({ byLevel: { 1: { mastered: 4, total: 5 } } })).has('topik_1_mastered')).toBe(false)
    expect(earned(state({ byLevel: { 1: { mastered: 5, total: 5 } } })).has('topik_1_mastered')).toBe(true)
    // an empty deck never counts as complete
    expect(earned(state({ byLevel: { 2: { mastered: 0, total: 0 } } })).has('topik_2_mastered')).toBe(false)
  })

  it('streak + review-volume tiers', () => {
    expect(earned(state({ streak: 7 })).has('streak_7')).toBe(true)
    expect(earned(state({ streak: 29 })).has('streak_30')).toBe(false)
    expect(earned(state({ streak: 30 })).has('streak_30')).toBe(true)
    expect(earned(state({ reviews: 99 })).has('reviews_100')).toBe(false)
    expect(earned(state({ reviews: 100 })).has('reviews_100')).toBe(true)
    expect(earned(state({ reviews: 500 })).has('reviews_500')).toBe(true)
  })

  it('flourishing needs trees and zero leeches', () => {
    expect(earned(state({ trees: 10, leeches: 0 })).has('flourishing')).toBe(true)
    expect(earned(state({ trees: 10, leeches: 1 })).has('flourishing')).toBe(false)
    expect(earned(state({ trees: 9, leeches: 0 })).has('flourishing')).toBe(false)
  })

  it('returns 17 trophies in a stable order', () => {
    const ids = globalAchievementsFor(state()).map((a) => a.id)
    expect(ids.length).toBe(17)
    expect(ids[0]).toBe('first_sprout')
    expect(ids.at(-1)).toBe('flourishing')
    expect(new Set(ids).size).toBe(17)
  })
})
