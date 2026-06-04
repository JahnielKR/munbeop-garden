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
    $supabase.auth.onAuthStateChange(async (event, session) => {
      authStore.setSession(session)
      // After SIGNED_OUT the stores still hold the previous user's data in
      // memory; re-hydrate from the now-anonymous adapter so the UI clears.
      // (Caught here rather than inside signOut() so token-expiry sign-outs
      // and other paths flow through the same code.)
      if (event === 'SIGNED_OUT') {
        await Promise.all([
          useGrammarStore().hydrate(),
          useContextsStore().hydrate(),
          useSrsStore().hydrate(),
          useLogStore().hydrate(),
        ])
      }
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

  /**
   * Sign out + navigate to /welcome. The layout-transition.global
   * middleware sees the navigation away-from-in-app to /welcome and
   * fires the pan-left camera move automatically.
   */
  async function signOutAndExit() {
    const { error } = await $supabase.auth.signOut()
    const router = useRouter()
    if (!error) await router.push('/welcome')
    return { error }
  }

  async function signInWithProvider(provider: 'kakao' | 'google') {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = `${base}/auth/callback`
    const { error } = await $supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    // Migration runs on the /auth/callback page after Supabase sets the session.
    return { error }
  }

  return { init, signUp, signIn, signInMagicLink, signInWithProvider, signOut, signOutAndExit, runPostLoginMigration }
}
