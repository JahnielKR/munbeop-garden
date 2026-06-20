# Choque clash-set expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the Particle Lab Choque drill into N configurable clash sets, add 5 new confusable-particle pairs + a set picker, and add 에게/한테·부터·까지 to the grammar catalog.

**Architecture:** A `ClashSet` is a pair of `ClashFamily` (each invariant or 받침-allomorph). The pure engine (`correctForm`/`judge`/`deriveOptions`) takes the set; items reference `setId`+`familyIndex`. The composable is parameterized by set id; a chip picker chooses the set. Built in 3 phases: (1) engine + migrate the existing set, (2) picker UX, (3) new content + catalog, with an adversarial 8-locale verification workflow.

**Tech Stack:** Nuxt 4 SPA, Vue 3, TypeScript, Pinia, @nuxtjs/i18n (8 locales), vitest + happy-dom + @vue/test-utils, pnpm. Commands from `munbeop/`.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Edit | `app/lib/domain/particles.ts` | Replace drill types with `ClashFamily`/`ClashSet`/`DrillItem`/`DrillVerdict` |
| Edit | `app/lib/particle-lab/drill.ts` | Generalized `formsOf`/`familyFormFor`/`correctForm`/`correctSentence`/`deriveOptions`/`judge`; keep `scoreOf` |
| Create | `app/seed/clash-sets.ts` | The 6 `ClashSet` defs + `clashSetById`, `particleFamilyGrammarKo` |
| Edit | `app/seed/particle-drills.ts` | Migrate 12 items to `setId`+`familyIndex`; +5 new sets of items |
| Edit | `app/seed/grammars-n1.ts` | Add `에게/한테`, `부터`, `까지` Grammar entries |
| Edit | `app/composables/useParticleDrill.ts` | `useParticleDrill(setId?)`; set-keyed items + SRS/diary writes |
| Create | `app/components/particle-lab/DrillSetPicker.vue` | Chip row to pick a clash set |
| Edit | `app/components/particle-lab/DrillCard.vue` | Take `set` prop; render `deriveOptions(set)` (2–4) |
| Edit | `app/components/particle-lab/DrillOption.vue` | `choice: string` |
| Edit | `app/components/particle-lab/DrillSummary.vue` | `set` prop; review uses `correctForm(item,set)` |
| Edit | `app/pages/practice/particles.vue` | Pass `set`; render picker; sync `?set=` |
| Edit | `i18n/locales/*.json` | `particles.drill.set_picker_label` ×8 |
| Edit | `tests/unit/particle-lab/drill.test.ts` | New signatures + an invariant set |
| Edit | `tests/components/particle-lab/DrillCard.test.ts` | `set` prop + dynamic options |
| Create | `tests/unit/particle-lab/clash-sets.test.ts` | Integrity of all sets/items |

---

## PHASE 1 — Engine generalization + migrate the existing set

### Task 1: Generalize domain types + engine + clash-sets, migrate the 12 items, rewrite engine tests

This is a coupled type refactor: types, engine, the first set, the seed migration, and the unit tests change together. Intermediate compile errors are expected until Step 6; the task is green at Step 7.

**Files:** edit `app/lib/domain/particles.ts`, `app/lib/particle-lab/drill.ts`, `app/seed/particle-drills.ts`; create `app/seed/clash-sets.ts`; rewrite `tests/unit/particle-lab/drill.test.ts`.

- [ ] **Step 1: Replace the drill block in `app/lib/domain/particles.ts`**

Find the existing block starting at `/** ── Drill (은/는 vs 이/가) ── */` (the `DrillFamily`, `DrillChoice`, `DrillItem`, `DrillVerdict` declarations) and replace it with:

```ts
/** ── Drill (clash sets) ─────────────────────────────────────────────── */

interface ClashFamilyBase {
  /** Stable id, e.g. 'topic', 'place-static', 'recipient'. */
  id: string
  /** Short label for chips / feedback. */
  label: LocalizedString
  /** Grammar.ko this family maps to — SRS, diary, study sheet. */
  grammarKo: string
}
export type ClashFamily =
  | (ClashFamilyBase & { invariant: true; form: string })
  | (ClashFamilyBase & { invariant: false; afterConsonant: string; afterVowel: string })

export interface ClashSet {
  id: string
  /** Short bilingual name for the set picker. */
  name: LocalizedString
  families: [ClashFamily, ClashFamily]
}

export interface DrillItem {
  id: string
  /** Disambiguating situation shown above the sentence. */
  cue: LocalizedString
  /** Optional Korean rendered before the gap noun (e.g. '코끼리는 '). */
  lead?: string
  /** Noun that receives the particle. */
  noun: string
  /** Sentence remainder after the gap, leading space included. */
  rest: string
  /** Which ClashSet this item belongs to. */
  setId: string
  /** Which of the set's two families is correct here. */
  familyIndex: 0 | 1
  /** Why this family wins. Shown on answer; reused as auto diary note. */
  reason: LocalizedString
  /** Translation of the correct full sentence. */
  trans: LocalizedString
}

export type DrillVerdict =
  | { kind: 'correct' }
  | { kind: 'blocked'; expected: string; nounHasBatchim: boolean }
  | { kind: 'wrong-family'; expected: string; familyId: string }
```

- [ ] **Step 2: Rewrite `app/lib/particle-lab/drill.ts`**

Replace the whole file with:

```ts
import type { ClashFamily, ClashSet, DrillItem, DrillVerdict } from '../domain/particles'
import { hasBatchim } from './hangul'

/** Every surface form a family can take (1 for invariant, 2 for allomorph). */
export function formsOf(f: ClashFamily): string[] {
  return f.invariant ? [f.form] : [f.afterConsonant, f.afterVowel]
}

/** The token a family takes for `noun` (받침-selected for allomorph families). */
export function familyFormFor(f: ClashFamily, noun: string): string {
  if (f.invariant) return f.form
  return hasBatchim(noun) ? f.afterConsonant : f.afterVowel
}

export function correctForm(item: DrillItem, set: ClashSet): string {
  return familyFormFor(set.families[item.familyIndex], item.noun)
}

/** Full correct sentence (lead + noun+form + rest). */
export function correctSentence(item: DrillItem, set: ClashSet): string {
  return `${item.lead ?? ''}${item.noun}${correctForm(item, set)}${item.rest}`
}

/** Answer options: family-0 forms then family-1 forms, de-duplicated. */
export function deriveOptions(set: ClashSet): string[] {
  return [...new Set([...formsOf(set.families[0]), ...formsOf(set.families[1])])]
}

/**
 * Two-layer judgement:
 *  - right family, wrong allomorph → 'blocked' (받침 slip, retry)
 *  - wrong family                  → 'wrong-family' (semantic error, ends item)
 */
export function judge(item: DrillItem, choice: string, set: ClashSet): DrillVerdict {
  const expected = correctForm(item, set)
  if (choice === expected) return { kind: 'correct' }
  const correct = set.families[item.familyIndex]
  if (formsOf(correct).includes(choice)) {
    return { kind: 'blocked', expected, nounHasBatchim: hasBatchim(item.noun) }
  }
  return { kind: 'wrong-family', expected, familyId: correct.id }
}

export interface DrillItemResult {
  itemId: string
  /** The item ended on a correct answer (blocked retries don't break this). */
  correct: boolean
  batchimSlips: number
}

export interface DrillScore {
  total: number
  correct: number
  batchimSlips: number
  /** correct / total, 0 when empty. */
  accuracy: number
}

export function scoreOf(results: DrillItemResult[]): DrillScore {
  const total = results.length
  const correct = results.filter((r) => r.correct).length
  const batchimSlips = results.reduce((acc, r) => acc + r.batchimSlips, 0)
  return { total, correct, batchimSlips, accuracy: total === 0 ? 0 : correct / total }
}
```

- [ ] **Step 3: Create `app/seed/clash-sets.ts` with the `topic-subject` set only (others added in Phase 3)**

