# Stats page — design

_2026-06-18 · Munbeop Garden_

## Purpose

`/stats` is a fixed primary-nav destination that today renders only a placeholder
(`empty.stats` = "Detailed stats land in a later plan."), and `pricing.vue` sells
"Deeper stats" as a paid tier. Ship a real stats page. Every metric derives from
data the app already holds (the grammar/srs/log stores + the static TOPIK spine) —
no new tables, no migration.

**Gating:** none. There is no billing/entitlement system yet and the pricing copy
is itself a `TODO(v8.1)` placeholder, so the page is fully accessible to every
signed-in user. A free/paid split can be layered on when billing lands.

## Scope (all four sections)

1. **Hero metrics** (4 cards):
   - Sentences written — `log.entries.length`.
   - Day streak — consecutive calendar days (ending today) with ≥1 log entry.
   - Grammars mastered — count of srs entries with `mastery === 'tree'`, over the
     catalog total (`grammar.items.length`).
   - Pending reviews — reuse the shared `isPendingReview` count (same as the garden's rain).
2. **Mastery across TOPIK 1–6** — one stacked bar per level. Each level's grammar
   (grammars whose `deckId` is `topik-N`) is split into seedling / plant / tree
   counts (from `srs.map[ko].mastery`; a grammar with no srs row is untouched →
   empty track). The `%` label = touched / total for that level.
3. **Practice rhythm** — sentences per week for the last 8 weeks (bucket
   `log.entries` by week from `date`), plus the easy/hard ratio
   (`feedback` split across all entries).
4. **Toughest grammar** — top 5 grammars by `srs.map[ko].hardCount` (desc, hardCount
   > 0), each showing its meaning and a "Practice" CTA that deep-links to
   `/practice/ruleta?focus=<ko>` (the existing focus-round path).

If the user has no log entries and no srs progress yet, show a single guiding empty
state (reuse/replace `empty.stats`) pointing to Practice.

## Architecture (thin page, testable pure logic — matches useGardenState/usePremios)

- `app/lib/stats/streak.ts` — `currentStreak(dateMs: number[], now: number): number`.
  Pure. Consecutive days ending today; 0 if no entry today.
- `app/lib/stats/rhythm.ts` — `weeklyCounts(dateMs: number[], now: number, weeks = 8): number[]`
  and `easyHardSplit(entries): { easy: number; hard: number; easyPct: number }`. Pure.
- `app/lib/stats/mastery.ts` — `masteryByLevel(grammars, srsMap)` → per TOPIK level
  `{ level, seedling, plant, tree, total, pct }`, and
  `toughestGrammar(srsMap, grammars, n = 5)` → `[{ ko, meaning, hardCount }]`. Pure.
- `app/composables/useStats.ts` — wires the grammar/srs/log stores to the pure
  functions above and returns reactive computeds. Reuses `useGardenState` only for
  values it already exposes cleanly (pendingReviews) if convenient; otherwise derives
  directly to avoid coupling.
- `app/pages/stats.vue` — consumes `useStats()`, renders the four sections with the
  app's paper/garden tokens. No data access or math in the component beyond display.
  Mastery bars and the weekly rhythm are plain CSS (no chart lib) to match the SPA's
  light-bundle posture.

## i18n

New `stats.*` namespace added to all 8 locales (hero labels, the three mastery tiers,
rhythm/easy/hard, contexts, toughest + `hard_count` with `{n}`, practice CTA, empty
state). The existing `nav.stats` / `title.stats` ("Stats") stay. `empty.stats` is
repurposed as the no-data guide (or replaced by a `stats.empty` key).

## Testing

- Pure functions get unit tests (streak across gaps/today-missing, weekly bucketing
  boundaries, mastery grouping incl. untouched grammar, toughest ordering/tie/empty).
- `useStats` derivations tested via the stores (seed store state, assert computeds),
  mirroring existing composable tests.
- `stats.vue` component test: seeds stores, asserts the four sections render and the
  toughest-grammar CTA targets `/practice/ruleta?focus=<ko>`.
- `stats.*` i18n parity test (all 8 locales), mirroring `journal-keys.test.ts`.

## Out of scope

Charts library, date-range pickers, per-context drill-downs, any paywall/entitlement
UI, escape-room/trophies stats (already surfaced on the Trophies page).
