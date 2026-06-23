# Step 14 — Ordered TOPIK Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A `/paths` page showing each TOPIK level's grammar in order with SRS-derived progress + a "practice next" recommendation.

**Architecture:** Pure `pathProgress(kos, srsMap)` → `usePaths()` (deck-filtered, ordered) → `PathCard.vue` (bar + next-up CTA + collapsible list) → `paths.vue` page, linked from the Library. Derived from existing stores; no migration.

**Tech Stack:** Nuxt 4 SPA + Vue 3 `<script setup>` + Vitest. Spec: `docs/superpowers/specs/2026-06-23-topik-paths-design.md`.

**Conventions (verified):** app under `munbeop/`, **pnpm** (no install, no package-lock). `pnpm run test -- <path>` / `pnpm run typecheck` / `pnpm run lint`. Branch `claude/paths` — verify `git rev-parse --abbrev-ref HEAD` before each commit; never `git add -A`. `SrsState`/`MasteryLevel` from `~/lib/domain`. `srsStore.map` is `Record<ko, SrsState>`; `grammarStore.items`/`.decks` hydrated; TOPIK decks have ids `topik-1`..`topik-6` and names `TOPIK 1`..`TOPIK 6`. Global i18n key-echo stub in component tests (no local mock).

---

## Task 1: Pure path progress

**Files:** Create `munbeop/app/lib/paths/progress.ts`; Test `munbeop/tests/unit/paths/progress.test.ts`

- [ ] **Step 1: Failing test** — `munbeop/tests/unit/paths/progress.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isLearned, pathProgress } from '~/lib/paths/progress'
import type { SrsState } from '~/lib/domain'

const st = (mastery: SrsState['mastery']): SrsState => ({ lastSeen: 1, easyCount: 1, hardCount: 0, mastery })

describe('isLearned', () => {
  it('is true for plant and tree, false otherwise', () => {
    expect(isLearned(st('plant'))).toBe(true)
    expect(isLearned(st('tree'))).toBe(true)
    expect(isLearned(st('seedling'))).toBe(false)
    expect(isLearned(undefined)).toBe(false)
  })
})

describe('pathProgress', () => {
  const map: Record<string, SrsState> = { A: st('tree'), B: st('seedling'), C: st('plant') }
  it('counts learned, computes pct, and finds the first not-learned ko in order', () => {
    const p = pathProgress(['A', 'B', 'C'], map)
    expect(p.total).toBe(3)
    expect(p.learned).toBe(2)
    expect(p.pct).toBeCloseTo(2 / 3)
    expect(p.nextKo).toBe('B')
    expect(p.items).toEqual([
      { ko: 'A', learned: true },
      { ko: 'B', learned: false },
      { ko: 'C', learned: true },
    ])
  })
  it('returns nextKo null when everything is learned', () => {
    expect(pathProgress(['A', 'C'], map).nextKo).toBeNull()
  })
  it('handles an empty path', () => {
    expect(pathProgress([], map)).toEqual({ items: [], total: 0, learned: 0, pct: 0, nextKo: null })
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implement** — `munbeop/app/lib/paths/progress.ts`:
```ts
import type { SrsState } from '~/lib/domain'

/** A point counts as learned once its mastery is past seedling. */
export function isLearned(state: SrsState | undefined): boolean {
  return state?.mastery === 'plant' || state?.mastery === 'tree'
}

export interface PathItem {
  ko: string
  learned: boolean
}

export interface PathProgress {
  items: PathItem[]
  total: number
  learned: number
  /** 0..1 */
  pct: number
  /** First not-learned ko in order, or null when the path is complete. */
  nextKo: string | null
}

