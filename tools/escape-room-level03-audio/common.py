#!/usr/bin/env python3
"""Shared DSP toolkit for the Level 3 escape-room AUDIO pipeline.

Ported verbatim from tools/escape-room-level02-audio/common.py (the DSP
vocabulary is generic: seeded noise, filters, envelopes, reverb, OGG IO,
analysis). Only AUDIO_DIR is retargeted to level-03 and this header. Every
gen_*.py audio script imports from here so the whole soundscape of
"El mercado nocturno (달빛시장)" shares ONE format standard (44100 Hz, MONO,
float32 in (-1, 1), written as OGG/Vorbis) and ONE house DSP vocabulary.

Tone (per docs/escape-room-level-03.md and tools/escape-room-level03/STYLE.md):
energético / callejero — neón, vapor, bullicio; el alivio cálido tras la
lluvia-duelo del L2. NOT horror, NOT retro-arcade, NOT melodrama. Sounds are
busy, warm, alive: the griddle sizzle, the market hum, the last bus. The temple
synths inherited from L2 (bell, rain) are simply unused here.

Final OGGs land under munbeop/public/escape-room/level-03/audio/ (ambient beds +
SFX at the top level, Korean TTS voice lines under audio/voice/). Previews,
debug renders and analysis dumps go under tools/escape-room-level03-audio/out/
(review only, never shipped).

DETERMINISM: every procedural generator (ambient + SFX) is seeded with an
explicit numpy Generator (rng(seed)); re-running a script yields a
byte-identical (Vorbis is lossy but the float buffer is identical, so the OGG is
stable) result. Voice (edge-tts) need not be byte-deterministic.

WE CANNOT LISTEN. Quality is judged by DSP design + measurable properties:
duration, peak/RMS dBFS, spectral centroid/bandwidth, loop-seam discontinuity,
decay T60. Every writer should verify its file with the analysis helpers below.

This module is the shared library so it intentionally exceeds 400 lines, but
every helper stays small and carries a docstring naming its consumers (see
SPEC.md "Shared helpers API" for the canonical table).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal as sps

# ── Constants / paths ────────────────────────────────────────────────────────

SR = 44100  # sample rate for every file in the level, no exceptions
EPS = 1e-12  # guard for logs / divisions

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
AUDIO_DIR = REPO / "munbeop" / "public" / "escape-room" / "level-03" / "audio"
VOICE_DIR = AUDIO_DIR / "voice"
OUT_DIR = HERE / "out"

# Level/headroom targets (dBFS), from the format standard in SPEC.md.
PEAK_SFX_DBFS = -1.0     # SFX normalize target
PEAK_VOICE_DBFS = -2.0   # voice normalize target
AMBIENT_RMS_DBFS = -22.0  # ambient bed loudness target (RMS)
AMBIENT_PEAK_CEIL_DBFS = -6.0  # ambient beds must stay below this peak
# Hard clip guard: samples are forced strictly inside (-CLIP_GUARD, +CLIP_GUARD).
CLIP_GUARD = 0.999


# ── Seeded RNG ───────────────────────────────────────────────────────────────


def rng(seed: int) -> np.random.Generator:
    """Return a seeded numpy Generator — the ONLY randomness source allowed.

    Determinism rule: never call np.random.* globally; thread one of these
    through a generator so re-running a script is reproducible. Consumers: every
    noise/SFX/ambient generator below and every gen_*.py audio script.
    """
    return np.random.default_rng(seed)


# ── dBFS <-> linear ──────────────────────────────────────────────────────────


def db_to_amp(db: float) -> float:
    """Decibels-relative-to-full-scale -> linear amplitude (1.0 == 0 dBFS)."""
    return float(10.0 ** (db / 20.0))


def amp_to_db(amp: float) -> float:
    """Linear amplitude -> dBFS. Floors at EPS so silence -> a large negative."""
    return float(20.0 * np.log10(max(abs(amp), EPS)))


# ── Analysis helpers (the QA toolbox — you cannot listen, so you measure) ─────


def peak_dbfs(x: np.ndarray) -> float:
    """Peak level in dBFS (max |sample|). -inf-safe via EPS floor."""
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return float("-inf")
    return amp_to_db(float(np.max(np.abs(x))))


def rms_dbfs(x: np.ndarray) -> float:
    """RMS level in dBFS. The honest 'loudness' number for ambient beds."""
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return float("-inf")
    return amp_to_db(float(np.sqrt(np.mean(x * x) + EPS)))


def duration_s(x: np.ndarray, sr: int = SR) -> float:
    """Length of a mono buffer in seconds."""
    return float(np.asarray(x).shape[0]) / sr


def spectral_centroid(x: np.ndarray, sr: int = SR) -> float:
    """Power-weighted mean frequency (Hz) over the whole buffer.

    The single best one-number proxy for 'brightness'. Rain beds should sit low
    (a few hundred Hz to ~1-2 kHz after low-passing); the bell strike rings
    brighter. Used by every writer's self-check. Returns 0.0 for silence.
    """
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return 0.0
    win = np.hanning(x.size) if x.size > 1 else np.ones(1)
    spec = np.abs(np.fft.rfft(x * win))
    freqs = np.fft.rfftfreq(x.size, d=1.0 / sr)
    p = spec ** 2
    tot = float(np.sum(p))
    if tot <= EPS:
        return 0.0
    return float(np.sum(freqs * p) / tot)


def spectral_bandwidth(x: np.ndarray, sr: int = SR) -> float:
    """Power-weighted spectral spread (Hz) around the centroid.

    Pairs with spectral_centroid to describe timbre: a pure tone -> ~0, broadband
    rain/noise -> large. Used in QA dumps. Returns 0.0 for silence.
    """
    x = np.asarray(x, dtype=np.float64)
    if x.size == 0:
        return 0.0
    win = np.hanning(x.size) if x.size > 1 else np.ones(1)
    spec = np.abs(np.fft.rfft(x * win))
    freqs = np.fft.rfftfreq(x.size, d=1.0 / sr)
    p = spec ** 2
    tot = float(np.sum(p))
    if tot <= EPS:
        return 0.0
    c = float(np.sum(freqs * p) / tot)
    return float(np.sqrt(np.sum(((freqs - c) ** 2) * p) / tot))


def est_t60(x: np.ndarray, sr: int = SR) -> float:
    """Estimate T60 (seconds for the energy envelope to fall 60 dB).

    Fits a line to the log-amplitude decay of the post-peak tail and extrapolates
    to -60 dB. Honest for single-event decays (bell 여음, reverb tails); for
    steady noise beds it is meaningless (returns inf-ish). Used to verify the
    bell rings long enough (>= 8 s afterglow) and that reverb tails match their
    requested decay. Returns 0.0 if it cannot fit.
    """
    x = np.asarray(x, dtype=np.float64)
    if x.size < sr // 10:
        return 0.0
    # amplitude envelope: rectify + smooth with a short moving average
    env = np.abs(x)
    win = max(1, sr // 200)  # ~5 ms
    env = np.convolve(env, np.ones(win) / win, mode="same")
    peak_i = int(np.argmax(env))
    tail = env[peak_i:]
    if tail.size < sr // 10:
        return 0.0
    db = 20.0 * np.log10(tail + EPS)
    db -= db[0]  # 0 dB at the peak
    # use the region from -5 dB down to -45 dB (avoid the very top and the noise
    # floor); fit only while it is still monotonically dropping enough to read.
    lo_i = np.argmax(db <= -5.0)
    hi_i = np.argmax(db <= -45.0)
    if hi_i <= lo_i:
        hi_i = tail.size - 1
    if hi_i - lo_i < sr // 50:
        return 0.0
    t = np.arange(lo_i, hi_i) / sr
    seg = db[lo_i:hi_i]
    slope, _ = np.polyfit(t, seg, 1)  # dB per second (negative)
    if slope >= -EPS:
        return 0.0
    return float(-60.0 / slope)


def loop_seam_discontinuity(x: np.ndarray) -> float:
    """Measure the click at the loop boundary: |x[0] - x[-1]|, RMS-normalized.

    A seamless loop should return ~0 (the head and the tail meet). Reported as a
    ratio of the buffer RMS so it is level-independent: < ~0.05 is inaudible,
    > ~0.2 will click. The QA counterpart to seamless_loop(). Consumers: every
    ambient-loop writer's self-check.
    """
    x = np.asarray(x, dtype=np.float64)
    if x.size < 2:
        return 0.0
    jump = abs(float(x[0]) - float(x[-1]))
    r = float(np.sqrt(np.mean(x * x) + EPS))
    return float(jump / (r + EPS))


# ── Normalization + IO ───────────────────────────────────────────────────────


def normalize_peak(x: np.ndarray, peak_dbfs_target: float = PEAK_SFX_DBFS) -> np.ndarray:
    """Scale x so its peak sits at peak_dbfs_target. No-op on silence."""
    x = np.asarray(x, dtype=np.float64)
    pk = float(np.max(np.abs(x))) if x.size else 0.0
    if pk <= EPS:
        return x.astype(np.float32)
    target = db_to_amp(peak_dbfs_target)
    return (x * (target / pk)).astype(np.float32)


def normalize_rms(x: np.ndarray, rms_dbfs_target: float = AMBIENT_RMS_DBFS,
                  peak_ceiling_dbfs: float = AMBIENT_PEAK_CEIL_DBFS) -> np.ndarray:
    """Scale x to an RMS target, then pull back if it would breach a peak ceiling.

    The right normalizer for ambient beds: loudness is set by RMS (so all five
    rooms sit at a consistent level), but a peak ceiling keeps transients (an
    eave-drip, a crackle) from clipping. Consumers: every ambient writer.
    """
    x = np.asarray(x, dtype=np.float64)
    r = float(np.sqrt(np.mean(x * x) + EPS))
    if r <= EPS:
        return x.astype(np.float32)
    y = x * (db_to_amp(rms_dbfs_target) / r)
    pk = float(np.max(np.abs(y))) if y.size else 0.0
    ceil = db_to_amp(peak_ceiling_dbfs)
    if pk > ceil:
        y = y * (ceil / pk)
    return y.astype(np.float32)


def _resolve_audio_path(path: str | Path) -> Path:
    """Resolve a write target under AUDIO_DIR unless it is already absolute.

    Accepts 'sfx-bell-toll.ogg', 'voice/line-intro.ogg', or an absolute path.
    Creates parent dirs. Internal to write_ogg.
    """
    p = Path(path)
    if not p.is_absolute():
        p = AUDIO_DIR / p
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def write_ogg(path: str | Path, x: np.ndarray, peak_dbfs: float = PEAK_SFX_DBFS,
              normalize: bool = True, sr: int = SR) -> Path:
    """Normalize, hard-guard, and write a MONO float32 OGG/Vorbis file.

    The single house writer for every shipped sound:
      - flattens to mono float32,
      - normalizes the peak to `peak_dbfs` (set normalize=False for beds you have
        already RMS-normalized — they are then only guarded, not rescaled),
      - HARD-GUARDS every sample to |x| < CLIP_GUARD (0.999) so the buffer is
        strictly inside (-1, 1) and can never clip,
      - resolves relative paths under munbeop/.../level-02/audio/,
      - writes via soundfile.write(..., format='OGG', subtype='VORBIS').

    Returns the absolute Path written. Consumers: every gen_*.py audio script.
    """
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:  # mix down to mono if a writer handed us stereo
        x = x.mean(axis=1)
    if normalize:
        x = normalize_peak(x, peak_dbfs).astype(np.float64)
    # hard guard: clip strictly inside (-0.999, 0.999) — never reaches +-1.0
    x = np.clip(x, -CLIP_GUARD, CLIP_GUARD)
    out = _resolve_audio_path(path)
    sf.write(str(out), x.astype(np.float32), sr, format="OGG", subtype="VORBIS")
    return out


def read_ogg(path: str | Path) -> tuple[np.ndarray, int]:
    """Read a file back as (mono float32, sr). Resolves like write_ogg.

    The verification counterpart to write_ogg: read a just-written OGG and run
    the analysis helpers on it to confirm sr/channels/peak survived the round
    trip. Consumers: every writer's post-write self-check.
    """
    p = _resolve_audio_path(path) if not Path(path).is_absolute() else Path(path)
    x, sr = sf.read(str(p), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    return x.astype(np.float32), int(sr)


def save_out_ogg(name: str, x: np.ndarray, peak_dbfs: float = PEAK_SFX_DBFS,
                 sr: int = SR) -> Path:
    """Write a review/debug OGG under out/ (never shipped). Mirrors write_ogg."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = normalize_peak(x, peak_dbfs).astype(np.float64)
    x = np.clip(x, -CLIP_GUARD, CLIP_GUARD)
    out = OUT_DIR / name
    sf.write(str(out), x.astype(np.float32), sr, format="OGG", subtype="VORBIS")
    return out


