#!/usr/bin/env python3
"""objects/lock-closed.png + objects/lock-open.png (128x128, transparent).

El candado de combinacion del minbak (mismo objeto que aparece en
room-04-entrance.png). Cuerpo IDENTICO en ambos estados: un unico camino de
codigo lo dibuja, solo cambian (a) el arco, (b) la alineacion de las marcas
de las ruedas y (c) los destellos dorados del estado abierto.

Colores: SOLO common.PAL + OUTLINE + SHADOW (via drop_shadow). Sin tonos
derivados nuevos. Sin random: todo es determinista a mano.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from PIL import Image, ImageDraw

import common
from common import OUTLINE, PAL, dither, fill, hline, vline

M = PAL["metal"]
GOLD = PAL["gold_light"]
PINK = PAL["pink"]
HANJI = PAL["hanji"]
BRASS = PAL["brass"]

W = H = 128
ERASE = (0, 0, 0, 0)

# Geometria compartida ───────────────────────────────────────────────────────
BODY = (18, 46, 110, 108)        # rect inclusivo del cuerpo
PANEL = (30, 60, 96, 94)         # panel frontal recesado
WHEEL_X0 = (33, 49, 65, 81)      # 4 ruedas de 13 px + 3 px de hueco
WHEEL_W, WHEEL_Y0, WHEEL_Y1 = 13, 63, 91
MARK_CY = 77                     # fila donde apuntan las flechas brass
SLOT_L = (37, 46, 48, 50)        # ojales del arco en el cuerpo
SLOT_R = (80, 46, 91, 50)

# Glifos abstractos de "digito" (3x5): trazos rotos y gastados que sugieren
# un numero grabado sin ser legibles (regla 7 del STYLE.md). Los puntos
# marcados con True se pintan OUTLINE; el resto M[3] (grabado desgastado).
DIGIT_MARKS = [
    [(-1, -2, True), (1, -2, False), (0, -1, True), (-1, 1, True),
     (0, 1, False), (1, 2, True)],
    [(0, -2, True), (1, -1, False), (-1, 0, True), (1, 0, True),
     (0, 1, False), (-1, 2, True)],
    [(-1, -2, True), (1, -2, True), (0, -1, False), (1, 0, True),
     (-1, 1, False), (0, 2, True)],
    [(1, -2, True), (-1, -1, True), (0, 0, False), (1, 0, True),
     (-1, 2, True), (0, 2, False)],
]
OFFSETS_SCRAMBLED = (-5, 3, -2, 4)   # closed: ruedas desordenadas
OFFSETS_ALIGNED = (0, 0, 0, 0)       # open: marcas en fila sobre MARK_CY


def wheel(d: ImageDraw.ImageDraw, x0: int, pat, off: int) -> None:
    """Una rueda de codigo: cilindro horizontal, centro al brillo."""
    h = WHEEL_Y1 - WHEEL_Y0 + 1
    fill(d, x0, WHEEL_Y0, WHEEL_W, h, M[1])
    # curvatura superior (en sombra del labio del panel)
    hline(d, x0, 63, WHEEL_W, M[3])
    hline(d, x0, 64, WHEEL_W, M[3])
    hline(d, x0, 65, WHEEL_W, M[2])
    hline(d, x0, 66, WHEEL_W, M[2])
    dither(d, x0, 67, WHEEL_W, 2, M[2])
    # banda central iluminada (cara plana del digito) con tinte de amanecer
    dither(d, x0, 72, WHEEL_W, 1, M[0])
    fill(d, x0, 73, WHEEL_W, 8, M[0])
    dither(d, x0 + 1, 73, WHEEL_W - 2, 1, GOLD[0])
    dither(d, x0, 81, WHEEL_W, 1, M[0])
    # curvatura inferior
    dither(d, x0, 84, WHEEL_W, 2, M[2])
    hline(d, x0, 86, WHEEL_W, M[2])
    hline(d, x0, 87, WHEEL_W, M[2])
    hline(d, x0, 88, WHEEL_W, M[3])
    fill(d, x0, 89, WHEEL_W, 3, M[3])
    # moleteado (estrias paralelas al eje, arriba y abajo)
    for xx in range(x0 + 1, x0 + WHEEL_W - 1, 3):
        d.point((xx, 64), fill=M[2])
        d.point((xx, 89), fill=M[2])
    # bordes laterales del cilindro
    vline(d, x0, WHEEL_Y0, h, M[2])
    vline(d, x0 + WHEEL_W - 1, WHEEL_Y0, h, M[3])
    # marca del digito + medias marcas de los digitos vecinos
    cx, cy = x0 + 6, MARK_CY + off
    for dx, dy, strong in pat:
        d.point((cx + dx, cy + dy), fill=OUTLINE if strong else M[3])
    for ny in (cy - 8, cy + 8):
        if 66 <= ny <= 88:
            hline(d, cx - 1, ny, 3, M[3])


def flower_sticker(d: ImageDraw.ImageDraw) -> None:
    """Pegatina de flor que halmeoni pego en la esquina inferior izquierda."""
    d.ellipse([27, 93, 39, 105], fill=HANJI[0], outline=HANJI[3])
    cx, cy = 33, 99
    # 4 petalos en cruz (2x2) + 4 puntas diagonales claras
    fill(d, cx - 1, cy - 4, 2, 2, PINK[1])
    fill(d, cx - 1, cy + 2, 2, 2, PINK[2])
    fill(d, cx - 4, cy - 1, 2, 2, PINK[1])
    fill(d, cx + 2, cy - 1, 2, 2, PINK[2])
    d.point((cx - 1, cy - 4), fill=PINK[0])
    d.point((cx - 4, cy - 1), fill=PINK[0])
    for dx, dy in ((-3, -3), (2, -3), (-3, 2), (2, 2)):
        d.point((cx + dx, cy + dy), fill=PINK[0])
    fill(d, cx - 1, cy - 1, 2, 2, GOLD[1])
    d.point((cx, cy), fill=GOLD[2])


def draw_body(d: ImageDraw.ImageDraw, offsets) -> None:
    """Cuerpo del candado. Identico salvo la fase de las ruedas (offsets)."""
    x0, y0, x1, y1 = BODY
    d.rounded_rectangle(BODY, radius=10, fill=M[1], outline=OUTLINE)
    # bisel superior + izquierdo (luz del amanecer arriba-izquierda):
    # el sol entra calido, asi que el filo lleva un beso de gold_light
    hline(d, 24, 48, 80, M[0])
    dither(d, 24, 48, 80, 1, GOLD[0])
    hline(d, 22, 49, 84, M[0])
    dither(d, 22, 50, 84, 1, M[0])
    vline(d, 20, 52, 26, M[0])
    dither(d, 20, 52, 1, 12, GOLD[0])
    dither(d, 20, 78, 1, 14, M[0])
    # sombreado inferior + derecho
    dither(d, 22, 102, 84, 2, M[2])
    hline(d, 22, 104, 85, M[2])
    hline(d, 22, 105, 85, M[2])
    hline(d, 24, 106, 81, M[2])
    hline(d, 26, 107, 77, M[3])
    dither(d, 105, 56, 1, 46, M[2])
    vline(d, 106, 54, 49, M[2])
    vline(d, 107, 56, 45, M[2])
    vline(d, 108, 58, 41, M[3])
    # ojales por donde entra el arco (visibles cuando esta abierto)
    for sx0, sy0, sx1, sy1 in (SLOT_L, SLOT_R):
        d.rectangle([sx0, sy0, sx1, sy1], fill=M[3], outline=OUTLINE)
        hline(d, sx0 + 1, sy1, sx1 - sx0 - 1, M[2])
    # tornillos de las esquinas
    for rx, ry in ((24, 53), (102, 53), (24, 101), (102, 101)):
        d.point((rx, ry), fill=M[0])
        d.point((rx + 1, ry), fill=M[2])
        d.point((rx, ry + 1), fill=M[2])
        d.point((rx + 1, ry + 1), fill=M[3])
    # panel recesado con las 4 ruedas
    d.rectangle(PANEL, fill=M[3], outline=OUTLINE)
    hline(d, PANEL[0] + 1, PANEL[3] - 1, PANEL[2] - PANEL[0] - 1, M[1])
    hline(d, PANEL[0] + 1, PANEL[1] + 1, PANEL[2] - PANEL[0] - 1, OUTLINE)
    for x, pat, off in zip(WHEEL_X0, DIGIT_MARKS, offsets):
        wheel(d, x, pat, off)
    # flechas brass que marcan la fila de lectura (parte fija del cuerpo)
    vline(d, 24, 75, 5, BRASS[1])
    vline(d, 25, 76, 3, BRASS[1])
    d.point((26, 77), fill=BRASS[0])
    d.point((24, 79), fill=BRASS[2])
    vline(d, 102, 75, 5, BRASS[1])
    vline(d, 101, 76, 3, BRASS[1])
    d.point((100, 77), fill=BRASS[0])
    d.point((102, 79), fill=BRASS[2])
    # relieve de marca grabada (abajo a la derecha)
    hline(d, 84, 99, 13, M[2])
    hline(d, 84, 100, 13, M[0])
    hline(d, 84, 102, 8, M[2])
    hline(d, 84, 103, 8, M[0])
    flower_sticker(d)


def shackle_closed(sd: ImageDraw.ImageDraw) -> None:
    """Arco en U cerrado: ambas patas dentro de los ojales."""
    sd.rounded_rectangle([38, 8, 90, 60], radius=25, fill=M[2],
                         outline=OUTLINE, corners=(True, True, False, False))
    sd.rounded_rectangle([48, 18, 80, 60], radius=15, fill=ERASE,
                         corners=(True, True, False, False))
    sd.rounded_rectangle([48, 18, 80, 60], radius=15, outline=OUTLINE,
                         corners=(True, True, False, False))
    # luz arriba-izquierda del aro + sombra a la derecha
    sd.arc([41, 11, 87, 57], 185, 265, fill=M[1], width=3)
    sd.arc([43, 13, 85, 55], 205, 250, fill=M[0], width=1)
    sd.arc([42, 12, 86, 56], 215, 245, fill=GOLD[1], width=2)
    sd.arc([40, 10, 88, 58], 295, 350, fill=M[3], width=3)
    vline(sd, 39, 34, 14, M[1])
    vline(sd, 40, 34, 12, M[1])
    vline(sd, 87, 34, 14, M[3])
    vline(sd, 88, 34, 14, M[3])


def shackle_open(sd: ImageDraw.ImageDraw) -> None:
    """Arco levantado y girado: pata derecha dentro, extremo corto al aire."""
    sd.rounded_rectangle([44, 4, 90, 56], radius=22, fill=M[2],
                         outline=OUTLINE, corners=(True, True, False, False))
    sd.rounded_rectangle([54, 14, 80, 56], radius=12, fill=ERASE,
                         corners=(True, True, False, False))
    sd.rounded_rectangle([54, 14, 80, 56], radius=12, outline=OUTLINE,
                         corners=(True, True, False, False))
    # cortar la pata izquierda en diagonal: el extremo queda girado hacia
    # afuera (escalones de 1 px), como un arco que pivoto al abrirse
    sd.rectangle([43, 27, 55, 60], fill=ERASE)
    sd.rectangle([49, 25, 55, 26], fill=ERASE)
    hline(sd, 44, 26, 6, OUTLINE)
    hline(sd, 48, 25, 2, OUTLINE)
    d_cap = ((45, 23), (46, 23), (47, 23), (45, 24), (46, 24), (47, 24))
    for px, py in d_cap:
        sd.point((px, py), fill=M[1])
    sd.point((48, 24), fill=OUTLINE)
    # luz y sombra del aro
    sd.arc([47, 7, 87, 47], 185, 265, fill=M[1], width=3)
    sd.arc([49, 9, 85, 45], 205, 250, fill=M[0], width=1)
    sd.arc([48, 8, 86, 46], 215, 245, fill=GOLD[1], width=2)
    sd.arc([46, 6, 88, 48], 295, 350, fill=M[3], width=3)
    vline(sd, 87, 28, 18, M[3])
    vline(sd, 88, 28, 18, M[3])


def sparkle(d: ImageDraw.ImageDraw, cx: int, cy: int, r: int) -> None:
    """Destello dorado de 4 puntas (sin contorno: es luz, no objeto)."""
    for i in range(1, r + 1):
        c = GOLD[1] if i < r else GOLD[2]
        for dx, dy in ((i, 0), (-i, 0), (0, i), (0, -i)):
            d.point((cx + dx, cy + dy), fill=c)
    if r >= 3:
        for dx, dy in ((1, 1), (-1, -1), (1, -1), (-1, 1)):
            d.point((cx + dx, cy + dy), fill=GOLD[0])
    d.point((cx, cy), fill=GOLD[0])


def draw_lock(open_: bool) -> Image.Image:
    img, d = common.new_canvas(W, H)
    # sombra de contacto dithered (dentro del sprite)
    common.drop_shadow(d, 30, 120, 68, 2)
    common.drop_shadow(d, 44, 122, 40, 1)
    # ojal de la base (detras del cuerpo)
    d.rounded_rectangle([55, 103, 73, 118], radius=6, fill=M[2],
                        outline=OUTLINE)
    vline(d, 56, 106, 9, M[1])
    d.ellipse([61, 109, 67, 114], fill=ERASE)
    d.ellipse([61, 109, 67, 114], outline=OUTLINE)
    d.point((63, 115), fill=M[0])
    # arco en su propia capa, detras del cuerpo
    sh = Image.new("RGBA", (W, H), ERASE)
    sd = ImageDraw.Draw(sh)
    shackle_open(sd) if open_ else shackle_closed(sd)
    img.alpha_composite(sh)
    # cuerpo identico; solo cambia la fase de las ruedas
    draw_body(d, OFFSETS_ALIGNED if open_ else OFFSETS_SCRAMBLED)
    if open_:
        sparkle(d, 36, 32, 3)
        sparkle(d, 102, 12, 2)
        sparkle(d, 14, 56, 2)
    return img


def contact_sheets(closed: Image.Image, opened: Image.Image) -> None:
    both = Image.new("RGBA", (W * 2 + 12, H), ERASE)
    both.alpha_composite(closed, (0, 0))
    both.alpha_composite(opened, (W + 12, 0))
    common.preview(both, "preview_locks_both.png", scale=3)
    # chequeo de legibilidad a 64 px (tamano minimo en juego)
    tiny = Image.new("RGBA", (140, 70), ERASE)
    tiny.alpha_composite(closed.resize((64, 64), Image.NEAREST), (2, 3))
    tiny.alpha_composite(opened.resize((64, 64), Image.NEAREST), (72, 3))
    common.preview(tiny, "preview_locks_64px.png", scale=4)


def main() -> None:
    closed = draw_lock(open_=False)
    opened = draw_lock(open_=True)
    # QA: el cuerpo (todo lo que hay de y=46 hacia abajo dentro de BODY,
    # mas ojal y sombra) debe ser identico salvo la fase de las ruedas.
    box = (BODY[0], BODY[1], BODY[2] + 1, H)          # sparkles quedan fuera
    diff = [
        (x, y)
        for y in range(box[1], box[3])
        for x in range(box[0], box[2])
        if closed.getpixel((x, y)) != opened.getpixel((x, y))
        and not (PANEL[0] < x < PANEL[2] and PANEL[1] < y < PANEL[3])
    ]
    assert not diff, f"cuerpos divergen fuera del panel de ruedas: {diff[:8]}"
    common.save_asset(closed, "objects", "lock-closed.png")
    common.save_asset(opened, "objects", "lock-open.png")
    common.preview(closed, "preview_lock-closed.png")
    common.preview(opened, "preview_lock-open.png")
    contact_sheets(closed, opened)


if __name__ == "__main__":
    main()
