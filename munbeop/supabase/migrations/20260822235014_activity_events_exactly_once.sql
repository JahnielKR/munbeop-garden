-- Immutable activity receipts make retries safe: a client-generated event id
-- may be acknowledged more than once, but it contributes to user_activity at
-- most once. The local calendar metadata is retained for timezone auditing.
CREATE TABLE public.user_activity_events (
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id          uuid        NOT NULL,
  local_day         date        NOT NULL,
  occurred_at       timestamptz NOT NULL,
  time_zone         text        NOT NULL,
  utc_offset_minutes smallint   NOT NULL,
  source            text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT pg_catalog.now(),
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT user_activity_events_event_id_v4_check CHECK (
    event_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT user_activity_events_time_zone_check CHECK (
    pg_catalog.char_length(time_zone) BETWEEN 1 AND 64
    AND time_zone ~ '^[A-Za-z0-9._+/-]+$'
  ),
  CONSTRAINT user_activity_events_utc_offset_check CHECK (
    utc_offset_minutes BETWEEN -840 AND 840
  ),
  CONSTRAINT user_activity_events_local_day_check CHECK (
    local_day = (
      (occurred_at AT TIME ZONE 'UTC')
      + pg_catalog.make_interval(mins => utc_offset_minutes::integer)
    )::date
  ),
  CONSTRAINT user_activity_events_source_check CHECK (
    source IN (
      'cloze',
      'conjugation',
      'counter',
      'dictation',
      'escape-room',
      'number-market',
      'number-speed',
      'onboarding',
      'pair-drill',
      'particle-drill',
      'particle-explore',
      'particle-spacing',
      'placement',
      'practice',
      'register',
      'sentence-garden'
    )
  )
);

-- The primary key serves receipt lookups and the auth.users cascade. This
-- secondary order supports per-day audits/history without scanning all events.
CREATE INDEX idx_user_activity_events_user_day_occurred
  ON public.user_activity_events (user_id, local_day, occurred_at DESC);

ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_activity_events_owner_select"
  ON public.user_activity_events
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()) = user_id
  );

CREATE POLICY "user_activity_events_owner_insert"
  ON public.user_activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()) = user_id
  );

-- Defaults in this project deliberately keep new public objects private. Opt
-- in only the operations required by this SECURITY INVOKER RPC and receipt
-- inspection; receipts are immutable to browser roles.
REVOKE ALL PRIVILEGES ON TABLE public.user_activity_events
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.user_activity_events
  TO authenticated;

