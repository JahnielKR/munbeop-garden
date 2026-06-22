# Leech detection + guided rescue — design

_Created 2026-06-22. Roadmap Step 11 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S–M. Depends on Step 2 (errorDimension + mistake feed) and Step 7 (discrimination drill)._

## Goal

Detect chronically-hard "struggling plants" (leeches) from the review signal that Steps 2/5/7 already populate, and offer a **guided re-teach** flow instead of brute repetition — then stop a single leech from dominating a practice session. Calm garden framing throughout: "plants that need a little care", never overdue-debt counters, badges, or loss-aversion.

## Codebase findings that shape this design (verified against source)

1. **The signal already exists — no migration for v1.** Per-grammar `SrsState` (`easyCount`/`hardCount`/`mastery`, `app/lib/domain/mastery.ts`) plus the raw `LogEntry` history (`feedback`, `errorDimension`, `date`, `reviewState`, `app/lib/domain/log.ts`) are both persisted (`user_progress`, `user_log`; `error_dimension` landed in migration `20260620000001`). `toughestGrammar()` (`app/lib/stats/mastery.ts`) is already a proto-leech list (top-N by lifetime `hardCount`).
2. **Cumulative-count trap.** `easyCount`/`hardCount` never decay and mastery promotion is one-way (never demotes). Keying detection off lifetime `hardCount` surfaces stale grudges and never clears — exactly the debt ledger the roadmap forbids. **Detection must use a recent window** so it self-heals.
3. **The "cap" is a behavior reversal.** `getWeight` (`app/lib/srs/weight.ts`) gives leeches a positive `hardBonus = max(0.3, 1 + (hardCount − easyCount) × 0.15)` plus a time bonus, so leeches are currently drawn **more** often. Capping is new logic that must coexist with that formula, not an addition to it.
4. **Discrimination content is N1-only.** `GRAMMAR_PAIRS` is spread from `N1_PAIRS` (4 pairs) in `app/seed/grammar-pairs/index.ts`. For most `ko`, `pairsFor(ko)` returns `[]`, so the discrimination stage must be skipped cleanly.
5. **All four rescue stages are already reusable:** re-read (`GrammarStudySheet` via `useGrammarModal`), extra examples (`examplesFor` → `ExamplesSection`, with Step 10 TTS), discrimination (`pairsFor` → `PairDrill` / `ConfusedWithSection`), retry production (`/practice/ruleta?focus=<ko>` via `usePractice`).

## Decisions (locked)

- **Leech definition:** recent-window hard ratio (self-healing), not lifetime `hardCount`.
- **Session cap:** at most 1 leech among a session's 3 picks, **plus** a gentle in-ruleta offer to rescue the leech (re-route as an offer, never a hijack).
- **Discrimination stage:** included only when `pairsFor(ko)` is non-empty; otherwise skipped. Stage ordering/emphasis adapts to the leech's dominant `errorDimension` — no substitute drills are added in v1.
- **Surface:** a passive "plants that need care" section on `/stats`, opt-in, with a single "Care" CTA per row. No auto-injection, no red counter.
- **Persistence:** none. Everything derives on the fly from existing stores; rescue "completion" is implicit via the recency window.

## Data model & detection — `app/lib/srs/leech.ts` (new, pure)

No type changes to `LogEntry`/`SrsState`. New module beside `weight.ts`/`pick.ts`:

```ts
export interface Leech {
  ko: string
  meaning: LocalizedString | undefined
  recentHardRatio: number                    // hard / (easy + hard) within the window, 0..1
  recentReviews: number                      // window size actually used
  dominantDimension: ErrorDimension | null   // modal errorDimension among the window's hard entries
}

export function detectLeeches(
  log: readonly LogEntry[],
  grammars: readonly Grammar[],
  now: number,
): Leech[]
```

Algorithm (per `ko`):
- Collect that `ko`'s entries, **excluding `reviewState === 'incorrect'`** (mirrors `recalculateMastery`), sorted by `date`; take the most recent `LEECH_WINDOW` (= 8).
- Require `recentReviews >= LEECH_MIN_REVIEWS` (= 4); fewer → not judged (skip).
- `recentHardRatio = hard / (easy + hard)` over the window. Leech iff `recentHardRatio >= LEECH_HARD_RATIO` (= 0.5).
- `dominantDimension` = most frequent non-null `errorDimension` among the window's **hard** entries (null if none tagged; ties broken by `ERROR_DIMENSIONS` order for determinism).
- `meaning` resolved from the matching `Grammar` (undefined if the `ko` is not in the catalog, e.g. a custom grammar).
- Sort: `recentHardRatio` desc, then `recentReviews` desc, then `ko` asc (stable/deterministic).

