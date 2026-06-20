import type { LocalizedString } from './i18n'

/** Stable ids for the v1 particle set. Also used in URLs (?focus=topic). */
export const PARTICLE_IDS = [
  'topic',
  'subject',
  'object',
  'place-static',
  'place-action',
  'also',
  'only',
  'recipient',
  'by-means',
  'and',
  'from',
  'until',
] as const
export type ParticleId = (typeof PARTICLE_IDS)[number]

/** Visual role — drives chip color. 에/에서 share 'place'; 도/만/부터/까지 share 'addition'. */
export type ParticleRole =
  | 'topic'
  | 'subject'
  | 'object'
  | 'place'
  | 'addition'
  | 'recipient'
  | 'means'
  | 'connective'

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

/** ── Drill (clash sets) ─────────────────────────────────────────────── */

interface ClashFamilyBase {
  /** Stable id, e.g. 'topic', 'place-static', 'recipient'. */
  id: string
  /** Short label for chips / feedback. */
  label: LocalizedString
  /** Grammar.ko this family maps to — SRS, diary, study sheet. */
  grammarKo: string
}
export type ClashFamily =
  | (ClashFamilyBase & { invariant: true; form: string })
  | (ClashFamilyBase & { invariant: false; afterConsonant: string; afterVowel: string })

export interface ClashSet {
  id: string
  /** Particle clash (default) or pronoun+가 contraction. */
  kind?: 'particle' | 'contraction'
  /** Short bilingual name for the set picker. */
  name: LocalizedString
  families: [ClashFamily, ClashFamily]
}

export interface DrillItem {
  id: string
  /** Disambiguating situation shown above the sentence. */
  cue: LocalizedString
  /** Optional Korean rendered before the gap noun (e.g. '코끼리는 '). */
  lead?: string
  /** Noun that receives the particle. */
  noun: string
  /** Sentence remainder after the gap, leading space included. */
  rest: string
  /** Which ClashSet this item belongs to. */
  setId: string
  /** Which of the set's two families is correct here. */
  familyIndex: 0 | 1
  /** Why this family wins. Shown on answer; reused as auto diary note. */
  reason: LocalizedString
  /** Translation of the correct full sentence. */
  trans: LocalizedString
}

export type DrillVerdict =
  | { kind: 'correct' }
  | { kind: 'blocked'; expected: string; nounHasBatchim: boolean }
  | { kind: 'wrong-family'; expected: string; familyId: string }
  | { kind: 'contraction'; expected: string }
