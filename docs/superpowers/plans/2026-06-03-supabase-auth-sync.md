# Munbeop Garden — Plan 2: Supabase + Auth + Cloud Sync

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `LocalStorageAdapter` por un `SupabaseAdapter` autoswitching, agregar autenticación (sign-up, sign-in, magic-link, sign-out), persistir el progreso del usuario en Postgres con RLS, migrar automáticamente los datos del modo anónimo (localStorage) la primera vez que el usuario se autentica, y deployar el resultado a Vercel con env vars conectados.

**Architecture:** El `StorageAdapter` se hace asíncrono (`Promise<T>`). Dos implementaciones: `LocalStorageAdapter` (modo anónimo) y `SupabaseAdapter` (modo logueado). Un facade composable `useStorageAdapter()` elige cuál exponer según el estado de `useAuthStore()`. Al hacer login por primera vez con datos locales, se ejecuta `migrateLocalToSupabase()` una sola vez. Todos los stores Pinia se vuelven async en sus actions de `hydrate()` y mutaciones. Plan 3 (IA validadora) heredará todo este chasis para llamar Edge Functions con la sesión del usuario.

**Tech Stack:** `@supabase/supabase-js` 2.45+, Supabase CLI 1.190+, PostgreSQL 15, Row Level Security, Supabase Auth (email + magic-link), Vercel env vars, Nuxt 4 server middleware para hidratar el user en SSR.

---

## i18n nota

Los strings nuevos (auth UI, errores, banner de cuenta) se añaden a los 8 archivos `i18n/locales/*.json` siguiendo el patrón del Plan 1. Las claves nuevas van bajo `auth.*` y `sync.*`.

---

## Decisiones de diseño

1. **Catalog vs user data**: Las tablas `grammars` y `contexts` son catálogo público (read-only para clients). Las tablas `user_*` son privadas (RLS por `auth.uid()`).
2. **User-added grammars/contexts**: Cuando un user agrega una gramática o contexto custom, va a `user_custom_grammars` / `user_custom_contexts`, NO al catálogo público.
3. **Sync strategy**: Last-write-wins por timestamp en cada row. No conflict resolution avanzado en Plan 2 (Plan 4+ si surge).
4. **Anonymous mode**: Sigue funcionando con LocalStorageAdapter — Munbeop usable sin cuenta.
5. **Migration trigger**: Una sola vez, al primer sign-in que detecte datos en localStorage. Marca `auth.user.user_metadata.migrated_at` tras éxito.
6. **Locale**: Sigue en localStorage + cookie. NO se persiste en Supabase (es preferencia per-device).
7. **Async StorageAdapter**: Aceptamos el costo de tocar todos los stores. Sync interface sería incorrecto para Supabase.

---

## Scope & Non-Goals

### In scope (Plan 2)
- Async `StorageAdapter` interface
- `SupabaseAdapter` con tests mockeados
- Migrations SQL: tables + RLS + catalog seed
- Auth: email/password + magic-link + sign-out
- Auth store + composable + páginas `/auth/sign-in`, `/auth/callback`
- Account widget en sidebar
- Migración automática localStorage → Supabase
- Vercel env vars + production deploy

### Out of scope
- IA validadora (Plan 3)
- Modo Mazmorra (Plan 4)
- Mascota/Mapa/Cosméticos (Plans 5-7)
- Landing (Plan 8)
- Capacitor (Plan 9)
- Importer del backup JSON v2.22 (Plan 10 — separado de la migración localStorage→Supabase)
- OAuth (Google/Apple) — se puede añadir post-Plan 2 sin tocar arquitectura

---

## File Structure (locked-in)

```
munbeop/
├── supabase/                              # nueva carpeta (Supabase CLI standard)
│   ├── config.toml                        # init via supabase init
│   └── migrations/
│       ├── 20260603000001_initial_schema.sql      # tablas
│       ├── 20260603000002_rls_policies.sql        # RLS
│       └── 20260603000003_seed_catalog.sql        # grammars + contexts seed
├── app/
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── adapter.ts                # MOD: interface async
│   │   │   ├── localStorage.ts           # MOD: Promise-wrapped
│   │   │   ├── supabase.ts               # NEW: SupabaseAdapter
│   │   │   └── facade.ts                 # NEW: pickAdapter(authState)
│   │   ├── auth/
│   │   │   ├── client.ts                 # NEW: Supabase JS client singleton
│   │   │   ├── types.ts                  # NEW: AuthUser, AuthSession
│   │   │   └── migration.ts              # NEW: migrateLocalToSupabase()
│   │   └── domain/
│   │       └── grammar.ts                # MOD: add userId?: string for custom
│   ├── stores/
│   │   ├── auth.ts                       # NEW: user + session
│   │   ├── grammar.ts                    # MOD: hydrate async
│   │   ├── contexts.ts                   # MOD: hydrate async
│   │   ├── srs.ts                        # MOD: weightFor async-safe
│   │   ├── log.ts                        # MOD: add async
│   │   └── locale.ts                     # MOD: hydrate async (LS still)
│   ├── composables/
│   │   ├── useAuth.ts                    # NEW: signUp, signIn, magicLink, signOut
│   │   └── useStorageAdapter.ts          # NEW: returns active adapter
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── sign-in.vue               # NEW
│   │   │   └── callback.vue              # NEW (magic-link landing)
│   │   └── settings.vue                  # MOD: account section
│   ├── components/layout/
│   │   ├── AccountWidget.vue             # NEW: avatar/email + signOut button
│   │   └── AppSidebar.vue                # MOD: embed AccountWidget
│   ├── middleware/
│   │   └── auth-aware.global.ts          # NEW: redirect to /auth/sign-in for protected routes
│   ├── plugins/
│   │   ├── supabase.client.ts            # NEW: init client + restore session
│   │   └── i18n-persist.client.ts        # unchanged
│   └── server/
│       └── plugins/
│           └── supabase-ssr.ts           # NEW: read auth cookie on SSR
├── .env.example                          # NEW: SUPABASE_URL + SUPABASE_ANON_KEY
├── i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json   # MOD: add auth.* + sync.*
└── tests/unit/
    ├── storage/
    │   ├── supabase.test.ts              # NEW: mocked SupabaseAdapter
    │   └── facade.test.ts                # NEW: pickAdapter logic
    └── auth/
        └── migration.test.ts             # NEW: localStorage → mocked Supabase
```

---

## Prerequisites (one-time, USER ACTIONS)

Before starting Task 1, the developer / user must complete:

1. **Vercel project linked to repo** (Paso terminado en Plan 1 / mensaje previo). Confirmar que la URL preview de Plan 1 está viva.
2. **Supabase account** at https://supabase.com — free tier OK.
3. **Supabase CLI installed**:
   - Windows: `scoop install supabase` o descargar binario de https://github.com/supabase/cli/releases
   - Verify: `supabase --version` → ≥ 1.190.0

---

## Task 1: Add Supabase SDK + env infrastructure

**Files:**
- Modify: `munbeop/package.json` — add `@supabase/supabase-js`
- Create: `munbeop/.env.example`
- Modify: `munbeop/.gitignore` (already has `.env`, verify)
- Modify: `munbeop/nuxt.config.ts` — add `runtimeConfig` block

- [ ] **Step 1: Install Supabase SDK**

```bash
cd munbeop
pnpm add @supabase/supabase-js@^2.45.0
```

- [ ] **Step 2: Create `munbeop/.env.example`**

```bash
# Public — exposed to client bundle
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Private — server-only (used by SSR plugin and migrations)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- [ ] **Step 3: Modify `munbeop/nuxt.config.ts`** — add `runtimeConfig` after `modules`:

```typescript
  runtimeConfig: {
    supabaseServiceRoleKey: '', // overridden by SUPABASE_SERVICE_ROLE_KEY
    public: {
      supabaseUrl: '',           // overridden by NUXT_PUBLIC_SUPABASE_URL
      supabaseAnonKey: '',       // overridden by NUXT_PUBLIC_SUPABASE_ANON_KEY
    },
  },
```

- [ ] **Step 4: Verify `.gitignore`** at `munbeop/.gitignore` includes:

```
.env
.env.local
.env.*.local
```

(Plan 1 added these to root `.gitignore`. If `munbeop/.gitignore` doesn't repeat them, append.)

- [ ] **Step 5: Verify install**

```bash
cd munbeop
pnpm typecheck
```

Expected: 0 errors. The SDK is installed but not yet used.

- [ ] **Step 6: Commit**

```bash
git add munbeop/package.json munbeop/pnpm-lock.yaml munbeop/.env.example munbeop/nuxt.config.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "chore(supabase): add @supabase/supabase-js + runtimeConfig + .env.example [Task 1]"
git push
```

---

## Task 2: USER ACTION — Create Supabase project + provide credentials

**This task requires the user / developer to act outside the codebase.**

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `munbeop-garden-v3`
4. Database password: generate strong, save in password manager
5. Region: closest to target users (e.g., `us-east-1` for Americas, `ap-southeast-1` for SE Asia)
6. Pricing plan: Free tier

Wait ~2 min for provisioning.

- [ ] **Step 2: Collect credentials**

In Supabase Dashboard → Project Settings → API:

- **Project URL**: `https://<project-ref>.supabase.co`
- **Project API keys**:
  - `anon` `public` key (safe for browser) — long JWT
  - `service_role` `secret` key (server-only, NEVER browser) — long JWT

- [ ] **Step 3: Set local env vars**

Create `munbeop/.env` (already in .gitignore):

