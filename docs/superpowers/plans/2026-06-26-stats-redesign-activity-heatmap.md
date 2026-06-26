# Stats redesign + activity heatmap — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the false "TOPIK 100%" bug, unify `/stats` & `/paths` progress, and add an Anki-style daily-activity heatmap (year navigation, hover tooltips, current+longest streak) on a pixel-art redesigned `/stats`.

**Architecture:** A new `user_activity` table (one per-local-day tally row, upserted) fed by `activity.record()` on every study answer. The heatmap/streak count per day = `max(activityCount, logCount)` — the log backfills pre-feature history, activity covers everything going forward, no double counting. Pure helpers in `lib/stats/*` (TDD), a self-contained `ActivityHeatmap.vue`, and a token-faithful `stats.vue` rewrite. The 100% bug is fixed in two layers: a non-mutating `srs.peek()` for render reads, and a learned-only level `pct` shared with `/paths`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia setup stores, Supabase (typed client), Vitest, @nuxtjs/i18n (8 locales). Package manager: `npm` (Vercel) locally; tests via `npx vitest`.

**Working dir for all commands:** `C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/hardcore-noether-f2f4ef/munbeop`

**Conventions to follow:**
- Tests: `tests/setup.ts` installs a key-echo `useI18n` stub (`t('a.b', {n}) => 'a.b 1'`). Keep the SUT import at the top of the file (eslint `import/first`; vi.mock is hoisted).
- Pure stats helpers take an injected `now: number` for determinism.
- Never write a literal hex in a component — use a token that has light + `[data-theme="dark"]` values.
- Gate before every commit: `npx vitest run`, `npx nuxt typecheck`, `npx eslint .` — all green (project rule: verify → commit → verify → push).

---

## Task 1: `user_activity` table + regenerated DB types

**Files:**
- Create: `munbeop/supabase/migrations/20260626000001_user_activity.sql`
- Modify: `munbeop/app/types/database.types.ts` (regenerated)

- [ ] **Step 1: Write the migration**

Create `munbeop/supabase/migrations/20260626000001_user_activity.sql`:

```sql
-- Per-user, per-local-day study activity tally. One row per (user, day);
-- count is incremented (upserted) once per study answer across all modes.
-- Powers the activity heatmap and the current/longest streak. The `day` is the
-- user's LOCAL calendar day (YYYY-MM-DD), computed client-side at record time.
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
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Apply the migration to the live project**

Use the Supabase MCP tool `apply_migration` against project `zbohswpyydwvzowvjaiw`
(org "Mungander"), name `user_activity`, with the SQL above. Confirm success via
`list_tables` (or `list_migrations`) showing `user_activity`.

- [ ] **Step 3: Regenerate TypeScript types**

Use the Supabase MCP tool `generate_typescript_types` for the same project and
overwrite `munbeop/app/types/database.types.ts` with the result. Verify the new
file contains a `user_activity` entry under `Tables`.

- [ ] **Step 4: Typecheck**

Run: `npx nuxt typecheck`
Expected: PASS (no `user_activity` errors yet — it's only referenced after Task 2,
but the regenerated types must still compile).

- [ ] **Step 5: Commit**

```bash
git add munbeop/supabase/migrations/20260626000001_user_activity.sql munbeop/app/types/database.types.ts
git commit -m "feat(db): user_activity table for per-day study activity"
```

---

## Task 2: `ActivityDay` type + pure activity/streak helpers (TDD)

This is the deterministic core. All functions are pure and `now`-injectable.

**Files:**
- Create: `munbeop/app/lib/stats/activity.ts`
- Create: `munbeop/tests/unit/stats/activity.test.ts`
- Rewrite: `munbeop/app/lib/stats/streak.ts`
- Rewrite: `munbeop/tests/unit/stats/streak.test.ts`

- [ ] **Step 1: Write the failing activity test**

Create `munbeop/tests/unit/stats/activity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  localDayKey,
  ordinalOf,
  mergedDailyCounts,
  intensityBucket,
  daysActive,
  dailyAverage,
  yearGrid,
} from '~/lib/stats/activity'

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()

describe('localDayKey', () => {
  it('formats the local calendar day as YYYY-MM-DD', () => {
    expect(localDayKey(at(2026, 6, 26))).toBe('2026-06-26')
    expect(localDayKey(at(2026, 1, 3))).toBe('2026-01-03')
  })
})

describe('ordinalOf', () => {
  it('is consecutive across a month boundary', () => {
    expect(ordinalOf('2026-01-31') + 1).toBe(ordinalOf('2026-02-01'))
  })
  it('is consecutive across a year boundary', () => {
    expect(ordinalOf('2025-12-31') + 1).toBe(ordinalOf('2026-01-01'))
  })
})

describe('mergedDailyCounts', () => {
  it('takes the max of log-day count and activity count per day', () => {
    const logMs = [at(2026, 6, 26), at(2026, 6, 26), at(2026, 6, 25)] // 26:2, 25:1
    const activity = { '2026-06-26': { count: 1 }, '2026-06-24': { count: 3 } }
    const m = mergedDailyCounts(logMs, activity)
    expect(m.get('2026-06-26')).toBe(2) // max(2 log, 1 activity)
    expect(m.get('2026-06-25')).toBe(1) // log only
    expect(m.get('2026-06-24')).toBe(3) // activity only (pre-/post backfill)
  })
})

describe('intensityBucket', () => {
  it('maps counts to 0..4', () => {
    expect([0, 1, 2, 3, 5, 8].map(intensityBucket)).toEqual([0, 1, 1, 2, 3, 4])
  })
})

describe('daysActive / dailyAverage', () => {
  const m = new Map([['2026-06-26', 4], ['2026-06-25', 2]])
  it('counts active days', () => expect(daysActive(m)).toBe(2))
  it('averages over active days, rounded', () => expect(dailyAverage(m)).toBe(3))
  it('is 0 over no active days', () => expect(dailyAverage(new Map())).toBe(0))
})

describe('yearGrid', () => {
  it('lays out 7-row weekday columns, masks future days, labels months', () => {
    const counts = new Map([['2026-06-26', 5]])
    const grid = yearGrid(counts, 2026, '2026-06-26')
    expect(grid.weeks.length).toBeGreaterThanOrEqual(52)
    const cells = grid.weeks.flat()
    const cell = cells.find((c) => c.dayKey === '2026-06-26')!
    expect(cell.count).toBe(5)
    expect(cell.future).toBe(false)
    // a day after "today" within the year is masked as future
    expect(cells.find((c) => c.dayKey === '2026-12-31')!.future).toBe(true)
    expect(grid.months.some((mo) => mo.label.length > 0)).toBe(true)
    expect(grid.weeks.every((w) => w.length === 7)).toBe(true)
  })
})
```

- [ ] **Step 2: Run it; verify it fails**

Run: `npx vitest run tests/unit/stats/activity.test.ts`
Expected: FAIL — `Cannot find module '~/lib/stats/activity'`.

- [ ] **Step 3: Implement `lib/stats/activity.ts`**

Create `munbeop/app/lib/stats/activity.ts`:

```ts
const DAY = 86_400_000

