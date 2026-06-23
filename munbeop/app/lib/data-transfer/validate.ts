import { APP_ID, type ExportPayload } from './keys'

export type ParseResult =
  | { ok: true; payload: ExportPayload }
  | { ok: false; reason: 'json' | 'app' | 'shape' }

/** Validate raw text as a munbeop-garden export. Pure — no DOM, no storage. */
export function parseImportPayload(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'json' }
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'shape' }
  const obj = raw as Record<string, unknown>
  if (obj.app !== APP_ID) return { ok: false, reason: 'app' }
  if (typeof obj.data !== 'object' || obj.data === null) return { ok: false, reason: 'shape' }
  return { ok: true, payload: obj as unknown as ExportPayload }
}
