# Contractions judge — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 축약 (contractions) set to the Choque drill that teaches 나/저/너/누구 + 가 → 내가/제가/네가/누가, with a new `contraction` verdict (retry on the naive form) reusing the whole drill flow.

**Architecture:** A `ClashSet.kind: 'contraction'` flag + a `DrillVerdict` `contraction` variant. The engine gains a `CONTRACTIONS` map and `kind`-aware `correctForm`/`optionsFor`/`sentenceParts`/`judge`; contraction items provide item-specific full-form options ([내가, 나가]) and assemble the sentence as `lead + contractedForm + rest` (no separate noun). The composable treats `contraction` like `blocked` (retry, no penalty, no 받침-slip). `DrillCard`/`DrillSummary` render via `sentenceParts` so the pronoun isn't double-shown.

**Tech Stack:** Nuxt 4 SPA, Vue 3, TypeScript, Pinia, @nuxtjs/i18n (8 locales), vitest + happy-dom + @vue/test-utils, pnpm. Commands from `munbeop/`.

**Source spec:** `docs/superpowers/specs/2026-06-20-contractions-judge-design.md`.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Edit | `app/lib/domain/particles.ts` | `ClashSet.kind?`, `DrillVerdict` +`contraction` |
| Edit | `app/lib/particle-lab/drill.ts` | `CONTRACTIONS`, `contractionTrap`, `optionsFor`, `sentenceParts`, kind-aware `correctForm`/`correctSentence`/`judge` |
| Edit | `app/seed/clash-sets.ts` | `CONTRACTION_SET` appended to `CLASH_SETS` |
| Edit | `app/composables/useParticleDrill.ts` | `answer()` contraction branch (retry, no slip) |
| Edit | `app/components/particle-lab/DrillCard.vue` | `optionsFor`, `sentenceParts`, contraction feedback block |
| Edit | `app/components/particle-lab/DrillSummary.vue` | review line via `sentenceParts` |
| Edit | `app/seed/particle-drills.ts` | +11 contraction items |
| Edit | `i18n/locales/*.json` | `contraction_title` + `contraction_rule` ×8 |
| Edit | `tests/unit/particle-lab/drill.test.ts` | contraction engine tests |
| Edit | `tests/unit/particle-lab/clash-sets.test.ts` | use `optionsFor`; contraction integrity |
| Edit | `tests/components/particle-lab/DrillCard.test.ts` | contraction options + block |

No SQL, no new SRS plumbing (reuses 이/가).

---

## Verified facts (resolved during planning)

- `DrillCard.vue` renders the stem as three spans: `lead?` + `<span class="drill__noun">{{noun}}</span>` + `gap` + `rest`. **There is no `.drill__noun` CSS rule**, so merging lead+noun into one `before` span (via `sentenceParts`) loses no styling.
- Options come from `deriveOptions(set)` in DrillCard (line 24) and the `clash-sets.test.ts` "correctForm ∈ deriveOptions" test — both must move to `optionsFor(item, set)`.
- `correctForm` is used by: `drill.ts` (judge/correctSentence), `DrillCard` (`answer` + reveal), `DrillSummary` (review line). Returning the full contracted form for contraction items is safe for all three once the card/summary render via `sentenceParts`.
- The composable's `answer()` blocked branch does `slipsThisItem++` + `blockedChoices.add` + `phase='blocked'`. Contraction reuses the retry mechanics but skips `slipsThisItem++` (keeps the 받침-slip metric pure).
- `clash-sets.test.ts` has a "both families represented" assertion that would FAIL for a contraction set (all items `familyIndex 0`) — it must skip `kind==='contraction'` sets.
- `SUBJECT` family (`clash-sets.ts`) = 이/가, grammarKo `이/가`. Contraction set reuses it as `families: [SUBJECT, SUBJECT]` so `familyIndex 0` → grammarKo `이/가` for SRS/diary.

---

## PHASE 1 — Engine + model (TDD)

### Task 1: domain types + engine functions + engine tests

