-- Keep each journal entry on the calendar day captured when the answer was
-- committed. Legacy rows remain NULL and continue to use their timestamp as a
-- compatibility fallback; inventing a timezone for them would rewrite history.
ALTER TABLE public.user_log
  ADD COLUMN local_day date,
  ADD COLUMN time_zone text,
  ADD COLUMN utc_offset_minutes smallint,
  ADD COLUMN activity_event_id uuid;

ALTER TABLE public.user_log
  ADD CONSTRAINT user_log_local_time_complete_check CHECK (
    (
      local_day IS NULL
      AND time_zone IS NULL
      AND utc_offset_minutes IS NULL
    )
    OR (
      local_day IS NOT NULL
      AND time_zone IS NOT NULL
      AND utc_offset_minutes IS NOT NULL
    )
  ),
  ADD CONSTRAINT user_log_time_zone_check CHECK (
    time_zone IS NULL
    OR (
      pg_catalog.char_length(time_zone) BETWEEN 1 AND 64
      AND time_zone ~ '^[A-Za-z0-9._+/-]+$'
    )
  ),
  ADD CONSTRAINT user_log_utc_offset_check CHECK (
    utc_offset_minutes IS NULL
    OR utc_offset_minutes BETWEEN -840 AND 840
  ),
  ADD CONSTRAINT user_log_local_day_consistency_check CHECK (
    local_day IS NULL
    OR local_day = (
      (created_at AT TIME ZONE 'UTC')
      + pg_catalog.make_interval(mins => utc_offset_minutes::integer)
    )::date
  );

CREATE INDEX idx_user_log_user_local_day
  ON public.user_log (user_id, local_day)
  WHERE local_day IS NOT NULL;

-- A committed answer may have at most one journal projection. There is no FK:
-- activity and journal outboxes are allowed to arrive in either order.
CREATE UNIQUE INDEX idx_user_log_user_activity_event
  ON public.user_log (user_id, activity_event_id)
  WHERE activity_event_id IS NOT NULL;
