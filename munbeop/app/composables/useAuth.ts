import { useAuthStore } from '~/stores/auth'
import { useAppStatus } from '~/stores/appStatus'
import { isPublicPath } from '~/lib/auth/public-paths'
import { stripAccountEmailFromKakaoUrl } from '~/lib/auth/kakao-scope'
import { useGrammarStore } from '~/stores/grammar'
import { useContextsStore } from '~/stores/contexts'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import { useActivityStore } from '~/stores/activity'
import { useSettingsStore } from '~/stores/settings'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'
import { useCustomDecksStore } from '~/stores/customDecks'

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

  async function hydrateDataStores() {
    // Custom decks validate their grammar ids against this catalog, so grammar
    // hydration must finish first (especially when switching accounts).
    await useGrammarStore().hydrate()
    await Promise.all([
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
      useActivityStore().hydrate(),
      useSettingsStore().hydrate(),
      useEscapeRoomProgress().hydrate(),
      useCustomDecksStore().hydrate(),
    ])
  }

  async function init() {
    // Captured before the first await: the onAuthStateChange callback
    // fires long after setup, where useRouter() is no longer available.
    const router = useRouter()
    const { data } = await $supabase.auth.getSession()
    authStore.setSession(data.session ?? null)

    async function handleAuthEvent(
      event: string,
      session: typeof data.session,
      previousUserId: string | null,
      nextUserId: string | null,
    ) {
      if (
        (event === 'INITIAL_SESSION' && session)
        || (event === 'SIGNED_IN' && session && previousUserId !== nextUserId)
      ) {
        await useAppStatus().track(() => hydrateDataStores())
      }
      if (event === 'SIGNED_OUT') {
        await hydrateDataStores()
        if ((authStore.user?.id ?? null) !== nextUserId) return
        useSettingsStore().resetToDefaults()
        if (!isPublicPath(router.currentRoute.value.path)) {
          await router.push('/welcome')
        }
      }
    }

    $supabase.auth.onAuthStateChange((event, session) => {
      const previousUserId = authStore.user?.id ?? null
      authStore.setSession(session)
      const nextUserId = authStore.user?.id ?? null
      // Supabase auth callbacks must stay synchronous: awaiting another client
      // call here can hold the auth lock indefinitely. Defer all data I/O until
      // the callback has returned, and ignore an event superseded meanwhile.
      setTimeout(() => {
        if ((authStore.user?.id ?? null) !== nextUserId) return
        void handleAuthEvent(event, session, previousUserId, nextUserId).catch((error) => {
          console.error('auth: deferred session handling failed', error)
        })
      }, 0)
    })
  }

  // Internal — call after any flow that just put a user in the store.
  // Re-hydrates every store from the user's Supabase adapter so the UI
  // immediately shows the account's cloud data.
  async function hydrateUserStores() {
    if (!authStore.user) return
    // A post-auth hydration failure must not reject the sign-in flow — the user
    // authenticated successfully; the cloud data simply didn't load. Route it
    // through appStatus so the failure is visible + retryable in the shell.
    await useAppStatus().track(() => hydrateDataStores())
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await $supabase.auth.signUp({ email, password })
    if (!error) await hydrateUserStores()
    // With the Supabase project's "Confirm email" ON, signUp resolves error:null
    // but WITHOUT a session — the user must click the emailed link first. Signal
    // that so the UI shows a "check your email" message and stays on /welcome,
    // instead of navigating into a gated route that bounces straight back.
    return { error, needsConfirmation: !error && !data.session }
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
    const router = useRouter()
    // The default 'global' sign-out is a network op that can REJECT (offline /
    // DNS / reset) or return an error. Either way the user asked to leave, so we
    // must never stay in a signed-in state. On failure, fall back to a
    // local-scope sign-out (clears the local session + fires SIGNED_OUT, which
    // clears the data stores) and navigate to /welcome regardless — otherwise
    // the previous user's in-memory data would linger on a shared device.
    let error: { message?: string } | null = null
    try {
      error = (await $supabase.auth.signOut()).error
    } catch (e) {
      error = { message: e instanceof Error ? e.message : 'sign-out failed' }
    }
    if (error) {
      try {
        await $supabase.auth.signOut({ scope: 'local' })
      } catch {
        /* best-effort local teardown; navigate anyway below */
      }
    }
    await router.push('/welcome')
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

  /**
   * Email a password-recovery link. The link returns the user to
   * /auth/reset-password (a recovery session is established there) where
   * updatePassword() sets the new password. Only meaningful for email
   * identities; OAuth-only accounts have no password to reset.
   */
  async function resetPassword(email: string) {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const { error } = await $supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${base}/auth/reset-password`,
    })
    return { error }
  }

  /**
   * Re-verify the current password before a sensitive change. Supabase has no
   * "check password" call, so we re-run signInWithPassword with the account
   * email: it errors on a wrong password and otherwise just refreshes the same
   * session. Used to gate the in-settings change-password flow so a hijacked
   * session can't rotate the password without knowing the current one. (The
   * forgot-password reset flow deliberately skips this — the user has no
   * current password to prove.)
   */
  async function reauthenticate(currentPassword: string) {
    const email = authStore.user?.email
    if (!email) return { error: { message: 'no-session' } as { message: string } }
    const { error } = await $supabase.auth.signInWithPassword({ email, password: currentPassword })
    return { error }
  }

  /**
   * Set a new password for the signed-in (or recovery-session) user.
   * Used by the reset-password page and the in-settings change-password form.
   */
  async function updatePassword(password: string) {
    const { error } = await $supabase.auth.updateUser({ password })
    return { error }
  }

  /**
   * Change the account email. Supabase sends a confirmation link to the new
   * address; confirming it returns to /auth/callback. The email only changes
   * once confirmed.
   */
  async function updateEmail(email: string) {
    const config = useRuntimeConfig()
    const base =
      (config.public.appUrl as string | undefined) ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const { error } = await $supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${base}/auth/callback` },
    )
    return { error }
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

  return {
    init,
    signUp,
    signIn,
    signInMagicLink,
    signInWithProvider,
    signOutAndExit,
    hydrateUserStores,
    deleteAccount,
    resetPassword,
    reauthenticate,
    updatePassword,
    updateEmail,
  }
}
