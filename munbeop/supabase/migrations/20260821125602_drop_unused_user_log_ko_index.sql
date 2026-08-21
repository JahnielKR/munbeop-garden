-- The application reads journal entries by (user_id, created_at) and mutates
-- individual rows by the (user_id, id) primary key. No query filters by ko,
-- so this index only adds write amplification and triggered the DB advisor.
DROP INDEX IF EXISTS public.idx_user_log_user_ko;
