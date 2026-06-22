// tests/unit/register-transform/i18n-keys.test.ts
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
const topKeys = (o: Record<string, unknown>) => Object.keys((o.register as Record<string, unknown>) ?? {})
const masterKeys = (o: Record<string, unknown>) =>
  Object.keys(((o.register as Record<string, unknown>)?.master as Record<string, unknown>) ?? {})

describe('register i18n parity', () => {
  it('every locale has the same register.* keys as en', () => {
    const base = topKeys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: topKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the same register.master.* keys as en', () => {
    const base = masterKeys(en).sort()
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: masterKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the games.register card keys', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const card = (loc.games as Record<string, Record<string, string>>)?.register
      expect({ name, ok: !!card?.name && !!card?.desc }).toEqual({ name, ok: true })
    }
  })
  it('placeholder strings are preserved', () => {
    for (const loc of Object.values(LOCALES)) {
      const r = loc.register as Record<string, unknown>
      expect(r.summary_score as string).toContain('{correct}')
      expect(r.summary_score as string).toContain('{total}')
      expect(r.diary_note as string).toContain('{chosen}')
      expect(r.diary_note as string).toContain('{correct}')
    }
  })
})
