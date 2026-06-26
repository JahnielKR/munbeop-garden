import { describe, it, expect } from 'vitest'
import { TOPIK_1_GRAMMAR } from '~/seed/grammars-n1'
import { TOPIK_2_GRAMMAR } from '~/seed/grammars-n2'
import { TOPIK_3_GRAMMAR } from '~/seed/grammars-n3'
import { TOPIK_4_GRAMMAR } from '~/seed/grammars-n4'
import { TOPIK_5_GRAMMAR } from '~/seed/grammars-n5'
import { TOPIK_6_GRAMMAR } from '~/seed/grammars-n6'

const LOCALES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

describe('usageNotes seed completeness', () => {
  // COMPLETE: every catalog grammar (TOPIK 1–6) carries a detailed usageNotes in
  // all 8 locales. A new grammar shipped without one fails here.
  const all = [
    ...TOPIK_1_GRAMMAR,
    ...TOPIK_2_GRAMMAR,
    ...TOPIK_3_GRAMMAR,
    ...TOPIK_4_GRAMMAR,
    ...TOPIK_5_GRAMMAR,
    ...TOPIK_6_GRAMMAR,
  ]
  for (const g of all) {
    it(`${g.ko} has usageNotes in all 8 locales`, () => {
      expect(g.usageNotes, `${g.ko} missing usageNotes`).toBeDefined()
      for (const locale of LOCALES) {
        const v = g.usageNotes![locale]
        expect(v, `${g.ko}.${locale} empty`).toBeTruthy()
        expect(
          v.length,
          `${g.ko}.${locale} too short (got ${v.length} chars, need >20)`,
        ).toBeGreaterThan(20)
      }
    })
  }
})
