# Mistake feed + errorDimension tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A grouped "plants to revisit" section on `/log` plus an optional one-tap `errorDimension` tag captured in the practice error block and persisted on `user_log`.

**Architecture:** Pure `groupPendingByKo` over existing log data; `errorDimension` threaded from `ErrorNoteBlock` → `GrammarCard` → `usePractice` → `logStore.add` → a new nullable `user_log.error_dimension` column; `/log` recomposed into `MistakeFeed` + reused `LogEntryRow`. No god files. Spec: `docs/superpowers/specs/2026-06-20-mistake-feed-design.md`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Supabase, Vitest (happy-dom), @nuxtjs/i18n (8 locales), pnpm.

**Working directory:** all paths relative to `munbeop/`; run commands from `munbeop/`. Branch: `claude/mistake-feed`.

**Verified facts:**
- `LogEntry` + `isPendingReview` in `app/lib/domain/log.ts`; `~/lib/domain` re-exports it.
- Adapter `logRow()` (`app/lib/storage/supabase.ts:64`) maps columns incl. `error_note`; log read-map at `:142-152`. Migration filenames: `YYYYMMDDHHMMSS_name.sql` under `supabase/migrations/`.
- `user_log` types in `app/types/database.types.ts:191` (Row/Insert/Update).
- `logStore.add` (`app/stores/log.ts:19`) param `{ ko, sentence, feedback, errorNote, reviewState, contextId, contextName }`.
- `usePractice.persistEntry` (`app/composables/usePractice.ts:104`) param `{ pickIndex, sentence, feedback, errorNote }`; called by `ruleta.vue onSubmit`.
- `ErrorNoteBlock.vue` emits `update:modelValue|save|skip`; `GrammarCard.vue` submit payload `{ pickIndex, sentence, feedback, errorNote }`.
- Adapter test harness `tests/unit/storage/supabase.test.ts`: mock client with `data`/`writes`/`errors`.
- Test harness: happy-dom, `useI18n` key-echo stub, NuxtLink renders a real `<a>` in tests, mount via `@vue/test-utils`.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/lib/domain/log.ts` (modify) | Add `ERROR_DIMENSIONS`, `ErrorDimension`, `LogEntry.errorDimension`. |
| `app/lib/log/group.ts` (create) | `groupPendingByKo`. Pure. |
| `app/stores/log.ts` (modify) | `add` accepts + stores `errorDimension`. |
| `app/composables/usePractice.ts` (modify) | `persistEntry` accepts + forwards `errorDimension`. |
| `app/components/practice/ErrorNoteBlock.vue` (modify) | 5 dimension chips + `v-model:dimension`. |
| `app/components/practice/GrammarCard.vue` (modify) | hold `errorDimension`, include in submit, reset. |
| `app/pages/practice/ruleta.vue` (modify) | widen `onSubmit` payload type. |
| `supabase/migrations/20260620000001_user_log_error_dimension.sql` (create) | `ALTER TABLE ... ADD COLUMN error_dimension text`. |
| `app/lib/storage/supabase.ts` (modify) | `logRow` + read-map map `error_dimension`. |
| `app/types/database.types.ts` (modify) | regenerated `user_log` types. |
| `app/components/log/LogEntryRow.vue` (create) | one entry's markup + dimension chip + review emit. |
| `app/components/log/MistakeFeed.vue` (create) | grouped "plants to revisit" section. |
| `app/pages/log.vue` (modify) | compose `MistakeFeed` + recent list of `LogEntryRow`. |
| `i18n/locales/*.json` ×8 (modify) | `dimension.*` + `journal.revisit_*`. |
| Tests (create) | `tests/unit/domain/error-dimension.test.ts`, `tests/unit/log/group.test.ts`, `tests/unit/stores/log.errorDimension.test.ts`, `tests/components/practice/ErrorNoteBlock.test.ts`, `tests/components/log/LogEntryRow.test.ts`, `tests/components/log/MistakeFeed.test.ts`, `tests/unit/i18n/dimension-keys.test.ts`; extend `tests/unit/storage/supabase.test.ts`. |

---

## Task 1: Domain — `ERROR_DIMENSIONS` + `LogEntry.errorDimension`

**Files:** Modify `app/lib/domain/log.ts`; Test `tests/unit/domain/error-dimension.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/domain/error-dimension.test.ts
import { describe, it, expect } from 'vitest'
import { ERROR_DIMENSIONS } from '~/lib/domain'

describe('ERROR_DIMENSIONS', () => {
  it('is exactly the five known failure dimensions in order', () => {
    expect(ERROR_DIMENSIONS).toEqual(['particle', 'ending', 'register', 'word_order', 'other'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/domain/error-dimension.test.ts`
Expected: FAIL — `ERROR_DIMENSIONS` is not exported.

- [ ] **Step 3: Edit `app/lib/domain/log.ts`**

At the top, add the dimensions; then add the field to `LogEntry`. Replace:

```ts
export type Feedback = 'easy' | 'hard'

export type ReviewState = 'unreviewed' | 'correct' | 'incorrect'
```

with:

```ts
export type Feedback = 'easy' | 'hard'

export type ReviewState = 'unreviewed' | 'correct' | 'incorrect'

/** Which dimension a struggled sentence failed on — optional diagnostic tag. */
export const ERROR_DIMENSIONS = ['particle', 'ending', 'register', 'word_order', 'other'] as const
export type ErrorDimension = (typeof ERROR_DIMENSIONS)[number]
```

Then, inside `interface LogEntry`, add this field after `errorNote`:

```ts
  /** Optional one-tap diagnostic tag for what slipped (particle/ending/…). */
  errorDimension?: ErrorDimension | null
