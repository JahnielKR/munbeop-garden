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
const KEYS = [
  'title', 'description', 'button', 'modal_title', 'modal_body',
  'confirm_label', 'confirm_button', 'cancel', 'error',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.account.danger.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every danger key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.account.danger.${k}`)
        expect(typeof value, `${code} ${k}`).toBe('string')
        expect((value as string).length, `${code} ${k}`).toBeGreaterThan(0)
      }
    })
  }
})
