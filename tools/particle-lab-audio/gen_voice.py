#!/usr/bin/env python3
"""Generate the 14 Korean TTS sentence clips for the Particle Lab (Explore).

Mirrors tools/escape-room-level02-audio/gen_voice.py and REUSES its common.py
DSP (resample/trim/normalize/write_ogg/analyze). Each of the 14 base 해요체
sentences is cast to a fitting voice + age (~70% female), with age expressed via
edge-tts pitch/rate (edge-tts ships only one ko-KR female voice). Output:
munbeop/public/particle-lab/audio/sentence-<id>.ogg (OGG/Vorbis, 44100, mono,
peak ~ -2 dBFS). edge-tts is a network call; it need not be byte-deterministic.

Run from the repo root:
    python tools/particle-lab-audio/gen_voice.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal as sps

# Reuse the escape-room house DSP (write_ogg/analyze/constants) without copying.
ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402

import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"

TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06

# (id, Korean 해요체 text, voice, rate, pitch). Korean == the spacing gold strings
# (spacing.test.ts) + a period. ~10 female / 4 male; age via pitch/rate.
CAST: list[tuple[str, str, str, str, str]] = [
    ("s01-jeoneun",     "저는 학생이에요.",               "ko-KR-SunHiNeural",  "+0%",  "+8Hz"),
    ("s02-goyangi",     "고양이가 우유를 마셔요.",          "ko-KR-SunHiNeural",  "+6%",  "+30Hz"),
    ("s03-hakgyo",      "학교에 가요.",                   "ko-KR-InJoonNeural", "+0%",  "+0Hz"),
    ("s04-doseogwan",   "도서관에서 공부해요.",            "ko-KR-SunHiNeural",  "-2%",  "+5Hz"),
    ("s05-jeodo",       "저도 커피를 좋아해요.",           "ko-KR-SunHiNeural",  "+0%",  "-5Hz"),
    ("s06-achime",      "아침에 빵을 먹어요.",             "ko-KR-HyunsuMultilingualNeural", "+0%", "+5Hz"),
    ("s07-biga",        "비가 와요.",                     "ko-KR-SunHiNeural",  "+0%",  "-4Hz"),
    ("s08-chinguhante", "친구한테 편지를 써요.",           "ko-KR-SunHiNeural",  "+0%",  "+6Hz"),
    ("s09-beoseuro",    "버스로 학교에 가요.",             "ko-KR-SunHiNeural",  "+5%",  "+24Hz"),
    ("s10-ppangman",    "빵만 먹어요.",                   "ko-KR-SunHiNeural",  "+6%",  "+28Hz"),
    ("s11-sagwawa",     "사과와 바나나를 사요.",           "ko-KR-SunHiNeural",  "-2%",  "-3Hz"),
    ("s12-ahopsibuteo", "아홉 시부터 다섯 시까지 일해요.",   "ko-KR-InJoonNeural", "-4%",  "-6Hz"),
    ("s13-yeonpillo",   "연필로 편지를 써요.",             "ko-KR-SunHiNeural",  "-12%", "-22Hz"),
    ("s14-jeodo",       "저도 커피를 마셔요.",             "ko-KR-InJoonNeural", "-3%",  "-8Hz"),
]


def to_mono_44100(x: np.ndarray, sr: int) -> np.ndarray:
    """Downmix to mono and resample to SR (44100) with a polyphase filter."""
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(int(SR), int(sr))
        x = sps.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def trim_silence(x: np.ndarray) -> np.ndarray:
    """Conservatively trim leading/trailing silence, keeping a 60 ms guard pad."""
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
    start = max(0, int(above[0]) - pad)
    end = min(x.size, int(above[-1]) + pad + 1)
    return x[start:end].copy()


async def synth_to_mp3(text: str, voice: str, rate: str, pitch: str, path: str) -> None:
    """Synthesize one line to MP3 via edge-tts (voice + rate + pitch)."""
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(path)


async def build_one(sid: str, text: str, voice: str, rate: str, pitch: str) -> dict:
    fd, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    try:
        await synth_to_mp3(text, voice, rate, pitch, mp3_path)
        raw, sr = sf.read(mp3_path, dtype="float32")
    finally:
        try:
            os.remove(mp3_path)
        except OSError:
            pass

    x = to_mono_44100(raw, sr)
    x = trim_silence(x)
    out_path = OUT_DIR / f"sentence-{sid}.ogg"
    write_ogg(out_path, x, peak_dbfs=PEAK_VOICE_DBFS)

    y, ysr = read_ogg(out_path)
    info = sf.info(str(out_path))
    metrics = analyze(y, ysr)
    pk = peak_dbfs(y)
    clipped = bool(np.any(np.abs(y) >= 0.999))
    ok = (
        info.samplerate == SR
        and info.channels == 1
        and info.format == "OGG"
        and 0.4 < metrics["dur_s"] < 8.0
        and pk <= -1.0
        and not clipped
    )
    return {
        "path": str(out_path).replace("\\", "/"),
        "seconds": metrics["dur_s"],
        "peak_dbfs": round(pk, 2),
        "voice": voice,
        "ok": ok,
    }


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for i, (sid, text, voice, rate, pitch) in enumerate(CAST, 1):
        res = await build_one(sid, text, voice, rate, pitch)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(f"[{i:2d}/14] {flag} {res['seconds']:5.2f}s  peak {res['peak_dbfs']:6.2f}  "
              f"{res['voice'].split('-')[-1]:24s}  {res['path'].split('/audio/')[-1]}")
    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(CAST)
    print(f"\n{n_ok}/{len(CAST)} OK · all_ok={all_ok}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
