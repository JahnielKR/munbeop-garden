// Extract every translatable source used by the escape-room seed without
// importing the Nuxt runtime. The manifest is the reproducible contract between
// authored Spanish copy and generated translation dictionaries.
//
// CLI:
//   node scripts/escape-i18n-extract.mjs <out.json>
//
// The output owns every source in exactly one scope:
//   - base      -> levels 1-3 (and registry strings attached to those levels)
//   - extension -> levels 4-10
// A source used by both scopes is owned by base and marked as shared, preventing
// duplicate keys when the two dictionaries are merged at runtime.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const scriptDir = dirname(fileURLToPath(import.meta.url))
export const DEFAULT_ESCAPE_SEED_DIR = join(scriptDir, '..', 'app', 'seed', 'escape-room')
export const ESCAPE_I18N_MANIFEST_VERSION = 2

const FACTORY_NAMES = new Set([
  'selection',
  'completion',
  'creation',
  'selections',
  'completions',
  'creations',
])
const FACTORY_TRANSLATED_PARAMETERS = {
  selection: new Set(['question', 'free', 'premium']),
  completion: new Set(['translation', 'free', 'premium']),
  creation: new Set(['question', 'free', 'premium']),
  selections: new Set(['question', 'free', 'premium']),
  completions: new Set(['translation', 'free', 'premium']),
  creations: new Set(['question', 'free', 'premium']),
}
const hasLatin = (value) => /\p{Script=Latin}/u.test(value)

/** A stable set hash: source-keyed translations do not depend on AST order. */
export function hashEscapeSources(sources) {
  return createHash('sha256')
    .update(JSON.stringify([...sources].sort()))
    .digest('hex')
}

/** Statically evaluate the source forms allowed in authored seed copy. */
function evalString(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return evalString(node.left) + evalString(node.right)
  }
  if (ts.isParenthesizedExpression(node)) return evalString(node.expression)
  throw new Error(`non-literal expression: ${node.getText()}`)
}

function declaredFunctionName(node) {
  if (ts.isFunctionDeclaration(node)) return node.name?.text ?? null
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent)
  ) {
    return ts.isIdentifier(node.parent.name) ? node.parent.name.text : null
  }
  return null
}

function enclosingFactoryName(node) {
  let current = node.parent
  while (current) {
    if (ts.isFunctionLike(current)) {
      const name = declaredFunctionName(current)
      // Factory bodies use nested callbacks (for example rows.map(...)). Keep
      // walking past those anonymous functions until the authored factory is
      // reached; a dynamic t() with no such ancestor is still rejected.
      if (name && FACTORY_NAMES.has(name)) return name
    }
    current = current.parent
  }
  return null
}

function isExpectedFactoryTranslation(factoryName, node) {
  if (ts.isIdentifier(node)) {
    return FACTORY_TRANSLATED_PARAMETERS[factoryName].has(node.text)
  }
  return (
    ['selection', 'selections'].includes(factoryName) &&
    ts.isElementAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'options' &&
    ts.isNumericLiteral(node.argumentExpression) &&
    Number(node.argumentExpression.text) >= 0 &&
    Number(node.argumentExpression.text) <= 3
  )
}

