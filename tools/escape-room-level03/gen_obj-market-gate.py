#!/usr/bin/env python3
"""obj-market-gate.png — close-up of the 시장 입구 entrance arch (버스 정류장, Zona 4).

Dossier §6 Zona 4 (line 272) + §10 asset list (line 164): the close-up of «el arco
de entrada del mercado, rótulo de neón». The UI card carries the Korean
(`또 오세요.` — the market's welcome/farewell echo); per L3-a NO Korean is painted
into the art — the neon is SUGGESTED hangul strokes (glow, never a decipherable
glyph). The dossier permits this close-up to read as "neon suggested strokes, still
not font-legible at 1x": a lit pink sign that bleeds light, with no readable
structure.

GATE DESIGN = the room's arch. `common.market_gate()` is the canonical 시장 입구
(two stout wood_dark columns, a wood lintel beam, a SUGGESTED-hangul neon_sign
glowing pink under the lintel, a swag garland of warm gold_light bulbs). That
builder is authored at ROOM scale (~95×45), so a brute NEAREST upscale would
staircase the swag wire into a jagged ribbon and blow the tiny bulbs into blocks
(same lesson as obj-backpack / obj-hotteok). So this close-up reproduces the
builder's EXACT design — same ramps (wood_dark columns, gold_light bulbs, pink
neon), same parts (two columns, lintel, glow sign, bulb garland), same OUTLINE —
drawn NATIVELY at close-up size so every edge stays a clean 1px pixel-art line. It
is the same arch, enlarged the right way. A tiny native `market_gate()` swatch is
stamped bottom-left as the literal cross-reference anchor (rule 2 — compose with
the shared builder; QA eyeballs "same arch").

Light (L3-d): the warm key here is the bulb garland + the lintel bulbs (amber),
glowing against the cold neon sign and the night void. There is NO griddle in this
prop, so the garland IS the warmth; the pink neon sign is the cold accent. The
arch sits on transparent black so the UI frames it (close-up, NOT a room → no
hotspots, no hotspot_debug).

L3-a: the neon sign is glow-strokes, ILLEGIBLE — melted into a soft pink halo so
no syllable can be read at 1×. L3-b/L3-e: nothing hidden, 100% mundane — it is
just the market gate; NO "magic" glow, every light has a fixture/wire source.

Deterministic: bulb/glow scatter uses explicit random.Random(SEED); no unseeded
random; re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_obj-market-gate.py
"""

from __future__ import annotations

import random

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

W = H = 128
SEED = 29                       # the ONLY entropy source (bulb glint scatter)

# ── geometry of the enlarged arch (same design as common.market_gate, native) ──
CX = 64                         # frame centre x — the arch is centred horizontally
ARCH_L = 14                     # left outer edge of the arch span
ARCH_R = 114                    # right outer edge of the arch span
COL_W = 20                      # column width (stout, like the builder's col_w=12)
LINTEL_TOP = 18                 # top of the lintel beam
LINTEL_H = 22                   # lintel beam height
COL_TOP = LINTEL_TOP + LINTEL_H - 2   # columns start under the lintel
COL_BOT = 120                   # columns run to near the frame base (planted)
SIGN_X = ARCH_L + COL_W + 4     # neon sign box left
SIGN_W = (ARCH_R - COL_W - 4) - SIGN_X   # neon sign box width
SIGN_Y = LINTEL_TOP + 3         # neon sign box top
SIGN_H = LINTEL_H - 8           # neon sign box height


# ── the two stout wood columns of the arch ─────────────────────────────────────

def paint_columns(d) -> None:
    """The two stout wood_dark columns the arch stands on (mirrors market_gate's
    two columns: wood_dark body, a lit left edge, a dithered shaded right band,
    an OUTLINE). Drawn native-crisp at close-up scale, planted to the frame base
    so the arch reads as standing, not floating (L3-e)."""
    body, body_hi, body_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    for cx0 in (ARCH_L, ARCH_R - COL_W):
        # the contact shadow on the wet asphalt under each column (the gate stands
        # on the cold street edge -> SHADOW_COOL), kept under the silhouette
        C.drop_shadow(d, cx0 + 1, COL_BOT, COL_W - 2, 3, cool=True)
        fill(d, cx0, COL_TOP, COL_W, COL_BOT - COL_TOP, body)
        vline(d, cx0, COL_TOP, COL_BOT - COL_TOP, body_hi)        # lit left edge
        dither(d, cx0 + COL_W - 7, COL_TOP + 2, 7, COL_BOT - COL_TOP - 4,
               body_sh, phase=0)                                  # shaded right band
        # a couple of plank seams down the column so it reads as built timber
        for sy in range(COL_TOP + 14, COL_BOT - 8, 22):
            hline(d, cx0 + 2, sy, COL_W - 4, body_sh)
            hline(d, cx0 + 2, sy + 1, COL_W - 4, PAL["wood_dark"][1])
        frame(d, cx0, COL_TOP, COL_W, COL_BOT - COL_TOP, OUTLINE)
        # a small stone base block at each column foot (the gate's footing)
        bw = COL_W + 4
        fill(d, cx0 - 2, COL_BOT - 6, bw, 6, PAL["stone"][2])
        hline(d, cx0 - 2, COL_BOT - 6, bw, PAL["stone"][1])
        dither(d, cx0 - 2, COL_BOT - 3, bw, 3, PAL["stone"][3], phase=0)
        frame(d, cx0 - 2, COL_BOT - 6, bw, 6, OUTLINE)


