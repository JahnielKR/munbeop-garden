#!/usr/bin/env python3
"""Cinematics for Level 1 — intro (hanok exterior at dawn) + outro (village street).

Both 320x240, opaque, sharing the same PAL["dawn"] banded sky. Style bible:
tools/escape-room-level01/STYLE.md. Deterministic (seeded rng only).

The shared exterior-scene vocabulary (dawn sky, sun, sea, fog, giwa roofs,
lanterns, smoke, stone walls + derived tones) lives in cinematics_lib.py;
this script only keeps the scene-specific sprites and the two compositions.
"""

from __future__ import annotations

import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common
from cinematics_lib import (H, MOUNT_FAR, MOUNT_NEAR, SHADOW_OP, SKIN, SKIN_SH,
                            W, bird, building_shell, dawn_sky, fog_band,
                            giwa_roof, grass_tuft, lattice_window, mountains,
                            onggi_jar, paper_lantern, plank_door, sea_band,
                            smoke_column, stone_wall, sun)
from common import (OUTLINE, PAL, dither, fill, frame, hline, new_canvas,
                    preview, save_asset, vline)


# ── intro: hanok exterior at golden dawn ─────────────────────────────────────

def build_intro():
    img, d = new_canvas(W, H, bg=PAL["dawn"][0])
    HOR = 112  # mountain base / sea top
    dawn_sky(d, HOR)
    for sx, sy in ((24, 8), (70, 18), (150, 6), (210, 14), (288, 9), (118, 26)):
        d.point((sx, sy), fill=PAL["hanji"][0])  # last stars fading out
    sun(d, 226, 110, 11)
    mountains(d, HOR, [(46, 60, 38), (130, 52, 28), (305, 40, 20)], MOUNT_FAR)
    mountains(d, HOR, [(86, 44, 20), (176, 38, 14)], MOUNT_NEAR)
    sea_band(d, 0, HOR, W, 16, sun_x=226)
    hline(d, 0, HOR + 16, W, PAL["floor"][2])  # shoreline
    fog_band(d, 0, HOR + 10, W, rows=4)

    # ground: packed-earth minbak yard
    fill(d, 0, HOR + 17, W, H - HOR - 17, PAL["floor"][1])
    r = random.Random(99)
    for yy in range(HOR + 20, H, 5):
        for xx in range((yy * 3) % 9, W, 9):
            d.point((xx, yy),
                    fill=PAL["floor"][0] if (xx + yy) % 3 else PAL["floor"][2])
    dither(d, 0, H - 14, W, 14, PAL["floor"][2])
    # low fog wisps drifting across the yard
    for fx, fy, fw in ((0, 132, 120), (180, 136, 140), (60, 142, 90)):
        fog_band(d, fx, fy, fw, rows=2)
    for _ in range(70):  # grass
        gx, gy = r.randint(2, W - 3), r.randint(HOR + 26, H - 6)
        if 30 <= gx <= 205 and gy < 216:
            continue  # keep the yard in front of the house clean
        grass_tuft(d, gx, gy)

    # doldam stone walls flanking the yard (behind tree + jars)
    stone_wall(d, 0, 178, 34, 14)
    stone_wall(d, 224, 172, 96, 13)

    # jangdokdae: clay jars in front of the right wall
    fill(d, 226, 198, 52, 6, PAL["gray"][1])
    hline(d, 226, 203, 52, OUTLINE)
    hline(d, 226, 198, 52, PAL["gray"][0])
    onggi_jar(d, 237, 197, 14, 13)
    onggi_jar(d, 254, 197, 12, 11)
    onggi_jar(d, 268, 197, 9, 8)

    # persimmon tree on the right (muted green), in front of the wall
    tx = 292
    common.drop_shadow(d, tx - 16, 208, 34, 3)
    fill(d, tx - 2, 166, 5, 42, PAL["wood_dark"][1])
    vline(d, tx - 2, 166, 42, PAL["wood_dark"][3])
    vline(d, tx + 2, 166, 42, OUTLINE)
    d.line([tx, 168, tx - 9, 158], fill=PAL["wood_dark"][2])  # branches
    d.line([tx + 1, 166, tx + 10, 154], fill=PAL["wood_dark"][2])
    for (bx, by, rr) in [(tx - 13, 152, 11), (tx + 9, 148, 10), (tx - 2, 138, 12),
                         (tx + 14, 158, 8), (tx - 17, 160, 8)]:
        d.ellipse([bx - rr, by - rr, bx + rr, by + rr],
                  fill=PAL["green"][2], outline=OUTLINE)
    for (bx, by, rr) in [(tx - 11, 148, 7), (tx + 7, 144, 6), (tx, 134, 7)]:
        d.ellipse([bx - rr, by - rr, bx + rr, by + rr], fill=PAL["green"][1])
    for _ in range(24):
        ox, oy = r.randint(-20, 18), r.randint(-22, 16)
        if ox * ox + oy * oy < 480:
            d.point((tx + ox + 2, 148 + oy), fill=PAL["green"][0])
    for px, py in ((tx - 10, 150), (tx + 6, 144), (tx, 134), (tx + 12, 157),
                   (tx - 16, 159), (tx - 4, 155)):
        d.point((px, py), fill=PAL["red"][1])              # persimmons
        d.point((px, py - 1), fill=PAL["red"][2])

    # ── the hanok ──
    hx0, hx1 = 38, 198
    wall_top, ground = 152, 212
    fill(d, hx0 + 4, ground - 8, hx1 - hx0 - 8, 8, PAL["gray"][1])
    for sx in range(hx0 + 6, hx1 - 8, 8):
        frame(d, sx, ground - 7, 7, 6, PAL["gray"][3])
    hline(d, hx0 + 4, ground - 1, hx1 - hx0 - 8, OUTLINE)
    common.hanji_wall(d, hx0 + 6, wall_top, hx1 - hx0 - 12, ground - 8 - wall_top)
    for px in (hx0 + 6, hx0 + 52, hx1 - 58, hx1 - 12):
        fill(d, px, wall_top, 6, ground - 8 - wall_top, PAL["wood_dark"][1])
        vline(d, px, wall_top, ground - 8 - wall_top, PAL["wood_dark"][0])
        vline(d, px + 5, wall_top, ground - 8 - wall_top, OUTLINE)
    hline(d, hx0 + 6, wall_top, hx1 - hx0 - 12, PAL["wood_dark"][2])
    lattice_window(d, 62, 162, 22, 26, lit=True)
    lattice_window(d, 152, 162, 22, 26, lit=False)
    fill(d, 104, 158, 30, 46, PAL["wood_dark"][1])  # door
    lattice_window(d, 107, 161, 24, 40, lit=True)
    hline(d, 104, 204, 30, OUTLINE)
    giwa_roof(d, hx0 - 14, hx1 + 14, 122, 152, ridge_frac=0.42, lift=4)
    dither(d, hx0 + 6, wall_top + 1, hx1 - hx0 - 12, 4, SHADOW_OP)
    common.drop_shadow(d, hx0 + 2, ground, hx1 - hx0 - 4, 3)

    # paper lantern by the door (the star of the shot)
    vline(d, 142, 155, 8, OUTLINE)  # cord reaching up to the eave
    paper_lantern(d, 142, 168, 4, 11,
                  ((15, PAL["gold_light"][2]), (11, PAL["gold_light"][1]),
                   (8, PAL["gold_light"][0])), tassel=True)

    # warm light spilling from the door onto the yard (widening trapezoid)
    for i in range(7):
        wdt = 24 + i * 3
        xl = 119 - wdt // 2
        c = PAL["gold_light"][0] if i < 4 else PAL["gold_light"][1]
        dither(d, xl, ground + i, wdt, 1, c, phase=xl)  # checkerboard pool

    # stepping-stone path to the door
    stones = [(166, 234, 13, 6), (152, 224, 11, 5), (138, 216, 10, 4),
              (128, 209, 8, 4), (121, 204, 7, 3)]
    for (sx, sy, sw, sh) in stones:
        common.drop_shadow(d, sx - sw, sy + sh - 1, sw * 2, 2)
        d.ellipse([sx - sw, sy - sh, sx + sw, sy + sh], fill=PAL["gray"][1],
                  outline=OUTLINE)
        d.ellipse([sx - sw + 2, sy - sh + 1, sx + sw - 3, sy], fill=PAL["gray"][0])

    # bushes hugging the house corners
    for bx, by in ((44, 206), (196, 204)):
        d.ellipse([bx - 9, by - 7, bx + 9, by + 2], fill=PAL["green"][2],
                  outline=OUTLINE)
        d.ellipse([bx - 6, by - 6, bx + 4, by - 1], fill=PAL["green"][1])
        common.drop_shadow(d, bx - 8, by + 3, 16)

    return img


