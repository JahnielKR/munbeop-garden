# Context Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give signed-in users a UI in Settings to activate/deactivate practice contexts, add custom ones, and delete their own — fixing the permanent "fewer than 3 active contexts" practice lock.

**Architecture:** Two small self-contained components under `app/components/settings/` (`ContextManager.vue` + `ContextAddForm.vue`) driven by the existing `useContextsStore`. The store gains a shared `MIN_ACTIVE_CONTEXTS` constant, a guard on `toggleActive`, and a new `removeCustom`. A pure `isHangulName` helper validates custom names. `settings.vue` mounts `<ContextManager />` as a card.

**Tech Stack:** Nuxt 4 (SPA), Vue 3 `<script setup>`, Pinia setup-stores, @nuxtjs/i18n (8 locales), Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-14-context-manager-design.md](../specs/2026-06-14-context-manager-design.md)

**Conventions for every commit in this plan:**
- Run from the app dir: `cd munbeop` before any `pnpm` command.
- Every commit message must end with the trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- Test files live under `munbeop/tests/`; source under `munbeop/app/`.

---

### Task 1: `isHangulName` validation helper

**Files:**
- Modify: `munbeop/app/lib/domain/context.ts` (append a function; the barrel `app/lib/domain/index.ts:3` already re-exports `./context`)
- Test: `munbeop/tests/unit/domain/context.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/domain/context.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isHangulName } from '~/lib/domain'

describe('isHangulName', () => {
  it('accepts strings containing Hangul syllables', () => {
    expect(isHangulName('반말')).toBe(true)
    expect(isHangulName('격식체')).toBe(true)
    expect(isHangulName('SNS에')).toBe(true) // mixed Latin + Hangul still counts
  })

  it('rejects strings with no Hangul', () => {
    expect(isHangulName('banmal')).toBe(false)
    expect(isHangulName('')).toBe(false)
    expect(isHangulName('   ')).toBe(false)
    expect(isHangulName('123')).toBe(false)
    expect(isHangulName('🙂')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/unit/domain/context.test.ts`
Expected: FAIL — `isHangulName is not a function` / import error.

- [ ] **Step 3: Write minimal implementation**

Append to `munbeop/app/lib/domain/context.ts`:

```ts
/**
 * True if the string contains at least one Hangul character — syllables
 * (가-힣), conjoining jamo (ᄀ-ᇿ), or compatibility jamo (ㄱ-ㆎ). Used to
 * keep custom context names visually consistent with the built-in Korean
 * badges (반말, 존댓말, …).
 */
export function isHangulName(value: string): boolean {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(value)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd munbeop && pnpm test -- tests/unit/domain/context.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/lib/domain/context.ts tests/unit/domain/context.test.ts
git commit -m "feat(settings): add isHangulName helper for custom context names"
```

---

### Task 2: `MIN_ACTIVE_CONTEXTS` constant + `toggleActive` guard

**Files:**
- Modify: `munbeop/app/stores/contexts.ts`
- Test: `munbeop/tests/unit/stores/contexts.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/stores/contexts.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'

// Store actions call useStorageAdapter() -> useNuxtApp(); with no client the
// facade returns the Noop adapter (writes dropped), which is all we need to
// exercise the in-memory guard logic.
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

describe('useContextsStore — toggleActive guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes MIN_ACTIVE_CONTEXTS = 3', () => {
    expect(MIN_ACTIVE_CONTEXTS).toBe(3)
  })

  it('deactivates while above the minimum and returns true', async () => {
    const store = useContextsStore()
    const start = store.active.length // 8 built-ins
    const ok = await store.toggleActive('banmal')
    expect(ok).toBe(true)
    expect(store.active.length).toBe(start - 1)
  })

  it('refuses to drop below the minimum and returns false', async () => {
    const store = useContextsStore()
    // 8 built-ins → deactivate 5 to reach exactly 3 active.
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id)
    expect(store.active.length).toBe(3)
    const refused = await store.toggleActive(ids[5]!) // would make it 2
    expect(refused).toBe(false)
    expect(store.active.length).toBe(3)
  })

  it('always allows re-activating an inactive context', async () => {
    const store = useContextsStore()
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id)
    expect(store.active.length).toBe(3)
    const reactivated = await store.toggleActive(ids[0]!) // turn one back on
    expect(reactivated).toBe(true)
    expect(store.active.length).toBe(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/unit/stores/contexts.test.ts`
Expected: FAIL — `MIN_ACTIVE_CONTEXTS` is not exported; `toggleActive` returns `undefined`, not a boolean.

