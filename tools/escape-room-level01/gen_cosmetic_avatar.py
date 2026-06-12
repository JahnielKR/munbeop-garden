#!/usr/bin/env python3
"""Cosmetic epico: cosmetic-avatar-lantern.png (64x64) + strip 4 frames (256x64).

"Avatar Linterna Hanji": silueta 3/4 de un viajero en tonos noche
(PAL.night[2]/[3], contorno OUTLINE) que alza una linterna de papel hanji
encendida (cuerpo gold_light/hanji, costillas de bambu, tapas de madera,
borla roja). Glow dorado dithered alrededor de la linterna; rim-light calido
sobre los pixeles de la silueta que miran a la luz (dawn[0]/night[0]/night[1]).
Personalidad: bufanda roja al viento + mochila pequena con petate y hebilla.

Animacion (4 frames, frame 0 == asset estatico): la llama parpadea (2 poses),
el radio del glow varia +-2 px, la intensidad del rim-light sube y baja, y la
linterna se balancea 1 px en vertical en los frames alternos.

Colores: solo common.PAL / OUTLINE / SHADOW. Sin colores derivados.
Determinista: ningun uso de random.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C
from common import OUTLINE, PAL

NIGHT, RED, DAWN = PAL["night"], PAL["red"], PAL["dawn"]
GOLD, HANJI, WD, BRASS = PAL["gold_light"], PAL["hanji"], PAL["wood_dark"], PAL["brass"]

W = H = 64
LCX, LCY = 22, 20                      # centro de la linterna (frame base)

# Parametros por frame: (radio glow, ajuste rim k, pose llama, bob vertical)
FRAMES = [(15, 0, 0, 0), (14, -3, 1, 1), (16, 3, 0, 0), (13, -4, 1, 1)]

# Motas de chispa por frame (offset relativo al centro de la linterna).
SPARKS = [
    [(-9, -7), (8, -9), (-11, 6)],
    [(-7, -10), (10, -4)],
    [(-12, -3), (9, -10), (-8, 9), (11, 5)],
    [(7, -8), (-10, 2)],
]


# ── helpers ──────────────────────────────────────────────────────────────────

def pattern(x: int, y: int, dens: int) -> bool:
    """Densidad de dither: 1=25%, 2=50% (checker), 3=75%."""
    if dens == 1:
        return x % 2 == 0 and y % 2 == 0
    if dens == 2:
        return (x + y) % 2 == 0
    return not (x % 2 == 1 and y % 2 == 1)


def dither_disc(d, cx, cy, r, c, dens):
    r2 = r * r
    for yy in range(max(0, cy - r), min(H, cy + r + 1)):
        for xx in range(max(0, cx - r), min(W, cx + r + 1)):
            if (xx - cx) ** 2 + (yy - cy) ** 2 <= r2 and pattern(xx, yy, dens):
                d.point((xx, yy), fill=c)


def draw_glow(d, cx, cy, r):
    """Halo dorado dithered: borde ambar disperso -> nucleo crema denso."""
    dither_disc(d, cx, cy, r, GOLD[2], 1)
    dither_disc(d, cx, cy, max(3, r - 4), GOLD[1], 2)
    dither_disc(d, cx, cy, max(2, r - 8), GOLD[0], 3)


def outline_layer(img: Image.Image) -> None:
    """Contorno OUTLINE 1px alrededor de todo pixel opaco (4-vecindad)."""
    px = img.load()
    edges = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3] != 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and px[nx, ny][3] > 0 \
                        and px[nx, ny] != OUTLINE:
                    edges.append((x, y))
                    break
    for x, y in edges:
        px[x, y] = OUTLINE


BODY_FILLS = {NIGHT[1][:3], NIGHT[2][:3], NIGHT[3][:3]}
SCARF_FILLS = {RED[2][:3], RED[3][:3]}


def rim_pass(img: Image.Image, lcx: int, lcy: int, k: int) -> None:
    """Aclara los pixeles de borde de la silueta que miran a la linterna."""
    px = img.load()
    changes = []
    for y in range(H):
        for x in range(W):
            rgb = px[x, y][:3]
            if px[x, y][3] == 0 or (rgb not in BODY_FILLS and rgb not in SCARF_FILLS):
                continue
            sx = (lcx > x) - (lcx < x)
            sy = (lcy > y) - (lcy < y)
            if sx == 0 and sy == 0:
                continue
            n = px[x + sx, y + sy]
            if n[3] != 0 and n != OUTLINE:
                continue                        # borde no expuesto a la luz
            dist = math.hypot(x - lcx, y - lcy)
            if rgb in SCARF_FILLS:
                new = RED[1] if dist <= 17 + k else RED[2] if dist <= 26 + k else None
            else:
                new = (DAWN[0] if dist <= 11 + k else
                       NIGHT[0] if dist <= 17 + k else
                       NIGHT[1] if dist <= 26 + k else None)
            if new and new[:3] != rgb:
                changes.append((x, y, new))
    for x, y, c in changes:
        px[x, y] = c


# ── capa figura (identica en los 4 frames; el rim varia despues) ─────────────

ARM_PATH = [(35, 27), (34, 25), (33, 23), (31, 21), (30, 19), (29, 17),
            (28, 15), (27, 13), (26, 11), (25, 9), (24, 7), (23, 5)]


def figure_layer() -> Image.Image:
    img, d = C.new_canvas(W, H)
    # Petate (cilindro) sobre la mochila, tras los hombros.
    C.fill(d, 43, 20, 9, 5, NIGHT[2])
    C.hline(d, 45, 20, 5, NIGHT[1])            # lomo que pilla la luz
    C.vline(d, 43, 21, 3, NIGHT[1])            # tapa iluminada (lado linterna)
    C.vline(d, 51, 21, 3, NIGHT[3])            # tapa en sombra
    for tx in (46, 49):                         # correas
        C.vline(d, tx, 20, 5, NIGHT[3])
    for cx_, cy_ in ((43, 20), (51, 20), (43, 24), (51, 24)):
        d.point((cx_, cy_), fill=(0, 0, 0, 0))  # esquinas redondeadas
    # Mochila pequena.
    C.fill(d, 44, 26, 6, 11, NIGHT[3])
    C.hline(d, 44, 27, 6, NIGHT[2])            # solapa
    C.fill(d, 45, 31, 4, 4, NIGHT[2])          # bolsillo
    d.point((44, 26), fill=(0, 0, 0, 0))
    d.point((49, 26), fill=(0, 0, 0, 0))
    d.point((44, 36), fill=(0, 0, 0, 0))
    d.point((49, 36), fill=(0, 0, 0, 0))
    # Torso + abrigo (ligera inclinacion hacia la luz).
    C.fill(d, 34, 26, 10, 7, NIGHT[2])
    C.fill(d, 33, 32, 11, 10, NIGHT[2])
    C.vline(d, 43, 27, 14, NIGHT[3])           # oclusion contra la mochila
    C.dither(d, 40, 33, 3, 8, NIGHT[3], phase=1)
    C.hline(d, 33, 41, 11, NIGHT[3])           # bajo del abrigo
    # Correa de pecho + hebilla brass que pilla la luz.
    for i, (bx, by) in enumerate(((36, 27), (37, 28), (38, 30), (39, 31),
                                  (40, 33), (41, 34), (42, 36))):
        d.point((bx, by), fill=NIGHT[3])
        if i in (1, 3, 5):
            d.point((bx, by + 1), fill=NIGHT[3])
    C.fill(d, 38, 29, 2, 2, BRASS[1])
    d.point((38, 29), fill=BRASS[0])
    # Piernas en zancada + botas (punteras hacia la linterna).
    C.fill(d, 35, 42, 3, 3, NIGHT[2])
    C.fill(d, 34, 45, 3, 3, NIGHT[2])
    C.fill(d, 33, 48, 3, 2, NIGHT[2])
    C.fill(d, 32, 50, 3, 3, NIGHT[2])
    C.fill(d, 40, 42, 3, 4, NIGHT[2])
    C.fill(d, 41, 46, 3, 4, NIGHT[2])
    C.fill(d, 41, 50, 3, 3, NIGHT[2])
    C.fill(d, 30, 53, 6, 3, NIGHT[3])          # bota delantera
    d.point((29, 54), fill=NIGHT[3])
    d.point((29, 55), fill=NIGHT[3])
    C.hline(d, 31, 53, 4, NIGHT[1])
    C.fill(d, 40, 53, 6, 3, NIGHT[3])          # bota trasera
    d.point((39, 54), fill=NIGHT[3])
    d.point((39, 55), fill=NIGHT[3])
    C.hline(d, 41, 53, 4, NIGHT[2])
    # Cabeza de perfil 3/4 con nariz; sombreado lejos de la luz.
    d.ellipse([34, 13, 44, 23], fill=NIGHT[2])
    C.dither(d, 41, 15, 3, 7, NIGHT[3], phase=0)
    d.point((33, 18), fill=NIGHT[2])           # nariz
    d.point((33, 19), fill=NIGHT[2])
    d.point((36, 18), fill=NIGHT[0])           # destello del ojo
    # Bufanda roja: vuelta al cuello + cola al viento + cola frontal.
    C.fill(d, 35, 23, 9, 4, RED[3])
    C.hline(d, 35, 23, 9, RED[2])
    C.fill(d, 34, 26, 3, 6, RED[3])            # cola frontal (lado de la luz)
    C.vline(d, 35, 27, 4, RED[2])
    C.fill(d, 43, 25, 4, 3, RED[3])
    C.fill(d, 46, 27, 4, 3, RED[3])
    C.fill(d, 49, 29, 3, 3, RED[3])
    C.hline(d, 44, 25, 3, RED[2])
    C.hline(d, 47, 27, 3, RED[2])
    C.hline(d, 50, 29, 2, RED[2])
    d.point((50, 32), fill=RED[2])             # flecos
    d.point((52, 30), fill=RED[2])
    # Brazo alzado en diagonal (visible contra el glow) + puno con el cordel.
    for ax, ay in ARM_PATH:
        C.fill(d, ax, ay, 3, 2, NIGHT[2])
    C.fill(d, 23, 3, 4, 3, NIGHT[2])
    return img


# ── capa linterna (coords base; el bob se aplica al componer) ────────────────

def lantern_layer(flame_pose: int) -> Image.Image:
    img, d = C.new_canvas(W, H)
    rows = [(14, 18, 9), (15, 17, 11)] + [(y, 16, 13) for y in range(16, 25)] \
        + [(25, 17, 11), (26, 18, 9)]
    for y, x0, w in rows:                       # cuerpo redondeado base
        C.fill(d, x0, y, w, 1, GOLD[1])
    C.fill(d, 18, 15, 9, 10, GOLD[0])           # zona brillante interior
    if flame_pose == 0:                          # llama alta y fina
        C.fill(d, 21, 17, 3, 6, HANJI[0])
        d.point((22, 16), fill=HANJI[0])
    else:                                        # llama baja y ancha
        C.fill(d, 20, 19, 4, 4, HANJI[0])
        d.point((21, 18), fill=HANJI[0])
        d.point((23, 18), fill=HANJI[0])
    # Costillas de bambu (lavadas por la luz en el nucleo).
    for ry in (17, 20, 23):
        y, x0, w = next(r for r in rows if r[0] == ry)
        for xx in range(x0, x0 + w):
            washed = 19 <= xx <= 25
            d.point((xx, ry), fill=GOLD[1] if washed else GOLD[2])
    # Sombreado de esfera en los bordes del papel.
    C.vline(d, 16, 16, 9, GOLD[2])
    C.vline(d, 28, 16, 9, GOLD[2])
    C.vline(d, 17, 15, 11, GOLD[1])
    C.vline(d, 27, 15, 11, GOLD[1])
    C.hline(d, 18, 26, 9, GOLD[2])
    C.hline(d, 19, 14, 7, GOLD[1])
    # Tapas de madera arriba/abajo.
    C.fill(d, 19, 12, 7, 2, WD[1])
    C.hline(d, 19, 13, 7, WD[2])
    C.fill(d, 19, 27, 7, 2, WD[2])
    C.hline(d, 19, 27, 7, WD[1])
    outline_layer(img)
    return img


# ── render de un frame ───────────────────────────────────────────────────────

def render_frame(f: int) -> Image.Image:
    r, k, flame, bob = FRAMES[f]
    lcx, lcy = LCX, LCY + bob
    img, d = C.new_canvas(W, H)
    draw_glow(d, lcx, lcy, r)
    # Figura: misma base siempre; el rim-light depende del frame.
    fig = figure_layer()
    outline_layer(fig)
    rim_pass(fig, lcx, lcy, k)
    img.alpha_composite(fig)
    # Sombra de contacto calida bajo las botas (dentro del sprite).
    C.drop_shadow(d, 29, 57, 19, 2)
    C.dither(d, 26, 58, 26, 1, C.SHADOW[:3] + (255,), phase=0)
    # Cordel del puno a la tapa, luego la linterna (con bob) y la borla.
    C.vline(d, 22, 6, 5 + bob, WD[3])
    img.alpha_composite(lantern_layer(flame), (0, bob))
    d.point((22, 30 + bob), fill=BRASS[1])      # cuenta de la borla
    C.vline(d, 22, 31 + bob, 3, RED[2])
    d.point((21, 34 + bob), fill=RED[3])
    d.point((23, 34 + bob), fill=RED[3])
    for ox, oy in SPARKS[f]:                    # motas de chispa
        d.point((lcx + ox, lcy + oy), fill=GOLD[0])
    return img


def debug_on(bg_color, frames, name, scale):
    """Hoja de contacto sobre fondo solido para juzgar glow/contorno."""
    sheet = Image.new("RGBA", (W * len(frames), H), bg_color)
    for i, fr in enumerate(frames):
        sheet.alpha_composite(fr, (W * i, 0))
    big = sheet.resize((sheet.width * scale, sheet.height * scale), Image.NEAREST)
    C.save_out(big, name)


def main() -> None:
    frames = [render_frame(f) for f in range(4)]
    static = frames[0]
    strip = Image.new("RGBA", (W * 4, H), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        strip.alpha_composite(fr, (W * i, 0))
    # frame 0 del strip == asset estatico por construccion (mismo objeto).
    C.save_asset(static, "cosmetics", "cosmetic-avatar-lantern.png")
    C.save_asset(strip, "cosmetics", "cosmetic-avatar-lantern-strip.png")
    C.preview(static, "preview_cosmetic_avatar_lantern.png")
    C.preview(strip, "preview_cosmetic_avatar_lantern_strip.png")
    debug_on(NIGHT[3], [static], "debug_avatar_dark_static.png", 5)
    debug_on(NIGHT[3], frames, "debug_avatar_dark_strip.png", 3)
    debug_on(PAL["hanji"][1], [static], "debug_avatar_light_static.png", 5)


if __name__ == "__main__":
    main()
