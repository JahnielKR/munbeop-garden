#!/usr/bin/env python3
"""Generate pixel-art achievement badge icons (32x32 RGBA, transparent BG).

Reuses the escape-room brand palette + soft-black OUTLINE so the badges match the
app's warm hand-crafted pixel-art identity. Each icon is a simple centred garden
motif; a 1px silhouette outline is added so they read on any surface.

Outputs:
  munbeop/public/img/achievements/<id>.png   (the assets the app loads)
  tools/achievements/out/_sheet.png           (an upscaled review grid)

Run from the repo root:
    python tools/achievements/gen_badges.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(REPO / "tools" / "escape-room-level01"))
from common import PAL, OUTLINE, rgb  # noqa: E402

OUT_APP = REPO / "munbeop" / "public" / "img" / "achievements"
OUT_REVIEW = HERE / "out"
S = 32  # canvas size

# ── palette shorthands (light -> dark within each ramp) ──────────────────────
GREEN = PAL["green"]
GOLD = PAL["gold_light"]
BRASS = PAL["brass"]
PINK = PAL["pink"]
RED = PAL["red"]
WOODL = PAL["wood_light"]
WOODD = PAL["wood_dark"]
HANJI = PAL["hanji"]
BLUE = PAL["blue"]
METAL = PAL["metal"]
WHITE = rgb("#fbf6ea")
SOIL = WOODD[1]
SOIL_D = WOODD[3]


# ── primitives ───────────────────────────────────────────────────────────────
def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def disc(d, cx, cy, r, c):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)


def stem(d, x, y0, y1, c=GREEN[2], w=2):
    d.line([x, y0, x, y1], fill=c, width=w)


def leaf(d, cx, cy, rx, ry, c, lean=0):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)
    if lean:
        d.ellipse([cx - rx + lean, cy - ry, cx + rx + lean, cy + ry], fill=c)


def soil(d, cx, top, w):
    """A low brown mound."""
    d.ellipse([cx - w, top, cx + w, top + 10], fill=SOIL)
    d.rectangle([cx - w, top + 4, cx + w, top + 8], fill=SOIL)
    d.ellipse([cx - w, top + 3, cx + w, top + 9], fill=SOIL_D)
    d.ellipse([cx - w, top, cx + w, top + 6], fill=SOIL)


def add_outline(img, color=OUTLINE):
    """Wrap every opaque pixel with a 1px soft-black silhouette."""
    px = img.load()
    w, h = img.size
    edge = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] != 0 and px[nx, ny] != color:
                    edge.append((x, y))
                    break
    for x, y in edge:
        px[x, y] = color


# ── icons ────────────────────────────────────────────────────────────────────
def i_sprouted(d):
    soil(d, 16, 22, 8)
    stem(d, 16, 22, 12)
    leaf(d, 12, 13, 4, 3, GREEN[1])
    leaf(d, 20, 11, 4, 3, GREEN[1])
    leaf(d, 13, 13, 3, 2, GREEN[0])
    leaf(d, 19, 11, 3, 2, GREEN[0])


def i_taking_root(d):
    # terracotta pot
    d.polygon([(10, 20), (22, 20), (20, 29), (12, 29)], fill=BRASS[1])
    d.polygon([(10, 20), (22, 20), (21, 23), (11, 23)], fill=BRASS[0])
    d.rectangle([9, 18, 23, 21], fill=BRASS[1])
    d.rectangle([9, 18, 23, 19], fill=BRASS[0])
    # young plant
    stem(d, 16, 18, 8)
    leaf(d, 12, 11, 4, 3, GREEN[1])
    leaf(d, 20, 12, 4, 3, GREEN[1])
    leaf(d, 16, 7, 3, 4, GREEN[0])


def i_watering_can(d):  # practiced_10
    # body
    d.rounded_rectangle([9, 15, 20, 26], radius=2, fill=METAL[1])
    d.rectangle([9, 15, 20, 17], fill=METAL[0])
    d.line([9, 26, 20, 26], fill=METAL[2])
    # arched handle over the top
    d.arc([10, 7, 19, 18], 180, 360, fill=METAL[2], width=2)
    # spout + sprinkler rose, upper-left
    d.line([9, 18, 4, 12], fill=METAL[2], width=3)
    d.polygon([(1, 9), (6, 10), (5, 14), (0, 13)], fill=METAL[1])
    d.line([1, 10, 5, 11], fill=METAL[0])
    # water drops
    for dx, dy in ((2, 16), (4, 19), (3, 22)):
        disc(d, dx, dy, 1, BLUE[1])


def i_books(d):  # practiced_25 — a stack of three books
    for y, ramp in ((21, GREEN), (16, RED), (11, BRASS)):
        off = -1 if ramp is RED else 0
        d.rectangle([8 + off, y, 24 + off, y + 5], fill=ramp[2])
        d.rectangle([8 + off, y, 24 + off, y + 1], fill=ramp[1])  # top highlight
        d.rectangle([21 + off, y + 1, 24 + off, y + 4], fill=HANJI[0])  # page edge
        d.line([8 + off, y + 4, 24 + off, y + 4], fill=ramp[3])  # foot shadow
        d.line([10 + off, y + 2, 19 + off, y + 2], fill=ramp[3])  # spine band


def i_sunflower(d):  # practiced_50
    stem(d, 16, 30, 16)
    leaf(d, 11, 22, 4, 2, GREEN[2])
    leaf(d, 21, 25, 4, 2, GREEN[2])
    # petals
    import math
    for k in range(10):
        a = math.radians(k * 36)
        px = 16 + round(8 * math.cos(a))
        py = 13 + round(8 * math.sin(a))
        disc(d, px, py, 3, GOLD[1])
    disc(d, 16, 13, 6, GOLD[2])
    disc(d, 16, 13, 5, WOODD[2])
    # seed speckle
    for sx, sy in ((14, 12), (17, 11), (18, 14), (15, 15)):
        d.point((sx, sy), fill=WOODD[3])


def i_flame(d):  # streak_5
    d.polygon([(16, 5), (11, 16), (12, 23), (16, 27), (21, 23), (21, 15)], fill=RED[1])
    d.polygon([(16, 9), (13, 17), (14, 23), (16, 26), (19, 22), (19, 16)], fill=RED[0])
    d.polygon([(16, 14), (14, 20), (16, 25), (18, 20)], fill=GOLD[1])
    d.polygon([(16, 18), (15, 22), (16, 25), (17, 22)], fill=GOLD[0])


def i_sparkle(d):  # flawless — a twinkling gem of light
    # 4-point star
    d.polygon([(16, 4), (18, 15), (16, 18), (14, 15)], fill=GOLD[1])
    d.polygon([(16, 28), (18, 17), (16, 14), (14, 17)], fill=GOLD[1])
    d.polygon([(4, 16), (15, 14), (18, 16), (15, 18)], fill=GOLD[1])
    d.polygon([(28, 16), (17, 14), (14, 16), (17, 18)], fill=GOLD[1])
    disc(d, 16, 16, 4, GOLD[2])
    disc(d, 16, 16, 2, WHITE)
    # little sparkles
    for sx, sy in ((25, 7), (7, 24)):
        d.line([sx - 2, sy, sx + 2, sy], fill=GOLD[0])
        d.line([sx, sy - 2, sx, sy + 2], fill=GOLD[0])


def i_comeback(d):  # bounce back — a fresh shoot from a cut stump
    # stump body
    d.rectangle([11, 19, 21, 28], fill=WOODL[2])
    d.line([11, 19, 11, 28], fill=WOODD[1]); d.line([21, 19, 21, 28], fill=WOODD[1])
    # cut surface with growth rings
    d.ellipse([10, 15, 22, 21], fill=WOODL[1])
    d.ellipse([12, 16, 20, 20], fill=WOODL[2])
    d.ellipse([14, 17, 18, 19], fill=WOODL[3])
    # fresh shoot rising from the centre
    stem(d, 16, 17, 6)
    leaf(d, 12, 9, 4, 3, GREEN[0])
    leaf(d, 20, 9, 4, 3, GREEN[0])
    leaf(d, 16, 5, 3, 3, GREEN[0])


def i_tree(d):  # mastered — a blossoming cherry tree
    # trunk + a peek of branches
    d.rectangle([14, 17, 18, 29], fill=WOODD[1])
    d.rectangle([14, 17, 15, 29], fill=WOODD[2])
    d.line([16, 19, 11, 14], fill=WOODD[1], width=2)
    d.line([16, 19, 21, 14], fill=WOODD[1], width=2)
    # irregular blossom canopy (cluster of varied discs)
    for cx, cy, r in ((16, 10, 7), (9, 12, 4), (23, 12, 4), (16, 4, 4), (11, 7, 4), (21, 7, 4)):
        disc(d, cx, cy, r, PINK[1])
    for cx, cy, r in ((13, 8, 4), (19, 9, 3), (16, 11, 3)):
        disc(d, cx, cy, r, PINK[0])  # highlights
    d.line([10, 15, 22, 15], fill=PINK[2])  # underside shade
    for sx, sy in ((12, 6), (19, 5), (15, 9), (9, 12), (23, 11), (17, 13)):
        d.point((sx, sy), fill=PINK[3])  # blossom speckle


ICONS = [
    ("sprouted", i_sprouted),
    ("taking_root", i_taking_root),
    ("practiced_10", i_watering_can),
    ("practiced_25", i_books),
    ("practiced_50", i_sunflower),
    ("streak_5", i_flame),
    ("flawless", i_sparkle),
    ("comeback", i_comeback),
    ("mastered", i_tree),
]


def render(fn) -> Image.Image:
    img, d = canvas()
    fn(d)
    add_outline(img)
    return img


def sheet(imgs: list[tuple[str, Image.Image]], cols=3, scale=8) -> Image.Image:
    bg = rgb("#cbb896")
    rows = (len(imgs) + cols - 1) // cols
    pad = 6
    cell = S + pad
    sh = Image.new("RGBA", (cols * cell + pad, rows * cell + pad), bg)
    for i, (_, im) in enumerate(imgs):
        cx = pad + (i % cols) * cell
        cy = pad + (i // cols) * cell
        sh.alpha_composite(im, (cx, cy))
    return sh.resize((sh.width * scale, sh.height * scale), Image.NEAREST)


def main() -> int:
    OUT_APP.mkdir(parents=True, exist_ok=True)
    OUT_REVIEW.mkdir(parents=True, exist_ok=True)
    rendered = []
    for name, fn in ICONS:
        im = render(fn)
        im.save(OUT_APP / f"{name}.png")
        rendered.append((name, im))
        print(f"badge  img/achievements/{name}.png")
    sheet(rendered).save(OUT_REVIEW / "_sheet.png")
    print(f"review {(OUT_REVIEW / '_sheet.png').relative_to(REPO)}  ({len(rendered)} icons)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
