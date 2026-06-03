# Design System v2 — Tokens

> **Status:** SCAFFOLDED (skeleton only — content pending "empieza")
> **Parent:** [00-overview.md](00-overview.md)

## Purpose

The foundational token layer. Every primitive, chrome and sprite consumes these tokens — never raw hex values, never magic numbers. The light theme and the dark theme share scale and semantics but differ in palette values.

This file is the only place where palette hex codes appear. Everywhere else uses `var(--token-name)` or its Tailwind alias.

## Sections

### 1. Palette — light theme (default)

This is the locked palette for the default light theme. All other tokens (semantic aliases, mastery colors, focus, borders) are derived from these eleven brand swatches. No screen-level CSS introduces a new hex value — everything goes through this layer.

#### 1.1 Brand swatches

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#f8efd0` | App background. Cream parchment. |
| `--paper-warm` | `#f1e5b8` | Card / surface background. Softer parchment step (was `#ffe19a` — too saturated, read as Post-It; tuned 2026-06-03 after first prod preview). |
| `--paper-deep` | `#e6d4a8` | Recessed surfaces, hovered cards, dividers (paired desaturation with `--paper-warm`). |
| `--ink` | `#1a1a1a` | Body text default. Highest contrast. |
| `--ink-soft` | `#4a3a1f` | Captions, helper text, muted UI. |
| `--jade` | `#3aa84a` | Bright leaf green. Sprite, badge, mastery-tree ornament. |
| `--jade-deep` | `#185f24` | Text-safe accent. Links, focus, primary button bg. |
| `--sky` | `#5fb8e8` | Bright cyan. Illustration and info-badge bg only. |
| `--red` | `#e83838` | Rupee red. Error badge, hard-feedback accent. |
| `--red-deep` | `#9d2525` | Text-safe danger. Danger button bg, inline error text. |
| `--gold` | `#f5c533` | Coin gold. Mastery-plant, achievement badge bg. |

**Why eleven and not ten:** `--jade-deep` and `--red-deep` exist because the bright `--jade`/`--red` fail WCAG-AA contrast for body text on `--paper` (~2.9:1). The `-deep` variants pass (6.2:1 / 6.6:1) and are the text-safe alternative. `--sky` and `--gold` get no `-deep` variant because they are never used as text colors in this system — they live exclusively as background or sprite colors with `--ink` text on top.

#### 1.2 Semantic aliases (the only tokens components touch)

Components never reference brand swatches directly. They reference these aliases. If the palette evolves, only this table needs updating — components stay stable.

| Alias | Maps to | Where it's used |
|---|---|---|
| `--bg` | `--paper` | `<body>`, page background |
| `--surface` | `--paper-warm` | Card, modal, panel default |
| `--surface-hover` | `--paper-deep` | Hovered card, active list row |
| `--text` | `--ink` | Body text default |
| `--text-soft` | `--ink-soft` | Caption, helper, disabled label |
| `--border` | `#d8b96a` | Default 2px pixel border (derived: paper-deep darkened) |
| `--border-strong` | `--ink-soft` | Selected / focused border |
| `--focus-ring` | `--jade-deep` | `:focus-visible` outline, 2px solid, 2px offset |
| `--link` | `--jade-deep` | Anchor text |
| `--link-visited` | `--ink-soft` | Anchor `:visited` |
| `--accent` | `--jade-deep` | Primary action color (button bg, key UI) |
| `--accent-bright` | `--jade` | Accent ornament only (badge fill, sprite) |
| `--danger` | `--red-deep` | Danger button bg, error message text |
| `--danger-bright` | `--red` | Error badge fill, inline error icon |
| `--info` | `--sky` | Info badge bg — text on top must be `--ink` |
| `--warning` | `--gold` | Warning badge bg — text on top must be `--ink` |
| `--success` | `--jade-deep` | Success text or icon stroke |
| `--mastery-seedling` | `--ink-soft` | Mastery low (was `--seedling`) |
| `--mastery-plant` | `--gold` | Mastery mid (was `--plant`) |
| `--mastery-tree` | `--jade-deep` | Mastery high (was `--tree`) |
| `--text-on-accent` | `--paper` | Text sitting on `--accent` bg |
| `--text-on-danger` | `--paper` | Text sitting on `--danger` bg |
| `--text-on-info` | `--ink` | Text sitting on `--info` bg |
| `--text-on-warning` | `--ink` | Text sitting on `--warning` bg |

#### 1.3 Usage rules (non-negotiable)

