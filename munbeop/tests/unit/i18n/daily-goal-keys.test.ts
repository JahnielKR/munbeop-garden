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
  'garden.goal.label', 'garden.goal.aria', 'garden.goal.done',
  'settings.daily_goal.title', 'settings.daily_goal.label', 'settings.daily_goal.hint',
]

describe('daily goal i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('label/aria keep {count} and {goal}; done keeps 화이팅', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      for (const k of ['garden.goal.label', 'garden.goal.aria']) {
        expect(dig(msgs, k), `${code} ${k}`).toContain('{count}')
        expect(dig(msgs, k), `${code} ${k}`).toContain('{goal}')
      }
      expect(dig(msgs, 'garden.goal.done'), code).toContain('화이팅')
    }
  })
})
