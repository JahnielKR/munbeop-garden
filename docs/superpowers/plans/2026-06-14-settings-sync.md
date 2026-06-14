# Account-synced preferences (`user_settings`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make theme + UI locale follow the user's account across devices via a new `user_settings` table and a coordinating `useSettings` store, preserving the synchronous-localStorage FOUC mechanism.

**Architecture:** A `prefs jsonb` table (one row per user). A `useSettings` Pinia store owns the cloud half + orchestration (dual-write: device setters keep writing localStorage; `useSettings` writes cloud; cloud wins on hydrate). `useTheme`/`useLocaleStore` stay the device/FOUC layer, untouched. Integration is small edits to `default.vue`, `LocaleSwitcher.vue`, `settings.vue`, `useAuth.ts`.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, Pinia setup-stores, Supabase (Postgres + RLS), @nuxtjs/i18n, Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-14-settings-sync-design.md](../specs/2026-06-14-settings-sync-design.md)

**Conventions for every commit:**
- Run `pnpm` from `munbeop/` (e.g. `cd munbeop && pnpm ...`).
- End every commit message with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Tests under `munbeop/tests/`; source under `munbeop/app/`; migrations under `munbeop/supabase/migrations/`.

---

### Task 1: `user_settings` migration + smoke test

**Files:**
- Create: `munbeop/supabase/migrations/20260614000001_user_settings.sql`
- Test: `munbeop/tests/unit/settings/migration-user-settings.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/unit/settings/migration-user-settings.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sql = readFileSync(
  fileURLToPath(
    new URL('../../../supabase/migrations/20260614000001_user_settings.sql', import.meta.url),
  ),
  'utf8',
)

describe('user_settings migration', () => {
  it('creates the table with a user_id PK, jsonb prefs, and cascade FK', () => {
    expect(sql).toMatch(/create table public\.user_settings/i)
    expect(sql).toMatch(/user_id\s+uuid\s+primary key/i)
    expect(sql).toMatch(/prefs\s+jsonb/i)
    expect(sql).toMatch(/references auth\.users\(id\) on delete cascade/i)
  })

  it('enables RLS and defines four owner policies', () => {
    expect(sql).toMatch(/enable row level security/i)
    expect((sql.match(/auth\.uid\(\) = user_id/gi) ?? []).length).toBeGreaterThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails** — `cd munbeop && pnpm test -- tests/unit/settings/migration-user-settings.test.ts` → FAIL (file not found / ENOENT).

- [ ] **Step 3: Write the migration** — create `munbeop/supabase/migrations/20260614000001_user_settings.sql`:

```sql
-- 20260614000001_user_settings.sql
-- Account-synced UI preferences (theme, locale, and future prefs) as a
-- jsonb blob, one row per user. RLS mirrors the per-owner pattern used by
-- the six existing user_* tables (see 20260603000002_rls_policies.sql).

