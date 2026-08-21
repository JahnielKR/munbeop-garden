// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260821124950_explicit_data_api_grants.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

const defaultAclSql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260821125151_lock_down_remaining_default_privileges.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

const unusedIndexSql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260821125602_drop_unused_user_log_ko_index.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

describe('Data API grants migration', () => {
  it('keeps user tables authenticated-only and grants required CRUD operations', () => {
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES[\s\S]+FROM anon, authenticated, service_role;/,
    )
    expect(sql).toMatch(/GRANT SELECT, INSERT, UPDATE, DELETE[\s\S]+TO authenticated, service_role;/)
    expect(sql).toMatch(/FOR SELECT TO authenticated/)
  })

  it('opts future postgres-owned objects out of implicit Data API exposure', () => {
    expect(sql).toMatch(/ALTER DEFAULT PRIVILEGES FOR ROLE postgres/)
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role/)
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC/)
    expect(defaultAclSql).toMatch(/REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated, service_role/)
    expect(defaultAclSql).toMatch(/REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated, service_role/)
    expect(defaultAclSql).toMatch(/REVOKE ALL PRIVILEGES ON FUNCTIONS FROM anon, authenticated, service_role, PUBLIC/)
  })

  it('grants sequence usage for server-generated journal ids', () => {
    expect(sql).toMatch(/user_log_id_seq/)
    expect(sql).toMatch(/GRANT USAGE, SELECT ON SEQUENCE/)
  })

  it('removes the unused journal grammar index', () => {
    expect(unusedIndexSql).toMatch(/DROP INDEX IF EXISTS public\.idx_user_log_user_ko/)
  })
})
