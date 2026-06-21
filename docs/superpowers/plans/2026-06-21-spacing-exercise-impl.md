# 띄어쓰기 (spacing) exercise — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third Particle Lab mode — 띄어쓰기 (spacing) — where the user inserts the correct spaces into a Korean sentence across two difficulty levels, teaching that 조사 stick to the preceding word and 어절 are space-separated.

**Architecture:** One ground truth (the existing `Eojeol` segmentation of the 14 Explore sentences) drives two render granularities. `lib/particle-lab/spacing.ts` (pure) derives a `SpacingPuzzle` of blocks + gaps per level and grades the user's gap choices deterministically — no morphology engine. A thin `useParticleSpacing` composable mirrors `useParticleDrill` (shuffle, score, replay) but is self-contained: no SRS/diary writes. New components render the puzzle; the page gains a third tab.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, TypeScript, Vitest + @vue/test-utils, pnpm, @nuxtjs/i18n (8 locales).

**Conventions:**
- Spec: `docs/superpowers/specs/2026-06-21-spacing-exercise-design.md`.
- All paths below are relative to the repo root; app code lives under `munbeop/`.
- Run commands from the repo root using `pnpm -C munbeop …`.
- Single file: `pnpm -C munbeop exec vitest run <path>`. Full suite: `pnpm -C munbeop test`. Types: `pnpm -C munbeop typecheck`. Lint: `pnpm -C munbeop lint`.
- Tests globally stub `useI18n` (echoes the key; appends interpolation values) and `useLocalized` (`tl` resolves a `LocalizedString` to its English string) — see `munbeop/tests/setup.ts`.

---

### Task 1: `spacing.ts` — types + `correctSpacing` (gold table)

**Files:**
- Create: `munbeop/app/lib/particle-lab/spacing.ts`
- Modify: `munbeop/app/lib/particle-lab/index.ts`
- Test: `munbeop/tests/unit/particle-lab/spacing.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/particle-lab/spacing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { correctSpacing } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

/** The standard 한글 맞춤법 띄어쓰기 surface of each Explore sentence. */
const GOLD: Record<string, string> = {
  's01-jeoneun': '저는 학생이에요',
  's02-goyangi': '고양이가 우유를 마셔요',
  's03-hakgyo': '학교에 가요',
  's04-doseogwan': '도서관에서 공부해요',
  's05-jeodo': '저도 커피를 좋아해요',
  's06-achime': '아침에 빵을 먹어요',
  's07-biga': '비가 와요',
  's08-chinguhante': '친구한테 편지를 써요',
  's09-beoseuro': '버스로 학교에 가요',
  's10-ppangman': '빵만 먹어요',
  's11-sagwawa': '사과와 바나나를 사요',
  's12-ahopsibuteo': '아홉 시부터 다섯 시까지 일해요',
  's13-yeonpillo': '연필로 편지를 써요',
  's14-jeodo': '저도 커피를 마셔요',
}

describe('correctSpacing', () => {
  it('reproduces the standard spacing for all 14 sentences', () => {
    for (const s of PARTICLE_SENTENCES) expect(correctSpacing(s)).toBe(GOLD[s.id])
    expect(Object.keys(GOLD)).toHaveLength(PARTICLE_SENTENCES.length)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: FAIL — `correctSpacing` is not exported from `~/lib/particle-lab`.

- [ ] **Step 3: Write the minimal implementation**

Create `munbeop/app/lib/particle-lab/spacing.ts`:

```ts
import type { Eojeol, LabSentence } from '../domain/particles'

export type SpacingLevel = 1 | 2
export type GapValue = 'space' | 'join'
export type GapKind = 'particle' | 'word-internal' | 'eojeol'

export interface Gap {
  /** The correct answer for this junction. */
  correct: GapValue
  /** Why — drives the reveal feedback message. */
  kind: GapKind
}

export interface SpacingPuzzle {
  sentenceId: string
  /** Display blocks in order (tokens at L1, single syllables at L2). */
  blocks: string[]
  /** One gap between each adjacent block pair → gaps.length === blocks.length - 1. */
  gaps: Gap[]
}

export interface GapResult {
  index: number
  given: GapValue
  correct: boolean
  gap: Gap
}

export interface SpacingResult {
  gaps: GapResult[]
  /** Every gap matches. */
  correct: boolean
}

/** Concatenate a single eojeol's token texts (base/polite surface). */
export function eojeolText(eojeol: Eojeol): string {
  return eojeol.map((t) => t.text).join('')
}

/** The correctly-spaced surface: eojeol texts joined by one space. The gold answer. */
export function correctSpacing(sentence: LabSentence): string {
  return sentence.eojeols.map(eojeolText).join(' ')
}
```

Append to `munbeop/app/lib/particle-lab/index.ts`:

```ts
export * from './spacing'
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/particle-lab/spacing.ts munbeop/app/lib/particle-lab/index.ts munbeop/tests/unit/particle-lab/spacing.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): spacing.ts — correctSpacing gold table (14 sentences)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `spacing.ts` — `buildPuzzle` (both levels) + reassembly invariant

**Files:**
- Modify: `munbeop/app/lib/particle-lab/spacing.ts`
- Test: `munbeop/tests/unit/particle-lab/spacing.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `munbeop/tests/unit/particle-lab/spacing.test.ts`:

```ts
import { buildPuzzle, type SpacingPuzzle, type SpacingLevel } from '~/lib/particle-lab'

const byId = (id: string) => PARTICLE_SENTENCES.find((s) => s.id === id)!

/** Rebuild the sentence from a puzzle using each gap's CORRECT value. */
function reassemble(p: SpacingPuzzle): string {
  return p.blocks
    .map((b, i) => (i < p.blocks.length - 1 ? b + (p.gaps[i]!.correct === 'space' ? ' ' : '') : b))
    .join('')
}

