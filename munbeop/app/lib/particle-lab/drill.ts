import type {
  DrillChoice,
  DrillFamily,
  DrillItem,
  DrillVerdict,
} from '../domain/particles'
import { hasBatchim } from './hangul'

export const DRILL_CHOICES: readonly DrillChoice[] = ['은', '는', '이', '가']

const FAMILY_OF: Record<DrillChoice, DrillFamily> = {
  은: 'topic',
  는: 'topic',
  이: 'subject',
  가: 'subject',
}

export function familyOf(choice: DrillChoice): DrillFamily {
  return FAMILY_OF[choice]
}

/** The exact form this item expects, derived from family + 받침 of the noun. */
export function correctForm(item: DrillItem): DrillChoice {
  const batchim = hasBatchim(item.noun)
  if (item.family === 'topic') return batchim ? '은' : '는'
  return batchim ? '이' : '가'
}

/** Full correct sentence (lead + noun+particle + rest). */
export function correctSentence(item: DrillItem): string {
  return `${item.lead ?? ''}${item.noun}${correctForm(item)}${item.rest}`
}

/**
 * Two-layer judgement:
 *  - right family, wrong allomorph → 'blocked' (orthographic slip, retry)
 *  - wrong family                  → 'wrong-family' (semantic error, ends item)
 */
export function judge(item: DrillItem, choice: DrillChoice): DrillVerdict {
  const expected = correctForm(item)
  if (choice === expected) return { kind: 'correct' }
  if (familyOf(choice) === item.family)
    return { kind: 'blocked', expected, nounHasBatchim: hasBatchim(item.noun) }
  return { kind: 'wrong-family', expected, family: item.family }
}

export interface DrillItemResult {
  itemId: string
  /** The item ended on a correct answer (blocked retries don't break this). */
  correct: boolean
  batchimSlips: number
}

export interface DrillScore {
  total: number
  correct: number
  batchimSlips: number
  /** correct / total, 0 when empty. */
  accuracy: number
}

export function scoreOf(results: DrillItemResult[]): DrillScore {
  const total = results.length
  const correct = results.filter((r) => r.correct).length
  const batchimSlips = results.reduce((acc, r) => acc + r.batchimSlips, 0)
  return { total, correct, batchimSlips, accuracy: total === 0 ? 0 : correct / total }
}
