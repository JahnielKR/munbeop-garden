// Stub for Nuxt's virtual `#imports` module under vitest. Re-exports the
// auto-imported helpers our middleware and source files reference. Tests
// don't drive the middleware itself; the pure `decideWelcomeRedirect`
// function is what we cover. `defineNuxtRouteMiddleware` becomes a
// passthrough so a default export still exists, and `navigateTo` is a
// stub that returns its target.

export function defineNuxtRouteMiddleware<T extends (...args: never[]) => unknown>(fn: T): T {
  return fn
}

export function navigateTo(target: string | { path?: string }, _opts?: { replace?: boolean }) {
  return typeof target === 'string' ? target : target?.path ?? ''
}
