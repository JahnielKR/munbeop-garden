import type { StorageAdapter, StorageRestore } from './adapter'
import type { StorageKey } from './keys'
import type { ActivityBatchResult, ActivityEvent } from '~/lib/activity/event'
import type { LogEntry } from '~/lib/domain'
import type {
  JournalDeleteMutation,
  JournalDeleteMutationResult,
  JournalEntryMutationResult,
  JournalReviewMutation,
  ProgressRecord,
} from './journal'

/**
 * Adapter for the unauthenticated state. Accounts are mandatory
 * (2026-06-11), so no real storage backs a signed-out session — this
 * adapter only exists for the transient windows where store actions can
 * still run without a user (the gap between sign-out and the /welcome
 * redirect, or a hydrate racing session restore on boot).
 *
 * Reads resolve to their fallbacks, which is load-bearing: useAuth()
 * re-hydrates every store on SIGNED_OUT, and hydrating against this
 * adapter is what clears the previous user's data from memory.
 *
 * Writes are dropped SILENTLY on purpose: that same post-sign-out
 * hydration seed-writes defaults (grammar.hydrate persists
 * DEFAULT_GRAMMAR / TOPIK_DECKS when reads come back empty), so dropped
 * writes are an expected part of every sign-out, not a bug signal. The
 * seeded defaults live in memory only; the next sign-in re-hydrates
 * from Supabase.
 */
export class NoopStorageAdapter implements StorageAdapter {
  async read<T>(_key: StorageKey, fallback: T): Promise<T> {
    return fallback
  }

  async write<T>(_key: StorageKey, _value: T): Promise<void> {}

  async append<T>(_key: StorageKey, item: T): Promise<T> {
    return item
  }

  async upsertOne<V>(_key: StorageKey, _entry: { id: string | number; value: V }): Promise<void> {}

  async increment(_key: StorageKey, _id: string | number, _amount = 1): Promise<number | null> {
    return null
  }

  async recordActivityEvents(
    _events: readonly ActivityEvent[],
  ): Promise<ActivityBatchResult | null> {
    return null
  }

  async saveJournalEntry(_entry: LogEntry): Promise<JournalEntryMutationResult | null> {
    return null
  }

  async setJournalReview(
    _mutation: JournalReviewMutation,
  ): Promise<JournalEntryMutationResult | null> {
    return null
  }

  async deleteJournalEntry(
    _mutation: JournalDeleteMutation,
  ): Promise<JournalDeleteMutationResult | null> {
    return null
  }

  async markProgressSeen(_ko: string, _seenAt: number): Promise<ProgressRecord | null> {
    return null
  }

  async recalculateProgress(_ko: string): Promise<ProgressRecord | null> {
    return null
  }

  async restore(_data: StorageRestore): Promise<void> {}

  async updateOne<V>(
    _key: StorageKey,
    _entry: { id: string | number; value: V },
  ): Promise<boolean> {
    return true
  }

  async deleteOne(_key: StorageKey, _id: string | number): Promise<void> {}

  async remove(_key: StorageKey): Promise<void> {}

  async clear(): Promise<void> {}
}
