# Delete account (Tanda 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in user permanently delete their account (typed-`DELETE` confirmation) via the project's first Supabase Edge Function, surfaced as a "Danger zone" in the settings Account tab.

**Architecture:** A Deno Edge Function (`delete-account`) verifies the caller's JWT then service-role-deletes the auth user (FK cascade wipes the rest). `useAuth().deleteAccount()` invokes it and reuses `signOutAndExit()`. A `DangerZone.vue` component drives a confirm modal. The function is written here and **deployed by the user**.

**Tech Stack:** Nuxt 4 (SPA), Vue 3, Supabase (Edge Functions / Deno), @nuxtjs/i18n, Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-15-delete-account-design.md](../specs/2026-06-15-delete-account-design.md)

**Conventions for every commit:**
- Run `pnpm` from `munbeop/`. Branch is `claude/settings-delete-account` (tracks origin/main — never bare-push).
- End every commit message with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: `delete-account` Edge Function + eslint ignore + smoke test

**Files:**
- Create: `munbeop/supabase/functions/delete-account/index.ts`
- Modify: `munbeop/eslint.config.mjs` (add the function dir to `ignores`)
- Test: `munbeop/tests/unit/settings/edge-delete-account.test.ts` (create)

- [ ] **Step 1: Write the failing smoke test** — create `munbeop/tests/unit/settings/edge-delete-account.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = readFileSync(
  fileURLToPath(new URL('../../../supabase/functions/delete-account/index.ts', import.meta.url)),
  'utf8',
)

describe('delete-account edge function', () => {
  it('verifies the caller JWT, uses the service role, and deletes the user', () => {
    expect(src).toMatch(/auth\.getUser\(\)/)
    expect(src).toMatch(/SUPABASE_SERVICE_ROLE_KEY/)
    expect(src).toMatch(/auth\.admin\.deleteUser/)
  })
  it('handles CORS preflight', () => {
    expect(src).toMatch(/OPTIONS/)
    expect(src).toMatch(/Access-Control-Allow-Origin/)
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/edge-delete-account.test.ts` → FAIL (ENOENT).

- [ ] **Step 3: Write the function** — create `munbeop/supabase/functions/delete-account/index.ts`:

```ts
// Supabase Edge Function (Deno) — permanently delete the calling user's
// account. Verifies the caller's JWT, then uses the service-role key to
// delete the auth.users row; ON DELETE CASCADE wipes the user_* tables.
// Deploy: `supabase functions deploy delete-account` (SUPABASE_URL,
// SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are auto-injected).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'Invalid session' }, 401)

    const admin = createClient(url, serviceKey)
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id)
    if (delErr) return json({ error: delErr.message }, 500)

    return json({ ok: true }, 200)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
```

- [ ] **Step 4: Exclude the Deno function from eslint** — in `munbeop/eslint.config.mjs`, add `'supabase/functions/**'` to the `ignores` array:

```js
  ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**', 'app/i18n/locales/**', 'supabase/functions/**'],
```

- [ ] **Step 5: Run test (PASS) + confirm gates clean** — `cd munbeop && pnpm test -- tests/unit/settings/edge-delete-account.test.ts` → PASS (2). Then `cd munbeop && pnpm lint` → 0 errors (the Deno file is now ignored). `cd munbeop && pnpm typecheck` → clean (supabase/ is outside the Nuxt tsconfigs).

- [ ] **Step 6: Commit**

```
cd munbeop && git add supabase/functions/delete-account/index.ts eslint.config.mjs tests/unit/settings/edge-delete-account.test.ts
git commit -m "feat(account): add delete-account edge function (service-role user deletion)"
```

---

### Task 2: `useAuth().deleteAccount()`

