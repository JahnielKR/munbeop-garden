/**
 * Authored "sound it out" guide for a grammar point's pronunciation.
 *
 * The study sheet's pronunciation section sounds the grammar out ALONE, syllable
 * by syllable — this type carries exactly what that needs, `parts`. Example
 * sentences (and their audio) live in the separate Examples section, so nothing
 * sentence-level is stored here.
 *
 * A grammar point is a suffix, so alternation/jamo notation (-아/어요, -(으)면,
 * -ㄴ/는데) can't be sounded verbatim. `parts` are the chosen didactic spoken
 * syllables — native-reviewed.
 */
export interface PronunciationGuide {
  /** Grammar.ko this guide is for (must match a catalog entry). */
  ko: string
  /** The grammar's spoken syllables, in order — each one Hangul syllable. */
  parts: string[]
}
