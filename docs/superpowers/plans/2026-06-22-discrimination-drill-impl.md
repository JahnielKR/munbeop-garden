# Confusable-pair discrimination — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Often confused with" relation chips + an inline 2-choice discrimination drill per confusable grammar pair, anchored in the study sheet, sourced from a static TS pair catalog.

**Architecture:** `ConfusablePair`/`DiscriminationItem` types → static seed `app/seed/grammar-pairs/` → pure `pairsFor`/`relatedKos` → `PairDrill.vue` (self-contained 2-choice cloze) + `ConfusedWithSection.vue` (chips + note + inline drill) in the study sheet. Content is Claude-Workflow drafted + Korean-lens verified. Engine, grammar seeds, and Supabase are untouched.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, vitest + @vue/test-utils, 8-locale `L()` seed helper.

**Spec:** `docs/superpowers/specs/2026-06-22-discrimination-drill-design.md`

**Conventions:** run pnpm from `munbeop/`. Korean fragments (ko strings, example sentences, option forms) are verbatim. Commit after each task with trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Branch: `claude/discrimination-drill`. Study-sheet components mirror `ExamplesSection.vue` conventions (Press Start 2P latin section title, 'Noto Sans KR' for Korean, 'Inter' for translations, `--ink`/`--ink-soft`/`--ink-line` palette — NOT particle-lab tokens).

---

## Task 1: Types + `pairsFor`/`relatedKos` pure lib

**Files:**
- Modify: `munbeop/app/lib/domain/grammar.ts`
- Create: `munbeop/app/lib/grammar-pairs/index.ts`
- Create: `munbeop/app/seed/grammar-pairs/index.ts` (empty aggregate so the import resolves)
- Test: `munbeop/tests/unit/grammar-pairs/pairs-for.test.ts`

- [ ] **Step 1: Add the types to `grammar.ts`**

`grammar.ts` already imports `LocalizedString` from `./i18n`. Add after the `GrammarExample` interface:

```ts
/** One "which fits?" discrimination question for a confusable pair. */
export interface DiscriminationItem {
  /** Korean sentence with the literal blank marker "{}" where the pattern goes. */
  sentence: string
  /** Surface form of pair member A in this sentence (e.g. 와서 / 안). */
  optionA: string
  /** Surface form of pair member B in this sentence (e.g. 오니까 / 못). */
  optionB: string
  /** Which member is correct/natural here. */
  answer: 'a' | 'b'
  trans: LocalizedString
  /** One line: why the answer fits and the other doesn't. */
  why: LocalizedString
}

/** Two near-interchangeable grammar points + items that discriminate them. */
export interface ConfusablePair {
  /** Stable id, e.g. 'an-mot'. */
  id: string
  /** Member A — a Grammar.ko. */
  a: string
  /** Member B — a Grammar.ko. */
  b: string
  /** How the two differ (shown with the relation chips). */
  note: LocalizedString
  items: DiscriminationItem[]
}
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/grammar-pairs/pairs-for.test.ts
import { describe, it, expect } from 'vitest'
import type { ConfusablePair } from '~/lib/domain'
import { pairsFor, relatedKos } from '~/lib/grammar-pairs'

const L8 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const item = { sentence: '{}', optionA: '안', optionB: '못', answer: 'a' as const, trans: L8, why: L8 }
const fixture: ConfusablePair[] = [
  { id: 'an-mot', a: '안 + V / -지 않다', b: '못 + V / -지 못하다', note: L8, items: [item] },
  { id: 'go-aseo', a: '-고', b: '-아/어서', note: L8, items: [item] },
]

describe('pairsFor', () => {
  it('finds a pair from the A side with selfSide=a and otherKo=b', () => {
    const rows = pairsFor('안 + V / -지 않다', fixture)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.selfSide).toBe('a')
    expect(rows[0]!.otherKo).toBe('못 + V / -지 못하다')
  })
  it('finds a pair from the B side with selfSide=b and otherKo=a', () => {
    const rows = pairsFor('-아/어서', fixture)
    expect(rows[0]!.selfSide).toBe('b')
    expect(rows[0]!.otherKo).toBe('-고')
  })
  it('returns [] for a ko in no pair', () => {
    expect(pairsFor('-네요', fixture)).toEqual([])
  })
})

describe('relatedKos', () => {
  it('returns the other members, deduped', () => {
    expect(relatedKos('-고', fixture)).toEqual(['-아/어서'])
    expect(relatedKos('-네요', fixture)).toEqual([])
  })
})
```

