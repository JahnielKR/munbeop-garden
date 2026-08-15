"""Convert generated escape-room art to delivery-ready image assets.

The generated masters stay outside the repository. This helper keeps their
native resolution by default and applies a high-quality encode so the game can
serve retina-sharp scenes without shipping multi-megabyte source files. PNG
outputs retain alpha, which is useful for avatar frames and isolated rewards.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--quality", type=int, default=90)
    parser.add_argument(
        "--max-size",
        type=int,
        help="Optionally constrain the longest edge while preserving aspect ratio.",
    )
    parser.add_argument(
        "--fit",
        metavar="WIDTHxHEIGHT",
        help="Center-crop and resize to an exact delivery size, e.g. 640x480.",
    )
    args = parser.parse_args()

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(args.source) as image:
        if args.fit:
            try:
                width, height = (int(value) for value in args.fit.lower().split("x", 1))
            except (TypeError, ValueError) as error:
                parser.error(f"--fit must use WIDTHxHEIGHT, got {args.fit!r}: {error}")
            if width <= 0 or height <= 0:
                parser.error("--fit dimensions must be positive")
            image = ImageOps.fit(image, (width, height), Image.Resampling.LANCZOS)
        elif args.max_size and max(image.size) > args.max_size:
            image.thumbnail((args.max_size, args.max_size), Image.Resampling.LANCZOS)

        if args.destination.suffix.lower() == ".png":
            image.convert("RGBA").save(args.destination, "PNG", optimize=True)
        else:
            image.convert("RGB").save(
                args.destination,
                "WEBP",
                quality=args.quality,
                method=6,
            )


if __name__ == "__main__":
    main()
