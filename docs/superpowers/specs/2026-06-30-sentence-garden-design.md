# 문장 정원 (Sentence Garden) — design

**Date:** 2026-06-30
**Status:** Approved design, pending implementation plan
**Scope (this spec):** A new single-player card-game practice mode where the learner
**rebuilds a real Korean sentence by ordering its shuffled word (eojeol) cards**, with one
decoy card mixed in. v1 only — exact-match validation on short TOPIK 1-2 sentences.

## Goal

Bridge the gap between the *recognition* labs (cloze, discrimination) and the *free
production* of the ruleta. The learner sees a target meaning, then assembles the Korean
sentence from shuffled word-cards — scaffolded production without the blank page. It reuses
the existing **grammar-examples** corpus (Korean sentence + 8-locale translation + TTS audio),
so almost no new content authoring is needed.

## The mechanic (v1)

1. The learner picks a deck (TOPIK level or a custom deck), then plays a session of rounds.
2. Each round shows the **target meaning** (the example's translation) and a **garden bed**
   with exactly **N slots** (N = the number of eojeol in the model sentence), plus a **tray**
   of **N + 1 shuffled cards**: the N real eojeol of the sentence and **1 decoy** (a real
   eojeol borrowed from another example of the same grammar that does not belong here).
3. **Tap-to-place**: tapping a tray card fills the next empty bed slot; tapping a placed card
   returns it to the tray. (No drag-and-drop in v1 — simpler, mobile-friendly, accessible.)
4. **Check**: the placed sequence is compared by **exact equality** to the model eojeol order.
   - Correct → the grammar's plant is watered (SRS), the sentence's **audio plays**, advance.
   - Wrong → marked; the learner can retry the round or move on; logged as a miss.
5. A **summary** at the end (score + replay-failed), like cloze.

**No "decoy warning" UI.** Because the tray always has more cards than the bed has slots, the
learner sees automatically that something doesn't belong — and if they place the decoy, a real
word is left with nowhere to go. The mismatch is self-evident; no banner/i18n string needed.

## Why these v1 constraints

- **Exact-match, short sentences only.** Korean allows more than one valid word order
  (movable adverbs/topic), which would cause frustrating false negatives. v1 restricts the
  content pool to **short TOPIK 1-2 sentences (3-5 eojeol)** whose order is effectively rigid,
  and validates by exact equality. Multi-valid-order acceptance and TOPIK 3-6 are v2.
- **Decoy = a real eojeol from a sibling example**, not an engine-generated form. Pulling a
  real word from another example of the same grammar is reliable (never malformed) and
  plausible (same register). Engine-based sibling-form decoys (conjugate / attachParticle) are
  a sharper v2.

## Architecture (mirrors the cloze lab)

```
app/lib/sentence-garden/
  ├─ build.ts     buildRound(example, decoyPool, rng) → SentenceGardenRound
  ├─ check.ts     checkOrder(placed: string[], answer: string[]) → boolean (exact match)
  └─ select.ts    selectRounds(examples, kos, rng) → SentenceGardenRound[]  (short, by ko)
app/composables/useSentenceGarden.ts   session state (mirror of useClozeDrill)
app/pages/practice/sentence-garden.vue  DeckPicker → play → Summary (mirror of cloze.vue)
app/components/sentence-garden/
  ├─ Bed.vue      the ordered drop slots (tap a placed card to remove)
  ├─ Tray.vue     the shuffled cards (tap a card to place)
  ├─ SentenceCard.vue  one eojeol card
  └─ SentenceSummary.vue  end-of-round score + replay-failed
app/seed/practice-help/sentence-garden.ts  SENTENCE_GARDEN_HELP (+ register in index.ts)
i18n/locales/*.json  sentenceGarden.* + games.sentenceGarden.{name,desc} (8 locales)
app/pages/practice/index.vue  a GameCard for the new mode
```

### Pure logic (`app/lib/sentence-garden/`)

- **Round type** (defined here, not domain — it's derived):
  ```ts
  export interface SentenceGardenRound {
    ko: string            // the grammar point (for SRS watering)
    sentence: string      // the full model sentence
    trans: LocalizedString// shown as the target meaning
    answer: string[]      // model eojeol order (sentence.split(/\s+/))
    cards: string[]       // answer + decoy(s), shuffled
  }
  ```
- `buildRound(example, decoyPool, rng)`: `answer = example.sentence.trim().split(/\s+/)`;
  pick 1 decoy from `decoyPool` (an eojeol not already in `answer`); `cards = shuffle([...answer, decoy], rng)`.
- `checkOrder(placed, answer)`: `placed.length === answer.length && placed.every((w,i)=>w===answer[i])`.
- `selectRounds(examples, kos, rng)`: keep examples whose `ko ∈ kos` and whose eojeol count is
  in `[MIN_EOJEOL, MAX_EOJEOL]` (3-5); for each, build a round with a decoy drawn from the
  OTHER selected examples' eojeol (same-grammar pool preferred). Cap at a session size.

### Content source

v1 pool = **TOPIK 1 + TOPIK 2 grammar-examples** (`TOPIK_1_EXAMPLES`, `TOPIK_2_EXAMPLES`),
imported directly in the composable/select (the dedicated game route loads only when played, so
bundling ~200 examples is fine). Each `GrammarExample` = `{ ko, sentence, trans, level }`.

### Composable (`useSentenceGarden`)

Mirrors `useClozeDrill` exactly:
- `start(kos)`: `sessionItems = selectRounds(pool, kos, shuffle)`; `markSeen(ko)` per grammar.
- State: `item`, `placed` (ref string[]), `phase` ('placing'|'right'|'wrong'|'done'), `score`, `failedItems`.
- `place(card)` / `removeAt(i)`: move cards between tray and bed.
- `check()`: `checkOrder(placed, item.answer)` → set phase; record result; on miss log it.
- `next()`: advance or `done`.
- `finish()`: per-ko credit (≥ threshold correct) → `logStore.add({ ko, sentence, feedback:'easy',
  reviewState:'correct', contextId:'sentence-garden-lab', ... })` (waters the plant) +
  `srsStore.recalculate(ko)`. `LAB_CONTEXT = { id:'sentence-garden-lab', name:'문장 정원 LAB' }`.
- On correct: call `useExampleAudio().playExample(item.sentence)`.

### Page + components

`sentence-garden.vue` mirrors `cloze.vue`: `GameExitButton`, `GameLeaveConfirm`,
`BilingualTitle ko="문장 정원"`, `PracticeHelp mode="sentence-garden"`, lead, `DeckPicker` +
`CustomDeckShelf`/`Builder` (pick phase), then `ProgressDots` + `Bed` + `Tray` + a Check
button (play phase), then `SentenceSummary` (done). `useGameLeaveGuard` while playing.
`onMounted` hydrates the grammar + custom-deck stores idempotently (same as cloze).

`Bed.vue`: N slots; filled slots show the placed eojeol; tapping a filled slot emits `remove(i)`.
`Tray.vue`: the not-yet-placed cards; tapping emits `place(card)`. `SentenceCard.vue`: one eojeol
(pixel/garden styling, `lang="ko"`). After `check`, a verdict state colors the bed
(green/correct, red/wrong) and reveals the correct order on a miss.

### New PracticeHelp mode

Add `'sentence-garden'` to `PracticeHelpMode`; `SENTENCE_GARDEN_HELP` (문장 정원, 8 locales):
concept (rebuild the sentence from word-cards; word order + particles), howToPlay (pick a deck →
tap the cards into order → check; the audio plays when you get it right), tip (one card is a
trap — it won't fit; if a real word is left over, you placed the trap). Register in the
practice-help index; the existing seed-invariants test + MODES list cover it.

## Data flow

deck pick → `selectRounds(TOPIK_1+2_examples, deckKos, shuffle)` → session of rounds → per round
`buildRound` already embedded → tap cards into the bed → `check()` exact-match → correct waters
the plant + plays audio → `next()` → `finish()` credits SRS → summary.

## Error handling

- Deck with < MIN_ITEMS qualifying short examples → toast "empty", stay on pick (like cloze).
- Audio missing/blocked → silent (useExampleAudio already swallows errors).
- Storage write fails on water/log → the existing log/srs stores already tolerate it; the round
  result stays in memory.

## Testing

- `lib/sentence-garden/build.test.ts` — seeded rng → deterministic `cards` (a permutation of
  answer+decoy) and `answer`; decoy is not in `answer`.
- `lib/sentence-garden/check.test.ts` — exact order true; wrong order false; decoy-in-slot false;
  length mismatch false.
- `lib/sentence-garden/select.test.ts` — filters to 3-5 eojeol, only `ko ∈ kos`, builds rounds.
- `composables/useSentenceGarden.test.ts` — start seeds session + markSeen; place/remove;
  check sets phase + records; finish waters the plant (logStore.add called with the sentence).
- `components/sentence-garden/*.test.ts` — Tray place emits; Bed remove emits; verdict colors.
- i18n key-parity test for `sentenceGarden.*` (+ games card) across 8 locales.

Gates: vitest, `nuxt typecheck`, eslint — all green.

## Out of scope (v2, named so it isn't assumed)

- Drag-and-drop (v1 is tap-to-place).
- Engine-generated sibling-form decoys (v1 borrows a real eojeol).
- Multi-valid-order acceptance + TOPIK 3-6 / long sentences (v1 is exact-match, short 1-2).
- Real PIL pixel-art hub cover (v1 ships a simple placeholder cover; a `tools/practice-covers`
  cover is a follow-up, per the cover-art pipeline convention).
- Speed/timer variants.

## Native review

The Korean is **reused from the existing grammar-examples** (already adversarially verified +
pending wife review as a batch) — Sentence Garden adds no new Korean sentences, so there is no
new native-review burden beyond what the examples already carry.
