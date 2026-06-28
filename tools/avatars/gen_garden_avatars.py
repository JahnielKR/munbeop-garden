#!/usr/bin/env python3
"""Generate the 36 garden-avatar sprites (64x64 RGBA) + the shared legendary
frame (96x96), reusing the escape-room palette + soft-black OUTLINE so the
avatars match the app's warm pixel-art identity. 64x64 is pixel-perfect in the
portrait's 64px inner slot (no upscale blur), matching the escape-room cosmetic
avatars.

Outputs:
  munbeop/public/img/avatars/<id>.png          (36 sprites, 64x64)
  munbeop/public/img/avatars/_frame-legendary.png   (96x96 ornate gold frame)
  tools/avatars/out/_sheet_<tier>.png          (upscaled review grids)

Run from the repo root:
    python tools/avatars/gen_garden_avatars.py
"""
from __future__ import annotations
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(REPO / "tools" / "escape-room-level01"))
from common import PAL, OUTLINE, rgb  # noqa: E402

OUT_APP = REPO / "munbeop" / "public" / "img" / "avatars"
OUT_REVIEW = HERE / "out"
S = 64  # avatar canvas
FS = 96  # legendary frame canvas

# palette shorthands (light -> dark within each ramp)
GREEN = PAL["green"]; GOLD = PAL["gold_light"]; BRASS = PAL["brass"]
PINK = PAL["pink"]; RED = PAL["red"]; WOODL = PAL["wood_light"]
WOODD = PAL["wood_dark"]; HANJI = PAL["hanji"]; BLUE = PAL["blue"]
METAL = PAL["metal"]; GRAY = PAL["gray"]; NIGHT = PAL["night"]
DAWN = PAL["dawn"]
WHITE = rgb("#fbf6ea"); SOIL = WOODD[1]; SOIL_D = WOODD[3]
BLACK = OUTLINE  # soft black for eyes/pupils


def canvas(size=S):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def disc(d, cx, cy, r, c):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)


def stem(d, x, y0, y1, c=GREEN[2], w=3):
    d.line([x, y0, x, y1], fill=c, width=w)


def leaf(d, cx, cy, rx, ry, c):
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)


def soil(d, cx, top, w):
    d.ellipse([cx - w, top, cx + w, top + 18], fill=SOIL)
    d.rectangle([cx - w, top + 8, cx + w, top + 15], fill=SOIL)
    d.ellipse([cx - w, top + 6, cx + w, top + 16], fill=SOIL_D)


def eye(d, cx, cy, r=2, white=WHITE):
    """A small cartoon eye: white sclera + dark pupil + a glint."""
    disc(d, cx, cy, r, white)
    disc(d, cx, cy, max(1, r - 1), BLACK)
    d.point((cx - 1, cy - 1), fill=WHITE)


def add_outline(img, color=OUTLINE):
    """Wrap every opaque pixel with a 1px soft-black silhouette (8-neighbor)."""
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


# ═════════════════════════════════════════════════════════════════════════════
# COMMON (12) — humble, simple garden motifs
# ═════════════════════════════════════════════════════════════════════════════

# ── WORKED EXAMPLE 1 (common): a seed waking in the soil ─────────────────────
def a_seed(d):
    soil(d, 32, 40, 17)
    d.ellipse([24, 22, 40, 44], fill=WOODL[1])
    d.ellipse([24, 22, 32, 44], fill=WOODL[2])
    d.line([32, 24, 32, 40], fill=WOODD[2], width=2)
    stem(d, 32, 26, 16)
    leaf(d, 38, 14, 6, 4, GREEN[0])


def a_sprout(d):
    soil(d, 32, 42, 18)
    stem(d, 32, 44, 22)
    # two leaves up the stem + a crown leaf
    leaf(d, 22, 26, 9, 5, GREEN[1])
    leaf(d, 42, 22, 9, 5, GREEN[1])
    leaf(d, 22, 26, 6, 3, GREEN[0])
    leaf(d, 42, 22, 6, 3, GREEN[0])
    leaf(d, 32, 14, 5, 7, GREEN[0])
    d.line([32, 18, 32, 28], fill=GREEN[3])  # mid vein


def a_leaf(d):
    # a single big leaf, tilted, with veins
    d.ellipse([16, 10, 48, 52], fill=GREEN[1])
    d.ellipse([16, 10, 32, 52], fill=GREEN[0])
    d.line([22, 48, 42, 14], fill=GREEN[3], width=2)  # midrib
    for t in range(20, 46, 6):
        d.line([32, t + 2, 32 + (t - 20), t - 6], fill=GREEN[2])  # right veins
        d.line([32, t + 2, 32 - (t - 20), t + 10], fill=GREEN[2])  # left veins
    stem(d, 22, 56, 46, c=GREEN[3], w=2)


def a_pebble(d):
    # a stack of two smooth stones
    d.ellipse([14, 34, 50, 54], fill=GRAY[1])
    d.ellipse([14, 34, 50, 44], fill=GRAY[0])
    d.ellipse([22, 18, 42, 38], fill=GRAY[1])
    d.ellipse([22, 18, 42, 30], fill=GRAY[0])
    # speckle + soft shading band
    for sx, sy in ((24, 46), (38, 48), (30, 26), (35, 24)):
        d.point((sx, sy), fill=GRAY[2])
    d.line([16, 50, 48, 50], fill=GRAY[3])
    d.line([24, 35, 40, 35], fill=GRAY[2])


def a_dewdrop(d):
    # a teardrop of water with a highlight
    d.polygon([(32, 8), (44, 36), (40, 50), (24, 50), (20, 36)], fill=BLUE[1])
    d.ellipse([22, 36, 42, 54], fill=BLUE[1])
    d.ellipse([22, 36, 42, 54], fill=BLUE[1])
    d.polygon([(32, 14), (40, 36), (32, 44), (26, 36)], fill=BLUE[0])
    disc(d, 28, 34, 4, rgb("#dbe7f2"))  # bright glint
    d.point((37, 44), fill=rgb("#dbe7f2"))


def a_watering_can(d):
    # body
    d.rounded_rectangle([20, 28, 44, 52], radius=3, fill=METAL[1])
    d.rectangle([20, 28, 44, 33], fill=METAL[0])
    d.line([20, 52, 44, 52], fill=METAL[3])
    d.rectangle([22, 38, 26, 50], fill=METAL[2])  # side shade
    # arched handle
    d.arc([22, 12, 42, 34], 180, 360, fill=METAL[2], width=3)
    # spout + sprinkler rose, upper-left
    d.line([20, 34, 8, 22], fill=METAL[2], width=4)
    d.polygon([(2, 16), (12, 18), (10, 26), (0, 24)], fill=METAL[1])
    d.line([2, 18, 10, 20], fill=METAL[0])
    # water drops
    for dx, dy in ((4, 30), (8, 36), (6, 42)):
        disc(d, dx, dy, 1, BLUE[1])


