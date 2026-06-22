# Leech detection + guided rescue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect chronically-hard "struggling plants" (leeches) from the recent review log, surface them calmly on `/stats`, offer a guided re-teach flow at `/practice/rescue`, and stop any single leech from dominating a practice session.

**Architecture:** A pure `detectLeeches()` over a recent per-`ko` window (no migration, self-healing) feeds a thin `useLeeches()` composable. That composable drives three surfaces: a passive "plants that need care" section on `/stats`, a gentle in-ruleta rescue offer, and a `capPredicate` passed into `createSession` so at most one leech lands among a session's three picks. The guided rescue page reuses the existing study-sheet section components (`ExamplesSection`, `ConfusedWithSection`) and ends by handing off to the proven `/practice/ruleta?focus=<ko>` production loop.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia setup stores, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). Package manager: **pnpm**.

**Spec:** `docs/superpowers/specs/2026-06-22-leech-rescue-design.md`

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`.
- `useI18n().t` is a key-echo stub in tests (`t('a.b', {n:1})` → `'a.b 1'`); reactivity primitives + `useLocalized` are test globals (`tests/setup.ts`).
- `~` → `app/`. Barrels: `app/lib/srs/index.ts`, `app/lib/practice/index.ts`.
- i18n parity is enforced per-feature (e.g. `tests/unit/i18n/stats-keys.test.ts`) by importing all 8 locale JSONs and asserting each key is a non-empty string.
- Single-file test run: `pnpm exec vitest run <path>`. Full suite: `pnpm test`. Lint: `pnpm lint`. Types: `pnpm typecheck`.

**Key design facts the implementer must respect:**
- `SrsState` counts are cumulative + never decay; mastery is one-way. **Detection must read the recent log window, not `SrsState`.**
- `getWeight` already gives leeches a *positive* `hardBonus` (they're drawn more, not less). The cap is a *new* counter-force; do not touch `getWeight`.
- `ConfusedWithSection`/`ExamplesSection` take `:grammar="Grammar"` (the whole object) and self-fetch; `ConfusedWithSection` already renders nothing when `pairsFor(ko)` is empty.
- Discrimination content is N1-only today; the rescue flow must degrade when a `ko` has no confusable pair (handled by the stage list omitting `discriminate`).

---

## Task 1: Pure leech detection — `detectLeeches`

**Files:**
- Create: `munbeop/app/lib/srs/leech.ts`
- Modify: `munbeop/app/lib/srs/index.ts`
- Test: `munbeop/tests/unit/srs/leech.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/srs/leech.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  detectLeeches,
  LEECH_WINDOW,
  LEECH_MIN_REVIEWS,
  LEECH_HARD_RATIO,
} from '~/lib/srs/leech'
import type { Grammar, LogEntry, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Ascending timestamps so "most recent N" is unambiguous; later index = newer.
let clock = 0
const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(),
  ko: 'X',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  errorDimension: null,
  reviewState: 'unreviewed',
  contextId: 'c',
  contextName: 'c',
  date: new Date(Date.UTC(2026, 0, 1) + clock++ * 60_000).toISOString(),
  ...over,
})

const grammars: Grammar[] = [{ ko: 'X', meaning: L('x-mean'), deckId: 'topik-2' }]

