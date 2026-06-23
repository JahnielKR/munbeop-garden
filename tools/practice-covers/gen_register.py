#!/usr/bin/env python3
"""Cover — 높임법 연구소 (Honorifics). A hanok tea room: a younger person bowing
(절) toward a seated elder across a low tea table, paper-screen wall and a 높임
calligraphy scroll. The bow + elder read as register / respect."""
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
PINK, NIGHT = PAL["pink"], PAL["night"]

SKIN = HANJI[0]
WALL_B = 94
FLOOR_Y = 100


def draw_back(d):
    # paper-screen (shoji) wall: hanji panels in a wood lattice
    hanji_wall(d, 0, 0, W, WALL_B)
    dither(d, 150, 0, 170, 60, GOLD[0], phase=1)
    for bx in range(0, W + 1, 64):  # vertical mullions
        fill(d, bx, 0, 5, WALL_B, WOODL[1])
        vline(d, bx, 0, WALL_B, WOODL[0])
        vline(d, bx + 4, 0, WALL_B, WOODD[2])
    for by in (30, 62):            # horizontal rails
        fill(d, 0, by, W, 4, WOODL[1])
        hline(d, 0, by, W, WOODL[0])
        hline(d, 0, by + 3, W, WOODD[2])
    fill(d, 0, 0, W, 8, WOODD[1])  # top beam
    hline(d, 0, 8, W, OUTLINE)
    # skirting + ondol floor
    fill(d, 0, WALL_B, W, 6, WOODD[1])
    hline(d, 0, WALL_B, W, WOODD[0])
    hline(d, 0, WALL_B + 5, W, OUTLINE)
    wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, FLOOR, plank_h=12, seam_every=2)


