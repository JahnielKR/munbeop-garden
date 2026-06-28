/**
 * Pure helpers for the production error reporter (see plugins/error-capture).
 * Self-hosted, errors-only: the report carries technical fields, never the
 * learner's sentence content — so it stays within the app's "no trackers"
 * promise (first-party crash logging, not analytics).
 */

export type ErrorKind = 'vue' | 'error' | 'unhandledrejection'

export interface ErrorReport {
  kind: ErrorKind
  message: string
  stack?: string
  route?: string
}

const MAX_MESSAGE = 500
const MAX_STACK = 4000

/** Normalise any thrown value into a bounded, serialisable report. */
export function toReport(kind: ErrorKind, err: unknown, route?: string): ErrorReport {
  const e = err instanceof Error ? err : undefined
  const message = (e?.message ?? String(err ?? 'Unknown error')).slice(0, MAX_MESSAGE)
  const stack = e?.stack?.slice(0, MAX_STACK)
  return {
    kind,
    message,
    ...(stack ? { stack } : {}),
    ...(route ? { route } : {}),
  }
}

export interface ThrottleOptions {
  /** Hard cap on reports sent per page session (a render loop can't flood). */
  maxPerSession?: number
  /** Suppress an identical (kind+message) report seen within this window. */
  windowMs?: number
}

/**
 * Build a dedupe + cap gate. `shouldSend(report, now)` returns false once the
 * session cap is hit, or when the same signature fired within `windowMs`. `now`
 * is injected so the gate is pure and testable.
 */
export function createThrottle(opts: ThrottleOptions = {}): (report: ErrorReport, now: number) => boolean {
  const maxPerSession = opts.maxPerSession ?? 25
  const windowMs = opts.windowMs ?? 10_000
  const lastSeen = new Map<string, number>()
  let sent = 0
  return function shouldSend(report, now) {
    if (sent >= maxPerSession) return false
    const sig = `${report.kind}:${report.message}`
    const last = lastSeen.get(sig)
    if (last !== undefined && now - last < windowMs) return false
    lastSeen.set(sig, now)
    sent += 1
    return true
  }
}
