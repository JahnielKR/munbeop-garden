import { describe, it, expect } from 'vitest'
import { compose, decompose, endsInConsonant, finalJamo, stemOf } from '~/lib/korean/hangul'

describe('hangul', () => {
  it('decomposes and recomposes every syllable (roundtrip)', () => {
    for (const s of ['먹', '가', '서', '울', '닭', '뷁', '힣', '갂']) {
      const { lead, vowel, tail } = decompose(s)
      expect(compose(lead, vowel, tail)).toBe(s)
    }
  })
  it('decomposes known jamo indices', () => {
    expect(decompose('가')).toEqual({ lead: 0, vowel: 0, tail: 0 }) // ㄱㅏ
    expect(decompose('먹')).toEqual({ lead: 6, vowel: 4, tail: 1 }) // ㅁㅓㄱ
  })
  it('detects batchim and the final jamo', () => {
    expect(endsInConsonant('책')).toBe(true)
    expect(endsInConsonant('사과')).toBe(false)
    expect(endsInConsonant('서울')).toBe(true)
    expect(finalJamo('서울')).toBe('ㄹ')
    expect(finalJamo('책')).toBe('ㄱ')
  })
  it('strips 다 to get the stem', () => {
    expect(stemOf('먹다')).toBe('먹')
    expect(stemOf('공부하다')).toBe('공부하')
  })
})
