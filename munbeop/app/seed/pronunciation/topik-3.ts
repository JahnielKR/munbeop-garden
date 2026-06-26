import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 3 pronunciation guides — same "sound it out by syllables" model and
 * authoring convention as {@link TOPIK_1_PRONUNCIATION} (see topik-1.ts header).
 *
 * Covers every TOPIK-3 catalog grammar point that IS a single pronounceable
 * form. Deliberately skipped (morphology/paradigm labels, not sound-it-out
 * forms): 피동 (이/히/리/기) and 사동 (이/히/리/기/우/추).
 *
 * Convention recap (full policy in topik-1.ts): true allomorphs sound BOTH forms
 * — 아/어 (아요|어요) and (으)/(이) before a full syllable (으면서|면서); jamo-fusing
 * (으)+ㄹ→을, (으)+ㄴ→은 and bare ㄴ/는→는 stay single; a synonym listing sounds only
 * the single most common SPOKEN representative (알다/몰랐다·알다/모르다 → 알다;
 * -는다면/-(이)라면 → 는다면; -기 위해(서)/-을/를 위해(서) → 기 위해); optional
 * parenthesized morphemes dropped (에 따라(서) → 에 따라; -거든(요) → 거든); a
 * placeholder N/V is not sounded (N + 답다 → 답다; 밖에 + neg → 밖에); -아/어 보이다
 * keeps 이 so it stays distinct from -아/어 보다. PENDING wife native-review.
 */
export const TOPIK_3_PRONUNCIATION: PronunciationGuide[] = [
  // ── Change-of-state / resultative / appearance ────────────────────────────
  { ko: '-게 되다', forms: [{ parts: ['게', '되', '다'] }] },
  { ko: '-아/어지다', forms: [{ parts: ['아', '지', '다'] }, { parts: ['어', '지', '다'] }] },
  { ko: '-아/어 있다', forms: [{ parts: ['아', '있', '다'] }, { parts: ['어', '있', '다'] }] },
  { ko: '-아/어 보이다', forms: [{ parts: ['아', '보', '이', '다'] }, { parts: ['어', '보', '이', '다'] }] },

  // ── Cause / simultaneity / sole-option ────────────────────────────────────
  { ko: '-기 때문에', forms: [{ parts: ['기', '때', '문', '에'] }] },
  { ko: '-(으)면서', forms: [{ parts: ['으', '면', '서'] }, { parts: ['면', '서'] }] },
  { ko: '-(으)ㄹ 수밖에 없다', forms: [{ parts: ['을', '수', '밖', '에', '없', '다'] }] },
  { ko: '-기 위해(서) / -을/를 위해(서)', forms: [{ parts: ['기', '위', '해'] }] },
  { ko: '에 따라(서)', forms: [{ parts: ['에', '따', '라'] }] },
  { ko: '에 비해(서)', forms: [{ parts: ['에', '비', '해'] }] },

  // ── Conjecture / comparison / wish / knowledge ────────────────────────────
  { ko: '-(으)ㄹ 것 같다', forms: [{ parts: ['을', '것', '같', '다'] }] },
  { ko: '-(으)ㄴ/는 것처럼', forms: [{ parts: ['는', '것', '처', '럼'] }] },
  { ko: '-(으)면 좋겠다', forms: [{ parts: ['으', '면', '좋', '겠', '다'] }, { parts: ['면', '좋', '겠', '다'] }] },
  { ko: '-(으)ㄴ/는 줄 알다/몰랐다', forms: [{ parts: ['는', '줄', '알', '다'] }] },
  { ko: '-기 마련이다', forms: [{ parts: ['기', '마', '련', '이', '다'] }] },
  { ko: '-기로 하다', forms: [{ parts: ['기', '로', '하', '다'] }] },
  { ko: '-(으)ㄴ/는 편이다', forms: [{ parts: ['는', '편', '이', '다'] }] },
  { ko: '-(으)ㄹ 줄 알다/모르다', forms: [{ parts: ['을', '줄', '알', '다'] }] },

  // ── Purpose / sequence / concession ───────────────────────────────────────
  { ko: '-도록', forms: [{ parts: ['도', '록'] }] },
  { ko: '-자마자', forms: [{ parts: ['자', '마', '자'] }] },
  { ko: '-(으)ㄴ 지', forms: [{ parts: ['은', '지'] }] },
  { ko: '-아/어도', forms: [{ parts: ['아', '도'] }, { parts: ['어', '도'] }] },
  { ko: '-(으)ㄴ/는데도', forms: [{ parts: ['는', '데', '도'] }] },
  { ko: '밖에 + neg', forms: [{ parts: ['밖', '에'] }] },

  // ── Discontinued intent / discovery / aspect ──────────────────────────────
  { ko: '-(으)려다가', forms: [{ parts: ['으', '려', '다', '가'] }, { parts: ['려', '다', '가'] }] },
  { ko: '-다 보면', forms: [{ parts: ['다', '보', '면'] }] },
  { ko: '-다 보니', forms: [{ parts: ['다', '보', '니'] }] },
  { ko: '-아/어 대다', forms: [{ parts: ['아', '대', '다'] }, { parts: ['어', '대', '다'] }] },
  { ko: '-고 말다', forms: [{ parts: ['고', '말', '다'] }] },
  { ko: '-는다면 / -(이)라면', forms: [{ parts: ['는', '다', '면'] }] },
  { ko: '-아/어 가다', forms: [{ parts: ['아', '가', '다'] }, { parts: ['어', '가', '다'] }] },
  { ko: '-아/어 오다', forms: [{ parts: ['아', '오', '다'] }, { parts: ['어', '오', '다'] }] },
  { ko: '-아/어 내다', forms: [{ parts: ['아', '내', '다'] }, { parts: ['어', '내', '다'] }] },

  // ── Suggestion / sentence-final nuance / N-suffixes ───────────────────────
  { ko: '-지 그래(요)?', forms: [{ parts: ['지', '그', '래'] }] },
  { ko: '-아/어야지(요)', forms: [{ parts: ['아', '야', '지'] }, { parts: ['어', '야', '지'] }] },
  { ko: '-거든(요)', forms: [{ parts: ['거', '든'] }] },
  { ko: 'N + 답다', forms: [{ parts: ['답', '다'] }] },
  { ko: 'N + 스럽다', forms: [{ parts: ['스', '럽', '다'] }] },
]
