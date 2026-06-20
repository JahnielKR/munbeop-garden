import { describe, it, expect } from 'vitest'
import type { ParticleId } from '~/lib/domain'
import { indexOfParticle, particleIds, readingFor, toggleableIds } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

const s02 = PARTICLE_SENTENCES.find((s) => s.id === 's02-goyangi')!

describe('explore resolver', () => {
  it('returns null for the all-ON state', () => {
    expect(readingFor(s02, new Set())).toBeNull()
  })

  it('finds the explicit reading for a single OFF particle', () => {
    const r = readingFor(s02, new Set<ParticleId>(['object']))
    expect(r).not.toBeNull()
    expect(r!.off).toEqual(['object'])
  })

  it('returns null for unlisted combos (generic fallback)', () => {
    expect(readingFor(s02, new Set<ParticleId>(['subject', 'object']))).toBeNull()
  })

  it('lists toggleable and present particle ids in reading order', () => {
    expect(toggleableIds(s02)).toEqual(['subject', 'object'])
    expect(particleIds(s02)).toEqual(['subject', 'object'])
  })

  it('finds the first sentence containing a particle', () => {
    expect(indexOfParticle(PARTICLE_SENTENCES, 'topic')).toBe(0)
    expect(indexOfParticle(PARTICLE_SENTENCES, 'place-action')).toBeGreaterThan(0)
  })

  it('finds a first sentence for every new Explore particle', () => {
    for (const id of ['only', 'recipient', 'by-means', 'and', 'from', 'until'] as const)
      expect(indexOfParticle(PARTICLE_SENTENCES, id), id).toBeGreaterThanOrEqual(0)
  })

  it('every explicit reading references particles that exist in its sentence', () => {
    for (const s of PARTICLE_SENTENCES) {
      const present = particleIds(s)
      for (const r of s.readings)
        for (const id of r.off) expect(present).toContain(id)
    }
  })
})
