# 숫자 시장 — Number Market SPEED mode (속도전) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a timed **속도전 (Speed)** mode to the existing Number Market lab (`/practice/number-market`): a 60-second blitz where the learner reads numbers via fast **4-choice** taps, with score, a combo/streak meter, and a persisted **best score** per deck (per-domain or a `mixed` all-domains deck). It sits beside the Learn mode (build-the-reading tiles) shipped in Plan 1 — selected via a Learn/Speed toggle on the pick screen.

**Architecture:** A pure `choices.ts` (4 whole-reading options: correct + same-domain-preferred distractors) extends the existing `lib/numbers-market` layer. A self-contained `useNumberSpeed` composable owns the blitz state machine (cycling deck, score, combo, best-score `localStorage`), with `tick()` as a pure 1-second step the page drives via `setInterval`. New presentational components (ChoiceRow, SpeedHud, SpeedSummary, ModeToggle) plug into the existing page. No engine/seed changes, no migration, no SRS writes (only `useActivityStore().record()`); best scores live in `localStorage` separate from Learn mastery.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). pnpm. App code under `munbeop/`.

**Spec:** `docs/superpowers/specs/2026-06-27-number-market-design.md` (Speed = the 속도전 mode; Dictation 받아쓰기 + audio is a separate later plan).

**Builds on (already merged to main):** Plan 1 — `lib/korean/numbers.ts` engine, `seed/numbers-market` (`MARKET_ITEMS`, `MarketItem`, `itemsForDomain`), `lib/numbers-market` (`tilePool`, `buildRound`, `scoreOf`, `itemId`, `DrillResult`; `sets.ts` → `NUMBER_DOMAINS`, `masteryOf`), `useNumberMarket` / `useNumberMarketMaster`, the `numbers-market/*` components, the page, and the `numberMarket.*` i18n block in all 8 locales.

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`. Shared shuffle: `~/lib/particle-lab/shuffle` (`shuffle<T>(xs:T[]):T[]`). Activity store: `~/stores/activity` (`useActivityStore().record()`); MOCK it in composable tests with `vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))` (otherwise `useNuxtApp` unhandled rejections fail the suite — learned in Plan 1).
- Composable tests: `setActivePinia(createPinia())` + clear `localStorage` in `beforeEach`. Keep the SUT import at the TOP even with `vi.mock` below it (`import/first`).
- i18n: nested JSON objects in `munbeop/i18n/locales/*.json`; parity test imports each locale with a RELATIVE path (`../../../i18n/locales/en.json`). Add keys to all 8; keep Korean fragments verbatim.
- `~/` resolves to `munbeop/app/`. Commands run from `munbeop/`: single test `pnpm exec vitest run <path>`; full `pnpm test`; `pnpm typecheck`; `pnpm lint`.
- **No DB / migration. No SRS/log/catalog writes.** Best scores are local `localStorage` (`number-market.speed.best`).

**Korean correctness:** Speed reuses the Plan-1 verified `answer` strings as both the correct option and the distractor pool — no new Korean is authored, so no new content gate beyond the existing seed invariants.

---

## Task 1: `choices.ts` — 4-option builder

**Files:**
- Create: `munbeop/app/lib/numbers-market/choices.ts`
- Modify: `munbeop/app/lib/numbers-market/index.ts` (add `export * from './choices'`)
- Test: `munbeop/tests/unit/numbers-market/choices.test.ts`

- [ ] **Step 1: Write the failing test.** Create `munbeop/tests/unit/numbers-market/choices.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { choicesFor } from '~/lib/numbers-market'
import { MARKET_ITEMS } from '~/seed/numbers-market'

const identity = <T>(xs: T[]): T[] => xs

describe('choicesFor', () => {
  it('returns exactly 4 distinct options including the answer', () => {
    for (const it of MARKET_ITEMS) {
      const opts = choicesFor(it, MARKET_ITEMS, identity)
      expect(opts, it.id).toHaveLength(4)
      expect(new Set(opts).size, it.id).toBe(4)
      expect(opts, it.id).toContain(it.answer)
    }
  })

  it('prefers same-domain distractors when available', () => {
    const timeItem = MARKET_ITEMS.find((i) => i.id === 'time-3-15')!
    const opts = choicesFor(timeItem, MARKET_ITEMS, identity)
    // the time domain has exactly 3 items → all 3 time readings must appear (correct +
    // both siblings taken before any cross-domain fill); the 4th option is cross-domain.
    const timeSiblingAnswers = MARKET_ITEMS.filter((i) => i.domain === 'time').map((i) => i.answer)
    for (const sibling of timeSiblingAnswers) expect(opts, sibling).toContain(sibling)
  })

  it('fills from other domains when a domain is too small for 3 distractors', () => {
    // sino-basics has 3 items → 2 same-domain distractors, so 1 must come from elsewhere
    const sino = MARKET_ITEMS.find((i) => i.id === 'sino-100')!
    const opts = choicesFor(sino, MARKET_ITEMS, identity)
    expect(opts).toHaveLength(4)
    expect(new Set(opts).size).toBe(4)
  })
})
```

- [ ] **Step 2: Run it — FAIL** (`choicesFor` not exported). `pnpm exec vitest run tests/unit/numbers-market/choices.test.ts`.

- [ ] **Step 3: Implement.** Create `munbeop/app/lib/numbers-market/choices.ts`:

```ts
import type { MarketItem } from '~/lib/domain'

/**
 * Four distinct whole-reading options for Speed mode: the correct `answer` plus
 * three distractors — same-domain sibling answers first (more confusable), then
 * filled from other domains if the domain has too few items. Pure; the caller
 * passes the shuffle so it stays deterministic in tests.
 */
