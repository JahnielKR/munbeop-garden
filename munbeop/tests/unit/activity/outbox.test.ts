import { beforeEach, describe, expect, it } from 'vitest'
import { createActivityEvent } from '~/lib/activity/event'
import {
  acknowledgeActivityEvents,
  clearActivityOutbox,
  enqueueActivityEvent,
  listActivityEvents,
} from '~/lib/activity/outbox'

describe('activity outbox', () => {
  beforeEach(() => localStorage.clear())

  it('partitions durable events by account', () => {
    const eventA = createActivityEvent('practice', new Date(2026, 7, 20, 8).getTime())
    const eventB = createActivityEvent('counter', new Date(2026, 7, 21, 8).getTime())

    expect(enqueueActivityEvent('account-a', eventA)).toBe(true)
    expect(enqueueActivityEvent('account-b', eventB)).toBe(true)

    expect(listActivityEvents('account-a')).toEqual([eventA])
    expect(listActivityEvents('account-b')).toEqual([eventB])
  })

  it('acknowledges individual ids without deleting sibling events', () => {
    const first = createActivityEvent('practice', new Date(2026, 7, 20, 8).getTime())
    const second = createActivityEvent('practice', new Date(2026, 7, 20, 9).getTime())
    enqueueActivityEvent('account-a', first)
    enqueueActivityEvent('account-a', second)

    acknowledgeActivityEvents('account-a', [first.eventId])
    expect(listActivityEvents('account-a')).toEqual([second])

    clearActivityOutbox('account-a')
    expect(listActivityEvents('account-a')).toEqual([])
  })
})