def a_pot(d):
    # terracotta clay pot with a young plant
    d.polygon([(18, 32), (46, 32), (42, 54), (22, 54)], fill=BRASS[1])
    d.polygon([(18, 32), (46, 32), (44, 38), (20, 38)], fill=BRASS[0])
    d.rectangle([16, 28, 48, 33], fill=BRASS[1])
    d.rectangle([16, 28, 48, 30], fill=BRASS[0])
    d.line([24, 40, 28, 52], fill=BRASS[2])  # body shade
    d.line([38, 40, 36, 52], fill=BRASS[2])
    # plant
    stem(d, 32, 32, 16)
    leaf(d, 24, 18, 6, 4, GREEN[1])
    leaf(d, 40, 16, 6, 4, GREEN[1])
    leaf(d, 32, 10, 4, 6, GREEN[0])


def a_clover(d):
    # four-leaf clover
    for cx, cy in ((24, 24), (40, 24), (24, 40), (40, 40)):
        disc(d, cx, cy, 9, GREEN[1])
        # heart notch facing center
    disc(d, 24, 24, 6, GREEN[0])
    disc(d, 40, 24, 6, GREEN[0])
    # carve the heart lobes by re-drawing center notches
    for cx, cy in ((24, 24), (40, 24), (24, 40), (40, 40)):
        ox = 1 if cx > 32 else -1
        oy = 1 if cy > 32 else -1
        d.point((cx + 3 * ox, cy + 3 * oy), fill=GREEN[3])
    stem(d, 32, 56, 38, c=GREEN[3], w=2)
    disc(d, 32, 32, 3, GREEN[2])  # center


def a_dandelion(d):
    # a fluffy dandelion seed-head (puffball) on a stem
    stem(d, 32, 56, 24, c=GREEN[2], w=2)
    leaf(d, 24, 44, 6, 3, GREEN[2])
    disc(d, 32, 22, 13, HANJI[0])  # soft puff
    # radiating seed filaments
    for k in range(16):
        a = math.radians(k * 22.5)
        x2 = 32 + round(15 * math.cos(a)); y2 = 22 + round(15 * math.sin(a))
        d.line([32, 22, x2, y2], fill=HANJI[2])
        d.point((x2, y2), fill=WHITE)
    disc(d, 32, 22, 4, GOLD[1])  # warm core
    # a couple drifting seeds
    d.point((50, 12), fill=HANJI[2]); d.point((52, 13), fill=WHITE)
    d.point((12, 14), fill=HANJI[2]); d.point((10, 15), fill=WHITE)


def a_mushroom(d):
    # classic red-capped mushroom
    d.pieslice([14, 14, 50, 50], 180, 360, fill=RED[1])
    d.pieslice([14, 14, 50, 38], 180, 360, fill=RED[0])
    d.rectangle([14, 30, 50, 34], fill=RED[1])
    d.line([14, 33, 50, 33], fill=RED[2])
    # white spots
    for cx, cy, r in ((24, 24, 3), (40, 26, 3), (32, 20, 2), (18, 30, 2), (46, 30, 2)):
        disc(d, cx, cy, r, HANJI[0])
    # stalk
    d.rounded_rectangle([26, 33, 38, 52], radius=2, fill=HANJI[1])
    d.rectangle([26, 33, 30, 52], fill=HANJI[0])
    d.line([34, 36, 34, 50], fill=HANJI[2])
    # tiny grass tuft at base
    d.line([22, 54, 24, 49], fill=GREEN[2]); d.line([42, 54, 40, 49], fill=GREEN[2])


def a_earthworm(d):
    # a cheerful earthworm curling up out of soil
    soil(d, 32, 44, 22)
    pts = [(14, 50), (16, 38), (26, 32), (34, 38), (44, 32), (50, 20)]
    d.line(pts, fill=PINK[2], width=8, joint="curve")
    d.line(pts, fill=PINK[1], width=5, joint="curve")
    # head end (upper-right) with a face
    disc(d, 50, 20, 6, PINK[1])
    disc(d, 50, 19, 4, PINK[0])
    eye(d, 48, 18, 2)
    eye(d, 53, 19, 2)
    d.arc([47, 20, 53, 26], 0, 180, fill=BLACK)  # smile
    # segment bands
    for px, py in ((18, 40), (26, 34), (34, 38), (43, 33)):
        d.line([px - 2, py - 2, px + 2, py + 2], fill=PINK[3])


def a_ant(d):
    # a worker ant in profile
    disc(d, 44, 34, 8, NIGHT[2])   # head
    disc(d, 30, 36, 7, NIGHT[2])   # thorax
    disc(d, 16, 38, 9, NIGHT[2])   # abdomen
    disc(d, 16, 38, 9, NIGHT[2])
    disc(d, 44, 34, 8, NIGHT[2])
    # body highlights
    disc(d, 44, 32, 4, NIGHT[1]); disc(d, 16, 36, 5, NIGHT[1])
    eye(d, 47, 32, 2)
    # antennae
    d.line([48, 28, 54, 18], fill=NIGHT[2], width=2)
    d.line([44, 28, 48, 18], fill=NIGHT[2], width=2)
    # six legs
    for lx, ly in ((24, 42), (30, 44), (36, 42)):
        d.line([lx, ly, lx - 6, 54], fill=NIGHT[2], width=2)
        d.line([lx, ly, lx + 4, 54], fill=NIGHT[2], width=2)


# ═════════════════════════════════════════════════════════════════════════════
# RARE (8) — richer creatures/flowers
# ═════════════════════════════════════════════════════════════════════════════

# ── WORKED EXAMPLE 2 (rare): a honeybee ──────────────────────────────────────
def a_bee(d):
    disc(d, 32, 34, 13, GOLD[1])          # abdomen
    d.rectangle([20, 30, 44, 34], fill=WOODD[2])
    d.rectangle([20, 38, 44, 42], fill=WOODD[2])
    disc(d, 32, 22, 8, GOLD[1])           # thorax
    disc(d, 32, 13, 5, WOODD[2])          # head
    d.line([29, 9, 24, 3], fill=WOODD[2], width=2)  # antennae
    d.line([35, 9, 40, 3], fill=WOODD[2], width=2)
    leaf(d, 20, 20, 9, 5, METAL[0])       # wings
    leaf(d, 44, 20, 9, 5, METAL[0])


