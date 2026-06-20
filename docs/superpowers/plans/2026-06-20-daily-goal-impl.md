# Daily goal + mulch streak-freeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A daily goal ring on the garden home + a silent 1-day "mulch" streak-freeze, in garden language.

**Architecture:** `currentStreak` gains an optional `graceDays`; new pure `lib/stats/goal.ts` (clampGoal, todayCount, default); the settings store gains a `dailyGoal` persisted in the existing `prefs` blob; a `DailyGoalRing` on the garden home and a `DailyGoalSetting` in Settings → Learning. Spec: `docs/superpowers/specs/2026-06-20-daily-goal-design.md`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest (happy-dom), @nuxtjs/i18n (8 locales), pnpm.

**Working directory:** all paths relative to `munbeop/`; run from `munbeop/`. Branch: `claude/daily-goal`.

**Verified facts:**
- `currentStreak(dateMs, now)` buckets by UTC day; breaks if today's bucket is empty (`lib/stats/streak.ts`). Existing tests call it with no grace.
- `useStats` calls `currentStreak(dateMs.value, now)` (`useStats.ts:25`).
- Settings store persists `{theme, locale}` into the `user_settings.prefs` jsonb (`stores/settings.ts`); `hydrate` reads the blob; `prefs` is freeform (no migration to add a key).
- Test harness: happy-dom; `useI18n` key-echo stub appends interpolation params; `useTheme` is a real global stub (`tests/setup.ts`).

---

## File Structure

| File | Responsibility |
|---|---|
| `app/lib/stats/streak.ts` (modify) | `currentStreak(…, graceDays=0)` + `STREAK_GRACE_DAYS`. |
| `app/lib/stats/goal.ts` (create) | `DEFAULT_DAILY_GOAL`, `clampGoal`, `todayCount`. Pure. |
| `app/composables/useStats.ts` (modify) | Pass `STREAK_GRACE_DAYS` to `currentStreak`. |
| `app/stores/settings.ts` (modify) | `dailyGoal` ref + `setDailyGoal` + persist/hydrate. |
| `app/components/garden/DailyGoalRing.vue` (create) | Progress ring (count/goal) + done state. |
| `app/components/settings/DailyGoalSetting.vue` (create) | Number control bound to the store. |
| `app/pages/index.vue` (modify) | Mount the ring near `GardenHud`. |
| `app/pages/settings.vue` (modify) | Mount `DailyGoalSetting` in the Learning panel. |
| `i18n/locales/*.json` ×8 (modify) | `garden.goal.*` + `settings.daily_goal.*`. |
| Tests | extend `tests/unit/stats/streak.test.ts`; create `tests/unit/stats/goal.test.ts`, `tests/unit/stores/settings.dailyGoal.test.ts`, `tests/components/garden/DailyGoalRing.test.ts`, `tests/components/settings/DailyGoalSetting.test.ts`, `tests/unit/i18n/daily-goal-keys.test.ts`. |

---

## Task 1: `currentStreak` grace + `useStats` wiring

**Files:** Modify `app/lib/stats/streak.ts`, `app/composables/useStats.ts`; Test extend `tests/unit/stats/streak.test.ts`

- [ ] **Step 1: Add the failing tests** — append inside the existing `describe('currentStreak', …)` in `tests/unit/stats/streak.test.ts` (before its closing `})`):

```ts
  it('bridges a single missed day with one grace day', () => {
    // today + 2-days-ago, yesterday missing; grace=1 bridges yesterday
    expect(currentStreak([dayMs(0), dayMs(2)], now, 1)).toBe(2)
  })

  it('keeps the streak alive mid-day before today is done (grace bridges today)', () => {
    expect(currentStreak([dayMs(1), dayMs(2)], now, 1)).toBe(2)
  })

  it('breaks on two consecutive missed days even with one grace', () => {
    expect(currentStreak([dayMs(0), dayMs(3)], now, 1)).toBe(1)
  })

  it('graceDays defaults to 0 (unchanged behavior)', () => {
    expect(currentStreak([dayMs(0), dayMs(2)], now)).toBe(1)
  })
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run tests/unit/stats/streak.test.ts`
Expected: FAIL — `currentStreak` ignores the 3rd arg.

