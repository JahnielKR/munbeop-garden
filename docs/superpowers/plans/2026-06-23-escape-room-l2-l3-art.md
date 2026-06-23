# Escape Room L2 + L3 — Character Art Rework (Effort 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the L2/L3 escape-room characters read unambiguously as distinct people, and lift their scenarios toward the Level-1 quality bar, by reworking the 6 shared character builders and restaging every scene that consumes them.

**Architecture:** Deterministic Python (Pillow) pixel pipelines under `tools/escape-room-level0{2,3}/`. Shared builders live in each level's `common.py`; one `gen_*.py` per asset composes them onto a 320×240 (scenes) or transparent (objects/cosmetics) canvas and writes the final PNG into `munbeop/public/escape-room/level-0{2,3}/...`. Quality is verified by a render→look→iterate loop against the Level-1 style bible, plus byte-identical determinism re-renders and the app's existing gates. No engine/seed/runtime code changes (assets overwrite in place by filename).

**Tech Stack:** Python 3.13 + Pillow 12 + numpy 2 (verified present). App gates: pnpm + vitest + nuxt typecheck + eslint. Spec: [docs/superpowers/specs/2026-06-23-escape-room-l2-l3-art-audio-design.md](../specs/2026-06-23-escape-room-l2-l3-art-audio-design.md). Scope here = **art only (Effort 1)**; the real-CC0-ambient sound work (Effort 2) gets its own plan.

---

## Preamble — read once before any task

### Toolchain & how to run a generator

All commands run from the **worktree repo root**
(`C:/Users/home/Desktop/munbeop-garden-main/.claude/worktrees/admiring-haslett-f5348d`).

- Run one generator: `python tools/escape-room-level03/gen_room-01-hotteok.py`
- It writes: the **final PNG** (`save_asset` → under `munbeop/public/...`), a **3× preview** and (for rooms) a **hotspot overlay** under `tools/escape-room-level0X/out/`.
- `out/` and `__pycache__/` are gitignored; the final PNGs are committed.

### PAL / palette discipline (hard rules, from the L1 bible)

1. Only `common.PAL` ramps + `common.OUTLINE` (`#2a1c14`). **Never pure `#000000`.** A new tone must be derived from an existing ramp and annotated in a code comment.
2. No soft alpha — transitions via `dither()` (checkerboard) or colour bands.
3. Scenes (320×240) are fully opaque; objects/cosmetics keep a transparent background.
4. No legible in-scene Korean/numerals at 1× (L2-a / L3-a). Decorative ink stays illegible.

### Acceptance Rubric **R** (every art task must pass all of these)

- **R1 Silhouette:** filled black, the character's build reads at a glance (이모 short+round, 도윤 tall+lanky, 하나 slim, 우담 upright-serene). No lumpy blob.
- **R2 Face:** ≥2 px eyes + a 1 px brow/lid + a clear mouth; an **age/role cue** present (이모 creased smiling eyes + rosy cheeks; 도윤/하나 smooth young; 우담 serene closed eyes, shaved sheen).
- **R3 Palette:** unmistakably distinct per person (§4 of the spec); PAL-only; OUTLINE not `#000`.
- **R4 Staging:** in a **focal** scene the character sits in a warm dithered **light pool** and is the **highest-contrast** element; in a **mood beat** (L2 bell/outro, L3 outro) a *clean* backlit silhouette is acceptable.
- **R5 1× legibility:** at the real 320×240 game size (NOT only the 3× preview) the face/silhouette still read.
- **R6 Identity (8×):** the character is the SAME person across all their scenes (cross-anchor contact sheet).
- **R7 Determinism:** re-running the generator produces a **byte-identical** PNG.

### Standard Art Loop **SAL** (the per-asset procedure referenced by tasks)

1. Edit the builder in `common.py` and/or the `gen_*.py` (exact paths in the task).
2. Run the generator(s) for the asset.
3. **Read the 3× preview** (`tools/.../out/preview_*.png`) AND **Read the final PNG at 1×** (`munbeop/public/.../<asset>.png`) with the Read tool — look with your own eyes.
4. Critique against Rubric **R** + the spec. Write down each miss.
5. **Iterate ≥3 rounds** (edit → run → look) until every applicable R item passes.
6. **Determinism check (R7):** record `git hash-object <png>`, re-run the generator, record the hash again, confirm identical.
7. Commit (exact `git add` paths + message in the task).