# ── Noise generators ─────────────────────────────────────────────────────────


def white_noise(n: int, gen: np.random.Generator, amp: float = 1.0) -> np.ndarray:
    """n samples of zero-mean white noise in roughly (-amp, amp).

    The raw material for rain. Consumers: pink_noise, every rain bed,
    sfx-tea-pour, sfx-rain-stop. `gen` is a seeded rng() for determinism.
    """
    return (gen.standard_normal(n) * (amp / 3.0)).astype(np.float64)


def pink_noise(n: int, gen: np.random.Generator, amp: float = 1.0) -> np.ndarray:
    """n samples of pink (1/f) noise via spectral 1/sqrt(f) shaping.

    Pink noise is the natural bed for rain/wind: equal energy per octave, so it
    sounds full and soft, not hissy like white. Implemented in the frequency
    domain (deterministic given `gen`) then normalized to ~unit peak * amp.
    Consumers: every ambient rain bed, sfx-cat-purr (sub-bed), reverb diffusion.
    """
    if n <= 0:
        return np.zeros(0)
    # white spectrum from real noise, shaped by 1/sqrt(f)
    x = gen.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, d=1.0 / SR)
    shape = np.ones_like(f)
    shape[1:] = 1.0 / np.sqrt(f[1:])  # 1/f power -> 1/sqrt(f) amplitude
    shape[0] = 0.0                    # kill DC
    y = np.fft.irfft(X * shape, n=n)
    pk = float(np.max(np.abs(y))) + EPS
    return (y / pk * amp).astype(np.float64)


