import { describe, it, expect } from 'vitest'
import { COUNTER_SETS, masteryOf, MASTER_SET_IDS } from '~/lib/counters/sets'
import { COUNTERS } from '~/seed/counters'

describe('counter sets', () => {
  it('every set references real counter ids and every counter is in some set', () => {
    const allIds = new Set(COUNTERS.map((c) => c.id))
    const used = new Set<string>()
    for (const s of COUNTER_SETS) {
      for (const id of s.counterIds) {
        expect(allIds.has(id), `${s.id} → ${id}`).toBe(true)
        used.add(id)
      }
    }
    for (const c of COUNTERS) expect(used.has(c.id), `${c.id} in no set`).toBe(true)
  })
})

describe('masteryOf', () => {
  it('earned only when every set is cleared', () => {
    expect(masteryOf(new Set()).earned).toBe(false)
    expect(masteryOf(new Set(MASTER_SET_IDS)).earned).toBe(true)
  })
})