### Determinism check command (R7)

```bash
H1=$(python tools/escape-room-level03/gen_room-01-hotteok.py >/dev/null; git hash-object munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png)
H2=$(python tools/escape-room-level03/gen_room-01-hotteok.py >/dev/null; git hash-object munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png)
[ "$H1" = "$H2" ] && echo "DETERMINISTIC ok" || echo "NON-DETERMINISTIC — fix seeding"
```

### Gate commands (used in Phase 3 and any time a sanity check helps)

- Escape-room tests only (fast): `pnpm --dir munbeop test escape-room`
- Full suite: `pnpm --dir munbeop test`
- Types: `pnpm --dir munbeop typecheck`
- Lint: `pnpm --dir munbeop lint`

### Execution note (ultracode)

Phases 1 and 2 are embarrassingly parallel (independent builders / scenes). They are well-suited to the **Workflow** tool, fanning out one agent per asset, each running its own SAL. **Chunk to ~4 concurrent agents** — a burst of ~16+ trips the art-pipeline server rate-limit (documented incident in L2/L3 art). Each agent must Read its own preview and iterate; an owner-agent eye-reviews the batch before commit.

---

## Phase 0 — Feasibility spike

Prove the toolchain + the craft/staging approach on ONE character before scaling.

### Task 0.1: Toolchain & determinism baseline

**Files:**
- Run-only (no edits): `tools/escape-room-level03/gen_room-01-hotteok.py`

- [ ] **Step 1: Re-render an existing asset unchanged and confirm byte-identical output**

Run:
```bash
H1=$(git hash-object munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png)
python tools/escape-room-level03/gen_room-01-hotteok.py
H2=$(git hash-object munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png)
echo "committed=$H1 regenerated=$H2"
```
Expected: `committed` == `regenerated` (the pipeline is deterministic and the working tree is clean). If they differ, STOP — investigate Pillow version drift before proceeding (a different libpng/Pillow can shift bytes; if so, note it and treat the freshly-regenerated baseline as canonical going forward).

- [ ] **Step 2: Confirm the preview + hotspot artifacts were written**

Run: `ls tools/escape-room-level03/out/ | head`
Expected: `preview_*.png` (and a hotspot overlay for the room) exist. Read one preview to confirm the Read tool renders it.

- [ ] **Step 3: Revert any working-tree noise**

Run: `git checkout -- munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png` (only if Step 1 regenerated identical bytes git may still mark mtime — confirm `git status` is clean).
No commit in this task.

### Task 0.2: Rework `imo()` + restage `room-01-hotteok` (the spike)

**Files:**
- Modify: `tools/escape-room-level03/common.py` — `imo()` (~410-447), `_imo_head()` (~449-470), `_busy_hands()` (~472-481)
- Modify: `tools/escape-room-level03/gen_room-01-hotteok.py` (staging: size, light pool, contrast)
- Output: `munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png`
- Preview: `tools/escape-room-level03/out/preview_room-01-hotteok.png`

**Acceptance criteria (Rubric R + specifics):**
- 이모 reads as a **short, round ~60-year-old**: rounder torso silhouette, kerchief clearly tied (tteok-red, identity), creased smiling eyes + rosy cheeks legible at 1×.
- She is **enlarged and foregrounded**, lit by the **griddle's ember glow** (warm rim + dithered light pool) so she is the highest-contrast element; the dark night recedes behind her.
- Hands still read as working hands at the griddle.
- R5 (1×) and R7 (determinism) pass.

- [ ] **Step 1: Rework the builder + staging**

Edit `imo()`/`_imo_head()` for a crisper round silhouette and a face that survives at 1× (thicker eye/lid strokes, clearer kerchief edge, defined cheeks). Edit `gen_room-01-hotteok.py` to draw a warm griddle light pool under/around her, enlarge her placement, and push the background darker behind her. Keep PAL-only; annotate any derived tone.

