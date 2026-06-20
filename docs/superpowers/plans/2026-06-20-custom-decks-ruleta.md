# Custom Decks for the Ruleta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user build named, reusable custom decks (any grammar from any level) and play them through the existing Ruleta draw engine; save with any count, play needs 6.

**Architecture:** A new `CustomDeck` domain type persisted through the existing `StorageAdapter` (new `customDecks` storage key + a `user_custom_decks` Supabase table). A new Pinia store owns CRUD. Two pure helpers (`buildCustomDeckOptions`, `filterPoolByCustomDeck`) plug into the existing index-based draw engine with zero engine changes. A `CustomDeckShelf` section + a `CustomDeckBuilder` modal mount under the existing `DeckPicker` in `ruleta.vue`. Optional photo upload (Supabase Storage) ships last and is additive.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia setup-stores, Supabase (Postgres + RLS + Storage), Vitest 3 + @vue/test-utils + happy-dom, @nuxtjs/i18n v9 (8 locales), pnpm 9.

---

## Conventions (read once)

- **Package manager is pnpm**, and **all commands run from `munbeop/`** (not the repo root). The repo uses `pnpm@9.15.9`; there is no `npm`/`package-lock.json`.
- App code lives under `munbeop/app/`; tests under `munbeop/tests/` (only `tests/**/*.test.ts` are collected). The `~` and `@` import aliases both map to `munbeop/app/`.
- Gates (in CI order): `pnpm lint && pnpm typecheck && pnpm test`. `pnpm test` is `vitest run` (one-shot, runs pure + mounted-component tests). `pnpm typecheck` is `nuxt typecheck` and has historically caught real bugs — treat it as required.
- Tests import `{ describe, it, expect }` from `'vitest'` explicitly even though `globals: true`.

### Task 0: Prerequisite — install deps (one-time, this worktree)

`node_modules` is missing in this worktree; every gate fails until installed.

- [ ] **Step 1: Install**

Run: `cd munbeop && pnpm install --frozen-lockfile`
Expected: completes; `node_modules/` populated.

- [ ] **Step 2: Baseline the gates**

Run: `cd munbeop && pnpm typecheck && pnpm test`
Expected: PASS (clean baseline before any change). Note the test count — a drop later is a red flag.

---

### Task 1: `CustomDeck` domain type + defaults

**Files:**
- Modify: `munbeop/app/lib/domain/grammar.ts` (append after `CUSTOM_DECK_ID`, line 32)

No test (pure type declaration). `~/lib/domain/index.ts` already does `export * from './grammar'`, so the type is auto re-exported.

- [ ] **Step 1: Add the type + default constants**

Append to `munbeop/app/lib/domain/grammar.ts`:

```ts
/**
 * A user-curated, named deck for the Ruleta game. References catalog grammar
 * by {@link Grammar.ko} (the stable v1 id), so it can mix grammar from any
 * level and shares the same per-ko SRS mastery. Distinct from
 * {@link CUSTOM_DECK_ID}, which tags user-authored *grammar* (self-study) —
 * a CustomDeck is a *collection*, not a grammar.
 */
export interface CustomDeck {
  /** Stable unique id (crypto.randomUUID). */
  id: string
  /** User-entered display name, trimmed, non-empty. */
  name: string
  /** Palette id — a key of DECK_COLOR_VARS (sky/jade/gold/amber/rose/violet). */
  colorId: string
  /** Icon token — a deck IconName (see DECK_ICONS). */
  icon: string
  /** Optional uploaded cover image (Supabase Storage public URL). */
  imageUrl?: string
  /** Catalog membership by Grammar.ko. May mix levels; unknown kos are dropped at draw time. */
  grammarKos: string[]
  /** Creation order; lower sorts first in the shelf. */
  order: number
  /** ISO creation timestamp. */
  createdAt: string
}

/** Color/icon applied to a freshly created custom deck. */
export const DEFAULT_DECK_COLOR_ID = 'sky'
export const DEFAULT_DECK_ICON = 'deck-star'
```

- [ ] **Step 2: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS (type only; nothing consumes it yet).

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/lib/domain/grammar.ts
git commit -m "feat(decks): add CustomDeck domain type"
```

---

### Task 2: Pure picker helper — `buildCustomDeckOptions` + palette/icon constants

**Files:**
- Modify: `munbeop/app/components/games/ruleta/cards.ts`
- Test: `munbeop/tests/unit/practice/custom-deck.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/practice/custom-deck.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildCustomDeckOptions, MIN_CUSTOM_PLAYABLE } from '~/components/games/ruleta/cards'
import type { CustomDeck } from '~/lib/domain'

function deck(over: Partial<CustomDeck>): CustomDeck {
  return {
    id: 'c1', name: 'My deck', colorId: 'rose', icon: 'deck-star',
    grammarKos: [], order: 0, createdAt: '2026-06-20T00:00:00.000Z', ...over,
  }
}

const SIX = ['-아서', '-니까', '-는데', '-거든요', '-잖아요', '-더라고요']

describe('buildCustomDeckOptions', () => {
  it('marks a deck with fewer than 6 grammars as locked (too_few)', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'big', grammarKos: SIX }), deck({ id: 'tiny', grammarKos: SIX.slice(0, 3) })],
    })
    expect(opts.find((o) => o.id === 'big')!.disabled).toBe(false)
    const tiny = opts.find((o) => o.id === 'tiny')!
    expect(tiny.disabled).toBe(true)
    expect(tiny.reason).toBe('too_few')
  })

  it('reports count, resolves the color, and carries icon/imageUrl', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'big', grammarKos: SIX, icon: 'deck-flame', imageUrl: 'https://x/y.png' })],
    })
    const o = opts[0]!
    expect(o.count).toBe(6)
    expect(o.colors[0]).toBeTruthy()
    expect(o.icon).toBe('deck-flame')
    expect(o.imageUrl).toBe('https://x/y.png')
  })

  it('sorts by order', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'b', order: 1 }), deck({ id: 'a', order: 0 })],
    })
    expect(opts.map((o) => o.id)).toEqual(['a', 'b'])
  })

  it('exposes the 6-grammar play minimum', () => {
    expect(MIN_CUSTOM_PLAYABLE).toBe(6)
  })
})
```

- [ ] **Step 2: Run it — verify it fails**

Run: `cd munbeop && pnpm vitest run tests/unit/practice/custom-deck.test.ts`
Expected: FAIL — `buildCustomDeckOptions`/`MIN_CUSTOM_PLAYABLE` not exported.

- [ ] **Step 3: Implement**

In `munbeop/app/components/games/ruleta/cards.ts`:

3a. Widen the domain import (line 1):

```ts
import type { Deck, Grammar, CustomDeck } from '~/lib/domain'
```

3b. Append at the end of the file:

```ts
/** Palette ids a custom deck may use — the keys of DECK_COLOR_VARS. */
export const DECK_COLOR_IDS = ['sky', 'jade', 'gold', 'amber', 'rose', 'violet'] as const
export type DeckColorId = (typeof DECK_COLOR_IDS)[number]

/** Pickable deck icons (must stay in sync with Icon.vue's IconName union). */
export const DECK_ICONS = [
  'deck-star', 'deck-flame', 'deck-leaf', 'deck-heart', 'deck-book', 'deck-bolt',
] as const
export type DeckIcon = (typeof DECK_ICONS)[number]

/** Minimum grammar count for a custom deck to be PLAYABLE (save allows any count). */
export const MIN_CUSTOM_PLAYABLE = 6

/** A custom-deck mat. Extends DeckOption with a non-null id + visual fields. */
export interface CustomDeckOption extends DeckOption {
  id: string
  icon: string
  imageUrl?: string
}

/**
 * Build the custom-deck shelf options. Sorted by `order`. A deck is locked
 * (disabled, reason 'too_few') until it has {@link MIN_CUSTOM_PLAYABLE}
 * grammars — that is the play gate; saving has no minimum.
 */
