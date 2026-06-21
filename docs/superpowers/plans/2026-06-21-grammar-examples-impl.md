# grammar_examples bank — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Multiple register-tagged example sentences per grammar point, surfaced in the study sheet, sourced as a static TS catalog (no DB) with a verified TOPIK-1 first batch.

**Architecture:** A `GrammarExample` domain type → static seed `app/seed/grammar-examples/` → pure `examplesFor(ko)` → `ExamplesSection.vue` (replaces the examples "Coming soon", falls back to the canonical `example`). Content is Claude-Workflow drafted + Korean-lens verified. The Step-5 engine and Supabase are untouched.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, vitest + @vue/test-utils, 8-locale `L()` seed helper.

**Spec:** `docs/superpowers/specs/2026-06-21-grammar-examples-design.md`

**Conventions:** run pnpm from `munbeop/`. Korean fragments (합니다체/해요체/반말 and all example sentences) are verbatim, never translated. Commit after each task with trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Branch: `claude/grammar-examples`.

---

## Task 1: `GrammarExample` type + `examplesFor` pure lib

**Files:**
- Modify: `munbeop/app/lib/domain/grammar.ts`
- Create: `munbeop/app/lib/grammar-examples/index.ts`
- Create: `munbeop/app/seed/grammar-examples/index.ts` (empty aggregate, filled in Task 2 — created here so the import resolves)
- Test: `munbeop/tests/unit/grammar-examples/examples-for.test.ts`

- [ ] **Step 1: Add the type to `grammar.ts`**

At the top, the file already has `import type { LocalizedString } from './i18n'`. Add a `SpeechLevel` import and the interface. First confirm `SpeechLevel` is defined in `./particles` and that `particles.ts` does NOT import `grammar.ts` (no cycle): `grep -n "SpeechLevel" munbeop/app/lib/domain/particles.ts` and `grep -n "from './grammar'" munbeop/app/lib/domain/particles.ts` (expect the second to be empty). If `particles.ts` imports `grammar.ts`, instead import `SpeechLevel` from wherever it's leaf-defined; otherwise:

```ts
import type { SpeechLevel } from './particles'
```

Add after the `Grammar` interface:

```ts
/**
 * One example sentence for a grammar point, tagged with the speech level
 * (register) of its predicate. Many per point — the bank that supersedes the
 * single `Grammar.example`. Sourced statically from `app/seed/grammar-examples/`.
 */
export interface GrammarExample {
  /** FK → Grammar.ko (the v1 stable id). NOT translated. */
  ko: string
  /** The Korean example sentence. NOT translated. */
  sentence: string
  /** Translation per locale. */
  trans: LocalizedString
  /** Register of the sentence's predicate (reuses the formality axis). */
  level: SpeechLevel
}
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/grammar-examples/examples-for.test.ts
import { describe, it, expect } from 'vitest'
import type { GrammarExample } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'

const L8 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const fixture: GrammarExample[] = [
  { ko: '-아/어요', sentence: '가요', trans: L8, level: 'casual' },
  { ko: '-아/어요', sentence: '갑니다', trans: L8, level: 'formal' },
  { ko: '-아/어요', sentence: '가요2', trans: L8, level: 'polite' },
  { ko: '-고', sentence: '먹고', trans: L8, level: 'polite' },
]

describe('examplesFor', () => {
  it('filters by ko', () => {
    expect(examplesFor('-고', fixture).map((e) => e.sentence)).toEqual(['먹고'])
  })
  it('sorts formal → polite → casual', () => {
    expect(examplesFor('-아/어요', fixture).map((e) => e.level)).toEqual([
      'formal', 'polite', 'casual',
    ])
  })
  it('caps at 4', () => {
    const many: GrammarExample[] = Array.from({ length: 6 }, (_, i) => ({
      ko: 'x', sentence: `s${i}`, trans: L8, level: 'polite' as const,
    }))
    expect(examplesFor('x', many)).toHaveLength(4)
  })
  it('unknown ko → []', () => {
    expect(examplesFor('nope', fixture)).toEqual([])
  })
})
```

- [ ] **Step 3: Run → FAIL**

Run: `cd munbeop && pnpm test -- grammar-examples/examples-for`
Expected: FAIL — cannot resolve `~/lib/grammar-examples`.

