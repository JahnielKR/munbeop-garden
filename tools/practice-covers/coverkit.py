#!/usr/bin/env python3
"""Shared toolkit for the practice-hub cover art.

Covers are detailed 16:9 pixel-art vignettes (the deck cover's compositional
discipline — one bold focal subject + breathing room — rendered with the
escape-room pipeline's richness). They reuse the EXACT warm palette + drawing
helpers from the level-01 escape-room pipeline so the whole app feels like one
world (Stardew Valley x Mother 3). Final PNGs land under
`munbeop/public/games/`; review renders under `tools/practice-covers/out/`.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]

# Reuse the escape-room palette + helpers verbatim (one source of truth).
sys.path.insert(0, str(REPO / "tools" / "escape-room-level01"))
import common as _C  # noqa: E402
from common import (OUTLINE, PAL, SHADOW, dither, drop_shadow, fill, frame,  # noqa: E402,F401
                    glow, hanji_wall, hline, vline, wood_planks)

GAMES_DIR = REPO / "munbeop" / "public" / "games"
OUT_DIR = HERE / "out"

# Cover canvas — 16:9, matching the card cover area, deck-cover pixel density.
W, H = 320, 180

_FONT = "C:/Windows/Fonts/malgunbd.ttf"


def new_canvas(bg=None):
    img = Image.new("RGBA", (W, H), bg if bg else (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save_cover(img: Image.Image, name: str) -> Path:
    GAMES_DIR.mkdir(parents=True, exist_ok=True)
    path = GAMES_DIR / name
    img.convert("RGBA").save(path)
    print(f"cover  {path.relative_to(REPO)}")
    return path


def preview(img: Image.Image, name: str, scale: int = 3) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    path = OUT_DIR / name
    big.save(path)
    print(f"review {path.relative_to(REPO)}")
    return path


def card_sim(img: Image.Image, name: str, widths=(240, 280)) -> Path:
    """Render the cover at real card widths (smooth downscale) on the cream
    card so we judge exactly what the user sees in the hub."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    pad, gap = 16, 20
    tiles = []
    for cw in widths:
        ch = round(cw * 9 / 16)
        tile = img.convert("RGB").resize((cw, ch), Image.LANCZOS)
        tiles.append(tile)
    total_w = pad * 2 + sum(t.width for t in tiles) + gap * (len(tiles) - 1)
    total_h = pad * 2 + max(t.height for t in tiles)
    sheet = Image.new("RGB", (total_w, total_h), (239, 230, 214))
    x = pad
    for t in tiles:
        sheet.paste(t, (x, pad))
        x += t.width + gap
    path = OUT_DIR / name
    sheet.save(path)
    print(f"card   {path.relative_to(REPO)}")
    return path


def warm_glow(d, cx: int, cy: int, r: int, ramp=None, clip_y: int | None = None) -> None:
    """Feathered radial glow — solid light core fading to a sparse dither halo.

    Avoids the hard concentric-ring look: bands share colors from the ramp and
    the coverage drops (100% -> 50% -> 25%) toward the edge so it dissolves
    into the wall. `clip_y` stops the glow at a surface (e.g. a desk top)."""
    ramp = ramp or PAL["gold_light"]
    c0, c1, c2 = ramp[0], ramp[1], ramp[-1]
    # (outer-normalized-radius, color, coverage)
    bands = [(0.30, c0, 1.0), (0.50, c0, 0.5), (0.68, c1, 0.5), (0.86, c2, 0.25)]
    r2 = r * r
    for yy in range(cy - r, cy + r + 1):
        if clip_y is not None and yy >= clip_y:
            break
        dy = yy - cy
        for xx in range(cx - r, cx + r + 1):
            dx = xx - cx
            dist2 = dx * dx + dy * dy
            if dist2 > r2:
                continue
            dn = (dist2 ** 0.5) / r
            for edge, col, frac in bands:
                if dn <= edge:
                    if frac >= 1.0:
                        d.point((xx, yy), fill=col)
                    elif frac == 0.5:
                        if (xx + yy) & 1 == 0:
                            d.point((xx, yy), fill=col)
                    elif (xx & 1) == 0 and (yy & 1) == 0:
                        d.point((xx, yy), fill=col)
                    break


