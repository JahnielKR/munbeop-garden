# Sidebar account quick-menu (Tanda 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar footer (email/sign-out widget + locale switcher) with a profile-avatar quick-menu (sign out · language · light/dark · open settings), visible in both the expanded and collapsed sidebar.

**Architecture:** A new `AccountMenu.vue` (initials avatar button + click-/Escape-dismissible popover) reusing `LocaleSwitcher`, a dark-mode `Toggle` (via `useSettings`), a `/settings` link, and `useAuth().signOutAndExit`. `AppSidebar` swaps its footer to `<AccountMenu />` and stops hiding it when collapsed.

**Tech Stack:** Nuxt 4 (SPA), Vue 3, @nuxtjs/i18n, Vitest + @vue/test-utils + happy-dom.

**Spec:** [../specs/2026-06-15-account-menu-design.md](../specs/2026-06-15-account-menu-design.md)

**Conventions for every commit:**
- Run `pnpm` from `munbeop/`. Branch is `claude/settings-account-menu` (tracks origin/main — never bare-push).
- End every commit message with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: i18n `settings.menu.account` (8 locales) + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/settings/i18n-menu-keys.test.ts` (create)

- [ ] **Step 1: Write the failing parity test** — create `munbeop/tests/unit/settings/i18n-menu-keys.test.ts`:

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

function dig(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj)
}

describe('settings.menu.* i18n parity', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} defines settings.menu.account as a non-empty string`, () => {
      const value = dig(msgs, 'settings.menu.account')
      expect(typeof value, `${code} settings.menu.account`).toBe('string')
      expect((value as string).length, `${code}`).toBeGreaterThan(0)
    })
  }
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-menu-keys.test.ts` → FAIL (key undefined).

- [ ] **Step 3: Add the key.** In each locale, add a `menu` sub-object INSIDE the existing `settings` object (add a comma after the last existing sub-object, then append). Use exactly:

- **en.json:** `"menu": { "account": "Account menu" }`
- **es.json:** `"menu": { "account": "Menú de cuenta" }`
- **fr.json:** `"menu": { "account": "Menu du compte" }`
- **pt-BR.json:** `"menu": { "account": "Menu da conta" }`
- **th.json:** `"menu": { "account": "เมนูบัญชี" }`
- **id.json:** `"menu": { "account": "Menu akun" }`
- **vi.json:** `"menu": { "account": "Menu tài khoản" }`
- **ja.json:** `"menu": { "account": "アカウントメニュー" }`

- [ ] **Step 4: Run the parity test + a full unit sweep** — `cd munbeop && pnpm test -- tests/unit/settings/i18n-menu-keys.test.ts` → PASS (8). Then `cd munbeop && pnpm test -- tests/unit` → 0 failures (a JSON error = a comma slip; fix and re-run).

- [ ] **Step 5: Commit**

```
cd munbeop && git add i18n/locales tests/unit/settings/i18n-menu-keys.test.ts
git commit -m "i18n(settings): add account-menu aria-label across 8 locales"
```

---

### Task 2: `AccountMenu.vue`

**Files:**
- Create: `munbeop/app/components/layout/AccountMenu.vue`
- Test: `munbeop/tests/components/layout/AccountMenu.test.ts` (create)

- [ ] **Step 1: Write the failing test** — create `munbeop/tests/components/layout/AccountMenu.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import AccountMenu from '~/components/layout/AccountMenu.vue'
import { useAuthStore } from '~/stores/auth'

const signOutAndExit = vi.fn(async () => ({ error: null }))
vi.stubGlobal('useAuth', () => ({ signOutAndExit }))
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function mountMenu() {
  return mount(AccountMenu, {
    attachTo: document.body,
    global: { stubs: { LocaleSwitcher: true } },
  })
}

