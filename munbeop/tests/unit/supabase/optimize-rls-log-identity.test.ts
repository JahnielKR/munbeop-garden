// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260815024627_optimize_rls_and_log_identity.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

const redundantIndexSql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260815025806_drop_redundant_activity_index.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

describe('RLS and journal identity migration', () => {
  it('optimizes every owner policy with a statement-cached auth.uid()', () => {
    expect((sql.match(/alter policy /gi) ?? [])).toHaveLength(28)
    expect(sql).not.toMatch(/(?:using|with check)\s*\(auth\.uid\(\)/i)

    const predicates = sql.match(/\(select auth\.uid\(\)\) = user_id/gi) ?? []
    expect(predicates.length).toBeGreaterThanOrEqual(28)
  })

  it('scopes the journal primary key to its owner', () => {
    expect(sql).toMatch(/alter table public\.user_log drop constraint user_log_pkey/i)
    expect(sql).toMatch(/primary key \(user_id, id\)/i)
  })

  it('drops only the activity index duplicated by its primary key', () => {
    expect(redundantIndexSql).toMatch(
      /drop index if exists public\.idx_user_activity_user_day/i,
    )
    expect((redundantIndexSql.match(/drop index/gi) ?? [])).toHaveLength(1)
  })
})
