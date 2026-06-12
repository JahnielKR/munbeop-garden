#!/usr/bin/env python3
"""cosmetics/cosmetic-set-complete.png (128x128, transparente).

Recompensa LEGENDARIA: collage-preview del set "민박 손님" que compone los
3 cosmeticos reales ya generados (cargados con PIL desde
munbeop/public/escape-room/level-01/cosmetics/):

  - tarjeta 120x120 con esquinas redondeadas, borde exterior brass de 1px,
    rellena con un recorte NEAREST (232->116, escala exacta 1/2) del
    cosmetic-bg-sunrise.png;
  - centro: cosmetic-avatar-lantern.png (64x64) tal cual, abrazado por
    cosmetic-frame-apron.png (96x96, sin reescalar: su ventana ya es ~64px),
    con halo dorado dithered detras (sin alpha-blending, solo checkerboard);
  - cinta dorada (PAL brass) abajo con el titulo 민박 손님 pixelado a mano
    (silabas de 16px de alto, >=10px que pide el spec y >=16px de STYLE.md);
  - destellos gold_light en las esquinas + florecitas rojas flanqueando.

Colores: solo common.PAL + OUTLINE (los 3 PNG fuente ya son PAL-compliant).
Determinista: sin random.
"""

from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import common  # noqa: E402
from common import OUTLINE, PAL, dither, fill, hline, vline  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

BRASS = PAL["brass"]
GOLD = PAL["gold_light"]
RED = PAL["red"]
PINK = PAL["pink"]
HANJI = PAL["hanji"]

SIZE = 128
CARD_X, CARD_Y, CARD_W, CARD_H = 4, 4, 120, 120      # tarjeta con borde brass
IN_X, IN_Y, IN_W, IN_H = 6, 6, 116, 116              # interior tras 2 anillos
FRAME_POS = (16, 8)                                  # apron 96x96
RIBBON = (16, 99, 111, 120)                          # banda principal x0,y0,x1,y1

# ── Hangul pixelado a mano: 민박 손님, 14px ancho x 16px alto por silaba ─────

G_MIN = [  # 민 = ㅁ + ㅣ + ㄴ
    "######......#.",
    "#....#......#.",
    "#....#......#.",
    "#....#......#.",
    "#....#......#.",
    "#....#......#.",
    "######......#.",
    "............#.",
    "..............",
    "#.............",
    "#.............",
    "#.............",
    "#.............",
    "#.............",
    "#.............",
    "############..",
]
G_BAK = [  # 박 = ㅂ + ㅏ + ㄱ
    "#....#....#...",
    "#....#....#...",
    "#....#....#...",
    "######....###.",
    "#....#....#...",
    "#....#....#...",
    "#....#....#...",
    "######....#...",
    "..............",
    "..............",
    "..##########..",
    "...........#..",
    "...........#..",
    "...........#..",
    "...........#..",
    "...........#..",
]
G_SON = [  # 손 = ㅅ + ㅗ + ㄴ
    "......#.......",
    ".....#.#......",
    "....#...#.....",
    "...#.....#....",
    "..#.......#...",
    "..............",
    "......#.......",
    "......#.......",
    "##############",
    "..............",
    ".#............",
    ".#............",
    ".#............",
    ".#............",
    ".#............",
    ".############.",
]
G_NIM = [  # 님 = ㄴ + ㅣ + ㅁ
    "#...........#.",
    "#...........#.",
    "#...........#.",
    "#...........#.",
    "#...........#.",
    "#...........#.",
    "########....#.",
    "............#.",
    "..............",
    ".##########...",
    ".#........#...",
    ".#........#...",
    ".#........#...",
    ".#........#...",
    ".#........#...",
    ".##########...",
]


def glyph(d: ImageDraw.ImageDraw, gx: int, gy: int, rows: list[str], ink) -> None:
    for ry, row in enumerate(rows):
        for rx, ch in enumerate(row):
            if ch == "#":
                d.point((gx + rx, gy + ry), fill=ink)


def dither_disc(d, cx: int, cy: int, r: int, c, phase: int = 0) -> None:
    """Disco dithered (checkerboard): unico blending permitido por STYLE.md."""
    rr = r * r
    for yy in range(cy - r, cy + r + 1):
        for xx in range(cx - r, cx + r + 1):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= rr and (xx + yy + phase) % 2 == 0:
                d.point((xx, yy), fill=c)


