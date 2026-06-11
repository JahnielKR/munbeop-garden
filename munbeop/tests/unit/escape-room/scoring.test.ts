import { describe, it, expect } from 'vitest'
import { scoreRun, type RunOutcome } from '~/lib/escape-room/scoring'
import type { LevelRules } from '~/lib/domain'

const rules: LevelRules = {
  maxErrors: 2,
  epicTimeThresholdSeconds: 480,
  legendaryCleanRunsRequired: 3,
}

const outcome = (over: Partial<RunOutcome>): RunOutcome => ({
  usedPremiumHint: false,
  runDurationSeconds: 600,
  consecutiveCleanRuns: 1,
  ...over,
})

describe('scoreRun', () => {
  it('caps the reward at Common when any premium hint was used', () => {
    expect(
      scoreRun(
        outcome({ usedPremiumHint: true, runDurationSeconds: 60, consecutiveCleanRuns: 99 }),
        rules,
      ),
    ).toBe('common')
  })

  it('returns Rare when no hint + over time + below racha', () => {
    expect(scoreRun(outcome({ runDurationSeconds: 600, consecutiveCleanRuns: 1 }), rules)).toBe(
      'rare',
    )
  })

  it('returns Epic when no hint + under time + below racha', () => {
    expect(scoreRun(outcome({ runDurationSeconds: 300, consecutiveCleanRuns: 1 }), rules)).toBe(
      'epic',
    )
  })

  it('returns Legendary when racha hits the threshold (and no hint)', () => {
    expect(scoreRun(outcome({ runDurationSeconds: 300, consecutiveCleanRuns: 3 }), rules)).toBe(
      'legendary',
    )
  })

  it('Legendary does NOT require beating the time threshold', () => {
    expect(scoreRun(outcome({ runDurationSeconds: 600, consecutiveCleanRuns: 3 }), rules)).toBe(
      'legendary',
    )
  })

  it('exactly at the time threshold counts as over → Rare (strict <)', () => {
    expect(
      scoreRun(
        outcome({
          runDurationSeconds: rules.epicTimeThresholdSeconds,
          consecutiveCleanRuns: 1,
        }),
        rules,
      ),
    ).toBe('rare')
  })

  it('racha one below threshold is not yet Legendary', () => {
    expect(scoreRun(outcome({ runDurationSeconds: 300, consecutiveCleanRuns: 2 }), rules)).toBe(
      'epic',
    )
  })

  it('honors a custom legendaryCleanRunsRequired in rules', () => {
    const strict: LevelRules = { ...rules, legendaryCleanRunsRequired: 5 }
    expect(scoreRun(outcome({ runDurationSeconds: 300, consecutiveCleanRuns: 4 }), strict)).toBe(
      'epic',
    )
    expect(scoreRun(outcome({ runDurationSeconds: 300, consecutiveCleanRuns: 5 }), strict)).toBe(
      'legendary',
    )
  })
})
