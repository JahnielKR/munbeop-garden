#!/usr/bin/env python3
"""gen_clocks.py — reloj de cocina redondo retro coreano, 5 horas distintas.

Assets (96x96, fondo transparente) bajo munbeop/public/escape-room/level-01/:
  objects/obj-clock.png       -> 8:00  (canonico, Slot 4)
  objects/obj-clock-0600.png  -> 6:00
  objects/obj-clock-0700.png  -> 7:00
  objects/obj-clock-0930.png  -> 9:30
  objects/obj-clock-1100.png  -> 11:00

Una sola funcion draw_clock(hour, minute): los 5 PNG salen del mismo codigo y
solo cambian los angulos de las manecillas (math.sin/cos).

Colores: solo common.PAL + OUTLINE + SHADOW. Sin colores derivados nuevos.
Determinista: sin random (texturas por aritmetica modular).
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common
from common import OUTLINE, PAL, fill

BRASS = PAL["brass"]
HANJI = PAL["hanji"]
RED = PAL["red"]
WOODD = PAL["wood_dark"]
SHADOW_C = common.SHADOW[:3] + (255,)

CX, CY = 48, 46          # centro del reloj
R = 39                   # radio exterior (silueta OUTLINE)
FACE_R = 31              # radio de la esfera hanji (bisel brass de ~7px)
LIGHT = (-0.6, -0.8)     # luz amanecer desde arriba-izquierda

SEC_DEG = 48             # segundero rojo fijo: diagonal arriba-derecha,
                         # nunca choca con las 5 horas sorteadas


# ── geometria ────────────────────────────────────────────────────────────────

def _dir(deg: float) -> tuple[float, float]:
    """Direccion de manecilla: 0 grados = 12 en punto, sentido horario."""
    th = math.radians(deg)
    return math.sin(th), -math.cos(th)


def hand_angles(hour: int, minute: int) -> tuple[float, float]:
    minute_deg = minute * 6.0
    hour_deg = (hour % 12) * 30.0 + minute * 0.5
    return hour_deg, minute_deg


# ── cuerpo del reloj (per-pixel para circulos limpios) ──────────────────────

def _body(img) -> None:
    lx, ly = LIGHT
    px = img.load()
    for y in range(CY - R - 1, CY + R + 2):
        for x in range(CX - R - 1, CX + R + 2):
            dx, dy = x - CX, y - CY
            dist = math.hypot(dx, dy)
            if dist > R + 0.5:
                continue
            checker = (x + y) % 2
            if dist > R - 0.6:                       # silueta
                px[x, y] = OUTLINE
                continue
            # alineacion con la luz (top-left = +1, bottom-right = -1)
            shade = 0.0 if dist == 0 else (dx * lx + dy * ly) / dist
            if dist > FACE_R + 1.5:                  # bisel brass
                s = shade + (0.16 if checker else 0.0) - 0.08  # borde dithered
                if dist > R - 1.6 and shade < -0.25:
                    px[x, y] = BRASS[3]              # canto inferior oscuro
                elif s > 0.62:
                    px[x, y] = BRASS[0]              # highlight arriba-izq
                elif s > -0.15:
                    px[x, y] = BRASS[1]
                elif s > -0.68:
                    px[x, y] = BRASS[2]
                else:
                    px[x, y] = BRASS[3]
            elif dist > FACE_R + 0.5:                # junta esfera/bisel
                px[x, y] = BRASS[3]
            else:                                    # esfera hanji
                if dist > FACE_R - 2.5 and shade > 0.1:
                    # sombra interior bajo el marco (dither, lado de la luz)
                    px[x, y] = HANJI[2] if checker else HANJI[1]
                elif dist > FACE_R - 1.5 and shade < -0.55:
                    px[x, y] = HANJI[0]              # rebote de luz abajo-dcha
                elif dist > FACE_R - 4.5 and shade > 0.45 and checker:
                    px[x, y] = HANJI[1]              # degradado dithered
                elif (x * 7 + y * 11) % 37 == 3:
                    # flecks de fibra hanji dispersos (deterministas)
                    px[x, y] = HANJI[2] if (x + y * 2) % 3 == 0 else HANJI[0]
                else:
                    px[x, y] = HANJI[1]


def _gleam(img) -> None:
    """Brillo curvo del cristal siguiendo el borde superior-izquierdo."""
    px = img.load()
    for y in range(CY - R, CY):
        for x in range(CX - R, CX):
            dx, dy = x - CX, y - CY
            dist = math.hypot(dx, dy)
            if not (FACE_R - 7 <= dist <= FACE_R - 4.5):
                continue
            ang = math.atan2(dy, dx)                 # -pi..pi, -3pi/4 = NW
            if -2.55 < ang < -2.05:                  # nucleo solido
                px[x, y] = HANJI[0]
            elif -2.8 < ang < -1.8 and (x + y) % 2 == 0:
                px[x, y] = HANJI[0]                  # cola dithered


# ── marcas horarias + numerales pixel 12/3/6/9 ──────────────────────────────

FONT = {  # glifos 3x5
    "1": ("010", "110", "010", "010", "111"),
    "2": ("111", "001", "111", "100", "111"),
    "3": ("111", "001", "011", "001", "111"),
    "6": ("111", "100", "111", "101", "111"),
    "9": ("111", "101", "111", "001", "111"),
}


def _glyphs(d, cx: int, cy: int, text: str, col) -> None:
    w = len(text) * 4 - 1
    x0, y0 = cx - w // 2, cy - 2
    for k, ch in enumerate(text):
        for ry, row in enumerate(FONT[ch]):
            for rx, bit in enumerate(row):
                if bit == "1":
                    d.point((x0 + k * 4 + rx, y0 + ry), col)


def _marks(d) -> None:
    rn = FACE_R - 8                                  # radio de los numerales
    _glyphs(d, CX, CY - rn, "12", OUTLINE)
    _glyphs(d, CX + rn, CY, "3", OUTLINE)
    _glyphs(d, CX, CY + rn, "6", OUTLINE)
    _glyphs(d, CX - rn, CY, "9", OUTLINE)
    for i in range(12):
        if i % 3 == 0:
            continue
        ux, uy = _dir(i * 30)
        for s in range(7):
            r = (FACE_R - 4) + 2 * s / 6
            d.point((round(CX + ux * r), round(CY + uy * r)), WOODD[1])


# ── manecillas ───────────────────────────────────────────────────────────────

def _stamp(d, x: int, y: int, w: int, col) -> None:
    if w == 1:
        d.point((x, y), col)
    else:
        fill(d, x - 1, y - 1, w, w, col)


def _hand(d, deg: float, length: int, w: int, col, tail: int = 3,
          taper: bool = True) -> None:
    """Linea gruesa de w px desde el centro; remate de punta 1px si taper."""
    ux, uy = _dir(deg)
    n = length * 3
    for s in range(-tail * 3, n + 1):
        r = s / 3.0
        x, y = round(CX + ux * r), round(CY + uy * r)
        if taper and r > length - 1.5:
            _stamp(d, x, y, 1, col)                  # punta 1px (remate)
        else:
            _stamp(d, x, y, w, col)


def _second_hand(d, deg: float) -> None:
    ux, uy = _dir(deg)
    for s in range(-6 * 2, 24 * 2 + 1):
        r = s / 2.0
        d.point((round(CX + ux * r), round(CY + uy * r)), RED[2])
    # contrapeso elegante en la cola
    bx, by = round(CX - ux * 5), round(CY - uy * 5)
    fill(d, bx - 1, by - 1, 3, 3, RED[2])
    d.point((bx, by), RED[1])


def _screw(d) -> None:
    fill(d, CX - 2, CY - 2, 5, 5, OUTLINE)
    fill(d, CX - 1, CY - 1, 3, 3, BRASS[1])
    d.point((CX - 1, CY - 1), BRASS[0])
    d.point((CX + 1, CY + 1), BRASS[3])


# ── colgador y sombra de contacto ───────────────────────────────────────────

def _hanger(d) -> None:
    cy = CY - R - 2
    d.ellipse([CX - 4, cy - 4, CX + 4, cy + 4], fill=OUTLINE)
    d.ellipse([CX - 3, cy - 3, CX + 3, cy + 3], fill=BRASS[1])
    d.ellipse([CX - 1, cy - 1, CX + 1, cy + 1], fill=(0, 0, 0, 0))
    d.point((CX - 2, cy - 3), BRASS[0])
    d.point((CX - 3, cy - 2), BRASS[0])
    d.point((CX + 2, cy + 3), BRASS[3])


def _contact_shadow(d) -> None:
    base_y = CY + R + 1
    for row, half in enumerate((26, 21, 14)):
        y = base_y + row
        for x in range(CX - half, CX + half + 1):
            if (x + y) % 2 == 0:
                d.point((x, y), SHADOW_C)


# ── ensamblado ───────────────────────────────────────────────────────────────

def draw_clock(hour: int, minute: int):
    img, d = common.new_canvas(96, 96)
    _contact_shadow(d)
    _hanger(d)
    _body(img)
    _gleam(img)
    _marks(d)
    hour_deg, minute_deg = hand_angles(hour, minute)
    _hand(d, hour_deg, 14, 3, OUTLINE, taper=False)  # horas: corta, gruesa, roma
    _hand(d, minute_deg, 19, 2, OUTLINE)             # minutos: larga con remate
    _second_hand(d, SEC_DEG)                         # segundero rojo fijo
    _screw(d)
    return img


TIMES = [
    ("obj-clock", 8, 0),
    ("obj-clock-0600", 6, 0),
    ("obj-clock-0700", 7, 0),
    ("obj-clock-0930", 9, 30),
    ("obj-clock-1100", 11, 0),
]


def main() -> None:
    sheet, _ = common.new_canvas(96 * len(TIMES), 96)
    for i, (name, h, m) in enumerate(TIMES):
        img = draw_clock(h, m)
        common.save_asset(img, "objects", f"{name}.png")
        common.preview(img, f"preview_{name}.png")
        sheet.paste(img, (i * 96, 0))
    common.preview(sheet, "preview_obj-clock-sheet.png", scale=2)


if __name__ == "__main__":
    main()
