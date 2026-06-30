# 문장 정원 (Sentence Garden) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new single-player card-game practice mode where the learner rebuilds a short real Korean sentence by tapping its shuffled word (eojeol) cards into order — one card is a decoy that doesn't belong — reusing the existing grammar-examples corpus + TTS audio, and watering the grammar's plant like the other labs.

**Architecture:** Pure logic in `app/lib/sentence-garden/` (build a round from a `GrammarExample`, exact-match check, select short rounds for a deck), a `useSentenceGarden` composable that mirrors `useClozeDrill` (deck → session → place/check/next/finish + SRS + audio), a `sentence-garden.vue` page mirroring `cloze.vue`, four small components (Bed, Tray, SentenceCard, SentenceSummary), a new `sentence-garden` PracticeHelp mode, i18n, and a hub card.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, TypeScript, Vitest + `@vue/test-utils`, pnpm. All commands run from the **`munbeop/`** app dir.

**Conventions (verified in this repo):**
- `pnpm test <path>` runs one file; `pnpm typecheck` = `nuxt typecheck`; `pnpm lint` = `eslint .`.
- `shuffle<T>(arr, rng = Math.random)` (`app/lib/particle-lab/shuffle.ts`) — pure, injectable rng for deterministic tests.
- `L(en, es, fr, pt-BR, th, id, vi, ja)` (`app/seed/locale.ts`) — all 8 required by the compiler.
- `useI18n()` / `useLocalized()` are Nuxt auto-imports; in Vitest they are global stubs (`tests/setup.ts`): `t` echoes the key, `tl` resolves to the `en` value. SUT import at top of test files (eslint `import/first`).
- The composable mirrors `app/composables/useClozeDrill.ts` (read it for the store call shapes: `srsStore.markSeen(ko)`, `srsStore.recalculate(ko)`, `logStore.add({...})`, `activity.record()`).
- `useExampleAudio().playExample(sentence)` plays a grammar-example clip (sentence-keyed). `GrammarExample = { ko, sentence, trans, level }`; pools are `TOPIK_1_EXAMPLES` (`~/seed/grammar-examples/n1`), `TOPIK_2_EXAMPLES` (`~/seed/grammar-examples/n2`).

---

## File Structure

| Path | Responsibility | Action |
|---|---|---|
| `app/lib/sentence-garden/build.ts` | `SentenceGardenRound` type + `buildRound` | Create |
| `app/lib/sentence-garden/check.ts` | `checkOrder` exact-match | Create |
| `app/lib/sentence-garden/select.ts` | `selectRounds` (short rounds for a deck) | Create |
| `app/composables/useSentenceGarden.ts` | session state (mirror of useClozeDrill) | Create |
| `app/components/sentence-garden/SentenceCard.vue` | one eojeol card | Create |
| `app/components/sentence-garden/Tray.vue` | shuffled unplaced cards (tap → place) | Create |
| `app/components/sentence-garden/Bed.vue` | ordered slots (tap filled → remove) | Create |
| `app/components/sentence-garden/SentenceSummary.vue` | end score + replay | Create |
| `app/pages/practice/sentence-garden.vue` | page (deck → play → summary) | Create |
| `app/lib/domain/practice-help.ts` | add `'sentence-garden'` to `PracticeHelpMode` | Modify |
| `app/seed/practice-help/sentence-garden.ts` | `SENTENCE_GARDEN_HELP` | Create |
| `app/seed/practice-help/index.ts` | register the new help entry | Modify |
| `i18n/locales/*.json` (×8) | `sentenceGarden.*` + `games.sentenceGarden.*` | Modify |
| `app/pages/practice/index.vue` | a `GameCard` for the mode | Modify |
| tests under `tests/unit/sentence-garden/`, `tests/components/sentence-garden/`, `tests/unit/i18n/` | unit + component + i18n parity | Create |

---

## Task 1: Pure round build + check

**Files:**
- Create: `app/lib/sentence-garden/build.ts`, `app/lib/sentence-garden/check.ts`
- Test: `tests/unit/sentence-garden/build.test.ts`, `tests/unit/sentence-garden/check.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/sentence-garden/check.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { checkOrder } from '~/lib/sentence-garden/check'

describe('checkOrder', () => {
  const answer = ['저는', '물을', '마셔요']
  it('true for the exact model order', () => {
    expect(checkOrder(['저는', '물을', '마셔요'], answer)).toBe(true)
  })
  it('false for a wrong order', () => {
    expect(checkOrder(['물을', '저는', '마셔요'], answer)).toBe(false)
  })
  it('false when a decoy was placed (length mismatch handled too)', () => {
    expect(checkOrder(['저는', '빵을', '마셔요'], answer)).toBe(false)
    expect(checkOrder(['저는', '물을'], answer)).toBe(false)
  })
})
```

Create `tests/unit/sentence-garden/build.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildRound } from '~/lib/sentence-garden/build'
import type { GrammarExample } from '~/lib/domain'

const ex: GrammarExample = {
  ko: '-아/어요',
  sentence: '저는 물을 마셔요.',
  trans: { en: 'I drink water.', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  level: 'polite',
}

describe('buildRound', () => {
  it('answer is the space-split eojeol of the sentence', () => {
    const r = buildRound(ex, ['빵을'], () => 0)
    expect(r.answer).toEqual(['저는', '물을', '마셔요.'])
    expect(r.ko).toBe('-아/어요')
    expect(r.sentence).toBe('저는 물을 마셔요.')
  })
  it('cards are answer + one decoy, all present, decoy not in answer', () => {
    const r = buildRound(ex, ['빵을'], () => 0)
    expect(r.cards).toHaveLength(r.answer.length + 1)
    expect(r.cards).toContain('빵을')
    for (const w of r.answer) expect(r.cards).toContain(w)
  })
  it('skips decoys already present in the sentence', () => {
    const r = buildRound(ex, ['물을', '빵을'], () => 0)
    // 물을 is in the answer → the next usable decoy (빵을) is chosen
    const decoys = r.cards.filter((c) => !r.answer.includes(c))
    expect(decoys).toEqual(['빵을'])
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/check.test.ts tests/unit/sentence-garden/build.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement check.ts**

Create `app/lib/sentence-garden/check.ts`:
```ts
/** Exact-match: the placed eojeol equal the model order (and length). */
export function checkOrder(placed: readonly string[], answer: readonly string[]): boolean {
  return placed.length === answer.length && placed.every((w, i) => w === answer[i])
}
```

- [ ] **Step 4: Implement build.ts**

Create `app/lib/sentence-garden/build.ts`:
```ts
import type { GrammarExample, LocalizedString } from '~/lib/domain'
import { shuffle } from '~/lib/particle-lab/shuffle'

