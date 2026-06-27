import { describe, it, expect } from 'vitest'
import { tilePool, buildRound, itemId, scoreOf } from '~/lib/numbers-market'
import { NUMBER_DOMAINS, masteryOf, MASTER_DOMAIN_IDS } from '~/lib/numbers-market/sets'
import { MARKET_ITEMS, itemsForDomain } from '~/seed/numbers-market'

const identity = <T>(xs: T[]): T[] => xs

describe('tilePool', () => {
  it('returns the correct tiles plus the lures (superset of the answer tiles)', () => {
    const it = MARKET_ITEMS.find((i) => i.id === 'time-3-15')!
    const pool = tilePool(it)
    for (const t of it.tiles) expect(pool).toContain(t)
    for (const l of it.lures) expect(pool).toContain(l)
    expect(pool.length).toBe(it.tiles.length + it.lures.length)
  })
})

describe('buildRound', () => {
  it('draws up to n items from a single domain', () => {
    const round = buildRound('time', 8, identity)
    expect(round.length).toBe(itemsForDomain('time').length) // fewer than 8 in the first batch
    expect(round.every((i) => i.domain === 'time')).toBe(true)
  })
})

describe('itemId / scoreOf', () => {
  it('itemId is the item id and is unique across the seed', () => {
    const ids = MARKET_ITEMS.map(itemId)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('scoreOf computes accuracy', () => {
    expect(scoreOf([{ itemId: 'a', correct: true }, { itemId: 'b', correct: false }])).toEqual({
      correct: 1, total: 2, accuracy: 0.5,
    })
  })
})

describe('domain sets + mastery', () => {
  it('the 6 domains are defined and reference real seed domains', () => {
    expect(NUMBER_DOMAINS.map((d) => d.id)).toEqual(
      ['counting', 'sino-basics', 'time', 'money', 'dates', 'phone'],
    )
    for (const d of NUMBER_DOMAINS) expect(itemsForDomain(d.id).length).toBeGreaterThan(0)
  })
  it('mastery earned only when every domain is cleared', () => {
    expect(masteryOf(new Set()).earned).toBe(false)
    expect(masteryOf(new Set(MASTER_DOMAIN_IDS)).earned).toBe(true)
  })
})
