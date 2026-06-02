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
pnpm test         # Vitest, 46 tests
pnpm lint         # ESLint
pnpm build        # producción
```

Requisitos: Node 20+, pnpm 9+.

## Estado del rewrite

✅ **Plan 1 (Foundation MVP + i18n) — completado:**

- Bootstrap Nuxt 4 + Vue 3.5 + TypeScript strict
- @nuxtjs/i18n 9.5 con 8 idiomas (UI + contenido de dominio)
- Algoritmo SRS portado del legacy con **46 tests pasando**
- Stores Pinia (5: grammar, contexts, locale, srs, log) + storage abstraction
- Loop de práctica 3×3 funcional local en 8 idiomas
- UI primitivas pixel art + layout sidebar/navbar responsive
- LocaleSwitcher con persistencia (cookie + localStorage)

🚧 **Próximos planes**: Supabase + Auth, IA validadora, Modo Mazmorra, Mascota, Mapa Jardín, Cosméticos, Landing, Capacitor, Importer legacy v2→v3.

## Legacy (v2.22)

El single-file `index.html` sigue siendo la versión live en GitHub Pages. Detalles de su auditoría en `AUDIT.md`.
