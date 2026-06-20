# Onboarding: distinct empty plot + one guided first sentence — design

_Created 2026-06-20. Roadmap Step 1 of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S._

## Goal

A brand-new user (zero log entries) currently sees the garden home identical to a veteran on an un-started level: dormant tree, snow, Bomi asleep. There is no scaffolding for mungarden's unusual **write-a-sentence-from-scratch** loop. This step gives the new user (1) a visibly distinct empty-plot state and (2) one fully guided first sentence that writes **real** progress and ends in a celebratory first sprout — so they understand the loop and hit an early success.

First-session activation is the single strongest retention lever; this is the cheapest large one in the roadmap. Out of scope: TOPIK placement (roadmap Step 15).

## Approach (and rejected alternatives)

- **Overlay on the garden home**, not a new `/onboarding` route — keeps the user where the sprout payoff lands and adds no route. _(Rejected: dedicated route fragments the experience.)_
- **The guided sentence writes a real log entry + SRS row**, via the same persistence shape as the normal loop. _(Rejected: a cosmetic-only sprout that writes nothing — dishonest and leaves the garden empty.)_
- **`onboarded` flag in `localStorage`**, mirroring the existing `garden.activeLevel` precedent (`useGardenState.ts`) — zero migration, no storage-adapter mapping.

## Behaviour

### Two distinct surfaces

1. **`EmptyPlot` (persistent zero-state).** Once `appStatus === 'ready'`, whenever the log is empty the garden home renders a labeled "plant your first seed" plot instead of the ambiguous winter-veteran tree, with a CTA that opens the guided sentence. This is also the **manual entry point** for a user who skipped the overlay. (Before `ready` the existing dormant tree shows, as today — no flash.)
2. **`GuidedFirstSentence` (one-time overlay).** A short linear flow: brief intro → template-with-blank → reveal of the model answer → first-sprout celebration (Bomi cheer + sprout sprite).

### The guided sentence (template with a blank in the conjugation slot)

- **Deterministic starter** (never random): one curated TOPIK-1 grammar + one scene. Reference starter: grammar `-아서/어서`, weekend scene. The Korean stays Korean (brand convention); the instructions/translation are localized.
- **Template:** a near-complete model sentence with the grammar's conjugation blanked, e.g. `주말에 친구를 만나[ ___ ] 기분이 좋았어요`. The user types the missing piece (`서`).
- **No auto-grading.** On reveal we show the full model sentence + localized translation and **celebrate regardless** (the entry is recorded self-graded `easy`). The blank is pedagogical scaffolding, a bridge to the real loop where the user will write the whole sentence.

### Real progress on completion

On completion the flow records one real entry through the existing data path:

- `logStore.add({ ko, sentence, feedback: 'easy', errorNote: null, reviewState: 'unreviewed', contextId, contextName })`
- `srsStore.markSeen(ko)` then `srsStore.recalculate(ko)`

The persisted `sentence` is the user's completed sentence (template + their fill). `contextId`/`contextName` come from the first active context (`contextsStore.active[0]`, guaranteed ≥ `MIN_ACTIVE_CONTEXTS`), keeping the diary entry consistent without coupling the displayed scene to a specific seed id.

One seedling barely moves level `pct`, so the tree may still read dormant — that is honest (a seed was just planted). The **emotional payoff is the overlay's own sprout celebration**, independent of the garden's visual threshold. After the overlay closes the log is non-empty, so `EmptyPlot` no longer shows.

### Gate (no pre-hydration flash)

- **Auto-show overlay** when `appStatus === 'ready'` AND log is empty AND `!onboarded`. Consuming `appStatus` prevents flashing onboarding at a returning user whose log has not yet hydrated.
- **`EmptyPlot`** shows when `appStatus === 'ready'` and the log is empty (independent of the flag), so a user who skipped can still start later.
- **Skippable.** Skip or completion sets `onboarded = true`; the overlay never auto-shows again.

### Robustness

If the referenced starter grammar is absent from the catalog at runtime, the overlay self-disables (treated as onboarded) rather than blocking — a brand-new user is never stuck on a broken starter. The plan's first task confirms the starter grammar exists in the seed.

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/onboarding/starter.ts` | The starter definition `{ grammarKo, sceneKey, templateKo, blankAnswer, modelSentenceKo }` + `parseTemplate(tpl)` → `{ before, after }` around the blank marker. Pure. |
| `app/lib/onboarding/gate.ts` | `shouldShowOnboarding({ ready, logEmpty, onboarded }): boolean`. Pure. |
| `app/composables/useOnboarding.ts` | Reads/writes the `localStorage` flag; exposes `shouldShow`, `start()`, `complete(sentence)`, `skip()`; performs the log + SRS write on `complete`. |
| `app/components/onboarding/GuidedFirstSentence.vue` | The overlay flow (intro → template-with-blank input → reveal → sprout celebration). Accessible dialog semantics; honors `prefers-reduced-motion`. |
| `app/components/garden/EmptyPlot.vue` | The distinct zero-state plot + CTA. |
| `app/pages/index.vue` | Gate: render `EmptyPlot` when log empty; mount `GuidedFirstSentence` when `shouldShow`; CTA → `start()`. |
| `i18n/locales/*.json` (×8) | `onboarding.*` keys: intro, prompt, reveal, celebrate, skip, empty-plot copy, CTA. |

Data shapes reuse `LogEntry` (`lib/domain/log.ts`) and `SrsState` — no new tables, no migration.

## Testing (TDD — pure logic first)

- `shouldShowOnboarding` — truth table over `{ ready, logEmpty, onboarded }` (only `ready && logEmpty && !onboarded` → true).
- `parseTemplate` — splits a template on the blank marker into `before`/`after`; handles marker at start/end; rejects a template with no marker.
- `useOnboarding.complete` — with mocked stores (per `useStats.test.ts` pattern), asserts exactly one `logStore.add` with the expected shape + `srsStore.markSeen`/`recalculate` for the starter `ko`, and that the flag is set.
- Flag persistence round-trips through `localStorage`.

## Acceptance criteria

1. A zero-log user at `appStatus==='ready'` sees `EmptyPlot` and the guided overlay; a user with log entries sees neither (no flash on hard refresh).
2. Completing the guided sentence writes exactly one log entry + one SRS row for the starter grammar, shows the sprout celebration, and closes the overlay; the flag persists so it never auto-shows again.
3. Skip closes the overlay, sets the flag, and leaves the `EmptyPlot` CTA as a manual entry point.
4. New `onboarding.*` keys exist in all 8 locales; the starter's Korean is untranslated.
5. Pure-logic tests above pass; `lint` + `typecheck` + `test` green.
6. Honors `prefers-reduced-motion` (no celebration motion when reduced).

## Out of scope

TOPIK placement / level picker (Step 15); chaining into a full real practice round after the guided sentence (possible follow-up, not v1); any auto-grading of the typed answer.
