#!/usr/bin/env python3
"""obj-guestbook-signed.png — the 방명록 a heartbeat later: YOUR name, just added.

Dossier §11 (optional variant) + §6/§3 beat 3. This is the SAME 128×128 close-up
as obj-guestbook.png — the temple guestbook open on its low stand, its columns of
illegible vertical brush-names, the last (49-days-faded) signature near the spine
— with ONE thing changed: the player has just signed. Canon §3/§115: «Tu nombre,
torcido y húmedo, es la primera entrada del después» — "your name, crooked and
wet, is the first entry of the after". So a fresh, darker, slightly crooked ink
mark now sits just below the faded last name, the brush only lifted a moment ago
(a wet glisten still on it).

EVERYTHING ELSE IS IDENTICAL to obj-guestbook. To guarantee that byte-for-byte
(rule: "Keep everything else identical so it reads as the same book a moment
later"), this script does NOT re-author the book — it imports the exact drawing
pipeline of gen_obj-guestbook (stand, pages, spine, ruling, signatures, aging,
reference swatch) and runs it verbatim, then draws ONLY the fresh signature on
top. If the base book ever changes, this variant follows for free, and the two
PNGs are provably the same book.

The fresh name, like every other name on the page, is ILLEGIBLE at 1× (rule
L2-a: no readable Korean baked into art — the readable KO lives in the UI). It is
a column of SUGGESTED brush-syllables drawn with the SAME _SYLLABLES vocabulary
and the SAME _column() routine as the rest of the ledger (so it is unmistakably
"a name in the same hand you cannot read"), but rendered FRESH: the ink is the
darkest on the page (just-applied 청먹, ink[2]), it leans a touch more (crooked),
and a wet sheen sits at the brush's last contact. It lands in the blank lower
zone of the right page that obj-guestbook deliberately left waiting — directly
beneath the faded last signature near the spine.

Run from repo root:  python tools/escape-room-level02/gen_obj-guestbook-signed.py
Deterministic: no unseeded random (reuses the base book's fixed-arithmetic glyphs).
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw

import common as C
from common import PAL, OUTLINE, hline, vline, dither

HERE = Path(__file__).resolve().parent


def _load_base():
    """Import gen_obj-guestbook (hyphenated filename) as a module via importlib.

    Reusing its functions verbatim is the guarantee that the signed variant is the
    SAME book — same geometry constants (SPINE_X/TOP_Y/PAGE_H), same stand, pages,
    spine, ruling, signatures, aging and reference swatch — with only the fresh
    signature added on top.
    """
    spec = importlib.util.spec_from_file_location(
        "gen_obj_guestbook", HERE / "gen_obj-guestbook.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


B = _load_base()
W = H = B.W
SPINE_X = B.SPINE_X
TOP_Y = B.TOP_Y


# ── where the faded last name ends → where the fresh name begins ──────────────
# The base book draws the faded LAST signature at (SPINE_X+11, TOP_Y+8) as a
# single name via _column(...). _column lays syllables 6px apart and ends a name
# with a +4px lift, so we recompute its bottom EXACTLY (no magic offset) and start
# the fresh signature a small gap below it, in the blank zone the base left open.
def _faded_name_bottom() -> int:
    """Exact y where the base book's faded last name (seed=5, 1 name) ends."""
    seed, n = 5, 0
    syl_count = 2 + ((seed * 3 + n * 5) % 2)   # mirrors _column's fixed arithmetic
    y = (TOP_Y + 8) + syl_count * 6            # syllables stacked 6px apart
    return y                                    # (the per-name +4 lift is the gap)


FRESH_CX = SPINE_X + 11                  # same column as the faded last name
FRESH_TOP = _faded_name_bottom() + 5     # a brush-lift gap below the faded name


