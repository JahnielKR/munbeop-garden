# 띄어쓰기 (spacing) exercise — design

**2026-06-21 · Subproject 7 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming, ready for writing-plans.**

## Goal

Add a third mode to the Particle Lab — **띄어쓰기 (spacing)** — that teaches the
single most particle-relevant Korean orthography rule: **조사는 앞말에 붙여 쓴다**
(a particle attaches to the preceding word with no space), while 어절 (word-phrases)
are separated by spaces.

The user marks each **junction** between blocks as a *space* or a *join (붙임)*.
Two difficulty levels ride **one ground truth** — the existing `Eojeol`
segmentation of the 14 Explore sentences:

| | Level 1 · 초급 | Level 2 · 고급 |
|---|---|---|
| Blocks | pre-chunked tokens (word · particle) | individual **syllables**, run-on |
| s01 | `저` `는` `학생이에요` → set 2 junctions | `저는학생이에요` → insert all spaces |
| Teaches | the 조사 붙여쓰기 rule, mechanically | finding 어절 boundaries from scratch |

Grading is fully deterministic (no morphology engine): a junction **inside** an
eojeol is a join; a junction **between** eojeols is a space. This is read straight
off the seed structure.

## Why this is correct (verified ground truth)

All 14 `PARTICLE_SENTENCES` already group `eojeols` by standard 띄어쓰기. The
correctly-spaced surface of each sentence (eojeol strings joined by a single
space) is the gold answer:

```
s01 저는 학생이에요          s08 친구한테 편지를 써요
s02 고양이가 우유를 마셔요    s09 버스로 학교에 가요
s03 학교에 가요              s10 빵만 먹어요
s04 도서관에서 공부해요       s11 사과와 바나나를 사요
s05 저도 커피를 좋아해요      s12 아홉 시부터 다섯 시까지 일해요
s06 아침에 빵을 먹어요        s13 연필로 편지를 써요
s07 비가 와요                s14 저도 커피를 마셔요
```

s12 is a free bonus: `아홉 시` / `다섯 시` exercises number + counter (단위 의존명사)
spacing — a genuine taste of broader 띄어쓰기 without authoring any new content.
These 14 strings are re-confirmed by adversarial verification (see Testing).

## Current state (what exists)

- `app/lib/domain/particles.ts` — `LabToken = { kind:'word'; text; gloss?; byLevel? } | { kind:'particle'; text; particleId; toggleable }`. `Eojeol = LabToken[]` ("one 어절: word + attached particle chips"). `LabSentence { id, eojeols, trans, nuance, readings }`.
- `app/seed/particle-sentences.ts` — the 14 sentences; `eojeols` already encode correct boundaries.
- `app/lib/particle-lab/shuffle.ts` — pure Fisher–Yates `shuffle` (from subproject 3).
- `app/composables/useParticleDrill.ts` — the drill loop shape we mirror: `sessionItems`, `index`, `mode:'normal'|'replay'`, `phase`, `score`, `failedItems`, `replayFailed`, `start`, plus a set/level picker pattern.
- `app/pages/practice/particles.vue` — `mode: 'explore'|'drill'` tabs synced to `?mode=`; `ProgressDots`; `useGameLeaveGuard`; `DrillSetPicker` shown only at `index===0 && mode==='normal'`.
- `app/lib/particle-lab/drill.ts` — `DrillItemResult`/`DrillScore`/`scoreOf` (reused as the scoring shape).

## Design

### A. Pure logic (`app/lib/particle-lab/spacing.ts`) — new

All spacing types live here (derived data, not seed shapes — keep `domain/particles.ts` focused).

```ts
export type SpacingLevel = 1 | 2
export type GapValue = 'space' | 'join'
export type GapKind = 'particle' | 'word-internal' | 'eojeol'

export interface Gap {
  /** The correct answer for this junction. */
  correct: GapValue
  /** Why — drives the reveal feedback message. */
  kind: GapKind
}

export interface SpacingPuzzle {
  sentenceId: string
  /** Display blocks in order (tokens at L1, single syllables at L2). */
  blocks: string[]
  /** One gap between each adjacent block pair → gaps.length === blocks.length - 1. */
  gaps: Gap[]
}
```

Helpers (all pure, all use the base `text` surface — spacing is orthogonal to formality, so `byLevel` is ignored):

