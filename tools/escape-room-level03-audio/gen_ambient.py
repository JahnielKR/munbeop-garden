#!/usr/bin/env python3
"""Procedural ambient beds for Level 3 «El mercado nocturno» (4 seamless loops).

Deterministic (seeded rng). Each LOOP_S s, RMS-normalized to AMBIENT_RMS_DBFS
(-22) with a peak ceiling, written normalize=False. SEAMLESS BY CONSTRUCTION:
noise is synthesized as PERIODIC (rFFT with random phase + a shaped magnitude),
and every tone/modulator frequency is locked to a multiple of 1/LOOP_S, so the
buffer IS exactly one period — x[-1] meets x[0] (loop_seam_discontinuity ~ 0).
WE CANNOT LISTEN — judged by DSP design + metrics (OGG, dur, RMS, peak, seam).

  ambient-hotteok      chisporroteo de plancha + bullicio cercano + trot lejano
  ambient-meokja       el callejón más ruidoso: caldo borboteando, voces, moto
  ambient-manmulsang   el rincón íntimo: zumbido de bombilla, mercado amortiguado
  ambient-busstop      el borde: bullicio que se aleja, calle, bus en ralentí

Run from the repo root:
    python tools/escape-room-level03-audio/gen_ambient.py
"""

from __future__ import annotations

import sys

import numpy as np

import common
from common import (
    EPS, SR, analyze, loop_seam_discontinuity, lowpass, normalize_rms, peak_dbfs,
    read_ogg, rms_dbfs, rng, write_ogg,
)

LOOP_S = 8.0
N = int(LOOP_S * SR)


def _t():
    return np.arange(N, dtype=np.float64) / SR


def lock(f: float) -> float:
    """Round a frequency to a multiple of 1/LOOP_S so a sine completes whole cycles."""
    return max(1.0, round(f * LOOP_S)) / LOOP_S


def tone(f: float) -> np.ndarray:
    return np.sin(2 * np.pi * lock(f) * _t())


def mod(f: float, depth: float = 0.5, floor: float = 0.5) -> np.ndarray:
    """A slow, loop-locked amplitude modulator in [floor, floor+depth]."""
    return floor + depth * (0.5 + 0.5 * np.sin(2 * np.pi * lock(f) * _t()))


# magnitude-spectrum shapers (functions of frequency in Hz)
def hp(fc):
    return lambda f: f / np.sqrt(f * f + fc * fc)


def lp(fc):
    return lambda f: fc / np.sqrt(f * f + fc * fc)


def pink():
    return lambda f: 1.0 / np.sqrt(np.maximum(f, 1.0))


def brown():
    return lambda f: 1.0 / np.maximum(f, 1.0)


def bp(lo, hi):
    return lambda f: hp(lo)(f) * lp(hi)(f)


def loop_noise(seed: int, *shapers) -> np.ndarray:
    """Periodic (seamless) noise of length N with a magnitude spectrum = product of shapers."""
    gen = rng(seed)
    freqs = np.fft.rfftfreq(N, 1.0 / SR)
    mag = np.ones_like(freqs)
    for s in shapers:
        mag = mag * s(freqs)
    phase = gen.uniform(0.0, 2.0 * np.pi, freqs.shape[0])
    spec = mag * np.exp(1j * phase)
    spec[0] = 0.0  # no DC
    x = np.fft.irfft(spec, N)
    s = float(np.std(x))
    return x / s if s > EPS else x


def ambient_hotteok():
    siz = loop_noise(401, hp(2400)) * mod(6.0, 0.5, 0.5)        # crackling griddle
    hum = loop_noise(411, pink(), lp(1100)) * mod(0.125, 0.3, 0.7)  # near crowd
    rumble = loop_noise(421, brown(), lp(260))
    trot = 0.04 * (tone(196) + tone(247))                       # faint far trot triad
    return 0.9 * siz + 0.6 * hum + 0.25 * rumble + trot


def ambient_meokja():
    hum = loop_noise(412, pink(), lp(1100)) * mod(0.25, 0.4, 0.6)
    rumble = loop_noise(422, brown(), lp(300))
    broth = loop_noise(432, bp(300, 1400)) * mod(3.0, 0.7, 0.3)  # bubbling
    moto = 0.12 * (tone(95) + 0.5 * tone(190)) * mod(0.25, 0.5, 0.5)
    moto = loop_noise(442, lp(600)) * 0.0 + moto                 # (keep moto tonal)
    return 0.9 * hum + 0.3 * rumble + 0.5 * broth + moto


def ambient_manmulsang():
    buzz = sum((1.0 / (2 * j + 1)) * tone(120 * (2 * j + 1)) for j in range(4))
    buzz = 0.18 * buzz * mod(9.0, 0.1, 0.9)
    hum = loop_noise(413, pink(), lp(1100)) * 0.35
    rumble = loop_noise(423, brown(), lp(220)) * 0.12
    return buzz + hum + rumble


def ambient_busstop():
    wind = loop_noise(404, brown(), lp(500)) * 0.5
    traffic = loop_noise(414, pink(), lp(800)) * mod(0.125, 0.5, 0.5) * 0.5
    idle = 0.16 * (tone(72) + 0.5 * tone(144) + 0.3 * tone(216))
    hum = loop_noise(424, pink(), lp(1100)) * 0.25
    return wind + traffic + idle + hum


BEDS = {
    "ambient-hotteok.ogg": ambient_hotteok,
    "ambient-meokja.ogg": ambient_meokja,
    "ambient-manmulsang.ogg": ambient_manmulsang,
    "ambient-busstop.ogg": ambient_busstop,
}


def main() -> int:
    common.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    ok_all = True
    for name, fn in BEDS.items():
        x = normalize_rms(fn())
        out = write_ogg(name, x, normalize=False)
        y, ysr = read_ogg(out)
        m = analyze(y, ysr)
        # The beds are PERIODIC by construction (rFFT noise + loop-locked tones),
        # so x[-1]->x[0] is seamless. The right test is that the seam step is no
        # bigger than a typical interior sample step: ratio ~1 = seamless; a click
        # would give ratio >> 1. (loop_seam_discontinuity/|x0-x-1| over-flags any
        # high-freq bed; a low-pass would add filtfilt edge artifacts.)
        interior = float(np.mean(np.abs(np.diff(y)))) + EPS
        seam_step = abs(float(y[0]) - float(y[-1]))
        seam_ratio = seam_step / interior
        rms, pk = rms_dbfs(y), peak_dbfs(y)
        clipped = bool(np.any(np.abs(y) >= 0.999))
        ok = (ysr == SR and abs(m["dur_s"] - LOOP_S) < 0.05 and pk <= -0.3
              and not clipped and seam_ratio < 3.0)
        ok_all &= ok
        print(f"{'OK ' if ok else 'BAD'} {name:22s} {m['dur_s']:5.2f}s rms {rms:6.2f} "
              f"peak {pk:6.2f}dBFS seam/step {seam_ratio:.2f}")
    print(f"\nall_ok={ok_all}")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
