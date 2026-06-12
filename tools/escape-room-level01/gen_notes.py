#!/usr/bin/env python3
"""gen_notes.py — Las 4 notas de halmeoni (close-ups 128x128, fondo transparente).

Assets: objects/note-01.png, note-02.png, note-03.png, note-final.png.
Comparten papel hanji (PAL.hanji[0]/[1]) y tinta marron (PAL.wood_dark[3]);
los garabatos son ilegibles (lineas onduladas + subrayado + circulo) porque
el texto real lo pinta la UI.

Colores: solo common.PAL / OUTLINE / SHADOW. Derivados anotados:
- PAPER_D = PAL.hanji[2] (mismo ramp hanji, oclusion de bordes y pliegues).
- Cinta de note-02: ramp PAL.gold_light en checkerboard (dither = transparencia).
- Iman de note-03, corazon de note-01 e hilo/lazo de note-final: ramp PAL.red.
Determinista: random.Random con semilla fija por nota.
"""

from __future__ import annotations

import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402
from common import OUTLINE, PAL, SHADOW  # noqa: E402

W = H = 128

PAPER = PAL["hanji"][0]      # base del papel
PAPER_S = PAL["hanji"][1]    # sombra suave / fibras
PAPER_D = PAL["hanji"][2]    # derivado: mismo ramp, oclusion fuerte (crease, flap)
INK = PAL["wood_dark"][3]    # tinta marron oscuro de halmeoni
RED = PAL["red"]
TAPE = PAL["gold_light"]
GLEAM = PAL["hanji"][0]      # brillo del iman (casi blanco calido del propio PAL)
SHADOW_PX = SHADOW[:3] + (255,)


# ── geometria del papel ──────────────────────────────────────────────────────


def wobble(n: int, rng: random.Random, hi: int = 2) -> list[int]:
    """Borde irregular de papel artesanal: offsets 0..hi que derivan despacio."""
    v = rng.randint(0, hi)
    out = []
    for _ in range(n):
        if rng.random() < 0.3:
            v = max(0, min(hi, v + rng.choice((-1, 0, 1))))
        out.append(v)
    return out


def build_mask(rng, px0, py0, pw, ph, dogear=0, notch_y=None):
    """Mascara booleana 128x128 del papel con bordes deckle + esquina dog-ear."""
    x1, y1 = px0 + pw - 1, py0 + ph - 1
    left, right = wobble(ph, rng), wobble(ph, rng)
    top, bot = wobble(pw, rng), wobble(pw, rng)
    if notch_y is not None:  # muesca del doblez en ambos lados (note-01)
        for dy, depth in ((-1, 1), (0, 2), (1, 2), (2, 1)):
            left[notch_y - py0 + dy] += depth
            right[notch_y - py0 + dy] += depth
    if dogear:  # bordes limpios cerca de la esquina doblada
        for y in range(y1 - dogear - 2, y1 + 1):
            right[y - py0] = 0
        for x in range(x1 - dogear - 2, x1 + 1):
            bot[x - px0] = 0
    mask = [[False] * W for _ in range(H)]
    for y in range(py0, y1 + 1):
        for x in range(px0, x1 + 1):
            if x < px0 + left[y - py0] or x > x1 - right[y - py0]:
                continue
            if y < py0 + top[x - px0] or y > y1 - bot[x - px0]:
                continue
            if dogear and (x + y) > (x1 + y1 - dogear):
                continue  # esquina recortada por la linea de pliegue
            mask[y][x] = True
    return mask


def col_row_max(mask):
    colmax = [-1] * W
    rowmax = [-1] * H
    for y in range(H):
        for x in range(W):
            if mask[y][x]:
                colmax[x] = max(colmax[x], y)
                rowmax[y] = max(rowmax[y], x)
    return colmax, rowmax


def col_min(mask):
    colmin = [H] * W
    for y in range(H):
        for x in range(W):
            if mask[y][x] and y < colmin[x]:
                colmin[x] = y
    return colmin


