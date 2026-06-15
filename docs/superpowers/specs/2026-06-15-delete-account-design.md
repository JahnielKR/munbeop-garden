# Delete account (Tanda 2) — design spec

_Date: 2026-06-15 · Part 2 of 3 of the settings-UX overhaul (tabs → **delete account** → sidebar quick-menu)_

## Problem

Accounts are mandatory and hold PII (email + authored sentences + progress), but there is no self-service account deletion — a 🔴 right-to-erasure gap. The anon Supabase client cannot delete its own `auth.users` row; it needs a privileged server-side path. The DB is already cascade-ready (`ON DELETE CASCADE` on all 7 `user_*` tables), so deleting the auth user wipes everything.

## Goal

Add a "Danger zone" in the settings Account tab that permanently deletes the account after a typed **`DELETE`** confirmation, backed by the project's first Supabase Edge Function (service-role → `auth.admin.deleteUser`).

Non-goals: account recovery/undo, soft-delete, data-retention windows, the sidebar quick-menu (Tanda 3).

## Decisions (confirmed with user)

- The Edge Function is **written here but deployed by the user** (`supabase functions deploy delete-account`).
- Confirmation = typing the literal word **`DELETE`** (language-independent; works for Kakao/Google/email users alike).

## Decisions (internal)

- `DangerZone.vue` is its own component (clarity + testability), mounted in the Account panel below `AccountWidget`.
- After a successful delete, reuse the existing `signOutAndExit()` flow (sign out locally + redirect to `/welcome`; the `onAuthStateChange` SIGNED_OUT handler also clears stores). On failure, an error toast; the modal closes.
- **No real deletion is tested against Supabase** — only unit tests with mocked `functions.invoke` / `deleteAccount`. (Deleting a real account is irreversible.)
- The Deno Edge Function must be excluded from `eslint .` (it uses `Deno` globals + URL imports). `nuxt typecheck` already ignores `supabase/` (its tsconfigs only reference the Nuxt app dirs), so only an eslint ignore is needed.

## Architecture

### 1. Edge Function — `supabase/functions/delete-account/index.ts` (Deno)

- Handles CORS (`OPTIONS` preflight + `Access-Control-Allow-Origin: *` etc.; the function is JWT-gated so `*` is acceptable).
- Reads the request `Authorization` header; builds an **anon** client with that header and calls `auth.getUser()` to verify the caller (401 if missing/invalid).
- Builds a **service-role** client from the auto-injected `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env, calls `auth.admin.deleteUser(user.id)`. The FK cascade wipes the 7 `user_*` tables. Returns `{ ok: true }` (200) or `{ error }` (4xx/5xx).
- `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`; served with `Deno.serve(...)`.
- **Gate exclusion:** add `'supabase/functions/**'` to the `ignores` array in `munbeop/eslint.config.mjs`.
- **Deploy (user, documented in the plan):** `supabase functions deploy delete-account` against the Mungander project. Until deployed, `deleteAccount()` returns an error → an error toast; nothing breaks.

### 2. Client — `useAuth().deleteAccount()`

```ts
async function deleteAccount() {
  const { error } = await $supabase.functions.invoke('delete-account')
  if (error) return { error }
  return signOutAndExit()   // sign out + redirect /welcome (existing)
}
```
Add `deleteAccount` to the returned object. `functions.invoke` auto-attaches the user's JWT.

### 3. UI — `app/components/settings/DangerZone.vue`

- A destructive `<section>` (accent `--danger`): `t('settings.account.danger.title')` + description + a `Button variant="danger"` ("Delete account", class `danger__open`) that opens a `Modal`.
- Modal body: warning text + a `Field`/`Input` (`id="del-confirm"`, `v-model` `confirmText`, placeholder `DELETE`); a `canDelete = computed(() => confirmText.value === 'DELETE')`.
- Footer: secondary "Cancel" + danger "Delete forever" (class `danger-confirm`, `:disabled="!canDelete || busy"`, `:loading="busy"`). Confirm → `busy=true` → `await useAuth().deleteAccount()` → on `{error}` show `useToast().error(...)` + close; on success the call redirects away.
- Reuses `Modal`, `Button`, `Field`, `Input`, `useToast`.

### 4. Mount — `app/pages/settings.vue`

In the existing `<section id="panel-account">`, add `<DangerZone />` after `<AccountWidget />`.

### 5. i18n (`i18n/locales/*.json`, all 8) — new `settings.account.danger.*`

| key | English |
|---|---|
| `title` | "Danger zone" |
| `description` | "Permanently delete your account and all your data. This can't be undone." |
| `button` | "Delete account" |
| `modal_title` | "Delete your account?" |
| `modal_body` | "This permanently deletes your account, your sentences, progress, decks, and custom grammar. This cannot be undone." |
| `confirm_label` | "Type DELETE to confirm" |
| `confirm_button` | "Delete forever" |
| `cancel` | "Cancel" |
| `error` | "Couldn't delete your account. Please try again." |

(The typed word stays literal `DELETE` in every locale; only the surrounding label is translated.) 화이팅 / Korean untouched.

## Testing (TDD)

- **`tests/unit/settings/edge-delete-account.test.ts`** (`// @vitest-environment node`) — read the function source; assert it calls `auth.getUser()`, uses `SUPABASE_SERVICE_ROLE_KEY`, calls `auth.admin.deleteUser`, and handles `OPTIONS` + `Access-Control-Allow-Origin`. (The Deno function isn't executed in the Node/Vitest harness; this is a structural guard like the migration smoke test.)
- **`tests/composables/useAuth.deleteAccount.test.ts`** — stub `useNuxtApp` (`$supabase.functions.invoke` + `auth.signOut`), `useRouter` (`push`), `useAuthStore`, and `vi.mock` the data stores (mirroring the existing `useAuth.signInWithProvider` test): success → `invoke('delete-account')` then `signOut` + `push('/welcome')`, returns `{error:null}`; failure → returns the error, NO sign-out.
- **`tests/components/settings/DangerZone.test.ts`** — `vi.stubGlobal('useAuth', () => ({ deleteAccount: spy }))`; opening the modal then typing the wrong word keeps the confirm button `disabled`; typing `DELETE` enables it; clicking it calls `deleteAccount`.
- **`tests/unit/settings/i18n-danger-keys.test.ts`** — parity of all 9 `settings.account.danger.*` keys across 8 locales.
- Full suite + `pnpm typecheck` + `pnpm lint` green (lint must stay 0 errors → the eslint ignore for `supabase/functions/**` is part of Task 1).

## Risks / notes

- **First server-side surface:** introduces `supabase/functions/`. Keep the function self-contained; document the deploy command + that the service-role key is auto-injected by Supabase (no secret to set manually).
- **Gate safety:** the eslint ignore is essential — without it `eslint .` lints the Deno file and fails on `Deno`/URL imports. Verified `nuxt typecheck` doesn't include `supabase/`.
- **Destructive + irreversible:** typed-`DELETE` gate + a danger-styled modal; no real deletion exercised in tests.
- **Pre-deploy behavior:** before the function is deployed, `invoke` returns an error → the UI shows the error toast. Acceptable interim (the button is honest about needing the backend).
- **No god files:** one Deno function, one small composable method, one component.

## Out of scope → next tanda

- **Tanda 3:** sidebar profile avatar (initials circle) → quick popover menu (sign out · language · light/dark · open settings), replacing the sidebar `AccountWidget`.
