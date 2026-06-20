# Explore-mode expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow Particle Lab's **Explore** mode from 6 particles / 7 sentences to **12 particles / 14 sentences** — adding 만, 한테, (으)로, 와/과, 부터, 까지 plus 7 new example sentences — and give three of them their own chip colors (recipient · means · connective).

**Architecture:** Pure content addition on top of the existing generic Explore engine (no engine change). The 6 new particles become `ParticleDef`s; the 7 new sentences become `LabSentence`s. Three new `ParticleRole` values (`recipient`, `means`, `connective`) get three new theme-aware brand swatches (`--plum`, `--teal`, `--rose`), wired through `TokenChip`, `ParticleLegend`, `Badge`, and `ParticlePopover`. The remaining new particles (만/부터/까지) reuse the neutral `addition` color. All 8-locale strings + the Korean readings are generated and adversarially verified, then spliced into the seeds.

**Tech Stack:** Nuxt 4 SPA, Vue 3, TypeScript, Pinia, @nuxtjs/i18n (8 locales), vitest + happy-dom + @vue/test-utils, pnpm. All commands run from `munbeop/`.

**Source spec:** `docs/superpowers/specs/2026-06-20-explore-expansion-design.md`. Plan-time decision (user, 2026-06-20): **add 3 new roles + colors** (not reuse). Light theme semantically remaps `--sky`→rust-orange, so colors were chosen against the actual corpus co-occurrences (see Task 2).

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Edit | `app/lib/domain/particles.ts` | Extend `PARTICLE_IDS` (+6 ids) and `ParticleRole` (+`recipient`/`means`/`connective`) |
| Edit | `app/assets/styles/tokens/colors-light.css` | +3 brand swatches `--plum`/`--teal`/`--rose` (light values) |
| Edit | `app/assets/styles/tokens/colors-dark.css` | +3 brand swatches (dark values) |
| Edit | `app/components/particle-lab/TokenChip.vue` | +3 `.chip--{recipient,means,connective}` rules |
| Edit | `app/components/particle-lab/ParticleLegend.vue` | +3 `.legend__swatch--{…}` rules |
| Edit | `app/components/ui/Badge.vue` | +3 variants `plum`/`teal`/`rose` (union + CSS) |
| Edit | `app/components/particle-lab/ParticlePopover.vue` | Extend `badgeVariant` switch (+3 cases) |
| Edit | `app/seed/particles.ts` | +6 `ParticleDef` (만, 한테, (으)로, 와/과, 부터, 까지) |
| Edit | `app/seed/particle-sentences.ts` | +7 `LabSentence` (s08–s14) |
| Edit | `tests/components/particle-lab/TokenChip.test.ts` | Assert a new-role chip renders its role class |
| Edit | `tests/components/ui/Badge.test.ts` (or create) | Assert the 3 new variants render |
| Edit | `tests/unit/particle-lab/explore.test.ts` | `indexOfParticle` for new ids; integrity loop already covers new sentences |
| Create | `tests/unit/particle-lab/particles-catalog.test.ts` | Every `ParticleDef.grammarKo` resolves in `DEFAULT_GRAMMAR`; every id has a def |

No engine change, no new i18n JSON keys (content lives in seeds), no SQL.

---

## Verified facts (resolved during planning — do not re-litigate)

- **`ParticleId` is a hardcoded tuple** `PARTICLE_IDS` in `app/lib/domain/particles.ts`. The 6 new ids **must** be added there or nothing typechecks. (The spec called this "maybe"; it is required.)
- **Grammar catalog keys (exact strings) — all present in `app/seed/grammars-n1.ts`:**
  - `만` (n1:287)
  - `에게 / 한테 / 께` (n1:361) — note the spaces; this is the `recipient` key
  - `(으)로` (n1:398)
  - `부터 / 까지` (n1:435) — **one grouped key** shared by both `from` and `until`
  - `와/과 · 하고 · (이)랑` (n1:213) — the only `와/과` key; use this exact string for `and`
