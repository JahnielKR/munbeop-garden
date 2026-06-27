import { describe, it, expect } from 'vitest'
import { MARKET_ITEMS, itemsForDomain } from '~/seed/numbers-market'
import { LOCALE_CODES, type NumberDomain } from '~/lib/domain'

const DOMAINS: NumberDomain[] = ['counting', 'sino-basics', 'time', 'money', 'dates', 'phone']

describe('number-market seed invariants', () => {
  it('every item id is unique', () => {
    const ids = MARKET_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every item tiles join to exactly the answer', () => {
    for (const it of MARKET_ITEMS) {
      expect(it.tiles.join(' '), it.id).toBe(it.answer)
    }
  })

  it('every lure is non-empty, and lures are disjoint from the correct tiles', () => {
    for (const it of MARKET_ITEMS) {
      expect(it.lures.length, `${it.id} has no lures`).toBeGreaterThan(0)
      const correct = new Set(it.tiles)
      for (const lure of it.lures) {
        expect(lure.length, `${it.id} empty lure`).toBeGreaterThan(0)
        expect(correct.has(lure), `${it.id} lure ${lure} collides with a correct tile`).toBe(false)
      }
      expect(new Set(it.lures).size, `${it.id} duplicate lures`).toBe(it.lures.length)
    }
  })

  it('every item has a non-empty valueKey', () => {
    for (const it of MARKET_ITEMS) expect(it.valueKey.length, it.id).toBeGreaterThan(0)
  })

  it('every item trans is present in all 8 locales', () => {
    for (const it of MARKET_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.id} ${code}`).toBeTruthy()
      }
    }
  })

  it('every domain has a deep pool (≥10) so Dictation rounds vary', () => {
    for (const d of DOMAINS) {
      expect(itemsForDomain(d).length, `${d} item count`).toBeGreaterThanOrEqual(10)
    }
  })
})
