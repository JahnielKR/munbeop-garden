# Munbeop Garden — Plan 1: Foundation MVP (i18n-enabled)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar una nueva app Nuxt 3 + TypeScript dentro de `munbeop/`, con **i18n para 8 idiomas (en, es, fr, pt-BR, th, id, vi, ja)** baked-in desde el día uno, el algoritmo SRS del legacy portado y testeado, primitivas UI pixel art, y el flujo de práctica 3×3 funcionando local (sin Supabase, sin IA, sin Mazmorra). El legacy `index.html` queda intacto.

**Architecture:** App Nuxt 3 SPA con TypeScript strict. Capas separadas: `lib/` (lógica pura sin Vue), `stores/` (Pinia), `composables/` (reactividad), `components/` (UI puro). Storage abstraído tras `StorageAdapter` para swap a Supabase en Plan 2. i18n vía `@nuxtjs/i18n` con archivos JSON por locale. Contenido de dominio (`meaning`, `trans`, `scene`) usa tipo `LocalizedString` (Record por locale).

**Tech Stack:** Nuxt 3.13+, Vue 3.5+, TypeScript 5.5+ strict, Pinia 2.2+, **@nuxtjs/i18n 8+ (vue-i18n 9)**, Tailwind 3.4+, Vitest 2+, @vue/test-utils 2.4+, ESLint 9 (flat config), Prettier 3, Press Start 2P (fuente pixel), pnpm 9+.

---

## i18n Architecture Decision

**8 locales:** `en` · `es` · `fr` · `pt-BR` · `th` · `id` · `vi` · `ja`

**Default behaviour:**
- Detección del browser en primer arranque
- Persistencia en `localStorage` bajo `munbeop.v1.locale`
- Fallback a `en` si no se detecta o el locale guardado es inválido

**Dos capas distintas:**

1. **UI strings** (botones, labels, navegación, descripciones): `$t('key.path')` con archivos `locales/<code>.json`. Cero strings hardcoded en componentes.

2. **Contenido de dominio** (`Grammar.meaning`, `Grammar.trans`, `Context.scene`): tipo `LocalizedString = Record<LocaleCode, string>`. Renderizado mediante helper `localized(value, locale)`. El **coreano se preserva tal cual** (`Grammar.ko`, `Context.name`, `Grammar.example`) — es contenido didáctico, no UI.

**LocaleSwitcher** visible en sidebar (desktop) y en página `/settings`. Cambio en caliente sin recarga.

**Calidad de traducciones:** las seeds incluyen las 8 traducciones (mi best-effort para `th/id/vi`). Marcadas para revisión por hablante nativo en backlog.

---

## Scope & Non-Goals

### In scope (Plan 1)
- Bootstrap Nuxt 3 + TS strict + Tailwind + Vitest + ESLint + Prettier
- **@nuxtjs/i18n con 8 locales** y archivos JSON completos
- **`LocalizedString` type + helper `localized()`**
- **LocaleSwitcher component** + persistencia
- Algoritmo SRS portado con cobertura de tests
- Tipos de dominio locale-aware
- Datos semilla **traducidos a los 8 idiomas**
- Interfaz `StorageAdapter` + `LocalStorageAdapter`
- Stores Pinia: grammar, contexts, srs, log
- Composable `usePractice` (loop 3×3)
- Design tokens pixel art (provisional)
- UI primitivas: PixelButton, PixelCard, PixelInput, Toast
- Layout sidebar + bottom-nav con navegación traducida
- Páginas `/practice` (funcional) y `/library` (read-only Herbolario)
- Placeholders traducidos de `/`, `/stats`, `/log`, `/settings`

### Out of scope (planes futuros)
Supabase/Auth, IA validadora, Mazmorra, Mascota, Mapa, Cosméticos, Landing, Capacitor, Importer legacy.

### Convenciones
- Código y comentarios técnicos: **inglés**
- Strings de UI: **siempre `$t()`** — ningún literal visible al usuario
- Strings de contenido (meaning, scene, trans): **siempre `LocalizedString`** + render con `localized()`
- Identificadores: camelCase TS, PascalCase componentes, kebab-case archivos
- Commits: Conventional Commits inglés
- ≤200 LOC por componente Vue, ≤150 por archivo `lib/`

---

## File Structure (locked-in)

```
munbeop-garden-main/
├── index.html                     # LEGACY v2.22 — INTACTO
├── README.md
├── AUDIT.md
├── docs/superpowers/plans/
└── munbeop/
    ├── .gitignore .prettierrc.json .nvmrc
    ├── eslint.config.mjs nuxt.config.ts package.json pnpm-lock.yaml
    ├── tailwind.config.ts tsconfig.json vitest.config.ts i18n.config.ts
    ├── app.vue
    ├── assets/styles/{tokens,pixel,main}.css
    ├── components/
    │   ├── layout/{AppSidebar,MobileNavbar,AppShell,LocaleSwitcher}.vue
    │   ├── practice/{GrammarCard,ContextDisplay,SentenceInput,FeedbackRow,
    │   │             ProgressDots,ErrorNoteBlock,CompletionBanner}.vue
    │   └── ui/{PixelButton,PixelCard,PixelInput,Toast}.vue
    ├── composables/{usePractice,useToast,useLocalized}.ts
    ├── layouts/default.vue
    ├── lib/
    │   ├── domain/{grammar,context,log,mastery,i18n,index}.ts
    │   ├── practice/{session,index}.ts
    │   ├── srs/{thresholds,mastery,weight,pick,index}.ts
    │   └── storage/{adapter,localStorage,keys,index}.ts
    ├── locales/{en,es,fr,pt-BR,th,id,vi,ja}.json
    ├── pages/{index,practice,library,stats,log,settings}.vue
    ├── plugins/i18n-persist.client.ts
    ├── public/favicon.ico
    ├── seed/{grammars,contexts}.ts
    ├── stores/{grammar,contexts,srs,log,locale}.ts
    └── tests/
        ├── setup.ts
        └── unit/{srs,storage,practice,domain}/*.test.ts
```

---

## Prerequisites

- Node 20 LTS (`node --version` → v20.x)
- pnpm 9 (`pnpm --version` → 9.x). Install: `npm install -g pnpm@9`
- Git

---

## Task 1: Git init + repo skeleton

**Files:** `.gitignore`, `munbeop/.gitignore`, `munbeop/.nvmrc`

- [ ] **Step 1: Init git**

```bash
git init
git config user.email "tu@email"
git config user.name "Tu Nombre"
```

- [ ] **Step 2: Replace root `.gitignore`**

```gitignore
node_modules/
.pnpm-store/
.output/
.nuxt/
.vercel/
dist/
.vscode/
.idea/
*.swp
.DS_Store
Thumbs.db
.env
.env.local
.env.*.local
coverage/
*.lcov
*.log
npm-debug.log*
pnpm-debug.log*
```

- [ ] **Step 3: Create `munbeop/.nvmrc`**

```
20
```

- [ ] **Step 4: Initial commit**

```bash
git add .gitignore AUDIT.md README.md docs/ munbeop/.nvmrc
git commit -m "chore: init repo with audit and plan, scaffold munbeop/ subfolder"
```

---

## Task 2: Scaffold Nuxt 3 + @nuxtjs/i18n

**Files:** `munbeop/package.json`, `munbeop/nuxt.config.ts`, `munbeop/app.vue`, `munbeop/tsconfig.json`, `munbeop/i18n.config.ts`

- [ ] **Step 1: Scaffold**

```bash
cd munbeop
pnpm dlx nuxi@latest init . --packageManager pnpm --gitInit false --force
```

- [ ] **Step 2: Overwrite `munbeop/package.json`**

```json
{
  "name": "munbeop-garden-app",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@nuxtjs/i18n": "^8.5.0",
    "nuxt": "^3.13.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@nuxt/eslint": "^0.5.0",
    "@nuxt/test-utils": "^3.14.0",
    "@pinia/nuxt": "^0.5.4",
    "@types/node": "^20.16.0",
    "@vitest/ui": "^2.1.0",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.10.0",
    "happy-dom": "^15.7.0",
    "pinia": "^2.2.0",
    "prettier": "^3.3.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.0"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  }
}
```

```bash
pnpm install
```

- [ ] **Step 3: Replace `munbeop/nuxt.config.ts`**

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2026-06-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n'],
  css: ['~/assets/styles/main.css'],
  typescript: {
    strict: true,
    typeCheck: false,
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' },
      { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'munbeop.v1.locale',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
    lazy: false,
    langDir: 'locales/',
  },
  app: {
    head: {
      title: 'Munbeop Garden',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1a1f1a' },
      ],
    },
  },
})
```

- [ ] **Step 4: Replace `munbeop/app.vue`**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 5: Replace `munbeop/tsconfig.json`**

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.vue"],
  "exclude": ["node_modules", ".nuxt", ".output", "dist"]
}
```

- [ ] **Step 6: Smoke-test**

```bash
pnpm dev
```

Expected: server at http://localhost:3000 starts (may warn about missing locale files — fine, Task 6 fixes). Ctrl+C.

- [ ] **Step 7: Commit**

```bash
cd ..
git add munbeop/
git commit -m "chore: scaffold Nuxt 3 + TypeScript strict + @nuxtjs/i18n config for 8 locales"
```

---

## Task 3: Tailwind CSS + design tokens

**Files:** `munbeop/tailwind.config.ts`, `munbeop/assets/styles/{main,tokens,pixel}.css`

- [ ] **Step 1: Install**

```bash
cd munbeop
pnpm add -D tailwindcss@^3.4 postcss@^8.4 autoprefixer@^10.4 @nuxtjs/tailwindcss@^6.12
```

- [ ] **Step 2: Register module** in `nuxt.config.ts`:

```typescript
modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
```

