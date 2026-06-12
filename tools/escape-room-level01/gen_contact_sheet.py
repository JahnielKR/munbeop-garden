#!/usr/bin/env python3
"""Contact sheet de cierre — Escape Room Nivel 1 «Una mañana en el minbak».

Carga TODOS los assets finales bajo munbeop/public/escape-room/level-01/
(la familia completa que enumera STYLE.md: 4 rooms + 2 cinematics + 4 notas +
5 objetos + 5 relojes + 2 candados + 5 cosméticos incluyendo strip y set =
27 archivos; el «22» del encabezado de la tabla es la cuenta sin cosméticos),
verifica tamaño y modo de cada uno (falla con mensaje claro si algo no
cuadra) y compone UNA hoja de contacto sobre fondo crema cálido:
escenas a 1x, sprites a 2x NEAREST, cada celda etiquetada con su archivo.

Salida (solo material de revisión): tools/escape-room-level01/out/contact_sheet.png
"""

from __future__ import annotations

import sys

from PIL import Image, ImageDraw, ImageFont

import common
from common import PAL, OUTLINE

# ── Inventario esperado: (ruta relativa, (w, h), fondo) ─────────────────────
# fondo: "opaco"  -> sin píxeles transparentes (alpha mín. 255 si hay canal A)
#        "transp" -> canal alpha presente y con al menos un píxel alpha=0

SCENE = "opaco"
SPRITE = "transp"

EXPECTED: list[tuple[str, tuple[int, int], str]] = [
    ("rooms/room-01-bedroom.png", (320, 240), SCENE),
    ("rooms/room-02-living.png", (320, 240), SCENE),
    ("rooms/room-03-kitchen.png", (320, 240), SCENE),
    ("rooms/room-04-entrance.png", (320, 240), SCENE),
    ("rooms/cinematic-intro.png", (320, 240), SCENE),
    ("rooms/cinematic-outro.png", (320, 240), SCENE),
    ("objects/note-01.png", (128, 128), SPRITE),
    ("objects/note-02.png", (128, 128), SPRITE),
    ("objects/note-03.png", (128, 128), SPRITE),
    ("objects/note-final.png", (128, 128), SPRITE),
    ("objects/obj-fridge.png", (128, 128), SPRITE),
    ("objects/obj-table-bread.png", (128, 128), SPRITE),
    ("objects/obj-cupboard.png", (128, 128), SPRITE),
    ("objects/obj-pot.png", (128, 128), SPRITE),
    ("objects/obj-bowl.png", (128, 128), SPRITE),
    ("objects/obj-clock.png", (96, 96), SPRITE),
    ("objects/obj-clock-0600.png", (96, 96), SPRITE),
    ("objects/obj-clock-0700.png", (96, 96), SPRITE),
    ("objects/obj-clock-0930.png", (96, 96), SPRITE),
    ("objects/obj-clock-1100.png", (96, 96), SPRITE),
    ("objects/lock-closed.png", (128, 128), SPRITE),
    ("objects/lock-open.png", (128, 128), SPRITE),
    ("cosmetics/cosmetic-bg-sunrise.png", (320, 240), SCENE),
    ("cosmetics/cosmetic-frame-apron.png", (96, 96), SPRITE),
    ("cosmetics/cosmetic-avatar-lantern.png", (64, 64), SPRITE),
    ("cosmetics/cosmetic-avatar-lantern-strip.png", (256, 64), SPRITE),
    ("cosmetics/cosmetic-set-complete.png", (128, 128), SPRITE),
]

# ── Carga + verificación ─────────────────────────────────────────────────────


def load_and_verify() -> dict[str, Image.Image]:
    imgs: dict[str, Image.Image] = {}
    errors: list[str] = []
    for rel, size, kind in EXPECTED:
        path = common.LEVEL_DIR / rel
        if not path.is_file():
            errors.append(f"{rel}: NO EXISTE (esperado en {path})")
            continue
        img = Image.open(path)
        img.load()
        if img.size != size:
            errors.append(f"{rel}: tamaño {img.size}, esperado {size}")
        has_alpha = "A" in img.getbands()
        if kind == SCENE:
            if has_alpha:
                amin, _ = img.getchannel("A").getextrema()
                if amin < 255:
                    errors.append(
                        f"{rel}: debe ser opaco pero tiene alpha mínimo {amin}"
                    )
        else:  # SPRITE
            if not has_alpha:
                errors.append(f"{rel}: modo {img.mode} sin canal alpha "
                              "(se esperaba fondo transparente)")
            else:
                amin, _ = img.getchannel("A").getextrema()
                if amin != 0:
                    errors.append(
                        f"{rel}: se esperaba fondo transparente pero el alpha "
                        f"mínimo es {amin} (ningún píxel transparente)"
                    )
        imgs[rel] = img.convert("RGBA")
    if errors:
        print("FALLO de verificación de assets:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {len(EXPECTED)} assets verificados (tamaño y modo).")
    return imgs


