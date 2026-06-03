# Design System v2 — Phase 1: Token Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the design-token layer from the v1 single-file `tokens.css` (24 lines, dark default) to the v2 modular `tokens/` directory (Link's Awakening DX cream default, opt-in dark "Hyrule at night"), so every subsequent Design System v2 phase has a stable foundation. After this phase the app's visual identity has shifted from dark-paper to cream-parchment; component code is unchanged.

**Architecture:** Split the existing 24 lines of `tokens.css` into 9 topical files under `app/assets/styles/tokens/`. The new palette reuses the same custom-property NAMES for tokens that survive (`--paper`, `--ink`, `--jade`, etc.) with new VALUES — the app re-paints automatically. Token NAMES that get renamed in v2 (`--muted`, `--indigo`, `--seedling`, `--plant`, `--tree`) are kept as deprecated aliases in `colors-light.css` pointing to their new names, so no `.vue` file needs to change in Phase 1. Component rename happens in a later phase. Theme-invariant tokens (`--always-dark`, `--always-cream`) live on `:root` in `colors-light.css`; `[data-theme="dark"]` inherits them.

**Tech Stack:** CSS custom properties · Tailwind 3 (consumes vars via `tailwind.config.ts`) · Nuxt 4 SPA (`ssr: false`) · Vite (via Nuxt) · Google Fonts (`@import` in CSS).

**Out of scope (do NOT do in this phase):**
- Renaming consumers of `--muted` / `--indigo` / `--seedling` / `--plant` / `--tree` in `.vue` files (deferred — they keep working through deprecated aliases)
- Dark theme toggle UI (Phase 8)
- Any `.vue` component changes (Phase 2+)
- The `Surface` wrapper / chrome mechanism (Phase 4)
- Sprites (Phases 5-7)

---

## File Structure

**Files to create (9, under `munbeop/app/assets/styles/tokens/`):**

| File | Responsibility |
|---|---|
| `_index.css` | Import entry — chains all token files in load order. No rules of its own. |
| `colors-light.css` | `:root` — theme-invariants, brand swatches (light values), semantic aliases, deprecated aliases for renamed tokens. |
| `colors-dark.css` | `[data-theme="dark"]` — only the brand swatches and aliases that differ from light. |
| `typography.css` | `--font-*`, `--text-*` scale, `.type-*` utility classes, pixel-font smoothing rule. |
| `spacing.css` | `--space-*` scale + semantic aliases (`--gap*`, `--padding-*`). |
| `radius.css` | `--radius-0`, `--radius-sm`, `--radius-full`. |
| `shadow.css` | `--shadow-pixel-*` scale + semantic aliases (`--shadow-card`, `--shadow-button-*`, `--shadow-modal`, `--shadow-input-*`). |
| `motion.css` | `--motion-*` durations, `--ease-*` easings, `prefers-reduced-motion` block. |
| `breakpoints.css` | `--bp-*` custom-property declarations (informational; consumed mostly by Tailwind utilities and `@media (min-width: ...)` rules in components). |

**Files to modify (3):**

| File | Change |
|---|---|
| `munbeop/app/assets/styles/main.css` | Replace `@import './tokens.css';` with `@import './tokens/_index.css';`. |
| `munbeop/app/assets/styles/pixel.css` | Extend Google Fonts URL to include `Silkscreen:wght@400;700`. |
| `munbeop/tailwind.config.ts` | Add new color aliases (`ink-soft`, `jade-deep`, `sky`, `red-deep`, `mastery-seedling`, `mastery-plant`, `mastery-tree`) plus the `Silkscreen` display family. Keep old color names (`muted`, `indigo`, `seedling`, `plant`, `tree`) for now — Phase 2 removes them. |

**Files to delete (1):**

| File | Why |
|---|---|
| `munbeop/app/assets/styles/tokens.css` | Replaced by the `tokens/` directory. No file needs the old name. |

**Files NOT touched in Phase 1:**
Any file under `munbeop/app/components/`, `munbeop/app/pages/`, `munbeop/app/composables/`, etc. The 23 `.vue`/`.ts` files referencing `var(--*)` keep working because every name they reference is either preserved with a new value or kept as a deprecated alias.

