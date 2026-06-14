// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sql = readFileSync(
  fileURLToPath(
    new URL('../../../supabase/migrations/20260614000001_user_settings.sql', import.meta.url),
  ),
  'utf8',
)

describe('user_settings migration', () => {
  it('creates the table with a user_id PK, jsonb prefs, and cascade FK', () => {
    expect(sql).toMatch(/create table public\.user_settings/i)
    expect(sql).toMatch(/user_id\s+uuid\s+primary key/i)
    expect(sql).toMatch(/prefs\s+jsonb/i)
    expect(sql).toMatch(/references auth\.users\(id\) on delete cascade/i)
  })

  it('enables RLS and defines four owner policies', () => {
    expect(sql).toMatch(/enable row level security/i)
    expect((sql.match(/auth\.uid\(\) = user_id/gi) ?? []).length).toBeGreaterThanOrEqual(4)
  })
})