# ── the lintel beam across the top ─────────────────────────────────────────────

def paint_lintel(d) -> None:
    """The wood lintel beam across the top of the arch (mirrors market_gate's
    lintel: a wood_dark[1] beam, a lit wood_light top edge, an OUTLINE). It
    overhangs the columns a touch on each side, and carries the neon sign."""
    beam, beam_hi = PAL["wood_dark"][1], PAL["wood_light"][2]
    lx0, lx1 = ARCH_L - 4, ARCH_R + 4
    fill(d, lx0, LINTEL_TOP, lx1 - lx0, LINTEL_H, beam)
    hline(d, lx0, LINTEL_TOP, lx1 - lx0, beam_hi)                 # lit top edge
    # a band of grain + a lower-edge shadow so the beam reads as solid timber
    dither(d, lx0 + 2, LINTEL_TOP + LINTEL_H - 7, lx1 - lx0 - 4, 5,
           PAL["wood_dark"][3], phase=0)
    hline(d, lx0, LINTEL_TOP + LINTEL_H - 1, lx1 - lx0, PAL["wood_dark"][3])
    frame(d, lx0, LINTEL_TOP, lx1 - lx0, LINTEL_H, OUTLINE)
    # the corbel brackets where the lintel meets each column (a built joint)
    for cx0 in (ARCH_L + 1, ARCH_R - COL_W + 1):
        d.polygon([(cx0, COL_TOP), (cx0 + 6, COL_TOP), (cx0, COL_TOP + 6)],
                  fill=PAL["wood_dark"][2], outline=OUTLINE)
        d.polygon([(cx0 + COL_W - 2, COL_TOP), (cx0 + COL_W - 8, COL_TOP),
                   (cx0 + COL_W - 2, COL_TOP + 6)],
                  fill=PAL["wood_dark"][2], outline=OUTLINE)


# ── the suggested-hangul neon sign (GLOW, illegible — L3-a) ─────────────────────