- `eojeolText(eojeol: Eojeol): string` — concatenate a single eojeol's token texts.
- `correctSpacing(sentence: LabSentence): string` — eojeol texts joined by `' '`. The gold string.
- `buildPuzzle(sentence: LabSentence, level: SpacingLevel): SpacingPuzzle`:
  - Flatten the sentence to **segments** `{ text, eojeolIndex, isParticle }` (one per token, in reading order).
  - **Level 1** — `blocks` = each segment's `text`. For each adjacent segment pair: different `eojeolIndex` → `{ space, eojeol }`; same eojeol & right segment `isParticle` → `{ join, particle }`; same eojeol & both words → `{ join, word-internal }`.
  - **Level 2** — `blocks` = every character of every segment. The gap **after** a character is: not the segment's last char → `{ join, word-internal }` (inside a token); else the boundary to the next segment, classified exactly as in Level 1 (`eojeol`/`particle`/`word-internal`). No gap after the final character.
- `gradePuzzle(puzzle: SpacingPuzzle, answers: GapValue[]): SpacingResult`:

```ts
export interface GapResult { index: number; given: GapValue; correct: boolean; gap: Gap }
export interface SpacingResult { gaps: GapResult[]; correct: boolean }  // correct = every gap matches
```

**Invariant (and a test):** applying each gap's `correct` value to reassemble the blocks
(`space` → `' '`, `join` → `''`) reproduces `correctSpacing(sentence)` at both levels.

### B. Composable (`app/composables/useParticleSpacing.ts`) — new

Mirrors `useParticleDrill`'s shape so the page wiring is familiar:

- `level: Ref<SpacingLevel>` — **sticky** (default `1`), not reset by `start()`. `selectLevel(l)` sets it and restarts.
- `sessionItems: Ref<LabSentence[]>`, `index: Ref<number>`, `mode: Ref<'normal'|'replay'>`.
- `puzzle = computed(() => buildPuzzle(current, level.value))`.
- `answers: Ref<GapValue[]>` — one per gap, **default all `'join'`** (the task is literally "insert the spaces"); reset on each item and when `level` changes.
- `phase: Ref<'question'|'answered'|'done'>`; `result: Ref<SpacingResult|null>`.
- `toggleGap(i)` — flip `answers[i]` between `'join'`/`'space'`, only in `'question'`.
- `check()` — `gradePuzzle`, store `result`, push a `DrillItemResult` (`{ itemId, correct, batchimSlips: 0 }`), `phase='answered'`.
- `next()` — advance; past the end → `phase='done'`; else reset `answers`, `phase='question'`.
- `score = computed(() => scoreOf(results))` (reuse `drill.ts` `scoreOf`); `failedItems` = sentences whose result was incorrect.
- `replayFailed()` — `sessionItems = failedItems`, `mode='replay'`, reset to a fresh round.
- `start()` — `sessionItems = shuffle(PARTICLE_SENTENCES)`, `mode='normal'`, `index=0`, reset.

No diary/SRS writes. Spacing is an orthography skill with no single `grammarKo`/`errorDimension` to map to — keeping it self-contained avoids polluting the SRS signal.

### C. Components (`app/components/particle-lab/`) — new

- `SpacingLevelPicker.vue` — a 2-button segmented control (초급 / 고급). Korean level names stay Korean (brand mannerism, like the formality slider); each button gets a localized `aria-label` (beginner/advanced). Shown only at `index===0 && mode==='normal' && phase==='question'` (same gate as `DrillSetPicker`).
- `SpacingGap.vue` — a single tappable junction. `join` state shows a subtle "linked/붙음" affordance; `space` state shows a visible gap (a `␣` marker / pushed-apart tiles). After reveal it carries a correct/incorrect class and the rule message. Emits `toggle`.
- `SpacingCard.vue` — renders `blocks` interleaved with `SpacingGap`s; a muted `trans` meaning hint; a **Check** button (disabled after answering); on `answered`, reveals each gap's correctness + the rule, then a **Next** button. Props: `puzzle`, `phase`, `result`, `answers`. Emits `toggle`, `check`, `next`.
- `SpacingSummary.vue` — accuracy line + **Repasar fallos (N)** CTA (when `failedItems` non-empty) + **Restart** + **back to Explore**. Mirrors `DrillSummary` but typed to spacing (kept separate per the no-god-files rule).

### D. Page wiring (`app/pages/practice/particles.vue`)

