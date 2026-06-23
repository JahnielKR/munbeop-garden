#!/usr/bin/env python3
"""Contact sheet for the Level 3 shared builders — the self-review harness.

The foundation phase ships ONLY common.py, so this renders EVERY shared sprite /
element builder onto its own labeled tile. Two sheets are produced:

  - contact_sheet_light.png  (card = steam[0], the warm/pale card)
  - contact_sheet_dark.png   (card = asphalt[3], the cold night-market card)

Each is saved at 1x and 3x (NEAREST). Read the PNGs to critique each builder
against STYLE.md (neon never legible, the griddle the warmest/highest-contrast,
이모/도윤/하나 three DISTINCT people, OUTLINE not #000), then iterate common.py.

Deterministic: re-running produces byte-identical output (no unseeded random).
Output (review only): tools/escape-room-level03/out/
"""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

import common as C
from common import OUTLINE, PAL


def _tile(label, w, h, fn):
    return (label, w, h, fn)


# ── Tiles that read best on a LIGHT (steam[0]) card ──────────────────────────
LIGHT_TILES = [
    _tile("imo(griddle)", 30, 56, lambda d: C.imo(d, 1, 1, "griddle")),
    _tile("imo(wave)", 32, 56, lambda d: C.imo(d, 1, 1, "wave")),
    _tile("doyun(stand)", 24, 54, lambda d: C.doyun(d, 1, 1, "stand")),
    _tile("doyun(window/buzz)", 26, 28, lambda d: C.doyun(d, 1, 1, "window")),
    _tile("hana(serve)", 26, 54, lambda d: C.hana(d, 5, 1, "serve")),
    _tile("hana(wave)", 26, 54, lambda d: C.hana(d, 1, 1, "wave")),
    _tile("griddle_hotteok", 64, 34, lambda d: C.griddle_hotteok(d, 1, 1)),
    _tile("gift_wrapped", 36, 32, lambda d: C.gift_wrapped(d, 1, 6)),
    _tile("paper_bag", 32, 38, lambda d: C.paper_bag(d, 1, 1)),
    _tile("backpack", 36, 36, lambda d: C.backpack(d, 1, 1)),
    _tile("bunsik_bar", 72, 34, lambda d: C.bunsik_bar(d, 1, 8)),
    _tile("market_cat(0 sit)", 20, 18, lambda d: C.market_cat(d, 1, 2, 0)),
    _tile("market_cat(1 flick)", 20, 18, lambda d: C.market_cat(d, 1, 2, 1)),
    _tile("market_cat(2 lick)", 20, 18, lambda d: C.market_cat(d, 1, 3, 2)),
    _tile("steam(warm)", 8, 16, lambda d: C.steam(d, 3, 15, 0, True)),
    _tile("steam(cool)", 8, 16, lambda d: C.steam(d, 3, 15, 0, False)),
    _tile("market_stall", 92, 72, lambda d: C.market_stall(d, 1, 1)),
    _tile("manmulsang_wall", 90, 40, lambda d: C.manmulsang_wall(d, 0, 0, 90, 40)),
    _tile("shutter(up)", 32, 40, lambda d: C.shutter(d, 0, 0, 32, 40, "up")),
    _tile("shutter(half)", 32, 40, lambda d: C.shutter(d, 0, 0, 32, 40, "half")),
]

# ── Tiles that read best on a DARK (asphalt[3]) card ─────────────────────────
DARK_TILES = [
    _tile("neon_sign(pink/lit)", 34, 22, lambda d: C.neon_sign(d, 3, 3, 28, 16, "pink", True)),
    _tile("neon_sign(cyan/lit)", 34, 22, lambda d: C.neon_sign(d, 3, 3, 28, 16, "cyan", True)),
    _tile("neon_sign(green/lit)", 34, 22, lambda d: C.neon_sign(d, 3, 3, 28, 16, "green", True)),
    _tile("neon_sign(pink/OFF)", 34, 22, lambda d: C.neon_sign(d, 3, 3, 28, 16, "pink", False)),
    _tile("neon_alley", 110, 60, lambda d: C.neon_alley(d, 1, 1, 108, 58)),
    _tile("neon_alley(dimming)", 110, 60, lambda d: C.neon_alley(d, 1, 1, 108, 58, 6)),
    _tile("wet_reflect(pink)", 70, 28, lambda d: C.wet_reflect(d, 0, 0, 70, 28, "pink")),
    _tile("wet_reflect(cyan)", 70, 28, lambda d: C.wet_reflect(d, 0, 0, 70, 28, "cyan")),
    _tile("wet_reflect(green)", 70, 28, lambda d: C.wet_reflect(d, 0, 0, 70, 28, "green")),
    _tile("last_bus", 132, 74, lambda d: C.last_bus(d, 1, 1)),
    _tile("bus_stop", 48, 62, lambda d: C.bus_stop(d, 1, 1)),
    _tile("market_gate", 98, 50, lambda d: C.market_gate(d, 1, 4)),
    _tile("doyun(window/buzz)", 26, 28, lambda d: C.doyun(d, 1, 1, "window")),
    _tile("doyun(stand)/dark", 24, 54, lambda d: C.doyun(d, 1, 1, "stand")),
    _tile("griddle_hotteok/dark", 64, 34, lambda d: C.griddle_hotteok(d, 1, 1)),
    _tile("market_cat(2)/dark", 20, 18, lambda d: C.market_cat(d, 1, 3, 2)),
    _tile("shutter(half)/dark", 32, 40, lambda d: C.shutter(d, 0, 0, 32, 40, "half")),
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
    light_card = PAL["steam"][0]
    light_bg = PAL["steam"][1]
    dark_card = PAL["asphalt"][3]
    dark_bg = PAL["asphalt"][2]

    light = build_sheet(
        "Level 3 shared builders - LIGHT card (steam[0])",
        LIGHT_TILES, light_card, light_bg, OUTLINE, per_row=5, scale=1)
    dark = build_sheet(
        "Level 3 shared builders - DARK card (asphalt[3])",
        DARK_TILES, dark_card, dark_bg, PAL["steam"][0], per_row=5, scale=1)

    C.save_out(light, "contact_sheet_light.png")
    C.save_out(dark, "contact_sheet_dark.png")
    C.save_out(light.resize((light.width * 3, light.height * 3), Image.NEAREST),
               "contact_sheet_light_3x.png")
    C.save_out(dark.resize((dark.width * 3, dark.height * 3), Image.NEAREST),
               "contact_sheet_dark_3x.png")


if __name__ == "__main__":
    main()
