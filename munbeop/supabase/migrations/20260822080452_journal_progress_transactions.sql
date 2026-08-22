-- Optimistic revisions are additive: legacy readers/writers keep working, while
-- v2 mutations can detect stale cross-tab snapshots.
ALTER TABLE public.user_log
  ADD COLUMN revision bigint NOT NULL DEFAULT 0,
  ADD CONSTRAINT user_log_revision_safe_integer
    CHECK (revision BETWEEN 0 AND 9007199254740991);

ALTER TABLE public.user_progress
  ADD COLUMN revision bigint NOT NULL DEFAULT 0,
  ADD CONSTRAINT user_progress_revision_safe_integer
    CHECK (revision BETWEEN 0 AND 9007199254740991);

-- Keep a durable per-account high-water mark outside the replaceable backup
-- collections. Row-local `revision + 1` counters can otherwise recycle after
-- an import deletes/recreates an id (the classic A -> B -> A ABA race).
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Preserve the proven collection-by-collection implementation as a private
-- building block. A public compatibility wrapper is recreated below and goes
-- through v2, so older clients receive the same lock/revision guarantees.
ALTER FUNCTION public.restore_user_backup(jsonb) SET SCHEMA private;
ALTER FUNCTION private.restore_user_backup(jsonb)
  RENAME TO restore_user_backup_collections;

CREATE TABLE private.user_data_revision_epochs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  revision bigint NOT NULL DEFAULT 0,
  CONSTRAINT user_data_revision_epochs_safe_integer
    CHECK (revision BETWEEN 0 AND 9007199254740991)
);

ALTER TABLE private.user_data_revision_epochs ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE private.user_data_revision_epochs
  FROM PUBLIC, anon, authenticated, service_role;

