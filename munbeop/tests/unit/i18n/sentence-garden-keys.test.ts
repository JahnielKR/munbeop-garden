import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
const block = (o: Record<string, unknown>) => (o.sentenceGarden as Record<string, unknown>) ?? {}
const keys = (o: Record<string, unknown>) => Object.keys(block(o))

describe('sentenceGarden i18n parity', () => {
  it('every locale has the same sentenceGarden.* keys as en', () => {
    const base = keys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: keys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every sentenceGarden.* value is a non-empty string', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      for (const [key, value] of Object.entries(block(loc))) {
        expect({ name, key, ok: typeof value === 'string' && value.trim().length > 0 }).toEqual({
          name,
          key,
          ok: true,
        })
      }
    }
  })
  it('every locale has the games.sentenceGarden card', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const card = (loc.games as Record<string, Record<string, string>>)?.sentenceGarden
      expect({ name, ok: !!card?.name?.trim() && !!card?.desc?.trim() }).toEqual({ name, ok: true })
    }
  })
})
