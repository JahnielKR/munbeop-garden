#!/usr/bin/env python3
"""cosmetic-set-complete-03.png — 🟡 the legendary set «막차 손님», Level 3 (§9).

Dossier §9 (Legendario tier): «El huésped del último bus: avatar con el 호떡
caliente en la mano (el que 이모 le puso "para el camino") envuelto en su
servilleta de papel; marco de neón rosa-verde con guirnalda de bombillas del arco
del mercado; fondo = el plano final, el bus arrancando bajo el neón con 이모 y
하나 despidiéndose en el andén y la plancha echando vapor sola. La calidez del
regreso prometido, para quien se lo ganó.»

This is a SET PREVIEW: it COMPOSES the three reward pieces into ONE 128×128
transparent token, so the player sees the whole legendary set as a single card:

  BG  : the final-shot background — a miniature of the cinematic-outro freeze
        (last_bus pulling out right, its yellow windows + 도윤 buzzed in one;
        이모 + 하나 on the platform, both an arm raised; the lone 호떡 griddle
        still lit + steaming back-left; wet asphalt returning the market neon
        split + trembling). The "fondo = el plano final" of the spec.
  FRAME: a neon pink↔green border (neon_sign-ramp glow bands, never a glyph,
        L3-a) crowned with the market-gate BULB GARLAND (market_gate's swag of
        warm gold_light bulbs on a dipping wire) — the "marco de neón rosa-verde
        con guirnalda de bombillas del arco del mercado".
  AVATAR: in the lower foreground, breaking the frame, the hot 호떡 wrapped in
        its kraft napkin (paper_bag) cradled in a hand — «el 호떡 caliente en la
        mano … envuelto en su servilleta de papel». A browning 호떡 disc peeks
        out of the bag's mouth, warm steam curling off it (the heat 이모 put in
        his hand "para el camino"), so the bag reads as a HELD, OPEN 호떡 봉지.

L3-b ABSOLUTE: this hides NOTHING — no second shadow, no easter egg. The set is
a goodbye-with-promised-reunion at full neon (the legendary you earned). The
only "discovery" is thematic (the 호떡 was always hers), never a hidden visual.

This is a COSMETIC token, not a room: NO hotspots (no hotspot_debug). 128×128
TRANSP — the corners outside the rounded neon frame are alpha 0 so the token
floats on the inventory/UI card.

Uses ONLY common.py builders + helpers (FROZEN): last_bus, doyun(window),
imo(wave), hana(wave), griddle_hotteok, market_stall, neon_alley, neon_sign,
market_gate (its bulb garland), wet_reflect, steam, paper_bag, glow + dither/
fill primitives. The rounded neon frame, the held hand and the bag's open mouth
are asset-local detail painted around those builders (STYLE rule 2).

Deterministic: any scatter uses an explicit seed; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cosmetic-set-complete-03.py
"""

from __future__ import annotations

import random

import common as C
from common import PAL, OUTLINE, AMBER_DEEP, fill, frame, hline, vline, dither, drop_shadow

W = H = 128

# the inner "photo" window the final-shot background lives in (the neon frame
# wraps it; the avatar in the foreground breaks down across its lower edge).
BORDER = 9                       # neon-frame band thickness
WIN_X0, WIN_Y0 = BORDER, BORDER          # 9, 9
WIN_X1, WIN_Y1 = W - BORDER, H - BORDER  # 119, 119
WIN_W = WIN_X1 - WIN_X0          # 110
WIN_H = WIN_Y1 - WIN_Y0          # 110

# inside the window, the miniature final shot uses these landmark rows
SKY_TOP = WIN_Y0                 # 9
HORIZON = 70                     # the wet-street seam inside the window
CURB_Y = 82                      # the platform lip the figures stand on


# ═════════════════════════════════════════════════════════════════════════════
#  LAYER 1 — the final-shot background (a miniature of the cinematic-outro)
# ═════════════════════════════════════════════════════════════════════════════

