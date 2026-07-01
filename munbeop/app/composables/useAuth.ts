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

  function hydrateDataStores() {
    return Promise.all([
      useGrammarStore().hydrate(),
      useContextsStore().hydrate(),
      useSrsStore().hydrate(),
      useLogStore().hydrate(),
      useActivityStore().hydrate(),
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
    $supabase.auth.onAuthStateChange(async (event, session) => {
      authStore.setSession(session)
      // Pull the account's synced preferences once a session exists. Theme
      // applies immediately (DOM write); locale re-applies when default.vue
      // (re)mounts on the post-sign-in navigation from /welcome.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        await useSettingsStore().hydrate()
        // INITIAL_SESSION is the hard-reload path: a persisted session is
        // restored AFTER the layout already hydrated the data stores against
        // the noop adapter (user still null), so they hold seed defaults. Pull
        // them again now that the real session is in the store — otherwise the
        // user sees the seed catalog / empty progress, and the next write would
        // push those seeds over their real cloud data. SIGNED_IN flows hydrate
        // explicitly via hydrateUserStores(), so we only do it here for the
        // restore path to avoid a redundant double-pull.
        if (event === 'INITIAL_SESSION') {
          // The adapter throws on a Supabase error; route the pull through
          // appStatus so a failure surfaces as a retryable 'error' in the shell
          // (track() swallows the throw — no unhandled rejection here) instead
          // of a silent empty state. The user is authed; the data just didn't
          // load this round.
          await useAppStatus().track(() => hydrateDataStores())
        }
      }
      // After SIGNED_OUT the stores still hold the previous user's data
      // in memory. With no session pickAdapter yields the noop adapter,
      // so hydrating resolves every store to its fallback — that is what
      // clears the UI. (Handled here rather than inside signOutAndExit()
      // so token-expiry sign-outs flow through the same code.)
      if (event === 'SIGNED_OUT') {
        await hydrateDataStores()
        // hydrateDataStores() clears the data stores against the noop adapter,
        // but the settings store isn't in that set (it hydrates on SIGNED_IN /
        // INITIAL_SESSION). Reset its account-scoped prefs here so the next user
        // on a shared device doesn't inherit deck-focus / avatar / goal.
        useSettingsStore().resetToDefaults()
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
