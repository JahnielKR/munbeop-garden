#!/usr/bin/env python3
"""cinematic-intro.png — the approach to 달빛시장, Level 3 opening cinematic.

Dossier §3 (intro prose) + §7 (CINEMÁTICA APERTURA): you climb the three iron
steps toward 달빛시장 and the cold street drops away behind you — inside it is
all steam, oil and light. The neon sign 달빛시장 (market_gate, ILLEGIBLE per
L3-a) crowns the arch over the steps; YOUR backpack is still on your shoulder in
the foreground (not yet 'kidnapped' — that happens in Zona 1). Cold blue street
behind/below, warm amber market glow above. A flickering pink neon splits +
trembles in the wet asphalt of the foreground landing (wet_reflect).

This is a CINEMATIC, not a room: NO hotspots (no hotspot_debug). 320×240 OPAQUE.

Composition (320×240, looking UP the steps into the market):
  TOP    : the market_gate arch (시장 입구 / 달빛시장 neon, illegible) glowing
           warm-amber + a receding neon_alley behind it (the market in fuga).
  MID    : the warm threshold — amber spill, steam columns, the bright griddle
           glow of the first stall hinted past the gate (the warm 'inside').
  STEPS  : three iron steps rising center-frame from the cold landing up to the
           lit gate (the climb; cold below, warm above).
  FORE   : the cold wet-asphalt landing at the bottom; the player's BACKPACK on
           a shoulder strap entering from lower-left foreground (close, big);
           pink/cyan neon split + trembling in the puddles (wet_reflect).

Shared builders used: market_gate, neon_alley, neon_sign, wet_reflect, steam,
backpack, glow + dither/fill primitives. The iron steps, the shoulder + strap
the pack hangs from, and the cold street rail are asset-local detail painted
around those builders (STYLE rule 2).

Palette: warm amber (ember/gold_light) ABOVE at the gate/threshold; cold neon +
black-violet asphalt (asphalt/neon_*) BELOW at the street landing. The eye
climbs from cold foreground to warm market (L3-d: the warmth is the lure).

Deterministic: no unseeded random; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cinematic-intro.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240

# Key horizontals of the climb.
GATE_TOP = 14            # top of the market gate arch
THRESH_Y = 96            # the lit market threshold (top of the steps, the doorway)
LAND_Y = 188            # the cold wet landing where the player stands (step foot)


# ── BACKGROUND: the cold night sky + the market in fuga behind the gate ───────

def paint_sky(d):
    """Night base: cold black-violet asphalt sky, a band of receding neon_alley
    glow ABOVE the gate (the market continues up the covered street, illegible
    L3-a), a cold vignette so the warm gate is the brightest point."""
    # the night base behind everything
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    fill(d, 0, 0, W, THRESH_Y, PAL["asphalt"][1])
    # the market 'in fuga' as a receding wall of neon signs, ONLY in the upper
    # band over/around where the gate will sit (the covered street climbs away).
    C.neon_alley(d, 8, 4, 304, 70, lit_cols=22, seed=51)
    # push the alley BACK behind a cold film so it reads as distant glow, not a
    # bright foreground checkerboard (same recede trick as the rooms).
    dither(d, 0, 0, W, 82, PAL["asphalt"][2], phase=0)
    dither(d, 0, 0, W, 82, PAL["asphalt"][1], phase=1)
    # a soft cold vignette at the top corners so the eye falls to the warm gate
    for y in range(0, 80):
        for x in range(0, W):
            if (x + y) % 2 != 0:
                continue
            dx = abs(x - W / 2) / (W / 2)
            dy = 1.0 - y / 80
            wgt = 0.42 * dx + 0.72 * dy
            m = 8 if wgt < 0.4 else (4 if wgt < 0.75 else 2)
            if ((x * 5 + y * 3) % m) == 0:
                d.point((x, y), fill=PAL["asphalt"][3])


# ── THE WARM THRESHOLD: the market 'inside' seen past the gate ────────────────

def paint_threshold(d):
    """The warm 'inside' of the market glimpsed through the gate above the steps.

    A band of amber light at THRESH_Y — the warm market spilling down the steps:
    the first stall's bare bulb + griddle glow, hinted stalls in warm wood, two
    steam columns rising. This is the LURE (dossier §3 'dentro es todo vapor,
    aceite y luz'); cold neon frames it, warmth pours out of it.
    """
    # the warm doorway box: the lit market interior past the arch columns
    tx, tw = 70, 180
    ty, th = THRESH_Y - 30, 46
    # warm wood back wall of the first reach of the market
    fill(d, tx, ty, tw, th, PAL["wood_dark"][2])
    dither(d, tx, ty, tw, th, PAL["wood_dark"][1], phase=1)
    # a warm amber haze pooled at the threshold (the spill of oil-light)
    for y in range(ty, ty + th):
        for x in range(tx, tx + tw):
            if (x + y) % 2 != 0:
                continue
            t = 1.0 - (y - ty) / th
            m = 2 if t > 0.6 else (4 if t > 0.3 else 8)
            if ((x * 3 + y * 7) % m) == 0:
                d.point((x, y), fill=PAL["ember"][3] if t < 0.55 else PAL["ember"][2])
    # the first stall hinted: a striped awning sliver + a counter glow inside
    fill(d, tx + 16, ty + 2, tw - 100, 8, PAL["wood_dark"][1])
    for i, sx in enumerate(range(tx + 16, tx + tw - 84, 8)):
        c = PAL["white"][2] if i % 2 == 0 else PAL["tteok"][3]
        fill(d, sx, ty + 2, 4, 8, c)
    # a hinted hanging utensil rail (dark silhouettes, no text, L3-a)
    for ux in range(tx + 24, tx + tw - 20, 26):
        vline(d, ux, ty + 12, 3, PAL["metal"][3])
        d.ellipse([ux - 2, ty + 14, ux + 2, ty + 19], outline=PAL["metal"][3])
    # the bright griddle/bulb glow of the nearest stall (warm core, the real lure)
    gx, gy = tx + tw - 46, ty + 26
    C.glow(d, gx, gy, 11, [PAL["gold_light"][0], PAL["gold_light"][1],
                           PAL["ember"][1], PAL["ember"][2]])
    d.point((gx, gy - 1), fill=PAL["white"][0])
    # two warm steam columns rising from the threshold (the market breathing)
    C.steam(d, tx + 52, ty + 8, height=20, phase=0, warm=True)
    C.steam(d, gx - 6, ty + 6, height=24, phase=3, warm=True)
    C.steam(d, tx + 110, ty + 10, height=16, phase=5, warm=True)


# ── THE GATE: the 달빛시장 neon arch crowning the steps (illegible, L3-a) ──────

def paint_gate(d):
    """market_gate spanning the top — the 시장 입구 / 달빛시장 neon (illegible).

    market_gate(x,y,w,h) draws two columns + a lintel + a SUGGESTED-hangul neon
    sign (never legible, L3-a) + a swag of warm bulbs. Spanned wide across the
    top so the steps rise INTO it. Its warm bulb garland + pink neon are the
    crown of the warm half of the frame.
    """
    C.market_gate(d, 18, GATE_TOP, w=284, h=58)
    # a soft pink neon halo bleeding DOWN off the sign onto the threshold haze
    # (the 'rosa que parpadea' of the intro): a dithered cone, fading with
    # distance — bands of the ramp, never a glyph, never a clean rectangle.
    hcx = W // 2
    for y in range(GATE_TOP + 14, GATE_TOP + 30):
        t = 1.0 - (y - (GATE_TOP + 14)) / 16.0
        half = int(46 * t) + 8
        for x in range(hcx - half, hcx + half):
            if (x + y) % 2 != 0:
                continue
            m = 2 if t > 0.6 else (4 if t > 0.3 else 8)
            if ((x * 3 + y * 7) % m) == 0:
                d.point((x, y), fill=PAL["neon_pink"][2] if t > 0.45 else PAL["neon_pink"][3])


# ── THE THREE IRON STEPS rising from the cold landing to the warm gate ────────

def _step_half(depth):
    """Half-width of step `depth` (0 = top, at the gate; 3 = foot, closest).

    A converging staircase: WIDEST at the foot (closest to camera) and narrowing
    toward the gate, so it reads as a flight you climb UP into the market.
    """
    return 46 + depth * 30


def paint_steps(d):
    """The three iron steps up to 달빛시장 (dossier §3 'los tres escalones de
    hierro'), drawn in receding perspective.

    A converging stair funnel: each step is a foreshortened TREAD (a bright iron
    nosing) above a darker RISER face, the whole thing narrowing toward the gate
    so it reads as a climb UP into the warm market. Foreshortening: the bottom
    (near) step is tall, the top (far) step is shallow. Cold neon catches the
    lower wet nosings; warm amber the top one (the market light reaches down it).
    The negative space LEFT and RIGHT of the funnel is the cold dark street wall.
    """
    metal, metal_hi, metal_sh = PAL["metal"][2], PAL["metal"][1], PAL["metal"][3]
    cx = W // 2
    span = LAND_Y - THRESH_Y
    # foreshortened step heights: near step tallest, far step shallowest
    heights = [span * 5 // 18, span * 6 // 18, span * 7 // 18]   # top->bottom-ish
    # fill the side flanks (outside the funnel) with the cold dark street wall so
    # the stair is a bright wedge on darkness, not three full-width shelves.
    fill(d, 0, THRESH_Y, W, span, PAL["asphalt"][2])
    dither(d, 0, THRESH_Y, W, span, PAL["asphalt"][3], phase=1)
    sy = THRESH_Y
    for depth in range(3):                   # depth 0 = top (far), 2 = bottom-ish
        far_half = _step_half(depth)         # top edge of this tread
        near_half = _step_half(depth + 1)    # bottom edge / its riser foot
        sh = heights[depth]
        riser_top = sy
        tread_y = sy + sh - 4                 # the visible tread sliver at the foot
        # the RISER face: a trapezoid (far_half at top -> near_half at bottom),
        # cold dark iron, so steps read as solid risers not flat slabs.
        for yy in range(riser_top, tread_y):
            t = (yy - riser_top) / max(sh - 4, 1)
            half = int(far_half + (near_half - far_half) * t)
            fill(d, cx - half, yy, 2 * half, 1, metal_sh)
        # cold-cast dither over the riser (it's in shadow, street-lit)
        dither(d, cx - near_half, riser_top, 2 * near_half, sh - 4, PAL["asphalt"][2], phase=1)
        # the TREAD nosing: a bright horizontal iron lip at the foot of the riser
        fill(d, cx - near_half, tread_y, 2 * near_half, 4, metal)
        hline(d, cx - near_half, tread_y, 2 * near_half, metal_hi)
        # diamond-plate studs on the tread (the iron read)
        for yy in range(tread_y + 1, tread_y + 4):
            for xx in range(cx - near_half + 2, cx + near_half - 2, 6):
                d.point((xx + (yy % 2) * 3, yy), fill=metal_sh)
        # the slanted side stringers (the iron edges of the flight) — outline both
        d.line([(cx - far_half, riser_top), (cx - near_half, tread_y + 3)], fill=OUTLINE)
        d.line([(cx + far_half - 1, riser_top), (cx + near_half - 1, tread_y + 3)], fill=OUTLINE)
        hline(d, cx - near_half, tread_y + 3, 2 * near_half, OUTLINE)
        # rim light on the nosing: warm amber on the TOP step (market light), cold
        # pink/cyan neon on the lower wet steps (the street).
        if depth == 0:
            hline(d, cx - near_half + 2, tread_y, 2 * near_half - 4, PAL["ember"][1])
            dither(d, cx - near_half + 3, tread_y + 1, 2 * near_half - 6, 2,
                   PAL["ember"][2], phase=0)
        else:
            rim = PAL["neon_pink"][2] if depth == 1 else PAL["neon_cyan"][2]
            for rx in range(cx - near_half + 3, cx + near_half - 3, 3):
                d.point((rx, tread_y), fill=rim)
        sy += sh
    # the warm amber glow pouring DOWN the centre of the flight from the gate:
    # a SOFT symmetric vertical wash, brightest at the top (the gate mouth) and
    # fading down the treads. Density is a smooth function of how close a pixel is
    # to the centre line, checker-gated by a PURE checkerboard (x+y) so it never
    # forms a diagonal hatch/zigzag — it reads as a pool of warm light on the
    # iron, not a lightning bolt (the round-1/2 failure).
    wob = (0, 1, 1, 0, -1, -1, 0, 1, 0, -1)    # a slow fixed centre wobble (organic)
    for y in range(THRESH_Y, LAND_Y):
        t = 1.0 - (y - THRESH_Y) / span        # 1 at the gate, 0 at the foot
        glow_half = int(14 + 30 * (1.0 - t))   # widens generously toward the player
        bright = 0.40 + 0.60 * t               # the gate end is the source
        gcx = cx + wob[(y - THRESH_Y) % len(wob)]   # gentle wander so it's not a stripe
        for x in range(gcx - glow_half, gcx + glow_half):
            edge = abs(x - gcx) / max(glow_half, 1)
            dens = (1.0 - edge * edge) * bright
            if dens <= 0.14:
                continue
            # density-stepped checker on the (x+y) lattice — NO directional streak.
            # Brighter core = denser checker; soft fringe = sparse checker.
            if dens > 0.60:
                if (x + y) % 2 == 0:
                    d.point((x, y), fill=PAL["ember"][2])
            elif dens > 0.32:
                if (x + y) % 2 == 0:
                    d.point((x, y), fill=PAL["ember"][3])
            else:
                if (x + y) % 4 == 0:
                    d.point((x, y), fill=PAL["ember"][3])


# ── THE COLD WET LANDING + the player's backpack on the shoulder ──────────────

def paint_landing(d):
    """The cold wet-asphalt landing at the player's feet + the neon reflections.

    Below the steps: the black-violet street the player climbs FROM, still wet
    from rain, splitting + trembling the market neon in the puddles (wet_reflect,
    the 'rosa que parpadea reflejado partido en el asfalto'). Cold, blue, the
    opposite of the warm gate above (the temperature contrast = the lure).
    """
    fill(d, 0, LAND_Y, W, H - LAND_Y, PAL["asphalt"][2])
    dither(d, 0, LAND_Y, W, H - LAND_Y, PAL["asphalt"][3], phase=0)
    hline(d, 0, LAND_Y, W, PAL["asphalt"][1])              # the wet seam catches light
    # neon split + trembling down the wet asphalt foreground. The PINK reflection
    # under the centre (mirroring the gate's pink sign 'partido' down the street),
    # cyan + green to the sides. Kept clear of the lower-left where the pack is.
    C.wet_reflect(d, 124, LAND_Y + 4, 60, H - LAND_Y - 8, color="pink", seed=3)
    C.wet_reflect(d, 196, LAND_Y + 4, 40, H - LAND_Y - 8, color="cyan", seed=8)
    C.wet_reflect(d, 250, LAND_Y + 4, 44, H - LAND_Y - 8, color="green", seed=12)
    # one cyan smear in the lower-RIGHT clear of the lower-left pack
    C.wet_reflect(d, 96, LAND_Y + 4, 22, H - LAND_Y - 8, color="cyan", seed=15)


def paint_backpack(d):
    """The player's bag slung over the shoulder, lower-left foreground (close).

    Dossier §3/§7: 'la mochila al hombro en primer plano' — still YOURS, slung on
    your shoulder, NOT yet kidnapped (that is Zona 1). Read built for an
    over-the-shoulder silhouette: the player's near SHOULDER + upper arm fill the
    bottom-left as a big dark coat mass; a single strap runs OVER the top of the
    shoulder and DOWN the chest; the bag hangs SIDE-ON against the body from that
    strap. (A side-on slung bag reads correctly here; the face-on `backpack`
    builder is the round under-counter hostage prop of Zona 1 — STYLE rule 2:
    asset-local silhouette around the shared palette.)
    """
    coat, coat_hi, coat_lo = PAL["asphalt"][1], PAL["asphalt"][0], PAL["asphalt"][2]
    # --- the player's shoulder + upper arm, a big dark mass from the bottom-left.
    # A rounded deltoid at top (the shoulder), the arm dropping to the bottom edge.
    d.polygon([(0, 240), (0, 176), (10, 150), (38, 142), (60, 156), (66, 188),
               (58, 240)], fill=coat, outline=OUTLINE)
    d.ellipse([6, 138, 50, 176], fill=coat, outline=OUTLINE)   # the round shoulder cap
    # coat creases (form, so it reads as a clothed shoulder not a flat blob)
    dither(d, 8, 170, 50, 60, coat_hi, phase=1)
    d.line([(16, 176), (48, 200)], fill=coat_lo)
    d.line([(10, 206), (40, 226)], fill=coat_lo)
    # a collar/hood hint at the neck so the mass reads as a clothed person's back
    d.arc([22, 132, 54, 162], 200, 340, fill=coat_lo)
    d.arc([24, 134, 52, 160], 210, 330, fill=PAL["asphalt"][3])
    # cold neon rim along the top of the shoulder (street neon behind the player)
    d.arc([6, 138, 50, 176], 180, 330, fill=PAL["neon_cyan"][2])
    d.line([(38, 142), (60, 156)], fill=PAL["neon_pink"][2])
    # a WARM rim on the gate-facing (right) edge of the shoulder — the market
    # light ahead catches the player's far shoulder (the lure reaches them)
    d.line([(56, 152), (64, 184)], fill=PAL["ember"][3])
    d.line([(57, 156), (65, 186)], fill=PAL["ember"][2])
    # --- the strap OVER the shoulder, running down the chest (clear, 3px, lit edge)
    d.line([(28, 240), (40, 150)], fill=PAL["wood_dark"][3])
    d.line([(29, 240), (41, 150)], fill=PAL["ink"][2])
    d.line([(30, 240), (42, 150)], fill=PAL["wood_dark"][2])    # lit strap edge
    d.line([(31, 240), (43, 150)], fill=PAL["ink"][2])
    # --- the bag hanging SIDE-ON against the body, lower-left, from that strap.
    # A soft-cornered rectangular daypack body (taller than wide = a bag, not a
    # pot), a top flap, a side pocket, a red zip pull (the level's tteok-red).
    bx, by, bw, bh = 4, 150, 50, 74
    body, body_hi, body_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    drop_shadow(d, bx + 2, by + bh, bw - 4, 2, cool=True)
    # body (rounded only at the bottom corners → upright bag silhouette)
    fill(d, bx, by + 6, bw, bh - 12, body)
    d.pieslice([bx, by + bh - 18, bx + bw, by + bh], 0, 180, fill=body)   # rounded base
    fill(d, bx + 4, by, bw - 8, 10, body)                  # rounded top
    d.pieslice([bx + 4, by - 4, bx + bw - 4, by + 10], 180, 360, fill=body)
    hline(d, bx + 8, by, bw - 16, body_hi)                 # lit top
    vline(d, bx, by + 8, bh - 16, body_hi)                 # lit left edge
    dither(d, bx + bw - 16, by + 8, 16, bh - 20, body_sh, phase=0)   # shaded right
    frame(d, bx, by + 2, bw, bh - 4, OUTLINE)
    # the top LID flap (its own panel + seam = clear backpack read)
    d.pieslice([bx + 3, by - 2, bx + bw - 3, by + 24], 180, 360, fill=body_hi)
    d.arc([bx + 3, by - 2, bx + bw - 3, by + 24], 180, 360, fill=OUTLINE)
    hline(d, bx + 6, by + 13, bw - 12, body_sh)            # lid seam
    fill(d, bx + bw // 2 - 2, by + 8, 4, 6, PAL["ink"][1])  # lid buckle
    d.point((bx + bw // 2, by + 9), fill=PAL["metal"][1])
    # a front pocket panel with its own zip + the red pull (tteok)
    px, py, pw, ph = bx + 10, by + 30, bw - 20, 26
    fill(d, px, py, pw, ph, body)
    d.arc([px, py - 3, px + pw, py + 10], 0, 180, fill=body_sh)
    frame(d, px, py, pw, ph, body_sh)
    for zx in range(px + 2, px + pw - 2, 2):               # the pocket zip teeth
        d.point((zx, py + 2), fill=PAL["ink"][2])
    fill(d, px + pw // 2 - 1, py + 2, 2, 4, PAL["tteok"][1])   # red zip pull
    d.point((px + pw // 2, py + 6), fill=PAL["tteok"][0])
    # cold neon on its street-facing left face, warm gate-rim on its right face
    vline(d, bx + 1, by + 10, bh - 24, PAL["neon_pink"][3])
    vline(d, bx + bw - 1, by + 12, bh - 30, PAL["ember"][3])
    dither(d, bx + bw - 8, by + 10, 6, 28, PAL["ember"][3], phase=1)   # warm spill, gate side


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    paint_sky(d)              # cold night + market-in-fuga neon glow (back)
    paint_threshold(d)        # the warm market 'inside' past the gate (the lure)
    paint_gate(d)             # the 달빛시장 neon arch crowning the steps (illegible)
    paint_steps(d)            # the three iron steps rising cold->warm
    paint_landing(d)          # cold wet asphalt + neon reflections (foreground)
    paint_backpack(d)         # the player's pack on the shoulder (lower-left fore)
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "cinematic-intro.png")
    C.preview(img, "preview_cinematic-intro.png", scale=3)


if __name__ == "__main__":
    main()
