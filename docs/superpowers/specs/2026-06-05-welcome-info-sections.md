# Welcome v8 — Info sections (Pricing, Features, Policies)

**Status:** approved, ready to implement
**Date:** 2026-06-05

## Motivation

Add three public info pages reachable from the welcome sidebar so anon
visitors can browse Plans & Pricing, Features, and Policies before
signing in. The camera-stage pan that already moves the viewer between
`/welcome` (panel 0) and any other route (panel 1) handles the
transition for free — no architecture changes needed.

User intent ("vamos a agregar la parte [Planes y Precios]
[Características] [Políticas] debajo del login dividido claro …
cuando se le de click a cada uno tenga el mismo efecto que cuando se
hace login o logout"): clicking each link pans the camera the same
way login does; the back button on each page pans back to `/welcome`
the same way logout does.

## Scope

In:

- Three new routes: `/pricing`, `/features`, `/policies`.
- Each page uses `definePageMeta({ layout: false, surface: 'welcome' })`
  — no AppShell. The camera pans because the route is no longer
  `/welcome`; the existing CameraStage handles this with zero edits.
- New component `WelcomeSectionShell.vue` — the shared chrome for
  the three pages (back button + title + body slot). Lives at
  `components/welcome/`.
- New component `WelcomeNavLinks.vue` — the three nav buttons that
  drop into the welcome sidebar slot, below `WelcomeAuthOptions`.
  Lives at `components/welcome/`.
- `WelcomePanel.vue` change: render `WelcomeNavLinks` inside the
  sidebar slot, sibling to `WelcomeAuthOptions`. Add a hairline
  divider between them.
- i18n keys for structural strings (button labels, page titles, back
  button) added to all 8 locales.
- Placeholder body content in each page — hardcoded English Lorem-
  shaped copy in the `.vue` files with a `TODO(v8.1)` comment.
  Explicitly NOT i18n-keyed yet, so we don't pollute locale files
  with throwaway text.

Out:

- Real pricing tiers / real feature descriptions / real legal
  policy text. All bodies are placeholder.
- CameraStage edits. The existing `currentPanel = 0 if /welcome else
  1` rule already covers the new routes.
- Middleware edits. `welcome-redirect.global.ts` doesn't touch
  `/pricing`, `/features`, or `/policies`; signed-in users hitting
  them get the same back-to-`/welcome` path that bounces through
  the welcome redirect back to `/`.

## File layout

```
app/
  components/welcome/
    WelcomeSectionShell.vue    NEW   ~80 LOC, just chrome
    WelcomeNavLinks.vue        NEW   ~60 LOC, just the three buttons
    WelcomePanel.vue           EDIT  add NavLinks below AuthOptions
  pages/
    pricing.vue                NEW   ~100 LOC, placeholder tier cards
    features.vue               NEW   ~80 LOC, placeholder feature blocks
    policies.vue               NEW   ~80 LOC, placeholder policy sections
i18n/locales/
  *.json                       EDIT  8 files, ~6 new keys each
```

Per the no-god-files rule (legacy v2.22 was 5505 LOC inline; rewrite
exists to escape that): every file above stays well under any
god-file threshold. The shell is shared so each page file is
content-only.

## Pan mechanics

Already handled by CameraStage:

- `/welcome` → currentPanel 0 → `translateX(0)`
- `/pricing`, `/features`, `/policies` → currentPanel 1 →
  `translateX(-100vw)`
- Transition: 700ms `cubic-bezier(0.65, 0, 0.35, 1)` (the camera
  curve that login/logout already uses)

The back button on each section page calls `router.push('/welcome')`,
which flips currentPanel back to 0 and pans the camera left — the
same behavior the in-app logout path uses.

## Sidebar interaction

`WelcomeNavLinks` cleans up the open sidebar before navigating, so
the user sees the sidebar's `subidaCompuerta` close animation play
first, then the camera pans. Pattern:

```ts
function go(path: string) {
  emit('navigate', path)  // parent closes sidebar
  // small delay so the close animation has visible runway
  setTimeout(() => router.push(path), 200)
}
```

WelcomePanel handles the `navigate` event by setting
`sidebarOpen = false` (which triggers subidaCompuerta), then the
router push fires after the delay. The pan + close compose cleanly
because the camera pan is on a fixed wrapper outside the sidebar
DOM.

## i18n keys

Added to all 8 locales (en, es, fr, id, ja, pt-BR, th, vi):

```
welcome.menu.section_info       "Info" / "Info" / etc.
welcome.menu.pricing            "Plans & Pricing" / "Planes y Precios"
welcome.menu.features           "Features" / "Características"
welcome.menu.policies           "Policies" / "Políticas"
welcome.menu.back               "← Back" / "← Volver"
pricing.title                   page title
features.title                  page title
policies.title                  page title
```

Body content is intentionally NOT keyed yet — it's placeholder
English text that will be replaced with real copy in a later pass.

## Commit plan

Small, verify-able steps:

1. `docs(welcome.v8): spec for info sections (pricing, features, policies)`
2. `feat(welcome.v8): WelcomeSectionShell + WelcomeNavLinks`
3. `feat(welcome.v8): pricing/features/policies pages with placeholder bodies`
4. `feat(welcome.v8): wire NavLinks into WelcomePanel + i18n in 8 locales`

Verify after each: `pnpm test` + browser smoke (welcome ↔ section
pan, sidebar close → camera pan, back button → camera pan back).

## Risks

- Camera pan + sidebar close compose: tested via setTimeout(200) so
  the user sees subidaCompuerta start before the camera fires. If
  this feels off, fold both into a single animation orchestrator.
- Signed-in users on `/pricing` then clicking back land on `/welcome`
  which the middleware redirects to `/`. That's fine but worth
  noting if anyone wonders why "back" from `/pricing` doesn't land
  them at `/welcome` when signed in.
- Placeholder English strings in `.vue` files will be visible to
  non-English users until the v8.1 copy pass. Acceptable trade-off
  per user's "placeholder mientras pero lo tendremos hecho y
  puesto."
