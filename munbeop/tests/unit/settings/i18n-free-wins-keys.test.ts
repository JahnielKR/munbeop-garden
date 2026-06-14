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
  'about.title', 'about.contact',
  'data.title', 'data.export', 'data.exported', 'data.export_error',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.about/data.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.${k}`)
        expect(typeof value, `${code} settings.${k}`).toBe('string')
        expect((value as string).length, `${code} settings.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
