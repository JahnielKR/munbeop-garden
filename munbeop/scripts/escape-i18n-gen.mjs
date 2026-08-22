// Generate the escape-room translation dictionaries from a source-keyed bundle.
//
// CLI:
//   node scripts/escape-i18n-gen.mjs <manifest.json> <translations.json> <outdir>
//
// translations.json:
// {
//   "schemaVersion": 2,
//   "scope": "all", // "all", "base", or "extension"
//   "sourceCount": 1530,
//   "sourceHash": "<manifest.scopes.all.hash>",
//   "translations": {
//     "en": { "<exact Spanish source>": "<translation>" },
//     ...
//   }
// }
//
// Every locale must contain the exact source set for the declared scope. The
// manifest count and hash must also match, so stale or index-shifted input fails
// before any output file is written. The base/extension maps remain the
// aggregate audit source, while `levels/<id>/` contains the runtime boundary
// consumed by each playable level.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { ESCAPE_I18N_MANIFEST_VERSION, hashEscapeSources } from './escape-i18n-extract.mjs'

export const ESCAPE_TRANSLATION_LOCALES = Object.freeze([
  'en',
  'fr',
  'pt-BR',
  'th',
  'id',
  'vi',
  'ja',
])

const IDENT = Object.freeze({
  en: 'en',
  fr: 'fr',
  'pt-BR': 'ptBR',
  th: 'th',
  id: 'id',
  vi: 'vi',
  ja: 'ja',
})
const SCOPE_NAMES = Object.freeze(['all', 'base', 'extension'])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of strings`)
  }
  const duplicates = value.filter((item, index) => value.indexOf(item) !== index)
  if (duplicates.length > 0) {
    throw new Error(
      `${label} contains duplicate sources: ${JSON.stringify([...new Set(duplicates)])}`,
    )
  }
  return value
}

function difference(left, right) {
  const rightSet = new Set(right)
  return left.filter((item) => !rightSet.has(item))
}

function requireExactSet(actual, expected, label) {
  const missing = difference(expected, actual)
  const extra = difference(actual, expected)
  if (missing.length > 0 || extra.length > 0) {
    const details = []
    if (missing.length > 0)
      details.push(`missing ${missing.length}: ${JSON.stringify(missing.slice(0, 3))}`)
    if (extra.length > 0)
      details.push(`extra ${extra.length}: ${JSON.stringify(extra.slice(0, 3))}`)
    throw new Error(`${label} does not match the manifest (${details.join('; ')})`)
  }
}

function validateScope(scope, name) {
  if (!isRecord(scope)) throw new Error(`manifest.scopes.${name} must be an object`)

  const all = stringArray(scope.all, `manifest.scopes.${name}.all`)
  const translatable = stringArray(scope.translatable, `manifest.scopes.${name}.translatable`)
  const koreanOnly = stringArray(scope.koreanOnly, `manifest.scopes.${name}.koreanOnly`)

  requireExactSet([...translatable, ...koreanOnly], all, `manifest.scopes.${name} partitions`)
  if (difference(translatable, koreanOnly).length !== translatable.length) {
    throw new Error(`manifest.scopes.${name} has a source in both translation partitions`)
  }
  if (scope.count !== translatable.length) {
    throw new Error(
      `manifest.scopes.${name}.count is ${scope.count}; expected ${translatable.length}`,
    )
  }
  const expectedHash = hashEscapeSources(translatable)
  if (scope.hash !== expectedHash) {
    throw new Error(
      `manifest.scopes.${name}.hash is stale; expected ${expectedHash}, received ${String(scope.hash)}`,
    )
  }

  return { all, translatable, koreanOnly, count: scope.count, hash: scope.hash }
}

/** Validate both the inventory and its base/extension ownership contract. */
export function validateEscapeI18nManifest(manifest) {
  if (!isRecord(manifest)) throw new Error('manifest must be a JSON object')
  if (manifest.schemaVersion !== ESCAPE_I18N_MANIFEST_VERSION) {
    throw new Error(
      `unsupported manifest schemaVersion ${String(manifest.schemaVersion)}; expected ${ESCAPE_I18N_MANIFEST_VERSION}`,
    )
  }
  if (!isRecord(manifest.scopes)) throw new Error('manifest.scopes must be an object')

  const scopes = Object.fromEntries(
    SCOPE_NAMES.map((name) => [name, validateScope(manifest.scopes[name], name)]),
  )

  requireExactSet(
    [...scopes.base.all, ...scopes.extension.all],
    scopes.all.all,
    'manifest base/extension sources',
  )
  if (difference(scopes.base.all, scopes.extension.all).length !== scopes.base.all.length) {
    throw new Error('manifest base and extension scopes overlap')
  }

  if (!Array.isArray(manifest.records)) throw new Error('manifest.records must be an array')
  const recordSources = manifest.records.map((record, index) => {
    if (!isRecord(record) || typeof record.source !== 'string') {
      throw new Error(`manifest.records[${index}] must contain a string source`)
    }
    if (!['base', 'extension'].includes(record.owner)) {
      throw new Error(`manifest.records[${index}].owner must be base or extension`)
    }
    if (!Array.isArray(record.origins) || record.origins.length === 0) {
      throw new Error(`manifest.records[${index}].origins must not be empty`)
    }
    const originScopes = new Set()
    record.origins.forEach((origin, originIndex) => {
      if (!isRecord(origin) || !['base', 'extension'].includes(origin.scope)) {
        throw new Error(
          `manifest.records[${index}].origins[${originIndex}] must expose a valid scope`,
        )
      }
      if (typeof origin.file !== 'string' || !Number.isInteger(origin.line)) {
        throw new Error(
          `manifest.records[${index}].origins[${originIndex}] must expose file and line`,
        )
      }
      originScopes.add(origin.scope)
    })
    const expectedOwner = originScopes.has('base') ? 'base' : 'extension'
    if (record.owner !== expectedOwner) {
      throw new Error(
        `manifest.records[${index}] has owner ${record.owner}; expected ${expectedOwner}`,
      )
    }
    if (record.shared !== originScopes.size > 1) {
      throw new Error(`manifest.records[${index}].shared is inconsistent with its origins`)
    }
    return record.source
  })
  stringArray(recordSources, 'manifest record sources')
  requireExactSet(recordSources, scopes.all.all, 'manifest records')

  const baseRecordSources = manifest.records
    .filter((record) => record.owner === 'base')
    .map((record) => record.source)
  const extensionRecordSources = manifest.records
    .filter((record) => record.owner === 'extension')
    .map((record) => record.source)
  requireExactSet(baseRecordSources, scopes.base.all, 'manifest base ownership')
  requireExactSet(extensionRecordSources, scopes.extension.all, 'manifest extension ownership')

  return { ...manifest, scopes }
}

/** Validate a complete source-keyed translation bundle without writing files. */
export function validateEscapeTranslationBundle(manifestInput, bundle) {
  const manifest = validateEscapeI18nManifest(manifestInput)
  if (!isRecord(bundle)) throw new Error('translation bundle must be a JSON object')
  if (bundle.schemaVersion !== ESCAPE_I18N_MANIFEST_VERSION) {
    throw new Error(
      `unsupported translation schemaVersion ${String(bundle.schemaVersion)}; expected ${ESCAPE_I18N_MANIFEST_VERSION}`,
    )
  }
  if (!SCOPE_NAMES.includes(bundle.scope)) {
    throw new Error('translation bundle scope must be all, base, or extension')
  }

  const scope = manifest.scopes[bundle.scope]
  if (bundle.sourceCount !== scope.count || bundle.sourceHash !== scope.hash) {
    throw new Error(
      `translation inventory is stale for scope ${bundle.scope}: expected count/hash ${scope.count}/${scope.hash}, received ${String(bundle.sourceCount)}/${String(bundle.sourceHash)}`,
    )
  }
  if (!isRecord(bundle.translations)) {
    throw new Error('translation bundle translations must be an object')
  }
  requireExactSet(
    Object.keys(bundle.translations),
    ESCAPE_TRANSLATION_LOCALES,
    'translation locales',
  )

  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    const translations = bundle.translations[locale]
    if (!isRecord(translations)) {
      throw new Error(`translations.${locale} must be a source-keyed object`)
    }
    const sources = Object.keys(translations)
    requireExactSet(sources, scope.translatable, `translations.${locale}`)
    for (const source of scope.translatable) {
      const value = translations[source]
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`translations.${locale}[${JSON.stringify(source)}] must be non-empty`)
      }
    }
  }

  return { manifest, bundle, scope }
}

function dictionaryPath(scope, locale) {
  return scope === 'base' ? `${locale}.ts` : `levels-04-10/${locale}.ts`
}

function dictionaryIdentifier(scope, locale) {
  return scope === 'base' ? IDENT[locale] : `${IDENT[locale]}Levels04To10`
}

function levelNumber(levelId) {
  const match = /^level-(\d{2})$/u.exec(levelId)
  if (!match) throw new Error(`invalid escape-room level id ${JSON.stringify(levelId)}`)
  return match[1]
}

function levelDictionaryIdentifier(levelId, locale) {
  return `${IDENT[locale]}Level${levelNumber(levelId)}`
}

function levelTranslationIdentifier(levelId) {
  return `LEVEL_${levelNumber(levelId)}_TRANSLATIONS`
}

function runtimeLevelPlan(manifest, declaredScope) {
  const translatable = new Set(manifest.scopes.all.translatable)
  const byLevel = new Map()

  for (const record of manifest.records) {
    if (!translatable.has(record.source)) continue
    // Catalog-only metadata (currently the mood labels authored in registry.ts)
    // belongs to the lightweight notebook, not the playable story chunk.
    const runtimeOrigins = record.origins.filter(
      (origin) => origin.file === `${origin.levelId}.ts`,
    )
    const levelIds = new Set(runtimeOrigins.map((origin) => origin.levelId))
    for (const levelId of levelIds) {
      const entry = byLevel.get(levelId) ?? { scopes: new Set(), sources: [] }
      for (const origin of runtimeOrigins) {
        if (origin.levelId === levelId) entry.scopes.add(origin.scope)
      }
      entry.sources.push(record.source)
      byLevel.set(levelId, entry)
    }
  }

  return [...byLevel.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .filter(([levelId, entry]) => {
      levelNumber(levelId)
      if (entry.scopes.size !== 1) {
        throw new Error(`${levelId} is attached to multiple translation scopes`)
      }
      return declaredScope === 'all' || entry.scopes.has(declaredScope)
    })
    .map(([levelId, entry]) => ({ levelId, sources: entry.sources }))
}

function readDictionaryKeys(file, scope, locale) {
  let sourceText
  try {
    sourceText = readFileSync(file, 'utf8')
  } catch (error) {
    throw new Error(`could not read ${file}`, { cause: error })
  }

  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true)
  if (sourceFile.parseDiagnostics.length > 0) {
    const diagnostic = sourceFile.parseDiagnostics[0]
    const line = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1
    throw new Error(
      `${file}:${line} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
    )
  }

  const identifier = dictionaryIdentifier(scope, locale)
  const declarations = []
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
    const immutable = (statement.declarationList.flags & ts.NodeFlags.Const) !== 0
    if (!exported || !immutable) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === identifier) {
        declarations.push(declaration)
      }
    }
  }

  if (declarations.length !== 1) {
    throw new Error(`${file} must export exactly one const named ${identifier}`)
  }
  const initializer = declarations[0].initializer
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(`${file}: ${identifier} must be an object literal`)
  }

  const keys = initializer.properties.map((property, index) => {
    if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name)) {
      throw new Error(`${file}: ${identifier} property ${index} must have a literal string key`)
    }
    return property.name.text
  })
  stringArray(keys, `${file}: ${identifier} keys`)
  return keys
}

