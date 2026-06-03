# 문법Garden 🌱

Aplicación de gramática coreana contextual con SRS adaptativo. En proceso de rewrite de un prototipo PWA single-file (v2.22, `index.html` en raíz) a una app modular Nuxt 4 multi-idioma (`munbeop/`).

## Idiomas soportados (i18n día uno)

🇬🇧 English · 🇪🇸 Español · 🇫🇷 Français · 🇧🇷 Português (Brasil) · 🇹🇭 ไทย · 🇮🇩 Bahasa Indonesia · 🇻🇳 Tiếng Việt · 🇯🇵 日本語

## Estructura del repo

- `index.html` — legacy v2.22 (PWA single-file, live en https://jahnielkr.github.io/munbeop-garden/)
- `munbeop/` — **nueva app Nuxt 4 + TypeScript + Pinia + @nuxtjs/i18n** (en desarrollo)
- `AUDIT.md` — auditoría del legacy
- `docs/superpowers/plans/` — planes de implementación

## App nueva (Nuxt 4)

```bash
cd munbeop
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # Vitest, 64 tests
pnpm lint         # ESLint
pnpm build        # producción
```

Requisitos: Node 20+, pnpm 9+.

## Deploys vivos

- **Legacy v2.22** (GitHub Pages): https://jahnielkr.github.io/munbeop-garden/
- **v3 Nuxt 4** (Vercel): https://mungarden.vercel.app — backend Supabase live

## Estado del rewrite

✅ **Plan 1 (Foundation MVP + i18n) — completado:**

- Bootstrap Nuxt 4 + Vue 3.5 + TypeScript strict
- @nuxtjs/i18n 9.5 con 8 idiomas (UI + contenido de dominio)
- Algoritmo SRS portado del legacy con tests
- Stores Pinia (5: grammar, contexts, locale, srs, log) + storage abstraction
- Loop de práctica 3×3 funcional local en 8 idiomas
- UI primitivas pixel art + layout sidebar/navbar responsive
- LocaleSwitcher con persistencia

✅ **Plan 2 (Supabase + Auth + Cloud Sync) — completado:**

- 3 SQL migrations: schema (8 tablas) + RLS owner-only + seed catálogo
- `StorageAdapter` async + `SupabaseAdapter` drop-in (60+ tests con mocks)
- `pickAdapter` facade — auto-switch LocalStorage ↔ Supabase según auth
- Pinia `authStore` + `useAuth` composable con PKCE flow
- Sign-up / sign-in / magic-link / sign-out pages con i18n (8 idiomas)
- `migrateLocalToSupabase` — al primer login los datos anónimos suben a la cuenta del usuario
- `AccountWidget` en sidebar (signed-in con email / anonymous con CTA)
- Auto re-hydrate de stores en `SIGNED_OUT` (sin esto, las oraciones quedaban visibles al cerrar sesión)
- Multi-device sync verificado en producción

✅ **Plan 3 (Design System v2 — LADX cream palette) — completado:**

- Spec modular en 5 docs (`docs/superpowers/specs/2026-06-03-design-system-v2/`) + implementation plan
- Paleta Link's Awakening DX como default (paper `#f8efd0`, ink `#1a1a1a`, jade-deep `#185f24`, gold `#f5c533`) — reemplaza la dark `#1a1f1a` v1
- "Hyrule at night" dark theme via `[data-theme="dark"]` con toggle en Settings + FOUC mitigation inline script + persistencia localStorage
- Token layer modular en `tokens/` directory (9 archivos: colors-light/dark, typography, spacing, radius, shadow, motion, breakpoints) — reemplaza el `tokens.css` monolítico
- `--shadow-color` semantic alias theme-aware (light: warm brown, dark: near-black) para mantener chunky-pixel silhouette en ambos temas
- Familia tipográfica `Silkscreen` añadida para narrative display
- 9 iconos pixel-art SVG inline (Icon + MasteryIcon) reemplazan emoji en sidebar nav + mastery badges
- Game chrome activado en `/` y `/practice` via `definePageMeta({ surface: 'game' })` + `AppShell` provide/inject — Cards stampan `data-surface` y renderizan 4 corner ornaments jade-deep
- Toggle primitive (square switch pixel-art, no pill) + `useTheme` composable
- Placeholder mascota (32×48 sprite, paleta-compliant) en home page + CompletionBanner peek — identidad final OPEN para sesión creativa futura
- Renames: `PixelButton/Card/Input` → `Button/Card/Input` (prefix redundante), 5 deprecated aliases (`--muted`, `--indigo`, `--seedling`, `--plant`, `--tree`) eliminados

✅ **Plan 4 (봄이 — Bomi mascota) — completado:**

- Identidad y design spec creados por el usuario en sesión de brainstorming separada (`docs/superpowers/specs/2026-06-03-bomi-character-design.md`)
- Bomi: kawaii honeybee gardener (32×32 SVG, 6 sub-component groups — Antennae / Hat / Wings / Body / Abdomen / Eyes — split para animación independiente)
- 8 animation poses powered by `motion-v` (Vue port de motion.dev): idle (body float + wing flap + blink), happy, sad, thinking, cheer, fly-l/r, sleep (con "Z" floating overlay), play-hat
- Pinia state machine `useBomiStore` con `react/think/sleep/clearExplicit` actions; activePose computed deriva pose explícita O timeline de inactividad
- Inactivity timeline + 2 easter eggs: 25s → play-hat (hat tips/rocks), 60s → sleep (wings folded + Z particle). Cualquier mousemove/keydown la regresa a idle smoothly
- Idle pose canónica como "reset all properties" — `bee.rotate / wings.opacity / eyes.y / hat.{y,rotate}` vuelven a defaults al transicionar desde cualquier pose
- 9 nuevos palette tokens para honeybee (`--gold-shadow`, `--straw`, `--straw-shadow`, `--straw-texture`, `--wing`, `--wing-shadow`, `--ribbon-red`, `--ribbon-red-deep`, `--pink-bobble`)
- Bomi consumida en: home (3× scale, greeter), practice loop (3× scale, react a easy/hard submits), CompletionBanner (2× scale, cheer pose). Placeholder Mascota.vue retired.
- `pointer-events: none` + `user-select: none` + `cursor: default` — sprite decorativa no interceptable

🚧 **Próximos planes**: Landing page, screen redesigns (polish con v2 tokens), Bomi animation expansion (thinking trigger, fly-on-route, empty-state sleep, landing 8× hero), IA validadora (Edge Function OpenAI/Anthropic), Modo Mazmorra, Mapa Jardín, Cosméticos, Capacitor, Importer legacy v2→v3.

## Legacy (v2.22)

El single-file `index.html` sigue siendo la versión live en GitHub Pages. Detalles de su auditoría en `AUDIT.md`.