def sparkle(d, cx: int, cy: int, r: int, big: bool = False) -> None:
    """Destello de 4 puntas gold_light con nucleo hanji casi-blanco."""
    for i in range(1, r + 1):
        c = GOLD[1] if i == r else GOLD[0]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            d.point((cx + dx * i, cy + dy * i), fill=c)
    if big:
        for dx, dy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
            d.point((cx + dx, cy + dy), fill=GOLD[1])
    d.point((cx, cy), fill=HANJI[0])


def flower(d, cx: int, cy: int) -> None:
    """Florecita-sello roja (petalos red en dos tonos + corazon pink)."""
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        d.point((cx + dx, cy + dy), fill=RED[1])
    for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
        d.point((cx + dx, cy + dy), fill=RED[2])
    d.point((cx, cy), fill=PINK[0])


def round_card_corners(img: Image.Image) -> None:
    """Chaflan de 2px en las 4 esquinas de la tarjeta (queda transparente)."""
    x0, y0 = CARD_X, CARD_Y
    x1, y1 = CARD_X + CARD_W - 1, CARD_Y + CARD_H - 1
    clear = (0, 0, 0, 0)
    for (cx, cy, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1),
                             (x0, y1, 1, -1), (x1, y1, -1, -1)):
        img.putpixel((cx, cy), clear)
        img.putpixel((cx + sx, cy), clear)
        img.putpixel((cx, cy + sy), clear)
        img.putpixel((cx + sx, cy + sy), BRASS[1])          # diagonal brass
        img.putpixel((cx + 2 * sx, cy + sy), BRASS[0])      # brillo del chaflan
        img.putpixel((cx + sx, cy + 2 * sy), BRASS[0])


def find_window(frm: Image.Image) -> tuple[int, int]:
    """Centro (en coords del frame) de la ventana transparente central."""
    a = frm.getchannel("A")
    xs, ys = [], []
    for yy in range(10, 86):
        for xx in range(10, 86):
            if a.getpixel((xx, yy)) == 0:
                xs.append(xx)
                ys.append(yy)
    cx = (min(xs) + max(xs)) // 2
    cy = (min(ys) + max(ys)) // 2
    print(f"window bbox x {min(xs)}..{max(xs)}  y {min(ys)}..{max(ys)}  -> centro ({cx},{cy})")
    return cx, cy