**Files:** edit `app/lib/domain/particles.ts`, `app/lib/particle-lab/drill.ts`, `tests/unit/particle-lab/drill.test.ts`.

- [ ] **Step 1: Extend the domain types** — `app/lib/domain/particles.ts`.

In `ClashSet`, add the `kind` field:

```ts
export interface ClashSet {
  id: string
  /** Particle clash (default) or pronoun+가 contraction. */
  kind?: 'particle' | 'contraction'
  /** Short bilingual name for the set picker. */
  name: LocalizedString
  families: [ClashFamily, ClashFamily]
}
```

Extend `DrillVerdict`:

```ts
export type DrillVerdict =
  | { kind: 'correct' }
  | { kind: 'blocked'; expected: string; nounHasBatchim: boolean }
  | { kind: 'wrong-family'; expected: string; familyId: string }
  | { kind: 'contraction'; expected: string }
```

- [ ] **Step 2: Write failing engine tests** — append to `tests/unit/particle-lab/drill.test.ts` (inside the existing `describe`, after the last test). Add a contraction set fixture at the top of the file (next to the existing `PLACE` const):

```ts
const CONTRACTION: ClashSet = {
  id: 'contraction', kind: 'contraction', name: LS('c'),
  families: [
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}
const naega = item('contraction', 0, '나', ' 갈게요.')
const nuga = item('contraction', 0, '누구', ' 왔어요?')
```

```ts
  it('contraction: correctForm is the fused subject form', () => {
    expect(correctForm(naega, CONTRACTION)).toBe('내가')
    expect(correctForm(nuga, CONTRACTION)).toBe('누가')
  })

  it('contraction: options are the [answer, trap] pair, sorted', () => {
    expect(optionsFor(naega, CONTRACTION)).toEqual(['나가', '내가'])
    expect(optionsFor(nuga, CONTRACTION)).toEqual(['누가', '누구가'])
  })

  it('contraction: sentence assembles the fused form without re-prepending the pronoun', () => {
    expect(correctSentence(naega, CONTRACTION)).toBe('내가 갈게요.')
    expect(sentenceParts(naega, CONTRACTION)).toEqual({ before: '', answer: '내가', after: ' 갈게요.' })
  })

  it('contraction: judges the fused form correct and the naive form a contraction slip', () => {
    expect(judge(naega, '내가', CONTRACTION)).toEqual({ kind: 'correct' })
    expect(judge(naega, '나가', CONTRACTION)).toEqual({ kind: 'contraction', expected: '내가' })
  })

  it('particle sets keep set-wide options via optionsFor', () => {
    expect(optionsFor(mulSubject, TOPIC_SUBJECT)).toEqual(['은', '는', '이', '가'])
  })
```

Add `optionsFor` and `sentenceParts` to the import line in the test file:

```ts
import { correctForm, correctSentence, deriveOptions, judge, optionsFor, scoreOf, sentenceParts } from '~/lib/particle-lab'
```

(`item` and `LS` helpers and `TOPIC_SUBJECT`/`PLACE`/`mulSubject` already exist in this test file from the clash work; reuse them.)

- [ ] **Step 3: Run the tests — expect FAIL** (functions not defined).

Run: `pnpm test tests/unit/particle-lab/drill.test.ts`
Expected: FAIL — `optionsFor`/`sentenceParts` are not exported.

- [ ] **Step 4: Implement the engine** — `app/lib/particle-lab/drill.ts`.

After the imports, add the map + trap helper:

```ts
/** Pronouns whose subject form fuses with 가. */
export const CONTRACTIONS: Record<string, string> = {
  나: '내가',
  저: '제가',
  너: '네가',
  누구: '누가',
}

/** The naive (wrong) uncontracted subject form, e.g. 나 → 나가. */
export function contractionTrap(noun: string): string {
  return `${noun}가`
}
```

Replace `correctForm`:

```ts
export function correctForm(item: DrillItem, set: ClashSet): string {
  if (set.kind === 'contraction') return CONTRACTIONS[item.noun] ?? contractionTrap(item.noun)
  return familyFormFor(set.families[item.familyIndex], item.noun)
}
```

