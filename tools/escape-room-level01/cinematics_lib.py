#!/usr/bin/env python3
"""Shared exterior-scene helpers for the two Level 1 cinematics.

Split out of gen_cinematics.py (STYLE flow rule 4: keep each script <= ~400
readable lines). Both cinematics compose from this vocabulary: dawn sky, sun,
mountains, sea, fog, giwa roofs, hanji walls, lanterns, smoke, stone walls.
Deterministic (seeded rng only). Style bible: tools/escape-room-level01/STYLE.md.

Derived tones (STYLE rule 1 — scaled from existing PAL ramps, annotated):
  MOUNT_FAR  = dawn[4] * 0.90   far mountain silhouette (dusty mauve)
  MOUNT_NEAR = dawn[4] * 0.72   near mountain silhouette
  SKIN       = dawn[1]          halmeoni face/hands (reuse, no new tone)
  SKIN_SH    = dawn[2]          skin shading (reuse)
  SHADOW_OP  = SHADOW opaque    warm shadow stamped via dither only
"""

from __future__ import annotations

import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common
from common import OUTLINE, PAL, dither, fill, frame, hline, vline

W, H = 320, 240


def shade(c, f: float):
    """Derived tone: scale an existing PAL color (annotated in module docstring)."""
    return (int(c[0] * f), int(c[1] * f), int(c[2] * f), 255)


MOUNT_FAR = shade(PAL["dawn"][4], 0.90)
MOUNT_NEAR = shade(PAL["dawn"][4], 0.72)
SKIN = PAL["dawn"][1]
SKIN_SH = PAL["dawn"][2]
SHADOW_OP = common.SHADOW[:3] + (255,)


# ── atmosphere ───────────────────────────────────────────────────────────────

def dawn_sky(d, horizon: int, lighter: bool = False) -> None:
    """Banded PAL['dawn'] sky, mauve top -> cream at horizon, dithered seams."""
    idx = [3, 2, 1, 0, 0] if lighter else [4, 3, 2, 1, 0]
    n = len(idx)
    bounds = [round(i * horizon / n) for i in range(n + 1)]
    for i, k in enumerate(idx):
        fill(d, 0, bounds[i], W, bounds[i + 1] - bounds[i], PAL["dawn"][k])
    for i in range(1, n):
        if idx[i] == idx[i - 1]:
            continue
        y = bounds[i]
        dither(d, 0, y - 2, W, 2, PAL["dawn"][idx[i]], phase=y)
        dither(d, 0, y, W, 2, PAL["dawn"][idx[i - 1]], phase=y + 1)


def dither_disc(d, cx: int, cy: int, r: int, c, phase: int = 0) -> None:
    for yy in range(cy - r, cy + r + 1):
        for xx in range(cx - r + ((yy + phase) % 2), cx + r + 1, 2):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r:
                d.point((xx, yy), fill=c)


def sun(d, cx: int, cy: int, r: int) -> None:
    """Sun disc with dithered warm halo (no alpha mush)."""
    dither_disc(d, cx, cy, r + 9, PAL["dawn"][1], phase=1)
    dither_disc(d, cx, cy, r + 5, PAL["gold_light"][2])
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PAL["gold_light"][1])
    d.ellipse([cx - r + 2, cy - r + 1, cx + r - 2, cy + r - 3],
              fill=PAL["gold_light"][0])


