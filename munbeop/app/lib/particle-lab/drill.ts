import type { ClashFamily, ClashSet, DrillItem, DrillVerdict } from '../domain/particles'
import { hasBatchim } from './hangul'

/** Pronouns whose subject form fuses with 가. */
export const CONTRACTIONS: Record<string, string> = {
  나: '내가',
  저: '제가',
  너: '네가',
  누구: '누가',
}

/** The naive (wrong) uncontracted subject form, e.g. 나 → 나가. */
export function contractionTrap(noun: string): string {
  return `${noun}가`
}

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
  if (set.kind === 'contraction') {
    const fused = CONTRACTIONS[item.noun]
    // No silent fallback: contractionTrap(noun) is the WRONG form, so defaulting
    // to it would ship a grammatically incorrect "correct" answer (and make the
    // two options identical). A contraction item must carry a known pronoun.
    if (!fused) {
      throw new Error(
        `correctForm: "${item.noun}" is not a known contraction (expected one of ${Object.keys(CONTRACTIONS).join('/')})`,
      )
    }
    return fused
  }
  return familyFormFor(set.families[item.familyIndex], item.noun)
}

export interface SentenceParts {
  before: string
  answer: string
  after: string
}

/**
 * Render pieces for the gap sentence: `${before}${answer}${after}`.
 * Particle items keep the noun in `before`; contraction items put the whole
 * fused subject in `answer` (so the pronoun isn't shown twice).
 */
export function sentenceParts(item: DrillItem, set: ClashSet): SentenceParts {
  const answer = correctForm(item, set)
  if (set.kind === 'contraction') {
    return { before: item.lead ?? '', answer, after: item.rest }
  }
  return { before: `${item.lead ?? ''}${item.noun}`, answer, after: item.rest }
}

/** Full correct sentence. */
export function correctSentence(item: DrillItem, set: ClashSet): string {
  const p = sentenceParts(item, set)
  return `${p.before}${p.answer}${p.after}`
}

/** Set-wide answer options: family-0 forms then family-1 forms, de-duplicated. */
export function deriveOptions(set: ClashSet): string[] {
  return [...new Set([...formsOf(set.families[0]), ...formsOf(set.families[1])])]
}

/** Answer options for THIS item: contraction = [answer, trap] sorted; particle = set-wide. */
export function optionsFor(item: DrillItem, set: ClashSet): string[] {
  if (set.kind === 'contraction') {
    return [correctForm(item, set), contractionTrap(item.noun)].sort()
  }
  return deriveOptions(set)
}

/**
 * Two-layer judgement:
 *  - right family, wrong allomorph → 'blocked' (받침 slip, retry)
 *  - wrong family                  → 'wrong-family' (semantic error, ends item)
 */
export function judge(item: DrillItem, choice: string, set: ClashSet): DrillVerdict {
  const expected = correctForm(item, set)
  if (choice === expected) return { kind: 'correct' }
  if (set.kind === 'contraction') return { kind: 'contraction', expected }
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
