CREATE TABLE public.user_custom_decks (
  id          text        NOT NULL,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  color_id    text        NOT NULL DEFAULT 'sky',
  icon        text        NOT NULL DEFAULT 'deck-star',
  image_url   text,
  grammar_kos jsonb       NOT NULL DEFAULT '[]'::jsonb,
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE public.user_custom_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_decks_owner_select" ON public.user_custom_decks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_insert" ON public.user_custom_decks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_update" ON public.user_custom_decks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_delete" ON public.user_custom_decks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
