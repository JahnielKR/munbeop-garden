export type Feedback = 'easy' | 'hard'

export type ReviewState = 'unreviewed' | 'correct' | 'incorrect'

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
  reviewState: ReviewState
  /** Context id used when this entry was created. */
  contextId: string
  /** Snapshot of the context name (resilient to context renames). */
  contextName: string
  /** ISO date string. */
  date: string
}