These rules exist because LADX-style bright accents fail contrast as text colors. Breaking them is a visual regression and an accessibility regression at the same time.

1. **Text only uses `--text`, `--text-soft`, or a `--text-on-*` alias.** Never a brand swatch directly, never `--jade`/`--red`/`--gold`/`--sky` as text.
2. **Bright accents (`--jade`/`--red`/`--gold`/`--sky`) are surface or sprite colors.** When the design wants a green text, it uses `--jade-deep` (the text-safe sibling). Same for red → `--red-deep`.
3. **`--info` and `--warning` backgrounds always carry `--ink` text** via `--text-on-info` / `--text-on-warning`. The system has no light-text-on-yellow combination because it doesn't pass contrast.
4. **Focus rings are always `--focus-ring`** (2px solid outline, 2px offset). Do not suppress `:focus-visible` for stylistic reasons.
5. **Sprites and pixel art consume only this palette.** See [04-sprites-mascota.md](04-sprites-mascota.md) §2 for the compliance rule.

#### 1.4 WCAG-AA spot check

Target: 4.5:1 for small text, 3:1 for large text / non-text UI. Ratios below are nominal calculations against the chosen hexes and are re-verified in the implementation phase with a real contrast library (e.g. `wcag-contrast-ratio`).

| Text | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink` | `--paper` | ~15.2 | ✓ body default |
| `--ink` | `--paper-warm` | ~13.1 | ✓ body on card |
| `--ink` | `--paper-deep` | ~11.7 | ✓ body on recessed |
| `--ink-soft` | `--paper` | ~9.3 | ✓ captions |
| `--jade-deep` | `--paper` | ~6.2 | ✓ links, accent text |
| `--red-deep` | `--paper` | ~6.6 | ✓ inline error text |
| `--paper` | `--jade-deep` | ~6.2 | ✓ primary button label |
| `--paper` | `--red-deep` | ~6.6 | ✓ danger button label |
| `--ink` | `--gold` | ~9.3 | ✓ label on gold badge |
| `--ink` | `--sky` | ~7.1 | ✓ label on sky info badge |
| `--ink` | `--jade` | ~5.2 | ✓ label on jade ornament |
| `--ink` | `--red` | ~5.2 | ✓ label on red badge |

Combinations that explicitly fail and must not ship: `--paper` on `--jade` (~2.9), `--paper` on `--red` (~2.9), `--paper` on `--gold` (~1.6), `--paper` on `--sky` (~2.3), `--jade` on `--paper` (~2.9). The aliases route around all of these.

#### 1.5 Migration from v1

| v1 token | v1 hex | v2 token | v2 hex | Notes |
|---|---|---|---|---|
| `--paper` | `#1a1f1a` | `--paper` | `#f8efd0` | Inverts. v1 value migrates to dark theme (§2). |
| `--paper-warm` | `#232a23` | `--paper-warm` | `#f1e5b8` | Inverts. Initial v2 value `#ffe19a` desaturated post-preview (was Post-It-yellow, see §1.1 note). |
| `--paper-deep` | `#2d362d` | `--paper-deep` | `#e6d4a8` | Inverts. Paired with `--paper-warm` tune. |
| `--ink` | `#ebe6d7` | `--ink` | `#1a1a1a` | Inverts. |
| `--muted` | `#8a9189` | `--ink-soft` | `#4a3a1f` | Renamed; semantic clarity. |
| `--jade` | `#7da653` | `--jade` | `#3aa84a` | Brighter, more saturated. |
| (none) | — | `--jade-deep` | `#185f24` | NEW. Text-safe variant. |
| `--red` | `#c23e3e` | `--red` | `#e83838` | Brighter. |
| `--red-deep` | `#9d2e2e` | `--red-deep` | `#9d2525` | Slightly tightened. |
| `--indigo` | `#5890d4` | `--sky` | `#5fb8e8` | Renamed; LADX vocabulary. |
| `--gold` | `#d4a04a` | `--gold` | `#f5c533` | More lemony, less olive. |
| `--border` | `#313a31` | `--border` | `#d8b96a` | Light-theme equivalent. |
| `--border-strong` | `#465048` | `--border-strong` | `--ink-soft` | Aliased to existing. |
| `--seedling` | `#8a9189` | `--mastery-seedling` | `--ink-soft` | Renamespaced + aliased. |
| `--plant` | `#d4a04a` | `--mastery-plant` | `--gold` | Renamespaced + aliased. |
| `--tree` | `#7da653` | `--mastery-tree` | `--jade-deep` | Renamespaced + aliased. |

