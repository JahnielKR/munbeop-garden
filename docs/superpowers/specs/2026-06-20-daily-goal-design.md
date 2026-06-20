# Daily goal + "mulch" streak-freeze — design

_Created 2026-06-20. Roadmap Step 4 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S–M. Closes Phase 0._

## Goal

Add the two cheapest retention mechanics, in garden language (no fire-streak anxiety): a small daily goal shown as a progress ring near the tree, and a "mulch" streak-freeze so one missed day doesn't kill the streak. Both lift session frequency and cut churn after the inevitable first miss.

## Decisions (locked)

- **Mulch:** a fixed 1-day tolerance, silent (the streak just holds; no stateful banking, no indicator). Configurable grace and a visible "mulch saved your streak" hint are out of scope for v1.
- **Persistence:** the daily goal rides in the existing `user_settings.prefs` jsonb blob (no migration).

## Architecture

### Mulch (streak-freeze)

- `currentStreak(dateMs, now, graceDays = 0)` (`app/lib/stats/streak.ts`) gains a `graceDays` param: walking back from today, an inactive day is bridged (consuming grace) instead of breaking the chain, until grace runs out. `graceDays = 0` preserves the current behavior exactly (default keeps existing callers unchanged).
- `STREAK_GRACE_DAYS = 1` constant exported from the same module. `useStats` passes it: `currentStreak(dateMs, now, STREAK_GRACE_DAYS)`.

### Daily goal

- `app/lib/stats/goal.ts` (new, pure): `DEFAULT_DAILY_GOAL = 3`; `clampGoal(n)` → integer in `[1, 20]`; `todayCount(dateMs, now)` → number of timestamps in today's UTC-day bucket (same `Math.floor(ms / DAY)` bucketing as the streak).
- Settings store (`app/stores/settings.ts`): a reactive `dailyGoal` ref (default `DEFAULT_DAILY_GOAL`), persisted in the `prefs` blob alongside theme/locale; `setDailyGoal(n)` clamps + persists; `hydrate` reads `cloud.dailyGoal` (validated number → clamped). The `Settings` interface gains `dailyGoal: number`.
- `app/components/garden/DailyGoalRing.vue` (new): props `count`, `goal`; an SVG progress ring + label ("Today: {count}/{goal}", or a gentle done state at `count >= goal`). Honors `prefers-reduced-motion`. Garden framing, never a fire/loss-aversion motif.
- `app/components/settings/DailyGoalSetting.vue` (new): a small number stepper/input bound to `settings.dailyGoal` via `setDailyGoal`, in the Settings → Learning panel.

### Wiring

- `app/pages/index.vue`: render `<DailyGoalRing :count="todayCount(...)" :goal="settings.dailyGoal" />` near `GardenHud` in the hero. `todayCount` derives from `useLogStore().entries` dates; `dailyGoal` from `useSettingsStore()`.
- `app/pages/settings.vue`: mount `<DailyGoalSetting />` in the Learning panel.

## i18n (all 8 locales)

- `garden.goal.label` ("Today: {count}/{goal}" — keeps `{count}` and `{goal}`), `garden.goal.aria` (screen-reader summary, keeps `{count}`/`{goal}`), `garden.goal.done` ("Today's goal done! 화이팅" — keeps 화이팅).
- `settings.daily_goal.title` ("Daily goal"), `settings.daily_goal.label` ("Plants to tend each day"), `settings.daily_goal.hint` ("Miss a day? Mulch keeps your streak.").
- A parity test enforces presence + the `{count}`/`{goal}` placeholders and the 화이팅 invariant.

## Testing (TDD — pure logic first)

- `currentStreak` with grace: 1 missed day in the chain is bridged (streak survives); 2 consecutive missed days break it; `graceDays = 0` is unchanged; a too-old last activity (gap > grace) returns 0.
- `todayCount`: counts only today's bucket; `clampGoal`: clamps to `[1, 20]` and floors.
- `DailyGoalRing`: renders the count/goal label; shows the done state at `count >= goal`.
- `DailyGoalSetting`: changing the value calls `setDailyGoal` with the new number.
- i18n parity for `garden.goal.*` + `settings.daily_goal.*`.
- (The settings-store persistence is covered by typecheck + the existing settings patterns; its many composable deps make a full unit test low-value here.)

## Acceptance criteria

1. Practicing toward the goal fills the ring on the garden home; reaching the goal shows the gentle done state.
2. The daily goal is settable in Settings → Learning, persists to `prefs`, and survives reload.
3. A single missed day no longer breaks the streak (one bridged gap); two consecutive missed days do.
4. New `garden.goal.*` + `settings.daily_goal.*` keys in all 8 locales; 화이팅 untranslated.
5. `pnpm lint` / `typecheck` / `test` green; no migration.

## Out of scope

Configurable grace; a visible mulch indicator; stateful grace banking; goal streak/history; notifications (Step 16). The ring shows today only.
