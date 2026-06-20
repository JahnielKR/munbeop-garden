# Choque expansion — design

**2026-06-20 · Subproject 2 of the Particle Lab follow-up program**

## Goal

Generalize the Particle Lab "Choque" drill (today hardcoded to 은/는 vs 이/가) into
**N configurable clash sets**, and ship 5 new confusable-particle pairs plus a
set picker. Each set keeps the pedagogical two-layer error model where it applies.

## Current state

The drill is hardwired to one clash: `DrillFamily = 'topic' | 'subject'`,
`DrillChoice = '은'|'는'|'이'|'가'`, `DRILL_CHOICES` is a fixed 4-tuple, and the 12
seed items carry `family: DrillFamily`. The engine (`correctForm(item)`,
`judge(item, choice)`) assumes that one clash.

## Design

### Engine generalization (domain + lib)

A **ClashSet** is a pair of **ClashFamily**. A family is either **invariant**
(one fixed form — 에, 에서, 도, 만, 한테, 부터, 까지) or **allomorph** (받침-selected
pair — 은/는, 이/가, 을/를). Answer options are derived from the set: 2 when both
families are invariant, 4 when both have allomorphs. The verdict stays
**correct / blocked / wrong-family**; "blocked" (right family, wrong 받침
allomorph) can only occur for an allomorph family.

```ts
// munbeop/app/lib/domain/particles.ts — REPLACE the drill block

interface ClashFamilyBase {
  /** Stable id, e.g. 'topic', 'place-static', 'recipient'. */
  id: string
  /** Short label for chips / feedback. */
  label: LocalizedString
  /** Grammar.ko this family maps to — SRS, diary, study sheet. */
  grammarKo: string
}
export type ClashFamily =
  | (ClashFamilyBase & { invariant: true; form: string })
  | (ClashFamilyBase & { invariant: false; afterConsonant: string; afterVowel: string })

export interface ClashSet {
  id: string
  /** Short bilingual name for the set picker. */
  name: LocalizedString
  families: [ClashFamily, ClashFamily]
}

export interface DrillItem {
  id: string
  cue: LocalizedString
  lead?: string
  noun: string
  rest: string
  /** Which ClashSet this item belongs to. */
  setId: string
  /** Which of the set's two families is correct here. */
  familyIndex: 0 | 1
  reason: LocalizedString
  trans: LocalizedString
}

export type DrillVerdict =
  | { kind: 'correct' }
  | { kind: 'blocked'; expected: string; nounHasBatchim: boolean }
  | { kind: 'wrong-family'; expected: string; familyId: string }
```

```ts
// munbeop/app/lib/particle-lab/drill.ts — REWRITE
import type { ClashFamily, ClashSet, DrillItem, DrillVerdict } from '../domain/particles'
import { hasBatchim } from './hangul'

export function formsOf(f: ClashFamily): string[] {
  return f.invariant ? [f.form] : [f.afterConsonant, f.afterVowel]
}

/** The expected token for a family given the noun (받침-selected for allomorphs). */
export function familyFormFor(f: ClashFamily, noun: string): string {
  if (f.invariant) return f.form
  return hasBatchim(noun) ? f.afterConsonant : f.afterVowel
}

export function correctForm(item: DrillItem, set: ClashSet): string {
  return familyFormFor(set.families[item.familyIndex], item.noun)
}

export function correctSentence(item: DrillItem, set: ClashSet): string {
  return `${item.lead ?? ''}${item.noun}${correctForm(item, set)}${item.rest}`
}

/** All answer options for the set (2 invariant / up to 4 allomorph), family-A first. */
export function deriveOptions(set: ClashSet): string[] {
  return [...new Set([...formsOf(set.families[0]), ...formsOf(set.families[1])])]
}

export function judge(item: DrillItem, choice: string, set: ClashSet): DrillVerdict {
  const expected = correctForm(item, set)
  if (choice === expected) return { kind: 'correct' }
  const correct = set.families[item.familyIndex]
  if (formsOf(correct).includes(choice)) {
    return { kind: 'blocked', expected, nounHasBatchim: hasBatchim(item.noun) }
  }
  return { kind: 'wrong-family', expected, familyId: correct.id }
}

// DrillItemResult, DrillScore, scoreOf: UNCHANGED.
```

`DRILL_CHOICES`, `FAMILY_OF`, `familyOf`, and the 1-arg `correctForm` are removed.
No `batchimIndex`/(으)로 special case is needed in v1 (no set uses it).

### The 6 clash sets

`grammarKo` links each family to a catalog grammar (for SRS/diary/study-sheet).
**New catalog entries to add** (per the user decision): `에게/한테`, `부터`, `까지`.

