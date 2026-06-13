import type { LocalizedString } from './i18n'
import type { TopikLevel } from './topik'

/**
 * Escape Room — type definitions for the embedded puzzle game.
 *
 * A `Level` is one self-contained run (10-15 min): rooms → slots (puzzles) → escape.
 * Each slot carries a pool of 5 candidates; on `start()` the engine draws 1 per slot
 * so structure stays familiar while content varies.
 *
 * Design doc: `docs/escape-room.md` (sections 9 and 12 cover this schema).
 * Runtime logic (shuffle, scoring, rules) lives in `app/lib/escape-room/`;
 * this file is pure type definitions, no behavior.
 */

// ─── Grammar reference ──────────────────────────────────────────────────────

/**
 * Stable id of a grammar entry in the BD (e.g. "G003" for 이/가).
 * Cross-references `GrammarItem.id` in `topik.ts`.
 */
export type GrammarCode = string

// ─── Hints (per puzzle) ─────────────────────────────────────────────────────

export interface Hints {
  /** Vocabulary / conceptual hint. Free; using it does NOT block any reward tier. */
  free: LocalizedString
  /**
   * Pattern / rule hint. Using it in ANY puzzle of the run caps the reward at Common
   * (see Sección 5 of the design doc — single source of truth on this rule).
   */
  premium: LocalizedString
}

// ─── Candidate shapes (one per slot type) ───────────────────────────────────

/** Tipo A — player picks the correct meaning of a Korean line from 4 options. */
export interface SelectionCandidate {
  /** Korean line the player reads. Not translated. */
  korean: string
  /** Prompt rendered above the options. */
  question: LocalizedString
  /** Exactly 4 options. */
  options: readonly [LocalizedString, LocalizedString, LocalizedString, LocalizedString]
  /** Index of the correct option in `options`. */
  correctIndex: 0 | 1 | 2 | 3
  hints: Hints
}

/** Tipo B — player fills a single blank in a Korean line (particle, conjugation, etc.). */
export interface CompletionCandidate {
  /** Korean line containing exactly one `___` blank. Not translated. */
  korean: string
  /** Translation of the full sentence (with the blank resolved). */
  translation: LocalizedString
  /** Exact string the player must produce. Compared verbatim after trim. */
  answer: string
  hints: Hints
}

/** Tipo C — player builds a Korean sentence by ordering draggable tiles. */
export interface CreationCandidate {
  /** Korean question shown by the NPC. Not translated. */
  korean: string
  /** Translation of the NPC question. */
  question: LocalizedString
  /** All draggable tokens (correct + distractors). Order here is canonical. */
  tiles: readonly string[]
  /**
   * Indices into `tiles` forming the correct sentence, in order.
   * The answer string is `correctOrder.map(i => tiles[i]).join(' ')`.
   * Tiles whose indices are NOT in `correctOrder` are distractors.
   */
  correctOrder: readonly number[]
  /**
   * Optional "soft-reject" distractor indices (the thematic present-tense tiles
   * of level 2's Slot 6). Submitting an order that contains any of these tiles
   * the FIRST time costs no error — the store returns `'soft-reject'` and the UI
   * shows `softRejectMessage` instead of an error. A second such submission (or
   * any other wrong answer) is a normal error. Must be disjoint from
   * `correctOrder` (enforced by `validateLevel`).
   */
  softRejectTiles?: readonly number[]
  /** Message shown on a soft-reject (e.g. the monk's «끝난 일은… 끝난 말로 해야 해요»). */
  softRejectMessage?: LocalizedString
  hints: Hints
}

export type Candidate = SelectionCandidate | CompletionCandidate | CreationCandidate

// ─── Slot (discriminated by `type`) ─────────────────────────────────────────

export const SLOT_TYPES = ['selection', 'completion', 'creation'] as const
export type SlotType = (typeof SLOT_TYPES)[number]

interface SlotBase {
  /** Stable id within the level, e.g. "slot-1". */
  id: string
  /** Grammar codes this slot is designed to exercise (foco). */
  grammarFocus: GrammarCode[]
}

/**
 * Discriminated union: the slot's `type` narrows `candidates` to the matching
 * candidate shape, so reads like `slot.candidates[0].options` are type-safe
 * without needing runtime guards.
 *
 * Invariant: `candidates.length === 5` (the pool). Enforced at runtime in
 * `lib/escape-room/rules.ts`, not at the type level.
 */
