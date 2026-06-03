import { useAuthStore } from '~/stores/auth'

/**
 * Thin wrapper around supabase.auth.* with two responsibilities:
 *   1) Keep useAuthStore() in sync with the Supabase session.
 *   2) Provide the four UI-facing actions: signUp / signIn /
 *      signInMagicLink / signOut. Each returns { error } so callers
 *      can render a friendly toast on failure without try/catch.
 *
 * Migration of localStorage → Supabase on first sign-in lives in P2.13
 * (lib/auth/migration.ts); this composable will call it from
 * signIn/signUp/callback once that file exists.
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

  async function signUp(email: string, password: string) {
    const { error } = await $supabase.auth.signUp({ email, password })
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
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

  return { init, signUp, signIn, signInMagicLink, signOut }
}
