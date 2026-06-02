# munbeop-garden-app

Nueva app **Nuxt 4** de Munbeop Garden. Reemplaza progresivamente el legacy `../index.html` v2.22.

## Stack

- Nuxt 4.4 + Vue 3.5 + TypeScript strict
- Pinia 3 (state) + composables (reactividad de dominio)
- **@nuxtjs/i18n 9.5 (vue-i18n 9) — 8 idiomas baked-in**
- Tailwind 3 + design tokens CSS para pixel art
- Vitest 3 + happy-dom + @vue/test-utils

## Idiomas

`en` · `es` · `fr` · `pt-BR` · `th` · `id` · `vi` · `ja`

Default: detección de browser, fallback a `en`. Cambio en caliente vía LocaleSwitcher (sidebar + settings). Persistencia en `localStorage` bajo `munbeop.v1.locale` (y cookie i18n).

## Arquitectura

```
app/                              # Nuxt 4 srcDir
├── app.vue                       # root
├── assets/styles/                # tokens.css, pixel.css, main.css
├── components/
│   ├── layout/{AppShell,AppSidebar,MobileNavbar,LocaleSwitcher}.vue
│   ├── practice/{GrammarCard,ContextDisplay,SentenceInput,...}.vue
│   └── ui/{PixelButton,PixelCard,PixelInput,Toast}.vue
├── composables/{usePractice,useLocalized,useToast}.ts
├── layouts/default.vue
├── lib/                          # pura lógica de dominio (sin Vue)
│   ├── domain/{i18n,grammar,context,mastery,log}.ts
│   ├── practice/session.ts
│   ├── srs/{thresholds,weight,pick,mastery}.ts
│   └── storage/{adapter,localStorage,keys}.ts
├── pages/{index,practice,library,stats,log,settings}.vue
├── plugins/i18n-persist.client.ts
├── seed/{grammars,contexts}.ts
└── stores/{grammar,contexts,locale,srs,log}.ts   # Pinia
i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json   # @nuxtjs/i18n loaded from rootDir
tests/unit/{srs,storage,practice,domain}/*.test.ts  # Vitest
```

**Reglas:**
- ≤200 LOC por componente Vue, ≤150 por `app/lib/`
- Ningún string visible hardcoded — `$t()` siempre
- Contenido de dominio (meaning/trans/scene): `LocalizedString` + `useLocalized().tl()`
- Coreano (`ko`, `name`, `example`) NO se traduce — es contenido didáctico

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Dev server HMR (http://localhost:3000) |
| `pnpm test` | Vitest una vez (46 tests) |
| `pnpm test:watch` | Vitest watch |
| `pnpm test:ui` | Vitest UI interactivo |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | nuxt typecheck (vue-tsc) |
| `pnpm build` | Producción |
| `pnpm preview` | Sirve build |

## Calidad de traducciones

UI y contenido seed traducidos a 8 idiomas. Las traducciones a `th/id/vi` son best-effort de IA — backlog para revisión por hablante nativo antes de producción.
