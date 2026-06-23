#!/usr/bin/env python3
"""cosmetic-frame-hotteokbag.png — the 🔵 rare "호떡 봉지" avatar frame (Dossier §9).

A 96×96 avatar frame with a TRANSPARENT central window (~64×64) so the player's
avatar shows through. The border is a greaseproof KRAFT PAPER-BAG ring — the
oil-stained 호떡 봉지 paper of 순자 이모's stall — with CRUMPLED edges and four
market INK STAMPS, one per corner, each legible at 16×16 (dossier §9 / §10):

    top-left  = 철판 griddle ring     top-right    = 국자 ladle
    bottom-left = 호떡 disc            bottom-right = 꼬치 skewer

The frame border reuses the EXACT idiom + ramps of `common.paper_bag` (the shared
호떡-봉지 builder): white[1] kraft body, white[0] lit edge, wood_light[2] crease/
shade, ember[1] translucent oil blotches, and the tteok/ink ink-stamp idiom — so
this frame reads as the SAME paper bag the close-up/outro use (rule 2 — compose
with the shared builders). It is built NATIVELY at frame size rather than calling
`paper_bag()` (a bag silhouette, not a ring) — a tiny `paper_bag()` swatch was
tried as a cross-anchor token but reads as illegible noise at 13×20 inside a
busy paper rail, so the anchor is the shared ramps + oil + stamp idiom instead
(the dossier asks for a paper-bag FRAME, not a bag drawn inside a frame). The four
corner stamps are SUGGESTED market-ink icons — no legible Korean anywhere (L3-a) —
pure mundane stall iconography (L3-e).

Layout (a square paper ring; the 16×16 corner stamps sit ON the ring's corners):

    ┌────────────────────┐   outer edge  = 0
    │ S   top paper    S │   border band = 16px thick kraft paper
    │   ┌────────────┐   │   window      = 64×64 transparent (x,y 16..80)
    │ L │ transparent│ R │   stamps      = 16×16, one per corner, market ink
    │   └────────────┘   │
    │ S  bottom paper  S │
    └────────────────────┘

Light (dossier §9 set palette): this is a flat paper good, lit warm from the
griddle side (upper-left). The kraft catches a warm white[0] sheen top + left, a
wood_light[2] crumple-shade lower + right, ember oil blotches low-warm. No neon
"magic" glow, nothing hidden (L3-b/L3-e).

Run from repo root:  python tools/escape-room-level03/gen_cosmetic-frame-hotteokbag.py
Deterministic: no unseeded random; re-run -> byte-identical PNG.
"""

from __future__ import annotations

import random

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, hline, vline, frame, dither

W = H = 96
BORDER = 16                      # thickness of the kraft-paper border band
WIN = W - 2 * BORDER             # 64 → the transparent central window (16..80)
WIN_X0, WIN_Y0 = BORDER, BORDER
WIN_X1, WIN_Y1 = W - BORDER, H - BORDER   # 80, 80
STAMP = 16                       # market ink-stamp size (one per corner)

# the paper_bag ramps, reused VERBATIM (so the frame IS the same kraft bag)
PAPER = PAL["white"][1]
PAPER_HI = PAL["white"][0]
PAPER_SH = PAL["wood_light"][2]
PAPER_DK = PAL["wood_dark"][1]
OIL = PAL["ember"][1]
OIL_DK = PAL["ember"][2]
INK = PAL["ink"][1]
INK_DK = PAL["ink"][2]
STAMP_RED = PAL["tteok"][2]      # the faded market-stamp red (paper_bag's stamp color)


# the four 16×16 corner cells that hold the market ink-stamps
_STAMP_CELLS = (
    (0, 0), (W - STAMP, 0), (0, H - STAMP), (W - STAMP, H - STAMP),
)


def _in_stamp_cell(x: int, y: int) -> bool:
    """True if (x,y) is inside one of the four corner ink-stamp cells (a 2px pad
    inside the 16×16 so grain/creases keep clear and the stamp reads clean)."""
    for (cx, cy) in _STAMP_CELLS:
        if cx + 1 <= x < cx + STAMP - 1 and cy + 1 <= y < cy + STAMP - 1:
            return True
    return False


