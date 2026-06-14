# Game Exit Button — Design Spec

**Status:** approved, ready to plan
**Date:** 2026-06-14
**Branch:** `claude/quizzical-euclid-cba3ff`

## Motivation

The practice hub (`pages/practice/index.vue`, route `/practice`) is the home
screen for games: three `GameCard`s that route into each game. Once inside a
game there is no on-screen way back to that hub — the user must reach for the
sidebar's "Práctica" link. That is an extra, non-obvious step that breaks the
flow of "I'm done with this game, take me back to pick another."

The escape room *gameplay* already solves its own version of this: its HUD has
a `◀` back control (`EscapeRoom.vue`, `escape.back_to_book`) that returns to the
level notebook. But the two screens reached *directly* from the hub have no
exit at all:

| Screen | Route | Exit today |
|---|---|---|
| Ruleta ("La Baraja") | `/practice/ruleta` | none |
| Escape Room notebook | `/escape-room` | none |
| Escape Room gameplay | `/escape-room/play` | `◀` → notebook (exists) |

This spec adds a consistent "back to the practice hub" control to the two
screens that lack one, with a confirmation modal so a misclick can't throw away
a round in progress.

## Goals

- A visible `← Práctica` control on the ruleta and the escape-room notebook
  that returns to `/practice`.
- One small reusable component, so future games get the same control in one
  line and the look stays consistent with the existing escape-room `◀`.
- A confirmation modal **only when there is a live round to lose**, preventing
  accidental loss without nagging when there is nothing at stake.

## Non-Goals

- **The escape-room gameplay HUD is out of scope.** Its `◀` already exits (to
  the notebook) and resets the run; we do not touch it. Wrapping that exit in
  the same confirm modal is a possible later iteration, noted under Risks.