export function pathProgress(kos: string[], srsMap: Record<string, SrsState>): PathProgress {
  const items: PathItem[] = kos.map((ko) => ({ ko, learned: isLearned(srsMap[ko]) }))
  const learned = items.filter((i) => i.learned).length
  const total = items.length
  const nextKo = items.find((i) => !i.learned)?.ko ?? null
  return { items, total, learned, pct: total === 0 ? 0 : learned / total, nextKo }
}
```

- [ ] **Step 4: Run → PASS**. `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/lib/paths/progress.ts munbeop/tests/unit/paths/progress.test.ts
git commit -m "feat(paths): pure pathProgress + isLearned"
```

---

## Task 2: usePaths composable

**Files:** Create `munbeop/app/composables/usePaths.ts`; Test `munbeop/tests/unit/paths/usePaths.test.ts`

- [ ] **Step 1: Failing test** — `munbeop/tests/unit/paths/usePaths.test.ts` (SUT import at top):
```ts
import { usePaths } from '~/composables/usePaths'
import { describe, it, expect, vi } from 'vitest'
import type { SrsState } from '~/lib/domain'

const st = (mastery: SrsState['mastery']): SrsState => ({ lastSeen: 1, easyCount: 1, hardCount: 0, mastery })

vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    decks: [
      { id: 'topik-2', name: 'TOPIK 2', order: 2 },
      { id: 'topik-1', name: 'TOPIK 1', order: 1 },
      { id: 'custom', name: 'Custom', order: 9 },
    ],
    items: [
      { ko: 'A', deckId: 'topik-1' },
      { ko: 'B', deckId: 'topik-1' },
      { ko: 'X', deckId: 'topik-2' },
      { ko: 'Z', deckId: 'custom' },
    ],
  }),
}))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ map: { A: st('tree') } }) }))

