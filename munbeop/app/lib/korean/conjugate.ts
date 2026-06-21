import { compose, decompose, stemOf } from './hangul'
import type { Ending, VerbClass } from './types'

// vowel indices (VOWELS order)
const A = 0, AE = 1, YA = 2, YAE = 3, EO = 4, E = 5, YEO = 6, YE = 7,
  O = 8, WA = 9, WAE = 10, OE = 11, U = 13, WEO = 14, EU = 18, I = 20
// tail indices (TAILS order)
const T_NONE = 0, T_L = 8, T_SS = 20
const LEAD_IEUNG = 11, LEAD_R = 5

const BRIGHT = new Set([A, O])
/** Harmonic vowel: bright stems take 아 (A); everything else 어 (EO). */
function harm(vowel: number): number {
  return BRIGHT.has(vowel) ? A : EO
}

// ㅂ→오 (not 우) before -아/어 for these monosyllabic stems.
const SPECIAL_O = new Set(['돕다', '곱다'])
// ㅎ-irregular vowel fusion before -아/어: stem vowel → ㅐ/ㅒ.
const H_FUSE: Record<number, number> = { [A]: AE, [EO]: AE, [YA]: YAE, [YEO]: YE, [I]: AE }

/** Contract a vowel-final stem vowel with the harmonic 아(A)/어(EO); -1 ⇒ append a separate syllable. */
function contract(stemV: number, h: number): number {
  if (h === A) {
    if (stemV === A) return A // 가+아→가
    if (stemV === O) return WA // 보/오+아→봐/와
    return -1
  }
  if (stemV === U) return WEO // 주+어→줘
  if (stemV === I) return YEO // 마시+어→마셔
  if (stemV === OE) return WAE // 되+어→돼
  if (stemV === EO) return EO // 서+어→서
  if (stemV === AE) return AE
  if (stemV === E) return E
  return -1
}

/** The -아/어 form, without 요/ㅆ (e.g. 먹어, 가, 봐, 더워, 들어, 바빠, 빨라, 그래, 지어, 도와, 공부해, 마셔, 살아). */
function applyAe(dict: string, klass: VerbClass): string {
  const stem = stemOf(dict)
  if (klass === 'hada') return stem.slice(0, -1) + '해'
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  const h = harm(vowel)

  if (klass === 'eu_elision') {
    const hh = rest ? harm(decompose(rest[rest.length - 1]!).vowel) : EO
    return rest + compose(lead, hh, T_NONE)
  }
  if (klass === 'reu_irr') {
    const before = decompose(rest[rest.length - 1]!)
    const hh = harm(before.vowel)
    return rest.slice(0, -1) + compose(before.lead, before.vowel, T_L) + compose(LEAD_R, hh, T_NONE)
  }
  if (klass === 'p_irr') {
    // ㅂ→우 (or 오 for 돕다/곱다); harmony follows the INSERTED vowel: 우→어, 오→아.
    const wv = SPECIAL_O.has(dict) ? O : U
    return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, contract(wv, harm(wv)), T_NONE)
  }
  if (klass === 't_irr') {
    return rest + compose(lead, vowel, T_L) + compose(LEAD_IEUNG, h, T_NONE)
  }
  if (klass === 's_irr') {
    return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, h, T_NONE)
  }
  if (klass === 'h_irr') {
    return rest + compose(lead, H_FUSE[vowel] ?? vowel, T_NONE)
  }
  // regular / l_drop (both regular in the -아/어 family)
  if (tail === T_NONE) {
    const cv = contract(vowel, h)
    if (cv >= 0) return rest + compose(lead, cv, T_NONE)
    return stem + compose(LEAD_IEUNG, h, T_NONE)
  }
  return stem + compose(LEAD_IEUNG, h, T_NONE)
}

/** Add a ㅆ tail to the last (open) syllable: 먹어→먹었, 가→갔, 봐→봤, 마셔→마셨. */
function addSsTail(form: string): string {
  const j = decompose(form[form.length - 1]!)
  return form.slice(0, -1) + compose(j.lead, j.vowel, T_SS)
}

/** -(으)ㄹ adnominal stem before ' 거예요' (e.g. 먹을, 갈, 더울, 들을, 살, 만들). */
function applyRieul(dict: string, klass: VerbClass): string {
  const stem = stemOf(dict)
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  if (klass === 'l_drop') return stem // the stem ㄹ IS the (으)ㄹ
  if (klass === 'p_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, U, T_L) // 더 + 울
  if (klass === 't_irr') return rest + compose(lead, vowel, T_L) + compose(LEAD_IEUNG, EU, T_L) // 들 + 을
  if (klass === 's_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, EU, T_L) // 지 + 을
  if (klass === 'h_irr') return rest + compose(lead, vowel, T_L) // 그러 → 그럴
  if (klass === 'hada' || tail === T_NONE) return rest + compose(lead, vowel, T_L) // vowel-final (incl eu/reu)
  return stem + compose(LEAD_IEUNG, EU, T_L) // regular consonant: + 을
}

/** The -(으)니까 / -(으)면 / -(으)세요 endings. */
function applyEuBody(dict: string, klass: VerbClass, body: string, dropRieul: boolean): string {
  const stem = stemOf(dict)
  const last = stem[stem.length - 1]!
  const rest = stem.slice(0, -1)
  const { lead, vowel, tail } = decompose(last)
  const EU_SYL = compose(LEAD_IEUNG, EU, T_NONE)
  if (tail === T_NONE) return stem + body // vowel-final (incl eu_elision, reu_irr, hada)
  if (klass === 'l_drop') return (dropRieul ? rest + compose(lead, vowel, T_NONE) : stem) + body
  if (klass === 'p_irr') return rest + compose(lead, vowel, T_NONE) + compose(LEAD_IEUNG, U, T_NONE) + body // 더 + 우 + body
  if (klass === 't_irr') return rest + compose(lead, vowel, T_L) + EU_SYL + body // 들 + 으 + body
  if (klass === 's_irr') return rest + compose(lead, vowel, T_NONE) + EU_SYL + body // 지 + 으 + body
  if (klass === 'h_irr') return rest + compose(lead, vowel, T_NONE) + body // 그러 + body (no 으)
  return stem + EU_SYL + body // regular consonant: 먹 + 으 + body
}

export function conjugate(dict: string, klass: VerbClass, ending: Ending): string {
  switch (ending) {
    case '-아/어요':
      return applyAe(dict, klass) + '요'
    case '-았/었어요':
      return addSsTail(applyAe(dict, klass)) + '어요'
    case '-(으)니까':
      return applyEuBody(dict, klass, '니까', true)
    case '-(으)면':
      return applyEuBody(dict, klass, '면', false) // ㄹ kept before ㅁ
    case '-(으)세요':
      return applyEuBody(dict, klass, '세요', true)
    case '-(으)ㄹ 거예요':
      return applyRieul(dict, klass) + ' 거예요'
    default: {
      const never: never = ending
      throw new Error(`unknown ending: ${String(never)}`)
    }
  }
}
