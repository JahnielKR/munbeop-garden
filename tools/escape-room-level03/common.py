#!/usr/bin/env python3
"""Shared palette + drawing helpers for the Level 3 escape-room art pipeline.

Every gen_*.py script in this folder imports from here so the 22 assets share
ONE warm-neon/cold-asphalt palette ("El mercado nocturno / 달빛시장", per
docs/escape-room-level-03.md §6/§10) and ONE outline color. This mirrors the
level-1/2 `common.py` structure verbatim where possible: the generic helpers
(rgb, new_canvas, save_asset, save_out, preview, hotspot_debug, fill, frame,
hline, vline, dither, wood_planks, glow, drop_shadow) are ported byte-for-byte
from level-02 (only retargeting save_asset to level-03), and the warm wood /
ember / gold_light / white / ink / stone / metal ramps are reused VERBATIM
because the market stalls are the same hanok-wood + bare-bulb amber. ADDED here
are the 6 night-market ramps (asphalt, neon_*, tteok, steam) and the shared
sprite/element builders of the market.

Philosophical inversion vs L2: where L2 HID (deniability, a secret second
shadow), L3 OVERFLOWS — what you see is what happens, in full neon light.
- L3-a: NO legible Korean in scene. neon_sign() is SUGGESTED hangul strokes
  (glow, never a decipherable glyph at 1x).
- L3-b: the final image HIDES NOTHING — no second shadow, no easter egg.
- L3-c: the diegetic clock = shutters lowering + neon signs going dark; the
  griddle (griddle_hotteok) NEVER goes out.
- L3-d: the griddle is the KEY LIGHT — warmest, highest-contrast element.
- L3-e: 100% mundane — no mystic glow, no shadow without a source.

Final PNGs land under `munbeop/public/escape-room/level-03/`; previews, debug
renders and contact sheets under `tools/escape-room-level03/out/` (review only).

This module is the shared library so it intentionally exceeds 400 lines, but
every builder stays readable and carries a one-line docstring naming its
consumers (see STYLE.md "Shared builders API" for the canonical table).
Deterministic only: any scatter uses an explicit random.Random(seed).

FROZEN after the foundation phase: downstream scene agents must NOT modify it
(only report bugs).
"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
LEVEL_DIR = REPO / "munbeop" / "public" / "escape-room" / "level-03"
OUT_DIR = HERE / "out"


def rgb(hex_str: str, a: int = 255) -> tuple[int, int, int, int]:
    """Hex -> RGBA tuple. Shared by every color constant below."""
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


# Soft black shared by every sprite outline — never use #000000 (same as L1/L2).
OUTLINE = rgb("#2a1c14")

# Two contact-shadow tints (the night market has a warm griddle + cold street):
SHADOW_WARM = rgb("#5e4226", 90)   # under griddle/stall props, oil-amber warmth
SHADOW_COOL = rgb("#262642", 90)   # asphalt/street/exterior contact shadow, blue


# ── Palette (light → dark inside each ramp) ──────────────────────────────────
# Cold wet neon outside, warm griddle-amber inside. Warm neutrals (wood/white/
# ember/gold/ink/stone/metal) are reused VERBATIM from level 1/2 — the stalls
# are the same hanok wood + bare-bulb amber. NEW: the night-market ramps.

PAL = {
    # warm neutrals reused VERBATIM from level 1/2 (stall structure + amber)
    "wood_light": [rgb(c) for c in ("#eccf9c", "#dab177", "#bd9258", "#9a6f3f")],
    "wood_dark": [rgb(c) for c in ("#a87c4e", "#83603a", "#624627", "#46311b")],
    "ember": [rgb(c) for c in ("#ffe6b0", "#ffba6e", "#f2904a", "#c75f33")],
    "gold_light": [rgb(c) for c in ("#fdeebe", "#f7d488", "#e8b45e")],
    "white": [rgb(c) for c in ("#f6efe2", "#e7ddca", "#cdbfa3")],
    "ink": [rgb(c) for c in ("#6a584b", "#41342b", "#241c17")],
    "stone": [rgb(c) for c in ("#c3c2bb", "#9a988f", "#6f6d65", "#474640")],
    "metal": [rgb(c) for c in ("#dde2e7", "#b3bcc5", "#878f9a", "#5d646e")],
    # NEW — the night market (exact hexes from STYLE.md §"Paleta canónica")
    "asphalt": [rgb(c) for c in ("#3a3550", "#2a2640", "#1c1830", "#100e1c")],
    "neon_pink": [rgb(c) for c in ("#ffd0e8", "#ff77c2", "#e83f9e", "#a8246e")],
    "neon_cyan": [rgb(c) for c in ("#c8fbff", "#6fe9f5", "#2fc3d8", "#1d7f93")],
    "neon_green": [rgb(c) for c in ("#d8ffce", "#8ef58a", "#46d36b", "#2a8f4e")],
    "tteok": [rgb(c) for c in ("#ff7a4e", "#ef3f2a", "#b82a1a", "#7a1a10")],
    "steam": [rgb(c) for c in ("#f4ede0", "#ddd6c8", "#bcbcc0")],
}

# ── Documented derived shades (one step of an existing ramp, NO new hue) ──────
# the pink neon split + trembling in the wet asphalt: neon_pink[2] one step
# toward asphalt[1] (dulled, desaturated by the water).
NEON_REFLECT = rgb("#8a3268")       # neon_pink[2] one step toward asphalt[1]
# the darkest edge of the oil on the griddle: ember[3] one step darker.
AMBER_DEEP = rgb("#9a481f")         # ember[3] one step darker


# ── Canvas / IO (ported from level-2 common.py, save targets level-03) ───────


def new_canvas(w: int, h: int, bg: tuple | None = None):
    """RGBA canvas; bg=None keeps it fully transparent (sprites)."""
    img = Image.new("RGBA", (w, h), bg if bg else (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save_asset(img: Image.Image, *relparts: str) -> Path:
    """Save a FINAL asset under munbeop/public/escape-room/level-03/<relparts>."""
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


# ── Primitive drawing helpers (ported verbatim from level-1/2) ───────────────


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
    """Horizontal planks: base fill, seam lines, grain ticks. Stall counters/beams."""
    base, mid, dark = ramp[0], ramp[1], ramp[-1]
    fill(d, x, y, w, h, base)
    for row, yy in enumerate(range(y, y + h, plank_h)):
        hline(d, x, yy, w, dark)
        off = (row * 13) % max(w - 6, 1)
        if seam_every and row % seam_every == 0:
            vline(d, x + off, yy + 1, min(plank_h - 1, y + h - yy - 1), mid)
        for gx in range(x + (row * 7) % 11, x + w - 2, 23):
            hline(d, gx, yy + plank_h // 2, 3, mid)


def glow(d, cx: int, cy: int, r: int, ramp) -> None:
    """Dithered radial glow (bulb/ember). ramp light→dark, drawn dark-out."""
    for i, c in enumerate(reversed(ramp)):
        rr = int(r * (len(ramp) - i) / len(ramp))
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c)


def drop_shadow(d, x: int, y: int, w: int, h: int = 2, cool: bool = False) -> None:
    """Soft contact shadow under props (dithered). cool=True for street/asphalt."""
    op = (SHADOW_COOL if cool else SHADOW_WARM)[:3] + (255,)
    dither(d, x, y, w, h, op, phase=1)


# ═════════════════════════════════════════════════════════════════════════════
#  NEW shared element / sprite builders (the cross-asset consistency layer).
#  Each one is documented with its consumers; see STYLE.md for the full API.
# ═════════════════════════════════════════════════════════════════════════════


# ── Neon (the cold key of the alley) ─────────────────────────────────────────

def neon_sign(d, x: int, y: int, w: int = 28, h: int = 16, color: str = "pink",
              lit: bool = True) -> None:
    """SUGGESTED-hangul neon sign, glow strokes, 2 states. NEVER legible (L3-a).

    A box of 3-4 abstract stroke clusters that read as "a neon sign" but never
    spell a syllable at 1x — drawn as a bright core + a dithered halo of its
    ramp (glow by bands, not blur). lit=False = the diegetic clock going dark:
    a dead gray tube on asphalt (no halo). (x,y)=top-left of the sign cell.
    Consumers: backgrounds of all 4 zones, cinematics, cosmetic-bg-neonalley.
    """
    ramp = {"pink": PAL["neon_pink"], "cyan": PAL["neon_cyan"],
            "green": PAL["neon_green"]}[color]
    if not lit:
        # dead tube: a dark gray housing, no light at all (a halo less in the bg)
        tube = PAL["asphalt"][0]
        _neon_strokes(d, x, y, w, h, tube, tube, dead=True)
        return
    core, mid, halo = PAL["white"][0], ramp[0], ramp[1]
    # halo first (behind), dithered bands of the ramp so the sign "bleeds" light
    for pad, c in ((3, ramp[2]), (1, ramp[1])):
        dither(d, x - pad, y - pad, w + 2 * pad, h + 2 * pad, c, phase=pad % 2)
    _neon_strokes(d, x, y, w, h, mid, core)


def _neon_strokes(d, x, y, w, h, mid, core, dead: bool = False) -> None:
    """Abstract neon GLOW for neon_sign — reads as a lit sign, NEVER a glyph.

    A soft colored interior glow with a few SHORT, irregular, offset white-hot
    accent marks (some diagonal) — deliberately NOT a row of aligned vertical
    stems, so it never reads as digits/jamo at 1x (the old stem-per-block grid
    read as "111/ㅑㅑㅑ"). Seeded by (x,y) so neighbours differ. mid = the bright
    tube colour, core = white hot-points.
    """
    r = random.Random(x * 31 + y * 7 + w)
    if dead:
        for _ in range(3):                                 # faint dead ticks, no glow
            ax = x + 2 + r.randint(0, max(1, w - 4))
            ay = y + 2 + r.randint(0, max(1, h - 4))
            d.point((ax, ay), fill=mid)
        return
    # the lit colored panel: the sign glows as a soft block, not a glyph
    dither(d, x + 1, y + 1, w - 2, h - 2, mid, phase=0)
    # a few short irregular white-hot accents (never a full-height stem row)
    marks = 2 if w < 24 else 3
    for _ in range(marks):
        mx = x + 2 + r.randint(0, max(1, w - 5))
        my = y + 2 + r.randint(0, max(1, h - 5))
        kind = r.randint(0, 3)
        if kind == 0:                                      # short offset vertical (≤ half)
            ln = r.randint(2, max(2, (h - 4) // 2))
            vline(d, mx, my, min(ln, y + h - 2 - my), core)
        elif kind == 1:                                    # short horizontal
            ln = r.randint(2, max(2, (w - 4) // 2))
            hline(d, mx, my, min(ln, x + w - 2 - mx), core)
        elif kind == 2:                                    # a hot dot
            d.point((mx, my), fill=core)
        else:                                              # a short diagonal (breaks the grid)
            for k in range(3):
                if mx + k < x + w - 1 and my + k < y + h - 1:
                    d.point((mx + k, my + k), fill=core)


def neon_alley(d, x: int, y: int, w: int, h: int, lit_cols: int = 99,
               seed: int = 33) -> None:
    """A receding wall of repeated neon_sign tiles (the market in fuga, ilegible).

    Rows of small signs cycling pink/cyan/green, getting smaller/dimmer toward
    the top (depth). lit_cols caps how many remain lit (the diegetic clock: a
    halo less per resolved zone). Consumers: all 4 zone backgrounds, cinematics.
    """
    colors = ["pink", "cyan", "green"]
    r = random.Random(seed)
    lit_n = 0
    rows = h // 18
    for ri in range(rows):
        sy = y + ri * 18
        sw = 24 - ri * 2                                   # smaller as it recedes
        sh = 13 - ri
        step = sw + 8
        offset = (ri % 2) * (step // 2)
        for sx in range(x + offset, x + w - sw, step):
            c = colors[(sx // step + ri) % 3]
            lit = lit_n < lit_cols and r.random() > 0.18
            lit_n += 1
            neon_sign(d, sx, sy, max(sw, 12), max(sh, 8), color=c, lit=lit)


def wet_reflect(d, x: int, y: int, w: int, h: int, color: str = "pink",
                seed: int = 7) -> None:
    """Neon split + trembling in the foreground wet asphalt (NEON_REFLECT bands).

    A handful of WIDE vertical smears of the neon color, each one trembling
    side-to-side as it descends (the ripple) and fading dark toward the bottom —
    so it reads as a sign's light SMEARED down a wet street, not as static. The
    top of each smear is bright; horizontal ripple breaks split it into stacked
    dashes. Consumers: all 4 zones (lower foreground), cinematics.
    """
    bright = {"pink": PAL["neon_pink"][1], "cyan": PAL["neon_cyan"][1],
              "green": PAL["neon_green"][1]}[color]
    dull = {"pink": NEON_REFLECT, "cyan": PAL["neon_cyan"][3],
            "green": PAL["neon_green"][3]}[color]
    r = random.Random(seed * 17 + len(color))
    # place a few smears across the width; each is a 2-3px wide trembling column
    n = max(2, w // 16)
    starts = sorted(r.sample(range(x + 1, x + w - 3), min(n, max(1, w - 5))))
    for sx in starts:
        sw = r.randint(2, 3)
        col = sx
        for yy in range(y, y + h):
            t = (yy - y) / max(h - 1, 1)
            # the ripple: shift the whole smear left/right on a slow wobble
            if (yy - y) % 4 == 0:
                col += r.randint(-1, 1)
                col = max(x, min(x + w - sw, col))
            # horizontal ripple gaps: every few rows the reflection "breaks"
            if (yy - y + sx) % 5 == 2:
                continue
            # brighter at the source (top), dull NEON_REFLECT mid, asphalt-dark low
            if t < 0.30:
                c = bright
            elif t < 0.62:
                c = dull
            else:
                c = PAL["asphalt"][1]
            for k in range(sw):
                if x <= col + k < x + w:
                    d.point((col + k, yy), fill=c)
        # a bright glint at the very top where the source hits the still water
        d.point((sx, y), fill={"pink": PAL["neon_pink"][0], "cyan": PAL["neon_cyan"][0],
                               "green": PAL["neon_green"][0]}[color])


def steam(d, x: int, y: int, height: int = 14, phase: int = 0, warm: bool = True) -> None:
    """A single 1px column of curling steam (warm over griddle, cool over broth).

    Rises from (x,y) upward `height` px, curling on a fixed sine so it reads as
    a continuous wisp, NOT loose specks (the L1/L2 steam-as-motes failure). warm
    near the source fading to steam-gray as it cools. Thicker at the base = more
    legible. Consumers: hotteok/meokja stalls, griddles, cinematics.
    """
    amp = (0, 0, 1, 1, 0, -1, -1, 0)
    for k in range(height):
        yy = y - k
        ox = amp[(k + phase) % len(amp)]
        if warm:
            c = PAL["steam"][0] if k < 4 else (PAL["steam"][1] if k < 9 else PAL["steam"][2])
        else:
            c = PAL["white"][0] if k < 4 else (PAL["steam"][1] if k < 9 else PAL["steam"][2])
        d.point((x + ox, yy), fill=c)
        if k < 4:                                          # thicker, brighter base
            d.point((x + ox + 1, yy), fill=PAL["steam"][1] if warm else PAL["white"][1])


# ── The griddle (the KEY LIGHT, L3-d) ────────────────────────────────────────

def griddle_hotteok(d, x: int, y: int, w: int = 56, h: int = 30,
                    spatula: bool = True) -> None:
    """철판 griddle, 2 호떡 browning + a flat spatula — the warm KEY LIGHT (L3-d).

    A round dark cast-iron plate with a sheen of oil, two golden 호떡 with a
    bubbling sugar centre, an amber glow rising off it, warm steam wisps. The
    highest-contrast, warmest element of any scene it appears in; it NEVER goes
    dark (the diegetic clock spares it). (x,y)=top-left of the plate bbox.
    Consumers: room-01-hotteok(+closing), cinematic-outro, obj-hotteok.
    """
    cx = x + w // 2
    plate, plate_sh = PAL["ink"][1], PAL["ink"][2]
    oil, oil_lo = PAL["ember"][2], AMBER_DEEP
    drop_shadow(d, x + 2, y + h - 1, w - 4, 2)
    # the cast-iron plate: a low flat ellipse with an oil sheen
    d.ellipse([x, y + 4, x + w, y + h], fill=plate, outline=OUTLINE)
    dither(d, x + 6, y + 7, w - 12, h - 9, plate_sh, phase=0)
    # oil pooled hot at the centre, glowing (the key light source)
    d.ellipse([cx - 16, y + 9, cx + 16, y + h - 3], fill=oil_lo)
    d.ellipse([cx - 13, y + 11, cx + 13, y + h - 5], fill=oil)
    glow(d, cx, y + h // 2 + 2, 13, [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][0]])
    # two 호떡 browning, each a golden disc with a darker rim + sugar-burst centre
    for hx in (cx - 11, cx + 6):
        _hotteok_disc(d, hx, y + h // 2 - 2)
    # the flat spatula resting on the right lip, blade on the plate, handle out
    if spatula:
        bl, hd = PAL["metal"][1], PAL["wood_dark"][2]
        fill(d, x + w - 14, y + 6, 10, 4, bl)              # blade
        hline(d, x + w - 14, y + 6, 10, PAL["metal"][0])
        frame(d, x + w - 14, y + 6, 10, 4, OUTLINE)
        d.line([x + w - 5, y + 7, x + w + 4, y + 1], fill=hd)  # handle out to the right
        d.line([x + w - 5, y + 8, x + w + 3, y + 2], fill=PAL["wood_dark"][3])
    # warm steam off the plate (two wisps)
    steam(d, cx - 4, y + 6, height=13, phase=0, warm=True)
    steam(d, cx + 7, y + 7, height=11, phase=3, warm=True)


def _hotteok_disc(d, cx: int, cy: int, r: int = 7) -> None:
    """One browning 호떡: golden disc, dark rim, a bright bubbling sugar centre."""
    body, rim, hi = PAL["gold_light"][2], AMBER_DEEP, PAL["gold_light"][0]
    d.ellipse([cx - r, cy - r + 1, cx + r, cy + r - 1], fill=body, outline=OUTLINE)
    d.ellipse([cx - r + 1, cy - r + 2, cx + r - 1, cy + r - 2], outline=rim)
    dither(d, cx - r + 2, cy, r, r - 2, PAL["ember"][1], phase=0)  # browned underside
    # the molten-sugar burst at the centre (the recognizable detail)
    d.point((cx, cy - 1), fill=hi)
    d.point((cx - 1, cy), fill=PAL["white"][0])
    d.point((cx + 1, cy), fill=hi)
    d.point((cx, cy + 1), fill=PAL["ember"][0])


# ── The three people (cross-consistency anchors: same in scene + outro) ───────

def imo(d, x: int, y: int, pose: str = "griddle") -> None:
    """순자 이모 (~60): short + round, grey cardigan, ember apron, red kerchief.

    Reworked to read clearly as a kind, round, OLDER woman rather than an orange
    blob: a grey cardigan + cream collar frame the lit ember apron BIB (straps +
    waist tie + pocket break the orange mass), the arms read as arms (sleeves with
    skin cuffs), and a slightly bigger creased face under a tied red 머릿수건 with
    grey hair at the temples. MUST read as the SAME person in scene and in
    cinematic-outro. pose "griddle" = both forearms reaching down to the plate;
    "wave" = one arm raised (outro). (x,y)=top-left of ~30×56.
    Consumers: room-01-hotteok, cinematic-outro.
    """
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    apron, apron_lit, apron_sh = PAL["ember"][2], PAL["ember"][1], PAL["ember"][3]
    card, card_sh, card_hi = PAL["stone"][1], PAL["stone"][2], PAL["stone"][0]  # grey cardigan
    kerch, kerch_sh = PAL["tteok"][1], PAL["tteok"][2]    # red head-kerchief (identity)
    cx = x + 15
    drop_shadow(d, x + 4, y + 54, 22, 2)
    # ── torso: a grey cardigan, narrow at the shoulders rounding to a soft belly ──
    d.polygon([(x + 5, y + 22), (x + 25, y + 22), (x + 27, y + 40),
               (x + 24, y + 53), (x + 6, y + 53), (x + 3, y + 40)],
              fill=card, outline=OUTLINE)
    dither(d, x + 19, y + 26, 7, 25, card_sh, phase=0)    # cardigan shade (right)
    hline(d, x + 7, y + 23, 16, card_hi)                  # lit shoulder seam
    # a soft cream blouse collar at the neck
    fill(d, x + 11, y + 19, 8, 4, PAL["white"][1])
    hline(d, x + 11, y + 19, 8, PAL["white"][0])
    # ── the ember apron BIB over the front (her identity, lit by the griddle) ──
    fill(d, x + 9, y + 26, 12, 27, apron)
    vline(d, x + 9, y + 26, 27, apron_lit)                # lit left edge (griddle side)
    vline(d, x + 20, y + 27, 25, apron_sh)               # a clean shaded right edge
    d.line([x + 10, y + 26, x + 8, y + 21], fill=apron)   # straps to the shoulders
    d.line([x + 20, y + 26, x + 22, y + 21], fill=apron_sh)
    # waist tie band across the bib + a small centred knot (clear, not dithered)
    hline(d, x + 9, y + 39, 12, apron_sh)
    hline(d, x + 9, y + 40, 12, PAL["tteok"][3])
    fill(d, x + 13, y + 38, 4, 4, apron_lit)             # the knot
    frame(d, x + 13, y + 38, 4, 4, apron_sh)
    hline(d, x + 11, y + 47, 8, apron_sh)                 # a pocket line low on the bib
    # ── arms (grey cardigan sleeves) + hands ──
    if pose == "wave":
        # right arm raised high (greeting), left resting on the apron
        d.line([x + 24, y + 24, x + 29, y + 10], fill=card)
        d.line([x + 25, y + 24, x + 30, y + 10], fill=card_sh)
        fill(d, x + 27, y + 6, 5, 5, skin)                # raised hand
        frame(d, x + 27, y + 6, 5, 5, OUTLINE)
        d.point((x + 29, y + 5), fill=skin)               # waving fingers
        fill(d, x + 3, y + 30, 5, 12, card)               # left arm down the side
        dither(d, x + 3, y + 34, 2, 8, card_sh, phase=0)
        fill(d, x + 3, y + 41, 5, 4, skin)                # resting hand
        frame(d, x + 3, y + 41, 5, 4, OUTLINE)
    else:
        # both upper arms angle out from the shoulders, forearms reach DOWN-IN to
        # the plate in front (busy hands), sleeves grey with skin cuffs/hands.
        d.polygon([(x + 4, y + 24), (x + 9, y + 26), (x + 11, y + 40),
                   (x + 6, y + 42)], fill=card, outline=OUTLINE)        # left arm
        d.polygon([(x + 21, y + 26), (x + 26, y + 24), (x + 24, y + 42),
                   (x + 19, y + 40)], fill=card, outline=OUTLINE)       # right arm
        dither(d, x + 20, y + 28, 4, 12, card_sh, phase=0)
        _busy_hands(d, x + 10, y + 42, skin, skin_sh)
    # ── head + kerchief ──
    _imo_head(d, cx - 7, y + 2, skin, skin_sh, kerch, kerch_sh)


def _imo_head(d, x, y, skin, skin_sh, kerch, kerch_sh) -> None:
    """이모's round creased face under a tied red 머릿수건, grey hair at the temples.

    (x,y) = top-left of a ~14×17 head cell. Internal, shared by poses."""
    w = 13
    grey = PAL["stone"][1]
    # grey hair showing at the temples under the kerchief (age cue)
    fill(d, x + 1, y + 7, 2, 5, grey)
    fill(d, x + w - 2, y + 7, 2, 5, grey)
    # round face
    d.ellipse([x + 1, y + 3, x + w - 1, y + 3 + (w - 3)], fill=skin, outline=OUTLINE)
    dither(d, x + w - 4, y + 6, 3, w - 6, skin_sh, phase=0)              # cheek shade (right)
    # the tied kerchief (머릿수건) over the crown — the identity color
    d.pieslice([x, y - 1, x + w, y + 10], 180, 360, fill=kerch, outline=OUTLINE)
    hline(d, x + 1, y, w - 1, kerch_sh)                   # fold shadow
    d.point((x + 3, y + 2), fill=PAL["tteok"][0])         # a lit highlight on the crown
    d.point((x + w, y + 3), fill=kerch)                   # knot tail at the side
    d.point((x + w + 1, y + 4), fill=kerch_sh)
    # warm kind face: crinkled smiling eyes (2px) + rosy cheeks + a clear smile
    ey = y + 9
    hline(d, x + 2, ey, 3, OUTLINE)                       # left eye (relaxed, smiling)
    hline(d, x + 7, ey, 3, OUTLINE)                       # right eye
    d.point((x + 3, ey - 1), fill=skin_sh)               # soft lid above
    d.point((x + 8, ey - 1), fill=skin_sh)
    d.point((x + 2, ey + 2), fill=PAL["tteok"][0])        # rosy cheeks
    d.point((x + 10, ey + 2), fill=PAL["tteok"][0])
    d.point((x + 6, ey + 1), fill=skin_sh)               # nose tick
    d.line([x + 4, ey + 4, x + 8, ey + 4], fill=PAL["wood_dark"][2])     # smile
    d.point((x + 3, ey + 3), fill=PAL["wood_dark"][2])
    d.point((x + 9, ey + 3), fill=PAL["wood_dark"][2])


def _busy_hands(d, x, y, skin, skin_sh) -> None:
    """Two rounded working hands reaching to the plate (~11×5 span, 3px gap). Internal."""
    # left hand
    fill(d, x, y + 1, 4, 3, skin)
    d.point((x + 1, y), fill=skin)                # knuckles
    d.point((x + 2, y), fill=skin)
    hline(d, x, y + 3, 4, skin_sh)                # shaded underside
    hline(d, x, y + 4, 4, OUTLINE)                # base outline
    d.point((x - 1, y + 2), fill=OUTLINE)         # rounded outer edge
    # right hand (3px gap between them)
    fill(d, x + 7, y + 1, 4, 3, skin)
    d.point((x + 8, y), fill=skin)
    d.point((x + 9, y), fill=skin)
    hline(d, x + 7, y + 3, 4, skin_sh)
    hline(d, x + 7, y + 4, 4, OUTLINE)
    d.point((x + 11, y + 2), fill=OUTLINE)


def doyun(d, x: int, y: int, pose: str = "stand") -> None:
    """도윤 (19): tall, lanky, tense. In the outro, BUZZED (군대) at the window.

    Reworked to read as a real, quiet, lanky BOY rather than a dark blob: a
    structured zip jacket (stood collar + a lit center placket + a hem + sleeves
    that read as ARMS with skin hands drawn OUTSIDE the torso) over long thin
    legs, narrow shoulders, and a bigger young face (smooth skin, a faint jaw
    shadow, slightly down-tense brows, a small flat mouth — no creases = young).
    The SAME face/jaw helper (_doyun_face) draws both poses so the dark mop and
    the near-shaved scalp read as the SAME boy one hour later. pose "stand" = at
    the bus stop, military duffel on the shoulder, still with HAIR (a dark mop);
    pose "window" = the bus-window bust, head SHAVED to near-zero, one hand
    half-raised to the glass. (x,y)=top-left of ~22×52 (window pose ~24×26 bust).
    Consumers: room-04-busstop, cinematic-outro.
    """
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    jkt, jkt_lit, jkt_sh = PAL["ink"][1], PAL["ink"][0], PAL["ink"][2]   # dark 군대 jacket
    hair = PAL["ink"][2]
    if pose == "window":
        # a bust framed in a yellow bus window: shaved head, neon stripe on face
        cx = x + 12
        fill(d, x, y, 24, 26, PAL["gold_light"][1])       # lit window behind him
        frame(d, x, y, 24, 26, PAL["metal"][3])
        # shoulders + a stood jacket collar so the bust reads as clothed, not a slab
        fill(d, x + 3, y + 18, 18, 8, jkt)
        hline(d, x + 3, y + 18, 18, jkt_lit)              # lit collar seam
        d.polygon([(cx - 4, y + 18), (cx, y + 21), (cx + 4, y + 18)], fill=jkt_lit)  # open collar V
        d.point((cx, y + 20), fill=PAL["white"][2])       # a pale tee at the throat
        # the SAME young face/jaw as the stand pose, then a near-shaved scalp on top
        _doyun_face(d, cx, y + 4, skin, skin_sh, shaved=True)
        # the neon stripe crossing the reflected face (pink-green), low on the jaw
        for xx in range(cx - 6, cx + 7):
            d.point((xx, y + 16), fill=PAL["neon_pink"][1] if xx < cx
                    else PAL["neon_green"][1])
        # one hand half-raised to the glass (skin, OUTSIDE the shoulder slab)
        fill(d, x + 17, y + 11, 4, 5, skin)
        hline(d, x + 17, y + 11, 4, PAL["wood_light"][0])
        frame(d, x + 17, y + 11, 4, 5, OUTLINE)
        return
    # standing at the stop, still with hair, tense, duffel on shoulder
    cx = x + 11
    drop_shadow(d, x + 2, y + 50, 18, 2, cool=True)
    # long thin legs (skinny jeans), a knee break + a thin cuff so they read as legs
    for lx in (x + 6, x + 12):
        fill(d, lx, y + 37, 4, 13, PAL["ink"][2])
        vline(d, lx, y + 37, 13, PAL["ink"][1])           # lit shin edge
        hline(d, lx, y + 48, 4, OUTLINE)                  # cuff/ankle break
    # ── the structured zip jacket: narrow at the shoulders, a clean hem ──
    d.polygon([(x + 4, y + 19), (x + 17, y + 19), (x + 18, y + 37),
               (x + 3, y + 37)], fill=jkt, outline=OUTLINE)
    dither(d, x + 12, y + 22, 5, 14, jkt_sh, phase=0)     # shaded right side
    vline(d, x + 10, y + 20, 17, jkt_lit)                 # the lit center zip placket
    vline(d, x + 11, y + 20, 17, jkt_sh)                  # placket seam shadow
    d.point((x + 10, y + 28), fill=PAL["metal"][1])       # the zip pull (a metal glint)
    hline(d, x + 4, y + 36, 14, jkt_sh)                   # the jacket hem line
    # a stood collar framing the neck (two short flaps + a pale tee at the throat)
    d.polygon([(x + 6, y + 19), (x + 10, y + 17), (x + 10, y + 21)], fill=jkt_lit)
    d.polygon([(x + 15, y + 19), (x + 11, y + 17), (x + 11, y + 21)], fill=jkt)
    frame(d, x + 6, y + 17, 5, 3, OUTLINE)
    d.point((x + 10, y + 19), fill=PAL["white"][2])       # tee at the collar gap
    # ── arms: sleeves OFF the shoulders, skin hands at the ends (one fidgeting) ──
    # left sleeve hangs down the side, hand fidgeting low + forward (tense)
    d.polygon([(x + 2, y + 21), (x + 5, y + 20), (x + 6, y + 33), (x + 2, y + 34)],
              fill=jkt, outline=OUTLINE)
    fill(d, x + 2, y + 33, 4, 4, skin)                    # left hand
    hline(d, x + 2, y + 33, 4, PAL["wood_light"][0])
    frame(d, x + 2, y + 33, 4, 4, OUTLINE)
    # right sleeve tucked across the front (hand gripping the duffel strap = tense)
    d.polygon([(x + 16, y + 20), (x + 19, y + 21), (x + 15, y + 33), (x + 12, y + 32)],
              fill=jkt, outline=OUTLINE)
    fill(d, x + 12, y + 30, 4, 4, skin)                   # right hand on the strap
    frame(d, x + 12, y + 30, 4, 4, OUTLINE)
    # the military duffel slung on the right shoulder (olive = stone-dk + ember tie)
    d.polygon([(x + 16, y + 15), (x + 23, y + 19), (x + 22, y + 31),
               (x + 17, y + 29)], fill=PAL["stone"][3], outline=OUTLINE)
    hline(d, x + 17, y + 16, 6, PAL["stone"][2])
    dither(d, x + 19, y + 21, 3, 8, PAL["ink"][2], phase=0)   # the bag's shaded fold
    d.line([x + 9, y + 17, x + 18, y + 15], fill=PAL["ember"][3])  # strap over the shoulder
    d.line([x + 9, y + 18, x + 18, y + 16], fill=PAL["ember"][2])
    # ── head: the bigger young face, then the dark mop of hair on top ──
    _doyun_face(d, cx, y + 5, skin, skin_sh, shaved=False)


def _doyun_face(d, cx: int, y: int, skin, skin_sh, shaved: bool) -> None:
    """도윤's bigger young face: smooth jaw, down-tense brows, small mouth.

    (cx, y) = head center-x + top. The SAME jaw/eyes/mouth for both poses so the
    mop and the shaved scalp read as one boy one hour later; only the hair on top
    differs (shaved=True = a faint stubble dither + a thin temple shadow; else a
    dark mop with a brow fringe). Internal, shared by doyun()'s two poses."""
    hair = PAL["ink"][2]
    # the face oval (slightly long = lanky), smooth — no creases (young cue)
    d.ellipse([cx - 6, y, cx + 6, y + 13], fill=skin, outline=OUTLINE)
    dither(d, cx + 2, y + 4, 4, 7, skin_sh, phase=0)      # right-cheek shade
    hline(d, cx - 2, y + 12, 4, skin_sh)                  # a soft jaw shadow (boyish chin)
    if shaved:
        # near-zero buzz: bare scalp, only a thin stubble band high on the crown +
        # a temple shade (subtle — the scalp shows skin, unmistakably NOT a mop)
        dither(d, cx - 4, y + 1, 9, 2, skin_sh, phase=0)
        d.point((cx - 5, y + 3), fill=skin_sh)            # temple
        d.point((cx + 4, y + 3), fill=skin_sh)
    else:
        # a dark mop: a crown cap + a fringe falling across the brow (with-hair)
        d.pieslice([cx - 7, y - 3, cx + 7, y + 9], 180, 360, fill=hair, outline=OUTLINE)
        fill(d, cx - 6, y + 2, 12, 2, hair)               # fringe across the brow
        d.point((cx + 5, y + 1), fill=PAL["ink"][1])      # a lit hair tuft (volume)
    # brows: a short down-tilt over each eye (tense/anxious, the boy's whole read)
    d.point((cx - 4, y + 5), fill=PAL["ink"][2])
    d.point((cx - 3, y + 6), fill=PAL["ink"][2])
    d.point((cx + 4, y + 5), fill=PAL["ink"][2])
    d.point((cx + 3, y + 6), fill=PAL["ink"][2])
    # eyes: 2px, quiet, set a touch low under the brows (down-cast)
    fill(d, cx - 4, y + 7, 2, 2, OUTLINE)
    fill(d, cx + 3, y + 7, 2, 2, OUTLINE)
    d.point((cx - 4, y + 7), fill=PAL["ink"][1])          # a soft (not hard-black) top
    d.point((cx + 3, y + 7), fill=PAL["ink"][1])
    d.point((cx, y + 9), fill=skin_sh)                    # a slim nose tick
    hline(d, cx - 1, y + 11, 3, PAL["ink"][1])            # a small, closed, tense mouth