describe('usePaths', () => {
  it('returns the topik paths in deck order, custom skipped, kos ordered + progress computed', () => {
    const { paths } = usePaths()
    expect(paths.value.map((p) => p.deckId)).toEqual(['topik-1', 'topik-2'])
    const t1 = paths.value[0]!
    expect(t1.progress.items.map((i) => i.ko)).toEqual(['A', 'B'])
    expect(t1.progress.learned).toBe(1)
    expect(t1.progress.nextKo).toBe('B')
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implement** — `munbeop/app/composables/usePaths.ts`:
```ts
import { computed } from 'vue'
import { pathProgress, type PathProgress } from '~/lib/paths/progress'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'

export interface TopikPath {
  deckId: string
  name: string
  progress: PathProgress
}

export function usePaths() {
  const grammarStore = useGrammarStore()
  const srsStore = useSrsStore()

  const paths = computed<TopikPath[]>(() => {
    const decks = [...grammarStore.decks]
      .filter((d) => d.id.startsWith('topik-'))
      .sort((a, b) => a.order - b.order)
    return decks.map((deck) => {
      const kos = grammarStore.items.filter((g) => g.deckId === deck.id).map((g) => g.ko)
      return { deckId: deck.id, name: deck.name, progress: pathProgress(kos, srsStore.map) }
    })
  })

  return { paths }
}
```

- [ ] **Step 4: Run → PASS**. `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/composables/usePaths.ts munbeop/tests/unit/paths/usePaths.test.ts
git commit -m "feat(paths): usePaths (deck-ordered topik paths)"
```

---

## Task 3: PathCard component

**Files:** Create `munbeop/app/components/paths/PathCard.vue`; Test `munbeop/tests/components/paths/PathCard.test.ts`

- [ ] **Step 1: Failing test** — `munbeop/tests/components/paths/PathCard.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PathCard from '~/components/paths/PathCard.vue'
import type { PathProgress } from '~/lib/paths/progress'

const stubs = { NuxtLink: { template: '<a><slot /></a>' } }

const progress = (over: Partial<PathProgress> = {}): PathProgress => ({
  items: [{ ko: 'A', learned: true }, { ko: 'B', learned: false }],
  total: 2, learned: 1, pct: 0.5, nextKo: 'B', ...over,
})

describe('PathCard', () => {
  it('shows a progressbar at the right percent and a next CTA deep-linking to ruleta focus', () => {
    const w = mount(PathCard, { props: { name: 'TOPIK 1', progress: progress() }, global: { stubs } })
    expect(w.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')
    expect(w.get('[data-testid="path-next"]').attributes('to')).toBe('/practice/ruleta?focus=B')
    expect(w.findAll('.path-card__item')).toHaveLength(2)
  })
  it('shows the complete state and no CTA when nextKo is null', () => {
    const w = mount(PathCard, {
      props: { name: 'TOPIK 1', progress: progress({ items: [{ ko: 'A', learned: true }], total: 1, learned: 1, pct: 1, nextKo: null }) },
      global: { stubs },
    })
    expect(w.find('[data-testid="path-next"]').exists()).toBe(false)
    expect(w.find('[data-testid="path-complete"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implement** — `munbeop/app/components/paths/PathCard.vue`:
```vue
<!-- app/components/paths/PathCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import type { PathProgress } from '~/lib/paths/progress'

interface Props {
  name: string
  progress: PathProgress
}
const props = defineProps<Props>()
const { t } = useI18n()

const pct = computed(() => Math.round(props.progress.pct * 100))
</script>

<template>
  <section class="path-card" data-testid="path-card">
    <header class="path-card__head">
      <h2 class="path-card__name">{{ name }}</h2>
      <span class="path-card__count">{{ t('paths.progress_label', { learned: progress.learned, total: progress.total }) }}</span>
    </header>

    <div
      class="path-card__bar"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="name"
    >
      <div class="path-card__fill" :style="{ width: pct + '%' }" />
    </div>

    <NuxtLink
      v-if="progress.nextKo"
      class="path-card__next"
      data-testid="path-next"
      :to="`/practice/ruleta?focus=${encodeURIComponent(progress.nextKo)}`"
    >
      <span class="path-card__next-label">{{ t('paths.next_label') }}</span>
      <span class="path-card__next-ko" lang="ko">{{ progress.nextKo }}</span>
      <span class="path-card__next-cta">{{ t('paths.practice_cta') }} →</span>
    </NuxtLink>
    <p v-else class="path-card__complete" data-testid="path-complete">{{ t('paths.complete') }}</p>

    <details class="path-card__list">
      <summary class="path-card__summary">{{ t('paths.list_toggle') }}</summary>
      <ol class="path-card__items">
        <li
          v-for="item in progress.items"
          :key="item.ko"
          class="path-card__item"
          :class="{
            'path-card__item--learned': item.learned,
            'path-card__item--next': item.ko === progress.nextKo,
          }"
          lang="ko"
        >
          <span class="path-card__tick" aria-hidden="true">{{ item.learned ? '✓' : '·' }}</span>
          {{ item.ko }}
        </li>
      </ol>
    </details>
  </section>
</template>

<style scoped>
.path-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid var(--border-strong, var(--border));
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
}
.path-card__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.path-card__name { margin: 0; font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; }
.path-card__count { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.path-card__bar { height: 12px; background: var(--surface); border: 2px solid var(--border); overflow: hidden; }
.path-card__fill { height: 100%; background: var(--accent); transition: width var(--motion-quick, 120ms) var(--ease-out, ease-out); }
.path-card__next {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; text-decoration: none;
  background: var(--surface); border: 2px solid var(--border-strong, var(--border)); color: var(--text);
}
.path-card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.path-card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.path-card__next-label { font-family: var(--font-pixel-small); font-size: var(--text-xs); color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.06em; }
.path-card__next-ko { font-family: var(--font-ko); font-size: var(--text-lg); }
.path-card__next-cta { margin-left: auto; font-family: var(--font-pixel-small); font-size: var(--text-xs); color: var(--accent); }
.path-card__complete { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); color: var(--heading-accent); }
.path-card__summary { cursor: pointer; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--link); }
.path-card__items { margin: 8px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.path-card__item { font-family: var(--font-ko); font-size: var(--text-md); color: var(--text-soft); }
.path-card__item--learned { color: var(--text); }
.path-card__item--next { color: var(--accent); font-weight: 700; }
.path-card__tick { display: inline-block; width: 1.2em; }
</style>
```

- [ ] **Step 4: Run → PASS** (2 tests). `cd munbeop && pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/app/components/paths/PathCard.vue munbeop/tests/components/paths/PathCard.test.ts
git commit -m "feat(paths): PathCard (bar + next-up CTA + ordered list)"
```

---

## Task 4: /paths page + Library link

**Files:** Create `munbeop/app/pages/paths.vue`; Modify `munbeop/app/pages/library.vue`

- [ ] **Step 1: Create the page** — `munbeop/app/pages/paths.vue`:
```vue
<!-- app/pages/paths.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import PathCard from '~/components/paths/PathCard.vue'
import { usePaths } from '~/composables/usePaths'
import { useGrammarStore } from '~/stores/grammar'

definePageMeta({ surface: 'study' })

const { t } = useI18n()
const grammarStore = useGrammarStore()
const { paths } = usePaths()

onMounted(async () => {
  if (grammarStore.items.length === 0) {
    try {
      await grammarStore.hydrate()
    } catch (err) {
      console.error('paths: grammar hydration failed', err)
    }
  }
})
</script>

<template>
  <div class="page">
    <BilingualTitle ko="진도" :latin="t('paths.title')" />
    <p class="page__lead">{{ t('paths.lead') }}</p>
    <div class="page__list">
      <PathCard v-for="p in paths" :key="p.deckId" :name="p.name" :progress="p.progress" />
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.page__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.page__list { display: flex; flex-direction: column; gap: 16px; }
</style>
```

- [ ] **Step 2: Link from the Library** — in `munbeop/app/pages/library.vue`, after the lead paragraph `<p class="lead">{{ t('library.lead') }}</p>`, add:
```vue
    <NuxtLink class="paths-link" to="/paths">{{ t('library.paths_link') }}</NuxtLink>
```
Add `NuxtLink` to the imports in `<script setup>`:
```ts
import { NuxtLink } from '#components'
```
Add to `<style scoped>`:
```css
.paths-link {
  align-self: flex-start;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--link);
  text-decoration: underline;
}
.paths-link:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
```

- [ ] **Step 3: Typecheck + lint**

`cd munbeop && pnpm run typecheck` → PASS. `cd munbeop && pnpm run lint` → 0 errors.

- [ ] **Step 4: Commit**
```bash
git add munbeop/app/pages/paths.vue munbeop/app/pages/library.vue
git commit -m "feat(paths): /paths page + Library entry link"
```

---

## Task 5: i18n + parity + gate

**Files:** Modify `munbeop/i18n/locales/*.json`; Test `munbeop/tests/unit/i18n/paths-keys.test.ts`

- [ ] **Step 1: Failing parity test** — `munbeop/tests/unit/i18n/paths-keys.test.ts`:
```ts
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
function dig(o: unknown, p: string): unknown {
  return p.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o)
}
const KEYS = [
  'paths.title', 'paths.lead', 'paths.progress_label', 'paths.next_label',
  'paths.practice_cta', 'paths.complete', 'paths.list_toggle', 'library.paths_link',
]

describe('paths i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('progress_label keeps its placeholders', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      const s = dig(msgs, 'paths.progress_label') as string
      expect(s, code).toContain('{learned}')
      expect(s, code).toContain('{total}')
    }
  })
})
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Add the keys to all 8 locales via a throwaway script**

Create `add-paths-i18n.mjs` at the repo root:
```js
import { readFileSync, writeFileSync } from 'node:fs'
const dir = 'munbeop/i18n/locales'
const P = {
  en: { title: 'Your TOPIK paths', lead: 'Each level in order — see how far you are and what to study next.', progress_label: '{learned} / {total}', next_label: 'Up next', practice_cta: 'Practice it', complete: 'Path complete! 🎉', list_toggle: 'Show the full path', paths_link: 'Your TOPIK paths →' },
  es: { title: 'Tus rutas TOPIK', lead: 'Cada nivel en orden: mira cuánto llevas y qué estudiar a continuación.', progress_label: '{learned} / {total}', next_label: 'Siguiente', practice_cta: 'Practícalo', complete: '¡Ruta completa! 🎉', list_toggle: 'Ver la ruta completa', paths_link: 'Tus rutas TOPIK →' },
  fr: { title: 'Tes parcours TOPIK', lead: 'Chaque niveau dans l’ordre : vois ta progression et quoi étudier ensuite.', progress_label: '{learned} / {total}', next_label: 'À suivre', practice_cta: 'S’entraîner', complete: 'Parcours terminé ! 🎉', list_toggle: 'Voir le parcours complet', paths_link: 'Tes parcours TOPIK →' },
  'pt-BR': { title: 'Suas trilhas TOPIK', lead: 'Cada nível em ordem — veja seu progresso e o que estudar a seguir.', progress_label: '{learned} / {total}', next_label: 'A seguir', practice_cta: 'Praticar', complete: 'Trilha concluída! 🎉', list_toggle: 'Ver a trilha completa', paths_link: 'Suas trilhas TOPIK →' },
  th: { title: 'เส้นทาง TOPIK ของคุณ', lead: 'แต่ละระดับตามลำดับ — ดูความคืบหน้าและสิ่งที่ควรเรียนต่อ', progress_label: '{learned} / {total}', next_label: 'ถัดไป', practice_cta: 'ฝึกเลย', complete: 'จบเส้นทางแล้ว! 🎉', list_toggle: 'ดูเส้นทางทั้งหมด', paths_link: 'เส้นทาง TOPIK ของคุณ →' },
  id: { title: 'Jalur TOPIK kamu', lead: 'Tiap level berurutan — lihat progресmu dan apa yang dipelajari berikutnya.', progress_label: '{learned} / {total}', next_label: 'Berikutnya', practice_cta: 'Latih', complete: 'Jalur selesai! 🎉', list_toggle: 'Lihat seluruh jalur', paths_link: 'Jalur TOPIK kamu →' },
  vi: { title: 'Lộ trình TOPIK của bạn', lead: 'Từng cấp độ theo thứ tự — xem bạn đã đi tới đâu và học gì tiếp theo.', progress_label: '{learned} / {total}', next_label: 'Tiếp theo', practice_cta: 'Luyện ngay', complete: 'Hoàn thành lộ trình! 🎉', list_toggle: 'Xem toàn bộ lộ trình', paths_link: 'Lộ trình TOPIK của bạn →' },
  ja: { title: 'あなたのTOPIKパス', lead: '各レベルを順番に — どこまで進んだか、次に何を学ぶかが分かります。', progress_label: '{learned} / {total}', next_label: '次は', practice_cta: '練習する', complete: 'パス完了！🎉', list_toggle: 'パス全体を見る', paths_link: 'あなたのTOPIKパス →' },
}
for (const [code, v] of Object.entries(P)) {
  const file = `${dir}/${code}.json`
  const obj = JSON.parse(readFileSync(file, 'utf8'))
  const { paths_link, ...paths } = v
  obj.paths = { ...obj.paths, ...paths }
  obj.library = { ...obj.library, paths_link }
  writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
}
console.log('done')
```
> Note: the `id` `lead` string above contains a stray Cyrillic "е" in "progресmu" — fix it to "progresmu" before running (pure-ASCII Latin), or the value still passes the parity test but reads wrong; correct it.

Run it, check the diff only touches `paths`/`library`:
```bash
node add-paths-i18n.mjs && git diff --stat -- munbeop/i18n/locales && rm add-paths-i18n.mjs
```

- [ ] **Step 4: Run the parity test → PASS**. `cd munbeop && pnpm run test -- tests/unit/i18n` + `pnpm run typecheck`.

- [ ] **Step 5: Commit**
```bash
git add munbeop/i18n/locales munbeop/tests/unit/i18n/paths-keys.test.ts
git commit -m "feat(paths): paths.* + library.paths_link i18n across 8 locales"
```

- [ ] **Step 6: Full gate** — `cd munbeop && pnpm run test` green; `pnpm run typecheck` 0; `pnpm run lint` 0 errors.

---

## Self-Review

**Spec coverage:** D1 (ordered paths) → Task 2 deck-ordered. D2 (mastery learned) → Task 1 `isLearned`. D3 (/paths page) → Task 4. D4 (Library entry) → Task 4 Step 2. D5 (seed order) → Task 2 array-order filter. D6 (focus deep-link) → Task 3 CTA. i18n → Task 5.

**Type consistency:** `PathProgress`/`PathItem` defined Task 1, consumed by `usePaths` (Task 2), `PathCard` (Task 3). `TopikPath { deckId, name, progress }` from Task 2 → consumed by the page (Task 4). `srsStore.map` typed `Record<string, SrsState>`.

**No placeholders:** every code/test step complete; the throwaway i18n script is deleted before the commit and gated by the parity test (incl. the placeholder check). Flagged the one typo to fix in the `id` lead.