# ── Composición de la hoja ───────────────────────────────────────────────────

# Filas de la grilla: (ruta, escala). Escenas 1x, sprites 2x NEAREST.
ROWS: list[list[tuple[str, int]]] = [
    [("rooms/room-01-bedroom.png", 1), ("rooms/room-02-living.png", 1),
     ("rooms/room-03-kitchen.png", 1), ("rooms/room-04-entrance.png", 1)],
    [("rooms/cinematic-intro.png", 1), ("rooms/cinematic-outro.png", 1),
     ("cosmetics/cosmetic-bg-sunrise.png", 1)],
    [("objects/note-01.png", 2), ("objects/note-02.png", 2),
     ("objects/note-03.png", 2), ("objects/note-final.png", 2)],
    [("objects/obj-fridge.png", 2), ("objects/obj-table-bread.png", 2),
     ("objects/obj-cupboard.png", 2), ("objects/obj-pot.png", 2),
     ("objects/obj-bowl.png", 2)],
    [("objects/obj-clock.png", 2), ("objects/obj-clock-0600.png", 2),
     ("objects/obj-clock-0700.png", 2), ("objects/obj-clock-0930.png", 2),
     ("objects/obj-clock-1100.png", 2)],
    [("objects/lock-closed.png", 2), ("objects/lock-open.png", 2),
     ("cosmetics/cosmetic-frame-apron.png", 2),
     ("cosmetics/cosmetic-avatar-lantern.png", 2),
     ("cosmetics/cosmetic-set-complete.png", 2)],
    [("cosmetics/cosmetic-avatar-lantern-strip.png", 2)],
]

MARGIN = 24       # margen exterior de la hoja
GAP = 18          # separación entre celdas y entre filas
PAD = 8           # aire interno de cada tarjeta alrededor del píxel art
LABEL_H = 16      # alto reservado para la etiqueta bajo cada imagen

BG = PAL["hanji"][1]        # crema cálido
CARD = PAL["hanji"][0]      # tarjeta un punto más clara tras cada sprite
EDGE = PAL["hanji"][3]      # borde suave de tarjeta
INK = OUTLINE               # tinta de etiquetas


def build_sheet(imgs: dict[str, Image.Image]) -> Image.Image:
    font = ImageFont.load_default()
    measurer = ImageDraw.Draw(Image.new("RGBA", (1, 1)))

    def cell_dims(rel: str, scale: int) -> tuple[int, int, int]:
        img = imgs[rel]
        w, h = img.width * scale, img.height * scale
        label_w = int(measurer.textlength(rel, font=font))
        cw = max(w, label_w) + 2 * PAD
        ch = h + LABEL_H + 2 * PAD
        return cw, ch, w

    row_dims = []
    for row in ROWS:
        cells = [cell_dims(rel, s) for rel, s in row]
        width = sum(c[0] for c in cells) + GAP * (len(cells) - 1)
        height = max(c[1] for c in cells)
        row_dims.append((cells, width, height))

    title = (f"Escape Room - Nivel 1 'Una manana en el minbak' - "
             f"hoja de contacto ({len(EXPECTED)} assets) - "
             f"escenas 1x / sprites 2x")
    title_h = 22
    sheet_w = max(w for _, w, _ in row_dims) + 2 * MARGIN
    sheet_h = (MARGIN + title_h + GAP + sum(h for _, _, h in row_dims)
               + GAP * (len(ROWS) - 1) + MARGIN)

    sheet = Image.new("RGBA", (sheet_w, sheet_h), BG)
    d = ImageDraw.Draw(sheet)
    d.text((MARGIN, MARGIN), title, font=font, fill=INK)

    y = MARGIN + title_h + GAP
    for row, (cells, row_w, row_h) in zip(ROWS, row_dims):
        x = MARGIN
        for (rel, scale), (cw, ch, img_w) in zip(row, cells):
            img = imgs[rel]
            big = (img if scale == 1 else
                   img.resize((img.width * scale, img.height * scale),
                              Image.NEAREST))
            # tarjeta de fondo (delimita la celda y revela la transparencia)
            d.rectangle([x, y, x + cw - 1, y + ch - 1], fill=CARD, outline=EDGE)
            ix = x + (cw - big.width) // 2
            iy = y + PAD
            sheet.paste(big, (ix, iy), big)
            label_w = int(measurer.textlength(rel, font=font))
            d.text((x + (cw - label_w) // 2, y + PAD + big.height + 3),
                   rel, font=font, fill=INK)
            x += cw + GAP
        y += row_h + GAP
    return sheet


def main() -> None:
    imgs = load_and_verify()
    sheet = build_sheet(imgs)
    common.save_out(sheet, "contact_sheet.png")


if __name__ == "__main__":
    main()
