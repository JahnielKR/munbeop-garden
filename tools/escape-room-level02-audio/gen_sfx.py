#!/usr/bin/env python3
"""Generate the 8 Level-2 SFX for "El templo de la lluvia (청우사)".

Each effect is composed from the shared DSP toolkit in common.py. One SEED drives
every procedural choice so re-running is deterministic. Every file is written via
write_ogg (mono 44.1k OGG/Vorbis, peak ≈ -1 dBFS, hard-guarded) and then read back
and analyzed — we cannot listen, so we measure.

Run from the repo root:  python tools/escape-room-level02-audio/gen_sfx.py
"""

from __future__ import annotations

import sys

import numpy as np

import common as c

# Windows consoles default to cp1252; force UTF-8 so arrows/Korean in the QA
# report don't crash the print. No effect on the audio buffers themselves.
try:  # pragma: no cover - environment dependent
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SEED = 20492  # one seed for the whole SFX batch; per-effect offsets below

# Per-effect seed offsets so each generator gets an independent, stable stream.
S_BELL, S_MOKTAK, S_TEA, S_PAGE, S_BRUSH, S_DOOR, S_RAIN, S_PURR = range(8)


# ── sfx-bell-toll.ogg — THE hero (범종) ───────────────────────────────────────


def make_bell() -> np.ndarray:
    """범종: bright bronze strike → long beating 여음.

    Requirements: t60 ≥ 8 s, dur ≥ 10 s, AND audible energy still clearly above the
    noise floor at 8 s. additive_bell peaks hard on the strike transient, so a naive
    peak-normalize crushes the long hum tail down toward the floor. We give the bell
    a long decay (so the hum survives) and tame the first ~120 ms onset peak with a
    soft-knee so peak-normalization is set by the singing body, not the click — that
    lifts the whole 여음 several dB and keeps it alive at 8 s.
    """
    g = c.rng(SEED + S_BELL)
    # Low hum (~84 Hz), long decay so the body still rings at 8 s. additive_bell
    # renders strike + 맥놀이 detuned pair + low thud.
    body = c.additive_bell(
        f0=84.0, decay_t60=15.0, beat_hz=1.0, dur_s=11.5, gen=g
    )
    # Tame the onset peak: soft-clip just the attack window so the bright strike
    # doesn't dominate the later peak-normalize (which would bury the tail).
    onset = int(0.12 * c.SR)
    body_rms = float(np.sqrt(np.mean(body[onset:onset + c.SR] ** 2)))
    knee = body_rms * 9.0  # well above the sustained body, only catches the click
    head = body[:onset]
    body[:onset] = np.tanh(head / knee) * knee
    # Bronze blooms in a stone-and-wood pavilion. tail_s lets the 여음 ring past dry.
    wet = c.reverb(body, decay_t60=2.6, mix=0.30, tail_s=1.2)
    # Soft fade-out at the very tail only (no fade-in: the strike is the onset).
    wet = c.fade_io(wet, fade_in_s=0.0, fade_out_s=0.4)
    return wet


# ── sfx-moktak.ogg — dry wooden-fish knock ───────────────────────────────────


def make_moktak() -> np.ndarray:
    """목탁: a dry woody 'tok' — two damped wood modes + a filtered click. ~0.25 s."""
    g = c.rng(SEED + S_MOKTAK)
    dur = 0.25
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR
    out = np.zeros(n)
    # Two short wood modes (hollow body): near-instant attack, fast decay.
    for f0, amp, t60 in ((310.0, 1.0, 0.09), (920.0, 0.5, 0.05)):
        env = c.env_adsr(n, attack=0.001, decay=t60, sustain=0.0, release=0.0)
        out += amp * env * np.sin(2 * np.pi * f0 * t)
    # A touch of filtered-noise click for the wooden 'tok' transient.
    click = c.white_noise(n, g, amp=0.5)
    click = c.bandpass(click, 1200.0, 4500.0, order=2)
    click *= c.env_exp_decay(n, 0.012)
    out += 0.35 * click
    out = c.fade_io(out, fade_in_s=0.0, fade_out_s=0.02)
    return out


# ── sfx-tea-pour.ogg — filtered stream + glugs ───────────────────────────────


