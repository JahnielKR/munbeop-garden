import { localDayKey, ordinalOf } from './activity'

/**
 * Sentence counts per week for the trailing `weeks` window, oldest first and
 * the current week last. Weeks are trailing 7-LOCAL-day windows anchored to
 * today (the last bucket is today and the six local days before it), so the
 * chart agrees with the heatmap/streak instead of breaking on the raw
 * epoch-week (Thursday-UTC) boundary. `now` is injected for deterministic
 * tests. Entries outside the window are ignored.
 */
export function weeklyCounts(dateMs: number[], now: number, weeks = 8): number[] {
  const todayOrd = ordinalOf(localDayKey(now))
  const out = new Array<number>(weeks).fill(0)
  for (const ms of dateMs) {
    const weeksAgo = Math.floor((todayOrd - ordinalOf(localDayKey(ms))) / 7)
    if (weeksAgo >= 0 && weeksAgo < weeks) {
      const idx = weeks - 1 - weeksAgo
      out[idx] = (out[idx] ?? 0) + 1
    }
  }
  return out
}

/** Easy/hard split across entries, with the easy share as a rounded percentage. */
export function easyHardSplit(entries: Array<{ feedback: 'easy' | 'hard' }>): {
  easy: number
  hard: number
  easyPct: number
} {
  let easy = 0
  let hard = 0
  for (const e of entries) {
    if (e.feedback === 'easy') easy += 1
    else hard += 1
  }
  const total = easy + hard
  return { easy, hard, easyPct: total ? Math.round((easy / total) * 100) : 0 }
}