```

(`~/lib/domain` re-exports `log.ts` via `index.ts`, so the new symbols are available from `~/lib/domain`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/domain/error-dimension.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/lib/domain/log.ts tests/unit/domain/error-dimension.test.ts
git commit -m "feat(log): ErrorDimension type + optional LogEntry.errorDimension

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `groupPendingByKo` (pure)

**Files:** Create `app/lib/log/group.ts`; Test `tests/unit/log/group.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/log/group.test.ts
import { describe, it, expect } from 'vitest'
import { groupPendingByKo } from '~/lib/log/group'
import type { LogEntry } from '~/lib/domain'

const e = (over: Partial<LogEntry>): LogEntry => ({
  id: Math.random(),
  ko: 'A',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  reviewState: 'unreviewed',
  contextId: 'banmal',
  contextName: '반말',
  date: '2026-06-20T00:00:00Z',
  ...over,
})

describe('groupPendingByKo', () => {
  it('keeps only pending entries, groups by ko, sorts by group size desc', () => {
    const entries = [
      e({ ko: 'A', feedback: 'hard' }), // pending (hard)
      e({ ko: 'A', feedback: 'hard' }), // pending
      e({ ko: 'B', feedback: 'easy', errorNote: null }), // NOT pending (easy, no note)
      e({ ko: 'C', feedback: 'easy', errorNote: 'oops' }), // pending (note)
      e({ ko: 'A', feedback: 'hard', reviewState: 'correct' }), // NOT pending (reviewed)
    ]
    const groups = groupPendingByKo(entries)
    expect(groups.map((g) => g.ko)).toEqual(['A', 'C']) // A has 2, C has 1
    expect(groups[0]!.entries).toHaveLength(2)
    expect(groups[1]!.entries).toHaveLength(1)
  })
  it('returns empty for no pending entries', () => {
    expect(groupPendingByKo([e({ feedback: 'easy', errorNote: null })])).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/log/group.test.ts`
Expected: FAIL — cannot resolve `~/lib/log/group`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/lib/log/group.ts
import { isPendingReview, type LogEntry } from '~/lib/domain'

export interface PendingGroup {
  ko: string
  entries: LogEntry[]
}

/**
 * Group the still-pending diary entries by grammar pattern, most-struggled
 * first. Pure: only `isPendingReview` entries survive; insertion order is
 * preserved within a group, ties broken by first appearance.
 */
export function groupPendingByKo(entries: readonly LogEntry[]): PendingGroup[] {
  const byKo = new Map<string, LogEntry[]>()
  for (const e of entries) {
    if (!isPendingReview(e)) continue
    const list = byKo.get(e.ko)
    if (list) list.push(e)
    else byKo.set(e.ko, [e])
  }
  // Map preserves insertion order; sort by size desc with a stable fallback.
  return [...byKo.entries()]
    .map(([ko, list]) => ({ ko, entries: list }))
    .sort((a, b) => b.entries.length - a.entries.length)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/log/group.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/log/group.ts tests/unit/log/group.test.ts
git commit -m "feat(log): groupPendingByKo — pending entries grouped by pattern

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Supabase migration + types

**Files:** Create `supabase/migrations/20260620000001_user_log_error_dimension.sql`; Modify `app/types/database.types.ts` (via regeneration). **This applies a change to the LIVE Supabase project — additive + nullable, backward-compatible.**

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260620000001_user_log_error_dimension.sql
-- Optional one-tap diagnostic tag for a struggled sentence. Nullable + additive
-- so existing rows and older clients are unaffected.
alter table public.user_log
  add column if not exists error_dimension text;
```

- [ ] **Step 2: Apply to the live project via the Supabase MCP**

Use the Supabase MCP `apply_migration` tool (project `zbohswpyydwvzowvjaiw`), name `user_log_error_dimension`, with the SQL above. Confirm success.

- [ ] **Step 3: Regenerate types**

Use the Supabase MCP `generate_typescript_types` and overwrite `app/types/database.types.ts` with the result.

- [ ] **Step 4: Verify the diff is only `error_dimension`**

Run: `git diff --stat app/types/database.types.ts` then `git diff app/types/database.types.ts`
Expected: the only additions are `error_dimension: string | null` (Row) and `error_dimension?: string | null` (Insert/Update) under `user_log`. If anything else changed, stop and investigate schema drift.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260620000001_user_log_error_dimension.sql app/types/database.types.ts
git commit -m "feat(db): user_log.error_dimension nullable column + regenerated types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Adapter round-trip (`error_dimension`)

**Files:** Modify `app/lib/storage/supabase.ts`; Test extend `tests/unit/storage/supabase.test.ts`

- [ ] **Step 1: Write the failing test (extend the suite)**

Add these two tests inside the existing `describe('read', …)` and `describe('write', …)` blocks (or as a new `describe('error_dimension round-trip', …)` at top level after the existing ones):

```ts
// tests/unit/storage/supabase.test.ts — add near the other log tests
it('log read maps error_dimension into errorDimension', async () => {
  client.data.user_log = [
    {
      id: 2, ko: 'A', sentence: 'x', feedback: 'hard', error_note: null,
      error_dimension: 'particle', review_state: 'unreviewed',
      context_id: 'banmal', context_name: '반말', created_at: '2026-06-20T00:00:00Z',
    },
  ]
  const entries = await adapter.read(STORAGE_KEYS.log, [])
  expect((entries as Array<{ errorDimension?: string | null }>)[0]?.errorDimension).toBe('particle')
})

it('log write includes error_dimension in the upserted row', async () => {
  await adapter.write(STORAGE_KEYS.log, [
    {
      id: 3, ko: 'A', sentence: 'x', feedback: 'hard', errorNote: null,
      errorDimension: 'ending', reviewState: 'unreviewed',
      contextId: 'banmal', contextName: '반말', date: '2026-06-20T00:00:00Z',
    },
  ])
  const upsert = client.writes.find((w) => w.table === 'user_log' && w.op === 'upsert')
  const rows = upsert!.payload as Array<{ error_dimension: string | null }>
  expect(rows[0]?.error_dimension).toBe('ending')
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/storage/supabase.test.ts`
Expected: FAIL — `errorDimension` is `undefined` on read; `error_dimension` missing on write.

- [ ] **Step 3: Map the column in the adapter**

In `app/lib/storage/supabase.ts`, in `logRow()` add the field after `error_note`:

```ts
      error_note: e.errorNote,
      error_dimension: e.errorDimension ?? null,
```

And in the log read-map (the `STORAGE_KEYS.log` `case` in `read`), add after `errorNote: r.error_note,`:

```ts
          errorNote: r.error_note,
          errorDimension: r.error_dimension ?? null,
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/storage/supabase.test.ts`
Expected: PASS (all, incl. the 2 new).

- [ ] **Step 5: Commit**

```bash
git add app/lib/storage/supabase.ts tests/unit/storage/supabase.test.ts
git commit -m "feat(storage): map user_log.error_dimension both directions

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Thread `errorDimension` through the write path

**Files:** Modify `app/stores/log.ts`, `app/composables/usePractice.ts`, `app/pages/practice/ruleta.vue`; Test `tests/unit/stores/log.errorDimension.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/stores/log.errorDimension.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLogStore } from '~/stores/log'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ append: vi.fn().mockResolvedValue(undefined) }),
}))