/** Per-local-day activity tally row value. */
export interface ActivityDay {
  count: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A timestamp's LOCAL calendar day as `YYYY-MM-DD`. */
export function localDayKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** A calendar-day key as a TZ-free integer ordinal (days since epoch). */
export function ordinalOf(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number) as [number, number, number]
  return Math.floor(Date.UTC(y, m - 1, d) / DAY)
}

/** An ordinal back to a `YYYY-MM-DD` key (UTC, the inverse of ordinalOf). */
export function keyOfOrdinal(ord: number): string {
  const d = new Date(ord * DAY)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/**
 * Per-day study count, merging the existing practice log with the new activity
 * tally as a `max`: pre-feature days have only log rows (backfill), post-feature
 * days have an activity tick per answer (>= log), so max never double-counts.
 */
export function mergedDailyCounts(
  logDateMs: number[],
  activity: Record<string, ActivityDay>,
): Map<string, number> {
  const log = new Map<string, number>()
  for (const ms of logDateMs) {
    const k = localDayKey(ms)
    log.set(k, (log.get(k) ?? 0) + 1)
  }
  const out = new Map<string, number>()
  for (const [k, v] of log) out.set(k, v)
  for (const k of Object.keys(activity)) {
    out.set(k, Math.max(out.get(k) ?? 0, activity[k]!.count))
  }
  return out
}

/** Ramp level 0..4 for a day's count. */
export function intensityBucket(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 7) return 3
  return 4
}

export function daysActive(counts: Map<string, number>): number {
  let n = 0
  for (const v of counts.values()) if (v > 0) n++
  return n
}

export function dailyAverage(counts: Map<string, number>): number {
  const active = daysActive(counts)
  if (active === 0) return 0
  let total = 0
  for (const v of counts.values()) total += v
  return Math.round(total / active)
}

