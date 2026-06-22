# Grammar-example TTS audio — design

_Created 2026-06-22. Roadmap **Step 10** (Phase 2). Depends on Step 5 (correct surface forms) and
Step 6 (the `grammar_examples` bank). Clone-and-extend of the shipped Particle Lab audio pipeline
(`tools/particle-lab-audio/` + `useParticleAudio`). Effort: M._

> **Filesystem note.** The Nuxt app is under `munbeop/`; `app/...`/`i18n/...`/`public/...`/`tests/...`
> are physically `munbeop/...`. `tools/...` is at the repo root. Specs live at the repo root under
> `docs/superpowers/`.

## Goal

Give the **`grammar_examples`** bank pre-generated Korean TTS so learners can **hear** that spelling ≠
sound (연음 liaison, 받침 neutralization, 자음동화, tensification) — NOT pitch (Korean isn't
pitch-accented) and NOT "readings" (Hangul is phonetic). A 🔊 button on each example sentence in the
study sheet's `ExamplesSection` plays the clip. **Never autoplay**; missing clip → silent.

## Decisions (locked via brainstorm)

1. **Scope = the `grammar_examples` bank only** — 36 sentences (12 TOPIK-1 points × 3, from Step 6's
   `app/seed/grammar-examples/n1.ts`), each tagged with a register `level: SpeechLevel`. One clip per
   example. Drill-reveal audio and per-toggle audio are out of scope. (Q-scope)
2. **Pre-generated static OGG**, via the existing **edge-tts** pipeline (free, build-time, **no runtime
   key** → fits the no-trackers SPA) — verified working in this environment (Python 3.13.7, edge-tts
   7.2.8, soundfile/scipy/numpy; network synth confirmed). The 36 OGGs are generated in-session and
   committed. No Web Speech, no runtime TTS.
3. **Filename = content hash** of the Korean sentence (no `GrammarExample` schema change). The player
   derives the path from the sentence; the gen tool names files by the same hash.
4. **Register-keyed voice casting** (not per-sentence personas — these are illustrative sentences): the
   voice/prosody is a function of the example's `level`, so a formal example *sounds* formal.
5. **Clone, don't refactor** `useParticleAudio` — a sibling `useExampleAudio` (consistent with how
   Steps 8/9 cloned rather than destabilize shipped code).

## Filename contract — FNV-1a content hash

`app/lib/grammar-examples/audio.ts` (TS, used by the player):

```ts
/** FNV-1a 32-bit hex over the sentence's UTF-8 bytes. Deterministic; matches the Python gen tool. */
export function exampleAudioId(sentence: string): string {
  const bytes = new TextEncoder().encode(sentence)
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function exampleAudioSrc(sentence: string): string {
  return `/grammar-examples/audio/${exampleAudioId(sentence)}.ogg`
}
```

The Python gen tool replicates the same FNV-1a over `sentence.encode('utf-8')` to name each `.ogg`.
A TS unit test pins 2–3 known `sentence → hash` pairs (and is cross-checked against the Python output
during generation). If a sentence's text changes, its hash changes → old clip 404s → silent until the
tool is re-run. Collisions across 36 short strings are astronomically unlikely; the manifest-build
asserts the 36 hashes are unique.

## Generation pipeline (`tools/grammar-examples-audio/`)

Mirrors `tools/particle-lab-audio/`:

- **`manifest.json`** — the gen input, derived from the seed: `[{ id, sentence, level, voice, rate,
  pitch }]` for all 36 examples (`id` = the FNV-1a hash). Built from `app/seed/grammar-examples/` so the
  seed stays the single source of truth (the implementer emits it from the seed; it is committed).
- **`gen_voice.py`** — reads `manifest.json`; for each row `edge_tts.Communicate(sentence, voice,
  rate, pitch)` → temp mp3 → **imports the escape-room `common.py` DSP** (`tools/escape-room-level02-audio/common.py`:
  resample → 44100 mono → silence-trim → `write_ogg(peak_dbfs=-2.0)`) → writes
  `munbeop/public/grammar-examples/audio/<id>.ogg`. No DSP duplication.
- **`qa.py`** — runs the escape-room `qa_audio.py` checks over the 36 OGGs (OGG, 44100, mono, duration
  in [0.4 s, 8 s], peak ≤ −1 dBFS, no clipping). Fails loudly on any bad file.
- **`SPEC.md`** — voice cast rule, format, the FNV-1a contract, regeneration command, edge-tts network note.
- Run: `python tools/grammar-examples-audio/gen_voice.py && python tools/grammar-examples-audio/qa.py`.

