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

// useI18n() must be called from inside the layout's setup() — never from
// a defineNuxtPlugin handler. The latter triggers a fatal 'SyntaxError: 26'
// during client init on Nuxt 4 + @nuxtjs/i18n v9 (see prior commit history).
const { setLocale, locale } = useI18n()
const localeStore = useLocaleStore()
const reminder = useReviewReminder()

// Bridge the locale store → i18n runtime for the layout's whole lifetime, not
// just at mount. A reactive watch means a locale that arrives AFTER mount —
// e.g. settings.hydrate() applying another account's locale on SIGNED_IN —
// reaches the visible UI too, instead of staying stale until a remount.
syncLocaleToI18n(() => localeStore.current, locale, setLocale)

// Hydrate all stores in parallel, then restore the user's saved locale.
// Stores are now async (Plan 2) so we await before reading localeStore.current.
onMounted(async () => {
  // On a hard reload this runs against the noop adapter (the session isn't in
  // the store yet); useAuth().init() re-pulls the data stores on INITIAL_SESSION
  // once getSession() resolves. The adapter now throws on a Supabase error, so
  // guard the pull: a transient failure must not become an unhandled rejection
  // or trigger a destructive re-seed — the stores keep their last-known state.
  try {
    await Promise.all([
      useGrammarStore().hydrate(),
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
      useActivityStore().hydrate(),
      localeStore.hydrate(),
      useEscapeRoomProgress().hydrate(),
      useCustomDecksStore().hydrate(),
    ])
  } catch (err) {
    console.error('default.vue: store hydration failed', err)
  }
  // Cloud preferences win: override the device theme/locale just loaded above.
  // The syncLocaleToI18n watch above carries the resulting localeStore.current
  // into the i18n runtime — no explicit setLocale needed here.
  await useSettingsStore().hydrate()
  // Opt-in return-visit nudge: settings (opt-in) + srs/log (readyCount) are
  // hydrated now, so the decision is accurate.
  reminder.check()
})
</script>

<template>
  <AppShell>
    <DataErrorBanner />
    <ReviewReminderBanner
      v-if="reminder.show.value"
      :count="reminder.count.value"
      @dismiss="reminder.dismiss"
    />
    <slot />
  </AppShell>
</template>
