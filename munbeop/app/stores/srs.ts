import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight, recalculateMastery } from '~/lib/srs'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAppStatus } from '~/stores/appStatus'
import { useAuthStore } from '~/stores/auth'
import { useLogStore } from './log'

type SrsMap = Record<string, SrsState>

export const useSrsStore = defineStore('srs', () => {
  const map = ref<SrsMap>({})
  const writeQueues = new Map<string, Promise<void>>()
  let hydratedUserId: string | null = null

  async function hydrate() {
    const userId = useAuthStore().user?.id ?? null
    const storage = useStorageAdapter()
    const cloud = await storage.read(STORAGE_KEYS.srs, {} as SrsMap)
    if ((useAuthStore().user?.id ?? null) !== userId) return
    map.value = cloud
    hydratedUserId = userId
  }

  function ensure(ko: string): SrsState {
    if (!map.value[ko]) map.value[ko] = freshSrs()
    return map.value[ko]!
  }

  /** Read a ko's SRS state WITHOUT creating a row — for render/computed reads
   * (creating a seedling on mere display polluted mastery stats). */
  function peek(ko: string): SrsState {
    return map.value[ko] ?? freshSrs()
  }

  function weightFor(ko: string, now: number = Date.now()): number {
    // peek(), NOT ensure(): weighting the draw pool touches every catalog ko,
    // so ensure() would fabricate a seedling row for each untouched grammar and
    // pollute mastery/garden/due stats for the rest of the session. getWeight
    // only reads, so a by-value freshSrs() gives the identical weight.
    return getWeight(peek(ko), now)
  }

  /**
   * True when the tracked data load failed. SRS writes are refused in this
   * state: after a hydration failure (a network blip at login leaves a
   * non-blocking DataErrorBanner up but the app still navigable) the srs map
   * AND/OR the log are empty, so markSeen/recalculate would upsert a zeroed
   * freshSrs / mastery OVER the user's real cloud row — clobbering
   * easy/hard/mastery for every grammar touched that session, via the main
   * practice loop or any lab. appStatus (not this store's own read success) is
   * the authoritative signal: recalculate derives its value from the LOG store,
   * so a log-load failure with a successful srs load must still block. A
   * page-level re-hydrate that fails WITHOUT going through appStatus (e.g. the
   * ruleta revisit pull) leaves status 'ready' and the in-memory map intact, so
   * writes correctly proceed against the retained real data.
   */
  function writesBlocked(): boolean {
    const userId = useAuthStore().user?.id
    const dataStatus = useAppStatus().status
    return dataStatus === 'error' || (
      !!userId && (hydratedUserId !== userId || dataStatus !== 'ready')
    )
  }

  /**
   * Keep writes for one grammar point in invocation order. A session-level
   * markSeen can still be in flight when a fast learner submits an answer;
   * without this queue its older snapshot could land after recalculate and
   * overwrite the newer mastery remotely. Different grammar points remain
   * independent and can persist in parallel.
   */
  function enqueueWrite(ko: string, write: () => Promise<void>): Promise<void> {
    const queuedUserId = useAuthStore().user?.id ?? null
    const previous = writeQueues.get(ko) ?? Promise.resolve()
    const task = previous.catch(() => undefined).then(async () => {
      if ((useAuthStore().user?.id ?? null) !== queuedUserId) return
      if (writesBlocked()) return
      await write()
    })
    writeQueues.set(ko, task)
    void task.then(
      () => { if (writeQueues.get(ko) === task) writeQueues.delete(ko) },
      () => { if (writeQueues.get(ko) === task) writeQueues.delete(ko) },
    )
    return task
  }

  async function markSeen(ko: string, now: number = Date.now()) {
    if (writesBlocked()) return
    await enqueueWrite(ko, async () => {
      const storage = useStorageAdapter()
      const next = { ...ensure(ko), lastSeen: now }
      map.value[ko] = next
      // Upsert just this ko's row, not the whole map (the session start fires
      // several markSeen in parallel; a full-map write each time is O(catalog)).
      await storage.upsertOne(STORAGE_KEYS.srs, { id: ko, value: next })
    })
  }

  async function recalculate(ko: string) {
    if (writesBlocked()) return
    await enqueueWrite(ko, async () => {
      const storage = useStorageAdapter()
      const log = useLogStore().entries
      const next = recalculateMastery(ko, log)
      map.value[ko] = next
      await storage.upsertOne(STORAGE_KEYS.srs, { id: ko, value: next })
    })
  }

  return { map, hydrate, ensure, peek, weightFor, markSeen, recalculate }
})