def bg_sky(d):
    """Cold closing-night backdrop inside the window: asphalt wash + a receding
    neon_alley high across the top (illegible halos, L3-a), veiled hard so the
    warm bus window + the lone griddle read as the only heat (mirrors the outro's
    sky_and_alley, scaled to the 110px window)."""
    fill(d, WIN_X0, WIN_Y0, WIN_W, WIN_H, PAL["asphalt"][2])
    fill(d, WIN_X0, WIN_Y0, WIN_W, 14, PAL["asphalt"][3])      # darker covered roof
    # the market in fuga (upper band), only a few halos lit (closing, L3-c)
    C.neon_alley(d, WIN_X0 + 1, WIN_Y0 + 4, WIN_W - 2, 30, lit_cols=4, seed=33)
    # veil the neon hard so no jamo resolves at 1x (L3-a) — soft distant glow only
    dither(d, WIN_X0, WIN_Y0 + 2, WIN_W, 30, PAL["asphalt"][2], phase=0)
    dither(d, WIN_X0, WIN_Y0 + 4, WIN_W, 28, PAL["asphalt"][3], phase=1)
    dither(d, WIN_X0, WIN_Y0 + 4, WIN_W, 30, PAL["asphalt"][2], phase=0)


def bg_back_stall_and_griddle(d):
    """The 호떡 stall back-left with its lone, still-lit griddle (the heat that
    stays, L3-c/L3-d). market_stall chassis + griddle_hotteok + a tall 1px steam
    wisp — the warmest thing on the platform side, alone (이모 is out waving)."""
    # protagonist 호떡 stall chassis, back-left, pushed UP into the corner so the
    # platform below stays clear for the two waving figures (small, in fuga). It is
    # the warm backdrop the two stand IN FRONT of (their stall — natural depth).
    C.market_stall(d, WIN_X0 + 1, 12, w=42, h=34, awning="stripe", bulb=True)
    # the lone lit griddle on its counter (small, back, the heat that stays lit)
    gx, gy = WIN_X0 + 5, 30
    C.griddle_hotteok(d, gx, gy, w=28, h=16, spatula=True)
    # the lone, tall 1px steam wisp rising clear above the stall (§3 canonical)
    C.steam(d, gx + 13, gy - 1, height=15, phase=2, warm=True)


def bg_platform(d):
    """The pale wet-concrete platform band the two who stay are rooted to (left
    half), a dark curb gap where the bus pulled away on the right."""
    fill(d, WIN_X0, CURB_Y, 56, WIN_Y1 - CURB_Y, PAL["stone"][3])
    dither(d, WIN_X0, CURB_Y, 56, WIN_Y1 - CURB_Y, PAL["asphalt"][2], phase=0)
    hline(d, WIN_X0, CURB_Y, 56, PAL["stone"][2])             # lit curb nosing
    vline(d, WIN_X0 + 55, CURB_Y, WIN_Y1 - CURB_Y, PAL["asphalt"][3])


def bg_the_two(d):
    """이모 + 하나 shoulder to shoulder on the platform, BOTH an arm raised — the
    ones STAYING. imo(wave) = short/round, red kerchief, ember apron; hana(wave) =
    taller/slim, ponytail, tteok apron. ONE cool contact shadow each (L3-b:
    nothing hidden, exactly one grounded shadow).

    The shared figure builders are ~52px tall; in this 110px window they read best
    drawn on a scratch RGBA and shrunk only LIGHTLY (~0.82) so the cross-anchor
    silhouettes (red kerchief, ponytail, raised arms) survive the nearest-neighbour
    shrink. They sit on the platform CLEAR of the back-left griddle stall (which is
    pushed up + back), small against the bus mass to their right."""
    scratch = C.Image.new("RGBA", (52, 60), (0, 0, 0, 0))
    sd = C.ImageDraw.Draw(scratch)
    C.hana(sd, 24, 6, pose="wave")       # 하나 behind/right
    C.imo(sd, 0, 12, pose="wave")        # 이모 in front (overlaps her shoulder)
    sw, sh = 33, 38                      # ~0.63 shrink — SMALL against the bus mass
    sml = scratch.resize((sw, sh), C.Image.NEAREST)
    fx, fy = 17, CURB_Y - sh + 8         # feet at the curb, heads clear of the glow
    # a thin band of cold asphalt just ABOVE the figures' heads, so the griddle's
    # warm glow halo stays attached to the stall (back-left) and does not read as a
    # tan blob hanging over 이모/하나 (it pooled onto their heads at the tighter
    # stacking). Keeps the warm island and the two waving figures as separate reads.
    dither(d, fx - 1, fy - 3, sw + 2, 4, PAL["asphalt"][2], phase=0)
    dither(d, fx - 1, fy - 2, sw + 2, 3, PAL["asphalt"][3], phase=1)
    _paste_alpha(_DRAW_IMG[0], sml, fx, fy)
    # one cool contact shadow per figure on the wet platform under their feet
    # (single grounded shadow each, no second shadow — L3-b).
    feet_y = fy + sh - 1
    drop_shadow(d, fx + 1, feet_y, 12, 2, cool=True)
    drop_shadow(d, fx + 16, feet_y, 11, 2, cool=True)