def brown_noise(n: int, gen: np.random.Generator, amp: float = 1.0) -> np.ndarray:
    """n samples of brown/red (1/f^2) noise — even darker than pink.

    The rumble layer: distant thunder-less low roar of heavy rain, valley wind.
    Cumulative-sum of white with DC removed, then peak-normalized. Consumers:
    ambient-jongnu (valley wind), sfx-rain-stop (the 'curtain' phase low body).
    """
    if n <= 0:
        return np.zeros(0)
    w = gen.standard_normal(n)
    y = np.cumsum(w)
    y = y - np.linspace(y[0], y[-1], n)  # detrend so it does not wander off
    pk = float(np.max(np.abs(y))) + EPS
    return (y / pk * amp).astype(np.float64)


# ── Filters (butterworth, applied zero-phase with filtfilt) ──────────────────


def _butter(kind: str, cutoff, order: int, sr: int):
    """Design a butterworth SOS for the given kind/cutoff. Internal."""
    nyq = sr / 2.0
    if kind in ("low", "high"):
        wn = np.clip(cutoff / nyq, 1e-5, 0.9999)
    else:  # band
        lo, hi = cutoff
        wn = [np.clip(lo / nyq, 1e-5, 0.9999), np.clip(hi / nyq, 1e-5, 0.9999)]
    return sps.butter(order, wn, btype=kind, output="sos")


