# Settings overhaul — audit & plan

_Date: 2026-06-14 · Scope: `app/pages/settings.vue` and everything that should live there · Stack: Nuxt 4 SPA, Pinia setup-stores, Supabase, @nuxtjs/i18n (8 locales)_

Source: multi-agent audit (6 areas × adversarial verification). Every finding below is anchored to a real file/line and was re-checked by a skeptic pass before landing here.

## Verdict

The settings page is a **stub**: it exposes only a `LocaleSwitcher`, a dark-mode `Toggle`, and a literal `empty.settings` placeholder ("Account settings and customization land in later plans"). For a mandatory-account SRS app with audio, animation, an SRS engine, a context system, and stored PII, that's a large surface of missing controls.

The good news: **most of the backing logic already exists** — it just has no UI, or it's wired but not persisted. The single highest-leverage fact is that there is **no `user_settings` table and no preferences store**, so every "setting" (theme, locale, audio, garden pin) is stored in per-device `localStorage` even though every user now has an account (mandatory since 2026-06-11). One foundational table unblocks ~8 downstream features. Build that first.

## What's already solid (don't rebuild)

- **Persistence triad is well-shaped**: `StorageAdapter` interface, `LocalStorageAdapter`, `SupabaseAdapter` with `pickAdapter()` (`app/lib/storage/`). Adding a synced pref is a known pattern.
- **DB is cascade-ready**: all six `user_*` tables `REFERENCES auth.users(id) ON DELETE CASCADE` (`supabase/migrations/20260603000001_initial_schema.sql:42,60,80,94,109,120`). Account deletion is "just" the missing `auth.users` row delete.
- **`SupabaseAdapter.clear()`** (`supabase.ts:265-277`) already wipes all six user tables — a "reset progress" / "delete data" primitive is built.
- **Context system is 100% done at the data layer**: `contexts.ts` `toggleActive`/`addCustom` persist + sync to `user_inactive_contexts` / `user_custom_contexts`. Only the UI is missing.
- **Toast system** (`useToast.ts`) is production-ready with aria-live — ready for save/error feedback.
- **Account UI exists** (`AccountWidget.vue`: email + sign-out, i18n'd as `auth.signed_in_as` / `auth.sign_out`) — it just lives only in the sidebar.
- **8-locale parity is maintained by hand** (263 lines each) — discipline is good; the cost is real per new key.
- **OS reduced-motion is honored** in ~29 components — the motion-collapse machinery exists; it just needs a second (in-app) trigger.

---

## Prioritized findings

### 🔴 Critical

- **No account deletion / right-to-erasure.** Mandatory accounts + stored PII (email + authored sentences) with no self-service exit. `useAuth.ts:132` exports no `deleteAccount`; no `supabase/functions/` exists. The data-wipe half is built (`SupabaseAdapter.clear()` + ON DELETE CASCADE); only the `auth.users` delete is missing, which the anon client can't self-perform → needs the project's **first Edge Function**. _Interim quick win:_ a "request deletion" `mailto:hello@mungarden.app` (`policies.vue:33`). _(effort: large)_
- **Context manager has zero UI despite a finished, synced backend.** `contexts.ts:27 toggleActive` / `:37 addCustom` have **no callers anywhere**. Practice hard-blocks under 3 active contexts (`usePractice.ts:31-35`, `practice.no_contexts`), so a user who drops below 3 is **permanently stuck with no remedy screen**, and the entire `user_custom_contexts` table is unreachable. Highest ROI in the codebase. _(effort: medium)_

### 🟡 Important

**Foundation**
- **No `user_settings` table / preferences store (the keystone).** Theme (`useTheme.ts:5,37`), locale (`stores/locale.ts:5`), and both audio toggles (`useWelcomeMusic.ts:3`, `useEscapeRoomAudio.ts:27`) live in per-device `localStorage`. `supabase.ts:144-147,254-258` explicitly no-ops locale. Four prefs use **three** inconsistent storage paths/namespaces (`mungarden:*` raw vs `munbeop.v1.*` via adapter). Locale is also missing from `useAuth.hydrateDataStores()` (`useAuth.ts:23-30`), so switching accounts in one browser leaves the old locale active — a correctness bug the moment locale is per-account. _(effort: large)_

**Account** (the single biggest absent category)
- **Sign-out is unreachable from settings** and from the **collapsed sidebar** (`AppSidebar.vue:296` hides the footer at the 64px rail) — a collapsed-rail user must re-expand to sign out. _(effort: quick)_
- **No change-password, no forgot-password, no change-email.** Email+password sign-up exists (`WelcomeEmailForm.vue:67-76`) but `grep updateUser|resetPasswordForEmail` = 0 hits. A password user who forgets has **no in-app recovery**; a typo'd email is permanent. All client-side via Supabase Auth (reset/email-change need `auth/callback.vue` to handle the `PASSWORD_RECOVERY` / `EMAIL_CHANGE` tokens). _(effort: medium)_

**Learning**
- **No daily goal / new-vs-review limits.** Every draw is a fixed 9 sentences (`session.ts:20-21` `PICK_COUNT=3`/`CONTEXTS_PER_PICK=3`); no intake budget anywhere. The #1 expected SRS setting. _(effort: large, gated on the prefs store)_
- **Deck / TOPIK-level focus is dead-wired + non-persistent.** `grammar.ts:39 toggleDeck` has zero callers; `excludedDeckIds` isn't in `STORAGE_KEYS`, never read in `hydrate()`, resets on reload — yet `DeckPicker.vue:58` shows "Excluded in the Library" badges (a visible broken promise). Per-session focus *does* work (`ruleta.vue:77`), so it's a persistence fix, not net-new. _(effort: medium)_

**Audio / motion**
- **No central audio control.** Escape room autoplays ambient/voice/SFX; welcome music autoplays. The only mutes are an in-game HUD button and `WelcomeMusicToggle.vue`. No master mute/volume in settings; no `Slider` primitive exists in `components/ui/` (volume = build a component). Plus a latent bug: `useWelcomeMusic.ensurePlaying()` (`:88-95`) **force-writes 'on'** at every ENTER, so a future master-mute would be silently defeated. _(effort: medium for mute + surface existing toggles; volume larger)_
- **No in-app reduced-motion toggle.** Motion-heavy app (weather, celebrations, butterflies, card draws) honors only the **OS** flag (`tokens/motion.css:30-37`). Users who can't set the OS flag (managed/shared device) have no override. _(effort: medium)_

**Data / privacy / legal**
- **Legal docs unreachable from the authenticated app.** `/policies`, `/pricing`, `/features` links live only in `WelcomeNavLinks.vue` (signed-out welcome). `AppSidebar.vue` has 6 nav items, none legal. Cheapest real compliance gap. _(effort: quick)_
- **No data export, though it's promised.** `policies.vue:25` ("your data is yours to take") + `pricing.vue:32` ("Backup & restore") advertise it; `adapter.read()` already returns every table as plain JS → a client-side JSON blob is trivial. PIPA/GDPR portability. _(effort: medium)_
- **Stale "Local-only" copy** in `policies.vue:21` ("keeps everything on your device until you sign in") and `pricing.vue:26` ("Local-only progress") — false since guest mode was removed; actively misleading in a legal doc. _(effort: quick)_

**Appearance / i18n**
- **Theme has no "System/Auto."** `Theme = 'light' | 'dark'` (`useTheme.ts:3`); chrome already reads `prefers-color-scheme` for the PWA theme-color (`nuxt.config.ts:62-63`) while the UI never does — an inconsistency. _(effort: medium)_
- **No `settings.*` i18n namespace contract.** Today: one key (`settings.dark_mode`). Every new control costs ~8× by hand. Define a scoped namespace + parity checklist **before** building UI; **reuse `auth.*` keys** for account (don't fork). _(effort: medium, process)_
- **No "Korean display" control** (bilingual / korean-only / romanized). `BilingualTitle.vue:39-40` splits KO/Latin into separate spans (the seam is half-built), but no pref owns it. Bilingual↔korean-only is a CSS show/hide (medium); romanization needs a per-grammar field (large). Keep 화이팅 + cultural particles Korean in every mode. _(effort: large overall, medium for v1)_

### 🟢 Improvements (worth doing, lower urgency)

- **Settings page IA**: no sections/headings (a11y landmark miss), cramped `max-width:320px` per card (placeholder is already wider), no save toasts, no reset-to-defaults. Establish a `SettingsSection` wrapper before the page grows.
- **Account polish**: display name (`user_metadata`, no migration), read-only "Signed in with: Kakao/Google/Email" (`auth.user.identities`), "Sign out of all devices" (`signOut({ scope: 'global' })`), `AccountWidget` drops its `{ error }` silently (`:9-13`) — toast on failure.
- **Learning polish**: round-size select, promotion-pace preset (Relaxed/Standard/Strict — don't expose raw thresholds; `thresholds.ts:2` says "confirm with product"), default/remembered deck, "review hard sentences first" mode (drains the diary backlog `useGardenState.ts:121-126`), "reset all progress" (uses existing `clear()`), garden-level pin sync.
- **Audio/a11y polish**: per-channel Music/SFX/Voice, volume sliders, text-size scaling (the px type scale `typography.css:22-29` has no `rem` anchor → browser/OS font-size is ignored — structural a11y debt), high-legibility toggle (re-enable smoothing / swap pixel headings to Inter), screen-reader feedback announcements.
- **i18n polish**: consolidate the duplicated `LocaleSwitcher` (sidebar + settings) to one source of truth once locale syncs; fix the stale `i18n.config.ts:5-8` comment (all 8 locales now translate `garden.*`/`nav.sidebar_*`).

### ⏸️ Deferred (needs a backend/business decision first — don't build the toggle before the pipe)

- **Study reminders / notifications** — zero infra (no service worker, no `functions/`, no email pipe). Options: Web Push (SW + VAPID + scheduled Edge Function on `user_progress.last_seen`) or email digest via Resend. Needs a `notification_prefs` table first.
- **Privacy/consent toggle** — there are genuinely no trackers today (`policies.vue:29` is true), so a banner now is over-engineering. Add an analytics opt-out the moment PostHog/Sentry lands (both MCPs are present), and keep `policies.vue:29` accurate.
- **Subscription/plan panel** — `pricing.vue` is placeholder (TODO `:5-6`), no plan column anywhere. Settings is the future home for plan status + manage/cancel once Toss/KakaoPay/Stripe billing is wired (user is Korea-based → Toss/KakaoPay natural).

---

## Plan

### Phase 0 — Foundation + free wins (this week)

1. **`user_settings` keystone.** New migration `user_settings (user_id uuid PK REFERENCES auth.users ON DELETE CASCADE, theme text, locale text, prefs jsonb, updated_at timestamptz)` + owner RLS mirroring `20260603000002_rls_policies.sql`. Add `STORAGE_KEYS.settings` (`keys.ts`), a `SupabaseAdapter` read/write case (upsert one row, mirror the `user_inactive_contexts` pattern at `supabase.ts:135-142,243-252`), and a `useSettings` setup-store. Register it in `useAuth.hydrateDataStores()` + `layouts/default.vue` onMounted. Keep `localStorage` as same-device cache + the `app.vue:45` FOUC seed for theme. **Decide explicitly per pref whether it's device- or account-scoped** (theme/audio can't `await` Supabase before first paint).
2. **Settings page IA.** `SettingsSection` wrapper (bilingual heading via `BilingualTitle level="h2"`), grouped sections (Account / Learning / Appearance / Audio / Data & Legal), page-level width (~560–640px), replace the `empty.settings` placeholder. Define the `settings.*` i18n namespace contract + 8-locale parity checklist now; reuse `auth.*` for account.
3. **Free compliance/copy wins.** "About & Legal" card linking `/policies` `/pricing` `/features` (all in `PUBLIC_PATHS`). Fix stale "Local-only" copy (`policies.vue:21`, `pricing.vue:26`). Data export button (`useDataExport()` → `adapter.read()` per key → JSON `Blob` download) with a success toast.

### Phase 1 — Account (high value, medium risk)

4. **Account section in settings.** Extract `AccountWidget`'s inner block into a shared component; mount under "Account" (email + sign-out reachable from settings + collapsed rail). Reuse `auth.*` keys.
5. **Password & email self-service.** `useAuth().updatePassword()` (`auth.updateUser({password})`), `updateEmail()`, `resetPassword()` + "Forgot password?" on `sign-in.vue`; extend `auth/callback.vue` for `PASSWORD_RECOVERY` / `EMAIL_CHANGE` tokens. Show password/email controls only for email-identity users.
6. **Delete account.** First Edge Function (`supabase/functions/delete-account`, service-role, verify JWT → `auth.admin.deleteUser()`); `useAuth().deleteAccount()`; "Danger zone" card with a typed-confirm modal (reuse the `GameExitButton` modal pattern). Ship the `mailto` interim first if the function slips.

### Phase 2 — Learning (the heart of the SRS)

7. **Context manager UI** (critical — backend done): toggle list over `contextsStore.all` bound to `toggleActive`, inline "Add context" → `addCustom`, guard against dropping below 3 active.
8. **Study-prefs store** (built on the Phase 0 table): daily new/review limits + per-day counter from `logStore`; round-size select (thread `picks`/`contextsPerPick` through `createSession`); "review-first" mode (bias picks from `pendingReviews`); promotion-pace preset (inject a threshold set into `recalculateMastery`).
9. **Fix deck focus persistence**: add `excludedDeckIds` `STORAGE_KEY`, read in `grammar.hydrate()`, write in `toggleDeck`; surface deck toggles; remembered/default deck in `ruleta.vue`. "Reset progress" danger action via `clear()`.

### Phase 3 — Appearance / audio / accessibility

10. **Theme System/Auto**: widen `Theme` to include `'system'`, resolve via `matchMedia` + subscribe, update the FOUC script, replace the boolean toggle with a 3-way segmented control.
11. **Audio**: master mute + surface the two existing toggles in an Audio card (route through `useSettings`); **fix `ensurePlaying()`** to respect master/music state. Then volume (build a `Slider` primitive) + per-channel Music/SFX/Voice.
12. **Reduced-motion in-app toggle**: `useReducedMotion` combining `matchMedia` + persisted override → `data-reduce-motion` on `<html>`; have `motion.css` + the two JS `matchMedia` reads honor it; seed in the FOUC script.
13. **Korean display** (bilingual / korean-only first via CSS show/hide of the Latin span); **text scaling** (anchor `html{font-size}` in `rem`, then a size select) + high-legibility toggle.

### Phase 4 — Deferred (after a backend/business decision)

14. Reminders/notifications (Web Push or Resend) · consent toggle (with first analytics) · subscription panel (with billing) · sessions list / provider link-unlink / avatar / SR announcements.

---

## Notes & risks

- **FOUC vs sync**: theme is read synchronously by the inline `app.vue:45` boot script and cannot `await` Supabase. Treat theme (and audio) as "localStorage-first, reconcile from cloud after hydrate," not "cloud-first."
- **i18n tax**: scope v1 to settings the app can actually wire today (theme, audio on/off, account, legal, export). Defer keys for volume sliders and a manual reduced-motion toggle until that state exists, so you don't translate dead strings ×8.
- **Reuse, don't fork**: account = relocate `AccountWidget` + reuse `auth.signed_in_as`/`auth.sign_out`; only mint new keys for genuinely-new actions (delete, password, email).
- **No god files** (project rule): each section is its own component; the prefs store, study-prefs store, and `useReducedMotion`/`useDataExport`/`useSettings` stay small and single-responsibility.
