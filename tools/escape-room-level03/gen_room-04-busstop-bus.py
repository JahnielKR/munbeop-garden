#!/usr/bin/env python3
"""room-04-busstop-bus.png — Zona 4 estado B "el último bus" (320x240).

Dossier §6 Zona 4 estado B (the swap during the outro / the background the
farewellImage freezes over): the SAME composition as room-04-busstop, but the
diegetic clock (L3-c) has run all the way out —
  * the LAST BUS (last_bus) has entered from the LEFT, its windows warm-yellow
    lit, the door OPEN, headlights sweeping the wet asphalt,
  * MORE market neons are OFF (neon_alley dimmed harder — closing hour),
  * a back stall shutter is FULLY DOWN (shutter, most-closed), the stall dark,
  * 도윤 stands by the marquesina, STILL WITH HAIR (this is the scene figure;
    the buzzed-window 도윤 lives only in cinematic-outro — STYLE doyun note).

The market gate arch (시장 입구, illegible neon + bulb garland, L3-a) crowns the
right third (cosmetic `gate`). The bus-stop shelter + metal bench is center-left
(the bench is the `bench` cosmetic). The empty-lane / far-headlights region is
the lower-left (`lane`) — now half-occupied by the arriving bus. No griddle in
this zone, so the warm key is the bus's yellow windows + the gate bulbs against
the cold neon street (the warmth that "guarda el sitio").

Layout (320x240, frontal-flat like every room):
  BACK   : neon_alley receding (DIMMED, closing) + a fully-shuttered dark stall.
  RIGHT  : market_gate arch (시장 입구) — illegible neon + warm bulb garland.
  CENTER : the last_bus body across the left-centre, entering from the left;
           yellow windows, open door, headlight beam low on the asphalt.
  C-LEFT : bus_stop shelter (canopy + post + sign) and 도윤 (with hair) by it.
  LOWER  : the metal bench (bench hotspot) + wet asphalt reflecting the neon.

HOTSPOTS (320x240 space, from the seed level-03.ts):
  doyun [90, 90, 70, 90]  center (125,135) — SLOT 6, the 도윤 FIGURE by the stop
  gate  [215,25, 95, 45]  center (262, 47) — cosmetic, the market arch neon
  bench [65,185, 55, 25]  center (92, 197) — cosmetic, the metal bench
  lane  [10,105, 70, 40]  center (45, 125) — cosmetic, the lane / arriving bus

Uses ONLY common.py builders + helpers (FROZEN). Opaque 320x240 (no alpha 0).
Deterministic: every scatter uses an explicit random.Random(seed).

Run from repo root:  python tools/escape-room-level03/gen_room-04-busstop-bus.py
"""

from __future__ import annotations

import random

import common as C
from common import OUTLINE, PAL, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240
HORIZON = 150            # where the back wall of stalls meets the wet street

# Hotspot rects from the seed (320x240 space).
HOTSPOTS = [
    (90, 90, 70, 90),    # doyun (SLOT 6) — the 도윤 FIGURE by the marquesina
    (215, 25, 95, 45),   # gate  (cosmetic) — the 시장 입구 arch neon
    (65, 185, 55, 25),   # bench (cosmetic) — the metal bench
    (10, 105, 70, 40),   # lane  (cosmetic) — the lane / the arriving bus
]


# ── BACKGROUND: the cold night street, the market closing behind ─────────────

def sky_and_alley(d):
    """The cold night-market backdrop: asphalt wash + receding neon (DIMMED hard).

    State B is the very end of the run — the market is nearly shut, so the
    neon_alley keeps only a few halos lit (L3-c: a halo less per resolved zone,
    here almost all of them out). Veiled with asphalt dither so the upper band
    reads as distant GLOW, never legible strokes (L3-a guard).
    """
    # the deep wet-asphalt night fills the whole frame first (opaque base)
    fill(d, 0, 0, W, H, PAL["asphalt"][2])
    # the covered-market roof, darker, up top
    fill(d, 0, 0, W, 36, PAL["asphalt"][3])
    dither(d, 0, 32, W, 8, PAL["asphalt"][2], phase=0)
    # the market receding in fuga (upper-middle). lit_cols capped VERY low (almost
    # everything dark — closing hour). Same seed-33 family as the other zones.
    C.neon_alley(d, 4, 16, 210, 64, lit_cols=4, seed=33)
    # L3-a guard: knock the crispness off the front (largest) neon rows so they
    # read as distant glow, not legible strokes. Two veils over the front band +
    # one lighter pass over the whole alley so no row resolves into jamo at 1x.
    dither(d, 0, 14, 214, 16, PAL["asphalt"][2], phase=0)
    dither(d, 0, 16, 214, 14, PAL["asphalt"][3], phase=1)
    dither(d, 0, 16, 214, 64, PAL["asphalt"][2], phase=0)
    # a cold vignette in the upper-left so the eye falls to the warm bus + gate
    for y in range(0, 80):
        for x in range(0, 150):
            if (x + y) % 2 != 0:
                continue
            dy = 1.0 - y / 80.0
            dx = 1.0 - x / 150.0
            if ((x * 5 + y * 3) % (8 if (dx + dy) < 0.6 else 3)) == 0:
                d.point((x, y), fill=PAL["asphalt"][3])


