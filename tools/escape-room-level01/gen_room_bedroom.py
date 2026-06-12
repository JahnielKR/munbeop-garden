#!/usr/bin/env python3
"""Room 1 — guest bedroom (손님방) of the minbak. 320x240, opaque.

Golden-dawn interior, Stardew-flat perspective. Hotspots (320x240 space):
  note-1 [130,140,40,30]  folded hanji note on the low table
  window [240,50,60,80]   lattice window glowing with sunrise
  book   [40,100,30,40]   blue textbook on the left bookshelf
All colors come from common.PAL / OUTLINE / SHADOW (no derived tones).
Deterministic: the only scatter uses random.Random(11).
"""

from __future__ import annotations

import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import common
from common import (OUTLINE, PAL, dither, drop_shadow, fill, frame, hline,
                    vline)

W, H = 320, 240
WALL_H = 142          # wall ends here
SKIRT_H = 6           # zocalo
FLOOR_Y = WALL_H + SKIRT_H

HOTSPOTS = [(130, 140, 40, 30), (240, 50, 60, 80), (40, 100, 30, 40)]

WL, WD = PAL["wood_light"], PAL["wood_dark"]
HJ, FL, GL = PAL["hanji"], PAL["floor"], PAL["gold_light"]
DW, GR, BL = PAL["dawn"], PAL["green"], PAL["blue"]
RD, PK, BR, GY = PAL["red"], PAL["pink"], PAL["brass"], PAL["gray"]

rng = random.Random(11)


# ── structure ────────────────────────────────────────────────────────────────

def beam_v(d, x, w, y0, y1):
    fill(d, x, y0, w, y1 - y0, WL[1])
    vline(d, x, y0, y1 - y0, WL[0])
    vline(d, x + w - 1, y0, y1 - y0, WL[3])
    vline(d, x - 1, y0, y1 - y0, OUTLINE)
    vline(d, x + w, y0, y1 - y0, OUTLINE)
    for yy in range(y0 + 5, y1 - 2, 17):           # grain ticks
        vline(d, x + 2, yy, 4, WL[2])


def walls_and_floor(d):
    common.hanji_wall(d, 0, 0, W, WALL_H)
    # top beam + thin rail the scroll hangs from
    fill(d, 0, 0, W, 8, WL[1])
    hline(d, 0, 7, W, WL[3])
    hline(d, 0, 8, W, OUTLINE)
    fill(d, 0, 28, W, 4, WL[2])
    hline(d, 0, 28, W, WL[1])
    hline(d, 0, 32, W, OUTLINE)
    for bx in (0, 88, 176, 313):                   # posts framing hanji panels
        beam_v(d, bx + (1 if bx == 0 else 0), 6, 9, WALL_H)
    # zocalo
    fill(d, 0, WALL_H, W, SKIRT_H, WD[1])
    hline(d, 0, WALL_H, W, OUTLINE)
    hline(d, 0, WALL_H + 1, W, WD[0])
    hline(d, 0, WALL_H + SKIRT_H - 1, W, WD[3])
    # ondol floor: warm ramp + subtle planks, AO line under the zocalo
    common.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, FL, plank_h=10,
                       seam_every=2)
    dither(d, 0, FLOOR_Y, W, 2, FL[3], phase=1)


# ── dawn light ───────────────────────────────────────────────────────────────

