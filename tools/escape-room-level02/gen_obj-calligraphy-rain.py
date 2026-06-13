#!/usr/bin/env python3
"""gen_obj-calligraphy-rain.py — la caligrafia interrumpida del maestro (close-up).

Asset (exacto): objects/obj-calligraphy-rain.png — 128x128, fondo transparente.
Dossier §6 Cuarto 3: una tira de hanji colgada de una varilla fina arriba; sobre
ella, en columna vertical (세로쓰기), trazos de pincel que empiezan «비가 오» y
MUEREN a media columna — el pincel se levanto / se quedo sin tinta. El punto es
que se DETIENE: 오 queda sin terminar.

Como close-up 128x128 el «비가 오» es hangul dibujado A MANO como pincel (NO
fuente), semi-legible; la regla L2-a (cero coreano legible) aplica solo a escenas
320x240, no a este close-up.

Colores: solo common.PAL / OUTLINE / SHADOW_WARM. Anotados:
- Papel: ramp hanji (calido). Sombra/fibra del propio ramp.
- Tinta: ramp ink (negro calido). El trazo seco del corte usa ink[0] (pincel
  sin tinta) en dither sobre ink[1]/[2] del trazo humedo.
- Varilla: ramp wood_dark; remates ramp wood_light.
Determinista: random.Random con semilla fija (fibras del papel y salpicaduras).
"""

from __future__ import annotations

import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402
from common import OUTLINE, PAL, SHADOW_WARM  # noqa: E402

W = H = 128

PAPER = PAL["hanji"][0]      # base calida del hanji
PAPER_S = PAL["hanji"][1]    # fibra / sombra suave
PAPER_D = PAL["hanji"][2]    # oclusion de borde / pliegue
PAPER_E = PAL["hanji"][3]    # canto en sombra dura
INK_W = PAL["ink"][2]        # tinta humeda (corazon del trazo)
INK_M = PAL["ink"][1]        # tinta media (cuerpo / borde del trazo)
INK_D = PAL["ink"][0]        # tinta diluida / pincel casi seco (el corte)
ROD = PAL["wood_dark"][2]    # varilla de la varilla colgante (축)
ROD_HI = PAL["wood_dark"][1]
KNOB = PAL["wood_light"][1]  # remates de la varilla
SHADOW_PX = SHADOW_WARM[:3] + (255,)

DRY_START = 0.45            # punto del trazo donde el pincel empieza a secarse


# ── geometria del papel ──────────────────────────────────────────────────────

# La tira de hanji: estrecha y alta (un 족자 / colgante vertical).
PX0, PY0, PW, PH = 40, 14, 48, 104
X1, Y1 = PX0 + PW - 1, PY0 + PH - 1


def deckle(n: int, rng: random.Random, hi: int = 2) -> list[int]:
    """Borde irregular de hanji hecho a mano: offsets que derivan despacio."""
    v = rng.randint(0, hi)
    out = []
    for _ in range(n):
        if rng.random() < 0.28:
            v = max(0, min(hi, v + rng.choice((-1, 0, 1))))
        out.append(v)
    return out


def build_mask(rng) -> list[list[bool]]:
    """Mascara booleana 128x128 de la tira de papel con cantos deckle."""
    left, right = deckle(PH, rng), deckle(PH, rng)
    top, bot = deckle(PW, rng, 1), deckle(PW, rng, 1)
    mask = [[False] * W for _ in range(H)]
    for y in range(PY0, Y1 + 1):
        for x in range(PX0, X1 + 1):
            if x < PX0 + left[y - PY0] or x > X1 - right[y - PY0]:
                continue
            if y < PY0 + top[x - PX0] or y > Y1 - bot[x - PX0]:
                continue
            mask[y][x] = True
    return mask


