# 활용 연습 — Conjugation Recognition Drill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A recognition-first verb-conjugation drill at `/practice/conjugation` (`활용 연습`) whose distractors are the systematic conjugation mistakes, built on the Step 5 Korean engine.

**Architecture:** Pure logic in `app/lib/conjugation-drill/` (distractor generator + round builder) → `useConjugationDrill` / `useConjugationMaster` composables → `conjugation-drill/` components → `pages/practice/conjugation.vue`. Reuses `app/lib/korean/` (untouched), the log store (mistake-feed, `errorDimension='ending'`, no SRS), and Particle Lab UI patterns. Self-contained `활용 마스터` via localStorage.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, vitest + @vue/test-utils, scoped CSS with the existing design tokens.

**Spec:** `docs/superpowers/specs/2026-06-21-conjugation-drill-design.md`

**Conventions for every task:** run commands from `munbeop/` (`cd munbeop`). Tests live under `munbeop/tests/`. Commit after each task. Korean string fragments (활용, 마스터, 연습, class labels) are verbatim — never translated.

---

## Task 1: Scaffold the pure lib — types, class defs, round builder skeleton

**Files:**
- Create: `munbeop/app/lib/conjugation-drill/drill.ts`
- Create: `munbeop/app/lib/conjugation-drill/index.ts`
- Test: `munbeop/tests/unit/conjugation-drill/drill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/conjugation-drill/drill.test.ts
import { describe, it, expect } from 'vitest'
import { DRILL_CLASSES, verbsForClass, buildItem, scoreOf } from '~/lib/conjugation-drill'
import { VERBS } from '~/lib/korean'

describe('drill classes', () => {
  it('exposes 9 real classes + mixed, mixed first', () => {
    expect(DRILL_CLASSES[0].id).toBe('mixed')
    expect(DRILL_CLASSES).toHaveLength(10)
    expect(DRILL_CLASSES.filter((c) => c.klass !== 'mixed')).toHaveLength(9)
  })
  it('verbsForClass filters by class; mixed = all', () => {
    expect(verbsForClass('mixed')).toEqual(VERBS)
    expect(verbsForClass('p_irr').every((v) => v.klass === 'p_irr')).toBe(true)
    expect(verbsForClass('p_irr').length).toBeGreaterThan(0)
  })
})

describe('buildItem', () => {
  it('produces exactly 4 unique options incl. the engine-correct form', () => {
    const v = VERBS.find((x) => x.dict === '듣다')!
    const item = buildItem(v, '-아/어요')
    expect(item.correct).toBe('들어요')
    expect(item.options).toContain('들어요')
    expect(item.options).toHaveLength(4)
    expect(new Set(item.options).size).toBe(4)
  })
})

describe('scoreOf', () => {
  it('counts correct results and accuracy', () => {
    const s = scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])
    expect(s.correct).toBe(1)
    expect(s.total).toBe(2)
    expect(s.accuracy).toBeCloseTo(0.5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- conjugation-drill/drill`
Expected: FAIL — cannot resolve `~/lib/conjugation-drill`.

- [ ] **Step 3: Write `drill.ts`**

```ts
// app/lib/conjugation-drill/drill.ts
import { conjugate, VERBS, ENDINGS } from '~/lib/korean'
import type { DatasetVerb, Ending, VerbClass } from '~/lib/korean'
import { buildDistractors } from './distractors'

export type DrillClassId = VerbClass | 'mixed'

export interface DrillClassDef {
  id: DrillClassId
  klass: DrillClassId
  /** Korean label for the picker (verbatim). */
  ko: string
}

/** mixed first, then the 9 engine classes in a stable order. */
export const DRILL_CLASSES: DrillClassDef[] = [
  { id: 'mixed', klass: 'mixed', ko: '전체' },
  { id: 'regular', klass: 'regular', ko: '규칙' },
  { id: 'p_irr', klass: 'p_irr', ko: 'ㅂ 불규칙' },
  { id: 't_irr', klass: 't_irr', ko: 'ㄷ 불규칙' },
  { id: 'eu_elision', klass: 'eu_elision', ko: 'ㅡ 탈락' },
  { id: 'reu_irr', klass: 'reu_irr', ko: '르 불규칙' },
  { id: 'h_irr', klass: 'h_irr', ko: 'ㅎ 불규칙' },
  { id: 's_irr', klass: 's_irr', ko: 'ㅅ 불규칙' },
  { id: 'l_drop', klass: 'l_drop', ko: 'ㄹ 탈락' },
  { id: 'hada', klass: 'hada', ko: '하다' },
]

export function classById(id: string): DrillClassDef | undefined {
  return DRILL_CLASSES.find((c) => c.id === id)
}

export function verbsForClass(klass: DrillClassId): DatasetVerb[] {
  return klass === 'mixed' ? VERBS : VERBS.filter((v) => v.klass === klass)
}

export interface ConjItem {
  id: string
  dict: string
  gloss: string
  klass: VerbClass
  ending: Ending
  correct: string
  /** correct + 3 distractors in a stable order; the composable shuffles for display. */
  options: string[]
}

export function buildItem(v: DatasetVerb, ending: Ending): ConjItem {
  const correct = conjugate(v.dict, v.klass, ending)
  const distractors = buildDistractors(v, ending, correct)
  return {
    id: `${v.dict}:${ending}`,
    dict: v.dict,
    gloss: v.gloss,
    klass: v.klass,
    ending,
    correct,
    options: [correct, ...distractors],
  }
}

/** All (verb, ending) pairs for a class, shuffled (caller provides shuffle), capped to n. */
export function buildRound(
  klass: DrillClassId,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
): ConjItem[] {
  const pairs = verbsForClass(klass).flatMap((v) => ENDINGS.map((e) => ({ v, e })))
  return shuffleFn(pairs)
    .slice(0, n)
    .map(({ v, e }) => buildItem(v, e))
}

export interface DrillResult {
  itemId: string
  correct: boolean
}

export function scoreOf(results: DrillResult[]) {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
```