Add `sentenceParts` and rewrite `correctSentence` in terms of it:

```ts
export interface SentenceParts {
  before: string
  answer: string
  after: string
}

/** Render pieces for the gap sentence: `${before}${answer}${after}`. */
export function sentenceParts(item: DrillItem, set: ClashSet): SentenceParts {
  const answer = correctForm(item, set)
  if (set.kind === 'contraction') {
    return { before: item.lead ?? '', answer, after: item.rest }
  }
  return { before: `${item.lead ?? ''}${item.noun}`, answer, after: item.rest }
}

/** Full correct sentence. */
export function correctSentence(item: DrillItem, set: ClashSet): string {
  const p = sentenceParts(item, set)
  return `${p.before}${p.answer}${p.after}`
}
```

Add `optionsFor` (keep `deriveOptions` as-is — `optionsFor` delegates to it for particle sets):

```ts
/** Answer options for THIS item: contraction = [answer, trap] sorted; particle = set-wide. */
export function optionsFor(item: DrillItem, set: ClashSet): string[] {
  if (set.kind === 'contraction') {
    return [correctForm(item, set), contractionTrap(item.noun)].sort()
  }
  return deriveOptions(set)
}
```

Replace `judge`:

```ts
export function judge(item: DrillItem, choice: string, set: ClashSet): DrillVerdict {
  const expected = correctForm(item, set)
  if (choice === expected) return { kind: 'correct' }
  if (set.kind === 'contraction') return { kind: 'contraction', expected }
  const correct = set.families[item.familyIndex]
  if (formsOf(correct).includes(choice)) {
    return { kind: 'blocked', expected, nounHasBatchim: hasBatchim(item.noun) }
  }
  return { kind: 'wrong-family', expected, familyId: correct.id }
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test tests/unit/particle-lab/drill.test.ts`
Expected: PASS (existing particle tests + 5 new contraction tests).
Run: `pnpm typecheck` → clean.

- [ ] **Step 6: Commit**

```bash
git add munbeop/app/lib/domain/particles.ts munbeop/app/lib/particle-lab/drill.ts munbeop/tests/unit/particle-lab/drill.test.ts
git commit -m "feat(particles): contraction-aware drill engine (optionsFor, sentenceParts, verdict)"
```

---

## PHASE 2 — Set, composable, UI

### Task 2: CONTRACTION_SET + composable contraction branch

**Files:** edit `app/seed/clash-sets.ts`, `app/composables/useParticleDrill.ts`.

- [ ] **Step 1: Add `CONTRACTION_SET`** — `app/seed/clash-sets.ts`. After the `CLASH_SETS` array, the existing `SUBJECT` const is in scope. Append the set inside the `CLASH_SETS` array (as the last element):

```ts
  { id: 'from-until', name: pair('부터 vs 까지'), families: [FROM, UNTIL] },
  {
    id: 'contraction',
    kind: 'contraction',
    name: pair('나/저/너/누구 + 가'),
    families: [SUBJECT, SUBJECT],
  },
]
```

(Two `SUBJECT` entries satisfy the `[ClashFamily, ClashFamily]` tuple; `familyIndex 0` → grammarKo `이/가`.)

- [ ] **Step 2: Composable contraction branch** — `app/composables/useParticleDrill.ts`. In `answer()`, after the `blocked` branch, add a `contraction` branch (retry like blocked, but no `slipsThisItem++`):

```ts
    if (v.kind === 'blocked') {
      slipsThisItem.value += 1
      const next = new Set(blockedChoices.value)
      next.add(choice)
      blockedChoices.value = next
      phase.value = 'blocked'
      return
    }
    if (v.kind === 'contraction') {
      const next = new Set(blockedChoices.value)
      next.add(choice)
      blockedChoices.value = next
      phase.value = 'blocked'
      return
    }
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck` → clean. (UI still renders the old options until Task 3, but compiles.)

(No commit yet — commit Phase 2 at the end of Task 3.)

### Task 3: DrillCard + DrillSummary + i18n + DrillCard test

