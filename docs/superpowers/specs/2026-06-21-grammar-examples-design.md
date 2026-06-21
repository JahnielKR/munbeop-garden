# grammar_examples bank — design

_Created 2026-06-21. Roadmap **Step 6** (Phase 1 content spine) of
`docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Builds on Step 5 (engine,
merged) and Step 5b (merged). Effort: M code / L authoring (authoring is the long pole)._

## Goal

Break the single-example-per-point limit. Today every `Grammar` carries at most one
`example`/`trans` (`app/lib/domain/grammar.ts`). This bank gives each grammar point **multiple
register-tagged example sentences** with 8-locale translations, surfaced in the study sheet —
the content spine that later unlocks register-transform (Step 8), cloze (Step 9), and audio
(Step 10). This spec ships the model + UI + authoring/verification process + a verified first
batch (TOPIK-1 core).

## Decisions (locked via brainstorm)

1. **Static TS catalog, NOT a Supabase table.** Examples are read-only reference content with
   no user-authored variant (unlike grammars, which need the `user_custom_grammars` union), so
   they need no migration/RLS/adapter/sync. Mirrors the Particle Lab "static catalog, zero SQL"
   pattern and avoids the SupabaseAdapter "throws on unmapped keys" gotcha. (Deliberately
   diverges from the roadmap's literal `public.grammar_examples` DB spec.)
2. **Reuse `SpeechLevel`** (`'formal' | 'polite' | 'casual'` → chip labels 합니다체 / 해요체 / 반말,
   the same labels the formality slider already uses) as the register axis — the same enum the formality slider and conjugation drill use. No new
   register enum. Drop the roadmap's `topikLevel` field (derivable from the grammar).
3. **Keep the existing `example`/`trans` field.** Migrating all six seed files into the bank is
   out of scope for an TOPIK-1-first batch. The new section prefers the bank and **falls back to the
   canonical `example`/`trans`** so non-batch points still show a real example.
4. **Content gate:** AI-draft (Claude Workflow) → multi-agent Korean adversarial verification +
   Step-5 engine conjugation check → seed the verified batch. The user's Korean-native wife's
   review is the documented FINAL gate (her edits land as commits). No runtime API tool.
5. **First batch = TOPIK-1** (`grammars-n1.ts` — the repo's `n1..n6` suffix is the TOPIK level,
   so n1 is the beginner set, not n5), ~12 foundational **verb-ending/expression** points ×
   ~3 examples (≈36). Particles (은/는, 이/가, …) are skipped here — Particle Lab already covers
   them; the value is on the endings, where examples show the pattern in context and the engine
   verifies the conjugated surface forms.

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/domain/grammar.ts` | + `interface GrammarExample { ko: string; sentence: string; trans: LocalizedString; level: SpeechLevel }`. (`SpeechLevel` is already exported from domain.) |
| `app/seed/grammar-examples/n1.ts` | The TOPIK-1 batch: `GrammarExample[]`, authored with the `L(...)` 8-locale helper (`app/seed/locale.ts`). One file per level; only `n1.ts` this batch. |
| `app/seed/grammar-examples/index.ts` | Aggregates the per-level arrays into `GRAMMAR_EXAMPLES: GrammarExample[]`. |
| `app/lib/grammar-examples/index.ts` | Pure: `examplesFor(ko, opts?): GrammarExample[]` — filters by ko, sorts formal→polite→casual (stable within a level), caps to `MAX_EXAMPLES` (4). |
| `app/components/library/GrammarStudySheet/ExamplesSection.vue` | Renders the bank (or the canonical fallback); replaces the "examples" `ComingSoonSection`. |
| `app/components/library/GrammarStudySheet.vue` | Swap the examples `ComingSoonSection` for `ExamplesSection`. |
| `tests/unit/grammar-examples/*`, `tests/components/library/ExamplesSection.test.ts` | Pure-logic + seed-invariant + component tests. |
| i18n locales ×8 | Register-label keys (`library.examples.level_*`) + a section title key if not present. |