def hana(d, x: int, y: int, pose: str = "serve") -> None:
    """하나 (~19): slim, energetic, a high BLACK ponytail. A bunsik-bar server.

    Reworked to read as a bright, slim young GIRL rather than a white box with a
    red box on it — and to stay clearly DISTINCT from 이모 (old, round, kerchief,
    grey cardigan) and 도윤 (male, dark jacket, mop). Her identity is the high
    black PONYTAIL (a bold tail swinging off the crown) + a structured tteok-red
    apron BIB (shoulder straps over a white short-sleeve tee, a waist tie + knot,
    a pocket line) + a bright young face (quick eyes, a clear smile, a fringe).
    Arms read as arms: short tee sleeves with skin forearms/hands OUTSIDE the
    torso. pose "serve" = leaning over her bunsik bar reaching out with a ladle;
    "wave" = on the platform, arm up (outro). (x,y)=top-left of ~22×52.
    Consumers: room-02-meokja, cinematic-outro.
    """
    skin, skin_sh = PAL["wood_light"][0], PAL["wood_light"][1]
    tee, tee_sh = PAL["white"][0], PAL["white"][2]
    apron, apron_lit, apron_sh = PAL["tteok"][1], PAL["tteok"][0], PAL["tteok"][2]
    cx = x + 11
    drop_shadow(d, x + 4, y + 50, 14, 2)
    # slim legs (dark jeans), a thin lit shin edge + a cuff break so they read
    for lx in (x + 7, x + 12):
        fill(d, lx, y + 38, 4, 12, PAL["ink"][1])
        vline(d, lx, y + 38, 12, PAL["ink"][0])
        hline(d, lx, y + 48, 4, OUTLINE)
    # ── a slim white tee torso, narrow at the waist (a young, lean silhouette) ──
    d.polygon([(x + 6, y + 18), (x + 16, y + 18), (x + 16, y + 38),
               (x + 6, y + 38)], fill=tee, outline=OUTLINE)
    hline(d, x + 6, y + 18, 11, PAL["white"][1])          # lit shoulder line
    dither(d, x + 13, y + 22, 3, 14, tee_sh, phase=0)     # tee shade (right)
    fill(d, x + 9, y + 18, 4, 3, tee_sh)                  # a soft round neckline
    hline(d, x + 9, y + 18, 4, OUTLINE)
    # ── the structured tteok-red apron BIB over the tee (straps + tie + pocket) ──
    fill(d, x + 8, y + 23, 7, 16, apron)                  # the bib panel
    vline(d, x + 8, y + 23, 16, apron_lit)                # lit left edge
    dither(d, x + 13, y + 26, 2, 13, apron_sh, phase=0)   # shaded right edge
    hline(d, x + 8, y + 23, 7, apron_lit)                 # bib top hem
    d.line([x + 9, y + 23, x + 8, y + 19], fill=apron)    # left shoulder strap
    d.line([x + 13, y + 23, x + 14, y + 19], fill=apron_sh)   # right shoulder strap
    hline(d, x + 8, y + 33, 7, apron_sh)                  # waist tie band
    fill(d, x + 10, y + 32, 3, 3, apron_lit)              # the centred tie knot
    frame(d, x + 10, y + 32, 3, 3, apron_sh)
    hline(d, x + 9, y + 37, 5, apron_sh)                  # a pocket line low on the bib
    if pose == "wave":
        # right arm raised high (greeting): short tee sleeve + a skin forearm/hand
        fill(d, x + 15, y + 18, 4, 4, tee)                # sleeve cap on the shoulder
        d.line([x + 17, y + 19, x + 22, y + 8], fill=skin)   # raised forearm
        d.line([x + 18, y + 19, x + 23, y + 8], fill=skin_sh)
        fill(d, x + 20, y + 4, 4, 4, skin)                # waving hand
        frame(d, x + 20, y + 4, 4, 4, OUTLINE)
        d.point((x + 22, y + 3), fill=skin)               # fingers
        fill(d, x + 3, y + 22, 4, 4, tee)                 # left tee sleeve cap
        fill(d, x + 3, y + 25, 4, 9, skin)                # left forearm down the side
        frame(d, x + 3, y + 30, 4, 4, OUTLINE)            # left hand
    else:
        # leaning, left arm reaching out with a ladle (a tee sleeve + skin forearm)
        fill(d, x + 3, y + 21, 4, 4, tee)                 # left tee sleeve cap
        fill(d, x + 1, y + 25, 5, 5, skin)                # forearm reaching out
        hline(d, x + 1, y + 25, 5, PAL["wood_light"][0])
        fill(d, x + 1, y + 29, 4, 4, skin)                # the hand
        frame(d, x + 1, y + 29, 4, 4, OUTLINE)
        d.line([x - 2, y + 32, x + 2, y + 30], fill=PAL["metal"][2])  # ladle handle
        d.ellipse([x - 5, y + 31, x - 1, y + 35], fill=PAL["metal"][1], outline=OUTLINE)
        fill(d, x + 15, y + 21, 4, 4, tee)                # right tee sleeve cap
        fill(d, x + 16, y + 25, 4, 8, skin)               # right forearm at her side
        frame(d, x + 16, y + 29, 4, 4, OUTLINE)           # right hand
    # ── head + the high black ponytail (the identity silhouette) ──
    _hana_head(d, cx, y + 4, skin, skin_sh)


