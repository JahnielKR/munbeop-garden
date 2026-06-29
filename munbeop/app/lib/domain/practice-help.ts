import type { LocalizedString } from './i18n'

/** One "type/kind" inside a concept (e.g. the 3 kinds of 높임법). */
export interface PracticeHelpType {
  /** Korean term, language-neutral (not translated). */
  ko: string
  /** Short localized label, e.g. "raising the subject". */
  label: LocalizedString
  /** One- to two-sentence localized explanation. */
  desc: LocalizedString
  /** Korean example sentence, language-neutral. */
  example: string
  /** Localized translation of `example`. */
  gloss: LocalizedString
}

/** The full explanation shown in one practice mode's modal. */
export interface PracticeHelpContent {
  /** Korean headline term, e.g. '높임법'. */
  ko: string
  /** Optional romanization of `ko`, e.g. 'nopimbeop'. */
  romanization?: string
  /** Localized one-line subtitle, e.g. "the honorific system". */
  subtitle: LocalizedString
  /** Localized "what is it?" paragraph. */
  concept: LocalizedString
  /** Optional list of kinds/types of the concept. */
  types?: PracticeHelpType[]
  /** Localized "how to play" steps, rendered as a numbered list. */
  howToPlay: LocalizedString[]
  /** Optional localized pro-tip / common trap. */
  tip?: LocalizedString
}

/** Practice modes that can carry an explanation modal (escape room excluded). */
export type PracticeHelpMode =
  | 'ruleta'
  | 'particles'
  | 'conjugation'
  | 'register'
  | 'cloze'
  | 'counters'
  | 'placement'
  | 'number-market'
  | 'rescue'
