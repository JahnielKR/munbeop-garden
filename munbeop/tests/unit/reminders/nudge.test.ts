import { describe, it, expect } from 'vitest'
import { shouldNudge, ABSENCE_MS, NUDGE_COOLDOWN_MS } from '~/lib/reminders/nudge'

const NOW = Date.UTC(2026, 5, 22, 12)
const base = {
  enabled: true,
  readyCount: 3,
  lastVisitAt: NOW - ABSENCE_MS - 1, // safely away
  lastNudgeAt: null as number | null,
  now: NOW,
}

describe('shouldNudge', () => {
  it('nudges on return after the absence window with ready plants', () => {
    expect(shouldNudge(base)).toBe(true)
  })
  it('never nudges when disabled', () => {
    expect(shouldNudge({ ...base, enabled: false })).toBe(false)
  })
  it('never nudges with no ready plants', () => {
    expect(shouldNudge({ ...base, readyCount: 0 })).toBe(false)
  })
  it('never nudges on the first ever visit (lastVisitAt null)', () => {
    expect(shouldNudge({ ...base, lastVisitAt: null })).toBe(false)
  })
  it('does not nudge before the absence window elapses', () => {
    expect(shouldNudge({ ...base, lastVisitAt: NOW - ABSENCE_MS + 1 })).toBe(false)
  })
  it('respects the cooldown (no repeat nudge within the window)', () => {
    expect(shouldNudge({ ...base, lastNudgeAt: NOW - NUDGE_COOLDOWN_MS + 1 })).toBe(false)
  })
  it('nudges again once the cooldown has elapsed', () => {
    expect(shouldNudge({ ...base, lastNudgeAt: NOW - NUDGE_COOLDOWN_MS - 1 })).toBe(true)
  })
})
