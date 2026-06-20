# Bunpro-inspired roadmap — sequenced execution plan

_Created 2026-06-20. Source: competitive analysis of Bunpro vs mungarden (see chat 2026-06-20). Ordered by **dependency**, not just priority: several P1 drills share one Korean morphology engine and one example-content spine that must exist first._

## Guiding principles

- **Don't clone Bunpro's engine.** mungarden's weighted-draw + production + self-grade loop and its garden/escape-room identity are the moat. Borrow Bunpro's _content depth_, _habit anchors_, and build the _Korean-specific drills_ Bunpro never needs.
- **Cheapest wins first.** The biggest near-term ROI reuses data/tables that already exist (`isPendingReview`, `user_custom_grammars`).
- **Korean morphology is the hard part.** Anything that grades a typed Korean answer needs a batchim/irregular-aware engine, or it must be recognition (choice) only. Never ship a naive string-matcher.
- **Protect the calm.** No overdue-debt counters, no fire-streak loss-aversion, no nagging. Garden language always.
- Per repo conventions: TDD, no god files, verify→commit→verify→push. Plans/code/commits in English.

## Progress checklist

### Phase 0 — Free wins (reuse existing data/infra)
- [ ] **Step 1** — Onboarding: distinct empty-garden state + one guided sentence
- [ ] **Step 2** — Mistake feed ("plants to revisit") + `errorDimension` tag
- [ ] **Step 3** — Wire self-study (custom grammar; table already exists)
- [ ] **Step 4** — Daily goal + "mulch" streak-freeze (garden-framed)

### Phase 1 — The Korean spine (foundational; unlocks the P1 drills)
- [ ] **Step 5** — `app/lib/korean/` conjugation + allomorph engine + recognition-first conjugation drill
- [ ] **Step 6** — `grammar_examples` bank: schema + register tag + AI-draft→native-review sourcing pipeline

### Phase 2 — Drills that ride the spine
- [ ] **Step 7** — Discrimination drill on confusable pairs
- [ ] **Step 8** — Register-transform drill (반말 ↔ 해요체 ↔ 합쇼체)
- [ ] **Step 9** — Cloze / recognition round (choice-first)
- [ ] **Step 10** — Korean TTS audio on examples (liaison/assimilation, not pitch/readings)
- [ ] **Step 11** — Leech detection + guided rescue
- [ ] **Step 12** — Soft "N plants ready to revisit" due-count nudge

### Phase 3 — Breadth + retention polish
- [ ] **Step 13** — Counters/classifiers + native-vs-Sino numbers
- [ ] **Step 14** — Textbook/TOPIK grammar-list paths
- [ ] **Step 15** — Self-declared TOPIK placement (onboarding step 2)
- [ ] **Step 16** — Opt-in review reminders (PWA-local first)

### Phase 4 — Monetization (only after Steps 6 + 10 exist)
- [ ] **Step 17** — Real paywall on Toss/KakaoPay + server-verified entitlement

---

## Dependency map (why this order)

```
Step 2 (errorDimension tag) ──┬──> Step 7 (pair selection)
                              └──> Step 11 (leech signal)
Step 5 (korean engine) ───────┬──> Step 6 (correct surface forms)
                              ├──> Step 8 (honorific suppletion)
                              ├──> Step 9 (distractor generation)
                              └──> Step 10 (audio of correct forms)
Step 6 (example bank) ────────┬──> Step 8 (register-tagged examples)
                              ├──> Step 9 (cloze content)
                              ├──> Step 10 (audio content)
                              └──> Step 11/13 (extra examples, counter content)
Step 11/12 (due surfaces) ────────> Step 16 (reminders need a "ready" count)
Step 6 + Step 10 (premium content) > Step 17 (nothing to gate without them)
```

`errorDimension` (Step 2) and `register` (Step 6) are shared axes — get them right early; many later steps consume them.

---

## Phase 0 — Free wins