def a_sprout_cluster(d):
    # a planted bed (row of three sprouts in dark soil)
    d.rectangle([6, 44, 58, 56], fill=SOIL)
    d.rectangle([6, 44, 58, 48], fill=WOODD[0])
    d.ellipse([6, 40, 58, 50], fill=SOIL)
    for cx in (18, 32, 46):
        stem(d, cx, 46, 24, w=2)
        leaf(d, cx - 6, 28, 6, 3, GREEN[1])
        leaf(d, cx + 6, 26, 6, 3, GREEN[1])
        leaf(d, cx, 20, 4, 6, GREEN[0])
    # soil speckle
    for sx, sy in ((12, 52), (26, 54), (40, 51), (52, 53)):
        d.point((sx, sy), fill=WOODD[3])


def a_ladybug(d):
    # red ladybug, top-down
    disc(d, 32, 36, 17, RED[1])
    disc(d, 32, 36, 17, RED[1])
    d.pieslice([15, 19, 49, 53], 0, 180, fill=RED[0])  # nope keep dome
    disc(d, 32, 36, 17, RED[1])
    # head
    d.pieslice([22, 14, 42, 34], 180, 360, fill=NIGHT[3])
    eye(d, 27, 22, 2); eye(d, 37, 22, 2)
    # wing seam + spots
    d.line([32, 22, 32, 52], fill=NIGHT[3], width=2)
    for cx, cy in ((24, 32), (40, 32), (26, 44), (38, 44), (32, 38)):
        disc(d, cx, cy, 3, NIGHT[3])
    # little legs
    for lx in (20, 44):
        d.line([lx, 30, lx - 4 if lx < 32 else lx + 4, 26], fill=BLACK, width=1)


def a_butterfly(d):
    # symmetric butterfly, dawn-pink + gold wings
    # body
    d.rounded_rectangle([30, 18, 34, 48], radius=2, fill=WOODD[2])
    disc(d, 32, 16, 3, WOODD[2])  # head
    d.line([30, 13, 26, 6], fill=WOODD[2], width=2)  # antennae
    d.line([34, 13, 38, 6], fill=WOODD[2], width=2)
    # upper wings
    for sgn in (-1, 1):
        d.polygon([(32, 22), (32 + sgn * 24, 12), (32 + sgn * 22, 30), (32, 30)], fill=PINK[1])
        d.polygon([(32, 22), (32 + sgn * 16, 16), (32 + sgn * 15, 28), (32, 28)], fill=PINK[0])
        disc(d, 32 + sgn * 16, 20, 3, GOLD[1])
        # lower wings
        d.polygon([(32, 32), (32 + sgn * 20, 34), (32 + sgn * 14, 48), (32, 44)], fill=PINK[2])
        disc(d, 32 + sgn * 14, 40, 2, GOLD[1])


def a_tulip(d):
    # a single tulip bloom on a leafy stem
    stem(d, 32, 56, 30, c=GREEN[2], w=3)
    leaf(d, 20, 44, 8, 4, GREEN[1])
    leaf(d, 44, 38, 8, 4, GREEN[1])
    leaf(d, 20, 44, 8, 4, GREEN[1])
    # cup of three petals
    d.polygon([(20, 30), (24, 12), (32, 24)], fill=RED[1])
    d.polygon([(44, 30), (40, 12), (32, 24)], fill=RED[1])
    d.polygon([(22, 28), (32, 8), (42, 28), (32, 30)], fill=RED[0])
    d.rounded_rectangle([22, 22, 42, 32], radius=4, fill=RED[1])
    d.polygon([(22, 26), (32, 10), (42, 26)], fill=RED[0])
    # petal seams + highlight
    d.line([32, 12, 32, 30], fill=RED[2])
    d.line([26, 22, 28, 30], fill=PINK[0]); d.line([38, 22, 36, 30], fill=PINK[0])


def a_frog(d):
    # a round green frog, front view
    disc(d, 32, 40, 18, GREEN[1])
    disc(d, 32, 44, 18, GREEN[1])
    d.ellipse([14, 30, 50, 56], fill=GREEN[1])
    d.ellipse([14, 38, 50, 56], fill=GREEN[2])  # belly shade
    d.ellipse([22, 48, 42, 56], fill=GREEN[0])  # pale belly
    # eyes bulging on top
    disc(d, 22, 24, 7, GREEN[1]); disc(d, 42, 24, 7, GREEN[1])
    disc(d, 22, 24, 4, WHITE); disc(d, 42, 24, 4, WHITE)
    disc(d, 22, 25, 2, BLACK); disc(d, 42, 25, 2, BLACK)
    # smile + nostrils
    d.arc([22, 34, 42, 46], 0, 180, fill=GREEN[3], width=2)
    d.point((29, 32), fill=GREEN[3]); d.point((35, 32), fill=GREEN[3])
    # spots + feet
    disc(d, 24, 40, 2, GREEN[0]); disc(d, 40, 42, 2, GREEN[0])
    for fx in (18, 46):
        disc(d, fx, 56, 4, GREEN[2])


def a_sunflower(d):
    stem(d, 32, 60, 30, c=GREEN[2], w=3)
    leaf(d, 20, 46, 8, 4, GREEN[1])
    leaf(d, 44, 50, 8, 4, GREEN[1])
    # petals
    for k in range(12):
        a = math.radians(k * 30)
        px = 32 + round(16 * math.cos(a)); py = 24 + round(16 * math.sin(a))
        d.polygon([(32 + round(8 * math.cos(a)), 24 + round(8 * math.sin(a))),
                   (px + round(3 * math.cos(a + 1.4)), py + round(3 * math.sin(a + 1.4))),
                   (px + round(3 * math.cos(a - 1.4)), py + round(3 * math.sin(a - 1.4)))],
                  fill=GOLD[1])
    disc(d, 32, 24, 11, GOLD[2])
    disc(d, 32, 24, 9, WOODD[2])
    # seed speckle
    for sx, sy in ((28, 20), (35, 19), (37, 26), (29, 28), (32, 24), (25, 24), (39, 22)):
        d.point((sx, sy), fill=WOODD[3])


