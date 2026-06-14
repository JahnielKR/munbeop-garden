-- 20260614000001_user_settings.sql
-- Account-synced UI preferences (theme, locale, and future prefs) as a
-- jsonb blob, one row per user. RLS mirrors the per-owner pattern used by
-- the six existing user_* tables (see 20260603000002_rls_policies.sql).

CREATE TABLE public.user_settings (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prefs      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_owner_select" ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_insert" ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_update" ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_delete" ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