def paint_paper(img, mask, rng, crease_y=None):
    """Relleno base + banda de sombra inferior/derecha + grano y fibras hanji."""
    px = img.load()
    colmax, rowmax = col_row_max(mask)
    for y in range(H):
        for x in range(W):
            if not mask[y][x]:
                continue
            c = PAPER
            if colmax[x] - y < 3 or rowmax[y] - x < 2:
                c = PAPER_S
            px[x, y] = c
    if crease_y is not None:  # doblez por la mitad (note-01)
        for x in range(W):
            if mask[crease_y][x]:
                px[x, crease_y] = PAPER_D
            if mask[crease_y + 1][x]:
                px[x, crease_y + 1] = PAPER_S
    # beso de luz dorada del amanecer en el canto superior (gold_light[0])
    colmin = col_min(mask)
    for x in range(W):
        if colmin[x] >= H:
            continue
        for dy, dith in ((1, False), (2, True)):
            y = colmin[x] + dy
            if y < H and mask[y][x] and (not dith or (x + y) % 2 == 0):
                px[x, y] = PAL["gold_light"][0]
    # grano horizontal muy sutil
    for y in range(2, H, 7):
        for x in range((y * 5) % 11, W - 1, 13):
            if mask[y][x] and mask[y][x + 1] and px[x, y] == PAPER:
                px[x, y] = PAPER_S
                px[x + 1, y] = PAPER_S
    # fibras sueltas (motas claras/oscuras deterministas)
    xs = [x for x in range(W) if colmax[x] >= 0]
    for _ in range(95):
        x, y = rng.choice(xs), rng.randint(0, H - 1)
        if 0 <= y < H and mask[y][x] and px[x, y] == PAPER:
            px[x, y] = PAPER_S if rng.random() < 0.78 else PAPER_D


# ── garabatos de tinta ──────────────────────────────────────────────────────


