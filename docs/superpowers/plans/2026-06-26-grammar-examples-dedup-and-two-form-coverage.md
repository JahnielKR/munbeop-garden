# Plan — Study-sheet examples: kill the duplicate, per-form coverage, + remove duplicate grammar entries

**Status:** ready for a future session. Investigation done 2026-06-26; nothing implemented yet.
**Owner ask (verbatim intent):**
1. In the grammar study sheet, the example shown "above" (Meaning) is identical
   to the one "below" (Examples) — they must differ.
2. A grammar that names two forms (e.g. `좋아하다 / 싫어하다`, `은/는`) must show at
   least one example **per form**.
3. A grammar that names **three or more** forms (e.g. `와/과 · 하고 · (이)랑`,
   `에게 / 한테 / 께`) needs an example for **each** form.
4. (Added later) Some grammars appear **duplicated** in the Library (`을/를`,
   `이/가`, `에`, … shown twice) — remove the duplicate grammar. **This is a
   SEPARATE root cause (junk DATA in `user_custom_grammars`), see §6.**

---

## 1. Root cause (confirmed by code read)

Two components both render the single canonical `Grammar.example`:

- **"Above"** — `app/components/library/GrammarStudySheet/MeaningSection.vue:16-19`
  renders `grammar.example` + `grammar.trans` in a jade-bordered box.
- **"Below"** — `app/components/library/GrammarStudySheet/ExamplesSection.vue:26-33,48-51`
  has a `fallback`: when the examples **bank is empty** AND `grammar.example`
  exists, it renders the *same* `grammar.example` as the single example item.

So any grammar that has a canonical `example` but **no bank** shows that one
sentence **twice**. The bank (`app/seed/grammar-examples/`) currently exists
ONLY for the 12 TOPIK-1 verb-endings (`n1.ts`, 3 examples each). Therefore the
duplication hits **288 of 300** catalog grammars — it is near-universal, not
limited to two-form points. Two-form grammars additionally only ever exemplify
ONE of their forms (the single canonical sentence).

### Scope numbers (measured)
- Catalog grammars with a canonical `example`: **300 / 300** (all).
- Grammars with an authored bank: **12** (`n1.ts` only).
- Grammars showing the duplicated example: **288**.
- Multi-form `ko` strings (contain `/`, `·`, or `vs`): **124** — but most are
  *phonological alternation of one form* (`-아/어요`, `-(으)면`, `-(으)ㄴ/는 X`),
  NOT two distinct forms. The genuinely-distinct-form subset (the real target of
  requirement #2) is ~45–50 (Tier 1 below).

---

## 2. Data model & pipeline (what authoring an example involves)

- Type `GrammarExample { ko, sentence, trans: LocalizedString (8 locales via L()), level: 'formal'|'polite'|'casual' }` — `app/lib/domain/grammar.ts`.
- Seed: `app/seed/grammar-examples/n{level}.ts` exporting `TOPIK_{level}_EXAMPLES`, spread in `app/seed/grammar-examples/index.ts`. **Only `n1.ts` exists today.**
- Lookup: `examplesFor(ko)` (`app/lib/grammar-examples/index.ts`) — filters by ko, sorts formal→polite→casual, caps at `MAX_EXAMPLES = 4`.
- Audio: `tools/grammar-examples-audio/` (edge-tts pipeline, one clip per sentence, hashed) → `app/lib/grammar-examples/audio.ts` + `useExampleAudio.ts` + `ExampleAudioButton.vue`. Mirrors the pronunciation-audio pipeline (Python 3.13 + edge-tts + soundfile, no ffmpeg; `sys.stdout.reconfigure(encoding="utf-8")` on Windows).
- Invariants — `tests/unit/grammar-examples/seed-invariants.test.ts`: every example needs a **known ko**, valid level, non-empty Hangul `sentence`, and **all 8 locale translations non-empty**; plus a coverage block (currently the 12 TOPIK-1 batch ≥2 each). Also `audio-manifest.test.ts`, `examples-for.test.ts`, `i18n/grammar-examples-keys.test.ts`, `ExamplesSection.test.ts`, `GrammarStudySheet.test.ts`.

So each new example = 1 Korean sentence + 8 translations + register tag + 1 TTS clip. This is the same cost profile as the existing Step-6/Step-10 example work.

---

## 3. Fix design (two independent parts)

### Part A — Rendering: kill the duplication structurally (small, do first)
**Recommended (A2): remove the `ExamplesSection` fallback.** Delete the `fallback`
computed + the fallback `<li>` (`ExamplesSection.vue:26-33,48-51`). Result:
- Non-banked grammar → canonical example shows ONLY in Meaning; no Examples section, no duplicate.
- Banked grammar → Meaning shows the canonical (one illustrative sentence); Examples shows the bank (distinct sentences + audio + register chips).

This satisfies requirement #1 immediately with zero content, and degrades
gracefully: as banks get authored (Part B), the Examples section reappears, rich
and distinct. Update `ExamplesSection.test.ts` (it currently asserts the fallback
renders the canonical when the bank is empty — that assertion is removed) and the
`GrammarStudySheet.test.ts` example-fallback expectation (line ~63-65, which
checks the canonical shows when bank empty — keep the Meaning copy, drop the
Examples copy).

**Alternative (A1):** keep both sections but author banks for everything so the
fallback never fires (no rendering change). Heavier; only viable after Part B is
complete for all 288. Prefer A2 now.

**Invariant to add:** in `seed-invariants.test.ts`, assert no bank `sentence`
equals its grammar's canonical `Grammar.example` (so "above" ≠ "below" stays true
once a bank exists).

