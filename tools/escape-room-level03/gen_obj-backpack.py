#!/usr/bin/env python3
"""obj-backpack.png — close-up of the "kidnapped" backpack (호떡집, Zona 1).

Dossier §6 Zona 1 + §10: a 128×128 transparent close-up of the player's daypack,
"secuestrada" under 순자 이모's counter, tucked beside the dough crates on the wet
asphalt (`이모가 내 가방을 안 줘요.` / sown for the outro: `이제 가방 받으세요.`). The
whole job of this art: read instantly as YOUR slumped backpack — the Chekhov
hostage just out of reach — warm on its griddle-facing side, cool on the street
side, against transparent black so the UI frames it.

BACKPACK DESIGN = the room's backpack. `common.backpack()` is the canonical
daypack (wood_dark body, two looping shoulder straps over the top, a curved lid
flap with its own seam, a front pocket, a tteok-RED zipper pull at the centre —
its single identity color). That builder is authored at ROOM scale (~34×32) with
ink-arc straps, a pieslice lid and tiny 2px zip tabs, so a brute 3–4× NEAREST
upscale staircases the arcs into jagged ribbons and the red pull into a giant
block (verified the same way obj-second-cup verified the 다실 cup). So this
close-up reproduces the builder's EXACT design — same ramps (wood_dark body,
ink straps, tteok zip), same parts (slumped rounded body, looping straps, lid
flap + seam, front pocket, central red pull), same OUTLINE — drawn NATIVELY at
close-up size so every edge stays a clean 1px pixel-art line. It is the same
pack, enlarged the right way; the room renders the small builder, this renders
the identical design large. A tiny native `backpack()` swatch is stamped
bottom-left as the literal cross-reference anchor (rule 2 — compose with the
shared builder; QA eyeballs "same pack").

Light (L3-d): the griddle is the warm key just to the RIGHT in the room, so the
pack's right face catches a warm ember rim; the left/street side and the contact
shadow are cool (SHADOW_COOL) — it sits on wet asphalt under the counter.

L3-a: no legible Korean anywhere. L3-b/L3-e: nothing hidden, 100% mundane — it is
just a bag. NO neon "magic" glow.

Run from repo root:  python tools/escape-room-level03/gen_obj-backpack.py
Deterministic: no unseeded random; re-run -> byte-identical PNG.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

W = H = 128

# ── geometry of the enlarged pack (the same design as common.backpack, native) ─
CX = 64                     # frame centre x — the pack is centred horizontally
BODY_TOP = 44               # top of the rounded daypack body (shoulders)
BODY_BOT = 114              # base of the body (sits flatter on the asphalt)
BODY_HW = 37                # body half-width at the widest (it bulges, slumped)
SHO_HW = 26                 # half-width at the pinched shoulders (narrower → pack)
LID_BOT = 74                # where the lid flap seam crosses the body
STRAP_RISE = 9              # how far the strap loops arc above the shoulders (flat)


def _body_silhouette_pts():
    """The slumped-daypack outline as a point list: pinched shoulders, a wide low
    belly, a flatter base. Shared by _body (fill) and is the reference the straps
    tuck behind. Returns the right-half profile (x_offset per scanline)."""
    prof = {}
    for yy in range(BODY_TOP, BODY_BOT + 1):
        t = (yy - BODY_TOP) / (BODY_BOT - BODY_TOP)
        # shoulders narrow (t~0), belly widest (t~0.55), base eased in a touch
        if t < 0.18:                                   # round the shoulders in
            half = SHO_HW + (BODY_HW - SHO_HW) * (t / 0.18)
        elif t > 0.85:                                 # ease the base corners
            half = BODY_HW - (BODY_HW - 28) * ((t - 0.85) / 0.15)
        else:
            half = BODY_HW
        prof[yy] = int(half)
    return prof


def _straps(d) -> None:
    """The two shoulder straps as WIDE FLAT grab-loops cresting the lid.

    Faithful to common.backpack (verified at 8x): the canonical pack shows two
    wide, FLAT webbing loops poking just over the top — they read as straps, not
    ears, BECAUSE they are wider than they are tall and anchored right at the lid
    crest (the lid is drawn after, overlapping their base). So: a low half-ellipse
    band (rise ~9px, span ~30px) per strap, its feet tucked under where the lid
    will cover them, plus the white anchor nubs the builder stamps on the sides.
    """
    strap, strap_hi, strap_sh = PAL["ink"][1], PAL["ink"][0], PAL["ink"][2]
    # the two straps as SOLID flat dark arches over the shoulders (NOT hollow
    # rings — a hollow ring at this scale shows the body through it and reads as
    # 'glasses'/ears). A filled half-ellipse webbing arch per strap, wide + low,
    # feet tucking under where the lid will overlap them.
    for lx in (CX - 15, CX + 15):
        top = BODY_TOP - STRAP_RISE
        bot = BODY_TOP + 9                                  # feet tuck under the lid
        # solid arch: a thick filled pieslice cut to a 4px band by a smaller
        # body-colored pieslice — but the small cut is filled with the BODY tone,
        # not transparency, so the hole reads as the pack, never a glasses lens.
        d.pieslice([lx - 14, top, lx + 14, bot + 6], 180, 360, fill=strap)
        d.pieslice([lx - 14, top, lx + 14, bot + 6], 180, 360, outline=OUTLINE)
        d.pieslice([lx - 9, top + 4, lx + 9, bot + 6], 180, 360,
                   fill=PAL["wood_dark"][2])                # the hole = the pack body
        d.pieslice([lx - 9, top + 4, lx + 9, bot + 6], 180, 360, outline=OUTLINE)
        # webbing shading: lit on the upper-left shoulder, shade on the right
        d.arc([lx - 14, top, lx + 14, bot + 6], 205, 255, fill=strap_hi)
        d.arc([lx - 14, top, lx + 14, bot + 6], 300, 350, fill=strap_sh)


def _body(d) -> None:
    """The slumped daypack body: a pinched-shoulder, wide-belly, flat-base shell.

    Built from the shared silhouette profile so it reads unmistakably as a stuffed
    daypack slumped under the counter (NOT a round pouch). wood_dark body, a warm
    lit top-left sheen, a dithered right-side core shadow for roundness; clean 1px
    OUTLINE traced from the same profile.
    """
    body, body_hi, body_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    prof = _body_silhouette_pts()
    # fill scanline by scanline from the profile (crisp 1px edges, real pack shape)
    for yy, half in prof.items():
        fill(d, CX - half, yy, half * 2, 1, body)
    # the outline: trace the left + right edges + cap the top + base
    prev = None
    for yy in sorted(prof):
        half = prof[yy]
        d.point((CX - half, yy), fill=OUTLINE)
        d.point((CX + half, yy), fill=OUTLINE)
        if prev is not None and abs(half - prev) > 1:  # close diagonal steps
            lo, hi = sorted((half, prev))
            for h2 in range(lo, hi):
                d.point((CX - h2, yy), fill=OUTLINE)
                d.point((CX + h2, yy), fill=OUTLINE)
        prev = half
    hline(d, CX - prof[BODY_TOP], BODY_TOP, prof[BODY_TOP] * 2, OUTLINE)   # top cap
    hline(d, CX - prof[BODY_BOT], BODY_BOT, prof[BODY_BOT] * 2, OUTLINE)   # base cap
    # top sheen across the lit upper-left belly (warm-neutral wood, lit side)
    for k in range(22):
        sx = CX - 24 + k
        d.point((sx, BODY_TOP + 12 + (k // 8)), fill=body_hi)
    hline(d, CX - 20, BODY_TOP + 13, 30, body_hi)
    # right-side core shadow (roundness): a soft vertical dither band, kept inside
    for yy in range(BODY_TOP + 8, BODY_BOT - 4):
        half = prof[yy]
        dither(d, CX + half - 18, yy, 14, 1, body_sh, phase=yy % 2)
    # a couple of slump creases low on the belly so it reads as soft + stuffed
    d.line([CX - 18, BODY_BOT - 18, CX - 7, BODY_BOT - 5], fill=body_sh)
    d.line([CX + 14, BODY_BOT - 20, CX + 5, BODY_BOT - 5], fill=body_sh)


def _lid(d) -> None:
    """The top LID flap (its own curved panel + seam) — the clear backpack read.

    A separate rounded flap over the upper body with its own bottom seam, exactly
    like common.backpack's pieslice lid but native-crisp. A short buckle strap
    drops off the lid front onto the body.
    """
    flap, flap_hi, flap_sh = PAL["wood_dark"][1], PAL["wood_light"][2], PAL["wood_dark"][3]
    lid_hw = SHO_HW + 6                                     # the flap caps the shoulders
    # the flap: a rounded panel capping the top, LIGHTER than the body (wood_dark[1]
    # vs body wood_dark[2]) so the seam reads as a distinct overhanging lid.
    d.pieslice([CX - lid_hw, BODY_TOP - 4, CX + lid_hw, LID_BOT + 8],
               180, 360, fill=flap)
    d.arc([CX - lid_hw, BODY_TOP - 4, CX + lid_hw, LID_BOT + 8], 180, 360, fill=OUTLINE)
    hline(d, CX - 22, BODY_TOP + 2, 44, flap_hi)            # lit crease on the flap
    # the lid bottom seam: a dark overhang line + a thin shadow under the flap edge
    hline(d, CX - lid_hw + 4, LID_BOT, lid_hw * 2 - 8, OUTLINE)
    hline(d, CX - lid_hw + 6, LID_BOT + 1, lid_hw * 2 - 12, flap_sh)
    dither(d, CX + 6, BODY_TOP + 4, lid_hw - 8, LID_BOT - BODY_TOP - 2, flap_sh,
           phase=0)                                          # shade flap right
    # a short buckle strap dropping off the lid front onto the body
    sx = CX - 2
    fill(d, sx, LID_BOT - 3, 5, 12, PAL["ink"][1])
    frame(d, sx, LID_BOT - 3, 5, 12, OUTLINE)
    fill(d, sx + 1, LID_BOT + 6, 3, 4, PAL["metal"][2])     # the buckle
    frame(d, sx, LID_BOT + 5, 5, 5, OUTLINE)
    hline(d, sx + 1, LID_BOT + 6, 3, PAL["metal"][1])
    # the strap-anchor stitch flecks where each webbing arch meets the lid (the
    # builder stamps a small light nub): kept tiny + low so they read as stitching,
    # not eyes — a 2px warm-metal fleck at each strap foot, on top of the lid edge.
    for nx in (CX - 15, CX + 15):
        d.point((nx - 1, BODY_TOP + 2), fill=PAL["metal"][1])
        d.point((nx, BODY_TOP + 2), fill=PAL["metal"][2])
        d.point((nx - 1, BODY_TOP + 3), fill=OUTLINE)


def _zip_and_pocket(d) -> None:
    """The main zipper (red pull) + the front pocket panel — the identity beats.

    common.backpack's signature: the main zip curving under the lid with a
    tteok-RED pull tab dead-centre (the pack's only saturated color), plus a front
    pocket panel with its own red pull. Both reproduced native + crisp; the red is
    the one thing the eye locks onto.
    """
    zip_track = PAL["ink"][2]
    zip_red, zip_red_hi = PAL["tteok"][1], PAL["tteok"][0]
    # the main zipper teeth curving just under the lid seam
    for zx in range(CX - 26, CX + 27, 2):
        t = abs(zx - CX) / 26.0
        zy = LID_BOT + 7 + int(6 * (1.0 - t))              # dips at the centre
        d.point((zx, zy), fill=zip_track)
        d.point((zx, zy + 1), fill=PAL["ink"][1])
    # the RED main pull tab at the centre (the identity color, unmistakable)
    fill(d, CX - 2, LID_BOT + 10, 4, 8, zip_red)
    vline(d, CX - 2, LID_BOT + 10, 8, zip_red_hi)
    frame(d, CX - 2, LID_BOT + 10, 4, 8, OUTLINE)
    d.point((CX, LID_BOT + 19), fill=zip_red_hi)            # the dangling tab tip
    d.point((CX, LID_BOT + 20), fill=PAL["tteok"][2])
    # the front pocket panel: a rounded patch low-centre with its own zip + pull
    pk_t, pk_b = BODY_BOT - 36, BODY_BOT - 6
    pk_hw = 16
    fill(d, CX - pk_hw, pk_t, pk_hw * 2, pk_b - pk_t, PAL["wood_dark"][2])
    d.pieslice([CX - pk_hw, pk_t - 8, CX + pk_hw, pk_t + 16], 180, 360,
               fill=PAL["wood_dark"][2])                    # rounded pocket top
    d.arc([CX - pk_hw, pk_t - 8, CX + pk_hw, pk_t + 16], 180, 360, fill=OUTLINE)
    frame(d, CX - pk_hw, pk_t, pk_hw * 2, pk_b - pk_t, OUTLINE)
    hline(d, CX - pk_hw + 2, pk_t - 1, pk_hw * 2 - 4, PAL["wood_dark"][1])  # lit lip
    dither(d, CX + 4, pk_t + 2, pk_hw - 6, pk_b - pk_t - 4, PAL["wood_dark"][3],
           phase=0)                                         # shade pocket right
    # the pocket zip arc + its small red pull
    d.arc([CX - pk_hw + 3, pk_t - 4, CX + pk_hw - 3, pk_t + 12], 180, 360,
          fill=PAL["ink"][2])
    fill(d, CX - 2, pk_t + 1, 4, 6, zip_red)
    vline(d, CX - 2, pk_t + 1, 6, zip_red_hi)
    frame(d, CX - 2, pk_t + 1, 4, 6, OUTLINE)


def _light_and_shadow(d) -> None:
    """The griddle warm key (right) vs the cool street (left + contact shadow).

    L3-d: in the room the griddle sits to the pack's right, so its right face
    catches a warm ember rim; the left is the cold street. The contact shadow on
    the wet asphalt is SHADOW_COOL (the pack is on the street side, under the
    counter). Kept STRICTLY on/under the silhouette — nothing floats (L3-e).
    """
    prof = _body_silhouette_pts()
    # warm ember rim band hugging the RIGHT face (a soft wedge, not a contour
    # trace): a few-px-wide dithered ember band just inside the right edge, fading
    # from ember[2] at the edge to ember[3] inboard. This is light ON the fabric.
    for yy in range(BODY_TOP + 18, BODY_BOT - 8):
        half = prof[yy]
        for k in range(5):
            xx = CX + half - 2 - k
            if (xx + yy) % 2 != 0:
                continue
            d.point((xx, yy), fill=PAL["ember"][2] if k < 2 else PAL["ember"][3])
    # a faint cool rim on the far-left edge (the cold neon street), thin band
    for yy in range(BODY_TOP + 20, BODY_BOT - 12):
        half = prof[yy]
        if yy % 2 == 0:
            d.point((CX - half + 1, yy), fill=PAL["asphalt"][0])
    # the cool contact shadow on the wet asphalt under the pack
    C.drop_shadow(d, CX - 30, BODY_BOT, 60, 3, cool=True)
    C.drop_shadow(d, CX - 18, BODY_BOT + 3, 36, 2, cool=True)


def _reference_swatch(d) -> None:
    """Stamp the canonical common.backpack() at native 1× in the lower-left.

    The literal cross-asset anchor: this is the EXACT pack the 호떡집 renders, so
    the enlarged pack above is provably the same design (rule 2 — compose with the
    shared builder). Tiny, in the corner, reading as a faint reference token.
    """
    C.backpack(d, 6, 92, w=30, h=28)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _straps(d)             # the two shoulder loops FIRST (body overlaps them)
    _body(d)               # the slumped rounded daypack body, native crisp edges
    _lid(d)                # the lid flap + seam + buckle strap (backpack read)
    _zip_and_pocket(d)     # main red pull + front pocket (the identity beats)
    _light_and_shadow(d)   # warm griddle rim R / cool street L + contact shadow
    _reference_swatch(d)   # the canonical builder pack, 1×, as the anchor token

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-backpack.png")
    C.preview(img, "preview_obj-backpack.png", scale=3)
    # an 8x zoom of the central red zip pull so the identity color can be eyeballed
    crop = img.crop((CX - 24, LID_BOT - 6, CX + 24, BODY_BOT - 2))
    crop = crop.resize((crop.width * 5, crop.height * 5), Image.NEAREST)
    C.save_out(crop, "zoom_obj-backpack_zip_5x.png")


if __name__ == "__main__":
    main()