**Files:** edit `app/components/particle-lab/DrillCard.vue`, `app/components/particle-lab/DrillSummary.vue`, all `i18n/locales/*.json`, `tests/components/particle-lab/DrillCard.test.ts`.

- [ ] **Step 1: Add the two i18n keys to every locale** — insert after `replay_mode_label` (added in subproject 3) in each `i18n/locales/<loc>.json` `particles.drill`. Use this script (CRLF-safe, robust to key position):

Create `munbeop/_tmp_contraction_keys.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'
const data = {
  en: { t: 'Contraction!', r: '{pronoun} + 가 contracts to {answer} — not {trap}.' },
  es: { t: '¡Contracción!', r: '{pronoun} + 가 se contrae en {answer}, no {trap}.' },
  fr: { t: 'Contraction !', r: '{pronoun} + 가 se contracte en {answer}, pas {trap}.' },
  'pt-BR': { t: 'Contração!', r: '{pronoun} + 가 contrai para {answer}, não {trap}.' },
  th: { t: 'การย่อรูป!', r: '{pronoun} + 가 ย่อเป็น {answer} ไม่ใช่ {trap}' },
  id: { t: 'Kontraksi!', r: '{pronoun} + 가 menjadi {answer}, bukan {trap}.' },
  vi: { t: 'Rút gọn!', r: '{pronoun} + 가 rút thành {answer}, không phải {trap}.' },
  ja: { t: '縮約！', r: '{pronoun} + 가 は {answer} に縮約。{trap} ではない。' },
}
const re = /^([ \t]*)"replay_mode_label":\s*"[^"]*"/m
for (const [loc, v] of Object.entries(data)) {
  const path = `i18n/locales/${loc}.json`
  const txt = readFileSync(path, 'utf8')
  const eol = txt.includes('\r\n') ? '\r\n' : '\n'
  const m = txt.match(re)
  if (!m) throw new Error('replay_mode_label not found in ' + loc)
  const ind = m[1]
  const ins = m[0] + ',' + eol +
    ind + JSON.stringify('contraction_title') + ': ' + JSON.stringify(v.t) + ',' + eol +
    ind + JSON.stringify('contraction_rule') + ': ' + JSON.stringify(v.r)
  const out = txt.replace(re, () => ins)
  JSON.parse(out)
  writeFileSync(path, out)
  console.log(loc, 'ok')
}
```

Run: `node _tmp_contraction_keys.mjs && rm _tmp_contraction_keys.mjs`
Verify: `node -e "for(const l of ['en','es','fr','pt-BR','th','id','vi','ja']){const d=require('./i18n/locales/'+l+'.json').particles.drill;console.log(l,!!d.contraction_title,!!d.contraction_rule)}"` → all `true true`.

- [ ] **Step 2: `DrillCard.vue` — options + sentenceParts + contraction block.**

Change the import (line 4):

```ts
import { correctForm, correctSentence, optionsFor, sentenceParts } from '~/lib/particle-lab'
```

Replace the `answer`/`options` computeds (lines 22-24) with:

```ts
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const parts = computed(() => sentenceParts(props.item, props.set))
const answer = computed(() => parts.value.answer)
const options = computed(() => optionsFor(props.item, props.set))
```

Replace the `.drill__sentence` block (lines 45-52) with a `parts`-based stem (no separate noun span):

```vue
    <p class="drill__sentence" lang="ko">
      <span v-if="parts.before">{{ parts.before }}</span
      ><span class="drill__gap" :class="{ 'drill__gap--filled': revealed }">{{
        revealed ? parts.answer : '?'
      }}</span
      ><span>{{ parts.after }}</span>
    </p>
```

Add the contraction feedback block — insert it as a new `v-else-if` between the blocked block (ends line 85) and the `v-else-if="revealed"` block (line 87):

