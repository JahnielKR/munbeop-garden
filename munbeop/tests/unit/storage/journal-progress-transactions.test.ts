// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  PROMOTE_TO_PLANT_EASY_RATIO,
  PROMOTE_TO_PLANT_MIN_TOTAL,
  PROMOTE_TO_TREE_EASY_RATIO,
  PROMOTE_TO_TREE_MIN_TOTAL,
} from '~/lib/srs/thresholds'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260822080452_journal_progress_transactions.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)
const logIdentitySql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260815024627_optimize_rls_and_log_identity.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

const functionNames = [
  'recalculate_user_progress_v2',
  'mark_user_progress_seen_v2',
  'save_user_log_entry_v2',
  'set_user_log_review_v2',
  'delete_user_log_entry_v2',
  'restore_user_backup_v2',
] as const

function functionSql(name: (typeof functionNames)[number]): string {
  const start = sql.indexOf(`CREATE OR REPLACE FUNCTION public.${name}(`)
  if (start < 0) throw new Error(`Missing SQL function ${name}`)
  const end = sql.indexOf('\n$$;', start)
  if (end < 0) throw new Error(`Unterminated SQL function ${name}`)
  return sql.slice(start, end + 4)
}

describe('transactional journal and SRS migration', () => {
  it('adds JavaScript-safe optimistic revisions without breaking legacy inserts', () => {
    expect(sql).toMatch(
      /ALTER TABLE public\.user_log[\s\S]+ADD COLUMN revision bigint NOT NULL DEFAULT 0/,
    )
    expect(sql).toMatch(
      /ALTER TABLE public\.user_progress[\s\S]+ADD COLUMN revision bigint NOT NULL DEFAULT 0/,
    )
    expect(sql).toMatch(
      /user_log_revision_safe_integer[\s\S]+CHECK \(revision BETWEEN 0 AND 9007199254740991\)/,
    )
    expect(sql).toMatch(
      /user_progress_revision_safe_integer[\s\S]+CHECK \(revision BETWEEN 0 AND 9007199254740991\)/,
    )
  })

  it('runs every v2 mutation as the caller with auth binding and the same account lock', () => {
    const lock =
      /pg_catalog\.pg_advisory_xact_lock\(\s*pg_catalog\.hashtextextended\(v_user_id::text, 0\)\s*\)/

    for (const name of functionNames) {
      const body = functionSql(name)
      expect(body).toMatch(/SECURITY INVOKER/)
      expect(body).toMatch(/SET search_path = ''/)
      expect(body).not.toMatch(/SECURITY DEFINER/)
      expect(body).toMatch(/v_user_id uuid := \(SELECT auth\.uid\(\)\)/)
      expect(body).toMatch(/p_expected_user_id IS DISTINCT FROM v_user_id/)
      expect(body).toMatch(lock)
    }

    // Six public v2 mutations plus the private receipt reset helper.
    expect(sql.match(new RegExp(lock.source, 'g')) ?? []).toHaveLength(functionNames.length + 1)
  })

  it('takes the account lock before each function mutates journal or progress', () => {
    const mutations: Record<(typeof functionNames)[number], string> = {
      recalculate_user_progress_v2: 'UPDATE public.user_progress AS progress',
      mark_user_progress_seen_v2: 'INSERT INTO public.user_progress AS progress',
      save_user_log_entry_v2: 'INSERT INTO public.user_log (',
      set_user_log_review_v2: 'UPDATE public.user_log AS journal',
      delete_user_log_entry_v2: 'DELETE FROM public.user_log AS journal',
      restore_user_backup_v2: 'DELETE FROM public.user_log AS journal',
    }

    for (const name of functionNames) {
      const body = functionSql(name)
      expect(body.indexOf('pg_catalog.pg_advisory_xact_lock')).toBeGreaterThan(-1)
      expect(body.indexOf(mutations[name])).toBeGreaterThan(
        body.indexOf('pg_catalog.pg_advisory_xact_lock'),
      )
    }
  })

  it('projects the exact TypeScript mastery thresholds and excludes incorrect entries', () => {
    const body = functionSql('recalculate_user_progress_v2')
    expect(PROMOTE_TO_PLANT_MIN_TOTAL).toBe(20)
    expect(PROMOTE_TO_PLANT_EASY_RATIO).toBe(1.5)
    expect(PROMOTE_TO_TREE_MIN_TOTAL).toBe(60)
    expect(PROMOTE_TO_TREE_EASY_RATIO).toBe(2.5)
    expect(body).toMatch(/journal\.review_state <> 'incorrect'[\s\S]+journal\.feedback = 'easy'/)
    expect(body).toMatch(/journal\.review_state <> 'incorrect'[\s\S]+journal\.feedback = 'hard'/)
    expect(body).toMatch(/v_easy_count \+ v_hard_count >= 60/)
    expect(body).toMatch(/v_easy_count \* 2 >= v_hard_count \* 5/)
    expect(body).toMatch(/v_easy_count \+ v_hard_count >= 20/)
    expect(body).toMatch(/v_easy_count \* 2 >= v_hard_count \* 3/)
  })

  it('keeps lastSeen monotonic and advances a journal-only projection', () => {
    const body = functionSql('recalculate_user_progress_v2')
    expect(body).toMatch(/pg_catalog\.max\(journal\.created_at\) FILTER/)
    expect(body).toMatch(
      /v_progress\.last_seen > v_log_last_seen[\s\S]+THEN v_progress\.last_seen[\s\S]+ELSE v_log_last_seen/,
    )
    expect(body).toMatch(/ELSIF v_log_entry_count > 0 THEN/)
    expect(body).toMatch(/private\.next_user_data_revision\([\s\S]+v_progress\.revision/)
    expect(body).toMatch(/revision = v_next_revision/)
    expect(body).toMatch(/IS DISTINCT FROM v_next_last_seen/)
  })

  it('marks seen without lowering lastSeen or overwriting mastery counters', () => {
    const body = functionSql('mark_user_progress_seen_v2')
    const update = body.slice(body.indexOf('ON CONFLICT (user_id, ko) DO UPDATE'))
    expect(update).toMatch(/SET last_seen = EXCLUDED\.last_seen/)
    expect(body).toMatch(/SELECT progress\.revision[\s\S]+FOR UPDATE/)
    expect(body).toMatch(/private\.next_user_data_revision\(v_user_id, v_revision_floor\)/)
    expect(update).toMatch(/revision = EXCLUDED\.revision/)
    expect(update).toMatch(
      /progress\.last_seen IS NULL[\s\S]+progress\.last_seen < EXCLUDED\.last_seen/,
    )
    expect(update).not.toMatch(/SET[\s\S]+easy_count = EXCLUDED\.easy_count/)
    expect(update).not.toMatch(/SET[\s\S]+hard_count = EXCLUDED\.hard_count/)
    expect(update).not.toMatch(/SET[\s\S]+mastery = EXCLUDED\.mastery/)
  })

  it('saves a stable id idempotently and rejects a changed payload', () => {
    const body = functionSql('save_user_log_entry_v2')
    // The conflict target is valid on the fully migrated schema (the initial
    // schema used a global id PK, then this earlier migration made it scoped).
    expect(logIdentitySql).toMatch(
      /DROP CONSTRAINT user_log_pkey;[\s\S]+PRIMARY KEY \(user_id, id\)/i,
    )
    expect(body).toMatch(/v_id < 1 OR v_id > 9007199254740991/)
    expect(body).toMatch(/p_entry ->> 'date'[\s\S]+Z\|\[\+-\]/)
    expect(body).toMatch(/pg_catalog\.pg_timezone_names/)
    expect(body).toMatch(
      /pg_catalog\.timezone\(v_time_zone, v_created_at\)[\s\S]+pg_catalog\.make_interval/,
    )
    expect(body).toMatch(
      /v_local_day IS DISTINCT FROM[\s\S]+pg_catalog\.timezone\(v_time_zone, v_created_at\)::date/,
    )
    expect(body).toMatch(
      /p_entry ->> 'reviewState' = 'incorrect'[\s\S]+pg_catalog\.btrim\(p_entry ->> 'errorNote'\) = ''/,
    )
    expect(body).toMatch(/ON CONFLICT \(user_id, id\) DO NOTHING/)
    expect(body).toMatch(/private\.next_user_data_revision\(v_user_id, 0\)/)
    for (const column of [
      'ko',
      'sentence',
      'feedback',
      'error_dimension',
      'context_id',
      'context_name',
      'created_at',
      'local_day',
      'time_zone',
      'utc_offset_minutes',
      'activity_event_id',
    ]) {
      expect(body).toContain(`v_entry.${column} IS DISTINCT FROM v_${column}`)
    }
    const identityCheck = body.slice(
      body.indexOf('IF v_entry.ko IS DISTINCT FROM v_ko'),
      body.indexOf("RAISE EXCEPTION 'Journal id was reused with a different payload'"),
    )
    expect(identityCheck).not.toContain('v_entry.review_state IS DISTINCT FROM v_review_state')
    expect(identityCheck).not.toContain('v_entry.error_note IS DISTINCT FROM v_error_note')
    expect(body).toMatch(/Journal id was reused with a different payload[\s\S]+ERRCODE = '23505'/)
    expect(body).toMatch(/public\.recalculate_user_progress_v2\(v_user_id, v_entry\.ko\)/)
    expect(body).toMatch(/'entry'[\s\S]+'progress'/)
  })

  it('updates review state and note with optimistic, retry-safe semantics', () => {
    const body = functionSql('set_user_log_review_v2')
    expect(body).toMatch(/p_error_note text/)
    expect(body).toMatch(/v_entry\.revision IS DISTINCT FROM p_expected_revision/)
    expect(body).toMatch(/v_entry\.review_state IS DISTINCT FROM p_review_state/)
    expect(body).toMatch(/v_entry\.error_note IS DISTINCT FROM p_error_note/)
    expect(body).toMatch(/ERRCODE = '40001'/)
    expect(body).toMatch(/SET review_state = p_review_state,[\s\S]+error_note = p_error_note/)
    expect(body).toMatch(/private\.next_user_data_revision\([\s\S]+v_entry\.revision/)
    expect(body).toMatch(/revision = v_next_revision/)
    expect(body).toMatch(/public\.recalculate_user_progress_v2\(v_user_id, v_entry\.ko\)/)
  })

  it('makes delete outcome-idempotent and always recalculates expectedKo', () => {
    const body = functionSql('delete_user_log_entry_v2')
    const recalculateAt = body.indexOf(
      'public.recalculate_user_progress_v2(v_user_id, p_expected_ko)',
    )
    expect(body).toMatch(/IF FOUND THEN[\s\S]+v_entry\.ko IS DISTINCT FROM p_expected_ko/)
    expect(body).toMatch(/v_entry\.revision IS DISTINCT FROM p_expected_revision/)
    expect(body).toMatch(/ERRCODE = '40001'/)
    expect(recalculateAt).toBeGreaterThan(body.indexOf('END IF;', body.indexOf('IF FOUND THEN')))
    expect(body).toMatch(/'deleted', true/)
    expect(body).not.toMatch(/Journal entry not found/)
  })

  it('restores stable journal metadata and rebuilds every affected projection', () => {
    const body = functionSql('restore_user_backup_v2')
    expect(body).toMatch(
      /private\.restore_user_backup_collections\([\s\S]+p_data - ARRAY\['munbeop\.v1\.log', 'munbeop\.v1\.srs'\]::text\[\]/,
    )
    expect(body).toMatch(/\(source\.item ->> 'id'\)::bigint/)
    expect(body).toMatch(/source\.item ->> 'localDay'/)
    expect(body).toMatch(/source\.item ->> 'timeZone'/)
    expect(body).toMatch(/source\.item ->> 'utcOffsetMinutes'/)
    expect(body).toMatch(/source\.item ->> 'activityEventId'/)
    expect(body).toMatch(/pg_catalog\.pg_timezone_names/)
    expect(body).toMatch(
      /pg_catalog\.timezone\([\s\S]+source\.item ->> 'timeZone'[\s\S]+source\.item ->> 'date'/,
    )
    expect(body).toMatch(
      /source\.item ->> 'localDay'\)::date IS DISTINCT FROM[\s\S]+pg_catalog\.timezone/,
    )
    expect(body).toMatch(
      /SELECT prior\.ko[\s\S]+UNION[\s\S]+SELECT journal\.ko[\s\S]+UNION[\s\S]+SELECT progress\.ko/,
    )
    expect(body).toMatch(/FOREACH v_ko IN ARRAY v_affected_kos LOOP/)
    expect(body).toMatch(/public\.recalculate_user_progress_v2\(v_user_id, v_ko\)/)
    expect(body).toMatch(/0,[\s\S]+0,[\s\S]+'seedling'/)
    expect(body).toMatch(/private\.next_user_data_revision\([\s\S]+v_revision_floor/)
    expect(body.match(/v_restore_revision/g) ?? []).toHaveLength(4)
  })

  it('keeps revisions monotonic across empty restores and resets activity receipts as a baseline', () => {
    expect(sql).toMatch(/CREATE TABLE private\.user_data_revision_epochs/)
    expect(sql).toMatch(/PRIMARY KEY REFERENCES auth\.users\(id\) ON DELETE CASCADE/)
    expect(sql).toMatch(
      /FUNCTION private\.next_user_data_revision\([\s\S]+SECURITY DEFINER[\s\S]+SET search_path = ''/,
    )
    expect(sql).toMatch(/GREATEST\(epoch\.revision, p_floor\) \+ 1/)
    expect(sql).toMatch(/p_expected_user_id IS DISTINCT FROM v_user_id/)
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES ON TABLE private\.user_data_revision_epochs[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )

    const restore = functionSql('restore_user_backup_v2')
    const legacyRestore = restore.indexOf('private.restore_user_backup_collections(')
    const receiptReset = restore.indexOf('private.reset_user_activity_receipts(v_user_id)')
    expect(legacyRestore).toBeGreaterThan(-1)
    expect(receiptReset).toBeGreaterThan(legacyRestore)
    expect(restore).toMatch(/IF p_data \? 'munbeop\.v1\.activity' THEN/)

    expect(sql).toMatch(
      /FUNCTION private\.reset_user_activity_receipts\([\s\S]+SECURITY DEFINER[\s\S]+SET search_path = ''[\s\S]+pg_catalog\.pg_advisory_xact_lock\([\s\S]+DELETE FROM public\.user_activity_events AS receipt[\s\S]+receipt\.user_id = v_user_id/,
    )
  })

  it('routes the legacy restore signature through the locked v2 implementation', () => {
    expect(sql).toMatch(
      /ALTER FUNCTION public\.restore_user_backup\(jsonb\) SET SCHEMA private;[\s\S]+RENAME TO restore_user_backup_collections/,
    )
    expect(sql).toMatch(
      /FUNCTION public\.restore_user_backup\(p_data jsonb\)[\s\S]+SECURITY INVOKER[\s\S]+RETURN public\.restore_user_backup_v2\(v_user_id, p_data\)/,
    )
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES ON FUNCTION public\.restore_user_backup\(jsonb\)[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.restore_user_backup\(jsonb\)[\s\S]+TO authenticated/,
    )
  })

  it('returns only camelCase API keys with authoritative revisions', () => {
    for (const key of [
      'lastSeen',
      'easyCount',
      'hardCount',
      'errorNote',
      'errorDimension',
      'reviewState',
      'contextId',
      'contextName',
      'localDay',
      'timeZone',
      'utcOffsetMinutes',
      'activityEventId',
      'revision',
    ]) {
      expect(sql).toContain(`'${key}'`)
    }
  })

  it('revokes defaults and grants every RPC only to authenticated users', () => {
    for (const name of functionNames) {
      expect(sql).toMatch(
        new RegExp(
          `REVOKE ALL PRIVILEGES ON FUNCTION public\\.${name}\\([\\s\\S]+?FROM PUBLIC, anon, authenticated, service_role;`,
        ),
      )
      expect(sql).toMatch(
        new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${name}\\([\\s\\S]+?TO authenticated;`),
      )
    }
    expect(sql).not.toMatch(/GRANT EXECUTE[\s\S]+TO (?:anon|service_role)/)
  })
})