### Register-keyed casting

edge-tts ko-KR voices: `ko-KR-SunHiNeural` (F), `ko-KR-InJoonNeural` (M), `ko-KR-HyunsuMultilingualNeural` (M).
The manifest assigns voice/prosody by `level` (default scheme; per-example hand-tuning possible later):

| level | register | voice | rate | pitch |
|---|---|---|---|---|
| `formal` | 합쇼체 | InJoon (M) | −4% | −3Hz |
| `polite` | 해요체 | SunHi (F) | +0% | +4Hz |
| `casual` | 반말 | SunHi (F) | +6% | +16Hz |

This ties the audio register to the pedagogical register and gives F/M variety. (The Step-6 batch has
~one of each level for the connective points and all-polite for a few — the scheme handles any mix.)

## Player + UI

- **`app/composables/useExampleAudio.ts`** — slim clone of `useParticleAudio`: module singleton,
  SSR-safe (`typeof window`/`Audio` guards), error-tolerant (404/codec/autoplay → silent), no enable
  toggle, no autoplay. `playExample(sentence: string)` builds `exampleAudioSrc(sentence)`, plays a
  tolerant `Audio` at a fixed volume, cancels the previous; `stop()`. Test-only
  `_resetExampleAudioForTest()`.
- **`app/components/library/GrammarStudySheet/ExampleAudioButton.vue`** — a 🔊 icon button, prop
  `sentence: string`; on click → `useExampleAudio().playExample(sentence)`. `aria-label` via i18n,
  `:focus-visible` ring, `data-testid="example-audio-<…>"`. Fire-and-forget (no spinner).
- **`ExamplesSection.vue`** — render `<ExampleAudioButton :sentence="ex.sentence" />` next to each
  example sentence (the section already `v-for`s the examples). Always shown; missing OGG → silent.

## i18n

One key `library.examples.play_audio` (aria-label, e.g. "Play pronunciation") ×8 locales. No Korean
brand term needed.

## Testing (TDD)

- `tests/unit/grammar-examples/audio.test.ts` — `exampleAudioId('저는 물을 마셔요.')` returns a stable
  8-hex string (pin the value); `exampleAudioSrc(...)` = `/grammar-examples/audio/<hash>.ogg`; two
  different sentences → different hashes.
- `tests/unit/grammar-examples/audio-manifest.test.ts` — load `tools/grammar-examples-audio/manifest.json`
  and `GRAMMAR_EXAMPLES`: the manifest covers **exactly** the 36 seed sentences (set-equal on
  `sentence`); every manifest `id` equals `exampleAudioId(sentence)`; ids are unique; every `level`
  matches the example's level; `voice` ∈ the 3 ko-KR voices.
- `tests/composables/useExampleAudio.test.ts` — `vi.stubGlobal('Audio', FakeAudio)` (the
  `useParticleAudio.test.ts` pattern): `playExample(s)` creates an Audio whose `src` ends with the
  hashed path + calls `play()`; a second call stops the first; `stop()` pauses; SSR/no-Audio → no-op.
- `tests/components/library/ExampleAudioButton.test.ts` — renders a button with the i18n aria-label;
  click triggers playback (assert via the Audio stub).
- **Audio QA** (`qa.py`): 36/36 OGGs pass.
- Full suite + `typecheck` + `lint` green.
- Manual (logged-in): in a study sheet with examples, 🔊 plays each sentence; rapid clicks don't
  overlap; the formal/polite/casual clips sound register-appropriate.

## Acceptance criteria

1. `exampleAudioId`/`exampleAudioSrc` (FNV-1a) + `useExampleAudio` + `ExampleAudioButton`, wired into
   `ExamplesSection`; `library.examples.play_audio` ×8. Pure helpers + player + button tested.
2. `tools/grammar-examples-audio/` (manifest + gen_voice + qa + SPEC) produces 36 register-cast OGGs at
   `public/grammar-examples/audio/<hash>.ogg`; the 36 are generated in-session and committed; `qa.py`
   passes 36/36.
3. Manifest↔seed contract holds (covers exactly the 36, hashes match/unique). `pnpm test`/`typecheck`/
   `lint` green; the Step-6 seed, engine, and `useParticleAudio` are untouched; no SQL/migration.

## Out of scope (YAGNI)

Drill-reveal audio (cloze/conjugation/register); per-toggle/particle audio; phonetic "sounds-like"
annotation ([조아해요]); a global audio enable/volume toggle; mp3 fallback; premium gating (Step 17);
refactoring `useParticleAudio` into a shared primitive (clone instead).