- [ ] **Step 3: Create `munbeop/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        jade: 'var(--jade)',
        red: 'var(--red)',
        indigo: 'var(--indigo)',
        gold: 'var(--gold)',
        seedling: 'var(--seedling)',
        plant: 'var(--plant)',
        tree: 'var(--tree)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        ko: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Create `munbeop/assets/styles/tokens.css`**

```css
:root {
  --paper: #1a1f1a;
  --paper-warm: #232a23;
  --paper-deep: #2d362d;
  --ink: #ebe6d7;
  --muted: #8a9189;
  --jade: #7da653;
  --red: #c23e3e;
  --red-deep: #9d2e2e;
  --indigo: #5890d4;
  --gold: #d4a04a;
  --seedling: #8a9189;
  --plant: #d4a04a;
  --tree: #7da653;
  --border: #313a31;
  --border-strong: #465048;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

- [ ] **Step 5: Create `munbeop/assets/styles/pixel.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

img.pixel, svg.pixel, .pixel-sprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.pixel-border {
  border-style: solid;
  border-width: 2px;
  border-color: var(--ink);
  box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--ink);
}

.font-pixel {
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}

html, body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', 'Noto Sans KR', system-ui, sans-serif;
  min-height: 100vh;
}
```

- [ ] **Step 6: Create `munbeop/assets/styles/main.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import './tokens.css';
@import './pixel.css';
```

- [ ] **Step 7: Commit**

```bash
cd ..
git add munbeop/
git commit -m "chore: wire Tailwind 3 with design tokens and pixel-art base styles"
```

---

## Task 4: Vitest + happy-dom

**Files:** `munbeop/vitest.config.ts`, `munbeop/tests/setup.ts`, `munbeop/tests/setup-smoke.test.ts`

- [ ] **Step 1: Create `munbeop/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'composables/**/*.ts', 'stores/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

- [ ] **Step 2: Create `munbeop/tests/setup.ts`**

```typescript
import { beforeEach } from 'vitest'

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }
})
```

- [ ] **Step 3: Smoke test `munbeop/tests/setup-smoke.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })

  it('has localStorage from happy-dom', () => {
    localStorage.setItem('k', 'v')
    expect(localStorage.getItem('k')).toBe('v')
  })
})
```

- [ ] **Step 4: Run and verify**

```bash
cd munbeop
pnpm test
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add munbeop/
git commit -m "chore: configure Vitest with happy-dom and shared setup"
```

---

## Task 5: ESLint flat config + Prettier

**Files:** `munbeop/eslint.config.mjs`, `munbeop/.prettierrc.json`, `munbeop/.prettierignore`

- [ ] **Step 1: Create `munbeop/eslint.config.mjs`**

```javascript
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', 'locales/**'],
})
```

- [ ] **Step 2: Create `munbeop/.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSpacing": true,
  "arrowParens": "always",
  "vueIndentScriptAndStyle": false
}
```

- [ ] **Step 3: Create `munbeop/.prettierignore`**

```
.nuxt/
.output/
dist/
node_modules/
pnpm-lock.yaml
coverage/
```

- [ ] **Step 4: Prepare Nuxt**

```bash
cd munbeop
pnpm nuxt prepare
pnpm format
pnpm lint
```

Expected: format succeeds, lint passes.

- [ ] **Step 5: Commit**

```bash
cd ..
git add munbeop/
git commit -m "chore: configure ESLint flat config and Prettier"
```

---

## Task 6: i18n locale files (8 languages)

**Files:** `munbeop/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

> **Note:** las traducciones a `th/id/vi` son best-effort y deben pasar revisión por hablante nativo en el backlog. `en/es/fr/pt-BR/ja` están en buen estado.

- [ ] **Step 1: Create `munbeop/locales/en.json`**

```json
{
  "nav": {
    "garden": "My Garden",
    "practice": "Practice",
    "library": "Library",
    "stats": "Stats",
    "log": "Journal",
    "settings": "Settings"
  },
  "title": {
    "garden": "My Garden",
    "practice": "Practice",
    "library": "Library",
    "stats": "Stats",
    "log": "Journal",
    "settings": "Settings"
  },
  "practice": {
    "intro_lead": "Hit GO and you'll get 3 grammar points × 3 contexts = 9 sentences to write. 화이팅! 💪",
    "spin": "🎲 GO",
    "fb_easy": "✨ EASY",
    "fb_hard": "😤 HARD",
    "error_note_label": "What was tricky? · 뭐가 어려웠어요?",
    "error_note_placeholder": "e.g. unsure whether to use 이 or 가...",
    "save_with_note": "💾 Save with note",
    "skip_note": "Skip note",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 sentences saved — 3 grammar × 3 contexts. Another round?",
    "completion_restart": "🎲 NEW ROUND",
    "context_label": "Context · 상황",
    "sentence_placeholder": "Write your sentence here…",
    "no_grammars": "Not enough grammar items in the active decks.",
    "no_contexts": "You need at least 3 active contexts.",
    "toast_saved_easy": "✨ Saved",
    "toast_saved_hard": "😤 Saved",
    "no_sentence": "Write a sentence first"
  },
  "library": {
    "lead": "All the grammar points that show up in your wheel. Each one grows as you practice."
  },
  "mastery": {
    "seedling": "Sprout · 새싹",
    "plant": "Growing · 성장",
    "tree": "Mastered · 나무"
  },
  "empty": {
    "garden": "The Garden map (Stardew-style 2D map with TOPIK zones and your grammar plants growing) ships in a later plan. Meanwhile, head to Practice to start cultivating.",
    "stats": "Detailed stats land in a later plan.",
    "log": "No sentences yet. Head to Practice.",
    "settings": "Account settings and customization land in later plans."
  },
  "common": {
    "language": "Language",
    "go_to_practice": "Practice"
  }
}
```

- [ ] **Step 2: Create `munbeop/locales/es.json`**

```json
{
  "nav": {
    "garden": "Mi Jardín",
    "practice": "Práctica",
    "library": "Herbolario",
    "stats": "Analítica",
    "log": "Diario",
    "settings": "Invernadero"
  },
  "title": {
    "garden": "Mi Jardín",
    "practice": "Práctica",
    "library": "Herbolario",
    "stats": "Analítica",
    "log": "Diario",
    "settings": "Invernadero"
  },
  "practice": {
    "intro_lead": "Dale a GIRAR y te tocarán 3 gramáticas × 3 contextos = 9 oraciones para escribir. 화이팅! 💪",
    "spin": "🎲 GIRAR",
    "fb_easy": "✨ FÁCIL",
    "fb_hard": "😤 DIFÍCIL",
    "error_note_label": "¿Qué te costó? · 뭐가 어려웠어요?",
    "error_note_placeholder": "ej: dudé entre 이 y 가…",
    "save_with_note": "💾 Guardar con nota",
    "skip_note": "Saltar nota",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 oraciones guardadas — 3 gramáticas × 3 contextos. ¿Otro giro?",
    "completion_restart": "🎲 NUEVO GIRO",
    "context_label": "Contexto · 상황",
    "sentence_placeholder": "Escribe tu oración aquí…",
    "no_grammars": "No hay suficientes gramáticas en los decks activos.",
    "no_contexts": "Necesitas al menos 3 contextos activos.",
    "toast_saved_easy": "✨ Guardada",
    "toast_saved_hard": "😤 Guardada",
    "no_sentence": "Escribe una oración primero"
  },
  "library": {
    "lead": "Todas las gramáticas que aparecerán en tu ruleta. Cada una crece según las practicas."
  },
  "mastery": {
    "seedling": "새싹 · Nueva",
    "plant": "성장 · Cultivando",
    "tree": "나무 · Dominada"
  },
  "empty": {
    "garden": "El mapa de Mi Jardín (mapa 2D estilo Stardew con zonas TOPIK y tus plantas gramaticales creciendo) llegará en un próximo plan. Mientras tanto, ve a Práctica para empezar a cultivar.",
    "stats": "Estadísticas detalladas llegan en un plan posterior.",
    "log": "Aún no has escrito ninguna oración. Ve a Práctica.",
    "settings": "Ajustes y gestión de cuenta llegan en planes posteriores."
  },
  "common": {
    "language": "Idioma",
    "go_to_practice": "Práctica"
  }
}
```

- [ ] **Step 3: Create `munbeop/locales/fr.json`**

```json
{
  "nav": {
    "garden": "Mon Jardin",
    "practice": "Pratique",
    "library": "Herboristerie",
    "stats": "Analyse",
    "log": "Journal",
    "settings": "Serre"
  },
  "title": {
    "garden": "Mon Jardin",
    "practice": "Pratique",
    "library": "Herboristerie",
    "stats": "Analyse",
    "log": "Journal",
    "settings": "Serre"
  },
  "practice": {
    "intro_lead": "Appuie sur TOURNER et tu auras 3 points de grammaire × 3 contextes = 9 phrases à écrire. 화이팅! 💪",
    "spin": "🎲 TOURNER",
    "fb_easy": "✨ FACILE",
    "fb_hard": "😤 DIFFICILE",
    "error_note_label": "Qu'est-ce qui était difficile ? · 뭐가 어려웠어요?",
    "error_note_placeholder": "ex : j'hésitais entre 이 et 가…",
    "save_with_note": "💾 Sauver avec note",
    "skip_note": "Sauter la note",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 phrases sauvegardées — 3 grammaires × 3 contextes. Encore un tour ?",
    "completion_restart": "🎲 NOUVEAU TOUR",
    "context_label": "Contexte · 상황",
    "sentence_placeholder": "Écris ta phrase ici…",
    "no_grammars": "Pas assez de grammaires dans les decks actifs.",
    "no_contexts": "Tu as besoin d'au moins 3 contextes actifs.",
    "toast_saved_easy": "✨ Sauvegardée",
    "toast_saved_hard": "😤 Sauvegardée",
    "no_sentence": "Écris d'abord une phrase"
  },
  "library": {
    "lead": "Toutes les grammaires qui apparaîtront dans ta roue. Chacune grandit selon ta pratique."
  },
  "mastery": {
    "seedling": "새싹 · Nouvelle",
    "plant": "성장 · En cultivation",
    "tree": "나무 · Maîtrisée"
  },
  "empty": {
    "garden": "La carte Mon Jardin (carte 2D style Stardew avec zones TOPIK et tes plantes grammaticales qui grandissent) arrive dans un prochain plan. En attendant, va à Pratique pour commencer à cultiver.",
    "stats": "Les statistiques détaillées arrivent dans un plan ultérieur.",
    "log": "Aucune phrase pour l'instant. Va à Pratique.",
    "settings": "Réglages et compte arrivent dans des plans ultérieurs."
  },
  "common": {
    "language": "Langue",
    "go_to_practice": "Pratique"
  }
}
```

- [ ] **Step 4: Create `munbeop/locales/pt-BR.json`**

```json
{
  "nav": {
    "garden": "Meu Jardim",
    "practice": "Prática",
    "library": "Herbário",
    "stats": "Análise",
    "log": "Diário",
    "settings": "Estufa"
  },
  "title": {
    "garden": "Meu Jardim",
    "practice": "Prática",
    "library": "Herbário",
    "stats": "Análise",
    "log": "Diário",
    "settings": "Estufa"
  },
  "practice": {
    "intro_lead": "Clica em GIRAR e vai receber 3 pontos de gramática × 3 contextos = 9 frases pra escrever. 화이팅! 💪",
    "spin": "🎲 GIRAR",
    "fb_easy": "✨ FÁCIL",
    "fb_hard": "😤 DIFÍCIL",
    "error_note_label": "O que foi difícil? · 뭐가 어려웠어요?",
    "error_note_placeholder": "ex: fiquei na dúvida entre 이 e 가…",
    "save_with_note": "💾 Salvar com nota",
    "skip_note": "Pular nota",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 frases salvas — 3 gramáticas × 3 contextos. Outra rodada?",
    "completion_restart": "🎲 NOVA RODADA",
    "context_label": "Contexto · 상황",
    "sentence_placeholder": "Escreve tua frase aqui…",
    "no_grammars": "Não há gramáticas suficientes nos decks ativos.",
    "no_contexts": "Você precisa de pelo menos 3 contextos ativos.",
    "toast_saved_easy": "✨ Salva",
    "toast_saved_hard": "😤 Salva",
    "no_sentence": "Escreve uma frase primeiro"
  },
  "library": {
    "lead": "Todas as gramáticas que aparecem na sua roleta. Cada uma cresce conforme você pratica."
  },
  "mastery": {
    "seedling": "새싹 · Nova",
    "plant": "성장 · Cultivando",
    "tree": "나무 · Dominada"
  },
  "empty": {
    "garden": "O mapa Meu Jardim (mapa 2D estilo Stardew com zonas TOPIK e suas plantas gramaticais crescendo) chega num plano futuro. Por enquanto, vai pra Prática começar a cultivar.",
    "stats": "Estatísticas detalhadas chegam num plano futuro.",
    "log": "Ainda não há frases. Vai pra Prática.",
    "settings": "Configurações e conta chegam em planos futuros."
  },
  "common": {
    "language": "Idioma",
    "go_to_practice": "Prática"
  }
}
```

- [ ] **Step 5: Create `munbeop/locales/th.json`** (best-effort — flag for native review)

```json
{
  "nav": {
    "garden": "สวนของฉัน",
    "practice": "ฝึก",
    "library": "ห้องสมุด",
    "stats": "สถิติ",
    "log": "บันทึก",
    "settings": "ตั้งค่า"
  },
  "title": {
    "garden": "สวนของฉัน",
    "practice": "ฝึก",
    "library": "ห้องสมุด",
    "stats": "สถิติ",
    "log": "บันทึก",
    "settings": "ตั้งค่า"
  },
  "practice": {
    "intro_lead": "กด หมุน แล้วจะได้ไวยากรณ์ 3 ข้อ × บริบท 3 แบบ = 9 ประโยคให้เขียน 화이팅! 💪",
    "spin": "🎲 หมุน",
    "fb_easy": "✨ ง่าย",
    "fb_hard": "😤 ยาก",
    "error_note_label": "อะไรที่ยาก? · 뭐가 어려웠어요?",
    "error_note_placeholder": "เช่น ไม่แน่ใจว่าใช้ 이 หรือ 가…",
    "save_with_note": "💾 บันทึกพร้อมโน้ต",
    "skip_note": "ข้ามโน้ต",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "บันทึก 9 ประโยคแล้ว — ไวยากรณ์ 3 × บริบท 3 อีกรอบไหม?",
    "completion_restart": "🎲 รอบใหม่",
    "context_label": "บริบท · 상황",
    "sentence_placeholder": "เขียนประโยคของคุณที่นี่…",
    "no_grammars": "ไวยากรณ์ในเด็คที่เปิดใช้ไม่พอ",
    "no_contexts": "ต้องมีบริบทที่เปิดใช้อย่างน้อย 3 อัน",
    "toast_saved_easy": "✨ บันทึกแล้ว",
    "toast_saved_hard": "😤 บันทึกแล้ว",
    "no_sentence": "เขียนประโยคก่อน"
  },
  "library": {
    "lead": "ไวยากรณ์ทั้งหมดที่จะปรากฏในวงล้อของคุณ แต่ละข้อเติบโตตามที่คุณฝึก"
  },
  "mastery": {
    "seedling": "새싹 · ใหม่",
    "plant": "성장 · กำลังโต",
    "tree": "나무 · เชี่ยวชาญ"
  },
  "empty": {
    "garden": "แผนที่สวนของฉัน (แผนที่ 2D สไตล์ Stardew พร้อมโซน TOPIK และต้นไม้ไวยากรณ์เติบโต) มาในแผนถัดไป ระหว่างนี้ไปที่ฝึกเพื่อเริ่มเพาะปลูก",
    "stats": "สถิติรายละเอียดมาในแผนถัดไป",
    "log": "ยังไม่มีประโยค ไปที่ฝึก",
    "settings": "ตั้งค่าบัญชีมาในแผนถัดไป"
  },
  "common": {
    "language": "ภาษา",
    "go_to_practice": "ฝึก"
  }
}
```

- [ ] **Step 6: Create `munbeop/locales/id.json`** (best-effort — flag for native review)

```json
{
  "nav": {
    "garden": "Kebunku",
    "practice": "Latihan",
    "library": "Perpustakaan",
    "stats": "Statistik",
    "log": "Jurnal",
    "settings": "Pengaturan"
  },
  "title": {
    "garden": "Kebunku",
    "practice": "Latihan",
    "library": "Perpustakaan",
    "stats": "Statistik",
    "log": "Jurnal",
    "settings": "Pengaturan"
  },
  "practice": {
    "intro_lead": "Tekan PUTAR dan kamu dapat 3 tata bahasa × 3 konteks = 9 kalimat untuk ditulis. 화이팅! 💪",
    "spin": "🎲 PUTAR",
    "fb_easy": "✨ MUDAH",
    "fb_hard": "😤 SULIT",
    "error_note_label": "Apa yang sulit? · 뭐가 어려웠어요?",
    "error_note_placeholder": "contoh: ragu antara 이 atau 가…",
    "save_with_note": "💾 Simpan dengan catatan",
    "skip_note": "Lewati catatan",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 kalimat tersimpan — 3 tata bahasa × 3 konteks. Putaran lagi?",
    "completion_restart": "🎲 PUTARAN BARU",
    "context_label": "Konteks · 상황",
    "sentence_placeholder": "Tulis kalimatmu di sini…",
    "no_grammars": "Tata bahasa di deck aktif tidak cukup.",
    "no_contexts": "Kamu butuh minimal 3 konteks aktif.",
    "toast_saved_easy": "✨ Tersimpan",
    "toast_saved_hard": "😤 Tersimpan",
    "no_sentence": "Tulis kalimat dulu"
  },
  "library": {
    "lead": "Semua tata bahasa yang muncul di rodamu. Masing-masing tumbuh seiring latihanmu."
  },
  "mastery": {
    "seedling": "새싹 · Baru",
    "plant": "성장 · Bertumbuh",
    "tree": "나무 · Dikuasai"
  },
  "empty": {
    "garden": "Peta Kebunku (peta 2D ala Stardew dengan zona TOPIK dan tanaman tata bahasamu tumbuh) hadir di rencana selanjutnya. Sementara itu, ke Latihan untuk mulai berkebun.",
    "stats": "Statistik detail hadir di rencana selanjutnya.",
    "log": "Belum ada kalimat. Pergi ke Latihan.",
    "settings": "Pengaturan akun hadir di rencana selanjutnya."
  },
  "common": {
    "language": "Bahasa",
    "go_to_practice": "Latihan"
  }
}
```

- [ ] **Step 7: Create `munbeop/locales/vi.json`** (best-effort — flag for native review)

```json
{
  "nav": {
    "garden": "Vườn của tôi",
    "practice": "Luyện tập",
    "library": "Thư viện",
    "stats": "Thống kê",
    "log": "Nhật ký",
    "settings": "Cài đặt"
  },
  "title": {
    "garden": "Vườn của tôi",
    "practice": "Luyện tập",
    "library": "Thư viện",
    "stats": "Thống kê",
    "log": "Nhật ký",
    "settings": "Cài đặt"
  },
  "practice": {
    "intro_lead": "Nhấn QUAY và bạn sẽ nhận 3 ngữ pháp × 3 ngữ cảnh = 9 câu để viết. 화이팅! 💪",
    "spin": "🎲 QUAY",
    "fb_easy": "✨ DỄ",
    "fb_hard": "😤 KHÓ",
    "error_note_label": "Cái gì khó? · 뭐가 어려웠어요?",
    "error_note_placeholder": "ví dụ: phân vân giữa 이 và 가…",
    "save_with_note": "💾 Lưu với ghi chú",
    "skip_note": "Bỏ qua ghi chú",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9 câu đã lưu — 3 ngữ pháp × 3 ngữ cảnh. Vòng nữa không?",
    "completion_restart": "🎲 VÒNG MỚI",
    "context_label": "Ngữ cảnh · 상황",
    "sentence_placeholder": "Viết câu của bạn ở đây…",
    "no_grammars": "Không đủ ngữ pháp trong các deck đang hoạt động.",
    "no_contexts": "Bạn cần ít nhất 3 ngữ cảnh đang hoạt động.",
    "toast_saved_easy": "✨ Đã lưu",
    "toast_saved_hard": "😤 Đã lưu",
    "no_sentence": "Viết câu trước đã"
  },
  "library": {
    "lead": "Tất cả các ngữ pháp xuất hiện trong vòng quay. Mỗi cái lớn lên khi bạn luyện tập."
  },
  "mastery": {
    "seedling": "새싹 · Mới",
    "plant": "성장 · Đang lớn",
    "tree": "나무 · Đã thuộc"
  },
  "empty": {
    "garden": "Bản đồ Vườn của tôi (bản đồ 2D kiểu Stardew với các vùng TOPIK và các cây ngữ pháp đang lớn) sẽ có trong kế hoạch sau. Trong khi đó, vào Luyện tập để bắt đầu trồng.",
    "stats": "Thống kê chi tiết sẽ có trong kế hoạch sau.",
    "log": "Chưa có câu nào. Vào Luyện tập.",
    "settings": "Cài đặt tài khoản sẽ có trong kế hoạch sau."
  },
  "common": {
    "language": "Ngôn ngữ",
    "go_to_practice": "Luyện tập"
  }
}
```

- [ ] **Step 8: Create `munbeop/locales/ja.json`**

```json
{
  "nav": {
    "garden": "私の庭",
    "practice": "練習",
    "library": "図書館",
    "stats": "統計",
    "log": "日記",
    "settings": "設定"
  },
  "title": {
    "garden": "私の庭",
    "practice": "練習",
    "library": "図書館",
    "stats": "統計",
    "log": "日記",
    "settings": "設定"
  },
  "practice": {
    "intro_lead": "回すを押すと文法3つ×文脈3つ=9文を書くことになります。화이팅! 💪",
    "spin": "🎲 回す",
    "fb_easy": "✨ かんたん",
    "fb_hard": "😤 むずかしい",
    "error_note_label": "何が難しかった? · 뭐가 어려웠어요?",
    "error_note_placeholder": "例:이か가か迷った…",
    "save_with_note": "💾 メモ付きで保存",
    "skip_note": "メモなし",
    "completion_ko": "수고했어요! 🎉",
    "completion_text": "9文保存しました — 文法3 × 文脈3。もう一回?",
    "completion_restart": "🎲 もう一回",
    "context_label": "文脈 · 상황",
    "sentence_placeholder": "ここに文を書いて…",
    "no_grammars": "アクティブなデッキの文法が足りません。",
    "no_contexts": "アクティブな文脈が3つ以上必要です。",
    "toast_saved_easy": "✨ 保存しました",
    "toast_saved_hard": "😤 保存しました",
    "no_sentence": "先に文を書いてください"
  },
  "library": {
    "lead": "ルーレットに出る全文法。練習するたびに育ちます。"
  },
  "mastery": {
    "seedling": "새싹 · 新規",
    "plant": "성장 · 育成中",
    "tree": "나무 · マスター"
  },
  "empty": {
    "garden": "私の庭マップ(StardewスタイルのTOPIKゾーン2Dマップで文法の植物が育つ)は次の計画で実装します。今は練習に行って栽培を始めてください。",
    "stats": "詳細統計は今後の計画で実装します。",
    "log": "まだ文がありません。練習へ。",
    "settings": "アカウント設定は今後の計画で実装します。"
  },
  "common": {
    "language": "言語",
    "go_to_practice": "練習"
  }
}
```

- [ ] **Step 9: Verify dev server picks up locales**

```bash
cd munbeop
pnpm dev
```

Open http://localhost:3000, no console errors about missing locale files. Ctrl+C.

- [ ] **Step 10: Commit**

```bash
cd ..
git add munbeop/locales/
git commit -m "feat(i18n): add complete locale JSON files for 8 languages"
```

---

## Task 7: Domain types (i18n-aware)

**Files:** `munbeop/lib/domain/{i18n,grammar,context,mastery,log,index}.ts`

- [ ] **Step 1: Create `munbeop/lib/domain/i18n.ts`**

```typescript
export const LOCALE_CODES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

export type LocaleCode = (typeof LOCALE_CODES)[number]

export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * A string with translations per supported locale.
 * Every supported locale must have a value (no partials in seed data).
 */
