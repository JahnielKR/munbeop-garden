#!/usr/bin/env python3
"""Technical QA of ALL Level-2 audio. Measurable-properties only (we cannot listen).

Enumerates the 42 expected files, verifies format/dur/peak/RMS/clipping, ambient
loop seam + broadband check, bell tail, voice speech-band energy. Dumps a JSON
report to out/qa_report.json for the contact-sheet renderer + final structured QA.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

import common as c
from common import analyze, est_t60, loop_seam_discontinuity

AUDIO = c.AUDIO_DIR
VOICE = c.VOICE_DIR
OUT = c.OUT_DIR
OUT.mkdir(parents=True, exist_ok=True)

# ── Expected inventory (with target duration ranges, seconds) ────────────────
AMBIENT = [
    ("ambient-dasil.ogg",        (12.0, 20.0)),
    ("ambient-daeungjeon.ogg",   (12.0, 20.0)),
    ("ambient-seungbang.ogg",    (10.0, 20.0)),
    ("ambient-jongnu.ogg",       (12.0, 20.0)),
    ("ambient-jongnu-clear.ogg", (12.0, 20.0)),
]
SFX = [
    ("sfx-bell-toll.ogg",  (10.0, 14.0)),
    ("sfx-moktak.ogg",     (0.10, 0.50)),
    ("sfx-tea-pour.ogg",   (2.0, 4.5)),
    ("sfx-paper-page.ogg", (0.25, 1.0)),
    ("sfx-brush-sign.ogg", (0.4, 1.5)),
    ("sfx-door-wood.ogg",  (0.4, 1.5)),
    ("sfx-rain-stop.ogg",  (9.0, 13.0)),
    ("sfx-cat-purr.ogg",   (2.0, 4.5)),
]
VOICE_FILES = [
    "voice-intro.ogg", "voice-thesis.ogg", "voice-slot1-correct.ogg",
    "voice-slot2-frame.ogg", "voice-preslot4.ogg", "voice-beat-slot4.ogg",
    "voice-slot5-absolution.ogg", "voice-beat-slot5.ogg", "voice-beam.ogg",
    "voice-slot6-softreject.ogg", "voice-slot6-correct.ogg",
    "voice-outro-exchange-1.ogg", "voice-outro-exchange-2.ogg", "voice-outro.ogg",
    "voice-slot1-mem-1.ogg", "voice-slot1-mem-2.ogg", "voice-slot1-mem-3.ogg",
    "voice-slot1-mem-4.ogg", "voice-slot1-mem-5.ogg",
    "voice-slot5-conf-1.ogg", "voice-slot5-conf-2.ogg", "voice-slot5-conf-3.ogg",
    "voice-slot5-conf-4.ogg", "voice-slot5-conf-5.ogg",
    "voice-slot6-farewell-1.ogg", "voice-slot6-farewell-2.ogg",
    "voice-slot6-farewell-3.ogg", "voice-slot6-farewell-4.ogg",
    "voice-slot6-farewell-5.ogg",
]


def band_energy_ratio(x, lo, hi, sr=c.SR):
    """Fraction of spectral power in [lo, hi] Hz."""
    x = np.asarray(x, dtype=np.float64)
    if x.size < 2:
        return 0.0
    win = np.hanning(x.size)
    spec = np.abs(np.fft.rfft(x * win)) ** 2
    freqs = np.fft.rfftfreq(x.size, d=1.0 / sr)
    tot = float(np.sum(spec)) + c.EPS
    m = (freqs >= lo) & (freqs <= hi)
    return float(np.sum(spec[m]) / tot)


def spectral_flatness(x, sr=c.SR):
    """Geometric-mean / arithmetic-mean of power spectrum. ~1 = broadband noise."""
    x = np.asarray(x, dtype=np.float64)
    if x.size < 2:
        return 0.0
    win = np.hanning(x.size)
    spec = np.abs(np.fft.rfft(x * win)) ** 2 + c.EPS
    # ignore DC bin
    spec = spec[1:]
    gm = np.exp(np.mean(np.log(spec)))
    am = np.mean(spec)
    return float(gm / (am + c.EPS))


def loop_spectral_seam(x, sr=c.SR, win_s=0.05):
    """Compare spectral magnitude of the buffer's head vs tail windows (loop check).

    If the loop is seamless the spectra near the splice should match. Returns a
    normalized L1 distance of the magnitude spectra (0 = identical).
    """
    n = int(win_s * sr)
    if x.size < 2 * n:
        return 0.0
    head = x[:n] * np.hanning(n)
    tail = x[-n:] * np.hanning(n)
    H = np.abs(np.fft.rfft(head))
    T = np.abs(np.fft.rfft(tail))
    return float(np.sum(np.abs(H - T)) / (np.sum(H) + np.sum(T) + c.EPS))


def energy_at_t(x, t, sr=c.SR, win_s=0.1):
    """RMS dBFS in a short window centered at time t (for bell energy-at-8s)."""
    i = int(t * sr)
    half = int(win_s * sr / 2)
    seg = x[max(0, i - half): i + half]
    if seg.size == 0:
        return float("-inf")
    return c.rms_dbfs(seg)


def check_file(path: Path, kind: str, dur_range, expect_loop=False):
    rec = {"file": path.name, "kind": kind, "path": str(path).replace("\\", "/")}
    if not path.exists():
        rec.update(present=False)
        return rec
    rec["present"] = True
    info = sf.info(str(path))
    rec["samplerate"] = info.samplerate
    rec["channels"] = info.channels
    rec["format"] = info.format
    rec["subtype"] = info.subtype
    x, sr = sf.read(str(path), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = x.astype(np.float64)
    m = analyze(x, sr)
    rec.update(m)
    rec["clipped"] = bool(np.any(np.abs(x) >= 0.999))
    rec["max_abs"] = round(float(np.max(np.abs(x))) if x.size else 0.0, 5)
    rec["near_silent"] = bool(m["rms_dbfs"] < -60.0)
    rec["dur_in_range"] = bool(dur_range[0] <= m["dur_s"] <= dur_range[1])
    rec["dur_range"] = list(dur_range)
    rec["fmt_ok"] = bool(info.samplerate == 44100 and info.channels == 1
                         and info.format == "OGG" and info.subtype == "VORBIS")

    if kind == "ambient":
        # broadband (rain) check + loop seam (post-codec; spec says float buffer
        # is the strict criterion, here we only have the codec'd file so we report
        # both the sample-endpoint seam and a spectral head/tail match).
        rec["flatness"] = round(spectral_flatness(x, sr), 4)
        rec["loop_seam_post_codec"] = round(loop_seam_discontinuity(x), 4)
        rec["loop_spectral_seam"] = round(loop_spectral_seam(x, sr), 4)
        rec["broadband_bw_hz"] = m["bandwidth_hz"]
        # rain energy should be spread; clear room is sparse drips -> allow flatter
        rec["low_band_ratio"] = round(band_energy_ratio(x, 20, 2000, sr), 4)
    if path.name == "sfx-bell-toll.ogg":
        rec["bell_t60"] = round(est_t60(x, sr), 3)
        rec["energy_at_8s_dbfs"] = round(energy_at_t(x, 8.0, sr), 2)
        rec["energy_at_0_5s_dbfs"] = round(energy_at_t(x, 0.5, sr), 2)
        # audible tail at 8s: 8s window energy still well above noise floor and
        # within ~40 dB of the early energy
        e8 = rec["energy_at_8s_dbfs"]
        e05 = rec["energy_at_0_5s_dbfs"]
        rec["tail_audible_at_8s"] = bool(e8 > -60.0 and (e05 - e8) < 45.0)
    if kind == "voice":
        rec["speech_band_ratio"] = round(band_energy_ratio(x, 200, 4000, sr), 4)
        rec["dur_gt_0_4"] = bool(m["dur_s"] > 0.4)
    return rec


def main():
    results = []
    for name, dr in AMBIENT:
        results.append(check_file(AUDIO / name, "ambient", dr, expect_loop=True))
    for name, dr in SFX:
        results.append(check_file(AUDIO / name, "sfx", dr))
    for name in VOICE_FILES:
        results.append(check_file(VOICE / name, "voice", (0.4, 30.0)))

    (OUT / "qa_report.json").write_text(json.dumps(results, indent=2), encoding="utf-8")

    # console summary
    print(f"{'FILE':40s} {'fmt':4s} {'dur':>7s} {'peak':>7s} {'rms':>7s} "
          f"{'cent':>7s} clip range")
    for r in results:
        if not r.get("present"):
            print(f"{r['file']:40s} MISSING")
            continue
        print(f"{r['file']:40s} "
              f"{'OK' if r['fmt_ok'] else 'BAD':4s} "
              f"{r['dur_s']:7.2f} {r['peak_dbfs']:7.2f} {r['rms_dbfs']:7.2f} "
              f"{r['centroid_hz']:7.0f} "
              f"{'CLIP' if r['clipped'] else '  . '} "
              f"{'in' if r['dur_in_range'] else 'OUT'}")
    n = len(results)
    present = sum(1 for r in results if r.get("present"))
    fmt = sum(1 for r in results if r.get("fmt_ok"))
    clip = [r['file'] for r in results if r.get("clipped")]
    print(f"\nTotal {n} | present {present} | fmt_ok {fmt} | clipped {clip}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