CREATE TABLE public.user_settings (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prefs      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_owner_select" ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_insert" ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_update" ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_owner_delete" ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

- [ ] **Step 4: Run test to verify it passes** — `cd munbeop && pnpm test -- tests/unit/settings/migration-user-settings.test.ts` → PASS (2 tests).

- [ ] **Step 5: Commit**

```
cd munbeop && git add supabase/migrations/20260614000001_user_settings.sql tests/unit/settings/migration-user-settings.test.ts
git commit -m "feat(settings): add user_settings table + RLS migration"
```

---

### Task 2: `STORAGE_KEYS.settings` + `SupabaseAdapter` settings case

**Files:**
- Modify: `munbeop/app/lib/storage/keys.ts`
- Modify: `munbeop/app/lib/storage/supabase.ts`
- Test: `munbeop/tests/unit/storage/supabase.test.ts` (extend)

- [ ] **Step 1: Write the failing test** — in `munbeop/tests/unit/storage/supabase.test.ts`:

(a) Add `user_settings: []` to the `data` object inside `makeMockClient` (the record literal currently lists `grammars … user_inactive_contexts`). It becomes:
```ts
    user_inactive_contexts: [],
    user_settings: [],
```

(b) Add these tests — a read case inside the `describe('read', …)` block and a write case inside `describe('write', …)`:
```ts
    it('settings: returns the prefs blob of the user row', async () => {
      client.data.user_settings = [{ prefs: { theme: 'dark', locale: 'es' } }]
      const v = (await adapter.read(STORAGE_KEYS.settings, null)) as { theme: string; locale: string } | null
      expect(v).toEqual({ theme: 'dark', locale: 'es' })
    })

    it('settings: returns fallback when the user has no row', async () => {
      const v = await adapter.read(STORAGE_KEYS.settings, { theme: 'light', locale: 'en' })
      expect(v).toEqual({ theme: 'light', locale: 'en' })
    })
```
```ts
    it('settings: upserts the prefs blob with user_id', async () => {
      await adapter.write(STORAGE_KEYS.settings, { theme: 'dark', locale: 'ja' })
      const upsert = client.writes.find((w) => w.table === 'user_settings' && w.op === 'upsert')
      expect(upsert).toBeDefined()
      const row = upsert!.payload as { user_id: string; prefs: { theme: string; locale: string } }
      expect(row.user_id).toBe(USER)
      expect(row.prefs).toEqual({ theme: 'dark', locale: 'ja' })
    })
```

- [ ] **Step 2: Run test to verify it fails** — `cd munbeop && pnpm test -- tests/unit/storage/supabase.test.ts` → the 3 new tests fail (`STORAGE_KEYS.settings` undefined; settings falls through to `default` returning fallback / no-op so the read returns fallback not the blob, and no upsert recorded).

- [ ] **Step 3: Write the implementation**

(a) In `munbeop/app/lib/storage/keys.ts`, add the key inside `STORAGE_KEYS`:
```ts
  locale: 'munbeop.v1.locale',
  settings: 'munbeop.v1.settings',
```

(b) In `munbeop/app/lib/storage/supabase.ts`, add a `read` case (before `case STORAGE_KEYS.locale:`):
```ts
      case STORAGE_KEYS.settings: {
        const res = await this.client
          .from('user_settings')
          .select('prefs')
          .eq('user_id', this.userId)
        const rows = ((res as unknown as { data: Array<{ prefs: unknown }> | null }).data) ?? []
        return (rows.length && rows[0]?.prefs != null ? rows[0].prefs : fallback) as T
      }
```
and a `write` case (before `case STORAGE_KEYS.locale:`):
```ts
      case STORAGE_KEYS.settings: {
        await this.client.from('user_settings').upsert({
          user_id: this.userId,
          prefs: value as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        return
      }
```

- [ ] **Step 4: Run test to verify it passes** — `cd munbeop && pnpm test -- tests/unit/storage/supabase.test.ts` → PASS (existing + 3 new).

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/lib/storage/keys.ts app/lib/storage/supabase.ts tests/unit/storage/supabase.test.ts
git commit -m "feat(settings): persist a settings prefs blob via SupabaseAdapter"
```

---

### Task 3: `useSettings` store

**Files:**
- Create: `munbeop/app/stores/settings.ts`
- Test: `munbeop/tests/unit/stores/settings.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/unit/stores/settings.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme } from '~/composables/useTheme'

const mockRead = vi.fn()
const mockWrite = vi.fn()
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: mockRead,
    write: mockWrite,
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}))