-- This helper is deliberately outside the exposed public API schema. It is
-- SECURITY DEFINER only to update the private counter; JWT binding, an empty
-- search_path, and the safe-integer ceiling keep that narrow privilege scoped.
CREATE OR REPLACE FUNCTION private.next_user_data_revision(
  p_expected_user_id uuid,
  p_floor bigint DEFAULT 0
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_revision bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_floor IS NULL OR p_floor NOT BETWEEN 0 AND 9007199254740990 THEN
    RAISE EXCEPTION 'Revision space exhausted or floor is invalid'
      USING ERRCODE = '22003';
  END IF;

  INSERT INTO private.user_data_revision_epochs AS epoch (
    user_id,
    revision
  )
  VALUES (
    v_user_id,
    p_floor + 1
  )
  ON CONFLICT (user_id) DO UPDATE
  SET revision = GREATEST(epoch.revision, p_floor) + 1
  WHERE GREATEST(epoch.revision, p_floor) < 9007199254740991
  RETURNING epoch.revision INTO v_revision;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revision space exhausted'
      USING ERRCODE = '22003';
  END IF;

  RETURN v_revision;
END;
$$;

-- Activity backups contain day aggregates, not their receipt journal. Reset
-- the caller's receipts when such a snapshot is restored so the imported map
-- becomes an explicit baseline and future events are exactly-once from there.
CREATE OR REPLACE FUNCTION private.reset_user_activity_receipts(
  p_expected_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  DELETE FROM public.user_activity_events AS receipt
  WHERE receipt.user_id = v_user_id;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION private.next_user_data_revision(uuid, bigint)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION private.reset_user_activity_receipts(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.next_user_data_revision(uuid, bigint)
  TO authenticated;
GRANT EXECUTE ON FUNCTION private.reset_user_activity_receipts(uuid)
  TO authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION private.restore_user_backup_collections(jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.restore_user_backup_collections(jsonb)
  TO authenticated;

-- Rebuild one SRS projection from its journal. Incorrect review entries do not
-- count, matching app/lib/srs/mastery.ts exactly. last_seen is monotonic: a
-- recalculation may advance it from journal history but never moves it back.
CREATE OR REPLACE FUNCTION public.recalculate_user_progress_v2(
  p_expected_user_id uuid,
  p_ko text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_log_entry_count integer;
  v_easy_count integer;
  v_hard_count integer;
  v_log_last_seen timestamptz;
  v_next_last_seen timestamptz;
  v_mastery text;
  v_progress public.user_progress%ROWTYPE;
  v_has_progress boolean := false;
  v_next_revision bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_ko IS NULL OR pg_catalog.btrim(p_ko) = '' THEN
    RAISE EXCEPTION 'Grammar key is required'
      USING ERRCODE = '22023';
  END IF;

  -- Every journal/progress v2 mutation takes this exact account lock before
  -- touching either table. Nested calls are re-entrant in the same transaction.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  SELECT progress.*
  INTO v_progress
  FROM public.user_progress AS progress
  WHERE progress.user_id = v_user_id
    AND progress.ko = p_ko
  FOR UPDATE;
  v_has_progress := FOUND;

  SELECT
    pg_catalog.count(*)::integer,
    pg_catalog.count(*) FILTER (
      WHERE journal.review_state <> 'incorrect'
        AND journal.feedback = 'easy'
    )::integer,
    pg_catalog.count(*) FILTER (
      WHERE journal.review_state <> 'incorrect'
        AND journal.feedback = 'hard'
    )::integer,
    pg_catalog.max(journal.created_at) FILTER (
      WHERE journal.review_state <> 'incorrect'
    )
  INTO
    v_log_entry_count,
    v_easy_count,
    v_hard_count,
    v_log_last_seen
  FROM public.user_log AS journal
  WHERE journal.user_id = v_user_id
    AND journal.ko = p_ko;

  v_next_last_seen := CASE
    WHEN v_has_progress
      AND v_progress.last_seen IS NOT NULL
      AND (v_log_last_seen IS NULL OR v_progress.last_seen > v_log_last_seen)
      THEN v_progress.last_seen
    ELSE v_log_last_seen
  END;

  -- TypeScript thresholds:
  -- tree  = total >= 60 AND easy >= hard * 2.5
  -- plant = total >= 20 AND easy >= hard * 1.5
  -- Integer cross-products avoid floating-point boundary drift.
  v_mastery := CASE
    WHEN v_easy_count + v_hard_count >= 60
      AND v_easy_count * 2 >= v_hard_count * 5
      THEN 'tree'
    WHEN v_easy_count + v_hard_count >= 20
      AND v_easy_count * 2 >= v_hard_count * 3
      THEN 'plant'
    ELSE 'seedling'
  END;

  IF v_has_progress THEN
    IF v_progress.last_seen IS DISTINCT FROM v_next_last_seen
      OR v_progress.easy_count IS DISTINCT FROM v_easy_count
      OR v_progress.hard_count IS DISTINCT FROM v_hard_count
      OR v_progress.mastery IS DISTINCT FROM v_mastery
    THEN
      v_next_revision := private.next_user_data_revision(
        v_user_id,
        v_progress.revision
      );
      UPDATE public.user_progress AS progress
      SET last_seen = v_next_last_seen,
          easy_count = v_easy_count,
          hard_count = v_hard_count,
          mastery = v_mastery,
          updated_at = pg_catalog.now(),
          revision = v_next_revision
      WHERE progress.user_id = v_user_id
        AND progress.ko = p_ko
      RETURNING progress.* INTO v_progress;
    END IF;
  ELSIF v_log_entry_count > 0 THEN
    -- A journal-only drill still creates a practiced projection. Its revision
    -- comes from the account high-water mark, so deleted ids never recycle it.
    v_next_revision := private.next_user_data_revision(v_user_id, 0);
    INSERT INTO public.user_progress AS progress (
      user_id,
      ko,
      last_seen,
      easy_count,
      hard_count,
      mastery,
      updated_at,
      revision
    )
    VALUES (
      v_user_id,
      p_ko,
      v_next_last_seen,
      v_easy_count,
      v_hard_count,
      v_mastery,
      pg_catalog.now(),
      v_next_revision
    )
    ON CONFLICT (user_id, ko) DO UPDATE
    SET last_seen = CASE
          WHEN progress.last_seen IS NULL THEN EXCLUDED.last_seen
          WHEN EXCLUDED.last_seen IS NULL THEN progress.last_seen
          ELSE GREATEST(progress.last_seen, EXCLUDED.last_seen)
        END,
        easy_count = EXCLUDED.easy_count,
        hard_count = EXCLUDED.hard_count,
        mastery = EXCLUDED.mastery,
        updated_at = CASE
          WHEN progress.last_seen IS DISTINCT FROM CASE
              WHEN progress.last_seen IS NULL THEN EXCLUDED.last_seen
              WHEN EXCLUDED.last_seen IS NULL THEN progress.last_seen
              ELSE GREATEST(progress.last_seen, EXCLUDED.last_seen)
            END
            OR progress.easy_count IS DISTINCT FROM EXCLUDED.easy_count
            OR progress.hard_count IS DISTINCT FROM EXCLUDED.hard_count
            OR progress.mastery IS DISTINCT FROM EXCLUDED.mastery
            THEN pg_catalog.now()
          ELSE progress.updated_at
        END,
        revision = CASE
          WHEN progress.last_seen IS DISTINCT FROM CASE
              WHEN progress.last_seen IS NULL THEN EXCLUDED.last_seen
              WHEN EXCLUDED.last_seen IS NULL THEN progress.last_seen
              ELSE GREATEST(progress.last_seen, EXCLUDED.last_seen)
            END
            OR progress.easy_count IS DISTINCT FROM EXCLUDED.easy_count
            OR progress.hard_count IS DISTINCT FROM EXCLUDED.hard_count
            OR progress.mastery IS DISTINCT FROM EXCLUDED.mastery
            THEN EXCLUDED.revision
          ELSE progress.revision
        END
    RETURNING progress.* INTO v_progress;
    v_has_progress := true;
  END IF;

  IF NOT v_has_progress THEN
    RETURN pg_catalog.jsonb_build_object(
      'ko', p_ko,
      'lastSeen', NULL,
      'easyCount', 0,
      'hardCount', 0,
      'mastery', 'seedling',
      'revision', 0
    );
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'ko', v_progress.ko,
    'lastSeen', CASE
      WHEN v_progress.last_seen IS NULL THEN NULL
      ELSE (
        EXTRACT(epoch FROM v_progress.last_seen) * 1000
      )::bigint
    END,
    'easyCount', v_progress.easy_count,
    'hardCount', v_progress.hard_count,
    'mastery', v_progress.mastery,
    'revision', v_progress.revision
  );
END;
$$;

-- Optimistic review update. A lost response can be retried with the old
-- revision when both requested mutable fields already match the stored row.
CREATE OR REPLACE FUNCTION public.set_user_log_review_v2(
  p_expected_user_id uuid,
  p_id bigint,
  p_review_state text,
  p_error_note text,
  p_expected_revision bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_entry public.user_log%ROWTYPE;
  v_progress jsonb;
  v_next_revision bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_id IS NULL OR p_id < 1 OR p_id > 9007199254740991 THEN
    RAISE EXCEPTION 'Journal id must be a positive JavaScript-safe integer'
      USING ERRCODE = '22023';
  END IF;

  IF p_review_state IS NULL
    OR p_review_state NOT IN ('unreviewed', 'correct', 'incorrect')
  THEN
    RAISE EXCEPTION 'Review state is invalid'
      USING ERRCODE = '22023';
  END IF;

  IF p_error_note IS NOT NULL AND pg_catalog.char_length(p_error_note) > 10000 THEN
    RAISE EXCEPTION 'Review error note is too long'
      USING ERRCODE = '22023';
  END IF;

  IF p_review_state = 'incorrect'
    AND (p_error_note IS NULL OR pg_catalog.btrim(p_error_note) = '')
  THEN
    RAISE EXCEPTION 'Incorrect reviews require an error note'
      USING ERRCODE = '22023';
  END IF;

  IF p_expected_revision IS NULL
    OR p_expected_revision NOT BETWEEN 0 AND 9007199254740991
  THEN
    RAISE EXCEPTION 'Expected revision must be a JavaScript-safe integer'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  SELECT journal.*
  INTO v_entry
  FROM public.user_log AS journal
  WHERE journal.user_id = v_user_id
    AND journal.id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Journal entry not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_entry.revision IS DISTINCT FROM p_expected_revision THEN
    IF v_entry.review_state IS DISTINCT FROM p_review_state
      OR v_entry.error_note IS DISTINCT FROM p_error_note
    THEN
      RAISE EXCEPTION 'Journal review revision conflict'
        USING ERRCODE = '40001';
    END IF;
    -- Same state + note is an idempotent retry of an already-committed update.
  ELSIF v_entry.review_state IS DISTINCT FROM p_review_state
    OR v_entry.error_note IS DISTINCT FROM p_error_note
  THEN
    v_next_revision := private.next_user_data_revision(
      v_user_id,
      v_entry.revision
    );
    UPDATE public.user_log AS journal
    SET review_state = p_review_state,
        error_note = p_error_note,
        revision = v_next_revision
    WHERE journal.user_id = v_user_id
      AND journal.id = p_id
    RETURNING journal.* INTO v_entry;
  END IF;

  v_progress := public.recalculate_user_progress_v2(v_user_id, v_entry.ko);

  RETURN pg_catalog.jsonb_build_object(
    'entry', pg_catalog.jsonb_build_object(
      'id', v_entry.id,
      'ko', v_entry.ko,
      'sentence', v_entry.sentence,
      'feedback', v_entry.feedback,
      'errorNote', v_entry.error_note,
      'errorDimension', v_entry.error_dimension,
      'reviewState', v_entry.review_state,
      'contextId', v_entry.context_id,
      'contextName', v_entry.context_name,
      'date', v_entry.created_at,
      'localDay', v_entry.local_day,
      'timeZone', v_entry.time_zone,
      'utcOffsetMinutes', v_entry.utc_offset_minutes,
      'activityEventId', v_entry.activity_event_id,
      'revision', v_entry.revision
    ),
    'progress', v_progress
  );
END;
$$;

-- Delete is outcome-idempotent: after a committed response is lost, the retry
-- sees no row, still rebuilds expected_ko, and returns the same logical success.
CREATE OR REPLACE FUNCTION public.delete_user_log_entry_v2(
  p_expected_user_id uuid,
  p_id bigint,
  p_expected_ko text,
  p_expected_revision bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_entry public.user_log%ROWTYPE;
  v_progress jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_id IS NULL OR p_id < 1 OR p_id > 9007199254740991 THEN
    RAISE EXCEPTION 'Journal id must be a positive JavaScript-safe integer'
      USING ERRCODE = '22023';
  END IF;

  IF p_expected_ko IS NULL OR pg_catalog.btrim(p_expected_ko) = '' THEN
    RAISE EXCEPTION 'Expected grammar key is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_expected_revision IS NULL
    OR p_expected_revision NOT BETWEEN 0 AND 9007199254740991
  THEN
    RAISE EXCEPTION 'Expected revision must be a JavaScript-safe integer'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  SELECT journal.*
  INTO v_entry
  FROM public.user_log AS journal
  WHERE journal.user_id = v_user_id
    AND journal.id = p_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_entry.ko IS DISTINCT FROM p_expected_ko
      OR v_entry.revision IS DISTINCT FROM p_expected_revision
    THEN
      RAISE EXCEPTION 'Journal delete revision conflict'
        USING ERRCODE = '40001';
    END IF;

    DELETE FROM public.user_log AS journal
    WHERE journal.user_id = v_user_id
      AND journal.id = p_id;
  END IF;

  -- This call is unconditional, including the already-deleted retry path.
  v_progress := public.recalculate_user_progress_v2(v_user_id, p_expected_ko);

  RETURN pg_catalog.jsonb_build_object(
    'deleted', true,
    'id', p_id,
    'progress', v_progress
  );
END;
$$;

-- Session starts may mark a grammar as seen before a journal entry exists.
-- The UPSERT only advances last_seen and never overwrites projected counts.
CREATE OR REPLACE FUNCTION public.mark_user_progress_seen_v2(
  p_expected_user_id uuid,
  p_ko text,
  p_seen_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_progress public.user_progress%ROWTYPE;
  v_next_revision bigint;
  v_revision_floor bigint := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_ko IS NULL OR pg_catalog.btrim(p_ko) = '' THEN
    RAISE EXCEPTION 'Grammar key is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_seen_at IS NULL OR NOT pg_catalog.isfinite(p_seen_at) THEN
    RAISE EXCEPTION 'Seen timestamp must be finite'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  SELECT progress.revision
  INTO v_revision_floor
  FROM public.user_progress AS progress
  WHERE progress.user_id = v_user_id
    AND progress.ko = p_ko
  FOR UPDATE;
  v_revision_floor := COALESCE(v_revision_floor, 0);
  v_next_revision := private.next_user_data_revision(v_user_id, v_revision_floor);

  INSERT INTO public.user_progress AS progress (
    user_id,
    ko,
    last_seen,
    easy_count,
    hard_count,
    mastery,
    updated_at,
    revision
  )
  VALUES (
    v_user_id,
    p_ko,
    p_seen_at,
    0,
    0,
    'seedling',
    pg_catalog.now(),
    v_next_revision
  )
  ON CONFLICT (user_id, ko) DO UPDATE
  SET last_seen = EXCLUDED.last_seen,
      updated_at = pg_catalog.now(),
      revision = EXCLUDED.revision
  WHERE progress.last_seen IS NULL
    OR progress.last_seen < EXCLUDED.last_seen
  RETURNING progress.* INTO v_progress;

  IF NOT FOUND THEN
    SELECT progress.*
    INTO STRICT v_progress
    FROM public.user_progress AS progress
    WHERE progress.user_id = v_user_id
      AND progress.ko = p_ko;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'ko', v_progress.ko,
    'lastSeen', CASE
      WHEN v_progress.last_seen IS NULL THEN NULL
      ELSE (
        EXTRACT(epoch FROM v_progress.last_seen) * 1000
      )::bigint
    END,
    'easyCount', v_progress.easy_count,
    'hardCount', v_progress.hard_count,
    'mastery', v_progress.mastery,
    'revision', v_progress.revision
  );
END;
$$;

-- Save a journal event with a client-generated stable id. A retry compares the
-- event's immutable identity; review_state/error_note may legitimately have
-- changed in another tab after the first save response was lost.
CREATE OR REPLACE FUNCTION public.save_user_log_entry_v2(
  p_expected_user_id uuid,
  p_entry jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_id bigint;
  v_ko text;
  v_sentence text;
  v_feedback text;
  v_error_note text;
  v_error_dimension text;
  v_review_state text;
  v_context_id text;
  v_context_name text;
  v_created_at timestamptz;
  v_local_day date;
  v_time_zone text;
  v_utc_offset_minutes smallint;
  v_activity_event_id uuid;
  v_entry public.user_log%ROWTYPE;
  v_progress jsonb;
  v_next_revision bigint;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_entry IS NULL OR pg_catalog.jsonb_typeof(p_entry) <> 'object' THEN
    RAISE EXCEPTION 'Journal entry must be a JSON object'
      USING ERRCODE = '22023';
  END IF;

  IF NOT (
    p_entry ?& ARRAY[
      'id',
      'ko',
      'sentence',
      'feedback',
      'reviewState',
      'contextId',
      'contextName',
      'date'
    ]::text[]
  )
    OR pg_catalog.jsonb_typeof(p_entry -> 'id') <> 'number'
    OR (p_entry ->> 'id') !~ '^[0-9]{1,16}$'
    OR pg_catalog.jsonb_typeof(p_entry -> 'ko') <> 'string'
    OR pg_catalog.btrim(p_entry ->> 'ko') = ''
    OR pg_catalog.jsonb_typeof(p_entry -> 'sentence') <> 'string'
    OR pg_catalog.btrim(p_entry ->> 'sentence') = ''
    OR pg_catalog.jsonb_typeof(p_entry -> 'feedback') <> 'string'
    OR (p_entry ->> 'feedback') NOT IN ('easy', 'hard')
    OR pg_catalog.jsonb_typeof(p_entry -> 'reviewState') <> 'string'
    OR (p_entry ->> 'reviewState') NOT IN ('unreviewed', 'correct', 'incorrect')
    OR pg_catalog.jsonb_typeof(p_entry -> 'contextId') <> 'string'
    OR pg_catalog.btrim(p_entry ->> 'contextId') = ''
    OR pg_catalog.jsonb_typeof(p_entry -> 'contextName') <> 'string'
    OR pg_catalog.btrim(p_entry ->> 'contextName') = ''
    OR pg_catalog.jsonb_typeof(p_entry -> 'date') <> 'string'
    OR (p_entry ->> 'date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?(Z|[+-][0-9]{2}:[0-9]{2})$'
  THEN
    RAISE EXCEPTION 'Journal entry has an invalid required field'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'errorNote'
    AND pg_catalog.jsonb_typeof(p_entry -> 'errorNote') NOT IN ('string', 'null')
  THEN
    RAISE EXCEPTION 'Journal error note must be a string or null'
      USING ERRCODE = '22023';
  END IF;

  IF pg_catalog.char_length(p_entry ->> 'errorNote') > 10000 THEN
    RAISE EXCEPTION 'Journal error note is too long'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ->> 'reviewState' = 'incorrect'
    AND (
      p_entry ->> 'errorNote' IS NULL
      OR pg_catalog.btrim(p_entry ->> 'errorNote') = ''
    )
  THEN
    RAISE EXCEPTION 'Incorrect reviews require an error note'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'errorDimension'
    AND pg_catalog.jsonb_typeof(p_entry -> 'errorDimension') NOT IN ('string', 'null')
  THEN
    RAISE EXCEPTION 'Journal error dimension must be a string or null'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ->> 'errorDimension' IS NOT NULL
    AND (p_entry ->> 'errorDimension') NOT IN (
      'particle',
      'ending',
      'register',
      'word_order',
      'other'
    )
  THEN
    RAISE EXCEPTION 'Journal error dimension is invalid'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'activityEventId'
    AND pg_catalog.jsonb_typeof(p_entry -> 'activityEventId') NOT IN ('string', 'null')
  THEN
    RAISE EXCEPTION 'Activity event id must be a UUID or null'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ->> 'activityEventId' IS NOT NULL
    AND (p_entry ->> 'activityEventId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  THEN
    RAISE EXCEPTION 'Activity event id must be a UUIDv4'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'localDay'
    AND pg_catalog.jsonb_typeof(p_entry -> 'localDay') NOT IN ('string', 'null')
  THEN
    RAISE EXCEPTION 'Journal local day must be a date or null'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'timeZone'
    AND pg_catalog.jsonb_typeof(p_entry -> 'timeZone') NOT IN ('string', 'null')
  THEN
    RAISE EXCEPTION 'Journal time zone must be a string or null'
      USING ERRCODE = '22023';
  END IF;

  IF p_entry ? 'utcOffsetMinutes'
    AND pg_catalog.jsonb_typeof(p_entry -> 'utcOffsetMinutes') NOT IN ('number', 'null')
  THEN
    RAISE EXCEPTION 'Journal UTC offset must be an integer or null'
      USING ERRCODE = '22023';
  END IF;

  IF (p_entry ->> 'localDay') IS NULL
    AND (p_entry ->> 'timeZone') IS NULL
    AND (p_entry ->> 'utcOffsetMinutes') IS NULL
  THEN
    v_local_day := NULL;
    v_time_zone := NULL;
    v_utc_offset_minutes := NULL;
  ELSIF (p_entry ->> 'localDay') IS NULL
    OR (p_entry ->> 'timeZone') IS NULL
    OR (p_entry ->> 'utcOffsetMinutes') IS NULL
  THEN
    RAISE EXCEPTION 'Journal local time metadata must be complete or null'
      USING ERRCODE = '22023';
  ELSE
    IF (p_entry ->> 'localDay') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      OR pg_catalog.char_length(p_entry ->> 'timeZone') NOT BETWEEN 1 AND 64
      OR (p_entry ->> 'timeZone') !~ '^[A-Za-z0-9._+/-]+$'
      OR (p_entry ->> 'utcOffsetMinutes') !~ '^-?[0-9]{1,4}$'
    THEN
      RAISE EXCEPTION 'Journal local time metadata is invalid'
        USING ERRCODE = '22023';
    END IF;

    v_time_zone := p_entry ->> 'timeZone';
    v_utc_offset_minutes := (p_entry ->> 'utcOffsetMinutes')::smallint;
    IF v_utc_offset_minutes NOT BETWEEN -840 AND 840 THEN
      RAISE EXCEPTION 'Journal UTC offset is out of range'
        USING ERRCODE = '22023';
    END IF;
  END IF;

  BEGIN
    v_id := (p_entry ->> 'id')::bigint;
    v_created_at := (p_entry ->> 'date')::timestamptz;
    IF (p_entry ->> 'localDay') IS NOT NULL THEN
      v_local_day := (p_entry ->> 'localDay')::date;
    END IF;
    IF (p_entry ->> 'activityEventId') IS NOT NULL THEN
      v_activity_event_id := (p_entry ->> 'activityEventId')::uuid;
    END IF;
  EXCEPTION
    WHEN invalid_text_representation
      OR invalid_datetime_format
      OR datetime_field_overflow
      OR numeric_value_out_of_range
    THEN
      RAISE EXCEPTION 'Journal entry contains an invalid id, date, or timestamp'
        USING ERRCODE = '22023';
  END;

  IF v_id < 1 OR v_id > 9007199254740991 THEN
    RAISE EXCEPTION 'Journal id must be a positive JavaScript-safe integer'
      USING ERRCODE = '22023';
  END IF;

  IF NOT pg_catalog.isfinite(v_created_at) THEN
    RAISE EXCEPTION 'Journal timestamp must be finite'
      USING ERRCODE = '22023';
  END IF;

  IF v_time_zone IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_timezone_names AS zone
    WHERE zone.name = v_time_zone
  ) THEN
    RAISE EXCEPTION 'Journal time zone is not recognized'
      USING ERRCODE = '22023';
  END IF;

  IF v_time_zone IS NOT NULL AND (
    (
      pg_catalog.timezone(v_time_zone, v_created_at)
      - pg_catalog.timezone('UTC', v_created_at)
    ) IS DISTINCT FROM pg_catalog.make_interval(
      mins => v_utc_offset_minutes::integer
    )
    OR v_local_day IS DISTINCT FROM
      pg_catalog.timezone(v_time_zone, v_created_at)::date
  )
  THEN
    RAISE EXCEPTION 'Journal local time metadata is inconsistent'
      USING ERRCODE = '22023';
  END IF;

  v_ko := p_entry ->> 'ko';
  v_sentence := p_entry ->> 'sentence';
  v_feedback := p_entry ->> 'feedback';
  v_error_note := p_entry ->> 'errorNote';
  v_error_dimension := p_entry ->> 'errorDimension';
  v_review_state := p_entry ->> 'reviewState';
  v_context_id := p_entry ->> 'contextId';
  v_context_name := p_entry ->> 'contextName';

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  v_next_revision := private.next_user_data_revision(v_user_id, 0);

  INSERT INTO public.user_log (
    user_id,
    id,
    ko,
    sentence,
    feedback,
    error_note,
    error_dimension,
    review_state,
    context_id,
    context_name,
    created_at,
    local_day,
    time_zone,
    utc_offset_minutes,
    activity_event_id,
    revision
  )
  VALUES (
    v_user_id,
    v_id,
    v_ko,
    v_sentence,
    v_feedback,
    v_error_note,
    v_error_dimension,
    v_review_state,
    v_context_id,
    v_context_name,
    v_created_at,
    v_local_day,
    v_time_zone,
    v_utc_offset_minutes,
    v_activity_event_id,
    v_next_revision
  )
  ON CONFLICT (user_id, id) DO NOTHING;

  SELECT journal.*
  INTO STRICT v_entry
  FROM public.user_log AS journal
  WHERE journal.user_id = v_user_id
    AND journal.id = v_id
  FOR UPDATE;

  IF v_entry.ko IS DISTINCT FROM v_ko
    OR v_entry.sentence IS DISTINCT FROM v_sentence
    OR v_entry.feedback IS DISTINCT FROM v_feedback
    OR v_entry.error_dimension IS DISTINCT FROM v_error_dimension
    OR v_entry.context_id IS DISTINCT FROM v_context_id
    OR v_entry.context_name IS DISTINCT FROM v_context_name
    OR v_entry.created_at IS DISTINCT FROM v_created_at
    OR v_entry.local_day IS DISTINCT FROM v_local_day
    OR v_entry.time_zone IS DISTINCT FROM v_time_zone
    OR v_entry.utc_offset_minutes IS DISTINCT FROM v_utc_offset_minutes
    OR v_entry.activity_event_id IS DISTINCT FROM v_activity_event_id
  THEN
    RAISE EXCEPTION 'Journal id was reused with a different payload'
      USING ERRCODE = '23505';
  END IF;

  v_progress := public.recalculate_user_progress_v2(v_user_id, v_entry.ko);

  RETURN pg_catalog.jsonb_build_object(
    'entry', pg_catalog.jsonb_build_object(
      'id', v_entry.id,
      'ko', v_entry.ko,
      'sentence', v_entry.sentence,
      'feedback', v_entry.feedback,
      'errorNote', v_entry.error_note,
      'errorDimension', v_entry.error_dimension,
      'reviewState', v_entry.review_state,
      'contextId', v_entry.context_id,
      'contextName', v_entry.context_name,
      'date', v_entry.created_at,
      'localDay', v_entry.local_day,
      'timeZone', v_entry.time_zone,
      'utcOffsetMinutes', v_entry.utc_offset_minutes,
      'activityEventId', v_entry.activity_event_id,
      'revision', v_entry.revision
    ),
    'progress', v_progress
  );
END;
$$;

-- Preserve the existing all-collection restore while replacing its journal/SRS
-- arms with revision-aware behavior. Other keys still use the proven legacy
-- implementation in the same PostgreSQL transaction. SRS counters/mastery are
-- then projected from the authoritative restored journal; imported lastSeen is
-- retained as a monotonic floor for session-only practice.
CREATE OR REPLACE FUNCTION public.restore_user_backup_v2(
  p_expected_user_id uuid,
  p_data jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_value jsonb;
  v_restored boolean;
  v_affected_kos text[] := ARRAY[]::text[];
  v_ko text;
  v_revision_floor bigint := 0;
  v_restore_revision bigint := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_user_id IS NULL OR p_expected_user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match expected user'
      USING ERRCODE = '42501';
  END IF;

  IF p_data IS NULL OR pg_catalog.jsonb_typeof(p_data) <> 'object' THEN
    RAISE EXCEPTION 'Backup data must be a JSON object'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  IF p_data ? 'munbeop.v1.log' OR p_data ? 'munbeop.v1.srs' THEN
    SELECT COALESCE(
      pg_catalog.array_agg(affected.ko ORDER BY affected.ko),
      ARRAY[]::text[]
    )
    INTO v_affected_kos
    FROM (
      SELECT journal.ko
      FROM public.user_log AS journal
      WHERE journal.user_id = v_user_id
      UNION
      SELECT progress.ko
      FROM public.user_progress AS progress
      WHERE progress.user_id = v_user_id
    ) AS affected;

    SELECT COALESCE(pg_catalog.max(current_revision.revision), 0)
    INTO v_revision_floor
    FROM (
      SELECT journal.revision
      FROM public.user_log AS journal
      WHERE journal.user_id = v_user_id
      UNION ALL
      SELECT progress.revision
      FROM public.user_progress AS progress
      WHERE progress.user_id = v_user_id
    ) AS current_revision;

    -- One generation identifies every row recreated by this import. The
    -- private high-water mark survives even if both collections become empty.
    v_restore_revision := private.next_user_data_revision(
      v_user_id,
      v_revision_floor
    );
  END IF;

  -- Do not let the legacy arms discard stable ids/local time or trust imported
  -- derived counters. Every other backup collection retains legacy semantics.
  v_restored := private.restore_user_backup_collections(
    p_data - ARRAY['munbeop.v1.log', 'munbeop.v1.srs']::text[]
  );
  IF v_restored IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Legacy backup restore returned no confirmation';
  END IF;

  IF p_data ? 'munbeop.v1.activity' THEN
    PERFORM private.reset_user_activity_receipts(v_user_id);
  END IF;

  IF p_data ? 'munbeop.v1.log' THEN
    DELETE FROM public.user_log AS journal
    WHERE journal.user_id = v_user_id;

    v_value := p_data -> 'munbeop.v1.log';
    IF v_value <> 'null'::jsonb THEN
      IF pg_catalog.jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Journal backup must be an array'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        WHERE pg_catalog.jsonb_typeof(source.item) <> 'object'
      ) THEN
        RAISE EXCEPTION 'Every journal backup entry must be an object'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        WHERE NOT (
          source.item ?& ARRAY[
            'id',
            'ko',
            'sentence',
            'feedback',
            'reviewState',
            'contextId',
            'contextName',
            'date'
          ]::text[]
        )
          OR pg_catalog.jsonb_typeof(source.item -> 'id') <> 'number'
          OR (source.item ->> 'id') !~ '^[0-9]{1,16}$'
          OR pg_catalog.jsonb_typeof(source.item -> 'ko') <> 'string'
          OR pg_catalog.btrim(source.item ->> 'ko') = ''
          OR pg_catalog.jsonb_typeof(source.item -> 'sentence') <> 'string'
          OR pg_catalog.btrim(source.item ->> 'sentence') = ''
          OR pg_catalog.jsonb_typeof(source.item -> 'feedback') <> 'string'
          OR (source.item ->> 'feedback') NOT IN ('easy', 'hard')
          OR pg_catalog.jsonb_typeof(source.item -> 'reviewState') <> 'string'
          OR (source.item ->> 'reviewState') NOT IN ('unreviewed', 'correct', 'incorrect')
          OR pg_catalog.jsonb_typeof(source.item -> 'contextId') <> 'string'
          OR pg_catalog.btrim(source.item ->> 'contextId') = ''
          OR pg_catalog.jsonb_typeof(source.item -> 'contextName') <> 'string'
          OR pg_catalog.btrim(source.item ->> 'contextName') = ''
          OR pg_catalog.jsonb_typeof(source.item -> 'date') <> 'string'
          OR (source.item ->> 'date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?(Z|[+-][0-9]{2}:[0-9]{2})$'
          OR (
            source.item ? 'errorNote'
            AND pg_catalog.jsonb_typeof(source.item -> 'errorNote') NOT IN ('string', 'null')
          )
          OR (
            source.item ? 'errorDimension'
            AND pg_catalog.jsonb_typeof(source.item -> 'errorDimension') NOT IN ('string', 'null')
          )
          OR (
            source.item ->> 'errorDimension' IS NOT NULL
            AND (source.item ->> 'errorDimension') NOT IN (
              'particle',
              'ending',
              'register',
              'word_order',
              'other'
            )
          )
          OR (
            source.item ? 'localDay'
            AND pg_catalog.jsonb_typeof(source.item -> 'localDay') NOT IN ('string', 'null')
          )
          OR (
            source.item ? 'timeZone'
            AND pg_catalog.jsonb_typeof(source.item -> 'timeZone') NOT IN ('string', 'null')
          )
          OR (
            source.item ? 'utcOffsetMinutes'
            AND pg_catalog.jsonb_typeof(source.item -> 'utcOffsetMinutes') NOT IN ('number', 'null')
          )
          OR (
            source.item ? 'activityEventId'
            AND pg_catalog.jsonb_typeof(source.item -> 'activityEventId') NOT IN ('string', 'null')
          )
          OR NOT (
            (
              source.item ->> 'localDay' IS NULL
              AND source.item ->> 'timeZone' IS NULL
              AND source.item ->> 'utcOffsetMinutes' IS NULL
            )
            OR (
              source.item ->> 'localDay' IS NOT NULL
              AND source.item ->> 'timeZone' IS NOT NULL
              AND source.item ->> 'utcOffsetMinutes' IS NOT NULL
            )
          )
          OR (
            source.item ->> 'localDay' IS NOT NULL
            AND (source.item ->> 'localDay') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          )
          OR (
            source.item ->> 'timeZone' IS NOT NULL
            AND (
              pg_catalog.char_length(source.item ->> 'timeZone') NOT BETWEEN 1 AND 64
              OR (source.item ->> 'timeZone') !~ '^[A-Za-z0-9._+/-]+$'
            )
          )
          OR (
            source.item ->> 'utcOffsetMinutes' IS NOT NULL
            AND (source.item ->> 'utcOffsetMinutes') !~ '^-?[0-9]{1,4}$'
          )
          OR (
            source.item ->> 'activityEventId' IS NOT NULL
            AND (source.item ->> 'activityEventId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          )
      ) THEN
        RAISE EXCEPTION 'Journal backup entry has an invalid shape or value'
          USING ERRCODE = '22023';
      END IF;

      BEGIN
        PERFORM
          (source.item ->> 'id')::bigint,
          (source.item ->> 'date')::timestamptz,
          CASE
            WHEN source.item ->> 'localDay' IS NULL THEN NULL
            ELSE (source.item ->> 'localDay')::date
          END,
          CASE
            WHEN source.item ->> 'utcOffsetMinutes' IS NULL THEN NULL
            ELSE (source.item ->> 'utcOffsetMinutes')::smallint
          END,
          CASE
            WHEN source.item ->> 'activityEventId' IS NULL THEN NULL
            ELSE (source.item ->> 'activityEventId')::uuid
          END
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item);
      EXCEPTION
        WHEN invalid_text_representation
          OR invalid_datetime_format
          OR datetime_field_overflow
          OR numeric_value_out_of_range
        THEN
          RAISE EXCEPTION 'Journal backup contains an invalid id, date, or timestamp'
            USING ERRCODE = '22023';
      END;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        WHERE (source.item ->> 'id')::bigint NOT BETWEEN 1 AND 9007199254740991
          OR NOT pg_catalog.isfinite((source.item ->> 'date')::timestamptz)
          OR (
            source.item ->> 'utcOffsetMinutes' IS NOT NULL
            AND (source.item ->> 'utcOffsetMinutes')::integer NOT BETWEEN -840 AND 840
          )
      ) THEN
        RAISE EXCEPTION 'Journal backup id, timestamp, or UTC offset is out of range'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        WHERE source.item ->> 'timeZone' IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM pg_catalog.pg_timezone_names AS zone
            WHERE zone.name = source.item ->> 'timeZone'
          )
      ) THEN
        RAISE EXCEPTION 'Journal backup time zone is not recognized'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        WHERE source.item ->> 'timeZone' IS NOT NULL
          AND (
            (
              pg_catalog.timezone(
                source.item ->> 'timeZone',
                (source.item ->> 'date')::timestamptz
              ) - pg_catalog.timezone(
                'UTC',
                (source.item ->> 'date')::timestamptz
              )
            ) IS DISTINCT FROM pg_catalog.make_interval(
              mins => (source.item ->> 'utcOffsetMinutes')::integer
            )
            OR (source.item ->> 'localDay')::date IS DISTINCT FROM
              pg_catalog.timezone(
                source.item ->> 'timeZone',
                (source.item ->> 'date')::timestamptz
              )::date
          )
      ) THEN
        RAISE EXCEPTION 'Journal backup local time metadata is inconsistent'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
        GROUP BY (source.item ->> 'id')::bigint
        HAVING pg_catalog.count(*) > 1
      ) THEN
        RAISE EXCEPTION 'Journal backup contains duplicate ids'
          USING ERRCODE = '22023';
      END IF;

      INSERT INTO public.user_log (
        user_id,
        id,
        ko,
        sentence,
        feedback,
        error_note,
        error_dimension,
        review_state,
        context_id,
        context_name,
        created_at,
        local_day,
        time_zone,
        utc_offset_minutes,
        activity_event_id,
        revision
      )
      SELECT
        v_user_id,
        (source.item ->> 'id')::bigint,
        source.item ->> 'ko',
        source.item ->> 'sentence',
        source.item ->> 'feedback',
        source.item ->> 'errorNote',
        source.item ->> 'errorDimension',
        source.item ->> 'reviewState',
        source.item ->> 'contextId',
        source.item ->> 'contextName',
        (source.item ->> 'date')::timestamptz,
        CASE
          WHEN source.item ->> 'localDay' IS NULL THEN NULL
          ELSE (source.item ->> 'localDay')::date
        END,
        source.item ->> 'timeZone',
        CASE
          WHEN source.item ->> 'utcOffsetMinutes' IS NULL THEN NULL
          ELSE (source.item ->> 'utcOffsetMinutes')::smallint
        END,
        CASE
          WHEN source.item ->> 'activityEventId' IS NULL THEN NULL
          ELSE (source.item ->> 'activityEventId')::uuid
        END,
        v_restore_revision
      FROM pg_catalog.jsonb_array_elements(v_value) AS source(item)
      ORDER BY (source.item ->> 'id')::bigint;
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.srs' THEN
    DELETE FROM public.user_progress AS progress
    WHERE progress.user_id = v_user_id;

    v_value := p_data -> 'munbeop.v1.srs';
    IF v_value <> 'null'::jsonb THEN
      IF pg_catalog.jsonb_typeof(v_value) <> 'object' THEN
        RAISE EXCEPTION 'SRS backup must be an object'
          USING ERRCODE = '22023';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_each(v_value) AS source(ko, state)
        WHERE pg_catalog.btrim(source.ko) = ''
          OR pg_catalog.jsonb_typeof(source.state) <> 'object'
          OR NOT (
            source.state ?& ARRAY[
              'lastSeen',
              'easyCount',
              'hardCount',
              'mastery'
            ]::text[]
          )
          OR pg_catalog.jsonb_typeof(source.state -> 'lastSeen') NOT IN ('number', 'null')
          OR pg_catalog.jsonb_typeof(source.state -> 'easyCount') <> 'number'
          OR (source.state ->> 'easyCount') !~ '^[0-9]+$'
          OR pg_catalog.jsonb_typeof(source.state -> 'hardCount') <> 'number'
          OR (source.state ->> 'hardCount') !~ '^[0-9]+$'
          OR pg_catalog.jsonb_typeof(source.state -> 'mastery') <> 'string'
          OR (source.state ->> 'mastery') NOT IN ('seedling', 'plant', 'tree')
      ) THEN
        RAISE EXCEPTION 'SRS backup entry has an invalid shape or value'
          USING ERRCODE = '22023';
      END IF;

      BEGIN
        PERFORM
          CASE
            WHEN source.state -> 'lastSeen' = 'null'::jsonb THEN NULL
            ELSE (source.state ->> 'lastSeen')::double precision
          END,
          CASE
            WHEN source.state -> 'lastSeen' = 'null'::jsonb
              OR (source.state ->> 'lastSeen')::double precision = 0
              THEN NULL
            ELSE pg_catalog.to_timestamp(
              (source.state ->> 'lastSeen')::double precision / 1000
            )
          END,
          (source.state ->> 'easyCount')::integer,
          (source.state ->> 'hardCount')::integer
        FROM pg_catalog.jsonb_each(v_value) AS source(ko, state);
      EXCEPTION
        WHEN invalid_text_representation
          OR numeric_value_out_of_range
          OR datetime_field_overflow
        THEN
          RAISE EXCEPTION 'SRS backup contains an invalid numeric value'
            USING ERRCODE = '22023';
      END;

      IF EXISTS (
        SELECT 1
        FROM pg_catalog.jsonb_each(v_value) AS source(ko, state)
        WHERE source.state -> 'lastSeen' <> 'null'::jsonb
          AND (source.state ->> 'lastSeen')::double precision <> 0
          AND NOT pg_catalog.isfinite(
            pg_catalog.to_timestamp(
              (source.state ->> 'lastSeen')::double precision / 1000
            )
          )
      ) THEN
        RAISE EXCEPTION 'SRS backup lastSeen must be finite'
          USING ERRCODE = '22023';
      END IF;

      INSERT INTO public.user_progress (
        user_id,
        ko,
        last_seen,
        easy_count,
        hard_count,
        mastery,
        updated_at,
        revision
      )
      SELECT
        v_user_id,
        source.ko,
        CASE
          WHEN source.state -> 'lastSeen' = 'null'::jsonb
            OR (source.state ->> 'lastSeen')::double precision = 0
            THEN NULL
          ELSE pg_catalog.to_timestamp(
            (source.state ->> 'lastSeen')::double precision / 1000
          )
        END,
        0,
        0,
        'seedling',
        pg_catalog.now(),
        v_restore_revision
      FROM pg_catalog.jsonb_each(v_value) AS source(ko, state)
      ORDER BY source.ko;
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.log' OR p_data ? 'munbeop.v1.srs' THEN
    SELECT COALESCE(
      pg_catalog.array_agg(affected.ko ORDER BY affected.ko),
      ARRAY[]::text[]
    )
    INTO v_affected_kos
    FROM (
      SELECT prior.ko
      FROM pg_catalog.unnest(v_affected_kos) AS prior(ko)
      UNION
      SELECT journal.ko
      FROM public.user_log AS journal
      WHERE journal.user_id = v_user_id
      UNION
      SELECT progress.ko
      FROM public.user_progress AS progress
      WHERE progress.user_id = v_user_id
    ) AS affected;

    FOREACH v_ko IN ARRAY v_affected_kos LOOP
      PERFORM public.recalculate_user_progress_v2(v_user_id, v_ko);
    END LOOP;
  END IF;

  RETURN true;
END;
$$;

-- Backward-compatible signature for already-deployed clients. It cannot skip
-- the account lock or recreate revision 0 rows anymore.
CREATE OR REPLACE FUNCTION public.restore_user_backup(p_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
BEGIN
  RETURN public.restore_user_backup_v2(v_user_id, p_data);
END;
$$;

-- Public functions are private-by-default in this project. Expose each v2 RPC
-- to signed-in callers only; SECURITY INVOKER keeps existing RLS authoritative.
REVOKE ALL PRIVILEGES ON FUNCTION public.recalculate_user_progress_v2(uuid, text)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.mark_user_progress_seen_v2(uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.save_user_log_entry_v2(uuid, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.set_user_log_review_v2(uuid, bigint, text, text, bigint)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.delete_user_log_entry_v2(uuid, bigint, text, bigint)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.restore_user_backup_v2(uuid, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON FUNCTION public.restore_user_backup(jsonb)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.recalculate_user_progress_v2(uuid, text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_user_progress_seen_v2(uuid, text, timestamptz)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_user_log_entry_v2(uuid, jsonb)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_log_review_v2(uuid, bigint, text, text, bigint)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_log_entry_v2(uuid, bigint, text, bigint)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_user_backup_v2(uuid, jsonb)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_user_backup(jsonb)
  TO authenticated;
