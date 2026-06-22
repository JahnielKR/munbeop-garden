import type { LocalizedString } from './i18n'
import type { ErrorDimension } from './log'

export interface ClozeItem {
  /** FK → Grammar.ko (the correct pattern's catalog id). The deck filter keys on this. NOT translated. */
  ko: string
  /** Korean sentence with the literal "{}" blank where the pattern goes. NOT translated. */
  sentence: string
  /** Surface form of the correct pattern in this sentence (e.g. 보고). NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong sibling-pattern surface forms. NOT translated; valid Hangul; ≠ answer and pairwise distinct. */
  distractors: [string, string, string]
  trans: LocalizedString
  /** One line: why the answer fits and the others don't. */
  why: LocalizedString
  /** Optional mistake-feed tag; defaults to 'other' at log time. */
  errorDimension?: ErrorDimension
}