```bash
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 4: Initialize Supabase locally**

```bash
cd munbeop
supabase init
```

When prompted:
- `Generate VS Code settings`: N
- `Generate IntelliJ Run Configurations`: N

Verify a `supabase/` folder is created with `config.toml`.

- [ ] **Step 5: Link to remote project**

```bash
cd munbeop
supabase link --project-ref <project-ref>
```

Enter the database password when prompted. Confirm linked.

- [ ] **Step 6: Set Vercel env vars**

In Vercel dashboard → Project Settings → Environment Variables, add:

| Name | Value | Environment |
|---|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview, Development |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key>` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service-role-key>` | Production, Preview (NOT Development) |

Click "Save".

- [ ] **Step 7: Verify by importing the client locally**

```bash
cd munbeop
node -e "const c = require('@supabase/supabase-js').createClient(process.env.NUXT_PUBLIC_SUPABASE_URL || '', process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''); console.log(c ? 'client created' : 'no client')"
```

If you sourced your `.env` (or have it loaded), expect `client created`. If empty, just confirms the SDK loads.

- [ ] **Step 8: Confirm Task 2 done**

No commit (no code changes). User confirms credentials are in place via reply to controller.

---

## Task 3: SQL migration 001 — tables

**Files:**
- Create: `munbeop/supabase/migrations/20260603000001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- 20260603000001_initial_schema.sql
-- Tables for Munbeop Garden v3
-- Conventions:
--  - text instead of varchar (Postgres recommendation)
--  - timestamptz with default now() for created_at/updated_at
--  - JSON columns for LocalizedString (Plan 1 type)

