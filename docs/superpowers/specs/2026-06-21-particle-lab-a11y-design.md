# Particle Lab a11y nits — design

**2026-06-21 · Subproject 10 of the Particle Lab follow-up program**
**Status: SPEC — audit-driven; proceeding under the user's "pick recommended, run to the end" authorization.**

## Goal

Bring the whole Particle Lab (Explore / Drill / Spacing / Master / audio, plus the
shared game shell) to **WCAG 2.1 AA** by fixing the 17 findings of an adversarial
5-agent accessibility audit (run `wf_e7c82737` — 1 blocker, 2 major, 9 minor, 5
nit). Each fix is surgical: accessible names, focus management on screen swaps and
the reward dialog, scoped live regions, `aria-hidden` on decorative emoji, one
contrast bump, one tap-target bump, and `lang` correctness on Korean labels.

## Source: the audit findings (grouped by file)

### Blocker
- **SpacingGap.vue** — the gap toggle `<button>` has **no accessible name** (only an `aria-hidden` glyph). A screen reader hears identical unlabeled toggles. *(WCAG 4.1.2)*

### Major
- **DrillSummary.vue** — when DrillCard is swapped for the summary, **focus is dropped to `<body>`** and nothing announces the new screen. *(2.4.3 / 4.1.3)*
- **ParticleMasterCelebration.vue** — the hand-rolled `role="dialog"` has **no real focus management** (no guaranteed focus-in, no trap, no restore, no Escape). *(2.1.2 / 2.4.3)*

### Minor
- **ProgressDots.vue** — `role="progressbar"` has no accessible name and no `aria-valuemin`. *(1.3.1 / 4.1.2)*
- **TranslationPanel.vue** — `aria-live` wraps the static `<h3>` + both transitioning blocks → garbled/duplicated announcements. *(4.1.3)*
- **DrillCard.vue** — after answering, focus stays on the now-disabled option; the Retry/Next action button isn't focused. *(2.4.3)*
- **DrillSummary.vue** — `.summary__perfect` / `.summary__garden` use `var(--success)` (≈3.24:1 on `--paper`) → **fails AA** for normal text. *(1.4.3)*
- **SpacingGap.vue** — tap target `min-width: 18px` (< 24px AA minimum). *(2.5.8)*
- **SpacingCard.vue** — verdict ✅/✏️ and the Next `►` are read aloud (decorative). *(1.1.1)*
- **SpacingSummary.vue** — leading 🔁/🧩 emoji are inside the button accessible names. *(1.1.1)*
- **ParticleMasterCelebration.vue** — `aria-live` on the static body is misused → double announce. *(4.1.3)*
- **particles.vue** — the replay-mode `<p>` has no `aria-live` (mode change unannounced) and its 🔁 is read. *(4.1.3 / 1.1.1)*

### Nit
- **TranslationPanel.vue** — decorative 💡 read before every nuance.
- **ParticlePopover.vue** — the dialog's Korean `aria-label` has no `lang` hint.
- **TokenChip.vue** — the chip `aria-label` mixes Korean + localized text under one `lang="ko"`.
- **DrillCard.vue** — decorative 💬/🧱/🔗/✅/❌/📓/► read aloud.
- **DrillSummary.vue** — decorative 🎉/🧱/🌱/🔁/🧩/📓 read aloud.

## Design (the fixes)

