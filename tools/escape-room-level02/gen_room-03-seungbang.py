#!/usr/bin/env python3
"""room-03-seungbang.png — 스승의 방, the master's cell (Level 2, Cuarto 3).

Dossier §6 Cuarto 3: the most austere, DARKEST room of the level, near-monochrome
slate blue-gray. The only warmth is the diary's wood on the low 서안 desk.

Layout (320×240, frontal-flat like every room):
  LEFT  : a sliding door (미닫이) ajar; OUTSIDE on the step the master's white
          고무신 (rubber shoes) perfectly aligned — two bright shapes on dark wood.
          Rain falls in the gap of the open door. Hotspot SLOT5 [14,148,56,48].
  CENTER: low desk 서안 with diary_book(open=False) closed, cloth tie. Above it
          an interrupted calligraphy whose stroke dies mid-column (illegible at
          1× per rule L2-a). diary hotspot SLOT4 [138,128,48,38]; calligraphy
          cosmetic [148,58,38,52]. A meditation cushion (방석) with a use-dent.
  RIGHT : a wall shelf with a few books; one stylized spine stands out slightly
          (the Emille-bell tale). emille-book cosmetic [252,88,16,44].
  BACK  : a minimal lattice window with rain_curtain behind it.

Shared builders used: diary_book (closed), gomusin, rain_curtain, hanji_wall,
wood_planks, drop_shadow, dither primitives. Everything else is asset-local
detail painted AROUND those builders (desk, cushion, shelf, sliding door, the
calligraphy brush-stroke), per STYLE.md rule 2.

Deterministic: no unseeded random; re-run → byte-identical PNG.
Run from repo root:  python tools/escape-room-level02/gen_room-03-seungbang.py
"""

from __future__ import annotations

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither, drop_shadow

W, H = 320, 240
FLOOR_Y = 150            # wall/floor seam (STYLE: y≈140–155)

# Hotspot rects from the seed (320×240 space) — confirmed against STYLE table.
RECTS = [
    (138, 128, 48, 38),  # diary (SLOT4)
    (14, 148, 56, 48),   # threshold / 고무신 (SLOT5)
    (148, 58, 38, 52),   # calligraphy (cosmetic)
    (252, 88, 16, 44),   # emille-book spine (cosmetic)
]


# ── Background: cold slate wall + dim wood floor ─────────────────────────────

def paint_room_shell(d):
    """Near-monochrome blue-gray cell: cold hanji-gray wall, dark wet floor."""
    # back wall — a cold, dim paper wall. Use the rain ramp (not warm hanji) so
    # the whole room reads blue-gray; warmth is reserved for the diary alone.
    fill(d, 0, 0, W, FLOOR_Y, PAL["rain"][2])
    # sparse fiber flecks so the big surface carries texture (STYLE rule 8)
    i = 0
    for yy in range(4, FLOOR_Y - 4, 5):
        for xx in range(6 + (yy * 3) % 11, W - 6, 11):
            d.point((xx, yy), fill=PAL["rain"][1] if i % 3 else PAL["rain"][3])
            i += 1
    # a faint top gradient (darker near the ceiling) via dither
    dither(d, 0, 0, W, 16, PAL["rain"][3], phase=0)
    # vertical wood post framing panels (austere mullions), dim
    for px in (74, 240):
        fill(d, px, 0, 5, FLOOR_Y, PAL["wood_dark"][2])
        vline(d, px, 0, FLOOR_Y, PAL["wood_dark"][1])
        vline(d, px + 4, 0, FLOOR_Y, PAL["wood_dark"][3])
    # wood skirting board at the wall/floor seam
    fill(d, 0, FLOOR_Y - 5, W, 5, PAL["wood_dark"][1])
    hline(d, 0, FLOOR_Y - 5, W, PAL["wood_dark"][0])
    hline(d, 0, FLOOR_Y - 1, W, OUTLINE)
    # floor — dark, slightly damp planks; cool, not warm
    C.wood_planks(d, 0, FLOOR_Y, W, H - FLOOR_Y, PAL["wood_dark"], plank_h=9,
                  seam_every=3)
    # cool sheen pooling on the floor (it has rained in; the room is damp)
    dither(d, 0, H - 20, W, 20, PAL["rain"][3], phase=1)
    dither(d, 0, H - 9, W, 9, PAL["rain"][4], phase=0)


