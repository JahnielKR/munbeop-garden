#!/usr/bin/env python3
"""Cover — Number Market (숫자 시장). A dusk market sign-stall where everything
is a number: a glowing wooden price board reads ₩12,000 with its Korean tiles
'만 이천 원', a round wall clock tells 3:15, a small stack of brass coins sits on
the counter, and two paper lanterns swing overhead. Distinct from the bright
daylight counter-lab fruit stall — this one is the after-dark numbers market."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import coverkit as K
from coverkit import (OUTLINE, PAL, dither, drop_shadow, fill, frame,
                      hanji_wall, hline, vline, wood_planks)

WOODL, WOODD = PAL["wood_light"], PAL["wood_dark"]
HANJI, FLOOR = PAL["hanji"], PAL["floor"]
DAWN, GOLD = PAL["dawn"], PAL["gold_light"]
GREEN, BLUE = PAL["green"], PAL["blue"]
METAL, BRASS = PAL["metal"], PAL["brass"]
RED, GRAY = PAL["red"], PAL["gray"]

COUNTER_Y = 132


def draw_sky(d):
    """Dusk sky fading to the hanji market wall behind the counter."""
    # deep blue dusk band up top, dithering down into a warmer wall
    fill(d, 0, 0, K.W, 46, BLUE[3])
    dither(d, 0, 40, K.W, 12, BLUE[2], phase=0)
    hanji_wall(d, 0, 46, K.W, COUNTER_Y - 46 + 2)
    dither(d, 0, 46, K.W, 16, BLUE[2], phase=1)  # dusk haze on the wall
    # a few faint stars
    for sx, sy in ((58, 14), (96, 26), (210, 12), (262, 22), (150, 9)):
        d.point((sx, sy), fill=GOLD[0])


def lantern(d, cx, top, drop):
    """A round paper lantern on a string, glowing."""
    vline(d, cx, top, drop, WOODD[3])
    cy = top + drop + 9
    K.warm_glow(d, cx, cy, 16, ramp=RED)
    d.ellipse([cx - 9, cy - 8, cx + 9, cy + 8], fill=RED[1], outline=OUTLINE)
    d.ellipse([cx - 6, cy - 7, cx + 3, cy - 1], fill=RED[0])  # sheen
    vline(d, cx, cy - 8, 16, RED[3])  # paper ribs
    vline(d, cx - 5, cy - 7, 14, RED[3])
    vline(d, cx + 5, cy - 7, 14, RED[3])
    fill(d, cx - 4, cy - 10, 8, 3, WOODD[2])  # top cap
    fill(d, cx - 3, cy + 8, 6, 3, GOLD[1])    # bottom tassel
    vline(d, cx, cy + 11, 4, RED[3])


def clock(d, cx, cy, r=20):
    """A round wall clock reading 3:15 (native hour + Sino minute)."""
    drop_shadow(d, cx - r, cy + r, r * 2)
    d.ellipse([cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2], fill=WOODD[2], outline=OUTLINE)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=HANJI[0], outline=OUTLINE)
    # hour ticks
    for ang in range(0, 12):
        import math
        a = math.radians(ang * 30)
        tx = cx + int((r - 3) * math.sin(a))
        ty = cy - int((r - 3) * math.cos(a))
        d.point((tx, ty), fill=OUTLINE)
    # hands: hour → 3 (right), minute → 12 (up). Clean, unambiguous "3 o'clock".
    fill(d, cx, cy - 1, r - 7, 2, OUTLINE)        # hour hand pointing right
    fill(d, cx - 1, cy - (r - 5), 2, r - 5, OUTLINE)  # minute hand pointing up
    d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=BRASS[0], outline=OUTLINE)


def coin(d, cx, cy, r=8):
    d.ellipse([cx - r, cy - r + 3, cx + r, cy + r], fill=BRASS[1], outline=OUTLINE)
    d.ellipse([cx - r, cy - r, cx + r, cy + r - 3], fill=BRASS[0], outline=OUTLINE)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 1], outline=BRASS[2])  # square-ish hole hint
    fill(d, cx - 1, cy - 3, 2, 5, BRASS[2])
    fill(d, cx - 3, cy - 1, 6, 2, BRASS[2])


def draw_coins(d):
    """A little stack + a couple of loose coins on the counter, right side."""
    coin(d, 268, COUNTER_Y - 6, 9)
    coin(d, 268, COUNTER_Y - 10, 9)
    coin(d, 290, COUNTER_Y - 5, 8)
    coin(d, 248, COUNTER_Y - 4, 7)


def draw_counter(d):
    wood_planks(d, 0, COUNTER_Y, K.W, K.H - COUNTER_Y, FLOOR, plank_h=11, seam_every=2)
    fill(d, 0, COUNTER_Y, K.W, 12, WOODL[1])
    hline(d, 0, COUNTER_Y, K.W, WOODL[0])
    hline(d, 0, COUNTER_Y + 11, K.W, WOODD[2])
    frame(d, -1, COUNTER_Y - 1, K.W + 2, 13, OUTLINE)
    fill(d, 0, COUNTER_Y + 12, K.W, K.H - COUNTER_Y - 12, WOODL[2])
    for gx in range(40, K.W, 64):
        vline(d, gx, COUNTER_Y + 12, K.H - COUNTER_Y - 12, WOODD[2])
    hline(d, 0, COUNTER_Y + 12, K.W, WOODD[3])


def draw_board(d, img):
    """The hero: a hanging wooden price board — ₩12,000 over its Korean tiles."""
    cx = 150
    bx, by, bw, bh = cx - 66, 40, 132, 70
    # two hanger strings up to the dark sky
    vline(d, bx + 16, 28, by - 28, WOODD[3])
    vline(d, bx + bw - 16, 28, by - 28, WOODD[3])
    d.point((bx + 16, 28), fill=OUTLINE)
    d.point((bx + bw - 16, 28), fill=OUTLINE)
    K.warm_glow(d, cx, by + 30, 70, ramp=GOLD, clip_y=COUNTER_Y - 2)
    drop_shadow(d, bx, by + bh, bw)
    # wooden frame
    fill(d, bx - 4, by - 4, bw + 8, bh + 8, WOODD[1])
    frame(d, bx - 4, by - 4, bw + 8, bh + 8, OUTLINE)
    for gx in range(bx - 4, bx + bw + 4, 10):
        vline(d, gx, by - 4, 3, WOODD[3])
        vline(d, gx, by + bh + 1, 3, WOODD[3])
    # hanji face
    fill(d, bx, by, bw, bh, HANJI[0])
    dither(d, bx, by, bw, bh, HANJI[1], phase=1)
    fill(d, bx + 2, by + bh - 4, bw - 4, 3, HANJI[3])
    frame(d, bx, by, bw, bh, WOODD[2])
    hline(d, bx + 6, by + 34, bw - 12, WOODD[2])  # divider rule
    # ₩ price (hero) on top, Korean reading tiles below
    K.glyph(img, "₩12,000", cx, by + 18, 26, fill_c=RED[3], outline_c=HANJI[0])
    # tiles "만 이천 원"
    tiles = ["만", "이천", "원"]
    tw, gap = 30, 6
    total = len(tiles) * tw + (len(tiles) - 1) * gap
    tx = cx - total // 2
    for t in tiles:
        ty = by + 42
        fill(d, tx, ty, tw, 22, GOLD[1])
        hline(d, tx, ty, tw, GOLD[0])
        frame(d, tx, ty, tw, 22, WOODD[2])
        K.glyph(img, t, tx + tw // 2, ty + 11, 16, fill_c=WOODD[3])
        tx += tw + gap


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_sky(d)
    lantern(d, 32, 0, 22)
    lantern(d, 288, 0, 14)
    clock(d, 44, 92, 20)
    draw_counter(d)
    draw_coins(d)
    draw_board(d, img)
    K.sparkle(d, 150, 30, GOLD[0])
    K.sparkle(d, 110, 50, GOLD[0])
    K.sparkle(d, 190, 52, GOLD[0])

    K.save_cover(img, "number-market-cover.png")
    K.preview(img, "preview_number_market.png", scale=3)
    K.card_sim(img, "card_number_market.png")


if __name__ == "__main__":
    main()
