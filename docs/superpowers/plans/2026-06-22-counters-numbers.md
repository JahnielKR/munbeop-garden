# 수 분류사 연구소 (counters + numbers) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone recognition lab (`/practice/counters`, 수 분류사 연구소) where the user renders a count — picking the correct *prenominal native number + counter* (책 ×3 → 세 권) — exercising the native-vs-Sino system choice, the irregular prenominal form, and the right classifier together.

**Architecture:** A pure `numbers.ts` engine (golden-tested) renders native cardinal / native prenominal / Sino numbers. A static TS seed (`seed/counters/`) holds the broad counter catalog + count items. A `lib/counters/` drill layer mirrors `lib/cloze` (buildRound/optionsFor/scoreOf) plus a distractor generator that builds wrong-system / wrong-prenominal / wrong-counter options from the engine. A standalone lab clones the Step 9 cloze / Step 8 register shell with self-contained localStorage mastery — no catalog-SRS coupling, no migration.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). Package manager: **pnpm**.

**Spec:** `docs/superpowers/specs/2026-06-22-counters-numbers-design.md`

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`. Drill libs mirror `app/lib/cloze/drill.ts` (`itemId`, `itemsForKos`→here `itemsForSet`, `optionsFor`, `buildRound`, `scoreOf`, `DrillResult`). Mastery mirrors `app/composables/useConjugationMaster.ts` (localStorage `*.cleared`/`*.masterEarned`, sticky earned, `CLEAR_THRESHOLD=0.7`). Distractors mirror `app/lib/conjugation-drill/distractors.ts` (ordered candidates → dedup → filler fallback to exactly 3). Golden tests use `it.each(TABLE)` (see `tests/unit/korean/conjugate.test.ts`).
- `useI18n().t` is a key-echo stub in tests; reactivity primitives + `useLocalized` are test globals. `NuxtLink` → `<a href>` via `#components` stub.
- **vitest gotcha (Steps 11/12):** keep the SUT `import` at the TOP even with `vi.mock` below it (`import/first` lint). Type-only wrong-module imports pass vitest but fail `vue-tsc` → always `pnpm typecheck` before commit.
- i18n parity = per-feature test importing all 8 locale JSONs; add keys via a temp re-serialize script, deleted before commit.
- Single test: `pnpm exec vitest run <path>`. Full: `pnpm test`. `pnpm lint`. `pnpm typecheck`. The 8-locale seed helper is `L(en,es,fr,'pt-BR',th,id,vi,ja)` in `app/seed/locale.ts`.
- **No DB / migration.** Catalog/SRS/Supabase untouched. Lab is isolated (no `logStore`/`srsStore` writes).

---

## Task 1: Number engine — `numbers.ts`

**Files:**
- Create: `munbeop/app/lib/korean/numbers.ts`
- Modify: `munbeop/app/lib/korean/index.ts`
- Test: `munbeop/tests/unit/korean/numbers.test.ts`

- [ ] **Step 1: Write the failing golden test**

Create `munbeop/tests/unit/korean/numbers.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { nativeNumber, nativePrenominal, sinoNumber } from '~/lib/korean/numbers'

// Korean-verified golden rows: [n, native cardinal, native prenominal, sino].
const GOLDEN: [number, string, string, string][] = [
  [1, '하나', '한', '일'],
  [2, '둘', '두', '이'],
  [3, '셋', '세', '삼'],
  [4, '넷', '네', '사'],
  [5, '다섯', '다섯', '오'],
  [9, '아홉', '아홉', '구'],
  [10, '열', '열', '십'],
  [11, '열하나', '열한', '십일'],
  [14, '열넷', '열네', '십사'],
  [19, '열아홉', '열아홉', '십구'],
  [20, '스물', '스무', '이십'],
  [21, '스물하나', '스물한', '이십일'],
  [22, '스물둘', '스물두', '이십이'],
  [23, '스물셋', '스물세', '이십삼'],
  [24, '스물넷', '스물네', '이십사'],
  [30, '서른', '서른', '삼십'],
  [40, '마흔', '마흔', '사십'],
  [50, '쉰', '쉰', '오십'],
  [60, '예순', '예순', '육십'],
  [70, '일흔', '일흔', '칠십'],
  [80, '여든', '여든', '팔십'],
  [90, '아흔', '아흔', '구십'],
  [99, '아흔아홉', '아흔아홉', '구십구'],
]

describe('number engine (golden)', () => {
  it.each(GOLDEN)('%i → native/prenominal/sino', (n, native, prenom, sino) => {
    expect(nativeNumber(n)).toBe(native)
    expect(nativePrenominal(n)).toBe(prenom)
    expect(sinoNumber(n)).toBe(sino)
  })

  it('throws outside 1..99', () => {
    expect(() => nativeNumber(0)).toThrow()
    expect(() => sinoNumber(100)).toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/korean/numbers.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/korean/numbers"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/lib/korean/numbers.ts`:

```ts
// Native + Sino number rendering for the counter lab. 1..99 only (TOPIK-1 scope).
const NATIVE_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_PRENOM_ONES = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']
const SINO_ONES = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

function assertRange(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 99) {
    throw new Error(`number out of supported range 1..99: ${n}`)
  }
}

/** Native cardinal 1..99 (하나, 둘, … 스물셋, … 아흔아홉). */
export function nativeNumber(n: number): string {
  assertRange(n)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return NATIVE_TENS[tens]! + NATIVE_ONES[ones]!
}

/**
 * Native prenominal form (before a counter): 한/두/세/네, with the 20→스무
 * irregular (스무 살) — but 21..29 keep 스물 + prenominal ones (스물한).
 */
export function nativePrenominal(n: number): string {
  assertRange(n)
  if (n === 20) return '스무'
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return NATIVE_TENS[tens]! + NATIVE_PRENOM_ONES[ones]!
}

/** Sino-Korean 1..99 (일, … 십, 십일, 이십삼, …). No prenominal irregular. */
export function sinoNumber(n: number): string {
  assertRange(n)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const tensPart = tens === 0 ? '' : tens === 1 ? '십' : SINO_ONES[tens]! + '십'
  return tensPart + SINO_ONES[ones]!
}
```

- [ ] **Step 4: Export from the korean barrel**

