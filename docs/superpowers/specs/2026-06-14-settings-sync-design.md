# Account-synced preferences (`user_settings`) — design spec

_Date: 2026-06-14 · Feature #1 from the settings overhaul plan ([../plans/2026-06-14-settings-overhaul.md](../plans/2026-06-14-settings-overhaul.md))_

## Problem

Accounts are mandatory (since 2026-06-11), but the two existing preferences — theme and UI locale — live in per-device `localStorage` and never sync. `useTheme` writes `localStorage['mungarden:theme']` raw; `useLocaleStore` uses `LocalStorageAdapter` directly (bypassing `pickAdapter`) specifically to stay device-local; the `SupabaseAdapter` no-ops the `locale` key. So a learner who signs in on a second device re-picks light/English. There is no `user_settings` table and no preferences store.

This is the keystone of the settings overhaul: one synced table + a coordinating store unblocks account-level prefs (and later audio, reduce-motion, text-size, reminders, consent — all via the same jsonb blob, no further migrations).

## Goal

Make **theme and locale follow the account** across devices, while preserving the synchronous-localStorage FOUC mechanism. Establish the reusable `user_settings` + `useSettings` foundation so future prefs are a one-line addition to a typed object.

Non-goals (this feature): audio toggles, garden-pin, reduce-motion, any new settings UI, applying the migration to the production database (file only).

## Decisions (confirmed with user)

