import { describe, it, expect } from 'vitest'
import { LEVEL_REGISTRY, playableLevel } from '~/seed/escape-room/registry'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_REGISTRY', () => {
  it('has 10 entries numbered 1..10 in order', () => {
    expect(LEVEL_REGISTRY).toHaveLength(10)
    expect(LEVEL_REGISTRY.map((e) => e.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('has unique ids and covers', () => {
    const ids = LEVEL_REGISTRY.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const covers = LEVEL_REGISTRY.map((e) => e.cover)
    expect(new Set(covers).size).toBe(covers.length)
  })

  it('every entry carries a non-trivial tagline (the hook)', () => {
    for (const e of LEVEL_REGISTRY) {
      expect(e.tagline.es.length).toBeGreaterThan(40)
    }
  })

  it('playable entries embed a Level that passes validateLevel', () => {
    const playable = LEVEL_REGISTRY.filter((e) => e.status === 'playable')
    expect(playable.length).toBeGreaterThanOrEqual(1)
    for (const e of playable) {
      expect(e.level).toBeDefined()
      expect(validateLevel(e.level!)).toEqual([])
    }
  })

  it('topik level is monotonically non-decreasing through the notebook', () => {
    const seq = LEVEL_REGISTRY.map((e) => e.topikLevel)
    for (let i = 1; i < seq.length; i++) {
      expect(seq[i]!).toBeGreaterThanOrEqual(seq[i - 1]!)
    }
  })

  it('playableLevel resolves playable levels and rejects unknown/coming-soon ids', () => {
    expect(playableLevel('level-01')?.id).toBe('level-01')
    expect(playableLevel('level-02')?.id).toBe('level-02')
    expect(playableLevel('level-03')).toBeNull()
    expect(playableLevel('nope')).toBeNull()
  })
})