export function buildCustomDeckOptions(p: {
  decks: readonly CustomDeck[]
}): CustomDeckOption[] {
  return [...p.decks]
    .sort((a, b) => a.order - b.order)
    .map((d) => {
      const count = d.grammarKos.length
      const tooFew = count < MIN_CUSTOM_PLAYABLE
      return {
        id: d.id,
        name: d.name,
        colors: [deckColorVar(d.colorId)],
        count,
        disabled: tooFew,
        reason: tooFew ? ('too_few' as const) : null,
        icon: d.icon,
        ...(d.imageUrl ? { imageUrl: d.imageUrl } : {}),
      }
    })
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `cd munbeop && pnpm vitest run tests/unit/practice/custom-deck.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/games/ruleta/cards.ts munbeop/tests/unit/practice/custom-deck.test.ts
git commit -m "feat(decks): buildCustomDeckOptions + palette/icon constants"
```

---

### Task 3: Pure draw-pool helper — `filterPoolByCustomDeck`

**Files:**
- Modify: `munbeop/app/lib/practice/session.ts` (append; barrel `index.ts` already re-exports it)
- Test: `munbeop/tests/unit/practice/custom-pool.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/practice/custom-pool.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filterPoolByCustomDeck } from '~/lib/practice'

const CATALOG = ['-아서', '-니까', '-는데', '-거든요']
const indexOfKo = (ko: string) => {
  const i = CATALOG.indexOf(ko)
  return i < 0 ? undefined : i
}

describe('filterPoolByCustomDeck', () => {
  it('maps grammar kos to their catalog indices, preserving order', () => {
    expect(filterPoolByCustomDeck(['-니까', '-아서'], indexOfKo)).toEqual([1, 0])
  })
  it('drops kos missing from the catalog (deleted/renamed items)', () => {
    expect(filterPoolByCustomDeck(['-아서', '-gone', '-는데'], indexOfKo)).toEqual([0, 2])
  })
  it('returns empty when nothing resolves', () => {
    expect(filterPoolByCustomDeck(['-x', '-y'], indexOfKo)).toEqual([])
  })
})
```

- [ ] **Step 2: Run it — verify it fails**

Run: `cd munbeop && pnpm vitest run tests/unit/practice/custom-pool.test.ts`
Expected: FAIL — `filterPoolByCustomDeck` not exported.

- [ ] **Step 3: Implement**

Append to `munbeop/app/lib/practice/session.ts`:

```ts
/**
 * Build a draw pool for a custom deck by mapping each grammar `ko` to its
 * catalog index. Unknown kos (deleted/renamed catalog items) are dropped, so
 * the engine never dereferences a missing row. Unlike {@link filterPoolByDeck}
 * this bypasses the Library `excludedDeckIds` gate entirely — a custom deck is
 * the user's explicit curation and is not subject to the global level filter.
 */
export function filterPoolByCustomDeck(
  grammarKos: readonly string[],
  indexOfKo: (ko: string) => number | undefined,
): number[] {
  const out: number[] = []
  for (const ko of grammarKos) {
    const idx = indexOfKo(ko)
    if (idx !== undefined && idx >= 0) out.push(idx)
  }
  return out
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `cd munbeop && pnpm vitest run tests/unit/practice/custom-pool.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/practice/session.ts munbeop/tests/unit/practice/custom-pool.test.ts
git commit -m "feat(decks): filterPoolByCustomDeck draw-pool helper"
```

---

### Task 4: Storage plumbing — key, Supabase adapter cases, types, migration

This task MUST land as one commit: adding the storage key trips the `assertNever`
exhaustiveness rail in `supabase.ts`, so typecheck stays red until the read+write
cases and the generated-types block exist together.

**Files:**
- Modify: `munbeop/app/lib/storage/keys.ts`
- Modify: `munbeop/app/lib/storage/supabase.ts` (read switch, write switch, `clear()` tuple, import)
- Modify: `munbeop/app/types/database.types.ts` (add `user_custom_decks` block)
- Create: `munbeop/supabase/migrations/20260620090000_user_custom_decks.sql`

- [ ] **Step 1: Add the storage key**

In `munbeop/app/lib/storage/keys.ts`, add one line inside `STORAGE_KEYS` (after `escapeRoom`):

```ts
  escapeRoom: 'munbeop.v1.escapeRoom',
  customDecks: 'munbeop.v1.customDecks',
```

- [ ] **Step 2: Verify the rail trips (sanity)**

Run: `cd munbeop && pnpm typecheck`
Expected: FAIL — `supabase.ts` default arm `assertNever(key)` reports `key` is not `never` (the new key is unhandled). This confirms the rail; proceed to wire it.

- [ ] **Step 3: Add the `CustomDeck` import to the adapter**

In `munbeop/app/lib/storage/supabase.ts`, add `CustomDeck` to the existing domain type import (it already imports `Deck`, `Grammar`, etc. from `~/lib/domain`). The `Json` type is already imported in this file.

- [ ] **Step 4: Add the read case**

In `supabase.ts`, in the `read()` switch (next to `case STORAGE_KEYS.decks:`):

```ts
      case STORAGE_KEYS.customDecks: {
        const { data, error } = await this.client
          .from('user_custom_decks')
          .select('id, name, color_id, icon, image_url, grammar_kos, position, created_at')
          .eq('user_id', this.userId)
        assertOk('read', key, error)
        const decks: CustomDeck[] = (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          colorId: r.color_id,
          icon: r.icon,
          grammarKos: (r.grammar_kos as string[]) ?? [],
          order: r.position,
          createdAt: r.created_at,
          ...(r.image_url ? { imageUrl: r.image_url } : {}),
        }))
        return (decks.length ? decks : fallback) as T
      }
```

- [ ] **Step 5: Add the write case**

In `supabase.ts`, in the `write()` switch:

```ts
      case STORAGE_KEYS.customDecks: {
        const decks = value as CustomDeck[]
        const del = await this.client.from('user_custom_decks').delete().eq('user_id', this.userId)
        assertOk('write', key, del.error)
        if (decks.length) {
          const { error } = await this.client.from('user_custom_decks').upsert(
            decks.map((d) => ({
              user_id: this.userId,
              id: d.id,
              name: d.name,
              color_id: d.colorId,
              icon: d.icon,
              image_url: d.imageUrl ?? null,
              grammar_kos: d.grammarKos as unknown as Json,
              position: d.order,
              created_at: d.createdAt,
            })),
          )
          assertOk('write', key, error)
        }
        return
      }
```

- [ ] **Step 6: Add the table to `clear()`**

In `supabase.ts`, add `'user_custom_decks'` to the `tables` tuple in `clear()` (so sign-out / account-delete wipes it — prevents one user's decks bleeding into the next account on a shared device):

```ts
    const tables = [
      'user_progress','user_log','user_decks','user_custom_grammars',
      'user_custom_contexts','user_inactive_contexts','user_settings','user_escape_room',
      'user_custom_decks',
    ] as const
```

- [ ] **Step 7: Add the generated-types block**

In `munbeop/app/types/database.types.ts`, inside `public.Tables`, add (next to the existing `user_decks` block):

```ts
      user_custom_decks: {
        Row: { color_id: string; created_at: string; grammar_kos: Json; icon: string; id: string; image_url: string | null; name: string; position: number; user_id: string }
        Insert: { color_id?: string; created_at?: string; grammar_kos?: Json; icon?: string; id: string; image_url?: string | null; name: string; position?: number; user_id: string }
        Update: { color_id?: string; created_at?: string; grammar_kos?: Json; icon?: string; id?: string; image_url?: string | null; name?: string; position?: number; user_id?: string }
        Relationships: []
      }
```

- [ ] **Step 8: Create the migration file**

First confirm the timestamp sorts last:

Run: `cd munbeop && ls supabase/migrations | sort | tail -3`
Expected: nothing newer than `20260620090000`. If something is, bump the filename's timestamp above it.

Create `munbeop/supabase/migrations/20260620090000_user_custom_decks.sql`:

```sql
CREATE TABLE public.user_custom_decks (
  id          text        NOT NULL,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  color_id    text        NOT NULL DEFAULT 'sky',
  icon        text        NOT NULL DEFAULT 'deck-star',
  image_url   text,
  grammar_kos jsonb       NOT NULL DEFAULT '[]'::jsonb,
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE public.user_custom_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_custom_decks_owner_select" ON public.user_custom_decks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_insert" ON public.user_custom_decks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_update" ON public.user_custom_decks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_custom_decks_owner_delete" ON public.user_custom_decks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

> **Production note:** this migration must be applied to the live Supabase project
> ("Mungander", ref `zbohswpyydwvzowvjaiw`, region ap-northeast-2) before custom-deck
> sync works for signed-in users. Apply it in Task 11 (verification), not now — local
> adapter/store tests use a fake client and don't need the live DB. Hand-writing the
> types block above (Step 7) keeps typecheck green without the DB; you may regenerate
> later with `pnpm supabase gen types typescript --project-id zbohswpyydwvzowvjaiw > app/types/database.types.ts`.

- [ ] **Step 9: Extend the adapter round-trip test**

Open `munbeop/tests/unit/storage/supabase.test.ts`, find the existing `STORAGE_KEYS.decks` round-trip test (the one that writes a `Deck[]` and reads it back through the fake client). Duplicate it for `customDecks`, changing the table to `user_custom_decks` and the row shape. Concretely, the new test must:
- `write(STORAGE_KEYS.customDecks, [{ id, name, colorId, icon, grammarKos, order, createdAt }])` and assert the fake client received an upsert into `user_custom_decks` with snake_case columns (`color_id`, `image_url: null`, `grammar_kos`, `position`, `created_at`) preceded by a `delete().eq('user_id', ...)`.
- seed the fake client's `user_custom_decks` rows and assert `read(STORAGE_KEYS.customDecks, [])` maps them back to camelCase `CustomDeck[]` (and that a row with `image_url: null` yields no `imageUrl` key).

(Use the existing decks test in that file verbatim as the template — same fake-client API.)

- [ ] **Step 10: Run typecheck + the adapter test**

Run: `cd munbeop && pnpm typecheck && pnpm vitest run tests/unit/storage/supabase.test.ts`
Expected: PASS (rail satisfied; round-trip green).

- [ ] **Step 11: Commit**

```bash
git add munbeop/app/lib/storage/keys.ts munbeop/app/lib/storage/supabase.ts munbeop/app/types/database.types.ts munbeop/supabase/migrations/20260620090000_user_custom_decks.sql munbeop/tests/unit/storage/supabase.test.ts
git commit -m "feat(decks): persist+sync custom decks via user_custom_decks table"
```

---

### Task 5: `useCustomDecksStore` (CRUD + hydrate) and boot wiring

**Files:**
- Create: `munbeop/app/stores/customDecks.ts`
- Modify: `munbeop/app/layouts/default.vue` (boot hydrate array)
- Modify: `munbeop/app/composables/useAuth.ts` (`hydrateDataStores`)
- Test: `munbeop/tests/unit/stores/customDecks.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/stores/customDecks.test.ts` (mirrors the in-memory-adapter mock used by `tests/unit/stores/grammar.test.ts`):

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const stored: Record<string, unknown> = {}
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: async (key: string, fallback: unknown) => (key in stored ? stored[key] : fallback),
    write: async (key: string, value: unknown) => { stored[key] = value },
  }),
}))