- [ ] **Step 3: Write minimal implementation**

In `munbeop/app/stores/contexts.ts`, add the constant above the store and rewrite `toggleActive`. Add the export at the top of the file (after imports):

```ts
/** Practice needs at least this many active contexts (see usePractice.ts). */
export const MIN_ACTIVE_CONTEXTS = 3
```

Replace the existing `toggleActive` with:

```ts
  async function toggleActive(id: string): Promise<boolean> {
    const storage = useStorageAdapter()
    const isInactive = inactiveIds.value.includes(id)
    // Re-activating is always allowed. Deactivating is blocked when it would
    // drop the active set below the practice minimum.
    if (!isInactive && active.value.length <= MIN_ACTIVE_CONTEXTS) {
      return false
    }
    if (isInactive) {
      inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
    } else {
      inactiveIds.value = [...inactiveIds.value, id]
    }
    await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
    return true
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd munbeop && pnpm test -- tests/unit/stores/contexts.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/stores/contexts.ts tests/unit/stores/contexts.test.ts
git commit -m "feat(settings): guard toggleActive against dropping below 3 active contexts"
```

---

### Task 3: `removeCustom` store action

**Files:**
- Modify: `munbeop/app/stores/contexts.ts`
- Test: `munbeop/tests/unit/stores/contexts.test.ts` (extend)

- [ ] **Step 1: Write the failing test**

Append a new `describe` block to `munbeop/tests/unit/stores/contexts.test.ts`:

```ts
import type { LocalizedString } from '~/lib/domain'
import { LOCALE_CODES } from '~/lib/domain'

function scene(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

describe('useContextsStore — addCustom + removeCustom', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addCustom creates a custom context and rejects duplicates', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home'))
    expect(created).not.toBeNull()
    expect(created!.category).toBe('custom')
    expect(created!.builtin).toBe(false)
    expect(created!.id.startsWith('custom_')).toBe(true)
    expect(store.all.some((c) => c.name === '우리집')).toBe(true)

    const dup = await store.addCustom('우리집', scene('again'))
    expect(dup).toBeNull()
  })

  it('removeCustom deletes a custom context and scrubs it from inactiveIds', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home'))
    await store.toggleActive(created!.id) // make it inactive first
    expect(store.inactiveIds).toContain(created!.id)

    const ok = await store.removeCustom(created!.id)
    expect(ok).toBe(true)
    expect(store.all.some((c) => c.id === created!.id)).toBe(false)
    expect(store.inactiveIds).not.toContain(created!.id)
  })

  it('removeCustom refuses for built-in ids', async () => {
    const store = useContextsStore()
    const ok = await store.removeCustom('banmal')
    expect(ok).toBe(false)
    expect(store.all.some((c) => c.id === 'banmal')).toBe(true)
  })

  it('removeCustom refuses when it would drop active below the minimum', async () => {
    const store = useContextsStore()
    const created = await store.addCustom('우리집', scene('at home')) // active now 9
    const ids = store.all.map((c) => c.id).filter((id) => id !== created!.id)
    for (const id of ids.slice(0, 6)) await store.toggleActive(id) // 9 - 6 = 3 active (incl. custom)
    expect(store.active.length).toBe(3)
    const refused = await store.removeCustom(created!.id) // custom is active → would make 2
    expect(refused).toBe(false)
    expect(store.all.some((c) => c.id === created!.id)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/unit/stores/contexts.test.ts`
Expected: FAIL — `store.removeCustom is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `munbeop/app/stores/contexts.ts`, add `removeCustom` after `addCustom`, and add it to the returned object:

```ts
  async function removeCustom(id: string): Promise<boolean> {
    const target = custom.value.find((c) => c.id === id)
    if (!target) return false // built-in or unknown id — not removable
    const isActive = !inactiveIds.value.includes(id)
    if (isActive && active.value.length <= MIN_ACTIVE_CONTEXTS) {
      return false // removing an active context can't drop us below the minimum
    }
    const storage = useStorageAdapter()
    custom.value = custom.value.filter((c) => c.id !== id)
    if (inactiveIds.value.includes(id)) {
      inactiveIds.value = inactiveIds.value.filter((x) => x !== id)
      await storage.write(STORAGE_KEYS.inactiveContextIds, inactiveIds.value)
    }
    await storage.write(STORAGE_KEYS.customContexts, custom.value)
    return true
  }