def shuttered_stall(d):
    """A back stall on the centre-left, its shutter FULLY DOWN, the stall dark.

    The diegetic clock spent (L3-c): the neighbour has closed for the night. The
    'half' shutter builder is the most-closed state; placed tight so the dark
    closed-stall gap below it reads as a fully shut shop. Its sign is a dead tube.
    """
    # the stall chassis behind, dim + cool (depth). The awning is pulled COOLER so
    # this shut stall doesn't out-bright the warm bus: knock its stripe back.
    C.market_stall(d, 150, 58, w=70, h=58, awning="stripe", bulb=False)
    dither(d, 150, 58, 70, 14, PAL["asphalt"][2], phase=0)   # cool the awning stripe
    dither(d, 150, 58, 70, 14, PAL["asphalt"][3], phase=1)
    dither(d, 150, 72, 70, 44, PAL["asphalt"][2], phase=1)   # push the body back, cold
    # its neon is dead (one of the off halos) — a gray tube on the valance
    C.neon_sign(d, 166, 50, 30, 10, color="pink", lit=False)
    # THE CLOCK SPENT: the metal shutter pulled all the way (the closed shop). Let
    # the builder's corrugation ribs READ (no veil over the curtain — a veil here
    # turns it into a noise block). Only the dark closed-stall gap below sells
    # "shut"; the side rails + ribs read as a rolled-down metal shutter.
    C.shutter(d, 162, 74, w=52, h=44, state="half")
    # a faint cool film ONLY on the lower closed gap (deepen the shut interior)
    dither(d, 163, 104, 50, 14, PAL["asphalt"][3], phase=0)


def far_avenue(d):
    """The avenue opening to the right behind the gate: faint cold depth + a few
    distant headlights, so the street reads as opening OUT past the market."""
    # a faint paler band low on the back wall = the avenue beyond the arch
    dither(d, 214, HORIZON - 18, W - 214, 18, PAL["asphalt"][1], phase=1)
    # a couple of distant cold headlights way down the avenue (tiny, cool)
    for (hx, hy) in ((300, HORIZON - 12), (288, HORIZON - 8)):
        d.point((hx, hy), fill=PAL["gold_light"][2])
        d.point((hx, hy + 1), fill=PAL["ember"][3])


# ── THE MARKET GATE (right third) — the warm arch, cosmetic `gate` ───────────

def gate(d):
    """market_gate arch (시장 입구) crowning the right third — gate [215,25,95,45].

    market_gate(x,y,w,h) draws two columns + a lintel + an illegible neon sign +
    a swag of warm bulbs, spanning ~ (x..x+w, y..y+h). With (217,22,96,46) the
    arch fills the right third and its neon sign + bulb garland center ~ (262,44),
    inside the gate rect [215,25,95,45]. The warmest cold-side element (bulbs +
    pink neon) — the market's '또 오세요' kept glowing at closing.
    """
    C.market_gate(d, 217, 22, w=96, h=46)
    # L3-a guard: the market_gate neon sign reads too crisp at this size (the
    # _neon_strokes clusters look like legible jamo on the clean pink field). Veil
    # ONLY the sign interior (x231..299, y25..37) with a dither of its own ramp +
    # the halo so the strokes melt into glow — still obviously "a lit sign", but
    # no decipherable glyph at 1x. (The bulb garland below is untouched.)
    dither(d, 231, 25, 68, 12, PAL["neon_pink"][1], phase=0)
    dither(d, 231, 25, 68, 12, PAL["neon_pink"][2], phase=1)
    dither(d, 231, 26, 68, 10, PAL["neon_pink"][0], phase=0)
    # the right column foot continues to the street (so the arch is grounded, not
    # floating): a stout post from the column base down to the wet asphalt
    fill(d, 301, 68, 12, HORIZON - 68, PAL["wood_dark"][2])
    vline(d, 301, 68, HORIZON - 68, PAL["wood_dark"][1])
    dither(d, 309, 70, 4, HORIZON - 70, PAL["wood_dark"][3], phase=0)
    frame(d, 301, 68, 12, HORIZON - 68, OUTLINE)
    # the inner column (x~217) also grounded, partly behind the bus
    fill(d, 217, 68, 12, HORIZON - 68, PAL["wood_dark"][2])
    vline(d, 217, 68, HORIZON - 68, PAL["wood_dark"][1])
    frame(d, 217, 68, 12, HORIZON - 68, OUTLINE)
    # warm bulb-spill on the asphalt directly under the arch (soft amber dither)
    for y in range(HORIZON, H):
        for x in range(224, 312):
            if (x + y) % 2 != 0:
                continue
            t = 1.0 - (y - HORIZON) / (H - HORIZON)
            if ((x * 3 + y * 5) % (4 if t > 0.5 else 8)) == 0:
                d.point((x, y), fill=PAL["ember"][3])


