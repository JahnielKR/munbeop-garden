import { useAuthStore } from '~/stores/auth'
import { migrateLocalToSupabase } from '~/lib/auth/migration'
import { pickAdapter } from '~/lib/storage/facade'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'

/**
 * Thin wrapper around supabase.auth.* with three responsibilities:
 *   1) Keep useAuthStore() in sync with the Supabase session.
 *   2) Provide the four UI-facing actions: signUp / signIn /
 *      signInMagicLink / signOut. Each returns { error } so callers
 *      can render a friendly toast on failure without try/catch.
 *   3) Run the one-time localStorage → Supabase migration on the first
 *      sign-in / sign-up / magic-link callback that lands an
 *      authenticated session.
 */
export function useAuth() {
  const { $supabase } = useNuxtApp()
  const authStore = useAuthStore()

  async function init() {
    const { data } = await $supabase.auth.getSession()
    authStore.setSession(data.session ?? null)
    $supabase.auth.onAuthStateChange((_event, session) => {
      authStore.setSession(session)
    })
  }

  // Internal — call after any flow that just put a user in the store.
  // Re-hydrates every store from the now-active (Supabase) adapter so
  // the UI immediately reflects whatever was migrated.
  async function runPostLoginMigration() {
    if (!authStore.user) return null
    const adapter = pickAdapter({ user: authStore.user, client: $supabase })
    const result = await migrateLocalToSupabase(adapter)
    await Promise.all([
      useGrammarStore().hydrate(),
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
    ])
    return result
  }

  async function signUp(email: string, password: string) {
    const { error } = await $supabase.auth.signUp({ email, password })
    if (!error) await runPostLoginMigration()
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (!error) await runPostLoginMigration()
    return { error }
  }

  async function signInMagicLink(email: string) {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = `${base}/auth/callback`
    const { error } = await $supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { error }
  }

  async function signOut() {
    const { error } = await $supabase.auth.signOut()
    return { error }
  }

  return { init, signUp, signIn, signInMagicLink, signOut, runPostLoginMigration }
}
