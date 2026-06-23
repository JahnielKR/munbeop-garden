import { STORAGE_KEYS } from '~/lib/storage'

/** Stamped into every export; import rejects files that don't match. */
export const APP_ID = 'munbeop-garden'

/** Every syncable key in a full backup (export writes these; import restores them). */
export const EXPORT_KEYS = [
  STORAGE_KEYS.grammar,
  STORAGE_KEYS.srs,
  STORAGE_KEYS.log,
  STORAGE_KEYS.decks,
  STORAGE_KEYS.customContexts,
  STORAGE_KEYS.inactiveContextIds,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.escapeRoom,
] as const

export interface ExportPayload {
  exportedAt: string
  app: string
  data: Record<string, unknown>
}