# ── THE LAST BUS — entering from the left (the warm yellow key) ──────────────

def the_bus(d):
    """last_bus entering from the LEFT: yellow-lit windows, open door, headlight.

    last_bus(x,y,w,h) draws the body with a rounded nose on the LEFT, a row of
    warm-yellow windows, an OPEN door near the front, two wheels, and a headlight
    glint at the left nose. Placed at (8,80,150,66) the nose sits at the far left
    (the bus 'entering'), the body sweeps across to x~158 behind 도윤's stop. Its
    yellow windows are the warm key of this cold zone. The lower-left lane region
    (lane hotspot [10,105,70,40]) is now occupied by the arriving bus front — the
    cosmetic flavour '마지막 버스예요' reads on the bus itself.
    """
    # a cool contact pool under the whole bus on the wet street first
    dither(d, 10, HORIZON - 2, 150, 6, PAL["asphalt"][3], phase=1)
    C.last_bus(d, 8, 80, w=150, h=66)
    # the headlight beam sweeping the wet asphalt low-left (cool, fanning out) —
    # the builder paints a tiny glint at the nose; extend it as a SOFT low fan so
    # the bus reads as arriving. Sparse checker so it reads as a beam of light,
    # NOT a hard saturated wedge: density fades with distance, the far reach goes
    # cool (asphalt) so it dissolves into the street instead of ending in an edge.
    bcx, bcy = 6, 118
    fan_end = HORIZON + 26
    for y in range(bcy, fan_end):
        spread = 5 + int((y - bcy) * 1.2)
        for x in range(bcx, bcx + spread):
            t = 1.0 - (y - bcy) / (fan_end - bcy)         # 1 near nose -> 0 far
            edge = (x - bcx) / max(spread - 1, 1)         # 0 inner -> 1 outer
            bright = t * (1.0 - 0.7 * edge)               # dim toward the far edge
            # feather the outer 35% of the beam so the diagonal edge dissolves into
            # the wet street instead of ending on a hard hatched line.
            m = (2 if bright > 0.6 else (4 if bright > 0.3 else 8))
            if edge > 0.65:
                m = 8                                     # very sparse at the rim
            if ((x * 3 + y * 5) % m) != 0:
                continue
            c = (PAL["gold_light"][2] if bright > 0.6 else
                 (PAL["ember"][3] if bright > 0.3 else PAL["asphalt"][1]))
            if 0 <= x < W and 0 <= y < H:
                d.point((x, y), fill=c)
    # a small warm pool of light spilling out of the OPEN door onto the asphalt
    # (the door is near the front, x~22 in builder space): a soft amber smear.
    for y in range(HORIZON, H - 8):
        for x in range(18, 40):
            if (x + y) % 2 != 0:
                continue
            t = 1.0 - (y - HORIZON) / (H - 8 - HORIZON)
            if ((x * 3 + y * 7) % (4 if t > 0.5 else 8)) == 0:
                d.point((x, y), fill=PAL["ember"][3] if t < 0.6 else PAL["asphalt"][1])


# ── THE STOP + 도윤 (slot-6) ──────────────────────────────────────────────────