def light_pool(d):
    """Dithered golden pool slanting left from the window."""
    y0, y1 = FLOOR_Y + 2, 202
    for y in range(y0, y1):
        t = (y - y0) / (y1 - y0)
        lx, rx = int(234 - 32 * t), int(306 - 24 * t)
        if y > y1 - 7:                              # dithered fade-out rows
            dither(d, lx, y, rx - lx, 1, GL[1], phase=y)
            continue
        fill(d, lx + 3, y, rx - lx - 6, 1, GL[1])
        dither(d, lx, y, 3, 1, GL[1], phase=y)      # dithered side fringes
        dither(d, rx - 3, y, 3, 1, GL[1], phase=y)
        if 0.1 < t < 0.78:                          # hot core follows the slant
            cx = (lx + rx) // 2
            cw = int((rx - lx) * 0.62 * (1.0 - abs(t - 0.42) * 1.6))
            dither(d, cx - cw // 2, y, cw, 1, GL[0], phase=y)
        for k in (0.32, 0.64):                      # lattice-bar shadows
            bx = int(lx + (rx - lx) * k)
            fill(d, bx, y, 2, 1, GL[2])
    for sx, sy in ((247, 162), (272, 178), (258, 191)):
        d.point((sx, sy), fill=GL[0])
        d.point((sx - 1, sy), fill=GL[0])
        d.point((sx + 1, sy), fill=GL[0])
        d.point((sx, sy - 1), fill=GL[0])
        d.point((sx, sy + 1), fill=GL[0])


def window(d):
    x, y, w, h = 236, 46, 70, 88                    # hotspot [240,50,60,80]
    dither(d, x - 3, y - 3, w + 6, h + 6, GL[0], phase=0)   # halo on hanji
    frame(d, x, y, w, h)
    fill(d, x + 1, y + 1, w - 2, h - 2, WL[1])
    frame(d, x + 4, y + 4, w - 8, h - 8)
    px, py, pw, ph = x + 5, y + 5, w - 10, h - 10   # glowing panes
    fill(d, px, py, pw, ph, GL[1])
    dither(d, px, py, pw, 8, DW[1], phase=0)        # peach sky up high
    dither(d, px, py + ph - 8, pw, 8, DW[2], phase=1)
    for yy in range(77, 119):                       # rising sun, low and big
        dy = (yy - 98) / 21.0
        half = int(27 * (1.0 - dy * dy) ** 0.5)
        dither(d, 271 - half, yy, 2 * half, 1, GL[0], phase=yy)
    for bx in (px + 14, px + 29, px + 44):          # lattice muntins, backlit
        fill(d, bx, py, 2, ph, WD[2])
        vline(d, bx, py, ph, WD[1])
    for by in (py + 18, py + 39, py + 60):
        fill(d, px, by, pw, 2, WD[2])
        hline(d, px, by, pw, WD[1])
    fill(d, x - 2, y + h, w + 4, 4, WL[0])          # sill
    hline(d, x - 2, y + h + 1, w + 4, WL[2])
    frame(d, x - 2, y + h, w + 4, 4)
    hline(d, x + 6, y + 1, w - 12, WL[0])           # lit top frame edge


# ── wall props ───────────────────────────────────────────────────────────────

def scroll(d):
    x, y = 188, 50
    vline(d, x + 4, 34, 16, OUTLINE)                # strings to the rail
    vline(d, x + 17, 34, 16, OUTLINE)
    fill(d, x - 2, y, 26, 3, WD[1]); frame(d, x - 2, y, 26, 3)
    fill(d, x, y + 3, 22, 56, HJ[2])
    frame(d, x, y + 3, 22, 56)
    vline(d, x + 1, y + 4, 54, HJ[1])
    for cx in (x + 6, x + 12):                      # illegible ink columns
        yy = y + 8
        for seg in (4, 3, 5, 3, 4):
            vline(d, cx, yy, seg, OUTLINE)
            d.point((cx + 1, yy + 1), fill=OUTLINE)
            yy += seg + 3
    fill(d, x + 15, y + 44, 4, 4, RD[1])            # red seal stamp
    fill(d, x - 2, y + 59, 26, 3, WD[1]); frame(d, x - 2, y + 59, 26, 3)


def photo_frame(d):
    x, y = 146, 64
    fill(d, x, y, 22, 26, WL[2]); frame(d, x, y, 22, 26)
    fill(d, x + 3, y + 3, 16, 20, HJ[2])
    fill(d, x + 6, y + 9, 4, 4, GY[2])              # halmeoni + child
    fill(d, x + 5, y + 13, 6, 7, GY[1])
    fill(d, x + 13, y + 12, 3, 3, GY[2])
    fill(d, x + 12, y + 15, 5, 5, GY[1])
    hline(d, x + 4, y + 20, 14, HJ[3])


def peg_towel(d):
    fill(d, 84, 64, 34, 4, WD[1]); frame(d, 84, 64, 34, 4)
    for px in (92, 108):
        fill(d, px, 68, 3, 4, WD[2]); frame(d, px, 68, 3, 4)
    x, y = 88, 71                                   # soft pink towel
    fill(d, x, y, 12, 32, PK[1])
    vline(d, x + 1, y, 32, PK[0])
    vline(d, x + 9, y, 32, PK[2])
    hline(d, x, y + 14, 12, PK[2])
    hline(d, x + 1, y + 26, 10, RD[2])              # woven stripe
    frame(d, x, y, 12, 32)


# ── furniture ────────────────────────────────────────────────────────────────

def bookshelf(d):
    x, y, w, h = 26, 50, 58, 116                    # stands past the wall line
    drop_shadow(d, x - 2, y + h, w + 5, 3)
    fill(d, x, y, w, h, WL[2])
    frame(d, x, y, w, h)
    fill(d, x + 1, y + 1, w - 2, 6, WL[1])          # top board
    hline(d, x + 1, y + 1, w - 2, WL[0])
    for sy in (96, 138):                            # shelf boards
        fill(d, x + 1, sy, w - 2, 5, WL[1])
        hline(d, x + 1, sy, w - 2, WL[0])
        hline(d, x + 1, sy + 4, w - 2, OUTLINE)
        hline(d, x + 1, sy + 5, w - 2, WL[3])
    fill(d, x + 4, y + 8, w - 8, 86, WD[3])         # dark openings
    fill(d, x + 4, 101, w - 8, 37, WD[3])
    fill(d, x + 4, 143, w - 8, 18, WD[3])
    fill(d, x + 1, 96, w - 2, 5, WL[1])             # boards over openings
    hline(d, x + 1, 96, w - 2, WL[0])
    hline(d, x + 1, 100, w - 2, OUTLINE)
    fill(d, x + 1, 138, w - 2, 5, WL[1])
    hline(d, x + 1, 138, w - 2, WL[0])
    hline(d, x + 1, 142, w - 2, OUTLINE)
    # top opening: stacked books + little jar
    for i, (bw, c) in enumerate(((24, GR[2]), (20, RD[2]), (22, WD[1]))):
        by = 88 - i * 6
        fill(d, x + 7, by, bw, 6, c)
        frame(d, x + 7, by, bw, 6)
        hline(d, x + 9, by + 2, bw - 5, HJ[3])
    fill(d, x + 40, 78, 12, 16, GY[1])              # ceramic jar
    fill(d, x + 42, 75, 8, 4, GY[2])
    frame(d, x + 40, 78, 12, 16)
    vline(d, x + 42, 80, 12, GY[0])
    # middle opening: the blue textbook hotspot among muted spines
    fill(d, x + 6, 109, 7, 29, HJ[2]); frame(d, x + 6, 109, 7, 29)
    fill(d, x + 18, 104, 18, 34, BL[1])             # 한국어 교과서
    frame(d, x + 18, 104, 18, 34)
    fill(d, x + 19, 105, 16, 4, BL[0])
    vline(d, x + 19, 105, 32, BL[0])
    fill(d, x + 21, 116, 12, 6, HJ[1])              # paper title label
    frame(d, x + 21, 116, 12, 6)
    hline(d, x + 23, 118, 8, BL[2])                 # scribble, no real text
    fill(d, x + 38, 108, 8, 30, RD[2]); frame(d, x + 38, 108, 8, 30)
    vline(d, x + 39, 109, 28, RD[1])
    fill(d, x + 48, 112, 7, 26, GR[2]); frame(d, x + 48, 112, 7, 26)
    # bottom opening: folded blanket stack + little wooden keepsake box
    fill(d, x + 7, 150, 26, 5, HJ[2]); frame(d, x + 7, 150, 26, 5)
    fill(d, x + 7, 145, 26, 5, GR[1]); frame(d, x + 7, 145, 26, 5)
    hline(d, x + 9, 147, 22, GR[0])
    fill(d, x + 38, 146, 14, 9, WD[1]); frame(d, x + 38, 146, 14, 9)
    hline(d, x + 39, 149, 12, OUTLINE)
    d.point((x + 44, 151), fill=BR[1])
    vline(d, x + 4, y + 8, 153 - y, WD[3])          # inner side shading
    vline(d, x + w - 5, y + 8, 153 - y, OUTLINE)


def alarm_clock(d):
    cx, cy = 46, 41                                 # silent, already rang: 8:00
    for bx in (cx - 5, cx + 2):
        fill(d, bx, cy - 9, 4, 3, BR[1]); frame(d, bx, cy - 9, 4, 3)
    d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=BR[1], outline=OUTLINE)
    d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=HJ[1], outline=BR[3])
    d.point((cx - 3, cy - 1), fill=BR[3])
    d.point((cx + 3, cy - 1), fill=BR[3])
    vline(d, cx, cy - 4, 4, OUTLINE)                # minute hand on 12
    d.line([cx, cy, cx - 3, cy + 3], fill=OUTLINE)  # hour hand on 8
    for fx in (cx - 5, cx + 4):
        fill(d, fx, cy + 7, 2, 2, BR[3])


