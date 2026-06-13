#!/usr/bin/env python3
"""room-04-jongnu-clear.png — 종루 bell pavilion, STATE B «claros + vapor».

Dossier §6 Cuarto 4 STATE B (variant swapped in during the exit sequence): the
SAME composition as room-04-jongnu (open 종루, the bronze 범종 center-right, the
당목 striker on its rope at hand height, 우담 beside it on the rope, the painted
beam-inscription overhead, the valley beyond the eaves, wet plank floor) — but
the rain is DYING. So vs state A:
  · rain_curtain  → rain_clear (dripping eaves + 1px steam from the wet stones)
  · the valley sky gains ROSE_GOLD breaks in the clouds at the back
  · the floor reflections are LIT (warm, the first warmth touching the wood)
Same bell_beom, dangmok, posts, beam, same camera. Mood: the rain dying, first
warmth. Kept quiet — NO rainbow, NO sun-blast (STYLE: melancolía luminosa).

Layout (320×240, frontal-flat like every room):
  TOP   : the tiled eave + the painted cross-beam carrying the master's
          inscription — SUGGESTED brush strokes, ILLEGIBLE at 1× (rule L2-c).
          beam-inscription cosmetic [70,24,180,30], center (160,39).
  LEFT  : an opening between two posts onto the mountain valley; rose-gold cloud
          breaks behind grey ridges. valley cosmetic [10,70,90,60], center (55,100).
  CENTER: the 당목 striker log on its rope + 우담 (monk, gassho) at the rope —
          the farewell. bell-rope SLOT6 [120,100,80,80], center (160,140).
  RIGHT : the bronze 범종 hanging heavy, a last shiver of glint on its lip.
  FLOOR : wet plank deck, drips off the eave, steam rising off the courtyard
          stones, the reflections now warmed by the breaking light.

Shared builders: bell_beom, dangmok, monk(gassho), rain_clear, drop_shadow,
hanji/wood/dither primitives. Everything else (eave, posts, beam ground, valley
ridges, courtyard stones, the rope) is asset-local detail painted AROUND them.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-04-jongnu-clear.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, ROSE_GOLD, RAIN_DEEP, fill, frame, hline,
                    vline, dither, drop_shadow)

W, H = 320, 240
FLOOR_Y = 150            # plank-deck seam (STYLE: y≈140–155)
EAVE_Y = 56              # underside of the eave / steam settles around here

# Hotspot rects from the seed (320×240 space) — confirmed against STYLE table.
RECTS = [
    (120, 100, 80, 80),  # bell-rope / 당목 / 우담  (SLOT6)
    (70, 24, 180, 30),   # beam inscription (cosmetic)
    (10, 70, 90, 60),    # valley (cosmetic)
]


# ── BACK: the open pavilion void + the valley with rose-gold cloud breaks ─────

def paint_sky_and_valley(d):
    """Open 종루: no walls. A pale post-rain sky; rose-gold breaking the clouds.

    The whole back is the wet outdoors. State B: the cloud bank is parting, so a
    band of ROSE_GOLD warmth glows low behind the grey ridges (kept to the back
    of the valley, NOT a sun-blast). The valley hotspot [10,70,90,60] frames the
    left ridges; its warmth is brightest there so 'the rain dying' reads.
    """
    # base sky — a cold pale grey-rain wash, lighter toward the horizon
    fill(d, 0, 0, W, FLOOR_Y, PAL["rain"][2])
    dither(d, 0, 0, W, 30, PAL["rain"][3], phase=0)          # darker high ceiling-side
    fill(d, 0, EAVE_Y, W, FLOOR_Y - EAVE_Y, PAL["rain"][1])  # brighter low sky
    dither(d, 0, EAVE_Y, W, 18, PAL["rain"][2], phase=1)     # soft mid gradient
    # --- the rose-gold break in the clouds: a warm glow LOW in the sky, sitting in
    # the gap just ABOVE the far ridge crest (so the ridges silhouette against it),
    # strongest over the valley (left), thinning toward the bell side (right).
    band_y = 74
    for i in range(40):                                      # left→right falloff
        x = i * 8
        if x < 150:
            hh = 16 - (x // 16)
        else:
            hh = max(0, 6 - (x - 150) // 30)
        if hh <= 0:
            continue
        fill(d, x, band_y, 8, hh, ROSE_GOLD)
    # dither the warm band's edges into the grey so it never hard-cuts (soft clouds)
    dither(d, 0, band_y - 5, 170, 6, ROSE_GOLD, phase=0)
    dither(d, 0, band_y + 13, 160, 7, PAL["rain"][1], phase=1)
    # a faint warm sliver at the brightest cloud lip (restrained — no sun-blast)
    hline(d, 8, band_y + 2, 116, PAL["gold_light"][1])
    dither(d, 8, band_y + 3, 116, 2, PAL["gold_light"][2], phase=0)

    # --- layered mountain ridges (far pale → near dark), SOLID silhouettes on the
    # warmth. Each ridge is filled column-by-column from its crest down to the
    # floor seam so no warm band shows through as 'stripes' (round-1 failure).
    # far ridge (highest, palest) — a low rolling crest, misty
    far = PAL["rain"][3]
    for x in range(0, W):
        ry = 90 + int(6 * _hill(x, 0))
        vline(d, x, ry, FLOOR_Y - ry, far)
    dither(d, 0, 88, W, 8, PAL["rain"][2], phase=1)          # mist softening its crest
    # mid ridge — a touch darker, overlapping in front of the far one
    mid = PAL["rain"][4]
    for x in range(0, W):
        ry = 104 + int(8 * _hill(x, 4))
        vline(d, x, ry, FLOOR_Y - ry, mid)
    # near ridge (the valley floor edge, darkest + wet) — fills to the seam
    near = RAIN_DEEP
    for x in range(0, W):
        ry = 122 + int(8 * _hill(x, 9))
        vline(d, x, ry, FLOOR_Y - ry, near)
    # a thin warm rim catching the break along each crest (left half only, where
    # the cloud-break is — so the ridges read as lit from behind by the warmth)
    for x in range(2, 156, 2):
        ry = 90 + int(6 * _hill(x, 0))
        d.point((x, ry), fill=ROSE_GOLD)
        ry2 = 104 + int(8 * _hill(x, 4))
        d.point((x, ry2), fill=PAL["ember"][3])


def _hill(x, seed_shift):
    """Deterministic smooth-ish ridge profile in [0,1]; no random (pure int math)."""
    # a couple of summed integer sines faked with a triangle wave — stable & cheap
    a = ((x * 3 + seed_shift * 17) % 64)
    a = a if a < 32 else 64 - a            # triangle 0..32
    b = ((x * 7 + seed_shift * 31) % 40)
    b = b if b < 20 else 40 - b            # triangle 0..20
    return (a / 32.0 * 0.7 + b / 20.0 * 0.3)


# ── The two pavilion posts (기둥) framing the open bay ────────────────────────

def paint_posts(d):
    """Heavy wet wooden corner posts of the open pavilion (no 단청 here — the bell
    pavilion is plain structural timber, austere). They frame the valley bay.
    """
    for px in (10, 286):
        pw = 24
        fill(d, px, EAVE_Y, pw, FLOOR_Y + 60 - EAVE_Y, PAL["wood_dark"][2])
        vline(d, px, EAVE_Y, FLOOR_Y + 60 - EAVE_Y, PAL["wood_dark"][1])   # lit edge
        dither(d, px + pw - 7, EAVE_Y, 7, FLOOR_Y + 60 - EAVE_Y,
               PAL["wood_dark"][3], phase=0)                # shaded inner edge
        vline(d, px + pw - 1, EAVE_Y, FLOOR_Y + 60 - EAVE_Y, OUTLINE)
        # a cold wet sheen running down the lit edge (it has just rained)
        vline(d, px + 1, EAVE_Y, FLOOR_Y - EAVE_Y, PAL["rain"][1])
        # grain ticks
        for gy in range(EAVE_Y + 8, FLOOR_Y + 40, 17):
            hline(d, px + 6, gy, 5, PAL["wood_dark"][1])
        frame(d, px, EAVE_Y, pw, FLOOR_Y + 60 - EAVE_Y, OUTLINE)
        # a low stone plinth (주춧돌) the post stands on
        fill(d, px - 3, FLOOR_Y - 4, pw + 6, 8, PAL["stone"][2])
        d.ellipse([px - 3, FLOOR_Y - 7, px + pw + 2, FLOOR_Y + 1],
                  fill=PAL["stone"][1], outline=OUTLINE)
        dither(d, px - 1, FLOOR_Y - 3, pw + 2, 4, PAL["stone"][3], phase=0)


# ── TOP: the eave + the inscribed cross-beam ([70,24,180,30]) ────────────────

def paint_eave_and_beam(d):
    """Tiled eave line across the top + the painted inscription beam beneath it.

    The inscription is SUGGESTED brush strokes only — ILLEGIBLE at 1× (rule L2-c);
    the real text lives in obj-beam-inscription.png. Beam-inscription hotspot
    [70,24,180,30], visual center (160,39): the painted band is centered there.
    """
    # --- giwa (기와) tile eave along the very top ---
    fill(d, 0, 0, W, 16, PAL["stone"][2])
    hline(d, 0, 0, W, PAL["stone"][1])
    dither(d, 0, 8, W, 8, PAL["stone"][3], phase=0)          # shaded under-curve
    # rounded tile ends (막새) — a scalloped row of half-discs
    for tx in range(2, W, 12):
        d.ellipse([tx, 9, tx + 8, 17], fill=PAL["stone"][1], outline=PAL["stone"][3])
        d.point((tx + 4, 12), fill=PAL["stone"][0])
    hline(d, 0, 16, W, OUTLINE)
    # a thin warm drip-edge where the breaking light grazes the wet tile lip
    dither(d, 0, 15, W, 1, ROSE_GOLD, phase=1)

    # --- the cross-beam (보) carrying the inscription ---
    bx, by, bw, bh = 28, 22, 264, 20
    fill(d, bx, by, bw, bh, PAL["wood_dark"][1])
    hline(d, bx, by, bw, PAL["wood_light"][2])              # lit top lip
    dither(d, bx, by + bh - 6, bw, 6, PAL["wood_dark"][3], phase=1)  # shaded base
    hline(d, bx, by + bh - 1, bw, OUTLINE)
    frame(d, bx, by, bw, bh, OUTLINE)
    # grain along the beam
    for gx in range(bx + 6, bx + bw - 6, 29):
        hline(d, gx, by + 4, 9, PAL["wood_dark"][2])
        hline(d, gx + 4, by + 12, 7, PAL["wood_dark"][2])
    # a painted panel (단청-less, just a dark ground board) holding the text,
    # centered in the inscription hotspot so its center lands ≈ (160,32).
    px, py, ppw, pph = 96, 25, 128, 14
    fill(d, px, py, ppw, pph, PAL["wood_dark"][3])
    frame(d, px, py, ppw, pph, OUTLINE)
    hline(d, px, py, ppw, PAL["wood_dark"][2])
    # the master's hand: SUGGESTED ink brush strokes, ILLEGIBLE at 1× (L2-c).
    # short wandering vertical/horizontal wet-ink ticks grouped into 'characters'
    # that never resolve into glyphs — plus a tiny seal block on the right.
    _beam_brushwork(d, px + 6, py + 3, ppw - 26)
    # the 淸雨 seal is NOT baked here (that legible signature only lives in the
    # close-up); we only hint a small red seal smudge so the eye knows it's signed.
    sx = px + ppw - 14
    fill(d, sx, py + 4, 8, 7, PAL["dc_red"][2])
    dither(d, sx + 1, py + 5, 6, 5, PAL["dc_red"][3], phase=0)
    frame(d, sx, py + 4, 8, 7, PAL["dc_red"][3])


def _beam_brushwork(d, x, y, w):
    """A row of suggested wet-ink brush marks — never legible glyphs (rule L2-c)."""
    ink, ink_d = PAL["ink"][2], PAL["ink"][1]
    # six loose 'character' clusters, each a few short wandering strokes
    clusters = [0, 18, 36, 54, 72, 90]
    for ci, cx0 in enumerate(clusters):
        cx = x + cx0
        if cx > x + w:
            break
        # a vertical wet downstroke that sways
        for k in range(6):
            d.point((cx + (1 if k > 3 else 0), y + k), fill=ink)
        d.point((cx + 1, y + 2), fill=ink_d)               # wet swell
        # a crossing horizontal tick (varies per cluster so none reads as a letter)
        ty = y + (2 + (ci % 3))
        hline(d, cx - 2, ty, 5 + (ci % 2), ink)
        # a small detached dab nearby (the brush dotting)
        d.point((cx + 3, y + 4 + (ci % 2)), fill=ink_d)


# ── RIGHT: the bronze 범종 hanging ───────────────────────────────────────────

def paint_bell(d):
    """The 범종 hanging from the beam, center-right. State B: one last warm shiver
    of glint on its wet lip (the bell 'vibrating a last pixel of brightness', §3).
    """
    # suspension chain from the beam down to the dragon hook
    bell_x, bell_y = 196, 70
    cx = bell_x + 46 // 2
    for k in range(EAVE_Y, bell_y - 6, 4):                  # short chain links
        d.ellipse([cx - 2, k, cx + 2, k + 3], outline=PAL["bronze"][3])
    # the bell itself (shared builder, default 46×70)
    drop_shadow(d, bell_x - 2, bell_y + 70, 50, 3, cool=True)
    C.bell_beom(d, bell_x, bell_y)
    # State B last-shiver glint: a single bright warm thread on the lit lip + a
    # faint rose-gold catch on the shoulder (the break reflecting on bronze).
    hline(d, bell_x + 2, bell_y + 70 - 6, 10, PAL["gold_light"][0])
    d.point((bell_x + 6, bell_y + 8), fill=ROSE_GOLD)        # shoulder catches the break
    d.point((bell_x + 8, bell_y + 10), fill=PAL["gold_light"][1])


# ── CENTER: the 당목 + 우담 on the rope (SLOT6 [120,100,80,80]) ───────────────

def paint_rope_and_monk(d):
    """The 당목 striker on its rope at hand height + 우담 (gassho) at the rope.

    bell-rope hotspot [120,100,80,80], center (160,140). The 당목 (dangmok, ~34
    wide, cap on the right pointing AT the bell) is placed so its center sits in
    the rect; 우담 stands just left of it, hands toward the rope — the farewell.
    """
    # dangmok: builder draws ropes up from y-14 and a horizontal log pointing right
    # (cap on the right end → toward the bell). Place log top-left at (138,132):
    # log spans x138..x172, center ≈ (155,135) — inside [120,100,80,80].
    C.dangmok(d, 138, 132, w=34)
    # the long pull-rope hanging from the log down toward hand height (the rope you
    # and 우담 grip together — "같이요"). A braided 2px cord with a frayed tail.
    rope_x = 150
    for ry in range(140, 196, 1):
        # gentle sway
        ox = (1 if (ry // 4) % 2 else 0)
        d.point((rope_x + ox, ry), fill=PAL["hanji"][3])
        d.point((rope_x + ox + 1, ry), fill=PAL["wood_dark"][2])
    # braided knots down the rope
    for ky in range(146, 196, 9):
        d.point((rope_x, ky), fill=PAL["hanji"][2])
        d.point((rope_x + 1, ky), fill=PAL["wood_dark"][1])
    # a frayed tassel at the bottom of the rope
    for fx in range(rope_x - 2, rope_x + 4):
        d.point((fx, 196 + ((fx) % 2)), fill=PAL["hanji"][3])

    # 우담 standing at the rope, palms-together pose (gassho), just left of the
    # rope so his hands read as reaching for it. monk(gassho) bbox ~22×40.
    monk_x = 130
    C.monk(d, monk_x, 152, pose="gassho")
    # a short skin bridge from his pressed palms (≈ monk_x+8..+12, y≈170) across to
    # the rope, so the gesture reads as BOTH hands on the rope — "같이요" (together).
    for bx in range(monk_x + 12, rope_x):
        d.point((bx, 171), fill=PAL["wood_light"][0])
        d.point((bx, 172), fill=PAL["wood_light"][1])
    d.point((rope_x, 170), fill=PAL["wood_light"][0])          # knuckle on the rope
    d.point((rope_x + 1, 171), fill=PAL["wood_light"][1])


# ── FLOOR: wet plank deck + lit reflections + courtyard stones + steam ────────

def paint_floor(d):
    """Wet plank deck with WARMED reflections (state B) + steaming stones up front."""
    # plank deck — cool damp wood, but it has just rained so it's dark + wet
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["wood_dark"], plank_h=9,
                  seam_every=3)
    # cool wet film pooled across the deck
    dither(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["rain"][3], phase=1)
    dither(d, 0, H - 16, W, 16, PAL["rain"][4], phase=0)

    # --- LIT reflections (state B): the breaking warm light pools on the wet deck,
    # QUIET. A reflection on wet planks is a soft warm TINT on the dark wood — low
    # contrast, a touch denser + wider near its source, thinning + cooling with
    # depth. Kept to warm mid-tones (ember[3] / wood_light[3]) so it never blows
    # out into a near-white checker (the round-2/3 'torn hole' failure), and drawn
    # as one continuous tapering column so it never reads as stacked bars.
    def reflect(col_x, half_w, depth_rows, warm_frac=0.4):
        """Continuous warm wet-sheen reflection under an object, tapering down.

        warm_frac = how deep the warmest (ember) tone reaches before cooling to
        plain warm wood; lower it for a quieter reflection of a fainter source.
        """
        for i in range(depth_rows):
            ry = FLOOR_Y + 4 + i * 2
            if ry >= H - 12:
                break
            frac = i / float(depth_rows)
            hw = max(1, int(half_w * (1.0 - 0.7 * frac)))   # narrows with depth
            wob = ((i // 2) % 3) - 1                         # gentle waver
            # warm but restrained: ember near the top, cooling to wood as it falls
            c = PAL["ember"][3] if frac < warm_frac else PAL["wood_light"][3]
            dither(d, col_x - hw + wob, ry, hw * 2, 2, c, phase=i % 2)
    # the bell lip's mirror (the sharpest, brightest source), directly below it
    reflect(216, 9, 30, warm_frac=0.45)
    # the rose-gold cloud break mirrored on the far-left deck — a FAINTER source,
    # so a quieter reflection (warm wood tone, only the topmost rows ember-warm)
    reflect(46, 11, 24, warm_frac=0.18)
    # the single brightest thread right under the bell lip (its mirror point),
    # a dotted gold line fading into the wet wood — the one true 'lit' accent
    for i in range(22):
        ry = FLOOR_Y + 5 + i * 2
        c = PAL["gold_light"][1] if i < 6 else (PAL["gold_light"][2] if i < 13
                                                else PAL["ember"][3])
        d.point((216 + ((i // 2) % 2), ry), fill=c)

    # --- courtyard stones along the front edge (디딤돌) — wet, with steam rising.
    # a row of flat stones set into the deck front; the steam (rain_clear) curls
    # up off them. Stones are cool stone-gray with a warm rim from the break.
    stones = [(24, 222), (70, 226), (120, 224), (176, 226), (232, 222), (276, 226)]
    for (sx, sy) in stones:
        sw = 22
        d.ellipse([sx, sy, sx + sw, sy + 9], fill=PAL["stone"][2], outline=OUTLINE)
        dither(d, sx + 2, sy + 4, sw - 4, 4, PAL["stone"][3], phase=0)
        hline(d, sx + 4, sy + 1, sw - 8, PAL["stone"][1])   # lit top
        hline(d, sx + 5, sy + 1, sw - 10, ROSE_GOLD)        # warm rim from the break
        # a cool wet pool around the stone
        dither(d, sx - 2, sy + 8, sw + 4, 2, PAL["rain"][3], phase=1)


# ── STATE B atmosphere: dripping eaves + 1px steam (rain_clear) ──────────────

def paint_clear_and_steam(d):
    """State B: drips hanging off the eave + 1px steam off the wet stones.

    Replaces state A's rain_curtain. The dying rain is now just a few teardrops
    sliding off the tile eave (short, near the eave line — NOT a falling curtain)
    plus steam curling off the courtyard stones near the floor. Quiet by design.
    """
    # --- eave drips: short 2-3px teardrops hanging JUST under the tile lip
    # (y≈16). Sparse — the rain is nearly over. Skipped over the bell column so
    # they don't read as falling on the bell.
    for i, dx in enumerate(range(22, W - 20, 26)):
        if 188 <= dx <= 244:                 # leave the bell column clear
            continue
        dy = 18 + ((i * 3) % 7)              # drop clings near the eave then falls
        d.point((dx, dy - 1), fill=PAL["rain"][2])
        d.point((dx, dy), fill=PAL["rain"][1])
        d.point((dx, dy + 1), fill=PAL["white"][1])     # bright leading tip
        d.point((dx, dy + 2), fill=PAL["white"][0])
    # a couple of longer drops mid-fall (the last of the rain leaving the eave)
    for (dx, dy) in ((58, 30), (132, 26), (262, 28)):
        vline(d, dx, dy, 3, PAL["rain"][1])
        d.point((dx, dy + 3), fill=PAL["white"][1])
        d.point((dx, dy + 4), fill=PAL["white"][0])

    # --- steam: 1px columns curling up OFF the courtyard stones near the floor.
    # Centered on the stone row (paint_floor), warm-white at the base fading up.
    amp = (0, 0, 1, 1, 0, -1, -1, 0)
    stone_tops = ((35, 222), (81, 226), (131, 224), (243, 222), (287, 226))
    for i, (sx, sbase) in enumerate(stone_tops):
        for k in range(11):
            yy = sbase - k * 2
            ox = amp[(k + i * 3) % len(amp)]
            c = (PAL["white"][0] if k < 3 else
                 (PAL["white"][1] if k < 6 else PAL["rain"][0]))
            d.point((sx + ox, yy), fill=c)
            if k < 4:                        # thicker, brighter base = legible
                d.point((sx + ox + 1, yy), fill=PAL["white"][1])


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][2])
    paint_sky_and_valley(d)      # open sky + valley + rose-gold cloud break
    paint_eave_and_beam(d)       # top tile eave + inscription beam
    paint_posts(d)               # the two corner posts
    paint_floor(d)               # wet deck + lit reflections + stones
    paint_bell(d)                # the bronze bell (right)
    paint_rope_and_monk(d)       # 당목 + rope + 우담 (center)
    paint_clear_and_steam(d)     # state-B drips + steam (drawn last, on top)
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-04-jongnu-clear.png")
    C.preview(img, "preview_room-04-jongnu-clear.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-04-jongnu-clear.png", scale=3)


if __name__ == "__main__":
    main()
