import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '~/lib/auth/types'
import type { StorageAdapter } from './adapter'
import { LocalStorageAdapter } from './localStorage'
import { SupabaseAdapter } from './supabase'

export interface AdapterPickArgs {
  user: AuthUser | null
  client: SupabaseClient | null
}

/**
 * Returns the StorageAdapter that should be used right now, based on auth.
 *
 * - Authenticated (user + client both present): SupabaseAdapter scoped to the user.
 * - Anonymous (user is null OR client is null): LocalStorageAdapter.
 *
 * Stateless. Call from useStorageAdapter() inside store actions so each
 * action re-evaluates auth state — that way signing in/out swaps adapters
 * without store-level caching getting in the way.
 */
export function pickAdapter(args: AdapterPickArgs): StorageAdapter {
  if (args.user && args.client) {
    return new SupabaseAdapter(args.client, args.user.id)
  }
  return new LocalStorageAdapter()
}