- [ ] **Step 2: Run the generator**

Run: `python tools/escape-room-level03/gen_room-01-hotteok.py`
Expected: exits 0; writes the PNG + `out/preview_room-01-hotteok.png`.

- [ ] **Step 3: Look (3× and 1×) and critique**

Read `tools/escape-room-level03/out/preview_room-01-hotteok.png` (3×) and `munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png` (1×). Critique vs the acceptance criteria; list misses.

- [ ] **Step 4: Iterate ≥3 rounds**

Repeat Steps 1-3 until every criterion passes at **1×**, not just 3×.

- [ ] **Step 5: Determinism check (R7)**

Run the determinism command from the preamble for `room-01-hotteok`. Expected: `DETERMINISTIC ok`.

- [ ] **Step 6: Owner checkpoint**

Present the 1× PNG to the owner. This spike validates the whole approach — get a 👍 (or adjust the rubric) before scaling to the other 5 characters.

- [ ] **Step 7: Commit**

```bash
git add tools/escape-room-level03/common.py tools/escape-room-level03/gen_room-01-hotteok.py munbeop/public/escape-room/level-03/rooms/room-01-hotteok.png
git commit -m "feat(escape-room): L3 imo character rework + hotteok restage (spike)"
```

---

## Phase 1 — Character builders (remaining 5)

Each task = one builder, run the **SAL**, pass Rubric **R**. These are independent → fan out (chunk ≤4). After a builder changes, ALL its consumer scenes must be regenerated (listed per task) so the committed PNGs reflect the new builder; the scene *composition* (staging) is refined in Phase 2, but the PNGs must never be left stale.

### Task 1.1: `monk()` 우담 (L2)

**Files:**
- Modify: `tools/escape-room-level02/common.py` — `monk()` (~314-370), `_monk_head()` (~373-386), `_monk_hands()` (~388-414)
- Regenerate consumers: `gen_room-01-dasil.py`, `gen_room-04-jongnu.py`, `gen_room-04-jongnu-clear.py`, `gen_cinematic-outro.py`
- Outputs: `level-02/rooms/room-01-dasil.png`, `room-04-jongnu.png`, `room-04-jongnu-clear.png`, `cinematic-outro.png`

**Acceptance (R + specifics):** 우담 reads as a serene shaved-head monk — grey 승복 + persimmon kasaya (identity), upright calm silhouette, serene closed-eye face hint legible. `seated_tea` (dasil) reads larger/clearer; `gassho` (jongnu/outro) is a clean backlit silhouette (mood beat, R4). Same person across all 4 scenes (R6).

- [ ] **Step 1:** Run the **SAL** (preamble) editing the files above. Regenerate ALL 4 consumer scenes each round: `python tools/escape-room-level02/gen_room-01-dasil.py && python tools/escape-room-level02/gen_room-04-jongnu.py && python tools/escape-room-level02/gen_room-04-jongnu-clear.py && python tools/escape-room-level02/gen_cinematic-outro.py`
- [ ] **Step 2:** Look at all 4 final PNGs at 1× + their previews; iterate ≥3 rounds until R passes.
- [ ] **Step 3:** Determinism check (R7) on each of the 4 PNGs.
- [ ] **Step 4: Commit**

```bash
git add tools/escape-room-level02/common.py munbeop/public/escape-room/level-02/rooms/room-01-dasil.png munbeop/public/escape-room/level-02/rooms/room-04-jongnu.png munbeop/public/escape-room/level-02/rooms/room-04-jongnu-clear.png munbeop/public/escape-room/level-02/rooms/cinematic-outro.png
git commit -m "feat(escape-room): L2 monk character rework + consumer-scene re-render"
```

### Task 1.2: `cat()` temple cat (L2)

**Files:**
- Modify: `tools/escape-room-level02/common.py` — `cat()` (~423-470), `_cat_ear()` (~416-420)
- Regenerate consumers: `gen_room-01-dasil.py`, `gen_sprite-cat-strip.py`, `gen_cosmetic-avatar-templecat.py`, `gen_cosmetic-avatar-templecat-strip.py`, `gen_cinematic-outro.py`
- Outputs: the above assets under `level-02/{rooms,objects,cosmetics}/`

