#!/usr/bin/env python3
"""room-03-manmulsang (320x240, opaque) — Zona 3 만물상 골목, estado A.

§6 spec: the most cluttered, most intimate corner of the level — a 만물상
(thousand-things bazaar) under ONE flickering YELLOW BULB (the warm key here,
NOT a griddle). Back wall papered with hanging merchandise (manmulsang_wall).
A glass-counter display crowded with TWO OPPOSED GROUPS the bargaining will
compare (left = pricier/showier, right = humbler) — the comparison shown by
size/brightness, never by written prices (L3-a). The bazaar vendor (secondary,
capped, nameless) dozing on a stool at the right. Less neon than the other
zones: dirty-yellow bulb dominates; the alley's COLD leaks in ONLY at the left
edge.

Hotspots (STYLE.md seed table, 320x240 space):
  counter [105,95,80,50] slot-3 · gift [120,155,55,38] slot-4 ·
  merch [15,25,80,45] cosmetic · vendor [240,120,35,60] cosmetic ·
  bulb-flicker [150,22,22,24] cosmetic.

Only common.py builders/helpers (FROZEN). Deterministic: no unseeded random.
Render -> Read the 3x preview -> critique vs STYLE.md -> iterate (>=3 rounds).
"""

from __future__ import annotations

import random

import common as C
from common import OUTLINE, PAL, NEON_REFLECT

W, H = 320, 240

# Hotspot rects [x, y, w, h] — verbatim from STYLE.md (seed-derived).
HOTSPOTS = [
    (105, 95, 80, 50),    # counter  (slot-3, the two opposed groups)
    (120, 155, 55, 38),   # gift     (slot-4, the wrapped gift on the counter)
    (15, 25, 80, 45),     # merch    (cosmetic, hanging merchandise wall)
    (240, 120, 35, 60),   # vendor   (cosmetic, dozing bazaar owner)
    (150, 22, 22, 24),    # bulb     (cosmetic, the flickering yellow bulb)
]


def _dither_ellipse(d, bbox, c, phase=0):
    """A filled ellipse painted with a checkerboard so its edge breaks up.

    Used for the bulb's warm pool (a soft dithered glow, never a hard ring).
    bbox = [x0, y0, x1, y1]; every other pixel inside the ellipse gets `c`.
    """
    x0, y0, x1, y1 = bbox
    rx, ry = (x1 - x0) / 2.0, (y1 - y0) / 2.0
    ecx, ecy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    for yy in range(int(y0), int(y1) + 1):
        for xx in range(int(x0), int(x1) + 1):
            if ((xx + yy + phase) % 2) != 0:
                continue
            nx, ny = (xx - ecx) / max(rx, 1), (yy - ecy) / max(ry, 1)
            if nx * nx + ny * ny <= 1.0:
                d.point((xx, yy), fill=c)


def bg_alley(d):
    """Wet-asphalt night base; cold neon only leaks in at the LEFT edge (§6)."""
    # warm dim ceiling/upper haze of the bazaar interior (the bulb's domain)
    fill(d, 0, 0, W, 96, PAL["wood_dark"][3])
    C.dither(d, 0, 0, W, 96, PAL["asphalt"][2], phase=0)   # break the flat field
    # asphalt floor under the counter run
    fill(d, 0, 96, W, H - 96, PAL["asphalt"][1])
    C.dither(d, 0, 150, W, H - 150, PAL["asphalt"][2], phase=1)
    fill(d, 0, H - 26, W, 26, PAL["asphalt"][2])
    C.dither(d, 0, H - 26, W, 26, PAL["asphalt"][3], phase=0)


def cold_left_edge(d):
    """The alley's cold neon bleeding in only at the left border of the frame."""
    # a couple of dim receding signs deep on the left, mostly cyan/green (cold)
    C.neon_sign(d, 4, 40, 16, 11, color="cyan", lit=True)
    C.neon_sign(d, 6, 64, 14, 10, color="green", lit=True)
    # a cold vertical wash down the extreme-left gutter (asphalt + dull neon)
    for yy in range(96, H):
        if yy % 3 != 0:
            d.point((0, yy), fill=PAL["neon_cyan"][3])
        if yy % 4 == 0:
            d.point((1, yy), fill=PAL["asphalt"][0])
    # the wet reflection of that cold edge in the lower-left asphalt
    C.wet_reflect(d, 1, 168, 26, 60, color="cyan", seed=5)