# ── the kraft-paper border ring (the 호떡 봉지 material) ──────────────────────

def _paper_ground(d) -> None:
    """Fill the whole 96×96 with kraft paper, then punch the window later.

    A flat sheet of brown-kraft 호떡 봉지 paper: base white[1] body with a sparse
    crumple-grain dither so the paper never reads as flat cardstock. The center
    window is punched transparent at the end; here the ring + window area is one
    continuous sheet so creases can run unbroken to the window lip.
    """
    fill(d, 0, 0, W, H, PAPER)
    # a faint all-over crumple grain (deterministic, seeded) — the kraft tooth.
    # kept sparse, and SKIPPED inside the four corner-stamp cells so each market
    # ink-stamp lands on clean-ish paper and reads at 16×16 (no grain bleed).
    r = random.Random(7733)
    for _ in range(230):
        x = r.randint(0, W - 1)
        y = r.randint(0, H - 1)
        if _in_stamp_cell(x, y):
            continue
        d.point((x, y), fill=PAPER_SH if (x + y) % 3 == 0 else PAPER_HI)


def _crumpled_creases(d) -> None:
    """Long folded creases + a CRUMPLED, serrated outer edge (the bag is balled up).

    The dossier calls for "arrugado en los bordes" (crumpled edges). Creases run
    across the four rails (like paper_bag's long vertical creases), and the very
    outer rim is nibbled with a serration of paper-shade + transparent notches so
    the silhouette reads as torn/crumpled kraft, not a clean printed frame.
    """
    r = random.Random(4242)
    # a few long diagonal fold creases on the MID of each rail (between the corner
    # stamps), paper_bag idiom (a shaded fold line with a lit ridge alongside).
    # kept off the corner stamp cells so the icons stay clean.
    creases = [
        (34, 1, 26, 13), (58, 2, 70, 13),     # top rail mids
        (38, 83, 50, 93),                      # bottom rail mid
        (2, 36, 13, 50),                       # left rail mid
        (83, 40, 93, 54),                      # right rail mid
    ]
    for (x0, y0, x1, y1) in creases:
        d.line([x0, y0, x1, y1], fill=PAPER_SH)
        d.line([x0 + 1, y0, x1 + 1, y1], fill=PAPER_HI)   # lit fold ridge alongside
    # short cross-folds so the kraft reads as wrinkled, not striped
    for _ in range(16):
        x = r.randint(2, W - 6)
        y = r.randint(2, H - 6)
        if WIN_X0 + 1 <= x < WIN_X1 - 1 and WIN_Y0 + 1 <= y < WIN_Y1 - 1:
            continue                                       # keep the window clean
        if _in_stamp_cell(x, y):
            continue                                       # keep the stamps clean
        dx, dy = r.choice([(3, 1), (2, 2), (1, 3), (3, -1)])
        d.line([x, y, x + dx, y + dy], fill=PAPER_SH)


def _crumpled_outer_rim(img, d) -> None:
    """Nibble the OUTER rim into a crumpled/torn serration (transparent notches).

    Walks the four outer edges and removes a deterministic scatter of 1px notches
    + darkens the kept rim with paper-shade, so the bag's outline reads CRUMPLED
    (dossier: "arrugado en los bordes") instead of a ruler-straight frame.
    """
    px = img.load()
    r = random.Random(909)
    # outer 2px rim, all four sides: shade it, then bite random notches transparent
    edge_pixels = []
    for x in range(W):
        edge_pixels += [(x, 0), (x, 1), (x, H - 1), (x, H - 2)]
    for y in range(H):
        edge_pixels += [(0, y), (1, y), (W - 1, y), (W - 2, y)]
    for (x, y) in edge_pixels:
        # darken the rim (a crumpled edge is in shadow)
        if px[x, y][3] != 0:
            d.point((x, y), fill=PAPER_SH)
    # bite serration notches out of the very outer ring (transparent)
    for x in range(0, W):
        if r.random() < 0.34:
            px[x, 0] = (0, 0, 0, 0)
            if r.random() < 0.4:
                px[x, 1] = (0, 0, 0, 0)
        if r.random() < 0.34:
            px[x, H - 1] = (0, 0, 0, 0)
            if r.random() < 0.4:
                px[x, H - 2] = (0, 0, 0, 0)
    for y in range(0, H):
        if r.random() < 0.34:
            px[0, y] = (0, 0, 0, 0)
            if r.random() < 0.4:
                px[1, y] = (0, 0, 0, 0)
        if r.random() < 0.34:
            px[W - 1, y] = (0, 0, 0, 0)
            if r.random() < 0.4:
                px[W - 2, y] = (0, 0, 0, 0)


