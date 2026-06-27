import { describe, it, expect } from 'vitest'
import { nativeNumber, nativePrenominal, sinoNumber, sinoCardinal, sinoMonth, sinoDigitString, timeReading } from '~/lib/korean/numbers'

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

describe('sinoCardinal (만/억 grouping)', () => {
  const ROWS: [number, string][] = [
    [0, '영'],
    [10, '십'],
    [16, '십육'],
    [100, '백'],
    [350, '삼백오십'],
    [1500, '천오백'],
    [2024, '이천이십사'],
    [10000, '만'],
    [12000, '만 이천'],
    [23000, '이만 삼천'],
    [25000, '이만 오천'],
    [150000, '십오만'],
    [1000000, '백만'],
    [100000000, '일억'],
  ]
  it.each(ROWS)('%i → %s', (n, expected) => {
    expect(sinoCardinal(n)).toBe(expected)
  })
  it('throws outside 0..100000000', () => {
    expect(() => sinoCardinal(-1)).toThrow()
    expect(() => sinoCardinal(100000001)).toThrow()
    expect(() => sinoCardinal(1.5)).toThrow()
  })
})

describe('sinoMonth (irregulars 유월/시월)', () => {
  const ROWS: [number, string][] = [
    [1, '일월'], [2, '이월'], [3, '삼월'], [4, '사월'], [5, '오월'],
    [6, '유월'], [7, '칠월'], [8, '팔월'], [9, '구월'], [10, '시월'],
    [11, '십일월'], [12, '십이월'],
  ]
  it.each(ROWS)('%i월 → %s', (m, expected) => {
    expect(sinoMonth(m)).toBe(expected)
  })
  it('throws outside 1..12', () => {
    expect(() => sinoMonth(0)).toThrow()
    expect(() => sinoMonth(13)).toThrow()
  })
})

describe('sinoDigitString (0 → 공)', () => {
  it('reads digit-by-digit with 공 for zero', () => {
    expect(sinoDigitString('010')).toBe('공일공')
    expect(sinoDigitString('1234')).toBe('일이삼사')
    expect(sinoDigitString('9876')).toBe('구팔칠육')
  })
  it('throws on a non-digit', () => {
    expect(() => sinoDigitString('12a')).toThrow()
  })
})

describe('timeReading (native hour + Sino minute)', () => {
  const ROWS: [number, number, string][] = [
    [1, 0, '한 시'],
    [2, 0, '두 시'],
    [3, 15, '세 시 십오 분'],
    [9, 5, '아홉 시 오 분'],
    [12, 30, '열두 시 삼십 분'],
    [7, 45, '일곱 시 사십오 분'],
  ]
  it.each(ROWS)('%i:%i → %s', (h, m, expected) => {
    expect(timeReading(h, m)).toBe(expected)
  })
  it('throws outside hour 1..12 / minute 0..59', () => {
    expect(() => timeReading(0, 0)).toThrow()
    expect(() => timeReading(13, 0)).toThrow()
    expect(() => timeReading(3, 60)).toThrow()
  })
})
