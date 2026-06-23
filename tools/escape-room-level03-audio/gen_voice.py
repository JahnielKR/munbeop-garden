#!/usr/bin/env python3
"""Generate the Korean TTS VOICE lines for Level 3 «El mercado nocturno».

THREE consistent neural voices (per dossier §10 / §12.6), at market speed (~1.0x):
  - 순자 이모 (warm grandmother): ko-KR-SunHiNeural, slightly slow + lowered pitch.
  - 하나 (young, quick):           ko-KR-SunHiNeural, faster + raised pitch.
  - 도윤 (young, shy male):        ko-KR-InJoonNeural, neutral.

The Korean text is canonical — taken verbatim from the seed
(munbeop/app/seed/escape-room/level-03.ts) and dossier §3/§10. NOT altered.

Per line: edge-tts -> temp MP3 -> mono/44100 (resample_poly) -> conservative
silence trim (guard pad) -> OGG/Vorbis via common.write_ogg (peak -> -2 dBFS,
hard-guarded < 0.999). Then read back + analyze (OGG 44100 mono, dur > 0.4s,
peak <= -1 dBFS, no clipping). edge-tts is a network call, not byte-deterministic.

Run from the repo root:
    python tools/escape-room-level03-audio/gen_voice.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import tempfile

import numpy as np
import soundfile as sf
from scipy import signal as sps

import common
from common import PEAK_VOICE_DBFS, SR, VOICE_DIR, analyze, peak_dbfs, read_ogg, write_ogg

# ── Voice config: (voice, rate, pitch) per speaker ───────────────────────────
VOICE_CFG = {
    "imo": ("ko-KR-SunHiNeural", "-3%", "-12Hz"),    # 순자 이모 — warm, unhurried, low
    "hana": ("ko-KR-SunHiNeural", "+8%", "+18Hz"),   # 하나 — young, quick, bright
    "doyun": ("ko-KR-InJoonNeural", "+2%", "+8Hz"),  # 도윤 — young male, a touch boyish
}

TRIM_THRESH_DB = -45.0
TRIM_PAD_S = 0.06

# ── The 32 canonical lines: (path under audio/, speaker, exact Korean) ────────
# Cross-checked against munbeop/app/seed/escape-room/level-03.ts (slot candidate
# korean, scriptedBeat.voiceLine, voiceIntro/voiceOutro) + dossier §3/§10.
LINES: list[tuple[str, str, str]] = [
    ("voice/voice-intro.ogg",          "imo",   "어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요."),
    ("voice/voice-thesis.ogg",         "imo",   "잠깐만 빌릴게요. 도윤이 좀 도와줘요."),
    # slot 1 — los favores (SLOT_1_CANDIDATES[i].korean)
    ("voice/voice-slot1-favor-1.ogg",  "imo",   "이 호떡 한 접시 도윤이한테 갖다줘요."),
    ("voice/voice-slot1-favor-2.ogg",  "imo",   "도윤이한테 잠깐 오라고 전해 줘요."),
    ("voice/voice-slot1-favor-3.ogg",  "imo",   "저 꽃집에서 꽃 한 송이만 사다 줘요."),
    ("voice/voice-slot1-favor-4.ogg",  "imo",   "옆 가게에서 의자 두 개만 빌려다 줘요."),
    ("voice/voice-slot1-favor-5.ogg",  "imo",   "도윤이를 좀 도와줘요. 오늘 밤만."),
    ("voice/voice-slot1-correct.ogg",  "imo",   "옳지! 역시 손이 빠르네. 자, 다음."),
    ("voice/voice-slot2-frame.ogg",    "imo",   "도윤이가 하나 좋아하는 거 몰라요. 가서 좀 알아봐 줘요."),
    ("voice/voice-slot2-correct.ogg",  "hana",  "아, 도윤이가 보냈구나… 그 녀석. …귀엽네."),
    # slot 3 — los regateos (SLOT_3_CANDIDATES[i].korean)
    ("voice/voice-slot3-haggle-1.ogg", "imo",   "이 목도리가 저 장갑보다 더 따뜻해요. 군대에서는 이게 좋아요."),
    ("voice/voice-slot3-haggle-2.ogg", "imo",   "이 만년필이 저 볼펜보다 비싸요. 그런데 이 만년필이 더 좋아요."),
    ("voice/voice-slot3-haggle-3.ogg", "imo",   "이 공책이 저 공책보다 더 커요. 편지 많이 쓸 수 있어요."),
    ("voice/voice-slot3-haggle-4.ogg", "imo",   "이 율무차가 저 커피보다 더 달아요. 도윤이는 단 걸 좋아해요."),
    ("voice/voice-slot3-haggle-5.ogg", "imo",   "이 손난로가 저 양말보다 더 따뜻해요. 손이 제일 시려요."),
    ("voice/voice-slot4-correct.ogg",  "imo",   "맞아. 우리 도윤이가 그래."),
    ("voice/voice-beat-slot4.ogg",     "imo",   "도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요. 그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요."),
    # slot 5 — las listas (SLOT_5_CANDIDATES[i].korean)
    ("voice/voice-slot5-list-1.ogg",   "imo",   "호떡 싸고, 양말 사고, 편지 넣었어요."),
    ("voice/voice-slot5-list-2.ogg",   "imo",   "호떡 굽고, 봉지에 담고, 정류장으로 갔어요."),
    ("voice/voice-slot5-list-3.ogg",   "imo",   "도윤 거 사고, 하나 거 사고, 같이 포장했어요."),
    ("voice/voice-slot5-list-4.ogg",   "imo",   "김치 담고, 라면 넣고, 박스 묶었어요."),
    ("voice/voice-slot5-list-5.ogg",   "imo",   "호떡 식히고, 상자에 넣고, 버스에 실었어요."),
    ("voice/voice-slot5-correct.ogg",  "imo",   "그래, 그거 다 챙기고… 이제 마지막이네."),
    ("voice/voice-slot6-trigger.ogg",  "imo",   "얼른, 버스 와. 도윤이 인사 좀 만들어 줘."),
    ("voice/voice-slot6-softreject.ogg", "imo", "야— 그건 영영 가는 인사잖아. 너 돌아올 거잖아."),
    # slot 6 — las despedidas (도윤; tiles[correctOrder] joined)
    ("voice/voice-slot6-farewell-1.ogg", "doyun", "이모, 그동안 고마웠어요. 다녀오겠습니다."),
    ("voice/voice-slot6-farewell-2.ogg", "doyun", "이모, 그동안 밥 챙겨 줘서 고마웠어요."),
    ("voice/voice-slot6-farewell-3.ogg", "doyun", "이모, 잘 다녀오겠습니다. 그동안 고마웠어요."),
    ("voice/voice-slot6-farewell-4.ogg", "doyun", "이모, 키워 주셔서 고마웠어요. 다녀오겠습니다."),
    ("voice/voice-slot6-farewell-5.ogg", "doyun", "이모, 다녀오겠습니다. 그동안 정말 고마웠어요."),
    ("voice/voice-outro-hotteok.ogg",  "imo",   "버스에서 먹어. 식기 전에."),
    ("voice/voice-outro.ogg",          "imo",   "고마워요. 진짜 도와줬어요. 야 도윤아, 머리 짧게 깎고 와. 자리 빼놓을게!"),
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
    return x[max(0, int(above[0]) - pad): min(x.size, int(above[-1]) + pad + 1)].copy()


async def synth_to_mp3(text: str, speaker: str, path: str) -> None:
    voice, rate, pitch = VOICE_CFG[speaker]
    communicate = __import__("edge_tts").Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(path)


async def build_line(rel_path: str, speaker: str, text: str) -> dict:
    fd, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    try:
        await synth_to_mp3(text, speaker, mp3_path)
        raw, sr = sf.read(mp3_path, dtype="float32")
    finally:
        try:
            os.remove(mp3_path)
        except OSError:
            pass
    x = trim_silence(to_mono_44100(raw, sr))
    out_path = write_ogg(rel_path, x, peak_dbfs=PEAK_VOICE_DBFS)
    y, ysr = read_ogg(out_path)
    info = sf.info(str(out_path))
    metrics = analyze(y, ysr)
    pk = peak_dbfs(y)
    clipped = bool(np.any(np.abs(y) >= 0.999))
    ok = (info.samplerate == SR and info.channels == 1 and info.format == "OGG"
          and metrics["dur_s"] > 0.4 and pk <= -1.0 and not clipped)
    return {"path": str(out_path).replace("\\", "/"), "speaker": speaker,
            "seconds": metrics["dur_s"], "peak_dbfs": round(pk, 2),
            "samplerate": info.samplerate, "channels": info.channels,
            "format": info.format, "clipped": clipped, "ok": ok}


async def main() -> int:
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for i, (rel_path, speaker, text) in enumerate(LINES, 1):
        res = await build_line(rel_path, speaker, text)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(f"[{i:2d}/{len(LINES)}] {flag} {res['speaker']:5s} {res['seconds']:5.2f}s "
              f"peak {res['peak_dbfs']:6.2f}dBFS  {res['path'].split('/audio/')[-1]}")
    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(LINES)
    print(f"\n{n_ok}/{len(LINES)} OK · all_ok={all_ok}")
    if not all_ok:
        for r in results:
            if not r["ok"]:
                print(f"  FAIL {r['path']} dur={r['seconds']} peak={r['peak_dbfs']} clipped={r['clipped']}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
