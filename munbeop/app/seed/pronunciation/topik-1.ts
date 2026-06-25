import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 1 pronunciation guides — the "sound it out by syllables" breakdown for
 * the study-sheet pronunciation section. One ordered list of single Hangul
 * syllables per grammar point; the learner taps each chip (or "play all") to
 * hear the grammar sounded out piece by piece.
 *
 * Covers every TOPIK-1 catalog grammar point that IS a single pronounceable
 * form. Deliberately skipped (not a sound-it-out form): the category labels
 * 의문사 / 숫자 / 시간 표현 / 위치어 / 수 분류사 / 인사 표현, the phrase 얼마나 걸려요?,
 * the lexical verb group 가져가다/가져오다/데려가다/데려오다, and the comparison drills
 * (안 vs 못 (비교)). Those render no pronunciation section, as before.
 *
 * Drafting convention (PENDING wife native-review — the content gate). Each
 * `parts` entry is exactly one Hangul syllable; a suffix can't be sounded
 * verbatim, so we pick the chosen didactic spoken realization:
 *  - -아/어 alternation → the 어/었 realization (어요, 었어요, 어서, 어도 되다).
 *  - epenthetic (으)/(이)/(스) → the consonant-stem syllabic form so the inserted
 *    vowel is voiced and a dangling ㄹ/ㄴ rides on it (으세요, 을 거예요, 을래요,
 *    은 적이, 으러, 으로, 이나).
 *  - -ㄴ/는데 → the 는데 (vowel-stem) form.
 *  - a synonym listing (와/과·하고·(이)랑, 에게/한테/께) → only the single most common
 *    SPOKEN representative (하고, 한테). A from→to pair (부터/까지) → sound both.
 *  - short alternant particles (은/는, 이/가, 을/를) → the after-vowel citation form.
 *  - the comitative "together" → 함께 (clean per-syllable), not 같이 ([가치] liaison).
 *  - negation 안 + V / 못 + V → the standalone adverb headword (안, 못).
 *  - written/dictionary syllables (the TTS reads each block); no liaison respell.
 */
export const TOPIK_1_PRONUNCIATION: PronunciationGuide[] = [
  // ── Particles ─────────────────────────────────────────────────────────────
  { ko: '은/는', parts: ['는'] },
  { ko: '이/가', parts: ['가'] },
  { ko: '을/를', parts: ['를'] },
  { ko: '에', parts: ['에'] },
  { ko: '에서', parts: ['에', '서'] },
  { ko: '와/과 · 하고 · (이)랑', parts: ['하', '고'] },
  { ko: '도', parts: ['도'] },
  { ko: '만', parts: ['만'] },
  { ko: '의', parts: ['의'] },
  { ko: '에게 / 한테 / 께', parts: ['한', '테'] },
  { ko: '(으)로', parts: ['으', '로'] },
  { ko: '부터 / 까지', parts: ['부', '터', '까', '지'] },
  { ko: '마다', parts: ['마', '다'] },
  { ko: '(이)나', parts: ['이', '나'] },

  // ── Copula / existence ────────────────────────────────────────────────────
  { ko: '이다 / 아니다', parts: ['이', '다', '아', '니', '다'] },
  { ko: '있다 / 없다', parts: ['있', '다', '없', '다'] },
  { ko: '좋아하다 / 싫어하다', parts: ['좋', '아', '하', '다', '싫', '어', '하', '다'] },

  // ── Verb endings (polite present/past, future, honorific, formal) ─────────
  { ko: '-아/어요', parts: ['어', '요'] },
  { ko: '-았/었어요', parts: ['었', '어', '요'] },
  { ko: '-(으)ㄹ 거예요', parts: ['을', '거', '예', '요'] },
  { ko: '-(으)세요', parts: ['으', '세', '요'] },
  { ko: '-ㅂ/습니다', parts: ['습', '니', '다'] },

  // ── Negation ──────────────────────────────────────────────────────────────
  { ko: '안 + V / -지 않다', parts: ['안'] },
  { ko: '못 + V / -지 못하다', parts: ['못'] },

  // ── Connective endings ────────────────────────────────────────────────────
  { ko: '-고', parts: ['고'] },
  { ko: '-아/어서', parts: ['어', '서'] },
  { ko: '-지만', parts: ['지', '만'] },
  { ko: '-(으)면', parts: ['으', '면'] },
  { ko: '-ㄴ/는데', parts: ['는', '데'] },

  // ── Auxiliary / expression endings ────────────────────────────────────────
  { ko: '-고 싶다', parts: ['고', '싶', '다'] },
  { ko: '-고 있다', parts: ['고', '있', '다'] },
  { ko: '-(으)러 가다/오다', parts: ['으', '러', '가', '다'] },
  { ko: '-(으)ㄴ 적이 있다/없다', parts: ['은', '적', '이', '있', '다'] },
  { ko: '-겠어요', parts: ['겠', '어', '요'] },
  { ko: '-(으)ㄹ래요?', parts: ['을', '래', '요'] },
  { ko: '-네요', parts: ['네', '요'] },
  { ko: '-지요? / -죠?', parts: ['지', '요'] },
  { ko: '-아/어도 되다', parts: ['어', '도', '되', '다'] },
  { ko: '-지 않아도 되다', parts: ['지', '않', '아', '도', '되', '다'] },
  { ko: '-아/어 드리다', parts: ['어', '드', '리', '다'] },

  // ── Demonstratives / comitative ───────────────────────────────────────────
  { ko: '이 / 그 / 저', parts: ['이', '그', '저'] },
  { ko: 'N(이)랑 / 하고 + 같이 / 함께', parts: ['하', '고', '함', '께'] },

  // ── Negative imperative / exception ───────────────────────────────────────
  { ko: '-지 말다', parts: ['지', '말', '다'] },
  { ko: 'N 말고', parts: ['말', '고'] },
]
