import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

let cached: SupabaseClient<Database> | null = null

/**
 * Returns a process-wide singleton client. The Nuxt plugin builds it from
 * runtimeConfig env vars on boot; tests can call getSupabaseClient() with
 * stub values to wire a mocked client into the same singleton slot.
 *
 * Auth options:
 *   - persistSession: true       — keeps the JWT in localStorage so reload doesn't sign out.
 *   - autoRefreshToken: true     — refreshes silently before the access token expires.
 *   - detectSessionInUrl: true   — required for magic-link / OAuth callbacks.
 *   - flowType: 'pkce'           — the modern OAuth/PKCE flow (rather than implicit).
 */
export function getSupabaseClient(url: string, anonKey: string): SupabaseClient<Database> {
  if (!cached) {
    cached = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }
  return cached
}
