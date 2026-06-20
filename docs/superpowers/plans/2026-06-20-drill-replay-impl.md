# Drill replay + más ítems — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Choque drill replayable — every round shuffles, a "Repasar fallos (N)" button re-drills only the missed items without re-logging, and each clash set gets more items (~10 each).

**Architecture:** Introduce a `sessionItems` list in `useParticleDrill` (the ordered items of the current round) so shuffle and failed-subset replay are one mechanism. A `mode` ref ('normal' | 'replay') makes replay skip diary writes (SRS reinforced via `markSeen`). A pure `shuffle` helper is added and unit-tested. The summary gains a replay CTA; the page hides the set picker and shows a "modo repaso" note during replay. Content is expanded with ~18 new `DrillItem`s, adversarially verified.

**Tech Stack:** Nuxt 4 SPA, Vue 3, TypeScript, Pinia, @nuxtjs/i18n (8 locales), vitest + happy-dom + @vue/test-utils, pnpm. Commands from `munbeop/`.

**Source spec:** `docs/superpowers/specs/2026-06-20-drill-replay-design.md`.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Create | `app/lib/particle-lab/shuffle.ts` | Pure Fisher–Yates `shuffle(arr, rng?)` |
| Edit | `app/lib/particle-lab/index.ts` | Re-export `./shuffle` |
| Edit | `app/composables/useParticleDrill.ts` | `sessionItems`, `mode`, `replayFailed`, replay-skips-logging, `resetRound` |
| Edit | `app/components/particle-lab/DrillSummary.vue` | `replay-failed` CTA + testids |
| Edit | `app/pages/practice/particles.vue` | wire `replay-failed`, modo-repaso note, ProgressDots total = session, hide picker in replay |
| Edit | `i18n/locales/*.json` | `particles.drill.summary_replay_failed` + `replay_mode_label` ×8 |
| Edit | `app/seed/particle-drills.ts` | +18 `DrillItem`s (5 sets to ~10) |
| Create | `app/lib/particle-lab/shuffle.test.ts`? → see Task 1 (test lives in `tests/unit/particle-lab/shuffle.test.ts`) |
| Create | `tests/unit/particle-lab/shuffle.test.ts` | shuffle unit tests |
| Create | `tests/composables/useParticleDrill.test.ts` | replay behaviour |
| Edit | `tests/unit/particle-lab/clash-sets.test.ts` | covers new items (≥ counts) |

No engine/judge change, no SQL, no new SRS plumbing.

---

## Verified facts (resolved during planning)

- Items per set today: `topic-subject` 12, `subject-object` 7, `place-recipient` 7, `place-static-action` 6, `also-only` 6, `from-until` 6 (44 total). Target ~10 → +3/+3/+4/+4/+4 = **+18**.
- Clash families (`app/seed/clash-sets.ts`): `topic-subject`=[TOPIC 은/는, SUBJECT 이/가], `subject-object`=[SUBJECT, OBJECT 을/를], `place-static-action`=[PLACE_STATIC 에, PLACE_ACTION 에서], `place-recipient`=[PLACE_STATIC 에, RECIPIENT 한테], `also-only`=[ALSO 도, ONLY 만], `from-until`=[FROM 부터, UNTIL 까지]. `familyIndex` 0 = first listed, 1 = second.
- `DrillItem` = `{ id, cue: L(...), lead?, noun, rest, setId, familyIndex: 0|1, reason: L(...), trans: L(...) }`.
- `familyFormFor(family, noun)` and `correctForm(item, set)` are exported from `~/lib/particle-lab` (barrel re-exports `./drill`).
- `useParticleDrill` uses `useI18n()` (globally stubbed in `tests/setup.ts`, locale 'en'), `useLogStore().add`, `useSrsStore().markSeen`/`.recalculate`.
- Page already: ProgressDots `:total="drill.items.value.length"`; picker `v-if="drill.phase.value === 'question' && drill.index.value === 0"`; summary `@restart`/`@explore` only.

---

## PHASE 1 — `shuffle` helper (pure, TDD)

### Task 1: Create and test `shuffle`

**Files:** Create `app/lib/particle-lab/shuffle.ts`; create `tests/unit/particle-lab/shuffle.test.ts`; edit `app/lib/particle-lab/index.ts`.