export interface HeatCell {
  dayKey: string
  count: number
  inYear: boolean
  future: boolean
}
export interface MonthLabel {
  col: number
  label: string
}
export interface YearGrid {
  weeks: HeatCell[][]
  months: MonthLabel[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Monday-first weekday-row grid for one calendar `year`, capped at `todayKey`.
 * Columns are weeks; each column is 7 cells (Mon..Sun). `inYear` is false for
 * leading/trailing padding days from adjacent years; `future` masks days after
 * today. `months[].label` is a localizable fallback (the component prefers
 * Intl), keyed to the column where a new month starts.
 */
export function yearGrid(counts: Map<string, number>, year: number, todayKey: string): YearGrid {
  const todayOrd = ordinalOf(todayKey)
  const jan1Ord = ordinalOf(`${year}-01-01`)
  const jsDow = new Date(Date.UTC(year, 0, 1)).getUTCDay() // 0=Sun..6=Sat
  const monIndex = (jsDow + 6) % 7 // 0=Mon..6=Sun
  const gridStart = jan1Ord - monIndex
  const dec31Ord = ordinalOf(`${year}-12-31`)
  const endOrd = Math.min(dec31Ord, todayOrd)
  const numWeeks = Math.max(1, Math.ceil((endOrd - gridStart + 1) / 7))

  const weeks: HeatCell[][] = []
  const months: MonthLabel[] = []
  let lastMonth = -1
  for (let col = 0; col < numWeeks; col++) {
    const week: HeatCell[] = []
    for (let row = 0; row < 7; row++) {
      const ord = gridStart + col * 7 + row
      const dayKey = keyOfOrdinal(ord)
      const cellYear = Number(dayKey.slice(0, 4))
      week.push({
        dayKey,
        count: counts.get(dayKey) ?? 0,
        inYear: cellYear === year,
        future: ord > todayOrd,
      })
    }
    const firstInYear = week.find((c) => c.inYear)
    if (firstInYear) {
      const mo = Number(firstInYear.dayKey.slice(5, 7)) - 1
      if (mo !== lastMonth) {
        months.push({ col, label: MONTHS[mo]! })
        lastMonth = mo
      }
    }
    weeks.push(week)
  }
  return { weeks, months }
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/unit/stats/activity.test.ts`
Expected: PASS.

- [ ] **Step 5: Rewrite the streak test for the new ordinal-set signature**

Replace `munbeop/tests/unit/stats/streak.test.ts` with:

```ts
import { describe, it, expect } from 'vitest'
import { currentStreak, longestStreak } from '~/lib/stats/streak'

// day keys as YYYY-MM-DD
const k = (d: number) => `2026-06-${String(d).padStart(2, '0')}`

describe('currentStreak', () => {
  const today = k(26)
  it('counts consecutive days ending today', () => {
    expect(currentStreak(new Set([k(26), k(25), k(24)]), today)).toBe(3)
  })
  it('is 0 when today has no entry (grace 0)', () => {
    expect(currentStreak(new Set([k(25), k(24)]), today)).toBe(0)
  })
  it('stops at the first gap', () => {
    expect(currentStreak(new Set([k(26), k(24)]), today)).toBe(1)
  })
  it('is 0 for no entries', () => {
    expect(currentStreak(new Set(), today)).toBe(0)
  })
  it('bridges a single missed day with one grace day', () => {
    expect(currentStreak(new Set([k(26), k(24)]), today, 1)).toBe(2)
  })
  it('keeps the streak alive mid-day before today is done (grace bridges today)', () => {
    expect(currentStreak(new Set([k(25), k(24)]), today, 1)).toBe(2)
  })
  it('breaks on two consecutive missed days even with one grace', () => {
    expect(currentStreak(new Set([k(26), k(23)]), today, 1)).toBe(1)
  })
})

describe('longestStreak', () => {
  it('finds the longest run of consecutive days', () => {
    // 24-25-26 (run 3) and 20-21 (run 2) → 3
    expect(longestStreak(new Set([k(20), k(21), k(24), k(25), k(26)]))).toBe(3)
  })
  it('is 0 for no entries', () => {
    expect(longestStreak(new Set())).toBe(0)
  })
  it('is 1 for a single day', () => {
    expect(longestStreak(new Set([k(10)]))).toBe(1)
  })
})
```

- [ ] **Step 6: Run; verify it fails**

Run: `npx vitest run tests/unit/stats/streak.test.ts`
Expected: FAIL — `currentStreak` signature mismatch / `longestStreak` not exported.

- [ ] **Step 7: Rewrite `lib/stats/streak.ts`**

Replace `munbeop/app/lib/stats/streak.ts` with:

```ts
import { ordinalOf } from '~/lib/stats/activity'

/** Default grace ("mulch"): how many missed days a streak tolerates. */
export const STREAK_GRACE_DAYS = 1

/**
 * Consecutive-day practice streak ending on `todayKey`, over a set of active
 * local-day keys. Walking back from today, an inactive day is bridged by
 * spending a `graceDays` ("mulch") instead of breaking, until grace runs out.
 */
export function currentStreak(dayKeys: Set<string>, todayKey: string, graceDays = 0): number {
  const days = new Set([...dayKeys].map(ordinalOf))
  let streak = 0
  let grace = graceDays
  let cursor = ordinalOf(todayKey)
  for (;;) {
    if (days.has(cursor)) {
      streak += 1
      cursor -= 1
    } else if (grace > 0) {
      grace -= 1
      cursor -= 1
    } else {
      break
    }
  }
  return streak
}

/** The longest run of consecutive active days (record streak). */
export function longestStreak(dayKeys: Set<string>): number {
  const ords = [...dayKeys].map(ordinalOf).sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = Number.NEGATIVE_INFINITY
  for (const o of ords) {
    run = o === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = o
  }
  return best
}
```

- [ ] **Step 8: Run; verify both stats suites pass**

Run: `npx vitest run tests/unit/stats/activity.test.ts tests/unit/stats/streak.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add munbeop/app/lib/stats/activity.ts munbeop/app/lib/stats/streak.ts munbeop/tests/unit/stats/activity.test.ts munbeop/tests/unit/stats/streak.test.ts
git commit -m "feat(stats): local-day activity helpers + current/longest streak"
```

---

## Task 3: activity storage key + Supabase adapter cases

**Files:**
- Modify: `munbeop/app/lib/storage/keys.ts`
- Modify: `munbeop/app/lib/storage/supabase.ts`

- [ ] **Step 1: Add the storage key**

In `munbeop/app/lib/storage/keys.ts`, add to the `STORAGE_KEYS` object (after `customDecks`):

```ts
  customDecks: 'munbeop.v1.customDecks',
  activity: 'munbeop.v1.activity',
} as const
```

- [ ] **Step 2: Add adapter cases**

In `munbeop/app/lib/storage/supabase.ts`:

Add the import at the top (with the other type import):

```ts
import type { ActivityDay } from '~/lib/stats/activity'
```

Add a `read` case (inside the `read` switch, before `case STORAGE_KEYS.locale:`):

```ts
      case STORAGE_KEYS.activity: {
        const { data, error } = await this.client
          .from('user_activity')
          .select('day, count')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const map: Record<string, ActivityDay> = {}
        for (const row of data ?? []) map[row.day] = { count: row.count }
        return (Object.keys(map).length ? map : fallback) as T
      }
```

Add a `write` case (inside the `write` switch, before `case STORAGE_KEYS.locale:`):

```ts
      case STORAGE_KEYS.activity: {
        const map = value as Record<string, ActivityDay>
        const del = await this.client.from('user_activity').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        const rows = Object.entries(map).map(([day, v]) => ({
          user_id: this.userId,
          day,
          count: v.count,
          updated_at: new Date().toISOString(),
        }))
        if (rows.length) {
          const { error } = await this.client.from('user_activity').upsert(rows)
          assertOk('write', key, error)
        }
        return
      }
```

Add an `upsertOne` case (inside the `upsertOne` switch, before `default:`):

```ts
      case STORAGE_KEYS.activity: {
        const v = entry.value as ActivityDay
        const { error } = await this.client.from('user_activity').upsert({
          user_id: this.userId,
          day: entry.id,
          count: v.count,
          updated_at: new Date().toISOString(),
        })
        assertOk('write', key, error)
        return
      }
```

Add `'user_activity'` to the `clear()` tables tuple:

```ts
      'user_custom_decks',
      'user_activity',
    ] as const
```

- [ ] **Step 3: Typecheck**

Run: `npx nuxt typecheck`
Expected: PASS — the `assertNever` rail is satisfied (all keys handled) and
`from('user_activity')` resolves against the regenerated types.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/lib/storage/keys.ts munbeop/app/lib/storage/supabase.ts
git commit -m "feat(storage): user_activity adapter cases (read/write/upsertOne)"
```

---

## Task 4: activity store (TDD)

**Files:**
- Create: `munbeop/app/stores/activity.ts`
- Create: `munbeop/tests/unit/stores/activity.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/stores/activity.test.ts` (mirror the existing store-test mock pattern):

```ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const upsertOne = vi.fn()
const read = vi.fn(async () => ({}))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, upsertOne, write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useActivityStore } from '~/stores/activity'

describe('useActivityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertOne.mockClear()
    read.mockClear()
  })

  it('record() increments today and upserts one row', async () => {
    const store = useActivityStore()
    const now = new Date(2026, 5, 26, 10).getTime()
    await store.record(now)
    await store.record(now)
    expect(store.map['2026-06-26']).toEqual({ count: 2 })
    expect(upsertOne).toHaveBeenCalledWith('munbeop.v1.activity', {
      id: '2026-06-26',
      value: { count: 2 },
    })
  })

  it('hydrate() loads the map from storage', async () => {
    read.mockResolvedValueOnce({ '2026-06-20': { count: 5 } })
    const store = useActivityStore()
    await store.hydrate()
    expect(store.map['2026-06-20']).toEqual({ count: 5 })
  })
})
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run tests/unit/stores/activity.test.ts`
Expected: FAIL — `Cannot find module '~/stores/activity'`.

- [ ] **Step 3: Implement the store**

Create `munbeop/app/stores/activity.ts`:

```ts
import { defineStore } from 'pinia'
import type { ActivityDay } from '~/lib/stats/activity'
import { localDayKey } from '~/lib/stats/activity'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

type ActivityMap = Record<string, ActivityDay>

export const useActivityStore = defineStore('activity', () => {
  const map = ref<ActivityMap>({})

  async function hydrate() {
    const storage = useStorageAdapter()
    map.value = await storage.read(STORAGE_KEYS.activity, {} as ActivityMap)
  }

  /** Count one study answer in today's local-day bucket; upsert that one row. */
  async function record(now: number = Date.now()) {
    const storage = useStorageAdapter()
    const key = localDayKey(now)
    const next: ActivityDay = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    await storage.upsertOne(STORAGE_KEYS.activity, { id: key, value: next })
  }

  return { map, hydrate, record }
})
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/unit/stores/activity.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/stores/activity.ts munbeop/tests/unit/stores/activity.test.ts
git commit -m "feat(stores): activity store (record + hydrate)"
```

---

## Task 5: `srs.peek()` + stop render-time SRS pollution (TDD)

**Files:**
- Modify: `munbeop/app/stores/srs.ts`
- Create: `munbeop/tests/unit/stores/srs-peek.test.ts`
- Modify: `munbeop/app/components/library/GrammarCard.vue:23`
- Modify: `munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue:15`
- Modify: `munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue:17`
- Modify: `munbeop/app/components/library/GrammarStudySheet/AchievementsSection.vue:27`
- Modify: `munbeop/app/components/practice/GrammarCard.vue:36`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/stores/srs-peek.test.ts`:

```ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => ({})), upsertOne: vi.fn(), write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useSrsStore } from '~/stores/srs'

