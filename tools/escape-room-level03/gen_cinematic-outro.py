#!/usr/bin/env python3
"""cinematic-outro.png — THE farewellImage, Level 3 closing freeze (320x240).

Dossier §3 "farewellImage — spec del plano final (congelado)" + §7 beat 5:
plano medio-largo desde el andén, a la altura de la calle, mirando el costado
del último bus que YA se separa del bordillo. Composición en dos mitades —

  RIGHT : the LAST BUS (last_bus), already separating to the right; in one lit
          yellow window the silhouette of 도윤 RECIÉN RAPADO (doyun pose="window":
          buzzed scalp, a pink-green NEON STRIPE across his reflected face, one
          hand half-raised to the glass). Big, in motion, the mass of the frame.
  LEFT  : 이모 (apron, short, round) + 하나 (taller, slim) shoulder to shoulder on
          the platform, BOTH an arm raised (imo/hana pose="wave"). SMALL against
          the bus — the shot is of the ones STAYING, not the one leaving.
  BACK-L: the 호떡 griddle (griddle_hotteok) STILL LIT, ALONE, breathing a single
          1px steam wisp — nobody tending it (the "te guardo el sitio" made image,
          the griddle the diegetic clock never puts out, L3-c/L3-d).
  FORE  : the whole lower foreground = wet asphalt returning the market neon
          SPLIT + trembling (wet_reflect) — rojo, verde menta, el rosa que
          parpadea. The warm equivalent of L2's "espejo encendido", in neon.

L3-b ABSOLUTE: NOTHING hidden — no second shadow, no easter egg, no secret that
rewards a second run. A goodbye with promised reunion, in full neon. If anything
is hidden in the frame, it is WRONG. The "discovery" of the 2nd run is thematic
(the 호떡 in the player's hand was always hers), never a visual the art conceals.

This is a CINEMATIC, not a room: NO hotspots (no hotspot_debug). 320x240 OPAQUE.

Uses ONLY common.py builders + helpers (FROZEN): last_bus, doyun(window),
imo(wave), hana(wave), griddle_hotteok, market_stall, neon_alley, neon_sign,
wet_reflect, steam, glow + dither/fill primitives. The platform lip, the curb
gap the bus separates across, and rim lights are asset-local detail painted
around those builders (STYLE rule 2).

Deterministic: no unseeded random; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cinematic-outro.py
"""

from __future__ import annotations

import random

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240
HORIZON = 154           # where the back wall of stalls meets the wet street/road
CURB_Y = 168            # the platform lip the bus has just pulled away from


# ── BACKGROUND: cold closing-night street, the market nearly shut ─────────────

def sky_and_alley(d):
    """Cold night-market backdrop: asphalt wash + receding neon, DIMMED hard.

    Closing hour (L3-c): the neon_alley keeps only a few halos lit. Veiled with
    asphalt dither so the upper band reads as distant GLOW, never legible strokes
    (L3-a guard). The warm half of the frame is the bus + the lone griddle; up
    here everything is cold and going dark.
    """
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    fill(d, 0, 0, W, 34, PAL["asphalt"][3])                 # darker covered roof
    dither(d, 0, 30, W, 8, PAL["asphalt"][2], phase=0)
    # the market in fuga (upper band), capped VERY low — almost everything dark.
    C.neon_alley(d, 4, 14, 312, 66, lit_cols=5, seed=33)
    # L3-a guard: veil the front (largest) neon rows so no jamo resolves at 1x.
    # Three passes over the whole alley + an extra over the largest front row so
    # the distant signs read as soft halos of glow, never decipherable strokes.
    dither(d, 0, 12, W, 16, PAL["asphalt"][2], phase=0)
    dither(d, 0, 14, W, 14, PAL["asphalt"][3], phase=1)
    dither(d, 0, 14, W, 66, PAL["asphalt"][2], phase=0)
    dither(d, 0, 14, W, 22, PAL["asphalt"][2], phase=1)     # extra veil, front rows
    # a cold vignette in the upper corners so the eye falls to the warm bus window
    for y in range(0, 84):
        for x in range(0, W):
            if (x + y) % 2 != 0:
                continue
            dx = abs(x - W / 2) / (W / 2)
            dy = 1.0 - y / 84.0
            wgt = 0.40 * dx + 0.70 * dy
            m = 8 if wgt < 0.42 else (4 if wgt < 0.78 else 2)
            if ((x * 5 + y * 3) % m) == 0:
                d.point((x, y), fill=PAL["asphalt"][3])