def _hana_head(d, cx: int, y: int, skin, skin_sh) -> None:
    """하나's bright young face + a bold high ponytail. (cx,y)=head center-x + top.

    The ponytail is her identity silhouette: a thick black tail tied high on the
    crown, swinging off the back-right (energy). The face is young + quick: a side
    fringe, bright eyes, rosy cheeks, a clear smile. Internal to hana()."""
    hair, hair_hi = PAL["ink"][2], PAL["ink"][1]
    # the face oval (small + young), smooth, with a right-cheek shade
    d.ellipse([cx - 5, y, cx + 5, y + 12], fill=skin, outline=OUTLINE)
    dither(d, cx + 2, y + 4, 3, 6, skin_sh, phase=0)
    # the hair: a crown cap + a side fringe sweeping across the brow (young)
    d.pieslice([cx - 6, y - 2, cx + 6, y + 8], 180, 360, fill=hair, outline=OUTLINE)
    fill(d, cx - 6, y + 2, 7, 2, hair)                    # fringe sweeping left-to-right
    d.point((cx - 5, y + 4), fill=hair)                   # a strand by the temple
    d.point((cx + 3, y), fill=hair_hi)                    # a lit crown tuft (volume)
    # the high PONYTAIL: tied at the crown-back, a THICK tail swinging off right
    d.line([cx + 4, y - 1, cx + 8, y + 1], fill=hair)     # the tie pulling up + back
    fill(d, cx + 7, y, 3, 3, hair)                        # the bound base of the tail
    d.line([cx + 9, y + 1, cx + 12, y + 8], fill=hair)    # the tail swinging out-down
    d.line([cx + 8, y + 2, cx + 11, y + 9], fill=hair)    # (2px thick = a bold tail)
    d.line([cx + 10, y + 2, cx + 13, y + 9], fill=hair_hi)   # a lit edge on the tail
    d.point((cx + 12, y + 9), fill=hair)                  # the wispy tip
    d.point((cx + 13, y + 10), fill=hair)
    # the bright quick face: eyes (2px), rosy cheeks, a clear smile
    ey = y + 6
    fill(d, cx - 3, ey, 2, 2, OUTLINE)                    # left eye
    fill(d, cx + 2, ey, 2, 2, OUTLINE)                    # right eye
    d.point((cx - 3, ey), fill=PAL["ink"][1])             # soft (not pure-black) top
    d.point((cx + 2, ey), fill=PAL["ink"][1])
    d.point((cx - 4, ey + 2), fill=PAL["tteok"][0])       # rosy cheeks (energetic)
    d.point((cx + 4, ey + 2), fill=PAL["tteok"][0])
    d.point((cx, ey + 2), fill=skin_sh)                   # a slim nose tick
    d.line([cx - 1, ey + 4, cx + 1, ey + 4], fill=PAL["tteok"][2])   # a small smile
    d.point((cx + 2, ey + 4), fill=PAL["tteok"][1])       # one lifted corner (a grin)


