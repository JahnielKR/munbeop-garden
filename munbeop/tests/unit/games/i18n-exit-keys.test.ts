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

const EXIT_KEYS = [
  'exit',
  'exit_confirm_title',
  'exit_confirm_body',
  'exit_confirm_leave',
  'exit_confirm_cancel',
] as const

describe('games.exit* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every games.exit* key as a non-empty string`, () => {
      const games = (msgs as { games?: Record<string, unknown> }).games ?? {}
      for (const k of EXIT_KEYS) {
        expect(typeof games[k], `${code} games.${k}`).toBe('string')
        expect((games[k] as string).length, `${code} games.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