# ── outro: village street, cafe at the end, halmeoni waving ─────────────────

def halmeoni(d, x: int, y: int) -> None:
    """~13x20 waving grandma: bun, vest, skirt, floral apron. (x,y)=feet."""
    common.drop_shadow(d, x - 5, y + 1, 11)
    dither(d, x - 11, y + 2, 7, 2, SHADOW_OP, phase=1)  # dawn shadow tail
    fill(d, x - 4, y - 7, 9, 7, PAL["blue"][2])          # skirt
    hline(d, x - 4, y, 9, OUTLINE)
    fill(d, x - 2, y - 7, 5, 6, PAL["hanji"][0])         # apron
    d.point((x - 1, y - 6), fill=PAL["pink"][1])         # apron flowers
    d.point((x + 1, y - 4), fill=PAL["pink"][2])
    d.point((x, y - 2), fill=PAL["pink"][1])
    fill(d, x - 4, y - 12, 9, 5, PAL["red"][2])          # vest
    hline(d, x - 2, y - 12, 5, PAL["red"][1])
    d.point((x - 5, y - 12), fill=OUTLINE)
    d.point((x + 5, y - 12), fill=OUTLINE)
    vline(d, x - 5, y - 11, 4, PAL["red"][3])            # resting arm
    d.point((x - 5, y - 7), fill=SKIN)
    vline(d, x + 5, y - 16, 4, PAL["red"][2])            # waving arm, raised
    fill(d, x + 5, y - 19, 2, 3, SKIN)                   # hand up high
    d.point((x + 6, y - 20), fill=OUTLINE)
    fill(d, x - 2, y - 17, 5, 5, SKIN)                   # face
    d.point((x + 2, y - 14), fill=SKIN_SH)
    d.point((x - 1, y - 15), fill=OUTLINE)               # closed happy eyes
    d.point((x + 1, y - 15), fill=OUTLINE)
    hline(d, x - 2, y - 18, 5, PAL["metal"][1])          # gray hair
    d.point((x - 2, y - 17), fill=PAL["metal"][1])
    fill(d, x - 1, y - 20, 3, 2, PAL["metal"][0])        # bun
    d.point((x, y - 21), fill=OUTLINE)


