#!/usr/bin/env python3
"""room-03-manmulsang-wrapped (320x240, opaque) — Zona 3 estado B "regalo elegido".

§6 spec (dossier docs/escape-room-level-03.md, line 249): the SAME 만물상 corner
as room-03-manmulsang, swapped ON SCREEN after the Slot 3 is solved —
  * the chosen object moves to the FRONT of the counter, WRAPPED in kraft paper
    (gift_wrapped) — now the prominent focus, the slot-4 trigger;
  * the two compared groups SIMPLIFY: the discarded (right, humbler) group returns
    to a hook on the merch wall, leaving only the chosen (left, showier) one;
  * the merchandise "altar" stays identical — only the counter focus changes.

This is a derived variant: it reuses the FROZEN base module's background, merch
wall, bulb, vendor, and floor verbatim (gen_room-03-manmulsang), and only
re-implements the counter (simplified single group) and the wrapped gift (now the
front focus, on the gift hotspot).

Hotspots — IDENTICAL to room-03-manmulsang (STYLE.md seed table, 320x240 space):
  counter [105,95,80,50] slot-3 · gift [120,155,55,38] slot-4 ·
  merch [15,25,80,45] cosmetic · vendor [240,120,35,60] cosmetic ·
  bulb-flicker [150,22,22,24] cosmetic.

Only common.py builders/helpers (FROZEN) + the FROZEN base module's scene helpers.
Deterministic: no unseeded random. Render -> Read the 3x preview -> critique vs
STYLE.md -> iterate (>=3 rounds).

Run from repo root:
  python tools/escape-room-level03/gen_room-03-manmulsang-wrapped.py
"""

from __future__ import annotations

import importlib

import common as C
from common import OUTLINE, PAL

# Import the FROZEN state-A scene module to reuse its background/clutter verbatim.
# (Hyphenated module name -> import via importlib.)
base = importlib.import_module("gen_room-03-manmulsang")

W, H = 320, 240

# Hotspot rects [x, y, w, h] — verbatim from STYLE.md (seed-derived). IDENTICAL to
# state A: the swap is art-only, the rects do not move (dossier line 249/253).
HOTSPOTS = [
    (105, 95, 80, 50),    # counter  (slot-3, now the simplified single group)
    (120, 155, 55, 38),   # gift     (slot-4, the wrapped gift at the front)
    (15, 25, 80, 45),     # merch    (cosmetic, hanging merchandise wall)
    (240, 120, 35, 60),   # vendor   (cosmetic, dozing bazaar owner)
    (150, 22, 22, 24),    # bulb     (cosmetic, the flickering yellow bulb)
]


def counter_run_simplified(d):
    """The crowded glass-counter display + its wood base, STATE B.

    Same vitrina + flanking bric-a-brac as state A, but the bargaining is OVER:
    only the CHOSEN (left, showier) group remains on the counter top inside the
    slot-3 rect [105,95,80,50]; the discarded humbler pouch has gone back to a
    hook on the merch wall (drawn separately). A clean gap where it stood reads as
    "the deal is done"."""
    cy = 110                                               # counter top surface y
    # the wood counter slab spanning the frame
    C.wood_planks(d, 0, cy, W, H - cy - 4, PAL["wood_light"], plank_h=7,
                  seam_every=2)
    C.hline(d, 0, cy, W, PAL["wood_light"][0])             # lit front lip
    C.fill(d, 0, cy + 2, W, 2, PAL["wood_dark"][3])
    # a glass display band set into the counter front (the vitrina) — unchanged
    gy = cy + 8
    C.fill(d, 18, gy, W - 36, 30, PAL["asphalt"][1])       # dark glass interior
    C.frame(d, 18, gy, W - 36, 30, PAL["wood_dark"][3])
    for gx in range(26, W - 26, 30):                       # muntins of the case
        C.vline(d, gx, gy + 1, 28, PAL["wood_dark"][2])
    C.hline(d, 20, gy + 1, W - 40, PAL["metal"][1])        # glass top reflection
    # faint goods glinting behind the glass (small, no labels) — same seed as A
    import random
    r = random.Random(91)
    for gx in range(24, W - 28, 12):
        c = [PAL["gold_light"][2], PAL["metal"][1], PAL["tteok"][2],
             PAL["neon_cyan"][3]][r.randint(0, 3)]
        d.point((gx, gy + 8 + r.randint(0, 18)), fill=c)
    C.frame(d, 0, cy, W, H - cy - 4, OUTLINE)

    # ── STATE B: only the CHOSEN group remains on the counter top, in
    #    [105,95,80,50]. It is the LEFT (showier) lacquered box from state A —
    #    same position/size so the swap reads as "the other one left". ──
    bx = 112
    C.drop_shadow(d, bx, 134, 24, 2)
    C.fill(d, bx, 108, 22, 26, PAL["tteok"][2])            # deep red lacquer body
    C.fill(d, bx + 1, 109, 20, 7, PAL["tteok"][1])         # lit lid band
    C.hline(d, bx + 1, 109, 20, PAL["tteok"][0])
    C.dither(d, bx + 14, 116, 7, 16, PAL["tteok"][3], phase=0)  # shaded right
    d.point((bx + 4, 111), fill=PAL["gold_light"][0])      # a showy gold glint
    d.point((bx + 5, 112), fill=PAL["white"][0])
    C.fill(d, bx + 8, 118, 6, 3, PAL["gold_light"][2])     # a gilt clasp
    C.frame(d, bx, 108, 22, 26, OUTLINE)
    # a faint clean ring on the wood where the discarded pouch stood (x~150..166),
    # so the empty spot reads as "something was just here", not a layout error
    px = 150
    C.dither(d, px + 1, 128, 14, 4, PAL["wood_dark"][1], phase=1)  # dust ghost
    C.hline(d, px + 2, 132, 12, PAL["wood_dark"][1])

    # ── counter-top clutter FLANKING the chosen group (outside the slot-3 rect
    #    x105..185, and clear of the gift x120..175 + vendor x240..275) ──
    base._counter_goods(d)


