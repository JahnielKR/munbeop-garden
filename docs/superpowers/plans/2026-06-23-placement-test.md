# Placement Test (배치 테스트) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A short ascending-ladder TOPIK placement test (`/practice/placement`) that estimates the learner's level and sets the starting deck for the practice loop.

**Architecture:** Two pure units carry the value — a deterministic **ladder engine** (`app/lib/placement/`) and an authored **item bank** (`app/seed/placement/`, cloze-of-usage, ~6 items/level × 6). A composable drives the ladder; thin components clone the proven cloze card. The result writes `startingDeckId` to the synced settings blob (no migration); the ruleta `DeckPicker` highlights it. The test is **assessment-only** — zero SRS/log writes.

**Tech Stack:** Nuxt 4 (SPA) + Vue 3 `<script setup>` + Pinia (setup stores) + Vitest + @vue/test-utils. Seed content uses the 8-locale `L()` helper. Spec: `docs/superpowers/specs/2026-06-23-placement-test-design.md`.

**Conventions reused (verified in-repo):**
- App lives under `munbeop/` (run all `npm` commands from there).
- Domain types barrel at `app/lib/domain/index.ts`; types imported via `~/lib/domain`.
- `shuffle` at `~/lib/particle-lab/shuffle`.
- `L(en, es, fr, ptBR, th, id, vi, ja)` from `app/seed/locale.ts` — order = `LOCALE_CODES`.
- Component tests: `tests/components/<feature>/`, key-echo `$t` stub. Logic/composable tests: `tests/unit/<feature>/`.
- **vitest import/first gotcha:** `vi.mock` is hoisted — keep the system-under-test import at the TOP of the test file (above mocks), or `import/first` lint fails. Type-only imports of a type from the wrong module pass vitest (esbuild strips) but fail `vue-tsc` → always typecheck before commit.

**Commands (from `munbeop/`):**
- Single test file: `npm run test -- <path>`
- Full suite: `npm run test`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

---

## File Structure

**Create:**
- `app/lib/placement/config.ts` — ladder constants.
- `app/lib/placement/ladder.ts` — pure state machine.
- `app/lib/placement/select.ts` — `itemsForLevel`, `selectItems`, `optionsFor`.
- `app/lib/placement/index.ts` — barrel.
- `app/lib/domain/placement.ts` — `PlacementItem` type.
- `app/seed/placement/n1.ts … n6.ts` — authored items.
- `app/seed/placement/index.ts` — `PLACEMENT_ITEMS`, `PLACEMENT_ITEMS_BY_LEVEL`.
- `app/composables/usePlacement.ts` — orchestrator.
- `app/components/placement/PlacementOption.vue` — option button (clone).
- `app/components/placement/PlacementCard.vue` — question card (clone).
- `app/components/placement/PlacementResult.vue` — result screen.
- `app/pages/practice/placement.vue` — page.
- Tests: `tests/unit/placement/{ladder,select,seed-invariants,usePlacement}.test.ts`, `tests/components/placement/{PlacementCard,PlacementResult}.test.ts`, `tests/unit/i18n/placement-keys.test.ts`.

**Modify:**
- `app/lib/domain/index.ts` — `export * from './placement'`.
- `app/stores/settings.ts` — add `startingDeckId`.
- `tests/unit/stores/settings.test.ts` — update blob assertions + add a setter test.
- `app/components/games/ruleta/DeckPicker.vue` — optional `recommendedId` prop + badge.
- `app/pages/practice/ruleta.vue` — pass `recommendedId` from settings.
- `tests/components/practice/DeckPicker.test.ts` — badge test.
- `app/components/garden/EmptyPlot.vue` — "Find your level" CTA.
- `app/pages/practice/index.vue` — placement `GameCard`.
- `i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json` — `placement.*`, `games.placement.*`, `practice.your_level`, `onboarding.empty.placement_cta`.

---

## Task 1: Ladder engine (pure)

**Files:**
- Create: `app/lib/placement/config.ts`
- Create: `app/lib/placement/ladder.ts`
- Test: `tests/unit/placement/ladder.test.ts`

- [ ] **Step 1: Write the config**

Create `app/lib/placement/config.ts`:

```ts
// app/lib/placement/config.ts
/** Questions asked per level before deciding pass/fail. */
export const Q_PER_LEVEL = 4
/** Correct answers needed to clear a level (>= 3 of 4). */
export const PASS_THRESHOLD = 3
export const MIN_LEVEL = 1
export const MAX_LEVEL = 6
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/placement/ladder.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createLadder, recordAnswer, ladderOutcome, type LadderState } from '~/lib/placement/ladder'

/** Drive the ladder with a flat list of booleans (one per question). */
function run(answers: boolean[]): LadderState {
  let s = createLadder()
  for (const a of answers) s = recordAnswer(s, a)
  return s
}
const REP = (val: boolean, n: number) => Array.from({ length: n }, () => val)

describe('placement ladder', () => {
  it('fails TOPIK 1 → cleared 0, starts at deck topik-1', () => {
    const s = run(REP(false, 4))
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(0)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 0, startingLevel: 1, startingDeckId: 'topik-1' })
  })

  it('clears 1–3 then fails 4 → cleared 3, starts at the frontier topik-4', () => {
    // 3 levels passed (4 correct each) + 1 level failed (1 correct of 4)
    const s = run([...REP(true, 12), true, false, false, false])
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(3)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 3, startingLevel: 4, startingDeckId: 'topik-4' })
  })

  it('clears all 6 → cleared 6, caps at topik-6', () => {
    const s = run(REP(true, 24))
    expect(s.done).toBe(true)
    expect(s.clearedLevel).toBe(6)
    expect(ladderOutcome(s)).toEqual({ clearedLevel: 6, startingLevel: 6, startingDeckId: 'topik-6' })
  })

  it('passes a level at exactly 3/4 and fails at 2/4', () => {
    // pass level 1 with 3 correct, then fail level 2 with 2 correct
    const s = run([true, true, true, false, true, true, false, false])
    expect(s.clearedLevel).toBe(1)
    expect(ladderOutcome(s).startingDeckId).toBe('topik-2')
  })

  it('is not done mid-level', () => {
    const s = run([true, true])
    expect(s.done).toBe(false)
    expect(s.currentLevel).toBe(1)
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test -- tests/unit/placement/ladder.test.ts`
Expected: FAIL — cannot resolve `~/lib/placement/ladder`.

