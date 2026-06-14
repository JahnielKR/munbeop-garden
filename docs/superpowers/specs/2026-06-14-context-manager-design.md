# Context Manager — design spec

_Date: 2026-06-14 · Feature #3 from the settings overhaul plan ([../plans/2026-06-14-settings-overhaul.md](../plans/2026-06-14-settings-overhaul.md))_

## Problem

Practice draws sentences across **contexts** (반말, 존댓말, 직장에서, …). The data layer is fully built and synced — `stores/contexts.ts` exposes `toggleActive(id)` and `addCustom(name, scene)`, both persisting through the storage adapter to `user_inactive_contexts` / `user_custom_contexts`. But **nothing in the app calls them**: there is no UI to toggle a context or add a custom one.

Two concrete consequences:

1. **Critical bug:** Practice hard-blocks when fewer than 3 contexts are active (`usePractice.ts:32`, message `practice.no_contexts`). A user who somehow ends up below 3 active contexts has **no screen to re-enable any** — they are permanently stuck.
2. The entire `user_custom_contexts` table is unreachable dead weight.

## Goal

Ship a self-contained **Context Manager** that lets a signed-in user activate/deactivate any context, create custom ones, and delete their own custom ones — reusing the existing store/storage/sync layer, adding only a tiny `removeCustom` method and a min-active guard.

Non-goals (v1): editing a context after creation; per-locale scene authoring; reordering; categories for custom contexts beyond the single `custom` bucket.

## Decisions (confirmed with user)

- **Scope:** activate + add + delete (full manager). Delete requires a new `removeCustom` in the store.
- **Location:** a self-contained `<ContextManager />` component dropped into `settings.vue` as a card now. Phase 0 of the overhaul later wraps it in a `SettingsSection`. No dedicated route.
- **Custom name:** Korean (Hangul) is **required** for the `name` badge, to stay visually consistent with the built-in contexts. Validated inline.
- **Min-active guard:** enforced in **both** the store (single source of truth) and the UI (prevents the action + explains why). Practice's own `< 3` check remains as a backstop.

## Architecture

### Components (under `app/components/settings/`)

**`ContextManager.vue`** — orchestrator + list.
- Reads `useContextsStore()`; on mount the store is already hydrated by the default layout, but the component must not assume order — it renders reactively from `store.all` / `store.active`.
- Groups `store.all` by `category` into three sections: `formalidad`, `situacional`, `custom`. Section headings via i18n (`settings.contexts.category.*`). The `custom` group renders only when the user has custom contexts.
- Each row shows: the Korean `name` badge, the localized `scene` (`useLocalized().tl(scene)`), a `Toggle` bound to active state, and — for `builtin: false` rows only — a delete button.
- Renders a live "active count" line and, when at the minimum, the min-active hint. Toggles for the currently-active contexts are **disabled** when `active.length <= MIN_ACTIVE_CONTEXTS` (you can still turn an inactive one back on).
- Hosts `<ContextAddForm />` and a delete-confirm `Modal`.
- Emits success/error feedback via `useToast()`.

**`ContextAddForm.vue`** — create form.
- Two `Field`-wrapped controls, both the existing `Input` primitive: `name` (Korean) and `scene` (current language; scenes are short, e.g. "texting a close friend"). A submit `Button`.
- Validates on submit: `isHangulName(name)` and non-empty `scene`. Duplicate names surface the store's `null` return as an error. Shows errors through `Field`'s `error` slot.
- On success, builds a `LocalizedString` by replicating the single `scene` input across all 8 `LOCALE_CODES` (type-safe; `localized()` never needs to fall back), calls `addCustom`, clears the form, and lets the parent toast.

Rows are simple enough to stay inline in `ContextManager.vue` (badge + scene + Toggle + delete) — no separate `ContextRow.vue` in v1.

### Store changes (`app/stores/contexts.ts`)

- Export a shared constant **`MIN_ACTIVE_CONTEXTS = 3`**. Refactor `usePractice.ts:32` to import it instead of the literal `3`.
- **`toggleActive(id): Promise<boolean>`** — when the call would *deactivate* a context and `active.length <= MIN_ACTIVE_CONTEXTS`, make no change and return `false`. Otherwise toggle, persist, return `true`. (Re-activating is always allowed.)
- **`removeCustom(id): Promise<boolean>`** (new) — no-op + `false` if `id` is not a custom context, or if it is currently active and removing it would drop `active.length` below the minimum. Otherwise: remove from `custom`, also remove `id` from `inactiveIds` (cleanup), persist **both** `STORAGE_KEYS.customContexts` and `STORAGE_KEYS.inactiveContextIds`, return `true`. Uses the same `storage.write` path as `addCustom` — no adapter or schema change.
- `addCustom` is unchanged (already dedupes by `name`, returns `null` on duplicate).

