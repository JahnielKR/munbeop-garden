import { LocalStorageAdapter } from '~/lib/storage/localStorage'
import type { StorageAdapter } from '~/lib/storage/adapter'
import { STORAGE_KEYS, type StorageKey } from '~/lib/storage/keys'

// Keys that migrate from anonymous local storage into the user's Supabase
// account on first sign-in. Locale is intentionally excluded — it is a
// per-device preference, not part of the user's progress.
const SYNCED_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
] as const

export interface MigrationResult {
  migrated: boolean
  keysCopied: string[]
}

/**
 * Move all syncable local storage keys into the provided (cloud) adapter.
 *
 * Behaviour:
 *  - If localStorage has no meaningful data for a key (null / empty array /
 *    empty object), skip it.
 *  - Each non-empty value is written into the cloud adapter using the same
 *    StorageKey, then the local copy is removed.
 *  - Idempotent: a second call after success finds nothing to copy and
 *    returns { migrated: false }.
 *
 * NOTE: This OVERWRITES cloud data with local. It is intended for the
 * first sign-in of a previously-anonymous user, not for ongoing sync /
 * conflict resolution. Multi-device merging is out of scope for Plan 2.
 */
export async function migrateLocalToSupabase(
  cloudAdapter: StorageAdapter,
): Promise<MigrationResult> {
  const local = new LocalStorageAdapter()
  const copied: StorageKey[] = []

  for (const key of SYNCED_KEYS) {
    // read<unknown> so TypeScript stops inferring `null` from the fallback
    // and we keep the runtime branching readable.
    const value = await local.read<unknown>(key, null)
    if (value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    ) {
      continue
    }
    await cloudAdapter.write(key, value)
    copied.push(key)
  }

  if (copied.length === 0) {
    return { migrated: false, keysCopied: [] }
  }

  for (const key of copied) {
    await local.remove(key)
  }
  return { migrated: true, keysCopied: [...copied] }
}