---

## Pre-flight

- [ ] **Step P.1: Verify worktree state**

```bash
git status
git log -1 --oneline
```

Expected:
- `git status` → `nothing to commit, working tree clean`
- `git log` → `063fb92 docs: add Design System v2 spec (5 modular docs)`

- [ ] **Step P.2: Verify the dev server boots and the baseline still loads**

```bash
cd munbeop
pnpm install
pnpm dev
```

Expected: `http://localhost:3000` boots, the current dark-paper app loads. Stop the server (`Ctrl+C`) after confirming — we don't need it running until Task 2.

- [ ] **Step P.3: Run the baseline verification suite**

```bash
cd munbeop
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four pass green. We're capturing the baseline so any failure after Task 1 or Task 2 is attributable to the change, not pre-existing.

---

## Task 1: Scaffold tokens/ directory (additive, no app change)

**Why this is its own commit:** creating files is one risk category (file paths, content correctness). Activating those files is another (visual change, broken imports). Splitting them isolates failures.

After this task the new files exist but `main.css` still imports the old `tokens.css`. The app looks identical.

**Files:**
- Create: `munbeop/app/assets/styles/tokens/_index.css`
- Create: `munbeop/app/assets/styles/tokens/colors-light.css`
- Create: `munbeop/app/assets/styles/tokens/colors-dark.css`
- Create: `munbeop/app/assets/styles/tokens/typography.css`
- Create: `munbeop/app/assets/styles/tokens/spacing.css`
- Create: `munbeop/app/assets/styles/tokens/radius.css`
- Create: `munbeop/app/assets/styles/tokens/shadow.css`
- Create: `munbeop/app/assets/styles/tokens/motion.css`
- Create: `munbeop/app/assets/styles/tokens/breakpoints.css`

### Step 1.1: Create `_index.css`

- [ ] Write `munbeop/app/assets/styles/tokens/_index.css`:

```css
/* tokens/_index.css
 * Design System v2 — token entry point.
 * Imports each topical file in load order. Has no rules of its own — by
 * CSS spec, @import statements must precede all other rules. Theme-
 * invariants live in colors-light.css on :root so [data-theme="dark"]
 * inherits them.
 */

@import './colors-light.css';
@import './colors-dark.css';
@import './typography.css';
@import './spacing.css';
@import './radius.css';
@import './shadow.css';
@import './motion.css';
@import './breakpoints.css';
```

### Step 1.2: Create `colors-light.css`

- [ ] Write `munbeop/app/assets/styles/tokens/colors-light.css`:

```css
/* tokens/colors-light.css
 * Light theme (default). Anchored on Link's Awakening DX.
 * Layers, top to bottom:
 *   1. Theme-invariants (same in light and dark; dark inherits via :root)
 *   2. Brand swatches — light values
 *   3. Semantic aliases — components reference these, never brand swatches
 *   4. Deprecated aliases — Phase 1 compatibility; removed in Phase 2
 */

