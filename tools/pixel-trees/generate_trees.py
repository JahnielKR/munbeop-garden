#!/usr/bin/env python3
"""Pixel-tree asset pipeline for the TOPIK garden dashboard.

Generates the 34 PNG assets consumed by `PixelTree.vue`:

    munbeop/public/img/tree/<species>/tree_skeleton.png   (bare winter tree)
    munbeop/public/img/tree/<species>/trunk_alive.png     (living bark, same geometry)
    munbeop/public/img/tree/<species>/leaves_layer_1.png  (sparse sprout foliage)
    munbeop/public/img/tree/<species>/leaves_layer_2.png  (full leafy crown)
    munbeop/public/img/tree/<species>/bloom_full.png      (full bloom + species signature)
    munbeop/public/img/tree/ground_shadow.png
    munbeop/public/img/tree/particles/{petal_pink,leaf_red,leaf_gold}.png

plus review sheets (NOT committed; see .gitignore):

    tools/pixel-trees/out/contact_sheet.png   (species x growth states)
    tools/pixel-trees/out/lineup.png          (6 full trees, light + dark bg)

Every layer of a species is rendered from ONE deterministic tree geometry,
so layers align pixel-perfect when stacked. Canvas is 128x160 with the
trunk anchored at (64,148). Layers are cumulative: the Vue component never
removes a lower layer when a higher one appears.

Spec: docs/superpowers/specs/2026-06-11-garden-tree-dashboard.md (sections 3, 7)
Docs: tools/pixel-trees/README.md (layer table, signatures, tuning guide)

Usage:
    python tools/pixel-trees/generate_trees.py
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

# ── Canvas ───────────────────────────────────────────────────────────────────

W, H = 128, 160
ANCHOR = (64, 148)  # where the trunk meets the ground

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
ASSET_DIR = REPO / "munbeop" / "public" / "img" / "tree"
OUT_DIR = HERE / "out"

OUTLINE = (0x20, 0x15, 0x10, 255)  # #201510 — shared sprite outline (Bomi family)


def rgb(hex_str: str) -> tuple[int, int, int, int]:
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


# ── Palettes (light → dark) ──────────────────────────────────────────────────

PAL_DEAD = [rgb(c) for c in ("#9a8b7a", "#7d705f", "#5f5447")]  # winter skeleton
PAL_BARK = [rgb(c) for c in ("#9a7148", "#74512f", "#503520")]  # living wood

# ── Species registry — the single tuning surface (see README "Tuning") ──────
#
# clumps: (cx, cy, rx, ry, major) ellipses that union into the crown field.
#         major clumps get a branch grown into them; minor ones only foliage.
# bloom_mode:
#   recolor  — bloom repaints the whole crown in `bloom` palette
#   flowers  — bloom scatters `flower_sprite` over the leafy crown
#   ambience — bloom deepens the greens and adds motes (zelkova)
# signatures: carpet / rope / floats / motes / ember — see README.

SPECIES: dict[str, dict] = {
    # TOPIK 1 — 벚꽃 cherry: weeping crown, petal drift
    "cherry": {
        "seed": 101,
        "trunk_top": (62, 106),
        "trunk_w": 5.0,
        "bow": 0.20,
        "droop": 7.0,
        "clumps": [
            (64, 82, 25, 15, 1),
            (40, 92, 14, 11, 1),
            (89, 90, 14, 11, 1),
            (64, 66, 16, 10, 1),
            (46, 104, 8, 6, 0),
            (83, 103, 8, 6, 0),
        ],
        "leaf": ("#9ed06a", "#79b54e", "#578f38", "#3f6f2a"),
        "bloom": ("#ffe3ee", "#f9bcd3", "#ef93b6", "#d76e96"),
        "bloom_mode": "recolor",
        "signatures": {"floats": "petal", "sparkle": "#fff7fb"},
    },
    # TOPIK 2 — 목련 magnolia: twin trunk, wine-cup flowers
    "magnolia": {
        "seed": 202,
        "twin_tops": [(49, 99), (80, 96)],
        "trunk_w": 4.4,
        "bow": 0.16,
        "droop": 1.0,
        "clumps": [
            (48, 80, 16, 12, 1),
            (81, 78, 16, 12, 1),
            (64, 64, 17, 11, 1),
            (40, 93, 9, 7, 0),
            (89, 91, 9, 7, 0),
        ],
        "leaf": ("#8cc46a", "#69a84d", "#4c8538", "#376628"),
        "bloom": ("#f8f4ec", "#eecadd", "#e2a0c4", "#b96f98"),
        "bloom_mode": "flowers",
        "flower": "magnolia",
        "signatures": {},
    },
    # TOPIK 3 — 느티나무 zelkova: giant village dome, 금줄 rope, fireflies
    "zelkova": {
        "seed": 303,
        "trunk_top": (64, 112),
        "trunk_w": 7.0,
        "bow": 0.22,
        "droop": 0.0,
        "clumps": [
            (64, 74, 33, 21, 1),
            (42, 87, 16, 11, 1),
            (86, 87, 16, 11, 1),
            (64, 58, 22, 11, 1),
            (30, 95, 8, 6, 0),
            (98, 95, 8, 6, 0),
        ],
        "leaf": ("#86c25e", "#62a444", "#468230", "#326224"),
        "bloom": ("#8ed05e", "#68b243", "#4a9230", "#357024"),
        "bloom_mode": "ambience",
        "signatures": {"rope": 120, "motes": "#fff9b0"},
    },
    # TOPIK 4 — 무궁화 mugunghwa: triple-crown shrub, 단심 flowers
    "mugunghwa": {
        "seed": 404,
        "stems3": True,
        "trunk_w": 3.6,
        "bow": 0.05,
        "droop": 0.0,
        "clumps": [
            (48, 100, 13, 11, 1),
            (64, 89, 15, 12, 1),
            (80, 100, 13, 11, 1),
            (55, 108, 9, 7, 0),
            (73, 107, 9, 7, 0),
        ],
        "leaf": ("#96cc66", "#72b04a", "#539036", "#3c7028"),
        "bloom": ("#f6dcec", "#eeb6d8", "#d987b4", "#b3548c"),
        "bloom_mode": "flowers",
        "flower": "mugunghwa",
        "signatures": {},
    },
    # TOPIK 5 — 단풍나무 maple: ember gradient, falling leaves, red carpet
    "maple": {
        "seed": 505,
        "trunk_top": (64, 100),
        "trunk_w": 4.6,
        "bow": 0.18,
        "droop": 2.0,
        "clumps": [
            (64, 70, 21, 9, 1),
            (48, 82, 18, 8, 1),
            (81, 82, 18, 8, 1),
            (64, 94, 23, 9, 1),
            (38, 93, 10, 6, 0),
            (91, 92, 10, 6, 0),
        ],
        "leaf": ("#a4cc62", "#7fae47", "#5d8c34", "#446c26"),
        "bloom": ("#f6a93f", "#ee7d33", "#d8512c", "#a93426"),
        "bloom_mode": "recolor",
        "ember": True,
        "signatures": {"floats": "leaf_red", "carpet": ("#c44a2c", "#9c3322", 34)},
    },
    # TOPIK 6 — 은행나무 ginkgo: the tallest, golden carpet, light motes
    "ginkgo": {
        "seed": 606,
        "trunk_top": (64, 72),
        "trunk_w": 5.2,
        "bow": 0.10,
        "droop": 0.0,
        "leader": (64, 46),
        "clumps": [
            (64, 53, 16, 12, 1),
            (60, 71, 20, 13, 1),
            (69, 89, 19, 12, 1),
            (55, 110, 11, 8, 1),
            (74, 110, 11, 8, 1),
        ],
        "leaf": ("#a8d070", "#83b452", "#61943c", "#48742c"),
        "bloom": ("#ffe88f", "#f6c54f", "#dd9f2f", "#b67c20"),
        "bloom_mode": "recolor",
        "signatures": {"floats": "leaf_gold", "carpet": ("#e8b93e", "#bd8f26", 38), "motes": "#fff2b0"},
    },
}

LEVEL_BY_SPECIES = {"cherry": 1, "magnolia": 2, "zelkova": 3, "mugunghwa": 4, "maple": 5, "ginkgo": 6}


# ── Deterministic per-pixel noise (stable across runs) ───────────────────────


def pnoise(x: int, y: int, seed: int) -> float:
    """Cheap integer-hash noise in [0,1). Stable: same input, same output."""
    n = (x * 374761393 + y * 668265263 + seed * 982451653) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFF) / 65536.0


# ── Geometry ─────────────────────────────────────────────────────────────────


@dataclass
class Clump:
    cx: float
    cy: float
    rx: float
    ry: float
    major: bool


@dataclass
class Stroke:
    """A wood polyline with linearly tapering width."""

    points: list[tuple[float, float]]
    w0: float
    w1: float


def _polyline(
    rng: random.Random,
    start: tuple[float, float],
    end: tuple[float, float],
    bow: float,
    droop: float,
    wiggle: float = 1.4,
    steps: int = 7,
) -> list[tuple[float, float]]:
    """Curved organic path from start to end: lateral bow + gravity droop + jitter."""
    (x0, y0), (x1, y1) = start, end
    dx, dy = x1 - x0, y1 - y0
    # perpendicular (normalized) for the bow, pointing away from the trunk axis
    length = math.hypot(dx, dy) or 1.0
    px, py = -dy / length, dx / length
    side = 1 if dx >= 0 else -1
    pts = []
    for i in range(steps + 1):
        t = i / steps
        arc = math.sin(t * math.pi)  # 0 at ends, 1 mid
        x = x0 + dx * t + px * side * bow * length * arc + rng.uniform(-wiggle, wiggle) * arc
        y = y0 + dy * t + py * side * bow * length * arc + droop * (t**2) + rng.uniform(-wiggle, wiggle) * arc
        pts.append((x, y))
    pts[0], pts[-1] = (x0, y0), (x1, y1 + droop)
    return pts


def build_tree(cfg: dict, rng: random.Random) -> tuple[list[Stroke], list[Clump]]:
    """Grow the full wood geometry of one species.

    Trunk(s) rise from ANCHOR; one primary branch is grown INTO each major
    clump (attached to the nearest trunk point below it), then thin twigs
    fan out inside the clump so the bare skeleton already sketches the
    crown silhouette.
    """
    clumps = [Clump(*c[:4], bool(c[4])) for c in cfg["clumps"]]
    strokes: list[Stroke] = []
    ax, ay = ANCHOR

    # 1. trunk(s)
    trunk_paths: list[list[tuple[float, float]]] = []
    if cfg.get("twin_tops"):
        for sx, top in zip((-3, 3), cfg["twin_tops"]):
            path = _polyline(rng, (ax + sx, ay), top, bow=0.08, droop=0, steps=6)
            trunk_paths.append(path)
            strokes.append(Stroke(path, cfg["trunk_w"], 2.2))
    elif cfg.get("stems3"):
        for sx, ex, ty in ((-2, -9, 104), (0, 0, 97), (2, 9, 104)):
            path = _polyline(rng, (ax + sx, ay), (ax + ex, ty), bow=0.05, droop=0, wiggle=0.9, steps=5)
            trunk_paths.append(path)
            strokes.append(Stroke(path, cfg["trunk_w"], 1.8))
    else:
        path = _polyline(rng, (ax, ay), cfg["trunk_top"], bow=0.05, droop=0, wiggle=1.1, steps=7)
        trunk_paths.append(path)
        strokes.append(Stroke(path, cfg["trunk_w"], 2.6))
        if cfg.get("leader"):  # ginkgo: the trunk continues as a thinner central leader
            lead = _polyline(rng, cfg["trunk_top"], cfg["leader"], bow=0.04, droop=0, steps=4)
            trunk_paths.append(lead)
            strokes.append(Stroke(lead, 2.6, 1.4))

    def nearest_trunk_point(cy: float) -> tuple[float, float]:
        best, best_d = trunk_paths[0][-1], 1e9
        for path in trunk_paths:
            for pt in path:
                d = abs(pt[1] - cy)
                if d < best_d:
                    best, best_d = pt, d
        return best

    # 2. one primary into each major clump + twigs inside it
    for ci, c in enumerate(clumps):
        if not c.major:
            continue
        attach = nearest_trunk_point(c.cy + c.ry * 0.9)
        prim = _polyline(
            rng,
            attach,
            (c.cx + rng.uniform(-2, 2), c.cy + rng.uniform(-1, 2)),
            bow=cfg["bow"],
            droop=cfg["droop"] * 0.4,
            steps=6,
        )
        strokes.append(Stroke(prim, max(2.2, cfg["trunk_w"] * 0.52), 1.5))
        for _ in range(3):
            a = rng.uniform(0, math.tau)
            ex = c.cx + math.cos(a) * c.rx * rng.uniform(0.55, 0.9)
            ey = c.cy + math.sin(a) * c.ry * rng.uniform(0.55, 0.9)
            twig = _polyline(rng, (c.cx, c.cy), (ex, ey + cfg["droop"] * 0.5), bow=0.1, droop=cfg["droop"] * 0.5, steps=3)
            strokes.append(Stroke(twig, 1.4, 0.9))
        _ = ci

    return strokes, clumps


# ── Rasterization helpers ────────────────────────────────────────────────────


def stamp_strokes(strokes: list[Stroke]) -> set[tuple[int, int]]:
    """Rasterize wood polylines into a pixel mask (disks along each path)."""
    mask: set[tuple[int, int]] = set()
    for s in strokes:
        # cumulative length for width interpolation
        total = sum(math.dist(s.points[i], s.points[i + 1]) for i in range(len(s.points) - 1)) or 1.0
        acc = 0.0
        for i in range(len(s.points) - 1):
            p0, p1 = s.points[i], s.points[i + 1]
            seg = math.dist(p0, p1)
            n = max(1, int(seg * 2))
            for k in range(n + 1):
                t = k / n
                d = (acc + seg * t) / total
                w = s.w0 + (s.w1 - s.w0) * d
                x = p0[0] + (p1[0] - p0[0]) * t
                y = p0[1] + (p1[1] - p0[1]) * t
                r = max(0.5, w / 2)
                for dy in range(-int(r) - 1, int(r) + 2):
                    for dx in range(-int(r) - 1, int(r) + 2):
                        if dx * dx + dy * dy <= r * r + 0.3:
                            px, py = int(round(x + dx)), int(round(y + dy))
                            if 0 <= px < W and 0 <= py < H and py <= ANCHOR[1] + 1:
                                mask.add((px, py))
            acc += seg
    return mask


def shade_wood(img: Image.Image, mask: set[tuple[int, int]], pal: list[tuple], seed: int) -> None:
    """Paint a wood mask with left-light/right-dark shading + bark streaks."""
    px = img.load()
    for (x, y) in mask:
        if (x - 1, y) not in mask:
            c = pal[0]
        elif (x + 1, y) not in mask or (x + 2, y) not in mask:
            c = pal[2]
        else:
            c = pal[1]
        if pnoise(x // 2, y // 3, seed) < 0.16:  # vertical bark streaks
            c = pal[2]
        px[x, y] = c


def outline(img: Image.Image) -> None:
    """Grow a 1px #201510 outline around every opaque pixel (outside the shape)."""
    px = img.load()
    opaque = {(x, y) for y in range(H) for x in range(W) if px[x, y][3] > 0}
    for (x, y) in opaque:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in opaque and px[nx, ny][3] == 0:
                px[nx, ny] = OUTLINE


