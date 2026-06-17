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

// Keys minted for the account-recovery + credentials work (sign-out error,
// forgot/reset password, change password/email). All 8 locales must carry them.
const KEYS = [
  'auth.sign_out_error',
  'auth.forgot_password',
  'auth.reset_email_sent',
  'auth.reset_need_email',
  'auth.reset_title',
  'auth.reset_invalid',
  'auth.new_password_label',
  'auth.password_min',
  'auth.submit_new_password',
  'auth.password_updated',
  'auth.reset_error',
  'settings.account.security.title',
  'settings.account.password.submit',
  'settings.account.email.title',
  'settings.account.email.submit',
  'settings.account.email.hint',
  'settings.account.email.sent',
  'settings.account.email.error',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('account-recovery i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, k)
        expect(typeof value, `${code} ${k}`).toBe('string')
        expect((value as string).length, `${code} ${k}`).toBeGreaterThan(0)
      }
    })
  }
})
