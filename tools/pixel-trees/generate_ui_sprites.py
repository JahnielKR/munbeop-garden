#!/usr/bin/env python3
"""Pixel UI sprites for the garden overlays (plan Appendix B).

Writes to munbeop/public/img/tree/ui/:

    chest_16.png       diary chest, closed (16x16)
    chest_16_open.png  diary chest, open lid (16x16)
    lock_8.png         padlock for locked trees/zones (8x8)

Same language as the tree assets: #201510 outline, v5 wood/gold palette.
These replace the emojis of the original idea doc — emojis are forbidden
in the garden stage (spec §7.5).

Usage:
    python tools/pixel-trees/generate_ui_sprites.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
UI_DIR = REPO / "munbeop" / "public" / "img" / "tree" / "ui"

PALETTE = {
    "O": "#201510",  # outline
    "W": "#8a5a32",  # wood
    "w": "#a8743f",  # wood light
    "D": "#5e3a20",  # wood dark
    "G": "#e6a121",  # gold band / lock body
    "g": "#a06b2e",  # gold shadow
    "H": "#f0c84a",  # gold highlight
    "P": "#f4ecd8",  # paper glow inside the open chest
}

CHEST_CLOSED = [
    "................",
    "................",
    "................",
    "....OOOOOOOO....",
    "..OOwwwwwwwwOO..",
    ".OwwWWWWWWWWwwO.",
    ".OWWWGGGGWWWWDO.",
    ".OOOOOOOOOOOOOO.",
    ".OWWWWGGWWWWWDO.",
    ".OWWWGHHGWWWWDO.",
    ".OWWWGgggWWWWDO.",
    ".OWWWWGGWWWWWDO.",
    ".ODDDDDDDDDDDDO.",
    "..OOOOOOOOOOOO..",
    "................",
    "................",
]

CHEST_OPEN = [
    "................",
    "..OOOOOOOOOOOO..",
    ".OwwwwwwwwwwwwO.",
    ".OWWWWWWWWWWWDO.",
    ".OOOOOOOOOOOOOO.",
    ".OPPPPPPPPPPPPO.",
    ".OPHPPHPPHPPHPO.",
    ".OOOOOOOOOOOOOO.",
    ".OWWWWGGWWWWWDO.",
    ".OWWWGHHGWWWWDO.",
    ".OWWWGgggWWWWDO.",
    ".OWWWWGGWWWWWDO.",
    ".ODDDDDDDDDDDDO.",
    "..OOOOOOOOOOOO..",
    "................",
    "................",
]

LOCK = [
    "..OOOO..",
    ".OggggO.",
    ".Og..gO.",
    "OOOOOOOO",
    "OGGHHGGO",
    "OGGOOGGO",
    "OGGGGGGO",
    ".OOOOOO.",
]


def rgb(hex_str: str) -> tuple[int, int, int, int]:
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def render(rows: list[str]) -> Image.Image:
    size = (len(rows[0]), len(rows))
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                px[x, y] = rgb(PALETTE[ch])
    return img


def main() -> None:
    UI_DIR.mkdir(parents=True, exist_ok=True)
    for name, rows in (("chest_16", CHEST_CLOSED), ("chest_16_open", CHEST_OPEN), ("lock_8", LOCK)):
        render(rows).save(UI_DIR / f"{name}.png", optimize=True)
        print(f"  {name}.png")
    print(f"Wrote UI sprites to {UI_DIR}")


if __name__ == "__main__":
    main()
