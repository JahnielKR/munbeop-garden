#!/usr/bin/env python3
"""obj-eomuk.png (128x128, TRANSPARENT) — close-up of 어묵 on skewers in the broth.

Dossier §6 Zona 2 (line 236 + §10 line 839): `objects/obj-eomuk.png` — "el 어묵 en
el caldo con palillos clavados" (the 어묵 fishcake on skewers stuck into the
broth). UI text on inspect: `국물이 뜨거워요.` ("the broth is hot."). Per L3-a NO
Korean is painted into the art — the 국물이 뜨거워요 lives in the UI card only. This
is the cosmetic close-up the player opens from the eomuk hotspot in
room-02-meokja.

Spec: a centered hero shot of a steel/enamel broth pot with three folded 어묵
ribbons standing up on bamboo skewers (the palillos clavados), the clear-amber
국물 (anchovy broth) steaming. Transparent background (it's a close-up, not a
scene), so the pot floats on the UI card with a soft warm contact shadow only.

Art bible: tools/escape-room-level03/STYLE.md.
- Colors ONLY from common.PAL (+ OUTLINE, SHADOW_WARM/COOL, the 2 derived tones).
- Outline = OUTLINE (#2a1c14), never #000000.
- No soft alpha: blending via dither()/bands only.
- Steam = continuous 1px curling wisps (common.steam), never loose specks.
- L3-a: no legible Korean in the art (the 국물이 뜨거워요 lives in the UI, not here).
- L3-e: 100% mundane — a hot broth pot, no mystic glow; the only warmth is the
  bare griddle-bulb catching the steel rim + the broth sheen.

The bunsik_bar() builder (STYLE table consumer "obj-eomuk") packs three foods
(떡볶이 + 어묵 + 김밥) into a 70x26 bar at scene scale — its 어묵 broth pot is only
18px wide, too small + too crowded to be a 128px hero of the 어묵 ALONE. So this
close-up composes a larger, isolated 어묵-in-broth from the SAME palette + helpers
(wood_light/metal for the pot, wood_light ribbons folded on wood_dark skewers,
common.steam for the cool broth wisps, gold_light/ember for the bulb sheen on the
clear broth) — matching the bar's 어묵 styling at a readable close-up scale. No
common.py edits (it is FROZEN).

Deterministic: no unseeded random. Re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_obj-eomuk.py
"""

from __future__ import annotations

import random

import common as C
from common import PAL, OUTLINE, SHADOW_WARM, fill, frame, hline, vline, dither

W, H = 128, 128

# Pot geometry (a wide enamel broth pot, seen slightly from above so the broth
# surface shows and the skewers stand up out of it toward the viewer).
CX = 64                 # horizontal centre
RIM_Y = 54              # top of the pot rim ellipse (broth surface sits here)
POT_W = 96              # pot outer width
POT_H = 46              # pot body height below the rim
RIM_H = 24              # vertical thickness of the elliptical rim (perspective)
LX = CX - POT_W // 2    # pot left edge
RX = CX + POT_W // 2    # pot right edge

# the broth-surface ellipse (filled by paint_broth, read by skewers/garnish)
INNER = None            # (l, t, r, b) of the inner broth ellipse bbox


# ── The enamel/steel pot body ─────────────────────────────────────────────────

