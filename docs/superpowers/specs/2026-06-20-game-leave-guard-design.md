# Game leave-guard — design

**2026-06-20 · Subproject 1 of the Particle Lab follow-up program**

## Goal

When a player is in the middle of a game and tries to leave — by clicking a
sidebar tab, the mobile nav, the browser back button, or the in-game
"← Práctica" button — show one confirmation modal ("¿abandonar?") so a misclick
can't silently discard their round. Applies to **every** game, and only when
there is something to lose.

## Problem / current state

- `GameExitButton.vue` only guards **its own click**, via an internal modal, and
  only when the page passes `confirm`. Ruleta does (`:confirm="phase !== 'pick'"`);
  escape-room does not; Particle Lab has no exit button at all.
- **Nothing uses `onBeforeRouteLeave`.** `AppShell` renders the sidebar +
  mobile nav on every surface, including `surface: 'game'`, so those links are
  live during a game. Clicking one — or hitting browser back — navigates away
  and **discards the in-progress round with no warning**.

## Design

### Mechanism

A per-page **route leave guard** via Vue Router's `onBeforeRouteLeave`. It fires
on *every* navigation away from the game route regardless of trigger (sidebar,
mobile nav, browser back/forward, in-app link, or the exit button), so one
mechanism covers them all without touching the shell or sidebar. When the page's
"in progress" predicate is true, the guard cancels the navigation, records the
intended destination, and opens the confirm modal. Confirming "Salir" re-issues
the pending navigation; cancelling stays put.

### Architecture (chosen: composable + modal component)

Rejected alternative: a global `router.beforeEach` + a `dirty` store. It needs no
per-page wiring but introduces global state for an intrinsically local concern,
leaks easily (a `dirty` flag not reset on an exit path blocks later unrelated
navigations), and is harder to test. The composable keeps the predicate local
and reactive, with no global state.

| Unit | Responsibility | Depends on |
|---|---|---|
| `composables/useGameLeaveGuard.ts` | Registers `onBeforeRouteLeave`. Holds `confirmOpen` + the pending target. If `isDirty()` and not yet confirmed → cancel nav, stash target, open modal. Exposes `confirmOpen` (ref), `confirm()` (re-issue the pending nav), `cancel()` (close), and `guardedPush(to)` for buttons. `provide()`s itself under a known key so descendants (the exit button) share the one guard. | `vue-router` |
| `components/games/GameLeaveConfirm.vue` | Renders the confirm `Modal` bound to the guard (inject). Cancel / Salir buttons. Reuses the existing `games.exit_confirm_*` i18n keys — **no new i18n**. | `Modal`, `Button`, the guard |
| `components/games/GameExitButton.vue` (edit) | Drops its own modal and the `confirm` prop. Injects the guard and calls `guard.guardedPush(to)` on click; if no guard is provided, falls back to a direct `router.push` (backward-compatible). | the guard |

**Flow:** page calls `const guard = useGameLeaveGuard(isDirty)` once → renders
`<GameLeaveConfirm />` once → places `<GameExitButton />` where it wants. The exit
button, sidebar, mobile nav, and browser back all funnel through the single guard
and the single modal.

### Per-game "in progress" predicate

- **Particle Lab** (`pages/practice/particles.vue`): `mode === 'drill' && drill.phase.value !== 'done'`. Explore mode is read-only → never dirty. Also **adds** the `<GameExitButton>` it currently lacks.
- **Ruleta** (`pages/practice/ruleta.vue`): `phase.value !== 'pick'` — its current `:confirm` logic, moved into the predicate. Drop the `:confirm` prop.
- **Escape-room gameplay** (`pages/escape-room/play.vue`): `escapeStore.status === 'playing'` (the store's `Status` is `'idle' | 'playing' | 'gameover' | 'completed'`; only an active run is dirty). The escape-room *index* (`index.vue`) is just the level menu — nothing in progress — so it keeps its plain `<GameExitButton>` with no guard.

### Out of scope (deliberate)

- **Native `beforeunload`** (hard refresh / tab close). The ask was sidebar/back —
  in-app navigation. The native dialog is unstyleable and crude. Left as a future
  toggle if wanted.

## Files

| Action | Path |
|---|---|
| Create | `munbeop/app/composables/useGameLeaveGuard.ts` |
| Create | `munbeop/app/components/games/GameLeaveConfirm.vue` |
| Edit | `munbeop/app/components/games/GameExitButton.vue` (use guard, drop own modal + `confirm` prop) |
| Edit | `munbeop/app/pages/practice/particles.vue` (guard + `<GameLeaveConfirm>` + `<GameExitButton>`) |
| Edit | `munbeop/app/pages/practice/ruleta.vue` (guard + `<GameLeaveConfirm>`; drop `:confirm`) |
| Edit | `munbeop/app/pages/escape-room/play.vue` (guard + `<GameLeaveConfirm>`) |
| Create | `munbeop/tests/unit/games/game-leave-guard.test.ts` (guard logic) |
| Create | `munbeop/tests/components/games/GameLeaveConfirm.test.ts` |
| Edit | `munbeop/tests/components/games/GameExitButton.test.ts` (update to the guarded flow) |

No new i18n keys. No SQL. No store changes.

## Testing

- **Unit (guard):** with a mocked router, assert: clean state → navigation passes;
  dirty → first nav is cancelled and `confirmOpen` is true; `confirm()` re-issues
  the stashed target; `cancel()` closes and stays; `guardedPush` opens the modal
  when dirty and pushes directly when clean.
- **Component:** `GameLeaveConfirm` renders the modal when open, emits/handles
  cancel + leave; `GameExitButton` routes its click through an injected guard
  (and falls back to a direct push when none is provided).
- **Manual verification (all 3 games):** start a round, click a sidebar tab →
  modal; Cancel stays, Salir leaves; repeat with browser back and the exit button;
  confirm Explore mode / ruleta `pick` / escape-room idle never prompt. Light/dark + mobile.

## Success criteria

A mid-round navigation away from any game — by any trigger — prompts exactly one
confirm modal; no prompt appears when there's nothing in progress; existing
ruleta/escape-room behaviour is preserved or improved; full suite + typecheck +
lint stay green.
