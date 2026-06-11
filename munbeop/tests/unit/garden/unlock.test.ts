import { describe, expect, it } from 'vitest'
import {
  TREE_GATE_PCT,
  ZONE_GATE_PCT,
  isTreeUnlocked,
  unlockedZoneCount,
} from '~/lib/garden/unlock'

describe('isTreeUnlocked', () => {
  it('always unlocks tree 1, even with zero progress everywhere', () => {
    expect(isTreeUnlocked(1, () => 0)).toBe(true)
  })

  it('gates tree N on progress(N-1) >= TREE_GATE_PCT', () => {
    expect(isTreeUnlocked(2, () => TREE_GATE_PCT - 1)).toBe(false)
    expect(isTreeUnlocked(2, () => TREE_GATE_PCT)).toBe(true)
  })

  it('asks for the PREVIOUS level progress', () => {
    const progressOf = (lvl: number) => (lvl === 3 ? 100 : 0)
    expect(isTreeUnlocked(4, progressOf)).toBe(true)
    expect(isTreeUnlocked(3, progressOf)).toBe(false)
  })
})

describe('unlockedZoneCount', () => {
  it('returns 0 for a level without themes', () => {
    expect(unlockedZoneCount([])).toBe(0)
  })

  it('keeps only the first zone open until it reaches the gate', () => {
    expect(unlockedZoneCount([ZONE_GATE_PCT - 1, 0, 0])).toBe(1)
  })

  it('opens the chain up to the first zone below the gate', () => {
    expect(unlockedZoneCount([100, ZONE_GATE_PCT, 10, 0])).toBe(3)
  })

  it('does not skip past a broken link even if later zones have progress', () => {
    expect(unlockedZoneCount([100, 0, 100, 100])).toBe(2)
  })

  it('opens every zone when all links pass the gate', () => {
    expect(unlockedZoneCount([90, 80, 70])).toBe(3)
  })

  it('handles a single-theme level', () => {
    expect(unlockedZoneCount([0])).toBe(1)
    expect(unlockedZoneCount([100])).toBe(1)
  })
})
