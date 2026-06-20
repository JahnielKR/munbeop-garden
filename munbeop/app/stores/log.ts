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
    const entry: LogEntry = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
      ...p,
    }
    entries.value.unshift(entry)
    // Append the one new row instead of re-writing the whole log — an add is
    // O(1), not O(history). (setReviewState still does a full write; it edits
    // an existing row and fires rarely.)
    await storage.append(STORAGE_KEYS.log, entry)
    return entry
  }

  async function setReviewState(
    id: number,
    reviewState: ReviewState,
    errorNote: string | null = null,
  ) {
    const storage = useStorageAdapter()
    const entry = entries.value.find((e) => e.id === id)
    if (!entry) return
    entry.reviewState = reviewState
    entry.errorNote = errorNote
    await storage.write(STORAGE_KEYS.log, entries.value)
  }

  return { entries, hydrate, add, setReviewState }
})
