import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 1 pronunciation guides (first batch — the same 12 verb-ending points
 * that have a grammar_examples bank, so row 2 always has a sentence to reuse).
 *
 * Drafting convention (PENDING wife native-review — the content gate):
 *  - -아/어 alternation → the 어/었 (elsewhere) realization (어요, 었어요, 어서).
 *  - -(으)/-(스)ㅂ → the syllabic consonant-stem citation (으세요, 습니다, 을 거예요).
 *  - -ㄴ/는데 → the 는데 (vowel-stem) form, since ㄴ alone is a jamo, not a syllable.
 * Each `parts` entry is exactly one Hangul syllable — what you'd say to sound the
 * grammar out piece by piece.
 */
export const TOPIK_1_PRONUNCIATION: PronunciationGuide[] = [
  { ko: '-아/어요', parts: ['어', '요'] },
  { ko: '-았/었어요', parts: ['었', '어', '요'] },
  { ko: '-(으)ㄹ 거예요', parts: ['을', '거', '예', '요'] },
  { ko: '-(으)세요', parts: ['으', '세', '요'] },
  { ko: '-ㅂ/습니다', parts: ['습', '니', '다'] },
  { ko: '-고', parts: ['고'] },
  { ko: '-아/어서', parts: ['어', '서'] },
  { ko: '-지만', parts: ['지', '만'] },
  { ko: '-(으)면', parts: ['으', '면'] },
  { ko: '-ㄴ/는데', parts: ['는', '데'] },
  { ko: '-고 싶다', parts: ['고', '싶', '다'] },
  { ko: '-고 있다', parts: ['고', '있', '다'] },
]
