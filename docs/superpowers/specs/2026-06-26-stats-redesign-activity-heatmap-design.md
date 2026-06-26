# Stats page redesign + Anki-style activity heatmap — design

Date: 2026-06-26
Status: approved-pending-review
Area: `munbeop/app` (stats), `munbeop/supabase` (one migration)

## 1. Context & problem

The `/stats` page (`munbeop/app/pages/stats.vue`) has three problems the owner
called out from the test account `ana@ana.com`, which has barely practiced:

1. **Every TOPIK level shows 100%** even though almost nothing was studied.
2. The page is visually off — it ignores the app's pixel-art design system
   (hardcoded radii, fonts, and green hexes) and is hard to read.
3. There is no day-by-day activity view. The owner wants an Anki-style
   contribution grid: one cell per day, greener the more you studied, hover to
   see the date and count, year navigation with arrows.

### Root cause of the false 100%

Two independent defects compound:

- **Conceptual (coverage vs mastery).** `masteryByLevel()` in
  `munbeop/app/lib/stats/mastery.ts` computes
  `pct = (seedling + plant + tree) / total`. That measures *coverage* (how many
  grammars have any SRS row at all), not *mastery*. A `seedling` is a freshly
  created row with zero real learning.
- **`ensure()` mutates SRS state from render.** Several library/practice
  components read mastery inside a `computed`/render via `srs.ensure(ko)`:
  - `munbeop/app/components/library/GrammarCard.vue:23`
  - `munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue:15`
  - `munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue:17`
  - `munbeop/app/components/library/GrammarStudySheet/AchievementsSection.vue:27`
  - `munbeop/app/components/practice/GrammarCard.vue:36`

  `useSrsStore.ensure()` does `if (!map.value[ko]) map.value[ko] = freshSrs()`
  — it **writes** a `seedling` row as a side effect. So merely scrolling the
  Library mints a seedling for every grammar on screen. Combined with the
  coverage formula, browsing the catalog drives every level to 100%.

Both must be fixed: the formula (so seedlings never count as progress) and the
render-time mutation (so browsing never pollutes SRS state).

## 2. Goals / non-goals

### Goals
- TOPIK level % reflects real mastery; an unstudied account reads 0%.
- Browsing the Library no longer creates SRS rows.
- `/stats` and `/paths` use one shared progress definition; they can never
  disagree.
- An Anki-style activity heatmap (year grid, arrows, hover tooltip, green ramp)
  driven by **all** study modes, bucketed by the user's **local** day.
- Current streak **and** longest (record) streak.
- `/stats` adopts the app's pixel-art design tokens and a clearer layout.
- All new strings in 8 locales; new logic covered by tests (TDD).

### Non-goals
- No SRS algorithm / threshold changes.
- No time-per-card tracking (the app does not and will not measure it).
- Monetization, paths page redesign beyond the shared helper, escape room.
- Home mini-heatmap is **optional** (section 12), decided at spec review.

## 3. Fix the 100% bug

### 3a. `srs.peek()` — non-mutating read
Add to `munbeop/app/stores/srs.ts`:

```ts
function peek(ko: string): SrsState {
  return map.value[ko] ?? freshSrs()
}
```

`peek` returns a default for untouched grammars **without** writing to `map`.
Replace the 5 render-time `ensure()` calls listed in §1 with `peek()`. Real
practice flows keep calling `ensure()`/`markSeen()` (they intentionally create
rows). Expose `peek` from the store's return object.

Note: `freshSrs()` returns a new object each call. For render reads that is
fine (used read-only). Keep `peek` returning a fresh default rather than a
shared singleton to avoid any accidental shared-mutation aliasing.

### 3b. Level % = learned (plant + tree) / total
Unify on the existing `isLearned()` rule from
`munbeop/app/lib/paths/progress.ts` (`mastery === 'plant' || 'tree'`).

`masteryByLevel()` keeps returning the per-tier breakdown
(`seedling`/`plant`/`tree`/`total`) for the segmented bar, but `pct` changes:

```ts
const learned = l.plant + l.tree
l.pct = l.total ? Math.round((learned / l.total) * 100) : 0
```

