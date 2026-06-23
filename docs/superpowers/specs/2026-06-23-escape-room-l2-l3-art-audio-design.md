# Escape Room L2 + L3 — Character art rework & real ambient audio

Design doc · 2026-06-23 · Owner: JahnielKR

## 1. Context & problem

Levels 1–3 of the escape room ship full pixel art + audio (deterministic Python
pipelines under `tools/escape-room-level0{1,2,3}{,-audio}/`, all present in this
worktree). Two quality gaps, confirmed by the owner with art in front of him:

**Characters don't read as people.** L2 puts the monk 우담 at the centre of the
tea-room and the bell pavilion; L3 puts 순자 이모 / 도윤 / 하나 at their market
stalls. In the shipped renders these figures read as 2-colour blobs — you cannot
tell a ~60-year-old ajumma from a 19-year-old boy from a girl. Level 1, by
contrast, looks great: its `common.py` has **no character builder at all** — it
is 100% environment (dense props, warm palette, golden light pools, dithering),
and its single human (a tiny distant figure in the outro) hides its crudeness by
being small and far. The owner's instruction: *use Level 1 as the gold standard;
fix the characters of L2/L3, and lift their scenarios too.*

Root-cause breakdown (from reading the builders + renders):

- **Scale-in-composition.** Even L3's builders are ~50 px tall (`imo` ~28×54,
  `doyun`/`hana` ~22×52), but they are staged small within the 320×240 frame and
  swallowed by dark backgrounds. The L2 monk is genuinely tiny in `room-01-dasil`.