def back_stalls(d):
    """The market wall behind the platform: the protagonist 호떡 stall (left, its
    griddle still lit) + a dim neighbour stall whose neon is dead (closing).

    The 호떡 stall is the warm anchor of the LEFT half — its bare bulb + the lone
    griddle on its counter are the only warmth on the platform side. A neighbour
    stall to its right is pushed cold + its sign dead (a halo less, L3-c)."""
    # protagonist 호떡 stall chassis, back-left (its counter carries the griddle)
    C.market_stall(d, 6, 70, w=86, h=68, awning="stripe", bulb=True)
    # a dim neighbour stall, cooler, its neon dead (closing hour)
    C.market_stall(d, 96, 78, w=58, h=58, awning="stripe", bulb=False)
    dither(d, 96, 78, 58, 14, PAL["asphalt"][2], phase=0)   # cool its awning
    dither(d, 96, 78, 58, 14, PAL["asphalt"][3], phase=1)
    dither(d, 96, 92, 58, 44, PAL["asphalt"][2], phase=1)   # push the body back, cold
    # a dead neon tube on its valance (a halo less, L3-c). Veil it HARD so the
    # dead strokes never resolve into glyphs at 1x (L3-a) — two asphalt passes
    # melt it into a faint gray smudge, "obviously an off sign", not characters.
    C.neon_sign(d, 110, 70, 30, 10, color="cyan", lit=False)  # dead tube
    dither(d, 107, 67, 36, 16, PAL["asphalt"][2], phase=0)
    dither(d, 107, 67, 36, 16, PAL["asphalt"][3], phase=1)


# ── THE LONE LIT GRIDDLE — alone, breathing, nobody tending it (L3-c/L3-d) ────

def lone_griddle(d):
    """griddle_hotteok on the 호떡 stall counter, ALONE + still lit (the canonical
    detail of §3: 'la plancha SOLA, encendida, echando un hilo de vapor de 1px').

    griddle_hotteok(x,y,w,h) draws the round cast-iron plate, two browning 호떡, a
    spatula, an amber glow + warm steam wisps — the warmest, highest-contrast
    element of the frame (L3-d). It is the heat that stays for when he comes back
    ('te guardo el sitio' hecho imagen). Nobody stands behind it: 이모 is on the
    platform waving. The builder's own steam IS the 1px wisp the spec asks for.
    """
    # on the stall COUNTER, back-left, SMALL + clear of the waving figures (the
    # shot is of them; the griddle is the back-left detail "que sigue ahí").
    gx, gy = 14, 112
    C.griddle_hotteok(d, gx, gy, w=46, h=26, spatula=True)
    # a warm amber pool spilling off the plate onto the stall counter below it
    # (so the lone heat reads as a real light source, not a sticker) — soft dither.
    for y in range(gy + 26, gy + 34):
        for x in range(gx, gx + 46):
            if (x + y) % 2 != 0:
                continue
            t = 1.0 - (y - (gy + 26)) / 8.0
            if ((x * 3 + y * 5) % (4 if t > 0.5 else 8)) == 0:
                d.point((x, y), fill=PAL["ember"][3])
    # one extra tall, lonely 1px steam wisp rising clear above the stall (the
    # "hilo de vapor" the spec names — a single continuous curl, never specks).
    C.steam(d, gx + 23, gy + 1, height=28, phase=2, warm=True)


# ── THE PLATFORM + the two who STAY (이모 + 하나, both an arm raised) ──────────

