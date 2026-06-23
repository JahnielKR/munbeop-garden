import { describe, it, expect } from 'vitest'
import { createLadder, recordAnswer, ladderOutcome, type LadderState } from '~/lib/placement/ladder'

/** Drive the ladder with a flat list of booleans (one per question). */
function run(answers: boolean[]): LadderState {
  let s = createLadder()
  for (const a of answers) s = recordAnswer(s, a)
  return s
}
const REP = (val: boolean, n: number) => Array.from({ length: n }, () => val)

describe('placement ladder', () => {
  it('fails TOPIK 1 → cleared 0, starts at deck topik-1', () => {
    const s = run(REP(false, 4))
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(0)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 0, startingLevel: 1, startingDeckId: 'topik-1' })
  })

  it('clears 1–3 then fails 4 → cleared 3, starts at the frontier topik-4', () => {
    const s = run([...REP(true, 12), true, false, false, false])
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(3)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 3, startingLevel: 4, startingDeckId: 'topik-4' })
  })

  it('clears all 6 → cleared 6, caps at topik-6', () => {
    const s = run(REP(true, 24))
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(6)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 6, startingLevel: 6, startingDeckId: 'topik-6' })
  })

  it('passes a level at exactly 3/4 and fails at 2/4', () => {
    const s = run([true, true, true, false, true, true, false, false])
    expect(s.clearedLevel).toBe(1)
    expect(ladderOutcome(s).startingDeckId).toBe('topik-2')
  })

  it('is not done mid-level', () => {
    const s = run([true, true])
    expect(s.done).toBe(false)
    expect(s.currentLevel).toBe(1)
  })
})
