import { describe, it, expect } from 'vitest'
import { currentStreak, longestStreak } from '~/lib/stats/streak'

// day keys as YYYY-MM-DD
const k = (d: number) => `2026-06-${String(d).padStart(2, '0')}`

describe('currentStreak', () => {
  const today = k(26)
  it('counts consecutive days ending today', () => {
    expect(currentStreak(new Set([k(26), k(25), k(24)]), today)).toBe(3)
  })
  it('is 0 when today has no entry (grace 0)', () => {
    expect(currentStreak(new Set([k(25), k(24)]), today)).toBe(0)
  })
  it('stops at the first gap', () => {
    expect(currentStreak(new Set([k(26), k(24)]), today)).toBe(1)
  })
  it('is 0 for no entries', () => {
    expect(currentStreak(new Set(), today)).toBe(0)
  })
  it('bridges a single missed day with one grace day', () => {
    expect(currentStreak(new Set([k(26), k(24)]), today, 1)).toBe(2)
  })
  it('keeps the streak alive mid-day before today is done (grace bridges today)', () => {
    expect(currentStreak(new Set([k(25), k(24)]), today, 1)).toBe(2)
  })
  it('breaks on two consecutive missed days even with one grace', () => {
    expect(currentStreak(new Set([k(26), k(23)]), today, 1)).toBe(1)
  })
  it("treats a single day as streak 1 (dedup is the caller's job via Set)", () => {
    expect(currentStreak(new Set([k(26)]), today)).toBe(1)
  })
})

describe('longestStreak', () => {
  it('finds the longest run of consecutive days', () => {
    // 24-25-26 (run 3) and 20-21 (run 2) → 3
    expect(longestStreak(new Set([k(20), k(21), k(24), k(25), k(26)]))).toBe(3)
  })
  it('is 0 for no entries', () => {
    expect(longestStreak(new Set())).toBe(0)
  })
  it('is 1 for a single day', () => {
    expect(longestStreak(new Set([k(10)]))).toBe(1)
  })
  it('counts a run across a month boundary', () => {
    expect(longestStreak(new Set(['2026-06-30', '2026-07-01', '2026-07-02']))).toBe(3)
  })
})
