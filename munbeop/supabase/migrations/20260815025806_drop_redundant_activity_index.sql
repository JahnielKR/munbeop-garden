-- user_activity_pkey already indexes (user_id, day) in this exact order.
-- Keeping a second identical btree only adds write and vacuum overhead.
drop index if exists public.idx_user_activity_user_day;
