-- Supabase stopped exposing newly-created public tables to the Data API by
-- default in 2026. Make this app's API surface explicit and reproducible.
-- Accounts are mandatory, so anonymous clients do not need catalog access.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

DROP POLICY IF EXISTS "grammars_read_all" ON public.grammars;
DROP POLICY IF EXISTS "contexts_read_all" ON public.contexts;

CREATE POLICY "grammars_read_all" ON public.grammars
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "contexts_read_all" ON public.contexts
  FOR SELECT TO authenticated
  USING (true);

REVOKE ALL PRIVILEGES ON TABLE
  public.grammars,
  public.contexts,
  public.user_progress,
  public.user_log,
  public.user_decks,
  public.user_custom_grammars,
  public.user_custom_contexts,
  public.user_inactive_contexts,
  public.user_settings,
  public.user_escape_room,
  public.user_custom_decks,
  public.user_activity
FROM anon, authenticated, service_role;

GRANT SELECT ON TABLE public.grammars, public.contexts TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.user_progress,
  public.user_log,
  public.user_decks,
  public.user_custom_grammars,
  public.user_custom_contexts,
  public.user_inactive_contexts,
  public.user_settings,
  public.user_escape_room,
  public.user_custom_decks,
  public.user_activity
TO authenticated, service_role;

-- Inserts that omit bigserial ids need sequence access in addition to table
-- INSERT. The browser now lets Postgres generate user_log ids.
REVOKE ALL PRIVILEGES ON SEQUENCE
  public.grammars_id_seq,
  public.user_log_id_seq,
  public.user_custom_grammars_id_seq
FROM anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE
  public.user_log_id_seq,
  public.user_custom_grammars_id_seq
TO authenticated, service_role;