def bg_bus(d):
    """The last_bus across the RIGHT of the window, already pulling away; 도윤
    buzzed (군대) in one lit yellow window (doyun pose='window'). The big warm
    mass; the two on the platform are small beside it (the shot of those staying).

    last_bus is ~130px wide; the window is ~110px, so the bus is drawn on a
    scratch + shrunk to fit the right two-thirds, then 도윤's bust is painted
    fresh at full pixel scale INTO the chosen window so his buzzed scalp + the
    pink-green neon stripe stay crisp (a shrunk doyun bust would mush)."""
    scratch = C.Image.new("RGBA", (150, 86), (0, 0, 0, 0))
    sd = C.ImageDraw.Draw(scratch)
    C.last_bus(sd, 2, 6, w=138, h=66)
    sml = scratch.resize((116, 68), C.Image.NEAREST)   # ~0.84 shrink — a big mass
    bus_x, bus_y = 54, 26
    # crop the shrunk bus to the window's right portion so the body never spills
    # over the neon frame (its rounded nose enters from the right, the rest is
    # "off-frame to the right" — the bus moving OFF, exactly the spec's read).
    keep_w = WIN_X1 - bus_x                            # visible px to the frame
    sml = sml.crop((0, 0, keep_w, sml.height))
    _paste_alpha(_DRAW_IMG[0], sml, bus_x, bus_y)
    # the dark road gap between the platform curb and the bus (it has pulled away)
    fill(d, bus_x - 4, CURB_Y, 4, WIN_Y1 - CURB_Y, PAL["asphalt"][3])
    # 도윤 RECIÉN RAPADO painted FRESH into a lit window (full pixel scale, crisp):
    # placed in the front window of the visible bus so his buzzed scalp + the
    # pink-green neon stripe stay sharp (a shrunk doyun bust would mush).
    win_x, win_y = bus_x + 16, bus_y + 14
    # a thin warm halo just OUTSIDE the pane so the lit window glows (not on him)
    dither(d, win_x - 2, win_y - 2, 28, 2, PAL["ember"][3], phase=1)
    dither(d, win_x - 2, win_y + 26, 28, 2, PAL["ember"][3], phase=0)
    C.doyun(d, win_x, win_y, pose="window")


def bg_wet_street(d):
    """The wet asphalt foreground inside the window returning the market neon,
    split + trembling (wet_reflect): rojo / verde menta / el rosa que parpadea,
    plus a few warm bus-window + griddle flecks. The whole lower band is the
    mirror (§3) — the warm/loud equivalent of L2's gold mirror."""
    fill(d, WIN_X0, HORIZON, WIN_W, WIN_Y1 - HORIZON, PAL["asphalt"][2])
    dither(d, WIN_X0, HORIZON, WIN_W, WIN_Y1 - HORIZON, PAL["asphalt"][3], phase=0)
    hline(d, WIN_X0, HORIZON, WIN_W, PAL["asphalt"][1])       # wet seam glint
    # neon smeared down the wet road (off the platform concrete, x>64), short
    C.wet_reflect(d, 70, HORIZON + 2, 12, WIN_Y1 - HORIZON - 4, color="pink", seed=3)
    C.wet_reflect(d, 86, HORIZON + 2, 10, WIN_Y1 - HORIZON - 4, color="green", seed=8)
    C.wet_reflect(d, 100, HORIZON + 2, 12, WIN_Y1 - HORIZON - 4, color="cyan", seed=12)
    # a green + pink pair on the platform-side wet curb too (the market behind)
    C.wet_reflect(d, WIN_X0 + 2, CURB_Y + 2, 9, WIN_Y1 - CURB_Y - 4, color="green", seed=9)
    C.wet_reflect(d, 40, CURB_Y + 2, 8, WIN_Y1 - CURB_Y - 4, color="pink", seed=14)
    # a few warm reflections of the bus windows + griddle in the wet road
    r = random.Random(40)
    for _ in range(14):
        rx = r.randint(68, WIN_X1 - 2)
        ry = r.randint(HORIZON + 2, WIN_Y1 - 2)
        if (rx + ry) % 2 == 0:
            d.point((rx, ry), fill=PAL["gold_light"][2])
            d.point((rx, ry + 1), fill=PAL["ember"][3])