describe('detectLeeches', () => {
  it('constants are the forgiving defaults', () => {
    expect(LEECH_WINDOW).toBe(8)
    expect(LEECH_MIN_REVIEWS).toBe(4)
    expect(LEECH_HARD_RATIO).toBe(0.5)
  })

  it('flags a ko whose recent window is >= 50% hard, with its meaning', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'easy' })]
    const out = detectLeeches(log, grammars)
    expect(out).toHaveLength(1)
    expect(out[0]!.ko).toBe('X')
    expect(out[0]!.recentReviews).toBe(4)
    expect(out[0]!.recentHardRatio).toBeCloseTo(0.75)
    expect(out[0]!.meaning).toEqual(L('x-mean'))
  })

  it('ignores a ko with fewer than LEECH_MIN_REVIEWS reviews in the window', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'hard' }), e({ feedback: 'hard' })]
    expect(detectLeeches(log, grammars)).toEqual([])
  })

  it('does NOT flag when recent hard ratio is below threshold', () => {
    const log = [e({ feedback: 'hard' }), e({ feedback: 'easy' }), e({ feedback: 'easy' }), e({ feedback: 'easy' })]
    expect(detectLeeches(log, grammars)).toEqual([])
  })

  it('uses only the most recent LEECH_WINDOW entries (self-heals after recovery)', () => {
    // 6 old hard, then 8 recent easy → window is all-easy → not a leech.
    const old = Array.from({ length: 6 }, () => e({ feedback: 'hard' }))
    const recent = Array.from({ length: 8 }, () => e({ feedback: 'easy' }))
    expect(detectLeeches([...old, ...recent], grammars)).toEqual([])
  })

  it("excludes entries flagged 'incorrect' from the window (mirrors recalculateMastery)", () => {
    // 4 incorrect-flagged hards are excluded; only 4 unreviewed easies remain → not a leech.
    const flagged = Array.from({ length: 4 }, () => e({ feedback: 'hard', reviewState: 'incorrect' }))
    const clean = Array.from({ length: 4 }, () => e({ feedback: 'easy' }))
    expect(detectLeeches([...flagged, ...clean], grammars)).toEqual([])
  })

  it('reports the modal errorDimension among recent hard entries', () => {
    const log = [
      e({ feedback: 'hard', errorDimension: 'particle' }),
      e({ feedback: 'hard', errorDimension: 'particle' }),
      e({ feedback: 'hard', errorDimension: 'ending' }),
      e({ feedback: 'easy' }),
    ]
    expect(detectLeeches(log, grammars)[0]!.dominantDimension).toBe('particle')
  })

  it('dominantDimension is null when no recent hard entry carries a tag', () => {
    const log = Array.from({ length: 4 }, () => e({ feedback: 'hard', errorDimension: null }))
    expect(detectLeeches(log, grammars)[0]!.dominantDimension).toBeNull()
  })

  it('sorts by hard ratio desc, then recentReviews desc, then ko', () => {
    const mk = (ko: string, hard: number, total: number) =>
      Array.from({ length: total }, (_, i) => e({ ko, feedback: i < hard ? 'hard' : 'easy' }))
    const log = [...mk('A', 2, 4), ...mk('B', 4, 4), ...mk('C', 3, 6)]
    const gs: Grammar[] = ['A', 'B', 'C'].map((ko) => ({ ko, meaning: L(ko), deckId: 'topik-1' }))
    const out = detectLeeches(log, gs)
    // B = 1.0 ratio → first. A and C tie at 0.5; tiebreak is recentReviews desc,
    // so C (6 reviews) precedes A (4 reviews).
    expect(out.map((l) => l.ko)).toEqual(['B', 'C', 'A'])
  })

  it('returns undefined meaning for a ko not in the catalog (custom grammar), without throwing', () => {
    const log = Array.from({ length: 4 }, () => e({ ko: '내문법', feedback: 'hard' }))
    const out = detectLeeches(log, [])
    expect(out[0]!.ko).toBe('내문법')
    expect(out[0]!.meaning).toBeUndefined()
  })

  it('empty log → empty list', () => {
    expect(detectLeeches([], grammars)).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/srs/leech.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/srs/leech"` / `detectLeeches is not a function`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/lib/srs/leech.ts`:

```ts
import type { ErrorDimension, Grammar, LocalizedString, LogEntry } from '~/lib/domain'
import { ERROR_DIMENSIONS } from '~/lib/domain'

/** How many of a grammar's most-recent reviews define its "recent window". */
export const LEECH_WINDOW = 8
/** Minimum reviews in the window before we'll judge a grammar at all (anti-noise). */
export const LEECH_MIN_REVIEWS = 4
/** A grammar is a leech when at least this share of its recent window felt hard. */
export const LEECH_HARD_RATIO = 0.5

export interface Leech {
  ko: string
  /** Catalog meaning for display; undefined for custom/unknown grammar. */
  meaning: LocalizedString | undefined
  /** hard / (easy + hard) within the recent window, 0..1. */
  recentHardRatio: number
  /** Window size actually used (>= LEECH_MIN_REVIEWS). */
  recentReviews: number
  /** Modal errorDimension among the window's hard entries; null if none tagged. */
  dominantDimension: ErrorDimension | null
}

/**
 * Struggling-plant detection. A leech is a grammar whose *recent* reviews are
 * mostly hard — derived purely from the log so it self-heals once the user logs
 * easier reviews (the recent window slides past the old hard ones). Entries
 * flagged 'incorrect' in review are excluded, mirroring recalculateMastery.
 *
 * No clock needed: the window is the most-recent N entries by date, not a
 * time span — an abandoned hard item stays flagged (it IS still unmastered) but
 * the set is bounded and clears the moment the user practices it well again.
 */
export function detectLeeches(
  log: readonly LogEntry[],
  grammars: readonly Grammar[],
): Leech[] {
  const byKo = new Map<string, LogEntry[]>()
  for (const entry of log) {
    if (entry.reviewState === 'incorrect') continue
    const list = byKo.get(entry.ko)
    if (list) list.push(entry)
    else byKo.set(entry.ko, [entry])
  }

  const meaningOf = new Map(grammars.map((g) => [g.ko, g.meaning]))
  const leeches: Leech[] = []

  for (const [ko, entries] of byKo) {
    const windowEntries = entries
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-LEECH_WINDOW)
    if (windowEntries.length < LEECH_MIN_REVIEWS) continue

    let hard = 0
    const dimCounts = new Map<ErrorDimension, number>()
    for (const entry of windowEntries) {
      if (entry.feedback !== 'hard') continue
      hard++
      if (entry.errorDimension) {
        dimCounts.set(entry.errorDimension, (dimCounts.get(entry.errorDimension) ?? 0) + 1)
      }
    }

    const recentHardRatio = hard / windowEntries.length
    if (recentHardRatio < LEECH_HARD_RATIO) continue

    let dominantDimension: ErrorDimension | null = null
    let best = 0
    for (const dim of ERROR_DIMENSIONS) {
      const count = dimCounts.get(dim) ?? 0
      if (count > best) {
        best = count
        dominantDimension = dim
      }
    }

    leeches.push({
      ko,
      meaning: meaningOf.get(ko),
      recentHardRatio,
      recentReviews: windowEntries.length,
      dominantDimension,
    })
  }

  leeches.sort(
    (a, b) =>
      b.recentHardRatio - a.recentHardRatio ||
      b.recentReviews - a.recentReviews ||
      a.ko.localeCompare(b.ko),
  )
  return leeches
}
```

- [ ] **Step 4: Export from the srs barrel**

Modify `munbeop/app/lib/srs/index.ts` to add the leech export:

```ts
export * from './thresholds'
export * from './weight'
export * from './pick'
export * from './mastery'
export * from './leech'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/srs/leech.test.ts`
Expected: PASS (all cases). If the sort case fails, confirm you set the expectation to `['B', 'C', 'A']`.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/srs/leech.ts munbeop/app/lib/srs/index.ts munbeop/tests/unit/srs/leech.test.ts
git commit -m "feat(leech): recency-window leech detection (pure)"
```

---

## Task 2: Session cap — at most one leech per draw

**Files:**
- Modify: `munbeop/app/lib/practice/session.ts`
- Test: `munbeop/tests/unit/practice/leech-cap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/practice/leech-cap.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { capLeechPicks, createSession } from '~/lib/practice/session'
import type { Context } from '~/lib/domain'

// Deterministic rng that walks a fixed sequence (clamped to [0,1)).
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]!
}

const uniform = () => 1

describe('capLeechPicks', () => {
  it('keeps at most maxLeeches leeches, refilling from the non-leech pool', () => {
    const picked = [1, 2, 3] // all leeches
    const pool = [1, 2, 3, 4, 5, 6] // 4,5,6 are non-leeches
    const isLeech = (g: number) => g <= 3
    const out = capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))
    expect(out).toHaveLength(3)
    expect(out.filter(isLeech)).toHaveLength(1)
  })

  it('leaves a draw with <= maxLeeches untouched', () => {
    const picked = [1, 4, 5]
    const pool = [1, 2, 3, 4, 5, 6]
    const isLeech = (g: number) => g <= 3
    expect(capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))).toEqual([1, 4, 5])
  })

  it('relaxes the cap (never returns < picked.length) when the non-leech pool is exhausted', () => {
    const picked = [1, 2, 3] // all leeches
    const pool = [1, 2, 3] // no non-leeches to refill from
    const isLeech = () => true
    const out = capLeechPicks(picked, pool, uniform, isLeech, 1, seq([0]))
    expect(out).toHaveLength(3)
    expect(new Set(out).size).toBe(3) // still three distinct picks
  })
})