- [ ] **Step 4: Implement the ladder**

Create `app/lib/placement/ladder.ts`:

```ts
// app/lib/placement/ladder.ts
import type { TopikLevel } from '~/lib/domain'
import { Q_PER_LEVEL, PASS_THRESHOLD, MIN_LEVEL, MAX_LEVEL } from './config'

export interface LadderState {
  /** Level currently being tested. */
  currentLevel: TopikLevel
  correctInLevel: number
  askedInLevel: number
  /** Highest level passed so far (0 = none). */
  clearedLevel: number
  done: boolean
}

export interface PlacementOutcome {
  clearedLevel: number
  /** Frontier — first level not cleared, clamped to [1, 6]. */
  startingLevel: TopikLevel
  startingDeckId: string
}

export function createLadder(): LadderState {
  return { currentLevel: MIN_LEVEL, correctInLevel: 0, askedInLevel: 0, clearedLevel: 0, done: false }
}

/** Record one answer; advance/stop when the level's questions are exhausted. */
export function recordAnswer(state: LadderState, correct: boolean): LadderState {
  if (state.done) return state
  const askedInLevel = state.askedInLevel + 1
  const correctInLevel = state.correctInLevel + (correct ? 1 : 0)

  if (askedInLevel < Q_PER_LEVEL) {
    return { ...state, askedInLevel, correctInLevel }
  }

  // Level complete.
  if (correctInLevel < PASS_THRESHOLD) {
    return { ...state, askedInLevel, correctInLevel, done: true }
  }
  const clearedLevel = state.currentLevel
  if (state.currentLevel >= MAX_LEVEL) {
    return { ...state, askedInLevel, correctInLevel, clearedLevel, done: true }
  }
  return {
    currentLevel: (state.currentLevel + 1) as TopikLevel,
    correctInLevel: 0,
    askedInLevel: 0,
    clearedLevel,
    done: false,
  }
}

export function ladderOutcome(state: LadderState): PlacementOutcome {
  const startingLevel = Math.min(
    Math.max(state.clearedLevel + 1, MIN_LEVEL),
    MAX_LEVEL,
  ) as TopikLevel
  return { clearedLevel: state.clearedLevel, startingLevel, startingDeckId: `topik-${startingLevel}` }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/unit/placement/ladder.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add app/lib/placement/config.ts app/lib/placement/ladder.ts tests/unit/placement/ladder.test.ts
git commit -m "feat(placement): ascending-ladder engine (4 q/level, pass 3/4)"
```

---

## Task 2: PlacementItem domain type

**Files:**
- Create: `app/lib/domain/placement.ts`
- Modify: `app/lib/domain/index.ts`

- [ ] **Step 1: Write the type**

Create `app/lib/domain/placement.ts`:

```ts
import type { LocalizedString } from './i18n'
import type { TopikLevel } from './topik'

/**
 * One placement question: a Korean sentence with a "{}" blank, 4 Korean
 * options (answer + 3 sibling distractors). Single-correct by construction.
 * `level` is the TOPIK level this item discriminates (its deck bucket).
 */
export interface PlacementItem {
  /** FK → Grammar.ko (validated against DEFAULT_GRAMMAR by seed-invariants). NOT translated. */
  ko: string
  level: TopikLevel
  /** Korean sentence with the literal "{}" blank. NOT translated. */
  sentence: string
  /** Correct surface form for the blank. NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong surface forms; valid Hangul; distinct; ≠ answer. NOT translated. */
  distractors: [string, string, string]
  trans: LocalizedString
  /** One line: why the answer fits and the others don't. */
  why: LocalizedString
}
```

- [ ] **Step 2: Add the barrel export**

In `app/lib/domain/index.ts`, add after the `./counters` line:

```ts
export * from './placement'
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (type compiles; `PlacementItem` resolves via `~/lib/domain`).

- [ ] **Step 4: Commit**

```bash
git add app/lib/domain/placement.ts app/lib/domain/index.ts
git commit -m "feat(placement): PlacementItem domain type"
```

---

## Task 3: Authored item bank (content)

**Files:**
- Create: `app/seed/placement/n1.ts … n6.ts`
- Create: `app/seed/placement/index.ts`
- Test: `tests/unit/placement/seed-invariants.test.ts`

> **Content note:** the full bank (~6 items/level × 6 ≈ 36) is produced by a
> Korean-lens content workflow (drafters per level → adversarial verify →
> scribe), exactly like Steps 6/8/9/13, and gated by the seed-invariants test
> (mechanical) + the Korean wife native-review (semantic). This task ships the
> file scaffolding, the exact `PlacementItem` schema, one worked example per
> level, and the gate test; the workflow fills each level to ≥ `Q_PER_LEVEL`+2.
> Each item must target a **level-defining** grammar point with distractors
> drawn from adjacent levels / real learner confusions, so it is answered at
> the target level and missed below it.

- [ ] **Step 1: Write the failing seed-invariants test**

Create `tests/unit/placement/seed-invariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PLACEMENT_ITEMS, PLACEMENT_ITEMS_BY_LEVEL } from '~/seed/placement'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES, TOPIK_LEVELS } from '~/lib/domain'
import { Q_PER_LEVEL } from '~/lib/placement/config'

const HANGUL = /[가-힣]/
const catalogKos = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))

