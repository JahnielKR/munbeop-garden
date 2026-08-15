# munbeop-garden-app

Aplicación actual de **Munbeop Garden** en Nuxt 4. Reemplazó al cliente legacy `../index.html` v2.22 y es la versión desplegada en [mungarden.vercel.app](https://mungarden.vercel.app).

## Producto

- Currículo de **301 gramáticas TOPIK 1–6** con SRS, ejemplos, notas de uso y pronunciación.
- The Deck/La Baraja, Sentence Garden, Cloze, partículas, conjugación, contadores, registro, mercado de números, placement y rescate.
- Jardín de progreso, Bomi, estadísticas, avatares y trofeos.
- **10 Escape Rooms**: 40 salas ilustradas, 59 slots, 295 candidatos y localización narrativa en 8 idiomas.
- Cuentas obligatorias y persistencia multi-dispositivo mediante Supabase Auth/Postgres con RLS por usuario.

## Stack

- Nuxt 4.4 + Vue 3.5 + TypeScript estricto
- Pinia 3 + composables de dominio
- `@nuxtjs/i18n` 9.5: `en`, `es`, `fr`, `pt-BR`, `th`, `id`, `vi`, `ja`
- Supabase (Auth, Postgres, RLS y Edge Function de borrado de cuenta)
- Tailwind 3 + design tokens CSS
- Vitest 3 + happy-dom + `@vue/test-utils`

## Arquitectura

```text
app/
├── components/        # UI, layout, jardín, biblioteca, juegos y Escape Room
├── composables/       # sesiones, audio, progreso y persistencia
├── layouts/           # shell autenticado y data gate
├── lib/               # lógica pura: dominio, coreano, SRS, storage, stats…
├── middleware/        # gates de autenticación y transiciones
├── pages/             # producto, auth y páginas públicas
├── plugins/           # Supabase y captura first-party de errores
├── seed/              # gramática, ejemplos, notas y contenido de juegos
└── stores/            # Pinia
i18n/locales/          # 8 diccionarios de interfaz
public/                # ilustraciones, audio y assets estáticos
supabase/              # 11 migraciones SQL + Edge Function
tests/                 # 350 archivos / 7.754 tests en el release 2026-08-15
tools/ + scripts/      # auditores, generación y QA de navegador
```

## Reglas de contenido

- El texto de interfaz usa i18n; el contenido localizado usa `LocalizedString` + `useLocalized().tl()`.
- El coreano didáctico (`ko`, ejemplos y respuestas) no se traduce.
- Las ocho traducciones mantienen paridad estructural automatizada; la naturalidad lingüística requiere revisión nativa continua.
- La persistencia es por cuenta. El estado transitorio sin sesión usa un adaptador `noop`, no almacenamiento global que pueda filtrarse entre usuarios.

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor HMR (`http://localhost:3000`) |
| `pnpm test` | Suite Vitest completa |
| `pnpm test:watch` | Vitest en watch |
| `pnpm test:ui` | UI interactiva de Vitest |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | `nuxt typecheck` |
| `pnpm build` | Build de producción |
| `pnpm preview` | Sirve el build local |
| `pnpm escape:i18n:extract` | Extrae el inventario traducible de Escape Room |
| `pnpm escape:i18n:audit` | Audita cobertura y estructura de los 8 idiomas |
| `pnpm escape:verify [origin]` | Recorre los 10 niveles en Chrome, local o deployment |
| `pnpm gap` | Comprueba la cobertura TOPIK contra el catálogo canónico |

## Calidad del release

El release 2026-08-15 pasó lint, typecheck, build, **350 archivos / 7.754 tests**, auditoría de traducciones y QA Chrome de 10 portadas, 40 salas, 10 finales, 8 idiomas y vistas móviles. El mismo recorrido también pasó contra producción sin errores de consola.
