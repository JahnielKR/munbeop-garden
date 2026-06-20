# Onboarding (empty plot + guided first sentence) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give a brand-new mungarden user a distinct empty-plot state and one guided first sentence (template with a blanked conjugation slot) that writes real progress and ends in a celebratory sprout.

**Architecture:** Pure logic in `app/lib/onboarding/` (starter + gate), a `useOnboarding` composable owning the localStorage flag and the real log/SRS write, two components (`EmptyPlot`, `GuidedFirstSentence` over the existing accessible `Modal`), wired into `app/pages/index.vue`. No new tables, no migration. Spec: `docs/superpowers/specs/2026-06-20-onboarding-first-sentence-design.md`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest (happy-dom), @nuxtjs/i18n (8 locales), pnpm.

**Working directory:** all paths are relative to `munbeop/`; run all commands from `munbeop/`.

**Verified facts this plan relies on:**
- Starter grammar `-아/어서` exists in the catalog (`app/seed/grammars-n1.ts:1006`, TOPIK-1).
- `useAppStatus().status` ∈ `'idle'|'loading'|'ready'|'error'` (`app/stores/appStatus.ts`).
- `logStore.add(p)` returns the new `LogEntry`, unshifts it, appends O(1) (`app/stores/log.ts:19`).
- Default first active context is `banmal` / 반말 (`app/seed/contexts.ts:15`).
- Test harness: happy-dom, `useI18n` is a global key-echo stub, Vue primitives are globals, `~`→`app/` (`tests/setup.ts`, `vitest.config.ts`). Teleport tested via `attachTo: document.body` + `global.stubs.Teleport: false` (`tests/components/Modal.test.ts`).

---

## File Structure

| File | Responsibility |
|---|---|
| `app/lib/onboarding/starter.ts` (create) | `STARTER` definition + `parseTemplate`. Pure, no Vue. |
| `app/lib/onboarding/gate.ts` (create) | `shouldShowOnboarding`. Pure. |
| `app/composables/useOnboarding.ts` (create) | localStorage flag, `shouldShow`/`showEmptyPlot`, `start`/`skip`/`complete` (real log + SRS write). |
| `app/components/garden/EmptyPlot.vue` (create) | Distinct zero-state plot + CTA emitting `start`. |
| `app/components/onboarding/GuidedFirstSentence.vue` (create) | The guided overlay over `Modal`; emits `complete`/`skip`. |
| `app/pages/index.vue` (modify) | Gate: EmptyPlot vs hero; mount the overlay; auto-open. |
| `i18n/locales/*.json` ×8 (modify) | `onboarding.*` keys. |
| `tests/unit/onboarding/starter.test.ts` (create) | parseTemplate + STARTER invariants. |
| `tests/unit/onboarding/gate.test.ts` (create) | gate truth table. |
| `tests/unit/composables/useOnboarding.test.ts` (create) | complete/skip/shouldShow with mocked adapter. |
| `tests/unit/i18n/onboarding-keys.test.ts` (create) | 8-locale parity + 화이팅 brand check. |
| `tests/components/garden/EmptyPlot.test.ts` (create) | renders CTA, emits start. |
| `tests/components/onboarding/GuidedFirstSentence.test.ts` (create) | reveal → complete(composed); close → skip. |

---

## Task 1: Starter definition + `parseTemplate` (pure)

**Files:**
- Create: `app/lib/onboarding/starter.ts`
- Test: `tests/unit/onboarding/starter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/onboarding/starter.test.ts
import { describe, it, expect } from 'vitest'
import { STARTER, parseTemplate, BLANK_MARKER } from '~/lib/onboarding/starter'

describe('parseTemplate', () => {
  it('splits a template into before/after around the blank marker', () => {
    expect(parseTemplate(`a${BLANK_MARKER}b`)).toEqual({ before: 'a', after: 'b' })
  })
  it('handles a marker at the start and end', () => {
    expect(parseTemplate(`${BLANK_MARKER}tail`)).toEqual({ before: '', after: 'tail' })
    expect(parseTemplate(`head${BLANK_MARKER}`)).toEqual({ before: 'head', after: '' })
  })
  it('throws when the template has no blank marker', () => {
    expect(() => parseTemplate('no blank here')).toThrow()
  })
})

describe('STARTER', () => {
  it('model sentence equals before + blankAnswer + after', () => {
    const { before, after } = parseTemplate(STARTER.templateKo)
    expect(before + STARTER.blankAnswer + after).toBe(STARTER.modelSentenceKo)
  })
  it('references a non-empty grammar key', () => {
    expect(STARTER.grammarKo.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/onboarding/starter.test.ts`
