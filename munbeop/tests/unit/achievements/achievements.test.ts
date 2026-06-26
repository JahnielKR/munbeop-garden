import { describe, it, expect } from 'vitest'
import { achievementsFor, trailingEasyStreak, type AchievementId } from '~/lib/achievements'
import type { LogEntry, SrsState, Feedback, ReviewState, MasteryLevel } from '~/lib/domain'

let seq = 0
function entry(feedback: Feedback, reviewState: ReviewState = 'unreviewed'): LogEntry {
  const i = seq++
  return {
    id: i,
    ko: '-지만',
    sentence: 's' + i,
    feedback,
    errorNote: null,
    reviewState,
    contextId: 'c',
    contextName: 'C',
    // strictly increasing dates so sort order is deterministic
    date: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
  }
}
function srs(p: Partial<SrsState> = {}): SrsState {
  return { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' as MasteryLevel, ...p }
}
function earnedSet(srsState: SrsState, log: LogEntry[]): Set<AchievementId> {
  return new Set(achievementsFor(srsState, log).filter((a) => a.earned).map((a) => a.id))
}

describe('trailingEasyStreak', () => {
  it('counts trailing easy reviews and stops at a hard one', () => {
    expect(trailingEasyStreak([entry('hard'), entry('easy'), entry('easy')])).toBe(2)
  })
  it('an incorrect review breaks the streak even if marked easy', () => {
    expect(trailingEasyStreak([entry('easy'), entry('easy', 'incorrect'), entry('easy')])).toBe(1)
  })
  it('is zero when the latest review is hard', () => {
    expect(trailingEasyStreak([entry('easy'), entry('easy'), entry('hard')])).toBe(0)
  })
})

describe('achievementsFor', () => {
  it('earns nothing for a fresh, never-practiced point', () => {
    expect(earnedSet(srs(), [])).toEqual(new Set())
  })

  it('sprouts on the first practice', () => {
    expect(earnedSet(srs(), [entry('hard')])).toEqual(new Set(['sprouted']))
  })

  it('unlocks the practice-count tiers at 10 and 25', () => {
    const ten = Array.from({ length: 10 }, () => entry('hard'))
    expect(earnedSet(srs(), ten).has('practiced_10')).toBe(true)
    expect(earnedSet(srs(), ten).has('practiced_25')).toBe(false)
    const twentyFive = Array.from({ length: 25 }, () => entry('hard'))
    expect(earnedSet(srs(), twentyFive).has('practiced_25')).toBe(true)
  })

  it('earns the 5-streak only on five trailing easy reviews', () => {
    const four = Array.from({ length: 4 }, () => entry('easy'))
    expect(earnedSet(srs(), four).has('streak_5')).toBe(false)
    const five = Array.from({ length: 5 }, () => entry('easy'))
    expect(earnedSet(srs(), five).has('streak_5')).toBe(true)
  })

  it('earns mastered only at tree mastery', () => {
    expect(earnedSet(srs({ mastery: 'plant' }), [entry('easy')]).has('mastered')).toBe(false)
    expect(earnedSet(srs({ mastery: 'tree' }), [entry('easy')]).has('mastered')).toBe(true)
  })

  it('earns comeback after real struggle followed by a clean run', () => {
    const log = [entry('hard'), entry('easy'), entry('easy'), entry('easy')]
    // hardCount reflects past struggle; trailing streak = 3 easy
    expect(earnedSet(srs({ hardCount: 3 }), log).has('comeback')).toBe(true)
    // no struggle history -> no comeback even with a clean run
    expect(earnedSet(srs({ hardCount: 0 }), log).has('comeback')).toBe(false)
  })

  it('takes root once the point reaches plant (or tree) mastery', () => {
    expect(earnedSet(srs({ mastery: 'seedling' }), [entry('easy')]).has('taking_root')).toBe(false)
    expect(earnedSet(srs({ mastery: 'plant' }), [entry('easy')]).has('taking_root')).toBe(true)
    expect(earnedSet(srs({ mastery: 'tree' }), [entry('easy')]).has('taking_root')).toBe(true)
  })

  it('unlocks the 50× tier only at fifty practices', () => {
    const fortyNine = Array.from({ length: 49 }, () => entry('hard'))
    expect(earnedSet(srs(), fortyNine).has('practiced_50')).toBe(false)
    const fifty = Array.from({ length: 50 }, () => entry('hard'))
    expect(earnedSet(srs(), fifty).has('practiced_50')).toBe(true)
  })

  it('earns flawless on 8+ reviews with no hard history, never with one', () => {
    const eight = Array.from({ length: 8 }, () => entry('easy'))
    expect(earnedSet(srs({ hardCount: 0 }), eight).has('flawless')).toBe(true)
    const seven = Array.from({ length: 7 }, () => entry('easy'))
    expect(earnedSet(srs({ hardCount: 0 }), seven).has('flawless')).toBe(false)
    expect(earnedSet(srs({ hardCount: 1 }), eight).has('flawless')).toBe(false)
  })

  it('always returns the nine badges in a stable order', () => {
    const ids = achievementsFor(srs(), []).map((a) => a.id)
    expect(ids).toEqual([
      'sprouted', 'taking_root', 'practiced_10', 'practiced_25', 'practiced_50',
      'streak_5', 'flawless', 'comeback', 'mastered',
    ])
  })
})
