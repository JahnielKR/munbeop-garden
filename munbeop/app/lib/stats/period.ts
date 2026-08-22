import { clampGoal } from './goal'
import { keyOfOrdinal, ordinalOf } from './activity'

export const STATS_PERIODS = [7, 30, 90, 'all'] as const

export type StatsPeriod = (typeof STATS_PERIODS)[number]

export interface PeriodInsights {
  period: StatsPeriod
  actions: number
  activeDays: number
  goalDays: number
  averagePerActiveDay: number
  goalTarget: number | null
  goalProgressPct: number | null
  previousActions: number | null
  changeFromPrevious: number | null
}

function validDayOrdinal(dayKey: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return null
  const ordinal = ordinalOf(dayKey)
  return Number.isFinite(ordinal) && keyOfOrdinal(ordinal) === dayKey ? ordinal : null
}

function actionCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function roundedAverage(total: number, days: number): number {
  return days === 0 ? 0 : Math.round((total / days) * 10) / 10
}

/**
 * A compact activity snapshot ending on `todayKey` (inclusive).
 *
 * Finite windows compare against the immediately preceding window of the same
 * length. `all` deliberately has no accumulated target or prior comparison:
 * neither has an honest equivalent when the account's history has no fixed
 * start window.
 */
export function periodInsights(
  dailyCounts: ReadonlyMap<string, number>,
  todayKey: string,
  dailyGoal: number,
  period: StatsPeriod,
): PeriodInsights {
  const todayOrdinal = validDayOrdinal(todayKey)
  if (todayOrdinal === null) throw new RangeError(`Invalid todayKey: ${todayKey}`)

  const goal = clampGoal(dailyGoal)
  const currentStart = period === 'all' ? Number.NEGATIVE_INFINITY : todayOrdinal - period + 1
  const previousEnd = period === 'all' ? null : currentStart - 1
  const previousStart = period === 'all' ? null : previousEnd! - period + 1

  let actions = 0
  let activeDays = 0
  let goalDays = 0
  let previousActions = 0

  for (const [dayKey, rawCount] of dailyCounts) {
    const ordinal = validDayOrdinal(dayKey)
    const count = actionCount(rawCount)
    if (ordinal === null || ordinal > todayOrdinal || count === 0) continue

    if (ordinal >= currentStart) {
      actions += count
      activeDays++
      if (count >= goal) goalDays++
    } else if (
      previousStart !== null &&
      previousEnd !== null &&
      ordinal >= previousStart &&
      ordinal <= previousEnd
    ) {
      previousActions += count
    }
  }

  if (period === 'all') {
    return {
      period,
      actions,
      activeDays,
      goalDays,
      averagePerActiveDay: roundedAverage(actions, activeDays),
      goalTarget: null,
      goalProgressPct: null,
      previousActions: null,
      changeFromPrevious: null,
    }
  }

  const goalTarget = period * goal
  return {
    period,
    actions,
    activeDays,
    goalDays,
    averagePerActiveDay: roundedAverage(actions, activeDays),
    goalTarget,
    goalProgressPct: Math.min(100, Math.round((actions / goalTarget) * 100)),
    previousActions,
    changeFromPrevious: actions - previousActions,
  }
}
