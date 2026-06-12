#!/usr/bin/env python3
"""Close-ups del puzzle Slot 3 (cocina): nevera, mesa con pan y alacena.

128x128, fondo transparente, objeto centrado ~80-90 % del canvas, contorno
common.OUTLINE en la silueta y sombra de contacto dithered dentro del sprite.

Consistencia critica con room-03-kitchen.png (pintada en paralelo):
- nevera CREMA (ramp hanji, puerta hanji[1]) con tirador de metal
- mantel de RAYAS ROJAS (PAL red sobre hanji)
- alacena de wood_light con tazas azul / roja / crema

Solo colores de common.PAL (ningun tono derivado nuevo). Determinista: sin random.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import common
from common import OUTLINE, PAL, dither, fill, frame, hline, vline

W = H = 128

WOOD = PAL["wood_light"]
WOODD = PAL["wood_dark"]
HANJI = PAL["hanji"]
GOLD = PAL["gold_light"]
RED = PAL["red"]
BLUE = PAL["blue"]
METAL = PAL["metal"]
BRASS = PAL["brass"]
GREEN = PAL["green"]
SH = common.SHADOW[:3] + (255,)
CLEAR = (0, 0, 0, 0)


def clear_px(img, points):
    """Redondea esquinas borrando pixeles sueltos del contorno."""
    px = img.load()
    for x, y in points:
        px[x, y] = CLEAR


# ──────────────────────────────────────────────────────────────────────────────
# obj-fridge — 냉장고에 사과가 있어요 (la MANZANA protagonista)
# ──────────────────────────────────────────────────────────────────────────────

def sprite_fridge():
    """Nevera crema abierta con la MANZANA protagonista.

    Licencia de close-up (decision deliberada): room-03-kitchen.png muestra la
    nevera de DOS puertas (congelador arriba); aqui se abre una sola puerta de
    altura completa para que la cavidad iluminada y la manzana a altura de ojos
    dominen el canvas. Se conservan los criticos compartidos: cuerpo crema
    (ramp hanji), tirador de metal y bisagra a la izquierda.
    """
    img, d = common.new_canvas(W, H)

    # sombra de contacto
    dither(d, 22, 117, 92, 3, SH, phase=1)

    # ── puerta abierta (cara interior crema, panel izquierdo) ──
    fill(d, 18, 14, 26, 98, HANJI[1])            # x18..43, y14..111
    vline(d, 19, 15, 96, HANJI[0])
    hline(d, 19, 15, 24, HANJI[0])
    dither(d, 39, 16, 4, 94, HANJI[2])           # oclusion hacia la bisagra
    dither(d, 41, 30, 2, 56, GOLD[0], phase=1)   # luz dorada que escapa
    for ry in (40, 76):                          # estantes de la puerta
        fill(d, 21, ry, 20, 2, HANJI[2])
        fill(d, 21, ry + 2, 20, 4, METAL[1])
        hline(d, 21, ry + 2, 20, METAL[0])
        frame(d, 21, ry + 2, 20, 4)
    # botellita verde (estante superior de la puerta)
    fill(d, 26, 27, 7, 13, GREEN[1])
    vline(d, 27, 28, 11, GREEN[0])
    fill(d, 28, 23, 3, 4, GREEN[2])
    frame(d, 26, 27, 7, 13)
    frame(d, 28, 22, 3, 5)
    # tarrito de salsa (estante inferior de la puerta)
    fill(d, 28, 66, 8, 10, BRASS[1])
    vline(d, 29, 67, 8, BRASS[0])
    hline(d, 29, 66, 6, BRASS[0])
    fill(d, 30, 63, 4, 3, WOODD[2])
    frame(d, 28, 66, 8, 10)
    frame(d, 30, 62, 4, 4)
    frame(d, 18, 14, 26, 98)                     # contorno de la puerta
    clear_px(img, [(18, 14), (43, 14), (18, 111), (43, 111)])
    # tirador de metal (barra vertical en el canto exterior; arranca en x11
    # para que el sprite alcance el 80 % del ancho del canvas)
    fill(d, 11, 38, 7, 32, METAL[1])
    vline(d, 12, 39, 30, METAL[0])
    vline(d, 16, 39, 30, METAL[2])
    frame(d, 11, 38, 7, 32)
    clear_px(img, [(11, 38), (17, 38), (11, 69), (17, 69)])

    # ── cuerpo de la nevera ──
    fill(d, 44, 10, 68, 106, HANJI[1])           # x44..111, y10..115
    hline(d, 45, 11, 66, HANJI[0])
    hline(d, 45, 12, 66, HANJI[0])
    vline(d, 109, 13, 100, HANJI[2])
    vline(d, 110, 12, 102, HANJI[2])
    hline(d, 45, 113, 66, HANJI[3])              # zocalo
    hline(d, 45, 114, 66, HANJI[2])
    # flecks sutiles sobre el esmalte crema
    for i, (fx, fy) in enumerate(((47, 30), (46, 58), (47, 88), (108, 40), (107, 72))):
        d.point((fx, fy), fill=HANJI[0] if i % 2 else HANJI[2])

    # ── cavidad iluminada ──
    fill(d, 48, 18, 60, 90, HANJI[0])            # x48..107, y18..107
    dither(d, 50, 20, 56, 86, GOLD[0])
    dither(d, 52, 47, 52, 27, GOLD[1], phase=1)  # banda calida a la altura de los ojos
    # oclusion en los bordes de la cavidad
    vline(d, 48, 18, 90, HANJI[2])
    vline(d, 107, 18, 90, HANJI[2])
    hline(d, 48, 18, 60, HANJI[2])
    dither(d, 49, 19, 58, 2, HANJI[3], phase=1)
    # suelo interior
    fill(d, 48, 103, 60, 5, HANJI[2])
    hline(d, 48, 103, 60, HANJI[3])

    # ── estantes de metal ──
    for sy in (44, 74):
        hline(d, 48, sy, 60, METAL[0])
        hline(d, 48, sy + 1, 60, METAL[1])
        hline(d, 48, sy + 2, 60, METAL[3])

    # ── compartimento superior: botella de leche + huevos en bandeja ──
    dither(d, 56, 43, 13, 1, HANJI[2])
    fill(d, 56, 30, 12, 13, HANJI[0])
    vline(d, 66, 31, 11, HANJI[2])
    fill(d, 57, 35, 10, 4, BLUE[1])
    hline(d, 57, 35, 10, BLUE[0])
    fill(d, 59, 26, 6, 4, HANJI[0])
    fill(d, 59, 24, 6, 3, METAL[1])
    frame(d, 56, 30, 12, 13)
    frame(d, 59, 26, 6, 4)
    frame(d, 59, 23, 6, 4)
    d.ellipse([79, 35, 87, 43], fill=HANJI[0], outline=OUTLINE)  # huevo trasero
    d.ellipse([73, 37, 81, 44], fill=HANJI[0], outline=OUTLINE)  # huevo delantero
    d.point((75, 39), fill=HANJI[1])
    d.point((84, 37), fill=HANJI[1])
    d.point((79, 42), fill=HANJI[2])
    fill(d, 72, 42, 18, 2, HANJI[2])             # bandejita de los huevos
    frame(d, 71, 41, 20, 3)

    # ── compartimento central: LA MANZANA (protagonista, halo dorado) ──
    dither(d, 48, 47, 60, 26, GOLD[1])           # toda la balda banada en luz
    dither(d, 62, 50, 32, 22, GOLD[1], phase=1)  # halo denso tras la manzana
    dither(d, 66, 53, 24, 17, GOLD[0], phase=1)  # nucleo del halo
    d.ellipse([67, 52, 89, 72], fill=RED[2], outline=OUTLINE)
    d.ellipse([68, 53, 86, 69], fill=RED[1])
    d.ellipse([71, 55, 78, 61], fill=RED[0])
    d.point((72, 56), fill=HANJI[0])
    d.point((73, 56), fill=HANJI[0])
    fill(d, 77, 48, 2, 5, WOODD[2])              # rabito
    d.polygon([(80, 49), (86, 46), (83, 51)], fill=GREEN[1], outline=OUTLINE)
    d.point((83, 48), fill=GREEN[0])
    dither(d, 69, 73, 19, 1, HANJI[2])           # sombra sobre el estante

    # ── compartimento inferior: frasco de kimchi + platito de namul ──
    fill(d, 64, 86, 19, 17, RED[1])              # kimchi tras el vidrio
    for cx, cy in ((67, 90), (73, 94), (78, 89), (70, 99), (76, 98), (80, 95)):
        d.point((cx, cy), fill=RED[3])
        d.point((cx + 1, cy), fill=RED[2])
    d.point((69, 92), fill=GREEN[2])
    d.point((77, 101), fill=GREEN[2])
    fill(d, 64, 86, 19, 3, HANJI[0])             # espacio de aire
    vline(d, 66, 87, 15, HANJI[0])               # brillo del vidrio
    fill(d, 66, 80, 15, 6, BRASS[1])             # tapa de laton
    hline(d, 67, 80, 13, BRASS[0])
    hline(d, 66, 84, 15, BRASS[2])
    frame(d, 66, 80, 15, 6)
    frame(d, 64, 86, 19, 17)
    dither(d, 65, 102, 17, 1, HANJI[3])
    # platito con namul
    fill(d, 88, 97, 13, 6, HANJI[1])
    hline(d, 89, 97, 11, HANJI[0])
    fill(d, 90, 94, 9, 4, GREEN[1])
    d.point((92, 95), fill=GREEN[0])
    d.point((96, 96), fill=GREEN[2])
    frame(d, 88, 97, 13, 6)

    # ── contorno del cuerpo ──
    frame(d, 44, 10, 68, 106)
    clear_px(img, [(44, 10), (111, 10), (44, 115), (111, 115)])
    return img


# ──────────────────────────────────────────────────────────────────────────────
# obj-table-bread — 식탁에 빵이 있어요 (la HOGAZA protagonista)
# ──────────────────────────────────────────────────────────────────────────────

def sprite_table_bread():
    img, d = common.new_canvas(W, H)

    # sombra de contacto en el suelo
    dither(d, 18, 120, 94, 3, SH, phase=1)

    # ── patas y travesano ──
    for lx in (22, 96):
        fill(d, lx, 90, 10, 30, WOOD[1])         # y90..119
        vline(d, lx + 1, 91, 28, WOOD[0])
        vline(d, lx + 8, 91, 28, WOOD[3])
        hline(d, lx + 3, 100, 4, WOOD[2])        # veta
        hline(d, lx + 2, 112, 5, WOOD[2])
        frame(d, lx, 90, 10, 30)
    fill(d, 32, 106, 64, 5, WOOD[2])
    hline(d, 32, 106, 64, WOOD[1])
    hline(d, 32, 110, 64, WOOD[3])
    frame(d, 32, 106, 64, 5)

    # ── mantel de rayas rojas ──
    fill(d, 14, 48, 100, 43, HANJI[1])           # x14..113, y48..90
    fill(d, 14, 48, 100, 14, HANJI[0])           # cara superior y48..61
    for sx in range(20, 110, 12):                # rayas verticales
        fill(d, sx, 48, 4, 43, RED[1])
        vline(d, sx, 48, 43, RED[0])
        hline(d, sx, 88, 4, RED[2])
        hline(d, sx, 89, 4, RED[2])
    hline(d, 14, 61, 100, HANJI[2])              # pliegue del borde de la mesa
    for sx in range(20, 110, 12):
        hline(d, sx, 61, 4, RED[2])
    hline(d, 15, 88, 98, HANJI[2])               # sombra del dobladillo
    hline(d, 15, 89, 98, HANJI[2])
    for fx in (38, 84):                          # caidas de tela
        vline(d, fx, 63, 25, HANJI[2])
    frame(d, 14, 48, 100, 43)
    clear_px(img, [(14, 48), (113, 48), (14, 90), (113, 90)])

    # ── plato ──
    d.ellipse([28, 44, 88, 66], fill=HANJI[0], outline=OUTLINE)
    d.ellipse([34, 47, 82, 63], fill=HANJI[1])
    d.ellipse([38, 49, 78, 61], fill=HANJI[0])
    dither(d, 34, 66, 48, 2, SH, phase=1)        # sombra del plato sobre el mantel

    # ── hogaza dorada (protagonista) ──
    d.ellipse([34, 16, 80, 58], fill=BRASS[2], outline=OUTLINE)
    d.ellipse([35, 17, 78, 53], fill=BRASS[1])
    d.ellipse([39, 20, 72, 42], fill=GOLD[1])
    dither(d, 41, 40, 32, 6, GOLD[1])            # transicion suave de la corteza
    dither(d, 45, 22, 22, 8, GOLD[0], phase=1)   # brillo del horneado
    for i in range(3):                           # greñas: corte 2px + halo limpio
        # offsets horizontales (la diagonal es >45 grados): 4 lineas paralelas
        # que no se pisan al rasterizar -> corte oscuro continuo + labio pegado
        x0 = 44 + i * 9
        d.line([x0 - 1, 26 + i, x0 + 6, 35 + i], fill=GOLD[1])   # respira izq
        d.line([x0 + 2, 26 + i, x0 + 9, 35 + i], fill=GOLD[1])   # respira der
        d.line([x0, 26 + i, x0 + 7, 35 + i], fill=BRASS[3])      # corte tostado
        d.line([x0 + 1, 26 + i, x0 + 8, 35 + i], fill=GOLD[0])   # labio iluminado
    dither(d, 40, 54, 36, 3, BRASS[3])           # base tostada contra el plato
    # re-trazo del contorno: los rellenos interiores ([35,17,78,53] etc.)
    # rasterizan distinto y rompian el anillo OUTLINE en el arco superior-izq.
    d.ellipse([34, 16, 80, 58], outline=OUTLINE)

    # ── dos rebanadas apoyadas en la hogaza ──
    for i, (bx, by) in enumerate(((22, 32), (27, 37))):
        d.rounded_rectangle([bx, by, bx + 14, by + 22], radius=5,
                            fill=BRASS[2], outline=OUTLINE)
        d.rounded_rectangle([bx + 3, by + 3, bx + 11, by + 19], radius=3,
                            fill=GOLD[0])
        hline(d, bx + 4, by + 2, 7, BRASS[3])    # corteza superior tostada
        d.point((bx + 5, by + 8), fill=HANJI[1]) # miga aireada
        d.point((bx + 9, by + 12), fill=HANJI[1])
        d.point((bx + 6, by + 16), fill=GOLD[1])
        d.point((bx + 8, by + 6), fill=GOLD[1])
    dither(d, 24, 60, 18, 2, SH, phase=1)        # sombra de las rebanadas

    # ── cuchillo de madera (hoja plana + mango oscuro) ──
    fill(d, 89, 52, 17, 5, WOOD[0])              # hoja x89..105, y52..56
    hline(d, 90, 56, 15, WOOD[2])
    hline(d, 92, 54, 11, WOOD[1])                # veta
    frame(d, 89, 52, 17, 5)
    # punta redondeada: las esquinas caen SOBRE el mantel, asi que se repintan
    # con el color de debajo (nunca clear_px dentro del sprite -> agujeros)
    d.point((89, 52), fill=HANJI[0])
    d.point((89, 56), fill=HANJI[0])
    d.point((89, 53), fill=OUTLINE)
    d.point((89, 55), fill=OUTLINE)
    fill(d, 105, 51, 12, 7, WOODD[1])            # mango x105..116
    hline(d, 106, 52, 10, WOODD[0])
    hline(d, 106, 56, 10, WOODD[3])
    frame(d, 105, 51, 12, 7)
    d.point((105, 51), fill=RED[1])              # esquinas sobre la raya roja del
    d.point((105, 57), fill=RED[1])              # mantel (x104..107): se repintan
    clear_px(img, [(116, 51), (116, 57)])        # estas si caen sobre transparencia
    dither(d, 91, 58, 24, 1, SH, phase=1)        # sombra del cuchillo

    # migas
    for mx, my in ((84, 62), (92, 64), (98, 61)):
        d.point((mx, my), fill=BRASS[2])
    return img


# ──────────────────────────────────────────────────────────────────────────────
# obj-cupboard — 찬장에 컵이 있어요 (las TAZAS protagonistas)
# ──────────────────────────────────────────────────────────────────────────────

def draw_cup(d, x, ramp):
    """Taza de 13px con asa legible a la derecha; base apoyada en y55."""
    light, mid, dark = ramp
    # asa (anillo)
    d.rounded_rectangle([x + 11, 44, x + 17, 52], radius=3, outline=OUTLINE)
    d.rounded_rectangle([x + 12, 45, x + 16, 51], radius=2, outline=mid)
    # cuerpo
    d.rounded_rectangle([x, 41, x + 12, 55], radius=2, fill=mid, outline=OUTLINE)
    hline(d, x + 2, 42, 9, dark)                 # boca
    hline(d, x + 1, 43, 11, light)               # borde
    vline(d, x + 2, 45, 9, light)
    vline(d, x + 10, 45, 9, dark)
    dither(d, x + 1, 56, 11, 1, WOODD[3])        # sombra sobre la balda


def sprite_cupboard():
    img, d = common.new_canvas(W, H)

    # sombra contra la pared bajo el mueble
    dither(d, 30, 104, 68, 2, SH, phase=1)

    # ── puertas abiertas (caras interiores de madera clara) ──
    for px0 in (8, 100):
        fill(d, px0, 20, 20, 78, WOOD[0])        # y20..97
        fill(d, px0 + 3, 26, 14, 66, WOOD[1])    # panel rehundido
        frame(d, px0 + 3, 26, 14, 66, WOOD[2])
        vline(d, px0 + 4, 30, 10, WOOD[0])       # veta del panel
        vline(d, px0 + 9, 50, 14, WOOD[2])
        frame(d, px0, 20, 20, 78)
        clear_px(img, [(px0, 20), (px0 + 19, 20), (px0, 97), (px0 + 19, 97)])
    # tiradores de laton en el canto interior
    for kx in (25, 101):
        fill(d, kx, 56, 2, 5, BRASS[1])
        d.point((kx, 56), fill=BRASS[0])
        frame(d, kx - 1, 55, 4, 7)

    # ── cornisa y cuerpo ──
    fill(d, 26, 10, 76, 6, WOODD[1])             # cornisa x26..101, y10..15
    hline(d, 27, 11, 74, WOOD[1])
    frame(d, 26, 10, 76, 6)
    clear_px(img, [(26, 10), (101, 10)])
    fill(d, 30, 16, 68, 88, WOOD[1])             # cuerpo x30..97, y16..103
    vline(d, 31, 17, 86, WOOD[0])
    vline(d, 96, 17, 86, WOOD[3])
    hline(d, 31, 101, 66, WOOD[3])
    hline(d, 31, 102, 66, WOOD[2])
    for gx, gy in ((33, 40), (33, 70), (94, 50), (94, 84)):  # vetas del marco
        vline(d, gx, gy, 6, WOOD[2])

    # ── cavidad ──
    fill(d, 36, 22, 56, 76, HANJI[2])            # x36..91, y22..97
    dither(d, 36, 22, 56, 3, HANJI[3], phase=1)  # oclusion superior
    vline(d, 36, 22, 76, HANJI[3])
    vline(d, 91, 22, 76, HANJI[3])
    dither(d, 37, 23, 2, 74, HANJI[3])
    dither(d, 89, 23, 2, 74, HANJI[3], phase=1)

    # ── balda central con puntilla de papel ──
    fill(d, 36, 56, 56, 4, WOOD[2])              # y56..59
    hline(d, 36, 56, 56, WOOD[1])
    hline(d, 36, 59, 56, WOOD[3])
    for px_ in range(37, 91, 4):                 # puntilla hanji de la halmeoni
        fill(d, px_, 60, 3, 2, HANJI[0])
        d.point((px_ + 1, 62), fill=HANJI[0])

    # ── TAZAS protagonistas (azul / roja / crema) ──
    draw_cup(d, 38, (BLUE[0], BLUE[1], BLUE[2]))
    draw_cup(d, 55, (RED[0], RED[1], RED[2]))
    draw_cup(d, 72, (HANJI[0], HANJI[1], HANJI[3]))

    # ── compartimento inferior: platos apilados + cuencos ──
    for sy in (88, 83, 78, 73):
        d.ellipse([42, sy, 70, sy + 8], fill=HANJI[0], outline=OUTLINE)
        hline(d, 46, sy + 4, 21, HANJI[2])
        d.point((48, sy + 2), fill=HANJI[1])
    dither(d, 44, 96, 26, 1, HANJI[3])
    # dos cuencos con banda azul
    d.rounded_rectangle([75, 88, 89, 96], radius=3, fill=HANJI[1], outline=OUTLINE)
    hline(d, 77, 90, 11, BLUE[2])
    hline(d, 76, 89, 12, HANJI[0])
    d.rounded_rectangle([76, 81, 88, 89], radius=3, fill=HANJI[1], outline=OUTLINE)
    hline(d, 78, 83, 9, BLUE[2])
    hline(d, 77, 82, 10, HANJI[0])
    dither(d, 76, 96, 13, 1, HANJI[3])

    # ── barra bajo el mueble: pano de cocina + cucharon colgado ──
    for bx in (40, 84):                          # soportes de la barra
        fill(d, bx, 104, 3, 4, WOOD[2])
        frame(d, bx - 1, 103, 5, 6)
    fill(d, 37, 107, 54, 4, WOOD[1])             # barra x37..90, y107..110
    hline(d, 38, 108, 52, WOOD[0])
    frame(d, 37, 107, 54, 4)
    clear_px(img, [(37, 107), (90, 107), (37, 110), (90, 110)])
    # pano de cocina drapeado sobre la barra
    fill(d, 46, 105, 17, 19, HANJI[0])           # x46..62, y105..123
    vline(d, 54, 106, 17, HANJI[2])              # pliegue central
    hline(d, 47, 117, 15, RED[1])                # rayas del dobladillo
    hline(d, 47, 120, 15, RED[1])
    hline(d, 47, 122, 15, HANJI[2])
    frame(d, 46, 105, 17, 19)
    clear_px(img, [(46, 105), (62, 105), (46, 123), (62, 123)])
    # cucharon de madera enganchado a la barra (cazo achatado, mas ancho que alto)
    fill(d, 75, 109, 3, 7, WOOD[1])              # mango grueso desde la barra
    vline(d, 75, 109, 7, WOOD[0])
    frame(d, 74, 108, 5, 9)
    d.ellipse([69, 115, 84, 124], fill=WOOD[1], outline=OUTLINE)
    hline(d, 74, 116, 6, WOOD[0])                # brillo del borde superior
    d.ellipse([72, 118, 81, 123], fill=WOODD[2]) # hueco oscuro, alto contraste
    d.point((74, 119), fill=WOOD[2])

    # ── contorno del cuerpo ──
    frame(d, 30, 16, 68, 88)
    clear_px(img, [(30, 103), (97, 103)])
    return img


# ──────────────────────────────────────────────────────────────────────────────

def main():
    jobs = [
        (sprite_fridge, "obj-fridge"),
        (sprite_table_bread, "obj-table-bread"),
        (sprite_cupboard, "obj-cupboard"),
    ]
    sheet = common.Image.new("RGBA", (W * 3 + 16, H + 8), (60, 44, 30, 255))
    for i, (fn, name) in enumerate(jobs):
        img = fn()
        common.save_asset(img, "objects", f"{name}.png")
        common.preview(img, f"preview_{name}.png")
        sheet.paste(img, (4 + i * (W + 4), 4), img)
    common.preview(sheet, "preview_kitchen_objects_a_sheet.png", scale=2)


if __name__ == "__main__":
    main()
