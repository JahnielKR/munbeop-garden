# Particle Lab a11y nits — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 17 WCAG AA findings of the Particle Lab a11y audit — accessible names, focus management, scoped live regions, decorative-emoji hiding, one contrast bump, one tap-target bump, and lang-of-parts.

**Architecture:** Surgical edits to 13 existing components + 3 new i18n keys. No new features. Each task reads the current file, applies the precise change, and (where structurally testable) adds/updates a component test.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, TypeScript, Vitest + @vue/test-utils, pnpm.

**Conventions:**
- Spec: `docs/superpowers/specs/2026-06-21-particle-lab-a11y-design.md` (per-file fix detail).
- App under `munbeop/`. JS from `munbeop/`. Single test: `pnpm exec vitest run <path>`. Suite: `pnpm test`. Types: `pnpm typecheck`. Lint: `pnpm lint`.
- Pattern: decorative emoji → `<span aria-hidden="true">…</span>`; icon-only control → `:aria-label`; dynamic status → `role="status"`.
- Tests stub `useI18n` (echoes key + params).

---

### Task 1: i18n keys (×8)

**Files:** Modify `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

- [ ] **Step 1: Add the keys with an idempotent script**

Create `munbeop/_tmp_a11y_i18n.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'

// particles.spacing.gap_space / gap_join
const GAP = {
  en: ['Space here', 'No space here'],
  es: ['Espacio aquí', 'Sin espacio aquí'],
  fr: ['Espace ici', 'Pas d’espace ici'],
  'pt-BR': ['Espaço aqui', 'Sem espaço aqui'],
  id: ['Spasi di sini', 'Tanpa spasi di sini'],
  vi: ['Dấu cách ở đây', 'Không có dấu cách ở đây'],
  th: ['เว้นวรรคตรงนี้', 'ไม่เว้นวรรคตรงนี้'],
  ja: ['ここにスペース', 'ここはスペースなし'],
}
// particles.progress_label
const PROG = {
  en: 'Progress', es: 'Progreso', fr: 'Progression', 'pt-BR': 'Progresso',
  id: 'Kemajuan', vi: 'Tiến độ', th: 'ความคืบหน้า', ja: '進捗',
}