def paper_lamp(d):
    x, y = 212, 96                                  # floor lamp, switched off
    drop_shadow(d, x + 2, 170, 18, 2)
    fill(d, x, y, 22, 36, HJ[2])                    # unlit shade
    frame(d, x, y, 22, 36)
    vline(d, x + 1, y + 1, 34, HJ[1])
    dither(d, x + 2, y + 24, 18, 10, HJ[3], phase=1)
    for by in (y + 9, y + 18, y + 27):
        hline(d, x + 1, by, 20, WD[2])
    vline(d, x + 11, y + 1, 34, WD[2])
    fill(d, x + 4, y - 4, 14, 4, WD[1]); frame(d, x + 4, y - 4, 14, 4)
    fill(d, x + 9, y + 36, 4, 30, WD[1])            # post
    vline(d, x + 9, y + 36, 30, WD[0])
    frame(d, x + 9, y + 36, 4, 30)
    fill(d, x + 3, 166, 16, 4, WD[2]); frame(d, x + 3, 166, 16, 4)


def low_table_and_note(d):
    x, y, w = 124, 130, 58                          # small soban table
    drop_shadow(d, x, 179, w + 2, 3)
    fill(d, x, y, w, 34, WL[1])                     # deep top surface
    hline(d, x + 1, y + 1, w - 2, WL[0])
    for gy in range(y + 6, y + 32, 7):
        hline(d, x + 4 + (gy % 9), gy, 16, WL[2])
        hline(d, x + 32, gy + 3, 14, WL[2])
    frame(d, x, y, w, 34)
    fill(d, x, y + 34, w, 7, WL[2])                 # front apron
    hline(d, x, y + 40, w, WL[3])
    frame(d, x, y + 34, w, 7)
    for lx in (x + 5, x + w - 12):                  # sturdy legs
        fill(d, lx, y + 41, 7, 8, WD[1])
        vline(d, lx + 1, y + 41, 8, WD[0])
        frame(d, lx, y + 41, 7, 8)
    cx = x + 5                                      # brass teacup, top-left
    d.ellipse([cx, 131, cx + 9, 139], fill=BR[1], outline=OUTLINE)
    d.ellipse([cx + 2, 133, cx + 7, 137], fill=BR[3])  # dark tea surface
    d.point((cx + 3, 134), fill=BR[0])
    # ── note-1 hotspot: brightest hanji in the scene, center (150,153)
    nx, ny, nw, nh = 139, 145, 23, 17
    hline(d, nx + 2, ny + nh, nw, WD[2])            # cast line on the wood
    fill(d, nx, ny, nw, nh, HJ[0])
    d.polygon([(nx + nw - 7, ny), (nx + nw - 1, ny), (nx + nw - 1, ny + 6)],
              fill=HJ[1])
    d.line([nx + nw - 7, ny, nx + nw - 1, ny + 6], fill=HJ[3])
    hline(d, nx + 1, ny + 8, nw - 4, HJ[2])         # crease of the fold
    hline(d, nx + 3, ny + 12, nw - 8, HJ[1])        # soft under-crease
    frame(d, nx, ny, nw, nh)


