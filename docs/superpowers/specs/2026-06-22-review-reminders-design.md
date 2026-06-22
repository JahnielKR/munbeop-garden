# Opt-in review reminders (return-visit nudge) — design

_Created 2026-06-22. Roadmap Step 16 (Phase 3) of `docs/superpowers/plans/2026-06-20-bunpro-inspired-roadmap.md`. Effort: S–M. Branch off `main` (after Steps 11/12/13 merged)._

## Goal

A gentle, opt-in reminder that brings the user back to review their "ready to revisit" plants (the Step 12 count). **Zero-backend, no trackers, default OFF.** When a reminder-enabled user returns to the app after an absence and has plants ready, a calm in-app banner ("N plants ready to revisit 🌱") greets them — and, if they granted notification permission, the same nudge also fires as a browser `Notification`.

## Codebase findings that shape this design (verified against source)

1. **There is NO service worker / PWA setup** (no `vite-pwa`, no `registerSW`, no `Notification` usage anywhere in `app/`). The roadmap's premise ("the existing service worker") does not hold. True push-while-away reminders would need a backend push server (violates no-backend) or a Service Worker + Periodic Background Sync (Chromium-only, installed-PWA-only, large scope). **So v1 is a return-visit nudge** — shown on app open, no SW needed, works everywhere.
2. **Step 12 already provides the "ready" signal.** `useReadyCount()` (`app/composables/useReadyCount.ts`) exposes `readyCount`/`readyKos` derived from `dueKos` — the reminder reuses it directly.
3. **The settings blob is the no-migration home for the opt-in.** `useSettingsStore` (`app/stores/settings.ts`) persists `{ theme, locale, dailyGoal }` as one blob under `STORAGE_KEYS.settings`; adding `reviewReminders: boolean` mirrors `dailyGoal` exactly (interface field + hydrate read + `persistCloud` write + a setter) with **no new storage key and no migration**.
4. **The revisit-due session already exists.** `/practice/ruleta?revisit=due` (Step 12) is the natural tap target for the nudge.

## Decisions (locked, all user-approved)

