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

/**
 * Best historical run, using the same grace budget as currentStreak.
 * Keeping both metrics on one rule prevents impossible UI such as current 2 /
 * record 1 when mulch bridges a single missed day.
 */
export function longestStreak(dayKeys: Set<string>, graceDays = 0): number {
  const ords = [...dayKeys].map(ordinalOf).sort((a, b) => a - b)
  if (ords.length === 0) return 0
  let best = 0
  let left = 0
  for (let right = 0; right < ords.length; right++) {
    while (ords[right]! - ords[left]! + 1 - (right - left + 1) > graceDays) left++
    best = Math.max(best, right - left + 1)
  }
  return best
}
