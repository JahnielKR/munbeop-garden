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
    // All same-domain siblings should appear (time has 3 items total → all 3 readings present)
    const timeSiblingAnswers = MARKET_ITEMS.filter((i) => i.domain === 'time').map((i) => i.answer)
    for (const sibling of timeSiblingAnswers) expect(opts, sibling).toContain(sibling)
  })

  it('fills from other domains when a domain is too small for 3 distractors', () => {
    const sino = MARKET_ITEMS.find((i) => i.id === 'sino-100')!
    const opts = choicesFor(sino, MARKET_ITEMS, identity)
    expect(opts).toHaveLength(4)
    expect(new Set(opts).size).toBe(4)
  })
})