describe('useSrsStore.peek', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('returns a seedling default WITHOUT creating a row', () => {
    const srs = useSrsStore()
    const state = srs.peek('없는거')
    expect(state.mastery).toBe('seedling')
    expect(srs.map['없는거']).toBeUndefined() // <-- the bug guard: no mutation
  })

  it('returns the existing row when present', () => {
    const srs = useSrsStore()
    srs.ensure('있는거').mastery = 'tree'
    expect(srs.peek('있는거').mastery).toBe('tree')
  })
})
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run tests/unit/stores/srs-peek.test.ts`
Expected: FAIL — `srs.peek is not a function`.

- [ ] **Step 3: Add `peek` to the srs store**

In `munbeop/app/stores/srs.ts`, add after `ensure`:

```ts
  /** Read a ko's SRS state WITHOUT creating a row — for render/computed reads
   * (creating a seedling on mere display polluted mastery stats). */
  function peek(ko: string): SrsState {
    return map.value[ko] ?? freshSrs()
  }
```

And add `peek` to the returned object:

```ts
  return { map, hydrate, ensure, peek, weightFor, markSeen, recalculate }
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/unit/stores/srs-peek.test.ts`
Expected: PASS.

- [ ] **Step 5: Replace render-time `ensure()` with `peek()`**

In each of the 5 components, change the read in the `computed`:
- `components/library/GrammarCard.vue:23` — `srsStore.ensure(props.grammar.ko).mastery` → `srsStore.peek(props.grammar.ko).mastery`
- `components/library/GrammarStudySheet/HeaderRow.vue:15` — `srs.ensure(...)` → `srs.peek(...)`
- `components/library/GrammarStudySheet/SrsProgressSection.vue:17` — `srs.ensure(props.grammar.ko)` → `srs.peek(props.grammar.ko)`
- `components/library/GrammarStudySheet/AchievementsSection.vue:27` — `srs.ensure(props.grammar.ko)` → `srs.peek(props.grammar.ko)`
- `components/practice/GrammarCard.vue:36` — `srs.ensure(props.grammar.ko).mastery` → `srs.peek(props.grammar.ko).mastery`

(Verify each line still reads only `.mastery` or the state object; no behavior change other than not mutating.)

- [ ] **Step 6: Run the full suite + typecheck**

Run: `npx vitest run` then `npx nuxt typecheck`
Expected: PASS (no test depended on the mutation side effect; if one does, it was asserting the bug — fix it to use `ensure` explicitly).

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/stores/srs.ts munbeop/tests/unit/stores/srs-peek.test.ts munbeop/app/components/library/GrammarCard.vue munbeop/app/components/library/GrammarStudySheet/HeaderRow.vue munbeop/app/components/library/GrammarStudySheet/SrsProgressSection.vue munbeop/app/components/library/GrammarStudySheet/AchievementsSection.vue munbeop/app/components/practice/GrammarCard.vue
git commit -m "fix(srs): peek() non-mutating read; stop library browsing minting seedlings"
```

---

## Task 6: level % = learned/total, unified with /paths (TDD)

**Files:**
- Modify: `munbeop/app/lib/stats/mastery.ts`
- Modify: `munbeop/tests/unit/stats/mastery.test.ts`

- [ ] **Step 1: Add the failing cases**

Append to `munbeop/tests/unit/stats/mastery.test.ts` inside the `describe('masteryByLevel', ...)` block:

```ts
  it('counts only learned (plant+tree) toward pct; seedlings are 0%', () => {
    const grammars = [g('a', 'topik-1'), g('b', 'topik-1'), g('c', 'topik-1'), g('d', 'topik-1')]
    // 4 grammars: 2 merely seen (seedling), 1 plant, 1 tree → learned 2/4 = 50%
    const map = {
      a: srs({ mastery: 'seedling' }),
      b: srs({ mastery: 'seedling' }),
      c: srs({ mastery: 'plant' }),
      d: srs({ mastery: 'tree' }),
    }
    const l1 = masteryByLevel(grammars, map).find((l) => l.level === 1)!
    expect(l1).toMatchObject({ seedling: 2, plant: 1, tree: 1, total: 4, pct: 50 })
  })

  it('an all-seedling level (browsed but never learned) reads 0%', () => {
    const grammars = [g('a', 'topik-1'), g('b', 'topik-1')]
    const map = { a: srs({ mastery: 'seedling' }), b: srs({ mastery: 'seedling' }) }
    expect(masteryByLevel(grammars, map).find((l) => l.level === 1)!.pct).toBe(0)
  })
```

- [ ] **Step 2: Run; verify the new cases fail**

Run: `npx vitest run tests/unit/stats/mastery.test.ts`
Expected: FAIL — the all-seedling level currently reports 100% (`pct` counts touched).

- [ ] **Step 3: Change the pct formula**

In `munbeop/app/lib/stats/mastery.ts`, update the `pct` loop and the doc comment:

```ts
  for (const l of levels) {
    const learned = l.plant + l.tree
    l.pct = l.total ? Math.round((learned / l.total) * 100) : 0
  }
```

And change the `LevelMastery.pct` doc comment to:

```ts
  /** Learned (plant + tree) as a rounded percentage of total — matches /paths. */
  pct: number
```

- [ ] **Step 4: Run; verify all mastery tests pass**

Run: `npx vitest run tests/unit/stats/mastery.test.ts`
Expected: PASS — including the pre-existing cases (their touched sets had no
seedlings, so learned == touched there).

- [ ] **Step 5: Add a parity test vs /paths**

Append a new describe block to `munbeop/tests/unit/stats/mastery.test.ts`:

```ts
import { pathProgress } from '~/lib/paths/progress'

describe('masteryByLevel ↔ pathProgress parity', () => {
  it('level pct equals pathProgress pct for the same topik-N kos', () => {
    const grammars = [g('a', 'topik-3'), g('b', 'topik-3'), g('c', 'topik-3')]
    const map = { a: srs({ mastery: 'tree' }), b: srs({ mastery: 'plant' }), c: srs({ mastery: 'seedling' }) }
    const lvl = masteryByLevel(grammars, map).find((l) => l.level === 3)!
    const path = pathProgress(['a', 'b', 'c'], map)
    expect(lvl.pct).toBe(Math.round(path.pct * 100)) // both = 2/3 → 67
  })
})
```

- [ ] **Step 6: Run; verify parity passes**

Run: `npx vitest run tests/unit/stats/mastery.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/stats/mastery.ts munbeop/tests/unit/stats/mastery.test.ts
git commit -m "fix(stats): TOPIK level % counts learned (plant+tree) only, matching /paths"
```

---

## Task 7: hydrate the activity store on sign-in / layout mount

**Files:**
- Modify: `munbeop/app/composables/useAuth.ts:29-34`
- Modify: `munbeop/app/layouts/default.vue:39-45`

- [ ] **Step 1: Add to the useAuth hydration batch**

In `munbeop/app/composables/useAuth.ts`, add the import near the other store imports, then add to the `Promise.all([...])` that calls `useSrsStore().hydrate()`:

```ts
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
      useActivityStore().hydrate(),
```

(Import: `import { useActivityStore } from '~/stores/activity'`.)

- [ ] **Step 2: Add to the layout hydration batch**

In `munbeop/app/layouts/default.vue`, add the same import and add `useActivityStore().hydrate()` to the `Promise.all([...])` next to `useLogStore().hydrate()`.

