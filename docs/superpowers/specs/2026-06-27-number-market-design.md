# 숫자 시장 — Number Market (`/practice/number-market`) — design

_Created 2026-06-27. A new standalone practice lab for **reading any quantity in the right
number system**: counting, time, money, dates, phone numbers, years. Sits beside the existing
수 분류사 연구소 (`/practice/counters`), which it does **not** replace._

## Goal

A guided number-fluency lab. The learner is shown a quantity in some real-world context — 🍎×3,
a clock at 5:40, a ₩12,000 price tag, a date, a phone number — and must produce the correct
Korean reading, **choosing the right system** (native vs Sino) and applying the irregulars
(prenominal 한/두/세/네/스무, 만-grouping, 유월/시월, 공). The declared promise of the game is the
owner's own phrase: _"if you master this, you can count, tell the time, and talk about money in
Korean."_

The hard skill is not memorizing 하나둘셋 or 일이삼 — it is (1) deciding **which system** a context
takes, (2) the irregular forms, and (3) the Korean **4-digit (만) grouping** for money/large
numbers. Every item is designed to drill exactly one of those decisions.

## Relationship to the counter lab (no overlap)

- **수 분류사 연구소** (`/practice/counters`) asks _"which **classifier** goes with this noun?"_
  (개/마리/권…). It already covers native counting 1–99.
- **숫자 시장** asks _"how do you **read** this value, and in which system?"_ — it always shows the
  noun/counter and the learner focuses on the **number**. It reaches where the counter lab cannot:
  money with 만, time (system-mixing), dates, phone, years.

They are complementary. The number engine (`numbers.ts`) is **shared and extended additively** —
the counter lab's existing functions are never modified.

## Decisions (locked via brainstorm)

1. **Format = guided lab + integrated time-attack.** Domain-by-domain mastery (like the counter
   lab), plus an optional 속도전 (contrarreloj) mode for speed/fluency.
2. **Scope = everything.** Native 1–99 (counting), Sino up to 억 with 만-grouping (money/large),
   time (native hour + Sino minute), dates (Sino, with 유월/시월), phone/digit strings (Sino, 공),
   year (Sino).
3. **Three modes over one shared item bank:**
   - **연습 / Learn** (untimed): **build the reading** by tapping syllable **tiles** — production
     without a Korean keyboard. Instant feedback + the "trap" note + 🔊 audio. **This is the
     mastery path.**
   - **받아쓰기 / Dictation** (untimed): 🔊 plays the Korean reading; the learner produces the
     **numeral / value** (digit input, or sets the clock). Proves comprehension — _"you listen and
     write what you hear."_
   - **속도전 / Speed** (timed): quick **4-choice** taps; per-domain or mixed; score + combo +
     best streak. Replayable fluency layer (not required for mastery).
4. **Build-the-reading tiles in Learn; 4-choice in Speed.** Tiles test production and let us plant
   **wrong-system** distractor tiles (삼 시 vs 세 시). Speed uses 4-choice for snappy taps.
5. **Self-contained mastery, NO SRS/catalog coupling, NO migration.** Progress is a local
   `수의 달인` badge in `localStorage` (mirrors `useCounterMaster`). The garden/SRS side is untouched.
6. **Engine extended additively.** New pure renderers are added to `numbers.ts`; the existing
   `nativeNumber/nativePrenominal/sinoNumber` (1..99) and their golden test keep their exact
   behavior (incl. the `sinoNumber(100)` throws guard).

## The domain map (each a "set" with its own mastery)

| # | Domain | id | System | The trap it drills |
|---|--------|----|--------|--------------------|
| 1 | **고유어 세기** — counting (fruit/animals/people) | `counting` | Native 1–99 | prenominal 한·두·세·네; 스무 살 vs 스물한 살 |
| 2 | **한자어 기초** — Sino + hundreds/thousands | `sino-basics` | Sino 1–천 | 100=백 (not 일백); 16=십육 |
| 3 | **시간** — telling the time _(mini-boss)_ | `time` | **mix** | native hour + Sino minute: 세 시 십오 분; 열두 시 반 |
| 4 | **돈** — money | `money` | Sino + 만 | 4-digit grouping: 25,000원 → 이만 오천 원 (**not** 십천) |
| 5 | **날짜** — dates | `dates` | Sino | 6월=유월, 10월=시월; day 일 |
| 6 | **전화·번호** — phone / digit strings | `phone` | Sino digit-by-digit | 0=공; no 만-grouping |
| 7 | **종합** — mixed boss | `mixed` | all | the shuffled-everything fluency deck (Speed mode) |

Mastering all six learn decks earns **수의 달인** (number master).

## Number engine extension — `app/lib/korean/numbers.ts` (additive, pure, golden-tested)

New exports (the existing three are untouched):

- `sinoCardinal(n: number): string` — full Sino reading `0..100_000_000` (i.e. up to 일억) with
  **4-digit (만/억) grouping**. Rules: group by 4 digits; drop the leading `일` before 십/백/천 (10→십, 100→백,
  1000→천); the 만 coefficient `1` is written **만** (not 일만); the 억 coefficient `1` is written
  **일억**; `0` → **영**.