#### 1.6 CSS implementation (file layout)

The v1 `tokens.css` (24 lines, one file) splits into a directory so each concern is independently reviewable. No-god-files applies to CSS too.

```
app/assets/styles/
├── main.css                ← entrypoint, imports all tokens then pixel
├── pixel.css               ← unchanged (image-rendering, font-smoothing)
└── tokens/
    ├── _index.css          ← imports the rest in order
    ├── colors-light.css    ← §1 — :root brand swatches + aliases
    ├── colors-dark.css     ← §2 — [data-theme="dark"] overrides
    ├── typography.css      ← §3
    ├── spacing.css         ← §4
    ├── radius.css          ← §5
    ├── shadow.css          ← §6
    ├── motion.css          ← §7
    └── breakpoints.css     ← §8
```

Concretely, `colors-light.css` declares brand swatches and aliases on `:root`. `colors-dark.css` overrides ONLY the brand swatches inside `[data-theme="dark"]` — aliases stay declared once because their mapping doesn't change between themes. This is what makes the dark theme cheap to maintain.

### 2. Palette — dark theme (opt-in)

The dark theme is **"Hyrule at night"** — a warm cave/night palette in the LADX family. It is genuinely dark (the user asked specifically: "ese flow zelda, pero el negro para modo dark"), not a Discord-gray. It is also not a cheap CSS inversion: the brand swatches that flip between light and dark (`--paper`, `--ink`) get hand-picked night-coded hexes, while the accent swatches (`--jade`, `--red`, `--gold`, `--sky`) stay constant.

#### 2.1 Strategy

Three architectural rules govern the light↔dark relationship:

1. **Background/text axis flips, accents don't.** `--paper` and `--ink` (plus `--paper-warm`/`--paper-deep`/`--ink-soft`) get redefined under `[data-theme="dark"]` because they encode the light/dark direction. `--jade`/`--red`/`--gold`/`--sky` keep their hex values — saturated accents read on both light and dark backgrounds (verified in §2.4 below).
2. **Some aliases re-point per theme.** In light, `--accent` is `--jade-deep` (dark green, text-safe on cream). In dark, `--accent` becomes `--jade` (bright green, text-safe on night brown). The brand swatches haven't moved; only the alias pointer has.
3. **A few tokens are theme-invariant.** `--text-on-info` / `--text-on-warning` must always be dark, because `--sky` and `--gold` are bright in both themes. These reference invariant `--always-dark` / `--always-cream` swatches.

#### 2.2 Theme-invariant swatches (declared once for both themes)

| Token | Hex | Purpose |
|---|---|---|
| `--always-dark` | `#1a1a1a` | Fixed dark text for use on bright accent backgrounds (sky/gold/jade-as-ornament/red-as-badge) regardless of theme. |
| `--always-cream` | `#f8efd0` | Fixed cream text counterpart. Rarely needed but declared for symmetry and for sprite work that must look identical in both themes. |

These live in `tokens/_index.css` at the top, outside both `:root` and `[data-theme="dark"]` blocks, so neither can shadow them.

#### 2.3 Dark theme brand swatch overrides

Only the light/dark axis swatches override. Accent swatches are deliberately absent — they inherit from `:root`.

| Token | Light hex | Dark hex | Why this dark hex |
|---|---|---|---|
| `--paper` | `#f8efd0` | `#1a1612` | Warm cave brown-black. NOT pure black — preserves the LADX warm-shadow feel. Was the user's "el negro para modo dark". |
| `--paper-warm` | `#ffe19a` | `#2a221a` | Card/panel surface — one step warmer than paper. |
| `--paper-deep` | `#ecd28a` | `#3a2e22` | Recessed surface, hovered row. |
| `--ink` | `#1a1a1a` | `#f8efd0` | Inverts to cream. |
| `--ink-soft` | `#4a3a1f` | `#d8c89a` | Inverts to dusty cream. Captions, helpers. |
| `--jade` | `#3aa84a` | `#3aa84a` | UNCHANGED. Passes contrast on dark bg (~5.5:1, see §2.4). |
| `--jade-deep` | `#185f24` | `#185f24` | UNCHANGED. Used for `--border-strong` in dark; not used as text in dark. |
| `--red` | `#e83838` | `#e83838` | UNCHANGED. |
| `--red-deep` | `#9d2525` | `#9d2525` | UNCHANGED. Not used as text in dark; available for button bg variation. |
| `--gold` | `#f5c533` | `#f5c533` | UNCHANGED. |
| `--sky` | `#5fb8e8` | `#5fb8e8` | UNCHANGED. |

