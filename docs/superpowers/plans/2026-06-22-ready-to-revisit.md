# "Ready to revisit" soft due-count — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A calm "N plants ready to revisit" count on the garden home, derived on the fly from `SrsState` (per-mastery interval, self-healing), plus a one-tap session that draws from the due items.

**Architecture:** A pure `due.ts` (interval + `dueKos` + `revisitPool`) feeds a thin `useReadyCount` composable, which drives a gentle `ReadyToRevisit` link on the garden home. Tapping it opens `/practice/ruleta?revisit=due`, which builds a due-first pool (padded to ≥3 from the active pool) and reuses the existing `usePractice.start({ customDeckGrammarKos })` draw. `getWeight`/`createSession`/`usePractice` are untouched — the engine's `timeFactor` already over-draws due items, so there is no `dueBonus`. No migration.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia setup stores, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). Package manager: **pnpm**.

**Spec:** `docs/superpowers/specs/2026-06-22-ready-to-revisit-design.md`

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`.
- `useI18n().t` is a key-echo stub in tests (`t('a.b', {n:9})` → `'a.b 9'`); reactivity primitives + `useLocalized` are test globals (`tests/setup.ts`). `NuxtLink` resolves to `<a href>` via the `#components` stub.
- `~` → `app/`. Barrel: `app/lib/srs/index.ts`.
- i18n parity is enforced per-feature (e.g. `tests/unit/i18n/stats-keys.test.ts`) by importing all 8 locale JSONs and asserting each key is a non-empty string.
- **vitest gotcha (from Step 11):** `vi.mock(...)` is hoisted, so keep the SUT `import` at the TOP of the test file (the `import/first` lint rule fails otherwise). Type-only imports that resolve wrongly pass vitest (esbuild strips types) but fail `vue-tsc` — `pnpm typecheck` is the real gate for them.
- Single-file test run: `pnpm exec vitest run <path>`. Full suite: `pnpm test`. Lint: `pnpm lint`. Types: `pnpm typecheck`.

**Key facts the implementer must respect:**
- `SrsState = { lastSeen: number|null, easyCount, hardCount, mastery: 'seedling'|'plant'|'tree' }` (`app/lib/domain/mastery.ts`). `daysSinceSeen(lastSeen, now)` lives in `app/lib/srs/weight.ts` and floors to whole days; `lastSeen` is Unix ms.
- `usePractice.start({ customDeckGrammarKos })` already draws a weighted session from an arbitrary ko set and errors with `practice.no_grammars` when the mapped pool < 3. **Do not modify it.**
- The garden home (`app/pages/index.vue`) renders `DailyGoalRing` and a `page__rain-hint` `NuxtLink` to `/log`. The new hint is a sibling — keep it visually distinct and never overload the rain.

---

## Task 1: Pure due logic — `due.ts`

