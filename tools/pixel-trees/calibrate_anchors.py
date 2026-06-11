#!/usr/bin/env python3
"""Refine the zone-node anchors against the REAL rendered trees.

Reads the current per-species anchors from
`munbeop/app/lib/garden/zone-anchors.ts`, snaps each one to the densest
nearby spot of the tree mass (skeleton + sprout + full crown union), and:

  - writes `tools/pixel-trees/out/anchors_check.png` — every species in
    leafy AND dormant state with the refined nodes drawn on top, for a
    visual review before committing;
  - prints the refined TS entries ready to paste back into
    zone-anchors.ts (values as integer percentages of the 128x160 canvas).

Anchor order is preserved (zone 1 = lowest branch); each anchor only
moves within SEARCH_R pixels of its current spot, and refined anchors
keep a minimum separation so nodes never overlap.

Usage:
    python tools/pixel-trees/calibrate_anchors.py
"""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
ASSETS = REPO / "munbeop" / "public" / "img" / "tree"
ANCHORS_TS = REPO / "munbeop" / "app" / "lib" / "garden" / "zone-anchors.ts"
OUT = HERE / "out"

W, H = 128, 160
SPECIES = ["cherry", "magnolia", "zelkova", "mugunghwa", "maple", "ginkgo"]

WINDOW = 4  # half-size of the density window (9x9)
SEARCH_R = 12  # how far an anchor may move from its current spot
MIN_SEP = 13  # min distance between two refined anchors
DIST_PENALTY = 0.0035  # score penalty per squared pixel moved


def parse_anchors(ts: str) -> dict[str, list[tuple[int, int]]]:
    """Pull `{ top: 'N%', left: 'N%' }` lists per species out of the TS file."""
    out: dict[str, list[tuple[int, int]]] = {}
    for sp in SPECIES:
        block = re.search(rf"{sp}:\s*\[(.*?)\]", ts, re.S)
        if not block:
            raise SystemExit(f"species {sp} not found in {ANCHORS_TS}")
        pairs = re.findall(r"top:\s*'(\d+)%',\s*left:\s*'(\d+)%'", block.group(1))
        out[sp] = [(round(int(left) * W / 100), round(int(top) * H / 100)) for top, left in pairs]
    return out


def tree_mask(species: str) -> set[tuple[int, int]]:
    """Union of skeleton + young leaves + full crown opaque pixels."""
    mask: set[tuple[int, int]] = set()
    for layer in ("tree_skeleton", "leaves_layer_1", "leaves_layer_2"):
        px = Image.open(ASSETS / species / f"{layer}.png").convert("RGBA").load()
        for y in range(H):
            for x in range(W):
                if px[x, y][3] > 0:
                    mask.add((x, y))
    return mask


def density(mask: set[tuple[int, int]], x: int, y: int) -> float:
    hit = 0
    for dy in range(-WINDOW, WINDOW + 1):
        for dx in range(-WINDOW, WINDOW + 1):
            if (x + dx, y + dy) in mask:
                hit += 1
    return hit / ((2 * WINDOW + 1) ** 2)


def refine(mask: set[tuple[int, int]], anchors: list[tuple[int, int]]) -> list[tuple[int, int]]:
    refined: list[tuple[int, int]] = []
    for ax, ay in anchors:
        best, best_score = (ax, ay), -1.0
        for dy in range(-SEARCH_R, SEARCH_R + 1):
            for dx in range(-SEARCH_R, SEARCH_R + 1):
                d2 = dx * dx + dy * dy
                if d2 > SEARCH_R * SEARCH_R:
                    continue
                x, y = ax + dx, ay + dy
                if not (10 <= x <= W - 10 and 10 <= y <= H - 14):
                    continue
                if any((x - qx) ** 2 + (y - qy) ** 2 < MIN_SEP**2 for qx, qy in refined):
                    continue
                score = density(mask, x, y) - DIST_PENALTY * d2
                if score > best_score:
                    best_score, best = score, (x, y)
        refined.append(best)
    return refined


def compose(species: str, layers: list[str]) -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for layer in layers:
        img = Image.alpha_composite(img, Image.open(ASSETS / species / f"{layer}.png").convert("RGBA"))
    return img


def draw_nodes(img: Image.Image, anchors: list[tuple[int, int]]) -> Image.Image:
    big = img.resize((W * 2, H * 2), Image.NEAREST)
    d = ImageDraw.Draw(big)
    for i, (x, y) in enumerate(anchors):
        cx, cy = x * 2, y * 2
        d.rectangle([cx - 5, cy - 5, cx + 5, cy + 5], fill=(230, 161, 33), outline=(26, 26, 26), width=2)
        d.text((cx - 2, cy - 5), str(i + 1), fill=(26, 26, 26))
    return big


def main() -> None:
    OUT.mkdir(exist_ok=True)
    current = parse_anchors(ANCHORS_TS.read_text(encoding="utf-8"))

    sheet = Image.new("RGBA", (len(SPECIES) * (W * 2 + 8) + 8, 2 * (H * 2 + 8) + 8), (244, 236, 216, 255))
    print("export const ZONE_ANCHORS: Record<TreeSpecies, ZoneAnchor[]> = {")
    for col, sp in enumerate(SPECIES):
        mask = tree_mask(sp)
        refined = refine(mask, current[sp])

        leafy = compose(sp, ["tree_skeleton", "trunk_alive", "leaves_layer_1", "leaves_layer_2"])
        dormant = compose(sp, ["tree_skeleton"])
        sheet.alpha_composite(draw_nodes(leafy, refined), (8 + col * (W * 2 + 8), 8))
        sheet.alpha_composite(draw_nodes(dormant, refined), (8 + col * (W * 2 + 8), H * 2 + 16))

        entries = ", ".join(
            f"{{ top: '{round(y / H * 100)}%', left: '{round(x / W * 100)}%' }}" for x, y in refined
        )
        moved = sum(1 for a, b in zip(current[sp], refined) if a != b)
        print(f"  {sp}: [  // {moved}/7 moved")
        for x, y in refined:
            print(f"    {{ top: '{round(y / H * 100)}%', left: '{round(x / W * 100)}%' }},")
        print("  ],")
        _ = entries
    print("}")

    sheet.save(OUT / "anchors_check.png")
    print(f"\nreview: {OUT / 'anchors_check.png'} (top row: leafy, bottom row: dormant)")


if __name__ == "__main__":
    main()