#### 2.4 Alias re-mappings in dark theme

Most aliases stay declared once (in `:root`) because they reference brand swatches that mutate per theme. The aliases below need explicit overrides under `[data-theme="dark"]` because their light-theme pointer is now too dark to be visible on the dark background.

| Alias | Light pointer | Dark pointer | Reason |
|---|---|---|---|
| `--accent` | `--jade-deep` | `--jade` | Jade-deep on dark bg fails (~2.6:1). Jade on dark bg passes (~5.5:1). |
| `--danger` | `--red-deep` | `--red` | Same logic — bright variant is needed for text-safety on dark. |
| `--link` | `--jade-deep` | `--jade` | Same. |
| `--success` | `--jade-deep` | `--jade` | Same. |
| `--mastery-tree` | `--jade-deep` | `--jade` | Same. |
| `--border` | `#d8b96a` | `#5e4a2c` | Border has to be visible on the cave-brown bg; a saturated mid-brown reads as a pixel-art ink line in dark. |
| `--focus-ring` | `--jade-deep` | `--jade` | Bright on dark. |
| `--text-on-accent` | `--paper` | `--always-dark` | In light, paper is cream → cream on dark-green accent works. In dark, paper is brown-black, but accent is now bright jade → dark text on bright bg = `--always-dark`. |
| `--text-on-danger` | `--paper` | `--always-dark` | Same logic. |
| `--text-on-info` | `--always-dark` | `--always-dark` | Theme-invariant. Sky is always bright. |
| `--text-on-warning` | `--always-dark` | `--always-dark` | Theme-invariant. Gold is always bright. |

The remaining aliases (`--bg`, `--surface`, `--surface-hover`, `--text`, `--text-soft`, `--border-strong`, `--accent-bright`, `--danger-bright`, `--info`, `--warning`, `--mastery-seedling`, `--mastery-plant`) **do not need overrides** — they point at brand swatches that already mutate (or at accents that work in both themes).

#### 2.5 WCAG-AA spot check (dark theme)

Target same as light: 4.5:1 small text, 3:1 large/UI. All values nominal — verified in implementation.

| Text | Background | Ratio | Verdict |
|---|---|---|---|
| `--ink` (cream) | `--paper` (cave) | ~15.4 | ✓ body default |
| `--ink` | `--paper-warm` | ~13.5 | ✓ body on card |
| `--ink-soft` | `--paper` | ~11.2 | ✓ captions |
| `--jade` | `--paper` | ~5.5 | ✓ links, accent text |
| `--red` | `--paper` | ~5.5 | ✓ inline error |
| `--gold` | `--paper` | ~10.5 | ✓ accent / numeric highlight |
| `--always-dark` | `--jade` | ~5.2 | ✓ button label on jade bg |
| `--always-dark` | `--red` | ~5.2 | ✓ button label on red bg |
| `--always-dark` | `--gold` | ~9.3 | ✓ label on gold badge |
| `--always-dark` | `--sky` | ~7.1 | ✓ label on sky info badge |

Combinations that fail and must not ship: `--ink` (cream) on `--sky` (~2.0), `--ink` on `--gold` (~1.6), `--ink` on `--jade` (~2.9). These are routed around via `--text-on-info` / `--text-on-warning` / `--text-on-accent` aliases — components never wire `--ink` on a bright bg directly.

#### 2.6 Where it lives

```
app/assets/styles/tokens/
├── _index.css           ← declares --always-dark / --always-cream at top
├── colors-light.css     ← :root { brand swatches + aliases }
└── colors-dark.css      ← [data-theme="dark"] { swatch overrides + alias overrides }
```

`colors-dark.css` is intentionally short — only the swatches and aliases that need to change. The token system's leverage comes from how MUCH stays declared once.

#### 2.7 Activation (out of scope for §2; documented here for cross-reference)

The toggle UI (a `Toggle` primitive in Settings) is specced in [02-primitives.md](02-primitives.md). The persistence store is implementation, not design. Two things are foundational and worth flagging now:

- **Storage:** user preference goes in the Pinia `useLocaleStore` companion `useThemeStore` (or merged into Settings). Persists to localStorage anonymously, syncs to Supabase on login (same pattern as locale).
- **No-flash boot:** because this project is SPA-only (`ssr: false`, see `nuxt.config.ts`), there's a brief window between HTML parse and Vue mount where the default light theme paints even if the user prefers dark. Mitigation: a `<script>` block in `app.vue` head or `nuxt.config.ts` `app.head` that reads `localStorage.theme` and sets `document.documentElement.dataset.theme` before CSS evaluates. Specced in [02-primitives.md](02-primitives.md) under the Toggle section.

### 3. Typography scale

Four font families, each with a clear role. The system never picks a font ad-hoc — every text element resolves to one of the four via a semantic alias.

#### 3.1 Font families and roles

| Family | Source | Role | When to use |
|---|---|---|---|
| **Press Start 2P** | Google Fonts (locked v1) | `--font-pixel-small` | UI labels at 10-14px: button text, sidebar items, badges, tab labels. Never at 18px+ — characters become consolized and the Latin set is too narrow for narrative copy. |
| **Silkscreen** | Google Fonts (NEW v2) | `--font-pixel-display` | Narrative headers at 20-48px: page titles, dialog box titles, modal headers, mascota dialog. Pixel-bitmap aesthetic like PS2P but readable at large sizes, with a fuller character set and two weights (Regular / Bold). |
| **Inter** | Google Fonts (locked v1) | `--font-ui` | Body text, paragraph copy, form helper text, log entries — anywhere users read for more than 3 seconds. Smooth (anti-aliased) for legibility; deliberately contrasted against the pixel families. |
| **Noto Sans KR** | Google Fonts (locked v1) | `--font-ko` | All Korean text — grammar entries, example sentences, the bilingual `<span class="title__ko">` pattern. Smooth, weight 400 / 700 / 900. |

A monospace family (`--font-mono` → JetBrains Mono) stays declared from v1 for any code / debug surface; not used by the design system itself, but available.

**Deferred (open question for future iteration):** swap Noto Sans KR for a Korean pixel font like Galmuri or Neo둥근모 (Neo Dunggeunmo) on display-size Korean. Doing this in v2 would risk legibility for learners reading sentences; defer until we have user feedback that the smooth/pixel mix bothers anyone.

#### 3.2 Type scale (fixed sizes)

A flat 8-step scale. No fluid CSS (`clamp()`) in the app interior — fixed sizes keep the pixel aesthetic crisp. Landing page may layer fluid steps on top in its own spec.

| Token | Size | Line-height | Letter-spacing | Typical use |
|---|---|---|---|---|
| `--text-xs` | 10px | 1.6 | 0.06em | Tiny pixel labels (badges, dot indicators) — Press Start 2P only |
| `--text-sm` | 12px | 1.6 | 0.05em | Small UI labels (sidebar ko, helper text in Inter) |
| `--text-base` | 14px | 1.6 | 0.04em (PS2P) / 0 (Inter) | Default body, default button label |
| `--text-md` | 16px | 1.7 | 0 (Inter) / 0.04em (Silkscreen) | Relaxed body for long reading (log entries, settings panels) |
| `--text-lg` | 20px | 1.6 | 0.02em (Silkscreen) | Section subhead |
| `--text-xl` | 26px | 1.4 | 0.02em (Silkscreen) | Section header, sidebar brand |
| `--text-2xl` | 32px | 1.3 | 0.02em (Silkscreen) | Page title (the `title__ko` lineage) |
| `--text-3xl` | 44px | 1.2 | 0.02em (Silkscreen) | Display / hero / landing — used sparingly |

Line-heights are tuned per family at the implementation layer: pixel fonts need 1.5-1.8 for breathing room; Inter at body sizes runs at 1.6; Noto Sans KR at 1.7 because Hangul stacks taller than Latin and needs the extra room.

Letter-spacing in pixel fonts depends on the size. Press Start 2P at 10-14px reads better with 0.04-0.06em; at larger sizes the character spacing is already correct and tightening helps. The values above are starting points; the implementation phase will fine-tune per surface.

#### 3.3 Semantic typography roles

Components reference these roles, not raw sizes or families. Adding `font-size: 18px;` directly to a component is a code-smell — pick the role that matches the intent.

**Implementation:** these roles are utility CLASSES (e.g. `.type-page-title`), not CSS custom properties. Custom properties can't bundle font-family + font-size + letter-spacing + font-smoothing into a single token cleanly, so each role lives as a class in `tokens/typography.css`. Components apply the class on the element that needs that role (`class="type-page-title"`). Vue scoped styles don't interfere because utility classes live in the global typography file, not in scoped blocks.