def discarded_back_on_hook(d):
    """The humbler pouch that LOST the bargain, returned to a hook on the merch
    wall (dossier line 249: "el descartado vuelve al gancho"). A small cloth pouch
    hanging on the lower merch row, clear of the merch hotspot's dense left run
    so it reads as a NEW addition, not part of the original wall."""
    # hang it on a free hook in the lower clutter row, right-of-centre (x~196),
    # under the back wall, above the counter (y~74..92) — clearly "back on the wall"
    hx, hy = 196, 73
    C.vline(d, hx, 68, 6, PAL["metal"][2])                 # a fresh hook string
    d.point((hx, 68), fill=PAL["metal"][1])
    # the small soft cloth pouch (same colours as the counter-top pouch it was)
    d.ellipse([hx - 6, hy + 4, hx + 6, hy + 16], fill=PAL["wood_light"][2],
              outline=OUTLINE)
    C.fill(d, hx - 3, hy, 6, 6, PAL["wood_light"][1])      # pinched neck up to hook
    C.vline(d, hx - 3, hy, 6, PAL["wood_dark"][1])
    d.line([hx - 3, hy, hx + 3, hy], fill=PAL["wood_dark"][2])  # drawstring tie
    C.dither(d, hx + 2, hy + 8, 4, 7, PAL["wood_dark"][2], phase=0)  # shaded side
    C.drop_shadow(d, hx - 6, hy + 16, 12, 1)


def wrapped_gift_front(d):
    """The chosen gift now WRAPPED and brought to the FRONT of the counter — the
    slot-4 prop and the focus of state B, inside the gift rect [120,155,55,38].

    Bigger and more forward than the state-A forward-reference parcel: it sits
    centred on the gift hotspot's centre (147,174), catching the warm bulb. Uses
    the shared gift_wrapped builder so it matches obj-gift-wrapped."""
    # rect [120,155,55,38] -> centre (147.5, 174). gift_wrapped(x,y,w,h): bow sits
    # ABOVE y, so place the parcel body a touch low in the rect and keep the bow
    # inside it. w=46,h=30 parcel -> top-left ~ (124,160): centre (147,175). The
    # bow peaks at ~y=156 (inside the rect's y=155 top). Fits cleanly.
    gx, gy, gw, gh = 124, 160, 46, 30
    C.gift_wrapped(d, gx, gy, w=gw, h=gh)
    # a faint warm pool of the bulb light spilling onto the parcel's LEFT face only
    # (the focus now) — kept OFF the centre bow so it never reads as a creature's
    # ears. Source = the yellow bulb, so the lit side faces up-left.
    C.dither(d, gx + 2, gy + 2, 10, 5, PAL["gold_light"][2], phase=0)
    d.point((gx + 4, gy + 3), fill=PAL["gold_light"][1])
    # a flat, half-unrolled SHEET of leftover kraft paper resting on the counter to
    # the right of the gift (the wrapping just finished — mundane evidence, L3-e).
    # Drawn as a thin folded rectangle, NOT a ball, so it reads as paper not a mouse.
    px, py, pw, ph = gx + gw + 5, gy + gh - 6, 16, 6
    C.fill(d, px, py, pw, ph, PAL["wood_light"][1])
    C.hline(d, px, py, pw, PAL["wood_light"][0])           # lit top edge of the sheet
    d.line([px + 5, py, px + 5, py + ph - 1], fill=PAL["wood_dark"][1])   # a fold
    d.line([px + 11, py, px + 11, py + ph - 1], fill=PAL["wood_dark"][1])  # a fold
    C.dither(d, px + pw - 4, py + 1, 4, ph - 1, PAL["wood_dark"][1], phase=0)
    C.frame(d, px, py, pw, ph, OUTLINE)
    # a snip of leftover red string curling on the counter beyond the sheet
    d.line([px + pw + 2, py + ph - 1, px + pw + 6, py + 1], fill=PAL["tteok"][2])
    d.point((px + pw + 5, py + 2), fill=PAL["tteok"][1])
    C.drop_shadow(d, px, py + ph, pw, 1)


def compose():
    img, d = C.new_canvas(W, H, bg=PAL["asphalt"][2])
    # reuse the FROZEN state-A background + merch wall + bulb + vendor + floor
    base.bg_alley(d)
    base.cold_left_edge(d)
    base.background_stalls(d)
    base.hanging_clutter(d)
    discarded_back_on_hook(d)          # the lost pouch, back on a hook (state B)
    base.yellow_bulb(d, 161, 30)       # bulb centre inside [150,22,22,24]
    counter_run_simplified(d)          # vitrina + ONLY the chosen group (state B)
    wrapped_gift_front(d)              # the wrapped gift, FRONT focus (slot-4)
    base.dozing_vendor(d)
    base.foreground_floor(d)
    return img


def main():
    img = compose()
    # opaque guarantee: composite onto an opaque base, drop alpha (STYLE.md rule 6)
    base_img = C.Image.new("RGBA", (W, H), PAL["asphalt"][2])
    base_img.alpha_composite(img)
    out = base_img.convert("RGB")

    C.save_asset(out, "rooms", "room-03-manmulsang-wrapped.png")
    C.preview(out, "preview_room-03-manmulsang-wrapped.png", scale=3)
    C.hotspot_debug(out, HOTSPOTS, "hotspot_room-03-manmulsang-wrapped.png", scale=3)


if __name__ == "__main__":
    main()
