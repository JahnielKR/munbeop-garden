# Grammar-Examples Audio — Generation Spec

## Audio format

- Container: OGG/Vorbis
- Sample rate: 44100 Hz
- Channels: mono
- Peak target: −2 dBFS

## Filename contract

Each clip is named `<hash>.ogg` where `<hash>` is the FNV-1a 32-bit hash (8 lowercase hex digits) of the Korean sentence string, computed over its UTF-8 bytes. This matches `exampleAudioId()` in `munbeop/app/lib/grammar-examples/audio.ts` exactly. The manifest (`manifest.json`) is the source of truth; the contract test (`munbeop/tests/unit/grammar-examples/audio-manifest.test.ts`) verifies it against the seed.

## Register-keyed voice cast

| level   | voice                    | rate  | pitch  |
|---------|--------------------------|-------|--------|
| formal  | ko-KR-InJoonNeural       | -4%   | -3Hz   |
| polite  | ko-KR-SunHiNeural        | +0%   | +4Hz   |
| casual  | ko-KR-SunHiNeural        | +6%   | +16Hz  |

## Regen command

Run from the repo root (requires network for edge-tts):

```sh
python tools/grammar-examples-audio/gen_voice.py
python tools/grammar-examples-audio/qa.py
```

Expected output: `36/36 OK` from both scripts.

## Output location

`munbeop/public/grammar-examples/audio/<hash>.ogg` (36 files)

## Notes

- `edge-tts` requires an active internet connection (Azure TTS backend).
- `gen_voice.py` imports DSP helpers from `tools/escape-room-level02-audio/common.py`.
- The `out/` directory (local scratch) is gitignored.
