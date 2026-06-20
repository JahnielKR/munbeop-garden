import type { LocalizedString } from './i18n'

/** Stable ids for the v1 particle set. Also used in URLs (?focus=topic). */
export const PARTICLE_IDS = [
  'topic',
  'subject',
  'object',
  'place-static',
  'place-action',
  'also',
] as const
export type ParticleId = (typeof PARTICLE_IDS)[number]

/** Visual role — drives chip color. 에/에서 share the 'place' family. */
export type ParticleRole = 'topic' | 'subject' | 'object' | 'place' | 'addition'

export interface ParticleDef {
  id: ParticleId
  /** Display pattern, e.g. '은/는'. NOT translated. */
  ko: string
  /** Exact Grammar.ko key in the TOPIK catalog — links SRS, diary and study sheet. */
  grammarKo: string
  role: ParticleRole
  /** Allomorphs. Single-form particles repeat the same string in both. */
  afterConsonant: string
  afterVowel: string
  /** Short role label for chips/legend, e.g. 'tema'. */
  label: LocalizedString
  /** 2–3 line popover explanation. */
  hint: LocalizedString
}

export type LabToken =
  | { kind: 'word'; text: string; gloss?: LocalizedString }
  | { kind: 'particle'; text: string; particleId: ParticleId; toggleable: boolean }

/** One 어절 (space-delimited block): word + attached particle chips. */
export type Eojeol = LabToken[]

export interface LabReading {
  /** Particle ids toggled OFF that produce this reading. */
  off: ParticleId[]
  trans: LocalizedString
  nuance?: LocalizedString
}

export interface LabSentence {
  id: string
  eojeols: Eojeol[]
  /** Translation with every particle ON. */
  trans: LocalizedString
  /** Didactic note for the all-ON state. */
  nuance: LocalizedString
  /** Explicit readings for specific OFF states. Unlisted combos fall back. */
  readings: LabReading[]
}

/** ── Drill (은/는 vs 이/가) ─────────────────────────────────────────── */

export type DrillFamily = 'topic' | 'subject'
export type DrillChoice = '은' | '는' | '이' | '가'

export interface DrillItem {
  id: string
  /** Disambiguating situation shown above the sentence. */
  cue: LocalizedString
  /** Optional Korean text rendered before the gap noun (e.g. '코끼리는 '). */
  lead?: string
  /** Noun that receives the particle. */
  noun: string
  /** Sentence remainder after the gap, leading space included. */
  rest: string
  family: DrillFamily
  /** Why this family wins here. Shown on answer; reused as auto diary note. */
  reason: LocalizedString
  /** Translation of the correct full sentence. */
  trans: LocalizedString
}

export type DrillVerdict =
  | { kind: 'correct' }
  | { kind: 'blocked'; expected: DrillChoice; nounHasBatchim: boolean }
  | { kind: 'wrong-family'; expected: DrillChoice; family: DrillFamily }
