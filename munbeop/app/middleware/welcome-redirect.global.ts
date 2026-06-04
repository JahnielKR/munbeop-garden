import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export interface WelcomeRedirectInput {
  path: string
  signedIn: boolean
  welcomed: boolean
}

/**
 * Pure decision function. Returns the redirect target or null if no
 * redirect is needed. Exported for unit tests.
 *
 * Rules (mirrors spec §2.1):
 *   - signed in       → never sees /welcome. Hitting it redirects to /.
 *   - anon + welcomed → never redirected; preserves the existing UX.
 *   - anon + no flag  → first hit on / is redirected to /welcome.
 *   - all other paths → never touched.
 */
export function decideWelcomeRedirect({ path, signedIn, welcomed }: WelcomeRedirectInput): string | null {
  if (signedIn && path === '/welcome') return '/'
  if (signedIn) return null
  if (path === '/' && !welcomed) return '/welcome'
  return null
}

function readWelcomedFlag(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem('mungarden:welcomed') === '1'
  } catch {
    return false
  }
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
  const welcomed = readWelcomedFlag()
  const target = decideWelcomeRedirect({ path: to.path, signedIn, welcomed })
  if (target && target !== to.path) {
    return navigateTo(target, { replace: true })
  }
})
