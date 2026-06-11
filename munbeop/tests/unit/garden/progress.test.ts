import { describe, expect, it } from 'vitest'
import type { SrsState } from '~/lib/domain'
import { itemScore, progressPct } from '~/lib/garden/progress'

function srs(partial: Partial<SrsState>): SrsState {
  return { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling', ...partial }
}

describe('itemScore', () => {
  it('returns 0 for an item with no SRS state', () => {
    expect(itemScore(undefined)).toBe(0)
  })

  it('returns 0 for a fresh seedling that was never practiced', () => {
    expect(itemScore(srs({}))).toBe(0)
  })

  it('returns 0.1 for a practiced seedling (counts or lastSeen)', () => {
    expect(itemScore(srs({ hardCount: 1 }))).toBe(0.1)
    expect(itemScore(srs({ easyCount: 2 }))).toBe(0.1)
    expect(itemScore(srs({ lastSeen: 1718000000000 }))).toBe(0.1)
  })

  it('returns 0.5 for plant and 1 for tree mastery', () => {
    expect(itemScore(srs({ mastery: 'plant' }))).toBe(0.5)
    expect(itemScore(srs({ mastery: 'tree' }))).toBe(1)
  })
})

describe('progressPct', () => {
  const states: Record<string, SrsState> = {
    a: srs({ mastery: 'tree' }),
    b: srs({ mastery: 'plant' }),
    c: srs({ lastSeen: 1718000000000 }),
  }
  const lookup = (ko: string) => states[ko]

  it('is 0 for an empty item set', () => {
    expect(progressPct([], lookup)).toBe(0)
  })

  it('averages mixed mastery and rounds to an integer', () => {
    // (1 + 0.5 + 0.1 + 0) / 4 = 0.4 -> 40
    expect(progressPct(['a', 'b', 'c', 'd'], lookup)).toBe(40)
  })

  it('rounds halves up (Math.round semantics)', () => {
    // (1 + 0.1) / 2 = 0.55 -> 55 ; (0.5 + 0.1 + 0.1) / 3 = 0.2333 -> 23
    expect(progressPct(['a', 'c'], lookup)).toBe(55)
    expect(progressPct(['b', 'c', 'c'], lookup)).toBe(23)
  })

  it('reaches 100 only when every item is a tree', () => {
    expect(progressPct(['a', 'a'], lookup)).toBe(100)
    expect(progressPct(['a', 'b'], lookup)).toBe(75)
  })
})