def bicycle(d, x: int, y: int) -> None:
    """Side-view bicycle with basket. (x,y)=ground under front wheel."""
    r, wb = 8, 30
    common.drop_shadow(d, x - r, y + 1, wb + 2 * r)
    for cx in (x, x + wb):
        d.ellipse([cx - r, y - 2 * r, cx + r, y], outline=OUTLINE, width=1)
        d.line([cx - 5, y - r, cx + 5, y - r], fill=PAL["metal"][2])  # spokes
        d.line([cx, y - r - 5, cx, y - r + 5], fill=PAL["metal"][2])
        d.point((cx, y - r), fill=OUTLINE)                # hub
    fr = PAL["red"][1]
    bb = (x + 17, y - r + 3)                              # bottom bracket
    d.line([x, y - r, x + 6, y - r - 10], fill=fr)        # fork
    d.line([x + 6, y - r - 10, x + 21, y - r - 9], fill=fr)  # top tube
    d.line([x + 21, y - r - 9, bb[0], bb[1]], fill=fr)    # seat tube
    d.line([x + 7, y - r - 9, bb[0], bb[1]], fill=fr)     # down tube
    d.line([bb[0], bb[1], x + wb, y - r], fill=fr)        # chainstay
    d.line([x + 21, y - r - 9, x + wb, y - r], fill=fr)   # seat stay
    fill(d, bb[0] - 1, bb[1] - 1, 3, 3, PAL["metal"][2])  # crank
    hline(d, x + 19, y - r - 12, 6, OUTLINE)              # seat
    vline(d, x + 21, y - r - 11, 3, OUTLINE)
    vline(d, x + 6, y - r - 13, 4, OUTLINE)               # stem
    hline(d, x + 2, y - r - 13, 5, OUTLINE)               # handlebar
    fill(d, x - 4, y - r - 11, 9, 6, PAL["wood_light"][1])  # basket
    hline(d, x - 4, y - r - 9, 9, PAL["wood_light"][3])
    vline(d, x - 2, y - r - 11, 6, PAL["wood_light"][2])
    vline(d, x + 1, y - r - 11, 6, PAL["wood_light"][2])
    frame(d, x - 4, y - r - 11, 9, 6, OUTLINE)


