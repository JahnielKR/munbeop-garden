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

🚧 **Próximos planes**: IA validadora (Edge Function OpenAI/Anthropic), Modo Mazmorra, Mascota, Mapa Jardín, Cosméticos, Landing, Capacitor, Importer legacy v2→v3.

## Legacy (v2.22)

El single-file `index.html` sigue siendo la versión live en GitHub Pages. Detalles de su auditoría en `AUDIT.md`.