function signIn() {
  // The settings store only reads cloud when a user is present.
  useAuthStore().user = { id: 'u-1' } as never
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockRead.mockReset()
    mockWrite.mockReset()
    // Reset the module-singleton theme to the default between tests.
    useTheme().setTheme('light')
  })

  it('hydrate applies the cloud blob (cloud wins over device defaults)', async () => {
    signIn()
    mockRead.mockResolvedValue({ theme: 'dark', locale: 'es' })
    await useSettingsStore().hydrate()
    expect(useTheme().theme.value).toBe('dark')
    expect(useLocaleStore().current).toBe('es')
  })

  it('hydrate does nothing when there is no session', async () => {
    mockRead.mockResolvedValue({ theme: 'dark', locale: 'es' })
    await useSettingsStore().hydrate()
    expect(mockRead).not.toHaveBeenCalled()
    expect(useTheme().theme.value).toBe('light')
  })

  it('hydrate ignores an invalid blob and keeps device values', async () => {
    signIn()
    mockRead.mockResolvedValue({ theme: 'purple', locale: 'xx' })
    await useSettingsStore().hydrate()
    expect(useTheme().theme.value).toBe('light')
    expect(useLocaleStore().current).toBe('en')
  })

  it('hydrate swallows a read error (e.g. table not deployed) and keeps device values', async () => {
    signIn()
    mockRead.mockRejectedValue(new Error('relation "user_settings" does not exist'))
    await expect(useSettingsStore().hydrate()).resolves.toBeUndefined()
    expect(useTheme().theme.value).toBe('light')
  })

  it('setTheme applies the theme and writes the full blob to the adapter', async () => {
    await useSettingsStore().setTheme('dark')
    expect(useTheme().theme.value).toBe('dark')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'dark', locale: 'en' })
  })

  it('setLocale applies the locale and writes the full blob to the adapter', async () => {
    await useSettingsStore().setLocale('ja')
    expect(useLocaleStore().current).toBe('ja')
    expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'light', locale: 'ja' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails** — `cd munbeop && pnpm test -- tests/unit/stores/settings.test.ts` → FAIL (store does not exist).

- [ ] **Step 3: Write the store** — create `munbeop/app/stores/settings.ts`:

```ts
import { defineStore } from 'pinia'
import { LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useLocaleStore } from '~/stores/locale'
import { useTheme, type Theme } from '~/composables/useTheme'

/**
 * useSettings — account-synced UI preferences (theme, locale).
 *
 * Owns only the CLOUD half + orchestration. The device half (DOM write,
 * localStorage, FOUC) stays in useTheme()/useLocaleStore(): a change writes
 * localStorage via those setters AND the cloud blob via the adapter
 * (dual-write); on hydrate the cloud blob wins. Reads/writes are wrapped in
 * try/catch so a not-yet-deployed table or a network blip never breaks the
 * app — device values simply stand.
 */
interface Settings {
  theme: Theme
  locale: LocaleCode
}

function isTheme(v: unknown): v is Theme {
  return v === 'light' || v === 'dark'
}
function isLocale(v: unknown): v is LocaleCode {
  return typeof v === 'string' && (LOCALE_CODES as readonly string[]).includes(v)
}

export const useSettingsStore = defineStore('settings', () => {
  const { theme, setTheme: applyTheme } = useTheme()
  const localeStore = useLocaleStore()
  const authStore = useAuthStore()

  async function hydrate(): Promise<void> {
    if (!authStore.user) return
    try {
      const storage = useStorageAdapter()
      const cloud = await storage.read<Partial<Settings> | null>(STORAGE_KEYS.settings, null)
      if (!cloud) return
      if (isTheme(cloud.theme)) applyTheme(cloud.theme)
      if (isLocale(cloud.locale)) await localeStore.set(cloud.locale)
    } catch {
      // Table may not exist yet (migration not deployed) or a network blip —
      // keep device values; the app must not break.
    }
  }

  async function persistCloud(): Promise<void> {
    try {
      const storage = useStorageAdapter()
      await storage.write(STORAGE_KEYS.settings, {
        theme: theme.value,
        locale: localeStore.current,
      } satisfies Settings)
    } catch {
      // A failed cloud write must not throw into the UI.
    }
  }

  async function setTheme(t: Theme): Promise<void> {
    applyTheme(t)
    await persistCloud()
  }

  async function setLocale(l: LocaleCode): Promise<void> {
    await localeStore.set(l)
    await persistCloud()
  }

  return { hydrate, setTheme, setLocale }
})
```

- [ ] **Step 4: Run test to verify it passes** — `cd munbeop && pnpm test -- tests/unit/stores/settings.test.ts` → PASS (6 tests).

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/stores/settings.ts tests/unit/stores/settings.test.ts
git commit -m "feat(settings): add useSettings store (account-synced theme + locale)"
```

---

### Task 4: Route `LocaleSwitcher` through `useSettings`

**Files:**
- Modify: `munbeop/app/components/layout/LocaleSwitcher.vue`
- Test: `munbeop/tests/components/layout/LocaleSwitcher.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/components/layout/LocaleSwitcher.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import { useSettingsStore } from '~/stores/settings'

// The global useI18n stub only exposes { t, locale }; LocaleSwitcher also
// needs setLocale + locales, so override it for this suite.
const setLocaleSpy = vi.fn()
vi.stubGlobal('useI18n', () => ({
  t: (k: string) => k,
  locale: { value: 'en' },
  locales: { value: [{ code: 'en', name: 'English' }, { code: 'es', name: 'Español' }] },
  setLocale: setLocaleSpy,
}))

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setLocaleSpy.mockClear()
  })

  it('routes a locale change through useSettings (so it syncs to the account)', async () => {
    const wrapper = mount(LocaleSwitcher)
    const settings = useSettingsStore()
    const spy = vi.spyOn(settings, 'setLocale').mockResolvedValue()
    await wrapper.get('select').setValue('es')
    expect(setLocaleSpy).toHaveBeenCalledWith('es')
    expect(spy).toHaveBeenCalledWith('es')
  })
})
```

- [ ] **Step 2: Run test to verify it fails** — `cd munbeop && pnpm test -- tests/components/layout/LocaleSwitcher.test.ts` → FAIL (the component still calls `localeStore.set`, not `useSettings().setLocale`, so the spy isn't hit).

- [ ] **Step 3: Edit the component** — in `munbeop/app/components/layout/LocaleSwitcher.vue` `<script setup>`, replace the locale-store import + usage with the settings store. The script block becomes:

```ts
import type { LocaleCode } from '~/lib/domain'
import { useSettingsStore } from '~/stores/settings'

