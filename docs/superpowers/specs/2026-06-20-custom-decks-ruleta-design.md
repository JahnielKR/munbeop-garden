# Custom decks for the Ruleta deck game

**Date:** 2026-06-20
**Status:** Design — pending implementation plan
**Surface:** `/practice/ruleta` (the deck-draw game, "La Ruleta")

## Problem

Today the player can only draw from a whole TOPIK level (`topik-1` … `topik-6`)
or "all levels". There is no way to study a hand-picked set of grammar points —
e.g. "these 15 patterns from TOPIK 1 I keep failing", or "my favourite
connectors across levels 2 and 4". The user wants to build a named, reusable
deck from any grammar in the catalog and play it like any other deck.

## Goals

- Let the user create **named, reusable** custom decks.
- A deck can **mix grammar from any level** (no level lock).
- Each deck has a **color** and an **icon** (default), with an **optional
  uploaded image**.
- Custom decks appear in the Ruleta picker as their own section and play
  through the **existing draw engine** with no rule changes.

## Non-goals

- No change to the draw mechanic itself (still 3 grammars per round, weighted by
  SRS mastery).
- No sharing/export of decks between users.
- No reordering UI in v1 beyond creation order (decks store an `order` field for
  later, but drag-reorder is out of scope).

## Decisions

Resolved with the user during brainstorming:

1. **Persistence:** saved, named, reusable decks (not one-shot ad-hoc
   selections).
2. **Scope:** a deck may mix grammar from any level.
3. **Location:** create / edit / delete all live in the **Ruleta picker** — a
   "Custom" section below the TOPIK mats. No Library duplication in v1.
4. **Image:** default **icon + color**; **optional photo upload**. Uploaded
   photos go to Supabase Storage; icons/colors are tiny inline values.
