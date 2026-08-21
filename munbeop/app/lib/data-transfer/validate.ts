import { LOCALE_CODES } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID, EXPORT_KEYS, type ExportPayload } from './keys'

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024

export type ParseResult =
  | { ok: true; payload: ExportPayload }
  | { ok: false; reason: 'json' | 'app' | 'shape' | 'size' }

type UnknownRecord = Record<string, unknown>
type ExportKey = (typeof EXPORT_KEYS)[number]

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isInteger = (value: unknown): value is number => isFiniteNumber(value) && Number.isInteger(value)
const isNonNegativeInteger = (value: unknown): value is number =>
  isInteger(value) && value >= 0
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString)
const optional = (value: unknown, check: (candidate: unknown) => boolean): boolean =>
  value === undefined || check(value)
const nullable = (value: unknown, check: (candidate: unknown) => boolean): boolean =>
  value === null || check(value)

function isLocalizedString(value: unknown): boolean {
  return isRecord(value) && LOCALE_CODES.every((locale) => isString(value[locale]))
}

function isGrammar(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    isString(value.ko) &&
    value.ko.length > 0 &&
    isLocalizedString(value.meaning) &&
    isString(value.deckId) &&
    optional(value.example, isString) &&
    optional(value.trans, isLocalizedString)
  )
}

function isSrsMap(value: unknown): boolean {
  if (!isRecord(value)) return false
  return Object.entries(value).every(([ko, state]) => {
    if (!ko || !isRecord(state)) return false
    return (
      nullable(state.lastSeen, isFiniteNumber) &&
      isNonNegativeInteger(state.easyCount) &&
      isNonNegativeInteger(state.hardCount) &&
      (state.mastery === 'seedling' || state.mastery === 'plant' || state.mastery === 'tree')
    )
  })
}

function isLogEntry(value: unknown): boolean {
  if (!isRecord(value)) return false
  const validDimension =
    value.errorDimension === undefined ||
    value.errorDimension === null ||
    ['particle', 'ending', 'register', 'word_order', 'other'].includes(String(value.errorDimension))
  return (
    isNonNegativeInteger(value.id) &&
    isString(value.ko) &&
    isString(value.sentence) &&
    (value.feedback === 'easy' || value.feedback === 'hard') &&
    optional(value.errorNote, (note) => nullable(note, isString)) &&
    validDimension &&
    ['unreviewed', 'correct', 'incorrect'].includes(String(value.reviewState)) &&
    isString(value.contextId) &&
    isString(value.contextName) &&
    isString(value.date) &&
    Number.isFinite(Date.parse(value.date))
  )
}

function isDeck(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.colorId) &&
    isInteger(value.order) &&
    typeof value.collapsed === 'boolean'
  )
}

function isCustomDeck(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.colorId) &&
    isString(value.icon) &&
    isStringArray(value.grammarKos) &&
    isInteger(value.order) &&
    isString(value.createdAt) &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    optional(value.imageUrl, isString)
  )
}

function isContext(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.name) &&
    isLocalizedString(value.scene) &&
    ['formalidad', 'situacional', 'custom'].includes(String(value.category)) &&
    typeof value.builtin === 'boolean'
  )
}

function isSettings(value: unknown): boolean {
  if (!isRecord(value)) return false
  const locale = value.locale
  return (
    optional(value.theme, (v) => ['light', 'dark', 'system'].includes(String(v))) &&
    optional(locale, (v) => isString(v) && (LOCALE_CODES as readonly string[]).includes(v)) &&
    optional(value.dailyGoal, isFiniteNumber) &&
    optional(value.reviewReminders, (v) => typeof v === 'boolean') &&
    optional(value.startingDeckId, (v) => nullable(v, isString)) &&
    optional(value.excludedDeckIds, isStringArray) &&
    optional(value.chosenAvatarId, (v) => nullable(v, isString)) &&
    optional(value.unlockedAvatarIds, isStringArray)
  )
}

function isEscapeRoomProgress(value: unknown): boolean {
  if (!isRecord(value)) return false
  const equipped = value.equipped
  return (
    optional(value.unlockedCosmetics, isStringArray) &&
    optional(value.consecutiveCleanRuns, isNonNegativeInteger) &&
    optional(equipped, (v) => isRecord(v) && Object.values(v).every(isString))
  )
}

function isActivityMap(value: unknown): boolean {
  if (!isRecord(value)) return false
  return Object.entries(value).every(
    ([day, row]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(day) && isRecord(row) && isNonNegativeInteger(row.count),
  )
}

const validators = {
  [STORAGE_KEYS.grammar]: (value: unknown) => Array.isArray(value) && value.every(isGrammar),
  [STORAGE_KEYS.srs]: isSrsMap,
  [STORAGE_KEYS.log]: (value: unknown) => Array.isArray(value) && value.every(isLogEntry),
  [STORAGE_KEYS.decks]: (value: unknown) => Array.isArray(value) && value.every(isDeck),
  [STORAGE_KEYS.customDecks]: (value: unknown) => Array.isArray(value) && value.every(isCustomDeck),
  [STORAGE_KEYS.customContexts]: (value: unknown) => Array.isArray(value) && value.every(isContext),
  [STORAGE_KEYS.inactiveContextIds]: isStringArray,
  [STORAGE_KEYS.settings]: isSettings,
  [STORAGE_KEYS.escapeRoom]: isEscapeRoomProgress,
  [STORAGE_KEYS.activity]: isActivityMap,
} satisfies Record<ExportKey, (value: unknown) => boolean>

/** Validate raw text as a bounded, structurally safe Munbeop Garden export. */
export function parseImportPayload(text: string): ParseResult {
  if (
    text.length > MAX_IMPORT_BYTES ||
    new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES
  ) {
    return { ok: false, reason: 'size' }
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'json' }
  }
  if (!isRecord(raw)) return { ok: false, reason: 'shape' }
  if (raw.app !== APP_ID) return { ok: false, reason: 'app' }
  if (!isRecord(raw.data)) return { ok: false, reason: 'shape' }
  if (
    raw.exportedAt !== undefined &&
    (!isString(raw.exportedAt) || !Number.isFinite(Date.parse(raw.exportedAt)))
  ) {
    return { ok: false, reason: 'shape' }
  }

  for (const key of EXPORT_KEYS) {
    const value = raw.data[key]
    if (value !== undefined && value !== null && !validators[key](value)) {
      return { ok: false, reason: 'shape' }
    }
  }
  return { ok: true, payload: raw as unknown as ExportPayload }
}