### Part B — Content: per-form example banks (the real work, phased)
Author `grammar_examples` banks, prioritising the genuinely-two-form grammars,
each covering **every named form**, with 8-locale translations, register tags,
and TTS audio. Reuse the proven multi-agent workflow (Korean author lenses →
adversarial verify on grammaticality / naturalness / register-tag / 8-locale
fidelity / **per-form coverage**) + native (wife) review gate, exactly like the
pronunciation rollout.

**Policy — which grammars need per-form coverage ("two-form"):**
- INCLUDE (Tier 1): `ko` names ≥2 **distinct** surface forms — different lexemes
  (`좋아하다 / 싫어하다`, `이다 / 아니다`, `있다 / 없다`), different particles
  (`은/는`, `이/가`, `을/를`, `에게 / 한테 / 께`, `부터 / 까지`,
  `와/과 · 하고 · (이)랑`), different variant endings (`-군요 / -구나`,
  `-처럼 / -같이`, `-(으)로서 / -(으)로써`, `-는다면 / -(이)라면`,
  `-다는데 / -다더라 / -다더니`), or sets (`이 / 그 / 저`). → **≥1 example per
  named form**. A 3+-form set (`와/과 · 하고 · (이)랑`, `에게 / 한테 / 께`,
  `이 / 그 / 저`, `아직 / 벌써 / 이미`, `-다는데 / -다더라 / -다더니`,
  `-건대 / 생각건대 / 바라건대`) needs **≥3 examples, one per form** — raise
  `MAX_EXAMPLES` (currently 4) if a 3-form set plus register variety overflows it.
- EXCLUDE as one-example (Tier 2): pure phonological/automatic alternation of a
  single form — `-아/어…` (아/어 ablaut), `-(으)…` (epenthesis), `-(으)ㄴ/는 …`
  (tense modifier), `-ㅂ/습니다`, `-ㄴ/는데`. A single example is fine; optionally
  show both alternants as a later refinement.
- EXCLUDE entirely (Tier 3): the catalog category-labels / comparison-drills that
  also have no pronunciation guide — `안 vs 못 (비교)`, `위치어`, `수 분류사`,
  `피동사/피동/사동`, `명사화/즉시/원인/양보/질문 비교`, `가져가다/…`. They have
  dedicated UIs, not example banks.