- [ ] **Step 4: Write `index.ts`**

```ts
// app/lib/conjugation-drill/index.ts
export * from './drill'
export { buildDistractors } from './distractors'
```

- [ ] **Step 5: Run the test — it still fails (no `distractors.ts`)**

Run: `cd munbeop && pnpm test -- conjugation-drill/drill`
Expected: FAIL — cannot resolve `./distractors`. (Task 2 creates it; this proves the wiring.)

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/conjugation-drill/drill.ts munbeop/app/lib/conjugation-drill/index.ts munbeop/tests/unit/conjugation-drill/drill.test.ts
git commit -m "feat(conjugation): drill round builder + class defs (lib scaffold)"
```

---

## Task 2: Distractor generator (`distractors.ts`)

**Files:**
- Create: `munbeop/app/lib/conjugation-drill/distractors.ts`
- Test: `munbeop/tests/unit/conjugation-drill/distractors.test.ts`

- [ ] **Step 1: Write the failing test (hand-computed cases per strategy + invariants)**

```ts
// tests/unit/conjugation-drill/distractors.test.ts
import { describe, it, expect } from 'vitest'
import { buildDistractors } from '~/lib/conjugation-drill/distractors'
import { conjugate, VERBS, ENDINGS } from '~/lib/korean'

const verb = (dict: string) => VERBS.find((v) => v.dict === dict)!

describe('buildDistractors — strategy outputs', () => {
  it('naive-regular: irregular conjugated as regular (듣다)', () => {
    const d = buildDistractors(verb('듣다'), '-아/어요', '들어요')
    expect(d).toContain('듣어요') // ㄷ-irr treated regular
  })
  it('wrong-harmony: 먹다 -아/어요 yields 먹아요', () => {
    const d = buildDistractors(verb('먹다'), '-아/어요', '먹어요')
    expect(d).toContain('먹아요')
  })
  it('eu-error (insert): vowel stem 가다 -(으)니까 yields 가으니까', () => {
    const d = buildDistractors(verb('가다'), '-(으)니까', '가니까')
    expect(d).toContain('가으니까')
  })
  it('eu-error (drop): 받침 stem 먹다 -(으)니까 yields 먹니까', () => {
    const d = buildDistractors(verb('먹다'), '-(으)니까', '먹으니까')
    expect(d).toContain('먹니까')
  })
})

