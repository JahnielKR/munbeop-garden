# Self-study (user-added grammar) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user add/remove their own grammar patterns (ko + meaning + optional example) from Settings → Learning, flowing through the same draw/mastery/library as the catalog.

**Architecture:** A reserved `CUSTOM_DECK_ID='custom'` marks user grammar; the grammar store gains add/remove + a `customGrammars` view; the broken `STORAGE_KEYS.grammar` write filter is fixed so only custom-deck rows persist to `user_custom_grammars` (the catalog already merges into `items` on read). UI mirrors the contexts CRUD. Spec: `docs/superpowers/specs/2026-06-20-self-study-design.md`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Supabase, Vitest (happy-dom), @nuxtjs/i18n (8 locales), pnpm.

**Working directory:** all paths relative to `munbeop/`; run commands from `munbeop/`. Branch: `claude/self-study`.

**Verified facts:**
- `SupabaseAdapter.read(STORAGE_KEYS.grammar)` merges `grammars` ∪ `user_custom_grammars` (`supabase.ts:94-114`); `write` filter is the no-op placeholder `g.deckId !== 'catalog-readonly-marker'` (`supabase.ts:230-231`).
- `isHangulName(v)` = contains-Hangul test (`lib/domain/context.ts:19`); `LOCALE_CODES` (`lib/domain/i18n.ts:1`); both re-exported from `~/lib/domain`.
- Grammar store (`stores/grammar.ts`) exposes `items`, `decks`, `excludedDeckIds`, `activeIndices`, `grammarByKo`, `hydrate`, `toggleDeck`, `toggleDeckCollapsed`.
- Contexts CRUD precedent: `ContextAddForm.vue` (buildScene fills 8 locales), `ContextManager.vue` (list + delete Modal). Settings Learning panel renders `<ContextManager />` (`settings.vue:65-73`).
- Test harness: happy-dom; `useI18n` key-echo; mount via `@vue/test-utils`; mock client in `supabase.test.ts` records `writes:[{table,op,payload}]`.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/lib/domain/grammar.ts` (modify) | Add `CUSTOM_DECK_ID`. |
| `app/stores/grammar.ts` (modify) | `customGrammars` computed + `addCustomGrammar` + `removeCustomGrammar`. |
| `app/lib/storage/supabase.ts` (modify) | Fix the grammar write filter to `=== CUSTOM_DECK_ID`. |
| `app/components/settings/CustomGrammarAddForm.vue` (create) | Add form (ko + meaning + example), validation, buildMeaning. |
| `app/components/settings/CustomGrammarManager.vue` (create) | List custom grammars + delete confirm + the add form. |
| `app/pages/settings.vue` (modify) | Mount `<CustomGrammarManager />` in the Learning panel. |
| `i18n/locales/*.json` ×8 (modify) | `settings.custom_grammar.*`. |
| Tests (create/extend) | `tests/unit/stores/grammar.customGrammar.test.ts`, extend `tests/unit/storage/supabase.test.ts`, `tests/components/settings/CustomGrammarAddForm.test.ts`, `tests/components/settings/CustomGrammarManager.test.ts`, `tests/unit/i18n/custom-grammar-keys.test.ts`. |

---

## Task 1: `CUSTOM_DECK_ID` + grammar store actions

**Files:** Modify `app/lib/domain/grammar.ts`, `app/stores/grammar.ts`; Test `tests/unit/stores/grammar.customGrammar.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/stores/grammar.customGrammar.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue([]), write: vi.fn().mockResolvedValue(undefined) }),
}))

import { useGrammarStore } from '~/stores/grammar'
import { CUSTOM_DECK_ID, type LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

describe('grammar store custom grammars', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('addCustomGrammar adds a custom-deck item exposed via customGrammars', async () => {
    const store = useGrammarStore()
    const g = await store.addCustomGrammar({ ko: '-거든요', meaning: L('giving a reason'), example: '바빠서 못 갔거든요' })
    expect(g).not.toBeNull()
    expect(g!.deckId).toBe(CUSTOM_DECK_ID)
    expect(g!.example).toBe('바빠서 못 갔거든요')
    expect(store.customGrammars).toHaveLength(1)
    expect(store.items.some((x) => x.ko === '-거든요')).toBe(true)
  })

  it('rejects a non-Hangul ko and a duplicate (no item added)', async () => {
    const store = useGrammarStore()
    expect(await store.addCustomGrammar({ ko: 'abc', meaning: L('x') })).toBeNull()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('x') })
    expect(await store.addCustomGrammar({ ko: '-거든요', meaning: L('dup') })).toBeNull()
    expect(store.customGrammars).toHaveLength(1)
  })

  it('removeCustomGrammar removes the matching custom item', async () => {
    const store = useGrammarStore()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('x') })
    expect(await store.removeCustomGrammar('-거든요')).toBe(true)
    expect(store.customGrammars).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/stores/grammar.customGrammar.test.ts`
Expected: FAIL — `addCustomGrammar`/`customGrammars`/`CUSTOM_DECK_ID` not defined.

- [ ] **Step 3a: Add the constant to `app/lib/domain/grammar.ts`**

At the end of the file (after the `Deck` interface), add:

```ts
/** Reserved deckId for user-authored grammar (self-study). Catalog items never use it. */
export const CUSTOM_DECK_ID = 'custom'
```

- [ ] **Step 3b: Add the actions to `app/stores/grammar.ts`**

Update the imports at the top:

```ts
import type { Grammar, Deck, LocalizedString } from '~/lib/domain'
import { CUSTOM_DECK_ID, isHangulName } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
```

After the `activeIndices` computed, add the `customGrammars` computed:

```ts
  const customGrammars = computed(() =>
    items.value.filter((g) => g.deckId === CUSTOM_DECK_ID),
  )