def _fresh_signature(d) -> None:
    """The player's name, JUST signed: darkest ink, a touch more crooked, still wet.

    Drawn with the base book's OWN _column() + _SYLLABLES so it is the same hand
    and the same illegible-at-1× discipline as every other name (rule L2-a), but
    distinguished as FRESH: the head ink is ink[2] (the darkest, just-applied), the
    body echo is ink[1] (wetter/heavier than the dry-brush ink[0] of old names), and
    a per-name lean of +1 keeps it a hair more crooked than the settled ledger. A
    unique seed gives it its own syllable shapes (a different name from the rest).
    """
    # reuse the EXACT column routine from the base module — same spacing, same
    # syllable vocabulary, same deterministic shape selection. fade=False (this
    # name is the opposite of the rain-washed last one: it is wet and dark).
    B._column(d, FRESH_CX, FRESH_TOP, 1, PAL["ink"][2], PAL["ink"][1], seed=6,
              fade=False)


def _wet_sheen(d) -> None:
    """The just-laid ink is still WET: a few damp glints + a soft bleed halo.

    Canon: «torcido y húmedo» — crooked and wet. A real fresh brush mark on hanji
    has (a) a darker pooled tail where the brush last lifted, and (b) a faint damp
    halo where the wet ink feathers into the paper fibres. Both are tiny and sit ON
    the fresh name only — never over the old dry names (those settled long ago).
    Dither/points only (no alpha), ink + a whisper of cool damp like the rest of
    the rain-damp page, so it stays in palette and reads as wetness, not a smudge.
    """
    # recompute the fresh name's bottom the same way the base _column does, so the
    # pooled tail sits exactly at the brush's last contact (no magic offset).
    seed, n = 6, 0
    syl_count = 2 + ((seed * 3 + n * 5) % 2)
    name_bot = FRESH_TOP + syl_count * 6 - 2

    # (a) the pooled tail of the last stroke — the darkest pixel on the page, a
    # 2px wet bead where the brush lifted, with a tiny gold-lit glisten on top.
    d.point((FRESH_CX, name_bot), fill=PAL["ink"][2])
    d.point((FRESH_CX + 1, name_bot), fill=PAL["ink"][2])
    d.point((FRESH_CX, name_bot + 1), fill=PAL["ink"][1])
    d.point((FRESH_CX, name_bot - 1), fill=PAL["gold_light"][1])   # wet glisten

    # (b) a faint damp feather-halo where the wet ink bleeds into the fibres —
    # warm hanji-shade, sparse, hugging the strokes (a wet NAME, not a stain). A
    # per-row width wobble so it reads as an organic damp bloom, not a rectangle.
    feather = (1, 2, 2, 1, 2, 2, 1, 2, 1, 2)
    for ry in range(FRESH_TOP - 1, name_bot + 2):
        hw = feather[(ry - FRESH_TOP) % len(feather)]
        dither(d, FRESH_CX - 2 - hw, ry, hw * 2 + 4, 1,
               PAL["hanji"][2], phase=ry % 2)

    # (c) a single cool damp whisper at the very base — the same rain-damp that
    # bled the faded name above, now meeting the fresh wet ink (one sparse row).
    dither(d, FRESH_CX - 3, name_bot + 1, 8, 1, PAL["rain"][0], phase=name_bot % 2)