Expected: FAIL — cannot resolve `~/lib/onboarding/starter`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/lib/onboarding/starter.ts
/**
 * Deterministic onboarding starter: one TOPIK-1 pattern with its grammar
 * conjugation slot blanked. Authored content — `grammarKo` MUST exist in the
 * catalog (verified: '-아/어서' in app/seed/grammars-n1.ts). The model sentence
 * is 반말 to match the default first context (반말), so the recorded diary
 * entry reads coherently.
 */
export const BLANK_MARKER = '___'

export interface Starter {
  grammarKo: string
  templateKo: string
  blankAnswer: string
  modelSentenceKo: string
}

export const STARTER: Starter = {
  grammarKo: '-아/어서',
  templateKo: '주말에 친구를 만나___ 기분이 좋았어',
  blankAnswer: '서',
  modelSentenceKo: '주말에 친구를 만나서 기분이 좋았어',
}

export interface TemplateParts {
  before: string
  after: string
}

/** Split a template on the single blank marker. Throws if absent. */
export function parseTemplate(tpl: string): TemplateParts {
  const i = tpl.indexOf(BLANK_MARKER)
  if (i === -1) throw new Error(`template has no blank marker "${BLANK_MARKER}": ${tpl}`)
  return { before: tpl.slice(0, i), after: tpl.slice(i + BLANK_MARKER.length) }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/onboarding/starter.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/onboarding/starter.ts tests/unit/onboarding/starter.test.ts
git commit -m "feat(onboarding): starter definition + parseTemplate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `shouldShowOnboarding` gate (pure)

**Files:**
- Create: `app/lib/onboarding/gate.ts`
- Test: `tests/unit/onboarding/gate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/onboarding/gate.test.ts
import { describe, it, expect } from 'vitest'
import { shouldShowOnboarding } from '~/lib/onboarding/gate'

describe('shouldShowOnboarding', () => {
  it('is true only when ready AND log empty AND not onboarded', () => {
    expect(shouldShowOnboarding({ ready: true, logEmpty: true, onboarded: false })).toBe(true)
  })
  it('is false in every other combination', () => {
    for (const ready of [true, false]) {
      for (const logEmpty of [true, false]) {
        for (const onboarded of [true, false]) {
          if (ready && logEmpty && !onboarded) continue
          expect(shouldShowOnboarding({ ready, logEmpty, onboarded }), `${ready}/${logEmpty}/${onboarded}`).toBe(false)
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/onboarding/gate.test.ts`
Expected: FAIL — cannot resolve `~/lib/onboarding/gate`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/lib/onboarding/gate.ts
export interface OnboardingGateInput {
  ready: boolean
  logEmpty: boolean
  onboarded: boolean
}

/** The onboarding overlay auto-shows only for a hydrated, brand-new, not-yet-onboarded user. */
export function shouldShowOnboarding({ ready, logEmpty, onboarded }: OnboardingGateInput): boolean {
  return ready && logEmpty && !onboarded
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/onboarding/gate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/onboarding/gate.ts tests/unit/onboarding/gate.test.ts
git commit -m "feat(onboarding): shouldShowOnboarding gate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `useOnboarding` composable

**Files:**
- Create: `app/composables/useOnboarding.ts`
- Test: `tests/unit/composables/useOnboarding.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/composables/useOnboarding.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Deterministic, storage-free adapter so add()/markSeen()/recalculate() resolve
// without touching real storage. Assertions read store state instead.
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined),
    append: vi.fn().mockResolvedValue(undefined),
    upsertOne: vi.fn().mockResolvedValue(undefined),
  }),
}))

import { useOnboarding } from '~/composables/useOnboarding'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useAppStatus } from '~/stores/appStatus'
import type { Grammar } from '~/lib/domain'

const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
const STARTER_KO = '-아/어서'
function seedStarterGrammar() {
  useGrammarStore().items = [{ ko: STARTER_KO, meaning: L('because'), deckId: 'topik-1' } as Grammar]
}

describe('useOnboarding', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('complete writes exactly one log entry, marks the grammar seen, sets the flag, closes', async () => {
    seedStarterGrammar()
    const ob = useOnboarding()
    const entry = await ob.complete('주말에 친구를 만나서 기분이 좋았어')

    const log = useLogStore()
    expect(log.entries).toHaveLength(1)
    expect(log.entries[0]!.ko).toBe(STARTER_KO)
    expect(log.entries[0]!.contextId).toBe('banmal')
    expect(log.entries[0]!.feedback).toBe('easy')
    expect(useSrsStore().map[STARTER_KO]).toBeTruthy()
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(ob.open.value).toBe(false)
    expect(entry).not.toBeNull()
  })

  it('complete self-disables (no entry) when the starter grammar is absent', async () => {
    // grammar store left empty
    const ob = useOnboarding()
    const entry = await ob.complete('whatever')
    expect(useLogStore().entries).toHaveLength(0)
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(entry).toBeNull()
  })

  it('skip sets the flag without writing a log entry', () => {
    const ob = useOnboarding()
    ob.skip()
    expect(useLogStore().entries).toHaveLength(0)
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(ob.open.value).toBe(false)
  })

  it('shouldShow is true only when ready, log empty, not onboarded', () => {
    const ob = useOnboarding()
    useAppStatus().status = 'ready'
    expect(ob.shouldShow.value).toBe(true)
    expect(ob.showEmptyPlot.value).toBe(true)
    ob.skip()
    expect(ob.shouldShow.value).toBe(false) // onboarded now
    expect(ob.showEmptyPlot.value).toBe(true) // still empty → manual entry stays
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/composables/useOnboarding.test.ts`
Expected: FAIL — cannot resolve `~/composables/useOnboarding`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/composables/useOnboarding.ts
import { computed, ref } from 'vue'
import type { LogEntry } from '~/lib/domain'
import { shouldShowOnboarding } from '~/lib/onboarding/gate'
import { STARTER } from '~/lib/onboarding/starter'
import { useAppStatus } from '~/stores/appStatus'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

const ONBOARDED_KEY = 'munbeop.onboarded'

function readFlag(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(ONBOARDED_KEY) === '1'
}

export function useOnboarding() {
  const appStatus = useAppStatus()
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()

  const onboarded = ref(readFlag())
  const open = ref(false)

  const shouldShow = computed(() =>
    shouldShowOnboarding({
      ready: appStatus.status === 'ready',
      logEmpty: logStore.entries.length === 0,
      onboarded: onboarded.value,
    }),
  )

  // The persistent zero-state stays available as a manual entry point even
  // after the user skips (flag set), as long as they have no entries yet.
  const showEmptyPlot = computed(
    () => appStatus.status === 'ready' && logStore.entries.length === 0,
  )

  function markOnboarded() {
    onboarded.value = true
    if (typeof localStorage !== 'undefined') localStorage.setItem(ONBOARDED_KEY, '1')
  }

  function start() {
    open.value = true
  }

  function skip() {
    markOnboarded()
    open.value = false
  }

  /** Write the guided sentence as a real diary entry + SRS row, then close. */
  async function complete(sentence: string): Promise<LogEntry | null> {
    const grammar = grammarStore.items.find((g) => g.ko === STARTER.grammarKo)
    const ctx = contextsStore.active[0]
    if (!grammar || !ctx) {
      // Broken starter or no contexts — never trap a new user on a dead overlay.
      markOnboarded()
      open.value = false
      return null
    }
    const entry = await logStore.add({
      ko: grammar.ko,
      sentence,
      feedback: 'easy',
      errorNote: null,
      reviewState: 'unreviewed',
      contextId: ctx.id,
      contextName: ctx.name,
    })
    await srsStore.markSeen(grammar.ko)
    await srsStore.recalculate(grammar.ko)
    markOnboarded()
    open.value = false
    return entry
  }

  return { open, shouldShow, showEmptyPlot, start, skip, complete }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/composables/useOnboarding.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/composables/useOnboarding.ts tests/unit/composables/useOnboarding.test.ts
git commit -m "feat(onboarding): useOnboarding (flag + real first-sentence write)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: i18n keys (8 locales) + parity test

**Files:**
- Modify: `i18n/locales/en.json`, `es.json`, `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`
- Test: `tests/unit/i18n/onboarding-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/i18n/onboarding-keys.test.ts
import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

const KEYS = [
  'onboarding.title',
  'onboarding.intro',
  'onboarding.prompt',
  'onboarding.reveal_label',
  'onboarding.celebrate',
  'onboarding.cta',
  'onboarding.skip',
  'onboarding.empty.title',
  'onboarding.empty.body',
  'onboarding.empty.cta',
]

describe('onboarding.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key} as a non-empty string`, () => {
        const value = dig(msgs, key)
        expect(typeof value, `${code} ${key}`).toBe('string')
        expect((value as string).length, `${code} ${key}`).toBeGreaterThan(0)
      })
    }
  }
  it('keeps 화이팅 untranslated in every locale (brand convention)', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'onboarding.celebrate'), code).toContain('화이팅')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/i18n/onboarding-keys.test.ts`
Expected: FAIL — keys undefined in all locales.

- [ ] **Step 3: Add the `onboarding` block to each locale file**

Add this top-level `"onboarding"` object to `en.json` (insert as a new top-level key; mind the surrounding commas):

```json
"onboarding": {
  "title": "Plant your first sentence",
  "intro": "In mungarden you write Korean sentences yourself. Let's do the first one together — just fill in the blank.",
  "prompt": "Complete the sentence using this pattern:",
  "reveal_label": "Check answer",
  "celebrate": "Your first seed is planted. 화이팅!",
  "cta": "Enter my garden",
  "skip": "Skip for now",
  "empty": {
    "title": "Your garden is bare soil",
    "body": "Plant your first Korean sentence to grow your first tree.",
    "cta": "Plant the first seed"
  }
}
```

`es.json`:

```json
"onboarding": {
  "title": "Planta tu primera frase",
  "intro": "En mungarden escribes las frases en coreano tú mismo. Hagamos la primera juntos: solo rellena el hueco.",
  "prompt": "Completa la frase usando este patrón:",
  "reveal_label": "Ver respuesta",
  "celebrate": "Tu primera semilla está plantada. 화이팅!",
  "cta": "Entrar a mi jardín",
  "skip": "Ahora no",
  "empty": {
    "title": "Tu jardín es tierra desnuda",
    "body": "Planta tu primera frase en coreano para que crezca tu primer árbol.",
    "cta": "Plantar la primera semilla"
  }
}
```

For `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`: add the same `onboarding` object, translating each string faithfully (short, calm/garden tone). **Keep `화이팅` untranslated** inside `celebrate` (brand rule — the parity test enforces it). Match the existing per-locale style of the file (look at the neighbouring `garden`/`stats` blocks for tone).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/i18n/onboarding-keys.test.ts`
Expected: PASS (80 parity assertions + 1 brand check).

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/*.json tests/unit/i18n/onboarding-keys.test.ts
git commit -m "i18n(onboarding): onboarding.* keys in all 8 locales

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: `EmptyPlot.vue` component

**Files:**
- Create: `app/components/garden/EmptyPlot.vue`
- Test: `tests/components/garden/EmptyPlot.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/garden/EmptyPlot.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyPlot from '~/components/garden/EmptyPlot.vue'

describe('EmptyPlot', () => {
  it('renders the empty-state copy and a CTA button', () => {
    const w = mount(EmptyPlot)
    expect(w.text()).toContain('onboarding.empty.title') // key-echo stub
    expect(w.find('button').exists()).toBe(true)
  })
  it('emits "start" when the CTA is clicked', async () => {
    const w = mount(EmptyPlot)
    await w.find('button').trigger('click')
    expect(w.emitted('start')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/components/garden/EmptyPlot.test.ts`
Expected: FAIL — cannot resolve `~/components/garden/EmptyPlot.vue`.

- [ ] **Step 3: Write minimal implementation**

```vue
<!-- app/components/garden/EmptyPlot.vue -->
<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

/**
 * Distinct zero-progress state for the garden home: an inviting bare plot,
 * deliberately NOT the winter-veteran tree. Shown whenever the user has no
 * log entries; the CTA opens the guided first sentence.
 */