def platform(d):
    """The concrete platform lip the figures stand on + the curb the bus left.

    A pale wet-concrete band at CURB_Y across the LEFT half (the andén), with a
    dark gap of road beyond the curb where the bus has pulled away. Cold, wet,
    catching a little neon — the ground the ones STAYING are rooted to."""
    # the platform slab (left half), warm-neutral concrete, wet-lit top edge
    fill(d, 0, CURB_Y, 150, H - CURB_Y, PAL["stone"][3])
    dither(d, 0, CURB_Y, 150, H - CURB_Y, PAL["asphalt"][2], phase=0)
    hline(d, 0, CURB_Y, 150, PAL["stone"][2])               # the lit curb nosing
    hline(d, 0, CURB_Y + 1, 150, PAL["stone"][3])
    # the curb edge where the platform meets the road (right side of the slab)
    vline(d, 149, CURB_Y, H - CURB_Y, PAL["asphalt"][3])
    dither(d, 142, CURB_Y + 1, 8, H - CURB_Y - 1, PAL["asphalt"][3], phase=1)


def the_two(d):
    """이모 + 하나 shoulder to shoulder on the platform, BOTH an arm raised.

    imo(x,y,pose='wave') = short/round, red kerchief, ember apron, one arm UP.
    hana(x,y,pose='wave') = taller/slim, high ponytail, tteok-red apron, arm UP.
    Placed centre-LEFT on the platform, SMALL against the bus mass (the shot is
    of them staying). They read as the SAME two people as in their scenes (cross
    anchors). A warm rim from the griddle/bulb behind catches their near edge; a
    cool neon rim from the street catches the far. ONE contact shadow each — no
    second shadow anywhere in this frame (L3-b)."""
    # centre-LEFT on the platform, in FRONT of the dim neighbour stall, clear of
    # the griddle (which sits back-left on the 호떡 stall counter). SMALL against
    # the bus. 이모 (shorter, round, a touch FORWARD/lower); 하나 (taller, slim) at
    # her shoulder, set a touch BACK + RIGHT so their raised arms don't cross.
    imo_x, imo_y = 96, 120
    hana_x, hana_y = 124, 112
    C.hana(d, hana_x, hana_y, pose="wave")     # 하나 first (behind/right)
    C.imo(d, imo_x, imo_y, pose="wave")        # 이모 in front (overlaps her shoulder)
    # cool neon rim on their RIGHT (street/bus-light) edges — the cold the bus
    # leaves behind sweeping past them (a single thin edge, no blob)
    vline(d, hana_x + 18, hana_y + 20, 12, PAL["neon_cyan"][2])
    d.point((imo_x + 25, imo_y + 26), fill=PAL["neon_cyan"][2])
    # ONE cool contact shadow per figure on the wet platform (L3-b: NO second
    # shadow, no easter egg — exactly one grounded shadow each, nothing hidden).
    drop_shadow(d, imo_x + 3, CURB_Y - 1, 22, 2, cool=True)
    drop_shadow(d, hana_x + 3, CURB_Y - 1, 16, 2, cool=True)


# ── THE LAST BUS — separating to the RIGHT, 도윤 buzzed in a window ────────────

def the_bus(d):
    """last_bus across the RIGHT half, already pulling away from the curb.

    last_bus(x,y,w,h) draws the body (rounded nose), a band, a row of warm-yellow
    windows, an open door, two wheels, a headlight glint. Placed wide on the right
    (x~150) so it dominates the right half and reads as the side of a bus MOVING
    OFF. A thin gap of dark road shows under it between curb and wheels (it has
    separated from the bordillo). 도윤's buzzed window bust is painted INTO one of
    its lit windows by doyun(pose='window'). The bus is the big warm mass; the two
    on the platform are small beside it (the shot of the ones staying).
    """
    bx, by, bw, bh = 150, 84, 168, 70
    # a cool contact pool under the bus on the wet road first
    dither(d, bx, HORIZON - 2, bw - 6, 6, PAL["asphalt"][3], phase=1)
    C.last_bus(d, bx, by, w=bw, h=bh)
    # the dark road GAP between the platform curb and the bus body (it has pulled
    # away): a sliver of darker asphalt just left of the front wheel region.
    fill(d, 150, CURB_Y, 8, H - CURB_Y, PAL["asphalt"][3])
    dither(d, 150, CURB_Y, 8, H - CURB_Y, PAL["asphalt"][2], phase=1)
    # 도윤 RECIÉN RAPADO in a lit window: pick a window well INTO the body so the
    # bust sits cleanly inside a yellow pane (builder windows start ~bx+20, step
    # 16). Window at ~bx+52 gives a clean frame; doyun(window) is ~24x26.
    win_x = bx + 52
    win_y = by + 12
    # a faint warm halo of the window light bleeding onto the bus SKIN around the
    # pane (NOT inside it — the builder lights the window itself; an interior veil
    # would bury his bust). A thin ring just outside the frame so the lit window
    # glows against the cold body without touching 도윤.
    dither(d, win_x - 3, win_y - 3, 30, 3, PAL["ember"][3], phase=1)      # above
    dither(d, win_x - 3, win_y + 26, 30, 3, PAL["ember"][3], phase=0)     # below
    vline(d, win_x - 2, win_y - 1, 28, PAL["ember"][3])                   # left
    vline(d, win_x + 25, win_y - 1, 28, PAL["ember"][3])                  # right
    C.doyun(d, win_x, win_y, pose="window")                              # the bust, on top


