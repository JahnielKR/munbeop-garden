# Particle Lab audio TTS (v1) — design

**2026-06-21 · Subproject 9 of the Particle Lab follow-up program**
**Status: SPEC — approved in brainstorming (v1 scope + per-sentence voice casting), ready for writing-plans.**

## Goal

Give the Particle Lab **pre-generated Korean TTS audio** for the 14 Explore
sentences, so learners can hear natural pronunciation (연음 / 받침 neutralization /
자음동화 / tensification fall out of real TTS). A 🔊 button in Explore mode plays
the sentence; no autoplay. Each sentence is **cast to a fitting voice + age** —
roughly 70% female, 30% male, with age variation (child / young / adult / older)
chosen per sentence.

v1 is **playback of the base 해요체, all-particles-ON sentence** (one file each).
Formality-variant and per-toggle audio, drill/spacing audio, and explicit
phonetic annotation are **v2** (deferred by the user).

## Approach (why pre-generated, not Web Speech)

The repo already ships pre-generated Korean voice as static OGG (29 lines in the
escape room) and has **zero** Web Speech API usage. Pre-generated gives
consistent, controllable, offline, on-brand audio (no runtime external calls — fits
"no trackers"). The toolchain is present and verified in this environment: **Python
3.13.7 + edge-tts 7.2.8 + soundfile/scipy/numpy**, so the OGG assets are generated
here, mirroring the escape-room pipeline. Web Speech (runtime browser TTS) is
rejected for v1: only some devices ship a ko-KR voice and quality is uncontrollable.

## Voice casting

edge-tts exposes exactly **three ko-KR voices**: `ko-KR-SunHiNeural` (Female),
`ko-KR-InJoonNeural` (Male), `ko-KR-HyunsuMultilingualNeural` (Male). With a single
female voice, **age is expressed via `pitch` + `rate`** on the base voice (higher
pitch / faster ≈ child; lower / slower ≈ older). Both genders get age variation.
Target mix ≈ **10 female / 4 male** (≈71% / 29%).

| id | Korean (해요체) | persona | voice | rate | pitch |
|---|---|---|---|---|---|
| s01-jeoneun | 저는 학생이에요. | young woman (student) | SunHi | +0% | +8Hz |
| s02-goyangi | 고양이가 우유를 마셔요. | little girl | SunHi | +6% | +30Hz |
| s03-hakgyo | 학교에 가요. | young man | InJoon | +0% | +0Hz |
| s04-doseogwan | 도서관에서 공부해요. | young woman | SunHi | −2% | +5Hz |
| s05-jeodo | 저도 커피를 좋아해요. | adult woman | SunHi | +0% | −5Hz |
| s06-achime | 아침에 빵을 먹어요. | young man | Hyunsu | +0% | +5Hz |
| s07-biga | 비가 와요. | grandmother | SunHi | −12% | −25Hz |
| s08-chinguhante | 친구한테 편지를 써요. | young woman | SunHi | +0% | +6Hz |
| s09-beoseuro | 버스로 학교에 가요. | child girl | SunHi | +5% | +24Hz |
| s10-ppangman | 빵만 먹어요. | picky kid | SunHi | +6% | +28Hz |
| s11-sagwawa | 사과와 바나나를 사요. | adult woman | SunHi | −2% | −3Hz |
| s12-ahopsibuteo | 아홉 시부터 다섯 시까지 일해요. | adult man (worker) | InJoon | −4% | −6Hz |
| s13-yeonpillo | 연필로 편지를 써요. | grandmother | SunHi | −12% | −22Hz |
| s14-jeodo | 저도 커피를 마셔요. | adult man | InJoon | −3% | −8Hz |

The Korean strings are the base 해요체 / all-ON assembly (eojeol texts joined by a
space, final period for natural intonation) — identical to the `correctSpacing`
gold strings already tested in `spacing.test.ts`, plus the period.

## Current state (what exists)

- `tools/escape-room-level02-audio/gen_voice.py` + `common.py` — the pipeline to mirror: `edge_tts.Communicate(text, voice, rate=…, pitch=…)` → temp mp3 → soundfile read → scipy resample to 44100 → silence trim (−45 dB, 60 ms pads) → `write_ogg(peak_dbfs=−2.0)`. `qa_audio.py` validates each file (exists, OGG, 44100 mono, duration > 0.4 s, peak ≤ −1 dBFS, no clipping). edge-tts is network-dependent (not byte-deterministic).
- `munbeop/public/escape-room/level-02/audio/voice/voice-*.ogg` — the asset-path convention (static OGG under `public/`).
- `munbeop/app/composables/useEscapeRoomAudio.ts` — the voice-channel pattern to mirror: module singleton, SSR-safe (`typeof window`/`Audio` guards), error-tolerant (404/codec/autoplay → silent), `playVoice(src)` plays one line and cancels the previous. Its `enabled` pref is escape-room-specific (`mungarden:escape:audio`).
- `munbeop/app/components/particle-lab/ExploreMode.vue` → `ParticleSentence.vue` (`useParticleExplore`: `index`, `sentence`, `level`, `off`, nav). The 🔊 button slots in next to the sentence.
- `munbeop/app/seed/particle-sentences.ts` — the 14 `LabSentence`s; ids `s01-jeoneun` … `s14-jeodo`.

## Design

### A. Generation tool (`tools/particle-lab-audio/`) — new

