import type { SrsState } from '~/lib/domain'

/**
 * Garden progress formula (spec §4.1).
 *
 * Pure functions: callers pass the item keys and an SRS lookup, so the
 * same math runs identically for anonymous (localStorage) and logged-in
 * (Supabase) users — the garden is always DERIVED, never stored.
 */

/**
 * Contribution of one grammar item to its level/zone progress:
 * tree = 1, plant = 0.5, practiced seedling = 0.1, untouched = 0.
 */
export function itemScore(state: SrsState | undefined): number {
  if (!state) return 0
  if (state.mastery === 'tree') return 1
  if (state.mastery === 'plant') return 0.5
  const practiced = state.easyCount + state.hardCount > 0 || state.lastSeen !== null
  return practiced ? 0.1 : 0
}

/**
 * Progress 0–100 of a set of items (a level or a theme).
 * Empty sets are 0 — an empty level never unlocks its successor by default.
 */
export function progressPct(kos: string[], lookup: (ko: string) => SrsState | undefined): number {
  if (kos.length === 0) return 0
  const sum = kos.reduce((acc, ko) => acc + itemScore(lookup(ko)), 0)
  return Math.round((sum / kos.length) * 100)
}
