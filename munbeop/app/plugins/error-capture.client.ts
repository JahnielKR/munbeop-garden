import { createThrottle, toReport, type ErrorReport } from '~/lib/errors/report'

/**
 * Production crash reporter. Captures Vue errors + uncaught errors/rejections
 * and ships a bounded, technical-only report to our own /api/errors sink
 * (→ Vercel function logs). First-party, errors-only — no third-party tracker,
 * no analytics, never the learner's sentence. (AUDITORIA "Próximo" #8.)
 *
 * Dev is skipped (the console + Nuxt overlay already surface errors and we
 * don't want to spam the sink while developing). Fire-and-forget and fully
 * guarded: the reporter must never throw back into the app.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.dev) return

  const throttle = createThrottle()
  const router = useRouter()
  const route = () => {
    try {
      return router.currentRoute.value.fullPath
    } catch {
      return undefined
    }
  }

  function send(report: ErrorReport) {
    try {
      if (!throttle(report, Date.now())) return
      void $fetch('/api/errors', { method: 'POST', body: report }).catch(() => {})
    } catch {
      // A reporting failure must never become a second error.
    }
  }

  // Vue component/render/lifecycle errors (Nuxt's own hook — doesn't clobber
  // its internal errorHandler).
  nuxtApp.hook('vue:error', (err) => send(toReport('vue', err, route())))
  // Fatal app/startup errors.
  nuxtApp.hook('app:error', (err) => send(toReport('error', err, route())))

  // Uncaught errors + unhandled promise rejections outside Vue.
  window.addEventListener('error', (e) => send(toReport('error', e.error ?? e.message, route())))
  window.addEventListener('unhandledrejection', (e) =>
    send(toReport('unhandledrejection', e.reason, route())),
  )
})
