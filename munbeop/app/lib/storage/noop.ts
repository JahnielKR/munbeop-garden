import type { StorageAdapter } from './adapter'
import type { StorageKey } from './keys'

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

  async append<T>(_key: StorageKey, _item: T): Promise<void> {}

  async upsertOne<V>(_key: StorageKey, _entry: { id: string; value: V }): Promise<void> {}

  async remove(_key: StorageKey): Promise<void> {}

  async clear(): Promise<void> {}
}