- [ ] **Step 3: Run → FAIL** (`cd munbeop && pnpm test -- grammar-pairs/pairs-for`) — cannot resolve `~/lib/grammar-pairs`.

- [ ] **Step 4: Create the empty seed aggregate**

```ts
// app/seed/grammar-pairs/index.ts
import type { ConfusablePair } from '~/lib/domain'

/** Aggregated confusable-pair catalog. Per-batch arrays are spread in here. */
export const GRAMMAR_PAIRS: ConfusablePair[] = []
```

- [ ] **Step 5: Implement the lib**

```ts
// app/lib/grammar-pairs/index.ts
import type { ConfusablePair } from '~/lib/domain'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'

export interface PairRow {
  pair: ConfusablePair
  selfSide: 'a' | 'b'
  otherKo: string
}

/** Every pair containing `ko`, with which side ko is and the other member's ko. */
export function pairsFor(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): PairRow[] {
  const rows: PairRow[] = []
  for (const pair of source) {
    if (pair.a === ko) rows.push({ pair, selfSide: 'a', otherKo: pair.b })
    else if (pair.b === ko) rows.push({ pair, selfSide: 'b', otherKo: pair.a })
  }
  return rows
}

/** The deduped "confused with" ko list for a point (for the chips). */
export function relatedKos(ko: string, source: ConfusablePair[] = GRAMMAR_PAIRS): string[] {
  return [...new Set(pairsFor(ko, source).map((r) => r.otherKo))]
}
```

- [ ] **Step 6: Run → PASS** (`cd munbeop && pnpm test -- grammar-pairs/pairs-for`)

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/domain/grammar.ts munbeop/app/lib/grammar-pairs/index.ts munbeop/app/seed/grammar-pairs/index.ts munbeop/tests/unit/grammar-pairs/pairs-for.test.ts
git commit -m "feat(discrimination): ConfusablePair types + pairsFor/relatedKos lib"
```

---

## Task 2: Seed scaffold + invariant test (one worked pair)

**Files:**
- Create: `munbeop/app/seed/grammar-pairs/n1.ts`
- Modify: `munbeop/app/seed/grammar-pairs/index.ts`
- Test: `munbeop/tests/unit/grammar-pairs/seed-invariants.test.ts`

- [ ] **Step 1: Write the failing invariant test**

```ts
// tests/unit/grammar-pairs/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)

describe('grammar-pairs seed invariants', () => {
  it('is non-empty', () => {
    expect(GRAMMAR_PAIRS.length).toBeGreaterThan(0)
  })
  for (const [i, p] of GRAMMAR_PAIRS.entries()) {
    it(`#${i} ${p.id} is well-formed`, () => {
      expect(KNOWN_KO.has(p.a), `a: ${p.a}`).toBe(true)
      expect(KNOWN_KO.has(p.b), `b: ${p.b}`).toBe(true)
      expect(p.a).not.toBe(p.b)
      expect(nonEmptyLocales(p.note), `${p.id} note`).toBe(true)
      expect(p.items.length).toBeGreaterThanOrEqual(2)
      for (const it of p.items) {
        expect(it.sentence).toContain('{}')
        expect(['a', 'b']).toContain(it.answer)
        expect(it.optionA.trim().length, `${p.id} optionA`).toBeGreaterThan(0)
        expect(it.optionB.trim().length, `${p.id} optionB`).toBeGreaterThan(0)
        expect(it.optionA).toMatch(HANGUL)
        expect(it.optionB).toMatch(HANGUL)
        expect(nonEmptyLocales(it.trans), `${p.id} item trans`).toBe(true)
        expect(nonEmptyLocales(it.why), `${p.id} item why`).toBe(true)
      }
    })
  }
})
```

NOTE: `seed-invariants` here asserts `items.length >= 2`. The Task-2 worked pair therefore needs **2** items (not 1) to go green. Confirm `LOCALE_CODES` is exported from `~/lib/domain` (it is — used by the grammar-examples invariants).

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm test -- grammar-pairs/seed-invariants`) — fails on "is non-empty".

