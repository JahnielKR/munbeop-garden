// scripts/topik-spine-gap.mjs
//
// Compares the runtime grammar seed (`app/seed/grammars.ts`) against the
// curricular spine (`app/seed/topik-spine.json`) and produces a gap report.
//
// Run: `node scripts/topik-spine-gap.mjs`
// Output: writes `docs/topik-spine-gap.md` and prints a console summary.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(HERE, '..')                    // munbeop/
const REPO_ROOT = resolve(APP_ROOT, '..')               // munbeop-garden-main/
const SEED = resolve(APP_ROOT, 'app/seed')
const DOCS = resolve(REPO_ROOT, 'docs')

const spine = JSON.parse(readFileSync(resolve(SEED, 'topik-spine.json'), 'utf8'))

// ── Extract ko values from every grammar seed file ───────────────────────────
// Scans `grammars.ts` and any `grammars-n*.ts` per-level files.
const seedFiles = readdirSync(SEED).filter(
  (f) => f === 'grammars.ts' || /^grammars-n\d+\.ts$/.test(f),
)
const gramKos = []
for (const file of seedFiles) {
  const text = readFileSync(resolve(SEED, file), 'utf8')
  for (const m of text.matchAll(/ko:\s*'([^']+)'/g)) gramKos.push(m[1])
}

// ── Flatten spine items ──────────────────────────────────────────────────────
const spineItems = []
for (const lvl of ['1', '2', '3', '4', '5', '6']) {
  for (const theme of spine.topik[lvl].themes) {
    for (const it of theme.items) {
      spineItems.push({
        id: it.id,
        ko: it.ko,
        stars: it.stars,
        src: `TOPIK ${lvl}`,
        theme: theme.title,
        es: it.es,
      })
    }
  }
}
for (const it of spine.auxiliaries.items)
  spineItems.push({ ...it, src: 'auxiliaries', theme: '' })
for (const it of spine.indirectSpeech.items)
  spineItems.push({ ...it, src: 'indirectSpeech', theme: '' })
for (const it of spine.additionalGrammar.items)
  spineItems.push({ ...it, src: 'additional', theme: '' })
for (const it of spine.complementaryGrammar.items)
  spineItems.push({ ...it, src: 'complementary', theme: '' })

