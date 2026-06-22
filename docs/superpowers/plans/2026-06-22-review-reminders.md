# Opt-in review reminders (return-visit nudge) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An opt-in, zero-backend return-visit nudge: when a reminder-enabled user reopens the app after ~1.5 days and has plants ready to revisit (Step 12), a calm in-app banner greets them, plus an optional browser `Notification` when permission was granted.

**Architecture:** A pure `shouldNudge()` decides whether to nudge from (enabled, readyCount, lastVisitAt, lastNudgeAt, now). A thin `useReviewReminder` composable runs once after store hydration in the default layout: it reads the opt-in (settings blob), the device-local timestamps (localStorage), and `readyCount` (Step 12's `useReadyCount`), then sets a banner flag + fires the optional `Notification`. The opt-in lives in the existing settings blob (no migration). The banner links to `/practice/ruleta?revisit=due`.

**Tech Stack:** Nuxt 4 SPA, Vue 3 `<script setup>`, Pinia, Vitest + @vue/test-utils (happy-dom), `@nuxtjs/i18n` (8 locales). Package manager: **pnpm**.

**Spec:** `docs/superpowers/specs/2026-06-22-review-reminders-design.md`

**House conventions (verified against source):**
- Pure logic in `app/lib/**`, unit-tested in `tests/unit/**`; components in `tests/components/**`. Golden tests use `it.each` / plain assertions.
- `useI18n().t` is a key-echo stub in tests; reactivity primitives + `useLocalized` are test globals. `NuxtLink` → `<a href>` via `#components` stub.
- **vitest gotcha (Steps 11/12):** keep the SUT `import` at the TOP even with `vi.mock` below it (`import/first` lint). Type-only wrong-module imports pass vitest but fail `vue-tsc` → always `pnpm typecheck` before commit.
- i18n parity = per-feature test importing all 8 locale JSONs; add keys via a temp re-serialize script, deleted before commit.
- The opt-in mirrors `dailyGoal` in `app/stores/settings.ts` (interface field + hydrate read + `persistCloud` write + setter) — **no new storage key, no migration**.
- The setting component clones `app/components/settings/DailyGoalSetting.vue`, rendered in the **learning** tab of `app/pages/settings.vue`.
- The default layout (`app/layouts/default.vue`) hydrates stores in `onMounted` then `await useSettingsStore().hydrate()` — the reminder check runs right after; the banner renders beside `DataErrorBanner`.
- Single test: `pnpm exec vitest run <path>`. Full: `pnpm test`. `pnpm lint`. `pnpm typecheck`.

---

## Task 1: Pure nudge logic — `shouldNudge`

**Files:**
- Create: `munbeop/app/lib/reminders/nudge.ts`
- Test: `munbeop/tests/unit/reminders/nudge.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/unit/reminders/nudge.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { shouldNudge, ABSENCE_MS, NUDGE_COOLDOWN_MS } from '~/lib/reminders/nudge'

const NOW = Date.UTC(2026, 5, 22, 12)
const base = {
  enabled: true,
  readyCount: 3,
  lastVisitAt: NOW - ABSENCE_MS - 1, // safely away
  lastNudgeAt: null as number | null,
  now: NOW,
}

describe('shouldNudge', () => {
  it('nudges on return after the absence window with ready plants', () => {
    expect(shouldNudge(base)).toBe(true)
  })
  it('never nudges when disabled', () => {
    expect(shouldNudge({ ...base, enabled: false })).toBe(false)
  })
  it('never nudges with no ready plants', () => {
    expect(shouldNudge({ ...base, readyCount: 0 })).toBe(false)
  })
  it('never nudges on the first ever visit (lastVisitAt null)', () => {
    expect(shouldNudge({ ...base, lastVisitAt: null })).toBe(false)
  })
  it('does not nudge before the absence window elapses', () => {
    expect(shouldNudge({ ...base, lastVisitAt: NOW - ABSENCE_MS + 1 })).toBe(false)
  })
  it('respects the cooldown (no repeat nudge within the window)', () => {
    expect(shouldNudge({ ...base, lastNudgeAt: NOW - NUDGE_COOLDOWN_MS + 1 })).toBe(false)
  })
  it('nudges again once the cooldown has elapsed', () => {
    expect(shouldNudge({ ...base, lastNudgeAt: NOW - NUDGE_COOLDOWN_MS - 1 })).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/reminders/nudge.test.ts`
Expected: FAIL — `Failed to resolve import "~/lib/reminders/nudge"`.

- [ ] **Step 3: Write the implementation**

Create `munbeop/app/lib/reminders/nudge.ts`:

```ts
/** A return-visit nudge: bring the user back to review when they've been away. */
export const ABSENCE_MS = 1.5 * 24 * 60 * 60 * 1000 // ~1.5 days away before we nudge
export const NUDGE_COOLDOWN_MS = 20 * 60 * 60 * 1000 // at most ~once per day
export const MIN_READY = 1

export interface NudgeInput {
  enabled: boolean
  readyCount: number
  /** Previous visit (ms); null on the first ever visit. */
  lastVisitAt: number | null
  /** Last time we nudged (ms); null if never. */
  lastNudgeAt: number | null
  now: number
}

export function shouldNudge(i: NudgeInput): boolean {
  if (!i.enabled) return false
  if (i.readyCount < MIN_READY) return false
  if (i.lastVisitAt === null) return false // first visit — never nudge
  if (i.now - i.lastVisitAt < ABSENCE_MS) return false // not away long enough
  if (i.lastNudgeAt !== null && i.now - i.lastNudgeAt < NUDGE_COOLDOWN_MS) return false
  return true
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/reminders/nudge.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/lib/reminders/nudge.ts munbeop/tests/unit/reminders/nudge.test.ts
git commit -m "feat(reminders): pure shouldNudge return-visit gate"
```

---

## Task 2: Opt-in in the settings blob

**Files:**
- Modify: `munbeop/app/stores/settings.ts`

No new test: the setting mirrors `dailyGoal` (covered by its existing pattern); the setter is glue verified by `pnpm typecheck` + the Task 5 component test.

- [ ] **Step 1: Add the field + setter**

In `munbeop/app/stores/settings.ts`:

(a) Add `reviewReminders: boolean` to the `Settings` interface:

```ts
interface Settings {
  theme: Theme
  locale: LocaleCode
  dailyGoal: number
  reviewReminders: boolean
}
```

(b) Add a ref next to `dailyGoal` (after `const dailyGoal = ref(DEFAULT_DAILY_GOAL)`):

```ts
  const reviewReminders = ref(false)
```

(c) In `hydrate()`, after the `dailyGoal` read:

```ts
      if (typeof cloud.reviewReminders === 'boolean') reviewReminders.value = cloud.reviewReminders
```

(d) In `persistCloud()`, add `reviewReminders` to the written blob:

```ts
      await storage.write(STORAGE_KEYS.settings, {
        theme: theme.value,
        locale: localeStore.current,
        dailyGoal: dailyGoal.value,
        reviewReminders: reviewReminders.value,
      } satisfies Settings)
```

(e) Add the setter (after `setDailyGoal`). Enabling requests notification permission so the optional browser notification can later fire; the in-app banner works regardless:

```ts
  async function setReviewReminders(on: boolean): Promise<void> {
    reviewReminders.value = on
    if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        // Permission prompt unavailable (e.g. insecure context) — the in-app banner still works.
      }
    }
    await persistCloud()
  }
```

(f) Export `reviewReminders` + `setReviewReminders` in the return object:

```ts
  return { hydrate, setTheme, setLocale, dailyGoal, setDailyGoal, reviewReminders, setReviewReminders }
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add munbeop/app/stores/settings.ts
git commit -m "feat(reminders): reviewReminders opt-in in the settings blob (no migration)"
```

---

## Task 3: `ReviewReminderBanner` component

**Files:**
- Create: `munbeop/app/components/garden/ReviewReminderBanner.vue`
- Test: `munbeop/tests/components/garden/ReviewReminderBanner.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/garden/ReviewReminderBanner.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewReminderBanner from '~/components/garden/ReviewReminderBanner.vue'

describe('ReviewReminderBanner', () => {
  it('shows the count and links to the revisit-due session', () => {
    const w = mount(ReviewReminderBanner, { props: { count: 4 } })
    expect(w.text()).toContain('4')
    expect(w.find('a').attributes('href')).toBe('/practice/ruleta?revisit=due')
  })

  it('emits dismiss when the dismiss control is clicked', async () => {
    const w = mount(ReviewReminderBanner, { props: { count: 2 } })
    await w.find('[data-testid="reminder-dismiss"]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/garden/ReviewReminderBanner.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/garden/ReviewReminderBanner.vue`:

```vue
<script setup lang="ts">
import { NuxtLink } from '#components'

interface Props {
  count: number
}
defineProps<Props>()
defineEmits<{ dismiss: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="reminder" data-testid="review-reminder" role="status">
    <NuxtLink class="reminder__cta" to="/practice/ruleta?revisit=due">
      🌱 {{ t('reminder.banner', { n: count }) }}
    </NuxtLink>
    <button
      type="button"
      class="reminder__dismiss"
      data-testid="reminder-dismiss"
      :aria-label="t('reminder.dismiss')"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.reminder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
}
.reminder__cta {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}
.reminder__cta:hover {
  text-decoration: underline;
}
.reminder__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.reminder__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}
.reminder__dismiss:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/garden/ReviewReminderBanner.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add munbeop/app/components/garden/ReviewReminderBanner.vue munbeop/tests/components/garden/ReviewReminderBanner.test.ts
git commit -m "feat(reminders): ReviewReminderBanner (links to ?revisit=due)"
```

---

## Task 4: `useReviewReminder` + wire into the default layout

**Files:**
- Create: `munbeop/app/composables/useReviewReminder.ts`
- Modify: `munbeop/app/layouts/default.vue`

No new test: the composable reads `localStorage`/`Notification` and runs in the Nuxt-context layout (not unit-tested, per house convention); the pure `shouldNudge` is covered by Task 1. Verified by `pnpm typecheck`.

- [ ] **Step 1: Write the composable**

Create `munbeop/app/composables/useReviewReminder.ts`:

```ts
import { ref } from 'vue'
import { shouldNudge } from '~/lib/reminders/nudge'
import { useReadyCount } from '~/composables/useReadyCount'
import { useSettingsStore } from '~/stores/settings'

const LAST_VISIT_KEY = 'reminder.lastVisitAt'
const LAST_NUDGE_KEY = 'reminder.lastNudgeAt'

function readTs(key: string): number | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(key)
  const n = raw === null ? NaN : Number(raw)
  return Number.isFinite(n) ? n : null
}
function writeTs(key: string, v: number): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, String(v))
}

/**
 * Opt-in return-visit reminder. Call check() once after the stores hydrate.
 * It decides via the pure shouldNudge(), shows the banner (+ optional browser
 * Notification when granted), records the nudge, and always stamps this visit
 * so the next absence is measured from now.
 */
export function useReviewReminder() {
  const settings = useSettingsStore()
  const { readyCount } = useReadyCount()
  const { t } = useI18n()

  const show = ref(false)
  const count = ref(0)

  function check(now: number = Date.now()): void {
    const lastVisitAt = readTs(LAST_VISIT_KEY)
    const lastNudgeAt = readTs(LAST_NUDGE_KEY)
    const ready = readyCount.value

    if (shouldNudge({ enabled: settings.reviewReminders, readyCount: ready, lastVisitAt, lastNudgeAt, now })) {
      show.value = true
      count.value = ready
      writeTs(LAST_NUDGE_KEY, now)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(t('reminder.notif_title'), {
            body: t('reminder.notif_body', { n: ready }),
            tag: 'mungarden-review',
          })
        } catch {
          // Notification construction can throw in some embeddings — the banner still shows.
        }
      }
    }
    writeTs(LAST_VISIT_KEY, now) // stamp this visit last, so absence is measured from the previous one
  }

  function dismiss(): void {
    show.value = false
  }

  return { show, count, dismiss, check }
}
```

- [ ] **Step 2: Wire it into `default.vue`**

In `munbeop/app/layouts/default.vue`:

(a) Add imports (after the existing imports):

```ts
import ReviewReminderBanner from '~/components/garden/ReviewReminderBanner.vue'
import { useReviewReminder } from '~/composables/useReviewReminder'
```

(b) In `<script setup>`, after `const localeStore = useLocaleStore()`:

```ts
const reminder = useReviewReminder()
```

(c) In the `onMounted` handler, after `await useSettingsStore().hydrate()` (the last line), add the check (settings + the data stores are now hydrated, so the opt-in + readyCount are accurate):

```ts
  reminder.check()
```

(d) In the template, render the banner above `<slot />`:

```vue
  <AppShell>
    <DataErrorBanner />
    <ReviewReminderBanner v-if="reminder.show.value" :count="reminder.count.value" @dismiss="reminder.dismiss" />
    <slot />
  </AppShell>
```

- [ ] **Step 3: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add munbeop/app/composables/useReviewReminder.ts munbeop/app/layouts/default.vue
git commit -m "feat(reminders): useReviewReminder check + banner in the default layout"
```

---

## Task 5: Settings toggle

**Files:**
- Create: `munbeop/app/components/settings/ReviewReminderSetting.vue`
- Modify: `munbeop/app/pages/settings.vue`
- Test: `munbeop/tests/components/settings/ReviewReminderSetting.test.ts`

- [ ] **Step 1: Write the failing test**

Create `munbeop/tests/components/settings/ReviewReminderSetting.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewReminderSetting from '~/components/settings/ReviewReminderSetting.vue'

const setReviewReminders = vi.fn()
vi.mock('~/stores/settings', () => ({
  useSettingsStore: () => ({ reviewReminders: false, setReviewReminders }),
}))

describe('ReviewReminderSetting', () => {
  it('calls setReviewReminders(true) when toggled on', async () => {
    const w = mount(ReviewReminderSetting)
    const box = w.find('input[type="checkbox"]')
    await box.setValue(true)
    expect(setReviewReminders).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/components/settings/ReviewReminderSetting.test.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write the component**

Create `munbeop/app/components/settings/ReviewReminderSetting.vue`:

```vue
<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

function onToggle(e: Event) {
  void settings.setReviewReminders((e.target as HTMLInputElement).checked)
}
</script>

<template>
  <section class="reminder-set" :aria-label="t('settings.review_reminders.title')">
    <h2 class="reminder-set__title">{{ t('settings.review_reminders.title') }}</h2>
    <label class="reminder-set__row">
      <input type="checkbox" :checked="settings.reviewReminders" @change="onToggle" />
      <span>{{ t('settings.review_reminders.label') }}</span>
    </label>
    <p class="reminder-set__hint">{{ t('settings.review_reminders.hint') }}</p>
  </section>
</template>

<style scoped>
.reminder-set { display: flex; flex-direction: column; gap: 8px; }
.reminder-set__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px; margin: 0; color: var(--ink);
}
.reminder-set__row { display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); }
.reminder-set__hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); margin: 0; }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/components/settings/ReviewReminderSetting.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire it into the learning tab of `settings.vue`**

In `munbeop/app/pages/settings.vue`:

(a) Add the import (after the `DailyGoalSetting` import):

```ts
import ReviewReminderSetting from '~/components/settings/ReviewReminderSetting.vue'
```

(b) In the learning panel, after `<DailyGoalSetting />`:

```vue
      <DailyGoalSetting />
      <ReviewReminderSetting />
      <ContextManager />
```

- [ ] **Step 6: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add munbeop/app/components/settings/ReviewReminderSetting.vue munbeop/app/pages/settings.vue munbeop/tests/components/settings/ReviewReminderSetting.test.ts
git commit -m "feat(reminders): review-reminders toggle in Settings → Learning"
```

---

## Task 6: i18n keys in all 8 locales + parity test

**Files:**
- Modify: `munbeop/i18n/locales/{en,es,fr,pt-BR,th,id,vi,ja}.json`
- Test: `munbeop/tests/unit/i18n/reminder-keys.test.ts`

- [ ] **Step 1: Write the failing parity test**

Create `munbeop/tests/unit/i18n/reminder-keys.test.ts` (mirror `tests/unit/i18n/stats-keys.test.ts`'s 8-locale import + `dig`) with:

```ts
const KEYS = [
  'reminder.banner', 'reminder.dismiss', 'reminder.notif_title', 'reminder.notif_body',
  'settings.review_reminders.title', 'settings.review_reminders.label', 'settings.review_reminders.hint',
]
```

Assert each key is a non-empty string across all 8 locales, plus a test that `reminder.banner` and `reminder.notif_body` each keep the `{n}` placeholder.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/i18n/reminder-keys.test.ts`
Expected: FAIL.

- [ ] **Step 3: Inject the keys into all 8 locales via a temp script**

Create `munbeop/scripts/tmp-add-reminder-i18n.mjs` mirroring Step 12's injector. For each locale set `json.reminder = { banner, dismiss, notif_title, notif_body }` and `json.settings.review_reminders = { title, label, hint }`. English:
- `reminder.banner`: "{n} plants ready to revisit", `reminder.dismiss`: "Dismiss", `reminder.notif_title`: "Your garden misses you 🌱", `reminder.notif_body`: "{n} plants are ready to revisit.",
- `settings.review_reminders.title`: "Review reminders", `settings.review_reminders.label`: "Remind me to revisit when I come back", `settings.review_reminders.hint`: "A gentle nudge when you return after a break and plants are ready. Off by default; no tracking — it only runs in your browser."
- Translate to es/fr/pt-BR/th/id/vi/ja in the established locale style; keep the `{n}` placeholders verbatim. (🌱 is an emoji, locale-independent.)

Run: `node scripts/tmp-add-reminder-i18n.mjs`
Then `git diff munbeop/i18n/locales/en.json` to confirm only the added `reminder` block + `settings.review_reminders` block.

- [ ] **Step 4: Run the parity test to verify it passes**

Run: `pnpm exec vitest run tests/unit/i18n/reminder-keys.test.ts`
Expected: PASS.

- [ ] **Step 5: Delete the temp script and commit**

```bash
rm munbeop/scripts/tmp-add-reminder-i18n.mjs
git add munbeop/i18n/locales munbeop/tests/unit/i18n/reminder-keys.test.ts
git commit -m "feat(reminders): reminder.* + settings.review_reminders.* i18n across 8 locales"
```

---

## Task 7: Full verification gate

- [ ] **Step 1:** `pnpm test` → all green (nudge + banner + setting + i18n + existing suite).
- [ ] **Step 2:** `pnpm lint` → 0 errors (watch `import/first` on the store-mocked setting test — keep the SUT import at the top).
- [ ] **Step 3:** `pnpm typecheck` → no errors.
- [ ] **Step 4:** Preview smoke — `nuxt dev` boots clean. (Interactive smoke needs a logged-in session + opting in + a >1.5-day-old `reminder.lastVisitAt`; the boot/compile check is the auth-independent signal.)
- [ ] **Step 5:** Final commit if any fixes: `git add -A && git commit -m "chore(reminders): lint/type fixes after Step 16 verification"`.

---

## Self-Review

**Spec coverage:** pure `shouldNudge` (return-visit gate, all branches) → Task 1. Opt-in in the settings blob (no migration) + permission request on enable → Task 2. `ReviewReminderBanner` → /practice/ruleta?revisit=due → Task 3. `useReviewReminder` orchestration (readyCount via Step 12, timestamps, banner + optional Notification, visit stamping) + layout wiring → Task 4. Settings toggle in the learning tab → Task 5. i18n 8 locales + parity → Task 6. No migration / no SW → no task touches `supabase/` or adds a service worker (by design). Verification → Task 7. ✓

**Type consistency:** `shouldNudge`'s `NudgeInput` (Task 1) is consumed verbatim by `useReviewReminder` (Task 4). `reviewReminders` + `setReviewReminders` (Task 2) are read by `useReviewReminder` (Task 4) and the setting component (Task 5). `ReviewReminderBanner` prop `count` (Task 3) matches `reminder.count` passed from the layout (Task 4). i18n keys referenced by `t(...)` in Tasks 3/4/5 are exactly the keys defined in Task 6.

**Placeholder scan:** Tasks 1/3/5/6 have complete code + tests. The non-tested glue (Task 2 store change, Task 4 composable + layout) is typecheck-verified, justified by the no-Nuxt-context-unit-test convention. Task 6's translations reference "the established locale style" (concrete existing pattern) and are gated by the parity test + `{n}` invariant.

**Note:** the banner uses `reminder.show.value` / `reminder.count.value` in the layout template because `useReviewReminder` returns plain refs (not unwrapped via a store) — `.value` is required in the template binding here.