**Files:**
- Create: `munbeop/app/lib/srs/due.ts`
- Modify: `munbeop/app/lib/srs/index.ts`
- Test: `munbeop/tests/unit/srs/due.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/srs/due.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  reviewIntervalDays,
  isDue,
  dueKos,
  revisitPool,
  DUE_INTERVAL_DAYS,
  DUE_MIN_INTERVAL,
} from '~/lib/srs/due'
import type { SrsState } from '~/lib/domain'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 5, 22)
const srs = (over: Partial<SrsState> = {}): SrsState => ({
  lastSeen: NOW - 3 * DAY,
  easyCount: 0,
  hardCount: 0,
  mastery: 'plant',
  ...over,
})
const seenDaysAgo = (n: number, over: Partial<SrsState> = {}) => srs({ lastSeen: NOW - n * DAY, ...over })

describe('reviewIntervalDays', () => {
  it('uses the per-mastery base when not net-hard', () => {
    expect(reviewIntervalDays(srs({ mastery: 'seedling', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.seedling)
    expect(reviewIntervalDays(srs({ mastery: 'plant', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.plant)
    expect(reviewIntervalDays(srs({ mastery: 'tree', easyCount: 1 }))).toBe(DUE_INTERVAL_DAYS.tree)
  })
  it('shortens the interval when hardCount > easyCount', () => {
    expect(reviewIntervalDays(srs({ mastery: 'plant', hardCount: 2, easyCount: 0 }))).toBe(2.5) // 5 * 0.5
    expect(reviewIntervalDays(srs({ mastery: 'tree', hardCount: 3, easyCount: 1 }))).toBe(6) // 12 * 0.5
  })
  it('never goes below DUE_MIN_INTERVAL', () => {
    expect(reviewIntervalDays(srs({ mastery: 'seedling', hardCount: 2, easyCount: 0 }))).toBe(DUE_MIN_INTERVAL) // 2*0.5=1
  })
})

describe('isDue', () => {
  it('is false for a never-practiced item', () => {
    expect(isDue(srs({ lastSeen: null }), NOW)).toBe(false)
  })
  it('is due at and past the interval (plant = 5 days)', () => {
    expect(isDue(seenDaysAgo(5, { easyCount: 1 }), NOW)).toBe(true)
    expect(isDue(seenDaysAgo(6, { easyCount: 1 }), NOW)).toBe(true)
  })
  it('is not due before the interval', () => {
    expect(isDue(seenDaysAgo(4, { easyCount: 1 }), NOW)).toBe(false)
  })
  it('respects the shortened net-hard interval (2.5 days)', () => {
    expect(isDue(seenDaysAgo(3, { hardCount: 2, easyCount: 0 }), NOW)).toBe(true)
    expect(isDue(seenDaysAgo(2, { hardCount: 2, easyCount: 0 }), NOW)).toBe(false)
  })
})

describe('dueKos', () => {
  it('returns due kos most-overdue-first, excludes not-due and never-seen', () => {
    const map: Record<string, SrsState> = {
      A: seenDaysAgo(10, { easyCount: 1 }), // overdue 5
      B: seenDaysAgo(6, { easyCount: 1 }), // overdue 1
      C: seenDaysAgo(3, { easyCount: 1 }), // not due (interval 5)
      D: srs({ lastSeen: null }), // never seen
    }
    expect(dueKos(map, NOW)).toEqual(['A', 'B'])
  })
  it('empty map → empty list', () => {
    expect(dueKos({}, NOW)).toEqual([])
  })
})

describe('revisitPool', () => {
  it('pads a short due set up to min from the active pool, dedup, due-first', () => {
    expect(revisitPool(['A', 'B'], ['A', 'B', 'C', 'D'], 3)).toEqual(['A', 'B', 'C'])
  })
  it('dedups the due set before padding', () => {
    expect(revisitPool(['A', 'A'], ['A', 'B', 'C'], 3)).toEqual(['A', 'B', 'C'])
  })
  it('leaves a due set already >= min untouched', () => {
    expect(revisitPool(['A', 'B', 'C', 'D'], ['E'], 3)).toEqual(['A', 'B', 'C', 'D'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/srs/due.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/srs/due"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/lib/srs/due.ts`:

```ts
import type { MasteryLevel, SrsState } from '~/lib/domain'
import { daysSinceSeen } from './weight'

/** Base review interval per mastery tier, in days. Tunable. */
export const DUE_INTERVAL_DAYS: Record<MasteryLevel, number> = { seedling: 2, plant: 5, tree: 12 }
/** Net-hard items (more hard than easy) come due sooner. */
export const DUE_HARD_SHORTEN = 0.5
/** Floor so a struggled seedling never comes due more than once a day. */
export const DUE_MIN_INTERVAL = 1
/** Calm ceiling for the displayed "ready" number. */
export const READY_DISPLAY_CAP = 9

/** Days until this item is "ready to revisit", per mastery, shortened when net-hard. */
export function reviewIntervalDays(srs: SrsState): number {
  const base = DUE_INTERVAL_DAYS[srs.mastery]
  const shortened = srs.hardCount > srs.easyCount ? base * DUE_HARD_SHORTEN : base
  return Math.max(DUE_MIN_INTERVAL, shortened)
}

/** Ready iff practiced at least once and its interval has elapsed. */
export function isDue(srs: SrsState, now: number): boolean {
  const days = daysSinceSeen(srs.lastSeen, now)
  return days !== null && days >= reviewIntervalDays(srs)
}

/** The due grammar kos, most-overdue first (then ko for a stable order). */
export function dueKos(srsMap: Record<string, SrsState>, now: number): string[] {
  return Object.entries(srsMap)
    .filter(([, s]) => isDue(s, now))
    .map(([ko, s]) => ({ ko, overdue: (daysSinceSeen(s.lastSeen, now) ?? 0) - reviewIntervalDays(s) }))
    .sort((a, b) => b.overdue - a.overdue || a.ko.localeCompare(b.ko))
    .map((x) => x.ko)
}

/**
 * Build a "revisit" draw pool: the due set (deduped, due-first), padded with
 * active-pool kos up to `min` so a session can always form even when only one
 * or two items are actually due.
 */
export function revisitPool(due: readonly string[], activeKos: readonly string[], min = 3): string[] {
  const out = [...new Set(due)]
  if (out.length >= min) return out
  const have = new Set(out)
  for (const ko of activeKos) {
    if (out.length >= min) break
    if (!have.has(ko)) {
      out.push(ko)
      have.add(ko)
    }
  }
  return out
}
```

- [ ] **Step 4: Export from the srs barrel**

Modify `munbeop/app/lib/srs/index.ts` to add the due export (append after the existing lines):

```ts
export * from './thresholds'
export * from './weight'
export * from './pick'
export * from './mastery'
export * from './due'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/srs/due.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/srs/due.ts munbeop/app/lib/srs/index.ts munbeop/tests/unit/srs/due.test.ts
git commit -m "feat(due): per-mastery review interval + dueKos + revisitPool (pure)"
```

---

## Task 2: `useReadyCount` composable

**Files:**
- Create: `munbeop/app/composables/useReadyCount.ts`
- Test: `munbeop/tests/unit/composables/useReadyCount.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/composables/useReadyCount.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import type { SrsState } from '~/lib/domain'

// Shared reactive srs state the mocked store reads from.
const state = reactive({ map: {} as Record<string, SrsState> })
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ get map() { return state.map } }) }))

import { useReadyCount } from '~/composables/useReadyCount'

// lastSeen = epoch (0) → always far past its interval → due regardless of "now".
const due = (over: Partial<SrsState> = {}): SrsState => ({
  lastSeen: 0,
  easyCount: 1,
  hardCount: 0,
  mastery: 'plant',
  ...over,
})

beforeEach(() => {
  state.map = {}
})

describe('useReadyCount', () => {
  it('exposes the due kos and their count', () => {
    state.map = { 가다: due(), 오다: due() }
    const { readyKos, readyCount } = useReadyCount()
    expect(readyKos.value.sort()).toEqual(['가다', '오다'])
    expect(readyCount.value).toBe(2)
  })

  it('caps displayCount at READY_DISPLAY_CAP and flips hasMore past it', () => {
    const map: Record<string, SrsState> = {}
    for (let i = 0; i < 12; i++) map[`g${i}`] = due()
    state.map = map
    const { readyCount, displayCount, hasMore } = useReadyCount()
    expect(readyCount.value).toBe(12)
    expect(displayCount.value).toBe(9)
    expect(hasMore.value).toBe(true)
  })

  it('is zero/false for an empty srs map', () => {
    const { readyCount, displayCount, hasMore } = useReadyCount()
    expect(readyCount.value).toBe(0)
    expect(displayCount.value).toBe(0)
    expect(hasMore.value).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/composables/useReadyCount.test.ts`
Expected: FAIL — `Failed to resolve import "~/composables/useReadyCount"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/composables/useReadyCount.ts`:

```ts
import { computed } from 'vue'
import { dueKos, READY_DISPLAY_CAP } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'

/**
 * Reactive "ready to revisit" signal, derived on the fly from the srs store —
 * no persisted state, no migration. `readyKos` is the full due set (for the
 * revisit session); `displayCount`/`hasMore` are the calm, capped surface.
 */
export function useReadyCount() {
  const srs = useSrsStore()
  const readyKos = computed(() => dueKos(srs.map, Date.now()))
  const readyCount = computed(() => readyKos.value.length)
  const displayCount = computed(() => Math.min(readyCount.value, READY_DISPLAY_CAP))
  const hasMore = computed(() => readyCount.value > READY_DISPLAY_CAP)
  return { readyKos, readyCount, displayCount, hasMore }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/composables/useReadyCount.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useReadyCount.ts munbeop/tests/unit/composables/useReadyCount.test.ts
git commit -m "feat(due): useReadyCount composable (readyKos + capped display)"
```

---

## Task 3: `ReadyToRevisit` hint + wire into the garden home

**Files:**
- Create: `munbeop/app/components/garden/ReadyToRevisit.vue`
- Modify: `munbeop/app/pages/index.vue`
- Test: `munbeop/tests/components/garden/ReadyToRevisit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/garden/ReadyToRevisit.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadyToRevisit from '~/components/garden/ReadyToRevisit.vue'

describe('ReadyToRevisit', () => {
  it('links to the revisit-due session and shows the count', () => {
    const w = mount(ReadyToRevisit, { props: { count: 3, hasMore: false } })
    const link = w.find('a')
    expect(link.attributes('href')).toBe('/practice/ruleta?revisit=due')
    expect(w.text()).toContain('3')
  })

  it('appends + to the count when there are more than the cap', () => {
    const w = mount(ReadyToRevisit, { props: { count: 9, hasMore: true } })
    expect(w.text()).toContain('9+')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/garden/ReadyToRevisit.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/garden/ReadyToRevisit.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

interface Props {
  count: number
  hasMore: boolean
}
const props = defineProps<Props>()
const { t } = useI18n()

const shown = computed(() => `${props.count}${props.hasMore ? '+' : ''}`)
</script>

<template>
  <NuxtLink
    class="ready"
    data-testid="ready-to-revisit"
    to="/practice/ruleta?revisit=due"
    :aria-label="t('garden.ready.aria', { n: shown })"
  >
    {{ t('garden.ready.label', { n: shown }) }}
  </NuxtLink>
</template>

<style scoped>
.ready {
  align-self: center;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 999px;
  padding: 6px 14px;
  transition: background var(--motion-quick, 120ms) ease;
}
.ready:hover {
  background: var(--paper-deep);
}
.ready:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/garden/ReadyToRevisit.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire it into `index.vue`**

In `munbeop/app/pages/index.vue`:

(a) Add the import next to the other garden imports (after the `DailyGoalRing` import, around line 33):

```ts
import ReadyToRevisit from '~/components/garden/ReadyToRevisit.vue'
import { useReadyCount } from '~/composables/useReadyCount'
```

(b) In `<script setup>`, after the `goalCount` computed (around line 62), add:

```ts
const { displayCount, hasMore, readyCount } = useReadyCount()
```

(c) In the template, render the hint right after the `DailyGoalRing` line (around line 231), before the rain-hint:

```vue
        <DailyGoalRing class="page__goal" :count="goalCount" :goal="settings.dailyGoal" />

        <ReadyToRevisit v-if="readyCount >= 1" :count="displayCount" :has-more="hasMore" />

        <NuxtLink v-if="weatherKind === 'rain'" class="page__rain-hint" to="/log">
          {{ t('garden.weather.rain_hint') }}
        </NuxtLink>
```

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/garden/ReadyToRevisit.vue munbeop/app/pages/index.vue munbeop/tests/components/garden/ReadyToRevisit.test.ts
git commit -m "feat(due): 'ready to revisit' hint on the garden home"
```

---

## Task 4: `?revisit=due` session in the ruleta

**Files:**
- Modify: `munbeop/app/pages/practice/ruleta.vue`

No new test: the ruleta page depends on `useRoute`/`useI18n`/`onMounted` and is not unit-tested in this repo (the pure `dueKos`/`revisitPool` are covered by Task 1). Verified by `pnpm typecheck`.

- [ ] **Step 1: Add imports**

In `munbeop/app/pages/practice/ruleta.vue`, add to the import block (after the `useGameLeaveGuard` import, around line 17):

