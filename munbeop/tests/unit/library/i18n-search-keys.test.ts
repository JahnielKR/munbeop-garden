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

function searchKeys(obj: unknown): string[] {
  const root = (obj as { library?: { search?: Record<string, unknown> } })?.library?.search
  const out: string[] = []
  const walk = (o: Record<string, unknown>, p: string) => {
    for (const k of Object.keys(o)) {
      const key = p ? `${p}.${k}` : k
      const v = o[k]
      if (v && typeof v === 'object') walk(v as Record<string, unknown>, key)
      else out.push(key)
    }
  }
  if (root) walk(root, '')
  return out.sort()
}

describe('library.search i18n parity', () => {
  const reference = searchKeys(en)
  it('en defines the full search key set', () => {
    expect(reference).toContain('placeholder')
    expect(reference).toContain('result_count')
    expect(reference).toContain('category.particle')
    expect(reference).toContain('category.meta')
  })
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} has identical library.search keys to en`, () => {
      expect(searchKeys(msgs)).toEqual(reference)
    })
  }
})

describe('library.orphan_section i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines library.orphan_section as a non-empty string`, () => {
      const value = (msgs as { library?: { orphan_section?: unknown } })?.library?.orphan_section
      expect(typeof value, code).toBe('string')
      expect((value as string).length, code).toBeGreaterThan(0)
    })
  }
})

describe('library.focus i18n parity', () => {
  const FOCUS_KEYS = ['include', 'exclude', 'label'] as const
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every library.focus string`, () => {
      const focus = (msgs as { library?: { focus?: Record<string, unknown> } })?.library?.focus
      expect(focus, code).toBeTruthy()
      for (const k of FOCUS_KEYS) {
        expect(typeof focus?.[k], `${code}.${k}`).toBe('string')
        expect((focus?.[k] as string).length, `${code}.${k}`).toBeGreaterThan(0)
      }
    })
  }
})

describe('library.pronunciation i18n parity', () => {
  const PRON_KEYS = ['title', 'by_parts', 'in_sentence', 'play_all', 'play_syllable'] as const
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every library.pronunciation string`, () => {
      const pron = (msgs as { library?: { pronunciation?: Record<string, unknown> } })?.library?.pronunciation
      expect(pron, code).toBeTruthy()
      for (const k of PRON_KEYS) {
        expect(typeof pron?.[k], `${code}.${k}`).toBe('string')
        expect((pron?.[k] as string).length, `${code}.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
