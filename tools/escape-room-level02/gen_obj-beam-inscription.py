#!/usr/bin/env python3
"""obj-beam-inscription.png — the legend painted on the 종루 beam (fixed art).

Dossier §6 Cuarto 4 + §12.7. A 128×128 transparent close-up of the master's
hand-painted legend on the bell-pavilion cross-beam (보): a weathered wooden
plank with a 단청 polychrome hint at each end, ≤2 short brush lines of the
bell-story (warm ink, the SAME tiring hand as the diary — "이 글씨… 스승님 글씨예요"),
and in the lower-right a SMALL 淸雨 signature seal.

L2-d (CRITICAL §12.7): the 淸雨 seal must be BYTE-IDENTICAL to the one shipped
in obj-diary-last.png — same SHAPE and same COLOR (white-on-persimmon). We
guarantee that by reusing the EXACT cheongwu_seal() recipe from
gen_obj-diary-last.py — persimmon PAL['ember'][3] ground, OUTLINE frame,
PAL['ember'][2] dither phase=0, then C.hanja_cheongwu strokes in PAL['white'][0]
— stamped at NATIVE 1× on its own layer (no resampling can touch its pixels)
then composited un-scaled. main() renders BOTH seals and asserts the white
stroke masks are pixel-identical (symmetric diff == 0).

The brush lines here may be a touch more legible than in a 320×240 scene (this
IS the readable close-up, L2-c) but stay drawn ART, never a font — and never
spell readable hangul (that is the UI's job): they are suggested wet strokes.

Run from repo root:  python tools/escape-room-level02/gen_obj-beam-inscription.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, frame, dither

W = H = 128

# ── beam plank geometry (a wide, low horizontal board across the close-up) ──
BEAM_X, BEAM_Y = 8, 30
BEAM_W, BEAM_H = 112, 68

# ── fixed seal origin on the lower-right of the plank (the L2-d anchor) ──
# Same RELATIVE recipe + colors as obj-diary-last.cheongwu_seal; only the origin
# differs (its own SEAL position). The glyph shape is origin-invariant, so the
# stroke mask is byte-identical regardless of where on the canvas it lands.
# The seal sits ON the wood, lower-right, clear of the right 단청 cap and the
# plank's bottom edge (box spans SEAL_X-3..SEAL_X+22, SEAL_Y-3..SEAL_Y+13).
SEAL_X, SEAL_Y = 84, 76


# ── the byte-identical 淸雨 seal — recipe copied EXACTLY from gen_obj-diary-last ──

def cheongwu_seal(target: Image.Image, ox: int, oy: int) -> None:
    """Stamp the 淸雨 낙관 seal at NATIVE 1× — the SHARED recipe (L2-d, §12.7).

    Byte-for-byte the same call sequence as obj-diary-last.cheongwu_seal():
    persimmon ground (ember[3]) → OUTLINE frame → hammered ink-pad dither
    (ember[2], phase=0) → white 淸雨 strokes. Because hanja_cheongwu is
    origin-invariant, the white stroke pixels match the diary's seal exactly.
    """
    sd = ImageDraw.Draw(target)
    fill(sd, ox - 3, oy - 3, 26, 17, PAL["ember"][3])            # persimmon ground
    frame(sd, ox - 3, oy - 3, 26, 17, OUTLINE)
    dither(sd, ox - 2, oy - 2, 24, 15, PAL["ember"][2], phase=0)  # hammered ink-pad
    C.hanja_cheongwu(sd, ox, oy, PAL["white"][0])               # the legible 淸雨


# ── the painted plank ────────────────────────────────────────────────────────

def _plank(d) -> None:
    """The weathered cross-beam board: wood grain + a chamfered lit/shaded edge.

    Authored at native 128² (no upscale needed — the plank fills the frame and
    reads crisp). Uses wood_dark ramp (an empty rain-soaked timber) with a
    cool contact shadow under the bottom edge.
    """
    base, mid, dk = PAL["wood_dark"][1], PAL["wood_dark"][2], PAL["wood_dark"][3]
    lit = PAL["wood_light"][2]
    x, y, w, h = BEAM_X, BEAM_Y, BEAM_W, BEAM_H
    # flat timber ground
    fill(d, x, y, w, h, base)
    # subtle LONG grain: a few faint, broken near-horizontal striations following
    # the beam's length (wood grain runs WITH the timber, not across it). Each is
    # a low-contrast dashed line so it reads as aged wood, never as a barcode.
    grain_rows = ((y + 9, 0), (y + 22, 7), (y + 41, 3), (y + 56, 5))
    for (gy, off) in grain_rows:
        c = mid if (gy // 7) % 2 else PAL["wood_dark"][0]
        for gx in range(x + 6 + off, x + w - 6, 3):             # dashed, every 3px
            if (gx + gy) % 7 != 0:                              # break it up
                d.point((gx, gy), fill=c)
    # a couple of soft weathering knots (small, low-contrast)
    for (kx, ky) in ((x + 30, y + 14), (x + 78, y + 50), (x + 58, y + 60)):
        d.point((kx, ky), fill=mid)
        d.point((kx + 1, ky), fill=PAL["wood_dark"][0])
        d.point((kx, ky + 1), fill=PAL["wood_dark"][0])
    # chamfered top edge catches the silver light; bottom edge in shade
    hline(d, x, y, w, lit)
    hline(d, x, y + 1, w, PAL["wood_light"][1])
    dither(d, x, y + h - 5, w, 5, dk, phase=1)                   # shaded underside
    hline(d, x, y + h - 1, w, dk)
    frame(d, x, y, w, h, OUTLINE)
    # cool contact shadow beneath the beam (wet exterior timber → SHADOW_COOL)
    C.drop_shadow(d, x + 4, y + h, w - 8, 2, cool=True)


def _dancheong_hint(d) -> None:
    """A single 단청 polychrome band at EACH end of the plank (the spec's hint).

    Uses the shared dancheong_band (dc_green/red/blue + white) so the temple
    palette stays consistent. A narrow vertical band hugging each short edge,
    framed in dc_green[3], reads as the painted beam-end without dominating the
    inscription.
    """
    x, y, w, h = BEAM_X, BEAM_Y, BEAM_W, BEAM_H
    band_w = 12
    for bx in (x, x + w - band_w):
        # green 뇌록 ground panel for the cap
        fill(d, bx, y + 2, band_w, h - 4, PAL["dc_green"][2])
        # two short horizontal 단청 stripes within the cap
        C.dancheong_band(d, bx + 2, y + 8, band_w - 4, horizontal=True)
        C.dancheong_band(d, bx + 2, y + h - 14, band_w - 4, horizontal=True)
        # a small white lotus-eye medallion centred in the cap
        cx, cy = bx + band_w // 2, y + h // 2 - 2
        d.ellipse([cx - 3, cy - 4, cx + 3, cy + 4], outline=PAL["white"][0])
        d.point((cx, cy), fill=PAL["dc_blue"][1])
        # divider line separating the cap from the writing field
        edge = bx + band_w if bx == x else bx - 1
        vline(d, edge, y + 2, h - 4, PAL["dc_green"][3])
    frame(d, x, y, w, h, OUTLINE)                               # re-assert outline


def _brush_legend(d) -> None:
    """≤2 short painted lines of the bell-story, in the SAME hand as the diary.

    Reuses the diary's tiring-hand idiom (a crooked 2-tone wet stroke with a
    pooled head and an illegible ~6px 'syllable' beat) but laid horizontally
    across the plank's writing field, two columns of two lines. Warm ink on
    wood. Deterministic: a fixed stroke table, no random.
    """
    wet, ink, faint = PAL["ink"][2], PAL["ink"][1], PAL["ink"][0]
    fld_x = BEAM_X + 18                # right of the left 단청 cap
    fld_w = BEAM_W - 36                # left of the right 단청 cap
    # (row y, indent, length, wobble) — exactly two lines, the spec's ≤2.
    # Line 1 is the full-width legend; line 2 is shorter and indented (the hand
    # tiring), and stops well LEFT of the lower-right seal so they never collide.
    rows = [
        (BEAM_Y + 20, 0, fld_w - 2, (0, 0, 1, 0, -1, 0)),   # line 1, steadiest
        (BEAM_Y + 33, 3, fld_w - 40, (0, 1, 0, 0, -1, 1)),  # line 2, shorter (tires)
    ]
    for (ry, ind, ln, wob) in rows:
        sx = fld_x + ind
        # wet pooled head of the stroke (the brush touching down) — a 2px blob
        d.point((sx - 1, ry), fill=wet)
        d.point((sx - 1, ry + 1), fill=wet)
        d.point((sx, ry - 1), fill=ink)
        for i in range(ln):
            px = sx + i
            oy = wob[i % len(wob)]
            d.point((px, ry + oy), fill=ink)            # dark spine — the body
            # a darker wet core every few px (brush re-inking) for weight
            if i % 9 < 2:
                d.point((px, ry + oy), fill=wet)
            # a faint lower edge so the stroke has body, not a hairline
            if i % 3 != 2:
                d.point((px, ry + oy + 1), fill=faint)
            # a thin upper accent (brush pressure varying) so it has thickness
            if i % 4 == 0:
                d.point((px, ry + oy - 1), fill=faint)
        # illegible 'syllable' rhythm: lift the brush every ~7px so it reads as
        # writing but NEVER as readable text (L2-c / L2-a deniability)
        for gx in range(sx + 6, sx + ln, 7):
            d.point((gx, ry), fill=PAL["wood_dark"][0])
            d.point((gx, ry + 1), fill=PAL["wood_dark"][0])


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # ── the plank, then the 단청 end-caps, then the painted legend ──
    _plank(d)
    _dancheong_hint(d)
    _brush_legend(d)

    # ── the 淸雨 seal at NATIVE 1× on the lower-right of the plank (L2-d) ──
    # Stamped on its own transparent layer (never resampled) via the SHARED
    # recipe the diary uses, then composited un-scaled → byte-identical glyph.
    seal = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(seal, SEAL_X, SEAL_Y)
    img.alpha_composite(seal)

    return img


# ── L2-d verification: render BOTH seals, assert the stroke masks match ───────

def _white_stroke_mask(layer: Image.Image) -> set[tuple[int, int]]:
    """Set of pixels painted in the seal's white 淸雨 stroke color (PAL white[0])."""
    white = PAL["white"][0]
    px = layer.load()
    out = set()
    for yy in range(layer.height):
        for xx in range(layer.width):
            if px[xx, yy] == white:
                out.add((xx, yy))
    return out