def crown_field(clumps: list[Clump], scale: float = 1.0, only: list[int] | None = None):
    """Return f(x,y) -> (r2, clump) with r2 = normalized distance to nearest clump."""
    use = [c for i, c in enumerate(clumps) if only is None or i in only]

    def field(x: float, y: float):
        best, who = 1e9, None
        for c in use:
            rx, ry = c.rx * scale, c.ry * scale
            r2 = ((x - c.cx) / rx) ** 2 + ((y - c.cy) / ry) ** 2
            if r2 < best:
                best, who = r2, c
        return best, who

    return field


def paint_foliage(
    img: Image.Image,
    clumps: list[Clump],
    pal: list[tuple],
    seed: int,
    *,
    scale: float = 1.0,
    only: list[int] | None = None,
    holes: float = 0.0,
    ember_band: tuple[float, float] | None = None,
) -> set[tuple[int, int]]:
    """Paint the clump-union crown with per-clump pixel shading.

    holes: 0..1 — probability of dropping interior pixels (sparse young leaves).
    ember_band: (y_top, y_bottom) — bias tones darker toward the bottom (maple).
    """
    field = crown_field(clumps, scale, only)
    px = img.load()
    painted: set[tuple[int, int]] = set()
    for y in range(H):
        for x in range(W):
            r2, c = field(x, y)
            if r2 > 1.0 or c is None:
                continue
            n = pnoise(x, y, seed)
            if r2 > 0.66 and n > 0.82 - (r2 - 0.66) * 1.7:  # ragged organic edge
                continue
            if holes and pnoise(x + 31, y + 57, seed) < holes and r2 > 0.12:
                continue
            rel = ((x - c.cx) / (c.rx * scale)) * 0.45 + ((y - c.cy) / (c.ry * scale)) * 0.95
            tone = rel + (n - 0.5) * 0.7
            if ember_band:
                top, bot = ember_band
                tone += ((y - top) / max(1.0, bot - top)) * 1.5 - 0.55
            if tone < -0.30:
                c_idx = 0
            elif tone < 0.22:
                c_idx = 1
            elif tone < 0.70:
                c_idx = 2
            else:
                c_idx = 3
            if pnoise(x + 97, y + 13, seed) < 0.05:  # leaf speckle
                c_idx = min(3, c_idx + 1)
            px[x, y] = pal[c_idx]
            painted.add((x, y))
    return painted