function validateExistingCounterpart(manifest, generatedScope, outputDir) {
  const counterpart = generatedScope === 'base' ? 'extension' : 'base'
  const expected = manifest.scopes[counterpart].translatable
  const generated = new Set(manifest.scopes[generatedScope].translatable)
  const issues = []

  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    const relativePath = dictionaryPath(counterpart, locale)
    const absolutePath = join(outputDir, relativePath)
    if (!existsSync(absolutePath)) {
      issues.push(`${relativePath}: missing`)
      continue
    }

    try {
      const keys = readDictionaryKeys(absolutePath, counterpart, locale)
      const missing = difference(expected, keys)
      const extra = difference(keys, expected)
      const overlap = keys.filter((source) => generated.has(source))
      const details = []
      if (missing.length > 0) details.push(`missing ${missing.length}`)
      if (extra.length > 0) details.push(`extra ${extra.length}`)
      if (overlap.length > 0) details.push(`overlap ${overlap.length}`)
      if (details.length > 0) issues.push(`${relativePath}: ${details.join(', ')}`)
    } catch (error) {
      issues.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `cannot generate scope ${generatedScope}: existing ${counterpart} dictionaries do not match the manifest. Use scope=all to regenerate both layers safely.\n${issues.map((issue) => `- ${issue}`).join('\n')}`,
    )
  }
}

