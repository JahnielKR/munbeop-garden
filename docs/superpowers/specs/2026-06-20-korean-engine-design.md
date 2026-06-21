# Korean morphology engine (`app/lib/korean/`) — design

_Created 2026-06-20. Roadmap Step 5 (Phase 1 spine) of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: L. Scope: **engine-only** (the recognition-first drill is Step 5b)._

## Goal

A batchim- and irregular-aware Korean conjugator + particle allomorph resolver — the foundational `app/lib/korean/` module that later unlocks the conjugation drill, register-transform drill, cloze distractor generation, and audio-correct surface forms (Steps 6/8/9/10). Linguistic correctness is paramount: an irregular encoded wrong marks a correct answer wrong and kills trust. The rules and a 340-row conjugation + 60-row particle golden table below were **adversarially verified** by a multi-agent workflow (0 corrections; tricky irregulars spot-checked) and serve as the test fixtures.

## Decisions (locked)

- **Engine-only this PR**; the drill UI is Step 5b.
- **Recognition-first downstream** (no typed grading) — the engine produces correct surface forms (and, later, distractors); it never grades free text.
- **Class is data, not inferred.** Irregular class can't be detected from the stem (묻다 regular "bury" vs irregular "ask"), so every verb in the curated dataset carries its `VerbClass`.
- **Scope = Core TOPIK-1**: the `-아/어` family (`-아/어요`, `-았/었어요`) and the `-(으)` family (`-(으)니까`, `-(으)면`, `-(으)세요`, `-(으)ㄹ 거예요`); the 7 main irregular classes + 하다 + ㄹ-drop; particle pairs 은/는, 이/가, 을/를, 와/과, (으)로, (이)나. No honorific suppletion (Step 8).

## Verified rules (verbatim from the workflow)

- **Vowel harmony:** `-아/어` is selected by the stem-final vowel — ㅏ/ㅗ → `-아/-았`, all others → `-어/-었`. `하-` is irregular `-여` → 해. Vowel-final stems contract: ㅏ+아→ㅏ, ㅗ+아→ㅘ, ㅜ+어→ㅝ, ㅣ+어→ㅕ, ㅚ+어→ㅙ. Past = same harmonic vowel + ㅆ with identical contractions.
- **으-insertion:** the 으 in `-(으)X` endings is epenthetic — inserted only between a consonant-final (받침) stem and a consonant-initial ending (먹으니까). Vowel-final stems take no 으 (가니까). ㄹ-final stems take no 으 (l_drop).
- **Irregulars:**
  - `p_irr` (ㅂ): ㅂ→우 before a vowel (우+어→워), absorbs 으; monosyllabic 돕다/곱다 → 오→와.
  - `t_irr` (ㄷ): ㄷ→ㄹ before a vowel, keeps 으 (듣다→들어요/들으니까).
  - `eu_elision` (ㅡ): stem-final ㅡ drops before `-아/어`, harmony from the preceding syllable (monosyllabic default 어), no 으 inserted.
  - `reu_irr` (르): 르 drops 으 and inserts an extra ㄹ (ㄹㄹ) before `-아/어` (빠르→빨라); regular before `-(으)`.
  - `h_irr` (ㅎ): stem-final ㅎ drops before both `-(으)` (no 으) and `-아/어` (fuses to ㅐ/ㅒ); 좋다 is **regular**.
  - `s_irr` (ㅅ): ㅅ drops before any vowel ending, no contraction, 으 retained (짓다→지어요/지으니까); 웃/씻/벗 regular.
  - `l_drop` (ㄹ-final): ㄹ never takes 으; ㄹ drops before ㄴ/ㅂ/ㅅ (니까/세요/ㄹ거예요) but is **kept before ㅁ** (면); `-아/어` fully regular.
  - `hada`: 하- → -여 → 해 / 했.
- **Particles:** select by noun final — after 받침: 은/이/을/과/으로/이나; after a vowel: 는/가/를/와/로/나. **Special:** instrumental (으)로 takes plain 로 after a ㄹ-final noun (서울로, 물로); every other particle treats a ㄹ-final noun as consonant-final.

## Architecture (no god files)

| File | Responsibility |
|---|---|
| `app/lib/korean/hangul.ts` | Jamo decompose/compose of a syllable (lead/vowel/tail via the 0xAC00 formula) + `endsInConsonant(s)`, `finalJamo(s)`, `stemOf(dict)` (drop 다). Pure, foundational. |
| `app/lib/korean/types.ts` | `VerbClass` = `'regular'|'hada'|'p_irr'|'t_irr'|'eu_elision'|'reu_irr'|'h_irr'|'s_irr'|'l_drop'`; `Ending` = the 6 ending ids; `Particle` = the 6 pair ids. |
| `app/lib/korean/conjugate.ts` | `conjugate(dict: string, klass: VerbClass, ending: Ending): string` — applies harmony / 으-insertion / contractions / per-class irregular rules. Throws on an unknown class/ending (exhaustiveness rail). |
| `app/lib/korean/particles.ts` | `attachParticle(noun: string, particle: Particle): string`. |
| `app/lib/korean/dataset.ts` | The curated `VERBS` (80, each `{ dict, gloss, klass }`) + `NOUNS` (10, each `{ noun, gloss, endsInConsonant, endsInRieul }`). |
| `app/lib/korean/index.ts` | Re-exports the public surface (types, conjugate, attachParticle, dataset). |

Endings carry their consonant for the ㄹ-drop rule: 니까(ㄴ)/세요(ㅅ)/ㄹ거예요(ㄹ) drop a stem ㄹ; 면(ㅁ) keeps it. The conjugator decomposes the stem's last syllable, mutates lead/vowel/tail per the rules, recomposes, and appends the ending body.

## Testing (TDD — golden-table driven)

- `tests/unit/korean/golden.ts` — fixtures: `GOLDEN_CONJUGATIONS` (340 verified rows `{dict,klass,ending,surface}`) + `GOLDEN_PARTICLES` (60 rows `{noun,particle,surface}`), generated from the verified workflow output.
- `tests/unit/korean/hangul.test.ts` — decompose→compose roundtrip over a syllable set; `endsInConsonant`/`finalJamo` on known cases (책=consonant, 사과=vowel, 서울=ㄹ).
- `tests/unit/korean/conjugate.test.ts` — `it.each(GOLDEN_CONJUGATIONS)` asserting `conjugate(dict, klass, ending) === surface` (all 340).
- `tests/unit/korean/particles.test.ts` — `it.each(GOLDEN_PARTICLES)` asserting `attachParticle(noun, particle) === surface` (all 60).
- `tests/unit/korean/dataset.test.ts` — every `VERBS` entry conjugates through all 6 endings without throwing and produces non-empty Hangul; classes are valid; `NOUNS` batchim flags match `hangul.endsInConsonant`.

## Acceptance criteria

1. `conjugate` reproduces all 340 verified golden conjugations exactly (regular, hada, and every irregular class across both ending families).
2. `attachParticle` reproduces all 60 verified golden particle rows (incl. (으)로→로 after ㄹ).
3. The curated dataset (80 verbs / 10 nouns) is class-tagged and every verb conjugates cleanly through all endings.
4. `pnpm lint` / `typecheck` / `test` green; pure module, no Vue/Supabase deps, no migration.

## Out of scope

The recognition drill UI + distractor generation (Step 5b); honorific suppletion / -(으)시- / 께서 (Step 8); typed-answer grading; conjugations beyond the 6 Core-TOPIK-1 endings; auto-detection of irregular class.