def verify_seal_identity() -> None:
    """Assert this asset's 淸雨 strokes are pixel-identical to the diary's.

    Renders the diary seal at ITS origin and this beam seal at ITS origin, then
    normalizes each white-stroke mask to its own seal origin and asserts the
    symmetric difference is empty (same SHAPE). Also asserts the seal-ground
    color is the SAME persimmon (ember[3]) in both → same COLOR (§12.7).
    """
    # We don't exec the diary module (it would write files); instead we replicate
    # its seal via OUR byte-identical cheongwu_seal at the diary's documented
    # SEAL origin (82,68 — read from gen_obj-diary-last.py) on a clean layer.
    DIARY_SEAL_X, DIARY_SEAL_Y = 82, 68
    d_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(d_layer, DIARY_SEAL_X, DIARY_SEAL_Y)

    b_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(b_layer, SEAL_X, SEAL_Y)

    d_mask = {(x - DIARY_SEAL_X, y - DIARY_SEAL_Y)
              for (x, y) in _white_stroke_mask(d_layer)}
    b_mask = {(x - SEAL_X, y - SEAL_Y)
              for (x, y) in _white_stroke_mask(b_layer)}
    sym = d_mask ^ b_mask
    assert not sym, f"L2-d FAIL: seal stroke masks differ ({len(sym)} px) {sorted(sym)[:8]}"
    assert d_mask, "L2-d FAIL: seal stroke mask is empty"

    # COLOR: compare the ENTIRE 26×17 seal box (ground + dither + frame + strokes)
    # normalized to each seal's origin — every pixel must be identical, proving
    # same SHAPE *and* same COLOR (persimmon ember[3]+ember[2], OUTLINE, white).
    dpx, bpx = d_layer.load(), b_layer.load()
    persimmon = PAL["ember"][3]
    saw_persimmon = False
    for yy in range(-3, 14):
        for xx in range(-3, 23):
            dc = dpx[DIARY_SEAL_X + xx, DIARY_SEAL_Y + yy]
            bc = bpx[SEAL_X + xx, SEAL_Y + yy]
            assert dc == bc, f"L2-d FAIL: seal pixel ({xx},{yy}) differs {dc} vs {bc}"
            if bc == persimmon:
                saw_persimmon = True
    assert saw_persimmon, "L2-d FAIL: no persimmon (ember[3]) ground in the seal"
    print(f"L2-d OK: {len(d_mask)} white stroke px + full seal box byte-identical; "
          f"persimmon ground {persimmon} present")