def yellow_bulb(d, cx, cy):
    """The single flickering bare yellow bulb — the warm KEY of this scene (§6).

    A wide warm pool on the ceiling/wall, then the cord, then the glass bulb.
    Built from gold_light/ember only (the dirty-yellow bazaar light).
    """
    # warm pool: a SMALL gold-dominant dithered glow (a dirty-yellow bulb, NOT a
    # fireball) — kept tight so the merch wall still reads behind it. gold_light
    # dominates; only a thin ember rim. Dithered edges break into the wood.
    rings = [(20, PAL["ember"][3]), (15, PAL["gold_light"][2]),
             (9, PAL["gold_light"][1])]
    for rr, c in rings:
        bb = [cx - rr - 3, cy + 4 - rr, cx + rr + 3, cy + 4 + rr]
        _dither_ellipse(d, bb, c, phase=(rr % 2))
    # cord from the ceiling
    C.vline(d, cx, 0, cy - 5, PAL["ink"][2])
    C.vline(d, cx + 1, 0, cy - 5, PAL["ink"][1])
    # a little tin shade cap over the bulb
    d.polygon([(cx - 7, cy - 4), (cx + 8, cy - 4), (cx + 5, cy - 1),
               (cx - 4, cy - 1)], fill=PAL["metal"][3], outline=OUTLINE)
    C.hline(d, cx - 6, cy - 4, 13, PAL["metal"][2])
    # the glass bulb hanging just under the cap (bright solid core, small)
    C.glow(d, cx, cy + 3, 6, [PAL["ember"][1], PAL["gold_light"][1],
                              PAL["gold_light"][0]])
    d.ellipse([cx - 3, cy, cx + 3, cy + 7], fill=PAL["gold_light"][0],
              outline=PAL["ember"][2])
    d.point((cx, cy + 2), fill=PAL["white"][0])            # filament glint


def hanging_clutter(d):
    """The merchandise wall (manmulsang_wall) high across the back + a few more
    goods strung lower so the bazaar reads as packed top-to-bottom (>=12 props).
    The cosmetic 'merch' hotspot [15,25,80,45] lands on the dense left run."""
    # ONE continuous goods wall across nearly the full width (no floating gap),
    # tucked behind the warm bulb pool — the bazaar's "없는 게 없어요" clutter.
    C.manmulsang_wall(d, 6, 14, 308, 54, seed=21)
    # a second, lower hung row staggered between the first (depth + density)
    for i, hx in enumerate(range(20, 300, 22)):
        C.vline(d, hx, 68, 4, PAL["ink"][2])              # short hook strings
        gy = 72
        kind = (i + hx) % 4
        if kind == 0:
            d.ellipse([hx - 3, gy, hx + 3, gy + 6], fill=PAL["wood_light"][2],
                      outline=PAL["wood_dark"][3])         # a little hung pouch
        elif kind == 1:
            fill(d, hx - 1, gy, 3, 7, PAL["tteok"][2])     # a hung red trinket
            d.point((hx, gy), fill=PAL["tteok"][1])
        elif kind == 2:
            d.line([hx - 2, gy, hx + 2, gy], fill=PAL["metal"][2])  # a hung ring
            d.ellipse([hx - 2, gy, hx + 2, gy + 4], outline=PAL["gold_light"][2])
        else:
            for k in range(3):                             # a small hung brush
                C.vline(d, hx - 1 + k, gy, 6, PAL["wood_dark"][1])


