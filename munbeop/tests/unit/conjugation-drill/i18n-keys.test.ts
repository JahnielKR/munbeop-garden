import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }
const keys = (o: Record<string, unknown>) => Object.keys((o.conjugation as Record<string, unknown>) ?? {})

describe('conjugation i18n parity', () => {
  it('every locale has the same conjugation.* keys as en', () => {
    const base = keys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: keys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
})
