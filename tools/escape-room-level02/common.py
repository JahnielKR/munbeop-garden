#!/usr/bin/env python3
"""Shared palette + drawing helpers for the Level 2 escape-room art pipeline.

Every gen_*.py script in this folder imports from here so the 22 assets share
ONE cold-rain/warm-ember palette ("El templo de la lluvia", per
docs/escape-room-level-02.md §6/§10) and ONE outline color. This mirrors the
level-1 `common.py` structure verbatim where possible (the warm hanok neutrals
are reused byte-for-byte — the temple is also hanok wood + hanji paper) and
adds the rain-level ramps + the shared sprite/element builders.

Final PNGs land under `munbeop/public/escape-room/level-02/`; previews, debug
renders and contact sheets under `tools/escape-room-level02/out/` (review only).

This module is the shared library so it intentionally exceeds 400 lines, but
every builder stays readable and carries a one-line docstring naming its
consumers (see STYLE.md "Shared builders API" for the canonical table).
Deterministic only: any scatter uses an explicit random.Random(seed).
"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
LEVEL_DIR = REPO / "munbeop" / "public" / "escape-room" / "level-02"
OUT_DIR = HERE / "out"


def rgb(hex_str: str, a: int = 255) -> tuple[int, int, int, int]:
    """Hex -> RGBA tuple. Shared by every color constant below."""
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


# Soft black shared by every sprite outline — never use #000000 (same as L1).
OUTLINE = rgb("#2a1c14")

# Two contact-shadow tints (the rain level has a warm interior + cold exterior):
SHADOW_WARM = rgb("#5e4226", 90)   # interior, ember-lit props (level-1 SHADOW)
SHADOW_COOL = rgb("#2e3a41", 90)   # rain/exterior contact shadow, stone

# ── Palette (light → dark inside each ramp) ──────────────────────────────────
# Cold rain outside, warm ember/lantern inside, bronze bell, plum, ink.
# Warm neutrals (wood/hanji/floor) are reused VERBATIM from level 1.

PAL = {
    # warm neutrals reused from level 1 (hanok structure)
    "wood_light": [rgb(c) for c in ("#eccf9c", "#dab177", "#bd9258", "#9a6f3f")],
    "wood_dark": [rgb(c) for c in ("#a87c4e", "#83603a", "#624627", "#46311b")],
    "hanji": [rgb(c) for c in ("#faf3e3", "#f1e5cb", "#e2cfab", "#c9b28b")],
    "floor": [rgb(c) for c in ("#e0b87f", "#caa066", "#ad8450", "#8d683c")],
    # NEW — the rain level
    "rain": [rgb(c) for c in ("#cdd6dd", "#9fb0bc", "#6e828f", "#47565f", "#2e3a41")],
    "ember": [rgb(c) for c in ("#ffe6b0", "#ffba6e", "#f2904a", "#c75f33")],
    "gold_light": [rgb(c) for c in ("#fdeebe", "#f7d488", "#e8b45e")],
    "bronze": [rgb(c) for c in ("#cdb98f", "#a8915f", "#7c6740", "#4f3f26")],
    "plum": [rgb(c) for c in ("#fbf2f4", "#f3cdd9", "#e0a0b6", "#c0788f", "#8f5570")],
    "ink": [rgb(c) for c in ("#6a584b", "#41342b", "#241c17")],
    "stone": [rgb(c) for c in ("#c3c2bb", "#9a988f", "#6f6d65", "#474640")],
    "green": [rgb(c) for c in ("#b7c489", "#94a868", "#71894c", "#536b39")],
    "dc_green": [rgb(c) for c in ("#8aa07e", "#6f8f6a", "#4f6b4d", "#35492f")],
    "dc_red": [rgb(c) for c in ("#c8675a", "#b0463a", "#7e2f28", "#561f1b")],
    "dc_blue": [rgb(c) for c in ("#8fb0c9", "#5b7fa6", "#3c5777", "#26384f")],
    "white": [rgb(c) for c in ("#f6efe2", "#e7ddca", "#cdbfa3")],
    "metal": [rgb(c) for c in ("#dde2e7", "#b3bcc5", "#878f9a", "#5d646e")],
    "night": [rgb(c) for c in ("#8b93b4", "#5f6890", "#3f4769", "#2b3049")],
}

# ── Documented derived shades (one step of an existing ramp, NO new hue) ──────
# verdigris bronze accent: bronze pushed toward green (mid bronze blended green)
VERDIGRIS = rgb("#7e8a5f")          # derive bronze[2] toward dc_green[2]
# rose-gold sky accent for the outro break-in-the-clouds (plum[1] warmed by gold)
ROSE_GOLD = rgb("#f6d6c0")          # plum[1] one step toward gold_light[0]
# deepest rain, one step darker than rain[4] for the second-shadow on wet gold
RAIN_DEEP = rgb("#222b31")          # rain[4] one step darker


# ── Canvas / IO (ported from level-1 common.py, save targets level-02) ───────


def new_canvas(w: int, h: int, bg: tuple | None = None):
    """RGBA canvas; bg=None keeps it fully transparent (sprites)."""
    img = Image.new("RGBA", (w, h), bg if bg else (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save_asset(img: Image.Image, *relparts: str) -> Path:
    """Save a FINAL asset under munbeop/public/escape-room/level-02/<relparts>."""
    path = LEVEL_DIR.joinpath(*relparts)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    print(f"asset  {path.relative_to(REPO)}")
    return path


def save_out(img: Image.Image, name: str) -> Path:
    """Save a review render (preview/debug/contact sheet) under out/."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    img.save(path)
    print(f"review {path.relative_to(REPO)}")
    return path


def preview(img: Image.Image, name: str, scale: int = 3) -> Path:
    """Nearest-neighbor upscale saved to out/ — what you Read to self-review."""
    big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    return save_out(big, name)


def hotspot_debug(img: Image.Image, rects: list[tuple[int, int, int, int]],
                  name: str, scale: int = 3) -> Path:
    """Overlay clickable rects in red on a copy + save to out/ for alignment QA."""
    dbg = img.convert("RGBA").copy()
    d = ImageDraw.Draw(dbg)
    for (x, y, w, h) in rects:
        d.rectangle([x, y, x + w - 1, y + h - 1], outline=(255, 0, 0, 255), width=1)
    big = dbg.resize((dbg.width * scale, dbg.height * scale), Image.NEAREST)
    return save_out(big, name)


# ── Primitive drawing helpers (ported verbatim from level-1) ─────────────────


def fill(d: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, c) -> None:
    """Filled rectangle by (x,y,w,h). The workhorse — used everywhere."""
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def frame(d: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, c=OUTLINE) -> None:
    """1px rectangle outline by (x,y,w,h). Default color is OUTLINE."""
    d.rectangle([x, y, x + w - 1, y + h - 1], outline=c, width=1)


def hline(d, x: int, y: int, w: int, c) -> None:
    """Horizontal 1px line of width w. Used everywhere."""
    d.line([x, y, x + w - 1, y], fill=c)


def vline(d, x: int, y: int, h: int, c) -> None:
    """Vertical 1px line of height h. Used everywhere."""
    d.line([x, y, x, y + h - 1], fill=c)


def dither(d, x: int, y: int, w: int, h: int, c, phase: int = 0) -> None:
    """Checkerboard dither — the ONLY blending tool allowed (no alpha mush)."""
    for yy in range(y, y + h):
        for xx in range(x + ((yy + phase) % 2), x + w, 2):
            d.point((xx, yy), fill=c)


