const DAY = 86_400_000

/**
 * Consecutive-day practice streak ending today. Days are bucketed by UTC day
 * (floor(ms / DAY)) so the result is deterministic and `now`-injectable for
 * tests. Returns 0 if there is no activity in today's bucket — the streak is
 * "current" or it's broken.
 */
export function currentStreak(dateMs: number[], now: number): number {
  const today = Math.floor(now / DAY)
  const days = new Set(dateMs.map((ms) => Math.floor(ms / DAY)))
  let streak = 0
  let cursor = today
  while (days.has(cursor)) {
    streak += 1
    cursor -= 1
  }
  return streak
}
