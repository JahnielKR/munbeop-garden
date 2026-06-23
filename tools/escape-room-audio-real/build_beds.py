#!/usr/bin/env python3
"""Build the escape-room AMBIENT BEDS from real CC0/PD field recordings.

Replaces the 9 procedural DSP ambient loops (the "bastante malo" background) with
real recordings, edited into seamless loops, written as mono 44.1k OGG/Vorbis IN
PLACE (same filenames -> no app/seed/wiring change).

Sources: Wikimedia Commons PUBLIC-DOMAIN field recordings (no attribution, no
share-alike) fetched on demand; decoded via a pip-bundled ffmpeg (imageio-ffmpeg)
so Opus-in-Ogg sources work too. Local Pixabay drops (tools/.../drop/<name>.*) are
used when present (the hard ambiences with no CC0 source, e.g. the griddle).

Each bed: pick a clean window -> optional band-limit (scipy) -> mix layers ->
RMS-normalise (peak-guarded, no clip) -> equal-power crossfade loop (seamless by
construction) -> OGG. Provenance written to SOURCES.md.

CANNOT LISTEN here: judged by DSP metrics; the OWNER auditions every bed.

Run from the repo root:  python tools/escape-room-audio-real/build_beds.py
"""
from __future__ import annotations
import json, os, re, subprocess, urllib.parse, urllib.request
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
import imageio_ffmpeg

SR = 44100
HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
CACHE = HERE / "out"; CACHE.mkdir(parents=True, exist_ok=True)
DROP = HERE / "drop"; DROP.mkdir(parents=True, exist_ok=True)
L2 = REPO / "munbeop/public/escape-room/level-02/audio"
L3 = REPO / "munbeop/public/escape-room/level-03/audio"
FF = imageio_ffmpeg.get_ffmpeg_exe()
UA = {"User-Agent": "munbeop-escape-room/1.0 (educational; koreadesconocido@gmail.com)"}
API = "https://commons.wikimedia.org/w/api.php"