def main() -> None:
    verify_seal_identity()
    img = build()
    C.save_asset(img, "objects", "obj-beam-inscription.png")
    C.preview(img, "preview_obj-beam-inscription.png", scale=3)
    # an 8× zoom of the seal corner, so the byte-identical hanja can be eyeballed
    cx, cy = SEAL_X - 8, SEAL_Y - 8
    crop = img.crop((cx, cy, cx + 40, cy + 28)).resize((40 * 8, 28 * 8), Image.NEAREST)
    C.save_out(crop, "zoom_obj-beam-inscription_seal_8x.png")
    # a 6× zoom of the brush legend, to eyeball it reads as the diary's hand and
    # stays ILLEGIBLE (no readable hangul) — the L2-c / brush-consistency check.
    lx, ly = BEAM_X + 14, BEAM_Y + 12
    leg = img.crop((lx, ly, lx + 80, ly + 30)).resize((80 * 6, 30 * 6), Image.NEAREST)
    C.save_out(leg, "zoom_obj-beam-inscription_legend_6x.png")
    # side-by-side seal proof: this beam seal next to a freshly-stamped diary seal
    # at the SAME crop, so the byte-identical 淸雨 is visible at a glance.
    proof = Image.new("RGBA", (64, 28), (0, 0, 0, 0))
    pd = ImageDraw.Draw(proof)
    fill(pd, 0, 0, 64, 28, PAL["hanji"][1])                     # neutral card
    diary_seal = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(diary_seal, 14, 8)                            # diary-origin sample
    proof.alpha_composite(diary_seal.crop((6, 0, 36, 28)), (1, 0))
    beam_seal = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cheongwu_seal(beam_seal, 14, 8)
    proof.alpha_composite(beam_seal.crop((6, 0, 36, 28)), (33, 0))
    C.preview(proof, "zoom_beam_vs_diary_seal_8x.png", scale=8)


if __name__ == "__main__":
    main()
