# Welcome v2 + palette repaint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the five v2 follow-ups on top of the freshly-merged welcome landing: sidebar trim, subtitle trim, pan transitions between welcome and the in-app garden, hover-glitch on the brand mark, and a full repaint of the light theme to the "windrise living" palette.

**Architecture:** Six sequential phases. The palette swap goes first because every later visual change benefits from it. Pan transitions live in a new `useRouteTransition` singleton + CSS keyframes, wired into `NuxtPage` at the app shell. The brand glitch is a 3-layer SFC reshuffle + CSS-driven animation, gated by a single JS `setTimeout` so reduced-motion users opt out cleanly. Each phase ships as one commit on `claude/funny-boyd-202998`, then fast-forwards `main`.

**Tech Stack:** Nuxt 4 SPA (ssr: false), Vue 3 `<script setup>`, Pinia, Vitest + happy-dom, @nuxtjs/i18n v9. Spec at [`docs/superpowers/specs/2026-06-04-welcome-v2-and-palette.md`](../specs/2026-06-04-welcome-v2-and-palette.md).

---

## Conventions

- Paths relative to the worktree root: `C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-boyd-202998/`.
- Commands run from `munbeop/` unless noted otherwise.
- Commit naming: `feat(welcome.v2.N): summary` / `fix(welcome.v2.N.x): summary` / `chore(welcome.v2.N): summary`.
- Each task ends: `git add <files>` → `git commit` → `git push origin HEAD:main` (fast-forward).
- Verify both BEFORE and AFTER each commit: `pnpm lint && pnpm typecheck && pnpm test`.

---

## Task 1 — Palette token swap (welcome.v2.1)

**Files:**
- Modify: `munbeop/app/assets/styles/tokens/colors-light.css` (rewrite per spec §6)
- Modify: `munbeop/app/components/welcome/WelcomeAuthOptions.vue` (Kakao `#1a1a1a` → `var(--always-dark)`)

- [ ] **Step 1.1: Rewrite `colors-light.css` to the v3 palette**

Overwrite `munbeop/app/assets/styles/tokens/colors-light.css` with:

```css
/* tokens/colors-light.css
 * Light theme v3 ("windrise living").
 *
 * The palette borrows from the Mondstadt windrise asset that backs the
 * welcome page: bone-white surface, meadow-green action, sky-blue
 * lines/focus, warm cream chunky-pixel shadow, gold for special CTAs.
 *
 * Layers, top to bottom:
 *   1. Theme-invariants (same in light and dark; dark inherits via :root)
 *   2. Brand swatches — light values
 *   3. Semantic aliases — components reference these, never brand swatches
 *
 * Dark theme (colors-dark.css) is unchanged in this round — a separate
 * dark-v3 spec follows once light v3 settles.
 */

:root {
  /* ---- 1. Theme-invariants ---- */
  --always-dark: #1a1a1a;
  --always-cream: #f8efd0;

  /* ---- Welcome page sky band (theme-invariant; used only by the scanline overlay) ---- */
  --sky-day: #87d5ff;
  --sky-night: #2a1a4a;

  /* ---- 2. Brand swatches (v3 — windrise living) ---- */
  --paper: #f4f0e2;        /* bone-white (main surface) */
  --paper-warm: #efe9d2;   /* slightly warmer bone for headers, stripes */
  --paper-deep: #e8e4d4;   /* THE panel tone — sidebar, nav, raised */
  --ink: #1f3a4d;          /* deep-ocean body text */
  --ink-soft: #4a6a82;     /* cool soft slate for secondary text */
  --ink-line: #14202c;     /* NEAR-BLACK for chunky pixel border on every button */
  --jade: #5ea84a;         /* meadow-green */
  --jade-deep: #3f7a30;
  --meadow: var(--jade);   /* readable alias */
  --meadow-deep: var(--jade-deep);
  --sky: #87d5ff;          /* the windrise sky */
  --sky-deep: #4eb8e8;     /* the single sky-blue line color */
  --red: #c43d3d;          /* flower-red */
  --red-deep: #9d2525;
  --gold: #f0c84a;         /* sun-amber */
  --hover-bg: #f2e8c8;     /* WARM cream pulse on hover */
  --shadow-cream: #c2a766; /* warm cream chunky pixel shadow */

  /* ---- Bomi sprite palette (Plan 4 — character identity, untouched) ---- */
  --gold-shadow: #a06b2e;
  --straw: #f0c84a;
  --straw-shadow: #c89030;
  --straw-texture: #a8741e;
  --wing: #ebe6d7;
  --wing-shadow: #a8b0a2;
  --ribbon-red: #c23e3e;
  --ribbon-red-deep: #9d2e2e;
  --pink-bobble: #e58aa0;

  /* ---- 3. Semantic aliases ---- */
  --bg: var(--paper);
  --surface: var(--paper-deep);              /* was --paper-warm */
  --surface-hover: var(--hover-bg);          /* was --paper-deep */
  --text: var(--ink);
  --text-soft: var(--ink-soft);
  --border: var(--ink-line);                 /* was #d8b96a — now black outline */
  --border-strong: var(--ink-line);          /* was --ink-soft */
  --shadow-color: var(--shadow-cream);       /* was --ink-soft — now warm cream */
  --focus-ring: var(--sky-deep);             /* was --jade-deep */
  --link: var(--sky-deep);                   /* was --jade-deep */
  --link-visited: var(--ink-soft);
  --accent: var(--meadow-deep);
  --accent-bright: var(--meadow);
  --danger: var(--red-deep);
  --danger-bright: var(--red);
  --info: var(--sky);
  --warning: var(--gold);
  --success: var(--meadow-deep);
  --mastery-seedling: var(--ink-soft);
  --mastery-plant: var(--gold);
  --mastery-tree: var(--meadow-deep);
  --text-on-accent: var(--always-cream);     /* was --paper — kept readable on meadow */
  --text-on-danger: var(--always-cream);     /* was --paper */
  --text-on-info: var(--always-dark);
  --text-on-warning: var(--always-dark);
}
```

