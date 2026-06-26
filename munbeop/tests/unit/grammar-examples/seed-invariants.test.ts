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

  // Coverage: the TOPIK-1 batch must cover all 12 target points, ≥2 each.
  const TOPIK_1_BATCH = [
    '-아/어요', '-았/었어요', '-ㅂ/습니다', '-(으)세요', '-(으)ㄹ 거예요', '-고',
    '-아/어서', '-지만', '-(으)면', '-ㄴ/는데', '-고 싶다', '-고 있다',
  ]
  for (const ko of TOPIK_1_BATCH) {
    it(`covers ${ko} with ≥2 examples`, () => {
      expect(GRAMMAR_EXAMPLES.filter((e) => e.ko === ko).length).toBeGreaterThanOrEqual(2)
    })
  }

  // "Above ≠ below": a bank example must never repeat its grammar's canonical
  // `Grammar.example` (which renders in MeaningSection). MeaningSection shows the
  // canonical; ExamplesSection shows the bank — they must differ.
  it('no bank sentence duplicates its grammar canonical example', () => {
    const canonical = new Map(DEFAULT_GRAMMAR.map((g) => [g.ko, g.example]))
    const offenders = GRAMMAR_EXAMPLES.filter((e) => e.sentence === canonical.get(e.ko))
    expect(offenders.map((e) => `${e.ko}: ${e.sentence}`)).toEqual([])
  })
})
