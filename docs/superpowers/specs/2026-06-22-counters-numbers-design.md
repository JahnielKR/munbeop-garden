# 수 분류사 연구소 — counters/classifiers + native-vs-Sino numbers — design

_Created 2026-06-22. Roadmap Step 13 (Phase 3) of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: M (content is the long pole). Branch off `main` (after Steps 11/12 merged)._

## Goal

Fill the TOPIK-1 number/counter gap: a standalone recognition lab that teaches **how to render a count** — picking the correct *prenominal native number + counter* (e.g. 책 ×3 → **세 권**), which forces three skills at once: the native-vs-Sino system choice, the irregular prenominal form (세, not 셋/삼), and the right classifier. Covers the curriculum's two designated-but-empty spine points: **G031 숫자** (native + Sino numbers) and **G132 수 분류사** (`fn:"counters"`). Standalone lab with self-contained mastery; **no migration**; content via the Korean-native-review pipeline used in Steps 8/9.

## Decisions (locked, all user-approved)

- **Drill = "render the count"** (4-choice): given a noun × quantity, choose the correct `prenominal-number + counter` string. The single most complete drill — it exercises system + prenominal + classifier together.
- **Coverage = numbers AND counters:** native (with prenominal irregulars) + Sino + the which-system-when rules + the classifier catalog.
- **Surface = standalone lab with self-contained mastery** (`/practice/counters`), like Step 8 (register) / 5b (conjugation). Isolated — does **not** touch the catalog SRS/garden (숫자/수 분류사 are not standard grammar `ko`s).
- **Content scope = broad:** the full high-frequency spine set of counters + native 1–99 + Sino, not a minimal subset.

## Engine — `app/lib/korean/numbers.ts` (new, pure, golden-tested)

The only "engine" piece. Deterministic; exported via `~/lib/korean`.

```ts
export function nativeNumber(n: number): string      // cardinal 1–99: 하나 둘 … 열 … 스물 … 아흔아홉
export function nativePrenominal(n: number): string  // before a counter: 한 두 세 네 … 스무(20) 스물한(21) …
export function sinoNumber(n: number): string        // 일 이 삼 … 십 … 이십삼 … (no prenominal irregular)
```

**Native cardinal** ones: 하나 둘 셋 넷 다섯 여섯 일곱 여덟 아홉; tens: 열 스물 서른 마흔 쉰 예순 일흔 여든 아흔. Compose `tensWord(tens) + onesWord(ones)` (e.g. 23 → 스물셋).

**Prenominal (the crux irregular):** ones 1→한, 2→두, 3→세, 4→네 (5–9 unchanged); **n === 20 → 스무** (스무 살), but 21–29 keep 스물 + prenominal ones (스물한, 스물두, 스물세, 스물네, 스물다섯…); 10 (열) and tens ≥30 unchanged before a counter (서른 살). So: `nativePrenominal(n) = (n === 20 ? '스무' : tensWord(tens) + prenominalOnes(ones))`.

**Sino** ones 일 이 삼 사 오 육 칠 팔 구; tens via 십 (10 → 십, 20 → 이십, 23 → 이십삼). No prenominal change (3 minutes → 삼 분).

