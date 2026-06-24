import type { PronunciationGuide } from '~/lib/domain'
import { PRONUNCIATION_GUIDES } from '~/seed/pronunciation'

const byKo = new Map(PRONUNCIATION_GUIDES.map((g) => [g.ko, g]))

/** The pronunciation guide for a grammar point, or undefined if none authored. */
export function guideFor(ko: string): PronunciationGuide | undefined {
  return byKo.get(ko)
}

/**
 * Every unique syllable across all guides, sorted. Drives audio generation
 * (one clip per syllable, deduped) and the manifest↔seed contract test.
 */
export function allSyllables(): string[] {
  return [...new Set(PRONUNCIATION_GUIDES.flatMap((g) => g.parts))].sort()
}