describe('createSession with capPredicate', () => {
  const contexts: Context[] = [
    { id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' },
  ]

  it('never seats more than one leech among the three picks', () => {
    // Pool of 6 grammar indices; 0,1,2 are leeches. Uniform weights + an rng
    // that would otherwise front-load the leeches.
    const session = createSession<number, Context>({
      grammarPool: [0, 1, 2, 3, 4, 5],
      contextPool: contexts,
      weightOf: uniform,
      rng: seq([0]),
      capPredicate: (g) => g <= 2,
    })
    const leechPicks = session.picks.filter((p) => p.grammarIdx <= 2)
    expect(session.picks).toHaveLength(3)
    expect(leechPicks.length).toBeLessThanOrEqual(1)
  })

  it('without a capPredicate, behaviour is unchanged (still three picks)', () => {
    const session = createSession<number, Context>({
      grammarPool: [0, 1, 2, 3, 4, 5],
      contextPool: contexts,
      weightOf: uniform,
      rng: seq([0]),
    })
    expect(session.picks).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/practice/leech-cap.test.ts`
Expected: FAIL — `capLeechPicks is not exported` / `capPredicate` ignored.

- [ ] **Step 3: Write the implementation**

Modify `munbeop/app/lib/practice/session.ts`. First extend the params interface and the `createSession` body:

Replace the existing `CreateSessionParams` interface and `createSession` function (lines 13–39) with:

```ts
export interface CreateSessionParams<G, C> {
  grammarPool: readonly G[]
  contextPool: readonly C[]
  weightOf: (g: G) => number
  rng?: () => number
  /**
   * When set, no more than `maxCapped` picks (default 1) may satisfy this
   * predicate. Used to stop a single leech from dominating a draw — the SRS
   * weight formula deliberately over-draws leeches, so this is the counter-force.
   */
  capPredicate?: (g: G) => boolean
  maxCapped?: number
}

const PICK_COUNT = 3
const CONTEXTS_PER_PICK = 3

export function createSession<G, C>(p: CreateSessionParams<G, C>): Session<G, C> {
  const { grammarPool, contextPool, weightOf, rng = Math.random, capPredicate, maxCapped = 1 } = p
  if (grammarPool.length < PICK_COUNT) {
    throw new Error(`Need at least 3 grammar items, got ${grammarPool.length}`)
  }
  if (contextPool.length < CONTEXTS_PER_PICK) {
    throw new Error(`Need at least 3 context items, got ${contextPool.length}`)
  }
  let picked = weightedPick(grammarPool, PICK_COUNT, weightOf, rng)
  if (capPredicate) {
    picked = capLeechPicks(picked, grammarPool, weightOf, capPredicate, maxCapped, rng)
  }
  return {
    picks: picked.map((grammarIdx) => ({
      grammarIdx,
      contexts: pickRandomFrom(contextPool, CONTEXTS_PER_PICK, rng),
      progress: 0,
    })),
  }
}

/**
 * Enforce a cap on how many drawn picks satisfy `isLeech`. Keeps the first
 * `maxLeeches` capped picks (in draw order) plus all non-capped picks, then
 * refills the freed slots from the non-leech remainder of the pool (still
 * weighted). If the non-leech pool can't fill the gap, the cap is relaxed
 * rather than ever returning fewer than `picked.length` picks.
 */
export function capLeechPicks<G>(
  picked: readonly G[],
  pool: readonly G[],
  weightOf: (g: G) => number,
  isLeech: (g: G) => boolean,
  maxLeeches: number,
  rng: () => number,
): G[] {
  if (picked.filter(isLeech).length <= maxLeeches) return [...picked]

  const keep: G[] = []
  let keptLeeches = 0
  for (const g of picked) {
    if (isLeech(g)) {
      if (keptLeeches < maxLeeches) {
        keep.push(g)
        keptLeeches++
      }
    } else {
      keep.push(g)
    }
  }

  const need = picked.length - keep.length
  if (need <= 0) return keep

  const keepSet = new Set(keep)
  const refillPool = pool.filter((g) => !isLeech(g) && !keepSet.has(g))
  const result = [...keep, ...weightedPick(refillPool, need, weightOf, rng)]

  // Non-leech pool exhausted — relax rather than under-fill the session.
  if (result.length < picked.length) {
    const have = new Set(result)
    for (const g of picked) {
      if (result.length >= picked.length) break
      if (!have.has(g)) {
        result.push(g)
        have.add(g)
      }
    }
  }
  return result
}
```

(The top-of-file import `import { pickRandomFrom, weightedPick } from '~/lib/srs'` already provides `weightedPick`; leave it unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/practice/leech-cap.test.ts`
Expected: PASS.

- [ ] **Step 5: Run any existing session tests to confirm no regression**

Run: `pnpm exec vitest run tests/unit/practice`
Expected: PASS (existing session behaviour unchanged when `capPredicate` is omitted).

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/practice/session.ts munbeop/tests/unit/practice/leech-cap.test.ts
git commit -m "feat(leech): createSession leech cap (max one per draw)"
```

---

## Task 3: `useLeeches` composable

**Files:**
- Create: `munbeop/app/composables/useLeeches.ts`
- Test: `munbeop/tests/unit/composables/useLeeches.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/composables/useLeeches.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import type { Grammar, LogEntry, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Shared reactive state the mocked stores read from.
const state = reactive({ entries: [] as LogEntry[], items: [] as Grammar[] })
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ get entries() { return state.entries } }) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ get items() { return state.items } }) }))

import { useLeeches } from '~/composables/useLeeches'

let clock = 0
const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(),
  ko: '걸리다',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  errorDimension: null,
  reviewState: 'unreviewed',
  contextId: 'c',
  contextName: 'c',
  date: new Date(Date.UTC(2026, 0, 1) + clock++ * 60_000).toISOString(),
  ...over,
})

beforeEach(() => {
  state.entries = []
  state.items = [{ ko: '걸리다', meaning: L('to take (time)'), deckId: 'topik-2' }]
  clock = 0
})

