// Extract every t(...) string argument from the escape-room seed.
// AST-based (no module resolution / no runtime needed). Handles string literals
// and '+'-concatenation chains, which is all the seed uses. Emits a JSON with the
// full unique list, the translatable subset (contains a Latin letter), and the
// korean-only subset (no Latin letter → stays as-is via es fallback).
import ts from 'typescript'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedDir = join(__dirname, '..', 'app', 'seed', 'escape-room')
const files = ['level-01.ts', 'level-02.ts', 'level-03.ts', 'registry.ts']

const OUT = process.argv[2]
if (!OUT) {
  console.error('usage: node _extract_escape.mjs <out.json>')
  process.exit(1)
}

/** Statically evaluate a t(...) argument: string literal or '+'-chain of them. */
function evalStr(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return evalStr(node.left) + evalStr(node.right)
  }
  if (ts.isParenthesizedExpression(node)) return evalStr(node.expression)
  throw new Error('non-literal t() argument: ' + node.getText())
}

const ordered = []
const seen = new Set()

for (const f of files) {
  const full = join(seedDir, f)
  const src = ts.createSourceFile(f, readFileSync(full, 'utf8'), ts.ScriptTarget.Latest, true)
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments.length === 1
    ) {
      const value = evalStr(node.arguments[0])
      if (!seen.has(value)) {
        seen.add(value)
        ordered.push(value)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(src)
}

const hasLatin = (s) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(s)
const translatable = ordered.filter(hasLatin)
const koreanOnly = ordered.filter((s) => !hasLatin(s))

const totalChars = translatable.reduce((a, s) => a + s.length, 0)
writeFileSync(
  OUT,
  JSON.stringify({ all: ordered, translatable, koreanOnly }, null, 2),
  'utf8',
)
console.log('unique total:', ordered.length)
console.log('translatable:', translatable.length, '(' + totalChars + ' chars)')
console.log('korean-only :', koreanOnly.length)
console.log('--- korean-only samples ---')
for (const s of koreanOnly.slice(0, 12)) console.log('  ', JSON.stringify(s))
