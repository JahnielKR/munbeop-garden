# Data Import (restore backup) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a `useDataExport` JSON backup — overwrite all syncable keys, behind a confirmation modal, then reload so stores re-hydrate.

**Architecture:** Lift the export key-set into a shared module; add a pure validator, a thin `applyImport` composable (writes the 8 keys), a `DataImport.vue` (file pick → validate → confirm modal → apply → reload), wired into the settings 데이터 tab. Mirror of export; no migration, no new storage key.

**Tech Stack:** Nuxt 4 (SPA) + Vue 3 `<script setup>` + Pinia + Vitest + @vue/test-utils. Spec: `docs/superpowers/specs/2026-06-23-data-import-design.md`.

**Conventions (verified in-repo):**
- App under `munbeop/`; run from there. Project uses **pnpm** (deps installed — never `install`, never create `package-lock.json`). Commands: `pnpm run test -- <path>`, `pnpm run typecheck`, `pnpm run lint`.
- Branch is `claude/data-import`. Verify `git rev-parse --abbrev-ref HEAD` before each commit. Never `git add -A` — add only the listed files.
- `STORAGE_KEYS` from `~/lib/storage`; storage via `useStorageAdapter()` (`read<T>(key, fallback)`, `write(key, value)`). Toast via `useToast()` (`.success/.error`). i18n key-echo stub is global in tests (`useI18n().t` returns the key) — component tests need no local i18n mock (see `tests/components/practice/DeckPicker.test.ts`).
- vitest gotcha: keep the SUT import at the TOP of test files (above `vi.mock`).

---

## File Structure

**Create:**
- `app/lib/data-transfer/keys.ts` — `APP_ID`, `EXPORT_KEYS`, `ExportPayload` (single source of truth).
- `app/lib/data-transfer/validate.ts` — pure `parseImportPayload`.
- `app/lib/data-transfer/reload.ts` — `reloadPage()` seam.
- `app/composables/useDataImport.ts` — `applyImport`.
- `app/components/settings/DataImport.vue` — UI.
- Tests: `tests/unit/data-transfer/validate.test.ts`, `tests/unit/data-transfer/useDataImport.test.ts`, `tests/components/settings/DataImport.test.ts`, `tests/unit/i18n/data-import-keys.test.ts`.

**Modify:**
- `app/composables/useDataExport.ts` — import the shared constants (remove local copies).
- `app/pages/settings.vue` — render `<DataImport />`.
- `i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json` — `settings.data.{import,import_confirm_title,import_confirm_body,import_confirm_cta,import_error,import_invalid}`.

---

## Task 1: Shared key-set module + refactor export

**Files:**
- Create: `munbeop/app/lib/data-transfer/keys.ts`
- Modify: `munbeop/app/composables/useDataExport.ts`

- [ ] **Step 1: Create the shared module**

`munbeop/app/lib/data-transfer/keys.ts`:
```ts
import { STORAGE_KEYS } from '~/lib/storage'

/** Stamped into every export; import rejects files that don't match. */
export const APP_ID = 'munbeop-garden'

/** Every syncable key in a full backup (export writes these; import restores them). */
export const EXPORT_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.escapeRoom,
] as const

export interface ExportPayload {
  exportedAt: string
  app: string
  data: Record<string, unknown>
}
```

- [ ] **Step 2: Refactor `useDataExport.ts` to use it**

Replace the top of `munbeop/app/composables/useDataExport.ts` — remove the local `EXPORT_KEYS` array and `ExportPayload` interface, import them instead, and use `APP_ID` for the stamped `app` field:

```ts
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { APP_ID, EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'

/**
 * useDataExport — one-click "take my data" JSON download.
 *
 * collectExportData() reads every syncable key (a complete backup) into one
 * labelled object. downloadJson() turns it into a file the browser saves.
 * exportData() wires the two together with a success/error toast.
 */
export type { ExportPayload }

export function useDataExport() {
  const { t } = useI18n()
  const toast = useToast()

  async function collectExportData(): Promise<ExportPayload> {
    const storage = useStorageAdapter()
    const entries = await Promise.all(
      EXPORT_KEYS.map(async (key) => [key, await storage.read<unknown>(key, null)] as const),
    )
    return {
      exportedAt: new Date().toISOString(),
      app: APP_ID,
      data: Object.fromEntries(entries),
    }
  }
```

