import { describe, it, expect } from 'vitest'
import { TOPIK_1_GRAMMAR } from '~/seed/grammars-n1'
import { TOPIK_2_GRAMMAR } from '~/seed/grammars-n2'
import { TOPIK_3_GRAMMAR } from '~/seed/grammars-n3'
import { TOPIK_4_GRAMMAR } from '~/seed/grammars-n4'
import { TOPIK_5_GRAMMAR } from '~/seed/grammars-n5'
import { TOPIK_6_GRAMMAR } from '~/seed/grammars-n6'
import { notesFor } from '~/lib/usage-notes'

const LOCALES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

describe('usageNotes seed completeness', () => {
  // COMPLETE: every catalog grammar (TOPIK 1–6) has a detailed usage note in all
  // 8 locales, looked up by ko from app/seed/usage-notes (NOT off the Grammar
  // object — the Supabase catalog doesn't carry them). A new grammar shipped
  // without a matching note fails here.
  const all = [
    ...TOPIK_1_GRAMMAR,
    ...TOPIK_2_GRAMMAR,
    ...TOPIK_3_GRAMMAR,
    ...TOPIK_4_GRAMMAR,
    ...TOPIK_5_GRAMMAR,
    ...TOPIK_6_GRAMMAR,
  ]
  for (const g of all) {
    it(`${g.ko} has usage notes in all 8 locales`, () => {
      const notes = notesFor(g.ko)
      expect(notes, `${g.ko} missing usage notes`).toBeDefined()
      for (const locale of LOCALES) {
        const v = notes![locale]
        expect(v, `${g.ko}.${locale} empty`).toBeTruthy()
        expect(
          v.length,
          `${g.ko}.${locale} too short (got ${v.length} chars, need >20)`,
        ).toBeGreaterThan(20)
      }
    })
  }
})