describe('useLeeches', () => {
  it('exposes leeches and a leechKos set for a recent-hard grammar', () => {
    state.entries = Array.from({ length: 5 }, () => e({ feedback: 'hard' }))
    const { leeches, leechKos } = useLeeches()
    expect(leeches.value[0]?.ko).toBe('걸리다')
    expect(leechKos.value.has('걸리다')).toBe(true)
  })

  it('is empty when there are no struggling grammars', () => {
    state.entries = Array.from({ length: 5 }, () => e({ feedback: 'easy' }))
    const { leeches, leechKos } = useLeeches()
    expect(leeches.value).toEqual([])
    expect(leechKos.value.size).toBe(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/composables/useLeeches.test.ts`
Expected: FAIL — `Failed to resolve import "~/composables/useLeeches"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/composables/useLeeches.ts`:

```ts
import { computed } from 'vue'
import { detectLeeches, type Leech } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'

/**
 * Reactive struggling-plant ("leech") signal, derived on the fly from the log
 * and catalog — no persisted state, no migration. `leeches` is the ordered list
 * for display; `leechKos` is the fast membership set for the session cap and the
 * in-ruleta rescue offer.
 */
export function useLeeches() {
  const logStore = useLogStore()
  const grammarStore = useGrammarStore()

  const leeches = computed<Leech[]>(() => detectLeeches(logStore.entries, grammarStore.items))
  const leechKos = computed(() => new Set(leeches.value.map((l) => l.ko)))

  return { leeches, leechKos }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/composables/useLeeches.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useLeeches.ts munbeop/tests/unit/composables/useLeeches.test.ts
git commit -m "feat(leech): useLeeches composable (leeches + leechKos)"
```

---

## Task 4: Wire the cap into `usePractice` (deck-draw path only)

**Files:**
- Modify: `munbeop/app/composables/usePractice.ts`

No new test: `usePractice` depends on `useRoute`/`useI18n` and is not unit-tested in this repo (the pure cap is already covered by Task 2). This step is a careful, minimal wiring verified by `pnpm typecheck`.

- [ ] **Step 1: Add the `useLeeches` import and call**

In `munbeop/app/composables/usePractice.ts`, add the import near the other composable imports (after the store imports, around line 14):

```ts
import { useLeeches } from '~/composables/useLeeches'
```

Inside `usePractice()`, after `const logStore = useLogStore()` (around line 22), add:

```ts
  const { leechKos } = useLeeches()
```

- [ ] **Step 2: Pass `capPredicate` to the deck-draw `createSession` only**

In the **deck draw** branch (the final `createSession` call, around lines 98–102 — the one after `filterPoolByDeck`), add `capPredicate`. Replace that `createSession` call with:

```ts
      session.value = createSession<number, Context>({
        grammarPool: pool,
        contextPool: activeContexts,
        weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
        capPredicate: (idx) => leechKos.value.has(grammarStore.items[idx]!.ko),
      })
```

Do **not** add `capPredicate` to the focused-round (`?focus=`) branch or the custom-deck branch — a focused round is a single grammar by design, and a custom deck is explicit user curation. Both should stay uncapped.

- [ ] **Step 3: Verify types**

Run: `pnpm typecheck`
Expected: PASS (no type errors). If `leechKos` is reported unused, confirm Step 2 was applied to the correct (deck-draw) `createSession`.

- [ ] **Step 4: Run the full unit/practice + composables suites for safety**

Run: `pnpm exec vitest run tests/unit/practice tests/unit/composables`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/usePractice.ts
git commit -m "feat(leech): cap leeches in the ruleta deck draw"
```

---

## Task 5: `RescueOfferBanner` + the gentle in-ruleta offer

**Files:**
- Create: `munbeop/app/components/practice/RescueOfferBanner.vue`
- Modify: `munbeop/app/pages/practice/ruleta.vue`
- Test: `munbeop/tests/components/practice/RescueOfferBanner.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/practice/RescueOfferBanner.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RescueOfferBanner from '~/components/practice/RescueOfferBanner.vue'

describe('RescueOfferBanner', () => {
  it('links to the rescue route for the given ko', () => {
    const w = mount(RescueOfferBanner, { props: { ko: '-는데' } })
    const link = w.find('a')
    expect(link.attributes('href')).toBe('/practice/rescue?ko=' + encodeURIComponent('-는데'))
  })

  it('emits dismiss when the dismiss control is clicked', async () => {
    const w = mount(RescueOfferBanner, { props: { ko: 'A' } })
    await w.find('[data-testid="rescue-offer-dismiss"]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/practice/RescueOfferBanner.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/practice/RescueOfferBanner.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

interface Props {
  ko: string
}
const props = defineProps<Props>()
defineEmits<{ dismiss: [] }>()
const { t } = useI18n()

const to = computed(() => `/practice/rescue?ko=${encodeURIComponent(props.ko)}`)
</script>

<template>
  <div class="rescue-offer" data-testid="rescue-offer" role="note">
    <NuxtLink class="rescue-offer__cta" :to="to">{{ t('practice.rescue_offer') }}</NuxtLink>
    <button
      type="button"
      class="rescue-offer__dismiss"
      data-testid="rescue-offer-dismiss"
      @click="$emit('dismiss')"
    >
      {{ t('practice.rescue_offer_dismiss') }}
    </button>
  </div>
</template>

<style scoped>
.rescue-offer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
}
.rescue-offer__cta {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}
.rescue-offer__cta:hover {
  text-decoration: underline;
}
.rescue-offer__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.rescue-offer__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
}
.rescue-offer__dismiss:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/practice/RescueOfferBanner.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire it into the ruleta play phase**

In `munbeop/app/pages/practice/ruleta.vue`:

(a) Add imports (after the `GrammarCard` import, around line 4):

```ts
import RescueOfferBanner from '~/components/practice/RescueOfferBanner.vue'
import { useLeeches } from '~/composables/useLeeches'
```

(b) In the `<script setup>` body, after `const customDecks = useCustomDecksStore()` (around line 42), add:

```ts
const { leechKos } = useLeeches()
const dismissedRescue = ref<Set<string>>(new Set())

function showRescueOffer(pickIdx: number): boolean {
  const g = grammarOf(pickIdx)
  return !!g && leechKos.value.has(g.ko) && !dismissedRescue.value.has(g.ko)
}
function dismissRescue(pickIdx: number) {
  const g = grammarOf(pickIdx)
  if (g) dismissedRescue.value = new Set(dismissedRescue.value).add(g.ko)
}
```

(c) In the play-phase template, inside the `card-slot` loop, render the banner above the `GrammarCard` (replace the existing `card-slot` block, around lines 252–261):

```vue
      <div v-for="(pick, i) in session?.picks" :key="i" class="card-slot">
        <RescueOfferBanner
          v-if="grammarOf(i) && currentContextOf(i) && pick.progress < 3 && showRescueOffer(i)"
          :ko="grammarOf(i)!.ko"
          @dismiss="dismissRescue(i)"
        />
        <GrammarCard
          v-if="grammarOf(i) && currentContextOf(i) && pick.progress < 3"
          :grammar="grammarOf(i)!"
          :context="currentContextOf(i)!"
          :progress="pick.progress"
          :pick-index="i"
          @submit="onSubmit"
        />
      </div>
```

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/practice/RescueOfferBanner.vue munbeop/app/pages/practice/ruleta.vue munbeop/tests/components/practice/RescueOfferBanner.test.ts
git commit -m "feat(leech): gentle in-ruleta rescue offer for leech picks"
```

---

## Task 6: `useRescueDrill` — the guided-rescue stage machine

**Files:**
- Create: `munbeop/app/composables/useRescueDrill.ts`
- Test: `munbeop/tests/unit/rescue/useRescueDrill.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/rescue/useRescueDrill.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { ConfusablePair, Grammar, GrammarExample, Leech, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Mockable seams.
const pairsFor = vi.fn<(ko: string) => unknown[]>(() => [])
const examplesFor = vi.fn<(ko: string) => GrammarExample[]>(() => [])
const grammarByKo = vi.fn<(ko: string) => Grammar | undefined>(() => undefined)
const leeches = ref<Leech[]>([])

vi.mock('~/lib/grammar-pairs', () => ({ pairsFor: (ko: string) => pairsFor(ko) }))
vi.mock('~/lib/grammar-examples', () => ({ examplesFor: (ko: string) => examplesFor(ko) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ grammarByKo }) }))
vi.mock('~/composables/useLeeches', () => ({ useLeeches: () => ({ leeches }) }))

import { useRescueDrill } from '~/composables/useRescueDrill'

const grammar: Grammar = { ko: '-는데', meaning: L('contrast/background'), deckId: 'topik-2' }
const pair = { id: 'p', a: '-는데', b: '-지만', note: L('n'), items: [] } as ConfusablePair

beforeEach(() => {
  pairsFor.mockReturnValue([])
  examplesFor.mockReturnValue([])
  grammarByKo.mockReturnValue(grammar)
  leeches.value = []
})

describe('useRescueDrill', () => {
  it('omits the discriminate stage when the grammar has no confusable pair', () => {
    const d = useRescueDrill('-는데')
    expect(d.stages.value).toEqual(['reread', 'examples', 'produce'])
  })

  it('includes the discriminate stage when a confusable pair exists', () => {
    pairsFor.mockReturnValue([{ pair, selfSide: 'a', otherKo: '-지만' }])
    const d = useRescueDrill('-는데')
    expect(d.stages.value).toEqual(['reread', 'examples', 'discriminate', 'produce'])
  })

  it('produce is always the last stage', () => {
    pairsFor.mockReturnValue([{ pair, selfSide: 'a', otherKo: '-지만' }])
    const d = useRescueDrill('-는데')
    expect(d.stages.value[d.stages.value.length - 1]).toBe('produce')
  })

  it('surfaces the dominant errorDimension from the matching leech', () => {
    leeches.value = [
      { ko: '-는데', meaning: L('m'), recentHardRatio: 0.6, recentReviews: 5, dominantDimension: 'particle' },
    ]
    const d = useRescueDrill('-는데')
    expect(d.dominantDimension.value).toBe('particle')
  })

  it('dominantDimension is null when the ko is not a current leech', () => {
    const d = useRescueDrill('-는데')
    expect(d.dominantDimension.value).toBeNull()
  })

  it('next/back walk the stages and clamp at the ends', () => {
    const d = useRescueDrill('-는데') // reread, examples, produce
    expect(d.stage.value).toBe('reread')
    expect(d.canBack.value).toBe(false)
    d.next(); expect(d.stage.value).toBe('examples')
    d.next(); expect(d.stage.value).toBe('produce')
    expect(d.isLast.value).toBe(true)
    d.next(); expect(d.stage.value).toBe('produce') // clamped
    d.back(); expect(d.stage.value).toBe('examples')
    d.back(); d.back(); expect(d.stage.value).toBe('reread') // clamped
  })

  it('exposes the grammar object and null for an unknown ko', () => {
    grammarByKo.mockReturnValue(undefined)
    const d = useRescueDrill('없음')
    expect(d.grammar.value).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/rescue/useRescueDrill.test.ts`
Expected: FAIL — `Failed to resolve import "~/composables/useRescueDrill"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/composables/useRescueDrill.ts`:

```ts
import { computed, ref } from 'vue'
import type { ErrorDimension, Grammar } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'
import { pairsFor } from '~/lib/grammar-pairs'
import { useGrammarStore } from '~/stores/grammar'
import { useLeeches } from '~/composables/useLeeches'

export type RescueStage = 'reread' | 'examples' | 'discriminate' | 'produce'

/**
 * Stage machine for the guided rescue at /practice/rescue?ko=<ko>. Walks
 * re-read → examples → (discriminate, only if a confusable pair exists) →
 * produce. The discriminate stage is omitted when `pairsFor(ko)` is empty so the
 * flow never shows an empty step (discrimination content is N1-only today). The
 * dominant errorDimension is read from the current leech signal to frame the
 * header and emphasise the most relevant stage.
 */
export function useRescueDrill(ko: string) {
  const grammarStore = useGrammarStore()
  const { leeches } = useLeeches()

  const grammar = computed<Grammar | null>(() => grammarStore.grammarByKo(ko) ?? null)
  const examples = computed(() => examplesFor(ko))
  const pairs = computed(() => pairsFor(ko))

  const dominantDimension = computed<ErrorDimension | null>(
    () => leeches.value.find((l) => l.ko === ko)?.dominantDimension ?? null,
  )

  const stages = computed<RescueStage[]>(() => [
    'reread',
    'examples',
    ...(pairs.value.length ? (['discriminate'] as const) : []),
    'produce',
  ])

  const stepIndex = ref(0)
  const stage = computed<RescueStage>(() => stages.value[stepIndex.value] ?? 'reread')
  const isLast = computed(() => stepIndex.value >= stages.value.length - 1)
  const canBack = computed(() => stepIndex.value > 0)

  function next() {
    if (stepIndex.value < stages.value.length - 1) stepIndex.value++
  }
  function back() {
    if (stepIndex.value > 0) stepIndex.value--
  }

  return { grammar, examples, pairs, dominantDimension, stages, stage, stepIndex, isLast, canBack, next, back }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/rescue/useRescueDrill.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/composables/useRescueDrill.ts munbeop/tests/unit/rescue/useRescueDrill.test.ts
git commit -m "feat(leech): useRescueDrill stage machine (dimension-aware, pair-gated)"
```

---

## Task 7: `RescuePanel` + the `/practice/rescue` page

**Files:**
- Create: `munbeop/app/components/practice/RescuePanel.vue`
- Create: `munbeop/app/pages/practice/rescue.vue`
- Test: `munbeop/tests/components/practice/RescuePanel.test.ts`

`RescuePanel` is the testable presentation (props in, events out); `rescue.vue` is the thin page (route + hydration + `useRescueDrill`) and is verified by typecheck + preview, matching how `ruleta.vue`/`cloze.vue` are not unit-tested.

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/practice/RescuePanel.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RescuePanel from '~/components/practice/RescuePanel.vue'
import type { Grammar, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})
const grammar: Grammar = { ko: '-는데', meaning: L('contrast/background'), usageNotes: L('use it for setup'), deckId: 'topik-2' }

const stubs = {
  ExamplesSection: { template: '<div data-testid="examples-stub" />' },
  ConfusedWithSection: { template: '<div data-testid="confused-stub" />' },
}
const mountStage = (stage: string, extra: Record<string, unknown> = {}) =>
  mount(RescuePanel, {
    props: { grammar, stage, dominantDimension: null, isLast: false, canBack: false, ...extra },
    global: { stubs },
  })

describe('RescuePanel', () => {
  it('reread stage shows the meaning and usage notes, not the sub-sections', () => {
    const w = mountStage('reread')
    expect(w.text()).toContain('contrast/background')
    expect(w.text()).toContain('use it for setup')
    expect(w.find('[data-testid="examples-stub"]').exists()).toBe(false)
    expect(w.find('[data-testid="confused-stub"]').exists()).toBe(false)
  })

  it('examples stage renders ExamplesSection', () => {
    const w = mountStage('examples')
    expect(w.find('[data-testid="examples-stub"]').exists()).toBe(true)
  })

  it('discriminate stage renders ConfusedWithSection', () => {
    const w = mountStage('discriminate')
    expect(w.find('[data-testid="confused-stub"]').exists()).toBe(true)
  })

  it('produce stage emits produce when the CTA is clicked', async () => {
    const w = mountStage('produce', { isLast: true })
    await w.find('[data-testid="rescue-produce"]').trigger('click')
    expect(w.emitted('produce')).toHaveLength(1)
  })

  it('emits next on the Next control when not on the produce stage', async () => {
    const w = mountStage('examples')
    await w.find('[data-testid="rescue-next"]').trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
  })

  it('shows the dominant-dimension header when one is set', () => {
    const w = mountStage('reread', { dominantDimension: 'particle' })
    // i18n stub echoes keys; header key + interpolated dimension label.
    expect(w.text()).toContain('rescue.header')
    expect(w.text()).toContain('dimension.particle')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/practice/RescuePanel.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write `RescuePanel.vue`**

Create `munbeop/app/components/practice/RescuePanel.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { ErrorDimension, Grammar } from '~/lib/domain'
import ExamplesSection from '~/components/library/GrammarStudySheet/ExamplesSection.vue'
import ConfusedWithSection from '~/components/library/GrammarStudySheet/ConfusedWithSection.vue'
import type { RescueStage } from '~/composables/useRescueDrill'

interface Props {
  grammar: Grammar
  stage: RescueStage
  dominantDimension: ErrorDimension | null
  isLast: boolean
  canBack: boolean
}
const props = defineProps<Props>()
defineEmits<{ next: []; back: []; produce: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const header = computed(() =>
  props.dominantDimension
    ? t('rescue.header', { dimension: t(`dimension.${props.dominantDimension}`) })
    : t('rescue.header_plain'),
)
</script>

<template>
  <section class="rescue" data-testid="rescue-panel">
    <header class="rescue__head">
      <h2 class="rescue__title">{{ t('rescue.title') }}</h2>
      <p class="rescue__sub">{{ header }}</p>
      <p class="rescue__stage" lang="ko">{{ t(`rescue.stage_${stage}`) }}</p>
    </header>

    <div v-if="stage === 'reread'" class="rescue__reread">
      <p class="rescue__ko" lang="ko">{{ grammar.ko }}</p>
      <p class="rescue__meaning">{{ tl(grammar.meaning) }}</p>
      <p v-if="grammar.usageNotes" class="rescue__notes">{{ tl(grammar.usageNotes) }}</p>
    </div>

    <ExamplesSection v-else-if="stage === 'examples'" :grammar="grammar" />

    <ConfusedWithSection v-else-if="stage === 'discriminate'" :grammar="grammar" />

    <div v-else class="rescue__produce">
      <p class="rescue__produce-body">{{ t('rescue.produce_body') }}</p>
      <button type="button" class="rescue__cta" data-testid="rescue-produce" @click="$emit('produce')">
        {{ t('rescue.produce_cta') }}
      </button>
    </div>

    <nav class="rescue__nav">
      <button
        v-if="canBack"
        type="button"
        class="rescue__nav-btn"
        data-testid="rescue-back"
        @click="$emit('back')"
      >
        {{ t('rescue.back') }}
      </button>
      <button
        v-if="stage !== 'produce'"
        type="button"
        class="rescue__nav-btn rescue__nav-btn--primary"
        data-testid="rescue-next"
        @click="$emit('next')"
      >
        {{ t('rescue.next') }}
      </button>
    </nav>
  </section>
</template>

<style scoped>
.rescue {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 18px;
}
.rescue__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rescue__title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.rescue__sub {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
.rescue__stage {
  margin: 4px 0 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--jade, #3f9d6b);
}
.rescue__reread {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rescue__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.rescue__meaning {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}
.rescue__notes {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  white-space: pre-line;
}
.rescue__produce {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rescue__produce-body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
}
.rescue__cta {
  align-self: flex-start;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 2px solid var(--ink-line);
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.rescue__nav {
  display: flex;
  gap: 10px;
}
.rescue__nav-btn {
  padding: 7px 16px;
  background: var(--paper);
  border: 1.5px solid var(--border);
  border-radius: 999px;
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.rescue__nav-btn--primary {
  border-color: var(--jade, #3f9d6b);
}
.rescue__cta:focus-visible,
.rescue__nav-btn:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/practice/RescuePanel.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the thin page `rescue.vue`**

Create `munbeop/app/pages/practice/rescue.vue`:

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import RescuePanel from '~/components/practice/RescuePanel.vue'
import { useRescueDrill } from '~/composables/useRescueDrill'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const grammarStore = useGrammarStore()
const logStore = useLogStore()

const ko = computed(() => (typeof route.query.ko === 'string' ? route.query.ko : ''))
const drill = useRescueDrill(ko.value)

function goProduce() {
  void router.push(`/practice/ruleta?focus=${encodeURIComponent(ko.value)}`)
}

onMounted(async () => {
  // Hard refresh / deep link mounts before layout hydration — hydrate the
  // stores the drill reads from (grammar for the sheet, log for the leech
  // signal). Idempotent and tolerant of a Supabase error.
  try {
    if (grammarStore.items.length === 0) await grammarStore.hydrate()
    if (logStore.entries.length === 0) await logStore.hydrate()
  } catch (err) {
    console.error('rescue: hydration failed', err)
  }
})
</script>

<template>
  <div class="page">
    <GameExitButton />
    <BilingualTitle ko="다시 돌보기" :latin="t('rescue.title')" />

    <RescuePanel
      v-if="drill.grammar.value"
      :grammar="drill.grammar.value"
      :stage="drill.stage.value"
      :dominant-dimension="drill.dominantDimension.value"
      :is-last="drill.isLast.value"
      :can-back="drill.canBack.value"
      @next="drill.next()"
      @back="drill.back()"
      @produce="goProduce"
    />
    <p v-else class="empty">{{ t('rescue.empty') }}</p>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 28px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
</style>
```

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/practice/RescuePanel.vue munbeop/app/pages/practice/rescue.vue munbeop/tests/components/practice/RescuePanel.test.ts
git commit -m "feat(leech): guided rescue panel + /practice/rescue page"
```

---

## Task 8: `StrugglingPlants` section on `/stats`

**Files:**
- Create: `munbeop/app/components/stats/StrugglingPlants.vue`
- Modify: `munbeop/app/pages/stats.vue`
- Test: `munbeop/tests/components/stats/StrugglingPlants.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/stats/StrugglingPlants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import type { Leech, LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})
const leech = (over: Partial<Leech> = {}): Leech => ({
  ko: '-는데',
  meaning: L('contrast'),
  recentHardRatio: 0.6,
  recentReviews: 5,
  dominantDimension: null,
  ...over,
})

describe('StrugglingPlants', () => {
  it('renders a Care link to the rescue route per leech', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [leech({ ko: 'A' }), leech({ ko: 'B' })] } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/practice/rescue?ko=A')
    expect(hrefs).toContain('/practice/rescue?ko=B')
  })

  it('shows the dominant-dimension chip when set', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [leech({ dominantDimension: 'register' })] } })
    expect(w.text()).toContain('dimension.register') // i18n stub echoes the key
  })

  it('renders nothing when there are no leeches', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [] } })
    expect(w.find('[data-testid="struggling-plants"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/stats/StrugglingPlants.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/stats/StrugglingPlants.vue`:

```vue
<script setup lang="ts">
import { NuxtLink } from '#components'
import type { Leech } from '~/lib/domain'

interface Props {
  leeches: Leech[]
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const careLink = (ko: string) => `/practice/rescue?ko=${encodeURIComponent(ko)}`
</script>

<template>
  <section v-if="leeches.length" class="block" data-testid="struggling-plants">
    <h2 class="block__title">{{ t('stats.struggling.title') }}</h2>
    <p class="block__sub">{{ t('stats.struggling.sub') }}</p>
    <div class="care">
      <div v-for="l in leeches" :key="l.ko" class="care__row" data-test="struggling-row">
        <div class="care__grammar">
          <span class="care__ko" lang="ko">{{ l.ko }}</span>
          <span v-if="l.meaning" class="care__meaning">· {{ tl(l.meaning) }}</span>
        </div>
        <div class="care__right">
          <span v-if="l.dominantDimension" class="care__chip" lang="ko">
            {{ t(`dimension.${l.dominantDimension}`) }}
          </span>
          <NuxtLink class="care__cta" data-test="struggling-care" :to="careLink(l.ko)">
            {{ t('stats.struggling.care') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.block__title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}
.block__sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin: 0 0 8px;
}
.care {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.care__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
  padding: 9px 12px;
}
.care__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}
.care__meaning {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-left: 4px;
}
.care__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.care__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--ink-soft);
  border: 1px solid var(--ink-line, var(--border));
  border-radius: 6px;
  padding: 2px 7px;
}
.care__cta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 999px;
  padding: 4px 12px;
}
.care__cta:hover {
  background: var(--paper-deep);
}
.care__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/stats/StrugglingPlants.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into `stats.vue`**

In `munbeop/app/pages/stats.vue`:

(a) Add imports after the existing ones (around line 5):

```ts
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import { useLeeches } from '~/composables/useLeeches'
```

(b) In `<script setup>`, after the `useStats()` destructure (around line 21), add:

```ts
const { leeches } = useLeeches()
```

(c) In the template, inside the `<template v-else>` block, add the section right after the toughest `</section>` (around line 136, before the closing `</template>`):

```vue
      <StrugglingPlants :leeches="leeches" />
```

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/stats/StrugglingPlants.vue munbeop/app/pages/stats.vue munbeop/tests/components/stats/StrugglingPlants.test.ts
git commit -m "feat(leech): 'plants that need care' section on /stats"
```

---

## Task 9: i18n keys in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/rescue-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/i18n/rescue-keys.test.ts`:

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
  'rescue.title',
  'rescue.header',
  'rescue.header_plain',
  'rescue.stage_reread',
  'rescue.stage_examples',
  'rescue.stage_discriminate',
  'rescue.stage_produce',
  'rescue.produce_body',
  'rescue.produce_cta',
  'rescue.next',
  'rescue.back',
  'rescue.empty',
  'stats.struggling.title',
  'stats.struggling.sub',
  'stats.struggling.care',
  'practice.rescue_offer',
  'practice.rescue_offer_dismiss',
]

describe('rescue/struggling i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('rescue.header keeps the {dimension} placeholder', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'rescue.header'), code).toContain('{dimension}')
    }
  })
  it('rescue.produce_cta keeps 화이팅', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'rescue.produce_cta'), code).toContain('화이팅')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/i18n/rescue-keys.test.ts`
Expected: FAIL — keys missing in every locale.

- [ ] **Step 3: Add the `rescue` block + `stats.struggling` + `practice.rescue_offer*` keys to each locale**

In **`en.json`**: add a top-level `"rescue"` block (place it next to `"journal"`/`"stats"`), add `"struggling"` inside the existing `"stats"` object (after `"toughest"`), and add the two `rescue_offer*` keys inside the existing `"practice"` object.

`rescue` block (en):
```json
  "rescue": {
    "title": "Care for this plant",
    "header": "What slipped most here: {dimension}",
    "header_plain": "Let's give this one a little extra care",
    "stage_reread": "Re-read",
    "stage_examples": "See it in use",
    "stage_discriminate": "Tell them apart",
    "stage_produce": "Write it yourself",
    "produce_body": "Now put it to work — write fresh sentences with this pattern.",
    "produce_cta": "Practice 화이팅",
    "next": "Next",
    "back": "Back",
    "empty": "Pick a plant to care for from your Stats."
  },
