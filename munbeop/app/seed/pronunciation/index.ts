import type { PronunciationGuide } from '~/lib/domain'
import { TOPIK_1_PRONUNCIATION } from './topik-1'

/** Every authored pronunciation guide. Extends batch-by-batch (TOPIK 1 first). */
export const PRONUNCIATION_GUIDES: PronunciationGuide[] = [...TOPIK_1_PRONUNCIATION]
