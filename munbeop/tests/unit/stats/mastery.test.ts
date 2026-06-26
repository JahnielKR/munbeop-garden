import { describe, it, expect } from 'vitest'
import { masteryByLevel, toughestGrammar } from '~/lib/stats/mastery'
import { pathProgress } from '~/lib/paths/progress'
import type { Grammar, SrsState } from '~/lib/domain'

const L = (over: Record<string, string>) => ({ en: '', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '', ...over })
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L({ en: ko }), deckId })
const srs = (over: Partial<SrsState>): SrsState => ({ lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling', ...over })

describe('masteryByLevel', () => {
  it('groups grammar by TOPIK deck and splits seedling/plant/tree; untouched counts toward total only', () => {
    const grammars = [g('koA', 'topik-1'), g('koB', 'topik-1'), g('koC', 'topik-2')]
    const map = { koA: srs({ mastery: 'tree' }), koC: srs({ mastery: 'plant' }) }
    const levels = masteryByLevel(grammars, map)
    expect(levels).toHaveLength(6)
    const l1 = levels.find((l) => l.level === 1)!
    expect(l1).toMatchObject({ seedling: 0, plant: 0, tree: 1, total: 2, pct: 50 })
    const l2 = levels.find((l) => l.level === 2)!
    expect(l2).toMatchObject({ plant: 1, total: 1, pct: 100 })
    expect(levels.find((l) => l.level === 6)!).toMatchObject({ total: 0, pct: 0 })
  })

  it('ignores non-TOPIK decks (general / custom)', () => {
    const levels = masteryByLevel([g('x', 'general'), g('y', 'my-deck')], {})
    expect(levels.every((l) => l.total === 0)).toBe(true)
  })

  it('counts only learned (plant+tree) toward pct; seedlings are 0%', () => {
    const grammars = [g('a', 'topik-1'), g('b', 'topik-1'), g('c', 'topik-1'), g('d', 'topik-1')]
    // 4 grammars: 2 merely seen (seedling), 1 plant, 1 tree → learned 2/4 = 50%
    const map = {
      a: srs({ mastery: 'seedling' }),
      b: srs({ mastery: 'seedling' }),
      c: srs({ mastery: 'plant' }),
      d: srs({ mastery: 'tree' }),
    }
    const l1 = masteryByLevel(grammars, map).find((l) => l.level === 1)!
    expect(l1).toMatchObject({ seedling: 2, plant: 1, tree: 1, total: 4, pct: 50 })
  })

  it('an all-seedling level (browsed but never learned) reads 0%', () => {
    const grammars = [g('a', 'topik-1'), g('b', 'topik-1')]
    const map = { a: srs({ mastery: 'seedling' }), b: srs({ mastery: 'seedling' }) }
    expect(masteryByLevel(grammars, map).find((l) => l.level === 1)!.pct).toBe(0)
  })
})

describe('toughestGrammar', () => {
  it('returns the top grammars by hardCount, excluding zero, with meaning attached', () => {
    const grammars = [g('koA', 'topik-1'), g('koB', 'topik-1'), g('koC', 'topik-2')]
    const map = {
      koA: srs({ hardCount: 5 }),
      koB: srs({ hardCount: 9 }),
      koC: srs({ hardCount: 0 }),
    }
    const top = toughestGrammar(map, grammars, 5)
    expect(top.map((t) => t.ko)).toEqual(['koB', 'koA'])
    expect(top[0]).toMatchObject({ ko: 'koB', hardCount: 9 })
    expect(top[0]!.meaning?.en).toBe('koB')
  })

  it('respects the n limit', () => {
    const grammars = [g('a', 'topik-1'), g('b', 'topik-1'), g('c', 'topik-1')]
    const map = { a: srs({ hardCount: 3 }), b: srs({ hardCount: 2 }), c: srs({ hardCount: 1 }) }
    expect(toughestGrammar(map, grammars, 2).map((t) => t.ko)).toEqual(['a', 'b'])
  })

  it('is empty when nothing has been found hard', () => {
    expect(toughestGrammar({}, [], 5)).toEqual([])
  })
})

describe('masteryByLevel ↔ pathProgress parity', () => {
  it('level pct equals pathProgress pct for the same topik-N kos', () => {
    const grammars = [g('a', 'topik-3'), g('b', 'topik-3'), g('c', 'topik-3')]
    const map = { a: srs({ mastery: 'tree' }), b: srs({ mastery: 'plant' }), c: srs({ mastery: 'seedling' }) }
    const lvl = masteryByLevel(grammars, map).find((l) => l.level === 3)!
    const path = pathProgress(['a', 'b', 'c'], map)
    expect(lvl.pct).toBe(Math.round(path.pct * 100)) // both = 2/3 → 67
  })
})