def a_carrot(d):
    # a carrot with leafy top
    d.polygon([(24, 22), (40, 22), (32, 58)], fill=BRASS[1])
    d.polygon([(24, 22), (32, 22), (32, 58)], fill=BRASS[0])  # light side
    # ridge lines
    for ry in (30, 38, 46):
        w = (58 - ry) // 3
        d.line([32 - w, ry, 32 + w, ry + 3], fill=BRASS[2])
    # leafy green top
    for dx in (-8, -3, 3, 8):
        d.line([32, 24, 32 + dx, 6], fill=GREEN[2], width=2)
        leaf(d, 32 + dx, 8, 3, 5, GREEN[1])
    leaf(d, 32, 6, 4, 6, GREEN[0])


# ═════════════════════════════════════════════════════════════════════════════
# EPIC (8) — detailed animals, more prestige
# ═════════════════════════════════════════════════════════════════════════════

def a_fox(d):
    # fox head, pointed ears, white cheeks
    # ears
    d.polygon([(14, 30), (20, 8), (30, 24)], fill=BRASS[1])
    d.polygon([(50, 30), (44, 8), (34, 24)], fill=BRASS[1])
    d.polygon([(18, 26), (21, 14), (27, 24)], fill=WOODD[1])  # inner ear
    d.polygon([(46, 26), (43, 14), (37, 24)], fill=WOODD[1])
    # face
    d.polygon([(14, 26), (50, 26), (44, 44), (32, 54), (20, 44)], fill=BRASS[1])
    # white cheeks/muzzle
    d.polygon([(24, 36), (32, 54), (28, 40)], fill=HANJI[0])
    d.polygon([(40, 36), (32, 54), (36, 40)], fill=HANJI[0])
    d.polygon([(26, 38), (38, 38), (32, 54)], fill=HANJI[0])
    # eyes + nose
    eye(d, 25, 32, 3); eye(d, 39, 32, 3)
    disc(d, 32, 48, 3, BLACK)  # nose
    d.line([26, 28, 22, 30], fill=BRASS[2]); d.line([38, 28, 42, 30], fill=BRASS[2])


def a_owl(d):
    # round owl with big eyes
    d.ellipse([14, 16, 50, 56], fill=WOODL[1])
    d.ellipse([14, 16, 50, 56], fill=WOODL[1])
    d.ellipse([18, 30, 46, 56], fill=WOODL[0])  # pale belly
    # ear tufts
    d.polygon([(16, 18), (22, 4), (28, 18)], fill=WOODL[2])
    d.polygon([(48, 18), (42, 4), (36, 18)], fill=WOODL[2])
    # facial disc / big eyes
    disc(d, 24, 28, 9, HANJI[0]); disc(d, 40, 28, 9, HANJI[0])
    disc(d, 24, 28, 6, GOLD[1]); disc(d, 40, 28, 6, GOLD[1])
    disc(d, 24, 28, 3, BLACK); disc(d, 40, 28, 3, BLACK)
    d.point((23, 27), fill=WHITE); d.point((39, 27), fill=WHITE)
    # beak
    d.polygon([(30, 32), (34, 32), (32, 38)], fill=BRASS[1])
    # wing/feather hints
    d.arc([14, 24, 30, 54], 60, 180, fill=WOODL[2], width=2)
    d.arc([34, 24, 50, 54], 0, 120, fill=WOODL[2], width=2)
    for fy in (40, 46):
        for fx in (24, 30, 36):
            d.point((fx, fy), fill=WOODL[2])
    # feet
    d.line([26, 56, 26, 60], fill=BRASS[2], width=2)
    d.line([38, 56, 38, 60], fill=BRASS[2], width=2)


def a_hedgehog(d):
    # hedgehog with spiky back + cute face
    # spiky body (cluster of triangle quills)
    cx, cy = 30, 38
    for k in range(0, 13):
        a = math.radians(110 + k * 13)
        bx = cx + round(20 * math.cos(a)); by = cy + round(18 * math.sin(a))
        tx = cx + round(26 * math.cos(a)); ty = cy + round(24 * math.sin(a))
        d.line([bx, by, tx, ty], fill=WOODD[1], width=3)
    d.ellipse([14, 24, 46, 54], fill=WOODD[2])  # body base under quills
    for k in range(0, 13):
        a = math.radians(110 + k * 13)
        tx = cx + round(24 * math.cos(a)); ty = cy + round(22 * math.sin(a))
        d.line([cx, cy, tx, ty], fill=WOODD[1], width=2)
    # face (lower-right, peeking out)
    disc(d, 44, 42, 9, WOODL[0])
    disc(d, 52, 44, 3, NIGHT[3])  # nose
    eye(d, 46, 38, 2)
    # tiny ear + feet
    disc(d, 40, 33, 3, WOODL[1])
    d.line([40, 52, 40, 56], fill=NIGHT[3], width=2)
    d.line([50, 52, 50, 56], fill=NIGHT[3], width=2)


def a_koi(d):
    # koi fish, side profile facing right, white + red blotches
    # flowing tail fin (left)
    d.polygon([(10, 32), (2, 18), (8, 32), (2, 46), (12, 40)], fill=HANJI[1])
    d.polygon([(11, 33), (5, 24), (12, 36)], fill=HANJI[2])
    # oval body, head to the right
    d.ellipse([10, 24, 52, 46], fill=HANJI[0])
    d.ellipse([10, 32, 52, 46], fill=HANJI[1])  # belly shade
    # dorsal + pelvic fins
    d.polygon([(26, 26), (32, 14), (40, 26)], fill=PINK[1])
    d.polygon([(24, 44), (30, 54), (36, 44)], fill=PINK[1])
    # red markings (classic kohaku)
    disc(d, 40, 30, 6, RED[1]); disc(d, 26, 32, 5, RED[1])
    disc(d, 33, 38, 3, RED[0])
    # head detail: eye + mouth (right end)
    eye(d, 47, 31, 3)
    d.arc([46, 34, 54, 42], 280, 360, fill=NIGHT[3])  # mouth
    d.polygon([(50, 36), (56, 38), (50, 40)], fill=PINK[0])  # lips
    # whisker barbels
    d.line([52, 38, 58, 36], fill=NIGHT[3]); d.line([52, 40, 58, 42], fill=NIGHT[3])
    # scale hints
    for sx, sy in ((22, 36), (30, 34), (38, 36)):
        d.arc([sx - 2, sy - 2, sx + 2, sy + 2], 200, 340, fill=HANJI[2])
    # water bubbles
    disc(d, 56, 22, 2, BLUE[0]); d.point((58, 18), fill=BLUE[0])
    disc(d, 14, 52, 2, BLUE[0])


