/**
 * One cleanly-soundable spoken realization of a grammar point — an ordered list
 * of single Hangul syllables the learner taps to hear it sounded out.
 *
 * A grammar point is a suffix, so alternation/jamo notation can't be sounded
 * verbatim. `parts` are the chosen didactic spoken syllables — native-reviewed.
 */
export interface PronunciationForm {
  /** This realization's spoken syllables, in order — each one Hangul syllable. */
  parts: string[]
}

/**
 * Authored "sound it out" guide for a grammar point's pronunciation.
 *
 * The study sheet's pronunciation section sounds the grammar out ALONE, syllable
 * by syllable. Most points have a single {@link PronunciationForm}; a point whose
 * citation shows true allomorphs of the same morpheme (은/는, (으)로, -아/어요) carries
 * one form per cleanly-soundable realization so the learner can hear each. Example
 * sentences (and their audio) live in the separate Examples section, so nothing
 * sentence-level is stored here.
 */
export interface PronunciationGuide {
  /** Grammar.ko this guide is for (must match a catalog entry). */
  ko: string
  /**
   * One entry per cleanly-soundable allomorph form. Length 1 for most points;
   * 2+ for true alternants (은/는 → 은 | 는). Jamo-fusing alternations and synonym
   * listings stay a single representative form.
   */
  forms: PronunciationForm[]
}
