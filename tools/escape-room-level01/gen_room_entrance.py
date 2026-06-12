#!/usr/bin/env python3
"""Room 4 — la entrada (현관) del minbak. rooms/room-04-entrance.png, 320x240 opaco.

Pared hanji con vigas, puerta corrediza central retroiluminada por el amanecer
(la libertad al otro lado), ondol a media altura y genkan de piedra abajo.
Hotspots: note-final [140,80,40,30] (nota en hilo rojo), lock [150,110,30,40]
(candado de combinación, EL objeto), shoes [30,180,80,40] (sneakers + gomusin).
Colores: SOLO common.PAL + OUTLINE + SHADOW. Determinista (sin random).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common
from common import (PAL, OUTLINE, fill, frame, hline, vline, dither,
                    drop_shadow, hanji_wall)


def box(d, x, y, w, h, c):
    """fill + contorno OUTLINE en una llamada (atajo muy frecuente)."""
    fill(d, x, y, w, h, c)
    frame(d, x, y, w, h)

W, H = 320, 240
WOODL, WOODD = PAL["wood_light"], PAL["wood_dark"]
HANJI, FLOOR, GOLD = PAL["hanji"], PAL["floor"], PAL["gold_light"]
GRAY, METAL, BRASS = PAL["gray"], PAL["metal"], PAL["brass"]
RED, BLUE, GREEN = PAL["red"], PAL["blue"], PAL["green"]

# Geometría vertical de la escena (dos niveles del 현관)
ZOC_Y = 146            # zócalo de madera (6 px) en la unión pared/suelo
ONDOL_Y = 152          # suelo ondol (nivel alto)
RISER_Y = 170          # cara frontal del escalón
STONE_Y = 177          # piedra gris cálida (nivel bajo, genkan)

HOTSPOTS = [(140, 80, 40, 30), (150, 110, 30, 40), (30, 180, 80, 40)]


def blit(d, x, y, rows, cmap):
    """Pinta un mini-sprite definido como strings (determinista, legible)."""
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            c = cmap.get(ch)
            if c:
                d.point((x + i, y + j), fill=c)


# ── Fondo: pared, vigas, suelos ──────────────────────────────────────────────

def paint_wall(d):
    hanji_wall(d, 0, 0, W, ZOC_Y)
    # viga superior horizontal
    fill(d, 0, 0, W, 8, WOODL[1])
    hline(d, 0, 7, W, WOODL[3])
    hline(d, 0, 8, W, WOODD[3])
    # vigas verticales que enmarcan paneles hanji
    for bx in (0, 44, 256, 316):
        fill(d, bx, 8, 4, ZOC_Y - 8, WOODL[2])
        vline(d, bx, 8, ZOC_Y - 8, WOODL[3])
        vline(d, bx + 3, 8, ZOC_Y - 8, WOODD[3])
    # sombra cálida de apoyo cerca del zócalo (dither, nunca alpha)
    for sx in (0, 220):
        dither(d, sx, ZOC_Y - 8, 100, 8, HANJI[2])


def paint_floors(d):
    # zócalo (sólo a los lados; el centro lo tapa la puerta)
    fill(d, 0, ZOC_Y, W, ONDOL_Y - ZOC_Y, WOODL[2])
    hline(d, 0, ZOC_Y, W, WOODL[0])
    hline(d, 0, ONDOL_Y - 1, W, WOODD[3])
    # ondol: ramp floor + tablones sutiles
    fill(d, 0, ONDOL_Y, W, RISER_Y - ONDOL_Y, FLOOR[1])
    hline(d, 0, ONDOL_Y + 6, W, FLOOR[2])
    hline(d, 0, ONDOL_Y + 13, W, FLOOR[2])
    for i, gx in enumerate(range(6, W - 4, 37)):
        vline(d, gx, ONDOL_Y + 1 + (i * 5) % 11, 4, FLOOR[2])
        hline(d, gx + 9, ONDOL_Y + 3 + (i * 7) % 12, 3, FLOOR[0])
    # cara del escalón (riser de madera oscura)
    hline(d, 0, RISER_Y, W, FLOOR[0])           # canto iluminado
    fill(d, 0, RISER_Y + 1, W, STONE_Y - RISER_Y - 1, WOODD[1])
    for gx in range(8, W, 26):
        vline(d, gx, RISER_Y + 2, 4, WOODD[2])
    hline(d, 0, STONE_Y - 1, W, OUTLINE)
    # piedra gris cálida del genkan, con losas
    fill(d, 0, STONE_Y, W, H - STONE_Y, GRAY[1])
    joints = (0, 22, 47, 9, 36)
    for row, yy in enumerate(range(STONE_Y + 11, H, 15)):
        hline(d, 0, yy, W, GRAY[2])
        for gx in range(joints[row % 5], W, 56):
            top = max(yy - 14, STONE_Y)          # nunca sobre el escalón
            vline(d, gx, top, yy - top, GRAY[2])
    for i, yy in enumerate(range(STONE_Y + 3, H - 2, 5)):
        for xx in range((i * 17) % 13, W - 2, 27):
            d.point((xx, yy), fill=GRAY[0] if i % 3 else GRAY[3])
    dither(d, 0, H - 5, W, 5, GRAY[2])          # viñeta inferior


# ── Puerta corrediza central retroiluminada ──────────────────────────────────

def door_panel(d, x, y, w, h):
    """Panel corredizo: marco de madera, hanji retroiluminado, celosía."""
    box(d, x, y, w, h, WOODL[1])
    ix, iy, iw = x + 3, y + 3, w - 6
    lat_h = 104                                  # zona de celosía
    fill(d, ix, iy, iw, lat_h, GOLD[1])
    # gradiente de amanecer en bandas dithered (sol bajo = más luz abajo)
    dither(d, ix, iy, iw, 14, HANJI[1])
    dither(d, ix, iy + lat_h - 30, iw, 30, GOLD[0])
    # celosía (세살) a contraluz
    for gx in range(ix + 7, ix + iw - 2, 9):
        vline(d, gx, iy, lat_h, WOODL[3])
    for gy in range(iy + 12, iy + lat_h - 2, 17):
        hline(d, ix, gy, iw, WOODL[3])
    # travesaño medio + panel inferior de madera (zócalo de la puerta)
    fill(d, ix, iy + lat_h, iw, 6, WOODL[2])
    hline(d, ix, iy + lat_h, iw, WOODL[0])
    ky = iy + lat_h + 6
    kh = h - 6 - lat_h - 6
    fill(d, ix, ky, iw, kh, WOODL[1])
    frame(d, ix + 2, ky + 2, iw - 4, kh - 4, WOODL[3])
    hline(d, ix + 4, ky + kh // 2, iw - 8, WOODL[2])


def paint_door(d):
    # dintel y jambas (madera oscura estructural)
    fill(d, 96, 28, 128, 14, WOODD[1])
    hline(d, 96, 28, 128, WOODD[0])
    hline(d, 96, 41, 128, OUTLINE)
    vline(d, 96, 28, 14, OUTLINE)
    vline(d, 223, 28, 14, OUTLINE)
    for gx in range(102, 220, 21):
        hline(d, gx, 33, 6, WOODD[2])
    for px, hl in ((100, True), (214, False)):
        fill(d, px, 42, 6, 144, WOODD[1])
        vline(d, px if hl else px + 5, 42, 144, OUTLINE)
        vline(d, px + 1 if hl else px + 4, 42, 144, WOODD[0])
        vline(d, px + 5 if hl else px, 42, 144, WOODD[3])
    # dos paneles corredizos
    door_panel(d, 106, 42, 54, 143)
    door_panel(d, 160, 42, 54, 143)
    # rendija central: la luz dorada se cuela entre los paneles
    vline(d, 159, 46, 104, GOLD[0])
    vline(d, 160, 46, 104, GOLD[1])
    # rendijas laterales (dashes de luz cada 2 px)
    for yy in range(48, 148, 2):
        d.point((107, yy), fill=GOLD[1])
        d.point((212, yy), fill=GOLD[1])
    # riel inferior + luz que se cuela por debajo de la puerta
    fill(d, 100, 185, 120, 4, WOODD[2])
    hline(d, 100, 185, 120, WOODD[0])
    hline(d, 100, 188, 120, WOODD[3])
    dither(d, 116, 185, 88, 3, GOLD[1])
    dither(d, 148, 185, 32, 3, GOLD[0], phase=1)


def paint_light_pool(d):
    """Charco trapezoidal de luz de amanecer sobre la piedra + rayos."""
    y0, y1 = 189, 236
    for yy in range(y0, y1):
        t = (yy - y0) / (y1 - y0)
        lx, rx = int(110 - 26 * t), int(210 + 26 * t)
        for xx in range(lx + (yy % 2), rx, 2):
            d.point((xx, yy), fill=GOLD[1])
        clx, crx = int(142 - 15 * t), int(178 + 15 * t)
        for xx in range(clx + ((yy + 1) % 2), crx, 2):
            d.point((xx, yy), fill=GOLD[0])
    # tres rayos dithered que abanican desde la puerta
    for x_top, x_bot in ((132, 112), (160, 160), (188, 208)):
        for i in range(0, 46, 2):
            yy = y0 + i
            xx = x_top + (x_bot - x_top) * i // 46
            d.point((xx, yy), fill=GOLD[0])
            d.point((xx + 1, yy + 1), fill=GOLD[0])


# ── Props de pared ───────────────────────────────────────────────────────────

def scroll(d):
    """Rollo colgante de caligrafía (garabatos ilegibles, sin texto real)."""
    box(d, 12, 36, 30, 5, WOODD[2])
    fill(d, 16, 41, 22, 62, HANJI[0])
    vline(d, 16, 41, 62, HANJI[2])
    vline(d, 37, 41, 62, HANJI[2])
    ink = WOODD[3]
    for k, sx in enumerate((21, 27, 33)):
        yy = 46 + (k * 3) % 5
        while yy < 96:
            seg = 3 + (sx * yy) % 5
            vline(d, sx + (yy % 2), yy, seg, ink)
            d.point((sx - 1 + (yy % 3), yy + seg), fill=ink)
            yy += seg + 3
    box(d, 12, 103, 30, 5, WOODD[2])
    d.point((11, 105), fill=WOODD[3])
    d.point((42, 105), fill=WOODD[3])


def key_board(d):
    """Tabla con ganchos y llaves viejas; un gancho vacío (pista muda)."""
    box(d, 58, 60, 36, 34, WOODL[1])
    frame(d, 60, 62, 32, 30, WOODL[3])
    vline(d, 59, 61, 32, WOODL[0])
    for px in (65, 75, 85):
        fill(d, px, 67, 3, 2, BRASS[2])
        d.point((px + 1, 69), fill=BRASS[3])
    for kx in (64, 74):                          # dos llaves; el 3º vacío
        d.rectangle([kx, 70, kx + 4, 74], outline=BRASS[2])
        d.point((kx + 2, 72), fill=HANJI[1])     # ojo de la anilla
        vline(d, kx + 2, 75, 11, BRASS[1])
        vline(d, kx + 3, 75, 11, BRASS[3])
        hline(d, kx + 3, 81, 3, BRASS[1])        # dientes
        hline(d, kx + 3, 84, 4, BRASS[1])
    dither(d, 60, 95, 34, 2, HANJI[2])           # sombra suave en la pared


def pepper_string(d):
    """Ristra de pimientos secos colgada de la viga (casa de halmeoni)."""
    vline(d, 73, 8, 9, WOODD[3])
    vline(d, 73, 17, 30, BRASS[2])               # trenza de paja
    for i, (px, py) in enumerate(((69, 19), (74, 26), (68, 33), (73, 40))):
        d.line([(73, py - 2), (px + 2, py)], fill=GREEN[2])
        d.ellipse([px, py, px + 4, py + 7], fill=RED[1], outline=RED[3])
        vline(d, px + 1, py + 2, 4 + (i % 2), RED[0])


def lantern(d):
    """Farol de papel junto a la puerta, encendido aún del alba."""
    cx, cy = 237, 64
    for yy in range(cy - 17, cy + 18):           # halo dithered en la pared
        for xx in range(cx - 17 + (yy % 2), cx + 18, 2):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= 17 * 17:
                d.point((xx, yy), fill=GOLD[1])
    vline(d, cx, 8, 42, WOODD[3])                # cordón desde la viga
    fill(d, 227, 50, 21, 32, GOLD[1])
    dither(d, 229, 56, 17, 20, GOLD[0])
    frame(d, 227, 50, 21, 32)
    fill(d, 230, 47, 15, 5, RED[2])              # capuchón superior
    frame(d, 230, 47, 15, 5)
    fill(d, 230, 80, 15, 4, RED[3])              # base
    frame(d, 230, 80, 15, 4)
    for gy in (57, 64, 71, 77):                  # costillas de papel
        hline(d, 228, gy, 19, WOODL[3])
    vline(d, 237, 84, 6, RED[1])                 # borla
    d.point((237, 90), fill=RED[2])


def photo_frame(d):
    """Foto familiar pequeña sobre la pared derecha."""
    box(d, 286, 66, 20, 24, WOODL[2])
    fill(d, 289, 69, 14, 18, HANJI[0])
    fill(d, 292, 76, 4, 8, GRAY[2])              # halmeoni
    d.ellipse([292, 73, 295, 76], fill=GRAY[2])
    fill(d, 297, 74, 4, 10, GRAY[3])             # acompañante
    d.ellipse([297, 71, 300, 74], fill=GRAY[3])
    hline(d, 289, 84, 14, GOLD[1])               # luz del alba en la foto


# ── Props de suelo ───────────────────────────────────────────────────────────

def cushion(d):
    d.rounded_rectangle([10, 154, 37, 166], radius=4, fill=RED[1],
                        outline=OUTLINE)
    hline(d, 15, 156, 18, RED[0])
    fill(d, 12, 162, 24, 3, RED[2])
    hline(d, 14, 165, 20, RED[3])
    fill(d, 23, 158, 2, 2, BRASS[1])             # botón central
    drop_shadow(d, 12, 167, 24)


def broom(d):
    d.line([(57, 86), (52, 148)], fill=WOODD[2], width=2)
    d.point((57, 85), fill=OUTLINE)
    fill(d, 47, 148, 11, 4, RED[2])              # atadura
    frame(d, 47, 148, 11, 4)
    d.polygon([(47, 152), (57, 152), (61, 167), (43, 167)],
              fill=BRASS[1], outline=OUTLINE)
    for bx in (47, 50, 53, 56):
        vline(d, bx, 153, 13, BRASS[2])
    drop_shadow(d, 44, 168, 19)


def onggi_jar(d):
    """Tinaja onggi en la esquina derecha del genkan."""
    d.ellipse([284, 200, 313, 233], fill=WOODD[1], outline=OUTLINE)
    box(d, 292, 196, 14, 6, WOODD[2])
    d.ellipse([289, 191, 308, 199], fill=WOODD[2], outline=OUTLINE)
    hline(d, 293, 193, 10, WOODD[0])             # brillo de la tapa
    hline(d, 290, 199, 18, WOODD[0])             # canto del plato-tapa
    hline(d, 287, 216, 4, WOODD[3])
    hline(d, 307, 216, 4, WOODD[3])
    dither(d, 289, 205, 4, 20, WOODD[0])         # brillo cálido del alba
    drop_shadow(d, 286, 232, 26)


def shoe_cabinet(d):
    """신발장 bajo, de madera clara, con planta encima."""
    box(d, 272, 112, 42, 54, WOODL[1])
    hline(d, 273, 113, 40, WOODL[0])
    hline(d, 273, 118, 40, WOODL[3])
    for dx in (277, 295):
        frame(d, dx, 122, 14, 34, WOODL[3])
        fill(d, dx + 2, 124, 10, 30, HANJI[1])
        for gy in range(126, 152, 6):
            hline(d, dx + 2, gy, 10, HANJI[2])
    fill(d, 292, 138, 2, 3, BRASS[1])
    fill(d, 297, 138, 2, 3, BRASS[1])
    fill(d, 273, 160, 40, 5, WOODL[2])           # base
    fill(d, 277, 165, 4, 2, OUTLINE)             # patas
    fill(d, 305, 165, 4, 2, OUTLINE)
    drop_shadow(d, 273, 167, 41)
    # planta pequeña encima
    fill(d, 283, 101, 12, 10, RED[2])
    hline(d, 282, 101, 14, RED[1])
    fill(d, 283, 108, 12, 3, RED[3])
    frame(d, 282, 100, 14, 12)
    for bb, c in (([279, 88, 289, 99], GREEN[1]), ([286, 85, 296, 96],
                  GREEN[1]), ([284, 92, 297, 101], GREEN[2])):
        d.ellipse(bb, fill=c, outline=GREEN[3])
    for pt in ((283, 91), (290, 88), (293, 95)):
        d.point(pt, fill=GREEN[0])


def umbrella_stand(d):
    """Paragüero con paraguas de papel oleado coreano (rojo) y bastón."""
    # paraguas de papel oleado cerrado, punta arriba: silueta con barriga,
    # pliegues verticales y cinta de atado (sin aros horizontales)
    d.polygon([(250, 142), (254, 142), (258, 156), (260, 178), (257, 184),
               (247, 184), (244, 178), (246, 156)],
              fill=RED[1], outline=OUTLINE)
    for p0, p1, c in (((250, 146), (247, 182), RED[2]),   # pliegues
                      ((252, 146), (252, 182), HANJI[1]),  # lomo iluminado
                      ((254, 146), (257, 182), RED[2]),
                      ((255, 152), (259, 180), RED[3]),
                      ((249, 152), (245, 180), RED[3])):
        d.line([p0, p1], fill=c)
    fill(d, 246, 158, 12, 3, BRASS[2])            # cinta de atado
    hline(d, 246, 158, 12, BRASS[0])
    frame(d, 245, 157, 14, 5)
    fill(d, 250, 134, 4, 8, BRASS[2])             # contera de latón
    frame(d, 250, 134, 4, 8)
    d.point((251, 135), fill=BRASS[0])
    vline(d, 251, 184, 12, WOODD[2])              # mango hacia el paragüero
    vline(d, 252, 184, 12, WOODD[3])
    d.line([(267, 154), (263, 196)], fill=WOODL[3], width=2)  # bastón
    fill(d, 264, 151, 5, 3, WOODL[2])             # empuñadura curva
    frame(d, 264, 151, 5, 3)
    # cuerpo del paragüero
    box(d, 242, 194, 30, 36, WOODD[1])
    fill(d, 245, 196, 24, 3, OUTLINE)             # boca oscura
    hline(d, 243, 201, 28, WOODD[0])
    hline(d, 243, 212, 28, WOODD[3])
    hline(d, 243, 222, 28, WOODD[3])
    dither(d, 245, 203, 4, 24, WOODD[0])
    drop_shadow(d, 243, 230, 28)


def door_mat(d):
    box(d, 128, 198, 64, 18, BRASS[1])
    frame(d, 130, 200, 60, 14, BRASS[3])
    for gy in (203, 207, 211):
        hline(d, 132, gy, 56, BRASS[2])
    for gx in range(136, 184, 8):
        vline(d, gx, 201, 12, BRASS[2])
    dither(d, 132, 201, 56, 12, GOLD[0])          # sol sobre el tejido


# ── Hotspots ─────────────────────────────────────────────────────────────────

SNEAKER = (
    "....OOOO",
    "...ObBBbO",
    "...ObbbbO",
    "...ObbbbOOOOOOOOOO",
    "..ObbbbbbbbbbbbbbbOO",
    "..ObLbbLbbLbbbbbbbbwO",
    ".ObbbbbbbbbbbbbbwwwwO",
    "OwwbbbbbbbbbbwwwwwwwO",
    "OwwwwwwwwwwwwwwwwwwwO",
    "OsssssssssssssssssssO",
    ".OOOOOOOOOOOOOOOOOOO",
)

GOMUSIN = (
    "...............OO.",
    ".OOOOOOOOOOOOOOccO",
    "OcciiiiiiiiiicOccO",
    "OcrrrrrrrrrrrccccO",
    "OccccccccccccccccO",
    "OhhhhhhhhhhhhhhhhO",
    ".OOOOOOOOOOOOOOOO.",
)


def shoes(d):
    """Hotspot cultural: sneakers del jugador vs gomusin de halmeoni."""
    cm_sneaker = {"O": OUTLINE, "b": BLUE[1], "B": BLUE[0],
                  "L": HANJI[0], "w": HANJI[0], "s": HANJI[2]}
    cm_slipper = {"O": OUTLINE, "c": HANJI[0], "r": RED[1], "h": HANJI[2],
                  "i": WOODD[3]}                 # interior oscuro abierto
    # sneakers tiradas con prisa vs gomusin perfectamente alineadas
    for sx, sy, rows, cm, sw in ((38, 183, SNEAKER, cm_sneaker, 20),
                                 (31, 192, SNEAKER, cm_sneaker, 20),
                                 (71, 197, GOMUSIN, cm_slipper, 17),
                                 (90, 197, GOMUSIN, cm_slipper, 17)):
        drop_shadow(d, sx + 2, sy + len(rows) - 1, sw)
        blit(d, sx, sy, rows, cm)


def note_final(d):
    """Nota hanji colgada de un hilo rojo desde el dintel, algo girada."""
    d.line([(161, 42), (159, 81)], fill=RED[1])
    d.line([(162, 42), (160, 81)], fill=RED[2])
    d.polygon([(144, 84), (175, 81), (177, 102), (146, 105)],
              fill=HANJI[0], outline=OUTLINE)
    d.line([(146, 103), (176, 100)], fill=HANJI[2])  # sombra del doblez
    fill(d, 157, 81, 5, 3, RED[2])               # nudo del hilo
    frame(d, 157, 81, 5, 3)
    ink = WOODD[3]                                # garabatos ilegibles
    d.line([(149, 88), (168, 86)], fill=ink)
    d.line([(150, 92), (171, 90)], fill=ink)
    d.line([(149, 96), (163, 95)], fill=ink)
    fill(d, 168, 95, 4, 4, RED[2])                # sello rojo
    d.point((169, 96), fill=RED[1])


def combo_lock(d):
    """Candado de combinación moderno: EL objeto del nivel, máximo contraste."""
    # pletina que une ambos paneles
    box(d, 154, 114, 22, 9, METAL[2])
    hline(d, 155, 115, 20, METAL[0])
    d.point((156, 118), fill=OUTLINE)             # tornillos
    d.point((173, 118), fill=OUTLINE)
    # arco oscuro (U gruesa con contorno exterior)
    for x0 in (156, 170):                         # patas del arco
        fill(d, x0, 109, 4, 13, METAL[3])
    fill(d, 158, 107, 14, 4, METAL[3])
    hline(d, 158, 106, 14, OUTLINE)
    for px in (155, 174):
        vline(d, px, 108, 14, OUTLINE)
        d.point((px + (1 if px == 155 else -1), 107), fill=OUTLINE)
        vline(d, px + (2 if px == 155 else -3), 110, 11, METAL[2])  # reflejo
    # cuerpo
    box(d, 152, 120, 26, 27, METAL[1])
    hline(d, 153, 121, 24, METAL[0])
    vline(d, 153, 121, 25, METAL[0])
    fill(d, 153, 144, 24, 3, METAL[3])
    # 4 ruedas de código en banda rebajada
    box(d, 154, 128, 22, 11, METAL[3])
    for i in range(4):
        wx = 156 + i * 5
        fill(d, wx, 129, 4, 9, METAL[1])
        vline(d, wx + 4, 129, 9, OUTLINE)         # separador de ruedas
        hline(d, wx, 129, 4, METAL[2])            # bisel superior
        hline(d, wx + 1, 133, 2, OUTLINE)         # dígito ilegible
        hline(d, wx, 137, 4, METAL[2])            # bisel inferior
    vline(d, 155, 129, 9, OUTLINE)
    fill(d, 163, 141, 4, 2, RED[2])               # marca de alineación
    # sombra del candado sobre la puerta iluminada
    dither(d, 154, 148, 24, 3, WOODL[3], phase=1)


# ── Montaje ──────────────────────────────────────────────────────────────────

def main():
    img, d = common.new_canvas(W, H, bg=HANJI[1])
    # orden: fondo → props de pared → puerta → luz → props de suelo →
    # hotspots centrales al final (máxima atención)
    for paint in (paint_wall, paint_floors, scroll, key_board, pepper_string,
                  lantern, photo_frame, paint_door, paint_light_pool, cushion,
                  broom, onggi_jar, shoe_cabinet, umbrella_stand, door_mat,
                  shoes, note_final, combo_lock):
        paint(d)
    common.save_asset(img, "rooms", "room-04-entrance.png")
    common.preview(img, "preview_room_entrance.png")
    common.hotspot_debug(img, HOTSPOTS, "debug_room-04-entrance.png")


if __name__ == "__main__":
    main()