def lowpass(x: np.ndarray, cutoff: float, order: int = 4, sr: int = SR) -> np.ndarray:
    """Zero-phase butterworth low-pass. The workhorse: every soft sound is

    low-passed (rain through a roof, muffled by doors, the dark bell body).
    filtfilt -> no phase smear, no added latency. Consumers: nearly everything.
    """
    sos = _butter("low", cutoff, order, sr)
    return sps.sosfiltfilt(sos, np.asarray(x, dtype=np.float64))


def highpass(x: np.ndarray, cutoff: float, order: int = 4, sr: int = SR) -> np.ndarray:
    """Zero-phase butterworth high-pass. Removes rumble / DC from a layer before

    mixing (e.g. keep eave-drips crisp). Consumers: drips, page/brush SFX, mixing.
    """
    sos = _butter("high", cutoff, order, sr)
    return sps.sosfiltfilt(sos, np.asarray(x, dtype=np.float64))


def bandpass(x: np.ndarray, low: float, high: float, order: int = 4,
             sr: int = SR) -> np.ndarray:
    """Zero-phase butterworth band-pass [low, high] Hz. Shapes a noise burst into

    a body (the 'glug' band of a tea pour, the airy band of wind). Consumers:
    sfx-tea-pour, ambient wind layers, purr formant.
    """
    sos = _butter("band", (low, high), order, sr)
    return sps.sosfiltfilt(sos, np.asarray(x, dtype=np.float64))