function renderDictionary(scopeName, locale, scope, translations) {
  let output = '// AUTO-GENERATED by scripts/escape-i18n-gen.mjs - do not edit by hand.\n'
  output += `// Scope: ${scopeName}; source-count: ${scope.count}; source-sha256: ${scope.hash}\n`
  output += `// Escape-room translations for ${JSON.stringify(locale)}, keyed by exact Spanish source.\n\n`
  output += `export const ${dictionaryIdentifier(scopeName, locale)}: Record<string, string> = {\n`
  for (const source of scope.translatable) {
    output += `  ${JSON.stringify(source)}: ${JSON.stringify(translations[source])},\n`
  }
  output += '}\n'
  return output
}

function renderLevelDictionary(levelId, locale, sources, translations) {
  let output = '// AUTO-GENERATED by scripts/escape-i18n-gen.mjs - do not edit by hand.\n'
  output += `// Runtime scope: ${levelId}; source-count: ${sources.length}; source-sha256: ${hashEscapeSources(sources)}\n`
  output += `// Escape-room translations for ${JSON.stringify(locale)}, keyed by exact Spanish source.\n\n`
  output += `export const ${levelDictionaryIdentifier(levelId, locale)}: Readonly<Record<string, string>> = {\n`
  for (const source of sources) {
    const value = translations[source]
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `${levelId}: translations.${locale}[${JSON.stringify(source)}] is unavailable; generate scope=all when a source crosses scopes`,
      )
    }
    output += `  ${JSON.stringify(source)}: ${JSON.stringify(value)},\n`
  }
  output += '}\n'
  return output
}