The engine (`app/lib/korean/`) is untouched. No `supabase/migrations/` change. No store/adapter
change (it's a direct static import, like `PARTICLE_SENTENCES`).

## The example model

```ts
export interface GrammarExample {
  ko: string                 // FK → Grammar.ko (the v1 stable id); NOT translated
  sentence: string           // the Korean example sentence; NOT translated
  trans: LocalizedString     // L(en, es, fr, pt, th, id, vi, ja)
  level: SpeechLevel         // 'formal' | 'polite' | 'casual'
}
```

- A point's ~3 examples span registers where natural; for register-neutral patterns, vary the
  content/vocabulary instead of forcing an unnatural register, but still tag the actual level
  of each sentence's predicate.
- Any conjugated verb form inside a sentence must be conjugation-correct — checked against the
  Step-5 engine during verification.

## Study-sheet rendering (`ExamplesSection.vue`)

- Props: `grammar: Grammar`. Computes `examplesFor(grammar.ko)`.
- **If bank examples exist:** render each as a row — Korean `sentence` (`lang="ko"`), the
  localized `trans` (via the existing `useLocalized`/`tl` helper), and a small **register chip**
  using the SAME Korean labels as the formality slider — **합니다체** (formal) / **해요체**
  (polite) / **반말** (casual), `lang="ko"`. Reuse study-sheet section styling + the #11 QA
  conventions (semantic tokens, `lang`, AA contrast, no raw hex).
- **Else if `grammar.example` exists:** render that single canonical example + its `trans`
  (one row, no register chip) — so points outside the batch still show a real example.
- **Else:** render nothing (the section is omitted) — no more "coming soon" for examples.
- Section title reuses `library.modal.section.examples`.

## Authoring + verification pipeline

- **Draft:** a Claude Workflow drafts ~3 register-tagged examples per TOPIK-1 point, using each
  point's `meaning`/`usageNotes` as context and the Step-5 engine for correct surface forms,
  emitting the `GrammarExample` rows with 8-locale `trans`.
- **Verify:** a multi-agent Korean adversarial Workflow (3 lenses — grammaticality/naturalness,
  register-tag accuracy, 8-locale translation fidelity), mirroring the Particle Lab content
  verification. Flagged rows are fixed before seeding.
- **Durable guard (the repeatable "tool"):** seed-invariant tests (below) — the runnable gate
  that any future batch must pass. No runtime API tool (fits the no-server SPA ethos).
- **Native-review gate:** documented — the user's wife reviews the seeded TOPIK-1 batch; edits land
  as commits. The two enforced gates are the verification Workflow + her human pass.

## First batch (TOPIK-1 verb endings)

12 verb-ending/expression patterns, all confirmed present in `grammars-n1.ts` (exact `ko`):
`-아/어요`, `-았/었어요`, `-ㅂ/습니다`, `-(으)세요`, `-(으)ㄹ 거예요`, `-고`, `-아/어서`, `-지만`,
`-(으)면`, `-ㄴ/는데`, `-고 싶다`, `-고 있다`. ~3 examples each (≈36), register-spanning where
natural. (Drop/swap a row only if a content-verification problem makes it unworkable.)

## Testing (TDD)

- `tests/unit/grammar-examples/examples-for.test.ts` — `examplesFor`: filters by ko; sorts
  formal→polite→casual; caps at 4; unknown ko → `[]`.
- `tests/unit/grammar-examples/seed-invariants.test.ts` — `it.each` over `GRAMMAR_EXAMPLES`:
  every `ko` resolves to a catalog `Grammar`; `trans` has all 8 locales non-empty; `level` ∈
  the `SpeechLevel` set; `sentence` is valid Hangul (allow spaces + sentence punctuation);
  every batched point has ≥2 examples.
- `tests/components/library/ExamplesSection.test.ts` — renders N bank rows with sentence/trans/
  register chip; falls back to the canonical example when no bank rows; renders nothing when
  neither exists.
- i18n parity test for the new `library.examples.*` keys across all 8 locales.
- (Quality gate, not a unit test) the Korean-lens verification Workflow over the seeded batch.

## Acceptance criteria

1. `GrammarExample` type added; static catalog `app/seed/grammar-examples/` with a verified TOPIK-1
   batch (~10–12 points × ~3); `examplesFor(ko)` pure + tested.
2. Study sheet shows real register-tagged examples for batched points; falls back to the
   canonical example otherwise; no "examples coming soon" placeholder remains.
3. Seed invariants hold (ko-in-catalog, 8-locale trans, valid level, valid Hangul); content
   passed the Korean-lens verification Workflow.
4. `pnpm test` / `typecheck` / `lint` green; engine untouched; no migration; no DB/adapter change.

## Out of scope

DB table / migration / RLS; scaling beyond TOPIK-1; migrating the existing canonical examples into
the bank; audio (Step 10); cloze (Step 9); register-transform drill (Step 8); a runtime
AI-drafting tool; honorific suppletion.
