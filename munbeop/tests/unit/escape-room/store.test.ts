import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { makeLevel, ls } from './_fixture'

/** Fixture level whose slot-3 creation candidates carry a soft-reject tile (index 2). */
function makeSoftLevel() {
  const level = makeLevel()
  const s3 = level.slots[2]
  if (s3.type === 'creation') {
    s3.candidates = s3.candidates.map((c) => ({ ...c, softRejectTiles: [2] as const }))
  }
  return level
}

describe('useEscapeRoomStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts idle with no active level', () => {
    const store = useEscapeRoomStore()
    expect(store.status).toBe('idle')
    expect(store.currentLevel).toBeNull()
    expect(store.currentRun).toBeNull()
    expect(store.errorsMade).toBe(0)
    expect(store.resolvedSlots).toEqual([])
  })

  it('startRun sets level, run, first room, and "playing" status', () => {
    const store = useEscapeRoomStore()
    const level = makeLevel()
    store.startRun(level, 'seed-1', 1000)
    expect(store.status).toBe('playing')
    expect(store.currentLevel?.id).toBe(level.id)
    expect(store.currentRun?.seed).toBe('seed-1')
    expect(store.currentRoomId).toBe('room-a')
    expect(store.errorsMade).toBe(0)
    expect(store.startedAt).toBe(1000)
  })

  it('enterRoom only changes currentRoomId for a room that exists', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed', 0)
    store.enterRoom('room-ghost')
    expect(store.currentRoomId).toBe('room-a')
    store.enterRoom('room-a')
    expect(store.currentRoomId).toBe('room-a')
  })

  it('answerSelection with the correct option resolves the slot', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    // Fixture: slot-1 selection candidates all have correctIndex = 0
    const result = store.answerSelection('slot-1', 0)
    expect(result).toBe('correct')
    expect(store.resolvedSlots).toContain('slot-1')
    expect(store.errorsMade).toBe(0)
  })

  it('answerSelection with a wrong option increments errorsMade', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    const result = store.answerSelection('slot-1', 1)
    expect(result).toBe('wrong')
    expect(store.errorsMade).toBe(1)
    expect(store.resolvedSlots).not.toContain('slot-1')
  })

  it('answerCompletion trims whitespace before comparing', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    // Fixture: slot-2 completion candidates all have answer === '이'
    expect(store.answerCompletion('slot-2', '  이  ')).toBe('correct')
    expect(store.resolvedSlots).toContain('slot-2')
  })

  it('answerCreation compares correctOrder array exactly', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    // Fixture: slot-3 creation candidates all have correctOrder = [0, 1]
    expect(store.answerCreation('slot-3', [0, 1])).toBe('correct')
    expect(store.answerCreation('slot-3', [0, 1, 2])).toBe('wrong')
  })

  it('exceeding maxErrors triggers game over and resets racha', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.consecutiveCleanRuns = 5 // pretend the player had a streak going
    // maxErrors = 2 in the fixture → 3rd error fires game over
    store.answerSelection('slot-1', 1)
    store.answerSelection('slot-1', 2)
    const fatal = store.answerSelection('slot-1', 3)
    expect(fatal).toBe('game-over')
    expect(store.status).toBe('gameover')
    expect(store.consecutiveCleanRuns).toBe(0)
  })

  it('resolving the last unresolved slot returns "level-complete" and sets status', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    const last = store.answerCreation('slot-3', [0, 1])
    expect(last).toBe('level-complete')
    expect(store.status).toBe('completed')
  })

  it('usePremiumHint flips the usedPremiumHint flag', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    expect(store.usedPremiumHint).toBe(false)
    store.useFreeHint('slot-1')
    expect(store.usedPremiumHint).toBe(false)
    store.usePremiumHint('slot-2')
    expect(store.usedPremiumHint).toBe(true)
  })

  it('complete() returns "epic" for a fast clean run', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    const tier = store.complete(60_000) // 60 seconds elapsed
    expect(tier).toBe('epic')
  })

  it('complete() returns "common" when premium hint was used', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.usePremiumHint('slot-1')
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    expect(store.complete(60_000)).toBe('common')
  })

  it('complete() increments racha on a clean run', () => {
    const store = useEscapeRoomStore()
    store.consecutiveCleanRuns = 1
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    store.complete(60_000)
    expect(store.consecutiveCleanRuns).toBe(2)
  })

  it('complete() resets racha when premium hint was used', () => {
    const store = useEscapeRoomStore()
    store.consecutiveCleanRuns = 2
    store.startRun(makeLevel(), 'seed-x', 0)
    store.usePremiumHint('slot-1')
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    store.complete(60_000)
    expect(store.consecutiveCleanRuns).toBe(0)
  })

  it('complete() awards Legendary when the new racha hits the threshold', () => {
    const store = useEscapeRoomStore()
    // Fixture's legendaryCleanRunsRequired = 3
    store.consecutiveCleanRuns = 2 // about to hit 3 with this clean run
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    expect(store.complete(60_000)).toBe('legendary')
  })

  it('complete() unlocks the matching cosmetic id (idempotent across runs)', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    store.complete(60_000)
    expect(store.unlockedCosmetics).toContain('r-e') // epic in fixture

    // Run a second time — same tier → no duplicate entry
    store.reset()
    store.startRun(makeLevel(), 'seed-y', 0)
    store.answerSelection('slot-1', 0)
    store.answerCompletion('slot-2', '이')
    store.answerCreation('slot-3', [0, 1])
    store.complete(60_000)
    expect(store.unlockedCosmetics.filter((id) => id === 'r-e')).toHaveLength(1)
  })

  it('reset() clears run state but keeps racha and cosmetics', () => {
    const store = useEscapeRoomStore()
    store.consecutiveCleanRuns = 7
    store.unlockedCosmetics = ['r-c', 'r-r']
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 0)
    store.reset()
    expect(store.status).toBe('idle')
    expect(store.currentLevel).toBeNull()
    expect(store.resolvedSlots).toEqual([])
    expect(store.consecutiveCleanRuns).toBe(7)
    expect(store.unlockedCosmetics).toEqual(['r-c', 'r-r'])
  })

  it('soft-rejects a present-tense tile once (no error), then errors normally', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeSoftLevel(), 'seed-soft', 0)
    // First submission containing the soft tile (index 2): nudge, no error.
    expect(store.answerCreation('slot-3', [0, 1, 2])).toBe('soft-reject')
    expect(store.errorsMade).toBe(0)
    expect(store.resolvedSlots).not.toContain('slot-3')
    // Second time the free pass is spent → normal error.
    expect(store.answerCreation('slot-3', [0, 1, 2])).toBe('wrong')
    expect(store.errorsMade).toBe(1)
    // The correct order still resolves the slot afterwards.
    expect(store.answerCreation('slot-3', [0, 1])).toBe('correct')
    expect(store.resolvedSlots).toContain('slot-3')
  })

  it('does NOT soft-reject a wrong answer that omits the soft tile', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeSoftLevel(), 'seed-soft-2', 0)
    // Wrong order, but no soft tile → a normal error from the first try.
    expect(store.answerCreation('slot-3', [1, 0])).toBe('wrong')
    expect(store.errorsMade).toBe(1)
  })

  it('resets the soft-reject pass on a new run', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeSoftLevel(), 'seed-soft-3', 0)
    expect(store.answerCreation('slot-3', [0, 1, 2])).toBe('soft-reject')
    store.reset()
    store.startRun(makeSoftLevel(), 'seed-soft-4', 0)
    // Fresh run → the free pass is available again.
    expect(store.answerCreation('slot-3', [0, 1, 2])).toBe('soft-reject')
    expect(store.errorsMade).toBe(0)
  })

  it('scriptedBeatAfter returns the matching beat or null', () => {
    const store = useEscapeRoomStore()
    const level = makeLevel({
      scriptedBeats: [{ afterSlotId: 'slot-1', voiceLine: '…보내신 것 같아요.', narrative: ls('beat') }],
    })
    store.startRun(level, 'seed-beat', 0)
    expect(store.scriptedBeatAfter('slot-1')?.afterSlotId).toBe('slot-1')
    expect(store.scriptedBeatAfter('slot-2')).toBeNull()
  })

  it('ignores answer methods after game over', () => {
    const store = useEscapeRoomStore()
    store.startRun(makeLevel(), 'seed-x', 0)
    store.answerSelection('slot-1', 1)
    store.answerSelection('slot-1', 2)
    store.answerSelection('slot-1', 3) // game over
    expect(store.status).toBe('gameover')
    const after = store.answerSelection('slot-1', 0)
    expect(after).toBe('wrong')
    expect(store.resolvedSlots).not.toContain('slot-1')
  })
})
