# Step 14 — Ordered TOPIK Paths — Design

- **Date:** 2026-06-23
- **Roadmap:** Step 14 (was DEFERRED; re-opened as a derived progression view).
- **Status:** Approved design (brainstorming). Next: writing-plans.

## 1. Motivation

The app already groups grammar into TOPIK 1–6 decks, but those are unordered
weighted-draw pools. A learner can't see "where am I in TOPIK 1" or "what should
I study next." Ordered TOPIK paths turn each level into a guided sequence with
progress and a next-up recommendation — a progression *view* over existing data.

This re-opens the deferred Step 14 in a form that sidesteps its original blockers:
- **No copyrighted textbook ordering/names** — uses the app's own seed order and
  the public TOPIK level standard. (The deferred "Sejong / KGIU" framing is out.)
- **No overlap with decks/garden** — it's a read-only *guidance* surface (order +
  progress + next), not new content, not a new practice gate.

## 2. Decisions (locked in brainstorming)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Flavor | **Ordered TOPIK paths** — one path per level, the level's grammar in seed order. |
| 2 | "Learned" signal | **SRS mastery** — a point is learned when its mastery is `'plant'` or `'tree'` (past seedling). Derived from existing log/SRS; no new data, no migration. |
| 3 | Surface | A standalone **`/paths`** page. |
| 4 | Entry | A link/CTA on the **Library** page (`/library` → `/paths`). No new nav item/icon. |
| 5 | Order source | The existing grammar seed order (`grammarStore.items` filtered by `deckId`, array order preserved). |
| 6 | Next-up action | Deep-link **`/practice/ruleta?focus=<nextKo>`** — reuse the existing focus round. |

### Out of scope (YAGNI)
- Textbook-named paths (trademark/copyright).
- Re-ordering grammar beyond the seed order.
- Manual "mark as known" (would need storage + migration).
- Gating practice by path progress (`filterPoolByDeck`) — that would overlap the
  decks; the path is a view + recommendation, not a gate.
- No new storage key, no DB migration.

## 3. Architecture

- `app/lib/paths/progress.ts` — pure:
  ```ts
  import type { SrsState } from '~/lib/domain'
  export function isLearned(state: SrsState | undefined): boolean
  // state?.mastery === 'plant' || state?.mastery === 'tree'
  export interface PathItem { ko: string; learned: boolean }
  export interface PathProgress { items: PathItem[]; total: number; learned: number; pct: number; nextKo: string | null }
  export function pathProgress(kos: string[], srsMap: Record<string, SrsState>): PathProgress
  // items = kos mapped to their learned flag (preserves order); learned = count;
  // pct = total ? learned/total : 0 (0..1); nextKo = first not-learned ko, else null.
  ```
- `app/composables/usePaths.ts` — reads `grammarStore.items` + `grammarStore.decks`
  + `srsStore.map`; returns the TOPIK paths in deck order:
  `{ deckId, name, progress }[]` where `progress = pathProgress(kos, srsMap)` and
  `kos` = items with that `deckId` in array order. Only the six `topik-*` decks.
- `app/components/paths/PathCard.vue` — props `{ name, progress }`:
  a progress bar (`pct`) + `learned/total` label; the next-up point (`nextKo`) with
  a "practice next" CTA (`NuxtLink` to `/practice/ruleta?focus=<nextKo>`); a
  collapsible (`<details>`) ordered list of `progress.items`, each marked
  learned/pending with the next-up highlighted (display only). When
  `nextKo === null`, show a "path complete" state instead of the CTA.
- `app/pages/paths.vue` — `definePageMeta({ surface: 'study' })`; hydrates the
  grammar store idempotently on mount (like `cloze.vue`); renders one `PathCard`
  per path from `usePaths()`.
- `app/pages/library.vue` — add a link/CTA to `/paths` near the top.
- i18n: `paths.*` (title, lead, progress label `{learned}/{total}`, next label,
  practice CTA, complete state, list toggle) + `library.paths_link` (+ optional
  `nav` reuse) ×8.

### Data flow
`grammarStore.items` (deck-filtered, ordered) + `srsStore.map` → `pathProgress`
→ each `PathCard` renders bar + next-up + list. The CTA hands off to the existing
ruleta focus round; mastery updates there flow back into `srsStore.map`, so the
path progress reflects practice the next time `/paths` is opened.

### Why no migration / no overlap
Everything derives from already-hydrated stores (grammar catalog + per-ko SRS
mastery). It adds a read-only lens, not new content or a new gate, so it doesn't
duplicate the decks (draw pools), contexts (situations), or garden zones.

## 4. Testing

- `progress.test.ts` (pure): `isLearned` for each mastery + undefined;
  `pathProgress` — counts learned, computes pct, `nextKo` = first pending in order,
  all-learned → `nextKo: null`, empty level → `{0,0,0,null}`.
- `PathCard.test.ts` (component): renders the `learned/total` label and bar; shows
  the next-up CTA linking to `/practice/ruleta?focus=<nextKo>`; the `<details>`
  list renders one row per ko with learned/pending state; `nextKo === null` shows
  the complete state, not the CTA.
- `usePaths.test.ts`: returns six paths in deck order, each `kos` filtered to its
  `deckId` and in array order; custom/excluded decks skipped (mock grammar + srs).
- i18n parity for the new `paths.*` + `library.paths_link` keys across 8 locales.
- The `/library` link + `/paths` page wiring covered by the component/composable
  tests + a manual/preview smoke (pages aren't unit-mounted, per convention).

## 5. Build approach

TDD per unit (pure progress → composable → PathCard → page + library link → i18n),
inline execution.
