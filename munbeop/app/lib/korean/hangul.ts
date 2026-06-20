const SBASE = 0xac00
const VCOUNT = 21
const TCOUNT = 28
const NCOUNT = VCOUNT * TCOUNT // 588

export const TAILS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

export interface Jamo {
  lead: number
  vowel: number
  tail: number
}

export function decompose(syllable: string): Jamo {
  const code = syllable.charCodeAt(0) - SBASE
  if (code < 0 || code >= 11172) throw new Error(`not a Hangul syllable: ${syllable}`)
  const tail = code % TCOUNT
  const vowel = Math.floor((code % NCOUNT) / TCOUNT)
  const lead = Math.floor(code / NCOUNT)
  return { lead, vowel, tail }
}

export function compose(lead: number, vowel: number, tail: number): string {
  return String.fromCharCode(SBASE + (lead * VCOUNT + vowel) * TCOUNT + tail)
}

/** True if the last syllable carries a final consonant (받침). */
export function endsInConsonant(s: string): boolean {
  return decompose(s[s.length - 1]!).tail !== 0
}

/** The final consonant jamo of the last syllable, or '' if none. */
export function finalJamo(s: string): string {
  return TAILS[decompose(s[s.length - 1]!).tail]!
}

/** Drop the dictionary 다 to get the verb stem. */
export function stemOf(dict: string): string {
  return dict.endsWith('다') ? dict.slice(0, -1) : dict
}
