import { describe, it, expect } from 'vitest'
import { shouldShowOnboarding } from '~/lib/onboarding/gate'

describe('shouldShowOnboarding', () => {
  it('is true only when ready AND log empty AND not onboarded', () => {
    expect(shouldShowOnboarding({ ready: true, logEmpty: true, onboarded: false })).toBe(true)
  })
  it('is false in every other combination', () => {
    for (const ready of [true, false]) {
      for (const logEmpty of [true, false]) {
        for (const onboarded of [true, false]) {
          if (ready && logEmpty && !onboarded) continue
          expect(
            shouldShowOnboarding({ ready, logEmpty, onboarded }),
            `${ready}/${logEmpty}/${onboarded}`,
          ).toBe(false)
        }
      }
    }
  })
})
