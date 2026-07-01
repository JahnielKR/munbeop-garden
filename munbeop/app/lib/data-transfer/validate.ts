import { APP_ID, EXPORT_KEY_SHAPES, type ExportPayload } from './keys'

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
  // Guard each known key's value shape so a corrupt/hand-edited file can't be
  // written verbatim into storage (e.g. data.srs = "hello" → character-index
  // garbage rows). Coarse array-vs-object check; null tolerated as "absent".
  const data = obj.data as Record<string, unknown>
  for (const [k, shape] of Object.entries(EXPORT_KEY_SHAPES)) {
    const v = data[k]
    if (v === undefined) continue
    const ok = shape === 'array' ? Array.isArray(v) : v === null || (typeof v === 'object' && !Array.isArray(v))
    if (!ok) return { ok: false, reason: 'shape' }
  }
  return { ok: true, payload: obj as unknown as ExportPayload }
}