export function choicesFor(
  item: MarketItem,
  source: readonly MarketItem[],
  shuffleFn: <T>(xs: T[]) => T[],
): string[] {
  const seen = new Set<string>([item.answer])
  const picked: string[] = []
  const sameDomain = shuffleFn(source.filter((i) => i.domain === item.domain && i.answer !== item.answer))
  const otherDomain = shuffleFn(source.filter((i) => i.domain !== item.domain))
  for (const cand of [...sameDomain, ...otherDomain]) {
    if (picked.length >= 3) break
    if (seen.has(cand.answer)) continue
    seen.add(cand.answer)
    picked.push(cand.answer)
  }
  return shuffleFn([item.answer, ...picked])
}
```

- [ ] **Step 4: Add the barrel export.** In `munbeop/app/lib/numbers-market/index.ts` append:
```ts
export * from './choices'
```

- [ ] **Step 5: Run it — PASS.** Then `pnpm typecheck` (clean).

- [ ] **Step 6: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/lib/numbers-market/choices.ts munbeop/app/lib/numbers-market/index.ts munbeop/tests/unit/numbers-market/choices.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): 4-choice builder for speed mode (same-domain preferred)"
```

---

## Task 2: `useNumberSpeed` composable

**Files:**
- Create: `munbeop/app/composables/useNumberSpeed.ts`
- Test: `munbeop/tests/unit/numbers-market/useNumberSpeed.test.ts`

- [ ] **Step 1: Write the failing test.** Create `munbeop/tests/unit/numbers-market/useNumberSpeed.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberSpeed } from '~/composables/useNumberSpeed'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  if (typeof localStorage !== 'undefined') localStorage.clear()
})

describe('useNumberSpeed', () => {
  it('starts a deck with 4 choices, full timer, zero score', () => {
    const s = useNumberSpeed()
    s.start('time')
    expect(s.phase.value).toBe('playing')
    expect(s.timeLeft.value).toBe(60)
    expect(s.score.value).toBe(0)
    expect(s.choices.value).toHaveLength(4)
    expect(s.choices.value).toContain(s.item.value.answer)
  })

  it('a correct answer scores + grows combo; a wrong answer breaks combo', () => {
    const s = useNumberSpeed()
    s.start('time')
    s.answer(s.item.value.answer)
    expect(s.score.value).toBe(1)
    expect(s.combo.value).toBe(1)
    const wrong = s.choices.value.find((c) => c !== s.item.value.answer)!
    s.answer(wrong)
    expect(s.combo.value).toBe(0)
    expect(s.score.value).toBe(1)
    expect(s.bestStreak.value).toBe(1)
  })

  it('tick counts down and finishes at zero, persisting a best score', () => {
    const s = useNumberSpeed()
    s.start('mixed')
    s.answer(s.item.value.answer) // score 1
    for (let i = 0; i < 60; i++) s.tick()
    expect(s.phase.value).toBe('done')
    expect(s.timeLeft.value).toBe(0)
    expect(JSON.parse(localStorage.getItem('number-market.speed.best')!)).toEqual({ mixed: 1 })
  })

  it('keeps the higher best score across runs', () => {
    const s = useNumberSpeed()
    s.start('mixed'); s.answer(s.item.value.answer); s.answer(s.item.value.answer); s.finish() // best 2
    s.start('mixed'); s.answer(s.item.value.answer); s.finish() // run scored 1, best stays 2
    expect(s.bestScore.value).toBe(2)
  })

  it('answering or ticking after done is a no-op', () => {
    const s = useNumberSpeed()
    s.start('time'); s.finish()
    const before = s.score.value
    s.answer(s.item.value.answer)
    s.tick()
    expect(s.score.value).toBe(before)
    expect(s.timeLeft.value).toBe(60)
  })
})
```

