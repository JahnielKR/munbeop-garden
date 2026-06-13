#!/usr/bin/env python3
"""room-04-jongnu.png — 종루 bell pavilion, STATE A «lluvia».

Dossier §6 Cuarto 4 STATE A (the room as you first enter it): the open 종루, the
bronze 범종 center-right (a heavy dark hanging mass — bronze absorbs the light),
the 당목 striker on its rope at hand height with 우담 beside it on the rope, the
painted beam-inscription overhead (ILLEGIBLE brush strokes at 1×, rule L2-c), the
valley beyond the eaves UNDER THE RAIN CURTAIN, the wet plank floor with MINIMAL
reflections. Light: silver-gray; everything cold and wet.

This file is the STATE A twin of room-04-jongnu-clear.py: the bell, the 당목, the
posts, the upper inscription beam and the CAMERA are kept pixel-identical so the
swap rain→clear (during the exit sequence) is seamless. vs the clear file:
  · rain_clear (eave drips + stone steam)      → rain_curtain over the valley
  · the ROSE_GOLD cloud break in the sky        → REMOVED (cold rain sky)
  · the warm rims on the ridges / tile / stones → REMOVED
  · the LIT (warm) floor reflections            → REMOVED (silver-gray minimal)
  · the bell's last warm glint on its lip       → REMOVED (bronze absorbs light)
Everything else (eave, posts, beam, valley ridges, rope, 우담, deck, stones)
is byte-identical to the clear file so the two states register perfectly.

Layout (320×240, frontal-flat like every room):
  TOP   : tiled eave + the painted cross-beam carrying the master's inscription —
          SUGGESTED brush strokes, ILLEGIBLE at 1× (rule L2-c).
          beam-inscription cosmetic [70,24,180,30], center (160,39).
  LEFT  : an opening between two posts onto the mountain valley, BEHIND the rain
          curtain. valley cosmetic [10,70,90,60], center (55,100).
  CENTER: the 당목 striker log on its rope + 우담 (gassho) at the rope — the
          farewell. bell-rope SLOT6 [120,100,80,80], center (160,140).
  RIGHT : the bronze 범종 hanging heavy, dark, the light dying on it.
  FLOOR : wet plank deck, cold silver-gray, MINIMAL reflections.

Shared builders: bell_beom, dangmok, monk(gassho), rain_curtain, drop_shadow,
hanji/wood/dither primitives. Everything else painted AROUND them.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-04-jongnu.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, RAIN_DEEP, fill, frame, hline, vline,
                    dither, drop_shadow)

W, H = 320, 240
FLOOR_Y = 150            # plank-deck seam (STYLE: y≈140–155) — same as clear file
EAVE_Y = 56              # underside of the eave — same as clear file

# Hotspot rects from the seed (320×240 space) — confirmed against STYLE table.
RECTS = [
    (120, 100, 80, 80),  # bell-rope / 당목 / 우담  (SLOT6)
    (70, 24, 180, 30),   # beam inscription (cosmetic)
    (10, 70, 90, 60),    # valley (cosmetic)
]


# ── BACK: the open pavilion void + the valley UNDER THE RAIN (state A) ─────────

def paint_sky_and_valley(d):
    """Open 종루: no walls. A cold post-rain-grey sky over layered valley ridges.

    State A: NO rose-gold break — the cloud bank is unbroken slate, the valley
    grey under the falling rain (the curtain itself is drawn later, on top). The
    ridge geometry is kept BYTE-IDENTICAL to the clear file (same _hill profile,
    same crest rows) so the swap is seamless; only the WARMTH is removed:
      · the rose-gold band + its gold sliver  → gone (flat cold sky instead)
      · the warm rims along the ridge crests  → gone (cold silhouettes)
    """
    # base sky — a cold pale grey-rain wash, lighter toward the horizon (IDENTICAL
    # to the clear file: same fills, same dither phases, so the back registers).
    fill(d, 0, 0, W, FLOOR_Y, PAL["rain"][2])
    dither(d, 0, 0, W, 30, PAL["rain"][3], phase=0)          # darker high ceiling-side
    fill(d, 0, EAVE_Y, W, FLOOR_Y - EAVE_Y, PAL["rain"][1])  # brighter low sky
    dither(d, 0, EAVE_Y, W, 18, PAL["rain"][2], phase=1)     # soft mid gradient
    # --- STATE A: where the clear file painted a ROSE_GOLD cloud break, the rain
    # state leaves the cloud bank UNBROKEN. We fill that same band with cold sky
    # so the back stays the same shape/value range as the clear file (a flat
    # slate ceiling), just with no warmth and a touch of rain-dither texture.
    band_y = 74
    fill(d, 0, band_y - 5, W, 24, PAL["rain"][1])            # cold band, no warmth
    dither(d, 0, band_y - 5, 170, 6, PAL["rain"][2], phase=0)  # soft cloud edge (cold)
    dither(d, 0, band_y + 13, 160, 7, PAL["rain"][1], phase=1)
    dither(d, 0, band_y, W, 12, PAL["rain"][2], phase=1)     # low slate cloud texture

    # --- layered mountain ridges (far pale → near dark), SOLID silhouettes. Each
    # ridge is filled column-by-column from its crest to the floor seam. Geometry
    # IDENTICAL to the clear file (same _hill, same rows) — only the warm rims are
    # dropped, so the ridges read as cold wet silhouettes behind the rain.
    far = PAL["rain"][3]
    for x in range(0, W):
        ry = 90 + int(6 * _hill(x, 0))
        vline(d, x, ry, FLOOR_Y - ry, far)
    dither(d, 0, 88, W, 8, PAL["rain"][2], phase=1)          # mist softening its crest
    mid = PAL["rain"][4]
    for x in range(0, W):
        ry = 104 + int(8 * _hill(x, 4))
        vline(d, x, ry, FLOOR_Y - ry, mid)
    near = RAIN_DEEP
    for x in range(0, W):
        ry = 122 + int(8 * _hill(x, 9))
        vline(d, x, ry, FLOOR_Y - ry, near)
    # NO warm rim on the crests (state A): instead a faint COLD mist rim catches
    # the grey light along the far crest, so the layering still reads.
    for x in range(2, 156, 2):
        ry = 90 + int(6 * _hill(x, 0))
        d.point((x, ry), fill=PAL["rain"][2])
        ry2 = 104 + int(8 * _hill(x, 4))
        d.point((x, ry2), fill=PAL["rain"][3])


def _hill(x, seed_shift):
    """Deterministic smooth-ish ridge profile in [0,1]; no random (pure int math).

    IDENTICAL to the clear file so both states share the exact ridge geometry.
    """
    a = ((x * 3 + seed_shift * 17) % 64)
    a = a if a < 32 else 64 - a            # triangle 0..32
    b = ((x * 7 + seed_shift * 31) % 40)
    b = b if b < 20 else 40 - b            # triangle 0..20
    return (a / 32.0 * 0.7 + b / 20.0 * 0.3)


# ── The two pavilion posts (기둥) framing the open bay ────────────────────────
#    KEPT PIXEL-IDENTICAL to the clear file (austere plain timber).

def paint_posts(d):
    """Heavy wet wooden corner posts of the open pavilion. Identical to clear."""
    for px in (10, 286):
        pw = 24
        fill(d, px, EAVE_Y, pw, FLOOR_Y + 60 - EAVE_Y, PAL["wood_dark"][2])
        vline(d, px, EAVE_Y, FLOOR_Y + 60 - EAVE_Y, PAL["wood_dark"][1])   # lit edge
        dither(d, px + pw - 7, EAVE_Y, 7, FLOOR_Y + 60 - EAVE_Y,
               PAL["wood_dark"][3], phase=0)                # shaded inner edge
        vline(d, px + pw - 1, EAVE_Y, FLOOR_Y + 60 - EAVE_Y, OUTLINE)
        vline(d, px + 1, EAVE_Y, FLOOR_Y - EAVE_Y, PAL["rain"][1])  # cold wet sheen
        for gy in range(EAVE_Y + 8, FLOOR_Y + 40, 17):      # grain ticks
            hline(d, px + 6, gy, 5, PAL["wood_dark"][1])
        frame(d, px, EAVE_Y, pw, FLOOR_Y + 60 - EAVE_Y, OUTLINE)
        # a low stone plinth (주춧돌) the post stands on
        fill(d, px - 3, FLOOR_Y - 4, pw + 6, 8, PAL["stone"][2])
        d.ellipse([px - 3, FLOOR_Y - 7, px + pw + 2, FLOOR_Y + 1],
                  fill=PAL["stone"][1], outline=OUTLINE)
        dither(d, px - 1, FLOOR_Y - 3, pw + 2, 4, PAL["stone"][3], phase=0)


# ── TOP: the eave + the inscribed cross-beam ([70,24,180,30]) ────────────────
#    KEPT PIXEL-IDENTICAL to the clear file EXCEPT the one warm drip-edge sliver
#    on the tile lip (state-B warmth) is reverted to a cold wet sliver.

def paint_eave_and_beam(d):
    """Tiled eave line + the painted inscription beam beneath it.

    The inscription is SUGGESTED brush strokes only — ILLEGIBLE at 1× (rule L2-c);
    the real text lives in obj-beam-inscription.png. Beam-inscription hotspot
    [70,24,180,30], visual center (160,39).
    """
    # --- giwa (기와) tile eave along the very top (identical to clear) ---
    fill(d, 0, 0, W, 16, PAL["stone"][2])
    hline(d, 0, 0, W, PAL["stone"][1])
    dither(d, 0, 8, W, 8, PAL["stone"][3], phase=0)          # shaded under-curve
    for tx in range(2, W, 12):                              # 막새 tile ends
        d.ellipse([tx, 9, tx + 8, 17], fill=PAL["stone"][1], outline=PAL["stone"][3])
        d.point((tx + 4, 12), fill=PAL["stone"][0])
    hline(d, 0, 16, W, OUTLINE)
    # STATE A: the warm rose-gold drip-edge of the clear file is reverted to a
    # COLD wet sliver where the rain runs off the tile lip.
    dither(d, 0, 15, W, 1, PAL["rain"][0], phase=1)

    # --- the cross-beam (보) carrying the inscription (identical to clear) ---
    bx, by, bw, bh = 28, 22, 264, 20
    fill(d, bx, by, bw, bh, PAL["wood_dark"][1])
    hline(d, bx, by, bw, PAL["wood_light"][2])              # lit top lip
    dither(d, bx, by + bh - 6, bw, 6, PAL["wood_dark"][3], phase=1)  # shaded base
    hline(d, bx, by + bh - 1, bw, OUTLINE)
    frame(d, bx, by, bw, bh, OUTLINE)
    for gx in range(bx + 6, bx + bw - 6, 29):              # grain
        hline(d, gx, by + 4, 9, PAL["wood_dark"][2])
        hline(d, gx + 4, by + 12, 7, PAL["wood_dark"][2])
    # the painted text panel, centered in the inscription hotspot (center ≈160,32)
    px, py, ppw, pph = 96, 25, 128, 14
    fill(d, px, py, ppw, pph, PAL["wood_dark"][3])
    frame(d, px, py, ppw, pph, OUTLINE)
    hline(d, px, py, ppw, PAL["wood_dark"][2])
    # SUGGESTED ink brush strokes, ILLEGIBLE at 1× (L2-c) + a tiny red seal smudge.
    _beam_brushwork(d, px + 6, py + 3, ppw - 26)
    sx = px + ppw - 14
    fill(d, sx, py + 4, 8, 7, PAL["dc_red"][2])
    dither(d, sx + 1, py + 5, 6, 5, PAL["dc_red"][3], phase=0)
    frame(d, sx, py + 4, 8, 7, PAL["dc_red"][3])


def _beam_brushwork(d, x, y, w):
    """A row of suggested wet-ink brush marks — never legible glyphs (rule L2-c).

    Identical to the clear file's brushwork so the two states show the same beam.
    """
    ink, ink_d = PAL["ink"][2], PAL["ink"][1]
    clusters = [0, 18, 36, 54, 72, 90]
    for ci, cx0 in enumerate(clusters):
        cx = x + cx0
        if cx > x + w:
            break
        for k in range(6):                                 # swaying downstroke
            d.point((cx + (1 if k > 3 else 0), y + k), fill=ink)
        d.point((cx + 1, y + 2), fill=ink_d)               # wet swell
        ty = y + (2 + (ci % 3))                            # crossing tick (varies)
        hline(d, cx - 2, ty, 5 + (ci % 2), ink)
        d.point((cx + 3, y + 4 + (ci % 2)), fill=ink_d)    # detached dab


# ── RIGHT: the bronze 범종 hanging (the light dying on it) ────────────────────

def paint_bell(d):
    """The 범종 hanging from the beam, center-right. State A: bronze absorbs the
    light — a heavy dark mass, NO warm glint (the clear-file's last shiver of
    warmth on the lip + the rose catch on the shoulder are removed). Bell body,
    chain and position are pixel-identical to the clear file.
    """
    bell_x, bell_y = 196, 70
    cx = bell_x + 46 // 2
    for k in range(EAVE_Y, bell_y - 6, 4):                  # short chain links
        d.ellipse([cx - 2, k, cx + 2, k + 3], outline=PAL["bronze"][3])
    drop_shadow(d, bell_x - 2, bell_y + 70, 50, 3, cool=True)
    C.bell_beom(d, bell_x, bell_y)
    # STATE A: NO warm glint. Instead a single COLD wet sheen thread on the lip
    # (rain-light, not gold) so the wet bronze still reads as wet, but the light
    # is plainly dying on it — the bell absorbs the grey.
    hline(d, bell_x + 6, bell_y + 70 - 6, 6, PAL["rain"][0])
    d.point((bell_x + 7, bell_y + 9), fill=PAL["rain"][1])  # a cold drip-catch on the shoulder


# ── CENTER: the 당목 + 우담 on the rope (SLOT6 [120,100,80,80]) ───────────────
#    KEPT PIXEL-IDENTICAL to the clear file.

def paint_rope_and_monk(d):
    """The 당목 striker on its rope at hand height + 우담 (gassho) at the rope.

    bell-rope hotspot [120,100,80,80], center (160,140). Identical to clear file.
    """
    C.dangmok(d, 138, 132, w=34)                            # log center ≈(155,135)
    rope_x = 150
    for ry in range(140, 196, 1):                          # braided pull-rope
        ox = (1 if (ry // 4) % 2 else 0)
        d.point((rope_x + ox, ry), fill=PAL["hanji"][3])
        d.point((rope_x + ox + 1, ry), fill=PAL["wood_dark"][2])
    for ky in range(146, 196, 9):                          # braided knots
        d.point((rope_x, ky), fill=PAL["hanji"][2])
        d.point((rope_x + 1, ky), fill=PAL["wood_dark"][1])
    for fx in range(rope_x - 2, rope_x + 4):               # frayed tassel
        d.point((fx, 196 + ((fx) % 2)), fill=PAL["hanji"][3])

    monk_x = 130                                            # 우담, gassho, at the rope
    C.monk(d, monk_x, 152, pose="gassho")
    for bx in range(monk_x + 12, rope_x):                  # skin bridge to the rope
        d.point((bx, 171), fill=PAL["wood_light"][0])
        d.point((bx, 172), fill=PAL["wood_light"][1])
    d.point((rope_x, 170), fill=PAL["wood_light"][0])      # knuckle on the rope
    d.point((rope_x + 1, 171), fill=PAL["wood_light"][1])


# ── FLOOR: wet plank deck + MINIMAL cold reflections (state A) ────────────────

def paint_floor(d):
    """Wet plank deck, cold silver-gray, MINIMAL reflections (state A).

    The plank base + cool wet film are IDENTICAL to the clear file (so the wood
    registers across the swap). What changes: the clear file's LIT warm
    reflections (ember/gold pooling under the bell + valley) are REMOVED. State
    A keeps only the faintest cold sheen directly under the bell — the wet wood
    'reflects mínimos' (dossier), silver-gray, no warmth.
    """
    # plank deck — cool damp wood (identical to clear)
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["wood_dark"], plank_h=9,
                  seam_every=3)
    dither(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["rain"][3], phase=1)  # cool wet film
    dither(d, 0, H - 16, W, 16, PAL["rain"][4], phase=0)

    # --- MINIMAL cold reflection (state A): the bell is a dark mass that swallows
    # the light, so its mirror on the wet deck is barely there — a SUBTLE cold
    # tint sparsely dithered into the dark wood directly beneath it, low contrast,
    # tapering fast. It must read as a faint wet sheen INTEGRATED into the planks,
    # never as a foreign column (the L1 'stacked bars / torn hole' failure that
    # round 1 fell into). So: only rain[3] (one cold step off the wet film already
    # on the deck), sparse, narrow, and gone within a few rows.
    for i in range(14):
        ry = FLOOR_Y + 4 + i * 2
        if ry >= H - 14:
            break
        frac = i / 14.0
        hw = max(1, int(6 * (1.0 - 0.75 * frac)))           # narrows fast with depth
        wob = ((i // 3) % 3) - 1                             # very gentle waver
        # one cold tone only; sparse phase so it stays a tint, not a block
        dither(d, 216 - hw + wob, ry, hw * 2, 1, PAL["rain"][3], phase=i % 2)
    # the single faint cold sheen point under the bell lip (the one wet accent),
    # only a few rows, dotted and fading — a wet glint, not a string of beads.
    for i in range(6):
        ry = FLOOR_Y + 5 + i * 3
        c = PAL["rain"][1] if i < 2 else (PAL["rain"][2] if i < 4 else PAL["rain"][3])
        d.point((216 + (i % 2), ry), fill=c)

    # --- courtyard stones along the front edge (디딤돌) — wet, COLD (no steam,
    # no warm rim). Same stone positions as the clear file so they register.
    stones = [(24, 222), (70, 226), (120, 224), (176, 226), (232, 222), (276, 226)]
    for (sx, sy) in stones:
        sw = 22
        d.ellipse([sx, sy, sx + sw, sy + 9], fill=PAL["stone"][2], outline=OUTLINE)
        dither(d, sx + 2, sy + 4, sw - 4, 4, PAL["stone"][3], phase=0)
        hline(d, sx + 4, sy + 1, sw - 8, PAL["stone"][1])   # cold lit top (no warm rim)
        dither(d, sx - 2, sy + 8, sw + 4, 2, PAL["rain"][3], phase=1)  # cool wet pool


# ── STATE A atmosphere: the rain CURTAIN over the valley ─────────────────────

def paint_rain(d):
    """State A: the falling rain curtain across the whole open bay (replaces the
    clear file's eave-drips + stone-steam). Drawn LAST, on top of everything.

    The curtain falls over the OPEN bay between the posts (the valley is 'under
    the rain'), drawn in two layers by the shared rain_curtain builder. It is
    skipped over the inscription beam (so the brushwork stays readable as ink,
    not rained-out) and thinned over the bell column so the bell still reads as a
    solid mass. The valley hotspot [10,70,90,60] sits fully inside the curtain.
    """
    # the open bay: from just under the eave/beam down to the floor seam, between
    # the inner faces of the two posts (post inner edges at x≈33 and x≈287).
    # Two passes (phase 0 + a sparser phase 1 offset) give a denser wet curtain
    # without changing the builder. Skip the bell column (x 188..250) on the near
    # pass so the bell stays a clean dark mass.
    bay_x, bay_y, bay_w, bay_h = 33, EAVE_Y, 254, FLOOR_Y - EAVE_Y
    C.rain_curtain(d, bay_x, bay_y, bay_w, bay_h, phase=0, density=7, lean=2)
    # a second, lighter far pass over the valley side (left) for depth — denser
    # rain where the valley hotspot is, so 'el valle bajo la lluvia' reads.
    C.rain_curtain(d, bay_x, bay_y, 120, bay_h, phase=1, density=9, lean=2)
    # a thin far pass over the RIGHT gap (between bell and right post) so the
    # curtain doesn't thin out on that side — balanced, but kept lighter than the
    # valley so the left still reads as the rainiest quarter.
    C.rain_curtain(d, 244, bay_y, 43, bay_h, phase=1, density=11, lean=2)

    # a few bright near streaks falling THROUGH the foreground (over the deck),
    # in front of the rope/monk — the rain is in the room, not just out the back.
    # Kept sparse + skipping the SLOT6 figure column so 우담 stays clean.
    near = PAL["rain"][0]
    for col in range(8, W, 34):
        if 120 <= col <= 176:                # leave the SLOT6 / rope column clear
            continue
        for k in range(0, 40, 8):
            yy = FLOOR_Y - 2 + k
            xx = col + k // 3
            if yy < H - 2 and 0 <= xx < W:
                d.point((xx, yy), fill=near)
                d.point((xx, yy + 1), fill=PAL["rain"][1])


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][2])
    paint_sky_and_valley(d)      # open cold sky + valley ridges (no warm break)
    paint_eave_and_beam(d)       # top tile eave + inscription beam
    paint_posts(d)               # the two corner posts
    paint_floor(d)               # wet deck + minimal cold reflections + stones
    paint_bell(d)                # the bronze bell (right), light dying on it
    paint_rope_and_monk(d)       # 당목 + rope + 우담 (center)
    paint_rain(d)                # state-A rain curtain (drawn last, on top)
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-04-jongnu.png")
    C.preview(img, "preview_room-04-jongnu.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-04-jongnu.png", scale=3)


if __name__ == "__main__":
    main()
