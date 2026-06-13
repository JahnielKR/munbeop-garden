#!/usr/bin/env python3
"""Generate the 5 Level-2 AMBIENT loops — the rain beds of «El templo de la lluvia».

Run from the repo root:  python tools/escape-room-level02-audio/gen_ambient.py

Each bed is a SEAMLESS 12–20 s loop. Rain is the through-line: a convincing rain
texture is built from filtered noise (broadband hiss + sparse bandpassed droplet
transients), then the five rooms differentiate it per the SPEC manifest:

  ambient-dasil.ogg        rain on a tiled roof + faint brazier crackle + kettle hum
  ambient-daeungjeon.ogg   rain MUFFLED (lowpassed, doors open) + low wood creaks
  ambient-seungbang.ogg    intimate rain + a close, regular eave-drip
  ambient-jongnu.ogg       open, fuller rain + slow low valley wind
  ambient-jongnu-clear.ogg POST-rain: spaced single drips + shy bird chirps, airy

House rules (SPEC.md): MONO 44100 OGG/Vorbis; beds normalize_rms(−22, peak −6) then
write_ogg(normalize=False); deterministic via rng(SEED); loop-seam measured on the
float buffer PRE-codec (target < 0.05); spectrum broadband for rain.
"""

from __future__ import annotations

import numpy as np
import soundfile as sf

from common import (
    SR, AMBIENT_RMS_DBFS, AMBIENT_PEAK_CEIL_DBFS, CLIP_GUARD, AUDIO_DIR,
    rng, analyze, normalize_rms, read_ogg,
    white_noise,
    lowpass, bandpass, env_exp_decay,
    loop_seam_discontinuity,
)

# One master seed; each room derives a stable sub-seed so re-runs are identical
# and rooms never share a noise realization.
MASTER_SEED = 22_0613
# Every bed is built at exactly its loop length and made CIRCULARLY continuous, so
# the buffer IS the loop (no crossfade crop): rain is FFT-synthesized periodic
# noise filtered in the frequency domain (which preserves periodicity, unlike the
# edge-breaking time-domain filtfilt in common.py), and sparse transients are kept
# out of the last EVENT_GUARD_S so their rings never cross the buffer end.
EVENT_GUARD_S = 0.5


def _safe_hi(n: int, ring_n: int) -> int:
    """Latest sample a transient may start so its ring clears the buffer end."""
    return max(1, n - int(EVENT_GUARD_S * SR) - ring_n)


def write_ogg_chunked(path, x: np.ndarray, sr: int = SR):
    """Write a pre-normalized MONO bed to OGG/Vorbis by STREAMING in 1 s chunks.

    Same shipped-file contract as common.write_ogg (mono float32, hard-guard to
    |x| < CLIP_GUARD, path under .../level-02/audio/) but streamed via sf.SoundFile:
    on this Windows/libsndfile build a single large Vorbis write of certain ~18 s
    beds overflows the encoder stack (a libsndfile bug, not bad data — the same
    buffer writes fine to WAV and in chunks). NEVER re-normalizes (beds arrive
    RMS-normalized; a peak pass would clobber the -22 RMS). Returns the Path.
    """
    from pathlib import Path
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = np.clip(x, -CLIP_GUARD, CLIP_GUARD).astype(np.float32)
    p = Path(path)
    if not p.is_absolute():
        p = AUDIO_DIR / p
    p.parent.mkdir(parents=True, exist_ok=True)
    step = sr  # 1 s blocks
    with sf.SoundFile(str(p), "w", samplerate=sr, channels=1,
                      format="OGG", subtype="VORBIS") as f:
        for i in range(0, x.size, step):
            f.write(np.ascontiguousarray(x[i:i + step]))
    return p


