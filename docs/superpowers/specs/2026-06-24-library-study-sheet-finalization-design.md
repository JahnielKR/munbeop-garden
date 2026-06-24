# Library study-sheet finalization — design

Replace the two `ComingSoonSection` placeholders in `GrammarStudySheet.vue`
(`audio` and `achievements`) with real features. No migration, no DB.

## Part 1 — Pronunciation section (replaces the `audio` placeholder)

Two rows, owner-approved:

1. **The grammar alone, sounded out by parts.** Show the point (e.g. `-지만`)
   and its syllables as tappable chips (지 · 만); each chip plays its own clip;
   a "▶ play all" button sounds them in sequence.
2. **The grammar inside a short sentence, natural.** Reuse the SHORTEST existing
   example for the point (`examplesFor(ko)`) with its already-generated audio
   (Step 10) + translation. Falls back to the canonical `example` (no audio) or
   hides row 2 if neither exists.

The part-vs-natural contrast is the pedagogy: the learner hears the clean pieces,
then how they fuse (연음 liaison / 비음화·유음화 assimilation) in real speech.

**Data.** New static seed `app/seed/pronunciation/` → `PronunciationGuide { ko,
parts: string[] }`. `parts` = the authored, didactic *spoken* syllable form per
point (e.g. `-아/어요 → ["어","요"]`, `-(으)면 → ["으","면"]`, `-ㄴ/는데 →
["는","데"]`) — chosen per point because alternation/jamo notation can't be sounded
verbatim. The sentence (row 2) comes from the existing examples bank, so the seed
holds ONLY the `parts`. First batch = the 12 TOPIK-1 points (the Step-6 set);
extends via the same invariant test. Wife native-review = the content gate.

**Audio.** New build-time tool `tools/pronunciation-audio/` (clone of
`tools/grammar-examples-audio/`): one OGG per UNIQUE syllable across all `parts`
(filename = FNV-1a content hash → identical syllables dedupe across points),
single clear voice via edge-tts, `manifest.json` + a contract test asserting
manifest↔seed parity and on-disk existence. `usePronunciationAudio().playSyllable()`
(clone of `useExampleAudio`); row 2 reuses `useExampleAudio`.

**Built in 4 rounds** (owner request; each round independently tested + verified):

- **Round 1 — domain + seed.** `PronunciationGuide` in `lib/domain/pronunciation.ts`;
  pure `lib/pronunciation/` (`guideFor(ko)`); `app/seed/pronunciation/{topik-1,index}.ts`
  with the 12 authored `parts`; seed-invariant test (ko ∈ DEFAULT_GRAMMAR, parts
  non-empty, every part a single valid Hangul syllable).
- **Round 2 — audio pipeline + assets.** `tools/pronunciation-audio/` (gen_voice.py,
  manifest, hash naming) + generate the TOPIK-1 syllable OGGs under
  `public/pronunciation/audio/`; contract test (manifest↔seed, files exist).
- **Round 3 — composable + playback.** `lib/pronunciation/audio.ts`
  (`syllableAudioId`/`syllableAudioSrc`, FNV-1a parity with the tool) +
  `usePronunciationAudio` (clone `useExampleAudio`; `playSyllable`, `playAll`
  sequence); unit tests + TS↔Python hash parity test.
- **Round 4 — component + wiring.** `PronunciationSection.vue` (row 1 chips +
  play-all; row 2 shortest example reuse via `ExampleAudioButton`) replacing the
  `audio` `ComingSoonSection` in `GrammarStudySheet.vue`; i18n `library.pronunciation.*`
  ×8; component tests; dev-server verification.

## Part 2 — Achievements section (replaces the `achievements` placeholder)

> Built AFTER Part 1. Documented here for the record.

Per-grammar **derived milestone badges** — `app/lib/achievements/`
`achievementsFor(ko, srsState, log)`, computed on the fly from SRS mastery + the
log. NO persistence, NO migration. Distinct from the global "Trofeos 0/12"
(those are escape-room cosmetics via `usePremios`).

Initial set (~6, tunable): 🌱 Sprouted (seedling) · 🌳 Mastered (tree) ·
🔁 Practiced 10× · 25× · 🔥 5-correct streak · 💪 Comeback (was a leech —
reuse Step 11 `detectLeeches` — and recent accuracy recovered). Earned = lit +
colored; unearned = dimmed + grayscale, each with a name + how-to-earn aria/title.
`AchievementsSection.vue` = badge grid; reuses `getMasteryInfo` + `detectLeeches` +
the log. i18n `library.achievements.*` ×8. Tests: pure `achievementsFor` golden,
i18n parity, component render.

## Out of scope (follow-ups)
- Pronunciation content beyond TOPIK 1 (extends via the invariant test).
- Authored sound-change prose notes (the "rich guide" option was declined).
- Any other library gaps surface as separate specs.