```

Update the return statement to include it:

```ts
  return { custom, inactiveIds, all, active, byId, hydrate, toggleActive, addCustom, removeCustom }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd munbeop && pnpm test -- tests/unit/stores/contexts.test.ts`
Expected: PASS (all blocks).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/stores/contexts.ts tests/unit/stores/contexts.test.ts
git commit -m "feat(settings): add removeCustom store action for custom contexts"
```

---

### Task 4: Use the shared minimum in `usePractice`

**Files:**
- Modify: `munbeop/app/composables/usePractice.ts:31-35`

- [ ] **Step 1: Make the change** (behavior-preserving — `MIN_ACTIVE_CONTEXTS === 3`, already covered by Task 2's constant test)

Add to the imports in `usePractice.ts` (it already imports from `~/stores/contexts`):

```ts
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'
```

Replace the literal check:

```ts
      const activeContexts = contextsStore.active
      if (activeContexts.length < MIN_ACTIVE_CONTEXTS) {
        error.value = t('practice.no_contexts')
        return
      }
```

- [ ] **Step 2: Run the existing practice/session suite + typecheck**

Run: `cd munbeop && pnpm test -- tests/unit/practice && pnpm typecheck`
Expected: PASS — no behavior change; types resolve.

- [ ] **Step 3: Commit**

```bash
cd munbeop && git add app/composables/usePractice.ts
git commit -m "refactor(practice): use shared MIN_ACTIVE_CONTEXTS constant"
```

---

### Task 5: i18n `settings.contexts.*` keys (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json` (replace the `"settings"` object)
- Test: `munbeop/tests/unit/settings/i18n-contexts-keys.test.ts` (create)

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/settings/i18n-contexts-keys.test.ts`:

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

// Dotted paths under settings.contexts.*
const KEYS = [
  'title', 'subtitle',
  'category.formalidad', 'category.situacional', 'category.custom',
  'add', 'name_label', 'name_placeholder', 'scene_label', 'scene_placeholder',
  'error_korean', 'error_duplicate', 'error_scene_required',
  'min_active_hint', 'active_count', 'delete',
  'delete_confirm_title', 'delete_confirm_body', 'created', 'deleted', 'cancel',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.contexts.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every settings.contexts.* key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.contexts.${k}`)
        expect(typeof value, `${code} settings.contexts.${k}`).toBe('string')
        expect((value as string).length, `${code} settings.contexts.${k}`).toBeGreaterThan(0)
      }
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/unit/settings/i18n-contexts-keys.test.ts`
Expected: FAIL — keys undefined in every locale.

- [ ] **Step 3: Add the keys to each locale**

In each file, replace the existing `"settings": { ... }` object with the version below. (Today it is `"settings": { "dark_mode": "..." }`; keep `dark_mode`, add `contexts`.)

**en.json:**
```json
  "settings": {
    "dark_mode": "Dark mode",
    "contexts": {
      "title": "Practice contexts",
      "subtitle": "Pick which situations show up in practice.",
      "category": { "formalidad": "Formality", "situacional": "Situational", "custom": "Your contexts" },
      "add": "Add context",
      "name_label": "Name (Korean)",
      "name_placeholder": "e.g. 반말",
      "scene_label": "When does it apply?",
      "scene_placeholder": "e.g. texting a close friend",
      "error_korean": "Use a Korean name, e.g. 반말.",
      "error_duplicate": "A context with this name already exists.",
      "error_scene_required": "Add a short description.",
      "min_active_hint": "Keep at least 3 active to practice.",
      "active_count": "{count} active",
      "delete": "Delete",
      "delete_confirm_title": "Delete this context?",
      "delete_confirm_body": "“{name}” will be removed from your contexts.",
      "created": "Context added.",
      "deleted": "Context deleted.",
      "cancel": "Cancel"
    }
  },
```

**es.json:**
```json
  "settings": {
    "dark_mode": "Modo oscuro",
    "contexts": {
      "title": "Contextos de práctica",
      "subtitle": "Elige qué situaciones aparecen en la práctica.",
      "category": { "formalidad": "Formalidad", "situacional": "Situacional", "custom": "Tus contextos" },
      "add": "Añadir contexto",
      "name_label": "Nombre (coreano)",
      "name_placeholder": "ej. 반말",
      "scene_label": "¿Cuándo aplica?",
      "scene_placeholder": "ej. escribiendo a un amigo cercano",
      "error_korean": "Usa un nombre en coreano, ej. 반말.",
      "error_duplicate": "Ya existe un contexto con ese nombre.",
      "error_scene_required": "Añade una descripción corta.",
      "min_active_hint": "Mantén al menos 3 activos para practicar.",
      "active_count": "{count} activos",
      "delete": "Eliminar",
      "delete_confirm_title": "¿Eliminar este contexto?",
      "delete_confirm_body": "«{name}» se quitará de tus contextos.",
      "created": "Contexto añadido.",
      "deleted": "Contexto eliminado.",
      "cancel": "Cancelar"
    }
  },
