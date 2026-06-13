#!/usr/bin/env python3
"""obj-diary-page.png — a GENERIC open diary page (fixed art, every run).

Dossier §11 + §12.2. A 128×128 transparent close-up of the master's diary opened
to an UNNAMED page: the shared `diary_book(open=True)` enlarged to fill the frame,
ruled with GENERIC ink brush-lines (suggested, illegible columns — the readable
KO of whichever Slot-4 candidate was drawn is painted OVER this by the UI, Neodgm
≥ 16px, §12.2), the persimmon cloth tie hanging from the spine, and soft warm
wood cover edges peeking at the outer margins.

Matches the diary LOOK of the shipped obj-diary-last.png (same builder, same
upscale recipe, same brush-line vocabulary) MINUS the 淸雨 seal — this page is
deliberately anonymous so one image serves all five Slot-4 candidates. The seal
is baked ONLY on obj-diary-last.png (the fixed final entry).

Run from repo root:  python tools/escape-room-level02/gen_obj-diary-page.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline

W = H = 128
# Same authoring recipe as obj-diary-last: draw the open diary once with the
# shared builder on its own small layer, then integer-NEAREST upscale so the
# pixel-art stays crisp (no soft alpha, no new hues) while filling the close-up.
BOOK_W, BOOK_H = 48, 30          # native footprint of diary_book(open) + margin
BOOK_SCALE = 2                   # → 96×60 book in the final frame
BOOK_DX, BOOK_DY = 16, 40        # where the upscaled book's top-left lands


def _page_to_final(px: int, py: int) -> tuple[int, int]:
    """Map a coordinate on the native book layer to the upscaled final canvas."""
    return BOOK_DX + px * BOOK_SCALE, BOOK_DY + py * BOOK_SCALE


def _ink_column(d, x: int, y: int, w: int, lines: int, step: int = 4) -> None:
    """A GENERIC ruled column of illegible wet brush-strokes — NOT glyphs.

    Unlike obj-diary-last's three "tiring hand" farewell lines, this is an even,
    anonymous block of writing: each row is a slightly crooked 2-tone stroke with
    a wet pooled head and a faint lower edge (body, not a hairline), broken into a
    ~6px "syllable" beat so it reads as handwriting you cannot READ. The same wet
    ink ramp as the last-entry page keeps the two diary close-ups consistent.
    Deterministic: a fixed wobble table, no random.
    """
    wet, ink, faint = PAL["ink"][2], PAL["ink"][1], PAL["ink"][0]
    # one wobble pattern per row index, cycled — fixed, never random
    wobbles = (
        (0, 0, 1, 0, -1, 0),
        (0, 1, 0, 0, -1, 1),
        (0, 0, 1, 0, 0, -1),
        (-1, 0, 0, 1, 0, 0),
    )
    # a gentle right-margin rag so the block doesn't read as a solid bar
    rag = (0, 2, 1, 3, 1, 2, 0, 2)
    for r in range(lines):
        ry = y + r * step
        ln = max(4, w - rag[r % len(rag)])
        wob = wobbles[r % len(wobbles)]
        d.point((x, ry), fill=wet)                # wet pooled head of the stroke
        d.point((x, ry + 1), fill=ink)
        for i in range(ln):
            px = x + i
            oy = wob[i % len(wob)]
            d.point((px, ry + oy), fill=ink)
            if i % 3 != 2:                        # faint lower edge = body
                d.point((px, ry + oy + 1), fill=faint)
        # illegible "syllable" beat: lift the brush every ~6px with a paper fleck
        for gx in range(x + 5, x + ln, 6):
            d.point((gx, ry), fill=PAL["hanji"][1])


def _cloth_tie(d, y: int) -> None:
    """The persimmon cloth tie hanging loose from the spine of the open book.

    diary_book(open) draws no tie (only the CLOSED book does), so we add it here
    as asset-local detail: a short ember-ramp band dangling at the spine with a
    little knot, matching the tie color of the closed/shipped diary (ember[3]).
    Drawn in NATIVE final coords so the cloth keeps a crisp edge.
    """
    # tie = persimmon cloth (same color as the closed diary's tie band, ember[3]);
    # highlight one step lighter (ember[2]); the fold seam is OUTLINE (a cloth
    # crease, not a new hue) — strictly palette-only.
    tie, tie_hi, tie_sh = PAL["ember"][3], PAL["ember"][2], OUTLINE
    # spine of the upscaled book sits at native x=22 → final spine x = BOOK_DX+44
    sx = BOOK_DX + 22 * BOOK_SCALE - 3      # centre the 6px-wide band on the spine
    # a wide flat ribbon wrapping over the gutter (the cloth that ties the book
    # shut, now slack on the open page): a 6px band with a lit left fold + shaded
    # right fold, so it reads as a flat strip of cloth, not a cord. A small fold
    # lip at the very top reads as the cloth tucking OVER the spine's top edge.
    fill(d, sx, y, 6, 9, tie)
    vline(d, sx, y, 9, tie_hi)              # lit left fold
    vline(d, sx + 5, y, 9, tie_sh)         # shaded right fold (crease)
    hline(d, sx, y, 6, tie_hi)             # top edge catches light
    d.point((sx + 5, y), fill=tie_sh)      # top-right corner in shade (a fold)
    hline(d, sx, y + 2, 6, tie_sh)         # the tuck crease where it bends over
    # the knot: a fuller persimmon bow-bulge where the cloth cinches at the gutter
    fill(d, sx - 2, y + 6, 10, 4, tie)
    hline(d, sx - 2, y + 6, 10, tie_hi)
    d.point((sx - 2, y + 9), fill=tie_sh)  # knot underside fold
    d.point((sx + 7, y + 9), fill=tie_sh)
    d.point((sx + 2, y + 7), fill=tie_hi)  # knot centre highlight
    # two loose tails of cloth falling from the knot into the gutter, each a 2px
    # band so they read as cloth ribbon ends (not thin cords)
    d.line([sx, y + 10, sx - 2, y + 17], fill=tie)
    d.line([sx + 1, y + 10, sx - 1, y + 17], fill=tie_sh)
    d.line([sx + 5, y + 10, sx + 7, y + 16], fill=tie)
    d.line([sx + 4, y + 10, sx + 6, y + 16], fill=tie_hi)
    d.point((sx - 2, y + 18), fill=tie_hi) # frayed tips
    d.point((sx + 7, y + 17), fill=tie_hi)


def build_book_layer() -> Image.Image:
    """The open diary on its OWN small layer, ready to be NEAREST-upscaled.

    Only the shared builder draws here; brush-lines, tie and cover-edge polish are
    added later in final-frame coordinates so their pixels stay crisp / native.
    """
    img, d = C.new_canvas(BOOK_W, BOOK_H)
    C.diary_book(d, 1, 2, open=True)        # spine ends near layer centre (x≈23)
    return img


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # ── cool contact shadow tucked under the two outer-bottom page corners ──
    # (the open pages dip lowest there; short solid shadow, not floating specks —
    #  the L1 "specks in the void" failure mode)
    sh_y = BOOK_DY + 27 * BOOK_SCALE
    C.drop_shadow(d, BOOK_DX + 6, sh_y, 30, 2)
    C.drop_shadow(d, BOOK_DX + BOOK_W * BOOK_SCALE - 42, sh_y, 30, 2)

    # ── the enlarged open diary (shared builder, NEAREST-upscaled) ──
    book = build_book_layer().resize(
        (BOOK_W * BOOK_SCALE, BOOK_H * BOOK_SCALE), Image.NEAREST)
    img.alpha_composite(book, (BOOK_DX, BOOK_DY))

    # ── warm wood cover edges: the builder leaves a 1px cover line at the outer
    # margins; thicken/warm it slightly so the soft wood board reads at this size
    # (a lit top sliver + a shaded inner edge), purely on the outer rims. ──
    cov, cov_hi, cov_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    lx0, ly0 = _page_to_final(0, 4)         # left cover top
    lx1, ly1 = _page_to_final(0, 26)        # left cover bottom
    rx0, _ = _page_to_final(44, 4)          # right cover top
    # left board: a 2px warm spine-board down the outer-left margin
    fill(d, lx0 - 1, ly0, 3, ly1 - ly0, cov)
    vline(d, lx0 - 1, ly0, ly1 - ly0, cov_hi)       # lit outer edge
    vline(d, lx0 + 1, ly0, ly1 - ly0, cov_sh)       # shaded inner edge
    # right board: mirror on the outer-right margin
    fill(d, rx0 - 1, ly0, 3, ly1 - ly0, cov)
    vline(d, rx0 + 1, ly0, ly1 - ly0, cov_hi)
    vline(d, rx0 - 1, ly0, ly1 - ly0, cov_sh)

    # ── GENERIC handwritten ink columns on both pages (the page's voice; the
    # readable Slot-4 KO is painted OVER this by the UI, §12.2) ──
    # left page interior in native book coords ≈ x:4..20, y:6..21
    lx, ly = _page_to_final(4, 7)
    _ink_column(d, lx, ly, 26, lines=7, step=4)
    # right page interior ≈ x:24..42, y:6..21 (page tilts down-out, so nudge in)
    rx, ry = _page_to_final(25, 8)
    _ink_column(d, rx, ry, 24, lines=6, step=4)

    # ── the persimmon cloth tie hanging from the spine (spec: "cloth tie visible")
    # start it 2px ABOVE the spine top so the band visibly drapes OVER the top of
    # the book and emerges down the gutter — anchored to the spine, not floating.
    tie_y = BOOK_DY + 2 * BOOK_SCALE - 2
    _cloth_tie(d, tie_y)

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-diary-page.png")
    C.preview(img, "preview_obj-diary-page.png", scale=3)
    # an 8× zoom of the spine/tie + left-page head, to eyeball the tie + ink
    crop = img.crop((50, 44, 98, 96)).resize((48 * 8, 52 * 8), Image.NEAREST)
    C.save_out(crop, "zoom_obj-diary-page_tie_8x.png")


if __name__ == "__main__":
    main()