describe('buildPuzzle — level 1 (chunked tokens)', () => {
  it('splits s01 into word/particle blocks with the right gaps', () => {
    const p = buildPuzzle(byId('s01-jeoneun'), 1)
    expect(p.blocks).toEqual(['저', '는', '학생이에요'])
    expect(p.gaps).toEqual([
      { correct: 'join', kind: 'particle' },
      { correct: 'space', kind: 'eojeol' },
    ])
  })

  it('spaces a number from its counter (s12: 아홉 | 시)', () => {
    const p = buildPuzzle(byId('s12-ahopsibuteo'), 1)
    // blocks: 아홉 | 시 | 부터 | 다섯 | 시 | 까지 | 일해요
    expect(p.blocks).toEqual(['아홉', '시', '부터', '다섯', '시', '까지', '일해요'])
    expect(p.gaps[0]).toEqual({ correct: 'space', kind: 'eojeol' }) // 아홉 | 시
    expect(p.gaps[1]).toEqual({ correct: 'join', kind: 'particle' }) // 시 | 부터
  })
})

describe('buildPuzzle — level 2 (syllables)', () => {
  it('splits s01 into syllables, joining inside the predicate', () => {
    const p = buildPuzzle(byId('s01-jeoneun'), 2)
    expect(p.blocks).toEqual(['저', '는', '학', '생', '이', '에', '요'])
    expect(p.gaps).toEqual([
      { correct: 'join', kind: 'particle' }, // 저 | 는
      { correct: 'space', kind: 'eojeol' }, // 는 | 학
      { correct: 'join', kind: 'word-internal' }, // 학 | 생
      { correct: 'join', kind: 'word-internal' }, // 생 | 이
      { correct: 'join', kind: 'word-internal' }, // 이 | 에
      { correct: 'join', kind: 'word-internal' }, // 에 | 요
    ])
  })
})

