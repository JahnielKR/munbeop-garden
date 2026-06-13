#!/usr/bin/env python3
"""room-02-daeungjeon-complete.png — 대웅전, STATE B "altar completo" (Cuarto 2).

Dossier §6 Cuarto 2 estado B: the on-screen SWAP shown the instant the player
resolves Slot 2. SAME camera / columns / lantern wall / floor as STATE A
(room-02-daeungjeon.png) so the swap is seamless — ONLY the altar changes:
candles LIT, fruit stacked in a pyramid, white chrysanthemums standing in their
vases, a 1px incense smoke rising straight. In STATE B the altar becomes the
WARMEST point of the scene (STYLE rule 8: focal point = highest contrast).

CRITICAL invariants kept identical to STATE A (rule L2-e + seamless swap):
  · lantern wall 7×7 with lantern 49 (top-right) UNLIT in THIS state too.
  · red 단청 columns + cross-beam framing the salón.
  · open back doors showing the rain curtain; storm-gray key light.
  · left low table with the ritual sheet under a stone; 목탁 on its cushion.
  · the 영정 master portrait + the 위패 tablet on the altar plinth.

Layout (320×240, frontal-flat like every room):
  BACK-CENTER : altar plinth with a small gilt Buda; in front the 영정 + 위패.
  RIGHT WALL  : 49-lantern grid via lantern_wall (49 stays unlit).
  LEFT        : low table, ritual sheet pinned by a stone (SLOT2); 목탁 cushion.
  FRAME       : 단청 columns L+R + a cross-beam; open doors + rain at the back.

Shared builders: lantern_wall, dancheong_column, dancheong_beam, moktak,
portrait_yeongjeong, rain_curtain, hanji_wall, wood_planks, glow, drop_shadow.
Everything else (altar body, candles, fruit pyramid, vases+mums, incense, the
left table, the gilt Buda) is asset-local detail painted AROUND the builders.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-02-daeungjeon-complete.py
"""

from __future__ import annotations

import math

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow, glow

W, H = 320, 240
FLOOR_Y = 150            # wall/floor seam (STYLE: y≈140–155)

# Hotspot rects — same coords as room-02 (STYLE table, 320×240 space).
RECTS = [
    (28, 128, 52, 44),   # ritual-sheet (SLOT2)
    (282, 32, 28, 32),   # lantern-49 — UNLIT in this state too (SLOT3 trigger)
    (88, 148, 30, 30),   # moktak (cosmetic)
    (148, 68, 32, 38),   # portrait 영정 (cosmetic)
]

# Lantern wall geometry — shared by STATE A + B so lantern 49 lands identically.
# The 7×7 grid sits in the right bay (between the back doors at x≈202 and the
# right red column at x≈300). step_x=12 → width 6*12+16=88px (x 206..294).
# The UNLIT col-6 tile must center inside the SLOT3 rect [282,32,28,32] (center
# (296,48)): col-6 x = 206+72 = 278 → body center (278+8, 32+12) = (286,44),
# inside the rect. LW_Y=32 puts the unlit body top at y=38 (rect top 32). OK.
LW_X, LW_Y = 206, 32
LW_STEP_X, LW_STEP_Y = 12, 16  # tight grid so 7 rows fit (32..32+96=128 < floor)


# ── Background: warm-gray ritual hall, dim wood floor ────────────────────────

def paint_room_shell(d):
    """Hanji paper wall (storm-dimmed) + warm worn plank floor of the salón."""
    # back wall — warm hanji paper, but storm-dimmed (a cool film over it) so the
    # altar's restored warmth reads as the brightest thing in the room.
    C.hanji_wall(d, 0, 0, W, FLOOR_Y, ramp=PAL["hanji"])
    dither(d, 0, 0, W, FLOOR_Y, PAL["rain"][2], phase=1)     # cool storm film
    dither(d, 0, 0, W, 18, PAL["rain"][3], phase=0)          # darker near ceiling
    # wood skirting board at the wall/floor seam
    fill(d, 0, FLOOR_Y - 5, W, 5, PAL["wood_dark"][1])
    hline(d, 0, FLOOR_Y - 5, W, PAL["wood_light"][2])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    # floor — warm worn ritual planks, slightly damp (storm light)
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["floor"], plank_h=9,
                  seam_every=3)
    dither(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["rain"][2], phase=0)  # cool damp film
    dither(d, 0, H - 14, W, 14, PAL["rain"][3], phase=1)     # darker near camera