| Set id | Family 0 | Family 1 | Options |
|---|---|---|---|
| `topic-subject` (existing) | topic 은/는 (allomorph) `ko 은/는` | subject 이/가 (allomorph) `ko 이/가` | 은 는 이 가 |
| `subject-object` | subject 이/가 (allomorph) `ko 이/가` | object 을/를 (allomorph) `ko 을/를` | 이 가 을 를 |
| `place-static-action` | place-static 에 (invariant) `ko 에` | place-action 에서 (invariant) `ko 에서` | 에 에서 |
| `place-recipient` | place-static 에 (invariant) `ko 에` | recipient 한테 (invariant) `ko 에게/한테` | 에 한테 |
| `also-only` | also 도 (invariant) `ko 도` | only 만 (invariant) `ko 만` | 도 만 |
| `from-until` | from 부터 (invariant) `ko 부터` | until 까지 (invariant) `ko 까지` | 부터 까지 |

Recipient family displays **한테** (TOPIK-1 casual); its grammarKo is `에게/한테`.

### Curated items

Korean below is curated/verified by me (the auto-draft had errors — fixed). Each
row: `lead | noun | rest | correctFamily(0/1) | cue(en) | reason(en) | trans(en)`.
The 8-locale `L()` content + a final adversarial Korean check are produced in
implementation (see Testing). Existing 12 `topic-subject` items are unchanged
(only gain `setId:'topic-subject'` + `familyIndex`).

**subject-object** (이/가 vs 을/를) — exercises the 받침 layer on both families:
- `· | 사과 |  맛있어요. | 0` — taste-good is stative → subject; 사과(vowel)→가.
- `· | 사과 |  좋아해요. | 1` — like is transitive → object; 사과(vowel)→를.
- `· | 고양이 |  있어요. | 0` — 있다 existence → subject; 고양이(vowel)→가.
- `· | 우유 |  마셔요. | 1` — drink is transitive → object; 우유(vowel)→를.
- `· | 책 |  읽어요. | 1` — read is transitive → object; 책(consonant)→을.
- `· | 시간 |  없어요. | 0` — 없다 → subject; 시간(consonant)→이.
- `· | 날씨 |  좋아요. | 0` — 좋다 stative → subject; 날씨(vowel)→가.

**place-static-action** (에 vs 에서):
- `· | 학교 |  가요. | 0` — destination → 에.
- `· | 도서관 |  공부해요. | 1` — action location → 에서.
- `· | 집 |  있어요. | 0` — static location/존재 → 에.
- `· | 식당 |  밥을 먹어요. | 1` — eating happens there → 에서.
- `· | 회사 |  일해요. | 1` — working happens there → 에서.
- `· | 부산 |  가요. | 0` — destination → 에.

**place-recipient** (에 vs 한테):
- `· | 엄마 |  말해요. | 1` — telling a person → 한테.
- `· | 부산 |  가요. | 0` — a place destination → 에.
- `· | 선생님 |  물어봐요. | 1` — asking a person → 한테.
- `· | 친구 |  선물을 줘요. | 1` — giving to a person → 한테.
- `· | 학교 |  가요. | 0` — a place → 에.
- `· | 동생 |  전화해요. | 1` — calling a person → 한테.
- `· | 한국 |  살아요. | 0` — living in a place → 에.

**also-only** (도 vs 만):
- `· | 저 |  학생이에요. | 0` — "I'm also a student" → 도.
- `· | 물 |  마셔요. | 1` — "drink only water" → 만.
- `· | 오빠 |  없어요. | 0` — "I also don't have an older brother" → 도.
- `· | 어린이 |  무료예요. | 1` — "only children are free" → 만.
- `· | 저 |  갈 수 있어요. | 1` — "only I can go" → 만.
- `· | 친구 |  와요. | 0` — "a friend also comes" → 도.

**from-until** (부터 vs 까지):
- `· | 월요일 |  학교에 가요. | 0` — start point "from Monday" → 부터.
- `· | 금요일 |  학교에 가요. | 1` — end point "until Friday" → 까지.
- `· | 아침 |  비가 와요. | 0` — "since morning" → 부터.
- `· | 밤 |  일해요. | 1` — "until night" → 까지.
- `· | 9시 |  일해요. | 0` — "from 9 o'clock" → 부터.
- `· | 6시 |  일해요. | 1` — "until 6 o'clock" → 까지.

### Grammar catalog additions

