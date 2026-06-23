#!/usr/bin/env python3
"""room-01-hotteok-closing.png — Zona 1 estado B "empezando a cerrar" (320x240).

The Slot-5 revisit of 순자 이모's 호떡 stall: the SAME composition as
room-01-hotteok, but the diegetic clock (L3-c) has advanced one notch —
  * a NEIGHBOUR shutter is half-down (the metal roll-down, state="half"),
  * two background neons are OFF (neon_alley dims: a halo less),
  * the griddle steam is THINNER (fewer / shorter wisps),
  * a FOLDED cardboard box now sits on the counter (the 군대-package box = the
    Slot-5 trigger, "gunbox").
The 호떡 griddle STAYS LIT — 이모 never turns off the last thing (L3-c / L3-d:
the griddle is still the key light, the warmest, highest-contrast element).

Same hotspots as room-01-hotteok (STYLE.md hotspot table, seed 320x240 space):
  imo      [145, 80, 60, 90]  slot-1  (reactivates as slot-5 on revisit)
  gunbox   [ 55,120, 50, 50]  slot-5  (the folded box on the counter)
  hotteok  [120,178, 55, 30]  cosmetic
  backpack [ 15,180, 40, 35]  cosmetic
  bulb     [195, 28, 24, 28]  cosmetic

Uses ONLY common.py builders + helpers (FROZEN). Opaque 320x240 (no alpha 0).
Deterministic: every scatter uses an explicit random.Random(seed).

Run from repo root:  python tools/escape-room-level03/gen_room-01-hotteok-closing.py
"""

from __future__ import annotations

import random

import common as C
from common import OUTLINE, PAL, fill, frame, hline, vline, dither

W, H = 320, 240

# Hotspots (STYLE.md table, seed space). imo doubles as slot-1 / slot-5; on this
# closing revisit it is the slot-5 trigger, but the rect is identical.
HOTSPOTS = [
    (145, 80, 60, 90),   # imo      -> slot-5 (reactivated)
    (55, 120, 50, 50),   # gunbox   -> slot-5 (the folded box on the counter)
    (120, 178, 55, 30),  # hotteok  -> cosmetic
    (15, 180, 40, 35),   # backpack -> cosmetic
    (195, 28, 24, 28),   # bulb     -> cosmetic
]


def sky_and_alley(d):
    """The cold night-market backdrop: asphalt wash + receding neon (DIMMED)."""
    # the deep wet-asphalt night fills the whole frame first (opaque base)
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    # an upper band a touch darker (the unlit roof of the covered market)
    fill(d, 0, 0, W, 40, PAL["asphalt"][3])
    dither(d, 0, 36, W, 8, PAL["asphalt"][2], phase=0)
    # the market receding in fuga across the upper-middle: a wall of small neon
    # signs. STATE B: lit_cols capped LOW so several background halos are dark
    # (the diegetic clock — a halo less, L3-c). Same seed as state A -> the same
    # signs, just fewer lit.
    C.neon_alley(d, 4, 20, 312, 70, lit_cols=6, seed=33)
    # L3-a guard: knock the crispness off the front (largest) neon row with a
    # dithered asphalt veil so it reads as distant GLOW, never legible strokes.
    dither(d, 0, 18, W, 16, PAL["asphalt"][2], phase=0)
    dither(d, 0, 20, W, 12, PAL["asphalt"][3], phase=1)
    # client silhouettes drifting past in the mid-distance (cold shadows)
    r = random.Random(91)
    for _ in range(7):
        sx = r.randint(8, 300)
        sh = r.randint(14, 22)
        sy = 96 - sh
        fill(d, sx, sy, 5, sh, PAL["asphalt"][3])
        d.ellipse([sx, sy - 4, sx + 5, sy + 1], fill=PAL["asphalt"][3])


def neighbour_stall_and_shutter(d):
    """The next stall over (right third, in fuga) with its shutter HALF-DOWN."""
    # a dim background stall chassis on the right, slightly smaller (depth)
    C.market_stall(d, 232, 60, w=84, h=64, awning="stripe", bulb=False)
    # its neon went dark (one of the off halos) — a dead tube on the valance
    C.neon_sign(d, 250, 50, 30, 10, color="cyan", lit=False)
    # THE DIEGETIC CLOCK: the neighbour's metal shutter pulled half-down over the
    # open counter (L3-c, state B). Sits inside the neighbour stall opening.
    C.shutter(d, 244, 78, w=60, h=46, state="half")


