import { describe, it, expect } from 'vitest'
import { globalAchievementsFor } from '~/lib/achievements/global'
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

// Drive from the real trophy set so a new trophy without translations fails here.
const IDS = globalAchievementsFor({
  reviews: 0,
  trees: 0,
  catalogTotal: 0,
  byLevel: {},
  streak: 0,
  leeches: 0,
}).map((a) => a.id)

describe('stats.achievements.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of ['title', 'sub'] as const) {
      it(`${code} defines stats.achievements.${key}`, () => {
        const v = dig(msgs, `stats.achievements.${key}`)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length, `${code} ${key}`).toBeGreaterThan(0)
      })
    }
    for (const aid of IDS) {
      for (const field of ['name', 'desc'] as const) {
        it(`${code} defines stats.achievements.${aid}.${field}`, () => {
          const v = dig(msgs, `stats.achievements.${aid}.${field}`)
          expect(typeof v, `${code} ${aid}.${field}`).toBe('string')
          expect((v as string).length, `${code} ${aid}.${field}`).toBeGreaterThan(0)
        })
      }
    }
  }
})
