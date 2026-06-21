import { describe, it, expect } from 'vitest'
import type { GrammarExample } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'

const L8 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const fixture: GrammarExample[] = [
  { ko: '-아/어요', sentence: '가요', trans: L8, level: 'casual' },
  { ko: '-아/어요', sentence: '갑니다', trans: L8, level: 'formal' },
  { ko: '-아/어요', sentence: '가요2', trans: L8, level: 'polite' },
  { ko: '-고', sentence: '먹고', trans: L8, level: 'polite' },
]

describe('examplesFor', () => {
  it('filters by ko', () => {
    expect(examplesFor('-고', fixture).map((e) => e.sentence)).toEqual(['먹고'])
  })
  it('sorts formal → polite → casual', () => {
    expect(examplesFor('-아/어요', fixture).map((e) => e.level)).toEqual([
      'formal', 'polite', 'casual',
    ])
  })
  it('caps at 4', () => {
    const many: GrammarExample[] = Array.from({ length: 6 }, (_, i) => ({
      ko: 'x', sentence: `s${i}`, trans: L8, level: 'polite' as const,
    }))
    expect(examplesFor('x', many)).toHaveLength(4)
  })
  it('unknown ko → []', () => {
    expect(examplesFor('nope', fixture)).toEqual([])
  })
})
