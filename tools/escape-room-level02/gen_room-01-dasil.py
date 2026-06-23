#!/usr/bin/env python3
"""room-01-dasil.png — 다실 (tea room), Level 2 Cuarto 1.

Dossier §6 Cuarto 1: an intimate dark-wood interior in penumbra. The narrative
temperature split IS the composition — a COLD lattice window (창호) with the rain
curtain behind it on the LEFT, against the WARM brazier (화로, the ONLY warm key
light) on the RIGHT. 우담 sits center-right cradling a teapot; the player kneels
at the near cushion. The whole room says: «차는 따뜻할 때 마셔요.»

Layout (320×240, frontal-flat like every room):
  LEFT  : 창호 lattice window with hanji panes, rain_curtain behind it; the cold
          end of the room. window-dasil cosmetic [10,60,60,90], center (40,105).
  CENTER: a low tea table (소반) with TWO tea_cup — one at the player cushion in
          the lower FOREGROUND-right, one by the second cushion to the monk's
          right; the SECOND steams (tea_cup steam=True). 우담 monk(seated_tea)
          center-right, hands cradling a small teapot. monk-tea SLOT1
          [120,95,55,75], center (147,132).
  RIGHT : brazier_hwaro (orange embers — the warm key) with cat(frame=0) curled
          beside it. cat cosmetic [240,150,40,30], center (260,165).
  BACK-R: a low stand by the entrance with the closed 방명록 (guestbook).
          guestbook cosmetic [273,118,34,44], center (290,140).
  BACK  : a wall shelf with stacked celadon bowls; hanji_wall + wood beams.
  FLOOR : warm ondol planks.

HOTSPOT-CRITICAL: second-cup [205,165,28,24] sits ENTIRELY OUTSIDE the monk rect
[120,95,55,75] (the engine has no overlap priority — dossier §6 hotspot note).
The player cup at the near cushion lands inside second-cup's rect; the monk's own
cup is tucked under his rect, never the cosmetic one.

Shared builders used: monk(seated_tea), tea_cup (×2, same vessel as
obj-second-cup), brazier_hwaro, cat(0), guestbook, rain_curtain, hanji_wall,
wood_planks, drop_shadow + dither primitives. Everything else (window lattice,
the 소반 table, cushions, shelf+bowls, the teapot, the entrance stand) is
asset-local detail painted AROUND those builders, per STYLE.md rule 2.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-01-dasil.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240
FLOOR_Y = 150            # wall/floor seam (STYLE: y≈140–155)

# Hotspot rects from the seed (320×240 space) — confirmed against level-02.ts.
RECTS = [
    (120, 95, 55, 75),   # monk-tea (SLOT1) — the MONK FIGURE only
    (240, 150, 40, 30),  # cat (cosmetic)
    (205, 165, 28, 24),  # second-cup (cosmetic) — OUTSIDE the monk rect
    (273, 118, 34, 44),  # guestbook (cosmetic)
    (10, 60, 60, 90),    # window-dasil (cosmetic)
]


# ── Background: warm dark-wood interior in penumbra ──────────────────────────

def paint_room_shell(d):
    """Warm hanji wall + dim wood beams + warm ondol plank floor, in penumbra.

    The room is dark wood (spec): so the wall is a DIMMED warm hanji (pushed a
    step darker by a cool film) and the floor is warm planks — but only the
    brazier side gets real warmth. The cold the window throws is added later.
    """
    # back wall — warm paper, but dim (penumbra). Base a mid hanji, then a thin
    # cool dimming film so it reads as a dark room, not a bright daytime wall.
    fill(d, 0, 0, W, FLOOR_Y, PAL["hanji"][2])
    C.hanji_wall(d, 0, 0, W, FLOOR_Y, ramp=PAL["hanji"])
    dither(d, 0, 0, W, FLOOR_Y, PAL["wood_dark"][0], phase=0)   # warm penumbra
    dither(d, 0, 0, W, 18, PAL["wood_dark"][2], phase=1)        # darker near ceiling
    # horizontal wood beam along the top of the wall (도리/장혀)
    fill(d, 0, 0, W, 10, PAL["wood_dark"][1])
    hline(d, 0, 0, W, PAL["wood_dark"][0])
    dither(d, 0, 6, W, 4, PAL["wood_dark"][3], phase=0)
    hline(d, 0, 10, W, OUTLINE)
    # vertical wood posts (기둥) framing the wall into panels — dark, austere
    for px in (66, 226):
        fill(d, px, 0, 6, FLOOR_Y, PAL["wood_dark"][2])
        vline(d, px, 0, FLOOR_Y, PAL["wood_dark"][1])
        vline(d, px + 5, 0, FLOOR_Y, PAL["wood_dark"][3])
        dither(d, px + 1, 0, 4, FLOOR_Y, PAL["wood_dark"][3], phase=0)
    # wood skirting board at the wall/floor seam
    fill(d, 0, FLOOR_Y - 6, W, 6, PAL["wood_dark"][1])
    hline(d, 0, FLOOR_Y - 6, W, PAL["wood_light"][2])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    # floor — warm ondol planks (the 다실 is a warm interior, unlike room-03)
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["wood_light"], plank_h=10,
                  seam_every=3)
    # the LEFT (window) end of the floor is cooler; the RIGHT (brazier) warmer.
    # A GENTLE scattered temperature gradient, NOT a hard half-and-half dither
    # (round-3 'orange rug') and NOT vertical column lines (round-4 'striped rug').
    # Each end stipples sparse points whose DENSITY fades toward the room centre,
    # using a deterministic checker keyed on (x,y) so it reads as soft ambient
    # light pooling from each side — no random, no stripes.
    def temp_wash(x0, x1, col, wall_x):
        """Stipple sparse points, densest at wall_x, fading to 0 by the far end."""
        far = max(abs(x1 - wall_x), abs(x0 - wall_x))
        for y in range(FLOOR_Y, H):
            for x in range(x0, x1):
                t = 1.0 - abs(x - wall_x) / far   # 1 at the wall, → 0 at the centre
                if (x + y) % 2 != 0:              # checker subset only
                    continue
                m = 2 if t > 0.6 else (4 if t > 0.3 else 8)
                if ((x * 3 + y * 7) % m) == 0:
                    d.point((x, y), fill=col)
    temp_wash(0, 150, PAL["rain"][3], wall_x=0)      # cool from the window, fades in
    temp_wash(196, 320, PAL["ember"][3], wall_x=320)  # warm from brazier side


# ── LEFT: 창호 lattice window + rain curtain ([10,60,60,90]) ──────────────────

def paint_window(d):
    """창호 lattice window with hanji panes; the cold rain curtain behind it.

    The cold key of the scene. Hotspot [10,60,60,90], center (40,105): the
    window body is centered there. Cold blue-gray so it reads against the warm
    wall — the temperature contrast the dossier asks for.
    """
    wx, wy, ww, wh = 12, 62, 56, 86          # window opening (inside the rect)
    # recessed dark frame reveal
    fill(d, wx - 4, wy - 4, ww + 8, wh + 8, PAL["wood_dark"][3])
    frame(d, wx - 4, wy - 4, ww + 8, wh + 8, OUTLINE)
    # the cold wet exterior behind the paper: slate sky + the rain curtain.
    fill(d, wx, wy, ww, wh, PAL["rain"][3])
    dither(d, wx, wy, ww, wh, PAL["rain"][4], phase=0)
    C.rain_curtain(d, wx, wy, ww, wh, phase=0, density=6, lean=2)
    # translucent hanji panes OVER the rain: a cool dither film so the rain reads
    # as 'seen through paper', diffuse — not a clear glass window.
    dither(d, wx, wy, ww, wh, PAL["hanji"][3], phase=1)
    dither(d, wx, wy, ww, wh, PAL["rain"][1], phase=0)
    # the 창살 lattice — a fine wooden muntin grid (the iconic 창호 read)
    for gx in range(wx + 9, wx + ww, 11):
        vline(d, gx, wy, wh, PAL["wood_dark"][1])
        vline(d, gx + 1, wy, wh, PAL["wood_dark"][2])
    for gy in range(wy + 12, wy + wh, 13):
        hline(d, wx, gy, ww, PAL["wood_dark"][1])
        hline(d, wx, gy + 1, ww, PAL["wood_dark"][2])
    frame(d, wx, wy, ww, wh, OUTLINE)
    # window sill + a thin cold rim of light spilling onto the floor below it
    fill(d, wx - 4, wy + wh, ww + 8, 4, PAL["wood_dark"][1])
    hline(d, wx - 4, wy + wh, ww + 8, PAL["wood_light"][2])
    frame(d, wx - 4, wy + wh, ww + 8, 4, OUTLINE)
    # cold light pooling on the floor under the window (cool sheen)
    dither(d, wx - 2, FLOOR_Y, ww + 6, 18, PAL["rain"][2], phase=1)
    dither(d, wx + 4, FLOOR_Y + 6, ww - 6, 12, PAL["rain"][1], phase=0)


# ── BACK: wall shelf with stacked celadon bowls ──────────────────────────────

def paint_shelf(d):
    """A 선반 wall shelf carrying stacked celadon bowls (the tea-room's ware).

    Sits on the back wall between the center post and the entrance, behind the
    monk's plane. Decorative life; reads as bowls, not a cabinet (kept shallow).
    """
    shx, shy, shw = 150, 40, 70          # shelf plank top edge
    fill(d, shx, shy, shw, 5, PAL["wood_dark"][1])
    hline(d, shx, shy, shw, PAL["wood_light"][2])
    hline(d, shx, shy + 4, shw, OUTLINE)
    frame(d, shx, shy, shw, 5, OUTLINE)
    drop_shadow(d, shx, shy + 5, shw, 2)
    for bx in (shx + 4, shx + shw - 8):          # two small brackets
        d.polygon([(bx, shy + 5), (bx + 4, shy + 5), (bx, shy + 11)],
                  fill=PAL["wood_dark"][3], outline=OUTLINE)

    def bowl_stack(x, n):
        """A short stack of n shallow celadon bowls resting on the plank."""
        for i in range(n):
            by = shy - 4 - i * 4
            d.ellipse([x, by, x + 18, by + 5], fill=PAL["green"][0],
                      outline=OUTLINE)
            hline(d, x + 3, by + 1, 12, PAL["white"][0])     # rim sheen
            dither(d, x + 11, by + 2, 6, 2, PAL["green"][1], phase=0)  # celadon shade

    bowl_stack(shx + 6, 3)
    bowl_stack(shx + 42, 2)
    # a small celadon jar (다관 hint) at the right end of the shelf
    d.ellipse([shx + 30, shy - 9, shx + 40, shy - 1], fill=PAL["green"][1],
              outline=OUTLINE)
    d.point((shx + 33, shy - 7), fill=PAL["white"][0])


# ── BACK-RIGHT: entrance stand + closed 방명록 ([273,118,34,44]) ──────────────

def paint_guestbook_stand(d):
    """A low 서궤 stand by the entrance carrying the closed 방명록 (guestbook).

    guestbook() draws an open book on its OWN low stand (40 wide). Measured: at
    origin (gx,gy) the prop spans x gx..gx+40, y gy+2..gy+21 with visual center
    ≈ (gx+20, gy+11.5). Hotspot [273,118,34,44], center (290,140) → origin
    (270,127) lands the center ≈ (290,138), inside the rect. It sits BACK against
    the wall in the corner (drawn before the brazier, which occludes its base for
    depth) so book + brazier read at different depths, not as one cluttered mass.
    Kept cool/dim so the brazier stays the single warm point.
    """
    # an open-door bay behind it: a sliver of the cold corridor by the entrance,
    # so the corner reads as 'near the entrance' (a darker, cooler recess).
    fill(d, 300, 60, 20, FLOOR_Y - 60, PAL["wood_dark"][3])
    dither(d, 300, 60, 20, FLOOR_Y - 60, PAL["rain"][4], phase=1)
    C.rain_curtain(d, 302, 64, 16, FLOOR_Y - 70, phase=1, density=7, lean=2)
    vline(d, 300, 0, FLOOR_Y, PAL["wood_dark"][1])         # door jamb
    vline(d, 299, 0, FLOOR_Y, PAL["wood_dark"][2])
    # the guestbook on its stand (shared builder) — OPEN: matches the shipped outro
    # ("sigue abierto donde lo viste al llegar", level-02.ts) + the obj-guestbook
    # close-up. Dossier §6 "cerrado" is the doc's lone outlier (resolved with owner).
    C.guestbook(d, 270, 127, signed=False, closed=False)
    # a small brush resting across the stand (the sign-in set), low life
    d.line([301, 143, 308, 141], fill=PAL["wood_dark"][1])      # brush handle
    d.point((300, 144), fill=PAL["ink"][2])                     # tuft tip


# ── RIGHT: brazier 화로 (warm key) + curled cat ([240,150,40,30]) ─────────────

def paint_brazier_and_cat(d):
    """화로 brazier — the ONLY warm key light — with the temple cat curled beside.

    brazier_hwaro() is the warmest point of the scene. The cat (frame 0, curled
    asleep) sits to its left on the warm floor. cat() measured: at origin (cx,cy)
    the loaf spans x cx+1..cx+16, y cy+5..cy+15, center ≈ (cx+8.5, cy+10). cat
    hotspot [240,150,40,30], center (260,165) → origin (252,155) lands the center
    ≈ (260,165), inside the rect. The brazier sits to the cat's RIGHT (x≥282, out
    of the cat rect) so its glow washes warmly over the sleeping cat from the side.
    """
    # a broad warm glow on the floor first (the key light pooling), behind props.
    # Kept SOFT + dithered, NOT concentric ring outlines (round-2 'water ripple'
    # failure): paint a few sparse dither passes over one elliptical floor patch,
    # each a smaller ellipse so the warmth thickens toward the brazier and frays
    # out — a glow, not a target.
    gx0, gy0 = 300, FLOOR_Y + 30            # glow centre on the floor
    for rw, rh, c, ph in ((44, 24, PAL["ember"][3], 0),
                          (30, 16, PAL["ember"][2], 1),
                          (16, 9, PAL["gold_light"][2], 0)):
        for yy in range(gy0 - rh, gy0 + rh):
            t = abs(yy - gy0) / rh
            half = int(rw * (1 - t * t) ** 0.5)
            dither(d, gx0 - half, yy, half * 2, 1, c, phase=(ph + yy) % 2)
    # the brazier on the right, in the FOREGROUND (low on the floor, in front of
    # the back-wall guestbook stand so the two read at different depths), bowl
    # sitting on the deck.
    C.brazier_hwaro(d, 284, FLOOR_Y + 6, w=32, h=24)
    # the curled sleeping cat, warmed by the embers, on the floor to the left
    C.cat(d, 252, 156, frame=0)
    # a soft warm key catching the cat's back (the ember side), kept on its fur
    dither(d, 260, 159, 7, 3, PAL["ember"][3], phase=1)


# ── CENTER: low 소반 tea table (drawn in front of the seated monk) ────────────

def paint_table(d):
    """The low tea table (소반), drawn AFTER the monk so it sits in FRONT of him.

    Kept SHALLOW (a thin top + short splayed legs) so it never reads as a
    cabinet/dresser (the L1 'soban looks like a dresser' pitfall). The top edge
    sits at the floor line so the monk reads as seated just behind it.
    """
    tx, ty, tw = 118, 150, 100
    drop_shadow(d, tx - 2, ty + 26, tw + 4, 3)
    # short splayed legs (drawn first, behind the top)
    for lx in (tx + 8, tx + tw - 14):
        fill(d, lx, ty + 7, 6, 17, PAL["wood_dark"][2])
        vline(d, lx, ty + 7, 17, PAL["wood_dark"][1])
        frame(d, lx, ty + 7, 6, 17, OUTLINE)
    # an apron rail between the legs (the 운각 skirt of a 소반)
    fill(d, tx + 10, ty + 8, tw - 24, 4, PAL["wood_dark"][3])
    # the table TOP — a thin slab (shallow front face → never a cabinet)
    fill(d, tx, ty, tw, 8, PAL["wood_light"][1])
    hline(d, tx, ty, tw, PAL["wood_light"][0])              # lit front lip
    dither(d, tx, ty + 5, tw, 3, PAL["wood_dark"][1], phase=0)   # shaded underside
    for gx in range(tx + 9, tx + tw - 6, 22):              # grain ticks
        hline(d, gx, ty + 2, 4, PAL["wood_light"][2])
    frame(d, tx, ty, tw, 8, OUTLINE)


def paint_tea_service(d):
    """The teapot the monk cradles + the two cups (drawn on top of the table).

    Two cups: the SECOND (steaming) by the second cushion at the monk's right,
    landing in [205,165,28,24]; the player's own cup at the near cushion in the
    lower foreground. The teapot sits at the table edge right under the monk's
    cupped hands (~y134) so the seated_tea gesture reads as cradling it.
    """
    # --- the teapot (다관), nestled UP into the monk's cupped hands (~y134) so
    # the seated_tea gesture reads as cradling it (round-3 'pot floats below the
    # hands' fix). Drawn after the monk so its lid tucks under his hands.
    _teapot(d, 140, 136)
    # bridge the gesture: two small skin finger-ticks wrapping the pot's shoulders,
    # continuing the monk's cupped hands DOWN onto the pot so hands+pot read as one.
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    for sx in (140, 141):                                  # left fingers on the pot
        d.point((sx, 138), fill=skin)
    d.point((140, 139), fill=skin_sh)
    for sx in (153, 154):                                  # right fingers on the pot
        d.point((sx, 138), fill=skin)
    d.point((154, 139), fill=skin_sh)

    # --- the SECOND cup (steaming), by the second cushion at the monk's right ---
    # tea_cup() measured: at origin (cx,cy) the cup body centers ≈ (cx+5,cy+5).
    # Placed at (213,172) the cup center lands ≈ (218,177), centred in second-cup
    # [205,165,28,24] (center 219,177). steam=True (it 'ya estaba caliente').
    # Same vessel as obj-second-cup.png (rule 2: the shared tea_cup builder).
    C.tea_cup(d, 213, 172, steam=True)

    # --- the PLAYER's own cup, at the near cushion, lower foreground-right ---
    # Set apart from the monk rect, lower + slightly right (the player's place).
    C.tea_cup(d, 176, 198, steam=False)


def _teapot(d, x, y):
    """A small celadon teapot (다관): round body, spout, lid knob, loop handle.

    Sits at the front table edge below the monk's cupped hands. White/celadon to
    match the cups (same ware family), warm ember glint on the lit side.
    """
    body, sh = PAL["white"][0], PAL["green"][1]
    # round belly
    d.ellipse([x, y + 2, x + 14, y + 13], fill=body, outline=OUTLINE)
    dither(d, x + 8, y + 5, 5, 6, sh, phase=0)             # celadon shade (right)
    hline(d, x + 3, y + 4, 7, PAL["white"][1])             # top sheen
    d.point((x + 4, y + 4), fill=PAL["gold_light"][1])     # warm ember glint
    # short spout (left) angled up
    d.line([x, y + 6, x - 4, y + 3], fill=body)
    d.line([x, y + 7, x - 4, y + 4], fill=OUTLINE)
    d.point((x - 4, y + 3), fill=PAL["white"][1])
    # loop handle (right)
    d.arc([x + 11, y + 3, x + 18, y + 12], 270, 90, fill=PAL["wood_dark"][1])
    # lid + knob
    d.ellipse([x + 3, y, x + 11, y + 4], fill=PAL["white"][1], outline=OUTLINE)
    d.point((x + 7, y - 1), fill=body)                     # knob
    d.point((x + 7, y - 2), fill=OUTLINE)


def paint_cushions(d):
    """Two 방석 floor cushions: the monk's (under him) + the player's near one.

    Square pads in low perspective (trapezoid, wider near edge) with a piped
    seam — so they read as floor cushions, not oval lids (L1 lesson). The near
    (player) cushion is in the lower foreground; the second cushion at the monk's
    right is where the steaming second cup sits.
    """
    def cushion(cx, cy, cw, ch, col, warm=False):
        drop_shadow(d, cx + 1, cy + ch - 1, cw - 2, 2)
        top = [(cx + 5, cy), (cx + cw - 5, cy), (cx + cw, cy + ch), (cx, cy + ch)]
        d.polygon(top, fill=col, outline=OUTLINE)
        # piped seam just inside the edge
        d.polygon([(cx + 8, cy + 2), (cx + cw - 8, cy + 2),
                   (cx + cw - 4, cy + ch - 3), (cx + 4, cy + ch - 3)],
                  outline=PAL["stone"][3] if not warm else PAL["ember"][3])
        # corner tufts
        for (tx0, ty0) in ((cx + 9, cy + 3), (cx + cw - 9, cy + 3),
                           (cx + 5, cy + ch - 4), (cx + cw - 5, cy + ch - 4)):
            d.point((tx0, ty0), fill=PAL["stone"][3])
        # a lit near-edge so the pad has a top face
        hline(d, cx + 2, cy + ch - 2, cw - 4, PAL["stone"][0] if not warm
              else PAL["ember"][2])

    # the second cushion (to the monk's right) — the empty/served place. Cool, a
    # touch toward the cold side; the steaming cup rests at its near edge.
    cushion(196, 184, 44, 14, PAL["stone"][2])
    # the player's near cushion, lower foreground, warmed by the room
    cushion(150, 210, 58, 18, PAL["stone"][2], warm=True)


# ── CENTER-RIGHT: 우담 the monk (SLOT1 [120,95,55,75]) ───────────────────────

def paint_light_pool(d):
    """A warm window LIGHT POOL behind 우담 so the FOCAL monk pops off the wall.

    The recipe's halo: the seated host is the highest-contrast element of the
    scene. Two moves, both kept ON-PALETTE and dithered (no smooth alpha):
      1) CALM the busy diagonal wall hatching directly behind him — restamp a
         clean warm hanji patch over the penumbra/grain dither right where his
         head + shoulders sit, so he no longer competes with the wall texture.
      2) Pool a soft warm radial halo (gold→ember, dithered, frayed) over that
         clean patch — a precious warm key gathering on the host, the warmest
         point of the cold tea room outside the brazier corner.
    Drawn BEFORE the cushion + figure so it sits behind him on the wall/floor.
    """
    hcx, hcy = 147, 124          # halo centre ≈ the monk's chest/head on the wall
    rw0, rh0 = 40, 36            # the clean-patch / halo footprint on the wall

    # 1) CALM the wall behind him: re-lay clean warm hanji ONLY inside an ellipse
    # (an elliptical mask, NOT a hard rectangle) so the diagonal penumbra hatching
    # dissolves toward the centre and frays back to texture at the rim — no seam.
    for yy in range(hcy - rh0, hcy + rh0):
        if yy < 0 or yy >= FLOOR_Y:
            continue
        t = abs(yy - hcy) / rh0
        half = int(rw0 * (1 - t * t) ** 0.5)
        for xx in range(hcx - half, hcx + half):
            if xx < 0 or xx >= W:
                continue
            edge = max(abs(xx - hcx) / max(half, 1), t)   # 0 centre → 1 rim
            # near the centre: always clean; toward the rim: keep some hatching so
            # the calm patch melts into the busy wall instead of cutting a hole.
            if edge < 0.72 or ((xx * 3 + yy * 5) % 4 == 0):
                d.point((xx, yy), fill=PAL["hanji"][2])

    # 2) the warm radial halo over that calm patch: out→in lobes, dithered so the
    # warmth gathers on the host and frays into the wall (gold core → ember → warm).
    for rw, rh, col, ph in ((37, 33, PAL["wood_light"][3], 0),
                            (28, 25, PAL["ember"][3], 1),
                            (19, 17, PAL["ember"][2], 0),
                            (11, 10, PAL["gold_light"][2], 1)):
        for yy in range(hcy - rh, hcy + rh):
            if yy < 0 or yy >= FLOOR_Y:
                continue
            t = abs(yy - hcy) / rh
            half = int(rw * (1 - t * t) ** 0.5)
            if half > 0:
                dither(d, hcx - half, yy, half * 2, 1, col, phase=(ph + yy) % 2)


def paint_monk(d):
    """우담, monk(seated_tea), seated ON THE FLOOR at the tea table.

    monk(seated_tea) measured: at origin (mx,my) the figure spans x mx+1..mx+31,
    y my+2..my+46, visual center ≈ (mx+16, my+26). Hotspot [120,95,55,75],
    center (147,132) → origin (132,105) lands head at ~y107, lap bottom at ~y151
    (right at the floor/table line), hands at ~(143,135); the figure mass centers
    ≈ (148,131), inside the rect. He sits low so he reads as a PERSON seated at
    the table — NOT a portrait hung on the wall (round-1 failure). His own
    cushion + floor-contact shadow ground him; the table (painted after) occludes
    his lower lap, seating him AT it. The warm light pool (paint_light_pool, drawn
    earlier) backlights him so he is the scene's highest-contrast element.
    """
    # his floor cushion (the master/host seat) — a warm persimmon 방석 so it reads
    # as a SEAT cushion under him, NOT a dark bench merging with the table top
    # (round-2 failure). Lower-toned warm ember edges, kept under his lap.
    drop_shadow(d, 126, 151, 44, 3)
    top = [(126, 140), (170, 140), (175, 153), (121, 153)]
    d.polygon(top, fill=PAL["ember"][3], outline=OUTLINE)
    d.polygon([(130, 142), (166, 142), (170, 151), (126, 151)],
              outline=PAL["ember"][2])                      # piped seam
    hline(d, 123, 151, 52, PAL["ember"][1])                 # lit near edge
    C.monk(d, 132, 105, pose="seated_tea")


# ── PENUMBRA: a soft cool vignette so the room reads as a DIM evening tea room ─

def paint_penumbra(d):
    """A final cool vignette darkening the edges/ceiling — the spec's 'penumbra'.

    The 다실 is an intimate dark-wood interior; without this the warm hanji wall
    reads as bright daytime. A sparse cool dither, densest at the top corners and
    along the ceiling, thinning toward the centre — so the brazier glow and the
    cold window become the two precious bright points. Kept light (a single cool
    ramp, checker-gated) so it dims without muddying or bleeding hue.
    """
    cool = PAL["wood_dark"][3]
    for y in range(0, FLOOR_Y):
        for x in range(0, W):
            if (x + y) % 2 != 0:
                continue
            # vignette weight: stronger near top + side edges, weak at centre
            dx = abs(x - W / 2) / (W / 2)            # 0 centre → 1 sides
            dy = 1.0 - y / FLOOR_Y                   # 1 ceiling → 0 floor line
            w = 0.55 * dx + 0.65 * dy
            m = 8 if w < 0.35 else (4 if w < 0.7 else 2)
            if ((x * 5 + y * 3) % m) == 0:
                d.point((x, y), fill=cool)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["hanji"][2])
    paint_room_shell(d)
    paint_penumbra(d)            # dim the bare wall/floor BEFORE props draw on top
    paint_shelf(d)               # back wall shelf (behind everything)
    paint_window(d)              # left cold window
    paint_guestbook_stand(d)     # back-right entrance + guestbook
    paint_brazier_and_cat(d)     # right warm key + cat
    paint_cushions(d)            # the player + second floor cushions (far back)
    paint_light_pool(d)          # warm halo behind the monk (he is the focal point)
    paint_monk(d)                # the monk seated (on his own cushion), behind…
    paint_table(d)               # …the low table, drawn IN FRONT of the monk
    paint_tea_service(d)         # the teapot at his hands + the two cups, on top
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-01-dasil.png")
    C.preview(img, "preview_room-01-dasil.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-01-dasil.png", scale=3)


if __name__ == "__main__":
    main()
