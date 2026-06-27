import type { LocalizedString } from './i18n'

export type NumberDomain = 'counting' | 'sino-basics' | 'time' | 'money' | 'dates' | 'phone'

/** One "build the reading" item. `tiles` joined by spaces MUST equal `answer`. */
export interface MarketItem {
  /** Stable unique id. */
  id: string
  domain: NumberDomain
  /** What the prompt shows (the numeral/context), e.g. "사과 3개", "3:15", "₩12,000", "6/15". */
  display: string
  /** The correct Korean reading, e.g. "세 개", "세 시 십오 분", "만 이천 원". */
  answer: string
  /** Correct build tiles in order. `tiles.join(' ') === answer`. */
  tiles: string[]
  /** Distractor tiles (wrong-system / wrong-form lures). Non-empty, disjoint from `tiles`. */
  lures: string[]
  /** Canonical value for Dictation grading (Plan 2), e.g. "3", "12000", "3:15", "6/15", "0101234". */
  valueKey: string
  /** Gloss of the whole quantity. */
  trans: LocalizedString
}
