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

interface Segment {
  text: string
  eojeolIndex: number
  isParticle: boolean
}

/** Flatten a sentence to ordered token-segments tagged with eojeol + role. */
function segmentsOf(sentence: LabSentence): Segment[] {
  const out: Segment[] = []
  sentence.eojeols.forEach((eojeol, ei) => {
    for (const token of eojeol)
      out.push({ text: token.text, eojeolIndex: ei, isParticle: token.kind === 'particle' })
  })
  return out
}

/** Classify the junction between two adjacent segments. */
function gapBetween(a: Segment, b: Segment): Gap {
  if (a.eojeolIndex !== b.eojeolIndex) return { correct: 'space', kind: 'eojeol' }
  if (b.isParticle) return { correct: 'join', kind: 'particle' }
  return { correct: 'join', kind: 'word-internal' }
}

/** Build a level-specific puzzle from the sentence's eojeol structure. */
export function buildPuzzle(sentence: LabSentence, level: SpacingLevel): SpacingPuzzle {
  const segments = segmentsOf(sentence)
  const blocks: string[] = []
  const gaps: Gap[] = []

  if (level === 1) {
    segments.forEach((seg, i) => {
      blocks.push(seg.text)
      const next = segments[i + 1]
      if (next) gaps.push(gapBetween(seg, next))
    })
    return { sentenceId: sentence.id, blocks, gaps }
  }

  // level 2 — one block per syllable; gaps inside a token always join.
  segments.forEach((seg, si) => {
    const chars = [...seg.text]
    chars.forEach((ch, ci) => {
      blocks.push(ch)
      if (ci < chars.length - 1) {
        gaps.push({ correct: 'join', kind: 'word-internal' })
        return
      }
      const next = segments[si + 1]
      if (next) gaps.push(gapBetween(seg, next))
    })
  })
  return { sentenceId: sentence.id, blocks, gaps }
}

/** Compare the user's gap choices against the puzzle. Unset gaps default to 'join'. */
export function gradePuzzle(puzzle: SpacingPuzzle, answers: GapValue[]): SpacingResult {
  const gaps: GapResult[] = puzzle.gaps.map((gap, index) => {
    const given = answers[index] ?? 'join'
    return { index, given, correct: given === gap.correct, gap }
  })
  return { gaps, correct: gaps.every((g) => g.correct) }
}
