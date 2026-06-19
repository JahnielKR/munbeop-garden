import type { StorageKey } from './keys'

/**
 * Async storage abstraction.
 * - SupabaseAdapter: the real backend — per-user data in Postgres.
 * - LocalStorageAdapter: per-device preferences only (locale).
 * - NoopStorageAdapter: transient signed-out state (accounts are mandatory).
 *
 * Returning Promise<T> from every method lets us swap one implementation
 * for the other behind useStorageAdapter() without touching any call site.
 */
export interface StorageAdapter {
  read<T>(key: StorageKey, fallback: T): Promise<T>
  write<T>(key: StorageKey, value: T): Promise<void>
  /**
   * Append a single item to a collection-valued key — an add becomes one row
   * instead of re-writing the whole collection (which grows O(history) for the
   * append-only log). Only meaningful for append-only keys; the Supabase
   * adapter throws for keys it doesn't support.
   */
  append<T>(key: StorageKey, item: T): Promise<void>
  remove(key: StorageKey): Promise<void>
  clear(): Promise<void>
}