def make_tea_pour() -> np.ndarray:
    """Tea pour: a bandpassed noise stream with amplitude wobble, then rising glugs
    as the cup fills. ~3 s, warm and domestic."""
    g = c.rng(SEED + S_TEA)
    dur = 3.0
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR
    # The stream: filtered noise (1–4 kHz) with a slow amplitude wobble + overall
    # arc (starts, sustains, eases as the cup fills).
    stream = c.white_noise(n, g, amp=1.0)
    stream = c.bandpass(stream, 1000.0, 4000.0, order=2)
    wobble = 1.0 + 0.30 * np.sin(2 * np.pi * 6.0 * t + 0.4 * np.sin(2 * np.pi * 1.7 * t))
    arc = c.env_adsr(n, attack=0.18, decay=0.4, sustain=0.85, release=0.7)
    stream *= wobble * arc * 0.6
    out = stream.copy()
    # Filling glugs near the end: a few bubble resonances that RISE in pitch as the
    # cup tops out (the water column shortens). Band 200–700 Hz, short exp decay.
    glug_times = np.linspace(2.0, 2.85, 6)
    glug_freqs = np.linspace(230.0, 560.0, 6)  # rising = cup filling
    for tg, fg in zip(glug_times, glug_freqs):
        i0 = int(tg * c.SR)
        gn = int(0.10 * c.SR)
        if i0 + gn > n:
            gn = n - i0
        tt = np.arange(gn) / c.SR
        # tiny upward chirp within each glug for the 'bloop'
        ph = 2 * np.pi * (fg * tt + 40.0 * tt * tt)
        grain = np.sin(ph) * c.env_exp_decay(gn, 0.05)
        out[i0:i0 + gn] += 0.45 * grain
    out = c.bandpass(out, 150.0, 6000.0, order=2)  # tame extremes
    out = c.fade_io(out, fade_in_s=0.05, fade_out_s=0.15)
    return out


# ── sfx-paper-page.ogg — page turn ───────────────────────────────────────────


def make_paper_page() -> np.ndarray:
    """Page turn: HF noise transient with a quick crinkle envelope (two sub-events:
    the lift/swish + the settle). Hanji, not cardboard. ~0.5 s."""
    g = c.rng(SEED + S_PAGE)
    dur = 0.5
    n = int(dur * c.SR)
    noise = c.white_noise(n, g, amp=1.0)
    noise = c.highpass(noise, 2200.0, order=2)
    # Crinkle envelope: a swish (fast rise/fall) then a small settle tap.
    env = np.zeros(n)
    swish = c.env_adsr(int(0.22 * c.SR), attack=0.02, decay=0.18, sustain=0.0,
                       release=0.0)
    env[:swish.size] += swish
    settle = c.env_exp_decay(int(0.10 * c.SR), 0.04)
    s0 = int(0.30 * c.SR)
    env[s0:s0 + settle.size] += 0.6 * settle[: n - s0]
    # Fine amplitude texture so it reads as fibrous paper, not a flat hiss.
    tex = 1.0 + 0.5 * c.white_noise(n, g, amp=1.0)
    out = noise * env * tex
    out = c.fade_io(out, fade_in_s=0.003, fade_out_s=0.03)
    return out


# ── sfx-brush-sign.ogg — brush scrape (the signature) ────────────────────────


def make_brush_sign() -> np.ndarray:
    """Brush on hanji: a soft LF-modulated noise scrape shaped by a pressure
    envelope (rise–peak–fall, one stroke). Gentle, intimate. ~0.8 s."""
    g = c.rng(SEED + S_BRUSH)
    dur = 0.8
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR
    scrape = c.white_noise(n, g, amp=1.0)
    scrape = c.bandpass(scrape, 1500.0, 6000.0, order=2)
    # Pressure envelope: a single stroke that swells then releases (peak ~45%).
    press = c.env_adsr(n, attack=0.30, decay=0.18, sustain=0.55, release=0.30)
    # Slow LF amplitude modulation = the brush dragging across the fibers.
    lfo = 0.7 + 0.3 * np.sin(2 * np.pi * 7.0 * t)
    out = scrape * press * lfo * 0.8
    out = c.lowpass(out, 7000.0, order=2)  # soft, no fizz
    out = c.fade_io(out, fade_in_s=0.02, fade_out_s=0.05)
    return out


# ── sfx-door-wood.ogg — sliding 창호 door ────────────────────────────────────


def make_door_wood() -> np.ndarray:
    """Sliding wooden door (창호): a soft rail-slide rumble + a low woody thunk at
    the stop. Hanok, not a horror creak. ~0.7 s."""
    g = c.rng(SEED + S_DOOR)
    dur = 0.7
    n = int(dur * c.SR)
    # Rail slide: bandpassed noise (300–1500 Hz) with a soft attack/plateau/release.
    slide = c.white_noise(n, g, amp=1.0)
    slide = c.bandpass(slide, 300.0, 1500.0, order=2)
    slide *= c.env_adsr(n, attack=0.10, decay=0.10, sustain=0.6, release=0.20) * 0.55
    out = slide.copy()
    # Low slide-rumble body under it (the heavy frame moving).
    rumble = c.brown_noise(n, g, amp=1.0)
    rumble = c.lowpass(rumble, 220.0, order=2)
    out += 0.4 * rumble * c.env_adsr(n, attack=0.08, decay=0.1, sustain=0.5,
                                     release=0.25)
    # The 'tonk' at the end: a short low wood mode when the door meets the jamb.
    tonk_n = int(0.14 * c.SR)
    t = np.arange(tonk_n) / c.SR
    tonk = (np.sin(2 * np.pi * 140.0 * t) + 0.4 * np.sin(2 * np.pi * 320.0 * t))
    tonk *= c.env_exp_decay(tonk_n, 0.08)
    i0 = n - tonk_n
    out[i0:] += 0.7 * tonk
    out = c.fade_io(out, fade_in_s=0.02, fade_out_s=0.02)
    return out