export type LocalizedString = Record<LocaleCode, string>

/**
 * Render a LocalizedString in the requested locale, falling back to DEFAULT_LOCALE,
 * then to the first non-empty entry, then to ''.
 */
export function localized(value: LocalizedString | undefined, locale: LocaleCode): string {
  if (!value) return ''
  const v = value[locale]
  if (v) return v
  const fb = value[DEFAULT_LOCALE]
  if (fb) return fb
  for (const code of LOCALE_CODES) {
    const x = value[code]
    if (x) return x
  }
  return ''
}
```

- [ ] **Step 2: Create `munbeop/lib/domain/mastery.ts`**

```typescript
export type MasteryLevel = 'seedling' | 'plant' | 'tree'

export interface SrsState {
  lastSeen: number | null
  easyCount: number
  hardCount: number
  mastery: MasteryLevel
}
```

- [ ] **Step 3: Create `munbeop/lib/domain/grammar.ts`**

```typescript
import type { LocalizedString } from './i18n'

export interface Grammar {
  /** Korean grammar pattern, e.g. "-(으)니까". Unique identifier in v1. NOT translated. */
  ko: string
  /** Explanation of meaning/usage per locale. */
  meaning: LocalizedString
  /** Optional canonical example sentence in Korean. NOT translated. */
  example?: string
  /** Optional translation of the example per locale. */
  trans?: LocalizedString
  /** Deck this grammar belongs to. */
  deckId: string
}

export interface Deck {
  id: string
  name: string
  colorId: string
  order: number
  collapsed: boolean
}
```

- [ ] **Step 4: Create `munbeop/lib/domain/context.ts`**

```typescript
import type { LocalizedString } from './i18n'

export interface Context {
  id: string
  /** Short Korean name shown as badge, e.g. "반말". NOT translated. */
  name: string
  /** Mini-scene explaining when this context applies, per locale. */
  scene: LocalizedString
  category: 'formalidad' | 'situacional' | 'custom'
  builtin: boolean
}
```

- [ ] **Step 5: Create `munbeop/lib/domain/log.ts`**

```typescript
export type Feedback = 'easy' | 'hard'
export type ReviewState = 'unreviewed' | 'correct' | 'incorrect'

export interface LogEntry {
  id: number
  ko: string
  sentence: string
  feedback: Feedback
  errorNote: string | null
  reviewState: ReviewState
  contextId: string
  contextName: string
  date: string
}
```

- [ ] **Step 6: Create `munbeop/lib/domain/index.ts`**

```typescript
export * from './i18n'
export * from './grammar'
export * from './context'
export * from './mastery'
export * from './log'
```

- [ ] **Step 7: Write a tiny test for `localized()`** at `munbeop/tests/unit/domain/i18n.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { localized, type LocalizedString } from '~/lib/domain'

const value: LocalizedString = {
  en: 'EN', es: 'ES', fr: 'FR', 'pt-BR': 'PT', th: 'TH', id: 'ID', vi: 'VI', ja: 'JA',
}

describe('localized()', () => {
  it('returns the requested locale', () => {
    expect(localized(value, 'fr')).toBe('FR')
    expect(localized(value, 'ja')).toBe('JA')
  })

  it('falls back to en when requested locale is empty', () => {
    const partial = { ...value, vi: '' }
    expect(localized(partial, 'vi')).toBe('EN')
  })

  it('returns empty string for undefined input', () => {
    expect(localized(undefined, 'en')).toBe('')
  })
})
```

- [ ] **Step 8: Run tests + typecheck**

```bash
cd munbeop
pnpm test
pnpm typecheck
```

Expected: tests pass, no type errors.

- [ ] **Step 9: Commit**

```bash
cd ..
git add munbeop/lib/domain/ munbeop/tests/
git commit -m "feat(domain): add locale-aware Grammar, Context, SrsState, LogEntry types"
```

---

## Task 8: Seed data with 8-language translations

**Files:** `munbeop/seed/grammars.ts`, `munbeop/seed/contexts.ts`

> **Note:** `th/id/vi` traducciones son best-effort — backlog para revisión nativa.

- [ ] **Step 1: Create `munbeop/seed/grammars.ts`**

```typescript
import type { Grammar, Deck, LocalizedString } from '~/lib/domain'

export const DEFAULT_DECK: Deck = {
  id: 'general',
  name: 'General',
  colorId: 'indigo',
  order: 0,
  collapsed: false,
}

const L = (en: string, es: string, fr: string, ptBR: string, th: string, id: string, vi: string, ja: string): LocalizedString =>
  ({ en, es, fr, 'pt-BR': ptBR, th, id, vi, ja })

export const DEFAULT_GRAMMAR: Grammar[] = [
  {
    ko: '에서/부터~까지',
    meaning: L(
      'from...to (place/time)',
      'desde...hasta',
      'de...à',
      'de...até',
      'จาก...ถึง',
      'dari...sampai',
      'từ...đến',
      '〜から〜まで',
    ),
    example: '9시부터 5시까지 일해요.',
    trans: L(
      'I work from 9 to 5.',
      'Trabajo de 9 a 5.',
      'Je travaille de 9h à 17h.',
      'Trabalho das 9 às 5.',
      'ฉันทำงานตั้งแต่ 9 โมงถึง 5 โมง',
      'Saya bekerja dari jam 9 sampai jam 5.',
      'Tôi làm việc từ 9 giờ đến 5 giờ.',
      '9時から5時まで働きます。',
    ),
    deckId: 'general',
  },
  {
    ko: '-(으)면',
    meaning: L(
      'if / when (conditional)',
      'si / cuando (condicional)',
      'si / quand (conditionnel)',
      'se / quando (condicional)',
      'ถ้า / เมื่อ',
      'jika / kalau',
      'nếu / khi',
      'もし〜たら / 〜ば',
    ),
    example: '시간이 있으면 같이 가요.',
    trans: L(
      "If you have time, let's go together.",
      'Si tienes tiempo, vamos juntos.',
      "Si tu as le temps, allons-y ensemble.",
      'Se tiver tempo, vamos juntos.',
      'ถ้ามีเวลา ไปด้วยกันนะ',
      'Kalau ada waktu, ayo pergi bersama.',
      'Nếu có thời gian, đi cùng nhau nhé.',
      '時間があれば一緒に行きましょう。',
    ),
    deckId: 'general',
  },
  {
    ko: '-(으)니까',
    meaning: L(
      'because (allows imperative/suggestion)',
      'porque (permite imperativo)',
      'parce que (permet l\'impératif)',
      'porque (permite imperativo)',
      'เพราะ (ใช้กับคำสั่งได้)',
      'karena (boleh dengan perintah)',
      'bởi vì (cho phép mệnh lệnh)',
      '〜から/ので (命令OK)',
    ),
    example: '비가 오니까 우산을 가져가세요.',
    trans: L(
      "It's raining, so take an umbrella.",
      'Como llueve, lleva paraguas.',
      'Il pleut, alors prends un parapluie.',
      'Como está chovendo, leva guarda-chuva.',
      'ฝนตก เอาร่มไปด้วยนะ',
      'Karena hujan, bawa payung ya.',
      'Vì trời mưa, hãy mang ô đi.',
      '雨が降っているから傘を持って行ってください。',
    ),
    deckId: 'general',
  },
  {
    ko: '는/은',
    meaning: L(
      'topic particle',
      'partícula de tema',
      'particule de thème',
      'partícula de tópico',
      'อนุภาคหัวเรื่อง',
      'partikel topik',
      'tiểu từ chủ đề',
      '主題助詞「は」',
    ),
    example: '저는 학생이에요.',
    trans: L(
      'I am a student.',
      'Yo soy estudiante.',
      'Je suis étudiant.',
      'Eu sou estudante.',
      'ฉันเป็นนักเรียน',
      'Saya seorang pelajar.',
      'Tôi là học sinh.',
      '私は学生です。',
    ),
    deckId: 'general',
  },
  {
    ko: '이/가',
    meaning: L(
      'subject particle',
      'partícula de sujeto',
      'particule de sujet',
      'partícula de sujeito',
      'อนุภาคประธาน',
      'partikel subjek',
      'tiểu từ chủ ngữ',
      '主語助詞「が」',
    ),
    example: '고양이가 귀여워요.',
    trans: L(
      'The cat is cute.',
      'El gato es lindo.',
      'Le chat est mignon.',
      'O gato é fofo.',
      'แมวน่ารัก',
      'Kucingnya lucu.',
      'Con mèo dễ thương.',
      '猫がかわいいです。',
    ),
    deckId: 'general',
  },
  {
    ko: '을/를',
    meaning: L(
      'object particle',
      'partícula de objeto',
      'particule d\'objet',
      'partícula de objeto',
      'อนุภาคกรรม',
      'partikel objek',
      'tiểu từ tân ngữ',
      '目的語助詞「を」',
    ),
    example: '책을 읽어요.',
    trans: L(
      'I read a book.',
      'Leo un libro.',
      'Je lis un livre.',
      'Eu leio um livro.',
      'ฉันอ่านหนังสือ',
      'Saya membaca buku.',
      'Tôi đọc sách.',
      '本を読みます。',
    ),
    deckId: 'general',
  },
  {
    ko: '한테/한테서',
    meaning: L(
      'to / from (person) — informal',
      'a / de (persona) — informal',
      'à / de (personne) — informel',
      'para / de (pessoa) — informal',
      'ให้/จาก (คน) — ไม่ทางการ',
      'kepada / dari (orang) — informal',
      'cho / từ (người) — không trang trọng',
      '〜に/から (人・口語)',
    ),
    example: '친구한테 선물을 줬어요.',
    trans: L(
      'I gave a gift to my friend.',
      'Le di un regalo a mi amigo.',
      'J\'ai donné un cadeau à mon ami.',
      'Dei um presente para meu amigo.',
      'ฉันให้ของขวัญเพื่อน',
      'Saya memberi hadiah kepada teman.',
      'Tôi đã tặng quà cho bạn.',
      '友達にプレゼントをあげました。',
    ),
    deckId: 'general',
  },
  {
    ko: '-(으)러',
    meaning: L(
      'in order to (purpose + motion verb)',
      'para (propósito + verbo de movimiento)',
      'pour (but + verbe de mouvement)',
      'para (propósito + verbo de movimento)',
      'เพื่อ (กับกริยาเคลื่อนไหว)',
      'untuk (tujuan + verba gerak)',
      'để (mục đích + động từ di chuyển)',
      '〜しに (移動の目的)',
    ),
    example: '밥 먹으러 가요.',
    trans: L(
      'I\'m going to eat.',
      'Voy a comer.',
      'Je vais manger.',
      'Vou comer.',
      'ฉันจะไปกินข้าว',
      'Saya pergi makan.',
      'Tôi đi ăn cơm.',
      'ご飯を食べに行きます。',
    ),
    deckId: 'general',
  },
  {
    ko: '-(으)려고',
    meaning: L(
      'with the intention of',
      'con la intención de',
      'avec l\'intention de',
      'com a intenção de',
      'ตั้งใจจะ',
      'berniat untuk',
      'với ý định',
      '〜しようと',
    ),
    example: '한국어를 배우려고 해요.',
    trans: L(
      'I intend to learn Korean.',
      'Tengo la intención de aprender coreano.',
      'J\'ai l\'intention d\'apprendre le coréen.',
      'Tenho a intenção de aprender coreano.',
      'ฉันตั้งใจจะเรียนภาษาเกาหลี',
      'Saya berniat belajar bahasa Korea.',
      'Tôi định học tiếng Hàn.',
      '韓国語を学ぼうと思います。',
    ),
    deckId: 'general',
  },
  {
    ko: '-고 싶다',
    meaning: L(
      'want to do something',
      'querer hacer algo',
      'vouloir faire',
      'querer fazer algo',
      'อยากทำ',
      'ingin melakukan',
      'muốn làm',
      '〜したい',
    ),
    example: '드라마를 보고 싶어요.',
    trans: L(
      'I want to watch a drama.',
      'Quiero ver un drama.',
      'Je veux regarder un drama.',
      'Quero ver um drama.',
      'ฉันอยากดูซีรีส์',
      'Saya ingin menonton drama.',
      'Tôi muốn xem phim.',
      'ドラマを見たいです。',
    ),
    deckId: 'general',
  },
  {
    ko: '못',
    meaning: L(
      'cannot (impossibility)',
      'no poder (imposibilidad)',
      'ne pas pouvoir',
      'não conseguir',
      'ไม่สามารถ',
      'tidak bisa',
      'không thể',
      'できない (不可能)',
    ),
    example: '매운 거 못 먹어요.',
    trans: L(
      'I can\'t eat spicy food.',
      'No puedo comer picante.',
      'Je ne peux pas manger épicé.',
      'Não consigo comer picante.',
      'ฉันกินเผ็ดไม่ได้',
      'Saya tidak bisa makan pedas.',
      'Tôi không ăn cay được.',
      '辛いものは食べられません。',
    ),
    deckId: 'general',
  },
  {
    ko: '-지 않다',
    meaning: L(
      'not (formal negation)',
      'no (negación formal)',
      'ne ... pas (négation formelle)',
      'não (negação formal)',
      'ไม่ (ปฏิเสธทางการ)',
      'tidak (negasi formal)',
      'không (phủ định trang trọng)',
      '〜ない (改まった否定)',
    ),
    example: '오늘은 춥지 않아요.',
    trans: L(
      'It\'s not cold today.',
      'Hoy no hace frío.',
      "Il ne fait pas froid aujourd'hui.",
      'Hoje não está frio.',
      'วันนี้ไม่หนาว',
      'Hari ini tidak dingin.',
      'Hôm nay không lạnh.',
      '今日は寒くないです。',
    ),
    deckId: 'general',
  },
  {
    ko: '-고',
    meaning: L(
      'and (action connector)',
      'y (conectivo entre acciones)',
      'et (connecteur d\'actions)',
      'e (conector de ações)',
      'แล้วก็ (เชื่อมการกระทำ)',
      'lalu / dan (penghubung aksi)',
      'và (nối hành động)',
      '〜して (動作の連結)',
    ),
    example: '숙제를 하고 잤어요.',
    trans: L(
      'I did my homework and went to sleep.',
      'Hice la tarea y me dormí.',
      'J\'ai fait mes devoirs et je suis allé dormir.',
      'Fiz a lição e fui dormir.',
      'ทำการบ้านแล้วก็นอน',
      'Saya kerjakan PR lalu tidur.',
      'Tôi làm bài tập rồi đi ngủ.',
      '宿題をして寝ました。',
    ),
    deckId: 'general',
  },
  {
    ko: '-아/어야 되다',
    meaning: L(
      'have to / must',
      'tener que / deber',
      'devoir / il faut',
      'ter que / dever',
      'ต้อง',
      'harus',
      'phải',
      '〜なければならない',
    ),
    example: '내일 일찍 일어나야 돼요.',
    trans: L(
      'I have to wake up early tomorrow.',
      'Mañana tengo que levantarme temprano.',
      'Demain je dois me lever tôt.',
      'Amanhã tenho que acordar cedo.',
      'พรุ่งนี้ต้องตื่นเช้า',
      'Besok saya harus bangun pagi.',
      'Ngày mai tôi phải dậy sớm.',
      '明日早く起きなければなりません。',
    ),
    deckId: 'general',
  },
]
```

- [ ] **Step 2: Create `munbeop/seed/contexts.ts`**

```typescript
import type { Context, LocalizedString } from '~/lib/domain'