def cushion(d):
    x, y = 196, 188
    drop_shadow(d, x + 1, y + 20, 30, 2)
    d.rounded_rectangle([x, y, x + 31, y + 15], 6, fill=RD[1], outline=OUTLINE)
    fill(d, x + 3, y + 16, 26, 4, RD[2])
    hline(d, x + 3, y + 19, 26, RD[3])
    frame(d, x + 3, y + 15, 26, 5)
    dither(d, x + 4, y + 2, 12, 5, RD[0], phase=0)
    d.point((x + 15, y + 7), fill=OUTLINE)          # center button
    d.point((x + 16, y + 7), fill=OUTLINE)


def basket(d):
    x, y = 12, 198
    drop_shadow(d, x, y + 26, 34, 2)
    fill(d, x, y, 33, 26, WL[2])
    for yy in range(y + 5, y + 25, 5):              # weave
        for xx in range(x + 1 + ((yy // 5) % 2) * 3, x + 31, 6):
            fill(d, xx, yy, 3, 4, WL[3])
    d.ellipse([x + 5, y - 6, x + 15, y + 4], fill=BL[1], outline=OUTLINE)
    hline(d, x + 8, y - 4, 4, BL[0])
    d.ellipse([x + 17, y - 5, x + 27, y + 4], fill=HJ[2], outline=OUTLINE)
    hline(d, x + 20, y - 3, 4, HJ[1])
    fill(d, x, y, 33, 4, WD[1])                     # rim overlaps the rolls
    hline(d, x + 1, y + 1, 31, WD[0])
    frame(d, x, y, 33, 26)


def plant(d):
    x, y = 288, 196                                 # corner pot in dawn light
    drop_shadow(d, x - 2, y + 26, 28, 2)
    fill(d, x, y, 24, 8, RD[2])                     # clay pot
    fill(d, x + 2, y + 8, 20, 18, RD[2])
    vline(d, x + 4, y + 9, 16, RD[1])
    vline(d, x + 19, y + 9, 16, RD[3])
    hline(d, x + 1, y + 1, 22, RD[1])
    frame(d, x, y, 24, 8)
    frame(d, x + 2, y + 8, 20, 18)
    blobs = [(x + 1, y - 12, 13, 14), (x + 10, y - 14, 13, 15),
             (x + 5, y - 20, 14, 14), (x + 13, y - 8, 10, 11)]
    for lx, ly, lw, lh in blobs:                    # round leafy cluster
        d.ellipse([lx, ly, lx + lw, ly + lh], fill=GR[1], outline=OUTLINE)
    for lx, ly, lw, lh in blobs:
        d.ellipse([lx + 1, ly + 1, lx + lw - 1, ly + lh - 1], fill=GR[1])
        dither(d, lx + 2, ly + 2, lw - 3, 4, GR[0], phase=lx)
        dither(d, lx + 2, ly + lh - 4, lw - 3, 3, GR[3], phase=ly)
    d.point((x + 9, y - 16), fill=GR[0])
    d.point((x + 16, y - 11), fill=GR[0])


# ── the futon (요) — slept-in, just abandoned ───────────────────────────────

def futon(d):
    x, y, w, h = 52, 158, 70, 72
    drop_shadow(d, x + 2, y + h, w, 3)
    d.rounded_rectangle([x, y, x + w - 1, y + h - 1], 4, fill=HJ[1],
                        outline=OUTLINE)
    d.rounded_rectangle([x + 3, y + 3, x + w - 4, y + h - 4], 3,
                        outline=HJ[2])              # quilted inner border
    for i, (fx, fy) in enumerate(((60, 184), (74, 190), (66, 206),
                                  (60, 218), (72, 226), (78, 182))):
        d.point((fx, fy), fill=HJ[2])               # sparse weave flecks
        d.point((fx + 5, fy + 3), fill=HJ[2])
    vline(d, x + w - 2, y + 4, h - 8, HJ[3])        # mattress edge shading
    hline(d, x + 4, y + h - 2, w - 8, HJ[3])
    for sx, sy in ((63, 198), (72, 212), (64, 222)):  # sheet wrinkles
        hline(d, sx, sy, 8, HJ[3])
        hline(d, sx + 2, sy + 1, 5, HJ[2])
    # cylindrical Korean pillow with embroidered red ends
    px, py = 62, 163
    d.rounded_rectangle([px, py, px + 42, py + 13], 6, fill=HJ[1],
                        outline=OUTLINE)
    hline(d, px + 6, py + 3, 30, HJ[2])             # roll shading
    hline(d, px + 5, py + 10, 32, HJ[3])
    d.ellipse([px - 1, py + 1, px + 9, py + 12], fill=RD[1], outline=OUTLINE)
    d.ellipse([px + 33, py + 1, px + 43, py + 12], fill=RD[1], outline=OUTLINE)
    d.point((px + 4, py + 6), fill=GR[2])
    d.point((px + 38, py + 6), fill=GR[2])
    # blue blanket kicked toward the right side, top edge folded back
    pts = [(76, 190), (84, 184), (96, 187), (108, 182), (123, 185),
           (123, 227), (108, 228), (94, 224), (84, 227), (79, 214),
           (86, 204), (74, 199)]
    d.polygon(pts, fill=BL[1], outline=OUTLINE)
    # fold-back band: lining shows along the wavy top edge
    d.polygon([(84, 184), (96, 187), (108, 182), (123, 185), (123, 192),
               (107, 189), (95, 194), (85, 191)], fill=HJ[2])
    d.line([(85, 191), (95, 194)], fill=OUTLINE)
    d.line([(95, 194), (107, 189)], fill=OUTLINE)
    d.line([(107, 189), (123, 192)], fill=OUTLINE)
    d.line([(90, 196), (86, 212)], fill=BL[3])      # crumple creases
    d.line([(100, 198), (97, 222)], fill=BL[3])
    d.line([(110, 194), (114, 224)], fill=BL[2])
    d.line([(104, 206), (110, 210)], fill=BL[2])
    for sx, sy, sw in ((102, 196, 16), (99, 198, 19), (104, 200, 12),
                       (96, 215, 12), (93, 217, 16), (98, 219, 9)):
        dither(d, sx, sy, sw, 2, BL[0], phase=sy)   # feathered light on folds
    hline(d, 96, 226, 22, BL[3])
    for sx, sy, sw in ((82, 206, 6), (80, 209, 8), (82, 213, 6)):
        dither(d, sx, sy, sw, 3, BL[2], phase=sx)   # shaded hollow, soft edge


def slippers(d):
    for sx, sy in ((132, 216), (145, 219)):         # pair by the futon
        drop_shadow(d, sx, sy + 7, 12, 1)
        d.rounded_rectangle([sx, sy, sx + 11, sy + 6], 3, fill=HJ[2],
                            outline=OUTLINE)
        hline(d, sx + 2, sy + 1, 7, HJ[1])
        fill(d, sx + 1, sy + 2, 5, 4, GY[2])        # dark heel opening
        vline(d, sx + 8, sy + 1, 5, RD[2])          # stitched toe band


# ── assemble ─────────────────────────────────────────────────────────────────

def build() -> "common.Image.Image":
    img, d = common.new_canvas(W, H, bg=FL[1])
    walls_and_floor(d)
    light_pool(d)
    window(d)
    scroll(d)
    photo_frame(d)
    peg_towel(d)
    bookshelf(d)
    alarm_clock(d)
    paper_lamp(d)
    low_table_and_note(d)
    cushion(d)
    basket(d)
    futon(d)
    slippers(d)
    plant(d)
    return img


if __name__ == "__main__":
    img = build()
    common.save_asset(img, "rooms", "room-01-bedroom.png")
    common.preview(img, "preview_room_bedroom.png")
    common.hotspot_debug(img, HOTSPOTS, "debug_room_bedroom.png")