- [ ] **Step 1.2: Replace hardcoded Kakao text/border hex with token**

In `munbeop/app/components/welcome/WelcomeAuthOptions.vue`, find the Kakao block (around line 145):

```css
.opt--kakao { background: #fee500; color: #1a1a1a; border-color: #1a1a1a; }
```

Replace with (Kakao brand yellow STAYS, but the text/border references the theme-invariant token):

```css
.opt--kakao { background: #fee500; color: var(--always-dark); border-color: var(--always-dark); }
```

The `:hover` line on the next row stays unchanged (`background: #ffe940` is Kakao brand hover).

- [ ] **Step 1.3: Verify lint + typecheck + tests still pass**

```bash
cd munbeop
pnpm lint
pnpm typecheck
pnpm test
```

Expected: all green (the swap is value-only, no structural change; no test asserts a specific color value).

- [ ] **Step 1.4: Commit and merge**

```bash
git add munbeop/app/assets/styles/tokens/colors-light.css munbeop/app/components/welcome/WelcomeAuthOptions.vue
git commit -m "feat(welcome.v2.1): palette v3 token swap (bone-white + meadow + sky-blue + cream shadow)"
git push origin HEAD:main
```

Verify: `git status` clean, `git rev-parse origin/main` matches `HEAD`.

---

## Task 2 — Sidebar trim + subtitle trim (welcome.v2.2)

**Files:**
- Modify: `munbeop/app/components/welcome/WelcomeAuthOptions.vue` (remove 2 buttons, separator, anon handler)
- Modify: `munbeop/app/components/welcome/WelcomeBrandMark.vue` (drop `· 화이팅`)

- [ ] **Step 2.1: Drop the "Send a magic link" button**

In `munbeop/app/components/welcome/WelcomeAuthOptions.vue`, locate this block in the `<template>`:

```vue
    <button type="button" class="opt" @click="openEmail('magic')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_magic') }}</span>
    </button>
```

Delete it entirely.

- [ ] **Step 2.2: Drop the separator + "Continue without an account" button**

Still in `WelcomeAuthOptions.vue`, locate:

```vue
    <hr class="options__sep">

    <button type="button" class="opt opt--anon" @click="anonEntry">
      <span>{{ t('welcome.menu.anon') }}</span>
    </button>
```

Delete both elements.

- [ ] **Step 2.3: Drop the `anonEntry()` handler and the `router` dependency it used**

Still in `WelcomeAuthOptions.vue`, in `<script setup>`:

```ts
const router = useRouter()
```

`router` is now unused — delete that line.

