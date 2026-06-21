# Particle Lab — Final Visual QA (subproject #11)

**Date:** 2026-06-21
**Scope:** Visual/CSS pass over the whole `/practice/particles` experience (Explore ·
Clash drill · Spacing), both themes, mobile + desktop. NOT logic, NOT a11y (a11y shipped
as #10). Audio v3 (per-toggle clips, drill audio, 연음 annotation) stays **deferred**.

## Method

`audit Workflow → fix-list (this doc) → surgical edits → live preview verification`,
mirroring the #10 a11y pattern. A 31-agent static workflow (`wf_33aef7c2`) audited the 17
components + page across five dimensions (theming/tokens, responsive, i18n-overflow,
state-completeness, motion/typo/rhythm) with adversarial verification of every candidate
(16 confirmed of 26). Findings were then reconciled against the live preview (synthetic
Supabase session to pass the auth gate; light + dark; 360 / 1280).

Two workflow findings were **downgraded by live evidence**: the mode tabs do not clip
(equal-height grid absorbs the 2-line Clash label), and the Explore-nav overflow surfaces
as a **clipped next-arrow** (ancestor `overflow-x:hidden`), not page scroll — still real.

## Fixes (shipped)

### Major
1. **SpacingGap `␣` space marker invisible in light** — gold-on-cream 1.88:1. The active
   gap is the puzzle's core feedback. → mark glyph `color: var(--text)`, keep the gold
   underline as the brand cue. (Verified live: 13.61:1.)
2. **Celebration `.cel__label` illegible in light** — gold-on-surface 1.46:1. → `--text-soft`
   (4.6:1); gold stays on the card border + 🏅 badge.
3. **Master-strip earned caption illegible in light** — `.master--earned .master__caption`
   gold-on-surface 1.46:1. → drop the gold override (keep `--text-soft`); earned cue = gold
   border + 🏅 + gold pips.
4. **Explore nav clipped at 360px** — prev/next arrows + 14-dot ProgressDots (~384px) on one
   nowrap row, clipped by an ancestor. → arrows stay flanking; the dots row gets
   `min-width:0; flex:0 1 auto; flex-wrap:wrap` (scoped to Explore via `:deep`, so the shared
   ProgressDots is untouched for drill/spacing). Dots now wrap to two rows between the arrows.
5. **Mode tabs cramped / can blow out the grid** — rigid `1fr 1fr 1fr` with default
   `min-width:auto`. → `min-width:0` on `.lab__tab` (defensive against track blowout in long
   locales; equal-height grid already absorbs the 2-line Clash label).
6. **TranslationPanel collapses on every toggle (CLS)** — `mode="out-in"` removes the old
   `<p>` before the new mounts → the panel body collapses to title height and ParticleLegend
   below bounces, on the mode's most-used interaction. → drop `out-in` (crossfade) + the
   leaving line goes `position:absolute` (keeps its static slot) so the entering line defines
   height immediately. (Verified live: body height constant 72px, legend jump 0px.)

### Minor
7. **Spacing reveal marks low-contrast in light** — correct 2.51:1, wrong 3.41:1. → glyph
   `color: var(--text)`; status reads from the jade/red underline. (Verified live.)
8. **Master-strip unlit pip barely separates from the strip** (~1.2:1 body). → todo pip
   `background: var(--paper-deep)` (raised tier) for clear separation in both themes.
9. **Spacing review panel accent differs from drill** — gold border vs DrillSummary's red. →
   `border-left: var(--danger)` to match (and the per-gap wrong color), so "mistakes to
   review" reads as one family across modes.
10. **Action-button shadows mix hardcoded offsets with tokens** — DrillCard `.feedback__btn`
    rested at 3px, others at 4px. → `var(--shadow-button)` / `--shadow-button-hover` /
    `--shadow-button-pressed` on `.feedback__btn` and `.popover__cta`.
11. **Popover CTA off-scale font** — `font-size: 11px` (between the 10/12px steps). →
    `var(--text-xs)`.

## Deferred (documented, not fixed)

- **Object-role chip contrast** (`.chip--object` dark-on-`--sky` 3.64:1, light only) — borderline
  (18px/700 sits at the large-text boundary; likely accepted in the #10 a11y pass). Every clean
  fix has a tradeoff (`--sky` is also the link/info color globally; cream text only reaches
  4.15:1). Needs a dedicated darker swatch for this one role — its own small change.
- **Pixel-font smoothing** — 21 raw `font-family: var(--font-pixel-*)` declarations skip the
  `.font-pixel`/`.type-*` smoothing utilities, so labels anti-alias. **No-op on Windows/Linux**
  (WebKit/Mac only); touches 12 files → its own systematic pass.
- **Summary CTA width (fr/id)** — long "REVOIR LES ERREURS (n)" wraps each button to its own
  row on narrow phones. Functional (flex-wrap already prevents overflow); pure polish.
- **Sentence framing** — Spacing boxes its sentence; Drill/Explore leave it bare. Defensible
  (Spacing's is an interactive puzzle surface) — a design decision, not a bug.
- **Audio playing-state** — the 🔊 button has no playing indicator. Folds into the deferred
  **audio v3** track, not this visual pass.

See `2026-06-21-particle-lab-visual-qa-impl.md` for the exact edits and verification.
