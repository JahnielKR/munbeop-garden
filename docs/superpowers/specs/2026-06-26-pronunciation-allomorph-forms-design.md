# Pronunciation: multi-form allomorphs in the study sheet

**Date:** 2026-06-26
**Status:** Approved (design)
**Workstream:** 1 of 3 in the "library polish" epic (pronunciation → achievement icons → usage notes)

## Problem

The study sheet's pronunciation section sounds a grammar point out syllable by
syllable from `PronunciationGuide.parts: string[]` — a **single** spoken form.
Grammars whose citation shows two (or more) allomorphs of the same morpheme
(은/는, 이/가, 을/를, (으)로, -아/어요, …) only carry **one** realization, so the
learner can only hear one form. Tapping the `은/는` study sheet plays `는`, never
`은`. The audio for both forms already exists on disk; the data model just can't
reference a second form.

## Scope — which guides get multiple forms

A guide gets multiple `forms` **iff** its `ko` citation denotes 2+ allomorph
realizations of the **same morpheme**, each realization being a sequence of
**complete Hangul syllables**. Three tiers qualify:

1. **Particle pairs (full syllable each):** 은/는, 이/가, 을/를.
2. **Epenthetic `(으)`/`(이)` before a full syllable** — the with-vowel and the
   bare realization: (으)로 → 으로 | 로; -(으)면 → 으면 | 면; (이)나 → 이나 | 나;
   -(으)세요, -(으)니까, -(으)려고, -(으)면서, (이)라도, -(으)로서, -(으)며, -(으)나, … .
3. **Vowel-harmony `아/어` and `았/었`** — both realizations: -아/어요 → 아요 | 어요;
   -았/었어요 → 았어요 | 었어요; -아/어 보다 → 아 보다 | 어 보다; … .

Explicitly **out of scope** (stay single-form, a deliberate didactic choice — not
a bug):

- **Jamo-fusing alternations** where one realization is a bare jamo that fuses
  onto the stem and cannot be sounded standalone: ㄴ/는 (-ㄴ/는데), ㅂ/습 (-ㅂ/습니다),
  (으)ㄹ (-(으)ㄹ 거예요), (으)ㄴ (-(으)ㄴ 후에). Keep the soundable form (는, 습니다, 을, 은).
- **Synonym listings** (different lexemes, not allomorphs): 에게/한테/께, -처럼/-같이,
  -(으)로서/-(으)로써 (로써 variant), 가다/오다, 놓다/두다, … . Keep the single spoken
  representative. Where a synonym listing also contains internal allomorphy (e.g.
  the chosen representative carries `(으)`), only that representative's allomorphy
  is split (으로서 | 로서), not the synonym alternatives.
- **Optional sentence-final parens** ((요), (서), (가), (고)): dropped as before.

Count: **66 multi-form guides** across the 6 levels (T1 13, T2 12, T3 12, T4 13,
T5 9, T6 7). The remaining ~120 guides are mechanically wrapped to a single form.

Forms are ordered as the citation reads left-to-right (은 then 는; 으로 then 로;
아요 then 어요).

## Data model

```ts
// app/lib/domain/pronunciation.ts
export interface PronunciationForm {
  /** This spoken realization's syllables, in order — each one Hangul syllable. */
  parts: string[]
}
export interface PronunciationGuide {
  /** Grammar.ko this guide is for (must match a catalog entry). */
  ko: string
  /** One entry per cleanly-soundable allomorph form. 1 for most; 2+ for true
   *  alternants like 은/는. */
  forms: PronunciationForm[]
}
```

Every existing `{ ko, parts: [...] }` becomes `{ ko, forms: [{ parts: [...] }] }`;
the 66 alternants get `forms: [{ parts: [...] }, { parts: [...] }]`.

## Components / data flow

- `app/lib/pronunciation/index.ts` — `allSyllables()` flattens
  `forms.flatMap(f => f.parts)` (was `g.parts`). `guideFor` unchanged.
- `app/lib/pronunciation/audio.ts` — unchanged (per-syllable hash player).
- `tools/pronunciation-audio/build_manifest.mjs` — unchanged: its regex already
  scans every inner `parts: [...]` array, so nested `forms` are picked up.
- `app/components/library/GrammarStudySheet/PronunciationSection.vue` — render one
  chip group **per form**, each with its own "play all" ▶. A single-form guide
  looks identical to today; a two-form guide stacks two chip rows. `playAll` is
  called with that form's parts only — it never concatenates across forms (no
  "은는").

## Audio

Tier 1 + Tier 2 introduce **no new syllables** (은/이/을 and every bare form already
appear elsewhere in the seed). Tier 3 introduces exactly one new syllable: **았**
(the 아-past, e.g. 았어요). After the migration: rebuild the manifest
(`node tools/pronunciation-audio/build_manifest.mjs`) and generate the one missing
clip with the existing edge-tts pipeline. Manifest grows 179 → 180.

## Tests / invariants

`tests/unit/pronunciation/seed-invariants.test.ts`:
- Iterate `g.forms.flatMap(f => f.parts)` instead of `g.parts`.
- Each guide has ≥1 form; each form has ≥1 part; each part is one Hangul syllable.
- The two forms of a guide are distinct.
- **Auto pair-rule:** a `ko` matching `^[가-힣]/[가-힣]$` (은/는, 이/가, 을/를) has ≥2 forms.
- **Lower-bound guard:** at least 60 guides have >1 form (catches an accidental
  flatten/regression).

`tests/unit/pronunciation/audio-manifest.test.ts` — unchanged (reads
`allSyllables()`); stays green once 았 is generated.

New `tests/components/library/PronunciationSection` test: a two-form guide renders
two chip groups and two play-all buttons; a single-form guide renders one.

No new i18n keys (the `by_parts` label and section title are reused).

## Quality gate

The 66 decompositions are Korean-content, so after encoding they go through an
adversarial Korean-linguistics verification pass (completeness sweep for any
missed alternant + per-entry correctness of each form), then carry the existing
"PENDING wife native-review" status in the seed headers.

## Out of scope (this workstream)

Achievement icons (workstream 2) and usage notes (workstream 3) are separate
specs. Synonym-variant audio and 아/어 contraction surface-forms are possible
future follow-ups, intentionally deferred.