```ts
import { dueKos, revisitPool } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
```

- [ ] **Step 2: Add the srs store handle**

After `const customDecks = useCustomDecksStore()` (around line 42), add:

```ts
const srsStore = useSrsStore()
```

- [ ] **Step 3: Make the focus branch return, then add the revisit branch**

In the `onMounted` handler, the existing focus block ends with `phase.value = 'play'`. Add a `return` there and append the revisit branch. Replace the existing `onMounted` focus block's tail:

```ts
    await start()
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'play'
  }
})
```

with:

```ts
    await start()
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'play'
    return
  }

  // Revisit round from the garden's "ready to revisit" hint: build a due-first
  // pool (padded to >=3 from the active pool) and start a session over it. The
  // weighted draw still front-loads the due items via getWeight's timeFactor.
  // Mutually exclusive with ?focus= (focus returns above and keeps priority).
  if (route.query.revisit === 'due') {
    try {
      await Promise.all([grammarStore.hydrate(), contextsStore.hydrate(), srsStore.hydrate()])
    } catch (err) {
      console.error('ruleta: revisit-round hydration failed', err)
      return
    }
    const activeKos = grammarStore.activeIndices
      .map((idx) => grammarStore.items[idx]?.ko)
      .filter((ko): ko is string => !!ko)
    const pool = revisitPool(dueKos(srsStore.map, Date.now()), activeKos, 3)
    if (pool.length < 3) return // nothing to revisit yet — fall back to the picker
    await start({ customDeckGrammarKos: pool })
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'play'
  }
})
```

- [ ] **Step 4: Consume the `?revisit` param on restart**

In `onRestart`, the existing cleanup clears the query only when `?focus` is present. Replace:

```ts
  if (route.query.focus !== undefined) {
    await router.replace({ query: {} })
  }
```

with:

```ts
  if (route.query.focus !== undefined || route.query.revisit !== undefined) {
    await router.replace({ query: {} })
  }
```

- [ ] **Step 5: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Run the practice + composables suites for safety**

Run: `pnpm exec vitest run tests/unit/practice tests/unit/composables`
Expected: PASS (no regression; `usePractice`/`createSession` are untouched).

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/pages/practice/ruleta.vue
git commit -m "feat(due): ?revisit=due session draws from the due set"
```

---

## Task 5: i18n keys in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/ready-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/i18n/ready-keys.test.ts`:

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

const KEYS = ['garden.ready.label', 'garden.ready.aria']

