import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { isPublicPath } from '~/lib/auth/public-paths'

export interface WelcomeRedirectInput {
  path: string
  signedIn: boolean
}

/**
 * Pure decision function. Returns the redirect target or null if no
 * redirect is needed. Exported for unit tests.
 *
 * Policy (2026-06-11): accounts are MANDATORY. Anonymous visitors only
 * ever see the public surface — the welcome gate, the info pages and the
 * auth flow. Every app route requires a session. (Guest mode was removed:
 * accounts give usage control and pave the way for premium tiers.)
 *
 * Rules:
 *   - signed in + /welcome  → /             (don't show the gate to a logged-in user)
 *   - anon      + app route → /welcome      (the whole app is behind the account)
 *   - anon      + public    → null          (welcome / pricing / features / policies / auth)
 */
export function decideWelcomeRedirect({ path, signedIn }: WelcomeRedirectInput): string | null {
  if (signedIn) return path === '/welcome' ? '/' : null
  return isPublicPath(path) ? null : '/welcome'
}

/**
 * Whether a raw `sb-<ref>-auth-token` localStorage value represents an ACTIVE
 * session. Exported (pure) for unit tests.
 *
 * This is a defensive superset of a bare presence check: if we can parse the
 * value and read a numeric `expires_at` (Supabase stores it as UNIX seconds),
 * an already-expired token counts as signed-out — that's the hardening over the
 * old "contains an access_token" substring test. But any value we can't parse,
 * or one without `expires_at`, falls back to presence, so a token format we
 * don't recognise can never log a genuinely-valid user out. `now` is injected
 * for tests.
 */
export function isActiveSessionToken(raw: string | null, now: number): boolean {
  if (!raw || !raw.includes('"access_token"')) return false
  try {
    const parsed = JSON.parse(raw) as { expires_at?: unknown }
    if (typeof parsed.expires_at === 'number') {
      return parsed.expires_at * 1000 > now
    }
  } catch {
    /* not JSON we understand — fall back to presence */
  }
  return true
}

/**
 * Detect a Supabase session via localStorage. The project is SPA-only
 * (`ssr: false`), so this middleware always runs in the browser. The
 * Supabase JS client persists sessions under a key like
 * `sb-<project-ref>-auth-token`; a matching key with a non-expired
 * access_token payload means we're signed in.
 */
function hasActiveSupabaseSession(now: number = Date.now()): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        if (isActiveSessionToken(window.localStorage.getItem(k), now)) return true
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
