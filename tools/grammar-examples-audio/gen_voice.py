#!/usr/bin/env python3
"""Generate the grammar-example TTS clips from manifest.json.

Reads tools/grammar-examples-audio/manifest.json (one row per grammar_examples
sentence: id, sentence, level, voice, rate, pitch), synthesizes with edge-tts,
and writes munbeop/public/grammar-examples/audio/<id>.ogg via the escape-room
common.py DSP. <id> is the FNV-1a hash of the sentence (matches the TS player).
edge-tts is a network call.

Run from the repo root:
    python tools/grammar-examples-audio/gen_voice.py
"""
from __future__ import annotations
import asyncio, json, os, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal as sps

HERE = Path(__file__).resolve().parent
# tools/grammar-examples-audio/gen_voice.py → parents[1] == tools/ → tools/escape-room-level02-audio
ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402
import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "grammar-examples" / "audio"
MANIFEST = HERE / "manifest.json"
TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06


def fnv1a(s: str) -> str:
    h = 0x811c9dc5
    for b in s.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def to_mono_44100(x: np.ndarray, sr: int) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(int(SR), int(sr))
        x = sps.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def trim_silence(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return x
    pk = float(np.max(np.abs(x)))
    if pk <= common.EPS:
        return x
    thresh = pk * (10.0 ** (TRIM_THRESH_DB / 20.0))
    win = max(1, int(0.005 * SR))
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    above = np.where(env >= thresh)[0]
    if above.size == 0:
        return x
    pad = int(TRIM_PAD_S * SR)
    return x[max(0, int(above[0]) - pad): min(x.size, int(above[-1]) + pad + 1)].copy()


async def build_one(row: dict) -> dict:
    assert fnv1a(row["sentence"]) == row["id"], f"id mismatch for {row['sentence']}"
    fd, mp3 = tempfile.mkstemp(suffix=".mp3"); os.close(fd)
    try:
        await edge_tts.Communicate(row["sentence"], voice=row["voice"], rate=row["rate"], pitch=row["pitch"]).save(mp3)
        raw, sr = sf.read(mp3, dtype="float32")
    finally:
        try: os.remove(mp3)
        except OSError: pass
    x = trim_silence(to_mono_44100(raw, sr))
    out = OUT_DIR / f"{row['id']}.ogg"
    write_ogg(out, x, peak_dbfs=PEAK_VOICE_DBFS)
    y, ysr = read_ogg(out)
    info = sf.info(str(out))
    m = analyze(y, ysr); pk = peak_dbfs(y)
    ok = (info.samplerate == SR and info.channels == 1 and info.format == "OGG"
          and 0.4 < m["dur_s"] < 8.0 and pk <= -1.0 and not bool(np.any(np.abs(y) >= 0.999)))
    return {"name": f"{row['id']}.ogg", "seconds": m["dur_s"], "peak_dbfs": round(pk, 2), "ok": ok}


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))
    results = []
    for i, row in enumerate(rows, 1):
        r = await build_one(row)
        results.append(r)
        print(f"[{i:2d}/{len(rows)}] {'OK ' if r['ok'] else 'BAD'} {r['seconds']:5.2f}s peak {r['peak_dbfs']:6.2f} {r['name']}")
    n_ok = sum(1 for r in results if r["ok"])
    print(f"\n{n_ok}/{len(rows)} OK")
    return 0 if n_ok == len(rows) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
