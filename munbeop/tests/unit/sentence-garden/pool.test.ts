import { describe, it, expect } from 'vitest'
import { SENTENCE_GARDEN_POOL, SENTENCE_GARDEN_EXCLUDE } from '~/lib/sentence-garden/pool'
import { TOPIK_1_EXAMPLES } from '~/seed/grammar-examples/n1'
import { TOPIK_2_EXAMPLES } from '~/seed/grammar-examples/n2'
import { TOPIK_3_EXAMPLES } from '~/seed/grammar-examples/n3'
import { TOPIK_4_EXAMPLES } from '~/seed/grammar-examples/n4'
import { TOPIK_5_EXAMPLES } from '~/seed/grammar-examples/n5'
import { TOPIK_6_EXAMPLES } from '~/seed/grammar-examples/n6'

const RAW = [
  ...TOPIK_1_EXAMPLES, ...TOPIK_2_EXAMPLES, ...TOPIK_3_EXAMPLES,
  ...TOPIK_4_EXAMPLES, ...TOPIK_5_EXAMPLES, ...TOPIK_6_EXAMPLES,
]
const eo = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const short = (s: string) => eo(s) >= 3 && eo(s) <= 5

describe('SENTENCE_GARDEN_POOL', () => {
  it('draws from all six TOPIK levels — 3-6 each contribute a playable short sentence', () => {
    const inPool = new Set(SENTENCE_GARDEN_POOL.map((e) => e.sentence))
    for (const arr of [TOPIK_3_EXAMPLES, TOPIK_4_EXAMPLES, TOPIK_5_EXAMPLES, TOPIK_6_EXAMPLES]) {
      const playable = arr.filter((e) => short(e.sentence) && !SENTENCE_GARDEN_EXCLUDE.has(e.sentence))
      expect(playable.length).toBeGreaterThan(0)
      expect(inPool.has(playable[0]!.sentence)).toBe(true)
    }
  })

  it('is the whole TOPIK 1-6 corpus minus exactly the excluded sentences', () => {
    const removed = RAW.filter((e) => SENTENCE_GARDEN_EXCLUDE.has(e.sentence)).length
    expect(SENTENCE_GARDEN_POOL.length).toBe(RAW.length - removed)
    expect(SENTENCE_GARDEN_POOL.length).toBeGreaterThan(500)
    for (const s of SENTENCE_GARDEN_EXCLUDE) {
      expect(SENTENCE_GARDEN_POOL.some((e) => e.sentence === s)).toBe(false)
    }
  })

  it('every excluded sentence still exists in the raw seeds (no stale denylist)', () => {
    const raw = new Set(RAW.map((e) => e.sentence))
    for (const s of SENTENCE_GARDEN_EXCLUDE) {
      expect({ s, present: raw.has(s) }).toEqual({ s, present: true })
    }
  })
})
