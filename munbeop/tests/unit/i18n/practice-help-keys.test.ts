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
const helpKeys = (o: Record<string, unknown>) =>
  Object.keys((o.practiceHelp as Record<string, unknown>) ?? {})
const sectionKeys = (o: Record<string, unknown>) =>
  Object.keys(((o.practiceHelp as Record<string, unknown>)?.section as Record<string, unknown>) ?? {})

describe('practiceHelp i18n parity', () => {
  it('every locale has the same practiceHelp.* keys as en', () => {
    const base = helpKeys(en).sort()
    expect(base).toEqual(['button', 'close', 'section'])
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: helpKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })

  it('every locale has the same practiceHelp.section.* keys as en', () => {
    const base = sectionKeys(en).sort()
    expect(base).toEqual(['concept', 'howToPlay', 'tip', 'types'])
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: sectionKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
})
