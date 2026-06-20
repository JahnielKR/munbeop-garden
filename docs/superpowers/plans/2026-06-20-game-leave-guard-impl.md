# Game leave-guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prompt one "abandon?" modal on any navigation away from a game (sidebar, mobile nav, browser back, exit button) when a round is in progress, across all three games.

**Architecture:** A pure state-machine factory (`createLeaveGuard`) wrapped by a composable (`useGameLeaveGuard`) that binds it to Vue Router's `onBeforeRouteLeave` and `provide()`s it. A `GameLeaveConfirm.vue` modal and the existing `GameExitButton.vue` both `inject` the one guard so every exit path shares a single modal. Each game page supplies a reactive "in progress" predicate.

**Tech Stack:** Nuxt 4 SPA, Vue 3 Composition API, vue-router 4, TypeScript, Pinia, vitest + happy-dom + @vue/test-utils, pnpm. Commands run from `munbeop/`.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Create | `munbeop/app/composables/useGameLeaveGuard.ts` | Pure `createLeaveGuard` core + Vue `useGameLeaveGuard` wrapper + `GAME_LEAVE_GUARD` injection key + `GameLeaveGuard` type |
| Create | `munbeop/app/components/games/GameLeaveConfirm.vue` | The confirm modal, driven by the injected guard; reuses `games.exit_confirm_*` i18n |
| Modify | `munbeop/app/components/games/GameExitButton.vue` | Inject guard → `guardedPush`; drop own modal + `confirm` prop |
| Modify | `munbeop/app/pages/practice/particles.vue` | Guard predicate + `<GameExitButton>` + `<GameLeaveConfirm>` |
| Modify | `munbeop/app/pages/practice/ruleta.vue` | Guard predicate; drop `:confirm`; add `<GameLeaveConfirm>` |
| Modify | `munbeop/app/pages/escape-room/play.vue` | Guard predicate (store status) + `<GameLeaveConfirm>` |
| Create | `munbeop/tests/unit/games/game-leave-guard.test.ts` | Unit tests for `createLeaveGuard` |
| Create | `munbeop/tests/components/games/GameLeaveConfirm.test.ts` | Component test |
| Modify | `munbeop/tests/components/games/GameExitButton.test.ts` | Rewrite to the guarded flow |

No new i18n keys, no SQL, no store changes.

---

## Task 1: Leave-guard core + composable (pure logic first)

**Files:**
- Create: `munbeop/app/composables/useGameLeaveGuard.ts`
- Test: `munbeop/tests/unit/games/game-leave-guard.test.ts`

- [ ] **Step 1: Write the failing unit test**

Create `munbeop/tests/unit/games/game-leave-guard.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { createLeaveGuard } from '~/composables/useGameLeaveGuard'

function setup(dirty: boolean) {
  const push = vi.fn(async () => {})
  let isDirty = dirty
  const guard = createLeaveGuard({ push }, () => isDirty)
  return { push, guard, setDirty: (v: boolean) => (isDirty = v) }
}

describe('createLeaveGuard', () => {
  it('lets navigation pass when not dirty', () => {
    const { guard } = setup(false)
    expect(guard.onLeave({ fullPath: '/garden' })).toBe(true)
    expect(guard.confirmOpen.value).toBe(false)
  })

  it('blocks navigation and opens the modal when dirty', () => {
    const { guard } = setup(true)
    expect(guard.onLeave({ fullPath: '/garden' })).toBe(false)
    expect(guard.confirmOpen.value).toBe(true)
  })

  it('confirm() re-issues the stashed destination and closes', () => {
    const { guard, push } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.confirm()
    expect(guard.confirmOpen.value).toBe(false)
    expect(push).toHaveBeenCalledWith('/library')
  })

  it('allows the re-issued navigation through right after confirm()', () => {
    const { guard } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.confirm()
    expect(guard.onLeave({ fullPath: '/library' })).toBe(true)
  })

  it('cancel() closes and does not navigate', () => {
    const { guard, push } = setup(true)
    guard.onLeave({ fullPath: '/library' })
    guard.cancel()
    expect(guard.confirmOpen.value).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })

  it('guardedPush navigates directly when clean', () => {
    const { guard, push } = setup(false)
    guard.guardedPush('/practice')
    expect(push).toHaveBeenCalledWith('/practice')
    expect(guard.confirmOpen.value).toBe(false)
  })

  it('guardedPush opens the modal when dirty', () => {
    const { guard, push } = setup(true)
    guard.guardedPush('/practice')
    expect(push).not.toHaveBeenCalled()
    expect(guard.confirmOpen.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/unit/games/game-leave-guard.test.ts`
