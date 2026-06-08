import type { Grammar, Deck } from '~/lib/domain'
import { TOPIK_1_GRAMMAR } from './grammars-n1'
import { TOPIK_2_GRAMMAR } from './grammars-n2'
import { TOPIK_3_GRAMMAR } from './grammars-n3'
import { TOPIK_4_GRAMMAR } from './grammars-n4'
import { TOPIK_5_GRAMMAR } from './grammars-n5'
import { TOPIK_6_GRAMMAR } from './grammars-n6'

/**
 * Aggregated grammar seed for the app.
 *
 * Per-level entries live in `grammars-n{level}.ts`. Each level file uses the
 * spine notation from `topik-spine.json` for `ko`, so cross-references resolve
 * cleanly via `scripts/topik-spine-gap.mjs`.
 *
 * The `L()` helper for {@link Grammar.meaning}/`trans` is centralized in
 * `seed/locale.ts` and re-imported from every level file.
 *
 * Each TOPIK level gets its own deck so the UI can present them as a
 * difficulty progression — colour ramp from beginner (sky) to mastery (violet).
 */

export const TOPIK_DECKS: Deck[] = [
  { id: 'topik-1', name: 'TOPIK 1', colorId: 'sky',    order: 1, collapsed: false },
  { id: 'topik-2', name: 'TOPIK 2', colorId: 'jade',   order: 2, collapsed: false },
  { id: 'topik-3', name: 'TOPIK 3', colorId: 'gold',   order: 3, collapsed: false },
  { id: 'topik-4', name: 'TOPIK 4', colorId: 'amber',  order: 4, collapsed: false },
  { id: 'topik-5', name: 'TOPIK 5', colorId: 'rose',   order: 5, collapsed: false },
  { id: 'topik-6', name: 'TOPIK 6', colorId: 'violet', order: 6, collapsed: false },
]

/**
 * Default deck used as a fallback in legacy code paths.
 * Points to TOPIK 1 — the entry-level deck.
 */
export const DEFAULT_DECK: Deck = TOPIK_DECKS[0]!

export const DEFAULT_GRAMMAR: Grammar[] = [
  ...TOPIK_1_GRAMMAR,
  ...TOPIK_2_GRAMMAR,
  ...TOPIK_3_GRAMMAR,
  ...TOPIK_4_GRAMMAR,
  ...TOPIK_5_GRAMMAR,
  ...TOPIK_6_GRAMMAR,
]
