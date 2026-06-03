import type { StorageKey } from './keys'

/**
 * Async storage abstraction.
 * - LocalStorageAdapter: trivial Promise-wrapping over sync localStorage.
 * - SupabaseAdapter (P2.11): genuine async via @supabase/supabase-js.
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
