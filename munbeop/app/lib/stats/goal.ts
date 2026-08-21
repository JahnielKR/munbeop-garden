import { localDayKey } from './activity'

/** Default plants-per-day goal for a new user. */
export const DEFAULT_DAILY_GOAL = 3

/** Clamp a goal to a sane integer range; fall back to the default if not finite. */
export function clampGoal(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_DAILY_GOAL
  return Math.max(1, Math.min(20, Math.floor(n)))
}

/**
 * Number of practice timestamps in today's LOCAL-day bucket. Uses localDayKey
 * (not a raw UTC floor) so the goal ring agrees with the heatmap and streak,
 * which also bucket by local calendar day — otherwise a Korea (UTC+9) user's
 * ring would disagree with the heatmap for the first 9h of each day.
 */
export function todayCount(dateMs: number[], now: number): number {
  const today = localDayKey(now)
  return dateMs.filter((ms) => localDayKey(ms) === today).length
}
