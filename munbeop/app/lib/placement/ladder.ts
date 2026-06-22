// app/lib/placement/ladder.ts
import type { TopikLevel } from '~/lib/domain'
import { Q_PER_LEVEL, PASS_THRESHOLD, MIN_LEVEL, MAX_LEVEL } from './config'

export interface LadderState {
  /** Level currently being tested. */
  currentLevel: TopikLevel
  correctInLevel: number
  askedInLevel: number
  /** Highest level passed so far (0 = none). */
  clearedLevel: number
  done: boolean
}

export interface PlacementOutcome {
  clearedLevel: number
  /** Frontier — first level not cleared, clamped to [1, 6]. */
  startingLevel: TopikLevel
  startingDeckId: string
}

export function createLadder(): LadderState {
  return { currentLevel: MIN_LEVEL, correctInLevel: 0, askedInLevel: 0, clearedLevel: 0, done: false }
}

/** Record one answer; advance/stop when the level's questions are exhausted. */
export function recordAnswer(state: LadderState, correct: boolean): LadderState {
  if (state.done) return state
  const askedInLevel = state.askedInLevel + 1
  const correctInLevel = state.correctInLevel + (correct ? 1 : 0)

  if (askedInLevel < Q_PER_LEVEL) {
    return { ...state, askedInLevel, correctInLevel }
  }

  // Level complete.
  if (correctInLevel < PASS_THRESHOLD) {
    return { ...state, askedInLevel, correctInLevel, done: true }
  }
  const clearedLevel = state.currentLevel
  if (state.currentLevel >= MAX_LEVEL) {
    return { ...state, askedInLevel, correctInLevel, clearedLevel, done: true }
  }
  return {
    currentLevel: (state.currentLevel + 1) as TopikLevel,
    correctInLevel: 0,
    askedInLevel: 0,
    clearedLevel,
    done: false,
  }
}

export function ladderOutcome(state: LadderState): PlacementOutcome {
  const startingLevel = Math.min(
    Math.max(state.clearedLevel + 1, MIN_LEVEL),
    MAX_LEVEL,
  ) as TopikLevel
  return { clearedLevel: state.clearedLevel, startingLevel, startingDeckId: `topik-${startingLevel}` }
}