- **`DEFAULT_GRAMMAR`** (`app/seed/grammars.ts`) is the combined catalog array; `Grammar.ko` is the lookup field. Used by the new integrity test.
- **Role consumers** that must learn the 3 new roles: `TokenChip.vue` (`.chip--${role}`), `ParticleLegend.vue` (`.legend__swatch--${role}`), `ParticlePopover.vue` (`switch (def.role)` → `badgeVariant`). `TokenChip` falls back to `'addition'` for unknown roles, so a missed wiring degrades silently — the tests in Task 2/5 guard this.
- **`L()`** (`app/seed/locale.ts`) is positional: `(en, es, fr, pt-BR, th, id, vi, ja)`.
- **(으)로 allomorph:** `으로` after a consonant, `로` after a vowel **and after ㄹ-batchim** (the ㄹ exception). The `afterConsonant/afterVowel` pair can't encode the ㄹ exception; in Explore the chip text comes from the sentence token, so the pair only feeds the popover "forms" list — note the ㄹ exception in the `hint`.

---

## PHASE 1 — Types + new roles/colors plumbing (no content yet)

### Task 1: Extend the domain id list + role union

**Files:**
- Modify: `app/lib/domain/particles.ts:4-15`

- [ ] **Step 1: Add the 6 new ids to `PARTICLE_IDS`**

Replace the `PARTICLE_IDS` tuple with:

```ts
export const PARTICLE_IDS = [
  'topic',
  'subject',
  'object',
  'place-static',
  'place-action',
  'also',
  'only',
  'recipient',
  'by-means',
  'and',
  'from',
  'until',
] as const
```

- [ ] **Step 2: Add the 3 new roles to `ParticleRole`**

```ts
/** Visual role — drives chip color. 에/에서 share 'place'; 도/만/부터/까지 share 'addition'. */
export type ParticleRole =
  | 'topic'
  | 'subject'
  | 'object'
  | 'place'
  | 'addition'
  | 'recipient'
  | 'means'
  | 'connective'
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS — widening the union and the id tuple introduces no new usage yet. (Adding seed defs/sentences happens in Phase 2.)

(No commit yet — commit Phase 1 at the end of Task 2.)

---

### Task 2: Add the 3 brand swatches + wire chip / legend / badge / popover

**Files:**
- Modify: `app/assets/styles/tokens/colors-light.css`
- Modify: `app/assets/styles/tokens/colors-dark.css`
- Modify: `app/components/particle-lab/TokenChip.vue`
- Modify: `app/components/particle-lab/ParticleLegend.vue`
- Modify: `app/components/ui/Badge.vue`
- Modify: `app/components/particle-lab/ParticlePopover.vue`
- Test: `tests/components/ui/Badge.test.ts`

**Color rationale (corpus co-occurrence check).** Existing roles occupy yellow(gold) / green(jade) / blue·rust(sky, theme-dependent) / red / neutral(addition). Genuinely free hue families across **both** themes: violet, teal, pink. Assignment:

| token | role | particle | light | dark | text |
|---|---|---|---|---|---|
| `--plum` | recipient | 한테 | `#a87fd0` | `#c2a2ea` | `--always-dark` |
| `--teal` | means | (으)로 | `#2f8f88` | `#4fc6bd` | `--always-dark` |
| `--rose` | connective | 와/과 | `#cf6f92` | `#ec8fb5` | `--always-dark` |

The only theoretical collisions (teal vs dark-mode jade/sky; rose vs red) **never co-occur in the corpus**: 한테/로/와 sentences contain no 이/가; rose(와) sits with object(sky), never red. 부터+까지 share the neutral color intentionally (one range family). Verify ≥4.5:1 (always-dark text) in Task 6; lighten the light-mode plum/rose a notch if any fails.

- [ ] **Step 1: Add swatches to `colors-light.css`** — after the `--gold:` line in the brand-swatch block (around line 44):

```css
  --plum: #a87fd0;         /* lavanda — recipient (한테) */
  --teal: #2f8f88;         /* verde azulado — means ((으)로) */
  --rose: #cf6f92;         /* rosa — connective (와/과) */
```

- [ ] **Step 2: Add swatches to `colors-dark.css`** — after the `--red-deep:` line in the brand block (around line 39):

```css
  --plum: #c2a2ea;         /* lavanda lunar — recipient (한테) */
  --teal: #4fc6bd;         /* turquesa luciérnaga — means ((으)로) */
  --rose: #ec8fb5;         /* rosa neón suave — connective (와/과) */
```

- [ ] **Step 3: `TokenChip.vue`** — add three rules after `.chip--addition { … }` (around line 115):