Modify `munbeop/app/lib/korean/index.ts` — add the export. (First read the file to see its exact lines, then append `export * from './numbers'` alongside the existing `export * from './conjugate'` etc.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/korean/numbers.test.ts`
Expected: PASS (23 golden rows + the range guard).

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/korean/numbers.ts munbeop/app/lib/korean/index.ts munbeop/tests/unit/korean/numbers.test.ts
git commit -m "feat(counters): native/Sino number engine with prenominal irregular (pure)"
```

---

## Task 2: Domain types + counter seed

**Files:**
- Modify: `munbeop/app/lib/domain/counters.ts` (create) + `munbeop/app/lib/domain/index.ts`
- Create: `munbeop/app/seed/counters/catalog.ts`, `munbeop/app/seed/counters/items.ts`, `munbeop/app/seed/counters/index.ts`
- Test: `munbeop/tests/unit/counters/seed-invariants.test.ts`

- [ ] **Step 1: Write the domain types**

Create `munbeop/app/lib/domain/counters.ts`:

```ts
import type { LocalizedString } from './i18n'

export type NumberSystem = 'native' | 'sino'

/** A classifier/counter and the number system it takes. */
export interface Counter {
  /** Unique id (disambiguates the 분/번 homographs: 'bun-people' vs 'bun-minutes'). */
  id: string
  /** Display form, e.g. "권" (may repeat across ids for 분/번). NOT translated. */
  ko: string
  system: NumberSystem
  /** What it counts. */
  gloss: LocalizedString
  /** Typical counted nouns (Korean). NOT translated. */
  nounExamples: string[]
}

/** One "render the count" drill item. */
export interface CountItem {
  /** FK → Counter.id. */
  counterId: string
  /** 1..99. */
  quantity: number
  /** The counted noun shown in the prompt (Korean). NOT translated. */
  noun: string
  system: NumberSystem
  /** The correct rendered count, e.g. "세 권" (= prenominal/sino number + " " + counter ko). */
  answer: string
  /** Gloss of the whole quantity, e.g. "three books". */
  trans: LocalizedString
}
```

Add to `munbeop/app/lib/domain/index.ts`: `export * from './counters'` (read the file first; append alongside the other `export * from './…'` lines).

- [ ] **Step 2: Write the failing seed-invariant test**

Create `munbeop/tests/unit/counters/seed-invariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { COUNTERS, COUNT_ITEMS, counterById } from '~/seed/counters'
import { nativePrenominal, sinoNumber } from '~/lib/korean'
import { LOCALE_CODES } from '~/lib/domain'

describe('counter seed invariants', () => {
  it('every counter id is unique', () => {
    const ids = COUNTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the ambiguous 분 (people/minutes) and 번 (times/ordinal) splits', () => {
    const byKoSystem = (ko: string, sys: string) => COUNTERS.some((c) => c.ko === ko && c.system === sys)
    expect(byKoSystem('분', 'native')).toBe(true) // honorific people: 세 분
    expect(byKoSystem('분', 'sino')).toBe(true) // minutes: 삼 분
    expect(byKoSystem('번', 'native')).toBe(true) // N times: 세 번
    expect(byKoSystem('번', 'sino')).toBe(true) // ordinal: 삼 번
  })

  it('every item references a real counter with a matching system', () => {
    for (const it of COUNT_ITEMS) {
      const c = counterById(it.counterId)
      expect(c, it.counterId).toBeTruthy()
      expect(it.system, `${it.counterId} system`).toBe(c!.system)
    }
  })

  it("every item's answer is exactly the engine-rendered number + ' ' + counter ko", () => {
    for (const it of COUNT_ITEMS) {
      const c = counterById(it.counterId)!
      const num = it.system === 'native' ? nativePrenominal(it.quantity) : sinoNumber(it.quantity)
      expect(it.answer, `${it.counterId} ${it.quantity}`).toBe(`${num} ${c.ko}`)
    }
  })

  it('every item trans is present in all 8 locales', () => {
    for (const it of COUNT_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.counterId} ${it.quantity} ${code}`).toBeTruthy()
      }
    }
  })

  it('every counter has at least one item', () => {
    const used = new Set(COUNT_ITEMS.map((i) => i.counterId))
    for (const c of COUNTERS) expect(used.has(c.id), `${c.id} has no items`).toBe(true)
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/counters/seed-invariants.test.ts`
Expected: FAIL — `Failed to resolve import "~/seed/counters"`.

- [ ] **Step 4: Write the catalog**

Create `munbeop/app/seed/counters/catalog.ts` (broad first batch; `L` from `~/seed/locale`):

```ts
import type { Counter } from '~/lib/domain'
import { L } from '~/seed/locale'

export const COUNTERS: Counter[] = [
  // — Native-counted —
  { id: 'gae', ko: '개', system: 'native', gloss: L('general things', 'cosas en general', 'objets', 'coisas em geral', 'สิ่งของทั่วไป', 'benda umum', 'vật nói chung', '一般の物'), nounExamples: ['사과', '책상', '컵'] },
  { id: 'myeong', ko: '명', system: 'native', gloss: L('people (plain)', 'personas (llano)', 'personnes', 'pessoas', 'คน (ทั่วไป)', 'orang (biasa)', 'người (thường)', '人（普通）'), nounExamples: ['학생', '친구', '사람'] },
  { id: 'bun-people', ko: '분', system: 'native', gloss: L('people (honorific)', 'personas (honorífico)', 'personnes (honorifique)', 'pessoas (honorífico)', 'คน (ยกย่อง)', 'orang (hormat)', 'người (kính ngữ)', '人（敬語）'), nounExamples: ['선생님', '손님', '할머니'] },
  { id: 'mari', ko: '마리', system: 'native', gloss: L('animals', 'animales', 'animaux', 'animais', 'สัตว์', 'hewan', 'con vật', '動物'), nounExamples: ['개', '고양이', '물고기'] },
  { id: 'gwon', ko: '권', system: 'native', gloss: L('books/volumes', 'libros/volúmenes', 'livres', 'livros', 'เล่ม (หนังสือ)', 'buku/jilid', 'quyển sách', '冊'), nounExamples: ['책', '공책', '사전'] },
  { id: 'jang', ko: '장', system: 'native', gloss: L('flat sheets', 'hojas planas', 'feuilles', 'folhas', 'แผ่น', 'lembar', 'tờ', '枚'), nounExamples: ['종이', '표', '사진'] },
  { id: 'jan', ko: '잔', system: 'native', gloss: L('cups/glasses', 'tazas/vasos', 'tasses/verres', 'xícaras/copos', 'แก้ว/ถ้วย', 'cangkir/gelas', 'cốc/ly', '杯'), nounExamples: ['커피', '물', '차'] },
  { id: 'byeong', ko: '병', system: 'native', gloss: L('bottles', 'botellas', 'bouteilles', 'garrafas', 'ขวด', 'botol', 'chai', '本（瓶）'), nounExamples: ['맥주', '물', '우유'] },
  { id: 'sal', ko: '살', system: 'native', gloss: L('years of age', 'años de edad', 'ans (âge)', 'anos de idade', 'ขวบ/ปี (อายุ)', 'tahun (usia)', 'tuổi', '歳'), nounExamples: ['아기', '아이', '학생'] },
  { id: 'si', ko: '시', system: 'native', gloss: L("o'clock", 'en punto', 'heures', 'horas (relógio)', 'นาฬิกา (โมง)', 'pukul', 'giờ (đồng hồ)', '時'), nounExamples: ['아침', '오후', '저녁'] },
  { id: 'sigan', ko: '시간', system: 'native', gloss: L('hours (duration)', 'horas (duración)', 'heures (durée)', 'horas (duração)', 'ชั่วโมง (ระยะเวลา)', 'jam (durasi)', 'tiếng (thời lượng)', '時間'), nounExamples: ['공부', '운동', '회의'] },
  { id: 'dae', ko: '대', system: 'native', gloss: L('machines/vehicles', 'máquinas/vehículos', 'machines/véhicules', 'máquinas/veículos', 'คัน/เครื่อง', 'mesin/kendaraan', 'chiếc (máy/xe)', '台'), nounExamples: ['자동차', '컴퓨터', '자전거'] },
  { id: 'kyeolle', ko: '켤레', system: 'native', gloss: L('pairs (footwear)', 'pares (calzado)', 'paires (chaussures)', 'pares (calçado)', 'คู่ (รองเท้า)', 'pasang (alas kaki)', 'đôi (giày dép)', '足（履物）'), nounExamples: ['신발', '양말', '구두'] },
  { id: 'beol', ko: '벌', system: 'native', gloss: L('suits/sets of clothes', 'trajes/conjuntos', 'ensembles (vêtements)', 'conjuntos de roupa', 'ชุด (เสื้อผ้า)', 'setel (pakaian)', 'bộ (quần áo)', '着（衣服）'), nounExamples: ['옷', '정장', '한복'] },
  { id: 'beon-times', ko: '번', system: 'native', gloss: L('times (frequency)', 'veces', 'fois', 'vezes', 'ครั้ง', 'kali', 'lần', '回'), nounExamples: ['시도', '경험', '여행'] },
  // — Sino-counted —
  { id: 'bun-minutes', ko: '분', system: 'sino', gloss: L('minutes', 'minutos', 'minutes', 'minutos', 'นาที', 'menit', 'phút', '分'), nounExamples: ['시간', '수업', '운동'] },
  { id: 'won', ko: '원', system: 'sino', gloss: L('won (currency)', 'wones', 'wons', 'wons', 'วอน', 'won', 'won', 'ウォン'), nounExamples: ['커피', '책', '밥'] },
  { id: 'beon-ordinal', ko: '번', system: 'sino', gloss: L('number N (ordinal)', 'número N', 'numéro N', 'número N', 'หมายเลข/อันดับ', 'nomor N', 'số N', '番'), nounExamples: ['버스', '문제', '방'] },
  { id: 'cheung', ko: '층', system: 'sino', gloss: L('floors', 'pisos', 'étages', 'andares', 'ชั้น (อาคาร)', 'lantai', 'tầng', '階'), nounExamples: ['건물', '백화점', '아파트'] },
  { id: 'inbun', ko: '인분', system: 'sino', gloss: L('food portions', 'porciones', 'portions', 'porções', 'ที่ (อาหาร)', 'porsi', 'phần ăn', '人前'), nounExamples: ['갈비', '삼겹살', '냉면'] },
  { id: 'pyeji', ko: '페이지', system: 'sino', gloss: L('pages', 'páginas', 'pages', 'páginas', 'หน้า', 'halaman', 'trang', 'ページ'), nounExamples: ['책', '보고서', '소설'] },
]

const BY_ID = new Map(COUNTERS.map((c) => [c.id, c]))
export function counterById(id: string): Counter | undefined {
  return BY_ID.get(id)
}
```

- [ ] **Step 5: Write the count items**

Create `munbeop/app/seed/counters/items.ts`. Author 2 items per counter (every `answer` MUST equal `nativePrenominal(q)`/`sinoNumber(q)` + ' ' + counter ko — the Task 2 test enforces this; the values below were rendered with the Task 1 engine):

```ts
import type { CountItem } from '~/lib/domain'
import { L } from '~/seed/locale'

export const COUNT_ITEMS: CountItem[] = [
  // 개
  { counterId: 'gae', quantity: 3, noun: '사과', system: 'native', answer: '세 개', trans: L('three apples', 'tres manzanas', 'trois pommes', 'três maçãs', 'แอปเปิล 3 ผล', 'tiga apel', 'ba quả táo', 'りんご3個') },
  { counterId: 'gae', quantity: 5, noun: '컵', system: 'native', answer: '다섯 개', trans: L('five cups', 'cinco vasos', 'cinq tasses', 'cinco copos', 'ถ้วย 5 ใบ', 'lima cangkir', 'năm cái cốc', 'コップ5個') },
  // 명
  { counterId: 'myeong', quantity: 4, noun: '학생', system: 'native', answer: '네 명', trans: L('four students', 'cuatro estudiantes', 'quatre élèves', 'quatro estudantes', 'นักเรียน 4 คน', 'empat siswa', 'bốn học sinh', '学生4名') },
  { counterId: 'myeong', quantity: 2, noun: '친구', system: 'native', answer: '두 명', trans: L('two friends', 'dos amigos', 'deux amis', 'dois amigos', 'เพื่อน 2 คน', 'dua teman', 'hai người bạn', '友達2名') },
  // 분 (honorific people)
  { counterId: 'bun-people', quantity: 3, noun: '선생님', system: 'native', answer: '세 분', trans: L('three teachers (hon.)', 'tres profesores (hon.)', 'trois professeurs (hon.)', 'três professores (hon.)', 'ครู 3 ท่าน', 'tiga guru (hormat)', 'ba thầy/cô', '先生3名様') },
  { counterId: 'bun-people', quantity: 1, noun: '손님', system: 'native', answer: '한 분', trans: L('one guest (hon.)', 'un invitado (hon.)', 'un invité (hon.)', 'um convidado (hon.)', 'แขก 1 ท่าน', 'satu tamu (hormat)', 'một vị khách', 'お客様1名') },
  // 마리
  { counterId: 'mari', quantity: 2, noun: '고양이', system: 'native', answer: '두 마리', trans: L('two cats', 'dos gatos', 'deux chats', 'dois gatos', 'แมว 2 ตัว', 'dua kucing', 'hai con mèo', '猫2匹') },
  { counterId: 'mari', quantity: 7, noun: '물고기', system: 'native', answer: '일곱 마리', trans: L('seven fish', 'siete peces', 'sept poissons', 'sete peixes', 'ปลา 7 ตัว', 'tujuh ikan', 'bảy con cá', '魚7匹') },
  // 권
  { counterId: 'gwon', quantity: 3, noun: '책', system: 'native', answer: '세 권', trans: L('three books', 'tres libros', 'trois livres', 'três livros', 'หนังสือ 3 เล่ม', 'tiga buku', 'ba quyển sách', '本3冊') },
  { counterId: 'gwon', quantity: 10, noun: '공책', system: 'native', answer: '열 권', trans: L('ten notebooks', 'diez cuadernos', 'dix cahiers', 'dez cadernos', 'สมุด 10 เล่ม', 'sepuluh buku tulis', 'mười quyển vở', 'ノート10冊') },
  // 장
  { counterId: 'jang', quantity: 4, noun: '종이', system: 'native', answer: '네 장', trans: L('four sheets of paper', 'cuatro hojas', 'quatre feuilles', 'quatro folhas', 'กระดาษ 4 แผ่น', 'empat lembar kertas', 'bốn tờ giấy', '紙4枚') },
  { counterId: 'jang', quantity: 2, noun: '사진', system: 'native', answer: '두 장', trans: L('two photos', 'dos fotos', 'deux photos', 'duas fotos', 'รูป 2 ใบ', 'dua foto', 'hai tấm ảnh', '写真2枚') },
  // 잔
  { counterId: 'jan', quantity: 1, noun: '커피', system: 'native', answer: '한 잔', trans: L('one coffee', 'un café', 'un café', 'um café', 'กาแฟ 1 แก้ว', 'satu kopi', 'một ly cà phê', 'コーヒー1杯') },
  { counterId: 'jan', quantity: 3, noun: '물', system: 'native', answer: '세 잔', trans: L('three glasses of water', 'tres vasos de agua', "trois verres d'eau", 'três copos de água', 'น้ำ 3 แก้ว', 'tiga gelas air', 'ba ly nước', '水3杯') },
  // 병
  { counterId: 'byeong', quantity: 2, noun: '맥주', system: 'native', answer: '두 병', trans: L('two bottles of beer', 'dos cervezas', 'deux bières', 'duas cervejas', 'เบียร์ 2 ขวด', 'dua botol bir', 'hai chai bia', 'ビール2本') },
  { counterId: 'byeong', quantity: 6, noun: '물', system: 'native', answer: '여섯 병', trans: L('six bottles of water', 'seis botellas de agua', "six bouteilles d'eau", 'seis garrafas de água', 'น้ำ 6 ขวด', 'enam botol air', 'sáu chai nước', '水6本') },
  // 살
  { counterId: 'sal', quantity: 20, noun: '학생', system: 'native', answer: '스무 살', trans: L('twenty years old', 'veinte años', 'vingt ans', 'vinte anos', 'อายุ 20 ปี', 'dua puluh tahun', 'hai mươi tuổi', '20歳') },
  { counterId: 'sal', quantity: 7, noun: '아이', system: 'native', answer: '일곱 살', trans: L('seven years old', 'siete años', 'sept ans', 'sete anos', 'อายุ 7 ขวบ', 'tujuh tahun', 'bảy tuổi', '7歳') },
  // 시 (o'clock)
  { counterId: 'si', quantity: 3, noun: '오후', system: 'native', answer: '세 시', trans: L('three o’clock', 'las tres', 'trois heures', 'três horas', 'บ่าย 3 โมง', 'pukul tiga', 'ba giờ', '3時') },
  { counterId: 'si', quantity: 9, noun: '아침', system: 'native', answer: '아홉 시', trans: L('nine o’clock', 'las nueve', 'neuf heures', 'nove horas', '9 โมง', 'pukul sembilan', 'chín giờ', '9時') },
  // 시간 (duration)
  { counterId: 'sigan', quantity: 2, noun: '공부', system: 'native', answer: '두 시간', trans: L('two hours', 'dos horas', 'deux heures', 'duas horas', '2 ชั่วโมง', 'dua jam', 'hai tiếng', '2時間') },
  { counterId: 'sigan', quantity: 4, noun: '회의', system: 'native', answer: '네 시간', trans: L('four hours', 'cuatro horas', 'quatre heures', 'quatro horas', '4 ชั่วโมง', 'empat jam', 'bốn tiếng', '4時間') },
  // 대
  { counterId: 'dae', quantity: 2, noun: '자동차', system: 'native', answer: '두 대', trans: L('two cars', 'dos coches', 'deux voitures', 'dois carros', 'รถ 2 คัน', 'dua mobil', 'hai chiếc xe', '車2台') },
  { counterId: 'dae', quantity: 3, noun: '컴퓨터', system: 'native', answer: '세 대', trans: L('three computers', 'tres computadoras', 'trois ordinateurs', 'três computadores', 'คอมพิวเตอร์ 3 เครื่อง', 'tiga komputer', 'ba máy tính', 'パソコン3台') },
  // 켤레
  { counterId: 'kyeolle', quantity: 2, noun: '신발', system: 'native', answer: '두 켤레', trans: L('two pairs of shoes', 'dos pares de zapatos', 'deux paires de chaussures', 'dois pares de sapatos', 'รองเท้า 2 คู่', 'dua pasang sepatu', 'hai đôi giày', '靴2足') },
  { counterId: 'kyeolle', quantity: 4, noun: '양말', system: 'native', answer: '네 켤레', trans: L('four pairs of socks', 'cuatro pares de calcetines', 'quatre paires de chaussettes', 'quatro pares de meias', 'ถุงเท้า 4 คู่', 'empat pasang kaus kaki', 'bốn đôi tất', '靴下4足') },
  // 벌
  { counterId: 'beol', quantity: 3, noun: '옷', system: 'native', answer: '세 벌', trans: L('three sets of clothes', 'tres conjuntos de ropa', 'trois ensembles de vêtements', 'três conjuntos de roupa', 'เสื้อผ้า 3 ชุด', 'tiga setel pakaian', 'ba bộ quần áo', '服3着') },
  { counterId: 'beol', quantity: 1, noun: '정장', system: 'native', answer: '한 벌', trans: L('one suit', 'un traje', 'un costume', 'um terno', 'สูท 1 ชุด', 'satu setelan jas', 'một bộ vest', 'スーツ1着') },
  // 번 (times)
  { counterId: 'beon-times', quantity: 3, noun: '시도', system: 'native', answer: '세 번', trans: L('three times', 'tres veces', 'trois fois', 'três vezes', '3 ครั้ง', 'tiga kali', 'ba lần', '3回') },
  { counterId: 'beon-times', quantity: 2, noun: '여행', system: 'native', answer: '두 번', trans: L('two times', 'dos veces', 'deux fois', 'duas vezes', '2 ครั้ง', 'dua kali', 'hai lần', '2回') },
  // 분 (minutes — SINO)
  { counterId: 'bun-minutes', quantity: 3, noun: '수업', system: 'sino', answer: '삼 분', trans: L('three minutes', 'tres minutos', 'trois minutes', 'três minutos', '3 นาที', 'tiga menit', 'ba phút', '3分') },
  { counterId: 'bun-minutes', quantity: 30, noun: '운동', system: 'sino', answer: '삼십 분', trans: L('thirty minutes', 'treinta minutos', 'trente minutes', 'trinta minutos', '30 นาที', 'tiga puluh menit', 'ba mươi phút', '30分') },
  // 원
  { counterId: 'won', quantity: 50, noun: '사탕', system: 'sino', answer: '오십 원', trans: L('fifty won', 'cincuenta wones', 'cinquante wons', 'cinquenta wons', '50 วอน', 'lima puluh won', 'năm mươi won', '50ウォン') },
  { counterId: 'won', quantity: 99, noun: '거스름돈', system: 'sino', answer: '구십구 원', trans: L('ninety-nine won', 'noventa y nueve wones', 'quatre-vingt-dix-neuf wons', 'noventa e nove wons', '99 วอน', 'sembilan puluh sembilan won', 'chín mươi chín won', '99ウォン') },
  // 번 (ordinal — SINO)
  { counterId: 'beon-ordinal', quantity: 7, noun: '버스', system: 'sino', answer: '칠 번', trans: L('number 7 (bus)', 'número 7 (autobús)', 'numéro 7 (bus)', 'número 7 (ônibus)', 'สาย 7 (รถเมล์)', 'nomor 7 (bus)', 'số 7 (xe buýt)', '7番（バス）') },
  { counterId: 'beon-ordinal', quantity: 3, noun: '문제', system: 'sino', answer: '삼 번', trans: L('number 3 (question)', 'número 3 (pregunta)', 'numéro 3 (question)', 'número 3 (questão)', 'ข้อ 3 (คำถาม)', 'nomor 3 (soal)', 'câu số 3', '3番（問題）') },
  // 층
  { counterId: 'cheung', quantity: 5, noun: '건물', system: 'sino', answer: '오 층', trans: L('fifth floor', 'quinto piso', 'cinquième étage', 'quinto andar', 'ชั้น 5', 'lantai 5', 'tầng 5', '5階') },
  { counterId: 'cheung', quantity: 10, noun: '백화점', system: 'sino', answer: '십 층', trans: L('tenth floor', 'décimo piso', 'dixième étage', 'décimo andar', 'ชั้น 10', 'lantai 10', 'tầng 10', '10階') },
  // 인분
  { counterId: 'inbun', quantity: 2, noun: '갈비', system: 'sino', answer: '이 인분', trans: L('two portions', 'dos porciones', 'deux portions', 'duas porções', '2 ที่', 'dua porsi', 'hai phần', '2人前') },
  { counterId: 'inbun', quantity: 3, noun: '삼겹살', system: 'sino', answer: '삼 인분', trans: L('three portions', 'tres porciones', 'trois portions', 'três porções', '3 ที่', 'tiga porsi', 'ba phần', '3人前') },
  // 페이지
  { counterId: 'pyeji', quantity: 8, noun: '책', system: 'sino', answer: '팔 페이지', trans: L('eight pages', 'ocho páginas', 'huit pages', 'oito páginas', '8 หน้า', 'delapan halaman', 'tám trang', '8ページ') },
  { counterId: 'pyeji', quantity: 12, noun: '보고서', system: 'sino', answer: '십이 페이지', trans: L('twelve pages', 'doce páginas', 'douze pages', 'doze páginas', '12 หน้า', 'dua belas halaman', 'mười hai trang', '12ページ') },
]
```

Create `munbeop/app/seed/counters/index.ts`:

```ts
export { COUNTERS, counterById } from './catalog'
export { COUNT_ITEMS } from './items'
```

- [ ] **Step 6: Run the seed-invariant test to verify it passes**

Run: `pnpm exec vitest run tests/unit/counters/seed-invariants.test.ts`
Expected: PASS. **If the `answer === engine + ' ' + ko` test fails on any row, the authored `answer` is wrong — fix the row to match `nativePrenominal`/`sinoNumber` (this is the mechanical Korean-correctness gate).**

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/domain/counters.ts munbeop/app/lib/domain/index.ts munbeop/app/seed/counters munbeop/tests/unit/counters/seed-invariants.test.ts
git commit -m "feat(counters): Counter/CountItem domain + broad seed (incl. 분/번 splits)"
```

> **Content note:** This is the verified first batch (2 items/counter, all 21 counters). The wife native-review is the documented final semantic gate (per Steps 8/9). Later batches add more items per counter — gated by the same seed-invariant test.

---

## Task 3: Drill logic + distractors

**Files:**
- Create: `munbeop/app/lib/counters/drill.ts`, `munbeop/app/lib/counters/distractors.ts`, `munbeop/app/lib/counters/index.ts`
- Test: `munbeop/tests/unit/counters/drill.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/counters/drill.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildDistractors, optionsFor, itemId, scoreOf } from '~/lib/counters'
import { COUNTERS, COUNT_ITEMS, counterById } from '~/seed/counters'
import type { CountItem } from '~/lib/domain'

const find = (counterId: string) => COUNT_ITEMS.find((i) => i.counterId === counterId)!

describe('buildDistractors', () => {
  it('returns exactly 3 distinct distractors, none equal to the answer', () => {
    for (const it of COUNT_ITEMS) {
      const ds = buildDistractors(it, COUNTERS)
      expect(ds, `${it.counterId} ${it.quantity}`).toHaveLength(3)
      expect(new Set(ds).size).toBe(3)
      expect(ds).not.toContain(it.answer)
    }
  })

  it('includes a wrong-system and a wrong-prenominal form for a native item where they differ', () => {
    const it = find('gwon') // 세 권 (quantity 3, native)
    const ds = buildDistractors(it, COUNTERS)
    expect(ds).toContain('삼 권') // wrong system (Sino)
    expect(ds).toContain('셋 권') // wrong prenominal (native cardinal)
  })
})

describe('optionsFor / scoreOf / itemId', () => {
  it('optionsFor puts the answer first then 3 distractors', () => {
    const it = find('myeong')
    const opts = optionsFor(it, COUNTERS)
    expect(opts[0]).toBe(it.answer)
    expect(opts).toHaveLength(4)
  })
  it('itemId is stable and unique per item', () => {
    const ids = COUNT_ITEMS.map(itemId)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('scoreOf computes accuracy', () => {
    expect(scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])).toEqual({
      correct: 1, total: 2, accuracy: 0.5,
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/counters/drill.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/counters"`.

- [ ] **Step 3: Write the distractor generator**

Create `munbeop/app/lib/counters/distractors.ts`:

```ts
import type { Counter, CountItem } from '~/lib/domain'
import { nativeNumber, nativePrenominal, sinoNumber } from '~/lib/korean'
import { counterById } from '~/seed/counters'

function render(quantity: number, system: 'native' | 'sino', ko: string): string {
  const num = system === 'native' ? nativePrenominal(quantity) : sinoNumber(quantity)
  return `${num} ${ko}`
}

/**
 * Three wrong renderings for a count, in priority order:
 *  1. wrong system  — render with the OTHER number system (세 권 → 삼 권)
 *  2. wrong prenominal — native cardinal instead of prenominal (세 권 → 셋 권)
 *  3. wrong counter — same number, a sibling counter of the same system (세 권 → 세 개)
 * Deduped, never equal to the answer; cross-counter fillers guarantee exactly 3.
 */
export function buildDistractors(item: CountItem, counters: readonly Counter[]): string[] {
  const self = counterById(item.counterId)
  const ko = self?.ko ?? item.answer.split(' ').slice(1).join(' ')

  const wrongSystem = render(item.quantity, item.system === 'native' ? 'sino' : 'native', ko)
  const wrongPrenominal = item.system === 'native' ? `${nativeNumber(item.quantity)} ${ko}` : null

  const seen = new Set<string>([item.answer])
  const picked: string[] = []
  const tryAdd = (s: string | null) => {
    if (!s || seen.has(s)) return
    seen.add(s)
    picked.push(s)
  }

  tryAdd(wrongSystem)
  tryAdd(wrongPrenominal)

  // wrong counter: same number (item's own system), a different counter's ko —
  // same-system counters first for plausibility, then any.
  const sameSystem = counters.filter((c) => c.ko !== ko && c.system === item.system)
  const other = counters.filter((c) => c.ko !== ko && c.system !== item.system)
  for (const c of [...sameSystem, ...other]) {
    if (picked.length >= 3) break
    const num = item.system === 'native' ? nativePrenominal(item.quantity) : sinoNumber(item.quantity)
    tryAdd(`${num} ${c.ko}`)
  }
  return picked.slice(0, 3)
}
```

- [ ] **Step 4: Write the drill helpers**

Create `munbeop/app/lib/counters/drill.ts`:

```ts
import type { Counter, CountItem } from '~/lib/domain'
import { COUNT_ITEMS } from '~/seed/counters'
import { buildDistractors } from './distractors'

/** Stable per-item id (CountItem has no id field). */
export function itemId(i: CountItem): string {
  return `${i.counterId}::${i.quantity}::${i.noun}`
}

/** Items whose counter id is in the given set. */
export function itemsForSet(counterIds: string[], source: CountItem[] = COUNT_ITEMS): CountItem[] {
  const set = new Set(counterIds)
  return source.filter((i) => set.has(i.counterId))
}

/** Answer first, then the 3 distractors (the composable shuffles for display). */
export function optionsFor(item: CountItem, counters: readonly Counter[]): string[] {
  return [item.answer, ...buildDistractors(item, counters)]
}

export function buildRound(
  counterIds: string[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: CountItem[] = COUNT_ITEMS,
): CountItem[] {
  return shuffleFn(itemsForSet(counterIds, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
```

Create `munbeop/app/lib/counters/index.ts`:

```ts
export * from './drill'
export * from './distractors'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/counters/drill.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/counters munbeop/tests/unit/counters/drill.test.ts
git commit -m "feat(counters): drill helpers + wrong-system/prenominal/counter distractors"
```

---

## Task 4: Sets + mastery + `useCounterDrill`

**Files:**
- Create: `munbeop/app/lib/counters/sets.ts` (+ export from index), `munbeop/app/lib/counters/master.ts`
- Create: `munbeop/app/composables/useCounterDrill.ts`, `munbeop/app/composables/useCounterMaster.ts`
- Test: `munbeop/tests/unit/counters/sets-master.test.ts`, `munbeop/tests/unit/counters/useCounterDrill.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `munbeop/tests/unit/counters/sets-master.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { COUNTER_SETS, masteryOf, MASTER_SET_IDS } from '~/lib/counters/sets'
import { COUNTERS } from '~/seed/counters'

describe('counter sets', () => {
  it('every set references real counter ids and every counter is in some set', () => {
    const allIds = new Set(COUNTERS.map((c) => c.id))
    const used = new Set<string>()
    for (const s of COUNTER_SETS) {
      for (const id of s.counterIds) {
        expect(allIds.has(id), `${s.id} → ${id}`).toBe(true)
        used.add(id)
      }
    }
    for (const c of COUNTERS) expect(used.has(c.id), `${c.id} in no set`).toBe(true)
  })
})

describe('masteryOf', () => {
  it('earned only when every set is cleared', () => {
    expect(masteryOf(new Set()).earned).toBe(false)
    expect(masteryOf(new Set(MASTER_SET_IDS)).earned).toBe(true)
  })
})
```

Create `munbeop/tests/unit/counters/useCounterDrill.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterDrill } from '~/composables/useCounterDrill'
import { COUNTER_SETS } from '~/lib/counters/sets'

beforeEach(() => setActivePinia(createPinia()))

describe('useCounterDrill', () => {
  it('starts a round for a set with 4 options, answer included', () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    expect(d.phase.value).toBe('question')
    expect(d.displayOptions.value).toHaveLength(4)
    expect(d.displayOptions.value).toContain(d.item.value.answer)
  })

  it('a wrong answer sets phase=wrong; a right answer phase=right', async () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    const wrong = d.displayOptions.value.find((o) => o !== d.item.value.answer)!
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
  })

  it('replayFailed re-drills only the missed items', async () => {
    const d = useCounterDrill()
    d.selectSet(COUNTER_SETS[0]!.id)
    d.start()
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(d.displayOptions.value.find((o) => o !== it.answer)!)
      else await d.answer(it.answer)
      await d.next()
    }
    expect(d.failedItems.value.length).toBe(1)
    d.replayFailed()
    expect(d.runMode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/unit/counters/sets-master.test.ts tests/unit/counters/useCounterDrill.test.ts`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Write sets + mastery**

Create `munbeop/app/lib/counters/sets.ts`:

```ts
export interface CounterSet {
  id: string
  /** Korean label for the set (shown as-is). */
  ko: string
  /** i18n key for the localized label. */
  labelKey: string
  counterIds: string[]
}

export const COUNTER_SETS: CounterSet[] = [
  { id: 'people-animals', ko: '사람·동물', labelKey: 'counters.set.people_animals', counterIds: ['myeong', 'bun-people', 'mari'] },
  { id: 'books-paper', ko: '책·종이', labelKey: 'counters.set.books_paper', counterIds: ['gwon', 'jang', 'pyeji'] },
  { id: 'food-drink', ko: '음식·음료', labelKey: 'counters.set.food_drink', counterIds: ['jan', 'byeong', 'inbun'] },
  { id: 'time-age', ko: '시간·나이', labelKey: 'counters.set.time_age', counterIds: ['si', 'sigan', 'sal', 'bun-minutes'] },
  { id: 'things', ko: '사물', labelKey: 'counters.set.things', counterIds: ['gae', 'dae', 'kyeolle', 'beol'] },
  { id: 'money-order', ko: '돈·순서', labelKey: 'counters.set.money_order', counterIds: ['won', 'cheung', 'beon-ordinal', 'beon-times'] },
]

export const MASTER_SET_IDS = COUNTER_SETS.map((s) => s.id)

export interface SetProgress { id: string; ko: string; done: boolean }

export function masteryOf(cleared: Set<string>) {
  const perSet: SetProgress[] = COUNTER_SETS.map((s) => ({ id: s.id, ko: s.ko, done: cleared.has(s.id) }))
  const doneCount = perSet.filter((p) => p.done).length
  return { perSet, doneCount, total: MASTER_SET_IDS.length, earned: doneCount === MASTER_SET_IDS.length }
}
```

Add to `munbeop/app/lib/counters/index.ts`: `export * from './sets'`.

Create `munbeop/app/composables/useCounterMaster.ts` (clone of `useConjugationMaster`, keyed for this lab):

```ts
import { computed, ref } from 'vue'
import { masteryOf } from '~/lib/counters/sets'

const STORAGE_KEY = 'counter-lab.cleared'
const EARNED_KEY = 'counter-lab.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useCounterMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const earnedSticky = ref(typeof localStorage !== 'undefined' && !!localStorage.getItem(EARNED_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perSet = computed(() => view.value.perSet)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned || earnedSticky.value)

  function recordRound(setId: string, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(setId)) return
    const next = new Set(cleared.value)
    next.add(setId)
    cleared.value = next
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
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

- [ ] **Step 4: Write `useCounterDrill`**

Create `munbeop/app/composables/useCounterDrill.ts` (mirrors `useClozeDrill`, self-contained — no log/SRS):

```ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, optionsFor, scoreOf, itemId, type DrillResult } from '~/lib/counters'
import { COUNTER_SETS } from '~/lib/counters/sets'
import { COUNTERS } from '~/seed/counters'
import type { CountItem } from '~/lib/domain'
import { useCounterMaster } from '~/composables/useCounterMaster'

export type CounterPhase = 'question' | 'right' | 'wrong' | 'done'
export type CounterRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

export function useCounterDrill() {
  const master = useCounterMaster()

  const selectedSetId = ref<string>(COUNTER_SETS[0]!.id)
  const sessionItems = ref<CountItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<CounterRunMode>('normal')
  const index = ref(0)
  const phase = ref<CounterPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<CountItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )
  const counterIdsOf = (setId: string) => COUNTER_SETS.find((s) => s.id === setId)?.counterIds ?? []

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value, COUNTERS))
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }

  function selectSet(id: string) {
    selectedSetId.value = id
  }

  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(counterIdsOf(selectedSetId.value), ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) shuffleOptions()
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
  }

  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      if (runMode.value === 'normal') master.recordRound(selectedSetId.value, score.value.accuracy)
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    shuffleOptions()
  }

  return {
    selectedSetId, sessionItems, displayOptions, runMode, index, phase, picked,
    item, score, failedItems,
    selectSet, start, replayFailed, answer, next,
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/unit/counters/sets-master.test.ts tests/unit/counters/useCounterDrill.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/counters/sets.ts munbeop/app/lib/counters/master.ts munbeop/app/lib/counters/index.ts munbeop/app/composables/useCounterDrill.ts munbeop/app/composables/useCounterMaster.ts munbeop/tests/unit/counters/sets-master.test.ts munbeop/tests/unit/counters/useCounterDrill.test.ts
git commit -m "feat(counters): sets + self-contained mastery + useCounterDrill"
```

> Note: `master.ts` is created only if you split `masteryOf`/`MASTER_SET_IDS` out of `sets.ts`; this plan keeps them in `sets.ts`, so **do not create `master.ts`** — drop it from the `git add` above.

---

## Task 5: Lab page + card + summary + hub link

**Files:**
- Create: `munbeop/app/components/counter-drill/CounterCard.vue`, `munbeop/app/components/counter-drill/CounterSummary.vue`, `munbeop/app/pages/practice/counters.vue`
- Modify: `munbeop/app/pages/practice/index.vue` (hub card)
- Test: `munbeop/tests/components/counter-drill/CounterCard.test.ts`

- [ ] **Step 1: Write the failing component test**

Create `munbeop/tests/components/counter-drill/CounterCard.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CounterCard from '~/components/counter-drill/CounterCard.vue'
import type { CountItem } from '~/lib/domain'

const item: CountItem = {
  counterId: 'gwon', quantity: 3, noun: '책', system: 'native', answer: '세 권',
  trans: { en: 'three books', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
}
const opts = ['세 권', '삼 권', '셋 권', '세 개']

describe('CounterCard', () => {
  it('renders the prompt noun×quantity and the 4 options', () => {
    const w = mount(CounterCard, { props: { item, options: opts, phase: 'question', picked: null, verdict: null } })
    expect(w.text()).toContain('책')
    expect(w.text()).toContain('3')
    expect(w.findAll('[data-testid="counter-option"]')).toHaveLength(4)
  })

  it('emits answer with the chosen option', async () => {
    const w = mount(CounterCard, { props: { item, options: opts, phase: 'question', picked: null, verdict: null } })
    await w.findAll('[data-testid="counter-option"]')[1]!.trigger('click')
    expect(w.emitted('answer')?.[0]).toEqual(['삼 권'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/counter-drill/CounterCard.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write `CounterCard.vue`**

Create `munbeop/app/components/counter-drill/CounterCard.vue`:

```vue
<script setup lang="ts">
import type { CountItem } from '~/lib/domain'

interface Props {
  item: CountItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  picked: string | null
  verdict: boolean | null
}
const props = defineProps<Props>()
defineEmits<{ answer: [choice: string]; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (props.phase === 'question') return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}
</script>

<template>
  <div class="counter-card" data-testid="counter-card">
    <p class="counter-card__prompt" lang="ko">
      <span class="counter-card__noun">{{ item.noun }}</span>
      <span class="counter-card__times">× {{ item.quantity }}</span>
    </p>
    <div class="counter-card__options">
      <button
        v-for="opt in options"
        :key="opt"
        type="button"
        class="counter-card__opt"
        :class="`counter-card__opt--${optionState(opt)}`"
        :disabled="phase !== 'question'"
        lang="ko"
        data-testid="counter-option"
        @click="$emit('answer', opt)"
      >
        {{ opt }}
      </button>
    </div>
    <div v-if="phase === 'right' || phase === 'wrong'" class="counter-card__feedback" role="status">
      <p class="counter-card__verdict" :class="verdict ? 'is-ok' : 'is-no'">
        {{ verdict ? t('counters.correct') : t('counters.wrong') }}
      </p>
      <p class="counter-card__why" lang="ko">{{ item.answer }} · {{ tl(item.trans) }}</p>
      <button type="button" class="counter-card__btn" data-testid="counter-next" @click="$emit('next')">
        {{ t('counters.next') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.counter-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; background: var(--paper); border: 2px solid var(--ink-line); }
.counter-card__prompt { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 20px; color: var(--ink); display: flex; gap: 10px; align-items: baseline; }
.counter-card__times { font-family: 'JetBrains Mono', monospace; color: var(--ink-soft); }
.counter-card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.counter-card__opt { min-height: 48px; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--ink-line); color: var(--ink); font-family: 'Noto Sans KR', sans-serif; font-size: 17px; cursor: pointer; }
.counter-card__opt:hover:not(:disabled) { border-color: var(--ink); }
.counter-card__opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.counter-card__opt--correct { border-color: var(--jade); background: var(--surface); }
.counter-card__opt--wrong { border-color: var(--danger); background: var(--surface); }
.counter-card__opt--muted { opacity: 0.55; }
.counter-card__feedback { display: flex; flex-direction: column; gap: 4px; }
.counter-card__verdict { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; }
.counter-card__verdict.is-ok { color: var(--heading-accent); }
.counter-card__verdict.is-no { color: var(--danger); }
.counter-card__why { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); }
.counter-card__btn { align-self: flex-start; padding: 6px 14px; background: var(--accent); color: var(--text-on-accent); border: 2px solid var(--ink-line); font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer; }
@media (max-width: 480px) { .counter-card__options { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/counter-drill/CounterCard.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `CounterSummary.vue` + the lab page + hub link**

Create `munbeop/app/components/counter-drill/CounterSummary.vue`:

```vue
<script setup lang="ts">
import type { DrillScore } from '~/lib/counters'
import type { CountItem } from '~/lib/domain'

interface Props { score: DrillScore; failedItems: CountItem[] }
defineProps<Props>()
defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="counter-summary" role="status">
    <p class="counter-summary__score">{{ t('counters.score', { correct: score.correct, total: score.total }) }}</p>
    <div class="counter-summary__actions">
      <button v-if="failedItems.length" type="button" data-testid="counter-replay" @click="$emit('replayFailed')">
        {{ t('counters.replay_failed') }}
      </button>
      <button type="button" data-testid="counter-restart" @click="$emit('restart')">{{ t('counters.restart') }}</button>
    </div>
  </div>
</template>

<style scoped>
.counter-summary { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.counter-summary__score { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 12px; color: var(--ink); }
.counter-summary__actions { display: flex; gap: 10px; }
.counter-summary__actions button { padding: 7px 14px; border: 2px solid var(--ink-line); background: var(--paper-deep); font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer; }
</style>
```

Create `munbeop/app/pages/practice/counters.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import CounterCard from '~/components/counter-drill/CounterCard.vue'
import CounterSummary from '~/components/counter-drill/CounterSummary.vue'
import { useCounterDrill } from '~/composables/useCounterDrill'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { COUNTER_SETS } from '~/lib/counters/sets'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const drill = useCounterDrill()
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function begin(setId: string) {
  drill.selectSet(setId)
  drill.start()
  started.value = true
  phase.value = 'play'
}
async function onNext() {
  await drill.next()
}
function restart() {
  phase.value = 'pick'
  started.value = false
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="수 분류사 연구소" :latin="t('counters.title')" />
    <p class="lab__lead">{{ t('counters.lead') }}</p>

    <div v-if="phase === 'pick'" class="lab__sets">
      <button
        v-for="s in COUNTER_SETS"
        :key="s.id"
        type="button"
        class="lab__set"
        data-testid="counter-set"
        @click="begin(s.id)"
      >
        <span lang="ko">{{ s.ko }}</span>
        <span class="lab__set-label">{{ t(s.labelKey) }}</span>
      </button>
    </div>

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay" role="status">
        🔁 {{ t('counters.replay_mode') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('counters.progress')"
      />
      <CounterCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :picked="drill.picked.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        @answer="drill.answer"
        @next="onNext"
      />
      <CounterSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="drill.replayFailed"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui, 'Inter'), sans-serif; color: var(--text-soft, var(--ink-soft)); line-height: 1.6; }
.lab__sets { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.lab__set { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--paper-deep); border: 2px solid var(--ink-line); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; color: var(--ink); }
.lab__set:hover { border-color: var(--ink); }
.lab__set:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lab__set-label { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
</style>
```

Wire the hub card in `munbeop/app/pages/practice/index.vue`: read the file, find how the existing labs (cloze/register/conjugation) are listed (a `GameCard`/link grid), and add a `/practice/counters` entry with `t('games.counters')`, following the exact existing markup.

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/counter-drill munbeop/app/pages/practice/counters.vue munbeop/app/pages/practice/index.vue munbeop/tests/components/counter-drill/CounterCard.test.ts
git commit -m "feat(counters): 수 분류사 연구소 lab page + card + summary + hub link"
```

---

## Task 6: i18n keys in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/counters-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/i18n/counters-keys.test.ts` (mirror `tests/unit/i18n/stats-keys.test.ts`'s 8-locale import + `dig`), with:

```ts
const KEYS = [
  'counters.title', 'counters.lead', 'counters.correct', 'counters.wrong', 'counters.next',
  'counters.score', 'counters.replay_failed', 'counters.replay_mode', 'counters.restart', 'counters.progress',
  'counters.set.people_animals', 'counters.set.books_paper', 'counters.set.food_drink',
  'counters.set.time_age', 'counters.set.things', 'counters.set.money_order',
  'games.counters',
]
```

assert each key is a non-empty string across all 8 locales, plus a test that `counters.score` keeps `{correct}` and `{total}`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/i18n/counters-keys.test.ts`
Expected: FAIL.

- [ ] **Step 3: Inject the keys into all 8 locales via a temp script**

Create `munbeop/scripts/tmp-add-counters-i18n.mjs` mirroring Step 12's injector: for each locale set `json.counters = { title, lead, correct, wrong, next, score, replay_failed, replay_mode, restart, progress, set: { people_animals, books_paper, food_drink, time_age, things, money_order } }` and `json.games.counters`. English values:
- `title`: "Counter Lab", `lead`: "Count it the Korean way: pick the right number + classifier.", `correct`: "맞아요!", `wrong`: "다시 봐요", `next`: "Next", `score`: "{correct} / {total}", `replay_failed`: "Retry the misses", `replay_mode`: "Replay", `restart`: "New round", `progress`: "Question", set labels: "People & animals" / "Books & paper" / "Food & drink" / "Time & age" / "Things" / "Money & order", `games.counters`: "Counter Lab".
- Translate to es/fr/pt-BR/th/id/vi/ja (keep 맞아요!/다시 봐요 Korean verdicts literal like the other labs; keep `{correct}`/`{total}`). Use the established locale style.

Run: `node scripts/tmp-add-counters-i18n.mjs`
Then `git diff munbeop/i18n/locales/en.json` to confirm only the added `counters` block + `games.counters`.

- [ ] **Step 4: Run the parity test to verify it passes**

Run: `pnpm exec vitest run tests/unit/i18n/counters-keys.test.ts`
Expected: PASS.

- [ ] **Step 5: Delete the temp script and commit**

```bash
rm munbeop/scripts/tmp-add-counters-i18n.mjs
git add munbeop/i18n/locales munbeop/tests/unit/i18n/counters-keys.test.ts
git commit -m "feat(counters): counters.* + games.counters i18n across 8 locales"
```

---

## Task 7: Full verification gate

- [ ] **Step 1:** `pnpm test` → all green (engine golden + seed invariants + drill + composables + components + i18n + the existing suite).
- [ ] **Step 2:** `pnpm lint` → 0 errors (watch `import/first` on the store-mocked composable test if any).
- [ ] **Step 3:** `pnpm typecheck` → no errors.
- [ ] **Step 4:** Preview smoke — `nuxt dev` boots clean; `/practice/counters` shows the set picker → a 4-choice round renders the prompt (책 ×3) + options incl. 세 권 / 삼 권 / 셋 권 / 세 개; a wrong pick reveals the answer; 수 분류사 마스터 clears a set at ≥0.7. (Auth-gated; the boot/compile check is the auth-independent signal.)
- [ ] **Step 5:** Final commit if any fixes: `git add -A && git commit -m "chore(counters): lint/type fixes after Step 13 verification"`.

---

## Self-Review

**Spec coverage:** engine `numbers.ts` (native/Sino/prenominal incl. 20→스무) → Task 1. Counter catalog + items (broad, incl. 분/번 splits) → Task 2. "Render the count" drill + distractors (wrong-system/prenominal/counter) → Task 3. Sets + self-contained mastery + `useCounterDrill` → Task 4. Standalone `/practice/counters` lab + card + summary + hub → Task 5. i18n 8 locales + parity → Task 6. No migration / isolated lab → no task touches `supabase/`, `logStore`, or `srsStore`. Verification → Task 7. ✓

**Type consistency:** `Counter`/`CountItem`/`NumberSystem` (domain, Task 2) used identically in Tasks 3–5. `nativeNumber`/`nativePrenominal`/`sinoNumber` (Task 1) consumed by the seed-invariant test (Task 2) and `buildDistractors` (Task 3). `optionsFor(item, counters)` signature matches between Task 3 (impl/test), Task 4 (`useCounterDrill`). `DrillResult { itemId, correct }` (Task 3) matches `useCounterDrill`'s `results` + `scoreOf`. `COUNTER_SETS`/`masteryOf`/`MASTER_SET_IDS` (Task 4 `sets.ts`) used by `useCounterMaster` + the lab page. i18n keys in Task 6 are exactly those referenced by `t(...)` in Tasks 4–5.

**Placeholder scan:** Engine/drill/composable/component tasks have complete code. The seed (Task 2) is a complete, engine-verified first batch (2 items × 21 counters); the seed-invariant test mechanically catches any wrong `answer`. Task 5 hub-link and Task 6 translations reference "follow the existing markup / established locale style" — these are concrete, existing patterns (not vague code), and the parity/compile gates catch omissions. The lab page + hub wiring are typecheck-verified (no Nuxt-context page unit test, per house convention).

**Deliberate note:** Task 4 Step 6 flags `master.ts` as not-created (mastery lives in `sets.ts`) — don't `git add` it.