- [ ] **Step 1: Write the failing test** — `tests/unit/particle-lab/shuffle.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { shuffle } from '~/lib/particle-lab'

describe('shuffle', () => {
  it('returns a permutation (same multiset) of the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, () => 0.42)
    expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    expect(out).toHaveLength(5)
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    shuffle(input, () => 0.99)
    expect(input).toEqual([1, 2, 3])
  })

  it('is deterministic for a fixed rng', () => {
    const rng = () => 0 // Fisher–Yates with rng()=0 always swaps j=0
    expect(shuffle(['a', 'b', 'c'], rng)).toEqual(shuffle(['a', 'b', 'c'], rng))
  })

  it('returns empty / single inputs intact', () => {
    expect(shuffle([], () => 0.5)).toEqual([])
    expect(shuffle([7], () => 0.5)).toEqual([7])
  })
})
```

- [ ] **Step 2: Run it — expect FAIL** (`shuffle` not exported)

Run: `pnpm test tests/unit/particle-lab/shuffle.test.ts`
Expected: FAIL — `shuffle is not a function` / import error.

- [ ] **Step 3: Implement `app/lib/particle-lab/shuffle.ts`**

```ts
/**
 * Fisher–Yates shuffle. Returns a NEW array; never mutates the input.
 * `rng` defaults to Math.random; inject a stub for deterministic tests.
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
```

- [ ] **Step 4: Re-export from the barrel** — append to `app/lib/particle-lab/index.ts`:

```ts
export * from './shuffle'
```

- [ ] **Step 5: Run the test — expect PASS**

Run: `pnpm test tests/unit/particle-lab/shuffle.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/particle-lab/shuffle.ts munbeop/app/lib/particle-lab/index.ts munbeop/tests/unit/particle-lab/shuffle.test.ts
git commit -m "feat(particles): add pure shuffle helper for the drill"
```

---

## PHASE 2 — Composable replay + UI wiring

### Task 2: Session list, `mode`, `replayFailed` in `useParticleDrill`

**Files:** Edit `app/composables/useParticleDrill.ts`; create `tests/composables/useParticleDrill.test.ts`.

- [ ] **Step 1: Update imports + add session/mode state**

Change the `lib/particle-lab` import to include `shuffle`:

```ts
import {
  correctSentence,
  judge,
  scoreOf,
  shuffle,
  type DrillItemResult,
} from '~/lib/particle-lab'
```

Add the mode type next to `DrillPhase`:

```ts
export type DrillMode = 'normal' | 'replay'
```

After `const items = computed(...)` (the seed filter), add:

```ts
  const sessionItems = ref<DrillItem[]>([])
  const mode = ref<DrillMode>('normal')
```

- [ ] **Step 2: Point `item` / `failedItems` at the session list**

Replace:

```ts
  const item = computed<DrillItem>(() => items.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    items.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )
```

with:

```ts
  const item = computed<DrillItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )
```

- [ ] **Step 3: Extract `resetRound`, rewrite `start`, add `replayFailed`**

Replace the whole `start` function with:

```ts
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    verdict.value = null
    picked.value = null
    blockedChoices.value = new Set()
    results.value = []
    slipsThisItem.value = 0
    gardenGrew.value = false
  }

  async function start() {
    mode.value = 'normal'
    sessionItems.value = shuffle(items.value)
    resetRound()
    await Promise.all(set.value.families.map((f) => srsStore.markSeen(f.grammarKo)))
  }

  /** Re-drill only the items missed in the round just finished (practice mode). */
  async function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    await Promise.all(set.value.families.map((f) => srsStore.markSeen(f.grammarKo)))
  }
```

- [ ] **Step 4: Skip logging in replay mode**

In `answer`, change the wrong-family tail (currently `phase.value = 'wrong'; await logMistake(item.value, choice)`) to:

```ts
    results.value.push({
      itemId: item.value.id,
      correct: false,
      batchimSlips: slipsThisItem.value,
    })
    phase.value = 'wrong'
    if (mode.value === 'normal') await logMistake(item.value, choice)
```

At the top of `finish`, add the replay guard:

```ts
  async function finish() {
    if (mode.value === 'replay') return
    if (score.value.accuracy < EASY_THRESHOLD) return
    // … unchanged …
  }
```