def the_stop(d):
    """bus_stop shelter (marquesina + post + sign + bench), centre-left.

    bus_stop(x,y,w,h) draws a flat canopy on two posts, a hanging route sign, and
    a metal bench at the BOTTOM of its bbox. Placed at (66,96,58,92) the canopy
    rides above 도윤's head and the metal bench lands at the bottom ~ y180, its
    seat centred ~ (92,184) inside the bench hotspot [65,185,55,25] (center
    92,197). Cold street furniture against the warm bus behind.
    """
    C.bus_stop(d, 66, 96, w=58, h=92)
    # a cool contact shadow grounding the shelter posts on the wet asphalt
    drop_shadow(d, 68, HORIZON + 2, 56, 2, cool=True)


def doyun_figure(d):
    """도윤 standing by the marquesina, STILL WITH HAIR — doyun [90,90,70,90].

    doyun(x,y,pose='stand') = the bus-stop silhouette: tall + thin, dark jacket,
    a military duffel on the shoulder, a dark MOP of hair (NOT the buzzed window
    pose — that is outro-only, STYLE doyun note). At origin (104,96) his head
    lands ~y101 and the lanky body mass centres ~ (115,128), inside the doyun
    rect [90,90,70,90] (center 125,135). He stands in FRONT of the open bus door,
    tense, about to board. A warm rim from the bus windows catches his right side.
    """
    dx, dy = 104, 96
    C.doyun(d, dx, dy, pose="stand")
    # the warm yellow bus-window light behind him catches his right shoulder/jaw
    # (the warmth at his back as he's about to leave) — a thin gold rim, no blur
    vline(d, dx + 17, dy + 18, 16, PAL["gold_light"][2])
    d.point((dx + 16, dy + 11), fill=PAL["ember"][2])       # rim on the jaw
    dither(d, dx + 14, dy + 20, 4, 10, PAL["ember"][3], phase=1)
    # a cool contact shadow on the wet asphalt under him
    drop_shadow(d, dx + 2, HORIZON + 4, 18, 2, cool=True)


# ── THE WET STREET (foreground) ──────────────────────────────────────────────

def wet_street(d):
    """The wet black-violet asphalt foreground reflecting the neon, split +
    trembling (wet_reflect). The seam catches a little light; warm bus-window +
    arch reflections on the right, cold neon on the left."""
    fill(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][2])
    dither(d, 0, HORIZON, W, H - HORIZON, PAL["asphalt"][3], phase=0)
    hline(d, 0, HORIZON, W, PAL["asphalt"][1])              # the wet seam glints
    # neon smeared down the wet street. Pink (the dead/few remaining market signs)
    # to the left-centre, cyan in the centre gap, kept CLEAR of the bus body
    # (x8..158) low edge and the bench so they frame, not fight. Right side gets
    # warm reflections from the gate bulbs instead (painted in gate()).
    C.wet_reflect(d, 128, HORIZON + 4, 30, H - HORIZON - 8, color="cyan", seed=4)
    C.wet_reflect(d, 196, HORIZON + 4, 22, H - HORIZON - 8, color="pink", seed=7)
    C.wet_reflect(d, 162, HORIZON + 4, 16, H - HORIZON - 8, color="green", seed=9)
    # a few warm reflections of the bus windows in the wet street, under the body
    r = random.Random(40)
    for _ in range(22):
        rx = r.randint(30, 150)
        ry = r.randint(HORIZON + 4, H - 6)
        if (rx + ry) % 2 == 0:
            d.point((rx, ry), fill=PAL["gold_light"][2])
            d.point((rx, ry + 1), fill=PAL["ember"][3])


# ── compose ──────────────────────────────────────────────────────────────────

def compose():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    sky_and_alley(d)        # cold neon depth (DIMMED — closing)
    shuttered_stall(d)      # the fully-shut neighbour stall (back, centre-left)
    far_avenue(d)           # the avenue opening past the arch (right depth)
    gate(d)                 # the 시장 입구 arch (right third, gate hotspot)
    wet_street(d)           # the wet asphalt floor + neon reflections
    the_bus(d)              # the last bus entering from the left (warm key)
    the_stop(d)             # the marquesina + bench (bench hotspot)
    doyun_figure(d)         # 도윤 with hair, by the stop (doyun / slot-6)
    return img


def main():
    img = compose()
    # opaque guarantee: composite onto an opaque base, drop alpha (STYLE rule 6)
    base = C.Image.new("RGBA", (W, H), PAL["asphalt"][2])
    base.alpha_composite(img)
    out = base.convert("RGB")

    C.save_asset(out, "rooms", "room-04-busstop-bus.png")
    C.preview(out, "preview_room-04-busstop-bus.png", scale=3)
    C.hotspot_debug(out, HOTSPOTS, "hotspot_room-04-busstop-bus.png", scale=3)


if __name__ == "__main__":
    main()
