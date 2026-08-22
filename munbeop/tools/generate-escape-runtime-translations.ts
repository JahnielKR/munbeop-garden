import { resolve } from 'node:path'
import { TRANSLATIONS } from '~/seed/escape-room/translations'
import { extractEscapeI18nManifest } from '../scripts/escape-i18n-extract.mjs'
import {
  ESCAPE_TRANSLATION_LOCALES,
  generateEscapeLevelTranslationFiles,
} from '../scripts/escape-i18n-gen.mjs'

const manifest = extractEscapeI18nManifest()
const scope = manifest.scopes.all
const bundle = {
  schemaVersion: manifest.schemaVersion,
  scope: 'all',
  sourceCount: scope.count,
  sourceHash: scope.hash,
  translations: Object.fromEntries(
    ESCAPE_TRANSLATION_LOCALES.map((locale) => [
      locale,
      Object.fromEntries(scope.translatable.map((source) => [source, TRANSLATIONS[locale][source]])),
    ]),
  ),
}

const outputDir = resolve(process.cwd(), 'app/seed/escape-room/translations')
const result = generateEscapeLevelTranslationFiles(manifest, bundle, outputDir)
process.stdout.write(
  `Generated ${result.levels.length} level translation boundaries (${result.files.size} files) in ${result.outputDir}\n`,
)
