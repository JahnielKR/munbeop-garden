import { describe, it, expect } from 'vitest'
import {
  reviewIntervalDays,
  isDue,
  dueKos,
  revisitPool,
  DUE_INTERVAL_DAYS,
  DUE_MIN_INTERVAL,
} from '~/lib/srs/due'
import type { SrsState } from '~/lib/domain'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 5, 22)
const srs = (over: Partial<SrsState> = {}): SrsState => ({
  lastSeen: NOW - 3 * DAY,
  easyCount: 0,
  hardCount: 0,
  mastery: 'plant',
  ...over,
})
const seenDaysAgo = (n: number, over: Partial<SrsState> = {}) => srs({ lastSeen: NOW - n * DAY, ...over })

describe('reviewIntervalDays', () => {
  it('uses the per-mastery base when not net-hard', () => {
    expect(reviewIntervalDays(srs({ mastery: 'seedling', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.seedling)
    expect(reviewIntervalDays(srs({ mastery: 'plant', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.plant)
    expect(reviewIntervalDays(srs({ mastery: 'tree', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.tree)
  })
  it('shortens the interval when hardCount > easyCount', () => {
    expect(reviewIntervalDays(srs({ mastery: 'plant', hardCount: 2, easyCount: 0 }))).toBe(2.5) // 5 * 0.5
    expect(reviewIntervalDays(srs({ mastery: 'tree', hardCount: 3, easyCount: 1 }))).toBe(6) // 12 * 0.5
  })
  it('never goes below DUE_MIN_INTERVAL', () => {
    expect(reviewIntervalDays(srs({ mastery: 'seedling', hardCount: 2, easyCount: 0 }))).toBe(DUE_MIN_INTERVAL) // 2*0.5=1
  })
})

describe('isDue', () => {
  it('is false for a never-practiced item', () => {
    expect(isDue(srs({ lastSeen: null }), NOW)).toBe(false)
  })
  it('is due at and past the interval (plant = 5 days)', () => {
    expect(isDue(seenDaysAgo(5, { easyCount: 1 }), NOW)).toBe(true)
    expect(isDue(seenDaysAgo(6, { easyCount: 1 }), NOW)).toBe(true)
  })
  it('is not due before the interval', () => {
    expect(isDue(seenDaysAgo(4, { easyCount: 1 }), NOW)).toBe(false)
  })
  it('respects the shortened net-hard interval (2.5 days)', () => {
    expect(isDue(seenDaysAgo(3, { hardCount: 2, easyCount: 0 }), NOW)).toBe(true)
    expect(isDue(seenDaysAgo(2, { hardCount: 2, easyCount: 0 }), NOW)).toBe(false)
  })
})

describe('dueKos', () => {
  it('returns due kos most-overdue-first, excludes not-due and never-seen', () => {
    const map: Record<string, SrsState> = {
      A: seenDaysAgo(10, { easyCount: 1 }), // overdue 5
      B: seenDaysAgo(6, { easyCount: 1 }), // overdue 1
      C: seenDaysAgo(3, { easyCount: 1 }), // not due (interval 5)
      D: srs({ lastSeen: null }), // never seen
    }
    expect(dueKos(map, NOW)).toEqual(['A', 'B'])
  })
  it('empty map → empty list', () => {
    expect(dueKos({}, NOW)).toEqual([])
  })
})

describe('revisitPool', () => {
  it('pads a short due set up to min from the active pool, dedup, due-first', () => {
    expect(revisitPool(['A', 'B'], ['A', 'B', 'C', 'D'], 3)).toEqual(['A', 'B', 'C'])
  })
  it('dedups the due set before padding', () => {
    expect(revisitPool(['A', 'A'], ['A', 'B', 'C'], 3)).toEqual(['A', 'B', 'C'])
  })
  it('leaves a due set already >= min untouched', () => {
    expect(revisitPool(['A', 'B', 'C', 'D'], ['E'], 3)).toEqual(['A', 'B', 'C', 'D'])
  })
})
