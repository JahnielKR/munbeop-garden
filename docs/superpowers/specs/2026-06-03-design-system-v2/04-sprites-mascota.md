# Design System v2 — Sprites & Mascota

> **Status:** SCAFFOLDED (skeleton only — content pending "empieza")
> **Parent:** [00-overview.md](00-overview.md) · **Consumes:** [01-tokens.md](01-tokens.md)

## Purpose

Spec the sprite system end-to-end: grid, scale, palette-compliance rule, animation. Spec the mascota (working name "Jardinera Sabia" per `AUDIT.md` section 8; final identity is an open decision in section 4 below) — character sheet, emotional states, where she appears, how she animates.

This is the only doc in the spec that requires illustration work. Token + primitive + chrome work can ship without sprites; sprites layer on top.

## Sections

### 1. Sprite grid

#### 1.1 Base cell

**32×32 pixels.** This is the canonical unit. Every sprite is sized in multiples of 32 along at least one axis. Why 32:

- GBC-era LADX sprites are 16×16 native; doubling to 32 prints at full retina/2x density without artefacts
- Modern OLED viewing distances need ~32 pixels in the silhouette to read clearly
- 32 divides cleanly by 2/4/8/16 — flexible downscaling for badges and icons

#### 1.2 Canonical sizes

| Sprite type | Pixel size | Notes |
|---|---|---|
| Mastery icon (single state) | 32×32 | Renders inline in cards at CSS 16px (2× downscale via `image-rendering: pixelated`). |
| Mastery growth sequence | 96×32 | 3 frames horizontally. |
| Mascota portrait (dialog peek) | 64×64 | Used by Modal in game chrome (peek slot top-right). |
| Mascota full body (overworld) | 32×48 | Used by future `/garden/map`. Taller than wide for human proportion. |
| Mascota emotion spritesheet | 1536×64 | 24 frames (6 emotions × 4 frames) laid horizontally. |
| Chrome corner ornament | 12×12 | Used by Card and Modal in game chrome. Four variants (tl, tr, bl, br). |
| Chrome divider line | 64×4 | Used under Modal title bar in game chrome. Tileable horizontally. |
| Achievement burst | 192×64 | 3 frames horizontally, 64×64 each. |
| Garden tile (future) | 32×32 | Spec'd in the garden-map design, not here. |

#### 1.3 Format and rendering rules

- **Format**: PNG with alpha channel. WebP allowed as `<picture>` source for size if it ever matters; PNG is the canonical asset.
- **Rendering**: `image-rendering: pixelated` (Chromium, Safari) plus `image-rendering: crisp-edges` (Firefox fallback) on every `<img>` and CSS `background-image` that consumes a sprite. Already declared globally via `.pixel-sprite` in [pixel.css](../../../munbeop/app/assets/styles/pixel.css).
- **Integer scale only**: sprites render at 1×, 2×, 3×, 4× of their native size via CSS `width`/`height` set in pixels. Never via `transform: scale(1.5)` — non-integer scales cause subpixel blur even with `image-rendering: pixelated`.

#### 1.4 Naming convention

Lowercase kebab-case, descriptive role:
```
mascota-emotions.png
mastery-seedling.png
chrome-corner-tl.png
```

No version suffixes (`-v2`). Replacing a sprite updates the same filename + bumps the cache via a content hash in the build.

### 2. Palette-compliance rule

Sprites can only use colors from the locked palette in [01-tokens.md](01-tokens.md) §1.1 (light theme brand swatches). No sprite-only colors. The rule is hard — if an illustrator wants a new color, that color is added to the design system FIRST (in `01-tokens.md`), then to the sprite. The reverse direction (adding colors via sprite work) is what causes systems to drift.

#### 2.1 The allowed palette for sprites

The 11 light-theme brand swatches plus the two invariants from §2.2 of tokens:

```
#f8efd0  --paper        cream highlight
#ffe19a  --paper-warm   warm fill
#ecd28a  --paper-deep   warm shadow
#1a1a1a  --ink          outline / deep shadow
#4a3a1f  --ink-soft     mid shadow / sepia detail
#3aa84a  --jade         leaf, green clothing
#185f24  --jade-deep    leaf shadow, tree trunk
#5fb8e8  --sky          water, sky, magic accent
#e83838  --red          rupee, danger marker, fruit
#9d2525  --red-deep     red shadow, dried leaf
#f5c533  --gold         coin, golden hour highlight, hair?
#d8b96a  --border       a mid-tone wood/dirt
```