def counter_run(d):
    """The crowded glass-counter display (the bargaining stage) + its wood base.

    Two opposed groups face each other on top of the counter, inside the slot-3
    rect [105,95,80,50]: LEFT = pricier/showier (taller, brighter, a glint),
    RIGHT = humbler (smaller, duller). The comparison is shown by size/brightness
    only — no written price (L3-a)."""
    cy = 110                                               # counter top surface y
    # the wood counter slab spanning the frame
    C.wood_planks(d, 0, cy, W, H - cy - 4, PAL["wood_light"], plank_h=7,
                  seam_every=2)
    C.hline(d, 0, cy, W, PAL["wood_light"][0])             # lit front lip
    fill(d, 0, cy + 2, W, 2, PAL["wood_dark"][3])
    # a glass display band set into the counter front (the vitrina)
    gy = cy + 8
    fill(d, 18, gy, W - 36, 30, PAL["asphalt"][1])         # dark glass interior
    C.frame(d, 18, gy, W - 36, 30, PAL["wood_dark"][3])
    for gx in range(26, W - 26, 30):                       # muntins of the case
        C.vline(d, gx, gy + 1, 28, PAL["wood_dark"][2])
    C.hline(d, 20, gy + 1, W - 40, PAL["metal"][1])        # glass top reflection
    # faint goods glinting behind the glass (small, no labels)
    r = random.Random(91)
    for gx in range(24, W - 28, 12):
        c = [PAL["gold_light"][2], PAL["metal"][1], PAL["tteok"][2],
             PAL["neon_cyan"][3]][r.randint(0, 3)]
        d.point((gx, gy + 8 + r.randint(0, 18)), fill=c)
    C.frame(d, 0, cy, W, H - cy - 4, OUTLINE)

    # ── the TWO OPPOSED GROUPS on the counter top, inside [105,95,80,50] ──
    # LEFT group (pricier / showier): a tall lacquered box, brighter, a glint
    bx = 112
    C.drop_shadow(d, bx, 134, 24, 2)
    fill(d, bx, 108, 22, 26, PAL["tteok"][2])              # deep red lacquer body
    fill(d, bx + 1, 109, 20, 7, PAL["tteok"][1])           # lit lid band
    C.hline(d, bx + 1, 109, 20, PAL["tteok"][0])
    C.dither(d, bx + 14, 116, 7, 16, PAL["tteok"][3], phase=0)  # shaded right
    d.point((bx + 4, 111), fill=PAL["gold_light"][0])      # a showy gold glint
    d.point((bx + 5, 112), fill=PAL["white"][0])
    fill(d, bx + 8, 118, 6, 3, PAL["gold_light"][2])       # a gilt clasp
    C.frame(d, bx, 108, 22, 26, OUTLINE)
    # RIGHT group (humbler): a small plain pouch, lower, duller, no glint
    px = 150
    C.drop_shadow(d, px, 134, 16, 2)
    d.ellipse([px, 120, px + 16, 134], fill=PAL["wood_light"][2],
              outline=OUTLINE)                             # soft cloth pouch
    fill(d, px + 4, 116, 8, 7, PAL["wood_light"][1])       # pinched neck
    C.vline(d, px + 4, 116, 7, PAL["wood_dark"][1])
    d.line([px + 4, 116, px + 12, 116], fill=PAL["wood_dark"][2])  # drawstring
    C.dither(d, px + 9, 124, 6, 8, PAL["wood_dark"][2], phase=0)   # shaded side

    # ── counter-top clutter FLANKING the two groups (outside the slot-3 rect
    #    x105..185, and clear of the gift x120..175 + vendor x240..275) ──
    _counter_goods(d)


def _counter_goods(d):
    """Small bric-a-brac standing on the counter top to either side of the
    bargaining display — the bazaar overflows (>=12 props). All clear of the
    interactive rects (slot-3 / gift / vendor)."""
    # LEFT cluster (x ~30..96): a stacked tin, two bottles, a small bowl
    C.drop_shadow(d, 30, 110, 60, 2)
    fill(d, 34, 96, 12, 14, PAL["metal"][2])               # a tin can
    C.hline(d, 34, 96, 12, PAL["metal"][1])
    C.dither(d, 41, 99, 5, 10, PAL["metal"][3], phase=0)
    C.frame(d, 34, 96, 12, 14, OUTLINE)
    for i, vx in enumerate((52, 60)):                      # two little bottles
        fill(d, vx, 98, 5, 12, PAL["neon_cyan"][3] if i == 0 else PAL["tteok"][2])
        fill(d, vx + 1, 95, 3, 4, PAL["wood_dark"][2])     # neck/cap
        d.point((vx + 1, 99), fill=PAL["white"][1])        # glass glint
    d.ellipse([70, 102, 84, 110], fill=PAL["wood_light"][2], outline=OUTLINE)  # bowl
    C.hline(d, 72, 103, 10, PAL["wood_light"][1])
    for kx in range(72, 82, 3):                            # trinkets in the bowl
        d.point((kx, 104), fill=PAL["gold_light"][2])
    # RIGHT cluster (x ~192..230): a small lantern + a stacked pair of boxes
    C.drop_shadow(d, 194, 110, 38, 2)
    fill(d, 196, 94, 10, 16, PAL["wood_dark"][1])          # a paper lantern body
    d.ellipse([195, 92, 207, 98], fill=PAL["tteok"][2], outline=OUTLINE)
    d.ellipse([195, 106, 207, 112], fill=PAL["tteok"][3])
    C.hline(d, 197, 100, 8, PAL["tteok"][1])
    d.point((201, 101), fill=PAL["gold_light"][1])
    fill(d, 214, 100, 14, 10, PAL["wood_light"][2])        # stacked boxes
    fill(d, 216, 94, 10, 7, PAL["wood_light"][1])
    C.frame(d, 214, 100, 14, 10, OUTLINE)
    C.frame(d, 216, 94, 10, 7, PAL["wood_dark"][2])
    d.line([214, 105, 228, 105], fill=PAL["wood_dark"][2])  # box seams


