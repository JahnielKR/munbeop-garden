import { describe, it, expect } from 'vitest'
import { drawRun } from '~/lib/escape-room/shuffle'
import { makeLevel } from './_fixture'

describe('drawRun', () => {
  it('is deterministic for the same (level, seed)', () => {
    const level = makeLevel()
    const a = drawRun(level, 'seed-x')
    const b = drawRun(level, 'seed-x')
    expect(a).toEqual(b)
  })

  it('produces one DrawnSlot per slot in the level', () => {
    const level = makeLevel()
    const run = drawRun(level, 'any')
    expect(run.slots).toHaveLength(level.slots.length)
  })

  it('preserves slot order from the level', () => {
    const level = makeLevel()
    const run = drawRun(level, 'any')
    expect(run.slots.map((s) => s.slotId)).toEqual(level.slots.map((s) => s.id))
  })

  it('candidateIndex stays within [0, candidates.length) per slot', () => {
    const level = makeLevel()
    const run = drawRun(level, 'seed-x')
    for (let i = 0; i < level.slots.length; i++) {
      const slot = level.slots[i]!
      const drawn = run.slots[i]!
      expect(drawn.candidateIndex).toBeGreaterThanOrEqual(0)
      expect(drawn.candidateIndex).toBeLessThan(slot.candidates.length)
    }
  })

  it('different seeds usually pick different candidates', () => {
    const level = makeLevel()
    const a = drawRun(level, 'seed-alpha')
    const b = drawRun(level, 'seed-beta')
    const anyDifferent = a.slots.some(
      (s, i) => s.candidateIndex !== b.slots[i]!.candidateIndex,
    )
    expect(anyDifferent).toBe(true)
  })

  it('preserves levelId and seed in the output', () => {
    const level = makeLevel({ id: 'level-99' })
    const run = drawRun(level, 'seed-foo')
    expect(run.levelId).toBe('level-99')
    expect(run.seed).toBe('seed-foo')
  })

  it('a level with one candidate per slot always picks index 0', () => {
    const baseLevel = makeLevel()
    const singleCandidateLevel = makeLevel({
      slots: baseLevel.slots.map((slot) => {
        if (slot.type === 'selection') {
          return { ...slot, candidates: [slot.candidates[0]!] }
        }
        if (slot.type === 'completion') {
          return { ...slot, candidates: [slot.candidates[0]!] }
        }
        return { ...slot, candidates: [slot.candidates[0]!] }
      }),
    })
    const run = drawRun(singleCandidateLevel, 'seed-x')
    expect(run.slots.every((s) => s.candidateIndex === 0)).toBe(true)
  })
})