def wood_planks(d, x: int, y: int, w: int, h: int, ramp, plank_h: int = 8,
                seam_every: int = 0, rng=None) -> None:
    """Horizontal planks: base fill, seam lines, grain ticks. Room floors/beams."""
    base, mid, dark = ramp[0], ramp[1], ramp[-1]
    fill(d, x, y, w, h, base)
    for row, yy in enumerate(range(y, y + h, plank_h)):
        hline(d, x, yy, w, dark)
        off = (row * 13) % max(w - 6, 1)
        if seam_every and row % seam_every == 0:
            vline(d, x + off, yy + 1, min(plank_h - 1, y + h - yy - 1), mid)
        for gx in range(x + (row * 7) % 11, x + w - 2, 23):
            hline(d, gx, yy + plank_h // 2, 3, mid)


def hanji_wall(d, x: int, y: int, w: int, h: int, ramp=None, fleck_step: int = 9) -> None:
    """Warm paper wall: base + sparse fiber flecks. Temple interior walls/screens."""
    ramp = ramp or PAL["hanji"]
    fill(d, x, y, w, h, ramp[1])
    i = 0
    for yy in range(y + 2, y + h - 2, 4):
        for xx in range(x + 2 + (yy * 3) % fleck_step, x + w - 2, fleck_step):
            d.point((xx, yy), fill=ramp[0] if i % 3 else ramp[2])
            i += 1


def glow(d, cx: int, cy: int, r: int, ramp) -> None:
    """Dithered radial glow (lantern/ember). ramp light→dark, drawn dark-out."""
    for i, c in enumerate(reversed(ramp)):
        rr = int(r * (len(ramp) - i) / len(ramp))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c)


def drop_shadow(d, x: int, y: int, w: int, h: int = 2, cool: bool = False) -> None:
    """Soft contact shadow under props (dithered). cool=True for stone/rain."""
    op = (SHADOW_COOL if cool else SHADOW_WARM)[:3] + (255,)
    dither(d, x, y, w, h, op, phase=1)


# ═════════════════════════════════════════════════════════════════════════════
#  NEW shared element / sprite builders (the cross-asset consistency layer).
#  Each one is documented with its consumers; see STYLE.md for the full API.
# ═════════════════════════════════════════════════════════════════════════════


# ── Rain ─────────────────────────────────────────────────────────────────────

def rain_curtain(d, x: int, y: int, w: int, h: int, phase: int = 0,
                 density: int = 7, lean: int = 2) -> None:
    """2-layer 1px diagonal slate rain streaks (far=rain[1], near=rain[2]).

    phase shifts the pattern for a 2-frame animation feel.
    Consumers: all 4 rooms, cinematic-intro, cosmetic-bg-rainsound.
    """
    far, near = PAL["rain"][1], PAL["rain"][2]
    # far layer: shorter, lighter, denser, drawn first (behind)
    for col in range(x - h, x + w, density + 2):
        ox = col + (phase * 3)
        for k in range(3):
            yy = y + ((ox + k * 5) % h)
            xx = ox + (yy - y) // lean
            if x <= xx < x + w and y <= yy < y + h:
                d.point((xx, yy), fill=far)
    # near layer: longer streaks, darker, sparser, drawn on top (front)
    for col in range(x - h, x + w, density):
        ox = col + (phase * 4) + 3
        for k in range(0, h, 6):
            yy = y + ((ox + k) % h)
            xx = ox + (yy - y) // lean
            if x <= xx < x + w and y + 1 <= yy < y + h - 1:
                d.point((xx, yy), fill=near)
                if yy + 1 < y + h:
                    d.point((xx, yy + 1), fill=near)  # 2px streak = motion


def rain_clear(d, x: int, y: int, w: int, eave_y: int, phase: int = 0) -> None:
    """Dripping-eave drops + 1px steam wisps rising from wet stone (post-rain).

    Drops fall from eave_y; steam rises from the floor row y within [x,x+w].
    Consumers: room-04-jongnu-clear, cinematic-outro.
    """
    # eave drops: a 2-3px elongated teardrop mid-fall, bright tip, every ~13px
    for i, dx in enumerate(range(x + 7, x + w - 4, 13)):
        dy = eave_y + ((i * 5 + phase * 5) % 16)
        d.point((dx, dy - 1), fill=PAL["rain"][2])
        d.point((dx, dy), fill=PAL["rain"][1])
        d.point((dx, dy + 1), fill=PAL["white"][1])     # bright leading tip
        d.point((dx, dy + 2), fill=PAL["white"][0])
    # steam: curling 1px columns rising from the stone, denser + taller to read
    amp = (0, 0, 1, 1, 0, -1, -1, 0)
    for i, sx in enumerate(range(x + 5, x + w - 5, 13)):
        for k in range(9):
            yy = y - k * 2
            ox = amp[(k + i * 2 + phase) % len(amp)]
            # warm-white near the stone, fading to rain-light as it rises
            c = PAL["white"][0] if k < 3 else (PAL["white"][1] if k < 6 else PAL["rain"][0])
            d.point((sx + ox, yy), fill=c)
            if k < 4:                                    # thicker base = more legible
                d.point((sx + ox + 1, yy), fill=PAL["white"][1])


# ── Lanterns (paper, the 49-lantern wall) ────────────────────────────────────

def lantern_tile(d, x: int, y: int, lit: bool = True) -> None:
    """One paper lantern ~16×24, lit (gold/ember halo) or unlit (rain-gray).

    (x,y) = top-left of the 16×24 cell. Consumers: lantern_wall, daeungjeon,
    cosmetic-bg-rainsound (as halos behind rain).
    """
    cx = x + 8
    if lit:
        # warm halo first (dithered, behind the body), then the glowing paper
        glow(d, cx, y + 13, 11, [PAL["gold_light"][2], PAL["ember"][1], PAL["ember"][0]])
        body, top, bot = PAL["gold_light"][0], PAL["ember"][1], PAL["ember"][2]
        cord_c = PAL["ember"][3]
    else:
        body, top, bot = PAL["rain"][1], PAL["rain"][2], PAL["rain"][3]
        cord_c = PAL["rain"][3]
    # hanging cord + top cap
    vline(d, cx, y, 3, cord_c)
    fill(d, cx - 3, y + 3, 6, 2, PAL["wood_dark"][2])
    # paper body: rounded barrel (8 wide, tapering top/bottom)
    fill(d, x + 3, y + 6, 10, 13, body)
    fill(d, x + 2, y + 8, 12, 9, body)
    hline(d, x + 3, y + 6, 10, top)
    hline(d, x + 2, y + 8, 12, top)
    hline(d, x + 3, y + 18, 10, bot)
    hline(d, x + 2, y + 16, 12, bot)
    # 2 horizontal rib bands (the bamboo frame of a cheongsachorong)
    hline(d, x + 2, y + 11, 12, bot)
    hline(d, x + 2, y + 14, 12, bot)
    if lit:
        # bright vertical core so a lit lantern reads as a light source at 1x
        vline(d, cx, y + 8, 9, PAL["gold_light"][0])
        d.point((cx, y + 12), fill=PAL["white"][0])
    # bottom tassel cap + outline
    fill(d, cx - 2, y + 19, 4, 2, PAL["wood_dark"][2])
    vline(d, cx, y + 21, 2, cord_c)
    frame(d, x + 2, y + 6, 12, 13, OUTLINE)
    d.point((x + 1, y + 9), fill=OUTLINE)
    d.point((x + 14, y + 9), fill=OUTLINE)


def lantern_wall(d, x: int, y: int, cols: int = 7, rows: int = 7,
                 step_x: int = 20, step_y: int = 27,
                 unlit_col: int = 6, unlit_row: int = 0) -> None:
    """cols×rows grid of lantern_tile with ONE unlit at (unlit_col,unlit_row).

    The unlit lantern 49 stays unlit in BOTH altar states (canon §6).
    Consumers: daeungjeon (incomplete + complete), cosmetic-bg-rainsound.
    """
    for r in range(rows):
        for c in range(cols):
            lit = not (c == unlit_col and r == unlit_row)
            lantern_tile(d, x + c * step_x, y + r * step_y, lit=lit)


# ── 우담 the monk + the temple cat (cross-consistency anchors) ────────────────

