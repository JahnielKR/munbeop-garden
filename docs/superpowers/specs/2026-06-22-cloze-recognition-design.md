# Cloze recognition drill — 빈칸 연습 — design

_Created 2026-06-22. Roadmap **Step 9** (Phase 2) of
`docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Depends on Step 5 (engine) and
Step 6 (grammar_examples), both shipped; reuses Step 7's discrimination content. Effort: M code / L content._

> **Filesystem note.** The Nuxt app lives under `munbeop/`, so every `app/...` / `i18n/...` /
> `tests/...` path below is physically `munbeop/app/...`. This spec uses the `app/...` shorthand to
> match the prior specs. Docs/specs live at the repo root under `docs/superpowers/`.

## Goal

A **lighter, ~30-second recognition round that complements production**: a 4-choice grammar-**pattern**
cloze at `/practice/cloze`. Each item shows a Korean sentence with the grammar pattern blanked (the
literal `{}` marker) and four surface-form options; the learner picks which pattern fits. It is
**deck-driven** — it draws its grammar points from a chosen TOPIK deck or one of the user's **custom
decks**, so custom decks finally pay off in a second mode and the cloze drills the same points as
production, just lighter. Correct/wrong picks feed the **same log-derived mastery truth** as the
production loop (daily-goal, streak, garden, SRS) — no separate achievement.

This is distinct from the existing drills: Step 5b (conjugation) tests verb **form** with engine
distractors; Step 7 (discrimination) is a 2-choice per-pair test inside the **study sheet**; Step 9 is
a 4-choice **deck-wide** pattern-recognition round in the **practice loop** that credits real mastery.

## Decisions (locked via brainstorm Q1–Q3)

1. **Grammar-pattern cloze, 4-choice** — blank the grammar point; distractors are sibling/confusable
   pattern surface forms. Reuses + expands Step 7's `DiscriminationItem` content to 4 options. (Q1)
2. **Standalone page `/practice/cloze`, deck-driven** — picks points from a TOPIK deck or a custom deck
   (reuses `DeckPicker`/`CustomDeckShelf` + the deck→ko resolution); NOT woven into the ruleta session
   (that would need a discriminated `Pick` union + `<component :is>` + a second submit path — invasive,
   and it muddies the 9-sentence model stats/garden assume). (Q2)
3. **~50 verified items, TOPIK 1–2.** Authored + Korean-lens adversarially verified; the user's Korean
   wife is the documented final native gate. (Q3)

### Decisions made in design (rationale)

- **No separate localStorage mastery achievement** (unlike Steps 5b/8). The cloze feeds the **real**
  catalog mastery (SRS/garden) because it's deck-driven over real `Grammar.ko`s — a parallel
  localStorage "master" would be redundant. The reward is garden growth.
- **Do NOT refactor `PairDrill`** (Step 7, shipped, paper palette, self-contained state). Build a fresh
  **stateless/prop-driven** `ClozeCard` (clone the conjugation/register card pattern + PairDrill's
  `{}`-split render). Accept the small duplication; do not destabilize Step 7.
- **`errorDimension: 'other'`** is the default for a pattern cloze (no particle/ending/register fits
  cleanly), with an optional per-item override.

## Mechanic

Recognition, choice-first (roadmap thesis: **no typed string-match** — Korean morphology rejects
correct typed answers). Each item: a sentence with `{}`, four surface-form options
(`[answer, ...3 distractors]`, shuffled per question). On pick → the blank fills with the chosen form,
the card reveals correct/wrong styling + the `why` line + the `trans`, then Next. A correct pick is the
"easy" signal; a wrong pick is "hard". This pick-as-grade keeps the round light (no separate self-grade
step).

## Types

New module `app/lib/domain/cloze.ts` (re-exported via `app/lib/domain/index.ts`):

```ts
import type { LocalizedString } from './i18n'
import type { ErrorDimension } from './log'