def draw_ribbon(d: ImageDraw.ImageDraw) -> None:
    bx0, by0, bx1, by1 = RIBBON
    # colas plegadas (detras, mas oscuras), con muesca en V hacia afuera
    for side in ("L", "R"):
        for yy in range(by0 + 3, by1 - 2):           # 102..117
            t = yy - (by0 + 3)                        # 0..14
            depth = max(0, 3 - abs(2 * t - 14) // 3)  # V mas profunda al centro
            if side == "L":
                xa, xb = 7 + depth, bx0 - 1
            else:
                xa, xb = bx1 + 1, 120 - depth
            fill(d, xa, yy, xb - xa + 1, 1, BRASS[1])
            if yy == by0 + 4:                         # brillo superior de la cola
                fill(d, xa + 1, yy, xb - xa - 1, 1, BRASS[0])
            edge = xa if side == "L" else xb
            d.point((edge, yy), fill=OUTLINE)
            if yy in (by0 + 3, by1 - 3):              # bordes sup/inf de la cola
                hline(d, xa, yy, xb - xa + 1, OUTLINE)
        # sombra del pliegue contra la banda
        x_fold = bx0 - 2 if side == "L" else bx1 + 1
        vline(d, x_fold, by0 + 4, by1 - by0 - 7, BRASS[2])
    # banda principal
    fill(d, bx0, by0, bx1 - bx0 + 1, by1 - by0 + 1, BRASS[0])
    d.rectangle([bx0, by0, bx1, by1], outline=OUTLINE, width=1)
    hline(d, bx0 + 1, by0 + 1, bx1 - bx0 - 1, GOLD[0])         # brillo superior
    hline(d, bx0 + 1, by1 - 1, bx1 - bx0 - 1, BRASS[1])        # sombra inferior
    dither(d, bx0 + 1, by1 - 2, bx1 - bx0 - 1, 1, BRASS[1], phase=1)
    vline(d, bx0 + 1, by0 + 2, by1 - by0 - 3, BRASS[1])        # sombritas laterales
    vline(d, bx1 - 1, by0 + 2, by1 - by0 - 3, BRASS[1])
    # titulo 민박 손님 — 4 silabas de 14x16, espacio entre palabras de 6px
    ty = by0 + 3
    tx = bx0 + (bx1 - bx0 + 1 - 66) // 2             # 66 = 14*4 + 2 + 6 + 2
    for g, adv in ((G_MIN, 16), (G_BAK, 20), (G_SON, 16), (G_NIM, 0)):
        glyph(d, tx, ty, g, OUTLINE)
        tx += adv
    # florecitas-sello flanqueando el titulo
    flower(d, bx0 + 7, (by0 + by1) // 2)
    flower(d, bx1 - 7, (by0 + by1) // 2)
    # sombra de contacto de la cinta sobre la tarjeta (regla 8 de STYLE.md)
    dither(d, bx0 + 1, by1 + 1, bx1 - bx0 - 1, 1,
           common.SHADOW[:3] + (255,), phase=1)


def main() -> None:
    cos_dir = common.LEVEL_DIR / "cosmetics"
    bg = Image.open(cos_dir / "cosmetic-bg-sunrise.png").convert("RGBA")
    frm = Image.open(cos_dir / "cosmetic-frame-apron.png").convert("RGBA")
    ava = Image.open(cos_dir / "cosmetic-avatar-lantern.png").convert("RGBA")

    img, d = common.new_canvas(SIZE, SIZE)

    # 1. fondo: recorte 232x232 del amanecer (sol centrado), NEAREST a 116x116
    crop = bg.crop((44, 4, 44 + 232, 4 + 232)).resize((IN_W, IN_H), Image.NEAREST)
    img.paste(crop, (IN_X, IN_Y))

    # 2. halo legendario dithered detras del avatar (antes de pegar el frame)
    wx, wy = find_window(frm)
    acx, acy = FRAME_POS[0] + wx, FRAME_POS[1] + wy   # centro del avatar en canvas
    d = ImageDraw.Draw(img)
    dither_disc(d, acx, acy, 34, GOLD[2], phase=1)
    dither_disc(d, acx, acy, 27, GOLD[1])
    dither_disc(d, acx, acy, 19, GOLD[0], phase=1)

    # 3. frame apron abrazando al avatar (ventana ~64px: no hace falta reescalar)
    img.alpha_composite(frm, FRAME_POS)
    img.alpha_composite(ava, (acx - 32, acy - 32))

    # 4. cinta dorada con el titulo
    d = ImageDraw.Draw(img)
    draw_ribbon(d)

    # 5. doble anillo de la tarjeta: OUTLINE interior + brass exterior de 1px
    d.rectangle([CARD_X + 1, CARD_Y + 1, CARD_X + CARD_W - 2, CARD_Y + CARD_H - 2],
                outline=OUTLINE, width=1)
    d.rectangle([CARD_X, CARD_Y, CARD_X + CARD_W - 1, CARD_Y + CARD_H - 1],
                outline=BRASS[1], width=1)
    # gilding: tramos brillantes del anillo cerca de las esquinas
    for (hx, hy, vx, vy) in ((10, CARD_Y, CARD_X, 10),
                             (110, CARD_Y, CARD_X + CARD_W - 1, 10),
                             (10, CARD_Y + CARD_H - 1, CARD_X, 110),
                             (110, CARD_Y + CARD_H - 1, CARD_X + CARD_W - 1, 110)):
        hline(d, hx, hy, 8, BRASS[0])
        vline(d, vx, vy, 8, BRASS[0])
    round_card_corners(img)

    # 6. destellos dorados en las esquinas + chispitas sueltas
    d = ImageDraw.Draw(img)
    sparkle(d, 14, 15, 3, big=True)
    sparkle(d, 113, 15, 3, big=True)
    sparkle(d, 10, 88, 2)
    sparkle(d, 117, 86, 2)
    for px, py in ((33, 11), (95, 12), (10, 48), (117, 60), (64, 7),
                   (24, 94), (104, 95)):
        d.point((px, py), fill=GOLD[0])

    common.save_asset(img, "cosmetics", "cosmetic-set-complete.png")
    common.preview(img, "preview_cosmetic_set.png")
    # zoom 6x de la cinta para QA de legibilidad del hangul
    zoom = img.crop((2, 92, 126, 126)).resize((124 * 6, 34 * 6), Image.NEAREST)
    common.save_out(zoom, "preview_cosmetic_set_ribbon6x.png")


if __name__ == "__main__":
    main()
