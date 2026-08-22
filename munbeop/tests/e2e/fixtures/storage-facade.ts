import type { StorageAdapter, StorageRestore } from '~/lib/storage/adapter'
import { STORAGE_KEYS, type StorageKey } from '~/lib/storage/keys'
import { NoopStorageAdapter } from '~/lib/storage/noop'
import type { ActivityBatchResult, ActivityEvent } from '~/lib/activity/event'
import type { LogEntry, SrsState } from '~/lib/domain'
import { recalculateMastery } from '~/lib/srs'
import type {
  JournalDeleteMutation,
  JournalDeleteMutationResult,
  JournalEntryMutationResult,
  JournalReviewMutation,
  ProgressRecord,
} from '~/lib/storage/journal'
import type { AuthUser } from '~/lib/auth/types'
import {
  cloneBackendValue,
  ensureAccount,
  mutateAccount,
  readBackend,
  writeBackend,
} from './backend'

interface AdapterPickArgs {
  user: AuthUser | null
  client: unknown
}

function normalizeEntry(entry: LogEntry): LogEntry {
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
  const leftPayload = { ...normalizeEntry(left) }
  const rightPayload = { ...normalizeEntry(right) }
  Reflect.deleteProperty(leftPayload, 'revision')
  Reflect.deleteProperty(rightPayload, 'revision')
  return JSON.stringify(leftPayload) === JSON.stringify(rightPayload)
}

function mapState(progress: ProgressRecord): SrsState {
  const state = { ...progress }
  Reflect.deleteProperty(state, 'ko')
  return state
}

class FakeStorageAdapter implements StorageAdapter {
  constructor(private readonly userId: string) {}

  async read<T>(key: StorageKey, fallback: T): Promise<T> {
    const state = readBackend()
    const account = ensureAccount(state, this.userId)
    if (account.failReadsRemaining > 0) {
      account.failReadsRemaining -= 1
      writeBackend(state)
      throw new Error(`E2E injected read failure for ${key}`)
    }
    return cloneBackendValue(
      Object.prototype.hasOwnProperty.call(account.data, key) ? (account.data[key] as T) : fallback,
    )
  }

  async write<T>(key: StorageKey, value: T): Promise<void> {
    mutateAccount(this.userId, (account) => {
      account.data[key] = cloneBackendValue(value)
    })
  }

  async append<T>(key: StorageKey, item: T): Promise<T> {
    return mutateAccount(this.userId, (account) => {
      const list = (account.data[key] as T[] | undefined) ?? []
      const id = (item as { id?: unknown }).id
      const index =
        id === undefined
          ? -1
          : list.findIndex((candidate) => (candidate as { id?: unknown }).id === id)
      account.data[key] =
        index === -1
          ? [...list, item]
          : list.map((candidate, candidateIndex) => (candidateIndex === index ? item : candidate))
      return item
    })
  }

  async upsertOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<void> {
    mutateAccount(this.userId, (account) => {
      const current = account.data[key]
      if (Array.isArray(current)) {
        const index = current.findIndex(
          (item) => (item as { id?: string | number }).id === entry.id,
        )
        account.data[key] =
          index === -1
            ? [...current, entry.value]
            : current.map((item, itemIndex) => (itemIndex === index ? entry.value : item))
        return
      }
      const map = (current as Record<string, V> | undefined) ?? {}
      account.data[key] = { ...map, [String(entry.id)]: entry.value }
    })
  }

  async increment(key: StorageKey, id: string | number, amount = 1): Promise<number | null> {
    if (key !== STORAGE_KEYS.activity) throw new Error(`Unsupported counter ${key}`)
    return mutateAccount(this.userId, (account) => {
      const map = (account.data[key] as Record<string, { count: number }> | undefined) ?? {}
      const mapKey = String(id)
      const count = (map[mapKey]?.count ?? 0) + amount
      account.data[key] = { ...map, [mapKey]: { count } }
      return count
    })
  }

  async recordActivityEvents(events: readonly ActivityEvent[]): Promise<ActivityBatchResult> {
    return mutateAccount(this.userId, (account) => {
      const activity =
        (account.data[STORAGE_KEYS.activity] as Record<string, { count: number }> | undefined) ?? {}
      for (const event of events) {
        const prior = account.activityReceipts[event.eventId]
        if (prior && JSON.stringify(prior) !== JSON.stringify(event)) {
          throw new Error(`Activity event ${event.eventId} payload conflict`)
        }
        if (prior) continue
        account.activityReceipts[event.eventId] = event
        activity[event.localDay] = { count: (activity[event.localDay]?.count ?? 0) + 1 }
      }
      account.data[STORAGE_KEYS.activity] = activity
      return {
        acknowledgedIds: events.map((event) => event.eventId),
        totalsByDay: Object.fromEntries(
          [...new Set(events.map((event) => event.localDay))].map((day) => [
            day,
            activity[day]?.count ?? 0,
          ]),
        ),
      }
    })
  }

