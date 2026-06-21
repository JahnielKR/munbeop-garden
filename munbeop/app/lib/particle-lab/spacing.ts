import type { Eojeol, LabSentence } from '../domain/particles'

export type SpacingLevel = 1 | 2
export type GapValue = 'space' | 'join'
export type GapKind = 'particle' | 'word-internal' | 'eojeol'

export interface Gap {
  /** The correct answer for this junction. */
  correct: GapValue
  /** Why — drives the reveal feedback message. */
  kind: GapKind
}

export interface SpacingPuzzle {
  sentenceId: string
  /** Display blocks in order (tokens at L1, single syllables at L2). */
  blocks: string[]
  /** One gap between each adjacent block pair → gaps.length === blocks.length - 1. */
  gaps: Gap[]
}

export interface GapResult {
  index: number
  given: GapValue
  correct: boolean
  gap: Gap
}

export interface SpacingResult {
  gaps: GapResult[]
  /** Every gap matches. */
  correct: boolean
}

/** Concatenate a single eojeol's token texts (base/polite surface). */
export function eojeolText(eojeol: Eojeol): string {
  return eojeol.map((t) => t.text).join('')
}

/** The correctly-spaced surface: eojeol texts joined by one space. The gold answer. */
export function correctSpacing(sentence: LabSentence): string {
  return sentence.eojeols.map(eojeolText).join(' ')
}