def back_stall_left(d):
    """A second background stall on the left, also dimming (depth + clutter)."""
    C.market_stall(d, 4, 66, w=70, h=58, awning="stripe", bulb=True)
    # its sign still faintly lit (green) — the alley is not all dark yet
    C.neon_sign(d, 18, 58, 26, 9, color="green", lit=True)


def hero_stall(d):
    """순자 이모's own stall chassis — the warm island, centre. Bulb at upper-R."""
    # A warm wooden BACK WALL fills the interior first (so the stall is not a
    # hollow void — rule 8, the market is FULL). The wall is dim hanok wood lit
    # amber from the griddle below; a utensil rail with hanging ladles + a faint
    # paper menu strip hang on it (no legible text — L3-a).
    wx, wy, ww, wh = 100, 56, 142, 122
    C.wood_planks(d, wx, wy, ww, wh, PAL["wood_dark"], plank_h=10, seam_every=2)
    dither(d, wx, wy, ww, wh, PAL["wood_dark"][3], phase=1)   # dim the back wall
    # amber spill from the griddle warming the lower-centre of the back wall —
    # a soft dithered wash (NOT a hard blob), brightest just behind the plate.
    for i, (pad_y, c) in enumerate(((20, PAL["wood_dark"][1]),
                                    (10, PAL["wood_dark"][0]),
                                    (4, PAL["wood_light"][2]))):
        dither(d, 128, wy + wh - 8 - pad_y, 84, pad_y + 8, c, phase=i % 2)
    # a utensil rail across the upper interior with hanging ladles / spatulas
    rail_y = wy + 12
    hline(d, wx + 8, rail_y, ww - 16, PAL["metal"][3])
    r = random.Random(63)
    for i, ux in enumerate(range(wx + 16, wx + ww - 16, 18)):
        vline(d, ux, rail_y, 3, PAL["metal"][3])             # hook
        kind = r.randint(0, 2)
        if kind == 0:                                        # ladle
            vline(d, ux, rail_y + 3, 14, PAL["metal"][2])
            d.ellipse([ux - 3, rail_y + 15, ux + 3, rail_y + 21],
                      fill=PAL["metal"][1], outline=OUTLINE)
        elif kind == 1:                                      # flat scoop
            vline(d, ux, rail_y + 3, 10, PAL["wood_dark"][3])
            fill(d, ux - 3, rail_y + 12, 7, 6, PAL["metal"][2])
            frame(d, ux - 3, rail_y + 12, 7, 6, OUTLINE)
        else:                                                # a paper sachet
            fill(d, ux - 3, rail_y + 4, 6, 11, PAL["white"][2])
            dither(d, ux - 1, rail_y + 6, 4, 7, PAL["wood_light"][2], phase=0)
            frame(d, ux - 3, rail_y + 4, 6, 11, OUTLINE)
    # the protagonist stall chassis OVER the wall. bulb=False here: the built-in
    # bulb hangs at the far-right (x~230) but the interactive bulb hotspot is
    # [195,28,24,28] -> centre (207,42), so we draw our OWN bulb there (below).
    C.market_stall(d, 96, 44, w=150, h=150, awning="stripe", bulb=False)
    # the interactive bare bulb, hanging from above the awning, glow centred on
    # its hotspot (207,42). It swings on click (cosmetic) — drawn warm + bright.
    bcx, bcy = 207, 42
    vline(d, bcx, 28, bcy - 28, PAL["ink"][2])               # cord up out of frame top
    C.glow(d, bcx, bcy, 8,
           [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][0]])
    d.ellipse([bcx - 3, bcy - 3, bcx + 3, bcy + 4],
              fill=PAL["gold_light"][0], outline=PAL["ember"][2])
    d.point((bcx, bcy), fill=PAL["white"][0])
    fill(d, bcx - 1, bcy - 5, 2, 2, PAL["metal"][3])         # the brass cap


