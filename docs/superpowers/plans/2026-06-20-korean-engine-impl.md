# Korean morphology engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pure `app/lib/korean/` engine that conjugates Korean verbs (Core TOPIK-1: -아/어 + -(으) families, all 7 irregular classes + 하다 + ㄹ-drop) and attaches particles, validated against a 340-row + 60-row adversarially-verified golden table.

**Architecture:** `hangul.ts` (jamo decompose/compose) → `conjugate.ts` + `particles.ts` (rule engines) over a curated class-tagged `dataset.ts`. Golden-table-driven TDD. Spec: `docs/superpowers/specs/2026-06-20-korean-engine-design.md`.

**Tech Stack:** TypeScript (pure, no Vue/Supabase), Vitest (happy-dom), pnpm.

**Working directory:** all paths relative to `munbeop/`; run from `munbeop/`. Branch: `claude/korean-engine`. The verified golden data is at `C:\Users\home\AppData\Local\Temp\korean-golden.json`.

**Verified facts:** 340 conjugations + 60 particles + 80 verbs + 10 nouns, 0 adversarial corrections; spot-checked (돕다→도와요/도우니까, 살다→사니까/살면, 빠르다→빨라요/빠르니까, 그렇다→그래요/그러니까, 짓다→지어요/지으니까). Hangul syllable = (lead×21 + vowel)×28 + tail + 0xAC00; LEADS=19, VOWELS=21, TAILS=28.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/lib/korean/hangul.ts` | `decompose`/`compose` jamo, `endsInConsonant`, `finalJamo`, `stemOf`. |
| `app/lib/korean/types.ts` | `VerbClass`, `Ending` (+ `ENDINGS`), `Particle` (+ `PARTICLES`). |
| `app/lib/korean/conjugate.ts` | `conjugate(dict, klass, ending)`. |
| `app/lib/korean/particles.ts` | `attachParticle(noun, particle)`. |
| `app/lib/korean/dataset.ts` | `VERBS` (80) + `NOUNS` (10) — generated. |
| `app/lib/korean/index.ts` | Public re-exports. |
| `tests/unit/korean/golden.ts` | `GOLDEN_CONJUGATIONS` + `GOLDEN_PARTICLES` — generated. |
| `tests/unit/korean/*.test.ts` | hangul, conjugate (×340), particles (×60), dataset integrity. |
| `tools/korean/gen-golden.mjs` | One-off generator for golden.ts + dataset.ts. |

---

## Task 1: types.ts + generate golden.ts & dataset.ts

**Files:** Create `app/lib/korean/types.ts`, `tools/korean/gen-golden.mjs`; Generate `tests/unit/korean/golden.ts`, `app/lib/korean/dataset.ts`

- [ ] **Step 1: Create `app/lib/korean/types.ts`**

```ts
export type VerbClass =
  | 'regular' | 'hada' | 'p_irr' | 't_irr'
  | 'eu_elision' | 'reu_irr' | 'h_irr' | 's_irr' | 'l_drop'

export const ENDINGS = ['-아/어요', '-았/었어요', '-(으)니까', '-(으)면', '-(으)세요', '-(으)ㄹ 거예요'] as const
export type Ending = (typeof ENDINGS)[number]

export const PARTICLES = ['은/는', '이/가', '을/를', '와/과', '(으)로', '(이)나'] as const
export type Particle = (typeof PARTICLES)[number]
```

- [ ] **Step 2: Create the generator `tools/korean/gen-golden.mjs`**

```js
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const data = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'korean-golden.json'), 'utf8'))
const q = (s) => JSON.stringify(s)

const conj = data.goldenConjugations
  .map((r) => `  { dict: ${q(r.dict)}, klass: ${q(r.klass)}, ending: ${q(r.ending)}, surface: ${q(r.surface)} },`)
  .join('\n')
const part = data.goldenParticles
  .map((r) => `  { noun: ${q(r.noun)}, particle: ${q(r.particle)}, surface: ${q(r.surface)} },`)
  .join('\n')
fs.writeFileSync(
  'tests/unit/korean/golden.ts',
  `// Generated from the adversarially-verified workflow output. Do not hand-edit.\n` +
  `import type { Ending, Particle, VerbClass } from '~/lib/korean'\n\n` +
  `export const GOLDEN_CONJUGATIONS: { dict: string; klass: VerbClass; ending: Ending; surface: string }[] = [\n${conj}\n]\n\n` +
  `export const GOLDEN_PARTICLES: { noun: string; particle: Particle; surface: string }[] = [\n${part}\n]\n`,
)

const verbs = data.datasetVerbs
  .map((v) => `  { dict: ${q(v.dict)}, gloss: ${q(v.gloss)}, klass: ${q(v.klass)} },`)
  .join('\n')
const nouns = data.datasetNouns
  .map((n) => `  { noun: ${q(n.noun)}, gloss: ${q(n.gloss ?? '')}, endsInConsonant: ${n.endsInConsonant}, endsInRieul: ${n.endsInRieul} },`)
  .join('\n')
fs.writeFileSync(
  'app/lib/korean/dataset.ts',
  `// Generated curated dataset. Do not hand-edit.\n` +
  `import type { VerbClass } from './types'\n\n` +
  `export interface DatasetVerb { dict: string; gloss: string; klass: VerbClass }\n` +
  `export interface DatasetNoun { noun: string; gloss: string; endsInConsonant: boolean; endsInRieul: boolean }\n\n` +
  `export const VERBS: DatasetVerb[] = [\n${verbs}\n]\n\n` +
  `export const NOUNS: DatasetNoun[] = [\n${nouns}\n]\n`,
)
console.log(`golden: ${data.goldenConjugations.length} conj + ${data.goldenParticles.length} particles; dataset: ${data.datasetVerbs.length} verbs + ${data.datasetNouns.length} nouns`)
```

- [ ] **Step 3: Run the generator**

Run: `mkdir -p tests/unit/korean app/lib/korean tools/korean && node tools/korean/gen-golden.mjs`
Expected: prints `golden: 340 conj + 60 particles; dataset: 80 verbs + 10 nouns`; creates `tests/unit/korean/golden.ts` and `app/lib/korean/dataset.ts`.

- [ ] **Step 4: Commit**

```bash
git add app/lib/korean/types.ts app/lib/korean/dataset.ts tests/unit/korean/golden.ts tools/korean/gen-golden.mjs
git commit -m "feat(korean): types + generated golden table & curated dataset

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: hangul.ts (jamo decompose/compose)

**Files:** Create `app/lib/korean/hangul.ts`; Test `tests/unit/korean/hangul.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/korean/hangul.test.ts
import { describe, it, expect } from 'vitest'
import { compose, decompose, endsInConsonant, finalJamo, stemOf } from '~/lib/korean/hangul'

describe('hangul', () => {
  it('decomposes and recomposes every syllable (roundtrip)', () => {
    for (const s of ['먹', '가', '서', '울', '닭', '뷁', '힣', '갂']) {
      const { lead, vowel, tail } = decompose(s)
      expect(compose(lead, vowel, tail)).toBe(s)
    }
  })
  it('decomposes known jamo indices', () => {
    expect(decompose('가')).toEqual({ lead: 0, vowel: 0, tail: 0 }) // ㄱㅏ
    expect(decompose('먹')).toEqual({ lead: 6, vowel: 4, tail: 1 }) // ㅁㅓㄱ
  })
  it('detects batchim and the final jamo', () => {
    expect(endsInConsonant('책')).toBe(true)
    expect(endsInConsonant('사과')).toBe(false)
    expect(endsInConsonant('서울')).toBe(true)
    expect(finalJamo('서울')).toBe('ㄹ')
    expect(finalJamo('책')).toBe('ㄱ')
  })
  it('strips 다 to get the stem', () => {
    expect(stemOf('먹다')).toBe('먹')
    expect(stemOf('공부하다')).toBe('공부하')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/korean/hangul.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `app/lib/korean/hangul.ts`**

```ts
const SBASE = 0xac00
const VCOUNT = 21
const TCOUNT = 28
const NCOUNT = VCOUNT * TCOUNT // 588

export const TAILS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

export interface Jamo {
  lead: number
  vowel: number
  tail: number
}

export function decompose(syllable: string): Jamo {
  const code = syllable.charCodeAt(0) - SBASE
  if (code < 0 || code >= 11172) throw new Error(`not a Hangul syllable: ${syllable}`)
  const tail = code % TCOUNT
  const vowel = Math.floor((code % NCOUNT) / TCOUNT)
  const lead = Math.floor(code / NCOUNT)
  return { lead, vowel, tail }
}

export function compose(lead: number, vowel: number, tail: number): string {
  return String.fromCharCode(SBASE + (lead * VCOUNT + vowel) * TCOUNT + tail)
}

/** True if the last syllable carries a final consonant (받침). */
export function endsInConsonant(s: string): boolean {
  return decompose(s[s.length - 1]!).tail !== 0
}

