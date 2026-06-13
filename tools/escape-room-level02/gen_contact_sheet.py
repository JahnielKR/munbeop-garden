#!/usr/bin/env python3
"""Contact sheet for the Level 2 shared builders — the self-review harness.

Unlike the level-1 contact sheet (which loads finished assets), Level 2's
foundation phase ships ONLY common.py, so this renders EVERY shared sprite /
element builder onto its own labeled tile. Two sheets are produced because some
sprites sit on light temple interiors and some on the dark rain exterior:

  - contact_sheet_light.png  (card = hanji[1], warm interior props)
  - contact_sheet_dark.png   (card = night[3]/rain[4], rain-exterior props)

Each is saved at 1x and 3x (NEAREST). Read the PNGs to critique each builder
against STYLE.md + the level-1 PENDIENTES failure modes, then iterate common.py.

Deterministic: re-running produces byte-identical output (no unseeded random).
Output (review only): tools/escape-room-level02/out/
"""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

import common as C
from common import OUTLINE, PAL


# A tile renders one builder onto a small transparent canvas via a draw fn.
# (label, cell_w, cell_h, draw_fn(d)) — draw_fn paints into a fresh canvas.
def _tile(label, w, h, fn):
    return (label, w, h, fn)


# ── Tiles that read best on a LIGHT (warm interior) card ─────────────────────
LIGHT_TILES = [
    _tile("monk(seated_tea)", 34, 50, lambda d: C.monk(d, 1, 0, "seated_tea")),
    _tile("monk(gassho)", 22, 42, lambda d: C.monk(d, 1, 0, "gassho")),
    _tile("cat(0 asleep)", 18, 17, lambda d: C.cat(d, 1, 1, 0)),
    _tile("cat(1 turned)", 18, 19, lambda d: C.cat(d, 1, 3, 1)),
    _tile("cat(2 off-frame)", 18, 19, lambda d: C.cat(d, 1, 3, 2)),
    _tile("brazier_hwaro", 32, 26, lambda d: C.brazier_hwaro(d, 1, 1)),
    _tile("tea_cup(plain)", 12, 12, lambda d: C.tea_cup(d, 1, 2, False)),
    _tile("tea_cup(steam)", 12, 14, lambda d: C.tea_cup(d, 1, 6, True)),
    _tile("guestbook", 42, 22, lambda d: C.guestbook(d, 1, 0, False)),
    _tile("guestbook(signed)", 42, 22, lambda d: C.guestbook(d, 1, 0, True)),
    _tile("moktak", 24, 22, lambda d: C.moktak(d, 1, 4)),
    _tile("portrait_yeongjeong", 32, 38, lambda d: C.portrait_yeongjeong(d, 1, 1)),
    _tile("diary_book(closed)", 32, 26, lambda d: C.diary_book(d, 1, 2, False)),
    _tile("diary_book(open)", 46, 28, lambda d: C.diary_book(d, 1, 1, True)),
    _tile("gomusin", 26, 12, lambda d: C.gomusin(d, 1, 1)),
    _tile("hanja_cheongwu", 22, 13, lambda d: C.hanja_cheongwu(d, 1, 1)),
    _tile("hanja_cheongwu#2", 22, 13, lambda d: C.hanja_cheongwu(d, 1, 1)),
    _tile("paper_umbrella(open)", 34, 34, lambda d: C.paper_umbrella(d, 1, 3, True)),
    _tile("paper_umbrella(furl)", 34, 30, lambda d: C.paper_umbrella(d, 1, 1, False)),
    _tile("lantern_tile(lit)", 18, 26, lambda d: C.lantern_tile(d, 1, 2, True)),
    _tile("lantern_tile(unlit)", 18, 26, lambda d: C.lantern_tile(d, 1, 2, False)),
    _tile("dancheong_column", 18, 44, lambda d: C.dancheong_column(d, 1, 1, 42)),
    _tile("dancheong_beam", 70, 16, lambda d: C.dancheong_beam(d, 1, 1, 68)),
    _tile("samul(bell)", 16, 16, lambda d: C.samul_medallion(d, 0, 0, "bell")),
    _tile("samul(drum)", 16, 16, lambda d: C.samul_medallion(d, 0, 0, "drum")),
    _tile("samul(fish)", 16, 16, lambda d: C.samul_medallion(d, 0, 0, "fish")),
    _tile("samul(cloud)", 16, 16, lambda d: C.samul_medallion(d, 0, 0, "cloud")),
    _tile("bicheonsang", 28, 28, lambda d: C.bicheonsang(d, 0, 0)),
    _tile("plum_branch", 48, 46, lambda d: C.plum_branch(d, 2, 44, 44, 42)),
    _tile("petals", 40, 24, lambda d: C.petals(d, 0, 0, 40, 24)),
]

