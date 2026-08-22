import { describe, expect, it } from 'vitest'
import { keyOfOrdinal, ordinalOf } from '~/lib/stats/activity'
import { periodInsights, type StatsPeriod } from '~/lib/stats/period'

const TODAY = '2026-08-22'
const day = (offset: number) => keyOfOrdinal(ordinalOf(TODAY) + offset)

describe('periodInsights', () => {
  it('uses inclusive current boundaries and the adjacent previous window', () => {
    const counts = new Map([
      [day(0), 3],
      [day(-6), 5],
      [day(-7), 2],
      [day(-13), 4],
      [day(-14), 99],
    ])

    expect(periodInsights(counts, TODAY, 3, 7)).toEqual({
      period: 7,
      actions: 8,
      activeDays: 2,
      goalDays: 2,
      averagePerActiveDay: 4,
      goalTarget: 21,
      goalProgressPct: 38,
      previousActions: 6,
      changeFromPrevious: 2,
    })
  })

  it.each<StatsPeriod>([7, 30, 90])('honours both exact boundaries for %s days', (period) => {
    const days = period as number
    const counts = new Map([
      [day(0), 1],
      [day(-(days - 1)), 2],
      [day(-days), 4],
      [day(-(days * 2 - 1)), 8],
      [day(-(days * 2)), 16],
    ])

    const result = periodInsights(counts, TODAY, 2, period)
    expect(result.actions).toBe(3)
    expect(result.previousActions).toBe(12)
    expect(result.changeFromPrevious).toBe(-9)
    expect(result.goalTarget).toBe(days * 2)
  })

  it('excludes future, zero, negative, fractional residue and invalid dates', () => {
    const counts = new Map([
      [day(1), 50],
      [day(0), 2.9],
      [day(-1), 0],
      [day(-2), -3],
      ['2026-02-30', 20],
      ['not-a-day', 20],
      [day(-7), Number.NaN],
    ])

    const result = periodInsights(counts, TODAY, 2, 7)
    expect(result.actions).toBe(2)
    expect(result.activeDays).toBe(1)
    expect(result.goalDays).toBe(1)
    expect(result.previousActions).toBe(0)
  })

  it('reports a positive absolute change when the previous period is empty', () => {
    const result = periodInsights(new Map([[TODAY, 5]]), TODAY, 3, 7)
    expect(result.previousActions).toBe(0)
    expect(result.changeFromPrevious).toBe(5)
  })

  it('reports a negative change and zero current averages when only the previous period has data', () => {
    const result = periodInsights(new Map([[day(-7), 5]]), TODAY, 3, 7)
    expect(result.actions).toBe(0)
    expect(result.activeDays).toBe(0)
    expect(result.averagePerActiveDay).toBe(0)
    expect(result.goalProgressPct).toBe(0)
    expect(result.changeFromPrevious).toBe(-5)
  })

  it('rounds the active-day average to one decimal and caps visual goal progress', () => {
    const result = periodInsights(
      new Map([
        [TODAY, 20],
        [day(-1), 3],
        [day(-2), 2],
      ]),
      TODAY,
      1,
      7,
    )
    expect(result.averagePerActiveDay).toBe(8.3)
    expect(result.goalProgressPct).toBe(100)
    expect(result.goalDays).toBe(3)
  })

  it('covers all history through today without fabricating a target or comparison', () => {
    const result = periodInsights(
      new Map([
        ['2020-02-29', 4],
        [TODAY, 2],
        [day(1), 100],
      ]),
      TODAY,
      3,
      'all',
    )

    expect(result).toEqual({
      period: 'all',
      actions: 6,
      activeDays: 2,
      goalDays: 1,
      averagePerActiveDay: 3,
      goalTarget: null,
      goalProgressPct: null,
      previousActions: null,
      changeFromPrevious: null,
    })
  })

  it('rejects an invalid anchor day instead of silently shifting the window', () => {
    expect(() => periodInsights(new Map(), '2026-02-30', 3, 7)).toThrow(RangeError)
  })
})