def col_extents(mask):
    colmin = [H] * W
    colmax = [-1] * W
    rowmin = [W] * H
    rowmax = [-1] * H
    for y in range(H):
        for x in range(W):
            if mask[y][x]:
                colmin[x] = min(colmin[x], y)
                colmax[x] = max(colmax[x], y)
                rowmin[y] = min(rowmin[y], x)
                rowmax[y] = max(rowmax[y], x)
    return colmin, colmax, rowmin, rowmax


def paint_paper(img, mask, rng):
    """Relleno base + sombra inferior/derecha + grano y fibras de hanji."""
    px = img.load()
    colmin, colmax, rowmin, rowmax = col_extents(mask)
    for y in range(H):
        for x in range(W):
            if not mask[y][x]:
                continue
            c = PAPER
            # banda de oclusion en el canto derecho e inferior (vuelta de papel)
            if colmax[x] - y < 3 or rowmax[y] - x < 3:
                c = PAPER_S
            px[x, y] = c
    # beso de luz calida del alero en el canto superior-izquierdo
    for x in range(W):
        if colmin[x] >= H:
            continue
        for dy in (1, 2):
            y = colmin[x] + dy
            if y < H and mask[y][x] and (x + y) % 2 == 0:
                px[x, y] = PAL["gold_light"][0] if dy == 1 else PAPER
    # grano horizontal sutil
    for y in range(PY0 + 2, Y1, 6):
        for x in range((y * 5) % 11 + PX0, X1 - 1, 12):
            if mask[y][x] and mask[y][x + 1] and px[x, y] == PAPER:
                px[x, y] = PAPER_S
                px[x + 1, y] = PAPER_S
    # fibras sueltas deterministas
    xs = [x for x in range(W) if colmax[x] >= 0]
    for _ in range(70):
        x, y = rng.choice(xs), rng.randint(PY0, Y1)
        if mask[y][x] and px[x, y] == PAPER:
            px[x, y] = PAPER_S if rng.random() < 0.8 else PAPER_D


# ── pincel ───────────────────────────────────────────────────────────────────
# Un trazo de pincel real: entra con peso (입필, la cabeza apoya fuerte), corre
# con nucleo humedo, y sale afilando (출필). El trazo que MUERE (dry) pierde
# tinta a mitad: el cuerpo se rompe en raspado seco (갈필) y se desvanece.


def stroke(d, pts, w0=3, w1=2, dry=False, head=True, tail=True):
    """Trazo a lo largo de una polilinea con peso variable (w0 entra→w1 sale).

    head=True engruesa el arranque (la cabeza del pincel apoya). tail afina el
    final. dry=True: a partir del 55% el trazo se queda sin tinta — adelgaza a
    1px, vira a INK_D y se rompe en huecos (갈필) hasta desaparecer.
    """
    # longitud acumulada para parametrizar el peso a lo largo de TODO el trazo
    seglen = [max(abs(pts[i + 1][0] - pts[i][0]),
                  abs(pts[i + 1][1] - pts[i][1]), 1) for i in range(len(pts) - 1)]
    total = sum(seglen) or 1
    done = 0
    for i in range(len(pts) - 1):
        (ax, ay), (bx, by) = pts[i], pts[i + 1]
        steps = seglen[i]
        for s in range(steps + 1):
            g = (done + s) / total                      # 0..1 a lo largo del trazo
            x = round(ax + (bx - ax) * (s / steps))
            y = round(ay + (by - ay) * (s / steps))
            # peso base interpolado, con énfasis de cabeza/cola
            w = w0 + (w1 - w0) * g
            if head and g < 0.18:
                w += 1.2 * (1 - g / 0.18)               # 입필: apoyo de entrada
            if tail and g > 0.82 and not dry:
                w *= (1 - (g - 0.82) / 0.18) * 0.9 + 0.1  # 출필: salida afilada
            if dry and g > DRY_START:
                # se seca: adelgaza y vira a tinta diluida con huecos crecientes.
                frac = (g - DRY_START) / (1 - DRY_START)   # 0..1 dentro de la zona seca
                # la frecuencia de huecos crece con frac (el pincel salta mas)
                if frac > 0.25 and ((done + s) % (2 if frac > 0.6 else 3) == 0):
                    continue                               # 갈필: hueco de pincel seco
                if frac > 0.85:
                    break                                  # se acabo la tinta: corte
                _stamp(d, x, y, 1,
                       INK_D if frac > 0.3 else INK_M, INK_D)
                continue
            _stamp(d, x, y, int(round(w)), INK_W, INK_M)
        done += steps


