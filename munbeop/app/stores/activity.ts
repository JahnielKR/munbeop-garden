import { defineStore } from 'pinia'
import type { ActivityDay } from '~/lib/stats/activity'
import { localDayKey } from '~/lib/stats/activity'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'

type ActivityMap = Record<string, ActivityDay>

export const useActivityStore = defineStore('activity', () => {
  const map = ref<ActivityMap>({})
  const pending = new Map<string, number>()
  const flushing = new Map<string, Promise<boolean>>()
  let storageEpoch = 0
  let hydratedUserId: string | null = null

  async function hydrate() {
    const epoch = ++storageEpoch
    const userId = useAuthStore().user?.id ?? null
    pending.clear()
    flushing.clear()
    const storage = useStorageAdapter()
    const stored = await storage.read(STORAGE_KEYS.activity, {} as ActivityMap)
    if (epoch !== storageEpoch || (useAuthStore().user?.id ?? null) !== userId) return
    map.value = stored
    hydratedUserId = userId
  }

  function flush(
    key: string,
    storage: ReturnType<typeof useStorageAdapter>,
    epoch: number,
  ): Promise<boolean> {
    const active = flushing.get(key)
    if (active) return active

    const task = (async () => {
      while (epoch === storageEpoch) {
        const delta = pending.get(key) ?? 0
        if (delta === 0) return true
        pending.set(key, 0)

        try {
          const persisted = await storage.increment(STORAGE_KEYS.activity, key, delta)
          if (epoch !== storageEpoch) return false
          if (persisted !== null) {
            const localCount = map.value[key]?.count ?? 0
            map.value[key] = { count: Math.max(localCount, persisted) }
          }
        } catch {
          if (epoch === storageEpoch) {
            pending.set(key, (pending.get(key) ?? 0) + delta)
          }
          return false
        }
      }
      return false
    })()

    flushing.set(key, task)
    const release = () => {
      if (flushing.get(key) === task) flushing.delete(key)
    }
    void task.then(release, release)
    return task
  }

  /** Count one answer and atomically flush all unsynced ticks for this day. */
  async function record(now: number = Date.now()): Promise<boolean> {
    const userId = useAuthStore().user?.id
    if (userId && hydratedUserId !== userId) return false
    const storage = useStorageAdapter()
    const key = localDayKey(now)
    const next: ActivityDay = { count: (map.value[key]?.count ?? 0) + 1 }
    map.value[key] = next
    pending.set(key, (pending.get(key) ?? 0) + 1)
    return flush(key, storage, storageEpoch)
  }

  return { map, hydrate, record }
})
