#!/usr/bin/env python3
"""Cover — Escape Room. A lantern-lit locked room: barred window (you're shut
in), a hanging lantern, a clue table with a brass key + note, and the big
locked door with warm light leaking out underneath (the way out)."""
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
NIGHT = PAL["night"]

FLOOR_Y = 142


def draw_back(d):
    # warm but dim wall — a touch of night at the top corners for "locked room"
    hanji_wall(d, 0, 0, W, FLOOR_Y)
    # darker upper band (dim room)
    dither(d, 0, 0, W, 26, GRAY[1], phase=0)
    dither(d, 0, 0, W, 14, GRAY[2], phase=1)
    # skirting
    fill(d, 0, FLOOR_Y - 6, W, 6, WOODD[1])
    hline(d, 0, FLOOR_Y - 6, W, WOODD[0])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    # ondol plank floor
    wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, FLOOR, plank_h=10, seam_every=2)
    # warm corner vignette (bottom-left, away from the door light)
    for y in range(150, H):
        for x in range(0 + (y % 2), 70 - (y % 3) * 6, 3):
            d.point((x, y), fill=FLOOR[2])


def draw_window(d):
    """Small high barred window, upper-left — dawn sky beyond the bars."""
    x, y, w, h = 26, 22, 50, 42
    # faint cool light spill on the wall around it
    dither(d, x - 4, y - 4, w + 8, h + 10, GRAY[0], phase=1)
    fill(d, x - 2, y - 2, w + 4, h + 4, OUTLINE)
    fill(d, x, y, w, h, NIGHT[3])
    # dawn sky bands (dim — it's barely dawn outside)
    sx, sy, sw, sh = x + 2, y + 2, w - 4, h - 4
    bands = [(NIGHT[2], 9), (DAWN[4], 8), (DAWN[3], 8), (DAWN[2], 7), (DAWN[1], 6)]
    yy = sy
    for c, bh in bands:
        fill(d, sx, yy, sw, bh, c)
        dither(d, sx, yy + bh - 1, sw, 2, c, phase=yy % 2)
        yy += bh
    # iron bars (vertical) — you can see out but not get out
    for bx in range(sx + 6, sx + sw - 2, 11):
        fill(d, bx, sy, 3, sh, METAL[3])
        vline(d, bx, sy, sh, METAL[2])
    hline(d, sx, y + h // 2, sw, METAL[3])
    # wood frame + sill
    frame(d, x, y, w, h, WOODD[2])
    fill(d, x - 4, y + h, w + 8, 4, WOODL[1])
    hline(d, x - 4, y + h, w + 8, WOODL[0])
    hline(d, x - 4, y + h + 3, w + 8, OUTLINE)


def draw_lantern(d):
    """Hanging paper lantern, center-left, lighting the clue corner."""
    cx = 118
    # chain from the ceiling
    for cy in range(0, 30, 4):
        d.point((cx, cy), fill=METAL[2])
        d.point((cx, cy + 1), fill=METAL[3])
    fill(d, cx - 2, 28, 5, 4, WOODD[2])
    # warm glow behind the lantern
    K.warm_glow(d, cx, 50, 44, GOLD)
    # lantern body (hanji, warm lit)
    fill(d, cx - 11, 34, 22, 30, GOLD[1])
    fill(d, cx - 11, 34, 22, 4, GOLD[0])
    dither(d, cx - 11, 56, 22, 8, GOLD[2], phase=0)
    vline(d, cx - 11, 34, 30, RED[2])
    vline(d, cx + 10, 34, 30, RED[2])
    # ribs
    for ry in (42, 50, 58):
        hline(d, cx - 11, ry, 22, BRASS[2])
    # caps
    fill(d, cx - 8, 31, 16, 4, RED[2])
    hline(d, cx - 8, 31, 16, RED[1])
    fill(d, cx - 8, 64, 16, 4, RED[2])
    # tiny tassel
    vline(d, cx, 68, 5, RED[3])
    frame(d, cx - 11, 34, 22, 30, OUTLINE)
    frame(d, cx - 8, 30, 16, 5, OUTLINE)


def draw_table(d):
    """Low wooden table under the lantern — holds the key and the clue note."""
    x, y, w = 74, 106, 86
    drop_shadow(d, x, FLOOR_Y - 2, w)
    # top
    fill(d, x, y, w, 8, WOODL[1])
    hline(d, x, y, w, WOODL[0])
    hline(d, x, y + 7, w, WOODD[2])
    frame(d, x - 1, y - 1, w + 2, 10, OUTLINE)
    # legs
    for lx in (x + 4, x + w - 8):
        fill(d, lx, y + 8, 5, FLOOR_Y - (y + 8), WOODD[1])
        vline(d, lx + 4, y + 8, FLOOR_Y - (y + 8), WOODD[3])
        frame(d, lx - 1, y + 8, 7, FLOOR_Y - (y + 8) + 1, OUTLINE)
    # apron
    fill(d, x + 2, y + 8, w - 4, 4, WOODD[1])


def draw_note(d):
    """Hanji clue note leaning on the table, with scribbles + a red circle."""
    x, y, w, h = 86, 78, 30, 28
    # shadow
    fill(d, x + 2, y + 2, w, h, HANJI[3])
    fill(d, x, y, w, h, HANJI[0])
    frame(d, x, y, w, h, HANJI[2])
    frame(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)
    for ly, lw in ((y + 6, 20), (y + 10, 15), (y + 14, 22), (y + 18, 12)):
        hline(d, x + 4, ly, lw, GRAY[2])
    # a clue circled in red
    d.ellipse([x + 14, y + 17, x + 24, y + 25], outline=RED[2])
    d.ellipse([x + 15, y + 18, x + 23, y + 24], outline=RED[1])


def draw_key(d):
    """Brass key lying flat on the table top."""
    x, y = 122, 100
    # ring (bow)
    d.ellipse([x, y - 4, x + 10, y + 6], outline=BRASS[2], width=2)
    d.ellipse([x + 2, y - 2, x + 8, y + 4], fill=None, outline=BRASS[1])
    # shaft
    fill(d, x + 10, y, 22, 3, BRASS[1])
    hline(d, x + 10, y, 22, BRASS[0])
    hline(d, x + 10, y + 2, 22, BRASS[3])
    # bit (teeth)
    fill(d, x + 26, y + 3, 3, 4, BRASS[1])
    fill(d, x + 30, y + 3, 3, 5, BRASS[1])
    # shine
    d.point((x + 3, y - 2), fill=GOLD[0])


def draw_door(d):
    """The big locked exit — wood planks, iron hinges, brass lock, light leak."""
    x, y, w, h = 178, 16, 104, FLOOR_Y - 16
    # warm halo of light escaping around the door edges
    dither(d, x - 6, y, 6, h, GOLD[2], phase=0)
    # frame (stone-wood jamb)
    fill(d, x - 6, y - 6, w + 12, 6, WOODD[1])
    fill(d, x - 6, y - 6, 6, h + 6, WOODD[1])
    fill(d, x + w, y - 6, 6, h + 6, WOODD[1])
    hline(d, x - 6, y - 6, w + 12, WOODD[0])
    frame(d, x - 6, y - 6, w + 12, h + 12, OUTLINE)
    # door slab
    fill(d, x, y, w, h, WOODL[2])
    # vertical planks
    for px in range(x, x + w, 16):
        vline(d, px, y, h, WOODD[2])
        vline(d, px + 1, y, h, WOODL[1])
    for px in range(x + 6, x + w, 16):
        vline(d, px, y, h, WOODL[0])
    # top + bottom rails
    fill(d, x, y, w, 10, WOODL[1])
    hline(d, x, y, w, WOODL[0])
    fill(d, x, y + h - 12, w, 12, WOODL[1])
    hline(d, x, y + h - 12, w, WOODD[2])
    # two cross braces
    for by in (y + 30, y + h - 40):
        fill(d, x + 4, by, w - 8, 7, WOODD[1])
        hline(d, x + 4, by, w - 8, WOODL[1])
        hline(d, x + 4, by + 6, w - 8, WOODD[3])
    # iron hinges on the left
    for hy in (y + 18, y + h - 28):
        fill(d, x + 2, hy, 26, 8, METAL[2])
        hline(d, x + 2, hy, 26, METAL[1])
        hline(d, x + 2, hy + 7, 26, METAL[3])
        for sx in (x + 5, x + 24):
            d.point((sx, hy + 3), fill=OUTLINE)
        frame(d, x + 2, hy, 26, 8, OUTLINE)
    frame(d, x, y, w, h, OUTLINE)
    # brass lock plate + keyhole (right side, centered)
    lx, ly = x + w - 30, y + h // 2 - 14
    fill(d, lx, ly, 22, 30, BRASS[2])
    fill(d, lx, ly, 22, 4, BRASS[0])
    fill(d, lx, ly, 4, 30, BRASS[1])
    hline(d, lx, ly + 29, 22, BRASS[3])
    frame(d, lx, ly, 22, 30, OUTLINE)
    # keyhole
    cx2, cy2 = lx + 11, ly + 12
    d.ellipse([cx2 - 4, cy2 - 4, cx2 + 4, cy2 + 4], fill=OUTLINE)
    fill(d, cx2 - 2, cy2, 4, 11, OUTLINE)
    d.point((cx2 - 1, cy2 - 2), fill=GOLD[0])
    # handle ring
    d.ellipse([lx + 4, ly + 20, lx + 18, ly + 30], outline=BRASS[3], width=2)


def draw_light_leak(d):
    """Golden light spilling out from under the door across the floor."""
    bx = 178
    # bright bar right under the door
    fill(d, bx - 2, FLOOR_Y - 2, 104, 3, GOLD[0])
    dither(d, bx - 2, FLOOR_Y + 1, 104, 3, GOLD[0], phase=0)
    # pool fanning out to the left across the planks
    for y in range(FLOOR_Y, H):
        spread = (y - FLOOR_Y) * 3
        x0 = bx - spread
        for x in range(max(x0, 2) + (y % 2), bx + 96, 2):
            d.point((x, y), fill=GOLD[1])
    for y in range(FLOOR_Y + 2, H):
        spread = (y - FLOOR_Y) * 2
        x0 = bx - spread
        for x in range(max(x0, 2) + ((y + 1) % 2), bx + 60, 2):
            d.point((x, y), fill=GOLD[0])


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
    draw_door(d)
    draw_light_leak(d)
    draw_lantern(d)
    draw_table(d)
    draw_note(d)
    draw_key(d)
    # dust motes in the lantern glow + a glint at the keyhole
    for sx, sy in ((100, 40), (132, 60), (108, 78)):
        sparkle(d, sx, sy, GOLD[0])
    sparkle(d, 250, 78, GOLD[0])

    K.save_cover(img, "escape-cover.png")
    K.preview(img, "preview_escape.png", scale=3)
    K.card_sim(img, "card_escape.png")


if __name__ == "__main__":
    main()
