#!/usr/bin/env python3
"""cosmetic-avatar-templecat-strip.png — 🟣 épico «절고양이», 3-frame animated strip.

Dossier §10 (tier épico) + §11. A 192×64 TRANSPARENT strip of three 64×64 cells:
the brown temple cat sitting ON THE EAVE (알레로), sheltered from the rain, with
fat drops falling from the eave lip IN FRONT of it (between camera and cat) —
"nunca encima" (§10). Same melancholy beat as the level: the cat keeps the 49th-
day watch under the dripping roof.

  · Frame 0 — slow blink  : cat sitting, eyes closed (the half-second of a slow blink)
  · Frame 1 — tail flick  : same cat, the curled upright tail flicked OUT to the side
  · Frame 2 — looks off    : cat(frame=2) — head up-right, eyes off-frame (the exclusive
                             extra frame; "cada pocos ciclos, mira algo fuera de cuadro")

CONSISTENCY (the reason this asset exists, §11): the cat MUST be the very same
animal as room-01-dasil and sprite-cat-strip, so it is drawn ONLY with
`common.cat()` — never a cat redrawn from scratch. The sitting base is cat(frame=1)
for frames 0 & 1 and cat(frame=2) for frame 2 (the spec's named extra). The blink
(frame 0) and the tail flick (frame 1) are tiny ASSET-LOCAL edits painted OVER the
builder's own head/tail pixels (rule 2), not a new pose. All three share ONE
baseline: identical cat() y-origin → the builder's contact shadow + the eave sit on
the same rows in every cell, so the loop does not bob. This is the same eave + rain-
drops-in-front setting the static `cosmetic-avatar-templecat` shares (canonical here).

Palette discipline (rule 1): only PAL + OUTLINE + SHADOW_*; the warm sheltered
nook uses ember/gold_light (the precious interior warmth), the wet eave + drops use
the rain ramp + white tips (same vocabulary as common.rain_clear's eave drops, kept
strictly in FRONT of the cat). No legible Korean (L2-a — there is no text here).

Deterministic: no unseeded random (cat builder + fixed-geometry eave/drops).
Run from repo root:  python tools/escape-room-level02/gen_cosmetic-avatar-templecat-strip.py
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 192, 64
FRAME_W = 64                       # three 64-wide cells side by side
N_FRAMES = 3

# ── cat placement (shared baseline across all 3 cells) ───────────────────────
# common.cat() sitting frames span ~x+2..x+16 / y-1..y+16 (ears at y-1, haunch
# bottom + own drop_shadow at y+14). Centre the ~16px cat in each 64px cell, low
# enough that it sits ON the eave board: the eave top is EAVE_Y, the cat's feet
# (y+15) rest on it. One Y for every frame → identical baseline, no loop bob.
CAT_Y = 34                         # haunch bottom y+15 = 49 ≈ on the eave board
CAT_DX = 24                        # cat origin within a cell → loaf centred ≈ x+33
EAVE_Y = 47                        # top of the eave board the cat sits on
EAVE_H = 9                         # board thickness (down to y=55, tiles below)


def _warm_nook(d, cx: int, by: int) -> None:
    """A soft, diffuse sheltered pocket behind the cat — radial ELLIPTICAL dither.

    CRITICAL LEGIBILITY FIX (the cat must not read as a winged moth/blob): earlier
    rounds painted this haze in PAL['wood_dark'][1]/[2] — the EXACT fur and fur_sh
    tones of common.cat() — across a wide oval at body height, so the haze fused
    with the brown cat and fanned out as two symmetric 'wings' ~10px past the cat's
    edges. The hero sibling (cosmetic-avatar-templecat) documents this very lesson
    and keeps its warmth LOW + FLAT on the board. So here the pocket is recoloured
    OFF the fur ramp entirely: a dim COOL/NEUTRAL wall recess (PAL['stone'] +
    desaturated rain) that reads as 'sheltered wall BEHIND the cat', not fur — it can
    no longer fuse with the brown silhouette no matter how wide it spreads. The one
    precious WARM catch is kept to a NARROW central gold column the cat fully covers
    (cols cx±3, vs cat body cols ≈ cx-7..cx+9), so no warm pixel leaks past the
    silhouette as a flank lobe. Warmth/shade fade along the oval's own contour
    (normalized elliptical radius t∈[0,1]); no straight edge anywhere.
    (x=cx centre, by=base row.)
    """
    rw, rh = 21, 15
    cy = by - 4                     # nook centre, lifted off the board so the haze
                                    # sits behind the cat's body, not under its feet.
    # cool/neutral recess tones — deliberately NOT on the wood/fur ramp, so the haze
    # reads as a dim sheltered wall and never as the cat's own brown fur.
    wall_lit, wall_mid, wall_dk = PAL["stone"][2], PAL["stone"][3], PAL["rain"][3]
    for yy in range(cy - rh, by + 1):
        near_board = yy >= by - 3   # board-contact rows stay quiet (crisp cat base)
        for xx in range(cx - rw, cx + rw + 1):
            nx = (xx - cx) / rw
            ny = (yy - cy) / rh
            t = (nx * nx + ny * ny) ** 0.5
            if t > 1.0:
                continue
            chk = (xx + yy) % 2 == 0
            if near_board:                                # board band: faint cool only
                if (xx + 2 * yy) % 4 == 0:
                    d.point((xx, yy), fill=wall_mid)
                continue
            if t < 0.62:                                  # the body of the pocket
                # a dim cool wall recess (sheltered wall behind the cat) — neutral
                # stone/slate, never the fur's brown, so it cannot fuse with the cat.
                if chk:
                    d.point((xx, yy), fill=wall_lit)
                else:
                    d.point((xx, yy), fill=wall_mid)
            elif t < 0.84:                                # edge — half dither
                if chk:
                    d.point((xx, yy), fill=wall_mid)
            else:                                         # rim — whisper, dissolving
                if (xx + 2 * yy) % 4 == 0:
                    d.point((xx, yy), fill=wall_dk)
    # a single faint gold breath at the very heart of the pocket (one soft swell, low-
    # centre, behind where the cat's chest sits) — the one precious warm catch. Kept
    # to a NARROW central column (cx±3) that the cat (cols cx-7..cx+9) fully covers,
    # so no warm pixel can leak past the cat's silhouette as a flank 'wing'.
    for yy in range(cy + 1, cy + 5):
        for xx in range(cx - 3, cx + 4):
            if (xx + yy) % 2 == 0:
                d.point((xx, yy), fill=PAL["gold_light"][2])


# ── the sheltered eave the cat sits on (asset-local, shared by all 3 frames) ──

def _eave(d, x0: int) -> None:
    """A length of giwa-tiled eave the cat shelters on, for one cell at x0.

    A wood eave board (the cat sits on its lit top), a course of curved roof tiles
    (기와) below it, and the dark underside of the roof above-left framing the
    sheltered nook. The nook is the level's precious WARM pocket (ember/gold_light
    glow tucked under the eave) against the cold wet tile — the temperature contrast
    the dossier leans on. Drawn the SAME in every cell so the strip reads as one
    place; the cat's own contact shadow (from cat()) lands on the board.
    """
    wl, wm, wd = PAL["wood_light"][1], PAL["wood_light"][2], PAL["wood_dark"][2]
    # the warm sheltered nook (behind the cat) — soft + diffuse, no hard edge.
    _warm_nook(d, x0 + 32, EAVE_Y)

    # the roof underside above-left (the eave overhang the cat tucks under): a dark
    # warm rafter band so a "roof above" reads and the drops have somewhere to fall
    # FROM. Kept to the upper strip so it never crowds the cat.
    fill(d, x0, 0, FRAME_W, 7, PAL["wood_dark"][2])
    hline(d, x0, 0, FRAME_W, PAL["wood_dark"][1])
    hline(d, x0, 6, FRAME_W, OUTLINE)
    for rx in range(x0 + 3, x0 + FRAME_W, 9):          # rafter ends
        vline(d, rx, 1, 5, PAL["wood_dark"][3])
        d.point((rx + 1, 3), fill=PAL["wood_dark"][1])
    # a thin lit purlin under the rafters (warm, catching the nook glow)
    hline(d, x0, 7, FRAME_W, PAL["ember"][3])

    # the eave board the cat sits on: a stout horizontal beam, lit top edge
    fill(d, x0, EAVE_Y, FRAME_W, EAVE_H, wl)
    hline(d, x0, EAVE_Y, FRAME_W, PAL["wood_light"][0])     # lit nosing
    hline(d, x0, EAVE_Y + EAVE_H - 1, FRAME_W, wd)          # shaded underside
    dither(d, x0, EAVE_Y + 3, FRAME_W, 3, wm, phase=0)      # plank grain
    for gx in range(x0 + 6, x0 + FRAME_W - 4, 19):          # grain ticks
        hline(d, gx, EAVE_Y + 4, 3, wd)

    # a course of curved giwa tiles below the board (wet cool gray, the rain side):
    # alternating rounded ridge tiles so the eave reads as a TILED temple roof edge.
    ty = EAVE_Y + EAVE_H
    fill(d, x0, ty, FRAME_W, H - ty, PAL["rain"][2])
    for i, tx in enumerate(range(x0 - 2, x0 + FRAME_W + 2, 8)):
        d.ellipse([tx, ty - 1, tx + 7, ty + 6], fill=PAL["rain"][1],
                  outline=PAL["rain"][3])                    # convex ridge tile
        d.point((tx + 3, ty + 1), fill=PAL["rain"][0])       # wet sheen on the ridge
        vline(d, tx, ty + 3, H - ty - 3, PAL["rain"][3])     # valley shadow between
    hline(d, x0, ty - 1, FRAME_W, OUTLINE)                  # board/tile seam
    # the cool wet line where the warm board meets the cold tile (temperature edge)
    dither(d, x0, ty, FRAME_W, 1, PAL["rain"][0], phase=0)


# ── the eave drops, IN FRONT of the cat (never on it) — §10 hard rule ─────────

def _front_drops(d, x0: int, phase: int) -> None:
    """Fat eave-drips falling IN FRONT of the cat (drawn LAST, over everything).

    Same vocabulary as common.rain_clear's eave drops (a 3px elongated teardrop
    mid-fall: rain[2] body → rain[1] → bright white tip), but placed only in
    FOREGROUND columns chosen to flank the cat — NEVER over the cat's body — so it
    reads as drops sheeting off the eave lip between camera and cat ("delante de él,
    nunca encima", §10). `phase` shifts the fall so the 3 frames animate. Each
    column also leaves a faint vertical wet streak so the drops read as a curtain
    edge, not loose motes (the L1 'motas sueltas' failure).
    """
    # foreground drop columns: cluster at the cell edges + a couple just inside,
    # all OUTSIDE the cat silhouette (cat body ≈ x0+26 .. x0+50).
    cols = (x0 + 6, x0 + 13, x0 + 20, x0 + 46, x0 + 53, x0 + 60)
    for i, dx in enumerate(cols):
        # the falling bead itself: a clear 4px elongated teardrop mid-fall — a cool
        # slate tail brightening to a white leading bead, so it reads as a real fat
        # eave-drop on ANY ground (transparent UI included), not a faint dotted guide.
        dy = 14 + ((i * 7 + phase * 9) % (H - 26))
        d.point((dx, dy - 3), fill=PAL["rain"][3])           # dark trailing tail
        d.point((dx, dy - 2), fill=PAL["rain"][2])
        d.point((dx, dy - 1), fill=PAL["rain"][1])
        d.point((dx, dy), fill=PAL["white"][0])              # bright leading bead
        d.point((dx, dy + 1), fill=PAL["rain"][0])           # rounded underside
        # a second drop lower in the column for a sheeting feel (offset phase)
        dy2 = 14 + ((i * 7 + phase * 9 + 26) % (H - 26))
        d.point((dx, dy2 - 1), fill=PAL["rain"][2])
        d.point((dx, dy2), fill=PAL["rain"][1])
        d.point((dx, dy2 + 1), fill=PAL["white"][1])
    # the drip LINE forming along the eave lip (where the drops are born): a few
    # swelling beads hanging off the tile course front, brightest just before they
    # let go — animated by phase so a bead grows then a new fall appears below.
    lip_y = EAVE_Y + EAVE_H + 4
    for i, dx in enumerate(range(x0 + 4, x0 + FRAME_W - 2, 11)):
        grow = (i + phase) % 3
        d.point((dx, lip_y), fill=PAL["rain"][1])
        if grow >= 1:
            d.point((dx, lip_y + 1), fill=PAL["white"][1])   # swelling bead
        if grow == 2:
            d.point((dx, lip_y + 2), fill=PAL["white"][0])   # about to release


# ── per-frame cat: builder pose + tiny asset-local edits (rule 2) ─────────────

def _blink_over(d, x0: int) -> None:
    """Frame 0 — slow blink: paint closed eyes OVER cat(frame=1)'s open eyes.

    cat(frame=1) draws two warm gold eye-glints at (hx+1, y+3) and (hx+4, y+3) with
    hx=x+3 (head biased left). For frame 0 we want a SERENE forward sit, so we use
    cat(frame=1) as the base then close the eyes: cover the two glints with fur and
    lay a soft down-curved lash line (the closed eye of a slow blink) — the same
    'closed sleeping eye-line' vocabulary cat(frame=0) uses, so it reads as the same
    animal mid-blink, not a different cat. ASSET-LOCAL over the builder, per rule 2.
    """
    fur, fur_sh = PAL["wood_dark"][1], PAL["wood_dark"][2]
    hx = x0 + CAT_DX + 3               # cat() head origin for frame 1 (x+3)
    y = CAT_Y
    # paint over the two open-eye glints with fur (re-close the eyes)
    for ex in (hx + 1, hx + 4):
        d.point((ex, y + 3), fill=fur)
    # the gentle closed lash line of a blink: two short down-curved strokes
    d.point((hx + 1, y + 3), fill=OUTLINE)
    d.point((hx + 2, y + 4), fill=fur_sh)
    d.point((hx + 4, y + 3), fill=OUTLINE)
    d.point((hx + 5, y + 4), fill=fur_sh)
    # a faint warm catch on the brow so the closed eyes still read in the warm nook
    hline(d, hx + 1, y + 2, 4, PAL["wood_light"][2])


def _tail_flick(d, x0: int) -> None:
    """Frame 1 — tail flick: redraw the upright tail flicked OUT to the side.

    cat(frame=1/2) ends its tail as a short curve up the RIGHT side (x+14..x+15).
    For the flick we extend/redirect that tail OUT and up with a kinked tip — the
    one moving part of this frame — keeping the same fur ramp so it reads as the
    same tail in motion. Drawn after cat() so it overrides the builder's resting
    tail tip. ASSET-LOCAL motion over the builder, per rule 2.
    """
    fur, fur_hi = PAL["wood_dark"][1], PAL["wood_light"][2]
    x = x0 + CAT_DX
    y = CAT_Y
    # over-paint the builder's resting tail tip area with nook-warm so the new flick
    # reads cleanly (only a 2px touch-up at the old tip, not the whole tail)
    d.point((x + 15, y + 4), fill=PAL["ember"][3])
    # the flicked tail: sweeps UP-RIGHT then kinks back, a lively S — 2px so it reads
    d.line([x + 14, y + 12, x + 17, y + 5], fill=fur)
    d.line([x + 15, y + 12, x + 18, y + 5], fill=fur)
    d.line([x + 17, y + 5, x + 20, y + 2], fill=fur)        # the flick outward
    d.line([x + 20, y + 2, x + 19, y - 2], fill=fur)        # kink back up (the snap)
    d.point((x + 18, y + 3), fill=fur_hi)                    # lit edge of the sweep
    d.point((x + 20, y + 1), fill=fur_hi)
    d.point((x + 19, y - 2), fill=fur_hi)                    # bright flicked tip


def _paint_frame(d, idx: int) -> None:
    """One 64×64 cell: eave nook → cat(builder) → per-frame edit → drops in front."""
    x0 = idx * FRAME_W
    # 1) the sheltered eave + warm nook + wet tiles (behind the cat)
    _eave(d, x0)
    # 2) the cat, from the shared builder — frames 0 & 1 use the sitting pose
    #    (cat frame 1), frame 2 uses the named exclusive look-off pose (cat frame 2).
    base_pose = 1 if idx < 2 else 2
    C.cat(d, x0 + CAT_DX, CAT_Y, frame=base_pose)
    # a warm rim on the cat's lit (left) side from the nook glow, so the brown cat
    # separates from the dark rafter shade above and reads as sheltered + warm.
    rim_x = x0 + CAT_DX + 4
    dither(d, rim_x, CAT_Y + 5, 2, 7, PAL["gold_light"][2], phase=1)
    # a thin COOL separation just outside the cat's shaded (right) silhouette, so the
    # brown haunch reads off the warm ember pool behind it (temperature edge: cool
    # rain-light rim against warm nook — the dossier's frío-vs-cálido tool).
    sep_x = x0 + CAT_DX + 16
    for sy in range(CAT_Y + 6, CAT_Y + 13):
        if (sy) % 2 == 0:
            d.point((sep_x, sy), fill=PAL["rain"][0])
    # 3) the per-frame moving part (asset-local, over the builder)
    if idx == 0:
        _blink_over(d, x0)
    elif idx == 1:
        _tail_flick(d, x0)
    else:
        # frame 2: a tiny warm catch in the off-frame eye (it watches what isn't
        # there) — the same beat as cinematic-outro's cat(frame=2).
        d.point((x0 + CAT_DX + 9, CAT_Y + 3), fill=PAL["gold_light"][0])
    # 4) the eave drops, IN FRONT of the cat (drawn LAST) — phase per frame to animate
    _front_drops(d, x0, phase=idx)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for idx in range(N_FRAMES):
        _paint_frame(d, idx)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-avatar-templecat-strip.png")
    C.preview(img, "preview_cosmetic-avatar-templecat-strip.png", scale=3)
    # an 8× zoom of each frame so the blink / tail-flick / look-off + the
    # drops-in-front rule can be eyeballed per cell.
    big = img.resize((W * 8, H * 8), Image.NEAREST)
    C.save_out(big, "zoom_cosmetic-avatar-templecat-strip_8x.png")


if __name__ == "__main__":
    main()
