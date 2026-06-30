import type { ClozeItem } from '~/lib/domain'
import { N1_CLOZE } from './n1'
import { N2_CLOZE } from './n2'
import { N3_CLOZE } from './n3'
import { N4_CLOZE } from './n4'
import { N5_CLOZE } from './n5'
import { N6_CLOZE } from './n6'

export const CLOZE_ITEMS: ClozeItem[] = [
  ...N1_CLOZE,
  ...N2_CLOZE,
  ...N3_CLOZE,
  ...N4_CLOZE,
  ...N5_CLOZE,
  ...N6_CLOZE,
]
