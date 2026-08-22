import { describe, it, expect } from 'vitest'
import { LOCALE_CODES, localized, type LocalizedString } from '~/lib/domain'
import { TRANSLATIONS } from '~/seed/escape-room/translations'
import { ESCAPE_LEVEL_CATALOG } from '~/seed/escape-room/catalog'
import { loadAllPlayableLevels } from '~/seed/escape-room/load-level'
import { report as qualityReport } from '../../../tools/audit-escape-translations'

/**
 * Guards the escape-room i18n: the seed is authored in Spanish and translated
 * into the other 7 locales via per-locale dictionaries keyed by the Spanish
 * source string (see app/seed/escape-room/locale.ts). These tests enforce that
 * the dictionaries stay complete and structurally faithful — so the game text
 * follows the platform language instead of always rendering Spanish.
 */

const TARGET = LOCALE_CODES.filter((c) => c !== 'es')
const PLAYABLE_LEVELS = await loadAllPlayableLevels()

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
const quotePairs = [
  ['«', '»'],
  ['“', '”'],
  ['「', '」'],
  ['『', '』'],
] as const
const countToken = (s: string, token: string) => s.split(token).length - 1
const orderedPair = (s: string, open: string, close: string) => {
  let depth = 0
  for (const character of s) {
    if (character === open) depth += 1
    if (character === close) depth -= 1
    if (depth < 0) return false
  }
  return depth === 0
}
const balancedQuotes = (s: string) =>
  quotePairs.every(([open, close]) => orderedPair(s, open, close)) &&
  countToken(s, '"') % 2 === 0
const koreanTokenPattern = /[\u3131-\u318e\uac00-\ud7a3]+/g
const adjacentLatinHangul =
  /[\u3131-\u318e\uac00-\ud7a3][A-Za-zÀ-ɏ]|[A-Za-zÀ-ɏ][\u3131-\u318e\uac00-\ud7a3]/
const mojibake = /\uFFFD|Â[«»·]|Ã[¡©­³º±¼]|â(?:€”|€“|€œ|€|€™|€¦)/u

describe('escape-room translations', () => {
  it('passes the full structural, encoding and semantic quality audit', () => {
    const issueGroups = {
      missing: qualityReport.missingCounts,
      empty: qualityReport.emptyTranslationCounts,
      stale: qualityReport.staleTranslationCounts,
      structure: qualityReport.structuralIssueCounts,
      typography: qualityReport.typographyIssueCounts,
      Korean: qualityReport.koreanTokenIssueCounts,
      spacing: qualityReport.tokenSpacingIssueCounts,
      encoding: qualityReport.encodingIssueCounts,
      length: qualityReport.lengthIssueCounts,
      semantics: qualityReport.semanticIssueCounts,
      untranslatedSpanish: qualityReport.unexpectedIdenticalCounts,
    }
    for (const [group, counts] of Object.entries(issueGroups)) {
      for (const [locale, count] of Object.entries(counts)) {
        expect(count, `${group}: ${locale}`).toBe(0)
      }
    }
    expect(qualityReport.inactiveSemanticRules, 'inactive semantic guardrails').toEqual([])
  })

  it('all 7 target locales match the exact live level 1–10 source inventory', () => {
    const liveKeys = qualityReport.sources.map(({ source }) => source).sort()
    expect(liveKeys.length).toBeGreaterThan(1500)
    for (const loc of TARGET) {
      expect(Object.keys(TRANSLATIONS[loc]).sort(), loc).toEqual(liveKeys)
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

  it('fully localizes every translatable string in levels 1–10', () => {
    for (const ls of walkLocalized([ESCAPE_LEVEL_CATALOG, PLAYABLE_LEVELS])) {
      const es = ls.es
      if (!es || !hasLatin(es)) continue

      for (const locale of TARGET) {
        expect(
          Object.hasOwn(TRANSLATIONS[locale], es),
          `${locale} missing: ${es.slice(0, 80)}`,
        ).toBe(true)
        const translated = localized(ls, locale)
        expect(translated.trim().length, `${locale}: ${es.slice(0, 80)}`).toBeGreaterThan(0)
        expect(balancedQuotes(translated), `quotes ${locale}: ${es.slice(0, 80)}`).toBe(true)
        expect(mojibake.test(translated), `encoding ${locale}: ${es.slice(0, 80)}`).toBe(false)

        for (const token of new Set(es.match(koreanTokenPattern) ?? [])) {
          expect(
            countToken(translated, token),
            `Korean ${token} in ${locale}: ${es.slice(0, 60)}`,
          ).toBe(countToken(es, token))
        }

        if (!adjacentLatinHangul.test(es)) {
          expect(
            adjacentLatinHangul.test(translated),
            `spacing ${locale}: ${es.slice(0, 80)}`,
          ).toBe(false)
        }
      }
    }
  })

  it('renders real, non-Spanish text for the level-01 opening story in every locale', () => {
    const intro = PLAYABLE_LEVELS[0]!.intro
    for (const loc of TARGET) {
      const rendered = localized(intro, loc)
      expect(rendered, loc).not.toBe(intro.es)
      expect(rendered.length, loc).toBeGreaterThan(50)
    }
  })

  it('renders real, non-Spanish text for the meaning-selection options in every locale', () => {
    const level = PLAYABLE_LEVELS[0]!
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