Expected: FAIL — cannot resolve `createLeaveGuard` from `~/composables/useGameLeaveGuard`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/composables/useGameLeaveGuard.ts`:

```ts
import { ref, provide, type InjectionKey, type Ref } from 'vue'
import { onBeforeRouteLeave, useRouter, type RouteLocationRaw } from 'vue-router'

export interface GameLeaveGuard {
  /** True while the confirm modal is open. */
  confirmOpen: Ref<boolean>
  /** Proceed with the pending navigation. */
  confirm: () => void
  /** Dismiss the modal and stay. */
  cancel: () => void
  /** Navigate to `to`, prompting first if a round is in progress. */
  guardedPush: (to: RouteLocationRaw) => void
  /** Internal route-leave handler. Returns false to block the navigation. */
  onLeave: (to: { fullPath: string }) => boolean
}

export const GAME_LEAVE_GUARD: InjectionKey<GameLeaveGuard> = Symbol('game-leave-guard')

interface MinimalRouter {
  push: (to: RouteLocationRaw) => Promise<unknown> | void
}

/**
 * Pure navigation-guard state machine — framework-agnostic so it unit-tests
 * without a router/component context.
 */
export function createLeaveGuard(router: MinimalRouter, isDirty: () => boolean): GameLeaveGuard {
  const confirmOpen = ref(false)
  let pendingTo: RouteLocationRaw | null = null
  let confirmed = false

  function onLeave(to: { fullPath: string }): boolean {
    if (confirmed || !isDirty()) return true
    pendingTo = to.fullPath
    confirmOpen.value = true
    return false
  }

  function confirm() {
    confirmOpen.value = false
    const to = pendingTo
    pendingTo = null
    if (to == null) return
    confirmed = true
    void Promise.resolve(router.push(to)).finally(() => {
      confirmed = false
    })
  }

  function cancel() {
    confirmOpen.value = false
    pendingTo = null
  }

  function guardedPush(to: RouteLocationRaw) {
    if (!isDirty()) {
      void router.push(to)
      return
    }
    pendingTo = to
    confirmOpen.value = true
  }

  return { confirmOpen, confirm, cancel, guardedPush, onLeave }
}

/**
 * Binds the core to the real router + route-leave guard and provides it to
 * descendants (GameLeaveConfirm, GameExitButton). Call once per game page.
 */