- [ ] **Step 4: Create the empty seed aggregate**

```ts
// app/seed/grammar-examples/index.ts
import type { GrammarExample } from '~/lib/domain'

/** Aggregated grammar-example catalog. Per-level arrays are spread in here. */
export const GRAMMAR_EXAMPLES: GrammarExample[] = []
```

- [ ] **Step 5: Implement `examplesFor`**

```ts
// app/lib/grammar-examples/index.ts
import type { GrammarExample, SpeechLevel } from '~/lib/domain'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'

const LEVEL_ORDER: Record<SpeechLevel, number> = { formal: 0, polite: 1, casual: 2 }
const MAX_EXAMPLES = 4

/** Examples for a grammar point, sorted formal→polite→casual, capped. */
export function examplesFor(
  ko: string,
  source: GrammarExample[] = GRAMMAR_EXAMPLES,
): GrammarExample[] {
  return source
    .filter((e) => e.ko === ko)
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .slice(0, MAX_EXAMPLES)
}
```

- [ ] **Step 6: Run → PASS**

Run: `cd munbeop && pnpm test -- grammar-examples/examples-for`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/domain/grammar.ts munbeop/app/lib/grammar-examples/index.ts munbeop/app/seed/grammar-examples/index.ts munbeop/tests/unit/grammar-examples/examples-for.test.ts
git commit -m "feat(grammar-examples): GrammarExample type + examplesFor pure lib"
```

---

## Task 2: Seed scaffold + invariant test (one worked example)

**Files:**
- Create: `munbeop/app/seed/grammar-examples/n1.ts`
- Modify: `munbeop/app/seed/grammar-examples/index.ts`
- Test: `munbeop/tests/unit/grammar-examples/seed-invariants.test.ts`

This task lands the seed FORMAT with one fully-worked, conjugation-correct example and the invariant guard. Task 4 fills the rest of the batch.

- [ ] **Step 1: Write the failing invariant test**

```ts
// tests/unit/grammar-examples/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const LEVELS = new Set(['formal', 'polite', 'casual'])
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/

describe('grammar-examples seed invariants', () => {
  it('is non-empty', () => {
    expect(GRAMMAR_EXAMPLES.length).toBeGreaterThan(0)
  })
  for (const [i, ex] of GRAMMAR_EXAMPLES.entries()) {
    it(`#${i} ${ex.ko} → "${ex.sentence}" is well-formed`, () => {
      expect(KNOWN_KO.has(ex.ko)).toBe(true)
      expect(LEVELS.has(ex.level)).toBe(true)
      expect(ex.sentence.trim().length).toBeGreaterThan(0)
      expect(ex.sentence).toMatch(HANGUL)
      for (const code of LOCALE_CODES) {
        expect((ex.trans as Record<string, string>)[code]?.trim().length ?? 0).toBeGreaterThan(0)
      }
    })
  }
})
```

NOTE: confirm `LOCALE_CODES` is exported from `~/lib/domain` (`grep -rn "LOCALE_CODES" munbeop/app/lib/domain`). If it's named differently, use that name. The 8 codes are `en, es, fr, pt-BR, th, id, vi, ja`.

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm test -- grammar-examples/seed-invariants`) — fails on "is non-empty" (seed empty).

- [ ] **Step 3: Create `n1.ts` with one worked example**

```ts
// app/seed/grammar-examples/n1.ts
import type { GrammarExample } from '~/lib/domain'
import { L } from '../locale'

/** TOPIK-1 grammar examples. ko values match grammars-n1.ts verbatim. */
export const TOPIK_1_EXAMPLES: GrammarExample[] = [
  {
    ko: '-아/어요',
    sentence: '저는 매일 학교에 가요.',
    trans: L(
      'I go to school every day.',
      'Voy a la escuela todos los días.',
      'Je vais à l’école tous les jours.',
      'Eu vou para a escola todos os dias.',
      'ฉันไปโรงเรียนทุกวัน',
      'Saya pergi ke sekolah setiap hari.',
      'Tôi đi học mỗi ngày.',
      '私は毎日学校に行きます。',
    ),
    level: 'polite',
  },
]
```

- [ ] **Step 4: Wire it into the aggregate**

