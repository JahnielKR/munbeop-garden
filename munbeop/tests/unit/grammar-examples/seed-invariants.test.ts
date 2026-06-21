import { describe, it, expect } from 'vitest'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const LEVELS = new Set(['formal', 'polite', 'casual'])
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/

describe('grammar-examples seed invariants', () => {
  it('is non-empty', () => {
    expect(GRAMMAR_EXAMPLES.length).toBeGreaterThan(0)
  })
  for (const [i, ex] of GRAMMAR_EXAMPLES.entries()) {
    it(`#${i} ${ex.ko} → "${ex.sentence}" is well-formed`, () => {
      expect(KNOWN_KO.has(ex.ko)).toBe(true)
      expect(LEVELS.has(ex.level)).toBe(true)
      expect(ex.sentence.trim().length).toBeGreaterThan(0)
      expect(ex.sentence).toMatch(HANGUL)
      for (const code of LOCALE_CODES) {
        expect((ex.trans as Record<string, string>)[code]?.trim().length ?? 0).toBeGreaterThan(0)
      }
    })
  }
})