```css
.chip--recipient { background: var(--plum); color: var(--always-dark); }
.chip--means { background: var(--teal); color: var(--always-dark); }
.chip--connective { background: var(--rose); color: var(--always-dark); }
```

- [ ] **Step 4: `ParticleLegend.vue`** — add three swatch rules after `.legend__swatch--addition { … }` (around line 82):

```css
.legend__swatch--recipient { background: var(--plum); }
.legend__swatch--means { background: var(--teal); }
.legend__swatch--connective { background: var(--rose); }
```

- [ ] **Step 5: `Badge.vue`** — extend the variant union and add CSS so the popover badge matches the chips.

In the `Props` interface (line 27):

```ts
interface Props {
  variant?: 'jade' | 'red' | 'gold' | 'sky' | 'soft' | 'plum' | 'teal' | 'rose'
  size?: 'sm' | 'md'
}
```

After `.badge[data-variant='sky'] { … }` (around line 90):

```css
.badge[data-variant='plum'] {
  background: var(--plum);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='teal'] {
  background: var(--teal);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='rose'] {
  background: var(--rose);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
```

- [ ] **Step 6: `ParticlePopover.vue`** — extend the `badgeVariant` switch (around line 31) to cover the new roles:

```ts
const badgeVariant = computed(() => {
  switch (def.value?.role) {
    case 'topic': return 'gold'
    case 'subject': return 'jade'
    case 'object': return 'sky'
    case 'place': return 'red'
    case 'recipient': return 'plum'
    case 'means': return 'teal'
    case 'connective': return 'rose'
    default: return 'soft'
  }
})
```

- [ ] **Step 7: Write/extend the Badge variant test**

If `tests/components/ui/Badge.test.ts` exists, add the case below; otherwise create the file:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '~/components/ui/Badge.vue'

describe('Badge new role variants', () => {
  for (const v of ['plum', 'teal', 'rose'] as const) {
    it(`renders the ${v} variant`, () => {
      const w = mount(Badge, { props: { variant: v }, slots: { default: 'x' } })
      expect(w.get('.badge').attributes('data-variant')).toBe(v)
    })
  }
})
```

- [ ] **Step 8: Run typecheck + the Badge test**

Run: `pnpm typecheck` → clean.
Run: `pnpm test tests/components/ui/Badge.test.ts` → PASS.

- [ ] **Step 9: Commit Phase 1**

```bash
git add munbeop/app/lib/domain/particles.ts \
  munbeop/app/assets/styles/tokens/colors-light.css \
  munbeop/app/assets/styles/tokens/colors-dark.css \
  munbeop/app/components/particle-lab/TokenChip.vue \
  munbeop/app/components/particle-lab/ParticleLegend.vue \
  munbeop/app/components/ui/Badge.vue \
  munbeop/app/components/particle-lab/ParticlePopover.vue \
  munbeop/tests/components/ui/Badge.test.ts
git commit -m "feat(particles): add recipient/means/connective roles + chip colors for Explore"
```

---

## PHASE 2 — Content: the 6 ParticleDefs + 7 sentences

> Korean is fully specified below (the pedagogically critical part). The 8-locale `label`/`hint`/`trans`/`nuance`/`reading` strings are generated and adversarially verified by the content workflow in Task 3, then spliced. The user (fluent Korean speaker) reviews the Korean before the PR merges.

### Task 3: Generate + adversarially verify the 8-locale content

This is the content task. Use a background **Workflow** (same pattern as the Choque expansion) — pipeline: per-item draft of all 8 locales → per-item adversarial Korean verify. Each verifier confirms: the assembled Korean is natural and correct; each particle's role label/hint is accurate; each OFF reading's translation + nuance is true for that exact OFF state. Fix anything flagged. **Splice hygiene:** agents emit inconsistent indentation/commas — wrap generated objects in a temp `.ts`, `prettier --write` it in isolation, then paste into the real seed before the closing `]`. (Confirm with the user before launching the Workflow; alternatively author inline and have the user review.)

**Structural skeleton the workflow fills (FIXED fields shown; `L(...)` = generate 8 locales):**

- [ ] **Step 1: Author + verify the 6 `ParticleDef`s** (English anchor in comments; produce all 8 locales for `label`/`hint`):

```ts
// only — 만 — addition (neutral) — "only / just"
{ id: 'only', ko: '만', grammarKo: '만', role: 'addition',
  afterConsonant: '만', afterVowel: '만',
  label: L(/* "only", … */),
  hint: L(/* '"Only/just X". Replaces 은/는·이/가·을/를: 빵만 먹어요 = "I eat only bread."', … */) },