-- Catalog: globally-shared grammars
CREATE TABLE public.grammars (
  id           bigserial PRIMARY KEY,
  ko           text        NOT NULL UNIQUE,
  meaning      jsonb       NOT NULL,  -- LocalizedString { en, es, fr, pt-BR, th, id, vi, ja }
  example      text,                  -- Korean, not translated
  trans        jsonb,                 -- LocalizedString
  deck_id      text        NOT NULL DEFAULT 'general',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Catalog: globally-shared contexts
CREATE TABLE public.contexts (
  id           text        PRIMARY KEY,            -- 'banmal', 'jondaetmal', etc.
  name         text        NOT NULL,                -- Korean label, not translated
  scene        jsonb       NOT NULL,                -- LocalizedString
  category     text        NOT NULL CHECK (category IN ('formalidad','situacional')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- User data: SRS state per (user, grammar)
CREATE TABLE public.user_progress (
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ko              text        NOT NULL,
  last_seen       timestamptz,
  easy_count      integer     NOT NULL DEFAULT 0,
  hard_count      integer     NOT NULL DEFAULT 0,
  mastery         text        NOT NULL DEFAULT 'seedling'
                              CHECK (mastery IN ('seedling','plant','tree')),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, ko)
);

CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- User data: log entries (sentences written)
CREATE TABLE public.user_log (
  id              bigserial   PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ko              text        NOT NULL,
  sentence        text        NOT NULL,
  feedback        text        NOT NULL CHECK (feedback IN ('easy','hard')),
  error_note      text,
  review_state    text        NOT NULL DEFAULT 'unreviewed'
                              CHECK (review_state IN ('unreviewed','correct','incorrect')),
  context_id      text        NOT NULL,
  context_name    text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_log_user_date ON public.user_log(user_id, created_at DESC);
CREATE INDEX idx_user_log_user_ko ON public.user_log(user_id, ko);

-- User data: decks owned by the user
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

-- User data: user-created custom grammars (not in catalog)
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

-- User data: user-created custom contexts (not in catalog)
CREATE TABLE public.user_custom_contexts (
  id              text        NOT NULL,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  scene           jsonb       NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- User data: which contexts the user has disabled
CREATE TABLE public.user_inactive_contexts (
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_id      text        NOT NULL,
  PRIMARY KEY (user_id, context_id)
);
```

- [ ] **Step 2: Apply locally to remote**

```bash
cd munbeop
supabase db push
```

When prompted, confirm. Expected: `Applied migration 20260603000001_initial_schema.sql`.

If you prefer Supabase Studio: copy the SQL → SQL Editor → Run.

- [ ] **Step 3: Verify tables**

In Supabase Studio → Table Editor: see 7 new tables (`grammars`, `contexts`, `user_progress`, `user_log`, `user_decks`, `user_custom_grammars`, `user_custom_contexts`, `user_inactive_contexts`).

- [ ] **Step 4: Commit**

```bash
git add munbeop/supabase/
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(db): initial schema — 8 tables for catalog + user data [Task 3]"
git push
```

---

## Task 4: SQL migration 002 — RLS policies

**Files:**
- Create: `munbeop/supabase/migrations/20260603000002_rls_policies.sql`

- [ ] **Step 1: Create the RLS migration**

```sql
-- 20260603000002_rls_policies.sql
-- Row Level Security: catalog is read-only public; user_* is owner-only.

-- ====== Catalog: public read, no client writes ======
ALTER TABLE public.grammars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grammars_read_all" ON public.grammars
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "contexts_read_all" ON public.contexts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- No INSERT/UPDATE/DELETE policy → blocked for non-service-role.

-- ====== user_progress ======
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_owner_select" ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_insert" ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_update" ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_owner_delete" ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ====== user_log ======
ALTER TABLE public.user_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_log_owner_select" ON public.user_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_log_owner_insert" ON public.user_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_log_owner_update" ON public.user_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_log_owner_delete" ON public.user_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ====== user_decks ======
ALTER TABLE public.user_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_decks_owner_select" ON public.user_decks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_insert" ON public.user_decks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_update" ON public.user_decks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_decks_owner_delete" ON public.user_decks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ====== user_custom_grammars ======
ALTER TABLE public.user_custom_grammars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_grammars_owner_all" ON public.user_custom_grammars
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====== user_custom_contexts ======
ALTER TABLE public.user_custom_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_contexts_owner_all" ON public.user_custom_contexts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====== user_inactive_contexts ======
ALTER TABLE public.user_inactive_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_inactive_contexts_owner_all" ON public.user_inactive_contexts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Apply**

```bash
cd munbeop
supabase db push
```

- [ ] **Step 3: Verify RLS enabled**

In Supabase Studio → Authentication → Policies: should see policies for all 7 user tables and the 2 catalog tables.

- [ ] **Step 4: Sanity test from `anon`**

In Supabase Studio → SQL Editor, run:

```sql
SET ROLE anon;
SELECT count(*) FROM public.grammars;
-- Should succeed (catalog reads OK).

SELECT count(*) FROM public.user_log;
-- Should return 0 (RLS filters all rows because no auth.uid()).

INSERT INTO public.user_log (user_id, ko, sentence, feedback, context_id, context_name)
  VALUES ('00000000-0000-0000-0000-000000000000', 'x', 'y', 'easy', 'banmal', '반말');
-- Should ERROR with "new row violates row-level security policy".
RESET ROLE;
```

Confirm the error message.

- [ ] **Step 5: Commit**

```bash
git add munbeop/supabase/migrations/20260603000002_rls_policies.sql
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(db): enable RLS — catalog readable by all, user_* owner-only [Task 4]"
git push
```

---

## Task 5: SQL migration 003 — seed catalog from Plan 1

**Files:**
- Create: `munbeop/supabase/migrations/20260603000003_seed_catalog.sql`
- Note: the seed data mirrors `app/seed/grammars.ts` and `app/seed/contexts.ts`. Source of truth for v2 onwards is the DB.

- [ ] **Step 1: Create the seed migration**

```sql
-- 20260603000003_seed_catalog.sql
-- Idempotent seed: INSERT ... ON CONFLICT DO NOTHING.

INSERT INTO public.grammars (ko, meaning, example, trans, deck_id) VALUES
('에서/부터~까지',
 '{"en":"from...to (place/time)","es":"desde...hasta","fr":"de...à","pt-BR":"de...até","th":"จาก...ถึง","id":"dari...sampai","vi":"từ...đến","ja":"〜から〜まで"}',
 '9시부터 5시까지 일해요.',
 '{"en":"I work from 9 to 5.","es":"Trabajo de 9 a 5.","fr":"Je travaille de 9h à 17h.","pt-BR":"Trabalho das 9 às 5.","th":"ฉันทำงานตั้งแต่ 9 โมงถึง 5 โมง","id":"Saya bekerja dari jam 9 sampai jam 5.","vi":"Tôi làm việc từ 9 giờ đến 5 giờ.","ja":"9時から5時まで働きます。"}',
 'general'),
('-(으)면',
 '{"en":"if / when (conditional)","es":"si / cuando (condicional)","fr":"si / quand (conditionnel)","pt-BR":"se / quando (condicional)","th":"ถ้า / เมื่อ","id":"jika / kalau","vi":"nếu / khi","ja":"もし〜たら / 〜ば"}',
 '시간이 있으면 같이 가요.',
 '{"en":"If you have time, let''s go together.","es":"Si tienes tiempo, vamos juntos.","fr":"Si tu as le temps, allons-y ensemble.","pt-BR":"Se tiver tempo, vamos juntos.","th":"ถ้ามีเวลา ไปด้วยกันนะ","id":"Kalau ada waktu, ayo pergi bersama.","vi":"Nếu có thời gian, đi cùng nhau nhé.","ja":"時間があれば一緒に行きましょう。"}',
 'general'),
('-(으)니까',
 '{"en":"because (allows imperative/suggestion)","es":"porque (permite imperativo)","fr":"parce que (permet l''impératif)","pt-BR":"porque (permite imperativo)","th":"เพราะ (ใช้กับคำสั่งได้)","id":"karena (boleh dengan perintah)","vi":"bởi vì (cho phép mệnh lệnh)","ja":"〜から/ので (命令OK)"}',
 '비가 오니까 우산을 가져가세요.',
 '{"en":"It''s raining, so take an umbrella.","es":"Como llueve, lleva paraguas.","fr":"Il pleut, alors prends un parapluie.","pt-BR":"Como está chovendo, leva guarda-chuva.","th":"ฝนตก เอาร่มไปด้วยนะ","id":"Karena hujan, bawa payung ya.","vi":"Vì trời mưa, hãy mang ô đi.","ja":"雨が降っているから傘を持って行ってください。"}',
 'general'),
('는/은',
 '{"en":"topic particle","es":"partícula de tema","fr":"particule de thème","pt-BR":"partícula de tópico","th":"อนุภาคหัวเรื่อง","id":"partikel topik","vi":"tiểu từ chủ đề","ja":"主題助詞「は」"}',
 '저는 학생이에요.',
 '{"en":"I am a student.","es":"Yo soy estudiante.","fr":"Je suis étudiant.","pt-BR":"Eu sou estudante.","th":"ฉันเป็นนักเรียน","id":"Saya seorang pelajar.","vi":"Tôi là học sinh.","ja":"私は学生です。"}',
 'general'),
('이/가',
 '{"en":"subject particle","es":"partícula de sujeto","fr":"particule de sujet","pt-BR":"partícula de sujeito","th":"อนุภาคประธาน","id":"partikel subjek","vi":"tiểu từ chủ ngữ","ja":"主語助詞「が」"}',
 '고양이가 귀여워요.',
 '{"en":"The cat is cute.","es":"El gato es lindo.","fr":"Le chat est mignon.","pt-BR":"O gato é fofo.","th":"แมวน่ารัก","id":"Kucingnya lucu.","vi":"Con mèo dễ thương.","ja":"猫がかわいいです。"}',
 'general'),
('을/를',
 '{"en":"object particle","es":"partícula de objeto","fr":"particule d''objet","pt-BR":"partícula de objeto","th":"อนุภาคกรรม","id":"partikel objek","vi":"tiểu từ tân ngữ","ja":"目的語助詞「を」"}',
 '책을 읽어요.',
 '{"en":"I read a book.","es":"Leo un libro.","fr":"Je lis un livre.","pt-BR":"Eu leio um livro.","th":"ฉันอ่านหนังสือ","id":"Saya membaca buku.","vi":"Tôi đọc sách.","ja":"本を読みます。"}',
 'general'),
('한테/한테서',
 '{"en":"to / from (person) — informal","es":"a / de (persona) — informal","fr":"à / de (personne) — informel","pt-BR":"para / de (pessoa) — informal","th":"ให้/จาก (คน) — ไม่ทางการ","id":"kepada / dari (orang) — informal","vi":"cho / từ (người) — không trang trọng","ja":"〜に/から (人・口語)"}',
 '친구한테 선물을 줬어요.',
 '{"en":"I gave a gift to my friend.","es":"Le di un regalo a mi amigo.","fr":"J''ai donné un cadeau à mon ami.","pt-BR":"Dei um presente para meu amigo.","th":"ฉันให้ของขวัญเพื่อน","id":"Saya memberi hadiah kepada teman.","vi":"Tôi đã tặng quà cho bạn.","ja":"友達にプレゼントをあげました。"}',
 'general'),
('-(으)러',
 '{"en":"in order to (purpose + motion verb)","es":"para (propósito + verbo de movimiento)","fr":"pour (but + verbe de mouvement)","pt-BR":"para (propósito + verbo de movimento)","th":"เพื่อ (กับกริยาเคลื่อนไหว)","id":"untuk (tujuan + verba gerak)","vi":"để (mục đích + động từ di chuyển)","ja":"〜しに (移動の目的)"}',
 '밥 먹으러 가요.',
 '{"en":"I''m going to eat.","es":"Voy a comer.","fr":"Je vais manger.","pt-BR":"Vou comer.","th":"ฉันจะไปกินข้าว","id":"Saya pergi makan.","vi":"Tôi đi ăn cơm.","ja":"ご飯を食べに行きます。"}',
 'general'),
('-(으)려고',
 '{"en":"with the intention of","es":"con la intención de","fr":"avec l''intention de","pt-BR":"com a intenção de","th":"ตั้งใจจะ","id":"berniat untuk","vi":"với ý định","ja":"〜しようと"}',
 '한국어를 배우려고 해요.',
 '{"en":"I intend to learn Korean.","es":"Tengo la intención de aprender coreano.","fr":"J''ai l''intention d''apprendre le coréen.","pt-BR":"Tenho a intenção de aprender coreano.","th":"ฉันตั้งใจจะเรียนภาษาเกาหลี","id":"Saya berniat belajar bahasa Korea.","vi":"Tôi định học tiếng Hàn.","ja":"韓国語を学ぼうと思います。"}',
 'general'),
('-고 싶다',
 '{"en":"want to do something","es":"querer hacer algo","fr":"vouloir faire","pt-BR":"querer fazer algo","th":"อยากทำ","id":"ingin melakukan","vi":"muốn làm","ja":"〜したい"}',
 '드라마를 보고 싶어요.',
 '{"en":"I want to watch a drama.","es":"Quiero ver un drama.","fr":"Je veux regarder un drama.","pt-BR":"Quero ver um drama.","th":"ฉันอยากดูซีรีส์","id":"Saya ingin menonton drama.","vi":"Tôi muốn xem phim.","ja":"ドラマを見たいです。"}',
 'general'),
('못',
 '{"en":"cannot (impossibility)","es":"no poder (imposibilidad)","fr":"ne pas pouvoir","pt-BR":"não conseguir","th":"ไม่สามารถ","id":"tidak bisa","vi":"không thể","ja":"できない (不可能)"}',
 '매운 거 못 먹어요.',
 '{"en":"I can''t eat spicy food.","es":"No puedo comer picante.","fr":"Je ne peux pas manger épicé.","pt-BR":"Não consigo comer picante.","th":"ฉันกินเผ็ดไม่ได้","id":"Saya tidak bisa makan pedas.","vi":"Tôi không ăn cay được.","ja":"辛いものは食べられません。"}',
 'general'),
('-지 않다',
 '{"en":"not (formal negation)","es":"no (negación formal)","fr":"ne ... pas (négation formelle)","pt-BR":"não (negação formal)","th":"ไม่ (ปฏิเสธทางการ)","id":"tidak (negasi formal)","vi":"không (phủ định trang trọng)","ja":"〜ない (改まった否定)"}',
 '오늘은 춥지 않아요.',
 '{"en":"It''s not cold today.","es":"Hoy no hace frío.","fr":"Il ne fait pas froid aujourd''hui.","pt-BR":"Hoje não está frio.","th":"วันนี้ไม่หนาว","id":"Hari ini tidak dingin.","vi":"Hôm nay không lạnh.","ja":"今日は寒くないです。"}',
 'general'),
('-고',
 '{"en":"and (action connector)","es":"y (conectivo entre acciones)","fr":"et (connecteur d''actions)","pt-BR":"e (conector de ações)","th":"แล้วก็ (เชื่อมการกระทำ)","id":"lalu / dan (penghubung aksi)","vi":"và (nối hành động)","ja":"〜して (動作の連結)"}',
 '숙제를 하고 잤어요.',
 '{"en":"I did my homework and went to sleep.","es":"Hice la tarea y me dormí.","fr":"J''ai fait mes devoirs et je suis allé dormir.","pt-BR":"Fiz a lição e fui dormir.","th":"ทำการบ้านแล้วก็นอน","id":"Saya kerjakan PR lalu tidur.","vi":"Tôi làm bài tập rồi đi ngủ.","ja":"宿題をして寝ました。"}',
 'general'),
('-아/어야 되다',
 '{"en":"have to / must","es":"tener que / deber","fr":"devoir / il faut","pt-BR":"ter que / dever","th":"ต้อง","id":"harus","vi":"phải","ja":"〜なければならない"}',
 '내일 일찍 일어나야 돼요.',
 '{"en":"I have to wake up early tomorrow.","es":"Mañana tengo que levantarme temprano.","fr":"Demain je dois me lever tôt.","pt-BR":"Amanhã tenho que acordar cedo.","th":"พรุ่งนี้ต้องตื่นเช้า","id":"Besok saya harus bangun pagi.","vi":"Ngày mai tôi phải dậy sớm.","ja":"明日早く起きなければなりません。"}',
 'general')
ON CONFLICT (ko) DO NOTHING;

INSERT INTO public.contexts (id, name, scene, category) VALUES
('banmal', '반말',
 '{"en":"with your close friend, no formality","es":"con tu 친한 친구, sin formalidad","fr":"avec ton ami proche, sans formalité","pt-BR":"com seu amigo próximo, sem formalidade","th":"กับเพื่อนสนิท ไม่มีพิธีรีตอง","id":"dengan teman dekat, tanpa formalitas","vi":"với bạn thân, không trang trọng","ja":"親しい友達と、敬語なし"}',
 'formalidad'),
('jondaetmal', '존댓말',
 '{"en":"polite normal, with someone you don''t know well","es":"polite normal, con alguien que no conoces bien","fr":"poli normal, avec quelqu''un que tu ne connais pas bien","pt-BR":"educado normal, com alguém que você não conhece bem","th":"สุภาพปกติ กับคนที่ไม่รู้จักดี","id":"sopan normal, dengan orang yang belum kenal","vi":"lịch sự thông thường, với người không quen","ja":"普通の丁寧語、よく知らない相手と"}',
 'formalidad'),
('gyeoksik', '격식체',
 '{"en":"formal — business meeting or presentation","es":"formal tipo reunión de trabajo o presentación","fr":"formel — réunion ou présentation","pt-BR":"formal — reunião de trabalho ou apresentação","th":"ทางการ ประชุมหรือนำเสนอ","id":"formal — rapat kerja atau presentasi","vi":"trang trọng — họp công việc hoặc thuyết trình","ja":"フォーマル — 会議やプレゼン"}',
 'formalidad'),
('friends', '친구한테',
 '{"en":"telling something to your friends","es":"contando algo a tus amigos","fr":"en racontant quelque chose à tes amis","pt-BR":"contando algo para seus amigos","th":"เล่าอะไรให้เพื่อนฟัง","id":"menceritakan sesuatu ke teman-teman","vi":"kể chuyện cho bạn bè","ja":"友達に何か話す感じ"}',
 'situacional'),
('drama', '드라마 장면',
 '{"en":"like a K-drama scene, intense","es":"como diálogo de K-drama, intenso","fr":"comme une scène de K-drama, intense","pt-BR":"como cena de K-drama, intenso","th":"เหมือนซีนซีรีส์เกาหลี เข้มข้น","id":"seperti adegan K-drama, intens","vi":"như cảnh phim Hàn, dữ dội","ja":"Kドラマのシーンのように、激しい"}',
 'situacional'),
('work', '직장에서',
 '{"en":"in a work context, to a colleague","es":"en contexto laboral, a un compañero","fr":"au travail, à un collègue","pt-BR":"no trabalho, para um colega","th":"ในที่ทำงาน กับเพื่อนร่วมงาน","id":"di kantor, ke rekan kerja","vi":"ở chỗ làm, với đồng nghiệp","ja":"職場で、同僚に"}',
 'situacional'),
('sns', 'SNS에',
 '{"en":"short, expressive social media post","es":"publicación corta, expresiva","fr":"publication courte et expressive","pt-BR":"post curto e expressivo","th":"โพสต์โซเชียลสั้นๆ มีอารมณ์","id":"postingan medsos pendek, ekspresif","vi":"bài đăng mạng xã hội ngắn, biểu cảm","ja":"SNSの短く感情豊かな投稿"}',
 'situacional'),
('elder', '어른한테',
 '{"en":"to your grandparent, older teacher, senior boss","es":"a tu abuelo/a, profesor mayor, jefe con edad","fr":"à ton grand-parent, professeur âgé, patron senior","pt-BR":"para seu avô/avó, professor mais velho, chefe sênior","th":"กับปู่ย่า อาจารย์ผู้ใหญ่ เจ้านายอาวุโส","id":"ke kakek/nenek, guru senior, bos senior","vi":"với ông bà, thầy lớn tuổi, sếp lớn tuổi","ja":"おじいさん・おばあさん、年配の先生や上司に"}',
 'situacional')
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Apply + verify counts**

```bash
cd munbeop
supabase db push
```

In Supabase Studio → SQL Editor:

```sql
SELECT count(*) FROM public.grammars; -- expect 14
SELECT count(*) FROM public.contexts; -- expect 8
```

- [ ] **Step 3: Commit**

```bash
git add munbeop/supabase/migrations/20260603000003_seed_catalog.sql
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(db): seed catalog — 14 grammars + 8 contexts × 8 locales [Task 5]"
git push
```

---

## Task 6: Refactor `StorageAdapter` to async + update `LocalStorageAdapter` + tests

**Files:**
- Modify: `munbeop/app/lib/storage/adapter.ts`
- Modify: `munbeop/app/lib/storage/localStorage.ts`
- Modify: `munbeop/tests/unit/storage/localStorage.test.ts`

- [ ] **Step 1: Update failing tests first (TDD red)**

Replace `munbeop/tests/unit/storage/localStorage.test.ts` contents with:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { STORAGE_KEYS } from '~/lib/storage/keys'

describe('LocalStorageAdapter (async)', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    adapter = new LocalStorageAdapter()
  })

  it('returns fallback when missing', async () => {
    expect(await adapter.read(STORAGE_KEYS.grammar, [] as unknown[])).toEqual([])
  })

  it('round-trips values', async () => {
    const v = { a: 1, b: ['x', 'y'] }
    await adapter.write(STORAGE_KEYS.grammar, v)
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toEqual(v)
  })

  it('returns fallback on malformed JSON', async () => {
    localStorage.setItem(STORAGE_KEYS.grammar, '{ not valid')
    expect(await adapter.read(STORAGE_KEYS.grammar, 'fb')).toBe('fb')
  })

  it('remove deletes', async () => {
    await adapter.write(STORAGE_KEYS.log, [1, 2, 3])
    await adapter.remove(STORAGE_KEYS.log)
    expect(await adapter.read(STORAGE_KEYS.log, null)).toBeNull()
  })

  it('clear wipes known keys only', async () => {
    localStorage.setItem('unrelated', 'keep')
    await adapter.write(STORAGE_KEYS.grammar, ['a'])
    await adapter.clear()
    expect(await adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd munbeop
pnpm test localStorage
```

Expected: FAIL on `read returned non-Promise` etc.

- [ ] **Step 3: Modify `munbeop/app/lib/storage/adapter.ts`**

```typescript
import type { StorageKey } from './keys'

/**
 * Async storage abstraction.
 * - LocalStorageAdapter: trivial Promise-wrapping (sync underlying).
 * - SupabaseAdapter (Task 11): genuine async via @supabase/supabase-js.
 */
export interface StorageAdapter {
  read<T>(key: StorageKey, fallback: T): Promise<T>
  write<T>(key: StorageKey, value: T): Promise<void>
  remove(key: StorageKey): Promise<void>
  clear(): Promise<void>
}
```

- [ ] **Step 4: Modify `munbeop/app/lib/storage/localStorage.ts`**

```typescript
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'

export class LocalStorageAdapter implements StorageAdapter {
  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('LocalStorageAdapter.write failed', { key, err })
    }
  }

  async remove(key: StorageKey): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key)
    }
  }
}
```

- [ ] **Step 5: Run tests + typecheck**

```bash
cd munbeop
pnpm test localStorage
pnpm typecheck
```

Tests will pass. Typecheck will fail because callers (stores) still call sync methods. Expected — we fix those in Task 7.

- [ ] **Step 6: Commit (with broken typecheck — Task 7 fixes it)**

```bash
git add munbeop/app/lib/storage/ munbeop/tests/unit/storage/localStorage.test.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "refactor(storage): make StorageAdapter async [Task 6, breaks stores temporarily]"
```

**Do not push yet.** Task 7 fixes the broken stores; push after Task 7 verifies.

---

## Task 7: Update all Pinia stores to async

**Files:**
- Modify: `munbeop/app/stores/grammar.ts`
- Modify: `munbeop/app/stores/contexts.ts`
- Modify: `munbeop/app/stores/srs.ts`
- Modify: `munbeop/app/stores/log.ts`
- Modify: `munbeop/app/stores/locale.ts`
- Modify: `munbeop/app/layouts/default.vue` (await hydrate)
- Modify: `munbeop/app/composables/usePractice.ts` (await persistEntry)

- [ ] **Step 1: Modify `app/stores/grammar.ts`** — change `hydrate()`:

```typescript
    async hydrate() {
      this.items = await storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
      this.decks = await storage.read(STORAGE_KEYS.decks, [] as Deck[])
      if (this.items.length === 0) {
        this.items = [...DEFAULT_GRAMMAR]
        await storage.write(STORAGE_KEYS.grammar, this.items)
      }
      if (this.decks.length === 0) {
        this.decks = [DEFAULT_DECK]
        await storage.write(STORAGE_KEYS.decks, this.decks)
      }
    },
```

- [ ] **Step 2: Modify `app/stores/contexts.ts`** — `hydrate()` becomes async, `toggleActive` and `addCustom` become async:

```typescript
    async hydrate() {
      this.custom = await storage.read(STORAGE_KEYS.customContexts, [] as Context[])
      const inactive = await storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
      this.inactiveIds = new Set(inactive)
    },
    async toggleActive(id: string) {
      if (this.inactiveIds.has(id)) {
        this.inactiveIds.delete(id)
      } else {
        this.inactiveIds.add(id)
      }
      await storage.write(STORAGE_KEYS.inactiveContextIds, [...this.inactiveIds])
    },
    async addCustom(name: string, scene: LocalizedString): Promise<Context | null> {
      const exists = this.all.some((c) => c.name === name)
      if (exists) return null
      const ctx: Context = {
        id: `custom_${Date.now()}`,
        name,
        scene,
        category: 'custom',
        builtin: false,
      }
      this.custom.push(ctx)
      await storage.write(STORAGE_KEYS.customContexts, this.custom)
      return ctx
    },
```

- [ ] **Step 3: Modify `app/stores/srs.ts`** — `hydrate`, `markSeen`, `recalculate` become async:

```typescript
    async hydrate() {
      this.map = await storage.read(STORAGE_KEYS.srs, {} as SrsMap)
    },
    ensure(ko: string): SrsState {
      if (!this.map[ko]) this.map[ko] = freshSrs()
      return this.map[ko]!
    },
    weightFor(ko: string, now: number = Date.now()): number {
      return getWeight(this.ensure(ko), now)
    },
    async markSeen(ko: string, now: number = Date.now()) {
      this.ensure(ko).lastSeen = now
      await storage.write(STORAGE_KEYS.srs, this.map)
    },
    async recalculate(ko: string) {
      const log = useLogStore().entries
      this.map[ko] = recalculateMastery(ko, log)
      await storage.write(STORAGE_KEYS.srs, this.map)
    },
```

- [ ] **Step 4: Modify `app/stores/log.ts`** — `hydrate`, `add`, `setReviewState` async:

```typescript
    async hydrate() {
      const raw = await storage.read(STORAGE_KEYS.log, [] as LogEntry[])
      this.entries = raw.map((e) => ({
        ...e,
        reviewState: (e.reviewState ?? 'unreviewed') as ReviewState,
        errorNote: e.errorNote ?? null,
      }))
    },
    async add(p: {
      ko: string
      sentence: string
      feedback: Feedback
      errorNote: string | null
      reviewState: ReviewState
      contextId: string
      contextName: string
    }): Promise<LogEntry> {
      const entry: LogEntry = {
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        ...p,
      }
      this.entries.unshift(entry)
      await storage.write(STORAGE_KEYS.log, this.entries)
      return entry
    },
    async setReviewState(id: number, reviewState: ReviewState, errorNote: string | null = null) {
      const entry = this.entries.find((e) => e.id === id)
      if (!entry) return
      entry.reviewState = reviewState
      entry.errorNote = errorNote
      await storage.write(STORAGE_KEYS.log, this.entries)
    },
```

- [ ] **Step 5: Modify `app/stores/locale.ts`** — `hydrate` and `set` async:

```typescript
    async hydrate() {
      const stored = await storage.read<string>(STORAGE_KEYS.locale, DEFAULT_LOCALE)
      this.current = isValid(stored) ? stored : DEFAULT_LOCALE
    },
    async set(code: LocaleCode) {
      this.current = code
      await storage.write(STORAGE_KEYS.locale, code)
    },
```

- [ ] **Step 6: Modify `app/layouts/default.vue`** — await hydrate calls:

```vue
<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

onMounted(async () => {
  await Promise.all([
    useGrammarStore().hydrate(),
    useContextsStore().hydrate(),
    useSrsStore().hydrate(),
    useLogStore().hydrate(),
  ])
})
</script>

<template>
  <AppShell>
    <slot />
  </AppShell>
</template>
```

- [ ] **Step 7: Modify `app/composables/usePractice.ts`** — `start` and `persistEntry` become async:

Replace `start()` function:

```typescript
  async function start() {
    error.value = null
    try {
      const pool = grammarStore.activeIndices
      const activeContexts = contextsStore.active
      if (pool.length < 3) {
        error.value = t('practice.no_grammars')
        return
      }
      if (activeContexts.length < 3) {
        error.value = t('practice.no_contexts')
        return
      }
      session.value = createSession<number, Context>({
        grammarPool: pool,
        contextPool: activeContexts,
        weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
      })
      await Promise.all(
        session.value.picks.map((pick) =>
          srsStore.markSeen(grammarStore.items[pick.grammarIdx]!.ko),
        ),
      )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }
```

Replace `persistEntry()`:

```typescript
  async function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
  }): Promise<LogEntry | null> {
    const s = session.value
    if (!s) return null
    const grammar = grammarOf(p.pickIndex)
    const ctx = currentContextOf(p.pickIndex)
    if (!grammar || !ctx) return null
    const hasNote = p.errorNote !== null && p.errorNote.trim().length > 0
    const reviewState: ReviewState = p.feedback === 'hard' && hasNote ? 'incorrect' : 'unreviewed'
    const entry = await logStore.add({
      ko: grammar.ko,
      sentence: p.sentence,
      feedback: p.feedback,
      errorNote: hasNote ? p.errorNote : null,
      reviewState,
      contextId: ctx.id,
      contextName: ctx.name,
    })
    await srsStore.recalculate(grammar.ko)
    advanceProgress(s, p.pickIndex)
    return entry
  }
```

- [ ] **Step 8: Modify `app/pages/practice.vue`** — `onSubmit` and `onStart` await:

Replace the `<script setup>` block content (functions only):

```typescript
async function onStart() {
  await start()
  if (error.value) toast.show(error.value)
}

async function onSubmit(payload: {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
}) {
  const entry = await persistEntry(payload)
  if (entry) {
    toast.show(
      payload.feedback === 'easy'
        ? t('practice.toast_saved_easy')
        : t('practice.toast_saved_hard'),
    )
  }
}

async function onRestart() {
  reset()
  await onStart()
}
```

- [ ] **Step 9: Full verify cycle**

```bash
cd munbeop
pnpm typecheck   # expect 0 errors
pnpm lint        # expect 0 errors
pnpm test        # expect 46/46 (unchanged)
pnpm build       # expect success
```

- [ ] **Step 10: Commit + push (Task 6 + Task 7 together as a fixup)**

```bash
git add munbeop/app/stores/ munbeop/app/layouts/default.vue \
        munbeop/app/composables/usePractice.ts munbeop/app/pages/practice.vue
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "refactor(stores): convert all stores + usePractice to async [Task 7]

Follow-up to Task 6 (StorageAdapter async). All store actions that touch
storage are now async. Layout awaits all hydrate() calls in parallel.
Practice page awaits start/onSubmit/onRestart. Verify: typecheck + lint
+ 46 tests + build all green."
git push
```

---

## Task 8: Supabase JS client singleton + types

**Files:**
- Create: `munbeop/app/lib/auth/client.ts`
- Create: `munbeop/app/lib/auth/types.ts`
- Create: `munbeop/app/plugins/supabase.client.ts`

- [ ] **Step 1: Create `app/lib/auth/types.ts`**

```typescript
import type { User, Session } from '@supabase/supabase-js'

export type AuthUser = User
export type AuthSession = Session
```

- [ ] **Step 2: Create `app/lib/auth/client.ts`** — singleton client factory:

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }
  return cached
}
```

- [ ] **Step 3: Create `app/plugins/supabase.client.ts`** — provide client via Nuxt:

```typescript
import { getSupabaseClient } from '~/lib/auth/client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const client = getSupabaseClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  )
  return {
    provide: { supabase: client },
  }
})
```

- [ ] **Step 4: Verify build**

```bash
cd munbeop
pnpm typecheck
pnpm build
```

The build should succeed (the plugin doesn't crash even without env vars set — `createClient` accepts empty strings and only fails on first use).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/auth/ munbeop/app/plugins/supabase.client.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(auth): Supabase JS client singleton + Nuxt plugin [Task 8]"
git push
```