# ── Species signatures ───────────────────────────────────────────────────────


def paint_rope(img: Image.Image, y_rope: int, half_w: int) -> None:
    """금줄 sacred straw rope with hanging hanji strips (zelkova trunk)."""
    px = img.load()
    straw, twist, paper = rgb("#d9b96a"), rgb("#b3924a"), rgb("#f3efe2")
    x0, x1 = 64 - half_w - 2, 64 + half_w + 2
    for x in range(x0, x1 + 1):
        for y in (y_rope, y_rope + 1):
            px[x, y] = twist if (x + y) % 3 == 0 else straw
    for i, sx in enumerate((x0 + 2, 64, x1 - 2)):
        for dy in range(2, 6 + (i == 1)):
            px[sx, y_rope + dy] = paper
        px[sx, y_rope + 1] = twist


def paint_carpet(img: Image.Image, c0: str, c1: str, radius: int, seed: int) -> None:
    """Fallen-leaf carpet around the roots (maple red / ginkgo gold)."""
    px = img.load()
    a, b = rgb(c0), rgb(c1)
    cy, ry = 150, 5
    for y in range(cy - ry, cy + ry + 1):
        for x in range(64 - radius, 64 + radius + 1):
            r2 = ((x - 64) / radius) ** 2 + ((y - cy) / ry) ** 2
            if r2 > 1.0:
                continue
            n = pnoise(x, y, seed + 7)
            if r2 > 0.55 and n > 1.25 - r2:  # dithered rim
                continue
            px[x, y] = a if n < 0.55 else b
    for _ in range(10):  # stray leaves past the rim
        n1 = pnoise(_ * 13 + 1, 5, seed)
        n2 = pnoise(_ * 29 + 3, 11, seed)
        x = int(64 + (n1 - 0.5) * (radius * 2 + 18))
        y = int(cy - 1 + n2 * 5)
        if 0 <= x < W and 0 <= y < H:
            px[x, y] = b if n1 > 0.5 else a


