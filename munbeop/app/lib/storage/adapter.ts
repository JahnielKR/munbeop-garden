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
  remove(key: StorageKey): Promise<void>
  clear(): Promise<void>
}