def wrapped_gift(d):
    """The gift already chosen, wrapped, sitting on the counter front — the
    slot-4 prop, inside [120,155,55,38]. (Estado A still shows it small/forward
    as the object the slot-4 frame envuelve; the kraft parcel reads clearly.)"""
    # use the shared builder so it matches obj-gift-wrapped + the wrapped variant
    C.gift_wrapped(d, 128, 158, w=40, h=30)


def dozing_vendor(d):
    """The nameless bazaar owner dozing on a stool at the right, inside
    [240,120,35,60]. Capped head tipped forward, arms folded. Cold-neutral so the
    warm bulb still owns the centre (he sits at the edge of the pool)."""
    x, y = 244, 122
    skin, skin_sh = PAL["wood_light"][1], PAL["wood_light"][2]
    coat, coat_sh = PAL["stone"][2], PAL["stone"][3]
    cap = PAL["ink"][1]
    C.drop_shadow(d, x + 1, y + 56, 28, 2)
    # the stool he sits on
    fill(d, x + 4, y + 46, 22, 5, PAL["wood_dark"][2])
    C.hline(d, x + 4, y + 46, 22, PAL["wood_dark"][1])
    for lx in (x + 6, x + 22):
        C.vline(d, lx, y + 51, 9, PAL["wood_dark"][3])
    # slumped torso (work coat), leaning slightly forward (dozing)
    d.polygon([(x + 5, y + 22), (x + 25, y + 22), (x + 27, y + 47),
               (x + 3, y + 47)], fill=coat, outline=OUTLINE)
    C.dither(d, x + 17, y + 28, 8, 18, coat_sh, phase=0)   # shaded right
    C.vline(d, x + 5, y + 23, 24, PAL["stone"][1])         # lit left seam
    # folded arms across the lap
    fill(d, x + 7, y + 34, 16, 5, coat)
    C.hline(d, x + 7, y + 34, 16, PAL["stone"][1])
    fill(d, x + 9, y + 33, 4, 3, skin)                     # a resting hand
    fill(d, x + 17, y + 33, 4, 3, skin)
    # head tipped FORWARD (asleep): chin toward chest, face barely shown
    d.ellipse([x + 9, y + 8, x + 20, y + 20], fill=skin, outline=OUTLINE)
    C.dither(d, x + 15, y + 12, 4, 7, skin_sh, phase=0)
    d.line([x + 11, y + 16, x + 13, y + 16], fill=OUTLINE)  # closed eye (—)
    d.line([x + 16, y + 16, x + 18, y + 16], fill=OUTLINE)  # closed eye (—)
    # a flat cap pulled low over the brow
    d.pieslice([x + 7, y + 4, x + 22, y + 16], 180, 360, fill=cap, outline=OUTLINE)
    fill(d, x + 6, y + 10, 17, 2, cap)                     # cap brim
    d.polygon([(x + 6, y + 10), (x + 1, y + 11), (x + 6, y + 12)], fill=cap)  # peak
    C.hline(d, x + 8, y + 5, 12, PAL["ink"][0])            # cap top sheen
    # a tiny "zzz" of sleep shown as 3 dots (no glyph), drifting up-right
    d.point((x + 22, y + 6), fill=PAL["steam"][1])
    d.point((x + 24, y + 3), fill=PAL["steam"][2])
    d.point((x + 26, y + 1), fill=PAL["steam"][2])


def background_stalls(d):
    """A hint of the next bazaar nook receding behind the vendor (right depth),
    kept dim and warm so it doesn't compete with the bulb."""
    # a back shelf of stacked boxes in warm penumbra behind the counter, right
    r = random.Random(54)
    for i, by in enumerate(range(72, 100, 9)):
        bw = 18 + r.randint(0, 8)
        bx = 250 + (i % 2) * 10
        fill(d, bx, by, bw, 8, PAL["wood_dark"][2])
        C.frame(d, bx, by, bw, 8, PAL["wood_dark"][3])
        C.hline(d, bx, by, bw, PAL["wood_dark"][1])


