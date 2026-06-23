#!/usr/bin/env python3
"""Cover — 빈칸 연습 (Cloze). A worksheet pinned above a writing desk: lines of
ink 'words' with one clear empty BLANK, and a grammar tile (에서) dropping into
it. Brush, inkstone and a warm lamp complete the fill-in-the-blank scene."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import coverkit as K
from coverkit import (OUTLINE, PAL, W, H, dither, drop_shadow, fill, frame,
                      hanji_wall, hline, vline, wood_planks)

WOODL, WOODD = PAL["wood_light"], PAL["wood_dark"]
HANJI, FLOOR = PAL["hanji"], PAL["floor"]
DAWN, GOLD = PAL["dawn"], PAL["gold_light"]
GREEN, BLUE = PAL["green"], PAL["blue"]
METAL, BRASS = PAL["metal"], PAL["brass"]
RED, GRAY = PAL["red"], PAL["gray"]

DESK_Y = 118
SX, SY, SW, SH = 78, 24, 164, 96  # worksheet sheet


def draw_back(d):
    hanji_wall(d, 0, 0, W, DESK_Y + 2)
    dither(d, 0, 0, 130, 60, GOLD[0], phase=1)


def draw_desk(d):
    wood_planks(d, 0, 170, W, H - 170, FLOOR, plank_h=10, seam_every=2)
    fill(d, 2, DESK_Y, W - 4, 10, WOODL[1])
    hline(d, 2, DESK_Y, W - 4, WOODL[0])
    hline(d, 2, DESK_Y + 9, W - 4, WOODD[2])
    dither(d, 150, DESK_Y + 2, 90, 6, GOLD[0], phase=1)
    frame(d, 1, DESK_Y - 1, W - 2, 12, OUTLINE)
    fy = DESK_Y + 11
    fill(d, 14, fy, W - 28, 34, WOODL[2])
    hline(d, 14, fy, W - 28, WOODL[1])
    for dx in (40, 172):
        frame(d, dx, fy + 5, 108, 22, WOODD[3])
        frame(d, dx + 1, fy + 6, 106, 20, WOODL[1])
        fill(d, dx + 49, fy + 13, 10, 5, BRASS[2])
        frame(d, dx + 48, fy + 12, 12, 7, OUTLINE)
    fill(d, 14, fy + 33, W - 28, 3, WOODD[2])
    frame(d, 13, fy - 1, W - 26, 38, OUTLINE)
    for lx in (8, W - 18):
        fill(d, lx, fy, 8, H - fy, WOODD[1])
        vline(d, lx + 7, fy, H - fy, WOODD[3])
        frame(d, lx - 1, fy, 10, H - fy, OUTLINE)


def draw_sheet(d):
    drop_shadow(d, SX + 2, DESK_Y, SW)
    fill(d, SX + 3, SY + 3, SW, SH, HANJI[3])  # paper shadow
    fill(d, SX, SY, SW, SH, HANJI[0])
    hline(d, SX, SY, SW, HANJI[1])
    vline(d, SX, SY, SH, HANJI[1])
    frame(d, SX, SY, SW, SH, OUTLINE)
    # pin / wax seal at the top
    d.ellipse([SX + SW // 2 - 5, SY - 4, SX + SW // 2 + 5, SY + 6], fill=RED[1],
              outline=RED[3])
    d.point((SX + SW // 2 - 1, SY - 1), fill=HANJI[0])
    # ruled lines of ink "words" — line 2 holds the blank
    lines = [
        [(14, 26), (44, 18), (66, 30)],
        [(14, 22), (40, 0), (None, None)],   # 0-width marker -> blank slot here
        [(14, 30), (48, 20), (72, 16)],
        [(14, 18), (36, 26), (66, 22)],
    ]
    ly = SY + 16
    blank_rect = None
    for row in lines:
        x = SX + 12
        for off, w in row:
            if off is None:
                continue
            wx = SX + off
            if w == 0:
                blank_rect = (wx, ly - 3, 30, 13)  # the empty blank
                continue
            fill(d, wx, ly, w, 6, GRAY[3])
            hline(d, wx, ly, w, GRAY[2])
        ly += 18
    # the highlighted empty blank
    bx, by, bw, bh = blank_rect
    dither(d, bx, by, bw, bh, GOLD[0], phase=0)
    frame(d, bx, by, bw, bh, RED[2])
    frame(d, bx + 1, by + 1, bw - 2, bh - 2, RED[1])


def draw_tile(d, img):
    """Grammar tile (에서) floating above the blank, with a drop arrow."""
    tx, ty, tw, th = SX + 30, SY - 18, 44, 24
    drop_shadow(d, tx, ty + th, tw)
    fill(d, tx, ty, tw, th, BRASS[1])
    hline(d, tx, ty, tw, GOLD[0])
    fill(d, tx + 1, ty + th - 3, tw - 2, 2, BRASS[3])
    frame(d, tx, ty, tw, th, OUTLINE)
    K.glyph(img, "에서", tx + tw // 2, ty + th // 2 - 1, 16, fill_c=OUTLINE)
    # down arrow from tile into the blank
    ax = tx + tw // 2
    for i in range(6):
        vline(d, ax, ty + th + i, 1, BRASS[2])
    for i in range(4):
        fill(d, ax - i, ty + th + 5 + i, 1, 1, BRASS[2])
        fill(d, ax + i, ty + th + 5 + i, 1, 1, BRASS[2])


def draw_inkstone(d):
    x, y = 196, DESK_Y - 12
    fill(d, x, y, 26, 12, GRAY[3])
    fill(d, x + 3, y + 2, 18, 7, GRAY[2])
    dither(d, x + 4, y + 3, 14, 5, OUTLINE, phase=0)
    frame(d, x - 1, y - 1, 28, 14, OUTLINE)
    # brush resting across it
    d.line([x - 6, y - 4, x + 24, y - 10], fill=WOODD[2])
    d.line([x - 6, y - 3, x + 24, y - 9], fill=WOODD[1])
    fill(d, x - 9, y - 4, 5, 4, OUTLINE)  # brush tip (inked)
    d.point((x + 24, y - 10), fill=RED[2])


def draw_cards(d):
    """A few candidate grammar cards stacked on the desk, left."""
    x, y = 26, DESK_Y - 16
    for i, ramp in enumerate((BLUE, GREEN, RED)):
        cx = x + i * 4
        cy = y - i * 4
        fill(d, cx, cy, 30, 18, HANJI[0])
        hline(d, cx, cy, 30, ramp[1])
        hline(d, cx, cy + 1, 30, ramp[2])
        for ly in range(cy + 6, cy + 15, 4):
            hline(d, cx + 4, ly, 22, GRAY[2])
        frame(d, cx - 1, cy - 1, 32, 20, OUTLINE)


def draw_lamp_glow(d):
    K.warm_glow(d, 280, 60, 34, GOLD, clip_y=DESK_Y)
    cx = 280
    fill(d, cx - 8, 92, 16, 8, BRASS[2])  # base
    frame(d, cx - 9, 91, 18, 9, OUTLINE)
    fill(d, cx - 6, 64, 12, 28, HANJI[0])  # chimney
    dither(d, cx + 1, 66, 5, 24, GOLD[0], phase=0)
    frame(d, cx - 7, 63, 14, 29, OUTLINE)
    fill(d, cx - 2, 72, 4, 12, GOLD[1])
    fill(d, cx - 1, 74, 2, 8, RED[1])
    fill(d, cx - 7, 60, 14, 4, METAL[2])
    frame(d, cx - 8, 59, 16, 5, OUTLINE)


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_back(d)
    K.dawn_window(d, 16, 14, 50, 42)
    draw_desk(d)
    draw_lamp_glow(d)
    draw_cards(d)
    draw_sheet(d)
    draw_inkstone(d)
    draw_tile(d, img)
    K.sparkle(d, SX + 50, SY - 22, GOLD[0])
    K.sparkle(d, 262, 48, GOLD[0])

    K.save_cover(img, "cloze-cover.png")
    K.preview(img, "preview_cloze.png", scale=3)
    K.card_sim(img, "card_cloze.png")


if __name__ == "__main__":
    main()