- **No global game chrome.** We deliberately reject a shell-level top bar
  rendered for every `surface: 'game'` page (it would double up with the escape
  HUD and fight the game's immersion). The control is placed per page.
- **No new history/back-stack semantics.** The control navigates to a fixed
  destination (`/practice` by default), it is not a browser-history "back".
- **No new modal/dialog primitive.** We reuse `ui/Modal.vue` and `ui/Button.vue`.

## Decisions

- **One reusable component, placed per page (`GameExitButton.vue`).** Chosen
  over a global shell chrome and over an opt-in prop on `BilingualTitle`. A
  per-page primitive keeps each game in control of its destination and of
  *whether* to confirm, never clashes with the escape HUD, and respects the
  project's "no god files / one responsibility per unit" rule. `BilingualTitle`
  stays purely presentational; the shell stays unaware of game chrome.
- **`← Práctica`, label reuses `nav.practice`.** A labeled back arrow (not a
  bare `✕`) is the most discoverable option and mirrors the escape room's `◀`.
  The visible label reuses the existing `nav.practice` key (already translated
  in all 8 locales). Only the aria-label and the modal strings are new keys.
- **Smart confirm: only with a live round.** The component takes a reactive
  `confirm` prop. The page passes `true` only while something is at stake:

  | Screen / state | `confirm` |
  |---|---|
  | Escape-room notebook (just browsing pages) | `false` |
  | Ruleta — `pick` phase (nothing started) | `false` |
  | Ruleta — `draw` / `play` phase (session is live) | `true` |

  The rule for ruleta is `phase !== 'pick'`: the moment a deck is picked the
  session is created and grammars are marked seen in the SRS, so `draw` already
  has state worth guarding, not just `play`.
- **The component owns navigation.** It takes a `to` prop (default `/practice`)
  and calls `router.push(to)` itself — directly when `confirm` is `false`, or
  after the user confirms. This makes the page-side API a single drop-in tag.
- **It is a `<button>`, not a `<NuxtLink>`.** Because the click is conditionally
  intercepted (to raise the modal), a link's native navigation would be wrong.
  This matches the escape room's `◀`, which is also a button. Tradeoff: no
  middle-click-to-new-tab — irrelevant inside an SPA app shell.

## File Layout

```
app/
  components/
    games/
      GameExitButton.vue        NEW. ← Práctica control + confirm modal.
  pages/
    practice/
      ruleta.vue                EDIT. Mount <GameExitButton :confirm="phase !== 'pick'" />.
    escape-room/
      index.vue                 EDIT. Mount <GameExitButton /> (no confirm).

i18n/locales/
  en.json es.json fr.json pt-BR.json
  th.json id.json vi.json ja.json       EDIT. Add games.exit* keys (×8).

tests/
  components/
    games/
      GameExitButton.test.ts    NEW. confirm/no-confirm flows, navigation, a11y.
```

Expected new code: ~120–160 LOC total. `GameExitButton.vue` target < 130 LOC.
No god files.

## Responsibilities — One Thing Per Unit

| Unit | Knows | Does not know |
|---|---|---|
| `GameExitButton.vue` | render the `← Práctica` button; raise the confirm modal when `confirm` is set; `router.push(to)` on a confirmed/unguarded exit | when a round is "live" (the page decides and passes `confirm`), game internals |
| `pages/practice/ruleta.vue` | that `phase !== 'pick'` means a live round → pass `confirm` | modal markup, navigation target |
| `pages/escape-room/index.vue` | it only browses → no confirm | modal markup, navigation target |
| `ui/Modal.vue` (reused) | overlay, focus trap, Escape/overlay-click close, scroll lock | exit semantics |
| `ui/Button.vue` (reused) | the `secondary` / `danger` action buttons | exit semantics |

## Component API

```vue
<!-- app/components/games/GameExitButton.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'

interface Props {
  /** Confirm before leaving. Pass a reactive flag (e.g. a live round). */
  confirm?: boolean
  /** Destination. Defaults to the practice hub. */
  to?: string
}
const props = withDefaults(defineProps<Props>(), { confirm: false, to: '/practice' })

const { t } = useI18n()
const router = useRouter()
const showConfirm = ref(false)

function onClick() {
  if (props.confirm) showConfirm.value = true
  else leave()
}
function leave() {
  showConfirm.value = false
  void router.push(props.to)
}
</script>

<template>
  <button type="button" class="game-exit" :aria-label="t('games.exit')" @click="onClick">
    <span class="game-exit__arrow" aria-hidden="true">←</span>
    <span class="game-exit__label">{{ t('nav.practice') }}</span>
  </button>

  <Modal
    :open="showConfirm"
    :title="t('games.exit_confirm_title')"
    :close-label="t('games.exit_confirm_cancel')"
    @close="showConfirm = false"
  >
    <p class="game-exit__confirm-body">{{ t('games.exit_confirm_body') }}</p>
    <div class="game-exit__confirm-actions">
      <Button variant="secondary" @click="showConfirm = false">
        {{ t('games.exit_confirm_cancel') }}
      </Button>
      <Button variant="danger" @click="leave">
        {{ t('games.exit_confirm_leave') }}
      </Button>
    </div>
  </Modal>
</template>
```

Styling: pixel chrome consistent with `EscapeRoom.vue`'s `er__back` and the
sidebar — bordered button on `--surface`, `← + label` inline, `:focus-visible`
ring (hard rule: never suppressed). Placed top-left as the first child of the
page, above `BilingualTitle`, `align-self: flex-start`.

### Page wiring

```vue
<!-- pages/practice/ruleta.vue -->
<div class="page">
  <GameExitButton :confirm="phase !== 'pick'" />
  <BilingualTitle ko="연습" :latin="t('title.practice')" />
  ...

<!-- pages/escape-room/index.vue -->
<div class="er-index">
  <GameExitButton />
  <BilingualTitle ko="탈출" latin="Escape Room" />
  ...
```

`GameExitButton` is auto-imported (Nuxt components dir), as is `useI18n` /
`useRouter`.

## i18n — `games.exit*` Keys (×8 locales)

Added under the existing `games` namespace in all 8 locale files. Visible label
reuses `nav.practice` (already present), so only these are new:

```jsonc
"games": {
  // ...existing keys...
  "exit": "Volver a Práctica",                 // aria-label of the ← button
  "exit_confirm_title": "¿Salir del juego?",
  "exit_confirm_body": "Perderás el progreso de esta ronda.",
  "exit_confirm_leave": "Salir",
  "exit_confirm_cancel": "Cancelar"
}
```

Rules respected:
- All 8 locale files get the identical key tree (asymmetric keys cause fallback
  surprises); each gets a real translation.
- These are neutral UI chrome strings — no Korean cultural particle (화이팅 etc.)
  is introduced or translated here.
- The modal's `closeLabel` (corner `X` aria) reuses `games.exit_confirm_cancel`
  — the corner X and the Cancel button do the same thing (stay).

## Data Flow

```
[ruleta, pick phase] user clicks ← Práctica
  → confirm = (phase !== 'pick') = false
  → onClick → leave() → router.push('/practice')   // straight to the hub

[ruleta, play phase] user clicks ← Práctica
  → confirm = true → showConfirm = true → <Modal open>
      · "Cancelar" / Esc / overlay click / corner X → showConfirm = false (stay)
      · "Salir" (danger) → leave() → router.push('/practice')

[escape-room notebook] user clicks ← Práctica
  → confirm = false → leave() → router.push('/practice')
```

## Edge Cases

| Situation | Behavior |
|---|---|
| Ruleta in `pick` phase | No modal; navigates straight to `/practice`. |
| Ruleta in `draw`/`play` phase | Modal asks first; only "Salir" navigates. |
| Round completed (CompletionBanner shown) but still `play` phase | Still confirms — harmless; the user can confirm. (Acceptable; not worth special-casing.) |
| Escape-room notebook | No modal (nothing to lose). |
| Rapid double-click on `← Práctica` while modal opens | Idempotent — second click lands on the already-open modal/overlay; no double push. |
| Keyboard user | Button is focusable; modal traps focus, `Esc` cancels, focus restores to the button on close (handled by `ui/Modal`). |
| Reduced motion / dark mode | Inherits `ui/Modal` + token-based button styles; no new motion or color literals. |

## Testing

### Component — `tests/components/games/GameExitButton.test.ts`

Follow existing component-test conventions: Vitest + `@vue/test-utils` `mount`,
i18n stub that echoes keys (assert on key names), `useRouter` mocked to capture
`push`.

- Renders the `← Práctica` button with the `games.exit` aria-label.
- **No confirm:** with `confirm` unset/false, clicking the button calls
  `router.push('/practice')` immediately and the modal never opens.
- **Confirm:** with `confirm: true`, clicking opens the modal and does **not**
  call `router.push` yet.
- Clicking "Salir" (danger) calls `router.push('/practice')` and closes.
- Clicking "Cancelar" closes the modal and does **not** navigate.
- Custom `to` prop routes to the provided destination.

(The page wiring — `phase !== 'pick'` driving `confirm` — is exercised by the
manual smoke below; the unit boundary is the component itself.)

### Manual verification (golden path)

Run `pnpm dev` from `/munbeop`:

1. `/practice` → open La Baraja. The `← Práctica` button is visible top-left.
2. On the deck shelf (`pick`), click it → returns to `/practice` with **no**
   modal.
3. Pick a deck, reach `draw`/`play`, click `← Práctica` → confirm modal appears.
4. "Cancelar" / `Esc` / click outside → stays in the game.
5. "Salir" → returns to `/practice`.
6. `/escape-room` notebook → `← Práctica` returns to the hub with no modal.
7. Mobile 360px: button + modal actions wrap cleanly; tap targets ≥ 44px.
8. Dark mode: button/modal honor `--surface` / `--border` / `--ink` tokens.

### Pre/post-commit verification

Project rule: `verify → commit → verify → push`.

Before each commit: `pnpm typecheck` (load-bearing — has caught real bugs),
`pnpm test`, `pnpm lint`. After commit, before push: all three again +
`pnpm build` (Nuxt 4 SPA — some errors only surface in build) + the manual
smoke above.

## Risks

- **Escape-room gameplay still resets without confirm.** Out of scope here, but
  it is the most destructive exit (loses a whole run). If the user wants, a
  follow-up can route its `◀` through the same modal — the component is built
  to be reused there.
- **`confirm` on a completed-but-not-reset ruleta round.** The guard is
  phase-based, so a finished round still prompts. Deemed acceptable (a confirm
  on an already-finished round is mildly redundant, never harmful) rather than
  threading completion state into the condition.
- **Button-as-navigation.** No middle-click/open-in-new-tab. Irrelevant for an
  in-app shell control and consistent with the existing escape `◀`.

## Open Questions

None blocking. Tactical choices left to the plan: exact pixel styling of the
button (match `er__back` vs a softer `secondary`-like chrome) and the precise
per-locale wording of the four new strings.
