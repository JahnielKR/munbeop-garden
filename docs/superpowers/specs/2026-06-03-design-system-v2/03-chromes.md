# Design System v2 — Chromes (Study vs Game)

> **Status:** SCAFFOLDED (skeleton only — content pending "empieza")
> **Parent:** [00-overview.md](00-overview.md) · **Consumes:** [01-tokens.md](01-tokens.md), [02-primitives.md](02-primitives.md)

## Purpose

How a single token set produces two visual vocabularies depending on the surface. The mode is set at the route level (or per `<Surface>` block) — primitives downstream read it implicitly. This is the mechanism that lets `/library` feel like a quiet study tool and `/practice` feel like opening a Zelda dialog without forking the component tree.

## Sections

### 1. The two chromes — visual reference

#### 1.1 Study chrome

Calm, scannable, optimised for reading and entering text. Used by `/library`, `/log`, `/stats`, `/settings`, `/auth/*`.

```
┌─────────────────────────────────────────────────┐
│  Korean Grammar     LIBRARY                     │  ← BilingualTitle (h1)
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │▎ ~다 — statement ending          [TREE] │    │  ← Card, accent stripe
│  │  mastery 24 / 3                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │▎ ~으면 — conditional             [SEED] │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘

Vocabulary:
- Cards: 2px --border (warm cream), accent stripe 6px left
- Shadows: --shadow-card (4px 4px 0)
- Motion: --ease-out (smooth, 120ms)
- Headings: BilingualTitle (Noto Sans KR 900 + Press Start 2P)
- Body: Inter
- Decorations: none. Whitespace does the work.
```

#### 1.2 Game chrome

Immersive, decorated, optimised for the player's character moments. Used by `/`, `/practice`, future `/dungeon`, `/garden/map`, `/mascota`.

```
                                            🧑‍🌾  ← mascota peek (optional sprite slot)
                                            /│
╭───────────────────────────────────────────╮ │
│ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ │  ← Modal title bar with corner ornaments
│                                           │
│   ~다 — statement ending                  │
│                                           │
│   Practice this with a friend in casual   │  ← Card, corner ornaments at 4 corners
│   context                                 │
│                                           │
│ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ │
╰───────────────────────────────────────────╯

Vocabulary:
- Cards: 2px --border-strong (darker brown), corner ornaments ✦ at 4 corners
- Shadows: same --shadow-card (4px 4px 0) — chunky in both modes
- Motion: --ease-step-3 (3-frame snap, 120ms total) — feels like a game frame transition
- Modal title bars: corner ornaments + decorative line under the title
- Mascota peek slot: 32×32 sprite anchored to the top-right of the active dialog (optional, only in mascota-aware screens)
- Headings: same BilingualTitle component
- Body: same Inter
- Decorations: ornament sprites (specced in [04-sprites-mascota.md](04-sprites-mascota.md))
```

#### 1.3 What is the same in both

Most of the system. The tokens (palette, typography, spacing, radius, shadow scale) don't change between chromes. The primitives' APIs don't change. The reading experience inside a card is the same. What changes is **decoration** and **motion easing** — two narrow axes.

This is what makes the cost of having two chromes low: a single token system, a single primitive set, two thin layers of "outfit".

### 2. Token deltas (study vs game)

#### 2.1 What stays identical

