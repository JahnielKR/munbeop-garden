# Garden Loading-State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the garden hero's winter-flash on hard reload with a calm loading skeleton, gated on `appStatus.status`.

**Architecture:** A pure `heroState(status, logEmpty)` helper picks the hero branch; a new `GardenSkeleton.vue` renders while not `'ready'`; `index.vue` adds the skeleton branch before the existing EmptyPlot/tree branches. No change to the hydration flow.

**Tech Stack:** Nuxt 4 (SPA) + Vue 3 `<script setup>` + Vitest + @vue/test-utils. Spec: `docs/superpowers/specs/2026-06-23-garden-loading-state-design.md`.

**Conventions (verified):** app under `munbeop/`, **pnpm** (no install, no package-lock). Commands `pnpm run test -- <path>` / `pnpm run typecheck` / `pnpm run lint`. Branch `claude/loading-state` — verify `git rev-parse --abbrev-ref HEAD` before each commit. Never `git add -A`. `DataStatus` is exported from `~/stores/appStatus`. Global i18n key-echo stub in component tests (no local i18n mock needed).

---

## Task 1: Pure heroState helper

**Files:** Create `munbeop/app/lib/garden/loading.ts`; Test `munbeop/tests/unit/garden/loading.test.ts`

- [ ] **Step 1: Failing test** — `munbeop/tests/unit/garden/loading.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { heroState } from '~/lib/garden/loading'

describe('heroState', () => {
  it('is loading until the data is ready', () => {
    expect(heroState('idle', false)).toBe('loading')
    expect(heroState('loading', true)).toBe('loading')
    expect(heroState('error', false)).toBe('loading')
  })
  it('is empty when ready with no log entries', () => {
    expect(heroState('ready', true)).toBe('empty')
  })
  it('is tree when ready with entries', () => {
    expect(heroState('ready', false)).toBe('tree')
  })
})
```

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm run test -- tests/unit/garden/loading.test.ts`)

- [ ] **Step 3: Implement** — `munbeop/app/lib/garden/loading.ts`:
```ts
import type { DataStatus } from '~/stores/appStatus'

export type HeroState = 'loading' | 'empty' | 'tree'

/** Which garden-hero branch to render. Skeleton until the data is ready. */
export function heroState(status: DataStatus, logEmpty: boolean): HeroState {
  if (status !== 'ready') return 'loading'
  return logEmpty ? 'empty' : 'tree'
}
```

- [ ] **Step 4: Run → PASS** (3 tests). `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/lib/garden/loading.ts munbeop/tests/unit/garden/loading.test.ts
git commit -m "feat(garden-loading): pure heroState gate helper"
```

---

## Task 2: GardenSkeleton component

**Files:** Create `munbeop/app/components/garden/GardenSkeleton.vue`; Test `munbeop/tests/components/garden/GardenSkeleton.test.ts`

- [ ] **Step 1: Failing test** — `munbeop/tests/components/garden/GardenSkeleton.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GardenSkeleton from '~/components/garden/GardenSkeleton.vue'

