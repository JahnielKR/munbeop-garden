# Drill replay + más ítems — design

**2026-06-20 · Subproject 3 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming, ready for writing-plans.**

## Goal

Make the **Choque** drill (the 은/는-vs-이/가-style clash drill, now 6 sets / 44 items)
replayable and richer:

1. **Shuffle** — every round presents its items in a fresh random order (no more fixed seed order; "Repetir" stops being identical).
2. **Repasar fallos** — after a round with mistakes, a "Repasar fallos (N)" button re-drills ONLY the failed items, as a real drill, without writing duplicate diary entries.
3. **Más ítems** — author more `DrillItem`s so the smaller sets have enough variety for replay (~10 per set), 8-locale + adversarially verified.

No change to the two-layer judge model (받침/allomorph slip = blocked+retry; wrong family = semantic error).

## Current state (what exists)

- `app/composables/useParticleDrill.ts` — `items` is `PARTICLE_DRILLS.filter(setId)` in **fixed seed order**; `index` walks 0..n; `start()` resets; `next()` advances → `finish()` at the end. `failedItems` (computed) already exists. `answer()` calls `logMistake` on a wrong-family error (writes a `hard` diary entry + `srs.recalculate`). `finish()` writes one `easy` diary entry per family when `accuracy ≥ 0.7` and `≥3` ended-correct per family.
- `app/components/particle-lab/DrillSummary.vue` — end screen: score, slips, a **read-only review list** of failed items (correct form + reason), and CTAs `🔁 restart` / `🧩 explore` / `📓 log`.
- `app/pages/practice/particles.vue` — `restartDrill` → `drill.start()`; summary wired with `@restart`.
- `app/stores/srs.ts` — `markSeen(ko)` bumps `lastSeen` (lightweight, per-row upsert); `recalculate(ko)` recomputes mastery **from the diary log**. → reinforcing SRS without a diary write is done via `markSeen`, not `recalculate`.
- `app/seed/particle-drills.ts` — the 44 items; `app/seed/clash-sets.ts` — 6 sets; `tests/unit/particle-lab/clash-sets.test.ts` asserts ≥5 items/set, both families represented.

## Design

### A. Composable — session list + replay mode (`useParticleDrill.ts`)

Introduce an explicit **session list** — the ordered items for the current round — so both shuffle and the failed-subset replay are the same mechanism.

