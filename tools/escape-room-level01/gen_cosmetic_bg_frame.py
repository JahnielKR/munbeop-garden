#!/usr/bin/env python3
"""Cosmetics: cosmetic-bg-sunrise.png (320x240 opaque) + cosmetic-frame-apron.png (96x96).

- BG "Fondo Minbak Sunrise": banded dawn sky (full PAL.dawn ramp, cream near the
  horizon -> deep pink up top), rising sun with dithered halo, long dithered
  clouds, hanok roof silhouette with giwa-tile rhythm on the lower third, birds.
- FRAME "Marco Delantal de Halmeoni": 13px apron-fabric border, 68x68 fully
  transparent window, floral pattern, red seam trims, corner stitches, pocket
  and a bow on the bottom-right corner.

Derived colors: none — every color comes straight from common.PAL / OUTLINE /
SHADOW.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C
from common import PAL, OUTLINE

DAWN = PAL["dawn"]
GOLD = PAL["gold_light"]


# ─────────────────────────────────────────────────────────────────────────────
# Shared dither helpers (local, deterministic)
# ─────────────────────────────────────────────────────────────────────────────

def dither_disc(d, cx, cy, r, c, phase=0):
    """Checkerboard-dithered filled circle."""
    r2 = r * r
    for yy in range(cy - r, cy + r + 1):
        for xx in range(cx - r, cx + r + 1):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r2 and (xx + yy + phase) % 2 == 0:
                d.point((xx, yy), fill=c)


def solid_disc(d, cx, cy, r, c):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)


# ─────────────────────────────────────────────────────────────────────────────
# ASSET 1 — cosmetic-bg-sunrise.png (320x240, opaque)
# ─────────────────────────────────────────────────────────────────────────────

SUN_X, SUN_Y = 118, 146


def sky(d):
    # Bands: deep pink at the zenith -> cream at the horizon (sunrise).
    bands = [(0, 18, DAWN[4]), (18, 48, DAWN[3]), (48, 82, DAWN[2]),
             (82, 116, DAWN[1]), (116, 240, DAWN[0])]
    for y0, y1, c in bands:
        C.fill(d, 0, y0, 320, y1 - y0, c)
    # Dithered transitions (2 rows each side of every boundary).
    for i in range(len(bands) - 1):
        yb = bands[i][1]
        upper, lower = bands[i][2], bands[i + 1][2]
        C.dither(d, 0, yb - 3, 320, 3, lower, phase=yb)
        C.dither(d, 0, yb, 320, 3, upper, phase=yb + 1)
    # Faint fading stars in the deep-pink zenith.
    for sx, sy in ((36, 5), (148, 9), (262, 4), (208, 14), (88, 12)):
        d.point((sx, sy), fill=DAWN[2])
    d.point((262, 3), fill=DAWN[1])


def sun(d):
    # Wide golden glow hugging the horizon (strongest around the sun).
    C.dither(d, 0, 150, 320, 14, GOLD[0], phase=0)
    C.dither(d, SUN_X - 90, 138, 180, 12, GOLD[0], phase=1)
    # Dithered halo rings (dark -> light toward the disc).
    dither_disc(d, SUN_X, SUN_Y, 38, DAWN[1], phase=1)
    dither_disc(d, SUN_X, SUN_Y, 30, GOLD[1], phase=0)
    dither_disc(d, SUN_X, SUN_Y, 22, GOLD[0], phase=1)
    # Sun disc: hot pale core, golden rim.
    solid_disc(d, SUN_X, SUN_Y, 14, GOLD[1])
    solid_disc(d, SUN_X, SUN_Y - 1, 11, GOLD[0])
    # Lower rim catches a warmer tone where it meets the haze.
    d.arc([SUN_X - 14, SUN_Y - 14, SUN_X + 14, SUN_Y + 14], 25, 155, fill=GOLD[2])


def cloud(d, cx, cy, w, body, lit, thin=False):
    """Long flat dawn cloud, lit from below; dithered ends, no alpha mush."""
    x0 = cx - w // 2
    if thin:                                            # horizon streak
        C.hline(d, x0, cy, w, body)
        C.dither(d, x0 - 5, cy, 5, 1, body, phase=cy)
        C.dither(d, x0 + w, cy, 5, 1, body, phase=cy)
        C.hline(d, x0 + 6, cy + 1, w - 12, lit)
        return
    C.dither(d, x0 + 10, cy - 2, w - 20, 1, body, phase=cy)        # top fluff
    C.hline(d, x0 + 4, cy - 1, w - 8, body)
    C.dither(d, x0 + 1, cy - 1, 3, 1, body, phase=cy)
    C.dither(d, x0 + w - 4, cy - 1, 3, 1, body, phase=cy + 1)
    C.hline(d, x0, cy, w, body)                                     # main body
    C.dither(d, x0 - 5, cy, 5, 1, body, phase=cy)
    C.dither(d, x0 + w, cy, 5, 1, body, phase=cy + 1)
    C.hline(d, x0 + 1, cy + 1, w - 2, body)
    C.hline(d, x0 + 5, cy + 2, w - 10, lit)                         # lit belly
    C.dither(d, x0 + 3, cy + 2, 3, 1, lit, phase=cy)
    C.dither(d, x0 + 9, cy + 3, w - 18, 1, lit, phase=cy + 1)


def clouds(d):
    cloud(d, 74, 24, 84, DAWN[3], DAWN[2])
    cloud(d, 238, 36, 104, DAWN[3], DAWN[2])
    cloud(d, 148, 60, 66, DAWN[2], DAWN[1])
    cloud(d, 290, 74, 58, DAWN[2], DAWN[1])
    cloud(d, 46, 94, 88, DAWN[1], GOLD[0])
    cloud(d, 232, 106, 112, DAWN[1], GOLD[0])
    cloud(d, 90, 126, 70, DAWN[1], GOLD[0], thin=True)
    cloud(d, 250, 134, 54, DAWN[1], GOLD[0], thin=True)


def birds(d):
    for bx, by in ((196, 56), (212, 64)):
        for dx, dy in ((-2, -2), (-1, -1), (0, 0), (1, -1), (2, -2)):
            d.point((bx + dx, by + dy), fill=PAL["gray"][3])


RIDGE_L, RIDGE_R, RIDGE_Y = 88, 231, 170
EAVE_Y = 224


def roof_y(x: int) -> int:
    """Top silhouette edge of the hanok roof: sagging ridge, upturned eaves."""
    if RIDGE_L <= x <= RIDGE_R:
        t = (x - (RIDGE_L + RIDGE_R) / 2) / ((RIDGE_R - RIDGE_L) / 2)
        return RIDGE_Y + 3 - round(3 * t * t)          # sag in the middle
    if x < RIDGE_L:                                     # left slope
        t = x / RIDGE_L
        y = 206 - round(35 * t * t)
        if x < 20:
            y -= round((20 - x) * 0.8)                  # upturned eave tip
        return y
    t = (319 - x) / (319 - RIDGE_R)                     # right slope (mirror)
    y = 206 - round(35 * t * t)
    if x > 299:
        y -= round((x - 299) * 0.8)
    return y


def roof(d):
    g, wd = PAL["gray"], PAL["wood_dark"]
    body, dark, hi = g[3], OUTLINE, g[2]
    # Silhouette fill: dark giwa gray.
    for x in range(320):
        C.vline(d, x, roof_y(x), 240 - roof_y(x), body)
    # Giwa columns: soft tile-run grooves + lit convex crowns near the top.
    for x in range(2, 318, 5):
        y0 = roof_y(x) + 5
        C.vline(d, x, y0, EAVE_Y - 4 - y0, wd[3])       # groove (subtle)
        xc = x + 2                                       # convex crown
        if xc < 320:
            yc = roof_y(xc) + 5
            crown = GOLD[2] if abs(xc - SUN_X) < 44 else hi
            C.vline(d, xc, yc, 5, crown)
            for yy in range(yc + 5, yc + 13, 2):         # dithered falloff
                d.point((xc, yy), fill=hi)
    # Horizontal tile courses: solid dark rows -> reads as a giwa grid.
    for yy in range(186, EAVE_Y - 6, 9):
        for x in range(320):
            if roof_y(x) + 7 < yy:
                d.point((x, yy), fill=dark)
                if x % 5 == 2:                          # scallop: tile sag
                    d.point((x, yy + 1), fill=wd[3])
    # Ridge cap: thick dark band with serrated tile-end bumps against the sky.
    for x in range(RIDGE_L - 2, RIDGE_R + 3):
        y = roof_y(x)
        C.vline(d, x, y, 5, dark)
        if x % 5 < 2:
            d.point((x, y - 1), fill=dark)              # bump silhouette
    # Ridge-end ornaments (chimi): raised rounded blocks.
    for bx in (RIDGE_L - 7, RIDGE_R - 3):
        C.fill(d, bx, RIDGE_Y - 6, 11, 9, dark)
        d.point((bx, RIDGE_Y - 6), fill=DAWN[0])        # round the top corners
        d.point((bx + 10, RIDGE_Y - 6), fill=DAWN[0])
        C.hline(d, bx + 1, RIDGE_Y - 6, 9, body)
        C.vline(d, bx + 5, RIDGE_Y - 5, 7, body)
    # Continuous edge highlight; warm gold rim light near the sun.
    for x in range(320):
        y = roof_y(x)
        if abs(x - SUN_X) < 72:
            d.point((x, y), fill=GOLD[2])
        else:
            d.point((x, y), fill=hi)
        if x % 5 < 2 and RIDGE_L - 2 <= x <= RIDGE_R + 2:
            d.point((x, y - 1), fill=GOLD[2] if abs(x - SUN_X) < 72 else hi)
    # Eave line with round tile-end caps, deep shadow under the eaves.
    C.hline(d, 0, EAVE_Y - 4, 320, hi)
    C.hline(d, 0, EAVE_Y - 3, 320, body)
    C.fill(d, 0, EAVE_Y - 2, 320, 240 - EAVE_Y + 2, dark)
    for x in range(3, 320, 8):
        C.fill(d, x, EAVE_Y - 1, 3, 3, body)
        d.point((x + 1, EAVE_Y - 1), fill=g[1])
    # Soft warm haze at the very bottom (dither, no alpha blending).
    C.dither(d, 0, 234, 320, 6, wd[3], phase=0)


def gen_bg():
    img, d = C.new_canvas(320, 240, bg=DAWN[4])
    sky(d)
    sun(d)
    clouds(d)
    birds(d)
    roof(d)
    C.save_asset(img, "cosmetics", "cosmetic-bg-sunrise.png")
    C.preview(img, "preview_cosmetic_bg_sunrise.png")
    return img


# ─────────────────────────────────────────────────────────────────────────────
# ASSET 2 — cosmetic-frame-apron.png (96x96, transparent 68x68 window)
# ─────────────────────────────────────────────────────────────────────────────

PINK, RED, GREEN, HANJI = PAL["pink"], PAL["red"], PAL["green"], PAL["hanji"]
BRASS = PAL["brass"]

# Outer outline rect (1,0)-(94,93); window hole (14,13)-(81,80) => 13px border.
OX0, OY0, OX1, OY1 = 1, 0, 94, 93
WX0, WY0, WX1, WY1 = 14, 13, 81, 80


def in_hole(x, y):
    return WX0 - 1 <= x <= WX1 + 1 and WY0 - 1 <= y <= WY1 + 1


def fabric(d):
    C.fill(d, OX0, OY0, OX1 - OX0 + 1, OY1 - OY0 + 1, PINK[0])
    # Woven texture: deterministic scatter of cream + deeper pink flecks.
    i = 0
    for yy in range(OY0 + 2, OY1 - 1, 3):
        for xx in range(OX0 + 2 + (yy * 5) % 7, OX1 - 1, 7):
            if not in_hole(xx, yy):
                d.point((xx, yy), fill=HANJI[0] if i % 3 else PINK[1])
                i += 1
    # Soft self-shading: bottom + right inner edge of the fabric ring.
    C.dither(d, OX0 + 1, OY1 - 2, OX1 - OX0 - 1, 2, PINK[1], phase=1)
    C.dither(d, OX1 - 2, OY0 + 1, 2, OY1 - OY0 - 1, PINK[1], phase=0)


def dashes_h(d, x, y, w, c, on=2, off=2):
    xx = x
    while xx < x + w:
        C.hline(d, xx, y, min(on, x + w - xx), c)
        xx += on + off


def dashes_v(d, x, y, h, c, on=2, off=2):
    yy = y
    while yy < y + h:
        C.vline(d, x, yy, min(on, y + h - yy), c)
        yy += on + off


def trims(d):
    # Outer seam (ribete) + running stitch.
    C.frame(d, 3, 2, 90, 90, RED[1])
    dashes_h(d, 5, 2, 86, RED[3]); dashes_h(d, 5, 91, 86, RED[3])
    dashes_v(d, 3, 4, 86, RED[3]); dashes_v(d, 92, 4, 86, RED[3])
    # Inner seam hugging the window.
    C.frame(d, WX0 - 2, WY0 - 2, (WX1 - WX0) + 5, (WY1 - WY0) + 5, RED[1])
    dashes_h(d, WX0, WY0 - 2, WX1 - WX0 - 1, RED[3])
    dashes_h(d, WX0, WY1 + 2, WX1 - WX0 - 1, RED[3])
    dashes_v(d, WX0 - 2, WY0, WY1 - WY0 - 1, RED[3])
    dashes_v(d, WX1 + 2, WY0, WY1 - WY0 - 1, RED[3])


def flower(d, cx, cy, petal=None, leaf=True):
    petal = petal or RED[1]
    for dx, dy in ((-2, -2), (1, -2), (-2, 1), (1, 1)):
        C.fill(d, cx + dx, cy + dy, 2, 2, petal)
    d.point((cx, cy), fill=BRASS[0])
    d.point((cx - 1, cy), fill=PINK[2])                 # petal shading
    d.point((cx, cy - 1), fill=PINK[2])
    if leaf:
        d.point((cx - 3, cy + 1), fill=GREEN[1])
        d.point((cx + 3, cy - 1), fill=GREEN[2])


def bud(d, cx, cy):
    d.point((cx, cy), fill=RED[2])
    d.point((cx + 1, cy + 1), fill=GREEN[2])


def flowers(d):
    for x in (22, 48, 74):                              # top border
        flower(d, x, 7, petal=RED[1] if x != 48 else PINK[2])
    for x in (35, 61):
        bud(d, x, 6)
    for y in (24, 47, 70):                              # side borders
        flower(d, 7, y, petal=PINK[2] if y == 47 else RED[1])
        flower(d, 88, y, petal=RED[1] if y == 47 else PINK[2])
    for y in (36, 59):
        bud(d, 6, y); bud(d, 89, y)
    for x in (22, 66):                                  # bottom border
        flower(d, x, 87)
    bud(d, 31, 88)
    bud(d, 60, 85)


def corner_stitch(d, cx, cy):
    for k in (-1, 0, 1):
        d.point((cx + k, cy + k), fill=RED[2])
        d.point((cx + k, cy - k), fill=RED[2])


def pocket(d):
    x0, y0, w, h = 39, 82, 18, 10
    C.fill(d, x0, y0, w, h, HANJI[1])
    C.frame(d, x0, y0, w, h, OUTLINE)
    d.point((x0, y0 + h - 1), fill=PINK[0])             # rounded bottom corners
    d.point((x0 + w - 1, y0 + h - 1), fill=PINK[0])
    d.point((x0 + 1, y0 + h - 1), fill=OUTLINE)
    d.point((x0 + w - 2, y0 + h - 1), fill=OUTLINE)
    C.hline(d, x0 + 1, y0 + 1, w - 2, RED[1])           # hem
    dashes_h(d, x0 + 2, y0 + 2, w - 4, RED[3])
    flower(d, x0 + w // 2 - 1, y0 + 6, petal=PINK[2], leaf=False)


def bow(d):
    """Apron bow tied at the bottom-right corner (drawn last, on top)."""
    cx, cy = 83, 84
    # Tails first (behind the loops), notched ends.
    for x0 in (cx - 5, cx + 2):
        C.fill(d, x0, cy + 2, 4, 7, PINK[2])
        C.frame(d, x0, cy + 2, 4, 7, OUTLINE)
        d.point((x0 + 1, cy + 8), fill=(0, 0, 0, 0))    # notch
        d.point((x0 + 2, cy + 8), fill=(0, 0, 0, 0))
        d.point((x0 + 1, cy + 7), fill=OUTLINE)
        d.point((x0 + 2, cy + 7), fill=OUTLINE)
        d.point((x0 + 1, cy + 3), fill=PINK[1])         # fold light
    # Loops.
    d.ellipse([cx - 10, cy - 3, cx - 2, cy + 3], fill=PINK[1], outline=OUTLINE)
    d.ellipse([cx + 2, cy - 3, cx + 10, cy + 3], fill=PINK[1], outline=OUTLINE)
    d.point((cx - 7, cy - 2), fill=PINK[0])             # highlights
    d.point((cx + 5, cy - 2), fill=PINK[0])
    d.point((cx - 4, cy + 2), fill=PINK[3])             # creases
    d.point((cx + 8, cy + 2), fill=PINK[3])
    C.hline(d, cx - 7, cy, 3, PINK[2])                  # loop folds toward knot
    C.hline(d, cx + 5, cy, 3, PINK[2])
    # Knot.
    C.fill(d, cx - 2, cy - 2, 5, 5, RED[1])
    C.frame(d, cx - 2, cy - 2, 5, 5, OUTLINE)
    d.point((cx - 1, cy - 1), fill=RED[0])
    d.point((cx + 1, cy + 1), fill=RED[2])


def gen_frame():
    img, d = C.new_canvas(96, 96)
    fabric(d)
    trims(d)
    flowers(d)
    pocket(d)
    corner_stitch(d, 7, 6)
    corner_stitch(d, 88, 6)
    corner_stitch(d, 7, 87)
    # Silhouette outline + softly chamfered corners.
    C.frame(d, OX0, OY0, OX1 - OX0 + 1, OY1 - OY0 + 1, OUTLINE)
    for cx, cy, sx, sy in ((OX0, OY0, 1, 1), (OX1, OY0, -1, 1),
                           (OX0, OY1, 1, -1), (OX1, OY1, -1, -1)):
        d.point((cx, cy), fill=(0, 0, 0, 0))
        d.point((cx + sx, cy), fill=OUTLINE)
        d.point((cx, cy + sy), fill=OUTLINE)
    # Window outline, then punch the hole 100% transparent.
    C.frame(d, WX0 - 1, WY0 - 1, (WX1 - WX0) + 3, (WY1 - WY0) + 3, OUTLINE)
    d.rectangle([WX0, WY0, WX1, WY1], fill=(0, 0, 0, 0))
    # Bow sits on top of everything, tied at the bottom-right corner.
    bow(d)
    # Contact shadow inside the sprite, under the bottom edge.
    C.drop_shadow(d, 6, 94, 84, 2)
    C.save_asset(img, "cosmetics", "cosmetic-frame-apron.png")
    C.preview(img, "preview_cosmetic_frame_apron.png", scale=4)

    # Debug: composite over a flat avatar placeholder to verify the window.
    from PIL import Image
    bg = Image.new("RGBA", (96, 96), PAL["night"][1])
    dd = C.ImageDraw.Draw(bg)
    solid_disc(dd, 48, 46, 26, PAL["blue"][1])
    bg.alpha_composite(img)
    C.preview(bg, "debug_frame_apron_window.png", scale=4)
    return img


if __name__ == "__main__":
    gen_bg()
    gen_frame()