def _offered_brush(d) -> None:
    """우담's brush, just lifted: a slim handle + dark-tipped bristle by the name.

    Canon §6 Cuarto 1 tooltip / §3 beat 3: «우담 te ofrece el pincel con las dos
    manos» — the monk offers the brush; you have just signed. A small 붓 resting
    diagonally over the lower-right blank page, its wet black tip pointing at the
    fresh name, sells "signed a moment ago" without any text. Kept compact and
    low-contrast (warm wood handle, ink tip) so the SIGNATURE stays the hero — the
    brush is a quiet supporting prop, in palette, with a soft contact shadow.
    """
    # geometry: a short, nearly-flat brush lying on the blank lower-right page,
    # LOW and to the right of the fresh name so a clean band of paper separates
    # the NAME (the hero) from the brush. Tip (lower-left, pointing up toward the
    # name it just wrote) to butt (upper-right). A shallow lean = "resting", not
    # "writing", which is the beat: the brush has been set down a moment ago. The
    # whole brush is kept inside the right page (outer edge ~x=110) so it never
    # floats off the paper into the transparent margin.
    tip_x, tip_y = FRESH_CX + 9, FRESH_TOP + 31
    bx, by = tip_x + 21, tip_y - 9             # butt end (up and to the right)

    # soft cool contact shadow of the brush on the page (it rests on the paper)
    for i in range(0, 27, 2):
        t = i / 26
        sx = int(tip_x + (bx - tip_x) * t) + 1
        sy = int(tip_y + (by - tip_y) * t) + 2
        d.point((sx, sy), fill=PAL["hanji"][3])

    # the bamboo handle: a 2px warm shaft from the ferrule up to the butt cap
    wl, wm, wd = PAL["wood_light"][1], PAL["wood_light"][2], PAL["wood_dark"][2]
    ferrule_x = tip_x + 7
    ferrule_y = tip_y - 4
    d.line([ferrule_x, ferrule_y, bx, by], fill=wm)
    d.line([ferrule_x + 1, ferrule_y, bx + 1, by], fill=wl)       # lit upper edge
    d.line([ferrule_x, ferrule_y + 1, bx, by + 1], fill=wd)       # shaded under
    # the butt cap (a small rounded end knob) + a hanging cord loop
    d.ellipse([bx - 1, by - 2, bx + 3, by + 2], fill=wm, outline=OUTLINE)
    d.point((bx + 1, by - 1), fill=wl)
    d.point((bx + 3, by + 2), fill=PAL["ember"][3])               # tiny cord knot

    # the metal ferrule binding the bristles to the handle (a short bright band)
    d.line([ferrule_x - 1, ferrule_y - 1, ferrule_x + 2, ferrule_y + 2],
           fill=PAL["metal"][1])
    d.point((ferrule_x, ferrule_y), fill=PAL["metal"][0])

    # the bristle head: a short dark wet wedge tapering to a fine point at the tip
    # (ink-loaded, the darkest cluster — it just wrote the name).
    d.line([ferrule_x, ferrule_y + 1, tip_x, tip_y], fill=PAL["ink"][2])
    d.line([ferrule_x, ferrule_y + 2, tip_x + 1, tip_y], fill=PAL["ink"][1])
    d.line([ferrule_x - 1, ferrule_y + 1, tip_x - 1, tip_y - 1], fill=PAL["ink"][2])
    d.point((tip_x, tip_y), fill=PAL["ink"][2])                  # the fine wet point
    d.point((tip_x - 1, tip_y), fill=PAL["ink"][1])
    d.point((ferrule_x + 1, ferrule_y + 3), fill=PAL["ink"][0])  # dry-brush edge


def build() -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 1) the EXACT base book, drawn by gen_obj-guestbook's own pipeline (verbatim).
    B._stand(d)
    B._page(d, left=True)
    B._page(d, left=False)
    B._spine(d)
    B._ruling(d)
    B._signatures(d)
    B._aging(d)
    B._reference_swatch(d)

    # 2) the one thing that changed: YOUR fresh signature, just below the faded
    #    last name — wet, crooked, darkest ink — plus the brush that wrote it.
    _fresh_signature(d)
    _wet_sheen(d)
    _offered_brush(d)

    return img


def main() -> None:
    img = build()
    C.save_asset(img, "objects", "obj-guestbook-signed.png")
    C.preview(img, "preview_obj-guestbook-signed.png", scale=3)
    # a 1× render to verify rule L2-a: the fresh signature must be ILLEGIBLE as
    # Korean at 1×, and the prop must still read as the same book.
    C.save_out(img, "obj-guestbook-signed_1x.png")
    # an 8× zoom of the right page's spine column so the faded LAST name and the
    # fresh wet name beneath it can be compared (faded-cool above, wet-dark below).
    crop = img.crop((SPINE_X + 2, TOP_Y, SPINE_X + 52, TOP_Y + 64))
    crop = crop.resize((crop.width * 6, crop.height * 6), Image.NEAREST)
    C.save_out(crop, "zoom_obj-guestbook-signed_fresh_6x.png")


if __name__ == "__main__":
    main()