def _oil_blotches(d) -> None:
    """Translucent ember OIL blotches (the 호떡 grease soaked into the paper).

    paper_bag's identity detail — dithered ember stains, low + warm, sitting on
    the rails (never on the window). A few warm grease patches so the frame reads
    as a USED 호떡 bag, not fresh paper.
    """
    # grease patches live ONLY on the mid-rails — NEVER in the corner stamp cells
    # (round 2 found corner oil bleeding into the ladle/skewer ink and muddying
    # them; keep the four corners clean so each market stamp reads at 16×16).
    dither(d, W // 2 - 8, 2, 16, 5, OIL, phase=1)          # top-centre
    dither(d, W // 2 - 6, H - 7, 13, 4, OIL, phase=0)      # bottom-centre
    dither(d, 2, H // 2 - 7, 5, 14, OIL, phase=1)          # left-centre
    dither(d, W - 7, H // 2 - 8, 5, 15, OIL_DK, phase=0)   # right-centre (deeper)
    # a couple of small extra licks just inboard of the rails (still off corners)
    dither(d, 22, 4, 7, 4, OIL, phase=0)                   # top inboard-left
    dither(d, H - 26, H - 8, 7, 4, OIL, phase=1)           # bottom inboard-right


def _rail_shading(d) -> None:
    """Warm sheen (griddle-lit, upper-left) + crumple shade (lower-right).

    The bag is lit warm from 이모's griddle at the upper-left: a white[0] sheen on
    the top + left outer faces, a wood_light[2] shade easing into the lower + right
    so the paper reads ROUND/crumpled, not a flat printed border.
    """
    # lit top + left outer faces (warm sheen)
    hline(d, 2, 2, W - 4, PAPER_HI)
    hline(d, 2, 3, W - 4, PAPER_HI)
    vline(d, 2, 2, H - 4, PAPER_HI)
    vline(d, 3, 2, H - 4, PAPER_HI)
    # shaded bottom + right outer faces (crumple shadow)
    dither(d, 2, H - 5, W - 4, 3, PAPER_SH, phase=1)
    dither(d, W - 5, 2, 3, H - 4, PAPER_SH, phase=0)


# ── the four corner market ink-stamps (each legible at 16×16, L3-a no text) ───

def _stamp_griddle(d, ox: int, oy: int) -> None:
    """철판 griddle ink-stamp: a round pan with a SIDE HANDLE + a spatula laid on it.

    A 철판 seen top-down: a big ink ring (the iron plate), a stubby handle bar
    poking out the LEFT (the asymmetry that stops it reading as a face), and a
    diagonal flat-spatula laid across the plate. One small oil-pool dot off-centre.
    Reads as "a griddle/pan" at 16px. Faded market red, like paper_bag's stamp.
    """
    cx, cy = ox + 9, oy + 8
    # the iron plate: a bold double ink ring, slightly squashed (a low pan)
    d.ellipse([cx - 6, cy - 5, cx + 6, cy + 5], outline=STAMP_RED)
    d.ellipse([cx - 5, cy - 4, cx + 5, cy + 4], outline=STAMP_RED)
    # the SIDE HANDLE poking out the left (the read-as-a-pan, not-a-face cue)
    hline(d, ox, cy, 4, STAMP_RED)
    hline(d, ox, cy - 1, 4, STAMP_RED)
    d.point((ox, cy + 1), fill=STAMP_RED)
    # the flat spatula laid diagonally across the plate (a short bar + a stick)
    d.line([cx - 3, cy + 2, cx + 3, cy - 2], fill=STAMP_RED)   # blade-to-handle
    d.line([cx - 3, cy + 3, cx + 2, cy - 1], fill=STAMP_RED)
    d.point((cx + 4, cy - 3), fill=STAMP_RED)                  # handle end off the lip
    # one oil-pool dot pooled on the plate (off-centre so it's not a symmetric eye)
    d.point((cx - 3, cy - 1), fill=STAMP_RED)


def _stamp_ladle(d, ox: int, oy: int) -> None:
    """국자 ladle ink-stamp: a round bowl + a long curved handle.

    The market ladle 이모 works the griddle with. A filled-ring bowl low, a handle
    sweeping up-right. Reads as "a ladle" at 16px (distinct from the skewer's
    straight stick by its bowl + curve).
    """
    # the cup BOWL lower-left: a small filled half-disc (clearly a scoop, not a ring)
    bx, by = ox + 5, oy + 11
    d.ellipse([bx - 4, by - 3, bx + 3, by + 4], outline=INK)
    d.chord([bx - 4, by - 3, bx + 3, by + 4], 0, 180, fill=INK)   # filled bowl belly
    hline(d, bx - 4, by - 3, 8, INK)                   # bowl rim (the open top)
    # the handle sweeping up to the right (a clean 2px curve to a hook end)
    d.line([bx + 2, by - 2, ox + 12, oy + 3], fill=INK)
    d.line([bx + 3, by - 2, ox + 13, oy + 3], fill=INK)
    d.point((ox + 13, oy + 2), fill=INK)               # a small hang-hook end
    d.point((ox + 12, oy + 2), fill=INK)


def _stamp_hotteok(d, ox: int, oy: int) -> None:
    """호떡 ink-stamp: a fat disc with a melted-sugar burst at the centre.

    THE level's hero food. A bold filled disc (the dough), a darker rim, a little
    star-burst of sugar cracking open at the centre. Reads unmistakably as a 호떡
    at 16px (the most filled of the four stamps).
    """
    cx, cy = ox + 8, oy + 8
    # the dough disc (a bold double ring + a dithered fill so it reads "fat/solid")
    d.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], outline=STAMP_RED)
    d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], outline=STAMP_RED)
    dither(d, cx - 4, cy - 4, 9, 9, STAMP_RED, phase=0)   # the browned dough body
    # the molten-sugar burst cracking open at the centre (the recognizable detail)
    d.point((cx, cy - 2), fill=STAMP_RED)
    d.point((cx, cy + 2), fill=STAMP_RED)
    d.point((cx - 2, cy), fill=STAMP_RED)
    d.point((cx + 2, cy), fill=STAMP_RED)
    d.point((cx, cy), fill=PAPER_HI)                   # the open sugar centre (light)