# ── THE WET STREET (foreground) — the neon SPLIT + trembling (wet_reflect) ────

def wet_street(d):
    """The wet black-violet asphalt foreground returning the market neon, split +
    trembling (wet_reflect): rojo, verde menta, el rosa que parpadea. The whole
    lower foreground is this mirror (§3) — the warm/loud equivalent of L2's gold
    'mirror'. Warm bus-window + griddle reflections low-left; cold neon centre."""
    fill(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][2])
    dither(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][3], phase=0)
    hline(d, 0, HORIZON, W, PAL["asphalt"][1])              # the wet road seam glints
    # neon smeared DOWN the wet street, split + trembling. Pink (the flickering
    # market sign), green (menta), cyan — spread across the foreground so the
    # whole lower band is the mirror the spec asks for. Kept off the figures'
    # feet on the platform (x<150 is platform concrete, handled in platform()).
    C.wet_reflect(d, 158, HORIZON + 4, 30, H - HORIZON - 8, color="pink", seed=3)
    C.wet_reflect(d, 196, HORIZON + 4, 26, H - HORIZON - 8, color="green", seed=8)
    C.wet_reflect(d, 232, HORIZON + 4, 28, H - HORIZON - 8, color="cyan", seed=12)
    C.wet_reflect(d, 272, HORIZON + 4, 30, H - HORIZON - 8, color="pink", seed=5)
    # a pink + green pair on the platform-side too (the market behind the figures
    # reflected in the wet curb) — small, low, so the mirror reads continuous.
    C.wet_reflect(d, 4, CURB_Y + 6, 22, H - CURB_Y - 10, color="green", seed=9)
    C.wet_reflect(d, 110, CURB_Y + 6, 18, H - CURB_Y - 10, color="pink", seed=14)
    # a few warm reflections of the bus windows + the griddle in the wet road
    # under the bus (warm flecks among the cold neon — the heat reflected too).
    r = random.Random(40)
    for _ in range(26):
        rx = r.randint(158, 312)
        ry = r.randint(HORIZON + 4, H - 6)
        if (rx + ry) % 2 == 0:
            d.point((rx, ry), fill=PAL["gold_light"][2])
            d.point((rx, ry + 1), fill=PAL["ember"][3])


# ── compose ──────────────────────────────────────────────────────────────────

def compose():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    sky_and_alley(d)        # cold closing-night neon depth (DIMMED)
    back_stalls(d)          # the 호떡 stall + a dead neighbour (back-left)
    lone_griddle(d)         # the lone lit griddle + its 1px steam wisp (L3-d)
    wet_street(d)           # the wet asphalt mirror + neon reflections (fore)
    platform(d)             # the concrete platform lip + the curb gap
    the_two(d)              # 이모 + 하나, both an arm raised (the ones staying)
    the_bus(d)              # the last bus separating right + 도윤 buzzed in a window
    return img


def main():
    img = compose()
    # opaque guarantee: composite onto an opaque base, drop alpha (STYLE rule 6)
    base = C.Image.new("RGBA", (W, H), PAL["asphalt"][2])
    base.alpha_composite(img)
    out = base.convert("RGB")

    C.save_asset(out, "rooms", "cinematic-outro.png")
    C.preview(out, "preview_cinematic-outro.png", scale=3)


if __name__ == "__main__":
    main()
