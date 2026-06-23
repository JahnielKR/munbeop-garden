#!/usr/bin/env python3
"""room-04-busstop.png (320x240, OPAQUE) — Zona 4 · 버스 정류장 / 시장 입구.

§6 Zona 4 spec, estado A "el bus todavía no": the edge of the market, where the
warm stalls give way to the cold street. Right third: the market entrance ARCH
(시장 입구, market_gate) with its illegible suggested-hangul neon sign + a garland
of bulbs crossing the frame. Center-left: the bus-stop shelter (marquesina +
poste + metal bench, bus_stop). 도윤 stands next to the bench, STILL WITH HAIR, a
military duffel on his shoulder, tense silhouette — the slot-6 figure. Beside him,
순자 이모, and a step further 하나, waiting to see him off: warm market silhouettes
against the blue-black street. Background: wet asphalt opening toward the avenue,
distant headlights, market neon reflected in puddles. The last griddle's steam
drifts in from the right edge. No bus yet: the empty lane, bright with recent rain.
Palette: amber from the arch bulbs on the right; night-blue + headlights at the
far left.

Hotspots (from the seed level-03.ts, 320x240 space):
  doyun [90,90,70,90]   slot-6   (도윤 + the marquesina) -> center (125,135)
  gate  [215,25,95,45]  cosmetic (the entrance arch)    -> center (262,47)
  bench [65,185,55,25]  cosmetic (the metal bench)       -> center (92,197)
  lane  [10,105,70,40]  cosmetic (empty lane / faraway headlights) -> center (45,125)

Art bible: tools/escape-room-level03/STYLE.md (L3-a..e). Uses ONLY common.py
builders + helpers (FROZEN). L3-d: no griddle in scene, so the warm key here is
the arch's bulb garland (right) + a sliver of the last stall's steam; the rest is
cold neon over wet asphalt. L3-a: every neon sign is suggested strokes, illegible.
L3-e: 100% mundane — the bus is simply the last one; nothing hidden (L3-b).

Deterministic: no unseeded random (every scatter uses an explicit seed).
Run from repo root:  python tools/escape-room-level03/gen_room-04-busstop.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, NEON_REFLECT, fill, frame, hline, vline, dither

W, H = 320, 240

HOTSPOTS = [
    (90, 90, 70, 90),     # doyun -> slot-6
    (215, 25, 95, 45),    # gate  -> cosmetic
    (65, 185, 55, 25),    # bench -> cosmetic
    (10, 105, 70, 40),    # lane  -> cosmetic
]


# ── Background: the street edge opening to the avenue ─────────────────────────

def paint_backdrop(d) -> None:
    """Night-violet sky -> the market neon receding on the right -> wet street."""
    # the deep night-violet base
    fill(d, 0, 0, W, H, PAL["asphalt"][3])
    fill(d, 0, 0, W, 64, PAL["asphalt"][3])
    dither(d, 0, 54, W, 22, PAL["asphalt"][2], phase=0)   # faint sky toward the glow
    # the market continues on the RIGHT (behind the arch): a band of illegible
    # neon signs in fuga, the alley we are leaving. Kept SMALL + HIGH + half-dark
    # (closing time, L3-c) and veiled with night so no single sign reads as a
    # glyph (L3-a) — it must be "a far row of signs", never characters.
    C.neon_alley(d, 178, 10, 142, 36, lit_cols=4, seed=51)
    # a veil of night over the alley band so the lit signs bleed/dim into the
    # dark (knocks the per-sign contrast down: light, not text — L3-a). Two
    # passes + a solid clip of the very top rows so no sign pokes above as a glyph.
    fill(d, 174, 0, 148, 10, PAL["asphalt"][3])           # clip the topmost row
    dither(d, 174, 0, 148, 48, PAL["asphalt"][2], phase=0)
    dither(d, 174, 0, 148, 48, PAL["asphalt"][3], phase=1)
    # ONE dim closed stall on the far right with its shutter already half-down
    # (the diegetic clock, L3-c) so the market reads as CLOSING behind the arch.
    _closing_stall(d)
    # the wet asphalt street floor begins ~y=150
    fill(d, 0, 150, W, H - 150, PAL["asphalt"][2])
    dither(d, 0, 150, W, 16, PAL["asphalt"][3], phase=1)  # into the wet
    fill(d, 0, 200, W, H - 200, PAL["asphalt"][3])        # deep foreground pool


def _closing_stall(d) -> None:
    """A background stall on the far right, shutter half-down (the clock, L3-c)."""
    # a dim warm awning slab over a dark closed mouth, behind/right of the arch
    bx, by, bw = 286, 70, 34
    fill(d, bx, by, bw, 6, PAL["wood_dark"][2])
    hline(d, bx, by, bw, PAL["wood_dark"][1])
    fill(d, bx, by + 6, bw, 44, PAL["asphalt"][2])
    dither(d, bx, by + 6, bw, 44, PAL["asphalt"][3], phase=0)
    # the half-down metal shutter (this stall is already closing)
    C.shutter(d, bx + 2, by + 6, w=bw - 4, h=44, state="half")


# ── The empty lane on the left (the lane hotspot) ────────────────────────────

def paint_lane(d) -> None:
    """The empty road opening left: a far curb, lane line, distant headlights.

    The lane hotspot is [10,105,70,40] (center ~45,125): the empty bright lane
    with two faraway headlights coming up the avenue (no bus yet). Drawn so the
    headlights + the road's vanishing fall inside that rect.
    """
    # the avenue recedes to a vanishing point at the upper-left horizon (~x40,y120)
    vp = (40, 120)
    # the far curb / building line on the left, dark and low
    fill(d, 0, 108, 78, 6, PAL["asphalt"][3])
    hline(d, 0, 108, 78, PAL["asphalt"][1])
    dither(d, 0, 100, 78, 10, PAL["asphalt"][2], phase=0)   # dim far buildings
    # a couple of cold far neon dots on the distant avenue (other shops, tiny)
    for (gx, gy, col) in ((14, 102, "cyan"), (58, 98, "pink"), (30, 96, "green")):
        d.point((gx, gy), fill=PAL["neon_" + col][1])
        d.point((gx, gy + 1), fill=PAL["neon_" + col][3])
    # the road surface widening from the vanishing point toward us (a wet sheen,
    # not a solid ramp): a dithered wedge so it reads as reflective asphalt.
    for yy in range(114, 152):
        t = (yy - 114) / 38.0
        half = int(2 + t * 46)
        cx = vp[0] + int(t * 30)                            # road drifts right as it nears
        x0 = max(0, cx - half)
        x1 = min(150, cx + half)
        d.line([x0, yy, x1, yy], fill=PAL["asphalt"][2])
        dither(d, x0, yy, x1 - x0 + 1, 1, PAL["asphalt"][1], phase=yy % 2)
        d.point((x0, yy), fill=PAL["asphalt"][1])           # soft curb edge
        d.point((x1, yy), fill=PAL["asphalt"][1])
    # the dashed center lane line running to the vanishing point (perspective)
    for i, yy in enumerate(range(118, 150, 5)):
        t = (yy - 114) / 38.0
        cx = vp[0] + int(t * 30)
        ln = 1 + int(t * 3)
        fill(d, cx, yy, max(1, ln // 2 + 1), ln, PAL["wood_light"][2])
    # the two distant headlights of the approaching avenue traffic (NOT the bus —
    # the bus has not come yet; these are far cars, cold and small)
    for (hx, hy) in ((36, 122), (44, 124)):
        C.glow(d, hx, hy, 4, [PAL["gold_light"][2], PAL["gold_light"][1], PAL["white"][0]])
        d.point((hx, hy), fill=PAL["white"][0])
    # the headlight beams smearing low on the wet road (cool, short)
    for k in range(6):
        d.point((38 + k, 128 + k // 2), fill=PAL["gold_light"][2])


# ── The market entrance arch (the gate hotspot, right third) ─────────────────

def paint_gate(d) -> None:
    """The 시장 입구 arch on the right: illegible neon sign + bulb garland.

    market_gate is ~95x45, (x,y)=top-left. Hotspot gate=[215,25,95,45] (center
    262,47). Place the arch so its neon sign + lintel sit centered in that rect:
    x=212 -> arch spans 212..307, sign centered ~262. The garland of bulbs swags
    down across the frame from the lintel (the warm light on the right, L3-d).
    """
    # the arch rooted on the right, columns going down into the market mouth
    C.market_gate(d, 212, 24, w=95, h=45)
    # veil the arch's neon sign so its suggested strokes bleed into glow and do
    # NOT read as a legible glyph row (L3-a): the gate sign region is
    # x=226..279, y=27..39 (market_gate draws neon_sign at x+14, y+3, w-28, 12).
    # Melt the strokes into a soft pink GLOW (L3-a: "glow sin glifo legible") by
    # nearly-solid dither passes of pink mids over the whole sign box — the result
    # reads as a lit pink sign bleeding light, with no decipherable structure.
    dither(d, 226, 27, 54, 13, PAL["neon_pink"][2], phase=0)
    dither(d, 226, 27, 54, 13, PAL["neon_pink"][2], phase=1)
    dither(d, 227, 29, 52, 9, PAL["neon_pink"][1], phase=0)  # a brighter glow core
    dither(d, 227, 29, 52, 9, PAL["neon_pink"][3], phase=1)  # broken so it's not flat
    # the rightmost stroke cluster of the gate's neon poked through as a glyph;
    # melt that column specifically so the sign is pure glow (L3-a), no character.
    dither(d, 272, 27, 8, 13, PAL["neon_pink"][2], phase=0)
    dither(d, 272, 27, 8, 13, PAL["neon_pink"][2], phase=1)
    # a faint pink halo bleeding out past the housing into the lintel (glow, L3-d)
    dither(d, 224, 25, 58, 17, PAL["neon_pink"][3], phase=1)
    # extend the right column down to the ground so the arch is planted, not
    # floating (market_gate draws columns only within its 45px bbox)
    for cx0 in (212, 295):
        fill(d, cx0, 69, 12, 78, PAL["wood_dark"][2])
        vline(d, cx0, 69, 78, PAL["wood_dark"][1])
        dither(d, cx0 + 8, 71, 4, 74, PAL["wood_dark"][3], phase=0)
        frame(d, cx0, 69, 12, 78, OUTLINE)
        C.drop_shadow(d, cx0, 145, 12, 2, cool=True)
    # a warm dim market mouth glimpsed THROUGH the arch (the alley we are leaving)
    fill(d, 226, 70, 68, 70, PAL["asphalt"][2])
    dither(d, 226, 70, 68, 70, PAL["wood_dark"][3], phase=0)
    # a couple of warm customer silhouettes lingering inside the gate
    for sx in (240, 262, 278):
        d.ellipse([sx, 118, sx + 5, 126], fill=PAL["asphalt"][3])
        d.polygon([(sx - 1, 126), (sx + 6, 126), (sx + 7, 140), (sx - 2, 140)],
                  fill=PAL["asphalt"][3])
    # a small warm bulb deep in the mouth so the market still glows behind them,
    # on a short cord from the lintel (a fixture, not a floating ball, L3-e)
    vline(d, 260, 70, 36, PAL["ink"][2])                  # the cord up to the lintel
    C.glow(d, 260, 112, 5, [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][2]])
    d.ellipse([258, 109, 262, 114], fill=PAL["gold_light"][0], outline=PAL["ember"][2])
    d.point((260, 111), fill=PAL["white"][0])


# ── The bus-stop shelter + bench (the bench hotspot, center-left) ─────────────

def paint_stop(d) -> None:
    """The bus-stop shelter: canopy + post + sign + metal bench (cold furniture).

    bus_stop is ~46x60, (x,y)=top-left; the bench sits at its bottom (by=y+h-8).
    The bench hotspot is [65,185,55,25] (center 92,197). With x=70,y=145: the
    shelter bench lands at by=145+60-8=197, center ~ x=70+23=93 -> ON the rect.
    The canopy top at y=145 sits below the doyun rect (90,90,70,90 -> 90..180);
    도윤 stands to the RIGHT of the post, inside his rect.
    """
    C.bus_stop(d, 70, 145, w=46, h=60)


# ── The three figures: 도윤 (slot-6), 이모, 하나 seeing him off ────────────────

def paint_people(d) -> None:
    """도윤 by the bench (slot-6, WITH HAIR + duffel), 이모 + 하나 a step behind.

    도윤 (stand) is ~22x52, body column at x+11. Hotspot doyun=[90,90,70,90]
    (center 125,135). Place his top-left at x=114,y=92 -> body column ~125, head
    ~y97, feet ~y142: centered in the rect, standing right of the shelter post.
    이모 (~28x54) + 하나 (~22x52) wait a step further right, warmer, smaller in the
    blue dark — the whole market came to see him off. They sit OUTSIDE the doyun
    rect (to its right) so the slot-6 trigger stays 도윤 alone.
    """
    # 이모 a step behind-right of 도윤 (warm apron, her identity kerchief). Placed
    # so her body (ellipse from x+2) clears the doyun rect right edge (=160), and
    # a step DEEPER (lower-right) so she reads as waiting-a-step-beyond, not as the
    # focal mass over 도윤 (the slot-6 figure stays the brightest-lit, nearest).
    C.imo(d, 164, 100, pose="griddle")
    # 하나 a step further right still (ponytail, tteok apron)
    C.hana(d, 194, 102, pose="serve")
    # 도윤 front-and-center by the bench, the slot-6 figure (drawn last = on top).
    # FOCAL LIGHT POOL: a soft warm radial halo behind/around him (the arch's bulb
    # garland + the bus-stop's own light spilling down) so the thin dark figure
    # becomes the highest-contrast element and pops off the blue-black street.
    # Dithered, warm, densest at his core and fading out (NOT a hard cone).
    hcx, hcy = 125, 118
    for yy in range(96, 150):
        for xx in range(102, 150):
            if (xx + yy) % 2 != 0:
                continue
            dxn = (xx - hcx) / 24.0
            dyn = (yy - hcy) / 28.0
            t = 1.0 - (dxn * dxn + dyn * dyn)
            if t <= 0:
                continue
            m = 3 if t > 0.5 else (5 if t > 0.2 else 9)
            if ((xx * 3 + yy * 5) % m) == 0:
                d.point((xx, yy), fill=PAL["ember"][3])
    # a faint warm rim down his left side (the arch bulbs catch him) so the thin
    # dark figure separates cleanly from the night void.
    for yy in range(102, 140):
        d.point((112, yy), fill=PAL["ember"][3])
    C.doyun(d, 114, 92, pose="stand")
    # the warm griddle/bulb key catches the underside of his duffel + a hand
    d.point((128, 122), fill=PAL["ember"][2])             # duffel under-rim
    d.point((116, 124), fill=PAL["gold_light"][2])        # the strap hand, lit


# ── Foreground: wet asphalt returning the neon + the last griddle's steam ────

def paint_wet(d) -> None:
    """Wet asphalt foreground: the arch's warm bulbs + the cold avenue, smeared.

    The right foreground catches the arch's amber bulbs; the left foreground the
    cold cyan of the avenue. The empty lane stays darkest (no bus light yet).
    """
    # the warm reflection of the arch's bulbs, lower-right (amber via pink ramp)
    C.wet_reflect(d, 226, 206, 80, 32, color="pink", seed=11)
    _amber_glints(d, 230, 210, 72, 24)
    # the cold avenue reflected lower-left + under the shelter
    C.wet_reflect(d, 8, 208, 64, 30, color="cyan", seed=3)
    C.wet_reflect(d, 96, 210, 70, 28, color="green", seed=17)
    # bright bulb glints where the garland hits the still water (right side)
    for (gx, gy) in ((240, 220), (272, 224), (290, 216)):
        d.point((gx, gy), fill=PAL["gold_light"][1])
        d.point((gx + 1, gy + 1), fill=PAL["ember"][1])


def _amber_glints(d, x: int, y: int, w: int, h: int) -> None:
    """Warm amber speckle in the right puddle (the arch garland's reflection)."""
    r = __import__("random").Random(91)
    for yy in range(y, y + h):
        t = (yy - y) / max(h - 1, 1)
        c = PAL["gold_light"][2] if t < 0.3 else (PAL["ember"][2] if t < 0.6
                                                  else PAL["asphalt"][1])
        for _ in range(2):
            xx = r.randint(x, x + w - 1)
            if (xx + yy) % 3 != 0:
                d.point((xx, yy), fill=c)


def paint_steam(d) -> None:
    """The last griddle's steam drifting in from the RIGHT edge (§6: 'vapor de la
    ultima plancha entrando por el borde derecho'). The griddle never goes dark
    (L3-c) — its warmth touches even the street edge."""
    C.steam(d, 312, 150, height=24, phase=0, warm=True)
    C.steam(d, 317, 158, height=18, phase=3, warm=True)
    C.steam(d, 308, 146, height=20, phase=5, warm=True)


# ── Compose ──────────────────────────────────────────────────────────────────

def build() -> "C.Image.Image":
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][3])
    paint_backdrop(d)
    paint_lane(d)
    paint_gate(d)
    paint_stop(d)
    paint_people(d)
    paint_wet(d)
    paint_steam(d)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "rooms", "room-04-busstop.png")
    C.preview(img, "preview_room-04-busstop.png", scale=3)
    C.hotspot_debug(img, HOTSPOTS, "hotspot_room-04-busstop.png", scale=3)


if __name__ == "__main__":
    main()
