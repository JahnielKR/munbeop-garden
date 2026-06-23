#!/usr/bin/env python3
"""obj-tteokbokki.png (128x128, TRANSPARENT) — close-up of 하나's 떡볶이 pot.

Dossier §6 Zona 2 + §"Close-ups": `objects/obj-tteokbokki.png` — "la olla de
떡볶이 borboteando" (the bubbling pot of 떡볶이). UI text on inspect: `매워 보여요.`
("it looks spicy."). This is the cosmetic close-up the player opens from the
tteokbokki hotspot in room-02-meokja.

Spec: a centered hero shot of a steel pot of 떡볶이 bubbling — the tteok ramp
(the saturated red sauce, the level's hottest red after the griddle) + steam
(warm/cool wisps rising). Transparent background (it's a close-up, not a scene),
so the pot floats on the UI card with a soft warm contact shadow only.

Art bible: tools/escape-room-level03/STYLE.md.
- Colors ONLY from common.PAL (+ OUTLINE, SHADOW_WARM/COOL, the 2 derived tones).
- Outline = OUTLINE (#2a1c14), never #000000.
- No soft alpha: blending via dither()/bands only.
- Steam = continuous 1px curling wisps (common.steam), never loose specks.
- L3-a: no legible Korean in the art (the 매워 보여요 lives in the UI, not here).
- L3-e: 100% mundane — a hot pot, no mystic glow; the only glow is the bare
  griddle-bulb warmth catching the steel rim + the sauce sheen.

The bunsik_bar() builder (STYLE table consumer "obj-tteokbokki") packs three
foods (떡볶이 + 어묵 + 김밥) into a 70x26 bar at scene scale — too small and too
crowded to be a 128px hero of the POT ALONE. So this close-up composes a larger,
isolated 떡볶이 pot from the SAME palette + helpers (tteok ramp for the sauce,
white ramp for the rice cakes poking through, common.steam for the wisps,
metal ramp for the pot, dither/glow for the sheen) — matching the bar's pot
styling at a readable close-up scale. No common.py edits (it is FROZEN).

Deterministic: no unseeded random. Re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_obj-tteokbokki.py
"""

from __future__ import annotations

import random

import common as C
from common import PAL, OUTLINE, SHADOW_WARM, fill, frame, hline, vline, dither

W, H = 128, 128

# Pot geometry (the steel saucepan, seen slightly from above so the sauce shows).
CX = 64                 # horizontal centre
RIM_Y = 44              # top of the pot rim ellipse
POT_W = 92              # pot outer width
POT_H = 52              # pot body height below the rim
RIM_H = 22              # vertical thickness of the elliptical rim (perspective)
LX = CX - POT_W // 2    # pot left edge
RX = CX + POT_W // 2    # pot right edge


# ── The steel pot body ───────────────────────────────────────────────────────