def cat(d, x: int, y: int) -> None:
    """Tiny cat sitting on the seawall. (x,y)=base."""
    fill(d, x, y - 4, 5, 4, PAL["gray"][3])              # body
    fill(d, x + 1, y - 7, 4, 3, PAL["gray"][3])          # head
    d.point((x + 1, y - 8), fill=PAL["gray"][3])         # ears
    d.point((x + 4, y - 8), fill=PAL["gray"][3])
    vline(d, x - 1, y - 4, 3, PAL["gray"][3])            # tail up
    d.point((x - 2, y - 5), fill=PAL["gray"][3])
    d.point((x + 2, y - 6), fill=PAL["gold_light"][1])   # eye catching dawn
    hline(d, x, y, 5, OUTLINE)


def gull(d, x: int, y: int) -> None:
    """Standing seagull, 4px. (x,y)=feet."""
    fill(d, x, y - 2, 3, 2, PAL["hanji"][0])
    d.point((x + 2, y - 3), fill=PAL["hanji"][0])
    d.point((x + 3, y - 3), fill=PAL["brass"][1])        # beak
    d.point((x + 1, y - 2), fill=PAL["gray"][1])         # wing
    d.point((x, y), fill=OUTLINE)


def crates(d, x: int, y: int) -> None:
    """Vegetable crates by a door. (x,y)=bottom-left."""
    common.drop_shadow(d, x, y + 1, 13)
    fill(d, x, y - 7, 12, 8, PAL["wood_light"][1])
    hline(d, x, y - 4, 12, PAL["wood_light"][3])
    frame(d, x, y - 7, 12, 8, OUTLINE)
    for i, gx in enumerate(range(x + 1, x + 11, 3)):
        d.point((gx, y - 8), fill=PAL["green"][1] if i % 2 else PAL["green"][0])


