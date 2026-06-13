#!/usr/bin/env python3
"""Generate the 3 generic UI SFX for the Level-2 escape room.

These are the answer-feedback sounds the EscapeRoom flow needs but that the
narrative SFX batch (gen_sfx.py) does not cover:

  - sfx-correct.ogg  a short, pleasant 2-note rising bright chime/bell (success)
  - sfx-wrong.ogg     a soft, low, muted thunk/buzz (NOT harsh) — a gentle "no"
  - sfx-select.ogg    a tiny soft wooden tick (opening a puzzle)

Tone: this level is serene melancholy ("El jardín de las palabras" × "Mushishi").
Even the failure sound must stay gentle — low, soft-knee, low-passed, no sharp
high transient. Everything is short (< 0.6 s), mono, 44.1 kHz OGG/Vorbis, written
through common.write_ogg (peak-normalized, hard-guarded → no clipping).

DETERMINISTIC: one SEED drives every procedural choice (see common.rng). Re-running
yields the same float buffer (Vorbis is lossy but the input buffer is identical).

Run from the repo root:  python tools/escape-room-level02-audio/gen_ui_sfx.py
"""

from __future__ import annotations

import sys

import numpy as np

import common as c

# Windows consoles default to cp1252; force UTF-8 so the QA report prints cleanly.
try:  # pragma: no cover - environment dependent
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SEED = 31077  # one seed for the whole UI-SFX batch; per-effect offsets below
S_CORRECT, S_WRONG, S_SELECT = range(3)


# ── sfx-correct.ogg — two-note rising bright chime ───────────────────────────


def make_correct() -> np.ndarray:
    """A gentle success chime: two short bell-ish notes rising a perfect fifth.

    Each note is a small additive stack (fundamental + a couple of soft upper
    partials) with a fast attack and an exponential decay, low-passed so it
    glows rather than pings. The second note starts a beat after the first and
    rings on into a short reverb tail. Bright but soft — the one happy sound in
    a serene level. ~0.55 s.
    """
    note_dur = 0.42
    gap = 0.12
    n_note = int(note_dur * c.SR)
    total = int((gap + note_dur) * c.SR) + int(0.05 * c.SR)
    out = np.zeros(total, dtype=np.float64)

    # Perfect fifth, mid-high register (A5 → E6) — bright but not shrill.
    freqs = (880.0, 1318.5)
    # Soft bell-ish partials: fundamental strong, a couple of quiet overtones.
    partials = ((1.0, 1.0), (2.0, 0.35), (3.0, 0.16))

    for k, f0 in enumerate(freqs):
        start = int(k * gap * c.SR)
        t = np.arange(n_note) / c.SR
        note = np.zeros(n_note, dtype=np.float64)
        for ratio, amp in partials:
            # higher partials decay faster → a warm, rounded chime
            t60 = 0.30 / (1.0 + 0.6 * (ratio - 1.0))
            note += amp * np.sin(2 * np.pi * f0 * ratio * t) * c.env_exp_decay(n_note, t60)
        # tiny soft attack so the onset doesn't click
        note *= c.env_adsr(n_note, attack=0.004, decay=0.0, sustain=1.0, release=0.0)
        out[start:start + n_note] += note

    out = c.lowpass(out, 6000.0, order=2)         # glow, no glassy fizz
    out = c.reverb(out, decay_t60=1.2, mix=0.18)  # a breath of room
    out = c.fade_io(out, fade_in_s=0.002, fade_out_s=0.06)
    return out


# ── sfx-wrong.ogg — soft low muted thunk ─────────────────────────────────────


