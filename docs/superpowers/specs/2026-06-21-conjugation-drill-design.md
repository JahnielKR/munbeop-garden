# 활용 연습 — Conjugation Recognition Drill (`/practice/conjugation`) — design

_Created 2026-06-21. Roadmap **Step 5b** (Phase 1 spine) of
`docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Builds on Step 5's engine
(`app/lib/korean/`, merged to main). Effort: M._

## Goal

A recognition-first conjugation drill: the learner sees a dictionary form + a target ending
and picks the correct conjugated surface from four choices. The pedagogy lives in the
**distractors** — they are the systematic mistakes learners actually make (applying the
regular rule to an irregular, wrong vowel harmony, a stray/missing epenthetic 으), so every
question drills the batchim/irregular alternation that the roadmap names as the moat.

This is a new standalone `/practice` game mirroring Particle Lab. It reuses the Step 5 engine
(never modifies it) and the existing practice UI/composable patterns. No typed-answer grading.

## Decisions (locked via brainstorm)

1. **New standalone game** `/practice/conjugation` (`활용 연습`) — verb conjugation only.
   Particles stay in Particle Lab.
2. **Error-model distractors** — distractors are generated plausible-wrong forms, not other
   verbs' forms and not the same verb's other endings.
3. **Class-focus set picker** — pick an irregular class to drill (`regular · p_irr · t_irr ·
   eu_elision · reu_irr · h_irr · s_irr · l_drop · hada`) plus a `mixed` (all-classes) deck.
4. **Mistake-feed + self-contained mastery, NO SRS-catalog coupling** — wrong answers are
   logged to `/log` with `errorDimension='ending'`; progress is a local `활용 마스터` badge.
   The SRS/garden side (leech rescue, soft revisit) stays for roadmap Steps 11/12.
5. **Single-layer verdict** — correct / wrong (no 받침-slip retry layer; that is particle-specific).
6. **Gloss is an English hint** — the dataset glosses are EN-only; the Korean dict form is the
   real stimulus, so the gloss renders as a secondary hint. Gloss localization is a follow-up.

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/conjugation-drill/distractors.ts` | `buildDistractors(verb, ending, correct): string[]` — up to 3 deduped, valid-Hangul, ≠correct wrong forms via the error strategies below. Pure. |
| `app/lib/conjugation-drill/drill.ts` | `DrillClass` set defs; `buildItem(verb, ending, seed)` → `{ id, verb, ending, correct, options }` (correct + distractors, deterministically shuffled); `scoreOf(results)`; types. Pure. Uses the engine's `conjugate` + the shared `shuffle`. |
| `app/lib/conjugation-drill/index.ts` | Public surface. |
| `app/composables/useConjugationDrill.ts` | Round state mirroring `useParticleDrill` (minus the SRS/garden bits): `sessionItems`, `mode 'normal'|'replay'`, `index/phase/picked/verdict`, `start/answer/next/replayFailed/selectClass`, `score`, `failedItems`. Logs mistakes to the log store; no `gardenGrew`/SRS. |
| `app/composables/useConjugationMaster.ts` | Derives `활용 마스터` from a localStorage `conjugation-lab.cleared` set (a class is "cleared" at round-end accuracy ≥ threshold); `perClass`, `doneCount`, `total=9`, `earned` (sticky), one-shot `celebrate`. |
| `app/components/conjugation-drill/*.vue` | `DrillClassPicker`, `ConjugationCard` (prompt + 4 options + reveal), `ConjugationOption`, `ConjugationSummary`, `ConjugationMasterStrip`, `ConjugationMasterCelebration`. Reuse `practice/ProgressDots`, `games/GameExitButton`, `games/GameLeaveConfirm`, `composables/useGameLeaveGuard`. |
| `app/pages/practice/conjugation.vue` | Page orchestrator: class picker → drill card → summary; master strip + celebration; leave-guard on an in-progress round. `?set=<class>` deep link. |
| `app/pages/practice/index.vue` | + a `활용 연습` game card. |

## Distractor strategies (`distractors.ts`)

Applied in this priority order; each candidate is kept only if it is valid Hangul, differs
from `correct`, and is not already chosen. Stop at 3.

1. **naive-regular** — `conjugate(dict, 'regular', ending)`. The canonical irregular error
   (듣다 -아/어요 → 듣어요 vs 들어요). For an already-regular verb this equals `correct`, so it is
   skipped and the remaining strategies fill in.
2. **wrong-harmony** — in the `-아/어` family, swap the harmonic vowel (아↔어 / 았↔었) of the
   correct form (먹어요 → 먹아요). Only applies to the two `-아/어` endings.