def _stamp(d, x, y, w, core, edge):
    """Sella la cabeza del pincel de grosor w (1..4) centrada en (x,y)."""
    if w <= 1:
        d.point((x, y), fill=core)
        return
    # 2px: nucleo + borde inferior-derecho
    d.point((x, y), fill=core)
    d.point((x + 1, y), fill=core)
    d.point((x, y + 1), fill=edge)
    d.point((x + 1, y + 1), fill=edge)
    if w >= 3:                                          # cabeza mas ancha
        d.point((x - 1, y), fill=edge)
        d.point((x, y - 1), fill=edge)
        d.point((x + 1, y - 1), fill=edge)
    if w >= 4:
        d.point((x - 1, y + 1), fill=edge)
        d.point((x + 2, y), fill=edge)


# ── los tres silabas (hangul a mano, columna vertical) ──────────────────────
# Centro de columna x≈64. Cada bloque silabico ~26px de alto. Trazos con peso
# de pincel (entra grueso, sale afilado). El 3.o (오) MUERE a media frase.


def _circle(cx, cy, r, deg0=0, deg1=360, step=14):
    """Polilinea de un arco/circulo para trazar con pincel (sentido horario)."""
    pts = []
    for deg in range(deg0, deg1 + 1, step):
        rad = math.radians(deg)
        pts.append((round(cx + r * math.cos(rad)), round(cy + r * math.sin(rad))))
    return pts


def syl_bi(d, cx, top):
    """비 = ㅂ + ㅣ. ㅂ: dos verticales + dos horizontales (caja). ㅣ: vertical."""
    lx = cx - 10
    stroke(d, [(lx, top + 1), (lx, top + 17)], 3, 2)            # vertical izq
    stroke(d, [(lx + 10, top + 2), (lx + 10, top + 17)], 3, 2)  # vertical der
    stroke(d, [(lx, top + 8), (lx + 10, top + 8)], 3, 2)        # horizontal media
    stroke(d, [(lx, top + 17), (lx + 10, top + 17)], 3, 2)      # base
    vx = cx + 8                                                 # ㅣ vocal
    stroke(d, [(vx, top - 1), (vx, top + 19)], 4, 2)


def syl_ga(d, cx, top):
    """가 = ㄱ + ㅏ. ㄱ: techo + pierna diagonal. ㅏ: vertical + tilde derecha."""
    lx = cx - 10
    stroke(d, [(lx, top + 2), (lx + 9, top + 1)], 3, 2)         # techo ㄱ
    stroke(d, [(lx + 9, top + 1), (lx + 2, top + 18)], 4, 2)    # pierna diagonal
    vx = cx + 8                                                 # ㅏ vocal
    stroke(d, [(vx, top - 1), (vx, top + 19)], 4, 2)            # vertical
    stroke(d, [(vx, top + 8), (vx + 7, top + 7)], 3, 2)         # tilde derecha


