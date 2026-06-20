/**
 * Deterministic onboarding starter: one TOPIK-1 pattern with its grammar
 * conjugation slot blanked. Authored content — `grammarKo` MUST exist in the
 * catalog (verified: '-아/어서' in app/seed/grammars-n1.ts). The model sentence
 * is 반말 to match the default first context (반말), so the recorded diary
 * entry reads coherently.
 */
export const BLANK_MARKER = '___'

export interface Starter {
  grammarKo: string
  templateKo: string
  blankAnswer: string
  modelSentenceKo: string
}

export const STARTER: Starter = {
  grammarKo: '-아/어서',
  templateKo: '주말에 친구를 만나___ 기분이 좋았어',
  blankAnswer: '서',
  modelSentenceKo: '주말에 친구를 만나서 기분이 좋았어',
}

export interface TemplateParts {
  before: string
  after: string
}

/** Split a template on the single blank marker. Throws if absent. */
export function parseTemplate(tpl: string): TemplateParts {
  const i = tpl.indexOf(BLANK_MARKER)
  if (i === -1) throw new Error(`template has no blank marker "${BLANK_MARKER}": ${tpl}`)
  return { before: tpl.slice(0, i), after: tpl.slice(i + BLANK_MARKER.length) }
}
