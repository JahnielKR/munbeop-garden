# Placement Test (배치 테스트) — Design

- **Date:** 2026-06-23
- **Roadmap:** Step 15 of the Bunpro-inspired roadmap (Phase 3). "Placement, S, clear value."
- **Status:** Approved design (brainstorming). Next: writing-plans.

## 1. Motivation

A new learner has no idea which TOPIK deck to start from, and the current
onboarding (a single guided sentence) gives no level signal. The placement test
estimates the learner's TOPIK level with a short adaptive quiz and **sets the
starting deck** so the practice loop (ruleta) lands them at the right level.

The value is concentrated in two pure, well-bounded units: the **ladder engine**
(level estimation) and the **authored item bank** (level-discriminating
questions). Everything else is thin wiring around them.

## 2. Decisions (locked in brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | What the result does | **Set the starting deck** — write `startingDeckId` to the synced settings blob; the ruleta `DeckPicker` highlights it. No SRS/log writes. |
| 2 | Level-estimation mechanic | **Ascending ladder with early-stop** — climb TOPIK 1→6, a few questions per level, stop at the first level you fail. |
| 3 | Item source | **Dedicated authored bank** — static seed, ~5 items/level × 6, validated by a Korean-lens content workflow + native (wife) review. |
| 4 | Entry point | **Standalone lab** `/practice/placement` (hub card, re-takeable) **+ a "Find your level" CTA on the new-user `EmptyPlot`**. No entanglement with the guided-sentence overlay. |
| 5 | Item format | **Cloze-of-usage** — Korean sentence with a `{}` blank, 4 Korean options (correct surface form + 3 sibling distractors), single-correct by construction. Modeled on the proven `ClozeItem`. |
| 6 | Recommended starting deck | **Frontier** = first level NOT cleared (study what you don't know yet), floored at TOPIK 1, capped at TOPIK 6. |

### Out of scope (YAGNI)

- No SRS/log writes, no mistake-feed pollution — placement is **assessment-only**.
- No binary-search / IRT — the ascending ladder is enough for a coarse deck choice.
- No timer, no hard scoring penalty, no leaderboards.
- No weaving into the `GuidedFirstSentence` overlay — the CTA is just a link.
- No migration — `startingDeckId` rides the existing settings JSON blob.

## 3. UX Flow

1. **Entry:** a `GameCard` (🧭) in the practice hub → `/practice/placement`
   (re-takeable anytime), **plus** a secondary "Find your level" button on the
   `EmptyPlot` zero-state that links to the same page.
2. **Test:** one card per question (reuses the cloze/register card visuals), a
   discreet progress indicator. No clock, no harsh penalty.
3. **Result:** "Your level: TOPIK 3" + "Start with TOPIK 4" + a CTA
   "Practice TOPIK 4" (deep-links into the ruleta at that deck) + a "Retake"
   button.
4. **Effect:** persists `startingDeckId` to the settings blob (synced, no
   migration). On the next ruleta visit, the `DeckPicker` highlights that deck
   with a "Your level" badge. It guides; it does not force the round to start.

## 4. Mechanic — ascending ladder

### Config (`app/lib/placement/config.ts`)

```
Q_PER_LEVEL    = 3   // questions asked per level
PASS_THRESHOLD = 2   // correct answers needed to clear a level (>= 2 of 3)
MIN_LEVEL      = 1
MAX_LEVEL      = 6
```

### Algorithm (`app/lib/placement/ladder.ts`, pure state machine)

- Start at `currentLevel = 1`, `clearedLevel = 0`.
- Ask `Q_PER_LEVEL` questions from `currentLevel`.
  - If correct count `>= PASS_THRESHOLD`: mark `clearedLevel = currentLevel`.
    - If `currentLevel === MAX_LEVEL`: done (cleared everything).
    - Else advance to `currentLevel + 1`, reset per-level counters.
  - Else: stop (`done`).
- `result()` returns:
  - `clearedLevel` — highest level passed (`0` = failed TOPIK 1).
  - `startingLevel = clamp(clearedLevel + 1, MIN_LEVEL, MAX_LEVEL)` (frontier).
  - `startingDeckId = \`topik-${startingLevel}\``.

Worked examples:

| Outcome | clearedLevel | startingLevel | startingDeckId |
|---------|-------------:|--------------:|----------------|
| Fails TOPIK 1 | 0 | 1 | `topik-1` |
| Clears 1–3, fails 4 | 3 | 4 | `topik-4` |
| Clears all 6 | 6 | 6 | `topik-6` |

Length: 3 questions (beginner who fails level 1) to 18 (clears everything).

`ladder.ts` is **pure and deterministic** — no `Date.now`, no `Math.random`.
Item selection randomness lives in the composable / `select.ts` (runtime only).

## 5. Architecture

### Domain & seed

- `app/lib/domain/placement.ts`
  ```ts
  export interface PlacementItem {
    ko: string                 // FK → Grammar.ko (validated against DEFAULT_GRAMMAR)
    level: TopikLevel          // 1..6 — the deck this item belongs to
    sentence: string           // Korean, with the literal "{}" blank
    answer: string             // correct surface form
    distractors: [string, string, string]  // sibling-pattern surface forms, distinct, ≠ answer
    trans: LocalizedString
    why: LocalizedString
  }
  ```
- `app/seed/placement/{index,n1,n2,n3,n4,n5,n6}.ts` — authored bank, ~5
  items/level (≥ `Q_PER_LEVEL`, with margin for retakes), using the 8-locale
  `L()` helper. `index.ts` exposes `PLACEMENT_ITEMS_BY_LEVEL`.

### Pure logic (the value)

- `app/lib/placement/ladder.ts` — the state machine above.
- `app/lib/placement/select.ts` — `selectItems(pool, n)`: pick `n` distinct
  items from a level pool (shuffle with `Math.random` here, runtime only).
- `app/lib/placement/config.ts` — the constants.

### UI

- `app/composables/usePlacement.ts` — orchestrates ladder + select; exposes the
  current item, progress, `submit(optionIndex)`, and `result`. On completion
  calls `settings.setStartingDeck(result.startingDeckId)`.
- `app/components/placement/PlacementCard.vue` — clones the cloze/register card
  (4 options, verdict, a11y `role=status`); emits the picked option.
- `app/components/placement/PlacementResult.vue` — shows cleared level + the
  starting-deck CTA (deep-link) + retake. The `clearedLevel === 0` case (failed
  TOPIK 1) shows a "just starting out" message and recommends TOPIK 1 rather than
  a "Your level: TOPIK 0".
- `app/pages/practice/placement.vue` — thin route; hydrates the grammar catalog
  for deck names and `ko` validation.

## 6. Wiring (all additive, no migration)

- **Settings** (`app/stores/settings.ts`): add `startingDeckId: string | null`
  to the `Settings` interface + `ref` + hydrate guard + `persistCloud` field +
  `setStartingDeck()` setter, exactly mirroring `reviewReminders`.
  **Known gotcha:** this breaks the 3 `toHaveBeenCalledWith` blob assertions in
  `tests/unit/stores/settings.test.ts` — update them to include
  `startingDeckId` (same fix as Step 16).
- **Ruleta / DeckPicker**: add an optional `recommendedId?: string` prop to
  `DeckPicker.vue`; render a "Your level" badge on the matching deck. The ruleta
  page reads `settings.startingDeckId` and passes it through. Does not force the
  round to start.
- **EmptyPlot** (`app/components/garden/EmptyPlot.vue`): add a secondary button
  linking to `/practice/placement`.
- **Practice hub** (`app/pages/practice/index.vue`): add a `GameCard` (🧭) →
  `/practice/placement`.
- **i18n**: `placement.*` (test + result copy) + `games.placement.{name,desc}`
  across all 8 locales.

## 7. Content — pipeline & gates

- **Draft:** a Korean-lens content Workflow (drafters per level → adversarial
  verify → scribe routing by level), as in Steps 6/8/9/13. Each item targets a
  **level-defining** grammar point; distractors are patterns from adjacent
  levels / real learner confusions, so items are **discriminating** — reliably
  answered at the target level, reliably missed below it.
- **Mechanical gate:** `seed-invariants.test.ts` asserts per item — valid
  Hangul; exactly 3 distractors, pairwise distinct and ≠ `answer`; `level` ∈
  1..6; `ko` exists in `DEFAULT_GRAMMAR`; `trans` and `why` carry all 8 locales;
  each level has ≥ `Q_PER_LEVEL` items.
- **Semantic gate:** native (wife) review of all ~30 items — the documented
  final content gate.

## 8. Testing

- `ladder.test.ts` — golden: clears-all→6, fails-level-1→floor(1),
  clears-3-fails-4→frontier(4), exact 2/3 threshold edges (pass at 2, fail at 1).
- `select.test.ts` — returns `Q_PER_LEVEL` distinct items from the right level.
- `seed-invariants.test.ts` — the content gate above.
- Component tests — `PlacementCard` emits the picked option and renders the
  verdict; `PlacementResult` shows the level and deep-links to the right deck.
- `usePlacement` integration — drives a full ladder run and asserts
  `setStartingDeck` is called with the expected `startingDeckId`.
- `settings.test.ts` — updated for the `startingDeckId` blob field.
- `DeckPicker` — `recommendedId` renders the badge on the matching deck only.
- i18n parity — `placement.*` + `games.placement.*` present across 8 locales.

## 9. Build approach

TDD per task (executing-plans), as in the recent steps. The Korean content is
produced by the workflow above and validated by the mechanical + native gates.
The implementation plan follows next via the writing-plans skill.