def paint_motes(img: Image.Image, clumps: list[Clump], color: str, seed: int, count: int = 11) -> None:
    """Floating light motes / fireflies hovering just OUTSIDE the crown edge,
    where they read against the sky instead of vanishing into foliage."""
    px = img.load()
    c = rgb(color)
    majors = [cl for cl in clumps if cl.major]
    for i in range(count):
        cl = majors[i % len(majors)]
        a = pnoise(i * 17 + 5, 3, seed) * math.tau
        rr = 1.04 + pnoise(i * 11 + 9, 7, seed) * 0.35
        x = int(cl.cx + math.cos(a) * cl.rx * rr)
        y = int(cl.cy + math.sin(a) * cl.ry * rr)
        if not (1 <= x < W - 1 and 1 <= y < H - 1):
            continue
        px[x, y] = c
        if i % 3 == 0:  # plus-shaped sparkle
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if img.load()[x + dx, y + dy][3] == 0:
                    px[x + dx, y + dy] = (c[0], c[1], c[2], 170)


def paint_floats(img: Image.Image, clumps: list[Clump], kind: str, seed: int) -> None:
    """A few petals/leaves drifting to the right of the crown (wind)."""
    px = img.load()
    colors = {
        "petal": (rgb("#f9bcd3"), rgb("#ef93b6")),
        "leaf_red": (rgb("#ee7d33"), rgb("#d8512c")),
        "leaf_gold": (rgb("#f6c54f"), rgb("#dd9f2f")),
    }[kind]
    right = max(c.cx + c.rx for c in clumps)
    mid_y = sum(c.cy for c in clumps) / len(clumps)
    for i in range(7):
        x = int(right - 4 + pnoise(i * 7 + 1, 2, seed) * 22)
        y = int(mid_y - 14 + pnoise(i * 19 + 4, 6, seed) * 44)
        if not (0 <= x < W - 1 and 0 <= y < H):
            continue
        c = colors[i % 2]
        px[x, y] = c
        if i % 2 == 0 and x + 1 < W:
            px[x + 1, y] = colors[1]


