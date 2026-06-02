import { describe, it, expect } from 'vitest'
import { getWeight, daysSinceSeen } from '~/lib/srs/weight'
import type { SrsState } from '~/lib/domain'

const baseSrs: SrsState = { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' }

describe('getWeight', () => {
  it('seedling never seen gets highest weight class', () => {
    expect(getWeight(baseSrs, Date.now())).toBeGreaterThan(5)
  })

  it('tree just seen < seedling just seen', () => {
    const now = Date.now()
    const seed: SrsState = { lastSeen: now, easyCount: 0, hardCount: 0, mastery: 'seedling' }
    const tree: SrsState = { lastSeen: now, easyCount: 10, hardCount: 0, mastery: 'tree' }
    expect(getWeight(seed, now)).toBeGreaterThan(getWeight(tree, now))
  })

  it('older lastSeen → larger weight up to cap', () => {
    const now = Date.now()
    const recent: SrsState = { ...baseSrs, lastSeen: now - 86_400_000, mastery: 'plant' }
    const old: SrsState = { ...baseSrs, lastSeen: now - 30 * 86_400_000, mastery: 'plant' }
    expect(getWeight(old, now)).toBeGreaterThan(getWeight(recent, now))
  })

  it('hard-heavy > easy-heavy', () => {
    const now = Date.now()
    const hard: SrsState = { lastSeen: now, easyCount: 2, hardCount: 8, mastery: 'plant' }
    const easy: SrsState = { lastSeen: now, easyCount: 8, hardCount: 2, mastery: 'plant' }
    expect(getWeight(hard, now)).toBeGreaterThan(getWeight(easy, now))
  })

  it('never below floor 0.1', () => {
    const now = Date.now()
    const dom: SrsState = { lastSeen: now, easyCount: 100, hardCount: 0, mastery: 'tree' }
    expect(getWeight(dom, now)).toBeGreaterThanOrEqual(0.1)
  })
})

describe('daysSinceSeen', () => {
  it('null when never seen', () => {
    expect(daysSinceSeen(null, Date.now())).toBeNull()
  })

  it('0 for today', () => {
    const now = Date.now()
    expect(daysSinceSeen(now - 1000, now)).toBe(0)
  })

  it('floors partial day', () => {
    const now = Date.now()
    expect(daysSinceSeen(now - 1.5 * 86_400_000, now)).toBe(1)
  })
})