- [ ] **Step 5: Export the new surface**

In the returned object add `sessionItems`, `mode`, `replayFailed` (keep all existing keys):

```ts
  return {
    items,
    sessionItems,
    mode,
    set,
    selectedSetId,
    availableSets,
    index,
    phase,
    verdict,
    picked,
    blockedChoices,
    item,
    score,
    failedItems,
    gardenGrew,
    selectSet,
    start,
    replayFailed,
    answer,
    retry,
    next,
  }
```

- [ ] **Step 6: Write the composable test** — `tests/composables/useParticleDrill.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import type { DrillItem, LocalizedString } from '~/lib/domain'
import { familyFormFor } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

// Three topic-subject items: f1 = topic (저 → 는), f2/f3 = subject (물 → 이, 커피 → 가).
const FIX: DrillItem[] = [
  { id: 'f1', cue: LS('c'), noun: '저', rest: ' 학생이에요.', setId: 'topic-subject', familyIndex: 0, reason: LS('r'), trans: LS('t') },
  { id: 'f2', cue: LS('c'), noun: '물', rest: ' 맛있어요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
  { id: 'f3', cue: LS('c'), noun: '커피', rest: ' 좋아요.', setId: 'topic-subject', familyIndex: 1, reason: LS('r'), trans: LS('t') },
]
vi.mock('~/seed/particle-drills', () => ({ PARTICLE_DRILLS: FIX }))

const addSpy = vi.fn(async () => {})
const markSeenSpy = vi.fn(async () => {})
const recalcSpy = vi.fn(async () => {})
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add: addSpy, entries: [] }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: markSeenSpy, recalculate: recalcSpy }) }))

import { useParticleDrill } from '~/composables/useParticleDrill'

describe('useParticleDrill — replay', () => {
  let scope: EffectScope
  beforeEach(() => { addSpy.mockClear(); markSeenSpy.mockClear(); recalcSpy.mockClear(); scope = effectScope() })
  afterEach(() => { scope.stop() })

  const make = () => scope.run(() => useParticleDrill('topic-subject'))!

  // Answer the current item right or wrong (wrong = the other family's form → wrong-family).
  async function step(drill: ReturnType<typeof make>, correct: boolean) {
    const it = drill.item.value
    const set = drill.set.value
    const fam = set.families[it.familyIndex]!
    const other = set.families[it.familyIndex === 0 ? 1 : 0]!
    await drill.answer(familyFormFor(correct ? fam : other, it.noun))
    await drill.next()
  }

  it('replayFailed re-drills only the failed items, in replay mode, without re-logging', async () => {
    const drill = make()
    await drill.start()
    await step(drill, false) // miss the first presented item
    await step(drill, true)
    await step(drill, true)
    expect(drill.phase.value).toBe('done')
    expect(drill.failedItems.value).toHaveLength(1)
    expect(addSpy).toHaveBeenCalledTimes(1) // one hard diary entry from the normal round
    const missedId = drill.failedItems.value[0]!.id

    await drill.replayFailed()
    expect(drill.mode.value).toBe('replay')
    expect(drill.sessionItems.value.map((i) => i.id)).toEqual([missedId])

    await step(drill, false) // miss it again — replay must NOT write a diary entry
    expect(drill.phase.value).toBe('done')
    expect(addSpy).toHaveBeenCalledTimes(1) // still 1
    expect(markSeenSpy).toHaveBeenCalled() // replay reinforced SRS via markSeen
  })

  it('replayFailed is a no-op after a perfect round', async () => {
    const drill = make()
    await drill.start()
    await step(drill, true)
    await step(drill, true)
    await step(drill, true)
    expect(drill.failedItems.value).toHaveLength(0)
    await drill.replayFailed()
    expect(drill.mode.value).toBe('normal')
  })
})
```

- [ ] **Step 7: Run the composable test + typecheck**

Run: `pnpm test tests/composables/useParticleDrill.test.ts`
Expected: PASS (2 tests).
Run: `pnpm typecheck`
Expected: PASS (page still compiles — it reads `drill.items`, which still exists; ProgressDots total is updated in Task 3).

(No commit yet — UI wiring lands in Task 3, commit Phase 2 together.)

