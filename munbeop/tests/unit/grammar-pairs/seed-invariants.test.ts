import { describe, it, expect } from 'vitest'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)

describe('grammar-pairs seed invariants', () => {
  it('is non-empty', () => {
    expect(GRAMMAR_PAIRS.length).toBeGreaterThan(0)
  })
  for (const [i, p] of GRAMMAR_PAIRS.entries()) {
    it(`#${i} ${p.id} is well-formed`, () => {
      expect(KNOWN_KO.has(p.a), `a: ${p.a}`).toBe(true)
      expect(KNOWN_KO.has(p.b), `b: ${p.b}`).toBe(true)
      expect(p.a).not.toBe(p.b)
      expect(nonEmptyLocales(p.note), `${p.id} note`).toBe(true)
      expect(p.items.length).toBeGreaterThanOrEqual(2)
      for (const it of p.items) {
        expect(it.sentence).toContain('{}')
        expect(['a', 'b']).toContain(it.answer)
        expect(it.optionA.trim().length, `${p.id} optionA`).toBeGreaterThan(0)
        expect(it.optionB.trim().length, `${p.id} optionB`).toBeGreaterThan(0)
        expect(it.optionA).toMatch(HANGUL)
        expect(it.optionB).toMatch(HANGUL)
        expect(it.optionA, `${p.id} optionA===optionB`).not.toBe(it.optionB)
        expect(nonEmptyLocales(it.trans), `${p.id} item trans`).toBe(true)
        expect(nonEmptyLocales(it.why), `${p.id} item why`).toBe(true)
      }
    })
  }

  // Coverage: the batch must cover all 4 target pairs, ≥3 items each.
  const TARGET_IDS = ['an-mot', 'aseo-nikka', 'go-aseo', 'goitda-aitda']
  for (const id of TARGET_IDS) {
    it(`covers ${id} with ≥3 items`, () => {
      const pair = GRAMMAR_PAIRS.find((p) => p.id === id)
      expect(pair, `pair ${id} present`).toBeDefined()
      expect(pair!.items.length).toBeGreaterThanOrEqual(3)
    })
  }
})
