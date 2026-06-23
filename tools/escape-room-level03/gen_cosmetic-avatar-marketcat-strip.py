#!/usr/bin/env python3
"""cosmetic-avatar-marketcat-strip.png — 🟣 épico «시장 고양이», 3-frame strip.

Dossier §9 (line 803, the Epic tier): «El gato del mercado sentado sobre una
caja de cartón junto a la plancha, a resguardo del frío de la calle. 3 frames:
parpadeo lento, golpe de cola — y cada pocos ciclos, lame la pata y mira el
vapor que sube. Una mancha de neón rosa cruzándole el lomo, nunca encima de los
ojos.» Asset table §10 (line 852) + STYLE.md: 192×64, 3 frames (64×64 each),
transparent bg.

This is the COSMETIC twin of the scene sprite `objects/sprite-cat-strip.png`.
The two reads are kept strictly apart (dossier §9 line 809 + the sprite file's
own docstring + STYLE.md §"market_cat" note):

  - sprite-cat-strip  (scene): the BARE cat on the counter beside 이모's griddle,
    NO cardboard box, NO neon back-stripe, 2 frames (sit / tail flick). 64×24.
  - cosmetic-avatar-marketcat-strip  (THIS file): the 🟣 reward — the SAME cat
    (common.market_cat) ON a cardboard box, a pink-neon stripe across the back,
    and the third lick-frame; 3 frames, 192×64 transp. The box, the stripe and
    frame 2 (the lick + look-up at the steam) live ONLY here.

The cat IS the shared builder (rule 2: compose with common.market_cat so the QA
eyeballs "same cat in the room and on the box"). frame 0/1/2 map 1:1 to the
dossier's three beats:
  frame 0 = parpadeo (market_cat frame 0, sitting — the loop's rest pose);
  frame 1 = golpe de cola (market_cat frame 1, tail flicked up-right);
  frame 2 = lamida + mirada al vapor (market_cat frame 2, COSMETIC-ONLY: head
            tipped up, a front paw raised to the mouth — and here we add the
            warm 1px steam wisp it looks up at).

The COSMETIC-ONLY additions, drawn by THIS file (never inside common.market_cat
— the builder stays the bare cat so the scene sprite reuses it unchanged):
  - a cardboard box under the cat in every frame (kraft wood_light/wood_dark, a
    folded top flap + a tape seam, an oil-warm right face — it sits by the
    griddle, off the cold street: L3-d warm key on the right);
  - a pink-neon stripe smeared across the cat's BACK only, kept clear of the
    head/eyes (L3-a: glow by bands of neon_pink, NOT a legible glyph; it reads as
    a stray neon reflection on the fur, not a mark);
  - in frame 2 only, one warm steam wisp rising in front of the cat (common.steam,
    warm) so the up-tilted head has something to look at.

Hard rules honored: L3-a no legible Korean (none anywhere); L3-b/L3-e nothing
hidden, 100% mundane — it is a cat on a box catching a little neon; the neon is a
REFLECTION on fur with an obvious street source, no "magic" glow, no second
shadow. Colors only from common.PAL (+ OUTLINE / SHADOW_*). Outline = OUTLINE,
never #000. Blending only via dither(). Warm contact shadow (it loafs by the warm
griddle, off the cold street — SHADOW_WARM, like the builder stamps).

Deterministic: market_cat has no entropy; the only randomness here is an explicit
random.Random(seed) for the neon-stripe ripple. Re-run -> byte-identical PNG.
Run from repo root:  python tools/escape-room-level03/gen_cosmetic-avatar-marketcat-strip.py
"""

from __future__ import annotations

import random

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, fill, frame, hline, vline, dither

# ── strip geometry ───────────────────────────────────────────────────────────
FRAME_W = 64                    # per-frame cell width  (192 / 3, per §10)
FRAME_H = 64                    # per-frame cell height
N_FRAMES = 3                    # 0 blink/sit · 1 tail flick · 2 lick + look up
W = FRAME_W * N_FRAMES          # 192 total
H = FRAME_H                     # 64

# common.market_cat draws into a ~18-wide × ~18-tall footprint at (x,y): the body
# + tail span x..x+17 (flick tail reaches ~x+17), head top at y-1, contact shadow
# at y+15. We sit that cat ON a cardboard box. The box is the seat; the cat rests
# on its lid. Geometry inside one 64×64 cell:
BOX_W = 34                      # cardboard box width
BOX_H = 20                      # cardboard box height (the visible front face)
BOX_X = (FRAME_W - BOX_W) // 2  # = 15 -> box centred horizontally in the cell
BOX_TOP = 36                    # the box lid sits a bit below mid-cell
BOX_BOT = BOX_TOP + BOX_H       # = 56 (a margin of breathing room to the floor)

