# Audio bed sources (real CC0/PD field recordings)

Replaces the 9 procedural ambient beds. Built by `build_beds.py`.

All Wikimedia sources below are **Public Domain** (no attribution / no share-alike).

- **birds** — [File:Gentle breeze and birds singing.ogg](https://upload.wikimedia.org/wikipedia/commons/0/0e/Gentle_breeze_and_birds_singing.ogg) · Public domain · ezwa
- **city** — [File:Sunday in the city street noise1.ogg](https://upload.wikimedia.org/wikipedia/commons/5/5d/Sunday_in_the_city_street_noise1.ogg) · Public domain · cori
- **market** — [File:Flea market in the rain.ogg](https://upload.wikimedia.org/wikipedia/commons/1/10/Flea_market_in_the_rain.ogg) · Public domain · stephan
- **rain** — [File:Rain (1).ogg](https://upload.wikimedia.org/wikipedia/commons/0/0e/Rain_%281%29.ogg) · Public domain · ezwa
- **thunder** — [File:Rain and thunder.ogg](https://upload.wikimedia.org/wikipedia/commons/4/42/Rain_and_thunder.ogg) · Public domain · User:Caesar

The manmulsang bed adds a faint deterministic synth hum (no source needed).

**hotteok** = a warm, close market crowd (the PD `market` source, low-passed + a
distinct window so it reads nearer/warmer than the broad meokja alley). The
griddle *sizzle* itself is the separate existing SFX `sfx-griddle-sizzle.ogg`
(out of scope here). If a CC0 griddle clip is ever dropped in `drop/griddle.*`,
re-running `build_beds.py` layers it on top of this crowd bed.

Note: `thunder` was fetched as a candidate but is not used in any shipped bed.

Build deps (build-time only, not shipped): `numpy scipy soundfile imageio-ffmpeg`.