import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 2 pronunciation guides — same "sound it out by syllables" model and
 * authoring convention as {@link TOPIK_1_PRONUNCIATION} (see topik-1.ts header).
 *
 * Covers every TOPIK-2 catalog grammar point that IS a single pronounceable
 * form. Deliberately skipped (a morphology/paradigm label, not a sound-it-out
 * form, like the TOPIK-1 category labels): 피동사 (이/히/리/기).
 *
 * Convention recap (full policy in topik-1.ts): true allomorphs sound BOTH forms
 * — 아/어·았/었 (아요|어요) and (으)/(이) before a full syllable (으면|면, 이라도|라도);
 * jamo-fusing (으)+ㄹ→을, (으)+ㄴ→은 and bare ㄴ/는→는 stay single; a synonym listing
 * sounds only the single most common SPOKEN representative (-처럼/-같이 → 처럼;
 * -군요/-구나 → 군요; 하다/되다 → 하다); optional parenthesized morphemes are
 * dropped (에 대해(서) → 에 대해; -다(가) 말다 → 다 말다); a placeholder N/V is not
 * sounded, but an embedded particle pair still sounds both (이/가 되다 → 이 되다 |
 * 가 되다); written/dictionary syllables (no liaison respell).
 * PENDING wife native-review — the content gate.
 */
export const TOPIK_2_PRONUNCIATION: PronunciationGuide[] = [
  // ── Ability / time connectives ────────────────────────────────────────────
  { ko: '-(으)ㄹ 수 있다/없다', forms: [{ parts: ['을', '수', '있', '다'] }] },
  { ko: '-(으)ㄹ 때', forms: [{ parts: ['을', '때'] }] },
  { ko: '-기 전에', forms: [{ parts: ['기', '전', '에'] }] },
  { ko: '-(으)ㄴ 후에 / 다음에', forms: [{ parts: ['은', '후', '에'] }] },
  { ko: '-는 동안', forms: [{ parts: ['는', '동', '안'] }] },
  { ko: '-고 나서 / -고 나면', forms: [{ parts: ['고', '나', '서'] }] },

  // ── Nominalizer / evidential ──────────────────────────────────────────────
  { ko: '-는 것', forms: [{ parts: ['는', '것'] }] },
  { ko: '-(으)ㄴ/는 것 같다', forms: [{ parts: ['는', '것', '같', '다'] }] },
  { ko: '-(으)ㄴ/는 모양이다', forms: [{ parts: ['는', '모', '양', '이', '다'] }] },

  // ── Obligation / permission / necessity ───────────────────────────────────
  { ko: '-아/어야 하다 / 되다', forms: [{ parts: ['아', '야', '하', '다'] }, { parts: ['어', '야', '하', '다'] }] },
  { ko: '-(으)면 되다', forms: [{ parts: ['으', '면', '되', '다'] }, { parts: ['면', '되', '다'] }] },
  { ko: '-(으)면 안 되다', forms: [{ parts: ['으', '면', '안', '되', '다'] }, { parts: ['면', '안', '되', '다'] }] },
  { ko: '-(으)ㄹ 필요가 있다/없다', forms: [{ parts: ['을', '필', '요', '가', '있', '다'] }] },

  // ── Modal / intention endings ─────────────────────────────────────────────
  { ko: '-(으)ㄹ게요', forms: [{ parts: ['을', '게', '요'] }] },
  { ko: '-(으)ㄹ까요?', forms: [{ parts: ['을', '까', '요'] }] },
  { ko: '-(으)려고', forms: [{ parts: ['으', '려', '고'] }, { parts: ['려', '고'] }] },

  // ── Auxiliary verbs ───────────────────────────────────────────────────────
  { ko: '-아/어 보다', forms: [{ parts: ['아', '보', '다'] }, { parts: ['어', '보', '다'] }] },
  { ko: '-아/어 주다', forms: [{ parts: ['아', '주', '다'] }, { parts: ['어', '주', '다'] }] },
  { ko: '-아/어 버리다', forms: [{ parts: ['아', '버', '리', '다'] }, { parts: ['어', '버', '리', '다'] }] },
  { ko: '-아/어 놓다 / -아/어 두다', forms: [{ parts: ['아', '놓', '다'] }, { parts: ['어', '놓', '다'] }] },

  // ── Cause / connectives / comparison ──────────────────────────────────────
  { ko: '-(으)니까', forms: [{ parts: ['으', '니', '까'] }, { parts: ['니', '까'] }] },
  { ko: '때문에 / 기 때문에', forms: [{ parts: ['때', '문', '에'] }] },
  { ko: '-거나', forms: [{ parts: ['거', '나'] }] },
  { ko: '-처럼 / -같이', forms: [{ parts: ['처', '럼'] }] },
  { ko: '-보다', forms: [{ parts: ['보', '다'] }] },

  // ── Embedded question / softener / degree ─────────────────────────────────
  { ko: '-(으)ㄴ/는지', forms: [{ parts: ['는', '지'] }] },
  { ko: '-(으)ㄴ/는데요', forms: [{ parts: ['는', '데', '요'] }] },
  { ko: '얼마나', forms: [{ parts: ['얼', '마', '나'] }] },
  { ko: '에 대해(서)', forms: [{ parts: ['에', '대', '해'] }] },
  { ko: '-(으)ㄹ까 봐', forms: [{ parts: ['을', '까', '봐'] }] },

  // ── Concession / probability / sentence-final nuance ──────────────────────
  { ko: '-더라도', forms: [{ parts: ['더', '라', '도'] }] },
  { ko: '-(으)ㄹ지도 모르다', forms: [{ parts: ['을', '지', '도', '모', '르', '다'] }] },
  { ko: '-잖아요', forms: [{ parts: ['잖', '아', '요'] }] },
  { ko: '-군요 / -구나', forms: [{ parts: ['군', '요'] }] },
  { ko: '-더라고요', forms: [{ parts: ['더', '라', '고', '요'] }] },
  { ko: '-(으)ㄹ 만큼', forms: [{ parts: ['을', '만', '큼'] }] },
  { ko: '-기 쉽다/어렵다', forms: [{ parts: ['기', '쉽', '다'] }] },

  // ── Quantifier / reported speech / aspect ─────────────────────────────────
  { ko: '아무 N(이)나 / 아무 N도', forms: [{ parts: ['아', '무', '이', '나'] }] },
  { ko: '(이)라도', forms: [{ parts: ['이', '라', '도'] }, { parts: ['라', '도'] }] },
  { ko: '-다고요? / -(이)라고요?', forms: [{ parts: ['다', '고', '요'] }] },
  { ko: '이/가 되다', forms: [{ parts: ['이', '되', '다'] }, { parts: ['가', '되', '다'] }] },
  { ko: '아직 / 벌써 / 이미', forms: [{ parts: ['아', '직', '벌', '써', '이', '미'] }] },
  { ko: '-아/어 죽겠다', forms: [{ parts: ['아', '죽', '겠', '다'] }, { parts: ['어', '죽', '겠', '다'] }] },
  { ko: '-아/어 가지고', forms: [{ parts: ['아', '가', '지', '고'] }, { parts: ['어', '가', '지', '고'] }] },
  { ko: '-다(가) 말다', forms: [{ parts: ['다', '말', '다'] }] },
]