def draw_scroll(d):
    """Hanging scroll, upper-left, carrying the 높임 label (glyph in main)."""
    x, y, w, h = 16, 14, 44, 60
    fill(d, x - 3, y - 3, w + 6, 4, WOODD[2])
    frame(d, x - 3, y - 3, w + 6, 4, OUTLINE)
    fill(d, x, y, w, h, HANJI[0])
    frame(d, x, y, w, h, HANJI[3])
    frame(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)
    fill(d, x - 3, y + h, w + 6, 3, WOODD[2])
    frame(d, x - 3, y + h, w + 6, 3, OUTLINE)
    vline(d, x + w // 2, y + h + 3, 5, RED[3])


def cushion(d, cx, w, ramp):
    y = 122
    fill(d, cx - w // 2, y, w, 10, ramp[1])
    hline(d, cx - w // 2, y, w, ramp[0])
    hline(d, cx - w // 2, y + 9, w, ramp[3])
    fill(d, cx - w // 2 - 2, y + 2, 2, 6, ramp[2])
    fill(d, cx + w // 2, y + 2, 2, 6, ramp[2])
    frame(d, cx - w // 2 - 2, y - 1, w + 4, 12, OUTLINE)
    drop_shadow(d, cx - w // 2 - 2, y + 11, w + 4)


def draw_table(d):
    """Low tea table (소반) center with a teapot and two cups."""
    cx = 168
    top_y = 110
    fill(d, cx - 34, top_y, 68, 7, WOODL[1])
    hline(d, cx - 34, top_y, 68, WOODL[0])
    hline(d, cx - 34, top_y + 6, 68, WOODD[2])
    frame(d, cx - 35, top_y - 1, 70, 9, OUTLINE)
    for lx in (cx - 28, cx + 22):
        fill(d, lx, top_y + 7, 6, 16, WOODD[1])
        frame(d, lx - 1, top_y + 7, 8, 17, OUTLINE)
    drop_shadow(d, cx - 34, top_y + 23, 68)
    # teapot
    fill(d, cx - 12, top_y - 12, 22, 12, BLUE[1])
    d.ellipse([cx - 12, top_y - 16, cx + 10, top_y - 4], fill=BLUE[1], outline=OUTLINE)
    fill(d, cx - 11, top_y - 12, 20, 6, BLUE[0])
    fill(d, cx + 9, top_y - 12, 6, 4, BLUE[2])   # spout
    d.point((cx + 14, top_y - 13), fill=BLUE[2])
    fill(d, cx - 3, top_y - 19, 6, 4, BLUE[2])   # lid knob
    d.ellipse([cx - 14, top_y - 16, cx - 8, top_y - 4], outline=OUTLINE)  # handle
    frame(d, cx - 13, top_y - 13, 24, 13, OUTLINE)
    for sx in (cx - 2, cx + 2):  # steam
        d.point((sx, top_y - 22), fill=HANJI[0])
        d.point((sx + 1, top_y - 25), fill=HANJI[0])
    # two cups
    for ox in (-26, 18):
        fill(d, cx + ox, top_y - 4, 10, 5, HANJI[1])
        d.ellipse([cx + ox, top_y - 7, cx + ox + 9, top_y - 2], fill=HANJI[2],
                  outline=OUTLINE)
        frame(d, cx + ox - 1, top_y - 5, 11, 6, OUTLINE)


def draw_elder(d):
    """Seated elder on the right — grey beard + a 갓 (scholar's hat), facing left."""
    cx = 240
    cushion(d, cx, 70, BLUE)
    # seated lower body (durumagi robe), trapezoid
    for i, yy in enumerate(range(94, 122, 2)):
        half = 16 + i
        fill(d, cx - half, yy, half * 2, 2, GRAY[1] if i % 2 else GRAY[0])
    fill(d, cx - 30, 118, 60, 6, GRAY[2])
    frame(d, cx - 32, 92, 64, 32, OUTLINE)
    # jeogori jacket + vest
    fill(d, cx - 20, 74, 40, 24, HANJI[0])
    hline(d, cx - 20, 74, 40, HANJI[1])
    fill(d, cx - 20, 94, 40, 4, HANJI[2])
    fill(d, cx - 9, 76, 18, 20, BLUE[1])         # vest
    d.line([cx - 9, 76, cx, 90], fill=BLUE[2])
    d.line([cx + 9, 76, cx, 90], fill=BLUE[2])
    fill(d, cx - 18, 88, 36, 3, RED[2])           # sash
    frame(d, cx - 20, 74, 40, 24, OUTLINE)
    # hands folded in lap
    fill(d, cx - 13, 96, 26, 8, HANJI[1])
    frame(d, cx - 13, 96, 26, 8, OUTLINE)
    # head (facing left)
    d.ellipse([cx - 13, 52, cx + 11, 76], fill=SKIN, outline=OUTLINE)
    # long grey beard flowing down
    for i, w in enumerate((14, 11, 8, 5)):
        fill(d, cx - w // 2 - 1, 70 + i * 3, w, 3, GRAY[2] if i % 2 else GRAY[3])
    # face: gentle eyes + brows (facing the bow, on the left)
    d.point((cx - 8, 62), fill=OUTLINE); d.point((cx - 7, 62), fill=OUTLINE)
    d.point((cx - 2, 62), fill=OUTLINE); d.point((cx - 1, 62), fill=OUTLINE)
    hline(d, cx - 9, 59, 4, GRAY[3]); hline(d, cx - 3, 59, 4, GRAY[3])
    # 갓 — black horsehair scholar's hat (brim + crown): "respected elder"
    d.ellipse([cx - 18, 46, cx + 16, 56], fill=NIGHT[3], outline=OUTLINE)  # brim
    dither(d, cx - 14, 49, 28, 4, NIGHT[2], phase=0)
    fill(d, cx - 8, 34, 16, 14, NIGHT[3])         # crown
    fill(d, cx - 8, 34, 16, 3, NIGHT[2])
    dither(d, cx - 6, 38, 12, 8, NIGHT[2], phase=1)
    frame(d, cx - 9, 33, 18, 15, OUTLINE)


def draw_youth(d):
    """Younger person on the left — kneeling, head bowed, hands joined (공수).

    Built like the elder (clear head + torso + base) but smaller, lower and
    head-bowed, so the deference reads at a glance."""
    cx = 92
    cushion(d, cx, 66, RED)
    # folded legs / seat (blue hanbok pants)
    for i, yy in enumerate(range(104, 122, 2)):
        half = 13 + i
        fill(d, cx - half, yy, half * 2, 2, BLUE[1] if i % 2 else BLUE[0])
    fill(d, cx - 22, 118, 44, 6, BLUE[2])
    frame(d, cx - 24, 102, 48, 22, OUTLINE)
    # jeogori torso, leaning a touch toward the elder
    fill(d, cx - 15, 86, 32, 20, RED[1])
    hline(d, cx - 15, 86, 32, RED[0])
    fill(d, cx - 15, 102, 32, 4, RED[2])
    d.line([cx - 2, 88, cx + 2, 100], fill=HANJI[1])   # collar V
    d.line([cx + 6, 88, cx + 2, 100], fill=HANJI[1])
    frame(d, cx - 15, 86, 32, 20, OUTLINE)
    # head, clearly bowed (low + dark hair sweeping over the crown)
    hx, hy = cx - 4, 68
    d.ellipse([hx, hy, hx + 20, hy + 20], fill=SKIN, outline=OUTLINE)
    d.ellipse([hx, hy - 2, hx + 20, hy + 12], fill=WOODD[3])   # hair over the bowed crown
    fill(d, hx + 7, hy - 5, 6, 5, WOODD[3])                    # topknot
    # downcast eyes near the lower-front of the face (toward the elder)
    d.point((hx + 11, hy + 14), fill=OUTLINE); d.point((hx + 12, hy + 14), fill=OUTLINE)
    d.point((hx + 15, hy + 14), fill=OUTLINE); d.point((hx + 16, hy + 14), fill=OUTLINE)
    frame(d, hx, hy, 20, 20, OUTLINE)
    # joined hands (공수) raised in front of the chest — the formal greeting
    jx = cx + 2
    fill(d, jx, 95, 16, 9, SKIN)
    hline(d, jx, 95, 16, HANJI[1])
    vline(d, jx + 8, 95, 9, WOODD[2])     # seam between the two joined hands
    frame(d, jx - 1, 94, 18, 11, OUTLINE)


def main():
    img, d = K.new_canvas(bg=HANJI[1])
    draw_back(d)
    draw_scroll(d)
    K.glyph(img, "높임", 38, 44, 24, fill_c=OUTLINE)
    draw_elder(d)
    draw_youth(d)
    draw_table(d)
    K.sparkle(d, 210, 70, GOLD[0])
    K.sparkle(d, 120, 84, GOLD[0])

    K.save_cover(img, "register-cover.png")
    K.preview(img, "preview_register.png", scale=3)
    K.card_sim(img, "card_register.png")


if __name__ == "__main__":
    main()
