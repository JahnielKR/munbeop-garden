#!/usr/bin/env python3
"""Generate the 29 Korean TTS VOICE lines for the monk 우담 — Level 2.

"El templo de la lluvia (청우사)". Voice is the sibling track to the procedural
ambient/SFX pipeline (see SPEC.md §"Voz" and common.py): ONE consistent young,
serene male neural voice for every line, soft and unhurried (rate -10%, ≈0.9x,
per dossier §12.6). The Korean text is canonical — taken verbatim from the seed
(munbeop/app/seed/escape-room/level-02.ts) and dossier §3/§11 — and is NOT
altered, padded, or annotated; only these 29 game lines are ever sent to TTS.

Per line:
  1. edge-tts (Microsoft neural TTS, free, no key) -> a temp MP3.
  2. soundfile reads it (mono), scipy resample_poly -> 44100 Hz.
  3. conservative leading/trailing silence trim (keep a small guard pad so a
     word onset/tail is never clipped).
  4. write OGG/Vorbis 44100 mono via common.write_ogg(..., peak_dbfs=
     PEAK_VOICE_DBFS) — the house writer normalizes the peak to ≈ -2 dBFS and
     hard-guards every sample strictly inside (-1, 1) (never clips).

Then every file is read back and analyzed: exists, OGG 44100 mono, duration
> 0.4 s, peak ≤ -1 dBFS, no clipping. edge-tts is a network call and need NOT be
byte-deterministic (SPEC §Determinismo).

Run from the repo root:
    python tools/escape-room-level02-audio/gen_voice.py
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
from common import (
    PEAK_VOICE_DBFS,
    SR,
    VOICE_DIR,
    analyze,
    peak_dbfs,
    read_ogg,
    write_ogg,
)

# ── Voice config (ONE voice for all 29 lines) ────────────────────────────────

VOICE = "ko-KR-InJoonNeural"  # young, serene male
RATE = "-10%"                 # ≈0.9x, per dossier §12.6

# Conservative silence-trim parameters. The threshold is relative to each clip's
# own peak (TTS clips have a clean digital-silence head/tail), and we keep a
# guard pad on both sides so no consonant onset / breath tail is ever clipped.
TRIM_THRESH_DB = -45.0   # below (peak + this) counts as silence
TRIM_PAD_S = 0.06        # keep 60 ms of guard on each side of the speech

# ── The 29 canonical lines (path under audio/, exact Korean) ─────────────────
# Cross-checked against munbeop/app/seed/escape-room/level-02.ts:
#   - slot1-mem-*  == SLOT_1_CANDIDATES[i].korean
#   - slot5-conf-* == SLOT_5_CANDIDATES[i].korean with the ___ blank filled by
#                     .answer ('못' / '안')
#   - slot6-farewell-* == SLOT_6_CANDIDATES[i].tiles joined over correctOrder
#                          (indices 0..3) with spaces, plus the sentence period
#   - intro/outro/beats == voiceIntro / voiceOutro / scriptedBeats[].voiceLine
#   - the rest == dossier §3/§11 fixed monk lines
# DO NOT alter the Korean. Only these strings are sent to the TTS service.
LINES: list[tuple[str, str]] = [
    ("voice/voice-intro.ogg",            "어서 오세요. 비가 그칠 때까지 차 한잔 해요."),
    ("voice/voice-thesis.ogg",           "차는 따뜻할 때 마셔요."),
    ("voice/voice-slot1-correct.ogg",    "아… 알아들었어요?"),
    ("voice/voice-slot2-frame.ogg",      "비가 또 한 글자를 지웠어요…"),
    ("voice/voice-preslot4.ogg",         "혼자서는 못 열었어요."),
    ("voice/voice-beat-slot4.ogg",       "…스승님이 보내신 것 같아요."),
    ("voice/voice-slot5-absolution.ogg", "맞아요. 안 한 게 아니에요. 못 했어요. …이제, 하고 싶어요."),
    ("voice/voice-beat-slot5.ogg",       "스승님이 떠나신 후에도 매일 두 잔을 준비했어요. 오늘은… 한 잔이 비어 있었어요."),
    ("voice/voice-beam.ogg",             "이 글씨… 스승님 글씨예요."),
    ("voice/voice-slot6-softreject.ogg", "끝난 일은… 끝난 말로 해야 해요."),
    ("voice/voice-slot6-correct.ogg",    "같이요."),
    ("voice/voice-outro-exchange-1.ogg", "이건 두고 가세요."),
    ("voice/voice-outro-exchange-2.ogg", "스승님 거였어요. 비는 또 와요. 그때 또 오세요."),
    ("voice/voice-outro.ogg",            "비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요."),
    # slot 1 — los recuerdos del té (SLOT_1_CANDIDATES[i].korean)
    ("voice/voice-slot1-mem-1.ogg",      "매일 해가 뜰 때 종소리를 들었어요. 스승님의 종소리였어요."),
    ("voice/voice-slot1-mem-2.ogg",      "비가 올 때 스승님하고 같이 차를 마셨어요."),
    ("voice/voice-slot1-mem-3.ogg",      "매화가 필 때 스승님하고 같이 마당에서 꽃을 봤어요."),
    ("voice/voice-slot1-mem-4.ogg",      "작년 겨울에 스승님하고 같이 김장을 했어요. 김치가 아주 맛있었어요."),
    ("voice/voice-slot1-mem-5.ogg",      "스승님하고 같이 밥을 먹을 때, 고양이한테 먼저 밥을 줬어요."),
    # slot 5 — la confesión (korean with ___ filled by answer)
    ("voice/voice-slot5-conf-1.ogg",     "마지막 인사를 못 했어요. 목이 메었어요."),
    ("voice/voice-slot5-conf-2.ogg",     "스승님 방 문을 안 닫았어요. 아직 닫고 싶지 않았어요."),
    ("voice/voice-slot5-conf-3.ogg",     "그날 아침 종을 못 쳤어요. 손이 멈췄어요."),
    ("voice/voice-slot5-conf-4.ogg",     "일기장을 못 읽었어요. 무서웠어요."),
    ("voice/voice-slot5-conf-5.ogg",     "혼자 차를 안 마셨어요. 혼자 마시고 싶지 않았어요. 그래서 매일 두 잔을 준비했어요."),
    # slot 6 — la despedida (tiles[correctOrder] joined + period)
    ("voice/voice-slot6-farewell-1.ogg", "스승님, 그동안 정말 감사했어요."),
    ("voice/voice-slot6-farewell-2.ogg", "스승님하고 차를 마실 때 행복했어요."),
    ("voice/voice-slot6-farewell-3.ogg", "스승님, 차가 정말 맛있었어요."),
    ("voice/voice-slot6-farewell-4.ogg", "스승님한테 정말 많이 배웠어요."),
    ("voice/voice-slot6-farewell-5.ogg", "스승님은 정말 좋은 스승님이었어요."),
]


# ── Audio post-processing ────────────────────────────────────────────────────


def to_mono_44100(x: np.ndarray, sr: int) -> np.ndarray:
    """Downmix to mono and resample to SR (44100) with a polyphase filter.

    edge-tts returns 24 kHz mono MP3; resample_poly(up=SR, down=sr) is exact for
    the 44100/24000 ratio (=147/80 after gcd) and band-limited (no aliasing).
    """
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(int(SR), int(sr))
        x = sps.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float64)


def trim_silence(x: np.ndarray) -> np.ndarray:
    """Conservatively trim leading/trailing silence, keeping a guard pad.

    Threshold is relative to the clip's own peak (TTS heads/tails are near-digital
    silence). We find the first/last sample of a smoothed amplitude envelope that
    crosses the threshold, then keep TRIM_PAD_S on each side so no onset/tail of
    speech is ever clipped. If nothing crosses the threshold the buffer is left
    untouched (better to keep audio than to over-trim).
    """
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return x
    pk = float(np.max(np.abs(x)))
    if pk <= common.EPS:
        return x
    thresh = pk * (10.0 ** (TRIM_THRESH_DB / 20.0))
    # smooth the rectified signal so a single noisy sample doesn't define a bound
    win = max(1, int(0.005 * SR))  # ~5 ms
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    above = np.where(env >= thresh)[0]
    if above.size == 0:
        return x
    pad = int(TRIM_PAD_S * SR)
    start = max(0, int(above[0]) - pad)
    end = min(x.size, int(above[-1]) + pad + 1)
    return x[start:end].copy()


async def synth_to_mp3(text: str, path: str) -> None:
    """Synthesize one line to an MP3 file via edge-tts (network call)."""
    communicate = __import__("edge_tts").Communicate(text, voice=VOICE, rate=RATE)
    await communicate.save(path)


async def build_line(rel_path: str, text: str) -> dict:
    """Synth -> mono/44100 -> trim -> write OGG -> read back -> analyze one line.

    Returns a result dict for the run summary.
    """
    fd, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    try:
        await synth_to_mp3(text, mp3_path)
        raw, sr = sf.read(mp3_path, dtype="float32")
    finally:
        try:
            os.remove(mp3_path)
        except OSError:
            pass

    x = to_mono_44100(raw, sr)
    x = trim_silence(x)
    # write via the house writer: mono, peak -> -2 dBFS, hard-guarded < 0.999
    out_path = write_ogg(rel_path, x, peak_dbfs=PEAK_VOICE_DBFS)

    # verify from disk
    y, ysr = read_ogg(out_path)
    info = sf.info(str(out_path))
    metrics = analyze(y, ysr)
    pk = peak_dbfs(y)
    clipped = bool(np.any(np.abs(y) >= 0.999))

    ok = (
        info.samplerate == SR
        and info.channels == 1
        and info.format == "OGG"
        and metrics["dur_s"] > 0.4
        and pk <= -1.0
        and not clipped
    )

    return {
        "path": str(out_path).replace("\\", "/"),
        "seconds": metrics["dur_s"],
        "peak_dbfs": round(pk, 2),
        "channels": info.channels,
        "samplerate": info.samplerate,
        "format": info.format,
        "clipped": clipped,
        "ok": ok,
        "text": text,
    }


async def main() -> int:
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    # sequential: edge-tts is a network service; keep it gentle and ordered
    for i, (rel_path, text) in enumerate(LINES, 1):
        res = await build_line(rel_path, text)
        results.append(res)
        flag = "OK " if res["ok"] else "BAD"
        print(
            f"[{i:2d}/29] {flag} {res['seconds']:5.2f}s  "
            f"peak {res['peak_dbfs']:6.2f} dBFS  "
            f"{res['samplerate']}Hz/{res['channels']}ch/{res['format']}  "
            f"{res['path'].split('/audio/')[-1]}"
        )

    n_ok = sum(1 for r in results if r["ok"])
    all_ok = n_ok == len(LINES)
    print(f"\n{n_ok}/{len(LINES)} OK · all_ok={all_ok}")
    if not all_ok:
        for r in results:
            if not r["ok"]:
                print(f"  FAIL {r['path']}  dur={r['seconds']}  "
                      f"peak={r['peak_dbfs']}  clipped={r['clipped']}  "
                      f"{r['samplerate']}Hz/{r['channels']}ch/{r['format']}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
