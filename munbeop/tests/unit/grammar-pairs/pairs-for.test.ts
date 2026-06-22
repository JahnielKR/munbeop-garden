import { describe, it, expect } from 'vitest'
import type { ConfusablePair } from '~/lib/domain'
import { pairsFor, relatedKos } from '~/lib/grammar-pairs'

const L8 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const item = { sentence: '{}', optionA: '안', optionB: '못', answer: 'a' as const, trans: L8, why: L8 }
const fixture: ConfusablePair[] = [
  { id: 'an-mot', a: '안 + V / -지 않다', b: '못 + V / -지 못하다', note: L8, items: [item] },
  { id: 'go-aseo', a: '-고', b: '-아/어서', note: L8, items: [item] },
]

describe('pairsFor', () => {
  it('finds a pair from the A side with selfSide=a and otherKo=b', () => {
    const rows = pairsFor('안 + V / -지 않다', fixture)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.selfSide).toBe('a')
    expect(rows[0]!.otherKo).toBe('못 + V / -지 못하다')
  })
  it('finds a pair from the B side with selfSide=b and otherKo=a', () => {
    const rows = pairsFor('-아/어서', fixture)
    expect(rows[0]!.selfSide).toBe('b')
    expect(rows[0]!.otherKo).toBe('-고')
  })
  it('returns [] for a ko in no pair', () => {
    expect(pairsFor('-네요', fixture)).toEqual([])
  })
})

describe('relatedKos', () => {
  it('returns the other members, deduped', () => {
    expect(relatedKos('-고', fixture)).toEqual(['-아/어서'])
    expect(relatedKos('-네요', fixture)).toEqual([])
  })
})