3. **eu-error** — in the `-(으)` family, toggle the epenthetic 으: insert it after a
   vowel/ㄹ stem (가니까 → 가으니까) or drop it after a 받침 stem (먹으니까 → 먹니까).
4. **cross-class** — `conjugate(dict, otherClass, ending)` for a deterministically chosen
   different irregular class (e.g. a ㅂ verb conjugated as ㄷ). Only kept if it yields valid,
   distinct Hangul.

**Fallback:** if fewer than 3 distinct distractors are produced for a (verb, ending), fill
with the *correct* conjugation of another verb (same class preferred for coherence, then any
class), chosen deterministically by index and skipping any that collide with `correct` or an
existing option. The dataset (80 verbs) always supplies enough. This path is exercised rarely
and is covered by a test.

**Determinism:** no RNG inside the logic. `buildItem` takes a numeric `seed` (the item index)
and uses the existing pure `shuffle` (Fisher–Yates) to order the 4 options, so tests are
reproducible. The verb/ending selection for a round is `shuffle`d the same way.

## Data flow (one round)

`start(class)` → pick the class's (verb, ending) pairs, `shuffle` → N `sessionItems`
(N = 8 per round; `buildItem` each). For each: render prompt + shuffled options → `answer(choice)` sets verdict
(correct/wrong); on wrong, `logStore.add({ ko: dict, sentence: "<dict> + <ending> → <correct>",
feedback:'hard', errorNote:<chosen> + rule hint, errorDimension:'ending', reviewState:'incorrect',
contextId:'conjugation-lab', contextName:'활용 LAB' })` (no SRS call) → `next()` until `done` →
`ConjugationSummary` (score + failed list + replay-failed + restart). At round end, if accuracy
≥ 0.7 (matching Particle Lab's `EASY_THRESHOLD`) and the round was `normal` (not a replay), mark
the class cleared in `useConjugationMaster`; if that completes 9/9, fire the one-shot celebration.

## Components / interfaces

- `ConjugationCard` props: `item`, `phase`, `verdict`, `picked`; emits `answer`, `next`. Shows
  dict + gloss + ending chip, the 4 `ConjugationOption`s, and on reveal the correct form + a
  one-line rule note (`conjugation.rule.<klass>` i18n).
- `DrillClassPicker` props: `classes`, `selected`; emits `select` — same UX as `DrillSetPicker`.
- `ConjugationMasterStrip` / `ConjugationMasterCelebration` mirror the Particle Lab master
  components (calm strip + pip per class, one-shot reward card, no pixel-art asset).
- a11y: follow the #10 Particle Lab pass — focus the card per question, `role=status` on the
  reveal, accessible names on options, focus-trapped celebration dialog.

## Testing (TDD)

- `tests/unit/conjugation-drill/distractors.test.ts` — a **golden distractor table** (adversarially
  verified by a workflow) per representative (verb, ending, class); asserts the exact expected
  wrong options, all ≠ correct, all valid Hangul. Invariants over the whole dataset: exactly 3
  distractors, never equal to correct, all distinct.
- `tests/unit/conjugation-drill/drill.test.ts` — `buildItem` yields 4 unique options incl.
  correct; deterministic shuffle for a fixed seed; `scoreOf`; failed subset.
- `tests/components/conjugation-drill/*` — card answer→reveal, option states, summary, master
  strip N/9 + earned, celebration dismiss.
- `tests/unit/.../useConjugationDrill` — answer→next→done, replay-only-failed, one mistake log
  per wrong answer with `errorDimension:'ending'` + `conjugation-lab` context (log store mocked),
  and **no SRS store interaction**.
- i18n ×8 — `conjugation.*` keys present in all 8 locales; Korean fragments (활용/마스터/연습)
  verbatim.

## Acceptance criteria

1. `/practice/conjugation` renders, is listed on `/practice`, and is reachable with `?set=<class>`.
2. Every drill item has exactly 4 options: the engine-correct form + 3 error-model distractors,
   all distinct and valid Hangul; the correct form is never among the distractors.
3. Wrong answers create exactly one `/log` entry with `errorDimension:'ending'` and the
   `활용 LAB` context; no SRS/catalog mutation occurs.
4. Class picker (9 classes + mixed), replay-failed, and the `활용 마스터` N/9 badge work.
5. `pnpm test` / `typecheck` / `lint` green; engine untouched; no migration.

## Out of scope

SRS/garden coupling (Steps 11/12); typed-answer grading; endings beyond the 6 Core-TOPIK-1;
register/honorific transforms (Step 8); cloze-in-sentence (Step 9); gloss localization; audio.
