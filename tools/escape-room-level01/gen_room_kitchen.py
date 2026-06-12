#!/usr/bin/env python3
"""Room 3 — la cocina (부엌) del minbak. Escena 320x240 opaca, 7 hotspots.

Estilo: Stardew Valley x Mother 3, amanecer dorado (ver STYLE.md).
Colores: SOLO common.PAL + OUTLINE + SHADOW. Tonos derivados: ninguno —
todo color sale tal cual de un ramp de PAL.
Determinista: sin random; todos los patrones son bucles fijos.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C
from common import (OUTLINE, PAL, SHADOW, dither, drop_shadow, fill, frame,
                    hanji_wall, hline, vline, wood_planks)

W, H = 320, 240
WALL_B = 148   # primera fila del zocalo
FLOOR_Y = 154  # primera fila del suelo ondol

WOODL = PAL["wood_light"]
WOODD = PAL["wood_dark"]
HANJI = PAL["hanji"]
FLOOR = PAL["floor"]
DAWN = PAL["dawn"]
GOLD = PAL["gold_light"]
GREEN = PAL["green"]
BLUE = PAL["blue"]
METAL = PAL["metal"]
BRASS = PAL["brass"]
RED = PAL["red"]
GRAY = PAL["gray"]

RECTS = [
    (10, 80, 70, 120),   # obj-fridge
    (30, 60, 40, 30),    # note-3
    (80, 30, 60, 60),    # obj-cupboard
    (150, 30, 30, 30),   # kitchen-clock
    (130, 130, 70, 60),  # obj-table
    (200, 100, 70, 60),  # obj-pot
    (220, 170, 60, 50),  # obj-bowl
]


# ── fondo: pared, vigas, zocalo, suelo ───────────────────────────────────────

def draw_back(d):
    hanji_wall(d, 0, 0, W, WALL_B)
    # dintel superior
    fill(d, 0, 0, W, 9, WOODL[1])
    hline(d, 0, 0, W, WOODL[0])
    hline(d, 0, 8, W, WOODL[3])
    for gx in range(6, W - 3, 27):
        hline(d, gx, 4, 4, WOODL[2])
    # vigas verticales enmarcando paneles hanji
    for bx in (0, 74, 144, 218, 314):
        fill(d, bx, 9, 6, WALL_B - 9, WOODL[1])
        vline(d, bx, 9, WALL_B - 9, WOODL[0])
        vline(d, bx + 5, 9, WALL_B - 9, WOODL[3])
        for gy in range(18 + (bx % 13), WALL_B - 4, 26):
            vline(d, bx + 2, gy, 4, WOODL[2])
    # sombra calida de contacto pared/zocalo
    dither(d, 0, WALL_B - 6, W, 6, HANJI[2], phase=1)
    # zocalo
    fill(d, 0, WALL_B, W, 6, WOODD[1])
    hline(d, 0, WALL_B, W, WOODD[0])
    hline(d, 0, WALL_B + 5, W, OUTLINE)
    # suelo ondol con tablones sutiles
    wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, FLOOR, plank_h=11, seam_every=2)


def draw_light_pool(d):
    """Charco de luz dorada dithered, sesgado desde la ventana (arriba dcha)."""
    for y in range(180, 239):
        x0 = 226 - int((y - 180) * 1.3)
        for x in range(max(x0, 4) + (y % 2), min(x0 + 92, W - 2), 2):
            d.point((x, y), fill=GOLD[1])
    for y in range(186, 235):
        x0 = 244 - int((y - 180) * 1.3)
        for x in range(max(x0, 4) + ((y + 1) % 2), min(x0 + 52, W - 2), 2):
            d.point((x, y), fill=GOLD[0])
    # vineta calida en la esquina opuesta a la luz
    for y in range(218, H - 1):
        for x in range(2 + (y % 2), 72 - (y % 3) * 8, 3):
            d.point((x, y), fill=FLOOR[2])


# ── ventana del amanecer (fuente de luz) ─────────────────────────────────────

def draw_window(d):
    x, y, w, h = 244, 20, 46, 52
    # halo dorado dithered sobre la pared
    dither(d, x - 5, y - 5, w + 10, h + 10, GOLD[0], phase=0)
    fill(d, x - 1, y - 1, w + 2, h + 2, OUTLINE)
    fill(d, x, y, w, h, WOODL[1])
    # cielo del alba (claro abajo, rosado arriba) en bandas + dither
    sx, sy, sw, sh = x + 3, y + 3, w - 6, h - 6
    bands = [(DAWN[3], 10), (DAWN[2], 10), (DAWN[1], 11), (DAWN[0], 8), (GOLD[0], 7)]
    yy = sy
    for c, bh in bands:
        fill(d, sx, yy, sw, bh, c)
        dither(d, sx, yy + bh - 1, sw, 2, c, phase=yy % 2)
        yy += bh
    # sol naciente asomando
    d.ellipse([sx + 4, sy + 33, sx + 18, sy + 47], fill=GOLD[0])
    d.ellipse([sx + 7, sy + 36, sx + 15, sy + 44], fill=GOLD[1])
    # travesanos
    fill(d, x + w // 2 - 1, sy, 2, sh, WOODL[2])
    fill(d, sx, y + h // 2 - 1, sw, 2, WOODL[2])
    frame(d, x + 2, y + 2, w - 4, h - 4, WOODL[3])
    # alfeizar que ancla la ventana a la pared
    fill(d, x - 3, y + h, w + 6, 4, WOODL[1])
    hline(d, x - 3, y + h, w + 6, WOODL[0])
    hline(d, x - 3, y + h + 3, w + 6, OUTLINE)
    vline(d, x - 3, y + h, 4, OUTLINE)
    vline(d, x + w + 2, y + h, 4, OUTLINE)


# ── props de pared ───────────────────────────────────────────────────────────

def draw_clock(d):
    cx, cy = 165, 45
    d.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], fill=BRASS[3])
    d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=BRASS[1])
    d.arc([cx - 12, cy - 12, cx + 12, cy + 12], 200, 320, fill=BRASS[0])
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=HANJI[0])
    d.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], outline=OUTLINE)
    for tx, ty in ((cx, cy - 7), (cx, cy + 7), (cx - 7, cy), (cx + 7, cy)):
        d.point((tx, ty), fill=OUTLINE)
    # 8:00 — minutero a las 12, horaria a las 8
    d.line([cx, cy, cx, cy - 7], fill=OUTLINE)
    d.line([cx, cy, cx - 4, cy + 3], fill=OUTLINE)
    d.point((cx, cy), fill=BRASS[2])


def draw_shelf(d):
    """Balda con botella de soja, tarro de especias y platillos."""
    fill(d, 150, 80, 38, 6, WOODL[1])
    hline(d, 150, 80, 38, WOODL[0])
    hline(d, 150, 85, 38, OUTLINE)
    vline(d, 153, 86, 4, WOODL[3])
    vline(d, 184, 86, 4, WOODL[3])
    # botella de soja
    fill(d, 154, 66, 6, 14, WOODD[2])
    vline(d, 154, 66, 14, WOODD[0])
    fill(d, 155, 63, 3, 3, WOODD[2])
    fill(d, 155, 61, 3, 2, BRASS[2])
    frame(d, 153, 65, 8, 15, OUTLINE)
    # tarro de especias con tapa roja
    fill(d, 165, 68, 8, 12, HANJI[1])
    hline(d, 166, 74, 6, HANJI[3])
    fill(d, 165, 66, 8, 3, RED[2])
    frame(d, 164, 65, 10, 15, OUTLINE)
    # platillos apilados
    for i, yy in enumerate(range(73, 80, 2)):
        hline(d, 177, yy, 9, GRAY[0] if i % 2 else GRAY[1])
    frame(d, 176, 72, 11, 8, OUTLINE)


def draw_towel(d):
    """Trapo azul doblado sobre una barrita de madera."""
    # barra con soportes
    hline(d, 181, 99, 21, WOODD[1])
    hline(d, 181, 100, 21, WOODD[3])
    d.point((180, 99), fill=OUTLINE)
    d.point((202, 99), fill=OUTLINE)
    d.point((182, 101), fill=OUTLINE)
    d.point((200, 101), fill=OUTLINE)
    vline(d, 199, 106, 18, HANJI[3])  # sombra sobre la pared
    # tela colgando de la barra
    frame(d, 183, 100, 15, 26, OUTLINE)
    fill(d, 184, 101, 13, 24, BLUE[0])
    hline(d, 184, 101, 13, BLUE[1])   # doblez sobre la barra
    hline(d, 184, 102, 13, BLUE[1])
    dither(d, 193, 103, 4, 21, BLUE[1], phase=1)
    d.line([186, 104, 188, 123], fill=BLUE[1])  # caida de pliegue
    hline(d, 184, 118, 13, BLUE[2])   # rayas del dobladillo
    hline(d, 184, 121, 13, BLUE[2])
    for nx in (186, 190, 194):        # dobladillo ondulado
        d.point((nx, 124), fill=BLUE[2])


def draw_wall_props(d):
    # cucharon de metal colgado
    d.point((98, 93), fill=BRASS[1])
    vline(d, 98, 94, 18, METAL[1])
    d.ellipse([94, 111, 103, 119], fill=METAL[2], outline=OUTLINE)
    d.point((97, 113), fill=METAL[0])
    # cuadrito enmarcado (paisaje al alba) en la pared vacia
    frame(d, 132, 102, 17, 15, OUTLINE)
    frame(d, 133, 103, 15, 13, WOODL[2])
    fill(d, 134, 104, 13, 6, DAWN[1])
    fill(d, 134, 110, 13, 4, GREEN[1])
    hline(d, 134, 110, 13, GREEN[0])
    d.point((137, 106), fill=GOLD[0])
    d.point((138, 106), fill=GOLD[0])
    fill(d, 142, 108, 3, 3, GREEN[3])
    # ristra de guindillas secas en un cordel
    d.point((121, 91), fill=OUTLINE)
    vline(d, 121, 92, 28, WOODD[3])
    for i, (px, side) in enumerate(((96, -1), (103, 1), (110, -1), (117, 1))):
        bx = 121 + (side * 2) - 2  # pegadas al cordel
        d.point((121 + side, px - 1), fill=GREEN[2])
        fill(d, bx, px, 4, 7, RED[1])
        vline(d, bx + 3, px + 1, 5, RED[3])
        d.point((bx + 1, px + 1), fill=RED[0])
        frame(d, bx - 1, px - 1, 6, 9, OUTLINE)


# ── fogon, salpicadero, olla ─────────────────────────────────────────────────

def draw_stove(d):
    # salpicadero de azulejos suaves
    bx, by, bw, bh = 202, 94, 72, 34
    fill(d, bx, by, bw, bh, GRAY[0])
    for gy in range(by, by + bh, 9):
        hline(d, bx, gy, bw, GRAY[1])
    for gx in range(bx, bx + bw + 1, 9):
        vline(d, gx, by, bh, GRAY[1])
    for ti, (tx, ty) in enumerate(((1, 1), (4, 2), (6, 0), (2, 3), (7, 2))):
        fill(d, bx + tx * 9 + 1, by + ty * 9 + 1, 8, 8, BLUE[0] if ti % 2 else HANJI[1])
    frame(d, bx - 1, by - 1, bw + 2, bh + 2, OUTLINE)
    # cuerpo del fogon
    fill(d, 204, 128, 68, 8, METAL[3])
    hline(d, 204, 128, 68, METAL[1])
    d.ellipse([256, 129, 268, 134], outline=METAL[1])
    fill(d, 204, 136, 68, 22, GRAY[1])
    fill(d, 210, 139, 36, 16, GRAY[2])
    fill(d, 212, 141, 32, 12, GRAY[1])
    hline(d, 214, 143, 28, METAL[1])
    for dx in (252, 258, 264):
        fill(d, dx, 140, 3, 3, BRASS[1])
    hline(d, 204, 157, 68, GRAY[3])
    frame(d, 204, 128, 68, 30, OUTLINE)
    drop_shadow(d, 204, 158, 68)


def steam(d, cx, y0, n):
    amp = (0, 1, 2, 2, 1, 0, -1, -2, -2, -1)
    for i in range(n):
        y = y0 - i * 2
        dx = amp[i % len(amp)]
        # voluta de 2-3 px con checker para que respire sobre los azulejos
        d.point((cx + dx, y), fill=HANJI[0])
        d.point((cx + dx + 2, y), fill=HANJI[0])
        d.point((cx + dx + 1, y - 1), fill=HANJI[0])
        if i % 3 == 0 and i < n - 3:
            d.point((cx + dx - 1, y - 1), fill=HANJI[1])
            d.point((cx + dx + 3, y - 1), fill=HANJI[1])


def draw_pot(d):
    # olla de metal oscuro con tapa
    fill(d, 220, 108, 34, 24, METAL[3])
    hline(d, 221, 110, 32, METAL[2])
    vline(d, 225, 112, 17, METAL[1])
    vline(d, 226, 112, 17, METAL[2])
    fill(d, 216, 114, 4, 5, METAL[2])
    fill(d, 254, 114, 4, 5, METAL[2])
    frame(d, 215, 113, 5, 7, OUTLINE)
    frame(d, 253, 113, 5, 7, OUTLINE)
    frame(d, 219, 107, 36, 26, OUTLINE)
    d.ellipse([218, 100, 255, 110], fill=METAL[2], outline=OUTLINE)
    hline(d, 228, 103, 18, METAL[0])
    # beso de sol del alba en el borde derecho de la tapa y la panza
    d.point((250, 103), fill=GOLD[1])
    d.point((251, 104), fill=GOLD[1])
    vline(d, 252, 112, 6, METAL[1])
    fill(d, 235, 96, 5, 4, BRASS[1])
    frame(d, 234, 95, 7, 6, OUTLINE)
    # vapor
    steam(d, 230, 92, 15)
    steam(d, 244, 90, 12)


# ── refrigerador + nota + tarro de kimchi ────────────────────────────────────

def draw_fridge(d):
    x, y, w, h = 14, 58, 59, 138
    fill(d, x, y, w, h, HANJI[1])
    fill(d, x + 1, y + 1, w - 2, 4, HANJI[0])
    vline(d, x + 1, y + 1, h - 2, HANJI[0])
    vline(d, x + w - 2, y + 2, h - 4, HANJI[2])
    vline(d, x + w - 3, y + 6, h - 12, HANJI[2])
    dither(d, x + w - 8, y + 6, 5, h - 14, HANJI[2], phase=0)
    # puertas: congelador arriba / principal abajo
    hline(d, x + 1, 102, w - 2, HANJI[3])
    hline(d, x + 1, 103, w - 2, HANJI[0])
    # tiradores de metal
    for hy, hh in ((68, 28), (112, 40)):
        fill(d, 63, hy, 4, hh, METAL[1])
        vline(d, 66, hy, hh, METAL[3])
        frame(d, 62, hy - 1, 6, hh + 2, OUTLINE)
    # rejilla inferior y patas
    for gy in (184, 187, 190):
        hline(d, x + 6, gy, w - 12, HANJI[2])
    fill(d, x + 1, 193, w - 2, 3, HANJI[3])
    frame(d, x, y, w, h, OUTLINE)
    fill(d, 18, 196, 6, 4, GRAY[3])
    fill(d, 62, 196, 6, 4, GRAY[3])
    drop_shadow(d, 14, 200, 60)

    # nota hanji con iman rojo (hotspot note-3)
    fill(d, 38, 65, 25, 22, HANJI[3])      # sombra del papel
    fill(d, 37, 64, 24, 22, HANJI[0])
    frame(d, 37, 64, 24, 22, HANJI[2])
    for ly, lw in ((70, 15), (74, 11), (78, 17), (82, 8)):
        hline(d, 41, ly, lw, OUTLINE)
    d.ellipse([45, 60, 52, 67], fill=RED[1], outline=RED[3])
    d.point((47, 62), fill=HANJI[0])

    # tarro de kimchi sobre el refri
    fill(d, 20, 41, 14, 17, RED[1])
    dither(d, 21, 44, 12, 12, RED[2], phase=1)
    d.point((25, 47), fill=RED[3])
    d.point((29, 51), fill=RED[3])
    hline(d, 21, 42, 12, HANJI[1])
    vline(d, 22, 43, 13, METAL[0])
    fill(d, 19, 37, 16, 4, METAL[1])
    frame(d, 18, 36, 18, 6, OUTLINE)
    frame(d, 19, 40, 16, 18, OUTLINE)

    # planta pequena sobre el refri
    fill(d, 53, 50, 9, 8, GRAY[1])
    hline(d, 53, 50, 9, GRAY[0])
    frame(d, 52, 49, 11, 10, OUTLINE)
    for lx, ly in ((55, 44), (58, 41), (60, 45), (57, 47)):
        fill(d, lx, ly, 3, 3, GREEN[1])
        d.point((lx + 1, ly), fill=GREEN[0])
    d.point((56, 46), fill=GREEN[3])


# ── alacena con tazas ────────────────────────────────────────────────────────

def cup(d, x, y, body, lite, dark):
    fill(d, x, y, 8, 8, body)
    hline(d, x, y, 8, lite)
    vline(d, x + 1, y + 1, 6, lite)
    hline(d, x + 1, y + 7, 6, dark)
    vline(d, x + 8, y + 2, 4, body)
    frame(d, x - 1, y - 1, 10, 10, OUTLINE)
    d.point((x + 8, y + 1), fill=OUTLINE)
    d.point((x + 8, y + 6), fill=OUTLINE)
    vline(d, x + 9, y + 2, 4, OUTLINE)


def draw_cupboard(d):
    x, y, w, h = 82, 32, 56, 56
    fill(d, x, y, w, h, WOODL[1])
    hline(d, x + 1, y + 1, w - 2, WOODL[0])
    fill(d, x + 1, y + h - 4, w - 2, 3, WOODL[3])
    # puerta izquierda cerrada con panel
    frame(d, 85, 35, 24, 50, WOODL[3])
    frame(d, 88, 38, 18, 44, WOODL[2])
    fill(d, 104, 58, 2, 4, BRASS[2])
    # hueco abierto a la derecha con baldas y tazas
    fill(d, 110, 35, 26, 50, WOODD[3])
    fill(d, 110, 52, 26, 3, WOODL[2])
    fill(d, 110, 70, 26, 3, WOODL[2])
    cup(d, 112, 43, BLUE[1], BLUE[0], BLUE[3])    # taza azul
    cup(d, 124, 43, RED[1], RED[0], RED[3])       # taza roja
    cup(d, 112, 61, HANJI[1], HANJI[0], HANJI[3])  # taza crema
    for i, yy in enumerate(range(64, 70, 2)):      # platos apilados
        hline(d, 125, yy, 9, HANJI[1] if i % 2 else HANJI[2])
    frame(d, 124, 63, 11, 8, OUTLINE)
    frame(d, x, y, w, h, OUTLINE)
    # puerta abierta vista de canto
    fill(d, 137, 30, 5, 60, WOODL[2])
    vline(d, 137, 30, 60, WOODL[0])
    frame(d, 136, 29, 7, 62, OUTLINE)
    drop_shadow(d, 84, 89, 54)


# ── mesa con mantel, pan, palillos + taburete ────────────────────────────────

def draw_table(d):
    # sombra suave del hueco bajo la mesa (dither ralo, no losa)
    for y in range(166, 182):
        for x in range(138 + (y % 3), 192, 3):
            d.point((x, y), fill=FLOOR[2])
    # tapa con mantel de rayas rojas
    fill(d, 126, 134, 79, 10, HANJI[0])
    for sx in range(130, 201, 10):
        fill(d, sx, 134, 2, 10, RED[1])
    hline(d, 126, 143, 79, HANJI[2])
    frame(d, 125, 133, 81, 12, OUTLINE)
    # caida del mantel
    fill(d, 128, 145, 75, 20, HANJI[1])
    for sx in range(130, 201, 10):
        fill(d, sx, 145, 2, 20, RED[2])
    hline(d, 128, 161, 75, RED[2])
    frame(d, 127, 144, 77, 22, OUTLINE)
    # patas
    for lx in (132, 194):
        fill(d, lx, 166, 5, 21, WOODD[1])
        vline(d, lx + 4, 166, 21, WOODD[3])
        frame(d, lx - 1, 165, 7, 23, OUTLINE)
    drop_shadow(d, 128, 188, 76)
    # plato con hogaza dorada (domo de pan, no ladrillo)
    d.ellipse([148, 134, 182, 146], fill=HANJI[2], outline=OUTLINE)
    d.ellipse([151, 136, 179, 144], fill=HANJI[0])
    d.ellipse([154, 124, 178, 140], fill=GOLD[1], outline=OUTLINE)
    d.ellipse([158, 126, 172, 132], fill=GOLD[0])
    dither(d, 157, 134, 19, 5, GOLD[2], phase=0)
    hline(d, 158, 137, 17, GOLD[2])
    for tx in (160, 165, 170):
        d.line([tx, 128, tx + 2, 131], fill=BRASS[2])
    d.line([166, 127, 168, 130], fill=OUTLINE)
    # palillos de metal
    d.line([183, 138, 196, 135], fill=METAL[3])
    d.line([184, 141, 197, 138], fill=METAL[3])
    d.point((183, 138), fill=METAL[1])
    d.point((184, 141), fill=METAL[1])


def draw_rug(d):
    """Alfombrita ovalada tejida en el suelo vacio junto al refri."""
    d.ellipse([80, 198, 126, 218], fill=GREEN[1], outline=OUTLINE)
    d.ellipse([85, 201, 121, 215], outline=GREEN[2])
    d.ellipse([90, 204, 116, 212], outline=GREEN[0])
    d.ellipse([96, 206, 110, 210], fill=GREEN[0])
    dither(d, 96, 207, 14, 3, GREEN[1], phase=0)


def draw_stool(d):
    fill(d, 104, 156, 21, 7, WOODL[1])
    hline(d, 104, 156, 21, WOODL[0])
    frame(d, 103, 155, 23, 9, OUTLINE)
    for lx in (106, 119):
        fill(d, lx, 164, 4, 21, WOODD[1])
        frame(d, lx - 1, 163, 6, 23, OUTLINE)
    hline(d, 110, 176, 9, WOODD[2])
    drop_shadow(d, 104, 186, 22)


# ── encimera baja: cuenco de arroz + arrocera ────────────────────────────────

def draw_counter(d):
    # tapa
    fill(d, 212, 178, 108, 12, WOODL[0])
    hline(d, 212, 189, 108, WOODL[2])
    for gx in range(218, 314, 21):
        hline(d, gx, 183, 5, WOODL[1])
    dither(d, 290, 179, 28, 9, GOLD[0], phase=1)  # beso de luz del alba
    frame(d, 211, 177, 109, 14, OUTLINE)
    # frente con puertas
    fill(d, 214, 191, 104, 28, WOODL[1])
    vline(d, 265, 192, 26, WOODL[3])
    frame(d, 220, 195, 42, 20, WOODL[3])
    frame(d, 270, 195, 40, 20, WOODL[3])
    fill(d, 257, 203, 2, 4, BRASS[2])
    fill(d, 274, 203, 2, 4, BRASS[2])
    vline(d, 316, 192, 26, WOODL[3])
    fill(d, 214, 219, 104, 4, WOODD[2])
    frame(d, 213, 190, 106, 34, OUTLINE)
    drop_shadow(d, 214, 224, 104)


def draw_bowl(d):
    # sombra de contacto sobre la tapa
    dither(d, 232, 186, 30, 3, WOODL[2], phase=0)
    # cuerpo del cuenco crema
    fill(d, 231, 172, 31, 9, HANJI[1])
    fill(d, 234, 181, 25, 4, HANJI[1])
    vline(d, 234, 173, 10, HANJI[0])
    vline(d, 235, 174, 9, HANJI[0])
    dither(d, 251, 173, 9, 11, HANJI[2], phase=1)
    vline(d, 260, 173, 8, HANJI[2])
    # pie
    fill(d, 240, 185, 13, 3, HANJI[3])
    frame(d, 239, 184, 15, 4, OUTLINE)
    # contorno del cuerpo
    vline(d, 230, 171, 9, OUTLINE)
    vline(d, 262, 171, 9, OUTLINE)
    d.line([230, 179, 234, 184], fill=OUTLINE)
    d.line([262, 179, 258, 184], fill=OUTLINE)
    hline(d, 234, 184, 25, OUTLINE)
    # borde del cuenco bien marcado + monticulo de arroz
    d.ellipse([230, 166, 262, 176], fill=HANJI[2], outline=OUTLINE)
    hline(d, 233, 174, 27, HANJI[3])
    d.ellipse([233, 161, 259, 173], fill=HANJI[0], outline=OUTLINE)
    for rx, ry in ((238, 165), (245, 163), (251, 166), (242, 169), (249, 170)):
        d.point((rx, ry), fill=HANJI[1])
    d.point((240, 164), fill=METAL[0])
    d.point((248, 167), fill=METAL[0])
    d.point((244, 170), fill=METAL[0])
    # vapor sutil
    for sx, sy in ((242, 156), (245, 152), (249, 157), (252, 153), (246, 148)):
        d.point((sx, sy), fill=HANJI[0])


def draw_rice_cooker(d):
    d.ellipse([274, 153, 304, 169], fill=METAL[1], outline=OUTLINE)
    hline(d, 282, 156, 14, METAL[0])
    fill(d, 285, 150, 9, 3, METAL[2])
    frame(d, 284, 149, 11, 5, OUTLINE)
    fill(d, 274, 163, 31, 22, GRAY[0])
    vline(d, 276, 165, 18, METAL[0])
    dither(d, 297, 165, 7, 18, GRAY[1], phase=0)
    fill(d, 274, 181, 31, 4, METAL[2])
    fill(d, 280, 174, 3, 3, BRASS[1])
    hline(d, 287, 175, 8, GRAY[2])
    frame(d, 273, 162, 33, 24, OUTLINE)
    dither(d, 276, 186, 28, 2, WOODL[2], phase=1)  # contacto


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    img, d = C.new_canvas(W, H, bg=HANJI[1])
    draw_back(d)
    draw_window(d)
    draw_light_pool(d)
    draw_clock(d)
    draw_shelf(d)
    draw_towel(d)
    draw_wall_props(d)
    draw_stove(d)
    draw_pot(d)
    draw_fridge(d)
    draw_cupboard(d)
    draw_counter(d)
    draw_bowl(d)
    draw_rice_cooker(d)
    draw_rug(d)
    draw_table(d)
    draw_stool(d)

    C.save_asset(img, "rooms", "room-03-kitchen.png")
    C.preview(img, "preview_room-03-kitchen.png")
    C.hotspot_debug(img, RECTS, "debug_room-03-kitchen.png")


if __name__ == "__main__":
    main()