def peaking(x: np.ndarray, f0: float, gain_db: float, q: float = 1.0,
            sr: int = SR) -> np.ndarray:
    """Apply a single peaking/bell EQ (RBJ cookbook) at f0, gain_db, Q.

    Adds a resonant bump (or notch, gain<0) — used to give a noise bed a faint
    pitched 'room' resonance, or to lift a partial. Applied with filtfilt for
    zero phase. Consumers: tea-pour resonances, ambient color, purr body.
    """
    a = 10.0 ** (gain_db / 40.0)
    w0 = 2.0 * np.pi * f0 / sr
    alpha = np.sin(w0) / (2.0 * q)
    cw = np.cos(w0)
    b0 = 1 + alpha * a
    b1 = -2 * cw
    b2 = 1 - alpha * a
    a0 = 1 + alpha / a
    a1 = -2 * cw
    a2 = 1 - alpha / a
    b = np.array([b0, b1, b2]) / a0
    av = np.array([1.0, a1 / a0, a2 / a0])
    return sps.filtfilt(b, av, np.asarray(x, dtype=np.float64))


# ── Envelopes ────────────────────────────────────────────────────────────────


def apply_envelope(x: np.ndarray, env: np.ndarray) -> np.ndarray:
    """Multiply a signal by an envelope, length-matched (pad/truncate env).

    The generic shaper. Consumers: every SFX/ambient that fades or gates.
    """
    x = np.asarray(x, dtype=np.float64)
    env = np.asarray(env, dtype=np.float64)
    if env.size < x.size:
        env = np.pad(env, (0, x.size - env.size), mode="edge")
    elif env.size > x.size:
        env = env[: x.size]
    return x * env