```

`stats.struggling` (add inside `"stats"`, after the `"toughest": { … }` entry — remember the comma):
```json
    "struggling": {
      "title": "Plants that need care",
      "sub": "A little extra care helps these grow.",
      "care": "Care"
    }
```

`practice.rescue_offer*` (add inside `"practice"`):
```json
    "rescue_offer": "Care for this plant first?",
    "rescue_offer_dismiss": "Not now",
```

Then add the **same keys** to the other 7 locales with these translations (keep `{dimension}` and 화이팅 verbatim):

**es.json**
```json
  "rescue": {
    "title": "Cuida esta planta",
    "header": "Lo que más se te escapó aquí: {dimension}",
    "header_plain": "Démosle a esta un poco de cariño extra",
    "stage_reread": "Releer",
    "stage_examples": "Verlo en uso",
    "stage_discriminate": "Distinguirlos",
    "stage_produce": "Escríbelo tú",
    "produce_body": "Ahora ponlo en práctica: escribe frases nuevas con este patrón.",
    "produce_cta": "Practicar 화이팅",
    "next": "Siguiente",
    "back": "Atrás",
    "empty": "Elige una planta para cuidar desde tus Estadísticas."
  },
```
`stats.struggling` (es): `{ "title": "Plantas que necesitan cariño", "sub": "Un poco de cuidado extra las ayuda a crecer.", "care": "Cuidar" }`
`practice` (es): `"rescue_offer": "¿Cuidar esta planta primero?", "rescue_offer_dismiss": "Ahora no",`

**fr.json**
```json
  "rescue": {
    "title": "Prends soin de cette plante",
    "header": "Ce qui a le plus coincé ici : {dimension}",
    "header_plain": "Offrons-lui un peu d'attention en plus",
    "stage_reread": "Relire",
    "stage_examples": "La voir en contexte",
    "stage_discriminate": "Les distinguer",
    "stage_produce": "Écris-la toi-même",
    "produce_body": "À toi de jouer : écris de nouvelles phrases avec ce motif.",
    "produce_cta": "S'entraîner 화이팅",
    "next": "Suivant",
    "back": "Retour",
    "empty": "Choisis une plante à soigner depuis tes Statistiques."
  },