- [ ] **Step 3: Create `n1.ts` with the worked `an-mot` pair (2 items)**

```ts
// app/seed/grammar-pairs/n1.ts
import type { ConfusablePair } from '~/lib/domain'
import { L } from '../locale'

/** Confusable grammar/ending pairs. a/b match grammars-n{1,2,3}.ts verbatim. */
export const N1_PAIRS: ConfusablePair[] = [
  {
    id: 'an-mot',
    a: '안 + V / -지 않다',
    b: '못 + V / -지 못하다',
    note: L(
      '안 negates by choice (don\'t); 못 negates by inability (can\'t).',
      '안 niega por elección (no quiero); 못 niega por incapacidad (no puedo).',
      '안 nie par choix (ne pas vouloir) ; 못 nie par incapacité (ne pas pouvoir).',
      '안 nega por escolha (não quero); 못 nega por incapacidade (não consigo).',
      '안 ปฏิเสธโดยตั้งใจ (ไม่ทำ); 못 ปฏิเสธเพราะทำไม่ได้',
      '안 menyangkal karena pilihan (tidak mau); 못 karena tidak mampu (tidak bisa).',
      '안 phủ định do lựa chọn (không làm); 못 do không thể (không làm được).',
      '안 は意志による否定（しない）、못 は能力による否定（できない）。',
    ),
    items: [
      {
        sentence: '어제 너무 바빠서 점심을 {} 먹었어요.',
        optionA: '안',
        optionB: '못',
        answer: 'b',
        trans: L(
          'I was so busy yesterday I couldn\'t eat lunch.',
          'Ayer estaba tan ocupado que no pude almorzar.',
          'J\'étais si occupé hier que je n\'ai pas pu déjeuner.',
          'Ontem eu estava tão ocupado que não consegui almoçar.',
          'เมื่อวานยุ่งมากจนกินข้าวเที่ยงไม่ได้',
          'Kemarin saya sangat sibuk sampai tidak bisa makan siang.',
          'Hôm qua tôi bận đến mức không ăn trưa được.',
          '昨日は忙しすぎて昼ご飯を食べられませんでした。',
        ),
        why: L(
          'Being too busy blocks the action → 못 (couldn\'t); 안 would wrongly mean choosing not to eat.',
          'Estar muy ocupado impide la acción → 못; 안 significaría no querer comer.',
          'Trop occupé empêche l\'action → 못 ; 안 voudrait dire ne pas vouloir manger.',
          'Estar ocupado impede a ação → 못; 안 significaria optar por não comer.',
          'ยุ่งจนทำไม่ได้ → 못; 안 จะแปลว่าตั้งใจไม่กิน',
          'Terlalu sibuk menghalangi → 못; 안 berarti memilih tidak makan.',
          'Quá bận nên không thể → 못; 안 nghĩa là cố ý không ăn.',
          '忙しくてできない → 못。안 だと食べない意志になる。',
        ),
      },
      {
        sentence: '저는 다이어트 중이라서 케이크를 {} 먹어요.',
        optionA: '안',
        optionB: '못',
        answer: 'a',
        trans: L(
          'I\'m on a diet, so I don\'t eat cake.',
          'Estoy a dieta, así que no como pastel.',
          'Je suis au régime, donc je ne mange pas de gâteau.',
          'Estou de dieta, então não como bolo.',
          'ฉันกำลังลดน้ำหนัก เลยไม่กินเค้ก',
          'Saya sedang diet, jadi tidak makan kue.',
          'Tôi đang ăn kiêng nên không ăn bánh.',
          'ダイエット中なのでケーキを食べません。',
        ),
        why: L(
          'Choosing not to (diet) → 안 (don\'t); 못 would wrongly mean physically unable to eat cake.',
          'Es una elección (dieta) → 안; 못 significaría no poder físicamente.',
          'C\'est un choix (régime) → 안 ; 못 voudrait dire en être incapable.',
          'É uma escolha (dieta) → 안; 못 significaria ser incapaz.',
          'เลือกเอง (ลดน้ำหนัก) → 안; 못 จะแปลว่ากินไม่ได้',
          'Pilihan sendiri (diet) → 안; 못 berarti tidak mampu.',
          'Do lựa chọn (ăn kiêng) → 안; 못 nghĩa là không thể.',
          '意志（ダイエット）→ 안。못 だと食べられない意味になる。',
        ),
      },
    ],
  },
]
```

