#!/usr/bin/env python3
"""cosmetic-avatar-marketcat.png — 🟣 avatar «시장 고양이» (static preview frame).

Dossier §9 (line 803): «El gato del mercado sentado sobre una caja de cartón
junto a la plancha, a resguardo del frío de la calle. […] Una mancha de neón
rosa cruzándole el lomo, nunca encima de los ojos.» This is the STATIC preview
frame of the 🟣 epic avatar (64×64 transp) — the single still the UI shows when
the animated strip (cosmetic-avatar-marketcat-strip, a SEPARATE asset) is not
looping. Per the spec it shows market_cat FRAME 0 (sitting), i.e. the calm
"preview" pose, NOT the lick (frame 2 is strip-only).

Composition (what THIS asset adds on top of the shared common.market_cat):
  - a CARDBOARD BOX the cat sits on (wood_* kraft tones, flap + tape seam) — the
    "caja de cartón" that keeps it off the cold street. Warm contact shadow under
    the box (it is by the warm griddle, L3-d/rule 4: SHADOW_WARM not COOL).
  - a NEON-PINK STREAK across the cat's back (neon_pink ramp, glow by bands per
    rule 3 — no soft alpha), arcing along the spine from haunch to shoulders and
    STOPPING short of the head so it is NEVER over the eyes (spec + STYLE.md).
  - a faint warm halo of the box lit amber from the griddle side (left), so the
    avatar reads as "by the plancha", not floating on the cold street.

The cat itself is common.market_cat (frame 0) so it is the SAME cat that loafs in
room-01-hotteok and the scene strip (cross-consistency, rule 2 — QA eyeballs it).
The pink inner-ear flecks the builder already stamps are NOT the back-streak; the
streak is a distinct dorsal band added here.

Hard rules honored:
  - L3-a: NO Korean anywhere — it is just a cat on a box.
  - L3-b/L3-e: nothing hidden, no second shadow, no easter egg — 100% mundane.
  - rule 1: only common.PAL ramps + OUTLINE + SHADOW_WARM (+ neon_pink for the
    streak's glow). rule 2: OUTLINE (#2a1c14), never #000. rule 3: the neon
    streak is BANDS of neon_pink (glow), the box transitions use dither().
  - transparent bg (cosmetic close-up): the corners are alpha 0.

Deterministic: no unseeded random (market_cat scatters nothing here; the box +
streak are drawn from fixed coordinates). Re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cosmetic-avatar-marketcat.py
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C

# ── canvas geometry (64×64 transp, per STYLE.md asset table) ─────────────────
W = H = 64

# The cardboard box sits low-centre; the cat loafs on its lid. common.market_cat
# draws into a ~18-wide × ~18-tall footprint anchored at (x,y) (head top at y-1,
# contact shadow at y+15). We place the cat centred horizontally, its shadow line
# landing on the box lid.
BOX_W = 38
BOX_H = 20
BOX_X = (W - BOX_W) // 2                 # = 13 -> box spans col 13..50, centred
BOX_Y = 40                               # lid top at y=40, base near y=60

CAT_W = 18
CAT_H = 18
CAT_X = (W - CAT_W) // 2                 # = 23 -> cat spans col 23..40, centred
CAT_Y = BOX_Y - CAT_H + 2                # body base (cat_y+16) rests ON the lid top


def draw_box(d: ImageDraw.ImageDraw) -> None:
    """A kraft cardboard box (lid + body, tape seam, flap) the cat sits on.

    Warm wood_dark/wood_light kraft tones; amber-lit on the left (griddle side),
    shaded right with dither. A SHADOW_WARM contact shadow under it (it is by the
    warm plancha, not the cold street — rule 4). No #000 (rule 2).
    """
    kraft, kraft_hi, kraft_sh = (C.PAL["wood_light"][2], C.PAL["wood_light"][1],
                                 C.PAL["wood_dark"][1])
    tape = C.PAL["wood_dark"][0]
    x, y, w, h = BOX_X, BOX_Y, BOX_W, BOX_H
    # warm contact shadow on the (implied) box-by-the-griddle floor
    C.drop_shadow(d, x + 2, y + h, w - 4, 2)
    # the box body (front face)
    C.fill(d, x, y + 4, w, h - 4, kraft)
    C.vline(d, x, y + 4, h - 4, kraft_hi)              # lit left edge (griddle side)
    C.dither(d, x + w - 11, y + 7, 11, h - 8, kraft_sh, phase=0)  # shaded right face
    # the open top flaps: a lid rim with a folded-back flap catching warm light
    C.fill(d, x, y, w, 5, kraft_hi)                    # lid top surface (lit)
    C.hline(d, x, y, w, C.PAL["wood_light"][0])        # bright lid front edge
    C.fill(d, x + 2, y + 1, w - 4, 3, kraft)           # lid recess
    # a folded-up back flap behind the cat (a darker triangle of inner cardboard)
    d.polygon([(x + 5, y), (x + w - 7, y), (x + w - 11, y - 5), (x + 9, y - 5)],
              fill=kraft_sh, outline=C.OUTLINE)
    C.hline(d, x + 9, y - 5, w - 20, C.PAL["wood_dark"][0])  # flap top crease (lit)
    # packing-tape seam down the front (a strip of lighter brown)
    cx = x + w // 2
    C.fill(d, cx - 3, y + 4, 6, h - 4, tape)
    C.vline(d, cx - 3, y + 4, h - 4, C.PAL["wood_light"][1])
    C.dither(d, cx + 1, y + 6, 2, h - 8, kraft_sh, phase=1)
    # a couple of corrugation/crush creases so it reads as worn cardboard
    d.line([x + 4, y + h - 2, x + 9, y + 6], fill=kraft_sh)
    d.line([x + w - 6, y + h - 2, x + w - 10, y + 7], fill=kraft_sh)
    C.frame(d, x, y, w, h, C.OUTLINE)


def draw_back_streak(d: ImageDraw.ImageDraw) -> None:
    """The neon-pink streak across the cat's back — glow by BANDS, never on eyes.

    market_cat(frame 0) is a FRONT-FACING loaf. Its visible "back" (lomo) is the
    broad rounded RIDGE of the haunch — the top of the body bulge that sits BELOW
    the chest and head. Mapping the rendered silhouette (anchor->grid): the eyes
    are at cat_y+3, the chest ends ~cat_y+8, and the haunch ridge runs across
    cat_x+3 .. cat_x+13 at cat_y+9 .. cat_y+12. A band laid across that ridge reads
    unambiguously as "over the back" and is a full 6 rows below the eyes -> NEVER
    over the eyes (spec).

    The band sweeps left->right across the ridge, dipping slightly (it follows the
    curve of the haunch). A dim halo band sits one row below the bright crest
    (rule 3 = glow by BANDS, no blur, no soft alpha). Only neon_pink ramp (rule 1).
    Reads as the alley's pink neon caught on the cat's back — 100% mundane (L3-e),
    the one cool note on an otherwise warm avatar.
    """
    core = C.PAL["neon_pink"][0]     # bright crest of the tube
    mid = C.PAL["neon_pink"][1]      # body of the streak
    halo = C.PAL["neon_pink"][2]     # dim outer band
    x, y = CAT_X, CAT_Y
    # the streak path: a band ACROSS the haunch ridge, left flank to right flank,
    # dipping to follow the rounded back. Every point is row >= y+9 (six rows below
    # the eyes at y+3) and avoids the chest centre column run -> clearly the back.
    spine = [
        (x + 4, y + 9),
        (x + 5, y + 8),
        (x + 6, y + 8),
        (x + 7, y + 9),
        (x + 8, y + 9),
        (x + 9, y + 9),
        (x + 10, y + 10),
        (x + 11, y + 10),
        (x + 12, y + 11),
    ]
    # a tight 2px band: dim halo exactly one row below the crest (no wide spread,
    # so it reads as a defined STRIPE not a blob), then the bright crest on top.
    for (cx, cy) in spine:
        d.point((cx, cy + 1), fill=halo)
    for (cx, cy) in spine:
        d.point((cx, cy), fill=mid)
    # the brightest-core hot centre along the middle of the band
    for (cx, cy) in spine[2:7]:
        d.point((cx, cy), fill=core)


def build() -> Image.Image:
    """Transparent 64×64: box, then cat (frame 0) on its lid, then the streak."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_box(d)
    C.market_cat(d, CAT_X, CAT_Y, frame_i=0)
    draw_back_streak(d)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-avatar-marketcat.png")
    C.preview(img, "preview_cosmetic-avatar-marketcat.png", scale=3)
    # a 6x zoom so the streak placement (off the eyes) + box read can be eyeballed
    big6 = img.resize((W * 6, H * 6), Image.NEAREST)
    C.save_out(big6, "zoom_cosmetic-avatar-marketcat_6x.png")


if __name__ == "__main__":
    main()
