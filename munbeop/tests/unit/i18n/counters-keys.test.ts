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
  'counters.title', 'counters.lead', 'counters.correct', 'counters.wrong', 'counters.next',
  'counters.score', 'counters.replay_failed', 'counters.replay_mode', 'counters.restart', 'counters.progress',
  'counters.set.people_animals', 'counters.set.books_paper', 'counters.set.food_drink',
  'counters.set.time_age', 'counters.set.things', 'counters.set.money_order',
  'counters.master.label', 'counters.master.progress', 'counters.master.earned',
  'counters.master.celebrate_body', 'counters.master.dismiss',
  'counters.master.pip_done', 'counters.master.pip_todo',
  'counters.persistence.saving', 'counters.persistence.failed', 'counters.persistence.retry',
  'games.counters.name', 'games.counters.desc',
]

describe('counters.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('counters.score keeps {correct} and {total}', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      const s = dig(msgs, 'counters.score') as string
      expect(s, code).toContain('{correct}')
      expect(s, code).toContain('{total}')
    }
  })
  it('counters.master progress placeholders survive translation', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      const progress = dig(msgs, 'counters.master.progress') as string
      const celebration = dig(msgs, 'counters.master.celebrate_body') as string
      expect(progress, code).toContain('{done}')
      expect(progress, code).toContain('{total}')
      expect(celebration, code).toContain('{total}')
    }
  })
})
