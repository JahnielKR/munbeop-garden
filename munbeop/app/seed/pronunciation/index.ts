import type { PronunciationGuide } from '~/lib/domain'
import { TOPIK_1_PRONUNCIATION } from './topik-1'
import { TOPIK_2_PRONUNCIATION } from './topik-2'
import { TOPIK_3_PRONUNCIATION } from './topik-3'

/** Every authored pronunciation guide. Extends batch-by-batch, level by level. */
export const PRONUNCIATION_GUIDES: PronunciationGuide[] = [
  ...TOPIK_1_PRONUNCIATION,
  ...TOPIK_2_PRONUNCIATION,
  ...TOPIK_3_PRONUNCIATION,
]
