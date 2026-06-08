// scripts/regenerate-catalog-sql.mjs
//
// Reads every `app/seed/grammars-n{level}.ts` and emits a Supabase migration
// that re-syncs the `public.grammars` catalog table with the client seed.
//
// Output: `supabase/migrations/<timestamp>_resync_catalog_topik.sql`
//
// Strategy: minimal-preprocessing TypeScript → eval via Function(). The TS
// files have a very narrow shape — array literals of object literals with
// L(...) calls — so we strip type imports/annotations and inline the L helper
// to avoid bringing in a real TS loader.
//
// Run: `node scripts/regenerate-catalog-sql.mjs`

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(HERE, '..')
const SEED = resolve(APP_ROOT, 'app/seed')
const MIGRATIONS = resolve(APP_ROOT, 'supabase/migrations')

const LEVELS = [1, 2, 3, 4, 5, 6]

/**
 * Load a TOPIK_N_GRAMMAR array from a .ts seed file by stripping type-only
 * syntax and evaluating the rest in a sandbox with an inline L() helper.
 */
function loadLevelArray(level) {
  const file = resolve(SEED, `grammars-n${level}.ts`)
  let src = readFileSync(file, 'utf8')

  src = src.replace(/^import type .+$/gm, '')
  src = src.replace(/^import \{ L \} from .+$/gm, '')
  src = src.replace(/:\s*Grammar\[\]/g, '')
  src = src.replace(/^export /gm, '')

  const constName = `TOPIK_${level}_GRAMMAR`
  const wrapper = `
    const L = (en, es, fr, ptBR, th, id, vi, ja) =>
      ({ en, es, fr, 'pt-BR': ptBR, th, id, vi, ja })
    ${src}
    return ${constName};
  `
  return new Function(wrapper)()
}

const all = []
for (const lvl of LEVELS) {
  const entries = loadLevelArray(lvl)
  for (const e of entries) all.push(e)
}

console.log(`Loaded ${all.length} entries from ${LEVELS.length} level files.`)

// ── SQL generation ──────────────────────────────────────────────────────────

/** SQL-escape a Postgres text literal. */
const sql = (s) => `'${String(s).replace(/'/g, "''")}'`

/** Wrap a JS object as a `jsonb` literal (cast applied at use site). */
const jsonb = (obj) => sql(JSON.stringify(obj))

const fileName = `20260608000001_resync_catalog_topik.sql`
const outPath = resolve(MIGRATIONS, fileName)

const lines = []
lines.push(`-- ${fileName}`)
lines.push(`-- Re-sync the catalog (\`public.grammars\`) with the new client seed.`)
lines.push(`--`)
lines.push(`-- Replaces the 14 legacy 'general'-deck entries with the full 300-entry`)
lines.push(`-- TOPIK 1–6 catalog (matching \`app/seed/grammars-n{1..6}.ts\`).`)
lines.push(`--`)
lines.push(`-- Schema defaults also move:`)
lines.push(`--   grammars.deck_id              'general' → 'topik-1'`)
lines.push(`--   user_custom_grammars.deck_id  'general' → 'topik-1'`)
lines.push(`--   user_decks.color_id           'indigo'  → 'sky'`)
lines.push(`--`)
lines.push(`-- Idempotent via UPSERT (\`ON CONFLICT (ko) DO UPDATE\`) so re-running the`)
lines.push(`-- migration aligns rows with the latest seed without inflating row counts.`)
lines.push(``)
lines.push(`BEGIN;`)
lines.push(``)
lines.push(`-- ─── Schema defaults ─────────────────────────────────────────────`)
lines.push(`ALTER TABLE public.grammars              ALTER COLUMN deck_id  SET DEFAULT 'topik-1';`)
lines.push(`ALTER TABLE public.user_custom_grammars  ALTER COLUMN deck_id  SET DEFAULT 'topik-1';`)
lines.push(`ALTER TABLE public.user_decks            ALTER COLUMN color_id SET DEFAULT 'sky';`)
lines.push(``)
lines.push(`-- ─── Re-map any legacy 'general' rows on user-owned tables to 'topik-1'`)
lines.push(`-- (safe fallback — users keep their custom grammars under the entry deck).`)
lines.push(`UPDATE public.user_custom_grammars SET deck_id = 'topik-1' WHERE deck_id = 'general';`)
lines.push(``)
lines.push(`-- ─── Catalog: remove pre-topik legacy entries that no longer exist in seed`)
lines.push(`-- (their 'ko' notation has changed in the new client seed).`)
// `ko` strings from the legacy 14-row seed (20260603000003) that no longer
// appear in the new client seed. Listing them explicitly avoids the
// alternative `WHERE deck_id = 'general'` which could over-delete if other
// processes had inserted rows with that placeholder.
const legacyKos = [
  '에서/부터~까지',
  '한테/한테서',
  '-(으)러',
  '못',
  '-지 않다',
  '-아/어야 되다',
  '는/은',
]
lines.push(`DELETE FROM public.grammars WHERE ko IN (`)
lines.push(legacyKos.map((k) => `  ${sql(k)}`).join(',\n'))
lines.push(`);`)
lines.push(``)
lines.push(`-- ─── Catalog: ${all.length} grammars across topik-1 … topik-6`)
lines.push(`INSERT INTO public.grammars (ko, meaning, example, trans, deck_id) VALUES`)

const rows = all.map((e) => {
  const ko = sql(e.ko)
  const meaning = jsonb(e.meaning) + '::jsonb'
  const example = e.example ? sql(e.example) : 'NULL'
  const trans = e.trans ? jsonb(e.trans) + '::jsonb' : 'NULL'
  const deck = sql(e.deckId)
  return `(${ko}, ${meaning}, ${example}, ${trans}, ${deck})`
})
lines.push(rows.join(',\n'))
lines.push(`ON CONFLICT (ko) DO UPDATE SET`)
lines.push(`  meaning = EXCLUDED.meaning,`)
lines.push(`  example = EXCLUDED.example,`)
lines.push(`  trans   = EXCLUDED.trans,`)
lines.push(`  deck_id = EXCLUDED.deck_id;`)
lines.push(``)
lines.push(`COMMIT;`)
lines.push(``)

writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`Wrote ${outPath}`)
console.log(`Total rows in INSERT: ${rows.length}`)

// ── Sanity report ───────────────────────────────────────────────────────────
const byDeck = {}
for (const e of all) byDeck[e.deckId] = (byDeck[e.deckId] || 0) + 1
console.log('Per-deck counts:')
for (const [k, v] of Object.entries(byDeck).sort()) console.log(`  ${k}: ${v}`)
