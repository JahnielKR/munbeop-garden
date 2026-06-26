import { ordinalOf } from '~/lib/stats/activity'

/** Default grace ("mulch"): how many missed days a streak tolerates. */
export const STREAK_GRACE_DAYS = 1

/**
 * Consecutive-day practice streak ending on `todayKey`, over a set of active
 * local-day keys. Walking back from today, an inactive day is bridged by
 * spending a `graceDays` ("mulch") instead of breaking, until grace runs out.
 */
export function currentStreak(dayKeys: Set<string>, todayKey: string, graceDays = 0): number {
  const days = new Set([...dayKeys].map(ordinalOf))
  let streak = 0
  let grace = graceDays
  let cursor = ordinalOf(todayKey)
  for (;;) {
    if (days.has(cursor)) {
      streak += 1
      cursor -= 1
    } else if (grace > 0) {
      grace -= 1
      cursor -= 1
    } else {
      break
    }
  }
  return streak
}

/** The longest run of consecutive active days (record streak). */
export function longestStreak(dayKeys: Set<string>): number {
  const ords = [...dayKeys].map(ordinalOf).sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = Number.NEGATIVE_INFINITY
  for (const o of ords) {
    run = o === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = o
  }
  return best
}