Update the `LevelMastery.pct` doc comment accordingly ("learned = plant+tree as
a rounded percentage of total"). The `/stats` segmented bar still shows the
seedling segment (so "explored but not learned" is visible), but the headline
number is mastery, matching `/paths`.

## 4. Unify `/stats` and `/paths` progress

`/paths` uses `pathProgress()` (learned/total, seedling excluded, empty→0).
`/stats` will use the same rule. Extract a single source of truth:

- Keep `isLearned()` in `lib/paths/progress.ts` as the canonical predicate (or
  move it to a neutral `lib/stats/learned.ts` and re-export from both — decided
  in the plan; the predicate must be imported by both `mastery.ts` and
  `progress.ts`, not duplicated).
- `masteryByLevel()` counts `plant`/`tree` via `isLearned`-equivalent tiers, so
  a level's `pct` equals what `pathProgress` would report for that deck's kos.
- Add a characterization test asserting `/stats` level pct === `/paths` deck pct
  for the same `topik-N` grammar set, so the two can never drift again.

## 5. Activity tracking (new durable source)

### 5a. Why a new source
Today only "rich" modes write `user_log` rows (diary, cloze, conjugation drill,
register drill, particle drill, onboarding). The "explore/master" modes
(counters, particle-explore, conjugation-master, register-master, placement,
rescue) only call `markSeen`, which overwrites `lastSeen` and leaves no per-day
trace. The owner chose **"all study counts"**, so non-logging modes need a
lightweight per-day signal.

### 5b. Model: per-local-day tally, table-backed
Chosen over the prefs-jsonb blob (owner decision) for write efficiency and
scalability — single-row upserts, tiny table.

- **Day key = the user's local calendar day** as `YYYY-MM-DD` (computed
  client-side at record time). This makes the heatmap match the user's calendar
  (Korea, UTC+9) and sidesteps all UTC-bucketing bugs in the existing helpers.
- Domain type `ActivityDay { count: number }` (object, so it can grow later).
- Storage shape: `Record<string /*dayKey*/, ActivityDay>`.

**Every study answer records one activity tick** (uniform rule across all
modes). The per-day heatmap/streak count merges the new source with the
existing log as a **max**, which backfills pre-feature history and never
double-counts:

```
perDay(day) = max(activityCount[day], logCount[day])
```

Rationale (discovered during planning): the four drills (cloze, conjugation,
register, particle) write `user_log` **only conditionally** (on a mistake or at
round-end), so an all-correct session leaves no log row. Relying on the log
union would make those sessions invisible. So instead **all** answer handlers
call `activity.record()`, and `max` is used because:
- Pre-feature days have only `user_log` rows (activityCount 0) → `max` = log,
  so existing history still shows.
- Post-feature days have an activity tick for every answer
  (activityCount ≥ logCount) → `max` = activity, counting every mode once with
  no double counting even on days that also wrote log rows.

### 5c. New store `munbeop/app/stores/activity.ts`
```ts
export const useActivityStore = defineStore('activity', () => {
  const map = ref<Record<string, ActivityDay>>({})
  async function hydrate() { /* storage.read(STORAGE_KEYS.activity, {}) */ }
  async function record(now: number = Date.now()) {
    const key = localDayKey(now)
    const next = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    await useStorageAdapter().upsertOne(STORAGE_KEYS.activity, { id: key, value: next })
  }
  return { map, hydrate, record }
})
```
Hydrate in the same place other stores hydrate (the app bootstrap that calls
`srs.hydrate()`/`log.hydrate()` — confirmed in the plan).

### 5d. Recording sites (confirmed by per-file analysis)
Add one `activity.record()` per answer in each study mode's answer handler:
- `usePractice.ts` → `persistEntry` (per context answer, beside the existing log.add)
- `useOnboarding.ts` → `complete()` (the single starter answer)
- `useClozeDrill.ts` → `answer()` (after `phase` is set)
- `useConjugationDrill.ts` → `answer()` (after `results.push`/`phase` set)
- `useRegisterDrill.ts` → `answer()` (after `results.push`/`phase` set)
- `useParticleDrill.ts` → both terminal branches of `answer()` (right + wrong),
  not the intermediate `blocked`/`contraction` verdicts
- `useCounterDrill.ts` → `answer()` (after `phase` set; guarded by the existing
  `if (phase.value !== 'question') return`)
- `usePlacement.ts` → `next()` (after `recordAnswer`, before the done branch)
- `useParticleExplore.ts` → **once per session** in the composable setup body
  (Explore has no per-answer concept; one tick marks the day active without
  inflating intensity from sentence navigation)

**Excluded:** `useRescueDrill.ts` / `rescue.vue` — the rescue flow is a guided
read-through whose "produce" stage routes to `/practice/ruleta` (which already
records), so instrumenting the read-through would double a session that the
ruleta already counts.

### 5e. Persistence wiring
- `munbeop/app/lib/storage/keys.ts`: add `activity: 'munbeop.v1.activity'`.
- `munbeop/app/lib/storage/supabase.ts`:
  - `read(activity)`: `select('day, count').eq('user_id', userId)` → build map.
  - `write(activity, map)`: delete user's rows + upsert all (mirrors `decks`).
  - `upsertOne(activity, {id: day, value})`: upsert one
    `{user_id, day, count, updated_at}` row.
  - Add `user_activity` to the `clear()` table list.
  - The `assertNever` rail forces these cases to exist (compile error otherwise).
