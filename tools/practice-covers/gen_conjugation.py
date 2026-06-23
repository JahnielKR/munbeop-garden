#!/usr/bin/env python3
"""Cover — 활용 연습 (Conjugation). A study easel board showing the
transformation 가다 -> 가요, with a brush tray, a stool of flashcards, a plant
and dawn window light. The arrow + two forms read instantly as 'conjugation'."""
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

FLOOR_Y = 142
BX, BY, BW, BH = 80, 20, 156, 86


def draw_back(d):
    hanji_wall(d, 0, 0, W, FLOOR_Y)
    dither(d, 150, 0, 170, 60, GOLD[0], phase=1)  # light wash from window
    fill(d, 0, FLOOR_Y - 6, W, 6, WOODD[1])
    hline(d, 0, FLOOR_Y - 6, W, WOODD[0])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, FLOOR, plank_h=10, seam_every=2)
    for y in range(150, H):  # warm vignette bottom-left
        for x in range(0 + (y % 2), 56 - (y % 3) * 6, 3):
            d.point((x, y), fill=FLOOR[2])


def draw_easel(d):
    # back leg + two splayed front legs to the floor
    d.line([BX + BW // 2, BY + 6, BX + BW // 2 + 6, FLOOR_Y], fill=WOODD[2])
    for x0, x1 in ((BX + 24, BX - 2), (BX + BW - 24, BX + BW + 2)):
        fill(d, min(x0, x1), BY + BH, abs(x1 - x0) + 4, 2, WOODD[1])
        d.line([x0, BY + BH, x1, FLOOR_Y], fill=WOODD[2])
        d.line([x0 + 1, BY + BH, x1 + 1, FLOOR_Y], fill=WOODD[3])
        fill(d, x1 - 1, FLOOR_Y - 2, 5, 3, WOODD[3])  # foot
    drop_shadow(d, BX, FLOOR_Y - 2, BW)
    # board frame + cream face
    fill(d, BX, BY, BW, BH, WOODD[1])
    hline(d, BX, BY, BW, WOODD[0])
    fill(d, BX + 1, BY + BH - 4, BW - 2, 3, WOODD[3])
    frame(d, BX, BY, BW, BH, OUTLINE)
    fill(d, BX + 6, BY + 6, BW - 12, BH - 18, HANJI[0])
    hline(d, BX + 6, BY + 6, BW - 12, HANJI[1])
    dither(d, BX + 6, BY + BH - 16, BW - 12, 4, HANJI[2], phase=0)
    frame(d, BX + 6, BY + 6, BW - 12, BH - 18, OUTLINE)
    # brush tray
    fill(d, BX + 10, BY + BH - 6, BW - 20, 5, WOODL[1])
    hline(d, BX + 10, BY + BH - 6, BW - 20, WOODL[0])
    frame(d, BX + 9, BY + BH - 7, BW - 18, 7, OUTLINE)
    # a brush + a stick of chalk resting in the tray
    d.line([BX + 22, BY + BH - 4, BX + 40, BY + BH - 4], fill=WOODD[2])
    fill(d, BX + 20, BY + BH - 5, 4, 3, OUTLINE)
    fill(d, BX + BW - 36, BY + BH - 5, 12, 3, HANJI[2])


def draw_arrow(d, x, y, w):
    """Chunky brass arrow pointing right, vertically centered at y."""
    fill(d, x, y - 3, w - 8, 7, BRASS[1])
    hline(d, x, y - 3, w - 8, BRASS[0])
    hline(d, x, y + 3, w - 8, BRASS[3])
    for i in range(9):  # arrowhead
        fill(d, x + w - 8 - 0, y - 9 + i, 1, 1, None)
    hx = x + w - 12
    for i in range(7):
        fill(d, hx + i, y - 7 + i, 2, 2, BRASS[1])
        fill(d, hx + i, y + 6 - i, 2, 2, BRASS[1])
    frame(d, x, y - 3, w - 8, 7, OUTLINE)


def draw_stool(d):
    """Low stool with a leaning stack of ending-flashcards, right of easel."""
    x, y = 250, 104
    fill(d, x, y, 44, 8, WOODL[1])
    hline(d, x, y, 44, WOODL[0])
    frame(d, x - 1, y - 1, 46, 10, OUTLINE)
    for lx in (x + 4, x + 36):
        fill(d, lx, y + 8, 5, FLOOR_Y - (y + 8), WOODD[1])
        frame(d, lx - 1, y + 8, 7, FLOOR_Y - (y + 8) + 1, OUTLINE)
    drop_shadow(d, x, FLOOR_Y - 2, 44)
    # flashcards leaning against the stool
    for i, (off, ramp) in enumerate(((0, RED), (4, BLUE), (8, GREEN))):
        cx = x + 6 + i * 9
        fill(d, cx, y - 26 + off, 16, 24, HANJI[0])
        hline(d, cx, y - 26 + off, 16, ramp[1])
        hline(d, cx, y - 26 + off + 1, 16, ramp[2])
        for ly in range(y - 18 + off, y - 4 + off, 4):
            hline(d, cx + 3, ly, 10, GRAY[2])
        frame(d, cx - 1, y - 27 + off, 18, 26, OUTLINE)


def draw_plant(d):
    x = 16
    fill(d, x, 120, 18, 18, FLOOR[2])
    hline(d, x, 120, 18, FLOOR[1])
    fill(d, x, 120, 18, 4, FLOOR[1])
    frame(d, x - 1, 119, 20, 19, OUTLINE)
    for lx, ly in ((x + 2, 100), (x + 7, 94), (x + 12, 99), (x + 4, 106), (x + 13, 106)):
        fill(d, lx, ly, 4, 12, GREEN[1])
        d.point((lx + 1, ly), fill=GREEN[0])
        vline(d, lx + 1, ly, 12, GREEN[2])
    fill(d, x + 7, 98, 3, 14, GREEN[3])


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_back(d)
    K.dawn_window(d, 250, 14, 54, 42)
    draw_plant(d)
    draw_easel(d)
    cy = BY + 6 + (BH - 18) // 2
    K.glyph(img, "가다", BX + 40, cy, 26, fill_c=OUTLINE)
    draw_arrow(d, BX + 70, cy, 26)
    K.glyph(img, "가요", BX + 122, cy, 26, fill_c=PAL["red"][3])
    draw_stool(d)
    K.sparkle(d, BX + 132, BY + 16, GOLD[0])
    K.sparkle(d, 240, 70, GOLD[0])

    K.save_cover(img, "conjugation-cover.png")
    K.preview(img, "preview_conjugation.png", scale=3)
    K.card_sim(img, "card_conjugation.png")


if __name__ == "__main__":
    main()