Constants live in `leech.ts` (exported for tests): `LEECH_WINDOW = 8`, `LEECH_MIN_REVIEWS = 4`, `LEECH_HARD_RATIO = 0.5`. Tunable; chosen to be forgiving (needs a real recent pattern, not one bad day).

**Self-healing:** once the rescue's retry-production logs an `easy` entry, it enters the window and lowers the ratio, dropping the `ko` from the list with no stored "rescued" flag.

## Composable — `app/composables/useLeeches.ts` (new, thin)

Reactive wrapper: reads `useLogStore().entries` + `useGrammarStore().items`, calls `detectLeeches(entries, grammars, Date.now())`, exposes `leeches: ComputedRef<Leech[]>` and `leechKos: ComputedRef<Set<string>>`. Used by both the `/stats` surface and the session cap. (`useStats()` may re-export `leeches` for convenience, but the source of truth is `useLeeches`.)

## Session cap — `app/lib/practice/session.ts` + `usePractice`

The one change to shared draw machinery (the "carefully" part — golden-tested for the `hardBonus` interaction):

- `createSession` gains optional params: `capPredicate?: (grammar: G) => boolean` and `maxCapped = 1`. After the weighted draw of 3 picks, if more than `maxCapped` picks satisfy `capPredicate`, the surplus capped picks are replaced by continuing the weighted draw over the remaining **non-capped** pool (same `weightOf`, same injected `rng`). If the non-capped pool is exhausted, the cap is relaxed (never throws, never returns < 3). Pure; deterministic under injected `rng`.
- `usePractice.start()` passes `capPredicate: (idx) => leechKos.value.has(koOf(idx))`. Focused (`?focus=`) and custom-deck rounds are intentionally **not** capped (single-grammar / user-curated intent wins).

**Re-route = offer, not hijack.** When the one allowed leech is the current pick in `ruleta`, its `GrammarCard` shows a quiet secondary CTA — _"Care for this plant first?"_ — linking to `/practice/rescue?ko=<ko>`. Dismissible; the production card stays fully usable. No modal, no forced redirect.

## Guided rescue — `/practice/rescue?ko=<ko>` + `app/composables/useRescueDrill.ts`

A new lab-style page that **reuses** the study-sheet section components rather than duplicating them (no god file). `useRescueDrill(ko)` is a light phase machine matching the lab-composable convention:

- Derives: `grammar` (from `grammarStore`), `dominantDimension` (from `useLeeches`, fallback null for a directly-linked non-leech `ko`), `examples = examplesFor(ko)`, `pairs = pairsFor(ko)`.
- `stages` computed: `['reread', 'examples', ...(pairs.length ? ['discriminate'] : []), 'produce']`.
- State: `stepIndex`, `current` stage, `next()` / `back()` (guarded against out-of-range), `isLast`.
- `reread`: renders a slim inline summary of `grammar.meaning` + `grammar.usageNotes`, plus a "read the full sheet" link that opens the complete `GrammarStudySheet` via `useGrammarModal().open(ko)` (avoids any dependency on whether the sheet's sub-sections are independently mountable).
- `examples`: `ExamplesSection` for `ko` (TTS included). When `dominantDimension === 'register'`, a one-line note highlights the register variants.
- `discriminate` (conditional): `ConfusedWithSection` / `PairDrill` for `pairsFor(ko)`. Highlighted when `dominantDimension ∈ {particle, word_order}`.
- `produce`: final CTA hands off to `/practice/ruleta?focus=<ko>` (proven production loop; replicates ruleta's `await Promise.all(hydrate)` → `start()` so the focus lookup can't fall through to a normal deck draw).
- Header banner: _"Let's care for this plant — what slipped most here: {dimension}"_ using `dominantDimension` (omitted when null).

No scoring lives in `useRescueDrill` itself: `PairDrill` self-scores and the final production round self-grades in `ruleta`. The page guards accidental navigation with the existing `useGameLeaveGuard` only if a `PairDrill` is mid-round (otherwise reading stages need no guard).

`page` reads `route.query.ko`; if absent or unknown, shows a gentle empty state with a link back to `/stats`.

## Surface — `app/pages/stats.vue` ("plants that need care")

A sibling section to the existing `v-if="toughest.length"` "Toughest grammar" block, but visually distinct (calm green "wants care", **not** the gold "felt hard" styling, to avoid debt tone):

- `v-if="leeches.length"`; hidden entirely when there are none.
- Per row: `ko`, the `dominantDimension` chip (when set), and a single **"Care"** CTA → `/practice/rescue?ko=<ko>`.
- Extracted into `app/components/stats/StrugglingPlants.vue` (keep `stats.vue` thin; props = `leeches: Leech[]`, emits nothing, links directly). Mirrors how the toughest section is rendered today.

## i18n (all 8 locales: en, es, fr, pt-BR, ja, id, th, vi)

- `rescue.title`, `rescue.header` ("what slipped most: {dimension}", keeps `{dimension}`), `rescue.stage.reread`/`examples`/`discriminate`/`produce`, `rescue.next`, `rescue.back`, `rescue.produce_cta` (keeps 화이팅 untranslated), `rescue.empty`.
- `stats.struggling_title` ("Plants that need care"), `stats.struggling_care` ("Care").
- `practice.rescue_offer` ("Care for this plant first?") for the ruleta CTA.
- Dimension labels reuse the existing `dimension.*` keys from Step 2.
- `sync-locale.test.ts` enforces parity; new keys added to all 8 files with the `{dimension}` and 화이팅 invariants preserved.

## Testing (TDD — pure logic first)

- `detectLeeches` (`tests/unit/srs/leech.test.ts`): only recent window counts; `< LEECH_MIN_REVIEWS` excluded; ratio threshold boundary; `reviewState='incorrect'` excluded from counts; `dominantDimension` is the modal hard-entry dimension (null when untagged; deterministic tie-break); self-heal (recent `easy` run drops a former leech); sort order; empty in → empty out; custom-grammar `ko` yields `meaning: undefined` without throwing.
- `createSession` cap (`tests/unit/practice/session.test.ts` extension): with ≥2 leeches in the pool and injected `rng`, never returns >1 capped pick; 0 or 1 leech leaves the draw unchanged; non-capped pool exhaustion relaxes the cap instead of throwing; still always returns 3 picks.
- `useRescueDrill` (`tests/unit/rescue/useRescueDrill.test.ts`): `stages` includes `discriminate` only when `pairsFor(ko)` is non-empty; `dominantDimension` surfaced; `next`/`back` clamp; `produce` is always last; unknown `ko` → safe empty state.
- Components: `StrugglingPlants.vue` renders one row per leech with the dimension chip and a `Care` link to `/practice/rescue?ko=<ko>`; renders nothing when empty. Rescue page renders stages in order and omits the discrimination step when no pair exists. Ruleta rescue-offer CTA appears only for a leech pick and links to the rescue route.
- i18n parity for `rescue.*`, `stats.struggling_*`, `practice.rescue_offer`.

## Acceptance criteria

1. `detectLeeches` flags a `ko` only on a recent (windowed) hard pattern and **un-flags** it after the user logs easier reviews; lifetime grudges and one-bad-day blips don't surface. No migration; no schema change.
2. `/stats` shows a calm "plants that need care" section (distinct from the toughest-grammar block) with a per-row dimension chip and a single "Care" CTA → `/practice/rescue?ko=<ko>`; nothing when there are no leeches.
3. `/practice/rescue?ko=<ko>` walks re-read → extra examples → (discrimination only if a pair exists) → retry production, with stage emphasis and a header driven by the dominant `errorDimension`, ending by handing off to `/practice/ruleta?focus=<ko>`.
4. A practice session contains at most 1 leech among its 3 picks; when a leech is the current pick, the ruleta card offers (does not force) the rescue flow. Focused/custom-deck rounds are unaffected.
5. New `rescue.*`, `stats.struggling_*`, `practice.rescue_offer` keys exist in all 8 locales; 화이팅 untranslated; `{dimension}` invariant preserved.
6. `pnpm test` / `lint` / `typecheck` green. No DB migration; `database.types.ts` unchanged.

## Out of scope (v1)

- Persisting a leech/rescue/snooze state across devices (derive-only; revisit only if a "dismiss this rescue" needs to survive reloads).
- Expanding the `GRAMMAR_PAIRS` seed beyond N1 (content cost; the flow already degrades gracefully) — tracked separately.
- Substitute cloze/register drills when no confusable pair exists.
- Touching `getWeight`'s `hardBonus` formula (the cap coexists with it; we don't rebalance the engine here).
- Garden-weather / rain integration — leeches stay separate from the `isPendingReview` review loop to preserve the "rain → review in /log" promise.
- The Step 12 soft "N ready to revisit" due-count nudge.
