import type { LocalizedString } from './i18n'

export interface Grammar {
  /** Korean grammar pattern, e.g. "-(으)니까". Unique identifier in v1. NOT translated. */
  ko: string
  /** Explanation of meaning/usage per locale. */
  meaning: LocalizedString
  /** Optional canonical example sentence in Korean. NOT translated. */
  example?: string
  /** Optional translation of the example per locale. */
  trans?: LocalizedString
  /** Deck this grammar belongs to. */
  deckId: string
  /**
   * Usage notes per locale — when to use the pattern, common pitfalls,
   * register (formal/informal), confusion with similar patterns.
   * Multi-paragraph free text. Optional: entries without notes render
   * the "Coming soon" placeholder in the study sheet.
   */
  usageNotes?: LocalizedString
}

export interface Deck {
  id: string
  name: string
  colorId: string
  order: number
  collapsed: boolean
}
