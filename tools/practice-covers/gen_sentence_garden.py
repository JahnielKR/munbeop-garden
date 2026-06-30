#!/usr/bin/env python3
"""Cover — Sentence Garden (문장 정원). A dawn garden bed where each word of a
Korean sentence is a wooden plant-label staked in the soil, in order: 꽃에 ·
물을 · 줘요 ("water the flowers" — the app waters a plant when you answer
right). The last card is lifted on a warm glow, mid-placement (the tap-to-place
mechanic), with its empty slot waiting in the soil below; a grey decoy card
('빵을') floats aside — it doesn't belong. Sprouts and a flower grow at the
bases. Distinct from the indoor labs: this one is outdoors at sunrise."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import coverkit as K
from coverkit import (OUTLINE, PAL, dither, drop_shadow, fill, frame, hline,
                      vline)

WOODL, WOODD = PAL["wood_light"], PAL["wood_dark"]
HANJI = PAL["hanji"]
DAWN, GOLD = PAL["dawn"], PAL["gold_light"]
GREEN, BLUE = PAL["green"], PAL["blue"]
PINK, GRAY = PAL["pink"], PAL["gray"]

GROUND_Y = 122  # soil surface where the stakes enter


def draw_sky(d):
    """A soft sunrise: blue up top dithering down into warm dawn cream."""
    fill(d, 0, 0, K.W, GROUND_Y, DAWN[0])           # warm cream wash
    fill(d, 0, 0, K.W, 34, BLUE[0])                  # cool blue band up top
    dither(d, 0, 30, K.W, 12, BLUE[0], phase=0)      # blue → cream fade
    dither(d, 0, 54, K.W, 14, DAWN[1], phase=1)      # peach haze mid-sky
    # rising sun, upper-right, glowing over the bed
    K.warm_glow(d, 278, 44, 50, ramp=GOLD, clip_y=GROUND_Y)
    d.ellipse([266, 32, 290, 56], fill=GOLD[0], outline=GOLD[2])
    # a couple of soft low clouds
    for cx, cy, cw in ((150, 24, 22), (196, 32, 16)):
        d.ellipse([cx - cw, cy - 4, cx + cw, cy + 6], fill=DAWN[0])
        dither(d, cx - cw, cy + 2, cw * 2, 5, HANJI[0], phase=0)
    for sx, sy in ((118, 44), (210, 56), (96, 20)):
        K.sparkle(d, sx, sy, GOLD[0])


def draw_soil(d):
    """The garden bed: textured brown soil with a grassy lip and furrows."""
    fill(d, 0, GROUND_Y, K.W, K.H - GROUND_Y, WOODD[1])
    dither(d, 0, GROUND_Y, K.W, K.H - GROUND_Y, WOODD[2], phase=1)
    # scattered soil specks (light + dark) for tilth
    for sx in range(6, K.W, 19):
        d.point((sx, GROUND_Y + 10), fill=WOODD[3])
        d.point((sx + 9, GROUND_Y + 22), fill=FLOORY)
        d.point((sx + 4, GROUND_Y + 34), fill=WOODD[3])
    # two darker furrow rows
    hline(d, 0, GROUND_Y + 16, K.W, WOODD[2])
    hline(d, 0, GROUND_Y + 30, K.W, WOODD[2])
    # grassy front lip
    fill(d, 0, GROUND_Y - 2, K.W, 3, GREEN[2])
    hline(d, 0, GROUND_Y - 2, K.W, GREEN[3])
    for gx in range(2, K.W, 7):
        h = 3 + ((gx // 7) % 3)
        vline(d, gx, GROUND_Y - 2 - h, h, GREEN[1])
        vline(d, gx + 1, GROUND_Y - 2 - (h - 1), h - 1, GREEN[2])


FLOORY = PAL["floor"][1]


def sprout(d, cx, base_y, size=1):
    """A small green sprout: stem + two leaves."""
    stem_h = 6 + 2 * size
    vline(d, cx, base_y - stem_h, stem_h, GREEN[3])
    d.ellipse([cx - 4, base_y - stem_h - 1, cx, base_y - stem_h + 4], fill=GREEN[1])
    d.ellipse([cx, base_y - stem_h - 4, cx + 5, base_y - stem_h + 1], fill=GREEN[0])
    d.point((cx, base_y - stem_h), fill=GREEN[3])


def flower(d, cx, base_y, petal=None):
    """A little flower: stem, leaf, 4 petals, gold center."""
    petal = petal or PINK
    stem_h = 14
    vline(d, cx, base_y - stem_h, stem_h, GREEN[3])
    d.ellipse([cx - 5, base_y - 9, cx - 1, base_y - 5], fill=GREEN[1])  # leaf
    fy = base_y - stem_h
    d.ellipse([cx - 4, fy - 5, cx + 4, fy + 3], fill=petal[1], outline=petal[2])
    d.ellipse([cx - 5, fy - 2, cx - 1, fy + 2], fill=petal[0])  # L petal
    d.ellipse([cx + 1, fy - 2, cx + 5, fy + 2], fill=petal[0])  # R petal
    d.ellipse([cx - 2, fy - 5, cx + 2, fy - 1], fill=petal[0])  # top petal
    d.ellipse([cx - 1, fy - 1, cx + 1, fy + 1], fill=GOLD[1])   # center


def word_card(d, img, cx, word, lift=0, decoy=False, float_top=None):
    """A wooden plant-label staked in the soil bearing one Korean word.

    lift>0 raises it off the bed (mid-placement) with a glow + empty slot.
    decoy=True renders it grey and floating up in the sky (no stake) — it is
    the spare card that doesn't belong; float_top sets its sky y-position."""
    cw, ch = 58, 42
    if decoy:
        cw, ch = 46, 32
    top = float_top if float_top is not None else (GROUND_Y - ch) - lift
    left = cx - cw // 2

    if not decoy:
        # stake driven into the soil
        stake_top = top + ch
        stake_h = (GROUND_Y + 12) - stake_top
        vline(d, cx, stake_top, stake_h, WOODD[3])
        vline(d, cx - 1, stake_top, stake_h, WOODD[2])

    if lift > 0:
        # empty slot waiting in the soil + warm placement glow
        fill(d, left + 4, GROUND_Y + 2, cw - 8, 6, WOODD[3])
        K.warm_glow(d, cx, top + ch // 2, 46, ramp=GOLD, clip_y=GROUND_Y)

    drop_shadow(d, left, top + ch, cw)

    frame_c = GRAY[2] if decoy else WOODD[1]
    fill(d, left - 3, top - 3, cw + 6, ch + 6, frame_c)
    frame(d, left - 3, top - 3, cw + 6, ch + 6, OUTLINE)
    for gx in range(left - 3, left + cw + 3, 9):  # plank grain on the frame
        vline(d, gx, top - 3, 2, WOODD[3] if not decoy else GRAY[3])

    face = GRAY[0] if decoy else HANJI[0]
    speck = GRAY[1] if decoy else HANJI[1]
    fill(d, left, top, cw, ch, face)
    dither(d, left, top, cw, ch, speck, phase=1)
    fill(d, left + 2, top + ch - 4, cw - 4, 3, HANJI[3] if not decoy else GRAY[2])
    frame(d, left, top, cw, ch, GRAY[2] if decoy else WOODD[2])

    glyph_c = GRAY[3] if decoy else WOODD[3]
    K.glyph(img, word, cx, top + ch // 2, 17 if decoy else 19, fill_c=glyph_c)


def main():
    img, d = K.new_canvas(bg=DAWN[0])
    draw_sky(d)
    draw_soil(d)

    # the spare decoy floats up in the left sky — it doesn't belong
    word_card(d, img, 46, "빵을", decoy=True, float_top=18)
    K.sparkle(d, 74, 24, GRAY[1])
    K.sparkle(d, 30, 50, GRAY[1])

    # the sentence, planted in order: 꽃에 · 물을 · 줘요 ("water the flowers")
    word_card(d, img, 90, "꽃에")
    word_card(d, img, 160, "물을")
    word_card(d, img, 230, "줘요", lift=12)  # mid-placement, glowing

    # life at the bases
    sprout(d, 64, GROUND_Y + 1, size=1)
    sprout(d, 126, GROUND_Y + 2, size=2)
    sprout(d, 196, GROUND_Y + 1, size=1)
    flower(d, 290, GROUND_Y + 2, petal=PINK)
    flower(d, 28, GROUND_Y + 3, petal=DAWN)

    K.sparkle(d, 230, 64, GOLD[0])
    K.sparkle(d, 214, 88, GOLD[0])

    K.save_cover(img, "sentence-garden-cover.png")
    K.preview(img, "preview_sentence_garden.png", scale=3)
    K.card_sim(img, "card_sentence_garden.png")


if __name__ == "__main__":
    main()
