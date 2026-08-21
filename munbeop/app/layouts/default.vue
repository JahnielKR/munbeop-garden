<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import DataErrorBanner from '~/components/layout/DataErrorBanner.vue'
import ReviewReminderBanner from '~/components/garden/ReviewReminderBanner.vue'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLocaleStore } from '~/stores/locale'
import { useLogStore } from '~/stores/log'
import { useActivityStore } from '~/stores/activity'
import { useSrsStore } from '~/stores/srs'
import { useSettingsStore } from '~/stores/settings'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'
import { useCustomDecksStore } from '~/stores/customDecks'
import { syncLocaleToI18n } from '~/lib/i18n/sync-locale'
import { useReviewReminder } from '~/composables/useReviewReminder'
import { useAuthStore } from '~/stores/auth'
import { useAppStatus } from '~/stores/appStatus'

// useI18n() must be called from inside the layout's setup() — never from
// a defineNuxtPlugin handler. The latter triggers a fatal 'SyntaxError: 26'
// during client init on Nuxt 4 + @nuxtjs/i18n v9 (see prior commit history).
const { setLocale, locale, t } = useI18n()
const localeStore = useLocaleStore()
const reminder = useReviewReminder()
const authStore = useAuthStore()
const appStatus = useAppStatus()
const accountDataReady = computed(
  () => authStore.ready && !!authStore.user && appStatus.status === 'ready',
)

// Bridge the locale store → i18n runtime for the layout's whole lifetime, not
// just at mount. A reactive watch means a locale that arrives AFTER mount —
// e.g. settings.hydrate() applying another account's locale on SIGNED_IN —
// reaches the visible UI too, instead of staying stale until a remount.
syncLocaleToI18n(() => localeStore.current, locale, setLocale)

// Hydrate all stores in parallel, then restore the user's saved locale.
// Stores are now async (Plan 2) so we await before reading localeStore.current.
onMounted(async () => {
  // Auth bootstrap owns the authoritative tracked hydration after a session is
  // restored. Do not start a second untracked read once that bootstrap is
  // loading/ready/error: a late duplicate response could replace newer writes.
  if (appStatus.status !== 'idle') return
  // On a hard reload this runs against the noop adapter (the session isn't in
  // the store yet); useAuth().init() re-pulls the data stores on INITIAL_SESSION
  // once getSession() resolves. The adapter now throws on a Supabase error, so
  // guard the pull: a transient failure must not become an unhandled rejection
  // or trigger a destructive re-seed — the stores keep their last-known state.
  try {
    // Custom decks validate their grammar ids against this catalog, so hydrate
    // grammar first instead of racing both reads.
    await useGrammarStore().hydrate()
    await Promise.all([
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
      useActivityStore().hydrate(),
      useSettingsStore().hydrate(),
      localeStore.hydrate(),
      useEscapeRoomProgress().hydrate(),
      useCustomDecksStore().hydrate(),
    ])
  } catch (err) {
    console.error('default.vue: store hydration failed', err)
  }
})

let reminderCheckedForUser: string | null = null
watch(
  () => accountDataReady.value ? authStore.user?.id ?? null : null,
  (userId) => {
    if (!userId || reminderCheckedForUser === userId) return
    reminderCheckedForUser = userId
    reminder.check()
  },
  { immediate: true },
)
</script>

<template>
  <AppShell>
    <DataErrorBanner />
    <ReviewReminderBanner
      v-if="accountDataReady && reminder.show.value"
      :count="reminder.count.value"
      @dismiss="reminder.dismiss"
    />
    <slot v-if="accountDataReady" />
    <div
      v-else-if="appStatus.status !== 'error'"
      class="data-loading"
      role="status"
      aria-live="polite"
    >
      {{ t('garden.loading') }}
    </div>
  </AppShell>
</template>

<style scoped>
.data-loading {
  min-height: 40vh;
  display: grid;
  place-items: center;
  color: var(--text-soft);
  font-family: var(--font-ui);
}
</style>
