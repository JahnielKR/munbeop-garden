# Settings "free wins" — design spec

_Date: 2026-06-14 · Feature #2 from the settings overhaul plan ([../plans/2026-06-14-settings-overhaul.md](../plans/2026-06-14-settings-overhaul.md))_

## Problem

Three low-effort, high-value gaps from the audit:

1. **Stale legal/marketing copy.** `policies.vue:21` ("Local-only mode keeps everything on your device until you sign in") and `pricing.vue:26` (Sprout bullet "Local-only progress") advertise a removed capability — accounts are mandatory and all data syncs to Supabase. The policies claim is actively misleading in a legal document.
2. **Legal docs unreachable from the authenticated app.** `/policies`, `/pricing`, `/features` links live only in `WelcomeNavLinks.vue` (the pre-auth welcome sidebar). A signed-in user has no in-product path to the privacy policy. Cheapest real compliance gap.
3. **No data export.** `policies.vue` ("your data is yours to take with you") and `pricing.vue` ("Backup & restore") promise portability, but there is no export. The `SupabaseAdapter.read()` already returns every table as plain JS, so a client-side JSON download is straightforward.

## Decisions (confirmed with user)

- **Export scope:** complete backup — read all 7 syncable keys (grammar [catalog ∪ custom], srs, log, decks, customContexts, inactiveContextIds, settings). Nothing the user owns is lost (incl. their 328 custom grammars, which are entangled with the catalog read). Accepts ~300 shared catalog rows in the file. No new adapter code.
- **About & Legal card:** links to Policies + Pricing + Features (reusing existing `welcome.menu.*` labels) + a Contact mailto.
- **Copy wording:** as proposed below.

## Decisions (internal, made during design)

- Two separate settings cards ("Data & privacy" with the export button, "About & Legal" with links + contact), consistent with the existing one-concern-per-card pattern. Not a combined card; not the larger `SettingsSection` IA refactor (out of scope).
- Export includes the `settings` key (which already carries theme + locale) rather than a separate `locale` key. No "app version" (package.json has no `version` field).
- Legal pages keep their `layout: false, surface: 'welcome'` chrome; settings links out to them as-is (acceptable surface switch for low-frequency legal pages — no app-surface variant in scope).
- Policies/pricing body text is hardcoded English in the SFCs today (not i18n); the copy fix edits those strings directly. (Real localized legal text is a separate TODO(v8.1).)

## Architecture

### 1. Copy fix
- `munbeop/app/pages/policies.vue` — Privacy body (line ~21): replace
  `'We store your email, your sentences, and your mastery progress. We do not sell your data. Local-only mode keeps everything on your device until you sign in.'`
  with
  `'We store your email, your sentences, and your mastery progress, and sync them to your account so they follow you across devices. We do not sell your data.'`
- `munbeop/app/pages/pricing.vue` — Sprout `bullets` (line ~26): replace `'Local-only progress'` with `'Grammar mastery tracking'`.
- The Cookies body (`policies.vue:29`, "...remember your theme, your locale...") stays accurate (localStorage is still the device cache) — unchanged.

### 2. About & Legal card — `munbeop/app/components/settings/AboutSection.vue`
- Renders a `BilingualTitle` (ko + `t('settings.about.title')`, level h2) and a list of three `NuxtLink`s (`to="/policies" | "/pricing" | "/features"`, labels `t('welcome.menu.policies' | '...pricing' | '...features')`) plus a contact row: `<a href="mailto:hello@mungarden.app">{{ t('settings.about.contact') }}</a>`.
- No new logic; pure presentational. Mounted in `settings.vue` as a card.

### 3. Data export — `munbeop/app/composables/useDataExport.ts`
- `EXPORT_KEYS` = `[grammar, srs, log, decks, customContexts, inactiveContextIds, settings]` (from `STORAGE_KEYS`).
- `collectExportData(): Promise<{ exportedAt: string; app: string; data: Record<string, unknown> }>` — uses `useStorageAdapter()`; reads each key (`Promise.all`) with a safe per-key fallback (`null`); returns `{ exportedAt: new Date().toISOString(), app: 'munbeop-garden', data }`.
- `downloadJson(obj: unknown, filename: string): void` — `new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })` → `URL.createObjectURL` → click a transient `<a download>` → `URL.revokeObjectURL`.
- `exportData(): Promise<void>` — `collectExportData()` → `downloadJson(payload, 'mungarden-export-<YYYY-MM-DD>.json')` → `useToast().success(t('settings.data.exported'))`; on throw, `useToast().error(...)`. Wrapped so a failure surfaces a toast, never an unhandled rejection.
- "Data & privacy" card in `settings.vue` with a `Button` calling `exportData()`.

### 4. i18n (`munbeop/i18n/locales/*.json`, all 8) — new keys
| key | English |
|---|---|
| `settings.about.title` | "About & legal" |
| `settings.about.contact` | "Contact" |
| `settings.data.title` | "Data & privacy" |
| `settings.data.export` | "Export my data (.json)" |
| `settings.data.exported` | "Your data is downloading." |

The three link labels reuse the existing `welcome.menu.{policies,pricing,features}` keys (no new label keys). 화이팅 / Korean particles untouched.

## Testing (TDD)

- **`tests/unit/settings/stale-copy.test.ts`** (`// @vitest-environment node`) — read `policies.vue` and `pricing.vue` source via `readFileSync`; assert neither contains the string `"Local-only"`; assert `policies.vue` contains `"sync them to your account"` (the new wording). Guards against regression.
- **`tests/unit/settings/i18n-free-wins-keys.test.ts`** — parity: every new `settings.about.*` / `settings.data.*` key resolves to a non-empty string in all 8 locales (mirrors the existing `i18n-contexts-keys` test).
- **`tests/components/settings/AboutSection.test.ts`** — mount; assert three internal links resolve to `/policies`, `/pricing`, `/features` and a `mailto:hello@mungarden.app` link is present. (Verify how the test harness's `#components` stub renders `NuxtLink` — assert on `to`/`href` accordingly.)
- **`tests/unit/composables/useDataExport.test.ts`** — `vi.mock('~/composables/useStorageAdapter')` returning an adapter whose `read` yields a marker per key; assert `collectExportData()` returns `{ exportedAt, app: 'munbeop-garden', data }` with all 7 `EXPORT_KEYS` present and the read values mapped under their keys. (The `downloadJson` DOM path is exercised lightly or left to manual/preview; the data assembly is the logic worth testing.)
- Full suite + `pnpm typecheck` + `pnpm lint` green.

## Risks / notes

- **No god files:** one small presentational component, one small composable (split into collect/download/orchestrate), copy edits, i18n additions.
- **Export file size:** the complete-backup choice includes the ~300-row shared catalog. Acceptable per the decision; documented so a future "personal-only" variant is an informed change.
- **Auth-gated verification:** settings is behind the mandatory-auth middleware and the worktree has no Supabase `.env`, so live browser verification isn't feasible here — behavioral proof is the unit/component tests (same as features #3/#1).
- **mailto / external links:** the contact link is a `mailto:`; the three NuxtLinks are internal public routes (`PUBLIC_PATHS`). No external/untrusted destinations.

## Out of scope

Localized legal text (TODO v8.1), an app-surface variant of the legal pages, "reset to defaults", account deletion, billing — all later.
