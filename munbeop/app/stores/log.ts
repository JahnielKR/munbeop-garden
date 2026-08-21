import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState, ErrorDimension } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

export const useLogStore = defineStore('log', () => {
  const entries = ref<LogEntry[]>([])

  async function hydrate() {
    const storage = useStorageAdapter()
    const raw = await storage.read(STORAGE_KEYS.log, [] as LogEntry[])
    entries.value = raw.map((e) => ({
      ...e,
      reviewState: (e.reviewState ?? 'unreviewed') as ReviewState,
      errorNote: e.errorNote ?? null,
    }))
  }

  async function add(p: {
    ko: string
    sentence: string
    feedback: Feedback
    errorNote: string | null
    errorDimension?: ErrorDimension | null
    reviewState: ReviewState
    contextId: string
    contextName: string
  }): Promise<LogEntry> {
    const storage = useStorageAdapter()
    const optimisticEntry: LogEntry = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
      ...p,
    }
    // Immutable prepend (newest first) + snapshot so a failed cloud write rolls
    // back cleanly. A reference filter wouldn't work here: Vue re-proxies the
    // pushed object, so the proxy read back !== the raw entry.
    const snapshot = entries.value
    entries.value = [optimisticEntry, ...entries.value]
    // Append the one new row instead of re-writing the whole log — an add is
    // O(1), not O(history). (setReviewState still does a full write; it edits
    // an existing row and fires rarely.)
    try {
      const savedEntry = await storage.append(STORAGE_KEYS.log, optimisticEntry)
      // Supabase returns the Postgres-generated bigserial. Replace the
      // temporary optimistic id before any review/delete action can use it.
      entries.value = entries.value.map((entry) =>
        entry.id === optimisticEntry.id ? savedEntry : entry,
      )
      return savedEntry
    } catch (e) {
      // Roll back the optimistic insert so a failed cloud write doesn't leave a
      // phantom entry in memory — that would duplicate on retry and inflate the
      // journal/stats. Rethrow so the practice loop can preserve the sentence
      // and surface a retry (see usePractice.persistEntry).
      entries.value = snapshot
      throw e
    }
  }

  /** Delete one journal entry by id. Optimistic with snapshot + rollback (one
   *  row deleted in the cloud, not a whole-log rewrite). Returns false if the id
   *  isn't present or the cloud delete fails. */
  async function deleteEntry(id: number): Promise<boolean> {
    if (!entries.value.some((e) => e.id === id)) return false
    const snapshot = entries.value
    entries.value = entries.value.filter((e) => e.id !== id)
    const storage = useStorageAdapter()
    try {
      await storage.deleteOne(STORAGE_KEYS.log, id)
    } catch {
      entries.value = snapshot
      return false
    }
    return true
  }

  async function setReviewState(
    id: number,
    reviewState: ReviewState,
    errorNote: string | null = null,
  ): Promise<boolean> {
    const storage = useStorageAdapter()
    const entry = entries.value.find((e) => e.id === id)
    if (!entry) return false
    const snapshot = entries.value
    const next = { ...entry, reviewState, errorNote }
    entries.value = entries.value.map((value) => (value.id === id ? next : value))
    try {
      await storage.upsertOne(STORAGE_KEYS.log, { id, value: next })
      return true
    } catch {
      entries.value = snapshot
      return false
    }
  }

  return { entries, hydrate, add, deleteEntry, setReviewState }
})
