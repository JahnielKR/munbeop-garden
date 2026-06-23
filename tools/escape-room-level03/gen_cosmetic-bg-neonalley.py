#!/usr/bin/env python3
"""cosmetic-bg-neonalley.png — 🟢 the 네온 골목 cosmetic background, Level 3.

Dossier §9 (cosmetics, Común tier): «El callejón del mercado de frente bajo el
neón nocturno: planchas humeantes a ambos lados como islas de ámbar, carteles
rosa/cian/verde como halos difuminados, el asfalto mojado devolviéndolos
partidos. Paleta azul-violeta + ámbar; vapor en dos capas de 1px para
profundidad.»

A pure-MOOD background: NO NPCs, NO hotspots (no hotspot_debug). It is the
distilled atmosphere of the level — the covered market alley seen head-on,
TWO griddle islands (griddle_hotteok, the KEY LIGHT, L3-d) glowing amber on
either flank, the cold neon alley receding down the centre (illegible, L3-a),
and the foreground all wet asphalt splitting + trembling the neon
(wet_reflect). Two depth layers of 1px steam (near = warm/bright, far = cool/
thin) give the alley air. 320×240 OPAQUE.

Composition (320×240, looking DOWN the covered alley):
  BACK  : cold black-violet asphalt sky + a receding neon_alley (the market in
          fuga, illegible) high across the top, a warm threshold glimpsed far
          centre (the alley continues into warm light), a cold vignette.
  MID   : two flanking stalls (market_stall) angled into the frame, each with
          extra neon_sign halos (pink/cyan/green) over its awning.
  ISLES : a griddle_hotteok on each flank counter = the two amber islands,
          each steaming, tinting its stall gold (L3-d).
  FORE  : wet asphalt down the centre + corners with wet_reflect smears
          (pink/cyan/green split + trembling), and the two steam depth layers.

Shared builders used: neon_alley, neon_sign, market_stall, griddle_hotteok,
wet_reflect, steam, glow + dither/fill primitives. The receding centre stalls,
the warm threshold glimpse and the depth steam are asset-local detail painted
around those builders (STYLE rule 2). NO legible hangul anywhere (L3-a); NO
hidden element / second shadow (L3-b — this background hides nothing).

Deterministic: no unseeded random; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cosmetic-bg-neonalley.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

W, H = 320, 240

HORIZON = 150            # where the back stalls meet the wet street
COUNTER_Y = 158          # the flank-stall counter front edge (griddles rest here)


# ── BACKGROUND: cold neon alley in fuga over night asphalt ────────────────────

def paint_sky(d):
    """Night base: cold black-violet asphalt sky + a receding neon_alley high
    across the top (the market 'sigue' into the distance, illegible halos,
    L3-a), pushed BACK behind a cold film + a cold vignette so the warm griddle
    islands below read as the brightest points."""
    # the night base behind everything
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    fill(d, 0, 0, W, HORIZON, PAL["asphalt"][1])
    # the receding wall of neon signs (cold key) across the whole upper band, so
    # it reads as the market 'in fuga' behind the flanking stalls. Fully lit (a
    # cosmetic at peak market hum, not the diegetic clock closing). This is the
    # spec's 'carteles rosa/cian/verde como halos difuminados' — kept a real
    # presence, filling the upper band down to where the flank half-walls begin.
    C.neon_alley(d, 2, 6, 316, 104, lit_cols=99, seed=33)
    # push the alley BACK behind ONE light cold film so it becomes distant glow,
    # not a bright foreground checkerboard — but keep the halos clearly visible
    # (lighter touch than the rooms; here the neon glow IS the subject up top).
    dither(d, 0, 0, W, 116, PAL["asphalt"][1], phase=1)
    # a soft cold vignette at the top corners so the eye falls to the warm isles,
    # leaving the centre-top halos brightest.
    for y in range(0, 116):
        for x in range(0, W):
            if (x + y) % 2 != 0:
                continue
            dx = abs(x - W / 2) / (W / 2)
            dy = 1.0 - y / 116
            wgt = 0.30 * dx + 0.52 * dy
            m = 8 if wgt < 0.4 else (4 if wgt < 0.75 else 2)
            if ((x * 5 + y * 3) % m) == 0:
                d.point((x, y), fill=PAL["asphalt"][3])


def paint_centre_recede(d):
    """The alley CONTINUING down the centre into the distance (depth, no NPCs).

    The covered market keeps going between the two flanking stalls — a receding
    band of small neon halos (pink/cyan/green, illegible L3-a) getting smaller
    toward a dim vanishing point, NOT a booth and NOT a figure: an open lane of
    cold glow the two warm flanks funnel toward (the eye travels INTO the
    market). Deliberately empty + cold so nothing here reads as a person.
    """
    # the centre is OPEN alley: night asphalt with a receding column of small
    # neon halos marching back. Keep it cold so the warm flanks stay the focus.
    fcx = 160
    # a faint warm haze low-centre (the next warm stall a long way off) — small,
    # dim, NO vertical dark mass under it (so it never reads as a standing figure)
    for y in range(HORIZON - 22, HORIZON):
        t = (y - (HORIZON - 22)) / 22.0
        half = int(6 + 14 * t)
        for x in range(fcx - half, fcx + half):
            if (x + y) % 2 != 0:
                continue
            if ((x * 3 + y * 7) % 6) == 0:
                d.point((x, y), fill=PAL["ember"][3])
    # a small dim far-off neon halo cluster receding up the centre lane, each one
    # smaller + higher (depth), illegible — the market 'sigue' away from us
    for (sx, sy, sw, sh, col) in ((fcx - 9, HORIZON - 40, 18, 10, "cyan"),
                                  (fcx - 7, HORIZON - 58, 14, 8, "pink"),
                                  (fcx - 6, HORIZON - 72, 12, 8, "green")):
        C.neon_sign(d, sx, sy, sw, sh, color=col, lit=True)
    # push the whole centre lane BACK behind a cold film so it is distant glow,
    # an empty receding alley — never a foreground booth.
    dither(d, fcx - 40, HORIZON - 80, 80, 80, PAL["asphalt"][2], phase=1)
    dither(d, fcx - 40, HORIZON - 80, 80, 80, PAL["asphalt"][1], phase=0)


def paint_centre_lane_floor(d):
    """A few small far neon glints on the centre-lane floor (the alley's wet
    floor receding), instead of figure silhouettes — the spec wants a pure mood
    background with NO NPCs, so the central lane stays peopleless. Tiny cold
    points keep it from being a flat dead void without ever reading as a body."""
    for (gx, gy, col) in ((150, HORIZON - 6, "cyan"), (172, HORIZON - 9, "pink"),
                          (160, HORIZON - 3, "green")):
        c = {"cyan": PAL["neon_cyan"][2], "pink": PAL["neon_pink"][2],
             "green": PAL["neon_green"][2]}[col]
        d.point((gx, gy), fill=c)
        d.point((gx + 1, gy + 1), fill=PAL["asphalt"][1])


# ── THE TWO AMBER ISLANDS: a griddle stall on each flank ───────────────────────

def paint_flank_stall(d, side):
    """One flanking griddle stall = one amber island (dossier §9 'planchas a
    ambos lados como islas de ámbar').

    side=-1 the LEFT flank, side=+1 the RIGHT flank. Each is a market_stall
    chassis (striped awning, wood counter, bare bulb) hugging its edge of the
    frame, partly cropped off-screen so it reads as 'the alley is lined with
    stalls' (not two free-floating booths). A griddle_hotteok sits on the
    counter = the warm KEY LIGHT (L3-d), tinting the stall gold. Extra neon_sign
    halos sit over the awning (the stall's own glowing sign, illegible).
    """
    if side < 0:
        sx, sw = -14, 132          # cropped off the left edge
    else:
        sx, sw = W - 118, 132      # cropped off the right edge
    sy = 16
    sh = COUNTER_Y + 16 - sy
    C.market_stall(d, sx, sy, sw, sh, awning="stripe", bulb=True)
    # a dim warm back panel so the island reads against warm wood, not the cold
    # alley. Kept LOW (a half-wall behind the counter only) so the receding
    # neon_alley still shows in the upper band over it — the neon halos of the
    # spec stay a real presence, not hidden by a full curtain.
    bw_y = COUNTER_Y - 44
    bw_h = COUNTER_Y - bw_y
    fill(d, sx + 6, bw_y, sw - 12, bw_h, PAL["wood_dark"][2])
    for bx in range(sx + 10, sx + sw - 8, 12):              # vertical battens
        vline(d, bx, bw_y, bw_h, PAL["wood_dark"][1])
        vline(d, bx + 1, bw_y, bw_h, PAL["wood_dark"][3])
    dither(d, sx + 6, bw_y, sw - 12, bw_h, PAL["asphalt"][2], phase=1)   # dim back
    hline(d, sx + 6, bw_y, sw - 12, PAL["wood_light"][2])   # lit top rail of the half-wall
    frame(d, sx + 6, bw_y, sw - 12, bw_h, OUTLINE)
    # a hanging-utensil rail above the half-wall (dark silhouettes = texture, the
    # alley neon shows between them; no text, L3-a)
    rail_y = bw_y - 18
    for ux in range(sx + 14, sx + sw - 10, 22):
        vline(d, ux, rail_y, 3, PAL["metal"][3])
        d.ellipse([ux - 3, rail_y + 3, ux + 3, rail_y + 9], outline=PAL["metal"][3])
    # extra glowing neon signs over the awning (pink one side, cyan/green other),
    # illegible (L3-a) — the stall's own sign hum
    if side < 0:
        sign_specs = [(sx + 70, sy + 1, 30, 12, "pink"), (sx + 40, sy - 2, 22, 11, "green")]
    else:
        sign_specs = [(sx + 18, sy + 1, 30, 12, "cyan"), (sx + 52, sy - 2, 22, 11, "pink")]
    for (nx, ny, nw, nh, col) in sign_specs:
        C.neon_sign(d, nx, ny, nw, nh, color=col, lit=True)
        # a light cold film over each foreground sign so its bright stroke-cores
        # read as a DIFFUSED halo ('halos difuminados', §9), never a crisp glyph
        # — the same recede trick the alley halos get, so L3-a is unambiguous up
        # close (suggested strokes, not decipherable hangul).
        dither(d, nx - 3, ny - 3, nw + 6, nh + 6, PAL["asphalt"][1], phase=0)


def paint_flank_griddle(d, side):
    """A griddle_hotteok on the flank counter = the amber island's heart.

    griddle_hotteok(x,y,w,h) draws the plate from (x,y+4)..(x+w,y+h) with two
    호떡 + spatula + warm steam, the warmest/highest-contrast thing it touches.
    Placed on the COUNTER_Y front lip of each flank so the plate sits ON the
    counter, glowing into the alley.
    """
    if side < 0:
        gx = 16            # left island plate
    else:
        gx = W - 16 - 64   # right island plate (mirrored toward its edge)
    C.griddle_hotteok(d, gx, COUNTER_Y - 22, w=64, h=32, spatula=True)


def paint_island_spill(d, side):
    """The warm amber wash the griddle island pools onto the wet asphalt in front
    of it (L3-d: the key light tints what's before it). A soft radial-ish
    dithered pool, checker-gated so it stays soft (NOT a hard cone)."""
    gcx = 48 if side < 0 else W - 48
    gcy = COUNTER_Y + 4
    x0, x1 = (0, 116) if side < 0 else (W - 116, W)
    for y in range(HORIZON, H):
        for x in range(x0, x1):
            if (x + y) % 2 != 0:
                continue
            dxn = (x - gcx) / 60.0
            dyn = (y - gcy) / 64.0
            t = 1.0 - (dxn * dxn + dyn * dyn)
            if t <= 0:
                continue
            m = 2 if t > 0.62 else (4 if t > 0.32 else 8)
            if ((x * 3 + y * 7) % m) == 0:
                d.point((x, y), fill=PAL["ember"][3] if t < 0.55 else PAL["ember"][2])


# ── THE WET ASPHALT FOREGROUND: neon split + trembling + depth steam ──────────

def paint_asphalt(d):
    """The wet black-violet street: a reflective foreground with wet_reflect neon
    smears (the pink/cyan/green alley split + trembling in the puddles, dossier
    §9 'el asfalto mojado devolviéndolos partidos'). The two warm island spills
    bracket a cold neon-mirrored centre."""
    fill(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][2])
    dither(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][3], phase=0)
    hline(d, 0, HORIZON, W, PAL["asphalt"][1])              # the wet seam catches light
    # neon smeared down the wet asphalt. CENTRE is cold (mirroring the alley's
    # cold neon), so the warm island spills (painted separately) frame it.
    C.wet_reflect(d, 120, HORIZON + 6, 36, H - HORIZON - 10, color="pink", seed=3)
    C.wet_reflect(d, 158, HORIZON + 6, 26, H - HORIZON - 10, color="cyan", seed=8)
    C.wet_reflect(d, 186, HORIZON + 6, 30, H - HORIZON - 10, color="green", seed=12)
    # a faint warm split under each island (their own amber mirrored, dull)
    C.wet_reflect(d, 30, HORIZON + 6, 22, H - HORIZON - 12, color="pink", seed=21)
    C.wet_reflect(d, 268, HORIZON + 6, 22, H - HORIZON - 12, color="green", seed=27)


def paint_depth_steam(d):
    """Two depth layers of 1px steam for air (dossier §9 'vapor en dos capas de
    1px para profundidad').

    NEAR layer: warm, bright, tall — rising off the two foreground griddle
    islands. FAR layer: cool, thin, short — rising deep in the central alley
    (over the receding stalls), so the alley has front-to-back air. steam()
    draws a continuous curling 1px wisp (never loose specks).
    """
    # --- FAR layer: cool thin wisps deep in the central alley (small, recessed) ---
    for (sx, sy, ht, ph) in ((150, HORIZON - 30, 11, 0), (168, HORIZON - 33, 9, 4)):
        C.steam(d, sx, sy, height=ht, phase=ph, warm=False)
    # --- NEAR layer: warm tall wisps off the two foreground griddle islands.
    # ONE wisp per island (the griddle builder already adds two short curls), with
    # a different phase each side so they read as soft rising curls, not symmetric
    # branching 'antlers'.
    for (sx, sy, ht, ph) in ((46, COUNTER_Y - 18, 24, 0), (W - 46, COUNTER_Y - 18, 24, 5)):
        C.steam(d, sx, sy, height=ht, phase=ph, warm=True)


# ── compose ───────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    paint_sky(d)                  # cold night + market-in-fuga neon (back)
    paint_centre_recede(d)        # the alley continuing into the distance (depth)
    paint_centre_lane_floor(d)    # tiny far neon glints on the centre lane floor
    paint_flank_stall(d, -1)      # left island stall chassis
    paint_flank_stall(d, +1)      # right island stall chassis
    paint_asphalt(d)              # wet street + cold neon reflections (foreground)
    paint_island_spill(d, -1)     # left island warm spill on the asphalt
    paint_island_spill(d, +1)     # right island warm spill on the asphalt
    paint_flank_griddle(d, -1)    # left amber island (griddle key light)
    paint_flank_griddle(d, +1)    # right amber island (griddle key light)
    paint_depth_steam(d)          # two 1px steam depth layers (front + back air)
    return img


def main():
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-bg-neonalley.png")
    C.preview(img, "preview_cosmetic-bg-neonalley.png", scale=3)


if __name__ == "__main__":
    main()
