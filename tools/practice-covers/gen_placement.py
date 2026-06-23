#!/usr/bin/env python3
"""Cover — Placement. An outdoor garden staircase climbing TOPIK levels 1->6 up
a green hill to a gold flag, under a dawn sky. 'Find your level' in a few steps."""
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
PINK = PAL["pink"]

BASE_X, BASE_Y, DX, DY = 14, 150, 46, 15
TREAD_W, TREAD_H = 70, 9


def draw_sky(d):
    bands = [(DAWN[4], 14), (DAWN[3], 14), (DAWN[2], 14), (DAWN[1], 16),
             (DAWN[0], 14), (GOLD[0], 16)]
    yy = 0
    for c, bh in bands:
        fill(d, 0, yy, W, bh, c)
        dither(d, 0, yy + bh - 1, W, 2, c, phase=yy % 2)
        yy += bh
    # rising sun, upper-left
    d.ellipse([34, 18, 70, 54], fill=GOLD[0])
    d.ellipse([40, 24, 64, 48], fill=DAWN[0])
    # soft clouds
    for (cx, cy, cw) in ((120, 24, 40), (250, 40, 52)):
        d.ellipse([cx, cy, cx + cw, cy + 14], fill=HANJI[0])
        d.ellipse([cx + 10, cy - 6, cx + cw - 8, cy + 10], fill=HANJI[0])
        dither(d, cx, cy + 8, cw, 4, DAWN[0], phase=0)


def draw_hill(d):
    # rolling green hill rising to the right, behind the steps
    for x in range(0, W):
        h = 96 + int((x / W) * -26)  # horizon dips slightly toward the right top
        for y in range(h, H):
            pass
    # simpler: two green bands following the staircase rise
    pts = []
    for x in range(0, W + 1):
        top = 104 - int((x / W) * 40)
        pts.append((x, top))
    for x, top in pts:
        vline(d, x, top, H - top, GREEN[2])
    # lighter sunlit grass on top edge + texture
    for x, top in pts:
        d.point((x, top), fill=GREEN[0])
        d.point((x, top + 1), fill=GREEN[1])
    for gy in range(110, H, 10):
        for gx in range((gy) % 6, W, 6):
            d.point((gx, gy), fill=GREEN[3])
    # a winding warm path hint up the middle
    for i in range(7):
        px = BASE_X + i * DX + 30
        py = BASE_Y - i * DY + 6
        dither(d, px - 6, py, 14, 6, FLOOR[1], phase=0)


def step_top(i):
    return BASE_X + i * DX, BASE_Y - i * DY - TREAD_H


def draw_steps(d, img):
    # draw from back (top-right, step6) to front (step1) so fronts overlap
    for i in range(5, -1, -1):
        tx, ty = step_top(i)
        # riser down to the next-lower tread
        riser_h = DY + TREAD_H
        fill(d, tx, ty, TREAD_W, riser_h + TREAD_H, GRAY[1])
        # tread slab (sunlit)
        fill(d, tx, ty, TREAD_W, TREAD_H, GRAY[0])
        hline(d, tx, ty, TREAD_W, HANJI[1])
        hline(d, tx, ty + TREAD_H - 1, TREAD_W, GRAY[2])
        # riser face shading + stone seams
        fill(d, tx, ty + TREAD_H, TREAD_W, riser_h, GRAY[1])
        dither(d, tx, ty + TREAD_H, TREAD_W, riser_h, GRAY[2], phase=i % 2)
        for sx in range(tx + 8, tx + TREAD_W - 6, 22):
            vline(d, sx, ty + TREAD_H + 2, riser_h - 3, GRAY[2])
        frame(d, tx, ty, TREAD_W, TREAD_H + riser_h, OUTLINE)
        # number medallion on the RIGHT of the riser (not hidden by the next step)
        mx, my = tx + TREAD_W - 26, ty + TREAD_H + 4
        d.ellipse([mx, my, mx + 16, my + 16], fill=HANJI[0], outline=OUTLINE)
        d.ellipse([mx + 1, my + 1, mx + 15, my + 15], outline=BRASS[2])
        K.glyph(img, str(i + 1), mx + 8, my + 8, 13, fill_c=WOODD[3])


def draw_flag(d):
    """Gold flag planted on the top step."""
    tx, ty = step_top(5)
    px = tx + TREAD_W - 18
    vline(d, px, ty - 34, 34, WOODD[3])
    vline(d, px + 1, ty - 34, 34, WOODD[1])
    d.point((px, ty - 35), fill=BRASS[1])
    # pennant (stair-stepped triangle)
    for i, ph in enumerate(range(0, 18, 2)):
        wseg = 22 - i
        if wseg <= 0:
            break
        fill(d, px + 2, ty - 34 + ph, wseg, 2, BRASS[1] if i % 2 else GOLD[0])
    hline(d, px + 2, ty - 34, 20, GOLD[0])
    frame(d, px + 2, ty - 34, 22, 16, OUTLINE)
    drop_shadow(d, tx, ty, TREAD_W)


def draw_start_post(d, img):
    """A small signpost at the bottom — the start of the climb."""
    tx, ty = step_top(0)
    px = tx - 2
    vline(d, px, ty - 4, 30, WOODD[2])
    vline(d, px + 1, ty - 4, 30, WOODD[3])
    fill(d, px - 12, ty - 18, 18, 12, WOODL[1])
    hline(d, px - 12, ty - 18, 18, WOODL[0])
    fill(d, px + 4, ty - 14, 4, 3, WOODD[2])  # arrow pointing up the steps
    frame(d, px - 13, ty - 19, 20, 14, OUTLINE)
    K.glyph(img, "급", px - 3, ty - 12, 12, fill_c=WOODD[3])


def main():
    img, d = K.new_canvas(bg=DAWN[0])
    draw_sky(d)
    draw_hill(d)
    draw_steps(d, img)
    draw_start_post(d, img)
    draw_flag(d)
    # cherry petals + sparkles drifting
    for px, py in ((96, 60), (180, 80), (210, 50), (140, 100)):
        fill(d, px, py, 3, 2, PINK[1])
        d.point((px + 1, py - 1), fill=PINK[0])
    K.sparkle(d, step_top(5)[0] + 40, step_top(5)[1] - 30, GOLD[0])

    K.save_cover(img, "placement-cover.png")
    K.preview(img, "preview_placement.png", scale=3)
    K.card_sim(img, "card_placement.png")


if __name__ == "__main__":
    main()