```
`stats.struggling` (fr): `{ "title": "Plantes à choyer", "sub": "Un peu d'attention les aide à grandir.", "care": "Soigner" }`
`practice` (fr): `"rescue_offer": "Soigner cette plante d'abord ?", "rescue_offer_dismiss": "Pas maintenant",`

**pt-BR.json**
```json
  "rescue": {
    "title": "Cuide desta planta",
    "header": "O que mais escapou aqui: {dimension}",
    "header_plain": "Vamos dar um carinho extra a esta",
    "stage_reread": "Reler",
    "stage_examples": "Ver em uso",
    "stage_discriminate": "Diferenciar",
    "stage_produce": "Escreva você",
    "produce_body": "Agora coloque em prática: escreva frases novas com este padrão.",
    "produce_cta": "Praticar 화이팅",
    "next": "Próximo",
    "back": "Voltar",
    "empty": "Escolha uma planta para cuidar nas suas Estatísticas."
  },
```
`stats.struggling` (pt-BR): `{ "title": "Plantas que precisam de cuidado", "sub": "Um cuidado extra ajuda elas a crescer.", "care": "Cuidar" }`
`practice` (pt-BR): `"rescue_offer": "Cuidar desta planta primeiro?", "rescue_offer_dismiss": "Agora não",`

**th.json**
```json
  "rescue": {
    "title": "ดูแลต้นไม้ต้นนี้",
    "header": "สิ่งที่พลาดบ่อยที่สุดตรงนี้: {dimension}",
    "header_plain": "มาดูแลต้นนี้เป็นพิเศษกันหน่อย",
    "stage_reread": "อ่านอีกครั้ง",
    "stage_examples": "ดูตัวอย่างการใช้",
    "stage_discriminate": "แยกความต่าง",
    "stage_produce": "เขียนเอง",
    "produce_body": "ลองใช้จริง เขียนประโยคใหม่ด้วยรูปนี้",
    "produce_cta": "ฝึก 화이팅",
    "next": "ถัดไป",
    "back": "ย้อนกลับ",
    "empty": "เลือกต้นไม้ที่จะดูแลจากหน้าสถิติของคุณ"
  },
