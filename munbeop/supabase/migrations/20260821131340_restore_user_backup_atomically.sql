-- Restore every requested backup collection in one PostgreSQL transaction.
-- Missing keys are left untouched; JSON null clears a key. SECURITY INVOKER
-- means the existing per-user RLS policies remain the authorization boundary.
CREATE OR REPLACE FUNCTION public.restore_user_backup(p_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := (SELECT auth.uid());
  v_value jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' THEN
    RAISE EXCEPTION 'Backup data must be a JSON object'
      USING ERRCODE = '22023';
  END IF;

  -- The grammar export contains the shared catalog plus user-authored rows.
  -- Restore only the custom deck and reject old polluted catalog duplicates.
  IF p_data ? 'munbeop.v1.grammar' THEN
    DELETE FROM public.user_custom_grammars WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.grammar';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Grammar backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_custom_grammars (
        user_id, ko, meaning, example, trans, deck_id
      )
      SELECT
        v_user_id,
        item ->> 'ko',
        item -> 'meaning',
        item ->> 'example',
        item -> 'trans',
        'custom'
      FROM jsonb_array_elements(v_value) AS source(item)
      WHERE item ->> 'deckId' = 'custom'
        AND NOT EXISTS (
          SELECT 1 FROM public.grammars WHERE ko = item ->> 'ko'
        );
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.srs' THEN
    DELETE FROM public.user_progress WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.srs';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'object' THEN
        RAISE EXCEPTION 'SRS backup must be an object' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_progress (
        user_id, ko, last_seen, easy_count, hard_count, mastery, updated_at
      )
      SELECT
        v_user_id,
        source.ko,
        CASE
          WHEN state -> 'lastSeen' IS NULL
            OR state -> 'lastSeen' = 'null'::jsonb
            OR (state ->> 'lastSeen')::double precision = 0
            THEN NULL
          ELSE to_timestamp((state ->> 'lastSeen')::double precision / 1000)
        END,
        (state ->> 'easyCount')::integer,
        (state ->> 'hardCount')::integer,
        state ->> 'mastery',
        now()
      FROM jsonb_each(v_value) AS source(ko, state);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.log' THEN
    DELETE FROM public.user_log WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.log';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Journal backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_log (
        user_id,
        ko,
        sentence,
        feedback,
        error_note,
        error_dimension,
        review_state,
        context_id,
        context_name,
        created_at
      )
      SELECT
        v_user_id,
        item ->> 'ko',
        item ->> 'sentence',
        item ->> 'feedback',
        item ->> 'errorNote',
        item ->> 'errorDimension',
        item ->> 'reviewState',
        item ->> 'contextId',
        item ->> 'contextName',
        (item ->> 'date')::timestamptz
      FROM jsonb_array_elements(v_value) AS source(item);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.decks' THEN
    DELETE FROM public.user_decks WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.decks';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Deck backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_decks (
        user_id, id, name, color_id, position, collapsed
      )
      SELECT
        v_user_id,
        item ->> 'id',
        item ->> 'name',
        item ->> 'colorId',
        (item ->> 'order')::integer,
        (item ->> 'collapsed')::boolean
      FROM jsonb_array_elements(v_value) AS source(item);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.customDecks' THEN
    DELETE FROM public.user_custom_decks WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.customDecks';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Custom deck backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_custom_decks (
        user_id,
        id,
        name,
        color_id,
        icon,
        image_url,
        grammar_kos,
        position,
        created_at
      )
      SELECT
        v_user_id,
        item ->> 'id',
        item ->> 'name',
        item ->> 'colorId',
        item ->> 'icon',
        item ->> 'imageUrl',
        item -> 'grammarKos',
        (item ->> 'order')::integer,
        (item ->> 'createdAt')::timestamptz
      FROM jsonb_array_elements(v_value) AS source(item);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.customContexts' THEN
    DELETE FROM public.user_custom_contexts WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.customContexts';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Custom context backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_custom_contexts (user_id, id, name, scene)
      SELECT
        v_user_id,
        item ->> 'id',
        item ->> 'name',
        item -> 'scene'
      FROM jsonb_array_elements(v_value) AS source(item);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.inactiveContextIds' THEN
    DELETE FROM public.user_inactive_contexts WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.inactiveContextIds';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'array' THEN
        RAISE EXCEPTION 'Inactive contexts backup must be an array' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_inactive_contexts (user_id, context_id)
      SELECT v_user_id, context_id
      FROM jsonb_array_elements_text(v_value) AS source(context_id);
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.settings' THEN
    DELETE FROM public.user_settings WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.settings';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'object' THEN
        RAISE EXCEPTION 'Settings backup must be an object' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_settings (user_id, prefs, updated_at)
      VALUES (v_user_id, v_value, now());
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.escapeRoom' THEN
    DELETE FROM public.user_escape_room WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.escapeRoom';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'object' THEN
        RAISE EXCEPTION 'Escape room backup must be an object' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_escape_room (user_id, progress, updated_at)
      VALUES (v_user_id, v_value, now());
    END IF;
  END IF;

  IF p_data ? 'munbeop.v1.activity' THEN
    DELETE FROM public.user_activity WHERE user_id = v_user_id;
    v_value := p_data -> 'munbeop.v1.activity';
    IF v_value <> 'null'::jsonb THEN
      IF jsonb_typeof(v_value) <> 'object' THEN
        RAISE EXCEPTION 'Activity backup must be an object' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.user_activity (user_id, day, count, updated_at)
      SELECT
        v_user_id,
        source.day::date,
        (activity ->> 'count')::integer,
        now()
      FROM jsonb_each(v_value) AS source(day, activity);
    END IF;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.restore_user_backup(jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_user_backup(jsonb)
  TO authenticated;