def syl_o_broken(d, cx, top):
    """오 INTERRUMPIDO = ㅇ + ㅗ. El pincel se queda sin tinta a media silaba.

    La ㅇ se traza casi entera pero el cierre ya viene seco; la ㅗ apenas
    arranca: la vertical breve, y la base horizontal MUERE — se rompe en
    raspado seco (갈필) y se desvanece hacia la derecha. La columna queda
    inconclusa: no hay nada debajo.
    """
    # ㅇ — circulo en sentido horario desde arriba; SOLO el primer 3/4 lleva
    # tinta plena. El cierre (abajo-derecha) entra ya seco y NO se cierra: queda
    # un hueco — el primer sintoma de que el pincel se esta quedando sin tinta.
    cxx, cyy, r = cx - 3, top + 6, 5
    stroke(d, _circle(cxx, cyy, r, deg0=270, deg1=270 + 215, step=12),
           3, 2)                                               # 3/4 humedo
    stroke(d, _circle(cxx, cyy, r, deg0=270 + 215, deg1=270 + 315, step=10),
           1, 1, dry=True)                                     # cierre seco, abierto
    # ㅗ — aqui muere la frase. la vertical corta entra con la ultima tinta y ya
    # sale rascando.
    bx = cx - 2
    stroke(d, [(bx, top + 13), (bx, top + 21)], 3, 1, dry=True)
    # la base horizontal: el trazo final que el maestro nunca termino. Arranca
    # humedo a la izquierda y se DESINTEGRA hacia la derecha (갈필) hasta cortarse
    # en seco — la columna se queda sin nada debajo.
    stroke(d, [(bx - 7, top + 20), (bx + 16, top + 20)], 3, 1, dry=True)
    # 2-3 motas residuales del pincel levantandose, ya casi sin tinta
    for (ox, oy) in ((19, -1), (21, 0), (22, 2)):
        d.point((bx + ox, top + 20 + oy), fill=INK_D)


# ── varilla colgante (축) ─────────────────────────────────────────────────────


def draw_rod(d):
    """Varilla fina de madera arriba, de la que cuelga el papel, con remates."""
    ry = PY0 - 5
    rx0, rx1 = PX0 - 8, X1 + 8
    common.fill(d, rx0, ry, rx1 - rx0, 4, ROD)
    common.hline(d, rx0, ry, rx1 - rx0, ROD_HI)        # canto superior iluminado
    common.hline(d, rx0, ry + 3, rx1 - rx0, OUTLINE)
    common.frame(d, rx0, ry, rx1 - rx0, 4, OUTLINE)
    # remates redondeados a ambos extremos
    for ex in (rx0 - 2, rx1):
        d.ellipse([ex, ry - 1, ex + 4, ry + 5], fill=KNOB, outline=OUTLINE)
        d.point((ex + 1, ry), fill=PAL["wood_light"][0])
    # el papel cuelga: una sombra fina justo bajo la varilla
    common.dither(d, PX0, ry + 4, PW, 2, PAPER_E, phase=1)


# ── post-proceso silueta ──────────────────────────────────────────────────────


def outline_silhouette(img, mask):
    px = img.load()
    for y in range(H):
        for x in range(W):
            if not mask[y][x]:
                continue
            if (x == 0 or not mask[y][x - 1]) or (x == W - 1 or not mask[y][x + 1]) \
               or (y == 0 or not mask[y - 1][x]) or (y == H - 1 or not mask[y + 1][x]):
                px[x, y] = OUTLINE


def contact_shadow(img, mask):
    px = img.load()
    _, colmax, _, _ = col_extents(mask)
    xs = [x for x in range(W) if colmax[x] >= 0]
    lo, hi = min(xs) + 3, max(xs) - 3
    for x in range(lo, hi):
        y = colmax[x] + 1
        if y < H and not mask[y][x] and (x + y) % 2 == 1:
            px[x, y] = SHADOW_PX


def build() -> Image.Image:
    rng = random.Random(491)
    mask = build_mask(rng)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paint_paper(img, mask, rng)
    d = ImageDraw.Draw(img)

    # columna de caligrafia vertical, centrada
    cx = (PX0 + X1) // 2
    syl_bi(d, cx, PY0 + 8)
    syl_ga(d, cx, PY0 + 36)
    syl_o_broken(d, cx, PY0 + 64)

    outline_silhouette(img, mask)
    contact_shadow(img, mask)

    d = ImageDraw.Draw(img)
    draw_rod(d)
    return img


def main() -> None:
    img = build()
    common.save_asset(img, "objects", "obj-calligraphy-rain.png")
    common.preview(img, "preview_obj-calligraphy-rain.png")


if __name__ == "__main__":
    main()
