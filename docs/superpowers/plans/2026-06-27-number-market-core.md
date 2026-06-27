# 숫자 시장 — Number Market CORE (Learn mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone number-fluency lab (`/practice/number-market`, 숫자 시장) where the learner
reads a quantity in context (🍎 사과 3개, a clock at 3:15, ₩12,000, 6/15, a phone number) by
**building the Korean reading from syllable tiles**, choosing the right system (native vs Sino) and
the irregular forms. Domain-by-domain self-contained mastery (수의 달인). This is **Plan 1 of 2**:
it ships the Learn mode end-to-end. Plan 2 adds Speed (속도전) + Dictation (받아쓰기 + audio).

**Architecture:** A pure `numbers.ts` engine, extended **additively** with `sinoCardinal`
(만/억 grouping), `sinoMonth` (유월/시월), `sinoDigitString` (공), and `timeReading` — golden-tested,
the existing 1..99 functions untouched. A static TS seed (`seed/numbers-market/`) holds authored
`MarketItem`s whose `answer`/`tiles` are validated against the engine by an invariant test. A
`lib/numbers-market/` layer (tiles/drill/sets) mirrors `lib/counters`. A self-contained
`useNumberMarket` composable drives the build-the-reading round; `useNumberMarketMaster` tracks the
badge in `localStorage`. No DB/migration, no SRS/catalog coupling.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest + @vue/test-utils (happy-dom),
`@nuxtjs/i18n` (8 locales). Package manager: **pnpm**. All app code lives under `munbeop/`.

**Spec:** `docs/superpowers/specs/2026-06-27-number-market-design.md`

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`.
  Drill libs mirror `app/lib/counters/drill.ts` (`itemId`, `buildRound`, `scoreOf`, `DrillResult`).
  Mastery mirrors `app/composables/useCounterMaster.ts` (localStorage `*.cleared`/`*.masterEarned`,
  sticky `earned`, `CLEAR_THRESHOLD = 0.7`). The shared shuffle is `~/lib/particle-lab/shuffle`
  (`shuffle<T>(xs: T[]): T[]`). The 8-locale seed helper is `L(en,es,fr,'pt-BR',th,id,vi,ja)` in
  `~/seed/locale`; `LOCALE_CODES`/`LocalizedString` live in `~/lib/domain` (`lib/domain/i18n.ts`).
- `useI18n().t` is a key-echo stub in tests; reactivity primitives are test globals. The activity
  store is `~/stores/activity` (`useActivityStore().record()` — call on each answer, like
  `useCounterDrill`).
- **vitest gotcha:** keep the SUT `import` at the TOP even with `vi.mock` below it (`import/first`
  lint). Type-only wrong-module imports pass vitest but fail `vue-tsc` → always `pnpm typecheck`
  before commit.
- i18n parity = a per-feature test importing all 8 locale JSONs (`munbeop/i18n/locales/*.json`,
  nested objects). Add keys to all 8; keep Korean fragments (숫자 시장 / 수의 달인) verbatim.
- Page pattern: `definePageMeta({ surface: 'game' })`; `BilingualTitle` (`ko` + `latin`);
  `GameExitButton` + `GameLeaveConfirm` + `useGameLeaveGuard(() => dirty)`; `ProgressDots`
  (`total`/`progress`/`label`). See `app/pages/practice/counters.vue`.
- Commands: single test `pnpm exec vitest run <path>`; full `pnpm test`; `pnpm lint`;
  `pnpm typecheck`. Run them from inside `munbeop/`.
- **No DB / migration. No SRS/log/catalog writes.** The lab is isolated.

**Korean-correctness gate:** the golden readings + the authored seed are mechanically checked
(answer === engine render) by the invariant test, and are the documented **wife native-review**
target before launch — especially 만-grouping money, the 유월/시월 months, and the time mixing.

---

## Task 1: Number engine extension — `numbers.ts`

**Files:**
- Modify: `munbeop/app/lib/korean/numbers.ts` (append; existing functions untouched)
- Modify: `munbeop/app/lib/korean/index.ts`
- Test: `munbeop/tests/unit/korean/numbers.test.ts` (append a new describe block)

- [ ] **Step 1: Write the failing golden test**

Append to `munbeop/tests/unit/korean/numbers.test.ts` (first read the file; keep the existing
imports + `GOLDEN` block, add `sinoCardinal, sinoMonth, sinoDigitString, timeReading` to the import
from `~/lib/korean/numbers`, then add this block at the end):

```ts
import { sinoCardinal, sinoMonth, sinoDigitString, timeReading } from '~/lib/korean/numbers'

describe('sinoCardinal (만/억 grouping)', () => {
  const ROWS: [number, string][] = [
    [0, '영'],
    [10, '십'],
    [16, '십육'],
    [100, '백'],
    [350, '삼백오십'],
    [1500, '천오백'],
    [2024, '이천이십사'],
    [10000, '만'],
    [12000, '만 이천'],
    [23000, '이만 삼천'],
    [25000, '이만 오천'],
    [150000, '십오만'],
    [1000000, '백만'],
    [100000000, '일억'],
  ]
  it.each(ROWS)('%i → %s', (n, expected) => {
    expect(sinoCardinal(n)).toBe(expected)
  })
  it('throws outside 0..100000000', () => {
    expect(() => sinoCardinal(-1)).toThrow()
    expect(() => sinoCardinal(100000001)).toThrow()
    expect(() => sinoCardinal(1.5)).toThrow()
  })
})

describe('sinoMonth (irregulars 유월/시월)', () => {
  const ROWS: [number, string][] = [
    [1, '일월'], [2, '이월'], [3, '삼월'], [4, '사월'], [5, '오월'],
    [6, '유월'], [7, '칠월'], [8, '팔월'], [9, '구월'], [10, '시월'],
    [11, '십일월'], [12, '십이월'],
  ]
  it.each(ROWS)('%i월 → %s', (m, expected) => {
    expect(sinoMonth(m)).toBe(expected)
  })
  it('throws outside 1..12', () => {
    expect(() => sinoMonth(0)).toThrow()
    expect(() => sinoMonth(13)).toThrow()
  })
})

describe('sinoDigitString (0 → 공)', () => {
  it('reads digit-by-digit with 공 for zero', () => {
    expect(sinoDigitString('010')).toBe('공일공')
    expect(sinoDigitString('1234')).toBe('일이삼사')
    expect(sinoDigitString('9876')).toBe('구팔칠육')
  })
  it('throws on a non-digit', () => {
    expect(() => sinoDigitString('12a')).toThrow()
  })
})

describe('timeReading (native hour + Sino minute)', () => {
  const ROWS: [number, number, string][] = [
    [1, 0, '한 시'],
    [2, 0, '두 시'],
    [3, 15, '세 시 십오 분'],
    [9, 5, '아홉 시 오 분'],
    [12, 30, '열두 시 삼십 분'],
    [7, 45, '일곱 시 사십오 분'],
  ]
  it.each(ROWS)('%i:%i → %s', (h, m, expected) => {
    expect(timeReading(h, m)).toBe(expected)
  })
  it('throws outside hour 1..12 / minute 0..59', () => {
    expect(() => timeReading(0, 0)).toThrow()
    expect(() => timeReading(13, 0)).toThrow()
    expect(() => timeReading(3, 60)).toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/korean/numbers.test.ts`
Expected: FAIL — `sinoCardinal`/`sinoMonth`/`sinoDigitString`/`timeReading` are not exported.

- [ ] **Step 3: Write the implementation**

Append to `munbeop/app/lib/korean/numbers.ts` (do NOT touch the existing
`NATIVE_*`/`SINO_ONES`/`assertRange`/`nativeNumber`/`nativePrenominal`/`sinoNumber`):

```ts
// — Large Sino cardinals + dates + digit strings + clock (Number Market lab) —

const SINO_DIGIT = ['공', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** Reading of 1..9999, joined (no spaces), dropping the leading 일 before 십/백/천. */
function sinoUnder10k(n: number): string {
  const th = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const te = Math.floor((n % 100) / 10)
  const o = n % 10
  let s = ''
  if (th) s += (th === 1 ? '' : SINO_ONES[th]!) + '천'
  if (h) s += (h === 1 ? '' : SINO_ONES[h]!) + '백'
  if (te) s += (te === 1 ? '' : SINO_ONES[te]!) + '십'
  if (o) s += SINO_ONES[o]!
  return s
}

