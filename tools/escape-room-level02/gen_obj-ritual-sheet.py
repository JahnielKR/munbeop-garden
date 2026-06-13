#!/usr/bin/env python3
"""obj-ritual-sheet.png — the 49재 instruction sheet close-up (Slot 2, 대웅전).

Dossier §8.2 + §11 + §12.2. A 128×128 transparent close-up of the hanji sheet the
master left written for his OWN 49재: ~10 ritual steps as rows, each a circled
number ①..⑩ followed by a line of WET INK BRUSH-MARKS.

CRITICAL deniability (regla L2-a + §12.2): the sheet is GENERIC — it serves all 5
Slot-2 candidates. So the *words* are illegible suggested brush-strokes (lines of
`ink`, never glyphs), and NO erased word / moisture gap is baked here: the UI
paints the legible KO and the "rain-erased" blot on top, at the position the drawn
candidate needs. The circled numbers ①..⑩ ARE drawn (universal numerals, not
Korean text — they order the liturgy so the 전에/후에 deduction is possible) but
kept small. Every row is uniformly inked; the sheet must NOT hint where the gap is.

Physical read (the warmth/care of the master's hand): a single sheet of warm
hanji, slightly curled at the free corners, ONE bottom corner pinned flat by a
small river stone (cool contact shadow under the stone — it is the one cold object
on a warm page). No frame, transparent bg.

Run from repo root:  python tools/escape-room-level02/gen_obj-ritual-sheet.py
Deterministic: no unseeded random (a fixed stroke table drives every brush-mark).
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, dither

W = H = 128

# ── sheet geometry (a tall portrait page, generous warm margins) ──────────────
SHEET_X, SHEET_Y = 16, 6
SHEET_W, SHEET_H = 96, 116
ROWS = 10                       # ①..⑩
ROW_TOP = SHEET_Y + 12          # centre y of the first row
ROW_STEP = 10                   # vertical pitch — rings (Ø9) keep a ~1px gap
NUM_X = SHEET_X + 10            # x of the circled-number column
TEXT_X = SHEET_X + 24           # x where the brush-mark line begins
TEXT_R = SHEET_X + SHEET_W - 8  # right limit of the brush line

# the river stone pins the LOWER-RIGHT corner flat (so that corner does NOT curl).
# That corner is clear of the numbered column on the left; the stone rests below
# the end of the last brush line so it never bisects any row.
STONE_W, STONE_H = 26, 16
# overlap the actual corner tip so the stone visibly HOLDS the corner down: its
# right/bottom edge sits just past the sheet's bottom-right corner.
STONE_X = SHEET_X + SHEET_W - STONE_W + 2
STONE_Y = SHEET_Y + SHEET_H - STONE_H + 3


# ── the seven-segment-ish tiny numeral set (1..10), 3px wide, illegible-proof ──
# Drawn as art inside the ink ring; readable as a numeral but far too small to be
# mistaken for Korean. Each entry is a list of (dx,dy) lit pixels in a 3×5 cell.
_DIGIT = {
    "1": [(1, 0), (1, 1), (1, 2), (1, 3), (1, 4), (0, 4), (2, 4)],
    "2": [(0, 0), (1, 0), (2, 1), (1, 2), (0, 3), (0, 4), (1, 4), (2, 4)],
    "3": [(0, 0), (1, 0), (2, 1), (1, 2), (2, 3), (1, 4), (0, 4)],
    "4": [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 0), (2, 1), (2, 3), (2, 4)],
    "5": [(0, 0), (1, 0), (2, 0), (0, 1), (0, 2), (1, 2), (2, 3), (1, 4), (0, 4)],
    "6": [(1, 0), (0, 1), (0, 2), (1, 2), (2, 2), (0, 3), (2, 3), (1, 4)],
    "7": [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2), (1, 3), (1, 4)],
    "8": [(1, 0), (0, 1), (2, 1), (1, 2), (0, 3), (2, 3), (1, 4)],
    "9": [(1, 0), (0, 1), (2, 1), (1, 2), (2, 2), (2, 3), (1, 4)],
    "0": [(1, 0), (0, 1), (2, 1), (0, 2), (2, 2), (0, 3), (2, 3), (1, 4)],
}


def _hanji_sheet(d) -> None:
    """The warm hanji page: base fill, fiber flecks, soft inner tone, curled corners.

    Composes the look of `common.hanji_wall` (warm base + sparse fiber flecks) but
    drawn as a free sheet (own outline, curled free corners), not a wall panel.
    Two free corners (top-right, bottom-left-above-the-stone region uses the stone
    instead) lift with a lit roll + a shaded underside so the paper reads as a thin
    physical sheet, not a flat card.
    """
    base, warm, edge, deep = PAL["hanji"][0], PAL["hanji"][1], PAL["hanji"][2], PAL["hanji"][3]

    # cool contact shadow under the whole sheet — a solid 1px band flush to the
    # bottom edge (not a detached dashed line floating in the void, the L1
    # "specks" failure). One darker pixel-row sells "paper on a darker surface".
    hline(d, SHEET_X + 5, SHEET_Y + SHEET_H, SHEET_W - 10, C.SHADOW_COOL[:3] + (255,))
    dither(d, SHEET_X + 5, SHEET_Y + SHEET_H + 1, SHEET_W - 10, 1,
           C.SHADOW_COOL[:3] + (255,), phase=1)

    # base page
    fill(d, SHEET_X, SHEET_Y, SHEET_W, SHEET_H, base)
    # a whisper of a vertical fold-memory crease (1px, sparse) — present but never
    # competing with the ink rows for attention.
    for yy in range(SHEET_Y + 5, SHEET_Y + SHEET_H - 5, 2):
        d.point((SHEET_X + SHEET_W // 2, yy), fill=warm)
    # sparse hanji fibre flecks (the hanji_wall texture), deterministic walk
    i = 0
    for yy in range(SHEET_Y + 3, SHEET_Y + SHEET_H - 3, 4):
        for xx in range(SHEET_X + 3 + (yy * 3) % 9, SHEET_X + SHEET_W - 3, 9):
            d.point((xx, yy), fill=warm if i % 3 else edge)
            i += 1
    # warm edge band hugging the inside of the outline (deckle-edge softness)
    hline(d, SHEET_X + 1, SHEET_Y + 1, SHEET_W - 2, warm)
    hline(d, SHEET_X + 1, SHEET_Y + SHEET_H - 2, SHEET_W - 2, edge)
    vline(d, SHEET_X + 1, SHEET_Y + 1, SHEET_H - 2, warm)
    vline(d, SHEET_X + SHEET_W - 2, SHEET_Y + 1, SHEET_H - 2, edge)

    # the sheet outline (warm OUTLINE, never #000)
    C.frame(d, SHEET_X, SHEET_Y, SHEET_W, SHEET_H, OUTLINE)

    # ── curled TOP-RIGHT corner: the most lifted roll (the free top corner) ──
    _curl_corner(d, SHEET_X + SHEET_W - 1, SHEET_Y, sgn_x=-1, sgn_y=+1,
                 base=base, warm=warm, edge=edge, deep=deep)
    # ── curled BOTTOM-LEFT corner: a gentle lift (free; the right is pinned) ──
    _curl_corner(d, SHEET_X, SHEET_Y + SHEET_H - 1, sgn_x=+1, sgn_y=-1,
                 base=base, warm=warm, edge=edge, deep=deep, small=True)
    # NOTE: the bottom-RIGHT corner is intentionally NOT curled — the stone pins
    # it flat (drawn later in _stone). The top-left stays a clean square corner so
    # the lifted corners read as deliberate, not as a uniformly wavy card.


def _curl_corner(d, cx: int, cy: int, sgn_x: int, sgn_y: int,
                 base, warm, edge, deep, small: bool = False) -> None:
    """One lifted paper corner: a lit roll over a shaded underside wedge.

    (cx,cy) = the actual sheet corner. The roll lifts inward (sgn_x,sgn_y point
    toward the sheet interior). A short dark wedge under the roll reads as the gap
    the lifted paper casts; the roll's top edge catches the light (hanji[0]).
    """
    n = 6 if small else 9
    # shaded underside wedge first (the air gap below the lifted corner)
    for k in range(n):
        ux = cx + sgn_x * k
        uy = cy + sgn_y * (n - k)
        vline(d, ux, min(uy, uy + sgn_y * 0), 1, edge)
        d.point((ux, uy), fill=deep)              # deepest right at the fold line
    # the lit roll: a bright bead along the lifted edge
    for k in range(n):
        rx = cx + sgn_x * k
        ry = cy + sgn_y * (n - 1 - k)
        d.point((rx, ry), fill=base)
        # a thin warm body just inside the bright bead
        d.point((rx, ry + sgn_y), fill=warm)
    # the bright tip of the curl
    d.point((cx, cy), fill=PAL["hanji"][0])
    d.point((cx + sgn_x, cy + sgn_y), fill=warm)


def _circled_number(d, cx: int, cy: int, label: str) -> None:
    """A small ink ring (①-style) with a 3px numeral inside. Universal numeral art.

    cx,cy = centre of the ring. A clean Ø9 ink ring (one warm-ink tone) with the
    numeral floated inside in a slightly lighter ink so the ring frames the digit
    instead of fighting it. Tiny (3×5 digit) so the column orders the steps without
    ever reading as Korean — these are numerals, the only baked legible marks.
    """
    ink, ink2 = PAL["ink"][2], PAL["ink"][1]
    # the brush ring: a clean outlined circle (Ø9), one thicker lower bead for a
    # hand-inked feel without muddying the interior.
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], outline=ink)
    d.point((cx - 3, cy + 3), fill=ink2)         # a single brush bead, lower-left
    d.point((cx, cy + 4), fill=ink2)
    # the numeral, centred (two narrow glyphs for "10")
    if len(label) == 1:
        _digit(d, cx - 1, cy - 2, label, ink)
    else:                                        # "10": two narrow digits
        _digit(d, cx - 3, cy - 2, label[0], ink)
        _digit(d, cx + 1, cy - 2, label[1], ink)


def _digit(d, x: int, y: int, ch: str, c) -> None:
    """Stamp one tiny numeral from the _DIGIT table at top-left (x,y)."""
    for (dx, dy) in _DIGIT[ch]:
        d.point((x + dx, y + dy), fill=c)


def _brush_line(d, x: int, y: int, w: int, row: int) -> None:
    """One illegible ritual-step line: wet ink brush-marks in 'syllable' clusters.

    The line is broken into 2–3 short word-blocks (each a crooked 2-tone stroke
    with a wet pooled head), separated by clear gaps, so it reads as a written
    Korean phrase WITHOUT being any actual glyph (regla L2-a). A fixed per-row
    table varies the block widths/indent so the ten rows look hand-written, not
    stamped — and so NO single row stands out as "the gap" (the UI owns the gap).
    Deterministic: indices into fixed tables, no random.
    """
    wet, ink, faint = PAL["ink"][2], PAL["ink"][1], PAL["ink"][0]
    # fixed per-row rhythm: (indent, [block widths]) — varied but uniform-weight.
    rhythms = [
        (0, [13, 9, 16]),
        (2, [16, 11, 12]),
        (0, [11, 18, 8]),
        (1, [14, 10, 15]),
        (0, [18, 9, 13]),
        (2, [12, 16, 10]),
        (0, [15, 12, 14]),
        (1, [10, 17, 11]),
        (0, [16, 10, 16]),
        (1, [13, 14, 12]),
    ]
    # a CALM brush baseline: mostly flat with a single soft dip per word-block, so
    # the line reads as serene handwriting (Mushishi-calm), not sawtooth zigzag.
    wob = (0, 0, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0)
    indent, blocks = rhythms[row % len(rhythms)]
    sx = x + indent
    for bi, bw in enumerate(blocks):
        # clamp the block to the available width
        if sx >= x + w:
            break
        bw = min(bw, x + w - sx)
        if bw <= 1:
            break
        # wet pooled head of the word-block
        d.point((sx, y), fill=wet)
        d.point((sx, y + 1), fill=ink)
        for i in range(bw):
            px = sx + i
            oy = wob[(i + bi * 4 + row) % len(wob)]
            d.point((px, y + oy), fill=ink)
            # a faint lower body so the stroke has weight, not a hairline
            if i % 4 != 3:
                d.point((px, y + oy + 1), fill=faint)
        # a darker wet tail closing the block
        d.point((sx + bw - 1, y), fill=wet)
        sx += bw + 4                            # clear inter-word gap


def _stone(d) -> None:
    """A small river stone pinning the lower-left corner of the sheet flat.

    The one COLD object on the warm page → a cool contact shadow under it (L2 rule
    4: stone/exterior gets SHADOW_COOL). A rounded grey pebble with a lit top and a
    shaded lower-right belly, sitting ON the paper corner (so that corner is flat,
    not curled — the stone is why).
    """
    body, hi, mid, dk = PAL["stone"][1], PAL["stone"][0], PAL["stone"][2], PAL["stone"][3]
    sw, sh = STONE_W, STONE_H
    x, y = STONE_X, STONE_Y
    # cool contact shadow hugging the stone's base TIGHT on the paper (one short
    # band right under the belly — never a long detached dashed line).
    C.drop_shadow(d, x + 3, y + sh - 1, sw - 6, 2, cool=True)
    # the pebble body: a low rounded ellipse
    d.ellipse([x, y, x + sw, y + sh], fill=body, outline=OUTLINE)
    # lit top-left cap (the light comes from upper-left, as on the page)
    d.ellipse([x + 2, y + 1, x + sw - 7, y + sh // 2 + 1], outline=hi)
    hline(d, x + 5, y + 2, sw - 13, hi)
    # shaded lower-right belly — fine dither kept strictly inside the ellipse so it
    # never bleeds onto the paper (L1 "dither outside shape" failure).
    for yy in range(y + 4, y + sh - 2):
        ry = (yy - (y + sh / 2)) / (sh / 2)
        half = int((sw / 2) * (1 - ry * ry) ** 0.5) - 2
        for xx in range(x + sw // 2 + 1, x + sw // 2 + half):
            if (xx + yy) % 2 == 0:
                d.point((xx, yy), fill=mid)
    d.point((x + sw - 5, y + sh - 4), fill=dk)
    # a couple of mineral speckles for stone grain
    d.point((x + 7, y + 9), fill=dk)
    d.point((x + 14, y + 5), fill=hi)
    d.point((x + 10, y + 11), fill=mid)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _hanji_sheet(d)

    # the ten ritual rows: circled number (centre at ry) + illegible brush line.
    # The last rows' brush lines are shortened to clear the stone's left edge so
    # the stone rests on blank paper, pinning the corner (never bisecting ink).
    for r in range(ROWS):
        ry = ROW_TOP + r * ROW_STEP
        label = str(r + 1) if r < 9 else "10"
        _circled_number(d, NUM_X, ry, label)
        right = TEXT_R
        if ry + 4 >= STONE_Y - 1:               # row would run into the stone
            right = min(right, STONE_X - 3)
        _brush_line(d, TEXT_X, ry, right - TEXT_X, r)

    # the stone goes LAST so it sits on top of the paper corner (pins it flat)
    _stone(d)

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-ritual-sheet.png")
    C.preview(img, "preview_obj-ritual-sheet.png", scale=3)
    # an 8× zoom of the top rows so the circled numerals + illegibility can be
    # eyeballed against L2-a (must read as writing, never as Korean).
    crop = img.crop((SHEET_X, SHEET_Y, SHEET_X + SHEET_W, ROW_TOP + 3 * ROW_STEP))
    crop = crop.resize((crop.width * 6, crop.height * 6), Image.NEAREST)
    C.save_out(crop, "zoom_obj-ritual-sheet_rows_6x.png")


if __name__ == "__main__":
    main()
