# pronunciation-audio

Build-time TTS for the study-sheet pronunciation section, row 1 ("the grammar
sounded out by parts"). One OGG per UNIQUE syllable across all
`app/seed/pronunciation` guides; row 2 (the grammar in a short sentence) reuses
the existing grammar-examples audio, so it is NOT generated here.

## Pipeline

1. `node tools/pronunciation-audio/build_manifest.mjs` — scans the seed's
   `parts` arrays, dedupes syllables, writes `manifest.json`
   (`{ id: fnv1a(syllable), syllable, voice, rate, pitch }`).
2. `python tools/pronunciation-audio/gen_voice.py` — synthesizes each row with
   edge-tts (network) and writes `munbeop/public/pronunciation/audio/<id>.ogg`
   via the shared escape-room `common.py` DSP (mono 44.1k OGG, trimmed,
   peak-normalised).

`<id>` is the FNV-1a hash of the syllable, identical in three places:
`build_manifest.mjs`, `gen_voice.py`, and `app/lib/pronunciation/audio.ts`
(`syllableAudioId`). The contract test
`tests/unit/pronunciation/audio-manifest.test.ts` asserts manifest == the seed's
unique syllables, ids = the hash, and every clip exists on disk.

Voice: `ko-KR-SunHiNeural`, rate `-10%` (clearer single-syllable enunciation).
