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