# ── sfx-rain-stop.ogg — 3-phase rain decay ───────────────────────────────────


def make_rain_stop() -> np.ndarray:
    """The climax: rain dies by phases. Phase 1 full 'curtain' → phase 2 thinner
    'threads' → phase 3 sparse 'drops' → near-silence. ~11 s. RMS falls monotonic,
    centroid rises (only the high drops remain)."""
    g = c.rng(SEED + S_RAIN)
    dur = 11.0
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR

    # Phase 1 — curtain: full rain (pink + brown body), low-passed ~2.5 kHz.
    curtain = c.pink_noise(n, g, amp=1.0) + 0.6 * c.brown_noise(n, g, amp=1.0)
    curtain = c.lowpass(curtain, 2500.0, order=3)
    # Phase 2 — threads: thinner, brighter rain (less low body, a touch higher LP).
    threads = c.pink_noise(n, g, amp=1.0)
    threads = c.bandpass(threads, 600.0, 3500.0, order=2)

    # Crossfade envelopes across the timeline (curtain → threads → silence bed).
    # The whole bed loudness must only ever FALL (spec: "RMS descendente monótono").
    # curtain: full from the start, decaying away by ~6 s.
    env_curtain = np.clip(1.0 - t / 6.0, 0.0, 1.0) ** 1.2
    # threads: a thinner layer that crossfades UNDER the curtain as it leaves, but
    # always quieter than the curtain it replaces (so total energy keeps dropping).
    env_threads = np.clip((t - 1.5) / 2.5, 0.0, 1.0) * np.clip(1.0 - (t - 4.0) / 4.0,
                                                               0.0, 1.0)
    bed = curtain * env_curtain + 0.45 * threads * env_threads
    # Global descending gate guarantees monotonic loudness through the phases.
    bed *= np.clip(1.0 - t / 11.0, 0.0, 1.0) ** 0.6

    # Phase 3 — drops: sparse resonant eave-drips, getting rarer toward the end.
    # Deterministic placement; inter-drop gap widens with time (rain thinning).
    drops = np.zeros(n)
    tcur = 3.0
    while tcur < dur - 0.2:
        i0 = int(tcur * c.SR)
        dn = int(0.12 * c.SR)
        if i0 + dn > n:
            break
        tt = np.arange(dn) / c.SR
        fd = float(g.uniform(900.0, 2200.0))  # high, bright drop ring
        ring = np.sin(2 * np.pi * fd * tt) * c.env_exp_decay(dn, 0.06)
        # drops get quieter as the storm ends
        amp = 0.5 * np.clip(1.0 - (tcur - 3.0) / (dur - 3.0) * 0.6, 0.25, 1.0)
        drops[i0:i0 + dn] += amp * ring
        # widening gap: 0.25 s early → ~1.2 s late
        gap = 0.25 + 0.9 * ((tcur - 3.0) / (dur - 3.0))
        tcur += gap * float(g.uniform(0.8, 1.3))
    drops = c.highpass(drops, 600.0, order=2)

    out = bed + drops
    # Overall tail fade to near-silence so the very end settles cleanly.
    out *= np.clip(1.0 - (t - 9.5) / 1.5, 0.04, 1.0)
    out = c.reverb(out, decay_t60=2.0, mix=0.18)  # set it in the pavilion
    out = c.fade_io(out, fade_in_s=0.1, fade_out_s=0.3)
    return out


# ── sfx-cat-purr.ogg — loopable low purr ─────────────────────────────────────