```ts
import type { ClashFamily, ClashSet } from '~/lib/domain'
import { L } from './locale'

const TOPIC: ClashFamily = {
  id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는',
  label: L('topic', 'tema', 'thème', 'tópico', 'หัวเรื่อง', 'topik', 'chủ đề', '主題'),
}
const SUBJECT: ClashFamily = {
  id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가',
  label: L('subject', 'sujeto', 'sujet', 'sujeito', 'ประธาน', 'subjek', 'chủ ngữ', '主語'),
}

export const CLASH_SETS: ClashSet[] = [
  {
    id: 'topic-subject',
    name: L('은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가', '은/는 vs 이/가'),
    families: [TOPIC, SUBJECT],
  },
]

export function clashSetById(id: string): ClashSet | undefined {
  return CLASH_SETS.find((s) => s.id === id)
}
export const DEFAULT_CLASH_SET_ID = 'topic-subject'
```

- [ ] **Step 4: Migrate `app/seed/particle-drills.ts`**

Change the import to `import type { DrillItem } from '~/lib/domain'` (unchanged). For each of the 12 items, REPLACE `family: 'topic',` with `setId: 'topic-subject',\n    familyIndex: 0,` and `family: 'subject',` with `setId: 'topic-subject',\n    familyIndex: 1,`. (d01,d03,d06,d08,d10 are topic→0; d02,d04,d05,d07,d09,d11,d12 are subject→1.) Nothing else changes.

- [ ] **Step 5: Rewrite `tests/unit/particle-lab/drill.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import type { ClashSet, DrillItem, LocalizedString } from '~/lib/domain'
import { correctForm, correctSentence, deriveOptions, judge, scoreOf } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const TOPIC_SUBJECT: ClashSet = {
  id: 'topic-subject', name: LS('t'),
  families: [
    { id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는', label: LS('topic') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}
const PLACE: ClashSet = {
  id: 'place', name: LS('place'),
  families: [
    { id: 'static', grammarKo: '에', invariant: true, form: '에', label: LS('static') },
    { id: 'action', grammarKo: '에서', invariant: true, form: '에서', label: LS('action') },
  ],
}

const item = (setId: string, familyIndex: 0 | 1, noun: string, rest: string, lead?: string): DrillItem =>
  ({ id: 't', cue: LS('c'), lead, noun, rest, setId, familyIndex, reason: LS('r'), trans: LS('t') })

const mulSubject = item('topic-subject', 1, '물', ' 맛있어요.')
const jeoTopic = item('topic-subject', 0, '저', ' 학생이에요.')
const kokkiri = item('topic-subject', 1, '코', ' 길어요.', '코끼리는 ')
const ddoChip = item('place', 1, '도서관', ' 공부해요.')

describe('drill engine (clash sets)', () => {
  it('derives the expected form from family + batchim', () => {
    expect(correctForm(mulSubject, TOPIC_SUBJECT)).toBe('이')
    expect(correctForm(jeoTopic, TOPIC_SUBJECT)).toBe('는')
    expect(correctForm(kokkiri, TOPIC_SUBJECT)).toBe('가')
  })

  it('assembles the correct sentence including lead', () => {
    expect(correctSentence(kokkiri, TOPIC_SUBJECT)).toBe('코끼리는 코가 길어요.')
    expect(correctSentence(mulSubject, TOPIC_SUBJECT)).toBe('물이 맛있어요.')
  })

  it('accepts the exact correct choice', () => {
    expect(judge(mulSubject, '이', TOPIC_SUBJECT)).toEqual({ kind: 'correct' })
  })

  it('blocks right family with wrong allomorph (받침 slip)', () => {
    expect(judge(mulSubject, '가', TOPIC_SUBJECT)).toEqual({ kind: 'blocked', expected: '이', nounHasBatchim: true })
    expect(judge(jeoTopic, '은', TOPIC_SUBJECT)).toEqual({ kind: 'blocked', expected: '는', nounHasBatchim: false })
  })

  it('flags wrong family as a semantic error', () => {
    expect(judge(mulSubject, '은', TOPIC_SUBJECT)).toEqual({ kind: 'wrong-family', expected: '이', familyId: 'subject' })
    expect(judge(jeoTopic, '가', TOPIC_SUBJECT)).toEqual({ kind: 'wrong-family', expected: '는', familyId: 'topic' })
  })

  it('derives 4 options for an allomorph set, 2 for an invariant set', () => {
    expect(deriveOptions(TOPIC_SUBJECT)).toEqual(['은', '는', '이', '가'])
    expect(deriveOptions(PLACE)).toEqual(['에', '에서'])
  })

  it('an invariant set is never blocked — wrong choice is wrong-family', () => {
    expect(judge(ddoChip, '에', PLACE)).toEqual({ kind: 'wrong-family', expected: '에서', familyId: 'action' })
    expect(judge(ddoChip, '에서', PLACE)).toEqual({ kind: 'correct' })
  })

  it('aggregates score with accuracy and slips', () => {
    const score = scoreOf([
      { itemId: 'a', correct: true, batchimSlips: 1 },
      { itemId: 'b', correct: true, batchimSlips: 0 },
      { itemId: 'c', correct: false, batchimSlips: 2 },
      { itemId: 'd', correct: true, batchimSlips: 0 },
    ])
    expect(score).toEqual({ total: 4, correct: 3, batchimSlips: 3, accuracy: 0.75 })
    expect(scoreOf([])).toEqual({ total: 0, correct: 0, batchimSlips: 0, accuracy: 0 })
  })
})
```

