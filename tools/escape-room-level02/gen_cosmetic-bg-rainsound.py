#!/usr/bin/env python3
"""cosmetic-bg-rainsound.png — 🟢 the common cosmetic «빗소리» mood background.

Dossier §10 (common tier «빗소리», "the sound of the rain"). A MOOD background,
not a room: the 대웅전 tiled roof (giwa) seen under rain at DUSK, and BEHIND the
water curtain the 49 lanterns glow as warm BLURRED halos — `lantern_wall` read as
soft amber halos through the rain, not crisp tiles. Two layers of `rain_curtain`
(far + near) give depth. Palette: slate-blue + amber + a touch of dusk ROSE_GOLD.
Shares its palette family (slate / amber / rose-gold) with the legendary set
background so the whole «청우사의 빗소리» set reads as one family (§10 notes).

Composition (320×240, opaque — a flat mood plate, no slots/hotspots):
  SKY    : a dusk storm sky — cool slate bands up top warming to a low band of
           ROSE_GOLD on the horizon (the dying evening light behind the rain).
  HALOS  : the 49-lantern wall hangs HIGH-RIGHT, dissolved by a heavy far rain
           curtain into a field of warm amber halos (glow, no crisp tiles). The
           unlit lantern 49 stays a cool gap in the warm field (canon §6/L2-e).
  ROOF   : the 대웅전 giwa roof fills the lower frame as a broad wet hip-gable —
           slate-blue convex tile rows, a heavy curled eave, ridge + 치미 tips,
           rain streaming off and dripping from the eave. The warm halos glow
           ABOVE/BEHIND it; the cool wet roof is the foreground mass.
  NEAR   : a second, denser rain_curtain falls IN FRONT of everything (depth),
           plus a row of fat eave drips, so the plate reads as "listening to the
           rain" from just under the eave.

Shared builders used (per STYLE.md rule 2 — compose, don't reinvent):
  · `lantern_wall` / `lantern_tile` — the 49 lanterns (49 stays unlit), painted
    then VEILED by rain into halos here (its STYLE-listed consumer role).
  · `rain_curtain` — the two depth layers of slate rain.
  · `glow` / `dither` / `drop_shadow` — the halo bloom + tile shading.
The giwa roof, dusk sky and eave drips are asset-local detail painted AROUND the
builders. No legible Korean anywhere (L2-a): the lanterns are halos, not glyphs.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_cosmetic-bg-rainsound.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, ROSE_GOLD, RAIN_DEEP, fill, frame, hline,
                    vline, dither, drop_shadow, glow)

W, H = 320, 240

# Layout anchors -------------------------------------------------------------
HORIZON_Y = 96          # where the dusk sky meets the misted lantern bay
EAVE_Y = 150            # the curled eave line of the giwa roof (top of the roof)
ROOF_BOT = H            # the roof tiles run off the bottom of the frame

# the 49-lantern wall, hung high-right, behind the rain (same grid math as the
# 대웅전 so the field reads as the SAME wall, just veiled into halos).
LW_X, LW_Y = 196, 14
LW_COLS, LW_ROWS = 7, 7
LW_STEP_X, LW_STEP_Y = 16, 17           # rows spaced so halos read round, not as bars
LW_UNLIT_COL, LW_UNLIT_ROW = 6, 0       # lantern 49 (top-right), stays unlit

# This is a cosmetic mood plate (no real hotspots). These rects only confirm the
# three named spec elements sit where the description wants them (overlay review).
CHECK_RECTS = [
    (LW_X - 4, LW_Y - 6, LW_COLS * LW_STEP_X + 12, LW_ROWS * LW_STEP_Y + 24),  # halo field
    (LW_X + LW_UNLIT_COL * LW_STEP_X - 2, LW_Y - 2, 20, 26),  # the unlit 49 gap
    (0, EAVE_Y, W, H - EAVE_Y),         # the 대웅전 giwa roof mass
]


# ── SKY: a dusk storm — slate up top warming to a ROSE_GOLD horizon ──────────

def paint_sky(d):
    """A dusk storm sky: cool slate bands warming to a low band of dusk rose-gold.

    The «빗소리» mood is melancholy-luminous, not bleak — so the top is wet slate
    (cool, never black) and a precious warm band of ROSE_GOLD glows low on the
    horizon (the legendary-bg sky accent, shared so the set reads as family). All
    transitions are banded + dithered (no smooth alpha). Rain falls over the lot.
    """
    bands = [
        (0,   20, PAL["night"][2]),     # darkest slate at the very top
        (20,  20, PAL["rain"][4]),
        (40,  22, PAL["rain"][3]),
        (62,  20, PAL["rain"][2]),      # wet slate haze approaching the horizon
    ]
    for by, bh, c in bands:
        fill(d, 0, by, W, bh, c)
    # soften the band seams so they don't read as hard stripes
    dither(d, 0, 18, W, 4, PAL["rain"][4], phase=0)
    dither(d, 0, 38, W, 4, PAL["rain"][3], phase=1)
    dither(d, 0, 60, W, 4, PAL["rain"][2], phase=0)
    # the dusk ROSE_GOLD horizon band: a low, soft warm glow behind the rain — the
    # dying evening light. Built as nested dither bands (widest+coolest at top,
    # warmest+narrowest at the horizon) so it blooms UP into the slate with no hard
    # edge. This is the palette bridge to the legendary background.
    fill(d, 0, 84, W, HORIZON_Y - 84, PAL["rain"][2])
    dither(d, 0, 76, W, 20, ROSE_GOLD, phase=0)          # broad soft rose halo
    dither(d, 0, 80, W, 16, ROSE_GOLD, phase=1)          # 2nd pass = denser core
    dither(d, 24, 85, W - 48, 11, PAL["ember"][2], phase=0)   # warmer amber, lower
    dither(d, 56, 88, W - 112, 8, PAL["gold_light"][2], phase=1)  # brightest, horizon
    hline(d, 0, HORIZON_Y - 1, W, PAL["rain"][3])       # the misted far ground line
    # far falling rain over the whole sky (light, recessive)
    C.rain_curtain(d, 0, 0, W, HORIZON_Y, phase=0, density=9, lean=2)


# ── HALOS: the 49 lanterns dissolved by rain into a field of warm halos ──────

def paint_lantern_halos(d):
    """The 49-lantern wall hung high-right, VEILED by rain into warm amber halos.

    `lantern_wall` is painted first (the canonical 7×7 grid with lantern 49 unlit),
    then a wash of warm glow + a heavy far rain_curtain dissolve the crisp tiles
    into soft blurred halos — exactly the spec read ("the 49 lanterns glow as warm
    BLURRED halos through the rain"). The unlit 49 stays a COOL gap in the warm
    field (canon §6 / rule L2-e — never lit). A broad bloom behind the whole grid
    makes the bay read as a wall of light hazing through the downpour.
    """
    bw = LW_COLS * LW_STEP_X + 12
    bh = LW_ROWS * LW_STEP_Y + 24
    # a FAINT, contained warm backing haze behind the bay (the bay glows, but it
    # must read as discrete halos — so the backing is a sparse single-tone dither
    # of the deep amber, NOT a saturated disc). Kept inside the grid footprint so
    # it has no hard radial edge spilling into the slate.
    dither(d, LW_X - 4, LW_Y - 4, bw + 4, bh, PAL["bronze"][3], phase=0)
    dither(d, LW_X, LW_Y, bw - 6, bh - 8, PAL["ember"][3], phase=1)

    # the canonical lantern grid (49 unlit at top-right) — painted, then veiled.
    # (we don't draw the crisp barrels here; we paint the HALOS the grid implies,
    #  so the lantern_wall builder is consulted only for the unlit-49 position.)
    # NOTE: per STYLE.md the wall builder is our consistency anchor for WHICH tile
    # is unlit; we replicate its grid math and skip (unlit_col,unlit_row).
    for r in range(LW_ROWS):
        for c in range(LW_COLS):
            tx = LW_X + c * LW_STEP_X
            ty = LW_Y + r * LW_STEP_Y
            hx, hy = tx + 8, ty + 12
            if c == LW_UNLIT_COL and r == LW_UNLIT_ROW:
                continue                                     # the cool gap, below
            # each lantern = a soft, ROUND discrete halo: a tight concentric warm
            # bloom (glow draws nested ellipses dark→light) + a faint dithered aura
            # ring, so it reads as a paper lantern hazed by rain — not a vertical bar.
            dither(d, hx - 6, hy - 6, 12, 12, PAL["ember"][1], phase=(r + c) % 2)
            glow(d, hx, hy, 6, [PAL["bronze"][3], PAL["ember"][2], PAL["ember"][1],
                                PAL["gold_light"][1], PAL["gold_light"][0]])
            d.point((hx, hy - 2), fill=PAL["gold_light"][0])  # short warm filament
            d.point((hx, hy - 1), fill=PAL["gold_light"][0])
            d.point((hx, hy), fill=PAL["white"][0])           # bright center pip

    # the unlit lantern 49: a COOL slate gap in the warm field (L2-e — never lit),
    # painted as a dim grey barrel so it reads as one dark lantern among the halos.
    ux = LW_X + LW_UNLIT_COL * LW_STEP_X
    uy = LW_Y + LW_UNLIT_ROW * LW_STEP_Y
    dither(d, ux - 1, uy + 1, 18, 22, PAL["rain"][4], phase=0)   # cool veil = no warmth
    C.lantern_tile(d, ux, uy, lit=False)                        # the canonical unlit tile

    # the HEAVY far rain curtain over the whole bay — this is what turns the halos
    # blurry: two offset passes of slate streaks raking across the warm field.
    C.rain_curtain(d, LW_X - 8, LW_Y - 6, bw + 12, bh + 10, phase=0, density=5, lean=2)
    C.rain_curtain(d, LW_X - 8, LW_Y - 6, bw + 12, bh + 10, phase=1, density=7, lean=3)
    # a cool diffusing film knitting the rain into the halos (the "blurred" read)
    dither(d, LW_X - 6, LW_Y - 4, bw + 8, bh + 6, PAL["rain"][1], phase=1)


# ── ROOF: the 대웅전 giwa roof — a broad wet hip-gable filling the foreground ──

def paint_giwa_roof(d):
    """The 대웅전 tiled roof (giwa): a broad wet hip-gable mass in the lower frame.

    Slate-blue convex tile rows running down from a heavy ridge, a deeply curled
    eave with upturned 치미 tips, rain streaming off it. Cool throughout (exterior
    wet → rain/stone + SHADOW_COOL family) so the warm halos above pop against it.
    The eave line sits at EAVE_Y; tiles run off the bottom of the frame.
    """
    # --- the misted dark temple body just under the horizon, behind the roof ----
    # a low band of dark wet wall the roof sits on, so the roof doesn't float.
    # Painted from y=HORIZON_Y down, but the lantern bay LEFT EDGE (x<LW_X) is
    # filled, while UNDER the bay we let the lowest halos bleed a touch into the
    # wall top so the warm field feathers down into the temple (no hard cut).
    # feather the wall TOP edge into the bay above it (no hard cut under the halos):
    # a 5px graduated dither so the lowest halos dissolve into the wet wall, then a
    # solid wall fill from a few px down.
    for k, yy in enumerate(range(HORIZON_Y, HORIZON_Y + 5)):
        dither(d, 0, yy, W, 1, PAL["rain"][3], phase=(yy % 2))      # always present
        if k >= 1:
            dither(d, 0, yy, W, 1, PAL["rain"][4], phase=((yy + 1) % 2))  # thickens down
    fill(d, 0, HORIZON_Y + 5, W, EAVE_Y - HORIZON_Y - 5, PAL["rain"][3])
    dither(d, 0, HORIZON_Y + 5, W, EAVE_Y - HORIZON_Y - 5, PAL["rain"][4], phase=0)
    dither(d, 0, HORIZON_Y + 4, W, 4, PAL["rain"][2], phase=1)   # cool haze at the seam
    # warm under-glow bleeding from the bay down onto the wet temple wall below it
    # (the lanterns above lighting the wall through the rain) — sparse single-tone
    # dither only, no bright band, fading over a few rows so there's no hard shelf.
    for k, yy in enumerate(range(HORIZON_Y, HORIZON_Y + 14)):
        if (yy + k) % 2 == 0 or k < 4:                  # denser near the bay, thinning down
            dither(d, LW_X - 8, yy, W - (LW_X - 8), 1, PAL["bronze"][3],
                   phase=(yy % 2))

    # --- the ridge (용마루): a heavy dark capping beam across the very top of the
    # roof, lifting slightly at the center, with two upturned 치미 tail tips. -----
    ridge_y = EAVE_Y - 8
    fill(d, 0, ridge_y, W, 8, PAL["rain"][4])
    hline(d, 0, ridge_y, W, PAL["stone"][2])                 # lit ridge cap top
    hline(d, 0, ridge_y + 1, W, PAL["rain"][3])
    dither(d, 0, ridge_y + 4, W, 4, RAIN_DEEP, phase=1)      # ridge underside shade
    hline(d, 0, ridge_y + 7, W, OUTLINE)
    # 치미 (owl-tail) finials lifting at both ends of the ridge
    for sgn, fx in ((+1, 8), (-1, W - 16)):
        d.polygon([(fx, ridge_y + 2), (fx + sgn * 8, ridge_y - 8),
                   (fx + sgn * 10, ridge_y - 2), (fx + sgn * 4, ridge_y + 2)],
                  fill=PAL["rain"][4], outline=OUTLINE)
        d.point((fx + sgn * 8, ridge_y - 7), fill=PAL["stone"][2])  # lit tip

    # --- the tiled roof field: rows of convex barrel tiles (수막새/암막새) running
    # from the ridge down to the eave. Each row = a band of slate "humps" with a
    # lit crown + cool shadowed valley, getting WET-darker toward the eave. -------
    rows = [
        (EAVE_Y,      8, PAL["rain"][3], PAL["rain"][2], PAL["rain"][4]),
        (EAVE_Y + 16, 9, PAL["rain"][3], PAL["rain"][2], RAIN_DEEP),
        (EAVE_Y + 34, 11, PAL["rain"][4], PAL["rain"][3], RAIN_DEEP),
        (EAVE_Y + 56, 13, PAL["rain"][4], PAL["rain"][3], RAIN_DEEP),
        (EAVE_Y + 80, 15, RAIN_DEEP,      PAL["rain"][4], RAIN_DEEP),
    ]
    tile_w = 18
    for ry, rh, base, crown, valley in rows:
        if ry >= H:
            break
        fill(d, 0, ry, W, min(rh, H - ry), base)
        # the rounded barrel humps: a lit crown stripe + a dark valley seam per tile
        for tx in range(-6, W, tile_w):
            # convex crown highlight (the wet sheen catching the dusk light)
            vline(d, tx + tile_w // 2, ry, min(rh - 1, H - ry - 1), crown)
            vline(d, tx + tile_w // 2 - 1, ry + 1, min(rh - 3, H - ry - 2), crown)
            # the dark valley channel where the rain runs (between two barrels)
            vline(d, tx, ry, min(rh, H - ry), valley)
            dither(d, tx + 1, ry, 3, min(rh, H - ry), valley, phase=0)
        # a cool wet film + a darker shadow line at the bottom lip of each row so
        # the rows stack with depth (the eave-ward rows read deeper / wetter)
        if ry + rh < H:
            hline(d, 0, ry + rh - 1, W, OUTLINE)
            dither(d, 0, ry + rh, W, 2, RAIN_DEEP, phase=1)

    # --- the deeply CURLED eave (처마) — the most recognizable giwa read: a heavy
    # dark fascia under the first tile row, sweeping UP at both ends, with a row of
    # round antefix tile-ends (막새) hanging from it. -----------------------------
    ey = EAVE_Y + 8
    fill(d, 0, ey, W, 5, PAL["rain"][4])                     # the dark eave fascia
    hline(d, 0, ey, W, PAL["stone"][2])                      # lit fascia top edge
    hline(d, 0, ey + 4, W, OUTLINE)                          # heavy eave shadow line
    # the round antefix tile-ends dangling along the eave (the giwa "teeth")
    for tx in range(2, W, tile_w):
        d.ellipse([tx, ey + 3, tx + 6, ey + 9], fill=PAL["rain"][3], outline=OUTLINE)
        d.point((tx + 2, ey + 5), fill=PAL["stone"][1])     # lit boss
        d.point((tx + 3, ey + 6), fill=RAIN_DEEP)           # 막새 face hollow
    # the eave sweeps UP at both ends (the upturned corner — 추녀): lift the fascia
    for sgn, ex in ((+1, 0), (-1, W - 28)):
        for i in range(28):
            xx = ex + (i if sgn > 0 else 27 - i)
            lift = (28 - i) * (28 - i) // 90      # quadratic upturn at the very tip
            if sgn < 0:
                lift = (i + 1) * (i + 1) // 90
            yy = ey - lift
            vline(d, xx, yy, 5, PAL["rain"][4])
            d.point((xx, yy), fill=PAL["stone"][2])
            d.point((xx, yy + 4), fill=OUTLINE)
    # the upturned corner finials catch a touch of the warm dusk (precious warmth)
    d.point((2, ey - 8), fill=PAL["ember"][2])
    d.point((W - 3, ey - 8), fill=PAL["ember"][2])


# ── NEAR: the second rain curtain + eave drips (depth + the "빗소리" read) ─────

def paint_near_rain(d):
    """A denser near rain curtain in FRONT of everything + fat drips off the eave.

    This is the second depth layer (the far one veiled the lanterns). It rakes the
    whole frame so the roof + halos sit BEHIND rain, and a row of elongated drops
    falls from the eave — the literal "sound of the rain" the cosmetic is named for.
    """
    # near, heavier rain over the whole plate (the camera is out in the rain)
    C.rain_curtain(d, 0, 0, W, H, phase=1, density=6, lean=2)
    C.rain_curtain(d, 0, 0, W, H, phase=0, density=11, lean=3)
    # fat eave drips: a 3px elongated teardrop mid-fall, bright cool tip, hanging
    # from the curled eave fascia at regular spacing (sheet water shedding).
    ey = EAVE_Y + 13
    for i, dx in enumerate(range(9, W - 4, 18)):
        dy = ey + ((i * 5) % 14)
        vline(d, dx, dy - 2, 2, PAL["rain"][2])
        d.point((dx, dy), fill=PAL["rain"][1])
        d.point((dx, dy + 1), fill=PAL["rain"][0])          # bright leading tip
    # a few fat beads clinging to the antefix tile-ends (about to fall)
    for dx in range(14, W, 36):
        d.point((dx, ey - 2), fill=PAL["rain"][0])
        d.point((dx, ey - 1), fill=PAL["rain"][1])
    # a faint cool vignette at the very top-LEFT corner only (the right corner
    # holds the unlit-49 lantern, which must stay legible) — dithered, never a
    # smooth fade.
    dither(d, 0, 0, 64, 36, RAIN_DEEP, phase=0)
    dither(d, 0, 0, 40, 56, RAIN_DEEP, phase=1)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][3])
    paint_sky(d)              # dusk storm sky + rose-gold horizon + far rain
    paint_lantern_halos(d)    # the 49 lanterns dissolved into warm halos (49 unlit)
    paint_giwa_roof(d)        # the 대웅전 giwa roof mass, wet slate, curled eave
    paint_near_rain(d)        # the near rain curtain + eave drips (depth)
    return img


def main():
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-bg-rainsound.png")
    C.preview(img, "preview_cosmetic-bg-rainsound.png", scale=3)
    # not a slotted room, but overlay the spec-element rects to confirm placement
    C.hotspot_debug(img, CHECK_RECTS, "hotspot_cosmetic-bg-rainsound.png", scale=3)


if __name__ == "__main__":
    main()
