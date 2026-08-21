import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALE_CODES, type LocalizedString } from '~/lib/domain'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'
import { en } from '~/seed/escape-room/translations/en'
import { fr } from '~/seed/escape-room/translations/fr'
import { id } from '~/seed/escape-room/translations/id'
import { ja } from '~/seed/escape-room/translations/ja'
import { ptBR } from '~/seed/escape-room/translations/pt-BR'
import { th } from '~/seed/escape-room/translations/th'
import { vi } from '~/seed/escape-room/translations/vi'
import { enLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/en'
import { frLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/fr'
import { idLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/id'
import { jaLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/ja'
import { ptBRLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/pt-BR'
import { thLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/th'
import { viLevels04To10 } from '~/seed/escape-room/translations/levels-04-10/vi'
import {
  extractEscapeI18nManifest,
  ESCAPE_I18N_MANIFEST_VERSION,
} from '../../../scripts/escape-i18n-extract.mjs'
import {
  buildEscapeTranslationFiles,
  ESCAPE_TRANSLATION_LOCALES,
  generateEscapeTranslationFiles,
  validateEscapeTranslationBundle,
} from '../../../scripts/escape-i18n-gen.mjs'

const SEED_DIR = resolve(process.cwd(), 'app/seed/escape-room')
const hasLatin = (value: string) => /\p{Script=Latin}/u.test(value)

const translationLayers = {
  en: [en, enLevels04To10],
  fr: [fr, frLevels04To10],
  'pt-BR': [ptBR, ptBRLevels04To10],
  th: [th, thLevels04To10],
  id: [id, idLevels04To10],
  vi: [vi, viLevels04To10],
  ja: [ja, jaLevels04To10],
} as const

function* walkLocalized(node: unknown): Generator<LocalizedString> {
  if (Array.isArray(node)) {
    for (const value of node) yield* walkLocalized(value)
    return
  }
  if (!node || typeof node !== 'object') return

  const object = node as Record<string, unknown>
  if (LOCALE_CODES.every((locale) => typeof object[locale] === 'string')) {
    yield object as unknown as LocalizedString
    return
  }
  for (const value of Object.values(object)) yield* walkLocalized(value)
}

function sorted(values: Iterable<string>) {
  return [...values].sort()
}

function runtimeSources() {
  return new Set(
    [...walkLocalized(LEVEL_REGISTRY)]
      .map((localized) => localized.es)
      .filter((source) => source.length > 0 && hasLatin(source)),
  )
}

function translationBundle(manifest: ReturnType<typeof extractEscapeI18nManifest>, scope: string) {
  const sources = manifest.scopes[scope].translatable
  return {
    schemaVersion: ESCAPE_I18N_MANIFEST_VERSION,
    scope,
    sourceCount: manifest.scopes[scope].count,
    sourceHash: manifest.scopes[scope].hash,
    translations: Object.fromEntries(
      ESCAPE_TRANSLATION_LOCALES.map((locale) => [
        locale,
        Object.fromEntries(
          sources.map((source, index) => [source, `${scope} ${locale} translation ${index}`]),
        ),
      ]),
    ),
  }
}

describe('escape-room i18n manifest', () => {
  it('matches the exact 1530-source runtime inventory and partitions it without overlap', () => {
    const runtime = runtimeSources()
    const manifest = extractEscapeI18nManifest(SEED_DIR)
    const extracted = new Set(manifest.scopes.all.translatable)
    const base = new Set(manifest.scopes.base.translatable)
    const extension = new Set(manifest.scopes.extension.translatable)

    expect(runtime.size).toBe(1530)
    expect(extracted.size).toBe(1530)
    expect(sorted(extracted)).toEqual(sorted(runtime))
    expect(sorted([...base].filter((source) => extension.has(source)))).toEqual([])
    expect(sorted(new Set([...base, ...extension]))).toEqual(sorted(runtime))
    expect(manifest.records.every((record) => record.origins.length > 0)).toBe(true)
  })

  it('keeps every checked-in base locale disjoint from its extension and complete together', () => {
    const runtime = runtimeSources()

    for (const [locale, [baseMap, extensionMap]] of Object.entries(translationLayers)) {
      const base = new Set(Object.keys(baseMap))
      const extension = new Set(Object.keys(extensionMap))
      const overlap = [...base].filter((source) => extension.has(source))

      expect(overlap, `${locale}: duplicated across base and extension`).toEqual([])
      expect(
        sorted(new Set([...base, ...extension])),
        `${locale}: base + extension inventory`,
      ).toEqual(sorted(runtime))
    }
  })

  it('rejects an unexpected non-literal t() call', () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'escape-i18n-extract-'))
    try {
      writeFileSync(join(fixtureDir, 'registry.ts'), 'export const registry = []\n', 'utf8')
      writeFileSync(
        join(fixtureDir, 'level-01.ts'),
        "import { t } from './locale'\nconst source = 'dynamic'\nexport function selection(question: string) { return [t(question), t(source)] }\n",
        'utf8',
      )

      expect(() => extractEscapeI18nManifest(fixtureDir)).toThrow(
        /unexpected non-literal t\(\): source/u,
      )
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('rejects translation input tied to a stale inventory', () => {
    const manifest = extractEscapeI18nManifest(SEED_DIR)
    expect(() =>
      validateEscapeTranslationBundle(manifest, {
        schemaVersion: ESCAPE_I18N_MANIFEST_VERSION,
        scope: 'all',
        sourceCount: manifest.scopes.all.count - 1,
        sourceHash: manifest.scopes.all.hash,
        translations: {},
      }),
    ).toThrow(/translation inventory is stale/u)
  })

  it('builds the base and extension architecture reproducibly from source keys', () => {
    const manifest = extractEscapeI18nManifest(SEED_DIR)
    const bundle = translationBundle(manifest, 'all')

    const first = buildEscapeTranslationFiles(manifest, bundle)
    const second = buildEscapeTranslationFiles(manifest, bundle)
    expect([...first.files]).toEqual([...second.files])
    expect([...first.files.keys()]).toEqual([
      'en.ts',
      'fr.ts',
      'pt-BR.ts',
      'th.ts',
      'id.ts',
      'vi.ts',
      'ja.ts',
      'levels-04-10/en.ts',
      'levels-04-10/fr.ts',
      'levels-04-10/pt-BR.ts',
      'levels-04-10/th.ts',
      'levels-04-10/id.ts',
      'levels-04-10/vi.ts',
      'levels-04-10/ja.ts',
      'index.ts',
    ])
    expect(first.files.get('en.ts')).toContain(`source-count: ${manifest.scopes.base.count}`)
    expect(first.files.get('levels-04-10/en.ts')).toContain(
      `source-count: ${manifest.scopes.extension.count}`,
    )
  })

  it('accepts a partial generation when all counterpart maps match the manifest', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'escape-i18n-generate-valid-'))
    try {
      const manifest = extractEscapeI18nManifest(SEED_DIR)
      generateEscapeTranslationFiles(manifest, translationBundle(manifest, 'all'), outputDir)
      const basePath = join(outputDir, 'en.ts')
      const extensionPath = join(outputDir, 'levels-04-10/en.ts')
      const baseBefore = readFileSync(basePath, 'utf8')
      const extensionBefore = readFileSync(extensionPath, 'utf8')

      generateEscapeTranslationFiles(manifest, translationBundle(manifest, 'extension'), outputDir)

      expect(readFileSync(basePath, 'utf8')).toBe(baseBefore)
      expect(readFileSync(extensionPath, 'utf8')).not.toBe(extensionBefore)
      expect(readFileSync(extensionPath, 'utf8')).toContain('extension en translation 0')

      const extensionAfter = readFileSync(extensionPath, 'utf8')
      generateEscapeTranslationFiles(manifest, translationBundle(manifest, 'base'), outputDir)
      expect(readFileSync(extensionPath, 'utf8')).toBe(extensionAfter)
      expect(readFileSync(basePath, 'utf8')).not.toBe(baseBefore)
      expect(readFileSync(basePath, 'utf8')).toContain('base en translation 0')
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  it('rejects a partial generation before writes when a counterpart map is incompatible', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'escape-i18n-generate-invalid-'))
    try {
      const manifest = extractEscapeI18nManifest(SEED_DIR)
      generateEscapeTranslationFiles(manifest, translationBundle(manifest, 'all'), outputDir)
      const basePath = join(outputDir, 'en.ts')
      const extensionPath = join(outputDir, 'levels-04-10/en.ts')
      const extensionBefore = readFileSync(extensionPath, 'utf8')
      const overlappingSource = manifest.scopes.extension.translatable[0]
      writeFileSync(basePath, 'export const en: Record<string, string> = {}\n', 'utf8')
      writeFileSync(
        join(outputDir, 'fr.ts'),
        `export const fr: Record<string, string> = { ${JSON.stringify(overlappingSource)}: "overlap" }\n`,
        'utf8',
      )

      expect(() =>
        generateEscapeTranslationFiles(
          manifest,
          translationBundle(manifest, 'extension'),
          outputDir,
        ),
      ).toThrow(/Use scope=all[\s\S]*missing \d+[\s\S]*overlap 1/u)
      expect(readFileSync(extensionPath, 'utf8')).toBe(extensionBefore)
    } finally {
      rmSync(outputDir, { recursive: true, force: true })
    }
  })
})