```

Add the two actions (e.g. just before the `return {`):

```ts
  /**
   * Add a user-authored grammar. The single meaning text is expected pre-built
   * into all 8 locale slots by the caller (see CustomGrammarAddForm). Returns
   * the new Grammar, or null when the ko is not Korean or already exists.
   */
  async function addCustomGrammar(p: {
    ko: string
    meaning: LocalizedString
    example?: string
  }): Promise<Grammar | null> {
    const ko = p.ko.trim()
    if (!isHangulName(ko)) return null
    if (items.value.some((g) => g.ko === ko)) return null
    const example = p.example?.trim()
    const grammar: Grammar = {
      ko,
      meaning: p.meaning,
      deckId: CUSTOM_DECK_ID,
      ...(example ? { example } : {}),
    }
    items.value = [...items.value, grammar]
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.grammar, items.value)
    return grammar
  }

  /** Remove a user-authored grammar by ko. Returns false if not a custom item. */
  async function removeCustomGrammar(ko: string): Promise<boolean> {
    const target = items.value.find((g) => g.ko === ko && g.deckId === CUSTOM_DECK_ID)
    if (!target) return false
    items.value = items.value.filter((g) => g !== target)
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.grammar, items.value)
    return true
  }
```

Add the three names to the `return { … }`:

```ts
    customGrammars,
    addCustomGrammar,
    removeCustomGrammar,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/stores/grammar.customGrammar.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/domain/grammar.ts app/stores/grammar.ts tests/unit/stores/grammar.customGrammar.test.ts
git commit -m "feat(grammar): custom grammar store actions + CUSTOM_DECK_ID

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Fix the grammar write filter (lock the bug)