**Files:**
- Modify: `munbeop/app/composables/useAuth.ts`
- Test: `munbeop/tests/composables/useAuth.deleteAccount.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/composables/useAuth.deleteAccount.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'

const invoke = vi.fn()
const signOut = vi.fn(async () => ({ error: null }))
const push = vi.fn(async () => {})
vi.stubGlobal('useNuxtApp', () => ({ $supabase: { functions: { invoke }, auth: { signOut } } }))
vi.stubGlobal('useRouter', () => ({ push }))
vi.stubGlobal('useAuthStore', () => ({ setSession: vi.fn(), user: { id: 'u' } }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ hydrate: vi.fn() }) }))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ setSession: vi.fn(), user: { id: 'u' } }) }))

describe('useAuth().deleteAccount', () => {
  beforeEach(() => {
    invoke.mockReset()
    signOut.mockReset()
    signOut.mockResolvedValue({ error: null })
    push.mockReset()
  })

  it('invokes the function then signs out and leaves on success', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })
    const result = await useAuth().deleteAccount()
    expect(invoke).toHaveBeenCalledWith('delete-account')
    expect(signOut).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/welcome')
    expect(result.error).toBe(null)
  })

  it('returns the error and does NOT sign out when the function fails', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const result = await useAuth().deleteAccount()
    expect(result.error?.message).toBe('boom')
    expect(signOut).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/composables/useAuth.deleteAccount.test.ts` → FAIL (`deleteAccount` is not a function).

- [ ] **Step 3: Add the method** — in `munbeop/app/composables/useAuth.ts`, add `deleteAccount` (e.g. after `signOutAndExit`):

```ts
  /**
   * Permanently delete the account via the delete-account edge function
   * (service-role deletes the auth user; ON DELETE CASCADE wipes user data).
   * On success, sign out + leave to /welcome via the existing flow.
   */
  async function deleteAccount() {
    const { error } = await $supabase.functions.invoke('delete-account')
    if (error) return { error }
    return signOutAndExit()
  }
```
and add `deleteAccount` to the returned object:
```ts
  return { init, signUp, signIn, signInMagicLink, signInWithProvider, signOutAndExit, hydrateUserStores, deleteAccount }
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/composables/useAuth.deleteAccount.test.ts` → PASS (2). Then `cd munbeop && pnpm typecheck` → clean.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/composables/useAuth.ts tests/composables/useAuth.deleteAccount.test.ts
git commit -m "feat(account): add useAuth().deleteAccount() invoking the edge function"
```

---

### Task 3: i18n `settings.account.danger.*` (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/settings/i18n-danger-keys.test.ts` (create)

- [ ] **Step 1: Write the failing parity test** — create `munbeop/tests/unit/settings/i18n-danger-keys.test.ts`:

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
  'title', 'description', 'button', 'modal_title', 'modal_body',
  'confirm_label', 'confirm_button', 'cancel', 'error',
] as const

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.account.danger.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines every danger key as a non-empty string`, () => {
      for (const k of KEYS) {
        const value = dig(msgs, `settings.account.danger.${k}`)
        expect(typeof value, `${code} ${k}`).toBe('string')
        expect((value as string).length, `${code} ${k}`).toBeGreaterThan(0)
      }
    })
  }
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-danger-keys.test.ts` → FAIL (keys undefined).

- [ ] **Step 3: Add the keys.** In each locale, add an `account` sub-object (with a nested `danger`) INSIDE the existing `settings` object (add a comma after the last existing sub-object, then append). Use exactly:

