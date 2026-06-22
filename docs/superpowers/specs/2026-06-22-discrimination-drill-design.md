# Confusable-pair discrimination — design

_Created 2026-06-22. Roadmap **Step 7** (Phase 2) of
`docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Builds on Step 6 (study sheet
ExamplesSection, merged). Effort: S–M code / M content (curation is the cost)._

## Goal

Help learners tell near-interchangeable grammar patterns apart. Two parts, both anchored in the
**study sheet**: (1) "often confused with" relation chips per grammar point, and (2) a
lightweight inline **discrimination drill** ("which one fits here?") over each confusable pair.
Scope is grammar/ending pairs — particle-pair discrimination already lives in Particle Lab's
Choque, so this does not duplicate it.

## Decisions (locked via brainstorm)

1. **Study-sheet-centric**, not a standalone game and not woven into the production practice
   loop (`session.ts`). Avoids a 3rd recognition game and keeps discrimination in the study
   context. The drill is an inline, expandable panel in the study sheet.
2. **Static TS catalog** of pairs (no DB/migration) — mirrors grammar-examples; relations are
   read-only reference data with no user variant.
3. **Self-contained drill** — no SRS, no mistake-feed logging (quick self-test in context).
   (Roadmap's "feed errorDimension into pair selection" is a later concern; not in v1.)
4. **First batch = 4 verified beginner grammar/ending pairs** (id → a vs b):
   - `an-mot` — `안 + V / -지 않다` vs `못 + V / -지 못하다` (not-by-choice vs cannot)
   - `aseo-nikka` — `-아/어서` vs `-(으)니까` (the two "because")
   - `go-aseo` — `-고` vs `-아/어서` (plain listing vs causal/sequential)
   - `goitda-aitda` — `-고 있다` vs `-아/어 있다` (ongoing action vs resulting state)
   The `a`/`b` ko strings must match `grammars-n{1,2,3}.ts` verbatim (note members may span TOPIK
   levels — relations cross levels; -(으)니까 is n2, -아/어 있다 is n3, the rest n1).
5. **AI-draft + Korean-lens adversarial verification + engine conjugation check**; native (wife)
   review is the documented final gate (same pipeline as Step 6).

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/domain/grammar.ts` | + `ConfusablePair` + `DiscriminationItem` interfaces (below). |
| `app/seed/grammar-pairs/n1.ts` | The first batch: `ConfusablePair[]`, authored with `L(...)`. |
| `app/seed/grammar-pairs/index.ts` | Aggregates → `GRAMMAR_PAIRS: ConfusablePair[]`. |
| `app/lib/grammar-pairs/index.ts` | Pure: `pairsFor(ko)` (pairs containing ko + which side), `relatedKos(ko)` (the other members, for chips). |
| `app/components/library/GrammarStudySheet/ConfusedWithSection.vue` | Per-pair chip + `note` + a "Test yourself" toggle that mounts the inline drill. Renders nothing if the point has no pairs. |
| `app/components/library/GrammarStudySheet/PairDrill.vue` | The inline 2-choice cloze drill for one pair. |
| `app/components/library/GrammarStudySheet.vue` | Render `ConfusedWithSection` (after `ExamplesSection`). |
| `tests/unit/grammar-pairs/*`, `tests/components/library/{ConfusedWithSection,PairDrill}.test.ts` | pure + invariant + component tests. |
| `i18n/locales/*.json` | `library.confused.*` keys ×8. |

The Step-5 engine, the grammar seeds, and Supabase are untouched. No migration, store, or adapter.

## Types

```ts
export interface DiscriminationItem {
  /** Korean sentence with the literal blank marker "{}" where the pattern goes. */
  sentence: string
  /** Surface form of pattern A in this sentence (e.g. 와서). */
  optionA: string
  /** Surface form of pattern B in this sentence (e.g. 오니까). */
  optionB: string
  /** Which option is correct/natural here. */
  answer: 'a' | 'b'
  trans: LocalizedString
  /** One-line reason the answer fits and the other doesn't. */
  why: LocalizedString
}

export interface ConfusablePair {
  /** Stable id, e.g. 'an-mot'. */
  id: string
  /** Member A — a Grammar.ko. */
  a: string
  /** Member B — a Grammar.ko. */
  b: string
  /** How the two differ (shown with the chips). */
  note: LocalizedString
  items: DiscriminationItem[]
}
```

`'a'`/`'b'` index the pair's members; `optionA`/`optionB` are the surface fills for A/B in that
item. This handles both pre-verbal pairs (안/못 → options "안"/"못") and connective pairs
(-아/어서 vs -(으)니까 → options "와서"/"오니까").