- [ ] **Step 2: Run it — FAIL.** `pnpm exec vitest run tests/unit/numbers-market/useNumberSpeed.test.ts`.

- [ ] **Step 3: Implement.** Create `munbeop/app/composables/useNumberSpeed.ts`:

```ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { choicesFor } from '~/lib/numbers-market'
import { MARKET_ITEMS } from '~/seed/numbers-market'
import type { MarketItem } from '~/lib/domain'
import { useActivityStore } from '~/stores/activity'

export type SpeedPhase = 'playing' | 'done'
/** A deck id: a NumberDomain, or 'mixed' for the all-domains blitz. */
export type SpeedDeckId = string

const DURATION = 60
const BEST_KEY = 'number-market.speed.best'

function readBest(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function useNumberSpeed() {
  const activity = useActivityStore()

  const deckId = ref<SpeedDeckId>('mixed')
  const queue = ref<MarketItem[]>([])
  const cursor = ref(0)
  const choices = ref<string[]>([])
  const phase = ref<SpeedPhase>('playing')
  const timeLeft = ref(DURATION)
  const score = ref(0)
  const combo = ref(0)
  const bestStreak = ref(0)
  const lastCorrect = ref<boolean | null>(null)
  const best = ref<Record<string, number>>(readBest())

  const item = computed<MarketItem>(() => queue.value[cursor.value]!)
  const bestScore = computed(() => best.value[deckId.value] ?? 0)

  function poolFor(id: SpeedDeckId): MarketItem[] {
    return id === 'mixed' ? MARKET_ITEMS : MARKET_ITEMS.filter((i) => i.domain === id)
  }
  function refillQueue() {
    queue.value = shuffle(poolFor(deckId.value))
    cursor.value = 0
  }
  function loadChoices() {
    choices.value = choicesFor(item.value, MARKET_ITEMS, shuffle)
  }

  function start(id: SpeedDeckId) {
    deckId.value = id
    phase.value = 'playing'
    timeLeft.value = DURATION
    score.value = 0
    combo.value = 0
    bestStreak.value = 0
    lastCorrect.value = null
    refillQueue()
    loadChoices()
  }

  function advance() {
    cursor.value += 1
    if (cursor.value >= queue.value.length) refillQueue()
    loadChoices()
  }

  function answer(choice: string) {
    if (phase.value !== 'playing') return
    const correct = choice === item.value.answer
    lastCorrect.value = correct
    if (correct) {
      score.value += 1
      combo.value += 1
      if (combo.value > bestStreak.value) bestStreak.value = combo.value
    } else {
      combo.value = 0
    }
    void activity.record()
    advance()
  }

  function finish() {
    if (phase.value === 'done') return
    phase.value = 'done'
    if (score.value > (best.value[deckId.value] ?? 0)) {
      best.value = { ...best.value, [deckId.value]: score.value }
      if (typeof localStorage !== 'undefined') localStorage.setItem(BEST_KEY, JSON.stringify(best.value))
    }
  }

  function tick() {
    if (phase.value !== 'playing') return
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      finish()
    }
  }

  return {
    deckId, queue, cursor, choices, phase, timeLeft, score, combo, bestStreak, lastCorrect,
    item, bestScore,
    start, answer, tick, finish,
  }
}
```

- [ ] **Step 4: Run it — PASS.** Then `pnpm typecheck` (clean).

- [ ] **Step 5: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/composables/useNumberSpeed.ts munbeop/tests/unit/numbers-market/useNumberSpeed.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): useNumberSpeed blitz composable (combo + best-score)"
```

---

## Task 3: Speed components (ChoiceRow, SpeedHud, SpeedSummary, ModeToggle)

**Files:**
- Create: `munbeop/app/components/numbers-market/ChoiceRow.vue`, `SpeedHud.vue`, `SpeedSummary.vue`, `ModeToggle.vue`
- Test: `munbeop/tests/components/numbers-market/ChoiceRow.test.ts`, `munbeop/tests/components/numbers-market/ModeToggle.test.ts`

- [ ] **Step 1: Write the failing tests.**

`munbeop/tests/components/numbers-market/ChoiceRow.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChoiceRow from '~/components/numbers-market/ChoiceRow.vue'

