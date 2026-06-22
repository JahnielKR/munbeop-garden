# 높임법 연구소 — Register & Honorifics Lab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone `/practice/register` lab that drills the Korean honorific system in two pedagogically separate recognition modes — `level` (말단계: 반말↔해요체↔합쇼체) and `honor` (높임말: -(으)시-/께서/께/suppletion) — with mastery, mistake-feed logging, and replay-failed.

**Architecture:** Clone the Step 5b conjugation lab (page shell, round composable, mastery composable, card/option/summary/picker/strip/celebration components). Content is **static authored seed** (the engine has no honorifics), seeded from the spine `honorificVocab` table and verified by an adversarial Korean-lens Workflow + a native-review gate. New `RegisterItem` type in `app/lib/domain/register.ts`; pure lib in `app/lib/register-transform/`; mistake-feed reuses the existing `errorDimension: 'register'`.

**Tech Stack:** Nuxt 4 (SPA, file-based routing), Vue 3 `<script setup>`, Pinia, vue-i18n (8 locales), Vitest + @vue/test-utils. Package manager: `pnpm`. **All `app/…`, `i18n/…`, `tests/…` paths are physically under `munbeop/`** (run all commands from `munbeop/`). Spec: `docs/superpowers/specs/2026-06-22-register-transform-design.md`.

**Conventions (from the spec + cloned templates):**
- Korean text always gets `lang="ko"` + `var(--font-ko)` (Noto Sans KR). Korean speech-level terms (합쇼체/해요체/반말/높임법) stay literal Hangul in every locale.
- Reuse `SpeechLevel` (`'formal'|'polite'|'casual'`) — do not invent a register axis.
- `it.each`-style seed-invariant tests assert all 8 `LOCALE_CODES` non-empty on every `LocalizedString`.
- Run tests from `munbeop/`: `pnpm test -- <path>` (vitest). Typecheck: `pnpm typecheck`. Lint: `pnpm lint`.

---

## Task 1: Domain types (`RegisterMode`, `RegisterItem`, set literals)

**Files:**
- Create: `munbeop/app/lib/domain/register.ts`
- Modify: `munbeop/app/lib/domain/index.ts` (add barrel export)
- Test: `munbeop/tests/unit/domain/register.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/domain/register.test.ts
import { describe, it, expect } from 'vitest'
import { LEVEL_SETS, HONOR_SETS } from '~/lib/domain'
import type { RegisterItem } from '~/lib/domain'

describe('register domain', () => {
  it('exposes the level + honor set literals', () => {
    expect([...LEVEL_SETS]).toEqual(['formal', 'polite', 'casual'])
    expect([...HONOR_SETS]).toEqual(['verb', 'noun', 'particle', 'si'])
  })
  it('a RegisterItem fixture type-checks', () => {
    const item: RegisterItem = {
      source: '저는 학생이에요.', mode: 'level', target: 'formal', set: 'formal',
      answer: '저는 학생입니다.', distractors: ['저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.'],
      trans: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
      why: { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' },
    }
    expect(item.distractors).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `munbeop/`): `pnpm test -- tests/unit/domain/register.test.ts`
Expected: FAIL — `LEVEL_SETS`/`RegisterItem` not exported.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/domain/register.ts
import type { SpeechLevel } from './particles'
import type { LocalizedString } from './i18n'

/** The two drill modes: speech-level transforms vs subject/object honorification. */
export type RegisterMode = 'level' | 'honor'

/** Level-mode focus sets — the target register to produce. */
export const LEVEL_SETS = ['formal', 'polite', 'casual'] as const
/** Honor-mode focus sets — the honorific phenomenon drilled. */
export const HONOR_SETS = ['verb', 'noun', 'particle', 'si'] as const
export type LevelSet = (typeof LEVEL_SETS)[number]
export type HonorSet = (typeof HONOR_SETS)[number]
export type RegisterSet = LevelSet | HonorSet

export interface RegisterItem {
  /** Korean source sentence to transform. NOT translated. */
  source: string
  mode: RegisterMode
  /**
   * Speech level the CORRECT answer sits in.
   * level: the target register to produce (set === target by construction).
   * honor: the register the honorific output uses (해요체 주무세요 vs 합쇼체 주무십니다).
   */
  target: SpeechLevel
  /** Focus set for the picker + mastery. A mastery set of `mode` (never 'mixed'). */
  set: RegisterSet
  /** The correct transformed sentence. NOT translated. */
  answer: string
  /** Exactly 3 plausible-wrong transforms. NOT translated; valid Hangul; ≠ answer and pairwise distinct. */
  distractors: [string, string, string]
  /** Meaning — unchanged across the transform. */
  trans: LocalizedString
  /** One line: what the transform requires, e.g. "께서 + 주무시다 + -세요". */
  why: LocalizedString
}
```

```ts
// app/lib/domain/index.ts — add this line after the existing exports
export * from './register'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/domain/register.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/domain/register.ts app/lib/domain/index.ts tests/unit/domain/register.test.ts
git commit -m "feat(register): RegisterMode + RegisterItem domain types"
```

---

## Task 2: Seed scaffolding + starter batch + seed-invariant test

**Files:**
- Create: `munbeop/app/seed/register-transform/level.ts`
- Create: `munbeop/app/seed/register-transform/honor.ts`
- Create: `munbeop/app/seed/register-transform/index.ts`
- Test: `munbeop/tests/unit/register-transform/seed-invariants.test.ts`

This task lands the file structure and a **small verified starter batch** (4 items). The full ~20 level + ~28 honor batch is authored in Task 14, which also tightens the coverage assertions.

- [ ] **Step 1: Write the failing test (per-item invariants, loose coverage)**