| Role token | Family | Size | Weight | Used by |
|---|---|---|---|---|
| `--type-display` | Silkscreen | `--text-3xl` | Bold | Landing hero, achievement modal title |
| `--type-page-title` | Silkscreen | `--text-2xl` | Bold | `/library`, `/practice`, `/settings` page H1 |
| `--type-section` | Silkscreen | `--text-xl` | Regular | Section header inside a page |
| `--type-subsection` | Silkscreen | `--text-lg` | Regular | Subsection header |
| `--type-body` | Inter | `--text-base` | 400 | Default body copy |
| `--type-body-md` | Inter | `--text-md` | 400 | Long-form body (settings, log) |
| `--type-label` | Press Start 2P | `--text-sm` | (single weight) | Button label, sidebar item, badge |
| `--type-label-tight` | Press Start 2P | `--text-xs` | (single weight) | Tiny indicator label |
| `--type-helper` | Inter | `--text-sm` | 400 | Form helper text, input descriptions |
| `--type-caption` | Inter | `--text-xs` | 400 | Captions, footnotes |
| `--type-ko-display` | Noto Sans KR | `--text-2xl` | 900 | The `title__ko` pattern — Korean half of a bilingual title |
| `--type-ko-body` | Noto Sans KR | `--text-base` | 400 | Inline Korean inside paragraphs |
| `--type-ko-sentence` | Noto Sans KR | `--text-md` | 400 | Practice prompts, log entries Korean side |
| `--type-mono` | JetBrains Mono | `--text-sm` | 500 | Code / debug only |

#### 3.4 Bilingual rendering rule

The pattern `<span class="title__ko">내 정원</span> <span class="title__es">My garden</span>` is canonical for the project — every page title and section header uses it. The design rule:

- KO half uses `--type-ko-display` (Noto Sans KR 900, size matches the title rank)
- Latin half uses `--type-label` or `--type-section` depending on rank (Press Start 2P at smaller size, OR Silkscreen at matching size)
- The two halves share a `baseline-align`, set by `align-items: baseline`
- The Latin half sits visually subordinate to the KO half by being a smaller size

This pattern is implemented as a `<BilingualTitle>` component in [02-primitives.md](02-primitives.md) so screens never re-glue the spans by hand.

#### 3.5 Pixel font smoothing

The v1 `pixel.css` already declares `-webkit-font-smoothing: none` and `-moz-osx-font-smoothing: grayscale` via the `.font-pixel` class. v2 extends this to every pixel-family utility class so that no component needs to remember to disable smoothing:

```css
/* tokens/typography.css */
.font-pixel,
.type-label,
.type-label-tight,
.type-display,
.type-page-title,
.type-section,
.type-subsection {
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
```

