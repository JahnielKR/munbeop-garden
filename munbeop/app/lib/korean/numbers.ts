// Native + Sino number rendering for the counter lab. 1..99 only (TOPIK-1 scope).
const NATIVE_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_PRENOM_ONES = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉']
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔']
const SINO_ONES = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

function assertRange(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 99) {
    throw new Error(`number out of supported range 1..99: ${n}`)
  }
}

/** Native cardinal 1..99 (하나, 둘, … 스물셋, … 아흔아홉). */
export function nativeNumber(n: number): string {
  assertRange(n)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return NATIVE_TENS[tens]! + NATIVE_ONES[ones]!
}

/**
 * Native prenominal form (before a counter): 한/두/세/네, with the 20→스무
 * irregular (스무 살) — but 21..29 keep 스물 + prenominal ones (스물한).
 */
export function nativePrenominal(n: number): string {
  assertRange(n)
  if (n === 20) return '스무'
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return NATIVE_TENS[tens]! + NATIVE_PRENOM_ONES[ones]!
}

/** Sino-Korean 1..99 (일, … 십, 십일, 이십삼, …). No prenominal irregular. */
export function sinoNumber(n: number): string {
  assertRange(n)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const tensPart = tens === 0 ? '' : tens === 1 ? '십' : SINO_ONES[tens]! + '십'
  return tensPart + SINO_ONES[ones]!
}

// — Large Sino cardinals + dates + digit strings + clock (Number Market lab) —

const SINO_DIGIT = ['공', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** Reading of 1..9999, joined (no spaces), dropping the leading 일 before 십/백/천. */
function sinoUnder10k(n: number): string {
  const th = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const te = Math.floor((n % 100) / 10)
  const o = n % 10
  let s = ''
  if (th) s += (th === 1 ? '' : SINO_ONES[th]!) + '천'
  if (h) s += (h === 1 ? '' : SINO_ONES[h]!) + '백'
  if (te) s += (te === 1 ? '' : SINO_ONES[te]!) + '십'
  if (o) s += SINO_ONES[o]!
  return s
}

/**
 * Full Sino-Korean reading 0..100,000,000 with the Korean 4-digit (만/억) grouping.
 * Rules: group by 4 digits; drop leading 일 before 십/백/천; the 만 coefficient 1 is written
 * "만" (not 일만); the 억 coefficient 1 is written "일억"; spaces separate the 억/만/units groups;
 * 0 → "영".
 */
export function sinoCardinal(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 100000000) {
    throw new Error(`number out of supported range 0..100000000: ${n}`)
  }
  if (n === 0) return '영'
  const eok = Math.floor(n / 100000000)
  const man = Math.floor((n % 100000000) / 10000)
  const unit = n % 10000
  const parts: string[] = []
  if (eok) parts.push(sinoUnder10k(eok) + '억') // eok coeff 1 → 일억
  if (man) parts.push((man === 1 ? '' : sinoUnder10k(man)) + '만') // man coeff 1 → 만
  if (unit) parts.push(sinoUnder10k(unit))
  return parts.join(' ')
}

/** Sino month name with the irregulars 6월=유월, 10월=시월. */
export function sinoMonth(m: number): string {
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new Error(`month out of range 1..12: ${m}`)
  }
  if (m === 6) return '유월'
  if (m === 10) return '시월'
  return sinoCardinal(m) + '월'
}

/** Reads a digit string digit-by-digit (phone numbers); 0 → 공. */
export function sinoDigitString(digits: string): string {
  let out = ''
  for (const ch of digits) {
    const d = ch.charCodeAt(0) - 48
    if (d < 0 || d > 9) throw new Error(`not a digit: ${ch}`)
    out += SINO_DIGIT[d]!
  }
  return out
}

/** Clock reading: native prenominal hour + 시 (+ Sino minute + 분 when minute > 0). */
export function timeReading(hour: number, minute: number): string {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) {
    throw new Error(`hour out of range 1..12: ${hour}`)
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`minute out of range 0..59: ${minute}`)
  }
  const hourPart = `${nativePrenominal(hour)} 시`
  if (minute === 0) return hourPart
  return `${hourPart} ${sinoCardinal(minute)} 분`
}