- **Face legibility.** An 11 px face with single-pixel eyes collapses against
  dark/busy backdrops (L3 night market; L2's heavy diagonal floor hatching).
- **No staging contrast.** Characters are not isolated in a light pool, so they
  never become "the point of interest with the highest contrast" (L1 rule).
- **Soft silhouettes.** Round-ellipse torsos read as lumps; the silhouette does
  not carry age/role/build at a glance.

**Background sound is bad.** The 9 ambient beds (5 in L2, 4 in L3) are 100%
procedural DSP — periodic rFFT noise + loop-locked tones (`gen_ambient.py`). They
are clean by metric but, by construction, sound like *filtered noise*, not like
real rain or a real market. They were always flagged as "unheard placeholders."

## 2. Goals / non-goals

**Goals**
- L2/L3 characters read unambiguously as distinct people (age, role, build,
  mood) at the real 320×240 game scale, per the **Hybrid** direction (below).
- L2/L3 scenarios rise toward L1's density/warmth/palette discipline.
- The 9 ambient background beds are replaced with **real CC0 field recordings**,
  looped seamlessly, that actually sound like their place.

**Non-goals (out of scope for this spec)**
- Re-recording the TTS voice lines (이모/도윤/하나/우담) — separate later pass.
- Replacing SFX (bell, griddle, etc.) — "sonido de fondo" = ambient beds only;
  SFX may be a follow-up.
- Levels 4–10, the paywall (Step 17), and any engine/seed logic changes beyond
  wiring already-generated variant scenes if we touch them.

## 3. The Level-1 quality bar (principles to port)

Extracted from `tools/escape-room-level01/STYLE.md`. These become the rubric the
QA loop checks L2/L3 against:

1. **Palette discipline** — only `common.PAL` ramps (+ `OUTLINE` `#2a1c14`, never
   pure `#000000`). New tones are derived from an existing ramp and annotated.
2. **No soft alpha** — transitions via `dither()` (checkerboard) or colour bands.
3. **Warm light pools** — a dithered golden pool from the scene's light source;
   the focal object/character sits in it at the **highest contrast in the scene**.
4. **Density** — ≥12 distinguishable props per room; every large surface textured
   (`wood_planks`, `hanji_wall`, flecks); every object casts a contact shadow.
5. **Flat frontal perspective** — back wall up top, floor below, wall/floor seam
   ~y140–155, wood skirting at the join.
6. **No legible in-scene text** (L2-a / L3-a rule already in force).
7. **Mandatory look-iterate loop** — render → *look with your own eyes* (Read the
   3× preview) → critique vs the bible → iterate **≥3 rounds** per asset.

## 4. Track A — Character rework (the heart)

Rewrite the 6 character builders in the two `common.py` files to a higher craft
bar, then restage every scene that consumes them. Because the builders are
shared, fixing the builder propagates to all that character's scenes — the same
mechanism that already guarantees cross-scene identity.

**Universal craft upgrades (all 6 builders):**
- **Crisper silhouette** — replace lumpy ellipse torsos with a deliberate body
  outline that carries build (이모 short+round, 도윤 tall+lanky, 하나 slim, monk
  upright-serene). Silhouette must be readable as a solid black shape.
- **Readable minimal face** — at least 2 px eyes with a 1 px brow/lid and a clear
  mouth; an age cue (이모: creased smiling eyes + rosy cheeks; 도윤/하나: smooth
  young face; monk: serene closed eyes). Faces only need to work at the size the
  character is actually staged at (see staging below) — bigger staging buys
  legibility cheaply.
- **Distinct palette per person** (already partly true; make it unmissable):
  이모 = ember apron + tteok-red kerchief; 하나 = white tee under tteok-red apron
  + black high ponytail; 도윤 = ink-dark jacket + mop (→ shaved bust in the bus);
  monk 우담 = grey 승복 + persimmon kasaya, shaved head.
- **Contact shadow + rim light** — a warm rim where the scene's light hits them
  (griddle / window / streetlamp), pulling them off the background.

**Staging (the Hybrid rule):**
- **Focal, close scenes → bigger + light pool.** Enlarge the focal character and
  drop a warm dithered light pool under/around them so they pop:
  - L2 `room-01-dasil`: seat 우담 larger in a window-light pool; calm the heavy
    diagonal floor hatching that currently competes with him.
  - L3 `room-01-hotteok`: 이모 lit by the griddle's ember glow, foregrounded.
  - L3 `room-02-meokja`: 하나 lit at her bunsik bar; **recede the neon wall** that
    PENDIENTES flags as too prominent (reads as "111/444").
  - L3 `room-03-manmulsang`: the figure behind the counter lit by the bulb hum.
  - L3 `room-04-busstop`: 도윤 under the stop's light, lanky silhouette clear.
- **Pure-mood beats → silhouette/backlit is a virtue, keep it.** L2 bell pavilion
  (`room-04-jongnu`, `cinematic-outro`) and L3 `cinematic-outro` (last bus under
  neon) stay backlit/silhouette — but with a *clean* silhouette, not a blob.

**Builders & their consumers (current sizes → intent):**

| Builder | File | Current | Consumers | Change |
|---|---|---|---|---|
| `monk()` | L2 | ~30×46 seated / ~22×40 gassho | dasil, jongnu(+clear), outro | bigger+lit in dasil; cleaner gassho silhouette in jongnu/outro |
| `cat()` | L2 | ~16×16 | dasil, strip, avatar, outro | crisper silhouette; secondary |
| `imo()` | L3 | ~28×54 | hotteok, outro | rounder read, creased face, griddle rim-light, bigger in hotteok |
| `doyun()` | L3 | ~22×52 (+~24×26 bust) | busstop, outro | lankier silhouette; keep mop↔shaved contrast |
| `hana()` | L3 | ~22×52 | meokja, outro | slim+ponytail pop; lit at bar |
| `market_cat()` | L3 | ~16×16 | several | crisper silhouette; secondary |

**Cross-anchor check (kept from existing QA):** verify at 8× that each character
is the SAME person across all their scenes (as the L2 monk already is, pixel-for-
pixel via the shared builder). Cosmetic avatars (templecat/marketcat) are cats —
re-sync only if `common.cat()`/`market_cat()` ramps change.

## 5. Track B — Scenario uplift (secondary)

Apply the L1 bar to L2/L3 backgrounds, focused where it also helps the characters:
- **L2** — tame the flat diagonal hatching in `room-01-dasil` (reads noisy); add
  props toward the ≥12 density (tea service, cushions, scrolls, brazier, plants);
  warm window light pool. `daeungjeon` altar already reads — add depth only.
- **L3** — recede/veil the `room-02-meokja` neon wall and vary `neon_sign` strokes
  so they don't read as digits (PENDIENTES); resolve the `cinematic-outro` orange
  window frame (intentional focus vs leftover) and loosen its tight composition;
  keep the wet-neon ground reflections (they already look good); add street props.

## 6. Track C — Background sound (real CC0)

Replace the 9 procedural ambient beds with **real field recordings**, edited into
seamless loops. The owner can hear; I cannot — so this track is **collaborative**:
I source/process clean, correctly-licensed candidates; the owner auditions and
picks. That turns the "unheard placeholder" into a real-ear decision.

**The 9 beds & their target mood:**

| Level | File | Mood to source |
|---|---|---|
| L2 | `ambient-dasil` | warm rain on a wooden eave + faint brazier room-tone |
| L2 | `ambient-daeungjeon` | darkest/muffled temple hall, deep rain |
| L2 | `ambient-seungbang` | intimate small room, soft rain, low room-tone |
| L2 | `ambient-jongnu` | widest, open courtyard rain + wind |
| L2 | `ambient-jongnu-clear` | post-rain near-silence: spaced drips + birds |
| L3 | `ambient-hotteok` | griddle sizzle + near market crowd + far traffic |
| L3 | `ambient-meokja` | loudest alley: broth bubbling, voices, scooter |
| L3 | `ambient-manmulsang` | intimate corner: bulb hum, muffled market |
| L3 | `ambient-busstop` | edge: receding bustle, street, idling bus |

**Sourcing & licensing.** Prefer **Pixabay audio** (Pixabay Content License — no
attribution, commercial OK) and **Freesound CC0**. Avoid CC-BY where possible; if
any CC-BY clip is the clear best, keep a `SOURCES.md` + credits entry. Record every
clip's source URL + license in `tools/escape-room-level0{2,3}-audio/SOURCES.md`.
Real recordings keep "no trackers" intact (they are static files). Weight: 9 mono
OGG loops ≈ 1–2 MB total — acceptable.

**Processing pipeline (per bed):** fetch → trim to the cleanest segment →
high-pass out rumble if needed → loudness-normalize toward the existing target
(`RMS ≈ −22 dBFS`, peak ceiling) → **seamless loop** via equal-power crossfade of
the head/tail → encode **44.1 kHz mono OGG/Vorbis** (matching the current files so
no wiring changes). Length can be the natural 8–20 s; `useEscapeRoomAudio.ts`
loops by filename, so **no seed/code change is required** — we overwrite the OGGs
in place.

**Procedural generators** (`gen_ambient.py`) are **archived, not deleted** — kept
as a fallback and as the documented prior approach.

**Audio QA loop:** I verify format/level/seam metrics (reuse `qa_audio.py`); the
**owner auditions each bed** and approves or asks for a different clip.

## 7. QA / iterate loop (non-negotiable)

- **Art:** for every reworked builder and restaged scene — render → Read the 3×
  preview → critique against §3 → iterate **≥3 rounds**; then a 1× real-scale pass
  (the size the player sees) to confirm faces/silhouettes hold; then the 8×
  cross-anchor identity check. In-app preview render as the final gate.
- **Audio:** metrics pass + owner audition pass per bed.
- **Gates:** `pnpm --dir munbeop test`, `nuxt typecheck`, lint all green; in-app
  dev preview shows the new art (not the gradient fallback) and streams the new
  OGGs (206), no console errors. (Worktree quirks per memory: dummy `.env`,
  fake `sb-*-auth-token`, `mungarden:theme`.)

## 8. Determinism & pipeline hygiene

- Art stays deterministic (seeded; byte-identical re-render per asset). No pure
  `#000000`; new tones derived from PAL ramps and annotated. `out/` + `__pycache__`
  stay gitignored.
- Audio: real files are deterministic by being committed; their provenance lives
  in `SOURCES.md`. (TTS/network determinism is not in scope here.)
- Update each pipeline's `PENDIENTES.md` with what this pass closed / left.

## 9. Sequencing (phases)

Owner decision (2026-06-23): **art first**, then sound. Art and sound ship as
**separate PRs** (sound is shippable on its own).

### Effort 1 — Art (characters + scenes) · one PR

**Phase 0 — Feasibility spike:** rework ONE character builder (`imo`) + restage
`room-01-hotteok` → render → eye-review at 1×. Confirms the craft+staging approach
before doing all six.

**Phase 1 — Characters:** rewrite the remaining 5 builders (monk, cat-L2, doyun,
hana, market-cat) + cross-anchor identity at 8×.

**Phase 2 — Scenes:** restage the feature scenes (Track A staging) + scenario
uplift (Track B), level by level, ≥3 look-iterate rounds each.

**Phase 3 — Art finish:** full 1× QA pass, cosmetic-consistency check, wire any
generated-but-unwired variant scenes if touched, gates + in-app verify, update
PENDIENTES, commit/PR.

### Effort 2 — Sound (real CC0 ambient) · one PR, after art

**Phase 4 — Sourcing spike:** fetch ONE CC0 clip end-to-end → loop → encode →
metrics → owner auditions. Proves the pipeline is feasible on this machine before
scaling to all nine.

**Phase 5 — All 9 beds:** source/process the remaining beds → owner audition pass
→ overwrite OGGs in place (no wiring change) → write `SOURCES.md` → gates + in-app
verify, commit/PR.

## 10. Risks & open questions

- **CC0 sourcing feasibility** — can clean, correctly-licensed clips be fetched +
  processed entirely on this machine? *Phase 0.1 proves it before committing.*
- **Pixel faces at scale** — if a face still won't read at 1×, lean further into
  staging (bigger / more backlit) rather than more facial detail.
- **I can't hear audio** — mitigated: the owner is the ear in every audio loop.
- **Scope is large** (2 levels × ~17 scenes + 6 builders + 9 beds). Phased so
  each phase ships value independently; sound and art are separable tracks.

## 11. Resolved decisions (owner, 2026-06-23)

1. **Order:** art first, then sound — as two separate PRs (§9).
2. **Audio sources:** Pixabay + Freesound-CC0 confirmed.
3. **SFX:** stay as-is this pass — only the ambient background beds are replaced.
