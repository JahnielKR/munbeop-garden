import type { LocalizedString } from './i18n'
import type { TopikLevel } from './topik'

/**
 * One placement question: a Korean sentence with a "{}" blank, 4 Korean
 * options (answer + 3 sibling distractors). Single-correct by construction.
 * `level` is the TOPIK level this item discriminates (its deck bucket).
 */
export interface PlacementItem {
  /** FK → Grammar.ko (validated against DEFAULT_GRAMMAR by seed-invariants). NOT translated. */
  ko: string
  level: TopikLevel
  /** Korean sentence with the literal "{}" blank. NOT translated. */
  sentence: string
  /** Correct surface form for the blank. NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong surface forms; valid Hangul; distinct; ≠ answer. NOT translated. */
  distractors: [string, string, string]
  trans: LocalizedString
  /** One line: why the answer fits and the others don't. */
  why: LocalizedString
}