def paint_pot_body(d) -> None:
    """The steel saucepan: a tapering cylindrical body under an elliptical rim."""
    body, body_hi, body_sh, body_dk = (PAL["metal"][2], PAL["metal"][1],
                                       PAL["metal"][3], PAL["metal"][3])
    base_y = RIM_Y + POT_H
    # warm contact shadow: a tight low ellipse hugging the base (close-up on a UI
    # card — a compact warm pool, NOT a wide dither slab that bleeds off-canvas).
    taper0 = 6
    sh = SHADOW_WARM[:3] + (255,)
    d.ellipse([LX + taper0, base_y - 2, RX - taper0, base_y + 4], fill=sh)
    # a soft dithered fade only on the UNDERSIDE of that ellipse (no side specks)
    dither(d, LX + taper0 + 4, base_y + 3, POT_W - 2 * taper0 - 8, 2, sh, phase=1)
    # the pot body: a slightly tapering tub (a touch narrower at the base)
    taper = 6
    d.polygon([(LX, RIM_Y + RIM_H // 2), (RX, RIM_Y + RIM_H // 2),
               (RX - taper, base_y), (LX + taper, base_y)],
              fill=body, outline=OUTLINE)
    # vertical sheen banding on the steel (lit left, shaded right) — no alpha.
    # Clamp the shade dither to the body so it never spills below the base.
    body_top = RIM_Y + RIM_H // 2
    body_inner_top = RIM_Y + RIM_H
    sh_h = (base_y - 5) - body_inner_top              # stop above the base band
    vline(d, LX + 4, body_top, POT_H - 2, body_hi)
    vline(d, LX + 6, body_top, POT_H - 2, body_hi)
    # the shaded right cheek: two stacked bands, the inner one narrower, so the
    # steel reads as a curved cylinder rather than a flat gray patch.
    dither(d, RX - 20, body_inner_top, 14, sh_h, body_sh, phase=0)
    dither(d, RX - 12, body_inner_top + 1, 8, sh_h - 2, PAL["ink"][1], phase=1)
    vline(d, RX - 6, body_top, POT_H - 2, body_dk)
    # a darker base shadow band where the pot meets the griddle
    fill(d, LX + taper, base_y - 5, POT_W - 2 * taper, 4, PAL["metal"][3])
    dither(d, LX + taper, base_y - 5, POT_W - 2 * taper, 4, PAL["ink"][1], phase=1)
    hline(d, LX + taper, base_y - 1, POT_W - 2 * taper, OUTLINE)
    # two welded side handles (the tab ears of a 분식 saucepan)
    for hx, sgn in ((LX + 2, -1), (RX - 2, +1)):
        ex = hx + sgn * 9
        fill(d, min(hx, ex), RIM_Y + RIM_H + 6, 9, 6, PAL["metal"][3])
        frame(d, min(hx, ex), RIM_Y + RIM_H + 6, 9, 6, OUTLINE)
        hline(d, min(hx, ex), RIM_Y + RIM_H + 6, 9, PAL["metal"][1])


def paint_rim(d) -> None:
    """The rolled steel rim ellipse — the lip the player sees the sauce inside of."""
    # outer rim ellipse (the rolled lip)
    d.ellipse([LX, RIM_Y, RX, RIM_Y + RIM_H], fill=PAL["metal"][2], outline=OUTLINE)
    # a lit highlight along the upper-left of the lip, shade lower-right
    d.arc([LX, RIM_Y, RX, RIM_Y + RIM_H], 150, 300, fill=PAL["metal"][0])
    d.arc([LX + 1, RIM_Y + 1, RX - 1, RIM_Y + RIM_H - 1], 150, 300, fill=PAL["metal"][1])
    d.arc([LX, RIM_Y, RX, RIM_Y + RIM_H], 330, 120, fill=PAL["metal"][3])
    # the inner opening (where the sauce sits) — a smaller ellipse, dark steel wall
    iw = 10                                          # inner inset from the lip
    d.ellipse([LX + iw, RIM_Y + 5, RX - iw, RIM_Y + RIM_H - 2],
              fill=PAL["ink"][2], outline=OUTLINE)


# ── The 떡볶이 itself: the bubbling red sauce + rice cakes ───────────────────

INNER = None  # filled by paint_sauce(): (l, t, r, b) of the sauce ellipse bbox


def paint_sauce(d) -> None:
    """The pool of saturated red 떡볶이 sauce, bubbling and glossy (tteok ramp)."""
    global INNER
    iw = 12
    l, t, r, b = LX + iw, RIM_Y + 7, RX - iw, RIM_Y + RIM_H - 2
    INNER = (l, t, r, b)
    sauce, sauce_hi, sauce_dk = PAL["tteok"][1], PAL["tteok"][0], PAL["tteok"][2]
    # the body of sauce filling the inner opening
    d.ellipse([l, t, r, b], fill=sauce, outline=PAL["tteok"][3])
    # deep darker sauce toward the far (top) edge, glossy bright near the front
    dither(d, l + 2, t + 1, r - l - 4, (b - t) // 2, sauce_dk, phase=1)
    dither(d, l + 4, b - (b - t) // 2, r - l - 8, (b - t) // 2 - 1, sauce_hi, phase=0)
    # a hot glossy sheen catching the bulb on the near-left of the sauce
    d.ellipse([l + 6, b - 8, l + 18, b - 3], fill=sauce_hi)
    d.point((l + 10, b - 6), fill=PAL["gold_light"][0])   # tiny specular glint


def paint_bubbles(d) -> None:
    """Sauce bubbles surfacing — the 'borboteando'. Deterministic scatter."""
    l, t, r, b = INNER
    rng = random.Random(206)                          # fixed seed = determinism
    hi, mid, dk = PAL["tteok"][0], PAL["tteok"][1], PAL["tteok"][2]
    cx, cy = (l + r) / 2, (t + b) / 2
    rxs, rys = (r - l) / 2 - 4, (b - t) / 2 - 2
    for _ in range(22):
        # sample inside the sauce ellipse (reject points outside it)
        ang = rng.uniform(0, 6.2832)
        rad = rng.uniform(0.15, 0.95)
        bx = int(cx + rad * rxs * __import__("math").cos(ang))
        by = int(cy + rad * rys * __import__("math").sin(ang) * 0.9)
        sz = rng.choice((1, 1, 2))
        # bubble: a dark rim ring + a bright crest (a rising blister of sauce)
        d.ellipse([bx - sz, by - sz, bx + sz, by + sz], outline=dk)
        d.point((bx, by - 1), fill=hi)
        if sz == 2:
            d.point((bx, by), fill=mid)


def paint_tteok(d) -> None:
    """The cylindrical rice cakes (가래떡) poking up through the sauce — the read.

    White cylinders standing in the sauce, sauce-glazed on the near face, the
    unmistakable 떡볶이 silhouette. Placed front-of-pool so they read clearly.
    """
    l, t, r, b = INNER
    white, white_hi, white_sh = PAL["white"][0], PAL["white"][1], PAL["white"][2]
    # a staggered cluster of standing rice-cake cylinders (front rows lower)
    cakes = [
        (l + 14, b - 4, 7, 12),
        (l + 26, b - 1, 8, 14),
        (l + 40, b - 3, 7, 13),
        (l + 53, b + 0, 8, 14),
        (l + 21, t + 8, 6, 9),    # a couple deeper in (smaller, shaded)
        (l + 47, t + 9, 6, 9),
    ]
    # sort back-to-front so nearer cakes overlap farther ones cleanly
    for (tx, ty, cw, ch) in sorted(cakes, key=lambda c: c[1]):
        _rice_cake(d, tx, ty, cw, ch, white, white_hi, white_sh)


def _rice_cake(d, x, y, w, h, white, white_hi, white_sh) -> None:
    """One standing rice-cake cylinder: rounded top, lit left, sauce-glazed near."""
    sauce_gz = PAL["tteok"][0]
    # the cylinder body
    fill(d, x, y - h, w, h, white)
    frame(d, x, y - h, w, h, OUTLINE)
    # rounded top cap
    d.ellipse([x, y - h - 2, x + w, y - h + 3], fill=white_hi, outline=OUTLINE)
    # lit left edge, shaded right
    vline(d, x + 1, y - h, h, white_hi)
    dither(d, x + w - 3, y - h + 2, 3, h - 2, white_sh, phase=0)
    # sauce glaze creeping up the lower near face (the glossy red coat)
    dither(d, x + 1, y - 4, w - 2, 4, sauce_gz, phase=1)
    hline(d, x, y - 1, w, PAL["tteok"][1])
    d.point((x + w // 2, y - h - 1), fill=PAL["white"][0])  # top specular


# ── A folded 어묵 ribbon + a ladle for context (still the POT close-up) ───────

def paint_garnish(d) -> None:
    """One folded 어묵 ribbon on a skewer + a few scallion flecks (market context).

    Keeps the close-up unmistakably a 분식 pot, not a generic red soup, without
    crowding the rice cakes (the spec hero = tteok + steam). Subtle, back-right.
    """
    l, t, r, b = INNER
    # a single folded fishcake ribbon on a bamboo skewer, back-right of the pool
    sx = r - 16
    fish, fish_sh = PAL["wood_light"][1], PAL["wood_dark"][1]
    vline(d, sx, t - 14, 18, PAL["wood_dark"][2])      # skewer stick above the sauce
    vline(d, sx + 1, t - 14, 18, PAL["wood_dark"][3])
    d.polygon([(sx - 4, t - 8), (sx + 3, t - 11), (sx + 2, t - 1), (sx - 4, t + 2)],
              fill=fish, outline=PAL["wood_dark"][2])   # folded ribbon
    dither(d, sx - 3, t - 5, 4, 5, fish_sh, phase=0)
    # scallion / sesame flecks floating on the sauce (tiny green + cream points)
    rng = random.Random(91)
    for _ in range(7):
        gx = rng.randint(l + 6, r - 8)
        gy = rng.randint(t + 4, b - 6)
        d.point((gx, gy), fill=PAL["neon_green"][3])   # dark scallion fleck
        d.point((gx + 1, gy), fill=PAL["white"][1])    # sesame


# ── The amber bulb-warmth + steam (the L3-d warmth, L3 steam discipline) ──────

def paint_warmth(d) -> None:
    """The bulb warming the sauce surface — dithered bands, NOT a glowing orb.

    L3-e: no mystic glow, no light without a source. So instead of a hard amber
    disc, the warmth reads as a hot-glossy SHEEN on the near sauce: thin dithered
    bands of bright tteok/ember scattered across the front of the pool, brightest
    near-centre, dissolving into the red — the way oil sheen catches a bare bulb.
    """
    l, t, r, b = INNER
    cx, cy = (l + r) // 2, (t + b) // 2 + 2
    # bright glossy sheen on the near (front) half of the sauce, dithered into red
    dither(d, cx - 14, cy - 1, 28, 6, PAL["tteok"][0], phase=0)
    dither(d, cx - 9, cy + 2, 18, 4, PAL["ember"][1], phase=1)
    # a few warm specular flecks where the sheen peaks (oil catching the bulb)
    for (fx, fy) in ((cx - 6, cy), (cx + 4, cy + 1), (cx - 1, cy - 2)):
        d.point((fx, fy), fill=PAL["gold_light"][1])


def paint_steam(d) -> None:
    """Three curling steam wisps rising off the pot — warm centre, cooler sides.

    common.steam draws continuous 1px curling columns (no loose specks). Tall so
    the 'borboteando / steaming' read is unmistakable, with mixed warm/cool wisps
    (the warm griddle light vs the white kitchen steam)."""
    l, t, r, b = INNER
    cx = (l + r) // 2
    C.steam(d, cx - 8, t - 2, height=30, phase=0, warm=False)
    C.steam(d, cx + 2, t - 4, height=36, phase=3, warm=True)
    C.steam(d, cx + 12, t - 1, height=26, phase=5, warm=False)
    C.steam(d, cx - 16, t + 1, height=22, phase=2, warm=True)


# ── Compose ──────────────────────────────────────────────────────────────────

def build() -> "C.Image.Image":
    img, d = C.new_canvas(W, H, bg=None)      # transparent close-up
    paint_pot_body(d)
    paint_rim(d)
    paint_sauce(d)
    paint_tteok(d)        # rice cakes first (they sit IN the sauce)
    paint_bubbles(d)      # bubbles around/over the cakes
    paint_garnish(d)
    paint_warmth(d)
    paint_steam(d)        # steam last so it rises over everything
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-tteokbokki.png")
    C.preview(img, "preview_obj-tteokbokki.png", scale=3)


if __name__ == "__main__":
    main()
