import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export interface WelcomeRedirectInput {
  path: string
  signedIn: boolean
}

/**
 * Pure decision function. Returns the redirect target or null if no
 * redirect is needed. Exported for unit tests.
 *
 * Policy: the landing page is the entry point for anonymous visitors —
 * always. The previous `mungarden:welcomed` localStorage exemption (which
 * let returning anon visitors skip /welcome) was dropped so the welcome
 * scene is the consistent first-paint surface for everyone who isn't
 * signed in.
 *
 * Rules:
 *   - signed in + /welcome → /              (don't show the gate to a logged-in user)
 *   - anon     + /         → /welcome       (start on the landing page)
 *   - anything else        → null           (direct links / deep routes untouched)
 */
export function decideWelcomeRedirect({ path, signedIn }: WelcomeRedirectInput): string | null {
  if (signedIn) return path === '/welcome' ? '/' : null
  if (path === '/') return '/welcome'
  return null
}

/**
 * Detect a Supabase session via localStorage. The project is SPA-only
 * (`ssr: false`), so this middleware always runs in the browser. The
 * Supabase JS client persists sessions under a key like
 * `sb-<project-ref>-auth-token`; any matching key with an access_token
 * payload means we're signed in.
 */
function hasActiveSupabaseSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const v = window.localStorage.getItem(k)
        if (v && v.includes('"access_token"')) return true
      }
    }
  } catch {
    /* private mode or storage disabled — treat as anon */
  }
  return false
}

export default defineNuxtRouteMiddleware((to) => {
  const signedIn = hasActiveSupabaseSession()
  const target = decideWelcomeRedirect({ path: to.path, signedIn })
  if (target && target !== to.path) {
    return navigateTo(target, { replace: true })
  }
})