### Step 1 — Onboarding: distinct empty-garden + one guided sentence
- **Goal:** A brand-new user (0 log entries) gets a visibly distinct empty state and one fully guided sentence that ends in the first sprout, so they understand the unusual write-from-scratch loop and hit an early success.
- **Build:** A distinct zero-progress garden component (a labeled empty plot, NOT the winter-veteran look) gated on empty `useLogStore`; a single linear guided flow (pick a starter grammar → confirm a starter context → write → reveal → first sprout). An `onboarded` flag.
- **Plugs into:** `munbeop/app/pages/index.vue` (gate), new empty-state component under `app/components/garden/`, reuse deck selection (`stores/grammar.ts`) + context floor (`stores/contexts.ts`). `onboarded` flag: client-side first or folded into the `prefs` jsonb in `stores/settings.ts` (note: `SupabaseAdapter` no-ops unmapped keys — no migration for v1).
- **Depends on:** nothing.
- **Acceptance:** zero-log user sees the empty plot + guided flow; one completed sentence shows a sprout; flag persists so it doesn't reappear; flow is skippable; existing users (log non-empty) see no change. New i18n keys present in all 8 locales. Tests cover the gate predicate.
- **Effort:** S. **Do NOT bundle placement here** (that's Step 15).

### Step 2 — Mistake feed + `errorDimension` tag
- **Goal:** Turn the already-collected mistake data into a study surface, and start collecting a structured failure-dimension signal that later steps depend on.
- **Build:** A "plants to revisit" view aggregating `isPendingReview` entries grouped by `ko` (your wrong sentence + note + study-sheet link), with a focused "revisit these" mini-session that clears them (and thus clears the rain). Add an optional one-tap `errorDimension` enum to the error-note flow: `particle | ending | register | word-order | other`.
- **Plugs into:** new view over `useLogStore` filtered by `isPendingReview`; reuse the `focus=<ko>` deeplink (`composables/usePractice.ts`) and `setReviewState` (`stores/log.ts`); add `errorDimension?` to `LogEntry` (`lib/domain/log.ts`) surfaced in `components/practice/ErrorNoteBlock.vue`.
- **Depends on:** nothing (reuses existing log).
- **Acceptance:** flagged-incorrect/hard entries appear grouped by `ko`; the mini-session draws only from them and marking reviewed clears rain; the dimension chip is optional and one-tap; tag rides in the existing log payload (no migration for v1) — note a Supabase column is only needed if we later persist/query it server-side. Framed as "plants you flagged," never "failures."
- **Effort:** S.

### Step 3 — Wire self-study (custom grammar)
- **Goal:** Let the user (you, first) add your own grammar that flows through the exact same draw/mastery/garden machinery. The backend table already exists and is dead.
- **Build:** A "plant your own" CRUD: form (ko + meaning + optional example) → personal deck → merged into the practice pool. Visually distinct from the vetted catalog.
- **Plugs into:** new CRUD store (sibling to `stores/grammar.ts`) reading/writing `public.user_custom_grammars` via `lib/storage/supabase.ts`; **add a `customGrammars` entry to `STORAGE_KEYS` + adapter mapping** (the key does NOT exist yet, even though the table does); merge custom items into `grammarStore.items` so `usePractice`/`lib/srs/pick.ts` pick them automatically; library entry point.
- **Depends on:** nothing (table + RLS exist; needs the storage-key/adapter wiring).
- **Acceptance:** add/edit/delete a custom grammar; it appears in practice draws and the garden; study sheet degrades gracefully on empty examples (the Coming-Soon sections already handle this); custom items read as distinct from catalog. No DB migration (table exists); confirm RLS read/write paths with a test.
- **Effort:** S–M.

### Step 4 — Daily goal + "mulch" streak-freeze
- **Goal:** A small, attainable daily goal + a grace mechanic so one missed day doesn't kill the streak — all in garden language.
- **Build:** user-set goal ("tend N plants today") as a progress ring near the tree; auto-banked 1–2 grace days ("mulch"). No fire emojis, no loss-aversion theatre.
- **Plugs into:** extend `currentStreak` (`lib/stats/streak.ts`) to accept grace days; store goal + graceDays in `stores/settings.ts` — needs a persistence home (add columns to `public.user_settings` via a migration like `20260614000001_user_settings.sql`, OR fold into the `prefs` jsonb to avoid a migration); render the ring in `pages/index.vue`.
- **Depends on:** nothing.
- **Acceptance:** goal configurable and shown; completing it fills the ring; a single missed day consumes a grace day instead of breaking the streak; pure-function streak logic unit-tested with injected `now`. Calm framing verified.
- **Effort:** S–M.

---

## Phase 1 — The Korean spine

### Step 5 — `app/lib/korean/` engine + recognition-first conjugation drill ⭐ foundational
- **Goal:** The piece half of Phase 2 depends on. A batchim/irregular-aware conjugator + allomorph resolver, plus a drill that makes the user produce the correctly inflected surface form (teaches the rule, not the sentence).
- **Build:** pure, heavily-tested `lib/korean/` (vowel harmony for -아/어; 으-insertion for -(으); irregulars ㅂ/ㄷ/ㅡ/르/ㅎ/ㅅ/ㄹ-drop; contractions 보+아→봐, 되+어→돼, 하다→해; particle allomorphy 은/는·이/가·을/를·(으)로 keyed on the preceding noun's batchim). Drill mode: stem + target ending → choose the right surface form. **Recognition (choice) first**; typed entry only after the engine is proven.
- **Plugs into:** new `app/lib/korean/` (unit-tested in `tests/`); drill mode in `lib/practice/session.ts` + card under `components/practice/`. Reads dictionary forms from the catalog.
- **Depends on:** nothing, but is a prerequisite for Steps 6/8/9/10.
- **Acceptance:** golden-test table of conjugations/allomorphs (including all irregular classes) passes; recognition drill renders correct + plausible distractors; particle drill carries the noun's batchim. Typed grading is explicitly out of v1 scope.
- **Effort:** L (engine). Recognition-only drill on top is M.

### Step 6 — `grammar_examples` bank + sourcing pipeline ⭐ content spine
- **Goal:** Replace the single-example-per-point limit (which silently blocks cloze/audio/transform). Many examples per point, register-tagged, with a real authoring pipeline.
- **Build:** `grammar_examples` table `{ ko, sentence, trans (localized), register (반말/존댓말/격식체), topikLevel }`; 2–4 surfaced in the study sheet. A `tools/` pipeline: AI-draft → Korean-native review (mirrors the escape-room asset pipeline), reusing the 8-locale translation discipline for `trans`.
- **Plugs into:** new `public.grammar_examples` (migration in `supabase/migrations/`, FK to `grammars.ko`, RLS read-all, seeded like `20260603000003_seed_catalog.sql`); render in `components/library/GrammarStudySheet.vue` replacing the examples Coming-Soon section; authoring tooling in `tools/`.
- **Depends on:** ideally Step 5 (so seeded surface forms are conjugation-correct).
- **Acceptance:** schema + RLS + seed for a first batch of points; study sheet shows real register-tagged examples; pipeline documented and runnable; native review gate enforced before seeding. Authoring quality is the long pole — start this early, run in parallel with Step 5.
- **Effort:** L (authoring is the cost; schema/UI is small).

---

## Phase 2 — Drills that ride the spine

### Step 7 — Discrimination drill on confusable pairs
- **Goal:** Active "which one fits here?" on near-interchangeable patterns (안 vs 못; 은/는 vs 이/가; -아서/어서 vs -(으)니까 — the catalog already seeds these), plus static "often confused with" chips.
- **Plugs into:** add `related_ko` (text[]) to `public.grammars` (migration) or a small relations table; choice-card drill in `lib/practice/session.ts` + `components/practice/`; chips in `GrammarStudySheet.vue`. Feed `errorDimension` from Step 2 into pair selection.
- **Depends on:** Step 2 (tags improve pair targeting). **Effort:** S–M (curation is the real cost).

### Step 8 — Register-transform drill (반말 ↔ 해요체 ↔ 합쇼체)
- **Goal:** Render one sentence across speech levels, including honorific suppletion (계시다/드리다/잡수시다, 께서, -(으)시-). A distinctively Korean differentiator Bunpro can't port.
- **Plugs into:** reads register-tagged rows from `grammar_examples`; honorific rules in `lib/korean/`; transform card in `lib/practice/session.ts` + `components/practice/`. Grade leniently — a 반말 answer in a 존댓말 context is a _register_ error, surfaced as a teachable distinction (`errorDimension='register'`).
- **Depends on:** Steps 5 + 6. **Effort:** M (recognition-first).

### Step 9 — Cloze / recognition round (choice-first)
- **Goal:** A lighter 30-second recognition round that complements production and lowers session friction.
- **Plugs into:** `ClozeCard`/`ChoiceCard` under `components/practice/` + session variant; distractors from `lib/korean/`; reads `grammar_examples`. **No typed string-match** (batchim allomorphy + irregulars reject correct answers). Self-graded easy/hard stays the mastery truth.
- **Depends on:** Steps 5 + 6. **Effort:** M.

### Step 10 — Korean TTS audio on examples
- **Goal:** Audio that teaches spelling≠sound rules (연음 liaison, 받침 neutralization, 자음동화, tensification) — NOT pitch (Korean isn't pitch-accented) and NOT "readings" (Hangul is phonetic).
- **Plugs into:** pregenerate TTS as static assets in `tools/` (no runtime key → fits the no-server SPA), referenced from `grammar_examples` rows; slim player adapted from `composables/useEscapeRoomAudio.ts`; controls in `GrammarStudySheet.vue` + practice reveal. Never autoplay.
- **Depends on:** Step 6 (content) + Step 5 (correct surface forms before TTS). **Effort:** M.

### Step 11 — Leech detection + guided rescue
- **Goal:** Detect chronically-hard "struggling plants" and offer a re-teach flow instead of brute repetition; cap how often one leech dominates a session.
- **Plugs into:** leech selector in `lib/srs/` (or extend `lib/stats/mastery.ts`); reads `SrsState` + log + `errorDimension`; surface on `pages/stats.vue`/library; reuse `focus=<ko>` for the rescue retry → re-read sheet → extra examples → discrimination drill → retry production.
- **Depends on:** Steps 2 + 7. **Effort:** S–M.

### Step 12 — Soft "N plants ready to revisit" nudge
- **Goal:** The habit-anchoring visible number, derived on the fly from existing `SrsState` (mastery + daysSinceSeen + net easy/hard). A gentle nudge wired to the rain — **never** an overdue-debt ledger.
- **Plugs into:** readiness derivation in `lib/srs/` (new `due.ts` alongside `weight.ts`); `readyCount` composable near the garden; bias the existing weighted draw via a `dueBonus` in `usePractice`. Derive on the fly (no migration).
- **Depends on:** cleaner signal from Steps 5/7 helps, but v1 derives from existing data. **Effort:** M (the hard part is making the number _trustworthy_ given noisy self-grading — cap it, keep it forgiving).

---

## Phase 3 — Breadth + retention polish

### Step 13 — Counters/classifiers + native-vs-Sino numbers
TOPIK-1 staple entirely absent from the seed. New content decks (개/명/분/마리/권/장/잔) + native/Sino split (하나/둘 vs 일/이, prenominal 한/두/세/네) + a small selection drill reusing the choice machinery. Prenominal irregularities in `lib/korean/`. **Effort:** M (content).

### Step 14 — Textbook/TOPIK grammar-list paths
Map decks to grammar lists learners actually study from (Sejong, official TOPIK lists, Korean Grammar in Use) — **generic lists, never copyrighted content/ordering**. Reuse `filterPoolByDeck` to gate by path progress. Acquisition upside is a hypothesis; don't over-invest. **Effort:** M (curation, trademark-sensitive).

### Step 15 — Self-declared TOPIK placement (onboarding step 2)
60-second level picker that sets the starting deck, reversible in one tap. Kept separate from Step 1 so it can't block activation. **Effort:** S.

### Step 16 — Opt-in review reminders (PWA-local first)
Tie a gentle reminder to the Step 12 "ready" count. **Prefer zero-backend:** client-scheduled local PWA notifications via the existing service worker / Notification API — no Resend, no edge function, fits the no-tracker stance. Email digest (Supabase scheduled fn + Resend) only if later justified; default OFF, never daily. **Effort:** S–M (PWA path).

---

## Phase 4 — Monetization

### Step 17 — Real paywall on Korean rails
Stand up Toss Payments / KakaoPay with a **server-verified** entitlement (Edge Function — the SPA only has the anon key; never trust client-side gating). Keep garden + production loop + escape-room **free**; gate full audio, the multi-example bank, advanced stats, unlimited custom grammar. Honor the one-time "Forest" option. Replace the static `Tier[]` in `pages/pricing.vue`; add `plan`/entitlement to `user_settings` or a `user_entitlements` table (migration).
- **Hard dependency:** ship Steps 6 + 10 first — without premium content there is nothing to gate and the paywall kills the funnel. **Effort:** L. **Priority:** last.

---

## What NOT to do (protect the moat)
- No typed cloze string-matcher with "normalization" — Korean morphology rejects correct answers.
- No furigana/kanji-reading or pitch mechanics — they don't transfer to Hangul.
- No "N overdue / clear to zero" debt framing; no fire-streak loss-aversion; no nagging.
- No placement test gate on entry; no email-first re-engagement at indie scale; no subscription-only paywall that gates the differentiators.