- **Schema:** a single `prefs jsonb` blob (extensible; the whole settings object round-trips as one JSON, matching the app's "pass the full collection" adapter pattern). No per-pref columns.
- **Scope:** theme + locale only.
- **Theme cross-device:** account-synced. `localStorage` is the device cache + FOUC seed; **cloud wins on hydrate**. A brand-new device may show a one-time light→dark flash on first load (empty cache + cloud=dark), then it's cached. Accepted.
- **Migration:** write the SQL file only. Do NOT apply to the production Supabase. Code is built/tested with a mocked adapter.

## Architecture

The design philosophy here is "no god files / follow existing patterns": `useSettings` is one focused store that owns only the **cloud half + orchestration**. The **device half** (DOM write, localStorage, FOUC hydrate) stays in `useTheme` and `useLocaleStore`, untouched. Dual-write = device setter writes localStorage; `useSettings` writes cloud.

### 1. Migration — `supabase/migrations/20260614000001_user_settings.sql`

```sql
-- user_settings — one row per user holding account-synced UI preferences
-- as a jsonb blob (theme, locale, and future prefs). RLS mirrors the
-- per-owner pattern used by the six existing user_* tables.
CREATE TABLE public.user_settings (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prefs      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_owner_select" ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings_owner_insert" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_owner_update" ON public.user_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_owner_delete" ON public.user_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### 2. Storage layer

- `app/lib/storage/keys.ts`: add `settings: 'munbeop.v1.settings'` to `STORAGE_KEYS`.
- `app/lib/storage/supabase.ts`: add a `settings` case.
  - `read(settings, fallback)`: `select prefs from user_settings where user_id = this.userId` (`.maybeSingle()`); return `row?.prefs ?? fallback`.
  - `write(settings, value)`: `upsert({ user_id, prefs: value, updated_at: now }, { onConflict: 'user_id' })`.
- `NoopStorageAdapter` already returns `fallback` / no-ops — no change.
- `SupabaseAdapter.clear()`: **do NOT** add `user_settings`. Resetting learning progress must not reset theme/locale. Account deletion still cleans it via `ON DELETE CASCADE`.

### 3. Store — `app/stores/settings.ts` (`useSettings`)

```ts
type Theme = 'light' | 'dark'
interface Settings { theme: Theme; locale: LocaleCode }
```

- `hydrate(): Promise<void>` — if there is no session (`!authStore.user`), return (device values stand; never reset). If authed: `read(STORAGE_KEYS.settings, null)` via `useStorageAdapter()`, **wrapped in try/catch** — a missing table (migration not yet deployed) or network error is swallowed and device values are kept, so the live app never breaks. If a valid blob comes back, apply **cloud-wins**: validate `theme ∈ {'light','dark'}` → `useTheme().setTheme(theme)`; validate `locale ∈ LOCALE_CODES` → `useLocaleStore().set(locale)`. Invalid/missing fields are ignored (device value kept).
- `setTheme(t: Theme): Promise<void>` — `useTheme().setTheme(t)` (device), then `persistCloud()`.
- `setLocale(l: LocaleCode): Promise<void>` — `useLocaleStore().set(l)` (device), then `persistCloud()`.
- `persistCloud(): Promise<void>` — `useStorageAdapter().write(STORAGE_KEYS.settings, { theme: useTheme().theme.value, locale: useLocaleStore().current })`. Supabase when authed, noop otherwise.

`useSettings` deliberately does **not** call `i18n.setLocale` (avoids `useI18n()` inside a Pinia store). i18n application stays in components (the established pattern in `default.vue`/`LocaleSwitcher`).

### 4. Integration points (small edits)

- **`app/layouts/default.vue`** onMounted: after the existing `localeStore.hydrate()`, call `await useSettings().hydrate()` (cloud overrides theme via `useTheme`, and `localeStore.current` via `localeStore.set`), then the existing `if (locale.value !== localeStore.current) setLocale(localeStore.current)` applies the final locale to i18n. Theme needs no i18n step.
- **`app/components/layout/LocaleSwitcher.vue`**: on change, keep `setLocale(l)` (i18n) but replace the direct `localeStore.set(l)` with `useSettings().setLocale(l)` (which calls `localeStore.set` + cloud persist). Covers both mount points (sidebar + settings).
- **`app/pages/settings.vue`**: the dark-mode toggle's setter calls `useSettings().setTheme(...)` instead of `useTheme().setTheme(...)`.
- **`app/composables/useAuth.ts`** `onAuthStateChange`: add a branch — on `'SIGNED_IN'` or `'INITIAL_SESSION'` *with* a session, call `useSettings().hydrate()` (applies cloud theme immediately via DOM; locale re-applies when `default.vue` (re)mounts on the post-sign-in navigation from `/welcome`). Do **not** add settings to the `SIGNED_OUT` clear path.

### 5. Data flow

| Scenario | Behavior |
|---|---|
| Load, known device | FOUC paints theme from localStorage → app mounts → `useSettings.hydrate()` reconciles from cloud (usually identical → no flash). |
| Load, brand-new device | FOUC paints light → cloud says dark → one-time light→dark flash, then cached. |
| Change theme/locale | Device setter (localStorage + apply) + cloud write. |
| Sign-in | `hydrate()` applies the account's prefs. |
| Sign-out | Device prefs remain (no theme/locale jump). |

### 6. Testing (TDD)

- **`tests/unit/stores/settings.test.ts`** — mock `~/composables/useStorageAdapter` (so the cloud adapter is controllable) and use real `useTheme`/`useLocaleStore` (pinia + happy-dom localStorage):
  - `hydrate` with an authed adapter returning `{theme:'dark', locale:'es'}` applies both (cloud-wins over a device default).
  - `hydrate` with no session (adapter read → fallback / `authStore.user` null) leaves device values untouched.
  - `hydrate` ignores an invalid blob (bad theme / unknown locale) and keeps device values.
  - `setTheme('dark')` calls `useTheme.setTheme` and writes `{theme:'dark', locale}` to the adapter.
  - `setLocale('ja')` calls `localeStore.set` and writes `{theme, locale:'ja'}`.
- **`tests/unit/storage/supabase.test.ts`** (extend) — the `settings` read returns `prefs` (and `fallback` when no row); `write` upserts `{user_id, prefs, updated_at}`.
- **`tests/components/layout/LocaleSwitcher.test.ts`** (new or extend) — selecting a locale calls `useSettings().setLocale`.
- **Migration smoke test** `tests/unit/settings/migration-user-settings.test.ts` — read the SQL file; assert it creates `public.user_settings`, has `ENABLE ROW LEVEL SECURITY`, and four `auth.uid() = user_id` owner policies. (Cheap guard that the file isn't dropped/edited away.)
- Full suite + `pnpm typecheck` + `pnpm lint` green.

## Edge cases & risks

- **FOUC vs sync:** theme is read synchronously by the inline `app.vue` boot script and cannot `await` Supabase. Design treats localStorage as the FOUC seed/cache and cloud as the post-hydrate source of truth — the one-time flash on a fresh device is the accepted cost.
- **No reset on sign-out:** `useSettings.hydrate()` is intentionally excluded from the `SIGNED_OUT` path so the theme/locale don't jump on logout. Only data stores clear on sign-out.
- **i18n context:** locale application to i18n stays in components; the store only manages the persisted value + `localeStore`. Prevents the known `useI18n()`-outside-component fatal.
- **Migration not applied to prod:** until the file is deployed to Supabase, an authed `read('settings')` will error (`relation "user_settings" does not exist`). The store's `hydrate()` must tolerate a read failure gracefully (catch → keep device values) so the live app doesn't break before the migration is deployed. (Add a try/catch in `hydrate`/`persistCloud`.)
- **No god files:** `useSettings` is a small focused store; device layer untouched; integration edits are one- or two-liners.

## Out of scope / follow-ups

Audio toggles, garden-pin, reduce-motion, text-size, reminders, consent — all later, each a field added to the `prefs` blob + a control, no migration. A settings "reset to defaults" can later call `useSettings` to restore + persist.