# ═════════════════════════════════════════════════════════════════════════════
#  LAYER 2 — the neon pink↔green frame + the market-gate bulb garland
# ═════════════════════════════════════════════════════════════════════════════

def frame_neon(d):
    """A neon pink↔green border ring around the window (glow by ramp bands, never
    a glyph, L3-a). Each rail is a clean stack — a bright 2px tube + a thin halo
    band on its OUTER side only (toward the token edge) — so the glow bleeds
    OUTWARD and never floods the photo. Pink on the TOP+LEFT (warm-market side),
    green on the BOTTOM+RIGHT, the ring a «marco de neón rosa-verde» sweep."""
    pink_c, pink_lo, pink_h = PAL["neon_pink"][1], PAL["neon_pink"][2], PAL["neon_pink"][3]
    grn_c, grn_lo, grn_h = PAL["neon_green"][1], PAL["neon_green"][2], PAL["neon_green"][3]
    core = PAL["white"][0]
    tube = 5                      # the bright tube runs at inset `tube` from the edge

    # --- the bright tube of each rail (2px: a saturated neon line + a white spine)
    # top (pink): tube row at y=tube, white spine just below
    hline(d, tube, tube, W - 2 * tube, pink_c)
    hline(d, tube + 1, tube + 1, W - 2 * tube - 2, core)
    # left (pink)
    vline(d, tube, tube, H - 2 * tube, pink_c)
    vline(d, tube + 1, tube + 1, H - 2 * tube - 2, core)
    # bottom (green)
    hline(d, tube, H - tube - 1, W - 2 * tube, grn_c)
    hline(d, tube + 1, H - tube - 2, W - 2 * tube - 2, core)
    # right (green)
    vline(d, W - tube - 1, tube, H - 2 * tube, grn_c)
    vline(d, W - tube - 2, tube + 1, H - 2 * tube - 2, core)

    # --- a THIN outward halo band (2px) on the OUTER side of each tube only, so
    # the glow bleeds toward the token edge and the photo stays clean. Dithered
    # bands of the ramp (glow by bands, never blur — STYLE rule 3).
    for yy in (tube - 2, tube - 1):                       # top, outward (up)
        dither(d, 3, yy, W - 6, 1, pink_lo if yy == tube - 1 else pink_h, phase=yy % 2)
    for xx in (tube - 2, tube - 1):                       # left, outward (left)
        dither(d, xx, 3, 1, H - 6, pink_lo if xx == tube - 1 else pink_h, phase=xx % 2)
    for yy in (H - tube, H - tube + 1):                   # bottom, outward (down)
        dither(d, 3, yy, W - 6, 1, grn_lo if yy == H - tube else grn_h, phase=yy % 2)
    for xx in (W - tube, W - tube + 1):                   # right, outward (right)
        dither(d, xx, 3, 1, H - 6, grn_lo if xx == W - tube else grn_h, phase=xx % 2)

    # --- the four corner glow knots where pink meets green (a bright catch)
    for (cx, cy) in ((tube, tube), (W - tube - 1, tube),
                     (tube, H - tube - 1), (W - tube - 1, H - tube - 1)):
        d.point((cx, cy), fill=core)
    # crisp inner outline closing the photo window (warm-black, never #000)
    frame(d, WIN_X0 - 1, WIN_Y0 - 1, WIN_W + 2, WIN_H + 2, OUTLINE)


def frame_bulb_garland(d):
    """The market-gate BULB GARLAND swagging across the TOP of the frame (the
    «guirnalda de bombillas del arco del mercado»). Reuses market_gate's exact
    idiom: a dipping wire (ink) strung with warm gold_light bulbs that each catch
    a white highlight — the warm arch lights crowning the neon set."""
    # a swag of warm bulbs dipping across the top neon rail (market_gate idiom).
    n = 9
    x0, x1 = 8, W - 8
    span = x1 - x0
    top_y = 6
    sag = 5                      # how deep the wire dips in the middle
    prev = None
    for i in range(n + 1):
        gx = x0 + i * span // n
        # the swag dips lowest at the centre (a cosine-ish parabola)
        t = (i - n / 2) / (n / 2)
        gy = top_y + int(sag * (1 - t * t))
        if prev is not None:
            d.line([prev[0], prev[1], gx, gy], fill=PAL["ink"][2])   # the wire
        prev = (gx, gy)
        # each warm bulb (gold_light core + ember rim + a white catch-light)
        d.ellipse([gx - 1, gy, gx + 1, gy + 3], fill=PAL["gold_light"][1],
                  outline=PAL["ember"][2])
        d.point((gx, gy + 1), fill=PAL["white"][0])
        # a tiny warm halo so each bulb glows against the cold neon rail
        d.point((gx - 1, gy + 1), fill=PAL["gold_light"][0])
        d.point((gx + 1, gy + 1), fill=PAL["gold_light"][0])


