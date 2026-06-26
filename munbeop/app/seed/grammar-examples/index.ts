import type { GrammarExample } from '~/lib/domain'
import { TOPIK_1_EXAMPLES } from './n1'
import { TOPIK_2_EXAMPLES } from './n2'
import { TOPIK_3_EXAMPLES } from './n3'
import { TOPIK_4_EXAMPLES } from './n4'

/** Aggregated grammar-example catalog. Per-level arrays are spread in here. */
export const GRAMMAR_EXAMPLES: GrammarExample[] = [
  ...TOPIK_1_EXAMPLES,
  ...TOPIK_2_EXAMPLES,
  ...TOPIK_3_EXAMPLES,
  ...TOPIK_4_EXAMPLES,
]