```
> Note: keep the existing `dark_mode` value already in each file if it differs; only add the `contexts` block. (The `dark_mode` strings above are reference values — do not overwrite a translation that already exists.)

**fr.json:**
```json
    "contexts": {
      "title": "Contextes de pratique",
      "subtitle": "Choisis les situations qui apparaissent en pratique.",
      "category": { "formalidad": "Formalité", "situacional": "Situationnel", "custom": "Tes contextes" },
      "add": "Ajouter un contexte",
      "name_label": "Nom (coréen)",
      "name_placeholder": "ex. 반말",
      "scene_label": "Quand l’utiliser ?",
      "scene_placeholder": "ex. écrire à un ami proche",
      "error_korean": "Utilise un nom en coréen, ex. 반말.",
      "error_duplicate": "Un contexte portant ce nom existe déjà.",
      "error_scene_required": "Ajoute une courte description.",
      "min_active_hint": "Garde au moins 3 contextes actifs pour pratiquer.",
      "active_count": "{count} actifs",
      "delete": "Supprimer",
      "delete_confirm_title": "Supprimer ce contexte ?",
      "delete_confirm_body": "« {name} » sera retiré de tes contextes.",
      "created": "Contexte ajouté.",
      "deleted": "Contexte supprimé.",
      "cancel": "Annuler"
    }
```

**pt-BR.json:**
```json
    "contexts": {
      "title": "Contextos de prática",
      "subtitle": "Escolha quais situações aparecem na prática.",
      "category": { "formalidad": "Formalidade", "situacional": "Situacional", "custom": "Seus contextos" },
      "add": "Adicionar contexto",
      "name_label": "Nome (coreano)",
      "name_placeholder": "ex. 반말",
      "scene_label": "Quando se aplica?",
      "scene_placeholder": "ex. conversando com um amigo próximo",
      "error_korean": "Use um nome em coreano, ex. 반말.",
      "error_duplicate": "Já existe um contexto com esse nome.",
      "error_scene_required": "Adicione uma descrição curta.",
      "min_active_hint": "Mantenha ao menos 3 ativos para praticar.",
      "active_count": "{count} ativos",
      "delete": "Excluir",
      "delete_confirm_title": "Excluir este contexto?",
      "delete_confirm_body": "“{name}” será removido dos seus contextos.",
      "created": "Contexto adicionado.",
      "deleted": "Contexto excluído.",
      "cancel": "Cancelar"
    }
```

**th.json:**
```json
    "contexts": {
      "title": "บริบทการฝึก",
      "subtitle": "เลือกสถานการณ์ที่จะปรากฏในการฝึก",
      "category": { "formalidad": "ความเป็นทางการ", "situacional": "ตามสถานการณ์", "custom": "บริบทของคุณ" },
      "add": "เพิ่มบริบท",
      "name_label": "ชื่อ (ภาษาเกาหลี)",
      "name_placeholder": "เช่น 반말",
      "scene_label": "ใช้เมื่อไหร่?",
      "scene_placeholder": "เช่น ส่งข้อความหาเพื่อนสนิท",
      "error_korean": "ใช้ชื่อภาษาเกาหลี เช่น 반말",
      "error_duplicate": "มีบริบทชื่อนี้อยู่แล้ว",
      "error_scene_required": "เพิ่มคำอธิบายสั้นๆ",
      "min_active_hint": "เปิดใช้งานอย่างน้อย 3 บริบทเพื่อฝึก",
      "active_count": "เปิดใช้ {count} บริบท",
      "delete": "ลบ",
      "delete_confirm_title": "ลบบริบทนี้?",
      "delete_confirm_body": "“{name}” จะถูกลบออกจากบริบทของคุณ",
      "created": "เพิ่มบริบทแล้ว",
      "deleted": "ลบบริบทแล้ว",
      "cancel": "ยกเลิก"
    }
