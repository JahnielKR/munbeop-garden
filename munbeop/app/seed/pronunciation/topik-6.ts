import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 6 pronunciation guides — same "sound it out by syllables" model and
 * authoring convention as {@link TOPIK_1_PRONUNCIATION} (see topik-1.ts header).
 * These are mostly advanced/literary/archaic forms.
 *
 * Covers every TOPIK-6 catalog grammar point that IS a single pronounceable
 * form. Deliberately skipped (comparison drills): 원인 표현 비교, 양보 표현 비교,
 * 질문 종결 비교.
 *
 * Convention recap (full policy in topik-1.ts): true allomorphs sound BOTH forms
 * — 아/어 (아요|어요) and (으)/(이) before a full syllable (으로|로, 이야말로|야말로,
 * 으련마는|련마는, 으리라|리라); jamo-fusing stays single: (으)+ㄹ→을, and a bare ㄴ
 * beginning the morpheme rides the 이 carrier (-ㄴ들 → 인·들), bare ㄴ/는 ending → 는
 * (-ㄴ/는다 → 는·다); a synonym listing sounds the single representative (생각건대/
 * 바라건대 → 건대; -로다/-(이)로다 → 로다; 련만 variant dropped); optional parens dropped
 * (-(으)리라(고) drops 고; -아/어 주십사 (하고) → 어 주십사). PENDING wife native-review.
 * PENDING wife native-review — the content gate.
 */
export const TOPIK_6_PRONUNCIATION: PronunciationGuide[] = [
  // ── Concessive ────────────────────────────────────────────────────────────
  { ko: '-ㄴ들', forms: [{ parts: ['인', '들'] }] },
  { ko: '-(으)ㄹ망정', forms: [{ parts: ['을', '망', '정'] }] },
  { ko: '-기로서니', forms: [{ parts: ['기', '로', '서', '니'] }] },

  // ── Cause / sequence / addition ───────────────────────────────────────────
  { ko: '-(으)로 말미암아', forms: [{ parts: ['으', '로', '말', '미', '암', '아'] }, { parts: ['로', '말', '미', '암', '아'] }] },
  { ko: '-(으)ㄴ/는 즉', forms: [{ parts: ['는', '즉'] }] },
  { ko: '-거니와', forms: [{ parts: ['거', '니', '와'] }] },
  { ko: '-는 마당에', forms: [{ parts: ['는', '마', '당', '에'] }] },
  { ko: '-는 즉시', forms: [{ parts: ['는', '즉', '시'] }] },

  // ── Emphasis / formal frames ──────────────────────────────────────────────
  { ko: '-(이)야말로', forms: [{ parts: ['이', '야', '말', '로'] }, { parts: ['야', '말', '로'] }] },
  { ko: '-건대 / 생각건대 / 바라건대', forms: [{ parts: ['건', '대'] }] },
  { ko: '에 있어서', forms: [{ parts: ['에', '있', '어', '서'] }] },
  { ko: '-는 법이다', forms: [{ parts: ['는', '법', '이', '다'] }] },
  { ko: '-(으)ㄴ/는 이상', forms: [{ parts: ['는', '이', '상'] }] },

  // ── Plain / archaic enders ────────────────────────────────────────────────
  { ko: '-다시피', forms: [{ parts: ['다', '시', '피'] }] },
  { ko: '-ㄴ/는다', forms: [{ parts: ['는', '다'] }] },
  { ko: '-노라', forms: [{ parts: ['노', '라'] }] },
  { ko: '-로다 / -(이)로다', forms: [{ parts: ['로', '다'] }] },
  { ko: '-(으)ㄹ진대', forms: [{ parts: ['을', '진', '대'] }] },
  { ko: '-(으)련마는 / -(으)련만', forms: [{ parts: ['으', '련', '마', '는'] }, { parts: ['련', '마', '는'] }] },
  { ko: '-(으)ㄹ쏘냐', forms: [{ parts: ['을', '쏘', '냐'] }] },

  // ── Auxiliary / literary expressions ──────────────────────────────────────
  { ko: '-아/어 마지않다', forms: [{ parts: ['아', '마', '지', '않', '다'] }, { parts: ['어', '마', '지', '않', '다'] }] },
  { ko: '-아/어 마땅하다', forms: [{ parts: ['아', '마', '땅', '하', '다'] }, { parts: ['어', '마', '땅', '하', '다'] }] },
  { ko: '-(으)리라(고)', forms: [{ parts: ['으', '리', '라'] }, { parts: ['리', '라'] }] },
  { ko: '-(으)ㄹ세라', forms: [{ parts: ['을', '세', '라'] }] },
  { ko: '-건만', forms: [{ parts: ['건', '만'] }] },
  { ko: '-아/어 주십사 (하고)', forms: [{ parts: ['아', '주', '십', '사'] }, { parts: ['어', '주', '십', '사'] }] },
  { ko: '-아/어 마다하지 않다', forms: [{ parts: ['아', '마', '다', '하', '지', '않', '다'] }, { parts: ['어', '마', '다', '하', '지', '않', '다'] }] },
  { ko: '-노라면', forms: [{ parts: ['노', '라', '면'] }] },
]
