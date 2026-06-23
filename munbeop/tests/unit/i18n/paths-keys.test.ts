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
const KEYS = [
  'paths.title', 'paths.lead', 'paths.progress_label', 'paths.next_label',
  'paths.practice_cta', 'paths.complete', 'paths.list_toggle', 'library.paths_link',
]

describe('paths i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('progress_label keeps its placeholders', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      const s = dig(msgs, 'paths.progress_label') as string
      expect(s, code).toContain('{learned}')
      expect(s, code).toContain('{total}')
    }
  })
})
