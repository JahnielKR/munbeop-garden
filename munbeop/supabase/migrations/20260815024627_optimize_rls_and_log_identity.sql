-- Cache auth.uid() once per statement instead of evaluating it for every row.
-- This preserves the existing owner-only authorization model while resolving
-- Supabase's auth_rls_initplan advisor warnings.

alter policy "user_progress_owner_select" on public.user_progress
  using ((select auth.uid()) = user_id);
alter policy "user_progress_owner_insert" on public.user_progress
  with check ((select auth.uid()) = user_id);
alter policy "user_progress_owner_update" on public.user_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_progress_owner_delete" on public.user_progress
  using ((select auth.uid()) = user_id);

alter policy "user_log_owner_select" on public.user_log
  using ((select auth.uid()) = user_id);
alter policy "user_log_owner_insert" on public.user_log
  with check ((select auth.uid()) = user_id);
alter policy "user_log_owner_update" on public.user_log
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_log_owner_delete" on public.user_log
  using ((select auth.uid()) = user_id);

alter policy "user_decks_owner_select" on public.user_decks
  using ((select auth.uid()) = user_id);
alter policy "user_decks_owner_insert" on public.user_decks
  with check ((select auth.uid()) = user_id);
alter policy "user_decks_owner_update" on public.user_decks
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_decks_owner_delete" on public.user_decks
  using ((select auth.uid()) = user_id);

alter policy "user_custom_grammars_owner_all" on public.user_custom_grammars
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "user_custom_contexts_owner_all" on public.user_custom_contexts
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "user_inactive_contexts_owner_all" on public.user_inactive_contexts
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "user_settings_owner_select" on public.user_settings
  using ((select auth.uid()) = user_id);
alter policy "user_settings_owner_insert" on public.user_settings
  with check ((select auth.uid()) = user_id);
alter policy "user_settings_owner_update" on public.user_settings
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_settings_owner_delete" on public.user_settings
  using ((select auth.uid()) = user_id);

alter policy "user_escape_room_owner_select" on public.user_escape_room
  using ((select auth.uid()) = user_id);
alter policy "user_escape_room_owner_insert" on public.user_escape_room
  with check ((select auth.uid()) = user_id);
alter policy "user_escape_room_owner_update" on public.user_escape_room
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_escape_room_owner_delete" on public.user_escape_room
  using ((select auth.uid()) = user_id);

alter policy "user_custom_decks_owner_select" on public.user_custom_decks
  using ((select auth.uid()) = user_id);
alter policy "user_custom_decks_owner_insert" on public.user_custom_decks
  with check ((select auth.uid()) = user_id);
alter policy "user_custom_decks_owner_update" on public.user_custom_decks
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "user_custom_decks_owner_delete" on public.user_custom_decks
  using ((select auth.uid()) = user_id);

alter policy "user_activity_owner_all" on public.user_activity
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Journal ids are generated client-side so offline/optimistic rows can be
-- addressed immediately. They only need to be unique inside one account; the
-- prior global primary key made simultaneous ids from different users collide.
alter table public.user_log drop constraint user_log_pkey;
alter table public.user_log
  add constraint user_log_pkey primary key (user_id, id);
