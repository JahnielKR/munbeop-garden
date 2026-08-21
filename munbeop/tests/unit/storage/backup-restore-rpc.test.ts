// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { EXPORT_KEYS } from '~/lib/data-transfer/keys'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260821131340_restore_user_backup_atomically.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

describe('transactional backup restore RPC migration', () => {
  it('runs with caller privileges and a fixed search path', () => {
    expect(sql).toMatch(/SECURITY INVOKER/)
    expect(sql).toMatch(/SET search_path = ''/)
    expect(sql).not.toMatch(/SECURITY DEFINER/)
  })

  it('handles every exported collection as an optional key', () => {
    for (const key of EXPORT_KEYS) {
      expect(sql).toContain(`p_data ? '${key}'`)
    }
  })

  it('replaces user rows while keeping the shared grammar catalog read-only', () => {
    expect(sql).toMatch(/DELETE FROM public\.user_progress/)
    expect(sql).toMatch(/DELETE FROM public\.user_log/)
    expect(sql).toMatch(/item ->> 'deckId' = 'custom'/)
    expect(sql).toMatch(/NOT EXISTS \([\s\S]+FROM public\.grammars/)
    expect(sql).not.toMatch(/DELETE FROM public\.grammars/)
  })

  it('is executable by authenticated users only', () => {
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )
    expect(sql).toMatch(/GRANT EXECUTE[\s\S]+TO authenticated/)
    expect(sql).not.toMatch(/GRANT EXECUTE[\s\S]+TO service_role/)
  })
})