def _stamp_skewer(d, ox: int, oy: int) -> None:
    """꼬치 skewer ink-stamp: a straight stick with 3 stacked food pieces.

    A diagonal stick threaded with three little blobs (어묵/떡 on a stick). Reads
    as "a skewer" at 16px — distinguished from the ladle by being STRAIGHT with
    threaded pieces rather than a bowl + curve.
    """
    # the straight stick, corner-to-corner diagonal (single clean ink line, no
    # double-color muddle — a skewer is a thin bare stick). The food pieces are
    # threaded on the LOWER half; the bare stick juts past them top-right.
    d.line([ox + 2, oy + 14, ox + 14, oy + 2], fill=INK)
    d.point((ox + 1, oy + 14), fill=INK)               # the sharp bottom tip
    d.point((ox + 14, oy + 1), fill=INK)               # the blunt top end
    # three food pieces threaded along the stick — small SQUARE 어묵/떡 blocks (a
    # skewer's pieces are flat folded fishcake, not round), clearly 4px-spaced so
    # they never merge into a blob. Outlined so the stick still shows through.
    for (px, py) in ((ox + 4, oy + 12), (ox + 7, oy + 9), (ox + 10, oy + 6)):
        frame(d, px - 2, py - 2, 4, 4, INK)            # the piece's outline (square)
        d.point((px - 1, py - 1), fill=PAPER_HI)       # a tiny clean highlight inside