// recipient — 한테 — recipient (plum) — "to (a person)"
{ id: 'recipient', ko: '한테', grammarKo: '에게 / 한테 / 께', role: 'recipient',
  afterConsonant: '한테', afterVowel: '한테',
  label: L(/* "recipient", … */),
  hint: L(/* 'Marks the person who RECEIVES: 친구한테 (to a friend). 한테 casual speech, 에게 written, 께 honorific.', … */) },

// by-means — (으)로 — means (teal) — "by / with / via"
{ id: 'by-means', ko: '(으)로', grammarKo: '(으)로', role: 'means',
  afterConsonant: '으로', afterVowel: '로',
  label: L(/* "means/way", … */),
  hint: L(/* 'Means, instrument or direction: 버스로 (by bus), 연필로 (with a pencil). After a vowel OR ㄹ → 로; else 으로.', … */) },

// and — 와/과 — connective (rose) — "and / with"
{ id: 'and', ko: '와/과', grammarKo: '와/과 · 하고 · (이)랑', role: 'connective',
  afterConsonant: '과', afterVowel: '와',
  label: L(/* "and/with", … */),
  hint: L(/* 'Joins nouns ("A and B") or "with": 사과와 바나나. 과 after a consonant, 와 after a vowel. Bookish; 하고/(이)랑 are the spoken forms.', … */) },

// from — 부터 — addition (neutral) — "from (start point)"
{ id: 'from', ko: '부터', grammarKo: '부터 / 까지', role: 'addition',
  afterConsonant: '부터', afterVowel: '부터',
  label: L(/* "from", … */),
  hint: L(/* 'Starting point in time/sequence: 아홉 시부터 (from 9 o\'clock). Pairs with 까지 (until).', … */) },

// until — 까지 — addition (neutral) — "until (end point)"
{ id: 'until', ko: '까지', grammarKo: '부터 / 까지', role: 'addition',
  afterConsonant: '까지', afterVowel: '까지',
  label: L(/* "until/up to", … */),
  hint: L(/* 'End point in time/place: 다섯 시까지 (until 5). Pairs with 부터 (from); also "even/as far as".', … */) },
```

Append these to the `PARTICLES` array in `app/seed/particles.ts` (after `also`). Update the file header comment (lines 4-8) to list the new keys.

- [ ] **Step 2: Author + verify the 7 `LabSentence`s** (Korean tokenization FIXED below; produce all 8 locales for `trans`/`nuance` and each reading's `trans`/`nuance`). TOPIK-1/2 vocab. `gloss` per word, all 8 locales.

```
s08-chinguhante   친구[friend]+한테(recipient) · 편지[letter]+를(object) · 써요[write]
   trans: "I write a letter to a friend." · nuance: 한테 = the receiver; casual register.
   readings: off[recipient] → drops the "to whom" (casual / context-supplied);
             off[object]    → 를-drop, natural in speech.

s09-beoseuro      버스[bus]+로(by-means) · 학교[school]+에(place-static) · 가요[go]
   trans: "I go to school by bus." · nuance: 로 = means (how), 에 = destination (where to).
   readings: off[by-means]    → "버스 학교에 가요?" reads oddly — 로 carries "by/how";
             off[place-static] → casual destination drop (cf. s03).

s10-ppangman      빵[bread]+만(only) · 먹어요[eat]
   trans: "I eat only bread." · nuance: 만 = "only"; replaces 은/는·이/가·을/를.
   readings: off[only] → "빵 먹어요" = plain "I eat bread" — the "only" is gone.

s11-sagwawa       사과[apple]+와(connective) · 바나나[banana]+를(object) · 사요[buy]
   trans: "I buy apples and bananas." · nuance: 와 joins the two nouns (과 after consonant, 와 after vowel — 사과 ends in a vowel → 와).
   readings: off[connective] → list falls apart ("apples bananas…"); 하고/(이)랑 are the casual joiners;
             off[object]     → 를-drop, casual.

