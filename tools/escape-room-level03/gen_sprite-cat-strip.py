#!/usr/bin/env python3
"""sprite-cat-strip.png — the market cat, 2-frame scene sprite (호떡집, Zona 1).

Dossier §10 (line 846): «el gato del mercado, 2 frames (sentado / cola en
movimiento), ~32×24 por frame». This is the SCENE sprite the 호떡집 room loops
beside 순자 이모's griddle — NOT the cosmetic avatar. The two reads must be kept
strictly apart (dossier §9 line 852):

  - sprite-cat-strip  (THIS file): the bare scene cat, no cardboard box, NO neon
    back-stripe, 2 frames (frame 0 sitting / frame 1 tail flicked). 64×24 transp.
  - cosmetic-avatar-marketcat-strip: the 🟣 reward — same cat ON a cardboard box,
    a pink-neon stripe across the back, 3 frames (blink / tail / lick+look up).
    That is a SEPARATE cosmetic asset; frame 2 (the lick) and the neon stripe and
    the box live ONLY there (STYLE.md §"market_cat" note + budget §10).

So this file renders ONLY common.market_cat frames 0 and 1, with NOTHING added —
no box, no stripe, no third frame. The cat IS the shared builder so it reads as
the SAME cat that sits in room-01-hotteok (rule 2: compose with the builder, the
QA eyeballs "same cat in the room and the strip").

Layout: two 32×24 cells side by side (frame 0 then frame 1), each holding one
centred ~18×17 cat. Transparent everywhere else (the corners are alpha 0) so the
UI/animator can blit each cell. The builder already stamps a warm contact shadow
(it loafs by the warm griddle, off the cold street) + warm gold eyes + the soft
OUTLINE — no #000, no neon glow, 100% mundane (L3-e).

L3-a: no Korean. L3-b/L3-e: nothing hidden, it is just a cat.

Deterministic: market_cat's only entropy is none here (the strokes it scatters
are internal to other builders); re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_sprite-cat-strip.py
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C

# ── strip geometry ───────────────────────────────────────────────────────────
FRAME_W = 32                    # per-frame cell width  (~32 per dossier §10)
FRAME_H = 24                    # per-frame cell height (~24 per dossier §10)
N_FRAMES = 2                    # frame 0 = sitting, frame 1 = tail flicked
W = FRAME_W * N_FRAMES          # 64 total
H = FRAME_H                     # 24

# common.market_cat draws into a ~18-wide × ~17-tall footprint anchored at (x,y):
#   x .. x+17  (the body+tail span; the flick tail reaches ~x+17)
#   y-1 .. y+16 (head top at y-1, the contact shadow at y+15)
# To centre that footprint in a 32×24 cell:
CAT_W = 18                      # measured footprint width  (x .. x+17)
CAT_H = 18                      # measured footprint height (y-1 .. y+16)
ORIGIN_X = (FRAME_W - CAT_W) // 2          # = 7  -> cat spans col 7..24, centred
ORIGIN_Y = (FRAME_H - CAT_H) // 2 + 1      # = 4  -> head (y-1)=3 .. shadow=19


def build() -> Image.Image:
    """Two transparent cells; one centred market_cat (frame 0, then 1) in each."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for fi in range(N_FRAMES):
        ox = fi * FRAME_W + ORIGIN_X
        oy = ORIGIN_Y
        C.market_cat(d, ox, oy, frame_i=fi)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "sprite-cat-strip.png")
    C.preview(img, "preview_sprite-cat-strip.png", scale=3)
    # a 6x zoom of each frame so the silhouette + warm eyes + tail can be eyeballed
    big6 = img.resize((W * 6, H * 6), Image.NEAREST)
    C.save_out(big6, "zoom_sprite-cat-strip_6x.png")


if __name__ == "__main__":
    main()