def build_outro():
    img, d = new_canvas(W, H, bg=PAL["dawn"][0])
    HOR = 96
    dawn_sky(d, HOR, lighter=True)
    sun(d, 262, 42, 11)
    for bx, by in ((84, 30), (104, 38), (62, 46), (206, 58), (186, 50)):
        bird(d, bx, by)

    # sea across the whole back + morning haze
    sea_band(d, 0, HOR, W, 22, sun_x=262)
    fog_band(d, 0, HOR + 3, W, rows=3)

    # street trapezoid + dirt shoulders
    fill(d, 0, HOR + 22, W, H - HOR - 22, PAL["floor"][1])  # shoulders base
    rr = random.Random(7)
    for yy in range(HOR + 24, H, 4):
        for xx in range((yy * 5) % 11, W, 11):
            d.point((xx, yy), fill=PAL["floor"][0] if (xx + yy) % 3 else PAL["floor"][2])
    street = [(124, 128), (200, 128), (340, 240), (-40, 240)]
    d.polygon(street, fill=PAL["gray"][1])
    # paving joints widening toward the viewer + brick offsets
    yy, step, row = 132, 5, 0
    while yy < H:
        x_l = 124 + (-164) * (yy - 128) / 112
        x_r = 200 + 140 * (yy - 128) / 112
        hline(d, int(x_l), yy, int(x_r - x_l) + 1, PAL["gray"][2])
        seg = max(10, step * 3)
        for jx in range(int(x_l) + (row % 2) * seg // 2, int(x_r), seg):
            vline(d, jx, yy - step + 1, step - 1, PAL["gray"][2])
        yy += step
        step += 3
        row += 1
    d.line([124, 128, -40, 240], fill=PAL["gray"][3])
    d.line([200, 128, 340, 240], fill=PAL["gray"][3])
    for _ in range(40):  # warm flecks on the pavement
        fx, fy = rr.randint(0, W - 1), rr.randint(132, H - 2)
        d.point((fx, fy), fill=PAL["gray"][0])
    # low sun rakes the street from the right: sparse warm shimmer (seeded rng)
    for _ in range(170):
        yy = rr.randint(132, H - 2)
        x_l = int(124 + (-164) * (yy - 128) / 112)
        x_r = int(200 + 140 * (yy - 128) / 112)
        xx = rr.randint(max(x_l + 2, 0), min(x_r - 2, W - 2))
        u = (xx - x_l) / max(x_r - x_l, 1)
        if rr.random() < u * 0.9:
            d.point((xx, yy), fill=PAL["gold_light"][0])
    # manhole cover + pecking sparrows give the empty street some life
    d.ellipse([124, 196, 146, 204], fill=PAL["gray"][2], outline=PAL["gray"][3])
    hline(d, 129, 199, 13, PAL["gray"][3])
    hline(d, 129, 201, 13, PAL["gray"][3])
    for spx, spy in ((226, 178), (238, 184)):
        fill(d, spx, spy - 2, 3, 2, PAL["wood_dark"][1])   # sparrow body
        d.point((spx + 3, spy - 3), fill=PAL["wood_dark"][2])  # head
        d.point((spx + 4, spy - 3), fill=OUTLINE)          # beak
        d.point((spx + 1, spy - 1), fill=OUTLINE)

    # right: low seawall with sea behind, gulls + cat on top
    stone_wall(d, 206, 112, 114, 13)
    for yy in range(126, 134):  # seawall casts a soft band onto the shoulder
        dither(d, 206 - (yy - 125), yy, 114, 1, SHADOW_OP, phase=yy)
    gull(d, 224, 112)
    gull(d, 296, 112)
    cat(d, 240, 111)

    # ── left buildings ──
    # building A (foreground): hanji wall, beams, two windows, door, banner
    ax, aw, atop, abase = 0, 88, 84, 150
    building_shell(d, ax, aw, atop, abase, (ax, ax + 40, ax + aw - 5), pw=5,
                   roof_top=60, chimney_x=ax + 22)
    hline(d, ax, atop + 32, aw, PAL["wood_dark"][2])  # mid beam
    lattice_window(d, ax + 12, atop + 12, 18, 14, lit=True)
    lattice_window(d, ax + 56, atop + 12, 18, 14, lit=False)
    plank_door(d, ax + 14, atop + 38, 18, 28)
    d.point((ax + 28, atop + 52), fill=PAL["brass"][1])
    fill(d, ax + 56, atop + 36, 12, 18, PAL["red"][2])   # cloth banner
    dither(d, ax + 56, atop + 46, 12, 8, PAL["red"][3])
    frame(d, ax + 56, atop + 36, 12, 18, OUTLINE)
    hline(d, ax + 58, atop + 41, 8, PAL["hanji"][0])     # illegible scribble
    hline(d, ax + 58, atop + 44, 6, PAL["hanji"][0])

    # building B (middle): smaller cousin
    bx, bw, btop, bbase = 92, 48, 102, 140
    building_shell(d, bx, bw, btop, bbase, (bx, bx + bw - 4), roof_top=88,
                   chimney_x=bx + 22)
    lattice_window(d, bx + 8, btop + 10, 12, 10, lit=True)
    plank_door(d, bx + 26, btop + 14, 12, 24)
    crates(d, bx - 2, bbase + 4)

    # ── the cafe at the end of the street ──
    cx0, cy0, cw, cbase = 142, 98, 62, 134
    building_shell(d, cx0, cw, cy0, cbase, (cx0, cx0 + cw - 4), roof_top=86)
    ay = cy0 + 8  # striped awning, scalloped hem
    for i, sx in enumerate(range(cx0 + 2, cx0 + cw - 2, 6)):
        c = PAL["red"][1] if i % 2 == 0 else PAL["hanji"][0]
        fill(d, sx, ay, 6, 6, c)
        d.ellipse([sx, ay + 4, sx + 5, ay + 8], fill=c, outline=OUTLINE)
    hline(d, cx0 + 2, ay, cw - 4, OUTLINE)
    lattice_window(d, cx0 + 7, ay + 12, 14, 12, lit=True)
    fill(d, cx0 + 40, ay + 10, 14, cbase - ay - 10, PAL["wood_dark"][1])  # door
    fill(d, cx0 + 42, ay + 12, 10, cbase - ay - 14, PAL["gold_light"][1])
    dither(d, cx0 + 42, ay + 12, 10, cbase - ay - 14, PAL["gold_light"][0])
    frame(d, cx0 + 40, ay + 10, 14, cbase - ay - 10, OUTLINE)
    # mini paper lantern by the cafe door — same motif as the intro hanok
    paper_lantern(d, cx0 + 31, ay + 14, 2, 6,
                  ((6, PAL["gold_light"][1]), (4, PAL["gold_light"][0])))
    # warm glow from the open cafe door onto the street
    for i in range(5):
        wdt = 12 + i * 2
        xl = cx0 + 47 - wdt // 2
        dither(d, xl, cbase + i, wdt, 1, PAL["gold_light"][0],
               phase=xl)  # checkerboard pool
    # flower planters flanking the cafe
    for fx in (cx0 + 2, cx0 + cw + 4):
        fill(d, fx, cbase + 2, 10, 6, PAL["wood_light"][2])
        frame(d, fx, cbase + 2, 10, 6, OUTLINE)
        for i, px in enumerate(range(fx + 1, fx + 9, 3)):
            d.point((px, cbase), fill=PAL["pink"][1] if i % 2 else PAL["red"][1])
            d.point((px, cbase + 1), fill=PAL["green"][1])
        common.drop_shadow(d, fx - 1, cbase + 8, 12)

    # grass tufts + dandelions on both dirt shoulders
    for gx, gy in ((10, 196), (30, 214), (52, 200), (16, 228), (44, 232),
                   (250, 150), (282, 162), (308, 148), (262, 188), (296, 206),
                   (314, 178), (276, 226), (302, 232)):
        grass_tuft(d, gx, gy)
    for fx, fy in ((24, 206), (288, 174), (270, 212)):
        d.point((fx, fy), fill=PAL["brass"][0])
        d.point((fx, fy + 1), fill=PAL["green"][2])

    # breakfast smoke, drawn after roofs so it starts at the chimney mouths
    smoke_column(d, 25, 44, 42, drift=16, seed=7)
    smoke_column(d, 117, 74, 30, drift=12, seed=8)

    # halmeoni waving in front of the cafe door
    halmeoni(d, 174, 148)

    # bicycle leaning by building A on the dirt shoulder
    bicycle(d, 18, 172)

    # telephone pole on the right + sagging cables exiting frame left
    for t in range(0, 18, 2):  # short shadow stub away from the low sun
        dither(d, 300 + t // 2, 188 + t, 6, 2, SHADOW_OP, phase=t)
    common.drop_shadow(d, 292, 187, 14)
    fill(d, 296, 68, 4, 118, PAL["wood_dark"][2])
    vline(d, 299, 68, 118, OUTLINE)
    hline(d, 286, 74, 24, PAL["wood_dark"][3])
    hline(d, 288, 82, 20, PAL["wood_dark"][3])
    # OUTLINE against sky; muted gray where they pass over roof A (x<94)
    d.line([296, 76, 150, 68], fill=OUTLINE)
    d.line([150, 68, 94, 70], fill=OUTLINE)
    d.line([94, 70, 0, 74], fill=PAL["gray"][3])
    d.line([296, 84, 120, 78], fill=OUTLINE)
    d.line([120, 78, 94, 79], fill=OUTLINE)
    d.line([94, 79, 0, 84], fill=PAL["gray"][3])

    return img


def main() -> None:
    intro = build_intro()
    outro = build_outro()
    save_asset(intro, "rooms", "cinematic-intro.png")
    save_asset(outro, "rooms", "cinematic-outro.png")
    preview(intro, "preview_cinematic_intro.png")
    preview(outro, "preview_cinematic_outro.png")


if __name__ == "__main__":
    main()
