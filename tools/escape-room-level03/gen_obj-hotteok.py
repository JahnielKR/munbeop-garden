#!/usr/bin/env python3
"""obj-hotteok.png — close-up of the 호떡 on the griddle, the sugar bubbling.

Dossier §6 Zona 1 (line 219) + §10 asset list (line 836): the close-up of the
철판 detail — «el azúcar derretido burbujeando». The UI card carries the Korean
(`설탕이 녹아요. 조심하세요.`); per L3-a NO Korean is painted into the art. This is
a scaled-UP detail of common.griddle_hotteok's hero: ONE big browning 호떡 with a
molten-sugar centre boiling over, sitting on a slice of the oiled cast-iron
plate, warm steam curling off it. The KEY-LIGHT vocabulary of L3-d at close
range: ink plate, ember/AMBER_DEEP oil sheen, gold_light body, a white-hot sugar
burst, warm steam (common.steam, never loose specks).

This is a CLOSE-UP, not a room: NO hotspots (no hotspot_debug). 128×128 TRANSP —
the corners are alpha 0; only a low dark griddle slab + the 호떡 + its glow/steam
are opaque, so it floats on the UI card.

Composition (128×128, centred, the eye on the sugar burst):
  PLATE : a slice of the round oiled 철판 across the lower-centre (ink, oil sheen,
          AMBER_DEEP pooled at the rim) — the warm key surface it browns on.
  HERO  : one large 호떡, golden gold_light body, a browned AMBER_DEEP rim, the
          dimpled dough texture; centred a touch above the plate centre.
  SUGAR : the molten-sugar crater bubbling at the centre — concentric ember→gold→
          white-hot rings + a scatter of deterministic bright bubbles + a glossy
          spill running over the rim (the recognizable «설탕이 녹아요» detail).
  STEAM : two/three warm steam columns (common.steam, warm) rising off it.
  GLOW  : an amber glow halo under the plate so the close-up reads as the warmest
          thing on the cold-neon street (L3-d), bled by dither bands not blur.

Shared builders/helpers used: common.steam, common.glow, common.dither, fill,
frame, hline, vline, drop_shadow + the canonical ramps (ink plate, ember/
gold_light dough+oil, AMBER_DEEP rim, white sugar hot-point, OUTLINE). The big
disc + the boiling crater are asset-local detail painted with those primitives
(STYLE rule 2: griddle_hotteok's _hotteok_disc is fixed at r=7; a 128px close-up
needs a hand-scaled hero, kept faithful to its palette + read).

Deterministic: bubble scatter uses random.Random(SEED); re-run -> byte-identical.
Run from repo root:  python tools/escape-room-level03/gen_obj-hotteok.py
"""

from __future__ import annotations

import random

import common as C
from common import (PAL, OUTLINE, AMBER_DEEP, fill, frame, hline, vline, dither,
                    drop_shadow)

W, H = 128, 128
SEED = 17                       # the ONLY entropy source (bubble scatter)

CX = 64                         # frame centre x (the 호떡 + sugar are centred here)
PLATE_CY = 86                   # the cast-iron plate centre y (hero sits a bit above)
HOT_CY = 70                     # the 호떡 disc centre y
HOT_R = 38                      # the 호떡 radius (big hero)


# ── the warm amber glow under the plate (L3-d, by dither bands not blur) ───────

def paint_glow(d):
    """A soft amber halo under the plate so the close-up reads as the warmest
    thing on a cold-neon street (L3-d). Built as concentric dithered bands of the
    gold/ember ramp (STYLE rule 3: glow by bands, never alpha blur). Centred on
    the plate so the warmth pools around the hero, fading to transparent."""
    gcx, gcy = CX, PLATE_CY - 2
    # band radii (outer→inner) and the ramp colour each band lays down. The OUTER
    # bands are sparse-checker-gated so the halo fades to transparent and HUGS the
    # plate (no amber bleeding into the corners); the inner bands sit under the
    # plate. (STYLE rule 3: glow by bands, never alpha blur.)
    bands = ((42, PAL["ember"][3], 4), (34, PAL["ember"][3], 2),
             (27, PAL["ember"][2], 2), (20, PAL["ember"][1], 2))
    for rr, c, gate in bands:
        for y in range(gcy - rr, gcy + rr):
            if y < 0 or y >= H:
                continue
            for x in range(gcx - rr, gcx + rr):
                if x < 0 or x >= W:
                    continue
                dx = (x - gcx) / rr
                dy = (y - gcy) / (rr * 0.62)        # squashed flat (a plate halo)
                if dx * dx + dy * dy > 1.0:
                    continue
                # outer rings: every 4th pixel (a sparse, fading bleed); inner: 2nd
                if ((x * 3 + y) % gate) != 0:
                    continue
                d.point((x, y), fill=c)


# ── the cast-iron 철판 slice (ink plate + oil sheen + AMBER_DEEP rim) ───────────

