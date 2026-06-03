# Design System v2 — Primitives

> **Status:** SCAFFOLDED (skeleton only — content pending "empieza")
> **Parent:** [00-overview.md](00-overview.md) · **Consumes:** [01-tokens.md](01-tokens.md)

## Purpose

Spec each primitive: API (props/emits/slots), visual anatomy, states (rest, hover, focus, active, disabled, loading where applicable), and the file path where it lives. One file per primitive — no mega-components.

Every primitive consumes tokens from [01-tokens.md](01-tokens.md). Every primitive is surface-aware (reads its mode from the surrounding `<Surface>` wrapper specced in [03-chromes.md](03-chromes.md)) where the visual changes between study and game chromes.

## Section template

Each primitive section will follow the same shape so reviewing them is mechanical:

```
### <Primitive name>

- **File path:** app/components/ui/<Name>.vue
- **API:** props, emits, slots
- **Anatomy:** ASCII sketch of the resting state
- **States:** rest / hover / focus / active / disabled / (loading)
- **Surface-awareness:** does it look different in study vs game chrome? if yes, how
- **Migration from current code:** what changes vs the existing implementation
- **A11y notes:** focus ring, ARIA, keyboard
```

## Shared conventions

These apply to every primitive. They reduce per-primitive boilerplate and make the system predictable.

### File layout
Every primitive lives at `app/components/ui/<Name>.vue`, one file per primitive. Sub-components (e.g. `Tabs.vue` + `TabsPanel.vue`) are allowed when a primitive splits into truly independent sub-units — flagged explicitly per primitive when applicable.

### Token consumption
Primitives reference **semantic aliases only** (`--accent`, `--surface`, `--text`, `--shadow-button`, etc.). Never raw hex, never brand swatches directly. A primitive containing `#xxxxxx` in its CSS is a code-review block.

### Surface awareness
Surface-aware primitives read their chrome mode from the closest ancestor with `data-surface="study|game"` (injected by the `<Surface>` wrapper from [03-chromes.md](03-chromes.md)). Each primitive section below states explicitly whether it is surface-aware.

### State conventions
Every interactive primitive specifies: `rest`, `hover`, `focus-visible`, `active`, `disabled`. Loading/error states are added per primitive when applicable.

