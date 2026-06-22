# 빈칸 연습 — Cloze Recognition Drill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deck-driven, choice-first grammar-**pattern** cloze at `/practice/cloze`: pick a TOPIK or custom deck → fill blanks by choosing the right pattern from 4 options → wrong picks log `hard/incorrect`, cleared points log `easy/correct`, feeding the real log-derived SRS/garden mastery.

**Architecture:** Clone the Step 8 register-lab structure (just merged to `main`): domain type → static seed → pure lib → composable → stateless card/option/summary → page → i18n → hub. The differences from register: (a) content is grammar-pattern cloze items keyed to a real `Grammar.ko`; (b) points are chosen from decks (reuse `DeckPicker`/`CustomDeckShelf` + a pure `kosForDeck`); (c) the composable is coupled to the REAL `logStore` + `srsStore` (no separate localStorage mastery). No surgery to the ruleta/session loop.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, Pinia, vue-i18n (8 locales), Vitest + @vue/test-utils, `pnpm`. **All `app/…`/`i18n/…`/`tests/…` paths are physically under `munbeop/`** — run all `pnpm` commands from `munbeop/`. Spec: `docs/superpowers/specs/2026-06-22-cloze-recognition-design.md`.

**Conventions:** Korean text gets `lang="ko"` + `var(--font-ko)`. Reuse `SpeechLevel`/`ErrorDimension` from `~/lib/domain`. Single-file test runs: `pnpm test <path>`. Typecheck: `pnpm typecheck`. Lint: `pnpm lint`. **Before every commit** run `git rev-parse --abbrev-ref HEAD` and confirm `claude/step9-cloze` (you are in a git worktree — never commit to `main` or cd into the parent repo).

---

## Task 1: Domain type (`ClozeItem`)

**Files:**
- Create: `munbeop/app/lib/domain/cloze.ts`
- Modify: `munbeop/app/lib/domain/index.ts` (add barrel export)
- Test: `munbeop/tests/unit/domain/cloze.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/domain/cloze.test.ts
import { describe, it, expect } from 'vitest'
import type { ClozeItem } from '~/lib/domain'

describe('cloze domain', () => {
  it('a ClozeItem fixture type-checks', () => {
    const item: ClozeItem = {
      ko: '-고 싶다',
      sentence: '주말에 영화를 {} 싶어요.',
      answer: '보고',
      distractors: ['봐서', '보지만', '보면'],
      trans: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
      why: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
    }
    expect(item.distractors).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/domain/cloze.test.ts`
Expected: FAIL — `ClozeItem` not exported.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/domain/cloze.ts
import type { LocalizedString } from './i18n'
import type { ErrorDimension } from './log'