# ═════════════════════════════════════════════════════════════════════════════
#  LAYER 3 — the avatar: the hot 호떡 wrapped in its napkin, cradled in a hand
# ═════════════════════════════════════════════════════════════════════════════

def avatar_held_hotteok(d):
    """The hot 호떡 wrapped in its kraft napkin, cradled in a hand, breaking the
    frame in the lower-centre foreground (the «호떡 caliente en la mano … envuelto
    en su servilleta de papel», the one 이모 put there «para el camino»).

    Built from common.paper_bag (the shared 호떡 봉지) with a browning 호떡 disc
    peeking from its open mouth + warm steam, cradled in a simple hand below — so
    it reads as a HELD, OPEN bag of hot 호떡, the warmest foreground element (the
    heat in his hand). It sits IN FRONT of the neon frame's lower-centre (the set
    'breaks' its own frame, as legendary tokens do) and casts ONE warm shadow."""
    bag_x, bag_y, bag_w, bag_h = 60, 88, 26, 30
    # ONE warm contact shadow on the held hand region (L3-b: nothing hidden, one
    # grounded shadow) — drawn first, under the hand.
    drop_shadow(d, bag_x + 2, bag_y + bag_h + 2, bag_w - 4, 2)

    # the cradling hand under the bag (a warm skin cup the bag sits in), drawn
    # BEFORE the bag so the bag overlaps the fingers (held, not floating).
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    hand_cx = bag_x + bag_w // 2
    hand_y = bag_y + bag_h - 4
    # the palm: a rounded cup
    d.ellipse([hand_cx - 12, hand_y, hand_cx + 12, hand_y + 12], fill=skin,
              outline=OUTLINE)
    dither(d, hand_cx + 3, hand_y + 3, 8, 8, skin_sh, phase=0)   # shade right
    # four fingers curling up the front of the bag (cradling it)
    for i, fx in enumerate(range(hand_cx - 9, hand_cx + 8, 5)):
        fh = 6 + (1 if i % 2 == 0 else 0)
        fill(d, fx, hand_y - fh + 2, 4, fh, skin)
        hline(d, fx, hand_y - fh + 2, 4, PAL["wood_light"][0])
        frame(d, fx, hand_y - fh + 2, 4, fh, OUTLINE)
        dither(d, fx + 2, hand_y - fh + 4, 2, fh - 3, skin_sh, phase=0)
    # a thumb wrapping in from the left
    fill(d, hand_cx - 13, hand_y - 2, 4, 6, skin)
    frame(d, hand_cx - 13, hand_y - 2, 4, 6, OUTLINE)

    # the 호떡 봉지 itself (the shared paper_bag builder), cradled in the hand
    C.paper_bag(d, bag_x, bag_y, w=bag_w, h=bag_h, stamped=True)

    # the open MOUTH of the bag + a browning 호떡 disc peeking out, steaming (so it
    # reads as a HELD HOT 호떡, not a closed grocery sack). The disc sits over the
    # bag's crumpled top lip; warm steam curls up from it.
    _peeking_hotteok(d, hand_cx, bag_y + 3)


def _peeking_hotteok(d, cx, cy):
    """A browning 호떡 disc rising out of the bag's open mouth + warm steam.

    A hand-scaled twin of common._hotteok_disc (which is fixed at r=7): a golden
    gold_light dome with a browned AMBER_DEEP rim, an ember underside tucked into
    the bag, and a molten-sugar catch-light centre — the recognizable 호떡, hot in
    hand. Warm steam (common.steam) curls off it (the heat «para el camino»)."""
    body, body_hi = PAL["gold_light"][2], PAL["gold_light"][0]
    rim = AMBER_DEEP
    r = 9
    # the dough dome (only the TOP shows above the bag mouth; the base is hidden)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=body, outline=OUTLINE)
    d.ellipse([cx - r + 1, cy - r + 1, cx + r - 1, cy + r - 1], outline=rim)
    # the browned underside dithered into the bag's mouth (no hard waterline)
    dither(d, cx - r + 2, cy + 2, 2 * r - 4, 5, PAL["ember"][2], phase=0)
    dither(d, cx - r + 3, cy + 5, 2 * r - 6, 3, rim, phase=1)
    # a lit dome edge (the bulb/griddle catch on the dough)
    for k in range(-r + 3, r - 3):
        ty = cy - r + 1 + (k * k) // (2 * r)
        d.point((cx + k, ty), fill=body_hi)
    # the molten-sugar burst at the centre (the recognizable hot detail)
    d.point((cx, cy - 2), fill=body_hi)
    d.point((cx - 1, cy - 1), fill=PAL["white"][0])
    d.point((cx + 1, cy - 1), fill=PAL["gold_light"][0])
    d.point((cx, cy), fill=PAL["ember"][0])
    # warm steam curling off the hot 호떡 (continuous wisps, never specks)
    C.steam(d, cx - 3, cy - r - 1, height=14, phase=0, warm=True)
    C.steam(d, cx + 4, cy - r, height=12, phase=4, warm=True)


