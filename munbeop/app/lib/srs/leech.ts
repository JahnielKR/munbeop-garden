import type { ErrorDimension, Grammar, LocalizedString, LogEntry } from '~/lib/domain'
import { ERROR_DIMENSIONS } from '~/lib/domain'

/** How many of a grammar's most-recent reviews define its "recent window". */
export const LEECH_WINDOW = 8
/** Minimum reviews in the window before we'll judge a grammar at all (anti-noise). */
export const LEECH_MIN_REVIEWS = 4
/** A grammar is a leech when at least this share of its recent window felt hard. */
export const LEECH_HARD_RATIO = 0.5

export interface Leech {
  ko: string
  /** Catalog meaning for display; undefined for custom/unknown grammar. */
  meaning: LocalizedString | undefined
  /** hard / (easy + hard) within the recent window, 0..1. */
  recentHardRatio: number
  /** Window size actually used (>= LEECH_MIN_REVIEWS). */
  recentReviews: number
  /** Modal errorDimension among the window's hard entries; null if none tagged. */
  dominantDimension: ErrorDimension | null
}

/**
 * Struggling-plant detection. A leech is a grammar whose *recent* reviews are
 * mostly hard — derived purely from the log so it self-heals once the user logs
 * easier reviews (the recent window slides past the old hard ones). Entries
 * flagged 'incorrect' in review are excluded, mirroring recalculateMastery.
 *
 * No clock needed: the window is the most-recent N entries by date, not a
 * time span — an abandoned hard item stays flagged (it IS still unmastered) but
 * the set is bounded and clears the moment the user practices it well again.
 */
export function detectLeeches(
  log: readonly LogEntry[],
  grammars: readonly Grammar[],
): Leech[] {
  const byKo = new Map<string, LogEntry[]>()
  for (const entry of log) {
    if (entry.reviewState === 'incorrect') continue
    const list = byKo.get(entry.ko)
    if (list) list.push(entry)
    else byKo.set(entry.ko, [entry])
  }

  const meaningOf = new Map(grammars.map((g) => [g.ko, g.meaning]))
  const leeches: Leech[] = []

  for (const [ko, entries] of byKo) {
    const windowEntries = entries
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-LEECH_WINDOW)
    if (windowEntries.length < LEECH_MIN_REVIEWS) continue

    let hard = 0
    const dimCounts = new Map<ErrorDimension, number>()
    for (const entry of windowEntries) {
      if (entry.feedback !== 'hard') continue
      hard++
      if (entry.errorDimension) {
        dimCounts.set(entry.errorDimension, (dimCounts.get(entry.errorDimension) ?? 0) + 1)
      }
    }

    const recentHardRatio = hard / windowEntries.length
    if (recentHardRatio < LEECH_HARD_RATIO) continue

    let dominantDimension: ErrorDimension | null = null
    let best = 0
    for (const dim of ERROR_DIMENSIONS) {
      const count = dimCounts.get(dim) ?? 0
      if (count > best) {
        best = count
        dominantDimension = dim
      }
    }

    leeches.push({
      ko,
      meaning: meaningOf.get(ko),
      recentHardRatio,
      recentReviews: windowEntries.length,
      dominantDimension,
    })
  }

  leeches.sort(
    (a, b) =>
      b.recentHardRatio - a.recentHardRatio ||
      b.recentReviews - a.recentReviews ||
      a.ko.localeCompare(b.ko),
  )
  return leeches
}