function stringProperty(object, name) {
  const property = object.properties.find((candidate) => {
    if (!ts.isPropertyAssignment(candidate)) return false
    return (
      (ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
      (ts.isStringLiteral(candidate.name) && candidate.name.text === name)
    )
  })
  if (!property || !ts.isPropertyAssignment(property)) return null
  try {
    return evalString(property.initializer)
  } catch {
    return null
  }
}

function registryLevelId(node) {
  let current = node.parent
  while (current) {
    if (ts.isObjectLiteralExpression(current)) {
      const id = stringProperty(current, 'id')
      if (/^level-\d+$/u.test(id ?? '')) return id
    }
    current = current.parent
  }
  return null
}

function scopeFor(fileName, node) {
  const fileMatch = /^level-(\d+)\.ts$/u.exec(fileName)
  const levelId = fileMatch ? `level-${fileMatch[1].padStart(2, '0')}` : registryLevelId(node)
  if (!levelId) {
    throw new Error(`${fileName}: could not attach localized source to a level scope`)
  }
  const number = Number(levelId.slice('level-'.length))
  return { levelId, scope: number <= 3 ? 'base' : 'extension' }
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function buildScope(name, all) {
  const translatable = all.filter(hasLatin)
  const koreanOnly = all.filter((source) => !hasLatin(source))
  return {
    name,
    count: translatable.length,
    hash: hashEscapeSources(translatable),
    all,
    translatable,
    koreanOnly,
  }
}

/**
 * Return the complete, source-keyed extraction manifest.
 * This function performs no writes and is imported directly by regression tests.
 */
export function extractEscapeI18nManifest(seedDir = DEFAULT_ESCAPE_SEED_DIR) {
  const files = [
    ...readdirSync(seedDir)
      .filter((name) => /^level-\d+\.ts$/u.test(name))
      .sort(),
    'registry.ts',
  ]
  const records = new Map()
  const diagnostics = []

  function add(source, node, sourceFile, fileName, kind) {
    const { levelId, scope } = scopeFor(fileName, node)
    const origin = { file: fileName, line: lineOf(sourceFile, node), levelId, scope, kind }
    const record = records.get(source) ?? { source, origins: [] }
    if (
      !record.origins.some(
        (candidate) =>
          candidate.file === origin.file &&
          candidate.line === origin.line &&
          candidate.levelId === origin.levelId &&
          candidate.kind === origin.kind,
      )
    ) {
      record.origins.push(origin)
    }
    records.set(source, record)
  }

  function literal(node, context, sourceFile, fileName) {
    if (!node) throw new Error(`${fileName}: missing ${context}`)
    try {
      return evalString(node)
    } catch (error) {
      throw new Error(
        `${fileName}:${lineOf(sourceFile, node)} ${context} must be a literal string or literal '+' chain`,
        { cause: error },
      )
    }
  }

  function addNode(node, context, sourceFile, fileName, kind) {
    add(literal(node, context, sourceFile, fileName), node, sourceFile, fileName, kind)
  }

  function addArray(node, context, sourceFile, fileName, kind) {
    if (!node || !ts.isArrayLiteralExpression(node)) {
      throw new Error(`${fileName}: ${context} must be an inline array literal`)
    }
    node.elements.forEach((element, index) =>
      addNode(element, `${context}[${index}]`, sourceFile, fileName, kind),
    )
  }

  function addRows(node, config, sourceFile, fileName, kind) {
    if (!node || !ts.isArrayLiteralExpression(node)) {
      throw new Error(`${fileName}: ${kind} rows must be an inline array literal`)
    }
    node.elements.forEach((row, rowIndex) => {
      if (!ts.isArrayLiteralExpression(row)) {
        throw new Error(`${fileName}: ${kind} row ${rowIndex} must be an inline array literal`)
      }
      if (config.optionsAt != null) {
        addArray(
          row.elements[config.optionsAt],
          `${kind} row ${rowIndex} options`,
          sourceFile,
          fileName,
          kind,
        )
      }
      for (const index of config.textAt) {
        addNode(
          row.elements[index],
          `${kind} row ${rowIndex} text[${index}]`,
          sourceFile,
          fileName,
          kind,
        )
      }
    })
  }

  for (const fileName of files) {
    const fullPath = join(seedDir, fileName)
    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fullPath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    )
    if (sourceFile.parseDiagnostics.length > 0) {
      const details = sourceFile.parseDiagnostics.map((diagnostic) => {
        const line = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1
        return `${fileName}:${line} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
      })
      throw new Error(
        `Escape i18n source parse failed:\n${details.map((item) => `- ${item}`).join('\n')}`,
      )
    }

    const visit = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const name = node.expression.text
        const args = node.arguments

        if (name === 't') {
          if (args.length !== 1) {
            diagnostics.push(
              `${fileName}:${lineOf(sourceFile, node)} t() must receive one argument`,
            )
          } else {
            try {
              add(evalString(args[0]), args[0], sourceFile, fileName, 't')
            } catch {
              // Factory definitions necessarily call t(question), t(free), etc.;
              // their call sites are extracted below. Any other dynamic t() is
              // an unsafe source that cannot be tied to the manifest.
              const factoryName = enclosingFactoryName(node)
              if (!factoryName || !isExpectedFactoryTranslation(factoryName, args[0])) {
                diagnostics.push(
                  `${fileName}:${lineOf(sourceFile, node)} unexpected non-literal t(): ${args[0].getText(sourceFile)}`,
                )
              }
            }
          }
        }

        if (name === 'selection') {
          addNode(args[1], 'selection question', sourceFile, fileName, name)
          addArray(args[2], 'selection options', sourceFile, fileName, name)
          addNode(args[4], 'selection free hint', sourceFile, fileName, name)
          addNode(args[5], 'selection premium hint', sourceFile, fileName, name)
        } else if (name === 'completion') {
          addNode(args[1], 'completion translation', sourceFile, fileName, name)
          addNode(args[3], 'completion free hint', sourceFile, fileName, name)
          addNode(args[4], 'completion premium hint', sourceFile, fileName, name)
        } else if (name === 'creation') {
          addNode(args[1], 'creation question', sourceFile, fileName, name)
          addNode(args[4], 'creation free hint', sourceFile, fileName, name)
          addNode(args[5], 'creation premium hint', sourceFile, fileName, name)
        } else if (name === 'selections') {
          addNode(args[0], 'selections question', sourceFile, fileName, name)
          addNode(args[1], 'selections premium hint', sourceFile, fileName, name)
          addRows(args[2], { optionsAt: 1, textAt: [3] }, sourceFile, fileName, name)
        } else if (name === 'completions') {
          addNode(args[0], 'completions premium hint', sourceFile, fileName, name)
          addRows(args[1], { optionsAt: null, textAt: [1, 3] }, sourceFile, fileName, name)
        } else if (name === 'creations') {
          addNode(args[0], 'creations question', sourceFile, fileName, name)
          addNode(args[1], 'creations premium hint', sourceFile, fileName, name)
          addRows(args[2], { optionsAt: null, textAt: [3] }, sourceFile, fileName, name)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }

  if (diagnostics.length > 0) {
    throw new Error(
      `Escape i18n extraction failed:\n${diagnostics.map((item) => `- ${item}`).join('\n')}`,
    )
  }

  const orderedRecords = [...records.values()].map((record) => {
    record.origins.sort((left, right) =>
      `${left.file}:${left.line}`.localeCompare(`${right.file}:${right.line}`),
    )
    const usedBy = [...new Set(record.origins.map((origin) => origin.scope))].sort()
    return {
      ...record,
      owner: usedBy.includes('base') ? 'base' : 'extension',
      shared: usedBy.length > 1,
    }
  })
  const allSources = orderedRecords.map(({ source }) => source)
  const baseSources = orderedRecords
    .filter(({ owner }) => owner === 'base')
    .map(({ source }) => source)
  const extensionSources = orderedRecords
    .filter(({ owner }) => owner === 'extension')
    .map(({ source }) => source)

  return {
    schemaVersion: ESCAPE_I18N_MANIFEST_VERSION,
    generatedFrom: files,
    ownership: 'base owns any source shared with extension',
    scopes: {
      all: buildScope('all', allSources),
      base: buildScope('base', baseSources),
      extension: buildScope('extension', extensionSources),
    },
    records: orderedRecords,
  }
}

function runCli() {
  const output = process.argv[2]
  if (!output || process.argv.length > 3) {
    console.error('usage: node scripts/escape-i18n-extract.mjs <out.json>')
    process.exitCode = 1
    return
  }
  const manifest = extractEscapeI18nManifest()
  const absolute = resolve(output)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  process.stdout.write(`Wrote ${absolute}\n`)
  for (const scope of ['all', 'base', 'extension']) {
    const current = manifest.scopes[scope]
    process.stdout.write(
      `${scope}: ${current.translatable.length} translatable, ${current.koreanOnly.length} Korean-only, sha256 ${current.hash}\n`,
    )
  }
}

const isMain =
  process.argv[1] != null && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isMain) runCli()
