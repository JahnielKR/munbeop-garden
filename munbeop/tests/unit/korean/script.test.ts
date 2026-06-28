import { describe, it, expect } from 'vitest'
import { hasHangul, hasForeignLetters, isKoreanSentence } from '~/lib/korean/script'

describe('korean/script — hasHangul', () => {
  it('detects Hangul syllables, jamo and compatibility jamo', () => {
    expect(hasHangul('안녕')).toBe(true)
    expect(hasHangul('3시에 만나요')).toBe(true)
    expect(hasHangul('ㄱ')).toBe(true) // compatibility jamo
  })
  it('is false when there is no Hangul', () => {
    expect(hasHangul('')).toBe(false)
    expect(hasHangul('hola')).toBe(false)
    expect(hasHangul('1234 !?')).toBe(false)
  })
})

describe('korean/script — hasForeignLetters', () => {
  it('flags letters from other scripts', () => {
    expect(hasForeignLetters('hello')).toBe(true) // latin
    expect(hasForeignLetters('안녕 hello')).toBe(true) // mixed
    expect(hasForeignLetters('あいう')).toBe(true) // kana
    expect(hasForeignLetters('漢字')).toBe(true) // hanja
  })
  it('treats digits, punctuation and spaces as neutral (not foreign letters)', () => {
    expect(hasForeignLetters('안녕하세요')).toBe(false)
    expect(hasForeignLetters('3시에 만나요?')).toBe(false)
    expect(hasForeignLetters('1234 !?…~')).toBe(false)
  })
})

describe('korean/script — isKoreanSentence', () => {
  it('accepts Hangul with numbers, spaces and punctuation', () => {
    expect(isKoreanSentence('안녕하세요')).toBe(true)
    expect(isKoreanSentence('저는 학생이에요.')).toBe(true)
    expect(isKoreanSentence('3시에 만나요?')).toBe(true)
    expect(isKoreanSentence("'네!'")).toBe(true)
    expect(isKoreanSentence('  안녕  ')).toBe(true) // leading/trailing space ok
  })
  it('rejects empty or whitespace-only input', () => {
    expect(isKoreanSentence('')).toBe(false)
    expect(isKoreanSentence('   ')).toBe(false)
  })
  it('rejects sentences with foreign-script letters', () => {
    expect(isKoreanSentence('hola')).toBe(false)
    expect(isKoreanSentence('안녕 hello')).toBe(false)
    expect(isKoreanSentence('あいう')).toBe(false)
    expect(isKoreanSentence('漢字')).toBe(false)
  })
  it('rejects input with no Hangul at all', () => {
    expect(isKoreanSentence('1234')).toBe(false)
    expect(isKoreanSentence('...')).toBe(false)
  })
})