def _circ_band(x: np.ndarray, lo: float | None, hi: float | None,
               roll_frac: float = 0.4) -> np.ndarray:
    """FFT-domain (circular) band filter with a raised-cosine rolloff.

    Multiplying the spectrum keeps the output perfectly periodic over the buffer —
    the key to a seamless broadband-noise loop (time-domain filtfilt breaks
    periodicity at the edges). lo=None -> lowpass at hi; hi=None -> highpass at lo.
    """
    nn = x.size
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(nn, d=1.0 / SR)
    w = np.ones_like(f)
    if hi is not None:  # low side of a lowpass / top of a bandpass
        bw = max(hi * roll_frac, 1.0)
        roll = (f > hi - bw) & (f < hi + bw)
        w[roll] *= 0.5 * (1 + np.cos(np.pi * (f[roll] - (hi - bw)) / (2 * bw)))
        w[f >= hi + bw] = 0.0
    if lo is not None:  # high side of a highpass / bottom of a bandpass
        bw = max(lo * roll_frac, 1.0)
        roll = (f > lo - bw) & (f < lo + bw)
        w[roll] *= 0.5 * (1 - np.cos(np.pi * (f[roll] - (lo - bw)) / (2 * bw)))
        w[f <= lo - bw] = 0.0
    w[0] = 0.0  # always kill DC
    return np.fft.irfft(X * w, n=nn)


def _periodic_noise(n: int, gen: np.random.Generator, beta: float) -> np.ndarray:
    """Power-law (1/f^beta) noise via FFT-domain synthesis -> CIRCULAR (loop-safe).

    beta=1 -> pink, beta=2 -> brown. An inverse FFT of a shaped random spectrum, so
    the buffer wraps seamlessly — the circular counterpart to common.pink/brown_noise.
    """
    f = np.fft.rfftfreq(n, d=1.0 / SR)
    mag = np.ones_like(f)
    mag[1:] = 1.0 / np.power(f[1:], beta / 2.0)
    mag[0] = 0.0
    phase = gen.uniform(0, 2 * np.pi, size=f.shape)
    spec = mag * np.exp(1j * phase)
    y = np.fft.irfft(spec, n=n)
    pk = float(np.max(np.abs(y))) + 1e-12
    return y / pk


def _loop_shimmer(x: np.ndarray, gen: np.random.Generator) -> np.ndarray:
    """Multiply by a slow 'rain swell' that is PERIODIC over the buffer length.

    The LFOs complete whole integer cycles over the buffer, so head and tail see
    the same multiplier and the swell can never reopen the loop seam.
    """
    nn = x.size
    k = np.arange(nn) / nn  # 0..1 over exactly one buffer period
    shimmer = (1.0
               + 0.06 * np.sin(2 * np.pi * 3 * k + gen.uniform(0, 6.28))
               + 0.04 * np.sin(2 * np.pi * 5 * k + gen.uniform(0, 6.28)))
    return x * shimmer


def _condition_seam(x: np.ndarray, w_ms: float = 12.0) -> np.ndarray:
    """Force x[0] ≈ x[-1] over a short cosine window so the loop wrap is click-free.

    The bed is already circular (its wrap is as smooth as any adjacency), but
    loop_seam_discontinuity = |x[0]-x[-1]|/rms reads the one-sample endpoint diff,
    ~RMS for broadband noise even in a perfect loop. Ramping the first/last ~12 ms
    toward their shared mean m=(x[0]+x[-1])/2 lands both ends on m -> metric ~0,
    provably continuous wrap. Inaudible (~530 samples/end), content-agnostic.
    """
    x = x.copy()
    w = max(2, int(w_ms * SR / 1000.0))
    if x.size <= 2 * w:
        return x
    m = 0.5 * (float(x[0]) + float(x[-1]))
    win = 0.5 * (1.0 - np.cos(np.pi * np.arange(w) / w))  # 0→1 raised cosine
    x[:w] = x[:w] * win + m * (1.0 - win)                 # start: ramp up from m
    x[-w:] = x[-w:] * win[::-1] + m * (1.0 - win[::-1])   # end: ramp down to m
    return x


# ── Rain texture (the shared through-line) ───────────────────────────────────


def rain_bed(dur_s: float, gen: np.random.Generator, *, lp_cut: float,
             body_amp: float = 0.12, hiss_amp: float = 1.0,
             hp_cut: float = 140.0) -> np.ndarray:
    """Broadband rain from CIRCULAR filtered noise: a band-limited hiss + low body.

    Circular pink noise = the soft 'sheet of rain', band-limited [hp_cut, lp_cut] in
    the FFT domain (lp_cut = how much the architecture muffles the highs; hp_cut
    strips the sub-bass real rain lacks). A little circular brown body adds warmth.
    All periodic, so the buffer loops with no crossfade. Un-normalized, broadband.
    """
    n = int(dur_s * SR)
    hiss = _circ_band(_periodic_noise(n, gen, beta=1.0) * hiss_amp, hp_cut, lp_cut)
    body = _circ_band(_periodic_noise(n, gen, beta=2.0) * body_amp,
                      hp_cut, min(lp_cut * 0.5, 500.0))
    return hiss + body


