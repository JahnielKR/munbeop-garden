# pixel-trees — TOPIK garden asset pipeline

Procedural generator for the 6 level trees of the garden dashboard.
**Never edit the PNGs by hand** — tune the generator and regenerate:

```
python tools/pixel-trees/generate_trees.py
```

Requires Python 3.10+ and Pillow (`pip install pillow`).

## Outputs

| Path | What |
| --- | --- |
| `munbeop/public/img/tree/<species>/*.png` | 5 layers per species (30 files) |
| `munbeop/public/img/tree/ground_shadow.png` | shared ground ellipse, same 128×160 canvas |
| `munbeop/public/img/tree/particles/*.png` | 8×8 sprites: `petal_pink`, `leaf_red`, `leaf_gold` |
| `tools/pixel-trees/out/contact_sheet.png` | review grid: species × growth states (gitignored) |
| `tools/pixel-trees/out/lineup.png` | the 6 full trees on light + dark bg (gitignored) |

Canvas is **128×160** with the trunk anchored at **(64,148)**. Every layer of
a species is rendered from one deterministic geometry (fixed seed), so the
PNGs align pixel-perfect when stacked.

## Layers (cumulative — consumers never remove a lower layer)

| Order | File | Appears at | i18n state |
| --- | --- | --- | --- |
| 0 | `tree_skeleton.png` | always | `garden.state.dormant` |
| 1 | `trunk_alive.png` | ≥ 10% | `garden.state.sprouting` |
| 2 | `leaves_layer_1.png` | ≥ 10% | `garden.state.sprouting` |
| 3 | `leaves_layer_2.png` | ≥ 40% | `garden.state.leafy` |
| 4 | `bloom_full.png` | ≥ 80% | `garden.state.bloom` |

Thresholds are exported as `TREE_THRESHOLDS` by
`munbeop/app/components/garden/PixelTree.vue` — keep both in sync.

## Species ↔ levels and visual signatures

| Level | Species | Tree | Full-bloom signature |
| --- | --- | --- | --- |
| 1 | `cherry` | 벚꽃 | weeping pink crown + sparkle + drifting petals |
| 2 | `magnolia` | 목련 | twin trunk + wine-cup flowers |
| 3 | `zelkova` | 느티나무 | giant dome + 금줄 rope with hanji strips + fireflies |
| 4 | `mugunghwa` | 무궁화 | triple-stem shrub + flowers with red 단심 center |
| 5 | `maple` | 단풍나무 | ember gradient + falling leaves + red carpet |
| 6 | `ginkgo` | 은행나무 | the tallest + golden carpet + light motes |

Rule: if you add a species, its `bloom_full` must equal or beat the "wow"
of its neighbor level — unlocking a tree has to feel like an achievement.

## Tuning (the `SPECIES` dict in `generate_trees.py`)

| Key | Effect |
| --- | --- |
| `seed` | deterministic geometry; bump to reroll the silhouette |
| `trunk_top` / `trunk_w` / `leader` | trunk height, base width, ginkgo central leader |
| `twin_tops` / `stems3` | magnolia twin trunk / mugunghwa shrub stems |
| `bow`, `droop` | branch curvature and weeping gravity (cherry) |
| `clumps` | `(cx, cy, rx, ry, major)` crown ellipses; majors get a branch grown into them |
| `leaf` / `bloom` | 4-tone palettes, light → dark |
| `bloom_mode` | `recolor` (full repaint), `flowers` (sprites over leaves), `ambience` (deepen + motes) |
| `signatures` | `carpet` (color, color, radius), `rope` (y), `motes` (color), `floats` (particle kind), `sparkle` (color), `ember` (vertical gradient) |

Review loop: regenerate → check `out/contact_sheet.png` (all states) and
`out/lineup.png` (light/dark legibility) → open `preview.html`.

## preview.html

Double-click it. Species buttons, progress slider (cumulative layers, same
thresholds), day/night sky, shadow toggle, and a **calibrate** mode that
prints `{ top, left }` percent anchors on click — paste those into
`munbeop/app/lib/garden/zone-anchors.ts` when a silhouette changes.

## UI sprites

`generate_ui_sprites.py` writes `munbeop/public/img/tree/ui/`
(`chest_16.png`, `chest_16_open.png`, `lock_8.png`) — diary chest and
padlock used by the garden overlays. Same outline (`#201510`) and wood/gold
palette as the trees. Emojis are forbidden in the garden stage; these
sprites are the replacement.

Spec: `docs/superpowers/specs/2026-06-11-garden-tree-dashboard.md`
Plan: `docs/superpowers/plans/2026-06-11-garden-tree-dashboard.md`
