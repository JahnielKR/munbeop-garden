import { describe, it, expect } from 'vitest'
import { PRONUNCIATION_GUIDES } from '~/seed/pronunciation'
import { guideFor, allSyllables } from '~/lib/pronunciation'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'

const catalogKos = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))

/** A single modern-Hangul syllable block (U+AC00–U+D7A3). */
function isOneHangulSyllable(s: string): boolean {
  if ([...s].length !== 1) return false
  const cp = s.codePointAt(0)!
  return cp >= 0xac00 && cp <= 0xd7a3
}

/** A bare 2-syllable allomorph pair like 은/는, 이/가, 을/를. */
const PAIR_RE = /^[가-힣]\/[가-힣]$/

describe('pronunciation seed invariants', () => {
  it('has a non-empty first batch with unique kos', () => {
    expect(PRONUNCIATION_GUIDES.length).toBeGreaterThan(0)
    const kos = PRONUNCIATION_GUIDES.map((g) => g.ko)
    expect(new Set(kos).size).toBe(kos.length)
  })

  for (const g of PRONUNCIATION_GUIDES) {
    describe(`guide ${g.ko}`, () => {
      it('targets a real catalog grammar point', () => {
        expect(catalogKos.has(g.ko), g.ko).toBe(true)
      })

      it('has at least one form; each form has ≥1 one-syllable part', () => {
        expect(g.forms.length).toBeGreaterThan(0)
        for (const form of g.forms) {
          expect(form.parts.length, g.ko).toBeGreaterThan(0)
          for (const part of form.parts) {
            expect(isOneHangulSyllable(part), `${g.ko} → "${part}"`).toBe(true)
          }
        }
      })

      it('has distinct forms (no duplicate realization)', () => {
        const keys = g.forms.map((f) => f.parts.join('·'))
        expect(new Set(keys).size, g.ko).toBe(keys.length)
      })

      it('sounds both forms of a bare allomorph pair (은/는, 이/가, 을/를)', () => {
        if (PAIR_RE.test(g.ko)) expect(g.forms.length, g.ko).toBeGreaterThanOrEqual(2)
      })
    })
  }

  it('the bare allomorph pairs are present and each carries two forms', () => {
    for (const ko of ['은/는', '이/가', '을/를']) {
      const g = guideFor(ko)
      expect(g, ko).toBeDefined()
      expect(g!.forms.length, ko).toBe(2)
    }
  })

  it('a healthy number of guides expose multiple forms (regression guard)', () => {
    const multi = PRONUNCIATION_GUIDES.filter((g) => g.forms.length > 1)
    expect(multi.length).toBeGreaterThanOrEqual(60)
  })

  it('guideFor resolves authored points and rejects unknown ones', () => {
    expect(guideFor(PRONUNCIATION_GUIDES[0]!.ko)).toEqual(PRONUNCIATION_GUIDES[0])
    expect(guideFor('의문사')).toBeUndefined() // a category label, intentionally no guide
    expect(guideFor('___nope___')).toBeUndefined()
  })

  it('allSyllables is the deduped, sorted union of every form’s parts', () => {
    const syl = allSyllables()
    expect(new Set(syl).size).toBe(syl.length)
    expect([...syl]).toEqual([...syl].sort())
    for (const g of PRONUNCIATION_GUIDES) {
      for (const form of g.forms) {
        for (const part of form.parts) expect(syl).toContain(part)
      }
    }
  })
})
