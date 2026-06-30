import type { ConfusablePair } from '~/lib/domain'
import { N1_PAIRS } from './n1'
import { N2_PAIRS } from './n2'
import { N3_PAIRS } from './n3'
import { N4_PAIRS } from './n4'
import { N5_PAIRS } from './n5'
import { N6_PAIRS } from './n6'
import { N1_PAIRS_EXTRA } from './n1-extra'
import { N2_PAIRS_EXTRA } from './n2-extra'
import { N3_PAIRS_EXTRA } from './n3-extra'
import { N4_PAIRS_EXTRA } from './n4-extra'
import { N5_PAIRS_EXTRA } from './n5-extra'
import { N6_PAIRS_EXTRA } from './n6-extra'

/** Aggregated confusable-pair catalog. Per-batch arrays are spread in here. */
export const GRAMMAR_PAIRS: ConfusablePair[] = [
  ...N1_PAIRS,
  ...N2_PAIRS,
  ...N3_PAIRS,
  ...N4_PAIRS,
  ...N5_PAIRS,
  ...N6_PAIRS,
  ...N1_PAIRS_EXTRA,
  ...N2_PAIRS_EXTRA,
  ...N3_PAIRS_EXTRA,
  ...N4_PAIRS_EXTRA,
  ...N5_PAIRS_EXTRA,
  ...N6_PAIRS_EXTRA,
]
