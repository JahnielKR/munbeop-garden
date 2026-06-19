import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'
import type { AuthUser } from '~/lib/auth/types'
import type { StorageAdapter } from './adapter'
import { NoopStorageAdapter } from './noop'
import { SupabaseAdapter } from './supabase'

export interface AdapterPickArgs {
  user: AuthUser | null
  client: SupabaseClient<Database> | null
}

/**
 * Returns the StorageAdapter that should be used right now, based on auth.
 *
 * Accounts are mandatory (2026-06-11): the Supabase adapter is the only
 * real storage path. The unauthenticated case covers transient windows
 * only — the gap between sign-out and the /welcome redirect, or a store
 * action racing session restore — and gets a noop adapter: reads resolve
 * to fallbacks (clearing store state), writes are dropped.
 *
 * Stateless. Call from useStorageAdapter() inside store actions so each
 * action re-evaluates auth state — that way signing in/out swaps adapters
 * without store-level caching getting in the way.
 */
export function pickAdapter(args: AdapterPickArgs): StorageAdapter {
  if (args.user && args.client) {
    return new SupabaseAdapter(args.client, args.user.id)
  }
  return new NoopStorageAdapter()
}