# ── Stalls + market structure ────────────────────────────────────────────────

def market_stall(d, x: int, y: int, w: int = 90, h: int = 70,
                 awning: str = "stripe", bulb: bool = True) -> None:
    """Generic island stall: striped awning, wood counter, bare hanging bulb.

    The warm-island chassis every protagonist stall and background stall is
    built on. (x,y)=top-left of the stall bbox; counter sits at the bottom, the
    awning across the top, the bulb hanging at upper-right. Consumers: all 4
    zones (background + protagonist).
    """
    # awning: a faded striped valance across the top
    aw_h = 12
    fill(d, x, y, w, aw_h, PAL["wood_dark"][1])
    if awning == "stripe":
        for i, sx in enumerate(range(x, x + w, 8)):
            c = PAL["white"][1] if i % 2 == 0 else PAL["tteok"][2]
            fill(d, sx, y, 4, aw_h, c)
    # scalloped hem of the awning
    for sx in range(x, x + w, 8):
        d.polygon([(sx, y + aw_h), (sx + 4, y + aw_h), (sx + 2, y + aw_h + 3)],
                  fill=PAL["wood_dark"][2])
    hline(d, x, y, w, PAL["wood_light"][1])
    frame(d, x, y, w, aw_h, OUTLINE)
    # back posts holding the awning
    vline(d, x + 1, y + aw_h, h - aw_h, PAL["wood_dark"][2])
    vline(d, x + w - 2, y + aw_h, h - aw_h, PAL["wood_dark"][2])
    # the wood counter slab at the bottom
    cy = y + h - 16
    wood_planks(d, x, cy, w, 16, PAL["wood_light"], plank_h=6, seam_every=2)
    hline(d, x, cy, w, PAL["wood_light"][0])
    fill(d, x, cy + 14, w, 2, PAL["wood_dark"][3])        # counter lip shadow
    frame(d, x, cy, w, 16, OUTLINE)
    # the bare hanging bulb at upper-right (warm island light)
    if bulb:
        bx = x + w - 16
        vline(d, bx, y + aw_h, 6, PAL["ink"][2])          # cord
        glow(d, bx, y + aw_h + 9, 7, [PAL["gold_light"][1], PAL["ember"][1], PAL["ember"][0]])
        d.ellipse([bx - 2, y + aw_h + 6, bx + 2, y + aw_h + 11],
                  fill=PAL["gold_light"][0], outline=PAL["ember"][2])
        d.point((bx, y + aw_h + 8), fill=PAL["white"][0])