**Files:** Modify `app/lib/storage/supabase.ts`; Test extend `tests/unit/storage/supabase.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('write', …)` block in `tests/unit/storage/supabase.test.ts`, after the `settings:` write test (before the block's closing `})`):

```ts
    it('grammar: upserts only custom-deck rows to user_custom_grammars (not the catalog)', async () => {
      const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
      await adapter.write(STORAGE_KEYS.grammar, [
        { ko: 'CATALOG', meaning: L('x'), deckId: 'topik-1' },
        { ko: 'MINE', meaning: L('y'), deckId: 'custom' },
      ] as never)
      const ops = client.writes.filter((w) => w.table === 'user_custom_grammars')
      expect(ops[0]?.op).toBe('delete')
      const upsert = ops.find((w) => w.op === 'upsert')
      const rows = upsert!.payload as Array<{ ko: string }>
      expect(rows).toHaveLength(1)
      expect(rows[0]?.ko).toBe('MINE')
    })
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/storage/supabase.test.ts`
Expected: FAIL — the placeholder filter excludes nothing, so the upsert payload has 2 rows (CATALOG + MINE), not 1.

- [ ] **Step 3: Fix the filter in `app/lib/storage/supabase.ts`**

Add the import near the top (it already imports domain types; add the value import):

```ts
import { CUSTOM_DECK_ID } from '~/lib/domain'
```

Replace the filter in the `STORAGE_KEYS.grammar` `write` case:

```ts
        const customs = (value as Grammar[]).filter(
          (g) => g.deckId !== 'catalog-readonly-marker', // placeholder; all client-side grammars are user-owned at write time
        )
```

with:

```ts
        // Only user-authored grammars (the reserved custom deck) persist here;
        // the catalog is read-only from the client (enforced by RLS).
        const customs = (value as Grammar[]).filter((g) => g.deckId === CUSTOM_DECK_ID)
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/storage/supabase.test.ts`
Expected: PASS (all, incl. the new grammar-write test).

- [ ] **Step 5: Commit**

```bash
git add app/lib/storage/supabase.ts tests/unit/storage/supabase.test.ts
git commit -m "fix(storage): persist only custom-deck grammars to user_custom_grammars

The placeholder filter excluded nothing, so writing the grammar key would
have duplicated the whole catalog into user_custom_grammars.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `CustomGrammarAddForm.vue`

**Files:** Create `app/components/settings/CustomGrammarAddForm.vue`; Test `tests/components/settings/CustomGrammarAddForm.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/settings/CustomGrammarAddForm.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import CustomGrammarAddForm from '~/components/settings/CustomGrammarAddForm.vue'
import { useGrammarStore } from '~/stores/grammar'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

describe('CustomGrammarAddForm', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('rejects a non-Korean ko with the korean error', async () => {
    const w = mount(CustomGrammarAddForm)
    await w.get('#cg-ko').setValue('abc')
    await w.get('#cg-meaning').setValue('you see')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(w.text()).toContain('settings.custom_grammar.error_korean')
  })

  it('calls addCustomGrammar with an 8-locale meaning and emits created', async () => {
    const w = mount(CustomGrammarAddForm)
    const store = useGrammarStore()
    const spy = vi.spyOn(store, 'addCustomGrammar')
    await w.get('#cg-ko').setValue('-거든요')
    await w.get('#cg-meaning').setValue('giving a reason')
    await w.get('#cg-example').setValue('바빠서 못 갔거든요')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    const arg = spy.mock.calls[0]![0]
    expect(arg.ko).toBe('-거든요')
    expect(Object.keys(arg.meaning)).toHaveLength(8)
    expect(arg.meaning.en).toBe('giving a reason')
    expect(arg.example).toBe('바빠서 못 갔거든요')
    expect(w.emitted('created')).toBeTruthy()
  })

  it('surfaces the duplicate error when addCustomGrammar returns null', async () => {
    const w = mount(CustomGrammarAddForm)
    const store = useGrammarStore()
    vi.spyOn(store, 'addCustomGrammar').mockResolvedValue(null)
    await w.get('#cg-ko').setValue('-거든요')
    await w.get('#cg-meaning').setValue('dup')
    await w.get('form').trigger('submit.prevent')
    await nextTick()
    expect(w.text()).toContain('settings.custom_grammar.error_duplicate')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/components/settings/CustomGrammarAddForm.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create `app/components/settings/CustomGrammarAddForm.vue`**

```vue
<script setup lang="ts">
import type { LocalizedString } from '~/lib/domain'
import { isHangulName, LOCALE_CODES } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const { t } = useI18n()
const store = useGrammarStore()
const emit = defineEmits<{ created: [ko: string] }>()

const ko = ref('')
const meaning = ref('')
const example = ref('')
const koError = ref('')

// Custom grammar is per-user; the same meaning text fills every locale slot so
// the author always sees their own wording regardless of interface language.
function buildMeaning(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

async function submit() {
  koError.value = ''
  const trimmedKo = ko.value.trim()
  if (!isHangulName(trimmedKo)) {
    koError.value = t('settings.custom_grammar.error_korean')
    return
  }
  const created = await store.addCustomGrammar({
    ko: trimmedKo,
    meaning: buildMeaning(meaning.value.trim()),
    example: example.value.trim() || undefined,
  })
  if (!created) {
    koError.value = t('settings.custom_grammar.error_duplicate')
    return
  }
  ko.value = ''
  meaning.value = ''
  example.value = ''
  emit('created', created.ko)
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <Field :label="t('settings.custom_grammar.ko_label')" html-for="cg-ko" :error="koError">
      <Input id="cg-ko" v-model="ko" :placeholder="t('settings.custom_grammar.ko_placeholder')" :error="!!koError" />
    </Field>
    <Field :label="t('settings.custom_grammar.meaning_label')" html-for="cg-meaning">
      <Input id="cg-meaning" v-model="meaning" :placeholder="t('settings.custom_grammar.meaning_placeholder')" />
    </Field>
    <Field :label="t('settings.custom_grammar.example_label')" html-for="cg-example">
      <Input id="cg-example" v-model="example" :placeholder="t('settings.custom_grammar.example_placeholder')" />
    </Field>
    <Button type="submit" size="sm">{{ t('settings.custom_grammar.add') }}</Button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/components/settings/CustomGrammarAddForm.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/settings/CustomGrammarAddForm.vue tests/components/settings/CustomGrammarAddForm.test.ts
git commit -m "feat(settings): CustomGrammarAddForm

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `CustomGrammarManager.vue` + mount in settings

**Files:** Create `app/components/settings/CustomGrammarManager.vue`; Modify `app/pages/settings.vue`; Test `tests/components/settings/CustomGrammarManager.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/settings/CustomGrammarManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import CustomGrammarManager from '~/components/settings/CustomGrammarManager.vue'
import { useGrammarStore } from '~/stores/grammar'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

describe('CustomGrammarManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('shows the empty state when there are no custom grammars', () => {
    const w = mount(CustomGrammarManager, { attachTo: document.body })
    expect(w.text()).toContain('settings.custom_grammar.empty')
  })

  it('lists a row per custom grammar and opens the confirm modal on delete', async () => {
    const w = mount(CustomGrammarManager, { attachTo: document.body })
    const store = useGrammarStore()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('reason') })
    await nextTick()
    expect(w.findAll('.cg-row')).toHaveLength(1)
    await w.get('.cg-row__delete').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/components/settings/CustomGrammarManager.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3a: Create `app/components/settings/CustomGrammarManager.vue`**

```vue
<script setup lang="ts">
import type { Grammar } from '~/lib/domain'
import { useGrammarStore } from '~/stores/grammar'
import { useToast } from '~/composables/useToast'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import CustomGrammarAddForm from '~/components/settings/CustomGrammarAddForm.vue'

const { t } = useI18n()
const { tl } = useLocalized()
const { success } = useToast()
const store = useGrammarStore()

const pendingDelete = ref<Grammar | null>(null)
function askDelete(g: Grammar) {
  pendingDelete.value = g
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete() {
  const g = pendingDelete.value
  if (!g) return
  const ok = await store.removeCustomGrammar(g.ko)
  pendingDelete.value = null
  if (ok) success(t('settings.custom_grammar.deleted'))
}
function onCreated() {
  success(t('settings.custom_grammar.created'))
}
</script>

<template>
  <section class="cg-mgr" :aria-label="t('settings.custom_grammar.title')">
    <BilingualTitle ko="내 문법" :latin="t('settings.custom_grammar.title')" level="h2" />
    <p class="cg-mgr__subtitle">{{ t('settings.custom_grammar.subtitle') }}</p>

    <p v-if="store.customGrammars.length === 0" class="cg-mgr__empty">
      {{ t('settings.custom_grammar.empty') }}
    </p>
    <ul v-else class="cg-mgr__list">
      <li v-for="g in store.customGrammars" :key="g.ko" class="cg-row">
        <div class="cg-row__text">
          <span class="cg-row__ko">{{ g.ko }}</span>
          <span class="cg-row__meaning">{{ tl(g.meaning) }}</span>
        </div>
        <button
          type="button"
          class="cg-row__delete"
          :aria-label="t('settings.custom_grammar.delete')"
          @click="askDelete(g)"
        >
          ✕
        </button>
      </li>
    </ul>

    <CustomGrammarAddForm class="cg-mgr__add" @created="onCreated" />

    <Modal
      :open="pendingDelete !== null"
      :close-label="t('settings.custom_grammar.delete')"
      :title="t('settings.custom_grammar.delete_confirm_title')"
      @close="cancelDelete"
    >
      <h2 class="cg-del__title">{{ t('settings.custom_grammar.delete_confirm_title') }}</h2>
      <p class="cg-del__body">
        {{ t('settings.custom_grammar.delete_confirm_body', { ko: pendingDelete?.ko }) }}
      </p>
      <div class="cg-del__actions">
        <Button variant="secondary" size="sm" @click="cancelDelete">
          {{ t('settings.custom_grammar.delete') }}
        </Button>
        <Button variant="danger" size="sm" @click="confirmDelete">
          {{ t('settings.custom_grammar.delete') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.cg-mgr { display: flex; flex-direction: column; gap: 12px; }
.cg-mgr__subtitle, .cg-mgr__empty { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text-soft); margin: 0; }
.cg-mgr__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.cg-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; background: var(--surface); border: 2px solid var(--border); }
.cg-row__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cg-row__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; color: var(--text); }
.cg-row__meaning { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); }
.cg-row__delete { background: none; border: none; cursor: pointer; color: var(--text-soft); font-size: 14px; padding: 4px; line-height: 1; }
.cg-row__delete:hover { color: var(--danger); }
.cg-row__delete:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.cg-del__title { font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; margin: 0 0 12px; color: var(--ink); }
.cg-del__body { font-family: 'Inter', sans-serif; font-size: 14px; margin: 0 0 20px; color: var(--ink); }
.cg-del__actions { display: flex; justify-content: flex-end; gap: 10px; }
</style>
```

- [ ] **Step 3b: Mount it in `app/pages/settings.vue`**

Add the import after the `ContextManager` import:

```ts
import CustomGrammarManager from '~/components/settings/CustomGrammarManager.vue'
```

In the Learning panel, add it after `<ContextManager />`:

```html
      <ContextManager />
      <CustomGrammarManager />
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/components/settings/CustomGrammarManager.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/settings/CustomGrammarManager.vue app/pages/settings.vue tests/components/settings/CustomGrammarManager.test.ts
git commit -m "feat(settings): CustomGrammarManager wired into the Learning tab

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: i18n — `settings.custom_grammar.*` (8 locales)

**Files:** Modify `i18n/locales/*.json` (×8); Test `tests/unit/i18n/custom-grammar-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/i18n/custom-grammar-keys.test.ts
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
  'title', 'subtitle', 'ko_label', 'ko_placeholder', 'meaning_label', 'meaning_placeholder',
  'example_label', 'example_placeholder', 'add', 'error_korean', 'error_duplicate',
  'delete', 'delete_confirm_title', 'delete_confirm_body', 'empty', 'created', 'deleted',
].map((k) => `settings.custom_grammar.${k}`)

describe('settings.custom_grammar.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    for (const key of KEYS) {
      it(`${code} defines ${key}`, () => {
        const v = dig(msgs, key)
        expect(typeof v, `${code} ${key}`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }
  }
  it('delete_confirm_body keeps the {ko} placeholder', () => {
    for (const [code, msgs] of Object.entries(locales)) {
      expect(dig(msgs, 'settings.custom_grammar.delete_confirm_body'), code).toContain('{ko}')
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/unit/i18n/custom-grammar-keys.test.ts`
Expected: FAIL — keys undefined.

- [ ] **Step 3: Add the `custom_grammar` block to each locale's `settings` object**

In each locale file, the `settings` object starts with `"settings": {\n    "dark_mode":`. Insert a `custom_grammar` block right after the `{` (before `dark_mode`), using the structural anchor `"settings": {\n    "dark_mode":` (identical across locales) — replace with `"settings": {\n    "custom_grammar": { … },\n    "dark_mode":`. English (`en.json`):

```json
    "custom_grammar": {
      "title": "Your own grammar",
      "subtitle": "Add patterns from your real life — they show up in practice like the rest.",
      "ko_label": "Pattern (Korean)",
      "ko_placeholder": "e.g. -거든요",
      "meaning_label": "Meaning",
      "meaning_placeholder": "e.g. giving a reason or background",
      "example_label": "Example (optional)",
      "example_placeholder": "e.g. 바빠서 못 갔거든요",
      "add": "Plant it",
      "error_korean": "Use the Korean pattern, e.g. -거든요.",
      "error_duplicate": "That pattern already exists.",
      "delete": "Delete",
      "delete_confirm_title": "Delete this grammar?",
      "delete_confirm_body": "“{ko}” will be removed from your patterns.",
      "empty": "No patterns of your own yet. Plant your first below.",
      "created": "Grammar added.",
      "deleted": "Grammar removed."
    },
```

Spanish (`es.json`):

```json
    "custom_grammar": {
      "title": "Tu propia gramática",
      "subtitle": "Añade patrones de tu vida real — aparecen en la práctica como el resto.",
      "ko_label": "Patrón (coreano)",
      "ko_placeholder": "p. ej. -거든요",
      "meaning_label": "Significado",
      "meaning_placeholder": "p. ej. dar una razón o contexto",
      "example_label": "Ejemplo (opcional)",
      "example_placeholder": "p. ej. 바빠서 못 갔거든요",
      "add": "Plántalo",
      "error_korean": "Usa el patrón en coreano, p. ej. -거든요.",
      "error_duplicate": "Ese patrón ya existe.",
      "delete": "Borrar",
      "delete_confirm_title": "¿Borrar esta gramática?",
      "delete_confirm_body": "«{ko}» se quitará de tus patrones.",
      "empty": "Aún no tienes patrones propios. Planta el primero abajo.",
      "created": "Gramática añadida.",
      "deleted": "Gramática eliminada."
    },
```

For `fr.json`, `pt-BR.json`, `th.json`, `id.json`, `vi.json`, `ja.json`: add the same block, translating each value (keep the Korean examples `-거든요` / `바빠서 못 갔거든요` as-is, and keep `{ko}` in `delete_confirm_body`). The parity test enforces presence + the `{ko}` placeholder.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/unit/i18n/custom-grammar-keys.test.ts`
Expected: PASS (136 parity + 1 placeholder test).

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/*.json tests/unit/i18n/custom-grammar-keys.test.ts
git commit -m "i18n(settings): custom_grammar.* in all 8 locales

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Final verification

- [ ] **Step 1: Full verify**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: all green.

- [ ] **Step 2: Manual smoke (best-effort, auth-gated)**

If a test account is available: Settings → Learning → add a custom grammar (e.g. `-거든요`); confirm it appears in the list, survives reload (persisted to `user_custom_grammars`), shows up in a practice draw and in the Library's "기타" section; delete it and confirm it's gone. (Same auth limitation as Steps 1–2.)

- [ ] **Step 3: Confirm scope** — no cascade-delete of SRS/log; custom grammars don't affect garden tree progress; no bulk import.

---

## Self-Review

**Spec coverage:** CUSTOM_DECK_ID + store actions → T1; write-filter fix → T2; add form → T3; manager + settings mount → T4; i18n → T5; verify → T6. All covered.

**Type consistency:** `CUSTOM_DECK_ID` (T1) reused in T2; `addCustomGrammar({ko, meaning: LocalizedString, example?})` signature identical across T1 store / T3 form / tests; `customGrammars` computed consumed by T4 manager; `removeCustomGrammar(ko)` consistent.

**Placeholder scan:** deferred content is the fr/pt-BR/th/id/vi/ja translations in T5 (real authoring; EN+ES canonical given; parity test gates) — no code placeholders.
