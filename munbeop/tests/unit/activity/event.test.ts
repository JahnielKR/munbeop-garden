import { describe, expect, it, vi } from 'vitest'
import { createActivityEvent, isActivityEvent } from '~/lib/activity/event'

describe('activity events', () => {
  it('captures one stable instant and local calendar day', () => {
    const now = new Date(2026, 7, 22, 23, 59, 58).getTime()
    const event = createActivityEvent('sentence-garden', now)

    expect(event.occurredAt).toBe(new Date(now).toISOString())
    expect(event.localDay).toBe('2026-08-22')
    expect(event.source).toBe('sentence-garden')
    expect(isActivityEvent(event)).toBe(true)
  })

  it('rejects malformed or unknown-source events', () => {
    const event = createActivityEvent('practice')
    expect(isActivityEvent({ ...event, eventId: 'not-a-uuid' })).toBe(false)
    expect(isActivityEvent({ ...event, source: 'mystery-mode' })).toBe(false)
    expect(isActivityEvent({ ...event, utcOffsetMinutes: 9999 })).toBe(false)
  })

  it('canonicalizes a UTC offset as positive zero before persistence', () => {
    const offsetSpy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0)

    try {
      const event = createActivityEvent('practice', Date.UTC(2026, 7, 22, 12))
      expect(event.utcOffsetMinutes).toBe(0)
      expect(Object.is(event.utcOffsetMinutes, -0)).toBe(false)
    } finally {
      offsetSpy.mockRestore()
    }
  })
})