describe('placement seed invariants', () => {
  it('every item ko exists in the grammar catalog', () => {
    for (const it of PLACEMENT_ITEMS) expect(catalogKos.has(it.ko), it.ko).toBe(true)
  })

  it('every sentence has exactly one {} blank and contains Hangul', () => {
    for (const it of PLACEMENT_ITEMS) {
      expect(it.sentence.split('{}').length, it.sentence).toBe(2)
      expect(HANGUL.test(it.sentence), it.sentence).toBe(true)
    }
  })

  it('every item has 3 distinct Hangul distractors ≠ answer', () => {
    for (const it of PLACEMENT_ITEMS) {
      expect(it.distractors, it.ko).toHaveLength(3)
      const all = [it.answer, ...it.distractors]
      expect(new Set(all).size, `${it.ko} duplicate option`).toBe(4)
      for (const d of it.distractors) expect(HANGUL.test(d), `${it.ko} distractor "${d}"`).toBe(true)
    }
  })

  it('every item level is 1..6 and matches its bucket', () => {
    for (const lvl of TOPIK_LEVELS) {
      for (const it of PLACEMENT_ITEMS_BY_LEVEL[lvl]) expect(it.level, it.ko).toBe(lvl)
    }
  })

  it('every trans and why is present in all 8 locales', () => {
    for (const it of PLACEMENT_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.ko} trans ${code}`).toBeTruthy()
        expect(it.why[code], `${it.ko} why ${code}`).toBeTruthy()
      }
    }
  })

  it('every level has at least Q_PER_LEVEL items', () => {
    for (const lvl of TOPIK_LEVELS) {
      expect(PLACEMENT_ITEMS_BY_LEVEL[lvl].length, `level ${lvl}`).toBeGreaterThanOrEqual(Q_PER_LEVEL)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/unit/placement/seed-invariants.test.ts`
Expected: FAIL — cannot resolve `~/seed/placement`.

- [ ] **Step 3: Create one level file (template for all six)**

Create `app/seed/placement/n1.ts` (the workflow extends this to ≥ 6 items;
levels n2–n6 follow the identical shape with level-appropriate grammar):

```ts
// app/seed/placement/n1.ts
import type { PlacementItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-1 placement items. ko matches grammars-n1.ts verbatim. Choose the form
 * that fits the blank — single-correct, forced by a temporal/structural cue.
 * Drafted + Korean-lens verified; wife native review = final gate.
 */
export const N1_PLACEMENT: PlacementItem[] = [
  {
    ko: '-았/었어요',
    level: 1,
    sentence: '어제 도서관에서 친구를 {}.',
    answer: '만났어요',
    distractors: ['만나요', '만날 거예요', '만납니다'],
    trans: L(
      'I met a friend at the library yesterday.',
      'Ayer me encontré con un amigo en la biblioteca.',
      "Hier, j'ai rencontré un ami à la bibliothèque.",
      'Ontem encontrei um amigo na biblioteca.',
      'เมื่อวานเจอเพื่อนที่ห้องสมุด',
      'Kemarin saya bertemu teman di perpustakaan.',
      'Hôm qua tôi đã gặp bạn ở thư viện.',
      '昨日、図書館で友達に会いました。',
    ),
    why: L(
      '어제 (yesterday) forces the past -았/었어요; the others are present/future/formal.',
      '어제 (ayer) exige el pasado -았/었어요; los demás son presente/futuro/formal.',
      '어제 (hier) impose le passé -았/었어요 ; les autres sont présent/futur/formel.',
      '어제 (ontem) exige o passado -았/었어요; os outros são presente/futuro/formal.',
      '어제 บังคับอดีต -았/었어요; ตัวอื่นเป็นปัจจุบัน/อนาคต/ทางการ',
      '어제 mengharuskan lampau -았/었어요; sisanya kini/nanti/formal.',
      '어제 buộc quá khứ -았/었어요; các lựa chọn khác là hiện tại/tương lai/trang trọng.',
      '어제（昨日）が過去 -았/었어요 を要求。他は現在・未来・格式。',
    ),
  },
  // … workflow adds ≥ 5 more TOPIK-1 items here.
]
```

Create `app/seed/placement/n2.ts` … `app/seed/placement/n6.ts` with the same
shape, exporting `N2_PLACEMENT … N6_PLACEMENT` (`level: 2 … 6`), each with one
worked item to start; the workflow fills them to ≥ 6.

- [ ] **Step 4: Create the seed index**

Create `app/seed/placement/index.ts`:

```ts
import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { N1_PLACEMENT } from './n1'
import { N2_PLACEMENT } from './n2'
import { N3_PLACEMENT } from './n3'
import { N4_PLACEMENT } from './n4'
import { N5_PLACEMENT } from './n5'
import { N6_PLACEMENT } from './n6'

export const PLACEMENT_ITEMS_BY_LEVEL: Record<TopikLevel, PlacementItem[]> = {
  1: N1_PLACEMENT,
  2: N2_PLACEMENT,
  3: N3_PLACEMENT,
  4: N4_PLACEMENT,
  5: N5_PLACEMENT,
  6: N6_PLACEMENT,
}

export const PLACEMENT_ITEMS: PlacementItem[] = [
  ...N1_PLACEMENT, ...N2_PLACEMENT, ...N3_PLACEMENT,
  ...N4_PLACEMENT, ...N5_PLACEMENT, ...N6_PLACEMENT,
]
```

- [ ] **Step 5: Run the content workflow to fill each level to ≥ 6 items**

Author the remaining items per level via the Korean-lens content workflow (see
the Content note above). Each item: a level-defining `ko` from
`grammars-n{level}.ts`, a single-correct sentence with `{}`, 3 sibling
distractors, full 8-locale `trans` + `why`. Re-run the invariants test after
each level until green.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test -- tests/unit/placement/seed-invariants.test.ts`
Expected: PASS (6 assertions; every level ≥ 4 items).

- [ ] **Step 7: Commit**

```bash
git add app/seed/placement tests/unit/placement/seed-invariants.test.ts
git commit -m "feat(placement): authored item bank (6 TOPIK levels) + invariants"
```

> **Pending (post-merge):** Korean wife native-review of the full bank — the
> documented semantic gate.

---

## Task 4: Item selection

**Files:**
- Create: `app/lib/placement/select.ts`
- Create: `app/lib/placement/index.ts`
- Test: `tests/unit/placement/select.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/placement/select.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { itemsForLevel, selectItems, optionsFor } from '~/lib/placement/select'
import type { PlacementItem } from '~/lib/domain'

const mk = (ko: string, level: 1 | 2): PlacementItem => ({
  ko, level, sentence: `${ko} {}.`, answer: `${ko}-a`,
  distractors: [`${ko}-b`, `${ko}-c`, `${ko}-d`],
  trans: { en: 't' } as never, why: { en: 'w' } as never,
})
const source = { 1: [mk('a', 1), mk('b', 1), mk('c', 1)], 2: [mk('x', 2)] } as never

describe('placement select', () => {
  it('itemsForLevel returns the bucket for a level', () => {
    expect(itemsForLevel(1, source).map((i) => i.ko)).toEqual(['a', 'b', 'c'])
    expect(itemsForLevel(2, source).map((i) => i.ko)).toEqual(['x'])
  })

  it('selectItems returns n distinct items', () => {
    const picked = selectItems(itemsForLevel(1, source), 2, (xs) => xs)
    expect(picked).toHaveLength(2)
    expect(new Set(picked.map((i) => i.ko)).size).toBe(2)
  })

  it('selectItems caps at the pool size when n exceeds it', () => {
    expect(selectItems(itemsForLevel(2, source), 4, (xs) => xs)).toHaveLength(1)
  })

  it('optionsFor puts the answer first, then the 3 distractors', () => {
    expect(optionsFor(mk('a', 1))).toEqual(['a-a', 'a-b', 'a-c', 'a-d'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/unit/placement/select.test.ts`
Expected: FAIL — cannot resolve `~/lib/placement/select`.

- [ ] **Step 3: Implement select**

Create `app/lib/placement/select.ts`:

```ts
// app/lib/placement/select.ts
import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { PLACEMENT_ITEMS_BY_LEVEL } from '~/seed/placement'

/** Items authored for a TOPIK level. */
export function itemsForLevel(
  level: TopikLevel,
  source: Record<TopikLevel, PlacementItem[]> = PLACEMENT_ITEMS_BY_LEVEL,
): PlacementItem[] {
  return source[level] ?? []
}

/** n distinct items from a pool (shuffle is injected; runtime randomness only). */
export function selectItems(
  pool: PlacementItem[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
): PlacementItem[] {
  return shuffleFn([...pool]).slice(0, n)
}

/** answer first, then the 3 distractors (the composable shuffles for display). */
export function optionsFor(item: PlacementItem): string[] {
  return [item.answer, ...item.distractors]
}
```

- [ ] **Step 4: Create the barrel**

Create `app/lib/placement/index.ts`:

```ts
export * from './config'
export * from './ladder'
export * from './select'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/unit/placement/select.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add app/lib/placement/select.ts app/lib/placement/index.ts tests/unit/placement/select.test.ts
git commit -m "feat(placement): item selection + barrel"
```

---

## Task 5: Settings — `startingDeckId`

**Files:**
- Modify: `app/stores/settings.ts`
- Modify: `tests/unit/stores/settings.test.ts`

- [ ] **Step 1: Update the failing test first**

In `tests/unit/stores/settings.test.ts`, update the three `mockWrite` blob
assertions to include `startingDeckId: null`, and add a setter test. The three
existing `toHaveBeenCalledWith` lines become:

```ts
expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'dark', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
```
```ts
expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'system', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
```
```ts
expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'light', locale: 'ja', dailyGoal: 3, reviewReminders: false, startingDeckId: null })
```

Add a new test inside the `describe`:

```ts
it('setStartingDeck stores the deck and writes the full blob', async () => {
  const s = useSettingsStore()
  await s.setStartingDeck('topik-4')
  expect(s.startingDeckId).toBe('topik-4')
  expect(mockWrite).toHaveBeenCalledWith('munbeop.v1.settings', { theme: 'light', locale: 'en', dailyGoal: 3, reviewReminders: false, startingDeckId: 'topik-4' })
})

it('hydrate applies a stored startingDeckId', async () => {
  signIn()
  mockRead.mockResolvedValue({ startingDeckId: 'topik-3' })
  await useSettingsStore().hydrate()
  expect(useSettingsStore().startingDeckId).toBe('topik-3')
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/unit/stores/settings.test.ts`
Expected: FAIL — blob assertions miss `startingDeckId`; `setStartingDeck` undefined.

- [ ] **Step 3: Add the field to the store**

In `app/stores/settings.ts`:

Add to the `Settings` interface (after `reviewReminders: boolean`):
```ts
  startingDeckId: string | null
```

Add a ref (after `const reviewReminders = ref(false)`):
```ts
  const startingDeckId = ref<string | null>(null)
```

In `hydrate()`, after the `reviewReminders` line:
```ts
      if (typeof cloud.startingDeckId === 'string') startingDeckId.value = cloud.startingDeckId
```

In `persistCloud()`, add to the written object (after `reviewReminders: reviewReminders.value,`):
```ts
        startingDeckId: startingDeckId.value,
```

Add the setter (after `setReviewReminders`):
```ts
  async function setStartingDeck(deckId: string): Promise<void> {
    startingDeckId.value = deckId
    await persistCloud()
  }
```

Add to the `return { … }`:
```ts
    startingDeckId, setStartingDeck,
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- tests/unit/stores/settings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/stores/settings.ts tests/unit/stores/settings.test.ts
git commit -m "feat(placement): startingDeckId in the settings blob (no migration)"
```

---

## Task 6: `usePlacement` composable

**Files:**
- Create: `app/composables/usePlacement.ts`
- Test: `tests/unit/placement/usePlacement.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/placement/usePlacement.test.ts` (SUT import at top — `vi.mock` is hoisted):

```ts
import { usePlacement } from '~/composables/usePlacement'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { PlacementItem } from '~/lib/domain'

const setStartingDeck = vi.fn()
vi.mock('~/stores/settings', () => ({ useSettingsStore: () => ({ setStartingDeck }) }))

const mk = (ko: string, level: number, correct: string): PlacementItem => ({
  ko, level: level as never, sentence: `${ko} {}.`, answer: correct,
  distractors: [`${ko}-b`, `${ko}-c`, `${ko}-d`],
  trans: { en: 't' } as never, why: { en: 'w' } as never,
})
// 6 identical-per-level items so selection always has enough.
const bucket = (lvl: number) => Array.from({ length: 6 }, (_, i) => mk(`L${lvl}i${i}`, lvl, `L${lvl}i${i}`))
vi.mock('~/seed/placement', () => ({
  PLACEMENT_ITEMS_BY_LEVEL: { 1: bucket(1), 2: bucket(2), 3: bucket(3), 4: bucket(4), 5: bucket(5), 6: bucket(6) },
  PLACEMENT_ITEMS: [],
}))

beforeEach(() => {
  setActivePinia(createPinia())
  setStartingDeck.mockClear()
})

/** Answer the current question; pass `correct` to choose the right/wrong option. */
async function step(p: ReturnType<typeof usePlacement>, correct: boolean) {
  p.answer(correct ? p.item.value.answer : p.item.value.distractors[0])
  await p.next()
}

describe('usePlacement', () => {
  it('a learner who fails level 1 ends placed at topik-1', async () => {
    const p = usePlacement()
    p.start()
    for (let i = 0; i < 4; i++) await step(p, false)
    expect(p.phase.value).toBe('done')
    expect(p.outcome.value?.startingDeckId).toBe('topik-1')
    expect(setStartingDeck).toHaveBeenCalledWith('topik-1')
  })

  it('a learner who clears 1–3 then fails 4 is placed at topik-4', async () => {
    const p = usePlacement()
    p.start()
    for (let i = 0; i < 12; i++) await step(p, true) // clear levels 1,2,3
    await step(p, true)                              // level 4: 1 correct
    for (let i = 0; i < 3; i++) await step(p, false) // then 3 wrong → fail
    expect(p.outcome.value?.startingDeckId).toBe('topik-4')
    expect(setStartingDeck).toHaveBeenCalledWith('topik-4')
  })

  it('exposes 4 display options including the answer', () => {
    const p = usePlacement()
    p.start()
    expect(p.displayOptions.value).toHaveLength(4)
    expect(p.displayOptions.value).toContain(p.item.value.answer)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/unit/placement/usePlacement.test.ts`
Expected: FAIL — cannot resolve `~/composables/usePlacement`.

- [ ] **Step 3: Implement the composable**

Create `app/composables/usePlacement.ts`:

```ts
// app/composables/usePlacement.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  createLadder, recordAnswer, ladderOutcome,
  itemsForLevel, selectItems, optionsFor, Q_PER_LEVEL,
  type LadderState, type PlacementOutcome,
} from '~/lib/placement'
import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { useSettingsStore } from '~/stores/settings'

export type PlacementPhase = 'question' | 'right' | 'wrong' | 'done'

export function usePlacement() {
  const settings = useSettingsStore()

  const ladder = ref<LadderState>(createLadder())
  const levelItems = ref<PlacementItem[]>([])
  const indexInLevel = ref(0)
  const displayOptions = ref<string[]>([])
  const phase = ref<PlacementPhase>('question')
  const picked = ref<string | null>(null)
  const outcome = ref<PlacementOutcome | null>(null)
  const answered = ref(0)

  const item = computed<PlacementItem>(() => levelItems.value[indexInLevel.value]!)

  function loadLevel(level: TopikLevel) {
    levelItems.value = selectItems(itemsForLevel(level), Q_PER_LEVEL, shuffle)
    indexInLevel.value = 0
    phase.value = 'question'
    picked.value = null
    if (levelItems.value.length) displayOptions.value = shuffle(optionsFor(item.value))
  }

  function start() {
    ladder.value = createLadder()
    outcome.value = null
    answered.value = 0
    loadLevel(ladder.value.currentLevel)
  }

  function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    phase.value = choice === item.value.answer ? 'right' : 'wrong'
  }

  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    const correct = phase.value === 'right'
    answered.value += 1
    const prevLevel = ladder.value.currentLevel
    ladder.value = recordAnswer(ladder.value, correct)

    if (ladder.value.done) {
      outcome.value = ladderOutcome(ladder.value)
      phase.value = 'done'
      await settings.setStartingDeck(outcome.value.startingDeckId)
      return
    }
    if (ladder.value.currentLevel !== prevLevel) {
      loadLevel(ladder.value.currentLevel)
    } else {
      indexInLevel.value += 1
      phase.value = 'question'
      picked.value = null
      displayOptions.value = shuffle(optionsFor(item.value))
    }
  }

  return { ladder, item, displayOptions, phase, picked, outcome, answered, start, answer, next }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- tests/unit/placement/usePlacement.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run typecheck` (Expected: PASS)

```bash
git add app/composables/usePlacement.ts tests/unit/placement/usePlacement.test.ts
git commit -m "feat(placement): usePlacement ladder orchestrator"
```

---

## Task 7: Question card components

**Files:**
- Create: `app/components/placement/PlacementOption.vue`
- Create: `app/components/placement/PlacementCard.vue`
- Test: `tests/components/placement/PlacementCard.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `tests/components/placement/PlacementCard.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlacementCard from '~/components/placement/PlacementCard.vue'
import type { PlacementItem } from '~/lib/domain'

const item: PlacementItem = {
  ko: '-고 싶다', level: 1, sentence: '영화를 {} 싶어요.', answer: '보고',
  distractors: ['봐서', '보지만', '보면'],
  trans: { en: 'I want to watch a movie.' } as never,
  why: { en: 'Only -고 chains with 싶다.' } as never,
}
const options = ['보고', '봐서', '보지만', '보면']

function factory(phase = 'question', picked: string | null = null) {
  return mount(PlacementCard, {
    props: { item, options, phase, verdict: phase === 'wrong' ? false : phase === 'right' ? true : null, picked },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('PlacementCard', () => {
  it('renders the sentence split on {} and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('영화를')
    expect(w.findAll('[data-testid^="placement-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="placement-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe('보고')
  })
  it('on wrong, reveals the correct answer and the why line', () => {
    const w = factory('wrong', '봐서')
    expect(w.text()).toContain('보고')
    expect(w.text()).toContain('Only -고 chains with 싶다.')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/components/placement/PlacementCard.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create `PlacementOption.vue`**

Create `app/components/placement/PlacementOption.vue` (clone of ClozeOption):

```vue
<!-- app/components/placement/PlacementOption.vue -->
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
  <button type="button" class="opt" :class="`opt--${state}`" :disabled="disabled" lang="ko" @click="$emit('pick')">
    {{ label }}
  </button>
</template>

<style scoped>
/* Copied verbatim from app/components/cloze-drill/ClozeOption.vue */
.opt {
  padding: 12px 14px; min-height: 44px; background: var(--paper-deep); border: 2px solid var(--border);
  box-shadow: var(--shadow-button); color: var(--text); font-family: var(--font-ko); font-size: var(--text-lg);
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), border-color var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out), box-shadow var(--motion-quick) var(--ease-out);
}
.opt:hover:not(:disabled) { border-color: var(--accent); transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.opt:active:not(:disabled) { transform: translate(1px, 1px); box-shadow: var(--shadow-button-pressed); }
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt--correct { border-color: var(--success); background: var(--surface); }
.opt--wrong { border-color: var(--danger); background: var(--surface); }
.opt--muted { opacity: 0.55; box-shadow: none; transform: none; }
.opt:disabled { cursor: default; box-shadow: none; transform: none; }
</style>
```

- [ ] **Step 4: Create `PlacementCard.vue`**

Create `app/components/placement/PlacementCard.vue` (clone of ClozeCard, typed
to `PlacementItem`, `placement.*` i18n keys, `placement-option-*` testids):

```vue
<!-- app/components/placement/PlacementCard.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { PlacementItem } from '~/lib/domain'
import PlacementOption from './PlacementOption.vue'

interface Props {
  item: PlacementItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  verdict: boolean | null
  picked: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; next: [] }>()
const { tl } = useLocalized()

const card = ref<HTMLDivElement | null>(null)
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const parts = computed(() => props.item.sentence.split('{}'))
const filled = computed(() => (revealed.value ? props.item.answer : null))

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

onMounted(() => void card.value?.focus())
watch(
  () => [props.item.ko, props.item.sentence, props.phase] as const,
  async ([, , phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" data-testid="placement-card">
    <p class="card__sentence" lang="ko">
      <span>{{ parts[0] }}</span>
      <span class="card__blank" :class="{ 'card__blank--filled': revealed }">{{ filled ?? '____' }}</span>
      <span>{{ parts[1] }}</span>
    </p>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('placement.pick_hint') }}</p>

    <div class="card__options">
      <PlacementOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`placement-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('placement.correct') : $t('placement.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">{{ $t('placement.reveal_correct', { correct: item.answer }) }}</p>
      <p class="card__why">{{ tl(item.why) }}</p>
      <p class="card__trans">{{ tl(item.trans) }}</p>
      <button type="button" class="card__next" :aria-label="$t('placement.next')" @click="emit('next')">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Copied verbatim from app/components/cloze-drill/ClozeCard.vue */
.card { display: flex; flex-direction: column; gap: 16px; }
.card__sentence { margin: 0; font-family: var(--font-ko); font-size: 20px; line-height: 1.7; color: var(--text); }
.card__blank { border-bottom: 2px solid var(--border); padding: 0 10px; margin: 0 2px; font-weight: 700; }
.card__blank--filled { border-bottom-color: var(--heading-accent); color: var(--heading-accent); }
.card__hint { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card__feedback { display: flex; flex-direction: column; gap: 8px; }
.card__verdict { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); }
.card__verdict--ok { color: var(--heading-accent); }
.card__verdict--no { color: var(--danger); }
.card__correct { margin: 0; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); }
.card__why { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text); line-height: 1.6; }
.card__trans { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
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

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/components/placement/PlacementCard.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add app/components/placement/PlacementOption.vue app/components/placement/PlacementCard.vue tests/components/placement/PlacementCard.test.ts
git commit -m "feat(placement): question card + option components"
```

---

## Task 8: Result screen

**Files:**
- Create: `app/components/placement/PlacementResult.vue`
- Test: `tests/components/placement/PlacementResult.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/components/placement/PlacementResult.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlacementResult from '~/components/placement/PlacementResult.vue'

// No `props` on the stub so `to` falls through to the <a> as a DOM attribute.
const stubs = { NuxtLink: { template: '<a><slot /></a>' } }
const mocks = { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }

describe('PlacementResult', () => {
  it('shows the cleared level and a CTA to the frontier deck', () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 3, startingLevel: 4, startingDeckId: 'topik-4' } },
      global: { stubs, mocks },
    })
    expect(w.text()).toContain('placement.result.your_level:{"level":3}')
    expect(w.text()).toContain('placement.result.cta:{"level":4}')
    expect(w.get('[data-testid="placement-cta"]').attributes('to')).toBe('/practice/ruleta')
  })

  it('shows the "just starting" copy when nothing was cleared', () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 0, startingLevel: 1, startingDeckId: 'topik-1' } },
      global: { stubs, mocks },
    })
    expect(w.text()).toContain('placement.result.just_starting')
  })

  it('emits retake', async () => {
    const w = mount(PlacementResult, {
      props: { outcome: { clearedLevel: 6, startingLevel: 6, startingDeckId: 'topik-6' } },
      global: { stubs, mocks },
    })
    await w.get('[data-testid="placement-retake"]').trigger('click')
    expect(w.emitted('retake')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/components/placement/PlacementResult.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create `PlacementResult.vue`**

Create `app/components/placement/PlacementResult.vue`:

```vue
<!-- app/components/placement/PlacementResult.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NuxtLink } from '#components'
import type { PlacementOutcome } from '~/lib/placement'

interface Props {
  outcome: PlacementOutcome
}
defineProps<Props>()
defineEmits<{ retake: [] }>()

const root = ref<HTMLElement | null>(null)
onMounted(() => root.value?.focus())
</script>

<template>
  <section ref="root" tabindex="-1" class="result" data-testid="placement-result">
    <p v-if="outcome.clearedLevel === 0" class="result__lead" role="status">
      {{ $t('placement.result.just_starting') }}
    </p>
    <p v-else class="result__level" role="status">
      {{ $t('placement.result.your_level', { level: outcome.clearedLevel }) }}
    </p>

    <p class="result__start">{{ $t('placement.result.start_with', { level: outcome.startingLevel }) }}</p>

    <div class="result__actions">
      <NuxtLink class="result__btn result__btn--primary" data-testid="placement-cta" to="/practice/ruleta">
        {{ $t('placement.result.cta', { level: outcome.startingLevel }) }}
      </NuxtLink>
      <button type="button" class="result__btn" data-testid="placement-retake" @click="$emit('retake')">
        {{ $t('placement.result.retake') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.result { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.result__level { margin: 0; font-family: var(--font-pixel-display); font-size: var(--text-lg); color: var(--text); }
.result__lead { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-md); color: var(--text); }
.result__start { margin: 0; font-family: var(--font-ui); font-size: var(--text-md); color: var(--text-soft); }
.result__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.result__btn {
  min-width: 0; padding: 10px 16px; background: var(--surface); color: var(--text); text-decoration: none;
  border: 3px solid var(--border-strong); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.result__btn--primary { background: var(--accent); color: var(--text-on-accent); }
.result__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.result__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.result:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- tests/components/placement/PlacementResult.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/placement/PlacementResult.vue tests/components/placement/PlacementResult.test.ts
git commit -m "feat(placement): result screen with frontier-deck CTA"
```

---

## Task 9: Placement page

**Files:**
- Create: `app/pages/practice/placement.vue`

> Pages aren't unit-tested in this repo (covered by composable + component
> tests); verify by typecheck + `nuxt dev` boot + manual/preview smoke.

- [ ] **Step 1: Create the page**

Create `app/pages/practice/placement.vue`:

```vue
<!-- app/pages/practice/placement.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import PlacementCard from '~/components/placement/PlacementCard.vue'
import PlacementResult from '~/components/placement/PlacementResult.vue'
import { usePlacement } from '~/composables/usePlacement'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { Q_PER_LEVEL } from '~/lib/placement'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const placement = usePlacement()
const started = ref(false)

useGameLeaveGuard(() => started.value && placement.phase.value !== 'done')

function begin() {
  placement.start()
  started.value = true
}
function onRetake() {
  placement.start()
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="배치 테스트" :latin="t('placement.title')" />
    <p class="lab__lead">{{ t('placement.lead') }}</p>

    <div v-if="!started" class="lab__intro">
      <p class="lab__intro-detail">{{ t('placement.intro_detail') }}</p>
      <Button @click="begin">{{ t('placement.start') }}</Button>
    </div>

    <template v-else>
      <template v-if="placement.phase.value !== 'done'">
        <p class="lab__level" role="status">{{ t('placement.level_tag', { level: placement.ladder.value.currentLevel }) }}</p>
        <ProgressDots
          :total="Q_PER_LEVEL"
          :progress="placement.ladder.value.askedInLevel"
          :label="t('placement.progress_label')"
        />
        <PlacementCard
          :item="placement.item.value"
          :options="placement.displayOptions.value"
          :phase="placement.phase.value"
          :verdict="placement.phase.value === 'right' ? true : placement.phase.value === 'wrong' ? false : null"
          :picked="placement.picked.value"
          @answer="placement.answer"
          @next="placement.next"
        />
      </template>
      <PlacementResult v-else :outcome="placement.outcome.value!" @retake="onRetake" />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__intro { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
.lab__intro-detail { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.lab__level {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em;
  color: var(--text-soft); text-transform: uppercase;
}
</style>
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Boot the dev server (smoke)**

Run: `npm run dev` — confirm it boots with no build errors, then visit
`/practice/placement`: Start → answer a few questions → reach the result.

- [ ] **Step 4: Commit**

```bash
git add app/pages/practice/placement.vue
git commit -m "feat(placement): /practice/placement page"
```

---

## Task 10: DeckPicker highlight + ruleta wiring

**Files:**
- Modify: `app/components/games/ruleta/DeckPicker.vue`
- Modify: `app/pages/practice/ruleta.vue`
- Modify: `tests/components/practice/DeckPicker.test.ts`

- [ ] **Step 1: Add the failing badge test**

In `tests/components/practice/DeckPicker.test.ts`, add inside the `describe`:

```ts
it('marks the recommended deck with a "your level" badge', () => {
  const w = mount(DeckPicker, { props: { options: OPTIONS, recommendedId: 'topik-1' } })
  expect(w.get('[data-testid="deck-topik-1"]').text()).toContain('practice.your_level')
  expect(w.get('[data-testid="deck-all"]').text()).not.toContain('practice.your_level')
})
```

> Note: mount with no local i18n mock, exactly like the existing DeckPicker
> tests — the global vitest i18n stub key-echoes `useI18n().t`, so the badge
> renders the literal `practice.your_level` key (same mechanism as the existing
> `practice.deck_count` assertions).

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/components/practice/DeckPicker.test.ts`
Expected: FAIL — no badge rendered.

- [ ] **Step 3: Add the prop + badge to `DeckPicker.vue`**

In `app/components/games/ruleta/DeckPicker.vue`:

Change the props interface:
```ts
interface Props {
  options: DeckOption[]
  /** Deck id to highlight as the placement-recommended starting level. */
  recommendedId?: string | null
}
withDefaults(defineProps<Props>(), { recommendedId: null })
```

On the `<button class="deck">`, add the recommended modifier class:
```vue
      :class="{ 'deck--locked': opt.disabled, 'deck--recommended': !!opt.id && opt.id === recommendedId }"
```

Inside the button, after the `<span class="deck__name">…</span>` line, add:
```vue
      <span v-if="!!opt.id && opt.id === recommendedId" class="deck__badge">{{ t('practice.your_level') }}</span>
```

Add to `<style scoped>`:
```css
.deck--recommended { border-color: var(--accent); box-shadow: var(--shadow-button-hover, 7px 8px 0 rgba(60, 42, 24, 0.35)); }
.deck__badge {
  font-family: 'Inter', 'Noto Sans KR', sans-serif; font-size: 10px; letter-spacing: 0.04em;
  color: var(--text-on-accent, #fff7eb); background: var(--accent, #c97c5d); padding: 2px 8px;
}
```

- [ ] **Step 4: Pass `recommendedId` from the ruleta**

In `app/pages/practice/ruleta.vue`:

Add the settings import near the other store imports:
```ts
import { useSettingsStore } from '~/stores/settings'
```
Add in `<script setup>` (near the other store instances):
```ts
const settings = useSettingsStore()
```
Update the `<DeckPicker>` usage (the deck-pick phase) to pass the prop:
```vue
        <DeckPicker :options="deckOptions" :recommended-id="settings.startingDeckId" @select="onDeckSelect" />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test -- tests/components/practice/DeckPicker.test.ts`
Expected: PASS (badge + existing tests).

- [ ] **Step 6: Typecheck + commit**

Run: `npm run typecheck` (Expected: PASS)

```bash
git add app/components/games/ruleta/DeckPicker.vue app/pages/practice/ruleta.vue tests/components/practice/DeckPicker.test.ts
git commit -m "feat(placement): highlight the recommended deck in the ruleta picker"
```

---

## Task 11: Entry points (hub card + EmptyPlot CTA)

**Files:**
- Modify: `app/pages/practice/index.vue`
- Modify: `app/components/garden/EmptyPlot.vue`

- [ ] **Step 1: Add the hub card**

In `app/pages/practice/index.vue`, add a `GameCard` inside `.hub__grid` (after
the counters card):

```vue
      <GameCard
        to="/practice/placement"
        :name="t('games.placement.name')"
        :description="t('games.placement.desc')"
        emoji="🧭"
      />
```

- [ ] **Step 2: Add the EmptyPlot CTA**

In `app/components/garden/EmptyPlot.vue`, replace the single CTA button block
with the primary button plus a secondary placement link:

```vue
    <Button @click="$emit('start')">{{ t('onboarding.empty.cta') }}</Button>
    <NuxtLink class="plot__placement" to="/practice/placement">{{ t('onboarding.empty.placement_cta') }}</NuxtLink>
```

Add `NuxtLink` to the imports:
```ts
import { NuxtLink } from '#components'
```

Add to `<style scoped>`:
```css
.plot__placement {
  font-family: 'Inter', 'Noto Sans KR', sans-serif; font-size: 13px; color: var(--link);
  text-decoration: underline;
}
.plot__placement:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
```

- [ ] **Step 3: Typecheck + boot smoke**

Run: `npm run typecheck` (Expected: PASS)
Run: `npm run dev` — confirm the hub shows the 🧭 card and a fresh (empty-log)
account shows the "Find your level" link on the empty plot.

- [ ] **Step 4: Commit**

```bash
git add app/pages/practice/index.vue app/components/garden/EmptyPlot.vue
git commit -m "feat(placement): hub card + empty-plot entry point"
```

---

## Task 12: i18n strings (8 locales) + parity test

**Files:**
- Modify: `i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `tests/unit/i18n/placement-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

Create `tests/unit/i18n/placement-keys.test.ts`:

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

const KEYS = [
  'placement.title', 'placement.lead', 'placement.intro_detail', 'placement.start',
  'placement.pick_hint', 'placement.correct', 'placement.wrong', 'placement.reveal_correct',
  'placement.next', 'placement.progress_label', 'placement.level_tag',
  'placement.result.your_level', 'placement.result.just_starting',
  'placement.result.start_with', 'placement.result.cta', 'placement.result.retake',
  'practice.your_level', 'onboarding.empty.placement_cta',
  'games.placement.name', 'games.placement.desc',
]

describe('placement.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('interpolated keys keep their placeholders', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'placement.result.your_level') as string, code).toContain('{level}')
      expect(dig(msgs, 'placement.result.cta') as string, code).toContain('{level}')
      expect(dig(msgs, 'placement.reveal_correct') as string, code).toContain('{correct}')
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- tests/unit/i18n/placement-keys.test.ts`
Expected: FAIL — keys missing.

- [ ] **Step 3: Add the English keys**

Into `i18n/locales/en.json`, add a `placement` block, a `practice.your_level`
key, a `games.placement` block, and `onboarding.empty.placement_cta` (place each
inside the existing parent object):

```json
"placement": {
  "title": "Placement Test",
  "lead": "Answer a few quick questions and we'll start you at the right level.",
  "intro_detail": "About 4–24 multiple-choice questions. No timer.",
  "start": "Find my level",
  "pick_hint": "Pick the form that fits the blank.",
  "correct": "Correct",
  "wrong": "Not quite",
  "reveal_correct": "Answer: {correct}",
  "next": "Next",
  "progress_label": "Question",
  "level_tag": "TOPIK {level}",
  "result": {
    "your_level": "Your level: TOPIK {level}",
    "just_starting": "You're just starting out — welcome!",
    "start_with": "Start with TOPIK {level}",
    "cta": "Practice TOPIK {level}",
    "retake": "Retake test"
  }
},
"games": {
  "placement": { "name": "Placement", "desc": "Find your TOPIK level in a few questions." }
}
```

Add `"your_level": "Your level"` to the existing `practice` object, and
`"placement_cta": "Find your level"` to the existing `onboarding.empty` object.
(Merge keys into existing `games`/`practice`/`onboarding` objects rather than
duplicating them.)

- [ ] **Step 4: Add the other 7 locales**

Mirror the same keys into `es, fr, pt-BR, th, id, vi, ja`, translating values in
the tone of the existing `cloze.*`/`counters.*` strings. Keep the `{level}` and
`{correct}` placeholders verbatim. Korean register/level terms (TOPIK) stay as
is. (These are UI chrome — the wife review focuses on the seed bank, not these.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -- tests/unit/i18n/placement-keys.test.ts`
Expected: PASS (all locales × all keys + placeholder checks).

- [ ] **Step 6: Commit**

```bash
git add i18n/locales tests/unit/i18n/placement-keys.test.ts
git commit -m "feat(placement): placement.* + games.placement.* i18n across 8 locales"
```

---

## Task 13: Full-suite gate

- [ ] **Step 1: Run the whole suite + typecheck + lint**

From `munbeop/`:
```bash
npm run test
npm run typecheck
npm run lint
```
Expected: all green; no `import/first` violations (SUT imports stay above
`vi.mock`); typecheck 0 errors.

- [ ] **Step 2: Boot smoke**

Run: `npm run dev` — walk the full flow: hub 🧭 card → placement intro → run a
ladder to a result → CTA lands on the ruleta with the recommended deck badged.

- [ ] **Step 3: Final commit (if any fixups)**

```bash
git add -A
git commit -m "test(placement): full-suite gate green"
```

---

## Self-Review (run by the plan author; fixed inline)

**Spec coverage:**
- Decision 1 (set starting deck) → Tasks 5, 6 (`setStartingDeck`), 10 (highlight).
- Decision 2 (ascending ladder) → Task 1.
- Decision 3 (authored bank ~6/level) → Task 3.
- Decision 4 (lab + EmptyPlot CTA) → Tasks 9, 11.
- Decision 5 (cloze-of-usage item) → Tasks 2, 3, 7.
- Decision 6 (frontier deck) → Task 1 (`ladderOutcome`) + tests.
- Assessment-only (no SRS/log writes) → `usePlacement` touches only the settings store (Task 6).

**Type consistency:** `PlacementItem`, `LadderState`, `PlacementOutcome`,
`PlacementPhase` are defined once and reused; `Q_PER_LEVEL`/`PASS_THRESHOLD`
flow from `config.ts` through `ladder.ts`, `usePlacement`, the seed-invariants
test, and the page. `setStartingDeck(deckId: string)` signature is identical in
the store (Task 5) and the composable call (Task 6).

**No placeholders:** the seed bank (Task 3) and the 7 non-English locales
(Task 12) are content sub-tasks with exact schemas, a worked example, and a
mechanical gate test — the intended division of labor for a content-heavy
feature (mirrors Steps 6/9/13), not a vague "fill in later".
