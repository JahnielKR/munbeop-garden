import { describe, it, expect } from 'vitest'
import { weightedPick, pickRandomFrom } from '~/lib/srs/pick'

describe('weightedPick', () => {
  it('returns n items when pool large enough', () => {
    expect(
      weightedPick(
        [1, 2, 3, 4, 5],
        3,
        () => 1,
        () => 0.5,
      ),
    ).toHaveLength(3)
  })

  it('returns only available count when pool smaller', () => {
    expect(
      weightedPick(
        [1, 2],
        5,
        () => 1,
        () => 0.5,
      ),
    ).toHaveLength(2)
  })

  it('never duplicates', () => {
    const picks = weightedPick(
      [1, 2, 3, 4, 5],
      5,
      () => 1,
      () => 0.5,
    )
    expect(new Set(picks).size).toBe(5)
  })

  it('biases toward higher weight', () => {
    const w = (item: number) => (item === 0 ? 100 : 1)
    expect(weightedPick([0, 1, 2, 3], 1, w, () => 0)[0]).toBe(0)
  })

  it('handles empty pool', () => {
    expect(
      weightedPick<number>(
        [],
        3,
        () => 1,
        () => 0.5,
      ),
    ).toEqual([])
  })
})

describe('pickRandomFrom', () => {
  it('returns n when enough', () => {
    expect(pickRandomFrom([10, 20, 30, 40], 2, () => 0.5)).toHaveLength(2)
  })

  it('returns all when n > pool', () => {
    expect(pickRandomFrom([1, 2], 5, () => 0.5)).toHaveLength(2)
  })

  it('never duplicates', () => {
    expect(new Set(pickRandomFrom([1, 2, 3], 3, () => 0.5)).size).toBe(3)
  })
})
