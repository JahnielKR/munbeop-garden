import { useAuthStore } from '~/stores/auth'
import { isPublicPath } from '~/lib/auth/public-paths'
import { stripAccountEmailFromKakaoUrl } from '~/lib/auth/kakao-scope'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import { useSettingsStore } from '~/stores/settings'

/**
 * Thin wrapper around supabase.auth.* with three responsibilities:
 *   1) Keep useAuthStore() in sync with the Supabase session.
 *   2) Provide the UI-facing actions: signUp / signIn / signInMagicLink /
 *      signInWithProvider / signOutAndExit. Each returns { error } so
 *      callers can render a friendly toast on failure without try/catch.
 *   3) Re-hydrate the data stores when the session changes: a sign-in
 *      pulls the account's cloud data, a sign-out clears the previous
 *      user's data from memory.
 */
export function useAuth() {
  const { $supabase } = useNuxtApp()
  const authStore = useAuthStore()

  function hydrateDataStores() {
    return Promise.all([
      useGrammarStore().hydrate(),
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
    ])
  }

  async function init() {
    // Captured before the first await: the onAuthStateChange callback
    // fires long after setup, where useRouter() is no longer available.
    const router = useRouter()
    const { data } = await $supabase.auth.getSession()
    authStore.setSession(data.session ?? null)
    $supabase.auth.onAuthStateChange(async (event, session) => {
      authStore.setSession(session)
      // Pull the account's synced preferences once a session exists. Theme
      // applies immediately (DOM write); locale re-applies when default.vue
      // (re)mounts on the post-sign-in navigation from /welcome.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        await useSettingsStore().hydrate()
      }
      // After SIGNED_OUT the stores still hold the previous user's data
      // in memory. With no session pickAdapter yields the noop adapter,
      // so hydrating resolves every store to its fallback — that is what
      // clears the UI. (Handled here rather than inside signOutAndExit()
      // so token-expiry sign-outs flow through the same code.)
      if (event === 'SIGNED_OUT') {
        await hydrateDataStores()
        // A passive sign-out (expired/revoked token) leaves the user
        // parked on an app route with cleared stores — the middleware
        // only runs on navigation, so push the gate ourselves. After
        // signOutAndExit() this is a same-route no-op.
        if (!isPublicPath(router.currentRoute.value.path)) {
          await router.push('/welcome')
        }
      }
    })
  }

  // Internal — call after any flow that just put a user in the store.
  // Re-hydrates every store from the user's Supabase adapter so the UI
  // immediately shows the account's cloud data.
  async function hydrateUserStores() {
    if (!authStore.user) return
    await hydrateDataStores()
  }

  async function signUp(email: string, password: string) {
    const { error } = await $supabase.auth.signUp({ email, password })
    if (!error) await hydrateUserStores()
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (!error) await hydrateUserStores()
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

  /**
   * Permanently delete the account via the delete-account edge function
   * (service-role deletes the auth user; ON DELETE CASCADE wipes user data).
   * On success, sign out + leave to /welcome via the existing flow.
   */
  async function deleteAccount() {
    const { error } = await $supabase.functions.invoke('delete-account')
    if (error) return { error }
    return signOutAndExit()
  }

  async function signInWithProvider(provider: 'kakao' | 'google') {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = `${base}/auth/callback`
    if (provider === 'kakao') {
      // See lib/auth/kakao-scope.ts: Supabase appends rather than replaces
      // the scope, and we can't remove `account_email` from the dashboard
      // either, so we intercept the OAuth URL here.
      const { data, error } = await $supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) return { error }
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = stripAccountEmailFromKakaoUrl(data.url)
      }
      return { error: null }
    }
    const { error } = await $supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    // Store hydration runs on the /auth/callback page once Supabase has
    // set the session.
    return { error }
  }

  return { init, signUp, signIn, signInMagicLink, signInWithProvider, signOutAndExit, hydrateUserStores, deleteAccount }
}
