#!/usr/bin/env python3
"""room-01-hotteok.png — 호떡집 (순자 이모's stall), Level 3 Zona 1 hub.

Dossier §6 Zona 1, estado A «mercado abierto»: the warmest island stall of the
level, frontal under a faded striped awning. The 철판 griddle (griddle_hotteok)
is the KEY LIGHT (L3-d) — two 호떡 browning, amber glow, warm steam — the only
real warm source on a cold-neon street. 순자 이모 stands behind it, center; her
apron lit ember by the plate. The "kidnapped" backpack is tucked under the
counter, lower-left foreground. A bare awning bulb hangs upper-right. Crates of
dough + the sugar bucket sit under the counter at left (the gunbox slot region —
becomes the 군대 package post-twist). Background: the neon alley in fuga
(illegible, L3-a), wet asphalt foreground splitting the neon (wet_reflect).

Layout (320×240, frontal-flat like every room):
  BACK  : neon_alley receding (cold key) + a faint next stall to the right third.
  CENTER: market_stall chassis (awning + counter + posts); its bare bulb lands
          at the bulb hotspot upper-right.
  CENTER: griddle_hotteok on the counter (the warm key) low-center; 순자 이모
          behind it, center, lit ember. The market cat sits by the plate.
  LOWER-L: crates of dough + sugar bucket under the counter (gunbox region) and
           the backpack slumped beside them (the Chekhov hostage).
  FLOOR : wet black-violet asphalt with wet_reflect neon smears in the foreground.

HOTSPOTS (320×240 space, from the seed):
  imo      [145,80,60,90]  center (175,125)  — SLOT 1/5, the 이모 FIGURE only
  gunbox   [55,120,50,50]  center (80,145)   — SLOT 5 region, the crates/box
  hotteok  [120,178,55,30] center (147,193)  — cosmetic, the griddle/호떡
  backpack [15,180,40,35]  center (35,197)   — cosmetic, the kidnapped backpack
  bulb     [195,28,24,28]  center (207,42)   — cosmetic, the awning bulb
The imo rect [145,80,60,90] and gunbox rect [55,120,50,50] are DISJOINT (STYLE
§Composición + dossier hotspot note): 이모 stays center, the crates stay left.

Shared builders used: market_stall, griddle_hotteok, imo(griddle), backpack,
market_cat(0), neon_alley, wet_reflect, steam + dither/fill primitives. The dough
crates, sugar bucket, the bag-string and the next-stall hint are asset-local
detail painted around those builders (STYLE rule 2).

Deterministic: no unseeded random; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_room-01-hotteok.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240
HORIZON = 158            # where the back wall of stalls meets the wet street
COUNTER_Y = 164          # the stall counter front edge (griddle rests on it)

# Hotspot rects from the seed (320x240 space).
RECTS = [
    (145, 80, 60, 90),   # imo (SLOT 1 / SLOT 5) — the 이모 FIGURE only
    (55, 120, 50, 50),   # gunbox (SLOT 5 region) — crates under the counter
    (120, 178, 55, 30),  # hotteok (cosmetic) — the griddle / 호떡
    (15, 180, 40, 35),   # backpack (cosmetic) — the kidnapped daypack
    (195, 28, 24, 28),   # bulb (cosmetic) — the awning bulb
]


# ── BACKGROUND: the cold neon alley in fuga over wet asphalt ──────────────────

def paint_alley(d):
    """The receding market alley: cold asphalt sky + neon_alley signs (illegible).

    Fills the whole frame with night asphalt, then bands the upper two-thirds
    with the receding neon_alley (the market 'sigues' into the distance, L3-a
    illegible glow). A darker vignette at the very top so the warm island below
    reads as the brightest point.
    """
    # the night sky/asphalt base behind everything
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    fill(d, 0, 0, W, HORIZON, PAL["asphalt"][1])
    # the receding wall of neon signs (cold key) ONLY in the upper alley band, so
    # it reads as the market 'in fuga' BEHIND the stall, not a foreground wall.
    # The stall (awning + 이모 + griddle) covers the centre; the alley shows past
    # its sides + over its awning. lit_cols caps the lit halos (dimmer, recessed).
    C.neon_alley(d, 4, 6, 312, 78, lit_cols=18, seed=33)
    # push the whole alley BACK behind a cold film so the foreground reads warmer
    # and the signs become distant glow, not a bright checkerboard up front.
    dither(d, 0, 0, W, 90, PAL["asphalt"][2], phase=0)
    dither(d, 0, 0, W, 90, PAL["asphalt"][1], phase=1)
    # a soft cold vignette at the top corners so the eye falls to the warm stall
    for y in range(0, 84):
        for x in range(0, W):
            if (x + y) % 2 != 0:
                continue
            dx = abs(x - W / 2) / (W / 2)
            dy = 1.0 - y / 84
            wgt = 0.45 * dx + 0.75 * dy
            m = 8 if wgt < 0.4 else (4 if wgt < 0.75 else 2)
            if ((x * 5 + y * 3) % m) == 0:
                d.point((x, y), fill=PAL["asphalt"][3])
    # silhouettes of a couple of late customers passing as cold shadows mid-depth,
    # tucked to the far sides so they don't crowd the stall
    for (sx, sw, sh) in ((24, 9, 26), (288, 8, 24)):
        fill(d, sx, HORIZON - sh, sw, sh, PAL["asphalt"][3])
        d.ellipse([sx + 1, HORIZON - sh - 6, sx + sw - 1, HORIZON - sh], fill=PAL["asphalt"][3])
        # a cold neon rim on the shoulder (street light catches them)
        vline(d, sx, HORIZON - sh, sh, PAL["neon_cyan"][3])


def paint_next_stall(d):
    """A faint neighbouring stall hinted in the right third (depth, the market
    'continues'). Kept dim + cool so the 호떡 island stays the warm focus."""
    # a dim awning + post sliver at the far right, pushed cool/dark
    fill(d, 286, 40, 34, 14, PAL["wood_dark"][3])
    for i, sx in enumerate(range(286, 320, 7)):
        c = PAL["stone"][3] if i % 2 == 0 else PAL["wood_dark"][3]
        fill(d, sx, 40, 4, 14, c)
    vline(d, 300, 54, HORIZON - 54, PAL["wood_dark"][3])
    # its own little cold neon sign, dimmer (a halo back in the depth)
    C.neon_sign(d, 290, 58, 26, 13, color="cyan", lit=True)
    dither(d, 286, 40, 34, HORIZON - 40, PAL["asphalt"][2], phase=1)   # push it back


def paint_asphalt(d):
    """The wet black-violet street: a reflective foreground with wet_reflect neon
    smears (the pink + cyan alley split + trembling in the puddles)."""
    fill(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][2])
    # a darker pool sweeping the lower foreground
    dither(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][3], phase=0)
    hline(d, 0, HORIZON, W, PAL["asphalt"][1])               # the wet seam catches light
    # neon smeared down the wet asphalt in the lower foreground (the reflections).
    # Placed to the SIDES, clear of the backpack rect [15,180,40,35] and the warm
    # island, so they frame it rather than fight it. Cyan + green at the edges.
    C.wet_reflect(d, 226, HORIZON + 6, 56, H - HORIZON - 10, color="cyan", seed=4)
    C.wet_reflect(d, 196, HORIZON + 6, 24, H - HORIZON - 10, color="green", seed=9)
    C.wet_reflect(d, 60, HORIZON + 6, 18, H - HORIZON - 10, color="pink", seed=7)
    # a SOFT warm amber wash on the asphalt under the griddle (the key light
    # spills gold onto the wet street — L3-d tints what's in front of it). A
    # radial-ish dithered pool, NOT a hard triangle/cone: density fades with
    # distance from the plate centre (147,176), checker-gated so it stays soft.
    gcx, gcy = 147, 178
    for y in range(HORIZON, H):
        for x in range(96, 200):
            if (x + y) % 2 != 0:
                continue
            dxn = (x - gcx) / 56.0
            dyn = (y - gcy) / 60.0
            t = 1.0 - (dxn * dxn + dyn * dyn)
            if t <= 0:
                continue
            m = 2 if t > 0.62 else (4 if t > 0.32 else 8)
            if ((x * 3 + y * 7) % m) == 0:
                d.point((x, y), fill=PAL["ember"][3] if t < 0.55 else PAL["ember"][2])


# ── THE STALL (chassis) + the bulb hotspot ───────────────────────────────────

def paint_stall(d):
    """market_stall chassis positioned so its bare bulb lands at bulb [195,28,24,28].

    market_stall() draws the bulb at (x+w-16, y+aw_h+ ~9). For the bulb glow to
    center near (207,42): with w=190 the bulb x = sx+174; choosing the stall to
    span the centre, the bulb is re-placed locally to hit the rect exactly (the
    stall's own bulb is suppressed and a dedicated awning bulb is painted at the
    hotspot). The counter slab carries the griddle; the posts frame 이모.
    """
    # span the stall so the counter front edge lands at COUNTER_Y=164 (sy+sh-16):
    # the griddle then rests ON the counter and 이모 stands behind it, the counter
    # occluding her lower half. bulb=False: a dedicated bulb is painted at the
    # bulb hotspot instead so its glow centers on [195,28,24,28].
    sx, sy = 60, 14
    sw, sh = 200, COUNTER_Y + 16 - sy          # -> counter front at COUNTER_Y
    C.market_stall(d, sx, sy, sw, sh, awning="stripe", bulb=False)
    # The stall is OPEN: the cold neon alley shows BEHIND 이모 (dossier §6 'el
    # callejón en fuga'), NOT a solid wall — so we add only warm stall TEXTURE
    # framing her (a back rail of hanging utensils + a half-wall right behind
    # her), leaving the rest of the mid-band as the dim alley painted underneath.
    shy = sy + 16
    # a back shelf rail under the awning
    fill(d, sx + 2, shy, sw - 4, 4, PAL["wood_dark"][1])
    hline(d, sx + 2, shy, sw - 4, PAL["wood_light"][2])
    frame(d, sx + 2, shy, sw - 4, 4, OUTLINE)
    # hanging utensils off the rail (dark silhouettes = texture, no text), with a
    # gap left above 이모's head + the bulb
    for i, ux in enumerate(range(sx + 14, sx + sw - 16, 24)):
        if 146 <= ux <= 212:
            continue
        vline(d, ux, shy + 4, 3, PAL["metal"][3])           # the hook
        if i % 3 == 0:                                       # a ladle
            d.ellipse([ux - 3, shy + 7, ux + 3, shy + 13], outline=PAL["metal"][2])
            vline(d, ux, shy + 6, 4, PAL["metal"][2])
        elif i % 3 == 1:                                     # a spatula
            fill(d, ux - 2, shy + 7, 4, 8, PAL["metal"][3])
            hline(d, ux - 2, shy + 7, 4, PAL["metal"][1])
        else:                                                # a small jar
            fill(d, ux - 2, shy + 7, 5, 9, PAL["wood_light"][2])
            hline(d, ux - 2, shy + 7, 5, PAL["white"][1])
    # a dim warm back PANEL behind the centre of the stall so 이모 reads against
    # warm wood, not floating in the cold alley. It runs from the rail down to the
    # counter and is wide enough to read as the booth's back board (the alley
    # still shows past its left/right edges → depth). Vertical battens = texture.
    bw_x, bw_w = 130, 100
    bw_y = shy + 4
    bw_h = COUNTER_Y - bw_y
    fill(d, bw_x, bw_y, bw_w, bw_h, PAL["wood_dark"][2])
    for bx in range(bw_x + 4, bw_x + bw_w - 2, 12):          # vertical battens
        vline(d, bx, bw_y, bw_h, PAL["wood_dark"][1])
        vline(d, bx + 1, bw_y, bw_h, PAL["wood_dark"][3])
    for by in range(bw_y + 6, bw_y + bw_h, 22):              # a couple of cross rails
        hline(d, bw_x, by, bw_w, PAL["wood_dark"][1])
    dither(d, bw_x, bw_y, bw_w, bw_h, PAL["asphalt"][2], phase=1)       # dim it back
    dither(d, bw_x + bw_w - 16, bw_y, 16, bw_h, PAL["asphalt"][2], phase=0)  # shade R
    frame(d, bw_x, bw_y, bw_w, bw_h, OUTLINE)


def paint_counter_front(d):
    """Re-draw the counter slab ON TOP of 이모 so it occludes her lower half — she
    reads as standing BEHIND the counter. Drawn after paint_imo. The slab spans
    the CENTRE-RIGHT (x=100..260); the LEFT third (x60..100) is left OPEN as the
    under-counter shelf where the dough crates (gunbox region) + the kidnapped
    backpack are visible 'bajo el mostrador' (dossier §6). The griddle rests on
    this front lip."""
    sx, sw = 100, 160                          # counter front: centre-right only
    C.wood_planks(d, sx, COUNTER_Y, sw, 16, PAL["wood_light"], plank_h=6, seam_every=2)
    hline(d, sx, COUNTER_Y, sw, PAL["wood_light"][0])    # lit front lip
    fill(d, sx, COUNTER_Y + 14, sw, 2, PAL["wood_dark"][3])   # counter lip shadow
    frame(d, sx, COUNTER_Y, sw, 16, OUTLINE)
    # warm the counter face (the griddle light pools on the wood)
    dither(d, sx + 2, COUNTER_Y + 2, sw - 4, 8, PAL["ember"][3], phase=1)
    # the left under-counter shelf: a dark open bay where the crates/backpack sit
    fill(d, 60, COUNTER_Y - 2, 40, H - COUNTER_Y + 2, PAL["asphalt"][3])
    vline(d, 100, COUNTER_Y - 2, H - COUNTER_Y, PAL["wood_dark"][2])   # bay edge post
    vline(d, 101, COUNTER_Y - 2, H - COUNTER_Y, PAL["wood_dark"][3])


def paint_bulb(d):
    """The bare swinging awning bulb at the bulb hotspot [195,28,24,28], center
    (207,42). A warm gold glow + a glass bulb on a short cord from the awning."""
    bx, by = 207, 44                            # glow centre, inside the rect
    vline(d, bx, 26, by - 30, PAL["ink"][2])    # the cord up to the awning
    vline(d, bx + 1, 26, by - 30, PAL["ink"][1])
    C.glow(d, bx, by, 8, [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][0]])
    d.ellipse([bx - 3, by - 3, bx + 3, by + 4], fill=PAL["gold_light"][0],
              outline=PAL["ember"][2])
    d.point((bx, by - 1), fill=PAL["white"][0])  # filament hot-point
    d.point((bx - 1, by + 1), fill=PAL["gold_light"][1])
    # a tiny cap where bulb meets cord
    fill(d, bx - 1, by - 5, 3, 2, PAL["metal"][2])


def paint_paperbags(d):
    """The string of 호떡 paper bags hanging off the awning (dossier §6: 'una ristra
    de bolsas de papel'). Kept small + warm, upper-left of the awning, clear of
    the imo and bulb rects."""
    by = 30
    hline(d, 92, by, 44, PAL["ink"][2])         # the string
    for i, bx in enumerate(range(96, 134, 12)):
        fill(d, bx, by + 1, 7, 9, PAL["white"][1])
        hline(d, bx, by + 1, 7, PAL["white"][0])
        dither(d, bx + 4, by + 3, 3, 6, PAL["wood_light"][2], phase=0)
        d.point((bx + 3, by + 5), fill=PAL["ember"][1])   # an oil blot
        frame(d, bx, by + 1, 7, 9, OUTLINE)


# ── UNDER THE COUNTER (lower-left): crates + sugar + the backpack ─────────────

def paint_under_counter(d):
    """The crates of dough + sugar bucket (gunbox region [55,120,50,50]) and the
    kidnapped backpack [15,180,40,35] tucked under the counter, lower-left.

    The gunbox hotspot center (80,145) sits on a stack of market crates (the
    dough boxes that become the 군대 package post-twist). The backpack sits to
    their left, lower, on the wet asphalt. Both are cool-shadowed (street side)
    but catch a little warm spill from the griddle on their right faces.
    """
    # --- the crate stack in the left under-counter bay, at gunbox (center 80,145) ---
    # a wooden dough crate with a cardboard box on top, mass centred ~ (80,145)
    # inside [55,120,50,50]. Sits in the open left bay (x62..98).
    cx, cy = 62, 126
    drop_shadow(d, cx - 1, cy + 38, 40, 2, cool=True)
    # lower wooden produce crate
    fill(d, cx, cy + 16, 36, 22, PAL["wood_dark"][2])
    hline(d, cx, cy + 16, 36, PAL["wood_dark"][1])
    vline(d, cx, cy + 16, 22, PAL["wood_dark"][1])
    dither(d, cx + 24, cy + 18, 12, 20, PAL["wood_dark"][3], phase=0)
    for sxx in range(cx + 4, cx + 34, 7):                    # crate slats
        vline(d, sxx, cy + 18, 18, PAL["wood_dark"][3])
    hline(d, cx + 2, cy + 26, 32, PAL["wood_dark"][1])
    frame(d, cx, cy + 16, 36, 22, OUTLINE)
    # upper cardboard dough box (a flap up) — becomes the 군대 package post-twist
    fill(d, cx + 4, cy, 28, 18, PAL["wood_light"][2])
    hline(d, cx + 4, cy, 28, PAL["wood_light"][1])
    dither(d, cx + 20, cy + 2, 12, 15, PAL["wood_dark"][1], phase=1)
    d.polygon([(cx + 4, cy), (cx + 11, cy - 5), (cx + 18, cy)],
              fill=PAL["wood_light"][1], outline=PAL["wood_dark"][2])   # open flap
    hline(d, cx + 4, cy + 9, 28, PAL["wood_dark"][2])        # tape seam
    frame(d, cx + 4, cy, 28, 18, OUTLINE)
    # a sugar bucket sitting on the crate (the 호떡 sugar) at the bay's right edge
    bkx, bky = cx + 22, cy - 14
    fill(d, bkx, bky, 13, 16, PAL["metal"][2])
    d.ellipse([bkx, bky - 2, bkx + 13, bky + 3], fill=PAL["white"][0], outline=OUTLINE)
    dither(d, bkx + 1, bky + 1, 11, 3, PAL["white"][1], phase=0)   # sugar heap
    vline(d, bkx, bky, 16, PAL["metal"][1])
    dither(d, bkx + 8, bky + 2, 5, 12, PAL["metal"][3], phase=0)
    frame(d, bkx, bky, 13, 16, OUTLINE)
    d.line([bkx + 6, bky, bkx + 10, bky - 5], fill=PAL["metal"][1])   # scoop
    d.point((bkx + 10, bky - 5), fill=PAL["metal"][0])
    # warm spill from the griddle (to the right) on the crate's right faces
    vline(d, cx + 35, cy + 17, 20, PAL["ember"][3])

    # --- the kidnapped backpack [15,180,40,35], center (35,197) ---
    # backpack() spans ~34x32 from origin; placed at (17,178) the body centers
    # ~ (34,196), inside the rect. Slumped on the wet asphalt at the bay's foot,
    # within reach but behind her — the Chekhov hostage.
    C.backpack(d, 17, 178, w=34, h=32)
    drop_shadow(d, 18, 211, 32, 2, cool=True)
    vline(d, 50, 184, 22, PAL["ember"][3])    # a thin warm rim from the griddle


# ── THE WARM ISLAND: griddle (key light) + 이모 + the cat ──────────────────────

def paint_griddle(d):
    """griddle_hotteok on the counter — the KEY LIGHT (L3-d), at the hotteok rect.

    griddle_hotteok(x,y,w,h) draws the plate ellipse from (x, y+4) to (x+w, y+h)
    with two 호떡 + spatula + warm steam. With w=66,h=32 at origin (114,168) the
    plate spans x114..180, y172..200, visual center ~ (147,189) — landing inside
    hotteok [120,178,55,30] (center 147,193). It sits ON the counter slab, in
    front of 이모, the warmest highest-contrast element of the scene.
    """
    C.griddle_hotteok(d, 112, 160, w=70, h=34, spatula=True)


def paint_imo(d):
    """순자 이모, imo(griddle), standing behind the plate at the imo rect.

    imo(griddle) measured from the builder: at origin (mx,my) the round body
    spans x mx+2..mx+26, y my+4..my+54 with visual center ~ (mx+14, my+30).
    Hotspot [145,80,60,90], center (175,125): origin (161,92) lands the head at
    ~y96, the round apron body centered ~ (175,122), busy hands reaching DOWN to
    the plate at ~ (168,123) — the figure mass centers ~ (175,122), inside the
    rect, and she reads as standing behind the griddle working it. A warm contact
    + her own ember key from the plate below.
    """
    mx, my = 161, 100
    C.imo(d, mx, my, pose="griddle")
    # the griddle light catching the underside of her apron + hands (gold rim) —
    # she is the warmest figure, apron lit ember by her own plate (L3-d)
    dither(d, mx + 4, my + 40, 18, 6, PAL["ember"][2], phase=1)
    hline(d, mx + 6, my + 46, 14, PAL["gold_light"][2])


def paint_cat(d):
    """The market cat (frame 0, sitting) on the counter by the plate, warmed by
    the griddle. Small life; outside every hotspot rect (sits on the counter at
    right, clear of imo [145,80,…] which starts at x=145 — the cat sits x≥226)."""
    C.market_cat(d, 226, 150, frame_i=0)
    # warm eyes already gold in the builder; add a faint ember rim on its back
    dither(d, 230, 156, 8, 3, PAL["ember"][3], phase=0)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    paint_alley(d)            # cold neon depth (back)
    paint_next_stall(d)       # the dim neighbour stall (right third, depth)
    paint_asphalt(d)          # wet street + neon reflections (foreground floor)
    paint_stall(d)            # the protagonist stall chassis (awning/back/posts)
    paint_bulb(d)             # the bare awning bulb (bulb hotspot)
    paint_paperbags(d)        # the string of 호떡 bags off the awning
    paint_cat(d)              # the market cat on the counter top (behind the lip)
    paint_imo(d)              # 이모 standing behind the counter (imo hotspot)
    paint_counter_front(d)    # the counter slab, occluding her lower half
    paint_griddle(d)          # the griddle key light ON the counter (hotteok rect)
    paint_under_counter(d)    # crates+sugar (gunbox) + backpack, left bay front
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-01-hotteok.png")
    C.preview(img, "preview_room-01-hotteok.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-01-hotteok.png", scale=3)


if __name__ == "__main__":
    main()