export function useGameLeaveGuard(isDirty: () => boolean): GameLeaveGuard {
  const router = useRouter()
  const guard = createLeaveGuard(router, isDirty)
  onBeforeRouteLeave((to) => guard.onLeave(to))
  provide(GAME_LEAVE_GUARD, guard)
  return guard
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test tests/unit/games/game-leave-guard.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useGameLeaveGuard.ts munbeop/tests/unit/games/game-leave-guard.test.ts
git commit -m "feat(games): leave-guard core + composable"
```

---

## Task 2: GameLeaveConfirm modal component

**Files:**
- Create: `munbeop/app/components/games/GameLeaveConfirm.vue`
- Test: `munbeop/tests/components/games/GameLeaveConfirm.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `munbeop/tests/components/games/GameLeaveConfirm.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

function fakeGuard(open = false) {
  return {
    confirmOpen: ref(open),
    confirm: vi.fn(),
    cancel: vi.fn(),
    guardedPush: vi.fn(),
    onLeave: vi.fn(() => true),
  }
}

function mountConfirm(guard: ReturnType<typeof fakeGuard>) {
  return mount(GameLeaveConfirm, {
    attachTo: document.body,
    global: { provide: { [GAME_LEAVE_GUARD as symbol]: guard } },
  })
}

describe('GameLeaveConfirm', () => {
  it('renders no modal when the guard is closed', () => {
    mountConfirm(fakeGuard(false))
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('shows the modal when the guard is open', () => {
    mountConfirm(fakeGuard(true))
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
    expect(document.body.textContent).toContain('games.exit_confirm_body')
  })

  it('calls confirm() when the danger button is clicked', () => {
    const guard = fakeGuard(true)
    mountConfirm(guard)
    ;(document.body.querySelector('.button[data-variant="danger"]') as HTMLElement).click()
    expect(guard.confirm).toHaveBeenCalled()
  })

  it('calls cancel() when the secondary button is clicked', () => {
    const guard = fakeGuard(true)
    mountConfirm(guard)
    ;(document.body.querySelector('.button[data-variant="secondary"]') as HTMLElement).click()
    expect(guard.cancel).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/components/games/GameLeaveConfirm.test.ts`
Expected: FAIL — cannot resolve `GameLeaveConfirm.vue`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/components/games/GameLeaveConfirm.vue`:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

/**
 * Confirm modal for leaving a game mid-round. Driven by the page's
 * useGameLeaveGuard() via inject — render it once per game page.
 */
const { t } = useI18n()
const guard = inject(GAME_LEAVE_GUARD, null)
</script>

<template>
  <Modal
    v-if="guard"
    :open="guard.confirmOpen.value"
    :title="t('games.exit_confirm_title')"
    :close-label="t('games.exit_confirm_cancel')"
    @close="guard.cancel()"
  >
    <p class="leave-confirm__body">{{ t('games.exit_confirm_body') }}</p>
    <div class="leave-confirm__actions">
      <Button variant="secondary" @click="guard.cancel()">
        {{ t('games.exit_confirm_cancel') }}
      </Button>
      <Button variant="danger" @click="guard.confirm()">
        {{ t('games.exit_confirm_leave') }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
.leave-confirm__body {
  margin: 0 0 20px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  color: var(--ink, var(--text));
}
.leave-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test tests/components/games/GameLeaveConfirm.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/games/GameLeaveConfirm.vue munbeop/tests/components/games/GameLeaveConfirm.test.ts
git commit -m "feat(games): GameLeaveConfirm modal driven by the leave-guard"
```

---

## Task 3: Refactor GameExitButton to use the guard

**Files:**
- Modify: `munbeop/app/components/games/GameExitButton.vue`
- Test: `munbeop/tests/components/games/GameExitButton.test.ts` (rewrite)

- [ ] **Step 1: Rewrite the test to the guarded flow**

Replace the entire contents of `munbeop/tests/components/games/GameExitButton.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

const pushSpy = vi.fn(async () => {})
vi.stubGlobal('useRouter', () => ({ push: pushSpy }))

function fakeGuard() {
  return {
    confirmOpen: ref(false),
    confirm: vi.fn(),
    cancel: vi.fn(),
    guardedPush: vi.fn(),
    onLeave: vi.fn(() => true),
  }
}

describe('GameExitButton', () => {
  beforeEach(() => pushSpy.mockClear())

  it('renders the back button with the games.exit aria-label and nav.practice label', () => {
    const w = mount(GameExitButton)
    const btn = w.get('.game-exit')
    expect(btn.attributes('aria-label')).toBe('games.exit')
    expect(btn.text()).toContain('nav.practice')
  })

  it('pushes directly to /practice when no guard is provided', async () => {
    const w = mount(GameExitButton)
    await w.get('.game-exit').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/practice')
  })

  it('routes to a custom destination via the to prop', async () => {
    const w = mount(GameExitButton, { props: { to: '/escape-room' } })
    await w.get('.game-exit').trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/escape-room')
  })

  it('routes its click through the injected guard when present', async () => {
    const guard = fakeGuard()
    const w = mount(GameExitButton, {
      global: { provide: { [GAME_LEAVE_GUARD as symbol]: guard } },
    })
    await w.get('.game-exit').trigger('click')
    expect(guard.guardedPush).toHaveBeenCalledWith('/practice')
    expect(pushSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/components/games/GameExitButton.test.ts`
Expected: FAIL — the current component still owns a modal / `confirm` prop; the guard-injection test fails.

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `munbeop/app/components/games/GameExitButton.vue`:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

/**
 * Game exit control: a "← Práctica" button. Routes its click through the
 * page's leave guard (inject) so the confirm modal — when a round is in
 * progress — is the same one the sidebar/back navigation triggers. Falls back
 * to a direct push when no guard is present (e.g. the escape-room menu).
 *
 * Place it as the first child of a flex-column page (align-self: flex-start).
 */
interface Props {
  /** Destination route. Defaults to the practice hub. */
  to?: string
}
const props = withDefaults(defineProps<Props>(), { to: '/practice' })

const { t } = useI18n()
const router = useRouter()
const guard = inject(GAME_LEAVE_GUARD, null)

function onClick() {
  if (guard) guard.guardedPush(props.to)
  else void router.push(props.to)
}
</script>

<template>
  <button type="button" class="game-exit" :aria-label="t('games.exit')" @click="onClick">
    <span class="game-exit__arrow" aria-hidden="true">←</span>
    <span class="game-exit__label">{{ t('nav.practice') }}</span>
  </button>
</template>

<style scoped>
/* Pixel chrome consistent with the escape-room HUD back control and the
 * sidebar nav: bordered button on --surface, arrow + label inline. */
.game-exit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-strong);
  cursor: pointer;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  transition:
    background var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.game-exit:hover {
  background: var(--surface-hover);
  transform: translate(-1px, 0);
}
.game-exit:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.game-exit__arrow {
  font-size: 12px;
  line-height: 1;
}
/* Thai / Vietnamese tone marks + Japanese kanji lose detail at 10px — bump
 * one step, same rule the sidebar nav uses. */