Plus the dark-theme paper hexes (`#1a1612`, `#2a221a`, `#3a2e22`) which sprites use ONLY when depicting night scenes inside the sprite (e.g. a window showing night sky), never as a body fill.

#### 2.2 Skin tones (open)

The locked palette has no skin tone. When the mascota is finalised (§4), her skin tone gets added to the palette as a new brand swatch (e.g. `--skin-warm` `#f5c8a3`) — flowed back into `01-tokens.md`. Until then, the placeholder mascota in §4.6 avoids exposed skin (covered by a wide hat and overalls).

#### 2.3 Enforcement

- **Code review**: when a new sprite PR opens, reviewer opens the PNG in an editor and verifies the color picker hits one of the values above.
- **Optional tooling**: a Vitest test could load each PNG in `app/assets/sprites/` and assert every pixel matches an allowed hex. Out of scope for v2 spec; flagged as a follow-up enhancement once we have more than ~10 sprites and the manual check breaks down.

### 3. Mastery icons

Replaces the emoji 🌱 → 🌿 → 🌳 used in the legacy and current UI with hand-drawn sprites. Three required states + optional growth frames.

#### 3.1 The three states

| State | Sprite | Concept | Dominant colors |
|---|---|---|---|
| seedling | `mastery-seedling.png` (32×32) | Tiny sprout, two leaves, exposed root in soil | `--ink-soft` (soil), `--jade` (leaves) |
| plant | `mastery-plant.png` (32×32) | Bushy young plant with a tiny golden fruit | `--ink-soft` (stem outline), `--jade` (leaves), `--gold` (fruit) |
| tree | `mastery-tree.png` (32×32) | Stout pixel tree with full canopy and visible trunk | `--jade-deep` (trunk), `--jade` (canopy), `--paper-warm` (highlight on canopy) |

Each one consumed by:
- `Badge` in cards (rendered at 16×16, pixel-scaled)
- The garden map (rendered at 32×32 native)
- Achievement modals on mastery-up (rendered at 64×64 with the growth animation from §3.2)

#### 3.2 Growth animations (optional but recommended)

When the user crosses a mastery threshold (seedling → plant, or plant → tree), a 3-frame animation plays inside the achievement modal:

- `mastery-seed-to-plant.png` — 96×32 strip: frame 1 = seedling, frame 2 = mid-growth (taller stem, baby leaves), frame 3 = plant
- `mastery-plant-to-tree.png` — 96×32 strip: frame 1 = plant, frame 2 = sapling (trunk visible, smaller canopy), frame 3 = tree

Played at 4 fps with `steps(3, end)`. Lands on the destination state and stays there.

If illustrating these intermediate frames is too expensive for v2, the fallback is a hard cut from current state to next state — the modal still appears, but the icon snaps. Animations can land in a v2.1 patch without breaking the API.

#### 3.3 Migration from emoji

The current code uses emoji glyphs in:
- `app/components/practice/CompletionBanner.vue` (probably)
- Per-grammar card mastery indicator (probably in `GrammarCard.vue`)
- Stats page mastery breakdown

