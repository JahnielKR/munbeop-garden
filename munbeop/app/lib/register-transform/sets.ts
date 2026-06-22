// app/lib/register-transform/sets.ts
import type { RegisterMode, SpeechLevel } from '~/lib/domain'

export interface RegisterSetDef {
  /** Picker/?set= token. 'mixed' = play-all (not a mastery unit). */
  id: 'mixed' | 'formal' | 'polite' | 'casual' | 'verb' | 'noun' | 'particle' | 'si'
  mode: RegisterMode
  /** Korean picker label (verbatim). */
  ko: string
  /** Whether clearing this set counts toward 높임법 마스터. */
  mastery: boolean
}

/** mixed first per mode, then the mastery sets in a stable order. */
export const REGISTER_SETS: RegisterSetDef[] = [
  { id: 'mixed', mode: 'level', ko: '전체', mastery: false },
  { id: 'formal', mode: 'level', ko: '합쇼체로', mastery: true },
  { id: 'polite', mode: 'level', ko: '해요체로', mastery: true },
  { id: 'casual', mode: 'level', ko: '반말로', mastery: true },
  { id: 'mixed', mode: 'honor', ko: '전체', mastery: false },
  { id: 'verb', mode: 'honor', ko: '동사', mastery: true },
  { id: 'noun', mode: 'honor', ko: '명사', mastery: true },
  { id: 'particle', mode: 'honor', ko: '조사', mastery: true },
  { id: 'si', mode: 'honor', ko: '-(으)시-', mastery: true },
]

/** SpeechLevel → its Korean register term (for the level-mode transform prompt). */
export const LEVEL_KO: Record<SpeechLevel, string> = { formal: '합쇼체', polite: '해요체', casual: '반말' }

export function setsForMode(mode: RegisterMode): RegisterSetDef[] {
  return REGISTER_SETS.filter((s) => s.mode === mode)
}
export function isValidSet(mode: RegisterMode, id: string): boolean {
  return REGISTER_SETS.some((s) => s.mode === mode && s.id === id)
}
export function isMasterySet(mode: RegisterMode, id: string): boolean {
  return REGISTER_SETS.some((s) => s.mode === mode && s.id === id && s.mastery)
}