- [ ] **Step 3: Typecheck**

Run: `npx nuxt typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/composables/useAuth.ts munbeop/app/layouts/default.vue
git commit -m "feat(activity): hydrate activity store on sign-in and layout mount"
```

---

## Task 8: record an activity tick on every study answer

Each sub-step adds `const activity = useActivityStore()` (with `import { useActivityStore } from '~/stores/activity'`) and a `void activity.record()` (fire-and-forget; do not block the UI) at the confirmed insertion point. After all edits, one commit.

> Granularity rule: fire exactly once per answered question. Use `void` so a
> storage hiccup never breaks answering.

- [ ] **Step 1: `usePractice.ts` — in `persistEntry`, beside the existing `logStore.add`**

After the `await logStore.add({ ... })` (line ~149) add:

```ts
    void activity.record()
```

- [ ] **Step 2: `useOnboarding.ts` — in `complete()`, beside `logStore.add`**

After the `await logStore.add({ ... })` (line ~66) add `void activity.record()`.

- [ ] **Step 3: `useClozeDrill.ts` — in `answer(choice)` after `phase` is set (line ~67)**

```ts
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (!correct && runMode.value === 'normal') await logMistake(item.value, choice)
```

- [ ] **Step 4: `useConjugationDrill.ts` — in `answer()` after `phase` is set (line ~75)**

```ts
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (!correct && mode.value === 'normal') await logMistake(item.value, choice)
```

- [ ] **Step 5: `useRegisterDrill.ts` — in `answer(choice)` after `phase` is set (line ~76)**

```ts
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (!correct && runMode.value === 'normal') await logMistake(item.value, choice)
```

- [ ] **Step 6: `useParticleDrill.ts` — both terminal branches of `answer()`**

After `phase.value = 'right'` (correct branch, ~line 100) and after
`phase.value = 'wrong'` (wrong branch, ~line 124) add `void activity.record()`.
Do NOT add it to the `'blocked'`/`'contraction'` early returns.

- [ ] **Step 7: `useCounterDrill.ts` — in `answer()` after `phase` is set (line ~67)**

```ts
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
  }
```

(The leading `if (phase.value !== 'question') return` guard prevents double-fire.)

- [ ] **Step 8: `usePlacement.ts` — in `next()` after `recordAnswer` (line ~51)**

```ts
    ladder.value = recordAnswer(ladder.value, correct)
    void activity.record()
    if (ladder.value.done) {
```

- [ ] **Step 9: `useParticleExplore.ts` — once per session in setup body**

At the end of the composable setup (Explore has no answer), add a single tick so
the day lights up without per-sentence inflation:

```ts
  // Explore has no "answer"; one tick marks the day active.
  void useActivityStore().record()
```

(Place it as a plain statement in the composable body, after the store is
obtained. Add the import.)

- [ ] **Step 10: Typecheck + full suite**

Run: `npx nuxt typecheck` then `npx vitest run`
Expected: PASS. If a drill component test mounts these composables and now calls
the activity store, ensure the store has an active pinia in those tests (they
already `createPinia()`); the `record()` upsert is mocked via the storage
adapter mock or a real pinia with the noop adapter — fix any failing mount test
by stubbing `useActivityStore` where needed.

- [ ] **Step 11: Commit**

```bash
git add munbeop/app/composables/usePractice.ts munbeop/app/composables/useOnboarding.ts munbeop/app/composables/useClozeDrill.ts munbeop/app/composables/useConjugationDrill.ts munbeop/app/composables/useRegisterDrill.ts munbeop/app/composables/useParticleDrill.ts munbeop/app/composables/useCounterDrill.ts munbeop/app/composables/usePlacement.ts munbeop/app/composables/useParticleExplore.ts
git commit -m "feat(activity): record a tick on every study answer across all modes"
```

---

## Task 9: wire useStats to the activity source (TDD)

**Files:**
- Modify: `munbeop/app/composables/useStats.ts`
- Create/extend: `munbeop/tests/unit/composables/useStats.test.ts` (if it exists, extend; else create a focused one)

- [ ] **Step 1: Write/extend the failing test**

Create `munbeop/tests/unit/composables/useStats-activity.test.ts`:

```ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(async () => ({})), upsertOne: vi.fn(), write: vi.fn(), append: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useStats } from '~/composables/useStats'
import { useActivityStore } from '~/stores/activity'
import { useLogStore } from '~/stores/log'

describe('useStats activity + streaks', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('exposes merged daily counts and a longest streak', () => {
    const now = new Date(2026, 5, 26, 10).getTime()
    useActivityStore().map = { '2026-06-26': { count: 3 }, '2026-06-25': { count: 1 }, '2026-06-24': { count: 2 } }
    const s = useStats(now)
    expect(s.activityCounts.value['2026-06-26']).toBe(3)
    expect(s.streak.value).toBe(3) // 24-25-26 ending today
    expect(s.longestStreak.value).toBe(3)
  })
})
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run tests/unit/composables/useStats-activity.test.ts`
Expected: FAIL — `activityCounts`/`longestStreak` undefined.

- [ ] **Step 3: Update `useStats.ts`**

Edit `munbeop/app/composables/useStats.ts`:
- Add imports:

```ts
import { useActivityStore } from '~/stores/activity'
import { currentStreak, longestStreak as longestStreakOf, STREAK_GRACE_DAYS } from '~/lib/stats/streak'
import { mergedDailyCounts, localDayKey } from '~/lib/stats/activity'
```

(Remove the old `currentStreak` import line that imported only `currentStreak`.)

- Replace the streak block and add the activity-derived values:

```ts
  const activity = useActivityStore()

  const dailyCounts = computed(() => mergedDailyCounts(dateMs.value, activity.map))
  const activityCounts = computed(() =>
    Object.fromEntries(dailyCounts.value.entries()),
  )
  const dayKeys = computed(() => new Set(dailyCounts.value.keys()))
  const todayKey = computed(() => localDayKey(now))

  const streak = computed(() => currentStreak(dayKeys.value, todayKey.value, STREAK_GRACE_DAYS))
  const longestStreak = computed(() => longestStreakOf(dayKeys.value))
```

- Update `hasData` to include activity:

```ts
  const hasData = computed(
    () => sentences.value > 0 || Object.keys(srs.map).length > 0 || dayKeys.value.size > 0,
  )
```

- Add `activityCounts`, `longestStreak`, `dailyCounts` to the returned object.

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/unit/composables/useStats-activity.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the whole suite + typecheck**

Run: `npx vitest run` then `npx nuxt typecheck`
Expected: PASS. (If a pre-existing `useStats` test asserted the old streak via
log only, it still holds — the merged counts include log days.)

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/composables/useStats.ts munbeop/tests/unit/composables/useStats-activity.test.ts
git commit -m "feat(stats): useStats merges activity+log into daily counts and streaks"
```

---

## Task 10: heatmap green-ramp tokens

**Files:**
- Modify: `munbeop/app/assets/styles/tokens/colors-light.css`
- Modify: `munbeop/app/assets/styles/tokens/colors-dark.css`

- [ ] **Step 1: Add light ramp**

In `colors-light.css`, inside the `:root { ... }` block, add:

```css
  --heat-0: #e7e3d4;
  --heat-1: #cfe6a8;
  --heat-2: #9ecb5f;
  --heat-3: #639922;
  --heat-4: #3b6d11;
