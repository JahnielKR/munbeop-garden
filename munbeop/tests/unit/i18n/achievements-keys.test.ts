import { describe, it, expect } from 'vitest'
import { achievementsFor } from '~/lib/achievements'
import type { SrsState } from '~/lib/domain'
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

// Drive the parity check from the real badge set so a new achievement without
// translations fails here.
const srs: SrsState = { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' }
const IDS = achievementsFor(srs, []).map((a) => a.id)

describe('library.achievements.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines the achievements title`, () => {
      const v = dig(msgs, 'library.achievements.title')
      expect(typeof v, code).toBe('string')
      expect((v as string).length, code).toBeGreaterThan(0)
    })
    for (const aid of IDS) {
      for (const field of ['name', 'desc'] as const) {
        it(`${code} defines library.achievements.${aid}.${field}`, () => {
          const v = dig(msgs, `library.achievements.${aid}.${field}`)
          expect(typeof v, `${code} ${aid}.${field}`).toBe('string')
          expect((v as string).length, `${code} ${aid}.${field}`).toBeGreaterThan(0)
        })
      }
    }
  }
})
