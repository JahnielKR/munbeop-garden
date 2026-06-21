# Contractions judge — design

**2026-06-20 · Subproject 5 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming, ready for writing-plans.**

## Goal

Add a **"축약 (contractions)"** set to the Choque drill that teaches the subject-particle
contractions where the pronoun fuses with 가:

| pronoun | + 가 → | trap (naive) |
|---|---|---|
| 나 | 내가 | 나가 |
| 저 | 제가 | 저가 |
| 너 | 네가 | 너가 |
| 누구 | 누가 | 누구가 |

A new `contraction` verdict fires when the learner picks the naive uncontracted form
(e.g. 나가), letting them retry with an explanation — reusing the existing drill flow
(set picker, shuffle/replay, summary, SRS, diary). 너→네가 carries a note that it is
colloquially pronounced 니가.

## Why a deliberate design (not a normal clash item)

The drill's `correctSentence` naively concatenates `lead + noun + form + rest`
(나 + 가 = 나가), and the learner picks a *particle* form (은/는/이/가). A contraction
**fuses the stem** (나→내), so it cannot be expressed by picking a particle, and naive
concatenation produces the wrong surface (나가). Contractions therefore need:
1. item-specific **full-form** options (내가 vs 나가), not the set-wide particle options;
2. sentence assembly that uses the contracted subject in place of `noun + form`;
3. a distinct verdict so the card can show the contraction rule, not the 받침 rule.

## Current state (what exists)

- `app/lib/particle-lab/drill.ts` — `deriveOptions(set)` (set-wide), `correctForm(item,set)`,
  `correctSentence(item,set)` = `lead+noun+form+rest`, `judge` → `correct | blocked | wrong-family`.
- `app/lib/domain/particles.ts` — `ClashSet { id, name, families: [ClashFamily, ClashFamily] }`;
  `DrillVerdict = correct | blocked | wrong-family`; `DrillItem { id, cue, lead?, noun, rest, setId, familyIndex, reason, trans }`.
- `app/seed/clash-sets.ts` — 6 particle sets; `SUBJECT` family = 이/가 (grammarKo `이/가`).
- `app/composables/useParticleDrill.ts` — set-agnostic; `answer()` handles correct/blocked/wrong-family; blocked = retry (no penalty) via `blockedChoices` + `phase='blocked'` + `slipsThisItem++`.
- `app/components/particle-lab/DrillCard.vue` — options from `deriveOptions(set)`; reveal uses `correctSentence`; blocked-explanation block keyed on `verdict.kind==='blocked'`.
- `app/components/particle-lab/DrillSummary.vue` — review list renders `lead + noun + <b>correctForm</b> + rest`.
- `tests/unit/particle-lab/clash-sets.test.ts` — integrity incl. "correctForm ∈ deriveOptions(set)" and "≥10 items per set".

## Design

### A. Model (`domain/particles.ts`)

- `ClashSet` gains `kind?: 'particle' | 'contraction'` (absent ⇒ `'particle'`).
- `DrillVerdict` gains `{ kind: 'contraction'; expected: string }`.
- No change to `ClashFamily` or `DrillItem` shape — contraction items reuse `noun` (the bare pronoun) and `familyIndex: 0`.

### B. Seed (`clash-sets.ts`)

- Add `CONTRACTION_SET`: `{ id: 'contraction', kind: 'contraction', name: pair('나/저/너/누구 + 가'), families: [SUBJECT, SUBJECT] }`. Two SUBJECT entries keep the `[ClashFamily, ClashFamily]` tuple type and the `familyIndex 0` → grammarKo `이/가` mapping for SRS/diary. Append to `CLASH_SETS` (it becomes the 7th set in the picker).

### C. Engine (`drill.ts`)

A contraction map and `kind`-aware functions:

```ts
export const CONTRACTIONS: Record<string, string> = { 나: '내가', 저: '제가', 너: '네가', 누구: '누가' }
export function contractionTrap(noun: string): string { return `${noun}가` }
```

- `correctForm(item, set)`: if `set.kind === 'contraction'` return `CONTRACTIONS[item.noun]` (the full form); else unchanged.
- New `optionsFor(item, set): string[]`: contraction ⇒ `[CONTRACTIONS[item.noun], contractionTrap(item.noun)]` sorted by code point (stable, non-position-revealing); particle ⇒ `deriveOptions(set)`. Call sites that used `deriveOptions(set)` switch to `optionsFor(item, set)`.
- New `sentenceParts(item, set): { before: string; answer: string; after: string }`: particle ⇒ `{ before: (lead??'')+noun, answer: correctForm, after: rest }`; contraction ⇒ `{ before: lead??'', answer: correctForm, after: rest }` (no separate noun — the contracted form is the whole subject). `correctSentence` becomes `before+answer+after` (identical output for particle items).
- `judge(item, choice, set)`: contraction ⇒ `choice === correctForm` → `{kind:'correct'}`; else → `{kind:'contraction', expected: correctForm}`. Particle ⇒ unchanged.