def monk(d, x: int, y: int, pose: str = "seated_tea") -> None:
    """우담: shaved head, gray robe (회색 승복) + persimmon kasaya, serene, ~28.

    (x,y) = top-left of the bounding cell (poses fit ~30×46 seated, ~22×40
    gassho). MUST read as the SAME person in both poses (head shape, kasaya
    color, brow). Consumers: room-01-dasil, cinematic-outro.
    """
    head_w = 9
    skin = PAL["wood_light"][0]
    skin_sh = PAL["wood_light"][1]
    robe, robe_sh = PAL["rain"][1], PAL["rain"][2]
    kasaya, kasaya_sh = PAL["ember"][2], PAL["ember"][3]

    if pose == "seated_tea":
        # cross-legged, leaning slightly forward, hands on a teapot.
        hx = x + 15
        drop_shadow(d, x + 4, y + 44, 24, 2)
        # robe: a wide low triangle (lap) + torso
        d.polygon([(x + 3, y + 44), (x + 27, y + 44), (x + 22, y + 24),
                   (x + 8, y + 24)], fill=robe, outline=OUTLINE)
        fill(d, x + 9, y + 18, 13, 10, robe)            # torso
        # fold shading on the lap (dither, lower-right)
        dither(d, x + 13, y + 34, 11, 7, robe_sh, phase=0)
        # center seam — stop it ABOVE the hands so it never bisects them into a
        # flat "patch"; resume below the hands on the lap.
        vline(d, x + 15, y + 25, 5, robe_sh)
        vline(d, x + 15, y + 34, 9, robe_sh)
        # persimmon kasaya sash crossing the chest (the identity color)
        d.line([x + 8, y + 20, x + 22, y + 26], fill=kasaya)
        d.line([x + 8, y + 21, x + 22, y + 27], fill=kasaya_sh)
        # shoulders/arms reaching to the teapot in front
        fill(d, x + 7, y + 22, 4, 9, robe)
        fill(d, x + 20, y + 22, 4, 9, robe)
        # hands (skin) cupped low-center, meeting at the middle as if cradling a
        # cup/pot. Articulated (knuckle sheen + thumb tick + shaded underside +
        # soft outline) so the gesture reads as HANDS, not a flat label patch —
        # even before the room script slots a teapot between/under them.
        _monk_hands(d, x + 10, y + 29, skin, skin_sh)
        _monk_head(d, hx, y + 8, head_w, skin, skin_sh, tilt=1)
    else:  # gassho — small standing figure, palms together, head bowed (outro)
        drop_shadow(d, x + 2, y + 38, 16, 2)
        # robe column (narrow), slight A-line at the hem
        d.polygon([(x + 3, y + 38), (x + 17, y + 38), (x + 15, y + 18),
                   (x + 5, y + 18)], fill=robe, outline=OUTLINE)
        vline(d, x + 10, y + 19, 18, robe_sh)
        dither(d, x + 11, y + 28, 5, 9, robe_sh, phase=1)
        # kasaya band across the chest
        hline(d, x + 5, y + 21, 10, kasaya)
        hline(d, x + 5, y + 22, 10, kasaya_sh)
        # palms pressed together in front of the chest (합장) — a bright skin
        # blade with a dark seam so the gesture reads even on the dark card
        fill(d, x + 8, y + 19, 4, 8, skin)
        vline(d, x + 8, y + 19, 8, PAL["wood_light"][0])  # lit thumb edge
        vline(d, x + 11, y + 20, 6, skin_sh)              # shaded outer hand
        vline(d, x + 10, y + 20, 6, OUTLINE)              # the seam between palms
        frame(d, x + 7, y + 18, 6, 10, OUTLINE)
        _monk_head(d, x + 4, y + 6, head_w, skin, skin_sh, tilt=2)