- `gen_voice.py` — mirrors the escape-room `gen_voice.py` but reads a local `CAST` list of `{ id, text, voice, rate, pitch }` (the 14 rows above) and writes `munbeop/public/particle-lab/audio/sentence-<id>.ogg`. Reuses the escape-room `common.py` DSP (`write_ogg`, resample, trim, peak-normalize to −2.0 dBFS) by importing it (`sys.path` to the escape-room tool dir) — no DSP duplication.
- `qa.py` — runs the escape-room `qa_audio.py` checks over the 14 generated OGGs (OGG, 44100, mono, duration in [0.4 s, 8 s], peak ≤ −1 dBFS, no clipping). Fails loudly on any bad file.
- `SPEC.md` — short note: voice cast table, format (OGG/Vorbis, 44100, mono, −2 dBFS), regeneration command, and that edge-tts needs network.
- Run: `python tools/particle-lab-audio/gen_voice.py` then `python tools/particle-lab-audio/qa.py` (from repo root). **Generated here in this environment** and committed as static assets (≈14 files, ~0.3–0.7 MB total).

### B. Composable (`app/composables/useParticleAudio.ts`) — new

A small voice-only player mirroring `useEscapeRoomAudio`'s voice channel (module singleton; SSR-safe; 404/autoplay → silent). It does **not** add an enable toggle (playback is opt-in via the button; no autoplay → nothing to mute). API:

```ts
export function useParticleAudio() {
  /** Play the sentence's audio; a new play cancels the previous. Missing file → silent. */
  function playSentence(id: string): void
  function stop(): void
  return { playSentence, stop }
}
```

`playSentence(id)` builds `/particle-lab/audio/sentence-${id}.ogg`, makes a tolerant `Audio`, plays at a fixed voice volume, swallowing rejections. Internally identical structure to `useEscapeRoomAudio.playVoice` (single active element, `error` listener, `safePlay`). Test-only `_resetParticleAudioForTest()`.

### C. UI — `ExploreMode.vue` + a small `SentenceAudioButton.vue`

- `SentenceAudioButton.vue` — a 🔊 icon button. Prop `sentenceId: string`; on click calls `useParticleAudio().playSentence(id)`. `aria-label` via i18n. Focus-visible ring; no busy/spinner state needed (fire-and-forget). Keeps `ExploreMode` uncluttered (one focused component).
- `ExploreMode.vue` — render `<SentenceAudioButton :sentence-id="explore.sentence.value.id" />` next to the sentence (beside the ◄ ► nav / above `ParticleSentence`). The button is always shown; it plays the base 해요체 audio regardless of the formality level or particle toggles (v1). If the OGG is missing it simply stays silent (graceful pre-asset shipping).

### D. i18n (`munbeop/i18n/locales/*.json`, ×8) — new keys under `particles.explore`

- `play_audio` — the button `aria-label`/tooltip (e.g. "Play pronunciation"). One key ×8 (Korean 화이팅-style brand terms not needed here).

### E. Filename ↔ id contract

The composable derives the path purely from `sentence.id`: `sentence-<id>.ogg`. No seed change. The gen tool writes exactly those names. A unit test pins the path format so the contract can't drift silently.

## Files

| Action | Path |
|---|---|
| Add | `tools/particle-lab-audio/gen_voice.py` |
| Add | `tools/particle-lab-audio/qa.py` |
| Add | `tools/particle-lab-audio/SPEC.md` |
| Add (generated) | `munbeop/public/particle-lab/audio/sentence-*.ogg` (14) |
| Add | `munbeop/app/composables/useParticleAudio.ts` |
| Add | `munbeop/app/components/particle-lab/SentenceAudioButton.vue` |
| Edit | `munbeop/app/components/particle-lab/ExploreMode.vue` (button wiring) |
| Edit | `munbeop/i18n/locales/*.json` (`particles.explore.play_audio`, ×8) |
| Add | `munbeop/tests/composables/useParticleAudio.test.ts` |
| Add | `munbeop/tests/components/particle-lab/SentenceAudioButton.test.ts` |

No SQL, no migration, no seed change.

## Testing / verification

- `useParticleAudio` unit test — `vi.stubGlobal('Audio', FakeAudio)` (same FakeAudio pattern as `useEscapeRoomAudio.test.ts`): `playSentence('s01-jeoneun')` creates an Audio with `src` ending `/particle-lab/audio/sentence-s01-jeoneun.ogg` and calls `play()`; a second `playSentence` stops the first; `stop()` pauses; SSR/no-Audio path is a safe no-op.
- `SentenceAudioButton` component test — renders a button with the i18n `aria-label`; clicking it triggers playback (spy on the composable or assert the Audio src via the global stub).
- Full suite + typecheck + lint green.
- **Audio QA** (`tools/particle-lab-audio/qa.py`): all 14 OGGs pass (format, duration, peak, mono).
- Adversarial Workflow: (1) a Korean listener-proxy audit of the cast table — does each persona's voice/age fit the sentence; flag awkward casts. (2) 8-locale audit of the one new i18n key.
- Manual (logged in): in Explore the 🔊 plays each sentence in its cast voice; rapid clicks don't overlap (new cancels old); missing-file case stays silent.

## Out of scope (v2 / YAGNI)

- Formality-variant audio (합니다체/반말) and per-toggle (particle-off) audio.
- Drill / spacing-mode audio.
- Explicit phonetic "sounds-like" annotation (e.g. 좋아해요 → [조아해요]).
- A global audio enable toggle / volume slider for the lab (opt-in tap, no autoplay).
- Swapping the study-sheet "Pronunciation — coming soon" slot (separate surface).
- mp3 fallback for old Safari (repo standard is OGG; revisit only if needed).
