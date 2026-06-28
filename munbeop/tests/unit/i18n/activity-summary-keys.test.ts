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

// The activity-heatmap grid summary (accessible name for screen readers).
describe('activity grid_summary i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines a non-empty stats.activity.grid_summary`, () => {
      const v = dig(msgs, 'stats.activity.grid_summary')
      expect(typeof v, code).toBe('string')
      expect((v as string).length).toBeGreaterThan(0)
    })
    it(`${code} keeps the {year} {days} {total} placeholders`, () => {
      const v = dig(msgs, 'stats.activity.grid_summary') as string
      expect(v, code).toContain('{year}')
      expect(v, code).toContain('{days}')
      expect(v, code).toContain('{total}')
    })
  }
})
