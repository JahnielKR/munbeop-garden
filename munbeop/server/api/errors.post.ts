import { defineEventHandler, readBody, getHeader, setResponseStatus } from 'h3'

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

function clip(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, MAX_FIELD) : undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    setResponseStatus(event, 400)
    return { ok: false }
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
