import type { GrammarExample } from '~/lib/domain'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, eojeolsOf, type SentenceGardenRound } from './build'

export const MIN_EOJEOL = 3
export const MAX_EOJEOL = 5

const inRange = (n: number) => n >= MIN_EOJEOL && n <= MAX_EOJEOL

/**
 * Playable rounds for a deck: examples whose `ko` is in `kos` and whose sentence
 * is 3-5 eojeol (rigid order → safe exact-match). Each round's decoy is a real
 * eojeol borrowed from ANOTHER kept example (same-grammar preferred), never one
 * already in the sentence. Shuffled, capped at `size`.
 */
export function selectRounds(
  examples: readonly GrammarExample[],
  kos: readonly string[],
  size: number,
  rng: () => number = Math.random,
): SentenceGardenRound[] {
  const koSet = new Set(kos)
  const playable = examples.filter((e) => koSet.has(e.ko) && inRange(eojeolsOf(e.sentence).length))
  const picked = shuffle(playable, rng).slice(0, size)
  return picked.map((ex) => {
    const sameGrammar = picked.filter((p) => p.ko === ex.ko && p !== ex)
    const others = sameGrammar.length ? sameGrammar : picked.filter((p) => p !== ex)
    const decoyPool = shuffle(others.flatMap((p) => eojeolsOf(p.sentence)), rng)
    return buildRound(ex, decoyPool, rng)
  })
}