const L = (en: string, es: string, fr: string, ptBR: string, th: string, id: string, vi: string, ja: string): LocalizedString =>
  ({ en, es, fr, 'pt-BR': ptBR, th, id, vi, ja })

export const DEFAULT_CONTEXTS: Context[] = [
  {
    id: 'banmal',
    name: '반말',
    scene: L(
      'with your close friend, no formality',
      'con tu 친한 친구, sin formalidad',
      'avec ton ami proche, sans formalité',
      'com seu amigo próximo, sem formalidade',
      'กับเพื่อนสนิท ไม่มีพิธีรีตอง',
      'dengan teman dekat, tanpa formalitas',
      'với bạn thân, không trang trọng',
      '親しい友達と、敬語なし',
    ),
    category: 'formalidad',
    builtin: true,
  },
  {
    id: 'jondaetmal',
    name: '존댓말',
    scene: L(
      'polite normal, with someone you don\'t know well',
      'polite normal, con alguien que no conoces bien',
      'poli normal, avec quelqu\'un que tu ne connais pas bien',
      'educado normal, com alguém que você não conhece bem',
      'สุภาพปกติ กับคนที่ไม่รู้จักดี',
      'sopan normal, dengan orang yang belum kenal',
      'lịch sự thông thường, với người không quen',
      '普通の丁寧語、よく知らない相手と',
    ),
    category: 'formalidad',
    builtin: true,
  },
  {
    id: 'gyeoksik',
    name: '격식체',
    scene: L(
      'formal — business meeting or presentation',
      'formal tipo reunión de trabajo o presentación',
      'formel — réunion ou présentation',
      'formal — reunião de trabalho ou apresentação',
      'ทางการ ประชุมหรือนำเสนอ',
      'formal — rapat kerja atau presentasi',
      'trang trọng — họp công việc hoặc thuyết trình',
      'フォーマル — 会議やプレゼン',
    ),
    category: 'formalidad',
    builtin: true,
  },
  {
    id: 'friends',
    name: '친구한테',
    scene: L(
      'telling something to your friends',
      'contando algo a tus amigos',
      'en racontant quelque chose à tes amis',
      'contando algo para seus amigos',
      'เล่าอะไรให้เพื่อนฟัง',
      'menceritakan sesuatu ke teman-teman',
      'kể chuyện cho bạn bè',
      '友達に何か話す感じ',
    ),
    category: 'situacional',
    builtin: true,
  },
  {
    id: 'drama',
    name: '드라마 장면',
    scene: L(
      'like a K-drama scene, intense',
      'como diálogo de K-drama, intenso',
      'comme une scène de K-drama, intense',
      'como cena de K-drama, intenso',
      'เหมือนซีนซีรีส์เกาหลี เข้มข้น',
      'seperti adegan K-drama, intens',
      'như cảnh phim Hàn, dữ dội',
      'Kドラマのシーンのように、激しい',
    ),
    category: 'situacional',
    builtin: true,
  },
  {
    id: 'work',
    name: '직장에서',
    scene: L(
      'in a work context, to a colleague',
      'en contexto laboral, a un compañero',
      'au travail, à un collègue',
      'no trabalho, para um colega',
      'ในที่ทำงาน กับเพื่อนร่วมงาน',
      'di kantor, ke rekan kerja',
      'ở chỗ làm, với đồng nghiệp',
      '職場で、同僚に',
    ),
    category: 'situacional',
    builtin: true,
  },
  {
    id: 'sns',
    name: 'SNS에',
    scene: L(
      'short, expressive social media post',
      'publicación corta, expresiva',
      'publication courte et expressive',
      'post curto e expressivo',
      'โพสต์โซเชียลสั้นๆ มีอารมณ์',
      'postingan medsos pendek, ekspresif',
      'bài đăng mạng xã hội ngắn, biểu cảm',
      'SNSの短く感情豊かな投稿',
    ),
    category: 'situacional',
    builtin: true,
  },
  {
    id: 'elder',
    name: '어른한테',
    scene: L(
      'to your grandparent, older teacher, senior boss',
      'a tu abuelo/a, profesor mayor, jefe con edad',
      'à ton grand-parent, professeur âgé, patron senior',
      'para seu avô/avó, professor mais velho, chefe sênior',
      'กับปู่ย่า อาจารย์ผู้ใหญ่ เจ้านายอาวุโส',
      'ke kakek/nenek, guru senior, bos senior',
      'với ông bà, thầy lớn tuổi, sếp lớn tuổi',
      'おじいさん・おばあさん、年配の先生や上司に',
    ),
    category: 'situacional',
    builtin: true,
  },
]
```

- [ ] **Step 3: Typecheck**

```bash
cd munbeop
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
cd ..
git add munbeop/seed/
git commit -m "feat(seed): port 14 grammars and 8 contexts with 8-language translations"
```

---

## Task 9: SRS thresholds

**Files:** `munbeop/lib/srs/thresholds.ts`, `munbeop/tests/unit/srs/thresholds.test.ts`

- [ ] **Step 1: Write failing test** `munbeop/tests/unit/srs/thresholds.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  PROMOTE_TO_PLANT_MIN_TOTAL,
  PROMOTE_TO_PLANT_EASY_RATIO,
  PROMOTE_TO_TREE_MIN_TOTAL,
  PROMOTE_TO_TREE_EASY_RATIO,
  ALMOST_GROUP_MIN_TOTAL,
  ALMOST_GROUP_EASY_RATIO,
} from '~/lib/srs/thresholds'

describe('SRS thresholds', () => {
  it('promote seedling → plant at ≥20 with easy ≥ hard × 1.5', () => {
    expect(PROMOTE_TO_PLANT_MIN_TOTAL).toBe(20)
    expect(PROMOTE_TO_PLANT_EASY_RATIO).toBe(1.5)
  })

  it('promote plant → tree at ≥60 with easy ≥ hard × 2.5', () => {
    expect(PROMOTE_TO_TREE_MIN_TOTAL).toBe(60)
    expect(PROMOTE_TO_TREE_EASY_RATIO).toBe(2.5)
  })

  it('almost group ≥15 with ratio 1.5', () => {
    expect(ALMOST_GROUP_MIN_TOTAL).toBe(15)
    expect(ALMOST_GROUP_EASY_RATIO).toBe(1.5)
  })
})
```

- [ ] **Step 2: Run, verify failure**

```bash
cd munbeop
pnpm test thresholds
```

- [ ] **Step 3: Implement `munbeop/lib/srs/thresholds.ts`**

```typescript
// Ported verbatim from legacy/index.html line 3493-3499 and 3885-3891.
export const PROMOTE_TO_PLANT_MIN_TOTAL = 20
export const PROMOTE_TO_PLANT_EASY_RATIO = 1.5
export const PROMOTE_TO_TREE_MIN_TOTAL = 60
export const PROMOTE_TO_TREE_EASY_RATIO = 2.5
export const ALMOST_GROUP_MIN_TOTAL = 15
export const ALMOST_GROUP_EASY_RATIO = 1.5
```

- [ ] **Step 4: Run, verify pass**

```bash
pnpm test thresholds
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add munbeop/lib/srs/ munbeop/tests/
git commit -m "feat(srs): add thresholds module ported from legacy"
```

---

## Task 10: SRS weight + daysSinceSeen

**Files:** `munbeop/lib/srs/weight.ts`, `munbeop/tests/unit/srs/weight.test.ts`

- [ ] **Step 1: Failing test** `munbeop/tests/unit/srs/weight.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getWeight, daysSinceSeen } from '~/lib/srs/weight'
import type { SrsState } from '~/lib/domain'

const baseSrs: SrsState = { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' }

describe('getWeight', () => {
  it('seedling never seen gets highest weight class', () => {
    expect(getWeight(baseSrs, Date.now())).toBeGreaterThan(5)
  })

  it('tree just seen < seedling just seen', () => {
    const now = Date.now()
    const seed: SrsState = { lastSeen: now, easyCount: 0, hardCount: 0, mastery: 'seedling' }
    const tree: SrsState = { lastSeen: now, easyCount: 10, hardCount: 0, mastery: 'tree' }
    expect(getWeight(seed, now)).toBeGreaterThan(getWeight(tree, now))
  })

  it('older lastSeen → larger weight up to cap', () => {
    const now = Date.now()
    const recent: SrsState = { ...baseSrs, lastSeen: now - 86_400_000, mastery: 'plant' }
    const old: SrsState = { ...baseSrs, lastSeen: now - 30 * 86_400_000, mastery: 'plant' }
    expect(getWeight(old, now)).toBeGreaterThan(getWeight(recent, now))
  })

  it('hard-heavy > easy-heavy', () => {
    const now = Date.now()
    const hard: SrsState = { lastSeen: now, easyCount: 2, hardCount: 8, mastery: 'plant' }
    const easy: SrsState = { lastSeen: now, easyCount: 8, hardCount: 2, mastery: 'plant' }
    expect(getWeight(hard, now)).toBeGreaterThan(getWeight(easy, now))
  })

  it('never below floor 0.1', () => {
    const now = Date.now()
    const dom: SrsState = { lastSeen: now, easyCount: 100, hardCount: 0, mastery: 'tree' }
    expect(getWeight(dom, now)).toBeGreaterThanOrEqual(0.1)
  })
})

describe('daysSinceSeen', () => {
  it('null when never seen', () => {
    expect(daysSinceSeen(null, Date.now())).toBeNull()
  })

  it('0 for today', () => {
    const now = Date.now()
    expect(daysSinceSeen(now - 1000, now)).toBe(0)
  })

  it('floors partial day', () => {
    const now = Date.now()
    expect(daysSinceSeen(now - 1.5 * 86_400_000, now)).toBe(1)
  })
})
```

- [ ] **Step 2: Implement `munbeop/lib/srs/weight.ts`**

```typescript
import type { SrsState } from '~/lib/domain'

const MS_PER_DAY = 86_400_000
const MASTERY_BASE: Record<SrsState['mastery'], number> = {
  seedling: 3,
  plant: 1.5,
  tree: 0.6,
}
const TIME_FACTOR_MAX = 2
const TIME_FACTOR_PIVOT_DAYS = 7
const NEVER_SEEN_DAYS = 30
const HARD_BONUS_COEF = 0.15
const HARD_BONUS_FLOOR = 0.3
const WEIGHT_FLOOR = 0.1

export function getWeight(srs: SrsState, now: number): number {
  const daysSince = srs.lastSeen ? (now - srs.lastSeen) / MS_PER_DAY : NEVER_SEEN_DAYS
  const timeFactor = Math.min(1 + daysSince / TIME_FACTOR_PIVOT_DAYS, TIME_FACTOR_MAX)
  const rawHardBonus = 1 + (srs.hardCount - srs.easyCount) * HARD_BONUS_COEF
  const hardBonus = Math.max(HARD_BONUS_FLOOR, rawHardBonus)
  const weight = MASTERY_BASE[srs.mastery] * timeFactor * hardBonus
  return Math.max(WEIGHT_FLOOR, weight)
}

export function daysSinceSeen(lastSeen: number | null, now: number): number | null {
  if (lastSeen === null) return null
  return Math.floor((now - lastSeen) / MS_PER_DAY)
}
```

- [ ] **Step 3: Run, verify pass + commit**

```bash
cd munbeop
pnpm test weight
cd ..
git add munbeop/
git commit -m "feat(srs): port getWeight and daysSinceSeen with tests"
```

---

## Task 11: Weighted pick

**Files:** `munbeop/lib/srs/pick.ts`, `munbeop/tests/unit/srs/pick.test.ts`

- [ ] **Step 1: Failing test** `munbeop/tests/unit/srs/pick.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { weightedPick, pickRandomFrom } from '~/lib/srs/pick'

describe('weightedPick', () => {
  it('returns n items when pool large enough', () => {
    expect(weightedPick([1, 2, 3, 4, 5], 3, () => 1, () => 0.5)).toHaveLength(3)
  })

  it('returns only available count when pool smaller', () => {
    expect(weightedPick([1, 2], 5, () => 1, () => 0.5)).toHaveLength(2)
  })

  it('never duplicates', () => {
    const picks = weightedPick([1, 2, 3, 4, 5], 5, () => 1, () => 0.5)
    expect(new Set(picks).size).toBe(5)
  })

  it('biases toward higher weight', () => {
    const w = (item: number) => (item === 0 ? 100 : 1)
    expect(weightedPick([0, 1, 2, 3], 1, w, () => 0)[0]).toBe(0)
  })

  it('handles empty pool', () => {
    expect(weightedPick<number>([], 3, () => 1, () => 0.5)).toEqual([])
  })
})

describe('pickRandomFrom', () => {
  it('returns n when enough', () => {
    expect(pickRandomFrom([10, 20, 30, 40], 2, () => 0.5)).toHaveLength(2)
  })

  it('returns all when n > pool', () => {
    expect(pickRandomFrom([1, 2], 5, () => 0.5)).toHaveLength(2)
  })

  it('never duplicates', () => {
    expect(new Set(pickRandomFrom([1, 2, 3], 3, () => 0.5)).size).toBe(3)
  })
})
```

- [ ] **Step 2: Implement `munbeop/lib/srs/pick.ts`**

```typescript
export function weightedPick<T>(
  pool: readonly T[],
  n: number,
  weightOf: (item: T) => number,
  rng: () => number = Math.random,
): T[] {
  const remaining = [...pool]
  const picks: T[] = []
  const take = Math.min(n, remaining.length)
  for (let i = 0; i < take; i++) {
    const weights = remaining.map(weightOf)
    const total = weights.reduce((a, b) => a + b, 0)
    if (total <= 0) {
      const idx = Math.floor(rng() * remaining.length)
      picks.push(remaining[idx]!)
      remaining.splice(idx, 1)
      continue
    }
    let r = rng() * total
    let chosen = 0
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j]!
      if (r <= 0) { chosen = j; break }
    }
    picks.push(remaining[chosen]!)
    remaining.splice(chosen, 1)
  }
  return picks
}

