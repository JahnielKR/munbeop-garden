/**
 * Authored "sound it out" guide for a grammar point's pronunciation.
 *
 * The study sheet's pronunciation section has two rows: (1) the grammar ALONE,
 * sounded out by its syllable parts, and (2) the grammar inside a short natural
 * sentence. This type carries only what row 1 needs — `parts`. Row 2 reuses the
 * existing examples bank (`examplesFor(ko)`), so no sentence is stored here.
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