# ── BACK: open doors + rain curtain (storm key light) ────────────────────────

def paint_back_doors(d):
    """Open temple doors at the back-center showing the cold rain beyond."""
    # the doorway is centered behind the altar (center x≈150), between columns.
    dx, dy, dw, dh = 108, 14, 84, 96
    # cold exterior void seen through the open doors
    fill(d, dx, dy, dw, dh, PAL["rain"][3])
    dither(d, dx, dy, dw, dh, PAL["rain"][4], phase=0)
    C.rain_curtain(d, dx, dy, dw, dh, phase=0, density=8, lean=2)
    # eave / lintel shadow at the top of the opening
    fill(d, dx, dy, dw, 4, PAL["rain"][4])
    frame(d, dx, dy, dw, dh, OUTLINE)
    # the two door leaves flung open against the wall (a hanji leaf each side)
    for lx in (dx - 16, dx + dw):
        fill(d, lx, dy, 16, dh, PAL["hanji"][2])
        dither(d, lx, dy, 16, dh, PAL["rain"][2], phase=1)   # storm-dim the paper
        for ry in range(dy + 16, dy + dh, 18):               # door rails
            hline(d, lx, ry, 16, PAL["wood_dark"][2])
        frame(d, lx, dy, 16, dh, OUTLINE)
    # threshold board along the floor under the doorway
    fill(d, dx - 16, dy + dh, dw + 32, 4, PAL["wood_dark"][2])
    hline(d, dx - 16, dy + dh, dw + 32, PAL["wood_dark"][1])


# ── 단청 frame: red columns L+R + a cross-beam over the salón ─────────────────

def paint_dancheong_frame(d):
    """Red 기둥 columns flanking the scene + a 단청 보 cross-beam up top."""
    # cross-beam spanning the salón just under the ceiling
    C.dancheong_beam(d, 0, 0, W, 14)
    # left + right red columns (기둥) standing on the floor. The right column at
    # x=300 sits just right of the lantern wall (which ends at x≈294).
    C.dancheong_column(d, 6, 14, FLOOR_Y - 14, 16)
    C.dancheong_column(d, 300, 14, FLOOR_Y - 14, 16)
    # contact shadow where each column foot meets the floor
    drop_shadow(d, 6, FLOOR_Y, 16, 3)
    drop_shadow(d, 300, FLOOR_Y, 16, 3)


# ── RIGHT WALL: the 49-lantern grid (49 stays UNLIT) ─────────────────────────

def paint_lantern_wall(d):
    """7×7 hanging lanterns on the right bay; the top-right one (49) stays unlit.

    lantern_wall keeps 49 unlit via unlit_col/unlit_row (rule L2-e). The unlit
    col-6/row-0 tile body center (286,44) lands inside SLOT3 rect [282,32,28,32].
    Tiles overlap (step_x=12 < 16px), so we RE-DRAW lantern 49 last (unlit) on top
    so no warm neighbor halo bleeds into it — it reads unambiguously gray.
    """
    # a dim recessed back-board behind the lanterns so they read as a WALL of them
    bw = 6 * LW_STEP_X + 16 + 4          # grid width + a small margin
    bh = 6 * LW_STEP_Y + 24 + 4          # grid height (tiles are ~24 tall)
    fill(d, LW_X - 4, LW_Y - 4, bw, bh, PAL["wood_dark"][3])
    dither(d, LW_X - 4, LW_Y - 4, bw, bh, PAL["rain"][4], phase=0)
    C.lantern_wall(d, LW_X, LW_Y, cols=7, rows=7,
                   step_x=LW_STEP_X, step_y=LW_STEP_Y,
                   unlit_col=6, unlit_row=0)
    # re-stamp lantern 49 unlit on top so no warm neighbor halo bleeds into it
    C.lantern_tile(d, LW_X + 6 * LW_STEP_X, LW_Y, lit=False)


# ── LEFT: low table + ritual sheet under a stone (SLOT2) + 목탁 cushion ───────

