import { describe, it, expect } from 'vitest'
import { choicesFor } from '~/lib/numbers-market'
import { MARKET_ITEMS } from '~/seed/numbers-market'

const identity = <T>(xs: T[]): T[] => xs

describe('choicesFor', () => {
  it('returns exactly 4 distinct options including the answer', () => {
    for (const it of MARKET_ITEMS) {
      const opts = choicesFor(it, MARKET_ITEMS, identity)
      expect(opts, it.id).toHaveLength(4)
      expect(new Set(opts).size, it.id).toBe(4)
      expect(opts, it.id).toContain(it.answer)
    }
  })

  it('prefers same-domain distractors when available', () => {
    const timeItem = MARKET_ITEMS.find((i) => i.id === 'time-3-15')!
    const opts = choicesFor(timeItem, MARKET_ITEMS, identity)
    // The time pool is large, so all 3 distractors are same-domain readings.
    const timeAnswers = new Set(MARKET_ITEMS.filter((i) => i.domain === 'time').map((i) => i.answer))
    expect(opts).toHaveLength(4)
    for (const opt of opts) expect(timeAnswers.has(opt), opt).toBe(true)
  })

  it('fills from other domains when a domain is too small for 3 distractors', () => {
    // Craft a source where the item's domain has only itself → must borrow.
    const sino = MARKET_ITEMS.find((i) => i.id === 'sino-100')!
    const small = [sino, ...MARKET_ITEMS.filter((i) => i.domain !== 'sino-basics').slice(0, 5)]
    const opts = choicesFor(sino, small, identity)
    expect(opts).toHaveLength(4)
    expect(new Set(opts).size).toBe(4)
  })
})
