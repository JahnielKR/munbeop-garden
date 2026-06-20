export type Feedback = 'easy' | 'hard'

export type ReviewState = 'unreviewed' | 'correct' | 'incorrect'

/** Which dimension a struggled sentence failed on — optional diagnostic tag. */
export const ERROR_DIMENSIONS = ['particle', 'ending', 'register', 'word_order', 'other'] as const
export type ErrorDimension = (typeof ERROR_DIMENSIONS)[number]

export interface LogEntry {
  /** Unique id (Date.now() + random in v1). */
  id: number
  /** Grammar pattern key (Grammar.ko). */
  ko: string
  /** The sentence the user wrote. */
  sentence: string
  feedback: Feedback
  /** Optional note explaining what was wrong; required when reviewState === 'incorrect'. */
  errorNote: string | null
  /** Optional one-tap diagnostic tag for what slipped (particle/ending/…). */
  errorDimension?: ErrorDimension | null
  reviewState: ReviewState
  /** Context id used when this entry was created. */
  contextId: string
  /** Snapshot of the context name (resilient to context renames). */
  contextName: string
  /** ISO date string. */
  date: string
}

/**
 * A diary entry "waiting in the rain": unreviewed and worth revisiting — either
 * the user rated it hard or left a note about what tripped them up. This is the
 * single source of truth for the garden's rain weather (useGardenState) and the
 * /log review control, so the two never disagree about what counts as pending.
 */
export function isPendingReview(e: LogEntry): boolean {
  return e.reviewState === 'unreviewed' && (e.feedback === 'hard' || !!e.errorNote)
}