- [ ] **Step 3: Implement grace in `app/lib/stats/streak.ts`** — replace the whole file:

```ts
const DAY = 86_400_000

/** Default grace ("mulch"): how many missed days a streak tolerates. */
export const STREAK_GRACE_DAYS = 1

/**
 * Consecutive-day practice streak ending today. Days are bucketed by UTC day
 * (floor(ms / DAY)) so the result is deterministic and `now`-injectable for
 * tests. Walking back from today, an inactive day is bridged by spending a
 * `graceDays` ("mulch") instead of breaking the chain, until grace runs out.
 * `graceDays = 0` is the strict consecutive streak.
 */
export function currentStreak(dateMs: number[], now: number, graceDays = 0): number {
  const today = Math.floor(now / DAY)
  const days = new Set(dateMs.map((ms) => Math.floor(ms / DAY)))
  let streak = 0
  let grace = graceDays
  let cursor = today
  for (;;) {
    if (days.has(cursor)) {
      streak += 1
      cursor -= 1
    } else if (grace > 0) {
      grace -= 1
      cursor -= 1
    } else {
      break
    }
  }
  return streak
}
```

- [ ] **Step 4: Wire `useStats`** — in `app/composables/useStats.ts`, update the import and the call:

```ts
import { currentStreak, STREAK_GRACE_DAYS } from '~/lib/stats/streak'
```

```ts
  const streak = computed(() => currentStreak(dateMs.value, now, STREAK_GRACE_DAYS))
```

- [ ] **Step 5: Run to verify they pass**

Run: `pnpm vitest run tests/unit/stats/streak.test.ts`
Expected: PASS (existing 5 + new 4).

- [ ] **Step 6: Commit**

```bash
git add app/lib/stats/streak.ts app/composables/useStats.ts tests/unit/stats/streak.test.ts
git commit -m "feat(stats): 1-day mulch grace in currentStreak

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `lib/stats/goal.ts` (pure)

**Files:** Create `app/lib/stats/goal.ts`; Test `tests/unit/stats/goal.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/stats/goal.test.ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_DAILY_GOAL, clampGoal, todayCount } from '~/lib/stats/goal'

const DAY = 86_400_000
const now = 1_700_000_000_000
const dayMs = (k: number) => (Math.floor(now / DAY) - k) * DAY + 3_600_000

describe('clampGoal', () => {
  it('clamps to [1, 20] and floors', () => {
    expect(clampGoal(0)).toBe(1)
    expect(clampGoal(99)).toBe(20)
    expect(clampGoal(3.9)).toBe(3)
  })
  it('falls back to the default for non-finite input', () => {
    expect(clampGoal(NaN)).toBe(DEFAULT_DAILY_GOAL)
  })
})

describe('todayCount', () => {
  it('counts only entries in today’s bucket', () => {
    expect(todayCount([dayMs(0), dayMs(0), dayMs(1), dayMs(3)], now)).toBe(2)
  })
  it('is 0 with no entries today', () => {
    expect(todayCount([dayMs(1), dayMs(2)], now)).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/stats/goal.test.ts`
Expected: FAIL — cannot resolve `~/lib/stats/goal`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/lib/stats/goal.ts
const DAY = 86_400_000

/** Default plants-per-day goal for a new user. */
export const DEFAULT_DAILY_GOAL = 3

/** Clamp a goal to a sane integer range; fall back to the default if not finite. */
export function clampGoal(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_DAILY_GOAL
  return Math.max(1, Math.min(20, Math.floor(n)))
}

/** Number of practice timestamps in today's UTC-day bucket. */
export function todayCount(dateMs: number[], now: number): number {
  const today = Math.floor(now / DAY)
  return dateMs.filter((ms) => Math.floor(ms / DAY) === today).length
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/stats/goal.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/stats/goal.ts tests/unit/stats/goal.test.ts
git commit -m "feat(stats): goal helpers (clampGoal, todayCount)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Settings store `dailyGoal`

**Files:** Modify `app/stores/settings.ts`; Test `tests/unit/stores/settings.dailyGoal.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/stores/settings.dailyGoal.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '~/stores/settings'
import { DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue(null), write: vi.fn().mockResolvedValue(undefined) }),
}))

