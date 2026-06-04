# Welcome v5 — palette refresh + ambient scroll + pushable stage

**Status:** approved, ready to implement
**Author:** ai-pair (with user)
**Date:** 2026-06-04
**Branch base:** `main` (already fast-forwarded from `claude/funny-boyd-202998`)

## Motivation

Two things land in this pass:

1. The user supplied a new pixel-art palette (`segundo light and dark mode.md`)
   that replaces the v4 "Mondstadt forest dusk" palette. Light becomes a
   parchment + wood + sunflower scheme; dark becomes abyssal blue + pine +
   campfire. The whole product reads the new vibe via the existing
   semantic-token aliases.
2. The user also supplied a background-motion spec (`movimiento de fondos.md`)
   and asked that the day/night scene actually move. On top of that, the
   sidebar should push the moving stage left when ENTER is pressed and return
   it on close — the behavior v2.18 tried and then dropped because the chrome
   bounced. v5 moves *only the stage layer*, leaving the chrome (brand +
   pulse button) stationary, which sidesteps the cascade that caused the
   rebote.

Both are surface-level changes; the architecture is unchanged.

## Scope

In scope:

- `colors-light.css` / `colors-dark.css`: swap every brand swatch value to v5
  while keeping the variable names and the alias layer untouched.
- `WelcomeDayScene.vue` / `WelcomeNightScene.vue`: switch the bg `<img>` to a
  `<div>` with `background-image` + `background-repeat: repeat-x` and an
  ambient `scrollFondo` keyframe (60s linear infinite, 0 → -1000px).
- `useWelcomeMusic.ts`: change the `SRC` constant to `mungarden-pro.mp3`.
- `WelcomePanel.vue`: bind a `--stage-push` CSS variable to `sidebarOpen`
  (open → `-180px`, closed → `0px`).
- `WelcomeStage.vue`: read `--stage-push` and apply
  `transform: translateX(var(--stage-push, 0))` with the same
  `transition: transform 360ms cubic-bezier(0.1, 0.8, 0.3, 1)` curve the
  sidebar uses, so they move as one.
- Delete the obsolete `public/welcome/audio/welcome-loop.mp3`.

Out of scope:

- Changing the in-app surface (cards, sidebar, etc.) beyond what the token
  swap implicitly does.
- Adding any sidebar-driven motion to the brand mark, pulse button, or
  top-right toggles — those stay still by design.
- Touching `CameraStage` or the welcome ↔ app pan. Containing-block setup
  is unchanged.

## Palette v5 mapping

| Token            | Light (pergamino/madera/girasol) | Dark (abisal/pino/campamento) |
|------------------|----------------------------------|-------------------------------|
| `--paper`        | `#f4ecd8`                        | `#0c1220`                     |
| `--paper-warm`   | `#ded0b6`                        | `#0a1f1d`                     |
| `--paper-deep`   | `#faf6ee`                        | `#121b2d`                     |
| `--ink`          | `#2d1e18`                        | `#e2e8f0`                     |
| `--ink-soft`     | `#705335`                        | `#577570`                     |
| `--ink-line`     | `#8c6a4a`                        | `#3b5275`                     |
| `--gold` (CTA)   | `#e6a121` (sunflower)            | `#d95738` (campfire)          |
| `--jade`         | `#5e8f4a` (warm leaf)            | `#3ad29f` (firefly)           |
| `--sky` (link)   | `#b05c1e` (rust orange)          | `#3ad29f` (firefly)           |
| `--red`          | `#c23e3e` (Korean identity)      | `#ff4757`                     |
| `--shadow-cream` | `#2d1e18`                        | `#f1ece4`                     |
| `--hover-bg`     | `rgba(255, 196, 77, 0.25)`       | `rgba(255, 118, 84, 0.25)`    |

Every existing component reads through aliases (`--bg`, `--text`, `--accent`,
`--border`, `--surface`, etc.), so no `.vue` file needs editing for the color
swap.