def paint_left_table(d):
    """Low table holding the ritual instruction sheet pinned by a stone (SLOT2).

    The ritual-sheet hotspot is [28,128,52,44], visual center ≈ (54,150). The
    sheet+stone are placed so their center lands there. The 목탁 sits to the right
    of the table on its cushion, center inside [88,148,30,30] (≈ (103,163)).
    """
    # --- the low table (a thin slab on two short legs) ---
    tx, ty, tw = 22, 132, 66
    drop_shadow(d, tx - 2, ty + 26, tw + 4, 3)
    for lx in (tx + 4, tx + tw - 9):                         # short legs
        fill(d, lx, ty + 8, 5, 18, PAL["wood_dark"][2])
        vline(d, lx, ty + 8, 18, PAL["wood_dark"][1])
        frame(d, lx, ty + 8, 5, 18, OUTLINE)
    fill(d, tx + 6, ty + 9, tw - 12, 3, PAL["wood_dark"][3])  # apron rail
    fill(d, tx, ty, tw, 8, PAL["wood_light"][2])             # slab top
    hline(d, tx, ty, tw, PAL["wood_light"][1])               # lit lip
    dither(d, tx, ty + 5, tw, 3, PAL["wood_dark"][1], phase=0)
    frame(d, tx, ty, tw, 8, OUTLINE)

    # --- the ritual sheet: a hanji leaf with SUGGESTED ink rows (illegible 1×) ---
    sx, sy, sw, sh = 32, 118, 40, 22
    drop_shadow(d, sx, sy + sh, sw, 2)
    fill(d, sx, sy, sw, sh, PAL["hanji"][0])                 # bright paper leaf
    dither(d, sx + sw - 8, sy + 2, 8, sh - 4, PAL["hanji"][2], phase=0)  # curl shade
    frame(d, sx, sy, sw, sh, PAL["wood_dark"][3])
    # the humidity-blurred word: one row is a smeared rain-gray blot (the canon
    # "la palabra que la humedad borró"); the rest are dry ink ticks (NOT glyphs).
    ink, faint = PAL["ink"][1], PAL["ink"][0]
    for i, ly in enumerate(range(sy + 4, sy + sh - 3, 4)):
        if i == 2:                                           # the washed-out row
            dither(d, sx + 5, ly - 1, sw - 12, 3, PAL["rain"][1], phase=1)
            d.point((sx + 8, ly), fill=PAL["rain"][2])       # ink bleed into wet
        else:
            for cx in range(sx + 4, sx + sw - 5, 7):         # ink "characters"
                hline(d, cx, ly, 4, ink if i % 2 else faint)
                d.point((cx + 1, ly + 1), fill=faint)
    # the pinning stone (a small dark river pebble) holding the sheet down
    d.ellipse([sx + sw // 2 - 5, sy + sh - 6, sx + sw // 2 + 5, sy + sh + 2],
              fill=PAL["stone"][2], outline=OUTLINE)
    d.point((sx + sw // 2 - 2, sy + sh - 4), fill=PAL["stone"][0])  # lit top
    dither(d, sx + sw // 2, sy + sh - 3, 4, 3, PAL["stone"][3], phase=0)

    # --- the 목탁 on its cushion, just right of the table (cosmetic) ---
    # moktak() draws ~22×18 from its top-left; place at (92,150) → body center
    # ≈ (103,159), inside [88,148,30,30] (center 103,163).
    C.moktak(d, 92, 150)


# ── CENTER-BACK: the altar — STATE B "completo" (the warm focal point) ───────

def paint_altar_complete(d):
    """The restored altar: gilt Buda + 영정/위패, candles LIT, fruit pyramid,
    chrysanthemums in vases, a straight 1px incense smoke. The WARMEST point.

    All altar furniture sits on a two-tier wooden plinth centered under the open
    doors. The 영정 portrait center lands in [148,68,32,38] (≈ (164,87)).
    """
    # --- the plinth: a two-tier altar table (제단) centered at the back (cx≈150).
    # Right edge (96+108=204) stays left of the lantern wall (starts x=206).
    ax, ay, aw = 96, 96, 108                 # lower tier top edge
    drop_shadow(d, ax - 2, ay + 28, aw + 4, 3)
    # lower tier (the offering table) — a warm wooden slab with a draped cloth
    fill(d, ax, ay, aw, 8, PAL["wood_light"][2])
    hline(d, ax, ay, aw, PAL["wood_light"][1])
    dither(d, ax, ay + 5, aw, 3, PAL["wood_dark"][1], phase=0)
    frame(d, ax, ay, aw, 8, OUTLINE)
    # the front cloth (보) hanging off the table — a deep persimmon altar drape
    fill(d, ax + 6, ay + 8, aw - 12, 18, PAL["dc_red"][2])
    dither(d, ax + 6, ay + 8, aw - 12, 18, PAL["dc_red"][3], phase=1)
    hline(d, ax + 6, ay + 8, aw - 12, PAL["dc_red"][1])      # lit fold top
    for fx in range(ax + 14, ax + aw - 12, 16):              # vertical fold seams
        vline(d, fx, ay + 9, 16, PAL["dc_red"][3])
    # a gold trim band along the cloth hem (the warmth begins here)
    hline(d, ax + 6, ay + 24, aw - 12, PAL["gold_light"][2])
    frame(d, ax + 6, ay + 8, aw - 12, 18, OUTLINE)
    # upper tier (where the Buda + portrait sit), a narrower raised step
    ux, uy, uw = ax + 24, ay - 12, aw - 48
    fill(d, ux, uy, uw, 12, PAL["wood_light"][1])
    hline(d, ux, uy, uw, PAL["wood_light"][0])
    dither(d, ux, uy + 8, uw, 4, PAL["wood_dark"][1], phase=0)
    frame(d, ux, uy, uw, 12, OUTLINE)

    cx = ax + aw // 2                                        # altar center x ≈160

    # --- the warm altar glow: warm air behind the altar, made of a few CONCENTRIC
    # dotted rings around the Buda (sparse single points, fading outward) so STATE
    # B reads warmest at its center WITHOUT a flat orange panel. Kept behind props.
    gcx, gcy = cx, uy - 8
    rings = ((6, PAL["gold_light"][2]), (11, PAL["ember"][3]),
             (16, PAL["ember"][3]), (21, PAL["ember"][3]))
    for rr, col in rings:
        steps = max(8, rr)                                   # points round the ring
        for i in range(steps):
            a = 2 * math.pi * i / steps
            px = gcx + int(round(rr * math.cos(a)))
            py = gcy + int(round(rr * 0.62 * math.sin(a)))   # squashed (wall plane)
            if 0 <= py < ay:                                 # never on the floor
                d.point((px, py), fill=col)

    # --- the small gilt Buda seated on the upper tier (back-center), raised so
    # its head + halo clear the top of the portrait that stands in front of it ---
    bx, by = cx - 9, uy - 30
    glow(d, cx, by + 12, 12, [PAL["gold_light"][0], PAL["gold_light"][2]])  # aureola
    # body: a seated golden figure (lotus base + robe triangle + head)
    d.polygon([(bx, by + 22), (bx + 18, by + 22), (bx + 15, by + 9),
               (bx + 3, by + 9)], fill=PAL["gold_light"][2], outline=OUTLINE)
    dither(d, bx + 10, by + 11, 6, 10, PAL["bronze"][1], phase=0)  # robe shade
    fill(d, bx + 5, by + 4, 8, 7, PAL["gold_light"][1])     # torso/shoulders
    d.ellipse([bx + 6, by - 2, bx + 12, by + 5], fill=PAL["gold_light"][0],
              outline=OUTLINE)                               # head
    d.point((bx + 9, by - 2), fill=PAL["gold_light"][0])    # 육계 crown bump
    d.point((bx + 7, by + 1), fill=PAL["bronze"][2])        # serene eyes
    d.point((bx + 10, by + 1), fill=PAL["bronze"][2])
    # lotus pedestal petals under the figure
    for px in range(bx, bx + 18, 4):
        d.point((px + 1, by + 23), fill=PAL["gold_light"][1])
    hline(d, bx, by + 24, 18, PAL["bronze"][2])

    # --- 영정 master portrait, lower-left of the Buda (cosmetic hotspot) ---
    # portrait_yeongjeong is 30×36; place at (149,69) so center ≈ (164,87) lands
    # inside [148,68,32,38] (center 164,87).
    C.portrait_yeongjeong(d, 149, 69)

    # --- 위패 the spirit tablet, on the upper tier just LEFT of the 영정 so it
    # peeks beside the portrait (a slim dark lacquer marker, narrower than before).
    wx, wy = 136, 80
    fill(d, wx, wy, 10, 26, PAL["wood_dark"][2])             # dark lacquer tablet
    fill(d, wx + 1, wy + 1, 8, 24, PAL["wood_dark"][3])
    hline(d, wx, wy, 10, PAL["wood_light"][2])               # lit top bevel
    d.polygon([(wx, wy), (wx + 5, wy - 4), (wx + 10, wy)],   # peaked cap
              fill=PAL["wood_dark"][1], outline=OUTLINE)
    fill(d, wx + 1, wy + 21, 8, 5, PAL["wood_dark"][1])      # foot stand
    frame(d, wx, wy, 10, 26, OUTLINE)
    # a faint gold inscription stripe (NOT glyphs — illegible, rule L2-a)
    vline(d, wx + 4, wy + 5, 15, PAL["gold_light"][2])
    d.point((wx + 4, wy + 9), fill=PAL["gold_light"][0])

    # === STATE B offerings — a clear FRONT ROW on the lower tier (the SWAP) =====
    # Spread so the 영정 portrait stays readable behind them: vases at the outer
    # ±44, candles just inside ±30 (clear of the portrait edges), the fruit dish
    # left-of-center, the incense censer dead-center-front with its 1px smoke.
    paint_chrysanthemum_vases(d, ax, ay, aw, cx)   # outer ±44 (drawn first/back)
    paint_candles_lit(d, ax, ay, aw, cx)           # inner ±30
    paint_fruit_pyramid(d, cx - 24, ay)            # left-front dish
    paint_incense(d, cx + 8, ay)                   # center-front censer + smoke


def paint_candles_lit(d, ax, ay, aw, cx):
    """Two LIT candles flanking the altar center — the brightest warm points."""
    for sgn in (-1, +1):
        kx = cx + sgn * 30
        ky = ay - 2                                          # candle base on tier
        # brass candlestick base + a tall white candle column
        d.ellipse([kx - 4, ky + 6, kx + 4, ky + 11], fill=PAL["bronze"][1],
                  outline=OUTLINE)                           # foot
        fill(d, kx - 1, ky - 2, 3, 9, PAL["bronze"][2])      # stem
        fill(d, kx - 2, ky - 12, 5, 11, PAL["white"][0])     # candle wax column
        vline(d, kx - 2, ky - 12, 11, PAL["white"][1])       # lit wax edge
        dither(d, kx + 1, ky - 10, 2, 9, PAL["hanji"][2], phase=0)  # drip shade
        # the FLAME — a tiny teardrop with a bright core + a halo (lit, the key)
        glow(d, kx, ky - 16, 6, [PAL["gold_light"][1], PAL["ember"][1]])
        d.point((kx, ky - 18), fill=PAL["gold_light"][0])    # flame tip
        d.point((kx, ky - 17), fill=PAL["ember"][0])
        d.point((kx, ky - 16), fill=PAL["gold_light"][0])    # bright core
        d.point((kx, ky - 15), fill=PAL["ember"][1])
        vline(d, kx, ky - 14, 2, PAL["ink"][1])              # the dark wick


def paint_fruit_pyramid(d, fx, ay):
    """A neat stacked pyramid of offering fruit (배/사과) on a brass dish."""
    fy = ay - 4
    # brass offering dish (제기) with a pedestal foot
    d.ellipse([fx - 14, fy + 8, fx + 14, fy + 14], fill=PAL["bronze"][1],
              outline=OUTLINE)
    fill(d, fx - 3, fy + 13, 6, 5, PAL["bronze"][2])         # pedestal stem
    d.ellipse([fx - 8, fy + 17, fx + 8, fy + 21], fill=PAL["bronze"][2],
              outline=OUTLINE)                               # foot
    # the fruit pyramid: 3 on the bottom, 2 mid, 1 on top (warm rounded fruit)
    def fruit(cx0, cy0):
        d.ellipse([cx0 - 5, cy0 - 5, cx0 + 5, cy0 + 5], fill=PAL["ember"][1],
                  outline=OUTLINE)
        dither(d, cx0 + 1, cy0 - 2, 4, 6, PAL["ember"][2], phase=0)  # shade side
        d.point((cx0 - 2, cy0 - 2), fill=PAL["gold_light"][1])  # waxy highlight
        d.point((cx0, cy0 - 5), fill=PAL["green"][2])        # tiny stem leaf
    fruit(fx - 8, fy + 7); fruit(fx, fy + 7); fruit(fx + 8, fy + 7)  # base row
    fruit(fx - 4, fy + 1); fruit(fx + 4, fy + 1)             # middle row
    fruit(fx, fy - 5)                                        # crown


def paint_chrysanthemum_vases(d, ax, ay, aw, cx):
    """White chrysanthemums standing in two celadon vases (mourning flowers)."""
    for sgn in (-1, +1):
        vx = cx + sgn * 44
        vy = ay - 2
        # celadon vase (a tall narrow bottle, pale green-white)
        d.polygon([(vx - 5, vy + 12), (vx + 5, vy + 12), (vx + 4, vy - 2),
                   (vx + 2, vy - 6), (vx - 2, vy - 6), (vx - 4, vy - 2)],
                  fill=PAL["white"][1], outline=OUTLINE)
        dither(d, vx + 1, vy - 4, 3, 14, PAL["green"][0], phase=0)  # celadon shade
        vline(d, vx - 3, vy - 2, 12, PAL["white"][0])        # lit side
        # the white chrysanthemums: 3 round pale blooms on short green stems
        stems = ((vx - 4, vy - 16), (vx, vy - 20), (vx + 4, vy - 15))
        for (mx, my) in stems:
            d.line([mx, vy - 6, mx, my + 3], fill=PAL["green"][2])  # stem
        for (mx, my) in stems:
            # a chrysanthemum head: a pale petal ring around a warm-gray center
            for dx, dy in ((0, -2), (2, -1), (2, 1), (0, 2), (-2, 1), (-2, -1),
                           (1, -2), (-1, 2)):
                d.point((mx + dx, my + dy), fill=PAL["white"][0])
            d.point((mx + 1, my - 1), fill=PAL["hanji"][0])  # outer petal sheen
            d.point((mx - 1, my + 1), fill=PAL["white"][2])  # shaded petals
            d.point((mx, my), fill=PAL["green"][0])          # pale green center


def paint_incense(d, cx, ay):
    """An incense burner (향로) with three sticks and a straight 1px smoke rise."""
    iy = ay - 2
    # bronze tripod censer on the front-center of the altar
    d.ellipse([cx - 9, iy + 4, cx + 9, iy + 12], fill=PAL["bronze"][1],
              outline=OUTLINE)                               # bowl
    dither(d, cx + 2, iy + 6, 6, 5, PAL["bronze"][3], phase=0)
    d.ellipse([cx - 7, iy + 2, cx + 7, iy + 7], fill=PAL["ink"][2])  # ash bed
    for lx in (cx - 7, cx, cx + 7):                          # three short legs
        vline(d, lx, iy + 11, 3, PAL["bronze"][3])
    # three incense sticks rising from the ash, each tipped with a lit ember
    for sgn, sx in ((-1, cx - 3), (0, cx), (1, cx + 3)):
        fill(d, sx, iy - 8, 1, 11, PAL["wood_dark"][2])      # the stick
        d.point((sx, iy - 9), fill=PAL["ember"][0])          # glowing tip ember
        d.point((sx, iy - 8), fill=PAL["ember"][1])
    # the smoke: a single straight 1px column rising from the CENTER stick, just
    # a couple of pale dithered points so it reads as "humo de 1px subiendo recto"
    for k in range(1, 18):
        c = PAL["white"][1] if k < 6 else (PAL["white"][2] if k < 12
                                           else PAL["rain"][0])
        if k % 2 == 0 or k < 6:                              # thins as it rises
            d.point((cx, iy - 10 - k), fill=c)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["hanji"][2])
    paint_room_shell(d)
    paint_back_doors(d)         # open doors + rain (behind the altar)
    paint_lantern_wall(d)       # right bay 7×7, lantern 49 unlit
    paint_dancheong_frame(d)    # red columns L+R + cross-beam
    paint_altar_complete(d)     # the STATE B altar (the warm focal swap)
    paint_left_table(d)         # left table + ritual sheet + 목탁
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-02-daeungjeon-complete.png")
    C.preview(img, "preview_room-02-daeungjeon-complete.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-02-daeungjeon-complete.png", scale=3)


if __name__ == "__main__":
    main()
