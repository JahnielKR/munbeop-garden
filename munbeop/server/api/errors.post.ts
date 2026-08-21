import {
  defineEventHandler,
  getHeader,
  getRequestIP,
  readRawBody,
  setHeader,
  setResponseStatus,
} from 'h3'

/**
 * First-party crash sink. The client error reporter (plugins/error-capture)
 * POSTs a bounded, technical-only report here; we emit a single structured
 * `console.error` line that lands in the Vercel function logs — self-hosted,
 * errors-only, no third-party tracker, no analytics. (AUDITORIA "Próximo" #8.)
 *
 * Deliberately tiny: no DB, no auth. It never logs user content (the client
 * only sends message/stack/route), and re-clips every field server-side so a
 * forged oversized body can't flood the logs.
 */
const MAX_FIELD = 4000
const MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

interface RateBucket {
  count: number
  resetAt: number
}

const rateBuckets = new Map<string, RateBucket>()

function clip(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, MAX_FIELD) : undefined
}

function isRateLimited(key: string, now = Date.now()): boolean {
  const bucket = rateBuckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    if (rateBuckets.size >= 2000) {
      for (const [storedKey, stored] of rateBuckets) {
        if (stored.resetAt <= now) rateBuckets.delete(storedKey)
      }
      const oldestKey = rateBuckets.keys().next().value as string | undefined
      if (rateBuckets.size >= 2000 && oldestKey) rateBuckets.delete(oldestKey)
    }
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  bucket.count++
  return bucket.count > RATE_LIMIT
}

function reject(event: Parameters<typeof setResponseStatus>[0], status: number) {
  setResponseStatus(event, status)
  return { ok: false }
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')

  const clientKey = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (isRateLimited(clientKey)) {
    setHeader(event, 'Retry-After', 60)
    return reject(event, 429)
  }

  const contentType = getHeader(event, 'content-type')?.toLowerCase() ?? ''
  if (!contentType.startsWith('application/json')) return reject(event, 415)

  const declaredLength = Number(getHeader(event, 'content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return reject(event, 413)
  }

  const raw = await readRawBody(event).catch(() => undefined)
  if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return reject(event, raw ? 413 : 400)
  }

  let body: Record<string, unknown> | null = null
  try {
    const parsed: unknown = JSON.parse(raw)
    body = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    body = null
  }
  if (!body || typeof body !== 'object') {
    return reject(event, 400)
  }

  console.error(
    `[client-error] ${JSON.stringify({
      kind: clip(body.kind) ?? 'error',
      message: clip(body.message) ?? '(no message)',
      stack: clip(body.stack),
      route: clip(body.route),
      ua: clip(getHeader(event, 'user-agent')),
      at: new Date().toISOString(),
    })}`,
  )

  return { ok: true }
})
