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
  STORAGE_KEYS.customDecks,
] as const

/**
 * Coarse expected JSON shape of each export key's value, used by import
 * validation to reject a corrupt/hand-edited file before writing garbage into
 * storage. 'array' → must be an array; 'object' → a non-array object (null is
 * tolerated as "absent"). Kept intentionally coarse to never reject a real export.
 */
export const EXPORT_KEY_SHAPES: Record<string, 'array' | 'object'> = {
  [STORAGE_KEYS.grammar]: 'array',
  [STORAGE_KEYS.srs]: 'object',
  [STORAGE_KEYS.log]: 'array',
  [STORAGE_KEYS.decks]: 'array',
  [STORAGE_KEYS.customContexts]: 'array',
  [STORAGE_KEYS.inactiveContextIds]: 'array',
  [STORAGE_KEYS.settings]: 'object',
  [STORAGE_KEYS.escapeRoom]: 'object',
  [STORAGE_KEYS.customDecks]: 'array',
}

export interface ExportPayload {
  exportedAt: string
  app: string
  data: Record<string, unknown>
}