# ── Tiles that read best on a DARK (rain exterior) card ──────────────────────
DARK_TILES = [
    _tile("rain_curtain(p0)", 60, 50, lambda d: C.rain_curtain(d, 0, 0, 60, 50, 0)),
    _tile("rain_curtain(p1)", 60, 50, lambda d: C.rain_curtain(d, 0, 0, 60, 50, 1)),
    _tile("rain_clear", 60, 40, lambda d: C.rain_clear(d, 0, 38, 58, 2)),
    _tile("bell_beom", 48, 80, lambda d: C.bell_beom(d, 1, 10)),
    _tile("dangmok", 40, 24, lambda d: C.dangmok(d, 1, 15)),
    _tile("iljumun", 90, 80, lambda d: C.iljumun(d, 4, 8, 82, 72)),
    _tile("broken_umbrella", 30, 32, lambda d: C.broken_umbrella(d, 1, 3)),
    _tile("monk(gassho)/dark", 22, 42, lambda d: C.monk(d, 1, 0, "gassho")),
    _tile("cat(2)/dark", 18, 19, lambda d: C.cat(d, 1, 3, 2)),
    _tile("gomusin/dark", 26, 12, lambda d: C.gomusin(d, 1, 1)),
    _tile("lantern_tile(lit)", 18, 26, lambda d: C.lantern_tile(d, 1, 2, True)),
    _tile("paper_umbrella(open)", 34, 34, lambda d: C.paper_umbrella(d, 1, 3, True)),
    _tile("petals/dark", 40, 24, lambda d: C.petals(d, 0, 0, 40, 24)),
    _tile("plum_branch/dark", 48, 46, lambda d: C.plum_branch(d, 2, 44, 44, 42)),
    # the lantern wall (49 grid) — small, ONE unlit at top-right
    _tile("lantern_wall 7x7", 7 * 20 + 4, 7 * 27 + 6,
          lambda d: C.lantern_wall(d, 2, 2)),
]


def render_tile(w, h, fn):
    img, d = C.new_canvas(w, h)
    fn(d)
    return img


MARGIN, GAP, PAD, LABEL_H = 22, 14, 6, 12


def build_sheet(title, tiles, card_bg, sheet_bg, ink, per_row=6, scale=1):
    font = ImageFont.load_default()
    meas = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    rendered = [(lbl, render_tile(w, h, fn)) for (lbl, w, h, fn) in tiles]

    def cell_size(lbl, im):
        bw, bh = im.width * scale, im.height * scale
        lw = int(meas.textlength(lbl, font=font))
        return max(bw, lw) + 2 * PAD, bh + LABEL_H + 2 * PAD

    rows = [rendered[i:i + per_row] for i in range(0, len(rendered), per_row)]
    row_h = []
    col_w = [0] * per_row
    for row in rows:
        rh = 0
        for ci, (lbl, im) in enumerate(row):
            cw, ch = cell_size(lbl, im)
            col_w[ci] = max(col_w[ci], cw)
            rh = max(rh, ch)
        row_h.append(rh)

    title_h = 20
    sheet_w = MARGIN * 2 + sum(col_w) + GAP * (per_row - 1)
    sheet_h = MARGIN * 2 + title_h + GAP + sum(row_h) + GAP * (len(rows) - 1)
    sheet = Image.new("RGBA", (sheet_w, sheet_h), sheet_bg)
    d = ImageDraw.Draw(sheet)
    d.text((MARGIN, MARGIN), title, font=font, fill=ink)

    y = MARGIN + title_h + GAP
    for ri, row in enumerate(rows):
        x = MARGIN
        for ci, (lbl, im) in enumerate(row):
            cw = col_w[ci]
            ch = row_h[ri]
            d.rectangle([x, y, x + cw - 1, y + ch - 1], fill=card_bg,
                        outline=PAL["stone"][2])
            big = im if scale == 1 else im.resize(
                (im.width * scale, im.height * scale), Image.NEAREST)
            ix = x + (cw - big.width) // 2
            sheet.paste(big, (ix, y + PAD), big)
            lw = int(meas.textlength(lbl, font=font))
            d.text((x + (cw - lw) // 2, y + PAD + big.height + 2), lbl,
                   font=font, fill=ink)
            x += cw + GAP
        y += row_h[ri] + GAP
    return sheet


def main():
    light_card = PAL["hanji"][0]
    light_bg = PAL["hanji"][2]
    dark_card = PAL["rain"][4]
    dark_bg = PAL["night"][3]

    light = build_sheet(
        "Level 2 shared builders - LIGHT card (warm interior props)",
        LIGHT_TILES, light_card, light_bg, OUTLINE, per_row=6, scale=1)
    dark = build_sheet(
        "Level 2 shared builders - DARK card (rain exterior props)",
        DARK_TILES, dark_card, dark_bg, PAL["hanji"][0], per_row=5, scale=1)

    C.save_out(light, "contact_sheet_light.png")
    C.save_out(dark, "contact_sheet_dark.png")
    C.save_out(light.resize((light.width * 3, light.height * 3), Image.NEAREST),
               "contact_sheet_light_3x.png")
    C.save_out(dark.resize((dark.width * 3, dark.height * 3), Image.NEAREST),
               "contact_sheet_dark_3x.png")


if __name__ == "__main__":
    main()
