#!/usr/bin/env python3
"""sprite-cat-strip.png — the in-scene temple cat, 2-frame strip (다실, Cuarto 1).

Dossier §11 ("el gato pardo, 2 frames (dormido / cabeza girada al cojín vacío)").
A 64×24 TRANSPARENT strip of two ~32×24 cells, played in room-01-dasil beside the
brazier. The whole point of this sprite is ONE quiet beat: the cat dozes by the
warm 화로, then lifts its head and looks at the empty cushion — the master's place,
the seat that no one will fill on the 49th day. Melancholy, not cute.

CONSISTENCY (the reason this asset exists): the cat MUST be the exact same animal
as room-01-dasil, so it is drawn ONLY with `common.cat()` — frame 0 = curled
asleep (the room's resting pose, `cat(0)`), frame 1 = sitting up with the head
turned left (`cat(1)`). Nothing about the cat is redrawn here; the room renders
`cat(d, 252, 156, frame=0)` and this strip renders the very same builder, so the
two are byte-consistent by construction (STYLE.md rule 2 + the cross-asset note:
"`cat` frame 0 y 1 los usan los cuartos").

ASSET-LOCAL detail painted AROUND the builder (per rule 2): only frame 1 carries
the small empty 방석 the cat turns toward — the same stone-gray cushion design as
room-01-dasil's "second cushion (the empty/served place)", drawn to the cat's LEFT
so its gaze lands on it. Frame 0 has none (the cat is asleep, the beat hasn't
landed yet). Both frames share ONE baseline: identical `cat()` y-origin → the
builder's own contact shadow sits on the same row in both cells, so the strip does
not bob when it loops.

Run from repo root:  python tools/escape-room-level02/gen_sprite-cat-strip.py
Deterministic: no unseeded random (the cat builder + a fixed-geometry cushion).
"""

from __future__ import annotations

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, hline, vline, dither, drop_shadow

W, H = 64, 24
FRAME_W = 32                       # two 32-wide cells side by side

# ── cat placement ────────────────────────────────────────────────────────────
# common.cat() draws into an ~16×16 cell: frame 0 spans x+1..x+15 / y+5..y+14,
# frame 1 spans x+1..x+15 / y-1..y+15 (ears reach y-1). With y=Y_CAT both frames
# share the builder's own drop_shadow row (y+14) → ONE baseline, no loop bob.
Y_CAT = 7                          # ears at y-1=6 ≥ 0; haunch bottom y+15=22 ≤ 23
# centre the ~16px cat in each 32px cell. Frame 0 (asleep) sits a touch right so
# it nestles toward the warm side it shares with the brazier in the room; frame 1
# (looking) sits a touch right too, leaving room on its LEFT for the cushion.
X_CAT0 = 9                         # cell 0: cat origin → loaf centre ≈ (17.5,17)
X_CAT1 = FRAME_W + 13              # cell 1: cat origin → sits right, gazing left


def _empty_cushion(d, cx: int, cy: int, cw: int = 15, ch: int = 6) -> None:
    """The empty 방석 the cat turns toward — same design as room-01-dasil's.

    A low-perspective square pad (trapezoid, wider at the near edge) with a piped
    seam and corner tufts, in the COOL `stone` ramp: this is the *empty/served
    place*, the cold seat, deliberately not warm. It sits to the cat's LEFT with a
    gap, so the gaze lands on a SEPARATE seat (the cat isn't sitting on it).
    Asset-local detail for frame 1 only; the cat's head is drawn looking at it.
    """
    col = PAL["stone"][1]                                # one step lighter → reads empty/pale
    drop_shadow(d, cx + 1, cy + ch - 1, cw - 2, 2, cool=True)
    top = [(cx + 3, cy), (cx + cw - 3, cy), (cx + cw, cy + ch), (cx, cy + ch)]
    d.polygon(top, fill=col, outline=OUTLINE)
    # piped seam just inside the edge
    d.polygon([(cx + 5, cy + 1), (cx + cw - 5, cy + 1),
               (cx + cw - 3, cy + ch - 2), (cx + 3, cy + ch - 2)],
              outline=PAL["stone"][2])
    # corner tufts (the four button tufts of a 방석)
    for (tx0, ty0) in ((cx + 5, cy + 1), (cx + cw - 6, cy + 1),
                       (cx + 3, cy + ch - 2), (cx + cw - 4, cy + ch - 2)):
        d.point((tx0, ty0), fill=PAL["stone"][3])
    # a lit near-edge so the pad reads as a top face, not a flat tile
    hline(d, cx + 1, cy + ch - 1, cw - 2, PAL["stone"][0])
    # the faintest cool hollow at the centre — an unoccupied dent (no one sat back)
    dither(d, cx + 6, cy + 2, cw - 11, 1, PAL["stone"][2], phase=1)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # ── FRAME 0 (cell x:0..31) — the cat curled asleep by the warm brazier ──
    C.cat(d, X_CAT0, Y_CAT, frame=0)

    # ── FRAME 1 (cell x:32..63) — head lifted, turned to the empty cushion ──
    # cushion FIRST (behind the cat), to the cat's LEFT with a small gap, sitting
    # low (toward the near floor) so it reads as a SEPARATE empty seat the cat
    # gazes down-and-left at — not a pad the cat is sitting on. Frame-1's head is
    # biased left (hx=x+3) and turns toward it.
    _empty_cushion(d, FRAME_W + 1, Y_CAT + 9)
    C.cat(d, X_CAT1, Y_CAT, frame=1)

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "sprite-cat-strip.png")
    C.preview(img, "preview_sprite-cat-strip.png", scale=3)
    # an 8× zoom of each frame so the pose + gaze direction can be eyeballed
    big = img.resize((W * 8, H * 8), Image.NEAREST)
    C.save_out(big, "zoom_sprite-cat-strip_8x.png")


if __name__ == "__main__":
    main()
