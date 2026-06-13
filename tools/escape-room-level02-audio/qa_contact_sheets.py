#!/usr/bin/env python3
"""Render spectral CONTACT SHEETS for Level-2 audio QA (PIL, no matplotlib).

For each file a tile: waveform (top strip) + log-frequency STFT spectrogram
(dB -> magma-ish colormap) + label with duration, peak, RMS. Grouped into two
sheets (ambient+sfx, voice), each <= ~2400px wide. The orchestrator views these.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont
from scipy import signal as sps

import common as c

OUT = c.OUT_DIR
OUT.mkdir(parents=True, exist_ok=True)
AUDIO = c.AUDIO_DIR
VOICE = c.VOICE_DIR

# ── tile geometry ────────────────────────────────────────────────────────────
TILE_W = 360
SPEC_H = 150
WAVE_H = 46
LABEL_H = 44
PAD = 8
TILE_H = SPEC_H + WAVE_H + LABEL_H + PAD * 2
BG = (18, 18, 22)
FG = (228, 228, 232)
DIM = (150, 150, 158)


def _font(size: int):
    for name in ("DejaVuSans.ttf", "arial.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


F_LBL = _font(13)
F_SUB = _font(11)

# magma-ish colormap (dark purple -> red -> orange -> pale yellow), 256 entries
_CMAP_ANCHORS = [
    (0.00, (0, 0, 4)),
    (0.15, (40, 11, 84)),
    (0.30, (101, 21, 110)),
    (0.45, (159, 42, 99)),
    (0.60, (212, 72, 66)),
    (0.75, (245, 125, 21)),
    (0.90, (250, 193, 39)),
    (1.00, (252, 253, 191)),
]


def _build_cmap():
    xs = np.array([a for a, _ in _CMAP_ANCHORS])
    cols = np.array([col for _, col in _CMAP_ANCHORS], dtype=np.float64)
    t = np.linspace(0, 1, 256)
    out = np.zeros((256, 3), dtype=np.uint8)
    for ch in range(3):
        out[:, ch] = np.clip(np.interp(t, xs, cols[:, ch]), 0, 255).astype(np.uint8)
    return out


CMAP = _build_cmap()


def log_spectrogram(x, sr, out_w, out_h, fmin=40.0, fmax=16000.0):
    """STFT -> log-frequency, dB-scaled magnitude image (out_h x out_w uint8 idx)."""
    n = x.size
    nperseg = min(2048, max(256, n // 4))
    nperseg = int(2 ** round(np.log2(max(nperseg, 256))))
    noverlap = nperseg * 3 // 4
    f, t, Z = sps.stft(x, fs=sr, nperseg=nperseg, noverlap=noverlap, boundary=None)
    mag = np.abs(Z)
    db = 20.0 * np.log10(mag + 1e-7)
    # normalize to a fixed dynamic range relative to this clip's max
    top = float(np.max(db))
    db = np.clip(db, top - 80.0, top)
    db = (db - (top - 80.0)) / 80.0  # 0..1
    # log-frequency remap of the rows
    fmax_c = min(fmax, sr / 2.0)
    f_safe = np.clip(f, 1e-6, None)
    log_targets = np.logspace(np.log10(fmin), np.log10(fmax_c), out_h)
    # for each target freq, nearest source bin
    src_idx = np.searchsorted(f_safe, log_targets)
    src_idx = np.clip(src_idx, 0, len(f) - 1)
    db_log = db[src_idx, :]           # (out_h, n_frames)
    # resample time axis to out_w
    cols = db_log.shape[1]
    if cols < 2:
        db_img = np.tile(db_log, (1, out_w))[:, :out_w]
    else:
        xi = np.linspace(0, cols - 1, out_w)
        x0 = np.floor(xi).astype(int)
        x1 = np.clip(x0 + 1, 0, cols - 1)
        frac = xi - x0
        db_img = db_log[:, x0] * (1 - frac) + db_log[:, x1] * frac
    db_img = np.flipud(db_img)        # low freq at bottom
    return (np.clip(db_img, 0, 1) * 255).astype(np.uint8)


def render_tile(path: Path, label: str, sub: str) -> Image.Image:
    tile = Image.new("RGB", (TILE_W, TILE_H), BG)
    d = ImageDraw.Draw(tile)
    x, sr = sf.read(str(path), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = x.astype(np.float64)
    inner_w = TILE_W - PAD * 2

    # spectrogram
    spec_idx = log_spectrogram(x, sr, inner_w, SPEC_H)
    rgb = CMAP[spec_idx]  # (SPEC_H, inner_w, 3)
    spec_img = Image.fromarray(rgb, "RGB")
    tile.paste(spec_img, (PAD, PAD))
    # log-freq axis ticks
    for hz in (100, 1000, 10000):
        fmin, fmax = 40.0, min(16000.0, sr / 2.0)
        if hz > fmax:
            continue
        frac = (np.log10(hz) - np.log10(fmin)) / (np.log10(fmax) - np.log10(fmin))
        y = PAD + int((1 - frac) * SPEC_H)
        d.line([(PAD, y), (PAD + 4, y)], fill=(255, 255, 255), width=1)
        d.text((PAD + 6, y - 6), f"{hz//1000}k" if hz >= 1000 else str(hz),
                fill=DIM, font=F_SUB)

    # waveform strip
    wy0 = PAD + SPEC_H + 2
    d.rectangle([PAD, wy0, PAD + inner_w, wy0 + WAVE_H], fill=(26, 26, 32))
    mid = wy0 + WAVE_H // 2
    if x.size:
        step = max(1, x.size // inner_w)
        ax = np.abs(x)

        def _seg_max(i):
            seg = ax[i * step:(i + 1) * step]
            return float(np.max(seg)) if seg.size else 0.0
        env = np.array([_seg_max(i) for i in range(inner_w)])
        env = env / (np.max(ax) + 1e-9)
        for i, e in enumerate(env):
            h = int(e * (WAVE_H // 2 - 1))
            d.line([(PAD + i, mid - h), (PAD + i, mid + h)], fill=(120, 200, 230))
    d.line([(PAD, mid), (PAD + inner_w, mid)], fill=(60, 60, 70))

    # labels
    ly = wy0 + WAVE_H + 4
    d.text((PAD, ly), label, fill=FG, font=F_LBL)
    d.text((PAD, ly + 16), sub, fill=DIM, font=F_SUB)
    return tile


def build_sheet(entries, cols, title, fname):
    rows = (len(entries) + cols - 1) // cols
    head_h = 30
    W = cols * TILE_W
    H = head_h + rows * TILE_H
    sheet = Image.new("RGB", (W, H), (10, 10, 12))
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), title, fill=(255, 255, 255), font=_font(16))
    for i, (path, label, sub) in enumerate(entries):
        r, col = divmod(i, cols)
        tile = render_tile(path, label, sub)
        sheet.paste(tile, (col * TILE_W, head_h + r * TILE_H))
    sheet.save(str(OUT / fname))
    return OUT / fname, W, H


def main():
    rep = json.load(open(OUT / "qa_report.json", encoding="utf-8"))
    by = {r["file"]: r for r in rep}

    def sub(r):
        return f"{r['dur_s']:.2f}s  pk {r['peak_dbfs']:.1f}  rms {r['rms_dbfs']:.1f} dBFS"

    amb_sfx = []
    for r in rep:
        if r["kind"] in ("ambient", "sfx"):
            p = Path(r["path"])
            amb_sfx.append((p, r["file"].replace(".ogg", ""), sub(r)))
    voice = []
    for r in rep:
        if r["kind"] == "voice":
            p = Path(r["path"])
            voice.append((p, r["file"].replace(".ogg", "").replace("voice-", ""), sub(r)))

    # cols chosen so width <= ~2400px: 6*360=2160
    f1, w1, h1 = build_sheet(amb_sfx, 6, "Level-2 audio QA - AMBIENT + SFX (waveform + log-freq spectrogram)",
                             "contact_ambient_sfx.png")
    f2, w2, h2 = build_sheet(voice, 6, "Level-2 audio QA - VOICE 29 lines (ko-KR-InJoonNeural, waveform + log-freq spectrogram)",
                             "contact_voice.png")
    print(f"wrote {f1}  ({w1}x{h1})")
    print(f"wrote {f2}  ({w2}x{h2})")


if __name__ == "__main__":
    main()