# ── BACK window: minimal lattice + rain curtain ─────────────────────────────

def paint_back_window(d):
    """A small high lattice window between the two posts, rain behind it."""
    wx, wy, ww, wh = 96, 18, 120, 62
    # recessed dark reveal first
    fill(d, wx - 3, wy - 3, ww + 6, wh + 6, PAL["wood_dark"][3])
    frame(d, wx - 3, wy - 3, ww + 6, wh + 6, OUTLINE)
    # the cold grey sky / rain beyond
    fill(d, wx, wy, ww, wh, PAL["rain"][3])
    dither(d, wx, wy, ww, wh, PAL["rain"][4], phase=0)
    C.rain_curtain(d, wx, wy, ww, wh, phase=0, density=8, lean=2)
    # wooden lattice (창살): a sparse grid, thin members
    for gx in range(wx + 12, wx + ww, 18):
        vline(d, gx, wy, wh, PAL["wood_dark"][1])
        vline(d, gx + 1, wy, wh, PAL["wood_dark"][2])
    for gy in range(wy + 14, wy + wh, 16):
        hline(d, wx, gy, ww, PAL["wood_dark"][1])
        hline(d, wx, gy + 1, ww, PAL["wood_dark"][2])
    frame(d, wx, wy, ww, wh, OUTLINE)
    # sill
    fill(d, wx - 3, wy + wh, ww + 6, 3, PAL["wood_dark"][1])
    hline(d, wx - 3, wy + wh, ww + 6, PAL["wood_light"][2])
    frame(d, wx - 3, wy + wh, ww + 6, 3, OUTLINE)


# ── LEFT: sliding door ajar + step + 고무신 (SLOT5 [14,148,56,48]) ────────────

