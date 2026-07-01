import { describe, it, expect } from 'vitest'
import { weeklyCounts, easyHardSplit } from '~/lib/stats/rhythm'

const now = 1_700_000_000_000
// A timestamp at LOCAL midday, `daysAgo` local calendar days before `now`.
// Weeks are trailing 7-local-day windows anchored to today, so building off the
// local day keeps the test deterministic in any runner timezone.
const daysAgoMs = (daysAgo: number) => {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return d.getTime()
}

describe('weeklyCounts', () => {
  it('returns one bucket per week, oldest first, current week last', () => {
    const out = weeklyCounts([], now, 8)
    expect(out).toHaveLength(8)
    expect(out.every((n) => n === 0)).toBe(true)
  })

  it('buckets entries into the right trailing week and counts multiples', () => {
    // today (0d) and 14 days ago (=2 weeks); the 14d entry is two buckets back.
    const out = weeklyCounts([daysAgoMs(0), daysAgoMs(0), daysAgoMs(14)], now, 8)
    expect(out[7]).toBe(2) // current week (today + prior 6 local days)
    expect(out[5]).toBe(1) // two weeks ago
    expect(out[6]).toBe(0)
  })

  it('groups the whole trailing 7-day window into the current bucket', () => {
    // 0..6 local days ago all fall in the last bucket; 7 days ago rolls to the prior.
    const out = weeklyCounts([daysAgoMs(0), daysAgoMs(6), daysAgoMs(7)], now, 8)
    expect(out[7]).toBe(2)
    expect(out[6]).toBe(1)
  })

  it('ignores entries older than the window', () => {
    const out = weeklyCounts([daysAgoMs(20 * 7)], now, 8)
    expect(out.reduce((a, b) => a + b, 0)).toBe(0)
  })
})

describe('easyHardSplit', () => {
  it('counts easy/hard and rounds the easy percentage', () => {
    expect(easyHardSplit([{ feedback: 'easy' }, { feedback: 'easy' }, { feedback: 'hard' }])).toEqual({
      easy: 2,
      hard: 1,
      easyPct: 67,
    })
  })

  it('is all-zero for no entries (no divide-by-zero)', () => {
    expect(easyHardSplit([])).toEqual({ easy: 0, hard: 0, easyPct: 0 })
  })
})