**Acceptance (R1/R3/R5/R6/R7):** crisper cat silhouette (clear ears, haunch, tail) at 1×; same brown ramp/identity across frames. Secondary character — face minimalism OK. **Note:** `cosmetic-avatar-templecat` is a hand-enlarged redraw (`paint_cat`) that bypasses the builder — if the builder's fur ramp/ears change, re-sync `paint_cat` too (PENDIENTES L2).

- [ ] **Step 1:** Run the **SAL** editing the files above; regenerate all consumers each round.
- [ ] **Step 2:** Look 1× + iterate ≥3; verify the avatar redraw still matches the builder (R6).
- [ ] **Step 3:** Determinism (R7) on each output.
- [ ] **Step 4: Commit**

```bash
git add tools/escape-room-level02/common.py tools/escape-room-level02/gen_cosmetic-avatar-templecat.py munbeop/public/escape-room/level-02/rooms/room-01-dasil.png munbeop/public/escape-room/level-02/objects/sprite-cat-strip.png munbeop/public/escape-room/level-02/cosmetics/cosmetic-avatar-templecat.png munbeop/public/escape-room/level-02/cosmetics/cosmetic-avatar-templecat-strip.png munbeop/public/escape-room/level-02/rooms/cinematic-outro.png
git commit -m "feat(escape-room): L2 temple-cat silhouette cleanup + avatar re-sync"
```

### Task 1.3: `doyun()` 도윤 (L3)

**Files:**
- Modify: `tools/escape-room-level03/common.py` — `doyun()` (~483-546)
- Regenerate consumers: `gen_room-04-busstop.py`, `gen_room-04-busstop-bus.py`, `gen_cinematic-outro.py`
- Outputs: `level-03/rooms/room-04-busstop.png`, `room-04-busstop-bus.png`, `cinematic-outro.png`

**Acceptance (R + specifics):** tall lanky tense teen; `stand` keeps the dark mop, `window` is a near-shaved bust — the **mop↔shaved contrast must read as the same boy one hour later** (R6: same lanky build + jaw). Dark ink jacket (identity). Lit under the stop in `busstop`; backlit in the outro window is fine (mood).

- [ ] **Step 1:** Run the **SAL** editing `doyun()`; regenerate the 3 consumers each round.
- [ ] **Step 2:** Look 1× + iterate ≥3; explicitly verify the stand↔window identity at 8× side by side.
- [ ] **Step 3:** Determinism (R7) on each output.
- [ ] **Step 4: Commit**

```bash
git add tools/escape-room-level03/common.py munbeop/public/escape-room/level-03/rooms/room-04-busstop.png munbeop/public/escape-room/level-03/rooms/room-04-busstop-bus.png munbeop/public/escape-room/level-03/rooms/cinematic-outro.png
git commit -m "feat(escape-room): L3 doyun character rework + consumer re-render"
```

### Task 1.4: `hana()` 하나 (L3)

**Files:**
- Modify: `tools/escape-room-level03/common.py` — `hana()` (~548-596)
- Regenerate consumers: `gen_room-02-meokja.py`, `gen_cinematic-outro.py`
- Outputs: `level-03/rooms/room-02-meokja.png`, `cinematic-outro.png`

**Acceptance (R + specifics):** slim, tall, **high black ponytail** (identity silhouette), white tee under tteok-red apron — unmistakably distinct from 이모 (old/round/kerchief) and 도윤 (male/jacket/mop). Quick energetic posture. Lit at her bunsik bar.

- [ ] **Step 1:** Run the **SAL** editing `hana()`; regenerate the 2 consumers each round.
- [ ] **Step 2:** Look 1× + iterate ≥3; confirm she is not confusable with 이모/도윤.
- [ ] **Step 3:** Determinism (R7) on each output.
- [ ] **Step 4: Commit**

```bash
git add tools/escape-room-level03/common.py munbeop/public/escape-room/level-03/rooms/room-02-meokja.png munbeop/public/escape-room/level-03/rooms/cinematic-outro.png
git commit -m "feat(escape-room): L3 hana character rework + consumer re-render"
```