export interface ClozeItem {
  /** FK → Grammar.ko (the correct pattern's catalog id). The deck filter keys on this. NOT translated. */
  ko: string
  /** Korean sentence with the literal "{}" blank where the pattern goes. NOT translated. */
  sentence: string
  /** Surface form of the correct pattern in this sentence (e.g. 와서). NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong sibling-pattern surface forms. NOT translated; valid Hangul; ≠ answer & pairwise distinct. */
  distractors: [string, string, string]
  trans: LocalizedString
  /** One line: why the answer fits and the others don't. */
  why: LocalizedString
  /** Optional mistake-feed tag; defaults to 'other'. */
  errorDimension?: ErrorDimension
}
```

This is Step 7's `DiscriminationItem` generalized: one `ko` (the correct pattern), a string `answer`
plus three string `distractors` (instead of the 2-side `optionA`/`optionB` + `answer: 'a'|'b'`).

## Seed (`app/seed/cloze/`)

- `n1.ts` → `N1_CLOZE: ClozeItem[]` (TOPIK-1 points), `n2.ts` → `N2_CLOZE: ClozeItem[]` (TOPIK-2),
  `index.ts` → `export const CLOZE_ITEMS = [...N1_CLOZE, ...N2_CLOZE]`.
- Authored with the positional 8-locale `L(...)` helper. Korean (`sentence`/`answer`/`distractors`) is
  bare `string`; `trans`/`why` are `LocalizedString`.
- Includes the conversion of Step 7's 12 discrimination items to 4-choice (re-keyed to the single
  correct `ko`, with two added sibling-pattern distractors each).
- Header docblock per file: provenance (authored, sentence pool informed by `grammar_examples`),
  adversarial-verification note, native-review gate.

> **Why authored, not auto-blanked:** `grammar_examples` sentences CANNOT be reliably blanked — the
> pattern is morphophonemically fused (마시+어요→마셔요), uses allomorph slashes (`-아/어`), `(으)`
> epenthesis, irregular stems (먹→드세요), multi-token spans, and same-sentence collisions. So cloze
> items carry an explicit `{}` span + authored options, exactly like `DiscriminationItem`.

## Pure lib (`app/lib/cloze/`)

- `drill.ts`:
  - `itemId(i): string` = `` `${i.ko}::${i.sentence}` `` (stable per-item key; no id field).
  - `itemsForKos(kos: string[], source = CLOZE_ITEMS): ClozeItem[]` — items whose `ko` ∈ `kos`.
  - `optionsFor(item): string[]` = `[answer, ...distractors]` (stable; the composable shuffles).
  - `buildRound(kos, n, shuffleFn, source = CLOZE_ITEMS): ClozeItem[]` — shuffle `itemsForKos`, cap `n`.
  - `scoreOf(results): { correct, total, accuracy }`; `DrillResult { itemId; ko; correct }`.
- `index.ts` barrel (`export * from './drill'`).
- **Deck → ko resolution** stays in the page/composable layer, reusing `lib/practice/session.ts`
  helpers: a TOPIK deck → `grammarStore.items` filtered by `deckId` → `.ko`; a custom deck → its
  `grammarKos` directly. `itemsForKos` then narrows to covered points.

## Composable (`app/composables/useClozeDrill.ts`)

Round engine cloned from `useRegisterDrill`, but **coupled to the real SRS** (like the production loop
and the Particle/Conjugation labs):

- Constructed with the deck's `ko[]`. `ROUND_SIZE = 8`. `LAB_CONTEXT = { id: 'cloze-lab', name: '빈칸 LAB' }`.
- State: `sessionItems`, `displayOptions` (shuffled `optionsFor`), `runMode` ('normal'|'replay'),
  `index`, `phase` ('question'|'right'|'wrong'|'done'), `picked`, `results`. Computed `item`, `score`,
  `failedItems`.
- `start()` — `buildRound`; for each distinct `ko` drawn, `srsStore.markSeen(ko)`.
- `answer(choice)` — `correct = choice === item.answer`; push `{ itemId, ko, correct }`. On **wrong** in
  `normal` mode → `await logMistake(item, choice)` (immediate).
- `next()`/`replayFailed()` as in the other drills; replay does not re-log.
- **`finish()`** (called when the round reaches `done`, `normal` mode only) — group `results` by `ko`;
  for each `ko` with round-accuracy ≥ `0.7` and ≥1 answered, log one **easy/correct** entry; then
  `await srsStore.recalculate(ko)` for every `ko` touched (mistakes + credited). This keeps a round's
  log volume ≈ (#distinct ko), sane for the daily goal, and credits real mastery — the Particle-Lab
  `finish()` precedent.

**Mistake log (per wrong pick):**
```ts
await logStore.add({
  ko: item.ko,
  sentence: item.sentence.replace('{}', item.answer),   // the resolved correct sentence
  feedback: 'hard',
  errorNote: t('cloze.diary_note', { chosen: choice, correct: item.answer }),
  errorDimension: item.errorDimension ?? 'other',
  reviewState: 'incorrect',
  contextId: LAB_CONTEXT.id,
  contextName: LAB_CONTEXT.name,
})
await srsStore.recalculate(item.ko)
```
**Credit log (per cleared ko at round end):** same shape with `feedback: 'easy'`, `errorNote: null`,
`reviewState: 'correct'`, `sentence` = the resolved sentence (`sentence.replace('{}', answer)`) of the
first correctly-answered item for that `ko` in the round.

`Feedback`/`ReviewState`/`ErrorDimension` from `app/lib/domain/log.ts`; `logStore.add` then
`srsStore.recalculate(ko)` is the production contract (writing `SrsState` directly would desync). No
scheduler/due-date (Steps 11/12).

## Page (`app/pages/practice/cloze.vue`)

Thin orchestrator, `definePageMeta({ surface: 'game' })`. Two phases (`pick → play`):

- **pick:** `DeckPicker` (TOPIK decks) + `CustomDeckShelf` (custom decks) — reused from ruleta. On
  select → resolve the deck to `ko[]`, `itemsForKos`; if the covered item count is below a small floor,
  show `cloze.deck_empty` ("this deck has no cloze items yet") and stay on pick. Otherwise construct
  `useClozeDrill(kos)`, `start()`, `phase = 'play'`.
- **play:** `ProgressDots` + `ClozeCard` while `phase !== 'done'`, then `ClozeSummary`. `GameExitButton`
  + `GameLeaveConfirm` + `useGameLeaveGuard(() => started && phase !== 'done')`. `onNext` calls
  `drill.next()` then `drill.finish()` when it reaches `done`.
- Deep-link: `?deck=<id>` / `?custom=<name|idx>` to start a specific deck directly (mirrors ruleta's
  `?focus=`). Grammar catalog hydrates from the store as in ruleta (logged-in).

## Components (`app/components/cloze-drill/`)

- `ClozeCard.vue` (stateless; props `item`, `options`, `phase`, `verdict`, `picked`): renders the
  `sentence.split('{}')` cloze with the blank filled with the picked/correct form on reveal (PairDrill's
  render), a 4-option grid of `ClozeOption` (1fr/1fr → 1col ≤480), and on reveal the verdict + `why` +
  `trans` + Next. a11y: `tabindex="-1"` + focus on mount/each question, `role="status"`, `lang="ko"`,
  44px targets, `--font-ko`. Uses `useLocalized().tl` for `why`/`trans` (the PairDrill/RegisterCard
  pattern), `$t` for chrome.
- `ClozeOption.vue` — identical to `RegisterOption.vue` (lab palette `--success`/`--danger`/`--border`).
- `ClozeSummary.vue` — score + missed list (`sentence → answer`) + "Review mistakes (n)" (replay-failed)
  + restart (clone of `RegisterSummary`).
- Reused as-is: `DeckPicker`, `CustomDeckShelf`, `ProgressDots`, `GameExitButton`, `GameLeaveConfirm`,
  `useGameLeaveGuard`, `BilingualTitle`, `shuffle`. **No** master strip/celebration.

## Hub & i18n

- `app/pages/practice/index.vue` — add a 6th `<GameCard to="/practice/cloze" :name="t('games.cloze.name')"
  :description="t('games.cloze.desc')" emoji="📝" />`. Auth-gated automatically (absent from `PUBLIC_PATHS`).
- `i18n/locales/*.json` ×8 — a top-level `cloze.*` block (`title`, `lead`, `pick_deck`, `prompt`,
  `pick_hint`, `correct`/`wrong`, `reveal_correct` with `{correct}`, `restart`, `replay_failed` with
  `{n}`, `replay_mode_label`, `summary_score` with `{correct}`/`{total}`, `diary_note` with
  `{chosen}`/`{correct}`, `next`, `progress_label`, `deck_empty`) + `games.cloze.{name,desc}`. Korean
  terms (빈칸) stay literal Hangul; descriptive text translated.

## Content + verification pipeline

1. **Draft** (Claude Workflow, like Steps 6/7/8): ~50 items across TOPIK 1–2, sentence pool informed by
   `grammar_examples`. Each item: `{ ko, sentence with {}, answer, 3 distractors, trans(8), why(8) }`.
   Convert Step 7's 12 discrimination items to 4-choice as part of the batch.
2. **Verify (adversarial, Korean-lens):** per item — (a) the sentence is natural and **exactly one
   option fits** (the 3 distractors are sibling patterns that are genuinely wrong/unnatural in that
   context, not acceptable alternatives); (b) the surface forms are conjugation-correct (sibling
   patterns correctly conjugated onto the stem); (c) `ko` is a real catalog `Grammar.ko`; (d) 8-locale
   `trans`/`why` fidelity. Ambiguous items rewritten until single-answer.
3. **Durable guard:** the seed-invariant tests. No runtime AI.
4. **Native gate:** documented — the wife reviews the batch; edits land as commits.

## Testing (TDD)

- `tests/unit/cloze/seed-invariants.test.ts` — `it.each` over `CLOZE_ITEMS`: `ko` ∈ `DEFAULT_GRAMMAR`;
  `sentence` contains `'{}'`; `answer` valid Hangul; exactly 3 distractors, each valid Hangul, ≠ `answer`
  and pairwise distinct; `trans`/`why` all 8 `LOCALE_CODES` non-empty; `errorDimension` (if set) ∈
  `ERROR_DIMENSIONS`. Coverage: ≥1 item for both TOPIK levels; total ≈ 50; the 4 Step-7 ids' points are
  covered.
- `tests/unit/cloze/drill.test.ts` — `itemsForKos` (filter), `optionsFor` (`[answer,...distractors]`),
  `buildRound` (size, injected shuffle), `scoreOf`, `itemId`.
- `tests/unit/cloze/useClozeDrill.test.ts` (mock `~/stores/log`, `~/stores/srs`, `vue-i18n`): a wrong
  pick logs ONE hard/incorrect with `errorDimension` + `contextName: '빈칸 LAB'` and calls
  `recalculate`; round end credits one easy/correct per ko with accuracy ≥ 0.7 and calls `recalculate`;
  replay mode does not log.
- `tests/components/cloze-drill/ClozeCard.test.ts` (`$t` identity mock): renders the `{}`-split sentence
  + 4 options; wrong pick reveals `why` + `cloze.wrong`; advancing reaches the summary.
- `tests/unit/cloze/i18n-keys.test.ts` — `cloze.*` parity ×8 + placeholder preservation +
  `games.cloze.{name,desc}` present.
- (Quality gate) the Korean-lens verification Workflow over the batch.

## Acceptance criteria

1. `ClozeItem` type + static `app/seed/cloze/` with ~50 verified TOPIK 1–2 items (incl. the expanded
   Step-7 set); `itemsForKos`/`buildRound`/`optionsFor`/`scoreOf` pure + tested.
2. `/practice/cloze` deck-driven lab: pick a TOPIK or custom deck → 4-choice cloze rounds → summary +
   replay-failed; surfaced via a `GameCard`.
3. Picks feed the real log/SRS: wrong → hard/incorrect (`errorDimension`), round end → easy/correct per
   cleared ko; daily-goal/streak/garden update with no changes to those modules.
4. Seed invariants hold; content passed the Korean-lens verification (single-correct-answer); native
   gate documented. `pnpm test`/`typecheck`/`lint` green; ruleta/session/engine/grammar seeds/Supabase
   untouched; no migration/DB.

## Out of scope (YAGNI)

Weaving cloze into the ruleta session (`Pick` union); refactoring `PairDrill`; typed input; a
time-based scheduler / SRS due-dates (Steps 11/12); a separate cloze mastery achievement; TTS; multi-
blank sentences; scaling beyond ~50 items.