def make_wrong() -> np.ndarray:
    """A gentle "no": a low, muted, slightly buzzy thunk. NOT a harsh buzzer.

    Two low sine modes (a minor-second apart so they beat faintly = a soft
    "unh") with a fast decay, a touch of low-passed noise body for the thunk,
    and a heavy low-pass so nothing bright survives. Short and quiet-feeling.
    ~0.35 s.
    """
    g = c.rng(SEED + S_WRONG)
    dur = 0.35
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR

    # Low body: two close low tones → a slow beat ("the gentle wrong sigh").
    body = (np.sin(2 * np.pi * 150.0 * t) + 0.7 * np.sin(2 * np.pi * 159.0 * t))
    body *= c.env_exp_decay(n, 0.14)
    # A short low-passed noise "thunk" for the soft impact, not a click.
    thunk = c.white_noise(n, g, amp=1.0)
    thunk = c.lowpass(thunk, 320.0, order=2)
    thunk *= c.env_exp_decay(n, 0.05)
    out = body + 0.5 * thunk
    out = c.lowpass(out, 800.0, order=3)  # muted: kill everything bright
    out = c.fade_io(out, fade_in_s=0.004, fade_out_s=0.05)
    return out


# ── sfx-select.ogg — tiny soft wooden tick ───────────────────────────────────


def make_select() -> np.ndarray:
    """A tiny soft wooden tick — opening a puzzle / a quiet UI confirm.

    One short mid wood mode + a faint band-limited click, near-instant decay,
    low-passed so it's a soft "tok", not a sharp snap. Very short. ~0.10 s.
    """
    g = c.rng(SEED + S_SELECT)
    dur = 0.10
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR
    # A single hollow wood mode with an almost-instant decay.
    tick = np.sin(2 * np.pi * 520.0 * t) * c.env_exp_decay(n, 0.02)
    # A whisper of band-limited noise gives it a woody (not pure-tone) edge.
    click = c.white_noise(n, g, amp=0.5)
    click = c.bandpass(click, 700.0, 2200.0, order=2)
    click *= c.env_exp_decay(n, 0.008)
    out = tick + 0.4 * click
    out = c.lowpass(out, 4000.0, order=2)  # soft, no snap
    out = c.fade_io(out, fade_in_s=0.0, fade_out_s=0.012)
    return out


# ── Batch driver + verification (we cannot listen — we measure) ──────────────

SFX = [
    ("sfx-correct.ogg", make_correct),
    ("sfx-wrong.ogg", make_wrong),
    ("sfx-select.ogg", make_select),
]


def main() -> int:
    print(f"Level-2 UI SFX → {c.AUDIO_DIR}\n")
    failures = 0
    for name, build in SFX:
        buf = build()
        c.write_ogg(name, buf)  # peak-normalize to -1 dBFS + hard guard
        x, sr = c.read_ogg(name)
        m = c.analyze(x, sr)
        ok = True
        notes = []
        if sr != c.SR:
            ok = False
            notes.append(f"sr={sr}")
        # No clipping (peak strictly below 0 dBFS) and audible.
        if m["peak_dbfs"] > -0.5:
            ok = False
            notes.append("peak too hot / clipping")
        if m["peak_dbfs"] < -6.0:
            ok = False
            notes.append("peak too quiet")
        # All three must stay short and gentle.
        if m["dur_s"] >= 0.6:
            ok = False
            notes.append(f"dur {m['dur_s']} ≥ 0.6")
        # The "wrong" sound must read dark (low centroid); the chime brighter.
        if name == "sfx-wrong.ogg" and m["centroid_hz"] > 600.0:
            ok = False
            notes.append(f"wrong too bright ({round(m['centroid_hz'])}Hz)")
        if name == "sfx-correct.ogg" and m["centroid_hz"] < 600.0:
            ok = False
            notes.append(f"correct too dull ({round(m['centroid_hz'])}Hz)")
        flag = "OK " if ok else "FAIL"
        if not ok:
            failures += 1
        extra = ("  " + " ".join(notes)) if notes else ""
        print(f"[{flag}] {name:18s} {m}{extra}")
    print(f"\n{len(SFX) - failures}/{len(SFX)} OK")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