const { locale, locales, setLocale, t } = useI18n()
const settings = useSettingsStore()

const options = computed(() => locales.value as Array<{ code: string; name: string }>)

function onChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value as LocaleCode
  void setLocale(code)
  void settings.setLocale(code)
}
```
(Leave the `<template>` and `<style>` unchanged. Remove the now-unused `useLocaleStore` import and `const localeStore` line.)

- [ ] **Step 4: Run test to verify it passes** — `cd munbeop && pnpm test -- tests/components/layout/LocaleSwitcher.test.ts` → PASS (1 test).

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/components/layout/LocaleSwitcher.vue tests/components/layout/LocaleSwitcher.test.ts
git commit -m "feat(settings): sync locale changes to the account via useSettings"
```

---

### Task 5: Wire hydration + theme setter + full verification

**Files:**
- Modify: `munbeop/app/layouts/default.vue`
- Modify: `munbeop/app/pages/settings.vue`
- Modify: `munbeop/app/composables/useAuth.ts`

- [ ] **Step 1: Edit `default.vue`** — apply the cloud settings after the device stores hydrate, before the i18n locale is applied. Add the import and the hydrate call.

In `<script setup>` imports, add:
```ts
import { useSettingsStore } from '~/stores/settings'
```
Replace the `onMounted` body so it reads:
```ts
onMounted(async () => {
  await Promise.all([
    useGrammarStore().hydrate(),
    useContextsStore().hydrate(),
    useSrsStore().hydrate(),
    useLogStore().hydrate(),
    localeStore.hydrate(),
  ])
  // Cloud preferences win: override the device theme/locale just loaded above.
  await useSettingsStore().hydrate()
  if (locale.value !== localeStore.current) {
    void setLocale(localeStore.current)
  }
})
```