def paint_plate(d):
    """A slice of the round oiled cast-iron plate across the lower-centre — the
    warm key surface the 호떡 browns on (mirrors griddle_hotteok's plate: ink fill,
    a darker sheen dither, AMBER_DEEP oil pooled hot at the centre, ember on top).
    A low flat ellipse; its bottom runs off the frame so it reads as a big plate
    seen close, not a coin."""
    plate, plate_sh = PAL["ink"][1], PAL["ink"][2]
    px0, px1 = CX - 58, CX + 58
    py0, py1 = PLATE_CY - 18, PLATE_CY + 30
    drop_shadow(d, px0 + 6, py1 - 2, (px1 - px0) - 12, 2)
    # the iron plate body (flat ellipse), warm-black ink with an OUTLINE rim
    d.ellipse([px0, py0, px1, py1], fill=plate, outline=OUTLINE)
    dither(d, px0 + 10, py0 + 6, (px1 - px0) - 20, (py1 - py0) - 10, plate_sh, phase=0)
    # the oil pooled hot + glossy around the hero (AMBER_DEEP edge, ember sheen)
    d.ellipse([CX - 44, PLATE_CY - 12, CX + 44, py1 - 4], fill=AMBER_DEEP)
    d.ellipse([CX - 38, PLATE_CY - 9, CX + 38, py1 - 8], fill=PAL["ember"][2])
    dither(d, CX - 34, PLATE_CY - 6, 68, 14, PAL["ember"][1], phase=1)   # oil shimmer
    # a few bright oil glints catching the bulb (gold dots on the sheen)
    for gx, gy in ((CX - 30, PLATE_CY + 6), (CX + 26, PLATE_CY + 2),
                   (CX - 8, PLATE_CY + 12), (CX + 12, PLATE_CY + 10)):
        d.point((gx, gy), fill=PAL["gold_light"][0])
        d.point((gx + 1, gy), fill=PAL["gold_light"][1])


# ── the hero 호떡 (a big browning disc, dimpled dough, browned rim) ─────────────