# ═════════════════════════════════════════════════════════════════════════════
#  paste + corner-rounding helpers (asset-local; the builders stay frozen)
# ═════════════════════════════════════════════════════════════════════════════

_DRAW_IMG = [None]               # the working image, so scratch-pastes can blit it


def _paste_alpha(base: "C.Image.Image", sprite: "C.Image.Image", x: int, y: int) -> None:
    """Alpha-composite a small sprite onto base at (x,y) (nearest-neighbour shrink
    output) — used to fit the ~52px figure / ~130px bus builders into the 110px
    window without touching the FROZEN builders."""
    base.alpha_composite(sprite, (x, y))


def _clip_window(img: "C.Image.Image") -> None:
    """Force every pixel OUTSIDE the photo window back to transparent, so a pasted
    figure/bus that overran the window edge can't poke under the neon frame. Called
    after the background layers, before the frame is drawn. (The avatar is drawn
    AFTER the frame and is allowed to break out of the window into the lower band.)
    """
    px = img.load()
    for y in range(H):
        for x in range(W):
            if not (WIN_X0 <= x < WIN_X1 and WIN_Y0 <= y < WIN_Y1):
                px[x, y] = (0, 0, 0, 0)


def _round_corners(img: "C.Image.Image") -> None:
    """Bite the four outer corners transparent so the neon frame reads as a
    rounded token (a legendary set card), not a hard square. A small fixed radius,
    deterministic. Only touches the outermost corner pixels (outside the tube)."""
    px = img.load()
    rad = 6
    for cx, cy, sx, sy in ((0, 0, 1, 1), (W - 1, 0, -1, 1),
                           (0, H - 1, 1, -1), (W - 1, H - 1, -1, -1)):
        for dy in range(rad):
            for dx in range(rad):
                if dx + dy < rad - 1:                # the corner triangle
                    px[cx + sx * dx, cy + sy * dy] = (0, 0, 0, 0)


# ═════════════════════════════════════════════════════════════════════════════
#  compose
# ═════════════════════════════════════════════════════════════════════════════

def build() -> "C.Image.Image":
    img, d = C.new_canvas(W, H)          # fully transparent token canvas
    _DRAW_IMG[0] = img
    # LAYER 1 — the final-shot background, inside the window
    bg_sky(d)
    bg_back_stall_and_griddle(d)
    bg_wet_street(d)
    bg_platform(d)
    bg_the_two(d)                        # 이모 + 하나 waving (pasted, shrunk)
    bg_bus(d)                            # the last bus + 도윤 buzzed (pasted + fresh)
    _clip_window(img)                    # nothing spills under the frame from the bg
    # LAYER 2 — the neon pink/green frame + the gate bulb garland
    frame_neon(d)
    frame_bulb_garland(d)
    # LAYER 3 — the avatar: the held, wrapped hot 호떡 (breaks the frame)
    avatar_held_hotteok(d)
    # round the outer corners (a legendary token card, not a hard square)
    _round_corners(img)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-set-complete-03.png")
    C.preview(img, "preview_cosmetic-set-complete-03.png", scale=3)
    # composite over a light + dark card so the transparent corners + the neon
    # frame contrast can be judged the way the UI will show the token.
    for tag, bg in (("light", (246, 239, 226, 255)), ("dark", (20, 18, 36, 255))):
        card = C.Image.new("RGBA", (W, H), bg)
        card.alpha_composite(img)
        C.save_out(card.resize((W * 3, H * 3), C.Image.NEAREST),
                   f"card_set-complete-03_{tag}_3x.png")


if __name__ == "__main__":
    main()
