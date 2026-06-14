# Settings "free wins" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix stale "Local-only" copy, surface legal links inside the authenticated app, and add a one-click JSON data export — the three quick wins from the settings overhaul.

**Architecture:** Copy edits to two info pages; a small presentational `AboutSection.vue` (links + contact) and a `useDataExport` composable (collect → download), both mounted as new cards in `settings.vue`; new `settings.about.*` / `settings.data.*` i18n keys across 8 locales.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, @nuxtjs/i18n, Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-14-settings-free-wins-design.md](../specs/2026-06-14-settings-free-wins-design.md)

**Conventions for every commit:**
- Run `pnpm` from `munbeop/`.
- End every commit message with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: Fix stale "Local-only" copy

**Files:**
- Modify: `munbeop/app/pages/policies.vue`
- Modify: `munbeop/app/pages/pricing.vue`
- Test: `munbeop/tests/unit/settings/stale-copy.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/unit/settings/stale-copy.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function read(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
}
const policies = read('../../../app/pages/policies.vue')
const pricing = read('../../../app/pages/pricing.vue')

describe('stale "Local-only" copy is gone', () => {
  it('policies.vue drops the local-only claim and states account sync', () => {
    expect(policies).not.toMatch(/Local-only/i)
    expect(policies).toContain('sync them to your account')
  })
  it('pricing.vue Sprout tier no longer says "Local-only progress"', () => {
    expect(pricing).not.toMatch(/Local-only/i)
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/stale-copy.test.ts` → FAIL (both files still contain "Local-only"; policies lacks the new wording).

- [ ] **Step 3: Make the edits**

In `munbeop/app/pages/policies.vue`, replace the Privacy `body` (the object whose `heading: 'Privacy'`):
- OLD: `    body: 'We store your email, your sentences, and your mastery progress. We do not sell your data. Local-only mode keeps everything on your device until you sign in.',`
- NEW: `    body: 'We store your email, your sentences, and your mastery progress, and sync them to your account so they follow you across devices. We do not sell your data.',`

In `munbeop/app/pages/pricing.vue`, replace the Sprout tier `bullets`:
- OLD: `    bullets: ['Local-only progress', 'Full grammar card decks', '8 UI languages'],`
- NEW: `    bullets: ['Grammar mastery tracking', 'Full grammar card decks', '8 UI languages'],`

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/unit/settings/stale-copy.test.ts` → PASS (2 tests).

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/pages/policies.vue app/pages/pricing.vue tests/unit/settings/stale-copy.test.ts
git commit -m "fix(content): drop stale 'Local-only' copy now that accounts sync"
```

---

### Task 2: i18n keys for the about + data cards (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/settings/i18n-free-wins-keys.test.ts` (create)

- [ ] **Step 1: Write the failing parity test** — create `munbeop/tests/unit/settings/i18n-free-wins-keys.test.ts`:

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