def bunsik_bar(d, x: int, y: int, w: int = 70, h: int = 26) -> None:
    """분식 bar: bubbling 떡볶이, 어묵 in broth on sticks, a tray of 김밥.

    The hot, red, steaming counter of 하나's stall — the most saturated red of
    its scene. (x,y)=top-left of the bar surface. Consumers: room-02-meokja,
    obj-tteokbokki, obj-eomuk.
    """
    # the steel counter surface
    fill(d, x, y, w, h, PAL["metal"][3])
    hline(d, x, y, w, PAL["metal"][2])
    frame(d, x, y, w, h, OUTLINE)
    # left: the 떡볶이 pan, red sauce bubbling (the saturated red)
    pw = 26
    d.ellipse([x + 2, y + 3, x + 2 + pw, y + h - 2], fill=PAL["metal"][3], outline=OUTLINE)
    d.ellipse([x + 4, y + 5, x + pw, y + h - 4], fill=PAL["tteok"][1])
    dither(d, x + 6, y + 6, pw - 6, 6, PAL["tteok"][0], phase=0)   # glossy top
    dither(d, x + 6, y + h - 9, pw - 6, 4, PAL["tteok"][2], phase=1)  # deep sauce
    # the cylindrical rice cakes poking up through the sauce
    for tx in range(x + 7, x + pw - 2, 5):
        fill(d, tx, y + 7, 3, 4, PAL["white"][0])
        hline(d, tx, y + 7, 3, PAL["white"][1])
        d.point((tx + 1, y + 8), fill=PAL["tteok"][0])    # sauce-glazed
    steam(d, x + 12, y + 2, height=12, phase=0, warm=False)
    # middle: 어묵 fishcake folded on skewers standing in broth
    bx = x + pw + 6
    fill(d, bx, y + 6, 18, h - 8, PAL["wood_light"][2])   # broth pot
    d.ellipse([bx, y + 4, bx + 18, y + 9], fill=PAL["wood_light"][1], outline=OUTLINE)
    for i, sx in enumerate(range(bx + 3, bx + 16, 4)):
        vline(d, sx, y - 6, 12, PAL["wood_dark"][2])      # skewer stick
        # folded fishcake ribbon on the stick
        d.polygon([(sx - 2, y - 4), (sx + 2, y - 5), (sx + 1, y - 1), (sx - 2, y)],
                  fill=PAL["wood_light"][1], outline=PAL["wood_dark"][2])
    steam(d, bx + 8, y + 1, height=10, phase=4, warm=False)
    # right: a tray of 김밥 rounds (rice + a dark seaweed ring + center dots)
    kx = bx + 22
    fill(d, kx, y + 8, w - (kx - x) - 2, h - 12, PAL["wood_dark"][2])  # tray
    frame(d, kx, y + 8, w - (kx - x) - 2, h - 12, OUTLINE)
    for i, gx in enumerate(range(kx + 3, x + w - 4, 6)):
        d.ellipse([gx, y + 10, gx + 4, y + 14], fill=PAL["ink"][2])    # nori ring
        d.point((gx + 2, y + 12), fill=PAL["white"][0])               # rice
        d.point((gx + 2, y + 11), fill=PAL["tteok"][0])               # filling


