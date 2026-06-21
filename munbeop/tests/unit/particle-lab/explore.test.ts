import { describe, it, expect } from 'vitest'
import type { ParticleId } from '~/lib/domain'
import { indexOfParticle, particleIds, readingFor, toggleableIds, tokenText } from '~/lib/particle-lab'
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

  it('tokenText returns the level form for words, the base text otherwise', () => {
    const word = { kind: 'word' as const, text: '학생이에요', byLevel: { formal: '학생입니다', casual: '학생이야' } }
    expect(tokenText(word, 'formal')).toBe('학생입니다')
    expect(tokenText(word, 'casual')).toBe('학생이야')
    expect(tokenText(word, 'polite')).toBe('학생이에요')
    const plain = { kind: 'word' as const, text: '가요' }
    expect(tokenText(plain, 'formal')).toBe('가요')
    const particle = { kind: 'particle' as const, text: '는', particleId: 'topic' as const, toggleable: true }
    expect(tokenText(particle, 'casual')).toBe('는')
  })

  it('every sentence renders differently at formal and casual vs polite, with no empty token', () => {
    const assemble = (s: (typeof PARTICLE_SENTENCES)[number], level: 'formal' | 'polite' | 'casual') =>
      s.eojeols.flatMap((e) => e.map((t) => tokenText(t, level))).join('')
    for (const s of PARTICLE_SENTENCES) {
      const polite = assemble(s, 'polite')
      expect(assemble(s, 'formal'), `${s.id} formal`).not.toBe(polite)
      expect(assemble(s, 'casual'), `${s.id} casual`).not.toBe(polite)
      for (const level of ['formal', 'polite', 'casual'] as const)
        for (const e of s.eojeols)
          for (const t of e) expect(tokenText(t, level).length, `${s.id} empty`).toBeGreaterThan(0)
    }
  })

  it('every explicit reading references particles that exist in its sentence', () => {
    for (const s of PARTICLE_SENTENCES) {
      const present = particleIds(s)
      for (const r of s.readings)
        for (const id of r.off) expect(present).toContain(id)
    }
  })
})
