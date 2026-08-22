import type { StorageAdapter, StorageRestore } from './adapter'
import { STORAGE_KEYS, type StorageKey } from './keys'
import type { ActivityBatchResult, ActivityEvent } from '~/lib/activity/event'
import type { LogEntry, SrsState } from '~/lib/domain'
import { recalculateMastery } from '~/lib/srs'
import type {
  JournalDeleteMutation,
  JournalDeleteMutationResult,
  JournalEntryMutationResult,
  JournalReviewMutation,
  ProgressRecord,
} from './journal'

const LOCAL_ACTIVITY_RECEIPTS = 'munbeop.activity-receipts.local.v1'

function normalizedEntry(entry: LogEntry): LogEntry {
  return {
    ...entry,
    errorNote: entry.errorNote ?? null,
    errorDimension: entry.errorDimension ?? null,
    localDay: entry.localDay ?? null,
    timeZone: entry.timeZone ?? null,
    utcOffsetMinutes: entry.utcOffsetMinutes ?? null,
    activityEventId: entry.activityEventId ?? null,
    revision: entry.revision ?? 0,
  }
}

function sameImmutableEntry(left: LogEntry, right: LogEntry): boolean {
  const tuple = (entry: LogEntry) => {
    const value = normalizedEntry(entry)
    return [
      value.id,
      value.ko,
      value.sentence,
      value.feedback,
      value.errorNote,
      value.errorDimension,
      value.reviewState,
      value.contextId,
      value.contextName,
      value.date,
      value.localDay,
      value.timeZone,
      value.utcOffsetMinutes,
      value.activityEventId,
    ]
  }
  return JSON.stringify(tuple(left)) === JSON.stringify(tuple(right))
}

