import type { LocalizedString } from './i18n'

export type NumberSystem = 'native' | 'sino'

/** A classifier/counter and the number system it takes. */
export interface Counter {
  /** Unique id (disambiguates the 분/번 homographs: 'bun-people' vs 'bun-minutes'). */
  id: string
  /** Display form, e.g. "권" (may repeat across ids for 분/번). NOT translated. */
  ko: string
  system: NumberSystem
  /** What it counts. */
  gloss: LocalizedString
  /** Typical counted nouns (Korean). NOT translated. */
  nounExamples: string[]
}

/** One "render the count" drill item. */
export interface CountItem {
  /** FK → Counter.id. */
  counterId: string
  /** 1..99. */
  quantity: number
  /** The counted noun shown in the prompt (Korean). NOT translated. */
  noun: string
  system: NumberSystem
  /** The correct rendered count, e.g. "세 권" (= prenominal/sino number + " " + counter ko). */
  answer: string
  /** Gloss of the whole quantity, e.g. "three books". */
  trans: LocalizedString
}
