#!/usr/bin/env python3
"""Generate the 42 Korean TTS sentence clips for the Particle Lab (Explore).

14 Explore sentences x 3 speech levels (합니다체/해요체/반말). Mirrors
tools/escape-room-level02-audio/gen_voice.py and REUSES its common.py DSP. Each
sentence keeps ONE cast voice across its 3 levels (formality changes how it is
said, not who says it); age is expressed via edge-tts pitch/rate. Output:
munbeop/public/particle-lab/audio/sentence-<id>-<level>.ogg (OGG/Vorbis, 44100,
mono, peak ~ -2 dBFS). edge-tts is a network call.

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

ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import PEAK_VOICE_DBFS, SR, analyze, peak_dbfs, read_ogg, write_ogg  # noqa: E402

import edge_tts  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"

TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06

# One cast (voice, rate, pitch) per sentence, applied to all 3 levels. ~10 F / 4 M.
CAST: dict[str, tuple[str, str, str]] = {
    "s01-jeoneun":     ("ko-KR-SunHiNeural",  "+0%",  "+8Hz"),
    "s02-goyangi":     ("ko-KR-SunHiNeural",  "+6%",  "+30Hz"),
    "s03-hakgyo":      ("ko-KR-InJoonNeural", "+0%",  "+0Hz"),
    "s04-doseogwan":   ("ko-KR-SunHiNeural",  "-2%",  "+5Hz"),
    "s05-jeodo":       ("ko-KR-SunHiNeural",  "+0%",  "-5Hz"),
    "s06-achime":      ("ko-KR-HyunsuMultilingualNeural", "+0%", "+5Hz"),
    "s07-biga":        ("ko-KR-SunHiNeural",  "+0%",  "-4Hz"),
    "s08-chinguhante": ("ko-KR-SunHiNeural",  "+0%",  "+6Hz"),
    "s09-beoseuro":    ("ko-KR-SunHiNeural",  "+5%",  "+24Hz"),
    "s10-ppangman":    ("ko-KR-SunHiNeural",  "+6%",  "+28Hz"),
    "s11-sagwawa":     ("ko-KR-SunHiNeural",  "-2%",  "-3Hz"),
    "s12-ahopsibuteo": ("ko-KR-InJoonNeural", "-4%",  "-6Hz"),
    "s13-yeonpillo":   ("ko-KR-SunHiNeural",  "-12%", "-22Hz"),
    "s14-jeodo":       ("ko-KR-InJoonNeural", "-3%",  "-8Hz"),
}

# (id, level, text) — Korean from the seed byLevel (predicate ending + 저->나 in 반말).
LEVELED: list[tuple[str, str, str]] = [
    ("s01-jeoneun", "formal", "저는 학생입니다."),
    ("s01-jeoneun", "polite", "저는 학생이에요."),
    ("s01-jeoneun", "casual", "나는 학생이야."),
    ("s02-goyangi", "formal", "고양이가 우유를 마십니다."),
    ("s02-goyangi", "polite", "고양이가 우유를 마셔요."),
    ("s02-goyangi", "casual", "고양이가 우유를 마셔."),
    ("s03-hakgyo", "formal", "학교에 갑니다."),
    ("s03-hakgyo", "polite", "학교에 가요."),
    ("s03-hakgyo", "casual", "학교에 가."),
    ("s04-doseogwan", "formal", "도서관에서 공부합니다."),
    ("s04-doseogwan", "polite", "도서관에서 공부해요."),
    ("s04-doseogwan", "casual", "도서관에서 공부해."),
    ("s05-jeodo", "formal", "저도 커피를 좋아합니다."),
    ("s05-jeodo", "polite", "저도 커피를 좋아해요."),
    ("s05-jeodo", "casual", "나도 커피를 좋아해."),
    ("s06-achime", "formal", "아침에 빵을 먹습니다."),
    ("s06-achime", "polite", "아침에 빵을 먹어요."),
    ("s06-achime", "casual", "아침에 빵을 먹어."),
    ("s07-biga", "formal", "비가 옵니다."),
    ("s07-biga", "polite", "비가 와요."),
    ("s07-biga", "casual", "비가 와."),
    ("s08-chinguhante", "formal", "친구한테 편지를 씁니다."),
    ("s08-chinguhante", "polite", "친구한테 편지를 써요."),
    ("s08-chinguhante", "casual", "친구한테 편지를 써."),
    ("s09-beoseuro", "formal", "버스로 학교에 갑니다."),
    ("s09-beoseuro", "polite", "버스로 학교에 가요."),
    ("s09-beoseuro", "casual", "버스로 학교에 가."),
    ("s10-ppangman", "formal", "빵만 먹습니다."),
    ("s10-ppangman", "polite", "빵만 먹어요."),
    ("s10-ppangman", "casual", "빵만 먹어."),
    ("s11-sagwawa", "formal", "사과와 바나나를 삽니다."),
    ("s11-sagwawa", "polite", "사과와 바나나를 사요."),
    ("s11-sagwawa", "casual", "사과와 바나나를 사."),
    ("s12-ahopsibuteo", "formal", "아홉 시부터 다섯 시까지 일합니다."),
    ("s12-ahopsibuteo", "polite", "아홉 시부터 다섯 시까지 일해요."),
    ("s12-ahopsibuteo", "casual", "아홉 시부터 다섯 시까지 일해."),
    ("s13-yeonpillo", "formal", "연필로 편지를 씁니다."),
    ("s13-yeonpillo", "polite", "연필로 편지를 써요."),
    ("s13-yeonpillo", "casual", "연필로 편지를 써."),
    ("s14-jeodo", "formal", "저도 커피를 마십니다."),
    ("s14-jeodo", "polite", "저도 커피를 마셔요."),
    ("s14-jeodo", "casual", "나도 커피를 마셔."),
]


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
    start = max(0, int(above[0]) - pad)
    end = min(x.size, int(above[-1]) + pad + 1)
    return x[start:end].copy()


async def synth_to_mp3(text: str, voice: str, rate: str, pitch: str, path: str) -> None:
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(path)


async def build_one(sid: str, level: str, text: str) -> dict:
    voice, rate, pitch = CAST[sid]
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
    out_path = OUT_DIR / f"sentence-{sid}-{level}.ogg"
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
    return {"name": f"sentence-{sid}-{level}.ogg", "seconds": metrics["dur_s"],
            "peak_dbfs": round(pk, 2), "ok": ok}


async def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for i, (sid, level, text) in enumerate(LEVELED, 1):
        res = await build_one(sid, level, text)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(f"[{i:2d}/42] {flag} {res['seconds']:5.2f}s  peak {res['peak_dbfs']:6.2f}  {res['name']}")
    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(LEVELED)
    print(f"\n{n_ok}/{len(LEVELED)} OK · all_ok={all_ok}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
