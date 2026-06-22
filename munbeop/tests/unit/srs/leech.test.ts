import { describe, it, expect } from 'vitest'
import {
  detectLeeches,
  LEECH_WINDOW,
  LEECH_MIN_REVIEWS,
  LEECH_HARD_RATIO,
} from '~/lib/srs/leech'
import type { Grammar, LogEntry, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Ascending timestamps so "most recent N" is unambiguous; later index = newer.
let clock = 0
const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(),
  ko: 'X',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  errorDimension: null,
  reviewState: 'unreviewed',
  contextId: 'c',
  contextName: 'c',
  date: new Date(Date.UTC(2026, 0, 1) + clock++ * 60_000).toISOString(),
  ...over,
})

const grammars: Grammar[] = [{ ko: 'X', meaning: L('x-mean'), deckId: 'topik-2' }]

describe('detectLeeches', () => {
  it('constants are the forgiving defaults', () => {
    expect(LEECH_WINDOW).toBe(8)
    expect(LEECH_MIN_REVIEWS).toBe(4)
    expect(LEECH_HARD_RATIO).toBe(0.5)
  })

  it('flags a ko whose recent window is >= 50% hard, with its meaning', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'easy' })]
    const out = detectLeeches(log, grammars)
    expect(out).toHaveLength(1)
    expect(out[0]!.ko).toBe('X')
    expect(out[0]!.recentReviews).toBe(4)
    expect(out[0]!.recentHardRatio).toBeCloseTo(0.75)
    expect(out[0]!.meaning).toEqual(L('x-mean'))
  })

  it('ignores a ko with fewer than LEECH_MIN_REVIEWS reviews in the window', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'hard' })]
    expect(detectLeeches(log, grammars)).toEqual([])
  })

  it('does NOT flag when recent hard ratio is below threshold', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'easy' }), e({ feedback: 'easy' }), e({ feedback: 'easy' })]
    expect(detectLeeches(log, grammars)).toEqual([])
  })

  it('uses only the most recent LEECH_WINDOW entries (self-heals after recovery)', () => {
    // 6 old hard, then 8 recent easy → window is all-easy → not a leech.
    const old = Array.from({ length: 6 }, () => e({ feedback: 'hard' }))
    const recent = Array.from({ length: 8 }, () => e({ feedback: 'easy' }))
    expect(detectLeeches([...old, ...recent], grammars)).toEqual([])
  })

  it("excludes entries flagged 'incorrect' from the window (mirrors recalculateMastery)", () => {
    // 4 incorrect-flagged hards are excluded; only 4 unreviewed easies remain → not a leech.
    const flagged = Array.from({ length: 4 }, () => e({ feedback: 'hard', reviewState: 'incorrect' }))
    const clean = Array.from({ length: 4 }, () => e({ feedback: 'easy' }))
    expect(detectLeeches([...flagged, ...clean], grammars)).toEqual([])
  })

  it('reports the modal errorDimension among recent hard entries', () => {
    const log = [
      e({ feedback: 'hard', errorDimension: 'particle' }),
      e({ feedback: 'hard', errorDimension: 'particle' }),
      e({ feedback: 'hard', errorDimension: 'ending' }),
      e({ feedback: 'easy' }),
    ]
    expect(detectLeeches(log, grammars)[0]!.dominantDimension).toBe('particle')
  })

  it('dominantDimension is null when no recent hard entry carries a tag', () => {
    const log = Array.from({ length: 4 }, () => e({ feedback: 'hard', errorDimension: null }))
    expect(detectLeeches(log, grammars)[0]!.dominantDimension).toBeNull()
  })

  it('sorts by hard ratio desc, then recentReviews desc, then ko', () => {
    const mk = (ko: string, hard: number, total: number) =>
      Array.from({ length: total }, (_, i) => e({ ko, feedback: i < hard ? 'hard' : 'easy' }))
    const log = [...mk('A', 2, 4), ...mk('B', 4, 4), ...mk('C', 3, 6)]
    const gs: Grammar[] = ['A', 'B', 'C'].map((ko) => ({ ko, meaning: L(ko), deckId: 'topik-1' }))
    const out = detectLeeches(log, gs)
    // B = 1.0 ratio → first. A and C tie at 0.5; tiebreak is recentReviews desc,
    // so C (6 reviews) precedes A (4 reviews).
    expect(out.map((l) => l.ko)).toEqual(['B', 'C', 'A'])
  })

  it('returns undefined meaning for a ko not in the catalog (custom grammar), without throwing', () => {
    const log = Array.from({ length: 4 }, () => e({ ko: '내문법', feedback: 'hard' }))
    const out = detectLeeches(log, [])
    expect(out[0]!.ko).toBe('내문법')
    expect(out[0]!.meaning).toBeUndefined()
  })

  it('empty log → empty list', () => {
    expect(detectLeeches([], grammars)).toEqual([])
  })
})