---

## Task 9: Auth Pinia store + composable

**Files:**
- Create: `munbeop/app/stores/auth.ts`
- Create: `munbeop/app/composables/useAuth.ts`

- [ ] **Step 1: Create `app/stores/auth.ts`**

```typescript
import { defineStore } from 'pinia'
import type { AuthUser, AuthSession } from '~/lib/auth/types'

interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  ready: boolean // true after initial getSession() resolves
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    ready: false,
  }),
  getters: {
    isAnonymous(state): boolean {
      return state.user === null
    },
  },
  actions: {
    setSession(session: AuthSession | null) {
      this.session = session
      this.user = session?.user ?? null
      this.ready = true
    },
  },
})
```

- [ ] **Step 2: Create `app/composables/useAuth.ts`**

```typescript
import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const { $supabase } = useNuxtApp()
  const authStore = useAuthStore()

  async function init() {
    const { data } = await $supabase.auth.getSession()
    authStore.setSession(data.session ?? null)
    $supabase.auth.onAuthStateChange((_event, session) => {
      authStore.setSession(session)
    })
  }

  async function signUp(email: string, password: string) {
    const { error } = await $supabase.auth.signUp({ email, password })
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signInMagicLink(email: string) {
    const config = useRuntimeConfig()
    const redirectTo = `${config.public.appUrl ?? window.location.origin}/auth/callback`
    const { error } = await $supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { error }
  }

  async function signOut() {
    const { error } = await $supabase.auth.signOut()
    return { error }
  }

  return {
    init,
    signUp,
    signIn,
    signInMagicLink,
    signOut,
  }
}
```