import { useCustomDecksStore } from '~/stores/customDecks'
import { STORAGE_KEYS } from '~/lib/storage'

beforeEach(() => {
  setActivePinia(createPinia())
  for (const k of Object.keys(stored)) delete stored[k]
})

describe('useCustomDecksStore', () => {
  it('addDeck creates a deck with id/order/createdAt and persists it', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: '  My deck  ', colorId: 'rose', icon: 'deck-flame', grammarKos: ['-아서'] })
    expect(d.id).toBeTruthy()
    expect(d.name).toBe('My deck')        // trimmed
    expect(d.order).toBe(0)
    expect(d.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(s.decks).toHaveLength(1)
    expect((stored[STORAGE_KEYS.customDecks] as unknown[])).toHaveLength(1)
  })

  it('addDeck applies defaults when color/icon omitted', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'x' })
    expect(d.colorId).toBe('sky')
    expect(d.icon).toBe('deck-star')
    expect(d.grammarKos).toEqual([])
  })

  it('order increments per deck', async () => {
    const s = useCustomDecksStore()
    await s.addDeck({ name: 'a' })
    const b = await s.addDeck({ name: 'b' })
    expect(b.order).toBe(1)
  })

  it('updateDeck patches fields and trims the name', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    await s.updateDeck(d.id, { name: '  renamed ', grammarKos: ['-니까', '-는데'] })
    const got = s.deckById(d.id)!
    expect(got.name).toBe('renamed')
    expect(got.grammarKos).toEqual(['-니까', '-는데'])
    expect(got.order).toBe(d.order) // order/createdAt untouched
  })

  it('removeDeck deletes and persists', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    await s.removeDeck(d.id)
    expect(s.decks).toHaveLength(0)
    expect(stored[STORAGE_KEYS.customDecks]).toEqual([])
  })

  it('hydrate reads the persisted list', async () => {
    stored[STORAGE_KEYS.customDecks] = [
      { id: 'x', name: 'seed', colorId: 'gold', icon: 'deck-book', grammarKos: [], order: 0, createdAt: '2026-06-20T00:00:00.000Z' },
    ]
    const s = useCustomDecksStore()
    await s.hydrate()
    expect(s.deckById('x')!.name).toBe('seed')
  })
})
```

- [ ] **Step 2: Run it — verify it fails**

Run: `cd munbeop && pnpm vitest run tests/unit/stores/customDecks.test.ts`
Expected: FAIL — store module missing.

- [ ] **Step 3: Implement the store**

Create `munbeop/app/stores/customDecks.ts`:

```ts
import { defineStore } from 'pinia'
import type { CustomDeck } from '~/lib/domain'
import { DEFAULT_DECK_COLOR_ID, DEFAULT_DECK_ICON } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

export interface NewCustomDeck {
  name: string
  colorId?: string
  icon?: string
  grammarKos?: string[]
  imageUrl?: string
}

export type CustomDeckPatch = Partial<Omit<CustomDeck, 'id' | 'order' | 'createdAt'>>

export const useCustomDecksStore = defineStore('customDecks', () => {
  const decks = ref<CustomDeck[]>([])

  /** Decks in display order (creation order). */
  const sorted = computed(() => [...decks.value].sort((a, b) => a.order - b.order))

  function deckById(id: string): CustomDeck | undefined {
    return decks.value.find((d) => d.id === id)
  }

  async function hydrate() {
    const storage = useStorageAdapter()
    decks.value = await storage.read(STORAGE_KEYS.customDecks, [] as CustomDeck[])
  }

  async function persist() {
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.customDecks, decks.value)
  }

  async function addDeck(input: NewCustomDeck): Promise<CustomDeck> {
    const deck: CustomDeck = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      colorId: input.colorId ?? DEFAULT_DECK_COLOR_ID,
      icon: input.icon ?? DEFAULT_DECK_ICON,
      grammarKos: [...(input.grammarKos ?? [])],
      order: decks.value.length,
      createdAt: new Date().toISOString(),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    }
    decks.value = [...decks.value, deck]
    await persist()
    return deck
  }

  async function updateDeck(id: string, patch: CustomDeckPatch): Promise<void> {
    const idx = decks.value.findIndex((d) => d.id === id)
    if (idx === -1) return
    const next: CustomDeck = { ...decks.value[idx]!, ...patch }
    if (patch.name !== undefined) next.name = patch.name.trim()
    if (patch.grammarKos !== undefined) next.grammarKos = [...patch.grammarKos]
    decks.value = decks.value.map((d, i) => (i === idx ? next : d))
    await persist()
  }

  async function removeDeck(id: string): Promise<void> {
    if (!decks.value.some((d) => d.id === id)) return
    decks.value = decks.value.filter((d) => d.id !== id)
    await persist()
  }

  return { decks, sorted, deckById, hydrate, addDeck, updateDeck, removeDeck }
})
```

- [ ] **Step 4: Run the store test — verify it passes**

Run: `cd munbeop && pnpm vitest run tests/unit/stores/customDecks.test.ts`
Expected: PASS. (If `crypto.randomUUID` is undefined in the test env, add `import { randomUUID } from 'node:crypto'` and `vi.stubGlobal('crypto', { randomUUID })` at the top of the test — Node 24 provides it globally, so this is usually unnecessary.)

- [ ] **Step 5: Wire hydrate into both boot paths**

5a. In `munbeop/app/layouts/default.vue`: add the import and the hydrate call.

Add to the imports block (after line 9):
```ts
import { useCustomDecksStore } from '~/stores/customDecks'
```
Add to the `Promise.all([...])` array in `onMounted` (after `useEscapeRoomProgress().hydrate(),`):
```ts
      useCustomDecksStore().hydrate(),
```

5b. In `munbeop/app/composables/useAuth.ts`: add the import (after line 10) and the hydrate call.

Add import:
```ts
import { useCustomDecksStore } from '~/stores/customDecks'
```
Add to the `hydrateDataStores()` `Promise.all([...])` array (after `useEscapeRoomProgress().hydrate(),`):
```ts
      useCustomDecksStore().hydrate(),