describe('settings dailyGoal', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('defaults to DEFAULT_DAILY_GOAL', () => {
    expect(useSettingsStore().dailyGoal).toBe(DEFAULT_DAILY_GOAL)
  })

  it('setDailyGoal clamps out-of-range values', async () => {
    const s = useSettingsStore()
    await s.setDailyGoal(99)
    expect(s.dailyGoal).toBe(20)
    await s.setDailyGoal(0)
    expect(s.dailyGoal).toBe(1)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/stores/settings.dailyGoal.test.ts`
Expected: FAIL — `dailyGoal`/`setDailyGoal` not on the store.

- [ ] **Step 3: Edit `app/stores/settings.ts`**

Add the import:

```ts
import { clampGoal, DEFAULT_DAILY_GOAL } from '~/lib/stats/goal'
```

Extend the `Settings` interface:

```ts
interface Settings {
  theme: Theme
  locale: LocaleCode
  dailyGoal: number
}
```

Inside the store setup, add the ref (near the top, after the existing composable hooks):

```ts
  const dailyGoal = ref(DEFAULT_DAILY_GOAL)
```

In `hydrate()`, after the locale line, add:

```ts
      if (typeof cloud.dailyGoal === 'number') dailyGoal.value = clampGoal(cloud.dailyGoal)
```

In `persistCloud()`, include the field in the written blob:

```ts
      await storage.write(STORAGE_KEYS.settings, {
        theme: theme.value,
        locale: localeStore.current,
        dailyGoal: dailyGoal.value,
      } satisfies Settings)
```

Add the action and export it:

```ts
  async function setDailyGoal(n: number): Promise<void> {
    dailyGoal.value = clampGoal(n)
    await persistCloud()
  }
```

```ts
  return { hydrate, setTheme, setLocale, dailyGoal, setDailyGoal }
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/stores/settings.dailyGoal.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/stores/settings.ts tests/unit/stores/settings.dailyGoal.test.ts
git commit -m "feat(settings): dailyGoal persisted in the prefs blob

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `DailyGoalRing.vue`

**Files:** Create `app/components/garden/DailyGoalRing.vue`; Test `tests/components/garden/DailyGoalRing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/garden/DailyGoalRing.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyGoalRing from '~/components/garden/DailyGoalRing.vue'

describe('DailyGoalRing', () => {
  it('shows the count/goal label while in progress', () => {
    const w = mount(DailyGoalRing, { props: { count: 2, goal: 3 } })
    expect(w.text()).toContain('garden.goal.label') // key-echo stub
  })
  it('shows the done state once the goal is reached', () => {
    const w = mount(DailyGoalRing, { props: { count: 3, goal: 3 } })
    expect(w.text()).toContain('garden.goal.done')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/components/garden/DailyGoalRing.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create `app/components/garden/DailyGoalRing.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ count: number; goal: number }>()
const { t } = useI18n()

const R = 16
const C = 2 * Math.PI * R
const done = computed(() => props.count >= props.goal)
const ratio = computed(() => (props.goal <= 0 ? 0 : Math.min(1, props.count / props.goal)))
const dash = computed(() => `${C * ratio.value} ${C}`)
const aria = computed(() => t('garden.goal.aria', { count: props.count, goal: props.goal }))
</script>

<template>
  <div class="ring" role="img" :aria-label="aria">
    <svg class="ring__svg" viewBox="0 0 40 40" aria-hidden="true">
      <circle class="ring__track" cx="20" cy="20" :r="R" />
      <circle
        class="ring__fill"
        :class="{ 'ring__fill--done': done }"
        cx="20"
        cy="20"
        :r="R"
        :stroke-dasharray="dash"
        transform="rotate(-90 20 20)"
      />
    </svg>
    <span class="ring__label">
      {{ done ? t('garden.goal.done') : t('garden.goal.label', { count, goal }) }}
    </span>
  </div>
</template>

<style scoped>
.ring {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ring__svg {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.ring__track {
  fill: none;
  stroke: var(--border);
  stroke-width: 4;
}
.ring__fill {
  fill: none;
  stroke: var(--accent, var(--gold, #d4a017));
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dasharray var(--motion-slow, 400ms) var(--ease-out, ease);
}
.ring__fill--done {
  stroke: var(--jade, #3f9d6b);
}
.ring__label {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
}
@media (prefers-reduced-motion: reduce) {
  .ring__fill { transition: none; }
}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/components/garden/DailyGoalRing.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/garden/DailyGoalRing.vue tests/components/garden/DailyGoalRing.test.ts
git commit -m "feat(garden): DailyGoalRing component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: `DailyGoalSetting.vue` + mount in settings

**Files:** Create `app/components/settings/DailyGoalSetting.vue`; Modify `app/pages/settings.vue`; Test `tests/components/settings/DailyGoalSetting.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/settings/DailyGoalSetting.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DailyGoalSetting from '~/components/settings/DailyGoalSetting.vue'
import { useSettingsStore } from '~/stores/settings'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue(null), write: vi.fn().mockResolvedValue(undefined) }),
}))

describe('DailyGoalSetting', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('calls setDailyGoal when the value changes', async () => {
    const w = mount(DailyGoalSetting)
    const store = useSettingsStore()
    const spy = vi.spyOn(store, 'setDailyGoal')
    await w.get('#daily-goal').setValue('5')
    expect(spy).toHaveBeenCalledWith(5)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/components/settings/DailyGoalSetting.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3a: Create `app/components/settings/DailyGoalSetting.vue`**

```vue
<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'

const { t } = useI18n()
const settings = useSettingsStore()

function onInput(v: string) {
  const n = Number(v)
  if (Number.isFinite(n)) void settings.setDailyGoal(n)
}
</script>

<template>
  <section class="goal-set" :aria-label="t('settings.daily_goal.title')">
    <h2 class="goal-set__title">{{ t('settings.daily_goal.title') }}</h2>
    <Field :label="t('settings.daily_goal.label')" html-for="daily-goal">
      <Input
        id="daily-goal"
        type="number"
        inputmode="numeric"
        :model-value="String(settings.dailyGoal)"
        @update:model-value="onInput"
      />
    </Field>
    <p class="goal-set__hint">{{ t('settings.daily_goal.hint') }}</p>
  </section>
</template>

<style scoped>
.goal-set { display: flex; flex-direction: column; gap: 8px; }
.goal-set__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px; margin: 0; color: var(--ink);
}
.goal-set__hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); margin: 0; }
</style>
```

- [ ] **Step 3b: Mount in `app/pages/settings.vue`**

Add the import after the `ContextManager` import:

```ts
import DailyGoalSetting from '~/components/settings/DailyGoalSetting.vue'
```

In the Learning panel, add it before `<ContextManager />`:

```html
      <DailyGoalSetting />
      <ContextManager />
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/components/settings/DailyGoalSetting.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/components/settings/DailyGoalSetting.vue app/pages/settings.vue tests/components/settings/DailyGoalSetting.test.ts
git commit -m "feat(settings): DailyGoalSetting in the Learning tab

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Wire `DailyGoalRing` into the garden home

**Files:** Modify `app/pages/index.vue` (no unit test — covered by typecheck + the component test; manual smoke in Task 8)

- [ ] **Step 1: Add imports + derived state** — in the `<script setup>` of `app/pages/index.vue`, add to the imports:

```ts
import DailyGoalRing from '~/components/garden/DailyGoalRing.vue'
import { useSettingsStore } from '~/stores/settings'
import { useLogStore } from '~/stores/log'
import { todayCount } from '~/lib/stats/goal'
```

After the `useGardenState()` block, add:

```ts
const settings = useSettingsStore()
const logStore = useLogStore()
const goalCount = computed(() =>
  todayCount(logStore.entries.map((e) => new Date(e.date).getTime()), Date.now()),
)
```

- [ ] **Step 2: Render the ring** — in the hero view, place it just after the `<GardenHud … />` element:

```html
        <GardenHud
          :level="active.level"
          :species-ko="speciesKo"
          :species-label="speciesLabel"
          :pct="active.pct"
          :state-key="stateKey"
        />

        <DailyGoalRing class="page__goal" :count="goalCount" :goal="settings.dailyGoal" />
```

Add a small centering style in the `<style scoped>`:

```css
.page__goal {
  align-self: center;
}
```

- [ ] **Step 3: Verify build is type-clean**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(garden): daily goal ring on the garden home

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: i18n — `garden.goal.*` + `settings.daily_goal.*` (8 locales)

**Files:** Modify `i18n/locales/*.json` (×8); Test `tests/unit/i18n/daily-goal-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/i18n/daily-goal-keys.test.ts
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
const KEYS = [
  'garden.goal.label', 'garden.goal.aria', 'garden.goal.done',
  'settings.daily_goal.title', 'settings.daily_goal.label', 'settings.daily_goal.hint',
]

describe('daily goal i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('label/aria keep {count} and {goal}; done keeps 화이팅', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      for (const k of ['garden.goal.label', 'garden.goal.aria']) {
        expect(dig(msgs, k), `${code} ${k}`).toContain('{count}')
        expect(dig(msgs, k), `${code} ${k}`).toContain('{goal}')
      }
      expect(dig(msgs, 'garden.goal.done'), code).toContain('화이팅')
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/i18n/daily-goal-keys.test.ts`
Expected: FAIL — keys undefined.

- [ ] **Step 3: Add the keys to each locale**

Each locale has a top-level `garden` object and a `settings` object. Add the `goal` block inside `garden` and the `daily_goal` block inside `settings`. To anchor reliably, the `garden` block exists in every locale (used by the garden home). English values:

`garden.goal`:
```json
"goal": {
  "label": "Today: {count}/{goal}",
  "aria": "Daily goal: {count} of {goal} plants tended today.",
  "done": "Today's goal done! 화이팅"
}
```
`settings.daily_goal`:
```json
"daily_goal": {
  "title": "Daily goal",
  "label": "Plants to tend each day",
  "hint": "Miss a day? Mulch keeps your streak."
}
```

Spanish:
- `garden.goal`: label `"Hoy: {count}/{goal}"`, aria `"Meta diaria: {count} de {goal} plantas cuidadas hoy."`, done `"¡Meta de hoy cumplida! 화이팅"`.
- `settings.daily_goal`: title `"Meta diaria"`, label `"Plantas que cuidar cada día"`, hint `"¿Te saltas un día? El mulch mantiene tu racha."`.

For `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`: add the same two blocks, translating each value, keeping `{count}`/`{goal}` in `label`/`aria` and `화이팅` in `done` (the parity test enforces this). Find the existing `garden` and `settings` objects in each file and insert the blocks as new keys (mind commas).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/i18n/daily-goal-keys.test.ts`
Expected: PASS (48 parity + 1 placeholder test).

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/*.json tests/unit/i18n/daily-goal-keys.test.ts
git commit -m "i18n(garden,settings): daily goal keys in all 8 locales

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Final verification

- [ ] **Step 1: Full verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green.

- [ ] **Step 2: Manual smoke (best-effort, auth-gated)**

If a test account is available: practice a sentence and watch the garden-home ring fill toward the goal; reach the goal and see the done state; set a different goal in Settings → Learning and confirm it persists across reload; confirm a 1-day gap doesn't reset the Stats streak.

- [ ] **Step 3: Confirm scope** — fixed silent 1-day grace; no migration; ring shows today only.

---

## Self-Review

**Spec coverage:** mulch grace → T1; goal helpers → T2; settings dailyGoal → T3; ring → T4; setting control → T5; garden-home wiring → T6; i18n → T7; verify → T8. All covered.

**Type consistency:** `STREAK_GRACE_DAYS` (T1) and `DEFAULT_DAILY_GOAL`/`clampGoal`/`todayCount` (T2) reused in T3/T6; `dailyGoal`/`setDailyGoal` (T3) consumed by T5/T6; `DailyGoalRing` props `{count, goal}` (T4) match the call site (T6).

**Placeholder scan:** the only deferred content is the fr/pt-BR/th/id/vi/ja translations in T7 (real authoring; EN+ES canonical given; parity test gates) — no code placeholders.