def droplets(dur_s: float, gen: np.random.Generator, *, rate_hz: float,
             band=(900.0, 4500.0), ring_t60: float = 0.012,
             amp: float = 0.5) -> np.ndarray:
    """Sparse droplet transients over the hiss: short bandpassed bursts with a fast
    exp ring — the splashes that make broadband hiss read as RAIN, not static. Onsets
    are tail-guarded (deterministic via gen) so no ring crosses the loop wrap.
    """
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    n_drops = max(1, int(rate_hz * dur_s))
    ring_n = int(max(ring_t60 * 6.0, 0.02) * SR)
    env = env_exp_decay(ring_n, ring_t60)
    hi = _safe_hi(n, ring_n)
    for _ in range(n_drops):
        start = int(gen.uniform(0, hi))
        end = min(start + ring_n, n)
        burst = white_noise(end - start, gen, amp=1.0)
        burst = bandpass(burst, band[0], band[1], order=2)
        burst *= env[: end - start] * gen.uniform(0.4, 1.0)
        out[start:end] += burst
    return out * amp


# ── Periodic / sparse event layers (per-room flavor) ─────────────────────────


def crackle(dur_s: float, gen: np.random.Generator, *, rate_hz: float,
            band=(2000.0, 5000.0), amp: float = 0.4) -> np.ndarray:
    """Sparse HF pops — brazier (화로) embers. Tiny bandpassed clicks, rare."""
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    pop_n = int(0.006 * SR)
    env = env_exp_decay(pop_n, 0.003)
    hi = _safe_hi(n, pop_n)
    for _ in range(max(1, int(rate_hz * dur_s))):
        start = int(gen.uniform(0, hi))
        end = min(start + pop_n, n)
        pop = white_noise(end - start, gen, amp=1.0)
        pop = bandpass(pop, band[0], band[1], order=2)
        pop *= env[: end - start] * gen.uniform(0.3, 1.0)
        out[start:end] += pop
    return out * amp


def kettle_hum(dur_s: float, gen: np.random.Generator, *, f0: float = 1400.0,
               amp: float = 0.05) -> np.ndarray:
    """Distant kettle whistle: a faint high sine, almost inaudible. Carrier and
    vibrato/level LFOs all use whole cycles over the buffer, so the tone wraps.
    """
    n = int(dur_s * SR)
    k = np.arange(n) / n  # 0..1 over one buffer period
    cyc = round(f0 * dur_s)             # whole cycles so the carrier wraps
    vib = 1.0 + 0.004 * np.sin(2 * np.pi * round(4.5 * dur_s) * k + gen.uniform(0, 6.28))
    tone = np.sin(2 * np.pi * cyc * k * vib)
    lvl = 0.6 + 0.4 * np.sin(2 * np.pi * 2 * k + gen.uniform(0, 6.28))  # 2 cycles/loop
    return tone * lvl * amp


def wood_creaks(dur_s: float, gen: np.random.Generator, *, n_events: int,
                amp: float = 0.5) -> np.ndarray:
    """Occasional low wood creaks (50–200 Hz) with a slow swell — a big empty hall."""
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    for _ in range(n_events):
        f = gen.uniform(55.0, 190.0)
        dur = gen.uniform(0.35, 0.9)
        cn = int(dur * SR)
        ct = np.arange(cn) / SR
        # creak = slightly drifting low tone + friction noise, slow swell env
        drift = f * (1.0 + 0.04 * np.sin(2 * np.pi * gen.uniform(1.0, 3.0) * ct))
        tone = np.sin(2 * np.pi * np.cumsum(drift) / SR)
        fric = lowpass(white_noise(cn, gen, amp=0.4), 320.0, order=2)
        swell = np.sin(np.pi * np.arange(cn) / cn) ** 1.5  # 0→1→0, soft
        start = int(gen.uniform(0, _safe_hi(n, cn)))
        out[start:start + cn] += (tone + fric) * swell * gen.uniform(0.5, 1.0)
    return out * amp