- [ ] **Step 3: Update `munbeop/nuxt.config.ts`** — add public.appUrl to runtimeConfig:

In the existing `runtimeConfig.public`, add `appUrl`:

```typescript
  runtimeConfig: {
    supabaseServiceRoleKey: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      appUrl: '',   // overridden by NUXT_PUBLIC_APP_URL
    },
  },
```

Add to `.env.example`:

```
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Add `.d.ts` for `$supabase` so TS knows the plugin provides it.**

Create `munbeop/app/types/nuxt.d.ts`:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient
  }
}

export {}
```

- [ ] **Step 5: Verify**

```bash
cd munbeop
pnpm typecheck
pnpm lint
pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/stores/auth.ts munbeop/app/composables/useAuth.ts \
        munbeop/app/types/nuxt.d.ts munbeop/.env.example munbeop/nuxt.config.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(auth): authStore + useAuth composable with PKCE flow [Task 9]"
git push
```

---

## Task 10: Auth pages — sign-in + callback

**Files:**
- Create: `munbeop/app/pages/auth/sign-in.vue`
- Create: `munbeop/app/pages/auth/callback.vue`
- Modify: `munbeop/i18n/locales/*.json` × 8 — add `auth.*` keys

- [ ] **Step 1: Add i18n keys to ALL 8 locale files** (`en.json` shown; replicate per-locale with translations):

In `i18n/locales/en.json`, add top-level `"auth"` block:

```json
  "auth": {
    "sign_in_title": "Sign in",
    "sign_up_title": "Create account",
    "email_label": "Email",
    "password_label": "Password",
    "submit_sign_in": "Sign in",
    "submit_sign_up": "Sign up",
    "submit_magic_link": "Send magic link",
    "magic_link_sent": "Check your email for the sign-in link.",
    "checking": "Checking link…",
    "callback_success": "Signed in! Redirecting…",
    "callback_error": "Sign-in link is invalid or expired.",
    "switch_to_sign_up": "No account? Sign up",
    "switch_to_sign_in": "Have an account? Sign in",
    "signed_in_as": "Signed in as",
    "sign_out": "Sign out",
    "anonymous_banner": "Practicing locally. Sign in to sync across devices."
  }
```

Translations per locale (briefly):

- `es.json`: `sign_in_title="Iniciar sesión"`, `sign_up_title="Crear cuenta"`, `email_label="Correo"`, `password_label="Contraseña"`, `submit_sign_in="Entrar"`, `submit_sign_up="Registrarse"`, `submit_magic_link="Enviar enlace mágico"`, `magic_link_sent="Revisá tu correo."`, `checking="Verificando enlace…"`, `callback_success="¡Listo! Redirigiendo…"`, `callback_error="Enlace inválido o expirado."`, `switch_to_sign_up="¿Sin cuenta? Registrate"`, `switch_to_sign_in="¿Ya tenés cuenta? Entrá"`, `signed_in_as="Sesión de"`, `sign_out="Cerrar sesión"`, `anonymous_banner="Practicando local. Iniciá sesión para sincronizar entre dispositivos."`
- `fr.json`: `sign_in_title="Connexion"`, etc. (translate full block)
- `pt-BR.json`: `sign_in_title="Entrar"`, etc.
- `th.json`: `sign_in_title="เข้าสู่ระบบ"`, etc.
- `id.json`: `sign_in_title="Masuk"`, etc.
- `vi.json`: `sign_in_title="Đăng nhập"`, etc.
- `ja.json`: `sign_in_title="サインイン"`, etc.

(Implementer must translate all keys for all 8 locales using the en.json shape as the contract.)

- [ ] **Step 2: Create `app/pages/auth/sign-in.vue`**

```vue
<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'
import PixelCard from '~/components/ui/PixelCard.vue'
import PixelInput from '~/components/ui/PixelInput.vue'

const { signIn, signUp, signInMagicLink } = useAuth()
const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const mode = ref<'sign-in' | 'sign-up' | 'magic-link'>('sign-in')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  const e = email.value.trim()
  const p = password.value
  let error: { message: string } | null = null
  if (mode.value === 'sign-in') {
    ({ error } = await signIn(e, p))
  } else if (mode.value === 'sign-up') {
    ({ error } = await signUp(e, p))
  } else {
    ({ error } = await signInMagicLink(e))
    if (!error) toast.show(t('auth.magic_link_sent'))
  }
  loading.value = false
  if (error) toast.show(error.message)
  else if (mode.value !== 'magic-link') await router.push('/')
}
</script>

<template>
  <div class="page">
    <PixelCard accent="jade">
      <h1 class="title">
        {{ mode === 'sign-up' ? t('auth.sign_up_title') : t('auth.sign_in_title') }}
      </h1>

      <label class="label">{{ t('auth.email_label') }}</label>
      <PixelInput v-model="email" placeholder="you@example.com" />

      <label v-if="mode !== 'magic-link'" class="label">{{ t('auth.password_label') }}</label>
      <PixelInput v-if="mode !== 'magic-link'" v-model="password" />

      <div class="actions">
        <PixelButton variant="primary" :disabled="loading" @click="submit">
          {{
            mode === 'sign-up'
              ? t('auth.submit_sign_up')
              : mode === 'magic-link'
                ? t('auth.submit_magic_link')
                : t('auth.submit_sign_in')
          }}
        </PixelButton>
      </div>

      <div class="switch">
        <button v-if="mode === 'sign-in'" class="link" @click="mode = 'sign-up'">
          {{ t('auth.switch_to_sign_up') }}
        </button>
        <button v-else class="link" @click="mode = 'sign-in'">
          {{ t('auth.switch_to_sign_in') }}
        </button>
        <button class="link" @click="mode = 'magic-link'">
          {{ t('auth.submit_magic_link') }}
        </button>
      </div>
    </PixelCard>
  </div>
</template>

<style scoped>
.page {
  max-width: 420px;
  margin: 40px auto;
}
.title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--jade);
  margin-bottom: 18px;
}
.label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--muted);
  display: block;
  margin: 12px 0 6px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.actions {
  margin-top: 18px;
}
.switch {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
}
.link {
  background: none;
  border: none;
  color: var(--indigo);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  text-decoration: underline;
  padding: 0;
  text-align: left;
}
</style>
```

