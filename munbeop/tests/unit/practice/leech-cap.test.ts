import { describe, it, expect } from 'vitest'
import { capLeechPicks, createSession } from '~/lib/practice/session'
import type { Context } from '~/lib/domain'

// Deterministic rng that walks a fixed sequence (clamped to [0,1)).
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]!
}

const uniform = () => 1

describe('capLeechPicks', () => {
  it('keeps at most maxLeeches leeches, refilling from the non-leech pool', () => {
    const picked = [1, 2, 3] // all leeches
    const pool = [1, 2, 3, 4, 5, 6] // 4,5,6 are non-leeches
    const isLeech = (g: number) => g <= 3
    const out = capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))
    expect(out).toHaveLength(3)
    expect(out.filter(isLeech)).toHaveLength(1)
  })

  it('leaves a draw with <= maxLeeches untouched', () => {
    const picked = [1, 4, 5]
    const pool = [1, 2, 3, 4, 5, 6]
    const isLeech = (g: number) => g <= 3
    expect(capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))).toEqual([1, 4, 5])
  })

  it('relaxes the cap (never returns < picked.length) when the non-leech pool is exhausted', () => {
    const picked = [1, 2, 3] // all leeches
    const pool = [1, 2, 3] // no non-leeches to refill from
    const isLeech = () => true
    const out = capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))
    expect(out).toHaveLength(3)
    expect(new Set(out).size).toBe(3) // still three distinct picks
  })
})

describe('createSession with capPredicate', () => {
  const contexts: Context[] = [
    { id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' },
  ]

  it('never seats more than one leech among the three picks', () => {
    // Pool of 6 grammar indices; 0,1,2 are leeches. Uniform weights + an rng
    // that would otherwise front-load the leeches.
    const session = createSession<number, Context>({
      grammarPool: [0, 1, 2, 3, 4, 5],
      contextPool: contexts,
      weightOf: uniform,
      rng: seq([0]),
      capPredicate: (g) => g <= 2,
    })
    const leechPicks = session.picks.filter((p) => p.grammarIdx <= 2)
    expect(session.picks).toHaveLength(3)
    expect(leechPicks.length).toBeLessThanOrEqual(1)
  })

  it('without a capPredicate, behaviour is unchanged (still three picks)', () => {
    const session = createSession<number, Context>({
      grammarPool: [0, 1, 2, 3, 4, 5],
      contextPool: contexts,
      weightOf: uniform,
      rng: seq([0]),
    })
    expect(session.picks).toHaveLength(3)
  })
})
