# Design System v2 — Overview

> **Status:** SCAFFOLDED (skeleton only — sections marked *pending* are filled when the user says "empieza")
> **Last updated:** 2026-06-03

## Purpose

Working source of truth for the v2 design system: visual tokens, primitives, dual-surface chrome, sprites and mascota. This file is the index — every detail lives in one of the four sibling files. No content from a sibling should be duplicated here; link to it instead.

## Sibling docs

- [01-tokens.md](01-tokens.md) — palette light + dark, type scale, spacing, radius, shadow, motion, breakpoints
- [02-primitives.md](02-primitives.md) — Button, Card, Input, Modal, Tabs, Badge, Tooltip, Avatar, Toggle, Toast (all states, one file per primitive)
- [03-chromes.md](03-chromes.md) — study chrome vs game chrome: token deltas, wrapper, per-route assignment, primitive consumption rule
- [04-sprites-mascota.md](04-sprites-mascota.md) — sprite grid, palette-compliance rule, mastery icons, mascota character + spritesheet, animation spec

## Agreed anchors (locked, no rework expected)

These were decided during the brainstorming pass on 2026-06-03. If a sibling doc proposes something that contradicts an anchor here, the anchor wins unless it is explicitly re-opened in this file first.

- **Mood ancla:** Link's Awakening DX (GBC). Cream parchment base, bright primaries, cozy adventure vibe. Not Stardew, not LTTP, not Minish Cap — they were considered and rejected for specific reasons (see brainstorming transcript).
- **Theme default:** light (cream base). Dark mode is opt-in toggle, NOT the default. The current `#1a1f1a` dark paper migrates out of `:root` and into `[data-theme="dark"]`.
- **Chrome philosophy:** modal por superficie. Study surfaces (`/library`, `/log`, `/stats`, `/settings`, `/auth/*`) use minimal chrome — clean for reading and entering long-form text. Game surfaces (`/practice`, future `/dungeon`, future `/garden`, future `/mascota`) use full HUD Zelda chrome — dialog box framing, corner ornaments, mascota peek, step-based motion. Same tokens underneath, different decoration tier.
- **Modularity rule:** no god files. Each component is one `.vue` file with one responsibility. Each topical concern is its own doc / module. This rule is preemptive (designed in), not reactive (refactored later).
- **Type pairing locked:** Press Start 2P (pixel labels), Inter (UI/body), Noto Sans KR (Korean text), and a 4th display family **Silkscreen** added in [01-tokens.md](01-tokens.md) §3.1 for narrative headers (20-48px range, where Press Start 2P becomes consolised and limits character set). The three v1 families are non-negotiable; Silkscreen is the picked display add. Korean pixel font (Galmuri / Neo둥근모) explicitly deferred.

## Out of scope (each is its own follow-on spec)

- Landing page redesign
- Redesigns of existing study screens (library, log, stats, settings, auth)
- Mazmorra mode
- Garden map (Stardew-style overworld)
- Cosmetics inventory
- AI validator (Edge Function)
- Legacy v2 → v3 importer
- Capacitor mobile build

Items above will consume tokens/primitives/chromes/sprites from this spec but are designed and built in their own cycle.

## Goals

1. **Replace the v1 dark-default palette** with a Link's Awakening DX cream-default palette plus an opt-in "Hyrule at night" dark theme. The legacy dark paper (`#1a1f1a`) migrates from `:root` into `[data-theme="dark"]`; light cream (`#f8efd0`) becomes the default surface across the app.
2. **Establish the chrome split** (study vs game) as a first-class architectural concept — same tokens and same primitives in both modes, with a narrow set of decorative deltas (corner ornaments, motion easing) driven by route meta + provide/inject. Documented in [03-chromes.md](03-chromes.md).
3. **Bring all 12 primitives to v2 quality**: polish the 4 that exist (Button, Card, Input, Toast — drop the redundant `Pixel` prefix), add 8 new ones (Field, Modal, Tabs, Badge, Avatar, Tooltip, Toggle, BilingualTitle). All states (rest, hover, focus-visible, active, disabled) specced per primitive. Documented in [02-primitives.md](02-primitives.md).
4. **Set up the sprite system** — 32×32 grid, palette-compliance rule, animation framework, placeholder mascota — so chrome ornaments and mastery icons can ship without waiting for the mascota's identity to be finalised. Documented in [04-sprites-mascota.md](04-sprites-mascota.md).
5. **Keep everything modular**. Split `tokens.css` into `tokens/*.css`, one `.vue` per primitive, one spec doc per concern. The no-god-files rule lives in the file layout, not just policy.
6. **Maintain WCAG-AA accessibility** across both themes and both chromes: documented contrast ratios for every text/background combination, `:focus-visible` always rendered, `prefers-reduced-motion` respected as a hard rule (no exceptions).

## Non-goals (inside the design system)

1. **Designing screens.** Landing page, mazmorra mode, garden map, mascota interactive page, cosmetics inventory — each is its own design effort that *consumes* this system. The existing study screens (`/library`, `/log`, `/stats`, `/settings`) get a "polish with v2 tokens" pass in a separate spec, not a redesign in this one.
2. **Picking the mascota's identity.** Name, species, look, voice — flagged in [04-sprites-mascota.md](04-sprites-mascota.md) §4.2 as a separate brainstorming session. v2 ships with a placeholder.
3. **Adding a Korean pixel font.** Galmuri / Neo둥근모 deferred to a follow-up iteration; Noto Sans KR remains the locked Korean font for v2.
4. **Implementing AI validator, sync logic, Capacitor mobile build, legacy importer.** Engineering specs that don't share territory with this design system.
5. **Building Storybook.** Likely future enhancement (referenced in [03-chromes.md](03-chromes.md) §5.3), not part of v2 delivery.
6. **Performance budgets.** Sprite total weight, font subsetting, CSS bundle size — addressed during implementation, not designed here.

## Implementation phasing

The design lands in 8 phases. Each phase is a candidate for its own implementation plan (no-god-files applied to plans too). Sequential because each builds on the previous, though 2-8 are reorderable after 1 if a feature pulls a primitive forward.

| Phase | What lands | Visible to user? |
|---|---|---|
| **1. Token migration** | Split `tokens.css` into `tokens/`; light + dark palette, type scale, spacing/radius/shadow/motion/breakpoints | **Visible** — whole app shifts from dark default to cream default |
| **2. Primitive polish + renames** | Button, Card, Input, Toast updated; `Pixel` prefix dropped; imports updated app-wide | Invisible (visual identical to phase 1) |
| **3. New primitives** | Field, Modal, Tabs, Badge, Avatar, Tooltip, Toggle, BilingualTitle added | Invisible until consumed |
| **4. Chrome mechanism** | `Surface`, route meta, provide/inject in `AppShell`, `data-surface` attrs on Card + Modal | Invisible until phase 5 |
| **5. Game chrome ornaments** | Corner-ornament sprites for Card and Modal on game-chrome routes | **First visible chrome change** |
| **6. Mastery icon sprites** | Hand-drawn 🌱🌿🌳 replacements (MVP placeholder OK) | Visible — emoji become pixel icons |
| **7. Mascota placeholder** | Placeholder mascota sprite ships; chrome peek slots populated | Visible — first character moments |
| **8. Dark theme toggle** | Settings toggle, persistence, FOUC mitigation script | Visible — dark mode becomes available |
