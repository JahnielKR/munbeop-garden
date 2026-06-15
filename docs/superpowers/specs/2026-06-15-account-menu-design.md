# Sidebar account quick-menu (Tanda 3) — design spec

_Date: 2026-06-15 · Part 3 of 3 of the settings-UX overhaul (tabs → delete account → **sidebar quick-menu**)_

## Problem

The sidebar footer shows `AccountWidget` (email + sign-out) + a standalone `LocaleSwitcher`, and the whole footer is `display:none` in the collapsed 64px rail — so a collapsed-rail user can't sign out or switch language/theme without re-expanding. The user wants a profile avatar in the sidebar that opens a quick "mini settings" popover (like Claude's account menu): sign out, language, light/dark, open settings.

## Goal

Replace the sidebar footer (`AccountWidget` + `LocaleSwitcher`) with a single **profile avatar** (initials circle) that opens a popover menu, visible in both the expanded and collapsed sidebar.

Non-goals: uploaded avatar images, in-menu account editing, notifications.

## Decisions (confirmed with user)

- Menu set: email (read-only) + light/dark toggle + language (LocaleSwitcher) + a "Settings" link + sign out.
- The avatar is visible in BOTH sidebar states (collapsed included).

## Decisions (internal)

- New `AccountMenu.vue` (avatar trigger + popover). `AccountWidget` is NOT deleted — the settings Account tab still uses it; only the sidebar swaps to `AccountMenu`.
- Avatar = the email's first letter, uppercased (no uploaded images exist). Fallback `?`.
- Popover positioning v1: **absolute, opens upward** from the avatar, left-aligned and ~220px wide (extends rightward past the 64px rail when collapsed). If real rendering clips it inside an overflow ancestor, upgrade to Teleport+fixed as a follow-up (can't verify in-browser here — auth-gated, no `.env`).
- Reuse `nav.settings` for the "Settings" link label and existing `auth.sign_out` / `common.language` / `settings.dark_mode`. Only one new key.
- Theme toggle routes through `useSettings().setTheme` (account-synced, like the Appearance tab). Language reuses `LocaleSwitcher` (already account-synced).

## Architecture

### Component — `app/components/layout/AccountMenu.vue`

- State: `open` ref; `rootRef` (the wrapper) for click-outside.
- `email = authStore.user?.email ?? ''`; `initial = (email[0] ?? '?').toUpperCase()`; `isDark` computed (get from `useTheme().theme`, set via `useSettings().setTheme`).
- Trigger: `<button class="acct__avatar" aria-haspopup="true" :aria-expanded="open" :aria-label="email || t('settings.menu.account')" @click.stop="open = !open">{{ initial }}</button>`.
- Popover (`v-if="open"`, `role="menu"`, class `acct__menu`): email line; a dark-mode `Field`/`Toggle`; `<LocaleSwitcher />`; a `NuxtLink to="/settings"` (`role="menuitem"`, closes on click) labelled `t('nav.settings')`; a sign-out `<button role="menuitem">` (`t('auth.sign_out')` → `useAuth().signOutAndExit()`).
- Dismissal: a `document` `click` listener closes when the click is outside `rootRef` (the avatar uses `@click.stop` so opening doesn't immediately self-close); `Escape` closes. Listeners added/removed in `onMounted`/`onUnmounted`.
- Styling: pixel avatar circle (accent/ink), popover as a paper card with chunky border + shadow, `z-index` above the sidebar; honors `prefers-reduced-motion`.

### Sidebar — `app/components/layout/AppSidebar.vue`

- Replace the footer's `<AccountWidget /> + <LocaleSwitcher />` with `<AccountMenu />` (drop those two imports/usages from the sidebar).
- Remove the `.sidebar--collapsed .sidebar__footer { display: none }` rule so the avatar shows when collapsed; center the avatar in the collapsed rail. Drop the now-unneeded `min-width: 186px` on the footer.

### i18n (`i18n/locales/*.json`, all 8) — one new key

| key | English |
|---|---|
| `settings.menu.account` | "Account menu" |

(Used as the avatar's `aria-label` fallback. The link label reuses `nav.settings`; sign-out reuses `auth.sign_out`; language label reuses `common.language`; theme reuses `settings.dark_mode`.) 화이팅 / Korean untouched.

## Testing (TDD)

- **`tests/components/layout/AccountMenu.test.ts`** — `setActivePinia`; stub `useAuth` (`signOutAndExit` spy) and `useNuxtApp` (`{ $supabase: null }`, for the settings store's adapter); set `useAuthStore().user = { email: 'sol@example.com' }`; mount with `attachTo: document.body` and `global: { stubs: { LocaleSwitcher: true } }`:
  - avatar shows the initial `S`.
  - clicking the avatar opens the popover (`role="menu"`), which contains the email, a `/settings` link, and the sign-out button.
  - clicking sign-out calls `signOutAndExit`.
  - a click on `document.body` (outside the menu) closes the popover.
- **`tests/unit/settings/i18n-menu-keys.test.ts`** — parity: `settings.menu.account` is a non-empty string in all 8 locales.
- `AppSidebar` has no dedicated test today; verified via `pnpm typecheck` + the full gate (its content is otherwise unchanged).
- Full suite + `pnpm typecheck` + `pnpm lint` green.

## Risks / notes

- **Popover clipping:** the absolute-positioned popover assumes no clipping `overflow` ancestor between the avatar and the viewport edge. If clipped in the real app, the follow-up is Teleport-to-body + `getBoundingClientRect` positioning. Flagged, not built in v1.
- **Collapsed rail:** showing the avatar collapsed is a UX improvement (account/sign-out now reachable in both states) — it removes the prior `display:none` footer behavior intentionally.
- **No god files:** one focused component; the sidebar change is a small swap.
- **DRY:** reuses LocaleSwitcher + existing i18n keys; only `settings.menu.account` is new.

## Completes the overhaul

This is the last of the three tandas. After it, the settings/account UX work the user requested (tabs, delete account, quick-menu) is done.