FLOWER_SPRITES = {
    # 5x6 wine-cup magnolia flower (W=white petal, P=pink base, D=deep pink)
    "magnolia": ["W.W.W", "WWWWW", "WWWWW", ".WWW.", ".PPP.", "..D.."],
    # 5x5 mugunghwa: pale petals around the 단심 red heart (R) + gold stamen (G)
    "mugunghwa": [".WW.W", "WWPWW", "WPRGW", "WWPWW", "W.WW."],
}

FLOWER_COLORS = {
    "magnolia": {"W": rgb("#f8f4ec"), "P": rgb("#e2a0c4"), "D": rgb("#b96f98"), "R": rgb("#b3284a"), "G": rgb("#f2d264")},
    "mugunghwa": {"W": rgb("#f4d3e6"), "P": rgb("#e8a8cd"), "D": rgb("#c4709f"), "R": rgb("#b3284a"), "G": rgb("#f2d264")},
}


def paint_flowers(img: Image.Image, clumps: list[Clump], kind: str, seed: int, count: int) -> None:
    """Scatter flower sprites across the crown surface (no two overlapping)."""
    sprite, colors = FLOWER_SPRITES[kind], FLOWER_COLORS[kind]
    field = crown_field(clumps)
    px = img.load()
    placed: list[tuple[int, int]] = []
    tries = 0
    while len(placed) < count and tries < 400:
        tries += 1
        n1, n2 = pnoise(tries * 13, 1, seed), pnoise(tries * 7, 31, seed)
        x = int(20 + n1 * (W - 40))
        y = int(40 + n2 * 80)
        r2, _ = field(x, y)
        if r2 > 0.88:
            continue
        if any(abs(x - qx) < 7 and abs(y - qy) < 7 for qx, qy in placed):
            continue
        placed.append((x, y))
        for sy, row in enumerate(sprite):
            for sx, ch in enumerate(row):
                if ch == ".":
                    continue
                tx, ty = x + sx - 2, y + sy - 2
                if 0 <= tx < W and 0 <= ty < H:
                    px[tx, ty] = colors[ch]


