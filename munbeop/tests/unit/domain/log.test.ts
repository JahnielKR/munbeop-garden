import { describe, it, expect } from 'vitest'
import { isPendingReview } from '~/lib/domain'
import type { LogEntry } from '~/lib/domain'

function entry(over: Partial<LogEntry>): LogEntry {
  return {
    id: 1,
    ko: '은/는',
    sentence: '저는 학생이에요',
    feedback: 'easy',
    errorNote: null,
    reviewState: 'unreviewed',
    contextId: 'banmal',
    contextName: '반말',
    date: '2026-06-01T00:00:00Z',
    ...over,
  }
}

describe('isPendingReview', () => {
  it('is pending when unreviewed and rated hard', () => {
    expect(isPendingReview(entry({ feedback: 'hard', reviewState: 'unreviewed' }))).toBe(true)
  })

  it('is pending when unreviewed and easy but carries an error note', () => {
    expect(isPendingReview(entry({ feedback: 'easy', errorNote: 'mixed up 이/가' }))).toBe(true)
  })

  it('is not pending when unreviewed, easy and unnoted', () => {
    expect(isPendingReview(entry({ feedback: 'easy', errorNote: null }))).toBe(false)
  })

  it('is not pending once reviewed, even if it was hard', () => {
    expect(isPendingReview(entry({ feedback: 'hard', reviewState: 'correct' }))).toBe(false)
    expect(isPendingReview(entry({ feedback: 'hard', reviewState: 'incorrect' }))).toBe(false)
  })
})