These selectors target real class names (via §3.3's utility-class implementation), not CSS variable references. No anti-aliasing on pixel fonts — that's what makes them look pixel. Inter, Noto Sans KR, and JetBrains Mono get default smoothing because they don't carry any of the classes above.

#### 3.6 CSS implementation

```
app/assets/styles/tokens/
└── typography.css          ← THIS section: --font-*, --text-*, --type-*
```

The Google Fonts import in `pixel.css` extends to include Silkscreen:

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
```

`tailwind.config.ts` adds `display: ['Silkscreen', 'monospace']` to the `fontFamily` set, so `font-display` becomes a valid utility.

### 4. Spacing scale

4px-base scale. The v1 stopped at 32px which forces ad-hoc `margin: 40px` and `padding: 48px` declarations whenever a layout needs more breathing room — v2 closes that gap.

#### 4.1 Scale (10 steps)

| Token | px | Where it's used |
|---|---|---|
| `--space-0` | 0 | Reset |
| `--space-1` | 4 | Icon-to-text gap, badge inner padding |
| `--space-2` | 8 | Compact cluster gap, small button x-padding |
| `--space-3` | 12 | Default gap inside a card, button y-padding |
| `--space-4` | 16 | Page padding on mobile, default card padding-y |
| `--space-5` | 20 | Card padding-x, modal section gap |
| `--space-6` | 24 | Page section gap, sidebar item gap |
| `--space-8` | 32 | Page padding on desktop, hero block gap |
| `--space-12` | 48 | Major section break |
| `--space-16` | 64 | Landing hero, between-section margin |

Numbers 7, 9, 10, 11, 13, 14, 15 are intentionally skipped — keeping the scale sparse forces consistent rhythm. If a layout demands `--space-7` (28px), question whether it shouldn't be `--space-6` (24) or `--space-8` (32).

#### 4.2 Semantic spacing aliases

Common patterns get aliases so components don't memorise scale steps:

| Alias | Maps to | Use |
|---|---|---|
| `--gap-tight` | `--space-1` | Icon + label |
| `--gap-compact` | `--space-2` | Small cluster |
| `--gap` | `--space-3` | Default flex/grid gap |
| `--gap-loose` | `--space-4` | Relaxed cluster |
| `--padding-card-y` | `--space-4` | Card padding top/bottom |
| `--padding-card-x` | `--space-5` | Card padding left/right |
| `--padding-page-mobile` | `--space-4` | `<main>` padding under `--bp-md` |
| `--padding-page-desktop` | `--space-8` | `<main>` padding at and above `--bp-md` |
| `--gap-section` | `--space-6` | Between major sections in a page |

### 5. Radius

In a pixel-art system, radius is almost always 0. Rounded corners read as anti-pixel — they soften the silhouette that the chunky border is doing the work to define. This section exists to make that policy explicit rather than implicit.

#### 5.1 Scale

| Token | px | Use |
|---|---|---|
| `--radius-0` | 0 | **Default for every component.** Cards, modals, inputs, buttons, badges, tabs, tooltips — all of them. |
| `--radius-sm` | 2 | Reserved exception. Currently no in-system use; available for one-off needs that survive design review. |
| `--radius-full` | 9999px | Reserved exception. ONLY for: account avatar in `AccountWidget` (humanises an otherwise mechanical UI), and the loading spinner if/when added. |

#### 5.2 Policy

If a new component proposal wants `border-radius > 0`, it must justify in the component's section of [02-primitives.md](02-primitives.md) why the pixel silhouette doesn't work for it. Default-deny.

### 6. Shadow / elevation

Hard offset shadows — `Npx Npx 0 <color>` — never soft Gaussian blurs. This is the visual signature of LADX-style pixel UI: a chunky solid block sitting under the element, not a glow.

#### 6.1 Scale

| Token | Value | Use |
|---|---|---|
| `--shadow-pixel-sm` | `2px 2px 0 var(--border-strong)` | Pressed state, small badge |
| `--shadow-pixel-md` | `4px 4px 0 var(--border-strong)` | Default for cards and buttons (lineage from v1 `PixelButton`) |
| `--shadow-pixel-lg` | `6px 6px 0 var(--border-strong)` | Modal, mascota dialog box, raised hero card |
| `--shadow-pixel-xl` | `8px 8px 0 var(--border-strong)` | Landing hero card, max elevation |
| `--shadow-inset` | `inset 2px 2px 0 var(--border-strong)` | Inputs in resting state — looks pressed-in like a slot |
| `--shadow-inset-strong` | `inset 3px 3px 0 var(--ink-soft)` | Input focused state |

The color always references `--border-strong` (which aliases `--ink-soft`), NOT raw `--ink`. In light theme this resolves to warm brown (`#4a3a1f`) — the chunky-pixel look on cream paper. In dark theme, `--ink-soft` inverts to dusty cream (`#d8c89a`), so the shadow becomes cream-on-cave-brown — a halo rather than a chunky block. That's a known design follow-up for Phase 8 when the dark toggle ships; leaving as-is here per the spec direction.

#### 6.2 Semantic aliases (per state)

| Alias | Maps to | Used by |
|---|---|---|
| `--shadow-card` | `--shadow-pixel-md` | Card rest |
| `--shadow-card-hover` | `5px 5px 0 var(--border-strong)` | Card hover (note: non-scale value, half-step between md and lg, intentional micro-lift) |
| `--shadow-button` | `--shadow-pixel-md` | Button rest |
| `--shadow-button-hover` | `5px 5px 0 var(--border-strong)` | Button hover (matches card pattern) |
| `--shadow-button-pressed` | `--shadow-pixel-sm` | Button `:active` (sinks back into the page) |
| `--shadow-modal` | `--shadow-pixel-lg` | Modal, mascota dialog |
| `--shadow-input` | `--shadow-inset` | Input rest |
| `--shadow-input-focus` | `--shadow-inset-strong` | Input `:focus-visible` (combined with focus-ring outline) |

#### 6.3 Hover/active motion contract

Buttons and cards translate while their shadow grows/shrinks. The v1 `PixelButton` has this pattern; v2 formalises it:

```css
.button { transform: translate(0, 0); box-shadow: var(--shadow-button); }
.button:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.button:active { transform: translate(2px, 2px); box-shadow: var(--shadow-button-pressed); }
```

The combined effect is the element appearing to lift on hover and slam down on press. Motion timing is from §7.

### 7. Motion

Hybrid system: smooth eases for study chrome (where motion shouldn't distract from reading), step-based motion for game chrome (where motion should feel game-y). Both share the same durations.

#### 7.1 Durations

| Token | Value | Use |
|---|---|---|
| `--motion-instant` | `0ms` | No motion — for `prefers-reduced-motion: reduce` and for state changes that should snap |
| `--motion-quick` | `120ms` | Button hover, card hover, tab switch, color/bg transitions |
| `--motion-base` | `200ms` | Default for most transitions (input focus, toggle, badge swap) |
| `--motion-slow` | `320ms` | Modal open/close, page transition, mascota appearance |
| `--motion-deliberate` | `500ms` | Mastery growth (seedling → plant → tree), level-up — rare, intentionally noticeable |

#### 7.2 Easing curves

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Default for entering motion (modal open, toast in) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Default for exiting motion (modal close, toast out) |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric (toggle, tab switch) |
| `--ease-step-3` | `steps(3, end)` | Step-based, 3 frames — game chrome state transitions |
| `--ease-step-5` | `steps(5, end)` | Step-based, 5 frames — mascota expression changes |

#### 7.3 Chrome-aware motion aliases

The mode-aware system (specced in [03-chromes.md](03-chromes.md)) lets primitives pick the right easing per surface. The aliases below resolve differently in study vs game chromes:

| Alias | Study chrome | Game chrome |
|---|---|---|
| `--motion-button` | `--motion-quick` `--ease-out` | `--motion-quick` `--ease-step-3` |
| `--motion-card` | `--motion-quick` `--ease-out` | `--motion-quick` `--ease-step-3` |
| `--motion-modal` | `--motion-slow` `--ease-out` | `--motion-slow` `--ease-step-3` |
| `--motion-toast` | `--motion-base` `--ease-out` | `--motion-base` `--ease-step-3` |

Implementation note: these aren't CSS variables (variables can't hold timing-function + duration tuples cleanly). They're documented contracts that components implement via the `data-surface` attribute selector pattern from [03-chromes.md](03-chromes.md).

#### 7.4 `prefers-reduced-motion`

Hard rule: under `@media (prefers-reduced-motion: reduce)`, ALL transitions resolve to `--motion-instant` and ALL animations stop at their first frame. The mascota's idle loops freeze on her default idle frame. Mastery transitions snap. No exceptions for "important" motion — the user has explicitly asked for none.

Implementation: a single block in `tokens/motion.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 7.5 Animation primitives (out of scope here)

Keyframe animations (mascota idle bob, mastery growth, achievement burst) are specced in [04-sprites-mascota.md](04-sprites-mascota.md) §6. This file only defines the duration/easing tokens they consume.

### 8. Breakpoints

The v1 has one breakpoint (768px, sidebar↔navbar swap). v2 adds three more so we can make calls at the right granularities. Names align with Tailwind's defaults to avoid mental translation between system and utility classes.

#### 8.1 Scale

| Token | Min-width | Use |
|---|---|---|
| `--bp-sm` | `480px` | Phone landscape — type can grow one step, padding can relax slightly |
| `--bp-md` | `768px` | **Sidebar appears (existing cutoff)**, page padding moves from `--space-4` to `--space-8` |
| `--bp-lg` | `1024px` | Desktop default — secondary panels can appear (e.g. context preview pane in `/practice`) |
| `--bp-xl` | `1280px` | Wide desktop — content max-width caps at `1200px` (already set in `AppShell`), surrounding paper extends |

#### 8.2 CSS / Tailwind usage

```css
/* From tokens/breakpoints.css */
@custom-media --bp-sm (min-width: 480px);
@custom-media --bp-md (min-width: 768px);
@custom-media --bp-lg (min-width: 1024px);
@custom-media --bp-xl (min-width: 1280px);
```

Tailwind already exposes `sm:` / `md:` / `lg:` / `xl:` at the same values by default, so no extension to `tailwind.config.ts` is needed.

#### 8.3 Container max-widths

| Surface | Max width |
|---|---|
| Page main column | `1200px` (existing `AppShell.shell__main`) |
| Landing hero | `1440px` (specced in the landing spec, not here) |
| Modal | `560px` default, `720px` for wide modals (e.g. export) |
| Toast | `360px` |