Leave `downloadJson`, `exportData`, and the `return { ... }` unchanged. (The `STORAGE_KEYS` import is now unused in this file — remove it.)

- [ ] **Step 3: Typecheck + full suite (no behavior change)**

Run: `cd munbeop && pnpm run typecheck` → PASS.
Run: `cd munbeop && pnpm run test` → all green (export behavior is unchanged; this only relocates constants).

- [ ] **Step 4: Commit**
```bash
git add munbeop/app/lib/data-transfer/keys.ts munbeop/app/composables/useDataExport.ts
git commit -m "refactor(data): lift export key-set into shared data-transfer/keys"
```

---

## Task 2: Pure import validator

**Files:**
- Create: `munbeop/app/lib/data-transfer/validate.ts`
- Test: `munbeop/tests/unit/data-transfer/validate.test.ts`

- [ ] **Step 1: Write the failing test**

`munbeop/tests/unit/data-transfer/validate.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parseImportPayload } from '~/lib/data-transfer/validate'
import { APP_ID } from '~/lib/data-transfer/keys'
import { STORAGE_KEYS } from '~/lib/storage'

const valid = JSON.stringify({ exportedAt: '2026-01-01', app: APP_ID, data: { [STORAGE_KEYS.log]: [1] } })

describe('parseImportPayload', () => {
  it('accepts a well-formed export', () => {
    const r = parseImportPayload(valid)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.payload.data[STORAGE_KEYS.log]).toEqual([1])
  })
  it('rejects non-JSON with reason json', () => {
    expect(parseImportPayload('not json{')).toEqual({ ok: false, reason: 'json' })
  })
  it('rejects a wrong app stamp with reason app', () => {
    expect(parseImportPayload(JSON.stringify({ app: 'other', data: {} }))).toEqual({ ok: false, reason: 'app' })
  })
  it('rejects a missing/non-object data with reason shape', () => {
    expect(parseImportPayload(JSON.stringify({ app: APP_ID }))).toEqual({ ok: false, reason: 'shape' })
    expect(parseImportPayload(JSON.stringify({ app: APP_ID, data: null }))).toEqual({ ok: false, reason: 'shape' })
  })
  it('rejects a non-object top level with reason shape', () => {
    expect(parseImportPayload('42')).toEqual({ ok: false, reason: 'shape' })
  })
  it('accepts a payload carrying only a subset of keys', () => {
    const r = parseImportPayload(JSON.stringify({ app: APP_ID, data: { [STORAGE_KEYS.settings]: {} } }))
    expect(r.ok).toBe(true)
  })
})
```

- [ ] **Step 2: Run it → FAIL** (`cd munbeop && pnpm run test -- tests/unit/data-transfer/validate.test.ts`)

- [ ] **Step 3: Implement**

`munbeop/app/lib/data-transfer/validate.ts`:
```ts
import { APP_ID, type ExportPayload } from './keys'

export type ParseResult =
  | { ok: true; payload: ExportPayload }
  | { ok: false; reason: 'json' | 'app' | 'shape' }

/** Validate raw text as a munbeop-garden export. Pure — no DOM, no storage. */
export function parseImportPayload(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'json' }
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'shape' }
  const obj = raw as Record<string, unknown>
  if (obj.app !== APP_ID) return { ok: false, reason: 'app' }
  if (typeof obj.data !== 'object' || obj.data === null) return { ok: false, reason: 'shape' }
  return { ok: true, payload: obj as unknown as ExportPayload }
}
```