def mountains(d, base_y: int, peaks, color) -> None:
    """Soft rounded silhouettes against the dawn."""
    for cx, half, height in peaks:
        top = base_y - height
        d.polygon([(cx - half, base_y), (cx - half // 3, top + height // 5),
                   (cx, top), (cx + half // 2, top + height // 3),
                   (cx + half, base_y)], fill=color)


def sea_band(d, x: int, y: int, w: int, h: int, sun_x: int | None = None) -> None:
    """Distant sea strip: blue ramp rows, sky glints, gold path under the sun."""
    fill(d, x, y, w, h, PAL["blue"][2])
    hline(d, x, y, w, PAL["blue"][3])
    for row in range(y + 2, y + h, 3):
        for sx in range(x + (row * 5) % 7, x + w - 4, 13):
            hline(d, sx, row, 3, PAL["blue"][1])
    for sx in range(x + 3, x + w - 2, 7):  # dawn reflections on the surface
        d.point((sx, y + 1), fill=PAL["dawn"][0])
    if sun_x is not None:
        # broken glitter column under the sun: seeded rng, no modular drift
        r = random.Random(sun_x * 7 + y)
        for row in range(y + 2, y + min(h, 11)):
            t = row - y
            if r.random() < 0.3:
                continue  # some rows stay dark: ragged, Stardew-like sparkle
            for _ in range(r.randint(1, 2)):
                dl = r.randint(1, min(1 + t // 2, 3))  # dashes widen nearer
                sx = sun_x + r.randint(-2, 2) - dl // 2
                for px in range(sx, sx + dl):
                    if x <= px < x + w:
                        d.point((px, row), fill=PAL["gold_light"][1])
        hline(d, sun_x - 4, y + 1, 9, PAL["gold_light"][0])


def fog_band(d, x: int, y: int, w: int, rows: int = 3) -> None:
    """Low fog: checkerboard rows with ragged ends. phase=x+lt locks the
    global checkerboard parity (xx+yy even) no matter where a row starts."""
    r = random.Random(x * 31 + y * 17 + w)
    for i in range(rows):
        lt, rt = r.randint(0, 4), r.randint(0, 4)
        if w - lt - rt > 2:
            dither(d, x + lt, y + i, w - lt - rt, 1, PAL["hanji"][0],
                   phase=x + lt)


# ── architecture ─────────────────────────────────────────────────────────────

def giwa_roof(d, x0: int, x1: int, ridge_y: int, eave_y: int,
              ridge_frac: float = 0.40, lift: int = 3) -> None:
    """Curved Korean tiled roof: concave slopes, upturned eaves, tile columns."""
    cx = (x0 + x1) / 2
    half = (x1 - x0) / 2
    ridge_half = half * ridge_frac
    bots, tops = {}, {}
    for x in range(x0, x1 + 1):
        t = abs(x - cx) / half
        by = eave_y - round(lift * t * t * t * 2)
        if abs(x - cx) <= ridge_half:
            ty = ridge_y
        else:
            u = (abs(x - cx) - ridge_half) / (half - ridge_half)
            ty = ridge_y + round((by - 5 - ridge_y) * (1 - (1 - u) ** 2))
        tops[x], bots[x] = min(ty, by - 3), by
    for x in range(x0, x1 + 1):
        vline(d, x, tops[x], bots[x] - tops[x] + 1, PAL["gray"][2])
    for x in range(x0 + 2, x1 - 1, 4):  # tile grooves + lit ribs
        vline(d, x, tops[x] + 2, bots[x] - tops[x] - 2, PAL["gray"][3])
        if x + 2 <= x1:
            vline(d, x + 2, tops[x + 2] + 2, bots[x + 2] - tops[x + 2] - 3,
                  PAL["gray"][1])
    rx0, rx1 = int(cx - ridge_half), int(cx + ridge_half)
    fill(d, rx0, ridge_y - 2, rx1 - rx0 + 1, 3, PAL["gray"][3])
    hline(d, rx0, ridge_y - 3, rx1 - rx0 + 1, OUTLINE)
    fill(d, rx0 - 2, ridge_y - 4, 3, 5, PAL["gray"][3])
    fill(d, rx1 - 1, ridge_y - 4, 3, 5, PAL["gray"][3])
    for x in range(x0, x1 + 1):
        d.point((x, tops[x] - 1), fill=OUTLINE)
        d.point((x, bots[x]), fill=OUTLINE)
        d.point((x, bots[x] - 1), fill=PAL["gray"][3])
    for x in range(x0 + 1, x1 - 1, 4):  # round tile-end caps along the eave
        fill(d, x, bots[x] + 1, 2, 2, PAL["gray"][1])
        d.point((x, bots[x] + 2), fill=PAL["gray"][3])
        d.point((x + 1, bots[x] + 2), fill=OUTLINE)


def lattice_window(d, x: int, y: int, w: int, h: int, lit: bool = True) -> None:
    """Hanji window with wooden lattice; warm glow when lit."""
    fill(d, x, y, w, h, PAL["gold_light"][1] if lit else PAL["hanji"][1])
    if lit:
        fill(d, x + 1, y + 1, w - 2, h - 2, PAL["gold_light"][0])
        dither(d, x + 1, y + 1, w - 2, h - 2, PAL["gold_light"][1])
    for gx in range(x + 3, x + w - 1, 4):
        vline(d, gx, y, h, PAL["wood_dark"][2])
    for gy in range(y + 3, y + h - 1, 4):
        hline(d, x, gy, w, PAL["wood_dark"][2])
    frame(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)


def building_shell(d, x: int, w: int, top: int, base: int, posts, pw: int = 4,
                   roof_top: int | None = None, chimney_x: int | None = None) -> None:
    """Village house body: hanji wall, dark posts, base line, shadow, giwa roof."""
    common.hanji_wall(d, x, top, w, base - top)
    for px in posts:
        fill(d, px, top, pw, base - top, PAL["wood_dark"][1])
        vline(d, px + pw - 1, top, base - top, OUTLINE)
    hline(d, x, base - 1, w, OUTLINE)
    common.drop_shadow(d, x, base, w, 2)
    if roof_top is not None:
        giwa_roof(d, x - 6, x + w + 6, roof_top, top, ridge_frac=0.45, lift=2)
        if chimney_x is not None:
            fill(d, chimney_x, roof_top - 13, 7, 13, PAL["gray"][2])
            frame(d, chimney_x, roof_top - 13, 7, 13, OUTLINE)
            hline(d, chimney_x, roof_top - 13, 7, PAL["gray"][0])


def plank_door(d, x: int, y: int, w: int, h: int) -> None:
    fill(d, x, y, w, h, PAL["wood_dark"][1])
    fill(d, x + 2, y + 2, w - 4, h - 4, PAL["wood_dark"][2])
    frame(d, x, y, w, h, OUTLINE)


def paper_lantern(d, cx: int, top: int, hw: int, h: int, glow_rings,
                  tassel: bool = False) -> None:
    """Hanging paper lantern + dithered halo. Shared motif intro/outro."""
    for rr, c in glow_rings:
        dither_disc(d, cx, top + h // 2 - 1, rr, c, phase=rr)
    vline(d, cx, top - 6, 6, OUTLINE)
    fill(d, cx - hw, top, 2 * hw + 1, h, PAL["gold_light"][1])
    fill(d, cx - hw + 1, top + 1, 2 * hw - 1, h - 2, PAL["gold_light"][0])
    vline(d, cx - (hw + 1) // 2, top + 1, h - 2, PAL["gold_light"][1])
    vline(d, cx + (hw + 1) // 2, top + 1, h - 2, PAL["gold_light"][1])
    frame(d, cx - hw, top, 2 * hw + 1, h, OUTLINE)
    fill(d, cx - hw // 2 - 1, top - 2, hw + 2, 2, PAL["brass"][2])
    fill(d, cx - hw // 2 - 1, top + h, hw + 2, 2, PAL["brass"][2])
    if tassel:
        d.point((cx, top + h + 2), fill=PAL["red"][1])


def smoke_column(d, x: int, y: int, h: int, drift: int, seed: int) -> None:
    """Breakfast smoke: dithered blobs rising and widening (deterministic)."""
    r = random.Random(seed)
    steps = max(h // 5, 2)
    for i in range(steps):
        t = i / max(steps - 1, 1)
        cx = x + round(drift * t) + r.randint(-1, 1)
        cy = y - i * 5 - r.randint(0, 2)
        rad = 2 + round(4 * t)
        dither_disc(d, cx, cy, rad, PAL["hanji"][0], phase=i)
        if i % 2:
            dither_disc(d, cx - 1, cy + 1, max(rad - 2, 1), PAL["gray"][0],
                        phase=i + 1)


# ── small nature / yard props ────────────────────────────────────────────────

def bird(d, x: int, y: int) -> None:
    for px, py in ((-2, -1), (-1, 0), (0, 0), (1, -1)):
        d.point((x + px, y + py), fill=PAL["gray"][3])


def grass_tuft(d, x: int, y: int) -> None:
    d.point((x, y), fill=PAL["green"][1])
    d.point((x - 1, y), fill=PAL["green"][2])
    d.point((x + 1, y), fill=PAL["green"][2])
    d.point((x, y - 1), fill=PAL["green"][1])
    d.point((x - 1, y - 1), fill=PAL["green"][1])


def stone_wall(d, x: int, y: int, w: int, h: int) -> None:
    """Low doldam stone wall: rounded stones, warm grays."""
    fill(d, x, y, w, h, PAL["gray"][2])
    r = random.Random(x * 7 + y)
    for row in range(y, y + h, 4):
        off = (row // 4) % 2 * 3
        for sx in range(x + off, x + w - 3, 6):
            d.ellipse([sx, row, sx + 4, row + 3], fill=PAL["gray"][1],
                      outline=PAL["gray"][3])
            if r.random() < 0.3:
                d.point((sx + 2, row + 1), fill=PAL["gray"][0])
    hline(d, x, y, w, PAL["gray"][0])
    hline(d, x, y + h - 1, w, OUTLINE)
    common.drop_shadow(d, x, y + h, w)


def onggi_jar(d, cx: int, base_y: int, w: int, h: int) -> None:
    """Halmeoni's earthenware jar (jangdokdae). Clay = wood_dark ramp."""
    common.drop_shadow(d, cx - w // 2 - 1, base_y, w + 2)
    d.ellipse([cx - w // 2, base_y - h, cx + w // 2, base_y],
              fill=PAL["wood_dark"][1], outline=OUTLINE)
    d.ellipse([cx - w // 2 + 2, base_y - h + 2, cx - 1, base_y - h // 2],
              fill=PAL["wood_dark"][0])
    fill(d, cx - w // 4, base_y - h - 2, w // 2 + 1, 3, PAL["wood_dark"][2])
    hline(d, cx - w // 4, base_y - h - 3, w // 2 + 1, OUTLINE)
