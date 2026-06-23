import { describe, it, expect } from 'vitest'
import { PLACEMENT_ITEMS, PLACEMENT_ITEMS_BY_LEVEL } from '~/seed/placement'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { LOCALE_CODES, TOPIK_LEVELS } from '~/lib/domain'
import { Q_PER_LEVEL } from '~/lib/placement/config'

const HANGUL = /[가-힣]/
const catalogKos = new Set(DEFAULT_GRAMMAR.map((g) => g.ko))

describe('placement seed invariants', () => {
  it('every item ko exists in the grammar catalog', () => {
    for (const it of PLACEMENT_ITEMS) expect(catalogKos.has(it.ko), it.ko).toBe(true)
  })

  it('every sentence has exactly one {} blank and contains Hangul', () => {
    for (const it of PLACEMENT_ITEMS) {
      expect(it.sentence.split('{}').length, it.sentence).toBe(2)
      expect(HANGUL.test(it.sentence), it.sentence).toBe(true)
    }
  })

  it('every item has 3 distinct Hangul distractors ≠ answer', () => {
    for (const it of PLACEMENT_ITEMS) {
      expect(it.distractors, it.ko).toHaveLength(3)
      const all = [it.answer, ...it.distractors]
      expect(new Set(all).size, `${it.ko} duplicate option`).toBe(4)
      for (const d of it.distractors) expect(HANGUL.test(d), `${it.ko} distractor "${d}"`).toBe(true)
    }
  })

  it('every item level is 1..6 and matches its bucket', () => {
    for (const lvl of TOPIK_LEVELS) {
      for (const it of PLACEMENT_ITEMS_BY_LEVEL[lvl]) expect(it.level, it.ko).toBe(lvl)
    }
  })

  it('every trans and why is present in all 8 locales', () => {
    for (const it of PLACEMENT_ITEMS) {
      for (const code of LOCALE_CODES) {
        expect(it.trans[code], `${it.ko} trans ${code}`).toBeTruthy()
        expect(it.why[code], `${it.ko} why ${code}`).toBeTruthy()
      }
    }
  })

  it('every level has at least Q_PER_LEVEL items', () => {
    for (const lvl of TOPIK_LEVELS) {
      expect(PLACEMENT_ITEMS_BY_LEVEL[lvl].length, `level ${lvl}`).toBeGreaterThanOrEqual(Q_PER_LEVEL)
    }
  })
})