def dawn_window(d, x: int, y: int, w: int, h: int) -> None:
    """A warm dawn window — the shared light source for indoor scenes."""
    DAWN, GOLD, WOODL = PAL["dawn"], PAL["gold_light"], PAL["wood_light"]
    dither(d, x - 5, y - 4, w + 12, h + 12, GOLD[0], phase=0)
    fill(d, x - 2, y - 2, w + 4, h + 4, OUTLINE)
    fill(d, x, y, w, h, WOODL[1])
    sx, sy, sw, sh = x + 3, y + 3, w - 6, h - 6
    yy = sy
    for c, frac in ((DAWN[3], 0.18), (DAWN[2], 0.18), (DAWN[1], 0.20),
                    (DAWN[0], 0.24), (GOLD[0], 0.20)):
        bh = max(int(sh * frac), 3)
        fill(d, sx, yy, sw, bh, c)
        dither(d, sx, yy + bh - 1, sw, 2, c, phase=yy % 2)
        yy += bh
    d.ellipse([sx + sw // 2 - 6, sy + sh - 18, sx + sw // 2 + 6, sy + sh - 6],
              fill=GOLD[0])  # rising sun
    fill(d, x + w // 2 - 1, sy, 2, sh, WOODL[2])
    fill(d, sx, y + h // 2 - 1, sw, 2, WOODL[2])
    frame(d, x + 2, y + 2, w - 4, h - 4, WOODL[3])
    fill(d, x - 3, y + h, w + 6, 4, WOODL[1])
    hline(d, x - 3, y + h, w + 6, WOODL[0])
    hline(d, x - 3, y + h + 3, w + 6, OUTLINE)


def sparkle(d, cx: int, cy: int, c=None) -> None:
    c = c or PAL["gold_light"][0]
    d.point((cx, cy - 2), fill=c)
    d.point((cx - 2, cy), fill=c)
    d.point((cx, cy), fill=c)
    d.point((cx + 2, cy), fill=c)
    d.point((cx, cy + 2), fill=c)


def glyph(img: Image.Image, text: str, cx: int, cy: int, size: int,
          fill_c=OUTLINE, outline_c=None, font_path: str = _FONT) -> tuple[int, int]:
    """Crisp (hard-edged) Korean glyph centered at (cx, cy).

    Renders the TTF, thresholds the alpha so it reads as pixel art (no AA mush),
    optionally adds a 1px outline halo, and pastes it. Returns (w, h)."""
    font = ImageFont.truetype(font_path, size)
    bbox = font.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 4
    layer = Image.new("L", (tw + pad * 2, th + pad * 2), 0)
    ld = ImageDraw.Draw(layer)
    ld.text((pad - bbox[0], pad - bbox[1]), text, fill=255, font=font)
    # threshold -> hard pixel edges
    mask = layer.point(lambda v: 255 if v >= 110 else 0, mode="L")

    gw, gh = mask.size
    ox, oy = cx - gw // 2, cy - gh // 2

    if outline_c is not None:
        # 8-neighbour dilation of the mask, drawn first as the halo
        halo = Image.new("L", (gw, gh), 0)
        hd = ImageDraw.Draw(halo)
        px = mask.load()
        for yy in range(gh):
            for xx in range(gw):
                if px[xx, yy]:
                    hd.rectangle([xx - 1, yy - 1, xx + 1, yy + 1], fill=255)
        solid = Image.new("RGBA", (gw, gh), outline_c)
        img.paste(solid, (ox, oy), halo)

    solid = Image.new("RGBA", (gw, gh), fill_c)
    img.paste(solid, (ox, oy), mask)
    return gw, gh
