const DAY = 86_400_000

/** Default plants-per-day goal for a new user. */
export const DEFAULT_DAILY_GOAL = 3

/** Clamp a goal to a sane integer range; fall back to the default if not finite. */
export function clampGoal(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_DAILY_GOAL
  return Math.max(1, Math.min(20, Math.floor(n)))
}

/** Number of practice timestamps in today's UTC-day bucket. */
export function todayCount(dateMs: number[], now: number): number {
  const today = Math.floor(now / DAY)
  return dateMs.filter((ms) => Math.floor(ms / DAY) === today).length
}