```ts
// tests/unit/register-transform/seed-invariants.test.ts
import { describe, it, expect } from 'vitest'
import { REGISTER_ITEMS } from '~/seed/register-transform'
import { LOCALE_CODES, LEVEL_SETS, HONOR_SETS } from '~/lib/domain'

const HANGUL = /^[가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,!?~%()'"·…\-/]+$/
const LEVELS = ['formal', 'polite', 'casual']
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)
const validSet = (mode: string, set: string) =>
  (mode === 'level' ? (LEVEL_SETS as readonly string[]) : (HONOR_SETS as readonly string[])).includes(set)

describe('register-transform seed invariants', () => {
  it('has items in both modes', () => {
    expect(REGISTER_ITEMS.some((i) => i.mode === 'level')).toBe(true)
    expect(REGISTER_ITEMS.some((i) => i.mode === 'honor')).toBe(true)
  })
  for (const [i, it_] of REGISTER_ITEMS.entries()) {
    it(`#${i} ${it_.source} → ${it_.answer} is well-formed`, () => {
      expect(it_.source).toMatch(HANGUL)
      expect(it_.answer).toMatch(HANGUL)
      expect(it_.source).not.toBe(it_.answer)
      expect(['level', 'honor']).toContain(it_.mode)
      expect(LEVELS).toContain(it_.target)
      expect(validSet(it_.mode, it_.set), `${it_.set} valid for ${it_.mode}`).toBe(true)
      if (it_.mode === 'level') expect(it_.set).toBe(it_.target)
      expect(it_.distractors).toHaveLength(3)
      for (const d of it_.distractors) {
        expect(d).toMatch(HANGUL)
        expect(d).not.toBe(it_.answer)
      }
      expect(new Set(it_.distractors).size, 'distractors pairwise distinct').toBe(3)
      expect(nonEmptyLocales(it_.trans), 'trans 8 locales').toBe(true)
      expect(nonEmptyLocales(it_.why), 'why 8 locales').toBe(true)
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/seed-invariants.test.ts`
Expected: FAIL — `~/seed/register-transform` does not exist.

- [ ] **Step 3: Write the seed files (starter batch — real, verified content)**

```ts
// app/seed/register-transform/level.ts
import type { RegisterItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * Speech-level transform items (반말 ↔ 해요체 ↔ 합쇼체), neutral subject.
 * Starter batch — expanded to the full ~20 by the Step 8 content Workflow.
 * Drafted + Korean-lens adversarially verified; Korean wife review = final gate.
 */
export const LEVEL_ITEMS: RegisterItem[] = [
  {
    source: '저는 한국어를 공부해요.',
    mode: 'level',
    target: 'formal',
    set: 'formal',
    answer: '저는 한국어를 공부합니다.',
    distractors: ['저는 한국어를 공부해.', '나는 한국어를 공부합니다.', '저는 한국어를 공부하세요.'],
    trans: L(
      'I study Korean.',
      'Estudio coreano.',
      "J'étudie le coréen.",
      'Eu estudo coreano.',
      'ฉันเรียนภาษาเกาหลี',
      'Saya belajar bahasa Korea.',
      'Tôi học tiếng Hàn.',
      '私は韓国語を勉強します。',
    ),
    why: L(
      '합쇼체 declarative is -ㅂ/습니다: 공부하다 → 공부합니다; keep 저 (not 나) in formal speech.',
      'El declarativo de 합쇼체 es -ㅂ/습니다: 공부하다 → 공부합니다; en formal se mantiene 저 (no 나).',
      "Le déclaratif 합쇼체 est -ㅂ/습니다 : 공부하다 → 공부합니다 ; en registre formel on garde 저 (pas 나).",
      'O declarativo do 합쇼체 é -ㅂ/습니다: 공부하다 → 공부합니다; no formal mantém-se 저 (não 나).',
      'รูปบอกเล่าของ 합쇼체 คือ -ㅂ/습니다: 공부하다 → 공부합니다 และในระดับทางการใช้ 저 (ไม่ใช่ 나)',
      'Deklaratif 합쇼체 adalah -ㅂ/습니다: 공부하다 → 공부합니다; di ragam formal tetap pakai 저 (bukan 나).',
      'Dạng trần thuật 합쇼체 là -ㅂ/습니다: 공부하다 → 공부합니다; ở văn phong trang trọng giữ 저 (không phải 나).',
      '합쇼체の叙述形は-ㅂ/습니다：공부하다 → 공부합니다。フォーマルでは저のまま（나にしない）。',
    ),
  },
  {
    source: '내일 친구를 만나요.',
    mode: 'level',
    target: 'casual',
    set: 'casual',
    answer: '내일 친구를 만나.',
    distractors: ['내일 친구를 만나요.', '내일 친구를 만납니다.', '내일 친구를 만난다.'],
    trans: L(
      "I'm meeting a friend tomorrow.",
      'Mañana me veo con un amigo.',
      'Demain je vois un ami.',
      'Amanhã vou encontrar um amigo.',
      'พรุ่งนี้ฉันจะเจอเพื่อน',
      'Besok saya bertemu teman.',
      'Ngày mai tôi gặp bạn.',
      '明日友だちに会う。',
    ),
    why: L(
      '반말 (해체) drops 요: 만나요 → 만나. (만난다 is 한다체 writing style, not casual speech.)',
      '반말 (해체) quita 요: 만나요 → 만나. (만난다 es estilo escrito 한다체, no habla casual.)',
      '반말 (해체) enlève 요 : 만나요 → 만나. (만난다 est le style écrit 한다체, pas le parler familier.)',
      '반말 (해체) tira 요: 만나요 → 만나. (만난다 é estilo escrito 한다체, não fala casual.)',
      '반말 (해체) ตัด 요 ออก: 만나요 → 만나 (만난다 เป็นสไตล์เขียน 한다체 ไม่ใช่ภาษาพูดกันเอง)',
      '반말 (해체) menghapus 요: 만나요 → 만나. (만난다 gaya tulis 한다체, bukan ujaran santai.)',
      '반말 (해체) bỏ 요: 만나요 → 만나. (만난다 là văn viết 한다체, không phải lời nói thân mật.)',
      '반말（해체）は요を落とす：만나요 → 만나。（만난다は한다체の書き言葉で、話し言葉の반말ではない。）',
    ),
  },
]
```

```ts
// app/seed/register-transform/honor.ts
import type { RegisterItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * Subject/object honorification items (-(으)시-, 께서/께, suppletion).
 * Starter batch — expanded to the full ~28 (covering the spine honorificVocab
 * table) by the Step 8 content Workflow. The speaker is NEVER self-honorified.
 * Drafted + Korean-lens adversarially verified; Korean wife review = final gate.
 */
export const HONOR_ITEMS: RegisterItem[] = [
  {
    source: '할아버지가 지금 자요.',
    mode: 'honor',
    target: 'polite',
    set: 'verb',
    answer: '할아버지께서 지금 주무세요.',
    distractors: ['할아버지께서 지금 자세요.', '할아버지가 지금 주무세요.', '할아버지께서 지금 주무셔.'],
    trans: L(
      'Grandfather is sleeping now.',
      'El abuelo está durmiendo ahora.',
      'Grand-père dort maintenant.',
      'O avô está dormindo agora.',
      'ตอนนี้คุณปู่กำลังนอนหลับ',
      'Kakek sedang tidur sekarang.',
      'Ông đang ngủ bây giờ.',
      'おじいさんは今お休みです。',
    ),
    why: L(
      'Honoring the subject: 이/가 → 께서, and 자다 has the suppletive honorific 주무시다 → 주무세요 (not 자세요).',
      'Honrar al sujeto: 이/가 → 께서, y 자다 tiene el honorífico supletivo 주무시다 → 주무세요 (no 자세요).',
      'Honorer le sujet : 이/가 → 께서, et 자다 a le suppletif honorifique 주무시다 → 주무세요 (pas 자세요).',
      'Honrar o sujeito: 이/가 → 께서, e 자다 tem o honorífico supletivo 주무시다 → 주무세요 (não 자세요).',
      'ยกย่องประธาน: 이/가 → 께서 และ 자다 มีรูปยกย่องพิเศษ 주무시다 → 주무세요 (ไม่ใช่ 자세요)',
      'Menghormati subjek: 이/가 → 께서, dan 자다 punya honorifik supletif 주무시다 → 주무세요 (bukan 자세요).',
      'Tôn kính chủ ngữ: 이/가 → 께서, và 자다 có dạng kính ngữ thay thế 주무시다 → 주무세요 (không phải 자세요).',
      '主語を高める：이/가 → 께서、자다は補充法の尊敬語주무시다 → 주무세요（자세요ではない）。',
    ),
  },
  {
    source: '선생님이 책을 읽어요.',
    mode: 'honor',
    target: 'formal',
    set: 'particle',
    answer: '선생님께서 책을 읽으십니다.',
    distractors: ['선생님이 책을 읽으십니다.', '선생님께서 책을 읽습니다.', '선생님께서 책을 읽으세요.'],
    trans: L(
      'The teacher is reading a book.',
      'El profesor está leyendo un libro.',
      'Le professeur lit un livre.',
      'O professor está lendo um livro.',
      'คุณครูกำลังอ่านหนังสือ',
      'Guru sedang membaca buku.',
      'Thầy giáo đang đọc sách.',
      '先生が本をお読みになります。',
    ),
    why: L(
      '합쇼체 honorific: 이/가 → 께서 pairs with -(으)시- + -ㅂ니다 → 읽으십니다. 께서 without 시 is inconsistent.',
      '합쇼체 honorífico: 이/가 → 께서 va con -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sin 시 es inconsistente.',
      "합쇼체 honorifique : 이/가 → 께서 va avec -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sans 시 est incohérent.",
      '합쇼체 honorífico: 이/가 → 께서 combina com -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sem 시 é inconsistente.',
      '합쇼체 ยกย่อง: 이/가 → 께서 ใช้คู่กับ -(으)시- + -ㅂ니다 → 읽으십니다 การใช้ 께서 โดยไม่มี 시 ไม่สอดคล้องกัน',
      '합쇼체 honorifik: 이/가 → 께서 berpasangan dengan -(으)시- + -ㅂ니다 → 읽으십니다. 께서 tanpa 시 tidak konsisten.',
      '합쇼체 kính ngữ: 이/가 → 께서 đi với -(으)시- + -ㅂ니다 → 읽으십니다. Dùng 께서 mà thiếu 시 là không nhất quán.',
      '합쇼체の尊敬：이/가 → 께서は-(으)시-+-ㅂ니다 → 읽으십니다と対応。께서なのに시が無いと不整合。',
    ),
  },
]
```

```ts
// app/seed/register-transform/index.ts
import type { RegisterItem } from '~/lib/domain'
import { LEVEL_ITEMS } from './level'
import { HONOR_ITEMS } from './honor'

export const REGISTER_ITEMS: RegisterItem[] = [...LEVEL_ITEMS, ...HONOR_ITEMS]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/seed-invariants.test.ts`
Expected: PASS (4 items, all well-formed).

- [ ] **Step 5: Commit**

```bash
git add app/seed/register-transform tests/unit/register-transform/seed-invariants.test.ts
git commit -m "feat(register): seed scaffolding + verified starter batch"
```

---

## Task 3: Pure lib — set definitions

**Files:**
- Create: `munbeop/app/lib/register-transform/sets.ts`
- Create: `munbeop/app/lib/register-transform/index.ts`
- Test: `munbeop/tests/unit/register-transform/sets.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/register-transform/sets.test.ts
import { describe, it, expect } from 'vitest'
import { REGISTER_SETS, setsForMode, isValidSet, isMasterySet, LEVEL_KO } from '~/lib/register-transform'

describe('register sets', () => {
  it('level mode = mixed + 3 mastery sets; honor mode = mixed + 4', () => {
    expect(setsForMode('level').map((s) => s.id)).toEqual(['mixed', 'formal', 'polite', 'casual'])
    expect(setsForMode('honor').map((s) => s.id)).toEqual(['mixed', 'verb', 'noun', 'particle', 'si'])
  })
  it('isValidSet accepts mixed + real sets, rejects unknown', () => {
    expect(isValidSet('level', 'formal')).toBe(true)
    expect(isValidSet('level', 'mixed')).toBe(true)
    expect(isValidSet('level', 'verb')).toBe(false)
    expect(isValidSet('honor', 'verb')).toBe(true)
  })
  it('isMasterySet excludes mixed', () => {
    expect(isMasterySet('level', 'formal')).toBe(true)
    expect(isMasterySet('level', 'mixed')).toBe(false)
    expect(REGISTER_SETS.filter((s) => s.mastery)).toHaveLength(7)
  })
  it('LEVEL_KO maps each SpeechLevel to its Korean register term', () => {
    expect(LEVEL_KO).toEqual({ formal: '합쇼체', polite: '해요체', casual: '반말' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/sets.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/register-transform/sets.ts
import type { RegisterMode, SpeechLevel } from '~/lib/domain'

export interface RegisterSetDef {
  /** Picker/?set= token. 'mixed' = play-all (not a mastery unit). */
  id: 'mixed' | 'formal' | 'polite' | 'casual' | 'verb' | 'noun' | 'particle' | 'si'
  mode: RegisterMode
  /** Korean picker label (verbatim). */
  ko: string
  /** Whether clearing this set counts toward 높임법 마스터. */
  mastery: boolean
}

/** mixed first per mode, then the mastery sets in a stable order. */
export const REGISTER_SETS: RegisterSetDef[] = [
  { id: 'mixed', mode: 'level', ko: '전체', mastery: false },
  { id: 'formal', mode: 'level', ko: '합쇼체로', mastery: true },
  { id: 'polite', mode: 'level', ko: '해요체로', mastery: true },
  { id: 'casual', mode: 'level', ko: '반말로', mastery: true },
  { id: 'mixed', mode: 'honor', ko: '전체', mastery: false },
  { id: 'verb', mode: 'honor', ko: '동사', mastery: true },
  { id: 'noun', mode: 'honor', ko: '명사', mastery: true },
  { id: 'particle', mode: 'honor', ko: '조사', mastery: true },
  { id: 'si', mode: 'honor', ko: '-(으)시-', mastery: true },
]

/** SpeechLevel → its Korean register term (for the level-mode transform prompt). */
export const LEVEL_KO: Record<SpeechLevel, string> = { formal: '합쇼체', polite: '해요체', casual: '반말' }

export function setsForMode(mode: RegisterMode): RegisterSetDef[] {
  return REGISTER_SETS.filter((s) => s.mode === mode)
}
export function isValidSet(mode: RegisterMode, id: string): boolean {
  return REGISTER_SETS.some((s) => s.mode === mode && s.id === id)
}
export function isMasterySet(mode: RegisterMode, id: string): boolean {
  return REGISTER_SETS.some((s) => s.mode === mode && s.id === id && s.mastery)
}
```

```ts
// app/lib/register-transform/index.ts
export * from './sets'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/sets.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/register-transform/sets.ts app/lib/register-transform/index.ts tests/unit/register-transform/sets.test.ts
git commit -m "feat(register): set definitions (picker + mastery units)"
```

---

## Task 4: Pure lib — round builder (`itemsFor`, `buildRound`, `optionsFor`, `scoreOf`)

**Files:**
- Create: `munbeop/app/lib/register-transform/drill.ts`
- Modify: `munbeop/app/lib/register-transform/index.ts` (add `export * from './drill'`)
- Test: `munbeop/tests/unit/register-transform/drill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/register-transform/drill.test.ts
import { describe, it, expect } from 'vitest'
import { itemsFor, optionsFor, buildRound, scoreOf, itemId } from '~/lib/register-transform'
import type { RegisterItem } from '~/lib/domain'

const fx: RegisterItem[] = [
  { source: 'a', mode: 'level', target: 'formal', set: 'formal', answer: 'A',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { source: 'b', mode: 'level', target: 'casual', set: 'casual', answer: 'B',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
  { source: 'c', mode: 'honor', target: 'polite', set: 'verb', answer: 'C',
    distractors: ['x', 'y', 'z'], trans: { en: 't' } as never, why: { en: 'w' } as never },
]

describe('itemsFor', () => {
  it('mixed = all items of the mode; a set filters', () => {
    expect(itemsFor('level', 'mixed', fx)).toHaveLength(2)
    expect(itemsFor('level', 'formal', fx).map((i) => i.answer)).toEqual(['A'])
    expect(itemsFor('honor', 'verb', fx).map((i) => i.answer)).toEqual(['C'])
  })
})

describe('optionsFor', () => {
  it('returns answer first + the 3 distractors', () => {
    expect(optionsFor(fx[0])).toEqual(['A', 'x', 'y', 'z'])
  })
})

describe('itemId', () => {
  it('keys on source + answer', () => {
    expect(itemId(fx[0])).toBe('a=>A')
  })
})

describe('buildRound', () => {
  it('returns n items using the injected shuffle', () => {
    const round = buildRound('level', 'mixed', 1, (xs) => xs, fx) // identity shuffle
    expect(round).toHaveLength(1)
    expect(round[0].answer).toBe('A')
  })
})

describe('scoreOf', () => {
  it('counts correct results and accuracy', () => {
    const s = scoreOf([{ itemId: 'a=>A', correct: true }, { itemId: 'b=>B', correct: false }])
    expect(s).toEqual({ correct: 1, total: 2, accuracy: 0.5 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/drill.test.ts`
Expected: FAIL — exports missing.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/register-transform/drill.ts
import type { RegisterItem, RegisterMode } from '~/lib/domain'
import { REGISTER_ITEMS } from '~/seed/register-transform'

/** Stable per-item id (RegisterItem has no id field). */
export function itemId(i: RegisterItem): string {
  return `${i.source}=>${i.answer}`
}

/** Items of a mode, optionally narrowed to a set ('mixed' = all of the mode). */
export function itemsFor(
  mode: RegisterMode,
  set: string = 'mixed',
  source: RegisterItem[] = REGISTER_ITEMS,
): RegisterItem[] {
  const byMode = source.filter((i) => i.mode === mode)
  return set === 'mixed' ? byMode : byMode.filter((i) => i.set === set)
}

/** answer first, then the 3 distractors (stable order; the composable shuffles for display). */
export function optionsFor(item: RegisterItem): string[] {
  return [item.answer, ...item.distractors]
}

export function buildRound(
  mode: RegisterMode,
  set: string,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: RegisterItem[] = REGISTER_ITEMS,
): RegisterItem[] {
  return shuffleFn(itemsFor(mode, set, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
```

```ts
// app/lib/register-transform/index.ts — append
export * from './drill'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/drill.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/register-transform/drill.ts app/lib/register-transform/index.ts tests/unit/register-transform/drill.test.ts
git commit -m "feat(register): round builder + scoring (pure)"
```

---

## Task 5: Pure lib — mastery model

**Files:**
- Create: `munbeop/app/lib/register-transform/master.ts`
- Modify: `munbeop/app/lib/register-transform/index.ts` (add `export * from './master'`)
- Test: `munbeop/tests/unit/register-transform/master.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/register-transform/master.test.ts
import { describe, it, expect } from 'vitest'
import { MASTER_KEYS, masteryKey, masteryOf } from '~/lib/register-transform'

describe('register mastery (pure)', () => {
  it('tracks the 7 mastery sets keyed by mode:set', () => {
    expect(MASTER_KEYS).toHaveLength(7)
    expect(MASTER_KEYS).toContain('level:formal')
    expect(MASTER_KEYS).toContain('honor:si')
    expect(MASTER_KEYS).not.toContain('level:mixed')
  })
  it('earned only when all 7 are cleared', () => {
    const partial = masteryOf(new Set([masteryKey('level', 'formal')]))
    expect(partial.doneCount).toBe(1)
    expect(partial.total).toBe(7)
    expect(partial.earned).toBe(false)
    const all = masteryOf(new Set(MASTER_KEYS))
    expect(all.earned).toBe(true)
    expect(all.perSet.every((p) => p.done)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/master.test.ts`
Expected: FAIL — exports missing.

- [ ] **Step 3: Write the implementation**

```ts
// app/lib/register-transform/master.ts
import { REGISTER_SETS } from './sets'
import type { RegisterMode } from '~/lib/domain'

export interface SetProgress { id: string; mode: RegisterMode; ko: string; done: boolean }

/** Composite key keeps the 7 mastery sets unique across modes. */
export function masteryKey(mode: string, set: string): string {
  return `${mode}:${set}`
}

const MASTER_SETS = REGISTER_SETS.filter((s) => s.mastery)
export const MASTER_KEYS = MASTER_SETS.map((s) => masteryKey(s.mode, s.id))

export function masteryOf(cleared: Set<string>) {
  const perSet: SetProgress[] = MASTER_SETS.map((s) => ({
    id: s.id,
    mode: s.mode,
    ko: s.ko,
    done: cleared.has(masteryKey(s.mode, s.id)),
  }))
  const doneCount = perSet.filter((p) => p.done).length
  return { perSet, doneCount, total: MASTER_KEYS.length, earned: doneCount === MASTER_KEYS.length }
}
```

```ts
// app/lib/register-transform/index.ts — append
export * from './master'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/master.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/register-transform/master.ts app/lib/register-transform/index.ts tests/unit/register-transform/master.test.ts
git commit -m "feat(register): mastery model (7 sets, mode:set keyed)"
```

---

## Task 6: `useRegisterMaster` composable

**Files:**
- Create: `munbeop/app/composables/useRegisterMaster.ts`
- Test: `munbeop/tests/unit/register-transform/useRegisterMaster.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/register-transform/useRegisterMaster.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useRegisterMaster } from '~/composables/useRegisterMaster'

beforeEach(() => localStorage.clear())

describe('useRegisterMaster', () => {
  it('clears a set at accuracy ≥ 0.7 and persists', () => {
    const m = useRegisterMaster()
    m.recordRound('level', 'formal', 0.6)
    expect(m.doneCount.value).toBe(0)
    m.recordRound('level', 'formal', 0.75)
    expect(m.doneCount.value).toBe(1)
    expect(JSON.parse(localStorage.getItem('register-lab.cleared')!)).toContain('level:formal')
  })
  it('celebrates once when all 7 sets are cleared', () => {
    const m = useRegisterMaster()
    const sets: Array<['level' | 'honor', string]> = [
      ['level', 'formal'], ['level', 'polite'], ['level', 'casual'],
      ['honor', 'verb'], ['honor', 'noun'], ['honor', 'particle'], ['honor', 'si'],
    ]
    for (const [mode, set] of sets) m.recordRound(mode, set, 1)
    expect(m.earned.value).toBe(true)
    expect(m.celebrate.value).toBe(true)
    expect(localStorage.getItem('register-lab.masterEarned')).toBe('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/useRegisterMaster.test.ts`
Expected: FAIL — composable missing.

- [ ] **Step 3: Write the implementation** (clone of `useConjugationMaster`, keyed by `mode:set`)

```ts
// app/composables/useRegisterMaster.ts
import { computed, ref } from 'vue'
import { masteryOf, masteryKey } from '~/lib/register-transform'
import type { RegisterMode } from '~/lib/domain'

const STORAGE_KEY = 'register-lab.cleared'
const EARNED_KEY = 'register-lab.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useRegisterMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const earnedSticky = ref(typeof localStorage !== 'undefined' && !!localStorage.getItem(EARNED_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perSet = computed(() => view.value.perSet)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned || earnedSticky.value)

  /** Call at round end with the mode, the focused set, and the round accuracy. */
  function recordRound(mode: RegisterMode, set: string, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    const key = masteryKey(mode, set)
    if (cleared.value.has(key)) return
    const next = new Set(cleared.value)
    next.add(key)
    cleared.value = next
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
    }
    if (view.value.earned && typeof localStorage !== 'undefined' && !localStorage.getItem(EARNED_KEY)) {
      localStorage.setItem(EARNED_KEY, '1')
      earnedSticky.value = true
      celebrate.value = true
    }
  }

  function dismiss() {
    celebrate.value = false
  }

  return { perSet, doneCount, total, earned, celebrate, recordRound, dismiss }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/useRegisterMaster.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useRegisterMaster.ts tests/unit/register-transform/useRegisterMaster.test.ts
git commit -m "feat(register): useRegisterMaster composable"
```

---

## Task 7: `useRegisterDrill` composable

**Files:**
- Create: `munbeop/app/composables/useRegisterDrill.ts`
- Test: `munbeop/tests/unit/register-transform/useRegisterDrill.test.ts`

- [ ] **Step 1: Write the failing test** (mirrors `useConjugationDrill.test.ts`)

```ts
// tests/unit/register-transform/useRegisterDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegisterDrill } from '~/composables/useRegisterDrill'

const add = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear()
})

describe('useRegisterDrill', () => {
  it('starts a round for the selected mode', () => {
    const d = useRegisterDrill('honor', 'mixed')
    d.start()
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(d.sessionItems.value.every((i) => i.mode === 'honor')).toBe(true)
    expect(d.phase.value).toBe('question')
  })

  it('a wrong answer logs ONE mistake with errorDimension=register and 높임법 LAB', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    const item = d.item.value
    const wrong = item.distractors[0]
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      errorDimension: 'register',
      contextId: 'register-lab',
      contextName: '높임법 LAB',
      reviewState: 'incorrect',
      feedback: 'hard',
    })
  })

  it('a correct answer advances without logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    await d.answer(d.item.value.answer)
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
  })

  it('replayFailed re-drills only the missed items and suppresses logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(it.distractors[0])
      else await d.answer(it.answer)
      await d.next()
    }
    expect(d.failedItems.value.length).toBe(1)
    await d.replayFailed()
    expect(d.runMode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
    add.mockClear()
    const r = d.item.value
    await d.answer(r.distractors[0])
    expect(add).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/useRegisterDrill.test.ts`
Expected: FAIL — composable missing.

- [ ] **Step 3: Write the implementation** (clone of `useConjugationDrill`)

```ts
// app/composables/useRegisterDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  buildRound,
  optionsFor,
  scoreOf,
  itemId,
  isValidSet,
  type DrillResult,
} from '~/lib/register-transform'
import type { RegisterItem, RegisterMode } from '~/lib/domain'
import { useLogStore } from '~/stores/log'

export type RegisterPhase = 'question' | 'right' | 'wrong' | 'done'
export type RegisterRunMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'register-lab', name: '높임법 LAB' }
const ROUND_SIZE = 8

export function useRegisterDrill(initialMode: RegisterMode = 'level', initialSet = 'mixed') {
  const logStore = useLogStore()
  const { t } = useI18n()

  const mode = ref<RegisterMode>(initialMode)
  const selectedSet = ref<string>(isValidSet(initialMode, initialSet) ? initialSet : 'mixed')
  const sessionItems = ref<RegisterItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<RegisterRunMode>('normal')
  const index = ref(0)
  const phase = ref<RegisterPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<RegisterItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value))
  }
  function selectMode(m: RegisterMode) {
    mode.value = m
    selectedSet.value = 'mixed'
  }
  function selectSet(s: string) {
    if (isValidSet(mode.value, s)) selectedSet.value = s
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }
  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(mode.value, selectedSet.value, ROUND_SIZE, shuffle)
    resetRound()
    shuffleOptions()
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
    results.value.push({ itemId: itemId(item.value), correct })
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
  async function logMistake(it: RegisterItem, choice: string) {
    await logStore.add({
      ko: it.source,
      sentence: `${it.source} → ${it.answer}`,
      feedback: 'hard',
      errorNote: t('register.diary_note', { chosen: choice, correct: it.answer }),
      errorDimension: 'register',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
  }

  return {
    mode,
    selectedSet,
    sessionItems,
    displayOptions,
    runMode,
    index,
    phase,
    picked,
    item,
    score,
    failedItems,
    selectMode,
    selectSet,
    start,
    replayFailed,
    answer,
    next,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/useRegisterDrill.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useRegisterDrill.ts tests/unit/register-transform/useRegisterDrill.test.ts
git commit -m "feat(register): useRegisterDrill round engine"
```

---

## Task 8: Components — `RegisterOption` + `RegisterCard`

**Files:**
- Create: `munbeop/app/components/register-drill/RegisterOption.vue`
- Create: `munbeop/app/components/register-drill/RegisterCard.vue`
- Test: `munbeop/tests/components/register-drill/RegisterCard.test.ts`

- [ ] **Step 1: Write the failing test** (mirrors `ConjugationCard.test.ts` + `PairDrill.test.ts` content rendering)

```ts
// tests/components/register-drill/RegisterCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterCard from '~/components/register-drill/RegisterCard.vue'
import type { RegisterItem } from '~/lib/domain'

const item: RegisterItem = {
  source: '저는 학생이에요.', mode: 'level', target: 'formal', set: 'formal',
  answer: '저는 학생입니다.', distractors: ['저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.'],
  trans: { en: 'I am a student.' } as never,
  why: { en: '합쇼체 is -ㅂ니다.' } as never,
}
const options = ['저는 학생입니다.', '저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.']

function factory(phase = 'question', picked: string | null = null) {
  return mount(RegisterCard, {
    props: {
      item, options, phase,
      verdict: phase === 'wrong' ? false : phase === 'right' ? true : null,
      picked,
    },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('RegisterCard', () => {
  it('renders the source and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('저는 학생이에요.')
    expect(w.findAll('[data-testid^="register-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="register-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(options[0])
  })
  it('on wrong, reveals the correct answer and the why note', () => {
    const w = factory('wrong', '저는 학생이야.')
    expect(w.text()).toContain('register.reveal_correct')
    expect(w.text()).toContain('합쇼체 is -ㅂ니다.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/components/register-drill/RegisterCard.test.ts`
Expected: FAIL — components missing.

- [ ] **Step 3: Write `RegisterOption.vue`** (identical to `ConjugationOption.vue` except testid is set by the parent)

```vue
<!-- app/components/register-drill/RegisterOption.vue -->
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

- [ ] **Step 4: Write `RegisterCard.vue`** (clone of `ConjugationCard.vue`; `tl` for why/trans, mode-aware prompt)

```vue
<!-- app/components/register-drill/RegisterCard.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { RegisterItem } from '~/lib/domain'
import { LEVEL_KO } from '~/lib/register-transform'
import RegisterOption from './RegisterOption.vue'

interface Props {
  item: RegisterItem
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
/** level → "합쇼체로"; honor → "높여서". */
const promptKo = computed(() => (props.item.mode === 'level' ? `${LEVEL_KO[props.item.target]}로` : '높여서'))

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

onMounted(() => void card.value?.focus())
watch(
  () => [props.item.source, props.item.answer, props.phase] as const,
  async ([, , phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" :data-testid="`register-card`">
    <div class="card__prompt">
      <span class="card__source" lang="ko">{{ item.source }}</span>
      <span class="card__arrow" aria-hidden="true">→</span>
      <span class="card__target" lang="ko">{{ promptKo }}</span>
      <span class="card__hint-tag">{{ item.mode === 'level' ? $t('register.prompt_level') : $t('register.prompt_honor') }}</span>
    </div>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('register.pick_hint') }}</p>

    <div class="card__options">
      <RegisterOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`register-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('register.correct') : $t('register.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">{{ $t('register.reveal_correct', { correct: item.answer }) }}</p>
      <p class="card__why">{{ tl(item.why) }}</p>
      <p class="card__trans">{{ tl(item.trans) }}</p>
      <button type="button" class="card__next" :aria-label="$t('register.next')" @click="emit('next')">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; flex-direction: column; gap: 16px; }
.card__prompt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }
.card__source { font-family: var(--font-ko); font-weight: 700; font-size: 22px; color: var(--text); }
.card__arrow { font-family: var(--font-pixel-small); color: var(--text-soft); }
.card__target { font-family: var(--font-ko); font-weight: 700; font-size: 18px; color: var(--heading-accent); }
.card__hint-tag {
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--text-soft);
  background: var(--surface); border: 2px solid var(--border); padding: 4px 8px;
}
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

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- tests/components/register-drill/RegisterCard.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/register-drill/RegisterOption.vue app/components/register-drill/RegisterCard.vue tests/components/register-drill/RegisterCard.test.ts
git commit -m "feat(register): RegisterCard + RegisterOption"
```

---

## Task 9: Components — `ModeTabs` + `SetPicker`

**Files:**
- Create: `munbeop/app/components/register-drill/ModeTabs.vue`
- Create: `munbeop/app/components/register-drill/SetPicker.vue`
- Test: `munbeop/tests/components/register-drill/SetPicker.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/register-drill/SetPicker.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeTabs from '~/components/register-drill/ModeTabs.vue'
import SetPicker from '~/components/register-drill/SetPicker.vue'

const mocks = { $t: (k: string) => k }

describe('ModeTabs', () => {
  it('emits select with the chosen mode', async () => {
    const w = mount(ModeTabs, { props: { mode: 'level' }, global: { mocks } })
    await w.find('[data-testid="register-mode-honor"]').trigger('click')
    expect(w.emitted('select')?.[0]?.[0]).toBe('honor')
  })
})

describe('SetPicker', () => {
  it('renders the level mode sets and emits select', async () => {
    const w = mount(SetPicker, { props: { mode: 'level', selected: 'mixed' }, global: { mocks } })
    expect(w.findAll('[data-testid^="register-set-"]')).toHaveLength(4) // mixed + 3
    await w.find('[data-testid="register-set-formal"]').trigger('click')
    expect(w.emitted('select')?.[0]?.[0]).toBe('formal')
  })
  it('renders the honor mode sets', () => {
    const w = mount(SetPicker, { props: { mode: 'honor', selected: 'mixed' }, global: { mocks } })
    expect(w.findAll('[data-testid^="register-set-"]')).toHaveLength(5) // mixed + 4
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/components/register-drill/SetPicker.test.ts`
Expected: FAIL — components missing.

- [ ] **Step 3: Write `ModeTabs.vue`**

```vue
<!-- app/components/register-drill/ModeTabs.vue -->
<script setup lang="ts">
import type { RegisterMode } from '~/lib/domain'

interface Props { mode: RegisterMode }
defineProps<Props>()
defineEmits<{ select: [mode: RegisterMode] }>()

const TABS: { id: RegisterMode; key: string }[] = [
  { id: 'level', key: 'register.mode_level' },
  { id: 'honor', key: 'register.mode_honor' },
]
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="$t('register.title')">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': mode === tab.id }"
      :aria-selected="mode === tab.id"
      :data-testid="`register-mode-${tab.id}`"
      @click="$emit('select', tab.id)"
    >
      {{ $t(tab.key) }}
    </button>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 6px; }
.tabs__tab {
  flex: 1; min-width: 0; padding: 10px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--text-soft);
  cursor: pointer; transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.tabs__tab:hover { color: var(--text); }
.tabs__tab--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.tabs__tab:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Write `SetPicker.vue`** (clone of `DrillClassPicker.vue`, mode-filtered)

```vue
<!-- app/components/register-drill/SetPicker.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { setsForMode } from '~/lib/register-transform'
import type { RegisterMode } from '~/lib/domain'

interface Props { mode: RegisterMode; selected: string }
const props = defineProps<Props>()
defineEmits<{ select: [id: string] }>()

const sets = computed(() => setsForMode(props.mode))
</script>

<template>
  <div class="picker">
    <h2 class="picker__title">{{ $t('register.pick_set') }}</h2>
    <div class="picker__chips" role="group" :aria-label="$t('register.pick_set')">
      <button
        v-for="s in sets"
        :key="s.id"
        type="button"
        class="picker__chip"
        :class="{ 'picker__chip--active': selected === s.id }"
        :aria-pressed="selected === s.id"
        :data-testid="`register-set-${s.id}`"
        lang="ko"
        @click="$emit('select', s.id)"
      >
        {{ s.ko }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: 8px; }
.picker__title {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.picker__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.picker__chip {
  min-width: 0; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-ko); font-size: var(--text-sm); color: var(--text-soft); cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.picker__chip:hover { color: var(--text); }
.picker__chip--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.picker__chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- tests/components/register-drill/SetPicker.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/register-drill/ModeTabs.vue app/components/register-drill/SetPicker.vue tests/components/register-drill/SetPicker.test.ts
git commit -m "feat(register): ModeTabs + SetPicker"
```

---

## Task 10: Components — `RegisterSummary` + `RegisterMasterStrip` + `RegisterMasterCelebration`

**Files:**
- Create: `munbeop/app/components/register-drill/RegisterSummary.vue`
- Create: `munbeop/app/components/register-drill/RegisterMasterStrip.vue`
- Create: `munbeop/app/components/register-drill/RegisterMasterCelebration.vue`
- Test: `munbeop/tests/components/register-drill/RegisterSummary.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/register-drill/RegisterSummary.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterSummary from '~/components/register-drill/RegisterSummary.vue'
import type { RegisterItem } from '~/lib/domain'

const failed: RegisterItem[] = [{
  source: '할아버지가 자요.', mode: 'honor', target: 'polite', set: 'verb',
  answer: '할아버지께서 주무세요.', distractors: ['x', 'y', 'z'],
  trans: { en: 't' } as never, why: { en: 'w' } as never,
}]
const mocks = { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) }

describe('RegisterSummary', () => {
  it('shows the score and a review button when items were missed', async () => {
    const w = mount(RegisterSummary, {
      props: { score: { correct: 2, total: 3, accuracy: 0.66 }, failedItems: failed },
      global: { mocks },
    })
    expect(w.text()).toContain('register.summary_score')
    expect(w.find('[data-testid="register-replay"]').exists()).toBe(true)
    await w.find('[data-testid="register-replay"]').trigger('click')
    expect(w.emitted('replay-failed')).toBeTruthy()
  })
  it('hides the review button when nothing was missed', () => {
    const w = mount(RegisterSummary, {
      props: { score: { correct: 3, total: 3, accuracy: 1 }, failedItems: [] },
      global: { mocks },
    })
    expect(w.find('[data-testid="register-replay"]').exists()).toBe(false)
    expect(w.find('[data-testid="register-restart"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/components/register-drill/RegisterSummary.test.ts`
Expected: FAIL — components missing.

- [ ] **Step 3: Write `RegisterSummary.vue`** (clone of `ConjugationSummary.vue`)

```vue
<!-- app/components/register-drill/RegisterSummary.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { RegisterItem } from '~/lib/domain'

interface Props {
  score: { correct: number; total: number; accuracy: number }
  failedItems: RegisterItem[]
}
defineProps<Props>()
defineEmits<{ restart: []; 'replay-failed': [] }>()

const root = ref<HTMLElement | null>(null)
onMounted(() => root.value?.focus())
</script>

<template>
  <section ref="root" tabindex="-1" class="summary">
    <p class="summary__score" role="status">{{ $t('register.summary_score', { correct: score.correct, total: score.total }) }}</p>

    <div v-if="failedItems.length" class="summary__review">
      <h3 class="summary__review-title">{{ $t('register.replay_failed', { n: failedItems.length }) }}</h3>
      <ul class="summary__list">
        <li v-for="f in failedItems" :key="`${f.source}=>${f.answer}`" lang="ko">{{ f.source }} → {{ f.answer }}</li>
      </ul>
    </div>

    <div class="summary__actions">
      <button v-if="failedItems.length" type="button" class="summary__btn summary__btn--primary" data-testid="register-replay" @click="$emit('replay-failed')">
        <span aria-hidden="true">🔁</span> {{ $t('register.replay_failed', { n: failedItems.length }) }}
      </button>
      <button type="button" class="summary__btn" data-testid="register-restart" @click="$emit('restart')">
        {{ $t('register.restart') }}
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

- [ ] **Step 4: Write `RegisterMasterStrip.vue`** (clone of `ConjugationMasterStrip.vue`, 7 pips)

```vue
<!-- app/components/register-drill/RegisterMasterStrip.vue -->
<script setup lang="ts">
interface PerSet { id: string; mode: string; ko: string; done: boolean }

interface Props {
  perSet: PerSet[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section class="master" :class="{ 'master--earned': earned }" data-testid="register-master">
    <div class="master__head">
      <span class="master__badge" aria-hidden="true">{{ earned ? '🏅' : '🙇' }}</span>
      <span class="master__label" lang="ko">높임법 마스터</span>
      <span class="master__caption">
        {{ earned ? t('register.master.earned') : t('register.master.progress', { done: doneCount, total }) }}
      </span>
    </div>
    <ul class="master__pips" :aria-label="t('register.master.progress', { done: doneCount, total })">
      <li
        v-for="p in perSet"
        :key="`${p.mode}:${p.id}`"
        class="master__pip"
        :class="p.done ? 'master__pip--done' : 'master__pip--todo'"
        data-testid="register-pip"
        :aria-label="t(p.done ? 'register.master.pip_done' : 'register.master.pip_todo', { ko: p.ko })"
      >
        <span lang="ko" aria-hidden="true">{{ p.ko }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.master { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; background: var(--surface); border: 2px solid var(--border); }
.master--earned { border-color: var(--gold); box-shadow: inset 0 0 0 1px var(--gold); }
.master__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.master__badge { font-size: var(--text-md); }
.master__label { font-family: var(--font-ko); font-weight: 700; font-size: var(--text-sm); color: var(--text); }
.master__caption { font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--text-soft); }
.master__pips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.master__pip {
  padding: 3px 8px; border: 2px solid var(--border); font-family: var(--font-ko); font-size: var(--text-xs);
  color: var(--text-soft); background: var(--paper-deep);
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.master__pip--done { background: var(--jade); border-color: var(--ink-line); color: var(--always-dark); }
.master--earned .master__pip--done { background: var(--gold); }
</style>
```

- [ ] **Step 5: Write `RegisterMasterCelebration.vue`** (clone of `ConjugationMasterCelebration.vue`)

```vue
<!-- app/components/register-drill/RegisterMasterCelebration.vue -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Props { total: number }
defineProps<Props>()
const emit = defineEmits<{ dismiss: [] }>()
const { t } = useI18n()

const dismissBtn = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('dismiss')
  } else if (e.key === 'Tab') {
    e.preventDefault()
    dismissBtn.value?.focus()
  }
}
onMounted(() => {
  previouslyFocused = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
  dismissBtn.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  previouslyFocused?.focus()
})
</script>

<template>
  <div class="cel" data-testid="register-master-celebration" @click.self="emit('dismiss')">
    <section class="cel__card" role="dialog" aria-modal="true" aria-labelledby="register-cel-title" aria-describedby="register-cel-body">
      <span class="cel__badge" aria-hidden="true">🏅</span>
      <h2 id="register-cel-title" class="cel__title" lang="ko">높임법 마스터!</h2>
      <p class="cel__label">{{ t('register.master.label') }}</p>
      <p id="register-cel-body" class="cel__body">{{ t('register.master.celebrate_body', { total }) }}</p>
      <button ref="dismissBtn" type="button" class="cel__btn" data-testid="register-cel-dismiss" @click="emit('dismiss')">
        {{ t('register.master.dismiss') }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.cel { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--always-dark) 55%, transparent); animation: cel-fade var(--motion-quick) var(--ease-out); }
.cel__card { display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 360px; width: 100%; padding: 24px 20px; text-align: center; background: var(--surface); border: 3px solid var(--gold); box-shadow: var(--shadow-card); animation: cel-pop var(--motion-base) var(--ease-out); }
.cel__badge { font-size: 44px; line-height: 1; }
.cel__title { margin: 0; font-family: var(--font-ko); font-weight: 900; font-size: var(--text-xl); color: var(--heading-accent); }
.cel__label { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-soft); }
.cel__body { margin: 0; font-family: var(--font-ui); font-size: var(--text-base); line-height: 1.6; color: var(--text); }
.cel__btn { margin-top: 6px; padding: 10px 20px; background: var(--accent); color: var(--text-on-accent); border: 3px solid var(--ink-line); box-shadow: var(--shadow-button); font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer; }
.cel__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.cel__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@keyframes cel-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cel-pop { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .cel, .cel__card { animation: none; } }
</style>
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test -- tests/components/register-drill/RegisterSummary.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/components/register-drill/RegisterSummary.vue app/components/register-drill/RegisterMasterStrip.vue app/components/register-drill/RegisterMasterCelebration.vue tests/components/register-drill/RegisterSummary.test.ts
git commit -m "feat(register): Summary + MasterStrip + MasterCelebration"
```

---

## Task 11: Page — `/practice/register`

**Files:**
- Create: `munbeop/app/pages/practice/register.vue`

No new test file (page wiring is integration-covered by the composable/component tests + the manual smoke in Task 15). The page is a thin orchestrator cloned from `conjugation.vue`, adding `ModeTabs` and `?mode=`.

- [ ] **Step 1: Write the page**

```vue
<!-- app/pages/practice/register.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import ModeTabs from '~/components/register-drill/ModeTabs.vue'
import SetPicker from '~/components/register-drill/SetPicker.vue'
import RegisterCard from '~/components/register-drill/RegisterCard.vue'
import RegisterSummary from '~/components/register-drill/RegisterSummary.vue'
import RegisterMasterStrip from '~/components/register-drill/RegisterMasterStrip.vue'
import RegisterMasterCelebration from '~/components/register-drill/RegisterMasterCelebration.vue'
import { useRegisterDrill } from '~/composables/useRegisterDrill'
import { useRegisterMaster } from '~/composables/useRegisterMaster'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { isValidSet, isMasterySet } from '~/lib/register-transform'
import type { RegisterMode } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const initialMode: RegisterMode = route.query.mode === 'honor' ? 'honor' : 'level'
const initialSet = typeof route.query.set === 'string' ? route.query.set : 'mixed'
const drill = useRegisterDrill(initialMode, initialSet)
const master = useRegisterMaster()
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function onMode(m: RegisterMode) {
  drill.selectMode(m)
  started.value = false
  void router.replace({ query: { ...route.query, mode: m, set: 'mixed' } })
}

function begin(set: string) {
  drill.selectSet(set)
  void router.replace({ query: { ...route.query, mode: drill.mode.value, set } })
  drill.start()
  started.value = true
}

async function onNext() {
  await drill.next()
  if (
    drill.phase.value === 'done' &&
    drill.runMode.value === 'normal' &&
    isMasterySet(drill.mode.value, drill.selectedSet.value)
  ) {
    master.recordRound(drill.mode.value, drill.selectedSet.value, drill.score.value.accuracy)
  }
}

function restart() {
  drill.start()
}
function onReplayFailed() {
  drill.replayFailed()
}

if (initialSet !== 'mixed' && isValidSet(initialMode, initialSet)) begin(initialSet)
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="높임법 연구소" :latin="t('register.title')" />
    <p class="lab__lead">{{ t('register.lead') }}</p>

    <RegisterMasterStrip
      :per-set="master.perSet.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <ModeTabs :mode="drill.mode.value" @select="onMode" />

    <SetPicker v-if="!started" :mode="drill.mode.value" :selected="drill.selectedSet.value" @select="begin" />

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay-note" role="status">
        <span aria-hidden="true">🔁</span> {{ t('register.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('register.progress_label')"
      />
      <RegisterCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        @answer="drill.answer"
        @next="onNext"
      />
      <RegisterSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <RegisterMasterCelebration v-if="master.celebrate.value" :total="master.total.value" @dismiss="master.dismiss" />
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
</style>
```

- [ ] **Step 2: Verify it compiles** (no dedicated test; typecheck the page)

Run: `pnpm typecheck`
Expected: PASS (the i18n keys don't exist yet but typecheck doesn't validate i18n strings — they're added in Task 12).

- [ ] **Step 3: Commit**

```bash
git add app/pages/practice/register.vue
git commit -m "feat(register): /practice/register lab page"
```

---

## Task 12: i18n — `register.*` block + `games.register.*` in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json` (add `register` top-level block + `games.register`)
- Test: `munbeop/tests/unit/register-transform/i18n-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

```ts
// tests/unit/register-transform/i18n-keys.test.ts
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
const topKeys = (o: Record<string, unknown>) => Object.keys((o.register as Record<string, unknown>) ?? {})
const masterKeys = (o: Record<string, unknown>) =>
  Object.keys(((o.register as Record<string, unknown>)?.master as Record<string, unknown>) ?? {})

describe('register i18n parity', () => {
  it('every locale has the same register.* keys as en', () => {
    const base = topKeys(en).sort()
    expect(base.length).toBeGreaterThan(0)
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: topKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the same register.master.* keys as en', () => {
    const base = masterKeys(en).sort()
    for (const [name, loc] of Object.entries(LOCALES)) {
      expect({ name, keys: masterKeys(loc).sort() }).toEqual({ name, keys: base })
    }
  })
  it('every locale has the games.register card keys', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const card = (loc.games as Record<string, Record<string, string>>)?.register
      expect({ name, ok: !!card?.name && !!card?.desc }).toEqual({ name, ok: true })
    }
  })
  it('placeholder strings are preserved', () => {
    for (const loc of Object.values(LOCALES)) {
      const r = loc.register as Record<string, unknown>
      expect(r.summary_score as string).toContain('{correct}')
      expect(r.summary_score as string).toContain('{total}')
      expect(r.diary_note as string).toContain('{chosen}')
      expect(r.diary_note as string).toContain('{correct}')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/unit/register-transform/i18n-keys.test.ts`
Expected: FAIL — `register` block missing.

- [ ] **Step 3: Add the `register` block + `games.register` to `en.json`**

In `en.json`, add `"register": { … }` as a top-level key (e.g. after the `conjugation` block) and add `"register"` inside the existing `games` object:

```json
"register": {
  "title": "Honorifics Lab",
  "lead": "Rewrite the sentence in the right register. The wrong options are the honorific mistakes learners actually make.",
  "mode_level": "말단계 · Speech level",
  "mode_honor": "높임말 · Honorifics",
  "pick_set": "PICK A SET",
  "prompt_level": "Rewrite into the target register.",
  "prompt_honor": "Honor the subject.",
  "pick_hint": "Tap the natural form.",
  "correct": "Correct!",
  "wrong": "Not quite",
  "reveal_correct": "Natural form: {correct}",
  "restart": "New round",
  "replay_failed": "Review mistakes ({n})",
  "replay_mode_label": "Review mode — your missed items",
  "summary_score": "{correct} / {total} correct",
  "diary_note": "You picked {chosen}; the natural form is {correct}.",
  "next": "Next",
  "progress_label": "Question progress",
  "master": {
    "label": "Honorifics Master",
    "title": "높임법 마스터!",
    "progress": "{done}/{total} sets cleared",
    "earned": "All 7 sets cleared!",
    "celebrate_body": "You cleared all {total} register & honorific sets. 화이팅!",
    "dismiss": "Nice!",
    "pip_done": "{ko} — cleared",
    "pip_todo": "{ko} — not yet"
  }
}
```

```json
// inside "games": { … }
"register": {
  "name": "높임법 연구소 · Honorifics",
  "desc": "Shift between 반말, 해요체 and 합쇼체, and honor the subject with 께서 and 드시다/주무시다."
}
```

- [ ] **Step 4: Add the translated block to the other 7 locales**

Add the same key structure to `es.json`, `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`. **Translate the descriptive values; keep the Korean terms (말단계/높임말/합쇼체/해요체/반말/높임법/께서/드시다/주무시다/높임법 마스터) literal Hangul in every locale.** Reference values:

```jsonc
// es.json
"register": {
  "title": "Laboratorio de honoríficos",
  "lead": "Reescribe la frase en el registro correcto. Las opciones erróneas son los fallos honoríficos que de verdad cometen los estudiantes.",
  "mode_level": "말단계 · Nivel de habla",
  "mode_honor": "높임말 · Honoríficos",
  "pick_set": "ELIGE UN SET",
  "prompt_level": "Reescribe en el registro objetivo.",
  "prompt_honor": "Honra al sujeto.",
  "pick_hint": "Toca la forma natural.",
  "correct": "¡Correcto!",
  "wrong": "Casi",
  "reveal_correct": "Forma natural: {correct}",
  "restart": "Nueva ronda",
  "replay_failed": "Repasar errores ({n})",
  "replay_mode_label": "Modo repaso — tus fallos",
  "summary_score": "{correct} / {total} correctas",
  "diary_note": "Elegiste {chosen}; la forma natural es {correct}.",
  "next": "Siguiente",
  "progress_label": "Progreso de la pregunta",
  "master": {
    "label": "Maestro de honoríficos",
    "title": "높임법 마스터!",
    "progress": "{done}/{total} sets superados",
    "earned": "¡Los 7 sets superados!",
    "celebrate_body": "Superaste los {total} sets de registro y honoríficos. 화이팅!",
    "dismiss": "¡Bien!",
    "pip_done": "{ko} — superado",
    "pip_todo": "{ko} — aún no"
  }
},
"games.register": { "name": "높임법 연구소 · Honoríficos", "desc": "Cambia entre 반말, 해요체 y 합쇼체, y honra al sujeto con 께서 y 드시다/주무시다." }
```

> The engineer authors the analogous `fr`, `pt-BR`, `th`, `id`, `vi`, `ja` blocks following the same structure (same keys, translated descriptive text, Korean terms kept literal). The `games.register` entry goes **inside** each file's `games` object (not as a separate top-level key — the `"games.register"` shorthand above is only a note). The parity test enforces completeness across all 8.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test -- tests/unit/register-transform/i18n-keys.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add i18n/locales tests/unit/register-transform/i18n-keys.test.ts
git commit -m "feat(register): i18n register.* + games.register across 8 locales"
```

---

## Task 13: Hub — add the `/practice/register` GameCard

**Files:**
- Modify: `munbeop/app/pages/practice/index.vue`

- [ ] **Step 1: Replace the locked `third` card with the register card**

In `app/pages/practice/index.vue`, replace the locked placeholder `<GameCard … games.third … locked … />` block with:

```vue
      <GameCard
        to="/practice/register"
        :name="t('games.register.name')"
        :description="t('games.register.desc')"
        emoji="🙇"
      />
```

(The `games.third.*` i18n keys may be left in place unused — harmless — or removed from all 8 locales if the engineer prefers a clean tree. Leaving them avoids touching parity.)

- [ ] **Step 2: Verify the hub renders the card**

Run: `pnpm test -- tests/components/games/GameCard.test.ts`
Expected: PASS (unchanged — GameCard contract is untouched). Then `pnpm typecheck` → PASS.

- [ ] **Step 3: Commit**

```bash
git add app/pages/practice/index.vue
git commit -m "feat(register): surface the Honorifics Lab in the practice hub"
```

---

## Task 14: Content — author + verify the full batch (Workflow) and tighten coverage

**Files:**
- Modify: `munbeop/app/seed/register-transform/level.ts` (expand to ~20 items)
- Modify: `munbeop/app/seed/register-transform/honor.ts` (expand to ~28 items)
- Modify: `munbeop/tests/unit/register-transform/seed-invariants.test.ts` (add strict coverage)

This task produces the real content. It is a **content pipeline**, not a code edit — run the authoring Workflow, land the verified output into the seed files, then tighten the invariant test.

- [ ] **Step 1: Run the Korean-lens content Workflow**

Author the full batch with a multi-agent Workflow (same pipeline as Steps 6/7). Per item the Workflow drafts `{ source, mode, target, set, answer, distractors: [3], trans: L(8), why: L(8) }`, then **adversarially verifies**: (a) the source is natural and **exactly one option is correct**; (b) all 3 distractors are *plausible but genuinely wrong* learner errors (missed suppletion, dropped 께서, 시 wrongly self-applied, wrong target level, un-elevated noun) — never ambiguous; (c) suppletion/께서/`-(으)시-` correct and **the speaker is never self-honorified**; (d) 8-locale `trans`/`why` fidelity; (e) regular (non-suppletive) distractor forms cross-checked against `conjugate()` from `~/lib/korean`.

Coverage to hit (matches the spec sizing):
- **level (~20):** `formal` ≈ 7, `polite` ≈ 7, `casual` ≈ 6 (each a 해요체↔합쇼체↔반말 transform with neutral 저/나 subjects).
- **honor (~28):** `verb` ≈ 12 (all 10 spine suppletive verbs incl. 드시다/잡수시다, 주무시다, 계시다/안 계시다, 말씀하시다, 돌아가시다, 편찮으시다, 드리다, 여쭙다, 뵙다), `noun` ≈ 6 (성함/연세/댁/진지/말씀/생신), `particle` ≈ 4 (께서, 께), `si` ≈ 6 (regular -(으)시- on 가다/오다/읽다/받다/입다/웃다).

Land the verified arrays into `level.ts` / `honor.ts` (replacing/extending the starter items; keep the starter items if they pass review).

- [ ] **Step 2: Tighten the seed-invariant coverage** — append to `tests/unit/register-transform/seed-invariants.test.ts`:

```ts
import { itemsFor } from '~/lib/register-transform'

describe('register-transform coverage', () => {
  const HONORIFIC_VERBS = ['드시', '잡수시', '주무시', '계시', '말씀하시', '돌아가시', '편찮으시', '드리', '여쭙', '여쭤', '뵙']
  it('level totals ≈ 20 and honor totals ≈ 28', () => {
    expect(itemsFor('level').length).toBeGreaterThanOrEqual(18)
    expect(itemsFor('honor').length).toBeGreaterThanOrEqual(26)
  })
  it('each mastery set has ≥ 4 items', () => {
    for (const set of ['formal', 'polite', 'casual']) expect(itemsFor('level', set).length, set).toBeGreaterThanOrEqual(4)
    for (const set of ['verb', 'noun', 'particle', 'si']) expect(itemsFor('honor', set).length, set).toBeGreaterThanOrEqual(4)
  })
  it('the verb set exercises the suppletive honorific stems', () => {
    const verbAnswers = itemsFor('honor', 'verb').map((i) => i.answer).join(' ')
    const hit = HONORIFIC_VERBS.filter((stem) => verbAnswers.includes(stem))
    expect(hit.length, `covered: ${hit.join(',')}`).toBeGreaterThanOrEqual(8)
  })
})
```

- [ ] **Step 3: Run the full seed-invariant suite**

Run: `pnpm test -- tests/unit/register-transform/seed-invariants.test.ts`
Expected: PASS (per-item + coverage).

- [ ] **Step 4: Document the native-review gate + commit**

Add a one-line note to each seed file header that the batch awaits the Korean wife's review (edits land as follow-up commits).

```bash
git add app/seed/register-transform tests/unit/register-transform/seed-invariants.test.ts
git commit -m "content(register): full verified batch (~20 level + ~28 honor), 8-locale"
```

---

## Task 15: Final gates + manual smoke

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `pnpm test`
Expected: all green (the prior ~2844 + the new register tests).

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 3: Manual smoke (logged-in)** — start the dev server and verify in the browser:
  - `/practice` shows the **높임법 연구소** card; clicking it opens `/practice/register`.
  - `ModeTabs` switches 말단계 ↔ 높임말; the `SetPicker` shows the right sets per mode.
  - Picking a set starts an 8-question round; options shuffle; a wrong pick reveals the natural form + `why` + `trans`.
  - A wrong pick lands in `/log` under the **register** dimension (synthetic `source → answer`).
  - Replay-failed re-runs only the missed items; replays don't re-log.
  - Clearing a set at ≥70% fills its pip; clearing all 7 fires the 높임법 마스터 celebration; `register-lab.cleared` persists across reloads.
  - `?mode=honor&set=verb` deep-links straight into a focused round.

- [ ] **Step 4: Commit any fixes, then finish**

```bash
git add -A
git commit -m "chore(register): final gate fixes"
```

---

## Acceptance criteria (from the spec)

1. ✅ `RegisterMode`/`RegisterItem` + set defs in `app/lib/domain/register.ts` (re-exported); static `app/seed/register-transform/` with ~20 level + ~28 honor verified items; `itemsFor`/`buildRound`/`scoreOf`/set helpers pure + tested. (Tasks 1–5, 14)
2. ✅ `/practice/register` lab: two modes via `?mode=`, set picker via `?set=`, recognition rounds, 높임법 마스터 mastery, replay-failed, mistake-feed with `errorDimension='register'`; surfaced via a `GameCard`. (Tasks 6–13)
3. ✅ Seed invariants hold; content passed Korean-lens verification (single-correct-answer, no self-honorification); native-review gate documented. (Tasks 2, 14)
4. ✅ `pnpm test`/`typecheck`/`lint` green; engine + grammar seeds + Supabase untouched; no migration/DB. (Task 15)