describe('ChoiceRow', () => {
  it('renders one button per choice and emits choose with the value', async () => {
    const w = mount(ChoiceRow, { props: { choices: ['세 시 십오 분', '삼 시 십오 분', '세 시 열다섯 분', '두 시 십오 분'] } })
    const btns = w.findAll('[data-testid="speed-choice"]')
    expect(btns).toHaveLength(4)
    await btns[1]!.trigger('click')
    expect(w.emitted('choose')?.[0]).toEqual(['삼 시 십오 분'])
  })
  it('disables buttons when disabled', () => {
    const w = mount(ChoiceRow, { props: { choices: ['가', '나'], disabled: true } })
    expect(w.find('[data-testid="speed-choice"]').attributes('disabled')).toBeDefined()
  })
})
```

`munbeop/tests/components/numbers-market/ModeToggle.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeToggle from '~/components/numbers-market/ModeToggle.vue'

describe('ModeToggle', () => {
  it('emits update:modelValue when the other mode is clicked', async () => {
    const w = mount(ModeToggle, { props: { modelValue: 'learn' } })
    const speedBtn = w.findAll('[data-testid="mode-option"]')[1]!
    await speedBtn.trigger('click')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['speed'])
  })
  it('marks the active mode with aria-pressed', () => {
    const w = mount(ModeToggle, { props: { modelValue: 'speed' } })
    const btns = w.findAll('[data-testid="mode-option"]')
    expect(btns[1]!.attributes('aria-pressed')).toBe('true')
    expect(btns[0]!.attributes('aria-pressed')).toBe('false')
  })
})
```

- [ ] **Step 2: Run them — FAIL.** `pnpm exec vitest run tests/components/numbers-market/ChoiceRow.test.ts tests/components/numbers-market/ModeToggle.test.ts`.

- [ ] **Step 3: Implement the components.**

`munbeop/app/components/numbers-market/ChoiceRow.vue`:
```vue
<script setup lang="ts">
interface Props {
  choices: string[]
  disabled?: boolean
}
defineProps<Props>()
defineEmits<{ choose: [value: string] }>()
</script>

<template>
  <div class="choices" lang="ko">
    <button
      v-for="(c, i) in choices"
      :key="`${i}-${c}`"
      type="button"
      class="choice"
      data-testid="speed-choice"
      :disabled="disabled"
      @click="$emit('choose', c)"
    >{{ c }}</button>
  </div>
</template>

<style scoped>
.choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.choice {
  font-family: 'Noto Sans KR', sans-serif; font-size: 18px; padding: 16px 12px;
  background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer;
  transition: transform var(--motion-quick, 120ms) var(--ease-out, ease), border-color var(--motion-quick, 120ms) var(--ease-out, ease);
}
.choice:hover:not(:disabled) { border-color: var(--ink); transform: translate(-1px, -1px); }
.choice:disabled { opacity: 0.55; cursor: default; }
.choice:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

`munbeop/app/components/numbers-market/SpeedHud.vue`:
```vue
<script setup lang="ts">
interface Props {
  timeLeft: number
  score: number
  combo: number
  best: number
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="hud">
    <span class="hud__time" :class="{ 'hud__time--low': timeLeft <= 10 }" role="timer">⏱ {{ timeLeft }}</span>
    <span class="hud__score">{{ t('numberMarket.score') }} {{ score }}</span>
    <span v-if="combo >= 2" class="hud__combo" role="status">🔥 {{ combo }}</span>
    <span class="hud__best">{{ t('numberMarket.speed.best') }} {{ best }}</span>
  </div>
</template>

<style scoped>
.hud { display: flex; align-items: center; gap: 14px; padding: 8px 12px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); font-family: 'Press Start 2P', monospace; font-size: 11px; color: var(--ink); }
.hud__time--low { color: var(--danger, #c62828); }
.hud__combo { color: var(--accent-bright, #2e7d32); }
.hud__best { margin-left: auto; color: var(--ink-soft); }
</style>
```

