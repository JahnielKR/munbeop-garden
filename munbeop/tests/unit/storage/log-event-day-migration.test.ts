// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  fileURLToPath(
    new URL('../../../supabase/migrations/20260822235047_log_event_day.sql', import.meta.url),
  ),
  'utf8',
)

describe('journal local-day migration', () => {
  it('adds nullable local calendar metadata without fabricating legacy values', () => {
    expect(sql).toMatch(/ADD COLUMN local_day date/)
    expect(sql).toMatch(/ADD COLUMN time_zone text/)
    expect(sql).toMatch(/ADD COLUMN utc_offset_minutes smallint/)
    expect(sql).toMatch(/ADD COLUMN activity_event_id uuid/)
    expect(sql).not.toMatch(/UPDATE public\.user_log/)
    expect(sql).not.toMatch(/DEFAULT/)
  })

  it('requires complete and internally consistent timezone metadata', () => {
    expect(sql).toMatch(/user_log_local_time_complete_check/)
    expect(sql).toMatch(/user_log_time_zone_check/)
    expect(sql).toMatch(/utc_offset_minutes BETWEEN -840 AND 840/)
    expect(sql).toMatch(/user_log_local_day_consistency_check/)
    expect(sql).toMatch(/created_at AT TIME ZONE 'UTC'/)
  })

  it('indexes stable day queries and one-to-one activity projections', () => {
    expect(sql).toMatch(/idx_user_log_user_local_day[\s\S]+\(user_id, local_day\)/)
    expect(sql).toMatch(
      /CREATE UNIQUE INDEX idx_user_log_user_activity_event[\s\S]+\(user_id, activity_event_id\)/,
    )
    expect(sql).not.toMatch(/REFERENCES public\.user_activity_events/)
  })
})