```
`stats.struggling` (th): `{ "title": "ต้นไม้ที่ต้องดูแล", "sub": "การดูแลเพิ่มอีกนิดช่วยให้มันเติบโต", "care": "ดูแล" }`
`practice` (th): `"rescue_offer": "ดูแลต้นนี้ก่อนไหม?", "rescue_offer_dismiss": "ไว้ก่อน",`

**id.json**
```json
  "rescue": {
    "title": "Rawat tanaman ini",
    "header": "Yang paling sering meleset di sini: {dimension}",
    "header_plain": "Mari beri yang satu ini perhatian ekstra",
    "stage_reread": "Baca ulang",
    "stage_examples": "Lihat penggunaannya",
    "stage_discriminate": "Bedakan",
    "stage_produce": "Tulis sendiri",
    "produce_body": "Sekarang praktikkan: tulis kalimat baru dengan pola ini.",
    "produce_cta": "Latihan 화이팅",
    "next": "Berikutnya",
    "back": "Kembali",
    "empty": "Pilih tanaman untuk dirawat dari Statistik kamu."
  },
```
`stats.struggling` (id): `{ "title": "Tanaman yang perlu dirawat", "sub": "Sedikit perhatian ekstra membantunya tumbuh.", "care": "Rawat" }`
`practice` (id): `"rescue_offer": "Rawat tanaman ini dulu?", "rescue_offer_dismiss": "Nanti saja",`

**vi.json**
```json
  "rescue": {
    "title": "Chăm sóc cây này",
    "header": "Điều hay sai nhất ở đây: {dimension}",
    "header_plain": "Hãy chăm sóc cây này thêm một chút",
    "stage_reread": "Đọc lại",
    "stage_examples": "Xem cách dùng",
    "stage_discriminate": "Phân biệt",
    "stage_produce": "Tự viết",
    "produce_body": "Giờ áp dụng nào: viết câu mới với mẫu này.",
    "produce_cta": "Luyện tập 화이팅",
    "next": "Tiếp",
    "back": "Quay lại",
    "empty": "Chọn một cây để chăm sóc từ trang Thống kê của bạn."
  },
