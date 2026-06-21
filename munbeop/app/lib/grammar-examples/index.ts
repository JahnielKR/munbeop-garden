import type { GrammarExample, SpeechLevel } from '~/lib/domain'
import { GRAMMAR_EXAMPLES } from '~/seed/grammar-examples'

const LEVEL_ORDER: Record<SpeechLevel, number> = { formal: 0, polite: 1, casual: 2 }
const MAX_EXAMPLES = 4

/** Examples for a grammar point, sorted formal→polite→casual, capped. */
export function examplesFor(
  ko: string,
  source: GrammarExample[] = GRAMMAR_EXAMPLES,
): GrammarExample[] {
  return source
    .filter((e) => e.ko === ko)
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .slice(0, MAX_EXAMPLES)
}
