import {
  ERROR_DIMENSIONS,
  type LogEntry,
  type MasteryLevel,
  type ReviewState,
  type SrsState,
} from '~/lib/domain'

export interface ProgressRecord extends SrsState {
  ko: string
}

export interface JournalEntryMutationResult {
  entry: LogEntry
  progress: ProgressRecord
}

export interface JournalDeleteMutationResult {
  deleted: true
  id: number
  progress: ProgressRecord
}

export interface JournalReviewMutation {
  id: number
  reviewState: ReviewState
  errorNote: string | null
  expectedRevision: number
}

export interface JournalDeleteMutation {
  id: number
  expectedKo: string
  expectedRevision: number
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} is not an object`)
  }
  return value as Record<string, unknown>
}

function string(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`${label} is not a string`)
  return value
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null
  return string(value, label)
}

function integer(
  value: unknown,
  label: string,
  minimum = 0,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new Error(`${label} is not a safe integer`)
  }
  return value as number
}

function nullableInteger(value: unknown, label: string): number | null {
  if (value === null || value === undefined) return null
  return integer(value, label, -840, 840)
}

function revision(value: unknown, label: string): number {
  return integer(value ?? 0, label)
}

const FEEDBACK = new Set(['easy', 'hard'])
const REVIEW_STATES = new Set<ReviewState>(['unreviewed', 'correct', 'incorrect'])
const MASTERY = new Set<MasteryLevel>(['seedling', 'plant', 'tree'])
const DIMENSIONS = new Set<string>(ERROR_DIMENSIONS)

/** Validate the JSON contract at the RPC boundary instead of trusting jsonb. */
export function parseJournalEntry(value: unknown): LogEntry {
  const row = record(value, 'journal entry')
  const feedback = string(row.feedback, 'journal entry.feedback')
  const reviewState = string(row.reviewState, 'journal entry.reviewState')
  if (!FEEDBACK.has(feedback)) throw new Error('journal entry.feedback is invalid')
  if (!REVIEW_STATES.has(reviewState as ReviewState)) {
    throw new Error('journal entry.reviewState is invalid')
  }

  const errorDimension = nullableString(row.errorDimension, 'journal entry.errorDimension')
  if (errorDimension !== null && !DIMENSIONS.has(errorDimension)) {
    throw new Error('journal entry.errorDimension is invalid')
  }
  const errorNote = nullableString(row.errorNote, 'journal entry.errorNote')
  if (reviewState === 'incorrect' && !errorNote?.trim()) {
    throw new Error('journal entry.errorNote is required for an incorrect review')
  }
  const date = string(row.date, 'journal entry.date')
  if (!Number.isFinite(Date.parse(date))) throw new Error('journal entry.date is invalid')
  const localDay = nullableString(row.localDay, 'journal entry.localDay')
  const timeZone = nullableString(row.timeZone, 'journal entry.timeZone')
  const utcOffsetMinutes = nullableInteger(row.utcOffsetMinutes, 'journal entry.utcOffsetMinutes')
  const noLocalTime = localDay === null && timeZone === null && utcOffsetMinutes === null
  const completeLocalTime = localDay !== null && timeZone !== null && utcOffsetMinutes !== null
  if (!noLocalTime && !completeLocalTime) {
    throw new Error('journal entry local time metadata is incomplete')
  }
  if (
    localDay !== null &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(localDay) ||
      !Number.isFinite(Date.parse(`${localDay}T00:00:00.000Z`)) ||
      new Date(`${localDay}T00:00:00.000Z`).toISOString().slice(0, 10) !== localDay)
  ) {
    throw new Error('journal entry.localDay is invalid')
  }
  if (timeZone !== null && !/^[A-Za-z0-9._+/-]{1,64}$/.test(timeZone)) {
    throw new Error('journal entry.timeZone is invalid')
  }
  const activityEventId = nullableString(row.activityEventId, 'journal entry.activityEventId')
  if (
    activityEventId !== null &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityEventId)
  ) {
    throw new Error('journal entry.activityEventId is invalid')
  }

  return {
    id: integer(row.id, 'journal entry.id', 1),
    ko: string(row.ko, 'journal entry.ko'),
    sentence: string(row.sentence, 'journal entry.sentence'),
    feedback: feedback as LogEntry['feedback'],
    errorNote,
    errorDimension: errorDimension as LogEntry['errorDimension'],
    reviewState: reviewState as ReviewState,
    contextId: string(row.contextId, 'journal entry.contextId'),
    contextName: string(row.contextName, 'journal entry.contextName'),
    date,
    localDay,
    timeZone,
    utcOffsetMinutes,
    activityEventId,
    revision: revision(row.revision, 'journal entry.revision'),
  }
}

export function parseProgressRecord(value: unknown): ProgressRecord {
  const row = record(value, 'progress')
  const mastery = string(row.mastery, 'progress.mastery')
  if (!MASTERY.has(mastery as MasteryLevel)) throw new Error('progress.mastery is invalid')
  const lastSeen = row.lastSeen
  return {
    ko: string(row.ko, 'progress.ko'),
    lastSeen:
      lastSeen === null || lastSeen === undefined ? null : integer(lastSeen, 'progress.lastSeen'),
    easyCount: integer(row.easyCount, 'progress.easyCount'),
    hardCount: integer(row.hardCount, 'progress.hardCount'),
    mastery: mastery as MasteryLevel,
    revision: revision(row.revision, 'progress.revision'),
  }
}

export function parseJournalEntryMutationResult(value: unknown): JournalEntryMutationResult {
  const result = record(value, 'journal mutation result')
  return {
    entry: parseJournalEntry(result.entry),
    progress: parseProgressRecord(result.progress),
  }
}

export function parseJournalDeleteMutationResult(value: unknown): JournalDeleteMutationResult {
  const result = record(value, 'journal delete result')
  if (result.deleted !== true) throw new Error('journal delete result.deleted is not true')
  return {
    deleted: true,
    id: integer(result.id, 'journal delete result.id', 1),
    progress: parseProgressRecord(result.progress),
  }
}
