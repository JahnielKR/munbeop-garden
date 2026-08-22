import { describe, it, expect } from 'vitest'
import {
  localDayKey,
  ordinalOf,
  mergedDailyCounts,
  boundedActivityCounts,
  intensityBucket,
  daysActive,
  dailyAverage,
  yearGrid,
} from '~/lib/stats/activity'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

describe('localDayKey', () => {
  it('formats the local calendar day as YYYY-MM-DD', () => {
    expect(localDayKey(at(2026, 6, 26))).toBe('2026-06-26')
    expect(localDayKey(at(2026, 1, 3))).toBe('2026-01-03')
  })
})

describe('ordinalOf', () => {
  it('is consecutive across a month boundary', () => {
    expect(ordinalOf('2026-01-31') + 1).toBe(ordinalOf('2026-02-01'))
  })
  it('is consecutive across a year boundary', () => {
    expect(ordinalOf('2025-12-31') + 1).toBe(ordinalOf('2026-01-01'))
  })
})

describe('mergedDailyCounts', () => {
  it('takes the max of log-day count and activity count per day', () => {
    const logMs = [at(2026, 6, 26), at(2026, 6, 26), at(2026, 6, 25)] // 26:2, 25:1
    const activity = { '2026-06-26': { count: 1 }, '2026-06-24': { count: 3 } }
    const m = mergedDailyCounts(logMs, activity)
    expect(m.get('2026-06-26')).toBe(2) // max(2 log, 1 activity)
    expect(m.get('2026-06-25')).toBe(1) // log only
    expect(m.get('2026-06-24')).toBe(3) // activity only (pre-/post backfill)
  })

  it('drops zero, negative and non-finite activity rows', () => {
    const m = mergedDailyCounts([], {
      '2026-06-24': { count: 0 },
      '2026-06-25': { count: -2 },
      '2026-06-26': { count: Number.NaN },
    })
    expect(m.size).toBe(0)
  })

  it('uses a captured local day without reinterpreting its timestamp', () => {
    const m = mergedDailyCounts(['2026-08-23'], {})
    expect([...m]).toEqual([['2026-08-23', 1]])
  })
})

describe('boundedActivityCounts', () => {
  it('keeps only positive counts through today', () => {
    const counts = new Map([
      ['2026-06-24', 2],
      ['2026-06-25', 0],
      ['2026-06-27', 9],
    ])
    expect([...boundedActivityCounts(counts, '2026-06-26')]).toEqual([['2026-06-24', 2]])
  })
})

describe('intensityBucket', () => {
  it('maps counts to 0..4', () => {
    expect([0, 1, 2, 3, 5, 8].map(intensityBucket)).toEqual([0, 1, 1, 2, 3, 4])
  })
})

describe('daysActive / dailyAverage', () => {
  const m = new Map([
    ['2026-06-26', 4],
    ['2026-06-25', 2],
  ])
  it('counts active days', () => expect(daysActive(m)).toBe(2))
  it('averages over active days, rounded', () => expect(dailyAverage(m)).toBe(3))
  it('is 0 over no active days', () => expect(dailyAverage(new Map())).toBe(0))
  it('does not add non-positive rows to the average numerator', () => {
    expect(
      dailyAverage(
        new Map([
          ['a', 4],
          ['b', -20],
        ]),
      ),
    ).toBe(4)
  })
})

describe('yearGrid', () => {
  it('lays out 7-row weekday columns, masks future days, labels months', () => {
    const counts = new Map([['2026-06-26', 5]])
    const grid = yearGrid(counts, 2026, '2026-06-26')
    expect(grid.weeks.length).toBeGreaterThanOrEqual(52)
    const cells = grid.weeks.flat()
    const cell = cells.find((c) => c.dayKey === '2026-06-26')!
    expect(cell.count).toBe(5)
    expect(cell.future).toBe(false)
    // a day after "today" within the year is masked as future
    expect(cells.find((c) => c.dayKey === '2026-12-31')!.future).toBe(true)
    expect(grid.months.some((mo) => mo.label.length > 0)).toBe(true)
    expect(grid.weeks.every((w) => w.length === 7)).toBe(true)
  })

  it('anchors each month label to the week containing its first day', () => {
    const grid = yearGrid(new Map(), 2026, '2026-12-31')
    for (const month of grid.months) {
      expect(grid.weeks[month.col]!.some((cell) => cell.dayKey.endsWith('-01'))).toBe(true)
    }
    expect(grid.months).toHaveLength(12)
  })
})
