#!/usr/bin/env python3
"""cosmetic-frame-dancheong.png — the 🔵 rare "단청" avatar frame (Dossier §10).

A 96×96 avatar frame with a TRANSPARENT central window (~64×64) so the player's
avatar shows through. The border is built from the SHARED 단청 architecture
builders — polychrome temple beams (`dancheong_beam`: dc_green 뇌록 ground +
dc_red 머리초 caps + dc_blue/white motifs) running along all four sides, with the
single-band helper (`dancheong_band`) closing the inner edge. The FOUR CORNERS
are 사물 medallions stamped via `common.samul_medallion`:

    top-left  = 범종 bell      top-right    = 법고 drum
    bottom-left = 목어 fish     bottom-right = 운판 cloud-plate

— each the canonical 16×16 disc the builder draws, so every one reads at 16px and
matches the 사물 across the level (rule 2 — compose with the shared builders).

Layout (the four beams form a square ring; the 16×16 corner medallions sit ON the
ring's corners so the beams "carry" them like a 처마 carries the 사물각):

    ┌────────────────────┐   outer edge  = 0
    │ M   top beam     M │   border band = 16px thick
    │   ┌────────────┐   │   window      = 64×64 transparent (x,y 16..80)
    │ L │ transparent│ R │   medallions  = 16×16, one per corner, centred on
    │   └────────────┘   │                 the corner of the ring
    │ M  bottom beam   M │
    └────────────────────┘

Run from repo root:  python tools/escape-room-level02/gen_cosmetic-frame-dancheong.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, frame, dither

W = H = 96
BORDER = 16                      # thickness of the 단청 border band
WIN = W - 2 * BORDER             # 64 → the transparent central window (16..80)
WIN_X0, WIN_Y0 = BORDER, BORDER
WIN_X1, WIN_Y1 = W - BORDER, H - BORDER   # 80, 80
MED = 16                         # 사물 medallion size (one per corner)


# 단청 ramps used across the rails (light→dark within dc_green/dc_red/dc_blue)
GR, GR_HI, GR_DK = PAL["dc_green"][2], PAL["dc_green"][1], PAL["dc_green"][3]
RD, RD_HI, RD_DK = PAL["dc_red"][1], PAL["dc_red"][0], PAL["dc_red"][3]
BL = PAL["dc_blue"][1]
WT = PAL["white"][0]


def _green_ground_h(d, x: int, y: int, w: int) -> None:
    """A horizontal 뇌록-green beam ground: lit top, shaded underside, 16px tall."""
    fill(d, x, y, w, BORDER, GR)
    hline(d, x, y, w, GR_HI)                       # lit top edge
    hline(d, x, y + 1, w, GR_HI)
    dither(d, x, y + BORDER - 4, w, 4, GR_DK, phase=1)   # shaded underside
    hline(d, x, y + BORDER - 1, w, GR_DK)


def _green_ground_v(d, x: int, y: int, h: int) -> None:
    """A vertical 뇌록-green beam ground: lit outer edge, shaded inner edge, 16px."""
    fill(d, x, y, BORDER, h, GR)
    vline(d, x, y, h, GR_HI)                       # lit outer edge
    vline(d, x + 1, y, h, GR_HI)
    dither(d, x + BORDER - 4, y, 4, h, GR_DK, phase=1)   # shaded inner edge
    vline(d, x + BORDER - 1, y, h, GR_DK)


def _yeonju_band_h(d, x: int, y: int, w: int) -> None:
    """A horizontal 연주문 dotted 단청 band (the shared `dancheong_band` look).

    Centred in a green rail between the corner medallions. Uses the shared
    single-band helper for the polychrome G/W/R/W/B/W rhythm, bracketed by the
    dc_green[3] rails the helper itself draws.
    """
    C.dancheong_band(d, x, y, w, horizontal=True)


def _yeonju_band_v(d, x: int, y: int, h: int) -> None:
    """A vertical 연주문 dotted 단청 band — 90°-rotated twin of `_yeonju_band_h`."""
    C.dancheong_band(d, x, y, h, horizontal=False)
    vline(d, x - 1, y, h, GR_DK)                   # framing rails (helper omits these)
    vline(d, x + 3, y, h, GR_DK)


def _ring(d) -> None:
    """The square 단청 beam ring: four 뇌록 rails framing the window, each carrying
    a centred 단청 연주문 band, flush to the outer edge (rounded medallion corners
    are the only intentional outer transparency).
    """
    inner = H - 2 * BORDER                         # 64 — length of each rail run
    # ── green grounds (full edges; corners get over-stamped by medallions) ──
    _green_ground_h(d, 0, 0, W)                     # top rail   y 0..15
    _green_ground_h(d, 0, H - BORDER, W)            # bottom rail y 80..95
    _green_ground_v(d, 0, BORDER, inner)            # left rail
    _green_ground_v(d, W - BORDER, BORDER, inner)   # right rail
    # ── centred polychrome bands on each rail (between the corner medallions) ──
    _yeonju_band_h(d, BORDER + 1, 6, inner - 2)            # top
    _yeonju_band_h(d, BORDER + 1, H - 10, inner - 2)       # bottom
    _yeonju_band_v(d, 6, BORDER + 1, inner - 2)            # left
    _yeonju_band_v(d, H - 10, BORDER + 1, inner - 2)       # right
    # ── a red 머리초 accent block mid-rail (the painted heart of each beam) ──
    _meoricho_h(d, W // 2 - 8, 2, 16)              # top centre
    _meoricho_h(d, W // 2 - 8, H - BORDER + 2, 16) # bottom centre
    _meoricho_v(d, 2, H // 2 - 8, 16)              # left centre
    _meoricho_v(d, W - BORDER + 2, H // 2 - 8, 16) # right centre


def _meoricho_h(d, x: int, y: int, w: int) -> None:
    """A small red 머리초 lotus-eye motif centred on a horizontal rail."""
    fill(d, x, y, w, BORDER - 4, RD)
    hline(d, x, y, w, RD_HI)
    dither(d, x, y + BORDER - 8, w, 3, RD_DK, phase=0)
    d.ellipse([x + w // 2 - 3, y + 2, x + w // 2 + 3, y + 8], outline=WT)
    d.point((x + w // 2, y + 5), fill=BL)          # blue lotus eye
    frame(d, x, y, w, BORDER - 4, OUTLINE)


def _meoricho_v(d, x: int, y: int, h: int) -> None:
    """A small red 머리초 lotus-eye motif centred on a vertical rail."""
    fill(d, x, y, BORDER - 4, h, RD)
    vline(d, x, y, h, RD_HI)
    dither(d, x + BORDER - 8, y, 3, h, RD_DK, phase=0)
    d.ellipse([x + 2, y + h // 2 - 3, x + 8, y + h // 2 + 3], outline=WT)
    d.point((x + 5, y + h // 2), fill=BL)          # blue lotus eye
    frame(d, x, y, BORDER - 4, h, OUTLINE)


def _window_edges(d) -> None:
    """Frame the transparent 64×64 hole: a recessed gilt lip + crisp OUTLINE.

    A simple two-line gilt inner moulding (white→bronze) reads as a carved
    recess that seats the avatar, WITHOUT adding more polychrome noise (the
    rails already carry the 단청 pattern). A crisp OUTLINE closes the hole.
    """
    # 1px gold inner moulding just inside the green ground, then the dark hole edge
    frame(d, WIN_X0 - 2, WIN_Y0 - 2, WIN + 4, WIN + 4, PAL["gold_light"][2])
    frame(d, WIN_X0 - 1, WIN_Y0 - 1, WIN + 2, WIN + 2, OUTLINE)


def _corners(d) -> None:
    """Stamp the four 사물 medallions on the ring's corners (each 16×16)."""
    C.samul_medallion(d, 0, 0, kind="bell")            # 범종 top-left
    C.samul_medallion(d, W - MED, 0, kind="drum")      # 법고 top-right
    C.samul_medallion(d, 0, H - MED, kind="fish")      # 목어 bottom-left
    C.samul_medallion(d, W - MED, H - MED, kind="cloud")  # 운판 bottom-right


