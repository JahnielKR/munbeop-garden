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

const KEYS = [
  'stats.empty',
  'stats.hero.sentences',
  'stats.hero.streak',
  'stats.hero.mastered',
  'stats.hero.pending',
  'stats.mastery.title',
  'stats.mastery.sub',
  'stats.rhythm.title',
  'stats.rhythm.sub',
  'stats.rhythm.easy',
  'stats.rhythm.hard',
  'stats.contexts.title',
  'stats.contexts.sub',
  'stats.toughest.title',
  'stats.toughest.sub',
  'stats.toughest.practice',
  'stats.toughest.hard_count',
]

describe('stats.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key} as a non-empty string`, () => {
        const value = dig(msgs, key)
        expect(typeof value, `${code} ${key}`).toBe('string')
        expect((value as string).length, `${code} ${key}`).toBeGreaterThan(0)
      })
    }
  }
  it('every locale keeps the {n} placeholder in toughest.hard_count', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'stats.toughest.hard_count'), code).toContain('{n}')
    }
  })
})