```

**id.json:**
```json
    "contexts": {
      "title": "Konteks latihan",
      "subtitle": "Pilih situasi mana yang muncul saat latihan.",
      "category": { "formalidad": "Formalitas", "situacional": "Situasional", "custom": "Konteks kamu" },
      "add": "Tambah konteks",
      "name_label": "Nama (Korea)",
      "name_placeholder": "mis. 반말",
      "scene_label": "Kapan digunakan?",
      "scene_placeholder": "mis. mengirim pesan ke teman dekat",
      "error_korean": "Gunakan nama Korea, mis. 반말.",
      "error_duplicate": "Konteks dengan nama ini sudah ada.",
      "error_scene_required": "Tambahkan deskripsi singkat.",
      "min_active_hint": "Aktifkan minimal 3 untuk berlatih.",
      "active_count": "{count} aktif",
      "delete": "Hapus",
      "delete_confirm_title": "Hapus konteks ini?",
      "delete_confirm_body": "“{name}” akan dihapus dari konteksmu.",
      "created": "Konteks ditambahkan.",
      "deleted": "Konteks dihapus.",
      "cancel": "Batal"
    }
```

**vi.json:**
```json
    "contexts": {
      "title": "Ngữ cảnh luyện tập",
      "subtitle": "Chọn những tình huống xuất hiện khi luyện tập.",
      "category": { "formalidad": "Mức trang trọng", "situacional": "Theo tình huống", "custom": "Ngữ cảnh của bạn" },
      "add": "Thêm ngữ cảnh",
      "name_label": "Tên (tiếng Hàn)",
      "name_placeholder": "vd. 반말",
      "scene_label": "Dùng khi nào?",
      "scene_placeholder": "vd. nhắn tin cho bạn thân",
      "error_korean": "Dùng tên tiếng Hàn, vd. 반말.",
      "error_duplicate": "Đã có ngữ cảnh trùng tên này.",
      "error_scene_required": "Thêm mô tả ngắn.",
      "min_active_hint": "Giữ ít nhất 3 ngữ cảnh để luyện tập.",
      "active_count": "{count} đang bật",
      "delete": "Xóa",
      "delete_confirm_title": "Xóa ngữ cảnh này?",
      "delete_confirm_body": "“{name}” sẽ bị xóa khỏi ngữ cảnh của bạn.",
      "created": "Đã thêm ngữ cảnh.",
      "deleted": "Đã xóa ngữ cảnh.",
      "cancel": "Hủy"
    }
```

**ja.json:**
```json
    "contexts": {
      "title": "練習シーン",
      "subtitle": "練習に出てくる場面を選びます。",
      "category": { "formalidad": "敬語レベル", "situacional": "シチュエーション", "custom": "あなたのシーン" },
      "add": "シーンを追加",
      "name_label": "名前（韓国語）",
      "name_placeholder": "例: 반말",
      "scene_label": "どんな時に使う？",
      "scene_placeholder": "例: 親しい友達にメッセージ",
      "error_korean": "韓国語の名前を入力してください（例: 반말）。",
      "error_duplicate": "同じ名前のシーンが既にあります。",
      "error_scene_required": "短い説明を追加してください。",
      "min_active_hint": "練習するには3つ以上を有効にしてください。",
      "active_count": "{count}件有効",
      "delete": "削除",
      "delete_confirm_title": "このシーンを削除しますか？",
      "delete_confirm_body": "「{name}」をシーンから削除します。",
      "created": "シーンを追加しました。",
      "deleted": "シーンを削除しました。",
      "cancel": "キャンセル"
    }
```
> For fr/pt-BR/th/id/vi/ja: insert the `"contexts": { … }` block inside the existing `"settings"` object (which already holds `dark_mode`), adding a comma after `dark_mode`. 화이팅 and Korean particles are never translated.

- [ ] **Step 4: Run the parity test (and confirm valid JSON)**

Run: `cd munbeop && pnpm test -- tests/unit/settings/i18n-contexts-keys.test.ts`
Expected: PASS (8 tests — one per locale). A JSON syntax error here means a missing/extra comma; fix and re-run.

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add i18n/locales tests/unit/settings/i18n-contexts-keys.test.ts
git commit -m "i18n(settings): add settings.contexts.* strings across 8 locales"
```

---

### Task 6: `ContextAddForm.vue`

