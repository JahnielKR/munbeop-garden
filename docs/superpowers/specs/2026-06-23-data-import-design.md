# Data Import (restore backup) — Design

- **Date:** 2026-06-23
- **Source:** audit follow-up — "data IMPORT missing (mirror `useDataExport`)" (see `project_audit_and_followups`).
- **Status:** Approved design (brainstorming). Next: writing-plans.

## 1. Motivation

`useDataExport` already produces a one-file JSON backup of every syncable key.
There is no way to load it back. Data import closes the export/import pair and
backs the product's "no lock-in / take your data" stance.

## 2. Decisions (locked in brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Import semantics | **Overwrite / restore** — the file fully replaces current data (a backup restore). No merge. |
| 2 | Destructive guard | A **confirmation modal** before writing (overwrite is destructive). |
| 3 | Post-import refresh | **`window.location.reload()`** so every store re-hydrates from the restored storage (bulletproof vs hand-rolling multi-store re-hydration over the Supabase-backed adapter). |
| 4 | Validation | Reject non-JSON, wrong `app`, or missing/`non-object` `data` with an error toast — never write a bad file. |
| 5 | Key set | Reuse the **same 8 keys** as export, as the single source of truth. Import only keys present in the file; ignore absent/unknown keys. |
| 6 | Surface | An "Import" control beside "Export" in `settings.vue` → 데이터 tab, encapsulated in a `DataImport.vue` component. |

### Out of scope (YAGNI)
- No merge / conflict resolution.
- No partial/selective import (all-or-nothing restore).
- No cross-app or schema-migration of foreign files.
- No new storage key, no DB migration (writes only the existing synced keys).

## 3. Architecture

Mirror `useDataExport`, with the shared constants lifted into a plain module so
export and import share one source of truth.

- `app/lib/data-transfer/keys.ts` — `APP_ID = 'munbeop-garden'`, `EXPORT_KEYS`
  (the 8 `STORAGE_KEYS` currently private in `useDataExport`), and the
  `ExportPayload` interface. `useDataExport.ts` is refactored to import these
  (removing its local copies — no behavior change).
- `app/lib/data-transfer/validate.ts` — pure `parseImportPayload(text: string)`:
  `JSON.parse` in try/catch, then assert object + `app === APP_ID` + `data` is a
  non-null object. Returns `{ ok: true, payload: ExportPayload }` or
  `{ ok: false, reason: 'json' | 'app' | 'shape' }`. No DOM/storage — golden-testable.
- `app/composables/useDataImport.ts` — `applyImport(payload)`: for each
  `EXPORT_KEY` where `payload.data[key] !== undefined`, `storage.write(key, value)`.
  Ignores absent/unknown keys. Success/error toasts.
- `app/components/settings/DataImport.vue` — an "Import" `Button` + a hidden
  `<input type="file" accept="application/json">`. On file pick: read text →
  `parseImportPayload`; if `!ok` → error toast (`import_invalid`/`import_error`),
  no modal. If `ok` → open a confirm `Modal` (`~/components/ui/Modal.vue`); on
  confirm → `applyImport` → success toast → `window.location.reload()`. Resets
  the input value after each pick so the same file can be re-selected.
- `app/pages/settings.vue` — render `<DataImport />` next to the export button in
  the 데이터 section.
- i18n `settings.data.{import, import_confirm_title, import_confirm_body, import_confirm_cta, imported, import_error, import_invalid}` ×8.

### Data flow
file → `FileReader`/`file.text()` → `parseImportPayload` (validate) → confirm
modal → `applyImport` (write 8 keys via the storage adapter) → reload → stores
re-hydrate from restored storage.

### Error handling
- Non-JSON / wrong app / bad shape → error toast, no write, no modal.
- A failed `storage.write` during `applyImport` → caught, error toast; the
  reload is skipped (state may be partially written — acceptable for a restore
  the user can retry; documented, not silently swallowed).

## 4. Testing

- `validate.test.ts` (pure): valid payload → `ok`; invalid JSON → `reason:'json'`;
  wrong `app` → `reason:'app'`; missing/`non-object` `data` → `reason:'shape'`;
  payload with only a subset of keys → still `ok`.
- `useDataImport.test.ts`: `applyImport` calls `storage.write` once per present
  key, skips absent keys, never writes unknown keys; success toast on success,
  error toast when a write throws (mock adapter + toast).
- `DataImport.test.ts` (component): invalid file → error toast, no modal; valid
  file → confirm modal appears; confirm → `applyImport` called + reload invoked
  (reload injected/mocked so the test can assert it). Cancel → nothing written.
- i18n parity test for the 7 new `settings.data.*` keys across 8 locales.

## 5. Build approach

TDD per unit (pure validate → composable → component → wiring → i18n), small
enough for inline execution.