const KEYS = [
  'about.title', 'about.contact',
  'data.title', 'data.export', 'data.exported', 'data.export_error',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.about/data.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.${k}`)
        expect(typeof value, `${code} settings.${k}`).toBe('string')
        expect((value as string).length, `${code} settings.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-free-wins-keys.test.ts` → FAIL (keys undefined).

- [ ] **Step 3: Add the keys.** In each locale file, add `about` and `data` sub-objects INSIDE the existing `"settings"` object (which already has `dark_mode` + `contexts`). Add a comma after the `contexts` object and append. Use exactly these per locale:

**en.json** (append inside `settings`):
```json
    "about": { "title": "About & legal", "contact": "Contact" },
    "data": { "title": "Data & privacy", "export": "Export my data (.json)", "exported": "Your data is downloading.", "export_error": "Couldn't export your data. Please try again." }
```
**es.json:**
```json
    "about": { "title": "Acerca de y legal", "contact": "Contacto" },
    "data": { "title": "Datos y privacidad", "export": "Exportar mis datos (.json)", "exported": "Tus datos se están descargando.", "export_error": "No se pudieron exportar tus datos. Inténtalo de nuevo." }
```
**fr.json:**
```json
    "about": { "title": "À propos & mentions légales", "contact": "Contact" },
    "data": { "title": "Données et confidentialité", "export": "Exporter mes données (.json)", "exported": "Le téléchargement de vos données a commencé.", "export_error": "Impossible d’exporter vos données. Réessaie." }
```
**pt-BR.json:**
```json
    "about": { "title": "Sobre e jurídico", "contact": "Contato" },
    "data": { "title": "Dados e privacidade", "export": "Exportar meus dados (.json)", "exported": "Seus dados estão sendo baixados.", "export_error": "Não foi possível exportar seus dados. Tente novamente." }
```
**th.json:**
```json
    "about": { "title": "เกี่ยวกับและข้อกฎหมาย", "contact": "ติดต่อ" },
    "data": { "title": "ข้อมูลและความเป็นส่วนตัว", "export": "ส่งออกข้อมูลของฉัน (.json)", "exported": "กำลังดาวน์โหลดข้อมูลของคุณ", "export_error": "ส่งออกข้อมูลไม่สำเร็จ ลองอีกครั้ง" }
```
**id.json:**
```json
    "about": { "title": "Tentang & legal", "contact": "Kontak" },
    "data": { "title": "Data & privasi", "export": "Ekspor data saya (.json)", "exported": "Data kamu sedang diunduh.", "export_error": "Gagal mengekspor data kamu. Coba lagi." }
```
**vi.json:**
```json
    "about": { "title": "Giới thiệu & pháp lý", "contact": "Liên hệ" },
    "data": { "title": "Dữ liệu & quyền riêng tư", "export": "Xuất dữ liệu của tôi (.json)", "exported": "Dữ liệu của bạn đang được tải xuống.", "export_error": "Không thể xuất dữ liệu của bạn. Thử lại." }
```
**ja.json:**
```json
    "about": { "title": "情報と規約", "contact": "お問い合わせ" },
    "data": { "title": "データとプライバシー", "export": "データをエクスポート (.json)", "exported": "データをダウンロードしています。", "export_error": "データをエクスポートできませんでした。もう一度お試しください。" }
```
> Insert each block inside the existing `settings` object after the `contexts` block (add the trailing comma after `contexts`). Keep JSON valid.

- [ ] **Step 4: Run the parity test + a full unit sweep** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-free-wins-keys.test.ts` → PASS (8). Then `cd munbeop && pnpm test -- tests/unit` → no other i18n test broke (a JSON error = a comma slip; fix and re-run).

- [ ] **Step 5: Commit**

```
cd munbeop && git add i18n/locales tests/unit/settings/i18n-free-wins-keys.test.ts
git commit -m "i18n(settings): add about + data card strings across 8 locales"
```

---

### Task 3: `AboutSection.vue`

**Files:**
- Create: `munbeop/app/components/settings/AboutSection.vue`
- Test: `munbeop/tests/components/settings/AboutSection.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/components/settings/AboutSection.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutSection from '~/components/settings/AboutSection.vue'

describe('AboutSection', () => {
  it('links to policies, pricing, features and a contact mailto', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.find('a[href="/policies"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/pricing"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/features"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:hello@mungarden.app"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/components/settings/AboutSection.test.ts` → FAIL (component missing).

- [ ] **Step 3: Write the component** — create `munbeop/app/components/settings/AboutSection.vue`:

```vue
<script setup lang="ts">
import { NuxtLink } from '#components'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'

const { t } = useI18n()

const links = [
  { to: '/policies', labelKey: 'welcome.menu.policies' },
  { to: '/pricing', labelKey: 'welcome.menu.pricing' },
  { to: '/features', labelKey: 'welcome.menu.features' },
] as const
</script>

<template>
  <section class="about" :aria-label="t('settings.about.title')">
    <BilingualTitle ko="정보" :latin="t('settings.about.title')" level="h2" />
    <ul class="about__list">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to" class="about__link">{{ t(link.labelKey) }}</NuxtLink>
      </li>
      <li>
        <a class="about__link" href="mailto:hello@mungarden.app">{{ t('settings.about.contact') }}</a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.about__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.about__link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  text-decoration: none;
}
.about__link:hover {
  color: var(--heading-accent);
  text-decoration: underline;
}
.about__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/components/settings/AboutSection.test.ts` → PASS (1 test).

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/components/settings/AboutSection.vue tests/components/settings/AboutSection.test.ts
git commit -m "feat(settings): add About & legal links section"
```

---

### Task 4: `useDataExport` composable

**Files:**
- Create: `munbeop/app/composables/useDataExport.ts`
- Test: `munbeop/tests/unit/composables/useDataExport.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/unit/composables/useDataExport.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRead = vi.fn()
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: mockRead, write: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useDataExport } from '~/composables/useDataExport'

