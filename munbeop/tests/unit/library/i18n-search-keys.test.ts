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

function searchKeys(obj: unknown): string[] {
  const root = (obj as { library?: { search?: Record<string, unknown> } })?.library?.search
  const out: string[] = []
  const walk = (o: Record<string, unknown>, p: string) => {
    for (const k of Object.keys(o)) {
      const key = p ? `${p}.${k}` : k
      const v = o[k]
      if (v && typeof v === 'object') walk(v as Record<string, unknown>, key)
      else out.push(key)
    }
  }
  if (root) walk(root, '')
  return out.sort()
}

describe('library.search i18n parity', () => {
  const reference = searchKeys(en)
  it('en defines the full search key set', () => {
    expect(reference).toContain('placeholder')
    expect(reference).toContain('result_count')
    expect(reference).toContain('category.particle')
    expect(reference).toContain('category.meta')
  })
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} has identical library.search keys to en`, () => {
      expect(searchKeys(msgs)).toEqual(reference)
    })
  }
})
