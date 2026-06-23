#!/usr/bin/env python3
"""obj-gift-wrapped.png — close-up of the chosen gift wrapped in kraft paper.

Dossier §6 Zona 3 estado B (line 249/253) + §10 asset list (line 840): «el regalo
envuelto en papel de estraza … sobre el mostrador». After the Slot 3 bargain is
won, the chosen object is wrapped at the front of the 만물상 counter; this is the
128×128 transparent close-up the UI frames (the card carries the Korean
`도윤은 무뚝뚝하지만 …` for Slot 4 — per L3-a NO Korean is painted into the art).
The whole job of this art: read instantly as a small parcel of brown kraft paper
tied with a red string bow — warm yellow-bulb light on its upper-left, cool neon
leaking from the street side, against transparent black so the UI frames it.

GIFT DESIGN = the room's gift. `common.gift_wrapped()` is the canonical parcel
(wood_light[1] kraft body, wood_light[0] lit top + left edge, wood_dark[1] shaded
right, two diagonal fold creases, a tteok-RED ribbon cross — vertical + horizontal
bands — and a small two-loop bow + knot + tails at the top centre, its single
identity color). That builder is authored at ROOM scale (~34×26) with a 4px
ribbon, 6px bow loops and 1px creases, so a brute 3–4× NEAREST upscale staircases
the bow triangles into jagged ramps and the thin ribbon into a fat block (the
same staircase verified for obj-backpack/obj-hotteok). So this close-up reproduces
the builder's EXACT design — same ramps (wood_light kraft, wood_dark shade,
tteok ribbon), same parts (creased parcel, ribbon cross, two-loop bow + knot +
tails), same OUTLINE — drawn NATIVELY at close-up size so every edge stays a clean
1px pixel-art line. It is the same gift, enlarged the right way; the room renders
the small builder, this renders the identical design large. A tiny native
`gift_wrapped()` swatch is stamped bottom-left as the literal cross-reference
anchor (rule 2 — compose with the shared builder; QA eyeballs "same gift").

Light: Zona 3 is the bulb-lit bazaar (dossier §6: «domina el amarillo sucio de la
bombilla; el frío del callejón se cuela solo por el borde izquierdo»). The dirty
yellow bulb hangs above, so the parcel's TOP + upper-LEFT face catches a warm
gold_light rim; the cold neon street leaks a faint cool rim on the lower-left edge
and the contact shadow on the wet asphalt is SHADOW_COOL. Kept STRICTLY on/under
the silhouette — nothing floats (L3-e).

L3-a: no legible Korean anywhere. L3-b/L3-e: nothing hidden, 100% mundane — it is
just a wrapped gift. NO neon "magic" glow.

Run from repo root:  python tools/escape-room-level03/gen_obj-gift-wrapped.py
Deterministic: no unseeded random; re-run -> byte-identical PNG.
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

W = H = 128

# ── geometry of the enlarged parcel (same design as common.gift_wrapped, native) ─
CX = 64                     # frame centre x — the parcel + bow are centred
BOX_L = 22                  # left edge of the kraft box
BOX_R = 106                 # right edge of the kraft box
BOX_T = 40                  # top of the box (the bow rises ABOVE this)
BOX_B = 104                 # base of the box (sits on the asphalt)
RIB_HW = 7                  # half-width of the red ribbon band (native of builder's 4px@34)
BOW_RISE = 22               # how far the bow loops crest above the box top
BOW_SPAN = 26               # half-span of each bow loop sideways


def _box(d) -> None:
    """The kraft-paper parcel body: lit top + left edge, shaded right, fold creases.

    Faithful to common.gift_wrapped: wood_light[1] body, wood_light[0] on the lit
    top + left edges (the bulb above-left), a wood_dark[1] dither shading the right
    face, two diagonal fold creases of folded kraft paper, a clean 1px OUTLINE box.
    """
    paper, paper_hi, paper_sh = PAL["wood_light"][1], PAL["wood_light"][0], PAL["wood_dark"][1]
    w = BOX_R - BOX_L
    h = BOX_B - BOX_T
    fill(d, BOX_L, BOX_T, w, h, paper)
    # lit top edge + lit left edge (the bulb hangs above-left) — a 2px warm band
    hline(d, BOX_L, BOX_T, w, paper_hi)
    hline(d, BOX_L, BOX_T + 1, w, paper_hi)
    vline(d, BOX_L, BOX_T, h, paper_hi)
    vline(d, BOX_L + 1, BOX_T, h, paper_hi)
    # the shaded right face (a dithered band, builder's "shaded right")
    dither(d, BOX_R - 22, BOX_T + 4, 22, h - 6, paper_sh, phase=0)
    vline(d, BOX_R - 1, BOX_T + 2, h - 2, paper_sh)
    # two long diagonal fold creases of the kraft paper (the builder's two creases,
    # native length so they read as folds, not scratches)
    d.line([BOX_L + 11, BOX_B - 4, BOX_L + 26, BOX_T + 4], fill=paper_sh)
    d.line([BOX_L + 12, BOX_B - 4, BOX_L + 27, BOX_T + 4], fill=PAL["wood_dark"][0])
    d.line([BOX_R - 30, BOX_B - 4, BOX_R - 14, BOX_T + 6], fill=paper_sh)
    d.line([BOX_R - 31, BOX_B - 4, BOX_R - 15, BOX_T + 6], fill=PAL["wood_dark"][0])
    # a couple of short cross-folds so the paper reads as wrapped, not a plain block
    d.line([BOX_L + 4, BOX_T + 18, BOX_L + 16, BOX_T + 14], fill=paper_sh)
    d.line([BOX_R - 18, BOX_B - 16, BOX_R - 4, BOX_B - 12], fill=paper_sh)
    frame(d, BOX_L, BOX_T, w, h, OUTLINE)


def _ribbon(d) -> None:
    """The tteok-RED ribbon cross: a vertical band + a horizontal band.

    The parcel's single identity color, faithful to common.gift_wrapped (vertical
    band + horizontal band, each with a lit edge). The bands wrap the box; a thin
    OUTLINE edge keeps them crisp against the kraft paper.
    """
    ribbon, ribbon_hi, ribbon_sh = PAL["tteok"][1], PAL["tteok"][0], PAL["tteok"][2]
    # the VERTICAL band down the centre
    fill(d, CX - RIB_HW, BOX_T, RIB_HW * 2, BOX_B - BOX_T, ribbon)
    vline(d, CX - RIB_HW, BOX_T, BOX_B - BOX_T, ribbon_hi)        # lit left edge
    vline(d, CX - RIB_HW + 1, BOX_T, BOX_B - BOX_T, ribbon_hi)
    dither(d, CX + RIB_HW - 4, BOX_T + 2, 4, BOX_B - BOX_T - 4, ribbon_sh, phase=0)
    frame(d, CX - RIB_HW, BOX_T, RIB_HW * 2, BOX_B - BOX_T, OUTLINE)
    # the HORIZONTAL band across the middle (drawn after so it crosses on top)
    my = (BOX_T + BOX_B) // 2 - RIB_HW
    fill(d, BOX_L, my, BOX_R - BOX_L, RIB_HW * 2, ribbon)
    hline(d, BOX_L, my, BOX_R - BOX_L, ribbon_hi)                 # lit top edge
    hline(d, BOX_L, my + 1, BOX_R - BOX_L, ribbon_hi)
    dither(d, BOX_L + 2, my + RIB_HW * 2 - 4, BOX_R - BOX_L - 4, 4, ribbon_sh, phase=1)
    frame(d, BOX_L, my, BOX_R - BOX_L, RIB_HW * 2, OUTLINE)
    # re-lay the vertical lit edge where the horizontal band crossed it, so the
    # cross reads as a continuous wrap (the vertical is "in front" at the knot top)
    vline(d, CX - RIB_HW, my, RIB_HW * 2, ribbon_hi)
    vline(d, CX - RIB_HW + 1, my, RIB_HW * 2, ribbon)
    fill(d, CX - RIB_HW, my, RIB_HW * 2, 1, ribbon_hi)
    d.point((CX - 1, my + 1), fill=ribbon_hi)                    # a small cross glint


def _bow(d) -> None:
    """The two-loop bow + knot + two tails at the top-centre crossing.

    Faithful to common.gift_wrapped's bow (two triangular loops, a knot, two
    tails), native-crisp so the loops are clean wedges, not staircased ramps. The
    loops crest ABOVE the box top (the parcel's silhouette includes the bow).
    """
    ribbon, ribbon_hi, ribbon_sh = PAL["tteok"][1], PAL["tteok"][0], PAL["tteok"][2]
    cx = CX
    top = BOX_T - BOW_RISE
    # the two loops: each a ROUNDED ribbon loop from the knot out + up. A loop is a
    # folded band, so the outer edge is a short VERTICAL face (a fold), not a single
    # blade point — built as a 5-point polygon (knot -> outer-top -> outer-edge
    # -> outer-bottom -> knot-low) so it reads as a fat ribbon loop, not an arrow.
    for sgn in (-1, +1):
        out = cx + sgn * BOW_SPAN
        edge = cx + sgn * (BOW_SPAN - 2)
        d.polygon([(cx, BOX_T - 5), (out, top + 4), (out, top + 11),
                   (edge, BOX_T + 7), (cx, BOX_T + 1)],
                  fill=ribbon, outline=OUTLINE)
        # the loop's inner twist: a shaded wedge low-inside so the loop has a fold
        # of shadow under its lit top, NOT a see-through hole
        inset_x = cx + sgn * (BOW_SPAN - 9)
        d.polygon([(cx, BOX_T - 2), (inset_x, top + 12), (inset_x, BOX_T + 3)],
                  fill=ribbon_sh)
        # the lit upper fold of each loop (the bulb-above highlight rides the top arc)
        d.line([(cx, BOX_T - 4), (out, top + 5)], fill=ribbon_hi)
        d.line([(cx + sgn, BOX_T - 4), (out - sgn, top + 6)], fill=ribbon_hi)
    # the two trailing tails dropping off the knot onto the box top
    for sgn in (-1, +1):
        d.line([(cx, BOX_T - 1), (cx + sgn * 7, BOX_T + 12)], fill=ribbon)
        d.line([(cx + sgn, BOX_T - 1), (cx + sgn * 8, BOX_T + 12)], fill=ribbon_sh)
        # a notched tail tip (the cut end of the string)
        d.point((cx + sgn * 7, BOX_T + 13), fill=ribbon_hi)
    # the central knot: a tight bright pinch where loops + tails meet
    fill(d, cx - 4, BOX_T - 6, 8, 9, ribbon)
    frame(d, cx - 4, BOX_T - 6, 8, 9, OUTLINE)
    hline(d, cx - 3, BOX_T - 5, 6, ribbon_hi)                    # lit knot crest
    d.point((cx - 1, BOX_T - 4), fill=ribbon_hi)
    d.point((cx + 1, BOX_T - 2), fill=ribbon_hi)
    dither(d, cx + 1, BOX_T - 2, 3, 4, ribbon_sh, phase=0)       # shaded knot right


def _light_and_shadow(d) -> None:
    """The warm yellow bulb (above-left) vs the cool neon street (lower-left).

    Dossier §6 Zona 3: the dirty yellow bulb dominates from above, the cold alley
    neon leaks only from the LEFT edge of the frame. So the parcel's TOP + upper-
    LEFT catches a warm gold_light rim (light ON the paper); a faint cool neon rim
    licks the lower-left edge; the contact shadow on the wet asphalt is
    SHADOW_COOL. Kept STRICTLY on/under the silhouette — nothing floats (L3-e).
    """
    # a soft warm WASH over the upper-left quadrant of the kraft paper (the dirty
    # yellow bulb hangs above-left and pools its glow on that corner) — a sparse
    # gold dither that stays OFF the ribbon and OFF the centre bow (so the warmth
    # never reads as a creature's ears). Light ON the paper, by bands (rule 3).
    for yy in range(BOX_T + 2, BOX_T + (BOX_B - BOX_T) // 2 - RIB_HW - 1):
        # pull the wash's right edge AWAY from the centre near the top so the warm
        # glow never crowds the knot / reads as a mark beside it (it hugs the corner)
        right = min(CX - RIB_HW - 4, BOX_L + 6 + (yy - BOX_T) * 3)
        for xx in range(BOX_L + 2, right):
            # fade with distance from the top-left corner (the bulb's hot spot)
            t = ((xx - BOX_L) + (yy - BOX_T) * 2)
            if t < 14 and (xx + yy) % 2 == 0:
                d.point((xx, yy), fill=PAL["gold_light"][1])
            elif t < 30 and (xx * 3 + yy) % 3 == 0:
                d.point((xx, yy), fill=PAL["gold_light"][2])
    # a crisp warm gold rim on the lit TOP edge + lit LEFT edge (the bulb above-left)
    hline(d, BOX_L + 1, BOX_T + 1, CX - RIB_HW - BOX_L - 1, PAL["gold_light"][1])
    for yy in range(BOX_T + 2, BOX_B - 4):
        d.point((BOX_L + 1, yy), fill=PAL["gold_light"][2] if yy % 2 == 0
                else PAL["wood_light"][0])
    # deepen the SHADED lower-right of the paper so the warm/cool contrast reads
    # (the bulb is above-left → the lower-right eases into warm-neutral shadow).
    # Faded with distance from the bottom-right corner so it reads as ROUNDNESS,
    # not a panel: denser near the corner, sparser inboard (rule 3: bands).
    for yy in range(BOX_B - 26, BOX_B - 1):
        for xx in range(BOX_R - 24, BOX_R - 1):
            if xx <= CX + RIB_HW:                  # stay clear of the ribbon band
                continue
            t = (BOX_R - xx) + (BOX_B - yy)        # distance from the dark corner
            gate = 2 if t < 14 else (3 if t < 26 else 0)
            if gate and (xx * 2 + yy) % gate == 0:
                d.point((xx, yy), fill=PAL["wood_dark"][1])
    # a faint COOL neon rim licking the lower-left edge (the street leak), thin
    for yy in range(BOX_T + (BOX_B - BOX_T) // 2, BOX_B - 4):
        if yy % 2 == 1:
            d.point((BOX_L, yy), fill=PAL["neon_cyan"][3])
    d.point((BOX_L, BOX_B - 6), fill=PAL["neon_cyan"][2])
    # the cool contact shadow on the wet asphalt under the parcel (it sits on the
    # bazaar counter at the street edge) — SHADOW_COOL, dithered, hugging the base
    C.drop_shadow(d, BOX_L - 4, BOX_B, (BOX_R - BOX_L) + 8, 3, cool=True)
    C.drop_shadow(d, BOX_L + 6, BOX_B + 3, (BOX_R - BOX_L) - 12, 2, cool=True)


def _reference_swatch(d) -> None:
    """Stamp the canonical common.gift_wrapped() at native 1× in the lower-left.

    The literal cross-asset anchor: this is the EXACT gift the 만물상 estado-B room
    renders, so the enlarged parcel above is provably the same design (rule 2 —
    compose with the shared builder). Tiny, in the corner, a faint reference token.
    """
    C.gift_wrapped(d, 8, 96, w=30, h=24)


def build():
    img, d = C.new_canvas(W, H)              # transparent canvas (close-up)
    _box(d)                  # the kraft-paper parcel body, native crisp edges
    _ribbon(d)               # the red ribbon cross (vertical + horizontal bands)
    _bow(d)                  # the two-loop bow + knot + tails (the identity beat)
    _light_and_shadow(d)     # warm bulb rim (top/left) + cool street + contact shadow
    _reference_swatch(d)     # the canonical builder gift, 1×, as the anchor token
    return img


def main():
    img = build()
    C.save_asset(img, "objects", "obj-gift-wrapped.png")
    C.preview(img, "preview_obj-gift-wrapped.png", scale=3)
    # an 8x zoom of the bow + knot so the red identity color + loop read can be eyeballed
    crop = img.crop((CX - 34, BOX_T - BOW_RISE - 2, CX + 34, BOX_T + 18))
    crop = crop.resize((crop.width * 5, crop.height * 5), C.Image.NEAREST)
    C.save_out(crop, "zoom_obj-gift-wrapped_bow_5x.png")


if __name__ == "__main__":
    main()
