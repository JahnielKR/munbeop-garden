import { describe, it, expect } from 'vitest'
import {
  createSession,
  currentPickOf,
  advanceProgress,
  isSessionComplete,
} from '~/lib/practice/session'

const args = {
  grammarPool: [0, 1, 2, 3, 4],
  contextPool: ['a', 'b', 'c', 'd', 'e'],
  weightOf: () => 1,
  rng: () => 0.5,
}

describe('createSession', () => {
  it('3 picks with 3 contexts each, progress 0', () => {
    const s = createSession(args)
    expect(s.picks).toHaveLength(3)
    for (const p of s.picks) {
      expect(p.contexts).toHaveLength(3)
      expect(p.progress).toBe(0)
    }
  })

  it('no repeated grammar', () => {
    const s = createSession(args)
    expect(new Set(s.picks.map((p) => p.grammarIdx)).size).toBe(3)
  })

  it('throws when grammar < 3', () => {
    expect(() => createSession({ ...args, grammarPool: [0, 1] })).toThrow(/at least 3 grammar/i)
  })

  it('throws when contexts < 3', () => {
    expect(() => createSession({ ...args, contextPool: ['a', 'b'] })).toThrow(/at least 3 context/i)
  })
})

describe('currentPickOf', () => {
  it('returns pick at index', () => {
    const s = createSession(args)
    expect(currentPickOf(s, 0)).toBe(s.picks[0])
  })
})

describe('advanceProgress', () => {
  it('increments target pick', () => {
    const s = createSession(args)
    advanceProgress(s, 0)
    expect(s.picks[0]!.progress).toBe(1)
    expect(s.picks[1]!.progress).toBe(0)
  })

  it('caps at 3', () => {
    const s = createSession(args)
    for (let i = 0; i < 4; i++) advanceProgress(s, 0)
    expect(s.picks[0]!.progress).toBe(3)
  })
})

describe('isSessionComplete', () => {
  it('false partial', () => {
    expect(isSessionComplete(createSession(args))).toBe(false)
  })

  it('true when all 3', () => {
    const s = createSession(args)
    for (const p of s.picks) p.progress = 3
    expect(isSessionComplete(s)).toBe(true)
  })
})