And delete the `anonEntry` function:

```ts
async function anonEntry() {
  emit('dialog', t('welcome.dialog.anon'))
  setWelcomedFlag()
  await router.push('/')
}
```

- [ ] **Step 2.4: Drop the `.options__sep` and `.opt--anon` CSS rules**

Still in `WelcomeAuthOptions.vue`, in `<style scoped>`:

```css
.opt--anon  { font-family: 'Inter', sans-serif; font-size: 12px; opacity: 0.85; }
.options__sep {
  border: 0;
  border-top: 2px dashed var(--border);
  margin: 6px 0;
}
```

Delete both rules.

- [ ] **Step 2.5: Drop `· 화이팅` from the welcome subtitle**

In `munbeop/app/components/welcome/WelcomeBrandMark.vue`, the template currently reads:

```vue
    <p class="brand__subtitle">
      {{ t('welcome.brand.subtitle') }} · <span lang="ko">화이팅</span>
    </p>
```

Replace with:

```vue
    <p class="brand__subtitle">{{ t('welcome.brand.subtitle') }}</p>
```

- [ ] **Step 2.6: Verify**

```bash
cd munbeop
pnpm lint
pnpm typecheck
pnpm test
```

Expected: all green. (No test references the dropped buttons or 화이팅 in the subtitle.)

- [ ] **Step 2.7: Commit and merge**

```bash
git add munbeop/app/components/welcome/WelcomeAuthOptions.vue munbeop/app/components/welcome/WelcomeBrandMark.vue
git commit -m "feat(welcome.v2.2): trim sidebar to 4 options + drop · 화이팅 from welcome subtitle"
git push origin HEAD:main
```

---

## Task 3 — useRouteTransition composable + CSS + NuxtPage wire (welcome.v2.3)

**Files:**
- Create: `munbeop/app/composables/useRouteTransition.ts`
- Create: `munbeop/tests/composables/useRouteTransition.test.ts`
- Create: `munbeop/app/assets/styles/transitions.css`
- Modify: `munbeop/app/assets/styles/main.css` (import the new transitions.css)
- Modify: `munbeop/app/app.vue` (bind NuxtPage transition)

- [ ] **Step 3.1: Write the failing test for `useRouteTransition`**

Create `munbeop/tests/composables/useRouteTransition.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useRouteTransition, _resetRouteTransitionForTest } from '~/composables/useRouteTransition'

describe('useRouteTransition', () => {
  beforeEach(() => { _resetRouteTransitionForTest() })

  it('starts with direction = null', () => {
    const { direction } = useRouteTransition()
    expect(direction.value).toBe(null)
  })

  it('setEnter() flips direction to "enter"', () => {
    const { direction, setEnter } = useRouteTransition()
    setEnter()
    expect(direction.value).toBe('enter')
  })

  it('setExit() flips direction to "exit"', () => {
    const { direction, setExit } = useRouteTransition()
    setExit()
    expect(direction.value).toBe('exit')
  })

  it('clear() resets direction to null', () => {
    const { direction, setEnter, clear } = useRouteTransition()
    setEnter()
    expect(direction.value).toBe('enter')
    clear()
    expect(direction.value).toBe(null)
  })

  it('all callers share the same singleton state', () => {
    const a = useRouteTransition()
    const b = useRouteTransition()
    a.setExit()
    expect(b.direction.value).toBe('exit')
  })
})
```

- [ ] **Step 3.2: Run the test, confirm it fails**

```bash
cd munbeop
pnpm test useRouteTransition
```

Expected: FAIL with "Cannot find module '~/composables/useRouteTransition'".

- [ ] **Step 3.3: Implement `useRouteTransition`**

Create `munbeop/app/composables/useRouteTransition.ts`:

```ts
import { ref, readonly } from 'vue'

export type RouteTransitionDirection = 'enter' | 'exit' | null

// Module-level singleton — all callers share the same reactive ref.
// `enter`: pan-right (welcome → in-app). "Entering the castle."
// `exit`:  pan-left  (in-app → welcome). "Leaving the castle."
// `null`:  any other navigation falls back to the default fade.
const direction = ref<RouteTransitionDirection>(null)

/**
 * useRouteTransition — direction state for the page-level <NuxtPage>
 * transition. The composable mutates a module-level singleton; the
 * top-level app reads `direction` to pick the keyframe (pan-right /
 * pan-left / fade) for the next page-enter.
 *
 * Hook points:
 *   - AuthCallback page + WelcomeEmailForm.submit() → setEnter() before
 *     navigating to /.
 *   - useAuth().signOutAndExit() → setExit() before navigating to /welcome.
 */
export function useRouteTransition() {
  function setEnter() { direction.value = 'enter' }
  function setExit() { direction.value = 'exit' }
  function clear() { direction.value = null }

  return {
    direction: readonly(direction),
    setEnter,
    setExit,
    clear,
  }
}

// Test-only: reset the singleton between cases.
export function _resetRouteTransitionForTest() {
  direction.value = null
}
```

- [ ] **Step 3.4: Run the test, confirm it passes**

```bash
pnpm test useRouteTransition
```

Expected: PASS, all 5 cases green.

- [ ] **Step 3.5: Create `transitions.css` with the keyframe sets**

Create `munbeop/app/assets/styles/transitions.css`:

```css
/* transitions.css
 * Page-level transitions for <NuxtPage :transition>. The keyframe
 * name is bound via useRouteTransition() in the app shell.
 *
 *   pan-right — welcome → in-app ("entering the castle"). Old surface
 *               slides LEFT off-screen, new surface slides IN from the
 *               right.
 *   pan-left  — in-app → welcome ("leaving the castle"). Mirror of
 *               pan-right.
 *   fade      — default for any other route change.
 *
 * Easing: cubic-bezier(0.65, 0, 0.35, 1) — snappy out, gentle in.
 * Duration: 700 ms.
 */

.pan-right-enter-active,
.pan-right-leave-active {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
}
.pan-right-enter-from { transform: translateX(100%); }
.pan-right-leave-to { transform: translateX(-100%); }

.pan-left-enter-active,
.pan-left-leave-active {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
}
.pan-left-enter-from { transform: translateX(-100%); }
.pan-left-leave-to { transform: translateX(100%); }

.fade-enter-active,
.fade-leave-active { transition: opacity 180ms ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .pan-right-enter-active,
  .pan-right-leave-active,
  .pan-left-enter-active,
  .pan-left-leave-active {
    transition: opacity 200ms linear;
  }
  .pan-right-enter-from,
  .pan-right-leave-to,
  .pan-left-enter-from,
  .pan-left-leave-to {
    transform: none;
    opacity: 0;
  }
}
```

- [ ] **Step 3.6: Import `transitions.css` from `main.css`**

Open `munbeop/app/assets/styles/main.css` and add this line at the end of the imports section (look for other `@import` lines or a tokens import block):

```css
@import './transitions.css';
```

If `main.css` doesn't currently use `@import` and instead lives as a single root file, add the import at the very top.

- [ ] **Step 3.7: Wire the transition into `<NuxtPage>` in `app.vue`**

In `munbeop/app/app.vue`, the current template is:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Replace with:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useBomiStore } from '~/stores/bomi'

const { init } = useAuth()
const { hydrate: hydrateTheme } = useTheme()
const { direction } = useRouteTransition()

const pageTransitionName = computed(() => {
  const d = direction.value
  if (d === 'enter') return 'pan-right'
  if (d === 'exit') return 'pan-left'
  return 'fade'
})

useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('mungarden:theme');if(t==='dark')document.documentElement.dataset.theme='dark';}catch(e){}})();`,
      tagPosition: 'head',
    },
  ],
})

onMounted(() => {
  hydrateTheme()
  void init()

  const bomi = useBomiStore()
  const ACTIVITY_EVENTS = [
    'mousemove',
    'keydown',
    'pointerdown',
    'wheel',
    'touchstart',
    'focusin',
  ] as const
  function onActivity() { bomi.resetActivity() }
  for (const evt of ACTIVITY_EVENTS) {
    window.addEventListener(evt, onActivity, { passive: true })
  }
  onUnmounted(() => {
    for (const evt of ACTIVITY_EVENTS) {
      window.removeEventListener(evt, onActivity)
    }
  })
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: pageTransitionName, mode: 'out-in' }" />
  </NuxtLayout>
</template>
```

Compared to the current `app.vue`:
- The `<script setup>` import list grows by `computed`.
- A new `useRouteTransition()` call + `pageTransitionName` computed.
- `<NuxtPage />` becomes `<NuxtPage :transition="{ name: pageTransitionName, mode: 'out-in' }" />`.

