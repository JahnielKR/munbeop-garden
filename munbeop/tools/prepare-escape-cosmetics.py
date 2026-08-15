"""Prepare generated escape-room cosmetics at their runtime dimensions."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--size", type=int, required=True)
    args = parser.parse_args()

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(args.source) as source:
        image = source.convert("RGBA")
        image.thumbnail((args.size, args.size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (args.size, args.size), (0, 0, 0, 0))
        canvas.alpha_composite(
            image,
            ((args.size - image.width) // 2, (args.size - image.height) // 2),
        )
        canvas.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
