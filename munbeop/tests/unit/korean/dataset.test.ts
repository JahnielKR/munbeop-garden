import { describe, it, expect } from 'vitest'
import { conjugate, attachParticle, endsInConsonant, finalJamo, ENDINGS, PARTICLES, VERBS, NOUNS } from '~/lib/korean'
import type { VerbClass } from '~/lib/korean'

const KLASSES: VerbClass[] = ['regular', 'hada', 'p_irr', 't_irr', 'eu_elision', 'reu_irr', 'h_irr', 's_irr', 'l_drop']

describe('dataset integrity', () => {
  it('has 80 verbs and 10 nouns', () => {
    expect(VERBS).toHaveLength(80)
    expect(NOUNS).toHaveLength(10)
  })
  it('every verb has a valid class and conjugates through all endings without throwing', () => {
    for (const v of VERBS) {
      expect(KLASSES).toContain(v.klass)
      for (const ending of ENDINGS) {
        const out = conjugate(v.dict, v.klass, ending)
        expect(out.length, `${v.dict} + ${ending}`).toBeGreaterThan(0)
        // result is Hangul (no leftover jamo / latin)
        expect(out, `${v.dict} + ${ending}`).toMatch(/^[가-힣 ]+$/)
      }
    }
  })
  it('noun batchim flags match the hangul analyzer, and every particle attaches', () => {
    for (const n of NOUNS) {
      expect(endsInConsonant(n.noun)).toBe(n.endsInConsonant)
      expect(finalJamo(n.noun) === 'ㄹ').toBe(n.endsInRieul)
      for (const p of PARTICLES) expect(attachParticle(n.noun, p).length).toBeGreaterThan(n.noun.length)
    }
  })
})
