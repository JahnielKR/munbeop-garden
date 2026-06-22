# Register & Honorifics drill — 높임법 연구소 — design

_Created 2026-06-22. Roadmap **Step 8** (Phase 2) of
`docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Depends on Step 5 (engine, shipped)
and Step 6 (grammar examples, shipped). Effort: M code / L content (authoring + native review is the cost)._

> **Filesystem note.** The Nuxt app lives under `munbeop/` in this repo, so every `app/...` /
> `i18n/...` / `tests/...` path below is physically `munbeop/app/...` etc. This spec uses the
> `app/...` shorthand to match the prior specs (discrimination, conjugation). Docs/specs live at the
> repo root under `docs/superpowers/`.

## Goal

A standalone practice lab that drills the Korean honorific system — **the differentiator Bunpro
cannot port**. Two pedagogically separate modes, both recognition (choice-first) transforms:

1. **`level` (말단계 · speech level / 상대높임):** rewrite a sentence's predicate ending across
   반말 ↔ 해요체 ↔ 합쇼체 (and 저↔나), neutral subject. This is the formality slider made into a drill.
2. **`honor` (높임말 · subject + object honorification / 주체·객체 높임):** lift the subject/object —
   the infix `-(으)시-`, the honorific particles 께서/께, suppletive verbs (계시다/주무시다/잡수시다/
   드리다/말씀하시다…) and honorific nouns (성함/댁/진지/연세/생신/말씀).

Subject vs object honorification matters: 계시다/주무시다/께서/`-(으)시-` are **주체높임** (the grammatical
subject is honored); 드리다/여쭙다/뵙다/모시다/께 are **객체높임/겸양** (the object/recipient is honored,
speaker is humbled). The `honor` mode covers both. The speaker is **never** self-honorified — that's a
content invariant and a primary distractor.

## Decisions (locked via brainstorm Q1–Q4)

1. **Two separate modes** — `level` (neutral subject) and `honor` (subject/object honorification),
   not one merged transform. Pedagogically honest; avoids teaching the two axes as one. (Q1)
2. **Standalone full lab** at `/practice/register`, multi-mode via `?mode=` (mirrors Particle Lab),
   with mastery (localStorage), mistake-feed (`errorDimension='register'`), and replay-failed —
   reuses the Step 5b conjugation-lab machinery. (Q2)
3. **Broad first batch:** ~20 `level` items + ~28 `honor` items (~48 total), near-complete coverage of
   the spine `honorificVocab` table. (Q3)
4. **Static authored + verified content** — the Step-5 engine has **no** honorific support
   (`-(으)세요` is a flat literal, no `-(으)시-` morpheme, no 합쇼체/반말 endings, no suppletion,
   no 께서/께), so transforms are authored seed data, not engine-generated. Content is verified by an
   adversarial Korean-lens Workflow; the user's Korean wife is the documented final native-review gate.
   (forced by the engine gap; same pipeline as Steps 5/6/7)

## Mechanic (recognition, not typed production)

Bound by the roadmap thesis (Step 9 = "cloze choice-first, NOT typed string-match") + the Step 5b
precedent + IME friction. Each item shows the **source sentence** and a transform prompt
("**합쇼체로 바꾸세요**" / "**높여서 말하세요**"); the learner **picks one of 4 options**
(`[answer, ...3 distractors]`, shuffled per question). On pick → reveal verdict + the `why` line + the
`trans`, then Next — identical reveal model to `ConjugationCard.vue`.

The pedagogy lives in the **distractors**:
- `honor` mode: missed suppletion (자다 → `자세요` instead of `주무세요`), dropped 께서, `-(으)시-`
  wrongly applied to a 1st-person subject (저 …‑세요), un-elevated honorific noun (집 instead of 댁).
- `level` mode: wrong register ending, mixed-register predicate, 저↔나 mismatch.

## Types

New sibling module `app/lib/domain/register.ts` (the drill is cross-cutting — it does **not** hang off
a single `Grammar.ko`, unlike the Step-7 `ConfusablePair`), re-exported via `app/lib/domain/index.ts`.
Reuses `SpeechLevel` ('formal'|'polite'|'casual' = 합쇼체/해요체/반말) — no new register axis.

```ts
import type { SpeechLevel } from './particles'
import type { LocalizedString } from './i18n'

