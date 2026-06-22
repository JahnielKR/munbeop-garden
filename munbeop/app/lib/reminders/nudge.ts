/** A return-visit nudge: bring the user back to review when they've been away. */
export const ABSENCE_MS = 1.5 * 24 * 60 * 60 * 1000 // ~1.5 days away before we nudge
export const NUDGE_COOLDOWN_MS = 20 * 60 * 60 * 1000 // at most ~once per day
export const MIN_READY = 1

export interface NudgeInput {
  enabled: boolean
  readyCount: number
  /** Previous visit (ms); null on the first ever visit. */
  lastVisitAt: number | null
  /** Last time we nudged (ms); null if never. */
  lastNudgeAt: number | null
  now: number
}

export function shouldNudge(i: NudgeInput): boolean {
  if (!i.enabled) return false
  if (i.readyCount < MIN_READY) return false
  if (i.lastVisitAt === null) return false // first visit — never nudge
  if (i.now - i.lastVisitAt < ABSENCE_MS) return false // not away long enough
  if (i.lastNudgeAt !== null && i.now - i.lastNudgeAt < NUDGE_COOLDOWN_MS) return false
  return true
}
