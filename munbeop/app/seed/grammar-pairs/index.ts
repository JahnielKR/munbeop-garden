import type { ConfusablePair } from '~/lib/domain'
import { N1_PAIRS } from './n1'
import { N2_PAIRS } from './n2'
import { N3_PAIRS } from './n3'

/** Aggregated confusable-pair catalog. Per-batch arrays are spread in here. */
export const GRAMMAR_PAIRS: ConfusablePair[] = [...N1_PAIRS, ...N2_PAIRS, ...N3_PAIRS]