### D. Composable (`useParticleDrill.ts`)

`answer()` treats `contraction` like `blocked` — retry, no penalty — but does NOT increment `slipsThisItem` (that metric stays 받침-only): add the choice to `blockedChoices`, set `phase='blocked'`. Everything else (results, finish, SRS via `이/가`, replay) is unchanged. (Optional: a `contractionSlips` counter is out of scope — YAGNI.)

### E. UI

- `DrillCard.vue`: options from `optionsFor(item, set)`; render the stem via `sentenceParts` (so the gap replaces the whole subject for contraction items); add an explanation block shown when `verdict.kind==='contraction'` (the rule, e.g. "나 + 가 → 내가"; for 너, append the 네가/니가 colloquial note). The 받침 block stays keyed on `'blocked'`.
- `DrillSummary.vue`: the review line renders via `sentenceParts` (bold the `answer`) instead of `lead+noun+<b>correctForm</b>+rest`, so contraction items show "내가 …" not "나내가 …".

### F. Content (`particle-drills.ts`)

≥10 contraction items (4 pronouns × varied TOPIK 1–2 sentences; e.g. 내가 학생이에요 / 내가 갈게요 / 제가 할게요 / 네가 해 / 누가 왔어요 …). Each: `{ id: 'ct-NN-<rom>', cue, noun: '<pronoun>', rest, setId: 'contraction', familyIndex: 0, reason, trans }`, 8-locale, adversarially verified (assembled `CONTRACTIONS[noun]+rest` natural; cue makes the subject reading clear; the 너 item's reason notes 네가→니가). No `lead`.

### G. i18n

`particles.drill.contraction_title` + `contraction_rule` (with `{trap}`/`{answer}` params), all 8 locales. Set name stays Korean via `pair()`.

## Files

| Action | Path |
|---|---|
| Edit | `app/lib/domain/particles.ts` (`ClashSet.kind`, `DrillVerdict` +contraction) |
| Edit | `app/lib/particle-lab/drill.ts` (CONTRACTIONS, optionsFor, sentenceParts, kind-aware correctForm/judge) |
| Edit | `app/seed/clash-sets.ts` (CONTRACTION_SET) |
| Edit | `app/seed/particle-drills.ts` (+≥10 contraction items) |
| Edit | `app/composables/useParticleDrill.ts` (contraction = retry, no 받침-slip) |
| Edit | `app/components/particle-lab/DrillCard.vue` (optionsFor, sentenceParts, contraction block) |
| Edit | `app/components/particle-lab/DrillSummary.vue` (sentenceParts review line) |
| Edit | `i18n/locales/*.json` (2 keys ×8) |
| Edit | `tests/unit/particle-lab/drill.test.ts` (contraction engine) |
| Edit | `tests/unit/particle-lab/clash-sets.test.ts` (use `optionsFor`; contraction set integrity) |
| Edit | `tests/components/particle-lab/DrillCard.test.ts` (contraction options + block) |

No SQL, no new SRS plumbing (reuses 이/가).

## Testing

- Engine: for the contraction set, `optionsFor` = sorted `[answer, trap]`; `correctForm` = the contracted form; `correctSentence` = `answer+rest`; `judge` returns `correct` for the answer and `contraction` for the trap.
- Integrity (`clash-sets.test.ts`): switch "correctForm ∈ options" to `optionsFor(item, set)` so it covers contraction items; contraction set has ≥10 items, all `familyIndex 0`, every `noun` is a `CONTRACTIONS` key.
- Component: a contraction `DrillCard` shows the full-form options and, on the trap, the contraction explanation (not the 받침 one).
- Full suite + typecheck + lint green. Manual (logged in): the Choque picker shows 축약; picking 나가 shows "나 + 가 → 내가" and lets you retry; 내가 is correct; replay/repasar-fallos work; diary/SRS write to 이/가.

## Out of scope (YAGNI)

- Topic contraction (나는 has no contraction) and object (나를) — only the 가 subject contraction is confusable.
- A separate `contractionSlips` metric — contraction retries are just retries.
- The dialectal 니가 as an accepted answer — it's mentioned in the note, not a correct option.
