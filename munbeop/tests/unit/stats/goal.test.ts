import { describe, it, expect } from 'vitest'
import { DEFAULT_DAILY_GOAL, clampGoal, todayCount } from '~/lib/stats/goal'

const now = 1_700_000_000_000
// A timestamp at LOCAL midday, `k` local calendar days before `now`. Building
// off the local day (not a UTC floor) keeps the test deterministic in any
// runner timezone — the machine is UTC+9, CI is UTC, and todayCount now buckets
// by local day.
const dayMs = (k: number) => {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - k)
  return d.getTime()
}

describe('clampGoal', () => {
  it('clamps to [1, 20] and floors', () => {
    expect(clampGoal(0)).toBe(1)
    expect(clampGoal(99)).toBe(20)
    expect(clampGoal(3.9)).toBe(3)
  })
  it('falls back to the default for non-finite input', () => {
    expect(clampGoal(NaN)).toBe(DEFAULT_DAILY_GOAL)
  })
})

describe('todayCount', () => {
  it('counts only entries in today’s bucket', () => {
    expect(todayCount([dayMs(0), dayMs(0), dayMs(1), dayMs(3)], now)).toBe(2)
  })
  it('is 0 with no entries today', () => {
    expect(todayCount([dayMs(1), dayMs(2)], now)).toBe(0)
  })
})