```

- [ ] **Step 2: Add dark ramp**

In `colors-dark.css`, inside the `[data-theme="dark"] { ... }` block, add:

```css
  --heat-0: #24271f;
  --heat-1: #2e5a1e;
  --heat-2: #3f7d22;
  --heat-3: #5aa62e;
  --heat-4: #7fce4a;
```

- [ ] **Step 3: Sanity check (lint)**

Run: `npx eslint .`
Expected: PASS (CSS not linted by eslint, but confirm nothing else broke).

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/assets/styles/tokens/colors-light.css munbeop/app/assets/styles/tokens/colors-dark.css
git commit -m "feat(tokens): activity heatmap green ramp (--heat-0..4)"
```

---

## Task 11: `ActivityHeatmap.vue` component (TDD)

**Files:**
- Create: `munbeop/app/components/stats/ActivityHeatmap.vue`
- Create: `munbeop/tests/components/stats/ActivityHeatmap.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `munbeop/tests/components/stats/ActivityHeatmap.test.ts` (follow the existing `tests/components/stats/StrugglingPlants.test.ts` mount/stub pattern):

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityHeatmap from '~/components/stats/ActivityHeatmap.vue'

const now = new Date(2026, 5, 26, 10).getTime()
const counts = { '2026-06-26': 5, '2026-06-25': 1, '2026-06-24': 2 }

describe('ActivityHeatmap', () => {
  it('renders cells and a footer with current + longest streak', () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    expect(w.findAll('[data-test="heat-cell"]').length).toBeGreaterThan(50)
    const txt = w.text()
    // current streak 3 (24-25-26), longest 3
    expect(w.find('[data-test="heat-streak-current"]').text()).toContain('3')
    expect(w.find('[data-test="heat-streak-longest"]').text()).toContain('3')
    expect(txt).toContain('stats.activity') // i18n key-echo present
  })

  it('moves to the previous year when the prev arrow is clicked', async () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    expect(w.find('[data-test="heat-year"]').text()).toContain('2026')
    await w.find('[data-test="heat-year-prev"]').trigger('click')
    expect(w.find('[data-test="heat-year"]').text()).toContain('2025')
  })

  it('shows a tooltip with the date and count on cell hover', async () => {
    const w = mount(ActivityHeatmap, { props: { counts, now } })
    const cell = w.findAll('[data-test="heat-cell"]').find((c) => c.attributes('data-day') === '2026-06-26')!
    await cell.trigger('mouseenter')
    expect(w.find('[data-test="heat-tip"]').text()).toContain('2026-06-26')
  })
})
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run tests/components/stats/ActivityHeatmap.test.ts`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement the component**