We fix **all 17** (they're cheap and surgical). Pattern conventions used:
decorative emoji → wrap in `<span aria-hidden="true">…</span>`; dynamic-status
text → `role="status"`/scoped `aria-live="polite"`; icon-only control → `aria-label`.

### A. SpacingGap.vue
- Add a dynamic `:aria-label="isSpace ? t('particles.spacing.gap_space') : t('particles.spacing.gap_join')"` to the `<button>` (keep `aria-pressed="isSpace"`, keep `gap__mark` `aria-hidden`). **(blocker)**
- CSS: `.gap` and `.gap--space` `min-width` → `28px` (≥24px target). **(minor)**

### B. DrillSummary.vue
- Add `tabindex="-1"` + a `ref` to the root `<section class="summary">`; `onMounted(() => root.value?.focus())`; add `role="status"` on the score `<p>`. **(major)**
- `.summary__perfect` / `.summary__garden`: `color: var(--success)` → `var(--heading-accent)` (jade-deep, AA-passing on paper). **(minor)**
- Wrap leading 🎉/🧱/🌱/🔁/🧩/📓 in `aria-hidden` spans. **(nit)**

### C. ParticleMasterCelebration.vue
- Add focus management to the bespoke dialog (preserves the reward visual; mirrors `ui/Modal.vue`'s logic): on mount capture `document.activeElement`, focus the dismiss button (drop the bare `autofocus`); a `window` `keydown` Escape → `emit('dismiss')`; a minimal Tab-trap (the dismiss button is the only focusable → `Tab`/`Shift+Tab` `preventDefault` keep it); `onBeforeUnmount` restore the previously-focused element. **(major)**
- Remove `aria-live` from `.cel__body`; add `aria-describedby="cel-body"` on `.cel__card` + `id="cel-body"` on the paragraph. **(minor)**

### D. ProgressDots.vue
- Add `:aria-valuemin="0"` to the `role="progressbar"` root and an optional `label?: string` prop → `:aria-label="label"`. Explore/Drill/Spacing pass `t('particles.progress_label')`. **(minor)**

### E. TranslationPanel.vue
- Move `aria-live="polite"` + add `aria-atomic="true"` onto a wrapper around just the two `<Transition>` blocks; leave the `<h3>` outside it. **(minor)**
- Wrap the 💡 in an `aria-hidden` span. **(nit)**

### F. DrillCard.vue
- Add a `ref` to the active feedback action `<button>` (Retry / Next) + `watch(() => props.phase, async (p) => { if (p !== 'question') { await nextTick(); actionBtn.value?.focus() } })`. **(minor)**
- Wrap decorative 💬/🧱/🔗/✅/❌/📓 and the Next `►` in `aria-hidden` spans. **(nit)**

### G. SpacingCard.vue
- Render the verdict ✅/✏️ as a separate `aria-hidden` span (not inside the translated string); change the Next label to `{{ t('particles.spacing.next') }} <span aria-hidden="true">►</span>`. **(minor)**

### H. SpacingSummary.vue
- Move leading 🔁/🔁/🧩 (and the 🎉 in the `<h2>`) into `aria-hidden` spans so button names are just the localized text. **(minor)**

### I. particles.vue
- Add `role="status"` to both `.lab__replay-note` `<p>` (drill + spacing); wrap their 🔁 in `aria-hidden` spans. **(minor)**

### J. ParticlePopover.vue & TokenChip.vue (lang of parts)
- **ParticlePopover**: give the in-dialog Korean heading (`.popover__ko`) an `id` and pass it via a new `Modal` `labelledby` prop (so the `lang="ko"` heading supplies the dialog name) — OR, simpler and self-contained, leave as-is and instead fix at the chip. Chosen: add an optional `labelledby?: string` to `ui/Modal.vue` (`:aria-labelledby="labelledby"` taking precedence over `:aria-label`), and have ParticlePopover pass the heading id. **(nit)**
- **TokenChip**: keep `lang="ko"` on the visible glyph only — move it off the `<button>` onto a `<span lang="ko">` around `displayText`, and make the button `aria-label` the plain Korean token text + a localized role via a visually-hidden span without `lang`. Smallest viable change: set the button `aria-label` to just `token.text` (Korean) and render the role label (`tl(def.label)`) in a separate `<span class="sr-only">` (no `lang`). **(nit)**

### New i18n keys (×8)
- `particles.spacing.gap_space` — e.g. "Space here".
- `particles.spacing.gap_join` — e.g. "No space here".
- `particles.progress_label` — e.g. "Progress".

(A `.sr-only` visually-hidden utility class is needed for TokenChip; if none exists globally, add a scoped one in TokenChip.)

## Files

| Action | Path |
|---|---|
| Edit | `app/components/particle-lab/SpacingGap.vue` (aria-label + min-width) |
| Edit | `app/components/particle-lab/DrillSummary.vue` (focus, contrast, emoji) |
| Edit | `app/components/particle-lab/ParticleMasterCelebration.vue` (focus mgmt, aria) |
| Edit | `app/components/practice/ProgressDots.vue` (aria-valuemin, label prop) |
| Edit | `app/components/particle-lab/TranslationPanel.vue` (scoped live, emoji) |
| Edit | `app/components/particle-lab/DrillCard.vue` (focus, emoji) |
| Edit | `app/components/particle-lab/SpacingCard.vue` (emoji) |
| Edit | `app/components/particle-lab/SpacingSummary.vue` (emoji) |
| Edit | `app/components/particle-lab/ExploreMode.vue` (pass progress label) |
| Edit | `app/pages/practice/particles.vue` (replay-note role=status, emoji, pass progress label) |
| Edit | `app/components/ui/Modal.vue` (optional `labelledby`) |
| Edit | `app/components/particle-lab/ParticlePopover.vue` (labelledby) |
| Edit | `app/components/particle-lab/TokenChip.vue` (lang scoping) |
| Edit | `i18n/locales/*.json` (3 keys ×8) |
| Edit/Add | component tests for the testable fixes |

No SQL, no seed change, no audio regeneration.

## Testing

Component tests (the structurally-testable fixes):
- `SpacingGap`: `aria-label` is the join key when `value='join'`, the space key when `'space'`; `aria-pressed` tracks it.
- `DrillSummary`: root has `tabindex="-1"`; score `<p>` has `role="status"`; perfect/garden notes no longer use `--success` (assert class/inline not present is brittle — instead assert the elements render; contrast is a CSS/manual check).
- `ProgressDots`: renders `aria-valuemin="0"` and the passed `aria-label`.
- `SpacingCard` / `SpacingSummary` / `DrillCard` / `DrillSummary`: decorative emoji live inside `[aria-hidden="true"]` (assert the verdict/label text node has no raw emoji, or that an `aria-hidden` span exists).
- `ParticleMasterCelebration`: pressing Escape emits `dismiss`; the dismiss button receives focus on mount (assert `document.activeElement`); body `<p>` has no `aria-live`.
- `Modal`: `aria-labelledby` is rendered when `labelledby` is passed (and `aria-label` otherwise).

Full suite + typecheck + lint green. Contrast + tap-target are CSS changes verified by re-audit. A final adversarial re-audit Workflow confirms 0 remaining blocker/major. Manual smoke (logged in): keyboard-only walk through each mode (Tab/Enter/Esc), and a screen-reader pass on the gap toggles, the summary swap, and the celebration.

## Out of scope (YAGNI)

- Visual redesign / re-theming — only the one contrast bump and one tap-target bump.
- Swapping the celebration to `ui/Modal.vue` (would change the reward visual) — bespoke focus management instead.
- a11y of non-Particle-Lab surfaces (separate audits).
- Automated a11y CI (axe) — could come later; this pass is manual + adversarial-agent verified.
