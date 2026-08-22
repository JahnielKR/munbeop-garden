import { describe, expect, it } from 'vitest'
import { pairsForGrammar } from '~/lib/grammar-pairs/load'
import { pairsFor } from '~/lib/grammar-pairs'
import { DEFAULT_GRAMMAR } from '~/seed/grammars'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'

describe('lazy grammar-pair catalog', () => {
  it('loads only the requested TOPIK level and selects matching pairs', async () => {
    const rows = await pairsForGrammar('안 + V / -지 않다', 'topik-1')
    expect(rows.length).toBeGreaterThan(0)
    expect(
      rows.every((row) => row.pair.a === '안 + V / -지 않다' || row.pair.b === '안 + V / -지 않다'),
    ).toBe(true)
  })

  it('does not load a catalog for custom grammar', async () => {
    await expect(pairsForGrammar('-나만의 문법', 'custom')).resolves.toEqual([])
  })

  it('preserves every authored pair from both grammar sides across TOPIK chunks', async () => {
    const grammarByKo = new Map(DEFAULT_GRAMMAR.map((grammar) => [grammar.ko, grammar]))
    const pairedKos = new Set(GRAMMAR_PAIRS.flatMap((pair) => [pair.a, pair.b]))

    for (const ko of pairedKos) {
      const grammar = grammarByKo.get(ko)
      expect(grammar, `missing catalog grammar for ${ko}`).toBeDefined()

      const expectedIds = pairsFor(ko)
        .map((row) => row.pair.id)
        .sort()
      const actualIds = (await pairsForGrammar(ko, grammar!.deckId))
        .map((row) => row.pair.id)
        .sort()

      expect(actualIds, `lazy pair parity for ${ko}`).toEqual(expectedIds)
    }
  })
})
