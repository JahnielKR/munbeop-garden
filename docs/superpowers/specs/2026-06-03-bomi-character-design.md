# 봄이 (Bomi) — Character Design

**Status:** approved, ready for implementation planning
**Author:** brainstorming session 2026-06-03
**Scope:** Practice+ pose set (7 poses) — Plan 4 of the rewrite roadmap

---

## 1. Concept

**봄이 (Bomi)** is the mascot of 문법Garden — a kawaii honeybee gardener who tends to the user's grammar plants. Her name means "spring + cute suffix" (봄 + -이), tying her to the seasonal metaphor at the heart of the SRS system: grammar items grow from seedling → plant → tree as the user practices.

Narrative function: Bomi **pollinates** the user's practice. Every correct answer is her doing her job. Every wrong answer is a flower she couldn't reach today. Every completed 3×3 block is honey for the hive. This frames daily study as caring for a living garden, with Bomi as the visible agent of growth.

### Where she lives in the app

| Location | Size | Role |
|---|---|---|
| Landing | 8× scale (256px) | Hero illustration, idle animation |
| Practice loop sidebar | 2–3× scale (64–96px) | Reactive companion — happy/sad/thinking |
| Garden Map page | 5× scale (160px) | Walking/flying between plants |
| Sleep state (no reviews) | 2× scale | Empty-state companion with Z animation |

The same 32×32 sprite is the source for all contexts — only the scale and active pose change.

---

## 2. Visual Specs

### 2.1 Sprite dimensions

- **Grid:** 32 × 32 pixels (sprite coordinates)
- **Aspect:** square (allows scaling without letterbox)
- **Output:** SVG with `viewBox="0 0 32 32"` and per-pixel `<rect>` elements
- **Rendering:** `shape-rendering="crispEdges"` on pixel-art layers, `shape-rendering="auto"` on the eyes (smooth highlights and lashes)

### 2.2 Anatomy

```
Row 0–4   antenas + bobbles rosas (kpk)
Row 5–11  sombrero crown + listón rojo
Row 12–14 sombrero brim (ala floppy)
Row 15    cast shadow under brim
Row 16–19 head + ojos
Row 20    buches + boquita pixel (smile arc)
Row 21    head bottom
Row 22–28 cuerpo dorado + 3 rayas negras + alas
Row 29–31 stinger
```

Wing pixels (chars `w`/`W`) live in their own `<g id="wings">` group for independent scale animation. Eye geometry lives in `<g id="eyes">`.

### 2.3 Palette (10 colors)

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1a1f1a` / `#2a1a0e` | Outlines, stripes, eye body, lash |
| `gold` | `#d4a04a` | Body main |
| `gold-shadow` | `#a06b2e` | Body shadow, cast shadow |
| `straw` | `#f0c84a` | Hat highlight |
| `straw-shadow` | `#c89030` | Hat shadow |
| `straw-texture` | `#a8741e` | Weave texture line |
| `wing` | `#ebe6d7` | Wing main |
| `wing-shadow` | `#a8b0a2` | Wing shadow |
| `ribbon-red` | `#c23e3e` / `#9d2e2e` | Hat ribbon, buches |
| `pink` | `#e58aa0` | Antenna bobbles |
| `white` | `#ffffff` | Eye sparkles |

Hat color is **non-negotiable straw**. Body color matches the existing `--gold` token.

### 2.4 Face

Hybrid pixel + smooth:

- **Eyes** — `<rect>` 2.9 × 3.8 sprite units, centered at `(11, 18)` and `(19, 18)`, filled `#1a1f1a`, `shape-rendering="crispEdges"`. Square ㅁ shape.
- **Sparkle grande** — 1.2 × 1.2 white `<rect>` at top-inner of each eye (offset `(-dir·0.25·eyeRX, -0.35·eyeRY)` from center).
- **Sparkle medio** — 0.7 × 0.7 white `<rect>` at bottom-outer (offset `(+dir·0.30·eyeRX, +0.30·eyeRY)`).
- **Pestaña (lash)** — smooth `<path>` starting at the **top-outer corner** of the square (`cx + dir·eyeRX, cy - eyeRY`), curving up-and-out via quadratic Bezier. Stroke `#1a1f1a`, width `0.22`, `linecap: round`, `fill: none`.
- **Buches** — pixel `#c23e3e`, 3 px each cheek on row 20 (cols 7–9 left, 22–24 right).
- **Boca** — pixel smile arc: `k.k` at row 20 cols 14/16, `k` at row 21 col 15.

