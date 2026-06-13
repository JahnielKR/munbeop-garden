#!/usr/bin/env python3
"""room-02-daeungjeon.png — 대웅전, STATE A "altar incompleto" (Cuarto 2).

Dossier §6 Cuarto 2 estado A: the altar BEFORE the player resolves Slot 2. This
is the default state the player walks into — the 49재 offering is half-prepared
and waiting. The on-screen SWAP to room-02-daeungjeon-complete.png happens the
instant Slot 2 is solved, so EVERYTHING outside the altar offerings is kept
pixel-identical to the -complete variant (same camera, columns, lantern wall,
floor, doors+rain, plinth, gilt Buda, 영정 portrait, 위패 tablet, left table +
ritual sheet + 목탁). ONLY the offerings revert:

  · candles UNLIT  — wax columns stand cold, dark wick, NO flame / NO glow.
  · fruit NOT arranged — left in a loose heap pushed to ONE SIDE of its dish
    (not the neat 3-2-1 pyramid of STATE B).
  · chrysanthemums STILL WRAPPED — two paper-wrapped bundles laid on the tier,
    blooms hidden in hanji paper (NOT standing in the celadon vases).
  · incense UNLIT — three bare sticks in the censer, NO ember tips, NO 1px smoke.
  · the altar is in PENUMBRA — it is NOT the warmest point of the room (STYLE
    rule 8 reads in REVERSE here): the warm concentric glow rings + the Buda's
    bright aureola of STATE B are gone; a cool storm film lies over the whole
    altar so the eye is NOT drawn to it yet. The single dim warmth left is the
    gilt of the small Buda, banked low.

CRITICAL invariants kept byte-aligned with STATE B (rule L2-e + seamless swap):
  · lantern wall 7×7 with lantern 49 (top-right) UNLIT in BOTH states.
  · red 단청 columns + cross-beam framing the salón.
  · open back doors showing the rain curtain; storm-gray key light.
  · left low table with the ritual sheet under a stone (SLOT2); 목탁 on cushion.
  · the 영정 master portrait + the 위패 tablet on the altar plinth.
  · plinth geometry: ax/ay/aw = 96/96/108; upper tier ux=ax+24; gilt Buda body.

Shared builders: lantern_wall, dancheong_column, dancheong_beam, moktak,
portrait_yeongjeong, rain_curtain, hanji_wall, wood_planks, glow, drop_shadow.
Everything else is asset-local detail painted AROUND the builders.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-02-daeungjeon.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow, glow

W, H = 320, 240
FLOOR_Y = 150            # wall/floor seam (STYLE: y≈140–155) — same as STATE B

# Hotspot rects — same coords as room-02-complete (STYLE table, 320×240 space).
RECTS = [
    (28, 128, 52, 44),   # ritual-sheet (SLOT2)
    (282, 32, 28, 32),   # lantern-49 — UNLIT (SLOT3 trigger, the UNLIT one)
    (88, 148, 30, 30),   # moktak (cosmetic)
    (148, 68, 32, 38),   # portrait 영정 (cosmetic)
]

# Lantern wall geometry — IDENTICAL to STATE B so lantern 49 lands byte-aligned.
LW_X, LW_Y = 206, 32
LW_STEP_X, LW_STEP_Y = 12, 16


# ── Background: warm-gray ritual hall, dim wood floor (IDENTICAL to STATE B) ──

def paint_room_shell(d):
    """Hanji paper wall (storm-dimmed) + warm worn plank floor of the salón."""
    C.hanji_wall(d, 0, 0, W, FLOOR_Y, ramp=PAL["hanji"])
    dither(d, 0, 0, W, FLOOR_Y, PAL["rain"][2], phase=1)     # cool storm film
    dither(d, 0, 0, W, 18, PAL["rain"][3], phase=0)          # darker near ceiling
    fill(d, 0, FLOOR_Y - 5, W, 5, PAL["wood_dark"][1])       # wood skirting board
    hline(d, 0, FLOOR_Y - 5, W, PAL["wood_light"][2])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["floor"], plank_h=9,
                  seam_every=3)
    dither(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["rain"][2], phase=0)  # cool damp film
    dither(d, 0, H - 14, W, 14, PAL["rain"][3], phase=1)     # darker near camera


# ── BACK: open doors + rain curtain (IDENTICAL to STATE B) ───────────────────

def paint_back_doors(d):
    """Open temple doors at the back-center showing the cold rain beyond."""
    dx, dy, dw, dh = 108, 14, 84, 96
    fill(d, dx, dy, dw, dh, PAL["rain"][3])
    dither(d, dx, dy, dw, dh, PAL["rain"][4], phase=0)
    C.rain_curtain(d, dx, dy, dw, dh, phase=0, density=8, lean=2)
    fill(d, dx, dy, dw, 4, PAL["rain"][4])
    frame(d, dx, dy, dw, dh, OUTLINE)
    for lx in (dx - 16, dx + dw):
        fill(d, lx, dy, 16, dh, PAL["hanji"][2])
        dither(d, lx, dy, 16, dh, PAL["rain"][2], phase=1)
        for ry in range(dy + 16, dy + dh, 18):
            hline(d, lx, ry, 16, PAL["wood_dark"][2])
        frame(d, lx, dy, 16, dh, OUTLINE)
    fill(d, dx - 16, dy + dh, dw + 32, 4, PAL["wood_dark"][2])
    hline(d, dx - 16, dy + dh, dw + 32, PAL["wood_dark"][1])


# ── 단청 frame: red columns L+R + a cross-beam (IDENTICAL to STATE B) ─────────

def paint_dancheong_frame(d):
    """Red 기둥 columns flanking the scene + a 단청 보 cross-beam up top."""
    C.dancheong_beam(d, 0, 0, W, 14)
    C.dancheong_column(d, 6, 14, FLOOR_Y - 14, 16)
    C.dancheong_column(d, 300, 14, FLOOR_Y - 14, 16)
    drop_shadow(d, 6, FLOOR_Y, 16, 3)
    drop_shadow(d, 300, FLOOR_Y, 16, 3)


# ── RIGHT WALL: the 49-lantern grid (IDENTICAL to STATE B, 49 UNLIT) ─────────

def paint_lantern_wall(d):
    """7×7 hanging lanterns on the right bay; the top-right one (49) stays unlit."""
    bw = 6 * LW_STEP_X + 16 + 4
    bh = 6 * LW_STEP_Y + 24 + 4
    fill(d, LW_X - 4, LW_Y - 4, bw, bh, PAL["wood_dark"][3])
    dither(d, LW_X - 4, LW_Y - 4, bw, bh, PAL["rain"][4], phase=0)
    C.lantern_wall(d, LW_X, LW_Y, cols=7, rows=7,
                   step_x=LW_STEP_X, step_y=LW_STEP_Y,
                   unlit_col=6, unlit_row=0)
    C.lantern_tile(d, LW_X + 6 * LW_STEP_X, LW_Y, lit=False)


# ── LEFT: low table + ritual sheet under a stone (SLOT2) + 목탁 (IDENTICAL) ───

def paint_left_table(d):
    """Low table holding the ritual instruction sheet pinned by a stone (SLOT2)."""
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
    C.moktak(d, 92, 150)


# ── CENTER-BACK: the altar — STATE A "incompleto" (in PENUMBRA) ──────────────

def paint_altar_incomplete(d):
    """The half-prepared altar: gilt Buda + 영정/위패, candles UNLIT, fruit in a
    loose heap pushed to one side, chrysanthemums still WRAPPED, incense UNLIT.

    The plinth, Buda body, portrait, 위패 are kept pixel-identical to STATE B so
    the swap is seamless. What changes: NO warm glow rings, the Buda's aureola is
    banked low (one dim ring instead of a bright bloom), and a cool storm film is
    laid over the whole altar so it reads as PENUMBRA — not the room's focal warm.
    """
    # --- the plinth: a two-tier altar table (제단), IDENTICAL geometry to STATE B
    ax, ay, aw = 96, 96, 108                 # lower tier top edge
    drop_shadow(d, ax - 2, ay + 28, aw + 4, 3)
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
    hline(d, ax + 6, ay + 24, aw - 12, PAL["gold_light"][2])  # gold hem trim
    frame(d, ax + 6, ay + 8, aw - 12, 18, OUTLINE)
    # upper tier (where the Buda + portrait sit), a narrower raised step
    ux, uy, uw = ax + 24, ay - 12, aw - 48
    fill(d, ux, uy, uw, 12, PAL["wood_light"][1])
    hline(d, ux, uy, uw, PAL["wood_light"][0])
    dither(d, ux, uy + 8, uw, 4, PAL["wood_dark"][1], phase=0)
    frame(d, ux, uy, uw, 12, OUTLINE)

    cx = ax + aw // 2                                        # altar center x ≈160

    # --- STATE A: NO warm concentric glow rings. STATE B's focal bloom around the
    # Buda is simply ABSENT — that absence (not an extra cool film) is what puts the
    # altar in penumbra: it has no warm halo to pull the eye, so the lantern wall
    # and rain stay the brightest things in the room. We do NOT smother the altar
    # in cool dither (it would just turn it to noise); the plinth keeps the same
    # storm-wall film as the rest of the room and nothing more.

    # --- the small gilt Buda — IDENTICAL geometry to STATE B, but a DIM aureola
    bx, by = cx - 9, uy - 30
    # banked aureola: a single dim bronze halo instead of STATE B's bright gold
    # bloom, kept tight so it reads as un-lit gilt, not a glowing light source.
    glow(d, cx, by + 12, 8, [PAL["bronze"][2], PAL["bronze"][3]])
    d.polygon([(bx, by + 22), (bx + 18, by + 22), (bx + 15, by + 9),
               (bx + 3, by + 9)], fill=PAL["gold_light"][2], outline=OUTLINE)
    dither(d, bx + 10, by + 11, 6, 10, PAL["bronze"][1], phase=0)  # robe shade
    fill(d, bx + 5, by + 4, 8, 7, PAL["gold_light"][1])     # torso/shoulders
    d.ellipse([bx + 6, by - 2, bx + 12, by + 5], fill=PAL["gold_light"][0],
              outline=OUTLINE)                               # head
    d.point((bx + 9, by - 2), fill=PAL["gold_light"][0])    # 육계 crown bump
    d.point((bx + 7, by + 1), fill=PAL["bronze"][2])        # serene eyes
    d.point((bx + 10, by + 1), fill=PAL["bronze"][2])
    for px in range(bx, bx + 18, 4):                         # lotus pedestal petals
        d.point((px + 1, by + 23), fill=PAL["gold_light"][1])
    hline(d, bx, by + 24, 18, PAL["bronze"][2])

    # --- 영정 master portrait — IDENTICAL to STATE B (cosmetic hotspot) ---
    C.portrait_yeongjeong(d, 149, 69)

    # --- 위패 the spirit tablet — IDENTICAL to STATE B ---
    wx, wy = 136, 80
    fill(d, wx, wy, 10, 26, PAL["wood_dark"][2])             # dark lacquer tablet
    fill(d, wx + 1, wy + 1, 8, 24, PAL["wood_dark"][3])
    hline(d, wx, wy, 10, PAL["wood_light"][2])               # lit top bevel
    d.polygon([(wx, wy), (wx + 5, wy - 4), (wx + 10, wy)],   # peaked cap
              fill=PAL["wood_dark"][1], outline=OUTLINE)
    fill(d, wx + 1, wy + 21, 8, 5, PAL["wood_dark"][1])      # foot stand
    frame(d, wx, wy, 10, 26, OUTLINE)
    vline(d, wx + 4, wy + 5, 15, PAL["gold_light"][2])       # faint gold stripe
    d.point((wx + 4, wy + 9), fill=PAL["gold_light"][0])

    # === STATE A offerings — the half-prepared FRONT ROW (the SWAP source) =====
    # Same plan/positions as STATE B so the swap lands clean, but reverted:
    #   outer ±44 : wrapped chrysanthemum bundles laid down (NOT vases of blooms)
    #   inner ±30 : UNLIT candles (cold wax, dark wick, no flame/glow)
    #   left-front: fruit in a loose heap pushed to one side (NOT a pyramid)
    #   center    : censer with three bare UNLIT sticks (no embers, no smoke)
    paint_wrapped_flowers(d, ax, ay, aw, cx)       # outer ±44 (drawn first/back)
    paint_candles_unlit(d, ax, ay, aw, cx)         # inner ±30
    paint_fruit_heaped(d, cx - 24, ay)             # left-front dish, loose heap
    paint_incense_unlit(d, cx + 8, ay)             # center-front censer, no smoke


def paint_candles_unlit(d, ax, ay, aw, cx):
    """Two UNLIT candles flanking the altar center — cold wax, dark wick, no glow.

    Same brass stick + wax column geometry as STATE B's lit candles, minus the
    flame, the ember tip and the warm halo. The wax reads cool (storm-lit), so the
    eye is not pulled to the altar.
    """
    for sgn in (-1, +1):
        kx = cx + sgn * 30
        ky = ay - 2                                          # candle base on tier
        # brass candlestick base + a tall candle column (same geometry as STATE B)
        d.ellipse([kx - 4, ky + 6, kx + 4, ky + 11], fill=PAL["bronze"][1],
                  outline=OUTLINE)                           # foot
        fill(d, kx - 1, ky - 2, 3, 9, PAL["bronze"][2])      # stem
        # wax column: keep it a clear pale column so the candle still READS as a
        # candle (just flameless) — lit edge on the left, cool shade on the right.
        fill(d, kx - 2, ky - 12, 5, 11, PAL["white"][0])     # wax column body
        vline(d, kx - 2, ky - 12, 11, PAL["white"][1])       # lit wax edge (cool)
        outline_col = OUTLINE
        vline(d, kx + 2, ky - 12, 11, PAL["stone"][1])       # cool shaded edge
        frame(d, kx - 2, ky - 12, 5, 11, outline_col)
        # NO flame, NO glow. The wick is a tiny dark stub, plainly unlit.
        vline(d, kx, ky - 14, 3, PAL["ink"][2])              # the dark unlit wick
        d.point((kx, ky - 14), fill=PAL["ink"][1])           # charred wick tip


def paint_fruit_heaped(d, fx, ay):
    """Offering fruit in a LOOSE HEAP pushed to one side of its dish (not arranged).

    Same brass dish geometry as STATE B's pyramid, but the fruit are tumbled to
    the left of the dish in an uneven low pile — clearly "not yet arranged".
    """
    fy = ay - 4
    # brass offering dish (제기) with a pedestal foot — same as STATE B
    d.ellipse([fx - 14, fy + 8, fx + 14, fy + 14], fill=PAL["bronze"][1],
              outline=OUTLINE)
    fill(d, fx - 3, fy + 13, 6, 5, PAL["bronze"][2])         # pedestal stem
    d.ellipse([fx - 8, fy + 17, fx + 8, fy + 21], fill=PAL["bronze"][2],
              outline=OUTLINE)                               # foot

    def fruit(cx0, cy0, dim=False):
        # a warm rounded fruit; dim=True drops it a tone (storm-shadowed, penumbra)
        body = PAL["ember"][2] if dim else PAL["ember"][1]
        d.ellipse([cx0 - 5, cy0 - 5, cx0 + 5, cy0 + 5], fill=body, outline=OUTLINE)
        dither(d, cx0 + 1, cy0 - 2, 4, 6, PAL["ember"][3], phase=0)  # shade side
        d.point((cx0 - 2, cy0 - 2), fill=PAL["ember"][0])    # waxy highlight (dim)
        d.point((cx0, cy0 - 5), fill=PAL["green"][2])        # tiny stem leaf

    # a loose pile tumbled to the LEFT of the dish: 3 nestled low, 1 leaning, 1
    # rolled off onto the tier — uneven heights, clearly un-stacked.
    fruit(fx - 9, fy + 7); fruit(fx - 2, fy + 8, dim=True); fruit(fx + 5, fy + 7)
    fruit(fx - 6, fy + 2, dim=True)                          # one leaning on the pile
    # one fruit rolled off the dish onto the lower tier, at rest (the "loose" tell)
    d.ellipse([fx - 24, ay + 1, fx - 16, ay + 9], fill=PAL["ember"][2],
              outline=OUTLINE)
    dither(d, fx - 20, ay + 3, 4, 5, PAL["ember"][3], phase=0)
    d.point((fx - 22, ay + 3), fill=PAL["ember"][1])
    drop_shadow(d, fx - 24, ay + 9, 9, 1)                    # it rests on the tier


def paint_wrapped_flowers(d, ax, ay, aw, cx):
    """Two paper-WRAPPED chrysanthemum bundles laid on the tier (still un-arranged).

    Replaces STATE B's celadon vases of standing blooms. Each is a cone of hanji
    wrapping paper laid on its side, the blooms hidden inside, only a hint of white
    petal peeking from the open end, a persimmon tie cinching the stalk — the
    flowers "still wrapped", waiting to be arranged. The cone is a clean wedge with
    a clear lit top edge so it reads as a paper bouquet, not a gray blob.
    """
    for sgn in (-1, +1):
        bx = cx + sgn * 44                                   # same anchor as vases
        by = ay - 2
        # the cone lies with its POINTED wrapped tip outward, OPEN mouth toward
        # center. Outer tip = (tipx,by+5); open mouth is a short vertical at mthx.
        tipx = bx + sgn * 10                                 # outer wrapped tip
        mthx = bx - sgn * 8                                  # inner open mouth x
        lo, hi = (min(tipx, mthx), max(tipx, mthx))
        # paper cone body — a clean wedge lying on the tier (bright hanji)
        d.polygon([(tipx, by + 5), (mthx, by - 5), (mthx, by + 9)],
                  fill=PAL["hanji"][0], outline=OUTLINE)
        # lit top edge (toward the tip) + shaded lower belly so it reads 3D
        d.line([tipx, by + 5, mthx, by - 5], fill=PAL["hanji"][1])
        dither(d, lo + 2, by + 3, hi - lo - 3, 4, PAL["hanji"][2], phase=0)
        # a single fold crease running the length of the cone
        d.line([tipx, by + 4, mthx, by + 1], fill=PAL["hanji"][3])
        # the white chrysanthemum tips just peeking from the open mouth (a hint —
        # blooms stay hidden in the paper): 2 small pale clusters at the mouth edge
        for k in range(2):
            mx = mthx - sgn * (1 + k * 2)
            my = by - 3 + k * 4
            for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)):
                d.point((mx + dx, my + dy), fill=PAL["white"][0])
            d.point((mx, my), fill=PAL["green"][0])          # pale green eye
        # green stalk ends poking out the OUTER wrapped tip
        d.point((tipx - sgn * 1, by + 4), fill=PAL["green"][2])
        d.point((tipx - sgn * 2, by + 5), fill=PAL["green"][3])
        # a persimmon-cloth tie cinching the wrapping near the open mouth
        cinx = mthx - sgn * 4
        vline(d, cinx, by - 3, 11, PAL["ember"][3])
        d.point((cinx, by), fill=PAL["ember"][2])            # tie knot glint
        drop_shadow(d, lo, by + 9, hi - lo + 1, 1)           # laid-down contact shadow


def paint_incense_unlit(d, cx, ay):
    """An incense burner (향로) with three BARE unlit sticks — no ember, no smoke."""
    iy = ay - 2
    # bronze tripod censer on the front-center of the altar — same as STATE B
    d.ellipse([cx - 9, iy + 4, cx + 9, iy + 12], fill=PAL["bronze"][1],
              outline=OUTLINE)                               # bowl
    dither(d, cx + 2, iy + 6, 6, 5, PAL["bronze"][3], phase=0)
    d.ellipse([cx - 7, iy + 2, cx + 7, iy + 7], fill=PAL["ink"][2])  # ash bed
    for lx in (cx - 7, cx, cx + 7):                          # three short legs
        vline(d, lx, iy + 11, 3, PAL["bronze"][3])
    # three bare incense sticks standing in the ash — NO lit ember tips, NO smoke.
    for sgn, sx in ((-1, cx - 3), (0, cx), (1, cx + 3)):
        fill(d, sx, iy - 8, 1, 11, PAL["wood_dark"][2])      # the bare stick
        d.point((sx, iy - 9), fill=PAL["wood_dark"][1])      # plain (unlit) tip


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["hanji"][2])
    paint_room_shell(d)
    paint_back_doors(d)         # open doors + rain (behind the altar)
    paint_lantern_wall(d)       # right bay 7×7, lantern 49 unlit
    paint_dancheong_frame(d)    # red columns L+R + cross-beam
    paint_altar_incomplete(d)   # the STATE A altar (penumbra, half-prepared)
    paint_left_table(d)         # left table + ritual sheet + 목탁
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-02-daeungjeon.png")
    C.preview(img, "preview_room-02-daeungjeon.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-02-daeungjeon.png", scale=3)


if __name__ == "__main__":
    main()