```vue
      <div
        v-else-if="phase === 'blocked' && verdict?.kind === 'contraction'"
        class="feedback feedback--blocked"
        data-testid="drill-contraction"
      >
        <h4 class="feedback__title">🔗 {{ t('particles.drill.contraction_title') }}</h4>
        <p class="feedback__body">
          {{
            t('particles.drill.contraction_rule', {
              pronoun: item.noun,
              answer: verdict.expected,
              trap: item.noun + '가',
            })
          }}
        </p>
        <button type="button" class="feedback__btn" @click="emit('retry')">
          {{ t('particles.drill.retry') }}
        </button>
      </div>
```

(`correctForm` stays imported — it is still referenced? No. After this change DrillCard uses `parts.answer`, not `correctForm`. Remove `correctForm` from the import: `import { correctSentence, optionsFor, sentenceParts } from '~/lib/particle-lab'`. `correctSentence` is still used at line 96.)

- [ ] **Step 3: `DrillSummary.vue` — review line via `sentenceParts`.**

Change the import:

```ts
import { sentenceParts } from '~/lib/particle-lab'
```

(remove `correctForm`). Add a helper in `<script setup>`:

```ts
const part = (item: DrillItem) => sentenceParts(item, props.set)
```

`props` must be captured: change `defineProps<Props>()` to `const props = defineProps<Props>()`. Replace the review `<span>` (the line with `correctForm(item, set)`):

```vue
          <span lang="ko" class="summary__item-ko">
            {{ part(item).before }}<strong>{{ part(item).answer }}</strong>{{ part(item).after }}
          </span>
```

- [ ] **Step 4: Run typecheck + the particle-lab + composable tests**

Run: `pnpm typecheck` → clean.
Run: `pnpm test tests/unit/particle-lab tests/components/particle-lab tests/composables/useParticleDrill.test.ts tests/unit/i18n` → DrillCard test will FAIL on the new contraction case added in Step 5; the rest pass (particle options unchanged via `optionsFor`).

- [ ] **Step 5: Extend `DrillCard.test.ts`** — add a contraction case. Add a contraction set + item fixture and a test:

```ts
const CONTRACTION: ClashSet = {
  id: 'contraction', kind: 'contraction', name: LS('축약'),
  families: [
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
    { id: 'subject', grammarKo: '이/가', invariant: false, afterConsonant: '이', afterVowel: '가', label: LS('subject') },
  ],
}
const contractionItem: DrillItem = {
  id: 'ct-na', cue: LS('You volunteer to go'), noun: '나', rest: ' 갈게요.',
  setId: 'contraction', familyIndex: 0, reason: LS('나+가 → 내가'), trans: LS('I will go'),
}

describe('DrillCard — contraction', () => {
  it('renders the fused-form options and no double pronoun', () => {
    const w = mount(DrillCard, { props: { item: contractionItem, set: CONTRACTION, phase: 'question', verdict: null, picked: null, blockedChoices: new Set() } })
    for (const c of ['내가', '나가']) expect(w.find(`[data-testid="drill-option-${c}"]`).exists()).toBe(true)
    expect(w.get('[data-testid="drill-card"]').text()).not.toContain('나내가')
  })
  it('shows the contraction explanation when the naive form is picked', () => {
    const w = mount(DrillCard, { props: { item: contractionItem, set: CONTRACTION, phase: 'blocked', verdict: { kind: 'contraction', expected: '내가' }, picked: '나가', blockedChoices: new Set(['나가']) } })
    expect(w.find('[data-testid="drill-contraction"]').exists()).toBe(true)
    expect(w.find('[data-testid="drill-blocked"]').exists()).toBe(false)
  })
})
```

(The existing DrillCard tests use `LS`/`ClashSet`/`DrillItem` already; reuse them. `DrillOption` renders `data-testid="drill-option-<choice>"` — confirm the prop name; it keys off the `choice`.)

- [ ] **Step 6: Run tests + lint, then commit Phase 2**

Run: `pnpm typecheck` → clean. `pnpm test tests/unit/particle-lab tests/components/particle-lab tests/composables/useParticleDrill.test.ts tests/unit/i18n` → all pass. `npx eslint app/lib app/seed/clash-sets.ts app/composables/useParticleDrill.ts app/components/particle-lab i18n/locales tests/unit/particle-lab tests/components/particle-lab` → exit 0.

