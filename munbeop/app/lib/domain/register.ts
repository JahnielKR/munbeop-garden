// app/lib/domain/register.ts
import type { SpeechLevel } from './particles'
import type { LocalizedString } from './i18n'

/** The two drill modes: speech-level transforms vs subject/object honorification. */
export type RegisterMode = 'level' | 'honor'

/** Level-mode focus sets — the target register to produce. */
export const LEVEL_SETS = ['formal', 'polite', 'casual'] as const
/** Honor-mode focus sets — the honorific phenomenon drilled. */
export const HONOR_SETS = ['verb', 'noun', 'particle', 'si'] as const
export type LevelSet = (typeof LEVEL_SETS)[number]
export type HonorSet = (typeof HONOR_SETS)[number]
export type RegisterSet = LevelSet | HonorSet

export interface RegisterItem {
  /** Korean source sentence to transform. NOT translated. */
  source: string
  mode: RegisterMode
  /**
   * Speech level the CORRECT answer sits in.
   * level: the target register to produce (set === target by construction).
   * honor: the register the honorific output uses (해요체 주무세요 vs 합쇼체 주무십니다).
   */
  target: SpeechLevel
  /** Focus set for the picker + mastery. A mastery set of `mode` (never 'mixed'). */
  set: RegisterSet
  /** The correct transformed sentence. NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong transforms. NOT translated; valid Hangul; ≠ answer and pairwise distinct. */
  distractors: [string, string, string]
  /** Meaning — unchanged across the transform. */
  trans: LocalizedString
  /** One line: what the transform requires, e.g. "께서 + 주무시다 + -세요". */
  why: LocalizedString
}