export interface SentenceGardenRound {
  /** The grammar point — used to water its plant. */
  ko: string
  /** The full model sentence. */
  sentence: string
  /** Shown as the target meaning. */
  trans: LocalizedString
  /** Model eojeol order (the win condition). */
  answer: string[]
  /** answer + 1 decoy, shuffled. */
  cards: string[]
}

/** Split a sentence into eojeol (whitespace tokens). */
export function eojeolsOf(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean)
}

/**
 * Build one round from an example. The decoy is the first entry of `decoyPool`
 * that is not already an eojeol of the sentence. If the pool yields none, the
 * round has no decoy (still playable).
 */
export function buildRound(
  example: GrammarExample,
  decoyPool: readonly string[],
  rng: () => number = Math.random,
): SentenceGardenRound {
  const answer = eojeolsOf(example.sentence)
  const decoy = decoyPool.find((d) => d && !answer.includes(d))
  const cards = shuffle(decoy ? [...answer, decoy] : answer, rng)
  return { ko: example.ko, sentence: example.sentence, trans: example.trans, answer, cards }
}
```

- [ ] **Step 5: Run to verify pass**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/check.test.ts tests/unit/sentence-garden/build.test.ts`
Expected: PASS (6 passing). (`() => 0` makes shuffle deterministic: each Fisher-Yates swap picks index 0.)

- [ ] **Step 6: Commit**
```bash
cd munbeop && git add app/lib/sentence-garden/build.ts app/lib/sentence-garden/check.ts tests/unit/sentence-garden/build.test.ts tests/unit/sentence-garden/check.test.ts
git commit -m "feat(sentence-garden): pure round build + exact-match check"
```

---

## Task 2: selectRounds (short rounds for a deck)

**Files:**
- Create: `app/lib/sentence-garden/select.ts`
- Test: `tests/unit/sentence-garden/select.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/sentence-garden/select.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { selectRounds, MIN_EOJEOL, MAX_EOJEOL } from '~/lib/sentence-garden/select'
import type { GrammarExample } from '~/lib/domain'

const L0 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const mk = (ko: string, sentence: string): GrammarExample => ({ ko, sentence, trans: L0, level: 'polite' })

const POOL: GrammarExample[] = [
  mk('-아/어요', '저는 물을 마셔요.'),         // 3 eojeol — ok
  mk('-아/어요', '빵을 먹어요.'),               // 2 eojeol — too short
  mk('-(으)러 가다', '저는 책을 사러 서점에 갔어요.'), // 5 eojeol — ok
  mk('-지 않다', '오늘은 학교에 가지 않아요 정말로 아니요.'), // 6 eojeol — too long
  mk('-네요', '날씨가 정말 좋네요.'),           // 3 eojeol — ok but ko not in deck below
]

describe('selectRounds', () => {
  it('keeps only examples whose ko is in the deck and whose eojeol count is in range', () => {
    const rounds = selectRounds(POOL, ['-아/어요', '-(으)러 가다'], 8, () => 0)
    const sentences = rounds.map((r) => r.sentence)
    expect(sentences).toContain('저는 물을 마셔요.')
    expect(sentences).toContain('저는 책을 사러 서점에 갔어요.')
    expect(sentences).not.toContain('빵을 먹어요.') // too short
    expect(sentences).not.toContain('날씨가 정말 좋네요.') // ko not in deck
  })
  it('respects MIN_EOJEOL/MAX_EOJEOL bounds', () => {
    for (const r of selectRounds(POOL, ['-아/어요', '-(으)러 가다', '-지 않다'], 8, () => 0)) {
      expect(r.answer.length).toBeGreaterThanOrEqual(MIN_EOJEOL)
      expect(r.answer.length).toBeLessThanOrEqual(MAX_EOJEOL)
    }
  })
  it('caps the session size', () => {
    const many = Array.from({ length: 20 }, (_, i) => mk('-아/어요', `저는 물건 ${i}을 봐요.`))
    expect(selectRounds(many, ['-아/어요'], 8, () => 0)).toHaveLength(8)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/select.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement select.ts**

Create `app/lib/sentence-garden/select.ts`:
```ts
import type { GrammarExample } from '~/lib/domain'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, eojeolsOf, type SentenceGardenRound } from './build'

export const MIN_EOJEOL = 3
export const MAX_EOJEOL = 5

const inRange = (n: number) => n >= MIN_EOJEOL && n <= MAX_EOJEOL

/**
 * Playable rounds for a deck: examples whose `ko` is in `kos` and whose sentence
 * is 3-5 eojeol (rigid order → safe exact-match). Each round's decoy is a real
 * eojeol borrowed from ANOTHER kept example (same-grammar preferred), never one
 * already in the sentence. Shuffled, capped at `size`.
 */
export function selectRounds(
  examples: readonly GrammarExample[],
  kos: readonly string[],
  size: number,
  rng: () => number = Math.random,
): SentenceGardenRound[] {
  const koSet = new Set(kos)
  const playable = examples.filter((e) => koSet.has(e.ko) && inRange(eojeolsOf(e.sentence).length))
  const picked = shuffle(playable, rng).slice(0, size)
  return picked.map((ex) => {
    const sameGrammar = picked.filter((p) => p.ko === ex.ko && p !== ex)
    const others = sameGrammar.length ? sameGrammar : picked.filter((p) => p !== ex)
    const decoyPool = shuffle(others.flatMap((p) => eojeolsOf(p.sentence)), rng)
    return buildRound(ex, decoyPool, rng)
  })
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/select.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**
```bash
cd munbeop && git add app/lib/sentence-garden/select.ts tests/unit/sentence-garden/select.test.ts
git commit -m "feat(sentence-garden): selectRounds (short rounds + sibling decoy)"
```

---

## Task 3: useSentenceGarden composable

**Files:**
- Create: `app/composables/useSentenceGarden.ts`
- Test: `tests/unit/sentence-garden/useSentenceGarden.test.ts`

Read `app/composables/useClozeDrill.ts` first — this mirrors its store usage.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/sentence-garden/useSentenceGarden.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const added: unknown[] = []
const seen: string[] = []
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add: async (e: unknown) => { added.push(e) } }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: async (ko: string) => { seen.push(ko) }, recalculate: async () => {} }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: async () => {} }) }))
const played: string[] = []
vi.mock('~/composables/useExampleAudio', () => ({ useExampleAudio: () => ({ playExample: (s: string) => { played.push(s) }, stop: () => {} }) }))