- [ ] **Step 4: Wire it into the aggregate**

```ts
// app/seed/grammar-pairs/index.ts
import type { ConfusablePair } from '~/lib/domain'
import { N1_PAIRS } from './n1'

/** Aggregated confusable-pair catalog. Per-batch arrays are spread in here. */
export const GRAMMAR_PAIRS: ConfusablePair[] = [...N1_PAIRS]
```

- [ ] **Step 5: Run → PASS** (`cd munbeop && pnpm test -- grammar-pairs`)

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/seed/grammar-pairs/n1.ts munbeop/app/seed/grammar-pairs/index.ts munbeop/tests/unit/grammar-pairs/seed-invariants.test.ts
git commit -m "feat(discrimination): seed scaffold + invariants (worked an-mot pair)"
```

---

## Task 3: `PairDrill.vue` (inline 2-choice cloze)

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/PairDrill.vue`
- Modify: `munbeop/i18n/locales/{en,es,fr,id,ja,pt-BR,th,vi}.json`
- Test: `munbeop/tests/components/library/PairDrill.test.ts`

- [ ] **Step 1: Add i18n keys (`library.confused.*`) to all 8 locales**

Inside the existing `library` block in each locale, add a `confused` sub-block (identical key set across all 8). English:

```jsonc
"confused": {
  "title": "Often confused with",
  "test_cta": "Test yourself",
  "correct": "Correct!",
  "wrong": "Not quite",
  "next": "Next",
  "restart": "Try again",
  "score": "{correct} / {total} correct"
}
```

Translate the values per locale (es/fr/id/ja/pt-BR/th/vi); keep `{correct}`/`{total}` placeholders verbatim.

- [ ] **Step 2: Write the failing component test**