defineEmits<{ start: [] }>()
const { t } = useI18n()
</script>

<template>
  <section class="plot">
    <div class="plot__soil" aria-hidden="true">
      <span class="plot__seed">🌱</span>
    </div>
    <h2 class="plot__title">{{ t('onboarding.empty.title') }}</h2>
    <p class="plot__body">{{ t('onboarding.empty.body') }}</p>
    <Button @click="$emit('start')">{{ t('onboarding.empty.cta') }}</Button>
  </section>
</template>

<style scoped>
.plot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 32px 16px;
}
.plot__soil {
  width: 120px;
  height: 60px;
  background: var(--surface);
  border: 3px dashed var(--border-strong);
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.plot__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 14px;
  color: var(--text);
}
.plot__body {
  margin: 0;
  max-width: 38ch;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: var(--text-soft);
  line-height: 1.6;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/components/garden/EmptyPlot.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/garden/EmptyPlot.vue tests/components/garden/EmptyPlot.test.ts
git commit -m "feat(onboarding): EmptyPlot zero-state component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: `GuidedFirstSentence.vue` overlay

**Files:**
- Create: `app/components/onboarding/GuidedFirstSentence.vue`
- Test: `tests/components/onboarding/GuidedFirstSentence.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/onboarding/GuidedFirstSentence.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GuidedFirstSentence from '~/components/onboarding/GuidedFirstSentence.vue'
import { STARTER } from '~/lib/onboarding/starter'

async function flush() {
  await nextTick()
  await nextTick()
}

function mountOpen() {
  return mount(GuidedFirstSentence, {
    attachTo: document.body,
    props: { open: true },
    global: { stubs: { Teleport: false } },
  })
}

describe('GuidedFirstSentence', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('reveals the model sentence then emits complete with the composed sentence', async () => {
    const w = mountOpen()
    await flush()
    const input = document.body.querySelector('[data-testid="onboarding-blank"]') as HTMLInputElement
    input.value = STARTER.blankAnswer
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
    ;(document.body.querySelector('[data-testid="onboarding-reveal"]') as HTMLElement).click()
    await flush()
    expect(document.body.textContent).toContain(STARTER.modelSentenceKo)
    ;(document.body.querySelector('[data-testid="onboarding-done"]') as HTMLElement).click()
    await flush()
    expect(w.emitted('complete')?.[0]?.[0]).toBe(STARTER.modelSentenceKo)
  })

  it('emits skip when the modal is closed', async () => {
    const w = mountOpen()
    await flush()
    ;(document.body.querySelector('.modal-close') as HTMLElement).click()
    await flush()
    expect(w.emitted('skip')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/components/onboarding/GuidedFirstSentence.test.ts`
Expected: FAIL — cannot resolve `~/components/onboarding/GuidedFirstSentence.vue`.

- [ ] **Step 3: Write minimal implementation**

```vue
<!-- app/components/onboarding/GuidedFirstSentence.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { STARTER, parseTemplate } from '~/lib/onboarding/starter'

/**
 * One guided sentence: a near-complete model with the grammar conjugation
 * blanked. No auto-grading — on reveal we show the model and celebrate. The
 * composed sentence (their fill, or the model answer if they left it empty)
 * is emitted on `complete`. Closing the modal emits `skip`.
 */
defineProps<{ open: boolean }>()
const emit = defineEmits<{ complete: [string]; skip: [] }>()
const { t } = useI18n()

const parts = parseTemplate(STARTER.templateKo)
const answer = ref('')
const revealed = ref(false)

const composed = computed(
  () => parts.before + (answer.value.trim() || STARTER.blankAnswer) + parts.after,
)

function reveal() {
  revealed.value = true
}
function done() {
  emit('complete', composed.value)
}
</script>

<template>
  <Modal
    :open="open"
    :title="t('onboarding.title')"
    :close-label="t('onboarding.skip')"
    @close="emit('skip')"
  >
    <div class="onb">
      <p class="onb__intro">{{ t('onboarding.intro') }}</p>
      <p class="onb__prompt">
        <strong>{{ STARTER.grammarKo }}</strong> · {{ t('onboarding.prompt') }}
      </p>

      <p class="onb__template">
        <span>{{ parts.before }}</span>
        <Input
          v-model="answer"
          data-testid="onboarding-blank"
          class="onb__blank"
          :placeholder="STARTER.blankAnswer"
        />
        <span>{{ parts.after }}</span>
      </p>

      <div v-if="!revealed" class="onb__actions">
        <Button data-testid="onboarding-reveal" @click="reveal">
          {{ t('onboarding.reveal_label') }}
        </Button>
      </div>

      <div v-else class="onb__reveal">
        <p class="onb__model">{{ STARTER.modelSentenceKo }}</p>
        <p class="onb__celebrate"><span class="onb__sprout" aria-hidden="true">🌱</span> {{ t('onboarding.celebrate') }}</p>
        <Button data-testid="onboarding-done" @click="done">
          {{ t('onboarding.cta') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.onb {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
}
.onb__intro,
.onb__prompt,
.onb__model {
  margin: 0;
  line-height: 1.6;
  color: var(--text);
}
.onb__template {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: var(--text-lg, 18px);
  color: var(--text);
}
.onb__blank {
  width: 5ch;
  display: inline-block;
}
.onb__reveal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.onb__model {
  font-weight: 600;
}
.onb__celebrate {
  margin: 0;
  color: var(--text-soft);
}
.onb__sprout {
  display: inline-block;
  animation: sprout-pop 360ms var(--ease-out, ease);
}
@keyframes sprout-pop {
  from { transform: scale(0.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .onb__sprout { animation: none; }
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/components/onboarding/GuidedFirstSentence.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/onboarding/GuidedFirstSentence.vue tests/components/onboarding/GuidedFirstSentence.test.ts
git commit -m "feat(onboarding): GuidedFirstSentence overlay (template with a blank)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Wire into `app/pages/index.vue`

**Files:**
- Modify: `app/pages/index.vue`

No new unit test — the gate/composable/components are covered above; this task is wiring + manual verification.

- [ ] **Step 1: Add imports and the composable**

In the `<script setup>` block of `app/pages/index.vue`, add to the imports (near the other component imports around line 20-31):

```ts
import EmptyPlot from '~/components/garden/EmptyPlot.vue'
import GuidedFirstSentence from '~/components/onboarding/GuidedFirstSentence.vue'
import { useOnboarding } from '~/composables/useOnboarding'
```

After the `useGardenState()` destructure block (around line 48), add:

```ts
const onboarding = useOnboarding()

// Auto-open the guided overlay once data is ready for a brand-new user.
watch(
  () => onboarding.shouldShow.value,
  (show) => { if (show) onboarding.start() },
  { immediate: true },
)
```

(`watch` is already imported from `vue` at the top of the file.)

- [ ] **Step 2: Gate the hero view and mount the overlay**

In the template, replace the hero `<div v-if="view === 'hero'" key="hero" class="page__view">` opening so the empty plot wins at zero-state. Change the existing line:

```vue
      <div v-if="view === 'hero'" key="hero" class="page__view">
```

to:

```vue
      <EmptyPlot v-if="view === 'hero' && onboarding.showEmptyPlot.value" key="empty" @start="onboarding.start()" />

      <div v-else-if="view === 'hero'" key="hero" class="page__view">
```

Then, immediately AFTER the closing `</Transition>` (around line 211) and before the closing `</div>` of `.page`, mount the overlay:

```vue
    <GuidedFirstSentence
      :open="onboarding.open.value"
      @complete="onboarding.complete($event)"
      @skip="onboarding.skip()"
    />
```

- [ ] **Step 3: Verify the build is type-clean and all tests pass**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm test`
Expected: full suite green (existing + the 6 new test files).

- [ ] **Step 4: Manual verification in the browser preview**

Start the dev server and verify, with a brand-new (empty-log) account:
1. The garden home shows `EmptyPlot` (bare soil + CTA), not the winter tree.
2. The guided overlay auto-opens; filling the blank with `서`, clicking "Check answer" reveals `주말에 친구를 만나서 기분이 좋았어` + the celebrate line.
3. Clicking the CTA closes the overlay; the diary (`/log`) now has one entry for `-아/어서`; reloading does NOT reopen the overlay.
4. Clicking the modal close on a fresh account sets the flag (no reopen) but keeps the `EmptyPlot` CTA.
5. Toggle `prefers-reduced-motion`: the sprout does not animate.

Capture a screenshot of the empty plot + the guided overlay for the PR.

- [ ] **Step 5: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(onboarding): wire empty plot + guided sentence into the garden home

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Final verification

- [ ] **Step 1: Full verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green.

- [ ] **Step 2: Confirm scope**

Re-read the spec acceptance criteria; confirm each is met. No TOPIK placement was added (Step 15 stays out of scope).

- [ ] **Step 3 (optional): push / open PR** — only when the user asks.

---

## Self-Review

**Spec coverage:** distinct empty state → Task 5/7; guided template-with-blank → Task 1/6; real progress write → Task 3; gate without flash (appStatus ready) → Task 2/3/7; localStorage flag → Task 3; skippable + manual entry point → Task 3/6/7; i18n 8 locales + 화이팅 → Task 4; reduced-motion → Task 6; pure-logic-first tests → Tasks 1-3. All covered.

**Type consistency:** `STARTER` shape, `parseTemplate` → `{before, after}`, `shouldShowOnboarding` input `{ready, logEmpty, onboarded}`, `useOnboarding` returns `{open, shouldShow, showEmptyPlot, start, skip, complete}`, `logStore.add` payload matches `app/stores/log.ts`. Consistent across tasks.

**Placeholder scan:** the only deferred content is the fr/pt-BR/th/id/vi/ja translations in Task 4 — these are real authoring (EN + ES given as canonical, brand rule enforced by the parity test), not a code placeholder.
