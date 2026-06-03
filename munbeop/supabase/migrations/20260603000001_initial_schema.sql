-- 20260603000001_initial_schema.sql
-- Plan 2, Task P2.3 — Munbeop Garden v3 schema
--
-- Conventions:
--   * `text` instead of varchar (Postgres recommendation)
--   * `timestamptz with default now()` for created_at / updated_at
--   * `jsonb` columns hold LocalizedString objects (the 8-locale Record from app/lib/domain/i18n.ts)
--   * Catalog tables (`grammars`, `contexts`) are globally shared, no user_id
--   * `user_*` tables FK to auth.users(id) with ON DELETE CASCADE
--
-- RLS is added in 20260603000002_rls_policies.sql.
-- Catalog is seeded in 20260603000003_seed_catalog.sql.

-- =====================================================================
-- Catalog: globally-shared grammars
-- =====================================================================
CREATE TABLE public.grammars (
  id           bigserial   PRIMARY KEY,
  ko           text        NOT NULL UNIQUE,
  meaning      jsonb       NOT NULL,           -- LocalizedString { en, es, fr, pt-BR, th, id, vi, ja }
  example      text,                            -- Korean, not translated
  trans        jsonb,                           -- LocalizedString
  deck_id      text        NOT NULL DEFAULT 'general',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- Catalog: globally-shared contexts
-- =====================================================================
CREATE TABLE public.contexts (
  id           text        PRIMARY KEY,         -- 'banmal', 'jondaetmal', ...
  name         text        NOT NULL,            -- Korean label, not translated
  scene        jsonb       NOT NULL,            -- LocalizedString
  category     text        NOT NULL CHECK (category IN ('formalidad', 'situacional')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- User data: SRS state per (user, grammar)
-- =====================================================================
CREATE TABLE public.user_progress (
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ko              text        NOT NULL,
  last_seen       timestamptz,
  easy_count      integer     NOT NULL DEFAULT 0,
  hard_count      integer     NOT NULL DEFAULT 0,
  mastery         text        NOT NULL DEFAULT 'seedling'
                              CHECK (mastery IN ('seedling', 'plant', 'tree')),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ko)
);

CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- =====================================================================
-- User data: log entries (sentences the user wrote)
-- =====================================================================
CREATE TABLE public.user_log (
  id              bigserial   PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ko              text        NOT NULL,
  sentence        text        NOT NULL,
  feedback        text        NOT NULL CHECK (feedback IN ('easy', 'hard')),
  error_note      text,
  review_state    text        NOT NULL DEFAULT 'unreviewed'
                              CHECK (review_state IN ('unreviewed', 'correct', 'incorrect')),
  context_id      text        NOT NULL,
  context_name    text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_log_user_date ON public.user_log(user_id, created_at DESC);
CREATE INDEX idx_user_log_user_ko   ON public.user_log(user_id, ko);

-- =====================================================================
-- User data: decks owned by the user
-- =====================================================================
CREATE TABLE public.user_decks (
  id              text        NOT NULL,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  color_id        text        NOT NULL DEFAULT 'indigo',
  position        integer     NOT NULL DEFAULT 0,
  collapsed       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- =====================================================================
-- User data: user-created custom grammars (kept separate from catalog)
-- =====================================================================
CREATE TABLE public.user_custom_grammars (
  id              bigserial   PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ko              text        NOT NULL,
  meaning         jsonb       NOT NULL,
  example         text,
  trans           jsonb,
  deck_id         text        NOT NULL DEFAULT 'general',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ko)
);

-- =====================================================================
-- User data: user-created custom contexts
-- =====================================================================
CREATE TABLE public.user_custom_contexts (
  id              text        NOT NULL,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  scene           jsonb       NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- =====================================================================
-- User data: which built-in / custom contexts the user has disabled
-- =====================================================================
CREATE TABLE public.user_inactive_contexts (
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_id      text        NOT NULL,
  PRIMARY KEY (user_id, context_id)
);