---

## 3. Animation Architecture

### 3.1 Stack

- **Motion library:** `motion-v` for Vue (the Vue port of motion.dev).
- **Rendering:** SVG with grouped layers. Each group's `transform-box: view-box` + explicit `transform-origin` in sprite-unit pixel coordinates so transforms scale around the right point.
- **State machine:** Bomi's current pose is a Pinia store value (`useBomiStore().pose`). Vue re-evaluates `:animate` props when the pose changes; motion-v interpolates between current and target values.

### 3.2 Anchor points (`transform-origin`)

| Group | Origin (sprite units) | Why |
|---|---|---|
| `#bee` | not needed (translation only) | Float bobs the whole sprite |
| `#wings` | `16px 24px` | Body center on wing-attachment row — flap scales toward attachment, not (0,0) |
| `#eyes` | `15px 18px` | Eye-line center — blink scales toward the horizontal line, eyes don't fly away |

### 3.3 Pose 1 — Idle (default)

The baseline pose. Plays continuously when Bomi has no specific reaction state.

```ts
// #bee — body float
{ animate: { y: [0, -0.5, 0] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }

// #wings — fast flap
{ animate: { scaleX: [1, 0.45, 1] },
  transition: { duration: 0.18, repeat: Infinity, ease: 'easeInOut' } }

// #eyes — occasional blink
{ animate: { scaleY: [1, 0.05, 1] },
  transition: { duration: 0.15, repeat: Infinity, repeatDelay: 3.3, ease: 'easeInOut' } }
```

Validated in `motion-prototype-v4.html`. Wings flap at ~5.5 Hz (real bee wings flap ~200 Hz — we stylize down so each beat reads). Blink fires every ~3.5 s.

### 3.4 Pose 2 — Happy (correct answer)

Trigger: user submits a correct answer in the practice loop.

```ts
// One-shot, then returns to idle
animate('#bee', { y: [-0.5, -2, -0.5] }, { duration: 0.4, ease: 'easeOut' })
animate('#eyes', { scaleY: 0.3 }, { duration: 0.2 })  // squint ^^
// Sparkle overlay: 3 small white circles fade in/out near the head
```

Visual: small upward jump, eyes squint to ^^ smile, brief sparkle. Total duration ~600 ms, then back to idle.

### 3.5 Pose 3 — Sad (wrong answer)

```ts
animate('#bee', { y: [-0.5, 1] }, { duration: 0.3, ease: 'easeIn' })  // sag down
animate('#eyes', { scaleY: 0.55 }, { duration: 0.2 })  // droopy lids
animate('#wings', { scaleX: [1, 0.7, 1] }, { duration: 0.4, repeat: 1 })  // slow defeated flap
// Hold for ~500 ms, then return to idle
```

Visual: drops slightly, eyes half-close in dismay, wings briefly slow. Reads as "ohh".

### 3.6 Pose 4 — Thinking (waiting on user input)

Trigger: input field focused but empty for > 3 s.

```ts
// Subtle head tilt (rotate the whole #bee a few degrees)
animate('#bee', { rotate: [0, -3, 3, 0] }, { duration: 2, repeat: Infinity, ease: 'easeInOut' })
// Eyes look to one side via transform-origin shift on the highlights
```

Visual: gentle side-to-side head tilt, sparkles drift slightly within the eye.

### 3.7 Pose 5 — Cheer (3×3 block complete)

Trigger: completing a 3-sentence practice block correctly.

```ts
animate('#bee', { y: [-0.5, -3, -0.5], rotate: [0, 8, -8, 0] },
  { duration: 0.8, ease: 'easeOut' })
animate('#wings', { scaleX: [1, 0.3, 1] }, { duration: 0.1, repeat: 6 })  // rapid flap
// Sparkle particles: 5–8 white dots radiate outward
```

Visual: larger jump, rotation wobble, very fast wing flap, particle burst. Total ~1 s.

### 3.8 Pose 6 — Fly L / R (page transitions)

Trigger: route change between landing → practice, practice → garden, etc.

