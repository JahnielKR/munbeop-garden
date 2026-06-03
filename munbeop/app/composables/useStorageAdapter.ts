import { pickAdapter } from '~/lib/storage/facade'
import { useAuthStore } from '~/stores/auth'

/**
 * Returns the active StorageAdapter based on current auth state.
 *
 * Call this fresh at the top of each store action — the returned adapter
 * is not memoized so a sign-in/sign-out instantly causes the next action
 * to hit Supabase or localStorage as appropriate. Locale is special-cased
 * inside locale.ts (always LocalStorage) because it is a per-device pref.
 */
export function useStorageAdapter() {
  const auth = useAuthStore()
  const { $supabase } = useNuxtApp()
  return pickAdapter({ user: auth.user, client: $supabase })
}