def _monk_head(d, x: int, y: int, w: int, skin, skin_sh, tilt: int = 0) -> None:
    """Shared shaved head for monk(): same face hint in every pose. Internal."""
    # rounded shaved head
    d.ellipse([x, y, x + w, y + w], fill=skin, outline=OUTLINE)
    # cheek/jaw shading on the right for volume
    dither(d, x + w - 3, y + 3, 3, w - 4, skin_sh, phase=0)
    cy = y + w // 2
    # serene face hint: two soft closed/down eyes + faint brow, slight smile
    d.point((x + 3, cy), fill=OUTLINE)
    d.point((x + w - 3, cy), fill=OUTLINE)
    d.point((x + 3 + tilt, cy + 2), fill=skin_sh)         # cheek
    hline(d, x + 3, cy + 3, w - 5, skin_sh)               # gentle smile shadow
    d.point((x + w // 2, cy + 1), fill=skin_sh)           # nose tick


def _monk_hands(d, x: int, y: int, skin, skin_sh) -> None:
    """Two cupped hands meeting at center (~10×4), for monk(seated_tea). Internal.

    Drawn as two rounded mitts that nearly touch, with a knuckle highlight, a
    thumb tick at the inner seam and a shaded underside, so they read as hands
    cradling a vessel rather than a flat skin patch. The 1px gap between them is
    where a room-placed teapot sits — the hands stay legible with or without it.
    """
    # left hand: 4 wide, rounded outer-top corner
    fill(d, x, y + 1, 4, 3, skin)
    d.point((x + 1, y), fill=skin)                         # knuckle rise
    d.point((x + 2, y), fill=skin)
    d.point((x, y + 1), fill=skin_sh)                      # rounded outer corner
    hline(d, x, y + 3, 4, skin_sh)                         # shaded underside
    d.point((x + 3, y + 1), fill=skin_sh)                  # inner thumb tick
    # right hand: mirror, rounded outer-top corner on the right
    fill(d, x + 6, y + 1, 4, 3, skin)
    d.point((x + 7, y), fill=skin)
    d.point((x + 8, y), fill=skin)
    d.point((x + 9, y + 1), fill=skin_sh)                  # rounded outer corner
    hline(d, x + 6, y + 3, 4, skin_sh)                     # shaded underside
    d.point((x + 6, y + 1), fill=skin_sh)                  # inner thumb tick
    # soft outline cupping the underside so the pair reads as hands, not a label
    hline(d, x, y + 4, 10, OUTLINE)
    d.point((x - 1, y + 3), fill=OUTLINE)
    d.point((x + 10, y + 3), fill=OUTLINE)


def _cat_ear(d, tipx: int, tipy: int, fur, sgn: int) -> None:
    """One triangular cat ear, apex at (tipx,tipy), base 3px down. Internal."""
    d.polygon([(tipx, tipy), (tipx - 2 * sgn, tipy + 3), (tipx + sgn, tipy + 3)],
              fill=fur, outline=OUTLINE)
    d.point((tipx - sgn, tipy + 2), fill=PAL["plum"][2])  # inner-ear pink fleck


def cat(d, x: int, y: int, frame: int = 0) -> None:
    """Brown temple cat. (x,y)=top-left of an ~16×16 cell (head can reach y-1..y+1).

    frame 0 curled asleep · 1 head turned to empty cushion · 2 looking off-frame.
    Consumers: room-01-dasil, sprite-cat-strip, cosmetic-avatar-templecat(+strip),
    cinematic-outro.
    """
    fur, fur_sh, fur_hi = PAL["wood_dark"][1], PAL["wood_dark"][2], PAL["wood_light"][2]
    drop_shadow(d, x + 2, y + 14, 13, 1)
    if frame == 0:
        # curled asleep: a crescent back arcing high-right down to a tucked head
        # on the left, with the tail sweeping across the front paws.
        d.ellipse([x + 2, y + 5, x + 15, y + 14], fill=fur, outline=OUTLINE)  # body loaf
        hline(d, x + 5, y + 6, 7, fur_hi)                # arched back highlight
        d.point((x + 4, y + 7), fill=fur_hi)
        dither(d, x + 4, y + 10, 10, 3, fur_sh, phase=0)
        # tucked-down head, lower-left, with two small folded ears
        d.ellipse([x + 1, y + 8, x + 8, y + 14], fill=fur, outline=OUTLINE)
        _cat_ear(d, x + 3, y + 7, fur, +1)
        _cat_ear(d, x + 6, y + 7, fur, +1)
        hline(d, x + 2, y + 11, 4, fur_sh)               # closed sleeping eye-line
        # tail sweeping across the front, tip curling up (highlighted to read)
        d.line([x + 14, y + 12, x + 6, y + 14], fill=fur_sh)
        d.line([x + 14, y + 11, x + 7, y + 13], fill=fur_hi)
        d.point((x + 5, y + 13), fill=fur_hi)            # curled tip
    else:
        # sitting profile, upright; frame 1 head-left, frame 2 head up-right.
        # haunch + chest column
        d.ellipse([x + 3, y + 7, x + 14, y + 15], fill=fur, outline=OUTLINE)  # haunch
        fill(d, x + 5, y + 5, 6, 9, fur)                 # upright chest
        dither(d, x + 8, y + 9, 5, 5, fur_sh, phase=1)
        hx = x + 3 if frame == 1 else x + 6              # head bias by look-dir
        d.ellipse([hx, y, hx + 7, y + 7], fill=fur, outline=OUTLINE)          # head
        dither(d, hx + 4, y + 2, 3, 4, fur_sh, phase=0)
        _cat_ear(d, hx + 1, y - 1, fur, +1)              # left ear
        _cat_ear(d, hx + 6, y - 1, fur, -1)              # right ear
        # eyes catch a faint warm glint, biased toward the look direction
        ex = hx + 1 if frame == 1 else hx + 3
        d.point((ex, y + 3), fill=PAL["gold_light"][1])
        d.point((ex + 3, y + 3), fill=PAL["gold_light"][1])
        d.point((hx + 3, y + 5), fill=fur_sh)            # muzzle/nose
        # front legs + a curved upright tail on the right
        vline(d, x + 6, y + 13, 2, fur_sh)
        vline(d, x + 9, y + 13, 2, fur_sh)
        d.line([x + 14, y + 13, x + 15, y + 6], fill=fur)
        d.line([x + 15, y + 6, x + 13, y + 3], fill=fur)
        d.point((x + 15, y + 9), fill=fur_hi)            # tail highlight


# ── The bronze bell + its striker (the 종루) ──────────────────────────────────

def bell_beom(d, x: int, y: int, w: int = 46, h: int = 70) -> None:
    """Bronze 범종: heavy hanging mass, 용뉴 dragon-hook top, 비천상 relief in 2 tones.

    (x,y)=top-left of the bell bounding box. Consumers: room-04-jongnu(+clear).
    """
    lo, mid, hi, dk = PAL["bronze"][2], PAL["bronze"][1], PAL["bronze"][0], PAL["bronze"][3]
    cx = x + w // 2
    # 용뉴 dragon hook + sound-tube (음통) on top
    vline(d, cx, y - 6, 6, dk)
    d.ellipse([cx - 4, y - 9, cx + 4, y - 2], outline=OUTLINE, fill=mid)  # hook loop
    d.point((cx - 2, y - 7), fill=hi)
    fill(d, cx + 3, y - 6, 3, 7, mid)                    # 음통 tube beside hook
    vline(d, cx + 3, y - 6, 7, hi)
    # bell body: shoulders narrow, flares to a wide mouth (slightly belled)
    top_w = w - 14
    d.polygon([(x + 7, y), (x + w - 7, y), (x + w - 1, y + h - 8),
               (x + 1, y + h - 8)], fill=lo, outline=OUTLINE)
    fill(d, x + (w - top_w) // 2, y, top_w, 4, mid)      # shoulder band
    # vertical light gradient: left lit, right in shade (bronze absorbs light)
    dither(d, x + w - 16, y + 6, 14, h - 18, dk, phase=0)
    vline(d, x + 6, y + 6, h - 16, hi)                   # left rim highlight
    vline(d, x + 7, y + 8, h - 20, mid)
    # 당좌 (the lotus strike pad) — a small disc low-center where 당목 hits
    d.ellipse([cx - 5, y + h - 26, cx + 5, y + h - 16], fill=dk, outline=OUTLINE)
    d.ellipse([cx - 3, y + h - 24, cx + 3, y + h - 18], outline=hi)
    # 비천상: an apsara relief SUGGESTED in 2 tones (hi raise + dk recess), upper body
    _bicheon(d, x + 9, y + 12, hi, dk)
    # decorative bands top & bottom (연주문 dotted bands)
    for by in (y + 6, y + h - 12):
        hline(d, x + 4, by, w - 8, dk)
        for dx in range(x + 6, x + w - 6, 4):
            d.point((dx, by + 1), fill=hi)
    # flared mouth lip
    fill(d, x, y + h - 8, w, 4, mid)
    hline(d, x, y + h - 8, w, hi)
    hline(d, x, y + h - 5, w, dk)
    frame(d, x, y + h - 8, w, 4, OUTLINE)


def _bicheon(d, x: int, y: int, hi, dk) -> None:
    """비천상 (apsara) relief motif in 2 tones — internal to bell_beom + bicheonsang."""
    # flowing figure: raised highlights catch the light, recesses in dk
    d.line([x, y + 8, x + 4, y + 2], fill=hi)            # raised arm / ribbon up
    d.line([x + 4, y + 2, x + 9, y], fill=hi)
    d.point((x + 5, y + 3), fill=dk)                     # body recess
    d.ellipse([x + 4, y + 4, x + 8, y + 8], outline=dk)  # torso curl
    d.line([x + 6, y + 8, x + 10, y + 13], fill=hi)      # trailing scarf
    d.line([x + 2, y + 10, x + 7, y + 12], fill=dk)
    d.point((x + 6, y + 1), fill=dk)                     # head dot


def dangmok(d, x: int, y: int, w: int = 34) -> None:
    """Horizontal striker log (당목) on rope, at hand height. Consumer: jongnu."""
    wl, wm, wd = PAL["wood_light"][1], PAL["wood_light"][2], PAL["wood_dark"][2]
    # two suspending ropes from above
    for rx in (x + 4, x + w - 6):
        vline(d, rx, y - 14, 14, PAL["hanji"][3])
        vline(d, rx + 1, y - 14, 14, PAL["wood_dark"][1])
    # the log: a stout horizontal cylinder pointing at the bell (right end capped)
    fill(d, x, y, w, 7, wl)
    hline(d, x, y, w, PAL["wood_light"][0])
    hline(d, x, y + 6, w, wd)
    dither(d, x + 2, y + 3, w - 4, 3, wm, phase=0)       # grain
    d.ellipse([x + w - 5, y - 1, x + w + 3, y + 8], fill=wm, outline=OUTLINE)  # cap
    d.point((x + w, y + 2), fill=PAL["wood_light"][0])
    frame(d, x, y, w, 7, OUTLINE)
    # rope binding rings on the log
    for bx in (x + 6, x + w - 10):
        vline(d, bx, y, 7, PAL["hanji"][3])


# ── The gate, columns, beams (단청 architecture) ──────────────────────────────

def dancheong_band(d, x: int, y: int, w: int, horizontal: bool = True) -> None:
    """A single 단청 polychrome pattern band (dc_green/red/blue + white).

    Internal to dancheong_column/beam + cosmetic-frame-dancheong.
    """
    g, r, b, wt = PAL["dc_green"][2], PAL["dc_red"][1], PAL["dc_blue"][1], PAL["white"][0]
    seq = [g, wt, r, wt, b, wt]
    if horizontal:
        for i, dx in enumerate(range(x, x + w, 2)):
            fill(d, dx, y, 2, 3, seq[i % len(seq)])
        hline(d, x, y, w, PAL["dc_green"][3])
        hline(d, x, y + 2, w, PAL["dc_green"][3])
    else:
        for i, dy in enumerate(range(y, y + w, 2)):
            fill(d, x, dy, 3, 2, seq[i % len(seq)])


def dancheong_column(d, x: int, y: int, h: int, w: int = 16) -> None:
    """Red column (기둥) with 단청 pattern bands at top & bottom.

    Consumers: daeungjeon, jongnu, cosmetic-frame-dancheong.
    """
    base, sh, hi = PAL["dc_red"][1], PAL["dc_red"][2], PAL["dc_red"][0]
    fill(d, x, y, w, h, base)
    vline(d, x, y, h, hi)                                # lit left edge
    dither(d, x + w - 5, y, 5, h, sh, phase=0)          # shaded right
    vline(d, x + w - 1, y, h, PAL["dc_red"][3])
    # 단청 bands: a wide one near the top, a thinner one near the bottom
    fill(d, x, y + 3, w, 7, PAL["dc_green"][2])
    dancheong_band(d, x + 1, y + 4, w - 2, horizontal=True)
    hline(d, x, y + 10, w, PAL["dc_green"][3])
    fill(d, x, y + h - 9, w, 6, PAL["dc_green"][2])
    dancheong_band(d, x + 1, y + h - 8, w - 2, horizontal=True)
    frame(d, x, y, w, h, OUTLINE)


def dancheong_beam(d, x: int, y: int, w: int, h: int = 14) -> None:
    """Horizontal cross-beam (보) with a green 뇌록 ground + 단청 end caps.

    Consumers: daeungjeon, jongnu, cosmetic-frame-dancheong.
    """
    g, gd, gh = PAL["dc_green"][2], PAL["dc_green"][3], PAL["dc_green"][1]
    fill(d, x, y, w, h, g)
    hline(d, x, y, w, gh)                                # lit top
    dither(d, x, y + h - 4, w, 4, gd, phase=1)           # shaded underside
    hline(d, x, y + h - 1, w, gd)
    # painted 단청 cap motifs at both ends (머리초)
    for cx0 in (x + 2, x + w - 20):
        fill(d, cx0, y + 2, 18, h - 4, PAL["dc_red"][1])
        dancheong_band(d, cx0 + 1, y + 3, 16, horizontal=True)
        d.ellipse([cx0 + 6, y + 3, cx0 + 12, y + h - 4], outline=PAL["white"][0])
        d.point((cx0 + 9, y + h // 2), fill=PAL["dc_blue"][1])  # lotus eye
    frame(d, x, y, w, h, OUTLINE)


def iljumun(d, x: int, y: int, w: int, h: int) -> None:
    """One-pillar gate (일주문): 2 red columns + 단청 dintel + 청우사 plaque.

    The plaque hangul is drawn AS ART (no font). (x,y,w,h)=gate footprint.
    Consumers: cinematic-intro, cinematic-outro (as proscenium).
    """
    col_w = 16
    # the two columns
    dancheong_column(d, x, y + 14, h - 14, col_w)
    dancheong_column(d, x + w - col_w, y + 14, h - 14, col_w)
    # the lintel beam spanning them, with 단청
    dancheong_beam(d, x - 4, y, w + 8, 16)
    # roof eave hint above the beam (giwa tile line, gray)
    fill(d, x - 8, y - 6, w + 16, 6, PAL["stone"][1])
    hline(d, x - 8, y - 6, w + 16, PAL["stone"][0])
    hline(d, x - 8, y - 1, w + 16, OUTLINE)
    for tx in range(x - 6, x + w + 8, 6):
        vline(d, tx, y - 5, 4, PAL["stone"][2])
    # hanging 청우사 plaque (decorative hangul drawn as 3 glyph blocks)
    pw, ph = 46, 16
    px = x + (w - pw) // 2
    py = y + 18
    fill(d, px, py, pw, ph, PAL["wood_dark"][1])
    frame(d, px, py, pw, ph, OUTLINE)
    fill(d, px + 1, py + 1, pw - 2, 2, PAL["wood_light"][2])
    _plaque_cheongwusa(d, px + 3, py + 4, PAL["white"][0])


def _plaque_cheongwusa(d, x: int, y: int, c) -> None:
    """청우사 as 3 hand-drawn hangul glyph blocks (art, not a font). Internal."""
    # 청 — ㅊ + ㅓ + ㅇ suggested
    fill(d, x, y, 4, 1, c); vline(d, x + 1, y + 1, 6, c); hline(d, x, y + 3, 4, c)
    vline(d, x + 4, y + 1, 7, c); d.point((x + 5, y + 4), fill=c)
    # 우 — ㅜ + ㅇ
    x2 = x + 14
    hline(d, x2, y + 1, 5, c); vline(d, x2 + 2, y + 1, 3, c)
    d.ellipse([x2, y + 4, x2 + 4, y + 7], outline=c)
    # 사 — ㅅ + ㅏ
    x3 = x + 28
    d.line([x3 + 1, y + 6, x3 - 1, y], fill=c); d.line([x3 + 1, y, x3 + 3, y + 6], fill=c)
    vline(d, x3 + 6, y, 7, c); hline(d, x3 + 6, y + 3, 3, c)


# ── 매화 plum (branch + petals) ───────────────────────────────────────────────

def plum_branch(d, x: int, y: int, w: int, h: int, seed: int = 49) -> None:
    """매화: dark crooked branch + white-pink blossoms. (x,y)=root of the branch.

    Consumers: cinematic-intro (courtyard tree). Pair with petals() for drift.
    """
    r = random.Random(seed)
    bk, bk_d = PAL["ink"][1], PAL["ink"][2]
    # main bough curving up-right (2px thick so it reads as a bough), then forks
    pts = [(x, y), (x + w // 3, y - h // 3), (x + w // 2 + 2, y - h * 2 // 3),
           (x + w - 4, y - h + 4)]
    for a, b in zip(pts, pts[1:]):
        d.line([a[0], a[1], b[0], b[1]], fill=bk)
        d.line([a[0] + 1, a[1], b[0] + 1, b[1]], fill=bk_d)
        d.line([a[0], a[1] + 1, b[0], b[1] + 1], fill=bk_d)
    # forks (thin twigs off the bough)
    forks = [(pts[1], (x + w // 2, y - h // 2)),
             (pts[2], (x + w // 4, y - h + 6)),
             (pts[2], (x + w - 2, y - h // 2)),
             (pts[3], (x + w - 6, y - h + 10))]
    for a, b in forks:
        d.line([a[0], a[1], b[0], b[1]], fill=bk)
    # blossoms hugging the fork tips (tight ±3 jitter so they cling to the wood,
    # not a scattered starfield); each twig end carries a small cluster.
    spots = [pts[2], pts[3], (x + w // 2, y - h // 2),
             (x + w // 4, y - h + 6), (x + w - 2, y - h // 2),
             (x + w // 3, y - h // 2 - 3), (x + w - 6, y - h + 10),
             (x + w // 2 + 3, y - h + 8)]
    for (bx, by) in spots:
        for _ in range(r.randint(2, 4)):
            ox, oy = r.randint(-3, 3), r.randint(-3, 3)
            _blossom(d, bx + ox, by + oy)
        d.point((bx, by + 2), fill=PAL["plum"][3])      # a bud at the tip


def _blossom(d, cx: int, cy: int) -> None:
    """One 매화 blossom: 5 round pale petals + a warm center. Internal to plum_branch.

    A 3px-wide flower (petal ring + center) reads as a blossom at 1x, where a
    single pixel would just look like noise.
    """
    pet, pet_e, ctr = PAL["plum"][0], PAL["plum"][2], PAL["gold_light"][1]
    # 5-petal ring around the center
    for dx, dy in ((0, -1), (1, -1), (1, 0), (1, 1), (0, 1),
                   (-1, 1), (-1, 0), (-1, -1)):
        d.point((cx + dx, cy + dy), fill=pet)
    d.point((cx + 1, cy - 1), fill=pet_e)               # blush on 2 petals
    d.point((cx - 1, cy + 1), fill=pet_e)
    d.point((cx, cy), fill=ctr)                         # warm stamen center


def petals(d, x: int, y: int, w: int, h: int, n: int = 14, seed: int = 7) -> None:
    """Scatter 매화 petals on a region (e.g. wet stone). Deterministic.

    Each petal is a 2px curved fleck with a faint edge so it reads on both light
    and dark grounds. Consumers: cinematic-intro (drifting), cinematic-outro.
    """
    r = random.Random(seed)
    for _ in range(n):
        px, py = r.randint(x, x + w - 2), r.randint(y, y + h - 1)
        c = PAL["plum"][0] if r.random() < 0.55 else PAL["plum"][1]
        d.point((px, py), fill=c)
        d.point((px + 1, py), fill=PAL["plum"][2])       # 2px body w/ shaded edge
        if r.random() < 0.4 and py + 1 < y + h:
            d.point((px, py + 1), fill=PAL["plum"][1])   # a few curl downward


# ── 다실 props: brazier, cups, guestbook ─────────────────────────────────────

def brazier_hwaro(d, x: int, y: int, w: int = 30, h: int = 22) -> None:
    """화로 brazier with ember glow — the warm key light of the 다실.

    (x,y)=top-left of the bowl. Consumer: room-01-dasil.
    """
    body, rim, sh = PAL["stone"][1], PAL["stone"][0], PAL["stone"][2]
    cx = x + w // 2
    drop_shadow(d, x, y + h - 1, w, 2)
    # round-bellied bowl on a low foot
    d.ellipse([x, y + 4, x + w, y + h], fill=body, outline=OUTLINE)
    dither(d, x + w - 9, y + 9, 8, h - 11, sh, phase=0)
    fill(d, cx - 7, y + h - 2, 14, 4, sh)               # foot
    frame(d, cx - 7, y + h - 2, 14, 4, OUTLINE)
    # mouth rim
    d.ellipse([x + 1, y, x + w - 1, y + 9], fill=sh, outline=OUTLINE)
    d.ellipse([x + 3, y + 1, x + w - 3, y + 7], fill=PAL["ink"][2])  # ash bed
    # ember glow rising from the coals (the key light)
    glow(d, cx, y + 3, 9, [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][0]])
    for ex in range(x + 6, x + w - 5, 4):               # individual coals
        d.point((ex, y + 3), fill=PAL["ember"][0])
        d.point((ex + 1, y + 4), fill=PAL["ember"][1])
    d.point((cx, y + 2), fill=PAL["gold_light"][0])
    d.ellipse([x + 1, y, x + w - 1, y + 9], outline=rim)


def tea_cup(d, x: int, y: int, steam: bool = False) -> None:
    """White/celadon cup ~10×8; with steam=True adds a 1px steam wisp.

    Consumers: room-01-dasil (two cups), obj-second-cup.
    """
    body, hi, sh = PAL["white"][0], PAL["hanji"][0], PAL["stone"][1]
    # cup body (truncated celadon bowl), tapering down to a small foot
    d.ellipse([x, y, x + 10, y + 3], fill=body, outline=OUTLINE)   # rim ellipse
    d.polygon([(x + 1, y + 1), (x + 9, y + 1), (x + 8, y + 7),
               (x + 2, y + 7)], fill=body)               # tapered wall
    dither(d, x + 6, y + 2, 3, 5, PAL["green"][0], phase=0)        # faint celadon
    hline(d, x + 2, y + 1, 6, hi)                        # rim sheen
    d.line([x, y + 1, x + 2, y + 7], fill=OUTLINE)
    d.line([x + 10, y + 1, x + 8, y + 7], fill=OUTLINE)
    # small foot ring + a narrow saucer (narrower than the cup so it reads cup)
    fill(d, x + 3, y + 7, 4, 1, sh)
    d.ellipse([x + 1, y + 8, x + 9, y + 10], fill=sh, outline=OUTLINE)
    if steam:
        amp = (0, 1, 0, -1)
        for k in range(6):
            d.point((x + 5 + amp[k % 4], y - 1 - k), fill=PAL["white"][1])


def guestbook(d, x: int, y: int, signed: bool = False, closed: bool = False) -> None:
    """방명록 on a low stand. signed=True adds a fresh wet signature.

    closed=False (default) → the OPEN book (two pages tenting from a center spine):
    the state the CLOSE-UPS read (obj-guestbook/-signed + their 1× swatches).
    closed=True → a SHUT bound ledger on the SAME 40px stand, with the SAME
    footprint and visual centre ≈ (x+20, y+11): the state the dossier §6 asks the
    다실 SCENE to show (mirrors diary_book(open=False)'s scene-closed / close-up-open
    split). The closed branch reuses the diary_book closed vocabulary (wood_dark
    cover ramp, hanji page-block fore-edge, an ember cloth tie) so it reads as the
    same ledger, just shut.

    Consumers: room-01-dasil (closed=True), obj-guestbook(+signed) (open).
    """
    pg, pg_sh, pg_e = PAL["hanji"][0], PAL["hanji"][1], PAL["hanji"][2]
    # low wooden stand (identical in both states — the hotspot rides on this)
    fill(d, x, y + 14, 40, 5, PAL["wood_dark"][1])
    hline(d, x, y + 14, 40, PAL["wood_light"][1])
    frame(d, x, y + 14, 40, 5, OUTLINE)
    drop_shadow(d, x, y + 19, 40, 2)
    if closed:
        # CLOSED bound ledger resting on the stand: a thick hanji page-block bound
        # in a dark cloth/board cover, a fore-edge of stacked pages, a cloth tie
        # band — the diary_book(open=False) vocabulary, sized to the guestbook
        # footprint. Centred so the body spans ≈ x+4..x+36, y+2..y+13 (visual
        # centre ≈ (x+20, y+11), same as the open book's centre on this stand).
        cov, cov_hi, cov_sh = (PAL["wood_dark"][2], PAL["wood_dark"][1],
                               PAL["wood_dark"][3])
        tie = PAL["ember"][3]                            # persimmon cloth tie
        bx, bw, bh = x + 4, 32, 11                       # cover block on the stand
        by = y + 3
        # the bound cover (dark board), sitting flat on the stand lip
        fill(d, bx, by, bw, bh, cov)
        hline(d, bx, by, bw, cov_hi)                     # lit top board edge
        # the fore-edge: a sliver of stacked page edges along the right side
        fill(d, bx + bw - 4, by + 1, 4, bh - 2, pg_sh)
        for py in range(by + 2, by + bh - 1, 2):
            hline(d, bx + bw - 4, py, 4, pg_e)           # page-edge striations
        d.point((bx + bw - 4, by + 1), fill=pg)          # a top page catches light
        # a shaded recess down the bound spine side (left), so it reads bound
        vline(d, bx, by + 1, bh - 1, cov_sh)
        dither(d, bx + 2, by + bh - 4, bw - 6, 3, cov_sh, phase=0)  # cover shade
        frame(d, bx, by, bw, bh, OUTLINE)
        # the cloth tie band wrapping the closed book (the shut-ledger read)
        fill(d, bx + 12, by - 1, 4, bh + 2, tie)
        vline(d, bx + 12, by - 1, bh + 2, PAL["ember"][2])
        d.point((bx + 11, by + bh), fill=tie)            # tie knot tails
        d.point((bx + 16, by + bh + 1), fill=tie)
        if signed:
            # a fresh wet ink dot on the closed cover's tied edge (rare in-scene
            # use; keeps the param honoured without reopening the book)
            d.point((bx + 18, by + 4), fill=PAL["ink"][2])
        return
    # open book: two pages tenting up from a center spine
    d.polygon([(x + 2, y + 14), (x + 20, y + 11), (x + 20, y + 2),
               (x + 3, y + 5)], fill=pg, outline=OUTLINE)
    d.polygon([(x + 20, y + 11), (x + 38, y + 14), (x + 37, y + 5),
               (x + 20, y + 2)], fill=pg_sh, outline=OUTLINE)
    vline(d, x + 20, y + 2, 9, PAL["wood_dark"][2])      # spine
    # ruled column of faint names (illegible ink ticks) on the left page
    for i, ly in enumerate(range(y + 5, y + 12, 2)):
        ln = 9 - i
        c = PAL["ink"][0] if i < 2 else pg_e             # older names faded
        hline(d, x + 4, ly, ln, c)
    if signed:
        # your fresh name: a darker, slightly crooked stroke on the right page
        d.line([x + 24, y + 6, x + 30, y + 5], fill=PAL["ink"][2])
        d.line([x + 30, y + 5, x + 33, y + 8], fill=PAL["ink"][2])
        d.point((x + 27, y + 8), fill=PAL["ink"][1])     # wet glisten


# ── 대웅전 props: moktak, portrait ───────────────────────────────────────────

def moktak(d, x: int, y: int) -> None:
    """목탁 wooden-fish percussion on a cushion ~22×18. Consumer: daeungjeon."""
    wl, wm, wd = PAL["wood_light"][1], PAL["wood_light"][2], PAL["wood_dark"][2]
    # cushion (방석) under it — muted stone-gray with a darker piping
    d.ellipse([x, y + 11, x + 22, y + 18], fill=PAL["stone"][1], outline=OUTLINE)
    d.ellipse([x + 2, y + 12, x + 20, y + 16], outline=PAL["stone"][2])
    drop_shadow(d, x + 2, y + 18, 18, 1)
    # the rounded wooden fish: a fat ball with a deep slit mouth + two eye spirals
    cx = x + 11
    d.ellipse([x + 2, y, x + 20, y + 13], fill=wl, outline=OUTLINE)
    dither(d, x + 13, y + 4, 6, 7, wm, phase=0)          # right-side shade
    hline(d, x + 6, y + 2, 9, PAL["wood_light"][0])      # top sheen
    # the deep carved mouth slit (입) — a dark wedge across the lower front, the
    # single most recognizable moktak feature, so make it read at 1x
    d.polygon([(x + 4, y + 8), (x + 18, y + 8), (x + 16, y + 11),
               (x + 6, y + 11)], fill=PAL["ink"][2])
    hline(d, x + 5, y + 9, 12, OUTLINE)
    d.point((x + 4, y + 9), fill=wm)                     # lip catches light
    d.point((x + 18, y + 9), fill=wm)
    # two carved eye spirals flanking the top (the 'fish' read)
    for ex in (x + 6, x + 13):
        d.ellipse([ex, y + 3, ex + 4, y + 7], fill=wm, outline=wd)
        d.point((ex + 2, y + 5), fill=wd)               # spiral center
    # the rounded handle knob on top
    fill(d, cx - 1, y - 2, 3, 3, wm)
    d.point((cx, y - 3), fill=wl)
    frame(d, cx - 2, y - 3, 5, 4, OUTLINE)


def portrait_yeongjeong(d, x: int, y: int, w: int = 30, h: int = 36) -> None:
    """영정: framed master portrait — a smiling elderly monk (give a face hint).

    Avoids the L1 "looks like bottles" pitfall: real face + bald head + smile.
    Consumer: daeungjeon.
    """
    fr, fr_hi = PAL["wood_dark"][2], PAL["wood_dark"][1]
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    # mourning frame with a black ribbon corner
    fill(d, x, y, w, h, fr)
    hline(d, x, y, w, fr_hi)
    frame(d, x, y, w, h, OUTLINE)
    inx, iny, inw, inh = x + 3, y + 3, w - 6, h - 6
    fill(d, inx, iny, inw, inh, PAL["hanji"][1])         # photo ground
    frame(d, inx, iny, inw, inh, PAL["wood_dark"][3])
    cx = inx + inw // 2
    # robe shoulders (gray) at the bottom of the photo
    fill(d, inx + 1, iny + inh - 8, inw - 2, 8, PAL["rain"][2])
    hline(d, cx - 6, iny + inh - 8, 12, PAL["ember"][3])  # kasaya sliver (identity)
    # bald elderly head
    hd = 11
    d.ellipse([cx - hd // 2, iny + 4, cx + hd // 2, iny + 4 + hd],
              fill=skin, outline=OUTLINE)
    dither(d, cx + 1, iny + 7, 3, 6, skin_sh, phase=0)   # cheek shade
    # face hint: kind closed eyes (crow's feet), a clear smile, ear
    ey = iny + 9
    d.line([cx - 4, ey, cx - 2, ey + 1], fill=OUTLINE)   # left smiling eye
    d.line([cx + 2, ey, cx + 4, ey + 1], fill=OUTLINE)   # right smiling eye
    d.point((cx - 5, ey - 1), fill=skin_sh)              # crow's feet
    d.point((cx + 5, ey - 1), fill=skin_sh)
    d.line([cx - 2, ey + 4, cx + 2, ey + 4], fill=PAL["wood_dark"][2])  # smile
    d.point((cx - 3, ey + 3), fill=PAL["wood_dark"][2])  # upturned corners
    d.point((cx + 3, ey + 3), fill=PAL["wood_dark"][2])
    d.point((cx - hd // 2, ey + 1), fill=skin_sh)        # ear


# ── 스승의 방 props: diary, gomusin, calligraphy ─────────────────────────────

def diary_book(d, x: int, y: int, open: bool = False) -> None:
    """Bound diary with a cloth tie; closed (scene) or open (close-ups).

    Consumers: room-03-seungbang (closed), obj-diary-page, obj-diary-last (open).
    """
    cov, cov_hi, cov_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    tie = PAL["ember"][3]                                # persimmon cloth tie
    if not open:
        # closed: a thick hanji-block bound in dark cloth, tie across the middle
        fill(d, x, y, 30, 22, cov)
        hline(d, x, y, 30, cov_hi)
        fill(d, x + 27, y + 1, 3, 20, PAL["hanji"][2])  # page block (fore-edge)
        for py in range(y + 2, y + 21, 2):
            hline(d, x + 27, py, 3, PAL["hanji"][3])
        frame(d, x, y, 30, 22, OUTLINE)
        fill(d, x + 12, y - 1, 4, 24, tie)              # cloth tie band
        vline(d, x + 12, y - 1, 24, PAL["ember"][2])
        d.point((x + 11, y + 22), fill=tie)             # tie knot
        d.point((x + 16, y + 23), fill=tie)
        drop_shadow(d, x, y + 22, 30, 2)
    else:
        # open: two pages tenting from a spine, ruled with ink lines
        d.polygon([(x, y + 4), (x + 22, y), (x + 22, y + 22), (x, y + 26)],
                  fill=PAL["hanji"][0], outline=OUTLINE)
        d.polygon([(x + 22, y), (x + 44, y + 4), (x + 44, y + 26),
                   (x + 22, y + 22)], fill=PAL["hanji"][1], outline=OUTLINE)
        vline(d, x + 22, y, 22, cov_sh)                 # spine
        # cover edge peeking at the outer margins
        d.line([x, y + 4, x, y + 26], fill=cov)
        d.line([x + 44, y + 4, x + 44, y + 26], fill=cov)


def hanja_cheongwu(d, x: int, y: int, c=None) -> None:
    """The 淸雨 two-hanja seal, hand-drawn as a pixel glyph (NOT a font).

    CRITICAL: identical pixel form wherever called, so obj-diary-last and
    obj-beam-inscription show a byte-identical signature (verification §12.7).
    (x,y) = top-left of a 20×11 two-glyph block. Consumers: obj-diary-last,
    obj-beam-inscription.
    """
    if c is None:
        c = PAL["ink"][2]
    # 淸 (left, x..x+8): water radical (氵) + 青 suggested in a tight 9×11 block
    vline(d, x, y + 1, 2, c); vline(d, x + 1, y + 4, 2, c); vline(d, x, y + 7, 2, c)  # 氵
    hline(d, x + 4, y, 5, c)                              # 青 top
    vline(d, x + 5, y, 5, c); vline(d, x + 7, y, 5, c)
    hline(d, x + 4, y + 2, 5, c); hline(d, x + 4, y + 4, 5, c)
    fill(d, x + 4, y + 6, 5, 1, c)                        # 月 box top
    vline(d, x + 4, y + 6, 5, c); vline(d, x + 8, y + 6, 5, c)
    hline(d, x + 4, y + 8, 5, c); hline(d, x + 4, y + 10, 5, c)
    # 雨 (right, x+11..x+19): rain radical — roof, frame, four drops
    x2 = x + 11
    hline(d, x2, y, 8, c)                                 # roof line
    vline(d, x2 + 3, y + 1, 9, c)                         # center stem
    hline(d, x2 + 1, y + 3, 7, c)                         # box top
    vline(d, x2, y + 3, 7, c); vline(d, x2 + 6, y + 3, 7, c)  # box sides
    hline(d, x2 + 1, y + 9, 6, c)                         # box bottom
    d.point((x2 + 1, y + 5), fill=c); d.point((x2 + 5, y + 5), fill=c)  # drops
    d.point((x2 + 1, y + 7), fill=c); d.point((x2 + 5, y + 7), fill=c)


def gomusin(d, x: int, y: int) -> None:
    """Pair of white rubber shoes (고무신), upturned kkokji toe; 2 clear shapes.

    Reads as two bright shapes on dark wood. Consumers: room-03-seungbang
    threshold, cinematic-outro (intact).
    """
    body, hi, sh = PAL["white"][0], PAL["white"][1], PAL["white"][2]
    for sx in (x, x + 13):
        drop_shadow(d, sx, y + 8, 11, 1, cool=True)
        # sole: a low boat shape; the kkokji (toe) curls up at the front
        d.polygon([(sx, y + 7), (sx + 10, y + 7), (sx + 11, y + 3),
                   (sx + 9, y + 1), (sx + 2, y + 1), (sx, y + 4)],
                  fill=body, outline=OUTLINE)
        hline(d, sx + 2, y + 2, 7, hi)                   # top sheen
        d.point((sx + 11, y + 1), fill=body)             # upturned toe tip
        d.point((sx + 11, y), fill=OUTLINE)
        dither(d, sx + 1, y + 5, 9, 2, sh, phase=0)      # inner shadow (the opening)
        hline(d, sx + 1, y + 7, 9, OUTLINE)              # ground line


def paper_umbrella(d, x: int, y: int, open: bool = True) -> None:
    """기름종이 우산 (master's oiled-paper umbrella), warm ochre canopy + ribs.

    Consumers: cinematic-outro, cosmetic-set-complete, cosmetic-avatar-templecat.
    """
    paper, paper_e, rib = PAL["hanji"][1], PAL["hanji"][2], PAL["wood_dark"][2]
    cx = x + 16
    if open:
        # canopy: a shallow scalloped dome, oiled-ochre, radial ribs
        d.pieslice([x, y, x + 32, y + 26], 180, 360, fill=paper, outline=OUTLINE)
        for i in range(1, 6):                            # ribs
            rx = x + i * 32 // 6
            d.line([cx, y + 13, rx, y + 1], fill=paper_e)
        for i in range(0, 7):                            # scalloped hem
            hx = x + i * 32 // 6
            d.point((hx, y + 13), fill=OUTLINE)
        hline(d, x, y + 13, 32, OUTLINE)
        dither(d, cx, y + 3, 14, 8, paper_e, phase=0)    # right-side shade
        vline(d, cx, y - 2, 3, rib)                      # top ferrule
        # shaft + curved bamboo handle
        vline(d, cx, y + 13, 16, rib)
        d.line([cx, y + 29, cx + 4, y + 31], fill=rib)
    else:
        # furled: a slim vertical bundle (the one in the outro hand-off, closed)
        fill(d, cx - 2, y, 4, 26, paper)
        vline(d, cx - 2, y, 26, paper_e)
        vline(d, cx + 1, y, 26, rib)
        frame(d, cx - 2, y, 4, 26, OUTLINE)
        d.line([cx, y + 26, cx + 3, y + 28], fill=rib)   # handle


def broken_umbrella(d, x: int, y: int) -> None:
    """Transparent convenience-store umbrella, canopy caved-in, ribs poking out.

    The clear plastic reads as a faint dithered film; the silhouette is a normal
    dome with ONE side collapsed and a snapped rib jutting past the edge.
    Consumer: cinematic-intro foreground.
    """
    rib, rib_d = PAL["metal"][2], PAL["metal"][3]
    cx = x + 13
    # the intact left half of the dome (a clean pieslice arc)
    d.pieslice([x, y, x + 18, y + 16], 180, 270, outline=rib, fill=None)
    d.line([cx, y + 8, x, y + 8], fill=rib)              # left spar
    d.line([cx, y + 8, x + 4, y + 1], fill=rib)          # upper-left spar
    # the COLLAPSED right half: spars folded downward at a broken angle
    d.line([cx, y + 8, x + 20, y + 13], fill=rib_d)      # caved spar 1
    d.line([cx, y + 8, x + 24, y + 9], fill=rib_d)       # caved spar 2
    d.line([x + 24, y + 9, x + 28, y + 4], fill=rib_d)   # SNAPPED rib kinking up+out
    d.point((x + 28, y + 3), fill=OUTLINE)               # broken rib tip
    # torn translucent plastic film stretched on the intact half only (sparse
    # dither so it reads as wet clear plastic, not a mesh)
    for yy in range(y + 2, y + 9):
        for xx in range(x + 2 + (yy % 2) * 2, cx, 4):
            d.point((xx, yy), fill=PAL["metal"][0])
    # a flapping torn shred hanging off the collapsed side
    d.line([x + 20, y + 13, x + 22, y + 17], fill=PAL["metal"][1])
    d.point((x + 21, y + 18), fill=PAL["metal"][0])
    # the central ferrule (bent) + bare shaft + hook handle
    d.point((cx, y + 3), fill=rib_d)                     # ferrule
    vline(d, cx, y + 8, 20, rib)
    vline(d, cx + 1, y + 14, 14, rib_d)                  # shaft shading
    d.line([cx, y + 28, cx - 4, y + 28], fill=rib)       # J-hook handle
    d.arc([cx - 4, y + 24, cx, y + 28], 90, 180, fill=rib)


# ── Cosmetic-only motifs ─────────────────────────────────────────────────────

def bicheonsang(d, x: int, y: int, w: int = 28, h: int = 28) -> None:
    """비천상 apsara relief motif on a bronze field. Consumer: cosmetic-set-complete.

    A larger, framed version of the bell's relief — the corner medallion of the
    legendary bronze frame.
    """
    lo, hi, dk = PAL["bronze"][1], PAL["bronze"][0], PAL["bronze"][3]
    fill(d, x, y, w, h, lo)
    dither(d, x, y, w, h, PAL["bronze"][2], phase=0)     # hammered bronze ground
    frame(d, x, y, w, h, OUTLINE)
    # the flying apsara, enlarged, 2-tone relief
    cx, cy = x + w // 2, y + h // 2
    _bicheon(d, cx - 5, cy - 6, hi, dk)
    _bicheon(d, cx + 1, cy - 1, hi, dk)                  # trailing scarf echo
    # floating lotus + ribbon flourishes around it
    for (ox, oy) in ((-9, 6), (9, -7), (8, 8)):
        d.point((cx + ox, cy + oy), fill=hi)
        d.point((cx + ox, cy + oy + 1), fill=dk)
    d.ellipse([x + 2, y + 2, x + 5, y + 5], outline=hi)  # corner stud
    d.ellipse([x + w - 5, y + 2, x + w - 2, y + 5], outline=hi)


def samul_medallion(d, x: int, y: int, kind: str = "bell") -> None:
    """16×16 medallion of the 사물: bell / drum / fish / cloud-plate.

    Consumer: cosmetic-frame-dancheong corners. (x,y)=top-left of the 16×16 tile.
    """
    br, br_hi, br_dk = PAL["bronze"][1], PAL["bronze"][0], PAL["bronze"][3]
    # common medallion disc (dark green 단청 ground + bronze rim)
    d.ellipse([x, y, x + 15, y + 15], fill=PAL["dc_green"][3], outline=OUTLINE)
    d.ellipse([x + 1, y + 1, x + 14, y + 14], outline=br)
    cx, cy = x + 8, y + 8
    if kind == "bell":                                   # 범종
        d.polygon([(cx - 3, cy - 4), (cx + 3, cy - 4), (cx + 4, cy + 4),
                   (cx - 4, cy + 4)], fill=br, outline=br_dk)
        vline(d, cx, cy - 6, 2, br_hi)
        hline(d, cx - 4, cy + 4, 9, br_dk)
    elif kind == "drum":                                 # 법고
        d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=PAL["dc_red"][1], outline=br_dk)
        vline(d, cx, cy - 4, 9, br_hi)                   # body band
        d.point((cx - 2, cy - 1), fill=PAL["white"][0])  # tack
        d.point((cx + 2, cy - 1), fill=PAL["white"][0])
    elif kind == "fish":                                 # 목어 (wooden fish, elongated)
        d.ellipse([cx - 5, cy - 2, cx + 5, cy + 3], fill=br, outline=br_dk)
        d.polygon([(cx + 5, cy), (cx + 7, cy - 2), (cx + 7, cy + 3)], fill=br)  # tail
        d.point((cx - 3, cy), fill=br_dk)                # eye
        hline(d, cx - 3, cy + 1, 6, br_dk)               # mouth slit
    else:                                                # 운판 cloud-plate
        d.polygon([(cx - 5, cy), (cx - 2, cy - 4), (cx + 2, cy - 4),
                   (cx + 5, cy), (cx + 2, cy + 4), (cx - 2, cy + 4)],
                  fill=br, outline=br_dk)
        d.point((cx, cy), fill=PAL["dc_blue"][2])        # cloud swirl hint
        d.arc([cx - 3, cy - 2, cx + 3, cy + 2], 0, 180, fill=br_dk)