/**
 * Full Sino-Korean reading 0..100,000,000 with the Korean 4-digit (만/억) grouping.
 * Rules: group by 4 digits; drop leading 일 before 십/백/천; the 만 coefficient 1 is written
 * "만" (not 일만); the 억 coefficient 1 is written "일억"; spaces separate the 억/만/units groups;
 * 0 → "영".
 */
export function sinoCardinal(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 100000000) {
    throw new Error(`number out of supported range 0..100000000: ${n}`)
  }
  if (n === 0) return '영'
  const eok = Math.floor(n / 100000000)
  const man = Math.floor((n % 100000000) / 10000)
  const unit = n % 10000
  const parts: string[] = []
  if (eok) parts.push(sinoUnder10k(eok) + '억') // eok coeff 1 → 일억
  if (man) parts.push((man === 1 ? '' : sinoUnder10k(man)) + '만') // man coeff 1 → 만
  if (unit) parts.push(sinoUnder10k(unit))
  return parts.join(' ')
}

/** Sino month name with the irregulars 6월=유월, 10월=시월. */
export function sinoMonth(m: number): string {
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new Error(`month out of range 1..12: ${m}`)
  }
  if (m === 6) return '유월'
  if (m === 10) return '시월'
  return sinoCardinal(m) + '월'
}

/** Reads a digit string digit-by-digit (phone numbers); 0 → 공. */
export function sinoDigitString(digits: string): string {
  let out = ''
  for (const ch of digits) {
    const d = ch.charCodeAt(0) - 48
    if (d < 0 || d > 9) throw new Error(`not a digit: ${ch}`)
    out += SINO_DIGIT[d]!
  }
  return out
}

/** Clock reading: native prenominal hour + 시 (+ Sino minute + 분 when minute > 0). */
export function timeReading(hour: number, minute: number): string {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
    throw new Error(`hour out of range 1..12: ${hour}`)
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`minute out of range 0..59: ${minute}`)
  }
  const hourPart = `${nativePrenominal(hour)} 시`
  if (minute === 0) return hourPart
  return `${hourPart} ${sinoCardinal(minute)} 분`
}
```

- [ ] **Step 4: Export from the korean barrel**

Modify `munbeop/app/lib/korean/index.ts` line 6 — extend the existing numbers export:

```ts
export { nativeNumber, nativePrenominal, sinoNumber, sinoCardinal, sinoMonth, sinoDigitString, timeReading } from './numbers'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/korean/numbers.test.ts`
Expected: PASS — the new blocks pass AND the existing 1..99 `GOLDEN` rows + the `sinoNumber(100)`
throw guard stay green (proof the extension is additive).

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/korean/numbers.ts munbeop/app/lib/korean/index.ts munbeop/tests/unit/korean/numbers.test.ts
git commit -m "feat(number-market): additive Sino cardinal/month/digit/time engine (golden)"
```

---

## Task 2: Domain type + item seed

**Files:**
- Create: `munbeop/app/lib/domain/numbers-market.ts`
- Modify: `munbeop/app/lib/domain/index.ts`
- Create: `munbeop/app/seed/numbers-market/items.ts`, `munbeop/app/seed/numbers-market/index.ts`
- Test: `munbeop/tests/unit/numbers-market/seed-invariants.test.ts`

- [ ] **Step 1: Write the domain type**

Create `munbeop/app/lib/domain/numbers-market.ts`:

```ts
import type { LocalizedString } from './i18n'

export type NumberDomain = 'counting' | 'sino-basics' | 'time' | 'money' | 'dates' | 'phone'

/** One "build the reading" item. `tiles` joined by spaces MUST equal `answer`. */
export interface MarketItem {
  /** Stable unique id. */
  id: string
  domain: NumberDomain
  /** What the prompt shows (the numeral/context), e.g. "사과 3개", "3:15", "₩12,000", "6/15". */
  display: string
  /** The correct Korean reading, e.g. "세 개", "세 시 십오 분", "만 이천 원". */
  answer: string
  /** Correct build tiles in order. `tiles.join(' ') === answer`. */
  tiles: string[]
  /** Distractor tiles (wrong-system / wrong-form lures). Non-empty, disjoint from `tiles`. */
  lures: string[]
  /** Canonical value for Dictation grading (Plan 2), e.g. "3", "12000", "3:15", "6/15", "0101234". */
  valueKey: string
  /** Gloss of the whole quantity. */
  trans: LocalizedString
}
```

Add to `munbeop/app/lib/domain/index.ts`: `export * from './numbers-market'` (read the file first;
append alongside the other `export * from './…'` lines).

- [ ] **Step 2: Write the failing seed-invariant test**