```ts
// app/seed/grammar-examples/index.ts
import type { GrammarExample } from '~/lib/domain'
import { TOPIK_1_EXAMPLES } from './n1'

/** Aggregated grammar-example catalog. Per-level arrays are spread in here. */
export const GRAMMAR_EXAMPLES: GrammarExample[] = [...TOPIK_1_EXAMPLES]
```

- [ ] **Step 5: Run → PASS** (`cd munbeop && pnpm test -- grammar-examples/seed-invariants`)

- [ ] **Step 6: Verify the example's conjugation with the Step-5 engine (sanity)**

Run a quick node/vitest check that `가요` is the correct `-아/어요` form of `가다`:
`cd munbeop && node -e "import('./app/lib/korean/conjugate.ts')" ` is not directly runnable (TS); instead trust the existing engine golden tests. The verification Workflow in Task 4 does the systematic conjugation check.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/seed/grammar-examples/n1.ts munbeop/app/seed/grammar-examples/index.ts munbeop/tests/unit/grammar-examples/seed-invariants.test.ts
git commit -m "feat(grammar-examples): seed scaffold + invariants (one worked example)"
```

---

## Task 3: `ExamplesSection` component + study-sheet wiring + i18n

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/ExamplesSection.vue`
- Modify: `munbeop/app/components/library/GrammarStudySheet.vue`
- Modify: `munbeop/i18n/locales/{en,es,fr,id,ja,pt-BR,th,vi}.json`
- Test: `munbeop/tests/components/library/ExamplesSection.test.ts`

- [ ] **Step 1: Add i18n aria keys (register descriptions) to all 8 locales**

Under the existing `library` block, add an `examples` sub-block (the register CHIP shows Korean 합니다체/해요체/반말 verbatim; these keys are the accessible descriptions in the user's language). Keep the key set identical across all 8 locales.

```jsonc
// en.json — inside "library": { ... }
"examples": {
  "register_formal": "Formal register",
  "register_polite": "Polite register",
  "register_casual": "Casual register"
}
```

Translations: es (Registro formal/cortés/informal), fr (Registre formel/poli/familier), id (Ragam formal/sopan/santai), ja (フォーマル/丁寧/カジュアルな言い方), pt-BR (Registro formal/polido/informal), th (ระดับทางการ/สุภาพ/กันเอง), vi (Cách nói trang trọng/lịch sự/thân mật). Place the block consistently (e.g., near other `library.*` sub-blocks).

- [ ] **Step 2: Write the failing component test**

```ts
// tests/components/library/ExamplesSection.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('~/lib/grammar-examples', () => ({
  examplesFor: (ko: string) =>
    ko === '-아/어요'
      ? [
          { ko: '-아/어요', sentence: '학교에 가요.', trans: { en: 'I go to school.' }, level: 'polite' },
          { ko: '-아/어요', sentence: '학교에 갑니다.', trans: { en: 'I go to school.' }, level: 'formal' },
        ]
      : [],
}))

import ExamplesSection from '~/components/library/GrammarStudySheet/ExamplesSection.vue'

const mountWith = (grammar: Record<string, unknown>) =>
  mount(ExamplesSection, {
    props: { grammar },
    global: { mocks: { $t: (k: string) => k }, stubs: {} },
  })

describe('ExamplesSection', () => {
  it('renders one row per bank example with a register chip', () => {
    const w = mountWith({ ko: '-아/어요' })
    expect(w.findAll('.example')).toHaveLength(2)
    expect(w.text()).toContain('학교에 가요.')
    expect(w.text()).toContain('해요체') // polite chip
    expect(w.text()).toContain('합니다체') // formal chip
  })
  it('falls back to the canonical example when the bank is empty', () => {
    const w = mountWith({ ko: '-고', example: '밥을 먹고 잤어요.', trans: { en: 'I ate and slept.' } })
    expect(w.findAll('.example')).toHaveLength(1)
    expect(w.text()).toContain('밥을 먹고 잤어요.')
    expect(w.text()).not.toContain('해요체') // no chip on the fallback
  })
  it('renders nothing when there is neither a bank nor a canonical example', () => {
    const w = mountWith({ ko: '-고' })
    expect(w.find('.examples-section').exists()).toBe(false)
  })
})
```

NOTE: the repo's `tests/setup.ts` globally stubs `useI18n`/`useLocalized`. If `useLocalized().tl` is not stubbed to return a string in this context, add `vi.mock('~/composables/useLocalized', () => ({ useLocalized: () => ({ tl: (s: Record<string,string>) => s.en ?? '' }) }))` to the test so `tl` is deterministic. Verify against `tests/setup.ts` first.

- [ ] **Step 3: Run → FAIL** (`cd munbeop && pnpm test -- ExamplesSection`)

- [ ] **Step 4: Implement `ExamplesSection.vue`** (mirrors `UsageNotesSection.vue` conventions — `t`/`tl`, Press Start 2P section title, Inter body, `--ink`/`--ink-soft`/`--paper`)

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar, SpeechLevel } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const REGISTER_KO: Record<SpeechLevel, string> = {
  formal: '합니다체',
  polite: '해요체',
  casual: '반말',
}
const REGISTER_ARIA: Record<SpeechLevel, string> = {
  formal: 'library.examples.register_formal',
  polite: 'library.examples.register_polite',
  casual: 'library.examples.register_casual',
}