`munbeop/app/components/numbers-market/SpeedSummary.vue`:
```vue
<script setup lang="ts">
interface Props {
  score: number
  best: number
  bestStreak: number
  isRecord: boolean
}
defineProps<Props>()
const emit = defineEmits<{ again: []; restart: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="summary" role="status">
    <p class="summary__time-up">{{ t('numberMarket.speed.time_up') }}</p>
    <p class="summary__score">{{ t('numberMarket.score') }}: {{ score }}</p>
    <p v-if="isRecord" class="summary__record">🏆 {{ t('numberMarket.speed.new_record') }}</p>
    <p class="summary__meta">{{ t('numberMarket.speed.best') }} {{ best }} · {{ t('numberMarket.speed.streak') }} {{ bestStreak }}</p>
    <div class="summary__actions">
      <button type="button" class="summary__btn summary__btn--primary" @click="emit('again')">{{ t('numberMarket.speed.again') }}</button>
      <button type="button" class="summary__btn" @click="emit('restart')">{{ t('numberMarket.restart') }}</button>
    </div>
  </div>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.summary__time-up { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 13px; color: var(--ink); }
.summary__score { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--accent-bright, #2e7d32); }
.summary__record { margin: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--accent-bright, #2e7d32); }
.summary__meta { margin: 0; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.summary__actions { display: flex; gap: 10px; margin-top: 6px; }
.summary__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.summary__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

`munbeop/app/components/numbers-market/ModeToggle.vue`:
```vue
<script setup lang="ts">
interface Props {
  modelValue: 'learn' | 'speed'
}
defineProps<Props>()
defineEmits<{ 'update:modelValue': [mode: 'learn' | 'speed'] }>()
const { t } = useI18n()
const MODES = [
  { id: 'learn' as const, key: 'numberMarket.mode.learn' },
  { id: 'speed' as const, key: 'numberMarket.mode.speed' },
]
</script>

<template>
  <div class="toggle" role="group" :aria-label="t('numberMarket.mode.label')">
    <button
      v-for="mode in MODES"
      :key="mode.id"
      type="button"
      class="toggle__btn"
      :class="{ 'toggle__btn--active': modelValue === mode.id }"
      :aria-pressed="modelValue === mode.id ? 'true' : 'false'"
      data-testid="mode-option"
      @click="$emit('update:modelValue', mode.id)"
    >{{ t(mode.key) }}</button>
  </div>
</template>

