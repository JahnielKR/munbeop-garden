#!/usr/bin/env python3
"""cosmetic-set-complete.png — 🟡 the LEGENDARY set «마흔아홉 번째 손님».

Dossier §10 (legendary tier «마흔아홉 번째 손님», "the day-49 guest") + §12.7. The
prize for the player who earned the whole streak: a 128×128 COLLAGE of the day-49
guest. Three layers, composed (per STYLE.md rule 2) around the shared builders:

  BACKGROUND : a FRAGMENT of the farewell shot — the two long shadows over the
               GOLD of the wet steps (a lit golden mirror descending). This is the
               ONLY place outside `cinematic-outro` where the two shadows exist —
               the secret, for who earned it. The second (taller, 삿갓) shadow is
               RAIN_DEEP, one tone darker than the first, NO outline, subtle: it
               must be FINDABLE but never shout (rule L2-b). Reproduced here at
               cosmetic scale from the SAME gold-mirror + RAIN_DEEP discipline the
               outro uses.
  FRAME      : a BRONZE ornamental border with 비천상 (apsara) relief — the corner
               medallions painted by `bicheonsang()` (its STYLE-listed consumer
               role), the apsaras of Korean bronze (as on the Emille bell). Bronze
               ramp only, OUTLINE edges.
  CENTER     : the avatar — the anonymous traveler of the level — sheltered UNDER
               the master's open `paper_umbrella()`. The traveller arrived soaked
               with a broken store umbrella (§2); here the master's warm oiled-paper
               parasol is held over them: received, no longer alone. The umbrella is
               the level's warm key; the traveller's rain-damp cloak is cool slate
               so the warmth above them reads as a gift.

Everything OUTSIDE the bronze frame is TRANSPARENT (the card is a framed jewel, not
a full plate). The background gold/shadows live only INSIDE the frame window.

Palette discipline (rule 1): only PAL + OUTLINE + SHADOW_* + the 3 documented derived
shades. ROSE_GOLD warms the break of sky behind the steps; RAIN_DEEP is the second
shadow; bronze for the frame. No new hues. No legible Korean (L2-a): the title lives
in the UI, never baked here.

Shared builders used: `bicheonsang` (the 비천상 corner relief on the bronze frame),
`paper_umbrella` (the master's open parasol over the avatar). The two cast shadows,
the golden-step mirror, the bronze frame body and the small traveller avatar are
asset-local detail painted AROUND the builders (no builder covers the player figure
or the frame body). The 삿갓 second shadow is the single most carefully tuned element.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_cosmetic-set-complete.py
"""

from __future__ import annotations

import common as C
from common import (PAL, OUTLINE, RAIN_DEEP, ROSE_GOLD, fill, frame, hline,
                    vline, dither, drop_shadow)

W, H = 128, 128

# The bronze frame border thickness + the inner window it carries.
BORDER = 12
WIN_X, WIN_Y = BORDER, BORDER
WIN_W, WIN_H = W - 2 * BORDER, H - 2 * BORDER     # 104×104 inner scene window

# The horizon inside the window where the broken sky meets the gold stairway.
HORIZON_Y = WIN_Y + 30          # sky fills the top band; gold steps the lower 2/3
LANDING_Y = HORIZON_Y + 8       # the wet landing where the figure stands / shadows root

# Sanity rects (cosmetic — no real slots; overlay only to confirm spec elements sit
# where the description wants them). The second shadow gets NO rect on purpose (its
# verification is an eyes-at-1× job, rule L2-b).
CHECK_RECTS = [
    (WIN_X, WIN_Y, WIN_W, WIN_H),       # the inner scene window (gold + shadows)
    (54, 30, 22, 30),                   # the open paper_umbrella over the avatar
    (57, 54, 16, 30),                   # the traveller avatar under it
    (4, 4, 24, 24),                     # a 비천상 corner medallion (top-left)
]


# ── BACKGROUND: a fragment of the farewell shot — gold steps + two shadows ────