# the cat sits centred on the box lid; its 18×18 footprint's base (the haunch +
# contact shadow ~y+15) lands ON the lid line. Centre the 18-wide cat over the box.
CAT_W = 18
CAT_X = BOX_X + (BOX_W - CAT_W) // 2     # = 15 + 8 = 23 -> cat centred on the box
# market_cat's shadow/haunch base sits at y+15; we want that to rest on BOX_TOP,
# so the cat origin y = BOX_TOP - 15. Head then reaches y-1 = BOX_TOP-16.
CAT_Y = BOX_TOP - 15                      # = 21 -> head top at 20, base at 36


# ── the cardboard box (the cosmetic seat — kraft cardboard, a warm right face) ─

def _cardboard_box(d, x: int, y: int) -> None:
    """A folded kraft cardboard box for the cat to sit on (§9: «caja de cartón»).

    Warm kraft tones (wood_light face / wood_dark sides + seams) so it reads as
    corrugated cardboard, NOT a painted crate: a flat lid with two folded-in top
    flaps, a strip of packing tape down the seam, a corrugated lower lip, and the
    griddle's warm ember rim on the RIGHT face (L3-d — it sits by the plancha, the
    cold street to its left). Cool would be wrong here: the box is the cat's warm
    refuge from the street. Contact shadow is WARM (griddle side).
    """
    face, face_hi, face_sh = PAL["wood_light"][2], PAL["wood_light"][1], PAL["wood_dark"][1]
    tape = PAL["white"][1]
    lid = PAL["wood_light"][1]
    # warm contact shadow on the ground under the box (it loafs by the griddle)
    C.drop_shadow(d, x + 2, y + BOX_H, BOX_W - 4, 2)
    # the box front face
    fill(d, x, y + 4, BOX_W, BOX_H - 4, face)
    vline(d, x, y + 4, BOX_H - 4, face_hi)                 # lit left edge
    dither(d, x + BOX_W - 10, y + 7, 10, BOX_H - 8, face_sh, phase=0)  # shaded right
    # the flat lid the cat rests on (a lighter top plane reading as the box top)
    fill(d, x, y, BOX_W, 5, lid)
    hline(d, x, y, BOX_W, PAL["wood_light"][0])            # lit top edge
    hline(d, x, y + 4, BOX_W, face_sh)                     # lid-to-face seam
    # two folded-in top flaps meeting at the centre (the classic closed-box read)
    cx = x + BOX_W // 2
    d.line([x + 2, y + 4, cx - 1, y], fill=face_sh)        # left flap fold
    d.line([x + BOX_W - 3, y + 4, cx + 1, y], fill=face_sh)  # right flap fold
    vline(d, cx, y, 4, PAL["wood_dark"][2])                # the flaps' centre gap
    # a strip of packing tape running down the front seam (white-ish, low-key)
    fill(d, cx - 2, y + 4, 4, BOX_H - 4, tape)
    vline(d, cx - 2, y + 4, BOX_H - 4, PAL["white"][0])
    dither(d, cx, y + 6, 2, BOX_H - 8, PAL["white"][2], phase=1)  # tape sheen/shade
    # the corrugated lower lip: a thin band of soft flutes (unmistakably cardboard
    # but quiet — light flutes on the face tone, not a row of dark teeth)
    fill(d, x + 1, y + BOX_H - 3, BOX_W - 2, 2, PAL["wood_light"][1])
    for fx in range(x + 2, x + BOX_W - 1, 2):
        vline(d, fx, y + BOX_H - 3, 2, face_sh)
    hline(d, x, y + BOX_H - 1, BOX_W, PAL["wood_dark"][1])
    # outline last so every edge is a clean 1px soft-black line (rule 2)
    frame(d, x, y, BOX_W, BOX_H, OUTLINE)
    hline(d, x, y + 4, BOX_W, OUTLINE)                     # crisp lid/face divider
    # L3-d warm key: an ember rim hugging the box's RIGHT face (light ON cardboard)
    for yy in range(y + 6, y + BOX_H - 3):
        if (yy + x) % 2 == 0:
            d.point((x + BOX_W - 2, yy), fill=PAL["ember"][2])
            d.point((x + BOX_W - 3, yy), fill=PAL["ember"][3])


# ── the pink-neon stripe across the back (a reflection on fur, never the eyes) ─

