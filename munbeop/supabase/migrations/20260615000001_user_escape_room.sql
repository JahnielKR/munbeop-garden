-- 20260615000001_user_escape_room.sql
-- Escape-room cross-run progress (unlocked cosmetics + consecutive clean runs)
-- as a jsonb blob, one row per user. Mirrors the user_settings shape and the
-- per-owner RLS used by every other user_* table (see
-- 20260603000002_rls_policies.sql and 20260614000001_user_settings.sql).

CREATE TABLE public.user_escape_room (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress   jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_escape_room ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_escape_room_owner_select" ON public.user_escape_room
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_escape_room_owner_insert" ON public.user_escape_room
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_escape_room_owner_update" ON public.user_escape_room
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_escape_room_owner_delete" ON public.user_escape_room
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
