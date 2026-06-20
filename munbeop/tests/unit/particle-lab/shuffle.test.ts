import { describe, it, expect } from 'vitest'
import { shuffle } from '~/lib/particle-lab'

describe('shuffle', () => {
  it('returns a permutation (same multiset) of the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, () => 0.42)
    expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    expect(out).toHaveLength(5)
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    shuffle(input, () => 0.99)
    expect(input).toEqual([1, 2, 3])
  })

  it('is deterministic for a fixed rng', () => {
    const rng = () => 0 // Fisher–Yates with rng()=0 always swaps j=0
    expect(shuffle(['a', 'b', 'c'], rng)).toEqual(shuffle(['a', 'b', 'c'], rng))
  })

  it('returns empty / single inputs intact', () => {
    expect(shuffle([], () => 0.5)).toEqual([])
    expect(shuffle([7], () => 0.5)).toEqual([7])
  })
})