def _neon_back_stripe(d, cx: int, cy: int, frame_i: int, seed: int) -> None:
    """A smear of pink neon across the cat's BACK ridge — never over the eyes.

    §9: «Una mancha de neón rosa cruzándole el lomo, nunca encima de los ojos.»
    L3-a/L3-e: this is a faint REFLECTION of the alley's pink sign on the fur —
    NOT a worn collar/bib and NOT a glyph. So it must sit on the BACK RIDGE behind
    the upright chest (the top of the loaf haunch), read as a broken diagonal
    light-smear, and stay sparse + dim enough that it never competes with the
    face. market_cat's upright chest is cx+5..cx+10 / cy+6..cy+14; the haunch loaf
    behind it crests around cx+9..cx+15 / cy+7..cy+10. We lay the smear ONLY on
    that back crest (cx+9..cx+15), well to the right of and below the eyes
    (~cx+7/cx+10 at cy+1..cy+3 sit / cy+1 up), so it can never cross them. Bands
    of the ramp, broken by gaps (the wet ripple), never a glow blur (rule 3).
    (cx,cy) = the cat origin (top-left of its footprint).
    """
    bright, mid = PAL["neon_pink"][1], PAL["neon_pink"][2]
    r = random.Random(seed)
    # market_cat eyes are at cx+7..cx+10 / cy+1..cy+3. We start the smear at cx+11
    # (right of the rightmost eye column) and keep every pixel at y >= cy+7 (well
    # below the eyes), so it is GEOMETRICALLY impossible for the stripe to touch
    # them in any frame — honoring §9 «nunca encima de los ojos». It rides the
    # top-right curve of the loaf haunch (the only visible "back" in this frontal
    # sit): a short, sparse, dim diagonal — a reflection skidding over the fur.
    x0, x1 = cx + 11, cx + 16
    base_y = cy + 9                                         # on the haunch crest
    for i, bx in enumerate(range(x0, x1)):
        t = (bx - x0) / max(x1 - x0 - 1, 1)
        by = base_y - int(2 * t) + (r.randint(-1, 0) if i % 2 == 0 else 0)
        if frame_i == 1 and bx > cx + 12:                  # tail-flick lean
            by -= 1
        if (i + frame_i) % 3 == 1:                         # broken band (wet ripple)
            continue
        if by < cy + 6:                                    # hard floor: never near the face
            by = cy + 6
        d.point((bx, by), fill=bright if i % 2 == 0 else mid)
        d.point((bx, by + 1), fill=mid)                    # a 2px-thick smear
    # one bright glint where the sign catches the rump ridge (the reflection source)
    d.point((x1 - 1, base_y - 1), fill=PAL["neon_pink"][0])


# ── one frame ────────────────────────────────────────────────────────────────

def _frame(d, fi: int) -> None:
    """Compose one 64×64 cell: box, the shared cat (frame fi), neon back-stripe,
    and (frame 2 only) the warm steam wisp the up-tilted head looks at."""
    ox = fi * FRAME_W
    bx, by = ox + BOX_X, BOX_TOP
    cat_x, cat_y = ox + CAT_X, CAT_Y
    # the cardboard box (the seat) — drawn FIRST so the cat overlaps its lid
    _cardboard_box(d, bx, by)
    # frame 2 looks UP at a rising steam wisp: draw it BEHIND the cat (it rises
    # past the cat's face from the griddle just out of frame, warm).
    if fi == 2:
        C.steam(d, cat_x + 3, cat_y - 3, height=12, phase=0, warm=True)
        C.steam(d, cat_x + 9, cat_y - 1, height=9, phase=3, warm=True)
    # the cat — the shared builder, UNMODIFIED (same cat as the room + scene strip)
    C.market_cat(d, cat_x, cat_y, frame_i=fi)
    # the cosmetic pink-neon stripe across its back (after the cat, on top of fur)
    _neon_back_stripe(d, cat_x, cat_y, fi, seed=17 + fi)


def build() -> Image.Image:
    """Three transparent 64×64 cells: cat-on-box (blink / tail / lick+look-up)."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for fi in range(N_FRAMES):
        _frame(d, fi)
    return img


def main() -> None:
    img = build()
    C.save_asset(img, "cosmetics", "cosmetic-avatar-marketcat-strip.png")
    C.preview(img, "preview_cosmetic-avatar-marketcat-strip.png", scale=3)
    # a 6x zoom of each frame so the silhouette, the box read, the warm eyes, the
    # neon stripe (off the eyes) and the steam can be eyeballed up close
    big6 = img.resize((W * 6, H * 6), Image.NEAREST)
    C.save_out(big6, "zoom_cosmetic-avatar-marketcat-strip_6x.png")


if __name__ == "__main__":
    main()