**en.json:**
```json
    "account": { "danger": { "title": "Danger zone", "description": "Permanently delete your account and all your data. This can't be undone.", "button": "Delete account", "modal_title": "Delete your account?", "modal_body": "This permanently deletes your account, your sentences, progress, decks, and custom grammar. This cannot be undone.", "confirm_label": "Type DELETE to confirm", "confirm_button": "Delete forever", "cancel": "Cancel", "error": "Couldn't delete your account. Please try again." } }
```
**es.json:**
```json
    "account": { "danger": { "title": "Zona de peligro", "description": "Borra permanentemente tu cuenta y todos tus datos. No se puede deshacer.", "button": "Borrar cuenta", "modal_title": "¿Borrar tu cuenta?", "modal_body": "Esto borra permanentemente tu cuenta, tus frases, progreso, mazos y gramática personalizada. No se puede deshacer.", "confirm_label": "Escribe DELETE para confirmar", "confirm_button": "Borrar para siempre", "cancel": "Cancelar", "error": "No se pudo borrar tu cuenta. Inténtalo de nuevo." } }
```
**fr.json:**
```json
    "account": { "danger": { "title": "Zone de danger", "description": "Supprime définitivement ton compte et toutes tes données. Action irréversible.", "button": "Supprimer le compte", "modal_title": "Supprimer ton compte ?", "modal_body": "Ceci supprime définitivement ton compte, tes phrases, ta progression, tes paquets et ta grammaire personnalisée. Action irréversible.", "confirm_label": "Tape DELETE pour confirmer", "confirm_button": "Supprimer définitivement", "cancel": "Annuler", "error": "Impossible de supprimer ton compte. Réessaie." } }
```
**pt-BR.json:**
```json
    "account": { "danger": { "title": "Zona de perigo", "description": "Exclui permanentemente sua conta e todos os seus dados. Não dá para desfazer.", "button": "Excluir conta", "modal_title": "Excluir sua conta?", "modal_body": "Isto exclui permanentemente sua conta, suas frases, progresso, baralhos e gramática personalizada. Não pode ser desfeito.", "confirm_label": "Digite DELETE para confirmar", "confirm_button": "Excluir para sempre", "cancel": "Cancelar", "error": "Não foi possível excluir sua conta. Tente novamente." } }
```
**th.json:**
```json
    "account": { "danger": { "title": "โซนอันตราย", "description": "ลบบัญชีและข้อมูลทั้งหมดของคุณอย่างถาวร ไม่สามารถย้อนกลับได้", "button": "ลบบัญชี", "modal_title": "ลบบัญชีของคุณ?", "modal_body": "การกระทำนี้จะลบบัญชี ประโยค ความคืบหน้า เด็ค และไวยากรณ์ที่คุณสร้างอย่างถาวร ไม่สามารถย้อนกลับได้", "confirm_label": "พิมพ์ DELETE เพื่อยืนยัน", "confirm_button": "ลบถาวร", "cancel": "ยกเลิก", "error": "ลบบัญชีไม่สำเร็จ ลองอีกครั้ง" } }
```
**id.json:**
```json
    "account": { "danger": { "title": "Zona berbahaya", "description": "Hapus akun dan semua datamu secara permanen. Tidak bisa dibatalkan.", "button": "Hapus akun", "modal_title": "Hapus akunmu?", "modal_body": "Ini menghapus permanen akunmu, kalimatmu, progres, dek, dan tata bahasa kustommu. Tidak bisa dibatalkan.", "confirm_label": "Ketik DELETE untuk konfirmasi", "confirm_button": "Hapus selamanya", "cancel": "Batal", "error": "Gagal menghapus akunmu. Coba lagi." } }
```
**vi.json:**
```json
    "account": { "danger": { "title": "Vùng nguy hiểm", "description": "Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Không thể hoàn tác.", "button": "Xóa tài khoản", "modal_title": "Xóa tài khoản của bạn?", "modal_body": "Thao tác này xóa vĩnh viễn tài khoản, câu, tiến độ, bộ thẻ và ngữ pháp tùy chỉnh của bạn. Không thể hoàn tác.", "confirm_label": "Nhập DELETE để xác nhận", "confirm_button": "Xóa vĩnh viễn", "cancel": "Hủy", "error": "Không thể xóa tài khoản của bạn. Thử lại." } }
```
**ja.json:**
```json
    "account": { "danger": { "title": "危険な操作", "description": "アカウントとすべてのデータを完全に削除します。元に戻せません。", "button": "アカウントを削除", "modal_title": "アカウントを削除しますか？", "modal_body": "アカウント、文章、進捗、デッキ、カスタム文法を完全に削除します。元に戻せません。", "confirm_label": "確認のため DELETE と入力", "confirm_button": "完全に削除", "cancel": "キャンセル", "error": "アカウントを削除できませんでした。もう一度お試しください。" } }
```
> The typed word stays literal `DELETE` inside `confirm_label` for every locale.