def manmulsang_wall(d, x: int, y: int, w: int, h: int, seed: int = 21) -> None:
    """Wall of hanging merchandise (umbrellas, socks, gloves, keychains, combs).

    Dense silhouettes of goods on hooks under the bazaar's yellow bulb — no
    legible label anywhere (L3-a). Deterministic clutter. Consumers:
    room-03-manmulsang(+wrapped), merch cosmetic.
    """
    r = random.Random(seed)
    # a peg wall ground (warm dim wood)
    fill(d, x, y, w, h, PAL["wood_dark"][2])
    dither(d, x, y, w, h, PAL["wood_dark"][3], phase=0)
    # a top rail the goods hang from
    fill(d, x, y, w, 3, PAL["wood_dark"][1])
    hline(d, x, y, w, PAL["wood_light"][2])
    kinds = ["umbrella", "socks", "glove", "key", "comb", "clock"]
    cw = 14
    for col, hx in enumerate(range(x + 3, x + w - cw, cw)):
        kind = kinds[(col + r.randint(0, 2)) % len(kinds)]
        hook_y = y + 3
        vline(d, hx + cw // 2, hook_y, 3, PAL["metal"][2])  # the hook stem
        gy = hook_y + 3
        if kind == "umbrella":
            d.pieslice([hx, gy, hx + cw - 2, gy + 8], 180, 360,
                       fill=PAL["asphalt"][0], outline=OUTLINE)
            vline(d, hx + cw // 2, gy + 4, 10, PAL["wood_dark"][3])
        elif kind == "socks":
            for k in range(2):
                ox = hx + 2 + k * 5
                fill(d, ox, gy, 3, 9, PAL["white"][1] if k == 0 else PAL["stone"][1])
                fill(d, ox, gy + 7, 5, 3, PAL["white"][2])  # foot
        elif kind == "glove":
            fill(d, hx + 3, gy + 1, 6, 8, PAL["wood_light"][2])
            for fx in range(hx + 3, hx + 9, 2):
                vline(d, fx, gy - 1, 2, PAL["wood_light"][2])  # fingers
        elif kind == "key":
            for k in range(3):
                ky = gy + k * 3
                d.ellipse([hx + 4 + k, ky, hx + 8 + k, ky + 2], outline=PAL["gold_light"][2])
        elif kind == "comb":
            fill(d, hx + 3, gy, 7, 3, PAL["ink"][1])
            for tx in range(hx + 3, hx + 10):
                vline(d, tx, gy + 3, 4, PAL["ink"][1])      # teeth
        else:  # clock
            d.ellipse([hx + 2, gy, hx + 11, gy + 9], fill=PAL["white"][1], outline=OUTLINE)
            d.line([hx + 6, gy + 5, hx + 6, gy + 2], fill=PAL["ink"][2])
            d.line([hx + 6, gy + 5, hx + 9, gy + 5], fill=PAL["ink"][2])


def gift_wrapped(d, x: int, y: int, w: int = 34, h: int = 26) -> None:
    """The gift wrapped in brown paper on the counter, a tteok-red ribbon.

    A kraft-paper parcel, creased, tied with a red string bow. (x,y)=top-left.
    Consumers: room-03-manmulsang-wrapped, obj-gift-wrapped.
    """
    paper, paper_hi, paper_sh = PAL["wood_light"][1], PAL["wood_light"][0], PAL["wood_dark"][1]
    ribbon, ribbon_hi = PAL["tteok"][1], PAL["tteok"][0]
    drop_shadow(d, x, y + h - 1, w, 2)
    fill(d, x, y, w, h, paper)
    hline(d, x, y, w, paper_hi)                           # lit top edge
    vline(d, x, y, h, paper_hi)
    dither(d, x + w - 8, y + 3, 8, h - 4, paper_sh, phase=0)  # shaded right
    # creases of folded kraft paper
    d.line([x + 4, y + h - 2, x + 10, y + 2], fill=paper_sh)
    d.line([x + w - 12, y + h - 2, x + w - 6, y + 3], fill=paper_sh)
    frame(d, x, y, w, h, OUTLINE)
    # the red ribbon: a vertical band + a horizontal band + a bow knot on top
    fill(d, x + w // 2 - 2, y, 4, h, ribbon)
    vline(d, x + w // 2 - 2, y, h, ribbon_hi)
    fill(d, x, y + h // 2 - 2, w, 4, ribbon)
    hline(d, x, y + h // 2 - 2, w, ribbon_hi)
    # the bow: two loops + tails at the top-centre crossing
    cx = x + w // 2
    d.polygon([(cx, y), (cx - 6, y - 4), (cx - 6, y + 2)], fill=ribbon, outline=OUTLINE)
    d.polygon([(cx, y), (cx + 6, y - 4), (cx + 6, y + 2)], fill=ribbon, outline=OUTLINE)
    d.point((cx, y - 1), fill=ribbon_hi)                  # knot
    d.line([cx, y, cx - 3, y + 4], fill=ribbon)           # tails
    d.line([cx, y, cx + 3, y + 4], fill=ribbon)


# ── The bus + the stop + the gate (the climax structure) ─────────────────────

def last_bus(d, x: int, y: int, w: int = 130, h: int = 70) -> None:
    """The last bus: yellow-lit windows, an open door, a body on wet asphalt.

    Enters from the left; the warm yellow windows are the only inside-light. The
    body is cold metal, the door open. (x,y)=top-left of the bus body bbox.
    Consumers: room-04-busstop-bus, cinematic-outro.
    """
    body, body_hi, body_sh = PAL["metal"][2], PAL["metal"][1], PAL["metal"][3]
    drop_shadow(d, x + 2, y + h - 1, w - 4, 3, cool=True)
    # the long bus body, slightly rounded front
    fill(d, x + 4, y, w - 4, h - 6, body)
    d.pieslice([x, y, x + 16, y + 30], 90, 270, fill=body)   # rounded nose (left)
    hline(d, x + 4, y, w - 4, body_hi)                    # roof sheen
    dither(d, x + 4, y + h - 18, w - 4, 10, body_sh, phase=0)  # lower-body shade
    fill(d, x + 4, y + h - 8, w - 4, 4, PAL["asphalt"][2])  # under-skirt
    frame(d, x + 4, y, w - 4, h - 6, OUTLINE)
    # a destination band across the top front (neon-ish but ILLEGIBLE)
    fill(d, x + 18, y + 4, 30, 6, PAL["ink"][2])
    for sx in range(x + 20, x + 46, 4):
        d.point((sx, y + 6), fill=PAL["gold_light"][1])  # dot-matrix, no glyph
        d.point((sx + 1, y + 7), fill=PAL["gold_light"][2])
    # the row of warm yellow windows (the inside light)
    win_y = y + 14
    for wx in range(x + 20, x + w - 14, 16):
        fill(d, wx, win_y, 12, 16, PAL["gold_light"][1])
        hline(d, wx, win_y, 12, PAL["gold_light"][0])
        dither(d, wx, win_y + 10, 12, 6, PAL["ember"][1], phase=1)  # warm lower glow
        frame(d, wx, win_y, 12, 16, PAL["metal"][3])
        # a passenger silhouette in a couple of them
        if (wx // 16) % 3 == 0:
            d.ellipse([wx + 4, win_y + 4, wx + 8, win_y + 9], fill=PAL["ink"][2])
    # the OPEN door near the front: a dark recess with a folded panel
    dx = x + 14
    fill(d, dx, win_y - 2, 8, h - 22, PAL["asphalt"][2])
    vline(d, dx, win_y - 2, h - 22, PAL["metal"][3])
    vline(d, dx + 7, win_y - 2, h - 22, PAL["metal"][2])  # folded door panel
    fill(d, dx + 1, y + h - 12, 6, 3, PAL["gold_light"][2])  # warm step light
    # two big wheels
    for wheelx in (x + 26, x + w - 24):
        d.ellipse([wheelx, y + h - 12, wheelx + 14, y + h + 2], fill=PAL["ink"][2],
                  outline=OUTLINE)
        d.ellipse([wheelx + 4, y + h - 8, wheelx + 10, y + h - 2], fill=PAL["metal"][3])
    # a headlight beam sweeping the wet asphalt (cool, low)
    d.point((x + 2, y + 24), fill=PAL["gold_light"][0])
    d.point((x + 1, y + 25), fill=PAL["gold_light"][1])


def bus_stop(d, x: int, y: int, w: int = 46, h: int = 60) -> None:
    """Bus-stop shelter: a flat canopy on a post + a metal bench + a sign post.

    Cold street furniture (metal/ink). (x,y)=top-left of the shelter bbox.
    Consumers: room-04-busstop.
    """
    post, post_hi, post_sh = PAL["metal"][2], PAL["metal"][1], PAL["metal"][3]
    # the flat canopy across the top
    fill(d, x, y, w, 5, post)
    hline(d, x, y, w, post_hi)
    fill(d, x, y + 5, w, 2, post_sh)
    frame(d, x, y, w, 5, OUTLINE)
    # two support posts
    for px in (x + 3, x + w - 5):
        fill(d, px, y + 5, 3, h - 5, post)
        vline(d, px, y + 5, h - 5, post_hi)
        vline(d, px + 2, y + 5, h - 5, post_sh)
    # the sign plate hanging off the left post (the 버스 정류장 sign — illegible)
    sx, sy = x + 1, y + 12
    fill(d, sx, sy, 12, 14, PAL["metal"][0])
    frame(d, sx, sy, 12, 14, OUTLINE)
    d.ellipse([sx + 3, sy + 2, sx + 9, sy + 8], outline=PAL["neon_cyan"][2])  # bus icon ring
    hline(d, sx + 2, sy + 10, 8, PAL["ink"][1])          # a route line, no text
    hline(d, sx + 2, sy + 12, 6, PAL["ink"][1])
    # the metal bench at the bottom
    by = y + h - 8
    fill(d, x + 6, by, w - 12, 4, post)                  # seat
    hline(d, x + 6, by, w - 12, post_hi)
    for sl in range(x + 8, x + w - 8, 4):                # slats
        vline(d, sl, by, 4, post_sh)
    fill(d, x + 8, by + 4, 3, 4, post_sh)                # legs
    fill(d, x + w - 11, by + 4, 3, 4, post_sh)
    frame(d, x + 6, by, w - 12, 4, OUTLINE)
    drop_shadow(d, x + 6, by + 8, w - 12, 2, cool=True)


def market_gate(d, x: int, y: int, w: int = 95, h: int = 45) -> None:
    """The 시장 입구 arch: an illegible neon sign + a garland of bulbs.

    A wide market entrance arch crowned by a suggested-hangul neon sign (never
    legible, L3-a) and strung with a swag of warm bulbs. (x,y)=top-left of the
    arch bbox. Consumers: room-04-busstop, obj-market-gate, cosmetic-set-complete-03.
    """
    # the two stout columns of the arch
    col_w = 12
    for cx0 in (x, x + w - col_w):
        fill(d, cx0, y + 14, col_w, h - 14, PAL["wood_dark"][2])
        vline(d, cx0, y + 14, h - 14, PAL["wood_dark"][1])
        dither(d, cx0 + col_w - 4, y + 16, 4, h - 16, PAL["wood_dark"][3], phase=0)
        frame(d, cx0, y + 14, col_w, h - 14, OUTLINE)
    # the lintel beam across the top
    fill(d, x - 3, y + 2, w + 6, 14, PAL["wood_dark"][1])
    hline(d, x - 3, y + 2, w + 6, PAL["wood_light"][2])
    frame(d, x - 3, y + 2, w + 6, 14, OUTLINE)
    # the neon sign 시장 입구 — SUGGESTED strokes, glow, ILLEGIBLE
    sign_w = w - 28
    neon_sign(d, x + 14, y + 3, sign_w, 12, color="pink", lit=True)
    # the garland of warm bulbs swagging under the lintel
    n = 9
    for i in range(n + 1):
        gx = x + 4 + i * (w - 8) // n
        # the swag dips in the middle
        sag = int(4 * (1 - abs((i - n / 2) / (n / 2))))
        gy = y + 16 + sag
        if i < n:
            nx = x + 4 + (i + 1) * (w - 8) // n
            nsag = int(4 * (1 - abs((i + 1 - n / 2) / (n / 2))))
            d.line([gx, gy, nx, y + 16 + nsag], fill=PAL["ink"][2])  # the wire
        d.ellipse([gx - 1, gy, gx + 1, gy + 2], fill=PAL["gold_light"][1],
                  outline=PAL["ember"][2])
        d.point((gx, gy), fill=PAL["white"][0])          # each bulb catches light


# ── The market cat (cosmetic + scene sprite) ─────────────────────────────────

def market_cat(d, x: int, y: int, frame_i: int = 0) -> None:
    """The market cat, 3 frames. (x,y)=top-left of ~18×16 cell (head reaches y-1).

    frame 0 sitting · 1 tail flick · 2 licking a paw + looking up at the steam
    (frame 2 is COSMETIC-ONLY per the §10 budget; scenes use 0 and 1). A neon
    stripe across the back is added by the COSMETIC builder, not here. Eyes catch
    warm gold. Consumers: room-01-hotteok, sprite-cat-strip,
    cosmetic-avatar-marketcat(+strip).
    """
    fur, fur_sh, fur_hi = PAL["wood_dark"][1], PAL["wood_dark"][2], PAL["wood_light"][2]
    drop_shadow(d, x + 2, y + 15, 13, 1)
    # ── sitting body: a CRISP loaf haunch + an upright chest (one clean mass) ──
    # the haunch (a rounded loaf at the base), fully outlined so the silhouette
    # reads at 1x; the upright chest tucked on top, sharing the outline.
    d.ellipse([x + 3, y + 8, x + 15, y + 16], fill=fur, outline=OUTLINE)   # haunch
    d.polygon([(x + 5, y + 6), (x + 11, y + 6), (x + 12, y + 13),
               (x + 4, y + 13)], fill=fur, outline=OUTLINE)               # upright chest
    fill(d, x + 5, y + 7, 6, 6, fur)                     # re-fill the seam clean
    vline(d, x + 5, y + 7, 6, fur_hi)                    # lit chest edge (a soft rim)
    dither(d, x + 9, y + 9, 3, 5, fur_sh, phase=1)       # a small belly shade (right)
    hx = x + 4
    if frame_i == 2:
        # head tipped UP toward the steam, one front paw raised to the mouth (lick)
        d.ellipse([hx, y - 1, hx + 8, y + 7], fill=fur, outline=OUTLINE)   # head up
        _cat_ear(d, hx + 1, y - 2, fur, +1)
        _cat_ear(d, hx + 7, y - 2, fur, -1)
        # eyes looking up (a clean dark socket under each gold catch-light)
        d.point((hx + 2, y + 1), fill=PAL["gold_light"][1])
        d.point((hx + 6, y + 1), fill=PAL["gold_light"][1])
        d.point((hx + 4, y + 3), fill=PAL["wood_dark"][3])   # muzzle/nose
        # the raised paw at the mouth (the lick)
        fill(d, hx + 2, y + 4, 2, 3, fur_hi)
        frame(d, hx + 2, y + 4, 2, 3, OUTLINE)
        d.point((hx + 2, y + 3), fill=PAL["white"][1])   # tongue tip on the paw
    else:
        d.ellipse([hx, y, hx + 8, y + 8], fill=fur, outline=OUTLINE)       # head
        _cat_ear(d, hx + 1, y - 1, fur, +1)
        _cat_ear(d, hx + 7, y - 1, fur, -1)
        dither(d, hx + 5, y + 2, 3, 5, fur_sh, phase=0)  # cheek shade (right)
        # warm eyes (a 1px dark rim under each so they read as eyes, not specks)
        d.point((hx + 2, y + 3), fill=PAL["gold_light"][1])
        d.point((hx + 6, y + 3), fill=PAL["gold_light"][1])
        d.point((hx + 2, y + 4), fill=PAL["wood_dark"][3])
        d.point((hx + 6, y + 4), fill=PAL["wood_dark"][3])
        d.point((hx + 4, y + 5), fill=PAL["wood_dark"][3])   # nose/muzzle
        # two front legs planted, a clean gap between them (reads as a sitting cat)
        vline(d, x + 6, y + 13, 3, fur)
        vline(d, x + 7, y + 13, 3, fur_sh)
        vline(d, x + 10, y + 13, 3, fur)
        vline(d, x + 11, y + 13, 3, fur_sh)
        hline(d, x + 6, y + 15, 6, OUTLINE)              # the paws' ground line
    # the tail: curled-right in frame 0/2, FLICKED up-right in frame 1 — drawn 2px
    # thick with a lit edge so it reads as a tail, not a stray line, at 1x.
    if frame_i == 1:
        d.line([x + 13, y + 13, x + 17, y + 5], fill=fur)     # tail flicked up-right
        d.line([x + 14, y + 13, x + 18, y + 5], fill=fur_sh)
        d.line([x + 17, y + 5, x + 15, y + 1], fill=fur)
        d.point((x + 15, y + 1), fill=fur_hi)                 # the tip
    else:
        d.line([x + 13, y + 14, x + 16, y + 8], fill=fur)     # tail curled at the side
        d.line([x + 14, y + 14, x + 17, y + 8], fill=fur_sh)
        d.line([x + 16, y + 8, x + 14, y + 4], fill=fur)
        d.point((x + 14, y + 4), fill=fur_hi)                 # the tip


def _cat_ear(d, tipx: int, tipy: int, fur, sgn: int) -> None:
    """One triangular cat ear, apex at (tipx,tipy), base 3px down. Internal."""
    d.polygon([(tipx, tipy), (tipx - 2 * sgn, tipy + 3), (tipx + sgn, tipy + 3)],
              fill=fur, outline=OUTLINE)
    d.point((tipx - sgn, tipy + 2), fill=PAL["neon_pink"][2])  # inner-ear pink fleck


# ── Hand props (close-ups + outro) ───────────────────────────────────────────

def paper_bag(d, x: int, y: int, w: int = 30, h: int = 34, stamped: bool = True) -> None:
    """Oil-stained kraft 호떡 봉지 (paper bag), market ink-stamps on it.

    A crumpled brown paper bag, translucent oil blotches, optional ink stamps.
    (x,y)=top-left of the bag bbox. Consumers: cosmetic-frame-hotteokbag, outro
    (the wrapped 호떡).
    """
    paper, paper_hi, paper_sh = PAL["white"][1], PAL["white"][0], PAL["wood_light"][2]
    oil = PAL["ember"][1]
    drop_shadow(d, x, y + h - 1, w, 2)
    # the bag body, slightly tapering toward the crumpled neck (reads as a bag,
    # not a box): wider at the base, pinched at the folded top.
    neck = 5                                              # how far the top pinches in
    d.polygon([(x + neck, y + 6), (x + w - neck, y + 6), (x + w, y + 12),
               (x + w, y + h), (x, y + h), (x, y + 12)],
              fill=paper, outline=OUTLINE)
    # the crumpled, rolled-over top lip (a darker folded band with serrations)
    fill(d, x + neck, y + 4, w - 2 * neck, 4, paper_sh)
    for sx in range(x + neck, x + w - neck, 3):
        d.polygon([(sx, y + 4), (sx + 1, y + 1), (sx + 3, y + 4)], fill=paper_hi)
    hline(d, x + neck, y + 7, w - 2 * neck, OUTLINE)      # crease under the fold
    vline(d, x, y + 12, h - 12, paper_hi)                # lit left face
    dither(d, x + w - 8, y + 13, 8, h - 14, paper_sh, phase=0)  # shaded right face
    # two long vertical creases so the kraft paper reads as a standing bag
    vline(d, x + w // 3, y + 9, h - 11, paper_sh)
    vline(d, x + 2 * w // 3, y + 9, h - 11, paper_sh)
    # translucent oil blotches (the 호떡 grease, dithered ember) low + warm
    dither(d, x + 4, y + h - 13, 9, 8, oil, phase=0)
    dither(d, x + w - 13, y + 13, 7, 7, oil, phase=1)
    if stamped:
        # two market ink-stamps: a griddle ring + a spatula tick (no text)
        d.ellipse([x + 4, y + 11, x + 12, y + 17], outline=PAL["tteok"][2])
        d.point((x + 8, y + 14), fill=PAL["tteok"][2])
        d.line([x + w - 11, y + h - 11, x + w - 5, y + h - 16], fill=PAL["ink"][1])
        hline(d, x + w - 12, y + h - 10, 6, PAL["ink"][1])


def backpack(d, x: int, y: int, w: int = 34, h: int = 32) -> None:
    """The "kidnapped" backpack tucked under the counter (the Chekhov hostage).

    A slumped daypack, a tteok-red zipper pull, side pocket. (x,y)=top-left.
    Consumers: room-01-hotteok, obj-backpack.
    """
    body, body_hi, body_sh = PAL["wood_dark"][2], PAL["wood_dark"][1], PAL["wood_dark"][3]
    zip_c = PAL["tteok"][1]
    cx = x + w // 2
    drop_shadow(d, x + 1, y + h - 1, w - 2, 2)
    # two shoulder straps looping over the top FIRST (so the body overlaps them)
    for ox in (-7, 7):
        d.arc([cx + ox - 5, y - 2, cx + ox + 5, y + 16], 180, 360, fill=PAL["ink"][1])
        d.arc([cx + ox - 5, y - 1, cx + ox + 5, y + 16], 180, 360, fill=PAL["ink"][2])
    # the slumped main body (a soft rounded daypack)
    d.ellipse([x, y + 5, x + w, y + h], fill=body, outline=OUTLINE)
    fill(d, x + 2, y + 8, w - 4, h - 11, body)
    hline(d, x + 5, y + 8, w - 10, body_hi)              # top sheen
    dither(d, x + w - 12, y + 12, 10, h - 16, body_sh, phase=0)  # shaded right
    # the top LID flap (a separate panel with its own seam = clear backpack read)
    d.pieslice([x + 3, y + 4, x + w - 3, y + 22], 180, 360, fill=body)
    d.arc([x + 3, y + 4, x + w - 3, y + 22], 180, 360, fill=OUTLINE)
    hline(d, x + 5, y + 13, w - 10, body_sh)             # lid bottom seam
    # the main zipper curving under the lid, red pull tab at the centre
    for zx in range(x + 6, x + w - 6, 2):
        zy = y + 14 + int(3 * (1 - abs((zx - cx) / (w / 2))))
        d.point((zx, zy), fill=PAL["ink"][2])
    fill(d, cx - 1, y + 16, 2, 3, zip_c)                 # zipper pull tab (red)
    d.point((cx, y + 19), fill=PAL["tteok"][0])
    # a front pocket panel with its own zip pull
    fill(d, cx - 6, y + 21, 12, 9, body)
    d.arc([cx - 6, y + 18, cx + 6, y + 30], 180, 360, fill=body_sh)  # pocket seam
    frame(d, cx - 6, y + 21, 12, 9, body_sh)
    fill(d, cx - 1, y + 22, 2, 2, zip_c)                 # pocket zip pull
    frame(d, x + 1, y + 5, w - 2, h - 5, OUTLINE)


# ── Shutter (the diegetic clock, L3-c) ───────────────────────────────────────

def shutter(d, x: int, y: int, w: int = 32, h: int = 40, state: str = "up") -> None:
    """Metal roll-down shutter, 2 states (up / half-down). The diegetic clock.

    state "up" = a thin rolled-up drum at the top, the stall open beneath;
    "half" = the corrugated curtain pulled a palm down, ribs catching light, a
    dark gap of closed stall below. (x,y)=top-left of the shutter opening.
    Consumers: the diegetic clock of all 4 zones (state B). The griddle never
    gets one (L3-c).
    """
    metal, metal_hi, metal_sh = PAL["metal"][2], PAL["metal"][1], PAL["metal"][3]
    # the side guide rails
    vline(d, x, y, h, metal_sh)
    vline(d, x + w - 1, y, h, metal_sh)
    if state == "up":
        # a rolled drum at the very top, stall open below
        fill(d, x, y, w, 6, metal)
        hline(d, x, y, w, metal_hi)
        for rx in range(x + 2, x + w - 2, 3):
            vline(d, rx, y + 1, 4, metal_sh)             # roll ribs
        d.ellipse([x, y, x + 6, y + 6], fill=metal, outline=OUTLINE)  # drum end
        d.ellipse([x + w - 6, y, x + w, y + 6], fill=metal, outline=OUTLINE)
        frame(d, x, y, w, 6, OUTLINE)
    else:
        # half-down: a small drum + the corrugated curtain pulled ~60% down
        fill(d, x, y, w, 4, metal_sh)                    # the thin remaining drum
        cur_h = int(h * 0.6)
        fill(d, x, y + 4, w, cur_h, metal)
        # horizontal corrugation ribs catching light
        for ry in range(y + 5, y + 4 + cur_h, 3):
            hline(d, x + 1, ry, w - 2, metal_hi)
            hline(d, x + 1, ry + 1, w - 2, metal_sh)
        # a pull-handle slot bar at the curtain's bottom edge
        fill(d, x + 1, y + 3 + cur_h, w - 2, 2, metal_sh)
        hline(d, x + 1, y + 3 + cur_h, w - 2, PAL["ink"][2])
        frame(d, x, y, w, cur_h + 5, OUTLINE)
        # the dark closed stall in the gap below the half-curtain
        fill(d, x + 1, y + cur_h + 5, w - 2, h - cur_h - 5, PAL["asphalt"][2])
