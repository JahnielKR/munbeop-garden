// tests/unit/register-transform/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { REGISTER_ITEMS } from '~/seed/register-transform'
import { LOCALE_CODES, LEVEL_SETS, HONOR_SETS } from '~/lib/domain'

const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const LEVELS = ['formal', 'polite', 'casual']
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)
const validSet = (mode: string, set: string) =>
  (mode === 'level' ? (LEVEL_SETS as readonly string[]) : (HONOR_SETS as readonly string[])).includes(set)

describe('register-transform seed invariants', () => {
  it('has items in both modes', () => {
    expect(REGISTER_ITEMS.some((i) => i.mode === 'level')).toBe(true)
    expect(REGISTER_ITEMS.some((i) => i.mode === 'honor')).toBe(true)
  })
  for (const [i, it_] of REGISTER_ITEMS.entries()) {
    it(`#${i} ${it_.source} → ${it_.answer} is well-formed`, () => {
      expect(it_.source).toMatch(HANGUL)
      expect(it_.answer).toMatch(HANGUL)
      expect(it_.source).not.toBe(it_.answer)
      expect(['level', 'honor']).toContain(it_.mode)
      expect(LEVELS).toContain(it_.target)
      expect(validSet(it_.mode, it_.set), `${it_.set} valid for ${it_.mode}`).toBe(true)
      if (it_.mode === 'level') expect(it_.set).toBe(it_.target)
      expect(it_.distractors).toHaveLength(3)
      for (const d of it_.distractors) {
        expect(d).toMatch(HANGUL)
        expect(d).not.toBe(it_.answer)
      }
      expect(new Set(it_.distractors).size, 'distractors pairwise distinct').toBe(3)
      expect(nonEmptyLocales(it_.trans), 'trans 8 locales').toBe(true)
      expect(nonEmptyLocales(it_.why), 'why 8 locales').toBe(true)
    })
  }
})
