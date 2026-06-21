# Particle Lab audio — TTS voice clips

Pre-generated Korean TTS for the 14 Explore sentences (`/practice/particles`).

- **Engine:** edge-tts (Microsoft neural, free, no API key). Network call.
- **Format:** OGG/Vorbis, 44100 Hz, mono, peak ≈ −2 dBFS (house writer
  `common.write_ogg`, reused from `tools/escape-room-level02-audio/`).
- **Output:** `munbeop/public/particle-lab/audio/sentence-<id>.ogg` (14 files).
- **Casting:** ≈70% female / 30% male. edge-tts has one ko-KR female voice
  (SunHi) + two male (InJoon, Hyunsu); age (child / young / adult / older) is
  expressed via `pitch` + `rate`. See the `CAST` table in `gen_voice.py`.
- **Regenerate:** `python tools/particle-lab-audio/gen_voice.py` then
  `python tools/particle-lab-audio/qa.py` (from the repo root).
- The Korean texts are the base 해요체 / all-particles-ON sentences (the
  `correctSpacing` gold strings from `spacing.test.ts`) + a period.
