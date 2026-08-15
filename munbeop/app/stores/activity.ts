import { defineStore } from 'pinia'
import type { ActivityDay } from '~/lib/stats/activity'
import { localDayKey } from '~/lib/stats/activity'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'

type ActivityMap = Record<string, ActivityDay>

export const useActivityStore = defineStore('activity', () => {
  const map = ref<ActivityMap>({})
  const writeQueues = new Map<string, Promise<void>>()
  let hydratedUserId: string | null = null

  async function hydrate() {
    const userId = useAuthStore().user?.id ?? null
    const storage = useStorageAdapter()
    const cloud = await storage.read(STORAGE_KEYS.activity, {} as ActivityMap)
    if ((useAuthStore().user?.id ?? null) !== userId) return
    map.value = cloud
    hydratedUserId = userId
  }

  /** Count one study answer in today's local-day bucket; upsert that one row.
   *  The cloud write is best-effort bookkeeping fired after every answer, so a
   *  transient network failure is swallowed HERE (single point of truth) —
   *  every fire-and-forget call site must never surface it as an unhandled
   *  rejection that floods the first-party error sink. The in-memory tick
   *  already happened; the next successful upsert carries the full count. */
  async function record(now: number = Date.now()) {
    const userId = useAuthStore().user?.id
    // A full-row absolute count is only safe after this account's prior count
    // has loaded. Otherwise a transient read failure followed by a successful
    // write could replace (for example) 50 remote answers with 1.
    if (userId && hydratedUserId !== userId) return
    const storage = useStorageAdapter()
    const key = localDayKey(now)
    const next: ActivityDay = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    const previous = writeQueues.get(key) ?? Promise.resolve()
    const task = previous.catch(() => undefined).then(async () => {
      try {
        await storage.upsertOne(STORAGE_KEYS.activity, { id: key, value: next })
      } catch {
        // transient cloud error — see above
      }
    })
    writeQueues.set(key, task)
    void task.then(() => {
      if (writeQueues.get(key) === task) writeQueues.delete(key)
    })
    await task
  }

  return { map, hydrate, record }
})