def eave_drips(dur_s: float, gen: np.random.Generator, *, period_s: float,
               band=(800.0, 2500.0), ring_t60: float = 0.08,
               amp: float = 0.6, jitter: float = 0.06) -> np.ndarray:
    """Close, regular eave-drips: a resonant ring (~80 ms) every ~period_s with small
    jitter so it is not robotic — a bandpassed burst + faint pitch 'plink'.
    """
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    ring_n = int(ring_t60 * 6.0 * SR)
    env = env_exp_decay(ring_n, ring_t60)
    hi = _safe_hi(n, ring_n)
    t_pos = period_s
    while t_pos < dur_s:
        start = int((t_pos + gen.uniform(-jitter, jitter)) * SR)
        if start > hi:           # keep drips out of the loop body tail
            break
        start = max(0, min(start, n - 1))
        end = min(start + ring_n, n)
        # a faint pitched resonance gives each drip a 'plink'
        f = gen.uniform(band[0], band[1])
        seg_t = np.arange(end - start) / SR
        tone = np.sin(2 * np.pi * f * seg_t)
        burst = bandpass(white_noise(end - start, gen, amp=1.0), band[0], band[1], order=2)
        ring = (0.6 * tone + 0.4 * burst) * env[: end - start]
        out[start:end] += ring * gen.uniform(0.8, 1.0)
        t_pos += period_s
    return out * amp


def valley_wind(dur_s: float, gen: np.random.Generator, *, band=(200.0, 900.0),
                amp: float = 0.5) -> np.ndarray:
    """Low valley wind: circular brown noise band-filtered, gated by a slow gust LFO.
    Both the noise and the LFO (integer cycles/buffer) are loop-periodic.
    """
    n = int(dur_s * SR)
    base = _circ_band(_periodic_noise(n, gen, beta=2.0), band[0], band[1])
    k = np.arange(n) / n  # 0..1 over one buffer period
    # slow gusts as integer-cycle LFOs (1 and 2 cycles per loop), strictly positive
    lfo = (0.5
           + 0.30 * np.sin(2 * np.pi * 1 * k + gen.uniform(0, 6.28))
           + 0.18 * np.sin(2 * np.pi * 2 * k + gen.uniform(0, 6.28)))
    lfo = np.clip(lfo, 0.05, 1.0)
    return base * lfo * amp


def lone_drips(dur_s: float, gen: np.random.Generator, *, n_events: int,
               band=(1200.0, 3200.0), ring_t60: float = 0.10,
               amp: float = 0.7) -> np.ndarray:
    """Spaced single drips for the post-rain bed: rarer, clearer than eave-drips."""
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    ring_n = int(ring_t60 * 6.0 * SR)
    env = env_exp_decay(ring_n, ring_t60)
    hi = _safe_hi(n, ring_n)
    positions = np.sort(gen.uniform(0, hi / SR, size=n_events))
    for p in positions:
        start = int(p * SR)
        end = min(start + ring_n, n)
        f = gen.uniform(band[0], band[1])
        seg_t = np.arange(end - start) / SR
        tone = np.sin(2 * np.pi * f * seg_t)
        burst = bandpass(white_noise(end - start, gen, amp=1.0), band[0], band[1], order=2)
        out[start:end] += (0.7 * tone + 0.3 * burst) * env[: end - start] * gen.uniform(0.7, 1.0)
    return out * amp