describe('garden.ready.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('every locale keeps the {n} placeholder in garden.ready.label', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'garden.ready.label'), code).toContain('{n}')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/i18n/ready-keys.test.ts`
Expected: FAIL — keys missing in every locale.

- [ ] **Step 3: Inject the keys into all 8 locales via a temp script**

Create `munbeop/scripts/tmp-add-ready-i18n.mjs`:

```js
// One-off: add a "ready" block inside the existing "garden" block of all 8 locales.
// Run from munbeop/: node scripts/tmp-add-ready-i18n.mjs   (then delete this file)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const localesDir = join(here, '..', 'i18n', 'locales')

const ready = {
  en: { label: '{n} plants ready to revisit', aria: 'Revisit the {n} plants ready to tend' },
  es: { label: '{n} plantas listas para revisar', aria: 'Revisar las {n} plantas listas para cuidar' },
  fr: { label: '{n} plantes prêtes à revoir', aria: 'Revoir les {n} plantes à soigner' },
  'pt-BR': { label: '{n} plantas prontas para revisar', aria: 'Revisar as {n} plantas prontas para cuidar' },
  th: { label: 'มี {n} ต้นพร้อมให้ทบทวน', aria: 'ทบทวนต้นไม้ {n} ต้นที่พร้อมดูแล' },
  id: { label: '{n} tanaman siap ditinjau', aria: 'Tinjau {n} tanaman yang siap dirawat' },
  vi: { label: '{n} cây sẵn sàng để ôn lại', aria: 'Ôn lại {n} cây cần chăm sóc' },
  ja: { label: '復習できる植物が{n}本', aria: '手入れできる{n}本の植物を復習する' },
}

for (const [code, payload] of Object.entries(ready)) {
  const file = join(localesDir, `${code}.json`)
  const json = JSON.parse(readFileSync(file, 'utf8'))
  json.garden = json.garden ?? {}
  json.garden.ready = payload
  writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8')
  console.log(`updated ${code}.json`)
}
```

Run it from `munbeop/`:

Run: `node scripts/tmp-add-ready-i18n.mjs`
Expected: prints `updated <code>.json` for all 8.

Then inspect one diff to confirm only the new block was added (2-space indent preserved):

Run: `git diff munbeop/i18n/locales/en.json`
Expected: a single added `"ready": { "label": ..., "aria": ... }` block inside `"garden"`.

- [ ] **Step 4: Run the parity test to verify it passes**

Run: `pnpm exec vitest run tests/unit/i18n/ready-keys.test.ts`
Expected: PASS (16 key assertions + the `{n}` invariant).

- [ ] **Step 5: Delete the temp script and commit**

```bash
rm munbeop/scripts/tmp-add-ready-i18n.mjs
git add munbeop/i18n/locales munbeop/tests/unit/i18n/ready-keys.test.ts
git commit -m "feat(due): garden.ready.* i18n keys across 8 locales"
```

---

## Task 6: Full verification gate

**Files:** none (verification only).

- [ ] **Step 1: Run the whole unit + component suite**

Run: `pnpm test`
Expected: PASS — all new due/ready/i18n tests plus the existing suite green.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: 0 errors. Fix any (common: `import/first` if a SUT import slipped below `vi.mock`; trailing commas) and re-run.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Manual preview smoke (per repo verify→commit→verify→push discipline)**

Start the dev server and verify the observable behaviour (note: auth-gated SPA — a logged-in session with practiced-then-aged SRS data is needed to see real due items; the boot/compile check is the auth-independent signal):
- The garden home shows a calm "{n} plants ready to revisit" hint when ≥1 item is due (with `+` past 9), distinct from the rain-hint; nothing when 0.
- Tapping it opens `/practice/ruleta?revisit=due` and lands on the play phase with a session drawn from the due set.

- [ ] **Step 5: Final commit (if any lint/type fixes were made)**

```bash
git add -A
git commit -m "chore(due): lint/type fixes after Step 12 verification"
```

---

## Self-Review

**Spec coverage:**
- `due.ts` (per-mastery interval, net-hard shorten, `isDue` excludes never-seen, `dueKos`, `revisitPool`, constants) → Task 1. ✓
- `useReadyCount` (readyKos + capped display) → Task 2. ✓
- `ReadyToRevisit` hint + garden-home wiring (v-if ≥1, distinct from rain) → Task 3. ✓
- `?revisit=due` session reusing `customDeckGrammarKos`, padded to ≥3, srs hydration, focus-priority, param cleanup → Task 4. ✓
- i18n `garden.ready.*` in all 8 locales + parity (incl. `{n}` invariant) → Task 5. ✓
- No DB migration; `getWeight`/`createSession`/`usePractice` untouched → no task modifies them (by design). ✓
- Full verification → Task 6. ✓

**Type consistency:** `SrsState` imported from `~/lib/domain` (where mastery.ts exports it) in Tasks 1 + 2. `dueKos(srsMap, now): string[]`, `revisitPool(due, activeKos, min): string[]`, `READY_DISPLAY_CAP` consistent between Task 1 (impl/test), Task 2 (useReadyCount), and Task 4 (ruleta). `useReadyCount` returns `{ readyKos, readyCount, displayCount, hasMore }` — exactly what Task 3's `index.vue` destructures (`displayCount`, `hasMore`, `readyCount`) and the `ReadyToRevisit` props (`count`, `hasMore`) consume. i18n keys `garden.ready.label`/`garden.ready.aria` referenced by `t(...)` in Task 3 are the keys defined in Task 5.

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every command states expected output. The two non-tested files (ruleta wiring, index.vue page) are explicitly justified (no Nuxt-context unit tests in this repo) and covered by the pure tests + typecheck + preview.