:lang(th) .game-exit__label,
:lang(vi) .game-exit__label,
:lang(ja) .game-exit__label {
  font-size: 13px;
}
@media (prefers-reduced-motion: reduce) {
  .game-exit {
    transition: none;
  }
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test tests/components/games/GameExitButton.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/games/GameExitButton.vue munbeop/tests/components/games/GameExitButton.test.ts
git commit -m "refactor(games): GameExitButton routes through the leave-guard"
```

---

## Task 4: Wire Particle Lab

**Files:**
- Modify: `munbeop/app/pages/practice/particles.vue`

- [ ] **Step 1: Add the imports**

In `<script setup>`, after the existing `import ProgressDots ...` line, add:

```ts
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
```

- [ ] **Step 2: Register the guard after `mode` is defined**

Immediately after the line `const mode = ref<Mode>(route.query.mode === 'drill' ? 'drill' : 'explore')`, add:

```ts
// Confirm before leaving an in-progress drill round (Explore is read-only).
useGameLeaveGuard(() => mode.value === 'drill' && drill.phase.value !== 'done')
```

- [ ] **Step 3: Add the button and the modal to the template**

Make `<GameExitButton />` the first child of `.lab` (before `<BilingualTitle>`), and add `<GameLeaveConfirm />` as the last child of `.lab` (after the `</template>` of the drill block, before `</div>`):

```vue
  <div class="lab">
    <GameExitButton />
    <BilingualTitle ko="조사 연구소" :latin="t('particles.title')" />
```

```vue
    </template>

    <GameLeaveConfirm />
  </div>
```

- [ ] **Step 4: Typecheck + lint the page**

Run: `pnpm typecheck`
Expected: clean (exit 0).
Run: `npx eslint app/pages/practice/particles.vue`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/pages/practice/particles.vue
git commit -m "feat(particles): exit button + leave-guard on the drill"
```

---

## Task 5: Wire Ruleta

**Files:**
- Modify: `munbeop/app/pages/practice/ruleta.vue`

- [ ] **Step 1: Add the imports**

After the existing `import GameExitButton ...` line, add:

```ts
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
```

- [ ] **Step 2: Register the guard after `phase` is defined**

Immediately after the line `const phase = ref<'pick' | 'draw' | 'play'>('pick')`, add:

```ts
// Confirm before leaving once a deck is picked (draw/play), like the old button.
useGameLeaveGuard(() => phase.value !== 'pick')
```

- [ ] **Step 3: Drop the `:confirm` prop and add the modal**

Change the template line `<GameExitButton :confirm="phase !== 'pick'" />` to:

```vue
    <GameExitButton />
```

Add `<GameLeaveConfirm />` as the last child of the page's root element (just before its closing `</div>`):

```vue
    <GameLeaveConfirm />
  </div>
```

- [ ] **Step 4: Typecheck + lint the page**

Run: `pnpm typecheck`
Expected: clean.
Run: `npx eslint app/pages/practice/ruleta.vue`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/pages/practice/ruleta.vue
git commit -m "feat(ruleta): leave-guard replaces the button-only confirm"
```

---

## Task 6: Wire Escape-room gameplay

**Files:**
- Modify: `munbeop/app/pages/escape-room/play.vue`

- [ ] **Step 1: Add the imports + store**

In `<script setup>`, after the existing imports add:

```ts
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useEscapeRoomStore } from '~/stores/escape-room'
```

After the existing `const router = useRouter()` line, add:

```ts
const escape = useEscapeRoomStore()
// Confirm before leaving an active run (not idle / gameover / completed).
useGameLeaveGuard(() => escape.status === 'playing')
```

- [ ] **Step 2: Add the modal to the template**

Add `<GameLeaveConfirm />` as a sibling of `<EscapeRoom>` inside the page's root element (just before the root's closing tag):

```vue
    <GameLeaveConfirm />
