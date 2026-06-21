// app/lib/conjugation-drill/drill.ts
import { conjugate, VERBS, ENDINGS } from '~/lib/korean'
import type { DatasetVerb, Ending, VerbClass } from '~/lib/korean'
import { buildDistractors } from './distractors'

export type DrillClassId = VerbClass | 'mixed'

/**
 * A drill class option. `id` and `klass` carry the same value today but are
 * kept distinct by intent: `id` is the route/`?set=` token + picker key,
 * `klass` is the verb-filter / mastery key (cast to VerbClass for the 9 real classes).
 */
export interface DrillClassDef {
  id: DrillClassId
  klass: DrillClassId
  /** Korean label for the picker (verbatim). */
  ko: string
}

/** mixed first, then the 9 engine classes in a stable order. */
export const DRILL_CLASSES: DrillClassDef[] = [
  { id: 'mixed', klass: 'mixed', ko: '전체' },
  { id: 'regular', klass: 'regular', ko: '규칙' },
  { id: 'p_irr', klass: 'p_irr', ko: 'ㅂ 불규칙' },
  { id: 't_irr', klass: 't_irr', ko: 'ㄷ 불규칙' },
  { id: 'eu_elision', klass: 'eu_elision', ko: 'ㅡ 탈락' },
  { id: 'reu_irr', klass: 'reu_irr', ko: '르 불규칙' },
  { id: 'h_irr', klass: 'h_irr', ko: 'ㅎ 불규칙' },
  { id: 's_irr', klass: 's_irr', ko: 'ㅅ 불규칙' },
  { id: 'l_drop', klass: 'l_drop', ko: 'ㄹ 탈락' },
  { id: 'hada', klass: 'hada', ko: '하다' },
]

export function classById(id: string): DrillClassDef | undefined {
  return DRILL_CLASSES.find((c) => c.id === id)
}

export function verbsForClass(klass: DrillClassId): DatasetVerb[] {
  return klass === 'mixed' ? VERBS : VERBS.filter((v) => v.klass === klass)
}

export interface ConjItem {
  id: string
  dict: string
  gloss: string
  klass: VerbClass
  ending: Ending
  correct: string
  /** correct + 3 distractors in a stable order; the composable shuffles for display. */
  options: string[]
}

export function buildItem(v: DatasetVerb, ending: Ending): ConjItem {
  const correct = conjugate(v.dict, v.klass, ending)
  const distractors = buildDistractors(v, ending, correct)
  return {
    id: `${v.dict}:${ending}`,
    dict: v.dict,
    gloss: v.gloss,
    klass: v.klass,
    ending,
    correct,
    options: [correct, ...distractors],
  }
}

/** All (verb, ending) pairs for a class, shuffled (caller provides shuffle), capped to n. */
export function buildRound(
  klass: DrillClassId,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
): ConjItem[] {
  const pairs = verbsForClass(klass).flatMap((v) => ENDINGS.map((e) => ({ v, e })))
  return shuffleFn(pairs)
    .slice(0, n)
    .map(({ v, e }) => buildItem(v, e))
}

export interface DrillResult {
  itemId: string
  correct: boolean
}

export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