export function pickRandomFrom<T>(
  pool: readonly T[],
  n: number,
  rng: () => number = Math.random,
): T[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr.slice(0, Math.min(n, arr.length))
}
```

- [ ] **Step 3: Pass + commit**

```bash
cd munbeop && pnpm test pick && cd ..
git add munbeop/ && git commit -m "feat(srs): port weightedPick and pickRandomFrom with deterministic rng"
```

---

## Task 12: Mastery transitions

**Files:** `munbeop/lib/srs/mastery.ts`, `munbeop/lib/srs/index.ts`, `munbeop/tests/unit/srs/mastery.test.ts`

- [ ] **Step 1: Failing test** `munbeop/tests/unit/srs/mastery.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { freshSrs, recalculateMastery, getMasteryInfo } from '~/lib/srs/mastery'
import type { LogEntry } from '~/lib/domain'

function entry(ko: string, feedback: 'easy' | 'hard', reviewState: 'unreviewed' | 'correct' | 'incorrect' = 'unreviewed'): LogEntry {
  return {
    id: Math.random(),
    ko, sentence: 'x', feedback,
    errorNote: null, reviewState,
    contextId: 'banmal', contextName: '반말',
    date: new Date().toISOString(),
  }
}

describe('freshSrs', () => {
  it('returns seedling zero', () => {
    expect(freshSrs()).toEqual({ lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' })
  })
})

describe('recalculateMastery', () => {
  it('seedling when empty', () => {
    expect(recalculateMastery('x', []).mastery).toBe('seedling')
  })

  it('ignores incorrect-reviewed entries', () => {
    const log = [entry('x', 'easy', 'incorrect'), entry('x', 'easy', 'correct'), entry('x', 'hard')]
    const r = recalculateMastery('x', log)
    expect(r.easyCount).toBe(1)
    expect(r.hardCount).toBe(1)
  })

  it('promotes to plant at 20 entries 12/8', () => {
    const log = [...Array(12).fill(0).map(() => entry('x', 'easy')), ...Array(8).fill(0).map(() => entry('x', 'hard'))]
    expect(recalculateMastery('x', log).mastery).toBe('plant')
  })

  it('stays seedling at 19', () => {
    const log = [...Array(12).fill(0).map(() => entry('x', 'easy')), ...Array(7).fill(0).map(() => entry('x', 'hard'))]
    expect(recalculateMastery('x', log).mastery).toBe('seedling')
  })

  it('promotes to tree at 60 / 50e 10h', () => {
    const log = [...Array(50).fill(0).map(() => entry('x', 'easy')), ...Array(10).fill(0).map(() => entry('x', 'hard'))]
    expect(recalculateMastery('x', log).mastery).toBe('tree')
  })

  it('filters by ko', () => {
    const log = [...Array(15).fill(0).map(() => entry('a', 'easy')), ...Array(15).fill(0).map(() => entry('b', 'easy'))]
    expect(recalculateMastery('a', log).easyCount).toBe(15)
  })
})

describe('getMasteryInfo', () => {
  it('seedling', () => { expect(getMasteryInfo('seedling').emoji).toBe('🌱') })
  it('plant',    () => { expect(getMasteryInfo('plant').emoji).toBe('🌿') })
  it('tree',     () => { expect(getMasteryInfo('tree').emoji).toBe('🌳') })
})
```

- [ ] **Step 2: Implement `munbeop/lib/srs/mastery.ts`**

```typescript
import type { LogEntry, MasteryLevel, SrsState } from '~/lib/domain'
import {
  PROMOTE_TO_PLANT_EASY_RATIO,
  PROMOTE_TO_PLANT_MIN_TOTAL,
  PROMOTE_TO_TREE_EASY_RATIO,
  PROMOTE_TO_TREE_MIN_TOTAL,
} from './thresholds'

export function freshSrs(): SrsState {
  return { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling' }
}

export function recalculateMastery(ko: string, log: readonly LogEntry[]): SrsState {
  const entries = log.filter((e) => e.ko === ko)
  let easyCount = 0
  let hardCount = 0
  let lastSeen: number | null = null
  for (const e of entries) {
    if (e.reviewState === 'incorrect') continue
    if (e.feedback === 'easy') easyCount++
    else hardCount++
    const ts = new Date(e.date).getTime()
    if (lastSeen === null || ts > lastSeen) lastSeen = ts
  }
  const total = easyCount + hardCount
  let mastery: MasteryLevel = 'seedling'
  if (total >= PROMOTE_TO_TREE_MIN_TOTAL && easyCount >= hardCount * PROMOTE_TO_TREE_EASY_RATIO) {
    mastery = 'tree'
  } else if (total >= PROMOTE_TO_PLANT_MIN_TOTAL && easyCount >= hardCount * PROMOTE_TO_PLANT_EASY_RATIO) {
    mastery = 'plant'
  }
  return { lastSeen, easyCount, hardCount, mastery }
}

export interface MasteryInfo {
  emoji: string
  /** i18n key for the localized label (resolved by useI18n() in UI). */
  labelKey: string
  cls: string
}

const MASTERY_INFO: Record<MasteryLevel, MasteryInfo> = {
  seedling: { emoji: '🌱', labelKey: 'mastery.seedling', cls: 'mastery-seedling' },
  plant: { emoji: '🌿', labelKey: 'mastery.plant', cls: 'mastery-plant' },
  tree: { emoji: '🌳', labelKey: 'mastery.tree', cls: 'mastery-tree' },
}

export function getMasteryInfo(level: MasteryLevel): MasteryInfo {
  return MASTERY_INFO[level]
}
```

- [ ] **Step 3: Create `munbeop/lib/srs/index.ts`**

```typescript
export * from './thresholds'
export * from './weight'
export * from './pick'
export * from './mastery'
```

- [ ] **Step 4: Pass + commit**

```bash
cd munbeop && pnpm test && cd ..
git add munbeop/ && git commit -m "feat(srs): port mastery transitions with i18n-aware label keys"
```

---

## Task 13: Storage adapter + LocalStorage

**Files:** `munbeop/lib/storage/{keys,adapter,localStorage,index}.ts`, `munbeop/tests/unit/storage/localStorage.test.ts`

- [ ] **Step 1: Create `munbeop/lib/storage/keys.ts`**

```typescript
export const STORAGE_KEYS = {
  grammar: 'munbeop.v1.grammar',
  srs: 'munbeop.v1.srs',
  log: 'munbeop.v1.log',
  decks: 'munbeop.v1.decks',
  customContexts: 'munbeop.v1.customContexts',
  inactiveContextIds: 'munbeop.v1.inactiveContextIds',
  locale: 'munbeop.v1.locale',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
```

- [ ] **Step 2: Create `munbeop/lib/storage/adapter.ts`**

```typescript
import type { StorageKey } from './keys'

export interface StorageAdapter {
  read<T>(key: StorageKey, fallback: T): T
  write<T>(key: StorageKey, value: T): void
  remove(key: StorageKey): void
  clear(): void
}
```

- [ ] **Step 3: Failing test** `munbeop/tests/unit/storage/localStorage.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import { STORAGE_KEYS } from '~/lib/storage/keys'

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter
  beforeEach(() => { adapter = new LocalStorageAdapter() })

  it('returns fallback when missing', () => {
    expect(adapter.read(STORAGE_KEYS.grammar, [] as unknown[])).toEqual([])
  })

  it('round-trips values', () => {
    const v = { a: 1, b: ['x', 'y'] }
    adapter.write(STORAGE_KEYS.grammar, v)
    expect(adapter.read(STORAGE_KEYS.grammar, null)).toEqual(v)
  })

  it('returns fallback on malformed JSON', () => {
    localStorage.setItem(STORAGE_KEYS.grammar, '{ not valid')
    expect(adapter.read(STORAGE_KEYS.grammar, 'fb')).toBe('fb')
  })

  it('remove deletes', () => {
    adapter.write(STORAGE_KEYS.log, [1, 2, 3])
    adapter.remove(STORAGE_KEYS.log)
    expect(adapter.read(STORAGE_KEYS.log, null)).toBeNull()
  })

  it('clear wipes known keys only', () => {
    localStorage.setItem('unrelated', 'keep')
    adapter.write(STORAGE_KEYS.grammar, ['a'])
    adapter.clear()
    expect(adapter.read(STORAGE_KEYS.grammar, null)).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
})
```

- [ ] **Step 4: Implement `munbeop/lib/storage/localStorage.ts`**

```typescript
import type { StorageAdapter } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'

export class LocalStorageAdapter implements StorageAdapter {
  read<T>(key: StorageKey, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  write<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('LocalStorageAdapter.write failed', { key, err })
    }
  }

  remove(key: StorageKey): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key)
    }
  }
}
```

- [ ] **Step 5: Create `munbeop/lib/storage/index.ts`**

```typescript
export * from './adapter'
export * from './keys'
export * from './localStorage'
```

- [ ] **Step 6: Pass + commit**

```bash
cd munbeop && pnpm test && cd ..
git add munbeop/ && git commit -m "feat(storage): add StorageAdapter and LocalStorageAdapter with tests"
```

---

## Task 14: Pinia stores — grammar + contexts + locale

**Files:** `munbeop/stores/{grammar,contexts,locale}.ts`

- [ ] **Step 1: Create `munbeop/stores/grammar.ts`**

```typescript
import { defineStore } from 'pinia'
import type { Grammar, Deck } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_GRAMMAR, DEFAULT_DECK } from '~/seed/grammars'

interface GrammarState {
  items: Grammar[]
  decks: Deck[]
  excludedDeckIds: Set<string>
}

const storage = new LocalStorageAdapter()

export const useGrammarStore = defineStore('grammar', {
  state: (): GrammarState => ({
    items: [],
    decks: [],
    excludedDeckIds: new Set(),
  }),
  getters: {
    activeIndices: (state) =>
      state.items
        .map((g, idx) => ({ g, idx }))
        .filter(({ g }) => !state.excludedDeckIds.has(g.deckId))
        .map(({ idx }) => idx),
    grammarByKo: (state) => (ko: string) => state.items.find((g) => g.ko === ko),
  },
  actions: {
    hydrate() {
      this.items = storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
      this.decks = storage.read(STORAGE_KEYS.decks, [] as Deck[])
      if (this.items.length === 0) {
        this.items = [...DEFAULT_GRAMMAR]
        storage.write(STORAGE_KEYS.grammar, this.items)
      }
      if (this.decks.length === 0) {
        this.decks = [DEFAULT_DECK]
        storage.write(STORAGE_KEYS.decks, this.decks)
      }
    },
    toggleDeck(deckId: string) {
      if (this.excludedDeckIds.has(deckId)) {
        this.excludedDeckIds.delete(deckId)
      } else {
        this.excludedDeckIds.add(deckId)
      }
    },
  },
})
```

- [ ] **Step 2: Create `munbeop/stores/contexts.ts`**

```typescript
import { defineStore } from 'pinia'
import type { Context, LocalizedString } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'

interface ContextsState {
  custom: Context[]
  inactiveIds: Set<string>
}

const storage = new LocalStorageAdapter()

export const useContextsStore = defineStore('contexts', {
  state: (): ContextsState => ({
    custom: [],
    inactiveIds: new Set(),
  }),
  getters: {
    all(state): Context[] {
      return [...DEFAULT_CONTEXTS, ...state.custom]
    },
    active(state): Context[] {
      return [...DEFAULT_CONTEXTS, ...state.custom].filter((c) => !state.inactiveIds.has(c.id))
    },
    byId() {
      return (id: string) => this.all.find((c) => c.id === id)
    },
  },
  actions: {
    hydrate() {
      this.custom = storage.read(STORAGE_KEYS.customContexts, [] as Context[])
      const inactive = storage.read(STORAGE_KEYS.inactiveContextIds, [] as string[])
      this.inactiveIds = new Set(inactive)
    },
    toggleActive(id: string) {
      if (this.inactiveIds.has(id)) {
        this.inactiveIds.delete(id)
      } else {
        this.inactiveIds.add(id)
      }
      storage.write(STORAGE_KEYS.inactiveContextIds, [...this.inactiveIds])
    },
    addCustom(name: string, scene: LocalizedString): Context | null {
      const exists = this.all.some((c) => c.name === name)
      if (exists) return null
      const ctx: Context = {
        id: `custom_${Date.now()}`,
        name,
        scene,
        category: 'custom',
        builtin: false,
      }
      this.custom.push(ctx)
      storage.write(STORAGE_KEYS.customContexts, this.custom)
      return ctx
    },
  },
})
```

- [ ] **Step 3: Create `munbeop/stores/locale.ts`**

```typescript
import { defineStore } from 'pinia'
import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