def scribble(d, rng, x0, x1, lines):
    """Lineas onduladas ilegibles agrupadas en 'palabras'. Devuelve spans."""
    spans = []
    for li, y in enumerate(lines):
        row = []
        cur = x0 + (rng.randint(2, 8) if li == 0 else 0)
        end = x1 - (rng.randint(8, 22) if li == len(lines) - 1 else rng.randint(0, 8))
        while cur < end - 5:
            wlen = min(rng.randint(6, 12), end - cur)
            for i in range(wlen):
                yy = y + ((cur + i) // 3) % 2  # ondulacion
                d.point((cur + i, yy), fill=INK)
                r = rng.random()
                if r < 0.35:
                    d.point((cur + i, yy + 1), fill=INK)  # cuerpo del trazo
                elif r < 0.51:
                    d.point((cur + i, yy - 1), fill=INK)  # trazo ascendente
                if r > 0.9:
                    d.point((cur + i, yy + 2), fill=INK)  # descendente largo
            row.append((cur, cur + wlen - 1))
            cur += wlen + rng.randint(3, 4)
        spans.append((y, row))
    return spans


def signature(d, rng, x_end, y):
    """Firma de halmeoni: dos palabritas onduladas alineadas a la derecha."""
    spans = []
    cur = x_end
    for wlen in (rng.randint(9, 12), rng.randint(6, 8)):
        cur -= wlen
        for i in range(wlen):
            yy = y + ((cur + i) // 3) % 2
            d.point((cur + i, yy), fill=INK)
            if rng.random() < 0.4:
                d.point((cur + i, yy + 1), fill=INK)
        spans.append((cur, cur + wlen - 1))
        cur -= rng.randint(4, 5)
    common.hline(d, spans[-1][0] - 2, y + 4, 7, INK)  # rubrica corta
    return spans


def underline_word(d, rng, spans, line_idx):
    y, row = spans[line_idx]
    a, b = rng.choice(row)
    mid = (a + b) // 2
    common.hline(d, a - 1, y + 4, mid - a + 2, INK)
    common.hline(d, mid + 1, y + 5, b - mid + 1, INK)  # subrayado tembloroso


def circle_word(d, rng, spans, line_idx):
    y, row = spans[line_idx]
    a, b = rng.choice(row)
    d.ellipse([a - 3, y - 5, b + 3, y + 6], outline=INK)


HEART = (
    ".XX.XX.",
    "XXXXXXX",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    "...X...",
)


def draw_heart(d, hx, hy):
    """Corazon pequeno al final del texto (acento rojo del ramp PAL.red)."""
    for r, rowtxt in enumerate(HEART):
        for c, ch in enumerate(rowtxt):
            if ch == "X":
                col = RED[1] if r < 3 else RED[2]
                d.point((hx + c, hy + r), fill=col)
    d.point((hx + 1, hy + 1), fill=RED[0])  # brillito


def draw_cup(d, cx, cy):
    """Taza de cafe grande y torpe con la misma tinta (note-final)."""
    common.hline(d, cx, cy, 16, INK)              # borde
    common.hline(d, cx + 1, cy + 1, 14, PAPER)    # interior limpio
    d.line([(cx, cy + 1), (cx + 1, cy + 9)], fill=INK)        # lado izq inclinado
    d.line([(cx + 15, cy + 1), (cx + 14, cy + 9)], fill=INK)  # lado der inclinado
    common.hline(d, cx + 3, cy + 10, 10, INK)     # base
    d.point((cx + 2, cy + 10), fill=INK)
    d.point((cx + 7, cy + 10), fill=PAPER)        # hueco torpe en la base
    common.hline(d, cx + 3, cy + 3, 10, INK)      # cafe dentro (linea doble torpe)
    common.hline(d, cx + 5, cy + 4, 5, INK)
    # asa: arco de 2px a la derecha
    for p in ((cx + 16, cy + 2), (cx + 17, cy + 3), (cx + 18, cy + 4),
              (cx + 18, cy + 5), (cx + 17, cy + 6), (cx + 16, cy + 7)):
        d.point(p, fill=INK)
    for sx, off in ((cx + 4, 0), (cx + 9, 1)):    # vapor ondulado
        for k in range(6):
            d.point((sx + ((k + off) // 2) % 2, cy - 2 - k), fill=INK)


# ── post-proceso ─────────────────────────────────────────────────────────────


def shear_layer(img, mask, shift_fn):
    """Giro escalonado barato: cada fila se desplaza shift_fn(y) pixeles."""
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    m2 = [[False] * W for _ in range(H)]
    pi, po = img.load(), out.load()
    for y in range(H):
        s = shift_fn(y)
        for x in range(W):
            if mask[y][x] and 0 <= x + s < W:
                po[x + s, y] = pi[x, y]
                m2[y][x + s] = True
    return out, m2


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
    """Sombra de contacto dithered bajo el borde inferior, dentro del sprite."""
    px = img.load()
    colmax, _ = col_row_max(mask)
    xs = [x for x in range(W) if colmax[x] >= 0]
    lo, hi = min(xs) + 4, max(xs) - 3
    for x in range(lo, hi):
        if colmax[x] < 0:
            continue
        y = colmax[x] + 1
        if y < H and not mask[y][x] and (x + y) % 2 == 1:
            px[x, y] = SHADOW_PX
        y += 1  # segunda fila mucho mas dispersa, solo en el centro
        if lo + 8 < x < hi - 8 and y < H and not mask[y][x] and x % 4 == 1:
            px[x, y] = SHADOW_PX


# ── extras por nota ──────────────────────────────────────────────────────────


def draw_dogear_flap(img, x1, y1, t):
    """Esquina inferior-derecha levantada: solapa triangular con el reverso."""
    px = img.load()
    # sombra que la solapa proyecta sobre el papel (a lo largo de sus catetos)
    for k in range(2, t - 1, 2):
        px[x1 - t - 1, y1 - t + k] = PAPER_D
        px[x1 - t + k, y1 - t - 1] = PAPER_D
    for y in range(y1 - t, y1 + 1):
        for x in range(x1 - t, x1 + 1):
            s = (x - (x1 - t)) + (y - (y1 - t))
            if s > t:
                continue  # mas alla de la linea de pliegue
            if x == x1 - t or y == y1 - t or s >= t - 1:
                px[x, y] = OUTLINE  # contorno de la solapa
            elif s <= 4:
                px[x, y] = PAPER_D  # punta en oclusion
            elif s >= t - 4:
                px[x, y] = PAPER    # canto que pilla la luz del amanecer
            else:
                px[x, y] = PAPER_S  # reverso del papel


def draw_tape(img, cx, top_y):
    """Cinta semitransparente sobre el borde superior (checkerboard dither).
    Ligeramente ladeada para que se note puesta a mano."""
    px = img.load()
    x0, x1 = cx - 17, cx + 17
    for x in range(x0, x1 + 1):
        tilt = (x - x0) // 14                    # cae 2px hacia la derecha
        ty = top_y - 6 + ((x // 3) % 2) + tilt   # borde rasgado arriba
        by = top_y + 14 - (((x + 2) // 4) % 2) + tilt  # borde rasgado abajo
        for y in range(ty, by + 1):
            if (x + y) % 2 == 0:
                edge = y <= ty + 1 or y >= by - 1 or x <= x0 + 1 or x >= x1 - 1
                sheen = 7 <= (x - x0) <= 9
                px[x, y] = TAPE[2] if edge else (TAPE[0] if sheen else TAPE[1])


def draw_magnet(img, cx, cy, r=10):
    """Iman redondo rojo (note-03) con brillo y sombra del propio ramp."""
    px = img.load()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            d2 = dx * dx + dy * dy
            if d2 > r * r:
                continue
            if d2 > (r - 1) * (r - 1):
                px[cx + dx, cy + dy] = OUTLINE
                continue
            s = dx + dy
            if s >= r:
                c = RED[3]
            elif s >= r // 2:
                c = RED[2]
            elif s <= -(r - 2):
                c = RED[0]
            else:
                c = RED[1]
            px[cx + dx, cy + dy] = c
    px[cx - r // 2, cy - r // 2] = GLEAM
    px[cx - r // 2 + 1, cy - r // 2] = GLEAM
    px[cx - r // 2, cy - r // 2 + 1] = RED[0]
    # sombra que el iman proyecta sobre el papel (abajo-derecha, dithered)
    for dy in range(-2, r + 3):
        for dx in range(-2, r + 3):
            d2 = dx * dx + dy * dy
            if r * r < d2 <= (r + 2) * (r + 2) and dx + dy > 2:
                x, y = cx + dx, cy + dy
                if 0 <= x < W and 0 <= y < H and (x + y) % 2 == 0 \
                        and px[x, y] in (PAPER, PAPER_S, PAL["gold_light"][0]):
                    px[x, y] = PAPER_D


def draw_thread_bow(img, d, bx, by):
    """Hilo rojo que cruza hacia arriba + lacito en el borde superior.
    Hilo de 2px (RED[0]/RED[1] trenzado) con contorno OUTLINE a ambos lados."""
    px = img.load()
    y_top, y_bot = 0, by - 4
    for y in range(y_top, y_bot + 1):
        x = bx + round(3 * (y_bot - y) / max(y_bot, 1))
        px[x - 1, y] = OUTLINE
        px[x, y] = RED[0] if (y // 3) % 2 == 0 else RED[1]
        px[x + 1, y] = RED[1] if (y // 3) % 2 == 0 else RED[2]
        px[x + 2, y] = OUTLINE
    # lazos: dos triangulos con brillo arriba y sombra abajo
    d.polygon([(bx - 2, by), (bx - 10, by - 4), (bx - 9, by + 3)],
              fill=RED[1], outline=OUTLINE)
    d.polygon([(bx + 2, by), (bx + 10, by - 4), (bx + 9, by + 3)],
              fill=RED[1], outline=OUTLINE)
    for p in ((bx - 7, by + 1), (bx - 8, by + 1), (bx + 7, by + 1),
              (bx + 8, by + 1)):
        d.point(p, fill=RED[2])           # sombra inferior de los lazos
    d.point((bx - 8, by - 2), fill=RED[0])  # brillo superior
    d.point((bx + 8, by - 2), fill=RED[0])
    # colas cortas cayendo hacia fuera
    for k in range(4):
        px[bx - 3 - k // 2, by + 3 + k] = RED[2]
        px[bx - 4 - k // 2, by + 3 + k] = OUTLINE
        px[bx + 3 + k // 2, by + 3 + k] = RED[2]
        px[bx + 4 + k // 2, by + 3 + k] = OUTLINE
    # nudo central pequeno
    common.fill(d, bx - 1, by - 1, 3, 3, RED[1])
    d.point((bx - 1, by - 1), fill=RED[0])
    d.point((bx + 1, by + 1), fill=RED[2])
    common.frame(d, bx - 2, by - 2, 5, 5, OUTLINE)


# ── ensamblado por nota ──────────────────────────────────────────────────────

NOTES = {
    "note-01": 1,
    "note-02": 2,
    "note-03": 3,
    "note-final": 4,
}


def make_note(idx: int) -> Image.Image:
    rng = random.Random(577 + idx * 131)
    if idx == 4:  # deja sitio arriba para el hilo
        px0, py0, pw, ph = 14, 19, 100, 100
    else:
        px0, py0, pw, ph = 14, 9, 100, 106
    x1, y1 = px0 + pw - 1, py0 + ph - 1
    crease = py0 + ph // 2 if idx == 1 else None
    dog = 18 if idx == 1 else 0

    mask = build_mask(rng, px0, py0, pw, ph, dogear=dog, notch_y=crease)
    flat = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    paint_paper(flat, mask, rng, crease_y=crease)
    d = ImageDraw.Draw(flat)

    tx0, tx1 = px0 + 13, px0 + pw - 14
    n_lines = 4 if idx == 4 else 5
    lines = [py0 + 19 + i * 13 for i in range(n_lines)]
    spans = scribble(d, rng, tx0, tx1, lines)
    underline_word(d, rng, spans, 1)
    circle_word(d, rng, spans, 2)
    if idx == 4:  # taza de cafe centrada bajo el texto, sin firma encima
        y, _ = spans[-1]
        draw_cup(d, (tx0 + tx1) // 2 - 9, y + 16)
    else:  # firma de halmeoni abajo a la derecha
        sig_end = tx1 - (dog + 2) if dog else tx1 - 2
        sig = signature(d, rng, sig_end, py0 + ph - 19)
        if idx == 1:  # corazon al final del texto, junto a la firma
            draw_heart(d, sig[0][1] + 5, py0 + ph - 22)

    # giro escalonado sutil (note-03 izq, note-final der) y paso del doblez
    if idx == 1:
        flat, mask = shear_layer(flat, mask, lambda y: 1 if y > crease else 0)
        x1 += 1  # la mitad inferior (y su esquina) queda 1px a la derecha
    elif idx == 3:
        flat, mask = shear_layer(flat, mask, lambda y: -(max(0, y - py0) // 26))
    elif idx == 4:
        flat, mask = shear_layer(flat, mask, lambda y: max(0, y - py0) // 30)

    outline_silhouette(flat, mask)
    if idx == 1:
        draw_dogear_flap(flat, x1, y1, dog)
    contact_shadow(flat, mask)

    d = ImageDraw.Draw(flat)
    if idx == 2:
        draw_tape(flat, px0 + pw // 2, py0)
    elif idx == 3:
        draw_magnet(flat, px0 + 8, py0 + 8)
    elif idx == 4:
        draw_thread_bow(flat, d, px0 + pw // 2, py0 + 1)
    return flat


def contact_sheet(imgs: dict[str, Image.Image]) -> None:
    """Hoja de revision 2x2 sobre suelo ondol para juzgar siluetas/sombras."""
    pad = 12
    sheet = Image.new("RGBA", (W * 2 + pad * 3, H * 2 + pad * 3), PAL["floor"][1])
    for i, img in enumerate(imgs.values()):
        x = pad + (i % 2) * (W + pad)
        y = pad + (i // 2) * (H + pad)
        sheet.alpha_composite(img, (x, y))
    big = sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST)
    common.save_out(big, "sheet_notes.png")


def main() -> None:
    imgs = {}
    for name, idx in NOTES.items():
        img = make_note(idx)
        imgs[name] = img
        common.save_asset(img, "objects", f"{name}.png")
        common.preview(img, f"preview_{name}.png")
    contact_sheet(imgs)


if __name__ == "__main__":
    main()