```

- [ ] **Step 6: Typecheck + store test**

Run: `cd munbeop && pnpm typecheck && pnpm vitest run tests/unit/stores/customDecks.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/stores/customDecks.ts munbeop/app/layouts/default.vue munbeop/app/composables/useAuth.ts munbeop/tests/unit/stores/customDecks.test.ts
git commit -m "feat(decks): useCustomDecksStore CRUD + boot/account-switch hydration"
```

---

### Task 6: Custom-deck path in `usePractice().start()`

**Files:**
- Modify: `munbeop/app/composables/usePractice.ts`

No new unit test (the composable wires `useRoute`/stores and isn't unit-tested in this repo; the pure `filterPoolByCustomDeck` is already covered, and the flow is verified in Task 11). Keep the change thin.

- [ ] **Step 1: Import the helper**

In `munbeop/app/composables/usePractice.ts`, add `filterPoolByCustomDeck` to the existing import from `~/lib/practice`:

```ts
import {
  advanceProgress,
  createSession,
  filterPoolByDeck,
  filterPoolByCustomDeck,
  isSessionComplete,
  type Session,
} from '~/lib/practice'
```

- [ ] **Step 2: Widen the `start` signature**

Change:
```ts
  async function start(opts?: { deckId?: string | null }) {
```
to:
```ts
  async function start(opts?: { deckId?: string | null; customDeckGrammarKos?: readonly string[] }) {
```

- [ ] **Step 3: Make a custom pick count as an explicit pick (defeat stale ?focus=)**

Change:
```ts
      const explicitDeckPick = opts?.deckId !== undefined
```
to:
```ts
      const explicitDeckPick =
        opts?.deckId !== undefined || opts?.customDeckGrammarKos !== undefined
```

- [ ] **Step 4: Add the custom branch**

Insert this block immediately AFTER the focus-round block (the one ending with `return` after `markSeen`, around line 59) and BEFORE the `// Deck draw:` comment:

```ts
      // Custom deck: draw from the user's hand-picked grammar set. Maps each
      // ko to its catalog index and bypasses the Library excludedDeckIds gate
      // (a custom deck is an explicit curation). The "min 6 to play" rule is a
      // picker gate; here only the engine's hard floor of 3 applies.
      if (opts?.customDeckGrammarKos) {
        const koToIdx = new Map(grammarStore.items.map((g, i) => [g.ko, i]))
        const pool = filterPoolByCustomDeck(opts.customDeckGrammarKos, (ko) => koToIdx.get(ko))
        if (pool.length < 3) {
          error.value = t('practice.no_grammars')
          return
        }
        session.value = createSession<number, Context>({
          grammarPool: pool,
          contextPool: activeContexts,
          weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
        })
        await Promise.all(
          session.value.picks.map((pick) =>
            srsStore.markSeen(grammarStore.items[pick.grammarIdx]!.ko),
          ),
        )
        return
      }
```

- [ ] **Step 5: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/composables/usePractice.ts
git commit -m "feat(decks): custom-deck draw path in usePractice.start()"
```

---

### Task 7: Deck icons in `Icon.vue`

**Files:**
- Modify: `munbeop/app/components/ui/Icon.vue` (extend `IconName`, add 7 SVG branches)

Adds the 6 pickable deck icons (kept in sync with `DECK_ICONS`) plus a `deck-edit`
pencil used by the shelf's edit button. Art is intentionally simple pixel shapes;
refine later if desired.

- [ ] **Step 1: Extend the union**

In `munbeop/app/components/ui/Icon.vue`, append to the `IconName` union (after `'mastery-tree'`):

```ts
  | 'deck-star'
  | 'deck-flame'
  | 'deck-leaf'
  | 'deck-heart'
  | 'deck-book'
  | 'deck-bolt'
  | 'deck-edit'
```

- [ ] **Step 2: Add the SVG branches**

In the `<template>`, before the closing `</svg>`, add:

```html
    <!-- deck-star: 4-point sparkle -->
    <template v-if="name === 'deck-star'">
      <path d="M7 2h2v3h3v2h-3v3H7V7H4V5h3z" fill="currentColor" />
      <path d="M3 3h1v1H3z M12 11h1v1h-1z" fill="currentColor" />
    </template>

    <!-- deck-flame -->
    <template v-if="name === 'deck-flame'">
      <path d="M8 2h1v2h1v2h1v2h1v3h-1v2H4v-2H3V8h1V6h1V4h1z" fill="currentColor" />
    </template>

    <!-- deck-leaf -->
    <template v-if="name === 'deck-leaf'">
      <path d="M4 12h1v-2h1V8h2V6h2V4h3v3h-3v2H7v2H5v2H4z" fill="currentColor" />
      <path d="M11 4h2v2h-2z" fill="currentColor" />
    </template>

    <!-- deck-heart -->
    <template v-if="name === 'deck-heart'">
      <path d="M3 4h3v1h1V4h2v1h1V4h3v5h-1v1h-1v1h-1v1h-1v1H8v-1H7v-1H6v-1H5V9H4V4z" fill="currentColor" />
    </template>

    <!-- deck-book -->
    <template v-if="name === 'deck-book'">
      <path d="M3 3h4v10H3z M9 3h4v10H9z M7 4h2v8H7z" fill="currentColor" />
    </template>

    <!-- deck-bolt -->
    <template v-if="name === 'deck-bolt'">
      <path d="M9 2h3l-2 4h3l-6 8 2-6H6z" fill="currentColor" />
    </template>

    <!-- deck-edit: pencil -->
    <template v-if="name === 'deck-edit'">
      <path d="M10 2h2v2h-2z M8 4h2v2H8z M6 6h2v2H6z M4 8h2v2H4z M3 11h2v2H3z M2 13h2v1H2z" fill="currentColor" />
    </template>
```

- [ ] **Step 3: Typecheck**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/components/ui/Icon.vue
git commit -m "feat(decks): pixel-art deck icons + edit pencil"
```

---

### Task 8: i18n — `practice.custom.*` across 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/custom-deck-keys.test.ts` (create)

In every locale file, the `practice` object currently ends with `"no_sentence": "..."`.
Add a trailing comma to that line and append a nested `"custom": { ... }` object.

- [ ] **Step 1: Add the keys to each locale**

`en.json` →
```json
    "custom": {
      "section": "Custom decks",
      "create": "New deck",
      "edit": "Edit deck",
      "builder_title": "Custom deck",
      "close": "Close",
      "name": "Deck name",
      "name_placeholder": "e.g. My connectors",
      "color": "Color",
      "icon": "Icon",
      "grammar": "Grammar",
      "search_placeholder": "Search grammar…",
      "selected_count": "{count} selected",
      "need_six_hint": "Pick at least 6 grammar points to play",
      "locked_need_six": "Needs 6 to play",
      "save": "Save deck",
      "delete": "Delete deck",
      "confirm_delete": "Delete this deck? This can't be undone.",
      "empty_title": "Create your first deck",
      "empty_hint": "Pick the grammar you want from any level, name it, and play."
    }
```

`es.json` →
```json
    "custom": {
      "section": "Mazos personalizados",
      "create": "Nuevo mazo",
      "edit": "Editar mazo",
      "builder_title": "Mazo personalizado",
      "close": "Cerrar",
      "name": "Nombre del mazo",
      "name_placeholder": "ej: Mis conectores",
      "color": "Color",
      "icon": "Icono",
      "grammar": "Gramática",
      "search_placeholder": "Buscar gramática…",
      "selected_count": "{count} seleccionadas",
      "need_six_hint": "Elige al menos 6 gramáticas para jugar",
      "locked_need_six": "Necesita 6 para jugar",
      "save": "Guardar mazo",
      "delete": "Eliminar mazo",
      "confirm_delete": "¿Eliminar este mazo? No se puede deshacer.",
      "empty_title": "Crea tu primer mazo",
      "empty_hint": "Elige las gramáticas que quieras de cualquier nivel, ponle nombre y juega."
    }
```

`fr.json` →
```json
    "custom": {
      "section": "Decks personnalisés",
      "create": "Nouveau deck",
      "edit": "Modifier le deck",
      "builder_title": "Deck personnalisé",
      "close": "Fermer",
      "name": "Nom du deck",
      "name_placeholder": "ex. : Mes connecteurs",
      "color": "Couleur",
      "icon": "Icône",
      "grammar": "Grammaire",
      "search_placeholder": "Rechercher une grammaire…",
      "selected_count": "{count} sélectionnées",
      "need_six_hint": "Choisis au moins 6 points de grammaire pour jouer",
      "locked_need_six": "6 requis pour jouer",
      "save": "Enregistrer le deck",
      "delete": "Supprimer le deck",
      "confirm_delete": "Supprimer ce deck ? C'est irréversible.",
      "empty_title": "Crée ton premier deck",
      "empty_hint": "Choisis la grammaire que tu veux, de n'importe quel niveau, nomme-la et joue."
    }
```

`pt-BR.json` →
```json
    "custom": {
      "section": "Decks personalizados",
      "create": "Novo deck",
      "edit": "Editar deck",
      "builder_title": "Deck personalizado",
      "close": "Fechar",
      "name": "Nome do deck",
      "name_placeholder": "ex.: Meus conectores",
      "color": "Cor",
      "icon": "Ícone",
      "grammar": "Gramática",
      "search_placeholder": "Buscar gramática…",
      "selected_count": "{count} selecionadas",
      "need_six_hint": "Escolha pelo menos 6 pontos de gramática para jogar",
      "locked_need_six": "Precisa de 6 para jogar",
      "save": "Salvar deck",
      "delete": "Excluir deck",
      "confirm_delete": "Excluir este deck? Não dá para desfazer.",
      "empty_title": "Crie seu primeiro deck",
      "empty_hint": "Escolha a gramática que quiser, de qualquer nível, dê um nome e jogue."
    }
```

`th.json` →
```json
    "custom": {
      "section": "เด็คที่กำหนดเอง",
      "create": "เด็คใหม่",
      "edit": "แก้ไขเด็ค",
      "builder_title": "เด็คที่กำหนดเอง",
      "close": "ปิด",
      "name": "ชื่อเด็ค",
      "name_placeholder": "เช่น คำเชื่อมของฉัน",
      "color": "สี",
      "icon": "ไอคอน",
      "grammar": "ไวยากรณ์",
      "search_placeholder": "ค้นหาไวยากรณ์…",
      "selected_count": "เลือกแล้ว {count} รายการ",
      "need_six_hint": "เลือกไวยากรณ์อย่างน้อย 6 ข้อเพื่อเล่น",
      "locked_need_six": "ต้องมี 6 ข้อจึงจะเล่นได้",
      "save": "บันทึกเด็ค",
      "delete": "ลบเด็ค",
      "confirm_delete": "ลบเด็คนี้ใช่ไหม ยกเลิกไม่ได้",
      "empty_title": "สร้างเด็คแรกของคุณ",
      "empty_hint": "เลือกไวยากรณ์ที่ต้องการจากระดับใดก็ได้ ตั้งชื่อ แล้วเล่นได้เลย"
    }
```

`id.json` →
```json
    "custom": {
      "section": "Dek khusus",
      "create": "Dek baru",
      "edit": "Edit dek",
      "builder_title": "Dek khusus",
      "close": "Tutup",
      "name": "Nama dek",
      "name_placeholder": "mis. Konektor saya",
      "color": "Warna",
      "icon": "Ikon",
      "grammar": "Tata bahasa",
      "search_placeholder": "Cari tata bahasa…",
      "selected_count": "{count} dipilih",
      "need_six_hint": "Pilih minimal 6 poin tata bahasa untuk bermain",
      "locked_need_six": "Butuh 6 untuk bermain",
      "save": "Simpan dek",
      "delete": "Hapus dek",
      "confirm_delete": "Hapus dek ini? Tidak bisa dibatalkan.",
      "empty_title": "Buat dek pertamamu",
      "empty_hint": "Pilih tata bahasa yang kamu mau dari level mana pun, beri nama, lalu mainkan."
    }
```

`vi.json` →
```json
    "custom": {
      "section": "Bộ thẻ tùy chỉnh",
      "create": "Bộ thẻ mới",
      "edit": "Sửa bộ thẻ",
      "builder_title": "Bộ thẻ tùy chỉnh",
      "close": "Đóng",
      "name": "Tên bộ thẻ",
      "name_placeholder": "vd: Liên từ của tôi",
      "color": "Màu",
      "icon": "Biểu tượng",
      "grammar": "Ngữ pháp",
      "search_placeholder": "Tìm ngữ pháp…",
      "selected_count": "Đã chọn {count}",
      "need_six_hint": "Chọn ít nhất 6 điểm ngữ pháp để chơi",
      "locked_need_six": "Cần 6 để chơi",
      "save": "Lưu bộ thẻ",
      "delete": "Xóa bộ thẻ",
      "confirm_delete": "Xóa bộ thẻ này? Không thể hoàn tác.",
      "empty_title": "Tạo bộ thẻ đầu tiên của bạn",
      "empty_hint": "Chọn ngữ pháp bạn muốn từ bất kỳ cấp độ nào, đặt tên và chơi."
    }
```

`ja.json` →
```json
    "custom": {
      "section": "カスタムデッキ",
      "create": "新しいデッキ",
      "edit": "デッキを編集",
      "builder_title": "カスタムデッキ",
      "close": "閉じる",
      "name": "デッキ名",
      "name_placeholder": "例：私の接続表現",
      "color": "色",
      "icon": "アイコン",
      "grammar": "文法",
      "search_placeholder": "文法を検索…",
      "selected_count": "{count}個選択中",
      "need_six_hint": "プレイするには6つ以上の文法を選んでください",
      "locked_need_six": "プレイには6つ必要",
      "save": "デッキを保存",
      "delete": "デッキを削除",
      "confirm_delete": "このデッキを削除しますか？元に戻せません。",
      "empty_title": "最初のデッキを作ろう",
      "empty_hint": "好きな文法をどのレベルからでも選び、名前を付けてプレイ。"
    }
```

- [ ] **Step 2: Write the parity test**

Create `munbeop/tests/unit/i18n/custom-deck-keys.test.ts` (copy of `custom-grammar-keys.test.ts`, retargeted):

```ts
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
  'section', 'create', 'edit', 'builder_title', 'close', 'name', 'name_placeholder',
  'color', 'icon', 'grammar', 'search_placeholder', 'selected_count', 'need_six_hint',
  'locked_need_six', 'save', 'delete', 'confirm_delete', 'empty_title', 'empty_hint',
].map((k) => `practice.custom.${k}`)

describe('practice.custom.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('selected_count keeps the {count} placeholder in every locale', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'practice.custom.selected_count'), code).toContain('{count}')
    }
  })
})
```

- [ ] **Step 3: Run the parity test (validates JSON + parity)**

Run: `cd munbeop && pnpm vitest run tests/unit/i18n/custom-deck-keys.test.ts`
Expected: PASS for all 8 locales. (A failure to parse means a JSON comma/brace slipped — fix the offending file.)

- [ ] **Step 4: Commit**

```bash
git add munbeop/i18n/locales/*.json munbeop/tests/unit/i18n/custom-deck-keys.test.ts
git commit -m "i18n(decks): practice.custom.* strings across 8 locales + parity test"
```

---

### Task 9: `CustomDeckShelf.vue` (the "Custom" picker section)

**Files:**
- Create: `munbeop/app/components/games/ruleta/CustomDeckShelf.vue`
- Test: `munbeop/tests/components/practice/CustomDeckShelf.test.ts` (create)

Props-only (store-free, like `DeckPicker.vue`). Emits `select` / `create` / `edit`.

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/practice/CustomDeckShelf.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import type { CustomDeckOption } from '~/components/games/ruleta/cards'

function opt(over: Partial<CustomDeckOption>): CustomDeckOption {
  return { id: 'c1', name: 'My deck', colors: ['var(--red)'], count: 6, disabled: false, reason: null, icon: 'deck-star', ...over }
}

describe('CustomDeckShelf', () => {
  it('renders the empty state with a create button when there are no decks', () => {
    const w = mount(CustomDeckShelf, { props: { options: [] } })
    expect(w.find('[data-testid="custom-deck-shelf"]').exists()).toBe(true)
    expect(w.find('[data-testid="custom-deck-create"]').exists()).toBe(true)
  })

  it('emits select with the deck id when a playable mat is clicked', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'abc' })] } })
    await w.find('[data-testid="custom-deck-abc"]').trigger('click')
    expect(w.emitted('select')).toEqual([['abc']])
  })

  it('does not emit select for a locked (<6) mat', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'x', count: 4, disabled: true, reason: 'too_few' })] } })
    await w.find('[data-testid="custom-deck-x"]').trigger('click')
    expect(w.emitted('select')).toBeUndefined()
  })

  it('emits edit (not select) when the pencil is clicked', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'abc' })] } })
    await w.find('[data-testid="custom-deck-edit-abc"]').trigger('click')
    expect(w.emitted('edit')).toEqual([['abc']])
    expect(w.emitted('select')).toBeUndefined()
  })

  it('emits create from the trailing add tile when decks exist', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({})] } })
    await w.find('[data-testid="custom-deck-create"]').trigger('click')
    expect(w.emitted('create')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it — verify it fails**

Run: `cd munbeop && pnpm vitest run tests/components/practice/CustomDeckShelf.test.ts`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement the component**

Create `munbeop/app/components/games/ruleta/CustomDeckShelf.vue`:

```vue
<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'
import type { CustomDeckOption } from '~/components/games/ruleta/cards'

interface Props {
  options: CustomDeckOption[]
}
defineProps<Props>()
defineEmits<{ select: [deckId: string]; create: []; edit: [deckId: string] }>()

const { t } = useI18n()
</script>

<template>
  <section class="custom-shelf" data-testid="custom-deck-shelf">
    <h2 class="custom-shelf__title">{{ t('practice.custom.section') }}</h2>

    <!-- Empty: expanded create prompt -->
    <button
      v-if="options.length === 0"
      type="button"
      class="custom-empty"
      data-testid="custom-deck-create"
      @click="$emit('create')"
    >
      <span class="custom-empty__plus" aria-hidden="true"><Icon name="deck-star" :size="22" /></span>
      <span class="custom-empty__title">{{ t('practice.custom.empty_title') }}</span>
      <span class="custom-empty__hint">{{ t('practice.custom.empty_hint') }}</span>
    </button>

    <!-- Populated: mats + trailing add tile -->
    <div v-else class="custom-grid">
      <div v-for="o in options" :key="o.id" class="custom-mat-wrap">
        <button
          type="button"
          class="custom-mat"
          :class="{ 'custom-mat--locked': o.disabled }"
          :disabled="o.disabled"
          :data-testid="`custom-deck-${o.id}`"
          @click="$emit('select', o.id)"
        >
          <span class="custom-mat__cover" aria-hidden="true" :style="{ '--mat-color': o.colors[0] }">
            <img v-if="o.imageUrl" :src="o.imageUrl" alt="" class="custom-mat__img" />
            <Icon v-else :name="(o.icon as IconName)" :size="34" />
          </span>
          <span class="custom-mat__name">{{ o.name }}</span>
          <span class="custom-mat__count">{{ t('practice.deck_count', { n: o.count }) }}</span>
          <span v-if="o.reason === 'too_few'" class="custom-mat__locked">
            {{ t('practice.custom.locked_need_six') }}
          </span>
        </button>
        <button
          type="button"
          class="custom-mat__edit"
          :data-testid="`custom-deck-edit-${o.id}`"
          :aria-label="t('practice.custom.edit')"
          @click.stop="$emit('edit', o.id)"
        >
          <Icon name="deck-edit" :size="16" />
        </button>
      </div>

      <button
        type="button"
        class="custom-mat custom-mat--add"
        data-testid="custom-deck-create"
        @click="$emit('create')"
      >
        <span class="custom-mat__cover custom-mat__cover--add" aria-hidden="true">
          <Icon name="deck-edit" :size="0" /><span class="custom-mat__plus">+</span>
        </span>
        <span class="custom-mat__name">{{ t('practice.custom.create') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.custom-shelf {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.custom-shelf__title {
  margin: 0;
  font: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-soft, var(--ink-soft));
  text-align: center;
}

/* Empty state: one long rectangle, deployed, with the create prompt */
.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  background: transparent;
  border: 2px dashed var(--border-strong, var(--border));
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.custom-empty:hover, .custom-empty:focus-visible {
  border-color: var(--focus-ring, #d8842f);
}
.custom-empty:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.custom-empty__plus {
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 50%;
}
.custom-empty__title { font-weight: 600; }
.custom-empty__hint {
  font-size: 0.85rem; color: var(--text-soft, var(--ink-soft));
  text-align: center; max-width: 32ch; line-height: 1.5;
}

/* Populated: larger mats (~1.5x a TOPIK mat) inside the long rectangle */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 18px;
  padding: 14px;
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 10px;
}
.custom-mat-wrap { position: relative; }
.custom-mat {
  width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 12px 14px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid var(--border-strong, var(--border));
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
  border-radius: 6px;
  cursor: pointer; font: inherit; color: inherit;
  transform: translate(0, 0);
  transition: transform var(--motion-quick, 120ms) var(--ease-out, ease-out),
              box-shadow var(--motion-quick, 120ms) var(--ease-out, ease-out);
}
.custom-mat:hover:not(:disabled), .custom-mat:focus-visible:not(:disabled) {
  transform: translate(-2px, -3px);
  box-shadow: var(--shadow-button-hover, 7px 8px 0 rgba(60, 42, 24, 0.35));
}
.custom-mat:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm, 2px 2px 0 rgba(60, 42, 24, 0.35));
}
.custom-mat:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.custom-mat--locked { cursor: not-allowed; }
.custom-mat--locked .custom-mat__cover,
.custom-mat--locked .custom-mat__name,
.custom-mat--locked .custom-mat__count { opacity: 0.45; }

.custom-mat__cover {
  width: 100%; height: 96px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  color: var(--mat-color, var(--ink-soft));
  background: color-mix(in srgb, var(--mat-color, var(--ink-soft)) 18%, var(--surface));
  overflow: hidden;
}
.custom-mat__img { width: 100%; height: 100%; object-fit: cover; }
.custom-mat__name { font-weight: 600; text-align: center; }
.custom-mat__count { font-size: 0.8rem; color: var(--text-soft, var(--ink-soft)); }
.custom-mat__locked { font-size: 0.78rem; color: var(--text-soft, var(--ink-soft)); text-align: center; }

.custom-mat__edit {
  position: absolute; top: 6px; right: 6px;
  width: 28px; height: 28px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); color: inherit;
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 50%; cursor: pointer;
}
.custom-mat__edit:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }

.custom-mat--add { justify-content: center; }
.custom-mat__cover--add {
  background: transparent;
  border: 2px dashed var(--border-strong, var(--border));
}
.custom-mat__plus { font-size: 2rem; line-height: 1; color: var(--text-soft, var(--ink-soft)); }
</style>
```

> Note: `color-mix(...)` has wide support; if the target browser matrix predates it,
> the `color: var(--mat-color)` on the cover still tints the icon, and the background
> simply falls back to none — acceptable. The `<Icon name="deck-edit" :size="0" />` in
> the add tile is a harmless no-op placeholder kept only so the template imports stay
> uniform; you may delete that line if you prefer (the `+` glyph is the visual).

- [ ] **Step 4: Run the test — verify it passes**

Run: `cd munbeop && pnpm vitest run tests/components/practice/CustomDeckShelf.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `cd munbeop && pnpm typecheck`
Expected: PASS.

```bash
git add munbeop/app/components/games/ruleta/CustomDeckShelf.vue munbeop/tests/components/practice/CustomDeckShelf.test.ts
git commit -m "feat(decks): CustomDeckShelf picker section"
```

---

### Task 10: `CustomDeckBuilder.vue` (create/edit form) + wire into `ruleta.vue`

**Files:**
- Create: `munbeop/app/components/games/ruleta/CustomDeckBuilder.vue`
- Modify: `munbeop/app/pages/practice/ruleta.vue`
- Test: `munbeop/tests/components/practice/CustomDeckBuilder.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/practice/CustomDeckBuilder.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'
import type { Grammar, Deck } from '~/lib/domain'

const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
const DECKS: Deck[] = [{ id: 'topik-1', name: 'TOPIK 1', colorId: 'sky', order: 1, collapsed: false }]
const ITEMS: Grammar[] = ['-아서', '-니까', '-는데', '-거든요', '-잖아요', '-더라고요', '-나요'].map((ko) => ({
  ko, meaning: L(ko), deckId: 'topik-1',
}))

beforeEach(() => {
  setActivePinia(createPinia())
  const g = useGrammarStore()
  g.items = [...ITEMS]
  g.decks = [...DECKS]
})

describe('CustomDeckBuilder', () => {
  it('disables save until a name is entered', async () => {
    const w = mount(CustomDeckBuilder, { props: { deckId: null } })
    const save = w.find('[data-testid="builder-save"]')
    expect((save.element as HTMLButtonElement).disabled).toBe(true)
    await w.find('[data-testid="builder-name"]').setValue('My deck')
    expect((save.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('creates a deck with the selected grammars and emits saved', async () => {
    const w = mount(CustomDeckBuilder, { props: { deckId: null } })
    await w.find('[data-testid="builder-name"]').setValue('Connectors')
    await w.find('[data-testid="grammar-opt--아서"]').trigger('click')
    await w.find('[data-testid="grammar-opt--니까"]').trigger('click')
    await w.find('[data-testid="builder-save"]').trigger('click')
    await flushPromises()
    const store = useCustomDecksStore()
    expect(store.decks).toHaveLength(1)
    expect(store.decks[0]!.name).toBe('Connectors')
    expect(store.decks[0]!.grammarKos).toEqual(['-아서', '-니까'])
    expect(w.emitted('saved')).toHaveLength(1)
  })

  it('prefills fields when editing an existing deck', async () => {
    const store = useCustomDecksStore()
    const d = await store.addDeck({ name: 'Seed', colorId: 'rose', icon: 'deck-flame', grammarKos: ['-는데'] })
    const w = mount(CustomDeckBuilder, { props: { deckId: d.id } })
    await flushPromises()
    expect((w.find('[data-testid="builder-name"]').element as HTMLInputElement).value).toBe('Seed')
    expect(w.find('[data-testid="grammar-opt--는데"]').classes()).toContain('grammar-opt--on')
  })

  it('deletes a deck (two-step) and emits saved', async () => {
    const store = useCustomDecksStore()
    const d = await store.addDeck({ name: 'Doomed' })
    const w = mount(CustomDeckBuilder, { props: { deckId: d.id } })
    await flushPromises()
    await w.find('[data-testid="builder-delete"]').trigger('click')   // arm
    await w.find('[data-testid="builder-delete-confirm"]').trigger('click')
    await flushPromises()
    expect(store.decks).toHaveLength(0)
    expect(w.emitted('saved')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it — verify it fails**

Run: `cd munbeop && pnpm vitest run tests/components/practice/CustomDeckBuilder.test.ts`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement the builder**

Create `munbeop/app/components/games/ruleta/CustomDeckBuilder.vue`:

```vue
<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'
import {
  deckColorVar, DECK_COLOR_IDS, DECK_ICONS, MIN_CUSTOM_PLAYABLE,
} from '~/components/games/ruleta/cards'
import { DEFAULT_DECK_COLOR_ID, DEFAULT_DECK_ICON } from '~/lib/domain'

const props = defineProps<{ deckId: string | null }>()
const emit = defineEmits<{ saved: [] }>()

const { t, locale } = useI18n()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()

const name = ref('')
const colorId = ref<string>(DEFAULT_DECK_COLOR_ID)
const icon = ref<string>(DEFAULT_DECK_ICON)
const selected = ref<string[]>([])
const search = ref('')
const confirmingDelete = ref(false)

onMounted(() => {
  if (props.deckId) {
    const d = customDecks.deckById(props.deckId)
    if (d) {
      name.value = d.name
      colorId.value = d.colorId
      icon.value = d.icon
      selected.value = [...d.grammarKos]
    }
  }
})

const selectedSet = computed(() => new Set(selected.value))
const canSave = computed(() => name.value.trim().length > 0)

/** Grammar grouped by level (deck order), filtered by the search query. */
const groups = computed(() => {
  const q = search.value.trim().toLowerCase()
  const loc = locale.value as keyof (typeof grammarStore.items)[number]['meaning']
  const matches = (g: (typeof grammarStore.items)[number]) =>
    !q ||
    g.ko.toLowerCase().includes(q) ||
    String(g.meaning[loc] ?? '').toLowerCase().includes(q)
  return [...grammarStore.decks]
    .sort((a, b) => a.order - b.order)
    .map((deck) => ({
      deck,
      items: grammarStore.items.filter((g) => g.deckId === deck.id && matches(g)),
    }))
    .filter((group) => group.items.length > 0)
})

function toggle(ko: string) {
  selected.value = selectedSet.value.has(ko)
    ? selected.value.filter((k) => k !== ko)
    : [...selected.value, ko]
}

async function save() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  const payload = { name: trimmed, colorId: colorId.value, icon: icon.value, grammarKos: [...selected.value] }
  if (props.deckId) await customDecks.updateDeck(props.deckId, payload)
  else await customDecks.addDeck(payload)
  emit('saved')
}

async function remove() {
  if (props.deckId) await customDecks.removeDeck(props.deckId)
  emit('saved')
}
</script>

<template>
  <article class="builder">
    <label class="builder__field">
      <span class="builder__label">{{ t('practice.custom.name') }}</span>
      <input
        v-model="name"
        type="text"
        class="builder__input"
        data-testid="builder-name"
        :placeholder="t('practice.custom.name_placeholder')"
      />
    </label>

    <div class="builder__field">
      <span class="builder__label">{{ t('practice.custom.color') }}</span>
      <div class="swatches">
        <button
          v-for="c in DECK_COLOR_IDS"
          :key="c"
          type="button"
          class="swatch"
          :class="{ 'swatch--on': colorId === c }"
          :style="{ '--swatch': deckColorVar(c) }"
          :data-testid="`color-${c}`"
          :aria-label="c"
          :aria-pressed="colorId === c"
          @click="colorId = c"
        />
      </div>
    </div>

    <div class="builder__field">
      <span class="builder__label">{{ t('practice.custom.icon') }}</span>
      <div class="icons">
        <button
          v-for="ic in DECK_ICONS"
          :key="ic"
          type="button"
          class="icon-opt"
          :class="{ 'icon-opt--on': icon === ic }"
          :data-testid="`icon-${ic}`"
          :aria-label="ic"
          :aria-pressed="icon === ic"
          @click="icon = ic"
        >
          <Icon :name="(ic as IconName)" :size="20" />
        </button>
      </div>
    </div>

    <div class="builder__field">
      <div class="builder__grammar-head">
        <span class="builder__label">{{ t('practice.custom.grammar') }}</span>
        <span
          class="builder__count"
          :class="{ 'builder__count--ok': selected.length >= MIN_CUSTOM_PLAYABLE }"
        >
          {{ t('practice.custom.selected_count', { count: selected.length }) }}
        </span>
      </div>
      <p v-if="selected.length < MIN_CUSTOM_PLAYABLE" class="builder__hint">
        {{ t('practice.custom.need_six_hint') }}
      </p>
      <input
        v-model="search"
        type="search"
        class="builder__input"
        data-testid="builder-search"
        :placeholder="t('practice.custom.search_placeholder')"
      />
      <div class="grammar-groups">
        <div v-for="group in groups" :key="group.deck.id" class="grammar-group">
          <p class="grammar-group__title">{{ group.deck.name }}</p>
          <div class="grammar-list">
            <button
              v-for="g in group.items"
              :key="g.ko"
              type="button"
              class="grammar-opt"
              :class="{ 'grammar-opt--on': selectedSet.has(g.ko) }"
              :data-testid="`grammar-opt-${g.ko}`"
              :aria-pressed="selectedSet.has(g.ko)"
              @click="toggle(g.ko)"
            >
              <span class="grammar-opt__check" aria-hidden="true">
                <Icon v-if="selectedSet.has(g.ko)" name="deck-star" :size="12" />
              </span>
              <span class="grammar-opt__ko">{{ g.ko }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="builder__actions">
      <template v-if="props.deckId">
        <button
          v-if="!confirmingDelete"
          type="button"
          class="builder__btn builder__btn--danger"
          data-testid="builder-delete"
          @click="confirmingDelete = true"
        >
          {{ t('practice.custom.delete') }}
        </button>
        <button
          v-else
          type="button"
          class="builder__btn builder__btn--danger"
          data-testid="builder-delete-confirm"
          @click="remove"
        >
          {{ t('practice.custom.confirm_delete') }}
        </button>
      </template>
      <span class="builder__spacer" />
      <button
        type="button"
        class="builder__btn builder__btn--primary"
        data-testid="builder-save"
        :disabled="!canSave"
        @click="save"
      >
        {{ t('practice.custom.save') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.builder { display: flex; flex-direction: column; gap: 18px; min-width: min(520px, 80vw); }
.builder__field { display: flex; flex-direction: column; gap: 8px; }
.builder__label { font-weight: 600; font-size: 0.9rem; }
.builder__input {
  font: inherit; padding: 8px 10px;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
}
.builder__input:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 1px; }

.swatches, .icons { display: flex; flex-wrap: wrap; gap: 8px; }
.swatch {
  width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
  background: var(--swatch); border: 3px solid transparent;
}
.swatch--on { border-color: var(--ink, var(--ink-soft)); }
.swatch:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.icon-opt {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit; cursor: pointer;
}
.icon-opt--on { border-color: var(--focus-ring, #d8842f); background: var(--paper-warm, var(--surface)); }
.icon-opt:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }

.builder__grammar-head { display: flex; align-items: baseline; justify-content: space-between; }
.builder__count { font-size: 0.85rem; color: var(--text-soft, var(--ink-soft)); }
.builder__count--ok { color: var(--jade-deep, var(--jade)); font-weight: 600; }
.builder__hint { margin: 0; font-size: 0.8rem; color: var(--text-soft, var(--ink-soft)); }

.grammar-groups { display: flex; flex-direction: column; gap: 12px; max-height: 40vh; overflow-y: auto; padding-right: 4px; }
.grammar-group__title { margin: 0 0 6px; font-size: 0.8rem; color: var(--text-soft, var(--ink-soft)); }
.grammar-list { display: flex; flex-wrap: wrap; gap: 6px; }
.grammar-opt {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 9px; font: inherit; cursor: pointer;
  border: 2px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
}
.grammar-opt--on { border-color: var(--jade-deep, var(--jade)); background: color-mix(in srgb, var(--jade) 16%, var(--surface)); }
.grammar-opt:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 1px; }
.grammar-opt__check { width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; }

.builder__actions { display: flex; align-items: center; gap: 10px; }
.builder__spacer { flex: 1; }
.builder__btn {
  font: inherit; font-weight: 600; padding: 9px 16px; cursor: pointer;
  border: 3px solid var(--border-strong, var(--border)); border-radius: 6px;
  background: var(--surface); color: inherit;
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
}
.builder__btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.builder__btn:focus-visible { outline: 2px solid var(--focus-ring, #d8842f); outline-offset: 2px; }
.builder__btn--primary { background: var(--gold, var(--paper-warm)); }
.builder__btn--danger { color: var(--red-deep, var(--red)); border-color: var(--red-deep, var(--red)); box-shadow: none; }
</style>
```

> The grammar-selected checkmark reuses `deck-star` at 12px as a tick (no dedicated
> check icon exists). If you'd rather a real checkmark, add a `'check'` branch to
> Icon.vue in Task 7 and swap it here.

- [ ] **Step 4: Run the builder test — verify it passes**

Run: `cd munbeop && pnpm vitest run tests/components/practice/CustomDeckBuilder.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire shelf + builder into `ruleta.vue`**

5a. Add imports (after line 9, with the other `~/components/games/ruleta` imports):
```ts
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import Modal from '~/components/ui/Modal.vue'
import { buildCustomDeckOptions } from '~/components/games/ruleta/cards'
import { useCustomDecksStore } from '~/stores/customDecks'
```
(Adjust the existing `import { buildDeckOptions, deckColorVar, type DrawCard } ...` line so the two `cards` imports don't duplicate — either merge `buildCustomDeckOptions` into that line or keep a second import line; both compile.)

5b. Add the store + state (after `const contextsStore = useContextsStore()`, line 33):
```ts
const customDecks = useCustomDecksStore()
const builderOpen = ref(false)
const editingDeckId = ref<string | null>(null)
```

5c. Add the options computed (after the `deckOptions` computed, line 61):
```ts
const customDeckOptions = computed(() => buildCustomDeckOptions({ decks: customDecks.decks }))
```

5d. Add the handlers (after `onDeckSelect`, line 91):
```ts
async function onCustomDeckSelect(deckId: string) {
  if (starting.value || phase.value !== 'pick') return
  const deck = customDecks.deckById(deckId)
  if (!deck) return
  starting.value = true
  try {
    await start({ customDeckGrammarKos: deck.grammarKos })
    if (error.value) {
      toast.error(error.value)
      return
    }
    phase.value = 'draw'
    await focusPhaseWrap(drawWrap)
  } finally {
    starting.value = false
  }
}

function onCustomCreate() {
  editingDeckId.value = null
  builderOpen.value = true
}

function onCustomEdit(deckId: string) {
  editingDeckId.value = deckId
  builderOpen.value = true
}

function onBuilderClose() {
  builderOpen.value = false
  editingDeckId.value = null
}
```

5e. In the template, add the shelf inside the `pick` phase wrap, right after `<DeckPicker ... />` (line 188):
```html
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        @select="onCustomDeckSelect"
        @create="onCustomCreate"
        @edit="onCustomEdit"
      />
```

5f. Add the builder modal at the page root, just before the closing `</div>` of `.page` (after the `phase === 'play'` block, around line 207):
```html
    <Modal
      :open="builderOpen"
      :title="t('practice.custom.builder_title')"
      :close-label="t('practice.custom.close')"
      @close="onBuilderClose"
    >
      <CustomDeckBuilder :key="editingDeckId ?? 'new'" :deck-id="editingDeckId" @saved="onBuilderClose" />
    </Modal>
```

- [ ] **Step 6: Typecheck + full test run**

Run: `cd munbeop && pnpm typecheck && pnpm test`
Expected: PASS (all suites, including the two new component suites).

- [ ] **Step 7: Lint**

Run: `cd munbeop && pnpm lint`
Expected: PASS (autofix with `pnpm lint:fix` if format-only failures).

- [ ] **Step 8: Commit**

```bash
git add munbeop/app/components/games/ruleta/CustomDeckBuilder.vue munbeop/app/pages/practice/ruleta.vue munbeop/tests/components/practice/CustomDeckBuilder.test.ts
git commit -m "feat(decks): CustomDeckBuilder + wire shelf/modal into the Ruleta"
```

---

### Task 11: Verification, migration apply, ship

**Files:** none (apply migration, run gates, manual smoke test).

- [ ] **Step 1: Full gate**

Run: `cd munbeop && pnpm lint && pnpm typecheck && pnpm test`
Expected: all PASS. Test count is up by the new suites vs the Task 0 baseline.

- [ ] **Step 2: Apply the migration to production Supabase**

The feature needs the `user_custom_decks` table live for signed-in sync. Apply
`munbeop/supabase/migrations/20260620090000_user_custom_decks.sql` to project
"Mungander" (ref `zbohswpyydwvzowvjaiw`). Either:
- via the Supabase MCP `apply_migration` tool (name `user_custom_decks`, the SQL above), or
- `cd munbeop && pnpm supabase db push` (pushes pending local migrations).

This is a production schema change — confirm with the user before running, then verify
the table + 4 RLS policies exist (`list_tables` / `list_migrations`). Optionally
regenerate types afterward: `pnpm supabase gen types typescript --project-id zbohswpyydwvzowvjaiw > app/types/database.types.ts` and confirm it matches the hand-written block (no diff → delete the regen; a diff → keep it and re-run typecheck).

- [ ] **Step 3: Manual smoke test (preview)**

Run the app (`cd munbeop && pnpm dev`) signed in, go to `/practice/ruleta`:
1. Empty state: the "Custom" rectangle is deployed with the "+" create prompt.
2. Create a deck: name it, pick a color + icon, select 6+ grammars across at least two levels, save → it appears as a larger mat with the color/icon and "N gramáticas".
3. A deck with <6 selected shows locked ("Necesita 6 para jugar") and won't start a round.
4. Play a 6+ deck: it deals 3 cards drawn from your set; finishing logs sentences (SRS updates shared by ko).
5. Edit (pencil): rename / add-remove grammars / recolor → persists. Delete (two-step) → mat disappears.
6. Reload the page → decks persist (Supabase). Sign out → decks clear from the UI.

- [ ] **Step 4: Update memory + spec status**

Two memory corrections this work surfaced (do via the memory files):
- `project_settings_overhaul_progress.md` says "SupabaseAdapter no-ops unmapped keys" — that's wrong; SupabaseAdapter throws via `assertNever` (only `NoopStorageAdapter` no-ops). Fix that line.
- Note pnpm (not npm) is the package manager for `munbeop/` local/CI commands, if not already captured.

Mark the spec `docs/superpowers/specs/2026-06-20-custom-decks-ruleta-design.md` status shipped, and add a memory pointer for the custom-decks feature.

- [ ] **Step 5: Finish the branch**

Use the `superpowers:finishing-a-development-branch` skill (PR vs merge). Suggested PR title:
"Custom decks for the Ruleta — build & play hand-picked grammar sets".

---

### Task 12 (OPTIONAL, additive): photo upload to Supabase Storage

Ship Tasks 1–11 first — icon+color decks are fully functional without this. This adds
the optional uploaded cover image. There is NO Storage bucket infrastructure yet, so it
must be created.

**Files:**
- Create: `munbeop/supabase/migrations/20260620090001_deck_images_bucket.sql`
- Create: `munbeop/app/lib/storage/deckImages.ts`
- Modify: `munbeop/app/components/games/ruleta/CustomDeckBuilder.vue` (file input + upload)

- [ ] **Step 1: Bucket + storage RLS migration**

Create `munbeop/supabase/migrations/20260620090001_deck_images_bucket.sql`:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('deck-images', 'deck-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "deck_images_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'deck-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "deck_images_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'deck-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "deck_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'deck-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "deck_images_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'deck-images');
```

- [ ] **Step 2: Upload helper (kept out of the StorageAdapter)**

Create `munbeop/app/lib/storage/deckImages.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'deck-images'

/**
 * Upload a deck cover image and return its public URL. Path is namespaced by
 * user id to satisfy the storage RLS owner-prefix check. Throws on failure —
 * callers fall back to icon+color and never block save.
 */
export async function uploadDeckImage(
  client: SupabaseClient,
  userId: string,
  deckId: string,
  file: File,
): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${userId}/${deckId}.${ext}`
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/png',
  })
  if (error) throw error
  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
```

- [ ] **Step 3: Wire into the builder**

In `CustomDeckBuilder.vue`: add an `imageUrl` ref (prefill from the deck on edit), a
file `<input type="file" accept="image/*" data-testid="builder-image">`, and an
`onPick(file)` handler that resolves the user id + `$supabase` from
`useNuxtApp()`/`useAuthStore()`, calls `uploadDeckImage`, sets `imageUrl.value` on
success, and on any throw shows a toast and keeps icon+color (never blocks). Include
`imageUrl: imageUrl.value || undefined` in the `save()` payload. The deck must be saved
once to have an id for the path — for a brand-new deck, save first (without image), then
upload against the returned id and `updateDeck`. Test the happy path by stubbing
`useNuxtApp().$supabase.storage` and asserting `imageUrl` lands on the saved deck;
test the failure path by making `upload` reject and asserting the deck still saves
with no `imageUrl`.

- [ ] **Step 4: Gates + apply bucket migration + commit**

Run: `cd munbeop && pnpm lint && pnpm typecheck && pnpm test`, apply the bucket
migration to Supabase (same caution as Task 11 Step 2), then commit.

---

## Self-Review

**Spec coverage:**
- Saved/named/reusable decks → Tasks 1, 5 (type + store CRUD). ✓
- Mix any level → membership by `ko`, builder lists all levels → Tasks 1, 10. ✓
- Lives in the Ruleta picker, "Custom" rectangle, empty→"+", populated→1.5x mats w/ color+image+edit → Task 9 (shelf), Task 10 (wiring). ✓
- Icon+color default, optional photo → Tasks 7 (icons), 10 (builder color/icon), 12 (photo). ✓
- Save any count, play needs 6 → `MIN_CUSTOM_PLAYABLE=6` gate in shelf (Task 2/9); store has no save minimum (Task 5). ✓
- Engine unchanged, draws 3 weighted by SRS, shared per-ko SRS → Task 6 reuses `createSession`/`weightFor`/`markSeen`; pure `filterPoolByCustomDeck` (Task 3). ✓
- Custom decks ignore Library exclusions → `filterPoolByCustomDeck` bypasses `activeIndices`/`excludedDeckIds` (Task 3/6). ✓
- "All levels" unchanged → no edit to `buildDeckOptions`/`deckOptions`. ✓
- Persistence/sync, sign-out clears → Task 4 (key + adapter + `clear()` + migration). ✓
- i18n ×8 + parity test → Task 8. ✓
- Tests for pure helpers, store, adapter, components, i18n → Tasks 2,3,4,5,8,9,10. ✓

**Placeholder scan:** No TBD/TODO. The one "copy the existing decks test" instruction (Task 4 Step 9) points at a concrete existing file because the fake-client API isn't reproduced here; everything else has literal code.

**Type consistency:** `CustomDeck` fields (`colorId`/`icon`/`imageUrl`/`grammarKos`/`order`/`createdAt`) are identical across domain (Task 1), adapter mapping (Task 4), store (Task 5), and types block (Task 4). `CustomDeckOption` extends `DeckOption` with `id: string`+`icon`+`imageUrl` (Task 2) and is consumed by the shelf (Task 9). `start({ customDeckGrammarKos })` (Task 6) matches the call site in `ruleta.vue` (Task 10). `MIN_CUSTOM_PLAYABLE`, `DECK_COLOR_IDS`, `DECK_ICONS` are defined once (Task 2) and imported by the builder (Task 10). Deck icon names match between `Icon.vue` (Task 7) and `DECK_ICONS` (Task 2).

**Scope:** Single feature, one plan. Task 12 is cleanly optional/additive.