def paint_hotteok(d):
    """The one big 호떡: a golden gold_light disc with a browned AMBER_DEEP rim and
    an ember underside, dimpled dough texture — a hand-scaled twin of
    _hotteok_disc (which is fixed at r=7, too small for a 128px hero). The molten
    crater is painted on top by paint_sugar()."""
    body, body_hi = PAL["gold_light"][2], PAL["gold_light"][0]
    rim, under = AMBER_DEEP, PAL["ember"][1]
    cx, cy, r = CX, HOT_CY, HOT_R
    # the dough body (a slightly squashed disc — it sits and spreads on the plate)
    d.ellipse([cx - r, cy - r + 4, cx + r, cy + r - 2], fill=body, outline=OUTLINE)
    # the browned rim (a ring just inside the outline)
    d.ellipse([cx - r + 2, cy - r + 6, cx + r - 2, cy + r - 4], outline=rim)
    d.ellipse([cx - r + 3, cy - r + 7, cx + r - 3, cy + r - 5], outline=rim)
    # the browned, oil-fried underside: a GRADIENT, not a band — ember[2] just
    # below the equator, deepening to AMBER_DEEP at the fried base, each zone
    # dithered into the next so there is no hard 'waterline' seam across the dough.
    dither(d, cx - r + 6, cy + 4, 2 * r - 12, 8, PAL["ember"][2], phase=0)
    dither(d, cx - r + 8, cy + 10, 2 * r - 16, 8, under, phase=1)         # transition
    dither(d, cx - r + 10, cy + 16, 2 * r - 20, r - 18, PAL["ember"][2], phase=0)
    dither(d, cx - r + 12, cy + r - 14, 2 * r - 24, 8, AMBER_DEEP, phase=1)  # fried base
    # a lit top edge (the bulb/plate light hits the dome of dough) — a clean 2px
    # rim band of body highlight following the dome, not a dotted scatter.
    for k in range(-r + 9, r - 9):
        ty = cy - r + 5 + (k * k) // (2 * r)
        d.point((cx + k, ty), fill=body_hi)
        d.point((cx + k, ty + 1), fill=PAL["gold_light"][1])
    # dimpled dough texture: a deterministic scatter of tiny browned pits so the
    # surface reads as fried dough, NOT a flat coin (kept off the central crater).
    rdough = random.Random(SEED * 7 + 3)
    for _ in range(46):
        a = rdough.random() * 6.2832
        rad = 12 + rdough.random() * (r - 16)
        dx = int(rad * (a - 3.14) / 3.14)            # cheap deterministic spread
        px = cx + int(rad * (0.5 - rdough.random()) * 2)
        py = cy + int((rad * 0.7) * (0.5 - rdough.random()) * 2)
        if (px - cx) ** 2 + ((py - cy) * 14 // 11) ** 2 > (r - 4) ** 2:
            continue
        if (px - cx) ** 2 + (py - cy) ** 2 < 12 ** 2:   # leave the crater clear
            continue
        d.point((px, py), fill=PAL["ember"][2] if rdough.random() > 0.4 else rim)


# ── the molten-sugar crater (THE detail: 설탕이 녹아요, bubbling over) ──────────

def paint_sugar(d):
    """The boiling melted-sugar crater at the centre — the recognizable hero
    detail. Concentric ember→gold→white-hot rings (the molten pool), a scatter of
    deterministic bright bubbles, and a glossy spill running OVER the rim toward
    the plate (so it reads as 'sugar melting and bubbling over', not a painted
    dot). All warm ramp + white hot-point, dithered (no alpha)."""
    cx, cy = CX, HOT_CY + 2
    # the crater bowl: a darker ember well the sugar pools in
    d.ellipse([cx - 15, cy - 12, cx + 15, cy + 12], fill=PAL["ember"][3])
    d.ellipse([cx - 13, cy - 10, cx + 13, cy + 10], fill=PAL["ember"][2])
    # the molten sugar: ember -> gold -> white-hot concentric pool
    d.ellipse([cx - 11, cy - 8, cx + 11, cy + 8], fill=PAL["ember"][1])
    d.ellipse([cx - 8, cy - 6, cx + 8, cy + 6], fill=PAL["gold_light"][1])
    d.ellipse([cx - 5, cy - 4, cx + 5, cy + 4], fill=PAL["gold_light"][0])
    # the white-hot core where the sugar is liquid + boiling
    d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=PAL["white"][0])
    d.point((cx, cy - 1), fill=PAL["white"][0])
    # the BUBBLES: a deterministic scatter of little raised domes bursting in the
    # pool (each a bright cap + a dark contact arc) — the 'burbujeando' read.
    rb = random.Random(SEED)
    placed = []
    for _ in range(60):
        bx = cx + rb.randint(-12, 12)
        by = cy + rb.randint(-9, 9)
        if (bx - cx) ** 2 + ((by - cy) * 3) ** 2 > 12 ** 2 * 3:   # inside the bowl
            continue
        if any((bx - ox) ** 2 + (by - oy) ** 2 < 5 for ox, oy in placed):
            continue
        placed.append((bx, by))
        rr = rb.choice((0, 0, 1))                     # tiny / small bubble
        if rr == 0:
            d.point((bx, by), fill=PAL["gold_light"][0])
            d.point((bx, by + 1), fill=PAL["ember"][2])   # dark contact under it
        else:
            d.ellipse([bx - 1, by - 1, bx + 1, by + 1], fill=PAL["gold_light"][0])
            d.point((bx, by - 1), fill=PAL["white"][0])   # hot highlight
            d.point((bx, by + 2), fill=AMBER_DEEP)        # contact shadow
    # the glossy spill: a thread of molten sugar running over the lower rim toward
    # the plate (it's overflowing — that's why 이모 says 조심하세요). A short trembling
    # gold rivulet, NOT a straight line.
    sx = cx + 3
    sy = cy + 9
    drift = (0, 1, 1, 0, -1, 0, 1)
    for k in range(16):
        sy2 = sy + k
        sxx = sx + drift[k % len(drift)] + (k // 6)
        if k < 6:
            c = PAL["gold_light"][0]
        elif k < 11:
            c = PAL["gold_light"][1]
        else:
            c = PAL["ember"][1]
        d.point((sxx, sy2), fill=c)
        if k < 9:
            d.point((sxx + 1, sy2), fill=PAL["ember"][2])   # the rivulet's edge
    d.point((sx, sy - 1), fill=PAL["white"][0])             # bright lip where it pours


# ── the warm steam off the hot sugar (common.steam, warm — no loose specks) ────

def paint_steam(d):
    """Two/three warm steam wisps curling off the boiling 호떡 (common.steam, warm
    near the source). Anchored on the crater + the dome so they read as a
    continuous wisp rising from the heat, not loose motes (the L1/L2 failure)."""
    C.steam(d, CX - 6, HOT_CY - 24, height=22, phase=0, warm=True)
    C.steam(d, CX + 7, HOT_CY - 22, height=20, phase=3, warm=True)
    C.steam(d, CX, HOT_CY - 26, height=24, phase=6, warm=True)


# ── compose ───────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H)              # transparent canvas (close-up)
    paint_glow(d)                            # the warm amber halo (L3-d), behind
    paint_plate(d)                           # the oiled cast-iron 철판 slice
    paint_hotteok(d)                         # the big browning 호떡 hero
    paint_sugar(d)                           # the molten-sugar crater (THE detail)
    paint_steam(d)                           # warm steam off the heat
    return img


def main():
    img = build()
    C.save_asset(img, "objects", "obj-hotteok.png")
    C.preview(img, "preview_obj-hotteok.png", scale=3)


if __name__ == "__main__":
    main()