def env_adsr(n: int, attack: float, decay: float, sustain: float, release: float,
             sr: int = SR) -> np.ndarray:
    """Classic ADSR envelope of length n samples (times in seconds, sustain 0-1).

    For shaped, gentle SFX (a moktak knock has a tiny attack + fast decay; a door
    slide has a soft attack + plateau + release). Times are clamped to fit n.
    Consumers: sfx-moktak, sfx-door-wood, sfx-brush-sign, purr grains.
    """
    n = int(n)
    if n <= 0:
        return np.zeros(0)
    a = max(0, int(attack * sr))
    d = max(0, int(decay * sr))
    r = max(0, int(release * sr))
    # shrink A/D/R proportionally if they overflow n, leaving room for sustain
    total_adr = a + d + r
    if total_adr > n:
        scale = n / max(total_adr, 1)
        a, d, r = int(a * scale), int(d * scale), int(r * scale)
    s = max(0, n - a - d - r)
    env = np.empty(n, dtype=np.float64)
    i = 0
    if a:
        env[i:i + a] = np.linspace(0.0, 1.0, a, endpoint=False)
        i += a
    if d:
        env[i:i + d] = np.linspace(1.0, sustain, d, endpoint=False)
        i += d
    if s:
        env[i:i + s] = sustain
        i += s
    if r:
        env[i:i + r] = np.linspace(sustain, 0.0, r, endpoint=True)
        i += r
    if i < n:
        env[i:] = 0.0
    return env


def env_exp_decay(n: int, t60: float, sr: int = SR) -> np.ndarray:
    """Exponential decay envelope that falls 60 dB over t60 seconds.

    The natural decay of a struck/resonant body (bell, reverb tail, drip ring).
    env[k] = 10^(-3 * k / (t60 * sr)) since -60 dB == factor 1e-3. Consumers:
    additive_bell partials, reverb tail shaping, drip resonances.
    """
    n = int(n)
    if n <= 0:
        return np.zeros(0)
    k = np.arange(n)
    return np.power(10.0, -3.0 * k / (max(t60, EPS) * sr))


def fade_io(x: np.ndarray, fade_in_s: float = 0.0, fade_out_s: float = 0.0,
            sr: int = SR) -> np.ndarray:
    """Apply raised-cosine fade-in/out (no click at the very ends).

    Used on one-shot SFX and on ambient buffers BEFORE looping (so a non-looped
    preview is clean). Consumers: most SFX, ambient preview renders.
    """
    x = np.asarray(x, dtype=np.float64).copy()
    fi = min(int(fade_in_s * sr), x.size)
    fo = min(int(fade_out_s * sr), x.size)
    if fi > 0:
        x[:fi] *= 0.5 * (1 - np.cos(np.pi * np.arange(fi) / fi))
    if fo > 0:
        x[-fo:] *= 0.5 * (1 + np.cos(np.pi * np.arange(fo) / fo))
    return x


# ── Reverb (Schroeder: 4 parallel combs + 2 series allpass) ──────────────────


def _comb(x: np.ndarray, delay_s: float, t60: float, sr: int) -> np.ndarray:
    """One feedback comb filter: y[n] = x[n] + g*y[n-D], g set from t60. Internal."""
    d = max(1, int(delay_s * sr))
    # feedback gain so the comb's own energy decays by 60 dB in t60 seconds
    g = float(10.0 ** (-3.0 * d / (max(t60, EPS) * sr)))
    g = min(g, 0.998)
    y = np.zeros(x.size, dtype=np.float64)
    buf = np.zeros(d, dtype=np.float64)
    idx = 0
    for n in range(x.size):
        out = x[n] + g * buf[idx]
        buf[idx] = out
        y[n] = out
        idx += 1
        if idx >= d:
            idx = 0
    return y


def _allpass(x: np.ndarray, delay_s: float, g: float, sr: int) -> np.ndarray:
    """One Schroeder allpass: diffuses without coloring. Internal to reverb()."""
    d = max(1, int(delay_s * sr))
    y = np.zeros(x.size, dtype=np.float64)
    buf = np.zeros(d, dtype=np.float64)
    idx = 0
    for n in range(x.size):
        bufout = buf[idx]
        inp = x[n] + (-g) * bufout
        buf[idx] = inp
        y[n] = bufout + g * inp
        idx += 1
        if idx >= d:
            idx = 0
    return y


