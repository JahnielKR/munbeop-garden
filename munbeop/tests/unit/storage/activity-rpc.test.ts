// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260821130400_increment_activity_atomically.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

describe('atomic activity RPC migration', () => {
  it('runs with caller privileges and a fixed search path', () => {
    expect(sql).toMatch(/SECURITY INVOKER/)
    expect(sql).toMatch(/SET search_path = ''/)
    expect(sql).not.toMatch(/SECURITY DEFINER/)
  })

  it('derives ownership from auth.uid and validates bounded positive deltas', () => {
    expect(sql).toMatch(/v_user_id uuid := \(SELECT auth\.uid\(\)\)/)
    expect(sql).toMatch(/p_delta < 1 OR p_delta > 1000/)
  })

  it('increments the stored count in one upsert', () => {
    expect(sql).toMatch(/ON CONFLICT \(user_id, day\) DO UPDATE/)
    expect(sql).toMatch(/count = public\.user_activity\.count \+ EXCLUDED\.count/)
  })

  it('is executable by authenticated users only', () => {
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )
    expect(sql).toMatch(/GRANT EXECUTE[\s\S]+TO authenticated/)
    expect(sql).not.toMatch(/GRANT EXECUTE[\s\S]+TO service_role/)
  })
})
