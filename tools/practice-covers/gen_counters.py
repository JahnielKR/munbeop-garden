#!/usr/bin/env python3
"""Cover — Counter Lab (수 분류사). A bright market stall: a striped awning, a
wooden counter, a basket of THREE red apples and a hanging '3개' tag — numbers
+ classifiers, counted the Korean way."""
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

COUNTER_Y = 116


def draw_back(d):
    hanji_wall(d, 0, 0, W, COUNTER_Y + 2)
    dither(d, 0, 0, W, 30, GOLD[0], phase=1)  # bright daylight wash


def draw_awning(d):
    """Scalloped striped awning across the top."""
    fill(d, 0, 0, W, 26, RED[1])
    for sx in range(0, W, 24):
        fill(d, sx, 0, 12, 26, HANJI[0])
    hline(d, 0, 0, W, RED[0])
    fill(d, 0, 24, W, 4, WOODD[2])
    hline(d, 0, 27, W, OUTLINE)
    # scalloped lower edge (semicircle dips)
    for sx in range(0, W, 24):
        d.ellipse([sx, 24, sx + 24, 40], fill=RED[1])
        d.ellipse([sx + 6, 24, sx + 18, 36], fill=HANJI[0])
        frame(d, sx, 24, 24, 16, OUTLINE)
    drop_shadow(d, 0, 42, W)


def draw_counter(d):
    wood_planks(d, 0, COUNTER_Y, W, H - COUNTER_Y, FLOOR, plank_h=11, seam_every=2)
    fill(d, 0, COUNTER_Y, W, 12, WOODL[1])
    hline(d, 0, COUNTER_Y, W, WOODL[0])
    hline(d, 0, COUNTER_Y + 11, W, WOODD[2])
    dither(d, 200, COUNTER_Y + 2, 110, 8, GOLD[0], phase=1)
    frame(d, -1, COUNTER_Y - 1, W + 2, 13, OUTLINE)
    # front board with a couple of planks
    fill(d, 0, COUNTER_Y + 12, W, 30, WOODL[2])
    for gx in range(40, W, 64):
        vline(d, gx, COUNTER_Y + 12, 30, WOODD[2])
    hline(d, 0, COUNTER_Y + 40, W, WOODD[3])


def draw_chili(d):
    """A hanging string of dried chili, left, for market flavour."""
    x = 30
    d.point((x, 30), fill=OUTLINE)
    vline(d, x, 30, 26, WOODD[3])
    for i, (px, side) in enumerate(((40, -1), (46, 1), (52, -1), (58, 1), (64, -1))):
        bx = x + side * 3 - 2
        fill(d, bx, px, 5, 9, RED[1])
        vline(d, bx + 4, px + 1, 7, RED[3])
        d.point((bx + 1, px + 1), fill=RED[0])
        d.point((x + side, px - 1), fill=GREEN[2])
        frame(d, bx - 1, px - 1, 7, 11, OUTLINE)


def draw_crate(d):
    """A wooden crate of green produce, right back."""
    x, y, w, h = 250, COUNTER_Y - 26, 56, 26
    fill(d, x, y, w, h, WOODL[2])
    for gy in range(y, y + h, 8):
        hline(d, x, gy, w, WOODD[2])
    for gx in range(x, x + w, 14):
        vline(d, gx, y, h, WOODD[2])
    frame(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)
    # round green produce poking over the top
    for i, cx in enumerate(range(x + 8, x + w - 4, 14)):
        d.ellipse([cx, y - 9, cx + 12, y + 3], fill=GREEN[1], outline=OUTLINE)
        d.ellipse([cx + 2, y - 7, cx + 7, y - 2], fill=GREEN[0])


def apple(d, cx, cy, r=12):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=RED[2], outline=OUTLINE)
    d.ellipse([cx - r + 2, cy - r + 2, cx + r - 4, cy + r - 6], fill=RED[1])
    d.ellipse([cx - r + 4, cy - r + 3, cx - r + 9, cy - r + 8], fill=RED[0])  # shine
    dither(d, cx - 2, cy + 2, r, r - 2, RED[3], phase=0)  # shaded side
    vline(d, cx, cy - r - 3, 4, WOODD[3])  # stem
    fill(d, cx + 1, cy - r - 3, 5, 3, GREEN[1])  # leaf
    d.point((cx + 3, cy - r - 2), fill=GREEN[0])


def draw_basket(d):
    """Woven basket holding three apples on the counter."""
    bx, by, bw, bh = 96, COUNTER_Y - 14, 96, 26
    # apples first (sit in the basket)
    apple(d, bx + 24, by - 2, 13)
    apple(d, bx + 72, by - 2, 13)
    apple(d, bx + 48, by - 8, 14)
    # basket body in front
    fill(d, bx, by + 4, bw, bh, WOODD[1])
    for gx in range(bx, bx + bw, 10):
        vline(d, gx, by + 4, bh, WOODD[3])
    for gy in range(by + 6, by + 4 + bh, 7):
        hline(d, bx, gy, bw, WOODD[0])
    fill(d, bx - 3, by + 1, bw + 6, 5, WOODL[1])  # rim
    hline(d, bx - 3, by + 1, bw + 6, WOODL[0])
    frame(d, bx - 3, by, bw + 6, 6, OUTLINE)
    frame(d, bx, by + 4, bw, bh, OUTLINE)
    drop_shadow(d, bx - 3, by + 4 + bh, bw + 6)


def draw_tag(d, img):
    """Wooden '3개' price tag hanging from the awning over the basket."""
    cx = 150
    vline(d, cx, 40, 18, WOODD[3])  # string
    tx, ty, tw, th = cx - 28, 56, 56, 30
    drop_shadow(d, tx, ty + th, tw)
    fill(d, tx, ty, tw, th, HANJI[0])
    hline(d, tx, ty, tw, HANJI[1])
    fill(d, tx + 1, ty + th - 3, tw - 2, 2, HANJI[3])
    frame(d, tx, ty, tw, th, WOODD[2])
    frame(d, tx - 1, ty - 1, tw + 2, th + 2, OUTLINE)
    d.ellipse([cx - 3, ty - 1, cx + 3, ty + 5], outline=OUTLINE)  # hole/grommet
    K.glyph(img, "3개", cx, ty + th // 2, 22, fill_c=RED[3])


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_back(d)
    draw_chili(d)
    draw_crate(d)
    draw_counter(d)
    draw_basket(d)
    draw_awning(d)
    draw_tag(d, img)
    K.sparkle(d, 120, COUNTER_Y - 24, GOLD[0])
    K.sparkle(d, 182, COUNTER_Y - 22, GOLD[0])

    K.save_cover(img, "counters-cover.png")
    K.preview(img, "preview_counters.png", scale=3)
    K.card_sim(img, "card_counters.png")


if __name__ == "__main__":
    main()