def reverb(x: np.ndarray, decay_t60: float = 2.5, mix: float = 0.35,
           sr: int = SR, tail_s: float | None = None) -> np.ndarray:
    """Schroeder reverb (4 parallel combs -> 2 series allpass), musical + cheap.

    A small but real reverb so the bell's 여음 blooms in a stone-and-wood
    pavilion rather than ringing dry, and so drips/knocks sit in a space. The
    comb delays are mutually-prime-ish (29.7/37.1/41.1/43.7 ms) to avoid a metallic
    ring; allpasses (5/1.7 ms) diffuse. `decay_t60` sets the tail length, `mix`
    the wet/dry blend. If `tail_s` is given the input is zero-padded so the tail
    can ring out past the dry signal. Consumers: additive_bell (여음),
    sfx-rain-stop, sfx-moktak (faint room), ambient color (light send).
    """
    x = np.asarray(x, dtype=np.float64)
    if tail_s:
        x = np.concatenate([x, np.zeros(int(tail_s * sr))])
    comb_delays = (0.0297, 0.0371, 0.0411, 0.0437)
    wet = np.zeros(x.size, dtype=np.float64)
    for d in comb_delays:
        wet += _comb(x, d, decay_t60, sr)
    wet /= len(comb_delays)
    wet = _allpass(wet, 0.0050, 0.7, sr)
    wet = _allpass(wet, 0.0017, 0.7, sr)
    # gentle low-pass on the wet path: real rooms lose highs in the tail
    wet = lowpass(wet, 6500.0, order=2, sr=sr)
    return (1.0 - mix) * x + mix * wet


# ── The bell (범종) — THE asset ───────────────────────────────────────────────


# Inharmonic partial ratios for a large Korean bronze bell, roughly after the
# measured modal structure of 범종 (hum tone + strike + a stretched series).
# Ratio, relative amplitude. The hum (1.0) and prime (~2.0) carry the body; the
# upper inharmonic partials give the bronze shimmer and die away faster.
BELL_PARTIALS = (
    (1.00, 1.00),   # hum tone (가장 낮은 모드, longest 여음)
    (2.00, 0.80),   # prime / strike tone
    (2.40, 0.55),   # minor-third-ish inharmonic (the bronze 'sigh')
    (3.01, 0.42),
    (4.18, 0.30),
    (5.43, 0.22),
    (6.79, 0.16),
    (8.21, 0.11),
)


