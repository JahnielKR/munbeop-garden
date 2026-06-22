import type { MasteryLevel, SrsState } from '~/lib/domain'
import { daysSinceSeen } from './weight'

/** Base review interval per mastery tier, in days. Tunable. */
export const DUE_INTERVAL_DAYS: Record<MasteryLevel, number> = { seedling: 2, plant: 5, tree: 12 }
/** Net-hard items (more hard than easy) come due sooner. */
export const DUE_HARD_SHORTEN = 0.5
/** Floor so a struggled seedling never comes due more than once a day. */
export const DUE_MIN_INTERVAL = 1
/** Calm ceiling for the displayed "ready" number. */
export const READY_DISPLAY_CAP = 9

/** Days until this item is "ready to revisit", per mastery, shortened when net-hard. */
export function reviewIntervalDays(srs: SrsState): number {
  const base = DUE_INTERVAL_DAYS[srs.mastery]
  const shortened = srs.hardCount > srs.easyCount ? base * DUE_HARD_SHORTEN : base
  return Math.max(DUE_MIN_INTERVAL, shortened)
}

/** Ready iff practiced at least once and its interval has elapsed. */
export function isDue(srs: SrsState, now: number): boolean {
  const days = daysSinceSeen(srs.lastSeen, now)
  return days !== null && days >= reviewIntervalDays(srs)
}

/** The due grammar kos, most-overdue first (then ko for a stable order). */
export function dueKos(srsMap: Record<string, SrsState>, now: number): string[] {
  return Object.entries(srsMap)
    .filter(([, s]) => isDue(s, now))
    .map(([ko, s]) => ({ ko, overdue: (daysSinceSeen(s.lastSeen, now) ?? 0) - reviewIntervalDays(s) }))
    .sort((a, b) => b.overdue - a.overdue || a.ko.localeCompare(b.ko))
    .map((x) => x.ko)
}

/**
 * Build a "revisit" draw pool: the due set (deduped, due-first), padded with
 * active-pool kos up to `min` so a session can always form even when only one
 * or two items are actually due.
 */
export function revisitPool(due: readonly string[], activeKos: readonly string[], min = 3): string[] {
  const out = [...new Set(due)]
  if (out.length >= min) return out
  const have = new Set(out)
  for (const ko of activeKos) {
    if (out.length >= min) break
    if (!have.has(ko)) {
      out.push(ko)
      have.add(ko)
    }
  }
  return out
}