- [ ] **Step 3: Create `app/pages/auth/callback.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const status = ref<'checking' | 'success' | 'error'>('checking')
const toast = useToast()

onMounted(async () => {
  // PKCE flow: the client auto-exchanges the URL params for a session.
  // We just need to wait for onAuthStateChange to fire via getSession().
  const { $supabase } = useNuxtApp()
  const { data, error } = await $supabase.auth.getSession()
  if (error || !data.session) {
    status.value = 'error'
    toast.show(t('auth.callback_error'))
    return
  }
  status.value = 'success'
  toast.show(t('auth.callback_success'))
  await navigateTo('/', { replace: true })
})
</script>

<template>
  <div class="page">
    <p v-if="status === 'checking'">{{ t('auth.checking') }}</p>
    <p v-else-if="status === 'success'">{{ t('auth.callback_success') }}</p>
    <p v-else>{{ t('auth.callback_error') }}</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 420px;
  margin: 80px auto;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: var(--muted);
}
</style>
```

- [ ] **Step 4: Verify build**

```bash
cd munbeop
pnpm typecheck
pnpm lint
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/pages/auth/ munbeop/i18n/locales/
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(auth): /auth/sign-in + /auth/callback pages with i18n [Task 10]"
git push
```

---

## Task 11: SupabaseAdapter implementation + tests (mocked)

**Files:**
- Create: `munbeop/app/lib/storage/supabase.ts`
- Create: `munbeop/tests/unit/storage/supabase.test.ts`

- [ ] **Step 1: Write failing test** at `tests/unit/storage/supabase.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseAdapter } from '~/lib/storage/supabase'
import { STORAGE_KEYS } from '~/lib/storage/keys'

function makeMockClient() {
  const data: Record<string, unknown[]> = {
    user_progress: [],
    user_log: [],
    user_decks: [],
    user_custom_grammars: [],
    user_custom_contexts: [],
    user_inactive_contexts: [],
    grammars: [],
    contexts: [],
  }
  return {
    data,
    from(table: string) {
      const rows = data[table] ?? []
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: rows, error: null }),
          then: (cb: (v: { data: unknown[]; error: null }) => unknown) =>
            cb({ data: rows, error: null }),
        }),
        upsert: (rowOrRows: unknown) => {
          const arr = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]
          data[table] = [...(data[table] ?? []), ...arr]
          return Promise.resolve({ error: null })
        },
        delete: () => ({
          eq: () => {
            data[table] = []
            return Promise.resolve({ error: null })
          },
        }),
      }
    },
  }
}

describe('SupabaseAdapter', () => {
  let client: ReturnType<typeof makeMockClient>
  let adapter: SupabaseAdapter

  beforeEach(() => {
    client = makeMockClient()
    adapter = new SupabaseAdapter(client as never, 'user-uuid-fake')
  })

  it('read(grammar) returns combined catalog + user_custom_grammars', async () => {
    client.data.grammars = [
      { ko: 'A', meaning: {}, deck_id: 'general' },
    ]
    client.data.user_custom_grammars = [
      { ko: 'B', meaning: {}, deck_id: 'general' },
    ]
    const result = await adapter.read(STORAGE_KEYS.grammar, [])
    expect(result).toHaveLength(2)
    expect(result.map((g: { ko: string }) => g.ko).sort()).toEqual(['A', 'B'])
  })

  it('write(log) upserts each entry to user_log', async () => {
    await adapter.write(STORAGE_KEYS.log, [
      {
        id: 1,
        ko: 'A',
        sentence: 'x',
        feedback: 'easy',
        errorNote: null,
        reviewState: 'unreviewed',
        contextId: 'banmal',
        contextName: '반말',
        date: '2026-06-03T00:00:00Z',
      },
    ])
    expect(client.data.user_log).toHaveLength(1)
  })

  it('clear deletes all user_* tables but leaves catalog', async () => {
    client.data.user_log = [{ id: 1 }]
    client.data.user_progress = [{ ko: 'A' }]
    client.data.grammars = [{ ko: 'X' }]
    await adapter.clear()
    expect(client.data.user_log).toHaveLength(0)
    expect(client.data.user_progress).toHaveLength(0)
    expect(client.data.grammars).toHaveLength(1) // catalog untouched
  })
})
```

Run: `pnpm test supabase` → expect FAIL.

- [ ] **Step 2: Implement `app/lib/storage/supabase.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'
import type {
  Grammar,
  Context,
  Deck,
  LogEntry,
  SrsState,
} from '~/lib/domain'

/**
 * SupabaseAdapter — implements StorageAdapter against Supabase tables.
 * Each storage key maps to a specific table or pair of tables.
 *
 * Reads:
 *   - grammar: catalog `grammars` UNION user_custom_grammars (current user)
 *   - srs: user_progress (current user)
 *   - log: user_log (current user)
 *   - decks: user_decks (current user)
 *   - customContexts: user_custom_contexts (current user)
 *   - inactiveContextIds: user_inactive_contexts (current user)
 *   - locale: NOT persisted via this adapter — falls through to LocalStorageAdapter
 *
 * Writes are upserts. clear() truncates all user_* tables for this user.
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        const [catalog, custom] = await Promise.all([
          this.client.from('grammars').select('ko, meaning, example, trans, deck_id'),
          this.client
            .from('user_custom_grammars')
            .select('ko, meaning, example, trans, deck_id')
            .eq('user_id', this.userId),
        ])
        const all: Grammar[] = [
          ...((catalog.data as unknown as Grammar[] | null) ?? []),
          ...((custom.data as unknown as Grammar[] | null) ?? []),
        ]
        return (all.length ? all : fallback) as T
      }
      case STORAGE_KEYS.srs: {
        const { data } = await this.client
          .from('user_progress')
          .select('ko, last_seen, easy_count, hard_count, mastery')
          .eq('user_id', this.userId)
        const map: Record<string, SrsState> = {}
        for (const row of (data as unknown as Array<{
          ko: string
          last_seen: string | null
          easy_count: number
          hard_count: number
          mastery: SrsState['mastery']
        }> | null) ?? []) {
          map[row.ko] = {
            lastSeen: row.last_seen ? new Date(row.last_seen).getTime() : null,
            easyCount: row.easy_count,
            hardCount: row.hard_count,
            mastery: row.mastery,
          }
        }
        return (Object.keys(map).length ? map : fallback) as T
      }
      case STORAGE_KEYS.log: {
        const { data } = await this.client
          .from('user_log')
          .select('*')
          .eq('user_id', this.userId)
          .order('created_at', { ascending: false })
        const entries: LogEntry[] = ((data as unknown as Array<{
          id: number
          ko: string
          sentence: string
          feedback: 'easy' | 'hard'
          error_note: string | null
          review_state: LogEntry['reviewState']
          context_id: string
          context_name: string
          created_at: string
        }> | null) ?? []).map((r) => ({
          id: r.id,
          ko: r.ko,
          sentence: r.sentence,
          feedback: r.feedback,
          errorNote: r.error_note,
          reviewState: r.review_state,
          contextId: r.context_id,
          contextName: r.context_name,
          date: r.created_at,
        }))
        return (entries.length ? entries : fallback) as T
      }
      case STORAGE_KEYS.decks: {
        const { data } = await this.client
          .from('user_decks')
          .select('id, name, color_id, position, collapsed')
          .eq('user_id', this.userId)
        const decks: Deck[] = ((data as unknown as Array<{
          id: string
          name: string
          color_id: string
          position: number
          collapsed: boolean
        }> | null) ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          colorId: r.color_id,
          order: r.position,
          collapsed: r.collapsed,
        }))
        return (decks.length ? decks : fallback) as T
      }
      case STORAGE_KEYS.customContexts: {
        const { data } = await this.client
          .from('user_custom_contexts')
          .select('id, name, scene')
          .eq('user_id', this.userId)
        const contexts: Context[] = ((data as unknown as Array<{
          id: string
          name: string
          scene: Context['scene']
        }> | null) ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          scene: r.scene,
          category: 'custom',
          builtin: false,
        }))
        return (contexts.length ? contexts : fallback) as T
      }
      case STORAGE_KEYS.inactiveContextIds: {
        const { data } = await this.client
          .from('user_inactive_contexts')
          .select('context_id')
          .eq('user_id', this.userId)
        const ids = ((data as unknown as Array<{ context_id: string }> | null) ?? []).map(
          (r) => r.context_id,
        )
        return (ids.length ? ids : fallback) as T
      }
      default:
        return fallback // locale is not handled here.
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    switch (key) {
      case STORAGE_KEYS.grammar: {
        // We persist only user-added grammars (catalog is read-only from client).
        const customs = (value as Grammar[]).filter((g) =>
          !!g && !g.deckId.startsWith('catalog'), // every Grammar from store goes through user_custom_grammars
        )
        // Replace user_custom_grammars for this user atomically.
        await this.client
          .from('user_custom_grammars')
          .delete()
          .eq('user_id', this.userId)
        if (customs.length) {
          await this.client.from('user_custom_grammars').upsert(
            customs.map((g) => ({
              user_id: this.userId,
              ko: g.ko,
              meaning: g.meaning,
              example: g.example ?? null,
              trans: g.trans ?? null,
              deck_id: g.deckId,
            })),
          )
        }
        break
      }
      case STORAGE_KEYS.srs: {
        const map = value as Record<string, SrsState>
        const rows = Object.entries(map).map(([ko, s]) => ({
          user_id: this.userId,
          ko,
          last_seen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
          easy_count: s.easyCount,
          hard_count: s.hardCount,
          mastery: s.mastery,
          updated_at: new Date().toISOString(),
        }))
        if (rows.length) await this.client.from('user_progress').upsert(rows)
        break
      }
      case STORAGE_KEYS.log: {
        const entries = value as LogEntry[]
        if (!entries.length) break
        await this.client.from('user_log').upsert(
          entries.map((e) => ({
            id: Math.floor(e.id), // bigserial allows manual ids
            user_id: this.userId,
            ko: e.ko,
            sentence: e.sentence,
            feedback: e.feedback,
            error_note: e.errorNote,
            review_state: e.reviewState,
            context_id: e.contextId,
            context_name: e.contextName,
            created_at: e.date,
          })),
        )
        break
      }
      case STORAGE_KEYS.decks: {
        const decks = value as Deck[]
        await this.client.from('user_decks').delete().eq('user_id', this.userId)
        if (decks.length) {
          await this.client.from('user_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              position: d.order,
              collapsed: d.collapsed,
            })),
          )
        }
        break
      }
      case STORAGE_KEYS.customContexts: {
        const contexts = value as Context[]
        await this.client
          .from('user_custom_contexts')
          .delete()
          .eq('user_id', this.userId)
        if (contexts.length) {
          await this.client.from('user_custom_contexts').upsert(
            contexts.map((c) => ({
              user_id: this.userId,
              id: c.id,
              name: c.name,
              scene: c.scene,
            })),
          )
        }
        break
      }
      case STORAGE_KEYS.inactiveContextIds: {
        const ids = value as string[]
        await this.client
          .from('user_inactive_contexts')
          .delete()
          .eq('user_id', this.userId)
        if (ids.length) {
          await this.client.from('user_inactive_contexts').upsert(
            ids.map((context_id) => ({ user_id: this.userId, context_id })),
          )
        }
        break
      }
      default:
        // locale stays in localStorage even when authed
        break
    }
  }

  async remove(key: StorageKey): Promise<void> {
    await this.write(key, [] as never)
  }

  async clear(): Promise<void> {
    const tables = [
      'user_progress',
      'user_log',
      'user_decks',
      'user_custom_grammars',
      'user_custom_contexts',
      'user_inactive_contexts',
    ]
    await Promise.all(
      tables.map((t) => this.client.from(t).delete().eq('user_id', this.userId)),
    )
  }
}
```

