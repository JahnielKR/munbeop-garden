import { localDayKey } from '~/lib/stats/activity'

export const ACTIVITY_SOURCES = [
  'cloze',
  'conjugation',
  'counter',
  'dictation',
  'escape-room',
  'number-market',
  'number-speed',
  'onboarding',
  'pair-drill',
  'particle-drill',
  'particle-explore',
  'particle-spacing',
  'placement',
  'practice',
  'register',
  'sentence-garden',
] as const

export type ActivitySource = (typeof ACTIVITY_SOURCES)[number]

export interface ActivityEvent {
  eventId: string
  localDay: string
  occurredAt: string
  timeZone: string
  utcOffsetMinutes: number
  source: ActivitySource
}

export interface ActivityBatchResult {
  acknowledgedIds: string[]
  totalsByDay: Record<string, number>
}

export interface LocalTimeMetadata {
  localDay: string
  occurredAt: string
  timeZone: string
  utcOffsetMinutes: number
}

function uuidV4(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()

  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function captureLocalTime(now: number = Date.now()): LocalTimeMetadata {
  const date = new Date(now)
  if (!Number.isFinite(date.getTime())) throw new Error('Activity timestamp must be valid')

  const browserOffsetMinutes = date.getTimezoneOffset()

  let timeZone = 'UTC'
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    // Some embedded browsers expose Intl without timezone data.
  }

  return {
    localDay: localDayKey(now),
    occurredAt: date.toISOString(),
    timeZone,
    // JSON round-trips -0 as 0. Canonicalizing here keeps durable events
    // byte-for-byte stable in UTC environments such as Linux CI.
    utcOffsetMinutes: browserOffsetMinutes === 0 ? 0 : -browserOffsetMinutes,
  }
}

export function createActivityEvent(
  source: ActivitySource,
  now: number = Date.now(),
): ActivityEvent {
  return {
    eventId: uuidV4(),
    ...captureLocalTime(now),
    source,
  }
}

export function isActivityEvent(value: unknown): value is ActivityEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<ActivityEvent>
  return (
    typeof event.eventId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.eventId) &&
    typeof event.localDay === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(event.localDay) &&
    typeof event.occurredAt === 'string' &&
    Number.isFinite(Date.parse(event.occurredAt)) &&
    typeof event.timeZone === 'string' &&
    event.timeZone.length > 0 &&
    event.timeZone.length <= 64 &&
    typeof event.utcOffsetMinutes === 'number' &&
    Number.isInteger(event.utcOffsetMinutes) &&
    Math.abs(event.utcOffsetMinutes) <= 14 * 60 &&
    ACTIVITY_SOURCES.includes(event.source as ActivitySource)
  )
}