import { useSentenceGarden } from '~/composables/useSentenceGarden'

describe('useSentenceGarden', () => {
  beforeEach(() => { setActivePinia(createPinia()); added.length = 0; seen.length = 0; played.length = 0 })

  it('start seeds a session and marks each grammar seen', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    expect(sg.sessionItems.value.length).toBeGreaterThan(0)
    expect(seen).toContain('-아/어요')
    // a fresh round deals every card to the tray, none placed
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value.length).toBe(sg.item.value.cards.length)
  })

  it('placing the model order correctly verifies, plays audio, and a correct round waters the plant on finish', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    const round = sg.item.value
    // place the cards in the model order by matching text
    for (const word of round.answer) {
      const card = sg.tray.value.find((c) => c.text === word)!
      sg.place(card)
    }
    expect(sg.canCheck.value).toBe(true)
    sg.check()
    expect(sg.phase.value).toBe('right')
    expect(played).toContain(round.sentence)
    // drive to done, then finish
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        // auto-pass remaining rounds by placing their model order
        for (const word of sg.item.value.answer) {
          const card = sg.tray.value.find((c) => c.text === word)!
          sg.place(card)
        }
        sg.check()
      }
      await sg.next()
    }
    await sg.finish()
    expect(added.some((e) => (e as { feedback: string }).feedback === 'easy')).toBe(true)
  })

  it('removeAt returns a placed card to the tray', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    const card = sg.tray.value[0]!
    const trayLen = sg.tray.value.length
    sg.place(card)
    expect(sg.placed.value).toHaveLength(1)
    expect(sg.tray.value).toHaveLength(trayLen - 1)
    sg.removeAt(0)
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value).toHaveLength(trayLen)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/useSentenceGarden.test.ts`
Expected: FAIL — composable not found.

- [ ] **Step 3: Implement the composable**

Create `app/composables/useSentenceGarden.ts`:
```ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { selectRounds } from '~/lib/sentence-garden/select'
import { checkOrder } from '~/lib/sentence-garden/check'
import type { SentenceGardenRound } from '~/lib/sentence-garden/build'
import { TOPIK_1_EXAMPLES } from '~/seed/grammar-examples/n1'
import { TOPIK_2_EXAMPLES } from '~/seed/grammar-examples/n2'
import { useExampleAudio } from '~/composables/useExampleAudio'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'

export type SGPhase = 'placing' | 'right' | 'wrong' | 'done'
export type SGRunMode = 'normal' | 'replay'
export interface SGCard { id: number; text: string }

