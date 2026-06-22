#!/usr/bin/env python3
"""QA the generated grammar-example OGGs against manifest.json. Run from repo root."""
from __future__ import annotations
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "escape-room-level02-audio"))
import common  # noqa: E402
from common import SR, analyze, peak_dbfs, read_ogg  # noqa: E402

OUT_DIR = common.REPO / "munbeop" / "public" / "grammar-examples" / "audio"


def main() -> int:
    rows = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
    bad = 0
    for row in rows:
        p = OUT_DIR / f"{row['id']}.ogg"
        if not p.exists():
            print(f"MISSING {p.name}"); bad += 1; continue
        info = sf.info(str(p)); y, ysr = read_ogg(p); m = analyze(y, ysr); pk = peak_dbfs(y)
        ok = (info.samplerate == SR and info.channels == 1 and info.format == "OGG"
              and 0.4 < m["dur_s"] < 8.0 and pk <= -1.0 and not bool(np.any(np.abs(y) >= 0.999)))
        if not ok:
            print(f"BAD {p.name} dur={m['dur_s']} peak={pk}"); bad += 1
    print(f"\n{len(rows) - bad}/{len(rows)} OK")
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
