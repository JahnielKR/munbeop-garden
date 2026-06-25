import type { PronunciationGuide } from '~/lib/domain'
import { TOPIK_1_PRONUNCIATION } from './topik-1'
import { TOPIK_2_PRONUNCIATION } from './topik-2'
import { TOPIK_3_PRONUNCIATION } from './topik-3'
import { TOPIK_4_PRONUNCIATION } from './topik-4'
import { TOPIK_5_PRONUNCIATION } from './topik-5'
import { TOPIK_6_PRONUNCIATION } from './topik-6'

/** Every authored pronunciation guide. Extends batch-by-batch, level by level. */
export const PRONUNCIATION_GUIDES: PronunciationGuide[] = [
  ...TOPIK_1_PRONUNCIATION,
  ...TOPIK_2_PRONUNCIATION,
  ...TOPIK_3_PRONUNCIATION,
  ...TOPIK_4_PRONUNCIATION,
  ...TOPIK_5_PRONUNCIATION,
  ...TOPIK_6_PRONUNCIATION,
]