:root {
  /* ---- 1. Theme-invariants ---- */
  --always-dark: #1a1a1a;
  --always-cream: #f8efd0;

  /* ---- 2. Brand swatches ---- */
  --paper: #f8efd0;
  --paper-warm: #ffe19a;
  --paper-deep: #ecd28a;
  --ink: #1a1a1a;
  --ink-soft: #4a3a1f;
  --jade: #3aa84a;
  --jade-deep: #185f24;
  --sky: #5fb8e8;
  --red: #e83838;
  --red-deep: #9d2525;
  --gold: #f5c533;

  /* ---- 3. Semantic aliases ---- */
  --bg: var(--paper);
  --surface: var(--paper-warm);
  --surface-hover: var(--paper-deep);
  --text: var(--ink);
  --text-soft: var(--ink-soft);
  --border: #d8b96a;
  --border-strong: var(--ink-soft);
  --focus-ring: var(--jade-deep);
  --link: var(--jade-deep);
  --link-visited: var(--ink-soft);
  --accent: var(--jade-deep);
  --accent-bright: var(--jade);
  --danger: var(--red-deep);
  --danger-bright: var(--red);
  --info: var(--sky);
  --warning: var(--gold);
  --success: var(--jade-deep);
  --mastery-seedling: var(--ink-soft);
  --mastery-plant: var(--gold);
  --mastery-tree: var(--jade-deep);
  --text-on-accent: var(--paper);
  --text-on-danger: var(--paper);
  --text-on-info: var(--always-dark);
  --text-on-warning: var(--always-dark);

  /* ---- 4. Deprecated aliases (Phase 1 only) ---- */
  /* Components still reference these names; remove in Phase 2 once
   * consumer renames land. */
  --muted: var(--ink-soft);
  --indigo: var(--sky);
  --seedling: var(--mastery-seedling);
  --plant: var(--mastery-plant);
  --tree: var(--mastery-tree);
}
```

### Step 1.3: Create `colors-dark.css`

- [ ] Write `munbeop/app/assets/styles/tokens/colors-dark.css`:

```css
/* tokens/colors-dark.css
 * Dark theme — "Hyrule at night". Opt-in via [data-theme="dark"] on
 * <html>. Only redeclares the brand swatches that flip on the light/dark
 * axis, plus the aliases that need to re-point because the light value
 * fails contrast on a dark background. Everything else inherits from
 * :root in colors-light.css.
 *
 * Activation in Phase 8 (toggle UI). Declared now so dark theme is
 * available the moment the toggle ships.
 */

[data-theme="dark"] {
  /* Brand swatches that flip on light/dark axis */
  --paper: #1a1612;
  --paper-warm: #2a221a;
  --paper-deep: #3a2e22;
  --ink: #f8efd0;
  --ink-soft: #d8c89a;
  /* --jade, --jade-deep, --red, --red-deep, --gold, --sky stay constant
   * (declared in colors-light.css :root, dark inherits) */

  /* Aliases that re-point because the light-theme target hex is too dark
   * to read on a dark background */
  --accent: var(--jade);
  --danger: var(--red);
  --link: var(--jade);
  --success: var(--jade);
  --mastery-tree: var(--jade);
  --border: #5e4a2c;
  --focus-ring: var(--jade);
  --text-on-accent: var(--always-dark);
  --text-on-danger: var(--always-dark);
  /* --text-on-info and --text-on-warning stay at --always-dark
   * because --sky and --gold are bright in both themes */

  /* Deprecated aliases re-point too, so legacy consumers stay correct
   * in dark theme */
  --muted: var(--ink-soft);
  --indigo: var(--sky);
}
```

### Step 1.4: Create `typography.css`

- [ ] Write `munbeop/app/assets/styles/tokens/typography.css`:

```css
/* tokens/typography.css
 * Four font families with locked roles, an 8-step type scale, and
 * utility classes for the semantic typography roles. Pixel-family
 * smoothing is disabled here once, not per-component.
 */

:root {
  /* ---- Font families ---- */
  --font-pixel-small: 'Press Start 2P', monospace;
  --font-pixel-display: 'Silkscreen', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-ko: 'Noto Sans KR', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* ---- Type scale (8 steps) ---- */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 26px;
  --text-2xl: 32px;
  --text-3xl: 44px;
}

/* ---- Semantic typography roles (utility classes) ---- */

