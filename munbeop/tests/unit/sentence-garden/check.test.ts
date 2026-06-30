import { describe, it, expect } from 'vitest'
import { checkOrder } from '~/lib/sentence-garden/check'

describe('checkOrder', () => {
  const answer = ['저는', '물을', '마셔요']
  it('true for the exact model order', () => {
    expect(checkOrder(['저는', '물을', '마셔요'], answer)).toBe(true)
  })
  it('false for a wrong order', () => {
    expect(checkOrder(['물을', '저는', '마셔요'], answer)).toBe(false)
  })
  it('false when a decoy was placed (length mismatch handled too)', () => {
    expect(checkOrder(['저는', '빵을', '마셔요'], answer)).toBe(false)
    expect(checkOrder(['저는', '물을'], answer)).toBe(false)
  })
})