def _punch_window(img: Image.Image) -> None:
    """Force the central 64×64 window fully transparent (the avatar shows here)."""
    px = img.load()
    for yy in range(WIN_Y0, WIN_Y1):
        for xx in range(WIN_X0, WIN_X1):
            px[xx, yy] = (0, 0, 0, 0)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _ring(d)            # the four 단청 beam rails
    _window_edges(d)    # polychrome inner lip + crisp window outline
    _corners(d)         # the four 사물 medallions on the corners
    _punch_window(img)  # guarantee the central window is transparent

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-frame-dancheong.png")
    C.preview(img, "preview_cosmetic-frame-dancheong.png", scale=3)
    # an 8× zoom of each corner medallion so the 사물 read can be eyeballed at 16px
    for name, (cx, cy) in (("bell", (0, 0)), ("drum", (W - MED, 0)),
                           ("fish", (0, H - MED)), ("cloud", (W - MED, H - MED))):
        crop = img.crop((cx, cy, cx + MED, cy + MED))
        crop = crop.resize((MED * 8, MED * 8), Image.NEAREST)
        C.save_out(crop, f"zoom_dancheong_corner_{name}_8x.png")
    # composite over a light + a dark avatar-card so the transparent window and
    # the frame contrast can be judged the way the UI will show it.
    for tag, bg in (("light", (246, 239, 226, 255)), ("dark", (46, 58, 65, 255))):
        card = Image.new("RGBA", (W, H), bg)
        card.alpha_composite(img)
        C.save_out(card.resize((W * 3, H * 3), Image.NEAREST),
                   f"card_dancheong_{tag}_3x.png")


if __name__ == "__main__":
    main()