const bank = computed(() => examplesFor(props.grammar.ko))
const fallback = computed(() =>
  bank.value.length === 0 && props.grammar.example
    ? {
        sentence: props.grammar.example,
        trans: props.grammar.trans ? tl(props.grammar.trans) : '',
      }
    : null,
)
</script>

<template>
  <section v-if="bank.length || fallback" class="examples-section">
    <h3 class="section-title">{{ t('library.modal.section.examples') }}</h3>
    <ul class="examples">
      <li v-for="(ex, i) in bank" :key="i" class="example">
        <p class="example__ko" lang="ko">
          <span class="example__sentence">{{ ex.sentence }}</span>
          <span class="example__chip" lang="ko" :aria-label="t(REGISTER_ARIA[ex.level])">{{ REGISTER_KO[ex.level] }}</span>
        </p>
        <p class="example__trans">{{ tl(ex.trans) }}</p>
      </li>
      <li v-if="fallback" class="example">
        <p class="example__ko" lang="ko">{{ fallback.sentence }}</p>
        <p v-if="fallback.trans" class="example__trans">{{ fallback.trans }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.examples {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.example {
  border-left: 3px solid var(--ink-line);
  padding-left: 10px;
}
.example__ko {
  margin: 0 0 2px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}
.example__chip {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  border: 1px solid var(--ink-line);
  padding: 2px 5px;
  white-space: nowrap;
}
.example__trans {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
</style>
```

- [ ] **Step 5: Wire into `GrammarStudySheet.vue`** — replace the examples `ComingSoonSection` with `ExamplesSection`.

Change the import block to add `import ExamplesSection from './GrammarStudySheet/ExamplesSection.vue'`, and replace:

```vue
    <ComingSoonSection
      :title="t('library.modal.section.examples')"
      :body="t('library.modal.coming_soon.examples')"
    />
```

with:

```vue
    <ExamplesSection :grammar="grammar" />
```

(Leave the audio + achievements ComingSoon sections. The now-unused `library.modal.coming_soon.examples` key may stay; remove it only if a dead-key test fails.)

- [ ] **Step 6: Run → PASS** (`cd munbeop && pnpm test -- ExamplesSection`) and the i18n parity suite (`cd munbeop && pnpm test -- i18n`).

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/ExamplesSection.vue munbeop/app/components/library/GrammarStudySheet.vue munbeop/i18n/locales/*.json munbeop/tests/components/library/ExamplesSection.test.ts
git commit -m "feat(grammar-examples): ExamplesSection in the study sheet + register i18n"
```

---

## Task 4: Author + verify the TOPIK-1 batch (Workflow-driven)

**Files:**
- Modify: `munbeop/app/seed/grammar-examples/n1.ts` (add the full batch)

This task is content. The drafting and verification are done with Claude **Workflows** (run by the controller during execution), not a runtime tool. The 12 target points (all confirmed in `grammars-n1.ts`):
`-아/어요`, `-았/었어요`, `-ㅂ/습니다`, `-(으)세요`, `-(으)ㄹ 거예요`, `-고`, `-아/어서`, `-지만`, `-(으)면`, `-ㄴ/는데`, `-고 싶다`, `-고 있다`.

- [ ] **Step 1: Draft** — run a drafting Workflow: one agent per point (pipeline), each given the point's `ko` + `meaning` + `usageNotes` (from `grammars-n1.ts`), producing ~3 `GrammarExample` rows that (a) span registers where natural, (b) use vocabulary a TOPIK-1 learner knows, (c) keep any conjugated verb forms correct, (d) include all 8-locale `trans`. Schema-validate each row.

- [ ] **Step 2: Verify** — run a Korean-lens verification Workflow over the drafted rows: per row, 3 adversarial lenses — (i) grammaticality + naturalness (is it real, idiomatic Korean that actually demonstrates the point?), (ii) register-tag accuracy (does the predicate's ending match the tagged `level`?), (iii) 8-locale translation fidelity. Also reconcile every conjugated content verb against `app/lib/korean` `conjugate` where applicable. Fix or drop flagged rows; re-verify until clean. Log any dropped points.

- [ ] **Step 3: Write the verified rows into `n1.ts`** using the `L(...)` helper (replace the single seed example with the full batch; the `-아/어요` worked example from Task 2 may stay as one of its rows).

- [ ] **Step 4: Run the invariant test + full suite**

Run: `cd munbeop && pnpm test -- grammar-examples`
Expected: PASS — every row well-formed; each of the 12 points has ≥2 examples (add an extra assertion if helpful: group by ko, assert each target ko present with ≥2).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/seed/grammar-examples/n1.ts
git commit -m "content(grammar-examples): verified TOPIK-1 batch (12 points × ~3, 8-locale)"
```

---

## Task 5: Full gates + study-sheet smoke

- [ ] **Step 1: Gates** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`. All green; engine untouched; no migration. Fix any regression.

- [ ] **Step 2: Live smoke** (preview tools; synthetic Supabase session per the `project-preview-verification-quirks` notes). Open the Library, pick a TOPIK-1 point that has bank examples (e.g. `-아/어요`), open its study sheet, confirm the Examples section shows the register-tagged rows (Korean + translation + chip) and that a non-batch point falls back to its single canonical example. Light + dark. No console errors beyond the synthetic-JWT artifact.

- [ ] **Step 3: Push + PR + merge** — only on the user's go-ahead (the auto-mode guard requires explicit merge authorization). Wait for CI green before merging.

```bash
git push -u origin claude/grammar-examples
gh pr create --base main --title "feat(grammar-examples): examples bank + TOPIK-1 batch (roadmap Step 6)" --body "..."
```

---

## Self-Review

**Spec coverage:** static catalog + `GrammarExample` (Task 1) ✓; `examplesFor` sort/cap (Task 1) ✓; seed `app/seed/grammar-examples/` + invariants (Tasks 2,4) ✓; reuse `SpeechLevel` (Task 1) ✓; keep canonical `example` + fallback (Task 3) ✓; `ExamplesSection` replaces examples Coming-Soon (Task 3) ✓; register chips 합니다체/해요체/반말 + aria i18n (Task 3) ✓; AI-draft + Korean-lens verify + engine conjugation check (Task 4) ✓; TOPIK-1 12-point batch (Task 4) ✓; tests + parity (Tasks 1–3) ✓; gates + smoke (Task 5) ✓. Acceptance criteria 1–4 all covered.

**Placeholder scan:** none — mechanical tasks have full code. Task 4 is intentionally Workflow-driven content generation (the 36 rows can't be literal-coded blind); it is fully specified (points, schema, draft+verify gates, target file) and guarded by the Task 2 invariant test. The two NOTE checks (SpeechLevel cycle, LOCALE_CODES name, useLocalized stub) are verification steps, not placeholders.

**Type consistency:** `GrammarExample {ko, sentence, trans, level}` defined in Task 1, consumed identically in `examplesFor` (Task 1), the seed (Tasks 2/4), and `ExamplesSection` (Task 3); `examplesFor(ko, source?)` signature matches its test and its component call; `SpeechLevel` ('formal'|'polite'|'casual') drives both `LEVEL_ORDER` and the `REGISTER_KO`/`REGISTER_ARIA` maps.