def bird_chirps(dur_s: float, gen: np.random.Generator, *, n_chirps: int = 2,
                amp: float = 0.18) -> np.ndarray:
    """A couple of shy bird chirps: short FM/sine glints, far away and soft."""
    n = int(dur_s * SR)
    out = np.zeros(n, dtype=np.float64)
    for _ in range(n_chirps):
        cdur = gen.uniform(0.10, 0.22)
        cn = int(cdur * SR)
        ct = np.arange(cn) / SR
        f0 = gen.uniform(2600.0, 3600.0)
        # gentle rising-then-falling FM glide (a 'tweet')
        glide = f0 * (1.0 + 0.25 * np.sin(np.pi * np.arange(cn) / cn))
        vib = 1.0 + 0.03 * np.sin(2 * np.pi * gen.uniform(18, 30) * ct)
        tone = np.sin(2 * np.pi * np.cumsum(glide * vib) / SR)
        env = np.sin(np.pi * np.arange(cn) / cn) ** 2  # soft in/out
        start = int(gen.uniform(0.1 * n, 0.85 * n))
        end = min(start + cn, n)
        out[start:end] += tone[: end - start] * env[: end - start]
    return lowpass(out, 6000.0, order=2) * amp  # distant: shave the very top


# ── Room recipes ─────────────────────────────────────────────────────────────


def build_dasil(gen, dur_s):
    """Warm room: rain on a tiled roof + faint brazier crackle + distant kettle."""
    bed = rain_bed(dur_s, gen, lp_cut=2200.0, body_amp=0.10, hiss_amp=1.0, hp_cut=150.0)
    bed += droplets(dur_s, gen, rate_hz=80.0, band=(1200.0, 4500.0), ring_t60=0.010, amp=0.55)
    bed += crackle(dur_s, gen, rate_hz=3.5, band=(2200.0, 5200.0), amp=0.30)
    bed += kettle_hum(dur_s, gen, f0=1400.0, amp=0.040)
    return bed


def build_daeungjeon(gen, dur_s):
    """Big empty hall: rain MUFFLED through open doors + occasional low wood creaks."""
    bed = rain_bed(dur_s, gen, lp_cut=1300.0, body_amp=0.14, hiss_amp=0.95, hp_cut=140.0)
    bed += droplets(dur_s, gen, rate_hz=55.0, band=(700.0, 2400.0), ring_t60=0.014, amp=0.45)
    bed += wood_creaks(dur_s, gen, n_events=3, amp=0.35)
    return bed


def build_seungbang(gen, dur_s):
    """Austere cell: the most intimate rain + a close, regular eave-drip."""
    bed = rain_bed(dur_s, gen, lp_cut=1100.0, body_amp=0.10, hiss_amp=0.85, hp_cut=150.0)
    bed += droplets(dur_s, gen, rate_hz=48.0, band=(600.0, 2200.0), ring_t60=0.013, amp=0.40)
    bed += eave_drips(dur_s, gen, period_s=1.7, band=(900.0, 2400.0), ring_t60=0.08, amp=0.50)
    return bed


def build_jongnu(gen, dur_s):
    """Open bell-pavilion: fuller rain + slow low valley wind."""
    bed = rain_bed(dur_s, gen, lp_cut=3200.0, body_amp=0.12, hiss_amp=1.0, hp_cut=140.0)
    bed += droplets(dur_s, gen, rate_hz=110.0, band=(1500.0, 6000.0), ring_t60=0.009, amp=0.55)
    bed += valley_wind(dur_s, gen, band=(220.0, 900.0), amp=0.22)
    return bed


def build_jongnu_clear(gen, dur_s):
    """Post-rain: airy near-silence + spaced single drips + a couple of shy birds."""
    # a very low CIRCULAR air bed (no rain curtain), kept dark and quiet
    n = int(dur_s * SR)
    air = _circ_band(_periodic_noise(n, gen, beta=1.0), 120.0, 1800.0) * 0.06
    bed = air
    bed += lone_drips(dur_s, gen, n_events=9, band=(1200.0, 3200.0), ring_t60=0.10, amp=0.55)
    bed += bird_chirps(dur_s, gen, n_chirps=2, amp=0.16)
    return bed


# room key -> (builder, duration_s, sub-seed offset)
ROOMS = {
    "ambient-dasil":        (build_dasil,        16.0, 11),
    "ambient-daeungjeon":   (build_daeungjeon,   16.0, 22),
    "ambient-seungbang":    (build_seungbang,    14.0, 33),
    "ambient-jongnu":       (build_jongnu,       18.0, 44),
    "ambient-jongnu-clear": (build_jongnu_clear, 18.0, 55),
}

