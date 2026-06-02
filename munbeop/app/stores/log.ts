import { defineStore } from 'pinia'
import type { LogEntry, Feedback, ReviewState } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'

interface LogState {
  entries: LogEntry[]
}

const storage = new LocalStorageAdapter()

export const useLogStore = defineStore('log', {
  state: (): LogState => ({ entries: [] }),
  actions: {
    hydrate() {
      const raw = storage.read(STORAGE_KEYS.log, [] as LogEntry[])
      this.entries = raw.map((e) => ({
        ...e,
        reviewState: (e.reviewState ?? 'unreviewed') as ReviewState,
        errorNote: e.errorNote ?? null,
      }))
    },
    add(p: {
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
      this.entries.unshift(entry)
      storage.write(STORAGE_KEYS.log, this.entries)
      return entry
    },
    setReviewState(id: number, reviewState: ReviewState, errorNote: string | null = null) {
      const entry = this.entries.find((e) => e.id === id)
      if (!entry) return
      entry.reviewState = reviewState
      entry.errorNote = errorNote
      storage.write(STORAGE_KEYS.log, this.entries)
    },
  },
})
