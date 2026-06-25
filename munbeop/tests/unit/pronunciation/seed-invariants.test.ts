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

      it('has at least one part, each exactly one Hangul syllable', () => {
        expect(g.parts.length).toBeGreaterThan(0)
        for (const part of g.parts) {
          expect(isOneHangulSyllable(part), `${g.ko} → "${part}"`).toBe(true)
        }
      })
    })
  }

  it('guideFor resolves authored points and rejects unknown ones', () => {
    expect(guideFor(PRONUNCIATION_GUIDES[0]!.ko)).toEqual(PRONUNCIATION_GUIDES[0])
    expect(guideFor('의문사')).toBeUndefined() // a category label, intentionally no guide
    expect(guideFor('___nope___')).toBeUndefined()
  })

  it('allSyllables is the deduped, sorted union of every part', () => {
    const syl = allSyllables()
    expect(new Set(syl).size).toBe(syl.length)
    expect([...syl]).toEqual([...syl].sort())
    for (const g of PRONUNCIATION_GUIDES) {
      for (const part of g.parts) expect(syl).toContain(part)
    }
  })
})
