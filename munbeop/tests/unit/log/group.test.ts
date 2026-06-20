import { describe, it, expect } from 'vitest'
import { groupPendingByKo } from '~/lib/log/group'
import type { LogEntry } from '~/lib/domain'

const e = (over: Partial<LogEntry>): LogEntry => ({
  id: Math.random(),
  ko: 'A',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  reviewState: 'unreviewed',
  contextId: 'banmal',
  contextName: '반말',
  date: '2026-06-20T00:00:00Z',
  ...over,
})

describe('groupPendingByKo', () => {
  it('keeps only pending entries, groups by ko, sorts by group size desc', () => {
    const entries = [
      e({ ko: 'A', feedback: 'hard' }), // pending (hard)
      e({ ko: 'A', feedback: 'hard' }), // pending
      e({ ko: 'B', feedback: 'easy', errorNote: null }), // NOT pending (easy, no note)
      e({ ko: 'C', feedback: 'easy', errorNote: 'oops' }), // pending (note)
      e({ ko: 'A', feedback: 'hard', reviewState: 'correct' }), // NOT pending (reviewed)
    ]
    const groups = groupPendingByKo(entries)
    expect(groups.map((g) => g.ko)).toEqual(['A', 'C']) // A has 2, C has 1
    expect(groups[0]!.entries).toHaveLength(2)
    expect(groups[1]!.entries).toHaveLength(1)
  })
  it('returns empty for no pending entries', () => {
    expect(groupPendingByKo([e({ feedback: 'easy', errorNote: null })])).toEqual([])
  })
})
