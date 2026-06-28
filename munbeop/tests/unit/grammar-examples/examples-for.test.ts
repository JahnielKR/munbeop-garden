import { describe, it, expect } from 'vitest'
import type { GrammarExample } from '~/lib/domain'
import { selectExamples } from '~/lib/grammar-examples'

const L8 = { en: 'x', es: 'x', fr: 'x', 'pt-BR': 'x', th: 'x', id: 'x', vi: 'x', ja: 'x' }
const fixture: GrammarExample[] = [
  { ko: '-아/어요', sentence: '가요', trans: L8, level: 'casual' },
  { ko: '-아/어요', sentence: '갑니다', trans: L8, level: 'formal' },
  { ko: '-아/어요', sentence: '가요2', trans: L8, level: 'polite' },
  { ko: '-고', sentence: '먹고', trans: L8, level: 'polite' },
]

// examplesFor is the async per-level loader (covered by the seed-completeness /
// component tests); selectExamples is its pure core — filter + sort + cap.
describe('selectExamples', () => {
  it('filters by ko', () => {
    expect(selectExamples(fixture, '-고').map((e) => e.sentence)).toEqual(['먹고'])
  })
  it('sorts formal → polite → casual', () => {
    expect(selectExamples(fixture, '-아/어요').map((e) => e.level)).toEqual([
      'formal', 'polite', 'casual',
    ])
  })
  it('caps at 4', () => {
    const many: GrammarExample[] = Array.from({ length: 6 }, (_, i) => ({
      ko: 'x', sentence: `s${i}`, trans: L8, level: 'polite' as const,
    }))
    expect(selectExamples(many, 'x')).toHaveLength(4)
  })
  it('unknown ko → []', () => {
    expect(selectExamples(fixture, 'nope')).toEqual([])
  })
})