def paint_sparkles(img: Image.Image, painted: set[tuple[int, int]], color: str, seed: int) -> None:
    """Tiny bright pixels on the bloom crown (cherry shimmer)."""
    px = img.load()
    c = rgb(color)
    for (x, y) in painted:
        if pnoise(x * 3 + 1, y * 3 + 2, seed) < 0.016:
            px[x, y] = c


# ── Layer assembly ───────────────────────────────────────────────────────────


def new_layer() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def render_species(name: str, cfg: dict) -> dict[str, Image.Image]:
    rng = random.Random(cfg["seed"])
    strokes, clumps = build_tree(cfg, rng)
    wood = stamp_strokes(strokes)
    seed = cfg["seed"]
    leaf_pal = [rgb(c) for c in cfg["leaf"]]
    bloom_pal = [rgb(c) for c in cfg["bloom"]]
    majors = [i for i, c in enumerate(clumps) if c.major]

    # L0 skeleton — full bare geometry, winter palette
    skeleton = new_layer()
    shade_wood(skeleton, wood, PAL_DEAD, seed)
    outline(skeleton)

    # L1 living wood — identical mask, warm bark (fully covers the skeleton wood)
    alive = new_layer()
    shade_wood(alive, wood, PAL_BARK, seed)
    outline(alive)

    # L2 sprout foliage — inner major clumps, shrunken + holey, brighter young green
    young_pal = [leaf_pal[0], leaf_pal[0], leaf_pal[1], leaf_pal[2]]
    leaves1 = new_layer()
    paint_foliage(leaves1, clumps, young_pal, seed + 1, scale=0.62, only=majors[:3], holes=0.34)
    outline(leaves1)

    # L3 full crown
    leaves2 = new_layer()
    paint_foliage(leaves2, clumps, leaf_pal, seed + 2)
    outline(leaves2)

    # L4 bloom + signature. Solid shapes (crown, flowers, carpet, rope) are
    # painted BEFORE the outline pass; loose light effects (sparkles, motes,
    # drifting petals) AFTER it, so single pixels don't get boxed in dark.
    bloom = new_layer()
    sig = cfg["signatures"]
    painted: set[tuple[int, int]] = set()
    if cfg["bloom_mode"] == "recolor":
        band = None
        if cfg.get("ember"):
            ys = [c.cy - c.ry for c in clumps] + [c.cy + c.ry for c in clumps]
            band = (min(ys), max(ys))
        painted = paint_foliage(bloom, clumps, bloom_pal, seed + 3, ember_band=band)
    elif cfg["bloom_mode"] == "ambience":
        paint_foliage(bloom, clumps, bloom_pal, seed + 3, holes=0.45)
    if cfg["bloom_mode"] == "flowers":
        paint_flowers(bloom, clumps, cfg["flower"], seed + 5, count=16)
    if "carpet" in sig:
        paint_carpet(bloom, sig["carpet"][0], sig["carpet"][1], sig["carpet"][2], seed)
    if "rope" in sig:
        paint_rope(bloom, sig["rope"], half_w=int(cfg["trunk_w"] / 2) + 2)
    outline(bloom)
    if "sparkle" in sig and painted:
        paint_sparkles(bloom, painted, sig["sparkle"], seed + 4)
    if "motes" in sig:
        paint_motes(bloom, clumps, sig["motes"], seed + 6)
    if "floats" in sig:
        paint_floats(bloom, clumps, sig["floats"], seed + 7)

    return {
        "tree_skeleton": skeleton,
        "trunk_alive": alive,
        "leaves_layer_1": leaves1,
        "leaves_layer_2": leaves2,
        "bloom_full": bloom,
    }