export type RegisterMode = 'level' | 'honor'

/** Focus sets per mode — drive the picker AND the mastery units. */
export const LEVEL_SETS = ['formal', 'polite', 'casual'] as const          // target register
export const HONOR_SETS = ['verb', 'noun', 'particle', 'si'] as const      // phenomenon
export type LevelSet = (typeof LEVEL_SETS)[number]
export type HonorSet = (typeof HONOR_SETS)[number]
export type RegisterSet = LevelSet | HonorSet
// NB: in `level` mode `set === target` by construction (the focus IS the target register);
// `set` and `target` carry different roles only in `honor` mode (phenomenon vs output register).

export interface RegisterItem {
  /** Korean source sentence to transform. NOT translated. */
  source: string
  mode: RegisterMode
  /**
   * Speech level the CORRECT answer sits in.
   * level mode: the target register to produce.
   * honor mode: the register the honorific output uses
   *   (해요체 주무세요 vs 합쇼체 주무십니다 — both honorific, different levels).
   */
  target: SpeechLevel
  /** Focus set for the picker + mastery. Must be a valid set for `mode`. */
  set: RegisterSet
  /** The correct transformed sentence. NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong transforms. NOT translated; valid Hangul; ≠ answer and pairwise distinct. */
  distractors: [string, string, string]
  /** Meaning — unchanged across the transform (the transform is form-only). */
  trans: LocalizedString
  /** One line: what the transform requires, e.g. "께서 + 주무시다 + -십니다". */
  why: LocalizedString
}
```

## Seed structure (`app/seed/register-transform/`)

- `level.ts` → `LEVEL_ITEMS: RegisterItem[]` (~20). `honor.ts` → `HONOR_ITEMS: RegisterItem[]` (~28).
- `index.ts` → `export const REGISTER_ITEMS: RegisterItem[] = [...LEVEL_ITEMS, ...HONOR_ITEMS]`.
- Authored with the positional 8-locale `L(en, es, fr, ptBR, th, id, vi, ja)` helper from
  `app/seed/locale.ts`. Each file carries a header docblock: provenance (spine `honorificVocab` +
  authored sentences), the adversarial-verification note, and the native-review gate.
- Korean sentences (`source`, `answer`, `distractors`) are bare `string` (never translated);
  `trans`/`why` are `LocalizedString`.

### Content anchor — spine `honorificVocab` (`app/seed/topik-spine.json`, read by nothing today)

`honor` mode is seeded from this verified table:

- **verbs (10):** 먹다/마시다→드시다/잡수시다 · 자다→주무시다 · 있다→계시다 · 없다→안 계시다 ·
  말하다→말씀하시다 · 죽다→돌아가시다 · 아프다→편찮으시다 · 주다→드리다 · 묻다→여쭤보다/여쭙다 · 보다→뵙다
- **nouns (6):** 이름→성함 · 나이→연세 · 집→댁 · 밥/음식→진지 · 말→말씀 · 생일→생신
- **particles (2):** 이/가→께서 · 에게/한테→께
- **`si` set** = the *regular* `-(으)시-` infix on non-suppletive verbs (가다→가세요/가십니다,
  오다→오세요/오십니다, 읽다→읽으세요/읽으십니다) — the productive rule, distinct from suppletion.

`level` mode may reuse the `byLevel` forms of the 14 formality-slider sentences
(`app/seed/particle-sentences.ts`) as an authoring quarry for natural 반말/해요체/합쇼체 triples.

## Sets & mastery

Top-level switch = the two **modes** (`?mode=level|honor`, default `level`). Within a mode, a **set
picker** (`?set=`, like the conjugation class-focus) whose sets double as **mastery units**:

| Mode | Sets (= mastery units) |
|---|---|
| `level` (말단계) | `formal` (합쇼체로) · `polite` (해요체로) · `casual` (반말로) |
| `honor` (높임말) | `verb` · `noun` · `particle` · `si` |

**7 units total.** Clearing a set at round accuracy ≥ 0.7 marks it cleared (idempotent, sticky-earned);
clearing all 7 fires the one-shot **높임법 마스터** celebration — exactly `useConjugationMaster`'s pattern
(`CLEAR_THRESHOLD = 0.7`, `register-lab.cleared` / `register-lab.masterEarned`). `mixed` per mode is a
play mode that does not count toward mastery.

## Pure lib (`app/lib/register-transform/`)

- `sets.ts` — `LEVEL_SETS`/`HONOR_SETS` set definitions (`{ id, mode, ko, mastery: boolean }`),
  `setsForMode(mode)`, `isValidSet(mode, set)`. Korean labels live here.
- `drill.ts` — pure, no Vue/i18n:
  - `itemsFor(mode, set?, source = REGISTER_ITEMS): RegisterItem[]` (filter by mode, optional set).
  - `buildRound(mode, set, size, shuffle): RegisterItem[]` (sample a round).
  - `optionsFor(item): string[]` = `[answer, ...distractors]` (order stable; shuffled by the view).
  - `scoreOf(results): { correct, total, accuracy }` (accuracy 0 when empty).
  - No distractor generator — distractors are authored (the engine can't produce honorific forms).
    Verification cross-checks the *regular* (non-suppletive) distractor forms against the engine.

## Composables

- `useRegisterDrill.ts` — round engine cloned from `useConjugationDrill`: refs `mode`, `selectedSet`,
  `sessionItems`, `displayOptions`, `runMode` (`'normal'|'replay'`), `index`, `phase`
  (`'question'|'right'|'wrong'|'done'`), `picked`, `results`; computed `item`, `score`, `failedItems`.
  `start()`, `answer(choice)` (logs a mistake only when wrong **and** `runMode==='normal'`), `next()`,
  `replayFailed()`, `selectMode(m)`, `selectSet(s)`. `ROUND_SIZE = 8`. Context constants
  `LAB_CONTEXT = { id: 'register-lab', name: '높임법 LAB' }`.
- `useRegisterMaster.ts` — cloned from `useConjugationMaster`: `STORAGE_KEY='register-lab.cleared'`,
  `EARNED_KEY='register-lab.masterEarned'`, `CLEAR_THRESHOLD=0.7`, `recordRound(set, accuracy)`
  (idempotent add when ≥0.7; one-shot `celebrate` + sticky earned when all 7 sets cleared). `mixed`
  is excluded from mastery.

## Page (`app/pages/practice/register.vue`)

Thin orchestrator, `definePageMeta({ surface: 'game' })`. Reads `route.query.mode` / `route.query.set`,
seeds the drill, keeps the URL in sync with `router.replace`. `GameExitButton` + `GameLeaveConfirm` +
`useGameLeaveGuard(() => started && phase !== 'done')`. Template: `BilingualTitle ko="높임법 연구소"` →
lead paragraph → always-visible `RegisterMasterStrip` → `ModeTabs` (level/honor) → either `SetPicker`
(when not started) or the active round (`ProgressDots` + `RegisterCard` until `done`, then
`RegisterSummary`) → `RegisterMasterCelebration` overlay when `master.celebrate`.

## Components (`app/components/register-drill/`)

Cloned from `app/components/conjugation-drill/`:
- `ModeTabs.vue` — two-tab switch (말단계 / 높임말), `aria-pressed`, emits `select(mode)`.
- `SetPicker.vue` — chip group over the current mode's sets (Korean labels), `aria-pressed`,
  `data-testid="register-set-${id}"`, emits `select(set)`.
- `RegisterCard.vue` — source sentence + transform prompt + 4 `RegisterOption`s; `optionState(opt)`
  → `'idle'|'correct'|'wrong'|'muted'`; reveal shows verdict + correct answer + `why` + `trans` + Next;
  `tabindex="-1"` + `.focus()` on mount and per question.
- `RegisterOption.vue` — one option button, `lang="ko"`, `min-height:44px`, `:focus-visible` ring.
- `RegisterSummary.vue` — score + missed list (`source → answer`) + "🔁 Review mistakes (n)" when
  `failedItems.length` (emits `replay-failed`) + restart.
- `RegisterMasterStrip.vue` — 7 set pips (cleared/not), mirrors `ConjugationMasterStrip`.
- `RegisterMasterCelebration.vue` — one-shot modal, focus-trap (mirrors `ui/Modal.vue`),
  `<h2 lang="ko">높임법 마스터!</h2>`.

Korean text uses `lang="ko"` + `var(--font-ko)` (Noto Sans KR). Fonts/colors/a11y follow the
conjugation-lab conventions (Press Start 2P chrome, Inter prose, `--jade`/`--danger` reveal, 1fr/1fr→1fr
option grid under 480px, `role="status"` live region, `data-testid` on every interactive node).

## Mistake-feed

On a wrong pick in `normal` run mode, `useRegisterDrill` calls `useLogStore().add`:

```ts
await logStore.add({
  ko: item.source,
  sentence: `${item.source} → ${item.answer}`,           // synthetic context
  feedback: 'hard',
  errorNote: t('register.diary_note', { chosen, correct: item.answer }),
  errorDimension: 'register',                             // the diary axis that is empty today
  reviewState: 'incorrect',
  contextId: 'register-lab',
  contextName: '높임법 LAB',
})
```

`errorDimension: 'register'` already exists in `ERROR_DIMENSIONS` (`app/lib/domain/log.ts`) — no type
change. Replays (`runMode==='replay'`) do not re-log. No SRS-catalog coupling (`logStore.add` is a pure
append).

## Hub & i18n

- `app/pages/practice/index.vue` — add `<GameCard to="/practice/register" :name="t('games.register.name')"
  :description="t('games.register.desc')" emoji="🙇" />`, replacing the `locked` `games.third`
  placeholder. (Nav/sidebar are **not** touched — drills are reached only via the `/practice` hub;
  `/practice/register` is auth-gated automatically by absence from `PUBLIC_PATHS`.)
- `i18n/locales/*.json` ×8 — a top-level `register.*` block (prompts `prompt_level`/`prompt_honor`,
  `correct`/`wrong`, `reveal_correct`, `diary_note` with `{chosen}`/`{correct}`, `summary_score` with
  `{correct}`/`{total}`, `replay_*`, `mode_level`/`mode_honor`, `set.*` labels, `master.*`) plus
  `games.register.{name,desc}`. Korean speech-level terms (합쇼체/해요체/반말, 높임법) stay literal Hangul
  in all 8 locales (brand mannerism, like 반말/화이팅); descriptive glosses are translated. Where both
  show, use "gloss · 한국어" (e.g. "Formal · 합쇼체").

## Content + verification pipeline

1. **Draft** — a Claude Workflow drafts the ~48 items: `honor` from the spine `honorificVocab` rows
   (each verb/noun/particle → items in 해요체 and 합쇼체 honorific targets), `level` from authored /
   slider-quarried sentences across the three registers. Each item: `source`, `answer`, exactly 3
   `distractors`, `why`, 8-locale `trans`.
2. **Verify (adversarial, Korean-lens)** — per item: (a) the source is natural and **exactly one
   option is correct**; (b) all 3 distractors are *plausible but genuinely wrong* (a real learner
   error, not ambiguous); (c) suppletion/께서/`-(으)시-` are linguistically correct and the **speaker is
   never self-honorified**; (d) 8-locale `trans`/`why` fidelity; (e) regular (non-suppletive) distractor
   forms cross-checked against `conjugate()` from `~/lib/korean`. Ambiguous items are rewritten until a
   single answer is defensible.
3. **Durable guard** — the seed-invariant tests below. No runtime AI tool.
4. **Native-review gate** — documented: the wife reviews the seeded batch; edits land as commits.

## Testing (TDD)

- `tests/unit/register-transform/seed-invariants.test.ts` — `it.each` over `REGISTER_ITEMS`:
  `source`/`answer` valid Hangul and `source !== answer`; exactly 3 distractors, each valid Hangul,
  pairwise distinct and `≠ answer`; `mode ∈ {level,honor}`; `target ∈ SpeechLevel`; `set` valid for its
  `mode`; `trans`/`why` have all 8 `LOCALE_CODES` non-empty. Coverage loop: each of the 7 sets has
  ≥ 4 items; totals ≈ 20 `level` / ≈ 28 `honor`; every `honorificVocab` verb/noun/particle appears in
  at least one `honor` item. Approximate per-set split (a sizing target, not a hard assert):
  `level` formal ≈ 7 / polite ≈ 7 / casual ≈ 6; `honor` verb ≈ 12 (covers the 10 suppletive verbs,
  some with two forms e.g. 드시다/잡수시다) / noun ≈ 6 / particle ≈ 4 / si ≈ 6.
- `tests/unit/register-transform/drill.test.ts` — `itemsFor` (filter by mode/set), `buildRound`
  (size, mode/set respected), `optionsFor` (= `[answer, ...distractors]`), `scoreOf` (accuracy, empty),
  `setsForMode`/`isValidSet`.
- `tests/components/register-drill/RegisterCard.test.ts` — renders prompt + 4 options; wrong pick
  reveals `why` + `register.wrong`; advancing through items reaches the summary/restart.
  `SetPicker`/`ModeTabs` emit on click. (`$t` identity mock as in `PairDrill.test.ts`.)
- `tests/unit/register-transform/i18n-keys.test.ts` — "same-as-en" parity for the top-level `register.*`
  block ×8; explicit `.toContain('{correct}')`/`'{total}'` for `diary_note` and `summary_score`;
  `games.register.{name,desc}` present in all 8.
- (Quality gate, not a unit test) the Korean-lens verification Workflow over the seeded batch.
- Full suite + `typecheck` + `lint` green. Manual (logged-in) smoke: both modes switch, set picker
  filters rounds, mastery pips fill at ≥0.7, wrong picks land in `/log` under the `register` dimension,
  replay-failed re-runs misses, level persists across navigation.

## Acceptance criteria

1. `RegisterMode`/`RegisterItem` + set defs in `app/lib/domain/register.ts` (re-exported); static
   `app/seed/register-transform/` with ~20 `level` + ~28 `honor` verified items; `itemsFor`/`buildRound`/
   `scoreOf`/set helpers pure + tested.
2. `/practice/register` lab: two modes via `?mode=`, set picker via `?set=`, recognition rounds, 높임법
   마스터 mastery, replay-failed, and mistake-feed logging with `errorDimension='register'`; surfaced via a
   `GameCard` in the `/practice` hub.
3. Seed invariants hold; content passed the Korean-lens verification (single-correct-answer per item,
   no self-honorification); native-review gate documented.
4. `pnpm test` / `typecheck` / `lint` green; engine + grammar seeds + Supabase untouched; no migration/DB.

## Out of scope (YAGNI)

- 객체높임 beyond the listed suppletion; 하게체/하오체/해라체 production; typed/free-production input;
  feeding the drill into the production loop (`session.ts`); a DB table/migration or a `register`
  column; TTS of the sentences; adding the orphaned spine `SL007 -(으)시-` as a catalog `Grammar`
  entry (it's lab content, not a grammar point — possible follow-up); scaling beyond the ~48-item batch.