s12-ahopsibuteo   아홉[nine] · 시[o'clock]+부터(from) · 다섯[five] · 시[o'clock]+까지(until) · 일해요[work]
   trans: "I work from nine to five." · nuance: 부터…까지 = the classic range pair (start → end).
   readings: off[from]  → loses the start boundary ("…to five");
             off[until] → loses the end boundary ("from nine…").

s13-yeonpillo     연필[pencil]+로(by-means) · 편지[letter]+를(object) · 써요[write]
   trans: "I write a letter with a pencil." · nuance: 로 = instrument here (연필 ends in ㄹ → 로, not 으로).
   readings: off[by-means] → loses the "with what" (instrument);
             off[object]   → 를-drop, casual.

s14-jeodo         저[I]+도(also) · 커피[coffee]+를(object) · 마셔요[drink]
   trans: "I drink coffee too." · nuance: 도 = "too"; replaces 는/가, never 저는도 (cf. s05).
   readings: off[also]   → loses "too" (plain statement; 저는 for plain topic);
             off[object] → 를-drop, casual.
```

Each `LabSentence` follows the exact shape in `particle-sentences.ts` (`id`, `eojeols: Eojeol[]`, `trans`, `nuance`, `readings: [{ off, trans, nuance }]`). Particle tokens: `{ kind: 'particle', text: '<surface form>', particleId: '<id>', toggleable: true }` where the surface form is the actual syllable in the sentence (e.g. 한테, 로, 만, 와, 부터, 까지, 를, 에, 도). Append all 7 to the `PARTICLE_SENTENCES` array in `app/seed/particle-sentences.ts`.

- [ ] **Step 3: Splice + format**

Splice the verified defs and sentences into the two seed files. Then:
Run: `npx prettier --write app/seed/particles.ts app/seed/particle-sentences.ts`
Run: `pnpm typecheck` → clean (new ids/roles already exist from Phase 1).

(No commit yet — tests land in Task 4, commit there.)

---

### Task 4: Integrity tests + new-role chip test; verify; commit

**Files:**
- Modify: `tests/unit/particle-lab/explore.test.ts`
- Create: `tests/unit/particle-lab/particles-catalog.test.ts`
- Modify: `tests/components/particle-lab/TokenChip.test.ts`

- [ ] **Step 1: Extend `explore.test.ts`** — add a test that each new particle appears in the corpus. Insert inside the `describe('explore resolver', …)` block:

```ts
  it('finds a first sentence for every new particle', () => {
    for (const id of ['only', 'recipient', 'by-means', 'and', 'from', 'until'] as const)
      expect(indexOfParticle(PARTICLE_SENTENCES, id), id).toBeGreaterThanOrEqual(0)
  })
```

(The existing "every explicit reading references particles that exist in its sentence" loop already validates all new sentences' readings.)

- [ ] **Step 2: Create `tests/unit/particle-lab/particles-catalog.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { PARTICLE_IDS } from '~/lib/domain'
import { PARTICLES, particleById } from '~/seed/particles'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'

const catalogKeys = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))

describe('particle catalog integrity', () => {
  it('every declared particle id has exactly one def', () => {
    for (const id of PARTICLE_IDS) expect(particleById(id), id).toBeTruthy()
    expect(PARTICLES.length).toBe(PARTICLE_IDS.length)
  })

  it('every particle grammarKo resolves to a real catalog entry (the "ver ficha" link)', () => {
    for (const p of PARTICLES) expect(catalogKeys.has(p.grammarKo), `${p.id} → ${p.grammarKo}`).toBe(true)
  })

  it('allomorph particles differ, invariant particles repeat the form', () => {
    for (const p of PARTICLES) {
      if (p.id === 'topic' || p.id === 'subject' || p.id === 'object' || p.id === 'by-means' || p.id === 'and')
        expect(p.afterConsonant, p.id).not.toBe(p.afterVowel)
      else expect(p.afterConsonant, p.id).toBe(p.afterVowel)
    }
  })
})
```

- [ ] **Step 3: Extend `TokenChip.test.ts`** — assert a new-role particle renders its role class. Add after the existing particle tests:

```ts
  it('colors a recipient particle with its role class', () => {
    const tok: LabToken = { kind: 'particle', text: '한테', particleId: 'recipient', toggleable: true }
    const w = mountChip(tok)
    expect(w.get('[data-testid="particle-chip"]').classes()).toContain('chip--recipient')
  })