- [ ] **Step 2: Edit `settings.vue`** — route the dark-mode toggle through `useSettings` so theme changes sync. In `<script setup>`:
  - Add `import { useSettingsStore } from '~/stores/settings'`.
  - Change the `useTheme` destructure from `const { theme, setTheme } = useTheme()` to `const { theme } = useTheme()`.
  - Add `const settings = useSettingsStore()`.
  - Change the `isDark` setter to call the store:
```ts
const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})
```

- [ ] **Step 3: Edit `useAuth.ts`** — apply cloud settings when a session is established. Add the import and a branch in the `onAuthStateChange` callback.

Add to imports:
```ts
import { useSettingsStore } from '~/stores/settings'
```
In `init()`, inside the `onAuthStateChange` callback, add the settings hydrate right after `authStore.setSession(session)` and before the `SIGNED_OUT` handling:
```ts
    $supabase.auth.onAuthStateChange(async (event, session) => {
      authStore.setSession(session)
      // Pull the account's synced preferences once a session exists. Theme
      // applies immediately (DOM write); locale re-applies when default.vue
      // (re)mounts on the post-sign-in navigation from /welcome.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        await useSettingsStore().hydrate()
      }
      if (event === 'SIGNED_OUT') {
        await hydrateDataStores()
        if (!isPublicPath(router.currentRoute.value.path)) {
          await router.push('/welcome')
        }
      }
    })
```
(Leave the rest of `init()` and the `SIGNED_OUT` body exactly as-is. Do NOT add settings to `hydrateDataStores()` — settings must not reset on sign-out.)

- [ ] **Step 4: Full verification gate**

Run: `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS. Report real totals. The `useAuth` edit must not regress `tests/composables/useAuth.signInWithProvider.test.ts`. If lint flags an unused import you introduced (e.g. a leftover in LocaleSwitcher/settings), fix only that and re-run. If anything else fails, STOP and report.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/layouts/default.vue app/pages/settings.vue app/composables/useAuth.ts
git commit -m "feat(settings): hydrate + persist synced theme/locale across the app"
```

---

## Deployment note (not a code task)

The migration file is written but **not applied** to the production Supabase (per the user's decision). Until it is deployed, `useSettings.hydrate()` swallows the "relation does not exist" read error and the app keeps using device-local prefs — no breakage, but no cross-device sync yet. To activate sync, deploy `20260614000001_user_settings.sql` (Supabase CLI `supabase db push`, the dashboard SQL editor, or the Supabase MCP) against the project. No code change needed once the table exists.

---

## Self-review against the spec

- **Spec coverage:** migration + RLS (Task 1) · `STORAGE_KEYS.settings` + adapter read/write, `clear()` untouched (Task 2) · `useSettings` with hydrate/setTheme/setLocale/persistCloud, validation, try/catch, no-session early-return, no i18n-in-store (Task 3) · LocaleSwitcher → useSettings (Task 4) · default.vue hydrate ordering + settings.vue theme setter + useAuth SIGNED_IN/INITIAL_SESSION hydrate, not in SIGNED_OUT (Task 5). ✓ All spec sections map to a task.
- **Type consistency:** `Settings = { theme: Theme; locale: LocaleCode }`; `useSettingsStore` exposes `hydrate()/setTheme(Theme)/setLocale(LocaleCode)`; `STORAGE_KEYS.settings = 'munbeop.v1.settings'` used identically in the adapter, store, and the store test's assertions; `applyTheme` aliases `useTheme().setTheme` to avoid the name clash with the store's own `setTheme`. ✓
- **No placeholders:** every step has real code/commands. ✓
- **Test caveats baked in:** adapter test adds `user_settings` to the mock data + reads `rows[0].prefs` (no `.maybeSingle()`, matching the existing mock); store test `vi.mock`s `useStorageAdapter` and resets the module-singleton theme each `beforeEach`; LocaleSwitcher test supplies its own `useI18n` stub (global one lacks `setLocale`/`locales`). ✓