- `sinoDigitString(digits: string): string` — reads a digit string digit-by-digit for phone
  numbers; `0` → **공**; preserves caller-supplied grouping (we pass already-segmented chunks).
- `sinoMonth(m: 1..12): string` — month name with the irregulars **6월=유월**, **10월=시월**;
  others = `sinoCardinal(m)+'월'`.
- `timeReading(h: 1..12, m: 0..59): string` — `nativePrenominal(h)+' 시'` + (m>0 ?
  `' '+sinoCardinal(m)+' 분'` : ''); `m===30` may optionally render `반`. (May live in
  `lib/numbers-market/` instead of the engine — implementer's call; it only composes engine + a
  literal.)

**Canonical golden rows** (Korean-verified examples the golden test will pin — final values are an
adversarial-verify + wife-review gate, see Testing):

| value / call | reading |
|---|---|
| `sinoCardinal(100)` | 백 |
| `sinoCardinal(1500)` | 천오백 |
| `sinoCardinal(10000)` | 만 |
| `sinoCardinal(12000)` | 만 이천 |
| `sinoCardinal(23000)` | 이만 삼천 |
| `sinoCardinal(150000)` | 십오만 |
| `sinoCardinal(1000000)` | 백만 |
| `sinoCardinal(100000000)` | 일억 |
| `sinoCardinal(0)` | 영 |
| `sinoMonth(6)` | 유월 |
| `sinoMonth(10)` | 시월 |
| `sinoMonth(11)` | 십일월 |
| `timeReading(1,0)` | 한 시 |
| `timeReading(3,15)` | 세 시 십오 분 |
| `timeReading(12,30)` | 열두 시 삼십 분 |
| `timeReading(9,5)` | 아홉 시 오 분 |
| `sinoDigitString('010')` | 공일공 |
| year `sinoCardinal(2024)+' 년'` | 이천이십사 년 |
| money `sinoCardinal(12000)+' 원'` | 만 이천 원 |

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/korean/numbers.ts` (extend) | The new pure renderers above. Existing functions untouched. |
| `app/lib/domain/numbers-market.ts` | Types: `NumberDomain`, `MarketItem` (prompt spec + correct reading + canonical tiles + `trans`). |
| `app/seed/numbers-market/items.ts` | Static item bank per domain; each `answer` is validated against the engine (mechanical correctness gate, like the counter seed). |
| `app/seed/numbers-market/index.ts` | Barrel. |
| `app/lib/numbers-market/tiles.ts` | `tilesFor(item)` → correct ordered tiles (`answer.split(' ')`) + **wrong-system** distractor tiles. Pure, deterministic. |
| `app/lib/numbers-market/choices.ts` | `choicesFor(item)` → answer + 3 whole-reading distractors for Speed mode. Pure. |
| `app/lib/numbers-market/drill.ts` | round building, `itemId`, `scoreOf`, `DrillResult`, types. Pure. |
| `app/lib/numbers-market/sets.ts` | the 6 domains + `mixed`; `masteryOf`. |
| `app/lib/numbers-market/index.ts` | Public surface. |
| `app/composables/useNumberMarket.ts` | Round state for all three modes: `mode 'learn'|'dictation'|'speed'`, tile assembly + check, dictation numeral check, speed timer + combo/streak; logs nothing to SRS. |
| `app/composables/useNumberMarketMaster.ts` | `수의 달인` from `localStorage` `numbers-market.cleared`; `perDomain`, `doneCount`, `total=6`, sticky `earned`, one-shot `celebrate`. |
| `app/components/numbers-market/*.vue` | `DomainPicker`, `ModeToggle`, `PromptStage` (clock face / price tag / fruit icons / phone / 🔊 speaker), `TileTray` (build-the-reading + clear/undo), `ChoiceRow` (4-choice), `DictationInput` (numpad / clock setter), `ComboMeter` + `Timer`, `MarketSummary`, `MasterStrip`, `MasterCelebration`. Reuse `practice/ProgressDots`, `games/GameExitButton`, `games/GameLeaveConfirm`, `composables/useGameLeaveGuard`. |
| `app/pages/practice/number-market.vue` | Orchestrator: domain picker → mode → play → summary; `?domain=` / `?mode=` deep links; leave-guard on an in-progress round. |
| `app/pages/practice/index.vue` | + a 숫자 시장 game card. |

## Tile mechanic (Learn mode)

- **Correct tiles** = the engine reading split on spaces, in order (e.g. `세 시 십오 분` →
  `[세][시][십오][분]`; `이만 삼천 원` → `[이만][삼천][원]`).
- **Distractor tiles** = the segments of the **wrong-system** rendering that differ from the
  correct ones, plus 1–2 generic same-domain fillers. Examples: for `세 시` add `삼` (Sino hour);
  for `십오 분` add `열다섯` (native minute); for money add a wrong-grouping piece (e.g. `십천`) or a
  wrong digit (`이천`). The point is to force the system choice, not random noise.
- The tray accepts taps in order; a tap places the next tile, with undo/clear. Submit checks the
  assembled sequence against the answer. On reveal: joined orthographic form + the trap note + 🔊.
- Tile ordering for display is the existing pure `shuffle` seeded by item index (deterministic for
  tests).

## Dictation mode

🔊 plays `answer` (reuses the existing edge-tts audio pipeline used by grammar examples / particle
lab). The learner produces the **value**, not the Korean: a number pad for money/year/phone, a
simple clock-setter for time. Correct iff the entered value equals the item's source value. This is
the comprehension direction and needs no Korean IME.

## Speed mode (속도전 / contrarreloj)

Per-domain or `mixed`. A countdown (e.g. 60 s); each item is a 4-choice (`choicesFor`); correct
taps add score + grow a combo; a miss breaks the combo. Tracks **best score** per domain in
`localStorage` (separate from mastery). Unlocks after the domain's Learn deck is cleared, with a
"just try it" escape hatch. Not required for the 수의 달인 badge.

## Data flow (one Learn round)

`selectDomain(d)` → `start('learn')`: `buildRound(d, N=8, shuffle)` from the seed → `sessionItems`.
Per item: `PromptStage` renders the context, `TileTray` shows `tilesFor(item)` shuffled →
`submit(sequence)` sets verdict (right/wrong) → reveal (joined form + trap note + 🔊) → `next()`
until `done` → `MarketSummary` (score + failed list + replay-failed + restart). At round end, if
accuracy ≥ `0.7` (matching the counter/particle labs) **and** mode is `learn` (not replay), mark
the domain cleared in `useNumberMarketMaster`; completing 6/6 fires the one-shot 수의 달인 celebration.

## Testing (TDD)

- `tests/unit/korean/numbers.test.ts` (extend) — a **golden table** for the new renderers
  (`sinoCardinal` incl. 만/억 grouping + 영, `sinoMonth` incl. 유월/시월, `timeReading`,
  `sinoDigitString` 공). The existing 1..99 rows and the `sinoNumber(100)` throw guard stay green.
- `tests/unit/numbers-market/seed-invariants.test.ts` — every item's `answer` **exactly equals**
  the engine rendering for its (value, domain) — the mechanical Korean-correctness gate; every
  item's `trans` present in all 8 locales; every domain has items.
- `tests/unit/numbers-market/tiles.test.ts` — `tilesFor` returns the correct ordered tiles plus the
  documented wrong-system distractor tiles; deterministic; assembling the correct order matches
  `answer`.
- `tests/unit/numbers-market/choices.test.ts` — exactly 4 options, distinct, answer included,
  answer never among distractors.
- `tests/unit/numbers-market/useNumberMarket.test.ts` — learn submit→reveal→next→done; replay only
  failed; dictation value-check; speed combo/streak + best-score persistence; **no SRS store
  interaction**; mastery recorded only on a normal (non-replay) round ≥ threshold.
- `tests/components/numbers-market/*` — `TileTray` place/undo/submit; `ChoiceRow` select; clock
  `PromptStage`; `MasterStrip` N/6 + earned; celebration dismiss (focus-trapped).
- i18n ×8 — `numberMarket.*` keys present in all 8 locales; Korean fragments (숫자 시장 / 연습 /
  받아쓰기 / 속도전 / 수의 달인) verbatim.
- **Korean correctness gate:** the golden readings + the seed answers are produced and
  adversarially verified by a Korean author/verify workflow (the project's established pattern),
  then **wife native-review** before launch — especially the 만-grouping money strings, the month
  irregulars, and the time mixing.

## Acceptance criteria

1. `/practice/number-market` renders, is listed on `/practice`, and is reachable with
   `?domain=<id>&mode=<learn|dictation|speed>`.
2. The engine renders the new domains correctly (golden test green), and the existing 1..99
   engine + its guard test are unchanged.
3. Learn mode: building the correct tile sequence is accepted; wrong-system tiles are available as
   distractors; reveal shows the joined form + trap note + 🔊.
4. Dictation mode: 🔊 plays the reading and a value entry grades comprehension (no Korean IME).
5. Speed mode: timed 4-choice with combo/streak and persisted best score; gated behind the cleared
   Learn deck with a "just try it" escape.
6. 수의 달인 badge tracks 6 domains, sticky once earned; mastery only from normal Learn rounds.
7. `pnpm test` / `typecheck` / `lint` green; engine functions for the counter lab untouched; no DB
   migration; no SRS/catalog mutation.

## Out of scope (YAGNI)

- Decimals, fractions, negative numbers, ordinals beyond 번 (첫째/둘째…), Sino-native counting
  edge cases beyond the domain map.
- Numbers above 억 (조), historical/era dates, address reading.
- SRS/garden coupling, leech rescue, daily-goal integration (the lab is self-contained like the
  counter lab; SRS hooks are a possible later step).
- Speech **recognition** (speaking the number) — listening is in (dictation), speaking is not.
- Cover art polish — a placeholder card ships first; the PIL pixel-art cover is a follow-up
  (per the cover-art pipeline convention).