def a_magpie(d):
    # Korean magpie (까치): black head/back, white belly, blue tail
    # tail
    d.polygon([(6, 52), (22, 40), (26, 48), (12, 58)], fill=NIGHT[3])
    d.polygon([(8, 52), (22, 42), (24, 47), (12, 56)], fill=NIGHT[2])  # blue sheen
    # body
    d.ellipse([20, 26, 48, 56], fill=NIGHT[3])
    d.ellipse([26, 36, 46, 56], fill=HANJI[0])  # white belly
    # wing
    d.polygon([(28, 30), (44, 32), (34, 50)], fill=NIGHT[3])
    d.line([34, 34, 40, 44], fill=NIGHT[2])
    # head
    disc(d, 42, 24, 9, NIGHT[3])
    eye(d, 45, 22, 2)
    d.polygon([(50, 24), (60, 26), (50, 28)], fill=BRASS[2])  # beak
    # feet
    d.line([34, 56, 34, 60], fill=BRASS[2], width=2)
    d.line([40, 56, 40, 60], fill=BRASS[2], width=2)


def a_crane(d):
    # red-crowned crane standing
    # legs
    d.line([28, 44, 26, 60], fill=WOODD[2], width=2)
    d.line([34, 44, 36, 60], fill=WOODD[2], width=2)
    # body
    d.ellipse([18, 32, 46, 50], fill=HANJI[0])
    d.polygon([(40, 38), (52, 44), (42, 48)], fill=NIGHT[3])  # black tail plumes
    # long neck up to head
    d.line([30, 36, 36, 12], fill=HANJI[0], width=5)
    d.line([31, 22, 35, 14], fill=NIGHT[3], width=2)  # black neck band
    disc(d, 37, 12, 5, HANJI[0])  # head
    disc(d, 37, 9, 3, RED[1])     # red crown
    eye(d, 38, 12, 1)
    d.polygon([(41, 12), (52, 13), (41, 15)], fill=GOLD[2])  # beak
    # wing accent
    d.arc([18, 32, 46, 50], 200, 340, fill=GRAY[1], width=1)


def a_raccoon_dog(d):
    # 너구리 — round face with dark mask
    disc(d, 32, 38, 18, WOODL[2])
    disc(d, 32, 42, 18, WOODL[2])
    d.ellipse([14, 22, 50, 56], fill=WOODL[2])
    # ears
    disc(d, 18, 22, 7, WOODL[2]); disc(d, 46, 22, 7, WOODL[2])
    disc(d, 18, 22, 4, WOODD[1]); disc(d, 46, 22, 4, WOODD[1])
    # white muzzle/cheeks
    d.ellipse([22, 36, 42, 54], fill=HANJI[0])
    # dark eye mask
    d.polygon([(16, 30), (30, 28), (28, 40), (18, 42)], fill=WOODD[3])
    d.polygon([(48, 30), (34, 28), (36, 40), (46, 42)], fill=WOODD[3])
    disc(d, 24, 34, 3, WHITE); disc(d, 40, 34, 3, WHITE)
    disc(d, 24, 35, 2, BLACK); disc(d, 40, 35, 2, BLACK)
    # nose + mouth
    disc(d, 32, 44, 3, BLACK)
    d.line([32, 46, 32, 50], fill=WOODD[3]); d.arc([26, 46, 38, 52], 0, 180, fill=WOODD[3])


def a_persimmon(d):
    # a ripe persimmon fruit with leafy calyx
    disc(d, 32, 38, 18, BRASS[1])
    disc(d, 32, 38, 18, BRASS[1])
    d.ellipse([16, 26, 48, 56], fill=BRASS[1])
    d.ellipse([16, 30, 38, 56], fill=GOLD[2])  # warm light side
    d.arc([16, 26, 48, 56], 20, 160, fill=BRASS[2], width=2)  # bottom shade
    # calyx (4 green leaves on top)
    for dx, dy in ((-9, -2), (9, -2), (0, -6), (0, 2)):
        leaf(d, 32 + dx, 22 + dy, 6, 4, GREEN[2])
    disc(d, 32, 22, 3, GREEN[3])
    d.line([32, 18, 32, 12], fill=WOODD[2], width=2)  # little stalk
    # highlight + dimple
    disc(d, 24, 34, 3, GOLD[1])
    d.line([28, 50, 36, 50], fill=BRASS[3])


# ═════════════════════════════════════════════════════════════════════════════
# LEGENDARY (8) — the showcase: ornate, mythic, gold accents
# ═════════════════════════════════════════════════════════════════════════════

def _aura(d, cx, cy, r):
    """A faint radiant gold aura behind legendaries."""
    for k in range(16):
        a = math.radians(k * 22.5)
        x2 = cx + round(r * math.cos(a)); y2 = cy + round(r * math.sin(a))
        x1 = cx + round((r - 4) * math.cos(a)); y1 = cy + round((r - 4) * math.sin(a))
        d.line([x1, y1, x2, y2], fill=GOLD[0])


def a_tiger(d):
    # majestic tiger face, orange with black stripes
    _aura(d, 32, 32, 30)
    # ears
    disc(d, 16, 18, 7, BRASS[1]); disc(d, 48, 18, 7, BRASS[1])
    disc(d, 16, 18, 4, NIGHT[3]); disc(d, 48, 18, 4, NIGHT[3])
    # head
    d.ellipse([12, 14, 52, 54], fill=BRASS[1])
    # white cheeks + muzzle
    d.ellipse([18, 34, 46, 56], fill=HANJI[0])
    disc(d, 24, 24, 7, HANJI[0]); disc(d, 40, 24, 7, HANJI[0])  # brow pads
    # stripes
    for sx in (16, 22, 42, 48):
        sgn = -1 if sx < 32 else 1
        d.line([sx, 16, sx + sgn * 3, 30], fill=NIGHT[3], width=2)
    d.line([32, 12, 32, 22], fill=NIGHT[3], width=2)
    d.line([14, 36, 22, 38], fill=NIGHT[3], width=2)
    d.line([50, 36, 42, 38], fill=NIGHT[3], width=2)
    # 王 forehead mark
    d.line([28, 14, 36, 14], fill=NIGHT[3]); d.line([28, 18, 36, 18], fill=NIGHT[3])
    d.line([32, 12, 32, 20], fill=NIGHT[3])
    # eyes + nose + mouth
    disc(d, 24, 26, 4, GOLD[1]); disc(d, 40, 26, 4, GOLD[1])
    disc(d, 24, 26, 2, BLACK); disc(d, 40, 26, 2, BLACK)
    d.polygon([(28, 40), (36, 40), (32, 45)], fill=PINK[2])  # nose
    d.line([32, 45, 32, 50], fill=NIGHT[3])
    d.arc([24, 46, 32, 52], 270, 360, fill=NIGHT[3]); d.arc([32, 46, 40, 52], 180, 270, fill=NIGHT[3])
    # whiskers
    d.line([20, 44, 8, 42], fill=HANJI[2]); d.line([20, 46, 8, 48], fill=HANJI[2])
    d.line([44, 44, 56, 42], fill=HANJI[2]); d.line([44, 46, 56, 48], fill=HANJI[2])


