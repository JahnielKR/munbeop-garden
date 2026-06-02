import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

const storage = new LocalStorageAdapter()

export const useLogStore = defineStore('log', () => {
  const entries = ref<LogEntry[]>([])

  function hydrate() {
    const raw = storage.read(STORAGE_KEYS.log, [] as LogEntry[])
    entries.value = raw.map((e) => ({
      ...e,
      reviewState: (e.reviewState ?? 'unreviewed') as ReviewState,
      errorNote: e.errorNote ?? null,
    }))
  }

  function add(p: {
    ko: string
    sentence: string
    feedback: Feedback
    errorNote: string | null
    reviewState: ReviewState
    contextId: string
    contextName: string
  }): LogEntry {
    const entry: LogEntry = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
      ...p,
    }
    entries.value.unshift(entry)
    storage.write(STORAGE_KEYS.log, entries.value)
    return entry
  }

  function setReviewState(
    id: number,
    reviewState: ReviewState,
    errorNote: string | null = null,
  ) {
    const entry = entries.value.find((e) => e.id === id)
    if (!entry) return
    entry.reviewState = reviewState
    entry.errorNote = errorNote
    storage.write(STORAGE_KEYS.log, entries.value)
  }

  return { entries, hydrate, add, setReviewState }
})