- [ ] **Step 4: Run it → PASS** (6 tests).

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/lib/data-transfer/validate.ts munbeop/tests/unit/data-transfer/validate.test.ts
git commit -m "feat(data-import): pure parseImportPayload validator"
```

---

## Task 3: applyImport composable + reload seam

**Files:**
- Create: `munbeop/app/lib/data-transfer/reload.ts`
- Create: `munbeop/app/composables/useDataImport.ts`
- Test: `munbeop/tests/unit/data-transfer/useDataImport.test.ts`

- [ ] **Step 1: Write the failing test**

`munbeop/tests/unit/data-transfer/useDataImport.test.ts` (SUT import at top):
```ts
import { useDataImport } from '~/composables/useDataImport'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const write = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(), write, remove: vi.fn(), clear: vi.fn() }),
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

const payload = (data: Record<string, unknown>) => ({ exportedAt: 'x', app: APP_ID, data }) as never

beforeEach(() => {
  setActivePinia(createPinia())
  write.mockReset()
  write.mockResolvedValue(undefined)
})

describe('useDataImport.applyImport', () => {
  it('writes each present export key, skips absent and unknown keys, returns true', async () => {
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: [1], 'totally.unknown': 9 }))
    expect(ok).toBe(true)
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, [1])
    expect(write).not.toHaveBeenCalledWith('totally.unknown', 9)
    // absent keys (e.g. grammar) are never written:
    expect(write).not.toHaveBeenCalledWith(STORAGE_KEYS.grammar, expect.anything())
  })
  it('returns false when a write throws', async () => {
    write.mockRejectedValueOnce(new Error('boom'))
    const { applyImport } = useDataImport()
    const ok = await applyImport(payload({ [STORAGE_KEYS.log]: [1] }))
    expect(ok).toBe(false)
  })
})
```

- [ ] **Step 2: Run it → FAIL**

- [ ] **Step 3: Implement the reload seam**

`munbeop/app/lib/data-transfer/reload.ts`:
```ts
/** Thin, mockable wrapper so the import flow can full-reload after a restore. */
export function reloadPage(): void {
  if (typeof window !== 'undefined') window.location.reload()
}
```

- [ ] **Step 4: Implement the composable**

`munbeop/app/composables/useDataImport.ts`:
```ts
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'

/**
 * useDataImport — restore a useDataExport backup.
 *
 * applyImport() overwrites each present export key from the payload. The caller
 * reloads on success so every store re-hydrates from the restored storage.
 */
export function useDataImport() {
  const { t } = useI18n()
  const toast = useToast()

  async function applyImport(payload: ExportPayload): Promise<boolean> {
    try {
      const storage = useStorageAdapter()
      for (const key of EXPORT_KEYS) {
        const value = payload.data[key]
        if (value !== undefined) await storage.write(key, value)
      }
      return true
    } catch {
      toast.error(t('settings.data.import_error'))
      return false
    }
  }

  return { applyImport }
}
```

- [ ] **Step 5: Run it → PASS** (2 tests). Then `cd munbeop && pnpm run typecheck`.

- [ ] **Step 6: Commit**
```bash
git add munbeop/app/lib/data-transfer/reload.ts munbeop/app/composables/useDataImport.ts munbeop/tests/unit/data-transfer/useDataImport.test.ts
git commit -m "feat(data-import): applyImport composable + reload seam"
```

---

## Task 4: DataImport.vue component

**Files:**
- Create: `munbeop/app/components/settings/DataImport.vue`
- Test: `munbeop/tests/components/settings/DataImport.test.ts`

- [ ] **Step 1: Write the failing test**

`munbeop/tests/components/settings/DataImport.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DataImport from '~/components/settings/DataImport.vue'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const write = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(), write, remove: vi.fn(), clear: vi.fn() }),
}))
const reloadPage = vi.fn()
vi.mock('~/lib/data-transfer/reload', () => ({ reloadPage }))

const VALID = JSON.stringify({ exportedAt: 'x', app: APP_ID, data: { [STORAGE_KEYS.log]: [1] } })

function mountIt() {
  setActivePinia(createPinia())
  return mount(DataImport, {
    global: {
      stubs: {
        Modal: { template: '<div v-if="open"><slot /></div>', props: ['open', 'title', 'closeLabel'] },
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
      },
    },
  })
}