describe('useDataExport.collectExportData', () => {
  beforeEach(() => mockRead.mockReset())

  it('reads every export key and assembles a labelled payload', async () => {
    mockRead.mockImplementation(async (key: string) => `value-for-${key}`)
    const payload = await useDataExport().collectExportData()
    expect(payload.app).toBe('munbeop-garden')
    expect(typeof payload.exportedAt).toBe('string')
    expect(Object.keys(payload.data)).toEqual([
      'munbeop.v1.grammar',
      'munbeop.v1.srs',
      'munbeop.v1.log',
      'munbeop.v1.decks',
      'munbeop.v1.customContexts',
      'munbeop.v1.inactiveContextIds',
      'munbeop.v1.settings',
    ])
    expect(payload.data['munbeop.v1.log']).toBe('value-for-munbeop.v1.log')
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/composables/useDataExport.test.ts` → FAIL (composable missing).

- [ ] **Step 3: Write the composable** — create `munbeop/app/composables/useDataExport.ts`:

```ts
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'

/**
 * useDataExport — one-click "take my data" JSON download.
 *
 * collectExportData() reads every syncable key (a complete backup: the user's
 * authored data plus the shared grammar catalog they were using) into one
 * labelled object. downloadJson() turns it into a file the browser saves.
 * exportData() wires the two together with a success/error toast.
 */
const EXPORT_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
  STORAGE_KEYS.settings,
] as const

export interface ExportPayload {
  exportedAt: string
  app: string
  data: Record<string, unknown>
}

export function useDataExport() {
  const { t } = useI18n()
  const toast = useToast()

  async function collectExportData(): Promise<ExportPayload> {
    const storage = useStorageAdapter()
    const entries = await Promise.all(
      EXPORT_KEYS.map(async (key) => [key, await storage.read<unknown>(key, null)] as const),
    )
    return {
      exportedAt: new Date().toISOString(),
      app: 'munbeop-garden',
      data: Object.fromEntries(entries),
    }
  }

  function downloadJson(obj: unknown, filename: string): void {
    if (typeof document === 'undefined') return
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function exportData(): Promise<void> {
    try {
      const payload = await collectExportData()
      const date = new Date().toISOString().slice(0, 10)
      downloadJson(payload, `mungarden-export-${date}.json`)
      toast.success(t('settings.data.exported'))
    } catch {
      toast.error(t('settings.data.export_error'))
    }
  }

  return { collectExportData, downloadJson, exportData }
}
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/unit/composables/useDataExport.test.ts` → PASS (1 test). Then `cd munbeop && pnpm typecheck` → PASS.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/composables/useDataExport.ts tests/unit/composables/useDataExport.test.ts
git commit -m "feat(settings): add useDataExport (.json backup of account data)"
```

---

### Task 5: Mount the two cards in `settings.vue` + full verification

**Files:**
- Modify: `munbeop/app/pages/settings.vue`

- [ ] **Step 1: Edit the page.** In `munbeop/app/pages/settings.vue` `<script setup>`, add imports + the export action:
```ts
import AboutSection from '~/components/settings/AboutSection.vue'
import Button from '~/components/ui/Button.vue'
import { useDataExport } from '~/composables/useDataExport'
```
and after the existing `const settings = useSettingsStore()` line:
```ts
const { exportData } = useDataExport()
```

In the `<template>`, insert these two cards immediately BEFORE the `<div class="empty">…</div>` line:
```vue
    <div class="card">
      <div class="data-card">
        <BilingualTitle ko="데이터" :latin="t('settings.data.title')" level="h2" />
        <Button size="sm" @click="exportData">{{ t('settings.data.export') }}</Button>
      </div>
    </div>
    <div class="card card--wide">
      <AboutSection />
    </div>
```

In `<style scoped>`, add:
```css
.data-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
```

- [ ] **Step 2: Full verification gate** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS. Report totals. If lint flags an unused import you introduced, fix only that and re-run. If anything else fails, STOP and report.

- [ ] **Step 3: Commit**

```
cd munbeop && git add app/pages/settings.vue
git commit -m "feat(settings): mount Data & privacy + About cards on the settings page"
```

---

## Self-review against the spec

- **Spec coverage:** copy fix + guard test (Task 1) · i18n about/data keys × 8 + parity (Task 2) · AboutSection links + contact (Task 3) · useDataExport complete-backup collect + download + toast (Task 4) · two cards mounted + verification (Task 5). ✓ All spec sections map to a task.
- **Beyond-spec addition:** `settings.data.export_error` key (6th key vs the spec's 5) — added for the export failure toast in `exportData()`'s catch. Justified, additive.
- **Type consistency:** `EXPORT_KEYS` (7 `STORAGE_KEYS` entries) drives both the composable and the test's expected key order; `ExportPayload { exportedAt, app, data }` matches the test assertions; `useDataExport()` exposes `collectExportData`/`downloadJson`/`exportData`; AboutSection imports `NuxtLink` from `#components` (the test alias renders `<a :href="to">`, so href assertions hold). ✓
- **No placeholders:** every step has real code/commands. ✓
- **Test caveats baked in:** `stale-copy` + uses `// @vitest-environment node` for `fileURLToPath`; `useDataExport` test `vi.mock`s `useStorageAdapter` (avoids `useNuxtApp`); `downloadJson`'s DOM path is not unit-tested (happy-dom lacks `URL.createObjectURL`) — `collectExportData` is the tested logic. ✓
