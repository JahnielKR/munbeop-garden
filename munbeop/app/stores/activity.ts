import { defineStore } from 'pinia'
import type { ActivityDay } from '~/lib/stats/activity'
import { localDayKey } from '~/lib/stats/activity'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

type ActivityMap = Record<string, ActivityDay>

export const useActivityStore = defineStore('activity', () => {
  const map = ref<ActivityMap>({})

  async function hydrate() {
    const storage = useStorageAdapter()
    map.value = await storage.read(STORAGE_KEYS.activity, {} as ActivityMap)
  }

  /** Count one study answer in today's local-day bucket; upsert that one row.
   *  The cloud write is best-effort bookkeeping fired after every answer, so a
   *  transient network failure is swallowed HERE (single point of truth) —
   *  every fire-and-forget call site must never surface it as an unhandled
   *  rejection that floods the first-party error sink. The in-memory tick
   *  already happened; the next successful upsert carries the full count. */
  async function record(now: number = Date.now()) {
    const storage = useStorageAdapter()
    const key = localDayKey(now)
    const next: ActivityDay = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    try {
      await storage.upsertOne(STORAGE_KEYS.activity, { id: key, value: next })
    } catch {
      // transient cloud error — see above
    }
  }

  return { map, hydrate, record }
})
