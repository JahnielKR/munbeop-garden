-- Optional one-tap diagnostic tag for a struggled sentence. Nullable + additive
-- so existing rows and older clients are unaffected.
alter table public.user_log
  add column if not exists error_dimension text;
