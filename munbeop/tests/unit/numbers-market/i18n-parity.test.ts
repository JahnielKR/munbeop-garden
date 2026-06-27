import { describe, it, expect } from 'vitest'
// NOTE: existing i18n tests use a relative import (not the ~~ alias). Match that.
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const LOCALES: Record<string, Record<string, unknown>> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
const KEYS = [
  'numberMarket.title', 'numberMarket.lead', 'numberMarket.build_hint', 'numberMarket.submit',
  'numberMarket.clear', 'numberMarket.undo', 'numberMarket.correct', 'numberMarket.wrong',
  'numberMarket.next', 'numberMarket.score', 'numberMarket.progress', 'numberMarket.restart',
  'numberMarket.replay_failed', 'numberMarket.master.title', 'numberMarket.master.progress',
  'numberMarket.domain.counting', 'numberMarket.domain.sino_basics', 'numberMarket.domain.time',
  'numberMarket.domain.money', 'numberMarket.domain.dates', 'numberMarket.domain.phone',
  'games.numberMarket.name', 'games.numberMarket.desc',
  'numberMarket.mode.label', 'numberMarket.mode.learn', 'numberMarket.mode.speed',
  'numberMarket.speed.deck_mixed', 'numberMarket.speed.best', 'numberMarket.speed.streak',
  'numberMarket.speed.time_up', 'numberMarket.speed.new_record', 'numberMarket.speed.again',
  'numberMarket.speed.start_hint',
]
const get = (o: Record<string, unknown>, path: string) =>
  path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], o)

describe('number-market i18n parity', () => {
  it.each(Object.keys(LOCALES))('%s has every numberMarket key', (code) => {
    for (const key of KEYS) {
      expect(get(LOCALES[code]!, key), `${code} missing ${key}`).toBeTruthy()
    }
  })
})