- **Direction:** return-visit nudge (not push-while-away — honestly impossible zero-backend without a SW).
- **Surface:** in-app banner **always** (no permission) + an **optional** browser `Notification` when permission is granted (progressive enhancement honouring the roadmap's "Notification API").
- **Cadence:** fires on return after **~1.5 days** of absence, only when ≥1 plant is ready, at most **once per ~day** (cooldown). Never a daily nag.
- **Action:** the nudge links to the revisit-due session (`/practice/ruleta?revisit=due`).
- **Persistence:** opt-in in the existing settings blob (no migration); timing state in localStorage (device-local).

## Pure nudge logic — `app/lib/reminders/nudge.ts` (new, pure)

```ts
export const ABSENCE_MS = 1.5 * 24 * 60 * 60 * 1000   // ~1.5 days away before we nudge
export const NUDGE_COOLDOWN_MS = 20 * 60 * 60 * 1000  // at most ~once per day
export const MIN_READY = 1

export interface NudgeInput {
  enabled: boolean
  readyCount: number
  lastVisitAt: number | null  // previous visit (ms); null on first ever visit
  lastNudgeAt: number | null  // last time we nudged (ms)
  now: number
}

export function shouldNudge(i: NudgeInput): boolean {
  if (!i.enabled) return false
  if (i.readyCount < MIN_READY) return false
  if (i.lastVisitAt === null) return false                       // first visit — never nudge
  if (i.now - i.lastVisitAt < ABSENCE_MS) return false           // not away long enough
  if (i.lastNudgeAt !== null && i.now - i.lastNudgeAt < NUDGE_COOLDOWN_MS) return false
  return true
}
```

Golden-tested across every branch. Constants tunable.

## Opt-in setting — `app/stores/settings.ts` + Settings UI

- Add `reviewReminders: boolean` to the `Settings` interface (default `false`), a `reviewReminders` ref, a hydrate read (`if (typeof cloud.reviewReminders === 'boolean') reviewReminders.value = cloud.reviewReminders`), include it in the `persistCloud` blob, and a `setReviewReminders(on: boolean)` setter. Mirrors `dailyGoal`. **No migration** (same `STORAGE_KEYS.settings` blob).
- A toggle in the Settings page (a "Notifications" / reminders row). When switched **on**, call `Notification.requestPermission()` (guarded for environments without the API) so the optional browser notification can later fire; the in-app banner works regardless of the permission outcome. Default off.

## Timing state — localStorage (device-local)

`reminder.lastVisitAt` and `reminder.lastNudgeAt` (epoch ms). Device-local UI timing, not synced (mirrors `garden.activeLevel`). A tiny reader/writer in the composable; absent → `null`.

## Orchestration — `app/composables/useReviewReminder.ts` (new)

Runs once on app mount (in the default layout, where stores hydrate). Steps:
1. Read `enabled` (settings store `reviewReminders`), `lastVisitAt`/`lastNudgeAt` (localStorage), and `readyCount` (`useReadyCount`).
2. Compute `shouldNudge({ enabled, readyCount, lastVisitAt, lastNudgeAt, now: Date.now() })`.
3. If true: set a reactive `show` flag (drives the banner) **and**, when `typeof Notification !== 'undefined' && Notification.permission === 'granted'`, fire `new Notification(t('reminder.notif_title'), { body: t('reminder.notif_body', { n: readyCount }), tag: 'mungarden-review' })`; write `reminder.lastNudgeAt = now`.
4. **Always** write `reminder.lastVisitAt = now` (after the decision, so absence is measured from the previous visit).

Exposes `{ show, readyCount, dismiss }`. The `readyCount` is captured at fire time for the banner copy. `dismiss()` clears `show`.

## Banner — `app/components/garden/ReviewReminderBanner.vue`

A calm, dismissible banner (sibling styling to the Step 12 `ReadyToRevisit` hint, distinct from rain): **"{n} plants ready to revisit 🌱"** as a `NuxtLink` to `/practice/ruleta?revisit=due`, plus a dismiss control. Rendered in the default layout via `v-if="reminder.show"`. Never a red/debt counter.

## i18n (all 8 locales) + tests

- `reminder.banner` ("{n} plants ready to revisit", keeps `{n}`), `reminder.dismiss`, `reminder.notif_title`, `reminder.notif_body` ("{n} …", keeps `{n}`), `reminder.setting_label`, `reminder.setting_hint`. Parity test + `{n}` invariant. (🌱 is an emoji in the banner template, locale-independent.)
- **Tests (TDD):** `shouldNudge` — disabled; ready 0; first visit (lastVisitAt null); just under / at the absence threshold; cooldown active / elapsed; happy path. Settings: `setReviewReminders` flips the ref + persists (store-mock). `ReviewReminderBanner` — renders the count, links to `/practice/ruleta?revisit=due`, emits dismiss; nothing when not shown. i18n parity. `useReviewReminder` is verified by `typecheck` (Nuxt-context mount + `Notification`/localStorage side effects, not unit-tested — same convention as the ruleta/index wirings).

## Acceptance criteria

1. With reminders **off**, nothing ever shows (default). With reminders **on**, returning after ≥~1.5 days with ≥1 ready plant shows the in-app banner once; it does not re-fire within the cooldown; first-ever visit never nudges.
2. Enabling the setting requests notification permission; when granted, the nudge also fires a browser `Notification`; when denied/unsupported, only the in-app banner shows. The app never throws where `Notification` is absent.
3. The banner links to `/practice/ruleta?revisit=due` and is dismissible; framing is calm (no debt counter).
4. `reviewReminders` persists in the existing settings blob — **no migration**; `database.types.ts` unchanged.
5. New `reminder.*` keys in all 8 locales; `{n}` invariant preserved. `pnpm test` / `lint` / `typecheck` green.

## Out of scope (v1)

- A Service Worker / PWA / install prompt / Periodic Background Sync (push-while-away) — revisit only if real away-reminders are later justified.
- Email digests (Supabase scheduled fn + Resend) — explicitly deferred by the roadmap unless later justified.
- Per-user configurable thresholds (the ~1.5-day / once-a-day defaults are fixed constants in v1).
- Quiet-hours / timezone logic (the nudge is on-return, so local clock isn't needed).