def paint_sky(d):
    """The broken-storm sky fragment behind the gold steps: cool slate warming to a
    ROSE_GOLD break high-center, dithered (never smooth, never black). The same sky
    family as the outro/common cosmetic so the set reads as one «빗소리» family."""
    # SOLID base over the WHOLE sky region first (WIN_Y → HORIZON_Y) so no window
    # pixel is left transparent behind the lobes/clouds (else holes show in the gold).
    fill(d, WIN_X, WIN_Y, WIN_W, HORIZON_Y - WIN_Y, PAL["rain"][1])
    # cool slate bands at the top of the window, warming downward toward the break
    bands = [
        (WIN_Y,      6, PAL["rain"][3]),
        (WIN_Y + 6,  6, PAL["rain"][2]),
        (WIN_Y + 12, 8, PAL["rain"][1]),
    ]
    for by, bh, c in bands:
        fill(d, WIN_X, by, WIN_W, bh, c)
    dither(d, WIN_X, WIN_Y + 5, WIN_W, 3, PAL["rain"][2], phase=0)
    dither(d, WIN_X, WIN_Y + 11, WIN_W, 3, PAL["rain"][1], phase=1)
    dither(d, WIN_X, WIN_Y + 18, WIN_W, HORIZON_Y - WIN_Y - 18, PAL["rain"][2], phase=0)  # haze to horizon
    # the warm BREAK in the clouds high-center: nested rose-gold → gold → white,
    # built from overlapping lobes (no clean disc — the L1 'faceted disc' pitfall).
    bx, by = WIN_X + WIN_W // 2, WIN_Y + 13
    for (ox, oy, rw, rh) in ((-16, 0, 18, 8), (16, 1, 20, 8), (0, -3, 14, 7),
                             (4, 4, 24, 7), (-26, 3, 10, 5)):
        d.ellipse([bx + ox - rw, by + oy - rh, bx + ox + rw, by + oy + rh],
                  fill=ROSE_GOLD)
    dither(d, bx - 34, by - 9, 68, 20, PAL["rain"][1], phase=0)   # tear slate back in
    for (ox, oy, rw, rh) in ((-9, 0, 14, 6), (10, 1, 13, 5), (0, -2, 11, 5)):
        d.ellipse([bx + ox - rw, by + oy - rh, bx + ox + rw, by + oy + rh],
                  fill=PAL["gold_light"][1])
    d.ellipse([bx - 14, by - 4, bx + 12, by + 5], fill=PAL["gold_light"][0])
    d.ellipse([bx - 7, by - 2, bx + 7, by + 3], fill=PAL["white"][0])
    dither(d, bx - 18, by - 5, 36, 11, PAL["gold_light"][1], phase=1)
    # a couple of torn slate cloud shelves drifting across, warm-lit undersides
    for (cx, cy, cw, ch) in ((WIN_X + 6, WIN_Y + 8, 30, 6), (WIN_X + WIN_W - 40, WIN_Y + 6, 34, 6)):
        d.ellipse([cx, cy, cx + cw, cy + ch], fill=PAL["rain"][3])
        dither(d, cx + 2, cy + 1, cw - 4, ch - 1, PAL["rain"][2], phase=1)
        hline(d, cx + 3, cy + ch - 1, cw - 6, ROSE_GOLD)