def a_phoenix(d):
    # 봉황 — a phoenix rising in flame colors
    _aura(d, 32, 34, 30)
    # spread wings
    d.polygon([(30, 30), (4, 16), (10, 30), (2, 38), (16, 38), (28, 40)], fill=RED[1])
    d.polygon([(34, 30), (60, 16), (54, 30), (62, 38), (48, 38), (36, 40)], fill=RED[1])
    d.polygon([(30, 32), (10, 22), (16, 34), (28, 38)], fill=GOLD[1])
    d.polygon([(34, 32), (54, 22), (48, 34), (36, 38)], fill=GOLD[1])
    # body
    d.ellipse([26, 30, 38, 52], fill=RED[1])
    d.ellipse([28, 34, 36, 52], fill=GOLD[1])
    # flaming tail plumes
    for dx, col in ((-8, RED[0]), (0, GOLD[1]), (8, RED[0])):
        d.polygon([(32, 48), (32 + dx - 2, 62), (32 + dx + 2, 60), (32 + dx, 50)], fill=col)
    # head + crest
    disc(d, 32, 22, 6, RED[1])
    d.line([32, 16, 30, 6], fill=GOLD[1], width=2)  # crest plumes
    d.line([32, 16, 34, 4], fill=GOLD[2], width=2)
    d.line([32, 16, 38, 8], fill=RED[0], width=2)
    eye(d, 33, 21, 2)
    d.polygon([(36, 22), (44, 24), (36, 26)], fill=GOLD[2])  # beak


def a_dragon(d):
    # 용 — an Eastern dragon: big head upper-right, serpentine body coiling down-left
    _aura(d, 32, 32, 30)
    # serpentine body trailing from the head down to the lower-left
    coil = [(34, 40), (24, 48), (14, 46), (8, 54)]
    d.line(coil, fill=GREEN[2], width=9, joint="curve")
    d.line(coil, fill=GREEN[1], width=5, joint="curve")
    # dorsal spines along the body
    for sx, sy in ((28, 44), (18, 46), (10, 50)):
        d.polygon([(sx, sy - 4), (sx - 3, sy + 1), (sx + 3, sy + 1)], fill=GREEN[3])
    # big head, facing left-down
    d.ellipse([30, 16, 56, 42], fill=GREEN[1])
    d.ellipse([34, 24, 54, 42], fill=GREEN[0])  # cheek light
    # snout/jaw pointing left
    d.polygon([(30, 28), (18, 32), (32, 38)], fill=GREEN[1])
    d.polygon([(20, 31), (30, 30), (30, 35)], fill=GREEN[0])
    d.line([20, 33, 30, 33], fill=GREEN[3])  # mouth line
    # golden antler-horns swept back
    d.line([46, 18, 52, 4], fill=GOLD[2], width=3)
    d.line([48, 8, 56, 6], fill=GOLD[2], width=2)
    d.line([40, 18, 42, 6], fill=GOLD[2], width=2)
    # red flame mane between horns
    for mx in (38, 44, 50):
        d.polygon([(mx, 18), (mx - 2, 8), (mx + 2, 10)], fill=RED[1])
    # eye + nostril + brow
    disc(d, 44, 26, 4, GOLD[1]); disc(d, 44, 26, 2, BLACK)
    d.point((44, 25), fill=WHITE)
    d.line([40, 22, 48, 21], fill=GREEN[3], width=2)  # brow ridge
    d.point((22, 31), fill=NIGHT[3])  # nostril
    # golden whiskers
    d.line([20, 33, 6, 30], fill=GOLD[1], width=2); d.line([20, 36, 8, 40], fill=GOLD[1], width=2)
    # belly scales hint
    for sx, sy in ((40, 34), (46, 34)):
        d.arc([sx - 2, sy - 2, sx + 2, sy + 2], 20, 160, fill=GREEN[3])


def a_dokkaebi(d):
    # 도깨비 — Korean goblin mask: blue-green face, horns, fierce grin
    _aura(d, 32, 34, 30)
    # horns
    d.polygon([(16, 18), (10, 2), (22, 14)], fill=HANJI[1])
    d.polygon([(48, 18), (54, 2), (42, 14)], fill=HANJI[1])
    d.line([13, 8, 18, 14], fill=WOODD[2]); d.line([51, 8, 46, 14], fill=WOODD[2])
    # face
    d.ellipse([12, 14, 52, 56], fill=GREEN[2])
    d.ellipse([12, 14, 52, 56], fill=GREEN[2])
    d.ellipse([16, 20, 48, 54], fill=BLUE[2])  # blue-green sheen
    # wild eyebrows + bulging eyes
    d.line([18, 26, 28, 24], fill=NIGHT[3], width=3); d.line([46, 26, 36, 24], fill=NIGHT[3], width=3)
    disc(d, 24, 30, 6, GOLD[1]); disc(d, 40, 30, 6, GOLD[1])
    disc(d, 24, 30, 3, BLACK); disc(d, 40, 30, 3, BLACK)
    d.point((23, 29), fill=WHITE); d.point((39, 29), fill=WHITE)
    # nose
    d.polygon([(28, 34), (36, 34), (32, 42)], fill=GREEN[3])
    # fierce grin with fangs
    d.arc([20, 38, 44, 54], 0, 180, fill=NIGHT[3], width=2)
    d.polygon([(24, 44), (27, 50), (29, 44)], fill=WHITE)  # fang
    d.polygon([(40, 44), (37, 50), (35, 44)], fill=WHITE)
    # beard + a hint of the magic club shading
    for bx in (22, 28, 34, 40):
        d.line([bx, 52, bx, 58], fill=NIGHT[3])