### Task 1.5: `market_cat()` (L3)

**Files:**
- Modify: `tools/escape-room-level03/common.py` — `market_cat()` (~887-944), `_cat_ear()` (~936-944)
- Regenerate consumers (grep first): `grep -rl market_cat tools/escape-room-level03/gen_*.py` then run each; plus `gen_cosmetic-avatar-marketcat.py` / `-strip.py` if they derive from it.
- Outputs: the cat's consumer PNGs under `level-03/{rooms,objects,cosmetics}/`

**Acceptance (R1/R3/R5/R6/R7):** crisp cat silhouette at 1×; consistent ramp across frames/scenes. Secondary character.

- [ ] **Step 1:** `grep -rl market_cat tools/escape-room-level03/gen_*.py` to list consumers.
- [ ] **Step 2:** Run the **SAL** editing `market_cat()`; regenerate every consumer from Step 1 each round.
- [ ] **Step 3:** Look 1× + iterate ≥3; determinism (R7) on each output.
- [ ] **Step 4: Commit** (`git add` the edited `common.py` + every regenerated PNG)

```bash
git commit -m "feat(escape-room): L3 market-cat silhouette cleanup + consumer re-render"
```

### Task 1.6: Cross-anchor identity contact sheets (R6)

**Files:**
- Run: `tools/escape-room-level02/gen_contact_sheet.py`, `tools/escape-room-level02/gen_family_contact_sheet.py`, `tools/escape-room-level03/gen_contact_sheet.py`