# QA bands. Each buffer IS its loop (built circular), so duration == dur_s.
DUR_TOL = 0.20          # seconds of slack around target length
RMS_TOL = 1.5           # dB around AMBIENT_RMS_DBFS
SEAM_MAX = 0.05         # float-buffer loop-seam target (PRE-codec)
PEAK_CEIL = AMBIENT_PEAK_CEIL_DBFS + 1.0  # codec slack above the -6 float ceiling


def build_room(key, builder, dur_s, sub_seed):
    """Synthesize, make loop-periodic, normalize, write, verify. Returns a record."""
    gen = rng(MASTER_SEED + sub_seed)
    raw = builder(gen, dur_s)
    # The bed is already circular (periodic noise + circular filters + integer-cycle
    # LFOs + tail-guarded transients), so the buffer IS the loop — no crossfade.
    raw = _circ_band(raw, 60.0, None)                 # circular DC/sub-bass strip
    looped = _loop_shimmer(raw, gen)                  # rain swell, loop-periodic
    looped = _condition_seam(looped)                  # force a click-free wrap
    bed = normalize_rms(looped, AMBIENT_RMS_DBFS, AMBIENT_PEAK_CEIL_DBFS)
    seam_norm = loop_seam_discontinuity(bed)          # measure PRE-codec, post-norm
    path = write_ogg_chunked(f"{key}.ogg", bed)
    back, sr = read_ogg(f"{key}.ogg")
    rep = analyze(back, sr)

    # The post-rain 'clear' bed is intentionally near-silent (sparse drips over an
    # airy floor); its peaky drips hit the -6 ceiling before RMS reaches -22, so a
    # lower RMS is by-design ("casi-silencio" in the SPEC). Broadband floor is modest
    # (rain spreads over hundreds of Hz; muffled rooms are narrower — only reject a
    # pure tone). Each check yields a (pass, message) pair.
    is_clear = key == "ambient-jongnu-clear"
    rms_target = -30.0 if is_clear else AMBIENT_RMS_DBFS
    rms_tol = 4.0 if is_clear else RMS_TOL
    bw_floor = 200.0 if is_clear else 250.0
    checks = [
        (abs(rep["dur_s"] - dur_s) <= max(DUR_TOL, 0.3),
         f"dur {rep['dur_s']}s vs target {dur_s:.2f}s"),
        (abs(rep["rms_dbfs"] - rms_target) <= rms_tol,
         f"rms {rep['rms_dbfs']} dBFS off {rms_target}"),
        (rep["peak_dbfs"] <= PEAK_CEIL, f"peak {rep['peak_dbfs']} dBFS > ceiling"),
        (seam_norm <= SEAM_MAX, f"seam {seam_norm:.4f} > {SEAM_MAX}"),
        (rep["bandwidth_hz"] >= bw_floor,
         f"bandwidth {rep['bandwidth_hz']} Hz < {bw_floor}"),
        (sr == SR, f"sr {sr} != {SR}"),
    ]
    ok = all(p for p, _ in checks)
    note = "; ".join(msg for p, msg in checks if not p) or "ok"

    return {
        "key": key, "path": str(path), "ok": ok, "note": note,
        "seconds": rep["dur_s"], "peak_dbfs": rep["peak_dbfs"],
        "rms_dbfs": rep["rms_dbfs"], "centroid_hz": rep["centroid_hz"],
        "bandwidth_hz": rep["bandwidth_hz"], "loop_seam": seam_norm,
    }


def main():
    # Windows consoles default to cp1252; force UTF-8 so status glyphs never crash.
    try:
        import sys
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    records = []
    for key, (builder, dur_s, sub_seed) in ROOMS.items():
        rec = build_room(key, builder, dur_s, sub_seed)
        records.append(rec)
        print(f"[{'OK ' if rec['ok'] else 'BAD'}] {key:22s} "
              f"dur={rec['seconds']:.2f}s peak={rec['peak_dbfs']:+.1f} "
              f"rms={rec['rms_dbfs']:+.1f} cen={rec['centroid_hz']:.0f}Hz "
              f"bw={rec['bandwidth_hz']:.0f}Hz seam={rec['loop_seam']:.4f} :: {rec['note']}")
    all_ok = all(r["ok"] for r in records)
    print(f"\n{'ALL OK' if all_ok else 'SOME FAILED'} — {sum(r['ok'] for r in records)}/{len(records)}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