Everything else (Bomi listeners, FOUC theme script, auth init) stays as-is.

- [ ] **Step 3.8: Verify all tests + lint + typecheck**

```bash
cd munbeop
pnpm test
pnpm lint
pnpm typecheck
```

Expected: all green.

- [ ] **Step 3.9: Commit and merge**

```bash
git add munbeop/app/composables/useRouteTransition.ts munbeop/tests/composables/useRouteTransition.test.ts munbeop/app/assets/styles/transitions.css munbeop/app/assets/styles/main.css munbeop/app/app.vue
git commit -m "feat(welcome.v2.3): useRouteTransition composable + pan-right/pan-left CSS + NuxtPage wire"
git push origin HEAD:main
```

---

## Task 4 — Pan hookups (welcome.v2.4)

**Files:**
- Modify: `munbeop/app/composables/useAuth.ts` (add `signOutAndExit()`)
- Modify: `munbeop/app/components/welcome/WelcomeEmailForm.vue` (setEnter before nav)
- Modify: `munbeop/app/components/welcome/WelcomeAuthOptions.vue` (setEnter on provider start — actually NO, see step 4.3)
- Modify: `munbeop/app/pages/auth/callback.vue` (setEnter before nav to /)
- Modify: `munbeop/app/components/layout/AccountWidget.vue` (use signOutAndExit; update onSignIn target)

- [ ] **Step 4.1: Add `signOutAndExit` to `useAuth.ts`**

In `munbeop/app/composables/useAuth.ts`, after the `signOut` function (around line 87) and before `return { ... }`, insert:

```ts
  async function signOutAndExit() {
    const { setExit } = useRouteTransition()
    setExit()
    const { error } = await $supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      // Defer the actual navigation by a microtask so the transition
      // direction is committed before NuxtPage re-renders.
      await Promise.resolve()
    }
    const router = useRouter()
    if (!error) await router.push('/welcome')
    return { error }
  }
```

Then update the return statement to expose it:

```ts
  return { init, signUp, signIn, signInMagicLink, signInWithProvider, signOut, signOutAndExit, runPostLoginMigration }
```

- [ ] **Step 4.2: `WelcomeEmailForm.submit()` sets enter on success**

Open `munbeop/app/components/welcome/WelcomeEmailForm.vue`. Find the current `submit()` function in `<script setup>`. Locate the success branch (after `if (result.error) { ... return }`):

```ts
    if (props.mode === 'magic') {
      emit('info', t('auth.magic_link_sent'))
      return
    }
    emit('success')
    await router.push('/')
```

Replace with:

```ts
    if (props.mode === 'magic') {
      emit('info', t('auth.magic_link_sent'))
      return
    }
    emit('success')
    const { setEnter } = useRouteTransition()
    setEnter()
    await router.push('/')
```

(`setEnter` is set right before the navigation so the next NuxtPage render uses `pan-right`.)

- [ ] **Step 4.3: Check whether the OAuth flow needs a hookup**

OAuth flow with Supabase performs a FULL page redirect to the provider. Setting `setEnter()` on the WelcomeAuthOptions side is useless because the SPA unloads before the next page renders. The pan plays only when the provider redirects back to `/auth/callback` (an SPA page) which then routes to `/`.

So: NO change in `WelcomeAuthOptions.vue` for OAuth. The `setEnter()` happens in the callback page (next step).

- [ ] **Step 4.4: `/auth/callback` page fires `setEnter()` before navigating**

In `munbeop/app/pages/auth/callback.vue`, the current `onMounted` ends with:

```ts
  await runPostLoginMigration()
  status.value = 'success'
  toast.show(t('auth.callback_success'))
  await navigateTo('/', { replace: true })
```

Insert `setEnter()` immediately before the `navigateTo` call. Final block:

```ts
  await runPostLoginMigration()
  status.value = 'success'
  toast.show(t('auth.callback_success'))
  const { setEnter } = useRouteTransition()
  setEnter()
  await navigateTo('/', { replace: true })
```

No new imports needed — `useRouteTransition` is auto-imported (lives in `app/composables/`).

- [ ] **Step 4.5: `AccountWidget.vue` switches to `signOutAndExit()` + retargets sign-in URL**

