# Mistake feed ("plants to revisit") + errorDimension tag — design

_Created 2026-06-20. Roadmap Step 2 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S–M._

## Goal

Turn already-collected mistake data into an actionable study surface, and start capturing a structured **failure-dimension** signal. mungarden's log already records `errorNote` + `reviewState` and `isPendingReview` already aggregates the "rain" entries, but there is no consolidated "your mistakes" view and the notes carry no diagnostic structure. This step adds a grouped **"plants to revisit"** feed on `/log` and an optional one-tap `errorDimension` tag — the load-bearing input for Step 7 (discrimination) and Step 11 (leech rescue).

Calm framing throughout: "plants to revisit", never "failures/mistakes-as-shame".

## Decisions (locked)

- **Scope:** feed **and** the `errorDimension` tag, persisted via a Supabase migration (chosen over view-only).
- **Placement:** a grouped section **above the existing `/log` list** (chosen over a new `/revisit` route).

## Data model

- `LogEntry` gains `errorDimension?: ErrorDimension | null` where
  `type ErrorDimension = 'particle' | 'ending' | 'register' | 'word_order' | 'other'`
  (in `app/lib/domain/log.ts`).
- **Migration** (additive, nullable — backward-compatible): `ALTER TABLE public.user_log ADD COLUMN error_dimension text;` as a new file under `supabase/migrations/`, applied to the live project (Supabase MCP) and `app/types/database.types.ts` regenerated.
- **Adapter** (`app/lib/storage/supabase.ts`): `logRow()` adds `error_dimension: e.errorDimension ?? null`; the `user_log` read map adds `errorDimension: r.error_dimension ?? null`. (Existing columns: id, user_id, ko, sentence, feedback, error_note, review_state, context_id, context_name, created_at.)
- localStorage/noop adapters need no change — they round-trip the whole `LogEntry` object, so the new field rides along for free.

## Capture flow (the tag UI)

The error block only appears when the user marks a sentence **hard**, which is exactly where a failure dimension is meaningful.

- `ErrorNoteBlock.vue`: add a one-tap chip row of 5 dimensions — 조사 (particle) · 어미 (ending) · 높임 (register) · 어순 (word order) · 기타 (other). Korean term + localized gloss. Tap toggles; tapping the selected chip clears it. New `dimension` prop + `update:dimension` emit (`v-model:dimension`). Selecting a dimension is always optional.
- Threading: `ErrorNoteBlock` → `GrammarCard` holds an `errorDimension` ref and includes it in the `submit` payload `{ pickIndex, sentence, feedback, errorNote, errorDimension }` (on BOTH save-with-note and skip-note paths) → `usePractice.persistEntry` passes it to `logStore.add` → `LogEntry.errorDimension`. `GrammarCard.reset()` clears it.
- A hard entry is `isPendingReview` regardless of note, so a dimension-tagged hard entry appears in the feed even without a note.

## The feed (grouped section on `/log`)

- Pure `groupPendingByKo(entries): { ko: string; entries: LogEntry[] }[]` in `app/lib/log/group.ts` — keeps only `isPendingReview` entries, groups by `ko`, sorts by group size desc (most-struggled pattern first), stable within a group by existing order.
- New `MistakeFeed.vue` (`app/components/log/`): renders the "plants to revisit" section, shown only when there is ≥1 pending entry. Per group: a header with `ko`, the pending count, and a **"practice 화이팅"** link reusing the existing focus deeplink `/practice/ruleta?focus=<ko>`; below it, the group's pending entries.
- To avoid bloating `log.vue` (no god files), extract `LogEntryRow.vue` (`app/components/log/`) — one entry's markup: ko/date, sentence, note, the dimension chip (when set), and the mark-reviewed control / reviewed badge (moving the existing `markReviewed` call up via an emit). `MistakeFeed` and the existing flat "recent" list both render `LogEntryRow`.
- `log.vue` becomes a thin composition: `<MistakeFeed>` (pending, grouped) above the recent flat list (now using `LogEntryRow`). The `markReviewed` handler stays in `log.vue` and is wired through both via an emitted `review` event.

## i18n (all 8 locales)

- `dimension.prompt` ("What slipped?"), `dimension.particle`/`ending`/`register`/`word_order`/`other` (Korean term + localized gloss).
- `journal.revisit_title` ("Plants to revisit"), `journal.revisit_count` ("{n} to revisit" — keeps `{n}`), `journal.revisit_practice` ("Practice 화이팅" — keeps 화이팅).
- A parity test enforces presence in all 8 locales + the `{n}` and 화이팅 invariants.

## Testing (TDD — pure logic first)

- `groupPendingByKo` — only pending entries; grouped by ko; sorted by group size desc; non-pending and easy entries excluded; empty in → empty out.
- `ErrorNoteBlock` — renders 5 dimension chips; tapping one emits `update:dimension` with its value; tapping the selected one emits `null` (clear).
- `MistakeFeed` — given mixed entries, renders one group per pending ko with the count and a focus link `/practice/ruleta?focus=<ko>`; renders nothing when there are no pending entries.
- `LogEntryRow` — shows the dimension chip when set; emits `review` with the id on mark-reviewed click.
- Adapter: extend `supabase.test.ts` so `logRow`/read round-trip includes `error_dimension`.
- i18n parity for `dimension.*` + `journal.revisit_*`.

## Acceptance criteria

1. Marking a sentence hard shows the 5 dimension chips; selecting one persists `errorDimension` on the entry (round-trips through Supabase after the migration); it is optional.
2. `/log` shows a grouped "plants to revisit" section above the recent list when pending entries exist, one group per `ko` with a count and a focus-practice link; nothing when there are none.
3. Each entry shows its dimension chip when set and keeps the existing mark-reviewed behavior (which still clears the garden rain via `isPendingReview`).
4. New `dimension.*` + `journal.revisit_*` keys in all 8 locales; 화이팅 untranslated.
5. `pnpm test` / `lint` / `typecheck` green; the migration is applied and `database.types.ts` regenerated.

## Out of scope

Leech detection / rescue flow (Step 11 — this step only lands the clean signal); retroactively editing a tag from the feed; any auto-grading; a dedicated `/revisit` route.
