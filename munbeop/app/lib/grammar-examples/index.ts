import type { GrammarExample, SpeechLevel } from '~/lib/domain'
import { levelOfDeck, type TopikLevel } from '~/lib/library/topik-level'

const LEVEL_ORDER: Record<SpeechLevel, number> = { formal: 0, polite: 1, casual: 2 }
const MAX_EXAMPLES = 4

/** Pure selection: a grammar's examples, sorted formal→polite→casual, capped. */
export function selectExamples(source: GrammarExample[], ko: string): GrammarExample[] {
  return source
    .filter((e) => e.ko === ko)
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .slice(0, MAX_EXAMPLES)
}

/**
 * Per-level dynamic import — same shape as `stores/grammar.ts:53`. Keeps the
 * grammar-example seed (~480 KB) out of the static /library route chunk; only
 * the opened grammar's TOPIK level is fetched, on demand, then cached.
 */
const loaders: Record<TopikLevel, () => Promise<GrammarExample[]>> = {
  1: () => import('~/seed/grammar-examples/n1').then((m) => m.TOPIK_1_EXAMPLES),
  2: () => import('~/seed/grammar-examples/n2').then((m) => m.TOPIK_2_EXAMPLES),
  3: () => import('~/seed/grammar-examples/n3').then((m) => m.TOPIK_3_EXAMPLES),
  4: () => import('~/seed/grammar-examples/n4').then((m) => m.TOPIK_4_EXAMPLES),
  5: () => import('~/seed/grammar-examples/n5').then((m) => m.TOPIK_5_EXAMPLES),
  6: () => import('~/seed/grammar-examples/n6').then((m) => m.TOPIK_6_EXAMPLES),
}
const cache = new Map<TopikLevel, GrammarExample[]>()

async function examplesForLevel(level: TopikLevel): Promise<GrammarExample[]> {
  let examples = cache.get(level)
  if (!examples) {
    examples = await loaders[level]()
    cache.set(level, examples)
  }
  return examples
}

/**
 * Examples for a grammar point, by ko. `deckId` selects the TOPIK-level chunk;
 * custom/unknown decks have none. Async because the per-level seed loads on
 * demand.
 */
export async function examplesFor(ko: string, deckId: string): Promise<GrammarExample[]> {
  const level = levelOfDeck(deckId)
  if (!level) return []
  return selectExamples(await examplesForLevel(level), ko)
}