In `munbeop/app/components/layout/AccountWidget.vue`, the current `<script setup>` is:

```ts
const auth = useAuthStore()
const { signOut } = useAuth()
const { t } = useI18n()
const router = useRouter()

async function onSignOut() {
  await signOut()
  router.push('/')
}

function onSignIn() {
  router.push('/auth/sign-in')
}
```

Replace with:

```ts
const auth = useAuthStore()
const { signOutAndExit } = useAuth()
const { t } = useI18n()
const router = useRouter()

async function onSignOut() {
  await signOutAndExit()
  // signOutAndExit already navigates to /welcome with the pan-left
  // transition queued. No further work here.
}

function onSignIn() {
  // Direct-link to the welcome sidebar pre-opened in sign-in mode.
  // Bypasses the legacy /auth/sign-in redirect hop.
  router.push({ path: '/welcome', query: { open: 'signin', mode: 'signin' } })
}
```

- [ ] **Step 4.6: Verify**

```bash
cd munbeop
pnpm lint
pnpm typecheck
pnpm test
```

Expected: all green.

- [ ] **Step 4.7: Commit and merge**

```bash
git add munbeop/app/composables/useAuth.ts munbeop/app/components/welcome/WelcomeEmailForm.vue munbeop/app/pages/auth/callback.vue munbeop/app/components/layout/AccountWidget.vue
git commit -m "feat(welcome.v2.4): pan-right on auth success + pan-left on signOutAndExit"
git push origin HEAD:main
```

---

## Task 5 — Brand glitch hover (welcome.v2.5)

**Files:**
- Modify: `munbeop/app/components/welcome/WelcomeBrandMark.vue` (3-layer template + glitch hook + keyframes)
- Create: `munbeop/tests/components/welcome/WelcomeBrandMark.test.ts`

- [ ] **Step 5.1: Write the failing test for `WelcomeBrandMark`**

Create `munbeop/tests/components/welcome/WelcomeBrandMark.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeBrandMark from '~/components/welcome/WelcomeBrandMark.vue'

function stubMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('reduce') ? reducedMotion : false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('WelcomeBrandMark', () => {
  beforeEach(() => { vi.useFakeTimers(); stubMatchMedia(false) })
  afterEach(() => { vi.useRealTimers() })

  it('renders three stacked layers of the heading', () => {
    const wrapper = mount(WelcomeBrandMark)
    expect(wrapper.findAll('.brand__title-layer').length).toBe(3)
  })

  it('mouseenter on the heading sets is-glitching for 250 ms', async () => {
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    expect(h1.classes()).not.toContain('is-glitching')
    await h1.trigger('mouseenter')
    expect(h1.classes()).toContain('is-glitching')
    vi.advanceTimersByTime(250)
    await flushPromises()
    expect(h1.classes()).not.toContain('is-glitching')
  })

  it('back-to-back mouseenter while glitching does not extend or restart the cycle', async () => {
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    await h1.trigger('mouseenter')
    vi.advanceTimersByTime(100)
    await h1.trigger('mouseenter')
    vi.advanceTimersByTime(150)
    await flushPromises()
    expect(h1.classes()).not.toContain('is-glitching')
  })

  it('prefers-reduced-motion blocks the glitch', async () => {
    stubMatchMedia(true)
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    await h1.trigger('mouseenter')
    expect(h1.classes()).not.toContain('is-glitching')
  })
})
```

- [ ] **Step 5.2: Run the test, confirm it fails**

```bash
cd munbeop
pnpm test WelcomeBrandMark
```

Expected: FAIL — `Expected length: 3, Received length: 0` (no layers yet).

- [ ] **Step 5.3: Implement the 3-layer template + glitch hook**

Replace the entire contents of `munbeop/app/components/welcome/WelcomeBrandMark.vue` with:

```vue
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const { t } = useI18n()

const glitching = ref(false)
let glitchTimer: ReturnType<typeof setTimeout> | null = null

function triggerGlitch() {
  if (typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  if (glitching.value) return
  glitching.value = true
  if (glitchTimer) clearTimeout(glitchTimer)
  glitchTimer = setTimeout(() => { glitching.value = false }, 250)
}

onUnmounted(() => { if (glitchTimer) clearTimeout(glitchTimer) })
</script>

<template>
  <div class="brand">
    <h1
      class="brand__title"
      :class="{ 'is-glitching': glitching }"
      lang="ko"
      @mouseenter="triggerGlitch"
    >
      <span class="brand__title-layer brand__title-layer--base">문법 정원</span>
      <span class="brand__title-layer brand__title-layer--red"  aria-hidden="true">문법 정원</span>
      <span class="brand__title-layer brand__title-layer--cyan" aria-hidden="true">문법 정원</span>
    </h1>
    <p class="brand__subtitle">{{ t('welcome.brand.subtitle') }}</p>
  </div>
</template>

<style scoped>
.brand {
  text-align: center;
  pointer-events: none;
}
.brand__title {
  position: relative;
  display: inline-block;
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(40px, 7vw, 88px);
  margin: 0;
  letter-spacing: 0.02em;
  pointer-events: auto; /* heading is interactive so hover can fire */
}
.brand__title-layer {
  display: block;
  width: 100%;
  pointer-events: none;
}
.brand__title-layer--base {
  position: relative;
  color: var(--always-cream);
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.45),
    3px 3px 0 rgba(0, 0, 0, 0.35);
}
.brand__title-layer--red {
  position: absolute;
  inset: 0;
  color: rgba(255, 80, 80, 0.85);
  mix-blend-mode: screen;
  opacity: 0;
}
.brand__title-layer--cyan {
  position: absolute;
  inset: 0;
  color: rgba(80, 220, 255, 0.85);
  mix-blend-mode: screen;
  opacity: 0;
}

.brand__title.is-glitching .brand__title-layer--red {
  opacity: 1;
  animation: glitch-red 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--cyan {
  opacity: 1;
  animation: glitch-cyan 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--base {
  animation: glitch-base 250ms steps(8) 1;
}

@keyframes glitch-base {
  0%   { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
  20%  { clip-path: polygon(0 0,   100% 0,   100% 33%,  0 33%);  transform: translateX(8px); }
  40%  { clip-path: polygon(0 33%, 100% 33%, 100% 66%,  0 66%);  transform: translateX(-6px); }
  60%  { clip-path: polygon(0 66%, 100% 66%, 100% 100%, 0 100%); transform: translateX(4px); }
  80%  { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
  100% { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
}
@keyframes glitch-red {
  0%, 100% { transform: translateX(-3px); }
  20%      { transform: translate(-6px, 1px); }
  60%      { transform: translate(-1px, -1px); }
}
@keyframes glitch-cyan {
  0%, 100% { transform: translateX(3px); }
  30%      { transform: translate(6px, -1px); }
  70%      { transform: translate(1px, 1px); }
}

.brand__subtitle {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: clamp(10px, 1.4vw, 14px);
  color: var(--always-cream);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  margin: 10px 0 0;
  letter-spacing: 0.05em;
}

@media (prefers-reduced-motion: reduce) {
  .brand__title.is-glitching * {
    animation: none !important;
    transform: none !important;
    clip-path: none !important;
    opacity: 0;
  }
  .brand__title-layer--base { opacity: 1 !important; }
}
</style>
```

- [ ] **Step 5.4: Run the test, confirm it passes**

```bash
pnpm test WelcomeBrandMark
```

Expected: PASS, all 4 cases green.

- [ ] **Step 5.5: Verify full suite + lint + typecheck**

```bash
pnpm test
pnpm lint
pnpm typecheck
```

Expected: all green.

- [ ] **Step 5.6: Commit and merge**

```bash
git add munbeop/app/components/welcome/WelcomeBrandMark.vue munbeop/tests/components/welcome/WelcomeBrandMark.test.ts
git commit -m "feat(welcome.v2.5): chromatic-aberration + slice glitch on 문법 정원 hover (250ms)"
git push origin HEAD:main
```

---

## Task 6 — Mockup cleanup + verify pass (welcome.v2.6)

This task ships no Vue/TS code. It removes the mockup folder, runs the build, and walks the dev server end-to-end.

- [ ] **Step 6.1: Delete the mockup folder**

```bash
rm -rf munbeop/public/__mockup
```

- [ ] **Step 6.2: Final test + lint + typecheck + build**

```bash
cd munbeop
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all green. (Build is the final check — flushes any prod-only issues.)

- [ ] **Step 6.3: Boot dev server and walk the flows**

```bash
pnpm dev --port 3001
```

In the browser at `http://localhost:3001/welcome`:

