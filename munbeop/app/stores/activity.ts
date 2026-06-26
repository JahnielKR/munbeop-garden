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

  /** Count one study answer in today's local-day bucket; upsert that one row. */
  async function record(now: number = Date.now()) {
    const storage = useStorageAdapter()
    const key = localDayKey(now)
    const next: ActivityDay = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    await storage.upsertOne(STORAGE_KEYS.activity, { id: key, value: next })
  }

  return { map, hydrate, record }
})
