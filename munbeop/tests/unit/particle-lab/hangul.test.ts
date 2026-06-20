import { describe, it, expect } from 'vitest'
import { attach, hasBatchim, isHangulSyllable } from '~/lib/particle-lab'

describe('hangul', () => {
  it('detects batchim in consonant-final syllables', () => {
    expect(hasBatchim('물')).toBe(true)
    expect(hasBatchim('책')).toBe(true)
    expect(hasBatchim('형')).toBe(true)
  })

  it('detects no batchim in vowel-final syllables', () => {
    expect(hasBatchim('저')).toBe(false)
    expect(hasBatchim('커피')).toBe(false)
    expect(hasBatchim('비')).toBe(false)
  })

  it('looks only at the LAST syllable of multi-syllable words', () => {
    expect(hasBatchim('도서관')).toBe(true) // 관 ends in ㄴ
    expect(hasBatchim('고양이')).toBe(false) // 이 is open
    expect(hasBatchim('시간')).toBe(true) // 간 ends in ㄴ
  })

  it('returns false for non-hangul or empty input', () => {
    expect(hasBatchim('abc')).toBe(false)
    expect(hasBatchim('')).toBe(false)
    expect(isHangulSyllable('a')).toBe(false)
    expect(isHangulSyllable('한')).toBe(true)
  })

  it('attaches the correct allomorph', () => {
    const forms = { afterConsonant: '이', afterVowel: '가' }
    expect(attach('물', forms)).toBe('물이')
    expect(attach('의자', forms)).toBe('의자가')
  })
})
