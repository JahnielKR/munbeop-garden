-- Increment a learner's local-day activity without a read/overwrite race.
-- SECURITY INVOKER keeps the existing user_activity RLS policies authoritative.
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

  INSERT INTO public.user_activity (user_id, day, count, updated_at)
  VALUES (v_user_id, p_day, p_delta, now())
  ON CONFLICT (user_id, day) DO UPDATE
  SET count = public.user_activity.count + EXCLUDED.count,
      updated_at = now()
  RETURNING public.user_activity.count INTO v_count;

  RETURN v_count;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.increment_user_activity(date, integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_user_activity(date, integer)
  TO authenticated;
