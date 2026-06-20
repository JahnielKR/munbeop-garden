const DAY = 86_400_000

/** Default grace ("mulch"): how many missed days a streak tolerates. */
export const STREAK_GRACE_DAYS = 1

/**
 * Consecutive-day practice streak ending today. Days are bucketed by UTC day
 * (floor(ms / DAY)) so the result is deterministic and `now`-injectable for
 * tests. Walking back from today, an inactive day is bridged by spending a
 * `graceDays` ("mulch") instead of breaking the chain, until grace runs out.
 * `graceDays = 0` is the strict consecutive streak.
 */
export function currentStreak(dateMs: number[], now: number, graceDays = 0): number {
  const today = Math.floor(now / DAY)
  const days = new Set(dateMs.map((ms) => Math.floor(ms / DAY)))
  let streak = 0
  let grace = graceDays
  let cursor = today
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
