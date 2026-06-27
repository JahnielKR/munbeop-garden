import { describe, it, expect } from 'vitest'
import type { Grammar, GrammarType, MasteryLevel, TopikLevel } from '~/lib/domain'
import { facetCounts } from '~/lib/library/facet-counts'

const g = (ko: string): Grammar => ({
  ko,
  meaning: { en: ko, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
})

const items = [g('a'), g('b'), g('c'), g('d')]
const levelMap: Record<string, TopikLevel> = { a: 1, b: 1, c: 2, d: 3 }
const catMap: Record<string, GrammarType> = { a: 'particle', b: 'particle', c: 'meta' }
const masteryMap: Record<string, MasteryLevel> = { a: 'seedling', b: 'plant', c: 'tree', d: 'seedling' }
const leeches = new Set(['b'])

const counts = facetCounts(
  items,
  (ko) => levelMap[ko],
  (ko) => catMap[ko],
  (ko) => masteryMap[ko] ?? 'seedling',
  (ko) => leeches.has(ko),
)

describe('facetCounts', () => {
  it('counts by level', () => {
    expect(counts.byLevel).toEqual({ 1: 2, 2: 1, 3: 1 })
  })

  it('counts by category, skipping items with no category', () => {
    expect(counts.byCategory).toEqual({ particle: 2, meta: 1 }) // d has none
  })

  it('counts by mastery, with leeches added to "hard" on top of their level', () => {
    expect(counts.byMastery).toEqual({ seedling: 2, plant: 1, tree: 1, hard: 1 })
  })
})
