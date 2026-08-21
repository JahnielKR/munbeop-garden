-- Cache auth.uid() once per statement instead of evaluating it for every row.
-- This preserves the existing owner-only authorization model while resolving
-- Supabase's auth_rls_initplan advisor warnings.

ALTER POLICY "user_progress_owner_select" ON public.user_progress
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_progress_owner_insert" ON public.user_progress
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_progress_owner_update" ON public.user_progress
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_progress_owner_delete" ON public.user_progress
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_log_owner_select" ON public.user_log
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_log_owner_insert" ON public.user_log
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_log_owner_update" ON public.user_log
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_log_owner_delete" ON public.user_log
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_decks_owner_select" ON public.user_decks
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_decks_owner_insert" ON public.user_decks
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_decks_owner_update" ON public.user_decks
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_decks_owner_delete" ON public.user_decks
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_custom_grammars_owner_all" ON public.user_custom_grammars
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_custom_contexts_owner_all" ON public.user_custom_contexts
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_inactive_contexts_owner_all" ON public.user_inactive_contexts
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_settings_owner_select" ON public.user_settings
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_settings_owner_insert" ON public.user_settings
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_settings_owner_update" ON public.user_settings
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_settings_owner_delete" ON public.user_settings
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_escape_room_owner_select" ON public.user_escape_room
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_escape_room_owner_insert" ON public.user_escape_room
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_escape_room_owner_update" ON public.user_escape_room
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_escape_room_owner_delete" ON public.user_escape_room
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_custom_decks_owner_select" ON public.user_custom_decks
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_custom_decks_owner_insert" ON public.user_custom_decks
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_custom_decks_owner_update" ON public.user_custom_decks
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "user_custom_decks_owner_delete" ON public.user_custom_decks
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "user_activity_owner_all" ON public.user_activity
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Journal ids only need to be unique inside one account.
ALTER TABLE public.user_log DROP CONSTRAINT user_log_pkey;
ALTER TABLE public.user_log
  ADD CONSTRAINT user_log_pkey PRIMARY KEY (user_id, id);