Add three `Grammar` entries (in `app/seed/grammars-n1.ts` or `-n2.ts` as TOPIK
level fits) so the recipient/from/until families resolve a study sheet and the
Explore popover/library link work: `에게/한테`, `부터`, `까지` — each with
`meaning`, `example`, `trans`, `usageNotes`, `deckId`, all 8 locales. (도/만/에/
에서/이가/을를/은는 already exist.)

### UX — set picker

A `DrillSetPicker.vue` chip row, shown only at the start of a drill round
(`phase === 'question' && index === 0`), under the mode tabs / above ProgressDots.
Each chip = a set's `name`. Selecting one starts that set. Deep-linkable via
`?mode=drill&set=<id>`; summary's "PLAY AGAIN" keeps the current set. The drill
defaults to `topic-subject`.

### Composable / components

- `useParticleDrill(setId?)`: resolves the `ClashSet`, filters `PARTICLE_DRILLS`
  by `setId`, exposes `set`, `selectedSetId`, `availableSets`, `selectSet(id)`.
  `start()` marks both families' `grammarKo` seen; `logMistake`/`finish` write
  using `set.families[familyIndex].grammarKo`. Diary `contextId` stays
  `'particle-lab'` (one synthetic context for the lab).
- `DrillCard.vue`: takes `set` prop; renders `deriveOptions(set)` (2–4 buttons)
  instead of the fixed 4; `answer = correctForm(item, set)`.
- `DrillOption.vue`: `choice: string` (was the literal union).
- `DrillSummary.vue`: review list uses `correctForm(item, set)`.
- `particles.vue`: passes `set`; renders `DrillSetPicker`; syncs `?set=`.

## Files

| Action | Path |
|---|---|
| Edit | `app/lib/domain/particles.ts` (ClashSet/ClashFamily/DrillItem/DrillVerdict) |
| Edit | `app/lib/particle-lab/drill.ts` (generalized engine) |
| Create | `app/seed/clash-sets.ts` (the 6 `ClashSet` defs) |
| Edit | `app/seed/particle-drills.ts` (add `setId`+`familyIndex`; +5 sets of items) |
| Edit | `app/seed/particles.ts` (recipient/from/until ParticleDef if Explore uses them — optional) |
| Edit | `app/seed/grammars-n*.ts` (add 에게/한테, 부터, 까지) |
| Edit | `app/composables/useParticleDrill.ts` (set-parameterized) |
| Create | `app/components/particle-lab/DrillSetPicker.vue` |
| Edit | `DrillCard.vue`, `DrillOption.vue`, `DrillSummary.vue`, `pages/practice/particles.vue` |
| Edit | `i18n/locales/*.json` (set-picker label; grammar entries if keyed there) |
| Edit | `tests/unit/particle-lab/drill.test.ts` (new signatures + a 2-option invariant set) |
| Edit | `tests/components/particle-lab/DrillCard.test.ts` (set prop; dynamic options) |
| Create | `tests/unit/particle-lab/clash-sets.test.ts` (integrity: every item's set/family resolves; correctForm matches a sane sentence; option counts) |

## Testing

- **Engine unit**: `correctForm`/`judge`/`deriveOptions`/`formsOf` over an
  allomorph set (이가/을를: blocked vs wrong-family) AND an invariant set
  (에/에서: only correct vs wrong-family, never blocked). Option counts (2 vs 4).
- **Data integrity**: every `DrillItem.setId` resolves to a `ClashSet`;
  `familyIndex` valid; `correctForm` is non-empty; the assembled `correctSentence`
  starts with `lead+noun`.
- **Component**: `DrillCard` renders N options from a passed set; emits the chosen
  string; blocked/wrong/right phases as before.
- **Adversarial content verification (implementation phase, via Workflow)**: for
  EACH item, an independent agent checks the Korean is natural and that the
  drawn `correctForm` produces a correct, unambiguous sentence for the given cue —
  AND drafts the 8-locale cue/reason/trans. Items that fail review are fixed
  before commit. (This is why the curated items above are Korean+English only.)
- Full suite + typecheck + lint green.

## Phasing (for the plan)

1. Engine generalization + migrate the existing `topic-subject` set + its tests
   (no new content) → green. Proves the architecture in isolation.
2. UX: `DrillSetPicker` + composable set-parameterization + page wiring (still
   one set) → green.
3. Content: add the 5 new sets one at a time, each with its items + 8-locale
   content adversarially verified, + the 3 grammar catalog entries.

## Success criteria

The Choque tab offers a set picker; each set drills its pair with correct
options and the two-layer verdict where applicable; every Korean item is
verified correct; existing 은/는·이/가 behaviour and the garden/diary writes are
preserved; full suite + typecheck + lint stay green.