describe('AccountMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signOutAndExit.mockClear()
    document.body.innerHTML = ''
    useAuthStore().user = { email: 'sol@example.com' } as never
  })

  it('shows the email initial on the avatar', () => {
    const wrapper = mountMenu()
    expect(wrapper.get('.acct__avatar').text()).toBe('S')
  })

  it('opens the popover with email, a settings link, and sign out', async () => {
    const wrapper = mountMenu()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('sol@example.com')
    expect(wrapper.find('a[href="/settings"]').exists()).toBe(true)
    expect(wrapper.find('.acct__signout').exists()).toBe(true)
  })

  it('signs out when sign-out is clicked', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    await wrapper.get('.acct__signout').trigger('click')
    expect(signOutAndExit).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking outside', async () => {
    const wrapper = mountMenu()
    await wrapper.get('.acct__avatar').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test, verify FAIL** — `cd munbeop && pnpm test -- tests/components/layout/AccountMenu.test.ts` → FAIL (component missing).

- [ ] **Step 3: Write the component** — create `munbeop/app/components/layout/AccountMenu.vue`:

```vue
<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import { NuxtLink } from '#components'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'

const { t } = useI18n()
const { theme } = useTheme()
const authStore = useAuthStore()
const settings = useSettingsStore()
const { signOutAndExit } = useAuth()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const email = computed(() => authStore.user?.email ?? '')
const initial = computed(() => (email.value.trim()[0] ?? '?').toUpperCase())
const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

function close() {
  open.value = false
}
async function onSignOut() {
  await signOutAndExit()
}
function onDocClick(e: MouseEvent) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) close()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="acct">
    <button
      type="button"
      class="acct__avatar"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="email || t('settings.menu.account')"
      @click.stop="open = !open"
    >
      {{ initial }}
    </button>

    <div v-if="open" class="acct__menu" role="menu">
      <p class="acct__email">{{ email }}</p>
      <div class="acct__row">
        <Field :label="t('settings.dark_mode')" html-for="acct-dark" orientation="horizontal">
          <Toggle id="acct-dark" v-model="isDark" :label="t('settings.dark_mode')" />
        </Field>
      </div>
      <div class="acct__row">
        <LocaleSwitcher />
      </div>
      <NuxtLink to="/settings" class="acct__item" role="menuitem" @click="close">
        {{ t('nav.settings') }}
      </NuxtLink>
      <button type="button" class="acct__item acct__signout" role="menuitem" @click="onSignOut">
        {{ t('auth.sign_out') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.acct {
  position: relative;
  display: flex;
  justify-content: center;
}
.acct__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  cursor: pointer;
  box-shadow: var(--shadow-button);
}
.acct__avatar:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.acct__menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 220px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-color);
  padding: 14px;
}
.acct__email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-soft);
  word-break: break-all;
  margin: 0;
}
.acct__row {
  display: flex;
  flex-direction: column;
}
.acct__item {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  text-align: left;
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  padding: 10px;
  cursor: pointer;
  text-decoration: none;
}
.acct__item:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
.acct__item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.acct__signout {
  color: var(--danger);
}
:lang(th) .acct__item,
:lang(vi) .acct__item,
:lang(ja) .acct__item {
  font-size: 11px;
}
</style>
```

- [ ] **Step 4: Run test, verify PASS** — `cd munbeop && pnpm test -- tests/components/layout/AccountMenu.test.ts` → PASS (4). Then `cd munbeop && pnpm typecheck` → clean.

- [ ] **Step 5: Commit**

```
cd munbeop && git add app/components/layout/AccountMenu.vue tests/components/layout/AccountMenu.test.ts
git commit -m "feat(account): add AccountMenu avatar + quick popover"
```

---

### Task 3: Swap the sidebar footer to `AccountMenu` + verification

**Files:**
- Modify: `munbeop/app/components/layout/AppSidebar.vue`

- [ ] **Step 1: Edit the sidebar.**
  (a) In `<script setup>`, replace the two imports:
  ```ts
  import AccountWidget from './AccountWidget.vue'
  import LocaleSwitcher from './LocaleSwitcher.vue'
  ```
  with:
  ```ts
  import AccountMenu from './AccountMenu.vue'
  ```
  (b) In the template, replace the footer's children:
  ```vue
    <div class="sidebar__footer">
      <AccountWidget />
      <LocaleSwitcher />
    </div>
  ```
  with:
  ```vue
    <div class="sidebar__footer">
      <AccountMenu />
    </div>
  ```
  (c) In `<style scoped>`, in the `.sidebar__footer` rule, REMOVE the `min-width: 186px;` line (and its comment is now stale — leave or trim). Then REMOVE the entire collapsed-hide rule so the avatar shows when collapsed:
  ```css
  .sidebar--collapsed .sidebar__footer {
    display: none;
  }
  ```
  (delete that whole block, including its preceding comment about the footer being textual content that doesn't fit).

- [ ] **Step 2: Full verification gate** — `cd munbeop && pnpm test && pnpm typecheck && pnpm lint`
Expected: all PASS, lint **0 errors**. Report totals. If lint flags the now-unused `AccountWidget`/`LocaleSwitcher` imports (you must have removed them) or any other unused import, fix and re-run. If anything else fails, STOP and report.

- [ ] **Step 3: Commit**

```
cd munbeop && git add app/components/layout/AppSidebar.vue
git commit -m "feat(account): use AccountMenu in the sidebar (visible when collapsed)"
```

---

## Self-review against the spec

- **Spec coverage:** one new i18n key + parity (Task 1) · `AccountMenu` avatar + popover (email, theme toggle, LocaleSwitcher, settings link, sign out) with click-outside/Escape dismissal (Task 2) · sidebar swap + collapsed-visible (Task 3). ✓
- **Type consistency:** `open`/`rootRef` refs; `isDark` get/set (theme ↔ `useSettings.setTheme`); `email`/`initial` computeds; `signOutAndExit` from `useAuth`; selectors `.acct__avatar`/`.acct__signout`/`[role="menu"]`/`a[href="/settings"]` match between component and test. ✓
- **No placeholders:** every step has real code/commands. ✓
- **DRY / reuse:** LocaleSwitcher reused; link label reuses `nav.settings`, sign-out reuses `auth.sign_out`, theme reuses `settings.dark_mode`, language label reuses `common.language` — only `settings.menu.account` is new. `AccountWidget` retained for the settings Account tab (only the sidebar drops it). ✓
- **Test caveats baked in:** AccountMenu test uses `setActivePinia` + stubs `useAuth`/`useNuxtApp`, sets `authStore.user`, stubs `LocaleSwitcher` (already tested), and drives click-outside via a bubbling `document.body` click; the avatar's `@click.stop` prevents open-then-self-close. AppSidebar has no dedicated test (verified by typecheck + gate). ✓