export type Slot =
  | (SlotBase & { type: 'selection'; candidates: readonly SelectionCandidate[] })
  | (SlotBase & { type: 'completion'; candidates: readonly CompletionCandidate[] })
  | (SlotBase & { type: 'creation'; candidates: readonly CreationCandidate[] })

// ─── Rooms and hotspots ─────────────────────────────────────────────────────

/** Rectangular clickable region over a room image. Coordinates are in scene space (320×240 base). */
export interface Hotspot {
  id: string
  /** `[x, y, width, height]` in scene coordinates. */
  rect: readonly [x: number, y: number, w: number, h: number]
  /** Id of the slot triggered when the hotspot is activated. Omitted for purely cosmetic hotspots. */
  triggersSlot?: string
  /** Easter-egg text shown on click; only set for cosmetic hotspots. */
  cosmeticDetail?: LocalizedString
}

export interface Room {
  /** Stable id within the level, e.g. "bedroom". */
  id: string
  title: LocalizedString
  /** Path relative to `public/escape-room/<level-id>/`, e.g. "rooms/room-01-bedroom.png". */
  image: string
  /** Looping ambient track, same path convention as `image`. */
  ambientAudio: string
  hotspots: Hotspot[]
}

// ─── Rewards (4 tiers) ──────────────────────────────────────────────────────

export const REWARD_TIERS = ['common', 'rare', 'epic', 'legendary'] as const
export type RewardTier = (typeof REWARD_TIERS)[number]

export interface Reward {
  /** Stable id, used for persistence of the unlock. */
  id: string
  /** Path relative to `public/escape-room/<level-id>/cosmetics/`. */
  image: string
  name: LocalizedString
  description: LocalizedString
}

// ─── Scripted beats (between-slot narrative) ────────────────────────────────

/**
 * A fixed narrative beat shown after a given slot resolves — identical on every
 * run (not part of any candidate pool). Rendered with the same typewriter
 * cinematic as the intro. Level 2 uses these for the diary's last entry (the
 * twist's emotional payload) and the second-cup confession.
 */
export interface ScriptedBeat {
  /** Show this beat right after the slot with this id is resolved. */
  afterSlotId: string
  /** Korean NPC voice line shown above the narrative (may be empty). */
  voiceLine: string
  /** Multi-paragraph narrative (`\n\n` separated), same convention as `intro`. */
  narrative: LocalizedString
}

// ─── Level ──────────────────────────────────────────────────────────────────

export interface LevelRules {
  /** Errors allowed before game over. Default 2 (Sección 6 of the design doc). */
  maxErrors: number
  /** Total run time, in seconds, under which the Epic tier unlocks. */
  epicTimeThresholdSeconds: number
  /** Consecutive clean runs (no game over) needed for Legendary. Default 3. */
  legendaryCleanRunsRequired: number
}

export interface Level {
  /** Stable id, e.g. "level-01". */
  id: string
  title: LocalizedString
  /** One-line teaser shown on the level's notebook page. */
  tagline: LocalizedString
  /**
   * Ambient narrative shown as an opening cinematic before Room 1.
   * Multi-paragraph: paragraphs separated by a blank line (`\n\n`).
   */
  intro: LocalizedString
  /** Closing narrative shown after the final lock opens. Same `\n\n` convention. */
  outro: LocalizedString
  /** NPC voice line (Korean, not translated) played over the intro cinematic. */
  voiceIntro: string
  /** NPC voice line (Korean) played over the outro. */
  voiceOutro: string
  /** Every grammar this level exercises. Cross-references `topik.ts` ids. */
  grammarCodes: GrammarCode[]
  topikLevel: TopikLevel
  /** Rooms in narrative order. Players can revisit any unlocked room. */
  rooms: Room[]
  /** Slots in the order they unlock. */
  slots: Slot[]
  /** Optional fixed narrative beats shown between slots (see `ScriptedBeat`). */
  scriptedBeats?: ScriptedBeat[]
  /** One reward per tier; all four are required. */
  rewards: Record<RewardTier, Reward>
  rules: LevelRules
}
