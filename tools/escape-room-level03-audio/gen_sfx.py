#!/usr/bin/env python3
"""Procedural SFX for Level 3 «El mercado nocturno» (8 new market sounds).

Deterministic (seeded rng per sound). Each is a one-shot normalized to
PEAK_SFX_DBFS (-1) and hard-guarded by write_ogg. WE CANNOT LISTEN — quality is
judged by DSP design + metrics (valid OGG 44100 mono, dur, peak, no clipping).

  sfx-griddle-sizzle  el chisporroteo del 호떡 en la plancha (asset del nivel)
  sfx-shutter         persiana metálica bajando (reloj diegético + cierre)
  sfx-bus-air         suspiro de aire comprimido del bus (clímax del outro)
  sfx-coin-haggle     monedas / regateo (Zona 3, acierto Slot 3)
  sfx-paper-wrap      papel de estraza envolviendo el regalo / el 호떡
  sfx-neon-buzz       zumbido de neón parpadeante (carteles, bombilla)
  sfx-market-bell     campanilla de puesto / timbre de cierre
  sfx-cat-meow        maullido corto (gato)

Run from the repo root:
    python tools/escape-room-level03-audio/gen_sfx.py
"""

from __future__ import annotations

import sys

import numpy as np

import common
from common import (
    SR, analyze, bandpass, env_exp_decay, fade_io, highpass, lowpass, peak_dbfs,
    read_ogg, rng, white_noise, write_ogg,
)


def _t(n: int) -> np.ndarray:
    return np.arange(n, dtype=np.float64) / SR


def _sine(n: int, f, phase: float = 0.0) -> np.ndarray:
    f = np.asarray(f, dtype=np.float64)
    if f.ndim == 0:
        return np.sin(2 * np.pi * float(f) * _t(n) + phase)
    ph = 2 * np.pi * np.cumsum(f) / SR + phase  # instantaneous freq sweep
    return np.sin(ph)


def griddle_sizzle() -> np.ndarray:
    g = rng(301)
    n = int(0.9 * SR)
    bed = highpass(white_noise(n, g), 2600)
    # slow crackle wobble + a few sharper pops
    wob = 0.55 + 0.45 * (0.5 + 0.5 * _sine(n, 7.0))
    x = bed * wob
    for k, c in enumerate((0.08, 0.22, 0.41, 0.63, 0.80)):
        i = int(c * n)
        ln = int(0.02 * SR)
        x[i:i + ln] += 1.6 * highpass(white_noise(ln, rng(310 + k)), 3500) * env_exp_decay(ln, 0.02)
    return fade_io(x, 0.01, 0.06)


def shutter() -> np.ndarray:
    g = rng(302)
    n = int(0.85 * SR)
    x = np.zeros(n)
    # a descending rattle: rapid metallic clicks getting closer together
    t = 0.0
    step = 0.055
    while t < 0.7:
        i = int(t * SR)
        ln = int(0.016 * SR)
        click = bandpass(white_noise(ln, rng(int(t * 1000) + 1)), 1400, 5200) * env_exp_decay(ln, 0.012)
        x[i:i + ln] += 1.4 * click
        t += step
        step *= 0.93  # accelerate toward the bottom
    # a falling metallic tone underneath
    glide = np.linspace(520, 180, n)
    x += 0.35 * _sine(n, glide) * np.linspace(0.5, 0.05, n)
    # the final clack (hits the ground)
    i = int(0.72 * SR); ln = int(0.06 * SR)
    x[i:i + ln] += 1.8 * bandpass(white_noise(ln, rng(99)), 600, 3000) * env_exp_decay(ln, 0.05)
    return fade_io(x, 0.002, 0.05)


def bus_air() -> np.ndarray:
    g = rng(303)
    n = int(1.1 * SR)
    hiss = bandpass(white_noise(n, g), 700, 5000)
    # swell up, hold, then the pneumatic cut
    env = np.concatenate([
        np.linspace(0.0, 1.0, int(0.18 * SR)),
        np.full(int(0.55 * SR), 1.0),
        np.linspace(1.0, 0.0, n - int(0.18 * SR) - int(0.55 * SR)),
    ])
    x = hiss * env
    # a low body that drops in pitch as the bus settles
    x += 0.25 * _sine(n, np.linspace(120, 70, n)) * env
    return fade_io(x, 0.01, 0.06)


