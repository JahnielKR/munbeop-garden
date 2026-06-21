import type { LocalizedString } from './i18n'
import type { SpeechLevel } from './particles'

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

/**
 * One example sentence for a grammar point, tagged with the speech level
 * (register) of its predicate. Many per point — the bank that supersedes the
 * single `Grammar.example`. Sourced statically from `app/seed/grammar-examples/`.
 */
export interface GrammarExample {
  /** FK → Grammar.ko (the v1 stable id). NOT translated. */
  ko: string
  /** The Korean example sentence. NOT translated. */
  sentence: string
  /** Translation per locale. */
  trans: LocalizedString
  /** Register of the sentence's predicate (reuses the formality axis). */
  level: SpeechLevel
}

export interface Deck {
  id: string
  name: string
  colorId: string
  order: number
  collapsed: boolean
}

/** Reserved deckId for user-authored grammar (self-study). Catalog items never use it. */
export const CUSTOM_DECK_ID = 'custom'

/**
 * A user-curated, named deck for the Ruleta game. References catalog grammar
 * by {@link Grammar.ko} (the stable v1 id), so it can mix grammar from any
 * level and shares the same per-ko SRS mastery. Distinct from
 * {@link CUSTOM_DECK_ID}, which tags user-authored *grammar* (self-study) —
 * a CustomDeck is a *collection*, not a grammar.
 */
export interface CustomDeck {
  /** Stable unique id (crypto.randomUUID). */
  id: string
  /** User-entered display name, trimmed, non-empty. */
  name: string
  /** Palette id — a key of DECK_COLOR_VARS (sky/jade/gold/amber/rose/violet). */
  colorId: string
  /** Icon token — a deck IconName (see DECK_ICONS). */
  icon: string
  /** Optional uploaded cover image (Supabase Storage public URL). */
  imageUrl?: string
  /** Catalog membership by Grammar.ko. May mix levels; unknown kos are dropped at draw time. */
  grammarKos: string[]
  /** Creation order; lower sorts first in the shelf. */
  order: number
  /** ISO creation timestamp. */
  createdAt: string
}

/** Color/icon applied to a freshly created custom deck. */
export const DEFAULT_DECK_COLOR_ID = 'sky'
export const DEFAULT_DECK_ICON = 'deck-star'