### Validation helper (`app/lib/domain/context.ts`)

```ts
/** True if the string contains at least one Hangul character (syllable or jamo). */
export function isHangulName(value: string): boolean
```

Regex covers Hangul syllables `가-힣` and Jamo `ᄀ-ᇿ` / compatibility jamo `㄰-㆏`. Pure, unit-tested.

### i18n (`i18n/locales/*.json`, all 8)

New `settings.contexts.*` namespace. Keys:

| key | English value (others translated) |
|---|---|
| `settings.contexts.title` | "Practice contexts" |
| `settings.contexts.subtitle` | "Pick which situations show up in practice." |
| `settings.contexts.category.formalidad` | "Formality" |
| `settings.contexts.category.situacional` | "Situational" |
| `settings.contexts.category.custom` | "Your contexts" |
| `settings.contexts.add` | "Add context" |
| `settings.contexts.name_label` | "Name (Korean)" |
| `settings.contexts.name_placeholder` | "e.g. 반말" |
| `settings.contexts.scene_label` | "When does it apply?" |
| `settings.contexts.scene_placeholder` | "e.g. texting a close friend" |
| `settings.contexts.error_korean` | "Use a Korean name, e.g. 반말." |
| `settings.contexts.error_duplicate` | "A context with this name already exists." |
| `settings.contexts.error_scene_required` | "Add a short description." |
| `settings.contexts.min_active_hint` | "Keep at least 3 active to practice." |
| `settings.contexts.active_count` | "{count} active" |
| `settings.contexts.delete` | "Delete" |
| `settings.contexts.delete_confirm_title` | "Delete this context?" |
| `settings.contexts.delete_confirm_body` | "“{name}” will be removed from your contexts." |
| `settings.contexts.created` | "Context added." |
| `settings.contexts.deleted` | "Context deleted." |
| `settings.contexts.cancel` | "Cancel" |

The section heading in `ContextManager.vue` uses `BilingualTitle` with a Korean half (`ko="연습 상황"`) + `t('settings.contexts.title')`, matching `settings.vue`'s existing `BilingualTitle ko="설정"` pattern. 화이팅 and Korean cultural particles are never translated.

## Testing (TDD — tests first)

- **`tests/unit/domain/context.test.ts`** — `isHangulName`: true for `반말`, `격식체`, mixed `반말!`; false for `banmal`, ``, `123`, emoji.
- **`tests/unit/stores/contexts.test.ts`** — with `setActivePinia(createPinia())` and the happy-dom localStorage adapter:
  - `toggleActive` deactivates when above the minimum (returns `true`), and refuses + returns `false` when at the minimum; re-activating an inactive context always succeeds.
  - `addCustom` returns the new `Context` with `category:'custom'`, `builtin:false`, an `id` prefixed `custom_`; returns `null` on duplicate name; persists.
  - `removeCustom` removes a custom context, scrubs it from `inactiveIds`, returns `false` for a built-in id and when it would drop below the minimum.
- **`tests/unit/settings/i18n-contexts-keys.test.ts`** — every `settings.contexts.*` key resolves in all 8 locales (mirrors `tests/unit/games/i18n-exit-keys.test.ts`).
- **`tests/components/settings/ContextManager.test.ts`** — renders a row per context grouped by category; toggling persists; toggles disabled + hint shown at the minimum; delete button only on custom rows; delete opens the confirm modal.
- **`tests/components/settings/ContextAddForm.test.ts`** — Korean-less name shows `error_korean`; empty scene shows `error_scene_required`; valid submit calls `addCustom` with an 8-locale `scene`; duplicate name shows `error_duplicate`.

## Integration

`settings.vue` imports `ContextManager` and renders it as a new card after the existing language/dark-mode cards. No other page changes. The `empty.settings` placeholder stays for now (Phase 0 replaces it).

## Risks / notes

- **No god files:** two small components + a helper + two small store methods. Nothing over ~150 LOC.
- The store currently has **zero callers**, so changing `toggleActive`'s return type is safe.
- Scene replication across 8 locales is intentional: custom contexts are per-user (synced to that user's row), so the same text in every locale slot is correct — the user always sees their own wording regardless of interface language.
- Min-active guard lives in the store; the UI mirrors it for affordance only. Keep them consistent via the shared `MIN_ACTIVE_CONTEXTS` constant.