1. **Palette consistency** — sidebar background is bone-white (not cream); every button (Kakao, Google, Sign-in, Create) has a black outline + warm cream chunky shadow; the single sky-blue border-left line replaces the previous double line; hovering "Sign in with email" tints the bg cream and lifts the button 1 px up/left with a larger cream shadow.
2. **Subtitle** — reads only "Korean Grammar Garden" (in the active locale). No `· 화이팅`.
3. **Sidebar count** — exactly four buttons. No "Send a magic link", no "Continue without an account", no dashed separator.
4. **Glitch hover** — hover 문법 정원 → 250 ms chromatic-aberration + horizontal slices, reverts cleanly. Moving the cursor off and back on triggers again.
5. **Pan-right on email sign-in** — fill bogus credentials → submit. If Supabase rejects (expected with stub keys), the dialog shows the error; if it accepts (real session), the page pan-rights to `/`.
6. **Pan-right on OAuth callback** — visit `http://localhost:3001/auth/callback?code=fake` in a fresh tab (this won't authenticate but should run the callback page code). Verify the page attempts to set transition direction; full flow needs real Supabase OAuth config to validate end-to-end.
7. **Pan-left on logout** — once signed in, use the existing sign-out control (AccountWidget) → page pan-lefts back to `/welcome`.
8. **Reduced motion** — devtools → Rendering → Emulate CSS media `prefers-reduced-motion: reduce` → pans become 200 ms opacity fades; the glitch hover is a no-op.
9. **In-app palette** — sign in (or visit `/` directly if anon), confirm the in-app surfaces inherit the v3 palette: bone-white bg, meadow-green accents, sky-blue focus rings on inputs, cream chunky shadows on cards/buttons. Spot-check Practice and Library pages if reachable.

- [ ] **Step 6.4: Commit the mockup deletion**

```bash
git add -A
git commit -m "chore(welcome.v2.6): drop the temp palette mockup folder + verify pass

Verified end-to-end at this commit:
  - Sidebar: 4 options, bone-white, single sky-blue line, unified black outline + cream shadow.
  - Subtitle: no more · 화이팅.
  - Brand glitch: 250 ms chromatic + slice on hover, reverts cleanly, reduced-motion no-op.
  - Pan-right plays on email sign-in success and OAuth callback resolve.
  - Pan-left plays on sign-out via AccountWidget.
  - In-app surfaces inherit v3 palette (bone, meadow, sky, cream).
  - Build + typecheck + lint + 90+ vitest cases all green."
git push origin HEAD:main
```

---

## Self-review checklist

Done at plan-authoring time:

- **Spec coverage**: each of the 5 spec items + the 6 phases maps to a task here.
  - Item 1 (sidebar trim) → Task 2 steps 2.1–2.4
  - Item 2 (subtitle trim) → Task 2 step 2.5 + Task 5 (the new BrandMark template carries it)
  - Item 3 (pan transitions) → Tasks 3 + 4
  - Item 4 (brand glitch) → Task 5
  - Item 5 (palette v3) → Task 1
  - Phase welcome.v2.6 → Task 6
- **Placeholder scan**: no TBD / TODO / "implement later". The only loose end is the `/auth/callback` step 4.4 which says "open it, find the navigation call site" — the exact patch is two lines around the existing `router.push('/')`. The engineer can grep the file in one second.
- **Type consistency**:
  - `useRouteTransition()` return: `{ direction: Readonly<Ref<'enter'|'exit'|null>>, setEnter, setExit, clear }` — matches between definition and consumers.
  - `signOutAndExit()` signature: `() => Promise<{ error: { message: string } | null }>` — consistent with existing `signOut()`.
  - WelcomeBrandMark: `glitching: Ref<boolean>`, `triggerGlitch: () => void` — consistent across template and tests.
- **Each task ships independently and verifiably**: every task ends verify-commit-merge. Task 4 depends on Task 3 (useRouteTransition must exist); Task 5 is independent; Task 6 depends on everything but only deletes a folder + runs build.
- **TDD discipline**: Tasks 3 + 5 have a red→green→commit rhythm. Tasks 1, 2, 4, 6 are value/structural edits with no new public function surface to test; they rely on the verify pass (Task 6) for behavioral validation.