```

- [ ] **Step 3: Typecheck + lint the page**

Run: `pnpm typecheck`
Expected: clean.
Run: `npx eslint app/pages/escape-room/play.vue`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/pages/escape-room/play.vue
git commit -m "feat(escape-room): leave-guard on an active run"
```

---

## Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all pass (the 3 games' existing suites + the new guard/confirm/button tests). 0 failures.

- [ ] **Step 2: Typecheck + lint the whole project**

Run: `pnpm typecheck`  → exit 0.
Run: `pnpm lint`  → 0 errors (pre-existing `scripts/*.mjs` console warnings are acceptable).

- [ ] **Step 3: Manual smoke (pnpm dev, logged in)**

- Particle Lab: enter the Choque drill, answer one item, then click a sidebar tab → confirm modal; **Cancelar** stays; repeat and **Salir** leaves. Try the browser back button and the new `← Práctica` button — same modal. In **Explorar** and on the drill **summary**, navigation never prompts.
- Ruleta: pick a deck (phase draw/play) → sidebar tab prompts; on the **pick** shelf it does not.
- Escape-room: start a run at `/escape-room/play` → sidebar/back prompts; the level **menu** (`/escape-room`) never prompts.
- Light/dark + mobile 360px: modal readable, buttons reachable.

- [ ] **Step 4: Commit any fixes; the feature is complete**

```bash
git add -A
git commit -m "test(games): verify leave-guard across all three games"
```

---

## Self-review

**Spec coverage:** mechanism (`onBeforeRouteLeave`) → Task 1; composable + key + type → Task 1; `GameLeaveConfirm` reusing `games.exit_confirm_*` → Task 2; `GameExitButton` refactor (drop `confirm`/modal, fallback push) → Task 3; per-game predicates (particles drill-not-done, ruleta ≠ pick, escape-room status playing) → Tasks 4/5/6; in-app-only (no `beforeunload`) → respected (no native handler added); tests (unit + 2 component) → Tasks 1/2/3; verification → Task 7. All spec sections covered.

**Placeholder scan:** none — every step has full code/commands.

**Type consistency:** `GameLeaveGuard` (confirmOpen, confirm, cancel, guardedPush, onLeave) is defined once in Task 1 and the fakes in Tasks 2/3 and the injects in Tasks 2/3 match it exactly. `GAME_LEAVE_GUARD` injection key name is identical everywhere. `useGameLeaveGuard(isDirty)` signature matches its three call sites (Tasks 4/5/6). `escape.status === 'playing'` matches the store's `Status` union.