```bash
git add munbeop/app/lib munbeop/app/seed/clash-sets.ts munbeop/app/composables/useParticleDrill.ts munbeop/app/components/particle-lab munbeop/i18n/locales munbeop/tests/components/particle-lab
git commit -m "feat(particles): contractions set in the drill (축약, retry verdict, full-form options)"
```

---

## PHASE 3 — Content

### Task 4: 11 contraction items + adversarial verify + integrity test

**Files:** edit `app/seed/particle-drills.ts`, `tests/unit/particle-lab/clash-sets.test.ts`.

The 11 items (Korean fixed; 8-locale `cue`/`reason`/`trans` produced + adversarially verified, then spliced). All `setId: 'contraction'`, `familyIndex: 0`, no `lead`. Answer = `CONTRACTIONS[noun]`.

| id | noun | rest | answer | cue gist | reason gist |
|---|---|---|---|---|---|
| `ct-01-naega-galge` | 나 | ` 갈게요.` | 내가 갈게요. | You volunteer: I'll go | 나+가 fuses to 내가 (never 나가) |
| `ct-02-naega-haesseo` | 나 | ` 했어요.` | 내가 했어요. | You own up: I did it | 나+가 → 내가 |
| `ct-03-naega-mandeureo` | 나 | ` 만들었어요.` | 내가 만들었어요. | You made it, not someone else | 나+가 → 내가 |
| `ct-04-jega-halge` | 저 | ` 할게요.` | 제가 할게요. | You politely volunteer: I'll do it | 저+가 → 제가 (polite) |
| `ct-05-jega-anieyo` | 저 | ` 아니에요.` | 제가 아니에요. | You politely deny: it wasn't me | 저+가 → 제가 |
| `ct-06-jega-naelge` | 저 | ` 낼게요.` | 제가 낼게요. | You offer to pay (polite) | 저+가 → 제가 |
| `ct-07-nega-hae` | 너 | ` 해.` | 네가 해. | You tell a friend: YOU do it | 너+가 → 네가; colloquially said 니가 to avoid sounding like 내가 |
| `ct-08-nega-golla` | 너 | ` 골라.` | 네가 골라. | You let a friend choose | 너+가 → 네가 (spoken 니가) |
| `ct-09-nuga-wasseo` | 누구 | ` 왔어요?` | 누가 왔어요? | You ask: WHO came? | 누구+가 → 누가 |
| `ct-10-nuga-haesseo` | 누구 | ` 했어요?` | 누가 했어요? | You ask: WHO did it? | 누구+가 → 누가 |
| `ct-11-nuga-igyeosseo` | 누구 | ` 이겼어요?` | 누가 이겼어요? | You ask: WHO won? | 누구+가 → 누가 |

