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
 * `parts` entry is exactly one Hangul syllable. A grammar whose citation shows
 * TRUE allomorphs of the SAME morpheme carries one `forms` entry per cleanly-
 * soundable realization, so the learner hears each form; everything else stays a
 * single representative form:
 *  - particle pairs → both forms: 은/는 → 은 | 는; 이/가 → 이 | 가; 을/를 → 을 | 를.
 *  - -아/어 · 았/었 vowel harmony → both forms: 아요 | 어요; 았어요 | 었어요; 아서 | 어서.
 *  - epenthetic (으)/(이) before a FULL syllable → with-vowel and bare forms:
 *    으면 | 면; 으세요 | 세요; 으로 | 로; 이나 | 나.
 *  - a from→to pair (부터/까지) → sound both, one form.
 *  STAY a single form:
 *  - jamo-fusing alternations whose other realization is a bare jamo that fuses
 *    onto the stem (can't be sounded alone) → the soundable form only: -ㄴ/는데 →
 *    는데; -ㅂ/습니다 → 습니다; (으)ㄹ → 을 (을 거예요, 을래요); (으)ㄴ → 은 (은 적이).
 *  - synonym listings (different lexemes, not allomorphs) → the single most common
 *    SPOKEN representative: 와/과·하고·(이)랑 → 하고; 에게/한테/께 → 한테.
 *  - the comitative "together" → 함께 (clean per-syllable), not 같이 ([가치] liaison).
 *  - negation 안 + V / 못 + V → the standalone adverb headword (안, 못).
 *  - written/dictionary syllables (the TTS reads each block); no liaison respell.
 */
export const TOPIK_1_PRONUNCIATION: PronunciationGuide[] = [
  // ── Particles ─────────────────────────────────────────────────────────────
  { ko: '은/는', forms: [{ parts: ['은'] }, { parts: ['는'] }] },
  { ko: '이/가', forms: [{ parts: ['이'] }, { parts: ['가'] }] },
  { ko: '을/를', forms: [{ parts: ['을'] }, { parts: ['를'] }] },
  { ko: '에', forms: [{ parts: ['에'] }] },
  { ko: '에서', forms: [{ parts: ['에', '서'] }] },
  { ko: '와/과 · 하고 · (이)랑', forms: [{ parts: ['하', '고'] }] },
  { ko: '도', forms: [{ parts: ['도'] }] },
  { ko: '만', forms: [{ parts: ['만'] }] },
  { ko: '의', forms: [{ parts: ['의'] }] },
  { ko: '에게 / 한테 / 께', forms: [{ parts: ['한', '테'] }] },
  { ko: '(으)로', forms: [{ parts: ['으', '로'] }, { parts: ['로'] }] },
  { ko: '부터 / 까지', forms: [{ parts: ['부', '터', '까', '지'] }] },
  { ko: '마다', forms: [{ parts: ['마', '다'] }] },
  { ko: '(이)나', forms: [{ parts: ['이', '나'] }, { parts: ['나'] }] },

  // ── Copula / existence ────────────────────────────────────────────────────
  { ko: '이다 / 아니다', forms: [{ parts: ['이', '다', '아', '니', '다'] }] },
  { ko: '있다 / 없다', forms: [{ parts: ['있', '다', '없', '다'] }] },
  { ko: '좋아하다 / 싫어하다', forms: [{ parts: ['좋', '아', '하', '다', '싫', '어', '하', '다'] }] },

  // ── Verb endings (polite present/past, future, honorific, formal) ─────────
  { ko: '-아/어요', forms: [{ parts: ['아', '요'] }, { parts: ['어', '요'] }] },
  { ko: '-았/었어요', forms: [{ parts: ['았', '어', '요'] }, { parts: ['었', '어', '요'] }] },
  { ko: '-(으)ㄹ 거예요', forms: [{ parts: ['을', '거', '예', '요'] }] },
  { ko: '-(으)세요', forms: [{ parts: ['으', '세', '요'] }, { parts: ['세', '요'] }] },
  { ko: '-ㅂ/습니다', forms: [{ parts: ['습', '니', '다'] }] },

  // ── Negation ──────────────────────────────────────────────────────────────
  { ko: '안 + V / -지 않다', forms: [{ parts: ['안'] }] },
  { ko: '못 + V / -지 못하다', forms: [{ parts: ['못'] }] },

  // ── Connective endings ────────────────────────────────────────────────────
  { ko: '-고', forms: [{ parts: ['고'] }] },
  { ko: '-아/어서', forms: [{ parts: ['아', '서'] }, { parts: ['어', '서'] }] },
  { ko: '-지만', forms: [{ parts: ['지', '만'] }] },
  { ko: '-(으)면', forms: [{ parts: ['으', '면'] }, { parts: ['면'] }] },
  { ko: '-ㄴ/는데', forms: [{ parts: ['는', '데'] }] },

  // ── Auxiliary / expression endings ────────────────────────────────────────
  { ko: '-고 싶다', forms: [{ parts: ['고', '싶', '다'] }] },
  { ko: '-고 있다', forms: [{ parts: ['고', '있', '다'] }] },
  { ko: '-(으)러 가다/오다', forms: [{ parts: ['으', '러', '가', '다'] }, { parts: ['러', '가', '다'] }] },
  { ko: '-(으)ㄴ 적이 있다/없다', forms: [{ parts: ['은', '적', '이', '있', '다'] }] },
  { ko: '-겠어요', forms: [{ parts: ['겠', '어', '요'] }] },
  { ko: '-(으)ㄹ래요?', forms: [{ parts: ['을', '래', '요'] }] },
  { ko: '-네요', forms: [{ parts: ['네', '요'] }] },
  { ko: '-지요? / -죠?', forms: [{ parts: ['지', '요'] }] },
  { ko: '-아/어도 되다', forms: [{ parts: ['아', '도', '되', '다'] }, { parts: ['어', '도', '되', '다'] }] },
  { ko: '-지 않아도 되다', forms: [{ parts: ['지', '않', '아', '도', '되', '다'] }] },
  { ko: '-아/어 드리다', forms: [{ parts: ['아', '드', '리', '다'] }, { parts: ['어', '드', '리', '다'] }] },

  // ── Demonstratives / comitative ───────────────────────────────────────────
  { ko: '이 / 그 / 저', forms: [{ parts: ['이', '그', '저'] }] },
  { ko: 'N(이)랑 / 하고 + 같이 / 함께', forms: [{ parts: ['하', '고', '함', '께'] }] },

  // ── Negative imperative / exception ───────────────────────────────────────
  { ko: '-지 말다', forms: [{ parts: ['지', '말', '다'] }] },
  { ko: 'N 말고', forms: [{ parts: ['말', '고'] }] },
]