- `const sessionItems = ref<DrillItem[]>([])` — the round's ordered items. `item`, `score`, `failedItems` are computed over `sessionItems` + the round's `results` (today they read `items`; they move to `sessionItems`).
- `type DrillMode = 'normal' | 'replay'`; `const mode = ref<DrillMode>('normal')`.
- Pure helper `shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[]` in `app/lib/particle-lab/` (Fisher–Yates, returns a new array). Re-exported from `lib/particle-lab`. Unit-testable with a seeded rng.
- `start()`: `mode='normal'`; `sessionItems = shuffle(items.value)`; reset round state (`index/phase/verdict/picked/blockedChoices/results/slipsThisItem/gardenGrew`); `markSeen` both families (unchanged). → **"Repetir" now re-shuffles.**
- New `replayFailed()`: if `failedItems.value.length === 0` return; snapshot the current failed items; `mode='replay'`; `sessionItems = shuffle(snapshot)`; reset round state; `markSeen` both families (the SRS "reinforcement" — `lastSeen` bump, no diary write).
- In `mode === 'replay'`:
  - `answer()` skips `logMistake` (no new `hard` diary entries on a re-missed item).
  - `finish()` skips the `easy` diary writes (and the accuracy/family gate). `gardenGrew` stays false in replay.
  - Everything else (judging, blocked retries, score, the replay's own `failedItems`) works identically, so a replay round can itself end with failures → "Repasar fallos" again.
- `selectSet()` unchanged; selecting a set still implies a fresh `start()` from the page.
- Return additions: `mode`, `replayFailed`. (`restart` keeps mapping to `start`.)

**Why a session list:** `failedItems` must be snapshotted at the moment of replay (it's derived from the just-finished round). Walking a concrete `sessionItems` array — rather than re-deriving from `items` + a filter — keeps `index`/`item`/progress correct for both the full shuffled round and the failed-subset round, and leaves room for future sampling without touching the walker.

### B. Summary UI (`DrillSummary.vue` + `particles.vue`)

- `DrillSummary` gains an emit `replay-failed`. When `failedItems.length > 0`, render a **primary** CTA `🔁 {repasar fallos} (N)` that emits `replay-failed`; demote the existing "Repetir" to a secondary style (it now replays the full set, shuffled). Keep Explorar + Diario and the read-only review list. When there are no failures, the primary CTA is the existing "Repetir".
- A light **"modo repaso"** indicator while a replay round is in progress (a small chip/label above the DrillCard) so the user knows mistakes aren't being re-logged. Driven by `drill.mode === 'replay'`.
- `particles.vue`: wire `@replay-failed="onReplayFailed"` → `drill.replayFailed()`; `restartDrill` stays `drill.start()` (now shuffles). Reset `mode` to `'normal'` whenever a normal round starts.
- New i18n keys (8 locales): `particles.drill.summary_replay_failed` ("Repasar fallos"), `particles.drill.replay_mode_label` ("Modo repaso · los fallos no se registran de nuevo" / short equivalents).

### C. Content — más ítems (`particle-drills.ts`)

- Bring each clash set to ~10 items. `topic-subject` already has 12 → unchanged. The 5 newer sets (이가/을를·에/에서·에/한테·도/만·부터/까지 — verify exact set ids in `clash-sets.ts`) get **+3–4 items each (~+18 total)**: `setId` + `familyIndex`, distinct `noun`/`lead`/`rest`, unique ids (set-prefixed), 8-locale `cue`/`reason`/`trans`, TOPIK 1–2 vocab.
- Each new item is adversarially verified by a background Workflow (same pattern as Explore #4): the assembled sentence `lead+noun+correctForm+rest` is natural Korean, the `cue` unambiguously selects the intended family, the 받침/allomorph is right, and the 8-locale strings are accurate. Splice → prettier → typecheck.
- Both families must stay represented in every set, and items should spread across 받침/no-받침 nouns so the blocked-retry path is exercised.

### D. Testing

- `app/lib/particle-lab/` unit test for `shuffle`: with a seeded/stub rng it returns a known permutation; result is a permutation of the input (same multiset); empty and single-element inputs are returned intact.
- Composable behaviour (a focused test, mocking `logStore`/`srsStore`):
  - `replayFailed()` after a round builds `sessionItems` equal to that round's failed items (as a set) and sets `mode='replay'`.
  - In replay mode, a wrong-family answer does **not** call `logStore.add`; `markSeen` was called for the families at replay start.
  - `replayFailed()` is a no-op when there were no failures.
- `tests/unit/particle-lab/clash-sets.test.ts` — keep the ≥5/both-families invariants; they automatically cover the new items. Optionally assert each set now has ≥8 items (decide at plan time — don't over-constrain if a set stays smaller).
- Full suite + typecheck + lint green. Manual (logged in): finish a round with mistakes → "Repasar fallos (N)" re-drills only those, shows the repaso label, writes no new diary entries; "Repetir" reshuffles; deep-linked `?set=` unaffected.

## Files

| Action | Path |
|---|---|
| Create | `app/lib/particle-lab/shuffle.ts` (+ re-export from the barrel) |
| Edit | `app/composables/useParticleDrill.ts` (session list, `mode`, `replayFailed`, replay-skips-logging) |
| Edit | `app/components/particle-lab/DrillSummary.vue` (replay-failed CTA) |
| Edit | `app/components/particle-lab/DrillCard.vue` or `particles.vue` (modo-repaso label) |
| Edit | `app/pages/practice/particles.vue` (wire `replay-failed`, reset mode) |
| Edit | `app/seed/particle-drills.ts` (+~18 items) |
| Edit | `i18n/locales/*.json` (2 keys ×8) |
| Create/Edit | `tests/unit/particle-lab/shuffle.test.ts`, drill composable test, `clash-sets.test.ts` |

No engine/judge change, no SQL, no new SRS plumbing (reuse `markSeen`).

## Out of scope (YAGNI)

- Sampling a random N-item session (the user chose "ampliar contenido", not sampling). The session-list design leaves room for it later without rework.
- A shuffle on/off toggle — shuffle is always on (strictly better; prevents order-memorization).
- Re-logging replays to the diary (explicitly rejected — avoids duplicate `hard` entries).
