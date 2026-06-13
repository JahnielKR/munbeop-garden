#!/usr/bin/env python3
"""cosmetic-avatar-templecat.png — 🟣 the epic avatar «절고양이» (static preview).

Dossier §10 (épico «절고양이»): "El gato pardo en el alero, a resguardo de la
lluvia. Gotas cayendo del alero delante de él, nunca encima". A 64×64 TRANSPARENT
avatar: the same brown temple cat of room-01-dasil, sitting sheltered under the
curled tile eave, looking off-frame, while the rain falls IN FRONT of it (never
on the fur). Warm-on-cool — the cat + the dry boards it sits on catch a precious
sliver of ember warmth; the eave, the wet drop-edge and the rain are cool slate.
Melancholy-luminous, the §10 mood of the whole «청우사의 빗소리» set; NOT cute.

CAT = the room's cat. `common.cat(frame=2)` IS the canonical temple cat in its
"looking off-frame" pose (the frame the cosmetic owns, per the cross-asset note
"`cat` frame 2 … es exclusivo del cosmético"). That builder is authored at ROOM
scale (~16px) with diagonal-free blocky forms, so a brute 3–4× NEAREST upscale
staircases its ears + tail into crude steps (verified the same way obj-second-cup
verified the cup). So — exactly like obj-second-cup does for `tea_cup` — this
avatar reproduces the builder's EXACT frame-2 design (same `wood_dark`/`wood_light`
fur ramp, same `gold_light` eye glint, same `plum` inner-ear fleck, same OUTLINE,
same anatomy: upright chest, head up-right, two ears, gold eyes biased to the
look-direction, muzzle tick, two front legs, a tail curving up the right) drawn
natively at avatar scale so every edge is a clean 1px pixel-art line. The literal
canonical `cat(d, …, frame=2)` is stamped small in the lower-left as the cross-
asset anchor (rule 2 — provably the same animal, the same pose).

EAVE + RAIN are the asset-local detail painted AROUND the builder: a curled giwa
tile eave (same slate giwa vocabulary as cosmetic-bg-rainsound — convex barrel
tiles, dark fascia, round antefix ends, a wet drip-edge) across the top, and the
rain (`rain_curtain` slate streaks) raked ONLY over the open air to the sides /
in front of the cat — masked OFF the cat silhouette + the dry sheltered wedge
beneath the eave, so not a single streak lands on the fur (the spec's hard read).

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_cosmetic-avatar-templecat.py
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import (PAL, OUTLINE, RAIN_DEEP, fill, frame, hline, vline, dither,
                    drop_shadow)

W = H = 64

# ── layout anchors ───────────────────────────────────────────────────────────
EAVE_Y = 4                 # the lit top edge of the curled tile eave
FASCIA_Y = 15              # the dark eave fascia (the underside the cat shelters at)
FLOOR_Y = 51               # the dry board the cat sits on (warm)
# the enlarged cat, native: a sitting frame-2 cat ~30 wide × ~32 tall, centred a
# touch RIGHT of frame so the look-off-frame gaze has air to look INTO on the left
# (the rain side), and the warm shelter wedge opens toward it. The head clears the
# fascia (CY-R > FASCIA_Y+9) so it reads as a distinct round head below the eave.
CAT_CX = 31                # chest centre x
HEAD_CX = 36               # head centre x (biased right = frame-2 look-dir)
HEAD_CY = 31               # head centre y (clears the fascia + antefix row)
HEAD_R = 9                 # head radius


# cosmetic preview — no real hotspots. These rects only confirm the three spec
# elements (eave / sheltered cat / rain-in-front) sit where the description wants.
CHECK_RECTS = [
    (0, EAVE_Y, W, FASCIA_Y - EAVE_Y + 6),          # the curled tile eave band
    (CAT_CX - 18, HEAD_CY - 12, 38, FLOOR_Y - HEAD_CY + 18),  # the sheltered cat
    (0, FASCIA_Y, 14, H - FASCIA_Y),                # the rain-in-front column (left)
]


# ── the curled giwa tile eave (asset-local; the giwa vocab of the bg cosmetic) ─

def paint_eave(d):
    """A curled slate giwa eave across the top — the shelter the cat sits under.

    Same giwa read as cosmetic-bg-rainsound (convex barrel tiles, a dark fascia,
    round antefix tile-ends, a wet drip-edge) but seen close + from below: the cat
    is tucked just under the fascia. Cool throughout (exterior wet slate) so the
    warm cat below pops. The eave sweeps UP at the right corner (추녀) so the frame
    reads as a real upturned giwa corner, not a flat shelf.
    """
    tile_w = 14
    # the upper tile field (two short rows of convex barrels) above the fascia
    rows = [
        (EAVE_Y,     6, PAL["rain"][3], PAL["rain"][2], PAL["rain"][4]),
        (EAVE_Y + 6, 6, PAL["rain"][4], PAL["rain"][3], RAIN_DEEP),
    ]
    for ry, rh, base, crown, valley in rows:
        fill(d, 0, ry, W, rh, base)
        for tx in range(-4, W, tile_w):
            vline(d, tx + tile_w // 2, ry, rh - 1, crown)       # lit convex crown
            vline(d, tx, ry, rh, valley)                        # dark valley channel
            dither(d, tx + 1, ry, 2, rh, valley, phase=0)
        hline(d, 0, ry + rh - 1, W, OUTLINE)
    # the dark eave fascia (처마) — the heavy beam the cat shelters under
    fill(d, 0, FASCIA_Y, W, 4, PAL["rain"][4])
    hline(d, 0, FASCIA_Y, W, PAL["stone"][2])                   # lit fascia top
    hline(d, 0, FASCIA_Y + 3, W, OUTLINE)                       # heavy eave shadow
    # round antefix tile-ends (막새) hanging from the fascia (the giwa "teeth"),
    # kept short so they don't reach down onto the cat's head below
    for tx in range(2, W, tile_w):
        d.ellipse([tx, FASCIA_Y + 2, tx + 5, FASCIA_Y + 7],
                  fill=PAL["rain"][3], outline=OUTLINE)
        d.point((tx + 2, FASCIA_Y + 4), fill=PAL["stone"][1])   # lit boss
        d.point((tx + 2, FASCIA_Y + 5), fill=RAIN_DEEP)         # 막새 face hollow
    # the eave sweeps UP at the RIGHT corner (추녀) — the cat looks out past it
    for i in range(20):
        xx = W - 20 + i
        lift = (i + 1) * (i + 1) // 60          # quadratic upturn at the very tip
        yy = FASCIA_Y - lift
        vline(d, xx, yy, 4, PAL["rain"][4])
        d.point((xx, yy), fill=PAL["stone"][2])
        d.point((xx, yy + 3), fill=OUTLINE)
    d.point((W - 1, FASCIA_Y - 6), fill=PAL["ember"][2])        # a touch of warm dusk
    # the wet drip-edge of the fascia: a few cool beads about to fall (the rain
    # leaves the roof HERE, in front of the cat — never on it). Skip any bead whose
    # fall-line would clip the cat's head below (HEAD_CX±HEAD_R), so the water that
    # leaves the eave only ever drops into the OPEN air beside the cat, never on it.
    for dx in range(7, W, 14):
        if abs(dx - HEAD_CX) <= HEAD_R + 1:
            continue
        d.point((dx, FASCIA_Y + 9), fill=PAL["rain"][0])
        d.point((dx, FASCIA_Y + 10), fill=PAL["rain"][1])


# ── the warm sheltered floor wedge the cat sits on (the precious warmth) ──────

def paint_shelter(d):
    """The dry warm board under the eave the cat sits on — the warm pole of the card.

    A low wooden sill/board catching a sliver of interior ember warmth (the temple
    is warm INSIDE; the cat sits at the dry threshold). A soft warm glow pools up
    behind the cat so the silhouette reads warm-on-cool. Wood + ember ramps; the
    glow is dithered (no smooth alpha). Kept under the eave so the rain mask reads.
    """
    # The warmth must be PRECIOUS (the §10 melancholy-luminous rule): NOT a fiery
    # halo, NOT a striped curtain, and NOT mid-height side-lobes (round-4: a bloom
    # behind a narrower cat only ever shows as two orange shoulder-pads). So the
    # warmth lives LOW and FLAT — a warm puddle on the BOARD right at the cat's seat,
    # mostly hidden by the wide haunch + drawn over by the board, reading only as a
    # thin warm ground-halo creeping out beside the paws. The cat's own lit-edge rim
    # (below) carries the warmth ONTO the fur. Together = warm-on-cool, scarce.
    by0 = FLOOR_Y - 2                                       # the warm puddle sits AT the board
    for half, tone in ((17, PAL["bronze"][3]), (12, PAL["ember"][3]),
                       (8, PAL["ember"][2])):               # out→in, all on a few low rows
        for yy in range(by0 - 4, by0 + 2):
            if 0 <= yy < H:
                dy = abs(yy - by0) + 1
                w2 = max(0, half - dy)                      # a low flat lens, widest at by0
                if w2 > 0:
                    dither(d, CAT_CX - w2, yy, w2 * 2, 1, tone, phase=(yy % 2))
    # the wooden board (a warm hanok sill) the cat is sitting on
    fill(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["wood_dark"][1])
    hline(d, 0, FLOOR_Y, W, PAL["wood_light"][1])               # lit front lip
    hline(d, 0, FLOOR_Y + 1, W, PAL["wood_light"][2])
    # plank grain ticks (warm), sparse
    for gx in range(4, W, 17):
        hline(d, gx, FLOOR_Y + 6, 4, PAL["wood_light"][2])
        hline(d, gx + 8, FLOOR_Y + 10, 3, PAL["wood_dark"][2])
    dither(d, 0, H - 6, W, 6, PAL["wood_dark"][2], phase=1)     # shaded board recess
    # a faint ember sheen on the board right under the cat (warmth it sits in)
    dither(d, CAT_CX - 13, FLOOR_Y + 1, 26, 2, PAL["ember"][2], phase=0)


# ── the cat, native at avatar scale — the EXACT common.cat(frame=2) design ─────

def paint_cat(d):
    """The brown temple cat of room-01-dasil, frame-2 pose, enlarged natively.

    Faithful to common.cat(frame=2): a sitting cat, upright chest over a rounded
    haunch, head up-right (the look-off-frame bias), two triangular ears with a
    `plum` inner-ear fleck, a faint `gold_light` glint in each eye biased toward
    the look direction, a muzzle/nose tick, two short front legs, and a tail
    curving UP the right side. Same `wood_dark`/`wood_light` fur ramp, same
    OUTLINE, same warm-cool eye glint — only enlarged with clean 1px edges.
    Returns the cat's alpha mask so the rain can be masked OFF the silhouette.
    """
    fur = PAL["wood_dark"][1]
    fur_sh = PAL["wood_dark"][2]
    fur_dk = PAL["wood_dark"][3]
    fur_hi = PAL["wood_light"][2]

    chest_top = HEAD_CY + HEAD_R - 2       # chest begins just under the head ball
    haunch_top = chest_top + 12

    drop_shadow(d, CAT_CX - 14, FLOOR_Y - 1, 28, 2)            # warm contact shadow

    # ── haunch: a wide rounded base (the seated lower body) ──
    d.ellipse([CAT_CX - 15, haunch_top, CAT_CX + 15, FLOOR_Y - 1], fill=fur,
              outline=OUTLINE)
    # ── chest column rising from the haunch (upright, slightly narrower) ──
    d.polygon([(CAT_CX - 9, chest_top), (CAT_CX + 9, chest_top),
               (CAT_CX + 12, haunch_top + 8), (CAT_CX - 12, haunch_top + 8)],
              fill=fur, outline=OUTLINE)
    # belly/chest core shading (frame-2 dithers the right belly) — warm-cool form
    dither(d, CAT_CX + 1, chest_top + 4, 11, 16, fur_sh, phase=1)
    dither(d, CAT_CX + 5, haunch_top + 2, 8, 10, fur_dk, phase=0)
    vline(d, CAT_CX - 9, chest_top + 2, 18, fur_hi)            # lit left chest edge
    # a soft warm rim-light down the lit (left) side so it reads warm-on-cool: a
    # warm tan edge up the chest, warming to a precious ember catch LOW where the
    # board-glow licks the fur (the only saturated warmth that touches the cat).
    vline(d, CAT_CX - 11, haunch_top - 4, 14, PAL["wood_light"][2])
    vline(d, CAT_CX - 12, FLOOR_Y - 10, 7, PAL["ember"][2])    # ember licks the lit edge low
    d.point((CAT_CX - 12, FLOOR_Y - 4), fill=PAL["gold_light"][2])  # brightest catch

    # ── the tail curving UP the right side (frame-2's upright tail) ──
    ttop = haunch_top
    d.line([CAT_CX + 13, FLOOR_Y - 4, CAT_CX + 17, ttop], fill=fur)
    d.line([CAT_CX + 14, FLOOR_Y - 4, CAT_CX + 18, ttop], fill=fur)
    d.line([CAT_CX + 18, ttop, CAT_CX + 14, ttop - 8], fill=fur)   # tail tip hooking in
    d.line([CAT_CX + 19, ttop, CAT_CX + 15, ttop - 8], fill=fur_sh)
    d.point((CAT_CX + 18, ttop + 6), fill=fur_hi)             # tail highlight
    d.point((CAT_CX + 14, ttop - 8), fill=fur_hi)             # curled tip catch
    # outline the tail so it reads as a separate limb against the chest
    d.line([CAT_CX + 12, FLOOR_Y - 4, CAT_CX + 17, ttop - 1], fill=OUTLINE)
    d.line([CAT_CX + 19, ttop - 1, CAT_CX + 13, ttop - 9], fill=OUTLINE)

    # ── two front legs (short, planted on the board) ──
    for lx in (CAT_CX - 7, CAT_CX + 2):
        fill(d, lx, FLOOR_Y - 8, 5, 8, fur)
        vline(d, lx, FLOOR_Y - 8, 8, fur_hi)                  # lit leg edge
        vline(d, lx + 4, FLOOR_Y - 7, 7, fur_sh)             # shaded inner leg
        d.ellipse([lx - 1, FLOOR_Y - 3, lx + 5, FLOOR_Y + 1], fill=fur,
                  outline=OUTLINE)                            # rounded paw
        frame(d, lx, FLOOR_Y - 8, 5, 7, OUTLINE)
    # a dark seam between the two legs (the gap reads as two legs, not a slab)
    vline(d, CAT_CX, FLOOR_Y - 7, 7, fur_dk)

    # ── head: a rounded ball biased up-RIGHT (the look-off-frame direction) ──
    d.ellipse([HEAD_CX - HEAD_R, HEAD_CY - HEAD_R, HEAD_CX + HEAD_R,
               HEAD_CY + HEAD_R], fill=fur, outline=OUTLINE)
    dither(d, HEAD_CX + 2, HEAD_CY - 4, 5, 9, fur_sh, phase=0)  # right-side shade
    d.ellipse([HEAD_CX - HEAD_R + 1, HEAD_CY - HEAD_R + 1, HEAD_CX,
               HEAD_CY], outline=fur_hi)                       # lit upper-left cheek

    # ── two triangular ears with the plum inner-ear fleck (the builder's _cat_ear) ──
    _ear(d, HEAD_CX - 5, HEAD_CY - HEAD_R - 2, fur, fur_sh, +1)
    _ear(d, HEAD_CX + 5, HEAD_CY - HEAD_R - 2, fur, fur_sh, -1)

    # ── eyes: a faint gold glint, BIASED toward the look direction (right) ──
    # frame-2 biases the eyes to ex = hx+3; here both eyes look up-and-right.
    ex = HEAD_CX + 1
    for dx in (0, 5):
        d.ellipse([ex + dx - 1, HEAD_CY - 2, ex + dx + 1, HEAD_CY], fill=fur_dk)
        d.point((ex + dx, HEAD_CY - 1), fill=PAL["gold_light"][1])  # warm glint
        d.point((ex + dx + 1, HEAD_CY - 1), fill=PAL["gold_light"][0])
    # ── muzzle + nose tick (the plum nose, biased to the look-dir) ──
    d.point((HEAD_CX + 2, HEAD_CY + 3), fill=fur_sh)          # muzzle shade
    d.point((HEAD_CX + 3, HEAD_CY + 3), fill=PAL["plum"][3])  # pink nose
    hline(d, HEAD_CX + 1, HEAD_CY + 5, 4, fur_sh)             # mouth line
    # a few whisker hints catching the light (1px, toward the look-dir)
    d.point((HEAD_CX + 7, HEAD_CY + 3), fill=fur_hi)
    d.point((HEAD_CX + 8, HEAD_CY + 4), fill=fur_hi)

    # build the cat's alpha mask (any non-transparent pixel of THIS pass) so the
    # rain pass can be masked OFF the silhouette. Returned to build().


def _ear(d, tipx, tipy, fur, fur_sh, sgn):
    """One triangular ear, apex up — the builder's _cat_ear enlarged.

    The builder's ear is a 3px triangle with a SINGLE plum inner-fleck point; so
    here the ear is a tight triangle and the plum is only a tiny inner fleck (not a
    wing) — a too-large pink fill made the round-2 ears read as butterfly wings.
    """
    base = tipy + 6
    d.polygon([(tipx, tipy), (tipx - 3 * sgn, base), (tipx + 2 * sgn, base)],
              fill=fur, outline=OUTLINE)
    d.line([tipx, tipy, tipx - 3 * sgn, base], fill=fur_sh)      # shaded outer edge
    # a tiny plum inner fleck (the builder's single point, just 2px tall here)
    d.point((tipx - sgn, tipy + 3), fill=PAL["plum"][2])
    d.point((tipx - sgn, tipy + 4), fill=PAL["plum"][3])


def _reference_swatch(d):
    """Stamp the canonical common.cat(frame=2) at native 1× in the lower-left.

    The literal cross-asset anchor (rule 2): this is the EXACT animal + pose the
    room/strip render, so the enlarged cat above is provably the same cat looking
    off-frame. Tiny, in the lower-left corner, a faint reference token, clear of the
    warm bloom + the big cat's tail/paw so it reads as a separate small swatch.
    """
    C.cat(d, 1, 47, frame=2)


def build():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 1) the warm sheltered board + under-glow (behind everything)
    paint_shelter(d)
    # 2) the cat (warm), drawn on the warm board — capture its mask afterward
    before = img.copy()
    paint_cat(d)
    # the cat's silhouette mask = pixels that CHANGED from `before` to now, i.e.
    # everything the cat pass drew (fur, ears, tail, paws). Used to keep rain off.
    cat_mask = _changed_mask(before, img)

    # 3) the curled tile eave shelter across the top
    paint_eave(d)

    # 4) the rain, raked over the OPEN AIR only — masked OFF the cat + the dry
    #    sheltered wedge under the eave, so not one streak lands on the fur.
    _paint_rain_in_front(d, img, cat_mask)

    # 5) the tiny canonical cat(frame=2) swatch — the cross-asset anchor
    _reference_swatch(d)
    return img


def _changed_mask(before: Image.Image, after: Image.Image):
    """Bool set of (x,y) where `after` differs from `before` (the cat silhouette)."""
    bp, ap = before.load(), after.load()
    mask = set()
    for yy in range(H):
        for xx in range(W):
            if bp[xx, yy] != ap[xx, yy]:
                mask.add((xx, yy))
    return mask


def _paint_rain_in_front(d, img, cat_mask):
    """Rain raked over the open air, masked OFF the cat + the dry shelter wedge.

    Draw a fresh `rain_curtain` onto a scratch layer, then composite it back only
    where it is NOT over (a) the cat silhouette, (b) the dry sheltered wedge under
    the eave around the cat, or (c) the warm board lip — so the rain visibly falls
    IN FRONT of / beside the cat but never touches the fur (the §10 hard read:
    "Gotas … delante de él, nunca encima"). Two phases = the same 2-layer slate
    depth as every other rain surface in the level.
    """
    rain = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rain)
    # rain starts BELOW the fascia (it has already left the roof) and falls full-height.
    # Sparser than the bg cosmetic (this is a small portrait, not a downpour plate):
    # the rain should frame the sheltered cat, not bury it.
    C.rain_curtain(rd, 0, FASCIA_Y + 2, W, H - FASCIA_Y - 2, phase=0, density=10, lean=2)
    C.rain_curtain(rd, 0, FASCIA_Y + 2, W, H - FASCIA_Y - 2, phase=1, density=13, lean=3)

    # the dry sheltered wedge: a region hugging the cat where NO rain falls (the
    # eave + the cat's own body shield it). A simple per-column "dry to this y"
    # profile centred on the cat, plus a 1px halo around the cat silhouette.
    rp = rain.load()
    halo = _dilate(cat_mask)
    for yy in range(FASCIA_Y + 2, H):
        for xx in range(W):
            if rp[xx, yy][3] == 0:
                continue
            # keep rain OFF the cat + its 1px halo (never on the fur)
            if (xx, yy) in halo:
                rp[xx, yy] = (0, 0, 0, 0)
                continue
            # keep a dry sheltered wedge directly under the eave around the cat:
            # within the central shelter span, the top rows stay dry (rain hasn't
            # reached past the overhang yet); the rain only appears lower + to the
            # sides where it falls past the open edge of the eave. A generous cone
            # so the cat clearly sits in a pocket of dry air, the rain to the sides.
            dist = abs(xx - CAT_CX)
            dry_to = FASCIA_Y + 2 + max(0, 40 - int(dist * 1.6))
            if dist < 22 and yy < dry_to:
                rp[xx, yy] = (0, 0, 0, 0)
    img.alpha_composite(rain)


def _dilate(mask):
    """1px dilation of a pixel set (a halo so rain keeps clear of the fur edge)."""
    out = set(mask)
    for (x, y) in mask:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                out.add((x + dx, y + dy))
    return out


def main():
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-avatar-templecat.png")
    C.preview(img, "preview_cosmetic-avatar-templecat.png", scale=3)
    C.hotspot_debug(img, CHECK_RECTS, "hotspot_cosmetic-avatar-templecat.png", scale=3)
    # an 8× zoom so the cat anatomy + the rain-never-on-fur read can be eyeballed
    big = img.resize((W * 8, H * 8), Image.NEAREST)
    C.save_out(big, "zoom_cosmetic-avatar-templecat_8x.png")


if __name__ == "__main__":
    main()