def paint_pot_body(d) -> None:
    """The wide broth pot: a tapering body under an elliptical rim (metal ramp).

    Mirrors bunsik_bar's 어묵 broth pot (wood_light fill rim) but rendered as a
    cold steel/enamel cauldron at close-up scale so it reads as the deep 국물 pot
    of a 분식 stall, not a saucepan."""
    body, body_hi, body_sh = PAL["metal"][2], PAL["metal"][1], PAL["metal"][3]
    base_y = RIM_Y + POT_H
    # warm contact shadow: a tight low ellipse hugging the base (close-up on a UI
    # card — a compact warm pool, NOT a wide dither slab that bleeds off-canvas).
    taper0 = 8
    sh = SHADOW_WARM[:3] + (255,)
    d.ellipse([LX + taper0, base_y - 2, RX - taper0, base_y + 4], fill=sh)
    dither(d, LX + taper0 + 4, base_y + 3, POT_W - 2 * taper0 - 8, 2, sh, phase=1)
    # the pot body: a slightly tapering tub (a touch narrower at the base)
    taper = 6
    d.polygon([(LX, RIM_Y + RIM_H // 2), (RX, RIM_Y + RIM_H // 2),
               (RX - taper, base_y), (LX + taper, base_y)],
              fill=body, outline=OUTLINE)
    body_top = RIM_Y + RIM_H // 2
    body_inner_top = RIM_Y + RIM_H
    sh_h = (base_y - 5) - body_inner_top              # stop above the base band
    # vertical sheen banding on the steel (lit left, shaded right) — no alpha.
    vline(d, LX + 4, body_top, POT_H - 2, body_hi)
    vline(d, LX + 6, body_top, POT_H - 2, body_hi)
    # the shaded right cheek: two stacked bands so the steel reads as a curved
    # cylinder rather than a flat gray patch.
    dither(d, RX - 22, body_inner_top, 15, sh_h, body_sh, phase=0)
    dither(d, RX - 13, body_inner_top + 1, 8, sh_h - 2, PAL["ink"][1], phase=1)
    vline(d, RX - 6, body_top, POT_H - 2, body_sh)
    # a darker base shadow band where the pot meets the bar surface
    fill(d, LX + taper, base_y - 5, POT_W - 2 * taper, 4, PAL["metal"][3])
    dither(d, LX + taper, base_y - 5, POT_W - 2 * taper, 4, PAL["ink"][1], phase=1)
    hline(d, LX + taper, base_y - 1, POT_W - 2 * taper, OUTLINE)
    # two welded side handles (the tab ears of a 분식 broth pot)
    for hx, sgn in ((LX + 2, -1), (RX - 2, +1)):
        ex = hx + sgn * 10
        fill(d, min(hx, ex), RIM_Y + RIM_H + 7, 10, 6, PAL["metal"][3])
        frame(d, min(hx, ex), RIM_Y + RIM_H + 7, 10, 6, OUTLINE)
        hline(d, min(hx, ex), RIM_Y + RIM_H + 7, 10, PAL["metal"][1])


def paint_rim(d) -> None:
    """The rolled steel rim ellipse — the lip the player sees the broth inside of."""
    d.ellipse([LX, RIM_Y, RX, RIM_Y + RIM_H], fill=PAL["metal"][2], outline=OUTLINE)
    # a lit highlight along the upper-left of the lip, shade lower-right
    d.arc([LX, RIM_Y, RX, RIM_Y + RIM_H], 150, 300, fill=PAL["metal"][0])
    d.arc([LX + 1, RIM_Y + 1, RX - 1, RIM_Y + RIM_H - 1], 150, 300, fill=PAL["metal"][1])
    d.arc([LX, RIM_Y, RX, RIM_Y + RIM_H], 330, 120, fill=PAL["metal"][3])


# ── The 국물 (clear anchovy broth) ────────────────────────────────────────────

def paint_broth(d) -> None:
    """The pool of clear-amber 국물, gently steaming and catching the bulb.

    The broth is warm-translucent (wood_light/ember tints over a darker steel
    floor) — NOT the saturated red of the 떡볶이 pot. The bulb sheen catches the
    near-front of the surface (the warm hint, L3-d)."""
    global INNER
    iw = 9
    l, t, r, b = LX + iw, RIM_Y + 6, RX - iw, RIM_Y + RIM_H - 2
    INNER = (l, t, r, b)
    # the dark steel inner wall behind/under the broth (depth)
    d.ellipse([l - 2, t - 1, r + 2, b + 1], fill=PAL["ink"][2], outline=OUTLINE)
    # the broth body: a warm translucent amber pool
    broth, broth_dk, broth_hi = PAL["wood_light"][1], PAL["wood_dark"][1], PAL["wood_light"][0]
    d.ellipse([l, t, r, b], fill=broth, outline=PAL["wood_dark"][2])
    # deep darker broth toward the far (top) edge, brighter glossy near the front
    dither(d, l + 3, t + 1, r - l - 6, (b - t) // 2, broth_dk, phase=1)
    dither(d, l + 5, b - (b - t) // 2, r - l - 10, (b - t) // 2 - 1, broth_hi, phase=0)
    # the bulb sheen on the near-left surface (the warm hint catching the broth)
    d.ellipse([l + 8, b - 7, l + 22, b - 3], fill=PAL["gold_light"][1])
    dither(d, l + 9, b - 6, 12, 3, PAL["ember"][1], phase=1)
    d.point((l + 14, b - 5), fill=PAL["gold_light"][0])   # tiny specular glint
    # a couple of dried anchovies / scallion flecks drifting (it's anchovy broth)
    rng = random.Random(414)
    for _ in range(9):
        gx = rng.randint(l + 8, r - 10)
        gy = rng.randint(t + 5, b - 5)
        if rng.random() > 0.5:
            d.point((gx, gy), fill=PAL["neon_green"][3])   # dark scallion fleck
        else:
            d.point((gx, gy), fill=PAL["wood_dark"][2])    # anchovy speck


# ── The 어묵 ribbons on skewers (the "palillos clavados" — the read) ───────────

def paint_eomuk(d) -> None:
    """The 어묵 fishcake sheets standing up on bamboo skewers in the broth.

    Each is a wide thin fishcake SHEET threaded in a wavy zig-zag onto a bamboo
    skewer that stands straight up out of the broth (the 'palillos clavados').
    THREE skewers, well separated across the pot with clear broth between them so
    the 'en el caldo' read survives. Sorted back-to-front so nearer ones overlap
    cleanly. This is THE recognizable 어묵 silhouette — the spec hero."""
    l, t, r, b = INNER
    surf_y = (t + b) // 2 + 1          # where the skewers pierce the broth surface
    # three skewers, well-spaced; the middle one is taller + nearer the viewer.
    # (skewer x, surface pierce y, sheet height above broth, lateral lean)
    sticks = [
        (CX - 27, surf_y - 1, 34, +2),
        (CX,      surf_y + 3, 42, 0),     # middle: tallest, nearest the viewer
        (CX + 27, surf_y - 2, 30, -2),
    ]
    # sort by surface y so the front (lower) skewers paint over the back ones
    for (sx, sy, rh, tilt) in sorted(sticks, key=lambda s: s[1]):
        _skewer(d, sx, sy, rh, tilt)


def _skewer(d, sx: int, sy: int, sheet_h: int, tilt: int) -> None:
    """One bamboo skewer standing up from the broth with a wavy fishcake sheet.

    sx = skewer x at the broth surface; sy = the surface (pierce) y; sheet_h =
    how tall the fishcake rises above the broth; tilt = a small lateral lean so
    the three skewers don't read as a rigid comb. The fishcake is ONE continuous
    gathered ribbon hugging the skewer the whole height — a solid wavy band whose
    left/right edges wobble fold-to-fold (the accordion), warm off-white with a
    broth-glazed base — with the bare bamboo tip poking out the top (the read)."""
    bamboo, bamboo_hi, bamboo_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    fish, fish_hi, fish_sh = PAL["wood_light"][0], PAL["white"][0], PAL["wood_light"][2]
    top_y = sy - sheet_h

    def stick_x(yy):                                   # the skewer's x at height yy
        return sx + (tilt * (sy - yy)) // max(sheet_h, 1)

    # 1) the bamboo skewer FIRST: a 2px stick from below the broth up past the
    #    cake, poking out the top (the bare skewer tip = the 'clavado' read).
    for yy in range(top_y - 6, sy + 5):
        xx = stick_x(yy)
        d.point((xx, yy), fill=bamboo)
        d.point((xx + 1, yy), fill=bamboo_sh)
    d.point((stick_x(top_y - 6), top_y - 6), fill=PAL["gold_light"][1])   # lit blunt tip

    # 2) the fishcake as ONE continuous gathered ribbon: for every scan row from
    #    the top of the sheet to the broth, lay a horizontal slab from the left
    #    fold edge to the right fold edge. The two edges follow slow opposite
    #    sine wobbles so the ribbon's silhouette ripples (the accordion folds)
    #    while the body stays solid and attached to the skewer (no flag gaps).
    fold = (0, 1, 2, 3, 3, 2, 1, 0, -1, -2, -3, -3, -2, -1)   # a smooth wobble
    base_w = 6                                          # half-width at the spine
    sheet_rows = sheet_h - 2
    for i in range(sheet_rows):
        yy = top_y + 4 + i
        if yy > sy + 1:
            break
        cx = stick_x(yy)
        # left & right edges wobble in opposition -> a rippling gathered ribbon
        lw = base_w + 2 + fold[i % len(fold)]
        rw = base_w + 2 + fold[(i + 7) % len(fold)]
        lx, rx2 = cx - lw, cx + rw
        # body slab of this row (warm off-white fishcake)
        d.line([(lx, yy), (rx2, yy)], fill=fish)
        # lit near edge (left, toward the bulb) + shaded far edge (right)
        d.point((lx, yy), fill=fish_hi)
        d.point((lx + 1, yy), fill=fish_hi)
        d.point((rx2, yy), fill=fish_sh)
        d.point((rx2 - 1, yy), fill=fish_sh)
        # every few rows, a crease line across the fold + a browned griddle tint
        if i % 4 == 1:
            d.line([(lx + 1, yy), (rx2 - 1, yy)], fill=fish_sh)   # fold shadow
        if i % 4 == 3:
            d.point((cx + 2, yy), fill=PAL["ember"][2])          # warm griddled fleck
        # the gathered pleat right at the skewer (a dark pinch = it's threaded on)
        d.point((cx, yy), fill=PAL["wood_dark"][2])
    # a crisp broth meniscus where the ribbon enters the 국물 (the waterline) + a
    # short warm wet glaze just above it — so it reads as standing IN the broth,
    # not smeared into it. The meniscus is a thin bright lip hugging the base.
    glz_y = sy - 3
    dither(d, sx - base_w - 1, glz_y - 2, 2 * base_w + 2, 3, PAL["ember"][2], phase=0)
    hline(d, sx - base_w, sy, 2 * base_w, PAL["gold_light"][1])     # bright waterline
    d.point((sx - 1, sy), fill=PAL["white"][0])                     # specular on the meniscus

    # 3) re-stroke the bare skewer tip OVER the top of the ribbon so it pokes out
    for yy in range(top_y - 6, top_y + 5):
        xx = stick_x(yy)
        d.point((xx, yy), fill=bamboo)
        d.point((xx + 1, yy), fill=bamboo_sh)
    d.point((stick_x(top_y - 6), top_y - 6), fill=bamboo_hi)


# ── The warm bulb-hint + steam (the L3-d warmth, L3 steam discipline) ──────────

def paint_steam(d) -> None:
    """Curling steam wisps rising off the hot broth — cool/white over the broth,
    one warm wisp where the bulb catches it.

    common.steam draws continuous 1px curling columns (no loose specks). Tall so
    the 'hot broth / 뜨거워요' read is unmistakable, mostly cool (white kitchen
    steam over broth) with one warm wisp tinted by the bulb."""
    l, t, r, b = INNER
    cx = (l + r) // 2
    C.steam(d, cx - 18, t + 1, height=26, phase=2, warm=False)
    C.steam(d, cx - 4, t - 3, height=34, phase=0, warm=False)
    C.steam(d, cx + 9, t - 1, height=28, phase=4, warm=True)
    C.steam(d, cx + 22, t + 2, height=22, phase=5, warm=False)


# ── Compose ──────────────────────────────────────────────────────────────────

def build() -> "C.Image.Image":
    img, d = C.new_canvas(W, H, bg=None)      # transparent close-up
    paint_pot_body(d)
    paint_rim(d)
    paint_broth(d)
    paint_eomuk(d)        # the skewered fishcake ribbons standing in the broth
    paint_steam(d)        # steam last so it rises over everything
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-eomuk.png")
    C.preview(img, "preview_obj-eomuk.png", scale=3)


if __name__ == "__main__":
    main()
