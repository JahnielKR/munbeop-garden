import type { StorageKey } from './keys'

export type StorageRestore = Partial<Record<StorageKey, unknown>>

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
  append<T>(key: StorageKey, item: T): Promise<T>
  /**
   * Upsert a single keyed entry into a map-valued key (e.g. one grammar's SRS
   * state), so a per-item update is one row instead of re-writing the whole map
   * (which is O(catalog) per practiced card). Only meaningful for keyed-map
   * keys; the Supabase adapter throws for keys it doesn't support.
   */
  upsertOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<void>
  /**
   * Atomically add to a numeric counter and return its persisted total. A null
   * result means the active adapter intentionally has no persistent backing
   * store (the transient signed-out adapter).
   */
  increment(key: StorageKey, id: string | number, amount?: number): Promise<number | null>
  /** Restore all supplied keys as one backend operation when supported. */
  restore(data: StorageRestore): Promise<void>
  /**
   * Update one existing row without inserting it when it is already gone. This
   * distinction matters for journal review edits: an update racing a delete in
   * another tab must never resurrect the deleted entry.
   */
  updateOne<V>(
    key: StorageKey,
    entry: { id: string | number; value: V },
  ): Promise<boolean>
  /**
   * Delete a single row from a collection-valued key by its id (e.g. one journal
   * entry), so a delete is one row instead of re-writing the whole collection.
   * Only meaningful for keys with row ids; the Supabase adapter throws for keys
   * it doesn't support.
   */
  deleteOne(key: StorageKey, id: string | number): Promise<void>
  remove(key: StorageKey): Promise<void>
  clear(): Promise<void>
}