### Task 3: Summary CTA, page wiring, i18n, modo-repaso note

**Files:** Edit `app/components/particle-lab/DrillSummary.vue`, `app/pages/practice/particles.vue`, all `i18n/locales/*.json`.

- [ ] **Step 1: Add the two i18n keys to every locale**

In each `i18n/locales/<loc>.json`, under `particles.drill`, add `summary_replay_failed` and `replay_mode_label`:

| loc | summary_replay_failed | replay_mode_label |
|---|---|---|
| en | `REVIEW MISTAKES ({n})` | `Review mode · mistakes aren't logged again` |
| es | `REPASAR FALLOS ({n})` | `Modo repaso · los fallos no se registran de nuevo` |
| fr | `REVOIR LES ERREURS ({n})` | `Mode révision · les erreurs ne sont pas réenregistrées` |
| pt-BR | `REVISAR ERROS ({n})` | `Modo revisão · os erros não são registrados de novo` |
| th | `ทบทวนที่ผิด ({n})` | `โหมดทบทวน · ข้อผิดจะไม่ถูกบันทึกซ้ำ` |
| id | `ULANGI YANG SALAH ({n})` | `Mode ulasan · kesalahan tidak dicatat lagi` |
| vi | `ÔN LẠI LỖI ({n})` | `Chế độ ôn · lỗi không được ghi lại nữa` |
| ja | `まちがいを復習 ({n})` | `復習モード · 間違いは再記録されません` |

(Place them right after `summary_explore` in `particles.drill`. The locale JSONs are CRLF — keep the existing line endings.)

- [ ] **Step 2: `DrillSummary.vue` — emit + CTA**

Update the emit type:

```ts
const emit = defineEmits<{ restart: []; explore: []; 'replay-failed': [] }>()
```

Add `failedItems` length is already a prop (`failedItems: DrillItem[]`). Replace the `.summary__actions` block in the template with:

```vue
    <div class="summary__actions">
      <button
        v-if="failedItems.length > 0"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="drill-replay-failed"
        @click="emit('replay-failed')"
      >
        🔁 {{ t('particles.drill.summary_replay_failed', { n: failedItems.length }) }}
      </button>
      <button
        type="button"
        class="summary__btn"
        :class="{ 'summary__btn--primary': failedItems.length === 0 }"
        data-testid="drill-restart"
        @click="emit('restart')"
      >
        🔁 {{ t('particles.drill.summary_repeat') }}
      </button>
      <button type="button" class="summary__btn" @click="emit('explore')">
        🧩 {{ t('particles.drill.summary_explore') }}
      </button>
      <NuxtLink to="/log" class="summary__btn summary__link">
        📓 {{ t('nav.log') }}
      </NuxtLink>
    </div>
```

- [ ] **Step 3: `particles.vue` — wire replay, session total, hide picker in replay, modo-repaso note**

In `<script setup>` add a handler after `restartDrill`:

```ts
async function onReplayFailed() {
  await drill.replayFailed()
}
```

In the template `<template v-else>` drill block:

1. Picker — append `&& drill.mode.value === 'normal'`:

```vue
      <DrillSetPicker
        v-if="drill.phase.value === 'question' && drill.index.value === 0 && drill.mode.value === 'normal'"
        :sets="drill.availableSets"
        :selected="drill.selectedSetId.value"
        @select="onSelectSet"
      />
```

2. Add the modo-repaso note immediately before `<ProgressDots>`:

```vue
      <p
        v-if="drill.mode.value === 'replay' && drill.phase.value !== 'done'"
        class="lab__replay-note"
        data-testid="drill-replay-note"
      >
        🔁 {{ t('particles.drill.replay_mode_label') }}
      </p>
```

3. ProgressDots — use the session length:

```vue
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
      />
```

4. DrillSummary — add the replay handler:

```vue
      <DrillSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        :set="drill.set.value"
        :garden-grew="drill.gardenGrew.value"
        @restart="restartDrill"
        @replay-failed="onReplayFailed"
        @explore="mode = 'explore'"
      />
```

Add the note style in the `<style scoped>` block:

```css
.lab__replay-note {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: var(--text-soft);
  background: var(--surface);
  border: 2px dashed var(--border);
  padding: 8px 12px;
}
```

