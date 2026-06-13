#!/usr/bin/env python3
"""FAMILY contact sheets for the Level 2 FINAL assets — the review artifact.

Unlike gen_contact_sheet.py (which renders the shared *builders* off common.py),
this loads every SHIPPED PNG from munbeop/public/escape-room/level-02/ and lays
them on a neutral card, each labeled with its filename. Two sheets are produced
so each stays comfortably viewable (<= ~2200px wide):

  - family_contact_sheet_scenes.png   the 8 full 320x240 scenes, downscaled to a
                                      readable size (6 rooms + 2 cinematics)
  - family_contact_sheet_objects.png  the 14 objects + cosmetics, small sprites
                                      upscaled 2-3x so detail reads

Deterministic: re-running produces byte-identical output (no unseeded random).
NEAREST scaling only (both downscale of scenes and upscale of sprites), so the
pixel grid is preserved. Output (review only): tools/escape-room-level02/out/
"""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

import common as C
from common import OUTLINE, PAL, LEVEL_DIR

# ── Neutral card / sheet tones (on-palette: warm hanji card, cool stone frame) ─
CARD_BG = PAL["hanji"][1]      # #f1e5cb warm neutral card
SHEET_BG = PAL["stone"][1]     # #9a988f cool neutral backdrop
CARD_LINE = PAL["stone"][3]    # #474640 card border
INK = OUTLINE                  # #2a1c14 label ink
TITLE_INK = PAL["hanji"][0]    # near-white title on the stone backdrop

MARGIN, GAP, PAD, LABEL_H, TITLE_H = 20, 14, 8, 14, 22


# (filename, on-disk relpath under LEVEL_DIR, display-scale)
# scale < 1 downsamples scenes; scale >= 1 upsamples small sprites. NEAREST both.
SCENES = [
    ("room-01-dasil.png", "rooms/room-01-dasil.png", 0.65),
    ("room-02-daeungjeon.png", "rooms/room-02-daeungjeon.png", 0.65),
    ("room-02-daeungjeon-complete.png",
     "rooms/room-02-daeungjeon-complete.png", 0.65),
    ("room-03-seungbang.png", "rooms/room-03-seungbang.png", 0.65),
    ("room-04-jongnu.png", "rooms/room-04-jongnu.png", 0.65),
    ("room-04-jongnu-clear.png", "rooms/room-04-jongnu-clear.png", 0.65),
    ("cinematic-intro.png", "rooms/cinematic-intro.png", 0.65),
    ("cinematic-outro.png", "rooms/cinematic-outro.png", 0.65),
]

OBJECTS = [
    # 128x128 close-ups at 2x read crisp without blowing the width budget
    ("obj-ritual-sheet.png", "objects/obj-ritual-sheet.png", 2),
    ("obj-diary-page.png", "objects/obj-diary-page.png", 2),
    ("obj-diary-last.png", "objects/obj-diary-last.png", 2),
    ("obj-beam-inscription.png", "objects/obj-beam-inscription.png", 2),
    ("obj-second-cup.png", "objects/obj-second-cup.png", 2),
    ("obj-calligraphy-rain.png", "objects/obj-calligraphy-rain.png", 2),
    ("obj-guestbook.png", "objects/obj-guestbook.png", 2),
    ("obj-guestbook-signed.png", "objects/obj-guestbook-signed.png", 2),
    ("sprite-cat-strip.png", "objects/sprite-cat-strip.png", 4),
    ("cosmetic-bg-rainsound.png", "cosmetics/cosmetic-bg-rainsound.png", 0.65),
    ("cosmetic-frame-dancheong.png",
     "cosmetics/cosmetic-frame-dancheong.png", 2),
    ("cosmetic-avatar-templecat.png",
     "cosmetics/cosmetic-avatar-templecat.png", 3),
    ("cosmetic-avatar-templecat-strip.png",
     "cosmetics/cosmetic-avatar-templecat-strip.png", 2),
    ("cosmetic-set-complete.png", "cosmetics/cosmetic-set-complete.png", 2),
]


def _scaled(im: Image.Image, scale: float) -> Image.Image:
    w = max(1, round(im.width * scale))
    h = max(1, round(im.height * scale))
    return im.resize((w, h), Image.NEAREST)


def build_sheet(title, entries, per_row):
    font = ImageFont.load_default()
    meas = ImageDraw.Draw(Image.new("RGBA", (1, 1)))

    rendered = []
    for label, rel, scale in entries:
        im = Image.open(LEVEL_DIR / rel).convert("RGBA")
        rendered.append((label, _scaled(im, scale)))

    def cell_size(lbl, im):
        lw = int(meas.textlength(lbl, font=font))
        return max(im.width, lw) + 2 * PAD, im.height + LABEL_H + 2 * PAD

    rows = [rendered[i:i + per_row] for i in range(0, len(rendered), per_row)]
    col_w = [0] * per_row
    row_h = []
    for row in rows:
        rh = 0
        for ci, (lbl, im) in enumerate(row):
            cw, ch = cell_size(lbl, im)
            col_w[ci] = max(col_w[ci], cw)
            rh = max(rh, ch)
        row_h.append(rh)

    sheet_w = MARGIN * 2 + sum(col_w) + GAP * (per_row - 1)
    sheet_h = (MARGIN * 2 + TITLE_H + GAP + sum(row_h)
               + GAP * (len(rows) - 1))
    sheet = Image.new("RGBA", (sheet_w, sheet_h), SHEET_BG)
    d = ImageDraw.Draw(sheet)
    d.text((MARGIN, MARGIN + 4), title, font=font, fill=TITLE_INK)

    y = MARGIN + TITLE_H + GAP
    for ri, row in enumerate(rows):
        x = MARGIN
        for ci, (lbl, im) in enumerate(row):
            cw, ch = col_w[ci], row_h[ri]
            d.rectangle([x, y, x + cw - 1, y + ch - 1],
                        fill=CARD_BG, outline=CARD_LINE)
            ix = x + (cw - im.width) // 2
            sheet.paste(im, (ix, y + PAD), im)
            lw = int(meas.textlength(lbl, font=font))
            d.text((x + (cw - lw) // 2, y + PAD + im.height + 3),
                   lbl, font=font, fill=INK)
            x += cw + GAP
        y += row_h[ri] + GAP
    return sheet


def main():
    scenes = build_sheet(
        "Level 2 FINAL assets - FAMILY CONTACT SHEET (scenes, 320x240 @ 0.65x)",
        SCENES, per_row=4)
    objects = build_sheet(
        "Level 2 FINAL assets - FAMILY CONTACT SHEET "
        "(objects + cosmetics; small sprites @ 2-4x, bg plate @ 0.65x)",
        OBJECTS, per_row=5)

    C.save_out(scenes, "family_contact_sheet_scenes.png")
    C.save_out(objects, "family_contact_sheet_objects.png")
    print(f"scenes  sheet {scenes.width}x{scenes.height}")
    print(f"objects sheet {objects.width}x{objects.height}")


if __name__ == "__main__":
    main()