def a_golden_toad(d):
    # 두꺼비 — a golden toad of fortune
    _aura(d, 32, 36, 30)
    # body
    d.ellipse([10, 30, 54, 58], fill=GOLD[1])
    d.ellipse([18, 42, 46, 58], fill=GOLD[2])  # belly
    # head bump with eyes on top
    d.ellipse([16, 18, 48, 42], fill=GOLD[1])
    disc(d, 24, 22, 7, GOLD[1]); disc(d, 40, 22, 7, GOLD[1])
    disc(d, 24, 22, 4, WHITE); disc(d, 40, 22, 4, WHITE)
    disc(d, 24, 23, 2, BLACK); disc(d, 40, 23, 2, BLACK)
    # wide mouth + a lucky coin
    d.arc([18, 28, 46, 42], 0, 180, fill=BRASS[3], width=2)
    disc(d, 32, 40, 5, GOLD[2]); disc(d, 32, 40, 4, BRASS[1])
    d.rectangle([30, 38, 34, 42], fill=BRASS[3])  # coin square hole
    # warty speckle
    for sx, sy in ((20, 48), (28, 52), (38, 50), (46, 46), (24, 36), (42, 36)):
        d.point((sx, sy), fill=BRASS[2])
    # webbed feet
    for fx in (16, 48):
        d.polygon([(fx, 56), (fx - 4, 60), (fx, 58), (fx + 4, 60)], fill=GOLD[1])


def a_golden_crane(d):
    # 금학 — a radiant golden crane in flight, gilded + ornate
    _aura(d, 32, 32, 30)
    # two long sweeping wings (gold), tips fanned with brass feathers
    d.polygon([(28, 30), (4, 18), (12, 32), (2, 38), (18, 38), (30, 36)], fill=GOLD[1])
    d.polygon([(36, 30), (60, 18), (52, 32), (62, 38), (46, 38), (34, 36)], fill=GOLD[1])
    for fx in (8, 12, 16):
        d.line([fx, 24, fx + 3, 34], fill=BRASS[2])      # left feather seams
        d.line([64 - fx, 24, 61 - fx, 34], fill=BRASS[2])  # right feather seams
    # body (gold) + gilded tail plumes hanging down
    d.ellipse([24, 28, 40, 50], fill=GOLD[1])
    d.ellipse([26, 36, 38, 50], fill=GOLD[2])
    for dx in (-3, 0, 3):
        d.polygon([(32 + dx, 46), (30 + dx, 60), (34 + dx, 58)], fill=BRASS[2])
    # trailing legs
    d.line([29, 50, 27, 62], fill=BRASS[3], width=2)
    d.line([35, 50, 37, 62], fill=BRASS[3], width=2)
    # long neck up to head (S-curve)
    d.line([30, 32, 32, 18], fill=GOLD[1], width=4)
    d.line([32, 18, 38, 12], fill=GOLD[1], width=4)
    disc(d, 39, 11, 5, GOLD[1])         # head
    disc(d, 39, 8, 3, RED[1])           # red crown
    eye(d, 40, 11, 1)
    d.polygon([(43, 11), (56, 12), (43, 14)], fill=BRASS[3])  # beak
    # ornate breast accent
    disc(d, 32, 36, 2, BRASS[3])


def a_white_tiger(d):
    # 백호 — the white tiger of the West, white fur + slate stripes + blue eyes
    _aura(d, 32, 32, 30)
    # ears
    disc(d, 16, 18, 7, HANJI[0]); disc(d, 48, 18, 7, HANJI[0])
    disc(d, 16, 18, 4, PINK[1]); disc(d, 48, 18, 4, PINK[1])
    # head
    d.ellipse([12, 14, 52, 54], fill=HANJI[0])
    d.ellipse([18, 34, 46, 56], fill=WHITE)  # muzzle
    # slate-blue stripes
    for sx in (16, 22, 42, 48):
        sgn = -1 if sx < 32 else 1
        d.line([sx, 16, sx + sgn * 3, 30], fill=NIGHT[2], width=2)
    d.line([32, 12, 32, 22], fill=NIGHT[2], width=2)
    d.line([14, 36, 22, 38], fill=NIGHT[2], width=2)
    d.line([50, 36, 42, 38], fill=NIGHT[2], width=2)
    # 王 mark
    d.line([28, 14, 36, 14], fill=NIGHT[2]); d.line([28, 18, 36, 18], fill=NIGHT[2])
    d.line([32, 12, 32, 20], fill=NIGHT[2])
    # icy blue eyes + nose
    disc(d, 24, 26, 4, BLUE[0]); disc(d, 40, 26, 4, BLUE[0])
    disc(d, 24, 26, 2, BLACK); disc(d, 40, 26, 2, BLACK)
    d.point((23, 25), fill=WHITE); d.point((39, 25), fill=WHITE)
    d.polygon([(28, 40), (36, 40), (32, 45)], fill=PINK[2])  # nose
    d.line([32, 45, 32, 50], fill=NIGHT[2])
    d.arc([24, 46, 32, 52], 270, 360, fill=NIGHT[2]); d.arc([32, 46, 40, 52], 180, 270, fill=NIGHT[2])
    # whiskers
    d.line([20, 44, 8, 42], fill=GRAY[1]); d.line([44, 44, 56, 42], fill=GRAY[1])


def a_mountain_spirit(d):
    # 산신령 — the mountain sage: long white beard, topknot, kind eyes
    _aura(d, 32, 30, 30)
    # halo of mountains behind
    d.polygon([(6, 40), (16, 22), (26, 40)], fill=GREEN[3])
    d.polygon([(38, 40), (48, 22), (58, 40)], fill=GREEN[3])
    # face
    d.ellipse([20, 14, 44, 42], fill=DAWN[1])
    # topknot + headband
    disc(d, 32, 10, 5, NIGHT[3])
    d.rectangle([21, 16, 43, 20], fill=WOODD[2])
    d.rectangle([21, 16, 43, 18], fill=BRASS[1])
    disc(d, 32, 18, 2, GOLD[1])  # gem on band
    # bushy white brows + kind eyes
    d.line([24, 24, 30, 24], fill=HANJI[0], width=2); d.line([34, 24, 40, 24], fill=HANJI[0], width=2)
    eye(d, 27, 27, 2); eye(d, 37, 27, 2)
    # nose
    d.line([32, 28, 32, 33], fill=DAWN[2], width=2)
    # rosy cheeks
    disc(d, 24, 32, 2, PINK[1]); disc(d, 40, 32, 2, PINK[1])
    # long flowing white beard
    d.polygon([(24, 34), (40, 34), (44, 50), (38, 62), (32, 56), (26, 62), (20, 50)], fill=HANJI[0])
    d.polygon([(26, 36), (38, 36), (40, 48), (32, 52), (24, 48)], fill=HANJI[1])
    # mustache + smile
    d.arc([26, 32, 38, 40], 0, 180, fill=HANJI[2], width=2)
    for bx in (26, 30, 34, 38):
        d.line([bx, 44, bx, 58], fill=HANJI[2])  # beard strands