**Files:**
- Create: `munbeop/app/components/settings/ContextAddForm.vue`
- Test: `munbeop/tests/components/settings/ContextAddForm.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/settings/ContextAddForm.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import ContextAddForm from '~/components/settings/ContextAddForm.vue'
import { useContextsStore } from '~/stores/contexts'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountForm() {
  return mount(ContextAddForm)
}

describe('ContextAddForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('rejects a non-Korean name with the korean error', async () => {
    const wrapper = mountForm()
    await wrapper.get('#ctx-name').setValue('banmal')
    await wrapper.get('#ctx-scene').setValue('with a friend')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_korean')
  })

  it('rejects an empty scene with the scene-required error', async () => {
    const wrapper = mountForm()
    await wrapper.get('#ctx-name').setValue('우리집')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_scene_required')
  })

  it('calls addCustom with an 8-locale scene and emits created on success', async () => {
    const wrapper = mountForm()
    const store = useContextsStore()
    const spy = vi.spyOn(store, 'addCustom')
    await wrapper.get('#ctx-name').setValue('우리집')
    await wrapper.get('#ctx-scene').setValue('at home')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    const [name, scene] = spy.mock.calls[0]!
    expect(name).toBe('우리집')
    expect(Object.keys(scene)).toHaveLength(8)
    expect(scene.en).toBe('at home')
    expect(wrapper.emitted('created')).toBeTruthy()
  })

  it('surfaces the duplicate error when addCustom returns null', async () => {
    const wrapper = mountForm()
    const store = useContextsStore()
    vi.spyOn(store, 'addCustom').mockResolvedValue(null)
    await wrapper.get('#ctx-name').setValue('반말')
    await wrapper.get('#ctx-scene').setValue('dup')
    await wrapper.get('form').trigger('submit.prevent')
    await nextTick()
    expect(wrapper.text()).toContain('settings.contexts.error_duplicate')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/components/settings/ContextAddForm.test.ts`
Expected: FAIL — component file does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/settings/ContextAddForm.vue`:

```vue
<script setup lang="ts">
import type { LocalizedString } from '~/lib/domain'
import { isHangulName, LOCALE_CODES } from '~/lib/domain'
import { useContextsStore } from '~/stores/contexts'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const { t } = useI18n()
const store = useContextsStore()
const emit = defineEmits<{ created: [name: string] }>()

const name = ref('')
const scene = ref('')
const nameError = ref('')
const sceneError = ref('')

// Custom contexts are per-user; the same description fills every locale slot
// so the author always sees their own wording regardless of interface language.
function buildScene(text: string): LocalizedString {
  return Object.fromEntries(LOCALE_CODES.map((c) => [c, text])) as LocalizedString
}