.type-display {
  font-family: var(--font-pixel-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.type-page-title {
  font-family: var(--font-pixel-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.type-section {
  font-family: var(--font-pixel-display);
  font-size: var(--text-xl);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.type-subsection {
  font-family: var(--font-pixel-display);
  font-size: var(--text-lg);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.6;
}

.type-body {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
}

.type-body-md {
  font-family: var(--font-ui);
  font-size: var(--text-md);
  font-weight: 400;
  line-height: 1.7;
}

.type-label {
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  line-height: 1.6;
}

.type-label-tight {
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  line-height: 1.6;
}

.type-helper {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 400;
  line-height: 1.6;
}

.type-caption {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  font-weight: 400;
  line-height: 1.6;
}

.type-ko-display {
  font-family: var(--font-ko);
  font-size: var(--text-2xl);
  font-weight: 900;
  line-height: 1.3;
}

.type-ko-body {
  font-family: var(--font-ko);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.7;
}

.type-ko-sentence {
  font-family: var(--font-ko);
  font-size: var(--text-md);
  font-weight: 400;
  line-height: 1.7;
}

.type-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.6;
}

/* ---- Pixel font smoothing ---- */
/* No anti-aliasing on pixel-family classes; default smoothing applies
 * to Inter / Noto Sans KR / JetBrains Mono because they don't carry
 * any of these classes. */
.font-pixel,
.type-display,
.type-page-title,
.type-section,
.type-subsection,
.type-label,
.type-label-tight {
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
```

### Step 1.5: Create `spacing.css`

- [ ] Write `munbeop/app/assets/styles/tokens/spacing.css`:

```css
/* tokens/spacing.css
 * 4px-base scale. Numbers 7, 9, 10, 11, 13, 14, 15 intentionally skipped
 * so the system stays sparse. If a layout asks for --space-7 (28px) the
 * answer is almost always --space-6 (24px) or --space-8 (32px).
 */

:root {
  /* ---- Scale ---- */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* ---- Semantic aliases ---- */
  --gap-tight: var(--space-1);
  --gap-compact: var(--space-2);
  --gap: var(--space-3);
  --gap-loose: var(--space-4);
  --gap-section: var(--space-6);
  --padding-card-y: var(--space-4);
  --padding-card-x: var(--space-5);
  --padding-page-mobile: var(--space-4);
  --padding-page-desktop: var(--space-8);
}
```

### Step 1.6: Create `radius.css`

- [ ] Write `munbeop/app/assets/styles/tokens/radius.css`:

```css
/* tokens/radius.css
 * Pixel-art system. The default is 0. --radius-full exists only for the
 * avatar primitive (humanises an otherwise mechanical UI).
 */

:root {
  --radius-0: 0;
  --radius-sm: 2px;
  --radius-full: 9999px;
}
```

### Step 1.7: Create `shadow.css`

- [ ] Write `munbeop/app/assets/styles/tokens/shadow.css`:

```css
/* tokens/shadow.css
 * Hard offset shadows. Never soft Gaussian blur — that erases the LADX
 * silhouette. Colour references --border-strong (which is --ink-soft)
 * so dark theme gets a warm-brown shadow automatically.
 */

:root {
  /* ---- Pixel-shadow scale ---- */
  --shadow-pixel-sm: 2px 2px 0 var(--border-strong);
  --shadow-pixel-md: 4px 4px 0 var(--border-strong);
  --shadow-pixel-lg: 6px 6px 0 var(--border-strong);
  --shadow-pixel-xl: 8px 8px 0 var(--border-strong);
  --shadow-inset: inset 2px 2px 0 var(--border-strong);
  --shadow-inset-strong: inset 2px 2px 0 var(--ink-soft);

  /* ---- Semantic aliases ---- */
  --shadow-card: var(--shadow-pixel-md);
  --shadow-card-hover: 5px 5px 0 var(--border-strong);
  --shadow-button: var(--shadow-pixel-md);
  --shadow-button-hover: 5px 5px 0 var(--border-strong);
  --shadow-button-pressed: var(--shadow-pixel-sm);
  --shadow-modal: var(--shadow-pixel-lg);
  --shadow-input: var(--shadow-inset);
  --shadow-input-focus: var(--shadow-inset-strong);
}
```

### Step 1.8: Create `motion.css`

- [ ] Write `munbeop/app/assets/styles/tokens/motion.css`:

```css
/* tokens/motion.css
 * Hybrid motion system. Smooth eases for study chrome (where motion
 * shouldn't distract from reading), step-based motion for game chrome.
 * Chrome-aware aliases (--motion-button etc.) are NOT declared as CSS
 * variables — they live as documented contracts in 01-tokens.md §7.3
 * because they bundle duration + easing which a single var can't hold.
 * Components implement them via data-surface attribute selectors when
 * the chrome mechanism lands in Phase 4.
 */

:root {
  /* ---- Durations ---- */
  --motion-instant: 0ms;
  --motion-quick: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --motion-deliberate: 500ms;

  /* ---- Easings ---- */
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-step-3: steps(3, end);
  --ease-step-5: steps(5, end);
}

/* ---- prefers-reduced-motion ---- */
/* Hard rule: every transition and animation collapses to instant under
 * the user preference. No exceptions for "important" motion. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Step 1.9: Create `breakpoints.css`

- [ ] Write `munbeop/app/assets/styles/tokens/breakpoints.css`:

```css
/* tokens/breakpoints.css
 * Four breakpoints aligned with Tailwind defaults so mental translation
 * between system vars and utility classes is zero. Declared as custom
 * properties for any non-Tailwind CSS that wants to reference them
 * (e.g. clamp() calls, container queries).
 */

:root {
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}
```

### Step 1.10: Verify the directory compiles when consumed

- [ ] Temporarily change `main.css` to import the new directory to test it parses, then revert:

```bash
cd munbeop
# Inspect main.css to confirm current state
cat app/assets/styles/main.css
```

Expected output:
```css
@import './tokens.css';
@import './pixel.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] Boot the dev server and confirm no parse errors in the console:

```bash
pnpm dev
```

Expected: `http://localhost:3000` boots, the app loads as the existing dark-paper theme (because main.css still imports `./tokens.css`, not the new directory). Nuxt may show "9 new files" in the file-watcher log but no errors. Stop the server (Ctrl+C).

### Step 1.11: Commit Task 1

- [ ] Stage all new files and commit (from worktree root — `cd $(git rev-parse --show-toplevel)` first if a previous step left you inside `munbeop/`):

```bash
cd "$(git rev-parse --show-toplevel)"
git add munbeop/app/assets/styles/tokens/
git status
```

Expected git status:
```
new file:   munbeop/app/assets/styles/tokens/_index.css
new file:   munbeop/app/assets/styles/tokens/colors-light.css
new file:   munbeop/app/assets/styles/tokens/colors-dark.css
new file:   munbeop/app/assets/styles/tokens/typography.css
new file:   munbeop/app/assets/styles/tokens/spacing.css
new file:   munbeop/app/assets/styles/tokens/radius.css
new file:   munbeop/app/assets/styles/tokens/shadow.css
new file:   munbeop/app/assets/styles/tokens/motion.css
new file:   munbeop/app/assets/styles/tokens/breakpoints.css
```

- [ ] Commit:

```bash
git commit -m "$(cat <<'EOF'
feat(p3.1.1): scaffold tokens/ directory (additive, no app change)

Adds the v2 modular token layer alongside the existing tokens.css.
After this commit the new files exist but nothing imports them — the
app keeps loading the v1 dark-paper theme. Task 2 flips the import.

Files:
- _index.css         chained @imports
- colors-light.css   :root brand swatches + semantic aliases + Phase-1
                     deprecated aliases (--muted, --indigo, --seedling,
                     --plant, --tree) so .vue files keep compiling
- colors-dark.css    [data-theme="dark"] overrides for the eventual
                     toggle (Phase 8) — declared now, inactive until
                     the toggle ships
- typography.css     4 font families + 8-step scale + 13 type-role
                     utility classes + pixel-font smoothing
- spacing.css        10-step 4px-base scale + semantic aliases
- radius.css         0 by default, --radius-full reserved for Avatar
- shadow.css         hard-offset pixel shadows + per-state aliases
- motion.css         5 durations, 5 easings, prefers-reduced-motion
                     hard rule
- breakpoints.css    --bp-sm/md/lg/xl matching Tailwind defaults

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] Verify the commit landed:

```bash
git log -1 --stat
```

Expected: `feat(p3.1.1): scaffold tokens/ directory...` with 9 files created.

---

## Task 2: Activate v2 palette (the cream-day flip)

**Why this is its own commit:** this is the visible-change commit. The app shifts from dark-paper to cream-parchment in one paint. If something goes wrong, this commit can be reverted cleanly without losing the Task 1 scaffold work.

**Files:**
- Modify: `munbeop/app/assets/styles/main.css`
- Modify: `munbeop/app/assets/styles/pixel.css`
- Modify: `munbeop/tailwind.config.ts`
- Delete: `munbeop/app/assets/styles/tokens.css`

### Step 2.1: Modify `main.css` to import the new tokens directory

- [ ] Current content of `munbeop/app/assets/styles/main.css`:

```css
@import './tokens.css';
@import './pixel.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] Change to:

```css
@import './tokens/_index.css';
@import './pixel.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Only the first line changes. Order matters — tokens before pixel before Tailwind directives.

### Step 2.2: Modify `pixel.css` to add Silkscreen to Google Fonts import

- [ ] Current first line of `munbeop/app/assets/styles/pixel.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
```

- [ ] Change to (Silkscreen added between Press Start 2P and Inter):

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
```

The rest of `pixel.css` (image-rendering rules, `.pixel-border`, `.font-pixel`, html/body defaults) stays unchanged.

### Step 2.3: Modify `tailwind.config.ts` to add new color aliases

- [ ] Current content of `munbeop/tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        jade: 'var(--jade)',
        red: 'var(--red)',
        indigo: 'var(--indigo)',
        gold: 'var(--gold)',
        seedling: 'var(--seedling)',
        plant: 'var(--plant)',
        tree: 'var(--tree)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        ko: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] Change to:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // v1 names — kept as deprecated aliases through Phase 1, removed in Phase 2
        muted: 'var(--muted)',
        indigo: 'var(--indigo)',
        seedling: 'var(--seedling)',
        plant: 'var(--plant)',
        tree: 'var(--tree)',
        // v2 names — canonical
        paper: 'var(--paper)',
        'paper-warm': 'var(--paper-warm)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        jade: 'var(--jade)',
        'jade-deep': 'var(--jade-deep)',
        sky: 'var(--sky)',
        red: 'var(--red)',
        'red-deep': 'var(--red-deep)',
        gold: 'var(--gold)',
        'mastery-seedling': 'var(--mastery-seedling)',
        'mastery-plant': 'var(--mastery-plant)',
        'mastery-tree': 'var(--mastery-tree)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        display: ['Silkscreen', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        ko: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

Two changes:
1. `colors` block expanded: deprecated v1 names kept on top with comment, v2 canonical names added below.
2. `fontFamily` block: `display: ['Silkscreen', 'monospace']` added — enables `font-display` utility class.

### Step 2.4: Delete the old `tokens.css`

- [ ] Remove the file:

```bash
cd munbeop
rm app/assets/styles/tokens.css
```

The 24 lines have moved (with new values) into `tokens/colors-light.css` and `tokens/spacing.css`. Nothing references `tokens.css` anymore — `main.css` was the only importer and Step 2.1 redirected it.

### Step 2.5: Verify the dev server boots into the cream theme

- [ ] Run the dev server:

```bash
cd munbeop
pnpm dev
```

Expected:
- `http://localhost:3000` boots without errors
- The page background is **cream** (`#f8efd0`), not the old dark `#1a1f1a`
- Text is **dark** (`#1a1a1a`), not the old cream-on-dark
- Sidebar background is **warm cream** (`#ffe19a`), not dark green
- The brand text "문법" in the sidebar is still **jade** but a brighter version (`#3aa84a` vs the previous `#7da653`)
- Buttons appear as **dark-green-on-cream** (jade-deep bg + cream text) instead of bright-green-on-dark
- Press Start 2P, Inter, Noto Sans KR all still render (the Silkscreen utility class isn't used by any component yet — it'll show up when components consume `.type-display` etc.)
- No console errors about missing CSS files or broken @imports

Open each page in turn (`/`, `/practice`, `/library`, `/log`, `/stats`, `/settings`, `/auth/sign-in`) and confirm:
- Every page renders without broken styles
- Cream theme applied consistently everywhere
- Mastery tokens (now `--gold` for plant, `--jade-deep` for tree) display correctly if visible

If the app looks **fine** → proceed to Step 2.6.
If the app looks **half-broken** (some surfaces cream, others dark) → check the browser DevTools for which CSS variables resolve unexpectedly. Likely cause: a stylesheet was cached. Hard-refresh (Ctrl+Shift+R) and recheck. If still broken, abort Task 2 and inspect Step 2.1 / 2.4 changes.

Stop the dev server (Ctrl+C).

### Step 2.6: Run the full verification suite

- [ ] Run all four checks:

```bash
cd munbeop
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected:
- `pnpm lint` → 0 errors
- `pnpm typecheck` → 0 errors (CSS changes don't affect TS, but verify no regression)
- `pnpm test` → 64 tests pass (the Vitest suite is on storage / SRS / practice domain, not on styling — should be unaffected)
- `pnpm build` → builds cleanly. CSS bundling will resolve all `@import` statements; broken paths show up here as build errors.

If any of the four fails:
- `pnpm lint` failing on unused-imports or similar → likely unrelated to Phase 1; investigate before continuing
- `pnpm typecheck` failing → very unexpected (no TS changes); review your edits
- `pnpm test` failing → very unexpected; review the failing test and confirm it's not theme-dependent
- `pnpm build` failing on missing CSS → likely a path typo in `main.css` or one of the new files

### Step 2.7: Commit Task 2

- [ ] Stage modified and deleted files (from worktree root):

```bash
cd "$(git rev-parse --show-toplevel)"
git add munbeop/app/assets/styles/main.css
git add munbeop/app/assets/styles/pixel.css
git add munbeop/tailwind.config.ts
git rm munbeop/app/assets/styles/tokens.css
git status
```

Expected:
```
modified:   munbeop/app/assets/styles/main.css
modified:   munbeop/app/assets/styles/pixel.css
modified:   munbeop/tailwind.config.ts
deleted:    munbeop/app/assets/styles/tokens.css
```

- [ ] Commit:

```bash
git commit -m "$(cat <<'EOF'
feat(p3.1.2): activate v2 light-cream palette (Hyrule day)

The visible cut-over. After this commit the app paints in Link's
Awakening DX cream (paper #f8efd0, ink #1a1a1a, jade-deep #185f24)
instead of the v1 dark paper (#1a1f1a). Dark theme is declared in
colors-dark.css but inactive — no toggle UI until Phase 8.

Changes:
- main.css            imports tokens/_index.css instead of tokens.css
- pixel.css           Google Fonts URL extended to include Silkscreen
                      (weights 400, 700) for narrative display
- tailwind.config.ts  v2 colors added (jade-deep, sky, ink-soft, *-deep,
                      mastery-*) and font-display: Silkscreen registered.
                      v1 names (muted, indigo, seedling, plant, tree)
                      kept as compat aliases — Phase 2 removes them.
- tokens.css          deleted (content moved into tokens/colors-light.css
                      with new values + tokens/spacing.css)

No .vue file is modified in Phase 1. The 23 components referencing
var(--*) keep working because (a) preserved names get new values via
:root, (b) renamed names (--muted, --indigo, --seedling/plant/tree) are
declared as deprecated aliases pointing at the canonical v2 names.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] Verify:

```bash
git log -2 --oneline
```

Expected (top two commits):
```
<hash> feat(p3.1.2): activate v2 light-cream palette (Hyrule day)
<hash> feat(p3.1.1): scaffold tokens/ directory (additive, no app change)
```

---

## Task 3: Final verification + handoff to user

This task makes no code changes. It's the proof-of-life that Phase 1 actually works in the real environment the user will see (Vercel preview deploy).

### Step 3.1: Confirm working tree is clean

- [ ] Check status:

```bash
git status
```

Expected: `nothing to commit, working tree clean`. The two Task commits should be visible in `git log`.

### Step 3.2: Re-run full verification fresh

- [ ] Run all checks from scratch:

```bash
cd munbeop
pnpm install   # idempotent; verifies lockfile still aligns
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all four pass green.

### Step 3.3: Visual smoke checklist

- [ ] Boot the dev server one more time:

```bash
pnpm dev
```

- [ ] Open `http://localhost:3000` and walk through every route:

| Route | Expected look |
|---|---|
| `/` (garden home) | Cream bg, "내 정원" + "MY GARDEN" title, empty-state message in dark text on warm-cream card |
| `/practice` | Cream bg, "연습" + "PRACTICE" title, dark-on-cream intro card, primary button in jade-deep with cream text |
| `/library` | Cream bg, grammar list (if any seeded), mastery glyphs |
| `/log` | Cream bg, filter pills, log entry cards |
| `/stats` | Cream bg, 4-card grid, mastery breakdown |
| `/settings` | Cream bg, settings panels, LocaleSwitcher |
| `/auth/sign-in` | Cream bg, sign-in form, jade-deep primary button |

Each page must:
- Render without broken styles
- Have readable text (no light-on-light or dark-on-dark accidents)
- Show the AppSidebar in warm-cream on desktop / MobileNavbar on width < 768px

If anything looks broken, the issue is most likely a component using a token name that doesn't exist in v2 — but the deprecated aliases should prevent this. If it happens, document the broken spot and prepare a fix BEFORE proceeding to push.

### Step 3.4: Confirm no untracked or modified files remain

- [ ] Check:

```bash
git status
```

Expected: `nothing to commit, working tree clean`.

### Step 3.5: Hand off

Phase 1 is complete locally. Two commits on `claude/quirky-cohen-c53968`:

```
<hash> feat(p3.1.2): activate v2 light-cream palette (Hyrule day)
<hash> feat(p3.1.1): scaffold tokens/ directory (additive, no app change)
```

Per the user's stated workflow ("iremos comiteando, verificando, y luego push y merge y al final yo pruebo con el link de vercel"), the next user-initiated steps are:
1. User reviews the two commits in the worktree
2. User pushes the branch (or the agent pushes once user OKs)
3. PR opens / merges to main
4. Vercel preview deploy renders the cream theme
5. User confirms or flags adjustments

If the user reports a visual issue with Phase 1, the fix lands either as a follow-up commit on the same branch (if pre-merge) or as Phase 1.1 (if post-merge).

---

## Spec coverage check

Each requirement from `docs/superpowers/specs/2026-06-03-design-system-v2/01-tokens.md` mapped to a task:

| Spec section | Implemented in | Notes |
|---|---|---|
| §1 Light palette — 11 brand swatches | Step 1.2 | All declared in `:root` |
| §1 Light palette — semantic aliases | Step 1.2 | All declared in `:root` |
| §1.3 Usage rules | N/A | Documented in spec only; not codified yet (would be a Vitest test in a future "no raw hex in components" linter) |
| §1.4 WCAG-AA contrast | Step 2.5 manual verification | Spot-check during smoke; automated audit deferred |
| §1.5 Migration table | Step 1.2 | Deprecated aliases declared |
| §1.6 CSS layout | Tasks 1 + 2 | `tokens/` directory created and wired |
| §2 Dark palette | Step 1.3 | Declared, inactive until Phase 8 |
| §3 Typography (4 families, 8-step scale, 13 roles) | Step 1.4 | All in `typography.css`; Silkscreen Google Fonts import in Step 2.2 |
| §3.5 Pixel font smoothing | Step 1.4 | Selector list of `.font-pixel`, `.type-*` classes |
| §4 Spacing scale | Step 1.5 | 10-step + 9 aliases |
| §5 Radius | Step 1.6 | 3 values |
| §6 Shadow | Step 1.7 | 4-step scale + 2 insets + 8 aliases |
| §7 Motion | Step 1.8 | 5 durations + 5 easings + `prefers-reduced-motion` |
| §8 Breakpoints | Step 1.9 | 4 values, Tailwind-aligned |
| §2.7 Theme toggle activation | DEFERRED to Phase 8 | Dark theme declared, no UI yet |

No spec requirement is unimplemented in Phase 1's scope. Items deferred to later phases are explicitly out-of-scope per "Out of scope" at the top of this plan.
