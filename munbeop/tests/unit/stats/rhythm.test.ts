import { describe, it, expect } from 'vitest'
import { weeklyCounts, easyHardSplit } from '~/lib/stats/rhythm'

const WEEK = 7 * 86_400_000
const now = 1_700_000_000_000
const weekMs = (k: number) => (Math.floor(now / WEEK) - k) * WEEK + 3_600_000

describe('weeklyCounts', () => {
  it('returns one bucket per week, oldest first, current week last', () => {
    const out = weeklyCounts([], now, 8)
    expect(out).toHaveLength(8)
    expect(out.every((n) => n === 0)).toBe(true)
  })

  it('buckets entries into the right week and counts multiples', () => {
    const out = weeklyCounts([weekMs(0), weekMs(0), weekMs(2)], now, 8)
    expect(out[7]).toBe(2) // current week
    expect(out[5]).toBe(1) // two weeks ago
    expect(out[6]).toBe(0)
  })

  it('ignores entries older than the window', () => {
    const out = weeklyCounts([weekMs(20)], now, 8)
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
