import type { ClashFamily, ClashSet, DrillItem, DrillVerdict } from '../domain/particles'
import { hasBatchim } from './hangul'

/** Every surface form a family can take (1 for invariant, 2 for allomorph). */
export function formsOf(f: ClashFamily): string[] {
  return f.invariant ? [f.form] : [f.afterConsonant, f.afterVowel]
}

/** The token a family takes for `noun` (받침-selected for allomorph families). */
export function familyFormFor(f: ClashFamily, noun: string): string {
  if (f.invariant) return f.form
  return hasBatchim(noun) ? f.afterConsonant : f.afterVowel
}

export function correctForm(item: DrillItem, set: ClashSet): string {
  return familyFormFor(set.families[item.familyIndex], item.noun)
}

/** Full correct sentence (lead + noun+form + rest). */
export function correctSentence(item: DrillItem, set: ClashSet): string {
  return `${item.lead ?? ''}${item.noun}${correctForm(item, set)}${item.rest}`
}

/** Answer options: family-0 forms then family-1 forms, de-duplicated. */
export function deriveOptions(set: ClashSet): string[] {
  return [...new Set([...formsOf(set.families[0]), ...formsOf(set.families[1])])]
}

/**
 * Two-layer judgement:
 *  - right family, wrong allomorph → 'blocked' (받침 slip, retry)
 *  - wrong family                  → 'wrong-family' (semantic error, ends item)
 */
export function judge(item: DrillItem, choice: string, set: ClashSet): DrillVerdict {
  const expected = correctForm(item, set)
  if (choice === expected) return { kind: 'correct' }
  const correct = set.families[item.familyIndex]
  if (formsOf(correct).includes(choice)) {
    return { kind: 'blocked', expected, nounHasBatchim: hasBatchim(item.noun) }
  }
  return { kind: 'wrong-family', expected, familyId: correct.id }
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