- [ ] **Step 6: Update the explore test's drill-free imports if needed** — `tests/unit/particle-lab/explore.test.ts` doesn't import drill types; no change. Verify by reading it.

- [ ] **Step 7: Run engine tests + typecheck**

Run: `pnpm test tests/unit/particle-lab/drill.test.ts tests/unit/particle-lab/explore.test.ts tests/unit/particle-lab/hangul.test.ts`
Expected: PASS (drill suite now 8 tests).
Run: `pnpm typecheck`
Expected: FAIL — `useParticleDrill.ts`, `DrillCard.vue`, `DrillSummary.vue`, `DrillOption.vue`, `particles.vue` still use the old signatures. Those are migrated in Phase 2 (Tasks 2–4). Do NOT commit yet; proceed to Phase 2 in the same working tree, then commit Phase 1+2 together at Task 4.

---

## PHASE 2 — Set-parameterized composable, components, picker, page

### Task 2: Parameterize `useParticleDrill` by clash set

**File:** edit `app/composables/useParticleDrill.ts`.

- [ ] **Step 1: Update imports + signature**

Replace the imports of `DrillChoice`/`DrillItem`/`DrillVerdict` with:

```ts
import type { ClashSet, DrillItem, DrillVerdict } from '~/lib/domain'
import { localized } from '~/lib/domain'
import { correctSentence, judge, scoreOf, type DrillItemResult } from '~/lib/particle-lab'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { CLASH_SETS, clashSetById, DEFAULT_CLASH_SET_ID } from '~/seed/clash-sets'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
```

Change the function to take a set id and resolve the set + its items:

```ts
export function useParticleDrill(initialSetId: string = DEFAULT_CLASH_SET_ID) {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const { t, locale } = useI18n()

  const selectedSetId = ref(clashSetById(initialSetId) ? initialSetId : DEFAULT_CLASH_SET_ID)
  const set = computed<ClashSet>(() => clashSetById(selectedSetId.value)!)
  const items = computed<DrillItem[]>(() =>
    PARTICLE_DRILLS.filter((it) => it.setId === selectedSetId.value),
  )
  const availableSets = CLASH_SETS
```

Replace `const item = computed(() => items[index.value]!)` with `const item = computed(() => items.value[index.value]!)` and `failedItems` to use `items.value`. Replace every `DrillChoice` type with `string`. Add a `selectSet`:

```ts
  function selectSet(id: string) {
    if (!clashSetById(id)) return
    selectedSetId.value = id
  }
```

- [ ] **Step 2: Update `start`, `answer`, `logMistake`, `finish` to use the set**