```ts
// Fly across the screen
animate('#bee', { x: [startX, endX], rotate: [0, -10, 0] }, { duration: 0.6 })
// Wings flap faster during flight
animate('#wings', { scaleX: [1, 0.3, 1] }, { duration: 0.1, repeat: Infinity })
```

The L/R variant is just a sign flip on `rotate` and `x`. Reused for both directions.

### 3.9 Pose 7 — Sleep (empty state)

Trigger: no SRS reviews due, app shows empty-state on practice page.

```ts
animate('#bee', { y: [0, 0.3, 0] }, { duration: 4, repeat: Infinity, ease: 'easeInOut' })  // slow breath
animate('#wings', { opacity: 0, scaleX: 0.6 }, { duration: 0.5 })  // wings folded/hidden
animate('#eyes', { scaleY: 0.05 }, { duration: 0.5 })  // closed
// Z overlay element: floats up + fades, repeats every 2 s
```

Visual: wings folded, eyes closed, slow breathing motion, "Z" particle floating up. Cozy "she's resting because you're caught up" state.

---

## 4. Component Architecture (Vue/Nuxt)

### 4.1 File layout

```
munbeop/app/components/bomi/
├── Bomi.vue              # Main component — wraps the SVG, accepts pose prop
├── BomiBody.vue          # Pixel body + hat (static)
├── BomiWings.vue         # <motion.g id="wings"> with flap animation
├── BomiEyes.vue          # <motion.g id="eyes"> with blink + expressions
└── poses.ts              # Pose definitions (idle, happy, sad, etc.) as objects
```

### 4.2 Public API

```vue
<!-- Used in practice page: -->
<Bomi :pose="practiceStore.bomiPose" :scale="3" />

<!-- Used in landing: -->
<Bomi pose="idle" :scale="8" />
```

The `pose` prop maps to a key in `poses.ts`. Each pose entry contains the `animate` and `transition` objects for `#bee`, `#wings`, `#eyes`. The component reactively passes these to motion-v.

### 4.3 Store integration

A `useBomiStore` Pinia store holds the current pose and exposes helpers:

```ts
const bomi = useBomiStore()
bomi.react('happy')    // sets pose, auto-returns to 'idle' after duration
bomi.react('sad')
bomi.think()           // sets to 'thinking', stays until cleared
bomi.sleep()           // sets to 'sleep'
```

The practice page wires `react('happy')` / `react('sad')` into the SRS answer handler so Bomi responds to every answer.

---

## 5. Out of Scope

The following are explicitly **not** in Practice+ scope and are deferred:

- Garden Map walking/flying animations (waiting on Mapa Jardín plan)
- Watering / pollen sprinkle / honey jar animations (waiting on cosmetics plan)
- Day/night palette tinting based on local time (waiting on Personalización plan)
- Bomi reacting to streak milestones (waiting on Gamificación plan)
- Multi-character / friend Bomis (waiting on Social plan)

Practice+ is the minimum viable Bomi that delivers the emotional loop in the core practice page. Extras unlock as their respective plans land.

---

## 6. Acceptance Criteria

The implementation is complete when:

1. `Bomi.vue` renders the locked design at any scale ≥ 2× with crisp pixels and smooth lashes.
2. All 7 poses transition correctly when `:pose` changes — no jumps, no flying eyes, no broken transform-origins.
3. The practice page shows Bomi at 3× scale next to the input. She idles when waiting, switches to `happy`/`sad` on answer submission, returns to idle after 600 ms.
4. The landing page shows Bomi at 8× scale in idle, with smooth float + flap + blink.
5. The empty state (no reviews due) shows the sleep pose.
6. 60 fps on mid-tier mobile (iPhone SE 2nd gen, Galaxy A50).
7. No layout shift when Bomi animates — sprite is `position: absolute` or grid-locked.
8. Cumulative tokens added < 12 (palette extension).
9. Lighthouse score unchanged on landing page.

---

## 7. References

- Brainstorm session prototypes: `.superpowers/brainstorm/921-*/content/` and `.superpowers/brainstorm/1028-*/content/`
- Final live prototype: `eyes-square-corners.html`
- Project palette tokens: `munbeop/app/assets/styles/tokens.css`
- Motion-V docs: https://motion.dev/docs/vue
- Existing pixel font: `'Press Start 2P'` already loaded