async function selectFile(w: ReturnType<typeof mountIt>, contents: string) {
  const file = new File([contents], 'backup.json', { type: 'application/json' })
  const input = w.get('[data-testid="import-file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

beforeEach(() => {
  write.mockClear()
  write.mockResolvedValue(undefined)
  reloadPage.mockClear()
})

describe('DataImport', () => {
  it('an invalid file shows no confirm modal and writes nothing', async () => {
    const w = mountIt()
    await selectFile(w, 'not json{')
    expect(w.find('[data-testid="import-confirm"]').exists()).toBe(false)
    expect(write).not.toHaveBeenCalled()
  })
  it('a valid file opens the confirm modal; confirming writes + reloads', async () => {
    const w = mountIt()
    await selectFile(w, VALID)
    const confirm = w.get('[data-testid="import-confirm"]')
    await confirm.trigger('click')
    await flushPromises()
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, [1])
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run it → FAIL** (component missing).

- [ ] **Step 3: Implement the component**

`munbeop/app/components/settings/DataImport.vue`:
```vue
<!-- app/components/settings/DataImport.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import { parseImportPayload } from '~/lib/data-transfer/validate'
import { reloadPage } from '~/lib/data-transfer/reload'
import { useDataImport } from '~/composables/useDataImport'
import type { ExportPayload } from '~/lib/data-transfer/keys'

const { t } = useI18n()
const toast = useToast()
const { applyImport } = useDataImport()

const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref<ExportPayload | null>(null)
const confirmOpen = ref(false)

function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-selecting the same file
  if (!file) return
  let text: string
  try {
    text = await file.text()
  } catch {
    toast.error(t('settings.data.import_error'))
    return
  }
  const result = parseImportPayload(text)
  if (!result.ok) {
    toast.error(t('settings.data.import_invalid'))
    return
  }
  pending.value = result.payload
  confirmOpen.value = true
}

async function confirmImport() {
  if (!pending.value) return
  const ok = await applyImport(pending.value)
  confirmOpen.value = false
  pending.value = null
  if (ok) reloadPage()
}

function cancelImport() {
  confirmOpen.value = false
  pending.value = null
}
</script>

<template>
  <div class="data-import">
    <Button size="sm" data-testid="import-btn" @click="pickFile">{{ t('settings.data.import') }}</Button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="data-import__input"
      data-testid="import-file"
      @change="onFileChange"
    >
    <Modal
      :open="confirmOpen"
      :title="t('settings.data.import_confirm_title')"
      :close-label="t('settings.data.import_confirm_cta')"
      @close="cancelImport"
    >
      <p class="data-import__body">{{ t('settings.data.import_confirm_body') }}</p>
      <div class="data-import__actions">
        <Button size="sm" data-testid="import-confirm" @click="confirmImport">
          {{ t('settings.data.import_confirm_cta') }}
        </Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.data-import { display: contents; }
.data-import__input { display: none; }
.data-import__body { margin: 0 0 16px; font-family: var(--font-ui); color: var(--text); line-height: 1.6; }
.data-import__actions { display: flex; justify-content: flex-end; }
</style>
```

- [ ] **Step 4: Run it → PASS** (2 tests). Then `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/components/settings/DataImport.vue munbeop/tests/components/settings/DataImport.test.ts
git commit -m "feat(data-import): DataImport file-pick + confirm-modal component"
```

---

## Task 5: Wire into settings

**Files:**
- Modify: `munbeop/app/pages/settings.vue`

- [ ] **Step 1: Add the component**

In `munbeop/app/pages/settings.vue`: add the import near the other component imports:
```ts
import DataImport from '~/components/settings/DataImport.vue'
```
In the data `<section>` (the one with `id="panel-data"`), add `<DataImport />` right after the export `<Button>` line:
```vue
      <Button size="sm" @click="exportData">{{ t('settings.data.export') }}</Button>
      <DataImport />
```

- [ ] **Step 2: Typecheck + lint + boot-free check**

Run: `cd munbeop && pnpm run typecheck` → PASS. `cd munbeop && pnpm run lint` → 0 errors.

- [ ] **Step 3: Commit**
```bash
git add munbeop/app/pages/settings.vue
git commit -m "feat(data-import): surface Import in the settings data tab"
```

---

## Task 6: i18n (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/data-import-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

`munbeop/tests/unit/i18n/data-import-keys.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
function dig(o: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o)
}
const KEYS = [
  'settings.data.import',
  'settings.data.import_confirm_title',
  'settings.data.import_confirm_body',
  'settings.data.import_confirm_cta',
  'settings.data.import_error',
  'settings.data.import_invalid',
]

describe('data-import i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
})
```

- [ ] **Step 2: Run it → FAIL**

- [ ] **Step 3: Add the English keys**

In `munbeop/i18n/locales/en.json`, the existing `settings.data` object is:
```json
"data": {
  "title": "Data & privacy",
  "export": "Export my data (.json)",
  "exported": "Your data is downloading.",
  "export_error": "Couldn't export your data. Please try again."
}
```
Extend it (keep the existing 4 keys) to:
```json
"data": {
  "title": "Data & privacy",
  "export": "Export my data (.json)",
  "exported": "Your data is downloading.",
  "export_error": "Couldn't export your data. Please try again.",
  "import": "Import a backup (.json)",
  "import_confirm_title": "Restore this backup?",
  "import_confirm_body": "This replaces all your current data with the backup file. This can't be undone.",
  "import_confirm_cta": "Replace my data",
  "import_error": "Couldn't import that file. Please try again.",
  "import_invalid": "That doesn't look like a Mungarden backup file."
}
```

- [ ] **Step 4: Add the same 6 new keys to the other 7 locales**

In `es, fr, pt-BR, th, id, vi, ja`, add the six `import*` keys into each file's existing `settings.data` object, translated in the tone of the existing `export`/`export_error` strings in that same file. Keep it valid JSON; "Mungarden" stays as a brand name. (These are UI chrome — translate naturally; no placeholders to preserve.)

- [ ] **Step 5: Run the parity test → PASS** (48 + assertions). Then `cd munbeop && pnpm run test -- tests/unit/i18n` and `cd munbeop && pnpm run typecheck`.

- [ ] **Step 6: Commit**
```bash
git add munbeop/i18n/locales munbeop/tests/unit/i18n/data-import-keys.test.ts
git commit -m "feat(data-import): settings.data.import* i18n across 8 locales"
```

---

## Task 7: Full-suite gate

- [ ] **Step 1:** `cd munbeop && pnpm run test` → all green. `cd munbeop && pnpm run typecheck` → 0. `cd munbeop && pnpm run lint` → 0 errors.
- [ ] **Step 2 (commit if any fixups):**
```bash
git add -- munbeop
git commit -m "test(data-import): full-suite gate green"
```

---

## Self-Review

**Spec coverage:** Decision 1 (overwrite) → Task 3 `applyImport` writes the keys. Decision 2 (confirm modal) → Task 4 Modal. Decision 3 (reload) → Task 3 `reloadPage` + Task 4 confirm. Decision 4 (validation) → Task 2 `parseImportPayload` + Task 4 invalid-toast. Decision 5 (shared key set, present-only) → Task 1 + Task 3 `value !== undefined` guard. Decision 6 (surface) → Task 4 + Task 5. i18n → Task 6.

**Type consistency:** `ExportPayload` defined in `keys.ts` (Task 1), consumed by validate (Task 2), composable (Task 3), component (Task 4). `ParseResult.reason` values `'json'|'app'|'shape'` match between validate impl and its test. `applyImport(payload): Promise<boolean>` signature identical in composable, its test, and the component caller. `reloadPage` exported from `reload.ts` (Task 3), mocked in the component test (Task 4).

**No placeholders:** every code/test step is complete; the only translate-it-yourself step is the 7 non-English locales (Task 6 Step 4), gated by the parity test — the standard division for UI-chrome i18n.
