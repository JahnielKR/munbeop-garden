#!/usr/bin/env python3
"""Shared palette + drawing helpers for the Level 1 escape-room art pipeline.

Every gen_*.py script in this folder imports from here so the 22 assets share
one warm palette (Stardew Valley x Mother 3, per docs/escape-room.md section 8)
and one outline color. Final PNGs land under
`munbeop/public/escape-room/level-01/`; previews and debug renders under
`tools/escape-room-level01/out/` (review only, like the pixel-trees pipeline).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
LEVEL_DIR = REPO / "munbeop" / "public" / "escape-room" / "level-01"
OUT_DIR = HERE / "out"


def rgb(hex_str: str, a: int = 255) -> tuple[int, int, int, int]:
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


# Soft black shared by every sprite outline — never use #000000.
OUTLINE = rgb("#2a1c14")

# ── Palette (light → dark inside each ramp) ──────────────────────────────────
# Warm dominants: creams, ochres, peaches. Muted greens. Dawn-pink accents.

PAL = {
    # hanok structural wood (beams, furniture)
    "wood_light": [rgb(c) for c in ("#eccf9c", "#dab177", "#bd9258", "#9a6f3f")],
    "wood_dark": [rgb(c) for c in ("#a87c4e", "#83603a", "#624627", "#46311b")],
    # hanji paper (walls, windows, notes)
    "hanji": [rgb(c) for c in ("#faf3e3", "#f1e5cb", "#e2cfab", "#c9b28b")],
    # ondol floor (warm sealed paper floor)
    "floor": [rgb(c) for c in ("#e0b87f", "#caa066", "#ad8450", "#8d683c")],
    # dawn sky / golden window light
    "dawn": [rgb(c) for c in ("#fbe3bd", "#f8c89a", "#f2a585", "#dd8487", "#b96d85")],
    "gold_light": [rgb(c) for c in ("#fdeebe", "#f7d488", "#e8b45e")],
    # plants / exterior greens (muted)
    "green": [rgb(c) for c in ("#b7c489", "#94a868", "#71894c", "#536b39")],
    # fabric / futon blues (soft, never neon)
    "blue": [rgb(c) for c in ("#bcc8d4", "#92a4b8", "#6d8096", "#4e5f73")],
    # metal (lock, pots, fridge trim)
    "metal": [rgb(c) for c in ("#dde2e7", "#b3bcc5", "#878f9a", "#5d646e")],
    # brass / gold accents (clock, handles, reward shine)
    "brass": [rgb(c) for c in ("#f2d27c", "#d9ab4d", "#b08334", "#7e5c22")],
    # red accents (hilo rojo, mantel stripes, kimchi)
    "red": [rgb(c) for c in ("#ec9b8a", "#d96a5f", "#b04a44", "#7e332f")],
    # dawn pink for cosmetics / blossoms
    "pink": [rgb(c) for c in ("#f7c6c4", "#ef9da6", "#d97791", "#a85677")],
    # neutral warm grays (stone, shadow props)
    "gray": [rgb(c) for c in ("#cfc6b8", "#a89e8f", "#7e766a", "#57514a")],
    # soft night blues (avatar lantern backdrop accents)
    "night": [rgb(c) for c in ("#8b93b4", "#5f6890", "#3f4769", "#2b3049")],
}

# Warm shadow tint for floors/walls (multiply-ish step darker, not gray-blue).
SHADOW = rgb("#5e4226", 90)


# ── Canvas / IO ──────────────────────────────────────────────────────────────


def new_canvas(w: int, h: int, bg: tuple | None = None):
    """RGBA canvas; bg=None keeps it fully transparent (sprites)."""
    img = Image.new("RGBA", (w, h), bg if bg else (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save_asset(img: Image.Image, *relparts: str) -> Path:
    """Save under munbeop/public/escape-room/level-01/<relparts>."""
    path = LEVEL_DIR.joinpath(*relparts)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"asset  {path.relative_to(REPO)}")
    return path


def save_out(img: Image.Image, name: str) -> Path:
    """Save a review render (preview/debug/contact sheet) under out/."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    img.save(path)
    print(f"review {path.relative_to(REPO)}")
    return path


def preview(img: Image.Image, name: str, scale: int = 3) -> Path:
    """Nearest-neighbor upscale saved to out/ — what you Read to self-review."""
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    return save_out(big, name)


# ── Drawing helpers ──────────────────────────────────────────────────────────


def fill(d: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, c) -> None:
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def frame(d: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, c=OUTLINE) -> None:
    d.rectangle([x, y, x + w - 1, y + h - 1], outline=c, width=1)


def hline(d, x: int, y: int, w: int, c) -> None:
    d.line([x, y, x + w - 1, y], fill=c)


def vline(d, x: int, y: int, h: int, c) -> None:
    d.line([x, y, x, y + h - 1], fill=c)


def dither(d, x: int, y: int, w: int, h: int, c, phase: int = 0) -> None:
    """Checkerboard dither — the ONLY blending tool allowed (no alpha mush)."""
    for yy in range(y, y + h):
        for xx in range(x + ((yy + phase) % 2), x + w, 2):
            d.point((xx, yy), fill=c)


def wood_planks(d, x: int, y: int, w: int, h: int, ramp, plank_h: int = 8,
                seam_every: int = 0, rng=None) -> None:
    """Horizontal planks: base fill, seam lines, occasional grain ticks."""
    base, mid, dark = ramp[0], ramp[1], ramp[-1]
    fill(d, x, y, w, h, base)
    for row, yy in enumerate(range(y, y + h, plank_h)):
        hline(d, x, yy, w, dark)
        off = (row * 13) % max(w - 6, 1)
        if seam_every and row % seam_every == 0:
            vline(d, x + off, yy + 1, min(plank_h - 1, y + h - yy - 1), mid)
        for gx in range(x + (row * 7) % 11, x + w - 2, 23):
            hline(d, gx, yy + plank_h // 2, 3, mid)


def hanji_wall(d, x: int, y: int, w: int, h: int, ramp=None, fleck_step: int = 9) -> None:
    """Warm paper wall: base + sparse fiber flecks (deterministic scatter)."""
    ramp = ramp or PAL["hanji"]
    fill(d, x, y, w, h, ramp[1])
    i = 0
    for yy in range(y + 2, y + h - 2, 4):
        for xx in range(x + 2 + (yy * 3) % fleck_step, x + w - 2, fleck_step):
            d.point((xx, yy), fill=ramp[0] if i % 3 else ramp[2])
            i += 1


def glow(d, cx: int, cy: int, r: int, ramp) -> None:
    """Dithered radial glow (lantern/candle). ramp light→dark, drawn dark-out."""
    for i, c in enumerate(reversed(ramp)):
        rr = int(r * (len(ramp) - i) / len(ramp))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c)


def drop_shadow(d, x: int, y: int, w: int, h: int = 2) -> None:
    """Soft warm contact shadow under furniture/props (dithered)."""
    dither(d, x, y, w, h, SHADOW[:3] + (255,), phase=1)


def hotspot_debug(img: Image.Image, rects: list[tuple[int, int, int, int]],
                  name: str, scale: int = 3) -> Path:
    """Overlay clickable rects in red on a copy + save to out/ for alignment QA."""
    dbg = img.convert("RGBA").copy()
    d = ImageDraw.Draw(dbg)
    for (x, y, w, h) in rects:
        d.rectangle([x, y, x + w - 1, y + h - 1], outline=(255, 0, 0, 255), width=1)
    big = dbg.resize((dbg.width * scale, dbg.height * scale), Image.NEAREST)
    return save_out(big, name)