# ── Shared sprites ───────────────────────────────────────────────────────────


def render_shadow() -> Image.Image:
    """Soft dithered ground ellipse, same 128x160 canvas for trivial alignment."""
    img = new_layer()
    px = img.load()
    cx, cy, rx, ry = 64, 150, 30, 6
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            r2 = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            if r2 > 1.0:
                continue
            if r2 < 0.45:
                a = 88
            elif r2 < 0.78:
                a = 52
            else:
                a = 26 if (x + y) % 2 == 0 else 0  # checker-dither rim
            if a:
                px[x, y] = (26, 17, 12, a)
    return img


PARTICLES = {
    "petal_pink": (["........", "..LP....", ".LPPD...", ".PPD....", "..D.....", "........", "........", "........"],
                   {"L": "#ffd9e8", "P": "#f2a9c0", "D": "#d97ba0"}),
    "leaf_red": (["........", "...R....", "..RRR...", ".RRDRR..", "..RDR...", "...D....", "........", "........"],
                 {"R": "#d9542e", "D": "#a83226"}),
    "leaf_gold": (["........", ".GGGG...", "GGGGGG..", ".GGGG...", "...S....", "...S....", "........", "........"],
                  {"G": "#f2c14e", "S": "#b3771d"}),
}


def render_particle(rows: list[str], colors: dict[str, str]) -> Image.Image:
    img = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                px[x, y] = rgb(colors[ch])
    return img


