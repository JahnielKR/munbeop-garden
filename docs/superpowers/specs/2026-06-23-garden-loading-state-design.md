# Garden Loading-State (end the winter-flash) — Design

- **Date:** 2026-06-23
- **Source:** audit follow-up — "loading-state/skeleton (winter-flash on hard reload)".
- **Status:** Approved design (brainstorming). Next: writing-plans.

## 1. Motivation

On a hard reload, `pages/index.vue` renders the garden hero from empty stores
before hydration finishes, so the tree flashes in its zero/winter state for a
beat, then snaps to the real garden. A calm loading placeholder removes the flash.

## 2. Decisions (locked in brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Scope | **Garden home only** — the hero view. Not an app-wide shell gate. |
| 2 | Ready signal | **`appStatus.status`** — the same store that already gates `EmptyPlot` and `DataErrorBanner`. Skeleton while not `'ready'`. |
| 3 | Error case | On `'error'`, show the skeleton too (never the misleading empty tree); the layout's existing `DataErrorBanner` provides the message + retry. |
| 4 | Skeleton | A dedicated `GardenSkeleton.vue` — a calm hero-sized placeholder with a soft pulse; `role="status"` + aria-label; static under `prefers-reduced-motion`. No winter tree. |
| 5 | Gate logic | A pure `heroState(status, logEmpty)` helper (golden-tested), so the template stays declarative. |

### Out of scope (YAGNI)
- The "first-run garden hint" — a separate follow-up.
- Loading states on other pages (stats, library) — only the garden flash is addressed.
- No change to the hydration flow itself (`appStatus`, `useAuth().init()`, `default.vue`) — only how the garden hero reads the existing status.

## 3. Architecture

- `app/lib/garden/loading.ts` — pure:
  ```ts
  export type HeroState = 'loading' | 'empty' | 'tree'
  export function heroState(status: DataStatus, logEmpty: boolean): HeroState
  // status !== 'ready' → 'loading'; else logEmpty ? 'empty' : 'tree'
  ```
  (`DataStatus` = `'idle' | 'loading' | 'ready' | 'error'`, imported from `~/stores/appStatus`.)
- `app/components/garden/GardenSkeleton.vue` — props-less calm placeholder. `role="status"`, `:aria-label="t('garden.loading')"`; a soft pulse animation disabled under `prefers-reduced-motion`. Sized to fill the hero area like `GardenStage`.
- `app/pages/index.vue` — in the `hero` view, branch on `heroState(appStatus.status, logStore.entries.length === 0)`:
  - `'loading'` → `<GardenSkeleton>` (new first branch).
  - `'empty'` → `<EmptyPlot>` (existing — keep its `onboarding.showEmptyPlot` wiring, which already implies `ready`).
  - `'tree'` → the hero tree (existing).
  - grove view → `<GardenGrove>` (existing, unchanged).
  Uses the existing `<Transition name="garden-fade">` so skeleton→tree cross-fades.
- i18n: `garden.loading` ×8.

### Data flow
`appStatus.status` (driven by `useAuth().init()` → `track()`) + `logStore.entries.length`
→ `heroState(...)` → which hero branch renders. Reaching `'ready'` swaps the
skeleton for the real garden via the existing fade.

### Why this is safe
`appStatus` always reaches a terminal state (`useAuth().init()` tracks the
hydration for the mandatory-auth user), so the skeleton never hangs. Client-side
navigation to the garden finds `status` already `'ready'` → no skeleton, instant.

## 4. Testing

- `loading.test.ts` (pure): `heroState('idle'|'loading'|'error', *) === 'loading'`;
  `heroState('ready', true) === 'empty'`; `heroState('ready', false) === 'tree'`.
- `GardenSkeleton.test.ts` (component): renders a `role="status"` element with the
  `garden.loading` aria-label.
- i18n parity test for `garden.loading` across 8 locales.
- index.vue wiring covered by the pure helper + a manual/preview smoke (the page is
  not unit-mounted; same convention as other garden work).

## 5. Build approach

TDD per unit (pure helper → component → wiring → i18n), inline execution.
