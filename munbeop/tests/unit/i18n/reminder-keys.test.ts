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
  'reminder.banner', 'reminder.dismiss', 'reminder.notif_title', 'reminder.notif_body',
  'settings.review_reminders.title', 'settings.review_reminders.label', 'settings.review_reminders.hint',
]

describe('reminder.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('reminder.banner and reminder.notif_body keep the {n} placeholder', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'reminder.banner'), code).toContain('{n}')
      expect(dig(msgs, 'reminder.notif_body'), code).toContain('{n}')
    }
  })
})