async function submit() {
  nameError.value = ''
  sceneError.value = ''
  const trimmedName = name.value.trim()
  const trimmedScene = scene.value.trim()
  if (!isHangulName(trimmedName)) {
    nameError.value = t('settings.contexts.error_korean')
    return
  }
  if (!trimmedScene) {
    sceneError.value = t('settings.contexts.error_scene_required')
    return
  }
  const created = await store.addCustom(trimmedName, buildScene(trimmedScene))
  if (!created) {
    nameError.value = t('settings.contexts.error_duplicate')
    return
  }
  name.value = ''
  scene.value = ''
  emit('created', created.name)
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <Field :label="t('settings.contexts.name_label')" html-for="ctx-name" :error="nameError">
      <Input
        id="ctx-name"
        v-model="name"
        :placeholder="t('settings.contexts.name_placeholder')"
        :error="!!nameError"
      />
    </Field>
    <Field :label="t('settings.contexts.scene_label')" html-for="ctx-scene" :error="sceneError">
      <Input
        id="ctx-scene"
        v-model="scene"
        :placeholder="t('settings.contexts.scene_placeholder')"
        :error="!!sceneError"
      />
    </Field>
    <Button type="submit" size="sm">{{ t('settings.contexts.add') }}</Button>
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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd munbeop && pnpm test -- tests/components/settings/ContextAddForm.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/components/settings/ContextAddForm.vue tests/components/settings/ContextAddForm.test.ts
git commit -m "feat(settings): add ContextAddForm for creating custom contexts"
```

---

### Task 7: `ContextManager.vue`

**Files:**
- Create: `munbeop/app/components/settings/ContextManager.vue`
- Test: `munbeop/tests/components/settings/ContextManager.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/settings/ContextManager.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import ContextManager from '~/components/settings/ContextManager.vue'
import { useContextsStore } from '~/stores/contexts'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountManager() {
  return mount(ContextManager, { attachTo: document.body })
}

describe('ContextManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  it('renders a row with a Toggle for every context', () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    expect(wrapper.findAll('.ctx-row')).toHaveLength(store.all.length) // 8 built-ins
    expect(wrapper.findAll('[role="switch"]').length).toBe(store.all.length)
  })

  it('disables the active toggles once only the minimum remain active', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    const ids = store.all.map((c) => c.id)
    for (const id of ids.slice(0, 5)) await store.toggleActive(id) // 8 → 3 active
    await nextTick()
    // The 3 still-active contexts (ids[5..7]) must have disabled switches.
    const switches = wrapper.findAll('[role="switch"]')
    const checkedDisabled = switches.filter(
      (s) => s.attributes('aria-checked') === 'true' && s.attributes('disabled') !== undefined,
    )
    expect(checkedDisabled.length).toBe(3)
    expect(wrapper.text()).toContain('settings.contexts.min_active_hint')
  })

  it('shows a delete affordance only for custom contexts', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    expect(wrapper.findAll('.ctx-row__delete')).toHaveLength(0)
    await store.addCustom('우리집', store.all[0]!.scene) // reuse a valid LocalizedString
    await nextTick()
    expect(wrapper.findAll('.ctx-row__delete')).toHaveLength(1)
  })

  it('opens the confirm modal when a custom delete is clicked', async () => {
    const wrapper = mountManager()
    const store = useContextsStore()
    await store.addCustom('우리집', store.all[0]!.scene)
    await nextTick()
    await wrapper.get('.ctx-row__delete').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.modal-overlay')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd munbeop && pnpm test -- tests/components/settings/ContextManager.test.ts`
Expected: FAIL — component file does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/settings/ContextManager.vue`:

```vue
<script setup lang="ts">
import type { Context } from '~/lib/domain'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'
import { useToast } from '~/composables/useToast'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import ContextAddForm from '~/components/settings/ContextAddForm.vue'

const { t } = useI18n()
const { tl } = useLocalized()
const { success } = useToast()
const store = useContextsStore()

const CATEGORIES = ['formalidad', 'situacional', 'custom'] as const
type Category = (typeof CATEGORIES)[number]

function group(cat: Category): Context[] {
  return store.all.filter((c) => c.category === cat)
}
function isActive(id: string): boolean {
  return !store.inactiveIds.includes(id)
}
// Active contexts lock once we're at the floor; inactive ones can always
// be switched back on.
function toggleLocked(id: string): boolean {
  return isActive(id) && store.active.length <= MIN_ACTIVE_CONTEXTS
}
async function onToggle(id: string) {
  await store.toggleActive(id)
}

const pendingDelete = ref<Context | null>(null)
function askDelete(ctx: Context) {
  pendingDelete.value = ctx
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete() {
  const ctx = pendingDelete.value
  if (!ctx) return
  const ok = await store.removeCustom(ctx.id)
  pendingDelete.value = null
  if (ok) success(t('settings.contexts.deleted'))
}

function onCreated() {
  success(t('settings.contexts.created'))
}
</script>

<template>
  <section class="ctx-mgr" :aria-label="t('settings.contexts.title')">
    <BilingualTitle ko="연습 상황" :latin="t('settings.contexts.title')" level="h2" />
    <p class="ctx-mgr__subtitle">{{ t('settings.contexts.subtitle') }}</p>
    <p class="ctx-mgr__count">{{ t('settings.contexts.active_count', { count: store.active.length }) }}</p>

    <template v-for="cat in CATEGORIES" :key="cat">
      <div v-if="group(cat).length" class="ctx-mgr__group">
        <h3 class="ctx-mgr__group-title">{{ t(`settings.contexts.category.${cat}`) }}</h3>
        <ul class="ctx-mgr__list">
          <li v-for="ctx in group(cat)" :key="ctx.id" class="ctx-row">
            <div class="ctx-row__text">
              <span class="ctx-row__name">{{ ctx.name }}</span>
              <span class="ctx-row__scene">{{ tl(ctx.scene) }}</span>
            </div>
            <div class="ctx-row__actions">
              <button
                v-if="!ctx.builtin"
                type="button"
                class="ctx-row__delete"
                :aria-label="t('settings.contexts.delete')"
                @click="askDelete(ctx)"
              >
                ✕
              </button>
              <Toggle
                :model-value="isActive(ctx.id)"
                :disabled="toggleLocked(ctx.id)"
                :label="ctx.name"
                @update:model-value="onToggle(ctx.id)"
              />
            </div>
          </li>
        </ul>
      </div>
    </template>

    <p v-if="store.active.length <= MIN_ACTIVE_CONTEXTS" class="ctx-mgr__hint">
      {{ t('settings.contexts.min_active_hint') }}
    </p>

    <ContextAddForm class="ctx-mgr__add" @created="onCreated" />

    <Modal
      :open="pendingDelete !== null"
      :close-label="t('settings.contexts.cancel')"
      :title="t('settings.contexts.delete_confirm_title')"
      @close="cancelDelete"
    >
      <h2 class="ctx-del__title">{{ t('settings.contexts.delete_confirm_title') }}</h2>
      <p class="ctx-del__body">
        {{ t('settings.contexts.delete_confirm_body', { name: pendingDelete?.name }) }}
      </p>
      <div class="ctx-del__actions">
        <Button variant="secondary" size="sm" @click="cancelDelete">
          {{ t('settings.contexts.cancel') }}
        </Button>
        <Button variant="danger" size="sm" @click="confirmDelete">
          {{ t('settings.contexts.delete') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.ctx-mgr {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ctx-mgr__subtitle,
.ctx-mgr__count {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
}
.ctx-mgr__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.ctx-mgr__group-title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}
.ctx-mgr__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ctx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.ctx-row__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ctx-row__name {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--text);
}
.ctx-row__scene {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
}
.ctx-row__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.ctx-row__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-soft);
  font-size: 14px;
  padding: 4px;
  line-height: 1;
}
.ctx-row__delete:hover {
  color: var(--danger);
}
.ctx-row__delete:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.ctx-mgr__hint {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--danger);
  margin: 0;
}
.ctx-del__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 13px;
  margin: 0 0 12px;
  color: var(--ink);
}
.ctx-del__body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  margin: 0 0 20px;
  color: var(--ink);
}
.ctx-del__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd munbeop && pnpm test -- tests/components/settings/ContextManager.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd munbeop && git add app/components/settings/ContextManager.vue tests/components/settings/ContextManager.test.ts
git commit -m "feat(settings): add ContextManager (toggle/add/delete practice contexts)"
```

---

### Task 8: Mount in `settings.vue` + full verification

**Files:**
- Modify: `munbeop/app/pages/settings.vue`

- [ ] **Step 1: Add the component to the page**

In `munbeop/app/pages/settings.vue`, add the import and render it as a new card after the dark-mode card (before the `empty` placeholder):

Script — add the import:
```ts
import ContextManager from '~/components/settings/ContextManager.vue'
```

Template — insert before `<div class="empty">…`:
```vue
    <div class="card card--wide">
      <ContextManager />
    </div>