- [ ] **Step 1:** Regenerate the contact sheets: run the three scripts above.
- [ ] **Step 2:** Read each contact sheet (`out/contact_*.png` / `out/family_contact_sheet_*.png`). Verify at 8× that 우담, 이모, 도윤, 하나 (and the two cats) are the SAME person/animal across every scene they appear in. List any drift.
- [ ] **Step 3:** If drift found, fix the builder (re-run the affected character task's SAL) and re-verify. If clean, no commit needed (contact sheets are `out/`, gitignored).

---

## Phase 2 — Scene restage + scenario uplift

Per scene, run the **SAL** with the staging/uplift criteria below (Track A staging + Track B density, spec §4-§5). `room-01-hotteok` is already done (Phase 0).

### Task 2.1: L2 `room-01-dasil` — calm the floor, light the monk, add density

**Files:** Modify `tools/escape-room-level02/gen_room-01-dasil.py`; Output `level-02/rooms/room-01-dasil.png`; Preview `out/preview_room-01-dasil.png`.

**Acceptance:** the heavy diagonal floor hatching is **calmed** (it currently competes with the monk — reduce contrast/coverage); 우담 sits in a warm **window light pool** at highest contrast; **≥12 distinguishable props** (tea service, cushions, scrolls, brazier, plants, shelf items); PAL-only; 1× legible; deterministic. Hotspot centres still inside their seed rects (render `hotspot_debug` and check).

- [ ] **Step 1:** Run the **SAL** editing the gen script. Each round also render the hotspot overlay and confirm interactive objects stay within rects.
- [ ] **Step 2:** Iterate ≥3 at 1×; determinism (R7).
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level02/gen_room-01-dasil.py munbeop/public/escape-room/level-02/rooms/room-01-dasil.png
git commit -m "feat(escape-room): L2 dasil restage — light pool, calmer floor, denser props"
```

### Task 2.2: L2 `room-04-jongnu` (+ `-clear`) — clean gassho silhouette

**Files:** Modify `gen_room-04-jongnu.py`, `gen_room-04-jongnu-clear.py`; Outputs the two room PNGs.

**Acceptance:** the monk under the bell is a **clean backlit silhouette** (mood beat, R4) — readable upright gassho, not a blob; the rain→clear swap stays seamless (the only delta between the two PNGs is the rain/clear state). The "two shadows" easter-egg rule preserved (single standing man + 삿갓 shadow). Density/depth toward L1. Hotspots inside rects.

- [ ] **Step 1:** Run the **SAL**; regenerate BOTH scripts each round; diff the two PNGs to confirm only the intended rain/clear region differs.
- [ ] **Step 2:** Iterate ≥3 at 1×; determinism (R7) on both.
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level02/gen_room-04-jongnu.py tools/escape-room-level02/gen_room-04-jongnu-clear.py munbeop/public/escape-room/level-02/rooms/room-04-jongnu.png munbeop/public/escape-room/level-02/rooms/room-04-jongnu-clear.png
git commit -m "feat(escape-room): L2 jongnu — clean monk silhouette, seamless rain/clear swap"
```

### Task 2.3: L2 `room-02-daeungjeon` (+ `-complete`) & `room-03-seungbang` — depth + density

**Files:** Modify `gen_room-02-daeungjeon.py`, `gen_room-02-daeungjeon-complete.py`, `gen_room-03-seungbang.py`; Outputs the three room PNGs.

**Acceptance:** add depth/props toward the L1 density bar without breaking the existing altar/lantern-wall reads; the daeungjeon base↔complete swap stays seamless; 단청 palette unchanged where present; PAL-only; hotspots inside rects.

- [ ] **Step 1:** Run the **SAL**; regenerate the three scripts each round; confirm the base↔complete swap diff is intentional only.
- [ ] **Step 2:** Iterate ≥3 at 1×; determinism (R7) on all three.
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level02/gen_room-02-daeungjeon.py tools/escape-room-level02/gen_room-02-daeungjeon-complete.py tools/escape-room-level02/gen_room-03-seungbang.py munbeop/public/escape-room/level-02/rooms/room-02-daeungjeon.png munbeop/public/escape-room/level-02/rooms/room-02-daeungjeon-complete.png munbeop/public/escape-room/level-02/rooms/room-03-seungbang.png
git commit -m "feat(escape-room): L2 daeungjeon/seungbang — added depth and prop density"
```

### Task 2.4: L2 `cinematic-intro` — density + tone (outro already covered in 1.1)

**Files:** Modify `gen_cinematic-intro.py`; Output `level-02/rooms/cinematic-intro.png`.

**Acceptance:** opens the level with L1-grade atmosphere (rich, warm, dense); no close human face required (it is the establishing shot). PAL-only; deterministic.

- [ ] **Step 1:** Run the **SAL** at 1×; iterate ≥3; determinism (R7).
- [ ] **Step 2: Commit**

```bash
git add tools/escape-room-level02/gen_cinematic-intro.py munbeop/public/escape-room/level-02/rooms/cinematic-intro.png
git commit -m "feat(escape-room): L2 cinematic-intro — denser establishing atmosphere"
```

### Task 2.5: L3 `room-02-meokja` — light 하나, recede the neon wall

**Files:** Modify `gen_room-02-meokja.py` (and `common.neon_alley`/`neon_sign` params if needed); Output `level-03/rooms/room-02-meokja.png`.

**Acceptance:** the neon wall is **receded/veiled** and its strokes varied so they no longer read as digits ("111/444") at 1× (PENDIENTES); 하나 is **lit at her bar** at high contrast; this is the busiest scene → must still read cleanly; hotspots inside rects.

- [ ] **Step 1:** Run the **SAL**; if you tune `neon_alley`/`neon_sign` in `common.py`, regenerate every other scene that uses them (`grep -rl 'neon_alley\|neon_sign' tools/escape-room-level03/gen_*.py`) and re-verify them too.
- [ ] **Step 2:** Iterate ≥3 at 1× (confirm zero legible numerals); determinism (R7).
- [ ] **Step 3: Commit** (`git add` the gen script, `common.py` if touched, this PNG **and any other neon scenes regenerated**)

```bash
git commit -m "feat(escape-room): L3 meokja — recede neon wall, light hana"
```

### Task 2.6: L3 `room-03-manmulsang` (+ `-wrapped`) — light the keeper

**Files:** Modify `gen_room-03-manmulsang.py`, `gen_room-03-manmulsang-wrapped.py`; Outputs the two room PNGs.

**Acceptance:** the figure behind the counter is **lit by the bulb** and reads as a person at 1×; the base↔wrapped swap stays seamless (only the gift-wrap region differs); density toward L1; hotspots inside rects.

- [ ] **Step 1:** Run the **SAL**; regenerate both scripts each round; confirm the swap diff is intentional only.
- [ ] **Step 2:** Iterate ≥3 at 1×; determinism (R7) on both.
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level03/gen_room-03-manmulsang.py tools/escape-room-level03/gen_room-03-manmulsang-wrapped.py munbeop/public/escape-room/level-03/rooms/room-03-manmulsang.png munbeop/public/escape-room/level-03/rooms/room-03-manmulsang-wrapped.png
git commit -m "feat(escape-room): L3 manmulsang — light the keeper, seamless wrapped swap"
```

### Task 2.7: L3 `room-04-busstop` (+ `-bus`) — light 도윤 (already re-rendered in 1.3; refine staging)

**Files:** Modify `gen_room-04-busstop.py`, `gen_room-04-busstop-bus.py`; Outputs the two room PNGs.

**Acceptance:** 도윤 lit under the stop, lanky silhouette clear at 1×; the bus arrival variant swap stays seamless; wet-neon ground reflections kept; hotspots inside rects.

- [ ] **Step 1:** Run the **SAL**; regenerate both scripts each round; confirm swap diff intentional only.
- [ ] **Step 2:** Iterate ≥3 at 1×; determinism (R7) on both.
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level03/gen_room-04-busstop.py tools/escape-room-level03/gen_room-04-busstop-bus.py munbeop/public/escape-room/level-03/rooms/room-04-busstop.png munbeop/public/escape-room/level-03/rooms/room-04-busstop-bus.png
git commit -m "feat(escape-room): L3 busstop — light doyun, seamless bus-arrival swap"
```

### Task 2.8: L3 `cinematic-intro` & `cinematic-outro` — cast staging + fixes (outro chars re-rendered in 1.3/1.4)

**Files:** Modify `gen_cinematic-intro.py`, `gen_cinematic-outro.py`; Outputs the two cinematic PNGs.

**Acceptance:** outro stages the cast (이모/하나 waving, 도윤 in the bus window) cleanly; **resolve the orange window frame** (PENDIENTES — keep as intentional griddle-warmth focus OR remove the leftover) and **loosen the tight composition** (more platform between the figures and the bus); intro opens with L3 energy; L3-b honoured (nothing hidden, no second shadow); PAL-only; deterministic.

- [ ] **Step 1:** Run the **SAL** on both at 1×; iterate ≥3; determinism (R7) on both.
- [ ] **Step 2: Commit**

```bash
git add tools/escape-room-level03/gen_cinematic-intro.py tools/escape-room-level03/gen_cinematic-outro.py munbeop/public/escape-room/level-03/rooms/cinematic-intro.png munbeop/public/escape-room/level-03/rooms/cinematic-outro.png
git commit -m "feat(escape-room): L3 cinematics — cast staging, resolve outro frame + composition"
```

---

## Phase 3 — Art finish

### Task 3.1: Full 1× QA pass + update PENDIENTES

**Files:** Read all reworked PNGs at 1×; Modify `tools/escape-room-level02/PENDIENTES.md`, `tools/escape-room-level03/PENDIENTES.md`.

- [ ] **Step 1:** Read every reworked scene/character PNG at 1× one more time as a set; confirm cross-level consistency and that no scene regressed. List any residual nits.
- [ ] **Step 2:** Update both `PENDIENTES.md`: mark closed items (L3 neon prominence, outro orange frame, L2 monk tilt / cat paws) and record any new accepted-minor nits.
- [ ] **Step 3: Commit**

```bash
git add tools/escape-room-level02/PENDIENTES.md tools/escape-room-level03/PENDIENTES.md
git commit -m "docs(escape-room): update L2/L3 art PENDIENTES after character rework"
```

### Task 3.2: Cosmetic consistency sweep

**Files:** Regenerate + Read: `level-02/cosmetics/*` and `level-03/cosmetics/*` (avatars, frames, set-complete, bg).

- [ ] **Step 1:** Regenerate every cosmetic whose builder inputs changed (any cosmetic that draws a reworked character or a tuned `common` helper). `grep -rl 'monk\|cat\|imo\|doyun\|hana\|market_cat\|neon_' tools/escape-room-level0{2,3}/gen_cosmetic*.py` to find them; run each.
- [ ] **Step 2:** Read each regenerated cosmetic at 1×; confirm the character/avatar matches the new builder identity (R6). Iterate if drift.
- [ ] **Step 3:** Determinism (R7) on each; **Commit** the edited scripts + regenerated cosmetic PNGs.

```bash
git commit -m "feat(escape-room): re-sync L2/L3 cosmetics with reworked character builders"
```

### Task 3.3: Gates + in-app verification

- [ ] **Step 0 (staleness guard): regenerate EVERY L2+L3 asset and expect a clean tree.** This catches any consumer of a changed builder that a task forgot to regenerate (e.g. the `room-01-hotteok-closing` variant also draws 이모). With a clean working tree, run every generator and confirm nothing changed:

```bash
git status --porcelain | grep . && echo "DIRTY before regen — commit/stash first" || true
for f in tools/escape-room-level02/gen_*.py tools/escape-room-level03/gen_*.py; do python "$f" >/dev/null || echo "FAILED $f"; done
git status --porcelain munbeop/public/escape-room | grep . \
  && echo "STALE ASSETS — a builder change was not propagated; git add + commit them" \
  || echo "ALL ASSETS FRESH"
```
If any asset changed, Read it at 1× to confirm it's correct, then `git add` + commit (`fix(escape-room): regenerate stale variant assets after builder rework`).

- [ ] **Step 1:** `pnpm --dir munbeop test escape-room` → expect all escape-room tests pass (on-disk existence + theme tokens). Then `pnpm --dir munbeop typecheck` and `pnpm --dir munbeop lint` → expect clean (PNG-only changes should not affect either; if lint touches the gen scripts, fix).
- [ ] **Step 2:** Full suite once: `pnpm --dir munbeop test` → expect green (baseline ~3862 tests per project memory; confirm no regressions).
- [ ] **Step 3: In-app preview** (worktree quirks per memory: junction `node_modules`, `npx nuxi prepare`, copy parent `.env`, inject a fake `sb-*-auth-token` + `mungarden:theme`). Load L2 and L3; confirm each reworked room renders the **new PNG** (not the gradient fallback) and serves 200/image/png with no console errors. Capture a screenshot of one L2 and one L3 reworked scene as proof.
- [ ] **Step 4:** If any gate fails, fix and re-run before proceeding.

### Task 3.4: Open the PR

- [ ] **Step 1:** Push the branch and open a PR titled `feat(escape-room): L2+L3 character art rework + scenario uplift`, body summarizing the before/after per the spec, linking the spec + this plan, and noting Effort 2 (real CC0 ambient) is the follow-up. Include the in-app proof screenshots.

```bash
git push -u origin HEAD
gh pr create --title "feat(escape-room): L2+L3 character art rework + scenario uplift" --body "<summary + spec/plan links + screenshots>"
```

---

## Self-review (filled by the plan author)

- **Spec coverage:** §4 characters → Phase 0.2 + Phase 1 (all 6 builders) + Phase 2 staging; §5 scenarios → Phase 2 (2.1, 2.3, 2.4, 2.5, 2.8) + density criteria; §7 QA loop → SAL + Rubric R + Phase 3.3; §8 determinism → R7 on every task; §3 L1 bar → Rubric R. **Sound (§6 / Effort 2) is intentionally NOT in this plan** — separate plan, per owner "art first".
- **Placeholder scan:** the PR body `<summary>` in Task 3.4 is the only fill-in, intentionally (depends on final results); all art "implementation" steps are the SAL with concrete per-asset acceptance criteria rather than pre-authored pixel code, because good sprite pixels are the *output* of the iterate loop, not pre-knowable — this is the correct adaptation of TDD to generative art (the rubric + determinism + gates are the executable checks).
- **Path/identity consistency:** builder→consumer mappings cross-checked against `common.py` line ranges and `gen_*.py` filenames from the worktree listing; every task that edits a shared `common.py` helper regenerates ALL its consumers in the same commit (no stale PNGs).