def additive_bell(f0: float = 92.0, partials=BELL_PARTIALS, decay_t60: float = 9.0,
                  beat_hz: float = 1.1, sr: int = SR, dur_s: float | None = None,
                  gen: np.random.Generator | None = None) -> np.ndarray:
    """Korean 범종 bell by additive synthesis: inharmonic partials, beating pair,

    long exponential 여음, bright strike transient.

    - f0: the hum-tone frequency (~70-110 Hz for a big temple bell).
    - partials: (ratio, amp) pairs; each is an exponentially-decaying sine, with
      higher partials decaying FASTER (bright at the strike, dark in the tail).
    - beat_hz: the 맥놀이 (maeknori) beat — the lowest partial is split into a
      detuned pair so the bell slowly throbs (the signature 'breathing' of a
      Korean bell, set by casting asymmetry). A small, slow beat.
    - a short bright strike transient (filtered noise burst) sits on top of the
      attack so the onset reads as a struck bronze surface, then clears to let
      the partials ring.

    Returns a long mono buffer (default duration = decay_t60 + 1.5 s so the tail
    is captured). NOT normalized — the writer normalizes. Consumers: sfx-bell-toll.
    """
    if dur_s is None:
        dur_s = decay_t60 + 1.5
    n = int(dur_s * sr)
    t = np.arange(n) / sr
    out = np.zeros(n, dtype=np.float64)

    for i, (ratio, amp) in enumerate(partials):
        f = f0 * ratio
        # higher partials ring shorter: scale t60 down with partial index
        p_t60 = decay_t60 * (0.95 ** i) / (1.0 + 0.18 * i)
        env = env_exp_decay(n, p_t60, sr)
        if i == 0:
            # the 맥놀이 beat: split the hum into a detuned pair -> slow amplitude
            # throb at beat_hz. Two near-equal sines a few cents apart.
            df = beat_hz / 2.0
            out += amp * env * (np.sin(2 * np.pi * (f - df) * t)
                                + np.sin(2 * np.pi * (f + df) * t)) * 0.5
        else:
            # tiny per-partial phase so partials don't all start in lockstep
            phase = (i * 0.7) % (2 * np.pi)
            out += amp * env * np.sin(2 * np.pi * f * t + phase)

    # bright strike transient: a short filtered-noise 'tok' on the attack
    g = gen if gen is not None else rng(20492)
    strike_n = int(0.06 * sr)
    strike = white_noise(strike_n, g, amp=1.0)
    strike = bandpass(strike, 1800.0, 7000.0, order=2, sr=sr)
    strike *= env_exp_decay(strike_n, 0.05, sr)
    out[:strike_n] += 0.5 * strike

    # a soft low thud at the very onset (the mass moving) — quick and dark
    thud_n = int(0.12 * sr)
    thud = np.sin(2 * np.pi * (f0 * 0.5) * t[:thud_n]) * env_exp_decay(thud_n, 0.10, sr)
    out[:thud_n] += 0.25 * thud

    # gentle overall body low-pass: bronze is dark; keep the shimmer but no fizz
    out = lowpass(out, 9000.0, order=2, sr=sr)
    return out


# ── Seamless looping ─────────────────────────────────────────────────────────


def seamless_loop(x: np.ndarray, crossfade_s: float = 1.0, sr: int = SR) -> np.ndarray:
    """Make a buffer loop with no click by equal-power crossfading tail over head.

    Takes the last `crossfade_s` of the buffer and mixes it (equal-power, so the
    energy stays constant through the splice) over the first `crossfade_s`, then
    DROPS that tail. The returned buffer is shorter by crossfade_s and is designed
    to be played end-to-start forever: its first samples already contain the
    energy that used to be at its end, so x[0] ~ x[-1] and the spectrum is
    continuous across the seam. Verify with loop_seam_discontinuity(). Consumers:
    all 5 ambient loops, sfx-cat-purr (loopable).
    """
    x = np.asarray(x, dtype=np.float64)
    cf = int(crossfade_s * sr)
    if cf <= 0 or x.size <= 2 * cf:
        return x.astype(np.float64)
    head = x[:cf].copy()
    tail = x[-cf:].copy()
    body = x[cf:-cf]
    # equal-power (constant-energy) crossfade weights
    th = np.linspace(0.0, np.pi / 2.0, cf)
    fade_in = np.sin(th)   # rises for the head
    fade_out = np.cos(th)  # falls for the incoming tail
    blended = head * fade_in + tail * fade_out
    return np.concatenate([blended, body]).astype(np.float64)


# ── Convenience: a full QA report for one buffer ─────────────────────────────


def analyze(x: np.ndarray, sr: int = SR) -> dict:
    """Return a dict of every QA metric for a buffer — the one-call self-check.

    Keys: dur_s, peak_dbfs, rms_dbfs, centroid_hz, bandwidth_hz, t60_s,
    loop_seam. Every writer prints this after writing + reading back its file.
    """
    return {
        "dur_s": round(duration_s(x, sr), 3),
        "peak_dbfs": round(peak_dbfs(x), 2),
        "rms_dbfs": round(rms_dbfs(x), 2),
        "centroid_hz": round(spectral_centroid(x, sr), 1),
        "bandwidth_hz": round(spectral_bandwidth(x, sr), 1),
        "t60_s": round(est_t60(x, sr), 3),
        "loop_seam": round(loop_seam_discontinuity(x), 4),
    }
