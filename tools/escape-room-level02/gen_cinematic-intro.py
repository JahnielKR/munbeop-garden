#!/usr/bin/env python3
"""cinematic-intro.png — the opening cinematic of Level 2 «El templo de la lluvia».

Dossier §3 Intro + §11. Arrival: the player has climbed the wet stone stairway
and stands soaked at the top, the skeleton of a 3000-won convenience-store
umbrella still in hand. Over their head, the 일주문 (one-pillar gate) frames the
view, its 청우사 plaque hanging from the lintel (rough/illegible by design).
Beyond the gate, the courtyard is ONE curtain of water (heavy rain_curtain). A
late-blooming 매화 (plum) branch drops white petals to the mud. FOREGROUND
bottom = the broken transparent umbrella (caved canopy, bent ribs). Storm/night
sky above. Tone: arrival, soaked, melancholy — NOT bleak.

Composition (320×240, the gate as an architectural proscenium, level eye-line —
the outro will mirror this same gate from below; here we look straight in):
  SKY    : storm/night band at the top, rain falling across the whole frame.
  GATE   : iljumun() centered, lintel + 단청 beam high, 청우사 plaque hanging,
           two red columns dropping to the wet flagstones. It frames the court.
  COURT  : behind/through the gate — a CURTAIN of water over dim temple-roof
           silhouettes; the plum_branch reaching in from the right, petals
           drifting down to the mud floor.
  GROUND : wet stone flagstones / mud at the gate's foot, the top step of the
           stairway, puddles catching the cold sky; petals settling in the mud.
  FORE   : the broken_umbrella held low-center in the foreground (the player's),
           bottom of frame — the one thing in the player's own hand.

Shared builders used: iljumun (gate + 청우사 plaque), rain_curtain (the courtyard
downpour + foreground rain), plum_branch (the late plum), petals (drift + mud).
The foreground umbrella is drawn asset-local (see paint_umbrella): the shared
broken_umbrella() builder is ~30px and scales to an illegible blob as the bottom-
of-frame HERO, so this paints a LARGER umbrella from the SAME anatomy + the SAME
`metal` ramp (same recognizable motif: transparent conv-store umbrella, one caved
side, a snapped rib, bent shaft). Everything else (storm sky, temple-roof
silhouettes behind the curtain, the flagstones/mud/puddles, the top step) is
asset-local detail painted AROUND the builders, per STYLE.md rule 2.

No legible Korean in-scene (L2-a): the only hangul is the 청우사 plaque drawn AS
ART by iljumun()/_plaque_cheongwusa() — rough, not a font, unreadable at 1×.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_cinematic-intro.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, RAIN_DEEP, fill, frame, hline, vline, dither,
                   drop_shadow)

W, H = 320, 240

# The gate footprint (iljumun x,y,w,h). Centered, lintel high, columns to ground.
GATE_X, GATE_Y, GATE_W, GATE_H = 86, 40, 148, 150
GROUND_Y = 178          # where the wet flagstones / mud begin (top of stairway)

# "Hotspot"-style sanity rects (this is a cinematic — no real slot hotspots; we
# overlay these only to confirm each named element sits where the spec wants it).
CHECK_RECTS = [
    (GATE_X, GATE_Y, GATE_W, GATE_H),   # the 일주문 gate frame
    (133, 58, 50, 18),                  # the 청우사 plaque (under the lintel)
    (172, 116, 56, 64),                 # the plum branch in the courtyard
    (114, 174, 86, 60),                 # the broken umbrella (foreground hero)
]


# ── SKY: storm / night, rain coming down across the whole frame ──────────────

def paint_sky(d):
    """A wet storm/night sky: cool slate bands, darker at the top, rain falling.

    Melancholy not bleak — so the sky is rain-slate (cool) with a faint warmer
    bruise low on the horizon (a last bit of evening behind the downpour), never
    pure black. The night ramp tints only the very top so it reads as 'late,
    storm' rather than 'midnight'.
    """
    # base cool slate, light→dark from horizon up (banded, no smooth gradient)
    bands = [
        (0,   26, PAL["night"][3]),     # darkest at the very top
        (26,  22, PAL["night"][2]),
        (48,  24, PAL["rain"][4]),
        (72,  30, PAL["rain"][3]),
        (102, 40, PAL["rain"][2]),      # lighter wet haze toward the horizon
    ]
    for by, bh, c in bands:
        fill(d, 0, by, W, bh, c)
    # dither the band seams so they don't read as hard stripes
    dither(d, 0, 24, W, 4, PAL["night"][2], phase=0)
    dither(d, 0, 46, W, 4, PAL["rain"][4], phase=1)
    dither(d, 0, 70, W, 4, PAL["rain"][3], phase=0)
    dither(d, 0, 100, W, 4, PAL["rain"][2], phase=1)
    # a faint warm bruise of dying evening light low behind the temple (precious
    # warmth, very sparse — the spec's 'not bleak'); kept cool-warm, dithered.
    for yy in range(96, 132):
        t = (yy - 96) / 36
        if (yy % 2) == 0:
            dither(d, 96, yy, 128, 1, PAL["ember"][3], phase=(yy % 2))
    dither(d, 110, 108, 100, 16, PAL["ember"][3], phase=1)
    # full-frame rain over the sky (far, light) — the downpour reaches the camera
    C.rain_curtain(d, 0, 0, W, GROUND_Y, phase=0, density=9, lean=2)


# ── COURT: the curtain of water seen THROUGH the gate, roof silhouettes ──────

def paint_courtyard(d):
    """Through the gate: dim temple-roof silhouettes drowned in a water curtain.

    The whole courtyard is 'una sola cortina de agua' (§3): a dense rain_curtain
    over barely-there roof silhouettes, so the eye reads depth (a temple back
    there) but everything dissolves into rain. Cool, recessive — the warm gate
    columns in front will pop against it.
    """
    cx, cy = GATE_X + 8, GATE_Y + 18          # courtyard opening inside the gate
    cw, ch = GATE_W - 16, GROUND_Y - cy
    # the wet far space the courtyard sits in: a vertical wash, lighter (hazier)
    # high near the sky, darkening toward the muddy ground — so it reads as deep
    # open space full of rain, not a flat wall. Mid rain-tone, not pale.
    for yy in range(cy, cy + ch):
        t = (yy - cy) / ch
        c = PAL["rain"][2] if t < 0.30 else (PAL["rain"][3] if t < 0.72
                                             else PAL["rain"][4])
        hline(d, cx, yy, cw, c)
    dither(d, cx, cy, cw, ch, PAL["rain"][3], phase=1)            # break the bands

    # --- dim temple-roof silhouettes, drowned mid-depth, SITTING ON A GROUND ----
    # a far courtyard ground line gives the buildings something to stand on so
    # they don't float; the halls are darker rain-tone gabled roofs on faint
    # wall blocks, just legible as buildings through the rain.
    far_ground = cy + ch - 26
    hline(d, cx, far_ground, cw, PAL["rain"][4])                  # far courtyard line
    dither(d, cx, far_ground, cw, 4, PAL["rain"][4], phase=0)

    def building(rx, base_y, rw, roof_h, wall_h):
        # dark wall block under the roof (so the roof has a body, stands on land).
        # rain[4] body with a darker OUTLINE base so it reads through the curtain.
        fill(d, rx + 3, base_y - wall_h, rw - 6, wall_h, PAL["rain"][4])
        dither(d, rx + 3, base_y - wall_h, rw - 6, wall_h, OUTLINE, phase=1)
        vline(d, rx + 3, base_y - wall_h, wall_h, OUTLINE)        # wall corners
        vline(d, rx + rw - 4, base_y - wall_h, wall_h, OUTLINE)
        ry = base_y - wall_h - roof_h
        # gabled eave wedge: a SOLID dark roof so it survives the curtain. Body in
        # rain[4], a hard OUTLINE underside + ridge, lit ridge tile on top.
        d.polygon([(rx, ry + roof_h), (rx + 5, ry), (rx + rw - 5, ry),
                   (rx + rw, ry + roof_h)], fill=PAL["rain"][4], outline=OUTLINE)
        hline(d, rx + 5, ry, rw - 10, PAL["rain"][2])            # lit ridge tile
        hline(d, rx, ry + roof_h, rw, OUTLINE)                   # heavy eave line
        hline(d, rx, ry + roof_h + 1, rw, RAIN_DEEP)             # eave shadow
        for tx in range(rx + 2, rx + rw - 1, 4):
            d.point((tx, ry + roof_h - 1), fill=PAL["rain"][2])  # tile teeth
        # curled eave tips (the giwa read) lifting at both ends
        d.point((rx - 1, ry + roof_h - 2), fill=PAL["rain"][3])
        d.point((rx + rw, ry + roof_h - 2), fill=PAL["rain"][3])

    building(cx + 2, far_ground, 64, 15, 20)     # main hall, left-center, larger
    building(cx + 74, far_ground, 44, 12, 15)    # a smaller building, right/behind
    # a faint courtyard lantern post between them (a stone 석등 hint)
    px0 = cx + 68
    vline(d, px0, far_ground - 16, 16, PAL["rain"][4])
    fill(d, px0 - 1, far_ground - 18, 3, 3, PAL["rain"][3])       # lantern head

    # --- the DENSE water curtain over all of it (the courtyard's defining read) -
    # two offset speckle passes + vertical sheets read as a heavy CURTAIN of water
    # WITHOUT fully erasing the roof silhouettes behind it (§3 'una sola cortina
    # de agua' — the temple is still glimpsed THROUGH the rain).
    C.rain_curtain(d, cx, cy, cw, ch, phase=0, density=6, lean=2)
    C.rain_curtain(d, cx, cy, cw, ch, phase=1, density=7, lean=3)
    # a thin cool diffusing film ONLY over the upper courtyard (above the roofs)
    # so the buildings low down stay legible through the rain
    dither(d, cx, cy, cw, far_ground - cy - 8, PAL["rain"][1], phase=0)
    # vertical sheets of falling water (longer near-vertical streaks) so the read
    # is a 'curtain', not just speckle — sparse, cool-bright, full height.
    for vx in range(cx + 6, cx + cw - 4, 12):
        for vy in range(cy + 2, cy + ch - 2, 9):
            d.point((vx, vy), fill=PAL["rain"][1])
            if vy + 1 < cy + ch:
                d.point((vx, vy + 1), fill=PAL["rain"][1])


# ── COURT TREE: the late-blooming plum reaching in, petals to the mud ────────

def paint_plum(d):
    """A late 매화 branch reaching in from the right, dropping petals to the mud.

    plum_branch(x,y,...) grows up-and-right from its root (x,y); to have it reach
    IN from the right edge of the courtyard we root it at the lower-right of the
    courtyard opening so the bough arcs up toward frame-right with blossoms, and
    petals() scatters a drift down its left side into the mud. White petals are
    the one bright cool-warm accent inside the gray curtain.
    """
    # root the branch INSIDE the courtyard (left of the right column, on the far
    # courtyard ground) so the bough arcs up into the rain and reads as the
    # courtyard tree — not a bonsai sitting on the right column. It's drawn before
    # the gate, so the right column will cross in front of its lower trunk (depth).
    C.plum_branch(d, 196, GROUND_Y - 4, 26, 58, seed=49)
    # a drifting fall of petals down through the courtyard toward the mud
    C.petals(d, 150, 96, 60, 76, n=20, seed=7)
    # petals already settled in the wet mud at the gate's foot (a few, low)
    C.petals(d, 150, GROUND_Y + 2, 90, 10, n=12, seed=23)


# ── GROUND: wet flagstones / mud, top step of the stairway, puddles ──────────

def paint_ground(d):
    """The wet stone flagstones + mud at the gate's foot, the stairway's top step.

    The player stands at the top of the stairway: foreground is the wet top step
    + flagstones, catching the cold sky in shallow puddles. Cool throughout
    (exterior rain → SHADOW_COOL family). Petals settle here; the mud is darkest
    right under the gate so the columns feel planted.
    """
    # the wet ground slab: stone[2]/stone[3] cool, mud darker toward the back
    fill(d, 0, GROUND_Y, W, H - GROUND_Y, PAL["stone"][2])
    dither(d, 0, GROUND_Y, W, 14, PAL["stone"][3], phase=0)     # wet back band (mud)
    dither(d, 0, GROUND_Y, W, H - GROUND_Y, PAL["rain"][4], phase=1)  # cool wet film
    # flagstone seams: a few broad slabs (irregular grid), cool grout lines
    for sy in range(GROUND_Y + 10, H, 12):
        hline(d, 0, sy, W, PAL["stone"][3])
        dither(d, 0, sy - 1, W, 1, PAL["rain"][3], phase=(sy % 2))   # wet sheen on seam
    seam_x = [40, 96, 150, 150, 210, 264]
    for i, sx in enumerate(range(0, W, 54)):
        off = seam_x[i % len(seam_x)] % 18
        vline(d, sx + off, GROUND_Y + 10, H - GROUND_Y - 10, PAL["stone"][3])
    # the TOP STEP of the stairway crossing the lower foreground (the player's
    # footing): a stone lip with a lit cool edge + a shadowed riser dropping away.
    step_y = 214
    fill(d, 0, step_y, W, 4, PAL["stone"][1])                   # lit tread nosing
    hline(d, 0, step_y, W, PAL["stone"][0])
    dither(d, 0, step_y + 4, W, H - step_y - 4, PAL["stone"][3], phase=0)  # riser shade
    dither(d, 0, step_y + 6, W, H - step_y - 6, PAL["rain"][4], phase=1)
    hline(d, 0, step_y + 3, W, OUTLINE)                         # step shadow line

    # cold puddles catching the slate sky (reflective cool pools, dithered, NOT
    # ring outlines — a few flat elliptical patches with a sky-light sheen).
    def puddle(px, py, pw, ph):
        d.ellipse([px, py, px + pw, py + ph], fill=PAL["rain"][3])
        dither(d, px + 2, py + 1, pw - 4, ph - 2, PAL["rain"][2], phase=1)
        hline(d, px + 3, py + 1, pw - 6, PAL["rain"][1])        # sky sheen on top
        d.ellipse([px, py, px + pw, py + ph], outline=PAL["stone"][3])
    puddle(28, GROUND_Y + 18, 40, 9)
    puddle(112, GROUND_Y + 26, 34, 8)
    puddle(244, GROUND_Y + 20, 38, 9)
    # darkest mud directly under the gate columns so they read as planted
    dither(d, GATE_X - 6, GROUND_Y, 26, 16, PAL["rain"][4], phase=0)
    dither(d, GATE_X + GATE_W - 20, GROUND_Y, 26, 16, PAL["rain"][4], phase=0)


# ── FOREGROUND: rain falling in front of the gate + the broken umbrella ──────

def paint_foreground_rain(d):
    """Near, heavier rain falling IN FRONT of the gate (depth: rain reaches camera)."""
    # a denser, darker near pass over the lower half so the gate sits BEHIND rain
    C.rain_curtain(d, 0, 60, W, GROUND_Y - 40, phase=1, density=6, lean=2)
    # the splash line where near rain hits the wet step (1px cool ticks)
    for sx in range(6, W, 17):
        d.point((sx, 213), fill=PAL["rain"][1])
        d.point((sx + 1, 212), fill=PAL["rain"][0])


def paint_umbrella(d):
    """The broken transparent convenience-store umbrella, the foreground HERO.

    A ~72px dome (rationale for asset-local vs the builder: see module docstring).
    LEFT half intact (translucent dithered film + solid spars + a dark rim arc so
    the dome silhouette reads); RIGHT half COLLAPSED (spars folded down, one rib
    SNAPPED, kinking up-out past the rim). A local RAIN_DEEP smear under it gives
    the pale plastic contrast against the busy ground. The bent metal shaft runs
    straight off the BOTTOM edge — the player holds it low, below the camera.
    """
    rib, rib_d, film, film_hi = (PAL["metal"][2], PAL["metal"][3],
                                 PAL["metal"][1], PAL["metal"][0])
    cx = 152                       # ferrule / hub x (apex of the dome)
    cy = 184                       # apex y (raised so the step seam clears the rim)
    shaft_x = cx

    # ── local contrast patch: a darker wet smear UNDER the umbrella so its pale
    # plastic + metal ribs read against the busy gray ground (the L1 'prop lost in
    # the texture' fix). Cool, dithered, dome-shaped footprint.
    for yy in range(cy - 4, cy + 26):
        half = 40 - abs(yy - (cy + 8))            # widest at the canopy
        if half < 6:
            half = 6
        dither(d, cx - half, yy, half * 2, 1, RAIN_DEEP, phase=(yy % 2))

    # ── DOME SILHOUETTE first: a solid translucent canopy so the umbrella reads
    # as a DOME, not a scatter of lines. A shallow half-ellipse of pale wet film,
    # then the ribs + a strong OUTLINE rim drawn on top.
    dome_w, dome_h = 72, 22
    # the caved RIGHT side dips lower than the intact left — so build the dome as
    # two arcs: left clean (y = cy+dome_h), right collapsed (sags + folds in).
    # filled translucent film body (dithered = clear plastic, with a denser core)
    for yy in range(cy, cy + dome_h + 4):
        t = (yy - cy) / dome_h
        lhalf = int((dome_w // 2) * (1 - (t - 0.0) ** 2) ** 0.5) if t <= 1 else 0
        # left edge straight, right edge pulled IN (collapsed) as yy grows
        xl = cx - lhalf
        xr = cx + max(2, lhalf - int(t * 16))     # right side caves inward
        for xx in range(xl, xr):
            if (xx + yy) % 2 == 0:
                d.point((xx, yy), fill=film)
            elif (xx * 2 + yy) % 5 == 0:
                d.point((xx, yy), fill=PAL["metal"][2])   # denser wet flecks
    # bright taut-film highlights on the intact left slope
    for (hx, hy) in ((cx - 20, cy + 4), (cx - 28, cy + 9), (cx - 12, cy + 12),
                     (cx - 6, cy + 3)):
        d.point((hx, hy), fill=film_hi)

    # ── INTACT LEFT HALF ribs: spars fanning from hub to the rim (solid = reads) ─
    left_tips = [(cx - 34, cy + 3), (cx - 30, cy + 11), (cx - 20, cy + 18),
                 (cx - 8, cy + 21)]
    for tip in left_tips:
        d.line([cx, cy + 2, tip[0], tip[1]], fill=rib)
        d.line([cx, cy + 3, tip[0], tip[1] + 1], fill=rib_d)   # 2px = reads as rib
    # the dome RIM arc on the left (a strong dark edge so the silhouette pops)
    rim_l = [(cx - 34, cy + 3), (cx - 30, cy + 11), (cx - 20, cy + 18),
             (cx - 8, cy + 21), (cx, cy + 22)]
    for a, b in zip(rim_l, rim_l[1:]):
        d.line([a[0], a[1], b[0], b[1]], fill=OUTLINE)
    d.line([cx - 34, cy + 3, cx - 30, cy - 1], fill=OUTLINE)   # rim up to apex

    # ── COLLAPSED RIGHT HALF: folded spars + a SNAPPED rib jutting out ─────────
    d.line([cx, cy + 2, cx + 18, cy + 18], fill=rib_d)        # caved spar 1 (steep)
    d.line([cx + 18, cy + 18, cx + 14, cy + 22], fill=rib_d)  # ...kinks down/in
    d.line([cx, cy + 2, cx + 28, cy + 12], fill=rib_d)        # caved spar 2
    d.line([cx + 28, cy + 12, cx + 24, cy + 20], fill=rib_d)  # ...folds down
    # the collapsed rim (sagging, drawn dark)
    d.line([cx, cy + 22, cx + 14, cy + 22], fill=OUTLINE)
    d.line([cx + 14, cy + 22, cx + 24, cy + 20], fill=OUTLINE)
    # the SNAPPED rib: kinks up + OUT past the rim, broken tip at the sky (the
    # single most legible 'broken umbrella' signal — keep it clean + sharp)
    d.line([cx + 28, cy + 12, cx + 40, cy - 1], fill=rib)
    d.line([cx + 29, cy + 12, cx + 41, cy - 1], fill=rib_d)
    d.line([cx + 40, cy - 1, cx + 45, cy - 8], fill=rib)
    d.point((cx + 45, cy - 9), fill=OUTLINE)                  # broken rib tip
    # a torn shred of film flapping off the caved side
    d.line([cx + 24, cy + 20, cx + 28, cy + 26], fill=film)
    d.point((cx + 29, cy + 27), fill=film_hi)

    # ── HUB + bent ferrule at the apex ────────────────────────────────────────
    fill(d, cx - 2, cy - 1, 5, 4, rib)                       # hub collar
    frame(d, cx - 2, cy - 1, 5, 4, OUTLINE)
    d.point((cx, cy - 3), fill=rib_d)                        # bent ferrule stub
    d.point((cx - 1, cy - 4), fill=rib_d)
    d.point((cx, cy), fill=film_hi)                          # wet glint on the hub

    # ── bare bent shaft running straight off the BOTTOM EDGE of the frame ──────
    # No literal hand (skin read as a 'wooden box' in review): instead the shaft
    # simply exits the frame, implying the player holds it low, below the camera —
    # cleaner, and exactly the foreground-POV the spec wants. A slight bend in the
    # shaft (the storm wrenched it) keeps it from being a dead straight pole.
    shaft_top = cy + 3
    bend_y = 214                                            # where the shaft kinks
    # upper segment: vertical from the hub
    for yy in range(shaft_top, bend_y):
        d.point((shaft_x - 1, yy), fill=PAL["metal"][1])   # wet lit edge
        d.point((shaft_x, yy), fill=rib)
        d.point((shaft_x + 1, yy), fill=rib_d)
    # lower segment: kinks a touch to the left as it drops off-frame (bent shaft)
    for i, yy in enumerate(range(bend_y, H)):
        ox = -(i // 8)
        d.point((shaft_x - 1 + ox, yy), fill=PAL["metal"][1])
        d.point((shaft_x + ox, yy), fill=rib)
        d.point((shaft_x + 1 + ox, yy), fill=rib_d)
    # the bend joint glint
    d.point((shaft_x, bend_y), fill=PAL["metal"][0])
    # fat beads of rain clinging to the broken skeleton (it's soaked through)
    d.point((cx + 40, cy - 2), fill=PAL["rain"][0])
    d.point((cx - 30, cy + 6), fill=PAL["rain"][0])
    d.point((cx + 10, cy + 16), fill=PAL["rain"][0])


# ── GATE: the 일주문 proscenium with the 청우사 plaque ─────────────────────────

def paint_gate(d):
    """iljumun() — the gate framing the view; its 청우사 plaque hangs from the lintel.

    Drawn AFTER the courtyard/plum/ground so the red columns + 단청 beam sit IN
    FRONT of the water curtain (the proscenium read). The builder paints the two
    columns, the 단청 lintel beam, the giwa eave hint, and the 청우사 plaque drawn
    as rough art (L2-a: not a font, unreadable at 1×). We add wet sheen on the
    columns + a cool rim so the gate reads as rain-soaked lacquered wood.
    """
    C.iljumun(d, GATE_X, GATE_Y, GATE_W, GATE_H)
    # rain-wet sheen running down the two columns (cool vertical highlight) so
    # the lacquer reads as soaked, catching the cold courtyard light.
    col_w = 16
    for colx in (GATE_X, GATE_X + GATE_W - col_w):
        vline(d, colx + 2, GATE_Y + 16, GATE_H - 16, PAL["rain"][1])   # wet streak
        dither(d, colx + 1, GATE_Y + 30, 3, GATE_H - 60, PAL["white"][2], phase=1)
        # a cold contact rim where the column meets the wet ground
        hline(d, colx - 1, GROUND_Y - 1, col_w + 2, PAL["rain"][1])
    # a few drips falling from the eave/lintel of the gate (it sheds the storm)
    for dx in range(GATE_X + 6, GATE_X + GATE_W - 4, 19):
        d.point((dx, GATE_Y + 18), fill=PAL["rain"][1])
        d.point((dx, GATE_Y + 21), fill=PAL["rain"][0])
    # the plaque hangs UNDER the lintel; give its cords a wet glint + reinforce
    # the 'rough/illegible' read with a faint cool grime film over the glyphs.
    px = GATE_X + (GATE_W - 46) // 2
    py = GATE_Y + 18
    for cordx in (px + 8, px + 38):
        vline(d, cordx, GATE_Y + 16, 2, PAL["wood_dark"][3])       # hanging cords
    dither(d, px + 2, py + 3, 42, 11, PAL["wood_dark"][2], phase=1)  # weathered grime
    drop_shadow(d, px, py + 16, 46, 2, cool=True)                  # plaque shadow


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][3])
    paint_sky(d)                 # storm/night + full-frame falling rain
    paint_courtyard(d)           # the water curtain + roof silhouettes (through gate)
    paint_plum(d)                # the late plum reaching in, petals drifting
    paint_ground(d)              # wet flagstones / mud / top step / puddles
    paint_gate(d)                # the 일주문 proscenium IN FRONT of the curtain
    paint_foreground_rain(d)     # near heavier rain in front of the gate
    paint_umbrella(d)            # the broken umbrella, low foreground (player's)
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "cinematic-intro.png")
    C.preview(img, "preview_cinematic-intro.png", scale=3)
    # not a slotted room, but overlay the spec-element rects to confirm placement
    C.hotspot_debug(img, CHECK_RECTS, "hotspot_cinematic-intro.png", scale=3)


if __name__ == "__main__":
    main()