def paint_steps(d):
    """The wet golden stairway mirror filling the lower window: receding gold treads,
    brighter toward the camera, that CARRY both cast shadows (kept gold, not white,
    so a one-tone-darker second shadow can still read softly on them — outro logic)."""
    # the wet landing band first (where the figure stands + shadows root)
    # SOLID base across the WHOLE gold region first (down to the window foot) so the
    # side margins — painted with dither below — never leave transparent gaps.
    fill(d, WIN_X, HORIZON_Y, WIN_W, WIN_Y + WIN_H - HORIZON_Y, PAL["stone"][3])
    fill(d, WIN_X, HORIZON_Y, WIN_W, LANDING_Y - HORIZON_Y, PAL["stone"][1])
    dither(d, WIN_X, HORIZON_Y, WIN_W, LANDING_Y - HORIZON_Y, PAL["gold_light"][2], phase=0)
    dither(d, WIN_X, HORIZON_Y, WIN_W, 4, PAL["stone"][2], phase=1)
    hline(d, WIN_X, HORIZON_Y, WIN_W, PAL["stone"][2])

    # the golden stairway: receding treads, each wider + brighter toward the camera.
    step_edges = [LANDING_Y, LANDING_Y + 10, LANDING_Y + 24, LANDING_Y + 42, WIN_Y + WIN_H]
    gold_tread = [PAL["gold_light"][2], PAL["gold_light"][2],
                  PAL["gold_light"][1], PAL["gold_light"][0]]
    for i in range(len(step_edges) - 1):
        y0, y1 = step_edges[i], step_edges[i + 1]
        m = 8 - i * 3
        if m < 0:
            m = 0
        x0, x1 = WIN_X + m, WIN_X + WIN_W - m
        fill(d, x0, y0, x1 - x0, y1 - y0, gold_tread[i])
        cw = (x1 - x0) - 14
        if cw > 0:
            dither(d, x0 + 7, y0 + 1, cw, y1 - y0 - 2, PAL["gold_light"][0], phase=1)
        dither(d, x0, y0, x1 - x0, 2, PAL["stone"][2], phase=0)   # cool riser shade
        hline(d, x0, y0, x1 - x0, OUTLINE)                         # step nosing line
        hline(d, x0, y0 + 1, x1 - x0, PAL["gold_light"][0])        # lit nosing
        if i >= 2:                                                # grout seams, front
            for sx in range(x0 + 22, x1 - 8, 34):
                vline(d, sx, y0 + 3, y1 - y0 - 3, PAL["stone"][2])
    # darker wet stone in the side margins beyond the fanning stair
    for i in range(len(step_edges) - 1):
        y0, y1 = step_edges[i], step_edges[i + 1]
        m = 8 - i * 3
        if m > 0:
            dither(d, WIN_X, y0, m, y1 - y0, PAL["stone"][3], phase=0)
            dither(d, WIN_X + WIN_W - m, y0, m, y1 - y0, PAL["stone"][3], phase=1)


def _shadow_blade(d, p_feet, p_head_c, half_feet, half_head, c, soften=False):
    """A long cast-shadow blade from feet → a head end (tapering quad). Ported from
    the outro's _shadow_blade; soften dithers the far third so the end melts into the
    gold and never shouts."""
    fx, fy = p_feet
    hx, hy = p_head_c
    d.polygon([(fx - half_feet, fy), (fx + half_feet, fy),
               (hx + half_head, hy), (hx - half_head, hy)], fill=c)
    if soften:
        ty = fy + (hy - fy) * 2 // 3
        for yy in range(ty, hy):
            t = (yy - fy) / (hy - fy)
            cx = int(fx + (hx - fx) * t)
            hw = int(half_feet + (half_head - half_feet) * t)
            dither(d, cx - hw, yy, hw * 2, 1, c, phase=yy % 2)


