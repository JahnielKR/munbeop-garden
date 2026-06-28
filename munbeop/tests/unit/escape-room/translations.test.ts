import { describe, it, expect } from 'vitest'
import { LOCALE_CODES, localized, type LocalizedString } from '~/lib/domain'
import { TRANSLATIONS } from '~/seed/escape-room/translations'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'

/**
 * Guards the escape-room i18n: the seed is authored in Spanish and translated
 * into the other 7 locales via per-locale dictionaries keyed by the Spanish
 * source string (see app/seed/escape-room/locale.ts). These tests enforce that
 * the dictionaries stay complete and structurally faithful — so the game text
 * follows the platform language instead of always rendering Spanish.
 */

const TARGET = LOCALE_CODES.filter((c) => c !== 'es')

/** Does this string carry real prose (a Latin letter) vs. being Korean-only? */
const hasLatin = (s: string) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s)

/** Walk any seed value, yielding every embedded LocalizedString once. */
function* walkLocalized(node: unknown): Generator<LocalizedString> {
  if (Array.isArray(node)) {
    for (const x of node) yield* walkLocalized(x)
    return
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (LOCALE_CODES.every((c) => typeof obj[c] === 'string')) {
      yield obj as unknown as LocalizedString
      return // a LocalizedString is a leaf — don't recurse into its locales
    }
    for (const v of Object.values(obj)) yield* walkLocalized(v)
  }
}

const nn = (s: string) => s.split('\n\n').length
const fw = (s: string) => s.split('{farewell}').length

describe('escape-room translations', () => {
  it('all 7 target locales share the exact same key set', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort()
    expect(enKeys.length).toBeGreaterThan(400)
    for (const loc of TARGET) {
      expect(Object.keys(TRANSLATIONS[loc]).sort(), loc).toEqual(enKeys)
    }
  })

  it('no translation value is empty', () => {
    for (const loc of TARGET) {
      for (const [k, v] of Object.entries(TRANSLATIONS[loc])) {
        expect(v.trim().length, `${loc} → ${k.slice(0, 40)}`).toBeGreaterThan(0)
      }
    }
  })

  it('preserves the {farewell} placeholder and paragraph structure', () => {
    for (const loc of TARGET) {
      for (const [es, tgt] of Object.entries(TRANSLATIONS[loc])) {
        const tag = `${loc}: ${es.slice(0, 30)}`
        expect(fw(tgt), `{farewell} ${tag}`).toBe(fw(es))
        expect(nn(tgt), `\\n\\n ${tag}`).toBe(nn(es))
      }
    }
  })

  it('every translatable string in the whole seed has a dictionary entry (drift guard)', () => {
    const missing = new Set<string>()
    for (const ls of walkLocalized(LEVEL_REGISTRY)) {
      const es = ls.es
      if (es && hasLatin(es) && !(es in TRANSLATIONS.en)) missing.add(es)
    }
    expect([...missing]).toEqual([])
  })

  it('renders real, non-Spanish text for the level-01 opening story in every locale', () => {
    const intro = LEVEL_REGISTRY[0]!.level!.intro
    for (const loc of TARGET) {
      const rendered = localized(intro, loc)
      expect(rendered, loc).not.toBe(intro.es)
      expect(rendered.length, loc).toBeGreaterThan(50)
    }
  })

  it('renders real, non-Spanish text for the meaning-selection options in every locale', () => {
    const level = LEVEL_REGISTRY[0]!.level!
    const slot = level.slots[0]!
    if (slot.type !== 'selection') throw new Error('expected slot-1 to be selection')
    const candidate = slot.candidates[0]!
    for (const loc of TARGET) {
      expect(localized(candidate.question, loc), `question ${loc}`).not.toBe(candidate.question.es)
      for (const opt of candidate.options) {
        expect(localized(opt, loc), `option ${loc}`).not.toBe(opt.es)
      }
    }
  })

  it('keeps Korean cosmetic/easter-egg text identical across locales (es fallback)', () => {
    // Pure-Korean strings have no dictionary entry and must resolve to the same
    // Korean text in every locale (the app does not translate Korean).
    const koreanOnly = '한국어 교과서'
    const ls = t_clone(koreanOnly)
    for (const loc of LOCALE_CODES) {
      expect(localized(ls, loc), loc).toBe(koreanOnly)
    }
  })
})

/** Mirror of seed `t()` for the fallback assertion, without importing the helper. */
function t_clone(es: string): LocalizedString {
  return Object.fromEntries(
    LOCALE_CODES.map((c) => [c, (TRANSLATIONS[c]?.[es] ?? es) as string]),
  ) as LocalizedString
}