def paint_neon_sign(d) -> None:
    """The 시장 입구 neon sign: SUGGESTED hangul strokes melted into a soft pink
    GLOW (L3-a: glow sin glifo legible). Built by laying common.neon_sign's
    stroke clusters, then MELTING them with near-solid dither passes of the pink
    ramp so the box reads as a lit pink sign bleeding light, with no decipherable
    syllable at 1× (the exact treatment paint_gate uses in room-04). The result
    is the cold accent against the warm garland."""
    sx, sy, sw, sh = SIGN_X, SIGN_Y, SIGN_W, SIGN_H
    # a dark housing behind the sign (the unlit tube backing) so the glow has a
    # body to sit on, and the lintel does not show through the halo
    fill(d, sx - 2, sy - 1, sw + 4, sh + 2, PAL["asphalt"][3])
    frame(d, sx - 2, sy - 1, sw + 4, sh + 2, OUTLINE)
    # lay the canonical neon stroke clusters across the housing (a few of them so
    # the box reads "a row of neon strokes", never a glyph) — then melt them.
    C.neon_sign(d, sx, sy, sw // 2 - 2, sh, color="pink", lit=True)
    C.neon_sign(d, sx + sw // 2 + 2, sy, sw // 2 - 2, sh, color="pink", lit=True)
    # MELT pass: near-solid dither bands of the pink ramp over the WHOLE sign box
    # so the strokes bleed into one another — a lit pink glow, no readable
    # structure (L3-a). Two phases of a mid, then a brighter broken core.
    dither(d, sx - 1, sy, sw + 2, sh, PAL["neon_pink"][2], phase=0)
    dither(d, sx - 1, sy, sw + 2, sh, PAL["neon_pink"][2], phase=1)
    dither(d, sx + 1, sy + 1, sw - 2, sh - 2, PAL["neon_pink"][1], phase=0)  # core
    dither(d, sx + 1, sy + 1, sw - 2, sh - 2, PAL["neon_pink"][3], phase=1)  # broken
    # bright tube glints crossing the sign (so it reads as lit glass TUBES, not a
    # painted panel) — IRREGULAR curving strokes, never an even grid (an even grid
    # reads as a dot-matrix / characters). A deterministic wandering bright stroke
    # so the eye sees "glowing tube scribbles" with no readable structure (L3-a).
    rg = random.Random(SEED + 5)
    gy = sy + sh // 2
    for gx in range(sx + 2, sx + sw - 2):
        gy += rg.choice((-1, 0, 0, 1))                       # the tube wanders
        gy = max(sy + 2, min(sy + sh - 3, gy))
        if rg.random() > 0.42:                               # broken, dashed glass
            d.point((gx, gy), fill=PAL["neon_pink"][0])
            if rg.random() > 0.7:
                d.point((gx, gy - 1), fill=PAL["neon_pink"][1])  # a stroke riser
    # a few hot white tube nodes, off-grid, where the glass burns brightest
    for (gx, gy) in ((sx + 5, sy + 4), (sx + sw // 2 - 3, sy + sh - 4),
                     (sx + sw - 9, sy + 5)):
        d.point((gx, gy), fill=PAL["white"][0])
        d.point((gx, gy + 1), fill=PAL["neon_pink"][0])
    # a faint pink halo bleeding out past the housing into the beam (glow, not text)
    dither(d, sx - 4, sy - 3, sw + 8, sh + 6, PAL["neon_pink"][3], phase=1)


# ── the garland of warm bulbs (the WARM KEY, L3-d) ─────────────────────────────

def paint_garland(d) -> None:
    """The swag of warm gold_light bulbs strung under the lintel — the WARM KEY of
    this prop (L3-d). Mirrors market_gate's garland: a dipping wire from column to
    column, a warm bulb at each node, each catching a white glint. Native-crisp so
    the wire stays a clean 1px curve and the bulbs stay round, not blocks. Each
    bulb is a fixture on the wire (L3-e: no floating light)."""
    n = 9                                   # bulbs across the span (like the builder)
    span_l, span_r = ARCH_L + 6, ARCH_R - 6
    wire_y = LINTEL_TOP + LINTEL_H + 2      # the wire hangs just under the lintel
    sag_max = 12                            # how far the swag dips at the centre

    def node(i):
        gx = span_l + i * (span_r - span_l) // n
        # a parabolic sag, deepest at the centre node
        t = (i - n / 2) / (n / 2)
        gy = wire_y + int(sag_max * (1 - t * t))
        return gx, gy

    # the wire first (behind the bulbs): a smooth 1px dark catenary
    for i in range(n):
        x0, y0 = node(i)
        x1, y1 = node(i + 1)
        d.line([x0, y0, x1, y1], fill=PAL["ink"][2])
        d.line([x0, y0 + 1, x1, y1 + 1], fill=PAL["ink"][1])     # a touch of body
    # each warm bulb on the wire: a small amber glow + a gold body + a white glint
    r = random.Random(SEED)
    for i in range(n + 1):
        gx, gy = node(i)
        # a small amber glow halo (warm key) — glow by bands (rule 3), small
        C.glow(d, gx, gy + 4, 5,
               [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][2]])
        # the bulb body: a small teardrop bulb hanging off the wire
        d.ellipse([gx - 2, gy + 2, gx + 2, gy + 8], fill=PAL["gold_light"][0],
                  outline=PAL["ember"][2])
        vline(d, gx, gy, 2, PAL["ink"][2])                       # the bulb's stem
        d.point((gx, gy + 4), fill=PAL["white"][0])              # the filament glint
        # a faint warm reflection of a few bulbs catching on the columns/beam
        if r.random() > 0.4:
            d.point((gx, gy + 9), fill=PAL["ember"][1])


# ── the warm mouth glimpsed through the arch (the alley we are leaving) ─────────

def paint_mouth(d) -> None:
    """A dim warm market mouth between the columns, BEHIND the garland — the alley
    we are leaving (mirrors room-04's 'warm dim market mouth through the arch').
    Drawn before the garland/sign so they sit in front; kept dim + warm so the
    bright pink sign + amber garland are the foreground. NOTHING legible (L3-a)."""
    mx0, mx1 = ARCH_L + COL_W, ARCH_R - COL_W
    my0, my1 = COL_TOP + 8, COL_BOT - 6
    mw = mx1 - mx0
    # the dark warm interior between the columns
    fill(d, mx0, my0, mw, my1 - my0, PAL["asphalt"][2])
    dither(d, mx0, my0, mw, my1 - my0, PAL["wood_dark"][3], phase=0)
    # a warm floor glow deep in the mouth (a stall's amber bleeding up the alley)
    # so the far figures stand on lit ground, not in a void (depth + L3-e source):
    # dithered amber bands rising from the mouth floor, dimming upward.
    floor_y = my1 - 4
    bands = ((4, PAL["ember"][2]), (7, PAL["ember"][3]), (10, PAL["wood_dark"][3]))
    top_acc = floor_y
    for k, (band_h, c) in enumerate(bands):
        dither(d, mx0 + 2 + k * 2, top_acc - band_h, mw - 4 - k * 4, band_h, c,
               phase=k % 2)
        top_acc -= band_h
    fill(d, mx0 + 1, floor_y, mw - 2, my1 - floor_y, PAL["wood_dark"][3])  # lit floor
    hline(d, mx0 + 1, floor_y, mw - 2, PAL["ember"][3])
    # a faint far neon halo deep in the mouth, LOW (near the warm floor so it reads
    # as a far stall's sign glowing up the alley, not a speck floating in the dark)
    # — a small dithered glow blob, dim (L3-a: depth, never a legible sign).
    for (gx, gy, col) in ((mx0 + 13, floor_y - 16, "cyan"),
                          (mx1 - 15, floor_y - 22, "green")):
        dither(d, gx - 2, gy - 1, 5, 4, PAL["neon_" + col][3], phase=0)
        dither(d, gx - 1, gy, 3, 2, PAL["neon_" + col][2], phase=1)
    # two customer silhouettes RECEDING down the alley (a clear head + shoulders +
    # body, small, grounded on the lit floor) so they read as people walking away,
    # not as foreground blobs. The nearer one is a touch bigger/lower.
    for (sx, foot_y, bw, bh) in ((mx0 + 18, floor_y - 1, 7, 22),
                                 (mx0 + 34, floor_y - 4, 6, 18)):
        sil = PAL["asphalt"][3]
        head_r = bw // 2
        hx = sx + bw // 2
        top = foot_y - bh
        # the head (a small round)
        d.ellipse([hx - head_r, top, hx + head_r, top + 2 * head_r], fill=sil)
        # shoulders sloping into a body that tapers to the feet (a person, not a cone)
        sh_y = top + 2 * head_r
        d.polygon([(sx - 1, sh_y + 3), (sx + bw + 1, sh_y + 3),
                   (sx + bw - 1, foot_y), (sx + 1, foot_y)], fill=sil)
        fill(d, sx, sh_y + 1, bw, 3, sil)                    # shoulder line
        # the warm rim where the floor glow catches the back of the figure
        vline(d, sx + bw, sh_y + 3, foot_y - sh_y - 3, PAL["ember"][3])
        d.point((hx + head_r, top + head_r), fill=PAL["ember"][3])


# ── the reference swatch (the canonical builder arch, 1×, as the anchor) ───────

def paint_reference_swatch(d) -> None:
    """Stamp the canonical common.market_gate() at native 1× in the lower-left.

    The literal cross-asset anchor: this is the EXACT arch room-04-busstop renders,
    so the enlarged arch above is provably the same design (rule 2 — compose with
    the shared builder). Tiny, in the corner, reading as a faint reference token."""
    C.market_gate(d, 4, 92, w=44, h=24)


# ── compose ────────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H)              # transparent canvas (close-up)
    paint_mouth(d)                           # the dim warm market mouth (behind)
    paint_columns(d)                         # the two stout wood columns
    paint_lintel(d)                          # the lintel beam + corbels
    paint_neon_sign(d)                       # the suggested-hangul neon GLOW (L3-a)
    paint_garland(d)                         # the warm bulb garland (KEY, L3-d)
    paint_reference_swatch(d)                # the canonical builder arch, 1×, anchor
    return img


def main():
    img = build()
    C.save_asset(img, "objects", "obj-market-gate.png")
    C.preview(img, "preview_obj-market-gate.png", scale=3)
    # an 8x zoom of the neon sign so the "illegible glow, no glyph" read (L3-a)
    # can be eyeballed at the sign region.
    crop = img.crop((SIGN_X - 6, SIGN_Y - 4, SIGN_X + SIGN_W + 6, SIGN_Y + SIGN_H + 6))
    crop = crop.resize((crop.width * 6, crop.height * 6), C.Image.NEAREST)
    C.save_out(crop, "zoom_obj-market-gate_sign_6x.png")


if __name__ == "__main__":
    main()