- [ ] **Step 4: Run typecheck + the particle-lab + composable tests + lint**

Run: `pnpm typecheck` → clean.
Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab tests/composables/useParticleDrill.test.ts` → all pass (DrillCard/TokenChip unaffected; the existing tests don't reference the changed props).
Run: `pnpm test tests/unit/i18n` → i18n key-parity tests pass (the 2 new keys exist in all 8 locales).
Run: `npx eslint app/composables/useParticleDrill.ts app/components/particle-lab/DrillSummary.vue app/pages/practice/particles.vue app/lib/particle-lab tests/composables tests/unit/particle-lab` → exit 0.

- [ ] **Step 5: Commit Phase 2**

```bash
git add munbeop/app/composables/useParticleDrill.ts munbeop/app/components/particle-lab/DrillSummary.vue munbeop/app/pages/practice/particles.vue munbeop/i18n/locales munbeop/tests/composables munbeop/app/lib/particle-lab/index.ts
git commit -m "feat(particles): drill shuffle + repasar-fallos replay (no re-logging)"
```

---

## PHASE 3 — Más ítems (content)

### Task 4: Author + adversarially verify ~18 new drill items

**Files:** Edit `app/seed/particle-drills.ts`; edit `tests/unit/particle-lab/clash-sets.test.ts`.

The 18 curated items (Korean fixed; 8-locale `cue`/`reason`/`trans` produced + verified by the Workflow, then spliced). All `correctForm = familyFormFor(family, noun)`; both families stay represented per set.

| id | setId | familyIndex | noun | rest | Korean (correct) | cue gist (en) | reason gist (en) |
|---|---|---|---|---|---|---|---|
| `so-08-nalssi` | subject-object | 0 | 날씨 | ` 좋아요.` | 날씨가 좋아요. | Describing how the weather is right now | New-info subject → 이/가 |
| `so-09-sajin` | subject-object | 1 | 사진 | ` 찍어요.` | 사진을 찍어요. | What you DO with a camera | 찍다 acts on it → 을/를 |
| `so-10-mun` | subject-object | 1 | 문 | ` 열어요.` | 문을 열어요. | The door receives the opening | object of 열다 → 을/를 |
| `psa-07-jip` | place-static-action | 0 | 집 | ` 있어요.` | 집에 있어요. | Saying where something simply IS | location with 있다 → 에 |
| `psa-08-jumal` | place-static-action | 0 | 주말 | ` 만나요.` | 주말에 만나요. | WHEN you meet (a time point) | time point → 에 |
| `psa-09-sikdang` | place-static-action | 1 | 식당 | ` 먹어요.` | 식당에서 먹어요. | WHERE the eating happens | action location → 에서 |
| `psa-10-gongwon` | place-static-action | 1 | 공원 | ` 산책해요.` | 공원에서 산책해요. | WHERE you take a walk | action location → 에서 |
| `pr-08-eomma` | place-recipient | 1 | 엄마 | ` 줘요.` | 엄마한테 줘요. | Giving something to a PERSON | recipient person → 한테 |
| `pr-09-hakgyo` | place-recipient | 0 | 학교 | ` 가요.` | 학교에 가요. | Going to a PLACE | destination place → 에 |
| `pr-10-seonsaengnim` | place-recipient | 1 | 선생님 | ` 물어봐요.` | 선생님한테 물어봐요. | Asking a PERSON (teacher) | recipient person → 한테 (께 honorific) |
| `ao-07-jeo` | also-only | 0 | 저 | ` 가요.` | 저도 가요. | You're ALSO going, like the others | adds to others → 도 |
| `ao-08-mul` | also-only | 1 | 물 | ` 마셔요.` | 물만 마셔요. | You drink ONLY water | limit to one → 만 |
| `ao-09-hangugeo` | also-only | 1 | 한국어 | ` 공부해요.` | 한국어만 공부해요. | You study ONLY Korean | only that → 만 |
| `ao-10-dongsaeng` | also-only | 0 | 동생 | ` 와요.` | 동생도 와요. | The younger sibling ALSO comes | adds another → 도 |
| `fu-07-achim` | from-until | 0 | 아침 | ` 바빠요.` | 아침부터 바빠요. | Busy STARTING from the morning | start point → 부터 |
| `fu-08-jip` | from-until | 1 | 집 | ` 걸어요.` | 집까지 걸어요. | Walking UP TO home | end point → 까지 |
| `fu-09-woryoil` | from-until | 0 | 월요일 | ` 일해요.` | 월요일부터 일해요. | Working FROM Monday | start point → 부터 |
| `fu-10-bam` | from-until | 1 | 밤 | ` 놀아요.` | 밤까지 놀아요. | Playing UNTIL night | end point → 까지 |

- [ ] **Step 1: Run the content Workflow** — author the 8-locale `cue`/`reason`/`trans` for the 18 items and adversarially verify each (per item: the assembled `noun+correctForm+rest` is natural Korean; the `cue` unambiguously selects the intended `familyIndex`; the 받침/allomorph is right for `subject-object`; the 8-locale strings are accurate). Reuse the Explore-#4 verification harness (parallel per-item draft → skeptical Korean verifier). Confirm with the user before launching; fix anything flagged.

- [ ] **Step 2: Splice + format** — insert the 18 verified `DrillItem` objects into `PARTICLE_DRILLS` (grouped near their set's existing items or appended; order only affects the pre-shuffle pool, which is now shuffled). Then:

Run: `npx prettier --write app/seed/particle-drills.ts`
Run: `pnpm typecheck` → clean.

- [ ] **Step 3: Tighten the integrity test** — `tests/unit/particle-lab/clash-sets.test.ts`. The "each set has at least 5 items and both families are represented" test already covers the new items. Add a per-set minimum to lock the expansion in:

```ts
  it('every set has at least 10 items after the replay expansion', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(10)
    }
  })
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm test tests/unit/particle-lab` → pass (clash-sets integrity green, all forms resolve).
Run: `npx eslint app/seed/particle-drills.ts tests/unit/particle-lab/clash-sets.test.ts` → exit 0.

```bash
git add munbeop/app/seed/particle-drills.ts munbeop/tests/unit/particle-lab/clash-sets.test.ts
git commit -m "feat(particles): +18 drill items (each clash set to ~10), adversarially verified"
```

---

## PHASE 4 — Final verification + finish

### Task 5: Full gates

- [ ] Run: `pnpm test && pnpm typecheck && pnpm lint`. All green, 0 lint errors.
- [ ] Manual (logged in, `/practice/particles`, ⚡ drill): finish a round with mistakes → "Repasar fallos (N)" re-drills only those, shows the "modo repaso" note, the set picker is hidden, and no new Diario entries appear for the replay; "Repetir" reshuffles the full set; ProgressDots count matches the session length; deep link `?set=from-until` still works.

### Task 6: Finish the branch

- [ ] Update memory `project_particle_lab.md`: mark subproject #3 shipped with the PR number/commit.
- [ ] `superpowers:finishing-a-development-branch`: push → `gh pr create` → `gh pr merge --merge`. Merge `origin/main` first if it diverged; retry the async mergeability check once.

---

## Self-review

**Spec coverage:** shuffle → Task 1; session list + `mode` + `replayFailed` + replay-skips-logging → Task 2; summary CTA + modo-repaso note + page wiring + i18n → Task 3; más ítems (+18, verified) → Task 4; tests (shuffle, composable replay, integrity) → Tasks 1/2/4; full gates + manual + finish → Phase 4. All spec sections (A/B/C/D) covered.

**Placeholder scan:** The only deferred content is the 8-locale `cue`/`reason`/`trans` for the 18 items — produced and adversarially verified by the Task 4 Workflow from the fully-specified Korean + English gists in the table (a defined process, the repo's standard pattern). All code (shuffle, composable, components, page, i18n keys, tests) is concrete.

**Type consistency:** `shuffle<T>(arr, rng?)` (Task 1) used identically in the composable (Task 2) and tests. `sessionItems`/`mode`/`replayFailed` (Task 2) are consumed by the page (Task 3, `drill.sessionItems.value.length`, `drill.mode.value`, `onReplayFailed → drill.replayFailed()`) and the composable test. `DrillSummary` emits `replay-failed` (Task 3) wired to `@replay-failed` on the page. `DrillItem` fields in Task 4 match the `~/lib/domain` shape and the existing seed. `familyFormFor` (used in the composable test) is the real barrel export.
```