const storage = new LocalStorageAdapter()

function isValid(code: string): code is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(code)
}

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    current: DEFAULT_LOCALE as LocaleCode,
  }),
  actions: {
    hydrate() {
      const stored = storage.read<string>(STORAGE_KEYS.locale, DEFAULT_LOCALE)
      this.current = isValid(stored) ? stored : DEFAULT_LOCALE
    },
    set(code: LocaleCode) {
      this.current = code
      storage.write(STORAGE_KEYS.locale, code)
    },
  },
})
```

- [ ] **Step 4: Typecheck + commit**

```bash
cd munbeop && pnpm typecheck && cd ..
git add munbeop/stores/ && git commit -m "feat(stores): add grammar, contexts, and locale Pinia stores"
```

---

## Task 15: Pinia stores — srs + log

**Files:** `munbeop/stores/{srs,log}.ts`

- [ ] **Step 1: Create `munbeop/stores/srs.ts`**

```typescript
import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>
const storage = new LocalStorageAdapter()

export const useSrsStore = defineStore('srs', {
  state: () => ({ map: {} as SrsMap }),
  actions: {
    hydrate() {
      this.map = storage.read(STORAGE_KEYS.srs, {} as SrsMap)
    },
    ensure(ko: string): SrsState {
      if (!this.map[ko]) this.map[ko] = freshSrs()
      return this.map[ko]!
    },
    weightFor(ko: string, now: number = Date.now()): number {
      return getWeight(this.ensure(ko), now)
    },
    markSeen(ko: string, now: number = Date.now()) {
      this.ensure(ko).lastSeen = now
      storage.write(STORAGE_KEYS.srs, this.map)
    },
    recalculate(ko: string) {
      const log = useLogStore().entries
      this.map[ko] = recalculateMastery(ko, log)
      storage.write(STORAGE_KEYS.srs, this.map)
    },
  },
})
```

- [ ] **Step 2: Create `munbeop/stores/log.ts`**

```typescript
import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

interface LogState { entries: LogEntry[] }
const storage = new LocalStorageAdapter()

export const useLogStore = defineStore('log', {
  state: (): LogState => ({ entries: [] }),
  actions: {
    hydrate() {
      const raw = storage.read(STORAGE_KEYS.log, [] as LogEntry[])
      this.entries = raw.map((e) => ({
        ...e,
        reviewState: (e.reviewState ?? 'unreviewed') as ReviewState,
        errorNote: e.errorNote ?? null,
      }))
    },
    add(p: {
      ko: string
      sentence: string
      feedback: Feedback
      errorNote: string | null
      reviewState: ReviewState
      contextId: string
      contextName: string
    }): LogEntry {
      const entry: LogEntry = {
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        ...p,
      }
      this.entries.unshift(entry)
      storage.write(STORAGE_KEYS.log, this.entries)
      return entry
    },
    setReviewState(id: number, reviewState: ReviewState, errorNote: string | null = null) {
      const entry = this.entries.find((e) => e.id === id)
      if (!entry) return
      entry.reviewState = reviewState
      entry.errorNote = errorNote
      storage.write(STORAGE_KEYS.log, this.entries)
    },
  },
})
```

- [ ] **Step 3: Typecheck + commit**

```bash
cd munbeop && pnpm typecheck && cd ..
git add munbeop/stores/ && git commit -m "feat(stores): add srs and log stores with persistence"
```

---

## Task 16: Practice session logic

**Files:** `munbeop/lib/practice/{session,index}.ts`, `munbeop/tests/unit/practice/session.test.ts`

- [ ] **Step 1: Failing test** `munbeop/tests/unit/practice/session.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createSession, currentPickOf, advanceProgress, isSessionComplete } from '~/lib/practice/session'

const args = { grammarPool: [0, 1, 2, 3, 4], contextPool: ['a', 'b', 'c', 'd', 'e'], weightOf: () => 1, rng: () => 0.5 }

describe('createSession', () => {
  it('3 picks with 3 contexts each, progress 0', () => {
    const s = createSession(args)
    expect(s.picks).toHaveLength(3)
    for (const p of s.picks) { expect(p.contexts).toHaveLength(3); expect(p.progress).toBe(0) }
  })

  it('no repeated grammar', () => {
    const s = createSession(args)
    expect(new Set(s.picks.map((p) => p.grammarIdx)).size).toBe(3)
  })

  it('throws when grammar < 3', () => {
    expect(() => createSession({ ...args, grammarPool: [0, 1] })).toThrow(/at least 3 grammar/i)
  })

  it('throws when contexts < 3', () => {
    expect(() => createSession({ ...args, contextPool: ['a', 'b'] })).toThrow(/at least 3 context/i)
  })
})

describe('currentPickOf', () => {
  it('returns pick at index', () => {
    const s = createSession(args)
    expect(currentPickOf(s, 0)).toBe(s.picks[0])
  })
})

describe('advanceProgress', () => {
  it('increments target pick', () => {
    const s = createSession(args)
    advanceProgress(s, 0)
    expect(s.picks[0]!.progress).toBe(1)
    expect(s.picks[1]!.progress).toBe(0)
  })

  it('caps at 3', () => {
    const s = createSession(args)
    for (let i = 0; i < 4; i++) advanceProgress(s, 0)
    expect(s.picks[0]!.progress).toBe(3)
  })
})

describe('isSessionComplete', () => {
  it('false partial', () => {
    expect(isSessionComplete(createSession(args))).toBe(false)
  })

  it('true when all 3', () => {
    const s = createSession(args)
    for (const p of s.picks) p.progress = 3
    expect(isSessionComplete(s)).toBe(true)
  })
})
```

- [ ] **Step 2: Implement `munbeop/lib/practice/session.ts`**

```typescript
import { pickRandomFrom, weightedPick } from '~/lib/srs'

export interface Pick<G, C> {
  grammarIdx: G
  contexts: C[]
  progress: number
}

export interface Session<G, C> { picks: Pick<G, C>[] }

export interface CreateSessionParams<G, C> {
  grammarPool: readonly G[]
  contextPool: readonly C[]
  weightOf: (g: G) => number
  rng?: () => number
}

const PICK_COUNT = 3
const CONTEXTS_PER_PICK = 3

export function createSession<G, C>(p: CreateSessionParams<G, C>): Session<G, C> {
  const { grammarPool, contextPool, weightOf, rng = Math.random } = p
  if (grammarPool.length < PICK_COUNT) {
    throw new Error(`Need at least 3 grammar items, got ${grammarPool.length}`)
  }
  if (contextPool.length < CONTEXTS_PER_PICK) {
    throw new Error(`Need at least 3 context items, got ${contextPool.length}`)
  }
  const picked = weightedPick(grammarPool, PICK_COUNT, weightOf, rng)
  return {
    picks: picked.map((grammarIdx) => ({
      grammarIdx,
      contexts: pickRandomFrom(contextPool, CONTEXTS_PER_PICK, rng),
      progress: 0,
    })),
  }
}

export function currentPickOf<G, C>(s: Session<G, C>, i: number): Pick<G, C> {
  const p = s.picks[i]
  if (!p) throw new Error(`No pick at index ${i}`)
  return p
}

export function currentContextOf<G, C>(s: Session<G, C>, i: number): C | undefined {
  const p = currentPickOf(s, i)
  return p.contexts[p.progress]
}

export function advanceProgress<G, C>(s: Session<G, C>, i: number): void {
  const p = currentPickOf(s, i)
  if (p.progress < CONTEXTS_PER_PICK) p.progress++
}

export function isSessionComplete<G, C>(s: Session<G, C>): boolean {
  return s.picks.every((p) => p.progress >= CONTEXTS_PER_PICK)
}
```

- [ ] **Step 3: Index + pass + commit**

`munbeop/lib/practice/index.ts`:

```typescript
export * from './session'
```

```bash
cd munbeop && pnpm test && cd ..
git add munbeop/ && git commit -m "feat(practice): add pure session domain logic with tests"
```

---

## Task 17: usePractice composable + useLocalized helper

**Files:** `munbeop/composables/{usePractice,useLocalized,useToast}.ts`

- [ ] **Step 1: Create `munbeop/composables/useToast.ts`**

```typescript
const message = ref<string>('')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(text: string, durationMs = 2500) {
    message.value = text
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, durationMs)
  }
  return { message: readonly(message), visible: readonly(visible), show }
}
```

- [ ] **Step 2: Create `munbeop/composables/useLocalized.ts`**

```typescript
import { localized, type LocaleCode, type LocalizedString } from '~/lib/domain'

/**
 * Reactive helper that renders LocalizedString values using the current i18n locale.
 * Usage in template: {{ tl(grammar.meaning) }}
 */
export function useLocalized() {
  const { locale } = useI18n()
  function tl(value: LocalizedString | undefined): string {
    return localized(value, locale.value as LocaleCode)
  }
  return { tl }
}
```

- [ ] **Step 3: Create `munbeop/composables/usePractice.ts`**

```typescript
import type { Context, Feedback, Grammar, LogEntry, ReviewState } from '~/lib/domain'
import { advanceProgress, createSession, isSessionComplete, type Session } from '~/lib/practice'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

type PracticeSession = Session<number, Context>

export function usePractice() {
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()
  const srsStore = useSrsStore()
  const logStore = useLogStore()
  const { t } = useI18n()

  const session = ref<PracticeSession | null>(null)
  const error = ref<string | null>(null)

  function start() {
    error.value = null
    try {
      const pool = grammarStore.activeIndices
      const activeContexts = contextsStore.active
      if (pool.length < 3) { error.value = t('practice.no_grammars'); return }
      if (activeContexts.length < 3) { error.value = t('practice.no_contexts'); return }
      session.value = createSession<number, Context>({
        grammarPool: pool,
        contextPool: activeContexts,
        weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
      })
      for (const pick of session.value.picks) {
        srsStore.markSeen(grammarStore.items[pick.grammarIdx]!.ko)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  function grammarOf(pickIdx: number): Grammar | null {
    const s = session.value
    if (!s) return null
    const pick = s.picks[pickIdx]
    if (!pick) return null
    return grammarStore.items[pick.grammarIdx] ?? null
  }

  function currentContextOf(pickIdx: number): Context | null {
    const s = session.value
    if (!s) return null
    const pick = s.picks[pickIdx]
    if (!pick) return null
    return pick.contexts[pick.progress] ?? null
  }

  function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
  }): LogEntry | null {
    const s = session.value
    if (!s) return null
    const grammar = grammarOf(p.pickIndex)
    const ctx = currentContextOf(p.pickIndex)
    if (!grammar || !ctx) return null
    const hasNote = p.errorNote !== null && p.errorNote.trim().length > 0
    const reviewState: ReviewState = p.feedback === 'hard' && hasNote ? 'incorrect' : 'unreviewed'
    const entry = logStore.add({
      ko: grammar.ko,
      sentence: p.sentence,
      feedback: p.feedback,
      errorNote: hasNote ? p.errorNote : null,
      reviewState,
      contextId: ctx.id,
      contextName: ctx.name,
    })
    srsStore.recalculate(grammar.ko)
    advanceProgress(s, p.pickIndex)
    return entry
  }

  function reset() { session.value = null; error.value = null }

  const completed = computed(() => (session.value ? isSessionComplete(session.value) : false))

  return {
    session: readonly(session),
    error: readonly(error),
    completed,
    start,
    grammarOf,
    currentContextOf,
    persistEntry,
    reset,
  }
}
```

- [ ] **Step 4: Typecheck + commit**

```bash
cd munbeop && pnpm typecheck && cd ..
git add munbeop/composables/ && git commit -m "feat(composables): add useToast, useLocalized, and i18n-aware usePractice"
```

---

## Task 18: UI primitives

**Files:** `munbeop/components/ui/{PixelButton,PixelCard,PixelInput,Toast}.vue`

- [ ] **Step 1: Create `munbeop/components/ui/PixelButton.vue`**

```vue
<script setup lang="ts">
interface Props { variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; type?: 'button' | 'submit' }
withDefaults(defineProps<Props>(), { variant: 'primary', disabled: false, type: 'button' })
defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="pixel-button"
    :class="[`pixel-button--${variant}`, { 'pixel-button--disabled': disabled }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.pixel-button {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 12px 20px;
  border: 2px solid var(--ink);
  background: var(--jade);
  color: var(--paper);
  cursor: pointer;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  transition: transform 0.08s ease, background 0.15s ease;
  box-shadow: 4px 4px 0 var(--ink);
}
.pixel-button:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--ink); }
.pixel-button:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
.pixel-button--secondary { background: var(--paper-warm); color: var(--ink); }
.pixel-button--danger { background: var(--red); color: var(--paper); }
.pixel-button--disabled, .pixel-button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
```

- [ ] **Step 2: Create `munbeop/components/ui/PixelCard.vue`**

```vue
<script setup lang="ts">
interface Props { accent?: 'red' | 'indigo' | 'jade' | 'gold' }
withDefaults(defineProps<Props>(), { accent: 'jade' })
</script>

<template>
  <div class="pixel-card" :class="`pixel-card--${accent}`">
    <slot />
  </div>
</template>

<style scoped>
.pixel-card { background: var(--paper-warm); border: 2px solid var(--border); border-left-width: 6px; padding: 18px 20px; box-shadow: 4px 4px 0 var(--paper-deep); }
.pixel-card--red { border-left-color: var(--red); }
.pixel-card--indigo { border-left-color: var(--indigo); }
.pixel-card--jade { border-left-color: var(--jade); }
.pixel-card--gold { border-left-color: var(--gold); }
</style>
```

- [ ] **Step 3: Create `munbeop/components/ui/PixelInput.vue`**

```vue
<script setup lang="ts">
interface Props { modelValue: string; placeholder?: string; multiline?: boolean; rows?: number }
withDefaults(defineProps<Props>(), { placeholder: '', multiline: false, rows: 3 })
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <textarea
    v-if="multiline"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    class="pixel-input"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :value="modelValue"
    :placeholder="placeholder"
    class="pixel-input"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.pixel-input { width: 100%; background: var(--paper); color: var(--ink); border: 2px solid var(--border); padding: 10px 12px; font-family: 'Noto Sans KR', 'Inter', sans-serif; font-size: 15px; outline: none; resize: vertical; transition: border-color 0.15s ease; }
