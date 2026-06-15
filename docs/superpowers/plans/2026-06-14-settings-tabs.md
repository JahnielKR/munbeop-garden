# Settings tabs (Tanda 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the settings page into 5 tabbed sections (Account · Appearance · Learning · Data · About) using a small accessible tablist component, and surface the signed-in email + sign-out in the new Account tab.

**Architecture:** A controlled `SettingsTabs.vue` renders only the WAI-ARIA tablist (roving tabindex, arrow-key activation, `aria-selected`/`aria-controls`); `settings.vue` owns the panels and toggles them with `v-show`. Existing panels (ContextManager, AboutSection, LocaleSwitcher, dark-mode toggle, export, AccountWidget) are composed into the panels — no logic rewrites.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, @nuxtjs/i18n, Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-14-settings-tabs-design.md](../specs/2026-06-14-settings-tabs-design.md)

**Conventions for every commit:**
- Run `pnpm` from `munbeop/`. Current branch is `claude/settings-tabs` (tracks origin/main — never bare-push).
- End every commit message with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: `SettingsTabs.vue` tablist component

**Files:**
- Create: `munbeop/app/components/settings/SettingsTabs.vue`
- Test: `munbeop/tests/components/settings/SettingsTabs.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/components/settings/SettingsTabs.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsTabs from '~/components/settings/SettingsTabs.vue'

const TABS = [
  { id: 'a', labelKey: 'k.a' },
  { id: 'b', labelKey: 'k.b' },
  { id: 'c', labelKey: 'k.c' },
]

function mountTabs(modelValue = 'a') {
  return mount(SettingsTabs, { props: { tabs: TABS, modelValue }, attachTo: document.body })
}

describe('SettingsTabs', () => {
  it('renders one tab per entry with roving tabindex + aria wiring', () => {
    const wrapper = mountTabs('a')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('aria-selected')).toBe('false')
    expect(tabs[0]!.attributes('tabindex')).toBe('0')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')
    expect(tabs[0]!.attributes('id')).toBe('tab-a')
    expect(tabs[0]!.attributes('aria-controls')).toBe('panel-a')
  })

  it('emits update:modelValue with the clicked tab id', async () => {
    const wrapper = mountTabs('a')
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
  })

  it('ArrowRight moves to next, ArrowLeft wraps to last', async () => {
    const right = mountTabs('a')
    await right.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(right.emitted('update:modelValue')).toEqual([['b']])

    const left = mountTabs('a')
    await left.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(left.emitted('update:modelValue')).toEqual([['c']])
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/components/settings/SettingsTabs.test.ts` → FAIL (component missing).

- [ ] **Step 3: Write the component** — create `munbeop/app/components/settings/SettingsTabs.vue`:

```vue
<script setup lang="ts">
interface Tab {
  id: string
  labelKey: string
}

const props = defineProps<{ tabs: Tab[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()

const tabRefs = ref<HTMLButtonElement[]>([])
function setTabRef(el: Element | null, i: number) {
  if (el) tabRefs.value[i] = el as HTMLButtonElement
}

function select(id: string) {
  emit('update:modelValue', id)
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  const count = props.tabs.length
  const next = e.key === 'ArrowRight' ? (index + 1) % count : (index - 1 + count) % count
  const nextTab = props.tabs[next]
  if (!nextTab) return
  emit('update:modelValue', nextTab.id)
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="t('title.settings')">
    <button
      v-for="(tab, i) in tabs"
      :id="`tab-${tab.id}`"
      :key="tab.id"
      :ref="(el) => setTabRef(el as Element | null, i)"
      type="button"
      role="tab"
      :aria-selected="tab.id === modelValue"
      :aria-controls="`panel-${tab.id}`"
      :tabindex="tab.id === modelValue ? 0 : -1"
      class="tab"
      :class="{ 'tab--active': tab.id === modelValue }"
      @click="select(tab.id)"
      @keydown="onKeydown($event, i)"
    >
      {{ t(tab.labelKey) }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tab {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  color: var(--text-soft);
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-button);
  padding: 10px 14px;
  cursor: pointer;
  transition:
    background-color var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.tab:hover {
  border-color: var(--border-strong);
}
.tab--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--border-strong);
}
.tab:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
:lang(th) .tab,
:lang(vi) .tab,
:lang(ja) .tab {
  font-size: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .tab {
    transition: none;
  }
}
</style>
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/components/settings/SettingsTabs.test.ts` → PASS (3 tests). Then `cd munbeop && pnpm typecheck` → PASS.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/components/settings/SettingsTabs.vue tests/components/settings/SettingsTabs.test.ts
git commit -m "feat(settings): add accessible SettingsTabs tablist component"
```

---

### Task 2: i18n `settings.tabs.*` (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/settings/i18n-tabs-keys.test.ts` (create)

