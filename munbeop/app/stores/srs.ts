import { defineStore } from 'pinia'
import type { SrsState } from '~/lib/domain'
import { freshSrs, getWeight } from '~/lib/srs'
import { STORAGE_KEYS } from '~/lib/storage'
import type { ProgressRecord } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAppStatus } from '~/stores/appStatus'
import { useAuthStore } from '~/stores/auth'

type SrsMap = Record<string, SrsState>

export const useSrsStore = defineStore('srs', () => {
  const map = ref<SrsMap>({})
  const authStore = useAuthStore()
  const writeQueues = new Map<string, Promise<void>>()
  let hydrationBarrier: Promise<void> = Promise.resolve()
  let hydrationPending = 0
  let hydratedUserId: string | null = null
  let hydratedAccountEpoch = -1

  function hydrate(): Promise<void> {
    const userId = authStore.user?.id ?? null
    const accountEpoch = authStore.accountEpoch
    hydrationPending += 1
    const priorWrites = [...writeQueues.values()]
    const hydration = hydrationBarrier
      .catch(() => undefined)
      .then(() => Promise.allSettled(priorWrites))
      .then(async () => {
        if ((authStore.user?.id ?? null) !== userId || authStore.accountEpoch !== accountEpoch)
          return
        const storage = useStorageAdapter()
        const cloud = await storage.read(STORAGE_KEYS.srs, {} as SrsMap)
        if ((authStore.user?.id ?? null) !== userId || authStore.accountEpoch !== accountEpoch)
          return
        map.value = Object.fromEntries(
          Object.entries(cloud).map(([ko, state]) => [
            ko,
            { ...state, revision: state.revision ?? 0 },
          ]),
        )
        hydratedUserId = userId
        hydratedAccountEpoch = accountEpoch
      })
      .finally(() => {
        hydrationPending -= 1
      })
    hydrationBarrier = hydration.then(
      () => undefined,
      () => undefined,
    )
    return hydration
  }

  /** Merge only a response at least as new as what this tab already knows. */
  function applyAuthoritative(progress: ProgressRecord): void {
    const current = map.value[progress.ko]
    if (current && (current.revision ?? 0) > (progress.revision ?? 0)) return
    const { ko, ...state } = progress
    map.value = { ...map.value, [ko]: state }
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
    const userId = authStore.user?.id
    const dataStatus = useAppStatus().status
    return (
      dataStatus === 'error' ||
      (!!userId &&
        (hydratedUserId !== userId ||
          hydratedAccountEpoch !== authStore.accountEpoch ||
          dataStatus !== 'ready'))
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
    const queuedUserId = authStore.user?.id ?? null
    const queuedAccountEpoch = authStore.accountEpoch
    const previous = writeQueues.get(ko) ?? Promise.resolve()
    const run = () =>
      previous
        .catch(() => undefined)
        .then(async () => {
          if (
            (authStore.user?.id ?? null) !== queuedUserId ||
            authStore.accountEpoch !== queuedAccountEpoch
          )
            return
          if (writesBlocked()) return
          await write()
        })
    const task = hydrationPending > 0 ? hydrationBarrier.then(run) : run()
    writeQueues.set(ko, task)
    void task.then(
      () => {
        if (writeQueues.get(ko) === task) writeQueues.delete(ko)
      },
      () => {
        if (writeQueues.get(ko) === task) writeQueues.delete(ko)
      },
    )
    return task
  }

  async function markSeen(ko: string, now: number = Date.now()) {
    if (writesBlocked()) return
    const ownerUserId = authStore.user?.id ?? null
    const ownerAccountEpoch = authStore.accountEpoch
    await enqueueWrite(ko, async () => {
      const storage = useStorageAdapter()
      const progress = await storage.markProgressSeen(ko, now)
      if (
        progress &&
        (authStore.user?.id ?? null) === ownerUserId &&
        authStore.accountEpoch === ownerAccountEpoch
      ) {
        applyAuthoritative(progress)
      }
    })
  }

  async function recalculate(ko: string) {
    if (writesBlocked()) return
    const ownerUserId = authStore.user?.id ?? null
    const ownerAccountEpoch = authStore.accountEpoch
    await enqueueWrite(ko, async () => {
      const storage = useStorageAdapter()
      const progress = await storage.recalculateProgress(ko)
      if (
        progress &&
        (authStore.user?.id ?? null) === ownerUserId &&
        authStore.accountEpoch === ownerAccountEpoch
      ) {
        applyAuthoritative(progress)
      }
    })
  }

  return { map, hydrate, ensure, peek, weightFor, applyAuthoritative, markSeen, recalculate }
})