describe('buildDistractors — invariants over the whole dataset', () => {
  const HANGUL = /^[가-힣 ]+$/
  for (const v of VERBS) {
    for (const e of ENDINGS) {
      const correct = conjugate(v.dict, v.klass, e)
      const d = buildDistractors(v, e, correct)
      it(`${v.dict} ${e}: exactly 3, distinct, valid Hangul, never == correct`, () => {
        expect(d).toHaveLength(3)
        expect(new Set(d).size).toBe(3)
        expect(d).not.toContain(correct)
        for (const f of d) expect(f).toMatch(HANGUL)
      })
    }
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- conjugation-drill/distractors`
Expected: FAIL — cannot resolve `./distractors`.

- [ ] **Step 3: Write `distractors.ts`**

```ts
// app/lib/conjugation-drill/distractors.ts
import { compose, conjugate, decompose, VERBS } from '~/lib/korean'
import type { DatasetVerb, Ending, VerbClass } from '~/lib/korean'

// Jamo indices — mirror conjugate.ts (kept local so the engine stays untouched).
const A = 0
const EO = 4
const EU = 18
const IEUNG = 11
const T_NONE = 0
const T_SS = 20
const EU_SYL = compose(IEUNG, EU, T_NONE) // '으'

const ALL_CLASSES: VerbClass[] = [
  'regular', 'p_irr', 't_irr', 'eu_elision', 'reu_irr', 'h_irr', 's_irr', 'l_drop', 'hada',
]
const AE_ENDINGS = new Set<Ending>(['-아/어요', '-았/었어요'])
const EU_BODY: Partial<Record<Ending, string>> = {
  '-(으)니까': '니까',
  '-(으)면': '면',
  '-(으)세요': '세요',
}

function isHangul(s: string): boolean {
  return [...s].every(
    (c) => c === ' ' || (c.charCodeAt(0) >= 0xac00 && c.charCodeAt(0) <= 0xd7a3),
  )
}

/** Irregular conjugated as if regular — the canonical class error. null for regulars. */
function naiveRegular(v: DatasetVerb, ending: Ending, correct: string): string | null {
  if (v.klass === 'regular') return null
  const f = conjugate(v.dict, 'regular', ending)
  return f === correct ? null : f
}

/** Flip the harmonic vowel (아↔어) of a standalone IEUNG-led syllable. */
function flipHarmony(syl: string): string | null {
  const j = decompose(syl)
  if (j.lead !== IEUNG) return null
  if (j.vowel === A) return compose(j.lead, EO, j.tail)
  if (j.vowel === EO) return compose(j.lead, A, j.tail)
  return null
}

/** Wrong vowel harmony in the -아/어 family (먹어요→먹아요, 먹었어요→먹았어요). */
function wrongHarmony(correct: string, ending: Ending): string | null {
  if (!AE_ENDINGS.has(ending)) return null
  const chars = [...correct]
  if (ending === '-아/어요') {
    const i = chars.length - 2 // syllable before final 요
    if (i < 0) return null
    const flipped = flipHarmony(chars[i]!)
    if (!flipped) return null
    chars[i] = flipped
    return chars.join('')
  }
  // past: the ㅆ-tailed syllable (었/았), only when IEUNG-led (skips contracted 갔/봤/셨)
  const idx = chars.findIndex((c) => decompose(c).tail === T_SS)
  if (idx < 0) return null
  const j = decompose(chars[idx]!)
  if (j.lead !== IEUNG) return null
  const v = j.vowel === A ? EO : j.vowel === EO ? A : null
  if (v === null) return null
  chars[idx] = compose(j.lead, v, T_SS)
  return chars.join('')
}

/** Over/under-applied epenthetic 으 in the -(으) endings (가니까→가으니까, 먹으니까→먹니까). */
function euError(correct: string, ending: Ending): string | null {
  const body = EU_BODY[ending]
  if (!body) return null
  const stem = correct.slice(0, correct.length - body.length)
  if (stem.endsWith(EU_SYL)) return stem.slice(0, -1) + body // had 으 → drop
  return stem + EU_SYL + body // no 으 → insert
}

/** The verb conjugated under every other class (includes the naive-regular form). */
function crossClass(v: DatasetVerb, ending: Ending, correct: string): string[] {
  const out: string[] = []
  for (const k of ALL_CLASSES) {
    if (k === v.klass) continue
    let f: string
    try {
      f = conjugate(v.dict, k, ending)
    } catch {
      continue
    }
    if (f !== correct) out.push(f)
  }
  return out
}

/** Other verbs (same class first) — last-resort fillers. */
function fillerVerbs(v: DatasetVerb): DatasetVerb[] {
  const same = VERBS.filter((x) => x.klass === v.klass && x.dict !== v.dict)
  const other = VERBS.filter((x) => x.klass !== v.klass)
  return [...same, ...other]
}

export function buildDistractors(v: DatasetVerb, ending: Ending, correct: string): string[] {
  const ordered: (string | null)[] = [
    naiveRegular(v, ending, correct),
    wrongHarmony(correct, ending),
    euError(correct, ending),
    ...crossClass(v, ending, correct),
  ]
  const seen = new Set<string>([correct])
  const picked: string[] = []
  for (const f of ordered) {
    if (!f || seen.has(f) || !isHangul(f)) continue
    seen.add(f)
    picked.push(f)
    if (picked.length === 3) return picked
  }
  // Fallback: correct forms of other verbs (same class preferred) until we have 3.
  for (const other of fillerVerbs(v)) {
    const f = conjugate(other.dict, other.klass, ending)
    if (seen.has(f) || !isHangul(f)) continue
    seen.add(f)
    picked.push(f)
    if (picked.length === 3) break
  }
  return picked
}
```

- [ ] **Step 4: Run tests**

Run: `cd munbeop && pnpm test -- conjugation-drill/distractors`
Expected: PASS — strategy cases + all-dataset invariants green. If a specific (verb, ending) can't reach 3 distinct distractors, the fallback covers it; if any invariant fails, inspect the offending pair before adjusting strategy order.

- [ ] **Step 5: Re-run Task 1's drill test (now resolvable)**

Run: `cd munbeop && pnpm test -- conjugation-drill`
Expected: PASS (both files).

- [ ] **Step 6: Generate + adversarially verify a golden snapshot**

Create `munbeop/tools/conjugation-drill/gen-distractors.mjs` that imports nothing app-side but re-implements is unnecessary — instead, write a tiny vitest snapshot in the test file capturing `buildDistractors` for one representative verb per class across all 6 endings, then **dispatch a verification workflow** (Korean linguistics lens) over that snapshot asserting each listed distractor is (a) wrong and (b) a plausible learner error, not gibberish. Record the verdict in the spec's commit message. If the workflow flags an implausible distractor (e.g. a cross-class form that no learner would produce), lower `crossClass` below `euError`/`wrongHarmony` already done — additionally cap cross-class to `regular` only by replacing `...crossClass(...)` with `[naiveRegular(...)]` already covered; document any change.

Run: snapshot via `cd munbeop && pnpm test -- conjugation-drill/distractors`

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/conjugation-drill/distractors.ts munbeop/tests/unit/conjugation-drill/distractors.test.ts
git commit -m "feat(conjugation): error-model distractor generator + dataset invariants"
```

---

## Task 3: `useConjugationDrill` composable

**Files:**
- Create: `munbeop/app/composables/useConjugationDrill.ts`
- Test: `munbeop/tests/unit/conjugation-drill/useConjugationDrill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/conjugation-drill/useConjugationDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const add = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
const srsSpy = vi.fn()
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: srsSpy, recalculate: srsSpy }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

import { useConjugationDrill } from '~/composables/useConjugationDrill'

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear()
  srsSpy.mockClear()
})

describe('useConjugationDrill', () => {
  it('starts a round of N items for the selected class', () => {
    const d = useConjugationDrill()
    d.selectClass('p_irr')
    d.start()
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(d.sessionItems.value.length).toBeLessThanOrEqual(8)
    expect(d.phase.value).toBe('question')
  })

  it('a wrong answer logs ONE mistake with errorDimension=ending and 활용 LAB, and never touches SRS', async () => {
    const d = useConjugationDrill()
    d.start()
    const item = d.item.value
    const wrong = item.options.find((o) => o !== item.correct)!
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      errorDimension: 'ending',
      contextId: 'conjugation-lab',
      contextName: '활용 LAB',
      reviewState: 'incorrect',
      feedback: 'hard',
    })
    expect(srsSpy).not.toHaveBeenCalled()
  })

  it('a correct answer advances without logging', async () => {
    const d = useConjugationDrill()
    d.start()
    await d.answer(d.item.value.correct)
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
  })

  it('replayFailed re-drills only the missed items', async () => {
    const d = useConjugationDrill()
    d.start()
    // miss the first, ace the rest
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(it.options.find((o) => o !== it.correct)!)
      else await d.answer(it.correct)
      await d.next()
    }
    const failed = d.failedItems.value.length
    expect(failed).toBe(1)
    await d.replayFailed()
    expect(d.mode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- useConjugationDrill`
Expected: FAIL — cannot resolve the composable.

- [ ] **Step 3: Write the composable**

```ts
// app/composables/useConjugationDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  buildRound,
  classById,
  scoreOf,
  type ConjItem,
  type DrillClassId,
  type DrillResult,
} from '~/lib/conjugation-drill'
import { useLogStore } from '~/stores/log'

export type ConjPhase = 'question' | 'right' | 'wrong' | 'done'
export type ConjMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'conjugation-lab', name: '활용 LAB' }
const ROUND_SIZE = 8

export function useConjugationDrill(initialClassId: DrillClassId = 'mixed') {
  const logStore = useLogStore()
  const { t } = useI18n()

  const selectedClassId = ref<DrillClassId>(classById(initialClassId) ? initialClassId : 'mixed')
  const sessionItems = ref<ConjItem[]>([])
  const displayOptions = ref<string[]>([])
  const mode = ref<ConjMode>('normal')
  const index = ref(0)
  const phase = ref<ConjPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<ConjItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(item.value.options)
  }

  function selectClass(id: DrillClassId) {
    if (classById(id)) selectedClassId.value = id
  }

  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }

  function start() {
    mode.value = 'normal'
    sessionItems.value = buildRound(selectedClassId.value, ROUND_SIZE, shuffle)
    resetRound()
    shuffleOptions()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    shuffleOptions()
  }

  async function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    const correct = choice === item.value.correct
    results.value.push({ itemId: item.value.id, correct })
    phase.value = correct ? 'right' : 'wrong'
    if (!correct && mode.value === 'normal') await logMistake(item.value, choice)
  }

  async function next() {
    if (phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    shuffleOptions()
  }

  async function logMistake(it: ConjItem, choice: string) {
    await logStore.add({
      ko: it.dict,
      sentence: `${it.dict} + ${it.ending} → ${it.correct}`,
      feedback: 'hard',
      errorNote: t('conjugation.diary_note', { chosen: choice, correct: it.correct }),
      errorDimension: 'ending',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
  }

  return {
    selectedClassId,
    sessionItems,
    displayOptions,
    mode,
    index,
    phase,
    picked,
    item,
    score,
    failedItems,
    selectClass,
    start,
    replayFailed,
    answer,
    next,
  }
}
```

- [ ] **Step 4: Run tests**

Run: `cd munbeop && pnpm test -- useConjugationDrill`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useConjugationDrill.ts munbeop/tests/unit/conjugation-drill/useConjugationDrill.test.ts
git commit -m "feat(conjugation): useConjugationDrill — round flow + mistake-feed, no SRS"
```

---

## Task 4: `useConjugationMaster` composable (self-contained mastery)

**Files:**
- Create: `munbeop/app/lib/conjugation-drill/master.ts` (pure)
- Create: `munbeop/app/composables/useConjugationMaster.ts`
- Test: `munbeop/tests/unit/conjugation-drill/master.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/conjugation-drill/master.test.ts
import { describe, it, expect } from 'vitest'
import { MASTER_CLASS_IDS, masteryOf } from '~/lib/conjugation-drill/master'

describe('conjugation mastery (pure)', () => {
  it('tracks the 9 real classes (no mixed)', () => {
    expect(MASTER_CLASS_IDS).toHaveLength(9)
    expect(MASTER_CLASS_IDS).not.toContain('mixed')
  })
  it('earned only when all 9 are cleared', () => {
    const partial = masteryOf(new Set(['regular', 'p_irr']))
    expect(partial.doneCount).toBe(2)
    expect(partial.total).toBe(9)
    expect(partial.earned).toBe(false)
    const all = masteryOf(new Set(MASTER_CLASS_IDS))
    expect(all.earned).toBe(true)
    expect(all.perClass.every((p) => p.done)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- conjugation-drill/master`
Expected: FAIL — cannot resolve `master`.

- [ ] **Step 3: Write `master.ts`**

```ts
// app/lib/conjugation-drill/master.ts
import { DRILL_CLASSES } from './drill'
import type { VerbClass } from '~/lib/korean'

/** The 9 real classes (mixed is a play mode, not a mastery unit). */
export const MASTER_CLASS_IDS: VerbClass[] = DRILL_CLASSES.filter(
  (c) => c.klass !== 'mixed',
).map((c) => c.klass as VerbClass)

export interface ClassProgress {
  klass: VerbClass
  ko: string
  done: boolean
}

export function masteryOf(cleared: Set<string>) {
  const perClass: ClassProgress[] = DRILL_CLASSES.filter((c) => c.klass !== 'mixed').map((c) => ({
    klass: c.klass as VerbClass,
    ko: c.ko,
    done: cleared.has(c.klass),
  }))
  const doneCount = perClass.filter((p) => p.done).length
  return { perClass, doneCount, total: MASTER_CLASS_IDS.length, earned: doneCount === MASTER_CLASS_IDS.length }
}
```

- [ ] **Step 4: Write the composable**

```ts
// app/composables/useConjugationMaster.ts
import { computed, ref } from 'vue'
import { masteryOf } from '~/lib/conjugation-drill/master'
import type { VerbClass } from '~/lib/korean'

const STORAGE_KEY = 'conjugation-lab.cleared'
const EARNED_KEY = 'conjugation-lab.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useConjugationMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perClass = computed(() => view.value.perClass)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned)

  /** Call at round end with the class and the round accuracy. */
  function recordRound(klass: VerbClass, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(klass)) return
    const next = new Set(cleared.value)
    next.add(klass)
    cleared.value = next
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
    }
    if (view.value.earned && typeof localStorage !== 'undefined' && !localStorage.getItem(EARNED_KEY)) {
      localStorage.setItem(EARNED_KEY, '1')
      celebrate.value = true
    }
  }

  function dismiss() {
    celebrate.value = false
  }

  return { perClass, doneCount, total, earned, celebrate, recordRound, dismiss }
}
```

- [ ] **Step 5: Run tests; Step 6: Commit**

Run: `cd munbeop && pnpm test -- conjugation-drill/master` → PASS
```bash
git add munbeop/app/lib/conjugation-drill/master.ts munbeop/app/composables/useConjugationMaster.ts munbeop/tests/unit/conjugation-drill/master.test.ts
git commit -m "feat(conjugation): self-contained 활용 마스터 (localStorage, no SRS)"
```

---

## Task 5: i18n keys (8 locales)

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,id,ja,pt-BR,th,vi}.json`
- Test: `munbeop/tests/unit/conjugation-drill/i18n-keys.test.ts`

- [ ] **Step 1: Write the failing test (parity guard)**

```ts
// tests/unit/conjugation-drill/i18n-keys.test.ts
import { describe, it, expect } from 'vitest'
import en from '~~/i18n/locales/en.json'
import es from '~~/i18n/locales/es.json'
import fr from '~~/i18n/locales/fr.json'
import id from '~~/i18n/locales/id.json'
import ja from '~~/i18n/locales/ja.json'
import ptBR from '~~/i18n/locales/pt-BR.json'
import th from '~~/i18n/locales/th.json'
import vi from '~~/i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }
const keys = (o: Record<string, unknown>) => Object.keys((o as any).conjugation ?? {})

describe('conjugation i18n parity', () => {
  it('every locale has the same conjugation.* keys as en', () => {
    const base = keys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: keys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
})
```

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm test -- conjugation-drill/i18n-keys`)

- [ ] **Step 3: Add the `conjugation` block to each locale.** English (authoritative); the other 7 are translated **with the Korean fragments verbatim** (활용 / 마스터 / 연습 and the class labels 규칙·ㅂ 불규칙·… are identical in every locale). Insert with an idempotent Node string-replace script (repo pattern) or by hand.

```jsonc
// en.json — add this top-level "conjugation" block
"conjugation": {
  "title": "Conjugation Lab",
  "lead": "Pick the correct conjugated form. The wrong options are the mistakes learners actually make.",
  "pick_class": "PICK A CLASS",
  "prompt": "Conjugate into {ending}",
  "gloss_hint": "({gloss})",
  "pick_hint": "Tap the correct form.",
  "correct": "Correct!",
  "wrong": "Not quite",
  "reveal_correct": "Correct form: {correct}",
  "restart": "New round",
  "replay_failed": "Review mistakes ({n})",
  "replay_mode_label": "Review mode — your missed items",
  "summary_score": "{correct} / {total} correct",
  "diary_note": "You picked {chosen}; the form is {correct}.",
  "exit": "Back to Practice",
  "progress_label": "Question progress",
  "rule": {
    "regular": "Regular: add the ending to the stem with vowel harmony.",
    "p_irr": "ㅂ-irregular: ㅂ becomes 우 before a vowel (덥다 → 더워요).",
    "t_irr": "ㄷ-irregular: ㄷ becomes ㄹ before a vowel (듣다 → 들어요).",
    "eu_elision": "ㅡ-elision: stem ㅡ drops before -아/어 (바쁘다 → 바빠요).",
    "reu_irr": "르-irregular: 르 adds an extra ㄹ before -아/어 (빠르다 → 빨라요).",
    "h_irr": "ㅎ-irregular: ㅎ drops; the vowel fuses to ㅐ (그렇다 → 그래요).",
    "s_irr": "ㅅ-irregular: ㅅ drops before a vowel, no contraction (짓다 → 지어요).",
    "l_drop": "ㄹ-drop: stem ㄹ drops before ㄴ/ㅂ/ㅅ (살다 → 사니까), kept before ㅁ.",
    "hada": "하다: 하 becomes 해 (공부하다 → 공부해요)."
  },
  "master": {
    "label": "Conjugation Master",
    "title": "활용 마스터!",
    "progress": "{done}/{total} classes cleared",
    "earned": "All 9 classes cleared!",
    "celebrate_body": "You cleared all {total} conjugation classes. 화이팅!",
    "dismiss": "Nice!",
    "pip_done": "{ko} — cleared",
    "pip_todo": "{ko} — not yet"
  }
}
```

- [ ] **Step 4: Run → PASS.** Also run the repo's existing i18n-parity meta-test if present to confirm no global break.

- [ ] **Step 5: Commit**

```bash
git add munbeop/i18n/locales/*.json munbeop/tests/unit/conjugation-drill/i18n-keys.test.ts
git commit -m "i18n(conjugation): 활용 연습 strings ×8 (Korean fragments verbatim)"
```

---

## Task 6: `ConjugationOption` + `ConjugationCard` components

**Files:**
- Create: `munbeop/app/components/conjugation-drill/ConjugationOption.vue`
- Create: `munbeop/app/components/conjugation-drill/ConjugationCard.vue`
- Test: `munbeop/tests/components/conjugation-drill/ConjugationCard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/conjugation-drill/ConjugationCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationCard from '~/components/conjugation-drill/ConjugationCard.vue'

const item = {
  id: '듣다:-아/어요', dict: '듣다', gloss: 'listen', klass: 't_irr',
  ending: '-아/어요', correct: '들어요', options: ['들어요', '듣어요', '들으요', '듣아요'],
}

function factory(phase = 'question', picked: string | null = null) {
  return mount(ConjugationCard, {
    props: { item, options: item.options, phase, verdict: phase === 'wrong' ? false : phase === 'right' ? true : null, picked },
    global: { mocks: { $t: (k: string, p?: any) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ConjugationCard', () => {
  it('renders the dict form and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('듣다')
    expect(w.findAll('[data-testid^="conj-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="conj-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(item.options[0])
  })
  it('on wrong, reveals the correct form and a rule note', () => {
    const w = factory('wrong', '듣어요')
    expect(w.text()).toContain('conjugation.reveal_correct')
    expect(w.text()).toContain('conjugation.rule.t_irr')
  })
})
```

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm test -- ConjugationCard`)

- [ ] **Step 3: Write `ConjugationOption.vue`**

```vue
<script setup lang="ts">
interface Props {
  label: string
  state: 'idle' | 'correct' | 'wrong' | 'muted'
  disabled?: boolean
}
defineProps<Props>()
defineEmits<{ pick: [] }>()
</script>

<template>
  <button
    type="button"
    class="opt"
    :class="`opt--${state}`"
    :disabled="disabled"
    lang="ko"
    @click="$emit('pick')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.opt {
  padding: 12px 14px;
  background: var(--paper-deep);
  border: 2px solid var(--border);
  color: var(--text);
  font-family: var(--font-ko);
  font-size: var(--text-lg);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.opt:hover:not(:disabled) { border-color: var(--accent); }
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt--correct { border-color: var(--success); background: var(--surface); }
.opt--wrong { border-color: var(--danger); background: var(--surface); }
.opt--muted { opacity: 0.55; }
.opt:disabled { cursor: default; }
</style>
```

- [ ] **Step 4: Write `ConjugationCard.vue`**

```vue
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ConjItem } from '~/lib/conjugation-drill'
import ConjugationOption from './ConjugationOption.vue'

interface Props {
  item: ConjItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  verdict: boolean | null
  picked: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; next: [] }>()

const card = ref<HTMLDivElement | null>(null)
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.correct) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

// a11y (Particle Lab #10 pattern): focus the card each new question.
watch(
  () => [props.item.id, props.phase] as const,
  async ([, phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" :data-testid="`conj-card-${item.id}`">
    <div class="card__prompt">
      <span class="card__dict" lang="ko">{{ item.dict }}</span>
      <span class="card__gloss">{{ $t('conjugation.gloss_hint', { gloss: item.gloss }) }}</span>
      <span class="card__ending" lang="ko">{{ $t('conjugation.prompt', { ending: item.ending }) }}</span>
    </div>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('conjugation.pick_hint') }}</p>

    <div class="card__options">
      <ConjugationOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`conj-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('conjugation.correct') : $t('conjugation.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">
        {{ $t('conjugation.reveal_correct', { correct: item.correct }) }}
      </p>
      <p class="card__rule">{{ $t(`conjugation.rule.${item.klass}`) }}</p>
      <button type="button" class="card__next" @click="emit('next')">→</button>
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; flex-direction: column; gap: 16px; }
.card__prompt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }
.card__dict { font-family: var(--font-ko); font-weight: 700; font-size: 28px; color: var(--text); }
.card__gloss { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__ending {
  font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.04em; color: var(--text-soft); background: var(--surface);
  border: 2px solid var(--border); padding: 4px 8px;
}
.card__hint { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card__feedback { display: flex; flex-direction: column; gap: 8px; }
.card__verdict { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); }
.card__verdict--ok { color: var(--heading-accent); }
.card__verdict--no { color: var(--danger); }
.card__correct { margin: 0; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); }
.card__rule { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); line-height: 1.6; }
.card__next {
  align-self: flex-end; padding: 10px 16px; background: var(--accent); color: var(--text-on-accent);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (max-width: 480px) { .card__options { grid-template-columns: 1fr; } }
</style>
```

> **#11 QA learnings baked in:** option marks/text use `--text`; shadows use `--shadow-button*` tokens; verdict OK uses `--heading-accent` (AA on paper); options grid drops to 1 column on mobile (no overflow).

- [ ] **Step 5: Run → PASS** (`cd munbeop && pnpm test -- ConjugationCard`)

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/components/conjugation-drill/ConjugationOption.vue munbeop/app/components/conjugation-drill/ConjugationCard.vue munbeop/tests/components/conjugation-drill/ConjugationCard.test.ts
git commit -m "feat(conjugation): ConjugationCard + Option (recognition UI, a11y)"
```

---

## Task 7: `DrillClassPicker` + `ConjugationSummary`

**Files:**
- Create: `munbeop/app/components/conjugation-drill/DrillClassPicker.vue`
- Create: `munbeop/app/components/conjugation-drill/ConjugationSummary.vue`
- Test: `munbeop/tests/components/conjugation-drill/ConjugationSummary.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/conjugation-drill/ConjugationSummary.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationSummary from '~/components/conjugation-drill/ConjugationSummary.vue'

const failed = [
  { id: '듣다:-아/어요', dict: '듣다', gloss: 'listen', klass: 't_irr', ending: '-아/어요', correct: '들어요', options: [] },
]
function factory(failedItems = failed) {
  return mount(ConjugationSummary, {
    props: { score: { correct: 7, total: 8, accuracy: 0.875 }, failedItems },
    global: { mocks: { $t: (k: string, p?: any) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ConjugationSummary', () => {
  it('shows the score and a review list of failed items', () => {
    const w = factory()
    expect(w.text()).toContain('conjugation.summary_score')
    expect(w.text()).toContain('들어요')
  })
  it('emits replay-failed and restart', async () => {
    const w = factory()
    await w.find('[data-testid="conj-replay"]').trigger('click')
    expect(w.emitted('replay-failed')).toBeTruthy()
    await w.find('[data-testid="conj-restart"]').trigger('click')
    expect(w.emitted('restart')).toBeTruthy()
  })
  it('hides the review block on a perfect round', () => {
    const w = factory([])
    expect(w.find('[data-testid="conj-replay"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Write `DrillClassPicker.vue`**

```vue
<script setup lang="ts">
import { DRILL_CLASSES, type DrillClassId } from '~/lib/conjugation-drill'

interface Props { selected: DrillClassId }
defineProps<Props>()
defineEmits<{ select: [id: DrillClassId] }>()
</script>

<template>
  <div class="picker">
    <h2 class="picker__title">{{ $t('conjugation.pick_class') }}</h2>
    <div class="picker__chips" role="group" :aria-label="$t('conjugation.pick_class')">
      <button
        v-for="c in DRILL_CLASSES"
        :key="c.id"
        type="button"
        class="picker__chip"
        :class="{ 'picker__chip--active': selected === c.id }"
        :aria-pressed="selected === c.id"
        :data-testid="`conj-class-${c.id}`"
        lang="ko"
        @click="$emit('select', c.id)"
      >
        {{ c.ko }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: 8px; }
.picker__title {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.picker__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.picker__chip {
  min-width: 0; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-ko); font-size: var(--text-sm); color: var(--text-soft); cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.picker__chip:hover { color: var(--text); }
.picker__chip--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.picker__chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Write `ConjugationSummary.vue`**

```vue
<script setup lang="ts">
import type { ConjItem, DrillResult } from '~/lib/conjugation-drill'

interface Props {
  score: ReturnType<typeof import('~/lib/conjugation-drill')['scoreOf']> | { correct: number; total: number; accuracy: number }
  failedItems: ConjItem[]
}
defineProps<Props>()
defineEmits<{ restart: []; 'replay-failed': []; explore: [] }>()
</script>

<template>
  <section class="summary">
    <p class="summary__score">{{ $t('conjugation.summary_score', { correct: score.correct, total: score.total }) }}</p>

    <div v-if="failedItems.length" class="summary__review">
      <h3 class="summary__review-title">{{ $t('conjugation.replay_failed', { n: failedItems.length }) }}</h3>
      <ul class="summary__list">
        <li v-for="f in failedItems" :key="f.id" lang="ko">{{ f.dict }} {{ f.ending }} → {{ f.correct }}</li>
      </ul>
    </div>

    <div class="summary__actions">
      <button
        v-if="failedItems.length"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="conj-replay"
        @click="$emit('replay-failed')"
      >
        <span aria-hidden="true">🔁</span> {{ $t('conjugation.replay_failed', { n: failedItems.length }) }}
      </button>
      <button type="button" class="summary__btn" data-testid="conj-restart" @click="$emit('restart')">
        {{ $t('conjugation.restart') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.summary__score { margin: 0; font-family: var(--font-pixel-display); font-size: var(--text-lg); color: var(--text); }
.summary__review {
  text-align: left; width: 100%; background: var(--paper);
  border-left: 4px solid var(--danger); padding: 12px 14px;
}
.summary__review-title {
  margin: 0 0 8px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.summary__list { margin: 0; padding-left: 18px; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); line-height: 1.7; }
.summary__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.summary__btn {
  min-width: 0; padding: 10px 16px; background: var(--surface); color: var(--text);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.summary__btn--primary { background: var(--accent); color: var(--text-on-accent); }
.summary__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 5: Run → PASS; Step 6: Commit**

```bash
git add munbeop/app/components/conjugation-drill/DrillClassPicker.vue munbeop/app/components/conjugation-drill/ConjugationSummary.vue munbeop/tests/components/conjugation-drill/ConjugationSummary.test.ts
git commit -m "feat(conjugation): class picker + round summary"
```

---

## Task 8: `ConjugationMasterStrip` + `ConjugationMasterCelebration`

**Files:**
- Create: `munbeop/app/components/conjugation-drill/ConjugationMasterStrip.vue`
- Create: `munbeop/app/components/conjugation-drill/ConjugationMasterCelebration.vue`
- Test: `munbeop/tests/components/conjugation-drill/ConjugationMasterStrip.test.ts`

These mirror Particle Lab's `ParticleMasterStrip.vue` / `ParticleMasterCelebration.vue` **with the #11 QA fixes already applied** (caption `--text-soft` never gold; unlit pip `--paper-deep`; celebration label `--text-soft`; focus-trapped dialog). Reuse those files as the reference implementation.

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/conjugation-drill/ConjugationMasterStrip.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConjugationMasterStrip from '~/components/conjugation-drill/ConjugationMasterStrip.vue'

const perClass = [
  { klass: 'regular', ko: '규칙', done: true },
  { klass: 'p_irr', ko: 'ㅂ 불규칙', done: false },
]
describe('ConjugationMasterStrip', () => {
  it('shows progress and a pip per class', () => {
    const w = mount(ConjugationMasterStrip, {
      props: { perClass, doneCount: 1, total: 9, earned: false },
      global: { mocks: { $t: (k: string, p?: any) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
    })
    expect(w.findAll('[data-testid="conj-pip"]')).toHaveLength(2)
    expect(w.text()).toContain('conjugation.master.progress')
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Write `ConjugationMasterStrip.vue`** (copy `ParticleMasterStrip.vue`, swap `master.*`→`conjugation.master.*`, prop type `{ klass; ko; done }`, badge 🏅/📚, pip `data-testid="conj-pip"`, label `활용 마스터`). Keep `.master__caption { color: var(--text-soft) }` (no earned-gold override) and `.master__pip { background: var(--paper-deep) }`.

- [ ] **Step 4: Write `ConjugationMasterCelebration.vue`** (copy `ParticleMasterCelebration.vue`, swap i18n to `conjugation.master.*`, title `활용 마스터!`, keep `.cel__label { color: var(--text-soft) }`, the focus-trap/Escape/restore, and reduced-motion guard).

- [ ] **Step 5: Run → PASS; Step 6: Commit**

```bash
git add munbeop/app/components/conjugation-drill/ConjugationMasterStrip.vue munbeop/app/components/conjugation-drill/ConjugationMasterCelebration.vue munbeop/tests/components/conjugation-drill/ConjugationMasterStrip.test.ts
git commit -m "feat(conjugation): 활용 마스터 strip + celebration (QA-clean)"
```

---

## Task 9: Page `pages/practice/conjugation.vue` + wire round-end mastery

**Files:**
- Create: `munbeop/app/pages/practice/conjugation.vue`

- [ ] **Step 1: Write the page** (orchestrator mirroring `particles.vue`)

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DrillClassPicker from '~/components/conjugation-drill/DrillClassPicker.vue'
import ConjugationCard from '~/components/conjugation-drill/ConjugationCard.vue'
import ConjugationSummary from '~/components/conjugation-drill/ConjugationSummary.vue'
import ConjugationMasterStrip from '~/components/conjugation-drill/ConjugationMasterStrip.vue'
import ConjugationMasterCelebration from '~/components/conjugation-drill/ConjugationMasterCelebration.vue'
import { useConjugationDrill } from '~/composables/useConjugationDrill'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { DrillClassId } from '~/lib/conjugation-drill'
import type { VerbClass } from '~/lib/korean'

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const initial = (typeof route.query.set === 'string' ? route.query.set : 'mixed') as DrillClassId
const drill = useConjugationDrill(initial)
const master = useConjugationMaster()
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function begin(id: DrillClassId) {
  drill.selectClass(id)
  void router.replace({ query: { ...route.query, set: id } })
  drill.start()
  started.value = true
}

async function onNext() {
  await drill.next()
  if (drill.phase.value === 'done' && drill.mode.value === 'normal' && drill.selectedClassId.value !== 'mixed') {
    master.recordRound(drill.selectedClassId.value as VerbClass, drill.score.value.accuracy)
  }
}

function restart() {
  drill.start()
}
function onReplayFailed() {
  drill.replayFailed()
}

if (initial !== 'mixed') begin(initial)
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="활용 연습" :latin="t('conjugation.title')" />
    <p class="lab__lead">{{ t('conjugation.lead') }}</p>

    <ConjugationMasterStrip
      :per-class="master.perClass.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <DrillClassPicker v-if="!started" :selected="drill.selectedClassId.value" @select="begin" />

    <template v-else>
      <p
        v-if="drill.mode.value === 'replay' && drill.phase.value !== 'done'"
        class="lab__replay-note"
        role="status"
      >
        <span aria-hidden="true">🔁</span> {{ t('conjugation.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('conjugation.progress_label')"
      />
      <ConjugationCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        @answer="drill.answer"
        @next="onNext"
      />
      <ConjugationSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <ConjugationMasterCelebration v-if="master.celebrate.value" :total="master.total.value" @dismiss="master.dismiss" />
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
</style>
```

- [ ] **Step 2: Typecheck the page**

Run: `cd munbeop && pnpm typecheck`
Expected: no errors in `conjugation.vue` (fix any prop/type mismatches against the composable return types).

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/pages/practice/conjugation.vue
git commit -m "feat(conjugation): /practice/conjugation page orchestrator"
```

---

## Task 10: List the game on `/practice`

**Files:**
- Modify: `munbeop/app/pages/practice/index.vue`

- [ ] **Step 1: Read `index.vue`** to learn the existing game-card markup (how `particles` and `ruleta` are listed).

Run: open `munbeop/app/pages/practice/index.vue` and locate the games list/array.

- [ ] **Step 2: Add a `활용 연습` card** following the exact pattern of the Particle Lab card — same component/markup, route `/practice/conjugation`, Korean title `활용 연습`, Latin subtitle `t('conjugation.title')`, an emoji icon (e.g. 🔀 or 🌀) consistent with the others. If cards come from an array, add an entry; if hand-written, copy the particles block.

- [ ] **Step 3: Typecheck + the existing practice-index test (if any)**

Run: `cd munbeop && pnpm typecheck && pnpm test -- practice`
Expected: green.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/pages/practice/index.vue
git commit -m "feat(conjugation): list 활용 연습 on the practice hub"
```

---

## Task 11: Full gates + live preview verification

- [ ] **Step 1: Run the whole suite + typecheck + lint**

Run: `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all green (new tests included). Fix any regressions before continuing.

- [ ] **Step 2: Live preview smoke** (preview tools; auth gate via a synthetic Supabase session, see the #11 QA notes in `project-preview-verification-quirks`)

  - Navigate `/practice/conjugation`; confirm the class picker renders and `/practice` lists the game.
  - Pick `ㅂ 불규칙`; answer one wrong → the reveal shows the correct form + rule note; open `/log` and confirm one entry with the `활용 LAB` context.
  - Verify light + dark and a 360px width: options grid is single-column on mobile, no overflow; captions legible in light (the #11 contrast fixes).
  - Confirm console has no errors beyond the known synthetic-JWT `customDecks` artifact.

- [ ] **Step 3: Commit any fixes; push + open PR** (only on the user's go-ahead)

```bash
git push -u origin <branch>
gh pr create --base main --title "feat(conjugation): 활용 recognition drill (roadmap Step 5b)" --body "..."
```

---

## Self-Review

**Spec coverage:** packaging/standalone game (Tasks 9–10) ✓; error-model distractors (Task 2) ✓; class picker + mixed (Tasks 1,7) ✓; mistake-feed `errorDimension='ending'`, no SRS (Task 3) ✓; single-layer verdict (Tasks 3,6) ✓; gloss EN hint (Task 6) ✓; 활용 마스터 self-contained (Tasks 4,8) ✓; a11y focus/status (Task 6) ✓; testing incl. golden snapshot + dataset invariants (Task 2) ✓; i18n ×8 (Task 5) ✓; acceptance criteria 1–5 covered by Tasks 9/10, 2, 3, 7/8, 11.

**Placeholder scan:** none — every code step has full code. Task 5 gives the full EN block and instructs verbatim-Korean translation for the other 7 (the only non-literal step, inherent to i18n); Task 8/10 reference existing files as the literal reference implementation rather than re-printing near-identical Particle Lab code (deliberate, to avoid drift).

**Type consistency:** `ConjItem`, `DrillResult`, `DrillClassId`, `scoreOf` shapes are defined in Task 1 and used identically in Tasks 3/6/7/9; `masteryOf`/`perClass {klass,ko,done}` defined in Task 4 and consumed in Task 8/9; composable returns (`displayOptions`, `selectedClassId`, `phase` union) match the page bindings in Task 9.
