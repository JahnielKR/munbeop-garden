#!/usr/bin/env python3
"""Cover — 조사 LAB (Particles). A cozy scholar's study desk (the particle
'lab'): a propped study board showing 는 vs 가 (the focal clash), with stacked
books, an oil lamp glow, a brush pot, teacup and a little plant. Dawn window
light from the left."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import coverkit as K
from coverkit import (OUTLINE, PAL, W, H, dither, drop_shadow, fill, frame,
                      hanji_wall, hline, vline, wood_planks)

WOODL = PAL["wood_light"]
WOODD = PAL["wood_dark"]
HANJI = PAL["hanji"]
FLOOR = PAL["floor"]
DAWN = PAL["dawn"]
GOLD = PAL["gold_light"]
GREEN = PAL["green"]
BLUE = PAL["blue"]
METAL = PAL["metal"]
BRASS = PAL["brass"]
RED = PAL["red"]
GRAY = PAL["gray"]

DESK_Y = 104  # top surface of the desk


def draw_back(d):
    hanji_wall(d, 0, 0, W, DESK_Y + 2)
    # soft warm light wash from the window side (upper-left)
    dither(d, 0, 0, 150, 70, GOLD[0], phase=1)


def draw_window(d):
    """Dawn window upper-left — the warm light source."""
    x, y, w, h = 18, 12, 54, 44
    dither(d, x - 5, y - 4, w + 12, h + 12, GOLD[0], phase=0)
    fill(d, x - 2, y - 2, w + 4, h + 4, OUTLINE)
    fill(d, x, y, w, h, WOODL[1])
    sx, sy, sw, sh = x + 3, y + 3, w - 6, h - 6
    bands = [(DAWN[3], 8), (DAWN[2], 8), (DAWN[1], 9), (DAWN[0], 7), (GOLD[0], 6)]
    yy = sy
    for c, bh in bands:
        fill(d, sx, yy, sw, bh, c)
        dither(d, sx, yy + bh - 1, sw, 2, c, phase=yy % 2)
        yy += bh
    d.ellipse([sx + 6, sy + 24, sx + 18, sy + 36], fill=GOLD[0])  # rising sun
    fill(d, x + w // 2 - 1, sy, 2, sh, WOODL[2])
    fill(d, sx, y + h // 2 - 1, sw, 2, WOODL[2])
    frame(d, x + 2, y + 2, w - 4, h - 4, WOODL[3])
    fill(d, x - 3, y + h, w + 6, 4, WOODL[1])
    hline(d, x - 3, y + h, w + 6, WOODL[0])
    hline(d, x - 3, y + h + 3, w + 6, OUTLINE)


def draw_scroll(d):
    """Hanging calligraphy scroll upper-right (a study room touch)."""
    x, y, w, h = 236, 14, 58, 46
    fill(d, x - 3, y - 3, w + 6, 4, WOODD[2])      # top rod
    frame(d, x - 3, y - 3, w + 6, 4, OUTLINE)
    fill(d, x, y, w, h, HANJI[0])
    frame(d, x, y, w, h, HANJI[3])
    frame(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)
    # faux brush strokes
    for ly, lw in ((y + 8, 30), (y + 16, 22), (y + 26, 34), (y + 34, 18)):
        hline(d, x + 8, ly, lw, GRAY[2])
        hline(d, x + 8, ly + 1, lw - 4, GRAY[3])
    fill(d, x - 3, y + h, w + 6, 3, WOODD[2])       # bottom rod
    frame(d, x - 3, y + h, w + 6, 3, OUTLINE)
    vline(d, x + w // 2, y + h + 3, 5, RED[3])       # tassel


def draw_desk(d):
    # plank floor peeking at the very bottom
    wood_planks(d, 0, 168, W, H - 168, FLOOR, plank_h=10, seam_every=2)
    # desk top slab
    fill(d, 2, DESK_Y, W - 4, 11, WOODL[1])
    hline(d, 2, DESK_Y, W - 4, WOODL[0])
    hline(d, 2, DESK_Y + 10, W - 4, WOODD[2])
    dither(d, 120, DESK_Y + 2, 90, 7, GOLD[0], phase=1)  # warm sheen
    frame(d, 1, DESK_Y - 1, W - 2, 13, OUTLINE)
    # front apron with two drawers
    fy = DESK_Y + 12
    fill(d, 14, fy, W - 28, 34, WOODL[2])
    hline(d, 14, fy, W - 28, WOODL[1])
    for dx in (40, 170):
        frame(d, dx, fy + 5, 110, 22, WOODD[3])
        frame(d, dx + 1, fy + 6, 108, 20, WOODL[1])
        fill(d, dx + 50, fy + 13, 10, 5, BRASS[2])   # handle
        frame(d, dx + 49, fy + 12, 12, 7, OUTLINE)
    fill(d, 14, fy + 33, W - 28, 3, WOODD[2])
    frame(d, 13, fy - 1, W - 26, 38, OUTLINE)
    # legs
    for lx in (8, W - 18):
        fill(d, lx, fy, 8, H - fy, WOODD[1])
        vline(d, lx + 7, fy, H - fy, WOODD[3])
        frame(d, lx - 1, fy, 10, H - fy, OUTLINE)


def draw_books(d):
    """A stack of books on the desk, left."""
    x = 26
    stack = [(58, RED, 11), (52, BLUE, 9), (60, GREEN, 10)]
    base = DESK_Y
    for w, ramp, h in stack:
        y = base - h
        fill(d, x, y, w, h, ramp[1])
        hline(d, x, y, w, ramp[0])
        hline(d, x, y + h - 1, w, ramp[3])
        vline(d, x + w - 4, y, h, ramp[2])           # pages edge shade
        fill(d, x + w - 3, y + 1, 3, h - 2, HANJI[1])  # page block
        for py in range(y + 2, y + h - 1, 3):
            hline(d, x + w - 3, py, 3, HANJI[3])
        hline(d, x + 4, y + h // 2, w - 10, ramp[3])  # spine band
        frame(d, x - 1, y - 1, w + 2, h + 1, OUTLINE)
        base = y
        x += 3
    drop_shadow(d, 24, DESK_Y, 64)


def draw_lamp(d):
    """Oil lamp on the desk, right, with a warm dithered glow."""
    cx = 268
    # glow (feathered, clipped to the desk top)
    K.warm_glow(d, cx, 70, 38, GOLD, clip_y=DESK_Y)
    # base
    fill(d, cx - 9, 92, 18, 8, BRASS[2])
    hline(d, cx - 9, 92, 18, BRASS[0])
    frame(d, cx - 10, 91, 20, 9, OUTLINE)
    fill(d, cx - 4, 86, 8, 6, BRASS[1])
    # glass chimney with flame
    fill(d, cx - 6, 64, 12, 22, HANJI[0])
    dither(d, cx + 1, 66, 5, 18, GOLD[0], phase=0)
    frame(d, cx - 7, 63, 14, 23, OUTLINE)
    fill(d, cx - 2, 70, 4, 10, GOLD[1])          # flame
    fill(d, cx - 1, 72, 2, 7, RED[1])
    fill(d, cx - 7, 60, 14, 4, METAL[2])
    frame(d, cx - 8, 59, 16, 5, OUTLINE)


def draw_brushpot(d):
    x = 96
    fill(d, x, DESK_Y - 18, 16, 18, WOODD[1])
    hline(d, x, DESK_Y - 18, 16, WOODD[0])
    vline(d, x + 14, DESK_Y - 16, 14, WOODD[3])
    frame(d, x - 1, DESK_Y - 19, 18, 19, OUTLINE)
    for i, bx in enumerate((x + 3, x + 8, x + 12)):
        bh = 14 + i * 2
        vline(d, bx, DESK_Y - 18 - bh, bh, WOODD[2])
        fill(d, bx - 1, DESK_Y - 18 - bh, 3, 4, OUTLINE)  # brush tip
        d.point((bx, DESK_Y - 18 - bh - 1), fill=RED[2])


def draw_teacup(d):
    x, y = 224, DESK_Y - 12
    fill(d, x, y, 16, 11, HANJI[1])
    hline(d, x, y, 16, HANJI[0])
    hline(d, x, y + 10, 16, HANJI[3])
    d.ellipse([x + 1, y - 3, x + 15, y + 3], fill=HANJI[2], outline=OUTLINE)
    d.ellipse([x + 3, y - 2, x + 13, y + 2], fill=WOODD[2])  # tea
    d.ellipse([x + 14, y + 2, x + 21, y + 9], outline=OUTLINE)  # handle
    frame(d, x - 1, y - 1, 18, 12, OUTLINE)
    for sx in (x + 5, x + 9):  # steam
        d.point((sx, y - 5), fill=HANJI[0])
        d.point((sx + 1, y - 7), fill=HANJI[0])


def draw_plant(d):
    x = 300
    fill(d, x - 6, DESK_Y - 10, 12, 10, FLOOR[2])
    hline(d, x - 6, DESK_Y - 10, 12, FLOOR[1])
    frame(d, x - 7, DESK_Y - 11, 14, 11, OUTLINE)
    for lx, ly in ((x - 4, -18), (x, -22), (x + 3, -17), (x - 1, -14)):
        fill(d, lx, DESK_Y + ly, 4, 8, GREEN[1])
        d.point((lx + 1, DESK_Y + ly), fill=GREEN[0])
    fill(d, x - 1, DESK_Y - 14, 2, 6, GREEN[3])


def draw_board(d):
    """The focal study board on the desk: 는 | 가 (glyphs added in main)."""
    x, y, w, h = 120, 50, 92, 54
    # little easel feet behind
    d.line([x + 8, y + h, x + 2, y + h + 8], fill=WOODD[2])
    d.line([x + w - 8, y + h, x + w - 2, y + h + 8], fill=WOODD[2])
    drop_shadow(d, x, DESK_Y, w)
    # wood frame
    fill(d, x, y, w, h, WOODD[1])
    hline(d, x, y, w, WOODD[0])
    fill(d, x + 1, y + h - 4, w - 2, 3, WOODD[3])
    frame(d, x, y, w, h, OUTLINE)
    # inner panel, split halves
    ix, iy, iw, ih = x + 5, y + 5, w - 10, h - 13
    half = iw // 2
    fill(d, ix, iy, half, ih, HANJI[0])           # left: cream (는)
    fill(d, ix + half, iy, iw - half, ih, BLUE[1])  # right: blue (가)
    hline(d, ix, iy, half, HANJI[1])
    hline(d, ix + half, iy, iw - half, BLUE[0])
    dither(d, ix + half, iy + ih - 6, iw - half, 6, BLUE[2], phase=0)
    # divider
    fill(d, ix + half - 1, iy, 2, ih, WOODD[2])
    frame(d, ix, iy, iw, ih, OUTLINE)
    # label strip
    fill(d, x + 6, y + h - 8, w - 12, 5, HANJI[2])
    return (ix, iy, iw, ih, half)


def sparkle(d, cx, cy, c=GOLD[0]):
    d.point((cx, cy - 2), fill=c)
    d.point((cx - 2, cy), fill=c)
    d.point((cx, cy), fill=c)
    d.point((cx + 2, cy), fill=c)
    d.point((cx, cy + 2), fill=c)


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_back(d)
    draw_window(d)
    draw_scroll(d)
    draw_desk(d)
    draw_books(d)
    draw_brushpot(d)
    draw_lamp(d)
    draw_teacup(d)
    draw_plant(d)
    ix, iy, iw, ih, half = draw_board(d)

    # focal glyphs on the board
    K.glyph(img, "는", ix + half // 2, iy + ih // 2 - 1, 30, fill_c=OUTLINE)
    K.glyph(img, "가", ix + half + (iw - half) // 2, iy + ih // 2 - 1, 30,
            fill_c=HANJI[0], outline_c=OUTLINE)

    # sparkles in the lamp glow + over the board
    sparkle(d, 250, 48, GOLD[0])
    sparkle(d, 166, 44, GOLD[0])

    K.save_cover(img, "particles-cover.png")
    K.preview(img, "preview_particles.png", scale=3)
    K.card_sim(img, "card_particles.png")


if __name__ == "__main__":
    main()
