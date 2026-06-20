import { describe, it, expect } from 'vitest'
import { currentStreak } from '~/lib/stats/streak'

const DAY = 86_400_000
const now = 1_700_000_000_000
// k days ago, anchored safely inside that UTC day bucket.
const dayMs = (k: number) => (Math.floor(now / DAY) - k) * DAY + 3_600_000

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak([dayMs(0), dayMs(1), dayMs(2)], now)).toBe(3)
  })

  it('collapses multiple entries on the same day to one', () => {
    expect(currentStreak([dayMs(0), dayMs(0), dayMs(1)], now)).toBe(2)
  })

  it('is 0 when there is no entry today, even if yesterday had one', () => {
    expect(currentStreak([dayMs(1), dayMs(2)], now)).toBe(0)
  })

  it('stops at the first gap', () => {
    // today + 2-days-ago, but yesterday missing → only today counts
    expect(currentStreak([dayMs(0), dayMs(2)], now)).toBe(1)
  })

  it('is 0 for no entries', () => {
    expect(currentStreak([], now)).toBe(0)
  })

  it('bridges a single missed day with one grace day', () => {
    // today + 2-days-ago, yesterday missing; grace=1 bridges yesterday
    expect(currentStreak([dayMs(0), dayMs(2)], now, 1)).toBe(2)
  })

  it('keeps the streak alive mid-day before today is done (grace bridges today)', () => {
    expect(currentStreak([dayMs(1), dayMs(2)], now, 1)).toBe(2)
  })

  it('breaks on two consecutive missed days even with one grace', () => {
    expect(currentStreak([dayMs(0), dayMs(3)], now, 1)).toBe(1)
  })

  it('graceDays defaults to 0 (unchanged behavior)', () => {
    expect(currentStreak([dayMs(0), dayMs(2)], now)).toBe(1)
  })
})
