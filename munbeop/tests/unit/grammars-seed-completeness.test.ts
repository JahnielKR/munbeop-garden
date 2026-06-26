import { describe, it, expect } from 'vitest'
import { TOPIK_1_GRAMMAR } from '~/seed/grammars-n1'
import { TOPIK_2_GRAMMAR } from '~/seed/grammars-n2'
import { TOPIK_3_GRAMMAR } from '~/seed/grammars-n3'
import { TOPIK_4_GRAMMAR } from '~/seed/grammars-n4'
import { TOPIK_5_GRAMMAR } from '~/seed/grammars-n5'
import { TOPIK_6_GRAMMAR } from '~/seed/grammars-n6'

const LOCALES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

describe('usageNotes seed completeness', () => {
  // ACTIVE: every seeded level must carry detailed usageNotes in all 8 locales.
  // As later levels are seeded they move from the "must stay empty" block below
  // into this one.
  describe('TOPIK 1–4 (seeded)', () => {
    const inScope = [...TOPIK_1_GRAMMAR, ...TOPIK_2_GRAMMAR, ...TOPIK_3_GRAMMAR, ...TOPIK_4_GRAMMAR]
    for (const g of inScope) {
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

  describe('TOPIK 5-6 (not yet seeded — must stay empty)', () => {
    const outOfScope = [
      ...TOPIK_5_GRAMMAR,
      ...TOPIK_6_GRAMMAR,
    ]
    for (const g of outOfScope) {
      it(`${g.ko} has usageNotes === undefined`, () => {
        expect(
          g.usageNotes,
          `${g.ko} has usageNotes — was seeded outside v1 scope. Either move it to a v1 PR by also seeding all of TOPIK 1+2, or delete it.`,
        ).toBeUndefined()
      })
    }
  })
})