def paint_shadows(d):
    """The TWO shadows on the gold from where there is only one figure (rule L2-b).

    The cosmetic's whole secret: the second shadow exists ONLY here and in the outro.
    Read as ONE primary blade with the 삿갓 shadow NESTED almost inside it — bodies
    merge, only the HEADS separate. The pair falls DOWN-AND-LEFT at an angle (so it
    sweeps across the gold instead of stacking under the umbrella shaft as a vertical
    bar) and lands on MID gold — never the near-white front slab — where the cool
    tones read as a soft deepening of the wet sheen, NOT a black hole. Slim and quiet:
    at a glance one shadow; if you LOOK, a second 삿갓-brimmed head peeks up-right of
    the bald one. If it shouts, it is wrong.

    · SHADOW 2 (the gift): RAIN_DEEP, one tone darker, NO OUTLINE/glow/hotspot/text;
      body nearly collinear with the first, only the hatted head + 삿갓 brim survive.
    · SHADOW 1 (the obvious one): cool stone[2] (lighter than before so it reads as a
      cast shadow on gold, not a hole), a clean round bald head; drawn last so it
      dominates and swallows the second's body, leaving the 삿갓 a brim wing up-right.
    """
    foot_x = WIN_X + WIN_W // 2 - 1
    foot_y = LANDING_Y + 1

    # ── SHADOW 2 first (under shadow 1): the 삿갓, RAIN_DEEP, a SLIM body raking
    # down-left, its hatted head offset just RIGHT of shadow 1's so the brim wing is
    # the part that survives the overlap (the one tell). Body kept thin (a person
    # casts a thin shadow) so the pair never reads as a plank.
    s2 = RAIN_DEEP
    hat_head = (foot_x - 11, LANDING_Y + 25)
    _shadow_blade(d, (foot_x + 1, foot_y), hat_head, 2, 2, s2)
    gx, gy = hat_head
    d.ellipse([gx - 2, gy, gx + 3, gy + 5], fill=s2)       # small skull under the hat
    # the 삿갓 BRIM: a wide flat line above the head — the legible signature. Its RIGHT
    # wing pokes out past shadow 1's bald crown, the single thing a searching eye finds.
    by = gy - 1
    hline(d, gx - 6, by, 17, s2)                   # the brim's flat defining underside
    d.polygon([(gx + 1, by - 3), (gx - 5, by), (gx + 9, by)], fill=s2)  # low cone crown
    d.point((gx - 6, by + 1), fill=s2)             # left tip droop → reads 삿갓
    d.point((gx + 10, by + 1), fill=s2)            # right wing tip (the tell)

    # ── SHADOW 1 — the obvious one, ON TOP so it dominates. A SLIM body raking
    # down-left to a clean round BALD head, cool stone[2] (light enough to read as a
    # cast shadow on gold, not a hole). The body is a narrow blade; only the head is
    # round, so the silhouette reads HUMAN, not a club. Far third softened into gold.
    s1 = PAL["stone"][2]
    body_head = (foot_x - 16, LANDING_Y + 31)
    # narrow neck/body blade
    _shadow_blade(d, (foot_x, foot_y), (body_head[0] + 1, body_head[1] - 4), 2, 2, s1,
                  soften=True)
    hx, hy = body_head
    d.ellipse([hx - 4, hy - 3, hx + 4, hy + 5], fill=s1)   # the bald round head
    d.point((hx, hy + 1), fill=PAL["stone"][3])            # a faint darker core in the head
    # a hairline darker spine down the body so the slim blade has depth, not a flat band
    d.line([foot_x, foot_y, hx + 1, hy - 4], fill=PAL["stone"][3])


# ── CENTER: the avatar under the master's open paper umbrella ─────────────────