Create `munbeop/app/components/stats/ActivityHeatmap.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  yearGrid,
  intensityBucket,
  daysActive,
  dailyAverage,
  localDayKey,
  ordinalOf,
} from '~/lib/stats/activity'
import { currentStreak, longestStreak, STREAK_GRACE_DAYS } from '~/lib/stats/streak'

const props = defineProps<{ counts: Record<string, number>; now?: number }>()
const { t, locale } = useI18n()

const nowMs = computed(() => props.now ?? Date.now())
const todayKey = computed(() => localDayKey(nowMs.value))
const countsMap = computed(() => new Map(Object.entries(props.counts)))
const dayKeys = computed(() => new Set(Object.keys(props.counts)))

const year = ref(Number(todayKey.value.slice(0, 4)))
const minYear = computed(() => {
  const keys = Object.keys(props.counts)
  if (!keys.length) return year.value
  return Number(keys.reduce((a, b) => (a < b ? a : b)).slice(0, 4))
})
const maxYear = computed(() => Number(todayKey.value.slice(0, 4)))
function prevYear() { if (year.value > minYear.value) year.value-- }
function nextYear() { if (year.value < maxYear.value) year.value++ }

const grid = computed(() => yearGrid(countsMap.value, year.value, todayKey.value))

const streakCurrent = computed(() => currentStreak(dayKeys.value, todayKey.value, STREAK_GRACE_DAYS))
const streakLongest = computed(() => longestStreak(dayKeys.value))
const active = computed(() => daysActive(countsMap.value))
const avg = computed(() => dailyAverage(countsMap.value))

const fmtMonth = (col: number) => {
  const label = grid.value.months.find((m) => m.col === col)
  if (!label) return ''
  const monIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(label.label)
  return new Date(Date.UTC(year.value, monIdx, 1)).toLocaleDateString(locale.value, { month: 'short', timeZone: 'UTC' })
}

const tip = ref<{ day: string; count: number; x: number; y: number } | null>(null)
function showTip(e: MouseEvent, day: string, count: number, inYear: boolean, future: boolean) {
  if (!inYear || future) return
  const host = (e.currentTarget as HTMLElement).closest('.heat')!.getBoundingClientRect()
  const cell = (e.currentTarget as HTMLElement).getBoundingClientRect()
  tip.value = { day, count, x: cell.left - host.left + 30, y: cell.top - host.top - 4 }
}
function hideTip() { tip.value = null }

const weekdayLabels = computed(() => {
  // Mon, '', Wed, '', Fri, '', '' — using locale short names for rows 0,2,4
  const base = new Date(Date.UTC(2026, 5, 1)) // a Monday
  const lab = (offset: number) =>
    new Date(Date.UTC(2026, 5, 1 + offset)).toLocaleDateString(locale.value, { weekday: 'short', timeZone: 'UTC' })
  return [lab(0), '', lab(2), '', lab(4), '', '']
})
</script>

<template>
  <section class="heat-block">
    <div class="heat-head">
      <div>
        <h2 class="heat-title">{{ t('stats.activity.title') }}</h2>
        <p class="heat-sub">{{ t('stats.activity.sub') }}</p>
      </div>
      <div class="heat-nav">
        <button type="button" data-test="heat-year-prev" :aria-label="t('stats.activity.year_prev')" :disabled="year <= minYear" @click="prevYear">‹</button>
        <span class="heat-year" data-test="heat-year">{{ year }}</span>
        <button type="button" data-test="heat-year-next" :aria-label="t('stats.activity.year_next')" :disabled="year >= maxYear" @click="nextYear">›</button>
      </div>
    </div>

    <div class="heat">
      <div class="heat-months">
        <span v-for="(w, col) in grid.weeks" :key="'m' + col" class="heat-month">{{ fmtMonth(col) }}</span>
      </div>
      <div class="heat-body">
        <div class="heat-weekdays">
          <span v-for="(wd, r) in weekdayLabels" :key="'wd' + r">{{ wd }}</span>
        </div>
        <div class="heat-grid">
          <div v-for="(w, col) in grid.weeks" :key="col" class="heat-col">
            <div
              v-for="cell in w"
              :key="cell.dayKey"
              class="heat-cell"
              data-test="heat-cell"
              :data-day="cell.dayKey"
              :style="{
                background: cell.inYear && !cell.future ? `var(--heat-${intensityBucket(cell.count)})` : 'transparent',
                visibility: cell.inYear ? 'visible' : 'hidden',
              }"
              tabindex="0"
              @mouseenter="showTip($event, cell.dayKey, cell.count, cell.inYear, cell.future)"
              @focus="showTip($event, cell.dayKey, cell.count, cell.inYear, cell.future)"
              @mouseleave="hideTip"
              @blur="hideTip"
            />
          </div>
        </div>
      </div>
      <div v-if="tip" class="heat-tip" data-test="heat-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
        {{ tip.day }} · {{ t('stats.activity.tooltip', { count: tip.count }) }}
      </div>
    </div>

    <div class="heat-foot">
      <span>{{ t('stats.activity.avg') }} <b>{{ avg }}</b></span>
      <span>{{ t('stats.activity.days_active') }} <b>{{ active }}</b></span>
      <span data-test="heat-streak-longest">{{ t('stats.activity.streak_longest') }} <b>{{ streakLongest }}</b></span>
      <span data-test="heat-streak-current">{{ t('stats.activity.streak_current') }} <b>{{ streakCurrent }}</b></span>
    </div>
  </section>
</template>

<style scoped>
.heat-block { display: flex; flex-direction: column; gap: var(--space-2, 8px); }
.heat-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.heat-title { margin: 0; color: var(--text); }
.heat-sub { margin: 0; color: var(--text-soft); }
.heat-nav { display: flex; align-items: center; gap: 8px; }
.heat-nav button { background: var(--surface); border: 2px solid var(--border); color: var(--text); width: 28px; height: 28px; cursor: pointer; box-shadow: var(--shadow-button, 2px 2px 0 var(--border)); }
.heat-nav button:disabled { opacity: 0.4; cursor: default; }
.heat-year { font-family: var(--font-mono, monospace); color: var(--text); min-width: 48px; text-align: center; }
.heat { position: relative; overflow-x: auto; }
.heat-months { display: flex; margin-left: 30px; height: 14px; }
.heat-month { width: 13px; flex: 0 0 13px; font-size: 10px; color: var(--text-soft); font-family: var(--font-mono, monospace); }
.heat-body { display: flex; }
.heat-weekdays { display: flex; flex-direction: column; width: 30px; }
.heat-weekdays span { height: 13px; font-size: 9px; color: var(--text-soft); font-family: var(--font-mono, monospace); }
.heat-grid { display: flex; gap: 3px; }
.heat-col { display: flex; flex-direction: column; gap: 3px; }
.heat-cell { width: 10px; height: 10px; outline: 1px solid color-mix(in srgb, var(--border) 30%, transparent); }
.heat-cell:hover, .heat-cell:focus-visible { outline: 1px solid var(--text); }
.heat-tip { position: absolute; background: var(--text); color: var(--surface); font-size: 11px; font-family: var(--font-mono, monospace); padding: 4px 7px; white-space: nowrap; pointer-events: none; z-index: 5; }
.heat-foot { display: flex; flex-wrap: wrap; gap: 6px 18px; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text-soft); }
.heat-foot b { color: var(--heading-accent, var(--text)); }
@media (prefers-reduced-motion: reduce) { .heat-cell { transition: none; } }
</style>
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/components/stats/ActivityHeatmap.test.ts`
Expected: PASS. If the i18n key-echo for `tooltip` appends the param (e.g.
`stats.activity.tooltip 5`), the date assertion still holds.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/stats/ActivityHeatmap.vue munbeop/tests/components/stats/ActivityHeatmap.test.ts
git commit -m "feat(stats): Anki-style ActivityHeatmap (year nav, tooltip, streak footer)"
```

---

## Task 12: `MasteryBar.vue` extraction (TDD)

**Files:**
- Create: `munbeop/app/components/stats/MasteryBar.vue`
- Create: `munbeop/tests/components/stats/MasteryBar.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/stats/MasteryBar.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MasteryBar from '~/components/stats/MasteryBar.vue'

describe('MasteryBar', () => {
  it('renders three segments sized by tier and shows the learned pct', () => {
    const w = mount(MasteryBar, {
      props: { label: 'TOPIK 1', seedling: 2, plant: 1, tree: 1, total: 4, pct: 50 },
    })
    expect(w.text()).toContain('TOPIK 1')
    expect(w.text()).toContain('50%')
    expect(w.findAll('[data-test="bar-seg"]').length).toBe(3)
  })
})
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run tests/components/stats/MasteryBar.test.ts`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement**

Create `munbeop/app/components/stats/MasteryBar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  label: string; seedling: number; plant: number; tree: number; total: number; pct: number
}>()
const w = (part: number) => (props.total ? Math.round((part / props.total) * 100) : 0)
const seg = computed(() => ({ s: w(props.seedling), p: w(props.plant), t: w(props.tree) }))
</script>

<template>
  <div class="row" data-test="mastery-row">
    <span class="label">{{ label }}</span>
    <div class="bar">
      <div class="bar__seg seg--seedling" data-test="bar-seg" :style="{ width: seg.s + '%' }" />
      <div class="bar__seg seg--plant" data-test="bar-seg" :style="{ width: seg.p + '%' }" />
      <div class="bar__seg seg--tree" data-test="bar-seg" :style="{ width: seg.t + '%' }" />
    </div>
    <span class="pct">{{ pct }}%</span>
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 10px; }
.label { width: 64px; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text); }
.bar { flex: 1; height: 14px; display: flex; overflow: hidden; border: 2px solid var(--border); background: var(--surface); }
.bar__seg { height: 100%; }
.seg--seedling { background: var(--heat-1); }
.seg--plant { background: var(--heat-2); }
.seg--tree { background: var(--heat-4); }
.pct { width: 78px; text-align: right; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text); }
</style>
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run tests/components/stats/MasteryBar.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/stats/MasteryBar.vue munbeop/tests/components/stats/MasteryBar.test.ts
git commit -m "feat(stats): reusable MasteryBar (tier breakdown + learned pct)"
```

---

## Task 13: i18n keys in all 8 locales

**Files:**
- Modify: `munbeop/i18n/locales/en.json` (source of truth — mandatory)
- Modify: `es.json`, `fr.json`, `id.json`, `ja.json`, `pt-BR.json`, `th.json`, `vi.json`

- [ ] **Step 1: Add the `stats.activity` block to en.json**

Inside the `"stats": { ... }` object in `munbeop/i18n/locales/en.json`, add after `"hero": { ... }`:

```json
    "activity": {
      "title": "Your garden, day by day",
      "sub": "Every day you cultivate, a cell turns green.",
      "tooltip": "{count} answered",
      "avg": "Daily average",
      "days_active": "Days active",
      "streak_current": "Current streak",
      "streak_longest": "Longest streak",
      "year_prev": "Previous year",
      "year_next": "Next year"
    },