```ts
// tests/components/library/PairDrill.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PairDrill from '~/components/library/GrammarStudySheet/PairDrill.vue'

const L1 = { en: 'because busy' }
const pair = {
  id: 'an-mot', a: '안 + V / -지 않다', b: '못 + V / -지 못하다', note: { en: 'x' },
  items: [
    { sentence: '점심을 {} 먹었어요.', optionA: '안', optionB: '못', answer: 'b', trans: L1, why: L1 },
    { sentence: '케이크를 {} 먹어요.', optionA: '안', optionB: '못', answer: 'a', trans: L1, why: L1 },
  ],
}
const factory = () =>
  mount(PairDrill, {
    props: { pair },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })

describe('PairDrill', () => {
  it('renders the cloze sentence split on {} and two options', () => {
    const w = factory()
    expect(w.text()).toContain('점심을')
    expect(w.find('[data-testid="pair-opt-a"]').text()).toBe('안')
    expect(w.find('[data-testid="pair-opt-b"]').text()).toBe('못')
  })
  it('picking the wrong option reveals the why note', async () => {
    const w = factory()
    await w.find('[data-testid="pair-opt-a"]').trigger('click') // answer is 'b'
    expect(w.text()).toContain('library.confused.wrong')
    expect(w.text()).toContain('because busy')
  })
  it('advances through items to a final score', async () => {
    const w = factory()
    await w.find('[data-testid="pair-opt-b"]').trigger('click') // item 1 correct
    await w.find('[data-testid="pair-next"]').trigger('click')
    await w.find('[data-testid="pair-opt-a"]').trigger('click') // item 2 correct
    await w.find('[data-testid="pair-next"]').trigger('click')
    expect(w.find('[data-testid="pair-restart"]').exists()).toBe(true)
    expect(w.text()).toContain('library.confused.score')
  })
})
```

- [ ] **Step 3: Run → FAIL** (`cd munbeop && pnpm test -- PairDrill`)

- [ ] **Step 4: Implement `PairDrill.vue`**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConfusablePair } from '~/lib/domain'

interface Props {
  pair: ConfusablePair
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const index = ref(0)
const picked = ref<'a' | 'b' | null>(null)
const correctCount = ref(0)
const done = ref(false)

const item = computed(() => props.pair.items[index.value]!)
const total = computed(() => props.pair.items.length)
const revealed = computed(() => picked.value !== null)
const isCorrect = computed(() => picked.value === item.value.answer)
const parts = computed(() => item.value.sentence.split('{}'))
const filled = computed(() =>
  revealed.value ? (item.value.answer === 'a' ? item.value.optionA : item.value.optionB) : null,
)

function optionState(side: 'a' | 'b'): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (side === item.value.answer) return 'correct'
  if (side === picked.value) return 'wrong'
  return 'muted'
}
function pick(side: 'a' | 'b') {
  if (revealed.value) return
  picked.value = side
  if (side === item.value.answer) correctCount.value += 1
}
function next() {
  if (index.value + 1 >= total.value) {
    done.value = true
    return
  }
  index.value += 1
  picked.value = null
}
function restart() {
  index.value = 0
  picked.value = null
  correctCount.value = 0
  done.value = false
}
</script>