def paint_sliding_door(d):
    """미닫이 ajar on the left; 고무신 on the dark step outside, rain in the gap.

    The hotspot [14,148,56,48] (center ~(42,172)) wraps the step+shoes. The open
    gap shows cold exterior so the shoes read as 'outside', the room as 'inside'.
    """
    # the doorway frame fills the left bay, from wall top down to the floor.
    dx, dw = 8, 60          # doorway opening x..x+dw
    # --- the GAP: exterior visible through the opening (cold, rainy) ---
    gap_x, gap_w = 8, 30    # the ajar slice (door slid right, exposing left)
    fill(d, gap_x, 0, gap_w, FLOOR_Y + 30, PAL["rain"][4])   # cold outside void
    dither(d, gap_x, 0, gap_w, FLOOR_Y, PAL["rain"][3], phase=1)
    C.rain_curtain(d, gap_x, 4, gap_w, FLOOR_Y - 8, phase=1, density=6, lean=2)
    # the exterior step (마루/툇마루) — a dark wet wood ledge the shoes BOTH sit on.
    # It must span the full shoe pair (≈x26..x53) so the 고무신 read as two bright
    # shapes on ONE dark wood surface (spec), never straddling step + bright floor.
    step_y = 150
    step_x, step_w = gap_x, 50          # x8..x58 covers both shoes + the gap edge
    fill(d, step_x, step_y, step_w, 16, PAL["wood_dark"][3])   # darkest wet wood
    hline(d, step_x, step_y, step_w, PAL["wood_dark"][1])      # lit front edge
    dither(d, step_x, step_y + 9, step_w, 6, PAL["rain"][4], phase=0)
    hline(d, step_x, step_y + 15, step_w, OUTLINE)
    # a thin cold rim of standing rainwater along the step front (it has rained)
    hline(d, step_x + 1, step_y + 14, step_w - 2, PAL["rain"][2])
    # the master's 고무신, perfectly aligned, both on the dark step.
    # gomusin() draws a pair ~24 wide; place so its center ≈ (42,170).
    C.gomusin(d, 28, 161)
    # --- the door panel itself, slid to the right (a hanji-paper leaf) ---
    # In the DARKEST room the paper leaf must NOT out-shine the diary: tint it
    # cool and dim (a mid hanji muted toward rain) so the warm diary stays the
    # single brightest focal point of the scene (STYLE rule 8).
    pnx, pnw = 38, 30
    fill(d, pnx, 0, pnw, FLOOR_Y, PAL["hanji"][3])           # dim paper leaf
    C.hanji_wall(d, pnx + 1, 1, pnw - 2, FLOOR_Y - 2, ramp=PAL["hanji"])
    dither(d, pnx, 0, pnw, FLOOR_Y, PAL["rain"][2], phase=1)  # cool dimming film
    # wood stiles + rails of the door leaf (the 'shoji' grid, dim)
    frame(d, pnx, 0, pnw, FLOOR_Y, PAL["wood_dark"][2])
    vline(d, pnx, 0, FLOOR_Y, PAL["wood_dark"][1])
    for ry in (40, 84, 120):
        hline(d, pnx, ry, pnw, PAL["wood_dark"][2])
        hline(d, pnx, ry + 1, pnw, PAL["wood_dark"][3])
    vline(d, pnx + pnw // 2, 0, FLOOR_Y, PAL["wood_dark"][2])
    # the leading edge of the door (the stile by the gap) catches a cold rim
    vline(d, pnx, 0, FLOOR_Y, PAL["rain"][1])
    vline(d, pnx - 1, 0, FLOOR_Y, PAL["wood_dark"][3])
    # small recessed finger-pull (손잡이)
    fill(d, pnx + 4, 70, 4, 8, PAL["wood_dark"][3])
    frame(d, pnx + 4, 70, 4, 8, OUTLINE)
    # door track (문지방) along the floor seam
    fill(d, gap_x, FLOOR_Y - 5, dw, 5, PAL["wood_dark"][3])
    hline(d, gap_x, FLOOR_Y - 5, dw, PAL["wood_dark"][1])


# ── CENTER: low desk 서안 + closed diary (SLOT4 [138,128,48,38]) ─────────────

def paint_desk_and_diary(d):
    """Low writing desk 서안 with the closed diary on top (the only warm prop).

    Diary hotspot [138,128,48,38], visual center ≈ (162,147). diary_book(closed)
    is 30×22; placed at (147,135) its center lands ≈ (162,146) — inside the rect.
    The desk top is kept shallow (~10px) so it never reads as a cabinet face
    (the L1 'soban looks like a dresser' pitfall).
    """
    # --- the 서안: a low long table with two short end-legs ---
    tx, ty, tw = 116, 150, 92
    drop_shadow(d, tx - 2, ty + 30, tw + 4, 3)
    # legs (short, splayed slightly), drawn first (behind the top)
    for lx in (tx + 6, tx + tw - 12):
        fill(d, lx, ty + 8, 6, 20, PAL["wood_dark"][2])
        vline(d, lx, ty + 8, 20, PAL["wood_dark"][1])
        frame(d, lx, ty + 8, 6, 20, OUTLINE)
    # an apron rail between the legs
    fill(d, tx + 8, ty + 9, tw - 16, 4, PAL["wood_dark"][3])
    # the table TOP — a thin slab (shallow front face so it never reads cabinet)
    fill(d, tx, ty, tw, 9, PAL["wood_light"][2])
    hline(d, tx, ty, tw, PAL["wood_light"][1])              # lit front lip
    dither(d, tx, ty + 5, tw, 4, PAL["wood_dark"][1], phase=0)   # shaded underside
    # a couple of grain ticks on the top
    for gx in range(tx + 8, tx + tw - 6, 21):
        hline(d, gx, ty + 2, 4, PAL["wood_light"][3])
    frame(d, tx, ty, tw, 9, OUTLINE)
    # a small inkstone (벼루) + brush rest at the left of the desk for life
    fill(d, tx + 6, ty - 4, 12, 5, PAL["ink"][1])
    d.ellipse([tx + 7, ty - 4, tx + 16, ty - 1], fill=PAL["ink"][2], outline=OUTLINE)
    d.point((tx + 11, ty - 3), fill=PAL["rain"][0])         # wet ink glint
    # the brush (붓) lying across, handle wood + dark tuft
    d.line([tx + 20, ty - 2, tx + 34, ty - 4], fill=PAL["wood_dark"][1])
    d.line([tx + 18, ty - 1, tx + 22, ty - 2], fill=PAL["ink"][2])  # tuft tip

    # --- the closed diary on the desk, the warm focal point ---
    # diary_book(closed) is 30×22, drawn from its top-left. Put it at (147,135)
    # so center ≈ (162,146) sits inside [138,128,48,38] (center 162,147).
    C.diary_book(d, 147, 135, open=False)
    # a tiny warm key-glow under/around the diary so it is the warmest pixel of
    # the room (STYLE rule 8: focal point = highest contrast). Kept subtle.
    dither(d, 144, 134, 36, 2, PAL["ember"][3], phase=1)


def paint_cushion(d):
    """방석 square meditation cushion with a use-dent, in front of the desk.

    Drawn as a flat SQUARE pad seen in low perspective (a trapezoid, wider at the
    near edge) with a piped seam border — so it reads as a floor cushion, not an
    oval lid. The use-dent is a shaded hollow kept strictly inside the seam.
    """
    cx, cy, cw, ch = 132, 195, 56, 19
    drop_shadow(d, cx + 1, cy + ch - 1, cw - 2, 2)
    # the square pad as a low trapezoid: back edge narrower, front edge wider
    top = [(cx + 5, cy), (cx + cw - 5, cy), (cx + cw, cy + ch),
           (cx, cy + ch)]
    d.polygon(top, fill=PAL["stone"][2], outline=OUTLINE)
    # piped seam border just inside the edge (the stitched welt of a 방석)
    d.polygon([(cx + 8, cy + 2), (cx + cw - 8, cy + 2), (cx + cw - 4, cy + ch - 3),
               (cx + 4, cy + ch - 3)], outline=PAL["stone"][3])
    # corner tuft buttons (the cushion is tied through the middle/corners)
    for (tx, ty) in ((cx + 9, cy + 3), (cx + cw - 9, cy + 3),
                     (cx + 5, cy + ch - 4), (cx + cw - 5, cy + ch - 4)):
        d.point((tx, ty), fill=PAL["stone"][3])
    # the central use-dent: a sunken shaded hollow, dither kept INSIDE the seam
    # (avoids the L1 'dither bleeds outside the shape' pitfall)
    dither(d, cx + 16, cy + 6, cw - 32, 8, PAL["stone"][3], phase=0)
    hline(d, cx + 18, cy + 6, cw - 36, PAL["rain"][4])      # dent shadow lip
    d.point((cx + cw // 2, cy + 10), fill=PAL["rain"][4])   # the deepest point
    # a faint lit near-edge so the pad has a top face (worn, well-used)
    hline(d, cx + 2, cy + ch - 2, cw - 4, PAL["stone"][1])


# ── CENTER-ABOVE: the interrupted calligraphy ([148,58,38,52]) ──────────────

def paint_calligraphy(d):
    """Hung scroll whose brush-stroke dies mid-column. ILLEGIBLE at 1× (rule L2-a).

    Only suggested ink strokes (vertical 붓 marks), NOT glyphs. The last column
    visibly trails off / breaks — the stroke that 'didn't finish'. Hotspot
    [148,58,38,52], visual center ≈ (167,84): the scroll center is placed there.
    """
    sx, sy, sw, sh = 150, 56, 34, 56     # scroll body (fits inside the rect)
    # top + bottom wooden dowels (축) of a hanging scroll
    fill(d, sx - 3, sy - 4, sw + 6, 4, PAL["wood_dark"][2])
    hline(d, sx - 3, sy - 4, sw + 6, PAL["wood_dark"][1])
    frame(d, sx - 3, sy - 4, sw + 6, 4, OUTLINE)
    d.point((sx - 4, sy - 2), fill=PAL["wood_light"][2])    # dowel cap knob
    d.point((sx + sw + 2, sy - 2), fill=PAL["wood_light"][2])
    fill(d, sx - 3, sy + sh, sw + 6, 4, PAL["wood_dark"][2])
    hline(d, sx - 3, sy + sh, sw + 6, PAL["wood_dark"][1])
    frame(d, sx - 3, sy + sh, sw + 6, 4, OUTLINE)
    # hanging cord from the back window post
    vline(d, sx + sw // 2, sy - 10, 6, PAL["wood_dark"][3])
    # the paper field (slightly warmer hanji than the wall so the scroll reads)
    fill(d, sx, sy, sw, sh, PAL["hanji"][2])
    dither(d, sx, sy, sw, sh, PAL["hanji"][3], phase=0)     # aged paper mottling
    frame(d, sx, sy, sw, sh, PAL["wood_dark"][3])
    # --- the brush-strokes: a SUGGESTED ink poem in vertical 붓 columns. Per rule
    # L2-a these must read as flowing wet brush strokes, NOT legible glyphs: each
    # column is a mostly-continuous wandering vertical stroke that swells (2px)
    # and thins (1px) like wet ink, with a soft bleed edge — never serif ticks.
    # right + middle columns run the full height; the LEFT column DIES mid-way
    # (it thins to a dribble and stops a third down — the stroke never finished).
    ink, ink_d, bleed = PAL["ink"][2], PAL["ink"][1], PAL["ink"][0]

    def stroke(cx, segs):
        """One wandering wet brush column. segs = (y, len, sway, fat) per stroke."""
        for (yy, ln, sway, fat) in segs:
            for k in range(ln):
                px = cx + (sway if k > ln // 2 else 0)      # the stroke wanders
                vline(d, px, sy + yy + k, 1, ink)
                if fat and k < ln - 1:
                    d.point((px + 1, sy + yy + k), fill=ink_d)   # wet swell
            d.point((cx, sy + yy + ln), fill=bleed)          # soft tail bleed

    # column A (rightmost, complete) — three connected swelling strokes
    stroke(sx + 25, ((3, 12, 0, 1), (16, 13, -1, 1), (30, 16, 1, 0)))
    d.point((sx + 25, sy + 47), fill=ink_d)                 # final breath of ink
    # column B (middle, complete) — a longer continuous run with a knot
    stroke(sx + 16, ((4, 14, 1, 1), (19, 11, -1, 0), (31, 15, 0, 1)))
    d.point((sx + 17, sy + 12), fill=ink_d)                 # a wet pooling knot
    d.point((sx + 15, sy + 24), fill=ink_d)
    # column C (LEFT, INTERRUPTED) — opens strong, then breaks and trails into a
    # thin dribble that STOPS a third of the way down (the unfinished stroke).
    ccx = sx + 7
    for k in range(8):                                       # the strong opening
        vline(d, ccx + (1 if k > 4 else 0), sy + 4 + k, 1, ink)
    d.point((ccx + 1, sy + 6), fill=ink_d)
    d.point((ccx + 2, sy + 12), fill=ink_d)                 # the brush lifts…
    d.point((ccx + 1, sy + 14), fill=ink_d)                 # …a thinning drip…
    d.point((ccx + 1, sy + 16), fill=bleed)                 # …one last dab…
    d.point((ccx + 2, sy + 18), fill=bleed)                 # …and it stops. blank below.


# ── RIGHT: wall shelf with books, one stylized spine ([252,88,16,44]) ───────

def paint_shelf(d):
    """A small wall shelf with a few leaning books; one spine stands out slightly.

    The standout spine (the Emille-bell tale) sits centered in [252,88,16,44]
    (center ≈ (260,110)). Other books are duller so it 'stands out a little'.
    """
    shx, shy, shw = 246, 124, 64        # shelf plank top edge
    # the shelf plank (bracketed to the wall)
    fill(d, shx, shy, shw, 5, PAL["wood_dark"][1])
    hline(d, shx, shy, shw, PAL["wood_light"][2])
    hline(d, shx, shy + 4, shw, OUTLINE)
    frame(d, shx, shy, shw, 5, OUTLINE)
    drop_shadow(d, shx, shy + 5, shw, 2)
    # two small brackets under the plank
    for bx in (shx + 4, shx + shw - 8):
        d.polygon([(bx, shy + 5), (bx + 4, shy + 5), (bx, shy + 12)],
                  fill=PAL["wood_dark"][3], outline=OUTLINE)

    # books standing on the plank (their tops are above the plank, y < shy).
    # Each: a thin vertical spine block. Most are muted ink/stone; ONE is the
    # standout — a touch taller, with a faint warm/verdigris title band.
    def book(x, top, w, col, lean=0, hi=None, band=None):
        h = shy - top
        # lean shifts the top a couple px for a 'leaning on the shelf' look
        d.polygon([(x, shy - 1), (x + w, shy - 1), (x + w + lean, top),
                   (x + lean, top)], fill=col, outline=OUTLINE)
        if hi:
            vline(d, x + lean + 1, top + 1, h - 2, hi)      # lit spine edge
        if band:                                            # a title band
            fill(d, x + lean + 1, top + h // 2, max(w - 2, 1), 2, band)

    # left filler books (dull, slightly varied heights, a couple leaning)
    book(247, 92, 4, PAL["ink"][1], lean=0, hi=PAL["ink"][0])
    book(251, 96, 3, PAL["stone"][2], lean=1, hi=PAL["stone"][1])
    # the STANDOUT spine — the Emille-bell tale. Centered on x≈260, taller, its
    # cloth a deep bronze with a faint verdigris band (reads as 'special' book).
    book(255, 84, 7, PAL["bronze"][2], lean=0, hi=PAL["bronze"][1],
         band=C.VERDIGRIS)
    # a tiny embossed bell glyph hint on the spine (2-tone, NOT text)
    d.point((258, 100), fill=PAL["bronze"][0])
    d.line([257, 102, 260, 102], fill=PAL["bronze"][0])
    d.point((258, 103), fill=PAL["bronze"][3])
    # right filler books
    book(263, 98, 3, PAL["ink"][1], lean=-1, hi=PAL["ink"][0])
    book(266, 94, 4, PAL["stone"][3], lean=0, hi=PAL["stone"][2])
    book(270, 100, 3, PAL["ink"][2], lean=1)


# ── compose ──────────────────────────────────────────────────────────────────

def build():
    img, d = C.new_canvas(W, H, bg=PAL["rain"][3])
    paint_room_shell(d)
    paint_back_window(d)
    paint_shelf(d)             # right wall shelf (behind desk plane)
    paint_calligraphy(d)       # hung above the desk
    paint_sliding_door(d)      # left doorway + shoes
    paint_desk_and_diary(d)    # center desk + warm diary
    paint_cushion(d)           # cushion on the floor in front
    return img


def main():
    img = build()
    C.save_asset(img, "rooms", "room-03-seungbang.png")
    C.preview(img, "preview_room-03-seungbang.png", scale=3)
    C.hotspot_debug(img, RECTS, "hotspot_room-03-seungbang.png", scale=3)


if __name__ == "__main__":
    main()
