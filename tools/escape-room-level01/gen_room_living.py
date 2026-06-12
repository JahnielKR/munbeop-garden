#!/usr/bin/env python3
"""Room 2 — la sala (geosil) del minbak. 320x240, amanecer dorado.

Hotspots (espacio 320x240):
  photo-halmeoni [40,50,50,50]  — foto destacada: halmeoni joven con gato (sepia)
  note-2        [120,110,40,30] — nota hanji con cinta al frente del mueble bajo
  phone         [100,130,40,30] — telefono de disco verde en estante abierto

Colores: solo common.PAL + OUTLINE/SHADOW. Sin tonos derivados nuevos.
Determinista: sin random.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import common as C
from common import OUTLINE, PAL, dither, fill, frame, hline, vline

W, H = 320, 240
BASE_Y = 142          # zocalo y142..147
FLOOR_Y = 148         # primera fila de suelo

HOTSPOTS = [(40, 50, 50, 50), (120, 110, 40, 30), (100, 130, 40, 30)]

wl, wd = PAL["wood_light"], PAL["wood_dark"]
hj, fl = PAL["hanji"], PAL["floor"]
dawn, gold = PAL["dawn"], PAL["gold_light"]
gr, bl, rd, pk = PAL["green"], PAL["blue"], PAL["red"], PAL["pink"]
br, gy = PAL["brass"], PAL["gray"]


def blit(d, ox, oy, rows, cmap):
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch != ".":
                d.point((ox + i, oy + j), fill=cmap[ch])


# ── fondo: pared hanji + vigas + zocalo + suelo ──────────────────────────────

def draw_shell(d):
    C.hanji_wall(d, 0, 0, W, BASE_Y)
    dither(d, 0, BASE_Y - 12, W, 12, hj[2], phase=1)        # pared mas honda abajo
    # dintel superior
    fill(d, 0, 0, W, 9, wl[1])
    hline(d, 0, 1, W, wl[0])
    hline(d, 0, 7, W, wl[3])
    hline(d, 0, 8, W, OUTLINE)
    for gx in range(6, W - 4, 37):
        hline(d, gx, 4, 5, wl[2])
    # vigas verticales enmarcando paneles
    for bx in (0, 112, 210, 314):
        fill(d, bx, 9, 6, BASE_Y - 9, wl[1])
        vline(d, bx, 9, BASE_Y - 9, wl[0])
        vline(d, bx + 4, 9, BASE_Y - 9, wl[3])
        vline(d, bx + 5, 9, BASE_Y - 9, OUTLINE)
        for gy_ in range(18, BASE_Y - 6, 31):
            vline(d, bx + 2, gy_, 4, wl[2])
    # zocalo
    fill(d, 0, BASE_Y, W, 6, wl[2])
    hline(d, 0, BASE_Y, W, OUTLINE)
    hline(d, 0, BASE_Y + 1, W, wl[1])
    hline(d, 0, BASE_Y + 5, W, wl[3])
    for gx in range(14, W, 32):
        vline(d, gx, BASE_Y + 2, 3, wl[3])
    # suelo ondol con tablones sutiles
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, fl, plank_h=11, seam_every=2)
    dither(d, 0, H - 12, W, 12, fl[2], phase=0)             # vineta calida abajo


def draw_light_pool(d):
    """Charco de luz dorada inclinado, con sombras de los parteluces."""
    y0, y1 = FLOOR_Y, 230
    for y in range(y0, y1):
        t = (y - y0) / (y1 - y0)
        if 184 <= y <= 187:                       # sombra del travesano horizontal
            continue
        cx = 263 - 26 * t
        hw = 33 + 21 * t
        xl, xr = int(cx - hw), min(int(cx + hw), 316)
        gap = int(262 - 26 * t)                   # sombra del parteluz vertical
        # nucleo: luz solida palida, partida por la sombra del parteluz
        for sx, ex in ((xl + 6, gap - 1), (gap + 3, xr - 6)):
            if ex > sx:
                fill(d, sx, y, ex - sx, 1, gold[0])
        # chispas doradas cerca de la ventana
        if y < 176:
            dither(d, xl + 8, y, max(xr - xl - 16, 0), 1, gold[1], phase=y)
        # bordes dithered
        dither(d, xl, y, 6, 1, gold[0], phase=y)
        dither(d, xr - 6, y, 6, 1, gold[0], phase=y + 1)
    # reflejo calido en la pared bajo el alfeizar
    dither(d, 234, 128, 58, 13, gold[1], phase=0)


# ── ventana al jardin + cortina corta ────────────────────────────────────────

def draw_window(d):
    ox0, oy0, ox1, oy1 = 230, 45, 295, 120     # hueco interior (spec)
    # marco
    fill(d, ox0 - 5, oy0 - 5, (ox1 - ox0) + 11, (oy1 - oy0) + 11, wl[1])
    frame(d, ox0 - 5, oy0 - 5, (ox1 - ox0) + 11, (oy1 - oy0) + 11, OUTLINE)
    hline(d, ox0 - 4, oy0 - 4, (ox1 - ox0) + 9, wl[0])
    vline(d, ox0 - 4, oy0 - 4, (oy1 - oy0) + 9, wl[0])
    hline(d, ox0 - 4, oy1 + 4, (ox1 - ox0) + 9, wl[3])
    vline(d, ox1 + 4, oy0 - 4, (oy1 - oy0) + 9, wl[3])
    frame(d, ox0 - 1, oy0 - 1, (ox1 - ox0) + 3, (oy1 - oy0) + 3, OUTLINE)
    # cielo de amanecer (bandas + dither)
    fill(d, ox0, oy0, 66, 12, dawn[3])
    dither(d, ox0, oy0 + 12, 66, 3, dawn[3], phase=0)
    fill(d, ox0, oy0 + 13, 66, 9, dawn[2])
    dither(d, ox0, oy0 + 22, 66, 3, dawn[2], phase=1)
    fill(d, ox0, oy0 + 23, 66, 10, dawn[1])
    dither(d, ox0, oy0 + 33, 66, 3, dawn[1], phase=0)
    fill(d, ox0, oy0 + 34, 66, 12, dawn[0])
    # sol medio asomado en el horizonte, panel izquierdo
    dither(d, 235, 76, 22, 15, gold[1], phase=1)
    d.ellipse([240, 81, 252, 93], fill=gold[0])
    hline(d, 243, 79, 7, gold[0])
    d.point((238, 84), fill=gold[0])
    d.point((254, 84), fill=gold[0])
    # jardin (cubre la mitad inferior del sol: amanece)
    fill(d, ox0, 91, 66, 7, gr[1])
    dither(d, ox0, 96, 66, 3, gr[2], phase=0)
    fill(d, ox0, 98, 66, 12, gr[2])
    dither(d, ox0, 108, 66, 3, gr[3], phase=1)
    fill(d, ox0, 110, 66, 10, gr[3])
    hline(d, ox0, 91, 66, gr[0])              # filo de hierba iluminada
    dither(d, 236, 92, 20, 2, gold[1], phase=0)   # reflejo del sol en la hierba
    # arbol verde a la derecha, copa irregular
    fill(d, 277, 80, 4, 14, wd[2])
    vline(d, 277, 80, 14, wd[3])
    d.ellipse([264, 60, 292, 84], fill=gr[1], outline=OUTLINE)
    d.ellipse([268, 54, 290, 72], fill=gr[1], outline=OUTLINE)
    d.ellipse([270, 57, 288, 70], fill=gr[1])
    d.ellipse([266, 62, 290, 82], fill=gr[1])
    dither(d, 266, 72, 25, 11, gr[2], phase=0)
    dither(d, 282, 62, 9, 12, gr[2], phase=1)
    for px, py in ((272, 60), (279, 56), (284, 64), (271, 67), (276, 70), (286, 72)):
        d.point((px, py), fill=gr[0])
        d.point((px + 1, py), fill=gr[0])
        d.point((px, py + 1), fill=gr[0])
    # parteluces
    fill(d, 261, oy0, 3, (oy1 - oy0) + 1, wl[1])
    vline(d, 261, oy0, (oy1 - oy0) + 1, wl[0])
    vline(d, 263, oy0, (oy1 - oy0) + 1, wl[3])
    fill(d, ox0, 81, 66, 3, wl[1])
    hline(d, ox0, 81, 66, wl[0])
    hline(d, ox0, 83, 66, wl[3])
    # alfeizar
    fill(d, 222, 120, 82, 7, wl[1])
    hline(d, 222, 120, 82, wl[0])
    hline(d, 222, 125, 82, wl[3])
    frame(d, 222, 119, 82, 8, OUTLINE)
    dither(d, 226, 127, 74, 2, hj[3], phase=0)


def draw_curtain(d):
    # barra
    fill(d, 219, 36, 88, 3, wd[2])
    hline(d, 219, 36, 88, wd[1])
    frame(d, 219, 36, 88, 3, OUTLINE)
    d.point((219, 37), fill=br[1])
    d.point((306, 37), fill=br[1])
    # cenefa corta con ondas
    fill(d, 224, 39, 78, 11, rd[1])
    for i in range(6):
        x0 = 224 + i * 13
        d.ellipse([x0, 44, x0 + 12, 57], fill=rd[1], outline=OUTLINE)
    fill(d, 224, 39, 78, 11, rd[1])
    hline(d, 224, 39, 78, rd[3])
    vline(d, 224, 39, 11, OUTLINE)
    vline(d, 301, 39, 11, OUTLINE)
    for fx in range(230, 300, 9):
        vline(d, fx, 41, 8, rd[2])
    for dx, dy in ((233, 43), (245, 47), (257, 43), (269, 47), (281, 43), (293, 47)):
        d.point((dx, dy), fill=hj[0])


# ── pared izquierda: fotos de familia + rollo de tinta ───────────────────────

PHOTO_MAIN = [
    "...................",
    "...................",
    "....hhhh...........",
    "...hhhhhh..........",
    "...hhhhhh..........",
    "...hssssh..........",
    "...hssssh..........",
    "....ssss...........",
    "..ojjjjjjo.........",
    ".ojjjjjjjjo........",
    ".ojjjjjjjjo........",
    ".ojjwjjjjjo........",
    ".okkkkkkkko..vv.vv.",
    ".okkkkkkkko..vvvvv.",
    "okkkkkkkkkko.vavav.",
    "okkkkkkkkkko.vvvvv.",
    "okkkkkkkkkko..vvv..",
    "okkkkkkkkkko.vvvvv.",
    "okkkkkkkkkko.vvvvvt",
    "okkkkkkkkkko.vvvvvt",
    "oooooooooooo.vvvvvt",
    "fffffffffffffffffff",
    "fffffffffffffffffff",
    "fffffffffffffffffff",
]
PHOTO_CMAP = {
    "h": wd[3],   # pelo recogido
    "s": hj[0],   # piel
    "o": wd[2],   # contorno sepia suave de la figura
    "j": hj[2],   # jeogori sepia claro
    "w": wd[2],   # nudo del goreum
    "k": wl[3],   # chima sepia oscura
    "v": wd[3],   # gato
    "a": br[1],   # ojos del gato
    "t": wd[2],   # cola
    "f": wl[1],   # suelo de la foto
}


def draw_photos(d):
    # foto pequena A (pareja, sepia) — parcialmente fuera del rect: grupo
    frame(d, 17, 59, 22, 28, OUTLINE)
    fill(d, 18, 60, 20, 26, wd[2])
    fill(d, 20, 62, 16, 22, hj[1])
    fill(d, 20, 78, 16, 6, wl[1])
    for fx, fy in ((24, 66), (30, 67)):
        fill(d, fx, fy, 3, 3, wd[3])                       # cabezas
        fill(d, fx - 1, fy + 3, 5, 9, wl[2])               # cuerpos
    hline(d, 18, 87, 20, hj[3])
    # foto pequena C (casita, sepia) — abajo a la izquierda del grupo
    frame(d, 26, 92, 18, 16, OUTLINE)
    fill(d, 27, 93, 16, 14, wd[2])
    fill(d, 29, 95, 12, 10, hj[1])
    fill(d, 31, 99, 8, 5, wl[2])                            # casita
    for i in range(3):
        hline(d, 32 - i + 2, 97 + i, 2 + i * 2, wd[2])      # tejado
    d.point((34, 101), fill=wd[3])                          # puerta
    d.point((35, 101), fill=wd[3])
    hline(d, 27, 108, 16, hj[3])
    # foto pequena B (montana y sol, sepia)
    frame(d, 83, 51, 20, 24, OUTLINE)
    fill(d, 84, 52, 18, 22, wd[2])
    fill(d, 86, 54, 14, 18, hj[0])
    for i in range(7):
        hline(d, 89 + (6 - i), 64 + i, 1 + i * 2, wl[2])   # montana
    d.ellipse([94, 56, 98, 60], fill=br[1])
    hline(d, 84, 75, 18, hj[3])
    # LA foto: halmeoni joven con gato — centro (64,74) dentro de [40,50,50,50]
    frame(d, 50, 56, 30, 38, OUTLINE)
    fill(d, 51, 57, 28, 36, wd[1])
    vline(d, 51, 57, 36, wd[0])
    hline(d, 51, 57, 28, wd[0])
    vline(d, 78, 57, 36, wd[3])
    hline(d, 51, 92, 28, wd[3])
    fill(d, 54, 60, 22, 30, hj[0])                          # paspartu claro
    fill(d, 55, 62, 20, 26, hj[1])
    fill(d, 55, 83, 20, 5, wl[1])
    blit(d, 55, 62, PHOTO_MAIN, PHOTO_CMAP)
    d.point((60, 68), fill=wd[3])                           # ojos
    d.point((62, 68), fill=wd[3])
    hline(d, 50, 94, 30, hj[3])                             # sombra en pared
    # clavito
    d.point((64, 53), fill=wd[3])


def draw_scroll(d):
    fill(d, 126, 26, 28, 4, wd[2])
    frame(d, 126, 26, 28, 4, OUTLINE)
    fill(d, 129, 30, 22, 54, hj[0])
    vline(d, 129, 30, 54, hj[2])
    vline(d, 150, 30, 54, hj[2])
    frame(d, 129, 30, 22, 54, hj[3])
    # orquidea de tinta: hojas curvas con trazo doble
    d.line([(139, 76), (136, 64), (133, 56), (132, 48)], fill=OUTLINE)
    d.line([(140, 76), (137, 64), (134, 56), (133, 48)], fill=OUTLINE)
    d.line([(140, 76), (143, 62), (147, 52), (148, 44)], fill=OUTLINE)
    d.line([(141, 76), (144, 62), (148, 52), (149, 44)], fill=OUTLINE)
    d.line([(139, 76), (135, 70), (131, 67)], fill=OUTLINE)
    d.line([(141, 76), (145, 71), (148, 70)], fill=OUTLINE)
    d.line([(140, 76), (140, 68)], fill=wd[2])
    for bx, by in ((133, 46), (148, 42), (131, 65)):        # petalos de tinta
        d.point((bx + 1, by), fill=wd[2])
        d.point((bx, by + 1), fill=wd[2])
        d.point((bx + 1, by + 1), fill=wd[3])
    fill(d, 145, 76, 4, 4, rd[2])                           # sello rojo
    fill(d, 126, 84, 28, 4, wd[2])
    frame(d, 126, 84, 28, 4, OUTLINE)
    hline(d, 129, 88, 22, hj[3])


# ── mueble bajo central (x90..210) con nota, telefono, florero, radio ────────

def draw_cabinet(d):
    C.drop_shadow(d, 86, 158, 128, 3)
    # cuerpo
    fill(d, 90, 93, 121, 65, wl[2])
    frame(d, 90, 93, 121, 65, OUTLINE)
    # tapa
    fill(d, 91, 94, 119, 8, wl[1])
    hline(d, 91, 94, 119, wl[0])
    hline(d, 91, 101, 119, wl[3])
    hline(d, 91, 102, 119, OUTLINE)
    # zona inferior / plinto
    fill(d, 91, 153, 119, 4, wl[3])
    hline(d, 91, 153, 119, OUTLINE)
    # cajon superior izquierdo con tirador de bronce
    frame(d, 96, 106, 50, 24, wl[3])
    fill(d, 97, 107, 48, 22, wl[1])
    hline(d, 97, 107, 48, wl[0])
    fill(d, 107, 117, 10, 3, br[1])
    frame(d, 106, 116, 12, 5, OUTLINE)
    hline(d, 108, 117, 8, br[0])
    # estante abierto con sombra interior (telefono va dentro)
    fill(d, 100, 132, 42, 21, wd[3])
    frame(d, 100, 132, 42, 21, OUTLINE)
    vline(d, 101, 133, 19, OUTLINE)
    hline(d, 101, 133, 40, OUTLINE)
    hline(d, 101, 151, 40, wd[2])
    # puertas dobles derechas
    frame(d, 150, 106, 56, 47, wl[3])
    fill(d, 151, 107, 54, 45, wl[1])
    vline(d, 178, 107, 45, wl[3])
    vline(d, 179, 107, 45, OUTLINE)
    frame(d, 155, 111, 19, 37, wl[2])
    frame(d, 183, 111, 19, 37, wl[2])
    fill(d, 174, 127, 3, 5, br[1])
    fill(d, 181, 127, 3, 5, br[1])
    d.point((175, 128), fill=br[0])
    d.point((182, 128), fill=br[0])
    # vetas sutiles
    for gx, gy_ in ((104, 124), (130, 110), (160, 140), (192, 118)):
        hline(d, gx, gy_, 4, wl[2])
    # luz del alba rozando el lado de la ventana
    vline(d, 209, 103, 50, wl[1])
    vline(d, 208, 107, 42, wl[1])


def draw_phone(d):
    # telefono de disco verde apagado, centro visual ~(120,144)
    fill(d, 106, 139, 28, 12, gr[2])
    frame(d, 106, 139, 28, 12, OUTLINE)
    hline(d, 107, 140, 26, gr[0])                # luz del alba en el lomo
    hline(d, 107, 149, 26, gr[3])
    vline(d, 132, 141, 8, gr[3])
    # dial sobrio con agujeros
    d.ellipse([120, 141, 128, 149], fill=hj[2], outline=OUTLINE)
    for px, py in ((122, 142), (126, 143), (121, 146), (125, 147)):
        d.point((px, py), fill=OUTLINE)
    d.point((124, 145), fill=br[1])
    d.point((123, 144), fill=br[0])
    # auricular encima
    fill(d, 105, 135, 30, 4, gr[3])
    fill(d, 105, 133, 6, 6, gr[3])
    fill(d, 129, 133, 6, 6, gr[3])
    frame(d, 105, 133, 6, 6, OUTLINE)
    frame(d, 129, 133, 6, 6, OUTLINE)
    hline(d, 112, 135, 16, OUTLINE)
    hline(d, 112, 138, 16, OUTLINE)
    hline(d, 113, 136, 14, gr[1])
    hline(d, 106, 133, 4, gr[1])
    hline(d, 130, 133, 4, gr[1])
    # cable rizado pegado al cuerpo
    d.point((105, 142), fill=OUTLINE)
    d.point((104, 144), fill=OUTLINE)
    d.point((105, 146), fill=OUTLINE)
    d.point((104, 148), fill=OUTLINE)
    d.point((105, 150), fill=OUTLINE)


def draw_note(d):
    # nota hanji con cinta — centro (140,124) dentro de [120,110,40,30]
    fill(d, 131, 114, 19, 21, hj[0])
    frame(d, 131, 114, 19, 21, OUTLINE)
    # esquina doblada
    d.point((148, 133), fill=hj[2])
    d.point((147, 133), fill=hj[2])
    d.point((148, 132), fill=hj[2])
    # garabatos ilegibles
    hline(d, 134, 118, 12, wd[3])
    hline(d, 134, 121, 9, wd[3])
    hline(d, 136, 124, 10, wd[3])
    hline(d, 134, 127, 7, wd[3])
    hline(d, 138, 130, 8, wd[3])
    # cinta adhesiva dorada visible arriba
    fill(d, 136, 111, 9, 5, gold[1])
    hline(d, 136, 112, 9, gold[0])
    vline(d, 136, 111, 5, gold[2])
    vline(d, 144, 111, 5, gold[2])


def draw_vase(d):
    dither(d, 162, 92, 18, 3, wl[3], phase=0)
    # tallos y flores rosas (detras del cuello)
    d.line([(168, 78), (165, 66), (164, 60)], fill=gr[2])
    d.line([(171, 78), (171, 56)], fill=gr[2])
    d.line([(173, 78), (177, 64), (178, 59)], fill=gr[2])
    d.line([(170, 72), (167, 70)], fill=gr[2])
    d.line([(172, 70), (175, 69)], fill=gr[2])
    for lx, ly in ((166, 69), (176, 67)):                   # hojitas
        d.point((lx, ly), fill=gr[1])
        d.point((lx + 1, ly), fill=gr[1])
    for cx, cy in ((163, 58), (170, 52), (178, 57), (166, 66), (175, 65)):
        fill(d, cx - 1, cy - 1, 4, 4, pk[1])
        d.point((cx, cy - 2), fill=pk[1])
        d.point((cx - 2, cy), fill=pk[1])
        d.point((cx + 1, cy - 1), fill=pk[0])
        d.point((cx - 1, cy), fill=pk[0])
        d.point((cx + 2, cy + 2), fill=pk[2])
        d.point((cx, cy + 1), fill=pk[3])
    # florero celadon esbelto
    fill(d, 167, 76, 8, 4, gr[0])
    vline(d, 166, 76, 4, OUTLINE)
    vline(d, 175, 76, 4, OUTLINE)
    hline(d, 166, 75, 10, OUTLINE)
    d.ellipse([164, 79, 178, 94], fill=gr[0], outline=OUTLINE)
    vline(d, 167, 82, 9, hj[0])
    vline(d, 168, 83, 7, gr[0])
    dither(d, 172, 84, 6, 9, gr[1], phase=1)
    hline(d, 168, 88, 6, gr[1])                             # banda decorativa


def draw_radio(d):
    dither(d, 184, 92, 24, 3, wl[3], phase=1)
    fill(d, 185, 78, 22, 16, wd[1])
    frame(d, 185, 78, 22, 16, OUTLINE)
    hline(d, 186, 79, 20, wd[0])
    # rejilla de tela
    fill(d, 188, 82, 8, 9, hj[2])
    frame(d, 188, 82, 8, 9, wd[3])
    for vx in (190, 192, 194):
        vline(d, vx, 83, 7, wd[2])
    # dial de bronce
    d.ellipse([198, 81, 205, 88], fill=br[1], outline=OUTLINE)
    d.line([(201, 85), (203, 82)], fill=OUTLINE)
    d.point((199, 90), fill=br[2])
    d.point((203, 90), fill=br[2])
    hline(d, 187, 93, 18, wd[3])


# ── suelo: alfombra, mesa baja, cojines, planta, cesta ───────────────────────

def draw_rug(d):
    fill(d, 20, 170, 86, 60, hj[2])
    frame(d, 20, 170, 86, 60, OUTLINE)
    frame(d, 22, 172, 82, 56, rd[3])
    for i, yy in enumerate(range(178, 224, 9)):
        c = rd[2] if i % 2 == 0 else bl[2]
        fill(d, 25, yy, 76, 2, c)
        dither(d, 25, yy - 1, 76, 1, c, phase=i)
        dither(d, 25, yy + 2, 76, 1, c, phase=i + 1)
    for yy in range(175, 227, 2):                # trama tejida
        dither(d, 24, yy, 78, 1, hj[3], phase=yy)
    # flecos
    for fy in range(173, 228, 6):
        d.point((18, fy), fill=hj[1])
        d.point((107, fy), fill=hj[1])


def draw_table(d):
    C.drop_shadow(d, 26, 204, 64, 3)
    # patas curvas estilo soban
    for lx in (32, 80):
        fill(d, lx, 188, 4, 16, wd[2])
        vline(d, lx, 188, 16, OUTLINE)
        vline(d, lx + 3, 188, 16, OUTLINE)
        hline(d, lx, 203, 4, OUTLINE)
    fill(d, 30, 202, 8, 2, wd[3])
    fill(d, 78, 202, 8, 2, wd[3])
    # tablero lacado
    fill(d, 26, 176, 64, 12, wd[1])
    frame(d, 26, 176, 64, 12, OUTLINE)
    hline(d, 27, 177, 62, wd[0])
    fill(d, 27, 184, 62, 3, wd[2])
    hline(d, 27, 183, 62, wd[3])
    # tetera de bronce
    d.ellipse([44, 167, 60, 179], fill=br[1], outline=OUTLINE)
    dither(d, 47, 174, 11, 4, br[2], phase=0)
    hline(d, 47, 166, 10, br[0])
    frame(d, 47, 165, 10, 2, OUTLINE)
    d.point((51, 163), fill=OUTLINE)
    d.point((51, 164), fill=br[2])
    d.line([(44, 172), (41, 169)], fill=OUTLINE)
    d.point((41, 170), fill=br[1])
    d.line([(60, 170), (63, 172), (62, 175)], fill=OUTLINE)
    d.point((50, 170), fill=gold[0])
    # dos tacitas
    for cx in (68, 78):
        fill(d, cx, 173, 6, 5, hj[0])
        frame(d, cx, 173, 6, 5, OUTLINE)
        hline(d, cx + 1, 174, 4, hj[2])


def draw_cushion(d, x, y):
    C.drop_shadow(d, x + 2, y + 11, 22, 2)
    d.ellipse([x, y, x + 25, y + 12], fill=bl[1], outline=OUTLINE)
    hline(d, x + 6, y + 2, 13, bl[0])
    dither(d, x + 4, y + 8, 18, 3, bl[2], phase=0)
    d.point((x + 12, y + 6), fill=bl[3])
    d.point((x + 13, y + 6), fill=bl[3])
    d.point((x - 1, y + 6), fill=rd[1])
    d.point((x + 26, y + 6), fill=rd[1])


def draw_plant(d):
    C.drop_shadow(d, 288, 166, 26, 3)
    # hojas verticales
    leaves = ((293, 124), (298, 116), (303, 120), (308, 126), (296, 130), (305, 132))
    for i, (lx, ly) in enumerate(leaves):
        top = ly
        bot = 152
        d.line([(lx, bot), (lx, top)], fill=gr[2])
        d.line([(lx + 1, bot), (lx + 1, top + 2)], fill=gr[1])
        d.line([(lx - 1, bot), (lx - 1, top + 3)], fill=gr[3])
        d.point((lx, top - 1), fill=gr[0])
    # maceta
    fill(d, 290, 150, 22, 6, gy[1])
    frame(d, 290, 150, 22, 6, OUTLINE)
    hline(d, 291, 151, 20, gy[0])
    fill(d, 292, 156, 18, 10, gy[1])
    frame(d, 292, 156, 18, 10, OUTLINE)
    dither(d, 293, 160, 16, 5, gy[2], phase=1)
    hline(d, 293, 155, 16, wd[3])


def draw_basket(d):
    C.drop_shadow(d, 217, 214, 28, 2)
    # ovillos asomando
    d.ellipse([220, 189, 229, 198], fill=pk[1], outline=OUTLINE)
    d.arc([220, 189, 229, 198], 200, 320, fill=pk[2])
    d.line([(222, 193), (227, 191)], fill=pk[2])
    d.ellipse([229, 188, 238, 197], fill=bl[1], outline=OUTLINE)
    d.line([(231, 191), (236, 194)], fill=bl[2])
    # cesta tejida
    fill(d, 216, 196, 28, 18, wl[1])
    d.ellipse([216, 206, 243, 215], fill=wl[1])
    frame(d, 216, 196, 28, 12, OUTLINE)
    d.arc([215, 200, 244, 216], 0, 180, fill=OUTLINE)
    hline(d, 217, 196, 26, wl[0])
    hline(d, 217, 197, 26, wl[0])
    for yy in (200, 203, 206, 209):
        hline(d, 218, yy, 24, wl[3])
    for vx in range(220, 242, 5):
        vline(d, vx, 199, 12, wl[2])


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    img, d = C.new_canvas(W, H, bg=hj[1])
    draw_shell(d)
    draw_light_pool(d)
    draw_scroll(d)
    draw_photos(d)
    draw_window(d)
    draw_curtain(d)
    draw_rug(d)
    draw_table(d)
    draw_cushion(d, 34, 212)
    draw_cushion(d, 110, 190)
    draw_cabinet(d)
    draw_phone(d)
    draw_note(d)
    draw_vase(d)
    draw_radio(d)
    draw_plant(d)
    draw_basket(d)

    C.save_asset(img, "rooms", "room-02-living.png")
    C.preview(img, "preview_room_living.png")
    C.hotspot_debug(img, HOTSPOTS, "debug_room-02-living.png")


if __name__ == "__main__":
    main()