def make_cat_purr() -> np.ndarray:
    """Low AM purr: a low formant body amplitude-modulated at ~27 Hz (the purr
    buzz) over a pink-noise texture. ~3 s, loopable (seamless_loop). Close, warm."""
    g = c.rng(SEED + S_PURR)
    dur = 3.0 + 1.0  # render extra; seamless_loop trims the crossfade tail
    n = int(dur * c.SR)
    t = np.arange(n) / c.SR
    # Low formant carrier: a couple of low harmonics (~55/110/165 Hz) = warm body.
    carrier = (np.sin(2 * np.pi * 55.0 * t)
               + 0.5 * np.sin(2 * np.pi * 110.0 * t)
               + 0.25 * np.sin(2 * np.pi * 165.0 * t))
    # Purr buzz: amplitude modulation at ~27 Hz (rectified so it's a pulse train).
    buzz = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * (27.0 / 2.0) * t))
    body = carrier * buzz
    # Breathy texture: low-passed pink noise, also AM'd by the buzz, very quiet.
    tex = c.pink_noise(n, g, amp=1.0)
    tex = c.lowpass(tex, 700.0, order=2)
    body += 0.25 * tex * buzz
    body = c.lowpass(body, 900.0, order=2)  # keep it low and soft
    # Make it loopable: equal-power crossfade tail over head (drops crossfade_s).
    looped = c.seamless_loop(body, crossfade_s=1.0)
    return looped


# ── Batch driver + verification ──────────────────────────────────────────────

# (filename, builder, loopable?) — every effect verified after write.
SFX = [
    ("sfx-bell-toll.ogg", make_bell, False),
    ("sfx-moktak.ogg", make_moktak, False),
    ("sfx-tea-pour.ogg", make_tea_pour, False),
    ("sfx-paper-page.ogg", make_paper_page, False),
    ("sfx-brush-sign.ogg", make_brush_sign, False),
    ("sfx-door-wood.ogg", make_door_wood, False),
    ("sfx-rain-stop.ogg", make_rain_stop, False),
    ("sfx-cat-purr.ogg", make_cat_purr, True),
]


def main() -> int:
    print(f"Level-2 SFX → {c.AUDIO_DIR}\n")
    failures = 0
    for name, build, loopable in SFX:
        buf = build()
        seam_pre = c.loop_seam_discontinuity(buf) if loopable else None
        c.write_ogg(name, buf)  # default: peak-normalize to -1 dBFS + guard
        x, sr = c.read_ogg(name)
        m = c.analyze(x, sr)
        # Pre-codec peak is exactly the -1 dBFS write target; Vorbis shifts the
        # decoded peak sample a few dB lower on short HF-transient SFX (page/brush).
        # That's a codec artifact, not a level bug: accept [-4.0, -0.5] on read-back,
        # and assert no clipping (peak < 0 dBFS).
        ok = True
        notes = []
        if sr != c.SR:
            ok = False
            notes.append(f"sr={sr}")
        if m["peak_dbfs"] > -0.5:
            ok = False
            notes.append("peak too hot / clipping")
        if m["peak_dbfs"] < -4.0:
            ok = False
            notes.append("peak too quiet")
        # Per-effect requirements from SPEC.md
        if name == "sfx-bell-toll.ogg":
            if m["dur_s"] < 10.0:
                ok = False
                notes.append(f"dur {m['dur_s']} < 10")
            if m["t60_s"] < 8.0:
                ok = False
                notes.append(f"t60 {m['t60_s']} < 8")
            # confirm the tail still has real energy at 8 s (above noise floor)
            i8 = int(8.0 * sr)
            tail_rms = c.rms_dbfs(x[i8:i8 + sr]) if x.size > i8 + sr else -120.0
            notes.append(f"tail@8s={round(tail_rms, 1)}dBFS")
            if tail_rms < -55.0:
                ok = False
                notes.append("tail@8s near floor")
        if name == "sfx-moktak.ogg" and (m["dur_s"] > 0.4 or m["t60_s"] > 0.2):
            ok = False
            notes.append("moktak too long")
        if name == "sfx-rain-stop.ogg":
            # loudness must fall monotonically; brightness (centroid) must rise as
            # only the high drops remain. Check per-2s windows (allow +1 dB jitter).
            wins = [x[k * sr:(k + 2) * sr] for k in range(0, 10, 2)]
            rmss = [c.rms_dbfs(w) for w in wins]
            cens = [c.spectral_centroid(w, sr) for w in wins]
            mono = all(rmss[i + 1] <= rmss[i] + 1.0 for i in range(len(rmss) - 1))
            rose = cens[-1] > cens[0]
            notes.append(f"RMS↓={mono} cen {round(cens[0])}→{round(cens[-1])}Hz")
            if not (mono and rose):
                ok = False
                notes.append("rain trajectory off")
        if loopable:
            notes.append(f"seam_pre={round(seam_pre, 4)}")
            if seam_pre >= 0.05:
                ok = False
                notes.append("loop seam ≥ 0.05")
        flag = "OK " if ok else "FAIL"
        if not ok:
            failures += 1
        extra = ("  " + " ".join(notes)) if notes else ""
        print(f"[{flag}] {name:22s} {m}{extra}")
    print(f"\n{len(SFX) - failures}/{len(SFX)} OK")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