- [ ] **Step 4: Run the parity test + a full unit sweep** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-danger-keys.test.ts` → PASS (8). Then `cd munbeop && pnpm test -- tests/unit` → 0 failures (a JSON error = a comma slip; fix and re-run).

- [ ] **Step 5: Commit**

```
cd munbeop && git add i18n/locales tests/unit/settings/i18n-danger-keys.test.ts
git commit -m "i18n(account): add delete-account danger-zone strings across 8 locales"
```

---

### Task 4: `DangerZone.vue` component

**Files:**
- Create: `munbeop/app/components/settings/DangerZone.vue`
- Test: `munbeop/tests/components/settings/DangerZone.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/components/settings/DangerZone.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DangerZone from '~/components/settings/DangerZone.vue'

const deleteAccount = vi.fn()
vi.stubGlobal('useAuth', () => ({ deleteAccount }))

function mountDanger() {
  return mount(DangerZone, { attachTo: document.body, global: { stubs: { Teleport: false } } })
}

describe('DangerZone', () => {
  beforeEach(() => {
    deleteAccount.mockReset()
    deleteAccount.mockResolvedValue({ error: null })
    document.body.innerHTML = ''
  })

  it('keeps the confirm button disabled until exactly DELETE is typed', async () => {
    const wrapper = mountDanger()
    await wrapper.get('.danger__open').trigger('click')
    await nextTick()
    const confirmBtn = () => document.body.querySelector('.danger-confirm') as HTMLButtonElement
    expect(confirmBtn().disabled).toBe(true)

    const input = document.body.querySelector('#del-confirm') as HTMLInputElement
    input.value = 'delete'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(confirmBtn().disabled).toBe(true)

    input.value = 'DELETE'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(confirmBtn().disabled).toBe(false)
  })

  it('calls deleteAccount when confirmed with DELETE', async () => {
    const wrapper = mountDanger()
    await wrapper.get('.danger__open').trigger('click')
    await nextTick()
    const input = document.body.querySelector('#del-confirm') as HTMLInputElement
    input.value = 'DELETE'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    ;(document.body.querySelector('.danger-confirm') as HTMLButtonElement).click()
    await nextTick()
    expect(deleteAccount).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/components/settings/DangerZone.test.ts` → FAIL (component missing).

- [ ] **Step 3: Write the component** — create `munbeop/app/components/settings/DangerZone.vue`:

```vue
<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import { useToast } from '~/composables/useToast'

const { t } = useI18n()
const { deleteAccount } = useAuth()
const toast = useToast()

const open = ref(false)
const confirmText = ref('')
const busy = ref(false)
const canDelete = computed(() => confirmText.value === 'DELETE')

function openModal() {
  confirmText.value = ''
  open.value = true
}
function close() {
  open.value = false
}
async function confirm() {
  if (!canDelete.value || busy.value) return
  busy.value = true
  const { error } = await deleteAccount()
  busy.value = false
  if (error) {
    toast.error(t('settings.account.danger.error'))
    open.value = false
  }
  // success navigates away via signOutAndExit — nothing else to do
}
</script>

<template>
  <section class="danger" :aria-label="t('settings.account.danger.title')">
    <h3 class="danger__title">{{ t('settings.account.danger.title') }}</h3>
    <p class="danger__desc">{{ t('settings.account.danger.description') }}</p>
    <Button class="danger__open" variant="danger" size="sm" @click="openModal">
      {{ t('settings.account.danger.button') }}
    </Button>

    <Modal
      :open="open"
      :close-label="t('settings.account.danger.cancel')"
      :title="t('settings.account.danger.modal_title')"
      @close="close"
    >
      <h2 class="danger__modal-title">{{ t('settings.account.danger.modal_title') }}</h2>
      <p class="danger__modal-body">{{ t('settings.account.danger.modal_body') }}</p>
      <Field :label="t('settings.account.danger.confirm_label')" html-for="del-confirm">
        <Input id="del-confirm" v-model="confirmText" placeholder="DELETE" />
      </Field>
      <div class="danger__actions">
        <Button variant="secondary" size="sm" @click="close">
          {{ t('settings.account.danger.cancel') }}
        </Button>
        <Button
          class="danger-confirm"
          variant="danger"
          size="sm"
          :disabled="!canDelete || busy"
          :loading="busy"
          @click="confirm"
        >
          {{ t('settings.account.danger.confirm_button') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.danger {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  border: 2px solid var(--danger);
  padding: 16px;
  margin-top: 8px;
}
.danger__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--danger);
  margin: 0;
}
.danger__desc {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
}
.danger__modal-title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 13px;
  color: var(--ink);
  margin: 0 0 12px;
}
.danger__modal-body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 16px;
}
.danger__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/components/settings/DangerZone.test.ts` → PASS (2). Then `cd munbeop && pnpm typecheck` → clean.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/components/settings/DangerZone.vue tests/components/settings/DangerZone.test.ts
git commit -m "feat(account): add DangerZone delete-account confirm UI"
```

---

### Task 5: Mount `DangerZone` in the Account tab + full verification

**Files:**
- Modify: `munbeop/app/pages/settings.vue`

- [ ] **Step 1: Edit the page.** In `munbeop/app/pages/settings.vue`:
  - Add the import after the existing `AccountWidget` import:
    ```ts
    import DangerZone from '~/components/settings/DangerZone.vue'
    ```
  - In the Account panel (`<section ... v-show="active === 'account'">`), add `<DangerZone />` immediately after `<AccountWidget />`:
    ```vue
    <section
      v-show="active === 'account'"
      id="panel-account"
      role="tabpanel"
      aria-labelledby="tab-account"
      class="panel"
    >
      <AccountWidget />
      <DangerZone />
    </section>
    ```

- [ ] **Step 2: Full verification gate** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS, lint **0 errors** (confirms the `supabase/functions/**` ignore holds). Report totals. If anything fails, STOP and report.

- [ ] **Step 3: Commit**

```
cd munbeop && git add app/pages/settings.vue
git commit -m "feat(account): mount DangerZone in the settings Account tab"
```

---

## Deployment note (user action, not a code task)

The edge function is written but **not deployed**. To activate account deletion, run from `munbeop/`:
```
supabase functions deploy delete-account
```
against the Mungander project. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected into Edge Functions — no secrets to set. Until deployed, the "Delete account" confirm shows the error toast (no breakage).

---

## Self-review against the spec

- **Spec coverage:** edge function (service-role delete + JWT verify + CORS) + eslint ignore + smoke test (Task 1) · `useAuth().deleteAccount()` invoking it then `signOutAndExit` (Task 2) · 9 danger keys × 8 locales + parity (Task 3) · `DangerZone.vue` with typed-DELETE gate + confirm modal (Task 4) · mounted in the Account tab + full gate (Task 5). ✓
- **Type consistency:** `deleteAccount()` returns `{ error }` (matches the other useAuth actions + the test); `canDelete = confirmText === 'DELETE'`; i18n path `settings.account.danger.<key>` identical in the component, the parity test, and the locale files; `.danger__open` / `.danger-confirm` / `#del-confirm` selectors match between the component and its test. ✓
- **No placeholders:** every step has real code/commands. ✓
- **Gate safety:** Task 1 adds the `supabase/functions/**` eslint ignore in the SAME task as the Deno file, so lint never sees un-deployed Deno globals; Task 5 re-confirms 0 lint errors. The Deno function isn't executed by vitest (not under `tests/`) and isn't typechecked (supabase/ outside the Nuxt tsconfigs). ✓
- **Test caveats baked in:** `useAuth.deleteAccount` test mirrors the existing `signInWithProvider` test's stub/mocks (+ `useRouter`); `DangerZone` test stubs `useAuth` globally, drives the `Input` via a native `input` event, and queries the teleported modal in `document.body` with `Teleport: false`; the edge smoke test uses `// @vitest-environment node` for `fileURLToPath`. ✓