// ── Normalization for fuzzy match ────────────────────────────────────────────
// Drops pattern markers (으)/(이), unifies separators (·/comma → /), strips
// other parentheticals (e.g. "…(개 / 명 …)") and whitespace.
const norm = (s) =>
  s
    .replace(/\(으\)/g, '')
    .replace(/\(이\)/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[·,]/g, '/')
    .replace(/…/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim()

/**
 * Find spine matches for a seed `ko`.
 *
 * - EXACT: normalized strings equal.
 * - PART:  normalized seed is a substring of normalized spine (or vice versa),
 *          AND the shorter normalized string has at least 4 chars of Korean
 *          content (filters out trivial overlaps like sharing "-아/어" or "/V").
 */
function findMatches(gk) {
  const gn = norm(gk)
  const results = []
  for (const it of spineItems) {
    const sn = norm(it.ko)
    if (gn === sn && gn.length > 0) {
      results.push({ kind: 'EXACT', ...it })
      continue
    }
    if (!gn || !sn) continue
    const [shorter, longer] = gn.length <= sn.length ? [gn, sn] : [sn, gn]
    if (!longer.includes(shorter)) continue
    // Require enough hangul content in `shorter` to avoid trivial overlaps.
    const hangul = (shorter.match(/[가-힯]/g) || []).length
    if (hangul >= 3) {
      results.push({ kind: 'PART', ...it })
    }
  }
  return results
}

// ── Build report ─────────────────────────────────────────────────────────────
const lines = []
lines.push('# Gap analysis · `grammars.ts` ↔ `topik-spine.json`')
lines.push('')
lines.push(`- Seed runtime entries (\`grammars.ts\`): **${gramKos.length}**`)
lines.push(`- Spine items (TOPIK + transversales): **${spineItems.length}**`)
lines.push(
  `- Cobertura aproximada del seed sobre el spine: **${((gramKos.length * 100) / spineItems.length).toFixed(1)}%**`,
)
lines.push('')
lines.push('## 1) Mapeo de las entradas del seed al spine')
lines.push('')
lines.push('| Seed `ko` | Match | Spine id · level · tema |')
lines.push('|---|---|---|')

const matchedSpineIds = new Set()
const unmatched = []
for (const gk of gramKos) {
  const matches = findMatches(gk)
  if (matches.length === 0) {
    unmatched.push(gk)
    lines.push(`| \`${gk}\` | sin match | — |`)
  } else {
    // Prefer EXACT over PART; falls back to first PART if no EXACT.
    const m0 = matches.find((m) => m.kind === 'EXACT') ?? matches[0]
    matchedSpineIds.add(m0.id)
    const tail = m0.theme ? `${m0.src} · ${m0.theme}` : m0.src
    const tag = m0.kind === 'PART' ? `PART (de \`${m0.ko}\`)` : 'EXACT'
    lines.push(`| \`${gk}\` | ${tag} | **${m0.id}** · ${tail} |`)
  }
}
lines.push('')
if (unmatched.length > 0) {
  lines.push('### Patrones sin match literal ni parcial')
  lines.push('')
  for (const u of unmatched) lines.push(`- \`${u}\``)
  lines.push('')
}

// ── Coverage by TOPIK level ─────────────────────────────────────────────────
lines.push('## 2) Cobertura por nivel TOPIK')
lines.push('')
const byLevel = {}
for (const it of spineItems) {
  if (!it.src.startsWith('TOPIK')) continue
  byLevel[it.src] ??= { total: 0, missing: [] }
  byLevel[it.src].total++
  if (!matchedSpineIds.has(it.id)) byLevel[it.src].missing.push(it)
}
lines.push('| Nivel | Total spine | En seed | Faltan |')
lines.push('|---|---:|---:|---:|')
for (const lvl of Object.keys(byLevel).sort()) {
  const b = byLevel[lvl]
  lines.push(`| ${lvl} | ${b.total} | ${b.total - b.missing.length} | ${b.missing.length} |`)
}
lines.push('')

// ── Critical items missing ──────────────────────────────────────────────────
const criticalMissing = spineItems
  .filter((it) => it.stars === '★★★' && !matchedSpineIds.has(it.id))
  .sort((a, b) => a.id.localeCompare(b.id))

lines.push('## 3) Items críticos (★★★) ausentes — prioridad de expansión')
lines.push('')
lines.push(`Total críticos ausentes: **${criticalMissing.length}**`)
lines.push('')
lines.push('| ID | Patrón | Origen | Resumen |')
lines.push('|---|---|---|---|')
for (const it of criticalMissing) {
  const src = it.theme ? `${it.src} · ${it.theme}` : it.src
  lines.push(`| ${it.id} | \`${it.ko}\` | ${src} | ${it.es} |`)
}
lines.push('')

// ── Frequent items missing ──────────────────────────────────────────────────
const freqMissing = spineItems
  .filter((it) => it.stars === '★★' && !matchedSpineIds.has(it.id))
  .sort((a, b) => a.id.localeCompare(b.id))

lines.push('## 4) Items frecuentes (★★) ausentes — siguiente prioridad')
lines.push('')
lines.push(`Total frecuentes ausentes: **${freqMissing.length}**`)
lines.push('')
lines.push('| ID | Patrón | Origen | Resumen |')
lines.push('|---|---|---|---|')
for (const it of freqMissing) {
  const src = it.theme ? `${it.src} · ${it.theme}` : it.src
  lines.push(`| ${it.id} | \`${it.ko}\` | ${src} | ${it.es} |`)
}
lines.push('')

// ── Nuance items missing ────────────────────────────────────────────────────
const nuanceMissing = spineItems
  .filter((it) => it.stars === '★' && !matchedSpineIds.has(it.id))
  .sort((a, b) => a.id.localeCompare(b.id))

lines.push('## 5) Items matiz (★) ausentes — referencia')
lines.push('')
lines.push(`Total matiz ausentes: **${nuanceMissing.length}**`)
lines.push('')
lines.push('| ID | Patrón | Origen | Resumen |')
lines.push('|---|---|---|---|')
for (const it of nuanceMissing) {
  const src = it.theme ? `${it.src} · ${it.theme}` : it.src
  lines.push(`| ${it.id} | \`${it.ko}\` | ${src} | ${it.es} |`)
}
lines.push('')

// ── Save report ──────────────────────────────────────────────────────────────
mkdirSync(DOCS, { recursive: true })
const outPath = resolve(DOCS, 'topik-spine-gap.md')
writeFileSync(outPath, lines.join('\n'), 'utf8')

// ── Console summary ──────────────────────────────────────────────────────────
console.log('─── SUMMARY ───')
console.log(`seed entries:        ${gramKos.length}`)
console.log(`spine items:         ${spineItems.length}`)
console.log(`matched (any):       ${matchedSpineIds.size}`)
console.log(`unmatched seed:      ${unmatched.length}`)
console.log(`critical missing:    ${criticalMissing.length}`)
console.log(`frequent missing:    ${freqMissing.length}`)
console.log(`nuance missing:      ${nuanceMissing.length}`)
console.log('')
console.log(`report: ${outPath}`)
