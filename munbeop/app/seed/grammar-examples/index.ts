import type { GrammarExample } from '~/lib/domain'
import { TOPIK_1_EXAMPLES } from './n1'
import { TOPIK_2_EXAMPLES } from './n2'

/** Aggregated grammar-example catalog. Per-level arrays are spread in here. */
export const GRAMMAR_EXAMPLES: GrammarExample[] = [...TOPIK_1_EXAMPLES, ...TOPIK_2_EXAMPLES]
