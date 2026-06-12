#!/usr/bin/env python3
"""obj-pot.png + obj-bowl.png — close-ups clicables del puzzle Slot 3 (cocina).

- obj-pot  "olla con sopa" (냄비에 국이 있어요): olla coreana de metal oscuro
  (PAL.metal[2]/[3], brillos metal[0]) con la tapa entreabierta dejando ver el
  caldo (PAL.red + glints gold_light, cebolleta PAL.green), vapor dithered
  generoso, cucharón apoyado en la boca y llamitas cálidas en la hornilla.
- obj-bowl "cuenco con arroz" (그릇에 밥이 있어요): cuenco crema (hanji[0],
  sombra hanji[2]) sobre platito de madera, montículo de arroz casi blanco con
  grano sugerido (hanji[1]), vapor sutil y palillos de metal al lado.

Consistencia con room-03-kitchen.png (STYLE.md): olla = metal oscuro con tapa;
cuenco = hanji[0] con arroz.

Tonos derivados (STYLE.md regla 1):
  RICE_HI #fffdf6 = hanji[0] #faf3e3 aclarado ~+4% — brillo casi blanco del
  arroz recién hecho (también usado como glint cerámico puntual).
"""

from __future__ import annotations

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common
from common import OUTLINE, PAL, SHADOW, dither, fill, hline, vline

RICE_HI = common.rgb("#fffdf6")  # derivado: hanji[0] aclarado (ver docstring)

METAL = PAL["metal"]
HANJI = PAL["hanji"]
WOODL = PAL["wood_light"]
BRASS = PAL["brass"]
RED = PAL["red"]
GREEN = PAL["green"]
GOLD = PAL["gold_light"]
DAWN = PAL["dawn"]
GRAY = PAL["gray"]

SIZE = 128
SH = SHADOW[:3] + (255,)  # sombra de contacto dithered a opacidad plena


# ── helpers locales ──────────────────────────────────────────────────────────


def outline_inner(img: Image.Image) -> None:
    """Convierte el anillo exterior de píxeles opacos en OUTLINE (silueta)."""
    px = img.load()
    w, h = img.size
    ring = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or px[nx, ny][3] == 0:
                    ring.append((x, y))
                    break
    for x, y in ring:
        px[x, y] = OUTLINE


