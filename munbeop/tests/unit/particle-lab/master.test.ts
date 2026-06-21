import { describe, it, expect } from 'vitest'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import type { SrsState } from '~/lib/domain'

const srs = (mastery: SrsState['mastery']): SrsState => ({
  lastSeen: null, easyCount: 0, hardCount: 0, mastery,
})

describe('particleGrammarKos', () => {
  it('returns the 11 distinct lab particle grammarKo, de-duplicated, in order', () => {
    const kos = particleGrammarKos(PARTICLES)
    expect(kos).toEqual([
      '은/는', '이/가', '을/를', '에', '에서', '도', '만',
      '에게 / 한테 / 께', '(으)로', '와/과 · 하고 · (이)랑', '부터 / 까지',
    ])
    expect(new Set(kos).size).toBe(kos.length) // 부터 / 까지 appears twice, collapses to one
  })
})

describe('particleMastery', () => {
  const kos = ['은/는', '이/가', '에']

  it('earns when every tracked particle is at tree', () => {
    const map = { '은/는': srs('tree'), '이/가': srs('tree'), '에': srs('tree') }
    const v = particleMastery(kos, map, 'tree')
    expect(v.earned).toBe(true)
    expect(v.doneCount).toBe(3)
    expect(v.total).toBe(3)
  })

  it('is not earned when one particle is below threshold', () => {
    const map = { '은/는': srs('tree'), '이/가': srs('plant'), '에': srs('tree') }
    const v = particleMastery(kos, map, 'tree')
    expect(v.earned).toBe(false)
    expect(v.doneCount).toBe(2)
    expect(v.perParticle.find((p) => p.ko === '이/가')!.done).toBe(false)
  })

  it('treats a missing srs row as seedling', () => {
    const v = particleMastery(kos, {}, 'tree')
    expect(v.doneCount).toBe(0)
    expect(v.perParticle.every((p) => p.mastery === 'seedling' && !p.done)).toBe(true)
  })

  it('threshold plant counts plant and tree as done', () => {
    const map = { '은/는': srs('plant'), '이/가': srs('tree'), '에': srs('seedling') }
    const v = particleMastery(kos, map, 'plant')
    expect(v.doneCount).toBe(2)
    expect(v.earned).toBe(false)
  })
})