```

- [ ] **Step 4: Run the particle-lab suites + typecheck + lint**

Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab` → all PASS.
Run: `pnpm typecheck` → clean.
Run: `npx eslint app/seed/particles.ts app/seed/particle-sentences.ts tests/unit/particle-lab tests/components/particle-lab` → exit 0.

- [ ] **Step 5: Commit Phase 2**

```bash
git add munbeop/app/seed/particles.ts munbeop/app/seed/particle-sentences.ts \
  munbeop/tests/unit/particle-lab munbeop/tests/components/particle-lab
git commit -m "feat(particles): 6 new Explore particles + 7 sentences (만·한테·(으)로·와과·부터·까지)"
```

---

## PHASE 3 — Final verification

### Task 5: Full gates + manual smoke + visual QA

- [ ] **Step 1: Full gates** — Run: `pnpm test && pnpm typecheck && pnpm lint`. All green, 0 lint errors.

- [ ] **Step 2: Manual smoke** (`pnpm dev`, logged in, `/practice/particles`, Explore tab):
  - The legend lists all particles present per sentence with the right swatch colors.
  - Toggling each new particle OFF shows the explicit reading + nuance; toggling back ON restores the all-ON translation.
  - Popover (tap a legend item) shows label + hint + forms; the badge color matches the chip; "ver ficha completa" navigates to `/library?grammar=…` for every new particle (이 confirms the grammarKo keys resolve).
  - Deep link `?focus=recipient` (and the other new ids) scrolls to the first sentence containing it.

- [ ] **Step 3: Visual QA** (the new-colors check):
  - Light + dark: the 8 chip colors (topic/subject/object/place/addition/recipient/means/connective) are mutually distinguishable; `--plum`/`--teal`/`--rose` text passes ≥4.5:1 with `--always-dark` — lighten the light-mode plum/rose a notch if a sampler reports < 4.5:1.
  - Mobile 360px: chips wrap without overflow; legend wraps.
  - Spot-check `ja` and `th` locales render the new `label`/`hint`/`trans` without clipping.
  - Use the preview-verification transition-freeze workaround if sampling colors (occluded window freezes CSS transitions; inject `transition: none` before screenshotting — see `project_preview_verification_quirks`).

### Task 6: Finish the branch

- [ ] Update memory `project_particle_lab.md`: mark subproject #4 (Explore expansion) shipped with the PR number/commit.
- [ ] Use `superpowers:finishing-a-development-branch`: push → `gh pr create` → `gh pr merge --merge`. Merge `origin/main` into the branch first if it diverged; the GitHub mergeability check is async — retry once if it reports a stale conflict.

---

## Self-review

**Spec coverage:** 6 new particles → Task 3 Step 1; ~7–8 new sentences → Task 3 Step 2 (7 sentences, s08–s14); engine unchanged → confirmed (no engine task); grammarKo keys verified → "Verified facts" + Task 4 Step 2 test; new roles+colors decision → Phase 1 Task 2 (user-chosen); 와/과 key existence → resolved (`와/과 · 하고 · (이)랑`), s11 kept; tests (integrity loop, indexOfParticle, catalog, chip class) → Tasks 4; adversarial Korean content verification → Task 3; full gates + manual + visual QA → Phase 3. All covered.

**Placeholder scan:** The only deferred content is the 8-locale `label`/`hint`/`trans`/`nuance`/`reading` strings — produced and adversarially verified by the Task 3 workflow from the fully-specified Korean + English anchors here (a defined process, the repo's standard pattern, not a vague TODO). All code (types, tokens, chip/legend/badge/popover wiring, seed structure, tests) is concrete.

**Type consistency:** New ids `only/recipient/by-means/and/from/until` are added to `PARTICLE_IDS` (Task 1) and used identically in the seed defs (Task 3) and tests (Task 4). New roles `recipient/means/connective` (Task 1) map to the same three tokens `--plum/--teal/--rose` across `TokenChip`/`ParticleLegend`/`Badge`/`ParticlePopover` (Task 2). Badge variants `plum/teal/rose` returned by `badgeVariant` exist in the Badge union. `grammarKo` strings match the exact catalog keys listed in "Verified facts". `DEFAULT_GRAMMAR`/`Grammar.ko` used by the catalog test match `app/seed/grammars.ts`.
```