```

- [ ] **Step 2: Update the mastery sub-copy (now learned-based)**

Change `stats.mastery.sub` in en.json to:

```json
      "sub": "How much of each TOPIK level you've actually learned."
```

- [ ] **Step 3: Mirror into the other 7 locales**

Add the same `stats.activity` block (translated) and updated `stats.mastery.sub`
to each of `es, fr, id, ja, pt-BR, th, vi`. English is the i18n fallback, so a
missing key renders the English string — but provide real translations for `es`
(owner's UI language) at minimum; the rest may copy English if a translation is
not immediately available, matching the existing partial-locale pattern.

Spanish (`es.json`) values:

```json
    "activity": {
      "title": "Tu jardín, día a día",
      "sub": "Cada día que cultivas, una celda se vuelve verde.",
      "tooltip": "{count} respondidas",
      "avg": "Promedio diario",
      "days_active": "Días activos",
      "streak_current": "Racha actual",
      "streak_longest": "Racha más larga",
      "year_prev": "Año anterior",
      "year_next": "Año siguiente"
    },
```
and `stats.mastery.sub`: `"Cuánto has aprendido de verdad en cada nivel TOPIK."`

- [ ] **Step 4: Validate JSON + run i18n-related tests**

Run: `npx vitest run` (any locale-shape/seed-invariants tests will catch a JSON
typo) and confirm the 8 files parse (`node -e "require('./i18n/locales/en.json')"`
for each, or rely on typecheck/test).

- [ ] **Step 5: Commit**

```bash
git add munbeop/i18n/locales
git commit -m "i18n(stats): activity heatmap strings (8 locales) + learned mastery sub"
```

---

## Task 14: `/stats` redesign — integrate heatmap, MasteryBar, design tokens

**Files:**
- Modify: `munbeop/app/pages/stats.vue`

- [ ] **Step 1: Update the script + template**

In `munbeop/app/pages/stats.vue`:
- Import the new pieces and pull the new values from `useStats`:

```ts
import ActivityHeatmap from '~/components/stats/ActivityHeatmap.vue'
import MasteryBar from '~/components/stats/MasteryBar.vue'
```
```ts
const {
  sentences, streak, longestStreak, masteredCount, catalogTotal, pendingReviews,
  masteryLevels, weekly, split, topContexts, toughest, hasData, activityCounts,
} = useStats()
```

- Insert the heatmap as the first block after the title (only when `hasData`):

```vue
    <template v-else>
      <ActivityHeatmap :counts="activityCounts" />

      <div class="hero">
        <!-- existing 4 hero cards, restyled -->
      </div>
```

- Replace the bespoke mastery `v-for` bar markup with `MasteryBar`:

```vue
        <div class="mastery">
          <MasteryBar
            v-for="lvl in masteryLevels"
            :key="lvl.level"
            :label="`TOPIK ${lvl.level}`"
            :seedling="lvl.seedling"
            :plant="lvl.plant"
            :tree="lvl.tree"
            :total="lvl.total"
            :pct="lvl.pct"
          />
        </div>
```

- (Optional) Add a longest-streak figure to the streak hero card:

```vue
        <div class="hero__card" data-test="hero-card">
          <div class="hero__label">{{ t('stats.hero.streak') }}</div>
          <div class="hero__value">{{ streak }} <span class="hero__total">/ {{ longestStreak }}</span></div>
        </div>
```

- [ ] **Step 2: Swap hardcoded styles for tokens**

In the `<style scoped>` block, replace:
- `var(--paper-warm)` → `var(--surface)`; `var(--ink)` → `var(--text)`;
  `var(--ink-soft)` → `var(--text-soft)`; `var(--border)` kept.
- `border-radius: 10px|8px|999px` → `0` (pixel-art square) or `var(--radius-sm)`
  for small chips.
- Literal `font-family: 'Inter'/'Noto Sans KR'/'JetBrains Mono'` →
  `var(--font-ui)` / `var(--font-ko)` / `var(--font-mono)`.
- Hero card border → `2px solid var(--border)` + `box-shadow: var(--shadow-card)`.
- Delete the now-unused `.bar`, `.bar__seg*`, `.mastery__*`, `.dot*`, `.legend*`
  rules superseded by `MasteryBar` (keep the legend block if still rendered, but
  point its colors at `--heat-1/2/4`).

- [ ] **Step 3: Run the stats page test (extend it for the bug guard)**

Add to (or create) `munbeop/tests/components/stats/stats-page.test.ts` a case
that mounts `stats.vue` (stubbing children) with an all-seedling srs map and a
non-empty activity map, asserting a `data-test="mastery-row"` shows `0%` and the
`ActivityHeatmap` stub is present. If mounting the full page is heavy, assert via
`useStats` output instead (already covered) and keep this as a render smoke test
with child stubs.

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 4: Typecheck + lint**

Run: `npx nuxt typecheck` then `npx eslint .`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/pages/stats.vue munbeop/tests/components/stats/stats-page.test.ts
git commit -m "feat(stats): redesign /stats with activity heatmap + design tokens"
```

---

## Task 15: Full verification + preview

- [ ] **Step 1: Full gate**

Run, in `munbeop/`:
```bash
npx vitest run
npx nuxt typecheck
npx eslint .
```
Expected: all green. Note the baseline test count before and after — it must
only increase (guard against a subagent escaping the worktree).

- [ ] **Step 2: Preview-verify the real page**

Start the dev server (preview_start), sign in as the test account
(`ana@ana.com`), open `/stats`. Confirm with text tools + a screenshot:
- TOPIK levels read realistic numbers (not all 100%); an all-seedling level is 0%.
- The heatmap renders, hovering a cell shows date + count, the year arrows work.
- Footer shows daily average / days active / longest / current streak.
- Browse the Library, return to `/stats` — levels do NOT jump to 100% (peek fix).
- Toggle dark mode — the ramp and surfaces stay legible.

- [ ] **Step 3: Screenshot proof for the user**

Capture a `/stats` screenshot (light + dark) to share.

- [ ] **Step 4: Final commit / PR**

Open a PR from the worktree branch to `main` summarizing: bug fix (peek +
learned %), `/paths` parity, `user_activity` + heatmap, current/longest streak,
redesign, i18n, tests. Mention the migration was applied and types regenerated.

---

## Self-review notes (coverage vs spec)
- §3a peek → Task 5. §3b learned% → Task 6. §4 unification/parity → Task 6 (parity test) + shared `isLearned` already in `lib/paths/progress.ts` (imported by the parity test; `mastery.ts` keeps its own tier tally but is asserted equal).
- §5 activity model/table/adapter/store/recording → Tasks 1–4, 7, 8.
- §6 heatmap helpers/component/streaks → Tasks 2, 11.
- §7 redesign → Tasks 10, 12, 14. §8 i18n → Task 13. §9 testing → throughout. §10 file list → all. §11 risks → addressed (types regen Task 1, assertNever Task 3, max-merge Task 2, overflow-scroll Task 11).
- §12 optional home mini-heatmap → intentionally NOT a task (owner to confirm; `ActivityHeatmap` is reusable if approved later).
