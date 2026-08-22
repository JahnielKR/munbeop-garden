import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'
import type { ActivityEvent } from '~/lib/activity/event'

const read = vi.fn(async () => ({}))
const recordActivityEvents = vi.fn()

vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read, recordActivityEvents }),
}))

function signIn(userId = 'u-1') {
  useAuthStore().user = { id: userId } as never
}

describe('useActivityStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    signIn()
    read.mockReset()
    read.mockResolvedValue({})
    recordActivityEvents.mockReset()

    const receipts = new Map<string, ActivityEvent>()
    const totals: Record<string, number> = {}
    recordActivityEvents.mockImplementation(async (events: ActivityEvent[]) => {
      for (const event of events) {
        if (!receipts.has(event.eventId)) {
          receipts.set(event.eventId, event)
          totals[event.localDay] = (totals[event.localDay] ?? 0) + 1
        }
      }
      return {
        acknowledgedIds: events.map((event) => event.eventId),
        totalsByDay: Object.fromEntries(
          [...new Set(events.map((event) => event.localDay))].map((day) => [day, totals[day] ?? 0]),
        ),
      }
    })
  })

  it('records immutable, timezone-stable events with their source', async () => {
    const store = useActivityStore()
    await store.hydrate()
    const now = new Date(2026, 5, 26, 10).getTime()

    await store.record('practice', now)
    await store.record('counter', now)

    expect(store.map['2026-06-26']).toEqual({ count: 2 })
    expect(recordActivityEvents).toHaveBeenCalledTimes(2)
    const first = recordActivityEvents.mock.calls[0]![0][0] as ActivityEvent
    expect(first).toMatchObject({
      localDay: '2026-06-26',
      occurredAt: new Date(now).toISOString(),
      source: 'practice',
    })
    expect(first.eventId).toMatch(/^[0-9a-f-]{36}$/)
    expect(Number.isInteger(first.utcOffsetMinutes)).toBe(true)
  })

  it('retries the same event id after a committed response is lost', async () => {
    const committed = new Map<string, ActivityEvent>()
    let firstId = ''
    recordActivityEvents
      .mockImplementationOnce(async (events: ActivityEvent[]) => {
        firstId = events[0]!.eventId
        committed.set(firstId, events[0]!)
        throw new Error('response lost')
      })
      .mockImplementationOnce(async (events: ActivityEvent[]) => {
        expect(events[0]!.eventId).toBe(firstId)
        return {
          acknowledgedIds: [firstId],
          totalsByDay: { [events[0]!.localDay]: committed.size },
        }
      })

    const firstStore = useActivityStore()
    await firstStore.hydrate()
    await expect(firstStore.record('practice', new Date(2026, 6, 6, 10).getTime())).resolves.toBe(
      false,
    )

    setActivePinia(createPinia())
    signIn()
    const reloaded = useActivityStore()
    await reloaded.hydrate()

    expect(reloaded.map['2026-07-06']).toEqual({ count: 1 })
    expect(recordActivityEvents).toHaveBeenCalledTimes(2)
  })

  it('keeps an offline event across a reload and flushes it on hydrate', async () => {
    recordActivityEvents.mockRejectedValueOnce(new Error('offline'))
    const firstStore = useActivityStore()
    await firstStore.hydrate()
    await firstStore.record('dictation', new Date(2026, 6, 7, 10).getTime())

    setActivePinia(createPinia())
    signIn()
    recordActivityEvents.mockImplementationOnce(async (events: ActivityEvent[]) => ({
      acknowledgedIds: events.map((event) => event.eventId),
      totalsByDay: { '2026-07-07': 1 },
    }))

    const reloaded = useActivityStore()
    await reloaded.hydrate()
    expect(reloaded.map['2026-07-07']).toEqual({ count: 1 })
  })

  it("does not expose another account's pending events", async () => {
    recordActivityEvents.mockRejectedValueOnce(new Error('offline'))
    const accountA = useActivityStore()
    await accountA.hydrate()
    await accountA.record('register', new Date(2026, 7, 1, 9).getTime())

    setActivePinia(createPinia())
    signIn('u-2')
    const accountB = useActivityStore()
    await accountB.hydrate()

    expect(accountB.map).toEqual({})
  })

  it('does not replace a cloud count when authenticated hydration fails', async () => {
    read.mockRejectedValueOnce(new Error('network down'))
    const store = useActivityStore()

    await expect(store.hydrate()).rejects.toThrow('network down')
    await store.record('practice', new Date(2026, 6, 7, 10).getTime())

    expect(recordActivityEvents).not.toHaveBeenCalled()
    expect(store.map).toEqual({})
  })

  it('batches answers that arrive while a flush is in flight', async () => {
    let releaseFirst!: () => void
    recordActivityEvents
      .mockImplementationOnce(
        (events: ActivityEvent[]) =>
          new Promise((resolve) => {
            releaseFirst = () =>
              resolve({
                acknowledgedIds: [events[0]!.eventId],
                totalsByDay: { [events[0]!.localDay]: 1 },
              })
          }),
      )
      .mockImplementationOnce(async (events: ActivityEvent[]) => ({
        acknowledgedIds: events.map((event) => event.eventId),
        totalsByDay: { [events[0]!.localDay]: 3 },
      }))

    const store = useActivityStore()
    await store.hydrate()
    const now = new Date(2026, 5, 26, 10).getTime()
    const first = store.record('practice', now)
    const second = store.record('practice', now)
    const third = store.record('practice', now)
    expect(recordActivityEvents).toHaveBeenCalledTimes(1)

    releaseFirst()
    await expect(Promise.all([first, second, third])).resolves.toEqual([true, true, true])
    expect(recordActivityEvents.mock.calls[1]![0]).toHaveLength(2)
    expect(store.map['2026-06-26']).toEqual({ count: 3 })
  })
})
