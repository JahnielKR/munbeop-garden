import { describe, it, expect } from 'vitest'
import type { Grammar, MasteryLevel } from '~/lib/domain'
import { filterByMastery, isMasteryFilterValue } from '~/lib/library/mastery-filter'

const g = (ko: string): Grammar => ({
  ko,
  meaning: { en: ko, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
})

const items = [g('a'), g('b'), g('c'), g('d')]
const masteryMap: Record<string, MasteryLevel> = { a: 'seedling', b: 'plant', c: 'tree', d: 'seedling' }
const masteryOf = (ko: string) => masteryMap[ko] ?? 'seedling'
const leeches = new Set(['b', 'd'])
const isLeech = (ko: string) => leeches.has(ko)

describe('filterByMastery', () => {
  it('returns everything when the filter is null', () => {
    expect(filterByMastery(items, null, masteryOf, isLeech)).toHaveLength(4)
  })

  it('keeps only grammars at the given mastery level, preserving order', () => {
    expect(filterByMastery(items, 'seedling', masteryOf, isLeech).map((x) => x.ko)).toEqual(['a', 'd'])
    expect(filterByMastery(items, 'plant', masteryOf, isLeech).map((x) => x.ko)).toEqual(['b'])
    expect(filterByMastery(items, 'tree', masteryOf, isLeech).map((x) => x.ko)).toEqual(['c'])
  })

  it('"hard" keeps the leech set, independent of mastery level', () => {
    expect(filterByMastery(items, 'hard', masteryOf, isLeech).map((x) => x.ko)).toEqual(['b', 'd'])
  })

  it('returns empty when nothing matches', () => {
    expect(filterByMastery([g('a')], 'tree', masteryOf, isLeech)).toEqual([])
  })
})

describe('isMasteryFilterValue', () => {
  it('accepts the four valid values', () => {
    for (const v of ['seedling', 'plant', 'tree', 'hard']) expect(isMasteryFilterValue(v)).toBe(true)
  })
  it('rejects anything else', () => {
    for (const v of ['', 'leaf', 'HARD', null, undefined, 3]) expect(isMasteryFilterValue(v)).toBe(false)
  })
})