/** The final consonant jamo of the last syllable, or '' if none. */
export function finalJamo(s: string): string {
  return TAILS[decompose(s[s.length - 1]!).tail]!
}

/** Drop the dictionary 다 to get the verb stem. */
export function stemOf(dict: string): string {
  return dict.endsWith('다') ? dict.slice(0, -1) : dict
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/korean/hangul.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/korean/hangul.ts tests/unit/korean/hangul.test.ts
git commit -m "feat(korean): hangul jamo decompose/compose + batchim helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: particles.ts + index.ts

**Files:** Create `app/lib/korean/particles.ts`, `app/lib/korean/index.ts`; Test `tests/unit/korean/particles.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/korean/particles.test.ts
import { describe, it, expect } from 'vitest'
import { attachParticle } from '~/lib/korean'
import { GOLDEN_PARTICLES } from './golden'

describe('attachParticle (golden 60)', () => {
  it.each(GOLDEN_PARTICLES)('$noun + $particle → $surface', ({ noun, particle, surface }) => {
    expect(attachParticle(noun, particle)).toBe(surface)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/korean/particles.test.ts`
Expected: FAIL — `~/lib/korean` has no `attachParticle`.

- [ ] **Step 3: Implement `app/lib/korean/particles.ts`**

```ts
import { endsInConsonant, finalJamo } from './hangul'
import type { Particle } from './types'

// [after-consonant, after-vowel]
const TABLE: Record<Particle, readonly [string, string]> = {
  '은/는': ['은', '는'],
  '이/가': ['이', '가'],
  '을/를': ['을', '를'],
  '와/과': ['과', '와'],
  '(으)로': ['으로', '로'],
  '(이)나': ['이나', '나'],
}

export function attachParticle(noun: string, particle: Particle): string {
  const consonant = endsInConsonant(noun)
  // Special: instrumental (으)로 takes plain 로 after a ㄹ-final noun.
  if (particle === '(으)로' && consonant && finalJamo(noun) === 'ㄹ') return noun + '로'
  const [afterC, afterV] = TABLE[particle]
  return noun + (consonant ? afterC : afterV)
}
```

- [ ] **Step 4: Create `app/lib/korean/index.ts`**

```ts
export * from './types'
export * from './hangul'
export { conjugate } from './conjugate'
export { attachParticle } from './particles'
export { VERBS, NOUNS, type DatasetVerb, type DatasetNoun } from './dataset'
```

(`conjugate` lands in Task 4; this export is added now so `~/lib/korean` is the single public surface — Task 4's test imports `conjugate` from here.)

- [ ] **Step 5: Run to verify particles pass**

Run: `pnpm vitest run tests/unit/korean/particles.test.ts`
Expected: FAIL to import (conjugate not yet defined) — create a temporary stub OR reorder: implement Task 4 conjugate first. To keep this task green standalone, TEMPORARILY change `index.ts` to omit the conjugate line, run particles (PASS, 60), then restore the conjugate export in Task 4.

Simpler: implement `conjugate.ts` minimal stub now so `index.ts` resolves:

Create `app/lib/korean/conjugate.ts` stub:
```ts
import type { Ending, VerbClass } from './types'
export function conjugate(_dict: string, _klass: VerbClass, _ending: Ending): string {
  throw new Error('not implemented')
}
```

Run: `pnpm vitest run tests/unit/korean/particles.test.ts`
Expected: PASS (60 golden particle rows).

- [ ] **Step 6: Commit**

```bash
git add app/lib/korean/particles.ts app/lib/korean/index.ts app/lib/korean/conjugate.ts tests/unit/korean/particles.test.ts
git commit -m "feat(korean): particle allomorph resolver + public index

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: conjugate.ts (the engine) — golden-driven to green

**Files:** Modify `app/lib/korean/conjugate.ts`; Test `tests/unit/korean/conjugate.test.ts`

- [ ] **Step 1: Write the failing test (all 340)**

```ts
// tests/unit/korean/conjugate.test.ts
import { describe, it, expect } from 'vitest'
import { conjugate } from '~/lib/korean'
import { GOLDEN_CONJUGATIONS } from './golden'

describe('conjugate (golden 340)', () => {
  it.each(GOLDEN_CONJUGATIONS)('$dict [$klass] + $ending → $surface', ({ dict, klass, ending, surface }) => {
    expect(conjugate(dict, klass, ending)).toBe(surface)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/korean/conjugate.test.ts`
Expected: FAIL — the stub throws for every row.

- [ ] **Step 3: Implement the full `app/lib/korean/conjugate.ts`**

```ts
import { compose, decompose, stemOf } from './hangul'
import type { Ending, VerbClass } from './types'

// vowel indices (VOWELS order)
const A = 0, AE = 1, YA = 2, YAE = 3, EO = 4, E = 5, YEO = 6, YE = 7,
  O = 8, WA = 9, WAE = 10, OE = 11, U = 13, WEO = 14, EU = 18, I = 20
// tail indices (TAILS order)
const T_NONE = 0, T_L = 8, T_SS = 20
const LEAD_IEUNG = 11, LEAD_R = 5

const BRIGHT = new Set([A, O])
/** Harmonic vowel: bright stems take 아 (A); everything else 어 (EO). */
function harm(vowel: number): number {
  return BRIGHT.has(vowel) ? A : EO
}

// ㅂ→오 (not 우) before -아/어 for these monosyllabic stems.
const SPECIAL_O = new Set(['돕다', '곱다'])
// ㅎ-irregular vowel fusion before -아/어: stem vowel → ㅐ/ㅒ.
const H_FUSE: Record<number, number> = { [A]: AE, [EO]: AE, [YA]: YAE, [YEO]: YE, [I]: AE }

/** Contract a vowel-final stem vowel with the harmonic 아(A)/어(EO); -1 ⇒ append a separate syllable. */
function contract(stemV: number, h: number): number {
  if (h === A) {
    if (stemV === A) return A // 가+아→가
    if (stemV === O) return WA // 보/오+아→봐/와
    return -1
  }
  if (stemV === U) return WEO // 주+어→줘
  if (stemV === I) return YEO // 마시+어→마셔
  if (stemV === OE) return WAE // 되+어→돼
  if (stemV === EO) return EO // 서+어→서
  if (stemV === AE) return AE
  if (stemV === E) return E
  return -1
}

/** The -아/어 form, without 요/ㅆ (e.g. 먹어, 가, 봐, 더워, 들어, 바빠, 빨라, 그래, 지어, 도와, 공부해, 마셔, 살아). */
function applyAe(dict: string, klass: VerbClass): string {
  const stem = stemOf(dict)
  if (klass === 'hada') return stem.slice(0, -1) + '해'
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  const h = harm(vowel)

  if (klass === 'eu_elision') {
    const hh = rest ? harm(decompose(rest[rest.length - 1]!).vowel) : EO
    return rest + compose(lead, hh, T_NONE)
  }
  if (klass === 'reu_irr') {
    const before = decompose(rest[rest.length - 1]!)
    const hh = harm(before.vowel)
    return rest.slice(0, -1) + compose(before.lead, before.vowel, T_L) + compose(LEAD_R, hh, T_NONE)
  }
  if (klass === 'p_irr') {
    const wv = SPECIAL_O.has(dict) ? O : U
    return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, contract(wv, h), T_NONE)
  }
  if (klass === 't_irr') {
    return rest + compose(lead, vowel, T_L) + compose(LEAD_IEUNG, h, T_NONE)
  }
  if (klass === 's_irr') {
    return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, h, T_NONE)
  }
  if (klass === 'h_irr') {
    return rest + compose(lead, H_FUSE[vowel] ?? vowel, T_NONE)
  }
  // regular / l_drop (both regular in the -아/어 family)
  if (tail === T_NONE) {
    const cv = contract(vowel, h)
    if (cv >= 0) return rest + compose(lead, cv, T_NONE)
    return stem + compose(LEAD_IEUNG, h, T_NONE)
  }
  return stem + compose(LEAD_IEUNG, h, T_NONE)
}

/** Add a ㅆ tail to the last (open) syllable: 먹어→먹었, 가→갔, 봐→봤, 마셔→마셨. */
function addSsTail(form: string): string {
  const j = decompose(form[form.length - 1]!)
  return form.slice(0, -1) + compose(j.lead, j.vowel, T_SS)
}

/** -(으)ㄹ adnominal stem before ' 거예요' (e.g. 먹을, 갈, 더울, 들을, 살, 만들). */
function applyRieul(dict: string, klass: VerbClass): string {
  const stem = stemOf(dict)
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  if (klass === 'l_drop') return stem // the stem ㄹ IS the (으)ㄹ
  if (klass === 'p_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, U, T_L) // 더 + 울
  if (klass === 't_irr') return rest + compose(lead, vowel, T_L) + compose(LEAD_IEUNG, EU, T_L) // 들 + 을
  if (klass === 's_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, EU, T_L) // 지 + 을
  if (klass === 'h_irr') return rest + compose(lead, vowel, T_L) // 그러 → 그럴
  if (klass === 'hada' || tail === T_NONE) return rest + compose(lead, vowel, T_L) // vowel-final (incl eu/reu): add ㄹ tail
  return stem + compose(LEAD_IEUNG, EU, T_L) // regular consonant: + 을
}

/** The -(으)니까 / -(으)면 / -(으)세요 endings. */
function applyEuBody(dict: string, klass: VerbClass, body: string, dropRieul: boolean): string {
  const stem = stemOf(dict)
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  const EU_SYL = compose(LEAD_IEUNG, EU, T_NONE)
  if (tail === T_NONE) return stem + body // vowel-final (incl eu_elision, reu_irr, hada)
  if (klass === 'l_drop') return (dropRieul ? rest + compose(lead, vowel, T_NONE) : stem) + body
  if (klass === 'p_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, U, T_NONE) + body // 더 + 우 + body
  if (klass === 't_irr') return rest + compose(lead, vowel, T_L) + EU_SYL + body // 들 + 으 + body
  if (klass === 's_irr') return rest + compose(lead, vowel, T_NONE) + EU_SYL + body // 지 + 으 + body
  if (klass === 'h_irr') return rest + compose(lead, vowel, T_NONE) + body // 그러 + body (no 으)
  return stem + EU_SYL + body // regular consonant: 먹 + 으 + body
}

export function conjugate(dict: string, klass: VerbClass, ending: Ending): string {
  switch (ending) {
    case '-아/어요':
      return applyAe(dict, klass) + '요'
    case '-았/었어요':
      return addSsTail(applyAe(dict, klass)) + '어요'
    case '-(으)니까':
      return applyEuBody(dict, klass, '니까', true)
    case '-(으)면':
      return applyEuBody(dict, klass, '면', false) // ㄹ kept before ㅁ
    case '-(으)세요':
      return applyEuBody(dict, klass, '세요', true)
    case '-(으)ㄹ 거예요':
      return applyRieul(dict, klass) + ' 거예요'
    default: {
      const never: never = ending
      throw new Error(`unknown ending: ${String(never)}`)
    }
  }
}
```

- [ ] **Step 4: Run the golden conjugation test; iterate to green**

Run: `pnpm vitest run tests/unit/korean/conjugate.test.ts`
Expected: PASS (all 340). If any rows fail, the failure prints `dict [klass] + ending → expected` vs received — fix the relevant branch in `conjugate.ts` (the golden table is authoritative) and re-run until 340/340 pass. Do NOT edit `golden.ts` (it is verified).

- [ ] **Step 5: Commit**

```bash
git add app/lib/korean/conjugate.ts tests/unit/korean/conjugate.test.ts
git commit -m "feat(korean): conjugator — harmony, 으-insertion, all irregular classes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: dataset integrity test

**Files:** Test `tests/unit/korean/dataset.test.ts`

- [ ] **Step 1: Write the test**

```ts
// tests/unit/korean/dataset.test.ts
import { describe, it, expect } from 'vitest'
import { conjugate, attachParticle, endsInConsonant, finalJamo, ENDINGS, PARTICLES, VERBS, NOUNS } from '~/lib/korean'
import type { VerbClass } from '~/lib/korean'

const KLASSES: VerbClass[] = ['regular', 'hada', 'p_irr', 't_irr', 'eu_elision', 'reu_irr', 'h_irr', 's_irr', 'l_drop']

describe('dataset integrity', () => {
  it('has 80 verbs and 10 nouns', () => {
    expect(VERBS).toHaveLength(80)
    expect(NOUNS).toHaveLength(10)
  })
  it('every verb has a valid class and conjugates through all endings without throwing', () => {
    for (const v of VERBS) {
      expect(KLASSES).toContain(v.klass)
      for (const ending of ENDINGS) {
        const out = conjugate(v.dict, v.klass, ending)
        expect(out.length, `${v.dict} + ${ending}`).toBeGreaterThan(0)
        // result is Hangul (no leftover jamo / latin)
        expect(out, `${v.dict} + ${ending}`).toMatch(/^[가-힣 ]+$/)
      }
    }
  })
  it('noun batchim flags match the hangul analyzer, and every particle attaches', () => {
    for (const n of NOUNS) {
      expect(endsInConsonant(n.noun)).toBe(n.endsInConsonant)
      expect(finalJamo(n.noun) === 'ㄹ').toBe(n.endsInRieul)
      for (const p of PARTICLES) expect(attachParticle(n.noun, p).length).toBeGreaterThan(n.noun.length)
    }
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm vitest run tests/unit/korean/dataset.test.ts`
Expected: PASS. (If a verb throws or yields non-Hangul, fix `conjugate.ts` for that class/ending combo — these are combos beyond the golden subset but must still be well-formed.)

- [ ] **Step 3: Commit**

```bash
git add tests/unit/korean/dataset.test.ts
git commit -m "test(korean): dataset integrity — every verb conjugates cleanly

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Final verification

- [ ] **Step 1: Full verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green (the whole suite, incl. the ~400 new Korean assertions). The engine is pure — no Vue/Supabase/i18n, no migration.

- [ ] **Step 2: Confirm scope** — engine-only (no drill UI); Core TOPIK-1 endings; no honorifics; no typed grading. Drill is Step 5b.

---

## Self-Review

**Spec coverage:** hangul → T2; types → T1; conjugate (340 golden) → T4; particles (60 golden) → T3; dataset (80/10) → T1+T5; index → T3. All covered.

**Type consistency:** `VerbClass`/`Ending`/`Particle` (T1) used identically in conjugate (T4), particles (T3), golden/dataset (generated, T1), and the dataset test (T5). `conjugate(dict, klass, ending)` and `attachParticle(noun, particle)` signatures match across tests and impl. `~/lib/korean` is the single import surface.

**Placeholder scan:** golden.ts and dataset.ts are generated (not hand-placeholdered) from the verified JSON; the conjugate stub in T3 is explicitly replaced in T4. No code placeholders.
