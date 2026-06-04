# Welcome v2 — palette repaint, pan transitions, brand glitch, sidebar trim

**Status:** approved, ready for implementation planning
**Author:** brainstorming session 2026-06-04 (round 2, after v1 ships)
**Scope:** Five focused changes that polish the freshly-shipped welcome page and extend the new "windrise living" palette across the entire light theme.

---

## 1. Concept

The first welcome round shipped end-to-end ([prior spec](2026-06-04-welcome-zelda-landing.md), commits `30b7524`…`7708f87`). The user reviewed it live and gave five follow-up directions, all locked in after three mockup iterations:

1. **Trim the sidebar** — remove "Send a magic link" and "Continue without an account". Keep Kakao, Google, Sign in with email, Create an account.
2. **Trim the brand subtitle** — remove the `· 화이팅` suffix from the welcome subtitle. (화이팅 still stays Korean elsewhere per project memory; this is just the welcome surface.)
3. **Pan-right post-auth, pan-left post-logout** — when a successful sign-in routes from `/welcome` to `/`, the welcome surface slides out to the left while the in-app garden slides in from the right. On sign-out the inverse happens. 700 ms `cubic-bezier(0.65, 0, 0.35, 1)`.
4. **Brand glitch on hover** — hovering 문법 정원 triggers a 250 ms chromatic-aberration + 3 horizontal-slice offset glitch that self-recovers. CSS-only.
5. **Palette v3 — "windrise living"** — repaint the entire light theme. Bone-white surface + meadow-green primary action + sky-blue lines/focus + cream chunky-pixel shadow + gold reserved for special CTAs. The four colors coexist on every screen, the way they coexist in the Mondstadt background.

