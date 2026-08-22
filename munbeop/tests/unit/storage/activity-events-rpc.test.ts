// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ACTIVITY_SOURCES } from '~/lib/activity/event'

const sql = readFileSync(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260822235014_activity_events_exactly_once.sql',
      import.meta.url,
    ),
  ),
  'utf8',
)

describe('exactly-once activity event migration', () => {
  it('creates immutable user-scoped receipts with timezone and source checks', () => {
    expect(sql).toMatch(/CREATE TABLE public\.user_activity_events/)
    expect(sql).toMatch(/PRIMARY KEY \(user_id, event_id\)/)
    expect(sql).toMatch(/REFERENCES auth\.users\(id\) ON DELETE CASCADE/)
    expect(sql).toMatch(/user_activity_events_event_id_v4_check/)
    expect(sql).toMatch(/user_activity_events_local_day_check/)
    expect(sql).toMatch(/utc_offset_minutes BETWEEN -840 AND 840/)
    expect(sql).toMatch(/user_activity_events_source_check/)
    for (const source of ACTIVITY_SOURCES) expect(sql).toContain(`'${source}'`)
    expect(sql).toMatch(
      /CREATE INDEX idx_user_activity_events_user_day_occurred[\s\S]+\(user_id, local_day, occurred_at DESC\)/,
    )
  })

  it('exposes owner-only SELECT and INSERT policies and no mutable grant', () => {
    expect(sql).toMatch(/ALTER TABLE public\.user_activity_events ENABLE ROW LEVEL SECURITY/)
    expect(sql.match(/CREATE POLICY "user_activity_events_owner_/g) ?? []).toHaveLength(2)
    expect(sql).toMatch(
      /FOR SELECT[\s\S]+TO authenticated[\s\S]+\(SELECT auth\.uid\(\)\) = user_id/,
    )
    expect(sql).toMatch(/FOR INSERT[\s\S]+TO authenticated[\s\S]+WITH CHECK/)
    expect(sql).toMatch(
      /GRANT SELECT, INSERT ON TABLE public\.user_activity_events[\s\S]+TO authenticated/,
    )
    expect(sql).not.toMatch(/GRANT (?:UPDATE|DELETE|ALL).*user_activity_events/)
    expect(sql).not.toMatch(/FOR (?:UPDATE|DELETE|ALL)/)
  })

  it('runs the v2 RPC as the caller with a fixed search path', () => {
    expect(sql).toMatch(
      /FUNCTION public\.record_user_activity_events_v2\([\s\S]+p_expected_user_id uuid,[\s\S]+p_events jsonb/,
    )
    expect(sql).toMatch(/SECURITY INVOKER/)
    expect(sql).toMatch(/SET search_path = ''/)
    expect(sql).not.toMatch(/SECURITY DEFINER/)
    expect(sql).toMatch(/v_user_id uuid := \(SELECT auth\.uid\(\)\)/)
    expect(sql).toMatch(/p_expected_user_id IS DISTINCT FROM v_user_id/)
  })

  it('validates batch bounds, exact event shape, timezones, and duplicate ids', () => {
    expect(sql).toMatch(/pg_catalog\.jsonb_typeof\(p_events\) <> 'array'/)
    expect(sql).toMatch(/v_event_count < 1 OR v_event_count > 100/)
    expect(sql).toContain("'eventId',")
    expect(sql).toContain("'localDay',")
    expect(sql).toContain("'occurredAt',")
    expect(sql).toContain("'timeZone',")
    expect(sql).toContain("'utcOffsetMinutes',")
    expect(sql).toContain("'source'")
    expect(sql).toMatch(/pg_catalog\.pg_timezone_names/)
    expect(sql).toMatch(
      /pg_catalog\.timezone\([\s\S]+input\.event ->> 'timeZone'[\s\S]+input\.event ->> 'occurredAt'/,
    )
    expect(sql).toMatch(/IS DISTINCT FROM pg_catalog\.make_interval\([\s\S]+utcOffsetMinutes/)
    expect(sql).toMatch(/localDay'\)::date IS DISTINCT FROM[\s\S]+pg_catalog\.timezone\(/)
    expect(sql).toMatch(
      /GROUP BY \(input\.event ->> 'eventId'\)::uuid[\s\S]+HAVING pg_catalog\.count\(\*\) > 1/,
    )
  })

  it('treats receipt insertion as the only source of new activity deltas', () => {
    const accountLock = sql.indexOf('pg_catalog.pg_advisory_xact_lock')
    const receiptInsert = sql.indexOf('INSERT INTO public.user_activity_events (')
    expect(accountLock).toBeGreaterThan(-1)
    expect(receiptInsert).toBeGreaterThan(accountLock)
    expect(sql).toMatch(/ON CONFLICT \(user_id, event_id\) DO NOTHING/)
    expect(sql).toMatch(/RETURNING event_id/)
    expect(sql).toMatch(/INTO v_inserted_event_ids/)
    expect(sql).toMatch(/receipt\.event_id = ANY \(v_inserted_event_ids\)/)
    expect(sql).toMatch(/GROUP BY receipt\.local_day/)
    expect(sql).toMatch(/count = activity\.count \+ EXCLUDED\.count/)
  })

  it('rejects event-id reuse with a different canonical payload', () => {
    for (const column of [
      'local_day',
      'occurred_at',
      'time_zone',
      'utc_offset_minutes',
      'source',
    ]) {
      expect(sql).toContain(`receipt.${column} IS DISTINCT FROM input_events.${column}`)
    }
    expect(sql).toMatch(/Activity event id was reused with a different payload/)
    expect(sql).toMatch(/ERRCODE = '23505'/)

    const receiptInsert = sql.indexOf('INSERT INTO public.user_activity_events (')
    const conflictCheck = sql.indexOf(
      "RAISE EXCEPTION 'Activity event id was reused with a different payload'",
    )
    const activityIncrement = sql.indexOf('INSERT INTO public.user_activity AS activity')
    expect(receiptInsert).toBeGreaterThan(-1)
    expect(conflictCheck).toBeGreaterThan(receiptInsert)
    expect(activityIncrement).toBeGreaterThan(conflictCheck)
  })

  it('acknowledges every valid input id and returns authoritative day totals', () => {
    expect(sql).toMatch(/jsonb_agg\(input\.event ->> 'eventId' ORDER BY input\.ordinality\)/)
    expect(sql).toMatch(/jsonb_object_agg\([\s\S]+activity\.day::text,[\s\S]+activity\.count/)
    expect(sql).toMatch(/'acknowledgedIds', v_acknowledged_ids/)
    expect(sql).toMatch(/'totalsByDay', v_totals_by_day/)
  })

  it('grants RPC execution only to authenticated users and locks the legacy increment', () => {
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES ON FUNCTION public\.record_user_activity_events_v2\(uuid, jsonb\)[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.record_user_activity_events_v2\(uuid, jsonb\)[\s\S]+TO authenticated/,
    )
    expect(sql).toMatch(
      /FUNCTION public\.increment_user_activity\([\s\S]+SECURITY INVOKER[\s\S]+pg_catalog\.pg_advisory_xact_lock\([\s\S]+INSERT INTO public\.user_activity AS activity/,
    )
    expect(sql).toMatch(
      /REVOKE ALL PRIVILEGES ON FUNCTION public\.increment_user_activity\(date, integer\)[\s\S]+FROM PUBLIC, anon, authenticated, service_role/,
    )
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.increment_user_activity\(date, integer\)[\s\S]+TO authenticated/,
    )
    expect(sql).not.toMatch(/DROP (?:FUNCTION|PROCEDURE).*increment_user_activity/i)
  })
})