export interface ClozeItem {
  /** FK → Grammar.ko (the correct pattern's catalog id). The deck filter keys on this. NOT translated. */
  ko: string
  /** Korean sentence with the literal "{}" blank where the pattern goes. NOT translated. */
  sentence: string
  /** Surface form of the correct pattern in this sentence (e.g. 보고). NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong sibling-pattern surface forms. NOT translated; valid Hangul; ≠ answer and pairwise distinct. */
  distractors: [string, string, string]
  trans: LocalizedString
  /** One line: why the answer fits and the others don't. */
  why: LocalizedString
  /** Optional mistake-feed tag; defaults to 'other' at log time. */
  errorDimension?: ErrorDimension
}
```

```ts
// app/lib/domain/index.ts — add this line after the existing exports
export * from './cloze'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/domain/cloze.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/domain/cloze.ts app/lib/domain/index.ts tests/unit/domain/cloze.test.ts
git commit -m "feat(cloze): ClozeItem domain type"
```

---

## Task 2: Seed scaffolding + starter batch + invariants

**Files:**
- Create: `munbeop/app/seed/cloze/n1.ts`, `munbeop/app/seed/cloze/n2.ts`, `munbeop/app/seed/cloze/index.ts`
- Test: `munbeop/tests/unit/cloze/seed-invariants.test.ts`

Lands the structure + a small verified starter batch (4 items). The full ~50 batch (TOPIK 1–2, incl. expanding Step 7's 12) is authored in Task 9, which tightens coverage.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/cloze/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { CLOZE_ITEMS } from '~/seed/cloze'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES, ERROR_DIMENSIONS } from '~/lib/domain'

const KNOWN_KO = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))
const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)

describe('cloze seed invariants', () => {
  it('is non-empty', () => {
    expect(CLOZE_ITEMS.length).toBeGreaterThan(0)
  })
  for (const [i, it_] of CLOZE_ITEMS.entries()) {
    it(`#${i} ${it_.ko} :: ${it_.sentence} is well-formed`, () => {
      expect(KNOWN_KO.has(it_.ko), `ko: ${it_.ko}`).toBe(true)
      expect(it_.sentence).toContain('{}')
      expect(it_.answer.trim().length).toBeGreaterThan(0)
      expect(it_.answer).toMatch(HANGUL)
      expect(it_.distractors).toHaveLength(3)
      for (const d of it_.distractors) {
        expect(d).toMatch(HANGUL)
        expect(d).not.toBe(it_.answer)
      }
      expect(new Set(it_.distractors).size, 'distractors pairwise distinct').toBe(3)
      if (it_.errorDimension !== undefined)
        expect(ERROR_DIMENSIONS).toContain(it_.errorDimension)
      expect(nonEmptyLocales(it_.trans), 'trans 8 locales').toBe(true)
      expect(nonEmptyLocales(it_.why), 'why 8 locales').toBe(true)
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/cloze/seed-invariants.test.ts`
Expected: FAIL — `~/seed/cloze` does not exist.

- [ ] **Step 3: Write the seed files (starter batch — real, verified content)**

```ts
// app/seed/cloze/n1.ts
import type { ClozeItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-1 grammar-pattern cloze items (choose the pattern that fits the blank).
 * Starter batch — expanded to the full TOPIK-1 set + Step-7 conversions by the
 * Step 9 content Workflow. ko matches grammars-n1.ts verbatim.
 * Drafted + Korean-lens adversarially verified (single-correct-answer crux).
 * Korean wife native review = documented final gate.
 */
export const N1_CLOZE: ClozeItem[] = [
  {
    ko: '-고 싶다',
    sentence: '주말에 영화를 {} 싶어요.',
    answer: '보고',
    distractors: ['봐서', '보지만', '보면'],
    trans: L(
      'I want to watch a movie this weekend.',
      'Quiero ver una película el fin de semana.',
      'Je veux regarder un film ce week-end.',
      'Quero ver um filme no fim de semana.',
      'สุดสัปดาห์นี้ฉันอยากดูหนัง',
      'Akhir pekan ini saya ingin menonton film.',
      'Cuối tuần tôi muốn xem phim.',
      '週末に映画を見たいです。',
    ),
    why: L(
      'Only -고 chains with 싶다 to mean "want to": 보고 싶어요. -아/어서/-지만/-(으)면 cannot precede 싶다.',
      'Solo -고 se une a 싶다 para "querer": 보고 싶어요. -아/어서/-지만/-(으)면 no pueden ir antes de 싶다.',
      'Seul -고 s\'unit à 싶다 pour « vouloir » : 보고 싶어요. -아/어서/-지만/-(으)면 ne peuvent précéder 싶다.',
      'Só -고 liga-se a 싶다 para "querer": 보고 싶어요. -아/어서/-지만/-(으)면 não podem vir antes de 싶다.',
      'มีแค่ -고 ที่ต่อกับ 싶다 เพื่อสื่อ "อยาก": 보고 싶어요 ส่วน -아/어서/-지만/-(으)면 ใช้นำหน้า 싶다 ไม่ได้',
      'Hanya -고 yang menyambung ke 싶다 untuk makna "ingin": 보고 싶어요. -아/어서/-지만/-(으)면 tidak bisa mendahului 싶다.',
      'Chỉ -고 mới ghép với 싶다 để diễn đạt "muốn": 보고 싶어요. -아/어서/-지만/-(으)면 không thể đứng trước 싶다.',
      '「~したい」は-고だけが싶다に接続：보고 싶어요。-아/어서/-지만/-(으)면は싶다の前に置けない。',
    ),
  },
  {
    ko: '-았/었어요',
    sentence: '어제 친구를 {}.',
    answer: '만났어요',
    distractors: ['만나요', '만날 거예요', '만나세요'],
    trans: L(
      'I met a friend yesterday.',
      'Ayer me encontré con un amigo.',
      'Hier j\'ai rencontré un ami.',
      'Ontem encontrei um amigo.',
      'เมื่อวานฉันเจอเพื่อน',
      'Kemarin saya bertemu teman.',
      'Hôm qua tôi đã gặp một người bạn.',
      '昨日友だちに会いました。',
    ),
    why: L(
      '어제 (yesterday) forces the past -았/었어요 → 만났어요; present 만나요, future 만날 거예요, and the request 만나세요 all clash with the past-time cue.',
      '어제 (ayer) exige el pasado -았/었어요 → 만났어요; el presente 만나요, el futuro 만날 거예요 y el ruego 만나세요 chocan con la marca de pasado.',
      '어제 (hier) impose le passé -았/었어요 → 만났어요 ; le présent 만나요, le futur 만날 거예요 et la demande 만나세요 contredisent le repère passé.',
      '어제 (ontem) exige o passado -았/었어요 → 만났어요; o presente 만나요, o futuro 만날 거예요 e o pedido 만나세요 contrariam a marca de passado.',
      '어제 (เมื่อวาน) บังคับรูปอดีต -았/었어요 → 만났어요; ปัจจุบัน 만나요 อนาคต 만날 거예요 และคำขอ 만나세요 ขัดกับคำบอกเวลาอดีต',
      '어제 (kemarin) menuntut bentuk lampau -았/었어요 → 만났어요; 만나요 (kini), 만날 거예요 (nanti), 만나세요 (permintaan) bertentangan dengan penanda lampau.',
      '어제 (hôm qua) buộc dùng quá khứ -았/었어요 → 만났어요; hiện tại 만나요, tương lai 만날 거예요, lời nhờ 만나세요 đều mâu thuẫn với mốc quá khứ.',
      '어제（昨日）は過去-았/었어요 → 만났어요を要求。現在만나요・未来만날 거예요・依頼만나세요は過去の時間語と矛盾。',
    ),
  },
]
```

```ts
// app/seed/cloze/n2.ts
import type { ClozeItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-2 grammar-pattern cloze items. ko matches grammars-n2.ts verbatim.
 * Starter batch — expanded by the Step 9 content Workflow. Korean-lens verified;
 * Korean wife native review = documented final gate.
 */
export const N2_CLOZE: ClozeItem[] = [
  {
    ko: '-(으)ㄹ 거예요',
    sentence: '내일은 집에서 {}.',
    answer: '쉴 거예요',
    distractors: ['쉬었어요', '쉬세요', '쉬고 있어요'],
    trans: L(
      'Tomorrow I will rest at home.',
      'Mañana voy a descansar en casa.',
      'Demain je vais me reposer à la maison.',
      'Amanhã vou descansar em casa.',
      'พรุ่งนี้ฉันจะพักผ่อนที่บ้าน',
      'Besok saya akan beristirahat di rumah.',
      'Ngày mai tôi sẽ nghỉ ở nhà.',
      '明日は家で休むつもりです。',
    ),
    why: L(
      '내일 (tomorrow) forces the future -(으)ㄹ 거예요 → 쉴 거예요; past 쉬었어요, request 쉬세요, and progressive 쉬고 있어요 all clash with the future cue.',
      '내일 (mañana) exige el futuro -(으)ㄹ 거예요 → 쉴 거예요; el pasado 쉬었어요, el ruego 쉬세요 y el progresivo 쉬고 있어요 chocan con la marca de futuro.',
      '내일 (demain) impose le futur -(으)ㄹ 거예요 → 쉴 거예요 ; le passé 쉬었어요, la demande 쉬세요 et le progressif 쉬고 있어요 contredisent le repère futur.',
      '내일 (amanhã) exige o futuro -(으)ㄹ 거예요 → 쉴 거예요; o passado 쉬었어요, o pedido 쉬세요 e o progressivo 쉬고 있어요 contrariam a marca de futuro.',
      '내일 (พรุ่งนี้) บังคับรูปอนาคต -(으)ㄹ 거예요 → 쉴 거예요; อดีต 쉬었어요 คำขอ 쉬세요 และรูปกำลังทำ 쉬고 있어요 ขัดกับคำบอกเวลาอนาคต',
      '내일 (besok) menuntut bentuk akan datang -(으)ㄹ 거예요 → 쉴 거예요; lampau 쉬었어요, permintaan 쉬세요, progresif 쉬고 있어요 bertentangan dengan penanda masa depan.',
      '내일 (ngày mai) buộc dùng tương lai -(으)ㄹ 거예요 → 쉴 거예요; quá khứ 쉬었어요, lời nhờ 쉬세요, tiếp diễn 쉬고 있어요 mâu thuẫn với mốc tương lai.',
      '내일（明日）は未来-(으)ㄹ 거예요 → 쉴 거예요を要求。過去쉬었어요・依頼쉬세요・進行쉬고 있어요は未来の時間語と矛盾。',
    ),
  },
  {
    ko: '-고 있다',
    sentence: '지금 동생이 숙제를 {}.',
    answer: '하고 있어요',
    distractors: ['했어요', '할 거예요', '하세요'],
    trans: L(
      'My younger sibling is doing homework right now.',
      'Ahora mismo mi hermano menor está haciendo la tarea.',
      'En ce moment mon cadet fait ses devoirs.',
      'Agora meu irmão mais novo está fazendo a lição.',
      'ตอนนี้น้องกำลังทำการบ้าน',
      'Sekarang adik saya sedang mengerjakan PR.',
      'Bây giờ em tôi đang làm bài tập.',
      '今、弟が宿題をしています。',
    ),
    why: L(
      '지금 (right now) forces the progressive -고 있다 → 하고 있어요; past 했어요, future 할 거예요, and request 하세요 clash with the ongoing-now cue.',
      '지금 (ahora mismo) exige el progresivo -고 있다 → 하고 있어요; el pasado 했어요, el futuro 할 거예요 y el ruego 하세요 chocan con la marca de acción en curso.',
      '지금 (en ce moment) impose le progressif -고 있다 → 하고 있어요 ; le passé 했어요, le futur 할 거예요 et la demande 하세요 contredisent le repère « en cours ».',
      '지금 (agora) exige o progressivo -고 있다 → 하고 있어요; o passado 했어요, o futuro 할 거예요 e o pedido 하세요 contrariam a marca de ação em curso.',
      '지금 (ตอนนี้) บังคับรูปกำลังทำ -고 있다 → 하고 있어요; อดีต 했어요 อนาคต 할 거예요 และคำขอ 하세요 ขัดกับคำบอกว่ากำลังเกิดขึ้น',
      '지금 (sekarang) menuntut progresif -고 있다 → 하고 있어요; lampau 했어요, masa depan 할 거예요, permintaan 하세요 bertentangan dengan penanda sedang berlangsung.',
      '지금 (bây giờ) buộc dùng tiếp diễn -고 있다 → 하고 있어요; quá khứ 했어요, tương lai 할 거예요, lời nhờ 하세요 mâu thuẫn với mốc đang diễn ra.',
      '지금（今）は進行-고 있다 → 하고 있어요を要求。過去했어요・未来할 거예요・依頼하세요は進行中の時間語と矛盾。',
    ),
  },
]
```

```ts
// app/seed/cloze/index.ts
import type { ClozeItem } from '~/lib/domain'
import { N1_CLOZE } from './n1'
import { N2_CLOZE } from './n2'

export const CLOZE_ITEMS: ClozeItem[] = [...N1_CLOZE, ...N2_CLOZE]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/cloze/seed-invariants.test.ts`
Expected: PASS (4 items). If `ko` fails `KNOWN_KO`, the ko string doesn't match the catalog verbatim — fix the seed string, not the test.

- [ ] **Step 5: Commit**

```bash
git add app/seed/cloze tests/unit/cloze/seed-invariants.test.ts
git commit -m "feat(cloze): seed scaffolding + verified starter batch"
```

---

## Task 3: Pure lib — round builder + deck resolution

**Files:**
- Create: `munbeop/app/lib/cloze/drill.ts`, `munbeop/app/lib/cloze/index.ts`
- Test: `munbeop/tests/unit/cloze/drill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/cloze/drill.test.ts
import { describe, it, expect } from 'vitest'
import { itemsForKos, optionsFor, buildRound, scoreOf, itemId, kosForDeck } from '~/lib/cloze'
import type { ClozeItem } from '~/lib/domain'

const fx: ClozeItem[] = [
  { ko: 'A', sentence: 'a {} z', answer: 'Aa', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { ko: 'A', sentence: 'b {} z', answer: 'Ab', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { ko: 'B', sentence: 'c {} z', answer: 'Bc', distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]

describe('itemsForKos', () => {
  it('returns items whose ko is in the set', () => {
    expect(itemsForKos(['A'], fx).map((i) => i.answer)).toEqual(['Aa', 'Ab'])
    expect(itemsForKos(['A', 'B'], fx)).toHaveLength(3)
    expect(itemsForKos(['Z'], fx)).toEqual([])
  })
})

describe('optionsFor / itemId', () => {
  it('answer first then distractors; id keys on ko+sentence', () => {
    expect(optionsFor(fx[0])).toEqual(['Aa', 'x', 'y', 'z'])
    expect(itemId(fx[0])).toBe('A::a {} z')
  })
})

describe('buildRound', () => {
  it('returns n items for the kos using the injected shuffle', () => {
    const round = buildRound(['A'], 1, (xs) => xs, fx)
    expect(round).toHaveLength(1)
    expect(round[0].ko).toBe('A')
  })
})

describe('scoreOf', () => {
  it('counts correct + accuracy', () => {
    expect(scoreOf([{ itemId: 'A::x', ko: 'A', correct: true }, { itemId: 'B::y', ko: 'B', correct: false }]))
      .toEqual({ correct: 1, total: 2, accuracy: 0.5 })
  })
})

describe('kosForDeck', () => {
  const items = [
    { ko: 'g1', deckId: 'topik-1' }, { ko: 'g2', deckId: 'topik-1' }, { ko: 'g3', deckId: 'topik-2' },
  ] as never
  it('a deckId filters to that deck', () => {
    expect(kosForDeck(items, [], 'topik-1')).toEqual(['g1', 'g2'])
  })
  it('null = all non-excluded decks', () => {
    expect(kosForDeck(items, ['topik-2'], null)).toEqual(['g1', 'g2'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/cloze/drill.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/cloze/drill.ts
import type { ClozeItem, Grammar } from '~/lib/domain'
import { CLOZE_ITEMS } from '~/seed/cloze'

/** Stable per-item id (ClozeItem has no id field). */
export function itemId(i: ClozeItem): string {
  return `${i.ko}::${i.sentence}`
}

/** Items whose ko is in the given set of grammar points. */
export function itemsForKos(kos: string[], source: ClozeItem[] = CLOZE_ITEMS): ClozeItem[] {
  const set = new Set(kos)
  return source.filter((i) => set.has(i.ko))
}

/** answer first, then the 3 distractors (stable; the composable shuffles for display). */
export function optionsFor(item: ClozeItem): string[] {
  return [item.answer, ...item.distractors]
}

export function buildRound(
  kos: string[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: ClozeItem[] = CLOZE_ITEMS,
): ClozeItem[] {
  return shuffleFn(itemsForKos(kos, source)).slice(0, n)
}

export interface DrillResult { itemId: string; ko: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}

/** Resolve a deck choice to grammar kos. deckId null = all non-excluded decks. */
export function kosForDeck(
  items: readonly Pick<Grammar, 'ko' | 'deckId'>[],
  excludedDeckIds: readonly string[],
  deckId: string | null,
): string[] {
  const rows = deckId === null
    ? items.filter((g) => !excludedDeckIds.includes(g.deckId))
    : items.filter((g) => g.deckId === deckId)
  return rows.map((g) => g.ko)
}
```

```ts
// app/lib/cloze/index.ts
export * from './drill'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/cloze/drill.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/cloze tests/unit/cloze/drill.test.ts
git commit -m "feat(cloze): round builder + deck resolution (pure)"
```

---

## Task 4: `useClozeDrill` composable (log/SRS coupled)

**Files:**
- Create: `munbeop/app/composables/useClozeDrill.ts`
- Test: `munbeop/tests/unit/cloze/useClozeDrill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/cloze/useClozeDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClozeDrill } from '~/composables/useClozeDrill'
import type { ClozeItem } from '~/lib/domain'

const add = vi.fn()
const recalculate = vi.fn()
const markSeen = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ recalculate, markSeen }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

const items: ClozeItem[] = [
  { ko: '-고 싶다', sentence: '영화를 {} 싶어요.', answer: '보고', distractors: ['봐서', '보지만', '보면'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]
vi.mock('~/lib/cloze', async (orig) => {
  const real = await orig<typeof import('~/lib/cloze')>()
  return { ...real, buildRound: (_kos: string[], _n: number, shuffle: <T>(x: T[]) => T[]) => shuffle(items) }
})

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear(); recalculate.mockClear(); markSeen.mockClear()
})

describe('useClozeDrill', () => {
  it('a wrong pick logs ONE hard/incorrect with cloze-lab + recalculates', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('봐서')
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      ko: '-고 싶다', feedback: 'hard', reviewState: 'incorrect',
      errorDimension: 'other', contextId: 'cloze-lab', contextName: '빈칸 LAB',
    })
    expect(recalculate).toHaveBeenCalledWith('-고 싶다')
  })

  it('a correct pick does not log on pick; finish credits easy/correct', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('보고')
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
    await d.next()           // single item → phase done
    expect(d.phase.value).toBe('done')
    await d.finish()
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({ ko: '-고 싶다', feedback: 'easy', reviewState: 'correct' })
    expect(recalculate).toHaveBeenCalledWith('-고 싶다')
  })

  it('replay mode does not log', async () => {
    const d = useClozeDrill()
    await d.start(['-고 싶다'])
    await d.answer('봐서')      // miss (logs once, normal)
    await d.next()
    d.replayFailed()
    add.mockClear()
    await d.answer('봐서')
    expect(add).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/cloze/useClozeDrill.test.ts`
Expected: FAIL — composable missing.

- [ ] **Step 3: Write the implementation**

```ts
// app/composables/useClozeDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, optionsFor, scoreOf, itemId, type DrillResult } from '~/lib/cloze'
import type { ClozeItem } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

export type ClozePhase = 'question' | 'right' | 'wrong' | 'done'
export type ClozeRunMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'cloze-lab', name: '빈칸 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7

export function useClozeDrill() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const { t } = useI18n()

  const sessionItems = ref<ClozeItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<ClozeRunMode>('normal')
  const index = ref(0)
  const phase = ref<ClozePhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<ClozeItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value))
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }

  async function start(kos: string[]) {
    runMode.value = 'normal'
    sessionItems.value = buildRound(kos, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) shuffleOptions()
    for (const ko of new Set(sessionItems.value.map((i) => i.ko))) await srsStore.markSeen(ko)
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    shuffleOptions()
  }

  async function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    const correct = choice === item.value.answer
    results.value.push({ itemId: itemId(item.value), ko: item.value.ko, correct })
    phase.value = correct ? 'right' : 'wrong'
    if (!correct && runMode.value === 'normal') await logMistake(item.value, choice)
  }

  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    shuffleOptions()
  }

  /** Credit easy/correct per ko cleared at round end (normal mode only), then recalculate. */
  async function finish() {
    if (runMode.value !== 'normal') return
    const byKo = new Map<string, { correct: number; total: number; firstCorrect: ClozeItem | null }>()
    for (const it of sessionItems.value) {
      const r = results.value.find((x) => x.itemId === itemId(it))
      if (!r) continue
      const g = byKo.get(it.ko) ?? { correct: 0, total: 0, firstCorrect: null }
      g.total += 1
      if (r.correct) {
        g.correct += 1
        if (!g.firstCorrect) g.firstCorrect = it
      }
      byKo.set(it.ko, g)
    }
    for (const [ko, g] of byKo) {
      if (g.firstCorrect && g.total > 0 && g.correct / g.total >= CREDIT_THRESHOLD) {
        await logStore.add({
          ko,
          sentence: g.firstCorrect.sentence.replace('{}', g.firstCorrect.answer),
          feedback: 'easy',
          errorNote: null,
          reviewState: 'correct',
          contextId: LAB_CONTEXT.id,
          contextName: LAB_CONTEXT.name,
        })
      }
      await srsStore.recalculate(ko)
    }
  }

  async function logMistake(it: ClozeItem, choice: string) {
    await logStore.add({
      ko: it.ko,
      sentence: it.sentence.replace('{}', it.answer),
      feedback: 'hard',
      errorNote: t('cloze.diary_note', { chosen: choice, correct: it.answer }),
      errorDimension: it.errorDimension ?? 'other',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(it.ko)
  }

  return {
    sessionItems, displayOptions, runMode, index, phase, picked,
    item, score, failedItems,
    start, replayFailed, answer, next, finish,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/cloze/useClozeDrill.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useClozeDrill.ts tests/unit/cloze/useClozeDrill.test.ts
git commit -m "feat(cloze): useClozeDrill round engine (log/SRS coupled)"
```

---

## Task 5: Components — `ClozeOption` + `ClozeCard` + `ClozeSummary`

**Files:**
- Create: `munbeop/app/components/cloze-drill/ClozeOption.vue`, `ClozeCard.vue`, `ClozeSummary.vue`
- Test: `munbeop/tests/components/cloze-drill/ClozeCard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/cloze-drill/ClozeCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClozeCard from '~/components/cloze-drill/ClozeCard.vue'
import type { ClozeItem } from '~/lib/domain'

const item: ClozeItem = {
  ko: '-고 싶다', sentence: '영화를 {} 싶어요.', answer: '보고',
  distractors: ['봐서', '보지만', '보면'],
  trans: { en: 'I want to watch a movie.' } as never,
  why: { en: 'Only -고 chains with 싶다.' } as never,
}
const options = ['보고', '봐서', '보지만', '보면']

function factory(phase = 'question', picked: string | null = null) {
  return mount(ClozeCard, {
    props: { item, options, phase, verdict: phase === 'wrong' ? false : phase === 'right' ? true : null, picked },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ClozeCard', () => {
  it('renders the cloze split on {} and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('영화를')
    expect(w.text()).toContain('싶어요')
    expect(w.findAll('[data-testid^="cloze-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="cloze-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(options[0])
  })
  it('on wrong, fills the blank with the correct answer and reveals why', () => {
    const w = factory('wrong', '봐서')
    expect(w.text()).toContain('보고')                 // blank filled with the correct form
    expect(w.text()).toContain('Only -고 chains with 싶다.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/cloze-drill/ClozeCard.test.ts`
Expected: FAIL — components missing.

- [ ] **Step 3: Write `ClozeOption.vue`** (identical to the shipped `RegisterOption.vue`)

```vue
<!-- app/components/cloze-drill/ClozeOption.vue -->
<script setup lang="ts">
interface Props {
  label: string
  state: 'idle' | 'correct' | 'wrong' | 'muted'
  disabled?: boolean
}
defineProps<Props>()
defineEmits<{ pick: [] }>()
</script>

<template>
  <button type="button" class="opt" :class="`opt--${state}`" :disabled="disabled" lang="ko" @click="$emit('pick')">
    {{ label }}
  </button>
</template>

<style scoped>
.opt {
  padding: 12px 14px; min-height: 44px; background: var(--paper-deep); border: 2px solid var(--border);
  box-shadow: var(--shadow-button); color: var(--text); font-family: var(--font-ko); font-size: var(--text-lg);
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), border-color var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out), box-shadow var(--motion-quick) var(--ease-out);
}
.opt:hover:not(:disabled) { border-color: var(--accent); transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.opt:active:not(:disabled) { transform: translate(1px, 1px); box-shadow: var(--shadow-button-pressed); }
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt--correct { border-color: var(--success); background: var(--surface); }
.opt--wrong { border-color: var(--danger); background: var(--surface); }
.opt--muted { opacity: 0.55; box-shadow: none; transform: none; }
.opt:disabled { cursor: default; box-shadow: none; transform: none; }
</style>
```

- [ ] **Step 4: Write `ClozeCard.vue`** (PairDrill's `{}`-split render + the register/conjugation stateless card pattern)

```vue
<!-- app/components/cloze-drill/ClozeCard.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ClozeItem } from '~/lib/domain'
import ClozeOption from './ClozeOption.vue'

interface Props {
  item: ClozeItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  verdict: boolean | null
  picked: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; next: [] }>()
const { tl } = useLocalized()

const card = ref<HTMLDivElement | null>(null)
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const parts = computed(() => props.item.sentence.split('{}'))
/** On reveal the blank shows the CORRECT answer (so a wrong picker sees the right form). */
const filled = computed(() => (revealed.value ? props.item.answer : null))

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

onMounted(() => void card.value?.focus())
watch(
  () => [props.item.ko, props.item.sentence, props.phase] as const,
  async ([, , phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" data-testid="cloze-card">
    <p class="card__sentence" lang="ko">
      <span>{{ parts[0] }}</span>
      <span class="card__blank" :class="{ 'card__blank--filled': revealed }">{{ filled ?? '____' }}</span>
      <span>{{ parts[1] }}</span>
    </p>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('cloze.pick_hint') }}</p>

    <div class="card__options">
      <ClozeOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`cloze-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('cloze.correct') : $t('cloze.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">{{ $t('cloze.reveal_correct', { correct: item.answer }) }}</p>
      <p class="card__why">{{ tl(item.why) }}</p>
      <p class="card__trans">{{ tl(item.trans) }}</p>
      <button type="button" class="card__next" :aria-label="$t('cloze.next')" @click="emit('next')">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; flex-direction: column; gap: 16px; }
.card__sentence { margin: 0; font-family: var(--font-ko); font-size: 20px; line-height: 1.7; color: var(--text); }
.card__blank { border-bottom: 2px solid var(--border); padding: 0 10px; margin: 0 2px; font-weight: 700; }
.card__blank--filled { border-bottom-color: var(--heading-accent); color: var(--heading-accent); }
.card__hint { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card__feedback { display: flex; flex-direction: column; gap: 8px; }
.card__verdict { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); }
.card__verdict--ok { color: var(--heading-accent); }
.card__verdict--no { color: var(--danger); }
.card__correct { margin: 0; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); }
.card__why { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text); line-height: 1.6; }
.card__trans { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__next {
  align-self: flex-end; padding: 10px 16px; background: var(--accent); color: var(--text-on-accent);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (max-width: 480px) { .card__options { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Write `ClozeSummary.vue`** (clone of the shipped `RegisterSummary.vue`; missed list shows `sentence → answer`)

```vue
<!-- app/components/cloze-drill/ClozeSummary.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ClozeItem } from '~/lib/domain'

interface Props {
  score: { correct: number; total: number; accuracy: number }
  failedItems: ClozeItem[]
}
defineProps<Props>()
defineEmits<{ restart: []; 'replay-failed': [] }>()

const root = ref<HTMLElement | null>(null)
onMounted(() => root.value?.focus())
</script>

<template>
  <section ref="root" tabindex="-1" class="summary">
    <p class="summary__score" role="status">{{ $t('cloze.summary_score', { correct: score.correct, total: score.total }) }}</p>

    <div v-if="failedItems.length" class="summary__review">
      <h3 class="summary__review-title">{{ $t('cloze.replay_failed', { n: failedItems.length }) }}</h3>
      <ul class="summary__list">
        <li v-for="f in failedItems" :key="`${f.ko}::${f.sentence}`" lang="ko">{{ f.sentence.replace('{}', f.answer) }}</li>
      </ul>
    </div>

    <div class="summary__actions">
      <button v-if="failedItems.length" type="button" class="summary__btn summary__btn--primary" data-testid="cloze-replay" @click="$emit('replay-failed')">
        <span aria-hidden="true">🔁</span> {{ $t('cloze.replay_failed', { n: failedItems.length }) }}
      </button>
      <button type="button" class="summary__btn" data-testid="cloze-restart" @click="$emit('restart')">
        {{ $t('cloze.restart') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.summary__score { margin: 0; font-family: var(--font-pixel-display); font-size: var(--text-lg); color: var(--text); }
.summary__review { text-align: left; width: 100%; background: var(--paper); border-left: 4px solid var(--danger); padding: 12px 14px; }
.summary__review-title { margin: 0 0 8px; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase; }
.summary__list { margin: 0; padding-left: 18px; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); line-height: 1.7; }
.summary__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.summary__btn {
  min-width: 0; padding: 10px 16px; background: var(--surface); color: var(--text);
  border: 3px solid var(--border-strong); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.summary__btn--primary { background: var(--accent); color: var(--text-on-accent); }
.summary__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.summary:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test tests/components/cloze-drill/ClozeCard.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/components/cloze-drill tests/components/cloze-drill/ClozeCard.test.ts
git commit -m "feat(cloze): ClozeCard + ClozeOption + ClozeSummary"
```

---

## Task 6: Page — `/practice/cloze` (deck-driven)

**Files:**
- Create: `munbeop/app/pages/practice/cloze.vue`

No new test file (page wiring is covered by the composable/lib/component tests + manual smoke in Task 10). Reuses the ruleta deck shelf + builder.

- [ ] **Step 1: Write the page**

```vue
<!-- app/pages/practice/cloze.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import CustomDeckBuilder from '~/components/games/ruleta/CustomDeckBuilder.vue'
import Modal from '~/components/ui/Modal.vue'
import ClozeCard from '~/components/cloze-drill/ClozeCard.vue'
import ClozeSummary from '~/components/cloze-drill/ClozeSummary.vue'
import { buildDeckOptions, buildCustomDeckOptions } from '~/components/games/ruleta/cards'
import { useClozeDrill } from '~/composables/useClozeDrill'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { itemsForKos, kosForDeck } from '~/lib/cloze'
import { useGrammarStore } from '~/stores/grammar'
import { useCustomDecksStore } from '~/stores/customDecks'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const toast = useToast()
const grammarStore = useGrammarStore()
const customDecks = useCustomDecksStore()
const drill = useClozeDrill()

const MIN_ITEMS = 3
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)
const builderOpen = ref(false)
const editingDeckId = ref<string | null>(null)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

const deckOptions = computed(() =>
  buildDeckOptions({
    decks: grammarStore.decks,
    items: grammarStore.items,
    excludedDeckIds: grammarStore.excludedDeckIds,
    allName: t('practice.deck_all'),
  }),
)
const customDeckOptions = computed(() => buildCustomDeckOptions({ decks: customDecks.decks }))

function beginDeck(kos: string[]) {
  if (itemsForKos(kos).length < MIN_ITEMS) {
    toast.info(t('cloze.deck_empty'))
    return
  }
  void drill.start(kos)
  started.value = true
  phase.value = 'play'
}
function onDeckSelect(deckId: string | null) {
  beginDeck(kosForDeck(grammarStore.items, grammarStore.excludedDeckIds, deckId))
}
function onCustomDeckSelect(deckId: string) {
  const deck = customDecks.deckById(deckId)
  if (deck) beginDeck(deck.grammarKos)
}

function onCustomCreate() {
  editingDeckId.value = null
  builderOpen.value = true
}
function onCustomEdit(deckId: string) {
  editingDeckId.value = deckId
  builderOpen.value = true
}
function onBuilderClose() {
  builderOpen.value = false
  editingDeckId.value = null
}

async function onNext() {
  await drill.next()
  if (drill.phase.value === 'done') await drill.finish()
}
function restart() {
  phase.value = 'pick'
  started.value = false
}
function onReplayFailed() {
  drill.replayFailed()
}

onMounted(async () => {
  // Hard refresh / deep link mounts before layout hydration — hydrate idempotently.
  if (grammarStore.items.length === 0) {
    try {
      await grammarStore.hydrate()
    } catch (err) {
      console.error('cloze: grammar hydration failed', err)
    }
  }
  if (customDecks.decks.length === 0) {
    try {
      await customDecks.hydrate()
    } catch (err) {
      console.error('cloze: custom-deck hydration failed', err)
    }
  }
})
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="빈칸 연습" :latin="t('cloze.title')" />
    <p class="lab__lead">{{ t('cloze.lead') }}</p>

    <div v-if="phase === 'pick'">
      <p class="lab__pick-title">{{ t('cloze.pick_deck') }}</p>
      <DeckPicker :options="deckOptions" @select="onDeckSelect" />
      <CustomDeckShelf
        :options="customDeckOptions"
        @select="onCustomDeckSelect"
        @create="onCustomCreate"
        @edit="onCustomEdit"
      />
    </div>

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay-note" role="status">
        <span aria-hidden="true">🔁</span> {{ t('cloze.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('cloze.progress_label')"
      />
      <ClozeCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        @answer="drill.answer"
        @next="onNext"
      />
      <ClozeSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <Modal
      :open="builderOpen"
      :title="t('practice.custom.builder_title')"
      :close-label="t('practice.custom.close')"
      @close="onBuilderClose"
    >
      <CustomDeckBuilder :key="editingDeckId ?? 'new'" :deck-id="editingDeckId" @saved="onBuilderClose" />
    </Modal>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__pick-title {
  margin: 0 0 12px; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
</style>
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm typecheck`
Expected: PASS (i18n keys are added in Task 7; typecheck doesn't validate i18n strings).

- [ ] **Step 3: Commit**

```bash
git add app/pages/practice/cloze.vue
git commit -m "feat(cloze): /practice/cloze deck-driven page"
```

---

## Task 7: i18n — `cloze.*` + `games.cloze` in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/cloze/i18n-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

```ts
// tests/unit/cloze/i18n-keys.test.ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }
const keys = (o: Record<string, unknown>) => Object.keys((o.cloze as Record<string, unknown>) ?? {})

describe('cloze i18n parity', () => {
  it('every locale has the same cloze.* keys as en', () => {
    const base = keys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: keys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the games.cloze card keys', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const card = (loc.games as Record<string, Record<string, string>>)?.cloze
      expect({ name, ok: !!card?.name && !!card?.desc }).toEqual({ name, ok: true })
    }
  })
  it('placeholder strings are preserved', () => {
    for (const loc of Object.values(LOCALES)) {
      const c = loc.cloze as Record<string, string>
      expect(c.summary_score).toContain('{correct}')
      expect(c.summary_score).toContain('{total}')
      expect(c.diary_note).toContain('{chosen}')
      expect(c.diary_note).toContain('{correct}')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/cloze/i18n-keys.test.ts`
Expected: FAIL — `cloze` block missing.

- [ ] **Step 3: Add the `cloze` block + `games.cloze` to `en.json`**

Add a top-level `"cloze": { … }` (e.g. after the `register` block) and a `"cloze"` entry inside the existing `games` object:

```json
"cloze": {
  "title": "Cloze Lab",
  "lead": "Pick a deck, then choose the grammar that fits each blank — a quick recognition round that complements writing.",
  "pick_deck": "PICK A DECK",
  "deck_empty": "This deck has no cloze items yet — try another.",
  "pick_hint": "Tap the form that fits the blank.",
  "correct": "Correct!",
  "wrong": "Not quite",
  "reveal_correct": "Fits here: {correct}",
  "restart": "New round",
  "replay_failed": "Review mistakes ({n})",
  "replay_mode_label": "Review mode — your missed items",
  "summary_score": "{correct} / {total} correct",
  "diary_note": "You picked {chosen}; {correct} fits here.",
  "next": "Next",
  "progress_label": "Question progress"
}
```

```json
// inside "games": { … }
"cloze": {
  "name": "빈칸 연습 · Cloze",
  "desc": "Pick a deck and choose the grammar that fits each blank. A lighter round that complements writing."
}
```

- [ ] **Step 4: Add the translated block to the other 7 locales**

Add the same key structure to `es/fr/pt-BR/th/id/vi/ja`. Translate the descriptive values; keep `빈칸 연습` literal Hangul in `games.cloze.name`; preserve every `{placeholder}` (`{correct}`, `{total}`, `{chosen}`, `{n}`). Reference (`es`):

```jsonc
"cloze": {
  "title": "Laboratorio de huecos",
  "lead": "Elige un mazo y luego escoge la gramática que encaja en cada hueco — una ronda rápida de reconocimiento que complementa la escritura.",
  "pick_deck": "ELIGE UN MAZO",
  "deck_empty": "Este mazo aún no tiene huecos — prueba otro.",
  "pick_hint": "Toca la forma que encaja en el hueco.",
  "correct": "¡Correcto!",
  "wrong": "Casi",
  "reveal_correct": "Aquí encaja: {correct}",
  "restart": "Nueva ronda",
  "replay_failed": "Repasar errores ({n})",
  "replay_mode_label": "Modo repaso — tus fallos",
  "summary_score": "{correct} / {total} correctas",
  "diary_note": "Elegiste {chosen}; aquí encaja {correct}.",
  "next": "Siguiente",
  "progress_label": "Progreso de la pregunta"
},
// inside "games": { "cloze": { "name": "빈칸 연습 · Cloze", "desc": "Elige un mazo y escoge la gramática que encaja en cada hueco. Una ronda más ligera que complementa la escritura." } }
```

The engineer authors the analogous `fr/pt-BR/th/id/vi/ja` blocks (same keys, translated text, Korean kept literal, placeholders intact). The parity test is the guard.

- [ ] **Step 5: Run test to verify it passes** + check no JSON corruption

Run: `pnpm test tests/unit/cloze/i18n-keys.test.ts tests/unit/conjugation-drill/i18n-keys.test.ts tests/unit/register-transform/i18n-keys.test.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add i18n/locales tests/unit/cloze/i18n-keys.test.ts
git commit -m "feat(cloze): i18n cloze.* + games.cloze across 8 locales"
```

---

## Task 8: Hub — add the `/practice/cloze` GameCard

**Files:**
- Modify: `munbeop/app/pages/practice/index.vue`

- [ ] **Step 1: Add the card**

In `app/pages/practice/index.vue`, add a sixth `<GameCard>` inside `.hub__grid` (after the `register` card):

```vue
      <GameCard
        to="/practice/cloze"
        :name="t('games.cloze.name')"
        :description="t('games.cloze.desc')"
        emoji="📝"
      />
```

- [ ] **Step 2: Verify**

Run: `pnpm test tests/components/games/GameCard.test.ts` (PASS — contract unchanged), then `pnpm typecheck` (PASS).

- [ ] **Step 3: Commit**

```bash
git add app/pages/practice/index.vue
git commit -m "feat(cloze): surface the Cloze Lab in the practice hub"
```

---

## Task 9: Content — author + verify the full batch (Workflow) + tighten coverage

**Files:**
- Modify: `munbeop/app/seed/cloze/n1.ts`, `n2.ts` (expand to the full batch)
- Modify: `munbeop/tests/unit/cloze/seed-invariants.test.ts` (add coverage)

- [ ] **Step 1: Run the Korean-lens content Workflow**

Author ~50 items across TOPIK 1–2 with a multi-agent Workflow (the Step 6/7/8 pipeline). Per item draft `{ ko, sentence with {}, answer, 3 distractors, trans(8), why(8) }`; convert Step 7's 12 discrimination items (an-mot, aseo-nikka, go-aseo, goitda-aitda) to single-`ko` 4-choice cloze items. Then **adversarially verify** per item: (a) the sentence is natural and **exactly one option fits** (the 3 distractors are sibling patterns genuinely wrong in that context — temporal/structural cues should force a single answer, never an acceptable alternative); (b) surface forms are conjugation-correct; (c) `ko` is a real catalog `Grammar.ko` (from `grammars-n1.ts`/`grammars-n2.ts`); (d) 8-locale `trans`/`why` fidelity. Rewrite ambiguous items until single-answer. Land the verified arrays into `n1.ts`/`n2.ts` (keep the starter items if they pass review).

Coverage target: TOPIK-1 ≈ the 12 points that have `grammar_examples` (≈2–3 items each), TOPIK-2 a handful of high-value points; ~50 total.

- [ ] **Step 2: Tighten the coverage** — append to `tests/unit/cloze/seed-invariants.test.ts`:

```ts
import { itemsForKos } from '~/lib/cloze'

describe('cloze coverage', () => {
  it('has ≈50 items spanning TOPIK 1 and 2', async () => {
    const { N1_CLOZE } = await import('~/seed/cloze/n1')
    const { N2_CLOZE } = await import('~/seed/cloze/n2')
    expect(N1_CLOZE.length).toBeGreaterThanOrEqual(24)
    expect(N2_CLOZE.length).toBeGreaterThanOrEqual(8)
    expect(N1_CLOZE.length + N2_CLOZE.length).toBeGreaterThanOrEqual(44)
  })
  it('covers the Step-7 confusable points', () => {
    for (const ko of ['안 + V / -지 않다', '못 + V / -지 못하다', '-아/어서', '-(으)니까', '-고', '-고 있다', '-아/어 있다'])
      expect(itemsForKos([ko]).length, ko).toBeGreaterThanOrEqual(1)
  })
})
```

> Adjust the exact `ko` strings in the second test to match the verbatim catalog ko's the workflow used (the Step-7 pair members). Keep one assertion per converted pair.

- [ ] **Step 3: Run the full seed-invariant suite**

Run: `pnpm test tests/unit/cloze/seed-invariants.test.ts`
Expected: PASS.

- [ ] **Step 4: Document native-review gate + commit**

```bash
git add app/seed/cloze tests/unit/cloze/seed-invariants.test.ts
git commit -m "content(cloze): full verified batch (~50, TOPIK 1-2), 8-locale"
```

---

## Task 10: Final gates + manual smoke

**Files:** none (verification only)

- [ ] **Step 1: Full suite** — Run: `pnpm test` → all green.
- [ ] **Step 2: Typecheck + lint** — Run: `pnpm typecheck && pnpm lint` → 0 errors.
- [ ] **Step 3: Manual smoke (logged-in)** — start dev server; verify:
  - `/practice` shows the **빈칸 연습** card; clicking opens `/practice/cloze`.
  - The deck picker shows TOPIK decks + custom decks; picking a deck starts a round of cloze cards.
  - Options shuffle; a wrong pick fills the blank with the correct form and reveals `why`/`trans`; a wrong pick lands in `/log` under the **other** dimension (default) with a `빈칸 LAB` context.
  - Clearing a deck's points raises mastery (garden) and counts toward the daily-goal ring.
  - Replay-failed re-runs only missed items (no re-logging); a deck with no cloze items shows the `deck_empty` toast.
- [ ] **Step 4: Commit any fixes.**

```bash
git add -A
git commit -m "chore(cloze): final gate fixes"
```

---

## Acceptance criteria (from the spec)

1. ✅ `ClozeItem` type + static `app/seed/cloze/` with ~50 verified TOPIK 1–2 items (incl. expanded Step-7 set); `itemsForKos`/`buildRound`/`optionsFor`/`scoreOf`/`kosForDeck` pure + tested. (Tasks 1–3, 9)
2. ✅ `/practice/cloze` deck-driven lab: pick TOPIK/custom deck → 4-choice cloze → summary + replay-failed; surfaced via a `GameCard`. (Tasks 4–8)
3. ✅ Picks feed the real log/SRS: wrong → hard/incorrect (`errorDimension`), round end → easy/correct per cleared ko; daily-goal/streak/garden update with no changes to those modules. (Task 4)
4. ✅ Seed invariants hold; content passed Korean-lens verification (single-correct-answer); native gate documented. `pnpm test`/`typecheck`/`lint` green; ruleta/session/engine/grammar seeds/Supabase untouched; no migration/DB. (Tasks 9–10)
