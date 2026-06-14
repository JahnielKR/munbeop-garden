import { describe, it, expect } from 'vitest'
import { isHangulName } from '~/lib/domain'

describe('isHangulName', () => {
  it('accepts strings containing Hangul syllables', () => {
    expect(isHangulName('반말')).toBe(true)
    expect(isHangulName('격식체')).toBe(true)
    expect(isHangulName('SNS에')).toBe(true) // mixed Latin + Hangul still counts
  })

  it('rejects strings with no Hangul', () => {
    expect(isHangulName('banmal')).toBe(false)
    expect(isHangulName('')).toBe(false)
    expect(isHangulName('   ')).toBe(false)
    expect(isHangulName('123')).toBe(false)
    expect(isHangulName('🙂')).toBe(false)
  })
})