- [ ] **Step 1: Write the failing parity test** — create `munbeop/tests/unit/settings/i18n-tabs-keys.test.ts`:

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
const KEYS = ['account', 'appearance', 'learning', 'data', 'about'] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.tabs.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every settings.tabs.* key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.tabs.${k}`)
        expect(typeof value, `${code} settings.tabs.${k}`).toBe('string')
        expect((value as string).length, `${code} settings.tabs.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-tabs-keys.test.ts` → FAIL (keys undefined).

- [ ] **Step 3: Add the keys.** In each locale, add a `tabs` sub-object INSIDE the existing `settings` object (which has `dark_mode`, `contexts`, `about`, `data`). Add a comma after the last existing sub-object and append. Use exactly:

**en.json:** `"tabs": { "account": "Account", "appearance": "Appearance", "learning": "Learning", "data": "Data", "about": "About" }`
**es.json:** `"tabs": { "account": "Cuenta", "appearance": "Apariencia", "learning": "Aprendizaje", "data": "Datos", "about": "Acerca de" }`
**fr.json:** `"tabs": { "account": "Compte", "appearance": "Apparence", "learning": "Apprentissage", "data": "Données", "about": "À propos" }`
**pt-BR.json:** `"tabs": { "account": "Conta", "appearance": "Aparência", "learning": "Aprendizado", "data": "Dados", "about": "Sobre" }`
**th.json:** `"tabs": { "account": "บัญชี", "appearance": "การแสดงผล", "learning": "การเรียน", "data": "ข้อมูล", "about": "เกี่ยวกับ" }`
**id.json:** `"tabs": { "account": "Akun", "appearance": "Tampilan", "learning": "Belajar", "data": "Data", "about": "Tentang" }`
**vi.json:** `"tabs": { "account": "Tài khoản", "appearance": "Giao diện", "learning": "Học tập", "data": "Dữ liệu", "about": "Giới thiệu" }`
**ja.json:** `"tabs": { "account": "アカウント", "appearance": "表示", "learning": "学習", "data": "データ", "about": "情報" }`

- [ ] **Step 4: Run the parity test + a full unit sweep** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-tabs-keys.test.ts` → PASS (8). Then `cd munbeop && pnpm test -- tests/unit` → 0 failures (a JSON error = a comma slip; fix and re-run).

- [ ] **Step 5: Commit**

```
cd munbeop && git add i18n/locales tests/unit/settings/i18n-tabs-keys.test.ts
git commit -m "i18n(settings): add tab labels across 8 locales"
```

---

### Task 3: Restructure `settings.vue` into tabs + panels + verification

**Files:**
- Modify (full rewrite): `munbeop/app/pages/settings.vue`

- [ ] **Step 1: Rewrite the page** — replace the entire contents of `munbeop/app/pages/settings.vue` with:

```vue
<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import AccountWidget from '~/components/layout/AccountWidget.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Button from '~/components/ui/Button.vue'
import SettingsTabs from '~/components/settings/SettingsTabs.vue'
import ContextManager from '~/components/settings/ContextManager.vue'
import AboutSection from '~/components/settings/AboutSection.vue'
import { useSettingsStore } from '~/stores/settings'
import { useDataExport } from '~/composables/useDataExport'

const { t } = useI18n()
const { theme } = useTheme()
const settings = useSettingsStore()
const { exportData } = useDataExport()

const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

const TABS = [
  { id: 'account', labelKey: 'settings.tabs.account' },
  { id: 'appearance', labelKey: 'settings.tabs.appearance' },
  { id: 'learning', labelKey: 'settings.tabs.learning' },
  { id: 'data', labelKey: 'settings.tabs.data' },
  { id: 'about', labelKey: 'settings.tabs.about' },
]
const active = ref('account')
</script>

<template>
  <div class="page">
    <BilingualTitle ko="설정" :latin="t('title.settings')" />
    <SettingsTabs v-model="active" :tabs="TABS" />

    <section
      v-show="active === 'account'"
      id="panel-account"
      role="tabpanel"
      aria-labelledby="tab-account"
      class="panel"
    >
      <AccountWidget />
    </section>

    <section
      v-show="active === 'appearance'"
      id="panel-appearance"
      role="tabpanel"
      aria-labelledby="tab-appearance"
      class="panel"
    >
      <LocaleSwitcher />
      <Field
        :label="t('settings.dark_mode')"
        html-for="settings-dark-mode"
        orientation="horizontal"
      >
        <Toggle id="settings-dark-mode" v-model="isDark" :label="t('settings.dark_mode')" />
      </Field>
    </section>

    <section
      v-show="active === 'learning'"
      id="panel-learning"
      role="tabpanel"
      aria-labelledby="tab-learning"
      class="panel"
    >
      <ContextManager />
    </section>

    <section
      v-show="active === 'data'"
      id="panel-data"
      role="tabpanel"
      aria-labelledby="tab-data"
      class="panel"
    >
      <BilingualTitle ko="데이터" :latin="t('settings.data.title')" level="h2" />
      <Button size="sm" @click="exportData">{{ t('settings.data.export') }}</Button>
    </section>

    <section
      v-show="active === 'about'"
      id="panel-about"
      role="tabpanel"
      aria-labelledby="tab-about"
      class="panel"
    >
      <AboutSection />
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 20px;
}
</style>
```

- [ ] **Step 2: Full verification gate** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS (≈662 tests). Report totals. `empty.settings` is now unused in `settings.vue` but the i18n key stays defined (harmless; other code/tests may reference it) — do NOT remove the key. If lint flags an unused import you left in, remove only that and re-run. If anything else fails, STOP and report.

- [ ] **Step 3: Commit**

```
cd munbeop && git add app/pages/settings.vue
git commit -m "feat(settings): restructure the settings page into tabbed sections"
```

---

## Self-review against the spec

- **Spec coverage:** SettingsTabs tablist with ARIA + arrow keys + roving tabindex (Task 1) · 5 tab labels × 8 locales + parity (Task 2) · settings.vue restructured into 5 `v-show` panels with the ARIA `id`/`aria-labelledby` contract, Account tab = AccountWidget, Appearance = language + dark mode, Learning = ContextManager, Data = export, About = AboutSection, placeholder removed (Task 3). ✓
- **Type consistency:** `Tab { id; labelKey }` used in the component and `TABS` in the page; `tab-<id>` / `panel-<id>` id contract matches between SettingsTabs (`aria-controls="panel-<id>"`, `id="tab-<id>"`) and the page panels (`id="panel-<id>"`, `aria-labelledby="tab-<id>"`); `v-model="active"` ↔ `update:modelValue`. ✓
- **No placeholders:** every step has real code/commands. ✓
- **Test caveats baked in:** SettingsTabs test uses `attachTo: document.body` (focus) and asserts emitted events + ARIA attrs (not focus, which is incidental); i18n parity mirrors the existing settings parity tests; `settings.vue` has no dedicated mount test (heavy multi-store page) — verified via typecheck + the full gate, with its panels' contents already covered by their own component tests. ✓