```ts
  async function start() {
    index.value = 0
    phase.value = 'question'
    verdict.value = null
    picked.value = null
    blockedChoices.value = new Set()
    results.value = []
    slipsThisItem.value = 0
    gardenGrew.value = false
    await Promise.all(set.value.families.map((f) => srsStore.markSeen(f.grammarKo)))
  }

  async function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    const v = judge(item.value, choice, set.value)
    verdict.value = v
    if (v.kind === 'correct') {
      results.value.push({ itemId: item.value.id, correct: true, batchimSlips: slipsThisItem.value })
      phase.value = 'right'
      return
    }
    if (v.kind === 'blocked') {
      slipsThisItem.value += 1
      const next = new Set(blockedChoices.value)
      next.add(choice)
      blockedChoices.value = next
      phase.value = 'blocked'
      return
    }
    results.value.push({ itemId: item.value.id, correct: false, batchimSlips: slipsThisItem.value })
    phase.value = 'wrong'
    await logMistake(item.value, choice)
  }

  async function logMistake(it: DrillItem, choice: string) {
    const grammarKo = set.value.families[it.familyIndex].grammarKo
    await logStore.add({
      ko: grammarKo,
      sentence: correctSentence(it, set.value),
      feedback: 'hard',
      errorNote: `${t('particles.drill.diary_note', { choice })} ${localized(it.reason, locale.value as LocaleCode)}`,
      errorDimension: 'particle',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(grammarKo)
  }

  async function finish() {
    if (score.value.accuracy < EASY_THRESHOLD) return
    for (const [idx, family] of set.value.families.entries()) {
      const corrects = items.value.filter(
        (i) => i.familyIndex === idx && results.value.some((r) => r.itemId === i.id && r.correct),
      )
      if (corrects.length < MIN_FAMILY_CORRECT) continue
      await logStore.add({
        ko: family.grammarKo,
        sentence: correctSentence(corrects[0]!, set.value),
        feedback: 'easy',
        errorNote: null,
        reviewState: 'correct',
        contextId: LAB_CONTEXT.id,
        contextName: LAB_CONTEXT.name,
      })
      await srsStore.recalculate(family.grammarKo)
      gardenGrew.value = true
    }
  }
```

Keep `LocaleCode` in the type import from `~/lib/domain`. Add `set`, `selectedSetId`, `availableSets`, `selectSet` to the returned object (keep all existing returns, with `items` now a computed).

- [ ] **Step 3: (verification deferred to Task 4)** — typecheck still red until components migrate; continue.

### Task 3: Generalize `DrillCard`, `DrillOption`, `DrillSummary`

**Files:** edit the three components.

- [ ] **Step 1: `DrillOption.vue`** — change `import type { DrillChoice }` usage: replace `choice: DrillChoice` with `choice: string` in the Props interface. No other change.

- [ ] **Step 2: `DrillCard.vue`** — update script + template:

```ts
import { computed } from 'vue'
import type { ClashSet, DrillItem, DrillVerdict } from '~/lib/domain'
import { correctForm, correctSentence, deriveOptions } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'
import DrillOption from './DrillOption.vue'

interface Props {
  item: DrillItem
  set: ClashSet
  phase: 'question' | 'blocked' | 'right' | 'wrong'
  verdict: DrillVerdict | null
  picked: string | null
  blockedChoices: ReadonlySet<string>
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; retry: []; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const answer = computed(() => correctForm(props.item, props.set))
const options = computed(() => deriveOptions(props.set))

function stateOf(choice: string): 'idle' | 'blocked' | 'correct' | 'wrong' {
  if (props.blockedChoices.has(choice)) return 'blocked'
  if (revealed.value && choice === answer.value) return 'correct'
  if (props.phase === 'wrong' && choice === props.picked) return 'wrong'
  return 'idle'
}
```

In the template, change `v-for="c in DRILL_CHOICES"` to `v-for="c in options"` and change `{{ correctSentence(item) }}` to `{{ correctSentence(item, set) }}`. Remove the `DRILL_CHOICES` import.

- [ ] **Step 3: `DrillSummary.vue`** — add a `set: ClashSet` prop and change `correctForm(item)` to `correctForm(item, set)` in the review list. Update imports.