- `LocalStorageAdapter` already handles `read/write/upsertOne` generically — no
  change needed (verified).
- Regenerate `munbeop/app/types/database.types.ts` after the migration so the
  typed client knows `user_activity` (else `nuxt typecheck` fails on `.from`).

### 5f. Migration `munbeop/supabase/migrations/20260626000001_user_activity.sql`
Mirror `user_log` table + RLS exactly:

```sql
CREATE TABLE public.user_activity (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day        date        NOT NULL,
  count      integer     NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);
CREATE INDEX idx_user_activity_user_day ON public.user_activity(user_id, day);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_activity_owner_all" ON public.user_activity
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

Applied to the live Supabase project (`Mungander`, ref `zbohswpyydwvzowvjaiw`)
via MCP during implementation, then types regenerated.

## 6. Activity heatmap

### 6a. Pure helpers `munbeop/app/lib/stats/activity.ts`
- `localDayKey(ms: number): string` → `YYYY-MM-DD` in local time.
- `mergedDailyCounts(logDateMs: number[], activity: Record<string, ActivityDay>): Map<string, number>`
  → per-day count = `max(activityCount[day], logCount[day])` (see §5b). Log
  timestamps are bucketed via `localDayKey`.
- `yearGrid(counts: Map<string,number>, year: number, now: number)` → the
  cells to render for one year: weeks (columns) × 7 weekdays, each cell
  `{ dayKey | null, count, future: boolean }`, week-aligned (Monday-first),
  plus month label positions. Days after `now` are rendered empty/hidden.
- `intensityBucket(count: number): 0|1|2|3|4` → ramp level.
- `daysActive(counts)`, `dailyAverage(counts)` (avg over active days, rounded).

### 6b. Streak helpers (current + longest), local-day
Consolidate streak logic onto the merged day-set:
- `currentStreak(dayKeys: Set<string>, now, graceDays)` — walk back from today's
  local day; keep the existing 1-day "mulch" grace (`STREAK_GRACE_DAYS`).
- `longestStreak(dayKeys: Set<string>)` — max run of consecutive local days.

Reimplement in terms of local day keys. Update `lib/stats/streak.ts` and its
tests; `useStats` feeds the merged day-set. (Existing `streak.test.ts`/
`goal.test.ts` updated to the new signatures.)

### 6c. Component `munbeop/app/components/stats/ActivityHeatmap.vue`
- Props: merged per-day counts (or the raw sources) + `now` (injectable for
  tests).
- Internal `year` state, default = current year. Header: `‹  2026  ›` arrows
  (disabled past the first active year / future year). Arrow buttons are real
  `<button>` with `aria-label`.
- Grid: 53 columns × 7 rows, square cells (pixel-art), 5-step green ramp:
  empty `--paper`/muted, then `#cfe6a8 → #9ecb5f → #639922 → #3b6d11` (the
  `c-green`-family ramp; wire as `--heat-0..4` tokens with light/dark values).
- Month labels across the top (via `Intl.DateTimeFormat(locale, {month})`),
  weekday labels (Mon/Wed/Fri) down the left.
- **Tooltip**: on cell hover/focus show `"{localizedDate} · {n}"`. Implemented
  as an absolutely-positioned element inside a `position: relative` container
  (no `position: fixed`). Cells are focusable (`tabindex`) for keyboard a11y;
  tooltip also shows on focus.
- **Footer row**: daily average · days active % · longest streak · current
  streak — all derived, all rounded.
- Legend: "menos ▢▢▢▢▢ más".
- Respect `prefers-reduced-motion` (no cell transitions when set).

### 6d. Day-cutoff
Default local midnight. No user-configurable cutoff in this pass (note as a
possible future setting).

## 7. `/stats` redesign

Rewrite `munbeop/app/pages/stats.vue` to the design system:
- Replace hardcoded `border-radius`/`'Inter'`/`'Noto Sans KR'`/`'JetBrains
  Mono'` and raw `--paper-*`/`--ink*` with semantic tokens
  (`--surface`, `--surface-elevated`, `--text`, `--text-soft`), `.type-*`
  classes, `--space-*`, pixel `--radius-*`, `--shadow-card`/`--bevel`.
- Extract the mastery/level bar into a reusable
  `munbeop/app/components/stats/MasteryBar.vue` (or `components/ui/ProgressBar.vue`)
  instead of bespoke `.bar` CSS; reuse `Card.vue`/`Badge.vue` where natural.