## Pure lib (`app/lib/grammar-pairs/index.ts`)

- `pairsFor(ko, source = GRAMMAR_PAIRS): { pair: ConfusablePair; selfSide: 'a'|'b'; otherKo: string }[]`
  — every pair containing `ko`, with which side `ko` is and the other member's ko.
- `relatedKos(ko, source = GRAMMAR_PAIRS): string[]` — the deduped other-member kos (chip list).

## Study-sheet UI

**`ConfusedWithSection.vue`** (props: `grammar`):
- `const rows = pairsFor(grammar.ko)`. If empty → render nothing.
- Section title `library.confused.title`. For each row: a chip line — `library.confused.chip`
  with the other ko (`lang="ko"`), the localized `note`, and a "Test yourself" toggle
  (`library.confused.test_cta`) that mounts `<PairDrill :pair="row.pair" />` inline.
- Korean text uses 'Noto Sans KR'; section conventions mirror `ExamplesSection`/`UsageNotesSection`
  (Press Start 2P latin title, --ink/--ink-soft/--ink-line palette).

**`PairDrill.vue`** (props: `pair`):
- Local state: current item index, picked option, revealed flag, score.
- Renders the item's `sentence` with `{}` shown as a blank chip (revealed → the chosen fill);
  two option buttons (`optionA`, `optionB`, `lang="ko"`); on pick → reveal correct/wrong styling
  + the localized `why` + `trans` + a Next button; after the last item, a tiny "n/total" score +
  a restart. No SRS/log. a11y: option buttons have accessible names; reveal has `role="status"`.

## Content + verification pipeline

- **Draft:** a Claude Workflow drafts the 4 pairs — each with a `note` and ~3 discrimination
  items (sentence with `{}`, both surface options, the correct answer, `why`, 8-locale `trans`),
  using each member's catalog `meaning`/`usageNotes` as context and the Step-5 engine for correct
  surface forms.
- **Verify (adversarial, Korean-lens):** per item — (a) the sentence is natural and **exactly
  one option fits** (the other is genuinely wrong/less natural in that context, not merely
  ambiguous); (b) `note`/`why` are linguistically correct; (c) 8-locale translation fidelity;
  (d) the option surface forms are conjugation-correct. Ambiguous items are rewritten until a
  single answer is defensible. The "only one fits" check is the crux — discrimination items must
  not be ambiguous.
- **Durable guard:** the seed-invariant tests (below). No runtime AI tool.
- **Native-review gate:** documented — the wife reviews the seeded batch; edits land as commits.

## Testing (TDD)

- `tests/unit/grammar-pairs/pairs-for.test.ts` — `pairsFor` (membership, `selfSide`/`otherKo`
  correct, bidirectional), `relatedKos` (deduped, unknown ko → []).
- `tests/unit/grammar-pairs/seed-invariants.test.ts` — `it.each` over `GRAMMAR_PAIRS`: `a`,`b` ∈
  `DEFAULT_GRAMMAR`; `a !== b`; each item `sentence` contains `"{}"`; `answer` ∈ {a,b};
  `optionA`/`optionB` non-empty + valid Hangul; `note`/`why`/`trans` have all 8 locales non-empty;
  each pair has ≥2 items; all 4 target pair ids present.
- `tests/components/library/ConfusedWithSection.test.ts` — renders a chip + note + test toggle
  when the point has a pair; renders nothing when it has none; toggle mounts the drill.
- `tests/components/library/PairDrill.test.ts` — renders the cloze + 2 options; picking the wrong
  option reveals correct styling + `why`; advancing through items reaches the score.
- i18n parity test for `library.confused.*` keys ×8.
- (Quality gate, not a unit test) the Korean-lens verification Workflow over the seeded batch.

## Acceptance criteria

1. `ConfusablePair`/`DiscriminationItem` types + static `app/seed/grammar-pairs/` with 4 verified
   pairs; `pairsFor`/`relatedKos` pure + tested.
2. Study sheet shows "confused with" chips + note for points in a pair, and an inline 2-choice
   discrimination drill per pair; renders nothing for points with no pairs.
3. Seed invariants hold; content passed the Korean-lens verification (single-answer-per-item).
4. `pnpm test` / `typecheck` / `lint` green; engine + grammar seeds untouched; no migration/DB.

## Out of scope

DB table/migration/relations column on grammars; particle-pair discrimination (Particle Lab);
SRS or mistake-feed logging from the drill; scaling beyond the 4 pairs; the production-loop
choice-card integration; honorific suppletion; cloze beyond 2-choice.
