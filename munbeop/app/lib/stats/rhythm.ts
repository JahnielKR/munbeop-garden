const WEEK = 7 * 86_400_000

/**
 * Sentence counts per week for the trailing `weeks` window, oldest first and
 * the current week last. Weeks are bucketed by floor(ms / WEEK); `now` is
 * injected for deterministic tests. Entries outside the window are ignored.
 */
export function weeklyCounts(dateMs: number[], now: number, weeks = 8): number[] {
  const current = Math.floor(now / WEEK)
  const start = current - (weeks - 1)
  const out = new Array<number>(weeks).fill(0)
  for (const ms of dateMs) {
    const w = Math.floor(ms / WEEK)
    if (w >= start && w <= current) out[w - start] = (out[w - start] ?? 0) + 1
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
