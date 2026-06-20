/**
 * Hangul syllable math. A precomposed syllable is
 * 0xAC00 + (cho × 21 + jung) × 28 + jong — jong (final consonant, 받침)
 * is the remainder mod 28; 0 means "no batchim".
 */
const HANGUL_FIRST = 0xac00
const HANGUL_LAST = 0xd7a3
const JONGSEONG_COUNT = 28

export function isHangulSyllable(ch: string): boolean {
  if (ch.length === 0) return false
  const code = ch.charCodeAt(0)
  return code >= HANGUL_FIRST && code <= HANGUL_LAST
}

/** True when the LAST syllable of `word` ends in a final consonant (받침). */
export function hasBatchim(word: string): boolean {
  const last = word.charAt(word.length - 1)
  if (!isHangulSyllable(last)) return false
  return (last.charCodeAt(0) - HANGUL_FIRST) % JONGSEONG_COUNT !== 0
}

/** Attach the correct allomorph of a particle to a noun (물 + 이/가 → 물이). */
export function attach(
  noun: string,
  forms: { afterConsonant: string; afterVowel: string },
): string {
  return noun + (hasBatchim(noun) ? forms.afterConsonant : forms.afterVowel)
}
