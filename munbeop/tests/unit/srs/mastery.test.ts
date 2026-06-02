import { describe, it, expect } from 'vitest'
import { freshSrs, recalculateMastery, getMasteryInfo } from '~/lib/srs/mastery'
import type { LogEntry, ReviewState, Feedback } from '~/lib/domain'

function entry(
  ko: string,
  feedback: Feedback,
  reviewState: ReviewState = 'unreviewed',
): LogEntry {
  return {
    id: Math.random(),
    ko,
    sentence: 'x',
    feedback,
    errorNote: null,
    reviewState,
    contextId: 'banmal',
    contextName: '반말',
    date: new Date().toISOString(),
  }
}

describe('freshSrs', () => {
  it('returns seedling zero', () => {
    expect(freshSrs()).toEqual({
      lastSeen: null,
      easyCount: 0,
      hardCount: 0,
      mastery: 'seedling',
    })
  })
})

describe('recalculateMastery', () => {
  it('seedling when empty', () => {
    expect(recalculateMastery('x', []).mastery).toBe('seedling')
  })

  it('ignores incorrect-reviewed entries', () => {
    const log: LogEntry[] = [
      entry('x', 'easy', 'incorrect'),
      entry('x', 'easy', 'correct'),
      entry('x', 'hard'),
    ]
    const r = recalculateMastery('x', log)
    expect(r.easyCount).toBe(1)
    expect(r.hardCount).toBe(1)
  })

  it('promotes to plant at 20 entries 12/8', () => {
    const log: LogEntry[] = [
      ...Array.from({ length: 12 }, () => entry('x', 'easy')),
      ...Array.from({ length: 8 }, () => entry('x', 'hard')),
    ]
    expect(recalculateMastery('x', log).mastery).toBe('plant')
  })

  it('stays seedling at 19', () => {
    const log: LogEntry[] = [
      ...Array.from({ length: 12 }, () => entry('x', 'easy')),
      ...Array.from({ length: 7 }, () => entry('x', 'hard')),
    ]
    expect(recalculateMastery('x', log).mastery).toBe('seedling')
  })

  it('promotes to tree at 60 (50 easy / 10 hard)', () => {
    const log: LogEntry[] = [
      ...Array.from({ length: 50 }, () => entry('x', 'easy')),
      ...Array.from({ length: 10 }, () => entry('x', 'hard')),
    ]
    expect(recalculateMastery('x', log).mastery).toBe('tree')
  })

  it('filters by ko', () => {
    const log: LogEntry[] = [
      ...Array.from({ length: 15 }, () => entry('a', 'easy')),
      ...Array.from({ length: 15 }, () => entry('b', 'easy')),
    ]
    expect(recalculateMastery('a', log).easyCount).toBe(15)
  })
})

describe('getMasteryInfo', () => {
  it('seedling', () => {
    expect(getMasteryInfo('seedling').emoji).toBe('🌱')
    expect(getMasteryInfo('seedling').labelKey).toBe('mastery.seedling')
  })
  it('plant', () => {
    expect(getMasteryInfo('plant').emoji).toBe('🌿')
  })
  it('tree', () => {
    expect(getMasteryInfo('tree').emoji).toBe('🌳')
  })
})