- New layout order (top → bottom):
  1. `BilingualTitle` (통계 / stats) — unchanged primitive.
  2. **Activity heatmap** (hero, full width).
  3. Hero metric tiles: frases, racha actual, dominadas `/ catalogTotal`,
     por repasar (keep the 4, restyled as metric tiles).
  4. Dominio por nivel (corrected bars + breakdown legend).
  5. Existing rhythm + contexts split, toughest, struggling plants — kept,
     restyled to tokens.
- Empty state (`data-test="stats-empty"`) preserved; `hasData` now also true
  when the activity store has any day (so a counters-only user isn't "empty").

## 8. i18n

Add keys (en mandatory, then the other 7 locales) under `stats.activity.*`:
`title`, `sub`, `tooltip` (`"{date} · {count}"` with `count` pluralized via a
short label key), `avg`, `days_active`, `streak_current`, `streak_longest`,
`year_prev`/`year_next` (aria), `legend_less`/`legend_more`. Month/weekday
names come from `Intl`, not i18n. Reuse existing `stats.hero.*` keys; add
`stats.hero.streak_longest` if shown as a tile.

## 9. Testing (TDD)

Unit (pure, deterministic with injected `now`):
- `mastery.test.ts`: unstudied → 0%; seedling-only → 0%; plant/tree → correct;
  parity with `pathProgress` for a `topik-N` set.
- `activity.test.ts`: `localDayKey` across a TZ boundary; `mergedDailyCounts`
  union + sum; `yearGrid` alignment, month labels, future-day masking;
  `intensityBucket`; `daysActive`/`dailyAverage`.
- `streak.test.ts`: current with grace; longest run; both on local day keys.
- `srs` store: `peek()` does **not** mutate `map` (regression test for the bug).

Component:
- `ActivityHeatmap.vue`: renders a known counts map, tooltip text on hover/focus,
  year arrows change the rendered year, footer numbers.
- `stats.vue`: an account with seedlings-only renders 0% per level (the bug
  guard), heatmap present, empty-state gating.

Follow existing conventions (`tests/setup.ts` i18n key-echo stub, store mocks,
SUT import first for vi.mock hoisting). Gate: `vitest`, `nuxt typecheck`,
`eslint` all green before commit; verify in the preview after.

## 10. File change list

New:
- `munbeop/app/stores/activity.ts`
- `munbeop/app/lib/stats/activity.ts`
- `munbeop/app/components/stats/ActivityHeatmap.vue`
- `munbeop/app/components/stats/MasteryBar.vue` (or `ui/ProgressBar.vue`)
- `munbeop/supabase/migrations/20260626000001_user_activity.sql`
- tests for each new module.

Modified:
- `munbeop/app/stores/srs.ts` (+`peek`)
- 5 components: replace render `ensure()` → `peek()`
- `munbeop/app/lib/stats/mastery.ts` (pct = learned/total; shared predicate)
- `munbeop/app/lib/paths/progress.ts` (export shared `isLearned`, or move it)
- `munbeop/app/lib/stats/streak.ts` (local-day, current+longest)
- `munbeop/app/composables/useStats.ts` (activity store, merged counts, longest)
- `munbeop/app/pages/stats.vue` (redesign + heatmap)
- 6 non-logging composables (+`activity.record()`)
- `munbeop/app/lib/storage/{keys,supabase}.ts`
- `munbeop/app/types/database.types.ts` (regenerated)
- 8 locale files under `munbeop/i18n/locales/`
- touched `streak.test.ts`/`goal.test.ts` for new signatures.

## 11. Risks & mitigations
- **Typecheck on the new table**: regenerate `database.types.ts` right after the
  migration; the typed Supabase client otherwise fails to compile.
- **Adapter `assertNever` rail**: forgetting a switch case is a compile error —
  add all `activity` cases.
- **Double counting**: avoided by construction (log-days ∪ activity-days, each
  interaction in one source only). A test asserts the union sum.
- **Heatmap width** (~636px for 53 weeks) may overflow narrow viewports →
  horizontal scroll on the grid wrapper at small widths; cells shrink to fit.
- **Streak signature change** ripples to existing tests → update them in the
  same change.
- **Subagent worktree escape** (known hazard): any agent git ops verify cwd/HEAD;
  baseline test count is the red flag.

## 12. Optional (decide at review)
- **Home mini-heatmap**: a compact last-N-weeks heatmap on `/` (garden home),
  reusing `ActivityHeatmap.vue` in a compact mode. Cheap once the infra exists;
  excluded from the core unless approved.

## 13. Rollout
Branch → TDD per module → `vitest`/`typecheck`/`eslint` green → apply migration
+ regen types → preview verify (`/stats` with the test account, heatmap hover,
0% levels) → commit → push → PR. Wife native-review of any new Korean/labels is
a follow-up (no new Korean sentences here, only UI labels).
