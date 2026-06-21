#!/usr/bin/env python3
"""QA the 14 Particle Lab sentence OGGs: format, mono, 44100, duration, peak."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ESC = Path(__file__).resolve().parents[1] / "escape-room-level02-audio"
sys.path.insert(0, str(ESC))
import common  # noqa: E402
from common import SR, peak_dbfs, read_ogg  # noqa: E402

AUDIO = common.REPO / "munbeop" / "public" / "particle-lab" / "audio"
IDS = [
    "s01-jeoneun", "s02-goyangi", "s03-hakgyo", "s04-doseogwan", "s05-jeodo",
    "s06-achime", "s07-biga", "s08-chinguhante", "s09-beoseuro", "s10-ppangman",
    "s11-sagwawa", "s12-ahopsibuteo", "s13-yeonpillo", "s14-jeodo",
]


def main() -> int:
    bad = 0
    for sid in IDS:
        p = AUDIO / f"sentence-{sid}.ogg"
        if not p.exists():
            print(f"MISSING {p}")
            bad += 1
            continue
        info = sf.info(str(p))
        y, ysr = read_ogg(p)
        dur = y.shape[0] / ysr
        pk = peak_dbfs(y)
        clipped = bool(np.any(np.abs(y) >= 0.999))
        ok = (info.format == "OGG" and info.channels == 1 and info.samplerate == SR
              and 0.4 < dur < 8.0 and pk <= -1.0 and not clipped)
        print(f"{'OK ' if ok else 'BAD'} {sid:16s} {dur:5.2f}s peak {pk:6.2f} "
              f"{info.samplerate}Hz/{info.channels}ch/{info.format}")
        if not ok:
            bad += 1
    print(f"\n{len(IDS) - bad}/{len(IDS)} OK")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