A **golden table** for 1–99 (native cardinal + prenominal) and Sino 1–99 is the test fixture (mirrors `conjugate.ts`'s golden approach), Korean-native-verified.

## Content model + seed (broad) — `app/seed/counters/`

```ts
type NumberSystem = 'native' | 'sino'

interface Counter {
  ko: string                 // e.g. "권"
  system: NumberSystem       // which number system this counter takes
  gloss: LocalizedString     // "books / bound volumes"
  nounExamples: string[]     // 책, 공책, 사전 …
}

interface CountItem {
  quantity: number           // 1..N
  counter: string            // FK → Counter.ko
  noun: string               // the counted noun (Korean), shown in the prompt
  system: NumberSystem       // resolved system for this item
  answer: string             // the correct rendered count, e.g. "세 권"
  trans: LocalizedString     // gloss of the whole "three books"
}
```

**Counter catalog (broad first batch):**
- **Native-counted:** 개 (general), 명 (people), 분 (people, honorific), 마리 (animals), 권 (books), 장 (flat sheets), 잔 (cups/glasses), 병 (bottles), 살 (age), 시 (o'clock), 시간 (duration hours), 대 (machines/vehicles), 그릇 (bowls), 켤레 (pairs of footwear), 벌 (suits/clothes), 송이 (flower bunches), 채 (buildings).
- **Sino-counted:** 분 (minutes), 원 (won), 번 (ordinal "number N"), 층 (floors), 인분 (food portions), 호 (room/issue no.), 학년 (school year), 페이지 (pages).
- **Ambiguous-by-meaning (the teaching gold, called out explicitly):** **분** = honorific *people* (native: 세 분) vs *minutes* (Sino: 삼 분); **번** = *N times* (native: 세 번) vs *number N / ordinal* (Sino: 삼 번). The seed pins `system` + `answer` per item so each is unambiguous.

The exact final counter list + every `answer` string is produced and gated by the **Korean-native-review pipeline** (AI draft → multi-agent adversarial verify → wife native-review), as in Steps 8/9. The seed is static TS (`app/seed/counters/{catalog,items,index}.ts`) using the `L(en,es,…)` 8-locale helper — no DB, no migration.

## Drill — "render the count" — `app/lib/counters/`

Pure logic (mirrors `lib/cloze` / `lib/conjugation-drill`):
- `buildRound(itemKos, size, shuffle): CountItem[]` — draw a round from the selected set.
- `optionsFor(item): string[]` — the correct `answer` + 3 distractors.
- **Distractor generator** (from `numbers.ts`, invariant-tested across the whole seed): (1) **wrong system** — render with the other system (세 권 → 삼 권); (2) **wrong prenominal** — native non-prenominal cardinal (세 권 → 셋 권); (3) **wrong counter** — same number, a sibling/confusable counter (세 권 → 세 개). Deduped, valid, ≠ answer, exactly 3 (cross-counter / cross-system fallback guarantees 3, like Step 5b).
- `scoreOf`, `itemId` helpers as in `lib/cloze`.

## Standalone lab — `/practice/counters` (수 분류사 연구소)

Clones the Step 8/9 lab shell (no production-loop coupling):
- `definePageMeta({ surface: 'game' })`, `BilingualTitle ko="수 분류사 연구소"`, `GameExitButton`, `GameLeaveConfirm`, idempotent `onMounted` hydrate.
- **Set picker** by counter group (e.g. "people & animals", "books & paper", "time & age", "money & order", "the tricky 분/번 pair") rather than TOPIK deck — the content isn't deck-shaped. `?set=` deep-link.
- `CounterCard.vue` (4-choice, clones `ClozeCard`/register card; verdict + why), `CounterSummary.vue` (score + replay-failed), `ProgressDots`.
- `useCounterDrill` composable: `selectSet → start → phase machine (question|right|wrong|done) → replayFailed`, round size 8.
- **Self-contained mastery** (`useCounterMaster`, localStorage `counter-lab.cleared` / `.masterEarned`, sticky-earned, set cleared at round accuracy ≥ 0.7), **수 분류사 마스터** badge. No `logStore`/SRS writes (isolated, like Step 8).

## i18n (all 8 locales) + tests

- `counters.*` (title/lead/set names/verdict/why-prefix/master) + `games.counters` (hub card). Korean counter terms (수 분류사/숫자) stay literal. Parity test + `{n}` invariants.
- **Tests (TDD):** `numbers.ts` golden table (native cardinal + prenominal + Sino, 1–99, incl. the 20→스무 vs 21→스물한 edge); distractor invariants (every seed item yields exactly 3 valid distinct distractors ≠ answer); seed invariants (every CountItem's `answer` matches `nativePrenominal`/`sinoNumber` + counter, `system` consistent, 8-locale trans present); `useCounterDrill` phase machine + `useCounterMaster` (clear at ≥0.7, sticky); component tests (CounterCard renders 4 options + verdict; lab set-picker → play → summary); i18n parity.

## Acceptance criteria

1. `numbers.ts` golden table passes for native cardinal, native prenominal (incl. 한/두/세/네 and the 20→스무 / 21→스물한 irregular), and Sino 1–99.
2. The lab at `/practice/counters` runs a 4-choice "render the count" round; a wrong answer shows the correct form + a one-line why; replay-failed re-drills misses; **수 분류사 마스터** clears a set at ≥0.7 and persists.
3. The seed covers the broad counter set incl. the ambiguous 분 (people/minutes) and 번 (times/ordinal) split, each with a pinned system + verified answer; distractors are always 3 valid, plausible, ≠ answer.
4. New `counters.*` + `games.counters` keys in all 8 locales; parity test green.
5. `pnpm test` / `lint` / `typecheck` green. No DB migration; catalog/SRS/Supabase untouched.

## Out of scope (v1)

- Wiring into the catalog SRS / garden growth (the lab is self-contained, like Step 8) — 숫자/수 분류사 aren't standard grammar `ko`s.
- Numbers ≥ 100 (백/천/만 compounding), dates/clock-reading sentences, ordinals beyond the 번 counter, Sino 0 (영/공) edge.
- A typed-entry mode (recognition-only, per the roadmap thesis).
- Counters beyond the broad batch (the seed is extensible; later batches add more).

## Implementation note

Given the broad content scope, implementation will likely run **subagent-driven + a Korean-lens content Workflow** (AI draft → adversarial verify → scribe), as in Steps 8/9 — not pure inline. The engine + drill logic + lab shell are mechanical (inline-TDD friendly); the counter catalog + every `answer`/`trans` is the authored, native-reviewed long pole.
