# Self-study: user-added grammar — design

_Created 2026-06-20. Roadmap Step 3 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S–M._

## Goal

The `public.user_custom_grammars` table exists with RLS and is already merged into the grammar read by `SupabaseAdapter`, but there is no UI or store action to ADD a custom grammar, so the capability is dead. Wire a "plant your own" flow: add/remove personal grammar patterns (ko + meaning + optional example) that flow through the exact same weighted draw, mastery, and library as the catalog. This serves the maker's own daily Korean study first (Korea-resident, native review at home) and extends the "everyday" scope the TOPIK curriculum misses.

## Decisions (locked)

- **UI home:** Settings → Learning tab, next to the existing Context Manager (chosen over the Library page) — mirrors the custom-contexts pattern exactly.

## Key finding: the grammar write filter is broken (must fix here)

`SupabaseAdapter.read(STORAGE_KEYS.grammar)` already returns `grammars` (catalog) ∪ `user_custom_grammars` (this user), so custom items already merge into `grammarStore.items`. But `write(STORAGE_KEYS.grammar)` filters with a placeholder `g.deckId !== 'catalog-readonly-marker'` that excludes nothing — so writing `items` would delete the user's custom rows and re-upsert the ENTIRE catalog into `user_custom_grammars`. This step fixes that filter, which also makes the dormant seed-fallback write safe.

## Architecture

- **`CUSTOM_DECK_ID = 'custom'`** constant in `app/lib/domain/grammar.ts`. Custom grammars carry this `deckId`; catalog grammars never do.
- **Adapter fix** (`app/lib/storage/supabase.ts`): the `STORAGE_KEYS.grammar` write filter becomes `g.deckId === CUSTOM_DECK_ID` — only custom-deck grammars are upserted to `user_custom_grammars`; the catalog is never written. (Read is unchanged: catalog ∪ custom.)
- **Grammar store** (`app/stores/grammar.ts`) gains:
  - `customGrammars` computed = `items.filter(g => g.deckId === CUSTOM_DECK_ID)`.
  - `addCustomGrammar({ ko, meaning, example? })`: validates `ko` is non-empty + `isHangulName(ko)` (contains Hangul; allows `-`, `(`, `/` in patterns) + not a duplicate of any existing `ko`; builds a `LocalizedString` meaning by filling all 8 locale slots with the single user text (mirrors `ContextAddForm.buildScene`); pushes to `items`; persists via `storage.write(STORAGE_KEYS.grammar, items)`. Returns the new `Grammar` or `null` (invalid/duplicate).
  - `removeCustomGrammar(ko)`: removes the matching custom item from `items`; persists. Returns boolean.
- Custom grammars already merge into `items` on `hydrate`, so they appear automatically in practice draws (`activeIndices` includes them) and in the Library's orphan "기타" section (no matching deck). They are NOT in the TOPIK spine, so they don't affect garden tree progress — acceptable (everyday extras, not a TOPIK level).

## UI (mirrors the contexts CRUD)

- `app/components/settings/CustomGrammarAddForm.vue` — mirror of `ContextAddForm`: `Field` + `Input` for `ko`, `meaning`, optional `example`, a submit `Button`, inline validation errors (Korean-required, duplicate). Calls `grammarStore.addCustomGrammar`.
- `app/components/settings/CustomGrammarManager.vue` — mirror of `ContextManager`: lists `customGrammars` with a delete control + confirm; renders the add form. Empty-state copy when none.
- Mounted in `app/pages/settings.vue` Learning tab, below the Context Manager.

## i18n (all 8 locales)

`settings.custom_grammar.*`: `title`, `subtitle`, `ko_label`, `ko_placeholder`, `meaning_label`, `meaning_placeholder`, `example_label`, `example_placeholder`, `add`, `error_korean`, `error_duplicate`, `delete`, `delete_confirm_title`, `delete_confirm_body` (keeps `{ko}`), `empty`, `created`, `deleted`. A parity test enforces presence in all 8 + the `{ko}` placeholder.

## Testing (TDD)

- Store (mocked adapter, `setActivePinia`): `addCustomGrammar` adds an item with `deckId === CUSTOM_DECK_ID`, fills all 8 meaning locales, and calls `storage.write(STORAGE_KEYS.grammar, …)`; rejects a duplicate `ko` and a non-Hangul `ko` (returns null, no write). `removeCustomGrammar` removes it and persists. `customGrammars` reflects only custom items.
- Adapter: extend `supabase.test.ts` — `write(STORAGE_KEYS.grammar, [catalogItem, customItem])` upserts ONLY the custom item to `user_custom_grammars` (and deletes existing first). This locks the bug fix.
- Components: `CustomGrammarAddForm` (submitting a valid ko calls the store and clears; an empty/non-Hangul ko shows an error and does not call add); `CustomGrammarManager` (lists custom items; delete triggers removal).
- i18n parity for `settings.custom_grammar.*`.

## Acceptance criteria

1. A user can add a custom grammar (ko + meaning + optional example) from Settings → Learning; it persists to `user_custom_grammars` and survives reload.
2. The custom grammar appears in practice draws and in the Library (orphan "기타" section); practicing it accrues SRS mastery like any item.
3. Removing a custom grammar deletes it from `user_custom_grammars` and the pool.
4. Writing the grammar key never persists catalog items to `user_custom_grammars` (bug fixed; covered by the adapter test).
5. New `settings.custom_grammar.*` keys in all 8 locales; `pnpm lint`/`typecheck`/`test` green.

## Out of scope

No cascade-delete of SRS/log rows when a custom grammar is removed (orphaned rows are harmless); custom grammars do not count toward garden tree progress; no bulk import; no per-locale meaning authoring (single user text fills all slots).