**Tier-1 actionable list (per-form coverage; finalise borderline cases in Phase 0):**
- TOPIK 1: `은/는`, `이/가`, `을/를`, `와/과 · 하고 · (이)랑`, `에게 / 한테 / 께`, `부터 / 까지`, `이다 / 아니다`, `있다 / 없다`, `좋아하다 / 싫어하다`, `안 + V / -지 않다`, `못 + V / -지 못하다`, `이 / 그 / 저`, `-(으)러 가다/오다`, `-(으)ㄴ 적이 있다/없다`, `N(이)랑 / 하고 + 같이 / 함께`
- TOPIK 2: `-(으)ㄹ 수 있다/없다`, `-(으)ㄴ 후에 / 다음에`, `-고 나서 / -고 나면`, `-아/어야 하다 / 되다`, `-(으)ㄹ 필요가 있다/없다`, `-아/어 놓다 / -아/어 두다`, `때문에 / 기 때문에`, `-처럼 / -같이`, `-군요 / -구나`, `-기 쉽다/어렵다`, `아무 N(이)나 / 아무 N도`, `-다고요? / -(이)라고요?`, `아직 / 벌써 / 이미`
- TOPIK 3: `-(으)ㄴ/는 줄 알다/몰랐다`, `-(으)ㄹ 줄 알다/모르다`, `-는다면 / -(이)라면`, `-기 위해(서) / -을/를 위해(서)`
- TOPIK 4: `-냐고 하다 / -(으)냐고 묻다`, `-(으)ㄹ 듯하다 / -(으)ㄹ 듯이`, `-(으)로서 / -(으)로써`, `-아/어 봤자 / 봐야`, `-고 보다 / -고 보니(까)`, `-다면서요? / -다며?`, `-다고 + 생각하다 / 믿다 / …` (verb-slot — show 2–3 representative verbs)
- TOPIK 5: `-다는데 / -다더라 / -다더니`, `-다고 할까 봐 / -다고 할 줄 알았다`, `-(으)ㄴ/는 듯하다 / 듯싶다`, `-아/어 뵙다 / 봬요`, `-(으)며 살다 / 지내다`
- TOPIK 6: `-건대 / 생각건대 / 바라건대`, `-로다 / -(이)로다`, `-(으)련마는 / -(으)련만`

**Phasing:**
- **Phase 0** — finalise the Tier-1/2/3 classification with the owner (same kind of call as the pronunciation skips); decide whether Tier 2 also gets banks now or later, and whether to keep the canonical `Grammar.example` in Meaning or fold it into the bank.
- **Phase B1** — author Tier-1 banks, level by level (one PR per level, like pronunciation), ≥1 example per form (aim 1 per form × register variety, ≤4 total per `MAX_EXAMPLES`; consider raising the cap to 6 for 3-form sets like `이 / 그 / 저`). Generate audio, extend the manifest, add a coverage test (each Tier-1 ko has an example matching each form — a curated `ko → [form regexes]` map).
- **Phase B2** (optional, larger) — author banks for the remaining non-banked grammars (Tier 2 + the rest) so every grammar has a rich, distinct Examples section. ~250 grammars × 2–3 sentences ≈ 500–750 sentences + audio. Big; gate on owner appetite.

---

## 4. Concrete steps for the implementing session
1. **Part A** rendering fix + test updates (½ day). Land it first — it stops the visible bug for all 288 immediately. Gates: vitest + typecheck + eslint.
2. **Phase 0** classification confirmation (short owner/wife check on the Tier lists).
3. **Phase B1** per level (mirror the pronunciation rollout):
   - Author `app/seed/grammar-examples/n{level}.ts` via the Korean workflow (cover each form; register-tag; 8 locales). Spread it in `index.ts`.
   - `node tools/grammar-examples-audio/build_manifest.mjs` (or the equivalent) → generate only-missing OGGs with the edge-tts pipeline.
   - Add the per-form coverage test + the "bank ≠ canonical" invariant.
   - Gates: vitest / typecheck / eslint / audio-manifest contract. Commit per level, PR, wife review.
4. **Phase B2** only if the owner wants full coverage.