def coin_haggle() -> np.ndarray:
    n = int(0.7 * SR)
    x = np.zeros(n)
    for k, c in enumerate((0.0, 0.10, 0.17, 0.33, 0.40)):
        i = int(c * SR)
        ln = int(0.16 * SR)
        partials = (2100, 3300, 4700)
        clink = sum(_sine(ln, f) * (0.8 ** j) for j, f in enumerate(partials))
        clink = clink * env_exp_decay(ln, 0.13)
        x[i:i + ln] += 0.9 * clink
    return fade_io(x, 0.001, 0.05)


def paper_wrap() -> np.ndarray:
    n = int(0.7 * SR)
    x = np.zeros(n)
    g = rng(305)
    # sparse high crinkle grains
    starts = (0.0, 0.06, 0.12, 0.19, 0.27, 0.34, 0.42, 0.50, 0.58)
    for k, c in enumerate(starts):
        i = int(c * SR)
        ln = int(g.uniform(0.015, 0.04) * SR)
        grain = highpass(white_noise(ln, rng(350 + k)), 3000) * env_exp_decay(ln, 0.02)
        x[i:i + ln] += g.uniform(0.6, 1.0) * grain
    return fade_io(x, 0.002, 0.05)


def neon_buzz() -> np.ndarray:
    n = int(1.0 * SR)
    # a 120 Hz mains-hum-ish buzz: fundamental + odd harmonics, with flicker
    base = sum((1.0 / (2 * j + 1)) * _sine(n, 120 * (2 * j + 1)) for j in range(5))
    flicker = 0.85 + 0.15 * (np.sign(_sine(n, 11.0)) * 0.5 + 0.5)
    x = base * flicker
    x += 0.08 * highpass(white_noise(n, rng(306)), 6000)  # faint high whine
    x = lowpass(x, 4000)
    return fade_io(x, 0.02, 0.08)


def market_bell() -> np.ndarray:
    n = int(0.7 * SR)
    partials = ((1180, 1.0), (2360, 0.5), (3560, 0.28), (4720, 0.14))
    x = sum(a * _sine(n, f) * env_exp_decay(n, 0.45 * (1.0 - 0.12 * k))
            for k, (f, a) in enumerate(partials))
    return fade_io(x, 0.001, 0.08)


def cat_meow() -> np.ndarray:
    n = int(0.6 * SR)
    glide = np.concatenate([
        np.linspace(520, 800, int(0.25 * SR)),
        np.linspace(800, 430, n - int(0.25 * SR)),
    ])
    tone = _sine(n, glide) + 0.5 * _sine(n, 2 * glide) + 0.25 * _sine(n, 3 * glide)
    vowel = bandpass(tone, 500, 2200)
    env = np.concatenate([
        np.linspace(0, 1, int(0.08 * SR)),
        np.full(int(0.30 * SR), 1.0),
        np.linspace(1, 0, n - int(0.08 * SR) - int(0.30 * SR)),
    ])
    return fade_io(vowel * env, 0.005, 0.05)


SFX = {
    "sfx-griddle-sizzle.ogg": griddle_sizzle,
    "sfx-shutter.ogg": shutter,
    "sfx-bus-air.ogg": bus_air,
    "sfx-coin-haggle.ogg": coin_haggle,
    "sfx-paper-wrap.ogg": paper_wrap,
    "sfx-neon-buzz.ogg": neon_buzz,
    "sfx-market-bell.ogg": market_bell,
    "sfx-cat-meow.ogg": cat_meow,
}


def main() -> int:
    common.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    ok_all = True
    for name, fn in SFX.items():
        x = fn()
        out = write_ogg(name, x, peak_dbfs=common.PEAK_SFX_DBFS)
        y, ysr = read_ogg(out)
        m = analyze(y, ysr)
        pk = peak_dbfs(y)
        clipped = bool(np.any(np.abs(y) >= 0.999))
        # peak target is -1 dBFS; allow lossy-OGG overshoot, the real safety is no-clip
        ok = ysr == SR and 0.1 < m["dur_s"] < 2.0 and pk <= -0.3 and not clipped
        ok_all &= ok
        print(f"{'OK ' if ok else 'BAD'} {name:24s} {m['dur_s']:4.2f}s peak {pk:6.2f}dBFS "
              f"centroid {m.get('centroid_hz', 0):6.0f}Hz")
    print(f"\nall_ok={ok_all}")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
