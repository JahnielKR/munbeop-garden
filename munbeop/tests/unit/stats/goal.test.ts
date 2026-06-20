import { describe, it, expect } from 'vitest'
import { DEFAULT_DAILY_GOAL, clampGoal, todayCount } from '~/lib/stats/goal'

const DAY = 86_400_000
const now = 1_700_000_000_000
const dayMs = (k: number) => (Math.floor(now / DAY) - k) * DAY + 3_600_000

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
