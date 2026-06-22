import type { ClozeItem } from '~/lib/domain'
import { N1_CLOZE } from './n1'
import { N2_CLOZE } from './n2'

export const CLOZE_ITEMS: ClozeItem[] = [...N1_CLOZE, ...N2_CLOZE]