def steam_wisp(d, cx, y_bot, y_top, amp, period, half_w, c, phase=0.0,
               sparse=False) -> None:
    """Voluta de vapor: núcleo sólido que serpentea + bordes dithered."""
    for y in range(y_bot, y_top - 1, -1):
        t = y_bot - y
        off = int(round(amp * math.sin(t / period + phase)))
        if not sparse or y % 3:
            d.point((cx + off, y), fill=c)            # núcleo continuo
        grow = min(half_w, 1 + t // 8)
        for x in range(cx + off - grow, cx + off + grow + 1):
            if (x + y) % 2 == 0 and (not sparse or (x + 2 * y) % 3):
                d.point((x, y), fill=c)


def contact_shadow(d, cx, y, half_w, rows=3) -> None:
    """Mancha elíptica dithered (sombra de contacto cálida)."""
    for i in range(rows):
        hw = int(half_w * (1 - i / (rows + 0.6)))
        dither(d, cx - hw, y + i, hw * 2 + 1, 1, SH, phase=i)


# ── olla con sopa ────────────────────────────────────────────────────────────


def build_pot() -> Image.Image:
    obj = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(obj)

    # hornilla (placa oscura con patitas) + rejilla que sostiene la olla
    fill(d, 22, 108, 84, 9, METAL[3])
    hline(d, 22, 108, 84, METAL[2])
    dither(d, 24, 113, 80, 3, GRAY[3])
    fill(d, 27, 117, 7, 4, METAL[3])
    fill(d, 94, 117, 7, 4, METAL[3])
    for gx in (31, 62, 93):
        fill(d, gx, 99, 3, 9, METAL[3])

    # cuerpo de la olla (metal oscuro, luz del amanecer por la izquierda)
    bl, br, bt, bb = 25, 103, 54, 100
    fill(d, bl, bt, br - bl + 1, bb - bt + 1, METAL[2])
    fill(d, 95, bt, 9, 39, METAL[3])
    dither(d, 86, bt, 10, 39, METAL[3])
    fill(d, bl, 93, br - bl + 1, 8, METAL[3])
    dither(d, bl, 89, br - bl + 1, 4, METAL[3])
    hline(d, bl, 57, br - bl + 1, METAL[3])           # sombra bajo el borde
    fill(d, 31, 60, 6, 30, METAL[1])                  # banda de luz
    dither(d, 29, 60, 2, 30, METAL[1])
    dither(d, 37, 60, 3, 30, METAL[1])
    fill(d, 33, 64, 2, 20, METAL[0])                  # especular
    hline(d, bl, 74, br - bl + 1, METAL[3])           # nervadura del cuerpo
    hline(d, 26, 75, 36, METAL[1])
    hline(d, 62, 75, 33, METAL[2])
    dither(d, 44, 99, 40, 2, BRASS[2], phase=1)       # rescoldo reflejado
    for inset, yy in ((1, 98), (2, 99), (4, 100)):    # esquinas redondeadas
        fill(d, bl, yy, inset, 1, (0, 0, 0, 0))
        fill(d, br - inset + 1, yy, inset, 1, (0, 0, 0, 0))

    # borde superior ensanchado (rim)
    fill(d, 23, 50, 83, 4, METAL[2])
    hline(d, 23, 50, 83, METAL[1])
    hline(d, 27, 50, 24, METAL[0])
    hline(d, 23, 53, 83, METAL[3])

    # boca abierta a la izquierda: interior profundo + sopa caliente bien legible
    fill(d, 26, 41, 28, 9, OUTLINE)
    fill(d, 28, 44, 25, 5, RED[1])
    dither(d, 40, 45, 13, 4, RED[2])
    hline(d, 28, 44, 25, RED[0])                      # superficie iluminada
    dither(d, 29, 45, 10, 2, RED[0], phase=1)
    for bx, by in ((31, 45), (44, 46), (37, 44)):     # burbujas doradas
        d.point((bx, by), fill=GOLD[0])
        d.point((bx + 1, by), fill=GOLD[1])
    fill(d, 46, 44, 3, 2, HANJI[0])                   # tofu
    fill(d, 33, 47, 3, 2, HANJI[1])
    hline(d, 30, 46, 3, GREEN[1])                     # cebolleta
    hline(d, 41, 47, 3, GREEN[1])
    hline(d, 36, 48, 2, GREEN[2])
    d.point((48, 47), fill=GREEN[1])
    hline(d, 26, 39, 28, METAL[2])                    # labio trasero
    hline(d, 26, 40, 28, METAL[1])

    # tapa entreabierta: apoyada inclinada, izquierda levantada sobre el labio
    lid_l, lid_r = 54, 106
    for x in range(lid_l, lid_r + 1):
        t = (x - lid_l) / (lid_r - lid_l)
        base_y = 43 + round(6 * t)
        if base_y < 50:                               # ranura oscura tapa/rim
            vline(d, x, base_y, 50 - base_y, OUTLINE)
        e = (t - 0.5) * 2
        h = max(2, round(13 * math.sqrt(max(0.0, 1 - e * e))))
        top = base_y - h
        col = METAL[1] if t < 0.34 else (METAL[2] if t < 0.72 else METAL[3])
        vline(d, x, top, h, col)
        if h > 4:                                     # brillo del domo
            d.point((x, top + 1), fill=METAL[0] if t < 0.5 else METAL[1])
            d.point((x, top + 2), fill=METAL[1] if t < 0.5 else METAL[2])
        if h > 7:                                     # nervadura concéntrica
            d.point((x, base_y - h // 2), fill=METAL[3])
        vline(d, x, base_y - 2, 2, METAL[3])          # falda de la tapa

    # pomo de latón
    fill(d, 77, 28, 6, 5, BRASS[2])
    fill(d, 73, 24, 14, 4, BRASS[1])
    hline(d, 74, 24, 6, BRASS[0])
    hline(d, 73, 27, 14, BRASS[3])

    # cazo del cucharón asomando en la sopa
    fill(d, 36, 40, 11, 4, METAL[2])
    hline(d, 37, 40, 9, METAL[1])
    hline(d, 37, 41, 4, METAL[0])

    # mango del cucharón (4 px para que el contorno deje núcleo de metal)
    for i in range(31):
        y, x = 41 - i, 39 - i // 2
        hline(d, x, y, 4, METAL[1])
        d.point((x + 1, y), fill=METAL[0])
        d.point((x + 3, y), fill=METAL[3])
    for y in (15, 16, 17):                            # anilla de latón
        fill(d, 39 - (41 - y) // 2, y, 4, 1, BRASS[1])
    d.point((39 - (41 - 16) // 2 + 1, 16), fill=BRASS[0])
    fill(d, 21, 5, 9, 6, METAL[1])                    # remate plano con ojal
    hline(d, 22, 5, 6, METAL[0])
    vline(d, 29, 6, 5, METAL[3])
    fill(d, 24, 7, 2, 2, OUTLINE)

    # asas laterales con remache de latón
    fill(d, 16, 59, 9, 9, METAL[3])
    hline(d, 17, 60, 7, METAL[1])
    fill(d, 18, 62, 2, 2, BRASS[2])
    fill(d, 104, 59, 9, 9, METAL[3])
    hline(d, 105, 60, 7, METAL[1])
    fill(d, 109, 62, 2, 2, BRASS[2])
    vline(d, 24, 59, 9, OUTLINE)                      # separación asa/cuerpo
    vline(d, 104, 59, 9, OUTLINE)

    outline_inner(obj)

    # capa base: sombra de contacto + llamitas de la hornilla
    base = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    bd = ImageDraw.Draw(base)
    contact_shadow(bd, 64, 119, 46, rows=3)
    dither(bd, 36, 101, 56, 2, GOLD[2], phase=0)      # rescoldo bajo la base
    for i, fx in enumerate((39, 49, 57, 72, 84)):     # llamitas separadas
        h = 4 + (i % 2)
        for k in range(h):
            w = 3 if k < 2 else (2 if k < h - 1 else 1)
            c = GOLD[0] if k == 0 else (GOLD[1] if k < h - 1 else RED[2])
            hline(bd, fx - w // 2, 107 - k, w, c)

    img = Image.alpha_composite(base, obj)

    # vapor generoso saliendo de la boca y del borde de la tapa
    st = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    steam_wisp(sd, 33, 38, 5, 4.5, 7.0, 4, HANJI[0])
    steam_wisp(sd, 45, 37, 10, 3.5, 6.0, 3, HANJI[1], phase=2.1)
    steam_wisp(sd, 52, 36, 16, 2.5, 5.0, 2, HANJI[0], phase=4.2)
    return Image.alpha_composite(img, st)


# ── cuenco con arroz ─────────────────────────────────────────────────────────


def build_bowl() -> Image.Image:
    rng = random.Random(7)
    obj = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(obj)

    # platito de madera (canto + cara superior con veta)
    d.ellipse([12, 96, 108, 112], fill=WOODL[2])
    d.ellipse([12, 96, 108, 112], outline=WOODL[3])
    d.ellipse([12, 92, 108, 108], fill=WOODL[1])
    for gy, gx0, gw in ((96, 30, 26), (99, 52, 34), (102, 24, 20), (104, 58, 26)):
        hline(d, gx0, gy, gw, WOODL[2])
    d.arc([14, 93, 106, 107], 160, 300, fill=WOODL[0])
    dither(d, 40, 92, 44, 3, WOODL[3], phase=1)       # sombra del cuenco

    # pie del cuenco
    fill(d, 46, 86, 28, 7, HANJI[2])
    hline(d, 46, 92, 28, HANJI[3])
    hline(d, 47, 93, 26, OUTLINE)                     # contacto pie/plato

    # cuerpo del cuenco (crema, luz por la izquierda, medio tono amplio para
    # que el arroz casi blanco destaque)
    cx, top_y, bot_y = 60, 52, 86
    for y in range(top_y, bot_y + 1):
        u = (y - top_y) / (bot_y - top_y)
        hw = round(15 + 16 * math.sqrt(max(0.0, 1 - u * u)))
        x0, x1 = cx - hw, cx + hw
        fill(d, x0, y, hw * 2 + 1, 1, HANJI[0])
        s1 = max(4, (hw * 2) // 3)                    # medio tono
        fill(d, x1 - s1 + 1, y, s1, 1, HANJI[1])
        s2 = max(2, hw // 3)
        fill(d, x1 - s2 + 1, y, s2, 1, HANJI[2])
        s3 = max(1, hw // 7)
        fill(d, x1 - s3 + 1, y, s3, 1, HANJI[3])
        if y % 2 == 0:
            d.point((x1 - s1, y), fill=HANJI[1])
            d.point((x1 - s2, y), fill=HANJI[2])
            d.point((x1 - s3, y), fill=HANJI[3])
        if y > bot_y - 6:
            dither(d, x0 + 2, y, hw * 2 - 3, 1, HANJI[2], phase=y)
    hline(d, 46, 86, 28, HANJI[3])                    # unión cuerpo/pie
    vline(d, 36, 58, 14, RICE_HI)                     # glint cerámico
    vline(d, 38, 60, 10, HANJI[0])
    hline(d, cx - 31, top_y, 63, HANJI[1])            # labio
    hline(d, cx - 31, top_y + 1, 63, HANJI[0])
    hline(d, 31, 58, 59, HANJI[3])                    # banda decorativa
    for x in range(33, 88, 4):
        hline(d, x, 60, 2, HANJI[2])

    # montículo de arroz (casi blanco, silueta con grumos)
    lump = (0, 2, 1, 3, 2, 4, 1, 2, 0, 1, 3, 1, 4, 2, 1, 2, 3, 1, 2, 3, 1)
    for i, y in enumerate(range(31, 52)):
        v = (y - 31) / 20
        hw = round(5 + 22 * math.sqrt(min(1.0, v * 1.12))) + (lump[i] - 1)
        x0 = cx - hw
        fill(d, x0, y, hw * 2 + 1, 1, RICE_HI)
        s = max(2, hw // 3)
        fill(d, cx + hw - s + 1, y, s, 1, HANJI[0])
        if y % 3 == 0:
            d.point((cx + hw - s, y), fill=HANJI[0])
        if y > 47:
            dither(d, x0 + 1, y, hw * 2, 1, HANJI[1], phase=y)
    # granos que asoman pegados a la silueta superior
    fill(d, 56, 29, 3, 2, RICE_HI)
    fill(d, 66, 30, 2, 2, RICE_HI)
    for _ in range(85):                               # grano sugerido
        gx, gy = rng.randint(34, 86), rng.randint(33, 50)
        if abs(gx - cx) < (gy - 27) * 1.55:
            d.point((gx, gy), fill=HANJI[1])
    for _ in range(20):                               # oclusión entre grumos
        gx, gy = rng.randint(40, 82), rng.randint(45, 51)
        d.point((gx, gy), fill=HANJI[2])
    for _ in range(14):                               # granos brillantes 2px
        gx, gy = rng.randint(40, 78), rng.randint(34, 46)
        if abs(gx - cx) < (gy - 27) * 1.4:
            hline(d, gx, gy, 2, RICE_HI)
    hline(d, 34, 52, 53, OUTLINE)                     # arroz asentado en el labio

    # palillos de metal (sujeo) paralelos, apoyados en el borde del platito
    sticks = (((88, 95), (122, 113)), ((95, 90), (124, 105)))
    for (p0, p1) in sticks:
        d.line([p0, p1], fill=METAL[2], width=4)
        d.line([(p0[0] + 1, p0[1] - 1), (p1[0] + 1, p1[1] - 1)],
               fill=METAL[1], width=2)
        fill(d, p0[0] - 1, p0[1] - 2, 4, 4, BRASS[1])  # cabeza decorada
        d.point((p0[0], p0[1] - 1), fill=BRASS[0])

    outline_inner(obj)

    # capa base: sombras de contacto (cuenco + puntas de los palillos)
    base = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    bd = ImageDraw.Draw(base)
    contact_shadow(bd, 60, 111, 50, rows=3)
    dither(bd, 110, 115, 15, 2, SH, phase=0)
    dither(bd, 112, 109, 13, 2, SH, phase=1)

    img = Image.alpha_composite(base, obj)

    # vapor sutil sobre el arroz
    st = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    steam_wisp(sd, 50, 27, 12, 2.0, 7.0, 1, HANJI[0], sparse=True)
    steam_wisp(sd, 71, 26, 14, 1.8, 6.0, 1, HANJI[1], phase=1.7, sparse=True)
    return Image.alpha_composite(img, st)


# ── main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    pot = build_pot()
    bowl = build_bowl()
    common.save_asset(pot, "objects", "obj-pot.png")
    common.save_asset(bowl, "objects", "obj-bowl.png")
    common.preview(pot, "preview_obj-pot.png")
    common.preview(bowl, "preview_obj-bowl.png")
    # hoja de contexto: ambos sprites sobre suelo cálido para juzgar contraste
    ctx = Image.new("RGBA", (276, 148), PAL["floor"][1])
    cd = ImageDraw.Draw(ctx)
    common.wood_planks(cd, 0, 0, 276, 148, PAL["floor"], plank_h=10)
    ctx.alpha_composite(pot, (8, 10))
    ctx.alpha_composite(bowl, (140, 10))
    common.save_out(ctx.resize((552, 296), Image.NEAREST),
                    "preview_kitchen_objects_b_context.png")


if __name__ == "__main__":
    main()