- `type Mode = 'explore' | 'drill' | 'spacing'`; add a third tab (`data-testid="tab-spacing"`, an icon + `t('particles.mode_spacing')`); `?mode=spacing` sync; `mode==='spacing'` → `void spacing.start()` (and on the deep-link branch).
- `.lab__tabs` CSS: change `grid-template-columns: 1fr 1fr` → `1fr 1fr 1fr` and bump `max-width` so three tabs fit (a 2-col grid would wrap the third tab).
- Leave-guard predicate extends to: `(mode==='drill' && drill.phase!=='done') || (mode==='spacing' && spacing.phase!=='done')`.
- A `v-else-if="mode==='spacing'"` block renders: `SpacingLevelPicker`, the replay note (reuse pattern), `ProgressDots` (`total=sessionItems.length`, `progress=index`), `SpacingCard`, `SpacingSummary`.

### E. i18n (`munbeop/i18n/locales/*.json`, ×8)

New keys under `particles.`:
- `mode_spacing` — tab label (localized; the Korean 띄어쓰기 lives in the card/lead).
- `spacing.lead` — one-line instruction ("tap the gaps where a space belongs").
- `spacing.level_label`, `spacing.level_beginner`, `spacing.level_advanced` — picker group + aria-labels.
- `spacing.check`, `spacing.next` — buttons.
- `spacing.rule_particle` ("조사는 앞말에 붙여 써요" + gloss), `spacing.rule_eojeol` ("어절은 띄어 써요"), `spacing.rule_word_internal` (one-word join).
- `spacing.correct`, `spacing.try_again` — verdict line.
- `spacing.summary_score`, `spacing.replay_failed`, `spacing.replay_mode_label`.

All Korean rule strings are register-neutral 해요체 and verified across locales.

### F. Tests

- `tests/unit/particle-lab/spacing.test.ts`:
  - `correctSpacing` equals the exact expected spaced string for **all 14** (hard-coded gold array above).
  - L1 puzzle for s01: blocks `['저','는','학생이에요']`, gaps `[{join,particle},{space,eojeol}]`.
  - L2 puzzle for s01: blocks `['저','는','학','생','이','에','요']`, gaps `[particle/join, eojeol/space, word-internal×4]`.
  - s12 both levels: `아홉|시` is `space/eojeol`; `시|부터` first boundary is `particle/join` (counter + 부터).
  - `gradePuzzle`: all-correct → `correct:true`; one flipped gap → `correct:false` with that `GapResult.correct:false`.
  - Reassembly invariant for every sentence × level (correct answers rebuild `correctSpacing`); `blocks.length-1 === gaps.length` for all.
- `tests/components/particle-lab/SpacingCard.test.ts`: renders the blocks; tapping a gap emits `toggle`; after `answered` the reveal applies correct/incorrect classes and shows a rule message.

### G. Verification (implementation phase, Ultracode)

Run an adversarial **Workflow** (mirrors subprojects 4/5/6): confirm the 14 gold
spaced strings are standard 한글 맞춤법 띄어쓰기 — focus on the s12 number+counter
boundary (`아홉 시`, `다섯 시`) and `사과와` — and check the rule messages’
pedagogy + naturalness across the 8 locales. 0-issue bar before merge.

## Files

| Action | Path |
|---|---|
| Add | `app/lib/particle-lab/spacing.ts` (types + `correctSpacing`/`buildPuzzle`/`gradePuzzle`) |
| Add | `app/composables/useParticleSpacing.ts` |
| Add | `app/components/particle-lab/SpacingLevelPicker.vue` |
| Add | `app/components/particle-lab/SpacingGap.vue` |
| Add | `app/components/particle-lab/SpacingCard.vue` |
| Add | `app/components/particle-lab/SpacingSummary.vue` |
| Edit | `app/pages/practice/particles.vue` (third tab + wiring + leave-guard) |
| Edit | `i18n/locales/*.json` (new `particles.spacing.*` + `mode_spacing`, ×8) |
| Add | `tests/unit/particle-lab/spacing.test.ts` |
| Add | `tests/components/particle-lab/SpacingCard.test.ts` |

No SQL, no engine rework, no SRS/diary change, no new seed content.

## Out of scope (YAGNI)

- 의존명사 / 보조용언 dedicated content — future extension; v1 rides the 14 existing sentences (s12 already grazes counter spacing).
- Formality interaction with spacing — boundaries are formality-invariant; use base `text`.
- Persisting level to URL/localStorage — in-memory sticky state is enough for a session.
- SRS/diary logging — orthography skill, intentionally self-contained.
- Typed spacing input or per-gap partial-credit scoring — item-level correct/incorrect drives the score; gaps are highlighted on reveal.
```