function renderLevelIndex(levelId) {
  const translationIdentifier = levelTranslationIdentifier(levelId)
  let output = '// AUTO-GENERATED by scripts/escape-i18n-gen.mjs - do not edit by hand.\n'
  output += "import { createEscapeTranslator, type EscapeLevelTranslations } from '../../../create-translator'\n"
  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    output += `import { ${levelDictionaryIdentifier(levelId, locale)} } from './${locale}'\n`
  }
  output += `\nexport const ${translationIdentifier}: EscapeLevelTranslations = {\n`
  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    output += `  ${JSON.stringify(locale)}: ${levelDictionaryIdentifier(levelId, locale)},\n`
  }
  output += '}\n\n'
  output += `export const t = createEscapeTranslator(${translationIdentifier})\n`
  return output
}

/** Build only the level-scoped runtime artifacts. */
export function buildEscapeLevelTranslationFiles(manifestInput, bundle) {
  const { manifest } = validateEscapeTranslationBundle(manifestInput, bundle)
  const files = new Map()
  const levels = runtimeLevelPlan(manifest, bundle.scope)

  for (const { levelId, sources } of levels) {
    for (const locale of ESCAPE_TRANSLATION_LOCALES) {
      files.set(
        `levels/${levelId}/${locale}.ts`,
        renderLevelDictionary(levelId, locale, sources, bundle.translations[locale]),
      )
    }
    files.set(`levels/${levelId}/index.ts`, renderLevelIndex(levelId))
  }

  return { declaredScope: bundle.scope, files, levels }
}

