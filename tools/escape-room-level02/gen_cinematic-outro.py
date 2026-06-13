#!/usr/bin/env python3
"""cinematic-outro.png — the FAREWELL SHOT of Level 2 «El templo de la lluvia».

Dossier §3 farewellImage + §12.7. THE signature frozen frame. Low-angle from the
foot of the wet stairway, looking UP THROUGH the 일주문 (columns + 단청 lintel as a
proscenium). The storm has broken: ROSE_GOLD rays through the clouds, steam rising
off the stone. CENTER, SMALL: 우담 in 합장 (gassho), head bowed, tiny against the
broken sky. The brown cat sits at his feet on the FIRST step (inside the frame),
turned to look at an EMPTY point to his right.

The wet steps are a lit golden MIRROR descending toward camera. On that gold, two
long shadows fall from where there is only ONE man: one bald-headed (the monk's),
and one TALLER with the unmistakable brim of a 삿갓. The second shadow is RAIN_DEEP
(one tone darker than the monk's), NO OUTLINE, no glow, no hotspot, no text. It
must be FINDABLE if sought (the 삿갓 brim reads) but NOT obvious at 1× — the gift of
the roguelike (rule L2-b, §12.7). If it shouts, it is wrong.

Far LEFT: the 종루 (bell tower) silhouette with bell_beom (small) holding one last
pixel of shine. FOREGROUND bottom: the edge of the master's paper_umbrella in your
hand. 매화 petals scattered on the wet stone.

Composition (320×240 — the gate as proscenium, camera looking UP from the stairfoot):
  SKY    : broken storm seen THROUGH the gate opening — torn slate clouds with a
           warm break and ROSE_GOLD rays fanning down; steam off the stone.
  GATE   : iljumun() centered + RAISED (low-angle) so the columns tower and the
           lintel sits high; 청우사 plaque hung from it (art, illegible at 1×).
  TOWER  : the 종루 silhouette far left, behind the left column, bell_beom small
           inside it with one last lit pixel.
  LANDING: the top landing at the gate's foot where 우담 stands in 합장 (small,
           centered) with the cat at his feet on the first step.
  STEPS  : the wet golden stairway descending toward camera (a lit mirror) filling
           the lower 2/5 of the frame — the surface that carries BOTH shadows.
  FORE   : the edge of the master's paper_umbrella low-center, the one thing in
           the player's own hand, bottom of frame.

Shared builders used: iljumun (gate + 청우사 plaque proscenium), monk(pose='gassho')
(우담 in 합장), cat(frame=2) (looking off to the empty point), bell_beom (the tower
bell), petals (매화 on the stone). The two cast shadows, the golden stair mirror, the
broken sky, the 종루 body, the post-rain steam (soft wisps, NOT rain_clear — whose
regular columns + falling eave-drops read as the L1 'motas sueltas' vapor failure
and imply an eave this landing has none of) and the foreground umbrella EDGE (the
shared paper_umbrella is a whole ~32px parasol; here we need only its lit lower rim
filling the corner, from the same hanji+wood_dark ramps) are asset-local detail
painted AROUND the builders, per STYLE.md rule 2. The 삿갓 second shadow is asset-
local by necessity (no builder covers it) and the single most carefully tuned
element of the frame.

Palette discipline (rule 1): only PAL + OUTLINE + SHADOW_* + the 3 documented
derived shades. ROSE_GOLD for the sky break, RAIN_DEEP for the second shadow, no
new hues. No legible Korean in-scene (L2-a): the only hangul is the 청우사 plaque
drawn AS ART by iljumun() — rough, not a font, unreadable at 1×.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_cinematic-outro.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, RAIN_DEEP, ROSE_GOLD, fill, frame, hline,
                    vline, dither, drop_shadow)

W, H = 320, 240

# Low-angle gate: RAISED footprint so the columns tower and the lintel sits high
# (camera at the stairfoot looking up). Columns drop to the LANDING line, not the
# camera — the steps continue below them toward us.
GATE_X, GATE_Y, GATE_W, GATE_H = 84, 18, 152, 132
LANDING_Y = 150          # the top landing where the monk stands / columns plant
STAIR_TOP = LANDING_Y    # the golden stairway begins here and runs to the camera

# Sanity rects (cinematic — no real slot hotspots; overlaid only to confirm each
# named spec element sits where it should). The second shadow gets NO rect on
# purpose (it has no hotspot — verifying it is an eyes-at-1× job, rule L2-b).
CHECK_RECTS = [
    (GATE_X, GATE_Y, GATE_W, GATE_H),    # the 일주문 proscenium
    (146, 96, 28, 46),                   # 우담 in 합장 (center, small)
    (168, 134, 18, 16),                  # the cat at his feet (first step)
    (22, 86, 30, 60),                    # the 종루 tower (far left)
    (28, 206, 128, 34),                  # the master's paper_umbrella edge (fore,
                                         # bottom-left — arcs in from the frame foot)
]


# ── SKY: the broken storm seen through the gate, ROSE_GOLD rays ───────────────

def paint_sky(d):
    """The storm broken open: torn slate clouds + a warm break with ROSE_GOLD rays.

    The defining change from the intro's solid downpour — here the cloud cover is
    TORN and a precious warm break pours light down through the gate opening. Cool
    slate at the edges (the storm retreating), ROSE_GOLD fanning from a bright core
    high-center. Banded + dithered, never a smooth gradient; never pure black.
    """
    # base: cool slate retreating, lighter toward the warm break, banded high→low
    bands = [
        (0,   18, PAL["night"][2]),     # last dark storm cloud at the very top
        (18,  20, PAL["rain"][4]),
        (38,  26, PAL["rain"][3]),
        (64,  34, PAL["rain"][2]),      # the wet haze clearing toward the horizon
        (98,  30, PAL["rain"][1]),
    ]
    for by, bh, c in bands:
        fill(d, 0, by, W, bh, c)
    dither(d, 0, 16, W, 4, PAL["night"][2], phase=0)
    dither(d, 0, 36, W, 4, PAL["rain"][4], phase=1)
    dither(d, 0, 62, W, 4, PAL["rain"][3], phase=0)
    dither(d, 0, 96, W, 4, PAL["rain"][2], phase=1)

    # the WARM BREAK: a torn hole in the storm high-center, behind the gate opening.
    # Built from OVERLAPPING irregular lobes (not one clean oval — the L1 'faceted
    # disc' pitfall) so it reads as ragged clearing sky, warm core → rose-gold edge.
    bx, by = 160, 54            # the bright core of the break (high-center)
    # ragged outer rose-gold haze: several offset lobes of different sizes
    for (ox, oy, rw, rh) in ((-30, -2, 30, 14), (28, 2, 34, 13), (-4, -8, 26, 12),
                             (6, 8, 40, 12), (-46, 6, 18, 9), (48, -4, 16, 8)):
        d.ellipse([bx + ox - rw, by + oy - rh, bx + ox + rw, by + oy + rh],
                  fill=ROSE_GOLD)
    dither(d, bx - 64, by - 22, 128, 44, PAL["rain"][2], phase=0)   # tear slate back in
    # warm mid lobes
    for (ox, oy, rw, rh) in ((-16, 0, 24, 10), (18, 2, 22, 9), (0, -4, 18, 8)):
        d.ellipse([bx + ox - rw, by + oy - rh, bx + ox + rw, by + oy + rh],
                  fill=PAL["gold_light"][1])
    # bright gold + white core (the eye of the break), slightly off-center
    d.ellipse([bx - 26, by - 7, bx + 22, by + 9], fill=PAL["gold_light"][0])
    d.ellipse([bx - 12, by - 4, bx + 12, by + 6], fill=PAL["white"][0])
    # dither the warm core edges into the gold so no ring reads as a hard disc
    dither(d, bx - 34, by - 12, 68, 24, PAL["gold_light"][1], phase=1)
    dither(d, bx - 22, by - 8, 44, 16, PAL["gold_light"][0], phase=0)

    # torn cloud shelves drifting across the break (slate wisps, lit underside) so
    # the sky reads as BROKEN cloud, not a clean sunbeam. Cool bodies, warm rims.
    def cloud(cx, cy, cw, ch):
        d.ellipse([cx, cy, cx + cw, cy + ch], fill=PAL["rain"][3])
        dither(d, cx + 2, cy + 1, cw - 4, ch - 1, PAL["rain"][2], phase=1)
        hline(d, cx + 3, cy + ch - 1, cw - 6, ROSE_GOLD)     # warm-lit underside
    cloud(40, 30, 70, 12)
    cloud(206, 26, 78, 13)
    cloud(96, 14, 60, 9)
    cloud(2, 50, 46, 10)

    # ROSE_GOLD rays fanning DOWN from the break through the gate opening — the
    # 'rayos rosa-dorados' of the spec. Sparse 1px diagonal shafts (dither so they
    # glimmer, not solid bars), spreading wider as they descend toward the temple.
    ray_top = (bx, by + 8)
    for k, dxb in enumerate(range(-44, 45, 11)):
        x0, y0 = ray_top
        x1 = x0 + dxb
        y1 = by + 78
        steps = y1 - y0
        for s in range(0, steps, 2):
            t = s / steps
            xx = int(x0 + (x1 - x0) * t)
            yy = y0 + s
            if (xx + yy + k) % 2 == 0:
                c = PAL["gold_light"][0] if t < 0.4 else ROSE_GOLD
                d.point((xx, yy), fill=c)


# ── TOWER: the 종루 silhouette far left, bell_beom holding one last shine ──────

def paint_jongnu(d):
    """The 종루 (bell tower) far left as a dim silhouette, the bell catching ONE pixel.

    A small open pavilion silhouette behind/left of the left gate column: a hipped
    giwa roof on two posts, the bronze bell_beom hung small inside it. The whole
    thing is rain-dark (cool, recessive) EXCEPT one last lit pixel on the bell's
    rim — the spec's 'la campana vibrando un último pixel de brillo'. It sits
    BEHIND the left column (drawn before the gate) so the column crosses its face.
    """
    tx, ty, tw = 18, 86, 40
    roof_h, post_h = 14, 40
    # the open pavilion body: two dark posts (rain-dark, planted on the landing)
    fill(d, tx, ty + roof_h, tw, post_h, PAL["rain"][4])
    dither(d, tx + 2, ty + roof_h, tw - 4, post_h, OUTLINE, phase=1)
    vline(d, tx + 2, ty + roof_h, post_h, OUTLINE)            # post corners
    vline(d, tx + tw - 3, ty + roof_h, post_h, OUTLINE)
    # hipped giwa roof: a dark gabled wedge with curled eaves, lit ridge tile
    d.polygon([(tx - 4, ty + roof_h), (tx + 6, ty), (tx + tw - 6, ty),
               (tx + tw + 4, ty + roof_h)], fill=PAL["rain"][4], outline=OUTLINE)
    hline(d, tx + 6, ty, tw - 12, PAL["rain"][2])            # lit ridge
    hline(d, tx - 4, ty + roof_h, tw + 8, OUTLINE)           # heavy eave line
    for gx in range(tx, tx + tw, 4):                         # tile teeth
        d.point((gx, ty + roof_h - 1), fill=PAL["rain"][3])
    d.point((tx - 5, ty + roof_h - 2), fill=PAL["rain"][3])  # curled eave tips
    d.point((tx + tw + 4, ty + roof_h - 2), fill=PAL["rain"][3])
    # the bronze bell hung small inside the pavilion — bell_beom is ~46×70 by
    # default; here we want it SMALL (~16×24) so call it tiny. It will mostly read
    # as a dim bronze mass; we add the one last shine ourselves after.
    bx, byy = tx + tw // 2 - 8, ty + roof_h + 2
    C.bell_beom(d, bx, byy, w=16, h=24)
    # darken the whole tower into a rain silhouette (it's the cool far-left edge of
    # frame, against the warm gate) WITHOUT erasing the bell's form.
    dither(d, tx - 4, ty, tw + 8, roof_h + post_h, PAL["rain"][4], phase=0)
    # ...then the ONE last lit pixel on the bell rim (the spec's vibrating shine).
    # A single warm glint + a 1px halo so it survives but stays a 'last' spark.
    d.point((bx + 8, byy + 18), fill=PAL["gold_light"][0])
    d.point((bx + 8, byy + 17), fill=PAL["ember"][1])


# ── LANDING + STEPS: the wet golden mirror descending toward camera ───────────

def paint_stairs(d):
    """The wet stone landing + the golden stairway descending toward the camera.

    The steps are a LIT GOLDEN MIRROR (§3: 'los escalones encendidos de oro
    devuelven el templo como un espejo'): the broken warm sky pools on the wet
    stone. Built as receding treads getting WIDER and BRIGHTER toward the camera
    (low-angle), each with a lit gold nosing + a cooler shaded riser. This warm
    gold surface is what carries BOTH cast shadows — so keep it bright and even
    enough that a one-tone-darker shadow reads on it.
    """
    # the top landing first (where the monk + cat + columns plant): wet stone,
    # cool-warm, catching the gold break. A flat band from the gate foot.
    fill(d, 0, LANDING_Y, W, 14, PAL["stone"][1])
    dither(d, 0, LANDING_Y, W, 14, PAL["gold_light"][2], phase=0)   # warm wet sheen
    dither(d, 0, LANDING_Y, W, 6, PAL["stone"][2], phase=1)         # back grout shade
    hline(d, 0, LANDING_Y, W, PAL["stone"][2])

    # the golden stairway: receding treads, each wider + brighter toward camera.
    # Step geometry: top step narrow band high; bottom step a wide bright slab at
    # the frame foot. y-edges chosen so 4 treads fill LANDING_Y+14 .. H.
    step_edges = [164, 180, 200, 224, H]    # tread top-y boundaries
    # warm gold ramps for the mirror: brighter toward camera (front), but staying
    # GOLD (not white) so the mirror reads as 'oro' and a one-tone-darker shadow can
    # still read softly on it rather than as a hard black bar on near-white.
    gold_tread = [PAL["gold_light"][2], PAL["gold_light"][2],
                  PAL["gold_light"][1], PAL["gold_light"][0]]
    for i in range(len(step_edges) - 1):
        y0, y1 = step_edges[i], step_edges[i + 1]
        # treads inset narrower at the back (perspective): left/right margins
        # shrink toward the camera so the stair fans open toward us.
        m = 18 - i * 6
        if m < 0:
            m = 0
        x0, x1 = m, W - m
        # the lit gold tread surface (the mirror)
        fill(d, x0, y0, x1 - x0, y1 - y0, gold_tread[i])
        # warmer reflective core down the center (the sky pooling brightest mid-step)
        cw = (x1 - x0) - 24
        dither(d, x0 + 12, y0 + 1, cw, y1 - y0 - 2, PAL["gold_light"][0], phase=1)
        # cool grout/riser shade at the BACK edge of each tread (the step lip shadow)
        dither(d, x0, y0, x1 - x0, 3, PAL["stone"][2], phase=0)
        hline(d, x0, y0, x1 - x0, OUTLINE)                  # the step nosing line
        hline(d, x0, y0 + 1, x1 - x0, PAL["gold_light"][0])  # lit nosing highlight
        # the slab seams on the widest front steps (a few cool grout verticals)
        if i >= 1:
            for sx in range(x0 + 26, x1 - 10, 46):
                vline(d, sx, y0 + 3, y1 - y0 - 3, PAL["stone"][2])
    # the side margins beyond the fanning stair = darker wet stone (the stair walls)
    for i in range(len(step_edges) - 1):
        y0, y1 = step_edges[i], step_edges[i + 1]
        m = 18 - i * 6
        if m > 0:
            dither(d, 0, y0, m, y1 - y0, PAL["stone"][3], phase=0)
            dither(d, W - m, y0, m, y1 - y0, PAL["stone"][3], phase=1)
            fill(d, 0, y0, max(m - 4, 0), y1 - y0, PAL["stone"][3])
            fill(d, min(W - m + 4, W), y0, max(m - 4, 0), y1 - y0, PAL["stone"][3])


# ── THE TWO SHADOWS: the monk's, and the hidden 삿갓 (rule L2-b) ───────────────

def _shadow_blade(d, p_feet, p_head_c, half_feet, half_head, c, phase=None):
    """A long cast-shadow blade from feet → a head end, as a tapering quad + dither.

    p_feet=(x,y) attach point at the figure; p_head_c=(x,y) center of the far HEAD
    end (nearest camera, widest). half_feet/half_head = half-widths at each end.
    Fills the body quad in c; if phase given, also softens the far third with a
    dithered echo so the shadow's end melts into the gold (keeps it from 'shouting').
    """
    fx, fy = p_feet
    hx, hy = p_head_c
    d.polygon([(fx - half_feet, fy), (fx + half_feet, fy),
               (hx + half_head, hy), (hx - half_head, hy)], fill=c)
    if phase is not None:
        # soften the far third (toward the head) into a dithered fringe
        ty = fy + (hy - fy) * 2 // 3
        for yy in range(ty, hy):
            t = (yy - fy) / (hy - fy)
            cx = int(fx + (hx - fx) * t)
            hw = int(half_feet + (half_head - half_feet) * t)
            dither(d, cx - hw, yy, hw * 2, 1, c, phase=(yy + phase) % 2)


def paint_shadows(d):
    """The TWO shadows on the golden steps from where there is only one man (rule L2-b).

    'Two shadows from one man' read most elegantly as ONE primary blade with the
    second NESTED almost entirely inside it: the bodies merge, only the HEADS
    separate. At a glance you see the monk's single shadow down the gold; if you
    LOOK, a second head in a 삿갓 brim peeks out beside the bald one — findable, not
    obvious. Both fall on the UPPER-MID gold (gold_light[1]/[2]), never the near-white
    front slabs, where any dark shadow would be max-contrast and the 'one tone
    darker' gift could not stay quiet; on mid-gold RAIN_DEEP reads as a soft cool
    deepening. Both are slim (a slim standing figure casts a slim shadow).

    · SHADOW 1 (monk, obvious): cool stone[3], a clean bald ROUND head; drawn last
      so it dominates and swallows the second shadow's body.
    · SHADOW 2 (THE GIFT): RAIN_DEEP — one tone darker than the monk's, NO OUTLINE,
      no glow, no hotspot, no text. Its body runs nearly collinear with the monk's;
      only the hatted head, offset up-RIGHT, survives. The wide flat 삿갓 brim is the
      ONE legible signature a searching eye latches onto.
    """
    foot_x, foot_y = 159, LANDING_Y + 1     # both shadows attach here (monk's feet)

    # ── SHADOW 2 first (UNDER the monk's): the 삿갓, RAIN_DEEP, slim, head up-RIGHT.
    s2 = RAIN_DEEP
    hat_head = (153, 188)                   # head-end center: just up-RIGHT of monk's
    _shadow_blade(d, (foot_x + 1, foot_y), hat_head, 3, 4, s2)
    gx, gy = hat_head
    d.ellipse([gx - 4, gy - 1, gx + 4, gy + 6], fill=s2)   # small skull under the hat
    # the 삿갓 BRIM: a wide flat triangle above the head — the single legible signature
    # (fill-only, no outline, so it stays quiet but reads as a conical rain hat).
    by = gy - 2
    d.polygon([(gx, by - 4),                # apex (cone crown), pointing up
               (gx - 11, by + 1),           # wide LEFT brim tip
               (gx + 12, by + 1)], fill=s2) # wider RIGHT brim wing (the part that
                                            # peeks past the monk's head = the tell)
    hline(d, gx - 11, by + 1, 24, s2)       # the brim's flat defining underside
    d.point((gx - 11, by + 2), fill=s2)     # 1px tip droop (so it reads 삿갓)
    d.point((gx + 12, by + 2), fill=s2)
    d.point((gx + 12, by), fill=s2)         # square the right wing tip = hat edge

    # ── SHADOW 1 — the monk (the OBVIOUS one), drawn ON TOP so it dominates and the
    # 삿갓 survives only as a brim wing + skull sliver up-right of the bald head.
    # Stretches down-LEFT, cool stone, a clean readable bald round head. ───────────
    s1 = PAL["stone"][3]
    body_head = (148, 198)                  # far head-end center (mid-gold, near monk)
    _shadow_blade(d, (foot_x, foot_y), body_head, 5, 5, s1, phase=0)
    hx, hy = body_head
    # the bald ROUND head — the clearly-readable 'cabeza rapada' (a slightly flatter
    # oval so the shadow reads as a HEAD on a blade, not a club/bowling-pin)
    d.ellipse([hx - 7, hy - 2, hx + 7, hy + 8], fill=s1)


# ── 우담 + the cat on the landing (center, small) ─────────────────────────────

def paint_figures(d):
    """우담 in 합장 (center, small) + the cat at his feet looking off-frame right.

    monk(pose='gassho') is the small standing 합장 figure (~22×40); placed CENTER,
    SMALL on the landing so he reads as tiny against the broken sky (the spec's
    'pequeño contra el cielo roto'). The cat(frame=2) sits at his feet on the FIRST
    step, INSIDE the gate frame, turned to look at an empty point to his right
    (frame 2 = looking off-frame; rule §12.7 'el gato no cruza el 일주문').
    """
    # 우담, centered, standing on the landing, head bowed in 합장. Small.
    mx, my = 149, 100
    C.monk(d, mx, my, pose="gassho")
    # a warm rim of the gold break catching his shoulders/head from behind (he is
    # lit by the broken sky) — sparse so he stays small + reverent, not a beacon.
    d.point((mx + 4, my + 6), fill=PAL["gold_light"][2])    # head rim
    d.point((mx + 12, my + 6), fill=PAL["gold_light"][2])
    dither(d, mx + 3, my + 16, 12, 4, PAL["gold_light"][2], phase=1)  # robe rim

    # the cat at his feet on the FIRST step, inside the frame, looking off-right at
    # the empty point. frame=2 = head up-right, eyes off-frame.
    cx, cy = 168, 134
    C.cat(d, cx, cy, frame=2)
    # the cat's gaze line is implied by its frame-2 head; add a tiny warm catch in
    # its eye toward the empty point (it watches what isn't there).
    d.point((cx + 9, cy + 3), fill=PAL["gold_light"][0])


# ── FOREGROUND: petals, steam, the master's umbrella edge ─────────────────────

def _steam_wisp(d, sx, sy, height, seed):
    """One soft rising steam curl from (sx,sy): a meandering 1px column that fades
    warm-white → rain as it rises, with an occasional 2px thickening near the base.

    Asset-local (not rain_clear, whose regular columns + falling eave-drops read as
    'motas sueltas' here — the L1 vapor failure, and there's no eave over this
    landing). A gentle sine-ish drift via a fixed amp table keeps it a soft curl,
    not a straight tick. Deterministic: amp table indexed by k + seed, no random.
    """
    amp = (0, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 0, -1)
    for k in range(height):
        yy = sy - k
        ox = sum(amp[(j + seed) % len(amp)] for j in range(k)) // 3   # cumulative drift
        # warm near the stone → cool rain-light high up → dissolve at the top
        if k < height * 0.30:
            c = PAL["white"][0]
        elif k < height * 0.60:
            c = PAL["white"][1]
        elif k < height * 0.85:
            c = PAL["rain"][0]
        else:
            c = PAL["rain"][1]
        # thin the wisp out as it rises: skip more points toward the top so it melts
        if k > height * 0.6 and (k + seed) % 2 == 0:
            continue
        d.point((sx + ox, yy), fill=c)
        if k < height * 0.28:                       # a touch thicker at the warm base
            d.point((sx + ox + 1, yy), fill=PAL["white"][1])


def paint_foreground(d):
    """매화 petals on the wet stone, steam off the stone, the umbrella edge in hand."""
    # steam breathing off the warm wet stone after the rain — a FEW soft tall curls,
    # densest where the broken sky pools warmest (center, under the gate), thinning
    # toward the cool edges. Soft wisps, never a regular fence of ticks.
    # keep wisp bases OUT of the central shadow/monk zone (x≈140..182) so steam
    # never pierces the cast shadows or the figure with a bright vertical streak.
    wisps = [
        (104, 8), (120, 11), (134, 12),             # left of the monk/shadow
        (190, 10), (206, 12), (222, 9), (238, 7),   # right of the monk/shadow
        (88, 6),                                    # a lone curl toward the cool wing
    ]
    for i, (sx, hh) in enumerate(wisps):
        _steam_wisp(d, sx, LANDING_Y + 1, 26 + hh, seed=i * 3 + 1)
    # a couple of low forward curls off the lit front steps, also clear of center
    for i, sx in enumerate((96, 210, 244)):
        _steam_wisp(d, sx, 200, 14 + (i % 2) * 4, seed=i * 5 + 2)

    # 매화 petals settled on the wet stone — on the landing AND scattered on the lit
    # gold steps where they read as small cool flecks against the warm mirror.
    C.petals(d, 30, LANDING_Y + 2, 260, 12, n=16, seed=7)
    C.petals(d, 24, 168, 272, 40, n=22, seed=23)
    C.petals(d, 12, 210, 296, 26, n=14, seed=49)

    # the EDGE of the master's umbrella in YOUR hand, low foreground (see module
    # docstring for the asset-local-vs-builder rationale).
    paint_umbrella_edge(d)


def paint_umbrella_edge(d):
    """The lit lower EDGE of the master's oiled-paper umbrella arcing in from the
    frame foot (bottom-left): scalloped warm rim, radial ribs, ember under-glow
    where the broken sky catches the oiled paper. hanji ochre + wood_dark ribs."""
    paper, paper_e, paper_d = PAL["hanji"][1], PAL["hanji"][2], PAL["hanji"][3]
    rib = PAL["wood_dark"][2]
    cx = 92                           # apex x of the canopy — pushed LEFT so it
                                      # frames the corner, not the shadow heads
    apex_y = 240                      # the canopy crown sits at the very frame foot
    rad_w, rad_h = 130, 34            # a narrower, lower dome edge (just the rim)

    # the warm oiled-paper canopy: a wide shallow arc filling the bottom-center.
    # Filled by columns so it reads as a solid warm surface (the master's umbrella),
    # brightest at the crown, warm-shaded toward the rim.
    for xx in range(cx - rad_w // 2, cx + rad_w // 2):
        t = abs(xx - cx) / (rad_w / 2)
        # parabolic edge: the rim dips lower toward the sides
        top = int(apex_y - rad_h * (1 - t * t))
        if top < H - 1:
            for yy in range(top, H):
                # warm gradient: crown bright hanji → rim warmer ochre
                if yy - top < 4:
                    c = paper
                elif yy - top < 10:
                    c = paper_e
                else:
                    c = paper_d
                d.point((xx, yy), fill=c)
    # radial ribs fanning from the (off-frame) hub up through the canopy
    for dxb in range(-66, 67, 16):
        x1 = cx + dxb
        t = abs(dxb) / 66
        top = int(apex_y - rad_h * (1 - t * t))
        d.line([cx, H + 6, x1, top + 2], fill=rib)
    # the scalloped warm RIM (the umbrella's lit leading edge) + an ember under-glow
    # where the broken sky lights the oiled paper from above-front.
    for xx in range(cx - rad_w // 2, cx + rad_w // 2):
        t = abs(xx - cx) / (rad_w / 2)
        top = int(apex_y - rad_h * (1 - t * t))
        if 0 <= top < H:
            d.point((xx, top), fill=OUTLINE)               # the rim edge line
            if top - 1 >= 0:
                d.point((xx, top - 1), fill=PAL["ember"][0])   # warm lit hem glow
    # scallop notches along the rim (the paper umbrella's lobed edge) every ~16px
    for dxb in range(-64, 65, 16):
        xx = cx + dxb
        t = abs(dxb) / 66
        top = int(apex_y - rad_h * (1 - t * t))
        if 0 <= top < H:
            d.point((xx, top), fill=PAL["wood_dark"][2])   # a deeper notch
            if top + 1 < H:
                d.point((xx, top + 1), fill=PAL["ember"][1])
    # a couple of fat rain beads still clinging to the oiled paper (it just stopped)
    d.point((cx - 40, apex_y - 30), fill=PAL["rain"][0])
    d.point((cx + 34, apex_y - 28), fill=PAL["rain"][0])
    d.point((cx + 6, apex_y - 40), fill=PAL["white"][0])


# ── GATE: the 일주문 proscenium (low-angle, drawn IN FRONT) ───────────────────

def paint_gate(d):
    """iljumun() as the proscenium, low-angle — columns tower, lintel high.

    Drawn AFTER sky/tower/stairs/figures so the red columns + 단청 lintel frame the
    whole shot from in front (the proscenium read). The builder paints the two
    columns, the 단청 lintel beam, the giwa eave hint, and the 청우사 plaque (art,
    illegible at 1×, L2-a). We add a warm rim down the columns (lit by the broken
    sky) + a cool wet base where they plant on the landing.
    """
    C.iljumun(d, GATE_X, GATE_Y, GATE_W, GATE_H)
    col_w = 16
    for colx in (GATE_X, GATE_X + GATE_W - col_w):
        # warm rim on the inner edge of each column (the gold break lights them)
        vline(d, colx + col_w - 2, GATE_Y + 16, GATE_H - 16, PAL["ember"][1])
        dither(d, colx + col_w - 4, GATE_Y + 30, 3, GATE_H - 56, PAL["gold_light"][2],
               phase=1)
        # a cool wet contact where the column meets the wet landing
        hline(d, colx - 1, LANDING_Y - 1, col_w + 2, PAL["rain"][1])
        drop_shadow(d, colx, LANDING_Y, col_w, 2, cool=True)
    # the plaque hangs under the lintel; weathered/illegible grime + a wet glint on
    # its cords (reinforce 'rough art, not text' at 1×, L2-a).
    px = GATE_X + (GATE_W - 46) // 2
    py = GATE_Y + 18
    for cordx in (px + 8, px + 38):
        vline(d, cordx, GATE_Y + 16, 2, PAL["wood_dark"][3])
    dither(d, px + 2, py + 3, 42, 11, PAL["wood_dark"][2], phase=1)
    drop_shadow(d, px, py + 16, 46, 2, cool=True)
    # a faint warm wash spilling through the gate opening onto the upper landing
    # (the break's light reaching the temple floor between the columns).
    dither(d, GATE_X + 18, LANDING_Y - 6, GATE_W - 36, 6, PAL["gold_light"][2],
           phase=0)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][3])
    paint_sky(d)              # broken storm + ROSE_GOLD rays through the gate
    paint_jongnu(d)           # the 종루 tower far left, bell holding one shine
    paint_stairs(d)           # the wet golden stairway mirror + landing
    paint_shadows(d)          # the TWO shadows on the gold (monk + hidden 삿갓)
    paint_figures(d)          # 우담 in 합장 + the cat at his feet
    paint_foreground(d)       # petals, steam, the master's umbrella edge
    paint_gate(d)             # the 일주문 proscenium IN FRONT, low-angle
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "cinematic-outro.png")
    C.preview(img, "preview_cinematic-outro.png", scale=3)
    # not a slotted room, but overlay the spec-element rects to confirm placement
    C.hotspot_debug(img, CHECK_RECTS, "hotspot_cinematic-outro.png", scale=3)


if __name__ == "__main__":
    main()
