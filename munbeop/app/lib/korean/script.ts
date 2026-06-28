/**
 * Script detection for the Ruleta sentence gate.
 *
 * The drill wants learners to produce sentences in Korean. We accept Hangul
 * (syllables, jamo, compatibility jamo) plus neutral characters — digits,
 * spaces and punctuation — but reject letters from any other script (Latin,
 * Cyrillic, kana, hanja, …). Pure string predicates, no Vue / i18n.
 */

const HANGUL = /\p{Script=Hangul}/u
const LETTER = /\p{L}/u

/** True if the text contains at least one Hangul character. */
export function hasHangul(text: string): boolean {
  return HANGUL.test(text)
}

/**
 * True if the text contains a letter from a non-Korean script. Iterates by
 * code point so surrogate-pair letters (e.g. some CJK) are handled correctly.
 * Digits, punctuation, spaces and symbols are not letters, so they pass.
 */
export function hasForeignLetters(text: string): boolean {
  for (const ch of text) {
    if (LETTER.test(ch) && !HANGUL.test(ch)) return true
  }
  return false
}

/**
 * The Ruleta sentence rule: at least one Hangul character and no foreign-script
 * letters. Whitespace-only / empty is not valid.
 */
export function isKoreanSentence(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  return hasHangul(trimmed) && !hasForeignLetters(trimmed)
}