def counter_clutter(d):
    """Props ON the wood counter: the FOLDED box (slot-5) + dough/sugar tubs."""
    # the counter top of the hero stall is at y = 44 + 150 - 16 = 178
    counter_y = 178
    # --- the FOLDED cardboard box (the 군대-package box) = the slot-5 gunbox.
    # rect [55,120,50,50] -> centre (80,145). A flat-folded carton standing on
    # the counter, its centre sitting on that hotspot.
    bx, by, bw, bh = 62, 124, 38, 42
    C.drop_shadow(d, bx, by + bh - 1, bw, 2)
    # a flattened/folded carton: a leaning trapezoid slab of kraft board
    box, box_hi, box_sh = PAL["wood_light"][1], PAL["wood_light"][0], PAL["wood_dark"][1]
    d.polygon([(bx, by + bh), (bx + 2, by + 4), (bx + bw - 6, by),
               (bx + bw, by + bh - 4)], fill=box, outline=OUTLINE)
    hline(d, bx + 2, by + 5, bw - 8, box_hi)              # lit top fold edge
    vline(d, bx + 1, by + 6, bh - 8, box_hi)              # lit left edge
    dither(d, bx + bw - 12, by + 6, 10, bh - 10, box_sh, phase=0)  # shaded right
    # the fold creases of the flattened box (so it reads "folded", not a block)
    d.line([bx + 12, by + bh - 2, bx + 14, by + 4], fill=box_sh)
    d.line([bx + 24, by + bh - 3, bx + 26, by + 3], fill=box_sh)
    hline(d, bx + 2, by + bh // 2, bw - 6, box_sh)        # mid horizontal score
    # a strip of packing tape catching the warm bulb (amber tint, no text)
    fill(d, bx + 6, by + bh // 2 - 2, bw - 12, 3, PAL["gold_light"][2])
    hline(d, bx + 6, by + bh // 2 - 2, bw - 12, PAL["gold_light"][1])

    # --- a dough tub + a sugar bucket beside it (background clutter, dossier §6)
    # dough tub (left of the box)
    tx, ty = 100, 150
    fill(d, tx, ty, 20, 26, PAL["white"][2])
    fill(d, tx + 2, ty + 2, 16, 6, PAL["white"][0])      # pale dough heaped
    dither(d, tx + 2, ty + 3, 16, 4, PAL["white"][1], phase=0)
    frame(d, tx, ty, 20, 26, OUTLINE)
    hline(d, tx, ty + 8, 20, PAL["wood_dark"][2])        # rim band
    C.drop_shadow(d, tx, ty + 25, 20, 2)
    # sugar bucket (further left, smaller, behind)
    sx, sy = 124, 156
    fill(d, sx, sy, 16, 20, PAL["metal"][2])
    hline(d, sx, sy, 16, PAL["metal"][1])
    dither(d, sx + 10, sy + 2, 6, 16, PAL["metal"][3], phase=0)
    fill(d, sx + 2, sy + 2, 12, 5, PAL["white"][0])      # white sugar on top
    frame(d, sx, sy, 16, 20, OUTLINE)
    C.drop_shadow(d, sx, sy + 19, 16, 2)


def backpack_under_counter(d):
    """The kidnapped backpack tucked low-left under the counter (cosmetic)."""
    # rect [15,180,40,35] -> centre (35,197.5). The backpack builder bbox ~34x32.
    C.backpack(d, 16, 182, w=36, h=34)
    # a sliver of the counter leg / dark recess behind it so it reads "tucked
    # under the counter", not floating on the floor
    fill(d, 12, 178, 46, 4, PAL["wood_dark"][3])
    hline(d, 12, 178, 46, PAL["wood_dark"][2])


def imo_figure(d):
    """순자 이모 behind the counter, apron descending toward the plate."""
    # 이모 stands behind the counter; her apron disappears behind the counter
    # front. Hotspot [145,80,60,90] -> centre (175,125). Place her in the LOWER
    # part of her rect (head ~y=114, in-rect) so her busy hands (~y=141) reach
    # down toward the plate that sits on the counter front lip just below.
    imo_x, imo_y = 160, 110
    # a wider apron skirt continuing DOWN to the counter so she reads as standing
    # AT the plate, not floating. It tapers slightly and runs to the counter top
    # (y=178); the counter front lip is re-drawn over its base (below) to occlude
    # it cleanly. Drawn before the figure so the torso overlaps it.
    counter_top = 178
    sk_top = imo_y + 38
    for yy in range(sk_top, counter_top):
        t = (yy - sk_top) / max(counter_top - sk_top - 1, 1)
        half = 11 + int(2 * t)                              # slight flare to the hem
        fill(d, imo_x + 14 - half, yy, half * 2, 1, PAL["ember"][2])
    C.vline(d, imo_x + 14 - 11, sk_top, counter_top - sk_top, PAL["ember"][1])  # lit edge
    dither(d, imo_x + 14, sk_top + 2, 9, counter_top - sk_top - 2, PAL["ember"][3], phase=0)
    C.hline(d, imo_x + 4, imo_y + 42, 20, PAL["ember"][3])  # a lower apron seam
    C.imo(d, imo_x, imo_y, pose="griddle")


def counter_front(d):
    """Re-draw the hero counter front lip OVER 이모's apron base (occlusion).

    Runs AFTER 이모 but BEFORE clutter + griddle, so she reads as standing
    BEHIND the counter (kills the floating-apron-block read), and the props that
    sit ON the counter (box, tubs, griddle) land on a clean front lip.
    """
    cx0, cw, counter_top = 96, 150, 178
    C.wood_planks(d, cx0, counter_top, cw, 16, PAL["wood_light"], plank_h=6, seam_every=2)
    C.hline(d, cx0, counter_top, cw, PAL["wood_light"][0])
    fill(d, cx0, counter_top + 14, cw, 2, PAL["wood_dark"][3])
    frame(d, cx0, counter_top, cw, 16, OUTLINE)


def griddle(d):
    """The KEY LIGHT (griddle, never off) on the counter front. THINNER steam."""
    # The griddle sits on the counter front, directly below 이모's reaching hands.
    # Its 호떡 = the cosmetic hotspot [120,178,55,30] -> centre (147.5,193).
    # bbox 64x30 at (116,176): plate ellipse y=180..206, 호떡 discs near y=189,
    # centre x=148 -> inside the rect, the plate front just over the counter lip.
    gx, gy = 116, 176
    C.griddle_hotteok(d, gx, gy, w=64, h=30, spatula=True)

    # STATE B: thinner steam. The griddle builder already emits two warm wisps;
    # in state A a scene would add several tall extra columns. Here we add only
    # ONE short, faint extra wisp (the plate cooling toward closing) instead of a
    # full bank — so the steam reads visibly THINNER than the open-market state.
    C.steam(d, gx + 50, gy + 2, height=8, phase=2, warm=True)


def hanging_bags(d):
    """The string of paper 호떡 bags hanging from the hero awning (dossier §6)."""
    # under the hero awning hem (awning top y=44, hem ~ y=56), to the left of
    # the bulb. A short garland of little kraft bags on a cord.
    cord_y = 58
    hline(d, 110, cord_y, 70, PAL["ink"][2])             # the cord
    r = random.Random(45)
    for i, bx in enumerate(range(116, 178, 12)):
        sag = r.randint(0, 2)
        by = cord_y + 1 + sag
        # a tiny folded paper bag silhouette
        fill(d, bx, by, 7, 9, PAL["white"][1])
        hline(d, bx, by, 7, PAL["white"][0])
        dither(d, bx + 4, by + 2, 3, 6, PAL["wood_light"][2], phase=0)
        vline(d, bx + 3, by, 9, PAL["wood_dark"][1])     # fold seam
        frame(d, bx, by, 7, 9, OUTLINE)


def market_cat(d):
    """The market cat curled at the foot of the stall (scene uses frame 0/1)."""
    # low-right of the hero stall base, on the asphalt; frame 0 (sitting).
    C.market_cat(d, 206, 176, frame_i=0)


def foreground_wet(d):
    """The lower foreground: wet asphalt reflecting the neon, split + trembling."""
    # a band of wet asphalt across the very bottom
    fill(d, 0, 214, W, 26, PAL["asphalt"][2])
    dither(d, 0, 214, W, 4, PAL["asphalt"][3], phase=1)
    # neon split + trembling down the wet street (the pink hero sign + a cyan)
    C.wet_reflect(d, 8, 214, 150, 26, color="pink", seed=7)
    C.wet_reflect(d, 170, 214, 142, 26, color="cyan", seed=12)
    # a couple of warm griddle-glow reflections directly under the hero plate
    for rx in range(128, 168, 3):
        d.point((rx, 220), fill=PAL["ember"][2])
        d.point((rx + 1, 224), fill=C.AMBER_DEEP)


def compose():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    sky_and_alley(d)
    neighbour_stall_and_shutter(d)
    back_stall_left(d)
    hero_stall(d)               # back wall + chassis + interactive bulb
    hanging_bags(d)
    backpack_under_counter(d)
    imo_figure(d)               # 이모 + her apron skirt (behind the counter)
    counter_front(d)            # re-draw the counter lip OVER her apron base
    counter_clutter(d)          # box (slot-5) + dough/sugar tubs ON the counter
    griddle(d)                  # the KEY LIGHT, on the counter front
    market_cat(d)
    foreground_wet(d)
    return img


def main():
    img = compose()
    # guard: scene must be fully opaque (no alpha-0 pixels) — STYLE.md rule 6.
    alpha = img.getchannel("A")
    lo, hi = alpha.getextrema()
    assert lo == 255, f"scene has transparent pixels (alpha min {lo}); must be opaque"

    C.save_asset(img, "rooms", "room-01-hotteok-closing.png")
    C.preview(img, "preview_room-01-hotteok-closing.png", scale=3)
    C.hotspot_debug(img, HOTSPOTS, "hotspot_room-01-hotteok-closing.png", scale=3)


if __name__ == "__main__":
    main()