## 5. Gotchas / notes
- Every example needs **all 8 locale** translations (the invariant fails otherwise) — use the `L(...)` helper (`app/seed/grammar-examples/../locale`).
- `MAX_EXAMPLES = 4` cap (`lib/grammar-examples/index.ts`) — a 3-form set wanting register variety may exceed it; bump to 6 if needed.
- Audio: reuse the pronunciation-pipeline lessons — generate only-missing clips, UTF-8 stdout on Windows, soundfile/libsndfile (no ffmpeg).
- The pronunciation feature (this branch's prior work, PR #74) is unrelated and already merged; this is a separate concern in the **Examples** section.
- `worktree` had no `node_modules` → `pnpm install` (pnpm, not npm) before running tests.

---

## 6. Duplicate grammar entries — DATA cleanup (separate root cause)

Owner sees some grammars **twice** in the Library (`을/를`, `이/가`, `에`, many
more). This is NOT a seed/catalog bug — it is junk DATA in Supabase.

### Root cause (confirmed via Supabase queries 2026-06-26)
The Supabase storage adapter reads the `grammar` key as **`grammars` (catalog) ∪
`user_custom_grammars` (this user)** and does **not** dedupe by `ko`
(`app/lib/storage/supabase.ts:42-43,96-100`). A logged-in user's custom grammars
have `deckId = 'custom'` (∉ TOPIK decks) so they render in the Library's
**"기타 / orphans"** section (`pages/library.vue:30-33,128-144`) — alongside the
identical catalog entry in its TOPIK deck. That is the visible duplicate.

Measured state:
- `grammars` (catalog) = **300 rows / 300 distinct ko / 0 duplicates** — CLEAN.
  `DEFAULT_GRAMMAR` and `topik-spine.json` are also dup-free.
- `user_custom_grammars` = **328 rows across 3 users**; **314 rows exactly
  duplicate a catalog `ko`**; 0 intra-user (user,ko) dups. The only 7 non-catalog
  `ko` are near-variant junk: `는/은`, `못`, `-지 않다`, `-(으)러`,
  `-아/어야 되다`, `한테/한테서`, `에서/부터~까지`.
- ⇒ Almost certainly a bad bulk import (the data-import feature, PR #59) that
  loaded a near-complete grammar list into `user_custom_grammars` without
  checking it against the catalog. ~96% of the table is catalog duplicates.

### Fix
- **A) Data cleanup (Supabase — destructive, needs owner confirmation; affects 3
  users incl. test accounts / wife). Back up first.**
  ```sql
  -- dump first: SELECT * FROM user_custom_grammars;  (save the rows)
  -- remove the 314 exact catalog duplicates:
  DELETE FROM user_custom_grammars u
  WHERE EXISTS (SELECT 1 FROM grammars g WHERE g.ko = u.ko);
  -- then review the 7 non-catalog variants (는/은, 못, -지 않다, -(으)러,
  -- -아/어야 되다, 한테/한테서, 에서/부터~까지) — they duplicate catalog concepts
  -- under different ko strings; almost certainly also import junk → delete unless
  -- the owner wants to keep any as intentional self-study entries.
  ```
  Run via `apply_migration` after confirmation. (LocalStorage-only users, if any,
  need a parallel one-time dedupe-on-hydrate; see B.)
- **B) Defensive code — make duplicates impossible to render even with stray data.**
  In the `STORAGE_KEYS.grammar` read (`supabase.ts` ~line 96-100), drop any
  `user_custom_grammars` row whose `ko` already exists in `grammars` (catalog
  wins). Mirror it with a dedupe-by-ko on hydrate in `stores/grammar.ts:hydrate`
  for the localStorage adapter. Add a unit test (`grammar` read returns unique
  ko; catalog beats custom on collision).
- **C) Guard the import path.** The UI `addCustomGrammar` already rejects a ko
  that exists (`stores/grammar.ts:89`), but the bulk import bypassed it — dedupe
  the import against the catalog before inserting, so this cannot recur.

**Sequencing:** B + C are cheap code fixes (land with Part A rendering work). A is
a one-off prod data cleanup — do it with the owner present, after a backup.
