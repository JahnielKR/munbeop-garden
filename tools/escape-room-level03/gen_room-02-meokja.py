#!/usr/bin/env python3
"""room-02-meokja.png (320x240, OPAQUE) — Zona 2 · 먹자골목 (하나's bunsik alley).

§6 Zona 2 spec: the loudest, most crammed alley, seen on a slight fuga diagonal.
Center-left: 하나's 분식 bar — 떡볶이 red bubbling (the most saturated red of the
scene), 어묵 in broth, 김밥 on a tray, two warm-white steam columns. 하나 behind
the bar serving. A neon menu-cartel (illegible, L3-a) hanging over the bar. Right
and background: more stalls in fuga, cyan/green neon, stacked boxes, a delivery
moto hint. Floor: wet asphalt with red/green puddles. Foreground: empty orange
plastic stools.

Hotspots (from the seed, 320x240 space):
  hana       [65,95,65,80]   slot-2  (하나 + her bar)
  tteokbokki [95,180,40,28]  cosmetic (the 떡볶이 pot, foreground)
  eomuk      [145,185,35,25] cosmetic (어묵 in broth, foreground)
  stools     [15,185,45,30]  cosmetic (orange plastic stools)

Art bible: tools/escape-room-level03/STYLE.md (L3-a..e). Uses ONLY common.py
builders + helpers (FROZEN). Cold neon alley + wet asphalt outside, the warm
griddle/bar amber inside (here the warmth is the red 떡볶이 + the bare bulb).

Deterministic: no unseeded random (every scatter uses an explicit seed).
Run from repo root:  python tools/escape-room-level03/gen_room-02-meokja.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, NEON_REFLECT, fill, frame, hline, vline, dither

W, H = 320, 240

HOTSPOTS = [
    (65, 95, 65, 80),     # hana  -> slot-2
    (95, 180, 40, 28),    # tteokbokki -> cosmetic
    (145, 185, 35, 25),   # eomuk -> cosmetic
    (15, 185, 45, 30),    # stools -> cosmetic
]


# ── Background: the cold wet alley receding into neon ─────────────────────────

def paint_backdrop(d) -> None:
    """Asphalt night sky -> alley of neon signs in fuga -> wet asphalt floor."""
    # the deep night-violet base (top = darkest sky, fades toward the alley glow)
    fill(d, 0, 0, W, H, PAL["asphalt"][3])
    fill(d, 0, 0, W, 70, PAL["asphalt"][3])
    dither(d, 0, 60, W, 24, PAL["asphalt"][2], phase=0)   # band toward the signs
    # the market receding: a dense wall of illegible neon signs up high, getting
    # smaller/dimmer toward the top (depth). Kept to the upper band so the stall
    # awning below it can breathe (the alley is LONG, not a full-height barcode).
    C.neon_alley(d, 6, 4, 308, 54, lit_cols=99, seed=42)
    # the alley also continues on the LEFT edge: one dim stall mouth + a small
    # neon strip, so 하나's stall isn't an island in a void (the market is FULL).
    fill(d, 0, 96, 30, 54, PAL["asphalt"][2])
    dither(d, 0, 96, 30, 54, PAL["asphalt"][3], phase=0)
    fill(d, 0, 92, 32, 6, PAL["wood_dark"][2])            # a sliver of next awning
    hline(d, 0, 92, 32, PAL["wood_dark"][1])
    C.neon_sign(d, 2, 100, 24, 13, color="green", lit=True)
    # a diagonal of fuga on the RIGHT: more stalls stacking toward a vanishing
    # point, drawn as receding warm-roof slabs + cool neon strips (the alley turns)
    _fuga_right(d)
    # the wet asphalt floor begins ~y=150 (under the bar); a darker pooled fore.
    fill(d, 0, 150, W, H - 150, PAL["asphalt"][2])
    dither(d, 0, 150, W, 16, PAL["asphalt"][3], phase=1)  # transition into the wet
    fill(d, 0, 196, W, H - 196, PAL["asphalt"][3])        # the deep foreground pool


def _fuga_right(d) -> None:
    """The alley turning away on the right: receding stall roofs + neon strips."""
    # three receding stall blocks, smaller and dimmer toward the vanishing point
    blocks = [
        (228, 86, 92, 30, "cyan"),
        (250, 112, 70, 24, "green"),
        (270, 132, 50, 18, "pink"),
    ]
    for (bx, by, bw, bh, col) in blocks:
        # a warm dim roof slab (the next awning) over a dark stall mouth
        fill(d, bx, by, bw, 6, PAL["wood_dark"][2])
        hline(d, bx, by, bw, PAL["wood_dark"][1])
        fill(d, bx, by + 6, bw, bh - 6, PAL["asphalt"][2])
        dither(d, bx, by + 6, bw, bh - 6, PAL["asphalt"][3], phase=0)
        # a small neon strip under each roof (illegible)
        C.neon_sign(d, bx + 4, by + 8, min(bw - 8, 24), 11, color=col, lit=True)
        # a couple of customer silhouettes passing as shadows
        for sx in range(bx + 6, bx + bw - 6, 18):
            d.ellipse([sx, by + bh - 8, sx + 4, by + bh - 2], fill=PAL["asphalt"][3])
    # stacked delivery boxes + a parked moto hint at the alley mouth (right-low)
    bx = 286
    for i, (by, bw) in enumerate(((150, 30), (162, 26), (174, 22))):
        fill(d, bx, by, bw, 12, PAL["wood_light"][2])
        frame(d, bx, by, bw, 12, OUTLINE)
        hline(d, bx, by + 6, bw, PAL["wood_dark"][1])
        dither(d, bx + bw - 8, by + 1, 8, 10, PAL["wood_dark"][2], phase=0)
    # the delivery moto: a dark wheel + a fender hint poking in from the edge
    d.ellipse([300, 206, 318, 224], fill=PAL["ink"][2], outline=OUTLINE)
    d.ellipse([305, 211, 313, 219], fill=PAL["metal"][3])
    fill(d, 296, 198, 24, 6, PAL["ink"][1])               # moto body bar
    hline(d, 296, 198, 24, PAL["metal"][3])


# ── The neon menu-cartel hanging over 하나's bar (illegible, L3-a) ────────────

def paint_menu_sign(d) -> None:
    """An illegible neon menu-cartel hung INSIDE the stall opening, over the bar.

    Sits in the dark stall mouth (just below the awning, above 하나's head) so it
    reads as 하나's own menu board, not part of the far alley wall. Hangs at y~94,
    clear of the bulb (upper-right) and tucked above her head (~y108).
    """
    sx, sy, sw, sh = 46, 94, 60, 13
    # two short hanging chains up to the awning underside
    for cx in (sx + 8, sx + sw - 8):
        vline(d, cx, sy - 4, 4, PAL["metal"][3])
        vline(d, cx + 1, sy - 4, 4, PAL["ink"][2])
    # the board housing (dark, so the neon pops off it)
    fill(d, sx - 2, sy - 2, sw + 4, sh + 4, PAL["ink"][2])
    frame(d, sx - 2, sy - 2, sw + 4, sh + 4, OUTLINE)
    # the neon menu itself: two clusters of suggested-hangul strokes, cyan + pink
    C.neon_sign(d, sx + 1, sy, 28, sh, color="cyan", lit=True)
    C.neon_sign(d, sx + 31, sy, 28, sh, color="pink", lit=True)


# ── 하나's stall: the protagonist island ─────────────────────────────────────

def paint_stall(d) -> None:
    """The warm island chassis (awning + counter + bulb) 하나 works behind.

    The stall interior is filled with a dim warm back panel + hanging utensils so
    it reads as a working stall, not a black void. Drawn BEFORE market_stall so the
    awning/posts/counter frame it.
    """
    sx, sy, sw, sh = 36, 80, 104, 86
    # a dim warm back wall inside the stall mouth (lit faintly by the bulb)
    fill(d, sx + 3, sy + 12, sw - 6, sh - 28, PAL["wood_dark"][3])
    dither(d, sx + 3, sy + 12, sw - 6, sh - 28, PAL["asphalt"][2], phase=0)
    # a back rail with hanging ladles / strainers (warm metal, illegible clutter)
    rail_y = sy + 16
    hline(d, sx + 8, rail_y, sw - 16, PAL["wood_dark"][1])
    for i, hx in enumerate(range(sx + 14, sx + sw - 14, 16)):
        vline(d, hx, rail_y, 3, PAL["metal"][3])              # hook
        if i % 2 == 0:                                        # a ladle
            d.ellipse([hx - 3, rail_y + 3, hx + 3, rail_y + 8], outline=PAL["metal"][2])
            vline(d, hx, rail_y + 8, 5, PAL["metal"][3])
        else:                                                 # a strainer/spatula
            fill(d, hx - 2, rail_y + 3, 4, 5, PAL["metal"][3])
            frame(d, hx - 2, rail_y + 3, 4, 5, PAL["metal"][2])
            vline(d, hx, rail_y + 8, 5, PAL["wood_dark"][2])
    # the chassis on top (awning, posts, counter, bare bulb upper-right)
    C.market_stall(d, sx, sy, w=sw, h=sh, awning="stripe", bulb=True)


def paint_bar(d) -> None:
    """하나's 분식 bar in the FOREGROUND: 떡볶이 / 어묵 / 김밥 on the counter edge.

    bunsik_bar internals: 떡볶이 pan center ~= x+15, 어묵 broth center ~= x+41.
    With x=113: 떡볶이 center=128 (in tteokbokki box 95-135) and 어묵 center=154
    (in eomuk box 145-180) — both cosmetic hotspots land on their prop.
    """
    # a foreground counter shelf the hot pots sit on (the front of 하나's stall)
    fill(d, 84, 178, 134, 30, PAL["wood_dark"][2])
    hline(d, 84, 178, 134, PAL["wood_light"][2])
    C.wood_planks(d, 84, 180, 134, 26, PAL["wood_dark"], plank_h=8, seam_every=2)
    frame(d, 84, 178, 134, 30, OUTLINE)
    fill(d, 84, 206, 134, 2, PAL["wood_dark"][3])         # counter lip shadow
    # the bunsik bar sits ON the shelf; its top surface at y=176 so the pans
    # (which sit a few px below the top) land on the cosmetic hotspot centers.
    C.bunsik_bar(d, 113, 176, w=82, h=26)


# ── Foreground: orange plastic stools + wet reflections ──────────────────────

def paint_stools(d) -> None:
    """Two empty orange plastic stools, lower-left (the stools hotspot 15..60)."""
    for (ox, oy) in ((18, 196), (40, 202)):
        _stool(d, ox, oy)


def _stool(d, x: int, y: int) -> None:
    """One stacking orange plastic stool: a round seat + four splayed legs."""
    seat, seat_hi, seat_sh = PAL["ember"][2], PAL["ember"][1], PAL["ember"][3]
    C.drop_shadow(d, x - 1, y + 14, 22, 2, cool=True)
    # the round seat top
    d.ellipse([x, y, x + 20, y + 8], fill=seat, outline=OUTLINE)
    d.ellipse([x + 2, y + 1, x + 18, y + 5], fill=seat_hi)   # lit top
    dither(d, x + 11, y + 3, 8, 4, seat_sh, phase=0)         # shaded right
    hline(d, x + 3, y + 6, 14, seat_sh)                      # rim under-shadow
    # the four splayed legs
    for (lx, ll) in ((x + 2, 11), (x + 6, 13), (x + 13, 13), (x + 17, 11)):
        vline(d, lx, y + 6, ll, seat)
        vline(d, lx + 1, y + 6, ll, seat_sh)
    # a cross-brace low between the legs (the stacking ridge)
    hline(d, x + 4, y + 14, 13, seat_sh)


def paint_wet(d) -> None:
    """The wet asphalt foreground returning the neon split + trembling (L3 floor).

    Red from 하나's 떡볶이 and the alley's cyan/green, smeared down the wet street.
    """
    # under the bar: the RED of the 떡볶이 bleeding down (the scene's signature)
    C.wet_reflect(d, 96, 208, 56, 30, color="pink", seed=5)   # pink ~ the warm red
    _red_puddle(d, 100, 210, 50, 24)
    # the cyan/green of the alley reflected lower-left and lower-right
    C.wet_reflect(d, 4, 210, 60, 28, color="cyan", seed=9)
    C.wet_reflect(d, 220, 210, 70, 30, color="green", seed=13)
    # a few bright glints where the bulb hits the still water
    for (gx, gy) in ((130, 220), (60, 226), (250, 222)):
        d.point((gx, gy), fill=PAL["gold_light"][1])
        d.point((gx + 1, gy + 1), fill=PAL["ember"][1])


def _red_puddle(d, x: int, y: int, w: int, h: int) -> None:
    """A warm-red puddle (the 떡볶이's red split in the asphalt), tteok ramp."""
    r = __import__("random").Random(77)
    for yy in range(y, y + h):
        t = (yy - y) / max(h - 1, 1)
        c = PAL["tteok"][1] if t < 0.3 else (PAL["tteok"][2] if t < 0.65 else PAL["tteok"][3])
        for _ in range(2):
            xx = r.randint(x, x + w - 1)
            if (xx + yy) % 3 != 0:
                d.point((xx, yy), fill=c)


# ── 하나 behind the bar ───────────────────────────────────────────────────────

def paint_hana(d) -> None:
    """하나 standing behind her bar, leaning to serve (the slot-2 figure).

    hana(serve) is ~22x52, top-left anchored; she reaches LEFT with a ladle. Her
    hotspot is [65,95,65,80] (center ~97,135). Place her torso/head centered in
    that rect: top-left x so her body column (cx=x+11) sits ~ x=95.
    """
    C.hana(d, 84, 100, pose="serve")


# ── Atmosphere passes ────────────────────────────────────────────────────────

def paint_steam(d) -> None:
    """Extra warm-white steam columns rising off the bar (bunsik_bar has its own;
    add taller wisps over the 떡볶이 + 어묵 so the bar reads as STEAMING)."""
    C.steam(d, 128, 176, height=22, phase=0, warm=False)   # over 떡볶이
    C.steam(d, 154, 178, height=18, phase=4, warm=False)   # over 어묵
    C.steam(d, 140, 174, height=20, phase=2, warm=True)


def paint_passers(d) -> None:
    """Customer silhouettes passing in the mid-ground alley (cold neon rim-light).

    Person-shaped (small head + sloped shoulders + a tapering coat), shorter than
    a post; placed in the dark gap right of 하나's stall where the alley continues.
    A faint neon edge picks them out of the asphalt so they read as people moving.
    """
    for (sx, by, sh, rim) in ((164, 168, 40, "cyan"), (192, 172, 36, "green"),
                              (210, 166, 44, "pink")):
        cx = sx + 5
        ty = by - sh
        # small head
        d.ellipse([cx - 4, ty, cx + 4, ty + 8], fill=PAL["asphalt"][2])
        # sloped shoulders -> a coat that widens toward the hem (a person, not a bar)
        d.polygon([(cx - 5, ty + 8), (cx + 5, ty + 8), (cx + 7, by), (cx - 7, by)],
                  fill=PAL["asphalt"][2])
        dither(d, cx - 6, ty + 12, 12, sh - 14, PAL["asphalt"][3], phase=0)
        # a faint cold neon rim-light down one shoulder edge (alley light, short)
        for yy in range(ty + 9, ty + sh - 6):
            d.point((cx + 6, yy), fill=PAL["neon_" + rim][3])


# ── Compose ──────────────────────────────────────────────────────────────────

def build() -> "C.Image.Image":
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][3])
    paint_backdrop(d)
    paint_passers(d)
    paint_stall(d)
    paint_menu_sign(d)   # after the stall back wall so it hangs IN the mouth
    paint_hana(d)
    paint_bar(d)
    paint_stools(d)
    paint_steam(d)
    paint_wet(d)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "rooms", "room-02-meokja.png")
    C.preview(img, "preview_room-02-meokja.png", scale=3)
    C.hotspot_debug(img, HOTSPOTS, "hotspot_room-02-meokja.png", scale=3)


if __name__ == "__main__":
    main()
