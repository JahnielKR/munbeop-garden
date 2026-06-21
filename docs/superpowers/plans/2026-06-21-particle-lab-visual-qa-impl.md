# Particle Lab — Final Visual QA — Implementation

**Date:** 2026-06-21 · **Branch:** `claude/tender-volhard-728ea1` (harness worktree) ·
**Spec:** `docs/superpowers/specs/2026-06-21-particle-lab-visual-qa-design.md`

Pure CSS/template polish — no logic, no new strings, no seed/asset changes. 9 files.

## Edits

| # | File | Change |
|---|------|--------|
| 1 | `components/particle-lab/SpacingGap.vue` | `.gap--space` mark `color: var(--accent)` → `var(--text)` (keep gold underline) |
| 7 | `components/particle-lab/SpacingGap.vue` | `.gap--correct` / `.gap--wrong` glyph `color` → `var(--text)` (keep jade/red underline) |
| 2 | `components/particle-lab/ParticleMasterCelebration.vue` | `.cel__label` `color: var(--gold)` → `var(--text-soft)` |
| 3 | `components/particle-lab/ParticleMasterStrip.vue` | removed `.master--earned .master__caption { color: var(--gold) }` |
| 8 | `components/particle-lab/ParticleMasterStrip.vue` | `.master__pip` `background: var(--paper)` → `var(--paper-deep)` |
| 9 | `components/particle-lab/SpacingSummary.vue` | `.summary__review` `border-left` `var(--accent)` → `var(--danger)` |
| 10 | `components/particle-lab/DrillCard.vue` | `.feedback__btn` shadows → `var(--shadow-button)` / `--shadow-button-hover` |
| 10,11 | `components/particle-lab/ParticlePopover.vue` | `.popover__cta` shadows → shadow tokens; `font-size: 11px` → `var(--text-xs)` |
| 4 | `components/particle-lab/ExploreMode.vue` | `.explore__arrow { flex:0 0 auto }`; `:deep(.dots) { min-width:0; flex:0 1 auto; flex-wrap:wrap }` |
| 5 | `pages/practice/particles.vue` | `.lab__tab { min-width: 0 }` |
| 6 | `components/particle-lab/TranslationPanel.vue` | drop `mode="out-in"`; `.panel__body { position:relative }`; `.panel-leave-active { position:absolute; width:100% }` |

## Verification

- **Live preview** (synthetic Supabase session, light + dark, 360 + 1280):
  - #1 space mark 1.88:1 → **13.61:1** (computed, transitions disabled).
  - #7 reveal marks → `--text` ink + jade/red underline (computed).
  - #4 Explore nav 360px: no overflow, arrows flank, dots wrap to 2 rows (measured + screenshot).
  - #6 toggle sweep 40–350ms: panel body height constant 72px, ParticleLegend jump **0px**.
  - #8 todo pip `#faf6ee` (--paper-deep) vs strip `#ded0b6` — clear separation.
  - Explore/Spacing rendered clean in both themes; GameLeaveConfirm + Spacing level picker OK.
- **Gates:** `pnpm test` 1772 passed / 99 skipped (157 files); `pnpm typecheck` clean;
  `pnpm lint` 0 errors.

## Notes / gotchas

- The dev preview banner "Couldn't load your data" is a **synthetic-JWT artifact** (the
  fake session can't do Supabase crypto), not a Particle Lab defect — hidden via injected CSS
  during QA.
- Occluded preview windows **freeze CSS transitions** at their start value; sampling a
  transitioned `color`/`background` reads stale. Disable transitions before computing color
  contrast (see [[project-preview-verification-quirks]]).
- `preview_click` did not fire the Vue tab handlers reliably; `el.click()` via `preview_eval` did.
- Deferred items (object-chip contrast, pixel-smoothing, fr/id CTA width, sentence framing,
  audio playing-state) are listed in the spec.