describe('buildPuzzle — invariant', () => {
  it('reassembles to correctSpacing at both levels, with gaps = blocks - 1', () => {
    for (const s of PARTICLE_SENTENCES) {
      for (const level of [1, 2] as SpacingLevel[]) {
        const p = buildPuzzle(s, level)
        expect(p.gaps).toHaveLength(p.blocks.length - 1)
        expect(reassemble(p)).toBe(correctSpacing(s))
      }
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: FAIL — `buildPuzzle` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Append to `munbeop/app/lib/particle-lab/spacing.ts`:

```ts
interface Segment {
  text: string
  eojeolIndex: number
  isParticle: boolean
}

/** Flatten a sentence to ordered token-segments tagged with eojeol + role. */
function segmentsOf(sentence: LabSentence): Segment[] {
  const out: Segment[] = []
  sentence.eojeols.forEach((eojeol, ei) => {
    for (const token of eojeol)
      out.push({ text: token.text, eojeolIndex: ei, isParticle: token.kind === 'particle' })
  })
  return out
}

/** Classify the junction between two adjacent segments. */
function gapBetween(a: Segment, b: Segment): Gap {
  if (a.eojeolIndex !== b.eojeolIndex) return { correct: 'space', kind: 'eojeol' }
  if (b.isParticle) return { correct: 'join', kind: 'particle' }
  return { correct: 'join', kind: 'word-internal' }
}

/** Build a level-specific puzzle from the sentence's eojeol structure. */
export function buildPuzzle(sentence: LabSentence, level: SpacingLevel): SpacingPuzzle {
  const segments = segmentsOf(sentence)
  const blocks: string[] = []
  const gaps: Gap[] = []

  if (level === 1) {
    segments.forEach((seg, i) => {
      blocks.push(seg.text)
      const next = segments[i + 1]
      if (next) gaps.push(gapBetween(seg, next))
    })
    return { sentenceId: sentence.id, blocks, gaps }
  }

  // level 2 — one block per syllable; gaps inside a token always join.
  segments.forEach((seg, si) => {
    const chars = [...seg.text]
    chars.forEach((ch, ci) => {
      blocks.push(ch)
      if (ci < chars.length - 1) {
        gaps.push({ correct: 'join', kind: 'word-internal' })
        return
      }
      const next = segments[si + 1]
      if (next) gaps.push(gapBetween(seg, next))
    })
  })
  return { sentenceId: sentence.id, blocks, gaps }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: PASS (all describes).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/particle-lab/spacing.ts munbeop/tests/unit/particle-lab/spacing.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): buildPuzzle — L1 token / L2 syllable blocks + gaps

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `spacing.ts` — `gradePuzzle`

**Files:**
- Modify: `munbeop/app/lib/particle-lab/spacing.ts`
- Test: `munbeop/tests/unit/particle-lab/spacing.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `munbeop/tests/unit/particle-lab/spacing.test.ts`:

```ts
import { gradePuzzle, type GapValue } from '~/lib/particle-lab'

describe('gradePuzzle', () => {
  const p = buildPuzzle(byId('s01-jeoneun'), 1) // gaps: [join, space]

  it('marks all correct when answers match', () => {
    const r = gradePuzzle(p, ['join', 'space'])
    expect(r.correct).toBe(true)
    expect(r.gaps.map((g) => g.correct)).toEqual([true, true])
  })

  it('flags the specific wrong gap', () => {
    const r = gradePuzzle(p, ['space', 'space'] as GapValue[]) // spaced before the particle
    expect(r.correct).toBe(false)
    expect(r.gaps[0]).toEqual({
      index: 0,
      given: 'space',
      correct: false,
      gap: { correct: 'join', kind: 'particle' },
    })
    expect(r.gaps[1]!.correct).toBe(true)
  })

  it('treats a missing answer as join (default)', () => {
    const r = gradePuzzle(p, []) // nothing tapped → all join → the eojeol space is missed
    expect(r.correct).toBe(false)
    expect(r.gaps[0]!.correct).toBe(true) // join is right for the particle gap
    expect(r.gaps[1]!.correct).toBe(false) // missing space at the eojeol boundary
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: FAIL — `gradePuzzle` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Append to `munbeop/app/lib/particle-lab/spacing.ts`:

```ts
/** Compare the user's gap choices against the puzzle. Unset gaps default to 'join'. */
export function gradePuzzle(puzzle: SpacingPuzzle, answers: GapValue[]): SpacingResult {
  const gaps: GapResult[] = puzzle.gaps.map((gap, index) => {
    const given = answers[index] ?? 'join'
    return { index, given, correct: given === gap.correct, gap }
  })
  return { gaps, correct: gaps.every((g) => g.correct) }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm -C munbeop exec vitest run tests/unit/particle-lab/spacing.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/particle-lab/spacing.ts munbeop/tests/unit/particle-lab/spacing.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): gradePuzzle — deterministic per-gap spacing verdict

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `useParticleSpacing` composable

**Files:**
- Create: `munbeop/app/composables/useParticleSpacing.ts`

No dedicated unit test (mirrors `useParticleDrill`, which is covered via its engine + components + manual smoke). Verified by `typecheck` and downstream component/page tasks.

- [ ] **Step 1: Write the composable**

Create `munbeop/app/composables/useParticleSpacing.ts`:

```ts
import { computed, ref } from 'vue'
import type { LabSentence } from '~/lib/domain'
import {
  buildPuzzle,
  gradePuzzle,
  scoreOf,
  shuffle,
  type DrillItemResult,
  type GapValue,
  type SpacingLevel,
  type SpacingResult,
} from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

export type SpacingPhase = 'question' | 'answered' | 'done'
export type SpacingMode = 'normal' | 'replay'

/**
 * 띄어쓰기 (spacing) drill loop. Self-contained: no SRS/diary writes — spacing is
 * orthography, not particle mastery. Mirrors useParticleDrill's shape.
 */
export function useParticleSpacing() {
  const level = ref<SpacingLevel>(1)
  const sessionItems = ref<LabSentence[]>([])
  const mode = ref<SpacingMode>('normal')

  const index = ref(0)
  const phase = ref<SpacingPhase>('question')
  const answers = ref<GapValue[]>([])
  const result = ref<SpacingResult | null>(null)
  const results = ref<DrillItemResult[]>([])

  const sentence = computed<LabSentence>(() => sessionItems.value[index.value]!)
  const puzzle = computed(() => buildPuzzle(sentence.value, level.value))
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((s) => results.value.some((r) => r.itemId === s.id && !r.correct)),
  )

  /** All gaps default to 'join' — the task is to insert the spaces. */
  function freshAnswers(): GapValue[] {
    return puzzle.value.gaps.map(() => 'join')
  }

  function resetItem() {
    phase.value = 'question'
    result.value = null
    answers.value = freshAnswers()
  }

  function resetRound() {
    index.value = 0
    results.value = []
    resetItem()
  }

  function start() {
    mode.value = 'normal'
    sessionItems.value = shuffle(PARTICLE_SENTENCES)
    resetRound()
  }

  /** Switch level and restart (level is otherwise sticky across rounds). */
  function selectLevel(l: SpacingLevel) {
    level.value = l
    start()
  }

  /** Re-drill only the missed sentences from the round just finished. */
  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
  }

  function toggleGap(i: number) {
    if (phase.value !== 'question') return
    const next = [...answers.value]
    next[i] = next[i] === 'space' ? 'join' : 'space'
    answers.value = next
  }

  function check() {
    if (phase.value !== 'question') return
    const r = gradePuzzle(puzzle.value, answers.value)
    result.value = r
    results.value.push({ itemId: sentence.value.id, correct: r.correct, batchimSlips: 0 })
    phase.value = 'answered'
  }

  function next() {
    if (phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    resetItem()
  }

  return {
    level,
    sessionItems,
    mode,
    index,
    phase,
    answers,
    result,
    sentence,
    puzzle,
    score,
    failedItems,
    start,
    selectLevel,
    replayFailed,
    toggleGap,
    check,
    next,
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -C munbeop typecheck`
Expected: PASS (no type errors). Note `GapValue`, `SpacingLevel`, `SpacingResult` resolve through the `~/lib/particle-lab` barrel (Task 1 added `export * from './spacing'`).

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/composables/useParticleSpacing.ts
git commit -m "$(cat <<'EOF'
feat(particles): useParticleSpacing — self-contained spacing drill loop

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `SpacingGap.vue` — tappable junction

**Files:**
- Create: `munbeop/app/components/particle-lab/SpacingGap.vue`

Presentational; exercised through `SpacingCard` (Task 6).

- [ ] **Step 1: Write the component**

Create `munbeop/app/components/particle-lab/SpacingGap.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Gap, GapValue } from '~/lib/particle-lab'

/** One tappable junction between two blocks: space (␣) or join (·). */
interface Props {
  index: number
  value: GapValue
  gap: Gap
  revealed: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ toggle: [index: number] }>()

const isSpace = computed(() => props.value === 'space')
const isCorrect = computed(() => props.value === props.gap.correct)
</script>

<template>
  <button
    type="button"
    class="gap"
    :class="{
      'gap--space': isSpace,
      'gap--revealed': revealed,
      'gap--correct': revealed && isCorrect,
      'gap--wrong': revealed && !isCorrect,
    }"
    :disabled="revealed"
    :aria-pressed="isSpace"
    :data-testid="`spacing-gap-${index}`"
    @click="emit('toggle', index)"
  >
    <span class="gap__mark" aria-hidden="true">{{ isSpace ? '␣' : '·' }}</span>
  </button>
</template>

<style scoped>
.gap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  align-self: stretch;
  margin: 0 1px;
  padding: 0 2px;
  background: transparent;
  border: none;
  border-bottom: 2px dotted var(--border);
  color: var(--text-soft);
  font-family: var(--font-ko);
  font-size: var(--text-md);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.gap--space {
  min-width: 22px;
  background: var(--paper);
  border-bottom-color: var(--accent);
  color: var(--accent);
}
.gap:hover:not(:disabled) {
  color: var(--text);
}
.gap--revealed {
  cursor: default;
}
.gap--correct {
  border-bottom-color: var(--jade);
  color: var(--jade);
}
.gap--wrong {
  border-bottom-color: var(--danger);
  color: var(--danger);
}
.gap:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -C munbeop typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingGap.vue
git commit -m "$(cat <<'EOF'
feat(particles): SpacingGap — tappable space/join junction

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `SpacingCard.vue` + component test

**Files:**
- Create: `munbeop/app/components/particle-lab/SpacingCard.vue`
- Test: `munbeop/tests/components/particle-lab/SpacingCard.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/particle-lab/SpacingCard.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SpacingCard from '~/components/particle-lab/SpacingCard.vue'
import type { LocalizedString } from '~/lib/domain'
import type { GapValue, SpacingPuzzle, SpacingResult } from '~/lib/particle-lab'

const LS = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Level-1 puzzle for 저는 학생이에요.
const PUZZLE: SpacingPuzzle = {
  sentenceId: 's01-jeoneun',
  blocks: ['저', '는', '학생이에요'],
  gaps: [
    { correct: 'join', kind: 'particle' },
    { correct: 'space', kind: 'eojeol' },
  ],
}

function mountCard(overrides: Record<string, unknown> = {}) {
  return mount(SpacingCard, {
    props: {
      puzzle: PUZZLE,
      answers: ['join', 'join'] as GapValue[],
      phase: 'question',
      result: null,
      trans: LS('I am a student.'),
      ...overrides,
    },
  })
}

describe('SpacingCard', () => {
  it('renders blocks and one gap between each adjacent pair', () => {
    const w = mountCard()
    expect(w.text()).toContain('저')
    expect(w.text()).toContain('학생이에요')
    expect(w.find('[data-testid="spacing-gap-0"]').exists()).toBe(true)
    expect(w.find('[data-testid="spacing-gap-1"]').exists()).toBe(true)
    expect(w.find('[data-testid="spacing-gap-2"]').exists()).toBe(false)
  })

  it('emits toggle with the gap index', async () => {
    const w = mountCard()
    await w.get('[data-testid="spacing-gap-1"]').trigger('click')
    expect(w.emitted('toggle')).toEqual([[1]])
  })

  it('emits check when the check button is pressed', async () => {
    const w = mountCard()
    await w.get('[data-testid="spacing-check"]').trigger('click')
    expect(w.emitted('check')).toBeTruthy()
  })

  it('reveals the violated rule and the correct sentence on a wrong answer', () => {
    const result: SpacingResult = {
      correct: false,
      gaps: [
        { index: 0, given: 'space', correct: false, gap: { correct: 'join', kind: 'particle' } },
        { index: 1, given: 'space', correct: true, gap: { correct: 'space', kind: 'eojeol' } },
      ],
    }
    const w = mountCard({ phase: 'answered', result, answers: ['space', 'space'] })
    const fb = w.get('[data-testid="spacing-feedback"]')
    expect(fb.text()).toContain('particles.spacing.try_again')
    expect(fb.text()).toContain('particles.spacing.rule_particle')
    expect(fb.text()).toContain('저는 학생이에요')
  })

  it('shows the success verdict when every gap is right', () => {
    const result: SpacingResult = {
      correct: true,
      gaps: [
        { index: 0, given: 'join', correct: true, gap: { correct: 'join', kind: 'particle' } },
        { index: 1, given: 'space', correct: true, gap: { correct: 'space', kind: 'eojeol' } },
      ],
    }
    const w = mountCard({ phase: 'answered', result, answers: ['join', 'space'] })
    expect(w.get('[data-testid="spacing-feedback"]').text()).toContain('particles.spacing.correct')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm -C munbeop exec vitest run tests/components/particle-lab/SpacingCard.test.ts`
Expected: FAIL — `SpacingCard.vue` does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/particle-lab/SpacingCard.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { LocalizedString } from '~/lib/domain'
import type { GapValue, SpacingPuzzle, SpacingResult } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'
import SpacingGap from './SpacingGap.vue'

/** One spacing puzzle: blocks interleaved with tappable gaps + reveal feedback. */
interface Props {
  puzzle: SpacingPuzzle
  answers: GapValue[]
  phase: 'question' | 'answered' | 'done'
  result: SpacingResult | null
  trans: LocalizedString
}
const props = defineProps<Props>()
const emit = defineEmits<{ toggle: [index: number]; check: []; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const revealed = computed(() => props.phase === 'answered')

/** Rebuild the correctly-spaced sentence from the puzzle alone. */
const correctText = computed(() =>
  props.puzzle.blocks
    .map((b, i) =>
      i < props.puzzle.blocks.length - 1
        ? b + (props.puzzle.gaps[i]!.correct === 'space' ? ' ' : '')
        : b,
    )
    .join(''),
)

const RULE_KEY: Record<string, string> = {
  particle: 'particles.spacing.rule_particle',
  eojeol: 'particles.spacing.rule_eojeol',
  'word-internal': 'particles.spacing.rule_word_internal',
}

/** Distinct rule messages for the gap kinds the user got wrong. */
const wrongRules = computed(() => {
  if (!props.result) return []
  const kinds = new Set<string>()
  for (const g of props.result.gaps) if (!g.correct) kinds.add(g.gap.kind)
  return [...kinds].map((k) => RULE_KEY[k]!)
})
</script>

<template>
  <section class="spacing" data-testid="spacing-card">
    <p class="spacing__lead">{{ t('particles.spacing.lead') }}</p>

    <div class="spacing__sentence" lang="ko">
      <template v-for="(block, i) in puzzle.blocks" :key="i">
        <span class="spacing__block">{{ block }}</span>
        <SpacingGap
          v-if="i < puzzle.blocks.length - 1"
          :index="i"
          :value="answers[i] ?? 'join'"
          :gap="puzzle.gaps[i]!"
          :revealed="revealed"
          @toggle="emit('toggle', $event)"
        />
      </template>
    </div>

    <p class="spacing__trans">{{ tl(trans) }}</p>

    <button
      v-if="!revealed"
      type="button"
      class="spacing__btn spacing__btn--primary"
      data-testid="spacing-check"
      @click="emit('check')"
    >
      {{ t('particles.spacing.check') }}
    </button>

    <div
      v-else
      aria-live="polite"
      class="spacing__feedback"
      :class="result?.correct ? 'spacing__feedback--ok' : 'spacing__feedback--no'"
      data-testid="spacing-feedback"
    >
      <h4 class="spacing__verdict">
        {{ result?.correct ? `✅ ${t('particles.spacing.correct')}` : `✏️ ${t('particles.spacing.try_again')}` }}
      </h4>
      <p class="spacing__answer" lang="ko">{{ correctText }}</p>
      <ul v-if="wrongRules.length" class="spacing__rules">
        <li v-for="key in wrongRules" :key="key">{{ t(key) }}</li>
      </ul>
      <button
        type="button"
        class="spacing__btn"
        data-testid="spacing-next"
        @click="emit('next')"
      >
        {{ t('particles.spacing.next') }} ►
      </button>
    </div>
  </section>
</template>

<style scoped>
.spacing {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.spacing__lead {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  line-height: 1.6;
}
.spacing__sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  padding: 14px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.spacing__block {
  display: inline-flex;
  align-items: center;
  padding: 4px 2px;
  font-family: var(--font-ko);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}
.spacing__trans {
  margin: 0;
  text-align: center;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.spacing__feedback {
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-card);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: feedback-in var(--motion-quick) var(--ease-out);
}
@keyframes feedback-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.spacing__feedback--ok { background: var(--surface); border-color: var(--jade); }
.spacing__feedback--no { background: var(--surface); border-color: var(--danger); }
.spacing__verdict {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  color: var(--text);
}
.spacing__answer {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text);
}
.spacing__rules {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.5;
}
.spacing__btn {
  align-self: flex-end;
  padding: 10px 16px;
  background: var(--surface);
  color: var(--text);
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.spacing__btn--primary {
  align-self: center;
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.spacing__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.spacing__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
@media (max-width: 480px) {
  .spacing__block { font-size: 19px; }
}
</style>
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm -C munbeop exec vitest run tests/components/particle-lab/SpacingCard.test.ts`
Expected: PASS (all 5 cases).

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingCard.vue munbeop/tests/components/particle-lab/SpacingCard.test.ts
git commit -m "$(cat <<'EOF'
feat(particles): SpacingCard — blocks + gaps + rule-aware reveal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `SpacingLevelPicker.vue`

**Files:**
- Create: `munbeop/app/components/particle-lab/SpacingLevelPicker.vue`

Presentational (mirrors `DrillSetPicker`).

- [ ] **Step 1: Write the component**

Create `munbeop/app/components/particle-lab/SpacingLevelPicker.vue`:

```vue
<script setup lang="ts">
import type { SpacingLevel } from '~/lib/particle-lab'

/** Two-button segmented control: 초급 (1) / 고급 (2). */
interface Props {
  level: SpacingLevel
}
defineProps<Props>()
const emit = defineEmits<{ select: [level: SpacingLevel] }>()
const { t } = useI18n()

const LEVELS: { value: SpacingLevel; ko: string; aria: string }[] = [
  { value: 1, ko: '초급', aria: 'particles.spacing.level_beginner' },
  { value: 2, ko: '고급', aria: 'particles.spacing.level_advanced' },
]
</script>

<template>
  <div class="level-picker">
    <h3 class="level-picker__title">{{ t('particles.spacing.level_label') }}</h3>
    <div class="level-picker__row" role="group" :aria-label="t('particles.spacing.level_label')">
      <button
        v-for="lv in LEVELS"
        :key="lv.value"
        type="button"
        class="level-picker__btn"
        :class="{ 'level-picker__btn--active': lv.value === level }"
        :aria-pressed="lv.value === level"
        :aria-label="t(lv.aria)"
        :data-testid="`spacing-level-${lv.value}`"
        @click="emit('select', lv.value)"
      >
        <span lang="ko">{{ lv.ko }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.level-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.level-picker__title {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.level-picker__row {
  display: flex;
  gap: 8px;
}
.level-picker__btn {
  padding: 8px 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  font-family: var(--font-ko);
  font-size: var(--text-sm);
  color: var(--text-soft);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.level-picker__btn:hover {
  transform: translate(-1px, -1px);
  color: var(--text);
}
.level-picker__btn--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.level-picker__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -C munbeop typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingLevelPicker.vue
git commit -m "$(cat <<'EOF'
feat(particles): SpacingLevelPicker — 초급/고급 segmented control

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `SpacingSummary.vue`

**Files:**
- Create: `munbeop/app/components/particle-lab/SpacingSummary.vue`

Presentational (mirrors `DrillSummary`; no batchim slips, no garden note).

- [ ] **Step 1: Write the component**

Create `munbeop/app/components/particle-lab/SpacingSummary.vue`:

```vue
<script setup lang="ts">
import type { LabSentence } from '~/lib/domain'
import { correctSpacing, type DrillScore } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'

/** End-of-round screen: score, review list (correctly spaced), CTAs. */
interface Props {
  score: DrillScore
  failedItems: LabSentence[]
}
defineProps<Props>()
const emit = defineEmits<{ restart: []; explore: []; 'replay-failed': [] }>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <section class="summary" data-testid="spacing-summary">
    <h2 class="summary__ko" lang="ko">수고했어요! 🎉</h2>
    <p class="summary__score">
      {{ t('particles.spacing.summary_score', { n: score.correct, total: score.total }) }}
    </p>

    <div v-if="failedItems.length > 0" class="summary__review">
      <h3 class="summary__review-title">{{ t('particles.spacing.summary_review_title') }}</h3>
      <ul class="summary__list">
        <li v-for="item in failedItems" :key="item.id" class="summary__item">
          <span lang="ko" class="summary__item-ko">{{ correctSpacing(item) }}</span>
          <span class="summary__item-reason">{{ tl(item.trans) }}</span>
        </li>
      </ul>
    </div>
    <p v-else class="summary__perfect">{{ t('particles.spacing.summary_perfect') }}</p>

    <div class="summary__actions">
      <button
        v-if="failedItems.length > 0"
        type="button"
        class="summary__btn summary__btn--primary"
        data-testid="spacing-replay-failed"
        @click="emit('replay-failed')"
      >
        🔁 {{ t('particles.spacing.replay_failed', { n: failedItems.length }) }}
      </button>
      <button
        type="button"
        class="summary__btn"
        :class="{ 'summary__btn--primary': failedItems.length === 0 }"
        data-testid="spacing-restart"
        @click="emit('restart')"
      >
        🔁 {{ t('particles.spacing.summary_repeat') }}
      </button>
      <button type="button" class="summary__btn" @click="emit('explore')">
        🧩 {{ t('particles.spacing.summary_explore') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}
.summary__ko {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-xl);
  font-weight: 900;
  color: var(--heading-accent);
}
.summary__score {
  margin: 0;
  font-family: var(--font-pixel-display);
  font-size: var(--text-lg);
  color: var(--text);
}
.summary__review {
  text-align: left;
  background: var(--paper);
  border-left: 4px solid var(--accent);
  padding: 12px 14px;
}
.summary__review-title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.summary__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.summary__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary__item-ko {
  font-family: var(--font-ko);
  font-size: var(--text-md);
  color: var(--text);
}
.summary__item-reason {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.summary__perfect {
  margin: 0;
  font-family: var(--font-ui);
  color: var(--success);
}
.summary__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.summary__btn {
  padding: 10px 16px;
  background: var(--surface);
  color: var(--text);
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.summary__btn--primary {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.summary__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.summary__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -C munbeop typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/components/particle-lab/SpacingSummary.vue
git commit -m "$(cat <<'EOF'
feat(particles): SpacingSummary — score + review list + CTAs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: i18n keys (×8 locales)

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`

Add the keys under the existing `particles` object. **Korean fragments stay Korean verbatim** in every locale (초급, 고급, 조사, 어절, 정확해요, 띄어쓰기 마스터) — brand mannerism, like 화이팅. Only the surrounding text is translated.

- [ ] **Step 1: Add `mode_spacing` + the `spacing` block to `en.json`**

In `munbeop/i18n/locales/en.json`, add `"mode_spacing"` right after `"mode_drill"`, and a `"spacing"` object as a sibling of `"drill"` inside `"particles"`:

```jsonc
"mode_spacing": "Spacing",
```

```jsonc
"spacing": {
  "lead": "Tap between the blocks where a space belongs. Particles stick to the word before them.",
  "level_label": "Level",
  "level_beginner": "beginner — words & particles split",
  "level_advanced": "advanced — syllables only",
  "check": "CHECK SPACING",
  "next": "NEXT",
  "correct": "정확해요! Correct spacing.",
  "try_again": "Almost — check the marks.",
  "rule_particle": "조사 sticks to the word before it — no space.",
  "rule_eojeol": "어절 (word-phrases) are separated by a space.",
  "rule_word_internal": "These syllables are one word — keep them together.",
  "summary_score": "{n} / {total} spaced right",
  "summary_review_title": "To review",
  "summary_perfect": "Perfect spacing. 띄어쓰기 마스터!",
  "summary_repeat": "PLAY AGAIN",
  "summary_explore": "EXPLORE",
  "replay_failed": "REVIEW MISTAKES ({n})",
  "replay_mode_label": "Review mode · mistakes aren't logged again"
}
```

- [ ] **Step 2: Add the same keys to `es.json`**

```jsonc
"mode_spacing": "Espaciado",
```

```jsonc
"spacing": {
  "lead": "Toca entre los bloques donde va un espacio. Las partículas se pegan a la palabra anterior.",
  "level_label": "Nivel",
  "level_beginner": "principiante — palabras y partículas separadas",
  "level_advanced": "avanzado — solo sílabas",
  "check": "REVISAR ESPACIADO",
  "next": "SIGUIENTE",
  "correct": "정확해요! Espaciado correcto.",
  "try_again": "Casi — revisa las marcas.",
  "rule_particle": "La 조사 se pega a la palabra anterior — sin espacio.",
  "rule_eojeol": "Los 어절 (sintagmas) se separan con un espacio.",
  "rule_word_internal": "Estas sílabas son una sola palabra — van juntas.",
  "summary_score": "{n} / {total} bien espaciadas",
  "summary_review_title": "Para repasar",
  "summary_perfect": "Espaciado perfecto. 띄어쓰기 마스터!",
  "summary_repeat": "JUGAR DE NUEVO",
  "summary_explore": "EXPLORAR",
  "replay_failed": "REPASAR FALLOS ({n})",
  "replay_mode_label": "Modo repaso · los fallos no se registran otra vez"
}
```

- [ ] **Step 3: Add the same keys to the remaining 6 locales**

Add `mode_spacing` + the full `spacing` block to `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`. Translate the non-Korean text following the tone of each file's adjacent `drill`/`explore` keys; keep all Korean fragments verbatim and the `{n}`/`{total}` placeholders intact. **Task 11's Workflow adversarially verifies all 8 for naturalness** — but author a genuine first pass here, not placeholders.

- [ ] **Step 4: Verify the JSON parses and keys are present in all 8**

Run:
```bash
node -e "for (const l of ['en','es','fr','pt-BR','th','id','vi','ja']) { const j = require('./munbeop/i18n/locales/'+l+'.json'); if (!j.particles.mode_spacing || !j.particles.spacing || !j.particles.spacing.rule_eojeol) throw new Error('missing keys in '+l); } console.log('all 8 locales OK')"
```
Expected: `all 8 locales OK`.

- [ ] **Step 5: Commit**

```bash
git add munbeop/i18n/locales/*.json
git commit -m "$(cat <<'EOF'
feat(particles): i18n for the 띄어쓰기 spacing mode (×8 locales)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Page wiring — third tab in `particles.vue`

**Files:**
- Modify: `munbeop/app/pages/practice/particles.vue`

- [ ] **Step 1: Update the `<script setup>`**

In `munbeop/app/pages/practice/particles.vue`:

Add imports (next to the existing component imports):

```ts
import SpacingCard from '~/components/particle-lab/SpacingCard.vue'
import SpacingSummary from '~/components/particle-lab/SpacingSummary.vue'
import SpacingLevelPicker from '~/components/particle-lab/SpacingLevelPicker.vue'
import { useParticleSpacing } from '~/composables/useParticleSpacing'
```

Change the `Mode` type and add the composable + a 3-way initial mode:

```ts
type Mode = 'explore' | 'drill' | 'spacing'
```

```ts
const spacing = useParticleSpacing()

const initialMode: Mode =
  route.query.mode === 'drill' ? 'drill' : route.query.mode === 'spacing' ? 'spacing' : 'explore'
const mode = ref<Mode>(initialMode)
```

Extend the leave-guard to cover an in-progress spacing round:

```ts
useGameLeaveGuard(
  () =>
    (mode.value === 'drill' && drill.phase.value !== 'done') ||
    (mode.value === 'spacing' && spacing.phase.value !== 'done'),
)
```

Update the `watch(mode, …)` body and the deep-link block:

```ts
watch(mode, async (m) => {
  await router.replace({ query: { ...route.query, mode: m } })
  if (m === 'drill') await drill.start()
  else if (m === 'spacing') spacing.start()
})

if (mode.value === 'drill') {
  void drill.start()
} else if (mode.value === 'spacing') {
  spacing.start()
}
```

Add spacing handlers (next to `restartDrill`/`onReplayFailed`/`onSelectSet`):

```ts
function restartSpacing() {
  spacing.start()
}

function onSpacingReplayFailed() {
  spacing.replayFailed()
}

function onSelectLevel(l: 1 | 2) {
  spacing.selectLevel(l)
}
```

- [ ] **Step 2: Add the third tab button**

In the `.lab__tabs` group, after the drill tab `<button>`, add:

```vue
<button
  type="button"
  class="lab__tab"
  :class="{ 'lab__tab--active': mode === 'spacing' }"
  :aria-pressed="mode === 'spacing'"
  data-testid="tab-spacing"
  @click="mode = 'spacing'"
>
  ␣ {{ t('particles.mode_spacing') }}
</button>
```

- [ ] **Step 3: Restructure the mode bodies and add the spacing block**

Replace the existing `<ExploreMode … />` + `<template v-else>` region with three explicit branches:

```vue
<ExploreMode v-if="mode === 'explore'" />

<template v-else-if="mode === 'drill'">
  <DrillSetPicker
    v-if="drill.phase.value === 'question' && drill.index.value === 0 && drill.mode.value === 'normal'"
    :sets="drill.availableSets"
    :selected="drill.selectedSetId.value"
    @select="onSelectSet"
  />
  <p
    v-if="drill.mode.value === 'replay' && drill.phase.value !== 'done'"
    class="lab__replay-note"
    data-testid="drill-replay-note"
  >
    🔁 {{ t('particles.drill.replay_mode_label') }}
  </p>
  <ProgressDots
    v-if="drill.phase.value !== 'done'"
    :total="drill.sessionItems.value.length"
    :progress="drill.index.value"
  />
  <DrillCard
    v-if="drill.phase.value !== 'done'"
    :item="drill.item.value"
    :set="drill.set.value"
    :phase="drill.phase.value"
    :verdict="drill.verdict.value"
    :picked="drill.picked.value"
    :blocked-choices="drill.blockedChoices.value"
    @answer="drill.answer"
    @retry="drill.retry"
    @next="drill.next"
  />
  <DrillSummary
    v-else
    :score="drill.score.value"
    :failed-items="drill.failedItems.value"
    :set="drill.set.value"
    :garden-grew="drill.gardenGrew.value"
    @restart="restartDrill"
    @replay-failed="onReplayFailed"
    @explore="mode = 'explore'"
  />
</template>

<template v-else-if="mode === 'spacing'">
  <SpacingLevelPicker
    v-if="spacing.phase.value === 'question' && spacing.index.value === 0 && spacing.mode.value === 'normal'"
    :level="spacing.level.value"
    @select="onSelectLevel"
  />
  <p
    v-if="spacing.mode.value === 'replay' && spacing.phase.value !== 'done'"
    class="lab__replay-note"
    data-testid="spacing-replay-note"
  >
    🔁 {{ t('particles.spacing.replay_mode_label') }}
  </p>
  <ProgressDots
    v-if="spacing.phase.value !== 'done'"
    :total="spacing.sessionItems.value.length"
    :progress="spacing.index.value"
  />
  <SpacingCard
    v-if="spacing.phase.value !== 'done'"
    :puzzle="spacing.puzzle.value"
    :answers="spacing.answers.value"
    :phase="spacing.phase.value"
    :result="spacing.result.value"
    :trans="spacing.sentence.value.trans"
    @toggle="spacing.toggleGap"
    @check="spacing.check"
    @next="spacing.next"
  />
  <SpacingSummary
    v-else
    :score="spacing.score.value"
    :failed-items="spacing.failedItems.value"
    @restart="restartSpacing"
    @replay-failed="onSpacingReplayFailed"
    @explore="mode = 'explore'"
  />
</template>
```

- [ ] **Step 4: Widen the tab grid for three tabs**

In the `<style scoped>` block, update `.lab__tabs`:

```css
.lab__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: var(--surface);
  border: 2px solid var(--border);
  max-width: 560px;
}
```

- [ ] **Step 5: Typecheck + full suite**

Run: `pnpm -C munbeop typecheck`
Expected: PASS.

Run: `pnpm -C munbeop test`
Expected: PASS — all prior tests plus the new spacing unit + SpacingCard tests; total count grew (new specs added), zero failures.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/pages/practice/particles.vue
git commit -m "$(cat <<'EOF'
feat(particles): wire the 띄어쓰기 spacing tab into the lab page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Verification — adversarial Workflow + gates + PR

**Files:** none (verification + integration).

- [ ] **Step 1: Run the gates**

```bash
pnpm -C munbeop test
pnpm -C munbeop typecheck
pnpm -C munbeop lint
```
Expected: suite green, no type errors, 0 lint errors. Fix any issue and re-run before proceeding.

- [ ] **Step 2: Adversarial content + i18n Workflow**

Launch a Workflow (mirrors subprojects 4/5/6) with two parallel checks, then a synthesis:
- **Korean spacing audit** — confirm each of the 14 gold strings in Task 1's `GOLD` map is standard 한글 맞춤법 띄어쓰기. Pay special attention to the number+counter boundaries (`아홉 시`, `다섯 시` — 단위 의존명사 spacing) and the connective `사과와`. Flag any string that a native writer would space differently, with the corrected form.
- **8-locale i18n audit** — for each of the 19 new strings × 8 locales, check the translation is natural and consistent with the file's existing `particles.drill`/`particles.explore` tone, the `{n}`/`{total}` placeholders survive, and every Korean fragment (초급/고급/조사/어절/정확해요/띄어쓰기 마스터) is intact.

Apply any corrections the Workflow surfaces (update `GOLD` + the seed only if a real spacing error is found — none expected; update locale strings as needed), then re-run Step 1's gates. Target: 0 blocking issues.

- [ ] **Step 3: Manual smoke checklist (logged-in, route is auth-gated)**

Document for the user to run in the real app (`/practice/particles?mode=spacing`):
- The third tab 띄어쓰기 appears and switches in; `?mode=spacing` round-trips.
- 초급: blocks are word/particle chunks; tapping a junction toggles space/join; **Check** reveals correct/incorrect per gap + the rule(s); a space placed before a particle is flagged with `rule_particle`.
- 고급: blocks are single syllables; spacing `아홉|시` is required (counter), `시|부터` must stay joined.
- Level is sticky across sentences; switching level restarts; `Repasar fallos` re-drills only the missed sentences; leaving mid-round prompts the leave-guard.
- Looks right in light/dark and on a narrow viewport.

- [ ] **Step 4: Open the PR (with user authorization)**

Per repo workflow, pushing/merging needs the user's explicit go-ahead. On approval:

```bash
git push -u origin claude/sad-payne-f89adc
gh pr create --title "feat(particles): 띄어쓰기 spacing exercise (subproject 7)" --body "<summary + screenshots>"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** model/types (Task 1), `buildPuzzle` both levels (Task 2), `gradePuzzle` (Task 3), composable with sticky level + replay + no-SRS (Task 4), `SpacingGap`/`SpacingCard`/`SpacingLevelPicker`/`SpacingSummary` (Tasks 5–8), i18n ×8 incl. `mode_spacing` (Task 9), page tab + leave-guard + CSS grid (Task 10), adversarial Workflow + gates + manual smoke (Task 11). All spec sections map to a task.
- **Placeholder scan:** every code step shows complete code; i18n delegates only the *translation* of 6 locales (with a genuine-first-pass instruction + a JSON presence check + a verifying Workflow), not the keys/structure.
- **Type consistency:** `SpacingPuzzle`/`Gap`/`GapValue`/`GapKind`/`SpacingResult`/`GapResult`/`SpacingLevel` defined in Task 1 and imported consistently via the `~/lib/particle-lab` barrel in Tasks 4/6/7/8; `buildPuzzle`/`gradePuzzle`/`correctSpacing`/`eojeolText` names match across tasks; composable returns (`puzzle`, `answers`, `result`, `sentence`, `toggleGap`, `check`, `next`, `selectLevel`, `replayFailed`, `failedItems`, `score`) match the page bindings in Task 10; `scoreOf`/`DrillItemResult`/`DrillScore`/`shuffle` reused from existing `lib/particle-lab`.
```