.pixel-input:focus { border-color: var(--jade); }
</style>
```

- [ ] **Step 4: Create `munbeop/components/ui/Toast.vue`**

```vue
<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { message, visible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--paper-warm); color: var(--ink); border: 2px solid var(--ink); box-shadow: 4px 4px 0 var(--paper-deep); padding: 12px 18px; font-family: 'Press Start 2P', monospace; font-size: 11px; z-index: 100; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter-from { opacity: 0; transform: translate(-50%, 20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>
```

- [ ] **Step 5: Typecheck + commit**

```bash
cd munbeop && pnpm typecheck && cd ..
git add munbeop/components/ui/ && git commit -m "feat(ui): add PixelButton, PixelCard, PixelInput, Toast primitives"
```

---

## Task 19: LocaleSwitcher component + i18n persist plugin

**Files:** `munbeop/components/layout/LocaleSwitcher.vue`, `munbeop/plugins/i18n-persist.client.ts`

- [ ] **Step 1: Create `munbeop/plugins/i18n-persist.client.ts`**

```typescript
import { useLocaleStore } from '~/stores/locale'
import type { LocaleCode } from '~/lib/domain'

export default defineNuxtPlugin(() => {
  const localeStore = useLocaleStore()
  localeStore.hydrate()
  const { setLocale, locale } = useI18n()
  // Sync stored locale → vue-i18n on app start.
  if (locale.value !== localeStore.current) {
    void setLocale(localeStore.current)
  }
  // Sync vue-i18n changes → store.
  watch(locale, (newLocale) => {
    localeStore.set(newLocale as LocaleCode)
  })
})
```

- [ ] **Step 2: Create `munbeop/components/layout/LocaleSwitcher.vue`**

```vue
<script setup lang="ts">
import type { LocaleCode } from '~/lib/domain'

const { locale, locales, setLocale, t } = useI18n()

const options = computed(() => (locales.value as Array<{ code: string; name: string }>))

function onChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value as LocaleCode
  void setLocale(code)
}
</script>

<template>
  <label class="loc">
    <span class="loc__label">{{ t('common.language') }}</span>
    <select class="loc__select" :value="locale" @change="onChange">
      <option v-for="o in options" :key="o.code" :value="o.code">{{ o.name }}</option>
    </select>
  </label>
</template>

<style scoped>
.loc { display: flex; flex-direction: column; gap: 4px; }
.loc__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  color: var(--muted);
  text-transform: uppercase;
}
.loc__select {
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--border);
  padding: 6px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.loc__select:focus { border-color: var(--jade); }
</style>
```

- [ ] **Step 3: Smoke + commit**

```bash
cd munbeop && pnpm dev
```

Open http://localhost:3000, no console errors. Ctrl+C.

```bash
cd ..
git add munbeop/
git commit -m "feat(i18n): add LocaleSwitcher and i18n-persist client plugin"
```

---

## Task 20: AppShell layout with $t() navigation

**Files:** `munbeop/components/layout/{AppSidebar,MobileNavbar,AppShell}.vue`, `munbeop/layouts/default.vue`

- [ ] **Step 1: Create `munbeop/components/layout/AppSidebar.vue`**

```vue
<script setup lang="ts">
import LocaleSwitcher from './LocaleSwitcher.vue'

const items = [
  { to: '/', labelKey: 'nav.garden', emoji: '🏡', ko: '내 정원' },
  { to: '/practice', labelKey: 'nav.practice', emoji: '🎲', ko: '연습' },
  { to: '/library', labelKey: 'nav.library', emoji: '📚', ko: '도서관' },
  { to: '/stats', labelKey: 'nav.stats', emoji: '📊', ko: '통계' },
  { to: '/log', labelKey: 'nav.log', emoji: '📖', ko: '일기' },
  { to: '/settings', labelKey: 'nav.settings', emoji: '🤖', ko: '설정' },
]
const { t } = useI18n()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <span class="sidebar__brand-ko">문법</span>
      <span class="sidebar__brand-name">Garden</span>
    </div>
    <nav class="sidebar__nav">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span class="sidebar__emoji">{{ item.emoji }}</span>
        <span class="sidebar__label">{{ t(item.labelKey) }}</span>
        <span class="sidebar__ko">{{ item.ko }}</span>
      </NuxtLink>
    </nav>
    <div class="sidebar__footer">
      <LocaleSwitcher />
    </div>
  </aside>
</template>

<style scoped>
.sidebar { position: sticky; top: 0; height: 100vh; width: 220px; background: var(--paper-warm); border-right: 2px solid var(--border); padding: 24px 16px; display: flex; flex-direction: column; gap: 24px; }
.sidebar__brand { display: flex; align-items: baseline; gap: 6px; }
.sidebar__brand-ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 26px; color: var(--jade); }
.sidebar__brand-name { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.sidebar__nav { display: flex; flex-direction: column; gap: 4px; }
.sidebar__link { display: grid; grid-template-columns: 24px 1fr auto; align-items: center; gap: 10px; padding: 10px 12px; color: var(--muted); text-decoration: none; border-left: 3px solid transparent; transition: all 0.15s ease; }
.sidebar__link:hover { background: var(--paper-deep); color: var(--ink); }
.sidebar__link--active { background: var(--paper-deep); color: var(--ink); border-left-color: var(--jade); }
.sidebar__label { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; }
.sidebar__ko { font-family: 'Noto Sans KR', sans-serif; font-size: 11px; color: var(--muted); }
.sidebar__emoji { font-size: 18px; line-height: 1; }
.sidebar__footer { margin-top: auto; }
</style>
```

- [ ] **Step 2: Create `munbeop/components/layout/MobileNavbar.vue`**

```vue
<script setup lang="ts">
const items = [
  { to: '/', emoji: '🏡' },
  { to: '/practice', emoji: '🎲' },
  { to: '/library', emoji: '📚' },
  { to: '/stats', emoji: '📊' },
  { to: '/settings', emoji: '🤖' },
]
</script>

<template>
  <nav class="mobile-nav">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mobile-nav__link"
      active-class="mobile-nav__link--active"
    >
      <span class="mobile-nav__emoji">{{ item.emoji }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.mobile-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: var(--paper-warm); border-top: 2px solid var(--border); display: flex; justify-content: space-around; align-items: center; z-index: 50; }
.mobile-nav__link { flex: 1; display: flex; justify-content: center; align-items: center; height: 100%; text-decoration: none; color: var(--muted); border-top: 3px solid transparent; }
.mobile-nav__link--active { color: var(--jade); border-top-color: var(--jade); background: var(--paper-deep); }
.mobile-nav__emoji { font-size: 22px; }
</style>
```

- [ ] **Step 3: Create `munbeop/components/layout/AppShell.vue`**

```vue
<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import MobileNavbar from './MobileNavbar.vue'
import Toast from '~/components/ui/Toast.vue'
</script>

<template>
  <div class="shell">
    <AppSidebar class="shell__sidebar" />
    <main class="shell__main"><slot /></main>
    <MobileNavbar class="shell__mobile-nav" />
    <Toast />
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.shell__main { padding: 32px 32px 80px; max-width: 1200px; width: 100%; }
.shell__mobile-nav { display: none; }
@media (max-width: 768px) {
  .shell { grid-template-columns: 1fr; }
  .shell__sidebar { display: none; }
  .shell__mobile-nav { display: flex; }
  .shell__main { padding: 16px 16px 80px; }
}
</style>
```

- [ ] **Step 4: Create `munbeop/layouts/default.vue`**

```vue
<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

onMounted(() => {
  useGrammarStore().hydrate()
  useContextsStore().hydrate()
  useSrsStore().hydrate()
  useLogStore().hydrate()
})
</script>

<template>
  <AppShell><slot /></AppShell>
</template>
```

- [ ] **Step 5: Smoke + commit**

```bash
cd munbeop && pnpm dev
```

Verify sidebar nav labels switch when LocaleSwitcher changes. Ctrl+C.

```bash
cd ..
git add munbeop/ && git commit -m "feat(layout): add AppShell with i18n nav + LocaleSwitcher in sidebar"
```

---

## Task 21: Practice card components ($t-aware)

**Files:** `munbeop/components/practice/{ProgressDots,ContextDisplay,SentenceInput,FeedbackRow,ErrorNoteBlock,GrammarCard,CompletionBanner}.vue`

- [ ] **Step 1: `munbeop/components/practice/ProgressDots.vue`**

```vue
<script setup lang="ts">
interface Props { total: number; progress: number }
defineProps<Props>()
</script>

<template>
  <div class="dots">
    <span
      v-for="i in total"
      :key="i"
      class="dot"
      :class="{ 'dot--done': i - 1 < progress, 'dot--current': i - 1 === progress }"
    />
  </div>
</template>

<style scoped>
.dots { display: flex; gap: 10px; justify-content: center; padding: 14px 0; }
.dot { width: 12px; height: 12px; background: var(--border); transition: all 0.3s cubic-bezier(0.3, 1.3, 0.5, 1); }
.dot--current { background: var(--red); transform: scale(1.3); box-shadow: 0 0 0 4px rgba(194, 62, 62, 0.2); }
.dot--done { background: var(--jade); }
</style>
```

- [ ] **Step 2: `munbeop/components/practice/ContextDisplay.vue`**

```vue
<script setup lang="ts">
import type { Context } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

interface Props { context: Context }
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <div class="ctx">
    <div class="ctx__row">
      <span class="ctx__label">{{ t('practice.context_label') }}</span>
      <span class="ctx__name">{{ context.name }}</span>
    </div>
    <div class="ctx__scene">{{ tl(context.scene) }}</div>
  </div>
</template>

<style scoped>
.ctx { padding: 12px 14px; background: rgba(88, 144, 212, 0.08); border-left: 3px solid var(--indigo); margin-bottom: 12px; }
.ctx__row { display: flex; align-items: center; gap: 10px; margin-bottom: 3px; }
.ctx__label { font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--muted); letter-spacing: 0.15em; }
.ctx__name { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 17px; color: var(--indigo); }
.ctx__scene { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--muted); }
</style>
```

- [ ] **Step 3: `munbeop/components/practice/SentenceInput.vue`**

```vue
<script setup lang="ts">
import PixelInput from '~/components/ui/PixelInput.vue'

interface Props { modelValue: string }
defineProps<Props>()
defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()
</script>

<template>
  <PixelInput
    :model-value="modelValue"
    :placeholder="t('practice.sentence_placeholder')"
    multiline
    :rows="3"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
```

- [ ] **Step 4: `munbeop/components/practice/FeedbackRow.vue`**

```vue
<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'
defineEmits<{ easy: []; hard: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="fb">
    <PixelButton variant="primary" @click="$emit('easy')">{{ t('practice.fb_easy') }}</PixelButton>
    <PixelButton variant="danger" @click="$emit('hard')">{{ t('practice.fb_hard') }}</PixelButton>
  </div>
</template>

<style scoped>
.fb { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
</style>
```

- [ ] **Step 5: `munbeop/components/practice/ErrorNoteBlock.vue`**

```vue
<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'
import PixelInput from '~/components/ui/PixelInput.vue'

interface Props { modelValue: string }
defineProps<Props>()
defineEmits<{ 'update:modelValue': [string]; save: []; skip: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="enote">
    <div class="enote__label">{{ t('practice.error_note_label') }}</div>
    <PixelInput
      :model-value="modelValue"
      :placeholder="t('practice.error_note_placeholder')"
      multiline
      :rows="2"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="enote__actions">
      <PixelButton variant="danger" @click="$emit('save')">{{ t('practice.save_with_note') }}</PixelButton>
      <PixelButton variant="secondary" @click="$emit('skip')">{{ t('practice.skip_note') }}</PixelButton>
    </div>
  </div>
</template>

<style scoped>
.enote { margin-top: 14px; padding: 14px; background: rgba(194, 62, 62, 0.08); border-left: 3px solid var(--red); }
.enote__label { font-family: 'Press Start 2P', monospace; font-size: 9px; color: var(--red); margin-bottom: 8px; letter-spacing: 0.1em; }
.enote__actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
</style>
```

- [ ] **Step 6: `munbeop/components/practice/GrammarCard.vue`**

```vue
<script setup lang="ts">
import type { Context, Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import { useLocalized } from '~/composables/useLocalized'
import PixelCard from '~/components/ui/PixelCard.vue'
import ContextDisplay from './ContextDisplay.vue'
import ProgressDots from './ProgressDots.vue'
import SentenceInput from './SentenceInput.vue'
import FeedbackRow from './FeedbackRow.vue'
import ErrorNoteBlock from './ErrorNoteBlock.vue'

interface Props { grammar: Grammar; context: Context; progress: number; pickIndex: number }
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [{ pickIndex: number; feedback: 'easy' | 'hard'; errorNote: string | null }] }>()

const srs = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const masteryInfo = computed(() => getMasteryInfo(srs.ensure(props.grammar.ko).mastery))

const sentence = ref('')
const showErrorBlock = ref(false)
const errorNote = ref('')

function onEasy() {
  if (!sentence.value.trim()) return
  emit('submit', { pickIndex: props.pickIndex, feedback: 'easy', errorNote: null })
  sentence.value = ''; showErrorBlock.value = false; errorNote.value = ''
}
function onHard() {
  if (!sentence.value.trim()) return
  showErrorBlock.value = true
}
function onSaveWithNote() {
  emit('submit', { pickIndex: props.pickIndex, feedback: 'hard', errorNote: errorNote.value.trim() })
  sentence.value = ''; showErrorBlock.value = false; errorNote.value = ''
}
function onSkipNote() {
  emit('submit', { pickIndex: props.pickIndex, feedback: 'hard', errorNote: null })
  sentence.value = ''; showErrorBlock.value = false; errorNote.value = ''
}
</script>

<template>
  <PixelCard accent="jade">
    <div class="header">
      <div class="ko">{{ grammar.ko }}</div>
      <div class="mastery">{{ masteryInfo.emoji }} {{ t(masteryInfo.labelKey) }}</div>
    </div>
    <div class="meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="example">{{ grammar.example }}</div>
    <div v-if="grammar.trans" class="trans">{{ tl(grammar.trans) }}</div>

    <ProgressDots :total="3" :progress="progress" />
    <ContextDisplay :context="context" />
    <SentenceInput v-model="sentence" />
    <FeedbackRow @easy="onEasy" @hard="onHard" />
    <ErrorNoteBlock v-if="showErrorBlock" v-model="errorNote" @save="onSaveWithNote" @skip="onSkipNote" />
  </PixelCard>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; }
.ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 24px; color: var(--ink); }
.mastery { font-family: 'Press Start 2P', monospace; font-size: 9px; color: var(--muted); }
.meaning { font-family: 'Inter', sans-serif; color: var(--muted); margin: 8px 0 12px; font-size: 15px; }
.example { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); }
.trans { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--muted); margin-top: 4px; }
</style>
```

- [ ] **Step 7: `munbeop/components/practice/CompletionBanner.vue`**

```vue
<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'
import PixelCard from '~/components/ui/PixelCard.vue'
defineEmits<{ restart: [] }>()
const { t } = useI18n()
</script>

<template>
  <PixelCard accent="jade">
    <div class="banner">
      <div class="banner__ko">{{ t('practice.completion_ko') }}</div>
      <div class="banner__txt">{{ t('practice.completion_text') }}</div>
      <PixelButton variant="primary" @click="$emit('restart')">{{ t('practice.completion_restart') }}</PixelButton>
    </div>
  </PixelCard>
</template>

