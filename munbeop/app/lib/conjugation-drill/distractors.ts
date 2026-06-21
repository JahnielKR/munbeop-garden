// app/lib/conjugation-drill/distractors.ts
import { compose, conjugate, decompose, VERBS } from '~/lib/korean'
import type { DatasetVerb, Ending, VerbClass } from '~/lib/korean'

// Jamo indices — mirror conjugate.ts (kept local so the engine stays untouched).
const A = 0
const EO = 4
const EU = 18
const IEUNG = 11
const T_NONE = 0
const T_SS = 20
const EU_SYL = compose(IEUNG, EU, T_NONE) // '으'

const ALL_CLASSES: VerbClass[] = [
  'regular', 'p_irr', 't_irr', 'eu_elision', 'reu_irr', 'h_irr', 's_irr', 'l_drop', 'hada',
]
const AE_ENDINGS = new Set<Ending>(['-아/어요', '-았/었어요'])
const EU_BODY: Partial<Record<Ending, string>> = {
  '-(으)니까': '니까',
  '-(으)면': '면',
  '-(으)세요': '세요',
}

function isHangul(s: string): boolean {
  return [...s].every(
    (c) => c === ' ' || (c.charCodeAt(0) >= 0xac00 && c.charCodeAt(0) <= 0xd7a3),
  )
}

/** Irregular conjugated as if regular — the canonical class error. null for regulars. */
function naiveRegular(v: DatasetVerb, ending: Ending, correct: string): string | null {
  if (v.klass === 'regular') return null
  const f = conjugate(v.dict, 'regular', ending)
  return f === correct ? null : f
}

/** Flip the harmonic vowel (아↔어) of a standalone IEUNG-led syllable. */
function flipHarmony(syl: string): string | null {
  const j = decompose(syl)
  if (j.lead !== IEUNG) return null
  if (j.vowel === A) return compose(j.lead, EO, j.tail)
  if (j.vowel === EO) return compose(j.lead, A, j.tail)
  return null
}

/** Wrong vowel harmony in the -아/어 family (먹어요→먹아요, 먹었어요→먹았어요). */
function wrongHarmony(correct: string, ending: Ending): string | null {
  if (!AE_ENDINGS.has(ending)) return null
  const chars = [...correct]
  if (ending === '-아/어요') {
    const i = chars.length - 2 // syllable before final 요
    if (i < 0) return null
    const flipped = flipHarmony(chars[i]!)
    if (!flipped) return null
    chars[i] = flipped
    return chars.join('')
  }
  // past: the ㅆ-tailed syllable (었/았), only when IEUNG-led (skips contracted 갔/봤/셨)
  const idx = chars.findIndex((c) => decompose(c).tail === T_SS)
  if (idx < 0) return null
  const j = decompose(chars[idx]!)
  if (j.lead !== IEUNG) return null
  const v = j.vowel === A ? EO : j.vowel === EO ? A : null
  if (v === null) return null
  chars[idx] = compose(j.lead, v, T_SS)
  return chars.join('')
}

/** Over/under-applied epenthetic 으 in the -(으) endings (가니까→가으니까, 먹으니까→먹니까). */
function euError(correct: string, ending: Ending): string | null {
  const body = EU_BODY[ending]
  if (!body) return null
  const stem = correct.slice(0, correct.length - body.length)
  if (stem.endsWith(EU_SYL)) return stem.slice(0, -1) + body // had 으 → drop
  return stem + EU_SYL + body // no 으 → insert
}

/** The verb conjugated under every other class (includes the naive-regular form). */
function crossClass(v: DatasetVerb, ending: Ending, correct: string): string[] {
  const out: string[] = []
  for (const k of ALL_CLASSES) {
    if (k === v.klass) continue
    let f: string
    try {
      f = conjugate(v.dict, k, ending)
    } catch {
      continue
    }
    if (f !== correct) out.push(f)
  }
  return out
}

/** Other verbs (same class first) — last-resort fillers. */
function fillerVerbs(v: DatasetVerb): DatasetVerb[] {
  const same = VERBS.filter((x) => x.klass === v.klass && x.dict !== v.dict)
  const other = VERBS.filter((x) => x.klass !== v.klass)
  return [...same, ...other]
}

export function buildDistractors(v: DatasetVerb, ending: Ending, correct: string): string[] {
  const ordered: (string | null)[] = [
    naiveRegular(v, ending, correct),
    wrongHarmony(correct, ending),
    euError(correct, ending),
    ...crossClass(v, ending, correct),
  ]
  const seen = new Set<string>([correct])
  const picked: string[] = []
  for (const f of ordered) {
    if (!f || seen.has(f) || !isHangul(f)) continue
    seen.add(f)
    picked.push(f)
    if (picked.length === 3) return picked
  }
  // Fallback: correct forms of other verbs (same class preferred) until we have 3.
  for (const other of fillerVerbs(v)) {
    const f = conjugate(other.dict, other.klass, ending)
    if (seen.has(f) || !isHangul(f)) continue
    seen.add(f)
    picked.push(f)
    if (picked.length === 3) break
  }
  return picked
}