# ── shared legendary frame (96x96, transparent center) ───────────────────────
def legendary_frame() -> Image.Image:
    img, d = canvas(FS)
    # ornate gold border: outer band, inset highlight, corner studs
    d.rectangle([0, 0, FS - 1, FS - 1], outline=BRASS[2], width=4)
    d.rectangle([3, 3, FS - 4, FS - 4], outline=GOLD[1], width=2)
    d.rectangle([6, 6, FS - 7, FS - 7], outline=BRASS[1], width=1)
    for cx, cy in ((6, 6), (FS - 7, 6), (6, FS - 7), (FS - 7, FS - 7)):
        disc(d, cx, cy, 4, GOLD[0])
        disc(d, cx, cy, 2, BRASS[2])
    # mid-edge florets
    for cx, cy in ((FS // 2, 4), (FS // 2, FS - 5), (4, FS // 2), (FS - 5, FS // 2)):
        disc(d, cx, cy, 3, GOLD[0])
    add_outline(img)
    return img


# ── epic frame (96x96, transparent center) — simpler than the legendary one ──
# A light-lavender double-line border with small corner studs: enough to mark an
# epic avatar without competing with the ornate gold legendary frame.
EPIC_LAV = rgb("#bda3e6")   # light lavender — main band
EPIC_HI = rgb("#dccdf4")    # pale highlight
EPIC_DEEP = rgb("#7a55b0")  # deeper purple — inset line


def epic_frame() -> Image.Image:
    img, d = canvas(FS)
    d.rectangle([0, 0, FS - 1, FS - 1], outline=EPIC_LAV, width=3)
    d.rectangle([2, 2, FS - 3, FS - 3], outline=EPIC_HI, width=1)
    d.rectangle([5, 5, FS - 6, FS - 6], outline=EPIC_DEEP, width=2)
    # four small corner studs — the only ornament, keeps it simple
    for cx, cy in ((4, 4), (FS - 5, 4), (4, FS - 5), (FS - 5, FS - 5)):
        disc(d, cx, cy, 2, EPIC_HI)
        d.point((cx, cy), fill=EPIC_DEEP)
    add_outline(img)
    return img


# ── rare frame (96x96, transparent center) — the plainest of the three ──
# A clean silver double-line border: no studs, no glow, so the ornament ladder
# reads rare (silver) < epic (lavender + studs) < legendary (ornate gold).
RARE_SIL = rgb("#bcc6d0")   # steel silver — main band
RARE_HI = rgb("#e6ecf2")    # pale highlight
RARE_DEEP = rgb("#74828f")  # slate steel — inset line


def rare_frame() -> Image.Image:
    img, d = canvas(FS)
    d.rectangle([0, 0, FS - 1, FS - 1], outline=RARE_SIL, width=3)
    d.rectangle([2, 2, FS - 3, FS - 3], outline=RARE_HI, width=1)
    d.rectangle([5, 5, FS - 6, FS - 6], outline=RARE_DEEP, width=2)
    add_outline(img)
    return img


COMMON = [
    ("seed", a_seed),
    ("sprout", a_sprout),
    ("leaf", a_leaf),
    ("pebble", a_pebble),
    ("dewdrop", a_dewdrop),
    ("watering-can", a_watering_can),
    ("pot", a_pot),
    ("clover", a_clover),
    ("dandelion", a_dandelion),
    ("mushroom", a_mushroom),
    ("earthworm", a_earthworm),
    ("ant", a_ant),
]
RARE = [
    ("bee", a_bee),
    ("sprout-cluster", a_sprout_cluster),
    ("ladybug", a_ladybug),
    ("butterfly", a_butterfly),
    ("tulip", a_tulip),
    ("frog", a_frog),
    ("sunflower", a_sunflower),
    ("carrot", a_carrot),
]
EPIC = [
    ("fox", a_fox),
    ("owl", a_owl),
    ("hedgehog", a_hedgehog),
    ("koi", a_koi),
    ("magpie", a_magpie),
    ("crane", a_crane),
    ("raccoon-dog", a_raccoon_dog),
    ("persimmon", a_persimmon),
]
LEGENDARY = [
    ("tiger", a_tiger),
    ("phoenix", a_phoenix),
    ("dragon", a_dragon),
    ("dokkaebi", a_dokkaebi),
    ("golden-toad", a_golden_toad),
    ("golden-crane", a_golden_crane),
    ("white-tiger", a_white_tiger),
    ("mountain-spirit", a_mountain_spirit),
]


def render(fn) -> Image.Image:
    img, d = canvas()
    fn(d)
    add_outline(img)
    return img


def sheet(imgs, cols=6, scale=4) -> Image.Image:
    bg = rgb("#cbb896")
    rows = (len(imgs) + cols - 1) // cols
    pad = 6
    cell = S + pad
    sh = Image.new("RGBA", (cols * cell + pad, rows * cell + pad), bg)
    for i, (_, im) in enumerate(imgs):
        sh.alpha_composite(im, (pad + (i % cols) * cell, pad + (i // cols) * cell))
    return sh.resize((sh.width * scale, sh.height * scale), Image.NEAREST)


def main() -> int:
    OUT_APP.mkdir(parents=True, exist_ok=True)
    OUT_REVIEW.mkdir(parents=True, exist_ok=True)
    total = 0
    for tier, items in (("common", COMMON), ("rare", RARE), ("epic", EPIC), ("legendary", LEGENDARY)):
        rendered = []
        for name, fn in items:
            im = render(fn)
            im.save(OUT_APP / f"{name}.png")
            rendered.append((name, im))
        if rendered:
            sheet(rendered).save(OUT_REVIEW / f"_sheet_{tier}.png")
        total += len(rendered)
        print(f"{tier:11s} {len(rendered):2d} avatars")
    legendary_frame().save(OUT_APP / "_frame-legendary.png")
    epic_frame().save(OUT_APP / "_frame-epic.png")
    rare_frame().save(OUT_APP / "_frame-rare.png")
    print(f"total {total} avatars + 3 frames -> munbeop/public/img/avatars/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
