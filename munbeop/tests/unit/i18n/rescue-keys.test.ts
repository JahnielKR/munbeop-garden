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
  'rescue.title',
  'rescue.header',
  'rescue.header_plain',
  'rescue.stage_reread',
  'rescue.stage_examples',
  'rescue.stage_discriminate',
  'rescue.stage_produce',
  'rescue.produce_body',
  'rescue.produce_cta',
  'rescue.next',
  'rescue.back',
  'rescue.empty',
  'stats.struggling.title',
  'stats.struggling.sub',
  'stats.struggling.care',
  'practice.rescue_offer',
  'practice.rescue_offer_dismiss',
]

describe('rescue/struggling i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('rescue.header keeps the {dimension} placeholder', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'rescue.header'), code).toContain('{dimension}')
    }
  })
  it('rescue.produce_cta keeps 화이팅', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'rescue.produce_cta'), code).toContain('화이팅')
    }
  })
})