# ── Review sheets ────────────────────────────────────────────────────────────

STATES = [
    ("0% dormant", ["tree_skeleton"]),
    ("10% sprout", ["tree_skeleton", "trunk_alive", "leaves_layer_1"]),
    ("40% leafy", ["tree_skeleton", "trunk_alive", "leaves_layer_1", "leaves_layer_2"]),
    ("80% bloom", ["tree_skeleton", "trunk_alive", "leaves_layer_1", "leaves_layer_2", "bloom_full"]),
]


def compose(layers: dict[str, Image.Image], names: list[str]) -> Image.Image:
    img = new_layer()
    for n in names:
        img = Image.alpha_composite(img, layers[n])
    return img


def make_sheets(all_layers: dict[str, dict[str, Image.Image]]) -> None:
    from PIL import ImageFont

    font = ImageFont.load_default()
    scale, pad, label_h = 2, 10, 14
    cw, ch = W * scale + pad, H * scale + pad + label_h

    sheet = Image.new("RGBA", (cw * len(STATES) + pad + 70, ch * len(SPECIES) + pad), rgb("#f4ecd8"))
    d = ImageDraw.Draw(sheet)
    for row, (name, layers) in enumerate(all_layers.items()):
        d.text((8, pad + row * ch + (H * scale) // 2), f"L{LEVEL_BY_SPECIES[name]} {name}", fill=(45, 30, 24), font=font)
        for col, (label, names) in enumerate(STATES):
            img = compose(layers, names).resize((W * scale, H * scale), Image.NEAREST)
            x, y = 70 + pad + col * cw, pad + row * ch
            sheet.alpha_composite(img, (x, y))
            d.text((x + 2, y + H * scale + 2), label, fill=(45, 30, 24), font=font)
    sheet.save(OUT_DIR / "contact_sheet.png")

    lineup = Image.new("RGBA", (cw * len(SPECIES) + pad, ch * 2 + pad), rgb("#f4ecd8"))
    d = ImageDraw.Draw(lineup)
    d.rectangle([0, ch + pad // 2, lineup.width, lineup.height], fill=rgb("#211c2e"))
    for col, (name, layers) in enumerate(all_layers.items()):
        img = compose(layers, STATES[-1][1]).resize((W * scale, H * scale), Image.NEAREST)
        for row, ty in enumerate((pad // 2, ch + pad)):
            lineup.alpha_composite(img, (pad // 2 + col * cw, ty))
            d.text((pad // 2 + col * cw + 4, ty + H * scale + 1), f"L{LEVEL_BY_SPECIES[name]} {name}",
                   fill=(45, 30, 24) if row == 0 else (235, 228, 210), font=font)
    lineup.save(OUT_DIR / "lineup.png")


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (ASSET_DIR / "particles").mkdir(parents=True, exist_ok=True)

    count = 0
    all_layers: dict[str, dict[str, Image.Image]] = {}
    for name, cfg in SPECIES.items():
        layers = render_species(name, cfg)
        all_layers[name] = layers
        sdir = ASSET_DIR / name
        sdir.mkdir(parents=True, exist_ok=True)
        for layer_name, img in layers.items():
            img.save(sdir / f"{layer_name}.png", optimize=True)
            count += 1
        print(f"  {name:10s} -> 5 layers")

    render_shadow().save(ASSET_DIR / "ground_shadow.png", optimize=True)
    count += 1
    for pname, (rows, colors) in PARTICLES.items():
        render_particle(rows, colors).save(ASSET_DIR / "particles" / f"{pname}.png", optimize=True)
        count += 1

    make_sheets(all_layers)
    print(f"Wrote {count} PNGs to {ASSET_DIR}")
    print(f"Review sheets in {OUT_DIR}")


if __name__ == "__main__":
    main()
