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

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

// The /log review control's copy must exist in every locale (the project keeps
// all 8 locales at parity — a missing key would render the raw key string).
const KEYS = [
  'journal.mark_reviewed',
  'journal.reviewed',
  'journal.note_label',
  // Navigable-journal pass (#7b): search, pagination, delete.
  'journal.search_placeholder',
  'journal.load_more',
  'journal.no_results',
  'journal.delete',
  'journal.delete_confirm_title',
  'journal.delete_confirm_body',
  'journal.deleted',
  'journal.cancel',
]

describe('journal.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key} as a non-empty string`, () => {
        const value = dig(msgs, key)
        expect(typeof value, `${code} ${key}`).toBe('string')
        expect((value as string).length, `${code} ${key}`).toBeGreaterThan(0)
      })
    }
  }
})
