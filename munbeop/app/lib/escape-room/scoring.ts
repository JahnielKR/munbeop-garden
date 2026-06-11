import type { LevelRules, RewardTier } from '~/lib/domain'

/**
 * Compute the reward tier earned at the end of a successful run.
 *
 * Canonical rules (Secciones 5 and 7 of `docs/escape-room.md`):
 *
 *   - Pista 2 used in any puzzle of the run → cap at Common.
 *   - Legendary requires `consecutiveCleanRuns >= legendaryCleanRunsRequired` AND no hint.
 *     It does NOT require beating the Epic time threshold.
 *   - Epic requires no hint AND `runDurationSeconds < epicTimeThresholdSeconds`.
 *   - Rare requires no hint (any time, any racha below threshold).
 *   - Common is the default for completing the level at all.
 *
 * Priority on overlap: Legendary > Epic > Rare > Common.
 */

export interface RunOutcome {
  /** True if the player used Pista 2 in any puzzle of this run. */
  usedPremiumHint: boolean
  /** Wall-clock time of the run in seconds, excluding pauses. */
  runDurationSeconds: number
  /**
   * Including this completed run. So a player's first clean run = 1.
   * Reset to 0 by the caller when a game over occurs.
   */
  consecutiveCleanRuns: number
}

export function scoreRun(outcome: RunOutcome, rules: LevelRules): RewardTier {
  if (outcome.usedPremiumHint) return 'common'
  if (outcome.consecutiveCleanRuns >= rules.legendaryCleanRunsRequired) return 'legendary'
  if (outcome.runDurationSeconds < rules.epicTimeThresholdSeconds) return 'epic'
  return 'rare'
}