# ── sourcing ──────────────────────────────────────────────────────────────────
def _get(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()

def wm_fetch(title: str):
    """Resolve a Commons File: title -> (cached path, license, artist). Cached."""
    q = (API + "?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles="
         + urllib.parse.quote(title))
    ii = list(json.loads(_get(q))["query"]["pages"].values())[0]["imageinfo"][0]
    url = ii["url"]; em = ii["extmetadata"]
    lic = em.get("LicenseShortName", {}).get("value", "?")
    art = re.sub("<[^>]+>", "", em.get("Artist", {}).get("value", "?"))[:40].strip()
    dst = CACHE / ("_src_" + re.sub(r"[^A-Za-z0-9._-]", "_", os.path.basename(url)))
    if not dst.exists():
        dst.write_bytes(_get(url))
    return dst, lic, art, url

def decode(path: Path) -> np.ndarray:
    """Any format -> mono float64 @ 44.1k, via bundled ffmpeg -> wav -> soundfile."""
    wav = Path(str(path) + ".44k.wav")
    if not wav.exists():
        subprocess.run([FF, "-y", "-i", str(path), "-ar", str(SR), "-ac", "1", str(wav)],
                       capture_output=True, check=True)
    x, _ = sf.read(wav, dtype="float64")
    return x if x.ndim == 1 else x.mean(axis=1)


# ── DSP ───────────────────────────────────────────────────────────────────────
def lp(x, fc):
    return sosfilt(butter(4, fc / (SR / 2), btype="low", output="sos"), x)

def hp(x, fc):
    return sosfilt(butter(2, fc / (SR / 2), btype="high", output="sos"), x)

def win(x, start_s, dur_s):
    a = int(start_s * SR); b = a + int(dur_s * SR)
    if b > len(x):                       # tile if the source is shorter than asked
        x = np.tile(x, int(np.ceil(b / len(x))))
    return x[a:b].copy()

def mix(*layers):
    n = min(len(l) for l in layers)
    return np.sum([l[:n] for l in layers], axis=0)

def hum(dur_s, f0=120.0, level=0.05):
    """A faint deterministic mains-style hum (f0 + a couple of harmonics)."""
    t = np.arange(int(dur_s * SR)) / SR
    return level * (np.sin(2*np.pi*f0*t) + 0.4*np.sin(2*np.pi*2*f0*t)
                    + 0.2*np.sin(2*np.pi*3*f0*t))

def norm(x, rms_db=-22.0, peak_db=-1.5):
    x = x - np.mean(x)
    rms = np.sqrt(np.mean(x**2))
    if rms > 1e-9:
        x = x * (10**(rms_db/20) / rms)
    pk = np.max(np.abs(x)); ceil = 10**(peak_db/20)
    if pk > ceil:
        x = x * (ceil / pk)
    return x

def loop(seg, xf_s=0.9):
    """Equal-power crossfade loop: the wrap point is a natural sample boundary, the
    blended head hides the splice -> x[-1]->x[0] is seamless."""
    xf = int(xf_s * SR)
    t = np.linspace(0, 1, xf); fi = np.sin(0.5*np.pi*t); fo = np.cos(0.5*np.pi*t)
    out = seg[:-xf].copy()
    out[:xf] = out[:xf]*fi + seg[-xf:]*fo
    return out


def encode_ogg(seg, out_path):
    """Encode via ffmpeg's libvorbis (robust). soundfile's OWN OGG encoder crashes
    the process after a few writes on Windows, so we write a temp WAV with
    soundfile (rock-solid) and let ffmpeg do the Vorbis encode."""
    tmp = str(out_path) + ".tmp.wav"
    sf.write(tmp, seg, SR, subtype="PCM_16")
    subprocess.run([FF, "-y", "-i", tmp, "-c:a", "libvorbis", "-qscale:a", "5",
                    str(out_path)], capture_output=True, check=True)
    os.remove(tmp)


# ── source layers (lazy so we only fetch what a built bed needs) ──────────────
_SRC = {
    "rain":   "File:Rain (1).ogg",                       # PD, gentle rain ~45s
    "thunder":"File:Rain and thunder.ogg",               # PD, rain+thunder ~19s
    "birds":  "File:Gentle breeze and birds singing.ogg",# PD, breeze+birds ~32s
    "city":   "File:Sunday in the city street noise1.ogg",# PD, street/traffic
    "market": "File:Flea market in the rain.ogg",        # PD, market crowd/voices
}
_cache = {}; PROV = {}
def src(key):
    if key not in _cache:
        path, lic, art, url = wm_fetch(_SRC[key])
        PROV[key] = (_SRC[key], lic, art, url)
        _cache[key] = decode(path)
    return _cache[key]


# ── the beds (build a float array per name) ───────────────────────────────────
def build():
    beds = {}
    # ---- L2: rain temple (5) ----
    beds[(L2, "ambient-dasil.ogg", -22)]      = lambda: win(src("rain"), 3, 16)            # warm full rain
    beds[(L2, "ambient-daeungjeon.ogg", -22)] = lambda: lp(win(src("rain"), 6, 16), 850)   # muffled/darkest
    beds[(L2, "ambient-seungbang.ogg", -23)]  = lambda: lp(win(src("rain"), 9, 14), 2200)  # intimate
    beds[(L2, "ambient-jongnu.ogg", -22)]     = lambda: mix(win(src("rain"), 2, 18),       # open + wind
                                                            0.5*hp(win(src("birds"), 1, 18), 200))
    beds[(L2, "ambient-jongnu-clear.ogg", -30)] = lambda: hp(win(src("birds"), 4, 16), 300) # post-rain: birds, quiet
    # ---- L3: night market (3 + hum) ----
    beds[(L3, "ambient-meokja.ogg", -22)]     = lambda: win(src("market"), 2, 12)          # loud alley: crowd
    beds[(L3, "ambient-manmulsang.ogg", -24)] = lambda: mix(lp(win(src("market"), 5, 12), 1100),  # muffled market
                                                            hum(12, 120, 0.06))            # + bulb hum
    beds[(L3, "ambient-busstop.ogg", -22)]    = lambda: win(src("city"), 2, 12)            # traffic/street
    # ---- L3 hotteok: needs a griddle sizzle (no CC0) -> Pixabay drop ----
    # build only if the owner dropped a griddle clip; else leave the procedural OGG.
    drop = sorted(list(DROP.glob("griddle.*")) + list(DROP.glob("hotteok.*")))
    if drop:
        beds[(L3, "ambient-hotteok.ogg", -22)] = lambda d=drop[0]: mix(
            win(decode(d), 0, 12), 0.4*lp(win(src("market"), 8, 12), 1600))  # griddle + far crowd
    return beds, bool(drop)


def main():
    beds, has_griddle = build()
    # Pre-decode ALL sources up front (all ffmpeg subprocess calls happen here,
    # before any OGG is written) — interleaving ffmpeg with sf.write was crashing
    # the process on Windows (handle conflict). After this, the write loop is pure
    # numpy/scipy/soundfile with no subprocess.
    for k in list(_SRC):
        src(k)
        print("decoded source:", k, flush=True)
    for (lvl, name, rms_db), fn in beds.items():
        seg = loop(norm(fn(), rms_db)).astype(np.float32)
        encode_ogg(seg, lvl / name)
        # metrics from the in-memory buffer (the encoded file = these samples)
        interior = float(np.mean(np.abs(np.diff(seg)))) + 1e-9
        seam = abs(float(seg[0]) - float(seg[-1])) / interior
        r = 20*np.log10(max(np.sqrt(np.mean(seg**2)), 1e-9))
        p = 20*np.log10(max(np.max(np.abs(seg)), 1e-9))
        ok = p <= -0.5 and not np.any(np.abs(seg) >= 0.999) and seam < 3.0
        print("%s %-26s %5.1fs rms %6.1f peak %6.1f seam/step %.2f"
              % ("OK " if ok else "BAD", name, len(seg)/SR, r, p, seam), flush=True)
    print("\nhotteok built from a griddle drop:", has_griddle,
          "(else procedural OGG left untouched — drop griddle.* in tools/escape-room-audio-real/drop/)",
          flush=True)
    write_sources()
    print("SOURCES.md written; done.", flush=True)


def write_sources():
    lines = ["# Audio bed sources (real CC0/PD field recordings)\n",
             "Replaces the 9 procedural ambient beds. Built by `build_beds.py`.\n",
             "All Wikimedia sources below are **Public Domain** (no attribution / no share-alike).\n"]
    for key, (title, lic, art, url) in sorted(PROV.items()):
        lines.append(f"- **{key}** — [{title}]({url}) · {lic} · {art}")
    lines.append("\nThe manmulsang bed adds a faint deterministic synth hum (no source needed).")
    lines.append("The hotteok griddle has no CC0 source — drop a Pixabay clip in `drop/griddle.*` and re-run.")
    (HERE / "SOURCES.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