function progressState(progress: ProgressRecord): SrsState {
  return {
    lastSeen: progress.lastSeen,
    easyCount: progress.easyCount,
    hardCount: progress.hardCount,
    mastery: progress.mastery,
    revision: progress.revision ?? 0,
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  /** Commit related local fallback keys together, rolling both back on quota errors. */
  private commit(values: ReadonlyArray<readonly [string, unknown]>): void {
    const before = new Map(values.map(([key]) => [key, localStorage.getItem(key)]))
    try {
      for (const [key, value] of values) localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      for (const [key, value] of before) {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
      }
      throw error
    }
  }

  private progressFromLog(
    ko: string,
    entries: readonly LogEntry[],
    map: Record<string, SrsState>,
  ): ProgressRecord {
    const current = map[ko]
    const derived = recalculateMastery(ko, entries)
    const hasJournalEntries = entries.some((entry) => entry.ko === ko)
    const lastSeen =
      current?.lastSeen === null || current?.lastSeen === undefined
        ? derived.lastSeen
        : derived.lastSeen === null
          ? current.lastSeen
          : Math.max(current.lastSeen, derived.lastSeen)
    const changed =
      !current ||
      current.lastSeen !== lastSeen ||
      current.easyCount !== derived.easyCount ||
      current.hardCount !== derived.hardCount ||
      current.mastery !== derived.mastery
    return {
      ko,
      ...derived,
      // lastSeen records exposure and must not move backwards when a journal
      // row is reviewed/deleted or when a late retry is processed.
      lastSeen,
      revision: current ? (current.revision ?? 0) + (changed ? 1 : 0) : hasJournalEntries ? 1 : 0,
    }
  }

  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('LocalStorageAdapter.write failed', { key, err })
    }
  }

  async append<T>(key: StorageKey, item: T): Promise<T> {
    const current = await this.read<T[]>(key, [])
    const id = (item as { id?: unknown }).id
    // Match the cloud adapter's idempotent retry semantics when an item carries
    // an id. Collection items without an id retain ordinary append behaviour.
    const existing =
      id === undefined
        ? -1
        : current.findIndex((candidate) => (candidate as { id?: unknown }).id === id)
    await this.write(
      key,
      existing === -1
        ? [...current, item]
        : current.map((candidate, i) => (i === existing ? item : candidate)),
    )
    return item
  }

  async upsertOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<void> {
    const map = await this.read<Record<string, V>>(key, {})
    map[String(entry.id)] = entry.value
    await this.write(key, map)
  }

  async increment(key: StorageKey, id: string | number, amount = 1): Promise<number | null> {
    if (key !== STORAGE_KEYS.activity) {
      throw new Error(`LocalStorageAdapter.increment(${key}) is not supported`)
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      throw new Error('LocalStorageAdapter.increment amount must be between 1 and 1000')
    }
    const map = await this.read<Record<string, { count: number }>>(key, {})
    const mapKey = String(id)
    const count = (map[mapKey]?.count ?? 0) + amount
    map[mapKey] = { count }
    await this.write(key, map)
    return count
  }

  async recordActivityEvents(events: readonly ActivityEvent[]): Promise<ActivityBatchResult> {
    const activity = await this.read<Record<string, { count: number }>>(STORAGE_KEYS.activity, {})
    const receipts = await this.read<Record<string, ActivityEvent>>(
      LOCAL_ACTIVITY_RECEIPTS as StorageKey,
      {},
    )
    for (const event of events) {
      const previous = receipts[event.eventId]
      if (previous && JSON.stringify(previous) !== JSON.stringify(event)) {
        throw new Error(`Activity event ${event.eventId} was reused with a different payload`)
      }
      if (previous) continue
      receipts[event.eventId] = event
      activity[event.localDay] = { count: (activity[event.localDay]?.count ?? 0) + 1 }
    }
    await this.write(STORAGE_KEYS.activity, activity)
    try {
      localStorage.setItem(LOCAL_ACTIVITY_RECEIPTS, JSON.stringify(receipts))
    } catch {
      // The local adapter is a development fallback; aggregate data is retained.
    }
    return {
      acknowledgedIds: events.map((event) => event.eventId),
      totalsByDay: Object.fromEntries(
        [...new Set(events.map((event) => event.localDay))].map((day) => [
          day,
          activity[day]?.count ?? 0,
        ]),
      ),
    }
  }

  async saveJournalEntry(entry: LogEntry): Promise<JournalEntryMutationResult> {
    const entries = await this.read<LogEntry[]>(STORAGE_KEYS.log, [])
    const map = await this.read<Record<string, SrsState>>(STORAGE_KEYS.srs, {})
    const existing = entries.find((candidate) => candidate.id === entry.id)
    if (existing && !sameImmutableEntry(existing, entry)) {
      throw new Error(`Journal id ${entry.id} was reused with a different payload`)
    }
    const saved = existing ? normalizedEntry(existing) : normalizedEntry(entry)
    const nextEntries = existing ? entries : [saved, ...entries]
    const progress = this.progressFromLog(saved.ko, nextEntries, map)
    const nextMap = { ...map, [saved.ko]: progressState(progress) }
    this.commit([
      [STORAGE_KEYS.log, nextEntries],
      [STORAGE_KEYS.srs, nextMap],
    ])
    return { entry: saved, progress }
  }

  async setJournalReview(mutation: JournalReviewMutation): Promise<JournalEntryMutationResult> {
    const entries = await this.read<LogEntry[]>(STORAGE_KEYS.log, [])
    const map = await this.read<Record<string, SrsState>>(STORAGE_KEYS.srs, {})
    const index = entries.findIndex((candidate) => candidate.id === mutation.id)
    if (index === -1) throw new Error(`Journal entry ${mutation.id} does not exist`)
    const current = normalizedEntry(entries[index]!)
    const currentRevision = current.revision ?? 0
    const changed =
      current.reviewState !== mutation.reviewState || current.errorNote !== mutation.errorNote
    if (currentRevision !== mutation.expectedRevision) {
      if (changed) {
        throw new Error(`Journal entry ${mutation.id} revision conflict`)
      }
    }
    const saved =
      currentRevision === mutation.expectedRevision && changed
        ? {
            ...current,
            reviewState: mutation.reviewState,
            errorNote: mutation.errorNote,
            revision: currentRevision + 1,
          }
        : current
    const nextEntries = entries.map((candidate, candidateIndex) =>
      candidateIndex === index ? saved : candidate,
    )
    const progress = this.progressFromLog(saved.ko, nextEntries, map)
    const nextMap = { ...map, [saved.ko]: progressState(progress) }
    this.commit([
      [STORAGE_KEYS.log, nextEntries],
      [STORAGE_KEYS.srs, nextMap],
    ])
    return { entry: saved, progress }
  }

  async deleteJournalEntry(mutation: JournalDeleteMutation): Promise<JournalDeleteMutationResult> {
    const entries = await this.read<LogEntry[]>(STORAGE_KEYS.log, [])
    const map = await this.read<Record<string, SrsState>>(STORAGE_KEYS.srs, {})
    const current = entries.find((candidate) => candidate.id === mutation.id)
    if (current) {
      if (
        current.ko !== mutation.expectedKo ||
        (current.revision ?? 0) !== mutation.expectedRevision
      ) {
        throw new Error(`Journal entry ${mutation.id} revision conflict`)
      }
    }
    const nextEntries = entries.filter((candidate) => candidate.id !== mutation.id)
    const progress = this.progressFromLog(mutation.expectedKo, nextEntries, map)
    const nextMap =
      progress.revision === 0 && !map[mutation.expectedKo]
        ? map
        : { ...map, [mutation.expectedKo]: progressState(progress) }
    this.commit([
      [STORAGE_KEYS.log, nextEntries],
      [STORAGE_KEYS.srs, nextMap],
    ])
    return { deleted: true, id: mutation.id, progress }
  }

  async markProgressSeen(ko: string, seenAt: number): Promise<ProgressRecord> {
    if (!Number.isFinite(seenAt)) throw new TypeError('seenAt must be a finite timestamp')
    const map = await this.read<Record<string, SrsState>>(STORAGE_KEYS.srs, {})
    const current = map[ko]
    const nextSeen = Math.max(current?.lastSeen ?? 0, seenAt)
    const progress: ProgressRecord = {
      ko,
      ...(current ?? {
        easyCount: 0,
        hardCount: 0,
        mastery: 'seedling' as const,
      }),
      lastSeen: nextSeen,
      revision:
        current && current.lastSeen === nextSeen
          ? (current.revision ?? 0)
          : current
            ? (current.revision ?? 0) + 1
            : 1,
    }
    this.commit([[STORAGE_KEYS.srs, { ...map, [ko]: progressState(progress) }]])
    return progress
  }

  async recalculateProgress(ko: string): Promise<ProgressRecord> {
    const entries = await this.read<LogEntry[]>(STORAGE_KEYS.log, [])
    const map = await this.read<Record<string, SrsState>>(STORAGE_KEYS.srs, {})
    const progress = this.progressFromLog(ko, entries, map)
    const nextMap =
      progress.revision === 0 && !map[ko] ? map : { ...map, [ko]: progressState(progress) }
    this.commit([[STORAGE_KEYS.srs, nextMap]])
    return progress
  }

  async restore(data: StorageRestore): Promise<void> {
    const knownKeys = new Set<string>(Object.values(STORAGE_KEYS))
    const snapshot = new Map<string, string | null>()
    try {
      for (const [key, value] of Object.entries(data)) {
        if (!knownKeys.has(key)) continue
        snapshot.set(key, localStorage.getItem(key))
        if (value === null || value === undefined) {
          localStorage.removeItem(key)
        } else {
          const serialized = JSON.stringify(value)
          if (serialized === undefined) throw new Error(`Cannot serialize ${key}`)
          localStorage.setItem(key, serialized)
        }
      }
    } catch (error) {
      for (const [key, value] of snapshot) {
        try {
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        } catch {
          // Best effort for the non-cloud fallback.
        }
      }
      throw error
    }
  }

  async updateOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<boolean> {
    const list = await this.read<Array<{ id: string | number }>>(key, [])
    const found = list.some((item) => item.id === entry.id)
    await this.write(
      key,
      list.map((item) => (item.id === entry.id ? entry.value : item)),
    )
    return found
  }

  async deleteOne(key: StorageKey, id: string | number): Promise<void> {
    const list = await this.read<Array<{ id: string | number }>>(key, [])
    await this.write(
      key,
      list.filter((item) => item.id !== id),
    )
  }

  async remove(key: StorageKey): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key)
    }
  }
}
