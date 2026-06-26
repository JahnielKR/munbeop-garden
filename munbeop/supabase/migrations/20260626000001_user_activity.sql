-- Per-user, per-local-day study activity tally. One row per (user, day);
-- count is incremented (upserted) once per study answer across all modes.
-- Powers the activity heatmap and the current/longest streak. The `day` is the
-- user's LOCAL calendar day (YYYY-MM-DD), computed client-side at record time.
CREATE TABLE public.user_activity (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day        date        NOT NULL,
  count      integer     NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

CREATE INDEX idx_user_activity_user_day ON public.user_activity(user_id, day);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_activity_owner_all" ON public.user_activity
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
