import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'
import { TOPIK_LEVELS, themesOfLevel } from '~/lib/domain'
import { themeTitleKey } from '~/lib/garden'

/**
 * The garden tree-zone tooltip, the library filter chip and the study-sheet
 * breadcrumb all show a TOPIK theme's display title through i18n, keyed by the
 * stable spine theme id (`garden.theme.<id>`). These tests guarantee:
 *   1. the key builder is stable, and
 *   2. EVERY spine theme has a non-empty translation in EVERY UI locale, with
 *      no orphan keys — so a theme title can never fall back to the raw
 *      Spanish spine string (the bug this fixes) and locales never drift.
 */
const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }

const themeIds = TOPIK_LEVELS.flatMap((l) => themesOfLevel(l).map((t) => t.id))

function themeMap(msgs: unknown): Record<string, unknown> {
  return ((msgs as { garden?: { theme?: Record<string, unknown> } })?.garden?.theme) ?? {}
}

describe('themeTitleKey', () => {
  it('builds the garden.theme.<id> key', () => {
    expect(themeTitleKey('n1-particles')).toBe('garden.theme.n1-particles')
    expect(themeTitleKey('n6-meta-tables')).toBe('garden.theme.n6-meta-tables')
  })
})

describe('garden.theme i18n parity', () => {
  it('the spine exposes the expected 43 theme ids', () => {
    expect(themeIds).toHaveLength(43)
    expect(new Set(themeIds).size).toBe(themeIds.length) // ids are unique
  })

  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines a non-empty title for every spine theme`, () => {
      const map = themeMap(msgs)
      for (const tid of themeIds) {
        expect(typeof map[tid], `${code}.${tid}`).toBe('string')
        expect((map[tid] as string).trim().length, `${code}.${tid}`).toBeGreaterThan(0)
      }
    })

    it(`${code} has no orphan garden.theme keys`, () => {
      expect(Object.keys(themeMap(msgs)).sort()).toEqual([...themeIds].sort())
    })
  }
})
