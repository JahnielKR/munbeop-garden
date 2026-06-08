// One-off: apply the resync_catalog_topik migration to the remote DB, atomically.
// Reads the SQL file from disk (no transcription) and runs it in a single query.
//
// Usage (PowerShell) — pick ONE of these:
//
//   A) Exact connection string from the dashboard (most reliable):
//      Dashboard → Connect → "Session pooler" → copy the URI, paste your password in.
//      $env:SUPABASE_DB_URL = "postgresql://postgres.zbohswpyydwvzowvjaiw:<pwd>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
//      node scripts/apply-resync-migration.mjs
//
//   B) Just the password (script builds the pooler URL; adjust REGION if it fails):
//      $env:SUPABASE_DB_PASSWORD = "<your db password>"
//      node scripts/apply-resync-migration.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATION = resolve(
  __dirname,
  '../supabase/migrations/20260608000001_resync_catalog_topik.sql',
)
const PROJECT_REF = 'zbohswpyydwvzowvjaiw'
// Mungander is in ap-northeast-2. Pooler prefix may be aws-0 or aws-1 — if the
// password-only path fails to connect, use SUPABASE_DB_URL from the dashboard.
const REGION = 'aws-1-ap-northeast-2'

const url = process.env.SUPABASE_DB_URL
const password = process.env.SUPABASE_DB_PASSWORD
if (!url && !password) {
  console.error('Set SUPABASE_DB_URL (full URI) or SUPABASE_DB_PASSWORD first.')
  process.exit(1)
}

const sql = readFileSync(MIGRATION, 'utf8')

// Prefer the exact dashboard URI; otherwise build the session-pooler URL.
const client = url
  ? new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  : new Client({
      host: `${REGION}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${PROJECT_REF}`,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    })

try {
  await client.connect()
  console.log('Connected. Applying migration (atomic BEGIN…COMMIT in file)…')
  await client.query(sql)
  const { rows } = await client.query(
    "select count(*)::int as n, count(*) filter (where deck_id like 'topik-%')::int as topik from public.grammars",
  )
  console.log(`Done. grammars rows=${rows[0].n}, topik-decked=${rows[0].topik}`)
} catch (err) {
  console.error('FAILED (transaction rolled back):', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
