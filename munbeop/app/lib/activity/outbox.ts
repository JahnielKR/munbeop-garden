import { isActivityEvent, type ActivityEvent } from './event'

const OUTBOX_PREFIX = 'munbeop.activity-outbox.v1'
const memoryFallback = new Map<string, string>()

function prefixFor(userId: string): string {
  return `${OUTBOX_PREFIX}:${encodeURIComponent(userId)}:`
}

function keyFor(userId: string, eventId: string): string {
  return `${prefixFor(userId)}${eventId}`
}

function browserStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** One key per event prevents read/modify/write races between browser tabs. */
export function enqueueActivityEvent(userId: string, event: ActivityEvent): boolean {
  const key = keyFor(userId, event.eventId)
  const serialized = JSON.stringify(event)
  const storage = browserStorage()
  if (storage) {
    try {
      storage.setItem(key, serialized)
      return true
    } catch {
      // Keep the event for this tab even when storage is unavailable/full.
    }
  }
  memoryFallback.set(key, serialized)
  return false
}

export function listActivityEvents(userId: string): ActivityEvent[] {
  const prefix = prefixFor(userId)
  const rows = new Map<string, ActivityEvent>()
  const collect = (key: string, raw: string | null) => {
    if (!key.startsWith(prefix) || !raw) return
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isActivityEvent(parsed)) rows.set(parsed.eventId, parsed)
    } catch {
      // Ignore malformed values; they cannot be sent safely.
    }
  }

  const storage = browserStorage()
  if (storage) {
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key) collect(key, storage.getItem(key))
      }
    } catch {
      // The in-memory fallback is still usable below.
    }
  }
  for (const [key, raw] of memoryFallback) collect(key, raw)

  return [...rows.values()].sort(
    (a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.eventId.localeCompare(b.eventId),
  )
}

export function acknowledgeActivityEvents(userId: string, eventIds: readonly string[]): void {
  const storage = browserStorage()
  for (const eventId of eventIds) {
    const key = keyFor(userId, eventId)
    memoryFallback.delete(key)
    try {
      storage?.removeItem(key)
    } catch {
      // A duplicate retry remains safe if browser storage is temporarily locked.
    }
  }
}

export function clearActivityOutbox(userId: string): void {
  acknowledgeActivityEvents(
    userId,
    listActivityEvents(userId).map((event) => event.eventId),
  )
}

export function isActivityOutboxKey(key: string | null): boolean {
  return typeof key === 'string' && key.startsWith(`${OUTBOX_PREFIX}:`)
}
