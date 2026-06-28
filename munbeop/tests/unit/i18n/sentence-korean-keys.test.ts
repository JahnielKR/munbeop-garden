import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
function dig(o: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o)
}

// The Ruleta sentence gate shows this warning when the produced sentence isn't
// Korean. It must exist in every locale so it appears in the learner's UI
// language. The Korean tail (한국어로 써 주세요) intentionally stays Korean in
// all locales — a brand convention, like 화이팅.
const KEY = 'practice.sentence_korean_only'

describe('sentence-korean i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines ${KEY}`, () => {
      const v = dig(msgs, KEY)
      expect(typeof v, `${code} ${KEY}`).toBe('string')
      expect((v as string).length).toBeGreaterThan(0)
    })
    it(`${code} keeps the Korean tail`, () => {
      expect((dig(msgs, KEY) as string)).toContain('한국어로 써 주세요')
    })
  }
})