describe('GardenSkeleton', () => {
  it('renders a status region labelled with garden.loading', () => {
    const w = mount(GardenSkeleton, { global: { mocks: { $t: (k: string) => k } } })
    const status = w.get('[role="status"]')
    expect(status.attributes('aria-label')).toBe('garden.loading')
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implement** — `munbeop/app/components/garden/GardenSkeleton.vue`:
```vue
<!-- app/components/garden/GardenSkeleton.vue -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="garden-skeleton" role="status" :aria-label="t('garden.loading')">
    <div class="garden-skeleton__plot" aria-hidden="true">
      <span class="garden-skeleton__seed">🌱</span>
    </div>
  </div>
</template>

<style scoped>
.garden-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
.garden-skeleton__plot {
  width: 160px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 3px dashed var(--border-strong, var(--border));
  border-radius: 8px;
  animation: garden-skeleton-pulse 1.4s var(--ease-out, ease-in-out) infinite;
}
.garden-skeleton__seed {
  font-size: 40px;
  filter: saturate(0.4);
}
@keyframes garden-skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .garden-skeleton__plot { animation: none; }
}
</style>
```

- [ ] **Step 4: Run → PASS**. `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/components/garden/GardenSkeleton.vue munbeop/tests/components/garden/GardenSkeleton.test.ts
git commit -m "feat(garden-loading): calm GardenSkeleton placeholder"
```

---

## Task 3: Wire the skeleton branch into index.vue

**Files:** Modify `munbeop/app/pages/index.vue`

- [ ] **Step 1: Add imports + the hero computed**

In `munbeop/app/pages/index.vue` `<script setup>`, add these imports near the others:
```ts
import GardenSkeleton from '~/components/garden/GardenSkeleton.vue'
import { heroState } from '~/lib/garden/loading'
import { useAppStatus } from '~/stores/appStatus'
```
After the existing store setup (the file already has `const logStore = useLogStore()`), add:
```ts
const appStatus = useAppStatus()
const hero = computed(() => heroState(appStatus.status, logStore.entries.length === 0))
```
(`computed` is already imported in this file.)

- [ ] **Step 2: Add the skeleton branch in the template**

The existing hero `<Transition>` block is:
```vue
    <Transition name="garden-fade" mode="out-in">
      <EmptyPlot
        v-if="view === 'hero' && onboarding.showEmptyPlot.value"
        key="empty"
        @start="onboarding.start()"
      />

      <div v-else-if="view === 'hero'" key="hero" class="page__view">
```
Change it to add a skeleton branch first and key the others off `hero`:
```vue
    <Transition name="garden-fade" mode="out-in">
      <GardenSkeleton v-if="view === 'hero' && hero === 'loading'" key="skeleton" />

      <EmptyPlot
        v-else-if="view === 'hero' && hero === 'empty'"
        key="empty"
        @start="onboarding.start()"
      />

      <div v-else-if="view === 'hero'" key="hero" class="page__view">
```
Leave the rest of the block (the tree `<div>` body and the `<GardenGrove v-else …>`) unchanged.

> Note: `hero === 'empty'` is `ready && logEmpty` — identical to the old
> `onboarding.showEmptyPlot.value` condition, so EmptyPlot behaves exactly as
> before once data is ready; the only new behavior is the skeleton while loading.

- [ ] **Step 3: Typecheck + lint + boot-free check**

`cd munbeop && pnpm run typecheck` → PASS. `cd munbeop && pnpm run lint` → 0 errors.

- [ ] **Step 4: Commit**
```bash
git add munbeop/app/pages/index.vue
git commit -m "feat(garden-loading): show GardenSkeleton until the garden data is ready"
```

---

## Task 4: i18n garden.loading + parity

**Files:** Modify `munbeop/i18n/locales/*.json`; Test `munbeop/tests/unit/i18n/garden-loading-keys.test.ts`

- [ ] **Step 1: Failing parity test** — `munbeop/tests/unit/i18n/garden-loading-keys.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
function dig(o: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o)
}

describe('garden.loading i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines garden.loading`, () => {
      const v = dig(msgs, 'garden.loading')
      expect(typeof v, `${code} garden.loading`).toBe('string')
      expect((v as string).length).toBeGreaterThan(0)
    })
  }
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Add `garden.loading` to all 8 locales via a throwaway script**

Create `add-garden-loading.mjs` at the repo root:
```js
import { readFileSync, writeFileSync } from 'node:fs'
const dir = 'munbeop/i18n/locales'
const T = {
  en: 'Growing your garden…',
  es: 'Cultivando tu jardín…',
  fr: 'Culture de ton jardin…',
  'pt-BR': 'Cultivando seu jardim…',
  th: 'กำลังปลูกสวนของคุณ…',
  id: 'Menumbuhkan tamanmu…',
  vi: 'Đang vun trồng khu vườn của bạn…',
  ja: '庭を育てています…',
}
for (const [code, val] of Object.entries(T)) {
  const file = `${dir}/${code}.json`
  const obj = JSON.parse(readFileSync(file, 'utf8'))
  obj.garden = { ...obj.garden, loading: val }
  writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
}
console.log('done')
```
Run it, then verify the diff only touches `garden.loading` per file:
```bash
node add-garden-loading.mjs && git diff --stat -- munbeop/i18n/locales
```
Then delete it: `rm add-garden-loading.mjs`.

- [ ] **Step 4: Run the parity test → PASS** (8). `cd munbeop && pnpm run test -- tests/unit/i18n` + `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/i18n/locales munbeop/tests/unit/i18n/garden-loading-keys.test.ts
git commit -m "feat(garden-loading): garden.loading i18n across 8 locales"
```

---

## Task 5: Full-suite gate

- [ ] **Step 1:** `cd munbeop && pnpm run test` → green. `pnpm run typecheck` → 0. `pnpm run lint` → 0 errors.
- [ ] **Step 2 (if fixups):** `git add -- munbeop && git commit -m "test(garden-loading): full-suite gate green"`

---

## Self-Review

**Spec coverage:** Decision 1 (garden-only) → Task 3 edits only index.vue's hero. Decision 2 (appStatus signal) → Task 1 `heroState` + Task 3 `hero` computed. Decision 3 (error → skeleton) → `heroState` returns 'loading' for `'error'`. Decision 4 (skeleton component) → Task 2. Decision 5 (pure gate) → Task 1.

**Type consistency:** `heroState(status: DataStatus, logEmpty: boolean): HeroState` defined in Task 1, consumed in Task 3's `hero` computed. `DataStatus` imported from `~/stores/appStatus` in both the helper and (implicitly via `appStatus.status`) the page.

**No placeholders:** every step has concrete code; the throwaway i18n script is deleted before the commit and gated by the parity test.