- [ ] **Step 3: Run tests**

```bash
cd munbeop
pnpm test supabase
```

Expected: 3 tests pass.

- [ ] **Step 4: Full verify + commit**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
git add munbeop/app/lib/storage/supabase.ts munbeop/tests/unit/storage/supabase.test.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(storage): SupabaseAdapter implements StorageAdapter [Task 11]"
git push
```

---

## Task 12: Adapter facade — pick LocalStorage vs Supabase

**Files:**
- Create: `munbeop/app/lib/storage/facade.ts`
- Create: `munbeop/app/composables/useStorageAdapter.ts`
- Modify: `munbeop/app/stores/grammar.ts`, `contexts.ts`, `srs.ts`, `log.ts` — use facade
- Create: `munbeop/tests/unit/storage/facade.test.ts`

- [ ] **Step 1: Write failing test** `tests/unit/storage/facade.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { pickAdapter } from '~/lib/storage/facade'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { SupabaseAdapter } from '~/lib/storage/supabase'

describe('pickAdapter', () => {
  it('returns LocalStorageAdapter when no user', () => {
    const a = pickAdapter({ user: null, client: null })
    expect(a).toBeInstanceOf(LocalStorageAdapter)
  })

  it('returns SupabaseAdapter when user + client present', () => {
    const fakeUser = { id: 'u1' } as never
    const fakeClient = { from: () => ({}) } as never
    const a = pickAdapter({ user: fakeUser, client: fakeClient })
    expect(a).toBeInstanceOf(SupabaseAdapter)
  })
})
```

Run, expect FAIL.

- [ ] **Step 2: Implement `app/lib/storage/facade.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '~/lib/auth/types'
import type { StorageAdapter } from './adapter'
import { LocalStorageAdapter } from './localStorage'
import { SupabaseAdapter } from './supabase'

export interface AdapterPickArgs {
  user: AuthUser | null
  client: SupabaseClient | null
}

export function pickAdapter(args: AdapterPickArgs): StorageAdapter {
  if (args.user && args.client) {
    return new SupabaseAdapter(args.client, args.user.id)
  }
  return new LocalStorageAdapter()
}
```

- [ ] **Step 3: Implement `app/composables/useStorageAdapter.ts`**

```typescript
import { pickAdapter } from '~/lib/storage/facade'
import { useAuthStore } from '~/stores/auth'

/**
 * Returns the active StorageAdapter based on current auth state.
 * Call this fresh each time you need to read/write — the result is not
 * cached because we want to switch instantly on sign-in/sign-out.
 */
export function useStorageAdapter() {
  const auth = useAuthStore()
  const { $supabase } = useNuxtApp()
  return pickAdapter({ user: auth.user, client: $supabase })
}
```

- [ ] **Step 4: Update each store to call facade per-action**

In `app/stores/grammar.ts`, replace `const storage = new LocalStorageAdapter()` with calls inside each action:

```typescript
// REMOVE: const storage = new LocalStorageAdapter()

// INSIDE each action:
//   const storage = useStorageAdapter()
//   ... existing await storage.read / write ...
```

Concretely the `hydrate()` action becomes:

```typescript
    async hydrate() {
      const storage = useStorageAdapter()
      this.items = await storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
      this.decks = await storage.read(STORAGE_KEYS.decks, [] as Deck[])
      if (this.items.length === 0) {
        this.items = [...DEFAULT_GRAMMAR]
        await storage.write(STORAGE_KEYS.grammar, this.items)
      }
      if (this.decks.length === 0) {
        this.decks = [DEFAULT_DECK]
        await storage.write(STORAGE_KEYS.decks, this.decks)
      }
    },
```

Apply the same pattern to `contexts.ts`, `srs.ts`, `log.ts`, `locale.ts`. Remove the module-level `storage` const in each. Note `locale.ts` should keep using `LocalStorageAdapter` directly (locale is per-device, not synced) — replace `useStorageAdapter` with `new LocalStorageAdapter()` inside locale actions.

Add to top of each updated store file:

```typescript
import { useStorageAdapter } from '~/composables/useStorageAdapter'
```

(For `locale.ts`, keep `import { LocalStorageAdapter } from '~/lib/storage'`.)

- [ ] **Step 5: Run full verify**

```bash
cd munbeop
pnpm typecheck
pnpm lint
pnpm test     # facade tests should pass (2 added) plus existing 46+ tests
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/storage/facade.ts \
        munbeop/app/composables/useStorageAdapter.ts \
        munbeop/app/stores/ \
        munbeop/tests/unit/storage/facade.test.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(storage): facade — auto-switch LocalStorage ↔ Supabase by auth state [Task 12]"
git push
```

---

## Task 13: Migration — localStorage → Supabase on first login

**Files:**
- Create: `munbeop/app/lib/auth/migration.ts`
- Create: `munbeop/tests/unit/auth/migration.test.ts`
- Modify: `munbeop/app/composables/useAuth.ts` — call migration after successful sign-in

- [ ] **Step 1: Write failing test** `tests/unit/auth/migration.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { migrateLocalToSupabase } from '~/lib/auth/migration'
import { STORAGE_KEYS } from '~/lib/storage/keys'

const LOCAL_SAMPLE = {
  log: [
    {
      id: 1,
      ko: '-(으)니까',
      sentence: '시간이 없으니까 빨리 가요',
      feedback: 'easy',
      errorNote: null,
      reviewState: 'unreviewed',
      contextId: 'banmal',
      contextName: '반말',
      date: '2026-06-01T00:00:00Z',
    },
  ],
  srs: {
    '-(으)니까': {
      lastSeen: 1717200000000,
      easyCount: 1,
      hardCount: 0,
      mastery: 'seedling',
    },
  },
}

function seedLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(LOCAL_SAMPLE.log))
  localStorage.setItem(STORAGE_KEYS.srs, JSON.stringify(LOCAL_SAMPLE.srs))
}

describe('migrateLocalToSupabase', () => {
  beforeEach(() => {
    localStorage.clear()
    seedLocalStorage()
  })

  it('writes local log into the supabase adapter and clears localStorage', async () => {
    const supabaseWrites: Record<string, unknown> = {}
    const fakeSupabaseAdapter = {
      read: vi.fn().mockResolvedValue([]),
      write: vi.fn().mockImplementation(async (key, value) => {
        supabaseWrites[key] = value
      }),
      remove: vi.fn(),
      clear: vi.fn(),
    }
    const result = await migrateLocalToSupabase(fakeSupabaseAdapter as never)
    expect(result.migrated).toBe(true)
    expect(supabaseWrites[STORAGE_KEYS.log]).toHaveLength(1)
    expect(supabaseWrites[STORAGE_KEYS.srs]).toBeDefined()
    expect(localStorage.getItem(STORAGE_KEYS.log)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.srs)).toBeNull()
  })

  it('returns migrated:false when no local data exists', async () => {
    localStorage.clear()
    const fake = { read: vi.fn(), write: vi.fn(), remove: vi.fn(), clear: vi.fn() }
    const result = await migrateLocalToSupabase(fake as never)
    expect(result.migrated).toBe(false)
    expect(fake.write).not.toHaveBeenCalled()
  })
})
```

Run, expect FAIL.

- [ ] **Step 2: Implement `app/lib/auth/migration.ts`**

```typescript
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import type { StorageAdapter } from '~/lib/storage/adapter'
import { STORAGE_KEYS } from '~/lib/storage/keys'