Create `munbeop/tests/unit/numbers-market/seed-invariants.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { MARKET_ITEMS, itemsForDomain } from '~/seed/numbers-market'
import { LOCALE_CODES, type NumberDomain } from '~/lib/domain'

const DOMAINS: NumberDomain[] = ['counting', 'sino-basics', 'time', 'money', 'dates', 'phone']

describe('number-market seed invariants', () => {
  it('every item id is unique', () => {
    const ids = MARKET_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every item tiles join to exactly the answer', () => {
    for (const it of MARKET_ITEMS) {
      expect(it.tiles.join(' '), it.id).toBe(it.answer)
    }
  })

  it('every lure is non-empty, and lures are disjoint from the correct tiles', () => {
    for (const it of MARKET_ITEMS) {
      expect(it.lures.length, `${it.id} has no lures`).toBeGreaterThan(0)
      const correct = new Set(it.tiles)
      for (const lure of it.lures) {
        expect(lure.length, `${it.id} empty lure`).toBeGreaterThan(0)
        expect(correct.has(lure), `${it.id} lure ${lure} collides with a correct tile`).toBe(false)
      }
    }
  })

  it('every item has a non-empty valueKey', () => {
    for (const it of MARKET_ITEMS) expect(it.valueKey.length, it.id).toBeGreaterThan(0)
  })

  it('every item trans is present in all 8 locales', () => {
    for (const it of MARKET_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.id} ${code}`).toBeTruthy()
      }
    }
  })

  it('every domain has at least 3 items', () => {
    for (const d of DOMAINS) {
      expect(itemsForDomain(d).length, `${d} item count`).toBeGreaterThanOrEqual(3)
    }
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/numbers-market/seed-invariants.test.ts`
Expected: FAIL — `Failed to resolve import "~/seed/numbers-market"`.

- [ ] **Step 4: Write the item seed (verified first batch)**

Create `munbeop/app/seed/numbers-market/items.ts`. Every `answer` below was rendered by hand-tracing
the Task 1 engine (`nativePrenominal`/`sinoCardinal`/`sinoMonth`/`timeReading`); `tiles.join(' ')`
equals `answer` (the Task 2 test enforces this). The `lures` are the systematic wrong-system /
wrong-form traps:

```ts
import type { MarketItem } from '~/lib/domain'
import { L } from '~/seed/locale'

export const MARKET_ITEMS: MarketItem[] = [
  // ── counting (native prenominal + counter) ──
  { id: 'count-apple-3', domain: 'counting', display: '사과 3개', answer: '세 개', tiles: ['세', '개'], lures: ['삼', '셋'], valueKey: '3',
    trans: L('three apples', 'tres manzanas', 'trois pommes', 'três maçãs', 'แอปเปิล 3 ผล', 'tiga apel', 'ba quả táo', 'りんご3個') },
  { id: 'count-cat-2', domain: 'counting', display: '고양이 2마리', answer: '두 마리', tiles: ['두', '마리'], lures: ['이', '둘'], valueKey: '2',
    trans: L('two cats', 'dos gatos', 'deux chats', 'dois gatos', 'แมว 2 ตัว', 'dua kucing', 'hai con mèo', '猫2匹') },
  { id: 'count-student-20', domain: 'counting', display: '학생 20명', answer: '스무 명', tiles: ['스무', '명'], lures: ['이십', '스물'], valueKey: '20',
    trans: L('twenty students', 'veinte estudiantes', 'vingt élèves', 'vinte estudantes', 'นักเรียน 20 คน', 'dua puluh siswa', 'hai mươi học sinh', '学生20名') },

  // ── sino-basics (plain number) ──
  { id: 'sino-100', domain: 'sino-basics', display: '100', answer: '백', tiles: ['백'], lures: ['일백', '십'], valueKey: '100',
    trans: L('one hundred', 'cien', 'cent', 'cem', 'หนึ่งร้อย', 'seratus', 'một trăm', '百') },
  { id: 'sino-16', domain: 'sino-basics', display: '16', answer: '십육', tiles: ['십육'], lures: ['열여섯', '십륙'], valueKey: '16',
    trans: L('sixteen', 'dieciséis', 'seize', 'dezesseis', 'สิบหก', 'enam belas', 'mười sáu', '十六') },
  { id: 'sino-350', domain: 'sino-basics', display: '350', answer: '삼백오십', tiles: ['삼백오십'], lures: ['삼백십오', '세백오십'], valueKey: '350',
    trans: L('three hundred fifty', 'trescientos cincuenta', 'trois cent cinquante', 'trezentos e cinquenta', 'สามร้อยห้าสิบ', 'tiga ratus lima puluh', 'ba trăm năm mươi', '三百五十') },

  // ── time (native hour + Sino minute) ──
  { id: 'time-3-15', domain: 'time', display: '3:15', answer: '세 시 십오 분', tiles: ['세', '시', '십오', '분'], lures: ['삼', '열다섯'], valueKey: '3:15',
    trans: L('3:15', 'las 3:15', '3 h 15', '3:15', '3:15 น.', 'pukul 3:15', '3 giờ 15', '3時15分') },
  { id: 'time-9-05', domain: 'time', display: '9:05', answer: '아홉 시 오 분', tiles: ['아홉', '시', '오', '분'], lures: ['구', '다섯'], valueKey: '9:05',
    trans: L('9:05', 'las 9:05', '9 h 05', '9:05', '9:05 น.', 'pukul 9:05', '9 giờ 05', '9時5分') },
  { id: 'time-12-30', domain: 'time', display: '12:30', answer: '열두 시 삼십 분', tiles: ['열두', '시', '삼십', '분'], lures: ['십이', '서른'], valueKey: '12:30',
    trans: L('12:30', 'las 12:30', '12 h 30', '12:30', '12:30 น.', 'pukul 12:30', '12 giờ 30', '12時30分') },

  // ── money (Sino + 만 grouping) ──
  { id: 'money-1500', domain: 'money', display: '₩1,500', answer: '천오백 원', tiles: ['천오백', '원'], lures: ['일천오백', '천오십'], valueKey: '1500',
    trans: L('1,500 won', '1.500 wones', '1 500 wons', '1.500 wons', '1,500 วอน', '1.500 won', '1.500 won', '1,500ウォン') },
  { id: 'money-12000', domain: 'money', display: '₩12,000', answer: '만 이천 원', tiles: ['만', '이천', '원'], lures: ['십이천', '일만'], valueKey: '12000',
    trans: L('12,000 won', '12.000 wones', '12 000 wons', '12.000 wons', '12,000 วอน', '12.000 won', '12.000 won', '12,000ウォン') },
  { id: 'money-25000', domain: 'money', display: '₩25,000', answer: '이만 오천 원', tiles: ['이만', '오천', '원'], lures: ['이십오천', '이만오백'], valueKey: '25000',
    trans: L('25,000 won', '25.000 wones', '25 000 wons', '25.000 wons', '25,000 วอน', '25.000 won', '25.000 won', '25,000ウォン') },

  // ── dates (Sino, month irregulars) ──
  { id: 'date-6-15', domain: 'dates', display: '6/15', answer: '유월 십오 일', tiles: ['유월', '십오', '일'], lures: ['육월', '오일'], valueKey: '6/15',
    trans: L('June 15', '15 de junio', '15 juin', '15 de junho', '15 มิ.ย.', '15 Juni', '15 tháng 6', '6月15日') },
  { id: 'date-10-3', domain: 'dates', display: '10/3', answer: '시월 삼 일', tiles: ['시월', '삼', '일'], lures: ['십월', '세'], valueKey: '10/3',
    trans: L('October 3', '3 de octubre', '3 octobre', '3 de outubro', '3 ต.ค.', '3 Oktober', '3 tháng 10', '10月3日') },
  { id: 'date-11-20', domain: 'dates', display: '11/20', answer: '십일월 이십 일', tiles: ['십일월', '이십', '일'], lures: ['십일일월', '스무'], valueKey: '11/20',
    trans: L('November 20', '20 de noviembre', '20 novembre', '20 de novembro', '20 พ.ย.', '20 November', '20 tháng 11', '11月20日') },

  // ── phone / digit strings (Sino digit-by-digit, 공) ──
  { id: 'phone-010-1234', domain: 'phone', display: '010-1234', answer: '공일공 일이삼사', tiles: ['공일공', '일이삼사'], lures: ['영일영', '공일공일'], valueKey: '0101234',
    trans: L('010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234') },
  { id: 'phone-119', domain: 'phone', display: '119', answer: '일일구', tiles: ['일일구'], lures: ['백십구', '공일구'], valueKey: '119',
    trans: L('119 (emergency)', '119 (emergencia)', '119 (urgence)', '119 (emergência)', '119 (ฉุกเฉิน)', '119 (darurat)', '119 (khẩn cấp)', '119（緊急）') },
  { id: 'phone-010-9876', domain: 'phone', display: '010-9876', answer: '공일공 구팔칠육', tiles: ['공일공', '구팔칠육'], lures: ['영일영', '공일공구'], valueKey: '0109876',
    trans: L('010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876') },
]

export function itemsForDomain(domain: string): MarketItem[] {
  return MARKET_ITEMS.filter((i) => i.domain === domain)
}
```

Create `munbeop/app/seed/numbers-market/index.ts`:

```ts
export { MARKET_ITEMS, itemsForDomain } from './items'
```

- [ ] **Step 5: Run the seed-invariant test to verify it passes**

Run: `pnpm exec vitest run tests/unit/numbers-market/seed-invariants.test.ts`
Expected: PASS. **If "tiles join to the answer" fails on any row, the authored `answer`/`tiles` are
inconsistent — fix the row (this is the mechanical Korean-correctness gate).**

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/domain/numbers-market.ts munbeop/app/lib/domain/index.ts munbeop/app/seed/numbers-market munbeop/tests/unit/numbers-market/seed-invariants.test.ts
git commit -m "feat(number-market): MarketItem domain + verified first-batch seed (6 domains)"
```

> **Content note:** This is the verified first batch (3 items/domain, all 6 domains). Later batches
> add more items per domain — gated by the same invariant test, with **wife native-review** as the
> final semantic gate (mirrors the counter lab's content process).

---

## Task 3: Tiles + drill helpers + domain sets

**Files:**
- Create: `munbeop/app/lib/numbers-market/tiles.ts`, `munbeop/app/lib/numbers-market/drill.ts`,
  `munbeop/app/lib/numbers-market/sets.ts`, `munbeop/app/lib/numbers-market/index.ts`
- Test: `munbeop/tests/unit/numbers-market/drill.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/numbers-market/drill.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { tilePool, buildRound, itemId, scoreOf } from '~/lib/numbers-market'
import { NUMBER_DOMAINS, masteryOf, MASTER_DOMAIN_IDS } from '~/lib/numbers-market/sets'
import { MARKET_ITEMS, itemsForDomain } from '~/seed/numbers-market'

const identity = <T>(xs: T[]): T[] => xs

describe('tilePool', () => {
  it('returns the correct tiles plus the lures (superset of the answer tiles)', () => {
    const it = MARKET_ITEMS.find((i) => i.id === 'time-3-15')!
    const pool = tilePool(it)
    for (const t of it.tiles) expect(pool).toContain(t)
    for (const l of it.lures) expect(pool).toContain(l)
    expect(pool.length).toBe(it.tiles.length + it.lures.length)
  })
})

describe('buildRound', () => {
  it('draws up to n items from a single domain', () => {
    const round = buildRound('time', 8, identity)
    expect(round.length).toBe(itemsForDomain('time').length) // fewer than 8 in the first batch
    expect(round.every((i) => i.domain === 'time')).toBe(true)
  })
})

describe('itemId / scoreOf', () => {
  it('itemId is the item id and is unique across the seed', () => {
    const ids = MARKET_ITEMS.map(itemId)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('scoreOf computes accuracy', () => {
    expect(scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])).toEqual({
      correct: 1, total: 2, accuracy: 0.5,
    })
  })
})

describe('domain sets + mastery', () => {
  it('the 6 domains are defined and reference real seed domains', () => {
    expect(NUMBER_DOMAINS.map((d) => d.id)).toEqual(
      ['counting', 'sino-basics', 'time', 'money', 'dates', 'phone'],
    )
    for (const d of NUMBER_DOMAINS) expect(itemsForDomain(d.id).length).toBeGreaterThan(0)
  })
  it('mastery earned only when every domain is cleared', () => {
    expect(masteryOf(new Set()).earned).toBe(false)
    expect(masteryOf(new Set(MASTER_DOMAIN_IDS)).earned).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/numbers-market/drill.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/numbers-market"`.

- [ ] **Step 3: Write the tiles helper**

Create `munbeop/app/lib/numbers-market/tiles.ts`:

```ts
import type { MarketItem } from '~/lib/domain'

/** The unshuffled tile pool for an item: correct tiles followed by the lures. */
export function tilePool(item: MarketItem): string[] {
  return [...item.tiles, ...item.lures]
}
```

- [ ] **Step 4: Write the drill helpers**

Create `munbeop/app/lib/numbers-market/drill.ts`:

```ts
import type { MarketItem } from '~/lib/domain'
import { MARKET_ITEMS } from '~/seed/numbers-market'

/** Stable per-item id (MarketItem already carries one). */
export function itemId(i: MarketItem): string {
  return i.id
}

/** Items in a domain. */
export function itemsForDomainList(domain: string, source: MarketItem[] = MARKET_ITEMS): MarketItem[] {
  return source.filter((i) => i.domain === domain)
}

/** A shuffled draw of up to `n` items from one domain. */
export function buildRound(
  domain: string,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: MarketItem[] = MARKET_ITEMS,
): MarketItem[] {
  return shuffleFn(itemsForDomainList(domain, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
```

- [ ] **Step 5: Write the domain sets + mastery**

Create `munbeop/app/lib/numbers-market/sets.ts`:

```ts
import type { NumberDomain } from '~/lib/domain'

export interface NumberDomainDef {
  id: NumberDomain
  /** Korean label (shown as-is). */
  ko: string
  /** i18n key for the localized label. */
  labelKey: string
}

export const NUMBER_DOMAINS: NumberDomainDef[] = [
  { id: 'counting', ko: '고유어 세기', labelKey: 'numberMarket.domain.counting' },
  { id: 'sino-basics', ko: '한자어 기초', labelKey: 'numberMarket.domain.sino_basics' },
  { id: 'time', ko: '시간', labelKey: 'numberMarket.domain.time' },
  { id: 'money', ko: '돈', labelKey: 'numberMarket.domain.money' },
  { id: 'dates', ko: '날짜', labelKey: 'numberMarket.domain.dates' },
  { id: 'phone', ko: '전화·번호', labelKey: 'numberMarket.domain.phone' },
]

export const MASTER_DOMAIN_IDS = NUMBER_DOMAINS.map((d) => d.id)

export interface DomainProgress { id: NumberDomain; ko: string; done: boolean }

export function masteryOf(cleared: Set<string>) {
  const perDomain: DomainProgress[] = NUMBER_DOMAINS.map((d) => ({ id: d.id, ko: d.ko, done: cleared.has(d.id) }))
  const doneCount = perDomain.filter((p) => p.done).length
  return { perDomain, doneCount, total: MASTER_DOMAIN_IDS.length, earned: doneCount === MASTER_DOMAIN_IDS.length }
}
```

Create `munbeop/app/lib/numbers-market/index.ts`:

```ts
export * from './tiles'
export * from './drill'
export * from './sets'
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/numbers-market/drill.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/lib/numbers-market munbeop/tests/unit/numbers-market/drill.test.ts
git commit -m "feat(number-market): tile pool + drill helpers + 6 domain sets + mastery"
```

---

## Task 4: Mastery composable + `useNumberMarket` (Learn round)

**Files:**
- Create: `munbeop/app/composables/useNumberMarketMaster.ts`
- Create: `munbeop/app/composables/useNumberMarket.ts`
- Test: `munbeop/tests/unit/numbers-market/useNumberMarket.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/numbers-market/useNumberMarket.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberMarket } from '~/composables/useNumberMarket'

beforeEach(() => {
  setActivePinia(createPinia())
  if (typeof localStorage !== 'undefined') localStorage.clear()
})

describe('useNumberMarket (Learn)', () => {
  it('starts a build round for a domain with a shuffled tile pool', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    expect(m.phase.value).toBe('building')
    expect(m.sessionItems.value.length).toBeGreaterThan(0)
    // pool = correct tiles + lures, nothing placed yet
    expect(m.built.value).toEqual([])
    expect(m.pool.value.length).toBe(m.item.value.tiles.length + m.item.value.lures.length)
  })

  it('placing the correct tiles in order then submitting is right', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    for (const tile of m.item.value.tiles) {
      const idx = m.pool.value.indexOf(tile)
      m.placeTile(idx)
    }
    m.submit()
    expect(m.phase.value).toBe('right')
    expect(m.built.value.join(' ')).toBe(m.item.value.answer)
  })

  it('a wrong build submits as wrong; undo/clear restore the pool', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    const lure = m.item.value.lures[0]!
    m.placeTile(m.pool.value.indexOf(lure))
    expect(m.built.value).toEqual([lure])
    m.undoTile()
    expect(m.built.value).toEqual([])
    expect(m.pool.value).toContain(lure)
    m.placeTile(0)
    m.clearTiles()
    expect(m.built.value).toEqual([])
  })

  it('advancing to done records mastery for a clean normal round', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    while (m.phase.value !== 'done') {
      for (const tile of m.item.value.tiles) m.placeTile(m.pool.value.indexOf(tile))
      m.submit()
      m.next()
    }
    expect(m.score.value.accuracy).toBe(1)
    expect(m.master.doneCount.value).toBe(1)
    expect(localStorage.getItem('number-market.cleared')).toContain('time')
  })

  it('replayFailed re-drills only the missed items', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    let first = true
    while (m.phase.value !== 'done') {
      if (first) {
        m.placeTile(m.pool.value.indexOf(m.item.value.lures[0]!)) // wrong on purpose
        first = false
      } else {
        for (const tile of m.item.value.tiles) m.placeTile(m.pool.value.indexOf(tile))
      }
      m.submit()
      m.next()
    }
    expect(m.failedItems.value.length).toBe(1)
    m.replayFailed()
    expect(m.runMode.value).toBe('replay')
    expect(m.sessionItems.value.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/numbers-market/useNumberMarket.test.ts`
Expected: FAIL — composables don't exist.

- [ ] **Step 3: Write the mastery composable**

Create `munbeop/app/composables/useNumberMarketMaster.ts`:

```ts
import { computed, ref } from 'vue'
import { masteryOf } from '~/lib/numbers-market/sets'

const STORAGE_KEY = 'number-market.cleared'
const EARNED_KEY = 'number-market.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useNumberMarketMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const earnedSticky = ref(typeof localStorage !== 'undefined' && !!localStorage.getItem(EARNED_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perDomain = computed(() => view.value.perDomain)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned || earnedSticky.value)

  function recordRound(domainId: string, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(domainId)) return
    const next = new Set(cleared.value)
    next.add(domainId)
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

  return { perDomain, doneCount, total, earned, celebrate, recordRound, dismiss }
}
```

- [ ] **Step 4: Write the round composable**

Create `munbeop/app/composables/useNumberMarket.ts`:

```ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, tilePool, scoreOf, itemId, type DrillResult } from '~/lib/numbers-market'
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useNumberMarketMaster } from '~/composables/useNumberMarketMaster'
import { useActivityStore } from '~/stores/activity'

export type MarketPhase = 'building' | 'right' | 'wrong' | 'done'
export type MarketRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

export function useNumberMarket() {
  const master = useNumberMarketMaster()
  const activity = useActivityStore()

  const selectedDomain = ref<NumberDomain>(NUMBER_DOMAINS[0]!.id)
  const sessionItems = ref<MarketItem[]>([])
  const runMode = ref<MarketRunMode>('normal')
  const index = ref(0)
  const phase = ref<MarketPhase>('building')
  const pool = ref<string[]>([])
  const built = ref<string[]>([])
  const results = ref<DrillResult[]>([])

  const item = computed<MarketItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function loadTiles() {
    pool.value = shuffle(tilePool(item.value))
    built.value = []
  }
  function resetRound() {
    index.value = 0
    phase.value = 'building'
    results.value = []
  }

  function selectDomain(id: NumberDomain) {
    selectedDomain.value = id
  }

  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(selectedDomain.value, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) loadTiles()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    loadTiles()
  }

  function placeTile(poolIndex: number) {
    if (phase.value !== 'building') return
    const tile = pool.value[poolIndex]
    if (tile === undefined) return
    built.value = [...built.value, tile]
    pool.value = pool.value.filter((_, i) => i !== poolIndex)
  }

  function undoTile() {
    if (phase.value !== 'building' || built.value.length === 0) return
    const next = [...built.value]
    const tile = next.pop()!
    built.value = next
    pool.value = [...pool.value, tile]
  }

  function clearTiles() {
    if (phase.value !== 'building') return
    pool.value = shuffle([...pool.value, ...built.value])
    built.value = []
  }

  function submit() {
    if (phase.value !== 'building') return
    const correct = built.value.join(' ') === item.value.answer
    results.value.push({ itemId: itemId(item.value), correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
  }

  function next() {
    if (phase.value === 'building' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      if (runMode.value === 'normal') master.recordRound(selectedDomain.value, score.value.accuracy)
      return
    }
    index.value += 1
    phase.value = 'building'
    loadTiles()
  }

  return {
    master,
    selectedDomain, sessionItems, runMode, index, phase, pool, built,
    item, score, failedItems,
    selectDomain, start, replayFailed, placeTile, undoTile, clearTiles, submit, next,
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/numbers-market/useNumberMarket.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/composables/useNumberMarket.ts munbeop/app/composables/useNumberMarketMaster.ts munbeop/tests/unit/numbers-market/useNumberMarket.test.ts
git commit -m "feat(number-market): self-contained mastery + build-the-reading round composable"
```

---

## Task 5: Components, page, hub card, i18n

**Files:**
- Create: `munbeop/app/components/numbers-market/DomainPicker.vue`,
  `munbeop/app/components/numbers-market/PromptStage.vue`,
  `munbeop/app/components/numbers-market/TileTray.vue`,
  `munbeop/app/components/numbers-market/MarketSummary.vue`,
  `munbeop/app/components/numbers-market/MasterStrip.vue`
- Create: `munbeop/app/pages/practice/number-market.vue`
- Create: `munbeop/public/games/number-market-cover.svg`
- Modify: `munbeop/app/pages/practice/index.vue`
- Modify: all 8 of `munbeop/i18n/locales/*.json`
- Test: `munbeop/tests/components/numbers-market/TileTray.test.ts`,
  `munbeop/tests/unit/numbers-market/i18n-parity.test.ts`

- [ ] **Step 1: Write the failing component + i18n tests**

Create `munbeop/tests/components/numbers-market/TileTray.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TileTray from '~/components/numbers-market/TileTray.vue'

const base = {
  pool: ['세', '시', '십오', '분', '삼', '열다섯'],
  built: [] as string[],
  phase: 'building' as const,
}

describe('TileTray', () => {
  it('renders one button per pool tile', () => {
    const w = mount(TileTray, { props: base })
    expect(w.findAll('[data-testid="pool-tile"]')).toHaveLength(6)
  })
  it('emits place with the tile index when a pool tile is clicked', async () => {
    const w = mount(TileTray, { props: base })
    await w.findAll('[data-testid="pool-tile"]')[2]!.trigger('click')
    expect(w.emitted('place')?.[0]).toEqual([2])
  })
  it('shows built tiles and emits submit', async () => {
    const w = mount(TileTray, { props: { ...base, built: ['세', '시'] } })
    expect(w.findAll('[data-testid="built-tile"]')).toHaveLength(2)
    await w.find('[data-testid="tile-submit"]').trigger('click')
    expect(w.emitted('submit')).toBeTruthy()
  })
})
```

Create `munbeop/tests/unit/numbers-market/i18n-parity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
// NOTE: existing i18n tests use a relative import (not the ~~ alias). Match that.
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const LOCALES: Record<string, Record<string, unknown>> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
const KEYS = [
  'numberMarket.title', 'numberMarket.lead', 'numberMarket.build_hint', 'numberMarket.submit',
  'numberMarket.clear', 'numberMarket.undo', 'numberMarket.correct', 'numberMarket.wrong',
  'numberMarket.next', 'numberMarket.score', 'numberMarket.progress', 'numberMarket.restart',
  'numberMarket.replay_failed', 'numberMarket.master.title', 'numberMarket.master.progress',
  'numberMarket.domain.counting', 'numberMarket.domain.sino_basics', 'numberMarket.domain.time',
  'numberMarket.domain.money', 'numberMarket.domain.dates', 'numberMarket.domain.phone',
  'games.numberMarket.name', 'games.numberMarket.desc',
]
const get = (o: Record<string, unknown>, path: string) =>
  path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], o)

describe('number-market i18n parity', () => {
  it.each(Object.keys(LOCALES))('%s has every numberMarket key', (code) => {
    for (const key of KEYS) {
      expect(get(LOCALES[code]!, key), `${code} missing ${key}`).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run tests/components/numbers-market/TileTray.test.ts tests/unit/numbers-market/i18n-parity.test.ts`
Expected: FAIL — component + i18n keys don't exist.

- [ ] **Step 3: Write `TileTray.vue`**

Create `munbeop/app/components/numbers-market/TileTray.vue`:

```vue
<script setup lang="ts">
interface Props {
  pool: string[]
  built: string[]
  phase: 'building' | 'right' | 'wrong' | 'done'
}
defineProps<Props>()
const emit = defineEmits<{
  place: [index: number]
  undo: []
  clear: []
  submit: []
}>()
const { t } = useI18n()
</script>

<template>
  <div class="tray">
    <div class="tray__built" :class="{ 'tray__built--right': phase === 'right', 'tray__built--wrong': phase === 'wrong' }" lang="ko">
      <button
        v-for="(tile, i) in built"
        :key="`b-${i}-${tile}`"
        type="button"
        class="tile tile--built"
        data-testid="built-tile"
        :disabled="phase !== 'building'"
        @click="emit('undo')"
      >{{ tile }}</button>
      <span v-if="built.length === 0" class="tray__hint">{{ t('numberMarket.build_hint') }}</span>
    </div>

    <div class="tray__pool" lang="ko">
      <button
        v-for="(tile, i) in pool"
        :key="`p-${i}-${tile}`"
        type="button"
        class="tile"
        data-testid="pool-tile"
        :disabled="phase !== 'building'"
        @click="emit('place', i)"
      >{{ tile }}</button>
    </div>

    <div class="tray__actions">
      <button type="button" class="tray__btn" :disabled="phase !== 'building' || built.length === 0" @click="emit('clear')">
        {{ t('numberMarket.clear') }}
      </button>
      <button
        type="button"
        class="tray__btn tray__btn--primary"
        data-testid="tile-submit"
        :disabled="phase !== 'building' || built.length === 0"
        @click="emit('submit')"
      >{{ t('numberMarket.submit') }}</button>
    </div>
  </div>
</template>

<style scoped>
.tray { display: flex; flex-direction: column; gap: 16px; }
.tray__built {
  min-height: 56px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  padding: 12px; background: var(--paper-deep, var(--surface)); border: 2px dashed var(--ink-line);
}
.tray__built--right { border-color: var(--accent-bright, #2e7d32); border-style: solid; }
.tray__built--wrong { border-color: var(--danger, #c62828); border-style: solid; }
.tray__hint { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.tray__pool { display: flex; flex-wrap: wrap; gap: 8px; }
.tile {
  font-family: 'Noto Sans KR', sans-serif; font-size: 18px; padding: 10px 14px;
  background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer;
}
.tile:hover:not(:disabled) { border-color: var(--ink); transform: translate(-1px, -1px); }
.tile:disabled { opacity: 0.55; cursor: default; }
.tile--built { background: var(--paper-deep, var(--surface)); }
.tray__actions { display: flex; gap: 10px; }
.tray__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.tray__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.tray__btn:disabled { opacity: 0.5; cursor: default; }
.tile:focus-visible, .tray__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 4: Write `PromptStage.vue`, `DomainPicker.vue`, `MarketSummary.vue`, `MasterStrip.vue`**

Create `munbeop/app/components/numbers-market/PromptStage.vue`:

```vue
<script setup lang="ts">
import type { MarketItem } from '~/lib/domain'

interface Props {
  item: MarketItem
  /** Shown after submit. */
  reveal?: boolean
}
defineProps<Props>()
const { t, locale } = useI18n()

const ICON: Record<string, string> = {
  counting: '🍎', 'sino-basics': '🔢', time: '🕒', money: '💰', dates: '📅', phone: '📞',
}
</script>

<template>
  <div class="stage" :data-domain="item.domain">
    <span class="stage__icon" aria-hidden="true">{{ ICON[item.domain] }}</span>
    <span class="stage__display" lang="ko">{{ item.display }}</span>
    <span class="stage__gloss">{{ item.trans[locale as keyof typeof item.trans] || item.trans.en }}</span>
    <p v-if="reveal" class="stage__answer" role="status" lang="ko">{{ item.answer }}</p>
    <p v-if="reveal" class="stage__hint">{{ t('numberMarket.build_hint') }}</p>
  </div>
</template>

<style scoped>
.stage { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); }
.stage__icon { font-size: 32px; }
.stage__display { font-family: 'Noto Sans KR', sans-serif; font-size: 40px; color: var(--ink); letter-spacing: 1px; }
.stage__gloss { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink-soft); }
.stage__answer { margin: 8px 0 0; font-family: 'Noto Sans KR', sans-serif; font-size: 22px; color: var(--accent-bright, #2e7d32); }
.stage__hint { margin: 0; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
</style>
```

Create `munbeop/app/components/numbers-market/DomainPicker.vue`:

```vue
<script setup lang="ts">
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'

defineEmits<{ select: [id: string] }>()
const { t } = useI18n()
</script>

<template>
  <div class="picker">
    <button
      v-for="d in NUMBER_DOMAINS"
      :key="d.id"
      type="button"
      class="picker__item"
      data-testid="domain-pick"
      @click="$emit('select', d.id)"
    >
      <span lang="ko">{{ d.ko }}</span>
      <span class="picker__label">{{ t(d.labelKey) }}</span>
    </button>
  </div>
</template>

<style scoped>
.picker { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.picker__item { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; color: var(--ink); }
.picker__item:hover { border-color: var(--ink); }
.picker__item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.picker__label { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
</style>
```

Create `munbeop/app/components/numbers-market/MarketSummary.vue`:

```vue
<script setup lang="ts">
import type { MarketItem } from '~/lib/domain'
import type { DrillScore } from '~/lib/numbers-market'

interface Props {
  score: DrillScore
  failedItems: MarketItem[]
}
defineProps<Props>()
const emit = defineEmits<{ restart: []; replayFailed: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="summary">
    <p class="summary__score">{{ t('numberMarket.score') }}: {{ score.correct }} / {{ score.total }}</p>
    <ul v-if="failedItems.length" class="summary__failed" lang="ko">
      <li v-for="f in failedItems" :key="f.id">{{ f.display }} → {{ f.answer }}</li>
    </ul>
    <div class="summary__actions">
      <button v-if="failedItems.length" type="button" class="summary__btn" @click="emit('replayFailed')">
        {{ t('numberMarket.replay_failed') }}
      </button>
      <button type="button" class="summary__btn summary__btn--primary" @click="emit('restart')">
        {{ t('numberMarket.restart') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.summary { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.summary__score { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--ink); }
.summary__failed { margin: 0; padding: 12px 16px; list-style: none; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); font-family: 'Noto Sans KR', sans-serif; font-size: 15px; display: flex; flex-direction: column; gap: 6px; }
.summary__actions { display: flex; gap: 10px; }
.summary__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.summary__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.summary__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

Create `munbeop/app/components/numbers-market/MasterStrip.vue`:

```vue
<script setup lang="ts">
import type { DomainProgress } from '~/lib/numbers-market/sets'

interface Props {
  perDomain: DomainProgress[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="master" :class="{ 'master--earned': earned }">
    <span class="master__title" lang="ko">{{ t('numberMarket.master.title') }}</span>
    <span class="master__count">{{ t('numberMarket.master.progress', { done: doneCount, total }) }}</span>
    <span class="master__pips">
      <span
        v-for="d in perDomain"
        :key="d.id"
        class="master__pip"
        :class="{ 'master__pip--done': d.done }"
        :title="d.ko"
      />
    </span>
  </div>
</template>

<style scoped>
.master { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); }
.master--earned { border-color: var(--accent-bright, #2e7d32); }
.master__title { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); }
.master__count { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.master__pips { display: inline-flex; gap: 6px; margin-left: auto; }
.master__pip { width: 10px; height: 10px; background: var(--border); }
.master__pip--done { background: var(--accent-bright, #2e7d32); }
</style>
```

- [ ] **Step 5: Write the page**

Create `munbeop/app/pages/practice/number-market.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DomainPicker from '~/components/numbers-market/DomainPicker.vue'
import PromptStage from '~/components/numbers-market/PromptStage.vue'
import TileTray from '~/components/numbers-market/TileTray.vue'
import MarketSummary from '~/components/numbers-market/MarketSummary.vue'
import MasterStrip from '~/components/numbers-market/MasterStrip.vue'
import { useNumberMarket } from '~/composables/useNumberMarket'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { NumberDomain } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const m = useNumberMarket()
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

useGameLeaveGuard(() => started.value && m.phase.value !== 'done')

function begin(domainId: string) {
  m.selectDomain(domainId as NumberDomain)
  m.start()
  started.value = true
  phase.value = 'play'
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
    <BilingualTitle ko="숫자 시장" :latin="t('numberMarket.title')" />
    <p class="lab__lead">{{ t('numberMarket.lead') }}</p>

    <MasterStrip
      :per-domain="m.master.perDomain.value"
      :done-count="m.master.doneCount.value"
      :total="m.master.total.value"
      :earned="m.master.earned.value"
    />

    <DomainPicker v-if="phase === 'pick'" @select="begin" />

    <template v-else>
      <p v-if="m.runMode.value === 'replay' && m.phase.value !== 'done'" class="lab__replay" role="status">
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="m.phase.value !== 'done'"
        :total="m.sessionItems.value.length"
        :progress="m.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="m.phase.value !== 'done'">
        <PromptStage :item="m.item.value" :reveal="m.phase.value === 'right' || m.phase.value === 'wrong'" />
        <p v-if="m.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">✓ {{ t('numberMarket.correct') }}</p>
        <p v-else-if="m.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">✗ {{ t('numberMarket.wrong') }}</p>
        <TileTray
          :pool="m.pool.value"
          :built="m.built.value"
          :phase="m.phase.value"
          @place="m.placeTile"
          @undo="m.undoTile"
          @clear="m.clearTiles"
          @submit="m.submit"
        />
        <button v-if="m.phase.value === 'right' || m.phase.value === 'wrong'" type="button" class="lab__next" @click="m.next">
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="m.score.value"
        :failed-items="m.failedItems.value"
        @restart="restart"
        @replay-failed="m.replayFailed"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 18px; }
.lab__lead { margin: 0; font-family: 'Inter', sans-serif; color: var(--ink-soft, var(--text-soft)); line-height: 1.6; }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
.lab__verdict { margin: 0; font-family: 'Inter', sans-serif; font-size: 15px; }
.lab__verdict--ok { color: var(--accent-bright, #2e7d32); }
.lab__verdict--no { color: var(--danger, #c62828); }
.lab__next { align-self: flex-start; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 18px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.lab__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
```

- [ ] **Step 6: Add the placeholder cover + hub card**

Create `munbeop/public/games/number-market-cover.svg` (placeholder — the PIL pixel-art cover is a
documented follow-up per the cover-art pipeline):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
  <rect width="320" height="180" fill="#1f2a24"/>
  <text x="160" y="78" text-anchor="middle" font-family="'Noto Sans KR', sans-serif" font-size="40" fill="#e8f5e9">숫자 시장</text>
  <text x="160" y="120" text-anchor="middle" font-family="monospace" font-size="20" fill="#a5d6a7">3 · 세 · 시 · 만</text>
</svg>
```

Modify `munbeop/app/pages/practice/index.vue` — add a card in `.hub__grid` (after the counters
card):

```vue
      <GameCard
        to="/practice/number-market"
        :name="t('games.numberMarket.name')"
        :description="t('games.numberMarket.desc')"
        image="/games/number-market-cover.svg"
      />
```

- [ ] **Step 7: Add the i18n keys to all 8 locales**

Add a `numberMarket` block and a `games.numberMarket` entry to every file in
`munbeop/i18n/locales/`. The **English** values (mirror the structure into the other 7; translate
the UI labels, keep the Korean domain labels' meaning but values are localized text, and keep
`master.title` as the Korean 수의 달인 verbatim in every locale):

```jsonc
// add to en.json (top level)
"numberMarket": {
  "title": "Number Market",
  "lead": "Read any quantity in the right system — counting, time, money, dates, phone. Build the Korean reading from the tiles.",
  "build_hint": "Tap the tiles to build the reading",
  "submit": "Check",
  "clear": "Clear",
  "undo": "Undo",
  "correct": "Correct!",
  "wrong": "Not quite",
  "next": "Next",
  "score": "Score",
  "progress": "Round progress",
  "restart": "Pick another domain",
  "replay_failed": "Replay the misses",
  "master": { "title": "수의 달인", "progress": "{done}/{total} domains" },
  "domain": {
    "counting": "Counting (native)",
    "sino_basics": "Sino basics",
    "time": "Telling time",
    "money": "Money",
    "dates": "Dates",
    "phone": "Phone & numbers"
  }
},
// add under the existing "games" object in en.json
"numberMarket": { "name": "Number Market", "desc": "Read any number the Korean way: count, time, money, dates." }
```

Spanish (`es.json`) values for the owner's primary locale:

```jsonc
"numberMarket": {
  "title": "Mercado de Números",
  "lead": "Lee cualquier cantidad en el sistema correcto — contar, hora, dinero, fechas, teléfono. Arma la lectura coreana con las fichas.",
  "build_hint": "Toca las fichas para armar la lectura",
  "submit": "Comprobar",
  "clear": "Limpiar",
  "undo": "Deshacer",
  "correct": "¡Correcto!",
  "wrong": "Casi",
  "next": "Siguiente",
  "score": "Puntaje",
  "progress": "Progreso de la ronda",
  "restart": "Elegir otro dominio",
  "replay_failed": "Repetir los fallos",
  "master": { "title": "수의 달인", "progress": "{done}/{total} dominios" },
  "domain": {
    "counting": "Contar (nativo)",
    "sino_basics": "Sino básico",
    "time": "La hora",
    "money": "Dinero",
    "dates": "Fechas",
    "phone": "Teléfono y números"
  }
},
"numberMarket": { "name": "Mercado de Números", "desc": "Lee cualquier número a la coreana: contar, hora, dinero, fechas." }
```

For `fr`, `pt-BR`, `th`, `id`, `vi`, `ja`: add the same key structure with translated UI labels
(keep `master.title` = `"수의 달인"` verbatim, and `{done}`/`{total}` placeholders intact). To avoid
hand-editing JSON, add the keys with a one-off Node script in `munbeop/` and delete it before
commit, e.g.:

```js
// scripts/_add-nm-i18n.mjs  (TEMPORARY — delete before commit)
import { readFileSync, writeFileSync } from 'node:fs'
const T = {
  fr: { title: 'Marché des nombres', lead: 'Lis n’importe quelle quantité dans le bon système — compter, heure, argent, dates, téléphone. Compose la lecture coréenne avec les tuiles.', build_hint: 'Touche les tuiles pour composer la lecture', submit: 'Vérifier', clear: 'Effacer', undo: 'Annuler', correct: 'Correct !', wrong: 'Presque', next: 'Suivant', score: 'Score', progress: 'Progression de la manche', restart: 'Choisir un autre domaine', replay_failed: 'Rejouer les erreurs', mprog: '{done}/{total} domaines', counting: 'Compter (natif)', sino_basics: 'Sino-coréen', time: 'L’heure', money: 'Argent', dates: 'Dates', phone: 'Téléphone et nombres', gname: 'Marché des nombres', gdesc: 'Lis les nombres à la coréenne : compter, heure, argent, dates.' },
  'pt-BR': { title: 'Mercado de Números', lead: 'Leia qualquer quantidade no sistema certo — contar, hora, dinheiro, datas, telefone. Monte a leitura coreana com as peças.', build_hint: 'Toque nas peças para montar a leitura', submit: 'Verificar', clear: 'Limpar', undo: 'Desfazer', correct: 'Correto!', wrong: 'Quase', next: 'Próximo', score: 'Pontuação', progress: 'Progresso da rodada', restart: 'Escolher outro domínio', replay_failed: 'Repetir os erros', mprog: '{done}/{total} domínios', counting: 'Contar (nativo)', sino_basics: 'Sino básico', time: 'As horas', money: 'Dinheiro', dates: 'Datas', phone: 'Telefone e números', gname: 'Mercado de Números', gdesc: 'Leia qualquer número à coreana: contar, hora, dinheiro, datas.' },
  th: { title: 'ตลาดตัวเลข', lead: 'อ่านจำนวนใดก็ได้ในระบบที่ถูกต้อง — นับ เวลา เงิน วันที่ โทรศัพท์ ประกอบคำอ่านเกาหลีจากแผ่นป้าย', build_hint: 'แตะแผ่นป้ายเพื่อประกอบคำอ่าน', submit: 'ตรวจ', clear: 'ล้าง', undo: 'ย้อนกลับ', correct: 'ถูกต้อง!', wrong: 'เกือบแล้ว', next: 'ถัดไป', score: 'คะแนน', progress: 'ความคืบหน้ารอบนี้', restart: 'เลือกหมวดอื่น', replay_failed: 'เล่นซ้ำข้อที่ผิด', mprog: '{done}/{total} หมวด', counting: 'การนับ (พื้นเมือง)', sino_basics: 'จีน-เกาหลีพื้นฐาน', time: 'บอกเวลา', money: 'เงิน', dates: 'วันที่', phone: 'โทรศัพท์และตัวเลข', gname: 'ตลาดตัวเลข', gdesc: 'อ่านตัวเลขแบบเกาหลี: นับ เวลา เงิน วันที่' },
  id: { title: 'Pasar Angka', lead: 'Baca jumlah apa pun dengan sistem yang tepat — berhitung, waktu, uang, tanggal, telepon. Susun bacaan Korea dari ubin.', build_hint: 'Ketuk ubin untuk menyusun bacaan', submit: 'Periksa', clear: 'Bersihkan', undo: 'Batalkan', correct: 'Benar!', wrong: 'Hampir', next: 'Berikutnya', score: 'Skor', progress: 'Kemajuan ronde', restart: 'Pilih domain lain', replay_failed: 'Ulangi yang salah', mprog: '{done}/{total} domain', counting: 'Berhitung (asli)', sino_basics: 'Sino dasar', time: 'Waktu', money: 'Uang', dates: 'Tanggal', phone: 'Telepon & angka', gname: 'Pasar Angka', gdesc: 'Baca angka ala Korea: berhitung, waktu, uang, tanggal.' },
  vi: { title: 'Chợ Số', lead: 'Đọc bất kỳ số lượng nào theo đúng hệ — đếm, giờ, tiền, ngày tháng, điện thoại. Ghép cách đọc tiếng Hàn từ các ô.', build_hint: 'Chạm vào các ô để ghép cách đọc', submit: 'Kiểm tra', clear: 'Xóa', undo: 'Hoàn tác', correct: 'Chính xác!', wrong: 'Gần đúng', next: 'Tiếp', score: 'Điểm', progress: 'Tiến độ vòng', restart: 'Chọn lĩnh vực khác', replay_failed: 'Chơi lại câu sai', mprog: '{done}/{total} lĩnh vực', counting: 'Đếm (thuần Hàn)', sino_basics: 'Hán-Hàn cơ bản', time: 'Xem giờ', money: 'Tiền', dates: 'Ngày tháng', phone: 'Điện thoại & số', gname: 'Chợ Số', gdesc: 'Đọc số kiểu Hàn: đếm, giờ, tiền, ngày tháng.' },
  ja: { title: '数の市場', lead: 'どんな数量も正しい体系で読む — 数える・時刻・お金・日付・電話。タイルで韓国語の読みを組み立てよう。', build_hint: 'タイルをタップして読みを組み立てる', submit: '確認', clear: 'クリア', undo: '戻す', correct: '正解！', wrong: '惜しい', next: '次へ', score: 'スコア', progress: 'ラウンドの進捗', restart: '別の分野を選ぶ', replay_failed: '間違いを再挑戦', mprog: '{done}/{total} 分野', counting: '数える（固有語）', sino_basics: '漢字語の基礎', time: '時刻', money: 'お金', dates: '日付', phone: '電話・番号', gname: '数の市場', gdesc: '韓国語式に数を読む：数える・時刻・お金・日付。' },
}
for (const [code, v] of Object.entries(T)) {
  const path = `i18n/locales/${code}.json`
  const j = JSON.parse(readFileSync(path, 'utf8'))
  j.numberMarket = {
    title: v.title, lead: v.lead, build_hint: v.build_hint, submit: v.submit, clear: v.clear,
    undo: v.undo, correct: v.correct, wrong: v.wrong, next: v.next, score: v.score,
    progress: v.progress, restart: v.restart, replay_failed: v.replay_failed,
    master: { title: '수의 달인', progress: v.mprog },
    domain: { counting: v.counting, sino_basics: v.sino_basics, time: v.time, money: v.money, dates: v.dates, phone: v.phone },
  }
  j.games = j.games || {}
  j.games.numberMarket = { name: v.gname, desc: v.gdesc }
  writeFileSync(path, JSON.stringify(j, null, 2) + '\n', 'utf8')
}
console.log('added numberMarket keys')
```

Run it, then delete it:

```bash
node scripts/_add-nm-i18n.mjs && rm scripts/_add-nm-i18n.mjs
```

Add the `en.json` + `es.json` blocks by hand (or extend the script's `T` with `en`/`es` the same
way). Keep each JSON file's existing key order otherwise untouched.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `pnpm exec vitest run tests/components/numbers-market/TileTray.test.ts tests/unit/numbers-market/i18n-parity.test.ts`
Expected: PASS (TileTray emits + all 8 locales carry every `numberMarket` key).

- [ ] **Step 9: Full gates**

Run from `munbeop/`:
```bash
pnpm exec vitest run tests/unit/numbers-market tests/components/numbers-market tests/unit/korean/numbers.test.ts
pnpm typecheck
pnpm lint
```
Expected: all green. Fix any `vue-tsc` type errors before committing (the type-only-import gotcha).

- [ ] **Step 10: Commit**

```bash
git add munbeop/app/components/numbers-market munbeop/app/pages/practice/number-market.vue munbeop/app/pages/practice/index.vue munbeop/public/games/number-market-cover.svg munbeop/i18n/locales munbeop/tests/components/numbers-market munbeop/tests/unit/numbers-market/i18n-parity.test.ts
git commit -m "feat(number-market): Learn-mode lab page, tile UI, mastery strip, i18n ×8"
```

---

## Task 6: Manual verification (preview)

**Files:** none (verification only).

- [ ] **Step 1: Run the dev server and exercise the lab**

Start the dev server (preview tooling) and open `/practice/number-market`. Verify:
1. The hub (`/practice`) shows the 숫자 시장 card; clicking it opens the lab.
2. Pick **시간 (time)** → an item renders (e.g. `3:15`); the tile tray shows the correct tiles plus
   the lures (삼 / 열다섯).
3. Build `세 시 십오 분` in order → **Check** → "Correct!" and the reveal shows the answer.
4. Build a wrong order or use a lure → "Not quite"; **Next** advances.
5. Finish the round at ≥ 70% → the 수의 달인 strip shows `1/6` and the **시간** pip fills.
6. Reload → the strip still shows `1/6` (localStorage persisted).
7. The exit button + leave-confirm prompt fire mid-round.

- [ ] **Step 2: Capture proof**

Take a screenshot of a completed correct build (reveal state) and of the `1/6` master strip; share
with the user.

---

## Out of scope (this plan) → Plan 2

Speed mode (속도전, timed 4-choice with combo/streak + best-score persistence) and Dictation
(받아쓰기: 🔊 audio prompt → numeral entry, with the edge-tts asset-gen pipeline) ship in
`docs/superpowers/plans/2026-06-27-number-market-modes.md` (to be written). The seed already carries
`valueKey` for Dictation grading; the engine + drill layer are mode-agnostic, so Plan 2 only adds a
`choices.ts`, an audio helper/composable, two components (ChoiceRow, DictationInput), a ModeToggle,
and timer/score state in `useNumberMarket` — no rework of Plan 1.

## Self-review notes (author)

- **Spec coverage:** engine extension (§Number engine) → Task 1; domain map 6 sets + mastery
  (§domain map) → Tasks 2–4; build-the-reading tiles + wrong-system lures (§Tile mechanic) →
  Tasks 3–5; 수의 달인 badge (§decisions 5) → Task 4; no migration / no SRS (§decisions 5) — no
  store writes added; i18n ×8 + Korean verbatim (§Testing) → Task 5. Speed + Dictation/audio
  (§modes 3) are deferred to Plan 2 (stated above) — not dropped.
- **Type consistency:** `MarketItem` (id/domain/display/answer/tiles/lures/valueKey/trans) defined
  in Task 2 is used unchanged in Tasks 3–5; `DrillResult`/`DrillScore`/`scoreOf`/`itemId`/
  `buildRound`/`tilePool` defined in Task 3 are imported as-is by the Task 4 composable and Task 5
  components; `NumberDomain` / `DomainProgress` / `NUMBER_DOMAINS` names match across Tasks 3–5;
  the composable's returned `master` exposes `perDomain/doneCount/total/earned` exactly as
  `MasterStrip` consumes them.
- **No placeholders:** every code step shows complete content; the only intentionally-templated
  step is the 6-locale i18n script, which is fully written out (not a "translate later" stub).
