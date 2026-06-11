import { defineStore } from 'pinia'
import type { AuthUser, AuthSession } from '~/lib/auth/types'

/**
 * Holds the current Supabase auth state. Populated by useAuth().init()
 * on app boot and kept in sync by an onAuthStateChange subscription.
 *
 * `ready` flips true after the very first getSession() resolves — UI
 * code can use it to avoid acting on a not-yet-restored session.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const session = ref<AuthSession | null>(null)
  const ready = ref(false)

  function setSession(next: AuthSession | null) {
    session.value = next
    user.value = next?.user ?? null
    ready.value = true
  }

  return { user, session, ready, setSession }
})
