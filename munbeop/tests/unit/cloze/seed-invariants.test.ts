import { describe, it, expect } from 'vitest'
import { CLOZE_ITEMS } from '~/seed/cloze'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES, ERROR_DIMENSIONS } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)

describe('cloze seed invariants', () => {
  it('is non-empty', () => {
    expect(CLOZE_ITEMS.length).toBeGreaterThan(0)
  })
  for (const [i, it_] of CLOZE_ITEMS.entries()) {
    it(`#${i} ${it_.ko} :: ${it_.sentence} is well-formed`, () => {
      expect(KNOWN_KO.has(it_.ko), `ko: ${it_.ko}`).toBe(true)
      expect(it_.sentence).toContain('{}')
      expect(it_.answer.trim().length).toBeGreaterThan(0)
      expect(it_.answer).toMatch(HANGUL)
      expect(it_.distractors).toHaveLength(3)
      for (const d of it_.distractors) {
        expect(d).toMatch(HANGUL)
        expect(d).not.toBe(it_.answer)
      }
      expect(new Set(it_.distractors).size, 'distractors pairwise distinct').toBe(3)
      if (it_.errorDimension !== undefined)
        expect(ERROR_DIMENSIONS).toContain(it_.errorDimension)
      expect(nonEmptyLocales(it_.trans), 'trans 8 locales').toBe(true)
      expect(nonEmptyLocales(it_.why), 'why 8 locales').toBe(true)
    })
  }
})
