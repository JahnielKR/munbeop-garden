import { defineStore } from 'pinia'
import type { ActivityDay } from '~/lib/stats/activity'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { createActivityEvent, type ActivityEvent, type ActivitySource } from '~/lib/activity/event'
import {
  acknowledgeActivityEvents,
  enqueueActivityEvent,
  listActivityEvents,
} from '~/lib/activity/outbox'
import { broadcastAccountSync } from '~/lib/sync/channel'

type ActivityMap = Record<string, ActivityDay>

function pendingByDay(events: readonly ActivityEvent[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const event of events) counts.set(event.localDay, (counts.get(event.localDay) ?? 0) + 1)
  return counts
}

function withPending(remote: ActivityMap, events: readonly ActivityEvent[]): ActivityMap {
  const merged: ActivityMap = structuredClone(remote)
  for (const [day, count] of pendingByDay(events)) {
    merged[day] = { count: (merged[day]?.count ?? 0) + count }
  }
  return merged
}

export const useActivityStore = defineStore('activity', () => {
  const map = ref<ActivityMap>({})
  let storageEpoch = 0
  let hydratedUserId: string | null = null
  let flushing: Promise<boolean> | null = null

  function identityIsCurrent(userId: string, epoch: number): boolean {
    return (
      epoch === storageEpoch &&
      hydratedUserId === userId &&
      (useAuthStore().user?.id ?? null) === userId
    )
  }

  async function applyAuthoritativeTotals(
    userId: string,
    totalsByDay: Record<string, number>,
  ): Promise<void> {
    const remaining = pendingByDay(listActivityEvents(userId))
    for (const [day, total] of Object.entries(totalsByDay)) {
      map.value[day] = { count: total + (remaining.get(day) ?? 0) }
    }
  }

  async function flushPending(): Promise<boolean> {
    if (flushing) return flushing

    const userId = useAuthStore().user?.id ?? null
    const epoch = storageEpoch
    if (!userId || hydratedUserId !== userId) return false
    const storage = useStorageAdapter()

    const task = (async () => {
      try {
        while (identityIsCurrent(userId, epoch)) {
          const batch = listActivityEvents(userId).slice(0, 100)
          if (batch.length === 0) return true

          const result = await storage.recordActivityEvents(batch)
          if (!result || !identityIsCurrent(userId, epoch)) return false

          const sentIds = new Set(batch.map((event) => event.eventId))
          const acknowledged = result.acknowledgedIds.filter((id) => sentIds.has(id))
          if (acknowledged.length === 0) return false

          acknowledgeActivityEvents(userId, acknowledged)
          await applyAuthoritativeTotals(userId, result.totalsByDay)
          broadcastAccountSync({ type: 'activity-acknowledged', userId })
        }
      } catch {
        return false
      }
      return false
    })()

    flushing = task
    try {
      return await task
    } finally {
      if (flushing === task) flushing = null
    }
  }

  async function hydrate() {
    const epoch = ++storageEpoch
    const userId = useAuthStore().user?.id ?? null
    hydratedUserId = null
    flushing = null

    if (!userId) {
      map.value = {}
      return
    }

    const storage = useStorageAdapter()
    const stored = await storage.read(STORAGE_KEYS.activity, {} as ActivityMap)
    if (epoch !== storageEpoch || (useAuthStore().user?.id ?? null) !== userId) return

    hydratedUserId = userId
    map.value = withPending(stored, listActivityEvents(userId))
    await flushPending()
  }

  /** Count one committed answer and flush the durable, user-scoped outbox. */
  async function record(source: ActivitySource, now: number = Date.now()): Promise<boolean> {
    const userId = useAuthStore().user?.id ?? null
    if (!userId || hydratedUserId !== userId) return false

    const event = createActivityEvent(source, now)
    map.value[event.localDay] = { count: (map.value[event.localDay]?.count ?? 0) + 1 }
    enqueueActivityEvent(userId, event)
    broadcastAccountSync({ type: 'activity-enqueued', userId })
    return flushPending()
  }

  return { map, hydrate, record, flushPending }
})
