# Achievements: pixel-art icons + global garden trophies

**Date:** 2026-06-26
**Status:** Approved (design)
**Workstream:** 2 of 3 in the library-polish epic (pronunciation → **achievements** → usage notes)

## Problem

Achievement badges use emoji (🌱🔁📚🔥💪🌳), which clash with the app's hand-crafted
warm pixel-art identity. The owner wants original pixel-art icons that better
represent the garden brand, plus a richer set of achievements — the existing 6 are
per-grammar; add account-level garden milestones too.

## Icon system (shared by both PRs)

- New generator `tools/achievements/gen_badges.py`, reusing
  `tools/escape-room-level01/common.py` (brand palette `PAL`, `OUTLINE #2a1c14`,
  `rgb`, drawing helpers). Pure Python + Pillow, deterministic.
- Icons are **32×32 RGBA, transparent background**, output to
  `munbeop/public/img/achievements/<id>.png`. A review sheet (all icons, upscaled)
  is written to `tools/achievements/out/_sheet.png`.
- Rendered in the UI with `<img class="pixel" …>` (global
  `.pixel { image-rendering: pixelated }`). Per-grammar badges display ~32px;
  global trophies ~48px (integer-scaled, crisp).
- Theme: garden + Korean — seeds, sprouts, blossoms, level trees (cherry→ginkgo),
  watering can, hanji scroll, sunflower (brand gold), Bomi accents.

## PR 2a — per-grammar badges (study sheet)

`app/lib/achievements/index.ts` + `AchievementsSection.vue`. Re-skin the 6 existing
and add 3, for a seed→plant→tree arc (stable display order):

| id | meaning | unlock |
| --- | --- | --- |
| `sprouted` | practiced once | times ≥ 1 |
| `taking_root` *(new)* | reached plant mastery | mastery is `plant` or `tree` |
| `practiced_10` | practiced 10× | times ≥ 10 |
| `practiced_25` | practiced 25× | times ≥ 25 |
| `practiced_50` *(new)* | practiced 50× | times ≥ 50 |
| `streak_5` | five easy in a row | trailing easy streak ≥ 5 |
| `flawless` *(new)* | flawless point | ≥ 8 reviews, 0 hard ever |
| `comeback` | bounced back | ≥ 3 hard then ≥ 3 easy streak |
| `mastered` | tree mastery | mastery is `tree` |

Swap the emoji `ICONS` map for `/img/achievements/<id>.png`. New i18n under
`library.achievements.*` for the 3 new ids in all 8 locales. The derive function
stays pure; extend its unit tests.

## PR 2b — global garden trophies (/stats)

A pure `globalAchievementsFor(state)` in `app/lib/achievements/global.ts` +
a `useGlobalAchievements` composable layering on `useStats`, `useGardenState`,
`useLeeches`, the SRS/log/grammar stores. Rendered as a new `.block` "Achievements"
section on `app/pages/stats.vue` (between Toughest grammar and Struggling plants).
~16 trophies, all derivable:

`first_sprout` (≥1 review), `first_bloom` (≥1 tree), `green_thumb` (10 trees),
`gardener` (50 trees), `master_gardener` (½ catalog trees), `garden_complete`
(all trees), `topik_1_mastered` … `topik_6_mastered` (each deck all-tree),
`streak_7`, `streak_30`, `reviews_100`, `reviews_500`, `flourishing`
(≥10 trees & 0 leeches).

Locked = grayscale + lock affordance; earned = full color + gold border (matching
the per-grammar treatment). i18n under `stats.achievements.*` (8 locales) with
i18n-parity test. Pure-derive unit tests + a /stats component test.

## Out of scope

Usage notes (workstream 3). No new persistence — every achievement is derived from
existing state (matches the current per-grammar "no persistence" rule).

## Quality gate

Generate icons → self-review the upscaled sheet → iterate → show the owner for
style sign-off before wiring. Then standard gates (vitest, typecheck, eslint).
