// munbeop/tests/unit/avatars/evaluate.test.ts
import { describe, it, expect } from 'vitest'
import { evaluateAvatars, type AvatarState } from '~/lib/avatars/evaluate'

const ZERO: AvatarState = {
  trees: 0,
  catalogTotal: 100,
  reviews: 0,
  longestStreak: 0,
  byLevel: {},
  labsEarned: { conjugation: false, counter: false, number: false, particle: false, register: false },
  escapeUnlocked: 0,
  escapeTotal: 16,
  leeches: 3,
}
const find = (s: AvatarState, stored: Set<string>, id: string) =>
  evaluateAvatars(s, stored).find((a) => a.id === id)!

describe('evaluateAvatars', () => {
  it('commons are always unlocked', () => {
    expect(find(ZERO, new Set(), 'seed').unlocked).toBe(true)
  })

  it('threshold rules lock below and unlock at the target', () => {
    expect(find({ ...ZERO, trees: 9 }, new Set(), 'sprout-cluster').unlocked).toBe(false)
    expect(find({ ...ZERO, trees: 10 }, new Set(), 'sprout-cluster').unlocked).toBe(true)
    expect(find({ ...ZERO, reviews: 100 }, new Set(), 'butterfly').unlocked).toBe(true)
    expect(find({ ...ZERO, longestStreak: 7 }, new Set(), 'ladybug').unlocked).toBe(true)
  })

  it('masteredPct uses ceil of catalog size', () => {
    expect(find({ ...ZERO, trees: 49, catalogTotal: 100 }, new Set(), 'owl').unlocked).toBe(false)
    expect(find({ ...ZERO, trees: 50, catalogTotal: 100 }, new Set(), 'owl').unlocked).toBe(true)
  })

  it('topikComplete needs every listed level fully mastered', () => {
    const partial = { ...ZERO, byLevel: { 5: { mastered: 10, total: 10 }, 6: { mastered: 3, total: 8 } } }
    expect(find(partial, new Set(), 'golden-crane').unlocked).toBe(false)
    const full = { ...ZERO, byLevel: { 5: { mastered: 10, total: 10 }, 6: { mastered: 8, total: 8 } } }
    expect(find(full, new Set(), 'golden-crane').unlocked).toBe(true)
  })

  it('labEarned and allLabs', () => {
    const oneLab = { ...ZERO, labsEarned: { ...ZERO.labsEarned, conjugation: true } }
    expect(find(oneLab, new Set(), 'frog').unlocked).toBe(true)
    expect(find(oneLab, new Set(), 'dokkaebi').unlocked).toBe(false)
    const allLabs = {
      ...ZERO,
      labsEarned: { conjugation: true, counter: true, number: true, particle: true, register: true },
    }
    expect(find(allLabs, new Set(), 'dokkaebi').unlocked).toBe(true)
  })

  it('escapeCosmetics count and "all"', () => {
    expect(find({ ...ZERO, escapeUnlocked: 4 }, new Set(), 'persimmon').unlocked).toBe(true)
    expect(find({ ...ZERO, escapeUnlocked: 15, escapeTotal: 16 }, new Set(), 'golden-toad').unlocked).toBe(false)
    expect(find({ ...ZERO, escapeUnlocked: 16, escapeTotal: 16 }, new Set(), 'golden-toad').unlocked).toBe(true)
  })

  it('flourish needs trees AND zero leeches', () => {
    expect(find({ ...ZERO, trees: 100, leeches: 1 }, new Set(), 'white-tiger').unlocked).toBe(false)
    expect(find({ ...ZERO, trees: 100, leeches: 0 }, new Set(), 'white-tiger').unlocked).toBe(true)
  })

  it('gardenComplete needs the whole catalog mastered', () => {
    expect(find({ ...ZERO, trees: 99, catalogTotal: 100 }, new Set(), 'tiger').unlocked).toBe(false)
    expect(find({ ...ZERO, trees: 100, catalogTotal: 100 }, new Set(), 'tiger').unlocked).toBe(true)
  })

  it('the stored set makes an avatar sticky even when its live rule is unmet', () => {
    expect(find(ZERO, new Set(['butterfly']), 'butterfly').unlocked).toBe(true)
  })

  it('collectAll unlocks only when all other 35 are unlocked', () => {
    // all non-collectAll ids "owned" via the stored set
    const others = evaluateAvatars(ZERO, new Set())
      .filter((a) => a.rule.kind !== 'collectAll')
      .map((a) => a.id)
    expect(find(ZERO, new Set(), 'mountain-spirit').unlocked).toBe(false)
    expect(find(ZERO, new Set(others), 'mountain-spirit').unlocked).toBe(true)
  })

  it('reports clamped progress for the locked bar', () => {
    const p = find({ ...ZERO, reviews: 320 }, new Set(), 'koi').progress
    expect(p).toEqual({ current: 320, target: 500 })
    const done = find({ ...ZERO, reviews: 900 }, new Set(), 'koi').progress
    expect(done).toEqual({ current: 500, target: 500 })
  })
})