The mockup that locked v3 lives at `munbeop/public/__mockup/mondstadt-palette-v3.html` (the file gets deleted as the last step of this spec's implementation — see §10).

### Goals

- Welcome reads tighter (4 auth options instead of 6, cleaner subtitle).
- The transition between marketing surface and in-app surface tells a story ("entering the castle").
- The brand mark has a single moment of retro personality on demand.
- The whole light theme reads as one cohesive system: chunky-pixel ink outlines, warm cream shadows, sky-blue lines of attention, meadow-green action.

### Non-goals

- Dark theme v3. Dark mode keeps the existing cave-brown tokens for now. A separate spec follows once light v3 settles.
- Per-component visual tuning beyond what the token swap demands. If a component looks off after the repaint, fix it in this spec; if it looks fine, leave it.
- Re-skinning Bomi. Bomi's hardcoded sprite colors (gold body, red ribbon, pink antennae) are character identity, untouched.
- New routes, new features, new copy beyond the 5 items above.

---

## 2. Item 1 — Sidebar trim

### 2.1 Behavior

Remove these two `<button>` elements from `WelcomeAuthOptions.vue`:
- The "Magic link by email" button (`welcome.menu.email_magic`).
- The "Continue without account" button (`welcome.menu.anon`) and the separator (`<hr class="options__sep">`) that precedes it.

The sidebar collapses to four primary actions in this order:
1. Continue with Kakao
2. Continue with Google
3. Sign in with email
4. Create an account

### 2.2 Code surface

- `WelcomeAuthOptions.vue` — delete the two buttons + the `<hr>`. Delete the `openEmail('magic')` branch (the function still serves `signin` and `signup` modes). Delete `anonEntry()` and its `router` dependency.
- `WelcomeEmailForm.vue` — the `'magic'` mode survives (kept for the `?mode=magic` deep-link from any future surface that wants it). No code change.
- `i18n/locales/*.json` — keep the `welcome.menu.email_magic`, `welcome.menu.anon`, `welcome.dialog.magic`, `welcome.dialog.anon` keys. Orphaning a few keys is cheaper than coordinating 8-locale removals and risking a missing-key warning if anything still references them.

### 2.3 Tests

No new tests. The existing `WelcomeSidebar.test.ts` continues to pass since it doesn't assert on button count.

---

## 3. Item 2 — Subtitle trim

### 3.1 Behavior

The current subtitle reads `Korean Grammar Garden · 화이팅` (the `· 화이팅` is interpolated from the i18n value via a localized `<span lang="ko">`). Drop the `·` separator and the trailing `<span lang="ko">화이팅</span>`. The subtitle becomes a single localized line.

### 3.2 Code surface

`WelcomeBrandMark.vue` template change:

```vue
<p class="brand__subtitle">{{ t('welcome.brand.subtitle') }}</p>
```

(Was: `{{ t('welcome.brand.subtitle') }} · <span lang="ko">화이팅</span>`.)

The `welcome.brand.subtitle` i18n value is unchanged — each locale's translation stands on its own.

### 3.3 Brand-rule note

화이팅 still stays Korean in every other surface (per memory `[project_munbeop_hwaiting]`). This change is welcome-subtitle-only.

---

## 4. Item 3 — Pan transitions (welcome ⇄ in-app)

### 4.1 Behavior

| Trigger | Direction | What slides | Duration |
|---|---|---|---|
| Successful auth (Kakao / Google callback lands on `/`; or email signin/signup resolves; OAuth `/auth/callback` resolves) | **Right pan** — old surface slides LEFT off-screen, new surface slides IN from the right | The whole `<NuxtPage>` viewport | 700 ms |
| Sign-out (any surface calls `useAuth().signOut()` and lands on `/welcome`) | **Left pan** — old surface slides RIGHT off-screen, new surface slides IN from the left | Same | 700 ms |

Easing: `cubic-bezier(0.65, 0, 0.35, 1)` (snappy out, gentle in — Apple's standard).

Narrative: pan-right means "entering the castle"; pan-left means "leaving the castle".

### 4.2 Triggering mechanism

The transition direction is decided by a small composable + a layout-level `<Transition>` element. The composable owns the "what direction next?" state.

```ts
// app/composables/useRouteTransition.ts
const direction = ref<'enter' | 'exit' | null>(null)

export function useRouteTransition() {
  function setEnter() { direction.value = 'enter' }   // /welcome → /
  function setExit()  { direction.value = 'exit'  }   // / → /welcome
  function clear()    { direction.value = null    }   // any other transition

  return {
    direction: readonly(direction),
    setEnter,
    setExit,
    clear,
  }
}
```

Hook points that call `setEnter()`:
- `WelcomeAuthOptions.provider()` immediately before `router.push('/')` (only on successful OAuth start — the actual nav happens after the OAuth callback returns, but the FLAG is set on click so when the callback resolves the pan plays)
- Actually OAuth navigation happens via `signInWithOAuth` which triggers a full-page redirect to the provider, so the pan won't play across that hop. Instead: `/auth/callback` page (which runs after the provider redirects back) calls `setEnter()` before navigating to `/`.
- `WelcomeEmailForm.submit()` calls `setEnter()` before `router.push('/')` on successful sign-in/sign-up.

Hook points that call `setExit()`:
- `useAuth().signOut()` wrapper calls `setExit()` then `router.push('/welcome')`. Currently `signOut()` only returns `{ error }`. We add a thin `signOutAndExit()` to `useAuth.ts` that wraps `signOut()` + `setExit()` + navigation. Existing callers continue to use `signOut()` if they don't want the pan.

Currently `signOut()` has exactly one caller: `app/components/layout/AccountWidget.vue:11` — `onSignOut()` runs `await signOut()` then `router.push('/')` (stays at the in-app garden as anon). For v2 the caller switches to `signOutAndExit()` which routes to `/welcome` after firing `setExit()`, so the pan-left plays.

While we're in `AccountWidget.vue`, the sister `onSignIn()` action (line 16) still pushes to `/auth/sign-in` (which now legacy-redirects to `/welcome?open=signin&mode=signin`). Update it to push directly to `/welcome?open=signin&mode=signin` so the redirect hop disappears.

### 4.3 Layout-level transition

Add a `<NuxtPage>` wrapper transition in `app/app.vue` or a top-level layout. Because `definePageMeta({ layout: false })` lives on `welcome.vue`, the transition wraps NuxtPage itself, not a layout.

```vue
<!-- app/app.vue, inside <template> -->
<NuxtLayout>
  <NuxtPage :transition="{ name: pageTransitionName, mode: 'out-in' }" />
</NuxtLayout>
```

Where `pageTransitionName` derives from `useRouteTransition().direction`:

```ts
const pageTransitionName = computed(() => {
  const d = direction.value
  if (d === 'enter') return 'pan-right'
  if (d === 'exit')  return 'pan-left'
  return 'fade'   // default for any non-welcome transition
})
```

CSS keyframes (in `assets/styles/transitions.css`, imported by `main.css`):

```css
/* pan-right: old surface slides LEFT out; new surface slides IN from RIGHT */
.pan-right-enter-active,
.pan-right-leave-active {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
}
.pan-right-enter-from  { transform: translateX(100%); }
.pan-right-leave-to    { transform: translateX(-100%); }

/* pan-left: mirror */
.pan-left-enter-active,
.pan-left-leave-active {
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
}
.pan-left-enter-from   { transform: translateX(-100%); }
.pan-left-leave-to     { transform: translateX(100%); }

/* fallback fade for any other route change */
.fade-enter-active,
.fade-leave-active     { transition: opacity 180ms ease; }
.fade-enter-from,
.fade-leave-to         { opacity: 0; }

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

### 4.4 Edge cases

- **OAuth full-page redirect**: the browser leaves the SPA when going to Supabase's OAuth provider. The pan doesn't play during the round-trip. It plays after the provider callback lands on `/auth/callback`, which sets the flag and navigates to `/`.
- **Reduced motion**: pan replaced by 200 ms opacity crossfade. No translateX. (Above.)
- **Mid-pan navigation**: if a user starts another route change during a pan, Vue's `mode: 'out-in'` queues it — the second pan plays only after the first completes. Acceptable; no special handling.
- **Setter clears**: `useRouteTransition` does NOT auto-clear after a pan. The next non-tagged navigation falls back to `fade`. We don't need a watchdog — staleness here is harmless because the FLAG is only read at the moment NuxtPage renders, and we always set it right before navigating.

### 4.5 Tests

Unit-test `useRouteTransition`:
- `setEnter()` → direction is `'enter'`
- `setExit()` → direction is `'exit'`
- `clear()` → direction is `null`
- Direction is a readonly ref; tests can subscribe to it.

No integration test for the actual transition animation. Manual verify via Playwright in the verify pass.

---

## 5. Item 4 — Brand glitch on hover

### 5.1 Behavior

When the user hovers (mouseover or focus-within) the `<h1 lang="ko">문법 정원</h1>`, three things happen simultaneously, all reversing in 250 ms:

1. **Chromatic aberration**: a duplicate red layer offsets `-3px / 0` and a duplicate cyan layer offsets `+3px / 0`. The original layer stays in place.
2. **Horizontal slices**: the heading is sliced into 3 horizontal bands using `clip-path: polygon(...)`. The top band shifts `+8px`, the middle band shifts `-6px`, the bottom band shifts `+4px`. Snap back to `0px` at the 250 ms mark.
3. **A faint VHS scan line band** (1 px tall horizontal `::after` element) sweeps top→bottom over the title.

The animation is `animation: brand-glitch 250ms steps(8) 1`. It does NOT loop. Once the hover ends or the 250 ms elapses, the heading returns to its rest state. Re-triggering only on a fresh `mouseenter` (the CSS `:hover` selector naturally re-runs the keyframe set as the user moves the cursor off and on again, but to avoid retriggering on every micro-motion within the heading, we use a small JS hook that listens to `mouseenter` only, adds a `is-glitching` class, then strips it after 250 ms via `setTimeout`).

### 5.2 Implementation

Approach: split the heading into three stacked spans for the chromatic layers, each absolutely positioned and z-stacked. The glitch animates `transform` + `clip-path` per layer.

```vue
<!-- WelcomeBrandMark.vue, updated template -->
<h1
  ref="titleEl"
  class="brand__title"
  :class="{ 'is-glitching': glitching }"
  lang="ko"
  @mouseenter="triggerGlitch"
>
  <span class="brand__title-layer brand__title-layer--base" aria-hidden="false">문법 정원</span>
  <span class="brand__title-layer brand__title-layer--red"  aria-hidden="true">문법 정원</span>
  <span class="brand__title-layer brand__title-layer--cyan" aria-hidden="true">문법 정원</span>
</h1>
```

```ts
const titleEl = ref<HTMLElement | null>(null)
const glitching = ref(false)
let glitchTimer: ReturnType<typeof setTimeout> | null = null

function triggerGlitch() {
  // Respect prefers-reduced-motion — no glitch.
  if (typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (glitching.value) return  // already mid-glitch — don't restart
  glitching.value = true
  if (glitchTimer) clearTimeout(glitchTimer)
  glitchTimer = setTimeout(() => { glitching.value = false }, 250)
}
onUnmounted(() => { if (glitchTimer) clearTimeout(glitchTimer) })
```

```css
.brand__title {
  position: relative;
  display: inline-block;
}
.brand__title-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  pointer-events: none;
  transition: transform 250ms ease, clip-path 250ms ease;
}
.brand__title-layer--base {
  position: relative;        /* anchors the box */
  color: var(--always-cream);
  text-shadow: 0 0 12px rgba(0, 0, 0, 0.45), 3px 3px 0 rgba(0, 0, 0, 0.35);
}
.brand__title-layer--red  { color: rgba(255, 80, 80, 0.85);  mix-blend-mode: screen; opacity: 0; }
.brand__title-layer--cyan { color: rgba(80, 220, 255, 0.85); mix-blend-mode: screen; opacity: 0; }

.brand__title.is-glitching .brand__title-layer--red  {
  opacity: 1;
  transform: translateX(-3px);
  animation: glitch-slice-red 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--cyan {
  opacity: 1;
  transform: translateX(3px);
  animation: glitch-slice-cyan 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--base {
  animation: glitch-slice-base 250ms steps(8) 1;
}

@keyframes glitch-slice-base {
  0%   { clip-path: polygon(0 0,100% 0,100% 33%,0 33%); transform: translateX(0); }
  25%  { clip-path: polygon(0 33%,100% 33%,100% 66%,0 66%); transform: translateX(-6px); }
  50%  { clip-path: polygon(0 66%,100% 66%,100% 100%,0 100%); transform: translateX(4px); }
  75%  { clip-path: polygon(0 0,100% 0,100% 100%,0 100%); transform: translateX(0); }
  100% { clip-path: polygon(0 0,100% 0,100% 100%,0 100%); transform: translateX(0); }
}
@keyframes glitch-slice-red {
  0%, 100% { transform: translateX(-3px); }
  20%      { transform: translate(-6px, 1px); }
  60%      { transform: translate(-1px, -1px); }
}
@keyframes glitch-slice-cyan {
  0%, 100% { transform: translateX(3px); }
  30%      { transform: translate(6px, -1px); }
  70%      { transform: translate(1px, 1px); }
}

@media (prefers-reduced-motion: reduce) {
  .brand__title.is-glitching * { animation: none !important; transform: none !important; clip-path: none !important; opacity: 0; }
}
```

### 5.3 Accessibility

- The two glitch layers (red/cyan) are `aria-hidden="true"` and `pointer-events: none`. Screen readers see one heading.
- `prefers-reduced-motion: reduce` short-circuits the JS hook AND the CSS animation. The title sits still.
- The hover trigger never blocks pointer events on adjacent elements.

### 5.4 Tests

Component test for `WelcomeBrandMark`:
- Renders the three layers.
- `mouseenter` flips `is-glitching` to `true`.
- After 250 ms (fake timers), `is-glitching` flips back to `false`.
- With `matchMedia('(prefers-reduced-motion: reduce)').matches === true`, `mouseenter` is a no-op.

---

## 6. Item 5 — Palette v3 ("windrise living")

### 6.1 Token mapping (the brand swatch layer)

| Token | Before (cream LADX) | After (bone windrise) | Reason |
|---|---|---|---|
| `--paper` | `#f8efd0` | `#f4f0e2` | bone-white (cooler, cleaner than cream; the main surface) |
| `--paper-warm` | `#f1e5b8` | `#efe9d2` | slightly warmer bone for headers, table stripes |
| `--paper-deep` | `#e6d4a8` | `#e8e4d4` | THE new "panel" tone — sidebar, nav, raised surfaces |
| `--ink` | `#1a1a1a` | `#1f3a4d` | deep-ocean body text (cool dark, still 14:1 contrast on `--paper`) |
| `--ink-soft` | `#4a3a1f` | `#4a6a82` | cool soft slate for secondary text |
| `--jade` | `#3aa84a` | `#5ea84a` | meadow-green (the tree from the windrise) |
| `--jade-deep` | `#185f24` | `#3f7a30` | accent-deep (still passes AA on cream surfaces) |
| `--sky` | `#5fb8e8` | `#87d5ff` | the windrise sky exactly; matches the existing `--sky-day` theme-invariant |
| `--red` | `#e83838` | `#c43d3d` | flower-red (less aggressive, matches scene flowers) |
| `--red-deep` | `#9d2525` | (unchanged) | already cool-dark enough |
| `--gold` | `#f5c533` | `#f0c84a` | sun-amber (slightly less yellow, more amber) |

### 6.2 New tokens (brand-swatch layer)

```css
--ink-line:     #14202c;   /* near-black for the chunky pixel border on every button */
--sky-deep:     #4eb8e8;   /* the line color (single line, not double) */
--meadow:       var(--jade);       /* readable alias */
--meadow-deep:  var(--jade-deep);  /* readable alias */
--hover-bg:     #f2e8c8;   /* WARM cream pulse on hover */
--shadow-cream: #c2a766;   /* warm cream chunky pixel shadow — replaces --ink-soft as --shadow-color */
```

### 6.3 Semantic alias updates

| Alias | Before | After |
|---|---|---|
| `--surface` | `var(--paper-warm)` | `var(--paper-deep)` (the panel tone) |
| `--surface-hover` | `var(--paper-deep)` | `var(--hover-bg)` (cream pulse) |
| `--border` | `#d8b96a` (warm taupe hex) | `var(--ink-line)` (every button outline is black) |
| `--border-strong` | `var(--ink-soft)` | `var(--ink-line)` |
| `--shadow-color` | `var(--ink-soft)` | `var(--shadow-cream)` (BIG change — chunky shadow becomes warm cream) |
| `--focus-ring` | `var(--jade-deep)` | `var(--sky-deep)` (the sky-blue ring) |
| `--link` | `var(--jade-deep)` | `var(--sky-deep)` |
| `--accent` | `var(--jade-deep)` | `var(--meadow-deep)` (alias preserved, but value comes from the new --jade) |
| `--text-on-accent` | `var(--paper)` | `var(--always-cream)` (kept readable on green) |

The dark theme (`colors-dark.css`) **is unchanged** for this round. A separate spec tackles dark v3 later. The dark theme already redefines `--shadow-color: var(--ink-soft)` (cream halo), so the light/dark shadow story stays the same conceptually: warm in both modes.

### 6.4 Component manual fixes (hardcoded colors that don't inherit tokens)

Two surfaces use hardcoded hex values that need to migrate to tokens (audited via grep):

1. `WelcomeAuthOptions.vue` lines 145-146:
   - `#fee500` (Kakao brand yellow) **stays hardcoded** — this is Kakao's brand color, not part of the palette.
   - `#1a1a1a` (Kakao button border + text) → `var(--always-dark)` (the theme-invariant black already in tokens).

2. `WelcomeDialog.vue` line 63:
   - `#ffd1d1` (error text on dialog) → keep hardcoded for now (it's the readable error text on `#000` dialog bg; no token currently fits). Add a follow-up note.

Bomi sprite components (`BomiAbdomen`, `BomiAntennae`, `BomiBody`, `Bomi.vue`) use many hardcoded character colors. **Untouched** — these are character identity, not theme colors.

### 6.5 Visual quality gates

After the token swap, manually verify in the dev server (covered in §9 verify pass):
- WCAG AA contrast: body text (`--ink` on `--paper`) ≥ 7:1 → deep-ocean #1f3a4d on bone-white #f4f0e2 = ~11:1 ✓.
- AA contrast: `--meadow-deep` text on `--paper` → #3f7a30 on #f4f0e2 = ~5.4:1 (AA for normal text) ✓.
- AA contrast: link `--sky-deep` on `--paper` → #4eb8e8 on #f4f0e2 = ~2.4:1 ✗ — **fails AA for body text**. Mitigation: links are always underlined (already true) AND the text-decoration-color uses the brighter sky to make the underline strongly visible; the link color itself is a known "this is a link" signal beyond contrast alone. Acceptable for v1. Track as follow-up: if it bites, darken `--sky-deep` for the `--link` alias only (use `#2a8ac7` for `--link` while keeping `--sky-deep` for the bright accent).
- The chunky cream shadow `#c2a766` on bone-white `#f4f0e2` reads with clear separation — ~3:1, enough for the depth illusion.

### 6.6 Test impact

The existing component tests don't assert on specific color values. They assert on structure (`.foo class is present`, `dialog__text exists`). Token swap is transparent to those tests.

Snapshot tests (if any are added later) WILL change after this swap. None exist today.

---

## 7. Affected files

### 7.1 Modified

```
munbeop/app/assets/styles/tokens/colors-light.css      ← token swap (§6.1, §6.2, §6.3)
munbeop/app/components/welcome/WelcomeAuthOptions.vue   ← remove magic-link + anon buttons + Kakao hex → token
munbeop/app/components/welcome/WelcomeBrandMark.vue     ← drop 화이팅 + 3-layer glitch markup + CSS
munbeop/app/components/welcome/WelcomeEmailForm.vue     ← no change (magic mode still supported)
munbeop/app/composables/useAuth.ts                      ← add signOutAndExit() helper
munbeop/app/app.vue                                     ← wrap NuxtPage in :transition binding
```

### 7.2 Created

```
munbeop/app/composables/useRouteTransition.ts           ← the direction singleton
munbeop/app/assets/styles/transitions.css               ← pan-right/pan-left/fade keyframes
munbeop/tests/composables/useRouteTransition.test.ts    ← unit tests for the composable
munbeop/tests/components/welcome/WelcomeBrandMark.test.ts ← glitch hover trigger tests
```

### 7.3 Imported / wired

`main.css` imports `transitions.css` (one line added near the other style imports).

### 7.4 Deleted

`munbeop/public/__mockup/` — the temp folder with v1/v2/v3 palette mockups deletes as the last step. The HTML files served their purpose as design conversation artifacts; the spec captures the conclusions.

---

## 8. Phasing

Each phase ships as one commit on this branch, then fast-forwards `main` (matches the `welcome.N` rhythm from round 1):

1. **welcome.v2.1 — Palette token swap**: rewrite `colors-light.css` per §6. Replace Kakao hex `#1a1a1a` → `var(--always-dark)` in WelcomeAuthOptions. The visual change is global and immediate.
2. **welcome.v2.2 — Sidebar trim + subtitle trim**: drop the two sidebar buttons + the `· 화이팅`. Tiny, isolated.
3. **welcome.v2.3 — Route transition composable + CSS**: `useRouteTransition` + `transitions.css` + wire `NuxtPage` in `app.vue`. Tests on the composable.
4. **welcome.v2.4 — Pan hook-ups**: WelcomeAuthOptions / WelcomeEmailForm / AuthCallback page set `setEnter()`. `signOutAndExit()` in `useAuth.ts` + retarget the existing sign-out caller.
5. **welcome.v2.5 — Brand glitch**: 3-layer markup + CSS keyframes + JS hook + tests.
6. **welcome.v2.6 — Mockup cleanup + verify pass**: delete `public/__mockup/`. Run dev server, walk the four flows (pan-right on auth, pan-left on logout, glitch on hover, palette consistency in welcome + in-app). Build + typecheck + tests one final time.

---

## 9. Verify pass

Manual run after welcome.v2.6:

- Visit `/welcome` → palette repainted (bone-white sidebar, sky-blue line, black-outline buttons, cream shadows under everything).
- Hover 문법 정원 → 250 ms chromatic + slice glitch, reverts cleanly.
- Hover any sidebar button → cream pulse + slight lift + bigger cream shadow.
- Click "Sign in with email" → email form expands with the same black-outline + cream-shadow rule.
- Submit a valid credential → pan-right plays as `/welcome` → `/`. In-app garden slides in from the right.
- Click the existing sign-out control in the in-app garden → pan-left plays as `/` → `/welcome`.
- Toggle dark mode → night scene renders as before (dark v3 deferred).
- Browser devtools `prefers-reduced-motion: reduce` → pans become opacity crossfades; glitch is a no-op.
- Sidebar has exactly 4 buttons (Kakao, Google, Sign in with email, Create an account). No magic-link, no anon.
- Subtitle under 문법 정원 reads only "Korean Grammar Garden" (in the active locale). No `· 화이팅`.

---

## 10. Out of scope (tracked as follow-ups)

- **Dark mode v3** — re-paint the cave-brown dark tokens to a deep-ocean / starry-violet palette consistent with v3. Separate spec.
- **Pricing / Terms / Credits pages** — still not in scope.
- **OAuth provider configuration** — Supabase dashboard work is still pending.
- **In-app component-specific polish** — if individual surfaces (e.g. the Practice loop, the Toast variants) need spacing or shadow tweaks after the repaint, ship them as their own micro-PRs, not under this spec.
- **The `welcome.dialog.magic` and `welcome.dialog.anon` i18n keys** — orphaned but harmless. Cleanup is a chore for a later sweep.
- **A real `--link` token darker than `--sky-deep`** — if the body-text-link contrast issue from §6.5 ever bites, swap `--link` to `#2a8ac7`. Not needed now.