  private progressFromJournal(
    ko: string,
    entries: readonly LogEntry[],
    map: Record<string, SrsState>,
  ): ProgressRecord {
    const current = map[ko]
    const derived = recalculateMastery(ko, entries)
    const lastSeen =
      current?.lastSeen == null
        ? derived.lastSeen
        : derived.lastSeen == null
          ? current.lastSeen
          : Math.max(current.lastSeen, derived.lastSeen)
    const changed =
      !current ||
      current.easyCount !== derived.easyCount ||
      current.hardCount !== derived.hardCount ||
      current.mastery !== derived.mastery ||
      current.lastSeen !== lastSeen
    return {
      ko,
      ...derived,
      lastSeen,
      revision: current
        ? (current.revision ?? 0) + (changed ? 1 : 0)
        : entries.some((entry) => entry.ko === ko)
          ? 1
          : 0,
    }
  }

  async saveJournalEntry(entry: LogEntry): Promise<JournalEntryMutationResult> {
    return mutateAccount(this.userId, (account) => {
      const entries = (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []
      const map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
      const existing = entries.find((candidate) => candidate.id === entry.id)
      if (existing && !sameImmutableEntry(existing, entry)) {
        throw new Error(`Journal id ${entry.id} payload conflict`)
      }
      const saved = normalizeEntry(existing ?? entry)
      const nextEntries = existing ? entries : [saved, ...entries]
      const progress = this.progressFromJournal(saved.ko, nextEntries, map)
      account.data[STORAGE_KEYS.log] = nextEntries
      account.data[STORAGE_KEYS.srs] = { ...map, [saved.ko]: mapState(progress) }
      return { entry: saved, progress }
    })
  }

  async setJournalReview(mutation: JournalReviewMutation): Promise<JournalEntryMutationResult> {
    return mutateAccount(this.userId, (account) => {
      const entries = (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []
      const map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
      const index = entries.findIndex((candidate) => candidate.id === mutation.id)
      if (index === -1) throw new Error(`Journal entry ${mutation.id} does not exist`)
      const current = normalizeEntry(entries[index]!)
      const changed =
        current.reviewState !== mutation.reviewState || current.errorNote !== mutation.errorNote
      if ((current.revision ?? 0) !== mutation.expectedRevision && changed) {
        throw new Error(`Journal entry ${mutation.id} revision conflict`)
      }
      const saved =
        changed && (current.revision ?? 0) === mutation.expectedRevision
          ? {
              ...current,
              reviewState: mutation.reviewState,
              errorNote: mutation.errorNote,
              revision: (current.revision ?? 0) + 1,
            }
          : current
      const nextEntries = entries.map((candidate, candidateIndex) =>
        candidateIndex === index ? saved : candidate,
      )
      const progress = this.progressFromJournal(saved.ko, nextEntries, map)
      account.data[STORAGE_KEYS.log] = nextEntries
      account.data[STORAGE_KEYS.srs] = { ...map, [saved.ko]: mapState(progress) }
      return { entry: saved, progress }
    })
  }

  async deleteJournalEntry(mutation: JournalDeleteMutation): Promise<JournalDeleteMutationResult> {
    return mutateAccount(this.userId, (account) => {
      const entries = (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []
      const map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
      const current = entries.find((candidate) => candidate.id === mutation.id)
      const receipt = account.journalDeletes[String(mutation.id)]
      if (
        current &&
        (current.ko !== mutation.expectedKo ||
          (current.revision ?? 0) !== mutation.expectedRevision)
      ) {
        throw new Error(`Journal entry ${mutation.id} revision conflict`)
      }
      if (
        !current &&
        receipt &&
        (receipt.ko !== mutation.expectedKo || receipt.revision !== mutation.expectedRevision)
      ) {
        throw new Error(`Journal delete ${mutation.id} payload conflict`)
      }
      const nextEntries = entries.filter((candidate) => candidate.id !== mutation.id)
      const progress = this.progressFromJournal(mutation.expectedKo, nextEntries, map)
      account.journalDeletes[String(mutation.id)] = {
        ko: mutation.expectedKo,
        revision: mutation.expectedRevision,
      }
      account.data[STORAGE_KEYS.log] = nextEntries
      account.data[STORAGE_KEYS.srs] = { ...map, [mutation.expectedKo]: mapState(progress) }
      return { deleted: true, id: mutation.id, progress }
    })
  }

  async markProgressSeen(ko: string, seenAt: number): Promise<ProgressRecord> {
    return mutateAccount(this.userId, (account) => {
      const map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
      const current = map[ko]
      const lastSeen = Math.max(current?.lastSeen ?? 0, seenAt)
      const progress: ProgressRecord = {
        ko,
        easyCount: current?.easyCount ?? 0,
        hardCount: current?.hardCount ?? 0,
        mastery: current?.mastery ?? 'seedling',
        lastSeen,
        revision: current ? (current.revision ?? 0) + (current.lastSeen === lastSeen ? 0 : 1) : 1,
      }
      account.data[STORAGE_KEYS.srs] = { ...map, [ko]: mapState(progress) }
      return progress
    })
  }

  async recalculateProgress(ko: string): Promise<ProgressRecord> {
    return mutateAccount(this.userId, (account) => {
      const entries = (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []
      const map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
      const progress = this.progressFromJournal(ko, entries, map)
      account.data[STORAGE_KEYS.srs] = { ...map, [ko]: mapState(progress) }
      return progress
    })
  }

  async restore(data: StorageRestore): Promise<void> {
    try {
      mutateAccount(this.userId, (account) => {
        const hasLog = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.log)
        const hasSrs = Object.prototype.hasOwnProperty.call(data, STORAGE_KEYS.srs)
        const affectedKos = new Set<string>()

        if (hasLog || hasSrs) {
          for (const entry of (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []) {
            affectedKos.add(entry.ko)
          }
          for (const ko of Object.keys(
            (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {},
          )) {
            affectedKos.add(ko)
          }
        }

        for (const [key, value] of Object.entries(data)) {
          if (key === STORAGE_KEYS.log || key === STORAGE_KEYS.srs) continue
          if (value === null || value === undefined) Reflect.deleteProperty(account.data, key)
          else account.data[key] = cloneBackendValue(value)
        }

        if (hasLog) {
          const imported = data[STORAGE_KEYS.log]
          if (imported === null || imported === undefined) {
            Reflect.deleteProperty(account.data, STORAGE_KEYS.log)
          } else {
            const entries = (imported as LogEntry[]).map((entry) => ({
              ...normalizeEntry(entry),
              revision: 0,
            }))
            account.data[STORAGE_KEYS.log] = entries
            for (const entry of entries) affectedKos.add(entry.ko)
          }
        }

        if (hasSrs) {
          const imported = data[STORAGE_KEYS.srs]
          if (imported === null || imported === undefined) {
            Reflect.deleteProperty(account.data, STORAGE_KEYS.srs)
          } else {
            const map = Object.fromEntries(
              Object.entries(imported as Record<string, SrsState>).map(([ko, state]) => {
                affectedKos.add(ko)
                return [
                  ko,
                  {
                    lastSeen: state.lastSeen,
                    easyCount: 0,
                    hardCount: 0,
                    mastery: 'seedling',
                    revision: 0,
                  } satisfies SrsState,
                ]
              }),
            )
            account.data[STORAGE_KEYS.srs] = map
          }
        }

        if (hasLog || hasSrs) {
          const entries = (account.data[STORAGE_KEYS.log] as LogEntry[] | undefined) ?? []
          let map = (account.data[STORAGE_KEYS.srs] as Record<string, SrsState> | undefined) ?? {}
          for (const ko of affectedKos) {
            const progress = this.progressFromJournal(ko, entries, map)
            const hasJournal = entries.some((entry) => entry.ko === ko)
            if (map[ko] || hasJournal) map = { ...map, [ko]: mapState(progress) }
            else {
              const nextMap = { ...map }
              Reflect.deleteProperty(nextMap, ko)
              map = nextMap
            }
          }
          account.data[STORAGE_KEYS.srs] = map
        }
      })
    } catch (error) {
      mutateAccount(this.userId, (account) => {
        account.lastError = error instanceof Error ? (error.stack ?? error.message) : String(error)
      })
      throw error
    }
  }

  async updateOne<V>(key: StorageKey, entry: { id: string | number; value: V }): Promise<boolean> {
    return mutateAccount(this.userId, (account) => {
      const list = (account.data[key] as Array<{ id: string | number }> | undefined) ?? []
      const found = list.some((item) => item.id === entry.id)
      account.data[key] = list.map((item) => (item.id === entry.id ? entry.value : item))
      return found
    })
  }

  async deleteOne(key: StorageKey, id: string | number): Promise<void> {
    mutateAccount(this.userId, (account) => {
      const list = (account.data[key] as Array<{ id: string | number }> | undefined) ?? []
      account.data[key] = list.filter((item) => item.id !== id)
    })
  }

  async remove(key: StorageKey): Promise<void> {
    mutateAccount(this.userId, (account) => {
      Reflect.deleteProperty(account.data, key)
    })
  }

  async clear(): Promise<void> {
    mutateAccount(this.userId, (account) => {
      account.data = {}
      account.activityReceipts = {}
      account.journalDeletes = {}
    })
  }
}

/** Test-only alias target; every signed-in identity gets a separate database. */
export function pickAdapter(args: AdapterPickArgs): StorageAdapter {
  return args.user ? new FakeStorageAdapter(args.user.id) : new NoopStorageAdapter()
}