describe('logStore.add errorDimension', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })
  it('stores errorDimension on the new entry', async () => {
    const store = useLogStore()
    const entry = await store.add({
      ko: 'A', sentence: 's', feedback: 'hard', errorNote: null,
      errorDimension: 'register', reviewState: 'unreviewed',
      contextId: 'banmal', contextName: '반말',
    })
    expect(entry.errorDimension).toBe('register')
    expect(store.entries[0]!.errorDimension).toBe('register')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/stores/log.errorDimension.test.ts`
Expected: FAIL — `add` does not accept/store `errorDimension` (type error / undefined).

- [ ] **Step 3a: `app/stores/log.ts`** — widen the `add` param. Replace:

```ts
  async function add(p: {
    ko: string
    sentence: string
    feedback: Feedback
    errorNote: string | null
    reviewState: ReviewState
    contextId: string
    contextName: string
  }): Promise<LogEntry> {
```

with (add the import + the optional field):

```ts
  async function add(p: {
    ko: string
    sentence: string
    feedback: Feedback
    errorNote: string | null
    errorDimension?: ErrorDimension | null
    reviewState: ReviewState
    contextId: string
    contextName: string
  }): Promise<LogEntry> {
```

and update the import at the top of `app/stores/log.ts`:

```ts
import type { LogEntry, Feedback, ReviewState, ErrorDimension } from '~/lib/domain'
```

The existing `const entry: LogEntry = { id, date, ...p }` already spreads `errorDimension` through — no further change.

- [ ] **Step 3b: `app/composables/usePractice.ts`** — widen `persistEntry`. Replace its param block:

```ts
  async function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
  }): Promise<LogEntry | null> {
```

with:

```ts
  async function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
    errorDimension?: ErrorDimension | null
  }): Promise<LogEntry | null> {
```

and pass it into `logStore.add`, replacing:

```ts
      errorNote: hasNote ? p.errorNote : null,
      reviewState,
```

with:

```ts
      errorNote: hasNote ? p.errorNote : null,
      errorDimension: p.errorDimension ?? null,
      reviewState,
```

Update the import line in `usePractice.ts` (it already imports several domain types) to include `ErrorDimension`:

```ts
import type { Context, ErrorDimension, Feedback, Grammar, LogEntry, ReviewState } from '~/lib/domain'
```

- [ ] **Step 3c: `app/pages/practice/ruleta.vue`** — widen `onSubmit`'s payload type. Replace:

```ts
async function onSubmit(payload: {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
}) {
```

with:

```ts
async function onSubmit(payload: {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
  errorDimension?: import('~/lib/domain').ErrorDimension | null
}) {
```

(`persistEntry(payload)` already forwards the whole object.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/stores/log.errorDimension.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add app/stores/log.ts app/composables/usePractice.ts app/pages/practice/ruleta.vue tests/unit/stores/log.errorDimension.test.ts
git commit -m "feat(practice): thread errorDimension through the write path

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Capture UI — dimension chips in `ErrorNoteBlock` + `GrammarCard`

**Files:** Modify `app/components/practice/ErrorNoteBlock.vue`, `app/components/practice/GrammarCard.vue`; Test `tests/components/practice/ErrorNoteBlock.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/practice/ErrorNoteBlock.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorNoteBlock from '~/components/practice/ErrorNoteBlock.vue'

function mountBlock(dimension: string | null = null) {
  return mount(ErrorNoteBlock, { props: { modelValue: '', dimension } })
}

describe('ErrorNoteBlock dimension chips', () => {
  it('renders a chip per dimension and selecting one emits update:dimension', async () => {
    const w = mountBlock(null)
    await w.find('[data-testid="dim-particle"]').trigger('click')
    expect(w.emitted('update:dimension')?.[0]?.[0]).toBe('particle')
  })
  it('tapping the selected chip clears it (emits null)', async () => {
    const w = mountBlock('ending')
    await w.find('[data-testid="dim-ending"]').trigger('click')
    expect(w.emitted('update:dimension')?.[0]?.[0]).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/components/practice/ErrorNoteBlock.test.ts`
Expected: FAIL — no `[data-testid="dim-particle"]`.

- [ ] **Step 3: Update `app/components/practice/ErrorNoteBlock.vue`**

Replace the whole `<script setup>` block:

```ts
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import { ERROR_DIMENSIONS, type ErrorDimension } from '~/lib/domain'

interface Props {
  modelValue: string
  dimension: ErrorDimension | null
}
defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [string]
  'update:dimension': [ErrorDimension | null]
  save: []
  skip: []
}>()
const { t } = useI18n()

function toggle(current: ErrorDimension | null, d: ErrorDimension) {
  emit('update:dimension', current === d ? null : d)
}
```

Then add the chip row inside the template, right after the `enote__label` div and before the `<Input>`:

```html
    <div class="enote__dims" role="group" :aria-label="t('dimension.prompt')">
      <button
        v-for="d in ERROR_DIMENSIONS"
        :key="d"
        type="button"
        class="enote__chip"
        :class="{ 'enote__chip--on': dimension === d }"
        :data-testid="`dim-${d}`"
        :aria-pressed="dimension === d"
        @click="toggle(dimension, d)"
      >
        {{ t(`dimension.${d}`) }}
      </button>
    </div>
```

Add chip styles to the `<style scoped>` block:

```css
.enote__dims {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.enote__chip {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  padding: 4px 10px;
  border: 1.5px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}
.enote__chip--on {
  border-color: var(--danger, var(--red));
  background: color-mix(in oklch, var(--red) 16%, var(--surface));
}
.enote__chip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Update `app/components/practice/GrammarCard.vue`** to own the dimension and include it in the payload.

Add to the imports:

```ts
import type { Context, ErrorDimension, Grammar } from '~/lib/domain'
```

(replacing the existing `import type { Context, Grammar } from '~/lib/domain'`).

Widen the `submit` emit payload type:

```ts
const emit = defineEmits<{
  submit: [
    {
      pickIndex: number
      sentence: string
      feedback: 'easy' | 'hard'
      errorNote: string | null
      errorDimension: ErrorDimension | null
    },
  ]
}>()
```

Add state + reset:

```ts
const errorNote = ref('')
const errorDimension = ref<ErrorDimension | null>(null)
```

```ts
function reset() {
  sentence.value = ''
  showErrorBlock.value = false
  errorNote.value = ''
  errorDimension.value = null
}
```

Include `errorDimension` in all three emit payloads (`onEasy` → `null`; `onSaveWithNote` and `onSkipNote` → `errorDimension.value`):

```ts
function onEasy() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', { pickIndex: props.pickIndex, sentence: text, feedback: 'easy', errorNote: null, errorDimension: null })
  reset()
}
function onSaveWithNote() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', { pickIndex: props.pickIndex, sentence: text, feedback: 'hard', errorNote: errorNote.value.trim(), errorDimension: errorDimension.value })
  reset()
}
function onSkipNote() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', { pickIndex: props.pickIndex, sentence: text, feedback: 'hard', errorNote: null, errorDimension: errorDimension.value })
  reset()
}
```

Bind the dimension on the `ErrorNoteBlock` in the template:

```html
    <ErrorNoteBlock
      v-if="showErrorBlock"
      v-model="errorNote"
      v-model:dimension="errorDimension"
      @save="onSaveWithNote"
      @skip="onSkipNote"
    />
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run tests/components/practice/ErrorNoteBlock.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add app/components/practice/ErrorNoteBlock.vue app/components/practice/GrammarCard.vue tests/components/practice/ErrorNoteBlock.test.ts
git commit -m "feat(practice): one-tap errorDimension chips in the error block

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: `LogEntryRow` + `MistakeFeed` + recompose `log.vue`

**Files:** Create `app/components/log/LogEntryRow.vue`, `app/components/log/MistakeFeed.vue`; Modify `app/pages/log.vue`; Tests `tests/components/log/LogEntryRow.test.ts`, `tests/components/log/MistakeFeed.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/components/log/LogEntryRow.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LogEntryRow from '~/components/log/LogEntryRow.vue'
import type { LogEntry } from '~/lib/domain'

const entry = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: 7, ko: '-아/어서', sentence: '주말에 만나서 좋았어', feedback: 'hard',
  errorNote: null, errorDimension: 'particle', reviewState: 'unreviewed',
  contextId: 'banmal', contextName: '반말', date: '2026-06-20T00:00:00Z', ...over,
})

describe('LogEntryRow', () => {
  it('shows the dimension chip when set and emits review on mark-reviewed', async () => {
    const w = mount(LogEntryRow, { props: { entry: entry() } })
    expect(w.text()).toContain('dimension.particle') // key-echo stub
    await w.find('[data-testid="mark-reviewed"]').trigger('click')
    expect(w.emitted('review')?.[0]?.[0]).toBe(7)
  })
  it('shows the reviewed badge instead of the button once reviewed', () => {
    const w = mount(LogEntryRow, { props: { entry: entry({ reviewState: 'correct' }) } })
    expect(w.find('[data-testid="mark-reviewed"]').exists()).toBe(false)
    expect(w.find('[data-testid="reviewed-badge"]').exists()).toBe(true)
  })
})
```

```ts
// tests/components/log/MistakeFeed.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MistakeFeed from '~/components/log/MistakeFeed.vue'
import type { LogEntry } from '~/lib/domain'

const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(), ko: 'A', sentence: 's', feedback: 'hard', errorNote: null,
  errorDimension: null, reviewState: 'unreviewed', contextId: 'banmal',
  contextName: '반말', date: '2026-06-20T00:00:00Z', ...over,
})

describe('MistakeFeed', () => {
  it('renders a group per pending ko with a focus-practice link', () => {
    const w = mount(MistakeFeed, { props: { entries: [e({ ko: 'A' }), e({ ko: 'A' }), e({ ko: 'B', feedback: 'easy' })] } })
    const links = w.findAll('a')
    expect(links.some((a) => a.attributes('href') === '/practice/ruleta?focus=A')).toBe(true)
    // 'B' is easy/no-note → not pending → no group
    expect(links.some((a) => a.attributes('href') === '/practice/ruleta?focus=B')).toBe(false)
  })
  it('renders nothing when there are no pending entries', () => {
    const w = mount(MistakeFeed, { props: { entries: [e({ feedback: 'easy' })] } })
    expect(w.find('[data-testid="mistake-feed"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run tests/components/log/LogEntryRow.test.ts tests/components/log/MistakeFeed.test.ts`
Expected: FAIL — components do not exist.

- [ ] **Step 3a: Create `app/components/log/LogEntryRow.vue`**

```vue
<script setup lang="ts">
import { isPendingReview, type LogEntry } from '~/lib/domain'

const props = defineProps<{ entry: LogEntry }>()
defineEmits<{ review: [number] }>()
const { t } = useI18n()
const pending = computed(() => isPendingReview(props.entry))
</script>

<template>
  <li
    class="entry"
    :class="{ 'entry--pending': pending, 'entry--reviewed': entry.reviewState !== 'unreviewed' }"
  >
    <div class="entry__head">
      <span class="entry__ko">{{ entry.ko }}</span>
      <span class="entry__date">{{ new Date(entry.date).toLocaleString() }}</span>
    </div>
    <div class="entry__sentence">{{ entry.sentence }}</div>
    <p v-if="entry.errorNote" class="entry__note" data-test="entry-note">
      <span class="entry__note-label">{{ t('journal.note_label') }}:</span> {{ entry.errorNote }}
    </p>
    <div class="entry__foot">
      <span class="entry__meta">
        {{ entry.contextName }} ·
        {{ entry.feedback === 'easy' ? t('practice.fb_easy') : t('practice.fb_hard') }}
        <span v-if="entry.errorDimension" class="entry__dim">· {{ t(`dimension.${entry.errorDimension}`) }}</span>
      </span>
      <button
        v-if="pending"
        type="button"
        class="review-btn"
        data-testid="mark-reviewed"
        data-test="mark-reviewed"
        @click="$emit('review', entry.id)"
      >
        {{ t('journal.mark_reviewed') }}
      </button>
      <span
        v-else-if="entry.reviewState !== 'unreviewed'"
        class="reviewed-badge"
        data-testid="reviewed-badge"
        data-test="reviewed-badge"
      >
        ✓ {{ t('journal.reviewed') }}
      </span>
    </div>
  </li>
</template>

<style scoped>
.entry { background: var(--paper-warm); border-left: 3px solid var(--sky); padding: 12px 16px; }
.entry--pending { border-left-color: var(--gold, #d4a017); }
.entry--reviewed { border-left-color: var(--jade, #3f9d6b); }
.entry__head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
.entry__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; }
.entry__date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); }
.entry__sentence { font-family: 'Noto Sans KR', sans-serif; font-size: 15px; }
.entry__note { margin: 6px 0 0; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.entry__note-label { font-weight: 600; color: var(--ink); }
.entry__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.entry__meta { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.entry__dim { color: var(--ink); }
.review-btn { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: var(--ink); background: var(--paper); border: 1.5px solid var(--gold, #d4a017); border-radius: 999px; padding: 4px 12px; cursor: pointer; transition: background var(--motion-quick, 120ms) ease; }
.review-btn:hover { background: var(--paper-deep, var(--paper-warm)); }
.review-btn:focus-visible { outline: 2px solid var(--focus-ring, var(--sky)); outline-offset: 2px; }
.reviewed-badge { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: var(--jade, #3f9d6b); }
</style>
```

- [ ] **Step 3b: Create `app/components/log/MistakeFeed.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { LogEntry } from '~/lib/domain'
import { groupPendingByKo } from '~/lib/log/group'
import LogEntryRow from './LogEntryRow.vue'

const props = defineProps<{ entries: LogEntry[] }>()
defineEmits<{ review: [number] }>()
const { t } = useI18n()
const groups = computed(() => groupPendingByKo(props.entries))
</script>

<template>
  <section v-if="groups.length" class="feed" data-testid="mistake-feed">
    <h2 class="feed__title">{{ t('journal.revisit_title') }}</h2>
    <div v-for="g in groups" :key="g.ko" class="feed__group">
      <div class="feed__group-head">
        <span class="feed__ko">{{ g.ko }}</span>
        <span class="feed__count">{{ t('journal.revisit_count', { n: g.entries.length }) }}</span>
        <NuxtLink class="feed__practice" :to="`/practice/ruleta?focus=${g.ko}`">
          {{ t('journal.revisit_practice') }}
        </NuxtLink>
      </div>
      <ul class="feed__list">
        <LogEntryRow v-for="e in g.entries" :key="e.id" :entry="e" @review="$emit('review', $event)" />
      </ul>
    </div>
  </section>
</template>

<style scoped>
.feed { display: flex; flex-direction: column; gap: 14px; }
.feed__title { margin: 0; font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; color: var(--text); }
.feed__group { display: flex; flex-direction: column; gap: 8px; }
.feed__group-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.feed__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink); }
.feed__count { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.feed__practice { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--link); text-decoration: underline; }
.feed__practice:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.feed__list { list-style: none; display: flex; flex-direction: column; gap: 8px; padding: 0; margin: 0; }
</style>
```

- [ ] **Step 3c: Recompose `app/pages/log.vue`**

Replace the entire `<template>` block's list area. The new `<script setup>`:

```ts
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import MistakeFeed from '~/components/log/MistakeFeed.vue'
import LogEntryRow from '~/components/log/LogEntryRow.vue'
import { useLogStore } from '~/stores/log'
import { useToast } from '~/composables/useToast'

const logStore = useLogStore()
const { t } = useI18n()
const toast = useToast()

async function markReviewed(id: number) {
  await logStore.setReviewState(id, 'correct')
  toast.success(t('journal.reviewed'))
}
```

The new `<template>`:

```html
<template>
  <div class="page">
    <BilingualTitle ko="일기" :latin="t('title.log')" />
    <div v-if="logStore.entries.length === 0" class="empty">{{ t('empty.log') }}</div>
    <template v-else>
      <MistakeFeed :entries="logStore.entries" @review="markReviewed" />
      <ul class="list">
        <LogEntryRow
          v-for="e in logStore.entries.slice(0, 20)"
          :key="e.id"
          :entry="e"
          @review="markReviewed"
        />
      </ul>
    </template>
  </div>
</template>
```

Keep the existing `.page`, `.empty`, `.list` styles in `log.vue`'s `<style scoped>` and DELETE the now-unused per-entry styles (`.entry*`, `.review-btn`, `.reviewed-badge` — they moved to `LogEntryRow`). Final `log.vue` `<style scoped>`:

```css
.page { display: flex; flex-direction: column; gap: 20px; }
.empty { background: var(--paper-warm); border: 2px solid var(--border); padding: 32px; font-family: 'Inter', sans-serif; color: var(--ink-soft); }
.list { list-style: none; display: flex; flex-direction: column; gap: 10px; padding: 0; }
```

- [ ] **Step 4: Run to verify they pass**

Run: `pnpm vitest run tests/components/log/LogEntryRow.test.ts tests/components/log/MistakeFeed.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/log/ app/pages/log.vue tests/components/log/
git commit -m "feat(log): plants-to-revisit feed + extracted LogEntryRow

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: i18n — `dimension.*` + `journal.revisit_*` (8 locales)

**Files:** Modify `i18n/locales/*.json` (×8); Test `tests/unit/i18n/dimension-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/i18n/dimension-keys.test.ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
function dig(o: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o)
}
const KEYS = [
  'dimension.prompt', 'dimension.particle', 'dimension.ending',
  'dimension.register', 'dimension.word_order', 'dimension.other',
  'journal.revisit_title', 'journal.revisit_count', 'journal.revisit_practice',
]

describe('dimension/revisit i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('revisit_count keeps {n}; revisit_practice keeps 화이팅', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'journal.revisit_count'), code).toContain('{n}')
      expect(dig(msgs, 'journal.revisit_practice'), code).toContain('화이팅')
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/i18n/dimension-keys.test.ts`
Expected: FAIL — keys undefined.

- [ ] **Step 3: Add the keys to each locale**

Add a top-level `"dimension"` block and three `journal.revisit_*` keys to each of the 8 files. The `journal` block already exists — add the three keys inside it. English (`en.json`):

`journal` gets:
```json
    "revisit_title": "Plants to revisit",
    "revisit_count": "{n} to revisit",
    "revisit_practice": "Practice 화이팅"
```

New top-level `dimension` block (insert next to the existing `onboarding`/`journal` siblings — mind commas):
```json
"dimension": {
  "prompt": "What slipped?",
  "particle": "조사 · particle",
  "ending": "어미 · ending",
  "register": "높임 · register",
  "word_order": "어순 · word order",
  "other": "기타 · other"
},
```

Spanish (`es.json`): `journal` gets `"revisit_title": "Plantas para revisar"`, `"revisit_count": "{n} para revisar"`, `"revisit_practice": "Practicar 화이팅"`. `dimension`: prompt `"¿Qué se te escapó?"`, particle `"조사 · partícula"`, ending `"어미 · terminación"`, register `"높임 · registro"`, word_order `"어순 · orden"`, other `"기타 · otro"`.

For `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`: add the same structure, translating the gloss after `·` (keep the Korean term before `·` identical), the `dimension.prompt`, and `revisit_title`/`revisit_count`. Keep `{n}` in `revisit_count` and `화이팅` untranslated in `revisit_practice` (the parity test enforces both).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/i18n/dimension-keys.test.ts`
Expected: PASS (72 parity + 1 invariant test).

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/*.json tests/unit/i18n/dimension-keys.test.ts
git commit -m "i18n(log): dimension.* + journal.revisit_* in all 8 locales

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green.

- [ ] **Step 2: Manual smoke (best-effort, auth-gated)**

If a brand-new/test account is available: mark a practice sentence hard, pick a dimension chip, save; confirm it appears on `/log` under "plants to revisit" grouped by `ko` with the chip, and "Practice 화이팅" deep-links to the focused round; mark reviewed clears it from the section and the garden rain. (Same auth limitation as Step 1 — automated tests + the live DB round-trip are the primary verification.)

- [ ] **Step 3: Confirm scope** — no leech detection added (Step 11); no `/revisit` route; tag is optional.

---

## Self-Review

**Spec coverage:** ErrorDimension type + field → T1; groupPendingByKo → T2; migration + types → T3; adapter round-trip → T4; write-path threading → T5; capture chips → T6; feed + LogEntryRow + recompose → T7; i18n → T8; verify → T9. All spec sections covered.

**Type consistency:** `ErrorDimension`/`ERROR_DIMENSIONS` (T1) used identically in T4/T5/T6/T7; `groupPendingByKo` returns `{ko, entries}[]` (T2) consumed by `MistakeFeed` (T7); `add`/`persistEntry`/`onSubmit`/`GrammarCard submit` all gain `errorDimension?: ErrorDimension | null` consistently; column `error_dimension` consistent across migration (T3), adapter (T4), tests.

**Placeholder scan:** the only deferred content is the fr/pt-BR/th/id/vi/ja gloss translations in T8 (real authoring, EN+ES canonical given, parity test gates), and the live-DB migration apply / type regen in T3 (a real MCP action, exact SQL given). No code placeholders.
