import { endsInConsonant, finalJamo } from './hangul'
import type { Particle } from './types'

// [after-consonant, after-vowel]
const TABLE: Record<Particle, readonly [string, string]> = {
  '은/는': ['은', '는'],
  '이/가': ['이', '가'],
  '을/를': ['을', '를'],
  '와/과': ['과', '와'],
  '(으)로': ['으로', '로'],
  '(이)나': ['이나', '나'],
}

export function attachParticle(noun: string, particle: Particle): string {
  const consonant = endsInConsonant(noun)
  // Special: instrumental (으)로 takes plain 로 after a ㄹ-final noun.
  if (particle === '(으)로' && consonant && finalJamo(noun) === 'ㄹ') return noun + '로'
  const [afterC, afterV] = TABLE[particle]
  return noun + (consonant ? afterC : afterV)
}