def _avatar(d, x, y):
    """The anonymous traveller of the level, small (~16×30), standing in a rain-damp
    cloak — NOT the monk (no shaved head; the player is a layperson). Cool slate cloak
    so the warm umbrella above reads as a gift; a quiet, weary stance, head slightly
    bowed. (x,y) = top-left of the figure cell."""
    cloak, cloak_sh = PAL["rain"][1], PAL["rain"][2]
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    hair = PAL["ink"][1]
    cx = x + 8
    drop_shadow(d, x + 1, y + 29, 14, 2, cool=True)
    # the cloak: a tall A-line travel cloak from the shoulders to a damp hem
    d.polygon([(x + 1, y + 29), (x + 15, y + 29), (x + 13, y + 12), (x + 3, y + 12)],
              fill=cloak, outline=OUTLINE)
    vline(d, cx, y + 13, 16, cloak_sh)                      # center fold seam
    dither(d, x + 9, y + 18, 5, 10, cloak_sh, phase=1)      # right-side fold shade
    # a darker damp band at the hem (rain-soaked) — a single quiet dither row + a
    # clean dark hem line, so it reads as a wet hem, not a noisy checker block.
    dither(d, x + 3, y + 26, 10, 2, RAIN_DEEP, phase=1)
    hline(d, x + 2, y + 28, 12, PAL["rain"][3])
    # arms hinted: a cool sleeve falling either side, hands met low-center (holding
    # the umbrella's bamboo handle that descends to them from above)
    fill(d, x + 2, y + 14, 3, 9, cloak)
    fill(d, x + 11, y + 14, 3, 9, cloak)
    # hands cupped low-center on the handle (skin), a small bright knuckle so the
    # gesture reads as HANDS, not a flat patch
    fill(d, x + 6, y + 18, 4, 3, skin)
    d.point((x + 7, y + 17), fill=skin)
    hline(d, x + 6, y + 20, 4, skin_sh)
    d.point((x + 5, y + 19), fill=OUTLINE)
    d.point((x + 10, y + 19), fill=OUTLINE)
    # the head: rounded, with HAIR (the layperson read — distinct from the bald monk),
    # slightly bowed, serene-weary. Warm rim from the umbrella's oiled paper above.
    hw = 8
    d.ellipse([cx - hw // 2, y + 3, cx + hw // 2, y + 3 + hw], fill=skin, outline=OUTLINE)
    # damp hair cap over the crown + a little down the right (rain-flattened)
    d.pieslice([cx - hw // 2, y + 2, cx + hw // 2, y + 3 + hw], 180, 360, fill=hair)
    d.point((cx - 2, y + 4), fill=hair)
    d.point((cx + 2, y + 4), fill=hair)
    dither(d, cx + 1, y + 6, 2, 4, skin_sh, phase=0)        # cheek volume
    # face hint: two soft down-cast eyes + a quiet mouth (received, not smiling wide)
    ey = y + 7
    d.point((cx - 2, ey), fill=OUTLINE)
    d.point((cx + 2, ey), fill=OUTLINE)
    hline(d, cx - 1, ey + 3, 3, skin_sh)                    # quiet mouth shadow
    d.point((cx, ey + 1), fill=skin_sh)                     # nose tick
    # warm umbrella rim-light catching the crown + shoulders (the gift from above)
    d.point((cx - 3, y + 4), fill=PAL["ember"][1])
    d.point((cx + 3, y + 4), fill=PAL["ember"][1])
    d.point((x + 2, y + 13), fill=PAL["ember"][2])
    d.point((x + 13, y + 13), fill=PAL["ember"][2])


def paint_center(d):
    """The avatar UNDER the master's open paper umbrella — the heart of the collage.

    paper_umbrella(open=True) is the ~32px warm oiled-paper parasol; placed high-center
    so its canopy crowns the figure and its bamboo shaft/handle descends to the
    avatar's hands. The avatar stands on the landing, the two shadows rooting at its
    feet. The umbrella is the level's precious warmth held over the soaked traveller."""
    # the avatar first (umbrella drawn over/around it so the shaft reads as in-hand)
    ax, ay = 57, 53
    _avatar(d, ax, ay)
    # the master's umbrella, opened over the figure. Its builder origin (x,y) is the
    # canopy's top-left; centre the 32px canopy over the avatar's head (cx≈65).
    ux, uy = 49, 31
    C.paper_umbrella(d, ux, uy, open=True)
    # warm ember under-glow on the canopy's lit underside (the broken sky catching the
    # oiled paper) so the parasol reads as the warm key over the cool figure.
    ucx = ux + 16
    dither(d, ucx - 12, uy + 9, 24, 3, PAL["ember"][2], phase=1)
    hline(d, ucx - 10, uy + 12, 20, PAL["ember"][1])
    # a couple of fat rain beads still clinging to the oiled paper (it just stopped)
    d.point((ux + 6, uy + 6), fill=PAL["rain"][0])
    d.point((ux + 24, uy + 7), fill=PAL["white"][0])


# ── FRAME: the bronze ornamental border with 비천상 corner relief ─────────────

def paint_frame(d):
    """A bronze ornamental border carrying 비천상 (apsara) corner medallions.

    Drawn LAST so it crowns the scene window cleanly. The border is a beaded bronze
    band (bronze ramp only, OUTLINE edges); `bicheonsang()` paints the four corner
    medallions (the apsaras of Korean bronze). Everything outside the border stays
    transparent — the card is a framed jewel."""
    lo, mid, hi, dk = PAL["bronze"][2], PAL["bronze"][1], PAL["bronze"][0], PAL["bronze"][3]
    # the four border bars (top, bottom, left, right), hammered bronze
    fill(d, 0, 0, W, BORDER, lo)                  # top
    fill(d, 0, H - BORDER, W, BORDER, lo)         # bottom
    fill(d, 0, 0, BORDER, H, lo)                  # left
    fill(d, W - BORDER, 0, BORDER, H, lo)         # right
    # hammered texture + a lit outer bevel and a shaded inner bevel on every bar
    for (bx, by, bw, bh) in ((0, 0, W, BORDER), (0, H - BORDER, W, BORDER),
                             (0, 0, BORDER, H), (W - BORDER, 0, BORDER, H)):
        dither(d, bx, by, bw, bh, mid, phase=0)
        dither(d, bx, by, bw, bh, dk, phase=1)
    # lit outer edge + dark inner edge of the whole frame
    hline(d, 0, 0, W, hi); hline(d, 0, H - 1, W, dk)
    vline(d, 0, 0, H, hi); vline(d, W - 1, 0, H, dk)
    # the inner window rabbet: a dark recess line then a lit bronze lip around the scene
    frame(d, WIN_X - 1, WIN_Y - 1, WIN_W + 2, WIN_H + 2, dk)
    frame(d, WIN_X - 2, WIN_Y - 2, WIN_W + 4, WIN_H + 4, hi)
    frame(d, 0, 0, W, H, OUTLINE)
    # a 연주문-style beaded run along the mid-line of each bar (the dotted band the
    # bell + dancheong share) so the bronze reads as cast temple metal, not a slab
    for x in range(4, W - 3, 4):
        d.point((x, 5), fill=hi); d.point((x, 6), fill=dk)
        d.point((x, H - 7), fill=hi); d.point((x, H - 6), fill=dk)
    for y in range(4, H - 3, 4):
        d.point((5, y), fill=hi); d.point((6, y), fill=dk)
        d.point((W - 7, y), fill=hi); d.point((W - 6, y), fill=dk)
    # the four 비천상 (apsara) corner medallions — the legendary relief (builder).
    m = 24
    C.bicheonsang(d, 4, 4, m, m)                  # top-left
    C.bicheonsang(d, W - 4 - m, 4, m, m)          # top-right
    C.bicheonsang(d, 4, H - 4 - m, m, m)          # bottom-left
    C.bicheonsang(d, W - 4 - m, H - 4 - m, m, m)  # bottom-right


def chamfer_corners(img, d):
    """Cut the four outer corners to TRANSPARENT (a small chamfer) so the card reads
    as an ornamental medallion / earned badge — and genuinely satisfies rule 6's
    'transparent outside the composition' with intent. Each cut is a 5px triangle at
    the extreme corner (clear of the 24px 비천상 medallions), edged with a clean
    OUTLINE diagonal + a lit bronze bevel so the chamfer looks cast, not clipped."""
    px = img.load()
    cut = 5
    hi, dk = PAL["bronze"][0], PAL["bronze"][3]
    corners = [(0, 0, +1, +1), (W - 1, 0, -1, +1),
               (0, H - 1, +1, -1), (W - 1, H - 1, -1, -1)]
    for (ox, oy, sx, sy) in corners:
        # clear the outer triangle (i + j < cut) to transparent
        for i in range(cut):
            for j in range(cut):
                if i + j < cut:
                    px[ox + sx * i, oy + sy * j] = (0, 0, 0, 0)
        # the clean diagonal edge of the chamfer (i + j == cut): OUTLINE + bronze bevel
        for k in range(cut + 1):
            ex, ey = ox + sx * k, oy + sy * (cut - k)
            d.point((ex, ey), fill=OUTLINE)
            d.point((ox + sx * k, oy + sy * (cut - k + 1)
                     if 0 <= oy + sy * (cut - k + 1) < H else oy + sy * (cut - k)),
                    fill=hi)
        # a tiny dark inner shade just past the bevel so the chamfer reads recessed
        d.point((ox + sx * (cut + 1), oy + sy * 1), fill=dk)
        d.point((ox + sx * 1, oy + sy * (cut + 1)), fill=dk)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H)               # transparent canvas
    paint_sky(d)                              # broken-storm sky fragment
    paint_steps(d)                            # the wet golden stairway mirror
    paint_shadows(d)                          # the TWO shadows on the gold (the secret)
    paint_center(d)                           # the avatar under the master's umbrella
    paint_frame(d)                            # the bronze 비천상 frame (crops the window)
    chamfer_corners(img, d)                   # cut the corners transparent (medallion read)
    return img


def main():
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-set-complete.png")
    C.preview(img, "preview_cosmetic-set-complete.png", scale=3)
    C.hotspot_debug(img, CHECK_RECTS, "hotspot_cosmetic-set-complete.png", scale=3)


if __name__ == "__main__":
    main()
