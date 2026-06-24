import type { LogEntry, SrsState } from '~/lib/domain'

/**
 * Per-grammar achievement badges — celebratory milestones derived on the fly
 * from a point's SRS state + its log entries. NO persistence: a badge is "earned"
 * iff the live data satisfies it. Distinct from the global trophy case (those are
 * escape-room cosmetics) and from the dry SRS stats rows (same data, but framed
 * as a glanceable case to fill).
 */
export type AchievementId =
  | 'sprouted'
  | 'practiced_10'
  | 'practiced_25'
  | 'streak_5'
  | 'comeback'
  | 'mastered'

export interface Achievement {
  id: AchievementId
  earned: boolean
}

export const PRACTICE_10 = 10
export const PRACTICE_25 = 25
export const STREAK_TARGET = 5
const COMEBACK_MIN_HARD = 3
const COMEBACK_MIN_STREAK = 3

/** Count of trailing 'easy' reviews (most-recent-first), stopped by a 'hard' or
 *  an 'incorrect' review — the current clean run on this point. */
export function trailingEasyStreak(entries: readonly LogEntry[]): number {
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let n = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    const e = sorted[i]!
    if (e.reviewState === 'incorrect' || e.feedback !== 'easy') break
    n++
  }
  return n
}

/**
 * The badge set for one grammar point. `koLog` is the log already filtered to the
 * point (caller filters by ko). Order is fixed for a stable display.
 */
export function achievementsFor(srs: SrsState, koLog: readonly LogEntry[]): Achievement[] {
  const times = koLog.length
  const streak = trailingEasyStreak(koLog)
  // "Comeback": genuinely struggled before (real hard history) and is now on a
  // clean run again — a per-grammar recovery, not the global leech set.
  const comeback = srs.hardCount >= COMEBACK_MIN_HARD && streak >= COMEBACK_MIN_STREAK
  return [
    { id: 'sprouted', earned: times >= 1 },
    { id: 'practiced_10', earned: times >= PRACTICE_10 },
    { id: 'practiced_25', earned: times >= PRACTICE_25 },
    { id: 'streak_5', earned: streak >= STREAK_TARGET },
    { id: 'comeback', earned: comeback },
    { id: 'mastered', earned: srs.mastery === 'tree' },
  ]
}