<style scoped>
.banner { text-align: center; }
.banner__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 22px; margin-bottom: 6px; }
.banner__txt { font-family: 'Inter', sans-serif; color: var(--muted); margin-bottom: 14px; }
</style>
```

- [ ] **Step 8: Typecheck + commit**

```bash
cd munbeop && pnpm typecheck && cd ..
git add munbeop/components/practice/ && git commit -m "feat(practice): add i18n-aware card components"
```

---

## Task 22: Practice page wiring

**Files:** `munbeop/pages/practice.vue`

- [ ] **Step 1: Create `munbeop/pages/practice.vue`**

```vue
<script setup lang="ts">
import GrammarCard from '~/components/practice/GrammarCard.vue'
import CompletionBanner from '~/components/practice/CompletionBanner.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import { usePractice } from '~/composables/usePractice'
import { useToast } from '~/composables/useToast'

const { session, error, completed, start, grammarOf, currentContextOf, persistEntry, reset } = usePractice()
const toast = useToast()
const { t } = useI18n()

function onStart() {
  start()
  if (error.value) toast.show(error.value)
}

function onSubmit(payload: { pickIndex: number; feedback: 'easy' | 'hard'; errorNote: string | null }) {
  const entry = persistEntry(payload)
  if (entry) {
    toast.show(payload.feedback === 'easy' ? t('practice.toast_saved_easy') : t('practice.toast_saved_hard'))
  }
}

function onRestart() { reset(); onStart() }
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">연습</span>
      <span class="title__es">{{ t('title.practice') }}</span>
    </h1>

    <div v-if="!session" class="intro">
      <p class="intro__text">{{ t('practice.intro_lead') }}</p>
      <PixelButton variant="primary" @click="onStart">{{ t('practice.spin') }}</PixelButton>
    </div>

    <div v-else class="session">
      <div v-for="(pick, i) in session.picks" :key="i" class="card-slot">
        <GrammarCard
          v-if="grammarOf(i) && currentContextOf(i) && pick.progress < 3"
          :grammar="grammarOf(i)!"
          :context="currentContextOf(i)!"
          :progress="pick.progress"
          :pick-index="i"
          @submit="onSubmit"
        />
      </div>
      <CompletionBanner v-if="completed" @restart="onRestart" />
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 24px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.intro { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; text-align: center; }
.intro__text { font-family: 'Inter', sans-serif; color: var(--muted); margin-bottom: 18px; line-height: 1.5; }
.session { display: flex; flex-direction: column; gap: 20px; }
</style>
```

- [ ] **Step 2: Manual smoke test the practice loop**

```bash
cd munbeop && pnpm dev
```

Checklist:
- [ ] /practice loads in 8 languages (switch via sidebar LocaleSwitcher)
- [ ] GIRAR/GO button text changes per locale
- [ ] Click GO → 3 grammar cards appear, meanings shown in current locale
- [ ] Write sentence → EASY → advance, sentence cleared
- [ ] After 9 submissions → CompletionBanner appears in current locale
- [ ] DevTools → Application → Local Storage → 9 entries in `munbeop.v1.log`
- [ ] Switch locale → page text updates, content (grammar meanings) updates too

Ctrl+C.

- [ ] **Step 3: Commit**

```bash
cd ..
git add munbeop/pages/practice.vue && git commit -m "feat(practice): wire i18n-aware 3x3 loop on /practice page"
```

---

## Task 23: Library page (Herbolario) with localized content

**Files:** `munbeop/pages/library.vue`

- [ ] **Step 1: Create `munbeop/pages/library.vue`**

```vue
<script setup lang="ts">
import PixelCard from '~/components/ui/PixelCard.vue'
import { getMasteryInfo } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'
import { useLocalized } from '~/composables/useLocalized'

const grammarStore = useGrammarStore()
const srsStore = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()

const items = computed(() =>
  grammarStore.items.map((g) => ({
    grammar: g,
    info: getMasteryInfo(srsStore.ensure(g.ko).mastery),
  })),
)
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">도서관</span>
      <span class="title__es">{{ t('title.library') }}</span>
    </h1>
    <p class="lead">{{ t('library.lead') }}</p>

    <div class="grid">
      <PixelCard
        v-for="item in items"
        :key="item.grammar.ko"
        :accent="item.info.cls === 'mastery-tree' ? 'jade' : item.info.cls === 'mastery-plant' ? 'gold' : 'indigo'"
      >
        <div class="item__head">
          <span class="item__ko">{{ item.grammar.ko }}</span>
          <span class="item__badge">{{ item.info.emoji }} {{ t(item.info.labelKey) }}</span>
        </div>
        <div class="item__meaning">{{ tl(item.grammar.meaning) }}</div>
        <div v-if="item.grammar.example" class="item__example">{{ item.grammar.example }}</div>
        <div v-if="item.grammar.trans" class="item__trans">{{ tl(item.grammar.trans) }}</div>
      </PixelCard>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.lead { font-family: 'Inter', sans-serif; color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.item__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
.item__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 18px; color: var(--ink); }
.item__badge { font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--muted); }
.item__meaning { font-family: 'Inter', sans-serif; color: var(--muted); font-size: 14px; }
.item__example { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); margin-top: 8px; }
.item__trans { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--muted); margin-top: 2px; }
</style>
```

- [ ] **Step 2: Smoke + commit**

```bash
cd munbeop && pnpm dev
```

Verify /library renders all 14 cards and meanings switch with locale. Ctrl+C.

```bash
cd ..
git add munbeop/pages/library.vue && git commit -m "feat(library): add Herbolario read-only page with localized grammar meanings"
```

---

## Task 24: Placeholder pages (i18n-aware)

**Files:** `munbeop/pages/{index,stats,log,settings}.vue`

- [ ] **Step 1: `munbeop/pages/index.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">내 정원</span>
      <span class="title__es">{{ t('title.garden') }}</span>
    </h1>
    <div class="empty">
      <p>{{ t('empty.garden') }}</p>
      <p><NuxtLink to="/practice">→ {{ t('common.go_to_practice') }}</NuxtLink></p>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.empty { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; font-family: 'Inter', sans-serif; color: var(--muted); line-height: 1.6; }
.empty a { color: var(--jade); text-decoration: underline; }
</style>
```

- [ ] **Step 2: `munbeop/pages/stats.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">통계</span>
      <span class="title__es">{{ t('title.stats') }}</span>
    </h1>
    <div class="empty">{{ t('empty.stats') }}</div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.empty { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; font-family: 'Inter', sans-serif; color: var(--muted); }
</style>
```

- [ ] **Step 3: `munbeop/pages/log.vue`**

```vue
<script setup lang="ts">
import { useLogStore } from '~/stores/log'
const logStore = useLogStore()
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">일기</span>
      <span class="title__es">{{ t('title.log') }}</span>
    </h1>
    <div v-if="logStore.entries.length === 0" class="empty">{{ t('empty.log') }}</div>
    <ul v-else class="list">
      <li v-for="e in logStore.entries.slice(0, 20)" :key="e.id" class="entry">
        <div class="entry__head">
          <span class="entry__ko">{{ e.ko }}</span>
          <span class="entry__date">{{ new Date(e.date).toLocaleString() }}</span>
        </div>
        <div class="entry__sentence">{{ e.sentence }}</div>
        <div class="entry__meta">{{ e.contextName }} · {{ e.feedback === 'easy' ? t('practice.fb_easy') : t('practice.fb_hard') }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.empty { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; font-family: 'Inter', sans-serif; color: var(--muted); }
.list { list-style: none; display: flex; flex-direction: column; gap: 10px; padding: 0; }
.entry { background: var(--paper-warm); border-left: 3px solid var(--indigo); padding: 12px 16px; }
.entry__head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
.entry__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; }
.entry__date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); }
.entry__sentence { font-family: 'Noto Sans KR', sans-serif; font-size: 15px; }
.entry__meta { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--muted); margin-top: 4px; }
</style>
```

- [ ] **Step 4: `munbeop/pages/settings.vue`**

```vue
<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">설정</span>
      <span class="title__es">{{ t('title.settings') }}</span>
    </h1>
    <div class="card">
      <LocaleSwitcher />
    </div>
    <div class="empty">{{ t('empty.settings') }}</div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.title { display: flex; align-items: baseline; gap: 10px; }
.title__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 900; font-size: 32px; color: var(--jade); }
.title__es { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.card { background: var(--paper-warm); border: 2px solid var(--border); padding: 20px; max-width: 320px; }
.empty { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; font-family: 'Inter', sans-serif; color: var(--muted); }
</style>
```

- [ ] **Step 5: Smoke all routes**

```bash
cd munbeop && pnpm dev
```

Navigate: /, /practice, /library, /stats, /log, /settings. Switch locale on each. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
cd ..
git add munbeop/pages/ && git commit -m "feat(pages): add i18n-aware placeholders for index, stats, log, settings"
```

---

## Task 25: Final smoke + README + tag

**Files:** root `README.md`, `munbeop/README.md`

- [ ] **Step 1: Full test + lint + typecheck + build**

```bash
cd munbeop
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: 0 errors across all four.

- [ ] **Step 2: Preview**

```bash
pnpm preview
```

Smoke test all 8 locales. Ctrl+C.

- [ ] **Step 3: Replace root `README.md`**

```markdown
# 문법Garden 🌱

App de gramática coreana contextual con SRS adaptativo. En proceso de rewrite de un prototipo PWA single-file (v2.22, en `index.html`) a una app Nuxt 3 modular multi-idioma (en `munbeop/`).

## Idiomas soportados (i18n día uno)

🇬🇧 English · 🇪🇸 Español · 🇫🇷 Français · 🇧🇷 Português (Brasil) · 🇹🇭 ไทย · 🇮🇩 Bahasa Indonesia · 🇻🇳 Tiếng Việt · 🇯🇵 日本語

## Estructura

- `index.html` — legacy v2.22 (PWA single-file, sigue siendo la versión live)
- `munbeop/` — nueva app Nuxt 3 + TypeScript + Pinia + @nuxtjs/i18n (en desarrollo)
- `AUDIT.md` — auditoría del legacy
- `docs/superpowers/plans/` — planes de implementación

## App nueva

```bash
cd munbeop
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # Vitest
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc
pnpm build        # producción
```

Requisitos: Node 20+, pnpm 9+.

## Estado del rewrite

✅ **Plan 1 (Foundation MVP + i18n) — completado:**
- Bootstrap Nuxt 3 + TypeScript strict
- @nuxtjs/i18n con 8 idiomas (UI + contenido de dominio)
- Algoritmo SRS portado del legacy con cobertura de tests
- Stores Pinia + storage abstraction
- Loop de práctica 3×3 funcional local en 8 idiomas
- UI primitivas pixel art + layout sidebar/navbar
- LocaleSwitcher con persistencia

🚧 Próximos planes: Supabase + Auth, IA validadora, Modo Mazmorra, Mascota, Mapa Jardín, Cosméticos, Landing, Capacitor, Importer legacy.
```

- [ ] **Step 4: Create `munbeop/README.md`**

```markdown
# munbeop-garden-app

Nueva app Nuxt 3 de Munbeop Garden. Reemplazará el legacy `../index.html` v2.22 progresivamente.

## Stack

- Nuxt 3.13 + Vue 3.5 + TypeScript strict
- Pinia (state) + composables (reactividad de dominio)
- @nuxtjs/i18n 8 (vue-i18n 9) — **8 idiomas baked-in**
- Tailwind 3 + design tokens CSS para pixel art
- Vitest + happy-dom + @vue/test-utils

## Idiomas

`en` · `es` · `fr` · `pt-BR` · `th` · `id` · `vi` · `ja`

Default: detección de browser, fallback a `en`. Cambio en caliente vía LocaleSwitcher. Persistencia en `localStorage` bajo `munbeop.v1.locale`.

## Arquitectura

```
lib/         # lógica pura sin Vue: domain, srs, practice, storage
locales/     # JSON por locale
stores/      # Pinia stores con persistencia
composables/ # Vue reactivity adapters
components/  # UI puro
pages/       # routing Nuxt
seed/        # datos iniciales con LocalizedString
plugins/     # i18n-persist client plugin
```

**Reglas:**
- ≤200 LOC por componente Vue, ≤150 por `lib/`
- Ningún string visible hardcoded — `$t()` siempre
- Contenido de dominio (meaning/trans/scene): `LocalizedString` + `useLocalized().tl()`
- Coreano (`ko`, `name`, `example`) NO se traduce

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Dev server HMR |
| `pnpm test` | Vitest una vez |
| `pnpm test:watch` | Vitest watch |
| `pnpm test:ui` | Vitest UI |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | vue-tsc |
| `pnpm build` | Producción |
| `pnpm preview` | Sirve build |

## Calidad de traducciones

UI y contenido seed traducidos a 8 idiomas. Las traducciones a `th/id/vi` son best-effort de IA — flag para revisión por hablante nativo antes de producción.
```

- [ ] **Step 5: Final commit + tag**

```bash
cd ..
git add README.md munbeop/README.md
git commit -m "docs: update READMEs to reflect Plan 1 + i18n completion"
git tag -a plan1-foundation-i18n -m "Plan 1: Foundation MVP with 8-language i18n baked-in"
```

---

## Roadmap of remaining plans

| Plan | Título | Outcome |
|---|---|---|
| 2 | Supabase + Auth + sync | Tablas con RLS, `SupabaseAdapter` implementando `StorageAdapter`, sync bidireccional |
| 3 | IA validadora | Edge Function `validate-sentence`; reemplaza easy/hard por validación real con OpenAI/Anthropic |
| 4 | Modo Mazmorra | Novela visual + cronómetro + 3 intentos + XP gauge + music 8-bit (Howler) |
| 5 | Mascota Jardinera Sabia | Spritesheets emociones, estados, animaciones GSAP |
| 6 | Mapa Mi Jardín | Mapa 2D pixel art por zonas TOPIK, plantas con estado mastery visible |
| 7 | Inventario + cosméticos | Drops por mazmorra Perfect!, tienda, equipamiento |
| 8 | Landing page | Parallax + simulador GBA + copy magnético en 8 idiomas |
| 9 | Capacitor build | iOS/Android nativo con splash, íconos, push |
| 10 | Importer legacy v2→v3 | UI onboarding, lee JSON export legacy, mapea a Supabase |

---

## Self-Review

**1. Spec coverage:** Plan 1 cubre Foundation + i18n. Tareas mapean a: bootstrap (1-5), i18n infra (6), tipos locale-aware (7), seed traducido (8), SRS (9-12), storage (13), stores incluyendo locale (14-15), practice domain (16), composables (17), UI (18-22), pages (23-24), cierre (25).

**2. Placeholders:** ninguno. Todos los pasos llevan código concreto, paths exactos, comandos exactos. Las traducciones `th/id/vi` están marcadas best-effort pero presentes en su totalidad.

**3. Type consistency:** verificado — `Grammar.ko`, `LogEntry.ko`, `SrsState`, `MasteryLevel`, `Feedback`, `ReviewState`, `LocaleCode`, `LocalizedString` usados consistentemente. `useLocalized().tl()` y `t()` (vue-i18n) separan claramente contenido vs UI strings. `MasteryInfo.labelKey` reemplaza el `label` directo para permitir traducción en runtime.
