import type { StorageKey } from './keys'

/**
 * Storage abstraction. Implemented by LocalStorageAdapter in Plan 1.
 * Will be replaced with SupabaseAdapter in Plan 2 — same interface.
 */
export interface StorageAdapter {
  read<T>(key: StorageKey, fallback: T): T
  write<T>(key: StorageKey, value: T): void
  remove(key: StorageKey): void
  clear(): void
}
