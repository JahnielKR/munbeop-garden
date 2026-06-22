# "N plants ready to revisit" — soft due-count nudge — design

_Created 2026-06-22. Roadmap Step 12 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: M. Built on a branch off `main` (independent of the Step 11 / PR #54 branch)._

## Goal

A gentle, habit-anchoring **"N plants ready to revisit"** count on the garden home, derived on the fly from existing `SrsState`, plus a one-tap **"revisit these"** session that draws from the due items. A forward-looking practice nudge — **never** an overdue-debt ledger. No migration.

## Codebase findings that shape this design (verified against source)

1. **`getWeight` already over-draws due items.** `app/lib/srs/weight.ts` has a `timeFactor` that grows with `daysSinceSeen` (capped 2×), so items unseen for a while are *already* more likely to be drawn. A separate `dueBonus` in the weighted draw would double-count the same signal (the same trap as Step 11's leech cap vs `hardBonus`). **We do not touch the weight formula.**
2. **The "revisit due" session reuses existing machinery.** `usePractice.start({ customDeckGrammarKos })` (`app/composables/usePractice.ts`) already draws a weighted session from an arbitrary `ko` set. So "revisit due" = `start({ customDeckGrammarKos: <due kos> })` — no new draw code, no `createSession` change.
3. **The garden home already has the surface pattern.** `app/pages/index.vue` + `app/composables/useGardenState.ts` derive everything from SRS + log; `pendingReviews` drives the weather (rain/mist) and a gentle `page__rain-hint` `NuxtLink` to `/log`, alongside the `DailyGoalRing`. The new count fits as a sibling gentle hint.
4. **"Ready to revisit" ≠ the rain.** The rain (`pendingReviews` = `isPendingReview` over the log) is the `/log` review loop (flagged-hard entries). "Ready" is a forward-looking SRS-interval signal. Two distinct prompts — we keep them separate and do **not** overload the rain.
5. **No persisted "due" state exists.** Everything derives from `SrsState` (`lastSeen`, `easyCount`, `hardCount`, `mastery`) already in the srs store. No migration.

## Decisions (locked, all user-approved)

- **Readiness model:** per-mastery review interval, shortened for net-hard items (classic, forgiving, domain-adaptive).
- **Draw interaction:** leave `getWeight`/`createSession` untouched; deliver the visible count + a "revisit due" focused session via the existing `customDeckGrammarKos` path.
- **Count action:** tapping the hint starts a focused "revisit due" session.
- **Cap + framing:** soft display cap + garden copy ("N plants ready to revisit"), never "N overdue/due"; hidden entirely at 0.

## Readiness derivation — `app/lib/srs/due.ts` (new, pure)

```ts
import type { SrsState, MasteryLevel } from '~/lib/domain'
import { daysSinceSeen } from './weight'

export const DUE_INTERVAL_DAYS: Record<MasteryLevel, number> = { seedling: 2, plant: 5, tree: 12 }
export const DUE_HARD_SHORTEN = 0.5  // net-hard items come due sooner
export const DUE_MIN_INTERVAL = 1
export const READY_DISPLAY_CAP = 9   // calm ceiling for the shown number

/** Days until this item is "ready to revisit", per mastery, shortened when net-hard. */
export function reviewIntervalDays(srs: SrsState): number {
  const base = DUE_INTERVAL_DAYS[srs.mastery]
  const shortened = srs.hardCount > srs.easyCount ? base * DUE_HARD_SHORTEN : base
  return Math.max(DUE_MIN_INTERVAL, shortened)
}

/** Ready iff it has been practiced at least once and its interval has elapsed. */
export function isDue(srs: SrsState, now: number): boolean {
  const days = daysSinceSeen(srs.lastSeen, now)
  return days !== null && days >= reviewIntervalDays(srs)
}

/** The due grammar kos, most-overdue first (then ko for stability). */
export function dueKos(srsMap: Record<string, SrsState>, now: number): string[] {
  return Object.entries(srsMap)
    .filter(([, s]) => isDue(s, now))
    .map(([ko, s]) => ({ ko, overdue: (daysSinceSeen(s.lastSeen, now) ?? 0) - reviewIntervalDays(s) }))
    .sort((a, b) => b.overdue - a.overdue || a.ko.localeCompare(b.ko))
    .map((x) => x.ko)
}

/** Pad a due set up to `min` with active-pool kos (dedup, due-first order). */
export function revisitPool(due: readonly string[], activeKos: readonly string[], min = 3): string[] {
  const out = [...new Set(due)]
  if (out.length >= min) return out
  const have = new Set(out)
  for (const ko of activeKos) {
    if (out.length >= min) break
    if (!have.has(ko)) { out.push(ko); have.add(ko) }
  }
  return out
}
```

- **Never-seen (`lastSeen===null`) is never due** — you can't revisit what you've never practiced (the normal new-item draw handles those).
- `daysSinceSeen` is reused from `weight.ts` (no clock duplication). `getWeight` is **not** modified.
- Intervals (`2/5/12`), the net-hard factor, and the cap are tunable constants.

## Count composable — `app/composables/useReadyCount.ts` (new, thin)

Reactive wrapper over the srs store:
- `readyKos: ComputedRef<string[]>` = `dueKos(srs.map, Date.now())` (full set, for the session).
- `readyCount: ComputedRef<number>` = `readyKos.value.length`.
- `displayCount: ComputedRef<number>` = `min(readyCount, READY_DISPLAY_CAP)`; `hasMore: ComputedRef<boolean>` = `readyCount > READY_DISPLAY_CAP`.

(Source of truth is the pure `dueKos`; the composable is trivial glue — covered by a small store-mocked test.)

## Surface — gentle hint on the garden home (`app/pages/index.vue`)

New `app/components/garden/ReadyToRevisit.vue`, a sibling to `DailyGoalRing` / the rain-hint:
- Props: `count: number`, `hasMore: boolean`. Renders a `NuxtLink` to `/practice/ruleta?revisit=due` with the calm label **"{n} plants ready to revisit"** (appends `+` when `hasMore`).
- Rendered in `index.vue` only when `readyCount >= 1` (hidden at 0). Placed near `DailyGoalRing`; calm styling, **not** a red badge. Visually and semantically distinct from `page__rain-hint` (which goes to `/log`).
- `index.vue` adds `const { displayCount, hasMore, readyCount } = useReadyCount()` and renders `<ReadyToRevisit v-if="readyCount >= 1" :count="displayCount" :has-more="hasMore" />`.

## Action — "revisit due" session in the ruleta (`app/pages/practice/ruleta.vue`)

A new `?revisit=due` deeplink handled in `onMounted`, mirroring the existing `?focus=` branch exactly:
- Hydrate the stores the draw needs — `grammarStore`, `contextsStore`, **and `srsStore`** (the due set reads `srs.map`) — idempotently, tolerant of a Supabase error (same try/catch + fallback-to-picker pattern as `?focus=`).
- Compute the due set directly with `dueKos(srsStore.map, Date.now())`, then `pool = revisitPool(due, activeKos, 3)` where `activeKos` = `grammarStore.activeIndices` mapped to `ko`. (Calling the pure `dueKos` here, rather than `useReadyCount`, keeps the page free of an extra composable and uses one `Date.now()` at start.) If the catalog is empty / `pool.length < 3`, fall back to the normal picker (don't start an invalid session).
- `await start({ customDeckGrammarKos: pool })` → `phase = 'play'`. The weighted draw within the padded set still front-loads the due items via `timeFactor`.
- Consume the param on restart (extend the existing `onRestart` `?focus` cleanup to also clear `?revisit`).
- `?focus=` and `?revisit=` are mutually exclusive; `?focus` keeps priority if both somehow appear.

No change to `usePractice` (the `customDeckGrammarKos` path already exists), `createSession`, or `getWeight`.

## i18n (all 8 locales: en, es, fr, pt-BR, ja, id, th, vi)

- `garden.ready.label` ("{n} plants ready to revisit" — keeps `{n}`), `garden.ready.aria` (link aria-label). 화이팅 not used here.
- A parity test (`tests/unit/i18n/ready-keys.test.ts`) enforces presence in all 8 + the `{n}` invariant.

## Testing (TDD — pure logic first)

- `due.ts` (`tests/unit/srs/due.test.ts`): `reviewIntervalDays` per mastery + net-hard shortening + floor; `isDue` boundary (== interval is due) and never-seen excluded; `dueKos` filters + sorts most-overdue-first + stable tiebreak + empty→empty; `revisitPool` pads to min, dedups, leaves ≥min sets untouched, due-first order.
- `useReadyCount` (`tests/unit/composables/useReadyCount.test.ts`, store-mocked): `readyKos`/`readyCount`; `displayCount` caps at `READY_DISPLAY_CAP` and `hasMore` flips past it.
- `ReadyToRevisit.vue` (`tests/components/garden/ReadyToRevisit.test.ts`): renders the count + a link to `/practice/ruleta?revisit=due`; shows `+` when `hasMore`.
- ruleta `?revisit=due` wiring: verified by `typecheck` (Nuxt-context page, not unit-tested — same as Step 11's ruleta wiring); the pure `revisitPool` + `dueKos` carry the logic coverage.
- i18n parity for `garden.ready.*`.

## Acceptance criteria

1. `dueKos` flags only items practiced ≥ once whose per-mastery interval has elapsed (net-hard items sooner); never-seen and recently-seen items are excluded. No migration; `getWeight`/`createSession` unchanged.
2. The garden home shows a calm "{n} plants ready to revisit" hint when ≥1 is due (with `+` past the cap), distinct from the rain-hint; nothing when 0.
3. Tapping it opens `/practice/ruleta?revisit=due`, which starts a session drawn from the due set (padded to ≥3 from the active pool when fewer are due) and lands on the play phase.
4. New `garden.ready.*` keys in all 8 locales; `{n}` invariant preserved.
5. `pnpm test` / `lint` / `typecheck` green. No DB migration; `database.types.ts` unchanged.

## Out of scope (v1)

- Any change to `getWeight`'s `timeFactor`/`hardBonus` or a separate `dueBonus` (the engine already time-weights — we don't double-count).
- Persisting due/snooze state across devices (derive-only).
- Wiring the count into the garden weather/rain (`useGardenState.pendingReviews`) — kept separate to preserve the "rain → review in /log" promise.
- A standalone `/revisit` route or due-list view (the count + the focused session are the whole feature).
- PWA review reminders tied to this count (that's Step 16).