CREATE OR REPLACE FUNCTION public.record_user_activity_events_v2(
  p_expected_user_id uuid,
  p_events jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_event_count integer;
  v_inserted_event_ids uuid[] := ARRAY[]::uuid[];
  v_acknowledged_ids jsonb := '[]'::jsonb;
  v_totals_by_day jsonb := '{}'::jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  -- Bind the adapter instance to the JWT subject. This rejects a stale adapter
  -- immediately after an account switch even though RLS would also deny rows.
  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_events IS NULL OR pg_catalog.jsonb_typeof(p_events) <> 'array' THEN
    RAISE EXCEPTION 'Activity events must be a JSON array'
      USING ERRCODE = '22023';
  END IF;

  v_event_count := pg_catalog.jsonb_array_length(p_events);
  IF v_event_count < 1 OR v_event_count > 100 THEN
    RAISE EXCEPTION 'Activity event batch must contain between 1 and 100 events'
      USING ERRCODE = '22023';
  END IF;

  -- Check container types first: jsonb_object_keys() must never receive a
  -- scalar, and SQL does not guarantee short-circuit evaluation of OR terms.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    WHERE pg_catalog.jsonb_typeof(input.event) <> 'object'
  ) THEN
    RAISE EXCEPTION 'Each activity event must be a JSON object'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    WHERE NOT (
      input.event ?& ARRAY[
        'eventId',
        'localDay',
        'occurredAt',
        'timeZone',
        'utcOffsetMinutes',
        'source'
      ]::text[]
    )
      OR (
        SELECT pg_catalog.count(*)
        FROM pg_catalog.jsonb_object_keys(input.event) AS event_key
      ) <> 6
      OR pg_catalog.jsonb_typeof(input.event -> 'eventId') <> 'string'
      OR (input.event ->> 'eventId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      OR pg_catalog.jsonb_typeof(input.event -> 'localDay') <> 'string'
      OR (input.event ->> 'localDay') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      OR pg_catalog.jsonb_typeof(input.event -> 'occurredAt') <> 'string'
      OR (input.event ->> 'occurredAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?(Z|[+-][0-9]{2}:[0-9]{2})$'
      OR pg_catalog.jsonb_typeof(input.event -> 'timeZone') <> 'string'
      OR pg_catalog.char_length(input.event ->> 'timeZone') NOT BETWEEN 1 AND 64
      OR (input.event ->> 'timeZone') !~ '^[A-Za-z0-9._+/-]+$'
      OR pg_catalog.jsonb_typeof(input.event -> 'utcOffsetMinutes') <> 'number'
      OR (input.event ->> 'utcOffsetMinutes') !~ '^-?[0-9]{1,4}$'
      OR (input.event ->> 'utcOffsetMinutes')::integer NOT BETWEEN -840 AND 840
      OR pg_catalog.jsonb_typeof(input.event -> 'source') <> 'string'
      OR (input.event ->> 'source') NOT IN (
        'cloze',
        'conjugation',
        'counter',
        'dictation',
        'escape-room',
        'number-market',
        'number-speed',
        'onboarding',
        'pair-drill',
        'particle-drill',
        'particle-explore',
        'particle-spacing',
        'placement',
        'practice',
        'register',
        'sentence-garden'
      )
  ) THEN
    RAISE EXCEPTION 'Activity event has an invalid shape or value'
      USING ERRCODE = '22023';
  END IF;

  -- Convert only after lexical validation, then normalize date failures to a
  -- stable invalid-parameter error for PostgREST clients.
  BEGIN
    PERFORM
      (input.event ->> 'eventId')::uuid,
      (input.event ->> 'localDay')::date,
      (input.event ->> 'occurredAt')::timestamptz
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event);
  EXCEPTION
    WHEN invalid_text_representation
      OR invalid_datetime_format
      OR datetime_field_overflow
    THEN
      RAISE EXCEPTION 'Activity event contains an invalid id or timestamp'
        USING ERRCODE = '22023';
  END;

  -- Validate membership separately: SQL does not promise short-circuiting, so
  -- timezone() must never receive an unrecognized name in the next statement.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    WHERE NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_timezone_names AS zone
      WHERE zone.name = input.event ->> 'timeZone'
    )
  ) THEN
    RAISE EXCEPTION 'Activity event time zone is not recognized'
      USING ERRCODE = '22023';
  END IF;

  -- Tie all three local-time fields to the named zone at the actual instant.
  -- This catches stale/wrong offsets across DST boundaries, not only bad days.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    WHERE (
      pg_catalog.timezone(
        input.event ->> 'timeZone',
        (input.event ->> 'occurredAt')::timestamptz
      ) - pg_catalog.timezone(
        'UTC',
        (input.event ->> 'occurredAt')::timestamptz
      )
    ) IS DISTINCT FROM pg_catalog.make_interval(
      mins => (input.event ->> 'utcOffsetMinutes')::integer
    )
      OR (input.event ->> 'localDay')::date IS DISTINCT FROM
        pg_catalog.timezone(
          input.event ->> 'timeZone',
          (input.event ->> 'occurredAt')::timestamptz
        )::date
  ) THEN
    RAISE EXCEPTION 'Activity event timezone metadata is inconsistent'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    GROUP BY (input.event ->> 'eventId')::uuid
    HAVING pg_catalog.count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Activity event batch contains duplicate ids'
      USING ERRCODE = '22023';
  END IF;

  -- Share the account-wide transaction lock with backup restore and the
  -- journal/SRS RPCs. A restore can now replace its activity snapshot and
  -- receipt baseline atomically: an event lands wholly before or after it.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  -- Insert in primary-key order so overlapping batches acquire locks in the
  -- same order. RETURNING is the source of truth for which events are new.
  WITH input_events AS (
    SELECT
      (input.event ->> 'eventId')::uuid AS event_id,
      (input.event ->> 'localDay')::date AS local_day,
      (input.event ->> 'occurredAt')::timestamptz AS occurred_at,
      input.event ->> 'timeZone' AS time_zone,
      (input.event ->> 'utcOffsetMinutes')::smallint AS utc_offset_minutes,
      input.event ->> 'source' AS source
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
  ),
  inserted AS (
    INSERT INTO public.user_activity_events (
      user_id,
      event_id,
      local_day,
      occurred_at,
      time_zone,
      utc_offset_minutes,
      source
    )
    SELECT
      v_user_id,
      input_events.event_id,
      input_events.local_day,
      input_events.occurred_at,
      input_events.time_zone,
      input_events.utc_offset_minutes,
      input_events.source
    FROM input_events
    ORDER BY input_events.event_id
    ON CONFLICT (user_id, event_id) DO NOTHING
    RETURNING event_id
  )
  SELECT COALESCE(
    pg_catalog.array_agg(inserted.event_id ORDER BY inserted.event_id),
    ARRAY[]::uuid[]
  )
  INTO v_inserted_event_ids
  FROM inserted;

  -- ON CONFLICT DO NOTHING is idempotent only when an id denotes the same
  -- immutable event. A concurrent request may have won the insert, so compare
  -- every canonical receipt after the insert has resolved its key locks.
  IF EXISTS (
    WITH input_events AS (
      SELECT
        (input.event ->> 'eventId')::uuid AS event_id,
        (input.event ->> 'localDay')::date AS local_day,
        (input.event ->> 'occurredAt')::timestamptz AS occurred_at,
        input.event ->> 'timeZone' AS time_zone,
        (input.event ->> 'utcOffsetMinutes')::smallint AS utc_offset_minutes,
        input.event ->> 'source' AS source
      FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
    )
    SELECT 1
    FROM input_events
    JOIN public.user_activity_events AS receipt
      ON receipt.user_id = v_user_id
      AND receipt.event_id = input_events.event_id
    WHERE receipt.local_day IS DISTINCT FROM input_events.local_day
      OR receipt.occurred_at IS DISTINCT FROM input_events.occurred_at
      OR receipt.time_zone IS DISTINCT FROM input_events.time_zone
      OR receipt.utc_offset_minutes IS DISTINCT FROM input_events.utc_offset_minutes
      OR receipt.source IS DISTINCT FROM input_events.source
  ) THEN
    RAISE EXCEPTION 'Activity event id was reused with a different payload'
      USING ERRCODE = '23505';
  END IF;

  -- Only rows returned by the receipt INSERT contribute a delta. Retrying an
  -- already-committed batch therefore acknowledges it without incrementing.
  INSERT INTO public.user_activity AS activity (user_id, day, count, updated_at)
  SELECT
    v_user_id,
    receipt.local_day,
    pg_catalog.count(*)::integer,
    pg_catalog.now()
  FROM public.user_activity_events AS receipt
  WHERE receipt.user_id = v_user_id
    AND receipt.event_id = ANY (v_inserted_event_ids)
  GROUP BY receipt.local_day
  ORDER BY receipt.local_day
  ON CONFLICT (user_id, day) DO UPDATE
  SET count = activity.count + EXCLUDED.count,
      updated_at = pg_catalog.now();

  SELECT COALESCE(
    pg_catalog.jsonb_agg(input.event ->> 'eventId' ORDER BY input.ordinality),
    '[]'::jsonb
  )
  INTO v_acknowledged_ids
  FROM pg_catalog.jsonb_array_elements(p_events)
    WITH ORDINALITY AS input(event, ordinality);

  WITH input_days AS (
    SELECT DISTINCT (input.event ->> 'localDay')::date AS day
    FROM pg_catalog.jsonb_array_elements(p_events) AS input(event)
  )
  SELECT COALESCE(
    pg_catalog.jsonb_object_agg(
      activity.day::text,
      activity.count
      ORDER BY activity.day
    ),
    '{}'::jsonb
  )
  INTO v_totals_by_day
  FROM public.user_activity AS activity
  JOIN input_days ON input_days.day = activity.day
  WHERE activity.user_id = v_user_id;

  RETURN pg_catalog.jsonb_build_object(
    'acknowledgedIds', v_acknowledged_ids,
    'totalsByDay', v_totals_by_day
  );
END;
$$;

-- Compatibility for clients deployed before the outbox protocol. v1 cannot
-- provide exactly-once receipts, but it must still serialize with snapshot
-- restore so its delta lands wholly before or after the imported baseline.
CREATE OR REPLACE FUNCTION public.increment_user_activity(
  p_day date,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_day IS NULL THEN
    RAISE EXCEPTION 'Activity day is required'
      USING ERRCODE = '22004';
  END IF;

  IF p_delta IS NULL OR p_delta < 1 OR p_delta > 1000 THEN
    RAISE EXCEPTION 'Activity delta must be between 1 and 1000'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  INSERT INTO public.user_activity AS activity (user_id, day, count, updated_at)
  VALUES (v_user_id, p_day, p_delta, pg_catalog.now())
  ON CONFLICT (user_id, day) DO UPDATE
  SET count = activity.count + EXCLUDED.count,
      updated_at = pg_catalog.now()
  RETURNING activity.count INTO v_count;

  RETURN v_count;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.record_user_activity_events_v2(uuid, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.increment_user_activity(date, integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_user_activity_events_v2(uuid, jsonb)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_activity(date, integer)
  TO authenticated;