## Pushable stage mechanics

Why v2.18 bounced: it shifted the *entire welcome chrome* via a class on a
wrapping element. The CameraStage applies `transform: translateZ(0)` to its
panels, which made each chrome element's `position: fixed` resolve to the
panel's bounds — and the panel's effective bounds shifted during the sidebar
transition, causing a measurable layout settle (the "rebote").

v5 avoids that path entirely:

- The CSS variable lives on `.welcome` (the WelcomePanel root), not on a
  wrapper. The variable is read by exactly one descendant: `.stage` inside
  WelcomeStage.
- Only `.stage` translates. Brand, pulse button, music toggle, theme toggle
  all stay still — they were already stationary in v2.20 and remain so.
- No Vue `<Transition>` is used. The transition is a plain CSS
  `transition: transform 360ms cubic-bezier(0.1, 0.8, 0.3, 1)` matching the
  sidebar's own slide curve so the two move as a single rigid pair.
- `prefers-reduced-motion: reduce` shortens the transition to 120ms linear
  (same treatment as the sidebar).

Push distance: `-180px`. The sidebar is `min(360px, 92vw)`. `-180px` is half
the desktop width, which gives a clear "pushed" feel without uncovering the
right edge of the scene. On phones the sidebar covers 92vw anyway so the
small push is invisible — that's fine.

## Ambient scrolling background

Both scenes share the same animation:

```css
@keyframes scrollFondo {
  from { background-position: 0 0; }
  to   { background-position: -1000px 0; }
}
```

Applied via `animation: scrollFondo 60s linear infinite` on a `.day__bg` /
`.night__bg` `<div>` with `background-repeat: repeat-x`,
`background-size: auto 100%`, `background-position: center bottom`.

The day scene's dodo sprite remains an `<img>` with its own bobbing
animation; only the background layer moves horizontally.

`prefers-reduced-motion: reduce` disables the scroll (and the dodo bob,
which is already handled).

## Music swap

`SRC` constant in `useWelcomeMusic.ts` flips from
`/welcome/audio/welcome-loop.mp3` to `/welcome/audio/mungarden-pro.mp3`.
`mungarden-pro.mp3` is already in `public/welcome/audio/` (1.9 MB).
`welcome-loop.mp3` is deleted to keep the public bundle clean — the loader
already fails silently on missing files, so any stale browser cache pointing
at the old name will just go quiet rather than 404 loudly.

## Commits

Plan (small, verifiable commits — verify→commit→verify→push):

1. `docs(welcome.v5): spec for palette v5 + ambient scroll + pushable stage`
2. `feat(welcome.v5): palette v5 — pergamino+girasol light, abisal+campamento dark`
3. `feat(welcome.v5): swap welcome music to mungarden-pro.mp3, drop old loop`
4. `feat(welcome.v5): ambient horizontal scroll on day and night backgrounds`
5. `feat(welcome.v5): push stage left when sidebar opens, return on close`

After each commit: `pnpm nuxi prepare` (or `pnpm typecheck`) inside `munbeop/`
catches type and import regressions before they pile up.

## Risks

- The v4 palette had reasoning ("Mondstadt forest dusk") that other docs
  reference. Those references stay accurate as descriptions of the previous
  state; new doc references should use "v5 — pergamino/abisal".
- Removing `welcome-loop.mp3` will 404 for any user with a stale build
  pointing at the old name; the in-code loader handles missing files
  silently, so the worst case is no music until refresh.
- The `--stage-push` value is in pixels, not viewport units. On very wide
  monitors this may feel undersized; ship as-is and iterate if needed.

## Out-of-spec items

If during implementation any of the following turns out to be needed, stop
and ask:

- Token contrast failing WCAG on a real surface (would force a
  not-from-spec hex tweak).
- Stage transform interacting badly with the CameraStage pan
  (welcome → app slide).
- Music file at the new path failing to load in dev (would need a different
  filename or path).
