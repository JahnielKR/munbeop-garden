# 문법 Garden 🌱

> Práctica de gramática coreana **contextual** con SRS adaptativo, envuelta en un jardín pixel-art que crece a medida que aprendes.

[![Producción (Vercel)](https://img.shields.io/badge/app-mungarden.vercel.app-185f24)](https://mungarden.vercel.app)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-f5c533)](./LICENSE)
[![Locales](https://img.shields.io/badge/i18n-8%20idiomas-185f24)](#-internacionalizaci%C3%B3n)
[![TOPIK](https://img.shields.io/badge/cobertura-TOPIK%201–6-185f24)](#-cobertura-topik)

**Munbeop Garden** no es una app de flashcards más. La idea central es que aprendes una estructura gramatical **produciéndola en contexto**: por cada punto de gramática escribes frases reales en distintos escenarios (informal, formal, honorífico, email, KakaoTalk, con amigos…), y un sistema de repetición espaciada (SRS) decide qué practicar y cuándo. Tu progreso se traduce en un jardín que florece, con árboles por nivel TOPIK, una abeja jardinera (봄이/Bomi) que reacciona a tu práctica, salas de escape narrativas y una colección de avatares y trofeos.

---

## 🌐 Deploys vivos

| Versión | URL | Hosting |
|---|---|---|
| **v3 — Nuxt 4** (actual) | https://mungarden.vercel.app | Vercel + backend Supabase |
| Legacy v2.22 (PWA single-file) | https://jahnielkr.github.io/munbeop-garden/ | GitHub Pages |

---

## ✨ Características

### 🎴 Loop central — Ruleta + SRS contextual
- **Ruleta de mazos** (`/practice/ruleta`): eliges un mazo TOPIK (o "todos los niveles"), se reparten 3 cartas de gramática y produces frases en tus contextos activos — el loop 3×3.
- **SRS adaptativo**: cada gramática tiene un estado de maestría (brote → planta → árbol) calculado desde tu historial; las que tocan repasar aparecen con más probabilidad.
- **Contextos**: practicas la misma gramática en varios registros/escenarios. Vienen de fábrica (formalidad y situacionales) y puedes **añadir los tuyos**.
- **Rondas enfocadas**: desde la biblioteca, "practicar esto ahora" abre una sesión sobre una sola gramática.
- **Mazos personalizados**: arma colecciones a mano mezclando cualquier nivel.

### 🧪 Laboratorios de práctica
Drills especializados, cada uno con su propio sistema de maestría que desbloquea avatares:

| Lab | Ruta | Qué entrena |
|---|---|---|
| **조사 연구소** Partículas | `/practice/particles` | 은/는 vs 이/가, espaciado (띄어쓰기), modo exploración |
| **활용 연습** Conjugación | `/practice/conjugation` | Conjugación regular e irregular (motor coreano propio) |
| **수 분류사** Contadores | `/practice/counters` | Clasificadores numéricos por categoría |
| **숫자 시장** Mercado de números | `/practice/number-market` | Lectura de números — modos **Aprender / Velocidad / Dictado** |
| **Cloze** | `/practice/cloze` | Rellenar el hueco gramatical en frases completas |
| **높임법 연구소** Registro/honoríficos | `/practice/register` | Nivel de habla y vocabulario honorífico |
| **배치 테스트** Placement | `/practice/placement` | Test diagnóstico tipo escalera → estima tu nivel TOPIK |
| **다시 돌보기** Rescate | `/practice/rescue` | Drill guiado para las gramáticas problemáticas ("leeches") |
| **진도** Caminos | `/paths` | Vista de progresión por nivel TOPIK |

### 📚 Biblioteca y ficha de estudio
- Catálogo completo TOPIK 1–6 (~300 gramáticas) con **búsqueda** y **filtros** (nivel, categoría, estado de maestría) y conteos por filtro.
- **Ficha de estudio** por gramática: significado localizado, ejemplos etiquetados por registro, **notas de uso**, **guía de pronunciación con audio (TTS)**, breadcrumb del currículo, y logros/historial.
- Banner de "puntos débiles" que enlaza al rescate.

### 🌳 Jardín + mascota Bomi
- El home (`/`) es un jardín pixel-art: un árbol por nivel TOPIK que crece por zonas según tu maestría, con clima estacional.
- **봄이 (Bomi)**, abeja jardinera animada con `motion-v`: 9 poses, reacciona a tus aciertos/fallos y tiene una línea de inactividad (juega con su sombrero, se duerme…).
- Anillo de meta diaria, nudge de "listo para repasar", y onboarding de primera frase para cuentas nuevas.

### 🔓 Escape room narrativo
- Salas de escape con historia, arte y audio. **3 niveles jugables** (El café, La excursión escolar, La comida callejera) y **7 en "coming soon"** con teaser.
- Hotspots interactivos, sistema de slots para responder, pantallas de victoria y **recompensas cosméticas** (común/raro/épico/legendario).

### 🏆 Avatares y trofeos
- **36 avatares de jardín** en 4 tiers, desbloqueables por progreso (árboles plantados, % dominado, rachas, labs completados, niveles TOPIK…). El legendario lleva marco + aura.
- **Vitrina de trofeos** (`/trophies`) con los cosméticos del escape room, equipables y reflejados en tu retrato.

### 📊 Estadísticas
- `/stats`: frases totales, racha actual/máxima, dominadas, repasos pendientes.
- **Mapa de calor de actividad** estilo GitHub (52 semanas), barras de maestría por nivel TOPIK, ritmo semanal y logros derivados.

### ⚙️ Ajustes
- **Apariencia**: idioma (8 locales) + tema claro/oscuro/sistema.
- **Aprendizaje**: meta diaria, recordatorios de repaso, gestor de contextos y de gramáticas personalizadas, focus de mazos.
- **Cuenta**: avatar, cambio de contraseña, eliminar cuenta (irreversible).
- **Datos**: exportar/importar tu progreso como JSON.

### 🔐 Cuentas y sincronización (Supabase)
- Cuentas obligatorias con email/contraseña, magic-link y flujo PKCE; recuperación de contraseña.
- **Sync multi-dispositivo**: tu progreso (SRS, log, contextos, ajustes, escape room…) vive en Supabase con **RLS por usuario** (cada quien solo ve sus datos).
- Capa de almacenamiento con adaptadores (Supabase ↔ localStorage de respaldo) tras una interfaz única.
- Borrado de cuenta vía Edge Function que verifica el JWT del propio usuario.

### 🌍 Internacionalización
8 locales de UI desde el día uno (el coreano es el idioma que se *aprende*, así que la interfaz va en la lengua del usuario):

🇬🇧 English · 🇪🇸 Español · 🇫🇷 Français · 🇧🇷 Português (Brasil) · 🇹🇭 ไทย · 🇮🇩 Bahasa Indonesia · 🇻🇳 Tiếng Việt · 🇯🇵 日本語

Carga perezosa por locale (`lazy: true`), estrategia `no_prefix`, fallback a inglés.

### 📱 PWA
Iconos, splash screens por dispositivo, manifest y service worker (la v2.22 legacy es instalable como PWA single-file).

---

## 🎓 Cobertura TOPIK
Currículo completo **TOPIK 1–6** (no solo lo básico): ~300 gramáticas organizadas por nivel y tema (formalidad, situacional, categorías semánticas) más secciones transversales (auxiliares, estilo indirecto, gramática complementaria).

---

## 📈 Estado del proyecto

Desarrollo **activo** y desplegado en producción. Es un proyecto personal (gramática coreana para uso propio y de mi esposa), construido con un flujo PR-por-feature.

- ✅ **116+ PRs mergeados** a `main`, cada uno con su gate verde.
- ✅ **CI** en GitHub Actions (`.github/workflows/ci.yml`): lint + typecheck + ~295 archivos de test (Vitest) en cada push/PR.
- ✅ **Auto-deploy a Vercel** desde `main` (+ backend Supabase live, `ap-northeast-2`).
- ✅ **Rewrite v2→v3 completo**: el prototipo legacy (`index.html`, single-file de ~5.5k LOC) está reescrito como app Nuxt 4 modular en `munbeop/`.
- ✅ Núcleo cerrado: loop de práctica, SRS, biblioteca con ficha completa (ejemplos + pronunciación + notas + audio), jardín + Bomi, escape room (3 niveles), avatares, stats con heatmap, ajustes, auth + sync.

**Auditorías:** el repo mantiene un historial de auditorías técnicas (`AUDITORIA.md` + archivos fechados). La última (2026-06-28) no encontró hallazgos críticos; seguridad verificada en vivo (12/12 tablas con RLS).

**Próximamente (roadmap):**
- 💳 **Monetización** — división free / premium (la página de precios actual es un placeholder hasta definir el modelo y el cobro, p. ej. Toss/KakaoPay).
- 🔓 Escape room niveles 4–10.
- 🌐 Copy localizado de las páginas públicas (precios/features/políticas).
- 📈 Captura de errores (respetando "sin trackers de terceros").

---

## 🗂️ Estructura del repo

```
.
├── index.html            # Legacy v2.22 — PWA single-file (GitHub Pages)
├── munbeop/              # ★ App nueva: Nuxt 4 + TypeScript + Pinia + i18n (Vercel)
│   ├── app/
│   │   ├── pages/        # 25 rutas (jardín, práctica, biblioteca, escape-room, stats, settings…)
│   │   ├── components/   # 200+ componentes pixel-art
│   │   ├── composables/  # 50 composables (orquestación read/write)
│   │   ├── stores/       # 12 stores Pinia (setup syntax)
│   │   ├── lib/          # Lógica pura por dominio (srs, garden, korean, avatars, stats…)
│   │   ├── seed/         # Catálogo de gramática + ejemplos + pronunciación + notas
│   │   └── i18n/locales/ # 8 archivos de traducción
│   └── supabase/         # Migraciones SQL (RLS) + Edge Function delete-account
├── docs/                 # Specs y planes de implementación
├── AUDITORIA.md          # Auditoría técnica vigente (+ archivos fechados)
└── LICENSE               # MIT
```

---

## 🛠️ Stack técnico

- **Framework**: Nuxt 4 (SPA, `ssr: false`) · Vue 3.5 `<script setup>` · Vue Router 5
- **Lenguaje**: TypeScript 5.8 (estricto)
- **Estado**: Pinia 3 (setup stores)
- **Backend**: Supabase (Postgres + Auth + RLS + 1 Edge Function) vía `@supabase/supabase-js`
- **Estilos**: Tailwind 3 + tokens CSS (temas claro/oscuro)
- **i18n**: `@nuxtjs/i18n` 9 (8 locales, lazy)
- **Animación**: `motion-v` · `@vueuse/core`
- **Tests**: Vitest 3 + `@vue/test-utils` (~295 archivos) · ESLint 9 · Prettier 3
- **Gestor**: pnpm 9 · Node 20+ (CI: Node 24)

---

## 🚀 Desarrollo

La app vive en `munbeop/`:

```bash
cd munbeop
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # Vitest (~295 archivos)
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc
pnpm build        # build de producción
```

Requisitos: Node 20+, pnpm 9+. Para sync/auth necesitas las variables de entorno de Supabase (`NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY`, `NUXT_PUBLIC_APP_URL`); sin ellas la app cae al adaptador de localStorage.

---

## 📄 Licencia

[MIT](./LICENSE) © 2026 JahnielKR.

화이팅 🌱
