import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createEscapeTranslator,
  type EscapeLevelTranslations,
} from '~/seed/escape-room/create-translator'
import { TRANSLATIONS } from '~/seed/escape-room/translations'
import { extractEscapeI18nManifest } from '../../../scripts/escape-i18n-extract.mjs'

const SEED_DIR = resolve(process.cwd(), 'app/seed/escape-room')
const LEVEL_IDS = Array.from({ length: 10 }, (_, index) => `level-${String(index + 1).padStart(2, '0')}`)
const TARGET_LOCALES = ['en', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

const TRANSLATION_LOADERS: Record<string, () => Promise<EscapeLevelTranslations>> = {
  'level-01': () =>
    import('~/seed/escape-room/translations/levels/level-01').then(
      (module) => module.LEVEL_01_TRANSLATIONS,
    ),
  'level-02': () =>
    import('~/seed/escape-room/translations/levels/level-02').then(
      (module) => module.LEVEL_02_TRANSLATIONS,
    ),
  'level-03': () =>
    import('~/seed/escape-room/translations/levels/level-03').then(
      (module) => module.LEVEL_03_TRANSLATIONS,
    ),
  'level-04': () =>
    import('~/seed/escape-room/translations/levels/level-04').then(
      (module) => module.LEVEL_04_TRANSLATIONS,
    ),
  'level-05': () =>
    import('~/seed/escape-room/translations/levels/level-05').then(
      (module) => module.LEVEL_05_TRANSLATIONS,
    ),
  'level-06': () =>
    import('~/seed/escape-room/translations/levels/level-06').then(
      (module) => module.LEVEL_06_TRANSLATIONS,
    ),
  'level-07': () =>
    import('~/seed/escape-room/translations/levels/level-07').then(
      (module) => module.LEVEL_07_TRANSLATIONS,
    ),
  'level-08': () =>
    import('~/seed/escape-room/translations/levels/level-08').then(
      (module) => module.LEVEL_08_TRANSLATIONS,
    ),
  'level-09': () =>
    import('~/seed/escape-room/translations/levels/level-09').then(
      (module) => module.LEVEL_09_TRANSLATIONS,
    ),
  'level-10': () =>
    import('~/seed/escape-room/translations/levels/level-10').then(
      (module) => module.LEVEL_10_TRANSLATIONS,
    ),
}

describe('escape-room translation bundle boundaries', () => {
  it('makes every playable level depend only on its matching translation shard', () => {
    for (const levelId of LEVEL_IDS) {
      const levelSource = readFileSync(resolve(SEED_DIR, `${levelId}.ts`), 'utf8')
      expect(levelSource, levelId).toContain(`from './translations/levels/${levelId}'`)
      expect(levelSource, `${levelId}: legacy global helper`).not.toContain("from './locale'")

      const shardIndex = readFileSync(
        resolve(SEED_DIR, `translations/levels/${levelId}/index.ts`),
        'utf8',
      )
      expect(shardIndex, `${levelId}: factory`).toContain("from '../../../create-translator'")
      expect(shardIndex, `${levelId}: aggregate index`).not.toMatch(
        /from ['"][^'"]*translations(?:\/index)?['"]/u,
      )
      for (const locale of TARGET_LOCALES) {
        expect(shardIndex, `${levelId}: ${locale}`).toContain(`from './${locale}'`)
      }
    }
  })

  it('keeps each runtime shard complete and disjoint at all seven target locales', async () => {
    const manifest = extractEscapeI18nManifest(SEED_DIR)
    const translatedSources = new Set(manifest.scopes.all.translatable)
    const runtimeSources = new Set(
      manifest.records
        .filter(
          (record) =>
            translatedSources.has(record.source) &&
            record.origins.some((origin) => origin.file === `${origin.levelId}.ts`),
        )
        .map((record) => record.source),
    )
    const seen = new Set<string>()

    for (const levelId of LEVEL_IDS) {
      const expected = manifest.records
        .filter(
          (record) =>
            translatedSources.has(record.source) &&
            record.origins.some(
              (origin) => origin.levelId === levelId && origin.file === `${levelId}.ts`,
            ),
        )
        .map((record) => record.source)
        .sort()
      const translations = await TRANSLATION_LOADERS[levelId]!()

      expect(Object.keys(translations).sort(), `${levelId}: locales`).toEqual(
        [...TARGET_LOCALES].sort(),
      )
      for (const locale of TARGET_LOCALES) {
        const dictionary = translations[locale]
        expect(Object.keys(dictionary).sort(), `${levelId}: ${locale}`).toEqual(expected)
        expect(
          Object.values(dictionary).every((value) => value.trim().length > 0),
          `${levelId}: ${locale} non-empty`,
        ).toBe(true)
        for (const source of expected) {
          expect(dictionary[source], `${levelId}: ${locale}: ${source}`).toBe(
            TRANSLATIONS[locale][source],
          )
        }
      }

      for (const source of expected) {
        expect(seen.has(source), `${levelId}: duplicate source ${source}`).toBe(false)
        seen.add(source)
      }
    }

    expect([...seen].sort()).toEqual([...runtimeSources].sort())
  })

  it('materializes all eight locales and falls back to Spanish for Korean-only copy', () => {
    const target = Object.fromEntries(
      TARGET_LOCALES.map((locale) => [locale, { hola: `${locale}: hello` }]),
    ) as EscapeLevelTranslations
    const translate = createEscapeTranslator(target)

    expect(translate('hola')).toEqual({
      en: 'en: hello',
      es: 'hola',
      fr: 'fr: hello',
      'pt-BR': 'pt-BR: hello',
      th: 'th: hello',
      id: 'id: hello',
      vi: 'vi: hello',
      ja: 'ja: hello',
    })
    expect(new Set(Object.values(translate('한국어')))).toEqual(new Set(['한국어']))
  })
})