```
`stats.struggling` (vi): `{ "title": "Cây cần được chăm sóc", "sub": "Chút quan tâm thêm giúp chúng lớn lên.", "care": "Chăm sóc" }`
`practice` (vi): `"rescue_offer": "Chăm sóc cây này trước nhé?", "rescue_offer_dismiss": "Để sau",`

**ja.json**
```json
  "rescue": {
    "title": "この植物を手入れする",
    "header": "ここで一番つまずいたのは：{dimension}",
    "header_plain": "この子に少し手をかけてあげましょう",
    "stage_reread": "読み直す",
    "stage_examples": "使い方を見る",
    "stage_discriminate": "見分ける",
    "stage_produce": "自分で書く",
    "produce_body": "さあ実践です。このパターンで新しい文を書いてみましょう。",
    "produce_cta": "練習 화이팅",
    "next": "次へ",
    "back": "戻る",
    "empty": "統計から手入れする植物を選んでください。"
  },
```
`stats.struggling` (ja): `{ "title": "手入れが必要な植物", "sub": "少しの手入れで育ちます。", "care": "手入れ" }`
`practice` (ja): `"rescue_offer": "先にこの植物を手入れする？", "rescue_offer_dismiss": "あとで",`

> JSON care: each added key needs a trailing comma except the last entry in its object. After editing, the parity test (Step 4) plus `pnpm typecheck` will catch any malformed JSON or missing locale.

- [ ] **Step 4: Run the parity test to verify it passes**

Run: `pnpm exec vitest run tests/unit/i18n/rescue-keys.test.ts`
Expected: PASS (all 8 locales × all keys, plus the `{dimension}` and 화이팅 invariants).

- [ ] **Step 5: Commit**

```bash
git add munbeop/i18n/locales munbeop/tests/unit/i18n/rescue-keys.test.ts
git commit -m "feat(leech): rescue + struggling i18n keys across 8 locales"
```

---

## Task 10: Full verification gate

**Files:** none (verification only).

- [ ] **Step 1: Run the whole unit + component suite**

Run: `pnpm test`
Expected: PASS — all new tests plus the existing suite green.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: clean. Fix any issues (common: unused imports, missing trailing commas) and re-run.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Manual preview smoke (per repo verify→commit→verify→push discipline)**

Start the dev server and verify the observable behaviour:
- `/stats` with a struggling grammar shows the "Plants that need care" section with a Care link; with none, the section is absent.
- `/practice/rescue?ko=<a real leech ko>` walks re-read → examples → (discrimination only when a pair exists) → produce; the produce CTA lands on `/practice/ruleta?focus=<ko>`.
- In a normal ruleta deck draw, a leech pick shows the dismissible "Care for this plant first?" offer above its card, and no draw seats more than one leech.

- [ ] **Step 5: Final commit (if any lint/type fixes were made)**

```bash
git add -A
git commit -m "chore(leech): lint/type fixes after Step 11 verification"
```

---

## Self-Review

**Spec coverage:**
- Detection module `app/lib/srs/leech.ts` (recent window, self-heal, dominant dimension, no migration) → Task 1. ✓
- Session cap (≤1 leech/draw, coexists with `getWeight`) → Task 2 + Task 4. ✓
- `useLeeches` composable → Task 3. ✓
- In-ruleta gentle offer (re-route as offer) → Task 5. ✓
- Guided rescue flow (`useRescueDrill` + page, dimension-adaptive, pair-gated discrimination, handoff to `?focus=`) → Tasks 6 + 7. ✓
- Passive `/stats` "plants that need care" surface → Task 8. ✓
- i18n in all 8 locales + parity (incl. `{dimension}` + 화이팅 invariants) → Task 9. ✓
- No DB migration; `database.types.ts` unchanged → no task touches `supabase/` (by design). ✓
- Full verification (test/lint/typecheck/preview) → Task 10. ✓

**Type consistency:** `detectLeeches(log, grammars): Leech[]` (no `now`, no `srsMap` — recent window is order-based) used identically in Task 1, the `useLeeches` test (Task 3), and `useLeeches` (Task 3). `Leech` fields (`ko`, `meaning`, `recentHardRatio`, `recentReviews`, `dominantDimension`) match across Tasks 1, 3, 6, 8. `RescueStage` exported from `useRescueDrill` (Task 6) and imported by `RescuePanel` (Task 7). `capLeechPicks` signature matches between Task 2's impl and test. The `createSession` `capPredicate`/`maxCapped` params match between Task 2 (impl/test) and Task 4 (usePractice call). i18n keys referenced by `t(...)` in Tasks 5/7/8 are exactly the keys defined in Task 9 (`rescue.*`, `stats.struggling.*`, `practice.rescue_offer*`, plus reused `dimension.*` from Step 2).

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every command states expected output. The only non-tested files (usePractice wiring, rescue.vue page) are explicitly justified (no Nuxt-context unit tests in this repo) and covered by the pure tests + typecheck + preview.

**Deliberate deviation from the spec, noted:** the spec's data-model line wrote `detectLeeches(log, grammars, now)`; the plan drops `now` because the recency window is the most-recent N entries by date (order-based), which needs no clock and keeps the function pure and trivially testable. Self-healing still holds (recent easy reviews slide the window past old hard ones). Update the spec's one line to match during implementation if desired.
