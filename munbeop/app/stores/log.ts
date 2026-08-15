import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState, ErrorDimension } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'

export const useLogStore = defineStore('log', () => {
  const entries = ref<LogEntry[]>([])
  const entryMutationTails = new Map<number, Promise<void>>()
  const activeMutations = new Set<Promise<unknown>>()
  const authStore = useAuthStore()
  let hydrationBarrier: Promise<void> = Promise.resolve()
  let hydrationPending = 0
  let hydratedUserId: string | null = null

  /** Serialize mutations of the same journal row while allowing unrelated rows
   * to save concurrently. This makes rapid review flips deterministic and
   * prevents a delayed update/delete response from undoing the newer action. */
  function enqueueEntryMutation<T>(id: number, run: () => Promise<T>): Promise<T> {
    const previous = entryMutationTails.get(id)
    const barrier = hydrationBarrier
    const afterHydration = () => previous ? previous.then(run) : run()
    const job = hydrationPending > 0 ? barrier.then(afterHydration) : afterHydration()
    activeMutations.add(job)
    const settled = job.then(() => undefined, () => undefined)
    entryMutationTails.set(id, settled)
    void settled.then(() => {
      activeMutations.delete(job)
      if (entryMutationTails.get(id) === settled) entryMutationTails.delete(id)
    })
    return job
  }

  /**
   * Generate an integer that Postgres `bigint` can store and JavaScript can
   * represent exactly. The old `Date.now() + Math.random()` scheme lost its
   * fractional tiebreaker in the Supabase adapter (`Math.floor`), so two users
   * answering in the same millisecond could target the same global id. A
   * cryptographically-random 53-bit integer makes collisions negligible while
   * keeping the current numeric domain/API intact.
   */
  function createEntryId(): number {
    const words = new Uint32Array(2)
    for (let attempt = 0; attempt < 16; attempt++) {
      globalThis.crypto.getRandomValues(words)
      // 21 high bits + 32 low bits = Number.MAX_SAFE_INTEGER's 53 bits.
      const id = (words[0]! & 0x1f_ffff) * 0x1_0000_0000 + words[1]!
      if (id > 0 && !entries.value.some((entry) => entry.id === id)) return id
    }
    throw new Error('Unable to generate a unique journal id')
  }

  function hydrate(): Promise<void> {
    const userId = authStore.user?.id ?? null
    hydrationPending += 1
    const previousBarrier = hydrationBarrier
    const priorMutations = [...activeMutations]
    const hydration = previousBarrier
      .catch(() => undefined)
      .then(() => Promise.allSettled(priorMutations))
      .then(async () => {
        if ((authStore.user?.id ?? null) !== userId) return
        const storage = useStorageAdapter()
        const raw = await storage.read(STORAGE_KEYS.log, [] as LogEntry[])
        if ((authStore.user?.id ?? null) !== userId) return
        entries.value = raw.map((entry) => ({
          ...entry,
          reviewState: (entry.reviewState ?? 'unreviewed') as ReviewState,
          errorNote: entry.errorNote ?? null,
        }))
        hydratedUserId = userId
      })
      .finally(() => { hydrationPending -= 1 })
    hydrationBarrier = hydration.then(() => undefined, () => undefined)
    return hydration
  }

  function safeForUser(userId: string | null): boolean {
    return (authStore.user?.id ?? null) === userId
      && (!userId || hydratedUserId === userId)
  }

  function add(p: {
    ko: string
    sentence: string
    feedback: Feedback
    errorNote: string | null
    errorDimension?: ErrorDimension | null
    reviewState: ReviewState
    contextId: string
    contextName: string
  }, stableId: number = createEntryId()): Promise<LogEntry> {
    if (!Number.isSafeInteger(stableId) || stableId <= 0) {
      return Promise.reject(new TypeError('Journal id must be a positive safe integer'))
    }
    const userId = authStore.user?.id ?? null
    return enqueueEntryMutation(stableId, async () => {
      if (!safeForUser(userId)) {
        throw new Error('Journal data is unavailable until account data loads')
      }
      const storage = useStorageAdapter()
      const existing = entries.value.find((candidate) => candidate.id === stableId)
      // Re-send an existing stable id to confirm an ambiguous prior request.
      // The adapter's append path is an idempotent one-row upsert.
      if (existing) {
        await storage.append(STORAGE_KEYS.log, existing)
        return existing
      }
      const entry: LogEntry = {
        id: stableId,
        date: new Date().toISOString(),
        ...p,
      }
      entries.value = [entry, ...entries.value]
      try {
        await storage.append(STORAGE_KEYS.log, entry)
      } catch (e) {
        // Remove ONLY this failed optimistic row. A caller can retry with the
        // same stableId without duplicating a remotely committed event.
        entries.value = entries.value.filter((candidate) => candidate.id !== entry.id)
        throw e
      }
      return entry
    })
  }

  /** Delete one journal entry by id. Optimistic with row-scoped rollback (one
   *  row deleted in the cloud, not a whole-log rewrite). Returns false if the id
   *  isn't present or the cloud delete fails. */
  function deleteEntry(id: number): Promise<boolean> {
    const userId = authStore.user?.id ?? null
    return enqueueEntryMutation(id, async () => {
      if (!safeForUser(userId)) return false
      const idx = entries.value.findIndex((e) => e.id === id)
      if (idx === -1) return false
      const removed = entries.value[idx]!
      entries.value = entries.value.filter((e) => e.id !== id)
      const storage = useStorageAdapter()
      try {
        await storage.deleteOne(STORAGE_KEYS.log, id)
      } catch {
        // Re-insert ONLY the removed row into the CURRENT array. Same-row
        // mutations are queued; mutations of sibling rows remain untouched.
        const next = [...entries.value]
        next.splice(Math.min(idx, next.length), 0, removed)
        entries.value = next
        return false
      }
      return true
    })
  }

  /** Flip one entry's review state. Optimistic with snapshot + rollback, same
   *  discipline as add()/deleteEntry(): a failed cloud write must not leave the
   *  UI claiming "reviewed" (the garden rain clears off isPendingReview) while
   *  the cloud still says pending. Returns false when the id is unknown or the
   *  write fails, so the caller can surface a retry. */
  function setReviewState(
    id: number,
    reviewState: ReviewState,
    errorNote: string | null = null,
  ): Promise<boolean> {
    const userId = authStore.user?.id ?? null
    return enqueueEntryMutation(id, async () => {
      if (!safeForUser(userId)) return false
      const prev = entries.value.find((e) => e.id === id)
      if (!prev) return false
      const storage = useStorageAdapter()
      const next = { ...prev, reviewState, errorNote }
      entries.value = entries.value.map((e) => (e.id === id ? next : e))
      try {
        // A one-row UPDATE cannot prune siblings or resurrect a concurrently
        // deleted row. Same-row requests are serialized by the queue above.
        const updated = await storage.updateOne(STORAGE_KEYS.log, { id, value: next })
        if (!updated) {
          // Another tab deleted the row. Reconcile local state to that winning
          // delete instead of reporting a successful review of a ghost entry.
          entries.value = entries.value.filter((entry) => entry.id !== id)
          return false
        }
      } catch {
        entries.value = entries.value.map((e) => (e.id === id ? prev : e))
        return false
      }
      return true
    })
  }

  return { entries, hydrate, createEntryId, add, deleteEntry, setReviewState }
})
