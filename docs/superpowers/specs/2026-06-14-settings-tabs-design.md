# Settings tabs (Tanda 1) — design spec

_Date: 2026-06-14 · Part 1 of 3 of the settings-UX overhaul (tabs → delete account → sidebar quick-menu)_

## Problem

`settings.vue` is a single flat scroll of five mixed-concern cards (language, dark mode, contexts, data export, about) plus a leftover `empty.settings` placeholder. It worked at two controls; it reads poorly now and the audit roadmap adds more sections (Account, Audio, Notifications…). Flat doesn't scale.

## Goal

Reorganize settings into **horizontal tabbed sections** (option A, approved): a compact pixel-style tab bar with one panel visible at a time. Introduce a small reusable tablist component. Add an **Account** tab now (holding the signed-in email + sign-out, relocating that surface from the sidebar-only `AccountWidget`).

Non-goals (this part): delete account (Tanda 2), the sidebar avatar quick-menu (Tanda 3), Audio/Notifications tabs (future), URL-persisted active tab.

## Decisions (confirmed with user)

- Approach **A**: horizontal tabs, internal state (not nested routes).
- Language lives **inside Appearance** (a display preference), not its own tab.
- Add an **Account** tab now (email + sign-out moved into settings).
- (Order) This is Tanda 1 of 3 sequential PRs.

## Decisions (internal)

- **5 tabs:** Account · Appearance · Learning · Data · About.
- Tab labels are compact **latin text** (no icons in v1 — avoids coupling to the `Icon` component's set; icons are an easy later add). The app's bilingual identity stays via the page's `설정 / Settings` title and the panels' own bilingual headers (ContextManager → 연습 상황, AboutSection → 정보).
- `SettingsTabs.vue` owns **only the tablist** (the buttons + keyboard/ARIA). The page owns the panels and toggles them with `v-show`. Keeps the component small/reusable; the page controls content.
- Active tab = internal `ref`, defaults to `account` (first tab). URL `?tab=` persistence is a noted future add, not in v1.
- **Reuse `AccountWidget`** as-is in the Account panel (it already renders email + `auth.sign_out`, i18n'd). It stays mounted in the sidebar too for now; Tanda 3 replaces the sidebar instance with the avatar quick-menu. So sign-out is reachable from both places in the interim (no gap).
- The `empty.settings` placeholder is removed.

## Architecture

### Component — `app/components/settings/SettingsTabs.vue`

A controlled tablist (WAI-ARIA tabs pattern, automatic activation).

- Props: `tabs: { id: string; labelKey: string }[]`, `modelValue: string`. Emits `update:modelValue`.
- Renders `<div role="tablist" :aria-label="t('title.settings')">` containing one `<button role="tab">` per tab:
  - `id="tab-<id>"`, `aria-selected` = (id === modelValue), `aria-controls="panel-<id>"`, `tabindex` = 0 for the active tab else -1 (roving tabindex).
  - `@click` → emit the id. `@keydown` ArrowRight/ArrowLeft → move to next/prev (wrapping), emit the new id, and move focus to that button (template-ref array).
  - Active button styled pixel-active (accent background, chunky border) like the welcome "PARTY SELECT" menu; honors `prefers-reduced-motion` on any transition.
- The **panels live in `settings.vue`**, each `<section role="tabpanel" id="panel-<id>" aria-labelledby="tab-<id>" v-show="active === '<id>'">`.

### Page — `app/pages/settings.vue` (restructure)

```
<div class="page">
  <BilingualTitle ko="설정" :latin="t('title.settings')" />
  <SettingsTabs :tabs="TABS" v-model="active" />
  <section ... v-show="active==='account'">    <AccountWidget /> </section>
  <section ... v-show="active==='appearance'"> <LocaleSwitcher /> + dark-mode Field/Toggle </section>
  <section ... v-show="active==='learning'">   <ContextManager /> </section>
  <section ... v-show="active==='data'">        Data&privacy title + export Button </section>
  <section ... v-show="active==='about'">       <AboutSection /> </section>
</div>
```
`TABS = [{id:'account',labelKey:'settings.tabs.account'}, {id:'appearance',...'appearance'}, {id:'learning',...'learning'}, {id:'data',...'data'}, {id:'about',...'about'}]`; `const active = ref('account')`. The existing imports (LocaleSwitcher, Field, Toggle, ContextManager, AboutSection, Button, useDataExport, useSettingsStore, useTheme) are retained; add `SettingsTabs` + `AccountWidget`. The `isDark` computed and `exportData` action are unchanged. Drop the `empty.settings` line. Widen the page content (`max-width` ~640px) so the tab bar + panels breathe; keep the existing `.card`-style surfaces inside panels where appropriate.

### i18n (`i18n/locales/*.json`, all 8) — new keys

| key | English |
|---|---|
| `settings.tabs.account` | "Account" |
| `settings.tabs.appearance` | "Appearance" |
| `settings.tabs.learning` | "Learning" |
| `settings.tabs.data` | "Data" |
| `settings.tabs.about` | "About" |

Reuses existing `title.settings`, `auth.signed_in_as`, `auth.sign_out`, `settings.dark_mode`, `settings.data.*`, `welcome.menu.*`. 화이팅 / Korean untouched.

## Testing (TDD)

- **`tests/components/settings/SettingsTabs.test.ts`** — mount with a 3-tab fixture + `modelValue`:
  - renders one `role="tab"` per tab; the active has `aria-selected="true"`, others `"false"`; active has `tabindex="0"`, others `-1`.
  - clicking a tab emits `update:modelValue` with its id.
  - ArrowRight on the active tab emits the next id (and ArrowLeft wraps to the last from the first).
- **`tests/unit/settings/i18n-tabs-keys.test.ts`** — parity: all five `settings.tabs.*` keys are non-empty strings in all 8 locales (mirrors the existing settings parity tests).
- `settings.vue` itself isn't given a dedicated mount test (heavy multi-store page; its panels' contents are already covered by ContextManager/AboutSection/useDataExport tests). It's verified by `pnpm typecheck` + the full gate.
- Full suite + `pnpm typecheck` + `pnpm lint` green.

## Risks / notes

- **No god files:** one small tablist component; the page stays a thin composition of existing panels.
- **A11y:** roving tabindex + arrow-key activation + `aria-selected` + `aria-controls`/`aria-labelledby` across the component/page boundary (ids derived from tab id: `tab-<id>` / `panel-<id>`).
- **`v-show` vs `v-if`:** panels use `v-show` so all stores hydrate once and switching tabs is instant (no re-mount of ContextManager etc.). Inactive panels stay in the DOM (hidden) — fine for this size.
- **Interim duplication:** `AccountWidget` renders in both the Account tab and the sidebar until Tanda 3; intentional, avoids a sign-out gap.
- **Auth-gated preview:** as before, live browser verification isn't feasible in this worktree (no Supabase `.env`); proof is the test suite + typecheck.

## Out of scope → next tandas

- **Tanda 2:** delete account (Supabase Edge Function with service-role `auth.admin.deleteUser`, written here but **deployed by the user**; a "Danger zone" in the Account tab with a **type-"DELETE"** confirmation modal).
- **Tanda 3:** sidebar profile avatar (initials circle) → click → quick popover menu (sign out · language · light/dark · open settings), replacing the sidebar `AccountWidget`.