function renderIndex() {
  let output = '// AUTO-GENERATED by scripts/escape-i18n-gen.mjs - do not edit by hand.\n'
  output += "import type { LocaleCode } from '~/lib/domain'\n"
  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    output += `import { ${dictionaryIdentifier('base', locale)} } from './${locale}'\n`
  }
  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    output += `import { ${dictionaryIdentifier('extension', locale)} } from './levels-04-10/${locale}'\n`
  }
  output += '\n/**\n'
  output += ' * Per-locale escape-room seed translations, keyed by Spanish source string.\n'
  output += " * 'es' is the source of truth; base owns sources shared with the extension.\n"
  output += ' */\n'
  output += 'export const TRANSLATIONS: Record<LocaleCode, Record<string, string>> = {\n'
  output += '  es: {},\n'
  for (const locale of ESCAPE_TRANSLATION_LOCALES) {
    output += `  ${JSON.stringify(locale)}: { ...${dictionaryIdentifier('base', locale)}, ...${dictionaryIdentifier('extension', locale)} },\n`
  }
  output += '}\n'
  return output
}

/** Build every output in memory; callers can inspect the plan without writes. */
export function buildEscapeTranslationFiles(manifestInput, bundle) {
  const { manifest } = validateEscapeTranslationBundle(manifestInput, bundle)
  const outputScopes = bundle.scope === 'all' ? ['base', 'extension'] : [bundle.scope]
  const files = new Map()
  const report = {}

  for (const scopeName of outputScopes) {
    const scope = manifest.scopes[scopeName]
    report[scopeName] = { sourceCount: scope.count, sourceHash: scope.hash }
    for (const locale of ESCAPE_TRANSLATION_LOCALES) {
      files.set(
        dictionaryPath(scopeName, locale),
        renderDictionary(scopeName, locale, scope, bundle.translations[locale]),
      )
    }
  }
  files.set('index.ts', renderIndex())

  return { declaredScope: bundle.scope, files, report }
}

/** Write only the per-level runtime dictionaries without touching audit layers. */
export function generateEscapeLevelTranslationFiles(manifest, bundle, outputDir) {
  if (typeof outputDir !== 'string' || outputDir.length === 0) {
    throw new Error('outputDir must be a non-empty path')
  }
  const absoluteOutputDir = resolve(outputDir)
  const plan = buildEscapeLevelTranslationFiles(manifest, bundle)

  for (const [relativePath, contents] of plan.files) {
    const absolutePath = join(absoluteOutputDir, relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, contents, 'utf8')
  }

  return { ...plan, outputDir: absoluteOutputDir }
}

/** Validate first, then write the base/extension architecture deterministically. */
export function generateEscapeTranslationFiles(manifest, bundle, outputDir) {
  if (typeof outputDir !== 'string' || outputDir.length === 0) {
    throw new Error('outputDir must be a non-empty path')
  }
  const absoluteOutputDir = resolve(outputDir)
  const plan = buildEscapeTranslationFiles(manifest, bundle)
  const runtimePlan = buildEscapeLevelTranslationFiles(manifest, bundle)

  if (bundle.scope !== 'all') {
    const validatedManifest = validateEscapeI18nManifest(manifest)
    validateExistingCounterpart(validatedManifest, bundle.scope, absoluteOutputDir)
  }

  for (const [relativePath, contents] of plan.files) {
    const absolutePath = join(absoluteOutputDir, relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, contents, 'utf8')
  }

  for (const [relativePath, contents] of runtimePlan.files) {
    const absolutePath = join(absoluteOutputDir, relativePath)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, contents, 'utf8')
  }

  return {
    ...plan,
    runtimeFiles: runtimePlan.files,
    levels: runtimePlan.levels,
    outputDir: absoluteOutputDir,
  }
}

function readJson(file, label) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`could not read ${label} JSON at ${file}`, { cause: error })
  }
}

function runCli() {
  const args = process.argv.slice(2)
  if (args.length !== 3) {
    process.stderr.write(
      'usage: node scripts/escape-i18n-gen.mjs <manifest.json> <translations.json> <outdir>\n',
    )
    process.exitCode = 1
    return
  }

  try {
    const [manifestFile, translationsFile, outputDir] = args.map((argument) => resolve(argument))
    const result = generateEscapeTranslationFiles(
      readJson(manifestFile, 'manifest'),
      readJson(translationsFile, 'translations'),
      outputDir,
    )
    process.stdout.write(`Generated scope ${result.declaredScope} in ${result.outputDir}\n`)
    for (const [scope, report] of Object.entries(result.report)) {
      process.stdout.write(
        `${scope}: ${report.sourceCount} sources per locale, sha256 ${report.sourceHash}\n`,
      )
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}

const isMain =
  process.argv[1] != null && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isMain) runCli()
