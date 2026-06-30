import type { GrammarExample, LocalizedString } from '~/lib/domain'
import { shuffle } from '~/lib/particle-lab/shuffle'

export interface SentenceGardenRound {
  /** The grammar point — used to water its plant. */
  ko: string
  /** The full model sentence. */
  sentence: string
  /** Shown as the target meaning. */
  trans: LocalizedString
  /** Model eojeol order (the win condition). */
  answer: string[]
  /** answer + 1 decoy, shuffled. */
  cards: string[]
}

/** Split a sentence into eojeol (whitespace tokens). */
export function eojeolsOf(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean)
}

/**
 * Build one round from an example. The decoy is the first entry of `decoyPool`
 * that is not already an eojeol of the sentence. If the pool yields none, the
 * round has no decoy (still playable).
 */
export function buildRound(
  example: GrammarExample,
  decoyPool: readonly string[],
  rng: () => number = Math.random,
): SentenceGardenRound {
  const answer = eojeolsOf(example.sentence)
  const decoy = decoyPool.find((d) => d && !answer.includes(d))
  const cards = shuffle(decoy ? [...answer, decoy] : answer, rng)
  return { ko: example.ko, sentence: example.sentence, trans: example.trans, answer, cards }
}
