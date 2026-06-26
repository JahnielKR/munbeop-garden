const DAY = 86_400_000

/** Per-local-day activity tally row value. */
export interface ActivityDay {
  count: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A timestamp's LOCAL calendar day as `YYYY-MM-DD`. */
export function localDayKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** A calendar-day key as a TZ-free integer ordinal (days since epoch). */
export function ordinalOf(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number) as [number, number, number]
  return Math.floor(Date.UTC(y, m - 1, d) / DAY)
}

/** An ordinal back to a `YYYY-MM-DD` key (UTC, the inverse of ordinalOf). */
export function keyOfOrdinal(ord: number): string {
  const d = new Date(ord * DAY)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/**
 * Per-day study count, merging the existing practice log with the new activity
 * tally as a `max`: pre-feature days have only log rows (backfill), post-feature
 * days have an activity tick per answer (>= log), so max never double-counts.
 */
export function mergedDailyCounts(
  logDateMs: number[],
  activity: Record<string, ActivityDay>,
): Map<string, number> {
  const log = new Map<string, number>()
  for (const ms of logDateMs) {
    const k = localDayKey(ms)
    log.set(k, (log.get(k) ?? 0) + 1)
  }
  const out = new Map<string, number>()
  for (const [k, v] of log) out.set(k, v)
  for (const k of Object.keys(activity)) {
    out.set(k, Math.max(out.get(k) ?? 0, activity[k]!.count))
  }
  return out
}

/** Ramp level 0..4 for a day's count. */
// Ramp: 1-2 light, 3-4 moderate, 5-7 solid, 8+ heavy.
export function intensityBucket(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 7) return 3
  return 4
}

export function daysActive(counts: Map<string, number>): number {
  let n = 0
  for (const v of counts.values()) if (v > 0) n++
  return n
}

export function dailyAverage(counts: Map<string, number>): number {
  const active = daysActive(counts)
  if (active === 0) return 0
  let total = 0
  for (const v of counts.values()) total += v
  return Math.round(total / active)
}

export interface HeatCell {
  dayKey: string
  count: number
  inYear: boolean
  future: boolean
}
export interface MonthLabel {
  col: number
  label: string
}
export interface YearGrid {
  weeks: HeatCell[][]
  months: MonthLabel[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Monday-first weekday-row grid for one calendar `year`, capped at `todayKey`.
 * Columns are weeks; each column is 7 cells (Mon..Sun). `inYear` is false for
 * leading/trailing padding days from adjacent years; `future` masks days after
 * today. `months[].label` is a localizable fallback (the component prefers
 * Intl), keyed to the column where a new month starts.
 */
export function yearGrid(counts: Map<string, number>, year: number, todayKey: string): YearGrid {
  const todayOrd = ordinalOf(todayKey)
  const jan1Ord = ordinalOf(`${year}-01-01`)
  const jsDow = new Date(Date.UTC(year, 0, 1)).getUTCDay() // 0=Sun..6=Sat
  const monIndex = (jsDow + 6) % 7 // 0=Mon..6=Sun
  const gridStart = jan1Ord - monIndex
  const dec31Ord = ordinalOf(`${year}-12-31`)
  const numWeeks = Math.max(1, Math.ceil((dec31Ord - gridStart + 1) / 7))

  const weeks: HeatCell[][] = []
  const months: MonthLabel[] = []
  let lastMonth = -1
  for (let col = 0; col < numWeeks; col++) {
    const week: HeatCell[] = []
    for (let row = 0; row < 7; row++) {
      const ord = gridStart + col * 7 + row
      const dayKey = keyOfOrdinal(ord)
      const cellYear = Number(dayKey.slice(0, 4))
      week.push({
        dayKey,
        count: counts.get(dayKey) ?? 0,
        inYear: cellYear === year,
        future: ord > todayOrd,
      })
    }
    const firstInYear = week.find((c) => c.inYear)
    if (firstInYear) {
      const mo = Number(firstInYear.dayKey.slice(5, 7)) - 1
      if (mo !== lastMonth) {
        months.push({ col, label: MONTHS[mo]! })
        lastMonth = mo
      }
    }
    weeks.push(week)
  }
  return { weeks, months }
}