const LAB_CONTEXT = { id: 'sentence-garden-lab', name: '문장 정원 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7
const POOL = [...TOPIK_1_EXAMPLES, ...TOPIK_2_EXAMPLES]

interface SGResult { sentence: string; ko: string; correct: boolean }

export function useSentenceGarden() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const { playExample } = useExampleAudio()

  const sessionItems = ref<SentenceGardenRound[]>([])
  const runMode = ref<SGRunMode>('normal')
  const index = ref(0)
  const phase = ref<SGPhase>('placing')
  const tray = ref<SGCard[]>([])
  const placed = ref<SGCard[]>([])
  const results = ref<SGResult[]>([])

  const item = computed<SentenceGardenRound>(() => sessionItems.value[index.value]!)
  const score = computed(() => ({
    correct: results.value.filter((r) => r.correct).length,
    total: results.value.length,
  }))
  const failedItems = computed(() =>
    sessionItems.value.filter((it) => results.value.some((r) => r.sentence === it.sentence && !r.correct)),
  )
  const canCheck = computed(() => !!item.value && placed.value.length === item.value.answer.length)

  function loadRound() {
    tray.value = item.value.cards.map((text, id) => ({ id, text }))
    placed.value = []
    phase.value = 'placing'
  }
  function resetRound() {
    index.value = 0
    results.value = []
    loadRound()
  }

  async function start(kos: string[]) {
    runMode.value = 'normal'
    sessionItems.value = selectRounds(POOL, kos, ROUND_SIZE, shuffle)
    if (sessionItems.value.length) resetRound()
    for (const ko of new Set(sessionItems.value.map((i) => i.ko))) await srsStore.markSeen(ko)
  }

  function place(card: SGCard) {
    if (phase.value !== 'placing') return
    const at = tray.value.findIndex((c) => c.id === card.id)
    if (at === -1) return
    tray.value.splice(at, 1)
    placed.value.push(card)
  }
  function removeAt(i: number) {
    if (phase.value !== 'placing') return
    const [card] = placed.value.splice(i, 1)
    if (card) tray.value.push(card)
  }

  function check() {
    if (phase.value !== 'placing' || !canCheck.value) return
    const correct = checkOrder(placed.value.map((c) => c.text), item.value.answer)
    results.value.push({ sentence: item.value.sentence, ko: item.value.ko, correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (correct) playExample(item.value.sentence)
    else if (runMode.value === 'normal') void logMistake(item.value)
  }

  async function next() {
    if (phase.value === 'placing' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    loadRound()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
  }

  async function finish() {
    if (runMode.value !== 'normal') return
    const byKo = new Map<string, { correct: number; total: number; first: SentenceGardenRound | null }>()
    for (const it of sessionItems.value) {
      const r = results.value.find((x) => x.sentence === it.sentence)
      if (!r) continue
      const g = byKo.get(it.ko) ?? { correct: 0, total: 0, first: null }
      g.total += 1
      if (r.correct) {
        g.correct += 1
        if (!g.first) g.first = it
      }
      byKo.set(it.ko, g)
    }
    for (const [ko, g] of byKo) {
      if (g.first && g.total > 0 && g.correct / g.total >= CREDIT_THRESHOLD) {
        await logStore.add({
          ko,
          sentence: g.first.sentence,
          feedback: 'easy',
          errorNote: null,
          reviewState: 'correct',
          contextId: LAB_CONTEXT.id,
          contextName: LAB_CONTEXT.name,
        })
      }
      await srsStore.recalculate(ko)
    }
  }

  async function logMistake(round: SentenceGardenRound) {
    await logStore.add({
      ko: round.ko,
      sentence: round.sentence,
      feedback: 'hard',
      errorNote: null,
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(round.ko)
  }

  return {
    sessionItems, runMode, index, phase, tray, placed, results,
    item, score, failedItems, canCheck,
    start, place, removeAt, check, next, replayFailed, finish,
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd munbeop && pnpm test tests/unit/sentence-garden/useSentenceGarden.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 5: Typecheck + commit**

Run: `cd munbeop && pnpm typecheck` → PASS.
```bash
cd munbeop && git add app/composables/useSentenceGarden.ts tests/unit/sentence-garden/useSentenceGarden.test.ts
git commit -m "feat(sentence-garden): useSentenceGarden composable (place/check/finish + SRS + audio)"
```

---

## Task 4: PracticeHelp mode + content + i18n chrome

**Files:**
- Modify: `app/lib/domain/practice-help.ts`, `app/seed/practice-help/index.ts`, `tests/unit/practice-help/seed-invariants.test.ts`
- Create: `app/seed/practice-help/sentence-garden.ts`, `tests/unit/i18n/sentence-garden-keys.test.ts`
- Modify: `i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

- [ ] **Step 1: Add the mode to the union**

In `app/lib/domain/practice-help.ts`, add `| 'sentence-garden'` as the last member of `PracticeHelpMode`.

- [ ] **Step 2: Create the help content**

Create `app/seed/practice-help/sentence-garden.ts`:
```ts
import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 문장 정원 (Sentence Garden) — explanation for the sentence-building card mode.
 * Prose localized via L(); native review (owner's wife) pending on the 8 translations.
 */
export const SENTENCE_GARDEN_HELP: PracticeHelpContent = {
  ko: '문장 정원',
  romanization: 'munjang jeongwon',
  subtitle: L(
    'the sentence-building garden',
    'el jardín de armar frases',
    'le jardin de construction de phrases',
    'o jardim de montar frases',
    'สวนประกอบประโยค',
    'taman menyusun kalimat',
    'khu vườn ghép câu',
    '文を組み立てる庭',
  ),
  concept: L(
    "Rebuild a real Korean sentence from its shuffled word (eojeol) cards. Korean is verb-final (SOV) and each particle sticks to the word before it, so the order matters. One card is a decoy that doesn't belong — there are always more cards than slots.",
    'Reconstruye una frase coreana real con sus cartas-palabra (eojeol) barajadas. El coreano pone el verbo al final (SOV) y cada partícula se pega a la palabra anterior, así que el orden importa. Una carta es un cebo que no va — siempre hay más cartas que huecos.',
    "Reconstruis une vraie phrase coréenne à partir de ses cartes-mots (eojeol) mélangées. Le coréen place le verbe à la fin (SOV) et chaque particule colle au mot précédent, donc l'ordre compte. Une carte est un leurre qui n'a pas sa place — il y a toujours plus de cartes que de cases.",
    'Reconstrua uma frase coreana real com suas cartas-palavra (eojeol) embaralhadas. O coreano põe o verbo no fim (SOV) e cada partícula gruda na palavra anterior, então a ordem importa. Uma carta é um chamariz que não entra — sempre há mais cartas que espaços.',
    'ประกอบประโยคภาษาเกาหลีจริงขึ้นใหม่จากการ์ดคำ (eojeol) ที่สับไว้ ภาษาเกาหลีวางกริยาไว้ท้าย (SOV) และอนุภาคติดกับคำข้างหน้า ลำดับจึงสำคัญ มีการ์ดหลอกหนึ่งใบที่ไม่เข้า—การ์ดมีมากกว่าช่องเสมอ',
    'Susun ulang kalimat Korea asli dari kartu-kata (eojeol) yang diacak. Bahasa Korea menaruh verba di akhir (SOV) dan tiap partikel menempel pada kata sebelumnya, jadi urutan penting. Satu kartu adalah umpan yang tidak masuk — kartu selalu lebih banyak dari slot.',
    'Ghép lại một câu tiếng Hàn thật từ các thẻ-từ (eojeol) đã xáo trộn. Tiếng Hàn đặt động từ ở cuối (SOV) và mỗi tiểu từ dính vào từ phía trước, nên thứ tự rất quan trọng. Một thẻ là mồi nhử không thuộc về câu — luôn có nhiều thẻ hơn ô.',
    'シャッフルされた語（eojeol）のカードから本物の韓国語の文を組み立てる。韓国語は動詞が最後（SOV）で、助詞は前の語にくっつくので語順が大切。1枚はどこにも入らないダミー——カードは常にマスより多い。',
  ),
  howToPlay: [
    L(
      'Pick a deck and read the target meaning shown above the bed.',
      'Elige un mazo y lee el significado objetivo que aparece sobre el cantero.',
      'Choisis un deck et lis le sens visé affiché au-dessus du parterre.',
      'Escolha um baralho e leia o significado-alvo mostrado acima do canteiro.',
      'เลือกชุดการ์ดแล้วอ่านความหมายเป้าหมายที่อยู่เหนือแปลง',
      'Pilih dek lalu baca makna target di atas bedeng.',
      'Chọn một bộ thẻ và đọc nghĩa mục tiêu hiện phía trên luống.',
      'デッキを選び、苗床の上に出る目標の意味を読む。',
    ),
    L(
      'Tap the word-cards into the bed in the correct order; tap a placed card to take it back.',
      'Toca las cartas-palabra en el orden correcto; toca una carta colocada para devolverla.',
      'Touche les cartes-mots dans le bon ordre ; touche une carte posée pour la reprendre.',
      'Toque as cartas-palavra na ordem certa; toque uma carta colocada para devolvê-la.',
      'แตะการ์ดคำลงในแปลงตามลำดับที่ถูก แตะการ์ดที่วางแล้วเพื่อเอากลับ',
      'Ketuk kartu-kata ke bedeng dalam urutan yang benar; ketuk kartu yang sudah ditaruh untuk mengambilnya kembali.',
      'Chạm các thẻ-từ vào luống theo đúng thứ tự; chạm thẻ đã đặt để lấy lại.',
      '語カードを正しい順に苗床へタップ。置いたカードをタップで戻せる。',
    ),
    L(
      'Check it — get the order right and the sentence is read aloud and the plant grows.',
      'Compruébalo: si aciertas el orden, la frase se lee en voz alta y la planta crece.',
      "Vérifie — si l'ordre est bon, la phrase est lue à voix haute et la plante grandit.",
      'Confira — se acertar a ordem, a frase é lida em voz alta e a planta cresce.',
      'กดตรวจ—ถ้าลำดับถูก ประโยคจะถูกอ่านออกเสียงและต้นไม้จะเติบโต',
      'Periksa — jika urutannya benar, kalimat dibacakan dan tanaman tumbuh.',
      'Kiểm tra — đúng thứ tự thì câu được đọc to và cây lớn lên.',
      'チェックする——順番が合えば文が読み上げられ、苗が育つ。',
    ),
  ],
  tip: L(
    "There's always one card too many — the decoy. If you finish and a real word is left with no slot, you placed the decoy; swap it out.",
    'Siempre sobra una carta: el cebo. Si terminas y una palabra real se queda sin hueco, colocaste el cebo; cámbialo.',
    'Il y a toujours une carte en trop : le leurre. Si à la fin un vrai mot reste sans case, tu as posé le leurre ; remplace-le.',
    'Sempre sobra uma carta: o chamariz. Se terminar e uma palavra real ficar sem espaço, você colocou o chamariz; troque-o.',
    'มีการ์ดเกินมาหนึ่งใบเสมอ คือการ์ดหลอก ถ้าทำเสร็จแล้วมีคำจริงเหลือไม่มีช่อง แสดงว่าคุณวางการ์ดหลอก ให้สลับออก',
    'Selalu ada satu kartu berlebih — umpannya. Kalau selesai dan ada kata asli tanpa slot, kamu menaruh umpan; tukar.',
    'Luôn dư một thẻ — mồi nhử. Nếu xong mà một từ thật không còn ô, bạn đã đặt mồi nhử; hãy đổi.',
    '必ず1枚多い——それがダミー。終えて本物の語が余ったら、ダミーを置いている。入れ替えよう。',
  ),
}
```

- [ ] **Step 3: Register it**

In `app/seed/practice-help/index.ts`: add `import { SENTENCE_GARDEN_HELP } from './sentence-garden'` with the other imports, and `'sentence-garden': SENTENCE_GARDEN_HELP,` to the `PRACTICE_HELP` object.

- [ ] **Step 4: Add `'sentence-garden'` to the seed-invariants MODES**

In `tests/unit/practice-help/seed-invariants.test.ts`, add `'sentence-garden'` to the `MODES` array.

- [ ] **Step 5: Add the i18n chrome keys (8 locales)**

Add to each `i18n/locales/*.json` a top-level `"sentenceGarden"` key and a `games.sentenceGarden` card. Use these strings:

`en`: `"sentenceGarden": { "title": "Sentence Garden", "lead": "Rebuild the sentence by ordering its word-cards. One card is a trap.", "pick_deck": "Pick a deck", "deck_empty": "This deck has no short sentences yet.", "progress_label": "Sentence", "check": "Check", "hear": "Hear it", "tray_label": "Word cards", "bed_label": "Your sentence", "replay_mode_label": "Replaying the ones you missed", "summary_again": "Play again", "summary_replay": "Replay misses" }` and `games.sentenceGarden`: `{ "name": "Sentence Garden", "desc": "Order the word-cards to rebuild a real Korean sentence." }`
`es`: title "Jardín de frases", lead "Reconstruye la frase ordenando sus cartas-palabra. Una carta es trampa.", pick_deck "Elige un mazo", deck_empty "Este mazo aún no tiene frases cortas.", progress_label "Frase", check "Comprobar", hear "Oír", tray_label "Cartas-palabra", bed_label "Tu frase", replay_mode_label "Repasando las que fallaste", summary_again "Jugar otra vez", summary_replay "Repasar fallos"; card name "Jardín de frases", desc "Ordena las cartas-palabra para reconstruir una frase coreana real."
`fr`: "Jardin de phrases" / "Reconstruis la phrase en ordonnant ses cartes-mots. Une carte est un piège." / "Choisis un deck" / "Ce deck n'a pas encore de phrases courtes." / "Phrase" / "Vérifier" / "Écouter" / "Cartes-mots" / "Ta phrase" / "On rejoue tes erreurs" / "Rejouer" / "Rejouer les erreurs"; card "Jardin de phrases" / "Ordonne les cartes-mots pour reconstruire une vraie phrase coréenne."
`pt-BR`: "Jardim de frases" / "Reconstrua a frase ordenando as cartas-palavra. Uma carta é uma cilada." / "Escolha um baralho" / "Este baralho ainda não tem frases curtas." / "Frase" / "Conferir" / "Ouvir" / "Cartas-palavra" / "Sua frase" / "Repassando as que você errou" / "Jogar de novo" / "Repassar erros"; card "Jardim de frases" / "Ordene as cartas-palavra para reconstruir uma frase coreana real."
`th`: "สวนประโยค" / "ประกอบประโยคใหม่โดยเรียงการ์ดคำ มีการ์ดหลอกหนึ่งใบ" / "เลือกชุดการ์ด" / "ชุดนี้ยังไม่มีประโยคสั้น" / "ประโยค" / "ตรวจ" / "ฟัง" / "การ์ดคำ" / "ประโยคของคุณ" / "กำลังเล่นซ้ำข้อที่พลาด" / "เล่นอีกครั้ง" / "เล่นซ้ำที่พลาด"; card "สวนประโยค" / "เรียงการ์ดคำเพื่อประกอบประโยคภาษาเกาหลีจริง"
`id`: "Taman kalimat" / "Susun ulang kalimat dengan mengurutkan kartu-katanya. Satu kartu adalah jebakan." / "Pilih dek" / "Dek ini belum punya kalimat pendek." / "Kalimat" / "Periksa" / "Dengar" / "Kartu kata" / "Kalimatmu" / "Mengulang yang meleset" / "Main lagi" / "Ulang yang meleset"; card "Taman kalimat" / "Urutkan kartu-kata untuk menyusun kalimat Korea asli."
`vi`: "Vườn câu" / "Ghép lại câu bằng cách sắp thứ tự các thẻ-từ. Một thẻ là bẫy." / "Chọn bộ thẻ" / "Bộ này chưa có câu ngắn." / "Câu" / "Kiểm tra" / "Nghe" / "Thẻ từ" / "Câu của bạn" / "Đang chơi lại những câu sai" / "Chơi lại" / "Chơi lại câu sai"; card "Vườn câu" / "Sắp thứ tự các thẻ-từ để ghép một câu tiếng Hàn thật."
`ja`: "文の庭" / "語カードを並べて文を組み立てよう。1枚はダミー。" / "デッキを選ぶ" / "このデッキにはまだ短い文がありません。" / "文" / "チェック" / "聞く" / "語カード" / "あなたの文" / "間違えた文をもう一度" / "もう一度" / "間違いを再挑戦"; card "文の庭" / "語カードを並べて本物の韓国語の文を組み立てよう。"

- [ ] **Step 6: Write the i18n parity test**

Create `tests/unit/i18n/sentence-garden-keys.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }
const keys = (o: Record<string, unknown>) => Object.keys((o.sentenceGarden as Record<string, unknown>) ?? {})

describe('sentenceGarden i18n parity', () => {
  it('every locale has the same sentenceGarden.* keys as en', () => {
    const base = keys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: keys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the games.sentenceGarden card', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const card = (loc.games as Record<string, Record<string, string>>)?.sentenceGarden
      expect({ name, ok: !!card?.name && !!card?.desc }).toEqual({ name, ok: true })
    }
  })
})
```

- [ ] **Step 7: Run the new tests + typecheck**

Run: `cd munbeop && pnpm test tests/unit/i18n/sentence-garden-keys.test.ts tests/unit/practice-help/seed-invariants.test.ts && pnpm typecheck`
Expected: PASS (the seed-invariants now validates the new help entry across 8 locales; typecheck confirms the L() calls + the union member).

- [ ] **Step 8: Commit**
```bash
cd munbeop && git add app/lib/domain/practice-help.ts app/seed/practice-help i18n/locales tests/unit/i18n/sentence-garden-keys.test.ts tests/unit/practice-help/seed-invariants.test.ts
git commit -m "feat(sentence-garden): PracticeHelp mode + content + i18n (8 locales)"
```

---

## Task 5: Components (SentenceCard, Tray, Bed, SentenceSummary)

**Files:**
- Create: `app/components/sentence-garden/{SentenceCard,Tray,Bed,SentenceSummary}.vue`
- Test: `tests/components/sentence-garden/{Tray,Bed}.test.ts`

- [ ] **Step 1: Write the failing component tests**

Create `tests/components/sentence-garden/Tray.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tray from '~/components/sentence-garden/Tray.vue'

describe('Tray', () => {
  it('renders a button per card and emits place on click', async () => {
    const cards = [{ id: 0, text: '저는' }, { id: 1, text: '물을' }]
    const w = mount(Tray, { props: { cards, label: 'Word cards' } })
    const btns = w.findAll('.sg-tray__card')
    expect(btns).toHaveLength(2)
    await btns[1]!.trigger('click')
    expect(w.emitted('place')![0]).toEqual([cards[1]])
  })
})
```

Create `tests/components/sentence-garden/Bed.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Bed from '~/components/sentence-garden/Bed.vue'

describe('Bed', () => {
  it('shows total slots and emits remove when a filled slot is clicked', async () => {
    const placed = [{ id: 0, text: '저는' }]
    const w = mount(Bed, { props: { placed, total: 3, verdict: null, label: 'Your sentence' } })
    expect(w.findAll('.sg-bed__slot')).toHaveLength(3)
    await w.find('.sg-bed__slot--filled').trigger('click')
    expect(w.emitted('remove')![0]).toEqual([0])
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd munbeop && pnpm test tests/components/sentence-garden/Tray.test.ts tests/components/sentence-garden/Bed.test.ts`
Expected: FAIL — components not found.

- [ ] **Step 3: Create SentenceCard.vue**

Create `app/components/sentence-garden/SentenceCard.vue`:
```vue
<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <span class="sg-card" lang="ko">{{ text }}</span>
</template>

<style scoped>
.sg-card {
  display: inline-block;
  font-family: var(--font-ko, 'Noto Sans KR', sans-serif);
  font-size: var(--text-lg);
  color: var(--ink);
  background: var(--paper-warm, var(--surface));
  border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream);
  padding: 8px 14px;
}
</style>
```

- [ ] **Step 4: Create Tray.vue**

Create `app/components/sentence-garden/Tray.vue`:
```vue
<script setup lang="ts">
import SentenceCard from './SentenceCard.vue'
import type { SGCard } from '~/composables/useSentenceGarden'

defineProps<{ cards: SGCard[]; label: string }>()
defineEmits<{ place: [card: SGCard] }>()
</script>

<template>
  <div class="sg-tray" role="group" :aria-label="label">
    <button
      v-for="card in cards"
      :key="card.id"
      type="button"
      class="sg-tray__card"
      @click="$emit('place', card)"
    >
      <SentenceCard :text="card.text" />
    </button>
  </div>
</template>

<style scoped>
.sg-tray { display: flex; flex-wrap: wrap; gap: 10px; }
.sg-tray__card { padding: 0; border: none; background: none; cursor: pointer; }
.sg-tray__card:focus-visible { outline: 2px solid var(--focus-ring, var(--gold)); outline-offset: 2px; }
</style>
```

- [ ] **Step 5: Create Bed.vue**

Create `app/components/sentence-garden/Bed.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import SentenceCard from './SentenceCard.vue'
import type { SGCard } from '~/composables/useSentenceGarden'

const props = defineProps<{
  placed: SGCard[]
  total: number
  verdict: boolean | null
  label: string
}>()
defineEmits<{ remove: [i: number] }>()

const slots = computed(() =>
  Array.from({ length: props.total }, (_, i) => props.placed[i] ?? null),
)
</script>

<template>
  <div
    class="sg-bed"
    role="group"
    :aria-label="label"
    :class="{ 'sg-bed--right': verdict === true, 'sg-bed--wrong': verdict === false }"
  >
    <component
      :is="card ? 'button' : 'div'"
      v-for="(card, i) in slots"
      :key="i"
      :type="card ? 'button' : undefined"
      class="sg-bed__slot"
      :class="{ 'sg-bed__slot--filled': !!card }"
      @click="card && $emit('remove', i)"
    >
      <SentenceCard v-if="card" :text="card.text" />
    </component>
  </div>
</template>

<style scoped>
.sg-bed { display: flex; flex-wrap: wrap; gap: 10px; min-height: 56px; }
.sg-bed__slot {
  min-width: 56px; min-height: 50px; display: flex; align-items: center; justify-content: center;
  border: 2px dashed var(--border); background: none; padding: 4px; font: inherit;
}
.sg-bed__slot--filled { border-style: solid; cursor: pointer; }
.sg-bed--right .sg-bed__slot--filled { border-color: var(--mastery-tree, #5a8f3c); }
.sg-bed--wrong .sg-bed__slot--filled { border-color: var(--red, #c0392b); }
</style>
```

- [ ] **Step 6: Create SentenceSummary.vue**

Create `app/components/sentence-garden/SentenceSummary.vue`:
```vue
<script setup lang="ts">
defineProps<{ score: { correct: number; total: number }; failedCount: number }>()
defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="sg-summary">
    <p class="sg-summary__score">{{ score.correct }} / {{ score.total }}</p>
    <div class="sg-summary__actions">
      <button type="button" @click="$emit('restart')">{{ t('sentenceGarden.summary_again') }}</button>
      <button v-if="failedCount > 0" type="button" @click="$emit('replayFailed')">
        {{ t('sentenceGarden.summary_replay') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.sg-summary { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.sg-summary__score { margin: 0; font-family: var(--font-pixel); font-size: var(--text-xl); color: var(--ink); }
.sg-summary__actions { display: flex; gap: 12px; }
</style>
```

- [ ] **Step 7: Run to verify pass**

Run: `cd munbeop && pnpm test tests/components/sentence-garden/Tray.test.ts tests/components/sentence-garden/Bed.test.ts`
Expected: PASS (2 passing).

- [ ] **Step 8: Commit**
```bash
cd munbeop && git add app/components/sentence-garden tests/components/sentence-garden
git commit -m "feat(sentence-garden): Tray/Bed/Card/Summary components"
```

---

## Task 6: Page + hub card

**Files:**
- Create: `app/pages/practice/sentence-garden.vue`
- Modify: `app/pages/practice/index.vue`

- [ ] **Step 1: Create the page**

Create `app/pages/practice/sentence-garden.vue` (mirrors `cloze.vue`):
```vue
<!-- app/pages/practice/sentence-garden.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import Modal from '~/components/ui/Modal.vue'
import Bed from '~/components/sentence-garden/Bed.vue'
import Tray from '~/components/sentence-garden/Tray.vue'
import SentenceSummary from '~/components/sentence-garden/SentenceSummary.vue'
import { buildDeckOptions, buildCustomDeckOptions } from '~/components/games/ruleta/cards'
import { useSentenceGarden } from '~/composables/useSentenceGarden'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useExampleAudio } from '~/composables/useExampleAudio'
import { kosForDeck } from '~/lib/cloze'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const { tl } = useLocalized()
const toast = useToast()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()
const sg = useSentenceGarden()
const { playExample } = useExampleAudio()

const phaseUi = ref<'pick' | 'play'>('pick')
const started = ref(false)
const builderOpen = ref(false)
const editingDeckId = ref<string | null>(null)

useGameLeaveGuard(() => started.value && sg.phase.value !== 'done')

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)
const customDeckOptions = computed(() => buildCustomDeckOptions({ decks: customDecks.decks }))
const verdict = computed(() =>
  sg.phase.value === 'right' ? true : sg.phase.value === 'wrong' ? false : null,
)

async function beginDeck(kos: string[]) {
  await sg.start(kos)
  if (sg.sessionItems.value.length === 0) {
    toast.info(t('sentenceGarden.deck_empty'))
    return
  }
  started.value = true
  phaseUi.value = 'play'
}
function onDeckSelect(deckId: string | null) {
  void beginDeck(kosForDeck(grammarStore.items, grammarStore.excludedDeckIds, deckId))
}
function onCustomDeckSelect(deckId: string) {
  const deck = customDecks.deckById(deckId)
  if (deck) void beginDeck(deck.grammarKos)
}
function onCustomCreate() { editingDeckId.value = null; builderOpen.value = true }
function onCustomEdit(deckId: string) { editingDeckId.value = deckId; builderOpen.value = true }
function onBuilderClose() { builderOpen.value = false; editingDeckId.value = null }

async function onNext() {
  await sg.next()
  if (sg.phase.value === 'done') await sg.finish()
}
function restart() { phaseUi.value = 'pick'; started.value = false }

onMounted(async () => {
  if (grammarStore.items.length === 0) {
    try { await grammarStore.hydrate() } catch (err) { console.error('sentence-garden: grammar hydration failed', err) }
  }
  if (customDecks.decks.length === 0) {
    try { await customDecks.hydrate() } catch (err) { console.error('sentence-garden: custom-deck hydration failed', err) }
  }
})
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="문장 정원" :latin="t('sentenceGarden.title')" />
    <PracticeHelp mode="sentence-garden" />
    <p class="lab__lead">{{ t('sentenceGarden.lead') }}</p>

    <div v-if="phaseUi === 'pick'">
      <p class="lab__pick-title">{{ t('sentenceGarden.pick_deck') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        @select="onCustomDeckSelect"
        @create="onCustomCreate"
        @edit="onCustomEdit"
      />
    </div>

    <template v-else>
      <p v-if="sg.runMode.value === 'replay' && sg.phase.value !== 'done'" class="lab__replay-note" role="status">
        <span aria-hidden="true">🔁</span> {{ t('sentenceGarden.replay_mode_label') }}
      </p>

      <template v-if="sg.phase.value !== 'done'">
        <ProgressDots
          :total="sg.sessionItems.value.length"
          :progress="sg.index.value"
          :label="t('sentenceGarden.progress_label')"
        />

        <div class="sg-prompt">
          <p class="sg-prompt__meaning">{{ tl(sg.item.value.trans) }}</p>
          <button type="button" class="sg-prompt__hear" @click="playExample(sg.item.value.sentence)">
            <span aria-hidden="true">🔊</span> {{ t('sentenceGarden.hear') }}
          </button>
        </div>

        <Bed
          :placed="sg.placed.value"
          :total="sg.item.value.answer.length"
          :verdict="verdict"
          :label="t('sentenceGarden.bed_label')"
          @remove="sg.removeAt"
        />
        <Tray
          :cards="sg.tray.value"
          :label="t('sentenceGarden.tray_label')"
          @place="sg.place"
        />

        <div class="sg-actions">
          <button
            v-if="sg.phase.value === 'placing'"
            type="button"
            class="sg-actions__check"
            :disabled="!sg.canCheck.value"
            @click="sg.check"
          >
            {{ t('sentenceGarden.check') }}
          </button>
          <button v-else type="button" class="sg-actions__check" @click="onNext">
            {{ t('practice.next') }}
          </button>
        </div>
      </template>

      <SentenceSummary
        v-else
        :score="sg.score.value"
        :failed-count="sg.failedItems.value.length"
        @restart="restart"
        @replay-failed="sg.replayFailed"
      />
    </template>

    <Modal
      :open="builderOpen"
      :title="t('practice.custom.builder_title')"
      :close-label="t('practice.custom.close')"
      @close="onBuilderClose"
    >
      <CustomDeckBuilder :key="editingDeckId ?? 'new'" :deck-id="editingDeckId" @saved="onBuilderClose" />
    </Modal>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__pick-title {
  margin: 0 0 12px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
.sg-prompt { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sg-prompt__meaning { margin: 0; font-family: var(--font-ui); font-size: var(--text-lg); color: var(--ink); }
.sg-prompt__hear {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  font-family: var(--font-pixel-small); font-size: var(--text-xs);
  color: var(--ink); background: var(--surface); border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream); padding: 6px 12px;
}
.sg-actions { display: flex; gap: 12px; }
.sg-actions__check {
  font-family: var(--font-pixel-small); font-size: var(--text-sm);
  color: var(--ink); background: var(--paper-warm, var(--surface)); border: 2px solid var(--border);
  box-shadow: 3px 3px 0 var(--shadow-cream); padding: 8px 18px; cursor: pointer;
}
.sg-actions__check:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 2: Add the hub card**

In `app/pages/practice/index.vue`, add a `GameCard` inside `.hub__grid` (after the cloze card). v1 uses an emoji cover (no PIL art yet):
```vue
      <GameCard
        to="/practice/sentence-garden"
        :name="t('games.sentenceGarden.name')"
        :description="t('games.sentenceGarden.desc')"
        emoji="🌱"
      />
```

- [ ] **Step 3: Typecheck + lint**

Run: `cd munbeop && pnpm typecheck && pnpm lint`
Expected: PASS (0 errors). If `import/first` complains, keep all imports at the top of `<script setup>`.

- [ ] **Step 4: Commit**
```bash
cd munbeop && git add app/pages/practice/sentence-garden.vue app/pages/practice/index.vue
git commit -m "feat(sentence-garden): page + practice-hub card"
```

---

## Task 7: Full gate + manual smoke

- [ ] **Step 1: Full suite** — Run `cd munbeop && pnpm test` → all green (note the new total).
- [ ] **Step 2: Typecheck** — `cd munbeop && pnpm typecheck` → 0 errors.
- [ ] **Step 3: Lint** — `cd munbeop && pnpm lint` → 0 errors.
- [ ] **Step 4: Manual smoke** — `cd munbeop && pnpm dev`, open `/practice/sentence-garden` (logged in — routes are auth-gated). Pick the TOPIK 1 deck; confirm: target meaning + 🔊 play; a bed with N slots and a tray with N+1 cards; tapping fills/returns; Check is disabled until N placed; correct order → green + audio + Next; the explanation modal (?) opens with the 문장 정원 content and the 💡 tip toggle; a deck with no short sentences shows the "empty" toast.
- [ ] **Step 5: Commit** any lint fixups: `cd munbeop && git add -A && git commit -m "chore(sentence-garden): lint fixups"` (skip if none).

---

## Self-Review

**Spec coverage:** mechanic (tap-to-place, N+1 cards) → Tasks 3,5,6; build/check/select → Tasks 1,2; exact-match short 1-2 → `selectRounds` bounds + `checkOrder`; decoy = sibling eojeol → `selectRounds`; deck+SRS+audio integration → Task 3 composable + Task 6 page; PracticeHelp mode + tip → Task 4; no decoy-warning UI → not built (correct); hub card + i18n → Tasks 4,6; tests → every task. Out-of-scope (drag, engine decoys, multi-order, TOPIK 3-6, real cover) is not implemented, as specified.

**Placeholder scan:** no TBD/TODO; every code step shows complete code; the i18n step lists exact strings for all 8 locales.

**Type consistency:** `SentenceGardenRound` (Task 1) is consumed identically in `select.ts` (Task 2) and the composable (Task 3). `SGCard = { id, text }` is defined in the composable (Task 3) and imported by Tray/Bed (Task 5). `checkOrder(placed, answer)`, `buildRound(example, decoyPool, rng)`, `selectRounds(examples, kos, size, rng)` signatures match their call sites. `phase` values `'placing'|'right'|'wrong'|'done'` are used consistently across the composable, page, and verdict computed. `sg.*` ref access in the page uses `.value` (composable returns refs).

**Known follow-ups (v2, not blockers):** real `tools/practice-covers` PIL cover (v1 = 🌱 emoji); engine-based decoys; multi-valid-order acceptor + TOPIK 3-6.