for (const loc of Object.keys(GAP)) {
  const path = `i18n/locales/${loc}.json`
  let txt = readFileSync(path, 'utf8')
  // gap_space/gap_join: insert after the spacing.lead key (present in all 8).
  if (!txt.includes('"gap_space"')) {
    txt = txt.replace(
      /(\n(\s*)"lead": [^\n]*\n)(\s*"level_label")/,
      (_m, leadLine, indent, next) =>
        `${leadLine}${indent}"gap_space": ${JSON.stringify(GAP[loc][0])},\n${indent}"gap_join": ${JSON.stringify(GAP[loc][1])},\n${next}`,
    )
  }
  // progress_label: sibling of particles.mode_label.
  if (!txt.includes('"progress_label"')) {
    txt = txt.replace(
      /(\n(\s*)"mode_label": [^\n]*\n)/,
      (_m, line, indent) => `${line}${indent}"progress_label": ${JSON.stringify(PROG[loc])},\n`,
    )
  }
  JSON.parse(txt)
  writeFileSync(path, txt)
  console.log(`ok ${loc}`)
}
console.log('done')
```

NOTE: the spacing block's first key is `"lead"` and is immediately followed by `"level_label"`; `particles.mode_label` is a top-level particles key. If a regex misses (the surrounding keys differ), fall back to a literal `txt.replace('  "level_label"', …)` per file. Verify after running.

- [ ] **Step 2: Run, delete, validate**

```bash
node _tmp_a11y_i18n.mjs && rm _tmp_a11y_i18n.mjs && node -e "const fs=require('fs'); for (const l of ['en','es','fr','pt-BR','th','id','vi','ja']) { const p=JSON.parse(fs.readFileSync('./i18n/locales/'+l+'.json','utf8')).particles; if(!p.spacing.gap_space||!p.spacing.gap_join||!p.progress_label) throw new Error('missing '+l); } console.log('all 8 a11y keys OK');"
```
Expected: `ok en … ok ja`, `done`, `all 8 a11y keys OK`.

- [ ] **Step 3: Commit**

```bash
git add munbeop/i18n/locales/*.json
git commit -m "$(cat <<'EOF'
feat(particles): i18n for a11y (gap_space/gap_join, progress_label) ×8

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: SpacingGap — accessible name + tap target (BLOCKER + minor)

**Files:** Modify `munbeop/app/components/particle-lab/SpacingGap.vue`; Test `munbeop/tests/components/particle-lab/SpacingGap.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/particle-lab/SpacingGap.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpacingGap from '~/components/particle-lab/SpacingGap.vue'
import type { Gap } from '~/lib/particle-lab'

const gap: Gap = { correct: 'space', kind: 'eojeol' }

function mountGap(value: 'space' | 'join') {
  return mount(SpacingGap, { props: { index: 1, value, gap, revealed: false } })
}

describe('SpacingGap a11y', () => {
  it('labels the toggle by its current state', () => {
    expect(mountGap('join').get('button').attributes('aria-label')).toBe('particles.spacing.gap_join')
    expect(mountGap('space').get('button').attributes('aria-label')).toBe('particles.spacing.gap_space')
  })

  it('reflects state in aria-pressed', () => {
    expect(mountGap('space').get('button').attributes('aria-pressed')).toBe('true')
    expect(mountGap('join').get('button').attributes('aria-pressed')).toBe('false')
  })
})
```

- [ ] **Step 2: Run → fail** — `pnpm exec vitest run tests/components/particle-lab/SpacingGap.test.ts` (no aria-label yet).

- [ ] **Step 3: Edit `SpacingGap.vue`**

In `<script setup>` add `useI18n` and (it already imports `computed`):
```ts
const { t } = useI18n()
```
On the `<button>`, add the label (keep the existing `:aria-pressed="isSpace"` and `aria-hidden` on the mark):
```vue
    :aria-label="isSpace ? t('particles.spacing.gap_space') : t('particles.spacing.gap_join')"
```
In `<style scoped>`: `.gap { min-width: 28px; }` and `.gap--space { min-width: 28px; }` (raise from 18/22).

- [ ] **Step 4: Run → pass.** **Step 5: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingGap.vue munbeop/tests/components/particle-lab/SpacingGap.test.ts
git commit -m "fix(particles): a11y — name the spacing gap toggle + ≥24px target

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: ProgressDots — progressbar name + valuemin (minor)

**Files:** Modify `munbeop/app/components/practice/ProgressDots.vue`, `munbeop/app/components/particle-lab/ExploreMode.vue`, `munbeop/app/pages/practice/particles.vue`; Test `munbeop/tests/components/practice/ProgressDots.test.ts` (new or extend)

- [ ] **Step 1: Read `ProgressDots.vue`** to see its current props + the `role="progressbar"` root.

- [ ] **Step 2: Write the test**

Create `munbeop/tests/components/practice/ProgressDots.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressDots from '~/components/practice/ProgressDots.vue'

describe('ProgressDots a11y', () => {
  it('exposes aria-valuemin and an optional label', () => {
    const w = mount(ProgressDots, { props: { total: 5, progress: 2, label: 'Progress' } })
    const bar = w.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-label')).toBe('Progress')
  })
})
```

- [ ] **Step 3: Run → fail.**

- [ ] **Step 4: Edit `ProgressDots.vue`** — add an optional `label?: string` prop; on the `role="progressbar"` root add `:aria-valuemin="0"` and `:aria-label="label"`.

- [ ] **Step 5: Pass the label from consumers** — `ExploreMode.vue` and both `<ProgressDots>` in `particles.vue` (drill + spacing) get `:label="t('particles.progress_label')"`.

- [ ] **Step 6: Run the new test + typecheck → pass. Commit**

```bash
git add munbeop/app/components/practice/ProgressDots.vue munbeop/app/components/particle-lab/ExploreMode.vue munbeop/app/pages/practice/particles.vue munbeop/tests/components/practice/ProgressDots.test.ts
git commit -m "fix(particles): a11y — name the progress bar + aria-valuemin

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: DrillSummary — focus on swap + contrast + emoji (major + minor + nit)

**Files:** Modify `munbeop/app/components/particle-lab/DrillSummary.vue`; Test extend `munbeop/tests/components/particle-lab/...` (optional)

- [ ] **Step 1: Read `DrillSummary.vue`.**

- [ ] **Step 2: Edit** —
  - Add `import { ref, onMounted } from 'vue'`; `const root = ref<HTMLElement | null>(null)`; `onMounted(() => root.value?.focus())`. On the root `<section class="summary">` add `ref="root"` + `tabindex="-1"` + (so the outline isn't ugly) `style` is fine; add `role="status"` to the `.summary__score` `<p>`.
  - Contrast: `.summary__perfect` and `.summary__garden` `color: var(--success)` → `color: var(--heading-accent)`.
  - Wrap each leading emoji (🎉 in `<h2>`, 🧱 on slips, 🌱 on garden, 🔁/🔁/🧩/📓 on the buttons/link) in `<span aria-hidden="true">…</span>`.
  - Add `.summary:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }`.

- [ ] **Step 3: Typecheck + run the drill component tests** (`pnpm exec vitest run tests/components/particle-lab/DrillCard.test.ts` and any DrillSummary test) → pass. **Commit**

```bash
git add munbeop/app/components/particle-lab/DrillSummary.vue
git commit -m "fix(particles): a11y — focus + announce the drill summary, fix contrast, hide emoji

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: DrillCard — focus the feedback action + hide emoji (minor + nit)

**Files:** Modify `munbeop/app/components/particle-lab/DrillCard.vue`

- [ ] **Step 1: Read `DrillCard.vue`.** It already imports `computed`; the feedback action buttons are the Retry (`@click="emit('retry')"`) and Next (`@click="emit('next')"`).

- [ ] **Step 2: Edit** —
  - Add `import { ref, watch, nextTick } from 'vue'`; `const actionBtn = ref<HTMLButtonElement | null>(null)`; set `ref="actionBtn"` on BOTH the blocked/contraction Retry button and the right/wrong Next button; `watch(() => props.phase, async (p) => { if (p !== 'question') { await nextTick(); actionBtn.value?.focus() } })`.
  - Wrap the decorative 💬 (cue), 🧱/🔗 (blocked/contraction titles), ✅/❌ (result title), 📓 (diary note) in `<span aria-hidden="true">…</span>`; change the Next label `{{ t('particles.drill.next') }} ►` → `{{ t('particles.drill.next') }} <span aria-hidden="true">►</span>`.

- [ ] **Step 3: Run `tests/components/particle-lab/DrillCard.test.ts` + typecheck → pass.**

The existing DrillCard test asserts `[data-testid]` and text contains; the emoji edits keep the localized text intact, so they still pass. **Commit**

```bash
git add munbeop/app/components/particle-lab/DrillCard.vue
git commit -m "fix(particles): a11y — focus the drill feedback action, hide decorative glyphs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: ParticleMasterCelebration — dialog focus management (major + minor)

**Files:** Modify `munbeop/app/components/particle-lab/ParticleMasterCelebration.vue`; Test `munbeop/tests/components/particle-lab/ParticleMasterCelebration.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/particle-lab/ParticleMasterCelebration.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticleMasterCelebration from '~/components/particle-lab/ParticleMasterCelebration.vue'

describe('ParticleMasterCelebration a11y', () => {
  afterEach(() => document.body.replaceChildren())

  it('focuses the dismiss button on mount', () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 }, attachTo: document.body })
    expect(document.activeElement).toBe(w.get('[data-testid="cel-dismiss"]').element)
    w.unmount()
  })

  it('emits dismiss on Escape', async () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 }, attachTo: document.body })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await w.vm.$nextTick()
    expect(w.emitted('dismiss')).toBeTruthy()
    w.unmount()
  })

  it('does not put aria-live on the body text', () => {
    const w = mount(ParticleMasterCelebration, { props: { total: 11 } })
    expect(w.find('.cel__body').attributes('aria-live')).toBeUndefined()
    w.unmount()
  })
})
```

(Give the dismiss button `data-testid="cel-dismiss"`.)

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Edit `ParticleMasterCelebration.vue`** — add to `<script setup>`:

```ts
import { onBeforeUnmount, onMounted, ref } from 'vue'
const dismissBtn = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('dismiss')
  } else if (e.key === 'Tab') {
    // single focusable → trap on the dismiss button
    e.preventDefault()
    dismissBtn.value?.focus()
  }
}
onMounted(() => {
  previouslyFocused = (document.activeElement as HTMLElement | null)
  dismissBtn.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  previouslyFocused?.focus()
})
```
Template: remove `autofocus` from the dismiss button and add `ref="dismissBtn"` + `data-testid="cel-dismiss"`. Remove `aria-live="polite"` from `.cel__body`; add `aria-describedby="cel-body"` to `.cel__card` and `id="cel-body"` to the `.cel__body` `<p>`.

- [ ] **Step 4: Run → pass. Commit**

```bash
git add munbeop/app/components/particle-lab/ParticleMasterCelebration.vue munbeop/tests/components/particle-lab/ParticleMasterCelebration.test.ts
git commit -m "fix(particles): a11y — focus trap/restore/Escape on the reward dialog

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: TranslationPanel — scoped live region + emoji (minor + nit)

**Files:** Modify `munbeop/app/components/particle-lab/TranslationPanel.vue`

- [ ] **Step 1: Read it.** It has `aria-live="polite"` on the `<section>` and a 💡 prefix on the nuance line.

- [ ] **Step 2: Edit** — move `aria-live="polite"` + add `aria-atomic="true"` onto a `<div>` wrapping only the two `<Transition>` blocks (`.panel__trans`/`.panel__nuance`); the `<section>` and `<h3>` keep no live region. Wrap the 💡 in `<span aria-hidden="true">💡</span>`.

- [ ] **Step 3: Typecheck + run the explore/translation tests (if any) → pass. Commit**

```bash
git add munbeop/app/components/particle-lab/TranslationPanel.vue
git commit -m "fix(particles): a11y — scope the translation live region, hide 💡

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: SpacingCard + SpacingSummary — hide decorative emoji (minor)

**Files:** Modify `munbeop/app/components/particle-lab/SpacingCard.vue`, `SpacingSummary.vue`

- [ ] **Step 1: Edit `SpacingCard.vue`** — in the verdict `<h4>`, render the leading ✅/✏️ as a separate `<span aria-hidden="true">` (don't embed in the t() string); change the Next button to `{{ t('particles.spacing.next') }} <span aria-hidden="true">►</span>`.

- [ ] **Step 2: Edit `SpacingSummary.vue`** — wrap the leading 🔁/🔁/🧩 on the three action buttons (and 🎉 in the `<h2>`) in `<span aria-hidden="true">…</span>`.

- [ ] **Step 3: Run `tests/components/particle-lab/SpacingCard.test.ts` → pass** (the assertions check `particles.spacing.try_again`/`correct`/`rule_*` text which stays; the verdict emoji moving to a span doesn't break `.text()` contains, but if a test asserted a literal `✅`, update it — it does not). Typecheck. **Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingCard.vue munbeop/app/components/particle-lab/SpacingSummary.vue
git commit -m "fix(particles): a11y — hide decorative emoji in Spacing card/summary

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: particles.vue — announce replay mode + hide emoji (minor)

**Files:** Modify `munbeop/app/pages/practice/particles.vue`

- [ ] **Step 1: Edit** — on both `.lab__replay-note` `<p>` (drill + spacing branches) add `role="status"`; wrap their leading 🔁 in `<span aria-hidden="true">🔁</span>`.

- [ ] **Step 2: Typecheck → pass. Commit**

```bash
git add munbeop/app/pages/practice/particles.vue
git commit -m "fix(particles): a11y — announce replay mode (role=status), hide 🔁

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: lang of parts — Modal labelledby + ParticlePopover + TokenChip (nit)

**Files:** Modify `munbeop/app/components/ui/Modal.vue`, `munbeop/app/components/particle-lab/ParticlePopover.vue`, `munbeop/app/components/particle-lab/TokenChip.vue`

- [ ] **Step 1: Read all three.**

- [ ] **Step 2: Modal.vue** — add an optional `labelledby?: string` prop; on the dialog `<div role="dialog">` set `:aria-labelledby="labelledby"` and make `:aria-label="labelledby ? undefined : title"` (labelledby wins). Existing callers unaffected (no labelledby → aria-label as before).

- [ ] **Step 3: ParticlePopover.vue** — give the visible Korean heading (`.popover__ko`) an `id="particle-popover-ko"` and pass `:labelledby="'particle-popover-ko'"` to `<Modal>` so the `lang="ko"` heading names the dialog.

- [ ] **Step 4: TokenChip.vue** — for particle chips, make the button `aria-label` just the Korean `token.text` (keep `lang="ko"` on the button OR move it to a span). Render the localized role label in a visually-hidden span WITHOUT `lang`: add `<span class="sr-only">{{ tl(def.label) }}</span>` and remove the localized portion from the aria-label. Add a scoped `.sr-only` utility (position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap;) if no global one exists.

- [ ] **Step 5: Run `tests/components/particle-lab/TokenChip.test.ts` + Modal/popover tests + typecheck.** If the TokenChip test asserts the old combined aria-label, update it to the new Korean-only label. **Commit**

```bash
git add munbeop/app/components/ui/Modal.vue munbeop/app/components/particle-lab/ParticlePopover.vue munbeop/app/components/particle-lab/TokenChip.vue munbeop/tests/components/particle-lab/TokenChip.test.ts
git commit -m "fix(particles): a11y — lang-correct dialog/chip accessible names

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Verification — gates + re-audit + finish

**Files:** none.

- [ ] **Step 1: Gates**

```bash
pnpm test
pnpm typecheck
pnpm lint
```
Expected: suite green (new SpacingGap/ProgressDots/Celebration tests pass; existing tests still pass after emoji/label edits — fix any test that asserted a removed literal emoji or the old combined TokenChip label), 0 type errors, 0 lint errors.

- [ ] **Step 2: Adversarial re-audit Workflow** — re-run the 5-group a11y audit (same prompt as the original) over the now-fixed files; confirm **0 remaining blocker/major** and that the previously-listed issues are resolved. Apply any residual fix, re-run gates.

- [ ] **Step 3: Manual smoke (logged in)** — keyboard-only pass: Tab through Explore/Drill/Spacing, answer a drill (focus lands on Next), finish a drill (focus lands on summary), earn nothing/everything (celebration: Esc closes, focus restores); confirm the spacing gap toggles announce space/no-space.

- [ ] **Step 4: Finish** — superpowers:finishing-a-development-branch → merge + push (Vercel prod), per the user's standing authorization.

---

## Self-Review (completed during planning)

- **Spec coverage:** every spec fix maps to a task — SpacingGap name+target (T2), ProgressDots (T3), DrillSummary focus/contrast/emoji (T4), DrillCard focus/emoji (T5), Celebration focus+aria (T6), TranslationPanel (T7), SpacingCard/Summary emoji (T8), particles.vue replay (T9), Modal/Popover/TokenChip lang (T10), i18n (T1), verify (T11).
- **Placeholder scan:** code given for the testable changes; the mechanical emoji-wraps are specified by exact glyph + element. Each edit reads the live file first (the components are short SFCs).
- **Type consistency:** new props (`ProgressDots.label?`, `Modal.labelledby?`) are optional → existing callers unaffected; new i18n keys (`particles.spacing.gap_space|gap_join`, `particles.progress_label`) are referenced exactly where added; `data-testid="cel-dismiss"` matches the celebration test.
```