<template>
  <div class="pair-drill" data-testid="pair-drill">
    <template v-if="!done">
      <p class="pair-drill__sentence" lang="ko">
        <span>{{ parts[0] }}</span>
        <span class="pair-drill__blank" :class="{ 'pair-drill__blank--filled': revealed }">{{ filled ?? '____' }}</span>
        <span>{{ parts[1] }}</span>
      </p>
      <div class="pair-drill__options">
        <button
          type="button"
          class="pair-drill__opt"
          :class="`pair-drill__opt--${optionState('a')}`"
          :disabled="revealed"
          lang="ko"
          data-testid="pair-opt-a"
          @click="pick('a')"
        >
          {{ item.optionA }}
        </button>
        <button
          type="button"
          class="pair-drill__opt"
          :class="`pair-drill__opt--${optionState('b')}`"
          :disabled="revealed"
          lang="ko"
          data-testid="pair-opt-b"
          @click="pick('b')"
        >
          {{ item.optionB }}
        </button>
      </div>
      <div v-if="revealed" class="pair-drill__feedback" role="status">
        <p class="pair-drill__verdict" :class="isCorrect ? 'is-ok' : 'is-no'">
          {{ isCorrect ? t('library.confused.correct') : t('library.confused.wrong') }}
        </p>
        <p class="pair-drill__why">{{ tl(item.why) }}</p>
        <p class="pair-drill__trans">{{ tl(item.trans) }}</p>
        <button type="button" class="pair-drill__btn" data-testid="pair-next" @click="next">
          {{ t('library.confused.next') }}
        </button>
      </div>
    </template>
    <div v-else class="pair-drill__score" role="status">
      <p class="pair-drill__score-text">{{ t('library.confused.score', { correct: correctCount, total }) }}</p>
      <button type="button" class="pair-drill__btn" data-testid="pair-restart" @click="restart">
        {{ t('library.confused.restart') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pair-drill {
  margin-top: 8px;
  padding: 10px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pair-drill__sentence {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.6;
}
.pair-drill__blank {
  border-bottom: 2px solid var(--ink-line);
  padding: 0 8px;
  margin: 0 2px;
  font-weight: 700;
}
.pair-drill__blank--filled {
  border-bottom-color: var(--ink);
}
.pair-drill__options {
  display: flex;
  gap: 8px;
}
.pair-drill__opt {
  flex: 1;
  min-height: 44px;
  padding: 8px 12px;
  background: var(--paper-deep);
  border: 2px solid var(--ink-line);
  color: var(--ink);
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  cursor: pointer;
}
.pair-drill__opt:hover:not(:disabled) {
  border-color: var(--ink);
}
.pair-drill__opt:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.pair-drill__opt--correct {
  border-color: var(--jade);
  background: var(--surface);
}
.pair-drill__opt--wrong {
  border-color: var(--danger);
  background: var(--surface);
}
.pair-drill__opt--muted {
  opacity: 0.55;
}
.pair-drill__feedback {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pair-drill__verdict {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
}
.pair-drill__verdict.is-ok {
  color: var(--heading-accent);
}
.pair-drill__verdict.is-no {
  color: var(--danger);
}
.pair-drill__why {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.5;
}
.pair-drill__trans {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
}
.pair-drill__btn {
  align-self: flex-start;
  padding: 6px 14px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 2px solid var(--ink-line);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.pair-drill__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.pair-drill__score-text {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--ink);
}
</style>
```

- [ ] **Step 5: Run → PASS** (`cd munbeop && pnpm test -- PairDrill i18n`) and the i18n parity suite.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/PairDrill.vue munbeop/i18n/locales/*.json munbeop/tests/components/library/PairDrill.test.ts
git commit -m "feat(discrimination): PairDrill inline 2-choice cloze + i18n"
```

---

## Task 4: `ConfusedWithSection.vue` + study-sheet wiring

**Files:**
- Create: `munbeop/app/components/library/GrammarStudySheet/ConfusedWithSection.vue`
- Modify: `munbeop/app/components/library/GrammarStudySheet.vue`
- Test: `munbeop/tests/components/library/ConfusedWithSection.test.ts`

- [ ] **Step 1: Write the failing component test**

```ts
// tests/components/library/ConfusedWithSection.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfusedWithSection from '~/components/library/GrammarStudySheet/ConfusedWithSection.vue'

const pair = {
  id: 'an-mot', a: '안 + V / -지 않다', b: '못 + V / -지 못하다', note: { en: 'choice vs ability' },
  items: [{ sentence: '{} 먹어요.', optionA: '안', optionB: '못', answer: 'a', trans: { en: 'x' }, why: { en: 'y' } }],
}
vi.mock('~/lib/grammar-pairs', () => ({
  pairsFor: (ko: string) =>
    ko === '안 + V / -지 않다' ? [{ pair, selfSide: 'a', otherKo: '못 + V / -지 못하다' }] : [],
}))

const factory = (ko: string) =>
  mount(ConfusedWithSection, {
    props: { grammar: { ko } },
    global: { mocks: { $t: (k: string) => k }, stubs: { PairDrill: true } },
  })

describe('ConfusedWithSection', () => {
  it('shows the other ko chip + note for a point in a pair', () => {
    const w = factory('안 + V / -지 않다')
    expect(w.text()).toContain('못 + V / -지 못하다')
    expect(w.text()).toContain('choice vs ability')
  })
  it('renders nothing for a point in no pair', () => {
    const w = factory('-네요')
    expect(w.find('.confused-section').exists()).toBe(false)
  })
  it('toggles the drill open', async () => {
    const w = factory('안 + V / -지 않다')
    expect(w.findComponent({ name: 'PairDrill' }).exists()).toBe(false)
    await w.find('[data-testid="confused-test-an-mot"]').trigger('click')
    expect(w.findComponent({ name: 'PairDrill' }).exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run → FAIL** (`cd munbeop && pnpm test -- ConfusedWithSection`)

- [ ] **Step 3: Implement `ConfusedWithSection.vue`**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Grammar } from '~/lib/domain'
import { pairsFor } from '~/lib/grammar-pairs'
import PairDrill from './PairDrill.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const rows = computed(() => pairsFor(props.grammar.ko))
const openId = ref<string | null>(null)
function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section v-if="rows.length" class="confused-section">
    <h3 class="section-title">{{ t('library.confused.title') }}</h3>
    <div v-for="row in rows" :key="row.pair.id" class="confused">
      <p class="confused__head">
        <span class="confused__chip" lang="ko">{{ row.otherKo }}</span>
      </p>
      <p class="confused__note">{{ tl(row.pair.note) }}</p>
      <button
        type="button"
        class="confused__cta"
        :aria-expanded="openId === row.pair.id"
        :data-testid="`confused-test-${row.pair.id}`"
        @click="toggle(row.pair.id)"
      >
        {{ t('library.confused.test_cta') }}
      </button>
      <PairDrill v-if="openId === row.pair.id" :pair="row.pair" />
    </div>
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
.confused {
  border-left: 3px solid var(--ink-line);
  padding-left: 10px;
  margin-bottom: 12px;
}
.confused__head {
  margin: 0 0 4px;
}
.confused__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
  border: 1px solid var(--ink-line);
  padding: 2px 7px;
}
.confused__note {
  margin: 0 0 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.confused__cta {
  padding: 5px 12px;
  background: var(--paper-deep);
  border: 2px solid var(--ink-line);
  color: var(--ink);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.confused__cta:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Wire into `GrammarStudySheet.vue`** — add the import and render after `ExamplesSection`:

Add `import ConfusedWithSection from './GrammarStudySheet/ConfusedWithSection.vue'`, and after the `<ExamplesSection :grammar="grammar" />` line add:

```vue
    <ConfusedWithSection :grammar="grammar" />
```

- [ ] **Step 5: Run → PASS** (`cd munbeop && pnpm test -- ConfusedWithSection GrammarStudySheet`)

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/components/library/GrammarStudySheet/ConfusedWithSection.vue munbeop/app/components/library/GrammarStudySheet.vue munbeop/tests/components/library/ConfusedWithSection.test.ts
git commit -m "feat(discrimination): ConfusedWithSection (chips + note + inline drill) in study sheet"
```

---

## Task 5: Author + verify the 4-pair batch (Workflow-driven)

**Files:**
- Modify: `munbeop/app/seed/grammar-pairs/n1.ts` (add the remaining 3 pairs; expand an-mot if needed)

Content task. Drafting + verification via Claude **Workflows** (controller-run). The 4 pairs (a/b ko verbatim from the catalog):
- `an-mot` — `안 + V / -지 않다` vs `못 + V / -지 못하다`
- `aseo-nikka` — `-아/어서` vs `-(으)니까`
- `go-aseo` — `-고` vs `-아/어서`
- `goitda-aitda` — `-고 있다` vs `-아/어 있다`

- [ ] **Step 1: Draft** — a Workflow, one agent per pair: given the two members' `meaning`/`usageNotes` (read from `grammars-n{1,2,3}.ts`), produce a `note` (the distinction) + 3 `DiscriminationItem`s — each a natural Korean sentence with a `{}` blank, both surface options (the two members' forms in that sentence), the correct `answer`, an 8-locale `trans`, and a one-line 8-locale `why`. Use the Step-5 engine for correct option surface forms.

- [ ] **Step 2: Verify (adversarial, Korean-lens)** — a Workflow, per item, checking the crux: **exactly one option fits** (the other is genuinely wrong/unnatural in that context, not ambiguous); the sentence is natural; `note`/`why` correct; 8-locale fidelity; option forms conjugation-correct. Rewrite ambiguous items until a single answer is defensible. Log dropped/changed items.

- [ ] **Step 3: Write the 4 verified pairs into `n1.ts`** (use `L(...)`; replace the scaffold so the file holds all 4 pairs × 3 items).

- [ ] **Step 4: Run the invariant test + full suite**

Run: `cd munbeop && pnpm test -- grammar-pairs`
Expected: PASS. Add a coverage assertion if helpful: all 4 ids (`an-mot`, `aseo-nikka`, `go-aseo`, `goitda-aitda`) present, each with ≥3 items.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/seed/grammar-pairs/n1.ts munbeop/tests/unit/grammar-pairs/seed-invariants.test.ts
git commit -m "content(discrimination): verified 4-pair batch (8-locale, single-answer)"
```

---

## Task 6: Full gates + study-sheet smoke

- [ ] **Step 1: Gates** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint` (use `pnpm test` without `| tail` so a real failure isn't masked; check the printed pass/fail + "0 errors"). All green; engine + grammar seeds untouched; no migration. Fix any regression (note: the i18n `import/first` lint trap — put component imports above `vi.mock` in test files).

- [ ] **Step 2: Live smoke** (best-effort) — the study sheet is in the Library, which hydrates the grammar catalog from Supabase and **fails under a synthetic JWT** (Library shows "Couldn't load your data", 0 points), so the chips/drill may not be reachable in preview. Confirm the dev server compiles the new files with no errors (`preview_logs`), and rely on the component + integration tests for behavior. If a logged-in session is available, open `안 + V / -지 않다` and confirm the "Often confused with" chip + Test-yourself drill render.

- [ ] **Step 3: Push + PR + merge** — only on the user's go-ahead (auto-mode guard needs explicit merge authorization). Wait for CI green before merging.

```bash
git push -u origin claude/discrimination-drill
gh pr create --base main --title "feat(discrimination): confusable-pair drill (roadmap Step 7)" --body "..."
```

---

## Self-Review

**Spec coverage:** types + static catalog (Tasks 1,2,5) ✓; `pairsFor`/`relatedKos` (Task 1) ✓; seed invariants incl. single-answer content gate (Tasks 2,5) ✓; `ConfusedWithSection` chips + note + inline drill (Task 4) ✓; `PairDrill` 2-choice cloze, self-contained, a11y `role=status`/option names (Task 3) ✓; study-sheet wiring after Examples (Task 4) ✓; i18n `library.confused.*` ×8 (Task 3) ✓; AI-draft + Korean-lens verify + engine check, 4 pairs (Task 5) ✓; gates + smoke (Task 6) ✓. Acceptance criteria 1–4 covered.

**Placeholder scan:** none — mechanical tasks have full code. Task 5 is intentionally Workflow-driven content (the 12 items can't be literal-coded blind); fully specified (pairs, schema, draft+verify gates, file) and guarded by the Task-2 invariant test.

**Type consistency:** `ConfusablePair {id,a,b,note,items}` + `DiscriminationItem {sentence,optionA,optionB,answer,trans,why}` defined in Task 1, used identically in the seed (Tasks 2/5), `pairsFor`/`PairRow {pair,selfSide,otherKo}` (Task 1) consumed by `ConfusedWithSection` (Task 4), and `PairDrill` (Task 3) consumes `pair.items`/`answer`/`optionA`/`optionB`. i18n keys `library.confused.{title,test_cta,correct,wrong,next,restart,score}` defined in Task 3, used in Tasks 3+4.