<style scoped>
.toggle { display: inline-flex; border: 2px solid var(--ink-line); }
.toggle__btn { font-family: 'Inter', sans-serif; font-size: 13px; padding: 8px 16px; background: var(--paper, var(--surface)); border: none; color: var(--ink-soft); cursor: pointer; }
.toggle__btn + .toggle__btn { border-left: 2px solid var(--ink-line); }
.toggle__btn--active { background: var(--accent, #2e7d32); color: var(--paper, #fff); }
.toggle__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; }
</style>
```

- [ ] **Step 4: Run the tests — PASS.** `pnpm exec vitest run tests/components/numbers-market/ChoiceRow.test.ts tests/components/numbers-market/ModeToggle.test.ts`. (SpeedHud/SpeedSummary are simple presentational; they're exercised by the page integration in Task 4 — no dedicated unit test needed.)

- [ ] **Step 5: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/components/numbers-market/ChoiceRow.vue munbeop/app/components/numbers-market/SpeedHud.vue munbeop/app/components/numbers-market/SpeedSummary.vue munbeop/app/components/numbers-market/ModeToggle.vue munbeop/tests/components/numbers-market/ChoiceRow.test.ts munbeop/tests/components/numbers-market/ModeToggle.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): speed-mode components (choices, HUD, summary, mode toggle)"
```

---

## Task 4: Page integration + i18n

**Files:**
- Modify: `munbeop/app/pages/practice/number-market.vue`
- Modify: all 8 `munbeop/i18n/locales/*.json`
- Test: `munbeop/tests/unit/numbers-market/i18n-parity.test.ts` (extend KEYS)

- [ ] **Step 1: Extend the i18n parity test (failing).** In `munbeop/tests/unit/numbers-market/i18n-parity.test.ts`, add these entries to the `KEYS` array:
```ts
  'numberMarket.mode.label', 'numberMarket.mode.learn', 'numberMarket.mode.speed',
  'numberMarket.speed.deck_mixed', 'numberMarket.speed.best', 'numberMarket.speed.streak',
  'numberMarket.speed.time_up', 'numberMarket.speed.new_record', 'numberMarket.speed.again',
  'numberMarket.speed.start_hint',
```
Run it — FAIL (keys missing). `pnpm exec vitest run tests/unit/numbers-market/i18n-parity.test.ts`.

- [ ] **Step 2: Add the i18n keys to all 8 locales.** Add a `mode` block and a `speed` block under the existing `numberMarket` object in every `munbeop/i18n/locales/*.json`. en + es by hand; fr/pt-BR/th/id/vi/ja via a temp `munbeop/scripts/_add-nm-speed-i18n.mjs` (delete before commit; verify each locale diff is ADD-ONLY — match the file's existing indent/newline so nothing reformats).

en.json (add inside `numberMarket`):
```jsonc
"mode": { "label": "Mode", "learn": "Learn", "speed": "Speed" },
"speed": {
  "deck_mixed": "Mixed (all)",
  "best": "Best",
  "streak": "Best streak",
  "time_up": "Time's up!",
  "new_record": "New record!",
  "again": "Play again",
  "start_hint": "60 seconds — read as many as you can."
}
```
es.json:
```jsonc
"mode": { "label": "Modo", "learn": "Aprender", "speed": "Contrarreloj" },
"speed": {
  "deck_mixed": "Mezclado (todo)",
  "best": "Récord",
  "streak": "Mejor racha",
  "time_up": "¡Se acabó el tiempo!",
  "new_record": "¡Nuevo récord!",
  "again": "Jugar de nuevo",
  "start_hint": "60 segundos — lee todos los que puedas."
}
```
Temp script for the other 6 (same shape as the Plan-1 i18n script):
```js
// scripts/_add-nm-speed-i18n.mjs  (TEMPORARY — delete before commit)
import { readFileSync, writeFileSync } from 'node:fs'
const T = {
  fr: { label: 'Mode', learn: 'Apprendre', speed: 'Chrono', deck_mixed: 'Mélangé (tout)', best: 'Record', streak: 'Meilleure série', time_up: 'Temps écoulé !', new_record: 'Nouveau record !', again: 'Rejouer', start_hint: '60 secondes — lis-en le plus possible.' },
  'pt-BR': { label: 'Modo', learn: 'Aprender', speed: 'Contra o tempo', deck_mixed: 'Misto (tudo)', best: 'Recorde', streak: 'Melhor sequência', time_up: 'Tempo esgotado!', new_record: 'Novo recorde!', again: 'Jogar de novo', start_hint: '60 segundos — leia o máximo que puder.' },
  th: { label: 'โหมด', learn: 'เรียนรู้', speed: 'จับเวลา', deck_mixed: 'รวม (ทั้งหมด)', best: 'สถิติ', streak: 'สตรีคดีที่สุด', time_up: 'หมดเวลา!', new_record: 'สถิติใหม่!', again: 'เล่นอีกครั้ง', start_hint: '60 วินาที — อ่านให้ได้มากที่สุด' },
  id: { label: 'Mode', learn: 'Belajar', speed: 'Lawan waktu', deck_mixed: 'Campuran (semua)', best: 'Terbaik', streak: 'Rentet terbaik', time_up: 'Waktu habis!', new_record: 'Rekor baru!', again: 'Main lagi', start_hint: '60 detik — baca sebanyak mungkin.' },
  vi: { label: 'Chế độ', learn: 'Học', speed: 'Tính giờ', deck_mixed: 'Trộn (tất cả)', best: 'Kỷ lục', streak: 'Chuỗi tốt nhất', time_up: 'Hết giờ!', new_record: 'Kỷ lục mới!', again: 'Chơi lại', start_hint: '60 giây — đọc càng nhiều càng tốt.' },
  ja: { label: 'モード', learn: '学習', speed: 'タイムアタック', deck_mixed: 'ミックス（全部）', best: 'ベスト', streak: '最高連続', time_up: '時間切れ！', new_record: '新記録！', again: 'もう一度', start_hint: '60秒 — できるだけ多く読もう。' },
}
for (const [code, v] of Object.entries(T)) {
  const path = `i18n/locales/${code}.json`
  const j = JSON.parse(readFileSync(path, 'utf8'))
  j.numberMarket = j.numberMarket || {}
  j.numberMarket.mode = { label: v.label, learn: v.learn, speed: v.speed }
  j.numberMarket.speed = {
    deck_mixed: v.deck_mixed, best: v.best, streak: v.streak, time_up: v.time_up,
    new_record: v.new_record, again: v.again, start_hint: v.start_hint,
  }
  writeFileSync(path, JSON.stringify(j, null, 2) + '\n', 'utf8')
}
console.log('added numberMarket.speed keys')
```
Run from `munbeop/`, then `rm scripts/_add-nm-speed-i18n.mjs`. **Important:** verify the existing 2-space/newline format is preserved (per Plan 1, the files are 2-space) and that `git diff` shows ONLY the added `mode`/`speed` blocks — if a whole file reformats, fix the script.

- [ ] **Step 3: Integrate the page.** Replace `munbeop/app/pages/practice/number-market.vue` with:

```vue
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DomainPicker from '~/components/numbers-market/DomainPicker.vue'
import ModeToggle from '~/components/numbers-market/ModeToggle.vue'
import PromptStage from '~/components/numbers-market/PromptStage.vue'
import TileTray from '~/components/numbers-market/TileTray.vue'
import MarketSummary from '~/components/numbers-market/MarketSummary.vue'
import MasterStrip from '~/components/numbers-market/MasterStrip.vue'
import ChoiceRow from '~/components/numbers-market/ChoiceRow.vue'
import SpeedHud from '~/components/numbers-market/SpeedHud.vue'
import SpeedSummary from '~/components/numbers-market/SpeedSummary.vue'
import { useNumberMarket } from '~/composables/useNumberMarket'
import { useNumberSpeed } from '~/composables/useNumberSpeed'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { NumberDomain } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const m = useNumberMarket()
const s = useNumberSpeed()
const mode = ref<'learn' | 'speed'>('learn')
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function startTimer() {
  stopTimer()
  if (typeof window === 'undefined') return
  timer = setInterval(() => {
    s.tick()
    if (s.phase.value === 'done') stopTimer()
  }, 1000)
}
onBeforeUnmount(stopTimer)

const dirty = () =>
  started.value && (mode.value === 'learn' ? m.phase.value !== 'done' : s.phase.value === 'playing')
useGameLeaveGuard(dirty)

function begin(deckId: string) {
  started.value = true
  phase.value = 'play'
  if (mode.value === 'learn') {
    m.selectDomain(deckId as NumberDomain)
    m.start()
  } else {
    s.start(deckId)
    startTimer()
  }
}
function restart() {
  stopTimer()
  phase.value = 'pick'
  started.value = false
}
function playAgain() {
  s.start(s.deckId.value)
  startTimer()
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="숫자 시장" :latin="t('numberMarket.title')" />
    <p class="lab__lead">{{ t('numberMarket.lead') }}</p>

    <MasterStrip
      :per-domain="m.master.perDomain.value"
      :done-count="m.master.doneCount.value"
      :total="m.master.total.value"
      :earned="m.master.earned.value"
    />

    <template v-if="phase === 'pick'">
      <ModeToggle v-model="mode" />
      <p class="lab__hint">{{ mode === 'speed' ? t('numberMarket.speed.start_hint') : t('numberMarket.build_hint') }}</p>
      <button
        v-if="mode === 'speed'"
        type="button"
        class="lab__mixed"
        data-testid="speed-mixed"
        @click="begin('mixed')"
      >🎲 {{ t('numberMarket.speed.deck_mixed') }}</button>
      <DomainPicker @select="begin" />
    </template>

    <!-- LEARN -->
    <template v-else-if="mode === 'learn'">
      <p
        v-if="m.runMode.value === 'replay' && m.phase.value !== 'done'"
        class="lab__replay"
        role="status"
      >
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="m.phase.value !== 'done'"
        :total="m.sessionItems.value.length"
        :progress="m.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="m.phase.value !== 'done'">
        <PromptStage
          :item="m.item.value"
          :reveal="m.phase.value === 'right' || m.phase.value === 'wrong'"
        />
        <p v-if="m.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">
          ✓ {{ t('numberMarket.correct') }}
        </p>
        <p v-else-if="m.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">
          ✗ {{ t('numberMarket.wrong') }}
        </p>
        <TileTray
          :pool="m.pool.value"
          :built="m.built.value"
          :phase="m.phase.value"
          @place="m.placeTile"
          @undo="m.undoTile"
          @clear="m.clearTiles"
          @submit="m.submit"
        />
        <button
          v-if="m.phase.value === 'right' || m.phase.value === 'wrong'"
          type="button"
          class="lab__next"
          @click="m.next"
        >
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="m.score.value"
        :failed-items="m.failedItems.value"
        @restart="restart"
        @replay-failed="m.replayFailed"
      />
    </template>

    <!-- SPEED -->
    <template v-else>
      <SpeedHud
        :time-left="s.timeLeft.value"
        :score="s.score.value"
        :combo="s.combo.value"
        :best="s.bestScore.value"
      />
      <template v-if="s.phase.value === 'playing'">
        <PromptStage :item="s.item.value" />
        <ChoiceRow :choices="s.choices.value" @choose="s.answer" />
      </template>
      <SpeedSummary
        v-else
        :score="s.score.value"
        :best="s.bestScore.value"
        :best-streak="s.bestStreak.value"
        :is-record="s.score.value > 0 && s.score.value >= s.bestScore.value"
        @again="playAgain"
        @restart="restart"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 18px; }
.lab__lead { margin: 0; font-family: 'Inter', sans-serif; color: var(--ink-soft, var(--text-soft)); line-height: 1.6; }
.lab__hint { margin: 0; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.lab__mixed { align-self: flex-start; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; padding: 12px 18px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.lab__mixed:hover { border-color: var(--ink); }
.lab__mixed:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
.lab__verdict { margin: 0; font-family: 'Inter', sans-serif; font-size: 15px; }
.lab__verdict--ok { color: var(--accent-bright, #2e7d32); }
.lab__verdict--no { color: var(--danger, #c62828); }
.lab__next { align-self: flex-start; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 18px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.lab__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Run the parity test — PASS**, then the full feature gates from `munbeop/`:
```
pnpm exec vitest run tests/unit/numbers-market tests/components/numbers-market
pnpm typecheck
pnpm lint
```
All green. Fix any `vue-tsc`/eslint issues in the new/edited files (`isRecord` boolean, attribute order, self-closing, unused imports). Confirm the temp i18n script is deleted and `git status` is clean after the commit.

- [ ] **Step 5: Commit.**
```bash
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" add munbeop/app/pages/practice/number-market.vue munbeop/i18n/locales munbeop/tests/unit/numbers-market/i18n-parity.test.ts
git -C "C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/funny-satoshi-c6b7f0" commit -m "feat(number-market): wire speed mode into the page (toggle + timer + HUD) + i18n x8"
```

---

## Task 5: Final review + verification

**Files:** none (verification only).

- [ ] **Step 1: Full gates.** From `munbeop/`: `pnpm test` (whole suite green), `pnpm typecheck`, `pnpm lint` (0 errors). Report counts.

- [ ] **Step 2: Preview smoke (if a logged-in instance is available).** Open `/practice/number-market`, switch the toggle to **Speed**, start the **Mixed** deck, confirm: the HUD counts down, correct taps raise score + combo, the combo 🔥 appears at ≥2, at 0s the SpeedSummary shows with a best score, and "Play again" restarts the timer. Capture a screenshot. (The route is auth-gated; if no login is available, note this for the owner.)

- [ ] **Step 3: Self-review.** Confirm: no migration, no SRS/log writes (only `useActivityStore().record()`), Learn mode unchanged, best-score persisted under `number-market.speed.best`, the page timer is cleared on `done`/unmount/restart (no leaked interval). Dictation (받아쓰기 + audio) remains out of scope (its own later plan).

## Out of scope (this plan) → later

받아쓰기 (Dictation: 🔊 edge-tts audio prompt → numeral entry, with the audio-generation pipeline) is a separate plan, since it needs the TTS asset pipeline. The seed already carries `valueKey` for that.

## Self-review notes (author)
- **Spec coverage:** timed 4-choice (§modes Speed) → Tasks 1–4; combo/streak + best score (§Speed) → Task 2 + SpeedHud/SpeedSummary; per-domain + `mixed` deck (§domain map 종합) → `poolFor`/the mixed button; mode toggle + "just try it" (Speed always available) → ModeToggle + page. Gating Speed behind a cleared Learn deck is intentionally simplified to "always available" (noted) — lower friction, no mastery coupling.
- **Type consistency:** `choicesFor(item, source, shuffleFn)` (Task 1) is consumed unchanged by `useNumberSpeed` (Task 2); the composable's returned refs (`timeLeft/score/combo/bestScore/choices/item/phase/deckId/bestStreak`) match exactly what SpeedHud/SpeedSummary/ChoiceRow props and the page consume; `'update:modelValue'` payload type `'learn'|'speed'` matches the page `mode` ref.
- **No placeholders:** every code step is complete; the i18n temp script is fully written for all 6 remaining locales.
