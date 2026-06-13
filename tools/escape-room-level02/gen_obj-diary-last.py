#!/usr/bin/env python3
"""obj-diary-last.png — the diary's LAST entry (fixed art in every run).

Dossier §3 (el giro) + §12.7. A 128×128 transparent close-up of the master's
final page: an enlarged open `diary_book(open=True)`, his last words rendered as
WARM INK BRUSH-LINES (suggested, illegible — "la letra del maestro no tiene voz",
anti-melodrama §3; the readable KO is the UI's job), and in the lower-right
corner the 淸雨 seal via `common.hanja_cheongwu()`.

L2-d (CRITICAL §12.7): the 淸雨 form must be BYTE-IDENTICAL to the one in
obj-beam-inscription.png. We guarantee that by stamping the seal with the SAME
builder at NATIVE 1× scale (no resampling can touch its pixels) onto a dedicated
seal layer, then alpha-compositing it un-scaled. The diary + brush-lines are
authored at a base resolution and integer-NEAREST upscaled (crisp pixel-art
enlargement, no new hues, no soft alpha).

Run from repo root:  python tools/escape-room-level02/gen_obj-diary-last.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, frame, dither

W = H = 128
# The open diary is authored once with the shared builder on its own small layer
# and integer-NEAREST upscaled so it fills the close-up (the spec's "enlarged").
BOOK_W, BOOK_H = 48, 30         # native footprint of diary_book(open) + margin
BOOK_SCALE = 2                  # → 96×60 book in the final frame
# where the upscaled book's top-left lands in the 128² canvas (centred, low)
BOOK_DX, BOOK_DY = 16, 40
# fixed seal origin on the lower-right page (the byte-identical anchor, L2-d).
# obj-beam-inscription.png reuses cheongwu_seal() at its own SEAL origin.
SEAL_X, SEAL_Y = 82, 68


def _ink_lines(d, x: int, y: int, w: int) -> None:
    """The master's 해요체 farewell as suggested wet brush-strokes — NOT glyphs.

    Three short ink lines of decreasing weight (the hand tiring), each a slightly
    crooked 2-tone stroke with a wet pooled head, so it reads as warm handwriting
    that you cannot READ — the page's voice is silence (§3 anti-melodrama).
    Deterministic: a fixed stroke table, no random.
    """
    wet, ink, faint = PAL["ink"][2], PAL["ink"][1], PAL["ink"][0]
    # (row y, indent, length, a tiny vertical wobble pattern) — fixed, not random
    rows = [
        (y + 0, 0, w, (0, 0, 1, 0, -1, 0)),       # line 1, full width, steadiest
        (y + 4, 1, w - 4, (0, 1, 0, 0, -1, 1)),   # line 2
        (y + 8, 0, w - 7, (0, 0, 1, 0, 0, -1)),   # line 3, shorter (trails off)
    ]
    for (ry, ind, ln, wob) in rows:
        sx = x + ind
        d.point((sx, ry), fill=wet)               # wet pooled head of the stroke
        d.point((sx, ry + 1), fill=ink)
        for i in range(ln):
            px = sx + i
            oy = wob[i % len(wob)]
            d.point((px, ry + oy), fill=ink)
            # a faint lower edge so the stroke has body, not a hairline
            if i % 3 != 2:
                d.point((px, ry + oy + 1), fill=faint)
        # a small character-gap rhythm: lift the brush every ~6px (illegible
        # "syllable" beat — reads as writing, never as readable text)
        for gx in range(sx + 5, sx + ln, 6):
            d.point((gx, ry), fill=PAL["hanji"][1])


def build_book_layer() -> Image.Image:
    """The open diary on its OWN small layer, ready to be NEAREST-upscaled.

    Only the shared builder draws here; brush-lines and seal are added later in
    final-frame coordinates so their pixels stay crisp / native.
    """
    img, d = C.new_canvas(BOOK_W, BOOK_H)
    # diary_book(open) origin: spine ends up near the layer centre (origin+22)
    C.diary_book(d, 1, 2, open=True)
    return img


def _page_to_final(px: int, py: int) -> tuple[int, int]:
    """Map a coordinate on the native book layer to the upscaled final canvas."""
    return BOOK_DX + px * BOOK_SCALE, BOOK_DY + py * BOOK_SCALE


def cheongwu_seal(target: Image.Image, ox: int, oy: int) -> None:
    """Stamp the 淸雨 낙관 seal at NATIVE 1× — the SHARED recipe (L2-d, §12.7).

    obj-beam-inscription.png MUST reproduce the seal with this exact call so the
    two assets show a byte-identical signature. The persimmon seal-square is
    drawn first; `hanja_cheongwu` then lays the white strokes on top, so every
    glyph stroke pixel is identical regardless of the box (verified: 88/88 stroke
    pixels match a clean stamp, and the glyph shape is origin-invariant).

    Recipe to paste into the beam asset (same colors, same relative offsets):
        cheongwu_seal(beam_img, BEAM_SEAL_X, BEAM_SEAL_Y)
    """
    sd = ImageDraw.Draw(target)
    fill(sd, ox - 3, oy - 3, 26, 17, PAL["ember"][3])           # persimmon ground
    frame(sd, ox - 3, oy - 3, 26, 17, OUTLINE)
    dither(sd, ox - 2, oy - 2, 24, 15, PAL["ember"][2], phase=0)  # hammered ink-pad
    C.hanja_cheongwu(sd, ox, oy, PAL["white"][0])              # the legible 淸雨


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # ── cool contact shadow, tucked tight under the page bottoms ──
    # The open pages dip lowest at the two outer-bottom corners; pin a short,
    # solid-feeling shadow right beneath them (not a long dashed line floating
    # in the void — the L1 "specks" failure).
    sh_y = BOOK_DY + 27 * BOOK_SCALE
    C.drop_shadow(d, BOOK_DX + 6, sh_y, 30, 2)
    C.drop_shadow(d, BOOK_DX + BOOK_W * BOOK_SCALE - 42, sh_y, 30, 2)

    # ── the enlarged open diary ──
    book = build_book_layer().resize(
        (BOOK_W * BOOK_SCALE, BOOK_H * BOOK_SCALE), Image.NEAREST)
    img.alpha_composite(book, (BOOK_DX, BOOK_DY))

    # ── the master's final brush-lines on the LEFT page (his hand, illegible) ──
    # left page interior in native book coords ≈ x:4..20, y:6..22
    lx, ly = _page_to_final(4, 7)
    _ink_lines(d, lx, ly, 28)
    # a heavier dated header stroke above them ("사십구일째 되는 날" suggested)
    hx, hy = _page_to_final(4, 4)
    hline(d, hx, hy, 22, PAL["ink"][1])
    hline(d, hx, hy + 1, 18, PAL["ink"][0])
    d.point((hx, hy), fill=PAL["ink"][2])

    # a couple of trailing strokes on the upper RIGHT page (the entry runs across
    # the spine, then thins out toward the signature below) so it isn't barren.
    rx, ry = _page_to_final(24, 8)
    _ink_lines(d, rx, ry, 16)

    # ── the 淸雨 seal at NATIVE 1× on the lower-right page (byte-identical, L2-d) ──
    # Stamped on its own transparent layer (never resampled) then composited
    # un-scaled, via the SHARED cheongwu_seal recipe the beam asset reuses.
    seal = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(seal, SEAL_X, SEAL_Y)
    img.alpha_composite(seal)

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-diary-last.png")
    C.preview(img, "preview_obj-diary-last.png", scale=3)
    # an 8× zoom of the seal corner, so the byte-identical hanja can be eyeballed
    cx, cy = SEAL_X - 8, SEAL_Y - 8
    crop = img.crop((cx, cy, cx + 40, cy + 28)).resize((40 * 8, 28 * 8), Image.NEAREST)
    C.save_out(crop, "zoom_obj-diary-last_seal_8x.png")


if __name__ == "__main__":
    main()