```

Style — add a wider card variant so the rows breathe (the existing `.card` is capped at 320px):
```css
.card--wide {
  max-width: 560px;
}
```

- [ ] **Step 2: Run the full suite + typecheck + lint**

Run: `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS. (This is the pre-commit gate from the project's verify→commit→verify→push workflow.)

- [ ] **Step 3: Verify in the browser (preview tools)**

Start the dev server and confirm:
- Settings shows the "Practice contexts" card with grouped rows.
- Toggling a context off updates the active count; at 3 active, the active toggles disable and the min hint appears.
- Adding a custom context with a non-Korean name shows the Korean error; a valid one appears under "Your contexts".
- Deleting a custom context opens the confirm modal and removes it on confirm.
- Take a screenshot (light + dark) as proof.

- [ ] **Step 4: Commit**

```bash
cd munbeop && git add app/pages/settings.vue
git commit -m "feat(settings): mount ContextManager on the settings page"
```

- [ ] **Step 5 (optional): push**

Only when the user asks. Then re-run `pnpm test && pnpm typecheck` post-merge if applicable (verify→commit→verify→push).

---

## Self-review against the spec

- **Scope coverage:** toggle (Task 2), add (Task 6), delete (Task 3 + 7), min-active guard in store+UI (Tasks 2/3/7), Korean validation (Tasks 1/6), grouping by category (Task 7), i18n 8-locale parity (Task 5), settings integration (Task 8). ✓ All spec sections map to a task.
- **Type consistency:** `toggleActive(): Promise<boolean>`, `removeCustom(): Promise<boolean>`, `addCustom(name, scene): Promise<Context | null>`, `isHangulName(string): boolean`, `MIN_ACTIVE_CONTEXTS` used identically in store + `usePractice` + both components. `LocalizedString` built via `LOCALE_CODES` in both the form and the store test. ✓
- **No placeholders:** every step has real code/commands. ✓
- **Known test caveats baked in:** `useNuxtApp` stub for store-touching tests (Noop adapter path), key-echo `t()` assertions, `useToast` imported explicitly (standalone composable), `BilingualTitle` has no `id` prop so the section uses `aria-label`. ✓
