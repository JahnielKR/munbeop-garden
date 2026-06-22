import { describe, it, expect } from 'vitest'
import { nativeNumber, nativePrenominal, sinoNumber } from '~/lib/korean/numbers'

// Korean-verified golden rows: [n, native cardinal, native prenominal, sino].
const GOLDEN: [number, string, string, string][] = [
  [1, '하나', '한', '일'],
  [2, '둘', '두', '이'],
  [3, '셋', '세', '삼'],
  [4, '넷', '네', '사'],
  [5, '다섯', '다섯', '오'],
  [9, '아홉', '아홉', '구'],
  [10, '열', '열', '십'],
  [11, '열하나', '열한', '십일'],
  [14, '열넷', '열네', '십사'],
  [19, '열아홉', '열아홉', '십구'],
  [20, '스물', '스무', '이십'],
  [21, '스물하나', '스물한', '이십일'],
  [22, '스물둘', '스물두', '이십이'],
  [23, '스물셋', '스물세', '이십삼'],
  [24, '스물넷', '스물네', '이십사'],
  [30, '서른', '서른', '삼십'],
  [40, '마흔', '마흔', '사십'],
  [50, '쉰', '쉰', '오십'],
  [60, '예순', '예순', '육십'],
  [70, '일흔', '일흔', '칠십'],
  [80, '여든', '여든', '팔십'],
  [90, '아흔', '아흔', '구십'],
  [99, '아흔아홉', '아흔아홉', '구십구'],
]

describe('number engine (golden)', () => {
  it.each(GOLDEN)('%i → native/prenominal/sino', (n, native, prenom, sino) => {
    expect(nativeNumber(n)).toBe(native)
    expect(nativePrenominal(n)).toBe(prenom)
    expect(sinoNumber(n)).toBe(sino)
  })

  it('throws outside 1..99', () => {
    expect(() => nativeNumber(0)).toThrow()
    expect(() => sinoNumber(100)).toThrow()
  })
})
