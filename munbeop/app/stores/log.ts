import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState, ErrorDimension } from '~/lib/domain'
import { captureLocalTime } from '~/lib/activity/event'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useAuthStore } from '~/stores/auth'
import { useSrsStore } from '~/stores/srs'
import { broadcastAccountSync } from '~/lib/sync/channel'

export const useLogStore = defineStore('log', () => {
  const entries = ref<LogEntry[]>([])
  const entryMutationTails = new Map<number, Promise<void>>()
  const activeMutations = new Set<Promise<unknown>>()
  const retryEntries = new Map<string, LogEntry>()
  const authStore = useAuthStore()
  let hydrationBarrier: Promise<void> = Promise.resolve()
  let hydrationPending = 0
  let hydratedUserId: string | null = null
  let hydratedAccountEpoch = -1

  /** Serialize mutations of the same journal row while allowing unrelated rows
   * to save concurrently. This makes rapid review flips deterministic and
   * prevents a delayed update/delete response from undoing the newer action. */
  function enqueueEntryMutation<T>(id: number, run: () => Promise<T>): Promise<T> {
    const previous = entryMutationTails.get(id)
    const barrier = hydrationBarrier
    const afterHydration = () => (previous ? previous.then(run) : run())
    const job = hydrationPending > 0 ? barrier.then(afterHydration) : afterHydration()
    activeMutations.add(job)
    const settled = job.then(
      () => undefined,
      () => undefined,
    )
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
    const accountEpoch = authStore.accountEpoch
    if (hydratedUserId !== userId || hydratedAccountEpoch !== accountEpoch) retryEntries.clear()
    hydrationPending += 1
    const previousBarrier = hydrationBarrier
    const priorMutations = [...activeMutations]
    const hydration = previousBarrier
      .catch(() => undefined)
      .then(() => Promise.allSettled(priorMutations))
      .then(async () => {
        if ((authStore.user?.id ?? null) !== userId || authStore.accountEpoch !== accountEpoch)
          return
        const storage = useStorageAdapter()
        const raw = await storage.read(STORAGE_KEYS.log, [] as LogEntry[])
        if ((authStore.user?.id ?? null) !== userId || authStore.accountEpoch !== accountEpoch)
          return
        entries.value = raw.map((entry) => ({
          ...entry,
          reviewState: (entry.reviewState ?? 'unreviewed') as ReviewState,
          errorNote: entry.errorNote ?? null,
          revision: entry.revision ?? 0,
        }))
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

  function safeForUser(userId: string | null, accountEpoch: number): boolean {
    return (
      (authStore.user?.id ?? null) === userId &&
      authStore.accountEpoch === accountEpoch &&
      (!userId || (hydratedUserId === userId && hydratedAccountEpoch === accountEpoch))
    )
  }

  function retryKey(userId: string | null, accountEpoch: number, id: number): string {
    return `${userId ?? 'signed-out'}:${accountEpoch}:${id}`
  }

  function sameDraft(entry: LogEntry, draft: Parameters<typeof add>[0]): boolean {
    return (
      entry.ko === draft.ko &&
      entry.sentence === draft.sentence &&
      entry.feedback === draft.feedback &&
      entry.errorNote === draft.errorNote &&
      (entry.errorDimension ?? null) === (draft.errorDimension ?? null) &&
      entry.reviewState === draft.reviewState &&
      entry.contextId === draft.contextId &&
      entry.contextName === draft.contextName
    )
  }

  function applyAuthoritativeEntry(entry: LogEntry): void {
    const current = entries.value.find((candidate) => candidate.id === entry.id)
    if (current && (current.revision ?? 0) > (entry.revision ?? 0)) return
    entries.value = entries.value.map((candidate) =>
      candidate.id === entry.id ? { ...entry, revision: entry.revision ?? 0 } : candidate,
    )
  }

  function add(
    p: {
      ko: string
      sentence: string
      feedback: Feedback
      errorNote: string | null
      errorDimension?: ErrorDimension | null
      reviewState: ReviewState
      contextId: string
      contextName: string
    },
    stableId: number = createEntryId(),
  ): Promise<LogEntry> {
    if (!Number.isSafeInteger(stableId) || stableId <= 0) {
      return Promise.reject(new TypeError('Journal id must be a positive safe integer'))
    }
    const userId = authStore.user?.id ?? null
    const accountEpoch = authStore.accountEpoch
    return enqueueEntryMutation(stableId, async () => {
      if (!safeForUser(userId, accountEpoch)) {
        throw new Error('Journal data is unavailable until account data loads')
      }
      const storage = useStorageAdapter()
      const existing = entries.value.find((candidate) => candidate.id === stableId)
      const key = retryKey(userId, accountEpoch, stableId)
      const retry = retryEntries.get(key)
      if (existing && !sameDraft(existing, p)) {
        throw new Error('A journal id was reused with different content')
      }
      if (retry && !sameDraft(retry, p)) {
        throw new Error('A journal retry id was reused with different content')
      }
      const localTime = captureLocalTime()
      // Keep the complete first payload (including occurredAt) across an
      // ambiguous response loss. Idempotency requires stable content as well
      // as a stable id; recreating Date.now() on retry would be a conflict.
      const entry: LogEntry = existing ??
        retry ?? {
          id: stableId,
          date: localTime.occurredAt,
          localDay: localTime.localDay,
          timeZone: localTime.timeZone,
          utcOffsetMinutes: localTime.utcOffsetMinutes,
          revision: 0,
          ...p,
        }
      const insertedOptimistically = !existing
      if (insertedOptimistically) entries.value = [entry, ...entries.value]
      try {
        const result = await storage.saveJournalEntry(entry)
        if (safeForUser(userId, accountEpoch) && result) {
          applyAuthoritativeEntry(result.entry)
          useSrsStore().applyAuthoritative(result.progress)
          if (userId) broadcastAccountSync({ type: 'journal-mutated', userId })
        }
        retryEntries.delete(key)
      } catch (e) {
        if (safeForUser(userId, accountEpoch)) {
          if (insertedOptimistically) {
            entries.value = entries.value.filter((candidate) => candidate.id !== entry.id)
          }
          retryEntries.set(key, entry)
        }
        throw e
      }
      return entries.value.find((candidate) => candidate.id === stableId) ?? entry
    })
  }

  /** Delete one journal entry by id. Optimistic with row-scoped rollback (one
   *  row deleted in the cloud, not a whole-log rewrite). Returns false if the id
   *  isn't present or the cloud delete fails. */
  function deleteEntry(id: number): Promise<boolean> {
    const userId = authStore.user?.id ?? null
    const accountEpoch = authStore.accountEpoch
    return enqueueEntryMutation(id, async () => {
      if (!safeForUser(userId, accountEpoch)) return false
      const idx = entries.value.findIndex((e) => e.id === id)
      if (idx === -1) return false
      const removed = entries.value[idx]!
      entries.value = entries.value.filter((e) => e.id !== id)
      const storage = useStorageAdapter()
      try {
        const result = await storage.deleteJournalEntry({
          id,
          expectedKo: removed.ko,
          expectedRevision: removed.revision ?? 0,
        })
        if (safeForUser(userId, accountEpoch) && result) {
          useSrsStore().applyAuthoritative(result.progress)
          if (userId) broadcastAccountSync({ type: 'journal-mutated', userId })
        }
      } catch {
        // Re-insert ONLY the removed row into the CURRENT array. Same-row
        // mutations are queued; mutations of sibling rows remain untouched.
        if (safeForUser(userId, accountEpoch)) {
          const next = [...entries.value]
          next.splice(Math.min(idx, next.length), 0, removed)
          entries.value = next
        }
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
    const accountEpoch = authStore.accountEpoch
    return enqueueEntryMutation(id, async () => {
      if (!safeForUser(userId, accountEpoch)) return false
      const prev = entries.value.find((e) => e.id === id)
      if (!prev) return false
      const changed = prev.reviewState !== reviewState || prev.errorNote !== errorNote
      if (!changed) return true
      const storage = useStorageAdapter()
      const next = {
        ...prev,
        reviewState,
        errorNote,
        revision: (prev.revision ?? 0) + 1,
      }
      entries.value = entries.value.map((e) => (e.id === id ? next : e))
      try {
        const result = await storage.setJournalReview({
          id,
          reviewState,
          errorNote,
          expectedRevision: prev.revision ?? 0,
        })
        if (safeForUser(userId, accountEpoch) && result) {
          applyAuthoritativeEntry(result.entry)
          useSrsStore().applyAuthoritative(result.progress)
          if (userId) broadcastAccountSync({ type: 'journal-mutated', userId })
        }
      } catch {
        if (safeForUser(userId, accountEpoch)) {
          entries.value = entries.value.map((e) => (e.id === id ? prev : e))
        }
        return false
      }
      return true
    })
  }

  return { entries, hydrate, createEntryId, add, deleteEntry, setReviewState }
})