const SYNCED_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
] as const

export interface MigrationResult {
  migrated: boolean
  keysCopied: string[]
}

/**
 * Move all syncable localStorage keys into the provided (logged-in) Supabase adapter.
 * Idempotent: if localStorage is empty, no-op.
 *
 * NOTE: this does NOT merge with existing Supabase data — it overwrites it.
 * That's intentional for v1: the user is migrating from anonymous local to a
 * brand-new account. Multi-device merging is a Plan 2.5 concern.
 */
export async function migrateLocalToSupabase(
  cloudAdapter: StorageAdapter,
): Promise<MigrationResult> {
  const local = new LocalStorageAdapter()
  const copied: string[] = []
  for (const key of SYNCED_KEYS) {
    const value = await local.read(key, null)
    if (value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'object' && Object.keys(value as object).length === 0) continue
    await cloudAdapter.write(key, value)
    copied.push(key)
  }
  if (copied.length === 0) {
    return { migrated: false, keysCopied: [] }
  }
  // Clear local now that cloud has the data.
  for (const key of copied) {
    await local.remove(key)
  }
  return { migrated: true, keysCopied: copied }
}
```

- [ ] **Step 3: Hook migration into `useAuth.signIn` and `signUp`**

Modify `app/composables/useAuth.ts` — after a successful `signIn`/`signUp`, call migration:

```typescript
import { migrateLocalToSupabase } from '~/lib/auth/migration'
import { pickAdapter } from '~/lib/storage/facade'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'

// ... inside useAuth, after authStore.setSession:

async function runPostLoginMigration() {
  const auth = useAuthStore()
  if (!auth.user) return
  const adapter = pickAdapter({ user: auth.user, client: $supabase })
  const result = await migrateLocalToSupabase(adapter)
  // Re-hydrate stores from the active adapter.
  await Promise.all([
    useGrammarStore().hydrate(),
    useContextsStore().hydrate(),
    useSrsStore().hydrate(),
    useLogStore().hydrate(),
  ])
  return result
}
```

Then in `signIn` and `signUp`, after `error: null`:

```typescript
  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (!error) await runPostLoginMigration()
    return { error }
  }
```

Apply the same pattern to `signUp`. (Magic link migration happens via `app/pages/auth/callback.vue` — add a call to `runPostLoginMigration()` there after the session is established.)

In `callback.vue`, after the toast:

```typescript
  const { runPostLoginMigration } = useAuth()
  await runPostLoginMigration()
```

(Export `runPostLoginMigration` from `useAuth` return object.)

- [ ] **Step 4: Verify**

```bash
cd munbeop
pnpm test migration
pnpm typecheck && pnpm lint && pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/auth/migration.ts \
        munbeop/app/composables/useAuth.ts \
        munbeop/app/pages/auth/callback.vue \
        munbeop/tests/unit/auth/migration.test.ts
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(auth): migrate localStorage to Supabase on first sign-in [Task 13]"
git push
```

---

## Task 14: Account widget + sidebar integration

**Files:**
- Create: `munbeop/app/components/layout/AccountWidget.vue`
- Modify: `munbeop/app/components/layout/AppSidebar.vue` — embed AccountWidget above LocaleSwitcher
- Modify: `munbeop/app/pages/settings.vue` — show account info if logged in

- [ ] **Step 1: Create `AccountWidget.vue`**

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import PixelButton from '~/components/ui/PixelButton.vue'

const auth = useAuthStore()
const { signOut } = useAuth()
const { t } = useI18n()
const router = useRouter()

async function onSignOut() {
  await signOut()
  router.push('/')
}

function onSignIn() {
  router.push('/auth/sign-in')
}
</script>

<template>
  <div class="widget">
    <template v-if="auth.user">
      <div class="email">
        <span class="email__label">{{ t('auth.signed_in_as') }}</span>
        <span class="email__addr">{{ auth.user.email }}</span>
      </div>
      <PixelButton variant="secondary" @click="onSignOut">
        {{ t('auth.sign_out') }}
      </PixelButton>
    </template>
    <template v-else>
      <div class="anon">{{ t('auth.anonymous_banner') }}</div>
      <PixelButton variant="primary" @click="onSignIn">
        {{ t('auth.sign_in_title') }}
      </PixelButton>
    </template>
  </div>
</template>

<style scoped>
.widget {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.email {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.email__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}
.email__addr {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink);
  word-break: break-all;
}
.anon {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}
</style>
```

- [ ] **Step 2: Modify `AppSidebar.vue`** — change footer to include AccountWidget above LocaleSwitcher:

Replace the existing `<div class="sidebar__footer">` block:

```vue
    <div class="sidebar__footer">
      <AccountWidget />
      <LocaleSwitcher />
    </div>
```

Add import at top:

```typescript
import AccountWidget from './AccountWidget.vue'
```

- [ ] **Step 3: Hook auth init in `app.vue` (so the session loads on app boot)**

Modify `munbeop/app/app.vue`:

```vue
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { init } = useAuth()
onMounted(() => {
  void init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 4: Verify**

```bash
cd munbeop
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/layout/AccountWidget.vue \
        munbeop/app/components/layout/AppSidebar.vue \
        munbeop/app/app.vue
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "feat(layout): AccountWidget in sidebar + auth init on app boot [Task 14]"
git push
```

---

## Task 15: Vercel env vars + production deploy

**Files:** (no code changes — pure deploy config)

- [ ] **Step 1: Verify Vercel env vars from Task 2 are set**

In Vercel dashboard → Settings → Environment Variables, confirm:

- `NUXT_PUBLIC_SUPABASE_URL` (all environments)
- `NUXT_PUBLIC_SUPABASE_ANON_KEY` (all environments)
- `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview only)
- `NUXT_PUBLIC_APP_URL` (all envs; production value: `https://<your-vercel-domain>.vercel.app`)

- [ ] **Step 2: Trigger a fresh deploy**

Either:
- Push any commit to the production branch (Vercel auto-deploys), OR
- Click "Redeploy" on the latest deployment

Wait for build to succeed (~2 min).

- [ ] **Step 3: Live smoke test**

Open the production URL in an incognito window:

1. ✅ Page loads, sidebar visible
2. ✅ LocaleSwitcher changes locale; persists across reload
3. ✅ `/practice` works in anonymous mode (data goes to localStorage)
4. ✅ Click "Sign in" in sidebar → `/auth/sign-in` shows
5. ✅ Sign up with a new email → magic link arrives in inbox
6. ✅ Click magic link → `/auth/callback` → redirects to `/`
7. ✅ Sidebar now shows "Signed in as <email>" + sign-out button
8. ✅ Write a sentence → reload page → sentence still there (Supabase persistence)
9. ✅ Open another browser → sign in → same data visible (cross-device sync)
10. ✅ Sign out → sidebar reverts to anonymous banner

- [ ] **Step 4: Manual smoke notes**

If any step fails:
- Check browser console for errors
- Check Vercel function logs (`Vercel Dashboard → Logs`)
- Check Supabase logs (`Supabase Dashboard → Logs → Edge Functions / API`)

- [ ] **Step 5: Document the production URL**

Update root `README.md` — replace "Live app" section:

```markdown
## Live deployments

- **Legacy v2.22** (GitHub Pages): https://jahnielkr.github.io/munbeop-garden/
- **v3 Nuxt 4** (Vercel): https://<your-vercel-domain>.vercel.app
```

- [ ] **Step 6: Commit doc update**

```bash
git add README.md
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "docs: add v3 Vercel production URL [Task 15]"
git push
```

---

## Task 16: Final smoke + tag

- [ ] **Step 1: Full local verify**

```bash
cd munbeop
pnpm test       # all tests pass (~55+)
pnpm lint       # 0 errors
pnpm typecheck  # 0 errors
pnpm build      # success
```

- [ ] **Step 2: Final commit (if any pending doc tweaks) + tag**

```bash
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  tag -a plan2-supabase-auth-sync \
  -m "Plan 2: Supabase + Auth + Cloud Sync"
git push --follow-tags
```

- [ ] **Step 3: Update Roadmap section of root `README.md`**

```markdown
## Estado del rewrite

✅ Plan 1 (Foundation MVP + i18n) — Nuxt 4, SRS, 46 tests, 8 locales
✅ Plan 2 (Supabase + Auth + Sync) — login, cloud persistence, multi-device sync
🚧 Próximos: Plan 3 (IA validadora), Plan 4 (Mazmorra), Plan 5 (Mascota), ...
```

```bash
git add README.md
git -c user.email="koreadesconocido@gmail.com" -c user.name="koreadesconocido" \
  commit -m "docs: mark Plan 2 complete in roadmap"
git push
```

---

## Self-Review

**1. Spec coverage:**
- Async storage ✅ Task 6+7
- Supabase project + creds ✅ Task 2 (user action)
- Schema + RLS + seed ✅ Tasks 3, 4, 5
- SupabaseAdapter ✅ Task 11
- Auth flow ✅ Tasks 9, 10
- Facade picking adapter ✅ Task 12
- Migration localStorage → Supabase ✅ Task 13
- Account widget ✅ Task 14
- Vercel env vars + deploy ✅ Task 15
- Locale stays per-device ✅ Task 12 (locale.ts uses LocalStorageAdapter directly)
- i18n keys for auth/sync ✅ Task 10

**2. Placeholders:** zero. All SQL is concrete, all code blocks are complete, every command is exact. Translations for `th/id/vi/ja/fr/pt-BR` for the auth UI block in Task 10 Step 1 are described per-locale; the implementer must complete each locale file using the en.json shape as the contract.

**3. Type consistency:** `StorageAdapter` async throughout; `AuthUser`/`AuthSession` aliased from `@supabase/supabase-js`; `LocaleCode`, `LocalizedString`, `Grammar`, `Context`, `LogEntry`, `SrsState` from `~/lib/domain` (Plan 1) unchanged. The `MigrationResult` interface is internal to migration.ts. `MasteryInfo.labelKey` (Plan 1) used identically.

---

## Execution Handoff

Plan complete and saved. Tasks 2 and 15 require user action outside the codebase (Supabase project creation, Vercel env var input, live smoke test). All other tasks are mechanical implementation following the verify-before-commit discipline established at the end of Plan 1.
