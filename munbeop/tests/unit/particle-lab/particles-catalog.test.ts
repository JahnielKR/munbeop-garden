import { describe, it, expect } from 'vitest'
import { PARTICLE_IDS } from '~/lib/domain'
import { PARTICLES, particleById } from '~/seed/particles'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'

const catalogKeys = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))

describe('particle catalog integrity', () => {
  it('every declared particle id has exactly one def', () => {
    for (const id of PARTICLE_IDS) expect(particleById(id), id).toBeTruthy()
    expect(PARTICLES.length).toBe(PARTICLE_IDS.length)
  })

  it('every particle grammarKo resolves to a real catalog entry (the "ver ficha" link)', () => {
    for (const p of PARTICLES) expect(catalogKeys.has(p.grammarKo), `${p.id} → ${p.grammarKo}`).toBe(true)
  })

  it('allomorph particles differ, invariant particles repeat the form', () => {
    const allomorph = new Set(['topic', 'subject', 'object', 'by-means', 'and'])
    for (const p of PARTICLES) {
      if (allomorph.has(p.id)) expect(p.afterConsonant, p.id).not.toBe(p.afterVowel)
      else expect(p.afterConsonant, p.id).toBe(p.afterVowel)
    }
  })
})