### Accessibility baseline
- `:focus-visible` always renders `--focus-ring`. Never suppress.
- `prefers-reduced-motion` respected (handled centrally in `tokens/motion.css`; primitives don't re-implement).
- Every interactive element is keyboard-operable.
- Every state visible to sighted users is announced via ARIA when needed.

### Migration policy
Existing primitives (`PixelButton`, `PixelCard`, `PixelInput`, `Toast`) **evolve in place**: same file location, same Vue component, drop the `Pixel` prefix from the name. The prefix is redundant — the whole system is pixel. A single PR renames + updates all imports.

### Why 12 primitives, not 10
The skeleton listed 10 (Button, Card, Input, Modal, Tabs, Badge, Tooltip, Avatar, Toggle, Toast). Two more emerged naturally during this section:
- **`Field`** — wraps `Input`/`Toggle` with label + hint + error. Without it, every page re-implements label/error wiring.
- **`BilingualTitle`** — formalises the `title__ko` / `title__es` pattern that already lives inline in every page. Pure consolidation.

Both are consolidations of existing patterns, not new features. No further primitives are in scope for v2.

---

## Primitives

### 1. Button

**Status:** evolves from `PixelButton.vue` v1
**File:** `app/components/ui/Button.vue`

**Purpose:** The default action trigger. Three variants for hierarchy (primary / secondary / danger), three sizes.

#### API
```ts
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'   // default 'primary'
  size?: 'sm' | 'md' | 'lg'                       // default 'md'
  type?: 'button' | 'submit'                      // default 'button'
  disabled?: boolean
  loading?: boolean                               // NEW v2
  fullWidth?: boolean                             // NEW v2
}

emits: { click: [MouseEvent] }
slots: { default; icon? }      // icon = leading icon
```

#### Anatomy
```
sm:  ┌─────────────┐    md:  ┌─────────────────┐    lg:  ┌──────────────────────┐
     │ LABEL       │         │  연습 PRACTICE   │         │  연습 PRACTICE NOW   │
     └─────────────┘         └─────────────────┘         └──────────────────────┘
        ↘ shadow                ↘ shadow                    ↘ shadow
```

#### States
| State | Visual delta |
|---|---|
| rest | bg `--accent`, text `--text-on-accent`, shadow `--shadow-button`, translate(0,0) |
| hover | shadow `--shadow-button-hover`, translate(-1px,-1px) |
| focus-visible | + outline `2px solid var(--focus-ring)`, 2px offset |
| active | shadow `--shadow-button-pressed`, translate(2px,2px) |
| disabled | opacity 0.4, motion suppressed, cursor not-allowed |
| loading | opacity 0.7, spinner overlay, pointer-events: none, `aria-busy` |

`secondary`: bg `--surface`, text `--text`. `danger`: bg `--danger`, text `--text-on-danger`.

#### Migration from v1
- Rename `PixelButton` → `Button` (file + import)
- Add `size`, `loading`, `fullWidth` props
- Migrate `var(--jade)` → `var(--accent)`
- Variant CSS classes become `data-variant` attribute selectors (`button[data-variant="danger"]`) for cleaner targeting

#### A11y
- `:focus-visible` outline always visible
- `aria-disabled` when `disabled`
- `aria-busy="true"` + visible spinner when `loading`
- Enter and Space activate (native `<button>` semantics)

---

### 2. Field

**Status:** NEW
**File:** `app/components/ui/Field.vue`

**Purpose:** Wraps an `Input` / `Toggle` with label, required marker, hint text, and error text. Separates layout/labelling from the underlying control so the same control doesn't reimplement labels each time.

#### API
```ts
interface Props {
  label: string
  htmlFor: string         // forwarded to <label for="...">
  required?: boolean
  hint?: string
  error?: string          // when set, replaces hint, switches control border to --danger-bright
}

slots: { default; }       // the Input / Toggle goes here
```

#### Anatomy
```
Label *
[ Input ─────────────── ]
  Hint text         (or "Error message" in --danger when error is set)
```

#### States
Determined by the slotted control + the `error` prop. No interactive states of its own.

#### Surface awareness
None — identical in both chromes.

#### A11y
- `<label for="...">` linked to control
- `aria-describedby` connecting control to hint OR error
- `aria-invalid="true"` on the control when `error` is set (via provide/inject)
- Required indicator (`*`) is `aria-hidden`; the `required` prop is also forwarded to the control for screen reader announcement

---

### 3. Input

**Status:** evolves from `PixelInput.vue` v1
**File:** `app/components/ui/Input.vue`

**Purpose:** Single-line text input. The inset-shadow gives it the "pressed-in slot" look pixel UIs use for editable surfaces.

#### API
```ts
interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number'   // default 'text'
  placeholder?: string
  disabled?: boolean
  error?: boolean                                    // border + shadow turn red (set by Field via inject when used inside one)
  id?: string                                        // set when standalone; Field provides it
}

emits: { 'update:modelValue': [string] }
slots: { prefix?; suffix? }     // for icons or units (@, .com, ¥)
```

#### Anatomy
```
┌─────────────────────────┐
│ placeholder text        │   ← inset shadow makes it look recessed
└─────────────────────────┘

With prefix/suffix:
┌─────────────────────────┐
│ @  user input      .com │
└─────────────────────────┘
```

#### States
| State | Visual delta |
|---|---|
| rest | bg `--surface`, border `--border`, inset shadow `--shadow-input` |
| focus-visible | border `--border-strong`, shadow `--shadow-input-focus`, + outline `--focus-ring` |
| error | border `--danger-bright`, shadow uses red-tinted inset |
| disabled | opacity 0.5, cursor not-allowed |

#### Migration from v1
- Rename `PixelInput` → `Input`
- Add `prefix`/`suffix` slots
- Add `error` prop wired to Field via inject
- Placeholder color stays `--text-soft` but verified to pass 3:1 against `--surface`

#### A11y
- `:focus-visible` outline
- `aria-invalid` when `error`
- Works under `<Field>` for label association; standalone usage requires manual `id` + `aria-label`

---

### 4. Toggle

**Status:** NEW
**File:** `app/components/ui/Toggle.vue`

**Purpose:** Two-state switch. Square shape (pixel art convention — no pills). Used by Settings, theme switcher, context activation toggles, future cosmetics on/off.

#### API
```ts
interface Props {
  modelValue: boolean
  label?: string             // when standalone (without Field)
  size?: 'sm' | 'md'         // default 'md'
  disabled?: boolean
}

emits: { 'update:modelValue': [boolean] }
```

#### Anatomy
```
Off:                    On:
┌──────────────┐        ┌──────────────┐
│ ███          │        │          ███ │
└──────────────┘        └──────────────┘
  indicator slides left ↔ right
```

#### States
| State | Visual delta |
|---|---|
| off | bg `--surface`, indicator at left, indicator bg `--ink-soft` |
| on | bg `--accent`, indicator at right, indicator bg `--paper` |
| hover | shadow grows one step |
| focus-visible | + focus ring |
| disabled | opacity 0.5 |

#### Surface awareness
**Yes (motion only).** Indicator slide uses `--ease-step-3` in game chrome (3-frame snap), `--ease-out` in study chrome (smooth glide). Visuals identical.

#### A11y
- `role="switch"` + `aria-checked`
- Space toggles
- Label association via `aria-labelledby` (Field) or `aria-label` (standalone)

---

### 5. Card

**Status:** evolves from `PixelCard.vue` v1
**File:** `app/components/ui/Card.vue`

**Purpose:** Default surface container. Holds content with a coloured accent stripe on the left. Used everywhere — log entries, library rows, settings panels, mascota dialog.

#### API
```ts
interface Props {
  accent?: 'jade' | 'red' | 'sky' | 'gold' | 'none'   // default 'jade'
  clickable?: boolean                                  // adds hover/active/cursor
  selected?: boolean                                   // border-strong + filled stripe
}

emits: { click?: [MouseEvent] }     // only when clickable
slots: { default; header?; footer? }
```

#### Anatomy
```
Study chrome:
┌─────────────────────┐
│▎                    │   ← thick left stripe in accent color (6px)
│  header             │
│  content            │
│  footer             │
└─────────────────────┘
   ↘ shadow-card

Game chrome:
╭───────────────────╮
│✦  header        ✦│   ← corner ornaments instead of stripe
│   content         │
│✦  footer        ✦│
╰───────────────────╯
```

#### States
| State | Visual delta |
|---|---|
| rest | bg `--surface`, border `--border`, shadow `--shadow-card` |
| hover (clickable) | shadow `--shadow-card-hover`, translate(-1px,-1px) |
| active (clickable) | shadow `--shadow-pixel-sm`, translate(2px,2px) |
| selected | border `--border-strong`, left stripe expands to fill background instead of 6px width |
| focus-visible (clickable) | + focus ring |

#### Surface awareness
**Yes.** Study chrome: left accent stripe (current v1 look). Game chrome: corner ornaments + scroll-paper border accent. Visual reference in [03-chromes.md](03-chromes.md) §1.

#### Migration from v1
- Rename `PixelCard` → `Card`
- `indigo` accent renamed `sky` (matches token rename)
- Add `clickable`, `selected` props
- Add `header`/`footer` slots
- Add the game-chrome corner-ornament rendering path

#### A11y
- If `clickable`: `role="button"` + `tabindex="0"` + Enter/Space activates
- If `selected`: `aria-selected="true"` (list context) OR `aria-pressed="true"` (toggle context) — caller picks via prop

---

### 6. Modal

**Status:** NEW
**File:** `app/components/ui/Modal.vue`

**Purpose:** Centred overlay for focused tasks: confirmations, edit flows, mascota dialog, achievement reveals. Backdrop dims the rest. Closeable via ESC, backdrop click, or X button.

#### API
```ts
interface Props {
  modelValue: boolean                            // open state (v-model)
  title?: string
  size?: 'sm' | 'md' | 'lg'                      // 480 / 640 / 800
  closeable?: boolean                            // default true
  closeOnBackdrop?: boolean                      // default true
}

emits: { 'update:modelValue': [boolean]; close: [] }
slots: { default; footer?; peek? }     // peek = mascota sprite, game chrome only
```

#### Anatomy
```
   (backdrop: --paper with 70% opacity)

   Game chrome:
                                          🧑‍🌾  ← #peek slot
                                          /│      (optional, anchored top-right)
   ╭──────────────────────────────────╮  /
   │ ✦  Modal title           [×]  ✦│ /
   ├──────────────────────────────────┤
   │                                  │
   │   body slot                      │
   │                                  │
   ├──────────────────────────────────┤
   │  [Cancel]            [Confirm]  │   ← footer slot
   ╰──────────────────────────────────╯
            ↘ shadow-modal (6px 6px 0)
```

The mascota peek slot is rendered conditionally — passed via a `<template #peek>` slot when a parent wants the mascota to appear (e.g. on `/practice` completion modal). Empty by default. Sprite spec in [04-sprites-mascota.md](04-sprites-mascota.md) §4.3.

#### States
| State | Behaviour |
|---|---|
| closed | not rendered (Teleport target empty) |
| opening | backdrop fade-in `--motion-base`; modal scale 0.95→1 + slide-down 8px |
| open | focus trapped, body scroll locked |
| closing | reverse of opening |

`prefers-reduced-motion`: snap. No fade or scale.

#### Surface awareness
**Yes.** Heavy in game chrome (title bar with corner ornaments, scroll-paper texture inside title). Plain rectangle in study chrome.

#### A11y
- `role="dialog"` `aria-modal="true"`
- `aria-labelledby` → title id
- Focus trap (initial focus = first interactive in body, or close button if none)
- ESC closes (if `closeable`)
- Restore focus to trigger element on close
- `inert` attribute set on `<main>` while open so screen readers skip the rest

---

### 7. Tabs

**Status:** NEW
**Files:** `app/components/ui/Tabs.vue` + `app/components/ui/TabsPanel.vue` (sub-component allowed per Shared §1)

**Purpose:** Horizontal segmented control for swapping between equivalent views. Used by the log filter (all / hard / easy), library filter, future practice-mode picker, future cosmetics tabs.

#### API
```ts
// Tabs.vue
interface Props {
  modelValue: string                                    // active tab id
  tabs: Array<{ id: string; label: string; ko?: string }>
}
emits: { 'update:modelValue': [string] }
slots: { '[tabId]': PanelContent }     // dynamic named slot per tab id
```

#### Anatomy
```
┌─────────┬─────────┬─────────┐
│  All    │  Hard   │  Easy   │      ← active tab fully filled
└─────────┴═════════┴─────────┘         inactive: text-soft, transparent bg
              ↑ active accent bar (4px, --accent) under active tab

[panel content for active tab]
```

#### States (per tab)
| State | Visual delta |
|---|---|
| inactive | bg transparent, text `--text-soft` |
| inactive hover | bg `--surface-hover` |
| active | bg `--accent`, text `--text-on-accent`, 4px accent bar at bottom |
| focus-visible | + focus ring |

#### Surface awareness
None — tab geometry stays the same in both chromes. (Future iteration may give game chrome scroll-paper tabs; v2 keeps it consistent.)

#### A11y
- `role="tablist"` / `role="tab"` / `role="tabpanel"`
- Arrow keys move between tabs; Home/End jump to first/last
- `aria-selected` on active tab; `aria-controls` linking tab → panel
- Optional `ko` label rendered with `lang="ko"`

---

### 8. Badge

**Status:** NEW
**File:** `app/components/ui/Badge.vue`

**Purpose:** Tiny status label. Used for mastery level on grammar cards, counts ("12 new"), language pills, deck colour markers, error indicators.

#### API
```ts
interface Props {
  variant?: 'jade' | 'red' | 'gold' | 'sky' | 'soft'   // default 'soft'
  size?: 'sm' | 'md'                                    // default 'sm'
}
slots: { default; }
```

#### Anatomy
```
[ TREE ]   [ NEW ]   [ 24 ]   [ 한국어 ]
  jade       red      gold       soft
```

`soft`: bg `--surface-hover`, text `--text-soft`. Colour variants: bg = brand swatch (bright), text = `--always-dark` (passes contrast in both themes per §1.4).

#### States
Rest only. Badges are not interactive — wrap in a `<button>` if you need clickable behaviour.

#### Surface awareness
None.

#### A11y
- If the badge conveys semantic state (e.g. "error", "new"), the text must be self-describing OR an `aria-label` is required.

---

### 9. Avatar

**Status:** NEW
**File:** `app/components/ui/Avatar.vue`

**Purpose:** Compact identity glyph. Two flavours: circular for human accounts (consumed by `AccountWidget`), square for mascota and any pixel-art character portrait.

#### API
```ts
interface Props {
  src?: string                                 // image URL
  name?: string                                // for initials fallback (humans) AND alt text
  shape?: 'circle' | 'square'                  // default 'circle'
  size?: 'sm' | 'md' | 'lg'                    // 24 / 32 / 48
}
slots: { default; }                            // custom override (e.g. mascota sprite)
```

#### Anatomy
```
Human (circle):     Mascota (square):
   ╭───╮              ┌─────┐
   │JK │              │ 🧑‍🌾  │
   ╰───╯              └─────┘
```

#### States
Rest only.

#### Surface awareness
None.

#### A11y
- `alt` derived from `name` when `src` is set
- Square mascota avatars get `aria-hidden="true"` when the mascota's name is already announced elsewhere on the page (avoid double-announce)
- Circle radius is the ONLY use of `--radius-full` in the system (per [01-tokens.md](01-tokens.md) §5.1)

---

### 10. Tooltip

**Status:** NEW
**File:** `app/components/ui/Tooltip.vue`

**Purpose:** Short hover/focus descriptor for icon-only buttons, abbreviations, mastery glyphs, locale flags. Not for long-form help text (use `<Field>` hint).

#### API
```ts
interface Props {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'   // default 'top'
  delay?: number                                     // ms before show; default 200
}
slots: { default; }    // the anchor element
```

#### Anatomy
```
   ┌──────────────────┐
   │ Tooltip text     │
   └─────────┬────────┘
             ▼
        [anchor]
```

#### States
| Trigger | Behaviour |
|---|---|
| anchor hover (`>= delay`) | tooltip appears |
| anchor focus (keyboard) | tooltip appears immediately (delay ignored) |
| anchor leave / blur / Esc | tooltip hides |

#### Surface awareness
None.

#### A11y
- `aria-describedby` linking anchor to tooltip id
- Tooltip text is visible to screen readers via the `aria-describedby` reference
- Esc dismisses
- `prefers-reduced-motion`: appear/hide instantly, no fade

---

### 11. Toast

**Status:** evolves from `Toast.vue` v1
**Files:** `app/components/ui/Toast.vue` + `app/composables/useToast.ts` (existing, extended)

**Purpose:** Brief auto-dismissing notification. Used to confirm save, report sync result, surface non-blocking errors.

#### API
```ts
// useToast()
.show(msg: string, opts?: { variant?: 'success' | 'error' | 'info' | 'warning'; duration?: number })
.success(msg, duration?)
.error(msg, duration?)
.info(msg, duration?)
.warning(msg, duration?)
.dismiss(id?)
```

Default duration: 3500ms. Error variant: 5500ms (gives time to read).

#### Anatomy
```
                                ╭─────────────────────────────╮
                                │ ✓  Saved to your garden     │   ← variant icon + text
                                ╰─────────────────────────────╯
                                ━━━━━  progress bar  ━━━━━━━     ← shrinks 100%→0% over duration
                                          (bottom-right, stacks upward, max 3 visible)
```

#### States
| State | Behaviour |
|---|---|
| entering | slide-up + fade-in `--motion-base` |
| visible | progress bar shrinks `--motion-deliberate`-style, but for `duration` ms |
| exiting | slide-down + fade-out |

#### Migration from v1
- Existing single-variant Toast becomes variant-aware
- Add stacking (max 3 visible; older queued)
- Add progress bar
- `useToast` composable already exists; extend with variant helpers

#### A11y
- `role="status"` for success/info/warning
- `role="alert"` for error
- `aria-live="polite"` (non-error) / `"assertive"` (error)
- Dismiss button keyboard-reachable when toast is focused
- `prefers-reduced-motion`: snap in / snap out, no slide

---

### 12. BilingualTitle

**Status:** NEW (formalises an existing pattern)
**File:** `app/components/ui/BilingualTitle.vue`

**Purpose:** Captures the `<span class="title__ko">내 정원</span> <span class="title__es">{{ t('title.garden') }}</span>` pattern that already lives in every page. Currently re-implemented inline on each page — the primitive eliminates the duplication and locks the bilingual hierarchy rule from [01-tokens.md](01-tokens.md) §3.4.

#### API
```ts
interface Props {
  ko: string                                  // Korean half
  latin: string                               // Latin half (typically from i18n)
  level?: 'h1' | 'h2' | 'h3'                  // default 'h1'
}
```

#### Anatomy
```
내 정원  GARDEN
 ↑        ↑
 KO       Latin (smaller, subordinate)
 hero
```

Sizes scale with `level`:
- `h1`: KO `--type-ko-display` (32px Noto Sans KR 900), Latin `--type-label` (14px PS2P)
- `h2`: KO 24px Noto Sans KR 700, Latin 12px PS2P
- `h3`: KO 20px Noto Sans KR 700, Latin 11px PS2P

#### States
None — display only.

#### Surface awareness
None.

#### Migration
Every page currently has:
```vue
<h1 class="title">
  <span class="title__ko">내 정원</span>
  <span class="title__es">{{ t('title.garden') }}</span>
</h1>
```

Becomes:
```vue
<BilingualTitle ko="내 정원" :latin="t('title.garden')" />
```

Eliminates ~30 lines of CSS duplicated across 6 pages.

#### A11y
- Renders semantic heading tag per `level`
- Both spans inside a single heading element (single accessible name)
- `lang="ko"` on the KO span for screen reader pronunciation

## Out of scope

Primitives only. Composed components (e.g. `GrammarCard`, `AccountWidget`, `LocaleSwitcher`, `ContextDisplay`, `SentenceInput`, `CompletionBanner`) are NOT specced here — they consume these primitives and are designed inside the per-screen redesign specs that come later.
