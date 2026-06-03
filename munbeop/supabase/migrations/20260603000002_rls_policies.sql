-- 20260603000002_rls_policies.sql
-- Plan 2, Task P2.4 — Row Level Security for all 8 tables
--
-- Catalog (`grammars`, `contexts`):
--   * SELECT is open to authenticated AND anon roles (read-only public).
--   * No INSERT/UPDATE/DELETE policies are defined, so non-service-role
--     callers are blocked from writing. Service role (server-side, used
--     by SQL migrations and admin tooling) bypasses RLS entirely.
--
-- User data (the 6 `user_*` tables):
--   * Every operation requires auth.uid() = user_id.
--   * Tables with the same access pattern for SELECT/INSERT/UPDATE/DELETE
--     use a single FOR ALL policy. Tables where we want to keep ops
--     distinct (for clarity / future per-op tuning) get four separate
--     policies.

-- =====================================================================
-- Catalog: public read, no client writes
-- =====================================================================
ALTER TABLE public.grammars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grammars_read_all" ON public.grammars
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "contexts_read_all" ON public.contexts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================================
-- user_progress
-- =====================================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_owner_select" ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_insert" ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_update" ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_delete" ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================================
-- user_log
-- =====================================================================
ALTER TABLE public.user_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_log_owner_select" ON public.user_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_log_owner_insert" ON public.user_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_log_owner_update" ON public.user_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_log_owner_delete" ON public.user_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================================
-- user_decks
-- =====================================================================
ALTER TABLE public.user_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_decks_owner_select" ON public.user_decks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_insert" ON public.user_decks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_update" ON public.user_decks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_delete" ON public.user_decks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================================
-- user_custom_grammars (same pattern across all ops → single FOR ALL policy)
-- =====================================================================
ALTER TABLE public.user_custom_grammars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_grammars_owner_all" ON public.user_custom_grammars
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- user_custom_contexts
-- =====================================================================
ALTER TABLE public.user_custom_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_contexts_owner_all" ON public.user_custom_contexts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- user_inactive_contexts
-- =====================================================================
ALTER TABLE public.user_inactive_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_inactive_contexts_owner_all" ON public.user_inactive_contexts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
