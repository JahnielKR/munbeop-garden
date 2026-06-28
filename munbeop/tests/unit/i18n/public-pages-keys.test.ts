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

// Keys that back the public welcome pages (pricing / features / policies). They
// used to be hardcoded English in the .vue files; now every locale must define
// them or a non-English user falls back to English copy.
const KEYS = [
  'pricing.title', 'pricing.lead', 'pricing.free', 'pricing.beta_note',
  'pricing.tiers.sprout.cadence', 'pricing.tiers.sprout.b1', 'pricing.tiers.sprout.b2', 'pricing.tiers.sprout.b3',
  'pricing.tiers.grove.cadence', 'pricing.tiers.grove.b1', 'pricing.tiers.grove.b2', 'pricing.tiers.grove.b3',
  'pricing.tiers.forest.cadence', 'pricing.tiers.forest.b1', 'pricing.tiers.forest.b2', 'pricing.tiers.forest.b3',
  'features.title', 'features.lead',
  'features.items.deck.name', 'features.items.deck.desc',
  'features.items.mastery.name', 'features.items.mastery.desc',
  'features.items.bomi.name', 'features.items.bomi.desc',
  'features.items.languages.name', 'features.items.languages.desc',
  'features.items.sync.name', 'features.items.sync.desc',
  'features.items.themes.name', 'features.items.themes.desc',
  'policies.title', 'policies.lead', 'policies.draft_note',
  'policies.items.privacy.heading', 'policies.items.privacy.body',
  'policies.items.terms.heading', 'policies.items.terms.body',
  'policies.items.cookies.heading', 'policies.items.cookies.body',
  'policies.items.contact.heading', 'policies.items.contact.body',
]

describe('public pages i18n parity (pricing / features / policies)', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
})