- Palette (light + dark) — both chromes use the same hex values
- Typography (families, scale, line-heights, letter-spacing)
- Spacing scale
- Radius scale (still all zero in both)
- Shadow scale (chunky offset shadows in both — that's the LADX baseline)
- Breakpoints
- Component APIs (a `Button`'s props don't depend on the chrome)
- Reading experience (body text, line-heights, copy density)

#### 2.2 What differs

Only six things change between modes. They're documented as `[data-surface="game"]` attribute selectors INSIDE each affected primitive's scoped CSS, never as separate variable values.

| Concern | Study | Game | Where it's implemented |
|---|---|---|---|
| **Card border colour** | `--border` (warm cream) | `--border-strong` (darker brown) | `Card.vue` scoped CSS |
| **Card corner ornaments** | none | 4× ✦ sprites at corners (12×12 each) | `Card.vue` `::before`/`::after` + extra elements |
| **Card left accent stripe** | 6px coloured stripe | suppressed (replaced by corner ornaments) | `Card.vue` |
| **Modal title bar** | plain text + close button | corner ornaments + decorative line under title | `Modal.vue` |
| **Modal body background** | flat `--surface` | flat `--surface` + optional scroll-paper texture overlay on title bar only | `Modal.vue` |
| **Motion easing** (everywhere) | smooth `--ease-out` | step-based `--ease-step-3` | the chrome-aware aliases `--motion-button`/`--motion-card`/`--motion-modal`/`--motion-toast` from [01-tokens.md](01-tokens.md) §7.3 |

That is the complete list. If a future design needs a seventh delta, it must be added here first — primitives cannot improvise mode-specific behaviour ad-hoc.

#### 2.3 Why so few deltas

The chrome is the LIGHT signal that "you're now in game mode" — it doesn't have to scream. Keeping the deltas narrow means:

- Implementation cost is bounded (only 2 primitives — Card, Modal — carry visual code paths for game mode)
- A11y stays equivalent in both chromes (no game-only motion that screen readers care about, no game-only text that's harder to parse)
- Study-mode and game-mode screens can sit next to each other (e.g. a help drawer inside `/practice`) without visual whiplash

### 3. The mechanism — three cooperating layers

Decided after weighing three options (see §3.4): **route meta declares the mode, AppShell provides it via `provide()`, primitives inject it and stamp `data-surface` on their root**. The `<Surface>` wrapper exists as an optional override but is not the primary mechanism.

#### 3.1 Layer 1 — route declares mode

Each page sets its surface mode via Nuxt's `definePageMeta`. This makes the mode part of the route definition, where it belongs (a screen's nature doesn't change at runtime).

```vue
<!-- app/pages/practice.vue -->
<script setup>
definePageMeta({ surface: 'game' })
</script>
```

Routes that omit `surface` default to `'study'` (the safe default — a study chrome on a game-mode screen looks plain, the inverse looks chaotic).

#### 3.2 Layer 2 — AppShell provides

`AppShell.vue` reads the current route's meta and calls `provide()` so descendants can inject. A computed wraps the read so route changes flow through.

```vue
<!-- app/components/layout/AppShell.vue (added in v2) -->
<script setup>
const route = useRoute()
const surface = computed<'study' | 'game'>(() => route.meta.surface as any ?? 'study')
provide('surface', surface)
</script>
```

The provided value is a `ComputedRef`, not a plain string — primitives that inject it stay reactive to route changes (matters during SPA navigation).

#### 3.3 Layer 3 — primitives inject and stamp

Surface-aware primitives (`Card`, `Modal`) inject the value and bind it to their root element's `data-surface` attribute. CSS attribute selectors then drive the visual delta from §2.

```vue
<!-- app/components/ui/Card.vue -->
<script setup>
const surface = inject<Ref<'study' | 'game'>>('surface', ref('study'))
</script>

<template>
  <div class="card" :data-surface="surface">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-card);
  /* base styles apply in both modes */
}
.card[data-surface="game"] {
  border-color: var(--border-strong);
  /* ornament pseudo-elements below */
}
.card[data-surface="game"]::before,
.card[data-surface="game"]::after { /* ... */ }
</style>
```

Non-surface-aware primitives (Button, Field, Input, Toggle, Tabs, Badge, Avatar, Tooltip, Toast, BilingualTitle) don't inject — they read motion tokens that already resolve correctly via the chrome-aware aliases.

#### 3.4 Alternatives considered

| Approach | Verdict | Why |
|---|---|---|
| **A. Route meta + provide/inject** (chosen) | ✓ | Declarative at the route, ergonomic for primitives, supports overrides |
| **B. Wrapper component with `display: contents`** | ✗ | Attribute selectors need a rendering ancestor; `display: contents` removes the box; would force layout-affecting div |
| **C. CSS classes (`.surface-game`)** | ✗ | Composes worse with state selectors (`:hover`, `:focus`) than attribute selectors do; uglier in DevTools |
| **D. Per-primitive prop (`<Card surface="game">`)** | ✗ | Every page would re-declare the mode for every primitive — violates DRY and invites drift |

#### 3.5 The optional `<Surface>` override

Sometimes a section of a game-mode page should be study-mode (e.g. a help drawer on `/practice` that needs to be read carefully). `<Surface mode="study">` wraps that section and re-provides:

```vue
<!-- app/components/ui/Surface.vue -->
<script setup>
const props = defineProps<{ mode: 'study' | 'game' }>()
const mode = computed(() => props.mode)
provide('surface', mode)
</script>

<template>
  <div :data-surface="mode" class="surface-override">
    <slot />
  </div>
</template>

<style scoped>
.surface-override { display: contents; }   /* the wrapper carries the attribute via :has-style trick OR via a real div if needed */
</style>
```

> Implementation note: `display: contents` strips the wrapper from the layout BUT keeps the attribute selector chain working for descendants only if those descendants stamp their own `data-surface`. Since primitives DO stamp their own (via inject), this works. If a future case needs an attribute selector that targets the wrapper itself, the wrapper drops `display: contents` and renders a real div.

### 4. Per-route assignment

Canonical mapping. Each page sets this via `definePageMeta({ surface: ... })`. Routes omitted from the table inherit the default (`study`).

| Route | Mode | Reasoning |
|---|---|---|
| `/` | **game** | The home becomes the garden map (Stardew-style overworld). Decided here — this was the open question from the §4 skeleton. |
| `/practice` | game | The practice loop is the gamified core. |
| `/auth/sign-in` | study | Utility flow, no character moments. |
| `/auth/callback` | study | Utility flow. |
| `/library` | study | Reference content, scanned. |
| `/log` | study | History list, scanned. |
| `/stats` | study | Numbers and charts. |
| `/settings` | study | Configuration. |
| `/dungeon` (future) | game | Defining feature — visual novel + timer. |
| `/garden/map` (future) | game | Overworld map. |
| `/mascota` (future) | game | Character interaction. |
| `/landing` (future) | (its own system) | Landing has its own design vocabulary per [00-overview.md](00-overview.md) "Out of scope". Not under the `surface` axis. |

`/` getting `game` is the only decision that wasn't already locked from the overview anchor. It earned its mode by the eventual garden-map intent — even if the v2 home stays the stub it is now, the data-surface declaration goes in so the chrome is right the day the map ships.

### 5. How primitives consume the mode

Cross-reference table — each row is the contract between [02-primitives.md](02-primitives.md) and this file.

| Primitive | Reads `inject('surface')` | Stamps `data-surface` on root | Uses chrome-aware motion alias | Net mode behaviour |
|---|---|---|---|---|
| Button | no | no | yes (`--motion-button`) | identical in both, motion easing flips |
| Field | no | no | no | identical |
| Input | no | no | no | identical |
| Toggle | no | no | yes (`--motion-button` for the indicator slide) | identical visual, motion easing flips |
| Card | **yes** | **yes** | yes (`--motion-card`) | corner ornaments + border-strong + step motion in game |
| Modal | **yes** | **yes** | yes (`--motion-modal`) | title bar decorations + step motion in game |
| Tabs | no | no | yes (`--motion-button`) | identical visual |
| Badge | no | no | no | identical |
| Avatar | no | no | no | identical |
| Tooltip | no | no | no | identical |
| Toast | no | no | yes (`--motion-toast`) | identical visual, motion easing flips |
| BilingualTitle | no | no | no | identical |

#### 5.1 Performance note

Only two primitives subscribe to the injected mode. Provide/inject in Vue 3 is cheap — it doesn't create reactive boundaries beyond what the underlying ref already does. Adding the mechanism to surface-aware primitives adds well under 1KB of code and zero per-render cost when the route doesn't change.

#### 5.2 Testing the chrome

For unit/component tests (Vitest + @vue/test-utils), the inject default (`'study'`) makes Card and Modal render in study chrome with no setup. To test game chrome, wrap the mount in a `<Surface mode="game">`:

```ts
import { mount } from '@vue/test-utils'
import Card from '@/components/ui/Card.vue'
import Surface from '@/components/ui/Surface.vue'

it('renders game-chrome ornaments under Surface mode=game', () => {
  const wrapper = mount({
    components: { Surface, Card },
    template: '<Surface mode="game"><Card>x</Card></Surface>',
  })
  expect(wrapper.find('.card').attributes('data-surface')).toBe('game')
})
```

#### 5.3 Storybook (future)

Each story can declare its surface via a Storybook decorator that wraps the story in `<Surface>`. Default story = `study`; a `game` parameter variant shows the same component in the other chrome side-by-side. Out of scope for v2 spec, listed here so the implementation phase knows the affordance is intentional.