- [ ] **Step 1: Run the content Workflow** — author the 8-locale `cue`/`reason`/`trans` for the 11 items and adversarially verify each (per item: assembled `answer + rest` is natural; the cue sets a clear subject context; the contraction is correct; the 너 items' reason notes the 네가→니가 colloquial pronunciation; 8-locale accuracy). Reuse the subproject-3/4 verification harness. Fix anything flagged.

- [ ] **Step 2: Splice + format** — insert the 11 verified items into `PARTICLE_DRILLS` under a `// -- contractions (subproject 5) --` comment. Then:

Run: `npx prettier --write app/seed/particle-drills.ts`
Run: `pnpm typecheck` → clean.

- [ ] **Step 3: Update `clash-sets.test.ts`** — two edits + one new test.

(a) Change the "correctForm ∈ options" test to use `optionsFor` and import it:

```ts
import { correctForm, deriveOptions, optionsFor } from '~/lib/particle-lab'
```

```ts
  it('correctForm is a non-empty option of the set for every item', () => {
    for (const it of PARTICLE_DRILLS) {
      const set = clashSetById(it.setId)!
      const form = correctForm(it, set)
      expect(form.length, it.id).toBeGreaterThan(0)
      expect(optionsFor(it, set), it.id).toContain(form)
    }
  })
```

(b) Make the "both families represented" test skip contraction sets:

```ts
  it('each set has at least 5 items and both families are represented', () => {
    for (const set of CLASH_SETS) {
      const items = PARTICLE_DRILLS.filter((i) => i.setId === set.id)
      expect(items.length, set.id).toBeGreaterThanOrEqual(5)
      if (set.kind === 'contraction') continue
      expect(items.some((i) => i.familyIndex === 0), set.id).toBe(true)
      expect(items.some((i) => i.familyIndex === 1), set.id).toBe(true)
    }
  })
```

(c) Add a contraction-set integrity test (import `CONTRACTIONS`):

```ts
import { correctForm, deriveOptions, optionsFor, CONTRACTIONS } from '~/lib/particle-lab'
```

```ts
  it('contraction items are well-formed (familyIndex 0, noun is a known pronoun)', () => {
    const items = PARTICLE_DRILLS.filter((i) => i.setId === 'contraction')
    expect(items.length).toBeGreaterThanOrEqual(10)
    for (const it of items) {
      expect(it.familyIndex, it.id).toBe(0)
      expect(Object.keys(CONTRACTIONS), it.id).toContain(it.noun)
    }
  })
```

(The existing "≥10 items per set" test from subproject 3 already covers the contraction set's count too.)

- [ ] **Step 4: Verify + commit**

Run: `pnpm test tests/unit/particle-lab` → pass. `npx eslint app/seed/particle-drills.ts tests/unit/particle-lab/clash-sets.test.ts` → exit 0.

```bash
git add munbeop/app/seed/particle-drills.ts munbeop/tests/unit/particle-lab/clash-sets.test.ts
git commit -m "feat(particles): 11 contraction drill items (나/저/너/누구 + 가), adversarially verified"
```

---

## PHASE 4 — Final verification + finish

### Task 5: Full gates

- [ ] Run: `pnpm test && pnpm typecheck && pnpm lint`. All green, 0 lint errors.
- [ ] Manual (logged in, `/practice/particles`, ⚡ drill): the picker shows 축약; picking 나가 shows "나 + 가 → 내가" and lets you retry; 내가 is correct; the sentence reads "내가 갈게요." (no "나내가"); 누가 왔어요? works; replay/repasar-fallos work; diary/SRS write to 이/가.

### Task 6: Finish the branch

- [ ] Update memory `project_particle_lab.md`: mark subproject #5 shipped with PR number/commit.
- [ ] `superpowers:finishing-a-development-branch`: push → `gh pr create` → `gh pr merge --merge`. Merge `origin/main` first if it diverged; retry the async mergeability check once.

---

## Self-review

**Spec coverage:** model (`kind` + verdict) → Task 1; engine (CONTRACTIONS/optionsFor/sentenceParts/judge) → Task 1; set → Task 2; composable retry-no-slip → Task 2; UI (card options/parts/block, summary parts) + i18n → Task 3; content (≥10 items, verified) → Task 4; tests (engine, integrity, component) → Tasks 1/3/4; gates + finish → Phase 4. All spec sections (A–G) covered.

**Placeholder scan:** The only deferred content is the 8-locale `cue`/`reason`/`trans` for the 11 items — produced and adversarially verified by the Task 4 Workflow from the fully-specified Korean + English gists (the repo's standard pattern). All code (types, engine, set, composable, components, i18n keys, tests) is concrete.

**Type consistency:** `ClashSet.kind` + `DrillVerdict.contraction` (Task 1) are consumed by the engine (Task 1), composable (Task 2 `v.kind === 'contraction'`), and card (`verdict?.kind === 'contraction'`, Task 3). `optionsFor(item, set)` and `sentenceParts(item, set)` (Task 1) are used by DrillCard + DrillSummary (Task 3), the engine test (Task 1) and integrity test (Task 4). `CONTRACTIONS` (Task 1) is used by the integrity test (Task 4). The contraction set id `'contraction'` matches between `clash-sets.ts` (Task 2) and the seed items + tests (Task 4). `contraction_title`/`contraction_rule` keys (Task 3 i18n) match the card's `t(...)` calls.
```
