import { isPendingReview, type LogEntry } from '~/lib/domain'

export interface PendingGroup {
  ko: string
  entries: LogEntry[]
}

/**
 * Group the still-pending diary entries by grammar pattern, most-struggled
 * first. Pure: only `isPendingReview` entries survive; insertion order is
 * preserved within a group, ties broken by first appearance.
 */
export function groupPendingByKo(entries: readonly LogEntry[]): PendingGroup[] {
  const byKo = new Map<string, LogEntry[]>()
  for (const e of entries) {
    if (!isPendingReview(e)) continue
    const list = byKo.get(e.ko)
    if (list) list.push(e)
    else byKo.set(e.ko, [e])
  }
  // Map preserves insertion order; sort by size desc with a stable fallback.
  return [...byKo.entries()]
    .map(([ko, list]) => ({ ko, entries: list }))
    .sort((a, b) => b.entries.length - a.entries.length)
}