5. **Minimum to play = 6.** A deck can be **saved with any count (even 1)**, but
   is **locked in the picker until it has 6 grammars** ("6 to play — you have
   N"). Rationale: with 6 there are enough combinations for the 3-card draw to
   feel varied; 3 is too small to be random.

Defaults chosen by the implementer (flagged ⚙️ — any can be revisited):

- ⚙️ **Shared SRS by `ko`.** A custom deck references grammar by `ko`, so
  practicing `은/는` inside a custom deck updates the same mastery used
  everywhere else. This is desirable, not a side effect.
- ⚙️ **Custom decks ignore Library exclusions.** The TOPIK mats respect
  `excludedDeckIds` (the global Library filter). A custom deck is an explicit
  hand-curation, so it draws from its `grammarKos` list directly even if some of
  those grammars belong to a deck the user excluded in the Library.
- ⚙️ **TOPIK minimum stays 3** (`MIN_DRAWABLE`). The 6-card minimum
  (`MIN_CUSTOM_DRAWABLE`) applies only to custom decks.
- ⚙️ **Grammar picker UX:** a searchable list of all catalog grammars grouped by
  level, with checkboxes and a live "N selected" counter.

## Data model

New domain type (in `app/lib/domain/grammar.ts` or a sibling module):

```ts
export interface CustomDeck {
  id: string            // uuid, generated on create
  name: string          // user-entered, trimmed, non-empty
  colorId: string       // one of the existing palette ids (sky/jade/gold/amber/rose/violet)
  icon: string          // icon token (from a small curated set)
  imageUrl?: string     // Supabase Storage public URL when a photo was uploaded
  grammarKos: string[]  // catalog membership by Grammar.ko (the stable v1 id)
  order: number         // creation order; reserved for future reordering
  createdAt: string     // ISO timestamp
}
```

Membership is by **`ko`**, the catalog's stable v1 identifier — not by array
index (indexes shift) and not by `deckId` (grammars keep their TOPIK `deckId`;
custom decks are an overlay, not a re-home).

A custom deck with a `ko` that is later deleted (only possible for user-authored
`custom` grammar) simply resolves to nothing at draw time — the builder and the
draw both filter `grammarKos` through `grammarByKo` and drop misses.

## Storage & sync

- New storage key: `STORAGE_KEYS.customDecks = 'munbeop.v1.customDecks'`.
- A new Pinia store `useCustomDecksStore` owns the list and CRUD, persisting
  through the existing `useStorageAdapter()` (same pattern as
  `useGrammarStore`): `read` on `hydrate()`, `write` after every mutation.
- Accounts are mandatory, so the primary persistence is **Supabase**. The
  `SupabaseAdapter` no-ops keys it doesn't map, so this needs:
  - a **`custom_decks` table** (per-user rows) + adapter mapping for the new
    key, and a migration;
  - a **Supabase Storage bucket** (e.g. `deck-images`) for uploaded photos, with
    the upload returning a public URL stored in `imageUrl`.
- The `LocalStorageAdapter` just JSON-serializes the array under the new key
  (works offline / first-run, same as everything else).

Exact table columns and the migration belong in the implementation plan.

## Components & flow

### Picker (`app/pages/practice/ruleta.vue`, `pick` phase)

Renders, in order:

1. The existing `DeckPicker` (TOPIK mats + "all levels") — unchanged.
2. A new **`CustomDeckShelf.vue`** below it: the "Custom" long rectangle.
   - **Empty state:** the rectangle is expanded with a centered `+` and a short
     "create your first deck" prompt.
   - **Populated state:** larger mats (~1.5× a TOPIK mat) showing color + icon
     (or `imageUrl`), name, grammar count, a pencil (edit) affordance, and a
     trailing `+` tile to add another.
   - A locked mat (count < 6) is dimmed with the reason
     "6 to play — you have N", same disabled treatment as a `too_few` TOPIK mat.

### Builder (`CustomDeckBuilder.vue`, opened from `+` or the pencil)

A modal/screen with:

- **Name** (required, trimmed).
- **Color** — the existing palette swatches.
- **Icon** — a small curated icon set; **optional photo upload** (replaces the
  icon visual when set; removable to fall back to the icon).
- **Grammar selection** — searchable list of the full catalog grouped by level,
  checkboxes, live "N selected" counter, and an inline hint when below 6
  ("add 6 to play").
- **Save / Cancel**; the pencil flow adds **Delete** (with confirm).

The builder is a dumb, props-and-emits component where practical; the pure
selection/validation helpers live in a testable module (mirroring how
`cards.ts` keeps `buildDeckOptions` out of the SFCs).

### Picker option building (`app/components/games/ruleta/cards.ts`)

- Add `MIN_CUSTOM_DRAWABLE = 6`.
- Add a `buildCustomDeckOptions(...)` pure function returning an option shape
  that extends `DeckOption` with `icon` and `imageUrl`, computing `count` from
  `grammarKos` resolved against the catalog, and `disabled` / `reason` from the
  6-minimum.

### Draw engine (`app/composables/usePractice.ts` + `app/lib/practice`)

- Extend `start()` to accept a custom selection, e.g.
  `start({ customDeckId })` (discriminated from the existing `{ deckId }`).
- For a custom deck, build the pool from the deck's `grammarKos` mapped to
  catalog indices via `grammarByKo`, **bypassing `excludedDeckIds`** (per the ⚙️
  decision). Reuse `createSession` + `srsStore.weightFor` + `markSeen` exactly
  as the TOPIK path does — the only change is how the pool is derived.
- Keep the defensive `pool.length` guard; the picker is the real gate.

## Edge cases

- **Save below 6:** allowed; deck shows locked in the picker until it reaches 6.
- **Empty name:** save disabled.
- **Duplicate names:** allowed (decks are id-keyed); no uniqueness constraint.
- **Deleted `ko` in `grammarKos`:** silently dropped at count + draw time.
- **All grammars in a deck excluded in Library:** still playable (custom decks
  ignore Library exclusions).
- **Image upload failure / offline:** fall back to icon+color; never block save.
- **`prefers-reduced-motion`, focus management, live-region announcements:**
  match the existing picker's a11y behavior.

## i18n

All new strings (section label, builder fields, counters, locked reason,
delete confirm) added across the **8 supported locales**. Korean cultural
particles follow the existing "stays Korean" convention where applicable.

## Testing

- Pure helpers (`buildCustomDeckOptions`, the custom pool filter, the
  6-minimum / save-validation logic) get unit tests next to the existing
  `cards.ts` tests.
- Store CRUD (create/edit/delete/hydrate/persist round-trip) tested against a
  fake storage adapter.
- Typecheck + existing suite green before commit (project workflow:
  verify → commit → verify → push).

## Files (high level)

- `app/lib/domain/grammar.ts` (or sibling) — `CustomDeck` type.
- `app/lib/storage/keys.ts` — new `customDecks` key.
- `app/stores/customDecks.ts` — new store (CRUD + hydrate/persist).
- `app/components/games/ruleta/cards.ts` — `MIN_CUSTOM_DRAWABLE`,
  `buildCustomDeckOptions`.
- `app/components/games/ruleta/CustomDeckShelf.vue` — the "Custom" section.
- `app/components/games/ruleta/CustomDeckBuilder.vue` — create/edit modal.
- `app/composables/usePractice.ts` + `app/lib/practice/*` — custom pool path in
  `start()`.
- `app/pages/practice/ruleta.vue` — render the shelf, wire select/create/edit.
- Supabase: `custom_decks` table + adapter mapping + Storage bucket + migration.
- i18n locale files — new strings ×8.
- Unit tests for the pure helpers and the store.
