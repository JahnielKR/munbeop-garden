import { isActivityOutboxKey } from '~/lib/activity/outbox'
import { subscribeAccountSync } from '~/lib/sync/channel'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'
import { useAppStatus } from '~/stores/appStatus'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import { useSettingsStore } from '~/stores/settings'
import { useCustomDecksStore } from '~/stores/customDecks'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'

/** Retry durable activity events after connectivity and cross-tab changes. */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const activity = useActivityStore()
  const appStatus = useAppStatus()

  const flush = () => {
    if (auth.user?.id) void activity.flushPending()
  }
  const refreshActivity = () => {
    if (auth.user?.id) void activity.hydrate().catch(() => {})
  }
  const refreshJournal = () => {
    if (!auth.user?.id) return
    void Promise.all([useLogStore().hydrate(), useSrsStore().hydrate()]).catch(() => {})
  }
  const refreshAccount = () => {
    if (!auth.user?.id) return
    void appStatus.track(async () => {
      // Custom decks validate against the grammar catalog.
      await useGrammarStore().hydrate()
      await Promise.all([
        useContextsStore().hydrate(),
        useSrsStore().hydrate(),
        useLogStore().hydrate(),
        activity.hydrate(),
        useSettingsStore().hydrate(),
        useEscapeRoomProgress().hydrate(),
        useCustomDecksStore().hydrate(),
      ])
    })
  }
  const onVisibility = () => {
    if (document.visibilityState === 'visible') refreshActivity()
  }
  const onStorage = (event: StorageEvent) => {
    if (isActivityOutboxKey(event.key)) flush()
  }
  const unsubscribe = subscribeAccountSync((message) => {
    if (message.userId !== auth.user?.id) return
    if (message.type === 'activity-enqueued') flush()
    else if (message.type === 'journal-mutated') refreshJournal()
    else if (message.type === 'account-data-replaced') refreshAccount()
    else refreshActivity()
  })

  window.addEventListener('online', flush)
  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisibility)

  import.meta.hot?.dispose(() => {
    unsubscribe()
    window.removeEventListener('online', flush)
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisibility)
  })
})