def _stamps(d) -> None:
    """Stamp the four market ink-icons on the ring's corners (each 16×16)."""
    _stamp_griddle(d, 0, 0)               # 철판 top-left
    _stamp_ladle(d, W - STAMP, 0)         # 국자 top-right
    _stamp_hotteok(d, 0, H - STAMP)       # 호떡 bottom-left
    _stamp_skewer(d, W - STAMP, H - STAMP)  # 꼬치 bottom-right


def _window_edges(d) -> None:
    """Frame the transparent 64×64 window: a torn-paper inner lip + crisp OUTLINE.

    The inner cut where the bag was opened: a warm white[0] lit lip on the upper-
    left of the hole, a wood_light[2] shaded lip on the lower-right (so the cut
    reads as a thickness of paper), closed by a crisp OUTLINE so the avatar seats
    cleanly. NO #000 (OUTLINE is the warm-black, per rule 2).
    """
    # lit inner lip (upper-left of the window) + shaded inner lip (lower-right)
    hline(d, WIN_X0 - 1, WIN_Y0 - 1, WIN + 2, PAPER_HI)
    vline(d, WIN_X0 - 1, WIN_Y0 - 1, WIN + 2, PAPER_HI)
    hline(d, WIN_X0 - 1, WIN_Y1, WIN + 2, PAPER_SH)
    vline(d, WIN_X1, WIN_Y0 - 1, WIN + 2, PAPER_SH)
    # crisp outline closing the hole
    frame(d, WIN_X0 - 1, WIN_Y0 - 1, WIN + 2, WIN + 2, OUTLINE)


def _punch_window(img: Image.Image) -> None:
    """Force the central 64×64 window fully transparent (the avatar shows here)."""
    px = img.load()
    for yy in range(WIN_Y0, WIN_Y1):
        for xx in range(WIN_X0, WIN_X1):
            px[xx, yy] = (0, 0, 0, 0)


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    _paper_ground(d)        # the kraft-paper sheet + crumple grain
    _punch_window(img)      # punch the window FIRST so creases/lip can border it
    _rail_shading(d)        # warm griddle-lit sheen (UL) + crumple shade (LR)
    _crumpled_creases(d)    # folded creases across the rails
    _oil_blotches(d)        # the translucent ember 호떡-grease stains
    _stamps(d)              # the four market ink-stamps on the corners
    _window_edges(d)        # the torn-paper inner lip + crisp window outline
    _crumpled_outer_rim(img, d)  # nibble the outer rim into a crumpled serration
    _punch_window(img)      # re-punch (any lip overdraw) — guarantee clean window

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-frame-hotteokbag.png")
    C.preview(img, "preview_cosmetic-frame-hotteokbag.png", scale=3)
    # an 8× zoom of each corner stamp so the 16×16 icon read can be eyeballed
    for name, (cx, cy) in (("griddle", (0, 0)), ("ladle", (W - STAMP, 0)),
                           ("hotteok", (0, H - STAMP)), ("skewer", (W - STAMP, H - STAMP))):
        crop = img.crop((cx, cy, cx + STAMP, cy + STAMP))
        crop = crop.resize((STAMP * 8, STAMP * 8), Image.NEAREST)
        C.save_out(crop, f"zoom_hotteokbag_corner_{name}_8x.png")
    # composite over a light + a dark avatar-card so the transparent window + the
    # frame contrast can be judged the way the UI will show it.
    for tag, bg in (("light", (246, 239, 226, 255)), ("dark", (28, 24, 48, 255))):
        card = Image.new("RGBA", (W, H), bg)
        card.alpha_composite(img)
        C.save_out(card.resize((W * 3, H * 3), Image.NEAREST),
                   f"card_hotteokbag_{tag}_3x.png")


if __name__ == "__main__":
    main()
