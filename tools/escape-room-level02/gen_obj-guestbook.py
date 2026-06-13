#!/usr/bin/env python3
"""obj-guestbook.png — close-up of the open 방명록 (다실, Cuarto 1).

Dossier §6 Cuarto 1 + §11. A 128×128 transparent close-up of the temple
guestbook, open on its low stand. The room tooltip is the whole job of this art:
`마지막 이름은 49일 전이에요.` — "the last name is from 49 days ago". So the
columns of signatures must read as a ledger that filled up over years and then
STOPPED: the most recent (last) signature is faded/desaturated ink, 49 days of
rain having washed it pale, while it waits for the player's name to become «la
primera entrada del después» (the outro's beat 3).

GUESTBOOK DESIGN = the room's book. `common.guestbook(signed=False)` is the
canonical 다실 prop (open book tenting from a center spine on a low wood stand,
hanji pages, ruled column of faded ink ticks, wood_dark spine). That builder is
authored at ROOM scale (~40px wide) with tiny diagonal page outlines and 1px
ink ticks, so a brute NEAREST upscale staircases the page edges and blows the
ink ticks into crude bars (the obj-second-cup lesson). So this close-up REDRAWS
the builder's exact design natively at close-up size — same ramps (hanji pages,
wood_dark stand+spine, ink names), same shape (two pages tenting from a center
spine on a low stand) — so every edge stays a clean 1px pixel-art line. A tiny
native `guestbook()` swatch is stamped bottom-left as the literal cross-reference
anchor (rule 2 — compose with the shared builder; QA can eyeball "same book").

Signatures = vertical columns of SUGGESTED brush-strokes, ILLEGIBLE at 1× (rule
L2-a: no readable Korean in scene OR baked into art; the readable KO is the UI's
job). Korean 방명록 are signed in vertical columns, newest at the right, so the
ledger fills right-to-left over the visits and the LAST (right-most) column is
the faded one. Older ink is warm/dark; the last signature is washed cool+pale
(a desaturating dither over its ink) — 49 days of rain on the page.

Run from repo root:  python tools/escape-room-level02/gen_obj-guestbook.py
Deterministic: no unseeded random.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

W = H = 128

# ── geometry of the enlarged open book (same design as common.guestbook) ──────
# The book tents up from a center spine and rests ON the low stand (the page
# bottoms touch the stand lip — no float). Authored natively so every page edge
# is a crisp 1px diagonal (no upscale staircase). The book is the hero, filling
# the upper ~2/3 of the frame; the stand is a thin band beneath it.
SPINE_X = 64                 # center spine x (the book opens symmetrically)
TOP_Y = 22                   # top edge of the pages at the spine peak
PAGE_HALF = 48               # half-width of the open spread (each page ~48 wide)
PAGE_H = 70                  # page height at the spine (bottoms reach the stand)
STAND_Y = TOP_Y + PAGE_H - 4  # stand top lip tucks just under the page bottoms


def _stand(d) -> None:
    """The low wooden stand the open book rests on (wood_dark, lit top lip).

    Mirrors common.guestbook's stand (a wood_dark slab with a lit top edge and
    a cool contact shadow), enlarged. Splayed short legs give it a 서궤 read.
    """
    sx, sw, sh = SPINE_X - 54, 108, 13
    sy = STAND_Y
    # cool contact shadow on the (implied) floor under the stand
    C.drop_shadow(d, sx + 4, sy + sh, sw - 8, 3, cool=True)
    # two short splayed legs (drawn first, behind the slab)
    for lx in (sx + 10, sx + sw - 18):
        fill(d, lx, sy + sh, 8, 9, PAL["wood_dark"][2])
        vline(d, lx, sy + sh, 9, PAL["wood_dark"][1])
        frame(d, lx, sy + sh, 8, 9, OUTLINE)
    # the slab top — a thin board with a lit front lip + shaded underside
    fill(d, sx, sy, sw, sh, PAL["wood_dark"][1])
    hline(d, sx, sy, sw, PAL["wood_light"][1])              # lit top lip
    dither(d, sx, sy + sh - 5, sw, 5, PAL["wood_dark"][3], phase=0)  # shaded face
    for gx in range(sx + 8, sx + sw - 6, 20):              # grain ticks
        hline(d, gx, sy + 3, 5, PAL["wood_dark"][2])
    hline(d, sx, sy + sh - 1, sw, OUTLINE)
    frame(d, sx, sy, sw, sh, OUTLINE)


def _page(d, left: bool) -> None:
    """One open page tenting from the center spine down to the stand.

    Faithful to common.guestbook's two tented polygons: the spine edge stands
    tallest, the outer edge dips lower (the open-book tent). The left page is the
    lit one (hanji[0]); the right page sits a touch in shade (hanji[1]) — exactly
    the builder's two-tone page split. All edges native 1px.
    """
    pg = PAL["hanji"][0] if left else PAL["hanji"][1]
    pg_sh = PAL["hanji"][1] if left else PAL["hanji"][2]
    sign = -1 if left else 1
    inner_x = SPINE_X
    outer_x = SPINE_X + sign * PAGE_HALF
    # tent corners: spine-top high, outer-top lower (the page leans down+out),
    # outer-bottom + spine-bottom rest near the stand.
    spine_top = (inner_x, TOP_Y)
    outer_top = (outer_x, TOP_Y + 9)
    outer_bot = (outer_x + sign * -2, TOP_Y + PAGE_H - 2)
    spine_bot = (inner_x, TOP_Y + PAGE_H)
    d.polygon([spine_top, outer_top, outer_bot, spine_bot], fill=pg,
              outline=OUTLINE)
    # a soft shaded band hugging the spine gutter (the page curves into the fold)
    for k in range(7):
        gx = inner_x + sign * (k + 1)
        y0 = TOP_Y + 1 + (k * 1)
        y1 = TOP_Y + PAGE_H - 1 - (k // 2)
        if 0 < y1 - y0:
            dither(d, min(gx, gx), y0, 1, y1 - y0, pg_sh, phase=k % 2)
    # the outer cover edge of the book peeking past the page (a warm board sliver)
    d.line([outer_top[0], outer_top[1], outer_bot[0], outer_bot[1]],
           fill=PAL["wood_dark"][2])
    d.line([outer_top[0] - sign, outer_top[1], outer_bot[0] - sign, outer_bot[1]],
           fill=PAL["wood_dark"][1])


def _spine(d) -> None:
    """The dark center spine + a thin shadow the tented pages cast into the fold."""
    fill(d, SPINE_X - 1, TOP_Y, 3, PAGE_H + 1, PAL["wood_dark"][2])
    vline(d, SPINE_X, TOP_Y, PAGE_H + 1, PAL["wood_dark"][3])
    vline(d, SPINE_X - 1, TOP_Y + 2, PAGE_H - 3, PAL["ink"][0])    # fold shadow
    # a small bound head/tail cap at the top + bottom of the spine
    for cy in (TOP_Y - 1, TOP_Y + PAGE_H - 1):
        fill(d, SPINE_X - 2, cy, 5, 2, PAL["wood_dark"][1])
        d.point((SPINE_X, cy), fill=PAL["wood_light"][2])


# A library of hand-drawn "syllable" glyph-blobs (~5×5), each a small cluster of
# strokes that SUGGESTS a written syllable without being any real character — the
# deniability rule L2-a (illegible at 1×). Each is a list of (dx,dy) ink points
# inside a 5×5 cell. Varied shapes so a column reads as different names, not a
# repeating stamp. Deterministic data, no random.
_SYLLABLES = (
    ((0, 0), (1, 0), (2, 0), (1, 1), (1, 2), (0, 3), (1, 3), (2, 3)),       # ㅎ-ish
    ((0, 0), (0, 1), (0, 2), (0, 3), (2, 0), (2, 3), (1, 0), (1, 3)),       # ㅁ-ish box
    ((0, 0), (1, 1), (2, 2), (3, 1), (1, 2), (1, 3)),                       # ㅅ+stroke
    ((0, 1), (1, 0), (2, 0), (3, 1), (1, 2), (2, 2), (1, 3)),               # ㅇ-ish
    ((0, 0), (1, 0), (2, 0), (1, 1), (1, 2), (1, 3), (0, 3), (2, 3)),       # ㅗ/ㅜ
    ((0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 0), (1, 3)),               # ㄴ+
    ((0, 0), (1, 0), (2, 0), (2, 1), (1, 1), (0, 2), (0, 3), (2, 3)),       # ㄹ-ish
    ((1, 0), (0, 1), (1, 1), (2, 1), (1, 2), (0, 3), (2, 3)),               # cross
)


def _column(d, cx: int, top: int, names: int, ink, faint, seed: int,
            fade: bool = False) -> None:
    """One VERTICAL signature column of illegible hand-written names.

    Korean 방명록 are signed top-to-bottom in vertical columns. Each "name" is a
    short stack of 2–3 different syllable-blobs from _SYLLABLES (varied shapes,
    organic spacing, a slight per-name lean) — so the column reads as DIFFERENT
    names in a real hand you cannot READ (rule L2-a), never a repeating stamp.
    Deterministic: shape + spacing chosen by fixed arithmetic on (seed, index).

    fade=True bleaches the strokes (the LAST signature, 49 days washed pale): the
    ink is laid in the faint ramp and then a cool rain dither washes the cell, so
    the name reads as present-but-rain-faded — distinctly lighter than the rest.
    """
    head_ink = faint if fade else ink
    body_ink = PAL["hanji"][2] if fade else faint
    y = top
    for n in range(names):
        # 2 or 3 syllables per name (alternating, fixed by seed+n — no random)
        syl_count = 2 + ((seed * 3 + n * 5) % 2)
        lean = ((seed + n) % 3) - 1          # -1, 0 or +1 per-name slant
        for s in range(syl_count):
            gi = (seed * 7 + n * 11 + s * 13) % len(_SYLLABLES)
            glyph = _SYLLABLES[gi]
            gx = cx - 2 + lean * (s - syl_count // 2)
            for (dx, dy) in glyph:
                px, py = gx + dx, y + dy
                d.point((px, py), fill=head_ink)
                # a faint dry-brush echo under-right so the stroke has body
                if (dx + dy) % 2 == 0:
                    d.point((px, py + 1), fill=body_ink)
            y += 6                            # next syllable down the column
        y += 4                                # a gap between names (the lift)
    if fade:
        # 49 days of rain on the page: a sparse cool wash over the faded name,
        # desaturating its ink (dither only — no alpha, no new hue). FEATHERED
        # row-by-row (a per-row width wobble) so the bleach reads as a soft damp
        # halo, NOT a pasted rectangle (L1 'dither outside shape' fix). Kept light
        # (one cool pass on alternating rows) so the ink STROKES still read pale —
        # a washed-out NAME, not a smudge that swallows it.
        feather = (2, 3, 3, 2, 3, 4, 3, 2, 3, 2, 1, 2, 3, 2)
        for ry in range(top - 1, y + 1):
            if (ry - top) % 2 != 0:                 # skip every other row → lighter
                continue
            hw = feather[(ry - top) % len(feather)]
            dither(d, cx - 2 - hw, ry, hw * 2 + 4, 1,
                   PAL["rain"][0], phase=ry % 2)


def _signatures(d) -> None:
    """Both pages filled with vertical signature columns, the LAST one faded.

    Older visits are warm/dark ink (ink[2] head, ink[0] body); the columns step
    right-to-left as the ledger filled over the years (newest at the right). The
    RIGHT page's right-most column is the LAST signature — a lone recent name,
    49 days ago, washed pale — and below it the page is BLANK, waiting for the
    player's name to become «la primera entrada del después» (outro beat 3).
    """
    # left page columns (older, full, warm dark ink) — x steps out toward the
    # outer (lower) edge; top steps down a little to follow the tented page.
    # (cx, top, names, seed, head_ink) — the two OUTERMOST (oldest) columns sit a
    # step lighter (ink[1]) than the recent ones (ink[2]): years dim them softly.
    # This is a gentle chronology cue and never competes with the LAST signature's
    # distinct cool BLEACH (that one is the only cool-washed name on the page).
    left_cols = [
        (SPINE_X - 11, TOP_Y + 8, 3, 0, PAL["ink"][2]),
        (SPINE_X - 23, TOP_Y + 11, 3, 1, PAL["ink"][2]),
        (SPINE_X - 35, TOP_Y + 15, 2, 2, PAL["ink"][1]),
        (SPINE_X - 45, TOP_Y + 20, 2, 3, PAL["ink"][1]),
    ]
    for (cx, top, names, seed, head) in left_cols:
        _column(d, cx, top, names, head, PAL["ink"][0], seed)

    # right page — recent visits. The columns nearer the spine are newer. The
    # filled warm columns (older-but-recent) sit toward the outer edge; the
    # newest, faded LAST signature is the lone short name closest to the spine,
    # high on the page, with empty page below it.
    right_cols = [
        (SPINE_X + 23, TOP_Y + 11, 3, 2),
        (SPINE_X + 35, TOP_Y + 15, 2, 1),
        (SPINE_X + 45, TOP_Y + 20, 2, 0),
    ]
    for (cx, top, names, seed) in right_cols:
        _column(d, cx, top, names, PAL["ink"][2], PAL["ink"][0], seed)
    # the LAST signature: a single faded name near the spine, blank page beneath.
    _column(d, SPINE_X + 11, TOP_Y + 8, 1, PAL["ink"][1], PAL["ink"][0], 5,
            fade=True)


def _ruling(d) -> None:
    """Faint ruled guide-lines dividing the columns (the 방명록's ruled columns).

    Pale hanji-shade verticals on each page, so the signatures read as sitting in
    RULED columns (the spec) rather than floating. Kept faint (hanji[2]/[3]) so
    the ink names stay the highest-contrast marks. Clipped inside each page.
    """
    rule = PAL["hanji"][2]
    rule_sh = PAL["hanji"][3]
    # left page rulings (between the four columns), each shrinking toward the
    # outer edge to follow the tented page.
    for i, rx in enumerate((SPINE_X - 18, SPINE_X - 29, SPINE_X - 39)):
        top = TOP_Y + 4 + i * 2
        bot = TOP_Y + PAGE_H - 4 - i
        vline(d, rx, top, bot - top, rule)
        vline(d, rx + 1, top, bot - top, rule_sh)
    # right page rulings
    for i, rx in enumerate((SPINE_X + 18, SPINE_X + 29, SPINE_X + 39)):
        top = TOP_Y + 5 + i * 2
        bot = TOP_Y + PAGE_H - 4 - i
        vline(d, rx, top, bot - top, rule)
        vline(d, rx - 1, top, bot - top, rule_sh)


def _aging(d) -> None:
    """A few damp-foxing flecks + a faint cool wash at the right page edge.

    The book has sat open in a rainy tea room for 49 days: scatter a handful of
    deterministic foxing specks (pale wood_dark/stone) and breathe a faint cool
    film along the right (newest) page's outer margin — the same damp that bled
    the last signature. Kept very sparse so the pages still read as warm hanji.
    """
    # deterministic foxing flecks (fixed coordinate table, no random) — kept in
    # the page margins / gutters so they never land on a signature.
    flecks = [(40, 44), (30, 70), (96, 46), (100, 74), (54, 88), (74, 90),
              (24, 56), (104, 60)]
    for (fx, fy) in flecks:
        d.point((fx, fy), fill=PAL["stone"][1])
        d.point((fx + 1, fy), fill=PAL["hanji"][3])
    # faint cool damp film low on the BLANK lower-right page (under the last
    # signature, where the player will sign) — a whisper of the same rain-damp
    # that bled the last name, not a stain over any ink.
    dither(d, SPINE_X + 8, TOP_Y + 42, 18, 22, PAL["rain"][0], phase=1)


def _reference_swatch(d) -> None:
    """Stamp the canonical common.guestbook() at native 1× in the lower-left.

    The literal cross-asset anchor (rule 2): this is the EXACT book the 다실
    renders, so the enlarged book above is provably the same design. Tiny, in the
    corner, reading as a faint reference token. signed=False to match the unsigned
    state of this close-up (the player has not yet signed — that is the outro).
    """
    C.guestbook(d, 4, 108, signed=False)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _stand(d)                 # the low wooden stand under the book
    _page(d, left=True)       # the two open pages tenting from the spine
    _page(d, left=False)
    _spine(d)                 # the dark center spine + fold shadow
    _ruling(d)                # faint ruled signature columns
    _signatures(d)            # vertical name columns; the LAST one faded
    _aging(d)                 # foxing flecks + a faint damp film (49 days open)
    _reference_swatch(d)      # the canonical builder book, 1×, as the anchor token

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-guestbook.png")
    C.preview(img, "preview_obj-guestbook.png", scale=3)
    # a 1× render (the close-up's true scale) to verify rule L2-a: the signatures
    # must be ILLEGIBLE as Korean at 1×, and the prop must still read as a book.
    C.save_out(img, "obj-guestbook_1x.png")
    # an 8× zoom of the right page's newest (faded) signature column so the
    # "49-days-faded last name" read can be eyeballed against the warm columns.
    crop = img.crop((SPINE_X + 4, TOP_Y, SPINE_X + 50, TOP_Y + 40))
    crop = crop.resize((crop.width * 6, crop.height * 6), Image.NEAREST)
    C.save_out(crop, "zoom_obj-guestbook_lastsig_6x.png")


if __name__ == "__main__":
    main()
