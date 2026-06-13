#!/usr/bin/env python3
"""obj-second-cup.png — close-up of the steaming SECOND cup (다실, Cuarto 1).

Dossier §6 Cuarto 1 + §10 candidate 3.1. A 128×128 transparent close-up of the
second tea cup — the one that "ya estaba servida y caliente al llegar". The whole
job of this art is one feeling: *still warm* (`아직 따뜻해요.`).

CUP DESIGN = the room's cup. `common.tea_cup()` is the canonical 다실 vessel
(white/celadon body, faint celadon glaze, rim sheen, small foot, narrow saucer).
That builder is authored at ROOM scale (~11px) with diagonal outlines and a tiny
ellipse saucer, so a brute 5–6× NEAREST upscale staircases into a crude mug
(verified: the rim slabs, the celadon dither blows into giant blocks, the saucer
reads as a bar). So this close-up reproduces the builder's EXACT design — same
ramps (`white`/`hanji` body, `green` celadon, `stone` saucer), same proportions
(tapered bowl, rim ellipse, narrow foot + saucer), same OUTLINE — drawn natively
at close-up size so every edge stays a clean 1px pixel-art line. It is the same
cup, enlarged the right way; the room renders the small builder, this renders the
identical design large. A tiny native `tea_cup()` swatch is stamped bottom-left
as the literal cross-reference anchor (so QA can eyeball "same vessel").

Steam = ONE coherent rising wisp: a 2–3px dithered serpentine column (a fixed
sway table, no random), warm-white at the lip cooling to hanji/rain-light as it
rises and thins — never the loose specks the level-1 PENDIENTES warns about.

Run from repo root:  python tools/escape-room-level02/gen_obj-second-cup.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, dither

W = H = 128

# ── geometry of the enlarged cup (the same design as common.tea_cup, native) ──
CX = 64                    # frame centre x — the cup is centred horizontally
RIM_Y = 50                 # top of the cup mouth
RIM_HW = 27                # rim half-width (mouth radius)
WALL_H = 40                # height of the tapered bowl wall
FOOT_HW = 13               # half-width of the cup foot (base, narrower → "cup")
SAUCER_HW = 32             # half-width of the saucer (wider than foot, < rim*1.4)
SAUCER_Y = RIM_Y + WALL_H + 6


def _cup(d) -> None:
    """The 다실 cup, enlarged: tapered white/celadon bowl + sheen + foot + saucer.

    Faithful to common.tea_cup's design: rim ellipse, tapered wall, faint celadon
    glaze on the shaded side (green ramp, fine dither), warm rim sheen, a small
    foot, and a narrow saucer (narrower spread than a plate so it still reads as a
    teacup). All edges native 1px — no upscale staircase.
    """
    body, hi, sh = PAL["white"][0], PAL["hanji"][0], PAL["white"][2]
    rim_lo = PAL["white"][1]
    cel = PAL["green"][0]
    saucer = PAL["hanji"][1]
    foot_y = RIM_Y + WALL_H

    # ── narrow saucer first (behind the cup foot): a thin shallow dish ──
    C.drop_shadow(d, CX - SAUCER_HW + 2, SAUCER_Y + 4, SAUCER_HW * 2 - 4, 3,
                  cool=True)
    d.ellipse([CX - SAUCER_HW, SAUCER_Y - 2, CX + SAUCER_HW, SAUCER_Y + 6],
              fill=saucer, outline=OUTLINE)
    # a gentle celadon-ish well ring + a soft shaded right rim (not metallic):
    # keep the shading low-contrast so the dish reads as pale porcelain, not steel.
    dither(d, CX + 6, SAUCER_Y + 1, SAUCER_HW - 10, 4, PAL["hanji"][2], phase=0)
    d.ellipse([CX - SAUCER_HW + 7, SAUCER_Y, CX + SAUCER_HW - 7, SAUCER_Y + 4],
              outline=PAL["hanji"][3])
    # a faint top sheen, short and centred (not a full bar streak)
    hline(d, CX - 10, SAUCER_Y - 2, 20, PAL["hanji"][0])

    # ── cup body: a bowl tapering from the wide rim down to the narrow foot ──
    # walls as a filled trapezoid, then the curved rim + foot on top.
    d.polygon([(CX - RIM_HW + 2, RIM_Y + 2), (CX + RIM_HW - 2, RIM_Y + 2),
               (CX + FOOT_HW, foot_y), (CX - FOOT_HW, foot_y)],
              fill=body)
    # left/right tapered outlines (clean 1px diagonals)
    d.line([CX - RIM_HW + 2, RIM_Y + 2, CX - FOOT_HW, foot_y], fill=OUTLINE)
    d.line([CX + RIM_HW - 2, RIM_Y + 2, CX + FOOT_HW, foot_y], fill=OUTLINE)

    # faint celadon glaze pooling on the SHADED (right) lower belly — fine dither
    # kept strictly inside the wall so it never bleeds (L1 "dither outside shape").
    # two greens (light + mid) so the celadon hue actually reads as celadon.
    for yy in range(RIM_Y + 13, foot_y - 3):
        t = (yy - (RIM_Y + 2)) / WALL_H
        half = int(RIM_HW - (RIM_HW - FOOT_HW) * t) - 3
        for xx in range(CX + 2, CX + half, 2):
            if (xx + yy) % 2 == 0:
                # deeper green lower-right where the glaze pools, lighter higher
                gx = PAL["green"][1] if (yy > foot_y - 16 and xx > CX + half - 8) \
                    else cel
                d.point((xx, yy), fill=gx)
    # a soft vertical core shadow on the right belly for roundness
    for yy in range(RIM_Y + 8, foot_y - 2):
        t = (yy - (RIM_Y + 2)) / WALL_H
        half = int(RIM_HW - (RIM_HW - FOOT_HW) * t)
        dither(d, CX + half - 8, yy, 6, 1, sh, phase=yy % 2)

    # ── the rim: a white ellipse (the mouth), with a warm sheen along the top ──
    d.ellipse([CX - RIM_HW, RIM_Y - 5, CX + RIM_HW, RIM_Y + 5],
              fill=body, outline=OUTLINE)
    # inner mouth shadow (we look slightly down into the cup → a darker well)
    d.ellipse([CX - RIM_HW + 5, RIM_Y - 2, CX + RIM_HW - 5, RIM_Y + 4],
              fill=PAL["hanji"][2], outline=PAL["wood_dark"][1])
    # the tea inside: a warm disc catching the ember light (this sells "served")
    d.ellipse([CX - RIM_HW + 9, RIM_Y - 1, CX + RIM_HW - 9, RIM_Y + 3],
              fill=PAL["ember"][1], outline=PAL["ember"][2])
    dither(d, CX - 4, RIM_Y, 12, 2, PAL["gold_light"][1], phase=0)  # surface sheen
    # bright rim sheen on the lit (upper-left) lip — short, on the ellipse top
    # edge only (no stray arc nub poking above the rim, round-4 fix).
    for k in range(7):
        sx = CX - RIM_HW + 4 + k
        d.point((sx, RIM_Y - 5 + (k // 3)), fill=PAL["white"][0])
    d.point((CX - RIM_HW + 3, RIM_Y - 3), fill=hi)

    # ── small foot ring at the base (narrow → unmistakably a cup, not a bowl) ──
    fill(d, CX - FOOT_HW, foot_y - 1, FOOT_HW * 2, 3, rim_lo)
    d.ellipse([CX - FOOT_HW, foot_y, CX + FOOT_HW, foot_y + 5],
              fill=PAL["white"][1], outline=OUTLINE)
    dither(d, CX + 1, foot_y + 1, FOOT_HW - 2, 3, sh, phase=0)
    hline(d, CX - FOOT_HW + 2, foot_y, FOOT_HW * 2 - 4, PAL["white"][0])

    # left-edge body highlight (the lit side), a clean 1px sheen down the wall
    d.line([CX - RIM_HW + 4, RIM_Y + 3, CX - FOOT_HW + 2, foot_y - 1],
           fill=PAL["white"][0])


def _warm_wash(d) -> None:
    """A whisper of ember warmth, kept STRICTLY inside the cup silhouette.

    A WHISPER only — the body must stay white/celadon (the spec). So this is a
    thin, sparse warm-neutral band of just a few rows right under the rim, where
    the hot tea would heat the porcelain. Uses gold_light (warm cream), not
    saturated ember, and a coarse 1-in-4 dither so it never turns the cup orange
    (round-3 overcorrection). Clamped strictly inside the tapering wall.
    """
    for yy in range(RIM_Y + 7, RIM_Y + 11):
        t = (yy - (RIM_Y + 2)) / WALL_H
        half = int(RIM_HW - (RIM_HW - FOOT_HW) * t) - 5
        col = PAL["gold_light"][2] if yy < RIM_Y + 9 else PAL["gold_light"][1]
        for xx in range(CX - half, CX + half):
            # 1-in-4 sparse band hugging just under the rim — a warm whisper, not
            # a vertical drip-streak (round-4 fix). Skip the lit core column.
            if (xx + yy) % 2 == 0 and (xx + 2 * yy) % 4 == 0 and abs(xx - CX) > 3:
                d.point((xx, yy), fill=col)


def _steam(d, cx: int, top_y: int, bot_y: int) -> None:
    """ONE rising steam wisp: a 2–3px dithered serpentine column that curls.

    A continuous ribbon driven by a fixed sway table (NO random), so it reads as
    a single coherent wisp of heat — never scattered motes (the L1
    "steam-as-specks" failure). Warm-white near the lip, cooling to hanji then
    rain-light as it rises; 3px wide at the base, tapering to 2px then 1px so it
    dissolves into air rather than stopping flat.
    """
    sway = (0, 0, -1, -1, -1, 0, 0, 1, 1, 1, 1, 0, 0, -1, -1, 0)
    h = bot_y - top_y
    for i in range(h):
        yy = bot_y - i
        t = i / max(h - 1, 1)
        xx = cx + sway[i % len(sway)]
        if t < 0.30:
            core, edge = PAL["white"][0], PAL["white"][1]
        elif t < 0.62:
            core, edge = PAL["white"][1], PAL["hanji"][1]
        else:
            core, edge = PAL["hanji"][1], PAL["rain"][0]
        width = 3 if t < 0.32 else (2 if t < 0.70 else 1)
        d.point((xx, yy), fill=core)
        if width >= 2:
            d.point((xx + (1 if i % 2 else -1), yy), fill=edge)
        if width >= 3:
            d.point((xx - 1, yy), fill=edge)
    # the wisp emerges DENSE from the mouth (a small pooled base) so it clearly
    # rises FROM the tea, not floating above it.
    for dx in (-1, 0, 1):
        d.point((cx + dx, bot_y + 1), fill=PAL["white"][0])
    d.point((cx, bot_y + 2), fill=PAL["white"][1])
    # a soft curl dissolving at the very tip
    tip_ox = sway[(h - 1) % len(sway)]
    d.point((cx + tip_ox + 1, top_y - 1), fill=PAL["rain"][0])


def _reference_swatch(d) -> None:
    """Stamp the canonical common.tea_cup() at native 1× in the lower-left.

    The literal cross-asset anchor: this is the EXACT vessel the 다실 renders, so
    the enlarged cup above is provably the same design (rule 2 — compose with the
    shared builder). Tiny, in the corner, reading as a faint reference token.
    """
    C.tea_cup(d, 6, 108, steam=False)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _cup(d)                # the enlarged 다실 cup, native crisp edges
    _warm_wash(d)          # warm ember tint ON the upper belly (after the body)
    _reference_swatch(d)   # the canonical builder cup, 1×, as the anchor token
    _steam(d, CX, top_y=12, bot_y=RIM_Y - 6)   # the rising "still warm" wisp

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-second-cup.png")
    C.preview(img, "preview_obj-second-cup.png", scale=3)
    # an 8× zoom of the steam column so the wisp's width/curl can be eyeballed
    crop = img.crop((CX - 20, 8, CX + 20, RIM_Y + 4))
    crop = crop.resize((crop.width * 6, crop.height * 6), Image.NEAREST)
    C.save_out(crop, "zoom_obj-second-cup_steam_6x.png")


if __name__ == "__main__":
    main()