The migration replaces every emoji `🌱`/`🌿`/`🌳` with `<MasteryIcon level="seedling|plant|tree" />`, a tiny new component that wraps the right `<img>` with the right size. (Not a primitive in [02-primitives.md](02-primitives.md) — it's a domain component because it knows about mastery levels. Lives at `app/components/practice/MasteryIcon.vue`.)

### 4. Mascota — identity and character sheet

> **This section has open questions.** The structural decisions below (where she appears, what emotions she expresses, animation rules) are locked. The IDENTITY decisions (name, species, look, voice) are flagged as a separate brainstorming session — they require creative judgement I shouldn't make alone, and ideally an illustrator in the loop. A v2 implementation MVP ships with a **placeholder mascota** (§4.6) so the chrome and slots aren't blocked.

#### 4.1 What's locked

These hold regardless of who she ends up being.

- She exists. The product has a mascota; the design system reserves space for her.
- She uses 32×32 base sprites (full body) and 64×64 portrait, per §1.2.
- She follows the palette-compliance rule from §2.
- She expresses six emotions (§5).
- Her animation rules follow §6.

#### 4.2 What's open (resolve in a follow-up brainstorming session)

| Question | Options on the table | Default if we have to pick |
|---|---|---|
| Name | Keep "Jardinera Sabia" (legacy audit), rebrand, or use a Korean name (e.g. 정원 할머니, 가든 누나) | "Jardinera Sabia" until rebrand discussed |
| Species | Human / 도깨비 (Korean goblin spirit) / animal-companion (cat, tanuki) / vegetable-spirit | Human |
| Age / generation | Young (early 20s, peer) / Middle (30s-40s, mentor) / Elder (60s-70s, sage) | Elder (matches "sabia" / 할머니 lineage) |
| Silhouette | Tall and lanky / short and round / child-like | Short and round (Animal Crossing villager proportions read at 32×48) |
| Clothing palette | Within the locked palette — combinations of jade/paper/gold/red | Jade overalls, paper-deep apron, gold trim on hat |
| Voice | Text bubbles in dialog modals / silent (emotes only) / voice-acted clips | Text bubbles, no audio in v2 |
| Cultural specificity | Generic gardener / Korean-coded (hanbok elements) / fantasy-coded | Korean-coded but contemporary (not in hanbok — avoid stereotype) |

#### 4.3 Where she appears

These surfaces have slots reserved for her sprite. Empty slots show no peek until v2.x finalises the character — they don't break layout.

| Surface | Slot location | Sprite used |
|---|---|---|
| `/practice` | Top-right of `GrammarCard` after submit | Portrait 64×64 |
| `/practice` `CompletionBanner` | Inline with banner | Portrait 64×64 |
| Modal in game chrome | Top-right peek slot | Portrait 64×64 |
| Future `/dungeon` dialog | Lower-left of dialog box | Portrait 64×64 |
| Future `/garden/map` | Walking around her plot | Full body 32×48 (animated) |
| Future `/mascota` page | Centred hero | Full body, larger (96×144?) |
| `AccountWidget` in sidebar (optional) | NO — keep user avatar separate to avoid confusing user identity with mascota |

#### 4.4 Personality (3 adjectives — to be locked in §4.2's follow-up)

Working defaults: **patient · curious · encouraging**. These drive copy/voice for any text she "says" — toast messages on achievements, modal lines on mastery-up, dungeon hints. Locking these matters as much as locking her look.

#### 4.5 Cross-references

- Toast variants from [02-primitives.md](02-primitives.md) §11 may use mascota copy when the variant is `success` (e.g. "잘했어! Saved.")
- Modal in game chrome from [02-primitives.md](02-primitives.md) §6 reserves the top-right peek slot
- `/practice` chrome from [03-chromes.md](03-chromes.md) §4 is game-mode, so the peek can appear there

#### 4.6 Placeholder mascota for v2 MVP

Until §4.2 resolves, ship with:

- Silhouette: short and round, ~32×48 standing
- Wide-brim hat in `--jade` covering hair
- Overalls in `--paper-deep`
- Inner shirt in `--paper`
- Boots in `--ink-soft`
- Face: simple, eyes-closed-smile by default (avoids committing to ethnicity/age via facial features); the mouth changes per emotion (§5)
- Mid-tone shadow under the hat brim (using `--ink-soft`)

This placeholder unblocks chrome ornaments and peek slots without committing the brand to a final look. Final mascota PR replaces only the sprite files — no code changes.

### 5. Mascota — emotional spritesheet

Six emotions. Each is a 4-frame strip. Total spritesheet: 1536×64 (24 frames laid horizontally), or split into 6 files of 256×64 — implementer's choice (single file is preferred for HTTP economy).

#### 5.1 Roster

| Emotion | Frames | When triggered | Notes |
|---|---|---|---|
| `idle` | 4 (bob loop) | Default. Loops continuously. | 1-pixel vertical bob; blink every 3-5s as a separate overlay frame. |
| `happy` | 4 (one-shot) | Easy feedback on an answer; mastery-up | Plays once, returns to idle. Optional sparkle particles outside the sprite. |
| `thoughtful` | 4 (one-shot) | Hard feedback; user asks for hint | Finger to chin frame, eyes up-and-left. Plays once, returns to idle. |
| `proud` | 4 (one-shot) | Mastery threshold crossed | Arms raised. Plays once, holds last frame 2s, returns to idle. |
| `sad` | 4 (one-shot) | User absent ≥7 days (greeting on return) | Sitting, slumped, then perks up on last frame. Returns to idle. |
| `sleeping` | 4 (loop) | After-hours screen or extended idle | Closed eyes, gentle Z animation. Replaces idle on the relevant surfaces. |

#### 5.2 Spritesheet layout

Single PNG strip: `mascota-emotions.png` at 1536×64.

```
[idle 1][idle 2][idle 3][idle 4]
[happy 1][happy 2][happy 3][happy 4]
[thoughtful 1][...]
...
```

Wait — that's a 6-row grid, not a single horizontal strip. Reconsider: a 4×6 grid (256×384) is more compact for editing. But CSS sprites work easiest with a single-axis strip.

**Decision:** 1536×64 single horizontal strip. Easier to render with `background-position-x` only, no Y-axis math. The cost (wide strip) is fine — total file size is ~30KB.

If editor convenience matters more, an alternative layout (4×6 grid) ships as a separate `mascota-emotions-grid.png` that's only used in source/editor; the production asset is the strip.

#### 5.3 CSS sprite mapping

Each emotion gets a CSS class consuming the strip. The Vue component handles which class is active and which frame within.

```css
.mascota-sprite {
  width: 64px;
  height: 64px;
  background-image: url('/sprites/mascota/emotions.png');
  background-repeat: no-repeat;
  background-size: 1536px 64px;
  image-rendering: pixelated;
}
.mascota-sprite[data-emotion="idle"][data-frame="0"]      { background-position-x: 0; }
.mascota-sprite[data-emotion="idle"][data-frame="1"]      { background-position-x: -64px; }
.mascota-sprite[data-emotion="happy"][data-frame="0"]     { background-position-x: -256px; }
/* etc. */
```

A small JS controller in `app/components/mascota/Mascota.vue` advances `data-frame` at the right cadence per emotion. (`Mascota` is a domain component, not a primitive — lives outside `app/components/ui/`.)

### 6. Animation spec

#### 6.1 Frame rate

Pixel art animations look right at low fps. High fps feels uncanny — the motion smooths in a way that betrays the chunky pixels. Two cadences:

- **4 fps** (250ms per frame) — idle loops, mascota emotions, mastery growth
- **6 fps** (~167ms per frame) — achievement burst (slightly more energetic)

#### 6.2 Loop and trigger rules

| Animation | Type | Frames | Duration | Behaviour |
|---|---|---|---|---|
| Mascota idle bob | loop | 4 | 1000ms | Restarts seamlessly. Pauses when the mascota is off-screen (Intersection Observer). |
| Mascota blink | overlay | 2 | 200ms | Triggered every 3-5s while idle. Replaces eye pixels for 2 frames then returns. |
| Mascota happy | one-shot | 4 | 1000ms | Plays once, holds last frame 1.5s, returns to idle. |
| Mascota thoughtful | one-shot | 4 | 1000ms | Plays once, holds 2s, returns to idle. |
| Mascota proud | one-shot | 4 | 1000ms | Plays once, holds 2s, returns to idle. |
| Mascota sad | one-shot | 4 | 1500ms | Plays once, holds 3s, transitions to idle via a 2-frame in-between. |
| Mascota sleeping | loop | 4 | 2000ms | Slower loop than idle to read as "calm". |
| Mastery growth (seed→plant) | one-shot | 3 | 1500ms | Plays once, lands on destination state, does NOT return. |
| Mastery growth (plant→tree) | one-shot | 3 | 1500ms | Same as above. |
| Achievement burst | one-shot | 3 | 500ms | Decorative particle effect overlay. 6 fps. |

#### 6.3 `prefers-reduced-motion`

Hard rule from [01-tokens.md](01-tokens.md) §7.4. In sprite terms:

- **All loops stop** at their first frame. Idle bob freezes on frame 1. Sleeping freezes on frame 1.
- **All one-shots show only the resting state** — the last frame of the animation, not the transition. Happy shows the smile-frame, no build-up. Thoughtful shows the finger-to-chin frame, no head-tilt animation.
- **Mastery growth shows the destination state** (plant or tree) directly, no intermediate frames.
- **Achievement burst is suppressed entirely** — the achievement modal still opens, just without the particle overlay.

#### 6.4 Implementation choice

For v2 MVP: **CSS `@keyframes` with `steps(N, end)` timing** on a `background-position-x` animation. This works for the simple "advance through a horizontal strip" model and needs no JavaScript runtime for the loops.

```css
@keyframes mascota-idle-bob {
  from { background-position-x: 0; }
  to   { background-position-x: -256px; }   /* 4 frames × 64px */
}
.mascota-sprite[data-emotion="idle"] {
  animation: mascota-idle-bob 1000ms steps(4, end) infinite;
}
```

One-shots use `animation-iteration-count: 1` plus an `animationend` event handler in `Mascota.vue` to swap back to idle.

For more complex sequences later (e.g. mascota walking around the garden map), upgrade to a `<canvas>` + `requestAnimationFrame` renderer. Out of scope for v2 spec.