def foreground_floor(d):
    """Lower-foreground clutter on the counter-front wood: stray crates, a
    basket of goods, stacked sacks — the bazaar overflows to the floor. All
    clear of the gift rect (x120..175). A faint warm bulb reflection front-low."""
    # a stray cardboard box on the floor, front-left (clutter, mundane)
    bx, by = 14, 196
    fill(d, bx, by, 30, 22, PAL["wood_light"][2])
    C.hline(d, bx, by, 30, PAL["wood_light"][1])
    C.dither(d, bx + 20, by + 3, 10, 18, PAL["wood_dark"][1], phase=0)
    d.line([bx, by + 8, bx + 30, by + 8], fill=PAL["wood_dark"][2])  # flap seam
    d.line([bx + 15, by, bx + 15, by + 8], fill=PAL["wood_dark"][2])
    C.frame(d, bx, by, 30, 22, OUTLINE)
    C.drop_shadow(d, bx, by + 22, 30, 2)
    # a woven basket of small goods, front-left of the gift (x ~58..96)
    kx, ky = 58, 200
    C.drop_shadow(d, kx, ky + 20, 38, 2)
    d.polygon([(kx, ky + 4), (kx + 38, ky + 4), (kx + 34, ky + 20),
               (kx + 4, ky + 20)], fill=PAL["wood_dark"][1], outline=OUTLINE)
    for wy in range(ky + 6, ky + 20, 3):                   # woven weave bands
        C.hline(d, kx + 4, wy, 30, PAL["wood_dark"][3])
    for wx in range(kx + 4, kx + 34, 5):
        C.vline(d, wx, ky + 5, 15, PAL["wood_dark"][2])
    # goods heaped above the rim (apples/onions — humble warm rounds)
    for i, gx in enumerate((kx + 8, kx + 17, kx + 26, kx + 13, kx + 22)):
        gy = ky + (2 if i < 3 else -2)
        c = [PAL["tteok"][2], PAL["gold_light"][2], PAL["ember"][3]][i % 3]
        d.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], fill=c, outline=OUTLINE)
        d.point((gx - 1, gy - 1), fill=PAL["gold_light"][1])
    # stacked burlap sacks, front-right (x ~206..252), tied tops
    sx, sy = 206, 198
    C.drop_shadow(d, sx, sy + 24, 48, 2)
    for i, (ox, oy) in enumerate(((0, 8), (22, 8), (11, -4))):
        bxr, byr = sx + ox, sy + oy
        d.ellipse([bxr, byr, bxr + 22, byr + 22], fill=PAL["wood_light"][2],
                  outline=OUTLINE)
        fill(d, bxr + 4, byr + 4, 14, 16, PAL["wood_light"][2])
        C.dither(d, bxr + 13, byr + 6, 6, 13, PAL["wood_dark"][1], phase=0)
        fill(d, bxr + 8, byr - 2, 6, 4, PAL["wood_dark"][2])   # cinched neck
        d.line([bxr + 8, byr - 2, bxr + 14, byr - 2], fill=PAL["tteok"][2])  # tie
        C.frame(d, bxr + 3, byr + 2, 16, 18, OUTLINE)
    # a faint reflection of the bulb in the wet floor, centre-front (gold, faint)
    for k, yy in enumerate(range(224, 238)):
        if yy % 3 == 2:
            continue
        t = k / 14
        c = PAL["ember"][3] if t < 0.5 else PAL["asphalt"][1]
        for xx in range(150, 166):
            if (xx + yy) % 3 == 0:
                d.point((xx, yy), fill=c)


def fill(d, x, y, w, h, c):
    """Local shim so this script reads top-down; delegates to common.fill."""
    C.fill(d, x, y, w, h, c)


def build():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    bg_alley(d)
    cold_left_edge(d)
    background_stalls(d)
    hanging_clutter(d)
    yellow_bulb(d, 161, 30)            # bulb centre inside [150,22,22,24]
    counter_run(d)
    wrapped_gift(d)
    dozing_vendor(d)
    foreground_floor(d)
    return img


def main():
    img = build()
    # opaque guarantee: composite onto an opaque base, drop alpha
    base = C.Image.new("RGBA", (W, H), PAL["asphalt"][2])
    base.alpha_composite(img)
    out = base.convert("RGB")
    C.save_asset(out, "rooms", "room-03-manmulsang.png")
    C.preview(out, "preview_room-03-manmulsang.png", scale=3)
    C.hotspot_debug(out, HOTSPOTS, "hotspot_room-03-manmulsang.png", scale=3)


if __name__ == "__main__":
    main()