```ts
import type { ClashSet, DrillItem } from '~/lib/domain'
import type { DrillScore } from '~/lib/particle-lab'
import { correctForm } from '~/lib/particle-lab'
// Props: add `set: ClashSet`
```
Template review line: `<strong>{{ correctForm(item, set) }}</strong>`.

### Task 4: `DrillSetPicker` + page wiring; verify Phase 1+2 green; commit

**Files:** create `app/components/particle-lab/DrillSetPicker.vue`; edit `app/pages/practice/particles.vue`; add i18n key.

- [ ] **Step 1: Create `DrillSetPicker.vue`**

```vue
<script setup lang="ts">
import type { ClashSet } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

interface Props {
  sets: ClashSet[]
  selected: string
}
defineProps<Props>()
const emit = defineEmits<{ select: [id: string] }>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <div class="set-picker">
    <h3 class="set-picker__title">{{ t('particles.drill.set_picker_label') }}</h3>
    <div class="set-picker__chips" role="group" :aria-label="t('particles.drill.set_picker_label')">
      <button
        v-for="s in sets"
        :key="s.id"
        type="button"
        class="set-picker__chip"
        :class="{ 'set-picker__chip--active': s.id === selected }"
        :aria-pressed="s.id === selected"
        data-testid="set-chip"
        @click="emit('select', s.id)"
      >
        <span lang="ko">{{ tl(s.name) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.set-picker { display: flex; flex-direction: column; gap: 8px; }
.set-picker__title {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.set-picker__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.set-picker__chip {
  padding: 8px 12px; background: var(--surface); border: 2px solid var(--border);
  font-family: var(--font-ko); font-size: var(--text-sm); color: var(--text-soft);
  cursor: pointer; transition: transform var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.set-picker__chip:hover { transform: translate(-1px, -1px); color: var(--text); }
.set-picker__chip--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.set-picker__chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 2: Add the i18n key to all 8 locales** — add `"set_picker_label"` under `particles.drill` in each `i18n/locales/*.json`: en `"Pick a clash"`, es `"Elige un choque"`, fr `"Choisis un duel"`, pt-BR `"Escolha um choque"`, th `"เลือกคู่ปะทะ"`, id `"Pilih duel"`, vi `"Chọn cặp"`, ja `"対決を選ぶ"`. (Use the same string-splice approach as the original particle i18n merge, or hand-edit since it's one key.)

- [ ] **Step 3: Wire `particles.vue`**

Add imports: `import DrillSetPicker from '~/components/particle-lab/DrillSetPicker.vue'`. After `const drill = useParticleDrill(...)`, initialize from the query: `useParticleDrill(typeof route.query.set === 'string' ? route.query.set : undefined)`. Add a handler:

```ts
async function onSelectSet(id: string) {
  drill.selectSet(id)
  await router.replace({ query: { ...route.query, mode: 'drill', set: id } })
  await drill.start()
}
```

In the drill template block, render the picker before `ProgressDots` when `drill.phase.value === 'question' && drill.index.value === 0`:

```vue
      <DrillSetPicker
        v-if="drill.phase.value !== 'done' && drill.phase.value === 'question' && drill.index.value === 0"
        :sets="drill.availableSets"
        :selected="drill.selectedSetId.value"
        @select="onSelectSet"
      />
```

Pass `:set="drill.set.value"` to `<DrillCard>` and `<DrillSummary>`.

- [ ] **Step 4: Run typecheck + the particle-lab tests + lint**

Run: `pnpm typecheck` → expect clean.
Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab` → DrillCard test will FAIL (needs the `set` prop). Fix it in Step 5.

- [ ] **Step 5: Update `tests/components/particle-lab/DrillCard.test.ts`**

Add a `TOPIC_SUBJECT` ClashSet const (same shape as the engine test) and pass `set: TOPIC_SUBJECT` in `mountCard`'s props. Change the wrong-phase assertion target sentence to `'책이 있어요.'` (unchanged — `correctSentence(item, set)`); the item's `family: 'subject'` becomes `setId: 'topic-subject', familyIndex: 1`. Full updated file:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DrillCard from '~/components/particle-lab/DrillCard.vue'
import type { ClashSet, DrillItem, LocalizedString } from '~/lib/domain'

const LS = (s: string): LocalizedString => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

const SET: ClashSet = {
  id: 'topic-subject', name: LS('t'),
  families: [
    { id: 'topic', grammarKo: '은/는', invariant: false, afterConsonant: '은', afterVowel: '는', label: LS('topic') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}
const item: DrillItem = {
  id: 't-chaek', cue: LS('what is on the table?'), noun: '책', rest: ' 있어요.',
  setId: 'topic-subject', familyIndex: 1, reason: LS('existence takes subject'), trans: LS('there is a book'),
}

function mountCard(overrides: Record<string, unknown> = {}) {
  return mount(DrillCard, {
    props: { item, set: SET, phase: 'question', verdict: null, picked: null, blockedChoices: new Set(), ...overrides },
  })
}

describe('DrillCard', () => {
  it('renders the cue and the four options', () => {
    const w = mountCard()
    expect(w.text()).toContain('what is on the table?')
    for (const c of ['은', '는', '이', '가']) expect(w.find(`[data-testid="drill-option-${c}"]`).exists()).toBe(true)
  })
  it('emits answer with the picked choice', async () => {
    const w = mountCard()
    await w.get('[data-testid="drill-option-이"]').trigger('click')
    expect(w.emitted('answer')).toEqual([['이']])
  })
  it('shows the batchim explanation and disables the blocked option', () => {
    const w = mountCard({ phase: 'blocked', verdict: { kind: 'blocked', expected: '이', nounHasBatchim: true }, picked: '가', blockedChoices: new Set(['가']) })
    expect(w.find('[data-testid="drill-blocked"]').exists()).toBe(true)
    expect(w.get('[data-testid="drill-option-가"]').attributes('disabled')).toBeDefined()
  })
  it('reveals the answer and reason in the wrong phase', () => {
    const w = mountCard({ phase: 'wrong', verdict: { kind: 'wrong-family', expected: '이', familyId: 'subject' }, picked: '은' })
    const fb = w.get('[data-testid="drill-feedback"]')
    expect(fb.text()).toContain('책이 있어요.')
    expect(fb.text()).toContain('existence takes subject')
  })
})
```

- [ ] **Step 6: Run typecheck + tests + lint, then commit Phase 1+2**

Run: `pnpm typecheck` → clean. `pnpm test tests/unit/particle-lab tests/components/particle-lab` → all pass. `npx eslint app/lib/particle-lab app/composables/useParticleDrill.ts app/components/particle-lab app/pages/practice/particles.vue app/seed/clash-sets.ts app/seed/particle-drills.ts tests/unit/particle-lab tests/components/particle-lab` → exit 0.

```bash
git add munbeop/app/lib munbeop/app/seed/clash-sets.ts munbeop/app/seed/particle-drills.ts munbeop/app/composables/useParticleDrill.ts munbeop/app/components/particle-lab munbeop/app/pages/practice/particles.vue munbeop/i18n/locales munbeop/tests/unit/particle-lab munbeop/tests/components/particle-lab
git commit -m "feat(particles): generalize the drill to configurable clash sets + set picker"
```

---

## PHASE 3 — New content + catalog entries

### Task 5: Add the 3 grammar catalog entries (에게/한테, 부터, 까지)

**File:** edit `app/seed/grammars-n1.ts` (TOPIK-1 particles).

- [ ] **Step 1:** Add three `Grammar` objects following the existing pattern (ko, meaning via `L()`, example, trans via `L()`, usageNotes via `L()`, `deckId: 'topik-1'`). Content for each is produced + verified by the content workflow in Task 6 (it returns the 8-locale `meaning`/`trans`/`usageNotes`); paste the verified objects here.

- [ ] **Step 2:** Run `pnpm test tests/unit -t "i18n"` and the grammar catalog tests to confirm parity; typecheck.

### Task 6: Generate + adversarially verify the 5 new sets' content, then add them

This is the content task. The curated source items live in the spec (`docs/superpowers/specs/2026-06-20-clash-expansion-design.md`). Use a Workflow to (a) draft the 8-locale `cue`/`reason`/`trans` for every item and the set `name`s and the 3 grammar entries, and (b) adversarially verify each Korean sentence + that `correctForm` matches the cue. Then hand-paste the verified data.

- [ ] **Step 1: Run the content workflow** (pipeline: per-set draft → per-item adversarial Korean verify). Each item verifier confirms: the sentence `lead+noun+correctForm+rest` is natural and correct Korean, the cue unambiguously selects the intended family, and flags any error. Fix flagged items.

- [ ] **Step 2: Add the 5 `ClashSet` defs to `app/seed/clash-sets.ts`** — `subject-object`, `place-static-action`, `place-recipient`, `also-only`, `from-until`, each with its two `ClashFamily` (forms + grammarKo per the spec table; recipient form `한테`, grammarKo `에게/한테`) and 8-locale `name`.

- [ ] **Step 3: Append the items to `app/seed/particle-drills.ts`** — for each set, ~6 `DrillItem`s with `setId`, `familyIndex`, and verified 8-locale `cue`/`reason`/`trans`. Use unique ids prefixed by set (e.g. `so-01-sagwa`).

- [ ] **Step 4: Create `tests/unit/particle-lab/clash-sets.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { CLASH_SETS, clashSetById } from '~/seed/clash-sets'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { correctForm, deriveOptions } from '~/lib/particle-lab'

describe('clash sets integrity', () => {
  it('every drill item references a real set + valid family index', () => {
    for (const it of PARTICLE_DRILLS) {
      const set = clashSetById(it.setId)
      expect(set, it.id).toBeTruthy()
      expect(it.familyIndex === 0 || it.familyIndex === 1).toBe(true)
    }
  })
  it('correctForm is a non-empty option of the set for every item', () => {
    for (const it of PARTICLE_DRILLS) {
      const set = clashSetById(it.setId)!
      const form = correctForm(it, set)
      expect(form.length, it.id).toBeGreaterThan(0)
      expect(deriveOptions(set), it.id).toContain(form)
    }
  })
  it('each set has at least 5 items and both families are represented', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(5)
      expect(items.some((i) => i.familyIndex === 0), set.id).toBe(true)
      expect(items.some((i) => i.familyIndex === 1), set.id).toBe(true)
    }
  })
})
```

- [ ] **Step 5: Verify + commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`. Then:
```bash
git add munbeop/app/seed munbeop/tests/unit/particle-lab/clash-sets.test.ts
git commit -m "feat(particles): 5 new Choque clash sets + grammar catalog entries"
```

### Task 7: Final verification

- [ ] Full `pnpm test` (all green), `pnpm typecheck`, `pnpm lint` (0 errors).
- [ ] Manual smoke (`pnpm dev`, logged in): the Choque tab shows the set chips; picking each runs its pair with the right option count (2 or 4); 받침-block works on 이가/을를; invariant sets never block; diary writes the right grammarKo; deep link `?mode=drill&set=also-only` works.

---

## Self-review

**Spec coverage:** engine generalization → Task 1; the 6 sets table → Task 1 (topic-subject) + Task 6 (5 new); curated items → Task 6 (from the spec); grammar catalog additions → Task 5; set-picker UX → Task 4; composable/component changes → Tasks 2–4; adversarial content verification → Task 6; testing (engine, integrity, component) → Tasks 1/4/6. All covered.

**Placeholder scan:** The only deferred content is the 8-locale strings + the 3 grammar entries' bodies, explicitly produced+verified by the Task 6 workflow from the curated source in the spec — a defined process, not a vague placeholder. All code (engine, set struct, composable, components, picker, tests) is complete.

**Type consistency:** `ClashFamily`/`ClashSet`/`DrillItem`(`setId`+`familyIndex`)/`DrillVerdict`(`familyId`) defined in Task 1 are used identically in Tasks 2–6. Engine fns take `(item, set)` / `(set)` consistently. `useParticleDrill(setId?)` returns `set`/`selectedSetId`/`availableSets`/`selectSet` used by Task 4's page + picker. `deriveOptions(set)` (single arg) is consistent across engine, DrillCard, and tests.
